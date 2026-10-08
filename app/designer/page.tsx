import type { Metadata } from 'next';
import StudioLoader from './StudioLoader';

export const metadata: Metadata = {
  title: 'Studio Buat Buket — Bucket Bunga Laysa',
  description:
    'Rancang buket bunga virtual sesukamu secara gratis. Pilih dari 56+ model kertas buket, padukan 53+ varietas bunga botani di kanvas interaktif, tulis kartu ucapan, dan ekspor gambar HD (PNG/JPG) atau kado link dengan musik.',
  alternates: {
    canonical: '/designer',
  },
  openGraph: {
    title: 'Studio Buat Buket — Bucket Bunga Laysa',
    description:
      'Rancang buket bunga virtual sesukamu secara gratis. Pilih dari 56+ model kertas buket, padukan 53+ varietas bunga botani di kanvas interaktif, tulis kartu ucapan, dan ekspor gambar HD (PNG/JPG) atau kado link dengan musik.',
    url: 'https://giftbucket.web.id/designer',
    siteName: 'Bucket Bunga Laysa',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/images/home.png',
        width: 1200,
        height: 630,
        alt: 'Bucket Bunga Laysa — Studio Buat Buket',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Studio Buat Buket — Bucket Bunga Laysa',
    description:
      'Rancang buket bunga virtual sesukamu secara gratis. Pilih dari 56+ model kertas buket, padukan 53+ varietas bunga botani di kanvas interaktif, tulis kartu ucapan, dan ekspor gambar HD (PNG/JPG) atau kado link dengan musik.',
    images: ['/images/home.png'],
  },
};

export default function DesignerPage() {
  return (
    <div className="designer-page-wrapper">
      <StudioLoader />
    </div>
  );
}
