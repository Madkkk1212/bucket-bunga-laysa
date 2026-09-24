import type { Metadata, Viewport } from 'next';
import { Montserrat, Playfair_Display, Cormorant_Garamond, Great_Vibes } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-playfair',
  display: 'swap',
  preload: false,
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: false,
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
  display: 'swap',
  preload: false,
});

export const viewport: Viewport = {
  themeColor: '#be185d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://bucketbunga-laysa.vercel.app'),
  title: 'Bucket Bunga Laysa — Bikin Buket Bunga Online & Hadiah Virtual Gratis',
  description:
    'Studio perangkai buket bunga virtual interaktif gratis. Desain buket cantik untuk Ulang Tahun, Wisuda, Sidang Skripsi, Pacar LDR, Anniversary, dan Hari Ibu. Lengkap dengan kartu ucapan kustom dan unduh gambar HD.',
  keywords: [
    // Ulang Tahun & Perayaan (Birthday & Celebration)
    'kado ulang tahun virtual',
    'buket bunga ulang tahun online',
    'ucapan selamat ulang tahun bunga digital',
    'surprise ulang tahun virtual pacar sahabat',
    'kartu ucapan ultah buket bunga aesthetic',
    'hadiah ulang tahun sweet 17 digital',
    // Hubungan, Percintaan & LDR
    'buket bunga buat ayang',
    'kado virtual buat pacar ldr',
    'hadiah anniversary unik online',
    'virtual bouquet for girlfriend boyfriend',
    'bunga minta maaf romantis online',
    'hadiah buket bunga valentine digital',
    'love letter and virtual bouquet',
    // Wisuda & Akademik
    'hadiah wisuda virtual aesthetic',
    'kado sidang skripsi buat sahabat',
    'ucapan sempro buket bunga online',
    'generator buket wisuda bunga matahari',
    'graduation gift bouquet generator',
    // Momen Spesial & Keluarga
    'hadiah hari ibu buket bunga online',
    'ucapan terima kasih buket bunga digital',
    'get well soon virtual flower bouquet',
    // Fitur & Kebutuhan Instan
    'bikin buket bunga online gratis',
    'generator buket bunga online download gambar',
    'desain buket bunga sendiri tanpa aplikasi',
    'diy virtual flower bouquet maker',
    'ide kado dadakan aesthetic gratis',
    'custom flower bucket maker free png',
    'trend bikin bunga online tiktok viral',
    'interactive 2d flower bouquet canvas',
  ],
  authors: [{ name: 'Bucket Bunga Laysa Atelier', url: 'https://bucketbunga-laysa.vercel.app' }],
  creator: 'Bucket Bunga Laysa',
  publisher: 'Bucket Bunga Laysa',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'google707247af897599f6',
  },
  openGraph: {
    title: 'Bucket Bunga Laysa — Bikin Buket Bunga Online & Hadiah Virtual Gratis',
    description:
      'Rancang buket bunga virtual kustom untuk Ulang Tahun, Wisuda, Sahabat, dan Pacar LDR. Bebas susun bunga, tulis kartu ucapan, dan unduh gambar HD seketika!',
    url: 'https://bucketbunga-laysa.vercel.app',
    siteName: 'Bucket Bunga Laysa',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/images/home.png',
        width: 1200,
        height: 630,
        alt: 'Bucket Bunga Laysa — Studio Perangkai Buket Bunga Virtual',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bucket Bunga Laysa — Bikin Buket Bunga Online & Hadiah Virtual Gratis',
    description:
      'Studio perangkai buket bunga virtual untuk Ulang Tahun, Wisuda, dan Pacar LDR. Gratis, interaktif, dan langsung unduh hasilnya!',
    images: ['/images/home.png'],
  },
};

const jsonLdStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://bucketbunga-laysa.vercel.app/#website',
      url: 'https://bucketbunga-laysa.vercel.app',
      name: 'Bucket Bunga Laysa',
      description:
        'Studio Kreatif Pembuat Buket Bunga Virtual & Kartu Ucapan Kustom Online Gratis untuk Segala Momen Spesial',
      inLanguage: 'id-ID',
      publisher: {
        '@type': 'Organization',
        name: 'Bucket Bunga Laysa',
        url: 'https://bucketbunga-laysa.vercel.app',
        logo: {
          '@type': 'ImageObject',
          url: 'https://bucketbunga-laysa.vercel.app/images/home.png',
        },
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://bucketbunga-laysa.vercel.app/#app',
      name: 'Bucket Bunga Laysa — Virtual Bouquet Designer & Gift Maker',
      url: 'https://bucketbunga-laysa.vercel.app',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'All (Web, Android, iOS, Windows, macOS)',
      browserRequirements: 'Requires Modern Web Browser with HTML5 Canvas',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IDR',
        availability: 'https://schema.org/InStock',
      },
      about: [
        {
          '@type': 'Thing',
          name: 'Birthday',
          sameAs: 'https://www.wikidata.org/wiki/Q47223',
        },
        {
          '@type': 'Thing',
          name: 'Flower bouquet',
          sameAs: 'https://www.wikidata.org/wiki/Q250320',
        },
        {
          '@type': 'Thing',
          name: 'Greeting card',
          sameAs: 'https://www.wikidata.org/wiki/Q211756',
        },
        {
          '@type': 'Thing',
          name: 'Long-distance relationship',
          sameAs: 'https://www.wikidata.org/wiki/Q1817758',
        },
        {
          '@type': 'Thing',
          name: 'Graduation',
          sameAs: 'https://www.wikidata.org/wiki/Q748624',
        },
        {
          '@type': 'Thing',
          name: 'Floristry',
          sameAs: 'https://www.wikidata.org/wiki/Q1429815',
        },
      ],
      featureList: [
        'Studio Perangkai Buket Bunga Interaktif 2D Canvas Bebas Tata Letak',
        'Koleksi Lengkap Bunga Botani: Mawar, Bunga Matahari, Tulip, Lily, Hydrangea, Baby Breath',
        'Kustomisasi Warna Kertas Pembungkus (Wrapping Paper)',
        'Editor Kartu Ucapan Pribadi untuk Ulang Tahun, Wisuda, Sidang Skripsi, Anniversary, dan Minta Maaf',
        'Ekspor Desain Resolusi Tinggi (PNG/JPG) Gratis Siap Kirim WhatsApp & Instagram',
      ],
    },
    {
      '@type': 'HowTo',
      '@id': 'https://bucketbunga-laysa.vercel.app/#howto',
      name: 'Cara Membuat Buket Bunga Virtual Kustom untuk Hadiah Online',
      description:
        'Panduan 4 langkah mudah mendesain buket bunga digital kustom untuk kado ulang tahun, wisuda, atau pacar LDR secara gratis.',
      totalTime: 'PT3M',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Pilih Ukuran dan Kertas Pembungkus (Wrapper)',
          text: 'Pilih ukuran buket bunga yang diinginkan dan tentukan warna kertas pembungkus (wrapper) elegan sesuai nuansa perayaan.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Rangkai Kombinasi Bunga Botani',
          text: 'Pilih dan atur tata letak bunga segar seperti mawar, bunga matahari, tulip, atau baby breath langsung pada kanvas interaktif.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Tulis Pesan Kartu Ucapan Pribadi',
          text: 'Tambahkan pesan ucapan selamat ulang tahun, kelulusan wisuda, ucapan cinta anniversary, atau permohonan maaf dengan tipografi indah.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Unduh dan Kirimkan Hasil Desain',
          text: 'Unduh file gambar buket bunga berkualitas tinggi (PNG/JPG) tanpa watermark dan kirimkan langsung via WhatsApp atau media sosial.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://bucketbunga-laysa.vercel.app/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Apakah Bucket Bunga Laysa bisa digunakan untuk kado ulang tahun?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sangat bisa! Anda dapat merangkai buket bunga digital bernuansa ceria, memilih mawar atau tulip favorit, serta menulis pesan kartu ucapan selamat ulang tahun yang manis untuk sahabat, pacar, atau keluarga, lalu mengunduhnya secara gratis untuk dikirim tepat jam 00:00.',
          },
        },
        {
          '@type': 'Question',
          name: 'Momen apa saja yang cocok menggunakan buket bunga virtual ini?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Bucket Bunga Laysa dirancang untuk segala momen spesial: Ulang Tahun, Wisuda & Sidang Skripsi, Anniversary hubungan, Kado Pacar LDR, Hari Ibu, Ungkapan Permohonan Maaf (Peace Offering), Dukungan Cepat Sembuh (Get Well Soon), hingga kado estetik dadakan menit terakhir.',
          },
        },
        {
          '@type': 'Question',
          name: 'Apakah membuat dan mengunduh buket bunga di sini gratis?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ya, 100% gratis tanpa dipungut biaya apapun. Anda tidak perlu mengunduh aplikasi atau membuat akun pendaftaran.',
          },
        },
        {
          '@type': 'Question',
          name: 'Bagaimana cara mengirimkan hasil buket bunga yang sudah dibuat?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Setelah selesai merangkai dan menulis ucapan, klik tombol unduh untuk menyimpan file gambar berkualitas tinggi (PNG/JPG). File tersebut siap dikirimkan melalui WhatsApp, Telegram, direct message, maupun diunggah ke Instagram Story.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${montserrat.variable} ${playfair.variable} ${cormorant.variable} ${greatVibes.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdStructuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
