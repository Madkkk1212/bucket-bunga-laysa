-- =========================================================================
-- MIGRATION 006: INDEX TAMBAHAN UNTUK PERFORMA QUERY
-- Berdasarkan pola query di route handler:
-- - access_codes: filter by is_active, used_by_name, max_devices
-- - code_devices: filter by code_id, device_id, ip_address (sudah ada dari 004)
-- - digital_gifts: filter by id (sudah ada dari 001)
-- =========================================================================

-- Index untuk filter is_active pada access_codes (dipakai di SELECT dan UPDATE)
CREATE INDEX IF NOT EXISTS idx_access_codes_is_active
    ON public.access_codes(is_active);

-- Index untuk sort created_at pada access_codes (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_access_codes_created_at
    ON public.access_codes(created_at DESC);

-- Index untuk digital_gifts created_at (list pagination)
CREATE INDEX IF NOT EXISTS idx_digital_gifts_created_at
    ON public.digital_gifts(created_at DESC);

NOTIFY pgrst, 'reload schema';
