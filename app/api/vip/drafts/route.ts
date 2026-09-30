import { NextResponse } from 'next/server';
import { getAdminClient } from '@/utils/supabase/admin';
import { getSupabase } from '@/lib/supabaseClient';
import { encryptData, decryptData } from '@/utils/encryption';

const FALLBACK_MASTER_CODES = [
  'LAYSA-VIP',
  'BUKET2026',
  'PREMIUM-LOVE',
  'VIP-BOUQUET',
  'LAYSA-PREMIUM',
  'TISUWKWK',
];

async function verifyVipCode(code: string): Promise<boolean> {
  const cleanCode = code.trim().toUpperCase();
  if (FALLBACK_MASTER_CODES.includes(cleanCode)) return true;

  const supabase = getAdminClient() || getSupabase();
  if (!supabase) return false;

  try {
    const { data, error } = await supabase
      .from('access_codes')
      .select('code, is_active, expires_at')
      .eq('code', cleanCode)
      .maybeSingle();

    if (error || !data || !data.is_active) return false;

    // Check expiration if set
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * GET /api/vip/drafts?code=...&deviceId=...
 * Mengambil dan mendekripsi draft buket terakhir untuk akun VIP
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const deviceId = searchParams.get('deviceId') || '';

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Kode akses VIP diperlukan.' },
        { status: 400 }
      );
    }

    const isVip = await verifyVipCode(code);
    if (!isVip) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Fitur Cloud Vault hanya untuk akun VIP aktif.' },
        { status: 403 }
      );
    }

    const supabase = getAdminClient() || getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Layanan database tidak tersedia saat ini.' },
        { status: 503 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const { data, error } = await supabase
      .from('vip_bouquet_drafts')
      .select('encrypted_data, iv, version, updated_at, user_name')
      .eq('access_code', cleanCode)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ success: true, draft: null });
    }

    // Auth tag disimpan bersama iv atau encrypted_data jika ada
    let authTag: string | undefined;
    let rawIv = data.iv;
    if (data.iv && data.iv.includes(':')) {
      const parts = data.iv.split(':');
      rawIv = parts[0];
      authTag = parts[1];
    }

    const decryptedDraft = decryptData(data.encrypted_data, rawIv, authTag);

    return NextResponse.json({
      success: true,
      draft: decryptedDraft,
      updatedAt: data.updated_at,
      userName: data.user_name,
    });
  } catch (err: any) {
    console.error('Error fetching VIP draft:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal memulihkan draft terenkripsi.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vip/drafts
 * Menyimpan draft buket secara terenkripsi AES-256 ke Supabase (Khusus VIP)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = body?.code;
    const deviceId = body?.deviceId || '';
    const userName = body?.userName || '';
    const draft = body?.draft;

    if (!code || !draft) {
      return NextResponse.json(
        { success: false, message: 'Kode akses VIP dan data draft diperlukan.' },
        { status: 400 }
      );
    }

    const isVip = await verifyVipCode(code);
    if (!isVip) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Fitur Cloud Vault hanya untuk akun VIP aktif.' },
        { status: 403 }
      );
    }

    const supabase = getAdminClient() || getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Layanan database tidak tersedia saat ini.' },
        { status: 503 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Enkripsi draft menggunakan AES-256-GCM
    const { encryptedData, iv, authTag } = encryptData(draft);
    const combinedIv = `${iv}:${authTag}`;

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('vip_bouquet_drafts')
      .upsert(
        {
          access_code: cleanCode,
          device_id: deviceId,
          user_name: userName,
          encrypted_data: encryptedData,
          iv: combinedIv,
          version: 1,
          updated_at: now,
        },
        { onConflict: 'access_code' }
      );

    if (error) {
      console.error('Error upserting VIP draft:', error);
      return NextResponse.json(
        { success: false, message: 'Gagal menyimpan draft ke cloud.', detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      savedAt: now,
      message: 'Draft berhasil dienkripsi dan disimpan di Cloud VIP.',
    });
  } catch (err: any) {
    console.error('Error in POST /api/vip/drafts:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Terjadi kesalahan sistem saat mengenkripsi draft.' },
      { status: 500 }
    );
  }
}
