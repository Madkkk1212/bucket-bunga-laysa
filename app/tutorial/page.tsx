import type { Metadata } from 'next';
import TutorialClientView from './TutorialClientView';
import { DesignProvider } from '@/context/DesignContext';

export const metadata: Metadata = {
  title: 'Panduan Lengkap Merangkai Buket Virtual — Bucket Bunga Laysa',
  description:
    'Panduan lengkap cara merangkai buket bunga virtual: memilih ukuran & 56+ model kertas buket, manipulasi rotasi bunga, kontrol lapisan kanvas, kartu ucapan kaligrafi, hingga ekspor gambar HD dan kado link musik interaktif.',
  alternates: {
    canonical: '/tutorial',
  },
  openGraph: {
    title: 'Panduan Lengkap Merangkai Buket Virtual — Bucket Bunga Laysa',
    description:
      'Panduan lengkap cara merangkai buket bunga virtual: memilih ukuran & 56+ model kertas buket, manipulasi rotasi bunga, kontrol lapisan kanvas, kartu ucapan kaligrafi, hingga ekspor gambar HD dan kado link musik interaktif.',
    url: 'https://bucketbunga-laysa.vercel.app/tutorial',
    siteName: 'Bucket Bunga Laysa',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/images/home.png',
        width: 1200,
        height: 630,
        alt: 'Bucket Bunga Laysa — Panduan Merangkai Buket Virtual',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Panduan Lengkap Merangkai Buket Virtual — Bucket Bunga Laysa',
    description:
      'Panduan lengkap cara merangkai buket bunga virtual: memilih ukuran & 56+ model kertas buket, manipulasi rotasi bunga, kontrol lapisan kanvas, kartu ucapan kaligrafi, hingga ekspor gambar HD dan kado link musik interaktif.',
    images: ['/images/home.png'],
  },
};

export default function TutorialPage() {
  return (
    <DesignProvider>
      <TutorialClientView />
    </DesignProvider>
  );
}
