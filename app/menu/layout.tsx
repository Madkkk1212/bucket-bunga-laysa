import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pilih Menu — Bucket Bunga Laysa',
  description:
    'Mau ngapain hari ini? Buat buket bunga virtual gratis, baca panduan merangkai buket yang cantik, atau rawat Kebun Bunga bersama pasangan.',
  alternates: {
    canonical: '/menu',
  },
  openGraph: {
    title: 'Pilih Menu — Bucket Bunga Laysa',
    description:
      'Mau ngapain hari ini? Buat buket bunga virtual gratis, baca panduan merangkai buket yang cantik, atau rawat Kebun Bunga bersama pasangan.',
    url: 'https://bucketbunga-laysa.vercel.app/menu',
    siteName: 'Bucket Bunga Laysa',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/images/home.png',
        width: 1200,
        height: 630,
        alt: 'Bucket Bunga Laysa — Pilih Menu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pilih Menu — Bucket Bunga Laysa',
    description:
      'Mau ngapain hari ini? Buat buket bunga virtual gratis, baca panduan merangkai buket yang cantik, atau rawat Kebun Bunga bersama pasangan.',
    images: ['/images/home.png'],
  },
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
