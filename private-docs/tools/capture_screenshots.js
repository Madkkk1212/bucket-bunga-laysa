const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const imgDir = path.join(__dirname, '../images');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

async function run() {
  console.log('Launching browser with:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

  try {
    // 1. Home
    console.log('Capturing Home...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(imgDir, 'home_desktop.png') });

    // 2. Menu
    console.log('Capturing Menu...');
    await page.goto('http://localhost:3000/menu', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(imgDir, 'menu_desktop.png') });

    // 3. Studio Designer
    console.log('Capturing Studio Designer...');
    await page.goto('http://localhost:3000/designer', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(imgDir, 'studio_desktop.png') });

    // 4. Tutorial
    console.log('Capturing Tutorial...');
    await page.goto('http://localhost:3000/tutorial', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(imgDir, 'tutorial_desktop.png') });

    // 5. Create a sample gift and capture gift receiver page
    console.log('Generating sample gift for screenshot...');
    const giftRes = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/gifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderName: 'Seseorang yang Mengagumimu',
            recipientName: 'Nadia, S.Ked',
            message: 'Selamat atas kelulusan wisudamu! Semoga hari-harimu selalu seharum dan seindah buket mawar ini.',
            musicTrack: 'romantic-piano',
            designData: {
              bucket: { id: 'bucket-korean-blush' },
              flowers: [],
              text: { content: 'Happy Graduation!' },
            }
          })
        });
        return await res.json();
      } catch (e) {
        return null;
      }
    });

    if (giftRes && giftRes.id) {
      console.log('Capturing Gift Receiver Page for ID:', giftRes.id);
      await page.goto(`http://localhost:3000/gift/${giftRes.id}`, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(imgDir, 'gift_receiver.png') });
    }

    // 6. Kebun Bunga
    console.log('Capturing Kebun Bunga...');
    await page.goto('http://localhost:3000/kebun', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(imgDir, 'kebun_gate.png') });

    // 7. Mobile Viewport (iPhone 14 style)
    console.log('Capturing Mobile View...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(imgDir, 'home_mobile.png') });

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Error capturing screenshots:', err);
  } finally {
    await browser.close();
  }
}

run();
