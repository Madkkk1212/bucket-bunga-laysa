-- =========================================================================
-- MIGRATION 003: IZINKAN DASHBOARD ADMIN KELOLA KODE (RLS FULL ACCESS)
-- Source: supabase_dashboard_setup.sql
-- =========================================================================

-- Pastikan kolom tersedia
ALTER TABLE public.access_codes
ADD COLUMN IF NOT EXISTS used_by_name TEXT,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

-- Buka akses penuh untuk semua operasi (admin mengelola via anon key)
DROP POLICY IF EXISTS Public can verify active access codes ON public.access_codes;
CREATE POLICY Public can view access codes ON public.access_codes FOR SELECT USING (true);

DROP POLICY IF EXISTS Allow insert access codes ON public.access_codes;
CREATE POLICY Allow insert access codes ON public.access_codes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS Public can update access codes on claim ON public.access_codes;
CREATE POLICY Allow update access codes ON public.access_codes FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS Allow delete access codes ON public.access_codes;
CREATE POLICY Allow delete access codes ON public.access_codes FOR DELETE USING (true);

NOTIFY pgrst, 'reload schema';
