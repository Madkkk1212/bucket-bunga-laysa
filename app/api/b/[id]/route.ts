import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getAdminClient } from '@/utils/supabase/admin';
import {
  getLocalGift,
  incrementLocalGiftViews,
  type StoredGift,
} from '@/lib/giftsStorage';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID link tidak ditemukan.' },
        { status: 400 }
      );
    }

    // 1. Try local memory + persistent file first (fastest)
    const localGift = getLocalGift(id);
    if (localGift) {
      incrementLocalGiftViews(id);
      return NextResponse.json({
        success: true,
        gift: localGift,
      });
    }

    // 2. Try Supabase if not in local store
    const dbClient = getAdminClient() || supabase;
    if (isSupabaseConfigured && dbClient) {
      const { data, error } = await dbClient
        .from('digital_gifts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        // Increment views
        dbClient
          .from('digital_gifts')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', id)
          .then(() => {});

        const remoteGift: StoredGift = {
          id: data.id,
          senderName: data.sender_name,
          recipientName: data.recipient_name,
          message: data.message,
          musicTrack: data.music_track || 'romantic-piano',
          designData: data.design_data,
          createdAt: data.created_at,
          views: (data.views_count || 0) + 1,
        };

        return NextResponse.json({
          success: true,
          gift: remoteGift,
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Buket bunga tidak ditemukan atau link sudah tidak tersedia.',
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error in GET /api/b/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat memuat buket.' },
      { status: 500 }
    );
  }
}
