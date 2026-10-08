import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabase } from '@/lib/supabaseClient';
import { getAdminClient } from '@/utils/supabase/admin';

export type PricingTierKey = 'daily' | 'weekly' | 'lifetime' | string;

export interface TierConfig {
  key: string;
  name: string;
  durationLabel: string;
  durationDays: number; // 1 = 24 jam, 7 = 7 hari, 0 = selamanya (Studio VIP)
  linkDurationDays: number | null; // Masa aktif link kado: misal 1, 7, 30, atau 0/null = selamanya
  basePrice: number;
  promoPrice: number;
  isPromoActive: boolean;
  isActive: boolean; // Bisa dinonaktifkan admin jika tidak ingin dijual
  isDisplayed?: boolean; // Tampilkan atau sembunyikan di modal beli VIP pengunjung
  badge?: string;
  gardenAccess: boolean; // Eksklusif kebun bunga
  features: string[];
  isCustom?: boolean;
}

export interface PricingConfig {
  freeLinkDurationDays: number; // Masa aktif tautan kado digital untuk akun gratis (default 3 hari)
  gardenSize: number;
  gardenFieldSize: number;
  gardenExpansionPrice: number;
  basePrice: number;       // Legacy / default lifetime price fallback
  isPromoActive: boolean;  // Legacy
  promoPrice: number;      // Legacy
  promoLabel: string;      // Legacy
  updatedAt?: string;
  tiers: Record<string, TierConfig>;
}

export const DEFAULT_TIERS: Record<string, TierConfig> = {
  daily: {
    key: 'daily',
    name: 'Paket Harian (24 Jam)',
    durationLabel: '24 Jam',
    durationDays: 1,
    linkDurationDays: 1,
    basePrice: 10000,
    promoPrice: 5000,
    isPromoActive: true,
    isActive: true,
    isDisplayed: true,
    badge: 'Terjangkau & Praktis',
    gardenAccess: false,
    features: [
      'Buka seluruh 100+ koleksi bunga & pembungkus buket',
      'Masa aktif 24 jam bebas rangkai & unduh sepuasnya',
      'Link kado interaktif aktif 24 Jam',
      'Bisa terhubung hingga 5 perangkat bersamaan',
      'Unduh hasil buket jernih beresolusi HD',
      'Akses instan tanpa ribet daftar akun',
    ],
  },
  weekly: {
    key: 'weekly',
    name: 'Paket Mingguan (7 Hari)',
    durationLabel: '7 Hari',
    durationDays: 7,
    linkDurationDays: 7,
    basePrice: 25000,
    promoPrice: 12000,
    isPromoActive: true,
    isActive: true,
    isDisplayed: true,
    badge: 'Paling Hemat (Diskon 52%)',
    gardenAccess: false,
    features: [
      'Buka seluruh 100+ koleksi bunga & pembungkus buket',
      'Masa aktif 7 hari penuh (Ideal untuk kado, wisuda & ultah)',
      'Link kado interaktif aktif 7 Hari',
      'Bebas edit & simpan berbagai rancangan buket kapan saja',
      'Bisa terhubung hingga 5 perangkat bersamaan',
      'Jauh lebih hemat dibanding beli paket harian berulang kali',
    ],
  },
  lifetime: {
    key: 'lifetime',
    name: 'Paket Selamanya (VIP Sultan)',
    durationLabel: 'Selamanya',
    durationDays: 0,
    linkDurationDays: 0, // 0 = Selamanya / Tanpa kedaluwarsa
    basePrice: 85000,
    promoPrice: 25000,
    isPromoActive: true,
    isActive: true,
    isDisplayed: true,
    badge: '👑 Terpopuler & Lengkap',
    gardenAccess: true,
    features: [
      'Akses VIP permanen SELAMANYA (sekali bayar tanpa langganan)',
      'Link kado interaktif SELAMANYA / Permanen (Tanpa Expired)',
      'Ekspor Kualitas Tertinggi Ultra HD 4K & Stiker WA (Transparan)',
      'Kartu Ucapan Kaligrafi Eksklusif & Ornamen Pita Mewah',
      'Bisa terhubung hingga 5 perangkat bersama keluarga / pasangan',
      'Akses gratis ke seluruh varian bunga & buket baru di masa depan',
    ],
  },
};

const configFilePath = path.join(process.cwd(), 'data', 'pricingConfig.json');

const DEFAULT_CONFIG: PricingConfig = {
  freeLinkDurationDays: 3,
  gardenSize: 5,
  gardenFieldSize: 8,
  gardenExpansionPrice: 0,
  basePrice: 85000,
  isPromoActive: true,
  promoPrice: 25000,
  promoLabel: 'Promo Terbatas',
  tiers: DEFAULT_TIERS,
};

function readLocalConfig(): PricingConfig {
  try {
    if (fs.existsSync(configFilePath)) {
      const raw = fs.readFileSync(configFilePath, 'utf-8');
      const parsed = JSON.parse(raw);
      
      const loadedTiers = parsed.tiers || {};
      const mergedTiers: Record<string, TierConfig> = { ...DEFAULT_TIERS };

      // Merge standard tiers with saved data
      (['daily', 'weekly', 'lifetime']).forEach((k) => {
        if (loadedTiers[k]) {
          mergedTiers[k] = {
            ...DEFAULT_TIERS[k],
            ...loadedTiers[k],
          };
        }
      });

      // Also merge any CUSTOM tiers added by admin
      Object.keys(loadedTiers).forEach((k) => {
        if (!['daily', 'weekly', 'lifetime'].includes(k)) {
          mergedTiers[k] = {
            ...loadedTiers[k],
            isCustom: true,
          };
        }
      });

      const freeLinkDurationDays = typeof parsed.freeLinkDurationDays === 'number'
        ? Math.max(1, parsed.freeLinkDurationDays)
        : 3;

      return {
        freeLinkDurationDays,
        gardenSize: Math.max(5, Math.min(10, Math.floor(Number(parsed.gardenSize) || 5))),
        gardenFieldSize: Math.max(8, Math.min(16, Math.floor(Number(parsed.gardenFieldSize) || 8))),
        gardenExpansionPrice: Math.max(0, Number(parsed.gardenExpansionPrice) || 0),
        basePrice: Number(parsed.basePrice) || mergedTiers.lifetime.basePrice,
        isPromoActive: Boolean(parsed.isPromoActive),
        promoPrice: Number(parsed.promoPrice ?? parsed.customPromoPrice) || mergedTiers.lifetime.promoPrice,
        promoLabel: parsed.promoLabel || 'Promo Terbatas',
        updatedAt: parsed.updatedAt,
        tiers: mergedTiers,
      };
    }
  } catch (err) {
    console.error('Error reading pricing config file:', err);
  }
  return DEFAULT_CONFIG;
}

function writeLocalConfig(cfg: PricingConfig) {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing pricing config file:', err);
  }
}

// Menghitung otomatis potongan rupiah & persentase tiap tier tanpa admin harus ngitung
function computePricing(cfg: PricingConfig) {
  const tiers = cfg.tiers || DEFAULT_TIERS;
  const computedTiers: Record<string, any> = {};

  Object.keys(tiers).forEach((key) => {
    const tier = tiers[key];
    const base = Math.max(0, Number(tier.basePrice) || 0);
    const promo = Math.max(0, Number(tier.promoPrice) || base);
    const isPromo = Boolean(tier.isPromoActive) && promo < base && promo > 0;
    const finalPrice = isPromo ? promo : base;
    const discountAmount = isPromo ? base - promo : 0;
    const discountPercentage = (isPromo && base > 0) ? Math.round((discountAmount / base) * 100) : 0;
    const discountBadge = isPromo ? `Hemat ${discountPercentage}% (Potongan Rp ${discountAmount.toLocaleString('id-ID')})` : '';

    computedTiers[key] = {
      ...tier,
      basePrice: base,
      promoPrice: promo,
      finalPrice,
      hasDiscount: isPromo,
      discountAmount,
      discountPercentage,
      discountBadge: tier.badge || discountBadge,
      linkDurationDays: tier.linkDurationDays !== undefined ? tier.linkDurationDays : (key === 'daily' ? 1 : key === 'weekly' ? 7 : 0),
      isDisplayed: tier.isDisplayed !== false,
      isActive: tier.isActive !== false,
    };
  });

  // Legacy fallback (menggunakan tier lifetime atau base legacy)
  const lifetimeTier = computedTiers.lifetime;
  const base = lifetimeTier ? lifetimeTier.basePrice : Math.max(0, Number(cfg.basePrice) || 10000);
  const promo = lifetimeTier ? lifetimeTier.promoPrice : Math.max(0, Number(cfg.promoPrice) || base);
  const finalPrice = lifetimeTier ? lifetimeTier.finalPrice : promo;

  return {
    freeLinkDurationDays: cfg.freeLinkDurationDays || 3,
    gardenSize: Math.max(5, Math.min(10, Math.floor(Number(cfg.gardenSize) || 5))),
    gardenFieldSize: Math.max(8, Math.min(16, Math.floor(Number(cfg.gardenFieldSize) || 8))),
    gardenExpansionPrice: Math.max(0, Number(cfg.gardenExpansionPrice) || 0),
    basePrice: base,
    promoPrice: promo,
    isPromoActive: Boolean(cfg.isPromoActive),
    promoLabel: cfg.promoLabel || 'Promo Terbatas',
    finalPrice,
    hasDiscount: lifetimeTier ? lifetimeTier.hasDiscount : promo < base,
    discountAmount: lifetimeTier ? lifetimeTier.discountAmount : (base - promo),
    discountPercentage: lifetimeTier ? lifetimeTier.discountPercentage : Math.round(((base - promo) / base) * 100),
    discountBadge: lifetimeTier ? lifetimeTier.discountBadge : cfg.promoLabel || 'Harga Spesial',
    updatedAt: cfg.updatedAt,
    tiers: computedTiers,
  };
}

// 1. GET: Ambil harga saat ini (lengkap dengan tier harian, mingguan, selamanya, custom vouchers, dan durasi free)
export async function GET() {
  try {
    let currentConfig = readLocalConfig();
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('pricing_settings')
          .select('base_price, is_promo_active, custom_promo_price, promo_label, updated_at, tiers_data')
          .eq('id', 'default')
          .maybeSingle();

        if (!error && data) {
          let mergedTiers = { ...currentConfig.tiers };
          if (data.tiers_data && typeof data.tiers_data === 'object') {
            const rawTiers = data.tiers_data;
            if (rawTiers._freeLinkDurationDays !== undefined) {
              currentConfig.freeLinkDurationDays = Number(rawTiers._freeLinkDurationDays) || 3;
            }
            if (rawTiers._gardenSize !== undefined) {
              currentConfig.gardenSize = Math.max(5, Math.min(10, Math.floor(Number(rawTiers._gardenSize) || 5)));
            }
            if (rawTiers._gardenFieldSize !== undefined) {
              currentConfig.gardenFieldSize = Math.max(8, Math.min(16, Math.floor(Number(rawTiers._gardenFieldSize) || 8)));
            }
            if (rawTiers._gardenExpansionPrice !== undefined) {
              currentConfig.gardenExpansionPrice = Math.max(0, Number(rawTiers._gardenExpansionPrice) || 0);
            }
            Object.keys(rawTiers).forEach((k) => {
              if (!k.startsWith('_')) {
                mergedTiers[k] = {
                  ...(mergedTiers[k] || {}),
                  ...rawTiers[k],
                };
              }
            });
          }

          currentConfig = {
          freeLinkDurationDays: currentConfig.freeLinkDurationDays,
          gardenSize: currentConfig.gardenSize,
          gardenFieldSize: currentConfig.gardenFieldSize,
          gardenExpansionPrice: currentConfig.gardenExpansionPrice,
            basePrice: data.base_price ?? currentConfig.basePrice,
            isPromoActive: data.is_promo_active ?? currentConfig.isPromoActive,
            promoPrice: data.custom_promo_price ?? currentConfig.promoPrice,
            promoLabel: data.promo_label ?? currentConfig.promoLabel,
            updatedAt: data.updated_at ?? currentConfig.updatedAt,
            tiers: mergedTiers,
          };
        }
      } catch (sbErr) {
        // Fallback ke local file jika table belum di-migrate
      }
    }

    const computed = computePricing(currentConfig);
    return NextResponse.json({ success: true, pricing: computed });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 2. POST: Simpan harga langsung (Multi-tier + Custom Vouchers + Free Duration)
export async function POST(req: Request) {
  try {
    const adminKey = process.env.ADMIN_SECRET_KEY;
    if (adminKey) {
      const headerKey = req.headers.get('x-admin-key');
      const cookieHeader = req.headers.get('cookie') || '';
      const cookieKey = cookieHeader
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('laysa_admin_key='))
        ?.split('=')[1];

      const isAuthorized = headerKey === adminKey || cookieKey === adminKey;

      if (!isAuthorized) {
        return NextResponse.json(
          { success: false, message: 'Akses ditolak. Sesi admin tidak valid.' },
          { status: 401 }
        );
      }
    }

    const body = await req.json();

    // Baca config lama sebagai basis
    const prevConfig = readLocalConfig();
    const prevTiers = prevConfig.tiers || DEFAULT_TIERS;

    // Support payload baru dengan object 'tiers' dinamis (bisa ada custom voucher baru atau voucher dihapus)
    let newTiers: Record<string, TierConfig> = {};

    if (body.tiers && typeof body.tiers === 'object') {
      Object.keys(body.tiers).forEach((key) => {
        const item = body.tiers[key];
        const prevItem = prevTiers[key] || {};
        newTiers[key] = {
          ...prevItem,
          ...item,
          key: key,
          name: item.name || prevItem.name || key,
          durationLabel: item.durationLabel || prevItem.durationLabel || '',
          durationDays: item.durationDays !== undefined ? Number(item.durationDays) : (prevItem.durationDays ?? 0),
          linkDurationDays: item.linkDurationDays !== undefined ? (item.linkDurationDays === null ? null : Number(item.linkDurationDays)) : (prevItem.linkDurationDays ?? 0),
          basePrice: Math.max(0, Number(item.basePrice) || prevItem.basePrice || 10000),
          promoPrice: Math.max(0, Number(item.promoPrice) || prevItem.promoPrice || 5000),
          isPromoActive: Boolean(item.isPromoActive),
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
          isDisplayed: item.isDisplayed !== undefined ? Boolean(item.isDisplayed) : true,
          badge: item.badge || prevItem.badge || '',
          gardenAccess: item.gardenAccess !== undefined ? Boolean(item.gardenAccess) : false,
          features: Array.isArray(item.features) ? item.features : (prevItem.features || []),
          isCustom: item.isCustom !== undefined ? Boolean(item.isCustom) : !['daily', 'weekly', 'lifetime'].includes(key),
        };
      });
    } else {
      newTiers = { ...prevTiers };
    }

    // Pastikan 3 default tiers selalu ada jika terhapus tidak sengaja
    (['daily', 'weekly', 'lifetime']).forEach((defKey) => {
      if (!newTiers[defKey]) {
        newTiers[defKey] = DEFAULT_TIERS[defKey];
      }
    });

    const freeLinkDurationDays = body.freeLinkDurationDays !== undefined
      ? Math.max(1, Number(body.freeLinkDurationDays) || 3)
      : prevConfig.freeLinkDurationDays || 3;
    const gardenSize = body.gardenSize !== undefined
      ? Math.max(5, Math.min(10, Math.floor(Number(body.gardenSize) || 5)))
      : prevConfig.gardenSize || 5;
    const gardenFieldSize = body.gardenFieldSize !== undefined
      ? Math.max(8, Math.min(16, Math.floor(Number(body.gardenFieldSize) || 8)))
      : prevConfig.gardenFieldSize || 8;
    const gardenExpansionPrice = body.gardenExpansionPrice !== undefined
      ? Math.max(0, Math.floor(Number(body.gardenExpansionPrice) || 0))
      : prevConfig.gardenExpansionPrice || 0;

    const lifetimeBasePrice = newTiers.lifetime?.basePrice || 85000;
    const lifetimePromoPrice = newTiers.lifetime?.promoPrice || 25000;
    const lifetimePromoActive = Boolean(newTiers.lifetime?.isPromoActive);

    const newConfig: PricingConfig = {
      freeLinkDurationDays,
      gardenSize,
      gardenFieldSize,
      gardenExpansionPrice,
      basePrice: lifetimeBasePrice,
      isPromoActive: lifetimePromoActive,
      promoPrice: lifetimePromoPrice,
      promoLabel: (body.promoLabel || newTiers.lifetime?.badge || 'Promo Terbatas').trim(),
      updatedAt: new Date().toISOString(),
      tiers: newTiers,
    };

    // Simpan ke local file
    writeLocalConfig(newConfig);

    // Simpan ke Supabase jika ada
    const supabase = getAdminClient() || getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('pricing_settings')
          .upsert({
            id: 'default',
            base_price: newConfig.basePrice,
            is_promo_active: newConfig.isPromoActive,
            custom_promo_price: newConfig.promoPrice,
            promo_label: newConfig.promoLabel,
            updated_at: newConfig.updatedAt,
            tiers_data: {
              ...newConfig.tiers,
              _freeLinkDurationDays: newConfig.freeLinkDurationDays,
              _gardenSize: newConfig.gardenSize,
              _gardenFieldSize: newConfig.gardenFieldSize,
              _gardenExpansionPrice: newConfig.gardenExpansionPrice,
            },
          });
      } catch (sbErr) {
        console.error('Supabase pricing upsert warning:', sbErr);
      }
    }

    const computed = computePricing(newConfig);
    return NextResponse.json({
      success: true,
      message: 'Semua pengaturan harga, masa aktif, dan voucher berhasil disimpan!',
      pricing: computed,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
