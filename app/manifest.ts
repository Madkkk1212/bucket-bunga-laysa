import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bucket Bunga Laysa — Studio Buket Virtual',
    short_name: 'Bucket Bunga',
    description: 'Studio pembuat buket bunga virtual gratis dan minigames interaktif.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff0f5',
    theme_color: '#be185d',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '64x64 32x32 24x24 16x16',
        type: 'image/x-icon',
      },
      {
        src: '/images/home.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
