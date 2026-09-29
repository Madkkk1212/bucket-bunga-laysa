import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabase } from '@/lib/supabaseClient';
import { getAdminClient } from '@/utils/supabase/admin';
import { encryptGardenData, decryptGardenData } from '@/lib/cryptoGarden';
import { GARDEN_40_FLOWERS, getFlowerByKey } from '@/data/gardenCatalog';

export interface DailyNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface FlowerGarden {
  id: string;
  gardenCode: string;
  gardenName: string;
  flowerType: string;
  flowerName: string;
  growthStage: number; // 1: Bibit, 2: Tunas, 3: Kuncup, 4: Mekar, 5: Radiant
  streakCount: number;
  ownerName: string;
  ownerDeviceId: string;
  partnerName?: string | null;
  partnerDeviceId?: string | null;
  lastWateredAt: string;
  lastWateredBy: string;
  wateredToday: boolean;
  dailyNotes: DailyNote[];
  encryptedFlowerChoice?: string;
  encryptedNotes?: string;
  encryptedPartner?: string;
  createdAt: string;
  updatedAt: string;
}

function resolveFlowerName(key: string): string {
  const catalogItem = getFlowerByKey(key);
  if (catalogItem) return catalogItem.name;
  return 'Bunga Indah';
}

const localGardenFilePath = path.join(process.cwd(), 'data', 'gardens.json');

function readLocalGardens(): FlowerGarden[] {
  try {
    if (fs.existsSync(localGardenFilePath)) {
      const raw = fs.readFileSync(localGardenFilePath, 'utf-8');
      const list: any[] = JSON.parse(raw);
      // Dekripsi data sensitif yang tersimpan terenkripsi
      return list.map((g) => ({
        ...g,
        flowerType: g.encryptedFlowerChoice ? decryptGardenData(g.encryptedFlowerChoice, g.flowerType) : g.flowerType,
        flowerName: resolveFlowerName(g.encryptedFlowerChoice ? decryptGardenData(g.encryptedFlowerChoice, g.flowerType) : g.flowerType),
        dailyNotes: g.encryptedNotes ? decryptGardenData(g.encryptedNotes, g.dailyNotes || []) : (g.dailyNotes || []),
        partnerName: g.encryptedPartner ? decryptGardenData(g.encryptedPartner, g.partnerName) : g.partnerName,
      }));
    }
  } catch (err) {
    console.error('Error reading local gardens:', err);
  }
  return [];
}

function writeLocalGardens(gardens: FlowerGarden[]) {
  try {
    // Simpan ke storage dengan mengenkripsi pilihan bunga sensitif, catatan pribadi, dan identitas pasangan
    const secureList = gardens.map((g) => ({
      ...g,
      encryptedFlowerChoice: encryptGardenData(g.flowerType),
      encryptedNotes: encryptGardenData(g.dailyNotes),
      encryptedPartner: g.partnerName ? encryptGardenData(g.partnerName) : null,
    }));
    fs.writeFileSync(localGardenFilePath, JSON.stringify(secureList, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local gardens:', err);
  }
}

function generateGardenCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

function computeGrowthStage(streak: number): number {
  if (streak >= 30) return 5;
  if (streak >= 15) return 4;
  if (streak >= 8) return 3;
  if (streak >= 4) return 2;
  return 1;
}

function checkStreakStatus(lastWateredIso: string): { isWateredToday: boolean; isStreakBroken: boolean } {
  const last = new Date(lastWateredIso).getTime();
  const now = Date.now();
  const diffHours = (now - last) / (1000 * 60 * 60);

  // Jika disiram dalam 20 jam terakhir atau di hari kalender yang sama, anggap sudah disiram hari ini
  const lastDate = new Date(lastWateredIso).toDateString();
  const nowDate = new Date().toDateString();
  const isSameCalendarDay = lastDate === nowDate;

  const isWateredToday = isSameCalendarDay || diffHours < 18;
  // Jika lebih dari 48 jam tidak disiram, streak api patah / layu
  const isStreakBroken = diffHours >= 48;

  return { isWateredToday, isStreakBroken };
}

// ── GET: Ambil status kebun berdasarkan gardenCode atau deviceId ──
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code')?.trim().toUpperCase();
    const deviceId = searchParams.get('deviceId')?.trim();

    if (!code && !deviceId) {
      return NextResponse.json(
        { success: false, message: 'Parameter code atau deviceId diperlukan.' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient() || getSupabase();
    let garden: any = null;

    if (supabase) {
      try {
        let query = supabase.from('flower_gardens').select('*');
        if (code) {
          query = query.eq('garden_code', code);
        } else if (deviceId) {
          query = query.or(`owner_device_id.eq.${deviceId},partner_device_id.eq.${deviceId}`);
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (!error && data) {
          garden = {
            id: data.id,
            gardenCode: data.garden_code,
            gardenName: data.garden_name,
            flowerType: data.flower_type,
            flowerName: resolveFlowerName(data.flower_type),
            growthStage: data.growth_stage,
            streakCount: data.streak_count,
            ownerName: data.owner_name,
            ownerDeviceId: data.owner_device_id,
            partnerName: data.partner_name,
            partnerDeviceId: data.partner_device_id,
            lastWateredAt: data.last_watered_at,
            lastWateredBy: data.last_watered_by,
            wateredToday: data.watered_today,
            dailyNotes: data.daily_notes || [],
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (sbErr) {
        // Fallback ke local file jika tabel DB belum dimigrasikan
      }
    }

    // Local fallback jika Supabase tidak menemukan
    if (!garden) {
      const localList = readLocalGardens();
      if (code) {
        garden = localList.find((g) => g.gardenCode === code);
      } else if (deviceId) {
        garden = localList.find((g) => g.ownerDeviceId === deviceId || g.partnerDeviceId === deviceId);
      }
    }

    if (!garden) {
      return NextResponse.json({ success: false, notFound: true, message: 'Kebun belum ditemukan.' });
    }

    // Evaluasi status streak real-time
    const { isWateredToday, isStreakBroken } = checkStreakStatus(garden.lastWateredAt);
    if (isStreakBroken && garden.streakCount > 1) {
      garden.streakCount = 1; // Reset streak jika terlewat > 48 jam
      garden.growthStage = computeGrowthStage(garden.streakCount);
    }
    garden.wateredToday = isWateredToday;

    return NextResponse.json({ success: true, garden });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ── POST: Buat kebun, gabung kebun, atau siram bunga harian ──
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action; // 'create' | 'join' | 'water'
    const deviceId = (body.deviceId || '').trim();

    if (!deviceId) {
      return NextResponse.json({ success: false, message: 'Device ID tidak valid.' }, { status: 400 });
    }

    const supabase = getAdminClient() || getSupabase();
    const localGardens = readLocalGardens();

    // ── 1. BUAT KEBUN BARU (Solo / Host) ──
    if (action === 'create') {
      const ownerName = (body.ownerName || 'Pencinta Bunga').trim();
      const gardenName = (body.gardenName || `Taman Indah ${ownerName}`).trim();
      const flowerType = (body.flowerType || 'rose_red').trim();
      const gardenCode = generateGardenCode();
      const nowISO = new Date().toISOString();

      const newGarden: FlowerGarden = {
        id: `g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        gardenCode,
        gardenName,
        flowerType,
        flowerName: resolveFlowerName(flowerType),
        growthStage: 1, // Mulai dari bibit
        streakCount: 1, // Hari ke-1
        ownerName,
        ownerDeviceId: deviceId,
        partnerName: null,
        partnerDeviceId: null,
        lastWateredAt: nowISO,
        lastWateredBy: ownerName,
        wateredToday: true,
        dailyNotes: [
          {
            id: `note_${Date.now()}`,
            author: ownerName,
            text: 'Bibit pertama berhasil ditanam dengan cinta! 🌱✨',
            createdAt: nowISO,
          },
        ],
        createdAt: nowISO,
        updatedAt: nowISO,
      };

      // Simpan ke Supabase jika ada
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('flower_gardens')
            .insert({
              garden_code: newGarden.gardenCode,
              garden_name: newGarden.gardenName,
              flower_type: newGarden.flowerType,
              growth_stage: newGarden.growthStage,
              streak_count: newGarden.streakCount,
              owner_name: newGarden.ownerName,
              owner_device_id: newGarden.ownerDeviceId,
              last_watered_at: newGarden.lastWateredAt,
              last_watered_by: newGarden.lastWateredBy,
              watered_today: true,
              daily_notes: newGarden.dailyNotes,
            })
            .select()
            .single();

          if (!error && data) {
            newGarden.id = data.id;
          }
        } catch (sbErr) {
          console.warn('[Garden Supabase Create Warning]:', sbErr);
        }
      }

      // Simpan ke file lokal
      localGardens.unshift(newGarden);
      writeLocalGardens(localGardens);

      return NextResponse.json({
        success: true,
        message: 'Kebun bunga berhasil ditanam!',
        garden: newGarden,
      });
    }

    // ── 2. GABUNG KEBUN PASANGAN / TEMAN (Via Kode 6 Karakter) ──
    if (action === 'join') {
      const code = (body.gardenCode || '').trim().toUpperCase();
      const partnerName = (body.partnerName || 'Teman Spesial').trim();

      if (!code) {
        return NextResponse.json({ success: false, message: 'Masukkan kode kebun 6 karakter.' }, { status: 400 });
      }

      let existingGarden: any = null;

      if (supabase) {
        try {
          const { data } = await supabase
            .from('flower_gardens')
            .select('*')
            .eq('garden_code', code)
            .maybeSingle();
          if (data) existingGarden = data;
        } catch (sbErr) {}
      }

      if (!existingGarden) {
        existingGarden = localGardens.find((g) => g.gardenCode === code);
      }

      if (!existingGarden) {
        return NextResponse.json(
          { success: false, message: `Kode kebun "${code}" tidak ditemukan. Pastikan kode benar.` },
          { status: 404 }
        );
      }

      if (existingGarden.owner_device_id === deviceId || existingGarden.ownerDeviceId === deviceId) {
        return NextResponse.json({
          success: false,
          message: 'Anda adalah pemilik kebun ini! Bagikan kode ini ke pasangan/teman Anda.',
        }, { status: 400 });
      }

      const nowISO = new Date().toISOString();
      const joinNote: DailyNote = {
        id: `note_${Date.now()}`,
        author: partnerName,
        text: `🌸 ${partnerName} bergabung ke kebun! Sekarang kita rawat bunga ini berdua ya 💕`,
        createdAt: nowISO,
      };

      const prevNotes = existingGarden.daily_notes || existingGarden.dailyNotes || [];
      const updatedNotes = [joinNote, ...prevNotes].slice(0, 30);

      if (supabase) {
        try {
          await supabase
            .from('flower_gardens')
            .update({
              partner_name: partnerName,
              partner_device_id: deviceId,
              daily_notes: updatedNotes,
              updated_at: nowISO,
            })
            .eq('garden_code', code);
        } catch (sbErr) {}
      }

      // Update lokal
      const localIdx = localGardens.findIndex((g) => g.gardenCode === code);
      if (localIdx >= 0) {
        localGardens[localIdx].partnerName = partnerName;
        localGardens[localIdx].partnerDeviceId = deviceId;
        localGardens[localIdx].dailyNotes = updatedNotes;
        localGardens[localIdx].updatedAt = nowISO;
        writeLocalGardens(localGardens);
      }

      return NextResponse.json({
        success: true,
        message: `Berhasil bergabung ke kebun "${existingGarden.garden_name || existingGarden.gardenName}"!`,
        gardenCode: code,
      });
    }

    // ── 3. SIRAM BUNGA HARIAN (Daily Water & Streak Update) ──
    if (action === 'water') {
      const code = (body.gardenCode || '').trim().toUpperCase();
      const userName = (body.userName || 'Pencinta Bunga').trim();
      const userNote = (body.note || '').trim();

      let targetGarden: any = null;

      if (supabase) {
        try {
          const { data } = await supabase
            .from('flower_gardens')
            .select('*')
            .eq('garden_code', code)
            .maybeSingle();
          if (data) targetGarden = data;
        } catch (sbErr) {}
      }

      if (!targetGarden) {
        targetGarden = localGardens.find((g) => g.gardenCode === code);
      }

      if (!targetGarden) {
        return NextResponse.json({ success: false, message: 'Kebun tidak ditemukan.' }, { status: 404 });
      }

      const lastWatered = targetGarden.last_watered_at || targetGarden.lastWateredAt;
      const { isWateredToday } = checkStreakStatus(lastWatered);

      if (isWateredToday) {
        return NextResponse.json({
          success: false,
          alreadyWatered: true,
          message: 'Bunga sudah disiram hari ini! Terima kasih sudah merawatnya. Kembali lagi besok ya 🌸💧',
        });
      }

      // Tingkatkan streak
      const currentStreak = (targetGarden.streak_count || targetGarden.streakCount || 1) + 1;
      const newStage = computeGrowthStage(currentStreak);
      const nowISO = new Date().toISOString();

      const newNotes = targetGarden.daily_notes || targetGarden.dailyNotes || [];
      const noteEntry: DailyNote = {
        id: `note_${Date.now()}`,
        author: userName,
        text: userNote ? `💧 ${userNote}` : `💧 ${userName} baru saja menyiram bunga hari ini! Streak naik ke ${currentStreak} hari 🔥`,
        createdAt: nowISO,
      };
      const updatedNotes = [noteEntry, ...newNotes].slice(0, 30);

      if (supabase) {
        try {
          await supabase
            .from('flower_gardens')
            .update({
              streak_count: currentStreak,
              growth_stage: newStage,
              last_watered_at: nowISO,
              last_watered_by: userName,
              watered_today: true,
              daily_notes: updatedNotes,
              updated_at: nowISO,
            })
            .eq('garden_code', code);
        } catch (sbErr) {}
      }

      // Update lokal
      const localIdx = localGardens.findIndex((g) => g.gardenCode === code);
      if (localIdx >= 0) {
        localGardens[localIdx].streakCount = currentStreak;
        localGardens[localIdx].growthStage = newStage;
        localGardens[localIdx].lastWateredAt = nowISO;
        localGardens[localIdx].lastWateredBy = userName;
        localGardens[localIdx].wateredToday = true;
        localGardens[localIdx].dailyNotes = updatedNotes;
        localGardens[localIdx].updatedAt = nowISO;
        writeLocalGardens(localGardens);
      }

      return NextResponse.json({
        success: true,
        message: `✨ Bunga segar! Api streak kamu bertambah jadi ${currentStreak} hari 🔥!`,
        streakCount: currentStreak,
        growthStage: newStage,
      });
    }

    return NextResponse.json({ success: false, message: 'Aksi tidak dikenal.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
