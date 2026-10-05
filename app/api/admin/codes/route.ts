import { NextResponse } from 'next/server';
import { getAdminClient } from '@/utils/supabase/admin';

// Fallback in-memory list jika Supabase belum terhubung
let localCodes = [
  {
    id: 'local-1',
    code: 'LAYSA-VIP',
    is_active: true,
    max_uses: 999999,
    max_devices: 5,
    used_count: 0,
    used_by_name: null,
    notes: 'Kode Master VIP Resmi',
    created_at: new Date().toISOString(),
  },
  {
    id: 'local-2',
    code: 'TISUWKWK',
    is_active: true,
    max_uses: 1,
    max_devices: 5,
    used_count: 0,
    used_by_name: null,
    notes: 'Pembeli WA',
    created_at: new Date().toISOString(),
  },
];

function generateRandomCode(prefix = 'VIP'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${rand}`;
}

function enrichCodeRow(row: any) {
  let tier: 'daily' | 'weekly' | 'lifetime' = 'lifetime';
  if (row.tier === 'daily' || row.tier === 'weekly' || row.tier === 'lifetime') {
    tier = row.tier;
  } else if (row.notes?.includes('[TIER:daily]') || row.code?.startsWith('DAY-')) {
    tier = 'daily';
  } else if (row.notes?.includes('[TIER:weekly]') || row.code?.startsWith('WEEK-')) {
    tier = 'weekly';
  }

  const durationDays = row.duration_days ?? (tier === 'daily' ? 1 : tier === 'weekly' ? 7 : 0);
  const hasGardenAccess = row.has_garden_access ?? (tier === 'lifetime');

  let expiresAt = row.expires_at || null;
  if (!expiresAt && row.notes?.includes('[EXP:')) {
    const match = row.notes.match(/\[EXP:([^\]]+)\]/);
    if (match) expiresAt = match[1];
  }

  return {
    ...row,
    tier,
    duration_days: durationDays,
    has_garden_access: hasGardenAccess,
    expires_at: expiresAt,
  };
}

// 1. GET: Ambil semua kode akses (+ device count per kode jika Supabase tersedia)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const codeId = searchParams.get('devices_for'); // ?devices_for=<code_id>
    const page = Math.max(0, parseInt(searchParams.get('page') || '0', 10));
    const pageSize = 50;

    const supabase = getAdminClient();

    // Sub-endpoint: ambil daftar device untuk 1 kode
    if (codeId && supabase) {
      // Ambil data kode untuk tahu pemilik utamanya
      const { data: codeData } = await supabase
        .from('access_codes')
        .select('id, code, used_by_name, max_devices')
        .eq('id', codeId)
        .maybeSingle();

      const { data, error } = await supabase
        .from('code_devices')
        .select('id, code_id, code, ip_address, device_id, user_agent, user_name, is_owner, first_seen_at, last_seen_at')
        .eq('code_id', codeId)
        .order('first_seen_at', { ascending: true }); // Pendaftar pertama di posisi paling atas

      if (!error && data) {
        const enriched = data.map((d: any, idx: number) => {
          // Pendaftar pertama (idx 0) atau is_owner === true atau nama sama dengan used_by_name
          const isOwner = d.is_owner === true || idx === 0 || (codeData?.used_by_name && d.user_name?.toLowerCase().trim() === codeData.used_by_name.toLowerCase().trim());
          return {
            ...d,
            is_owner: isOwner,
            device_slot: idx + 1,
          };
        });
        return NextResponse.json({ success: true, devices: enriched, codeInfo: codeData });
      }
      return NextResponse.json({ success: true, devices: [] });
    }

    // Main: ambil semua kode + jumlah device (dengan pagination)
    if (supabase) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      // Coba query lengkap dengan kolom tier baru
      let data: any[] | null = null;
      let error: any = null;
      let count: number | null = null;

      const initialRes = await supabase
        .from('access_codes')
        .select('id, code, is_active, max_uses, max_devices, used_count, used_by_name, claimed_at, notes, created_at, tier, duration_days, expires_at, has_garden_access, code_devices(count)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      data = initialRes.data;
      error = initialRes.error;
      count = initialRes.count;

      // Jika kolom baru belum ada (PGRST204)
      if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
        const retry = await supabase
          .from('access_codes')
          .select('id, code, is_active, max_uses, max_devices, used_count, used_by_name, claimed_at, notes, created_at, code_devices(count)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);
        data = retry.data;
        error = retry.error;
        count = retry.count;
      }

      // Fallback query tanpa join jika relasi code_devices belum ada
      if (error) {
        const retrySimple = await supabase
          .from('access_codes')
          .select('id, code, is_active, max_uses, max_devices, used_count, used_by_name, claimed_at, notes, created_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);
        data = retrySimple.data;
        error = retrySimple.error;
        count = retrySimple.count;
      }

      if (!error && data) {
        const codes = data.map((row: any) => {
          const enriched = enrichCodeRow(row);
          return {
            ...enriched,
            device_count: row.code_devices?.[0]?.count ?? 0,
            code_devices: undefined,
          };
        });
        return NextResponse.json({ success: true, codes, total: count, page, pageSize });
      }

      console.error('[Admin GET Error]:', error?.message);
    }

    const fallbackCodes = localCodes.map(enrichCodeRow);
    return NextResponse.json({ success: true, codes: fallbackCodes, total: fallbackCodes.length, page: 0, pageSize, fallback: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 2. POST: Buat kode baru (+ support tier, duration, max_devices)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    let rawCode = body?.code;
    const maxUses = typeof body?.max_uses === 'number' ? body.max_uses : 1;
    const maxDevices = typeof body?.max_devices === 'number' ? Math.max(1, body.max_devices) : 5;
    const notes = (body?.notes || '').trim();
    const rawTier = body?.tier;
    const tier: 'daily' | 'weekly' | 'lifetime' = (rawTier === 'daily' || rawTier === 'weekly') ? rawTier : 'lifetime';
    let durationDays = tier === 'daily' ? 1 : tier === 'weekly' ? 7 : 0;
    if (typeof body?.duration_days === 'number' && body.duration_days >= 0) {
      durationDays = body.duration_days;
    } else if (typeof body?.custom_days === 'number' && body.custom_days >= 0) {
      durationDays = body.custom_days;
    }
    const hasGardenAccess = tier === 'lifetime';

    if (!rawCode || !rawCode.trim()) {
      const prefix = tier === 'daily' ? 'DAY' : tier === 'weekly' ? 'WEEK' : durationDays > 0 ? 'CUST' : 'VIP';
      rawCode = generateRandomCode(prefix);
    }

    const cleanCode = rawCode.trim().toUpperCase().replace(/\s+/g, '-');
    const supabase = getAdminClient();

    if (supabase) {
      const payload: Record<string, any> = {
        code: cleanCode,
        is_active: true,
        max_uses: maxUses,
        max_devices: maxDevices,
        used_count: 0,
        notes: notes || null,
        tier,
        duration_days: durationDays,
        link_duration_days: durationDays > 0 ? durationDays : null,
        max_photos: 6,
        can_use_youtube: true,
        allowed_templates: ['klasik', 'taman-mekar', 'kupu-kupu-harapan', 'pesta-bintang', 'pernikahan', 'cerita-kita', 'film-kenangan', 'album-surat'],
        has_garden_access: hasGardenAccess,
        expires_at: null,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('access_codes')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, code: enrichCodeRow(data) });
      }

      if (error?.code === '23505') {
        return NextResponse.json(
          { success: false, message: `Kode "${cleanCode}" sudah pernah dibuat sebelumnya.` },
          { status: 400 }
        );
      }

      // RETRY ADAPTIF jika kolom baru belum ada di Supabase
      if (error?.code === 'PGRST204' || error?.message?.includes('column')) {
        console.warn('[Admin POST]: Retrying insert with legacy schema + tagged notes');
        const taggedNotes = `[TIER:${tier}]${notes ? ` ${notes}` : ''}`;
        const legacyPayload = {
          code: cleanCode,
          is_active: true,
          max_uses: maxUses,
          max_devices: maxDevices,
          used_count: 0,
          notes: taggedNotes,
          created_at: new Date().toISOString(),
        };

        const { data: legData, error: legErr } = await supabase
          .from('access_codes')
          .insert([legacyPayload])
          .select()
          .single();

        if (!legErr && legData) {
          return NextResponse.json({
            success: true,
            code: enrichCodeRow({ ...legData, tier, duration_days: durationDays, has_garden_access: hasGardenAccess }),
          });
        }
        if (legErr?.code === '23505') {
          return NextResponse.json(
            { success: false, message: `Kode "${cleanCode}" sudah pernah dibuat sebelumnya.` },
            { status: 400 }
          );
        }
      }
      console.error('[Admin POST Supabase Error]:', error);
    }

    // Local fallback
    const newLocalItem = enrichCodeRow({
      id: `local-${Date.now()}`,
      code: cleanCode,
      is_active: true,
      max_uses: maxUses,
      max_devices: maxDevices,
      used_count: 0,
      used_by_name: null,
      notes,
      tier,
      duration_days: durationDays,
      has_garden_access: hasGardenAccess,
      expires_at: null,
      created_at: new Date().toISOString(),
    });
    localCodes.unshift(newLocalItem);
    return NextResponse.json({ success: true, code: newLocalItem, fallback: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 3. PATCH: Reset / Toggle aktif / Update max_devices / Hapus device tertentu
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action, is_active, max_devices, device_id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID kode diperlukan.' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // ── Hapus 1 device dari daftar ──
    if (action === 'remove_device' && device_id) {
      if (supabase) {
        const { error } = await supabase
          .from('code_devices')
          .delete()
          .eq('id', device_id)
          .eq('code_id', id);

        if (!error) {
          return NextResponse.json({ success: true, message: 'Perangkat berhasil dihapus dari daftar.' });
        }
        console.error('[Remove Device Error]:', error);
      }
      return NextResponse.json({ success: true, message: 'Perangkat dihapus.' });
    }

    // ── Reset kode (hapus semua device + reset used_count) ──
    if (action === 'reset') {
      if (supabase) {
        // Hapus semua device record
        await supabase.from('code_devices').delete().eq('code_id', id);

        const { error } = await supabase
          .from('access_codes')
          .update({ used_count: 0, used_by_name: null, claimed_at: null })
          .eq('id', id);

        if (!error) {
          return NextResponse.json({ success: true, message: 'Kode berhasil di-reset. Semua perangkat dihapus.' });
        }
        console.error('[Admin Reset Error]:', error);
      }
      localCodes = localCodes.map((c) =>
        c.id === id ? { ...c, used_count: 0, used_by_name: null } : c
      );
      return NextResponse.json({ success: true, message: 'Kode berhasil di-reset.' });
    }

    // ── Update max_devices ──
    if (typeof max_devices === 'number') {
      const safeMax = Math.max(1, max_devices);
      if (supabase) {
        const { error } = await supabase
          .from('access_codes')
          .update({ max_devices: safeMax })
          .eq('id', id);

        if (!error) {
          return NextResponse.json({
            success: true,
            message: `Batas perangkat diubah menjadi ${safeMax}.`,
          });
        }
        console.error('[Update max_devices Error]:', error);
      }
      localCodes = localCodes.map((c) => c.id === id ? { ...c, max_devices: safeMax } : c);
      return NextResponse.json({ success: true, message: `Batas perangkat diubah ke ${safeMax}.` });
    }

    // ── Toggle aktif/nonaktif ──
    if (typeof is_active === 'boolean') {
      if (supabase) {
        const { error } = await supabase
          .from('access_codes')
          .update({ is_active })
          .eq('id', id);

        if (!error) {
          return NextResponse.json({
            success: true,
            message: `Status kode diubah menjadi ${is_active ? 'Aktif' : 'Nonaktif'}.`,
          });
        }
        console.error('[Admin Toggle Error]:', error);
      }
      localCodes = localCodes.map((c) => (c.id === id ? { ...c, is_active } : c));
      return NextResponse.json({ success: true, message: 'Status berhasil diubah.' });
    }

    return NextResponse.json({ success: false, message: 'Aksi tidak dikenal.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 4. DELETE: Hapus kode (otomatis cascade hapus device records)
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID kode diperlukan.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    if (supabase) {
      const { error } = await supabase.from('access_codes').delete().eq('id', id);
      if (!error) {
        return NextResponse.json({ success: true, message: 'Kode berhasil dihapus.' });
      }
      console.error('[Admin DELETE Error]:', error);
    }

    localCodes = localCodes.filter((c) => c.id !== id);
    return NextResponse.json({ success: true, message: 'Kode berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
