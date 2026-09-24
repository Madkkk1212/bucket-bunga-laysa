/**
 * utils/supabase/admin.ts
 * Admin Supabase client — HANYA dipakai di server (Route Handler / Server Action).
 * Menggunakan service role key yang bypass RLS.
 * JANGAN import file ini dari Client Component.
 */
import 'server-only';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getAdminClient() {
  if (!url || !serviceRoleKey) {
    console.warn('[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY not set.');
    return null;
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
