import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DesignProvider } from '@/context/DesignContext';
import DesignerClient from '@/components/designer/DesignerClient';

export const metadata: Metadata = {
  title: 'Studio Buat Buket — Bucket Bunga Laysa',
  description:
    'Rancang buket bunga virtual sesukamu secara gratis. Pilih kertas pembungkus, susun bunga di kanvas interaktif, tulis kartu ucapan, dan unduh gambar HD.',
  alternates: {
    canonical: '/designer',
  },
  openGraph: {
    title: 'Studio Buat Buket — Bucket Bunga Laysa',
    description:
      'Rancang buket bunga virtual sesukamu secara gratis. Pilih kertas pembungkus, susun bunga di kanvas interaktif, tulis kartu ucapan, dan unduh gambar HD.',
    url: 'https://bucketbunga-laysa.vercel.app/designer',
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
      'Rancang buket bunga virtual sesukamu secara gratis. Pilih kertas pembungkus, susun bunga di kanvas interaktif, tulis kartu ucapan, dan unduh gambar HD.',
    images: ['/images/home.png'],
  },
};

export default function DesignerPage() {
  return (
    <DesignProvider>
      <Suspense fallback={<div className="ds-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#888' }}>Memuat Studio Buket...</div>}>
        <DesignerClient />
      </Suspense>
    </DesignProvider>
  );
}
