/**
 * utils/supabase/client.ts
 * Browser Supabase client — gunakan di Client Components ('use client').
 * Hanya pakai NEXT_PUBLIC_* env yang aman untuk client.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton browser client
let _browserClient: ReturnType<typeof createClient> | null = null;

export function getBrowserClient() {
  if (!_browserClient && url && anonKey) {
    _browserClient = createClient(url, anonKey);
  }
  return _browserClient;
}
