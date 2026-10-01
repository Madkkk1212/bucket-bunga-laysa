const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const pdfPath = path.resolve(__dirname, '../MANUAL_BOOK.pdf');
const mdPath = path.resolve(__dirname, '../MANUAL_BOOK.md');

// 1. Periksa teks Markdown & PDF untuk mendeteksi kunci rahasia / URL admin / data pengguna
function scanForSecrets(content, sourceName) {
  const secretPatterns = [
    /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+/g, // JWT / Supabase service keys
    /ADMIN_SECRET_KEY/gi,
    /SUPABASE_SERVICE_ROLE_KEY/gi,
    /lys-atelier-vault-89x/gi, // Exact internal vault path
    /TISUWKWK/gi, // Fallback secret
    /BUKET2026/gi, // Fallback secret
    /LAYSA-VIP/gi, // Fallback secret
    /[a-zA-Z0-9._%+-]+@(?!example\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Real user emails
  ];

  let found = [];
  for (const pat of secretPatterns) {
    const matches = content.match(pat);
    if (matches) {
      found.push({ pattern: pat.toString(), matches });
    }
  }
  return found;
}

// 2. Hitung jumlah halaman PDF dari metadata berkas
function getPdfPageCount(buffer) {
  const str = buffer.toString('binary');
  const matches = str.match(/\/Type\s*\/Page\b/g);
  return matches ? matches.length : 0;
}

async function verify() {
  console.log('--- KONTROL KUALITAS DOKUMEN ---');
  
  // Cek berkas PDF
  const pdfBuffer = fs.readFileSync(pdfPath);
  const totalPages = getPdfPageCount(pdfBuffer);
  const pdfSizeMB = (pdfBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`PDF Path: ${pdfPath}`);
  console.log(`Ukuran File: ${pdfSizeMB} MB`);
  console.log(`Estimasi Jumlah Halaman: ${totalPages} halaman`);

  // Scan Markdown
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const mdSecrets = scanForSecrets(mdContent, 'Markdown');
  console.log(`Scan Rahasia di Markdown: ${mdSecrets.length === 0 ? 'BERSIH ✅ (0 temuan)' : 'DITEMUKAN ⚠️: ' + JSON.stringify(mdSecrets)}`);

  // Scan PDF Raw String
  const pdfSecrets = scanForSecrets(pdfBuffer.toString('utf8'), 'PDF');
  console.log(`Scan Rahasia di PDF: ${pdfSecrets.length === 0 ? 'BERSIH ✅ (0 temuan)' : 'DITEMUKAN ⚠️: ' + JSON.stringify(pdfSecrets)}`);

  console.log('Kontrol kualitas selesai!');
}

verify();
