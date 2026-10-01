# 🌸 BUKU PANDUAN LENGKAP PRODUK & KONTEN PROMOSI
## Studio Perangkai Buket Bunga Virtual — Bucket Bunga Laysa
*Dokumentasi Resmi & Panduan Pemilik Website (Edisi Lengkap 2026)*

> ⚠️ **CATATAN INTERNAL**: Dokumen ini bersifat rahasia untuk pemilik dan pengelola Bucket Bunga Laysa. Jangan dibagikan langsung kepada pengguna publik karena memuat strategi promosi, analisis fitur, dan catatan teknis internal.

---

## DAFTAR ISI
1. [Ringkasan Produk](#1-ringkasan-produk)
2. [Peta Halaman Lengkap](#2-peta-halaman-lengkap)
3. [Panduan Studio Langkah demi Langkah](#3-panduan-studio-langkah-demi-langkah)
4. [Fitur Gratis vs VIP / Premium (Bagian Terpenting)](#4-fitur-gratis-vs-vip--premium-bagian-terpenting)
5. [Kado Digital dan Kebun Bunga](#5-kado-digital-dan-kebun-bunga)
6. [Keunggulan yang Bisa Dijual & Batasan Janji](#6-keunggulan-yang-bisa-dijual--batasan-janji)
7. [Bank Ide Konten Promosi (30 Ide TikTok / Reels)](#7-bank-ide-konten-promosi-30-ide-tiktok--reels)
8. [Caption dan Skrip Jualan VIP (Bilingual ID / EN)](#8-caption-dan-skrip-jualan-vip-bilingual-id--en)
9. [FAQ Pertanyaan Pengguna (20 Tanya Jawab Solutif)](#9-faq-pertanyaan-pengguna-20-tanya-jawab-solutif)
10. [Checklist Sebelum Membuat Konten Rekaman Layar](#10-checklist-sebelum-membuat-konten-rekaman-layar)
11. [Kamus Istilah Awam](#11-kamus-istilah-awam)
12. [Hal yang Memerlukan Keputusan Pemilik](#12-hal-yang-memerlukan-keputusan-pemilik)
13. [Catatan Teknis & Referensi Berkas Sumber](#13-catatan-teknis--referensi-berkas-sumber)

---

## 1. RINGKASAN PRODUK

### Apa Produk Ini?
**Bucket Bunga Laysa** adalah studio web interaktif yang memungkinkan siapa saja merangkai buket bunga virtual yang indah, menuliskan kartu ucapan kaligrafi personal, lalu mengunduh gambarnya dalam kualitas tinggi atau mengirimkannya sebagai **kado digital interaktif** dengan amplop bersegel lilin dan musik lembut.

### Siapa Penggunanya?
1. **Pasangan Hubungan Jarak Jauh (LDR)**: Mereka yang terpisah jarak dan ingin mengirimkan kejutan romantis yang hangat tanpa terkendala ongkos kirim antarkota atau luar negeri.
2. **Mahasiswa & Pelajar (Momen Wisuda / Sidang)**: Teman yang ingin memberikan hadiah ucapan wisuda unik, hemat, dan estetik untuk sahabatnya.
3. **Pemberi Kado Ulang Tahun & Anniversary**: Orang yang mencari alternatif kado manis yang berkesan dan bisa disimpan selamanya di galeri HP.
4. **Penyampai Pesan Khusus**: Seseorang yang ingin menyampaikan ucapan terima kasih (Hari Ibu, Hari Guru) atau permohonan maaf dengan cara yang tulus dan tidak biasa.

### Masalah Apa yang Diselesaikan?
* **Harga Bunga Asli yang Mahal**: Buket bunga asli berkisar antara Rp 100.000 hingga Rp 500.000+ dan akan layu dalam waktu 3–5 hari.
* **Keterbatasan Pengiriman Fisik**: Mengirim bunga segar ke luar kota sangat berisiko rusak di perjalanan dan ongkos kirimnya mahal.
* **Kado Digital Biasa yang Membosankan**: Ucapan lewat chat teks biasa atau stiker WhatsApp sering kali terasa hambar dan tidak berkesan.
* **Solusi Laysa**: Hadiah virtual yang dirangkai sendiri dengan sepenuh hati, bertahan selamanya tanpa pernah layu, dapat dibuka seperti surat berharga beriringan musik, dan 100% bebas biaya pengiriman.

### Apa yang Membedakannya dari Aplikasi Lain?
1. **Kanvas 2D yang Fleksibel & Nyata**: Bunga bukan sekadar gambar mati yang ditumpuk kaku. Pengguna bisa mengatur sudut kemiringan (-15° hingga +15°), kedalaman lapisan (*apakah bunga masuk ke dalam saku pembungkus atau di depan pita*), serta formasi 1-klik yang rapi otomatis.
2. **Pengalaman Buka Kado Digital (`/gift/[id]`)**: Penerima tidak hanya menerima gambar datar, melainkan tautan eksklusif beranimasi amplop bersegel lilin yang terbuka perlahan dengan iringan melodi pentatonik yang menenangkan.
3. **Kebun Bunga Virtual Duet (`/kebun`)**: Fitur unik merawat kebun bunga virtual bersama pasangan dengan sistem streak api harian (disiram setiap hari agar tumbuh mekar).
4. **Kemudahan Akses Tanpa Hambatan**: Pengguna gratis dapat langsung merangkai dan mengunduh hasil buketnya dalam hitungan menit tanpa kewajiban membuat akun atau mengisi formulir yang rumit.

---

## 2. PETA HALAMAN LENGKAP

Seluruh rute dan halaman di dalam proyek Bucket Bunga Laysa terbagi menjadi empat kelompok:

```
[ PENGUNJUNG UMUM ]
   │
   ├── Beranda (/) ──► Menu Utama (/menu) ──► Studio Desain (/designer)
   │                       │                          │
   ├── Panduan (/tutorial) ├── Kebun Bunga (/kebun)   └── Unduh & Buat Link Kado
   │                       │
   │                       └── Kado Diterima (/gift/[id])
   │
[ PENGELOLA / INTERNAL ]
   └── Panel Vault Internal (Kelola Voucher, Hadiah, & Statistik)
```

### A. Halaman Publik

#### 1. Halaman Beranda (`/`)
* **Tujuan**: Menyambut pengunjung, membangun kesan pertama yang mewah (*wow effect*), dan langsung mengarahkan ke pembuatan buket.
* **Apa yang Dilihat Pengguna**: Video latar estetik buket, bunga-bunga melayang lembut, judul 3D besar *"Bikin Buket Bunga Virtual Gratis"*, panggung pajangan buket dengan aura bercahaya, tombol utama *"Buat Buket Sekarang"*, dan badge jumlah pengunjung (jika diaktifkan dari admin).
* **Tombol Utama**:
  * `Buat Buket Sekarang`: Membuka jendela pilihan jumlah bunga lalu masuk ke studio.
  * Navigasi atas: Tautan ke Menu, Tutorial, dan Pengalih Bahasa (ID / EN).
* **Status Akses**: Gratis untuk semua orang.
* **Bahasa**: Tersedia penuh dalam Bahasa Indonesia dan English.
* **Catatan Konten**: Sangat menarik untuk rekaman pembuka (hook) video TikTok/Reels karena visual awalnya sangat berkilau dan hidup.

#### 2. Menu Utama / Atelier Hub (`/menu`)
* **Tujuan**: Pusat pilihan aktivitas bagi pengguna yang ingin memilih alur spesifik.
* **Apa yang Dilihat Pengguna**: Kartu-kartu menu interaktif dengan suara instan yang elegan saat disentuh:
  1. *Buat Buket Impian* (Mengarahkan ke studio `/designer`).
  2. *Panduan Lengkap* (Mengarahkan ke `/tutorial`).
  3. *Kebun Bunga Harian* (Mengarahkan ke `/kebun` atau membuka jendela VIP jika belum berlangganan).
  4. *Buka Akses VIP* (Membuka jendela informasi paket VIP).
* **Tombol Utama**: Kartu navigasi ke masing-masing fitur di atas.
* **Status Akses**: Gratis untuk diakses, namun menu Kebun Bunga memiliki pengaman gembok VIP.
* **Bahasa**: Mendukung ID dan EN.
* **Catatan Konten**: Bagus untuk memperlihatkan bahwa web ini bukan hanya alat pembuat gambar sekali pakai, melainkan studio lengkap.

#### 3. Panduan Visual Studio (`/tutorial`)
* **Tujuan**: Memberikan panduan lengkap kepada pengguna tentang cara memakai semua alat di studio tanpa membuat mereka bingung.
* **Apa yang Dilihat Pengguna**: Panduan visual panjang yang ringan (bebas macet/lag), memuat simulasi interaktif (bisa mencoba memutar bunga, menggeser ukuran, mengganti tema ucapan, dan mendengarkan contoh lagu hadiah).
* **Tombol Utama**: Tombol navigasi langkah 1–6 dan tombol *"Mulai Rangkai Buket Sekarang"*.
* **Status Akses**: 100% Gratis.
* **Bahasa**: Mendukung ID dan EN.
* **Catatan Konten**: Cocok dijadikan bahan video edukasi *"Tutorial bikin buket digital aesthetic dalam 1 menit"*.

#### 4. Studio Perangkai Buket (`/designer`)
* **Tujuan**: Inti utama aplikasi tempat pengguna menyusun bunga, memilih kertas pembungkus, menulis kartu, dan menghasilkan buket.
* **Apa yang Dilihat Pengguna**: Kanvas kerja di tengah, bilah alat atas (urungkan/undo, formasi otomatis, rasio kanvas, putar bunga), dan panel samping dengan 5 tahapan langkah kerja.
* **Tombol Utama**: Tombol navigasi *"Lanjut"* / *"Kembali"*, panel bunga, penggeser ukuran, dan tombol unduh.
* **Status Akses**: Fitur inti gratis; item bertanda gembok khusus anggota VIP.
* **Bahasa**: Mendukung ID dan EN.
* **Catatan Konten**: Area paling penting untuk direkam; proses menyusun bunga satu per satu selalu menghasilkan kepuasan visual (*oddly satisfying*) di media sosial.

#### 5. Halaman Pembuka Kado Digital (`/gift/[id]`)
* **Tujuan**: Halaman kejutan pribadi yang dibuka oleh penerima kado melalui tautan unik yang dikirimkan pengirim.
* **Apa yang Dilihat Pengguna**: Amplop surat mewah bersegel lilin merah jambu bertuliskan nama pengirim dan penerima. Saat amplop diklik, segel lilin terlepas, amplop terbuka, surat meluncur keluar, alunan musik romantis mulai terdengar, dan rangkaian buket tampil di tengah layar.
* **Tombol Utama**:
  * *Buka Amplop*: Memulai pengalaman membuka hadiah dan menyalakan musik.
  * *Unduh Gambar*: Menyimpan buket ke galeri perangkat.
  * *Buat Buket Sendiri*: Mengarahkan penerima ke beranda agar mereka bisa membuat buket juga (efek viral alami).
* **Status Akses**: 100% Gratis untuk dibuka siapa pun yang memiliki tautannya.
* **Bahasa**: Mendukung ID dan EN.
* **Catatan Konten**: Sangat cocok untuk video format *"POV: Pacarmu ngirim link misterius pas ulang tahunmu..."*.

#### 6. Kebun Bunga Virtual (`/kebun`)
* **Tujuan**: Ruang interaktif 3D isometrik untuk menanam dan merawat bunga secara berkala bersama pasangan atau solo.
* **Apa yang Dilihat Pengguna**: Pulau kebun bertanah subur yang dilengkapi gapura mawar, air mancur, lentera peri, dan kucing putih. Terdapat petak tanah untuk menanam bunga, tombol siram harian, catatan streak api, dan sistem waktu alami (berubah otomatis saat siang, senja, atau malam).
* **Tombol Utama**: *Tanam Bibit*, *Siram Hari Ini*, *Buku Koleksi Bunga*, *Mode Kamera (Zoom/Putar)*, dan *Petik Bunga ke Studio*.
* **Status Akses**: **Eksklusif VIP Sultan (Paket Selamanya)**. Jika dibuka oleh pengguna biasa, layar gembok VIP akan muncul dengan tombol aktivasi.
* **Bahasa**: Mendukung ID dan EN.
* **Catatan Konten**: Paling kuat untuk promosi pasangan yang ingin memiliki rutinitas manis bersama setiap hari.

---

### B. Halaman Pengguna & Akun

* **Halaman Dasbor (`/dashboard`)**:
  * Rute ini secara otomatis mengalihkan (*redirect*) pengguna langsung ke Menu Utama (`/menu`).
  * Web Laysa sengaja **tidak mewajibkan pendaftaran akun dengan email dan password rumit**. Status VIP pengguna dikenali otomatis oleh browser melalui sistem kode akses dan tanda pengenal perangkat yang aman.

---

### C. Halaman Pengelola & Administrasi (INTERNAL)

* **Panel Vault Admin (INTERNAL, jangan dibagikan)**:
  * Rute khusus terlindungi untuk pemilik toko mengelola jalannya bisnis.
  * **Fungsi Utama**:
    1. *Penerbitan Kode Akses VIP*: Membuat voucher paket Harian, Mingguan, atau Selamanya dengan batas perangkat tertentu.
    2. *Pemantauan Kuota Perangkat*: Melihat daftar perangkat (HP/Laptop) yang terhubung pada suatu kode voucher.
    3. *Pengaturan Harga & Diskon Promo*: Mengubah harga dasar, harga promo, persentase diskon, dan label diskon secara langsung tanpa sentuh kode.
    4. *Database Kado Digital*: Memantau daftar kado yang dibuat pengguna, melihat berapa kali kado tersebut telah dilihat oleh penerima, dan menghapus kado jika disalahgunakan.
    5. *Statistik Pengunjung & Saklar Beranda*: Memantau jumlah kunjungan harian serta tombol satu klik untuk menyalakan atau mematikan tampilan counter pengunjung di halaman depan.
    6. *Pemeriksaan Sistem (Diagnostik)*: Memeriksa koneksi database cloud dan struktur data.

---

### D. Rute Teknis & Jalur Pertukaran Data (API)
*Ringkasan satu baris fungsi untuk pemahaman alur kerja aplikasi:*
* `/api/track-visit`: Mencatat lalu lintas kunjungan situs secara senyap dan tidak membebani kecepatan muat halaman.
* `/api/site-stats`: Menyediakan data publik apakah angka counter kunjungan boleh ditampilkan di beranda atau tidak.
* `/api/verify-code`: Memeriksa keabsahan kode voucher VIP, masa berlaku, dan kuota perangkat pengguna saat melakukan aktivasi.
* `/api/gifts`: Menerima rancangan buket dari studio dan menyimpannya menjadi tautan kado unik `/gift/[id]`.
* `/api/gifts/[id]`: Mengambil rincian kado digital saat dibuka penerima dan menambah angka jumlah pembacaan (*views*).
* `/api/garden`: Memuat dan menyimpan kemajuan tanaman kebun bunga, status penyiraman harian, dan ornamen kebun.
* `/api/vip/drafts`: Menyimpan salinan rancangan buket anggota VIP secara terenkripsi ke awan agar tidak hilang saat berganti perangkat.
* `/api/settings/pricing`: Mengirimkan daftar paket harga VIP yang aktif ke tampilan studio dan modal pembelian.
* `/api/admin/*`: Rangkaian pintu gerbang internal yang hanya dapat diakses dengan kunci otentikasi admin.

---

## 3. PANDUAN STUDIO LANGKAH DEMI LANGKAH

Studio perangkai (`/designer`) dirancang dengan alur kerja profesional yang terbagi menjadi 5 langkah terstruktur:

```
[LANGKAH 1]                   [LANGKAH 2]                 [LANGKAH 3]
Pilih Ukuran & Pembungkus ──► Rangkai Bunga di Kanvas ──► Tulis Kartu Ucapan
                                                              │
                              [LANGKAH 5]                 [LANGKAH 4]
                             Unduh HD / Buat Kado     ◄── Pratinjau Desain HD
```

### Langkah 1: Pilih Ukuran & Pembungkus (Step 1)
*Istilah di Layar: "Pilih Ukuran & Pembungkus" (ID) / "Choose Size & Wrapper" (EN)*
1. **Pilihan Kapasitas Bunga**:
   * Pengguna disambut oleh jendela awal untuk menentukan kapasitas buket:
     * **5 Bunga (Mini Sweet)**: Mungil, minimalis, cocok untuk ucapan kilat.
     * **10 Bunga (Petite Bloom)**: Kompak dan manis untuk kado teman.
     * **15 Bunga (Medium Classic)**: Proporsi paling seimbang antara bunga dan daun penghias.
     * **25 Bunga (Signature Lush)**: Paling populer, padat, bervolume penuh dan mewah.
     * **50 Bunga (Grand Royale)**: Sangat megah untuk perayaan besar atau wisuda akbar.
2. **Koleksi Kertas Pembungkus (Wrappers)**:
   * Tersedia 56 model pembungkus generik yang elegan:
     * *Gaya Origami Korea (Korean Wrap)*: Kertas berlipat mewah dengan sayap lebar dan lis warna tepi kontras.
     * *Gaya Kertas Koran Vintage (Classic Newsprint)*: Nuansa retro puitis ala kedai bunga Paris.
     * *Gaya Rustic / Craft Paper*: Kertas cokelat natural bertekstur hangat dan ramah lingkungan.
     * *Gaya Bentuk Hati (Heart Pouch)*: Pembungkus melengkung manis menyerupai lambang cinta.
     * *Gaya Royal Imperial Gold*: Edisi mewah berlapis lis emas berkilau (khusus VIP).
3. **Pilihan Rasio Kanvas**:
   * `1:1 Persegi (Square)`: Format standar serbaguna untuk galeri foto dan profil.
   * `4:5 Potret (Instagram Feed)`: Format tegak ideal untuk postingan feed media sosial agar tampak lebih besar.
   * `9:16 Layar Penuh (Story / TikTok)`: Format vertikal layar penuh untuk wallpaper HP, WhatsApp Status, atau video TikTok.
4. **Latar Belakang Studio (Studio Backdrop)**:
   * Pengguna dapat memilih nuansa latar belakang kanvas: *Putih Bersih*, *Atelier Hangat*, *Merah Muda Lembut (Soft Pink)*, *Nuansa Malam Elegan*, atau *Foto Kustom Pribadi* (khusus VIP).

---

### Langkah 2: Pilih & Rangkai Bunga (Step 2)
*Istilah di Layar: "Pilih & Rangkai Bunga" (ID) / "Choose & Arrange Flowers" (EN)*
1. **Katalog Bunga**:
   * Terdapat **53 varian bunga botani** yang terbagi dalam tiga kelompok:
     * **Bunga Utama (Main Flowers)**: Mawar (Merah, Pink, Putih, Kuning), Krisan, Dahlia, Anyelir, Matahari, Gerbera, Aster, Ranunculus, Tulip, Lili, dan Anggrek.
     * **Bunga Pengisi (Filler)**: Baby's Breath (Putih, Biru, Pink), Statice, Gomphrena, dan Melati.
     * **Dedaunan Hijau (Greenery)**: Eucalyptus, Pakis, Ruscus, dan Daun Monstera mini.
   * **44 varian dapat dipakai bebas oleh semua pengguna**, dan **9 varian bunga langka terkunci khusus VIP**.
2. **Alat Pengatur Bunga di Atas Kanvas**:
   * *Geser Bebas (Drag & Drop)*: Sentuh dan arahkan bunga ke posisi mana pun di atas buket.
   * *Tombol Putar (-15° / +15°)*: Memiringkan kelopak bunga ke kiri atau ke kanan agar susunannya terlihat alami seperti dirangkai tangan florist ahli.
   * *Tombol Geser Presisi (Nudge Arrows)*: Memindahkan bunga sejauh 2 piksel atau 10 piksel untuk posisi super rapi.
   * *Penggeser Skala (Size Slider)*: Memperbesar atau memperkecil kuntum bunga dari 60% hingga 150%.
3. **Lapisan Kedalaman (Z-Index Layering)**:
   * *Di Dalam Saku (Inside Pouch)*: Batang bunga masuk ke dalam celah pembungkus dan kelopaknya menyembul anggun dari balik kertas.
   * *Di Depan Pita (Front Layer)*: Bunga atau dedaunan ditaruh di depan simpul pita untuk pemanis bagian depan buket.
4. **Formasi 1-Klik Cerdas (Instant Formations)**:
   * Jika tidak ingin menata satu per satu dari awal, pengguna cukup menekan satu tombol formasi:
     * **Kubah (Dome)**: Membentuk buket bulat klasik simetris yang penuh.
     * **Kipas (Fan)**: Melebar ke kiri dan kanan memperlihatkan semua tangkai.
     * **Hati (Heart)**: Menyusun kuntum bunga membentuk lengkungan lambang hati.
     * **Busur (Arc)**: Rangkaian melengkung lembut bergaya modern.
     * **Air Terjun (Cascade)**: Rangkaian menjuntai mewah dari atas ke bawah.

---

### Langkah 3: Kartu Ucapan & Pesan (Step 3)
*Istilah di Layar: "Kartu Ucapan & Pesan" (ID) / "Greeting Card & Message" (EN)*
1. **Kotak Kartu di Kanvas**:
   * Kartu ucapan muncul langsung di atas buket dan posisinya dapat digeser bebas.
2. **Pilihan Font & Kaligrafi**:
   * 6 pilihan jenis huruf: *Playfair Display* (klasik mewah), *Montserrat* (modern bersih), *Georgia*, *Times New Roman*, *Arial*, dan *Courier New*.
3. **Pilihan Warna Tinta Teks**:
   * 10 palet warna elegan: Hitam Arang, Cokelat Kayu, Emas Antik, Mawar Merah Muda, Burgundy Tua, Biru Kerajaan, Hijau Botani, dan Amber.
4. **Template Siap Pakai**:
   * Menyediakan template cepat untuk momen wisuda (*"Happy Graduation! Proud of you always"*) dan ulang tahun (*"Happy Birthday! May your days bloom with joy"*). Pengguna juga bebas menghapus dan mengetik pesan mereka sendiri tanpa batas karakter yang kaku.

---

### Langkah 4: Pratinjau Desain HD (Step 4)
*Istilah di Layar: "Pratinjau Desain HD" (ID) / "HD Design Preview" (EN)*
1. **Pemeriksaan Hasil Akhir**:
   * Seluruh panel alat diringkas sehingga pengguna dapat melihat buketnya secara utuh, bersih, dan tanpa gangguan tombol editor.
2. **Tindakan**:
   * Jika masih ada bunga yang miring atau kurang pas, tombol *"Kembali Edit"* akan membawa pengguna ke langkah sebelumnya tanpa merusak tatanan yang sudah ada.
   * Jika sudah puas, tombol *"Lanjut ke Pengunduhan"* mengantar ke tahap akhir.

---

### Langkah 5: Unduh Hasil Buket & Hadiah Digital (Step 5)
*Istilah di Layar: "Unduh Hasil Buket" (ID) / "Download Bouquet Result" (EN)*

#### Jalur 1: Mengunduh File Gambar Langsung
1. **Pilihan Format Gambar**:
   * **PNG (Transparan)**: Gambar buket dengan latar belakang bolong/transparan. Sangat cocok dijadikan stiker WhatsApp, ditempel ke video edit, atau di-print.
   * **JPG (Latar Studio)**: Gambar buket dengan latar belakang bersih atau warna tema atelier yang dipilih.
2. **Pilihan Resolusi Gambar**:
   * **Native 1x HD (600 × 600 px)**: Ringan, cepat diunduh, hemat memori ponsel (Gratis).
   * **2K Super HD (1200 × 1200 px)**: Dua kali lebih tajam, sangat jernih untuk dicetak ukuran bingkai meja (Gratis).
   * **👑 Ultra 4K Master (2100 × 2100 px)**: Resolusi super tinggi 3.5x tanpa pecah, jernih untuk cetak poster besar (Eksklusif VIP).

#### Jalur 2: Membuat Tiket Kado Digital Interaktif
1. **Formulir Pengirim**:
   * Mengisi *Nama Pengirim* (contoh: "Kakak Tersayang" atau nama panggilan rahasia).
   * Mengisi *Nama Penerima* (contoh: "Nadia, S.Ked").
   * Menuliskan *Surat Pesan Personal* panjang yang akan dibaca saat amplop dibuka.
2. **Pilihan Musik Pengiring (BGM)**:
   * 🎹 **Romantic Piano**: Denting piano akustik lembut dan puitis.
   * 🎸 **Acoustic Love**: Petikan gitar hangat, manis, dan akrab.
   * 🎂 **Ulang Tahun Ceria**: Melodi perayaan hari lahir yang penuh kebahagiaan.
   * ☕ **Lofi Aesthetic**: Ketukan santai yang menenangkan dan kekinian.
3. **Penerbitan Tiket Kado (Digital Gift Pass)**:
   * Setelah menekan tombol buat kado, layar menghasilkan **Tiket Kado Bergaya Boarding Pass Mewah** lengkap dengan:
     * Tautan pendek `/gift/[id]`.
     * Tombol *"Kirim ke WhatsApp"* (otomatis membuat draf chat WA siap kirim).
     * Tombol *"Salin Link"* dan *"Pratinjau Kado"*.

---

## 4. FITUR GRATIS vs VIP / PREMIUM (BAGIAN TERPENTING)

Bagian ini adalah pedoman operasional terpenting bagi pemilik toko dalam menetapkan batasan jualan, melayani pertanyaan pelanggan, dan memastikan tidak ada janji berlebihan.

### Tabel Perbandingan Fitur

| Fitur / Manfaat | Pengguna Gratis | Pengguna VIP (Harian / Mingguan) | Pengguna VIP Sultan (Selamanya) |
| :--- | :--- | :--- | :--- |
| **Biaya & Langganan** | Rp 0 (Gratis) | Rp 5.000 (24 Jam) / Rp 12.000 (7 Hari) | Rp 17.000 – Rp 25.000 (Sekali bayar selamanya) |
| **Koleksi Bunga Studio** | 44 varian bunga botani dasar | **Terbuka seluruh 53 varian** (termasuk 9 bunga langka) | **Terbuka seluruh 53 varian + varian masa depan** |
| **Kertas Pembungkus** | 41 model kertas generik | **Terbuka seluruh 56 model** | **Terbuka seluruh 56 model + Edisi Gold Royal** |
| **Kapasitas Bunga** | Bebas pilih 5 s/d 50 bunga | Bebas pilih 5 s/d 50 bunga | Bebas pilih 5 s/d 50 bunga |
| **Batas Perangkat** | 1 perangkat (browser lokal) | **Hingga 5 perangkat bersamaan** | **Hingga 5 perangkat bersamaan** |
| **Ekspor Gambar 1x HD & 2K** | ✅ Tersedia | ✅ Tersedia | ✅ Tersedia |
| **Ekspor Ultra HD 4K (3.5x)** | 🔒 Terkunci (Ada tanda mahkota) | 🔒 Terkunci / Prioritas Selamanya | **✅ Terbuka Penuh (2100×2100 px Lossless)** |
| **Pembuatan Link Kado Musik** | ✅ Tersedia (Bebas buat) | ✅ Tersedia | ✅ Tersedia |
| **Autosave Cloud Terenkripsi** | ❌ Tersimpan di HP masing-masing | **✅ Tersimpan di Cloud AES-256** | **✅ Tersimpan di Cloud AES-256** |
| **Latar Foto Kustom Sendiri** | ❌ Hanya palet latar standar | ❌ Hanya palet latar standar | **✅ Bebas unggah foto latar sendiri** |
| **Fitur Kebun Bunga (`/kebun`)** | 🔒 Terkunci (Layar Gembok) | 🔒 Terkunci | **🌸 TERBUKA PENUH (Akses Eksklusif)** |
| **Nama Pemilik di Header** | Tampil tombol "Buka VIP" | Tampil badge "VIP: [Nama]" | Tampil badge emas "VIP: [Nama]" |

---

### Rincian Bunga & Item yang Terkunci di Versi Gratis

#### 9 Bunga Langka Terkunci (Bertanda Ikon Gembok di Studio):
1. **Calla Lily Putih** (`calla_white`): Bunga corong putih murni lambang keanggunan tingkat tinggi.
2. **Hydrangea Biru** (`hydrangea_blue`): Kelopak rimbun biru lembut khas buket pernikahan mewah.
3. **Hydrangea Ungu** (`hydrangea_purple`): Kelopak gradasi ungu pastel yang megah.
4. **Iris Ungu** (`iris_purple`): Bunga bermahkota unik melambangkan ketulusan dan keberanian.
5. **Anggrek Pink** (`orchid_pink`): Anggrek bulan merah muda bernilai tinggi.
6. **Protea Pink** (`protea_pink`): Bunga eksotis asal Afrika Selatan yang sangat anggun dan langka.
7. **Ranunculus Pink** (`ranunculus_pink`): Mawar tumpuk berlapis tipis yang sangat digemari di Korea.
8. **Tulip Pink** (`tulip_pink`): Tulip kuncup segar Belanda berwarna merah muda.
9. **Tulip Ungu** (`tulip_purple`): Tulip kuncup beludru ungu tua yang menawan.

*Jika pengguna gratis mengklik salah satu dari 9 bunga di atas, sistem tidak akan memasukkan bunga ke kanvas, melainkan memunculkan jendela `PremiumUnlockModal` yang menawarkan paket VIP.*

---

### Rincian Paket VIP yang Berlaku di Sistem

Berdasarkan konfigurasi berkas pengaturan harga sistem ([`pricingConfig.json`](file:///d:/web/bucket/bucket/data/pricingConfig.json)), terdapat tiga tingkatan paket:

#### 1. Paket Harian (24 Jam) — *Kode Awalan: DAY-XXXXXX*
* **Harga Dasar**: Rp 10.000
* **Harga Promo Saat Ini**: **Rp 5.000** (Diskon 50%)
* **Masa Aktif**: Tepat 24 jam sejak kode diaktifkan oleh pengguna.
* **Manfaat**:
  * Membuka seluruh 53 bunga dan seluruh pembungkus di studio `/designer`.
  * Bisa dipakai bergantian hingga 5 perangkat sekaligus.
  * Unduh hasil resolusi HD jernih tanpa batas.
  * *Catatan*: **Tidak** mendapatkan akses ke Kebun Bunga Virtual.

#### 2. Paket Mingguan (7 Hari) — *Kode Awalan: WEEK-XXXXXX*
* **Harga Dasar**: Rp 25.000
* **Harga Promo Saat Ini**: **Rp 12.000** (Hemat 52%)
* **Masa Aktif**: 7 hari kalender penuh (168 jam).
* **Manfaat**:
  * Seluruh manfaat Paket Harian.
  * Durasi cukup panjang untuk merancang beberapa kado berbeda dalam satu pekan wisuda atau ulang tahun.
  * Penyimpanan draf terenkripsi ke cloud sehingga rancangan aman jika browser dibersihkan.
  * *Catatan*: **Tidak** mendapatkan akses ke Kebun Bunga Virtual.

#### 3. Paket Selamanya / VIP Sultan (Lifetime) — *Kode Awalan: VIP-XXXXXX*
* **Harga Dasar**: Rp 85.000
* **Harga Promo Saat Ini**: **Rp 17.000 s/d Rp 25.000** (Diskon hingga 80%)
* **Masa Aktif**: **Permanen Selamanya (Sekali bayar tanpa biaya bulanan)**.
* **Manfaat Paling Lengkap**:
  * Seluruh manfaat paket studio (bunga, pembungkus, cloud draf).
  * **Eksklusif**: Membuka penuh akses ke **Kebun Bunga Virtual 3D (`/kebun`)** untuk merawat bunga bersama pasangan.
  * **Eksklusif**: Membuka opsi ekspor tertinggi **Ultra HD 4K (3.5x Master)**.
  * **Eksklusif**: Fitur kustomisasi foto latar kanvas sendiri.
  * Bebas dari pemutusan masa aktif, terhubung hingga 5 perangkat bersama keluarga/pasangan.

---

### Alur Pembelian & Aktivasi Kode VIP

Karena web ini **tidak menggunakan pihak ketiga gerbang pembayaran otomatis (seperti kartu kredit otomatis yang mengenakan biaya potongan tinggi)**, sistem menggunakan alur yang ramah dan aman melalui WhatsApp:

```
[ PENGGUNA DI WEB ]
      │
      ├── 1. Klik tombol "Beli VIP" di modal studio
      │
      ├── 2. Masuk ke WhatsApp Toko (Pesan otomatis terisi rapi)
      │
[ ADMIN DI WHATSAPP ]
      ├── 3. Admin memberikan nomor Rekening Bank / QRIS
      │
      ├── 4. Pelanggan mengirimkan bukti transfer pembayaran
      │
      ├── 5. Admin buka Panel Vault Internal -> Klik "Buat Kode Voucher"
      │
[ PENGGUNA DI WEB ]
      ├── 6. Pelanggan salin kode -> Buka web Laysa -> Klik "Masukkan Kode"
      │
      └── 7. Masukkan Kode & Nama -> Status VIP AKTIF seketika! ✨
```

#### Apa yang Terjadi Saat Paket VIP Berakhir?
* Untuk Paket Harian dan Mingguan, server menyimpan waktu kedaluwarsa (`expires_at`).
* Saat masa berlaku habis, sistem secara otomatis mencabut status VIP saat halaman dibuka.
* Bunga VIP yang sudah pernah diunduh menjadi gambar di HP pengguna **tetap menjadi milik mereka selamanya** (gambar tidak akan hilang).
* Pengguna cukup memasukkan kode baru jika ingin mengaktifkan kembali di masa depan.

---

### Hal yang Rawan Salah Paham & Perlu Diperhatikan (PENTING!)

1. **Klaim "100+ Koleksi Bunga" di Banner**:
   * Di dalam teks promo modal disebutkan *"Buka seluruh 100+ koleksi bunga"*. Di dalam kode studio `/designer`, saat ini terdapat **53 varian bunga botani aktif** dan **40 bunga bibit di kebun**. Jika digabungkan antara bunga buket, dedaunan, dan tanaman kebun, totalnya mendekati 100.
   * *Saran Komunikasi*: Sampaikan kepada pembeli bahwa mereka mendapatkan akses ke seluruh koleksi bunga buket studio dan tanaman kebun lengkap.
2. **Paket Harian & Mingguan TIDAK Dapat Kebun Bunga**:
   * Fitur Kebun Bunga (`/kebun`) hanya terbuka untuk **Paket Selamanya (VIP Sultan)** karena kebun dirancang untuk rutinitas jangka panjang (streak harian). Jika pembeli membeli paket harian lalu bertanya kenapa kebunnya masih terkunci, jelaskan bahwa kebun bunga adalah hadiah eksklusif paket Lifetime.
3. **Pembayaran Manual WhatsApp**:
   * Jangan menyebut di konten bahwa website memiliki *"sistem auto-debit kartu kredit"*. Tekankan bahwa pembelian dilakukan dengan *"Transfer QRIS/Bank praktis lewat admin resmi WhatsApp"*.
4. **Batas 5 Perangkat**:
   * Tiap kode voucher dapat dipakai hingga di 5 perangkat (misal: 1 laptop, 2 HP sendiri, dan 2 HP pasangan). Jika perangkat ke-6 mencoba masuk, server akan menolak dengan pesan *"Batas kuota perangkat penuh"*.

---

### Contoh Pertanyaan Pengguna Seputar VIP & Jawaban yang Benar

* **T: "Kak, apakah bikin buket di sini beneran gratis?"**
  * **J**: *"Halo Kak! Betul sekali, 100% gratis! Kakak bisa langsung merangkai puluhan bunga cantik, nulis kartu ucapan, unduh gambar kualitas HD, bahkan bikin link kado amplop bersuara tanpa bayar sepeser pun dan tanpa perlu daftar akun."*
* **T: "Kenapa bunga Calla Lily dan Tulip ada gambar gemboknya?"**
  * **J**: *"Bunga-bunga tersebut termasuk dalam 9 koleksi bunga langka VIP Kak. Untuk memakainya, Kakak bisa membuka akses VIP mulai dari Rp 5.000 saja untuk seharian penuh!"*
* **T: "Apa bedanya Paket Harian sama Paket Selamanya?"**
  * **J**: *"Paket Harian (Rp 5.000) aktif 24 jam untuk merangkai semua bunga studio. Kalau Paket Selamanya (Rp 17.000–25.000), Kakak bayar sekali untuk aktif permanen tanpa batas waktu, dapat fitur eksklusif Kebun Bunga 3D bareng doi, dan bisa unduh kualitas tertinggi Ultra HD 4K!"*
* **T: "Kalau VIP saya habis, buket yang sudah saya unduh bakal hilang gak?"**
  * **J**: *"Gak akan hilang sama sekali Kak! File gambar yang sudah Kakak unduh ke galeri HP tersimpan aman di HP Kakak selamanya."*
* **T: "Bisa dipakai di HP pacar saya juga gak kodenya?"**
  * **J**: *"Bisa banget Kak! Satu kode VIP bisa terhubung hingga ke 5 perangkat berbeda secara bersamaan, jadi bisa dipakai bareng pasangan dan sahabat."*

---

## 5. KADO DIGITAL DAN KEBUN BUNGA

### Alur Kado Digital (`/gift/[id]`)
Kado digital adalah fitur viral paling disukai pengguna:
1. **Sisi Pengirim**:
   * Di Langkah 5 studio, pengirim mengisi nama pengirim, nama penerima, surat ucapan, dan memilih melodi lagu.
   * Server menghasilkan link unik, contoh: `.../gift/gift_k9x2m1...`.
2. **Sisi Penerima**:
   * Penerima membuka tautan di peramban HP mereka.
   * Tampil amplop surat merah muda bertali pita dan segel lilin bertuliskan nama mereka.
   * Begitu amplop disentuh, segel pecah dengan animasi halus, surat meluncur naik, musik berputar lembut secara otomatis, dan bunga buket mekar di layar.
3. **Jenis Data yang Disimpan**:
   * Hanya data tampilan: nama panggilan pengirim, nama penerima, teks ucapan, pilihan lagu, dan susunan koordinat bunga.
   * **TIDAK ADA data pribadi rahasia** (tidak menyimpan nomor rekening, kata sandi, atau lokasi fisik pengguna).
4. **Berapa Lama Link Aktif?**:
   * Di dalam database, link kado disimpan **permanen tanpa batas kedaluwarsa waktu**. Penerima dapat membuka kembali tautan kenangan ini berbulan-bulan bahkan bertahun-tahun kemudian.
5. **Jika Link Tidak Ditemukan**:
   * Tampil layar santun: *"Hadiah buket digital tidak ditemukan atau sudah kedaluwarsa"*, dengan tombol ramah untuk kembali ke beranda.

---

### Mekanisme Kebun Bunga Virtual (`/kebun`)
Fitur ini dirancang khusus untuk membangun keterikatan emosional pengguna jangka panjang:
1. **Pulau Terapung Isometrik**:
   * Kebun berbentuk pulau tanah melayang yang indah dengan animasi dedaunan dan dekorasi air mancur.
2. **Siklus Waktu Alami (Dynamic Ambient)**:
   * Mengikuti jam asli perangkat pengguna:
     * Siang (06:00 – 16:59): Langit cerah berawan lembut.
     * Senja (17:00 – 18:59): Langit keemasan (*golden hour*) yang romantis.
     * Malam (19:00 – 05:59): Langit gelap berbintang dengan kunang-kunang berpendar di sekitar bunga.
3. **Sistem Tumbuh & Siram Harian (Daily Streak)**:
   * Pengguna menanam bibit dari 40 katalog bunga kebun.
   * Tombol siram hanya bisa ditekan satu kali per hari kalender untuk menambah akumulasi hari rawat (*streak*):
     * **Hari 0–2**: Tahap 1 (Bibit Tunas Mungil 🌱).
     * **Hari 3–4**: Tahap 2 (Kuncup Bersemi 🌿).
     * **Hari 5–6**: Tahap 3 (Mekar Sempurna 🌸).
     * **Hari 7+**: Tahap 4 (Puspa Cahaya Legendaris Berpendar ✨).
4. **Fitur Petik Bunga ke Studio**:
   * Bunga yang sudah mekar sempurna di kebun dapat dipetik dan langsung dimasukkan ke studio buket untuk dirangkai menjadi hadiah nyata.

---

## 6. KEUNGGULAN YANG BISA DIJUAL & BATASAN JANJI

### Fitur Nyata yang Paling Menjual untuk Promosi:
1. **"Buka Amplop Bersegel Lilin dengan Musik"**: Paling mudah memikat perhatian penonton di 3 detik pertama video media sosial.
2. **"Putar Kemiringan Bunga Bebas (-15° s/d +15°)"**: Memperlihatkan bahwa buket di web ini benar-benar fleksibel dan realistis, bukan sekadar stiker kaku.
3. **"1 Kode VIP untuk 5 Perangkat"**: Sangat menjual bagi pasangan atau geng pertemanan karena terasa sangat murah jika dibagi bersama.
4. **"Unduh File PNG Transparan"**: Sangat disukai Gen Z untuk dijadikan stiker WhatsApp pribadi atau tempelan foto polaroid.
5. **"Kebun Bunga Virtual Berdua"**: Solusi ampuh pengobat rindu bagi pejuang hubungan LDR.

### Batasan Penting: Hal yang JANGAN Dijanjikan Berlebihan!
* ⚠️ **Jangan menjanjikan pengiriman bunga fisik otomatis**: Web ini adalah studio buket virtual digital. Jika belum ada kerjasama pengiriman buket bunga asli dengan kurir, jangan pernah membuat konten yang mengesankan bunga fisik akan dikirim ke rumah pelanggan.
* ⚠️ **Jangan menjanjikan pembayaran otomatis satu detik**: Karena alur pembelian menggunakan verifikasi transfer manual via WhatsApp, jelaskan bahwa kode dikirimkan oleh admin secara cepat setelah konfirmasi pembayaran.
* ⚠️ **Jangan memakai karakter anime/kartun berhak cipta**: Di media sosial, jangan membuat konten yang menonjolkan karakter berhak cipta. Gunakan selalu model pembungkus generik yang elegan (Origami Korea, Koran Vintage, Rustic Craft, Edisi Royal Emas).

---

## 7. BANK IDE KONTEN PROMOSI (30 IDE TIKTOK / REELS)

Berikut adalah 30 konsep video siap rekam yang telah disesuaikan dengan momen emosional nyata:

### Kategori A: Momen Wisuda & Kelulusan Sidang (1–5)
1. **Ide 1: Kado Wisuda Anti-Basi Buat Bestie**
   * *Hook (0–3 dtk)*: "Jangan cuma ngasih ucapan template di chat pas bestiemu sidang skripsi!"
   * *Alur*: Buka web Laysa di HP -> Pilih buket 25 bunga -> Masukkan kartu ucapan selamat sarjana -> Download PNG jernih -> Kirim ke WA bestie.
   * *Teks Layar*: "Bikin buket wisuda digital sendiri cuma 2 menit 🎓💐"
   * *Fitur Ditampilkan*: Template kartu ucapan wisuda + download resolusi tinggi.
2. **Ide 2: Tren Baru Bawa Buket Wisuda Tanpa Takut Layu**
   * *Hook*: "Buket bunga asli 300 ribu layu dalam 3 hari? Cobain yang ini..."
   * *Alur*: Tunjukkan hasil buket Laysa yang sangat estetik di layar tablet/HP disandingkan dengan toga wisuda.
   * *Teks Layar*: "Kado wisuda abadi, bisa disimpan selamanya ✨"
   * *Fitur*: Rotasi bunga di studio + pilihan wrapper Korean style.
3. **Ide 3: Merangkai Bunga Sesuai Warna Almamater Kampus**
   * *Hook*: "Bikin buket wisuda yang warnanya senada sama selempang sarjana doi!"
   * *Alur*: Memilih kertas pembungkus hitam-emas, memadukan mawar kuning dan baby's breath putih.
   * *Teks Layar*: "Custom buket kampus impian 🎓"
   * *Fitur*: Katalog bunga utama & filter warna wrapper.
4. **Ide 4: Kado Kilat 5 Menit Sebelum Teman Keluar Ruang Sidang**
   * *Hook*: "Panik lupa beli kado padahal teman bentar lagi selesai sidang?!"
   * *Alur*: Screen recorder tangan cepat memilih formasi 1-klik kubah -> ketik nama teman -> download langsung kirim.
   * *Teks Layar*: "Penyelamat pas mepet! Gratis tanpa daftar ⚡"
   * *Fitur*: Formasi otomatis 1-klik + tanpa login.
5. **Ide 5: Reaksi Teman Saat Dikirimi Link Kado Wisuda**
   * *Hook*: "Reaksi sahabatku pas kukirimin link misterius beramplop..."
   * *Alur*: Menampilkan rekaman layar saat amplop kado wisuda terbuka dengan denting piano lembut.
   * *Teks Layar*: "Dia terharu banget sampai nangis 🥺💌"
   * *Fitur*: Halaman kado interaktif `/gift/[id]`.

---

### Kategori B: Hubungan Jarak Jauh / Pasangan LDR (6–11)
6. **Ide 6: POV Pacaran Beda Pulau di Hari Valentine / Anniversary**
   * *Hook*: "POV: Kamu LDR 1.500 km dan gak bisa ngasih bunga langsung..."
   * *Alur*: Rekam proses merangkai bunga mawar pink, sematkan kartu ucapan rindu, pilih lagu *Romantic Piano*, lalu kirimkan linknya ke chat doi.
   * *Teks Layar*: "Jarak boleh jauh, tapi bunga buat kamu tetap mekar 🥺✈️"
   * *Fitur*: Form pembuatan kado berlagu + amplop bersegel.
7. **Ide 7: Mengajak Doi Rawat Kebun Bunga Berdua**
   * *Hook*: "Cara baru LDR-an biar gak bosen cuma telponan tiap malam!"
   * *Alur*: Tunjukkan tampilan Kebun Bunga 3D Laysa, klik siram bersama, perlihatkan bunga yang tumbuh mekar di hari ke-7.
   * *Teks Layar*: "Punya kebun virtual berdua sama doi 🌸🔥"
   * *Fitur*: Fitur eksklusif VIP Kebun Bunga `/kebun` + streak api.
8. **Ide 8: Kirim Bunga Tiap Jam Sesuai Karakter Doi**
   * *Hook*: "Bikinin buket bunga berdasarkan kepribadian cowok/cewekku!"
   * *Alur*: Menjelaskan arti tiap tangkai bunga (Mawar putih = tulus, Krisan = setia, Baby's breath = selalu ada).
   * *Teks Layar*: "Arti bunga buat si paling sabar 🌷"
   * *Fitur*: Detail deskripsi bunga di katalog studio.
9. **Ide 9: Buket Virtual Pengganti Pap Bunga Asli**
   * *Hook*: "Minta pap bunga ke doi, tapi malah dibikinin ginian..."
   * *Alur*: Menampilkan transisi dari chat WA ke layar kado digital Laysa yang sedang berputar anggun.
   * *Teks Layar*: "Cowok yang effort-nya gak ada obat 💐✨"
   * *Fitur*: Buka amplop bersegel lilin di `/gift/[id]`.
10. **Ide 10: Kebun Bunga Waktu Malam Berbintang**
    * *Hook*: "Tahukah kamu kebun bunga Laysa berubah jadi malam kalau dibuka jam 8 malam?"
    * *Alur*: Rekam layar kebun dengan kunang-kunang berpendar dan lentera menyala di waktu malam.
    * *Teks Layar*: "Vibes malamnya calming banget buat pejuang LDR 🌙✨"
    * *Fitur*: Dynamic ambient waktu alami kebun.
11. **Ide 11: Satu Voucher VIP Dipakai Berdua Bareng Pasangan**
    * *Hook*: "Beli satu akses VIP tapi bisa dibuka bareng di HP aku dan HP doi!"
    * *Alur*: Perlihatkan aktivasi kode VIP di dua HP berbeda secara berdampingan.
    * *Teks Layar*: "Bisa sampai 5 HP sekaligus, hemat banget 💕"
    * *Fitur*: Kuota multi-device 5 slot perangkat.

---

### Kategori C: Ulang Tahun & Perayaan Spesial (12–17)
12. **Ide 12: Kejutan Tengah Malam Tepat Jam 00:00**
    * *Hook*: "Kirim kado tepat jam 12 malam tanpa perlu bangunin kurir ekspedisi!"
    * *Alur*: Jam HP menunjukkan 00:00, langsung kirim tautan `/gift/[id]` dengan lagu *Happy Birthday Ceria*.
    * *Teks Layar*: "Kejutan manis paling tepat waktu 🎂🎉"
    * *Fitur*: Musik kado Happy Birthday + tautan instan.
13. **Ide 13: Menjadikan Buket Bunga Stiker WhatsApp Transparan**
    * *Hook*: "Cara bikin stiker WA buket bunga custom pakai namamu sendiri!"
    * *Alur*: Rangkai buket di Laysa -> Pilih format PNG Transparan -> Masukkan ke WhatsApp -> Kirim stiker ke grup.
    * *Teks Layar*: "Lucu banget buketnya bisa jadi stiker WA transparan 🎀"
    * *Fitur*: Download format PNG latar transparan.
14. **Ide 14: Kado Mewah Budget Pelajar Cuma Rp 5.000**
    * *Hook*: "Modal 5 ribu perak udah bisa ngasih kado semewah ini ke gebetan?!"
    * *Alur*: Tunjukkan paket harian VIP yang membuka seluruh 53 bunga dan pembungkus emas.
    * *Teks Layar*: "Akses VIP 24 jam cuma seharga jajan cireng 😭💸"
    * *Fitur*: Paket VIP Harian Rp 5.000.
15. **Ide 15: Buket Mega 50 Bunga untuk Lamaran / Anniversary**
    * *Hook*: "Pernah liat buket virtual isi 50 bunga rimbun sekaligus?"
    * *Alur*: Pilih varian 50 bunga Grand Royale, pasang formasi kubah raksasa, beri kartu ucapan menyentuh.
    * *Teks Layar*: "Spektakuler banget buat momen spesial 💍"
    * *Fitur*: Pilihan kapasitas 50 bunga di `FlowerCountModal`.
16. **Ide 16: Bikin Wallpaper HP Romantis dari Buket Sendiri**
    * *Hook*: "Stop pakai wallpaper Pinterest pasaran! Bikin yang ada namamu sendiri..."
    * *Alur*: Pilih rasio 9:16 di studio -> Rangkai bunga -> Unduh -> Pasang jadi lockscreen HP.
    * *Teks Layar*: "Lockscreen aesthetic buatan tangan sendiri 📱🌸"
    * *Fitur*: Pilihan rasio kanvas 9:16 vertikal penuh.
17. **Ide 17: Ulang Tahun Ibu (Hari Ibu & Ungkapan Terima Kasih)**
    * *Hook*: "Kapan terakhir kali kamu ngasih bunga buat Ibu?"
    * *Alur*: Rangkai buket anyelir merah muda dan krisan putih, tulis surat panjang menyentuh hati untuk Ibu.
    * *Teks Layar*: "Buket terima kasih buat wanita terhebat di dunia 🤍"
    * *Fitur*: Surat ucapan panjang di kartu Laysa.

---

### Kategori D: Ungkapan Permohonan Maaf / Baikan (18–21)
18. **Ide 18: Cara Minta Maaf Paling Effort Pas Doi Ngambek**
    * *Hook*: "Doi lagi ngambek berat dan chat kamu cuma di-read?"
    * *Alur*: Buka Laysa -> Pilih bunga putih tanda damai -> Tulis surat tulus di kartu ucapan -> Kirim link kado amplop bersegel.
    * *Teks Layar*: "Jurus baikan paling ampuh, dijamin luluh 🥺🙏"
    * *Fitur*: Amplop kado digital bersegel lilin.
19. **Ide 19: Buket Bunga Monokrom / Vintage Klasik**
    * *Hook*: "Bukan buket pink biasa, ini buket vintage koran tua buat cowok!"
    * *Alur*: Memilih kertas koran klasik dan bunga dahlia oranye dengan nuansa atelier hangat.
    * *Teks Layar*: "Estetika vintage klasik yang maskulin 📰🍂"
    * *Fitur*: Wrapper motif koran vintage generik.
20. **Ide 20: Permintaan Maaf untuk Sahabat Karena Sibuk**
    * *Hook*: "Buat bestie yang sering kukira cuek padahal aku yang jarang ada waktu..."
    * *Alur*: Memilih buket bunga matahari ceria sebagai lambang persahabatan hangat.
    * *Teks Layar*: "Persahabatan abadi yang mekar selamanya 🌻"
    * *Fitur*: Bunga matahari & kartu pesan kustom.
21. **Ide 21: Kirim Pesan Rahasia yang Terkunci di Amplop**
    * *Hook*: "Kirim surat rahasia yang cuma bisa dibaca kalau segel lilinnya dipecahkan!"
    * *Alur*: Tunjukkan animasi close-up saat jari mengetuk segel lilin amplop dan kertas surat perlahan naik.
    * *Teks Layar*: "Sensasi buka surat rahasia berharga 💌"
    * *Fitur*: Animasi unboxing segel lilin di `/gift/[id]`.

---

### Kategori E: Eksplorasi Fitur VIP & Kemewahan Studio (22–26)
22. **Ide 22: Unboxing Bunga VIP Langka (Calla Lily & Tulip Belanda)**
    * *Hook*: "Spill 9 bunga langka yang cuma ada di akun VIP Laysa!"
    * *Alur*: Tampilkan perbedaan kuntum Calla Lily putih mewah, Tulip ungu beludru, dan Ranunculus Korea.
    * *Teks Layar*: "Visualnya jernih banget sampai serat kelopaknya kelihatan 👑"
    * *Fitur*: 9 varian bunga langka VIP.
23. **Ide 23: Perbandingan Resolusi Cetak Gambar 1x vs 4K Ultra**
    * *Hook*: "Jangan unduh resolusi kecil kalau mau dicetak ke figura!"
    * *Alur*: Perlihatkan hasil zoom-in ekspor 4K (2100×2100 px) yang tetap tajam tanpa pecah sama sekali.
    * *Teks Layar*: "3.5x Lossless Master jernih parah 🔍🖼️"
    * *Fitur*: Ekspor resolusi Ultra HD 4K.
24. **Ide 24: Pakai Foto Kamar / Meja Sendiri Jadi Latar Buket**
    * *Hook*: "Fitur rahasia VIP: Bisa ganti latar kanvas pakai foto meja kamarmu sendiri!"
    * *Alur*: Unggah foto meja kayu pribadi, letakkan buket di atasnya sehingga tampak seperti bunga sungguhan ada di kamar.
    * *Teks Layar*: "Kelihatan nyata banget kayak ditaruh di meja 📸✨"
    * *Fitur*: Custom background kanvas eksklusif VIP Sultan.
25. **Ide 25: Tutorial Memutar Bunga Agar Terlihat Rangkai Tangan Florist**
    * *Hook*: "Trik bikin buket virtual gak kaku: Pakai fitur rotasi 15 derajat!"
    * *Alur*: Tunjukkan cara menekan tombol -15° dan +15° serta layering di dalam kantung buket.
    * *Teks Layar*: "Teknik florist profesional di HP kamu ✂️💐"
    * *Fitur*: Rotasi -15°/+15° & layer kantung.
26. **Ide 26: Draf Desain Gak Bakal Hilang Walau Ganti Laptop**
    * *Hook*: "Mulai rangkai di HP pas di jalan, lanjutin edit di laptop pas di rumah!"
    * *Alur*: Tunjukkan autosave cloud terenkripsi yang langsung sinkron saat login kode di browser lain.
    * *Teks Layar*: "Cloud Vault VIP Laysa aman tanpa takut hilang 🔒☁️"
    * *Fitur*: Autosave cloud AES-256 multi-device.

---

### Kategori F: ASMR, Musik Santai & Visual Estetik (27–30)
27. **Ide 27: ASMR Rangkai Bunga Virtual Tanpa Suara Musik (Hanya Sfx Klik Halus)**
    * *Hook*: "Tonton ini kalau kamu butuh ketenangan setelah seharian lelah..."
    * *Alur*: Video hening tanpa suara orang bicara, hanya rekaman suara lembut saat bunga diklik, diputar, dan ditata rapi.
    * *Teks Layar*: "Relaxing floral atelier therapy 🎧🌿"
    * *Fitur*: Suara interaktif synthesizer Web Audio studio.
28. **Ide 28: Dengerin 4 Musik Kado Romantis Laysa**
    * *Hook*: "Rate 4 melodi romantis pengiring kado digital buket bunga!"
    * *Alur*: Putar cuplikan nada *Romantic Piano*, lanjut ke *Acoustic Love*, *Happy Birthday*, dan *Lofi Chill*.
    * *Teks Layar*: "Mana lagu favoritmu buat dikirim ke doi? 🎶"
    * *Fitur*: 4 pilihan melodi musik kado.
29. **Ide 29: Menata Formasi Hati untuk Crush**
    * *Hook*: "Iseng-iseng bikin buket bentuk hati buat cowok yang kusuka..."
    * *Alur*: Klik tombol formasi 'Hati' otomatis, rapikan kuntum mawar merah, beri ucapan manis pendek.
    * *Teks Layar*: "Bentuk hatinya simetris sempurna ❤️"
    * *Fitur*: Formasi otomatis 1-klik 'Hati'.
30. **Ide 30: Menghitung Berapa Kunjungan yang Sudah Datang ke Web Laysa**
    * *Hook*: "Ribuan orang ternyata udah bikin buket bunga di website ini!"
    * *Alur*: Sorot pill badge counter pengunjung di beranda: *'🌸 1.250+ Pecinta Bunga Telah Berkunjung & Merangkai'*.
    * *Teks Layar*: "Terima kasih sudah merangkai kasih sayang di sini 💕"
    * *Fitur*: Live visitor counter badge di beranda.

---

## 8. CAPTION DAN SKRIP JUALAN VIP (BILINGUAL)

Gunakan caption elegan berikut untuk menawarkan paket VIP tanpa terkesan memaksa:

### 1. Penawaran Paket Selamanya (Paling Populer)
* **Versi Indonesia**:
  > *"Hadiah bunga terbaik adalah yang mekar selamanya tanpa pernah layu. Buka akses VIP Sultan Laysa sekarang: akses permanen seumur hidup sekali bayar, rawat kebun bunga duet bareng pasangan, dan unduh kualitas Ultra HD 4K tanpa batas. Hubungi admin resmi kami untuk aktivasi instan 🌸✨"*
* **English Version**:
  > *"The most beautiful flowers are the ones that never fade. Unlock Laysa Sultan VIP today: lifetime permanent access with a single payment, nurture a 3D daily flower garden with your partner, and enjoy unlimited Ultra HD 4K master downloads. Chat with our official concierge for instant activation 🌸✨"*

### 2. Penawaran Paket Harian Hemat untuk Wisuda
* **Versi Indonesia**:
  > *"Lagi musim wisuda dan mau kirim kado berkelas buat sahabat? Cuma Rp 5.000 untuk Paket Harian 24 Jam, kamu sudah bisa bebas pakai seluruh koleksi bunga langka dan model buket mewah. Rangkai sekarang di link bio ya! 🎓💐"*
* **English Version**:
  > *"Graduation season is here! Send an unforgettable token of love to your besties. For just Rp 5,000, unlock full 24-hour access to all rare flowers and luxury royal wrappers. Create your bouquet now via the link in bio! 🎓💐"*

### 3. Penawaran Fitur Kebun Bunga Pasangan LDR
* **Versi Indonesia**:
  > *"Jarak ribuan kilometer bukan halangan buat punya rutinitas manis tiap hari. Siram kebun bunga virtual kalian berdua, jaga apinya jangan sampai padam, dan lihat bunganya berpendar di waktu malam. Buka akses Kebun Bunga VIP Sultan Laysa sekarang 💕"*
* **English Version**:
  > *"Long distance is no match for shared little moments. Nurture your virtual flower garden together, keep your daily streak alive, and watch blossoms glow under starry skies. Unlock Laysa Sultan VIP Garden today 💕"*

### 4. Penawaran Bebas Batas 5 Perangkat
* **Versi Indonesia**:
  > *"Satu voucher, lima kebahagiaan! Kode VIP Laysa bisa kamu hubungkan hingga ke 5 perangkat berbeda sekaligus. Cocok banget buat patungan bareng geng wisuda atau dipakai bareng keluarga tersayang ✨"*
* **English Version**:
  > *"One pass, five times the joy! Your Laysa VIP access code connects up to 5 devices simultaneously. Perfect to share with your besties or your significant other ✨"*

### 5. Penawaran Kualitas Cetak Ultra 4K
* **Versi Indonesia**:
  > *"Mau hasil buket virtualmu dicetak ke pigura kaca meja belajar? Pastikan ekspor dengan resolusi Ultra HD 4K dari akun VIP Laysa. Detail kelopak dan bayangannya super tajam tanpa pecah sama sekali 🖼️"*
* **English Version**:
  > *"Planning to print your bouquet for a desktop photo frame? Export in Ultra HD 4K with Laysa VIP. Flawless petals and authentic floral depth with zero pixelation 🖼️"*

### 6. Penawaran Kado Spontan & Cepat
* **Versi Indonesia**:
  > *"Gak sempat beli kado fisik? Tenang, kamu cuma butuh 3 menit di Laysa Bouquet Studio. Buka semua pilihan bunga eksklusif dan buat tautan kado beramplop musik yang elegan. Klik link di bio untuk coba langsung 💌"*
* **English Version**:
  > *"Running out of time for a gift? In just 3 minutes, craft an exquisite bouquet with our VIP blooms and generate an interactive musical gift envelope. Tap the link in bio to start 💌"*

### 7. Penawaran Paket Mingguan (7 Hari)
* **Versi Indonesia**:
  > *"Punya banyak teman yang sidang skripsi pekan ini? Ambil Paket Mingguan 7 Hari cuma Rp 12.000. Bebas bikin dan simpan puluhan buket berbeda sepuasnya selama satu minggu penuh! 📅"*
* **English Version**:
  > *"Multiple celebrations this week? Grab our 7-Day Weekly Pass for only Rp 12,000. Create, customize, and save countless unique bouquets all week long! 📅"*

### 8. Penawaran Stiker WA Transparan
* **Versi Indonesia**:
  > *"Bikin stiker WhatsApp buket bunga custom yang gak bakal bisa ditiru siapa pun. Unduh format PNG transparan berkualitas tinggi di Laysa Bouquet Studio. Coba sekarang gratis! 📱"*
* **English Version**:
  > *"Create one-of-a-kind transparent WhatsApp bouquet stickers. Download crisp lossless PNGs at Laysa Bouquet Studio today! 📱"*

### 9. Penawaran Romantis Hari Ibu & Anniversary
* **Versi Indonesia**:
  > *"Kadang kata-kata gak cukup untuk mengungkapkan rasa terima kasih. Ungkapkan lewat buket bunga abadi dan surat bersegel yang menyentuh hati di Laysa. Buka kode VIP untuk hasil paling sempurna 🤍"*
* **English Version**:
  > *"When words aren't enough, let everlasting blossoms speak. Craft a heartfelt sealed letter and bouquet on Laysa today 🤍"*

### 10. Penawaran Santai Tanpa Paksaan
* **Versi Indonesia**:
  > *"Rangkai bungamu dengan gratis sepuasnya hari ini. Kalau kamu jatuh cinta sama bunga langkanya dan pengen punya kebun berdua doi, pintu VIP kami selalu terbuka kapan pun kamu siap 🌸"*
* **English Version**:
  > *"Design your bouquet for free today! Whenever you're ready to unlock rare botanical treasures and your private couple garden, our VIP atelier is here for you 🌸"*

---

## 9. FAQ PENGGUNA (20 TANYA JAWAB SOLUTIF)

1. **Apakah website ini benar-benar bisa dipakai secara gratis?**
   * *Jawaban*: Ya, 100% gratis! Anda bisa merangkai bunga, menulis kartu ucapan, dan mengunduh gambar buket resolusi HD tanpa perlu membayar apa pun.
2. **Apakah saya wajib mendaftar akun atau memasukkan email?**
   * *Jawaban*: Tidak perlu sama sekali! Anda bisa langsung masuk ke studio dan merangkai buket secara instan tanpa perlu repot mengisi formulir pendaftaran.
3. **Bagaimana cara menyimpan hasil buket saya?**
   * *Jawaban*: Di langkah ke-5, tekan tombol *"Pilih Format"* (PNG untuk latar transparan atau JPG untuk latar studio), lalu tekan tombol *"Unduh Gambar Sekarang"*.
4. **Apa perbedaan antara format PNG dan JPG saat diunduh?**
   * *Jawaban*: Format PNG memiliki latar belakang transparan (sangat cocok untuk stiker WA atau tempelan foto), sedangkan format JPG dilengkapi latar studio bersih bernuansa atelier.
5. **Apakah link kado digital yang saya buat untuk pacar saya ada batas kedaluwarsanya?**
   * *Jawaban*: Tidak ada! Link kado tersimpan permanen di cloud dan bisa dibuka kembali kapan saja sebagai kenangan manis.
6. **Apakah penerima kado harus membayar untuk membuka link kado saya?**
   * *Jawaban*: Tidak, penerima kado dapat membuka amplop dan mendengarkan lagunya secara gratis tanpa biaya apa pun.
7. **Mengapa saat saya klik bunga tertentu muncul jendela VIP?**
   * *Jawaban*: Bunga tersebut termasuk dalam 9 koleksi bunga langka eksklusif VIP (seperti Calla Lily dan Tulip Belanda). Anda dapat membuka seluruh koleksi dengan mengaktifkan paket VIP.
8. **Berapa harga paket VIP di Bucket Bunga Laysa?**
   * *Jawaban*: Paket Harian (24 Jam) seharga Rp 5.000, Paket Mingguan (7 Hari) seharga Rp 12.000, dan Paket Selamanya (VIP Sultan) promo seharga Rp 17.000 – Rp 25.000 (sekali bayar permanen).
9. **Bagaimana cara membeli paket VIP?**
   * *Jawaban*: Klik tombol *"Pesan via WhatsApp"* di jendela VIP. Anda akan langsung terhubung dengan admin resmi kami untuk mendapatkan instruksi transfer dan menerima kode akses.
10. **Berapa banyak perangkat yang bisa menggunakan satu kode VIP?**
    * *Jawaban*: Satu kode VIP dapat digunakan hingga di 5 perangkat berbeda secara bersamaan (misal: ponsel Anda, laptop, dan ponsel pasangan Anda).
11. **Apa itu fitur Kebun Bunga Virtual (`/kebun`)?**
    * *Jawaban*: Kebun Bunga adalah pulau virtual 3D interaktif tempat Anda dan pasangan bisa menanam 40 jenis tanaman bunga dan menyiramnya setiap hari untuk menjaga api kebersamaan (*daily streak*).
12. **Apakah Paket Harian mendapatkan akses ke Kebun Bunga?**
    * *Jawaban*: Fitur Kebun Bunga adalah bonus eksklusif yang dirancang khusus untuk pemilik **Paket Selamanya (VIP Sultan)**.
13. **Bagaimana cara kerja musik di link kado? Apakah butuh kuota internet besar?**
    * *Jawaban*: Musik kami dihasilkan secara prosedural berbasis sistem audio web ringan, sehingga tidak mengunduh berkas MP3 berat dan langsung berbunyi seketika tanpa jeda.
14. **Apakah saya bisa memutar sudut kemiringan bunga?**
    * *Jawaban*: Ya! Klik bunga yang ingin diatur di kanvas, lalu gunakan tombol putar `-15°` atau `+15°` di bilah alat atas.
15. **Bagaimana cara memasukkan tangkai bunga ke dalam saku pembungkus buket?**
    * *Jawaban*: Di bilah alat atas studio, pilih opsi lapisan *"Di Dalam Saku"*. Bunga akan otomatis terselip rapi di balik kertas buket.
16. **Bisakah saya membuat buket dengan rasio layar penuh untuk Story TikTok/Instagram?**
    * *Jawaban*: Tentu bisa! Di Langkah 1, pilih rasio kanvas `9:16` vertikal untuk menghasilkan buket berukuran layar penuh ponsel.
17. **Saya salah merangkai bunga, apakah bisa dibatalkan?**
    * *Jawaban*: Ya, tekan tombol *"Urungkan (Undo)"* di bilah alat atas untuk membatalkan langkah terakhir Anda.
18. **Apakah buket fisik asli akan dikirimkan ke alamat rumah saya?**
    * *Jawaban*: Laysa adalah studio buket virtual digital. Namun, gambar yang Anda unduh dapat Anda tunjukkan ke florist lokal terdekat sebagai acuan pesanan buket nyata.
19. **Jika saya ganti HP, apakah status VIP saya akan hilang?**
    * *Jawaban*: Tidak hilang! Cukup masukkan kembali kode akses VIP Anda di HP yang baru pada menu *"Masukkan Kode Akses"*.
20. **Ke mana saya harus menghubungi jika mengalami kendala teknis?**
    * *Jawaban*: Anda dapat menghubungi admin resmi kami melalui tombol WhatsApp resmi yang tertera di menu VIP atau beranda website.

---

## 10. CHECKLIST SEBELUM MEMBUAT KONTEN REKAMAN LAYAR

Sebelum menekan tombol perekam layar (*screen record*) di HP atau laptop untuk konten TikTok/Reels, periksa 6 poin ini:
* [ ] **Pastikan Menggunakan Model Buket Generik**: Jangan merekam atau mempromosikan model edisi karakter berhak cipta (kartun/anime). Gunakan model Origami Korea, Koran Vintage, Rustic Craft, atau Edisi Royal Emas.
* [ ] **Cek Volume Suara HP**: Pastikan media audio aktif agar efek suara klik atelier dan alunan musik kado terdengar jelas di mikrofon rekaman.
* [ ] **Gunakan Tampilan Bersih**: Tutup notifikasi aplikasi chat atau pesan pribadi sebelum merekam agar tidak bocor ke video publik.
* [ ] **Periksa Ketersediaan Bahasa**: Pastikan bahasa tampilan sesuai dengan target penonton (pilih ID untuk penonton lokal atau EN untuk penonton internasional melalui tombol bendera di navbar).
* [ ] **Gunakan Akun VIP Contoh**: Untuk konten fitur VIP, pastikan kode sudah terpasang agar ikon gembok terbuka saat Anda memperlihatkan Calla Lily atau ekspor 4K.
* [ ] **Jaga Kerahasiaan Admin**: Jangan pernah merekam atau memperlihatkan halaman vault admin, kunci rahasia, atau data pembeli di dalam rekaman video promosi.

---

## 11. KAMUS ISTILAH AWAM

* **Atelier**: Ruang kerja seni atau studio tempat perajin/florist merangkai karya cantiknya dengan teliti.
* **Canvas (Kanvas)**: Panggung kerja visual tempat pengguna menyusun bunga dan melihat tampilan buketnya secara langsung.
* **Drag & Drop**: Gerakan menyentuh benda di layar lalu menggesernya ke tempat yang diinginkan dengan ujung jari atau tetikus.
* **Z-Index (Lapisan Kedalaman)**: Urutan tumpukan benda visual (apakah bunga berada di tumpukan paling depan, di tengah, atau tersembunyi di belakang kertas).
* **Nudge (Geser Presisi)**: Tombol panah kecil untuk menggeser bunga sejauh beberapa piksel saja agar posisinya super presisi tanpa meleset.
* **Lossless**: Kualitas berkas gambar murni yang sangat padat dan tidak mengalami penurunan ketajaman saat disimpan.
* **Web Audio API**: Teknologi pemutar nada langsung dari mesin peramban web tanpa perlu mengunduh berkas rekaman lagu MP3 yang berat.
* **Daily Streak**: Catatan hari berturut-turut seorang pengguna melakukan aktivitas (seperti menyiram tanaman kebun setiap hari tanpa terputus).
* **Vault Cloud AES-256**: Sistem penyimpanan digital dengan proteksi enkripsi standar tinggi yang menjaga draf rancangan buket pengguna tetap aman di peladen awan.

---

## 12. HAL YANG MEMERLUKAN KEPUTUSAN PEMILIK

Berikut adalah catatan temuan nyata dari audit kode proyek yang memerlukan arahan atau keputusan dari pemilik toko:

1. **Perbedaan Angka Promo Paket Selamanya di Berkas Pengaturan**:
   * *Temuan*: Di dalam berkas [`data/pricingConfig.json`](file:///d:/web/bucket/bucket/data/pricingConfig.json), harga promo tercatat **Rp 17.000**, sedangkan di tampilan draf default komponen tertentu pernah tertulis **Rp 25.000**.
   * *Status*: `BELUM JELAS, perlu dicek`.
   * *Saran*: Putuskan satu harga promo resmi yang pasti untuk Paket Selamanya (misal: ditetapkan bulat Rp 20.000 atau tetap Rp 17.000) agar seragam di semua materi promosi dan admin WhatsApp.
2. **Klaim "100+ Bunga" vs Katalog Riil**:
   * *Temuan*: Di teks promo tertera *"100+ Bunga"*, sedangkan di berkas [`data/flowers.ts`](file:///d:/web/bucket/bucket/data/flowers.ts) studio terdapat **53 varian bunga botani aktif** dan **40 tanaman kebun**.
   * *Status*: `BELUM JELAS, perlu dicek`.
   * *Saran*: Pertahankan narasi *"100+ koleksi bunga buket & kebun"* untuk promosi menyeluruh, atau perbarui teks menjadi *"50+ varian bunga studio buket pilihan"*.
3. **Penyimpanan Kado Digital di Lingkungan Tanpa Database Cloud**:
   * *Temuan*: Jika database cloud Supabase belum dihubungkan, sistem menyimpan kado digital di memori cadangan server (`giftsMemoryStore`). Memori ini dapat tereset jika server melakukan pembaruan berkas atau restart.
   * *Status*: `BELUM JELAS, perlu dicek`.
   * *Saran*: Pastikan kredensial Supabase diisi di server hosting produksi agar seluruh link kado tersimpan permanen tanpa risiko terhapus saat server diperbarui.
4. **Peluang Menjual Buket Fisik Nyata (Omnichannel)**:
   * *Temuan*: Saat ini tombol di studio murni mengunduh gambar dan membuat link kado. Belum ada tombol langsung *"Pesan Versi Asli ke Florist"*.
   * *Saran*: Di masa depan, sangat potensial ditambahkan tombol konversi ke pemesanan bunga asli lewat WhatsApp untuk meraih keuntungan penjualan fisik (margin Rp 100.000–300.000+ per pesanan).

---

## 13. CATATAN TEKNIS & REFERENSI BERKAS SUMBER

Seluruh klaim dan penjelasan di dalam buku panduan ini didasarkan pada berkas kode nyata di dalam proyek:
* **Struktur Halaman Utama**: [`app/page.tsx`](file:///d:/web/bucket/bucket/app/page.tsx) & [`components/home/HomeClientView.tsx`](file:///d:/web/bucket/bucket/components/home/HomeClientView.tsx)
* **Menu Utama**: [`app/menu/page.tsx`](file:///d:/web/bucket/bucket/app/menu/page.tsx)
* **Panduan Studio Visual**: [`app/tutorial/page.tsx`](file:///d:/web/bucket/bucket/app/tutorial/page.tsx) & [`app/tutorial/tutorial.css`](file:///d:/web/bucket/bucket/app/tutorial/tutorial.css)
* **Katalog Bunga & 9 Bunga VIP**: [`data/flowers.ts`](file:///d:/web/bucket/bucket/data/flowers.ts)
* **Koleksi Pembungkus Buket**: [`data/buckets.ts`](file:///d:/web/bucket/bucket/data/buckets.ts)
* **Pilihan Kapasitas Bunga (5–50)**: [`components/designer/FlowerCountModal.tsx`](file:///d:/web/bucket/bucket/components/designer/FlowerCountModal.tsx)
* **Tahapan Kerja Studio (1–5)**: Berkas di folder [`components/steps/`](file:///d:/web/bucket/bucket/components/steps/)
* **Sistem VIP & Verifikasi Kuota 5 Perangkat**: [`context/DesignContext.tsx`](file:///d:/web/bucket/bucket/context/DesignContext.tsx) & [`app/api/verify-code/route.ts`](file:///d:/web/bucket/bucket/app/api/verify-code/route.ts)
* **Modal Pembelian & Draf WhatsApp**: [`components/designer/PremiumUnlockModal.tsx`](file:///d:/web/bucket/bucket/components/designer/PremiumUnlockModal.tsx)
* **Pengaturan Harga & Diskon**: [`app/api/settings/pricing/route.ts`](file:///d:/web/bucket/bucket/app/api/settings/pricing/route.ts) & [`data/pricingConfig.json`](file:///d:/web/bucket/bucket/data/pricingConfig.json)
* **Penerima Kado Bersegel & Musik**: [`app/gift/[id]/page.tsx`](file:///d:/web/bucket/bucket/app/gift/%5Bid%5D/page.tsx) & [`app/api/gifts/route.ts`](file:///d:/web/bucket/bucket/app/api/gifts/route.ts)
* **Kebun Bunga 3D & Waktu Alami**: [`components/garden/IsometricGardenView.tsx`](file:///d:/web/bucket/bucket/components/garden/IsometricGardenView.tsx) & [`data/gardenCatalog.ts`](file:///d:/web/bucket/bucket/data/gardenCatalog.ts)
* **Kamus Terjemahan ID / EN**: [`utils/translations.ts`](file:///d:/web/bucket/bucket/utils/translations.ts)
* **Pelacak Kunjungan & Saklar Beranda**: [`lib/visitorStorage.ts`](file:///d:/web/bucket/bucket/lib/visitorStorage.ts) & [`app/api/site-stats/route.ts`](file:///d:/web/bucket/bucket/app/api/site-stats/route.ts)
