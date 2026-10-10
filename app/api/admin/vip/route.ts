import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';
import {
  getVipCatalog,
  getRecentVipLogs,
  updateVipItem,
  invalidateVipCache,
  VipCategory,
} from '@/lib/vipItems';
import { FLOWERS } from '@/data/flowers';
import { BUCKET_SIZES } from '@/data/buckets';
import { GIFT_TEMPLATES } from '@/components/gift/templates';

// ── Rate limiter sederhana per IP (admin actions: maks 60 request per menit) ──
const adminRateMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 60 * 1000;
const MAX_ACTIONS_PER_WINDOW = 60;

function isActionRateLimited(ip: string): boolean {
  const now = Date.now();
  const list = adminRateMap.get(ip) || [];
  const valid = list.filter((t) => now - t < RATE_WINDOW_MS);
  if (valid.length >= MAX_ACTIONS_PER_WINDOW) {
    return true;
  }
  valid.push(now);
  adminRateMap.set(ip, valid);
  return false;
}

function verifyAuthorization(req: NextRequest): boolean {
  const adminKey = process.env.ADMIN_SECRET_KEY;
  const headerKey = req.headers.get('x-admin-key');
  const sessionToken = req.cookies.get('laysa_admin_session')?.value;

  return adminKey ? (headerKey === adminKey || verifyAdminSession(sessionToken)) : false;
}

function validateItemInCatalog(category: VipCategory, itemKey: string): boolean {
  if (category === 'flower') {
    return FLOWERS.some((f) => f.id === itemKey);
  }
  if (category === 'bucket') {
    return BUCKET_SIZES.some((b) => b.id === itemKey);
  }
  if (category === 'card') {
    return ['simple', 'elegant', 'graduation', 'birthday'].includes(itemKey);
  }
  if (category === 'gift_template') {
    return Boolean(GIFT_TEMPLATES[itemKey as keyof typeof GIFT_TEMPLATES]);
  }
  return false;
}

// ── GET: Ambil status VIP semua item + 20 log riwayat ──
export async function GET(req: NextRequest) {
  if (!verifyAuthorization(req)) {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak. Sesi admin tidak valid.' },
      { status: 401 }
    );
  }

  try {
    const vipCatalog = await getVipCatalog();
    const logs = await getRecentVipLogs();

    return NextResponse.json({
      success: true,
      vipCatalog,
      logs,
    });
  } catch (err) {
    console.error('[GET /api/admin/vip] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data VIP admin.' },
      { status: 500 }
    );
  }
}

// ── POST: Ubah status VIP item (Tunggal atau Bulk) ──
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  // 1. Cek Rate Limit
  if (isActionRateLimited(ip)) {
    return NextResponse.json(
      { success: false, message: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.' },
      { status: 429 }
    );
  }

  // 2. Cek Autorisasi Sesi Admin
  if (!verifyAuthorization(req)) {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak. Sesi admin tidak valid.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    // Support Operasi Bulk: { bulk: [{ category, item_key, is_vip, item_name }] }
    if (Array.isArray(body?.bulk) && body.bulk.length > 0) {
      const results = [];
      for (const item of body.bulk) {
        const { category, item_key, is_vip, item_name } = item || {};
        if (
          !category ||
          !item_key ||
          typeof is_vip !== 'boolean' ||
          !['bucket', 'flower', 'card', 'gift_template'].includes(category) ||
          !validateItemInCatalog(category as VipCategory, item_key)
        ) {
          continue;
        }

        await updateVipItem(
          category as VipCategory,
          item_key,
          is_vip,
          'admin',
          item_name
        );
        results.push({ category, item_key, is_vip });
      }

      invalidateVipCache();
      const updatedCatalog = await getVipCatalog();
      const recentLogs = await getRecentVipLogs();

      return NextResponse.json({
        success: true,
        message: `${results.length} item berhasil diperbarui.`,
        updatedCount: results.length,
        vipCatalog: updatedCatalog,
        logs: recentLogs,
      });
    }

    // Operasi Tunggal: { category, item_key, is_vip, item_name }
    const { category, item_key, is_vip, item_name } = body || {};

    if (!category || !['bucket', 'flower', 'card', 'gift_template'].includes(category)) {
      return NextResponse.json(
        { success: false, message: 'Kategori item tidak valid.' },
        { status: 400 }
      );
    }

    if (!item_key || typeof item_key !== 'string') {
      return NextResponse.json(
        { success: false, message: 'ID/Key item tidak valid.' },
        { status: 400 }
      );
    }

    if (typeof is_vip !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Status is_vip harus bernilai boolean (true/false).' },
        { status: 400 }
      );
    }

    // Validasi bahwa item ada di katalog
    if (!validateItemInCatalog(category as VipCategory, item_key)) {
      return NextResponse.json(
        { success: false, message: `Item "${item_key}" tidak ditemukan di katalog ${category}.` },
        { status: 422 }
      );
    }

    await updateVipItem(
      category as VipCategory,
      item_key,
      is_vip,
      'admin',
      item_name
    );

    invalidateVipCache();
    const updatedCatalog = await getVipCatalog();
    const recentLogs = await getRecentVipLogs();

    return NextResponse.json({
      success: true,
      message: `Status VIP untuk "${item_name || item_key}" berhasil diubah menjadi ${is_vip ? 'VIP' : 'Non-VIP'}.`,
      vipCatalog: updatedCatalog,
      logs: recentLogs,
    });
  } catch (err) {
    console.error('[POST /api/admin/vip] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memperbarui status VIP.' },
      { status: 500 }
    );
  }
}
