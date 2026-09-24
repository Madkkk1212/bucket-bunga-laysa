-- =========================================================================
-- MIGRATION 005: TABEL PENGATURAN HARGA DAN PROMO
-- Source: supabase_pricing_table.sql
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.pricing_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    base_price INTEGER DEFAULT 10000,
    is_promo_active BOOLEAN DEFAULT FALSE,
    discount_type TEXT DEFAULT 'percentage',
    discount_percentage INTEGER DEFAULT 50,
    discount_nominal INTEGER DEFAULT 3000,
    custom_promo_price INTEGER DEFAULT 7500,
    promo_label TEXT DEFAULT 'Promo Terbatas',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Public can view pricing ON public.pricing_settings;
CREATE POLICY Public can view pricing ON public.pricing_settings FOR SELECT USING (true);

-- Write hanya via service role (tidak ada publik write)
DROP POLICY IF EXISTS Public can update pricing ON public.pricing_settings;

INSERT INTO public.pricing_settings (id, base_price, is_promo_active, discount_percentage)
VALUES ('default', 10000, false, 50)
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
