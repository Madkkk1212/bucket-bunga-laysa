import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabase } from '@/lib/supabaseClient';

export interface PricingConfig {
  basePrice: number;       // Harga Asli / Normal (cth: 15.000)
  isPromoActive: boolean;  // Apakah promo sedang aktif
  promoPrice: number;      // Harga Promo Langsung yang Harus Dibayar (cth: 10.000)
  promoLabel: string;      // Label promo (cth: "Promo Terbatas")
  updatedAt?: string;
}

const configFilePath = path.join(process.cwd(), 'data', 'pricingConfig.json');

const DEFAULT_CONFIG: PricingConfig = {
  basePrice: 15000,
  isPromoActive: true,
  promoPrice: 10000,
  promoLabel: 'Promo Terbatas',
};

function readLocalConfig(): PricingConfig {
  try {
    if (fs.existsSync(configFilePath)) {
      const raw = fs.readFileSync(configFilePath, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        basePrice: Number(parsed.basePrice) || 15000,
        isPromoActive: Boolean(parsed.isPromoActive),
        promoPrice: Number(parsed.promoPrice ?? parsed.customPromoPrice) || 10000,
        promoLabel: parsed.promoLabel || 'Promo Terbatas',
        updatedAt: parsed.updatedAt,
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

// Menghitung otomatis potongan rupiah & persentase tanpa admin harus ngitung
function computePricing(cfg: PricingConfig) {
  const base = Math.max(0, Number(cfg.basePrice) || 10000);
  const promo = Math.max(0, Number(cfg.promoPrice) || base);

  let finalPrice = base;
  let hasDiscount = false;
  let discountNominalVal = 0;
  let discountPercentageVal = 0;
  let discountBadge = '';

  if (cfg.isPromoActive && promo < base) {
    finalPrice = promo;
    hasDiscount = true;
    discountNominalVal = base - promo;
    discountPercentageVal = Math.round((discountNominalVal / base) * 100);
    discountBadge = `Hemat ${discountPercentageVal}% (Potongan Rp ${discountNominalVal.toLocaleString('id-ID')})`;
  } else if (cfg.isPromoActive && promo > 0) {
    finalPrice = promo;
    hasDiscount = promo < base;
    discountBadge = cfg.promoLabel || 'Harga Spesial';
  }

  return {
    basePrice: base,
    promoPrice: promo,
    isPromoActive: Boolean(cfg.isPromoActive),
    promoLabel: cfg.promoLabel || 'Promo Terbatas',
    finalPrice,
    hasDiscount,
    discountAmount: discountNominalVal,
    discountPercentage: discountPercentageVal,
    discountBadge,
    updatedAt: cfg.updatedAt,
  };
}

// 1. GET: Ambil harga saat ini
export async function GET() {
  try {
    let currentConfig = readLocalConfig();
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('pricing_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (!error && data) {
          currentConfig = {
            basePrice: data.base_price ?? currentConfig.basePrice,
            isPromoActive: data.is_promo_active ?? currentConfig.isPromoActive,
            promoPrice: data.custom_promo_price ?? data.promo_price ?? currentConfig.promoPrice,
            promoLabel: data.promo_label ?? currentConfig.promoLabel,
            updatedAt: data.updated_at ?? currentConfig.updatedAt,
          };
        }
      } catch (sbErr) {
        // Fallback ke local file jika table belum ada
      }
    }

    const computed = computePricing(currentConfig);
    return NextResponse.json({ success: true, pricing: computed });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 2. POST: Simpan harga langsung tanpa perlu hitung persen (Admin Only)
export async function POST(req: Request) {
  try {
    // Defense-in-depth: cek admin key langsung di handler (Header, Cookie, atau Query)
    const adminKey = process.env.ADMIN_SECRET_KEY;
    if (adminKey) {
      const headerKey = req.headers.get('x-admin-key');
      const urlKey = new URL(req.url).searchParams.get('admin_key');
      const cookieHeader = req.headers.get('cookie') || '';
      const cookieKey = cookieHeader
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('laysa_admin_key='))
        ?.split('=')[1];

      const isAuthorized =
        headerKey === adminKey ||
        urlKey === adminKey ||
        cookieKey === adminKey;

      if (!isAuthorized) {
        return NextResponse.json(
          { success: false, message: 'Akses ditolak. Sesi admin tidak valid.' },
          { status: 401 }
        );
      }
    }

    const body = await req.json();

    const newConfig: PricingConfig = {
      basePrice: Math.max(0, Number(body.basePrice) || 10000),
      isPromoActive: Boolean(body.isPromoActive),
      promoPrice: Math.max(0, Number(body.promoPrice) || 10000),
      promoLabel: (body.promoLabel || 'Promo Terbatas').trim(),
      updatedAt: new Date().toISOString(),
    };

    // Simpan ke local file
    writeLocalConfig(newConfig);

    // Simpan ke Supabase jika ada
    const supabase = getSupabase();
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
          });
      } catch (sbErr) {
        console.error('Supabase pricing upsert warning:', sbErr);
      }
    }

    const computed = computePricing(newConfig);
    return NextResponse.json({
      success: true,
      message: 'Harga & promo berhasil diperbarui!',
      pricing: computed,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
