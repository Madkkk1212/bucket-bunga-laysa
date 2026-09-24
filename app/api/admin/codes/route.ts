import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

// Fallback in-memory list jika Supabase belum terhubung
let localCodes = [
  {
    id: 'local-1',
    code: 'LAYSA-VIP',
    is_active: true,
    max_uses: 999999,
    max_devices: 5,
    used_count: 0,
    used_by_name: null,
    notes: 'Kode Master VIP Resmi',
    created_at: new Date().toISOString(),
  },
  {
    id: 'local-2',
    code: 'TISUWKWK',
    is_active: true,
    max_uses: 1,
    max_devices: 5,
    used_count: 0,
    used_by_name: null,
    notes: 'Pembeli WA',
    created_at: new Date().toISOString(),
  },
];

function generateRandomCode(prefix = 'VIP'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${rand}`;
}

// 1. GET: Ambil semua kode akses (+ device count per kode jika Supabase tersedia)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const codeId = searchParams.get('devices_for'); // ?devices_for=<code_id>

    const supabase = getSupabase();

    // Sub-endpoint: ambil daftar device untuk 1 kode
    if (codeId && supabase) {
      // Ambil data kode untuk tahu pemilik utamanya
      const { data: codeData } = await supabase
        .from('access_codes')
        .select('id, code, used_by_name, max_devices')
        .eq('id', codeId)
        .maybeSingle();

      const { data, error } = await supabase
        .from('code_devices')
        .select('*')
        .eq('code_id', codeId)
        .order('first_seen_at', { ascending: true }); // Pendaftar pertama di posisi paling atas

      if (!error && data) {
        const enriched = data.map((d: any, idx: number) => {
          // Pendaftar pertama (idx 0) atau is_owner === true atau nama sama dengan used_by_name
          const isOwner = d.is_owner === true || idx === 0 || (codeData?.used_by_name && d.user_name?.toLowerCase().trim() === codeData.used_by_name.toLowerCase().trim());
          return {
            ...d,
            is_owner: isOwner,
            device_slot: idx + 1,
          };
        });
        return NextResponse.json({ success: true, devices: enriched, codeInfo: codeData });
      }
      return NextResponse.json({ success: true, devices: [] });
    }

    // Main: ambil semua kode + jumlah device
    if (supabase) {
      const { data, error } = await supabase
        .from('access_codes')
        .select('*, code_devices(count)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Flatten device_count dari nested aggregate
        const codes = data.map((row: any) => ({
          ...row,
          device_count: row.code_devices?.[0]?.count ?? 0,
          code_devices: undefined,
        }));
        return NextResponse.json({ success: true, codes });
      }

      // Fallback query tanpa join jika tabel code_devices belum ada
      const { data: simpleData, error: simpleError } = await supabase
        .from('access_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!simpleError && simpleData) {
        return NextResponse.json({ success: true, codes: simpleData });
      }

      console.error('[Admin GET Error]:', error?.message);
    }

    return NextResponse.json({ success: true, codes: localCodes, fallback: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 2. POST: Buat kode baru (+ support max_devices)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    let rawCode = body?.code;
    const maxUses = typeof body?.max_uses === 'number' ? body.max_uses : 1;
    const maxDevices = typeof body?.max_devices === 'number' ? Math.max(1, body.max_devices) : 5;
    const notes = (body?.notes || '').trim();

    if (!rawCode || !rawCode.trim()) {
      rawCode = generateRandomCode('VIP');
    }

    const cleanCode = rawCode.trim().toUpperCase().replace(/\s+/g, '-');
    const supabase = getSupabase();

    if (supabase) {
      const payload: Record<string, any> = {
        code: cleanCode,
        is_active: true,
        max_uses: maxUses,
        max_devices: maxDevices,
        used_count: 0,
        notes: notes || null,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('access_codes')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, code: data });
      }

      if (error?.code === '23505') {
        return NextResponse.json(
          { success: false, message: `Kode "${cleanCode}" sudah pernah dibuat sebelumnya.` },
          { status: 400 }
        );
      }
      console.error('[Admin POST Supabase Error]:', error);
    }

    // Local fallback
    const newLocalItem = {
      id: `local-${Date.now()}`,
      code: cleanCode,
      is_active: true,
      max_uses: maxUses,
      max_devices: maxDevices,
      used_count: 0,
      used_by_name: null,
      notes,
      created_at: new Date().toISOString(),
    };
    localCodes.unshift(newLocalItem);
    return NextResponse.json({ success: true, code: newLocalItem, fallback: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 3. PATCH: Reset / Toggle aktif / Update max_devices / Hapus device tertentu
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action, is_active, max_devices, device_id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID kode diperlukan.' }, { status: 400 });
    }

    const supabase = getSupabase();

    // ── Hapus 1 device dari daftar ──
    if (action === 'remove_device' && device_id) {
      if (supabase) {
        const { error } = await supabase
          .from('code_devices')
          .delete()
          .eq('id', device_id)
          .eq('code_id', id);

        if (!error) {
          return NextResponse.json({ success: true, message: 'Perangkat berhasil dihapus dari daftar.' });
        }
        console.error('[Remove Device Error]:', error);
      }
      return NextResponse.json({ success: true, message: 'Perangkat dihapus.' });
    }

    // ── Reset kode (hapus semua device + reset used_count) ──
    if (action === 'reset') {
      if (supabase) {
        // Hapus semua device record
        await supabase.from('code_devices').delete().eq('code_id', id);

        const { error } = await supabase
          .from('access_codes')
          .update({ used_count: 0, used_by_name: null, claimed_at: null })
          .eq('id', id);

        if (!error) {
          return NextResponse.json({ success: true, message: 'Kode berhasil di-reset. Semua perangkat dihapus.' });
        }
        console.error('[Admin Reset Error]:', error);
      }
      localCodes = localCodes.map((c) =>
        c.id === id ? { ...c, used_count: 0, used_by_name: null } : c
      );
      return NextResponse.json({ success: true, message: 'Kode berhasil di-reset.' });
    }

    // ── Update max_devices ──
    if (typeof max_devices === 'number') {
      const safeMax = Math.max(1, max_devices);
      if (supabase) {
        const { error } = await supabase
          .from('access_codes')
          .update({ max_devices: safeMax })
          .eq('id', id);

        if (!error) {
          return NextResponse.json({
            success: true,
            message: `Batas perangkat diubah menjadi ${safeMax}.`,
          });
        }
        console.error('[Update max_devices Error]:', error);
      }
      localCodes = localCodes.map((c) => c.id === id ? { ...c, max_devices: safeMax } : c);
      return NextResponse.json({ success: true, message: `Batas perangkat diubah ke ${safeMax}.` });
    }

    // ── Toggle aktif/nonaktif ──
    if (typeof is_active === 'boolean') {
      if (supabase) {
        const { error } = await supabase
          .from('access_codes')
          .update({ is_active })
          .eq('id', id);

        if (!error) {
          return NextResponse.json({
            success: true,
            message: `Status kode diubah menjadi ${is_active ? 'Aktif' : 'Nonaktif'}.`,
          });
        }
        console.error('[Admin Toggle Error]:', error);
      }
      localCodes = localCodes.map((c) => (c.id === id ? { ...c, is_active } : c));
      return NextResponse.json({ success: true, message: 'Status berhasil diubah.' });
    }

    return NextResponse.json({ success: false, message: 'Aksi tidak dikenal.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 4. DELETE: Hapus kode (otomatis cascade hapus device records)
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID kode diperlukan.' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('access_codes').delete().eq('id', id);
      if (!error) {
        return NextResponse.json({ success: true, message: 'Kode berhasil dihapus.' });
      }
      console.error('[Admin DELETE Error]:', error);
    }

    localCodes = localCodes.filter((c) => c.id !== id);
    return NextResponse.json({ success: true, message: 'Kode berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
