const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function checkImage(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`\n--- Inspecting: ${path.basename(filePath)} (${width}x${height}, ch: ${channels}) ---`);
  
  // Sample 4 corners
  const corners = [
    { name: 'Top-Left', x: 0, y: 0 },
    { name: 'Top-Right', x: width - 1, y: 0 },
    { name: 'Bottom-Left', x: 0, y: height - 1 },
    { name: 'Bottom-Right', x: width - 1, y: height - 1 },
    { name: 'Bottom-Center', x: Math.floor(width / 2), y: height - 5 },
    { name: 'Mid-Left', x: 5, y: Math.floor(height / 2) },
    { name: 'Mid-Right', x: width - 6, y: Math.floor(height / 2) },
  ];

  for (const c of corners) {
    const idx = (c.y * width + c.x) * channels;
    console.log(`${c.name} (${c.x},${c.y}): R=${data[idx]}, G=${data[idx+1]}, B=${data[idx+2]}, A=${data[idx+3]}`);
  }
}

async function main() {
  const root = path.join(__dirname, '..', 'public', 'images', 'bucket');
  await checkImage(path.join(root, 'naruto-1.png'));
  await checkImage(path.join(root, 'cinnamoroll-1.png'));
  await checkImage(path.join(root, 'doraemon-1.png'));
  await checkImage(path.join(root, 'heart-1.png'));
}

main().catch(console.error);
