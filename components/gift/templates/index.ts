// components/gift/templates/index.ts
// Registry semua template kado.
// Untuk menambah template baru: tambah entri di GIFT_TEMPLATES saja.

import type { TemplateConfig, GiftTemplateId } from '@/types/giftConfig';

export const GIFT_TEMPLATES: Record<GiftTemplateId, TemplateConfig> = {
  // ─── KLASIK ─────────────────────────────────────────────────────────────
  // Tampilan persis seperti yang ada sekarang. Default untuk kado lama.
  'klasik': {
    id: 'klasik',
    name: 'Klasik',
    nameEn: 'Classic',
    description: 'Amplop elegan dengan segel lilin, tampilan timeless.',
    isFree: true,
    colors: {
      bg: 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #fce7f3 100%)',
      surface: '#ffffff',
      primary: '#be185d',
      accent: '#ec4899',
      text: '#1e1015',
      muted: '#9d8a92',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Montserrat',
      headingWeight: '400;600;700',
      bodyWeight: '400;500',
    },
    defaults: {
      giftObjectId: 'envelope',
      effectId: 'petals',
      titleId: 'Buket Bunga Untukmu',
      titleEn: 'A Bouquet Just For You',
    },
    photoStyle: { style: 'polaroid', maxRotation: 3 },
    reveal: { order: ['bouquet', 'card', 'photos'], animation: 'fade-rise' },
    rootClass: 'gift-template-klasik',
    bgStyle: 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #fce7f3 100%)',
  },

  // ─── TAMAN MEKAR ────────────────────────────────────────────────────────
  'taman-mekar': {
    id: 'taman-mekar',
    name: 'Taman Mekar',
    nameEn: 'Blooming Garden',
    description: 'Bunga mekar memenuhi layar, nuansa pink & krem. Cocok ulang tahun & wisuda.',
    isFree: true,
    colors: {
      bg: 'radial-gradient(ellipse at 50% 20%, #ffffff 0%, #fce7f3 55%, #fbcfe8 100%)',
      surface: '#fff8fb',
      primary: '#be185d',
      accent: '#ec4899',
      text: '#1e1015',
      muted: '#9d6a84',
      extra: { gold: '#d97706', petal: '#fda4af' },
    },
    fonts: {
      heading: 'Cormorant+Garamond',
      body: 'Lato',
      headingWeight: '400;500;600;700',
      bodyWeight: '300;400;700',
    },
    defaults: {
      giftObjectId: 'envelope',
      effectId: 'flowers',
      titleId: 'Untukmu yang selalu mekar di hatiku...',
      titleEn: 'For you who always blooms in my heart...',
    },
    photoStyle: { style: 'polaroid', maxRotation: 3 },
    reveal: { order: ['bouquet', 'card', 'photos'], animation: 'fade-rise' },
    rootClass: 'gift-template-taman-mekar',
    bgStyle: 'radial-gradient(ellipse at 50% 20%, #ffffff 0%, #fce7f3 55%, #fbcfe8 100%)',
  },

  // ─── KUPU-KUPU HARAPAN ──────────────────────────────────────────────────
  'kupu-kupu-harapan': {
    id: 'kupu-kupu-harapan',
    name: 'Kupu-kupu Harapan',
    nameEn: 'Butterfly Hope',
    description: 'Kupu-kupu beterbangan, nuansa pastel dengan sentuhan emas. Cocok LDR & ucapan hangat.',
    isFree: false,
    colors: {
      bg: 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 50%, #fdf2f8 100%)',
      surface: '#fffbfe',
      primary: '#be185d',
      accent: '#a855f7',
      text: '#1c0a1a',
      muted: '#9370a0',
      extra: { gold: '#b45309', lavender: '#a855f7' },
    },
    fonts: {
      heading: 'Playfair+Display',
      body: 'Nunito',
      headingWeight: '400;600;700',
      bodyWeight: '300;400;600',
    },
    defaults: {
      giftObjectId: 'music-box',
      effectId: 'butterflies',
      titleId: 'Harapanku terbang bersamamu...',
      titleEn: 'My hopes fly with you...',
    },
    photoStyle: { style: 'carousel' },
    reveal: { order: ['bouquet', 'card', 'photos'], animation: 'slide-up' },
    rootClass: 'gift-template-kupu-kupu',
    bgStyle: 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 50%, #fdf2f8 100%)',
  },

  // ─── PESTA BINTANG ──────────────────────────────────────────────────────
  'pesta-bintang': {
    id: 'pesta-bintang',
    name: 'Pesta Bintang',
    nameEn: 'Star Party',
    description: 'Konfeti & bintang, nuansa ceria. Cocok ulang tahun & perayaan.',
    isFree: false,
    colors: {
      bg: '#fffbeb',
      surface: '#ffffff',
      primary: '#d97706',
      accent: '#ec4899',
      text: '#1c1400',
      muted: '#92825a',
      extra: { star: '#fcd34d', confetti1: '#ec4899', confetti2: '#d97706' },
    },
    fonts: {
      heading: 'Fredoka+One',
      body: 'Nunito',
      headingWeight: '400',
      bodyWeight: '400;600;700',
    },
    defaults: {
      giftObjectId: 'gift-box',
      effectId: 'confetti',
      titleId: 'Selamat merayakan harimu! 🎉',
      titleEn: "Happy celebrating your special day! 🎉",
    },
    photoStyle: { style: 'grid' },
    reveal: { order: ['bouquet', 'card', 'photos'], animation: 'pop-in' },
    rootClass: 'gift-template-pesta-bintang',
    bgStyle: '#fffbeb',
  },

  // ─── PERNIKAHAN ─────────────────────────────────────────────────────────
  'pernikahan': {
    id: 'pernikahan',
    name: 'Pernikahan',
    nameEn: 'Wedding',
    description: 'Elegan putih-emas, mawar & merpati. Cocok pernikahan, anniversary & lamaran.',
    isFree: false,
    colors: {
      bg: 'linear-gradient(160deg, #fffef8 0%, #fef9ed 40%, #fdf6e3 100%)',
      surface: '#fffef8',
      primary: '#92702c',
      accent: '#c9a84c',
      text: '#1a1410',
      muted: '#8a7a64',
      extra: { gold: '#c9a84c', ivory: '#f9f4e8', rose: '#f9a8d4' },
    },
    fonts: {
      heading: 'Cormorant+Garamond',
      body: 'Lato',
      headingWeight: '300;400;500;600;700',
      bodyWeight: '300;400;700',
    },
    defaults: {
      giftObjectId: 'envelope',
      effectId: 'roses',
      titleId: 'Selamat menempuh hidup baru… 🌹',
      titleEn: 'Wishing you a beautiful new chapter… 🌹',
    },
    photoStyle: { style: 'polaroid', maxRotation: 2 },
    reveal: { order: ['bouquet', 'card', 'photos'], animation: 'fade-rise' },
    rootClass: 'gift-template-pernikahan',
    bgStyle: 'linear-gradient(160deg, #fffef8 0%, #fef9ed 40%, #fdf6e3 100%)',
  },

  'cerita-kita': {
    id: 'cerita-kita',
    name: 'Hari Spesial',
    nameEn: "Girlfriend's Day",
    description: 'Cerita dua bagian dengan foto utama, buket, dan galeri kenangan.',
    isFree: false,
    requiresPhoto: true,
    colors: {
      bg: 'linear-gradient(145deg, #fff7ed 0%, #fffaf5 48%, #fce7d5 100%)',
      surface: '#fffdf9', primary: '#9a3412', accent: '#e8794a', text: '#2b211d', muted: '#846d61',
      extra: { sand: '#f2c078', cream: '#fff7ed' },
    },
    fonts: { heading: 'Cormorant+Garamond', body: 'Lato', headingWeight: '400;500;600;700', bodyWeight: '300;400;700' },
    defaults: { giftObjectId: 'book', effectId: 'petals', titleId: 'You too divine to be Mine', titleEn: 'You too divine to be Mine' },
    photoStyle: { style: 'polaroid', maxRotation: 1.5 },
    reveal: { order: ['photos', 'bouquet', 'card'], animation: 'fade-rise' },
    rootClass: 'gift-template-cerita-kita',
    bgStyle: 'linear-gradient(145deg, #fff7ed 0%, #fffaf5 48%, #fce7d5 100%)',
  },

  'film-kenangan': {
    id: 'film-kenangan',
    name: 'Surat Cinta',
    nameEn: 'A Love Letter',
    description: 'Amplop bersegel yang terbuka menjadi surat, foto, dan buket.',
    isFree: false,
    requiresPhoto: true,
    colors: {
      bg: 'linear-gradient(145deg, #0f172a 0%, #172554 50%, #312e81 100%)',
      surface: '#111827', primary: '#f8fafc', accent: '#c4b5fd', text: '#f8fafc', muted: '#cbd5e1',
      extra: { night: '#0f172a', lilac: '#a78bfa' },
    },
    fonts: { heading: 'Playfair+Display', body: 'Lato', headingWeight: '400;500;600;700', bodyWeight: '300;400;700' },
    defaults: { giftObjectId: 'music-box', effectId: 'stars', titleId: 'My Love, {recipientName}', titleEn: 'My Love, {recipientName}' },
    photoStyle: { style: 'carousel' },
    reveal: { order: ['photos', 'card', 'bouquet'], animation: 'slide-up' },
    rootClass: 'gift-template-film-kenangan',
    bgStyle: 'linear-gradient(145deg, #0f172a 0%, #172554 50%, #312e81 100%)',
  },

  'album-surat': {
    id: 'album-surat',
    name: 'Buku Kenangan',
    nameEn: 'My Only Love',
    description: 'Sampul buku beranimasi dengan halaman foto, buket, dan surat personal.',
    isFree: false,
    requiresPhoto: true,
    colors: {
      bg: 'linear-gradient(155deg, #f5f5f4 0%, #fffdf8 55%, #f5eee2 100%)',
      surface: '#ffffff', primary: '#36554a', accent: '#c18a59', text: '#18231f', muted: '#68736d',
      extra: { olive: '#71816b', paper: '#f5eee2' },
    },
    fonts: { heading: 'Cormorant+Garamond', body: 'Lato', headingWeight: '400;500;600;700', bodyWeight: '300;400;700' },
    defaults: { giftObjectId: 'book', effectId: 'flowers', titleId: 'My Only Love', titleEn: 'My Only Love' },
    photoStyle: { style: 'grid' },
    reveal: { order: ['photos', 'bouquet', 'card'], animation: 'fade-rise' },
    rootClass: 'gift-template-album-surat',
    bgStyle: 'linear-gradient(155deg, #f5f5f4 0%, #fffdf8 55%, #f5eee2 100%)',
  },
};


/** Ambil config template. Fallback ke 'klasik' jika ID tidak dikenal. */
export function getTemplateConfig(id?: string | null): TemplateConfig {
  if (id && id in GIFT_TEMPLATES) {
    return GIFT_TEMPLATES[id as GiftTemplateId];
  }
  return GIFT_TEMPLATES['klasik'];
}

/** Daftar template yang boleh diakses tier gratis */
export const FREE_TEMPLATE_IDS: GiftTemplateId[] = Object.values(GIFT_TEMPLATES)
  .filter((t) => t.isFree)
  .map((t) => t.id);
