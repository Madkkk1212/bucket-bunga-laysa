const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT_BUCKET = path.join(__dirname, '..', 'public', 'images', 'bucket');
const DIR_25 = path.join(ROOT_BUCKET, 'ukuran bucket 25 bucket');
const DIR_10 = path.join(ROOT_BUCKET, 'ukuran bucket 10 bunga');
const DIR_EXTRA = path.join(ROOT_BUCKET, 'bucket tambahan');

async function processOnePiece() {
  const opDir = path.join(DIR_25, 'bucket onepiece');
  const src = path.join(opDir, 'bucket-1.png');
  const meta = await sharp(src).metadata();
  const w = meta.width;
  const h = meta.height;

  // In sharp dest-in compositing, the alpha channel of the mask is used as destination alpha.
  // Therefore, transparent parts must have opacity 0, and visible parts opacity 1.
  const svgMask = `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <path d="
      M 40, 770
      C 60, 650 120, 620 180, 630
      C 260, 645 380, 672 496, 672
      C 530, 665 570, 645 615, 640
      C 680, 630 760, 610 855, 610
      C 900, 610 935, 630 965, 675
      L 970, 1077
      L 40, 1077
      Z
    " fill="#ffffff" fill-opacity="1" />
  </svg>`;

  const maskBuf = await sharp(Buffer.from(svgMask)).toBuffer();

  // Create front layer: only the front rim, ribbon, and mugiwara barrel body
  await sharp(src)
    .composite([{ input: maskBuf, blend: 'dest-in' }])
    .png()
    .toFile(path.join(opDir, 'bucket-1_front.png'));

  // Create back layer: the complete image (includes flags, poster, interior deck, floral background)
  await sharp(src)
    .png()
    .toFile(path.join(opDir, 'bucket-1_back.png'));

  // ─── Process One Piece Bucket 2 (Harta Karun & Chibi Crew) ───
  const src2 = path.join(opDir, 'bucket-2.png');
  if (fs.existsSync(src2)) {
    // Upscale to 800x800 with lanczos3
    const upscaled2Buffer = await sharp(src2)
      .resize(800, 800, { kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 0.8 })
      .png()
      .toBuffer();

    const svgMask2 = `
    <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
      <path d="
        M 0, 540
        C 60, 450 180, 430 400, 435
        C 580, 430 720, 450 800, 540
        L 800, 800
        L 0, 800
        Z
      " fill="#ffffff" fill-opacity="1" />
    </svg>`;

    const maskBuf2 = await sharp(Buffer.from(svgMask2)).toBuffer();

    // Front layer: front rim, ribbons, and sleeping chibi Luffy & Zoro
    await sharp(upscaled2Buffer)
      .composite([{ input: maskBuf2, blend: 'dest-in' }])
      .png()
      .toFile(path.join(opDir, 'bucket-2_front.png'));

    // Back layer: complete image with Den Den Mushi, treasure, flags, and sleeping crew
    await sharp(upscaled2Buffer)
      .png()
      .toFile(path.join(opDir, 'bucket-2_back.png'));

    // Also write high-res version of bucket-2
    await sharp(upscaled2Buffer)
      .png()
      .toFile(path.join(opDir, 'bucket-2_hd.png'));

    console.log('✓ One Piece Bucket 2 layers prepared in', opDir);
  }

  console.log('✓ One Piece layers prepared in', opDir);
}

async function processRusticBarrel() {
  const src = path.join(DIR_EXTRA, 'Untitled design.png');
  if (!fs.existsSync(src)) {
    console.warn('Rustic barrel source not found at', src);
    return;
  }
  const meta = await sharp(src).metadata();
  const w = meta.width;
  const h = meta.height;

  // Barrel dimensions: 282 x 320
  // Top inner hole is at y=25..95. Front rim lip is at y=95..100.
  // Front layer: y >= 96 (the front wall of the barrel)
  const svgMaskFront = `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="141" cy="98" rx="114" ry="18" fill="#ffffff" fill-opacity="1" />
    <rect x="0" y="98" width="${w}" height="${h - 98}" fill="#ffffff" fill-opacity="1" />
  </svg>`;

  const maskBufFront = await sharp(Buffer.from(svgMaskFront)).toBuffer();

  const outDir = DIR_EXTRA;
  // Save rustic-barrel.png (full)
  await sharp(src).png().toFile(path.join(outDir, 'rustic-barrel.png'));
  
  // Save rustic-barrel_back.png (full barrel as back foundation)
  await sharp(src).png().toFile(path.join(outDir, 'rustic-barrel_back.png'));

  // Save rustic-barrel_front.png (front wall with ellipse opening)
  await sharp(src)
    .composite([{ input: maskBufFront, blend: 'dest-in' }])
    .png()
    .toFile(path.join(outDir, 'rustic-barrel_front.png'));

  console.log('✓ Rustic Barrel layers prepared in', outDir);
}

async function process10FlowerBuckets() {
  const dir10Bucket1 = path.join(DIR_10, 'bucket-1');
  if (!fs.existsSync(dir10Bucket1)) {
    fs.mkdirSync(dir10Bucket1, { recursive: true });
  }

  const src25Bucket1 = path.join(DIR_25, 'bucket-1');

  // We copy and optimize Korean Noir, Kraft, and Pastel Rose for 10-flower compact size
  const files = [
    'bucket-1.png', 'bucket-1_back.png', 'bucket-1_front.png',
    'bucket-2.png', 'bucket-2_back.png', 'bucket-2_front.png',
    'bucket-3.png', 'bucket-3_back.png', 'bucket-3_front.png',
  ];

  for (const file of files) {
    const srcFile = path.join(src25Bucket1, file);
    const destFile = path.join(dir10Bucket1, file);
    if (fs.existsSync(srcFile)) {
      // Scale down slightly for petite compact ratio (width ~ 900)
      const meta = await sharp(srcFile).metadata();
      const targetW = Math.round(meta.width * 0.85);
      await sharp(srcFile)
        .resize({ width: targetW })
        .png()
        .toFile(destFile);
    }
  }
  console.log('✓ Ukuran 10 Bunga assets prepared in', dir10Bucket1);
}

async function createConvenienceAliases() {
  // Ensure common root files exist so /images/bucket/bucket-1.png etc never 404
  const src25Bucket1 = path.join(DIR_25, 'bucket-1');
  const files = [
    'bucket-1.png', 'bucket-1_back.png', 'bucket-1_front.png',
    'bucket-2.png', 'bucket-2_back.png', 'bucket-2_front.png',
    'bucket-3.png', 'bucket-3_back.png', 'bucket-3_front.png',
  ];

  for (const file of files) {
    const srcFile = path.join(src25Bucket1, file);
    const destFile = path.join(ROOT_BUCKET, file);
    if (fs.existsSync(srcFile) && !fs.existsSync(destFile)) {
      fs.copyFileSync(srcFile, destFile);
    }
  }

  // Copy One Piece aliases to root /images/bucket/ for clean URLs
  const opDir = path.join(DIR_25, 'bucket onepiece');
  fs.copyFileSync(path.join(opDir, 'bucket-1.png'), path.join(ROOT_BUCKET, 'onepiece-1.png'));
  fs.copyFileSync(path.join(opDir, 'bucket-1_back.png'), path.join(ROOT_BUCKET, 'onepiece-1_back.png'));
  fs.copyFileSync(path.join(opDir, 'bucket-1_front.png'), path.join(ROOT_BUCKET, 'onepiece-1_front.png'));

  // Copy One Piece 2 aliases (using high-res hd version for image preview)
  fs.copyFileSync(path.join(opDir, 'bucket-2_hd.png'), path.join(ROOT_BUCKET, 'onepiece-2.png'));
  fs.copyFileSync(path.join(opDir, 'bucket-2_back.png'), path.join(ROOT_BUCKET, 'onepiece-2_back.png'));
  fs.copyFileSync(path.join(opDir, 'bucket-2_front.png'), path.join(ROOT_BUCKET, 'onepiece-2_front.png'));

  // Copy 10-flower buckets as mini-* aliases to root
  const dir10Bucket1 = path.join(DIR_10, 'bucket-1');
  for (let i = 1; i <= 3; i++) {
    fs.copyFileSync(path.join(dir10Bucket1, `bucket-${i}.png`), path.join(ROOT_BUCKET, `mini-${i}.png`));
    fs.copyFileSync(path.join(dir10Bucket1, `bucket-${i}_back.png`), path.join(ROOT_BUCKET, `mini-${i}_back.png`));
    fs.copyFileSync(path.join(dir10Bucket1, `bucket-${i}_front.png`), path.join(ROOT_BUCKET, `mini-${i}_front.png`));
  }

  // Copy Rustic aliases to root
  fs.copyFileSync(path.join(DIR_EXTRA, 'rustic-barrel.png'), path.join(ROOT_BUCKET, 'rustic-barrel.png'));
  fs.copyFileSync(path.join(DIR_EXTRA, 'rustic-barrel_back.png'), path.join(ROOT_BUCKET, 'rustic-barrel_back.png'));
  fs.copyFileSync(path.join(DIR_EXTRA, 'rustic-barrel_front.png'), path.join(ROOT_BUCKET, 'rustic-barrel_front.png'));

  // Copy All Themed Buckets (Naruto, Kuromi, Stitch, Doraemon, Cinnamoroll, Totoro, Sailor Moon, Pikachu, Hello Kitty, Koran, Heart)
  const THEMED_FOLDERS = [
    { folder: 'bucket naruto', base: 'bucket-1', alias: 'naruto-1' },
    { folder: 'bucket kuromi', base: 'bucket-1', alias: 'kuromi-1' },
    { folder: 'bucket stitch', base: 'bucket-1', alias: 'stitch-1' },
    { folder: 'bucket doraemon', base: 'bucket-1', alias: 'doraemon-1' },
    { folder: 'bucket cinnamoroll', base: 'bucket-1', alias: 'cinnamoroll-1' },
    { folder: 'bucket koran', base: 'bucket-1', alias: 'koran-1' },
    { folder: 'bucket koran', base: 'bucket-2', alias: 'koran-2' },
    { folder: 'bucket totoro', base: 'bucket-1', alias: 'totoro-1' },
    { folder: 'bucket sailormoon', base: 'bucket-1', alias: 'sailormoon-1' },
    { folder: 'bucket pikachu', base: 'bucket-1', alias: 'pikachu-1' },
    { folder: 'bucket hellokitty', base: 'bucket-1', alias: 'hellokitty-1' },
    { folder: 'bucket heart', base: 'bucket-1', alias: 'heart-1' },
  ];

  for (const item of THEMED_FOLDERS) {
    const themeDir = path.join(DIR_25, item.folder);
    const files = [
      { src: `${item.base}.png`, dest: `${item.alias}.png` },
      { src: `${item.base}_back.png`, dest: `${item.alias}_back.png` },
      { src: `${item.base}_front.png`, dest: `${item.alias}_front.png` },
    ];
    for (const f of files) {
      const srcPath = path.join(themeDir, f.src);
      const destPath = path.join(ROOT_BUCKET, f.dest);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  console.log('✓ Root convenience aliases created in', ROOT_BUCKET);
}

async function run() {
  await processOnePiece();
  await processRusticBarrel();
  await process10FlowerBuckets();
  await createConvenienceAliases();
  console.log('★ All bucket assets processed successfully!');
}

run().catch((err) => {
  console.error('Error processing assets:', err);
  process.exit(1);
});
