-- ===========================================================================
-- MIGRATION 011: GIFT LINK v2
-- Semua perubahan bersifat additive — data dan kado lama tidak terganggu.
-- Kado tanpa config → tampilkan template "klasik" (tampilan saat ini).
-- ===========================================================================

-- 1. Tambah kolom baru ke digital_gifts (semua nullable = backward-safe)
ALTER TABLE public.digital_gifts
  ADD COLUMN IF NOT EXISTS config         JSONB         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS expires_at     TIMESTAMPTZ   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_reported    BOOLEAN       DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS scheduled_open_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_digital_gifts_expires
  ON public.digital_gifts(expires_at)
  WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_digital_gifts_reported
  ON public.digital_gifts(is_reported)
  WHERE is_reported = TRUE;

-- 2. Tambah kolom link_duration_days ke access_codes
--    0 = tidak kedaluwarsa (lifetime), N = kedaluwarsa setelah N hari dari dibuat
--    NULL = ikut default tier (lihat gift_limits di kode)
ALTER TABLE public.access_codes
  ADD COLUMN IF NOT EXISTS link_duration_days INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS max_photos         INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS can_use_youtube    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allowed_templates  TEXT[]  DEFAULT ARRAY['klasik','taman-mekar'];

-- Update kode yang sudah ada agar premium dengan akses penuh
UPDATE public.access_codes
SET
  link_duration_days = NULL,   -- lifetime untuk semua kode lama
  max_photos         = 6,
  can_use_youtube    = TRUE,
  allowed_templates  = ARRAY['klasik','taman-mekar','kupu-kupu-harapan','pesta-bintang']
WHERE allowed_templates IS NULL OR allowed_templates = '{}';

-- 3. Tabel foto kado (privat, akses via signed URL dari API)
CREATE TABLE IF NOT EXISTS public.gift_photos (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id       TEXT        NOT NULL REFERENCES public.digital_gifts(id) ON DELETE CASCADE,
  storage_path  TEXT        NOT NULL,   -- path acak di bucket gift-photos
  alt_text      TEXT,                   -- opsional dari pengirim
  display_order SMALLINT    DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gift_photos_gift_id ON public.gift_photos(gift_id);

ALTER TABLE public.gift_photos ENABLE ROW LEVEL SECURITY;

-- Foto hanya bisa dilihat jika kado tidak dilaporkan dan belum expired
CREATE POLICY "Photos visible for valid gifts"
  ON public.gift_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.digital_gifts dg
      WHERE dg.id = gift_photos.gift_id
        AND (dg.is_reported IS FALSE OR dg.is_reported IS NULL)
        AND (dg.expires_at IS NULL OR dg.expires_at > now())
    )
  );

-- Upload hanya lewat service role API (tidak ada INSERT policy untuk anon)

-- 4. Tabel laporan kado
CREATE TABLE IF NOT EXISTS public.gift_reports (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id     TEXT        NOT NULL REFERENCES public.digital_gifts(id) ON DELETE CASCADE,
  reason      TEXT        NOT NULL CHECK (char_length(reason) <= 500),
  reporter_ip TEXT,       -- disimpan sebagai SHA-256 hash, bukan IP mentah
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gift_reports_gift_id ON public.gift_reports(gift_id);

ALTER TABLE public.gift_reports ENABLE ROW LEVEL SECURITY;

-- Siapapun bisa melaporkan, tapi tidak bisa baca laporan
CREATE POLICY "Anyone can submit a gift report"
  ON public.gift_reports FOR INSERT
  WITH CHECK (
    char_length(reason) > 0
    AND char_length(reason) <= 500
  );

-- Admin baca via service role key (tidak ada SELECT policy publik)

NOTIFY pgrst, 'reload schema';
