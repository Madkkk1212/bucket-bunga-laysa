import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export async function GET(
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

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('digital_gifts')
        .select('id, sender_name, recipient_name, message, music_track, design_data, views_count, created_at')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[Supabase Fetch Gift Error]:', error.message);
      } else if (data) {
        // Increment view count asynchronously
        supabase
          .from('digital_gifts')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', id)
          .then(() => {});

        return NextResponse.json({
          success: true,
          gift: {
            id: data.id,
            senderName: data.sender_name,
            recipientName: data.recipient_name,
            message: data.message,
            musicTrack: data.music_track,
            designData: data.design_data,
            createdAt: data.created_at,
            views: (data.views_count || 0) + 1,
          },
        });
      }
    }

    // Fallback to local memory store
    const { giftsMemoryStore } = await import('@/lib/giftsStorage');
    const localGift = giftsMemoryStore.get(id);

    if (localGift) {
      localGift.views = (localGift.views || 0) + 1;
      return NextResponse.json({
        success: true,
        gift: localGift,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Hadiah buket digital tidak ditemukan atau sudah kedaluwarsa.',
    }, { status: 404 });
  } catch (error) {
    console.error('Error in /api/gifts/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat memuat hadiah digital.' },
      { status: 500 }
    );
  }
}
