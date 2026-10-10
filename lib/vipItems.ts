import { getAdminClient } from '@/utils/supabase/admin';
import { getSupabase } from '@/lib/supabaseClient';
import { FLOWERS } from '@/data/flowers';
import { BUCKET_SIZES } from '@/data/buckets';
import { GIFT_TEMPLATES } from '@/components/gift/templates';

export type VipCategory = 'bucket' | 'flower' | 'card' | 'gift_template';

export interface VipItemRecord {
  id?: string;
  category: VipCategory;
  item_key: string;
  is_vip: boolean;
  updated_at?: string;
  updated_by?: string;
}

export interface VipAuditLogRecord {
  id?: string;
  category: VipCategory;
  item_key: string;
  item_name?: string;
  old_status: boolean;
  new_status: boolean;
  changed_by: string;
  created_at: string;
}

// ─── Default Hardcoded Seed (Fallback jika Supabase belum ada tabel) ─────────
export const DEFAULT_VIP_SEED: Record<VipCategory, Record<string, boolean>> = {
  flower: {
    calla_white: true,
    hydrangea_blue: true,
    hydrangea_purple: true,
    iris_purple: true,
    orchid_pink: true,
    protea_pink: true,
    ranunculus_pink: true,
    tulip_pink: true,
    tulip_purple: true,
  },
  bucket: {
    'bucket-luxury-gold': true,
    'bucket-luxury-champagne': true,
    'bucket-luxury-emerald': true,
    'bucket-onepiece': true,
    'bucket-onepiece-2': true,
    'bucket-naruto': true,
    'bucket-kuromi': true,
    'bucket-totoro': true,
    'bucket-sailormoon': true,
    'bucket-pikachu': true,
    'bucket-hellokitty': true,
    'bucket-heart-box': true,
    'bucket-213-3': true,
    'bucket-213-10': true,
    'bucket-213-34': true,
  },
  card: {
    elegant: true,
    graduation: true,
    simple: false,
    birthday: false,
  },
  gift_template: {
    'kupu-kupu-harapan': true,
    'pesta-bintang': true,
    pernikahan: true,
    'cerita-kita': true,
    'film-kenangan': true,
    'album-surat': true,
    klasik: false,
    'taman-mekar': false,
  },
};

// In-memory fallback & cache store
interface VipCache {
  data: Record<VipCategory, Record<string, boolean>>;
  overrides: Record<VipCategory, Record<string, boolean>>;
  logs: VipAuditLogRecord[];
  timestamp: number;
}

const globalForVip = globalThis as unknown as {
  vipCache?: VipCache;
};

const CACHE_TTL_MS = 45 * 1000; // 45 detik cache in-memory

function getInitialVipState(): Record<VipCategory, Record<string, boolean>> {
  return {
    bucket: { ...DEFAULT_VIP_SEED.bucket },
    flower: { ...DEFAULT_VIP_SEED.flower },
    card: { ...DEFAULT_VIP_SEED.card },
    gift_template: { ...DEFAULT_VIP_SEED.gift_template },
  };
}

function getOverrides(): Record<VipCategory, Record<string, boolean>> {
  if (!globalForVip.vipCache) {
    globalForVip.vipCache = {
      data: getInitialVipState(),
      overrides: { bucket: {}, flower: {}, card: {}, gift_template: {} },
      logs: [],
      timestamp: 0,
    };
  } else if (!globalForVip.vipCache.overrides) {
    globalForVip.vipCache.overrides = { bucket: {}, flower: {}, card: {}, gift_template: {} };
  }
  return globalForVip.vipCache.overrides;
}

/**
 * Invalidate cache saat admin mengubah status
 */
export function invalidateVipCache(): void {
  if (globalForVip.vipCache) {
    globalForVip.vipCache.timestamp = 0;
  }
}

/**
 * Ambil seluruh status VIP item katalog dari Supabase (dengan cache in-memory)
 */
export async function getVipCatalog(): Promise<Record<VipCategory, Record<string, boolean>>> {
  const now = Date.now();
  if (globalForVip.vipCache && now - globalForVip.vipCache.timestamp < CACHE_TTL_MS) {
    return globalForVip.vipCache.data;
  }

  const result = getInitialVipState();
  const supabase = getAdminClient() || getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('vip_items')
        .select('category, item_key, is_vip');

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const cat = row.category as VipCategory;
          if (result[cat]) {
            result[cat][row.item_key] = Boolean(row.is_vip);
          }
        }
      }
    } catch (err) {
      console.warn('[vipItems] Supabase fetch warning, using seed fallback:', err);
    }
  }

  // Terapkan override in-memory (memastikan perubahan admin tetap sinkron)
  const overrides = getOverrides();
  for (const cat of ['bucket', 'flower', 'card', 'gift_template'] as VipCategory[]) {
    Object.assign(result[cat], overrides[cat]);
  }

  const existingLogs = globalForVip.vipCache?.logs || [];
  globalForVip.vipCache = {
    data: result,
    overrides,
    logs: existingLogs,
    timestamp: now,
  };

  return result;
}

/**
 * Ambil 20 log riwayat perubahan terakhir
 */
export async function getRecentVipLogs(): Promise<VipAuditLogRecord[]> {
  const supabase = getAdminClient() || getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('vip_items_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && Array.isArray(data)) {
        return data as VipAuditLogRecord[];
      }
    } catch {
      // Abaikan jika tabel belum dibuat
    }
  }

  return globalForVip.vipCache?.logs?.slice(0, 20) || [];
}

/**
 * Update status VIP suatu item di database dan catat log
 */
export async function updateVipItem(
  category: VipCategory,
  itemKey: string,
  isVip: boolean,
  updatedBy = 'admin',
  itemName?: string
): Promise<{ success: boolean; message?: string }> {
  const currentCatalog = await getVipCatalog();
  const oldStatus = Boolean(currentCatalog[category]?.[itemKey]);

  // Update in-memory state & overrides
  currentCatalog[category][itemKey] = isVip;
  const overrides = getOverrides();
  if (overrides[category]) {
    overrides[category][itemKey] = isVip;
  }

  const supabase = getAdminClient();
  const logRecord: VipAuditLogRecord = {
    category,
    item_key: itemKey,
    item_name: itemName || itemKey,
    old_status: oldStatus,
    new_status: isVip,
    changed_by: updatedBy,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      // Upsert ke vip_items
      const { error: upsertErr } = await supabase
        .from('vip_items')
        .upsert(
          {
            category,
            item_key: itemKey,
            is_vip: isVip,
            updated_at: new Date().toISOString(),
            updated_by: updatedBy,
          },
          { onConflict: 'category,item_key' }
        );

      if (upsertErr) {
        console.warn('[vipItems] Upsert error:', upsertErr.message);
      }

      // Insert ke vip_items_log
      await supabase.from('vip_items_log').insert(logRecord);
    } catch (err) {
      console.warn('[vipItems] Supabase update warning:', err);
    }
  }

  // Update memory logs
  if (globalForVip.vipCache) {
    globalForVip.vipCache.logs = [logRecord, ...(globalForVip.vipCache.logs || [])].slice(0, 30);
    globalForVip.vipCache.timestamp = 0; // force refresh on next call
  }

  return { success: true };
}

/**
 * Validasi apakah rangkaian buket (designData) mengandung item VIP bagi pengguna non-VIP.
 */
export async function validateDesignVipItems(
  designData: any,
  isUserVip: boolean,
  templateId?: string
): Promise<{ valid: boolean; violations: string[] }> {
  // Jika pengguna sudah memiliki akses VIP aktif, selalu izinkan
  if (isUserVip) {
    return { valid: true, violations: [] };
  }

  const catalog = await getVipCatalog();
  const violations: string[] = [];

  if (!designData || typeof designData !== 'object') {
    return { valid: true, violations: [] };
  }

  // 1. Cek Model Pembungkus / Bucket
  const bucketId = designData.bucketSize;
  if (bucketId && catalog.bucket[bucketId] === true) {
    const bucketInfo = BUCKET_SIZES.find((b) => b.id === bucketId);
    violations.push(bucketInfo ? `Pembungkus: ${bucketInfo.label}` : `Pembungkus VIP (${bucketId})`);
  }

  // 2. Cek Bunga-bunga yang dirangkai
  if (Array.isArray(designData.selectedFlowers)) {
    const seenFlowers = new Set<string>();
    for (const f of designData.selectedFlowers) {
      const flowerId = f.id || f.flowerId;
      if (flowerId && catalog.flower[flowerId] === true && !seenFlowers.has(flowerId)) {
        seenFlowers.add(flowerId);
        const flowerInfo = FLOWERS.find((fl) => fl.id === flowerId);
        violations.push(flowerInfo ? `Bunga: ${flowerInfo.name}` : `Bunga VIP (${flowerId})`);
      }
    }
  }

  // 3. Cek Gaya / Template Kartu Ucapan
  const cardStyle = designData.text?.cardStyle;
  if (cardStyle && catalog.card[cardStyle] === true) {
    violations.push(
      cardStyle === 'elegant' ? 'Kartu Ucapan: Luxury Gold Foil' : `Kartu Ucapan VIP (${cardStyle})`
    );
  }

  // 4. Cek Template Kado Digital jika ada
  const activeTemplate = templateId || designData.templateId || designData.giftTemplate;
  if (activeTemplate && catalog.gift_template[activeTemplate] === true) {
    const tpl = (GIFT_TEMPLATES as any)[activeTemplate];
    violations.push(tpl ? `Template Kado: ${tpl.name}` : `Template Kado VIP (${activeTemplate})`);
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
