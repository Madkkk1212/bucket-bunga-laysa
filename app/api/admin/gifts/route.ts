import { NextResponse } from 'next/server';
import { getAdminClient } from '@/utils/supabase/admin';
import { giftsMemoryStore } from '@/lib/giftsStorage';

/**
 * GET /api/admin/gifts
 * Mengambil seluruh data hadiah digital & statistik untuk Dashboard Admin
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.toLowerCase().trim() || '';

    const supabase = getAdminClient();
    let gifts: any[] = [];
    let vipDraftsCount = 0;

    if (supabase) {
      // 1. Ambil seluruh hadiah digital
      const { data, error } = await supabase
        .from('digital_gifts')
        .select('id, sender_name, recipient_name, message, music_track, views_count, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        gifts = data.map((g) => ({
          id: g.id,
          senderName: g.sender_name || 'Tanpa Nama',
          recipientName: g.recipient_name || 'Untukmu',
          message: g.message || '',
          musicTrack: g.music_track || 'romantic-piano',
          viewsCount: g.views_count || 0,
          createdAt: g.created_at,
        }));
      }

      // 2. Cek jumlah draft VIP terenkripsi
      try {
        const { count, error: draftErr } = await supabase
          .from('vip_bouquet_drafts')
          .select('id', { count: 'exact', head: true });
        if (!draftErr && typeof count === 'number') {
          vipDraftsCount = count;
        }
      } catch {
        // Abaikan jika tabel belum ada
      }
    }

    // Jika Supabase kosong / fallback ke memory store
    if (gifts.length === 0 && giftsMemoryStore.size > 0) {
      gifts = Array.from(giftsMemoryStore.values()).map((g) => ({
        id: g.id,
        senderName: g.senderName || 'Tanpa Nama',
        recipientName: g.recipientName || 'Untukmu',
        message: g.message || '',
        musicTrack: g.musicTrack || 'romantic-piano',
        viewsCount: g.views || 0,
        createdAt: g.createdAt,
      })).reverse();
    }

    // Filter jika ada search query
    if (search) {
      gifts = gifts.filter(
        (g) =>
          g.id.toLowerCase().includes(search) ||
          g.senderName.toLowerCase().includes(search) ||
          g.recipientName.toLowerCase().includes(search) ||
          g.message.toLowerCase().includes(search)
      );
    }

    const totalViews = gifts.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);

    return NextResponse.json({
      success: true,
      gifts,
      totalGifts: gifts.length,
      totalViews,
      vipDraftsCount,
    });
  } catch (err: any) {
    console.error('Error in /api/admin/gifts GET:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat database hadiah digital.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/gifts
 * Menghapus data hadiah digital dari database
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID hadiah wajib disertakan.' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    if (supabase) {
      const { error } = await supabase.from('digital_gifts').delete().eq('id', id);
      if (error) {
        console.error('Error deleting gift from Supabase:', error);
      }
    }

    // Hapus juga dari memory store jika ada
    if (giftsMemoryStore.has(id)) {
      giftsMemoryStore.delete(id);
    }

    return NextResponse.json({
      success: true,
      message: `Hadiah digital ${id} berhasil dihapus.`,
    });
  } catch (err: any) {
    console.error('Error in /api/admin/gifts DELETE:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus hadiah digital.' },
      { status: 500 }
    );
  }
}
