-- =========================================================================
-- MIGRATION 009: MULTI-TIER PRICING & FLOWER STREAK GARDEN
-- Menambahkan tier akses (daily, weekly, lifetime), sistem kedaluwarsa,
-- dan tabel kebun bunga harian (streak ala api TikTok berdua/solo).
-- =========================================================================

-- 1. EXTEND ACCESS CODES UNTUK MULTI-TIER
ALTER TABLE public.access_codes
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'lifetime',
ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS has_garden_access BOOLEAN DEFAULT TRUE;

-- Update kode yang sudah ada agar bertipe lifetime & punya akses kebun
UPDATE public.access_codes
SET tier = 'lifetime',
    duration_days = 0,
    has_garden_access = TRUE
WHERE tier IS NULL;

-- 2. EXTEND PRICING SETTINGS UNTUK MENYIMPAN JSON MULTI-TIER
ALTER TABLE public.pricing_settings
ADD COLUMN IF NOT EXISTS tiers_data JSONB;

-- 3. TABEL KEBUAN BUNGA HARIAN (FLOWER STREAK GARDEN)
CREATE TABLE IF NOT EXISTS public.flower_gardens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garden_code TEXT UNIQUE NOT NULL,
    garden_name TEXT NOT NULL,
    flower_type TEXT DEFAULT 'rose_red',
    growth_stage INTEGER DEFAULT 1,
    streak_count INTEGER DEFAULT 1,
    owner_name TEXT NOT NULL,
    owner_device_id TEXT NOT NULL,
    partner_name TEXT,
    partner_device_id TEXT,
    last_watered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_watered_by TEXT,
    watered_today BOOLEAN DEFAULT TRUE,
    daily_notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_flower_gardens_code ON public.flower_gardens(garden_code);
CREATE INDEX IF NOT EXISTS idx_flower_gardens_owner_dev ON public.flower_gardens(owner_device_id);
CREATE INDEX IF NOT EXISTS idx_flower_gardens_partner_dev ON public.flower_gardens(partner_device_id);

-- RLS untuk flower_gardens
ALTER TABLE public.flower_gardens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read flower gardens" ON public.flower_gardens;
CREATE POLICY "Public can read flower gardens" ON public.flower_gardens FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert flower gardens" ON public.flower_gardens;
CREATE POLICY "Public can insert flower gardens" ON public.flower_gardens FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update flower gardens" ON public.flower_gardens;
CREATE POLICY "Public can update flower gardens" ON public.flower_gardens FOR UPDATE USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
