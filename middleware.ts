import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ════════════════════════════════════════════════════════════
// LAYSA STUDIO — HARDENED SECURITY & STEALTH GATEWAY MIDDLEWARE
// ════════════════════════════════════════════════════════════
// 1. /admin & /admin/*         → DIBLOKIR TOTAL (Return 404, tidak ada jejak admin)
// 2. Secret Vault Route        → Ditentukan oleh ADMIN_SECRET_PATH (.env.local)
//                                Default: /lys-atelier-vault-89x
// 3. /api/admin/*              → Wajib cookie laysa_admin_key (HttpOnly) atau x-admin-key
//                                (Kecuali /api/admin/auth untuk login)
// 4. /api/settings/* (writes)  → Wajib otentikasi admin
// 5. /api/clean-* dsb          → Wajib otentikasi admin
// 6. /api/verify-code          → Publik, rate limiting 30 req / 60 detik
// 7. Vault page itself         → Session check di middleware (cookie-based)
// ════════════════════════════════════════════════════════════

const PROTECTED_API_PATHS = [
  '/api/clean-backgrounds',
  '/api/cleanup-catalog',
  '/api/generate-100-catalog',
];

const PROTECTED_WRITE_PATHS = [
  '/api/settings',
];

// Rate limiting in-memory untuk verify-code
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) return false;
  return true;
}

function getClientIpFromReq(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    '127.0.0.1'
  );
}

function isAdminAuthenticated(req: NextRequest): boolean {
  const adminKey = process.env.ADMIN_SECRET_KEY || 'laysa-admin-s3cr3t-k3y-2026-buket';

  // Cek cookie HttpOnly yang dipasang server saat login
  const cookieKey = req.cookies.get('laysa_admin_key')?.value;
  if (cookieKey && cookieKey === adminKey) return true;

  // Cek header untuk akses programmatic / curl
  const headerKey = req.headers.get('x-admin-key');
  if (headerKey && headerKey === adminKey) return true;

  // HAPUS: query parameter admin_key — rentan tercatat di server log/referer header
  // Jika butuh akses darurat, gunakan header x-admin-key saja.

  // Izinkan di development HANYA jika key belum pernah dikonfigurasi sama sekali
  if (!process.env.ADMIN_SECRET_KEY && process.env.NODE_ENV === 'development') {
    return true;
  }

  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const reqMethod = req.method;

  // ── 1. STEALTH DEFENSE: Blokir total /admin tanpa jejak ──
  // Siapapun yang mengakses /admin akan langsung menerima HTTP 404 murni
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return new NextResponse(
      '<!DOCTYPE html><html><head><title>404: Not Found</title></head><body style="font-family:system-ui;text-align:center;padding:100px 20px;"><h1>404</h1><p>Halaman tidak ditemukan.</p></body></html>',
      {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      }
    );
  }

  // ── 2. DYNAMIC SECRET ROUTE REWRITE ──
  // URL rahasia bisa diubah sewaktu-waktu di .env.local: ADMIN_SECRET_PATH
  const configuredSecretPath = (process.env.ADMIN_SECRET_PATH || '/lys-atelier-vault-89x').trim();
  const canonicalInternalPath = '/lys-atelier-vault-89x';

  // Jika user membuka URL rahasia yang dikonfigurasi
  if (pathname === configuredSecretPath && configuredSecretPath !== canonicalInternalPath) {
    // Rewrite internal ke halaman vault tanpa merubah URL di address bar browser
    return NextResponse.rewrite(new URL(canonicalInternalPath, req.url));
  }

  // Jika URL internal diakses langsung padahal path kustom sudah diset
  if (pathname === canonicalInternalPath && configuredSecretPath !== canonicalInternalPath) {
    return new NextResponse('404 Not Found', { status: 404 });
  }

  // ── 3. PROTEKSI API ADMIN ──
  // Pengecualian: /api/admin/auth (login & session check) harus bisa diakses
  if (pathname.startsWith('/api/admin')) {
    if (pathname.startsWith('/api/admin/auth')) {
      return NextResponse.next();
    }

    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses ditolak. Sesi atelier tidak valid atau telah kedaluwarsa.',
        },
        {
          status: 401,
          headers: {
            'X-Atelier-Security': 'Restricted-Access',
          },
        }
      );
    }

    return NextResponse.next();
  }

  // ── 4. PROTEKSI SCRIPT MAINTENANCE BERBAHAYA ──
  if (PROTECTED_API_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // ── 5. PROTEKSI WRITE KE /api/settings/* ──
  if (PROTECTED_WRITE_PATHS.some((p) => pathname.startsWith(p))) {
    const isWrite = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(reqMethod);
    if (isWrite && !isAdminAuthenticated(req)) {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang dapat mengubah pengaturan ini.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // ── 6. RATE LIMITING UNTUK /api/verify-code ──
  if (pathname.startsWith('/api/verify-code')) {
    const ip = getClientIpFromReq(req);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { valid: false, message: 'Terlalu banyak percobaan. Tunggu 1 menit lalu coba lagi.' },
        { status: 429 }
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Tangkap semua route kecuali file statis Next.js dan public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
