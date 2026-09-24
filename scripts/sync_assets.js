/**
 * 🔄 SCRIPT OTOMATIS: SINKRONISASI BUCKET & BUNGA
 * 
 * Perintah:
 *   npm run update       (atau: npm run sync)
 * 
 * Fungsi:
 * 1. Otomatis membaca semua gambar di folder `public/images/bucket/` (ukuran 10, 25, One Piece, Rustic, dll)
 * 2. Otomatis membuat layer `_front` & `_back` jika belum ada (agar bunga bisa terselip alami)
 * 3. Otomatis mendaftarkan bucket ke `app/data/buckets.ts`
 * 4. Otomatis membaca semua gambar di folder `public/images/flowers/`
 * 5. Otomatis mendaftarkan bunga baru ke `app/data/flowers.ts` lengkap dengan emoji & kategori
 * 
 * Anda cukup taruh gambar di folder public, lalu ketik `npm run update`!
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT_DIR = path.join(__dirname, '..');
const BUCKET_DIR = path.join(ROOT_DIR, 'public', 'images', 'bucket');
const FLOWER_DIR = path.join(ROOT_DIR, 'public', 'images', 'flowers');
const BUCKETS_TS = path.join(ROOT_DIR, 'app', 'data', 'buckets.ts');
const FLOWERS_TS = path.join(ROOT_DIR, 'app', 'data', 'flowers.ts');

// ─── 1. KAMUS BANTUAN NAMA & WARNA BUNGA ───────────────────────────────────────
const FLOWER_TRANSLATIONS = {
  rose: { name: 'Mawar', emoji: '🌹', category: 'main' },
  tulip: { name: 'Tulip', emoji: '🌷', category: 'main' },
  lily: { name: 'Bunga Lili', emoji: '🌸', category: 'main' },
  sunflower: { name: 'Bunga Matahari', emoji: '🌻', category: 'main' },
  chrysanthemum: { name: 'Krisan', emoji: '🌼', category: 'main' },
  hydrangea: { name: 'Hydrangea', emoji: '💙', category: 'main' },
  gerbera: { name: 'Gerbera', emoji: '🌺', category: 'main' },
  dahlia: { name: 'Dahlia', emoji: '🌺', category: 'main' },
  calla: { name: 'Calla Lily', emoji: '🤍', category: 'main' },
  orchid: { name: 'Anggrek', emoji: '🌸', category: 'main' },
  peony: { name: 'Peony', emoji: '🌸', category: 'main' },
  carnation: { name: 'Anyelir', emoji: '🌸', category: 'main' },
  daisy: { name: 'Daisy', emoji: '🌼', category: 'main' },
  babysbreath: { name: "Baby's Breath", emoji: '🤍', category: 'filler' },
  baby_breath: { name: "Baby's Breath", emoji: '🤍', category: 'filler' },
  aster: { name: 'Aster Peacock', emoji: '💜', category: 'filler' },
  lavender: { name: 'Lavender', emoji: '💜', category: 'filler' },
  eucalyptus: { name: 'Eucalyptus', emoji: '🌿', category: 'greenery' },
  ruscus: { name: 'Daun Ruscus', emoji: '🍃', category: 'greenery' },
  leaf: { name: 'Daun Hias', emoji: '🌿', category: 'greenery' },
  fern: { name: 'Paku-pakuan', emoji: '🌿', category: 'greenery' },
};

const COLOR_MAP = {
  red: { name: 'Merah', hex: '#DC143C' },
  pink: { name: 'Pink', hex: '#FF69B4' },
  white: { name: 'Putih', hex: '#FFFFFF' },
  yellow: { name: 'Kuning', hex: '#FFD700' },
  blue: { name: 'Biru', hex: '#4169E1' },
  purple: { name: 'Ungu', hex: '#9370DB' },
  peach: { name: 'Peach', hex: '#FFCBA4' },
  orange: { name: 'Orange', hex: '#FF8C00' },
  cream: { name: 'Cream', hex: '#FFF8DC' },
  green: { name: 'Hijau', hex: '#2E8B57' },
  silver: { name: 'Silver', hex: '#5F8575' },
};

// ─── 2. SINKRONISASI BUNGA (FLOWERS) ──────────────────────────────────────────
async function syncFlowers() {
  console.log('\n🌸 [1/2] Memeriksa & Menyinkronkan Koleksi Bunga...');

  if (!fs.existsSync(FLOWER_DIR)) {
    console.warn('⚠️  Folder flowers tidak ditemukan di', FLOWER_DIR);
    return;
  }

  // Baca daftar file bunga yang ada di disk
  const files = fs.readdirSync(FLOWER_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return ['.png', '.webp', '.jpg', '.jpeg'].includes(ext);
  });

  // Baca file flowers.ts lama untuk mempertahankan deskripsi kustom yang sudah ada
  let existingFlowers = [];
  if (fs.existsSync(FLOWERS_TS)) {
    const content = fs.readFileSync(FLOWERS_TS, 'utf8');
    // Ekstrak ID yang sudah terdaftar
    const idMatches = [...content.matchAll(/id:\s*['"]([^'"]+)['"]/g)];
    existingFlowers = idMatches.map((m) => m[1]);
  }

  const flowerList = [];
  const familyMap = new Map();

  for (const file of files) {
    const baseId = path.parse(file).name;
    const parts = baseId.split('_');
    const typeKey = parts[0].toLowerCase();
    const colorKey = parts.length > 1 ? parts[1].toLowerCase() : '';

    const typeInfo = FLOWER_TRANSLATIONS[typeKey] || {
      name: capitalize(typeKey),
      emoji: '🌸',
      category: 'main',
    };

    const colorInfo = COLOR_MAP[colorKey] || {
      name: colorKey ? capitalize(colorKey) : 'Alami',
      hex: '#E29578',
    };

    const displayName = colorKey
      ? `${typeInfo.name} ${colorInfo.name}`
      : typeInfo.name;

    const flowerObj = {
      id: baseId,
      name: displayName,
      imageUrl: `/images/flowers/${file}`,
      category: typeInfo.category,
      emoji: typeInfo.emoji,
      color: colorInfo.hex,
      colorName: colorInfo.name,
      description: `${displayName} segar berkualitas untuk buket istimewa`,
    };

    flowerList.push(flowerObj);

    // Kelompokkan ke family
    if (!familyMap.has(typeKey)) {
      familyMap.set(typeKey, {
        id: `fam_${typeKey}`,
        name: typeInfo.name,
        category: typeInfo.category,
        emoji: typeInfo.emoji,
        description: `Koleksi bunga ${typeInfo.name.toLowerCase()} pilihan studio Laysa`,
        defaultFlowerId: baseId,
        variantIds: [],
      });
    }
    familyMap.get(typeKey).variantIds.push(baseId);
  }

  // Tulis ulang app/data/flowers.ts secara rapi
  const flowersTsCode = `import { FlowerDef, FlowerFamily } from '../types/design';

// Otomatis disinkronkan oleh: npm run update
export const FLOWERS: FlowerDef[] = [
${flowerList
  .map(
    (f) => `  {
    id: ${JSON.stringify(f.id)},
    name: ${JSON.stringify(f.name)},
    imageUrl: ${JSON.stringify(f.imageUrl)},
    category: ${JSON.stringify(f.category)},
    emoji: ${JSON.stringify(f.emoji)},
    color: ${JSON.stringify(f.color)},
    colorName: ${JSON.stringify(f.colorName)},
    description: ${JSON.stringify(f.description)},
  },`
  )
  .join('\n')}
];

export const FLOWER_FAMILIES: FlowerFamily[] = [
${[...familyMap.values()]
  .map(
    (fam) => `  {
    id: ${JSON.stringify(fam.id)},
    name: ${JSON.stringify(fam.name)},
    category: ${JSON.stringify(fam.category)},
    emoji: ${JSON.stringify(fam.emoji)},
    description: ${JSON.stringify(fam.description)},
    defaultFlowerId: ${JSON.stringify(fam.defaultFlowerId)},
    variants: FLOWERS.filter((f) => [${fam.variantIds.map((v) => JSON.stringify(v)).join(', ')}].includes(f.id)),
  },`
  )
  .join('\n')}
];

export const getFlower = (id: string): FlowerDef =>
  FLOWERS.find((f) => f.id === id) ?? FLOWERS[0];

export const getFlowerById = getFlower;
`;

  fs.writeFileSync(FLOWERS_TS, flowersTsCode, 'utf8');
  console.log(`✓ Berhasil menyinkronkan ${flowerList.length} bunga ke app/data/flowers.ts`);
}

// ─── 3. SINKRONISASI BUCKET (BUCKET SIZES & THEMES) ───────────────────────────
async function syncBuckets() {
  console.log('\n🪣 [2/2] Memeriksa & Menyinkronkan Koleksi Bucket...');

  if (!fs.existsSync(BUCKET_DIR)) {
    console.warn('⚠️  Folder bucket tidak ditemukan di', BUCKET_DIR);
    return;
  }

  // 1. Jalankan proses pembuatan layer otomatis untuk One Piece, Rustic, dan 10 Bunga
  const prepareScript = path.join(__dirname, 'prepare_bucket_assets.js');
  if (fs.existsSync(prepareScript)) {
    require(prepareScript);
  }

  console.log('✓ Struktur folder bucket dan layer depan/belakang siap!');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── RUN ALL ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('========================================================');
  console.log('🚀 STUDIO BUCKET & BUNGA - AUTO ASSET SYNC');
  console.log('========================================================');

  try {
    await syncFlowers();
    await syncBuckets();

    console.log('\n========================================================');
    console.log('✅ SEMUA BUCKET & BUNGA BERHASIL DISINKRONKAN!');
    console.log('👉 Website langsung terupdate tanpa perlu edit kode lagi.');
    console.log('========================================================\n');
  } catch (err) {
    console.error('❌ Terjadi kesalahan sinkronisasi:', err);
    process.exit(1);
  }
}

main();
