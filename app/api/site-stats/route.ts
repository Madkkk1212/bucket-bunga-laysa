import { NextResponse } from 'next/server';
import { readVisitorStats } from '@/lib/visitorStorage';

// Supaya selalu mendapatkan data status terbaru saat dipanggil
export const dynamic = 'force-dynamic';

/**
 * GET /api/site-stats
 * Endpoint publik untuk halaman utama (Home).
 * Hanya mengembalikan status apakah counter boleh ditampilkan dan total angka kunjungan.
 */
export async function GET() {
  try {
    const stats = readVisitorStats();
    const effectiveCount = (stats.totalVisits || 0) + (stats.customOffset || 0);

    return NextResponse.json(
      {
        showOnHome: Boolean(stats.showOnHome),
        count: effectiveCount,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err) {
    console.error('[SiteStats] Error getting public stats:', err);
    return NextResponse.json({ showOnHome: false, count: 0 }, { status: 500 });
  }
}
