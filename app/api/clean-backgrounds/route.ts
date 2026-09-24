import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

const ROOT_BUCKET = path.join(process.cwd(), 'public', 'images', 'bucket');
const DIR_25 = path.join(ROOT_BUCKET, 'ukuran bucket 25 bucket');
const DIR_EXTRA = path.join(ROOT_BUCKET, 'bucket tambahan');

// Daftar bucket yang perlu dibersihkan background-nya secara menyeluruh
const BUCKET_DEFINITIONS = [
  { folder: 'bucket naruto', base: 'bucket-1', alias: 'naruto-1', collarRatio: 0.38 },
  { folder: 'bucket kuromi', base: 'bucket-1', alias: 'kuromi-1', collarRatio: 0.28 },
  { folder: 'bucket stitch', base: 'bucket-1', alias: 'stitch-1', collarRatio: 0.46 },
  { folder: 'bucket doraemon', base: 'bucket-1', alias: 'doraemon-1', collarRatio: 0.44 },
  { folder: 'bucket cinnamoroll', base: 'bucket-1', alias: 'cinnamoroll-1', collarRatio: 0.46 },
  { folder: 'bucket koran', base: 'bucket-1', alias: 'koran-1', collarRatio: 0.50 },
  { folder: 'bucket koran', base: 'bucket-2', alias: 'koran-2', collarRatio: 0.22 },
  { folder: 'bucket totoro', base: 'bucket-1', alias: 'totoro-1', collarRatio: 0.38 },
  { folder: 'bucket sailormoon', base: 'bucket-1', alias: 'sailormoon-1', collarRatio: 0.42 },
  { folder: 'bucket pikachu', base: 'bucket-1', alias: 'pikachu-1', collarRatio: 0.35 },
  { folder: 'bucket hellokitty', base: 'bucket-1', alias: 'hellokitty-1', collarRatio: 0.34 },
  { folder: 'bucket heart', base: 'bucket-1', alias: 'heart-1', collarRatio: 0.48 },
  { folder: 'bucket onepiece', base: 'bucket-2', alias: 'onepiece-2', collarRatio: 0.58 },
];

/**
 * Pembersihan background tingkat studio profesional:
 * 1. Flood-fill BFS dari seluruh 4 sisi tepi luar gambar (atas, bawah, kiri, kanan).
 * 2. Mendeteksi gradasi studio putih, abu-abu halus, dan bayangan lantai studio (luma > 165, chroma < 22).
 * 3. Menghapus 100% background tanpa menyentuh bagian putih/elemen di dalam buket.
 * 4. Defringing: membersihkan sisa halo putih di tepian agar transparan murni dan tajam.
 */
async function cleanBackgroundStudio(inputBuffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const isBg = new Uint8Array(width * height);
  const queue: number[] = [];

  const isBackgroundPixel = (x: number, y: number): boolean => {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    // Jika sudah transparan
    if (a < 15) return true;

    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const chroma = maxC - minC;
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

    // Studio white background & light vignette
    if (luma > 215 && chroma < 35) return true;

    // Studio floor shadow (bayangan abu-abu di bawah buket pada meja putih)
    if (luma > 160 && chroma < 20) return true;

    // Very bright near-white edges
    if (r > 230 && g > 230 && b > 230) return true;

    return false;
  };

  // 1. Masukkan semua pixel tepi (perimeter) yang cocok sebagai background
  for (let x = 0; x < width; x++) {
    // Top border
    if (isBackgroundPixel(x, 0)) {
      const pIdx = x;
      isBg[pIdx] = 1;
      queue.push(pIdx);
    }
    // Bottom border
    if (isBackgroundPixel(x, height - 1)) {
      const pIdx = (height - 1) * width + x;
      isBg[pIdx] = 1;
      queue.push(pIdx);
    }
  }

  for (let y = 0; y < height; y++) {
    // Left border
    if (isBackgroundPixel(0, y)) {
      const pIdx = y * width;
      if (!isBg[pIdx]) {
        isBg[pIdx] = 1;
        queue.push(pIdx);
      }
    }
    // Right border
    if (isBackgroundPixel(width - 1, y)) {
      const pIdx = y * width + (width - 1);
      if (!isBg[pIdx]) {
        isBg[pIdx] = 1;
        queue.push(pIdx);
      }
    }
  }

  // 2. BFS Flood Fill dari tepi ke dalam
  let head = 0;
  const dx = [0, 0, 1, -1];
  const dy = [1, -1, 0, 0];

  while (head < queue.length) {
    const cur = queue[head++];
    const cx = cur % width;
    const cy = Math.floor(cur / width);

    for (let i = 0; i < 4; i++) {
      const nx = cx + dx[i];
      const ny = cy + dy[i];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!isBg[nIdx] && isBackgroundPixel(nx, ny)) {
          isBg[nIdx] = 1;
          queue.push(nIdx);
        }
      }
    }
  }

  // 3. Terapkan transparansi dan defringing pada pixel yang terhubung ke background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const dIdx = pIdx * channels;

      if (isBg[pIdx]) {
        const r = data[dIdx];
        const g = data[dIdx + 1];
        const b = data[dIdx + 2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;

        // Jika sangat terang (background studio murni), buat 100% transparan
        if (luma > 230) {
          data[dIdx + 3] = 0;
        } else if (luma > 175) {
          // Feathering halus untuk bayangan tipis
          const alphaFade = Math.max(0, Math.min(255, Math.floor((230 - luma) * 3)));
          data[dIdx + 3] = Math.min(data[dIdx + 3], alphaFade);
        } else {
          // Bayangan pekat di bawah dasar buket
          data[dIdx + 3] = 0;
        }
      }
    }
  }

  // Defringe filter: hapus halo putih dari pixel semi-transparan
  for (let i = 0; i < width * height; i++) {
    const idx = i * channels;
    const a = data[idx + 3];
    if (a > 0 && a < 255) {
      const alphaRatio = a / 255;
      // Hilangkan kontaminasi warna putih (255)
      data[idx] = Math.min(255, Math.max(0, Math.round((data[idx] - 255 * (1 - alphaRatio)) / alphaRatio)));
      data[idx + 1] = Math.min(255, Math.max(0, Math.round((data[idx + 1] - 255 * (1 - alphaRatio)) / alphaRatio)));
      data[idx + 2] = Math.min(255, Math.max(0, Math.round((data[idx + 2] - 255 * (1 - alphaRatio)) / alphaRatio)));
    }
  }

  return sharp(data, {
    raw: { width, height, channels },
  }).png().toBuffer();
}

export async function GET() {
  const results: string[] = [];

  for (const item of BUCKET_DEFINITIONS) {
    const themeDir = path.join(DIR_25, item.folder);
    const srcFile = path.join(themeDir, `${item.base}.png`);

    if (!fs.existsSync(srcFile)) {
      continue;
    }

    try {
      const srcBuf = fs.readFileSync(srcFile);
      const cleanPng = await cleanBackgroundStudio(srcBuf);

      const meta = await sharp(cleanPng).metadata();
      const w = meta.width || 800;
      const h = meta.height || 800;

      // 1. Simpan clean PNG preview & back di folder tema
      fs.writeFileSync(srcFile, cleanPng);
      fs.writeFileSync(path.join(themeDir, `${item.base}_back.png`), cleanPng);

      // 2. Buat front layer yang bersih
      const collarY = Math.round(h * item.collarRatio);
      const frontMaskSvg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="12%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="1" />
          </linearGradient>
        </defs>
        <rect x="0" y="${collarY}" width="${w}" height="${h - collarY}" fill="url(#fade)" />
      </svg>`;

      const maskBuf = await sharp(Buffer.from(frontMaskSvg)).png().toBuffer();
      const frontPng = await sharp(cleanPng)
        .composite([{ input: maskBuf, blend: 'dest-in' }])
        .png()
        .toBuffer();

      fs.writeFileSync(path.join(themeDir, `${item.base}_front.png`), frontPng);

      // 3. Salin juga ke root convenience alias
      fs.writeFileSync(path.join(ROOT_BUCKET, `${item.alias}.png`), cleanPng);
      fs.writeFileSync(path.join(ROOT_BUCKET, `${item.alias}_back.png`), cleanPng);
      fs.writeFileSync(path.join(ROOT_BUCKET, `${item.alias}_front.png`), frontPng);

      results.push(`✓ Bersih: ${item.alias}`);
    } catch (err: any) {
      results.push(`✗ Gagal ${item.alias}: ${err.message}`);
    }
  }

  return NextResponse.json({
    status: 'success',
    message: 'Semua background bucket berhasil dibersihkan dengan BFS Flood Fill & Defringing studio!',
    results,
  });
}
