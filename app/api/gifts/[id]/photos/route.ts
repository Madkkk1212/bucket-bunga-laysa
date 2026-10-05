import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getAdminClient } from '@/utils/supabase/admin';
import { giftPhotosStore, StoredGiftPhoto } from '@/lib/giftsStorage';

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
      // Ambil foto dari Supabase
      const { data: photos, error } = await dbClient
        .from('gift_photos')
        .select('id, storage_path, alt_text, display_order')
        .eq('gift_id', id)
        .order('display_order', { ascending: true });

      if (!error && photos && photos.length > 0) {
        // Buat signed URL untuk setiap foto (berlaku 1 jam)
        const signedPhotos = await Promise.all(
          photos.map(async (p: any) => {
            let url = '';
            try {
              const { data: signed } = await dbClient.storage
                .from('gift-photos')
                .createSignedUrl(p.storage_path, 3600);
              url = signed?.signedUrl || '';
            } catch {
              // Jika bucket public atau gagal signed
              const { data: pub } = dbClient.storage
                .from('gift-photos')
                .getPublicUrl(p.storage_path);
              url = pub?.publicUrl || '';
            }

            return {
              id: p.id,
              url: url || p.storage_path,
              altText: p.alt_text || '',
              displayOrder: p.display_order,
            };
          })
        );

        return NextResponse.json({ success: true, photos: signedPhotos });
      }
    }

    // Fallback store
    const localPhotos = giftPhotosStore.get(id) || [];
    return NextResponse.json({ success: true, photos: localPhotos });
  } catch (error: any) {
    console.error('Error fetching gift photos:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat foto hadiah.' },
      { status: 500 }
    );
  }
}

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
    const photos: Array<{ dataUrl: string; altText?: string; displayOrder?: number }> =
      body?.photos || [];

    if (!Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada foto yang dikirim.' },
        { status: 400 }
      );
    }

    // Maksimal 6 foto
    const trimmedPhotos = photos.slice(0, 6);
    const dbClient = getAdminClient() || supabase;

    if (isSupabaseConfigured && dbClient) {
      const insertedPhotos: StoredGiftPhoto[] = [];

      for (let i = 0; i < trimmedPhotos.length; i++) {
        const item = trimmedPhotos[i];
        if (!item.dataUrl) continue;

        try {
          // Parse base64
          const matches = item.dataUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const fileName = `${id}/${Date.now()}_${i}.${ext}`;

            // Upload ke Supabase Storage bucket 'gift-photos'
            const { error: uploadErr } = await dbClient.storage
              .from('gift-photos')
              .upload(fileName, buffer, {
                contentType: `image/${matches[1]}`,
                upsert: true,
              });

            if (!uploadErr) {
              const { data: dbPhoto } = await dbClient
                .from('gift_photos')
                .insert([
                  {
                    gift_id: id,
                    storage_path: fileName,
                    alt_text: (item.altText || '').slice(0, 100),
                    display_order: item.displayOrder ?? i,
                  },
                ])
                .select()
                .single();

              if (dbPhoto) {
                const { data: signed } = await dbClient.storage
                  .from('gift-photos')
                  .createSignedUrl(fileName, 3600);

                insertedPhotos.push({
                  id: dbPhoto.id,
                  giftId: id,
                  url: signed?.signedUrl || fileName,
                  altText: item.altText,
                  displayOrder: item.displayOrder ?? i,
                });
                continue;
              }
            }
          }
        } catch (e) {
          console.warn('[Photo upload to Supabase storage failed, fallback to memory]', e);
        }

        // Fallback photo
        insertedPhotos.push({
          id: `photo_${Date.now()}_${i}`,
          giftId: id,
          url: item.dataUrl,
          altText: item.altText,
          displayOrder: item.displayOrder ?? i,
        });
      }

      // Update gift config photoCount
      await dbClient
        .from('digital_gifts')
        .update({
          // Bisa update count
        })
        .eq('id', id);

      giftPhotosStore.set(id, insertedPhotos);

      return NextResponse.json({
        success: true,
        count: insertedPhotos.length,
        photos: insertedPhotos,
      });
    }

    // Simpan di memory fallback
    const fallbackList: StoredGiftPhoto[] = trimmedPhotos.map((p, idx) => ({
      id: `photo_${Date.now()}_${idx}`,
      giftId: id,
      url: p.dataUrl,
      altText: p.altText,
      displayOrder: p.displayOrder ?? idx,
    }));
    giftPhotosStore.set(id, fallbackList);

    return NextResponse.json({
      success: true,
      count: fallbackList.length,
      photos: fallbackList,
    });
  } catch (error: any) {
    console.error('Error uploading gift photos:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengunggah foto hadiah.' },
      { status: 500 }
    );
  }
}
