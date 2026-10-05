import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getAdminClient } from '@/utils/supabase/admin';
import crypto from 'crypto';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID hadiah tidak ditemukan.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';

    if (!reason || reason.length < 3 || reason.length > 500) {
      return NextResponse.json(
        { success: false, message: 'Alasan laporan harus antara 3 hingga 500 karakter.' },
        { status: 400 }
      );
    }

    // IP privacy: SHA-256 hash instead of raw IP
    const rawIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const hashedIp = crypto.createHash('sha256').update(rawIp).digest('hex').substring(0, 32);

    const dbClient = getAdminClient() || supabase;

    if (isSupabaseConfigured && dbClient) {
      // 1. Simpan laporan
      await dbClient.from('gift_reports').insert([
        {
          gift_id: id,
          reason,
          reporter_ip: hashedIp,
        },
      ]);

      // 2. Cek jumlah laporan untuk gift ini
      const { count } = await dbClient
        .from('gift_reports')
        .select('*', { count: 'exact', head: true })
        .eq('gift_id', id);

      if (count && count >= 3) {
        // Flag kado otomatis jika mendapat 3+ laporan berbeda
        await dbClient
          .from('digital_gifts')
          .update({ is_reported: true })
          .eq('id', id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Laporan telah kami terima. Tim kami akan segera meninjau kado ini. Terima kasih.',
    });
  } catch (error: any) {
    console.error('Error reporting gift:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengirim laporan. Coba lagi nanti.' },
      { status: 500 }
    );
  }
}
