import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabase } from '@/lib/supabaseClient';
import { getAdminClient } from '@/utils/supabase/admin';

export type PricingTierKey = 'daily' | 'weekly' | 'lifetime';

export interface TierConfig {
  key: PricingTierKey;
  name: string;
  durationLabel: string;
  durationDays: number; // 1 = 24 jam, 7 = 7 hari, 0 = selamanya
  basePrice: number;
  promoPrice: number;
  isPromoActive: boolean;
  isActive: boolean; // Bisa dinonaktifkan admin jika tidak ingin dijual
  badge?: string;
  gardenAccess: boolean; // Eksklusif kebun bunga
  features: string[];
}

export interface PricingConfig {
  basePrice: number;       // Legacy / default lifetime price fallback
  isPromoActive: boolean;  // Legacy
  promoPrice: number;      // Legacy
  promoLabel: string;      // Legacy
  updatedAt?: string;
  tiers?: Record<PricingTierKey, TierConfig>;
}

export const DEFAULT_TIERS: Record<PricingTierKey, TierConfig> = {
  daily: {
    key: 'daily',
    name: 'Paket Harian (24 Jam)',
    durationLabel: '24 Jam',
    durationDays: 1,
    basePrice: 10000,
    promoPrice: 5000,
    isPromoActive: true,
    isActive: true,
    badge: 'Terjangkau & Praktis',
    gardenAccess: false,
    features: [
      'Buka seluruh 100+ koleksi bunga & pembungkus buket',
      'Masa aktif 24 jam bebas rangkai & unduh sepuasnya',
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
    basePrice: 25000,
    promoPrice: 12000,
    isPromoActive: true,
    isActive: true,
    badge: 'Paling Hemat (Diskon 52%)',
    gardenAccess: false,
    features: [
      'Buka seluruh 100+ koleksi bunga & pembungkus buket',
      'Masa aktif 7 hari penuh (Ideal untuk kado, wisuda & ultah)',
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
    basePrice: 85000,
    promoPrice: 25000,
    isPromoActive: true,
    isActive: true,
    badge: '👑 Terpopuler & Lengkap',
    gardenAccess: true,
    features: [
      'Akses VIP permanen SELAMANYA (sekali bayar tanpa langganan)',
      '🌸 EKSKLUSIF: Buka Fitur Kebun Bunga Harian Streak 🔥 (Solo / Pasangan)',
      'Ekspor Kualitas Tertinggi Ultra HD 4K & Stiker WA (Transparan)',
      'Kartu Ucapan Kaligrafi Eksklusif & Ornamen Pita Mewah',
      'Bisa terhubung hingga 5 perangkat bersama keluarga / pasangan',
      'Akses gratis ke seluruh varian bunga & buket baru di masa depan',
    ],
  },
};

const configFilePath = path.join(process.cwd(), 'data', 'pricingConfig.json');

const DEFAULT_CONFIG: PricingConfig = {
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
      
      // Merge tiers dengan DEFAULT_TIERS agar safe jika file lama belum punya format tiers
      const loadedTiers = parsed.tiers || {};
      const mergedTiers: Record<PricingTierKey, TierConfig> = {
        daily: { ...DEFAULT_TIERS.daily, ...(loadedTiers.daily || {}) },
        weekly: { ...DEFAULT_TIERS.weekly, ...(loadedTiers.weekly || {}) },
        lifetime: {
          ...DEFAULT_TIERS.lifetime,
          basePrice: Number(parsed.basePrice) || DEFAULT_TIERS.lifetime.basePrice,
          promoPrice: Number(parsed.promoPrice ?? parsed.customPromoPrice) || DEFAULT_TIERS.lifetime.promoPrice,
          isPromoActive: parsed.isPromoActive !== undefined ? Boolean(parsed.isPromoActive) : DEFAULT_TIERS.lifetime.isPromoActive,
          ...(loadedTiers.lifetime || {}),
        },
      };

      return {
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

  (Object.keys(DEFAULT_TIERS) as PricingTierKey[]).forEach((key) => {
    const tier = tiers[key] || DEFAULT_TIERS[key];
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
    };
  });

  // Legacy fallback (menggunakan tier lifetime atau base legacy)
  const lifetimeTier = computedTiers.lifetime;
  const base = lifetimeTier ? lifetimeTier.basePrice : Math.max(0, Number(cfg.basePrice) || 10000);
  const promo = lifetimeTier ? lifetimeTier.promoPrice : Math.max(0, Number(cfg.promoPrice) || base);
  const finalPrice = lifetimeTier ? lifetimeTier.finalPrice : promo;

  return {
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

// 1. GET: Ambil harga saat ini (lengkap dengan tier harian, mingguan, selamanya)
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
          let mergedTiers = currentConfig.tiers || DEFAULT_TIERS;
          if (data.tiers_data && typeof data.tiers_data === 'object') {
            mergedTiers = {
              daily: { ...DEFAULT_TIERS.daily, ...(data.tiers_data.daily || {}) },
              weekly: { ...DEFAULT_TIERS.weekly, ...(data.tiers_data.weekly || {}) },
              lifetime: { ...DEFAULT_TIERS.lifetime, ...(data.tiers_data.lifetime || {}) },
            };
          }

          currentConfig = {
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

// 2. POST: Simpan harga langsung (Multi-tier + Legacy Admin Support)
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

    // Support payload baru dengan object 'tiers' atau fallback dari input single-price
    let newTiers: Record<PricingTierKey, TierConfig> = { ...prevTiers };
    if (body.tiers && typeof body.tiers === 'object') {
      (['daily', 'weekly', 'lifetime'] as PricingTierKey[]).forEach((key) => {
        if (body.tiers[key]) {
          newTiers[key] = {
            ...prevTiers[key],
            ...body.tiers[key],
            basePrice: Math.max(0, Number(body.tiers[key].basePrice) || prevTiers[key].basePrice),
            promoPrice: Math.max(0, Number(body.tiers[key].promoPrice) || prevTiers[key].promoPrice),
            isPromoActive: Boolean(body.tiers[key].isPromoActive),
            isActive: body.tiers[key].isActive !== undefined ? Boolean(body.tiers[key].isActive) : true,
          };
        }
      });
    }

    // Jika admin hanya mengupdate basePrice legacy (misal dari form lama)
    if (body.basePrice !== undefined && (!body.tiers || !body.tiers.lifetime)) {
      newTiers.lifetime = {
        ...newTiers.lifetime,
        basePrice: Math.max(0, Number(body.basePrice) || newTiers.lifetime.basePrice),
        promoPrice: Math.max(0, Number(body.promoPrice) || newTiers.lifetime.promoPrice),
        isPromoActive: Boolean(body.isPromoActive),
      };
    }

    const newConfig: PricingConfig = {
      basePrice: newTiers.lifetime.basePrice,
      isPromoActive: newTiers.lifetime.isPromoActive,
      promoPrice: newTiers.lifetime.promoPrice,
      promoLabel: (body.promoLabel || newTiers.lifetime.badge || 'Promo Terbatas').trim(),
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
            tiers_data: newConfig.tiers,
          });
      } catch (sbErr) {
        console.error('Supabase pricing upsert warning:', sbErr);
      }
    }

    const computed = computePricing(newConfig);
    return NextResponse.json({
      success: true,
      message: 'Harga & paket VIP berhasil diperbarui!',
      pricing: computed,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
