import { NextResponse } from 'next/server';
import {
  readVisitorStats,
  updateVisitorSettings,
  resetVisitorStats,
} from '@/lib/visitorStorage';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/site-stats
 * Mengambil detail lengkap statistik kunjungan untuk Admin Dashboard.
 */
export async function GET() {
  try {
    const stats = readVisitorStats();
    return NextResponse.json({
      success: true,
      stats: {
        totalVisits: stats.totalVisits || 0,
        uniqueVisitors: stats.uniqueVisitors || 0,
        todayVisits: stats.todayVisits || 0,
        showOnHome: Boolean(stats.showOnHome),
        customOffset: stats.customOffset || 0,
        effectiveTotal: (stats.totalVisits || 0) + (stats.customOffset || 0),
        lastDate: stats.lastDate,
        updatedAt: stats.updatedAt,
        dailyStats: stats.dailyStats || {},
      },
    });
  } catch (err) {
    console.error('[AdminSiteStats] Error getting stats:', err);
    return NextResponse.json({ success: false, error: 'Gagal memuat statistik.' }, { status: 500 });
  }
}

/**
 * POST /api/admin/site-stats
 * Mengubah konfigurasi tampilan counter di beranda atau reset statistik.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'reset') {
      const reset = resetVisitorStats();
      return NextResponse.json({
        success: true,
        message: 'Statistik kunjungan berhasil di-reset.',
        stats: reset,
      });
    }

    const updates: { showOnHome?: boolean; customOffset?: number } = {};

    if (typeof body.showOnHome === 'boolean') {
      updates.showOnHome = body.showOnHome;
    }

    if (typeof body.customOffset === 'number') {
      updates.customOffset = body.customOffset;
    }

    const updated = updateVisitorSettings(updates);

    return NextResponse.json({
      success: true,
      message: 'Pengaturan statistik berhasil diperbarui.',
      stats: {
        totalVisits: updated.totalVisits || 0,
        uniqueVisitors: updated.uniqueVisitors || 0,
        todayVisits: updated.todayVisits || 0,
        showOnHome: Boolean(updated.showOnHome),
        customOffset: updated.customOffset || 0,
        effectiveTotal: (updated.totalVisits || 0) + (updated.customOffset || 0),
        lastDate: updated.lastDate,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error('[AdminSiteStats] Error updating stats:', err);
    return NextResponse.json({ success: false, error: 'Gagal memperbarui pengaturan.' }, { status: 500 });
  }
}
