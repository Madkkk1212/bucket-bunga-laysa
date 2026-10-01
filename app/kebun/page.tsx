import type { Metadata } from 'next';
import { DesignProvider } from '@/context/DesignContext';
import IsometricGardenView from '@/components/garden/IsometricGardenView';

export const metadata: Metadata = {
  title: 'Kebun Bunga — Bucket Bunga Laysa',
  description:
    'Rawat kebun bunga virtual bersama pasangan. Tanam bunga cantik, siram tiap hari, dan jaga streak cinta kamu di Bucket Bunga Laysa.',
  alternates: {
    canonical: '/kebun',
  },
  openGraph: {
    title: 'Kebun Bunga — Bucket Bunga Laysa',
    description:
      'Rawat kebun bunga virtual bersama pasangan. Tanam bunga cantik, siram tiap hari, dan jaga streak cinta kamu di Bucket Bunga Laysa.',
    url: 'https://bucketbunga-laysa.vercel.app/kebun',
    siteName: 'Bucket Bunga Laysa',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/images/home.png',
        width: 1200,
        height: 630,
        alt: 'Bucket Bunga Laysa — Kebun Bunga',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kebun Bunga — Bucket Bunga Laysa',
    description:
      'Rawat kebun bunga virtual bersama pasangan. Tanam bunga cantik, siram tiap hari, dan jaga streak cinta kamu di Bucket Bunga Laysa.',
    images: ['/images/home.png'],
  },
};

export default function KebunPage() {
  return (
    <DesignProvider>
      <IsometricGardenView />
    </DesignProvider>
  );
}
