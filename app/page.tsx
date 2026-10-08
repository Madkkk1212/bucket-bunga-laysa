import type { Metadata } from 'next';
import Image from 'next/image';
import { Sparkles, Trophy, Flame } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import HeroActions from '@/components/home/HeroActions';
import HomeClientView from '@/components/home/HomeClientView';
import { DesignProvider } from '@/context/DesignContext';

export const metadata: Metadata = {
  title: 'Bikin Buket Bunga Virtual Gratis — Bucket Bunga Laysa',
  description:
    'Pilih bunga dan pembungkus favoritmu, tulis kartu ucapan personal, lalu unduh gambar buket HD gratis tanpa daftar untuk kado ulang tahun, wisuda, atau pacar LDR.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Bikin Buket Bunga Virtual Gratis — Bucket Bunga Laysa',
    description:
      'Pilih bunga dan pembungkus favoritmu, tulis kartu ucapan personal, lalu unduh gambar buket HD gratis tanpa daftar untuk kado ulang tahun, wisuda, atau pacar LDR.',
    url: 'https://giftbucket.web.id',
    siteName: 'Bucket Bunga Laysa',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/images/home.png',
        width: 1200,
        height: 630,
        alt: 'Bucket Bunga Laysa — Bikin Buket Bunga Virtual Gratis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bikin Buket Bunga Virtual Gratis — Bucket Bunga Laysa',
    description:
      'Pilih bunga dan pembungkus favoritmu, tulis kartu ucapan personal, lalu unduh gambar buket HD gratis tanpa daftar untuk kado ulang tahun, wisuda, atau pacar LDR.',
    images: ['/images/home.png'],
  },
};

export default function HomePage() {
  return (
    <DesignProvider>
      <HomeClientView />

      {/* ── Semantic SEO HTML (terbaca langsung oleh mesin pencari & Googlebot) ── */}
      <section className="sr-only" aria-label="Informasi Produk & FAQ">
        <h2>Bikin Buket Bunga Virtual Gratis</h2>
        <p>Pilih bunga, tulis kartu ucapan, lalu unduh gambarnya untuk dikirim ke orang tersayang.</p>
        
        <h3>Momen Spesial yang Cocok:</h3>
        <ul>
          <li>Kado Ulang Tahun Digital</li>
          <li>Hadiah Wisuda & Kelulusan Sidang Skripsi</li>
          <li>Kejutan Romantis untuk Pacar LDR & Anniversary</li>
          <li>Ungkapan Permohonan Maaf</li>
          <li>Hari Ibu & Ucapan Terima Kasih</li>
        </ul>

        <h3>Pertanyaan yang Sering Diajukan (FAQ):</h3>
        <dl>
          <dt>Apakah membuat buket bunga virtual di sini gratis?</dt>
          <dd>Ya, 100% gratis tanpa perlu mendaftar akun atau mengunduh aplikasi.</dd>
          
          <dt>Bagaimana cara mengirim hasil buketnya?</dt>
          <dd>Setelah merangkai bunga dan menulis kartu ucapan, kamu dapat langsung mengunduh gambar resolusi tinggi (PNG/JPG) untuk dikirim melalui WhatsApp atau media sosial.</dd>
        </dl>
      </section>
    </DesignProvider>
  );
}
