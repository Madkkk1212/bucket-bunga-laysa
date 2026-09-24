import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { senderName, recipientName, message, musicTrack, designData } = body || {};

    if (!designData) {
      return NextResponse.json(
        { success: false, message: 'Data rangkaian buket tidak valid.' },
        { status: 400 }
      );
    }

    // Generate unique short ID (e.g. gift_k9x2m1)
    const uniqueId = `gift_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const giftRecord = {
      id: uniqueId,
      senderName: senderName || 'Seseorang yang Mengagumimu',
      recipientName: recipientName || 'Untukmu',
      message: message || '',
      musicTrack: musicTrack || 'romantic-piano',
      designData: designData,
      createdAt: new Date().toISOString(),
      views: 0,
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('digital_gifts').insert({
        id: uniqueId,
        sender_name: giftRecord.senderName,
        recipient_name: giftRecord.recipientName,
        message: giftRecord.message,
        music_track: giftRecord.musicTrack,
        design_data: giftRecord.designData,
        views_count: 0,
      });

      if (error) {
        console.error('[Supabase Save Gift Error]:', error.message);
        // Still save to memory store so user experience is not disrupted
        const { giftsMemoryStore } = await import('@/lib/giftsStorage');
        giftsMemoryStore.set(uniqueId, giftRecord);
      }
    } else {
      const { giftsMemoryStore } = await import('@/lib/giftsStorage');
      giftsMemoryStore.set(uniqueId, giftRecord);
    }

    return NextResponse.json({
      success: true,
      id: uniqueId,
      shareUrl: `/gift/${uniqueId}`,
      message: 'Link buket digital interaktif berhasil dibuat!',
    });
  } catch (error) {
    console.error('Error in /api/gifts POST:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat membuat link hadiah.' },
      { status: 500 }
    );
  }
}
