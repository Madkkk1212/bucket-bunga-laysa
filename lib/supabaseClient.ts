import { createClient } from '@supabase/supabase-js';

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const configured = Boolean(
    url &&
    key &&
    url !== 'https://your-project-ref.supabase.co' &&
    !url.includes('placeholder')
  );
  return { url, key, configured };
}

export function getSupabase() {
  const { url, key, configured } = getSupabaseConfig();
  if (!configured) return null;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (typeof window === 'undefined' && serviceKey) {
    return createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return createClient(url, key);
}

// Backward-compatible exports
export const isSupabaseConfigured = Boolean(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || '') &&
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
);

export const supabase = getSupabase();

