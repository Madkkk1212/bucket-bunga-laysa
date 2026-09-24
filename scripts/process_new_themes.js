const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Lenovo/.gemini/antigravity-ide/brain/75965b27-8216-458b-9be1-d1cc76412298';
const BASE_BUCKET = path.join(__dirname, '..', 'public', 'images', 'bucket');
const DIR_25 = path.join(BASE_BUCKET, 'ukuran bucket 25 bucket');

const THEMES = [
  {
    id: 'naruto',
    file: 'bucket_naruto_hokage_1790180775686.jpg',
    folder: 'bucket naruto',
    frontSplitY: 0.38, // from belt/knot down is front
    collarRatio: 0.36,
  },
  {
    id: 'kuromi',
    file: 'bucket_kuromi_gothic_1790180798579.jpg',
    folder: 'bucket kuromi',
    frontSplitY: 0.28, // from bow down is front
    collarRatio: 0.26,
  },
  {
    id: 'stitch',
    file: 'bucket_stitch_aloha_1790180885620.jpg',
    folder: 'bucket stitch',
    frontSplitY: 0.48, // from tropical bow down is front
    collarRatio: 0.45,
  },
  {
    id: 'koran',
    file: 'bucket_vintage_newspaper_1790181167965.jpg',
    folder: 'bucket koran',
    frontSplitY: 0.54, // from twine bow down is front
    collarRatio: 0.50,
  },
  {
    id: 'doraemon',
    file: 'bucket_doraemon_bell_1790181190288.jpg',
    folder: 'bucket doraemon',
    frontSplitY: 0.44, // from red bow and bell down is front
    collarRatio: 0.40,
  },
  {
    id: 'cinnamoroll',
    file: 'bucket_cinnamoroll_angel_1790181212356.jpg',
    folder: 'bucket cinnamoroll',
    frontSplitY: 0.48, // from pastel bow down is front
    collarRatio: 0.45,
  },
];

async function removeWhiteBackground(buffer, threshold = 246) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const out = Buffer.from(data);

  // Flood fill / background removal from edges
  const visited = new Uint8Array(w * h);
  const queue = [];

  // Seed with outer border pixels
  for (let x = 0; x < w; x++) {
    queue.push(x, 0);
    queue.push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    queue.push(0, y);
    queue.push(w - 1, y);
  }

  while (queue.length > 0) {
    const y = queue.pop();
    const x = queue.pop();
    const idx = y * w + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const pIdx = idx * 4;
    const r = out[pIdx], g = out[pIdx + 1], b = out[pIdx + 2];

    // Near white
    if (r >= threshold && g >= threshold && b >= threshold) {
      out[pIdx + 3] = 0; // Alpha = 0

      // Neighbors
      if (x > 0 && !visited[idx - 1]) queue.push(x - 1, y);
      if (x < w - 1 && !visited[idx + 1]) queue.push(x + 1, y);
      if (y > 0 && !visited[idx - w]) queue.push(x, y - 1);
      if (y < h - 1 && !visited[idx + w]) queue.push(x, y + 1);
    }
  }

  return sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function processAll() {
  for (const t of THEMES) {
    const srcPath = path.join(ARTIFACT_DIR, t.file);
    if (!fs.existsSync(srcPath)) {
      console.warn('Source image not found:', srcPath);
      continue;
    }

    const folderPath = path.join(DIR_25, t.folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    console.log(`Processing theme: ${t.id}...`);

    // 1. Make transparent
    const rawBuf = await sharp(srcPath).ensureAlpha().toBuffer();
    const transparentBuf = await removeWhiteBackground(rawBuf);

    const meta = await sharp(transparentBuf).metadata();
    const w = meta.width, h = meta.height;

    // Save full preview in folder & root alias
    const fullFileName = `${t.id}-1.png`;
    const fullFolderDest = path.join(folderPath, 'bucket-1.png');
    const fullRootDest = path.join(BASE_BUCKET, fullFileName);

    await sharp(transparentBuf).png().toFile(fullFolderDest);
    await sharp(transparentBuf).png().toFile(fullRootDest);

    // Save back layer
    const backFolderDest = path.join(folderPath, 'bucket-1_back.png');
    const backRootDest = path.join(BASE_BUCKET, `${t.id}-1_back.png`);
    await sharp(transparentBuf).png().toFile(backFolderDest);
    await sharp(transparentBuf).png().toFile(backRootDest);

    // Create front layer: keep pixels below frontSplitY * h
    const splitY = Math.round(t.frontSplitY * h);
    const svgMaskFront = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="${w / 2}" cy="${splitY}" rx="${w * 0.44}" ry="${h * 0.12}" fill="#ffffff" fill-opacity="1" />
      <rect x="0" y="${splitY}" width="${w}" height="${h - splitY}" fill="#ffffff" fill-opacity="1" />
    </svg>`;
    const maskBuf = await sharp(Buffer.from(svgMaskFront)).toBuffer();

    const frontBuf = await sharp(transparentBuf)
      .composite([{ input: maskBuf, blend: 'dest-in' }])
      .png()
      .toBuffer();

    const frontFolderDest = path.join(folderPath, 'bucket-1_front.png');
    const frontRootDest = path.join(BASE_BUCKET, `${t.id}-1_front.png`);
    await sharp(frontBuf).png().toFile(frontFolderDest);
    await sharp(frontBuf).png().toFile(frontRootDest);

    console.log(`✓ Theme ${t.id} successfully created in ${t.folder} and root aliases.`);
  }
}

processAll().then(() => console.log('★ All new themes processed successfully!'));
