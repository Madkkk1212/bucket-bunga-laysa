import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';
import { getAdminClient } from '@/utils/supabase/admin';
import {
  getAllPopupBannersAdmin,
  savePopupBannerSlide,
  deletePopupBannerSlide,
  validateImageSecurity,
  invalidatePopupCache,
} from '@/lib/popupBanners';

function verifyAuthorization(req: NextRequest): boolean {
  const adminKey = process.env.ADMIN_SECRET_KEY;
  const headerKey = req.headers.get('x-admin-key');
  const sessionToken = req.cookies.get('laysa_admin_session')?.value;

  return adminKey ? headerKey === adminKey || verifyAdminSession(sessionToken) : false;
}

// ── GET: Ambil seluruh slide popup (maksimal 3) ──
export async function GET(req: NextRequest) {
  if (!verifyAuthorization(req)) {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak. Sesi admin tidak valid.' },
      { status: 401 }
    );
  }

  try {
    const slides = await getAllPopupBannersAdmin();
    return NextResponse.json({ success: true, slides });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data popup: ' + err.message },
      { status: 500 }
    );
  }
}

// ── POST: Unggah atau update slide popup ──
export async function POST(req: NextRequest) {
  if (!verifyAuthorization(req)) {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak. Sesi admin tidak valid.' },
      { status: 401 }
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';

    // A. Dukungan Unggahan File Langsung (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const orderStr = formData.get('display_order') as string | null;
      const title = (formData.get('title') as string) || '';
      const linkUrl = (formData.get('link_url') as string) || '';
      const slideId = (formData.get('id') as string) || undefined;
      const isActiveStr = formData.get('is_active') as string | null;

      const displayOrder = parseInt(orderStr || '1', 10) || 1;
      const isActive = isActiveStr !== 'false';

      if (!file) {
        return NextResponse.json(
          { success: false, message: 'File gambar wajib diunggah.' },
          { status: 400 }
        );
      }

      // Ukuran maksimal 4MB
      if (file.size > 4 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'Ukuran file gambar maksimal 4MB.' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // ── Validasi Keamanan Ketat (JPG, JPEG, PNG + Magic Bytes) ──
      const securityCheck = validateImageSecurity(buffer, file.name, file.type);
      if (!securityCheck.valid) {
        return NextResponse.json(
          { success: false, message: securityCheck.error },
          { status: 422 }
        );
      }

      let imageUrl = '';
      const supabase = getAdminClient();

      // Coba upload ke Supabase Storage bucket 'popup-banners'
      if (supabase) {
        try {
          const timestamp = Date.now();
          const safeFileName = `popup_slide_${displayOrder}_${timestamp}.${securityCheck.extension}`;

          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('popup-banners')
            .upload(safeFileName, buffer, {
              contentType: file.type || (securityCheck.extension === 'png' ? 'image/png' : 'image/jpeg'),
              upsert: true,
            });

          if (!uploadErr && uploadData?.path) {
            const { data: pubUrlData } = supabase.storage
              .from('popup-banners')
              .getPublicUrl(uploadData.path);
            if (pubUrlData?.publicUrl) {
              imageUrl = pubUrlData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn('[POST /api/admin/popups] Supabase storage upload warning:', storageErr);
        }
      }

      // Jika Supabase Storage belum aktif, fallback data URL aman
      if (!imageUrl) {
        const base64 = buffer.toString('base64');
        const mime = securityCheck.extension === 'png' ? 'image/png' : 'image/jpeg';
        imageUrl = `data:${mime};base64,${base64}`;
      }

      const result = await savePopupBannerSlide({
        id: slideId,
        image_url: imageUrl,
        title,
        link_url: linkUrl,
        display_order: displayOrder,
        is_active: isActive,
      });

      if (!result.success) {
        return NextResponse.json({ success: false, message: result.message }, { status: 400 });
      }

      invalidatePopupCache();
      const updatedSlides = await getAllPopupBannersAdmin();

      return NextResponse.json({
        success: true,
        message: 'Gambar slide popup berhasil disimpan.',
        slide: result.item,
        slides: updatedSlides,
      });
    }

    // B. Dukungan Update Status / Metadata JSON
    const body = await req.json();
    const { id, is_active, display_order, title, link_url, image_url } = body || {};

    if (!id && !image_url) {
      return NextResponse.json(
        { success: false, message: 'Data slide tidak lengkap.' },
        { status: 400 }
      );
    }

    const result = await savePopupBannerSlide({
      id,
      image_url: image_url || '',
      title,
      link_url,
      display_order: display_order || 1,
      is_active: typeof is_active === 'boolean' ? is_active : true,
    });

    invalidatePopupCache();
    const updatedSlides = await getAllPopupBannersAdmin();

    return NextResponse.json({
      success: true,
      message: 'Pengaturan slide popup berhasil diperbarui.',
      slide: result.item,
      slides: updatedSlides,
    });
  } catch (err: any) {
    console.error('[POST /api/admin/popups] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses gambar popup: ' + err.message },
      { status: 500 }
    );
  }
}

// ── DELETE: Hapus slide popup berdasarkan ID ──
export async function DELETE(req: NextRequest) {
  if (!verifyAuthorization(req)) {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak. Sesi admin tidak valid.' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID slide wajib disertakan.' },
        { status: 400 }
      );
    }

    await deletePopupBannerSlide(id);
    invalidatePopupCache();
    const updatedSlides = await getAllPopupBannersAdmin();

    return NextResponse.json({
      success: true,
      message: 'Slide popup berhasil dihapus.',
      slides: updatedSlides,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus slide: ' + err.message },
      { status: 500 }
    );
  }
}
