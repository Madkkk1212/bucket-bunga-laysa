const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const tempHtmlPath = path.resolve(__dirname, 'test_page_calc.html');

async function run() {
  // Kita bisa mengecek lokasi elemen heading di dalam halaman dengan merender ulang HTML yang sama dan mengukur offsetTop terhadap tinggi halaman A4 (kira-kira 1123px per page)
  const mdPath = path.resolve(__dirname, '../MANUAL_BOOK.md');
  const { marked } = require('marked');
  const rawMd = fs.readFileSync(mdPath, 'utf8');

  // Cari nomor bab yang berhubungan dengan konten
  // Bab 6: Keunggulan Yang Bisa Dijual
  // Bab 7: Bank Ide Konten (30 ide)
  // Bab 8: Caption dan Skrip Jualan VIP
  // Bab 10: Checklist Sebelum Membuat Konten

  // Mari kita inspect PDF binary atau render langsung dengan puppeteer untuk mengukur page number pasti
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 }); // A4 at 96 DPI

  // Buat HTML dengan style yang sama persis seperti generate_pdf.js
  // Untuk menghitung nomor halaman, kita bisa mengecek setiap h2.chapter-title
  const chapters = [
    { title: '1. RINGKASAN PRODUK' },
    { title: '2. PETA HALAMAN LENGKAP' },
    { title: '3. PANDUAN STUDIO LANGKAH DEMI LANGKAH' },
    { title: '4. FITUR GRATIS vs VIP / PREMIUM' },
    { title: '5. KADO DIGITAL DAN KEBUN BUNGA' },
    { title: '6. KEUNGGULAN YANG BISA DIJUAL & BATASAN JANJI' },
    { title: '7. BANK IDE KONTEN PROMOSI (30 IDE TIKTOK / REELS)' },
    { title: '8. CAPTION DAN SKRIP JUALAN VIP (BILINGUAL)' },
    { title: '9. FAQ PENGGUNA (20 TANYA JAWAB SOLUTIF)' },
    { title: '10. CHECKLIST SEBELUM MEMBUAT KONTEN REKAMAN LAYAR' },
    { title: '11. KAMUS ISTILAH AWAM' },
    { title: '12. HAL YANG MEMERLUKAN KEPUTUSAN PEMILIK' },
    { title: '13. CATATAN TEKNIS & REFERENSI BERKAS SUMBER' }
  ];

  console.log('--- PEMETAAN BAB & HALAMAN UNTUK KONTEN ---');
  // Bab-bab penting konten:
  // Cover: Halaman 1
  // Bab 1-5: Halaman 2 s/d 17
  // Bab 6-8: Halaman 18 s/d 28
  // Bab 10: Halaman 30-31
  
  await browser.close();
}

run();
