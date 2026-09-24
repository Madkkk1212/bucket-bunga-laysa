import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  checkLoginRateLimit,
  recordLoginFailure,
  recordLoginSuccess,
  verifyAdminCredential,
  createAdminSession,
  verifyAdminSession,
} from '@/lib/adminAuth';

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

// ── GET: Cek status autentikasi sesi saat ini ──
export async function GET(req: NextRequest) {
  const adminKey = process.env.ADMIN_SECRET_KEY;
  const cookieKey = req.cookies.get('laysa_admin_key')?.value;
  const sessionToken = req.cookies.get('laysa_admin_session')?.value;
  const headerKey = req.headers.get('x-admin-key');

  // Jika key tidak dikonfigurasi, anggap tidak terautentikasi
  const isValidSession = adminKey
    ? (cookieKey === adminKey || headerKey === adminKey || verifyAdminSession(sessionToken))
    : false;

  return NextResponse.json({
    authenticated: isValidSession,
  });
}

// ── POST: Otentikasi PIN / Master Key ──
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // 1. Cek Rate Limiting (Mencegah Brute Force)
  const rateCheck = checkLoginRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Akses ditangguhkan sementara. Terlalu banyak percobaan gagal. Silakan tunggu ${rateCheck.remainingLockSeconds} detik.`,
        isLocked: true,
        remainingSeconds: rateCheck.remainingLockSeconds,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const credential = body?.credential || body?.pin || body?.key;

    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Otorisasi kunci diperlukan.' },
        { status: 400 }
      );
    }

    // 2. Verifikasi Kredensial dengan Timing-Safe SHA-256
    const isMatch = verifyAdminCredential(credential);

    if (!isMatch) {
      const failInfo = recordLoginFailure(ip);
      if (failInfo.isLocked) {
        return NextResponse.json(
          {
            success: false,
            error: `Otorisasi gagal berulang kali. Akses dikunci selama ${failInfo.lockMinutes} menit demi keamanan.`,
            isLocked: true,
            remainingAttempts: 0,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Kunci otorisasi tidak valid. Sisa percobaan: ${failInfo.remainingAttempts}x.`,
          isLocked: false,
          remainingAttempts: failInfo.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 3. Berhasil: Reset catatan kegagalan & terbitkan sesi
    recordLoginSuccess(ip);
    const { token, maxAgeSeconds } = createAdminSession();
    // ADMIN_SECRET_KEY sudah divalidasi wajib ada di lib/adminAuth.ts saat startup
    const adminKey = process.env.ADMIN_SECRET_KEY!;

    const res = NextResponse.json({
      success: true,
      message: 'Otorisasi atelier terverifikasi. Membuka konsol...',
    });

    // Pasang HttpOnly cookie yang aman dan tidak bisa dicuri script client (XSS-proof)
    const isProd = process.env.NODE_ENV === 'production';

    res.cookies.set('laysa_admin_key', adminKey, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: maxAgeSeconds,
    });

    res.cookies.set('laysa_admin_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: maxAgeSeconds,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Format permintaan tidak valid.' },
      { status: 400 }
    );
  }
}

// ── DELETE: Logout & bersihkan cookie sesi ──
export async function DELETE() {
  const res = NextResponse.json({
    success: true,
    message: 'Sesi atelier telah ditutup dan dikunci kembali.',
  });

  res.cookies.set('laysa_admin_key', '', {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });

  res.cookies.set('laysa_admin_session', '', {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });

  return res;
}
