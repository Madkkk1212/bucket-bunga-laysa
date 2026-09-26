const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function makeTransparent() {
  const inputPath = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\29a654de-e4f1-468c-8ccc-aff698dd51fb\\mobile_hero_bouquet_1790422917165.jpg';
  const outputPath = path.join(__dirname, '..', 'public', 'images', 'mobile-hero-bouquet.png');

  if (!fs.existsSync(inputPath)) {
    console.error('Input not found:', inputPath);
    return;
  }

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Helper to test if a pixel is part of the checkerboard (gray or white background)
  function isCheckerboard(r, g, b) {
    const isGray = (r > 195 && r < 225 && g > 195 && g < 225 && b > 195 && b < 225 && Math.abs(r - g) < 8 && Math.abs(g - b) < 8);
    const isWhite = (r > 240 && g > 240 && b > 240 && Math.abs(r - g) < 8 && Math.abs(g - b) < 8);
    return isGray || isWhite;
  }

  // Seed boundary pixels
  for (let x = 0; x < width; x++) {
    queue.push([x, 0]);
    queue.push([x, height - 1]);
  }
  for (let y = 0; y < height; y++) {
    queue.push([0, y]);
    queue.push([width - 1, y]);
  }

  while (queue.length > 0) {
    const [cx, cy] = queue.pop();
    const idx2d = cy * width + cx;
    if (visited[idx2d]) continue;
    visited[idx2d] = 1;

    const pIdx = idx2d * channels;
    const r = data[pIdx];
    const g = data[pIdx + 1];
    const b = data[pIdx + 2];

    if (isCheckerboard(r, g, b)) {
      data[pIdx + 3] = 0; // Alpha 0 (transparent)

      // Check neighbors
      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx2d = ny * width + nx;
          if (!visited[nIdx2d]) {
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  console.log('Saved transparent hero bouquet to:', outputPath);
}

makeTransparent().catch(console.error);
