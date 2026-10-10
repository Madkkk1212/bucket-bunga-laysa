-- =========================================================================
-- MIGRATION 014: TABEL MANAJEMEN STATUS ITEM VIP & RIWAYAT LOG AUDIT
-- Digunakan untuk fitur "Kelola VIP" di Panel Admin Laysa Atelier
-- =========================================================================

-- 1. Buat tipe enum untuk kategori jika belum ada
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vip_item_category') THEN
        CREATE TYPE vip_item_category AS ENUM ('bucket', 'flower', 'card', 'gift_template');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Buat tabel utama vip_items
CREATE TABLE IF NOT EXISTS public.vip_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('bucket', 'flower', 'card', 'gift_template')),
    item_key TEXT NOT NULL,
    is_vip BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by TEXT DEFAULT 'admin',
    CONSTRAINT vip_items_category_key_unique UNIQUE (category, item_key)
);

-- Index untuk query cepat per kategori & item_key
CREATE INDEX IF NOT EXISTS idx_vip_items_category ON public.vip_items(category);
CREATE INDEX IF NOT EXISTS idx_vip_items_is_vip ON public.vip_items(is_vip);

-- 3. Buat tabel log riwayat perubahan (20 log terakhir)
CREATE TABLE IF NOT EXISTS public.vip_items_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    item_key TEXT NOT NULL,
    item_name TEXT,
    old_status BOOLEAN NOT NULL,
    new_status BOOLEAN NOT NULL,
    changed_by TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vip_items_log_created_at ON public.vip_items_log(created_at DESC);

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE public.vip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_items_log ENABLE ROW LEVEL SECURITY;

-- Policy RLS: Klien publik hanya boleh membaca (SELECT)
DROP POLICY IF EXISTS "Public can view vip_items" ON public.vip_items;
CREATE POLICY "Public can view vip_items" ON public.vip_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view vip_items_log" ON public.vip_items_log;
CREATE POLICY "Public can view vip_items_log" ON public.vip_items_log FOR SELECT USING (true);

-- Catatan: Hanya service role (server-side getAdminClient) yang boleh INSERT/UPDATE/DELETE.
-- Tidak ada policy WRITE untuk peran anon/authenticated publik demi keamanan.

-- 5. Data Awal (Seed Data) dari katalog eksisting proyek
-- Supaya perilaku lama tidak berubah sebelum admin mengubahnya:
INSERT INTO public.vip_items (category, item_key, is_vip, updated_by)
VALUES
    -- BUNGA BOTANI (9 bunga VIP default)
    ('flower', 'calla_white', true, 'seed'),
    ('flower', 'hydrangea_blue', true, 'seed'),
    ('flower', 'hydrangea_purple', true, 'seed'),
    ('flower', 'iris_purple', true, 'seed'),
    ('flower', 'orchid_pink', true, 'seed'),
    ('flower', 'protea_pink', true, 'seed'),
    ('flower', 'ranunculus_pink', true, 'seed'),
    ('flower', 'tulip_pink', true, 'seed'),
    ('flower', 'tulip_purple', true, 'seed'),

    -- PEMBUNGKUS / BUKET (15 model VIP default)
    ('bucket', 'bucket-luxury-gold', true, 'seed'),
    ('bucket', 'bucket-luxury-champagne', true, 'seed'),
    ('bucket', 'bucket-luxury-emerald', true, 'seed'),
    ('bucket', 'bucket-onepiece', true, 'seed'),
    ('bucket', 'bucket-onepiece-2', true, 'seed'),
    ('bucket', 'bucket-naruto', true, 'seed'),
    ('bucket', 'bucket-kuromi', true, 'seed'),
    ('bucket', 'bucket-totoro', true, 'seed'),
    ('bucket', 'bucket-sailormoon', true, 'seed'),
    ('bucket', 'bucket-pikachu', true, 'seed'),
    ('bucket', 'bucket-hellokitty', true, 'seed'),
    ('bucket', 'bucket-heart-box', true, 'seed'),
    ('bucket', 'bucket-213-3', true, 'seed'),
    ('bucket', 'bucket-213-10', true, 'seed'),
    ('bucket', 'bucket-213-34', true, 'seed'),

    -- KARTU UCAPAN (Gaya Gold Foil & Template Wisuda default)
    ('card', 'elegant', true, 'seed'),
    ('card', 'graduation', true, 'seed'),
    ('card', 'simple', false, 'seed'),
    ('card', 'birthday', false, 'seed'),

    -- TEMPLATE KADO DIGITAL (6 template VIP default)
    ('gift_template', 'kupu-kupu-harapan', true, 'seed'),
    ('gift_template', 'pesta-bintang', true, 'seed'),
    ('gift_template', 'pernikahan', true, 'seed'),
    ('gift_template', 'cerita-kita', true, 'seed'),
    ('gift_template', 'film-kenangan', true, 'seed'),
    ('gift_template', 'album-surat', true, 'seed'),
    ('gift_template', 'klasik', false, 'seed'),
    ('gift_template', 'taman-mekar', false, 'seed')
ON CONFLICT (category, item_key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
