/**
 * generate_bucket_images.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Script untuk generate aset gambar bucket bunga kertas secara otomatis
 * menggunakan Google Gemini Imagen API (gemini-2.0-flash-preview-image-generation).
 *
 * Usage:
 *   node scripts/generate_bucket_images.js
 *   node scripts/generate_bucket_images.js --bucket=buket-merah-elegant
 *   node scripts/generate_bucket_images.js --list
 *
 * Env:
 *   GEMINI_API_KEY=<your-api-key>  (atau set di .env.local)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// ── Load .env.local jika ada ──────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY tidak ditemukan!');
  console.error('   Tambahkan di .env.local:  GEMINI_API_KEY=your_key_here');
  console.error('   Atau jalankan: set GEMINI_API_KEY=your_key_here && node scripts/generate_bucket_images.js');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'bucket');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ─────────────────────────────────────────────────────────────────────────────
// KATALOG BUCKET YANG AKAN DI-GENERATE
// Setiap entry menghasilkan 3 file: {id}.png, {id}_back.png, {id}_front.png
// ─────────────────────────────────────────────────────────────────────────────
const BUCKET_CATALOG = [
  {
    id: 'buket-merah-elegant',
    label: 'Scarlet Elegance Wrap',
    style: 'deep scarlet red Korean-style origami bouquet wrapper',
    color: 'rich scarlet crimson red',
    accent: 'gold foil ribbon',
  },
  {
    id: 'buket-biru-royal',
    label: 'Royal Navy Korean Wrap',
    style: 'deep navy blue Korean-style origami bouquet wrapper',
    color: 'deep royal navy blue',
    accent: 'silver ribbon and white lace trim',
  },
  {
    id: 'buket-pink-peach',
    label: 'Peach Blossom Wrap',
    style: 'soft peach and blush Korean-style origami bouquet wrapper',
    color: 'warm peach blush pink',
    accent: 'rose gold satin ribbon',
  },
  {
    id: 'buket-hitam-gold',
    label: 'Obsidian Gold Premium',
    style: 'matte black luxury Korean-style origami bouquet wrapper',
    color: 'obsidian matte black',
    accent: 'shimmering gold foil border and ribbon',
  },
  {
    id: 'buket-putih-silver',
    label: 'Pearl White Ethereal',
    style: 'pure white silk Korean-style origami bouquet wrapper',
    color: 'pearlescent white',
    accent: 'silver glitter trim and white satin ribbon',
  },
  {
    id: 'buket-ungu-lavender',
    label: 'Lavender Dream Wrap',
    style: 'soft lavender purple Korean-style origami bouquet wrapper',
    color: 'soft lilac lavender purple',
    accent: 'purple satin ribbon with pearl beads',
  },
  {
    id: 'buket-hijau-sage',
    label: 'Sage Botanical Wrap',
    style: 'sage green botanical Korean-style origami bouquet wrapper',
    color: 'sage green with leaf motifs',
    accent: 'twine rope and dried botanical accents',
  },
  {
    id: 'buket-cokelat-kraft',
    label: 'Rustic Kraft Natural',
    style: 'natural kraft brown Korean-style origami bouquet wrapper',
    color: 'warm kraft brown recycled paper',
    accent: 'jute twine ribbon and dried flower pressed',
  },
  {
    id: 'buket-tiffany-mint',
    label: 'Tiffany Mint Luxe',
    style: 'Tiffany mint green luxury Korean-style origami bouquet wrapper',
    color: 'robin egg tiffany blue-mint',
    accent: 'white satin ribbon and pearl monogram',
  },
  {
    id: 'buket-ombre-sunset',
    label: 'Sunset Ombre Wrap',
    style: 'ombre gradient orange-pink-purple sunset Korean-style origami bouquet wrapper',
    color: 'ombre gradient from warm orange to hot pink to violet purple',
    accent: 'gold foil edge and chiffon ribbon',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

function buildFullPrompt(bucket) {
  return `A beautiful large paper flower bouquet (buket bunga kertas) product photo.
The bouquet wrapper/container is a ${bucket.style} made from ${bucket.color} paper.
The wrapper has elegant ${bucket.accent}.
The bouquet is LARGE and voluminous, filled with many handcrafted paper flowers made from tissue paper and crepe paper:
- Big fluffy paper roses in deep red and soft pink
- Large peony-shaped paper flowers in blush and cream
- Paper ranunculus in peach and coral colors
- Lush green paper leaves and eucalyptus sprigs
All flowers overflow beautifully from the top of the wrapper.
The wrapper has the typical Korean origami bouquet style: wide folded paper wings on both sides, neatly gathered at the bottom into a conical shape.
Product photography style: clean white/cream background, professional studio lighting, soft shadows, top-angled shot showing the full bouquet.
No watermarks, no hands, no text overlays. Premium luxury floral boutique aesthetic.
Ultra-realistic paper texture, photorealistic quality.`;
}

function buildBackPrompt(bucket) {
  return `A flat-lay isolated paper bouquet WRAPPER BACK view only.
This is the BACK/BEHIND portion of a ${bucket.style} Korean origami flower bouquet wrapper.
Color: ${bucket.color}. Accent: ${bucket.accent}.
The wrapper is spread out showing its wide origami-folded wings and the back paper face.
NO FLOWERS inside - only the empty wrapper paper itself.
The wrapper has beautiful paper texture: smooth ${bucket.color} paper with subtle folds and creases.
Shot from slightly above on a pure white background.
Complete transparent PNG cutout style: sharp edges, no shadow drop outside the wrapper.
No text, no watermarks, no human hands. Clean studio product shot.`;
}

function buildFrontPrompt(bucket) {
  return `A flat-lay isolated paper bouquet FRONT WRAP VIEW only.
This is the FRONT flap/lip of a ${bucket.style} Korean origami flower bouquet wrapper.
Color: ${bucket.color}. Accent: ${bucket.accent}.
The front flap is the lower front portion of the bouquet wrapper that covers/hides the flower stems.
It shows only the front face of the paper wrap: a V-shaped or trapezoidal front piece of beautifully folded ${bucket.color} paper.
The top edge is slightly scalloped or straight where flowers would emerge above.
The bottom is neatly gathered and tied with ${bucket.accent}.
Shot from straight front angle on a pure white background.
Isolated clean cutout, no shadow, no background color.
No text, no flowers visible, no human hands. Premium paper texture.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

async function generateImage(ai, prompt, outputPath) {
  console.log(`   Generating -> ${path.basename(outputPath)}`);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: prompt,
      config: {
        responseModalities: ['Text', 'Image'],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = Buffer.from(part.inlineData.data, 'base64');
        fs.writeFileSync(outputPath, imageData);
        console.log(`   OK  Saved: ${path.basename(outputPath)} (${(imageData.length / 1024).toFixed(1)} KB)`);
        return true;
      }
    }
    console.warn(`   WARN  No image in response for: ${path.basename(outputPath)}`);
    return false;
  } catch (err) {
    console.error(`   ERROR generating ${path.basename(outputPath)}: ${err.message}`);
    return false;
  }
}

async function generateBucket(ai, bucket) {
  console.log(`\nGenerating bucket: [${bucket.id}] ${bucket.label}`);

  const fullPath  = path.join(OUTPUT_DIR, `${bucket.id}.png`);
  const backPath  = path.join(OUTPUT_DIR, `${bucket.id}_back.png`);
  const frontPath = path.join(OUTPUT_DIR, `${bucket.id}_front.png`);

  // Generate secara serial agar tidak kena rate limit
  await generateImage(ai, buildFullPrompt(bucket),  fullPath);
  await new Promise(r => setTimeout(r, 800));
  await generateImage(ai, buildBackPrompt(bucket),  backPath);
  await new Promise(r => setTimeout(r, 800));
  await generateImage(ai, buildFrontPrompt(bucket), frontPath);

  console.log(`   Done: 3 files for [${bucket.id}]`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list')) {
    console.log('\nDaftar Bucket yang bisa di-generate:\n');
    BUCKET_CATALOG.forEach((b, i) => {
      console.log(`  ${String(i + 1).padStart(2)}. ${b.id.padEnd(32)} -> ${b.label}`);
    });
    console.log(`\nTotal: ${BUCKET_CATALOG.length} bucket`);
    console.log('\nUsage:');
    console.log('  node scripts/generate_bucket_images.js              -> generate semua');
    console.log('  node scripts/generate_bucket_images.js --bucket=buket-merah-elegant');
    return;
  }

  const bucketArg = args.find(a => a.startsWith('--bucket='));
  let targets = BUCKET_CATALOG;
  if (bucketArg) {
    const bucketId = bucketArg.replace('--bucket=', '');
    const found = BUCKET_CATALOG.find(b => b.id === bucketId);
    if (!found) {
      console.error(`Bucket "${bucketId}" tidak ditemukan. Gunakan --list untuk melihat daftar.`);
      process.exit(1);
    }
    targets = [found];
  }

  console.log('Buket Bunga Kertas - Gemini Imagen Generator');
  console.log('=============================================');
  console.log(`Output dir : ${OUTPUT_DIR}`);
  console.log(`Target     : ${targets.length} bucket (${targets.length * 3} images)`);
  console.log(`Model      : gemini-2.0-flash-preview-image-generation`);
  console.log('');

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  for (const bucket of targets) {
    await generateBucket(ai, bucket);
    if (targets.indexOf(bucket) < targets.length - 1) {
      console.log('   Waiting 2s before next bucket...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\n=============================================');
  console.log(`Selesai! ${targets.length * 3} gambar di-generate untuk ${targets.length} bucket`);
  console.log(`Tersimpan di: ${OUTPUT_DIR}`);
  console.log('');
  console.log('Langkah selanjutnya:');
  console.log('  1. Tambahkan entry baru di app/data/buckets.ts');
  console.log('  2. Set image: "/images/bucket/<bucket-id>.png"');
  console.log('  3. Jalankan: npm run dev untuk preview');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
