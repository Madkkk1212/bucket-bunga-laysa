-- =========================================================================
-- MIGRATION 008: HARDEN RLS CODE_DEVICES & DIGITAL_GIFTS
-- =========================================================================
--
-- 1. TABEL code_devices:
--    MASALAH:
--    Di migration 004, RLS dinonaktifkan:
--      ALTER TABLE code_devices DISABLE ROW LEVEL SECURITY;
--    Ini menyebabkan siapa saja yang memiliki NEXT_PUBLIC_SUPABASE_ANON_KEY
--    dapat melakukan SELECT, INSERT, UPDATE, DELETE ke tabel code_devices
--    lewat REST API Supabase publik (/rest/v1/code_devices).
--    Data sensitif di tabel ini:
--      - code (kode voucher dalam plaintext)
--      - ip_address (IP pengguna)
--      - device_id (fingerprint device)
--      - user_name (nama pemakai kode)
--      - user_agent
--
--    SOLUSI:
--    - Aktifkan RLS: ALTER TABLE code_devices ENABLE ROW LEVEL SECURITY;
--    - Batasi SELURUH operasi (SELECT, INSERT, UPDATE, DELETE) hanya untuk TO service_role.
--    - Akses dari backend Next.js (verify-code, admin/codes, diagnostics)
--      sepenuhnya menggunakan getAdminClient() (service role key).
--
-- 2. TABEL digital_gifts:
--    MASALAH:
--    Di migration 001, policy INSERT dibuat publik:
--      CREATE POLICY "Public can create digital gifts" ON public.digital_gifts FOR INSERT WITH CHECK (true);
--    Artinya siapa saja bisa mem-bypass rate-limiting / validasi payload Next.js
--    dan melakukan spam ribuan baris buket langsung ke Supabase REST API publik.
--    Selain itu, tidak ada UPDATE policy, sehingga pembaruan views_count via
--    klien standar akan terblokir.
--
--    SOLUSI & CONSTRAINT READ PUBLIK:
--    - READ (SELECT): Dipertahankan publik (FOR SELECT TO public USING (true))
--      karena link hadiah buket (/gift/[id]) harus dapat dilihat oleh penerima
--      hadiah tanpa perlu login/autentikasi.
--    - WRITE (INSERT, UPDATE, DELETE): Dibatasi hanya TO service_role.
--      Setiap pembuatan hadiah baru harus melalui Route Handler /api/gifts
--      (server-side) yang memvalidasi payload design_data dan nama pengirim/penerima.
--      Pembaruan views_count saat buket dibuka dilakukan via server-side /api/gifts/[id].
-- =========================================================================

-- ── 1. HARDEN code_devices ──────────────────────────────────────────

-- Aktifkan RLS
ALTER TABLE public.code_devices ENABLE ROW LEVEL SECURITY;

-- Drop policy lama jika ada
DROP POLICY IF EXISTS "Service role full access on code_devices" ON public.code_devices;
DROP POLICY IF EXISTS "Allow all on code_devices" ON public.code_devices;
DROP POLICY IF EXISTS "Public can view code devices" ON public.code_devices;
DROP POLICY IF EXISTS "Public can insert code devices" ON public.code_devices;
DROP POLICY IF EXISTS "Public can update code devices" ON public.code_devices;
DROP POLICY IF EXISTS "Public can delete code devices" ON public.code_devices;
DROP POLICY IF EXISTS "Service role only - select code_devices" ON public.code_devices;
DROP POLICY IF EXISTS "Service role only - insert code_devices" ON public.code_devices;
DROP POLICY IF EXISTS "Service role only - update code_devices" ON public.code_devices;
DROP POLICY IF EXISTS "Service role only - delete code_devices" ON public.code_devices;
DROP POLICY IF EXISTS "Service role only - all code_devices" ON public.code_devices;

-- Buat policy ketat: Hanya service_role yang memiliki akses ke code_devices
CREATE POLICY "Service role only - all code_devices"
  ON public.code_devices
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ── 2. HARDEN digital_gifts ─────────────────────────────────────────

-- Pastikan RLS aktif
ALTER TABLE public.digital_gifts ENABLE ROW LEVEL SECURITY;

-- Drop policy lama
DROP POLICY IF EXISTS "Public can view digital gifts" ON public.digital_gifts;
DROP POLICY IF EXISTS "Public can create digital gifts" ON public.digital_gifts;
DROP POLICY IF EXISTS "Public can update digital gifts" ON public.digital_gifts;
DROP POLICY IF EXISTS "Public can delete digital gifts" ON public.digital_gifts;
DROP POLICY IF EXISTS "Public can view digital gifts by id" ON public.digital_gifts;
DROP POLICY IF EXISTS "Service role only - write digital_gifts" ON public.digital_gifts;
DROP POLICY IF EXISTS "Service role only - all digital_gifts" ON public.digital_gifts;

-- SELECT: Tetap publik agar buket yang dibagikan dapat dibuka oleh siapa saja
CREATE POLICY "Public can view digital gifts"
  ON public.digital_gifts
  FOR SELECT
  TO public
  USING (true);

-- INSERT, UPDATE, DELETE: Hanya service_role (melalui Next.js API Routes)
CREATE POLICY "Service role only - write digital_gifts"
  ON public.digital_gifts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
