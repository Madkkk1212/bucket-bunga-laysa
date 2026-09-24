---
name: buket-builder
description: Panduan lengkap dan alur kerja pengembangan web studio Buket Bunga (Bouquet Builder). Aktifkan saat mengembangkan fitur perangkai buket, mengelola aset gambar, kanvas visual, atau data katalog.
---

# Buket Builder Studio - Developer Skill & Workflow

Skill ini memuat seluruh panduan arsitektur, standar aset, dan alur kerja utama aplikasi web **Bouquet Builder Studio (Buket Bunga)** di workspace ini.

---

## 1. Konteks & Teknologi Utama

- **Framework & Runtime**: Next.js (App Router), React, TypeScript.
- **Styling**: Vanilla CSS terstruktur (`app/globals.css`).
- **Rendering Engine**: HTML5 Canvas 2D (`app/utils/canvasUtils.ts`) untuk rendering interaktif buket bunga secara berlapis (*multi-layering*).
- **State Management**: React Context di `app/context/DesignContext.tsx`.

---

## 2. Prinsip Eksekusi Mandiri (Autonomous Execution)

1. **Jalankan Perintah Langsung**:
   - Seluruh perintah terminal seperti `npm`, `npx`, `node`, dan `git` selalu dieksekusi langsung.
2. **Validasi Berkala**:
   - Setelah melakukan perubahan kode TypeScript, selalu validasi dengan menjalankan:
     ```bash
     npx tsc --noEmit
     ```
   - Pastikan tidak ada type error sebelum menyelesaikan tugas.

---

## 3. Arsitektur Komponen & Struktur File Kunci

```text
├── app/
│   ├── components/
│   │   ├── designer/           # Studio perangkai buket (PreviewCanvas, toolbar, dsb)
│   │   │   ├── PreviewCanvas.tsx
│   │   │   └── MobileFlowerToolbar.tsx
│   │   ├── steps/              # Alur wizard (Ukuran, Bunga, Wrapper, Kartu Ucapan)
│   │   │   ├── StepSize.tsx    # Pemilihan bucket & filter tema
│   │   │   └── StepFlowers.tsx # Pemilihan bunga & jumlah
│   │   └── home/               # Halaman landing & tombol aksi cepat
│   ├── context/
│   │   └── DesignContext.tsx   # Global state keranjang, bunga terpilih, dan opsi buket
│   ├── data/
│   │   ├── buckets.ts          # Katalog bucket, ukuran, & metadata tema
│   │   └── flowers.ts          # Katalog varietas bunga & harga
│   ├── types/
│   │   └── design.ts           # Definisi interface (BucketSize, PlacedFlower, DesignState)
│   └── utils/
│       └── canvasUtils.ts      # Mesin penggambaran kanvas buket bunga
└── public/
    └── images/
        ├── bucket/             # Aset wrapper bucket (layer back & front)
        └── flowers/            # Aset bunga transparan
```

---

## 4. Sistem Layering Kanvas (Canvas Engine)

Agar bunga tampak realistis terselip di dalam buket:
1. **Layer 1 - Wrapper Belakang (`drawBouquetBack`)**:
   - Merender sayap belakang buket / backing sheet (`${bucketId}_back.png` atau `image`).
2. **Layer 2 - Penataan Bunga (`computeFlowerRenderItems`)**:
   - Merender deretan bunga bertingkat (latar belakang, tengah, depan).
   - Mendukung rotasi, scaling, dan drag-and-drop manual (`isManual`).
3. **Layer 3 - Wrapper Depan & Pita (`drawBouquetFront`)**:
   - Merender bibir depan keranjang/kertas buket (`${bucketId}_front.png`) sehingga tangkai bunga tertutup rapi di bagian depan.

---

## 5. Standar Aset Visual Buket & Bunga

- **Format**: File PNG transparan (RGBA) 1:1 tanpa latar belakang (alpha = 0 pada area luar).
- **Kualitas**:
  - Tanpa watermark, tanpa logo, tanpa teks harga/toko.
  - Tanpa tangan manusia, tanpa meja, tanpa background foto ruangan.
  - Tepi halus (*clean cutout*) tanpa sisa pinggiran hijau (*green fringe*).
- **Pemisahan Layer**:
  - Bucket ideal memiliki dua potongan: `[nama]_back.png` dan `[nama]_front.png`.
