import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getAdminClient } from '@/utils/supabase/admin';

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

    const dbClient = getAdminClient() || supabase;

    if (isSupabaseConfigured && dbClient) {
      const { data, error } = await dbClient
        .from('digital_gifts')
        .select('id, sender_name, recipient_name, message, music_track, design_data, config, expires_at, scheduled_open_at, is_reported, views_count, created_at')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[Supabase Fetch Gift Error]:', error.message);
      } else if (data) {
        // Cek apakah kado dilaporkan
        if (data.is_reported) {
          return NextResponse.json({
            success: false,
            message: 'Hadiah ini sedang dalam peninjauan.',
          }, { status: 403 });
        }

        // Cek apakah kado sudah kedaluwarsa
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          return NextResponse.json({
            success: false,
            message: 'Link kado ini sudah tidak aktif.',
            expired: true,
          }, { status: 410 });
        }

        // Increment view count asinkron
        dbClient
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
            config: data.config ?? null,
            expiresAt: data.expires_at ?? null,
            scheduledOpenAt: data.scheduled_open_at ?? null,
            createdAt: data.created_at,
            views: (data.views_count || 0) + 1,
          },
        });
      }
    }

    // Fallback memory store (tidak ada expiry di sini)
    const { giftsMemoryStore } = await import('@/lib/giftsStorage');
    const localGift = giftsMemoryStore.get(id);

    if (localGift) {
      localGift.views = (localGift.views || 0) + 1;
      return NextResponse.json({ success: true, gift: localGift });
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
