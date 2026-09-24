/**
 * utils/supabase/middleware.ts
 * Helper untuk cek/refresh session Supabase di middleware Next.js.
 * Menggunakan getUser() bukan getSession() sesuai best practice Supabase.
 */
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Buat client Supabase untuk keperluan middleware (server-side, no session persist).
 * Pakai getUser() untuk verifikasi, bukan getSession().
 */
export function getMiddlewareClient(_req: NextRequest) {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
