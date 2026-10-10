import { NextResponse } from 'next/server';
import { getActivePopupBanners } from '@/lib/popupBanners';

export const revalidate = 60; // Cache 60 detik

export async function GET() {
  try {
    const banners = await getActivePopupBanners();

    return NextResponse.json(
      {
        success: true,
        banners,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching active popups:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat popup.' },
      { status: 500 }
    );
  }
}
