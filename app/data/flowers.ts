import { FlowerDef, FlowerFamily } from '../types/design';

export const FLOWERS: FlowerDef[] = [
  // ─── Bunga Mawar (Roses) ───────────────────────────────────────────────────
  { id: 'rose_red', name: 'Mawar Merah', imageUrl: '/images/flowers/rose_red.png', category: 'main', emoji: '🌹', color: '#DC143C', colorName: 'Merah Mekar', description: 'Mawar merah mekar velvety premium' },
  { id: 'rose_pink', name: 'Mawar Pink', imageUrl: '/images/flowers/rose_pink.png', category: 'main', emoji: '🌸', color: '#FF69B4', colorName: 'Pink Pastel', description: 'Mawar merah muda lembut' },
  { id: 'rose_white', name: 'Mawar Putih', imageUrl: '/images/flowers/rose_white.png', category: 'main', emoji: '🤍', color: '#F5F5F5', colorName: 'Putih Elegan', description: 'Mawar putih elegan murni' },
  { id: 'rose_peach', name: 'Mawar Peach', imageUrl: '/images/flowers/rose_peach.png', category: 'main', emoji: '🍑', color: '#FFCBA4', colorName: 'Champagne Peach', description: 'Mawar champagne peach anggun' },
  { id: 'rose_yellow', name: 'Mawar Kuning', imageUrl: '/images/flowers/rose_yellow.png', category: 'main', emoji: '💛', color: '#FFD700', colorName: 'Kuning Cerah', description: 'Mawar kuning ceria bersinar' },
  { id: 'rose_cream', name: 'Mawar Cream', imageUrl: '/images/flowers/rose_cream.png', category: 'main', emoji: '🥛', color: '#FFF8DC', colorName: 'Soft Cream', description: 'Mawar krem klasik lembut' },
  { id: 'rose_orange', name: 'Mawar Orange', imageUrl: '/images/flowers/rose_orange.png', category: 'main', emoji: '🍊', color: '#FF7F50', colorName: 'Sunset Orange', description: 'Mawar oranye sunset hangat' },

  // ─── Bunga Tulip ───────────────────────────────────────────────────────────
  { id: 'tulip_red', name: 'Tulip Merah', imageUrl: '/images/flowers/tulip_red.png', category: 'main', emoji: '🌷', color: '#DC143C', colorName: 'Merah Segar', description: 'Tulip Belanda merah segar' },
  { id: 'tulip_purple', name: 'Tulip Ungu', imageUrl: '/images/flowers/tulip_purple.png', category: 'main', emoji: '🌷', color: '#8B008B', colorName: 'Ungu Royal', description: 'Tulip ungu royal mewah' },
  { id: 'tulip_pink', name: 'Tulip Pink', imageUrl: '/images/flowers/tulip_pink.png', category: 'main', emoji: '🌷', color: '#FF69B4', colorName: 'Pink Pastel', description: 'Tulip pastel manis' },
  { id: 'tulip_yellow', name: 'Tulip Kuning', imageUrl: '/images/flowers/tulip_yellow.png', category: 'main', emoji: '🌷', color: '#FFD700', colorName: 'Kuning Ceria', description: 'Tulip kuning ceria cerah' },

  // ─── Krisan Pompon ─────────────────────────────────────────────────────────
  { id: 'chrysanthemum_pink', name: 'Krisan Pink Pompon', imageUrl: '/images/flowers/chrysanthemum_pink.png', category: 'main', emoji: '🌸', color: '#FF69B4', colorName: 'Pink Pompon', description: 'Krisan pompon mekar rimbun' },
  { id: 'chrysanthemum_white', name: 'Krisan Putih', imageUrl: '/images/flowers/chrysanthemum_white.png', category: 'main', emoji: '🌼', color: '#FFFFFF', colorName: 'Putih Murni', description: 'Krisan pompon putih bersih' },
  { id: 'chrysanthemum_yellow', name: 'Krisan Kuning', imageUrl: '/images/flowers/chrysanthemum_yellow.png', category: 'main', emoji: '🌼', color: '#FFD700', colorName: 'Kuning Cerah', description: 'Krisan pompon kuning segar' },

  // ─── Hydrangea ─────────────────────────────────────────────────────────────
  { id: 'hydrangea_blue', name: 'Hydrangea Biru', imageUrl: '/images/flowers/hydrangea_blue.png', category: 'main', emoji: '💙', color: '#4169E1', colorName: 'Biru Royal', description: 'Mophead hydrangea biru royal' },
  { id: 'hydrangea_pink', name: 'Hydrangea Pink', imageUrl: '/images/flowers/hydrangea_pink.png', category: 'main', emoji: '🌸', color: '#FF69B4', colorName: 'Pink Pastel', description: 'Mophead hydrangea pink pastel' },
  { id: 'hydrangea_purple', name: 'Hydrangea Ungu', imageUrl: '/images/flowers/hydrangea_purple.png', category: 'main', emoji: '💜', color: '#9370DB', colorName: 'Ungu Lavender', description: 'Mophead hydrangea ungu mewah' },

  // ─── Bunga Lili ────────────────────────────────────────────────────────────
  { id: 'lily_white', name: 'Lili Putih', imageUrl: '/images/flowers/lily_white.png', category: 'main', emoji: '🌸', color: '#FFFFFF', colorName: 'Putih Murni', description: 'Bunga lili putih harum elegan' },
  { id: 'lily_pink', name: 'Lili Pink', imageUrl: '/images/flowers/lily_pink.png', category: 'main', emoji: '🌸', color: '#FF69B4', colorName: 'Pink Anggun', description: 'Bunga lili pink lembut mekar' },
  { id: 'lily_orange', name: 'Lili Orange', imageUrl: '/images/flowers/lily_orange.png', category: 'main', emoji: '🌺', color: '#FF8C00', colorName: 'Orange Ceria', description: 'Bunga lili oranye hangat' },

  // ─── Bunga Utama Tunggal ───────────────────────────────────────────────────
  { id: 'sunflower', name: 'Bunga Matahari', imageUrl: '/images/flowers/sunflower.png', category: 'main', emoji: '🌻', color: '#FFD700', colorName: 'Kuning Emas', description: 'Bunga matahari cerah mempesona' },
  { id: 'gerbera_red', name: 'Gerbera Merah', imageUrl: '/images/flowers/gerbera_red.png', category: 'main', emoji: '🌺', color: '#DC143C', colorName: 'Merah Merona', description: 'Gerbera merah mekar sempurna' },
  { id: 'dahlia_orange', name: 'Dahlia Orange', imageUrl: '/images/flowers/dahlia_orange.png', category: 'main', emoji: '🌺', color: '#FF8C00', colorName: 'Sunset Warm', description: 'Dahlia sunset hangat memikat' },
  { id: 'calla_white', name: 'Calla Lily', imageUrl: '/images/flowers/calla_white.png', category: 'main', emoji: '🤍', color: '#FFFFFF', colorName: 'Putih Modern', description: 'Calla lily putih anggun kontemporer' },
  { id: 'orchid_pink', name: 'Anggrek Pink', imageUrl: '/images/flowers/orchid_pink.png', category: 'main', emoji: '🌸', color: '#DA70D6', colorName: 'Pink Eksotis', description: 'Anggrek pink eksotis berkelas' },

  // ─── Bunga Filler ──────────────────────────────────────────────────────────
  { id: 'babysbreath_white', name: "Baby's Breath", imageUrl: '/images/flowers/babysbreath_white.png', category: 'filler', emoji: '🤍', color: '#FFFFFF', colorName: 'Putih Bersih', description: 'Rimbun kabut putih gypsophila klasik' },
  { id: 'aster_purple', name: 'Aster Ungu Peacock', imageUrl: '/images/flowers/aster_purple.png', category: 'filler', emoji: '💜', color: '#9370DB', colorName: 'Ungu Peacock', description: 'Bunga aster peacock ungu khas Korean bouquet' },
  { id: 'lavender', name: 'Lavender', imageUrl: '/images/flowers/lavender.png', category: 'filler', emoji: '💜', color: '#9370DB', colorName: 'Ungu Alami', description: 'Tangkai lavender harum menenangkan' },

  // ─── Dedaunan / Greenery ───────────────────────────────────────────────────
  { id: 'eucalyptus', name: 'Eucalyptus Silver', imageUrl: '/images/flowers/eucalyptus.png', category: 'greenery', emoji: '🌿', color: '#5F8575', colorName: 'Perak Hijau', description: 'Daun eucalyptus bundar perak elegan' },
  { id: 'ruscus', name: 'Daun Ruscus', imageUrl: '/images/flowers/ruscus.png', category: 'greenery', emoji: '🍃', color: '#2E8B57', colorName: 'Hijau Segar', description: 'Daun hijau ruscus segar pembingkai buket' },
];

export const FLOWER_FAMILIES: FlowerFamily[] = [
  // ─── Bunga Utama (Main) ────────────────────────────────────────────────────
  {
    id: 'fam_rose',
    name: 'Mawar',
    category: 'main',
    emoji: '🌹',
    description: 'Koleksi mawar mekar velvety khas Korean Florist',
    defaultFlowerId: 'rose_red',
    variants: FLOWERS.filter((f) => f.id.startsWith('rose_')),
  },
  {
    id: 'fam_tulip',
    name: 'Tulip',
    category: 'main',
    emoji: '🌷',
    description: 'Tulip segar elegan dengan siluet mempesona',
    defaultFlowerId: 'tulip_red',
    variants: FLOWERS.filter((f) => f.id.startsWith('tulip_')),
  },
  {
    id: 'fam_chrysanthemum',
    name: 'Krisan Pompon',
    category: 'main',
    emoji: '🌼',
    description: 'Bunga krisan bulat mekar padat dan menggemaskan',
    defaultFlowerId: 'chrysanthemum_pink',
    variants: FLOWERS.filter((f) => f.id.startsWith('chrysanthemum_')),
  },
  {
    id: 'fam_hydrangea',
    name: 'Hydrangea',
    category: 'main',
    emoji: '💙',
    description: 'Bunga rimbun bervolume mewah penyeimbang rangkaian',
    defaultFlowerId: 'hydrangea_blue',
    variants: FLOWERS.filter((f) => f.id.startsWith('hydrangea_')),
  },
  {
    id: 'fam_lily',
    name: 'Bunga Lili',
    category: 'main',
    emoji: '🌸',
    description: 'Bunga lili mekar harum memancarkan kemurnian',
    defaultFlowerId: 'lily_white',
    variants: FLOWERS.filter((f) => f.id.startsWith('lily_')),
  },
  {
    id: 'fam_sunflower',
    name: 'Bunga Matahari',
    category: 'main',
    emoji: '🌻',
    description: 'Bunga matahari kuning emas penuh keceriaan',
    defaultFlowerId: 'sunflower',
    variants: FLOWERS.filter((f) => f.id === 'sunflower'),
  },
  {
    id: 'fam_gerbera',
    name: 'Gerbera',
    category: 'main',
    emoji: '🌺',
    description: 'Gerbera merah dengan kelopak simetris sempurna',
    defaultFlowerId: 'gerbera_red',
    variants: FLOWERS.filter((f) => f.id === 'gerbera_red'),
  },
  {
    id: 'fam_dahlia',
    name: 'Dahlia',
    category: 'main',
    emoji: '🌺',
    description: 'Kelopak berlapis dramatis dalam nuansa sunset',
    defaultFlowerId: 'dahlia_orange',
    variants: FLOWERS.filter((f) => f.id === 'dahlia_orange'),
  },
  {
    id: 'fam_calla',
    name: 'Calla Lily',
    category: 'main',
    emoji: '🤍',
    description: 'Siluet ramping modern dan eksklusif',
    defaultFlowerId: 'calla_white',
    variants: FLOWERS.filter((f) => f.id === 'calla_white'),
  },
  {
    id: 'fam_orchid',
    name: 'Anggrek',
    category: 'main',
    emoji: '🌸',
    description: 'Sentuhan tropis eksotis yang mewah',
    defaultFlowerId: 'orchid_pink',
    variants: FLOWERS.filter((f) => f.id === 'orchid_pink'),
  },

  // ─── Bunga Filler ──────────────────────────────────────────────────────────
  {
    id: 'fam_babysbreath',
    name: "Baby's Breath",
    category: 'filler',
    emoji: '🤍',
    description: 'Kabut putih mekar gypsophila pengisi rongga buket',
    defaultFlowerId: 'babysbreath_white',
    variants: FLOWERS.filter((f) => f.id === 'babysbreath_white'),
  },
  {
    id: 'fam_aster',
    name: 'Aster Peacock',
    category: 'filler',
    emoji: '💜',
    description: 'Bunga ungu kecil aksen favorit buket Korea',
    defaultFlowerId: 'aster_purple',
    variants: FLOWERS.filter((f) => f.id === 'aster_purple'),
  },
  {
    id: 'fam_lavender',
    name: 'Lavender',
    category: 'filler',
    emoji: '💜',
    description: 'Tangkai lavender harum aksen rustic',
    defaultFlowerId: 'lavender',
    variants: FLOWERS.filter((f) => f.id === 'lavender'),
  },

  // ─── Dedaunan / Greenery ───────────────────────────────────────────────────
  {
    id: 'fam_eucalyptus',
    name: 'Eucalyptus',
    category: 'greenery',
    emoji: '🌿',
    description: 'Daun bundar keperakan pembingkai buket bernuansa natural',
    defaultFlowerId: 'eucalyptus',
    variants: FLOWERS.filter((f) => f.id === 'eucalyptus'),
  },
  {
    id: 'fam_ruscus',
    name: 'Daun Ruscus',
    category: 'greenery',
    emoji: '🍃',
    description: 'Daun hijau tua runcing penambah struktur buket',
    defaultFlowerId: 'ruscus',
    variants: FLOWERS.filter((f) => f.id === 'ruscus'),
  },
];

export const getFlowerById = (id: string): FlowerDef | undefined =>
  FLOWERS.find((f) => f.id === id);

export const getFlowerFamilyById = (id: string): FlowerFamily | undefined =>
  FLOWER_FAMILIES.find((f) => f.id === id);

export const FLOWER_CATEGORY_LABELS: Record<string, string> = {
  all: 'Semua',
  main: 'Bunga Utama',
  filler: 'Bunga Filler',
  greenery: 'Dedaunan',
};
