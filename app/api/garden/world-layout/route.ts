import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';
import { getAdminClient } from '@/utils/supabase/admin';
import { decryptGardenWorldLayout, encryptGardenWorldLayout } from '@/lib/gardenWorldEncryption';
import type { GardenWorldLayout } from '@/components/garden/worldLayoutTypes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_LAYOUT_BYTES = 256_000;
const MAX_DECORATIONS = 300;
const MAX_ROADS = 900;
const MAX_VEHICLES = 100;
const MAX_GARDEN_TILES = 100;
const MAX_PLACED_DECORATIONS = 120;
const SEASONS = new Set(['cerah', 'hujan', 'salju', 'kemarau']);
const ROAD_TYPES = new Set([
  'straight_ns', 'straight_ew', 'cross', 'corner_ne', 'corner_nw', 'corner_se', 'corner_sw',
  't_nse', 't_nsw', 't_ewn', 't_ews', 'end_n', 'end_s', 'end_e', 'end_w', 'zebra', 'sidewalk',
]);
const VEHICLE_TYPES = new Set([
  'car_sedan', 'car_suv', 'car_mpv', 'car_pickup', 'car_truck', 'car_taxi', 'car_police',
  'car_ambulance', 'car_bus', 'motor_sport', 'motor_scooter',
]);

function validDeviceId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{8,80}$/.test(value);
}

function isFiniteNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

interface GardenTileSnapshot {
  id: number;
  row: number;
  col: number;
  planted: boolean;
  isOrnament?: boolean;
  ornamentKey?: string;
  flowerKey?: string;
  flowerName?: string;
  flowerLatin?: string;
  flowerCategory?: string;
  flowerImage?: string;
  flowerColor?: string;
  growthStage?: 1 | 2 | 3 | 4;
  waterCount?: number;
  daysWatered?: number;
  lastWateredDate?: string;
  wateredToday?: boolean;
  lastWateredTime?: string;
  plantedAt?: string;
}

interface PlacedDecorationSnapshot {
  id: string;
  ornamentKey: string;
  name: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
}

const TILE_FIELDS = new Set([
  'id', 'row', 'col', 'planted', 'isOrnament', 'ornamentKey', 'flowerKey', 'flowerName',
  'flowerLatin', 'flowerCategory', 'flowerImage', 'flowerColor', 'growthStage', 'waterCount',
  'daysWatered', 'lastWateredDate', 'wateredToday', 'lastWateredTime', 'plantedAt',
]);

function validOptionalString(value: unknown, maxLength: number, pattern?: RegExp): boolean {
  return value === undefined || (typeof value === 'string' && value.length <= maxLength && (!pattern || pattern.test(value)));
}

function validateGardenTiles(value: unknown): value is GardenTileSnapshot[] {
  if (!Array.isArray(value) || value.length < 25 || value.length > MAX_GARDEN_TILES) return false;
  const ids = new Set<number>();
  const coords = new Set<string>();
  return value.every((tile) => {
    if (!tile || typeof tile !== 'object') return false;
    const item = tile as Partial<GardenTileSnapshot>;
    if (Object.keys(tile).some((key) => !TILE_FIELDS.has(key))) return false;
    if (!Number.isInteger(item.id) || !Number.isInteger(item.row) || !Number.isInteger(item.col) ||
        item.id! < 0 || item.id! >= MAX_GARDEN_TILES || item.row! < 0 || item.row! >= 10 ||
        item.col! < 0 || item.col! >= 10 || typeof item.planted !== 'boolean') return false;
    const coordinate = `${item.row},${item.col}`;
    if (ids.has(item.id!) || coords.has(coordinate)) return false;
    ids.add(item.id!);
    coords.add(coordinate);
    return (item.isOrnament === undefined || typeof item.isOrnament === 'boolean') &&
      validOptionalString(item.ornamentKey, 64, /^[a-z0-9_-]*$/i) &&
      validOptionalString(item.flowerKey, 64, /^[a-z0-9_-]*$/i) &&
      validOptionalString(item.flowerName, 100) && validOptionalString(item.flowerLatin, 120) &&
      validOptionalString(item.flowerCategory, 50) &&
      validOptionalString(item.flowerImage, 240, /^\/images\/[a-z0-9_./-]+\.(?:png|jpe?g|webp|svg)$/i) &&
      validOptionalString(item.flowerColor, 16, /^#[0-9a-f]{6}$/i) &&
      (item.growthStage === undefined || [1, 2, 3, 4].includes(item.growthStage)) &&
      (item.waterCount === undefined || (Number.isInteger(item.waterCount) && item.waterCount >= 0 && item.waterCount <= 10000)) &&
      (item.daysWatered === undefined || (Number.isInteger(item.daysWatered) && item.daysWatered >= 0 && item.daysWatered <= 10000)) &&
      validOptionalString(item.lastWateredDate, 10, /^\d{4}-\d{2}-\d{2}$/) &&
      (item.wateredToday === undefined || typeof item.wateredToday === 'boolean') &&
      validOptionalString(item.lastWateredTime, 40) && validOptionalString(item.plantedAt, 40);
  });
}

function validatePlacedDecorations(value: unknown): value is PlacedDecorationSnapshot[] {
  if (!Array.isArray(value) || value.length > MAX_PLACED_DECORATIONS) return false;
  const ids = new Set<string>();
  return value.every((decoration) => {
    if (!decoration || typeof decoration !== 'object') return false;
    const item = decoration as Partial<PlacedDecorationSnapshot>;
    if (Object.keys(decoration).some((key) => !['id', 'ornamentKey', 'name', 'x', 'y', 'scale', 'rotation'].includes(key))) return false;
    if (typeof item.id !== 'string' || !/^[a-z0-9_-]{1,100}$/i.test(item.id) || ids.has(item.id)) return false;
    ids.add(item.id);
    return typeof item.ornamentKey === 'string' && /^[a-z0-9_-]{1,64}$/i.test(item.ornamentKey) &&
      typeof item.name === 'string' && item.name.length <= 100 &&
      isFiniteNumber(item.x, -60, 450) && isFiniteNumber(item.y, -60, 450) &&
      (item.scale === undefined || isFiniteNumber(item.scale, 0.1, 4)) &&
      (item.rotation === undefined || isFiniteNumber(item.rotation, -1000, 1000));
  });
}

function readStoredSnapshot(value: unknown): {
  layout: GardenWorldLayout;
  tiles: GardenTileSnapshot[] | null;
  placedDecorations: PlacedDecorationSnapshot[] | null;
} | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as { snapshotVersion?: unknown; layout?: unknown; tiles?: unknown; placedDecorations?: unknown };
  if (record.snapshotVersion === 3 && validateLayout(record.layout) &&
      (record.tiles === undefined || validateGardenTiles(record.tiles)) &&
      (record.placedDecorations === undefined || validatePlacedDecorations(record.placedDecorations))) {
    return {
      layout: record.layout,
      tiles: Array.isArray(record.tiles) ? record.tiles : null,
      placedDecorations: Array.isArray(record.placedDecorations) ? record.placedDecorations : null,
    };
  }
  if (record.snapshotVersion === 2 && validateLayout(record.layout) && validateGardenTiles(record.tiles)) {
    return { layout: record.layout, tiles: record.tiles, placedDecorations: null };
  }
  // Supports layouts encrypted by the first version before plant-grid sync was added.
  if (validateLayout(value)) return { layout: value, tiles: null, placedDecorations: null };
  return null;
}

function validateLayout(value: unknown): value is GardenWorldLayout {
  if (!value || typeof value !== 'object') return false;
  const layout = value as Partial<GardenWorldLayout>;
  if (layout.version !== 1 || !SEASONS.has(String(layout.season))) return false;
  if (layout.preset !== undefined && layout.preset !== 'city-loop-v1') return false;
  if (!Array.isArray(layout.decorations) || layout.decorations.length > MAX_DECORATIONS) return false;
  if (!Array.isArray(layout.roads) || layout.roads.length > MAX_ROADS) return false;
  if (!Array.isArray(layout.vehicles) || layout.vehicles.length > MAX_VEHICLES) return false;

  const validDecorations = layout.decorations.every((item) =>
    item && typeof item.typeKey === 'string' && /^[a-z0-9_-]{1,64}$/i.test(item.typeKey) &&
    isFiniteNumber(item.x, -40, 40) && isFiniteNumber(item.z, -40, 40) &&
    isFiniteNumber(item.rotation, -1000, 1000) && isFiniteNumber(item.scale, 0.1, 4),
  );
  const validRoads = layout.roads.every((item) =>
    item && ROAD_TYPES.has(item.type) && Number.isInteger(item.gx) && Number.isInteger(item.gz) &&
    item.gx >= -20 && item.gx <= 20 && item.gz >= -20 && item.gz <= 20,
  );
  const validVehicles = layout.vehicles.every((item) =>
    item && VEHICLE_TYPES.has(item.type) && isFiniteNumber(item.x, -40, 40) &&
    isFiniteNumber(item.z, -40, 40) && isFiniteNumber(item.rotation, -1000, 1000) &&
    (item.circuit === undefined || typeof item.circuit === 'boolean'),
  );
  return validDecorations && validRoads && validVehicles;
}

function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, message, ...extra }, { status });
}

async function findWorldSaveTarget(deviceId: string) {
  const supabase = getAdminClient() || getSupabase();
  if (!supabase) return { supabase: null, garden: null, error: null };

  const { data, error } = await supabase
    .from('flower_gardens')
    .select('garden_code, owner_device_id, partner_device_id')
    .or(`owner_device_id.eq.${deviceId},partner_device_id.eq.${deviceId}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { supabase, garden: data, error };
}

export async function GET(request: Request) {
  const deviceId = new URL(request.url).searchParams.get('deviceId');
  if (!validDeviceId(deviceId)) return jsonError('ID perangkat tidak valid.', 400);

  try {
    const { supabase, garden, error } = await findWorldSaveTarget(deviceId);
    if (!supabase) return jsonError('Supabase belum dikonfigurasi.', 503);
    if (!garden && error) {
      console.error('[Garden world layout] Supabase read failed:', error.message);
      return jsonError('Gagal memeriksa tautan kebun di Supabase. Periksa konfigurasi server.', 503);
    }

    const gardenCode = garden?.garden_code ? String(garden.garden_code) : null;
    const saveKey = gardenCode ? `garden:${gardenCode}` : `device:${deviceId}`;
    const { data: savedState, error: saveError } = await supabase
      .from('garden_world_saves')
      .select('state_encrypted')
      .eq('save_key', saveKey)
      .maybeSingle();
    if (saveError) {
      console.error('[Garden world layout] Supabase save lookup failed:', saveError.message);
      return jsonError('Penyimpanan kebun belum siap. Jalankan SQL 013_garden_world_saves.sql dan pastikan service role Supabase terpasang.', 503, { migrationRequired: true });
    }

    let layout: GardenWorldLayout | null = null;
    let tiles: GardenTileSnapshot[] | null = null;
    let placedDecorations: PlacedDecorationSnapshot[] | null = null;
    if (savedState?.state_encrypted) {
      const snapshot = readStoredSnapshot(decryptGardenWorldLayout<unknown>(savedState.state_encrypted));
      if (!snapshot) throw new Error('Saved garden snapshot is invalid.');
      layout = snapshot.layout;
      tiles = snapshot.tiles;
      placedDecorations = snapshot.placedDecorations;
    }
    return NextResponse.json({
      success: true,
      gardenLinked: Boolean(gardenCode),
      gardenCode,
      hasSavedState: Boolean(savedState?.state_encrypted),
      layout,
      tiles,
      placedDecorations,
    });
  } catch (error) {
    console.error('[Garden world layout] Supabase load failed:', error);
    return jsonError('Tata letak kebun belum dapat dimuat. Periksa konfigurasi Supabase dan kunci enkripsi.', 503);
  }
}

export async function POST(request: Request) {
  let body: { deviceId?: unknown; layout?: unknown; tiles?: unknown; placedDecorations?: unknown };
  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_LAYOUT_BYTES) return jsonError('Tata letak kebun terlalu besar.', 413);
    body = JSON.parse(rawBody) as typeof body;
  } catch {
    return jsonError('Data tata letak tidak valid.', 400);
  }

  if (!validDeviceId(body.deviceId)) return jsonError('ID perangkat tidak valid.', 400);
  if (!validateLayout(body.layout)) return jsonError('Format tata letak tidak valid.', 400);
  if (body.tiles !== undefined && !validateGardenTiles(body.tiles)) return jsonError('Format petak bunga tidak valid.', 400);
  if (body.placedDecorations !== undefined && !validatePlacedDecorations(body.placedDecorations)) return jsonError('Format ornamen kebun tidak valid.', 400);

  try {
    const { supabase, garden, error } = await findWorldSaveTarget(body.deviceId);
    if (!supabase) return jsonError('Supabase belum dikonfigurasi.', 503);
    if (!garden && error) {
      console.error('[Garden world layout] Supabase lookup failed:', error.message);
      return jsonError('Gagal memeriksa tautan kebun di Supabase. Periksa konfigurasi server.', 503);
    }

    const gardenCode = garden?.garden_code ? String(garden.garden_code) : null;
    const saveKey = gardenCode ? `garden:${gardenCode}` : `device:${body.deviceId}`;
    const { data: previousState, error: previousStateError } = await supabase
      .from('garden_world_saves')
      .select('state_encrypted')
      .eq('save_key', saveKey)
      .maybeSingle();
    if (previousStateError) {
      console.error('[Garden world layout] Supabase existing snapshot read failed:', previousStateError.message);
      return jsonError('Penyimpanan kebun belum siap. Jalankan SQL 013_garden_world_saves.sql dan pastikan service role Supabase terpasang.', 503, { migrationRequired: true });
    }

    let tiles = body.tiles as GardenTileSnapshot[] | undefined;
    let placedDecorations = body.placedDecorations as PlacedDecorationSnapshot[] | undefined;
    if (previousState?.state_encrypted) {
      const previousSnapshot = readStoredSnapshot(decryptGardenWorldLayout<unknown>(previousState.state_encrypted));
      tiles = tiles ?? previousSnapshot?.tiles ?? undefined;
      placedDecorations = placedDecorations ?? previousSnapshot?.placedDecorations ?? undefined;
    }
    const encryptedLayout = encryptGardenWorldLayout(tiles || placedDecorations
      ? { snapshotVersion: 3, layout: body.layout, tiles: tiles || undefined, placedDecorations: placedDecorations || undefined }
      : body.layout);

    const { data: savedRow, error: updateError } = await supabase
      .from('garden_world_saves')
      .upsert({
        save_key: saveKey,
        device_id: body.deviceId,
        garden_code: gardenCode,
        state_encrypted: encryptedLayout,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'save_key' })
      .select('save_key')
      .maybeSingle();

    if (updateError) {
      console.error('[Garden world layout] Supabase save failed:', updateError.message);
      return jsonError('Gagal menyimpan ke Supabase. Jalankan SQL 013_garden_world_saves.sql dan pastikan service role Supabase terpasang.', 503, { migrationRequired: true });
    }
    if (!savedRow) {
      return jsonError('Supabase tidak mengonfirmasi penyimpanan tata letak kebun.', 503);
    }

    return NextResponse.json({ success: true, gardenCode, gardenLinked: Boolean(gardenCode), savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[Garden world layout] Save failed:', error);
    return jsonError('Gagal menyimpan tata letak kebun. Periksa konfigurasi kunci enkripsi.', 503);
  }
}
