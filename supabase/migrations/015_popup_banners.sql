-- =========================================================================
-- MIGRATION 015: TABEL POPUP BANNER PROMO / ONBOARDING (MAKSIMAL 3 SLIDE)
-- =========================================================================

-- 1. Buat tabel utama popup_banners
CREATE TABLE IF NOT EXISTS public.popup_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT DEFAULT '',
    link_url TEXT DEFAULT '',
    display_order INT NOT NULL DEFAULT 1 CHECK (display_order >= 1 AND display_order <= 3),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_popup_banners_order ON public.popup_banners(display_order);
CREATE INDEX IF NOT EXISTS idx_popup_banners_active ON public.popup_banners(is_active);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.popup_banners ENABLE ROW LEVEL SECURITY;

-- Policy RLS: Publik hanya boleh membaca (SELECT) banner yang aktif
DROP POLICY IF EXISTS "Public can view active popup_banners" ON public.popup_banners;
CREATE POLICY "Public can view active popup_banners" ON public.popup_banners
    FOR SELECT USING (is_active = true);

-- 3. Siapkan Storage Bucket jika ekstensi storage aktif
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('popup-banners', 'popup-banners', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
EXCEPTION
    WHEN OTHERS THEN
        -- Abaikan jika skema storage tidak tersedia di project
        NULL;
END $$;

-- Policy Storage: Publik diizinkan membaca file di bucket popup-banners
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view popup banners storage" ON storage.objects;
    CREATE POLICY "Public can view popup banners storage" ON storage.objects
        FOR SELECT USING (bucket_id = 'popup-banners');
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

NOTIFY pgrst, 'reload schema';
