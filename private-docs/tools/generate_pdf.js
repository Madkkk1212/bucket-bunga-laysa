const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { marked } = require('marked');

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const rootDir = path.resolve(__dirname, '../..');
const privateDocsDir = path.resolve(__dirname, '..');
const mdPath = path.join(privateDocsDir, 'MANUAL_BOOK.md');
const outPdfPath = path.join(privateDocsDir, 'MANUAL_BOOK.pdf');
const imgDir = path.join(privateDocsDir, 'images');

// Baca gambar lokal ke Base64 agar dapat di-embed langsung ke PDF tanpa masalah CORS/file URL
function getBase64Image(filename) {
  const full = path.join(imgDir, filename);
  if (!fs.existsSync(full)) return '';
  const ext = path.extname(filename).replace('.', '');
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  const b64 = fs.readFileSync(full).toString('base64');
  return `data:${mime};base64,${b64}`;
}

// Gambar cover dari aset proyek
const coverBouquetPath = path.join(rootDir, 'public/images/home.png');
const coverBouquetBase64 = fs.existsSync(coverBouquetPath)
  ? `data:image/png;base64,${fs.readFileSync(coverBouquetPath).toString('base64')}`
  : '';

const homeDesktopB64 = getBase64Image('home_desktop.jpg');
const homeMobileB64 = getBase64Image('home_mobile.jpg');
const menuDesktopB64 = getBase64Image('menu_desktop.jpg');
const studioDesktopB64 = getBase64Image('studio_desktop.jpg');
const tutorialDesktopB64 = getBase64Image('tutorial_desktop.jpg');
const giftReceiverB64 = getBase64Image('gift_receiver.jpg');
const kebunGateB64 = getBase64Image('kebun_gate.jpg');

async function generate() {
  console.log('Reading Markdown content from:', mdPath);
  const rawMd = fs.readFileSync(mdPath, 'utf8');

  // Konfigurasi marked renderer
  const renderer = new marked.Renderer();

  // Custom heading renderer untuk menambahkan page-break pada h2 (Bab)
  renderer.heading = function({ tokens, depth, text }) {
    if (depth === 1) {
      return `<h1 class="doc-main-title">${text}</h1>`;
    }
    if (depth === 2) {
      const isIntro = text.includes('RINGKASAN') || text.includes('DAFTAR ISI');
      return `<div class="chapter-separator ${isIntro ? 'no-break' : ''}"></div><h2 class="chapter-title" id="${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">${text}</h2>`;
    }
    if (depth === 3) {
      return `<h3 class="section-title">${text}</h3>`;
    }
    if (depth === 4) {
      return `<h4 class="subsection-title">${text}</h4>`;
    }
    return `<h${depth}>${text}</h${depth}>`;
  };

  marked.setOptions({ renderer });
  let htmlContent = marked.parse(rawMd);

  // Styling Alert Boxes & Callouts
  htmlContent = htmlContent.replace(
    /<blockquote>\s*<p>\s*⚠️\s*<strong>CATATAN INTERNAL<\/strong>:(.*?)<\/p>\s*<\/blockquote>/gs,
    '<div class="callout callout-warning"><div class="callout-icon">⚠️</div><div class="callout-body"><strong>CATATAN INTERNAL</strong>:$1</div></div>'
  );

  htmlContent = htmlContent.replace(
    /<blockquote>\s*<p>(.*?)<\/p>\s*<\/blockquote>/gs,
    '<div class="callout callout-quote"><div class="callout-body">$1</div></div>'
  );

  // Sisipkan Screenshots Asli yang Rapi pada Bagian yang Relevan
  // 1. Pada Bab 2 (Peta Halaman Publik)
  const homeScreenHtml = `
    <div class="screenshot-figure">
      <div class="screenshot-container">
        <img src="${homeDesktopB64}" alt="Tampilan Halaman Beranda Desktop" class="screenshot-img" />
      </div>
      <div class="screenshot-caption">Gambar 1: Halaman Beranda (Desktop) — Dilengkapi judul 3D besar, pajangan buket dengan aura bercahaya, dan live visitor counter badge.</div>
    </div>
  `;
  htmlContent = htmlContent.replace(/<h4 class="subsection-title">1\. Halaman Beranda \(<code>\/<\/code>\)<\/h4>/, `<h4 class="subsection-title">1. Halaman Beranda (<code>/</code>)</h4>${homeScreenHtml}`);

  // 2. Pada Menu Utama
  const menuScreenHtml = `
    <div class="screenshot-figure">
      <div class="screenshot-container">
        <img src="${menuDesktopB64}" alt="Tampilan Menu Utama" class="screenshot-img" />
      </div>
      <div class="screenshot-caption">Gambar 2: Menu Utama (Atelier Hub) — 4 kartu aksi cepat beranimasi dengan efek suara Web Audio ramah.</div>
    </div>
  `;
  htmlContent = htmlContent.replace(/<h4 class="subsection-title">2\. Menu Utama \/ Atelier Hub \(<code>\/menu<\/code>\)<\/h4>/, `<h4 class="subsection-title">2. Menu Utama / Atelier Hub (<code>/menu</code>)</h4>${menuScreenHtml}`);

  // 3. Pada Panduan Tutorial
  const tutorialScreenHtml = `
    <div class="screenshot-figure">
      <div class="screenshot-container">
        <img src="${tutorialDesktopB64}" alt="Tampilan Tutorial Visual" class="screenshot-img" />
      </div>
      <div class="screenshot-caption">Gambar 3: Halaman Tutorial (/tutorial) — Panduan visual interaktif bebas lag dengan background atelier Gemini terkompresi.</div>
    </div>
  `;
  htmlContent = htmlContent.replace(/<h4 class="subsection-title">3\. Panduan Visual Studio \(<code>\/tutorial<\/code>\)<\/h4>/, `<h4 class="subsection-title">3. Panduan Visual Studio (<code>/tutorial</code>)</h4>${tutorialScreenHtml}`);

  // 4. Pada Bab 3 (Studio Designer)
  const studioScreenHtml = `
    <div class="screenshot-figure">
      <div class="screenshot-container">
        <img src="${studioDesktopB64}" alt="Tampilan Studio Perangkai Buket" class="screenshot-img" />
      </div>
      <div class="screenshot-caption">Gambar 4: Studio Perangkai Buket (/designer) — Kanvas fleksibel dengan rotasi kelopak -15°/+15°, penataan saku, dan formasi 1-klik.</div>
    </div>
  `;
  htmlContent = htmlContent.replace(/<h2 class="chapter-title" id="3-panduan-studio-langkah-demi-langkah">3\. PANDUAN STUDIO LANGKAH DEMI LANGKAH<\/h2>/, `<h2 class="chapter-title" id="3-panduan-studio-langkah-demi-langkah">3. PANDUAN STUDIO LANGKAH DEMI LANGKAH</h2>${studioScreenHtml}`);

  // 5. Pada Bab 5 (Kado Digital)
  const giftScreenHtml = `
    <div class="screenshot-figure">
      <div class="screenshot-container">
        <img src="${giftReceiverB64}" alt="Tampilan Buka Kado Digital" class="screenshot-img" style="max-height: 280px; object-fit: contain;" />
      </div>
      <div class="screenshot-caption">Gambar 5: Tampilan Penerima Kado (/gift/[id]) — Amplop merah muda bersegel lilin yang membuka surat personal dengan iringan musik.</div>
    </div>
  `;
  htmlContent = htmlContent.replace(/<h3 class="section-title">Alur Kado Digital \(<code>\/gift\/\[id\]<\/code>\)<\/h3>/, `<h3 class="section-title">Alur Kado Digital (<code>/gift/[id]</code>)</h3>${giftScreenHtml}`);

  // 6. Pada Kebun Bunga
  const kebunScreenHtml = `
    <div class="screenshot-figure">
      <div class="screenshot-container">
        <img src="${kebunGateB64}" alt="Tampilan Kebun Bunga Gate VIP" class="screenshot-img" />
      </div>
      <div class="screenshot-caption">Gambar 6: Kebun Bunga Virtual 3D (/kebun) — Layar gerbang VIP eksklusif untuk Paket Selamanya (Streak Api Harian).</div>
    </div>
  `;
  htmlContent = htmlContent.replace(/<h3 class="section-title">Mekanisme Kebun Bunga Virtual \(<code>\/kebun<\/code>\)<\/h3>/, `<h3 class="section-title">Mekanisme Kebun Bunga Virtual (<code>/kebun</code>)</h3>${kebunScreenHtml}`);

  // Full HTML Document Template
  const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Buku Panduan Lengkap — Bucket Bunga Laysa</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap');

    @page {
      size: A4 portrait;
      margin: 20mm 18mm 20mm 18mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Montserrat', sans-serif;
        font-size: 8.5pt;
        color: #94a3b8;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 9.8pt;
      line-height: 1.68;
      color: #334155;
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
    }

    /* ── COVER PAGE (Halaman Sampul Mewah) ── */
    .cover-page {
      height: 100%;
      min-height: 250mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      padding: 30mm 15mm 20mm;
      background: linear-gradient(180deg, #fff9f6 0%, #fff0f5 50%, #ffffff 100%);
      border: 3px solid #fbcfe8;
      border-radius: 12px;
      page-break-after: always;
      position: relative;
    }

    .cover-top {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .cover-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #be185d;
      color: #ffffff;
      padding: 6px 18px;
      border-radius: 9999px;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(190, 24, 93, 0.25);
    }

    .cover-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32pt;
      font-weight: 800;
      color: #1e1b4b;
      line-height: 1.18;
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }

    .cover-subtitle {
      font-size: 13pt;
      font-weight: 600;
      color: #be185d;
      margin-bottom: 30px;
      letter-spacing: 0.02em;
    }

    .cover-art-container {
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(251, 207, 232, 0.6) 0%, rgba(255, 255, 255, 0.9) 70%);
      border: 2.5px solid rgba(190, 24, 93, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 10px 0 25px;
      box-shadow: 0 16px 36px rgba(190, 24, 93, 0.12);
      overflow: hidden;
    }

    .cover-art-img {
      width: 190px;
      height: 190px;
      object-fit: contain;
    }

    .cover-desc {
      max-width: 480px;
      font-size: 9.5pt;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .cover-bottom {
      width: 100%;
      border-top: 1px solid #fbcfe8;
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      color: #64748b;
      font-weight: 500;
    }

    /* ── TYPOGRAPHY & HEADINGS ── */
    .doc-main-title {
      display: none; /* Disediakan oleh cover */
    }

    .chapter-separator {
      page-break-before: always;
      height: 0;
      margin-top: 0;
    }

    .chapter-separator.no-break {
      page-break-before: avoid;
    }

    h2.chapter-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 16pt;
      font-weight: 700;
      color: #1e1b4b;
      border-bottom: 2px solid #fbcfe8;
      padding-bottom: 6px;
      margin-top: 18px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      break-after: avoid;
    }

    h3.section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 12.5pt;
      font-weight: 700;
      color: #be185d;
      margin-top: 16px;
      margin-bottom: 8px;
      break-after: avoid;
    }

    h4.subsection-title {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 12px;
      margin-bottom: 6px;
      break-after: avoid;
    }

    p {
      margin-bottom: 10px;
      text-align: justify;
    }

    strong {
      color: #0f172a;
      font-weight: 600;
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 12px;
    }

    li {
      margin-bottom: 5px;
    }

    hr {
      border: none;
      border-top: 1px solid #f1f5f9;
      margin: 18px 0;
    }

    /* ── TABLES ── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 18px;
      font-size: 8.8pt;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      break-inside: avoid;
    }

    th {
      background: #be185d;
      color: #ffffff;
      text-align: left;
      padding: 8px 12px;
      font-weight: 700;
      font-size: 8.8pt;
      letter-spacing: 0.02em;
    }

    td {
      padding: 7px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background: #fff9f6;
    }

    /* ── CALLOUT BOXES ── */
    .callout {
      border-radius: 8px;
      padding: 10px 14px;
      margin: 12px 0 16px;
      font-size: 9pt;
      line-height: 1.55;
      break-inside: avoid;
    }

    .callout-warning {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      color: #991b1b;
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .callout-warning .callout-icon {
      font-size: 13pt;
      line-height: 1;
    }

    .callout-quote {
      background: #fff0f5;
      border-left: 4px solid #be185d;
      color: #831843;
      font-style: italic;
    }

    /* ── CODE SNIPPETS ── */
    code {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #be185d;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 8pt;
      line-height: 1.5;
      overflow-x: auto;
      margin: 12px 0 16px;
      break-inside: avoid;
    }

    pre code {
      background: transparent;
      color: inherit;
      border: none;
      padding: 0;
    }

    /* ── SCREENSHOT EMBEDDINGS ── */
    .screenshot-figure {
      margin: 14px auto 18px;
      text-align: center;
      break-inside: avoid;
      max-width: 96%;
    }

    .screenshot-container {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      padding: 4px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      display: inline-block;
      max-width: 100%;
    }

    .screenshot-img {
      width: 100%;
      max-height: 270px;
      object-fit: cover;
      display: block;
      border-radius: 4px;
    }

    .screenshot-caption {
      font-size: 8pt;
      font-weight: 600;
      color: #64748b;
      margin-top: 6px;
      font-style: italic;
      text-align: center;
    }
  </style>
</head>
<body>

  <!-- ── 1. HALAMAN SAMPUL (COVER) ── -->
  <div class="cover-page">
    <div class="cover-top">
      <div class="cover-badge">🌸 DOKUMENTASI RESMI PEMILIK WEBSITE</div>
      <h1 class="cover-title">Bucket Bunga Laysa</h1>
      <div class="cover-subtitle">Buku Panduan Lengkap Produk & Konten Promosi</div>
      
      <div class="cover-art-container">
        <img src="${coverBouquetBase64}" alt="Bucket Bunga Laysa" class="cover-art-img" />
      </div>

      <p class="cover-desc">
        Panduan komprehensif tanpa istilah teknis rumit untuk memahami seluruh fitur, mengelola paket VIP, menjalankan promosi media sosial, dan melayani pelanggan dengan percaya diri.
      </p>
    </div>

    <div class="cover-bottom">
      <div>© 2026 Studio Buket Bunga Laysa</div>
      <div>Edisi Lengkap Pemilik Toko</div>
      <div>Oktober 2026</div>
    </div>
  </div>

  <!-- ── 2. ISI KONTEN LENGKAP ── -->
  <div class="content-body">
    ${htmlContent}
  </div>

</body>
</html>`;

  const tempHtmlPath = path.join(privateDocsDir, 'temp_render.html');
  fs.writeFileSync(tempHtmlPath, fullHtml, 'utf8');
  console.log('HTML render written to:', tempHtmlPath);

  // Render to PDF using Chromium / Edge via puppeteer-core
  console.log('Launching browser to render PDF...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('file:///' + tempHtmlPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });

  // Tunggu web font ter-load sempurna
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 2000));

  console.log('Generating PDF with Puppeteer...');
  await page.pdf({
    path: outPdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-family: 'Montserrat', sans-serif; font-size: 7pt; color: #94a3b8; width: 100%; padding: 0 18mm; display: flex; justify-content: space-between;">
        <span>🌸 Bucket Bunga Laysa — Buku Panduan Produk & Konten</span>
        <span style="color: #cbd5e1;">INTERNAL PEMILIK</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-family: 'Montserrat', sans-serif; font-size: 7.5pt; color: #94a3b8; width: 100%; padding: 0 18mm; display: flex; justify-content: space-between;">
        <span>Dokumentasi Resmi 2026</span>
        <span>Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '18mm',
      bottom: '20mm',
      left: '16mm',
      right: '16mm',
    },
  });

  await browser.close();

  // Hapus berkas temporary HTML setelah PDF selesai
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  const stats = fs.statSync(outPdfPath);
  console.log('PDF generated successfully!');
  console.log('Output location:', outPdfPath);
  console.log('File size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
}

generate().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
