import { NextResponse } from 'next/server';
import { recordNewVisit } from '@/lib/visitorStorage';

/**
 * POST /api/track-visit
 * Endpoint publik ringan untuk mencatat kunjungan pengguna.
 * Dipanggil secara aman & non-blocking saat beranda dimuat.
 */
export async function POST(req: Request) {
  try {
    let isUnique = false;

    try {
      const body = await req.json();
      if (typeof body?.isUnique === 'boolean') {
        isUnique = body.isUnique;
      }
    } catch {
      // Body kosong / invalid json, abaikan
    }

    recordNewVisit(isUnique);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[TrackVisit] Error recording visit:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
