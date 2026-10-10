import { NextResponse } from 'next/server';
import { getVipCatalog } from '@/lib/vipItems';

export const revalidate = 60; // 60 detik cache revalidation

export async function GET() {
  try {
    const vipCatalog = await getVipCatalog();

    return NextResponse.json(
      {
        success: true,
        vipItems: vipCatalog,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching VIP items:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data item VIP.' },
      { status: 500 }
    );
  }
}
