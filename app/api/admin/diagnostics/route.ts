import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

/**
 * GET /api/admin/diagnostics
 * Admin-only endpoint untuk memeriksa status sistem:
 * - Supabase connection
 * - Struktur tabel code_devices (kolom yang ada)
 * - Jumlah kode & perangkat
 * - Constraint yang terpasang
 * Sudah dilindungi oleh middleware.ts (wajib x-admin-key)
 */
export async function GET() {
  const result: Record<string, any> = {
    timestamp: new Date().toISOString(),
    supabase: { connected: false },
    tables: {},
    fix_needed: [],
  };

  try {
    const supabase = getSupabase();

    if (!supabase) {
      result.supabase.connected = false;
      result.supabase.message = 'NEXT_PUBLIC_SUPABASE_URL atau ANON_KEY tidak dikonfigurasi.';
      return NextResponse.json(result);
    }

    result.supabase.connected = true;

    // ── Cek access_codes ──
    const { data: codes, error: codeErr, count: codeCount } = await supabase
      .from('access_codes')
      .select('id, code, is_active, max_devices', { count: 'exact' })
      .limit(5);

    result.tables.access_codes = {
      ok: !codeErr,
      error: codeErr?.message,
      sample_count: codeCount,
      has_max_devices: codes?.[0] ? 'max_devices' in codes[0] : 'unknown',
    };

    // ── Cek code_devices ──
    const { data: devBasic, error: devErr } = await supabase
      .from('code_devices')
      .select('id, code_id, ip_address, device_id, user_name, is_owner, first_seen_at, last_seen_at')
      .limit(5);

    const devColumns = devBasic !== null ? Object.keys(devBasic[0] || {
      id: null, code_id: null, ip_address: null, device_id: null,
      user_name: null, is_owner: null, first_seen_at: null, last_seen_at: null,
    }) : [];

    const hasDeviceId = !devErr?.message?.includes('device_id');
    const hasIsOwner = !devErr?.message?.includes('is_owner');

    result.tables.code_devices = {
      ok: !devErr,
      error: devErr?.message,
      columns_detected: devColumns,
      has_device_id: hasDeviceId,
      has_is_owner: hasIsOwner,
    };

    // ── Cek Constraint unik IP ──
    const { data: dupTest } = await supabase
      .from('code_devices')
      .select('id, code_id, ip_address')
      .limit(10);

    result.tables.code_devices.total_rows = dupTest?.length ?? 0;

    // ── Deteksi apa yang perlu diperbaiki ──
    if (!hasDeviceId) {
      result.fix_needed.push('device_id column missing — run: ALTER TABLE code_devices ADD COLUMN IF NOT EXISTS device_id TEXT;');
    }
    if (!hasIsOwner) {
      result.fix_needed.push('is_owner column missing — run: ALTER TABLE code_devices ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT FALSE;');
    }

    result.fix_needed.push(
      'IMPORTANT: Run this SQL to allow multi-device on same WiFi: ALTER TABLE code_devices DROP CONSTRAINT IF EXISTS code_devices_code_id_ip_address_key;'
    );
    result.fix_needed.push(
      'IMPORTANT: Disable RLS if not done: ALTER TABLE code_devices DISABLE ROW LEVEL SECURITY;'
    );

    result.sql_to_run = `
-- Jalankan SQL berikut di Supabase SQL Editor:
ALTER TABLE code_devices DROP CONSTRAINT IF EXISTS code_devices_code_id_ip_address_key;
ALTER TABLE code_devices ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE code_devices ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_code_devices_device_id ON code_devices(device_id);
ALTER TABLE code_devices DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on code_devices" ON code_devices;
DROP POLICY IF EXISTS "Allow all on code_devices" ON code_devices;
ALTER TABLE access_codes ADD COLUMN IF NOT EXISTS max_devices INTEGER DEFAULT 5;
UPDATE access_codes SET max_devices = 5 WHERE max_devices IS NULL;
    `.trim();

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, ...result }, { status: 500 });
  }
}
