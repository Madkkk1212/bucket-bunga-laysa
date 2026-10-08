import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panduan Merangkai Buket — Bucket Bunga Laysa',
  description:
    'Pelajari cara mudah membuat buket bunga virtual: memilih kertas pembungkus, menata bunga di kanvas, menulis kartu ucapan, dan mengunduh gambar HD gratis.',
  alternates: {
    canonical: '/tutorial',
  },
  openGraph: {
    title: 'Panduan Merangkai Buket — Bucket Bunga Laysa',
    description:
      'Pelajari cara mudah membuat buket bunga virtual: memilih kertas pembungkus, menata bunga di kanvas, menulis kartu ucapan, dan mengunduh gambar HD gratis.',
    url: 'https://giftbucket.web.id/tutorial',
    siteName: 'Bucket Bunga Laysa',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/images/home.png',
        width: 1200,
        height: 630,
        alt: 'Bucket Bunga Laysa — Panduan Merangkai Buket',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Panduan Merangkai Buket — Bucket Bunga Laysa',
    description:
      'Pelajari cara mudah membuat buket bunga virtual: memilih kertas pembungkus, menata bunga di kanvas, menulis kartu ucapan, dan mengunduh gambar HD gratis.',
    images: ['/images/home.png'],
  },
};

export default function TutorialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
