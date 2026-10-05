-- Simpan tata letak world builder kebun sebagai ciphertext AES-256-GCM.
-- Kunci enkripsi hanya berada di server (GARDEN_ENCRYPTION_KEY / ADMIN_SECRET_KEY).
ALTER TABLE public.flower_gardens
  ADD COLUMN IF NOT EXISTS world_layout_encrypted TEXT;

COMMENT ON COLUMN public.flower_gardens.world_layout_encrypted IS
  'Tata letak kebun 3D terenkripsi di server (AES-256-GCM).';

NOTIFY pgrst, 'reload schema';
