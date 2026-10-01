import fs from 'fs';
import path from 'path';
import { getSupabase } from '@/lib/supabaseClient';

export interface VisitorStatsData {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  lastDate: string;
  showOnHome: boolean;
  customOffset: number;
  updatedAt: string;
  dailyStats: Record<string, number>;
}

const statsFilePath = path.join(process.cwd(), 'data', 'visitorStats.json');

function getTodayString(): string {
  // Gunakan timezone WIB (Asia/Jakarta, UTC+7)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);
  return wib.toISOString().split('T')[0];
}

const DEFAULT_STATS: VisitorStatsData = {
  totalVisits: 0,
  uniqueVisitors: 0,
  todayVisits: 0,
  lastDate: getTodayString(),
  showOnHome: false,
  customOffset: 0,
  updatedAt: new Date().toISOString(),
  dailyStats: {},
};

// ── Sinkronisasi Background ke Supabase (Jika Dikonfigurasi) ──
async function syncToSupabase(stats: VisitorStatsData) {
  try {
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.from('site_stats').upsert({
      id: 'default',
      total_visits: stats.totalVisits,
      unique_visitors: stats.uniqueVisitors,
      today_visits: stats.todayVisits,
      show_on_home: stats.showOnHome,
      custom_offset: stats.customOffset,
      last_date: stats.lastDate,
      updated_at: stats.updatedAt,
      daily_stats: stats.dailyStats,
    });
  } catch {
    // Abaikan jika tabel site_stats belum dibuat di Supabase
  }
}

export function readVisitorStats(): VisitorStatsData {
  try {
    if (!fs.existsSync(statsFilePath)) {
      fs.writeFileSync(statsFilePath, JSON.stringify(DEFAULT_STATS, null, 2), 'utf-8');
      return { ...DEFAULT_STATS };
    }
    const raw = fs.readFileSync(statsFilePath, 'utf-8');
    const data = JSON.parse(raw);
    const today = getTodayString();

    // Reset dailyVisits jika sudah berganti hari
    let needsSave = false;
    if (data.lastDate !== today) {
      data.todayVisits = 0;
      data.lastDate = today;
      needsSave = true;
    }

    if (typeof data.showOnHome !== 'boolean') {
      data.showOnHome = false;
      needsSave = true;
    }

    if (typeof data.customOffset !== 'number') {
      data.customOffset = 0;
      needsSave = true;
    }

    if (!data.dailyStats) {
      data.dailyStats = {};
      needsSave = true;
    }

    if (needsSave) {
      writeVisitorStats(data);
    }

    return data;
  } catch (err) {
    console.error('[VisitorStorage] Error reading visitor stats:', err);
    return { ...DEFAULT_STATS };
  }
}

export async function readVisitorStatsAsync(): Promise<VisitorStatsData> {
  const localStats = readVisitorStats();

  try {
    const supabase = getSupabase();
    if (!supabase) return localStats;

    const { data, error } = await supabase
      .from('site_stats')
      .select('total_visits, unique_visitors, today_visits, show_on_home, custom_offset, last_date, updated_at, daily_stats')
      .eq('id', 'default')
      .maybeSingle();

    if (!error && data) {
      const merged: VisitorStatsData = {
        totalVisits: Number(data.total_visits) || localStats.totalVisits,
        uniqueVisitors: Number(data.unique_visitors) || localStats.uniqueVisitors,
        todayVisits: Number(data.today_visits) || localStats.todayVisits,
        showOnHome: typeof data.show_on_home === 'boolean' ? data.show_on_home : localStats.showOnHome,
        customOffset: Number(data.custom_offset) || localStats.customOffset,
        lastDate: data.last_date || localStats.lastDate,
        updatedAt: data.updated_at || localStats.updatedAt,
        dailyStats: (data.daily_stats as Record<string, number>) || localStats.dailyStats,
      };

      writeVisitorStats(merged);
      return merged;
    }
  } catch {
    // Fallback ke local
  }

  return localStats;
}

export function writeVisitorStats(stats: VisitorStatsData): boolean {
  try {
    const dir = path.dirname(statsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[VisitorStorage] Error writing visitor stats:', err);
    return false;
  }
}

export function recordNewVisit(isUnique: boolean = false): VisitorStatsData {
  const current = readVisitorStats();
  const today = getTodayString();

  current.totalVisits = (current.totalVisits || 0) + 1;
  current.todayVisits = (current.todayVisits || 0) + 1;
  current.lastDate = today;
  current.updatedAt = new Date().toISOString();

  if (isUnique) {
    current.uniqueVisitors = (current.uniqueVisitors || 0) + 1;
  }

  if (!current.dailyStats) current.dailyStats = {};
  current.dailyStats[today] = (current.dailyStats[today] || 0) + 1;

  // Pertahankan hanya 30 hari terakhir di dailyStats untuk mencegah file membengkak
  const days = Object.keys(current.dailyStats).sort();
  if (days.length > 30) {
    const toRemove = days.slice(0, days.length - 30);
    toRemove.forEach((d) => delete current.dailyStats[d]);
  }

  writeVisitorStats(current);
  // Sinkronisasi ke Supabase di background jika terhubung
  syncToSupabase(current).catch(() => {});

  return current;
}

export function updateVisitorSettings(updates: { showOnHome?: boolean; customOffset?: number }): VisitorStatsData {
  const current = readVisitorStats();

  if (typeof updates.showOnHome === 'boolean') {
    current.showOnHome = updates.showOnHome;
  }

  if (typeof updates.customOffset === 'number' && !isNaN(updates.customOffset)) {
    current.customOffset = Math.max(0, Math.floor(updates.customOffset));
  }

  current.updatedAt = new Date().toISOString();
  writeVisitorStats(current);
  syncToSupabase(current).catch(() => {});

  return current;
}

export function resetVisitorStats(): VisitorStatsData {
  const today = getTodayString();
  const resetData: VisitorStatsData = {
    totalVisits: 0,
    uniqueVisitors: 0,
    todayVisits: 0,
    lastDate: today,
    showOnHome: false,
    customOffset: 0,
    updatedAt: new Date().toISOString(),
    dailyStats: { [today]: 0 },
  };
  writeVisitorStats(resetData);
  syncToSupabase(resetData).catch(() => {});

  return resetData;
}
