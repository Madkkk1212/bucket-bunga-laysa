-- =========================================================================
-- MIGRATION 001: CORE SCHEMA
-- Tabel inti: access_codes, digital_gifts, RLS dasar, index, seed data
-- Source: supabase_schema.sql
-- =========================================================================

-- 1. TABEL KODE AKSES PREMIUM
CREATE TABLE IF NOT EXISTS public.access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_uses INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    used_by_name TEXT,
    claimed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON public.access_codes(code);

-- 2. TABEL BUKET HADIAH DIGITAL
CREATE TABLE IF NOT EXISTS public.digital_gifts (
    id TEXT PRIMARY KEY,
    sender_name TEXT,
    recipient_name TEXT,
    message TEXT,
    music_track TEXT DEFAULT 'romantic-piano',
    design_data JSONB NOT NULL,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_digital_gifts_id ON public.digital_gifts(id);

-- 3. RLS
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY Public can verify active access codes ON public.access_codes FOR SELECT USING (is_active = TRUE);
CREATE POLICY Public can update access codes on claim ON public.access_codes FOR UPDATE USING (is_active = TRUE) WITH CHECK (is_active = TRUE);
CREATE POLICY Public can view digital gifts ON public.digital_gifts FOR SELECT USING (true);
CREATE POLICY Public can create digital gifts ON public.digital_gifts FOR INSERT WITH CHECK (true);

-- 4. SEED DATA
INSERT INTO public.access_codes (code, is_active, notes) VALUES
    ('LAYSA-VIP', true, 'Kode Master VIP Resmi Laysa'),
    ('BUKET2026', true, 'Kode Promo Spesial 2026'),
    ('PREMIUM-LOVE', true, 'Kode Edisi Valentine dan Hadiah')
ON CONFLICT (code) DO NOTHING;
