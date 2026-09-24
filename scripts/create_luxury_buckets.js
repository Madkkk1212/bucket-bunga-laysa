const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BUCKET_DIR = path.join(__dirname, '..', 'public', 'images', 'bucket');

async function createLuxuryBuckets() {
  const baseBackSrc = path.join(BUCKET_DIR, 'bucket-1_back.png');
  const baseFrontSrc = path.join(BUCKET_DIR, 'bucket-1_front.png');
  const baseFullSrc = path.join(BUCKET_DIR, 'bucket-1.png');

  if (!fs.existsSync(baseBackSrc) || !fs.existsSync(baseFrontSrc)) {
    console.error('Base bucket files not found');
    process.exit(1);
  }

  console.log('Reading base assets...');
  const backMeta = await sharp(baseBackSrc).metadata();
  const frontMeta = await sharp(baseFrontSrc).metadata();

  console.log('Back size:', backMeta.width, 'x', backMeta.height);
  console.log('Front size:', frontMeta.width, 'x', frontMeta.height);

  // ─── 1. IMPERIAL BLACK & GOLD (Grand Luxury) ──────────────────────────────────
  // Deep obsidian dark body with radiant gold foil borders & warm highlights
  console.log('Creating Luxury Gold...');
  const goldTintBack = await sharp(baseBackSrc)
    .modulate({ brightness: 1.05, saturation: 1.3 })
    .tint({ r: 255, g: 215, b: 60 })
    .toBuffer();

  // Blend with dark obsidian base
  const luxuryGoldBack = await sharp(baseBackSrc)
    .composite([
      { input: goldTintBack, blend: 'color-dodge', opacity: 0.35 },
    ])
    .png()
    .toFile(path.join(BUCKET_DIR, 'luxury-gold_back.png'));

  const goldTintFront = await sharp(baseFrontSrc)
    .modulate({ brightness: 1.1, saturation: 1.4 })
    .tint({ r: 255, g: 210, b: 50 })
    .toBuffer();

  await sharp(baseFrontSrc)
    .composite([
      { input: goldTintFront, blend: 'color-dodge', opacity: 0.40 },
    ])
    .png()
    .toFile(path.join(BUCKET_DIR, 'luxury-gold_front.png'));

  const goldTintFull = await sharp(baseFullSrc)
    .modulate({ brightness: 1.05, saturation: 1.3 })
    .tint({ r: 255, g: 215, b: 60 })
    .toBuffer();

  await sharp(baseFullSrc)
    .composite([
      { input: goldTintFull, blend: 'color-dodge', opacity: 0.35 },
    ])
    .png()
    .toFile(path.join(BUCKET_DIR, 'luxury-gold.png'));

  // ─── 2. FRENCH CHAMPAGNE & ROSE GOLD (Grand Elegance) ─────────────────────────
  // Soft lustrous champagne pearl with rose gold warm pink undertones
  console.log('Creating Luxury Champagne Rose...');
  const champTintBack = await sharp(baseBackSrc)
    .negate({ alpha: false }) // invert darks to radiant silk whites
    .modulate({ brightness: 0.95, saturation: 0.85 })
    .tint({ r: 245, g: 220, b: 210 })
    .toBuffer();

  await sharp(champTintBack)
    .png()
    .toFile(path.join(BUCKET_DIR, 'luxury-champagne_back.png'));

  const champTintFront = await sharp(baseFrontSrc)
    .negate({ alpha: false })
    .modulate({ brightness: 0.95, saturation: 0.85 })
    .tint({ r: 245, g: 220, b: 210 })
    .toBuffer();

  await sharp(champTintFront)
    .png()
    .toFile(path.join(BUCKET_DIR, 'luxury-champagne_front.png'));

  const champTintFull = await sharp(baseFullSrc)
    .negate({ alpha: false })
    .modulate({ brightness: 0.95, saturation: 0.85 })
    .tint({ r: 245, g: 220, b: 210 })
    .toBuffer();

  await sharp(champTintFull)
    .png()
    .toFile(path.join(BUCKET_DIR, 'luxury-champagne.png'));

  // ─── 3. ROYAL EMERALD & GOLD FILIGREE (Grand Sultan) ──────────────────────────
  // Deep royal emerald green velvet with golden undertones
  console.log('Creating Luxury Emerald...');
  const emeraldTintBack = await sharp(baseBackSrc)
    .modulate({ brightness: 1.25, saturation: 1.6 })
    .tint({ r: 16, g: 110, b: 75 })
    .toBuffer();

  await sharp(baseBackSrc)
    .composite([
      { input: emeraldTintBack, blend: 'screen', opacity: 0.70 },
    ])
    .png()
    .toFile(path.join(BUCKET_DIR, 'luxury-emerald_back.png'));

  const emeraldTintFront = await sharp(baseFrontSrc)
    .modulate({ brightness: 1.3, saturation: 1.6 })
    .tint({ r: 16, g: 120, b: 80 })
    .toBuffer();

  await sharp(baseFrontSrc)
    .composite([
      { input: emeraldTintFront, blend: 'screen', opacity: 0.70 },
    ])
    .png()
    .toFile(path.join(BUCKET_DIR, 'luxury-emerald_front.png'));

  const emeraldTintFull = await sharp(baseFullSrc)
    .modulate({ brightness: 1.25, saturation: 1.6 })
    .tint({ r: 16, g: 110, b: 75 })
    .toBuffer();

  await sharp(baseFullSrc)
    .composite([
      { input: emeraldTintFull, blend: 'screen', opacity: 0.70 },
    ])
    .png()
    .toFile(path.join(BUCKET_DIR, 'luxury-emerald.png'));

  console.log('✓ All 3 luxury bouquet assets created successfully!');
}

createLuxuryBuckets().catch(console.error);
