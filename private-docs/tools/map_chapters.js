const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function map() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  // Buka HTML yang sama dengan yang dipakai generate_pdf
  const mdPath = path.resolve(__dirname, '../MANUAL_BOOK.md');
  const rawMd = fs.readFileSync(mdPath, 'utf8');

  // Cari line offset / section
  // Kita bisa membagi per BAB
  const chapters = [
    { num: 1, title: 'RINGKASAN PRODUK' },
    { num: 2, title: 'PETA HALAMAN LENGKAP' },
    { num: 3, title: 'PANDUAN STUDIO LANGKAH DEMI LANGKAH' },
    { num: 4, title: 'FITUR GRATIS vs VIP / PREMIUM' },
    { num: 5, title: 'KADO DIGITAL DAN KEBUN BUNGA' },
    { num: 6, title: 'KEUNGGULAN YANG BISA DIJUAL & BATASAN JANJI' },
    { num: 7, title: 'BANK IDE KONTEN PROMOSI (30 IDE TIKTOK / REELS)' },
    { num: 8, title: 'CAPTION DAN SKRIP JUALAN VIP (BILINGUAL)' },
    { num: 9, title: 'FAQ PENGGUNA (20 TANYA JAWAB SOLUTIF)' },
    { num: 10, title: 'CHECKLIST SEBELUM MEMBUAT KONTEN REKAMAN LAYAR' },
    { num: 11, title: 'KAMUS ISTILAH AWAM' },
    { num: 12, title: 'HAL YANG MEMERLUKAN KEPUTUSAN PEMILIK' },
    { num: 13, title: 'CATATAN TEKNIS & REFERENSI BERKAS SUMBER' }
  ];

  console.log('Chapters mapping ready.');
  await browser.close();
}

map();
