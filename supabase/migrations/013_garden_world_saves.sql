-- Penyimpanan terenkripsi scene dekorasi dan petak bunga kebun.
-- Baris memakai kode kebun bila terhubung; selain itu memakai ID perangkat.
CREATE TABLE IF NOT EXISTS public.garden_world_saves (
  save_key TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  garden_code TEXT,
  state_encrypted TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_garden_world_saves_device_id
  ON public.garden_world_saves(device_id);

CREATE INDEX IF NOT EXISTS idx_garden_world_saves_garden_code
  ON public.garden_world_saves(garden_code);

ALTER TABLE public.garden_world_saves ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.garden_world_saves FROM anon, authenticated;
GRANT ALL ON TABLE public.garden_world_saves TO service_role;

COMMENT ON TABLE public.garden_world_saves IS
  'Snapshot scene dan petak bunga kebun yang dienkripsi oleh server aplikasi.';

-- Jika versi 012 sempat menyimpan layout pada flower_gardens, pindahkan ciphertext
-- lama ke tabel baru tanpa perlu membuka atau mengenkripsi ulang datanya.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'flower_gardens'
      AND column_name = 'world_layout_encrypted'
  ) THEN
    EXECUTE $migration$
      INSERT INTO public.garden_world_saves (save_key, device_id, garden_code, state_encrypted, updated_at)
      SELECT 'garden:' || garden_code, owner_device_id, garden_code, world_layout_encrypted, now()
      FROM public.flower_gardens
      WHERE world_layout_encrypted IS NOT NULL
      ON CONFLICT (save_key) DO NOTHING
    $migration$;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
