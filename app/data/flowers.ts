import { FlowerDef } from '../types/design';

export const FLOWERS: FlowerDef[] = [
  // ─── Bunga Utama (Main Blooms) ─────────────────────────────────────────────
  { id: 'rose_red', name: 'Mawar Merah', imageUrl: '/images/flowers/rose_red.png', category: 'main', emoji: '🌹', color: '#DC143C', description: 'Mawar merah mekar velvety premium' },
  { id: 'rose_pink', name: 'Mawar Pink', imageUrl: '/images/flowers/rose_pink.png', category: 'main', emoji: '🌸', color: '#FF69B4', description: 'Mawar merah muda lembut' },
  { id: 'rose_white', name: 'Mawar Putih', imageUrl: '/images/flowers/rose_white.png', category: 'main', emoji: '🤍', color: '#F5F5F5', description: 'Mawar putih elegan murni' },
  { id: 'rose_peach', name: 'Mawar Peach', imageUrl: '/images/flowers/rose_peach.png', category: 'main', emoji: '🍑', color: '#FFCBA4', description: 'Mawar champagne peach anggun' },
  { id: 'rose_yellow', name: 'Mawar Kuning', imageUrl: '/images/flowers/rose_yellow.png', category: 'main', emoji: '💛', color: '#FFD700', description: 'Mawar kuning ceria bersinar' },
  { id: 'chrysanthemum_pink', name: 'Krisan Pink Pompon', imageUrl: '/images/flowers/chrysanthemum_pink.png', category: 'main', emoji: '🌸', color: '#FF69B4', description: 'Krisan pompon mekar rimbun' },
  { id: 'chrysanthemum_white', name: 'Krisan Putih', imageUrl: '/images/flowers/chrysanthemum_white.png', category: 'main', emoji: '🌼', color: '#FFFFFF', description: 'Krisan pompon putih bersih' },
  { id: 'sunflower', name: 'Bunga Matahari', imageUrl: '/images/flowers/sunflower.png', category: 'main', emoji: '🌻', color: '#FFD700', description: 'Bunga matahari cerah mempesona' },
  { id: 'hydrangea_blue', name: 'Hydrangea Biru', imageUrl: '/images/flowers/hydrangea_blue.png', category: 'main', emoji: '💙', color: '#4169E1', description: 'Mophead hydrangea biru royal' },
  { id: 'lily_white', name: 'Lili Putih', imageUrl: '/images/flowers/lily_white.png', category: 'main', emoji: '🌸', color: '#FFFFFF', description: 'Bunga lili putih harum elegan' },
  { id: 'tulip_red', name: 'Tulip Merah', imageUrl: '/images/flowers/tulip_red.png', category: 'main', emoji: '🌷', color: '#DC143C', description: 'Tulip Belanda merah segar' },
  { id: 'tulip_purple', name: 'Tulip Ungu', imageUrl: '/images/flowers/tulip_purple.png', category: 'main', emoji: '🌷', color: '#8B008B', description: 'Tulip ungu royal mewah' },
  { id: 'tulip_pink', name: 'Tulip Pink', imageUrl: '/images/flowers/tulip_pink.png', category: 'main', emoji: '🌷', color: '#FF69B4', description: 'Tulip pastel manis' },
  { id: 'gerbera_red', name: 'Gerbera Merah', imageUrl: '/images/flowers/gerbera_red.png', category: 'main', emoji: '🌺', color: '#DC143C', description: 'Gerbera merah mekar sempurna' },
  { id: 'dahlia_orange', name: 'Dahlia Orange', imageUrl: '/images/flowers/dahlia_orange.png', category: 'main', emoji: '🌺', color: '#FF8C00', description: 'Dahlia sunset hangat' },

  // ─── Bunga Filler (Accent & Fillers) ───────────────────────────────────────
  { id: 'babysbreath_white', name: "Baby's Breath", imageUrl: '/images/flowers/babysbreath_white.png', category: 'filler', emoji: '🤍', color: '#FFFFFF', description: 'Rimbun kabut putih gypsophila klasik' },
  { id: 'aster_purple', name: 'Aster Ungu Peacock', imageUrl: '/images/flowers/aster_purple.png', category: 'filler', emoji: '💜', color: '#9370DB', description: 'Bunga aster peacock ungu khas Korean bouquet' },

  // ─── Dedaunan / Greenery ───────────────────────────────────────────────────
  { id: 'eucalyptus', name: 'Eucalyptus Silver', imageUrl: '/images/flowers/eucalyptus.png', category: 'greenery', emoji: '🌿', color: '#5F8575', description: 'Daun eucalyptus bundar perak elegan' },
  { id: 'ruscus', name: 'Daun Ruscus', imageUrl: '/images/flowers/ruscus.png', category: 'greenery', emoji: '🍃', color: '#2E8B57', description: 'Daun hijau ruscus segar pembingkai buket' },
];

export const getFlowerById = (id: string): FlowerDef | undefined =>
  FLOWERS.find((f) => f.id === id);

export const FLOWER_CATEGORY_LABELS: Record<string, string> = {
  all: 'Semua',
  main: 'Bunga Utama',
  filler: 'Bunga Filler',
  greenery: 'Dedaunan',
};
