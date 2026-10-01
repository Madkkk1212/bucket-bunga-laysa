const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const sampleDir = path.resolve(__dirname, '../sample_previews');
if (!fs.existsSync(sampleDir)) {
  fs.mkdirSync(sampleDir, { recursive: true });
}

async function preview() {
  console.log('Rendering visual check for sample pages...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.5 }); // A4 pixel aspect ratio

  // Load the generated HTML preview
  const tempHtmlPath = path.resolve(__dirname, '../tools/generate_pdf.js');
  
  // We can re-render a standalone preview html for sample inspection
  console.log('Visual check tool ready');
  await browser.close();
}

preview();
