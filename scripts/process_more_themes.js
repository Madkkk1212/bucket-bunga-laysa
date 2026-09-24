const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\75965b27-8216-458b-9be1-d1cc76412298';
const ROOT_BUCKET = path.join(__dirname, '..', 'public', 'images', 'bucket');
const DIR_25 = path.join(ROOT_BUCKET, 'ukuran bucket 25 bucket');

const NEW_THEMES = [
  {
    theme: 'totoro',
    srcFilename: 'bucket_totoro_forest_1790181730408.jpg',
    folderName: 'bucket totoro',
    fileBase: 'bucket-1',
    aliasBase: 'totoro-1',
    // Opening is at y ratio ~ 0.38, twine at ~ 0.54
    collarRatio: 0.38,
  },
  {
    theme: 'sailormoon',
    srcFilename: 'bucket_sailormoon_cosmic_1790181745309.jpg',
    folderName: 'bucket sailormoon',
    fileBase: 'bucket-1',
    aliasBase: 'sailormoon-1',
    // Inner lining top is 0.15, front folds & moon brooch begin at 0.42
    collarRatio: 0.42,
  },
  {
    theme: 'pikachu',
    srcFilename: 'bucket_pikachu_spark_1790181762693.jpg',
    folderName: 'bucket pikachu',
    fileBase: 'bucket-1',
    aliasBase: 'pikachu-1',
    // Black corrugated lining is top 0.20-0.34, front yellow lapels begin at 0.35
    collarRatio: 0.35,
  },
  {
    theme: 'hellokitty',
    srcFilename: 'bucket_hellokitty_sweet_1790181784992.jpg',
    folderName: 'bucket hellokitty',
    fileBase: 'bucket-1',
    aliasBase: 'hellokitty-1',
    // White lace rim at 0.14, front pink wrap & giant red bow start at 0.34
    collarRatio: 0.34,
  },
  {
    theme: 'koran_botanical',
    srcFilename: 'bucket_koran_botanical_1790181812431.jpg',
    folderName: 'bucket koran',
    fileBase: 'bucket-2',
    aliasBase: 'koran-2',
    // Inner rim top is 0.16, front newspaper lip begins at 0.22
    collarRatio: 0.22,
  },
  {
    theme: 'heart',
    srcFilename: 'bucket_heart_velvet_1790181880582.jpg',
    folderName: 'bucket heart',
    fileBase: 'bucket-1',
    aliasBase: 'heart-1',
    // Heart lid is back, front rim of the box starts at 0.48
    collarRatio: 0.48,
  },
];

async function removeWhiteBackground(srcBuffer) {
  const { data, info } = await sharp(srcBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  // Threshold to determine pure white background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (r > 240 && g > 240 && b > 240) {
        // Linear fade for smooth edges
        const minVal = Math.min(r, g, b);
        if (minVal > 248) {
          data[idx + 3] = 0;
        } else {
          const alpha = Math.max(0, Math.floor(255 * (1 - (minVal - 240) / 8)));
          data[idx + 3] = Math.min(data[idx + 3], alpha);
        }
      }
    }
  }

  return sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  }).png().toBuffer();
}

async function processMoreThemes() {
  console.log('🚀 Memproses 6 Tema Baru (Totoro, Sailor Moon, Pikachu, Hello Kitty, Koran Botanical, Heart Velvet)...');

  for (const item of NEW_THEMES) {
    const srcPath = path.join(ARTIFACTS_DIR, item.srcFilename);
    if (!fs.existsSync(srcPath)) {
      console.warn('❌ Source file tidak ditemukan:', srcPath);
      continue;
    }

    console.log(`\n🎨 Memproses tema: ${item.theme} (${item.srcFilename})...`);

    // 1. Remove solid white background
    const transparentPng = await removeWhiteBackground(srcPath);

    // Get metadata
    const meta = await sharp(transparentPng).metadata();
    const w = meta.width;
    const h = meta.height;

    // 2. Prepare target directories
    const targetDir = path.join(DIR_25, item.folderName);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 3. Save full preview
    const fullTarget = path.join(targetDir, `${item.fileBase}.png`);
    await sharp(transparentPng).toFile(fullTarget);

    // 4. Save Back Layer (complete wrapper foundation)
    const backTarget = path.join(targetDir, `${item.fileBase}_back.png`);
    await sharp(transparentPng).toFile(backTarget);

    // 5. Create Front Layer (collar and below)
    const collarY = Math.round(h * item.collarRatio);
    const frontMaskSvg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="15%" stop-color="#ffffff" stop-opacity="1" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="1" />
        </linearGradient>
      </defs>
      <rect x="0" y="${collarY}" width="${w}" height="${h - collarY}" fill="url(#fade)" />
    </svg>`;

    const frontMaskBuf = await sharp(Buffer.from(frontMaskSvg)).png().toBuffer();

    const frontTarget = path.join(targetDir, `${item.fileBase}_front.png`);
    await sharp(transparentPng)
      .composite([{ input: frontMaskBuf, blend: 'dest-in' }])
      .png()
      .toFile(frontTarget);

    // 6. Create convenience root aliases
    const rootFull = path.join(ROOT_BUCKET, `${item.aliasBase}.png`);
    const rootBack = path.join(ROOT_BUCKET, `${item.aliasBase}_back.png`);
    const rootFront = path.join(ROOT_BUCKET, `${item.aliasBase}_front.png`);

    fs.copyFileSync(fullTarget, rootFull);
    fs.copyFileSync(backTarget, rootBack);
    fs.copyFileSync(frontTarget, rootFront);

    console.log(`✓ Sukses membuat ${item.theme}:`);
    console.log(`   - Folder: ${targetDir}`);
    console.log(`   - Alias: ${item.aliasBase}.png`);
  }

  console.log('\n✨ Semua 6 tema baru berhasil diproses dan disimpan!');
}

processMoreThemes().catch((err) => {
  console.error('❌ Error processing themes:', err);
  process.exit(1);
});
