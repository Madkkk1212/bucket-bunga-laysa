# lys-atelier-vault-89x — Hidden Admin Route

## Fungsi
Route ini adalah **panel admin tersembunyi** untuk Laysa Studio.
Nama foldernya sengaja diacak (`lys-atelier-vault-89x`) sebagai lapisan keamanan obscurity —
/admin sudah di-block 404 total oleh middleware.

## Akses
- URL default: `/lys-atelier-vault-89x`
- URL bisa diubah via `.env.local` → `ADMIN_SECRET_PATH=/url-baru-rahasia`
- Middleware akan rewrite URL kustom ke path internal ini tanpa mengubah address bar

## Keamanan
- Tidak ada di sitemap.xml
- Tidak di-index oleh robot (X-Robots-Tag: noindex)
- Dilindungi PIN/Key yang dicek oleh `/api/admin/auth`
- Semua operasi admin via `/api/admin/*` butuh cookie `laysa_admin_key`

## PERINGATAN
Jangan rename atau pindahkan folder ini tanpa update `middleware.ts`
(variabel `canonicalInternalPath`).
