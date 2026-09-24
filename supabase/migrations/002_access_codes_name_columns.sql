-- =========================================================================
-- MIGRATION 002: TAMBAH KOLOM NAMA DAN UPDATE RLS access_codes
-- Source: supabase_migration_tambah_nama.sql
-- =========================================================================

ALTER TABLE public.access_codes
ADD COLUMN IF NOT EXISTS used_by_name TEXT,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

DO `
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'access_codes'
        AND policyname = 'Public can update access codes on claim'
    ) THEN
        CREATE POLICY Public can update access codes on claim
            ON public.access_codes
            FOR UPDATE
            USING (is_active = TRUE)
            WITH CHECK (is_active = TRUE);
    END IF;
END `;

NOTIFY pgrst, 'reload schema';
