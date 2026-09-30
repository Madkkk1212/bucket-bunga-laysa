-- =========================================================================
-- MIGRATION 010: VIP ENCRYPTED BOUQUET DRAFTS
-- Tabel penyimpanan autosave draft buket khusus VIP terenkripsi AES-256
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.vip_bouquet_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    access_code TEXT UNIQUE NOT NULL,
    device_id TEXT,
    user_name TEXT,
    encrypted_data TEXT NOT NULL,
    iv TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vip_drafts_access_code ON public.vip_bouquet_drafts(access_code);
CREATE INDEX IF NOT EXISTS idx_vip_drafts_device_id ON public.vip_bouquet_drafts(device_id);

-- RLS Hardening: Akses hanya diperbolehkan melalui Backend Next.js Service Role API
ALTER TABLE public.vip_bouquet_drafts ENABLE ROW LEVEL SECURITY;

-- Tolak akses langsung dari klien REST API publik
DROP POLICY IF EXISTS "Deny direct public select on vip_drafts" ON public.vip_bouquet_drafts;
CREATE POLICY "Deny direct public select on vip_drafts"
    ON public.vip_bouquet_drafts
    FOR SELECT
    USING (false);

DROP POLICY IF EXISTS "Deny direct public insert on vip_drafts" ON public.vip_bouquet_drafts;
CREATE POLICY "Deny direct public insert on vip_drafts"
    ON public.vip_bouquet_drafts
    FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "Deny direct public update on vip_drafts" ON public.vip_bouquet_drafts;
CREATE POLICY "Deny direct public update on vip_drafts"
    ON public.vip_bouquet_drafts
    FOR UPDATE
    USING (false);
