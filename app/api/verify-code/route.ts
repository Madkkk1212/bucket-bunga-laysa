import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';
import { getAdminClient } from '@/utils/supabase/admin';

const FALLBACK_MASTER_CODES = [
  'LAYSA-VIP',
  'BUKET2026',
  'PREMIUM-LOVE',
  'VIP-BOUQUET',
  'LAYSA-PREMIUM',
  'TISUWKWK',
];

// Ambil IP dari request headers (support proxy/Vercel)
function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') ||
         req.headers.get('cf-connecting-ip') ||
         'unknown';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawCode = body?.code;
    const rawName = body?.userName || body?.name;
    const checkOnly = Boolean(body?.checkOnly);
    const checkSession = Boolean(body?.checkSession);
    const deviceId = (typeof body?.deviceId === 'string' ? body.deviceId.trim() : '');

    if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
      return NextResponse.json(
        { valid: false, message: 'Silakan masukkan kode akses terlebih dahulu.' },
        { status: 400 }
      );
    }

    const cleanCode = rawCode.trim().toUpperCase();
    const cleanName = (typeof rawName === 'string' ? rawName.trim() : '');
    const clientIp = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || '';
    const supabaseClient = getAdminClient() || getSupabase();

    // ── Verifikasi dengan Supabase ──
    if (supabaseClient) {
      try {
        const { data: codeData, error } = await supabaseClient
          .from('access_codes')
          .select('id, code, is_active, max_uses, used_count, used_by_name, max_devices')
          .eq('code', cleanCode)
          .maybeSingle();

        if (error) {
          console.error('[Supabase Error Verify Code]:', error.message);
        }

        // Jika kode tidak ditemukan di DB
        if (!codeData) {
          if (checkSession) {
            return NextResponse.json({
              valid: false,
              revoked: true,
              message: 'Kode akses telah dihapus oleh admin.',
            });
          }
        } else {
          // ── KODE DITEMUKAN DI SUPABASE ──
          const maxDevices = codeData.max_devices ?? 5;

          // Cari existingDevice: Utamakan device_id unik browser
          let existingDevice: any = null;
          if (deviceId) {
            try {
              const { data } = await supabaseClient
                .from('code_devices')
                .select('id, code_id, device_id, ip_address, user_name, is_owner, user_agent, first_seen_at, last_seen_at')
                .eq('code_id', codeData.id)
                .eq('device_id', deviceId)
                .maybeSingle();
              if (data) existingDevice = data;
            } catch {
              // Abaikan jika kolom device_id belum ada
            }
          }

          // HANYA jika deviceId tidak dikirimkan, fallback ke IP
          if (!existingDevice && !deviceId && clientIp && clientIp !== 'unknown') {
            try {
              const { data } = await supabaseClient
                .from('code_devices')
                .select('id, code_id, device_id, ip_address, user_name, is_owner, user_agent, first_seen_at, last_seen_at')
                .eq('code_id', codeData.id)
                .eq('ip_address', clientIp)
                .maybeSingle();
              if (data) existingDevice = data;
            } catch {
              // Abaikan jika ada issue query
            }
          }

          const isKnownDevice = Boolean(existingDevice);

          // Hitung total device yang sudah terdaftar untuk kode ini
          let totalDevices = 0;
          try {
            const { count } = await supabaseClient
              .from('code_devices')
              .select('id', { count: 'exact', head: true })
              .eq('code_id', codeData.id);
            totalDevices = count ?? 0;
          } catch {
            totalDevices = isKnownDevice ? 1 : 0;
          }

          // Tentukan apakah pendaftaran ini adalah Pemilik Utama (Pendaftar Pertama)
          const isFirstDevice = (
            !existingDevice &&
            (totalDevices === 0 || (!codeData.used_by_name && (codeData.used_count || 0) === 0))
          );

          // ── SCENARIO A: checkSession (Validasi berkala sesi VIP aktif) ──
          if (checkSession) {
            // 1. Kode dinonaktifkan admin
            if (!codeData.is_active) {
              return NextResponse.json({
                valid: false,
                revoked: true,
                message: 'Kode akses telah dinonaktifkan oleh admin.',
              });
            }

            // 2. Kode di-reset admin (used_count 0 dan nama null)
            if (codeData.used_count === 0 && !codeData.used_by_name) {
              return NextResponse.json({
                valid: false,
                revoked: true,
                message: 'Kode akses telah di-reset oleh admin. Semua perangkat dikeluarkan.',
              });
            }

            // 3. Device tidak ada di daftar (dihapus per-device atau di-reset)
            if (!isKnownDevice && !FALLBACK_MASTER_CODES.includes(cleanCode)) {
              return NextResponse.json({
                valid: false,
                revoked: true,
                message: 'Perangkat ini telah dihapus dari daftar oleh admin.',
              });
            }

            // Sesi valid! Update last_seen_at
            if (existingDevice) {
              try {
                const updatePayload: Record<string, any> = {
                  last_seen_at: new Date().toISOString(),
                  ip_address: clientIp,
                  user_agent: userAgent,
                };
                if (deviceId) updatePayload.device_id = deviceId;
                await supabaseClient
                  .from('code_devices')
                  .update(updatePayload)
                  .eq('id', existingDevice.id);
              } catch {
                // Ignore
              }
            }

            return NextResponse.json({
              valid: true,
              revoked: false,
              code: cleanCode,
              userName: codeData.used_by_name || cleanName || existingDevice?.user_name,
              message: 'Sesi VIP aktif.',
            });
          }

          // ── SCENARIO B: checkOnly (Langkah 1 modal input kode) ──
          if (checkOnly || !cleanName) {
            if (!codeData.is_active) {
              return NextResponse.json({
                valid: false,
                message: 'Kode akses ini sedang tidak aktif. Silakan hubungi admin.',
              });
            }

            // Device baru tapi kuota perangkat sudah penuh
            if (!isKnownDevice && totalDevices >= maxDevices) {
              return NextResponse.json({
                valid: false,
                message: `Batas maksimal perangkat untuk kode ini telah tercapai (${totalDevices}/${maxDevices} perangkat). Hubungi admin untuk menambah kuota.`,
                deviceLimitReached: true,
                deviceCount: totalDevices,
                maxDevices,
              });
            }

            if (isKnownDevice) {
              return NextResponse.json({
                valid: true,
                code: cleanCode,
                needName: true,
                isKnownDevice: true,
                isOwner: Boolean(existingDevice.is_owner || existingDevice.user_name === codeData.used_by_name),
                registeredName: existingDevice.user_name || codeData.used_by_name,
                deviceCount: totalDevices,
                maxDevices,
                message: 'Perangkat ini sudah terdaftar. Masukkan nama untuk melanjutkan.',
              });
            }

            // Device baru: cek apakah ini pendaftar pertama (Pemilik) atau perangkat tambahan
            if (isFirstDevice) {
              return NextResponse.json({
                valid: true,
                code: cleanCode,
                needName: true,
                isKnownDevice: false,
                isOwner: true,
                slotNumber: 1,
                deviceCount: totalDevices,
                maxDevices,
                message: 'Kode akses valid! Anda adalah pendaftar pertama (Pemilik Utama). Silakan masukkan nama Anda.',
              });
            } else {
              return NextResponse.json({
                valid: true,
                code: cleanCode,
                needName: true,
                isKnownDevice: false,
                isOwner: false,
                ownerName: codeData.used_by_name || 'Pemilik Utama',
                slotNumber: totalDevices + 1,
                deviceCount: totalDevices,
                maxDevices,
                message: `Kode valid milik ${codeData.used_by_name || 'Pemilik'}. Masukkan nama perangkat ini untuk bergabung (Slot ${totalDevices + 1} dari ${maxDevices}).`,
              });
            }
          }

          // ── SCENARIO C: Langkah 2 Aktivasi dengan Nama ──
          if (!codeData.is_active) {
            return NextResponse.json({
              valid: false,
              message: 'Kode akses ini tidak aktif.',
            });
          }

          // Device baru tapi limit sudah penuh
          if (!isKnownDevice && totalDevices >= maxDevices) {
            return NextResponse.json({
              valid: false,
              message: `Batas perangkat penuh (${totalDevices}/${maxDevices}). Hubungi admin untuk menambah kuota.`,
              deviceLimitReached: true,
            });
          }

          // ── Catat / update device di tabel code_devices ──
          try {
            if (isKnownDevice) {
              // Update perangkat yang sudah ada
              const updateDev: Record<string, any> = {
                last_seen_at: new Date().toISOString(),
                user_name: cleanName || existingDevice?.user_name,
                user_agent: userAgent,
                ip_address: clientIp,
              };
              // Tambahkan device_id jika ada (abaikan jika kolom belum ada)
              if (deviceId) updateDev.device_id = deviceId;

              const { error: updErr } = await supabaseClient
                .from('code_devices')
                .update(updateDev)
                .eq('id', existingDevice.id);

              if (updErr && updErr.message?.includes('device_id')) {
                // Retry tanpa device_id jika kolom belum ada
                delete updateDev.device_id;
                await supabaseClient
                  .from('code_devices')
                  .update(updateDev)
                  .eq('id', existingDevice.id);
              }
            } else {
              // Insert device baru — deteksi kolom yang ada secara otomatis
              const isOwnerNow = isFirstDevice;
              const nowISO = new Date().toISOString();

              // Deteksi kapabilitas kolom (cache sederhana berdasarkan error sebelumnya)
              // Strategi: mulai dari minimum aman, tambah kolom opsional
              const baseInsert: Record<string, any> = {
                code_id: codeData.id,
                code: cleanCode,
                ip_address: clientIp,
                user_agent: userAgent,
                user_name: cleanName,
                first_seen_at: nowISO,
                last_seen_at: nowISO,
              };

              // Kolom opsional — tambahkan satu per satu
              // device_id: selalu tambahkan (kolom sudah ada sejak awal)
              if (deviceId) baseInsert.device_id = deviceId;

              // is_owner: coba tambahkan, retry tanpa jika error
              let inserted = false;
              const withOwner = { ...baseInsert, is_owner: isOwnerNow };
              const { error: errWithOwner } = await supabaseClient
                .from('code_devices')
                .insert(withOwner);

              if (!errWithOwner) {
                inserted = true;
              } else if (errWithOwner.message?.includes('is_owner')) {
                // Kolom is_owner belum ada — coba tanpa is_owner
                console.warn('[Device insert] is_owner column missing, retrying without it');
                const { error: errWithoutOwner } = await supabaseClient
                  .from('code_devices')
                  .insert(baseInsert);

                if (!errWithoutOwner) {
                  inserted = true;
                } else if (errWithoutOwner.message?.includes('device_id')) {
                  // Juga tidak ada device_id — bare minimum
                  console.warn('[Device insert] device_id column missing, retrying bare minimum');
                  const { error: errBare } = await supabaseClient
                    .from('code_devices')
                    .insert({
                      code_id: codeData.id,
                      code: cleanCode,
                      ip_address: clientIp,
                      user_name: cleanName,
                      first_seen_at: nowISO,
                      last_seen_at: nowISO,
                    });
                  if (!errBare) inserted = true;
                  else console.error('[Insert bare minimum failed]:', errBare.message);
                } else {
                  console.error('[Insert without is_owner failed]:', errWithoutOwner.message);
                }
              } else if (errWithOwner.code === '23505') {
                // Unique constraint violation — device sudah ada (race condition), anggap sukses
                console.warn('[Device insert] duplicate device, treating as success');
                inserted = true;
              } else {
                console.error('[Insert with is_owner failed]:', errWithOwner.message);
              }

              if (inserted) {
                // Update used_count dan nama pemilik di access_codes
                const updatePayload: Record<string, any> = {
                  used_count: (codeData.used_count || 0) + 1,
                };
                // HANYA pendaftar pertama yang namanya dicatat sebagai Pemilik Utama
                if (isOwnerNow) {
                  updatePayload.used_by_name = cleanName;
                  updatePayload.claimed_at = nowISO;
                }
                await supabaseClient
                  .from('access_codes')
                  .update(updatePayload)
                  .eq('id', codeData.id);
              }
            }
          } catch (dbErr) {
            console.error('[Device Track Error]:', dbErr);
          }

          return NextResponse.json({
            valid: true,
            code: cleanCode,
            userName: cleanName,
            isOwner: isKnownDevice ? Boolean(existingDevice?.is_owner) : isFirstDevice,
            deviceCount: isKnownDevice ? totalDevices : totalDevices + 1,
            maxDevices,
            message: isFirstDevice
              ? `Selamat datang, ${cleanName}! Anda resmi terdaftar sebagai Pemilik Utama VIP.`
              : `Selamat datang, ${cleanName}! Perangkat ini berhasil terhubung ke akses VIP.`,
          });
        }
      } catch (err) {
        console.error('[Verify Code Catch]:', err);
      }
    }

    // ── Fallback kode master (tanpa database) ──
    if (FALLBACK_MASTER_CODES.includes(cleanCode)) {
      if (checkSession) {
        return NextResponse.json({
          valid: true,
          revoked: false,
          code: cleanCode,
          userName: cleanName || 'VIP Member',
          message: 'Sesi master valid.',
        });
      }
      if (checkOnly || !cleanName) {
        return NextResponse.json({
          valid: true,
          code: cleanCode,
          needName: true,
          isOwner: true,
          message: 'Kode akses valid! Masukkan nama Anda pada langkah berikutnya.',
        });
      }
      return NextResponse.json({
        valid: true,
        code: cleanCode,
        userName: cleanName,
        isOwner: true,
        message: `Selamat datang, ${cleanName}! Akses VIP Studio Buket telah aktif.`,
      });
    }

    if (checkSession) {
      return NextResponse.json({
        valid: false,
        revoked: true,
        message: 'Kode akses tidak ditemukan atau telah dihapus.',
      });
    }

    return NextResponse.json({
      valid: false,
      message: 'Kode akses tidak ditemukan atau salah. Pastikan penulisan kode sudah benar.',
    });
  } catch (error) {
    console.error('Error in /api/verify-code:', error);
    return NextResponse.json(
      { valid: false, message: 'Terjadi kesalahan sistem saat memverifikasi kode.' },
      { status: 500 }
    );
  }
}
