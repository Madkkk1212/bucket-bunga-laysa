import { getAdminClient } from '@/utils/supabase/admin';
import { getSupabase } from '@/lib/supabaseClient';

export interface PopupBannerItem {
  id: string;
  image_url: string;
  title?: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// In-memory cache & fallback store
interface PopupCache {
  items: PopupBannerItem[];
  isEnabled: boolean;
  timestamp: number;
}

const globalForPopups = globalThis as unknown as {
  popupCache?: PopupCache;
};

const CACHE_TTL_MS = 60 * 1000; // 60 detik cache in-memory

/**
 * Validasi ketat format file gambar (HANYA JPG, JPEG, dan PNG)
 * Memeriksa ekstensi, MIME type, dan signature header (magic bytes)
 */
export function validateImageSecurity(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): { valid: boolean; error?: string; extension?: string } {
  // 1. Validasi ekstensi
  const extMatch = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  const ext = extMatch ? extMatch[1] : '';

  const ALLOWED_EXTS = ['jpg', 'jpeg', 'png'];
  if (!ALLOWED_EXTS.includes(ext)) {
    return {
      valid: false,
      error: `Format file ".${ext}" tidak diizinkan. Demi keamanan website, hanya file JPG, JPEG, dan PNG yang diperbolehkan.`,
    };
  }

  // 2. Validasi MIME type
  const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!ALLOWED_MIMES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Tipe file "${mimeType}" tidak valid. Hanya gambar JPEG dan PNG yang diizinkan.`,
    };
  }

  // 3. Validasi Magic Bytes (File Signature)
  if (buffer.length < 8) {
    return { valid: false, error: 'File gambar rusak atau terlalu kecil.' };
  }

  const isJpeg =
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  if (!isJpeg && !isPng) {
    return {
      valid: false,
      error: 'Header isi file tidak sesuai dengan format JPG/PNG asli. File ditolak demi keamanan sistem.',
    };
  }

  return { valid: true, extension: isPng ? 'png' : 'jpg' };
}

/**
 * Invalidate cache saat admin mengubah popup
 */
export function invalidatePopupCache(): void {
  if (globalForPopups.popupCache) {
    globalForPopups.popupCache.timestamp = 0;
  }
}

/**
 * Ambil daftar banner aktif untuk publik
 */
export async function getActivePopupBanners(): Promise<PopupBannerItem[]> {
  const now = Date.now();
  if (globalForPopups.popupCache && now - globalForPopups.popupCache.timestamp < CACHE_TTL_MS) {
    return globalForPopups.popupCache.items.filter((i) => i.is_active);
  }

  const supabase = getAdminClient() || getSupabase();
  let items: PopupBannerItem[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('popup_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(3);

      if (!error && Array.isArray(data)) {
        items = data as PopupBannerItem[];
      }
    } catch (err) {
      console.warn('[popupBanners] Supabase fetch error, using memory fallback:', err);
    }
  }

  // Jika database belum ada data, ambil dari cache in-memory fallback
  if (items.length === 0 && globalForPopups.popupCache?.items) {
    items = globalForPopups.popupCache.items.filter((i) => i.is_active);
  }

  if (!globalForPopups.popupCache) {
    globalForPopups.popupCache = {
      items,
      isEnabled: true,
      timestamp: now,
    };
  } else {
    globalForPopups.popupCache.items = items;
    globalForPopups.popupCache.timestamp = now;
  }

  return items;
}

/**
 * Ambil seluruh banner untuk admin (maksimal 3 slide)
 */
export async function getAllPopupBannersAdmin(): Promise<PopupBannerItem[]> {
  const supabase = getAdminClient() || getSupabase();
  let items: PopupBannerItem[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('popup_banners')
        .select('*')
        .order('display_order', { ascending: true })
        .limit(3);

      if (!error && Array.isArray(data)) {
        items = data as PopupBannerItem[];
      }
    } catch {
      // ignore
    }
  }

  if (items.length === 0 && globalForPopups.popupCache?.items) {
    items = globalForPopups.popupCache.items;
  }

  return items;
}

/**
 * Simpan atau perbarui slide popup (maksimal 3 slide)
 */
export async function savePopupBannerSlide(
  slide: {
    id?: string;
    image_url: string;
    title?: string;
    link_url?: string;
    display_order: number;
    is_active?: boolean;
  }
): Promise<{ success: boolean; item?: PopupBannerItem; message?: string }> {
  const supabase = getAdminClient();
  const now = new Date().toISOString();

  // Validasi urutan slide (1, 2, atau 3)
  const order = Math.max(1, Math.min(3, slide.display_order || 1));

  const record: PopupBannerItem = {
    id: slide.id || `popup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    image_url: slide.image_url,
    title: slide.title || '',
    link_url: slide.link_url || '',
    display_order: order,
    is_active: slide.is_active ?? true,
    updated_at: now,
    created_at: now,
  };

  if (supabase) {
    try {
      if (slide.id) {
        // Update existing
        await supabase
          .from('popup_banners')
          .update({
            image_url: record.image_url,
            title: record.title,
            link_url: record.link_url,
            display_order: record.display_order,
            is_active: record.is_active,
            updated_at: now,
          })
          .eq('id', slide.id);
      } else {
        // Cek jumlah total slide yang sudah ada
        const { count } = await supabase
          .from('popup_banners')
          .select('id', { count: 'exact', head: true });

        if ((count || 0) >= 3) {
          return {
            success: false,
            message: 'Maksimal 3 slide gambar sudah tercapai. Hapus salah satu slide terlebih dahulu.',
          };
        }

        await supabase.from('popup_banners').insert(record);
      }
    } catch (err) {
      console.warn('[popupBanners] Supabase save error:', err);
    }
  }

  // Simpan ke in-memory cache
  if (!globalForPopups.popupCache) {
    globalForPopups.popupCache = { items: [record], isEnabled: true, timestamp: 0 };
  } else {
    const existingIdx = globalForPopups.popupCache.items.findIndex(
      (i) => i.id === record.id || i.display_order === record.display_order
    );
    if (existingIdx >= 0) {
      globalForPopups.popupCache.items[existingIdx] = record;
    } else {
      if (globalForPopups.popupCache.items.length >= 3) {
        return {
          success: false,
          message: 'Maksimal 3 slide gambar sudah tercapai.',
        };
      }
      globalForPopups.popupCache.items.push(record);
    }
    globalForPopups.popupCache.items.sort((a, b) => a.display_order - b.display_order);
    globalForPopups.popupCache.timestamp = 0;
  }

  return { success: true, item: record };
}

/**
 * Hapus slide popup
 */
export async function deletePopupBannerSlide(id: string): Promise<boolean> {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      await supabase.from('popup_banners').delete().eq('id', id);
    } catch {
      // ignore
    }
  }

  if (globalForPopups.popupCache) {
    globalForPopups.popupCache.items = globalForPopups.popupCache.items.filter(
      (i) => i.id !== id
    );
    globalForPopups.popupCache.timestamp = 0;
  }

  return true;
}
