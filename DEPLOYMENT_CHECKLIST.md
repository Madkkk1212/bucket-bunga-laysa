# DEPLOYMENT CHECKLIST
## Buket Bunga — Laysa Studio (branch: `restructure`)
> Disiapkan: 25 September 2026 | Review sebelum merge ke `main`

---

## 1. REKOMENDASI SCRIPT PYTHON

### `scripts/test_calibrated.py`
- **Terakhir diubah:** 22 Sep 2026 (1 commit: "first commit")
- **Direferensikan di package.json / README / kode lain:** Tidak ada
- **Tujuan:** Script one-shot Python (Pillow) untuk mengkalibrasi posisi bunga pada bucket-2. Hardcoded call di bagian bawah file, langsung dieksekusi saat dijalankan.
- **Rekomendasi:** AMAN DIHAPUS — one-time dev tool, tidak terintegrasi ke pipeline, logika render final sudah hidup di utils/canvasUtils.ts.

### `scripts/test_render.py`
- **Terakhir diubah:** 22 Sep 2026 (1 commit: "first commit")
- **Direferensikan di package.json / README / kode lain:** Tidak ada
- **Tujuan:** Script pengujian render Python untuk menghasilkan preview PNG (9 mawar, buket campuran mewah). Menggunakan bucket-1 hardcoded.
- **Rekomendasi:** AMAN DIHAPUS — serupa test_calibrated.py, murni alat eksplorasi visual lokal.

### `scripts/process_213_buckets.py`
- **Terakhir diubah:** 25 Sep 2026 (commit restrukturisasi — dipindah ke scripts/)
- **Direferensikan di package.json / README / kode lain:** Tidak ada referensi eksplisit
- **Tujuan:** Script batch Python (Pillow + NumPy) yang memproses 34 gambar buket dari public/images/bucket/213/ dan menghasilkan pasangan {n}_back.png dan {n}_front.png (split di garis collar). Metadata 34 buket sudah tersalin ke data/buckets.ts.
- **Rekomendasi:** JANGAN HAPUS DULU — menghasilkan aset statis yang dipakai renderer canvas Next.js. Dibutuhkan lagi jika ada penambahan buket baru ke folder 213/. Pertahankan sampai proses onboarding buket dianggap final.

---

## 2. ENVIRONMENT VARIABLES — WAJIB ADA DI HOSTING

### Variabel Sensitif (server-side only, TIDAK boleh prefix NEXT_PUBLIC_)

| Variable | File Pemakai | Keterangan | Ada di .env.local? |
|---|---|---|---|
| SUPABASE_SERVICE_ROLE_KEY | utils/supabase/admin.ts, lib/supabaseClient.ts | PALING KRITIS. Service role key Supabase untuk bypass RLS. Tanpa ini semua operasi admin DB gagal setelah migrasi 007+008. | BELUM ADA |
| ADMIN_SECRET_KEY | middleware.ts, lib/adminAuth.ts, app/api/admin/auth/route.ts, app/api/settings/pricing/route.ts | Kunci auth admin. Ada fallback hardcoded — WAJIB di-override di production! | Ada |
| ADMIN_PIN | lib/adminAuth.ts | PIN login admin. Fallback hardcoded 'admin123' — WAJIB di-override! | Ada |
| ADMIN_SECRET_PATH | middleware.ts | Path URL vault admin. Default: /lys-atelier-vault-89x. Opsional. | Ada |

### Variabel Publik (aman diekspos ke browser)

| Variable | File Pemakai | Keterangan | Ada di .env.local? |
|---|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | utils/supabase/*.ts, lib/supabaseClient.ts | URL project Supabase. | Ada |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | utils/supabase/*.ts, lib/supabaseClient.ts | Anon key Supabase. Setelah migrasi 007+008, hanya bisa dipakai untuk read publik (pricing, gift view). | Ada |
| NEXT_PUBLIC_WHATSAPP_NUMBER | components/designer/PremiumUnlockModal.tsx | Nomor WA customer service. Fallback: 6289514618737. Opsional. | Ada |

CATATAN KRITIS: SUPABASE_SERVICE_ROLE_KEY belum ada di .env.local dan harus diset di platform hosting sebelum deploy!

---

## 3. HASIL SWEEP KEAMANAN AKHIR

### 3a. Verifikasi getAdminClient() di Route Handlers

| Route Handler | Tabel | Client | Status |
|---|---|---|---|
| app/api/admin/codes/route.ts | access_codes, code_devices | getAdminClient() | AMAN |
| app/api/admin/diagnostics/route.ts | access_codes, code_devices | getAdminClient() | AMAN |
| app/api/verify-code/route.ts | access_codes, code_devices | getAdminClient() || getSupabase() | AMAN |
| app/api/gifts/route.ts | digital_gifts (INSERT) | getAdminClient() || supabase | AMAN |
| app/api/gifts/[id]/route.ts | digital_gifts (SELECT, UPDATE) | getAdminClient() || supabase | AMAN |
| app/api/settings/pricing/route.ts | pricing_settings (SELECT GET) | getSupabase() | AMAN (publik read OK per migration 005) |
| app/api/settings/pricing/route.ts | pricing_settings (WRITE POST) | getAdminClient() || getSupabase() | AMAN |

Tidak ada route handler yang menggunakan anon client untuk operasi sensitif.

### 3b. Status Build

npm run build: SUKSES (exit code 0)
- Compiled successfully
- TypeScript: 0 errors
- Static pages generated: 17/17

### 3c. Hasil Lint (npm run lint)

Exit code: 1 (error lint, tidak memblokir build/deploy)

Errors yang ada (tidak kritis untuk deploy):
- no-explicit-any: banyak file API menggunakan err: any di catch block
- lys-atelier-vault-89x/page.tsx:261 — setState synchronous di useEffect (cascading render risk)

Warnings (tidak perlu diperbaiki segera):
- Import icons lucide yang tidak dipakai di beberapa page
- Beberapa <img> tag tanpa next/image (performa LCP)
- Variabel lokal tidak terpakai

---

## 4. LANGKAH MANUAL SEBELUM MERGE KE MAIN

### A. Supabase Database (WAJIB)

[ ] Apply migration 007: Jalankan isi supabase/migrations/007_harden_admin_rls.sql di SQL Editor Supabase
    - Mengunci access_codes ke service_role only
    - Mengunci write pricing_settings ke service_role

[ ] Apply migration 008: Jalankan isi supabase/migrations/008_harden_remaining_rls.sql
    - Aktifkan RLS + kunci code_devices ke service_role (sebelumnya RLS dinonaktifkan!)
    - Kunci write digital_gifts ke service_role, pertahankan SELECT publik

[ ] Verifikasi RLS aktif di Supabase Dashboard: access_codes, code_devices, digital_gifts, pricing_settings

[ ] Uji koneksi service role: buka /api/admin/diagnostics (dengan cookie admin) pastikan connected: true

### B. Environment Variables di Hosting (WAJIB)

[ ] Set SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard > Settings > API > service_role key)
[ ] Set ADMIN_SECRET_KEY (string acak min 32 karakter, ganti dari default)
[ ] Set ADMIN_PIN (ganti dari default 'admin123')
[ ] Set NEXT_PUBLIC_SUPABASE_URL
[ ] Set NEXT_PUBLIC_SUPABASE_ANON_KEY
[ ] Set NEXT_PUBLIC_WHATSAPP_NUMBER (opsional jika default sudah benar)
[ ] Set ADMIN_SECRET_PATH (opsional)

### C. Audit Log Supabase (Direkomendasikan)

[ ] Buka Supabase Dashboard > Logs > API Logs
[ ] Filter ke sebelum tanggal migrasi 007 diterapkan
[ ] Cari akses mencurigakan ke /rest/v1/access_codes, /rest/v1/code_devices
[ ] Jika ada akses tidak dikenal, rotate NEXT_PUBLIC_SUPABASE_ANON_KEY

### D. Test End-to-End Setelah Deploy

[ ] Test publik: buka halaman utama, rangkai buket, submit, pastikan link buket dibuat
[ ] Test verifikasi kode: masukkan kode akses valid, pastikan berhasil
[ ] Test admin: login ke vault, pastikan daftar kode muncul
[ ] Test buat kode baru: buat kode baru di dashboard, test kode tersebut
[ ] Test harga: GET /api/settings/pricing mengembalikan data harga terkini

### E. Git Merge (TERAKHIR)

[ ] Review diff: git log main..restructure --oneline
[ ] Merge setelah semua langkah A-D selesai:
    git checkout main
    git merge restructure --no-ff -m "merge: security hardening + restructure"

---
File ini dibuat otomatis. Hapus atau arsipkan setelah merge selesai.
