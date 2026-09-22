import type { Metadata } from 'next';
import { Montserrat, Playfair_Display, Cormorant_Garamond, Great_Vibes } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BucketBunga — Rancang Buket Bunga Impian Anda',
  description:
    'Studio perangkai buket bunga kustom interaktif. Pilih 30+ bunga botani segar, sesuaikan pembungkus buket, tulis kartu ucapan, dan unduh desain beresolusi tinggi.',
  keywords: 'bucket bunga, buket bunga, buket custom, perangkai bunga, hadiah ulang tahun, wedding bouquet',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'BucketBunga — Rancang Buket Bunga Impian Anda',
    description: 'Rancang buket bunga impianmu dengan sentuhan artisan florist.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${montserrat.variable} ${playfair.variable} ${cormorant.variable} ${greatVibes.variable}`}>
      <body>{children}</body>
    </html>
  );
}
