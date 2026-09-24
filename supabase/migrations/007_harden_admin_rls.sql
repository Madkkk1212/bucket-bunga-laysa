-- =========================================================================
-- MIGRATION 007: HARDEN ADMIN RLS — BATASI KE SERVICE ROLE ONLY
-- =========================================================================
-- MASALAH DITEMUKAN DI 003_dashboard_admin_rls.sql:
-- Semua policy menggunakan USING (true) / WITH CHECK (true) TANPA role filter.
-- Artinya siapapun yang punya anon key (termasuk browser publik) bisa:
--   SELECT, INSERT, UPDATE, DELETE semua data access_codes via Supabase REST API.
-- Ini BERISIKO karena anon key ada di frontend (NEXT_PUBLIC_SUPABASE_ANON_KEY).
--
-- SOLUSI:
-- Drop semua policy publik lama, ganti dengan policy yang hanya mengizinkan
-- service_role. Anon/publik TIDAK mendapat akses ke tabel access_codes sama sekali.
-- Akses dari aplikasi Next.js harus melalui server-side (Route Handler) yang
-- menggunakan service role client (utils/supabase/admin.ts).
--
-- CATATAN:
-- Tabel digital_gifts memang dirancang publik-read (siapa saja bisa lihat buket).
-- Tabel pricing_settings publik-read untuk tampilan harga di frontend.
-- Tabel access_codes TIDAK boleh publik sama sekali.
-- =========================================================================

-- 1. DROP semua policy lama yang terlalu longgar di access_codes
DROP POLICY IF EXISTS Public can view access codes ON public.access_codes;
DROP POLICY IF EXISTS Public can verify active access codes ON public.access_codes;
DROP POLICY IF EXISTS Allow insert access codes ON public.access_codes;
DROP POLICY IF EXISTS Allow update access codes ON public.access_codes;
DROP POLICY IF EXISTS Public can update access codes on claim ON public.access_codes;
DROP POLICY IF EXISTS Allow delete access codes ON public.access_codes;
DROP POLICY IF EXISTS Public can update access codes on claim ON public.access_codes;

-- 2. BUAT POLICY BARU: Hanya service_role yang boleh akses access_codes
-- Anon/authenticated role tidak mendapat akses sama sekali.
-- Route Handler Next.js yang butuh akses harus pakai getAdminClient() (service role key).

-- SELECT: hanya service_role
CREATE POLICY Service role only - select access_codes
  ON public.access_codes
  FOR SELECT
  TO service_role
  USING (true);

-- INSERT: hanya service_role
CREATE POLICY Service role only - insert access_codes
  ON public.access_codes
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- UPDATE: hanya service_role
CREATE POLICY Service role only - update access_codes
  ON public.access_codes
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- DELETE: hanya service_role
CREATE POLICY Service role only - delete access_codes
  ON public.access_codes
  FOR DELETE
  TO service_role
  USING (true);

-- 3. Pastikan RLS masih aktif (tidak sampai di-disable)
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- 4. Harden pricing_settings: write hanya service_role, read tetap publik
DROP POLICY IF EXISTS Public can update pricing ON public.pricing_settings;

CREATE POLICY Service role only - write pricing_settings
  ON public.pricing_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public masih bisa read harga (untuk tampilan di frontend)
-- Policy Public can view pricing dari migration 005 tetap berlaku.

NOTIFY pgrst, 'reload schema';
