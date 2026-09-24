-- =========================================================================
-- MIGRATION 004: DEVICE TRACKING MULTI-DEVICE
-- Source: supabase_device_tracking.sql
-- =========================================================================

-- Tambah max_devices ke access_codes
ALTER TABLE access_codes
ADD COLUMN IF NOT EXISTS max_devices INTEGER DEFAULT 5;
UPDATE access_codes SET max_devices = 5 WHERE max_devices IS NULL;

-- Buat tabel code_devices
CREATE TABLE IF NOT EXISTS code_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES access_codes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  device_id TEXT,
  user_agent TEXT,
  user_name TEXT,
  is_owner BOOLEAN DEFAULT FALSE,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hapus constraint unique IP agar multi-device di WiFi yang sama tetap bisa
ALTER TABLE code_devices DROP CONSTRAINT IF EXISTS code_devices_code_id_ip_address_key;

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_code_devices_code_id ON code_devices(code_id);
CREATE INDEX IF NOT EXISTS idx_code_devices_ip ON code_devices(ip_address);
CREATE INDEX IF NOT EXISTS idx_code_devices_device_id ON code_devices(device_id);

-- Nonaktifkan RLS di code_devices (backend Next.js akses langsung)
ALTER TABLE code_devices DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS Service role full access on code_devices ON code_devices;
DROP POLICY IF EXISTS Allow all on code_devices ON code_devices;
