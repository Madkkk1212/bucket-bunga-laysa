import type { Metadata } from 'next';
import MiniGamesHub from '@/components/minigames/MiniGamesHub';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Mini Games — Bucket Bunga Laysa',
  description: 'Kumpulan mini game seru di Bucket Bunga Laysa! Mainkan puzzle jigsaw dan ular tangga bersama teman.',
  alternates: { canonical: '/minigames' },
  openGraph: {
    title: 'Mini Games — Bucket Bunga Laysa',
    description: 'Kumpulan mini game seru! Puzzle jigsaw foto dan ular tangga untuk dimainkan bersama.',
    url: 'https://giftbucket.web.id/minigames',
    siteName: 'Bucket Bunga Laysa',
    locale: 'id_ID',
    type: 'website',
    images: [{ url: '/images/home.png', width: 1200, height: 630 }],
  },
};

export default function MiniGamesPage() {
  return (
    <>
      <Navbar />
      <main id="minigames-main">
        <MiniGamesHub />
      </main>
    </>
  );
}
