import crypto from 'crypto';

// ════════════════════════════════════════════════════════════
// LAYSA STUDIO — EXPERT ADMIN AUTHENTICATION ENGINE
// ════════════════════════════════════════════════════════════

// ── Validasi wajib environment variable saat module dimuat ──
// Aplikasi TIDAK BOLEH berjalan dengan credential default/lemah.
// Jika variabel ini tidak ada, throw error saat startup (bukan per-request).
if (!process.env.ADMIN_SECRET_KEY) {
  throw new Error(
    '[FATAL] ADMIN_SECRET_KEY environment variable is not set. ' +
    'Application cannot start without a valid admin secret key. ' +
    'Set ADMIN_SECRET_KEY in your .env.local (development) or hosting platform (production).'
  );
}

if (!process.env.ADMIN_PIN) {
  throw new Error(
    '[FATAL] ADMIN_PIN environment variable is not set. ' +
    'Application cannot start without a valid admin PIN. ' +
    'Set ADMIN_PIN in your .env.local (development) or hosting platform (production).'
  );
}

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;
const ADMIN_PIN = process.env.ADMIN_PIN;
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 Hari masa aktif sesi

// ── Rate Limiter untuk Mencegah Brute-force Login ──
// Maksimal 5x gagal dalam jendela 15 menit per IP
interface RateLimitRecord {
  failedAttempts: number;
  lockedUntil: number;
  lastAttempt: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 menit kunci

export function checkLoginRateLimit(ip: string): { allowed: boolean; remainingLockSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) return { allowed: true };

  // Jika sedang terkunci
  if (record.lockedUntil > now) {
    const remaining = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingLockSeconds: remaining };
  }

  // Jika masa penalti sudah lewat 30 menit, reset otomatis
  if (now - record.lastAttempt > 30 * 60 * 1000) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordLoginFailure(ip: string): { remainingAttempts: number; isLocked: boolean; lockMinutes: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { failedAttempts: 0, lockedUntil: 0, lastAttempt: now };

  record.failedAttempts += 1;
  record.lastAttempt = now;

  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(ip, record);
    return { remainingAttempts: 0, isLocked: true, lockMinutes: 15 };
  }

  loginAttempts.set(ip, record);
  return {
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.failedAttempts,
    isLocked: false,
    lockMinutes: 0,
  };
}

export function recordLoginSuccess(ip: string) {
  loginAttempts.delete(ip);
}

// ── Timing-Safe Credential Verification ──
// Menggunakan perbandingan SHA-256 constant-time agar kebal terhadap timing attack
export function verifyAdminCredential(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const clean = input.trim();

  // Hanya terima credential dari environment variable (tidak ada fallback hardcoded)
  const validTargets = [ADMIN_PIN, ADMIN_SECRET].filter(Boolean);

  const inputHash = crypto.createHash('sha256').update(clean).digest();

  for (const target of validTargets) {
    const targetHash = crypto.createHash('sha256').update(target).digest();
    if (crypto.timingSafeEqual(inputHash, targetHash)) {
      return true;
    }
  }

  return false;
}

// ── Session Token Generation (HMAC Signed) ──
export function createAdminSession(): { token: string; maxAgeSeconds: number } {
  const now = Date.now();
  const payload = {
    role: 'atelier_curator',
    iat: now,
    exp: now + SESSION_MAX_AGE_MS,
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  const payloadStr = JSON.stringify(payload);
  const b64Payload = Buffer.from(payloadStr).toString('base64url');
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(b64Payload).digest('base64url');

  return {
    token: `${b64Payload}.${signature}`,
    maxAgeSeconds: Math.floor(SESSION_MAX_AGE_MS / 1000),
  };
}

// ── Session Token Verification ──
export function verifyAdminSession(token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [b64Payload, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(b64Payload).digest('base64url');

  try {
    const isSigMatch = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
    if (!isSigMatch) return false;

    const decoded = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf-8'));
    if (decoded.role !== 'atelier_curator') return false;
    if (Date.now() > decoded.exp) return false;

    return true;
  } catch {
    return false;
  }
}
