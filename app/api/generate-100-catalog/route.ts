import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

const ROOT_DIR = process.cwd();
const KATALOG_DIR = path.join(ROOT_DIR, 'public', 'images', 'katalog');
const CATALOG_TS = path.join(ROOT_DIR, 'app', 'data', 'catalog100.ts');

export interface CatalogItem {
  id: string;
  name: string;
  category: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  categoryLabel: string;
  tag: string;
  colorName: string;
  colorHex: string;
  priceFormatted: string;
  description: string;
  tags: string[];
  imageUrl: string;
  silhouette: string;
  decorType: string;
}

// ─── 101 DESAIN LENGKAP DENGAN PROPORSI, SILUET & MOTIF INDIVIDUAL ─────────────
const CATALOG_ITEMS: CatalogItem[] = [
  // A. BUCKET BUNGA REALISTIS (22 Desain)
  {
    id: 'real_mawar_merah',
    name: 'Romantic Velvet Red Rose',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Best Seller Mawar',
    colorName: 'Scarlet Red & Noir',
    colorHex: '#DC2626',
    priceFormatted: 'Rp 285.000',
    description: 'Buket mawar merah scarlet beludru segar dalam balutan kertas hitam matte berlapis dengan pita satin merah merekah.',
    tags: ['mawar', 'merah', 'romantis', 'valentine', 'anniversary'],
    imageUrl: '/images/katalog/real_mawar_merah.png',
    silhouette: 'classic-wrap',
    decorType: 'rose-red',
  },
  {
    id: 'real_mawar_pink',
    name: 'Sweet Blush Pink Rose',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Pastel Aesthetic',
    colorName: 'Soft Pink Blush',
    colorHex: '#EC4899',
    priceFormatted: 'Rp 275.000',
    description: 'Rangkaian mawar pink pastel lembut dengan balutan kertas nude cream dan pita organza sutra transparan.',
    tags: ['mawar', 'pink', 'pastel', 'ulang tahun', 'manis'],
    imageUrl: '/images/katalog/real_mawar_pink.png',
    silhouette: 'flared-wrap',
    decorType: 'rose-pink',
  },
  {
    id: 'real_mawar_putih',
    name: 'Pure Casablanca White Rose',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Elegance Monokrom',
    colorName: 'Snow White & Silver',
    colorHex: '#F8FAFC',
    priceFormatted: 'Rp 295.000',
    description: 'Mawar putih salju murni dengan sentuhan baby breath halus dalam kertas marmer putih mutiara berlis perak.',
    tags: ['mawar', 'putih', 'elegan', 'pernikahan', 'sidang'],
    imageUrl: '/images/katalog/real_mawar_putih.png',
    silhouette: 'flared-wrap',
    decorType: 'rose-white',
  },
  {
    id: 'real_mawar_peach',
    name: 'Warm Sunset Peach Rose',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Hangat & Menawan',
    colorName: 'Apricot Peach',
    colorHex: '#FB923C',
    priceFormatted: 'Rp 280.000',
    description: 'Mawar peach jingga hangat berpadu daun eucalyptus perak dalam wrap cokelat nude keemasan.',
    tags: ['mawar', 'peach', 'senja', 'hangat', 'wisuda'],
    imageUrl: '/images/katalog/real_mawar_peach.png',
    silhouette: 'classic-wrap',
    decorType: 'rose-peach',
  },
  {
    id: 'real_tulip_spring',
    name: 'Dutch Spring Meadow Tulip',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Eropa Klasik',
    colorName: 'Dutch Magenta & Sun',
    colorHex: '#E11D48',
    priceFormatted: 'Rp 310.000',
    description: 'Bunga tulip segar Belanda dengan kelopak anggun menjulang dalam wrap kraft kertas berlipit rapi.',
    tags: ['tulip', 'musim semi', 'belanda', 'segar'],
    imageUrl: '/images/katalog/real_tulip_spring.png',
    silhouette: 'tulip-funnel',
    decorType: 'tulip-spring',
  },
  {
    id: 'real_lily_casablanca',
    name: 'Imperial White Lily Majesty',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Kemegahan Abadi',
    colorName: 'Royal White & Gold',
    colorHex: '#FAFAF9',
    priceFormatted: 'Rp 340.000',
    description: 'Bunga lily Casablanca putih mekar megah bermahkota benang sari keemasan dengan aroma mewah semerbak.',
    tags: ['lily', 'lili', 'putih', 'mewah', 'anggun'],
    imageUrl: '/images/katalog/real_lily_casablanca.png',
    silhouette: 'tall-cascade',
    decorType: 'lily-white',
  },
  {
    id: 'real_daisy_meadow',
    name: 'Sunny Wild Daisy Meadow',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Ceria & Alami',
    colorName: 'Daisy White & Yellow',
    colorHex: '#FACC15',
    priceFormatted: 'Rp 220.000',
    description: 'Kumpulan bunga daisy liar putih berbintik kuning matahari cerah dalam balutan kertas kraft cokelat vintage.',
    tags: ['daisy', 'bunga liar', 'ceria', 'sahabat'],
    imageUrl: '/images/katalog/real_daisy_meadow.png',
    silhouette: 'compact-round',
    decorType: 'daisy-meadow',
  },
  {
    id: 'real_baby_breath',
    name: 'White Cloud Eternal Baby Breath',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Awan Abadi',
    colorName: 'Cotton White',
    colorHex: '#F1F5F9',
    priceFormatted: 'Rp 250.000',
    description: 'Gumpalan awan baby breath putih padat abadi dengan wrap kertas abu-abu soft dan pita rami rustic.',
    tags: ['baby breath', 'awan', 'putih', 'rustic', 'wisuda'],
    imageUrl: '/images/katalog/real_baby_breath.png',
    silhouette: 'cloud-dome',
    decorType: 'baby-breath',
  },
  {
    id: 'real_sunflower_radiant',
    name: 'Radiant Sunshine Sunflower',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Semangat Wisuda',
    colorName: 'Golden Sunflower Yellow',
    colorHex: '#EAB308',
    priceFormatted: 'Rp 265.000',
    description: 'Bunga matahari kuning cerah mekar merekah simbol optimisme dan kejayaan diiringi daun ruscus hijau.',
    tags: ['matahari', 'sunflower', 'kuning', 'wisuda', 'semangat'],
    imageUrl: '/images/katalog/real_sunflower_radiant.png',
    silhouette: 'sunflower-flared',
    decorType: 'sunflower-gold',
  },
  {
    id: 'real_peony_royal',
    name: 'Royal Empress Peony Bloom',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Ultra Luxury Peony',
    colorName: 'Magenta Peony Rose',
    colorHex: '#BE185D',
    priceFormatted: 'Rp 380.000',
    description: 'Bunga peony berlapis-lapis tebal dengan gradasi pink magenta mewah berbalut kertas satin bergelombang.',
    tags: ['peony', 'pink', 'mahal', 'sultan', 'mewah'],
    imageUrl: '/images/katalog/real_peony_royal.png',
    silhouette: 'flared-wrap',
    decorType: 'peony-bloom',
  },
  {
    id: 'real_hydrangea_azure',
    name: 'Azure Sky French Hydrangea',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Biru Lembut',
    colorName: 'Hydrangea Azure Blue',
    colorHex: '#38BDF8',
    priceFormatted: 'Rp 295.000',
    description: 'Hydrangea biru langit berbentuk bola bunga padat megah dengan kertas pembungkus putih mutiara.',
    tags: ['hydrangea', 'biru', 'langit', 'prancis', 'adem'],
    imageUrl: '/images/katalog/real_hydrangea_azure.png',
    silhouette: 'sphere-dome',
    decorType: 'hydrangea-blue',
  },
  {
    id: 'real_carnation_grace',
    name: 'Sweet Maternal Carnation Grace',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Hari Ibu & Kasih',
    colorName: 'Carnation Rose & Coral',
    colorHex: '#FB7185',
    priceFormatted: 'Rp 235.000',
    description: 'Anyelir berenda lembut warna coral dan pink fuchsia penuh makna kasih sayang dan terima kasih tulus.',
    tags: ['anyelir', 'carnation', 'ibu', 'kasih', 'pink'],
    imageUrl: '/images/katalog/real_carnation_grace.png',
    silhouette: 'compact-round',
    decorType: 'carnation-coral',
  },
  {
    id: 'real_mix_flower_spring',
    name: 'Springtime Floral Symphony',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Campuran Harmonis',
    colorName: 'Multicolor Spring',
    colorHex: '#F43F5E',
    priceFormatted: 'Rp 325.000',
    description: 'Harmoni paduan mawar, tulip, lili, daisy, dan krisan warna-warni yang memancarkan pesona kebun musim semi.',
    tags: ['mix', 'campuran', 'warna-warni', 'meriah', 'lengkap'],
    imageUrl: '/images/katalog/real_mix_flower_spring.png',
    silhouette: 'layered-origami',
    decorType: 'mix-symphony',
  },
  {
    id: 'real_pastel_dream',
    name: 'Lavender Whisper Pastel Dream',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Dreamy Lavender',
    colorName: 'Pastel Lilac & Cream',
    colorHex: '#C084FC',
    priceFormatted: 'Rp 290.000',
    description: 'Rangkaian mawar lilac pastel, hydrangea krem, dan aster ungu muda dalam balutan kertas sutra lavender.',
    tags: ['pastel', 'lavender', 'ungu', 'dreamy', 'aesthetic'],
    imageUrl: '/images/katalog/real_pastel_dream.png',
    silhouette: 'flared-wrap',
    decorType: 'pastel-lavender',
  },
  {
    id: 'real_white_elegant',
    name: 'Monochrome Silver White Luxe',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Monokrom Anggun',
    colorName: 'Silver & Alabaster',
    colorHex: '#E2E8F0',
    priceFormatted: 'Rp 330.000',
    description: 'Koleksi serba putih premium dari mawar putih, calla lily, dan aster salju dengan aksen pita perak mengkilap.',
    tags: ['putih', 'silver', 'monokrom', 'nikah', 'mewah'],
    imageUrl: '/images/katalog/real_white_elegant.png',
    silhouette: 'flared-wrap',
    decorType: 'white-luxe',
  },
  {
    id: 'real_pink_aesthetic',
    name: 'Seoul Korean Pink Wave',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Korean Florist',
    colorName: 'Dusty Pink & Beige',
    colorHex: '#F472B6',
    priceFormatted: 'Rp 295.000',
    description: 'Gaya buket florist Gangnam Seoul dengan kertas bergelombang tebal, sayap origami, dan mawar pink peach mekar.',
    tags: ['korea', 'pink', 'seoul', 'aesthetic', 'kdrama'],
    imageUrl: '/images/katalog/real_pink_aesthetic.png',
    silhouette: 'korean-pleat',
    decorType: 'korean-pink',
  },
  {
    id: 'real_blue_ocean',
    name: 'Midnight Deep Ocean Blue',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Biru Safir',
    colorName: 'Ocean Navy & Sapphire',
    colorHex: '#1D4ED8',
    priceFormatted: 'Rp 315.000',
    description: 'Mawar biru royal berpadu hydrangea sapphire dengan balutan kertas biru malam beraksen pita navy satin mengkilap.',
    tags: ['biru', 'ocean', 'safir', 'navy', 'cowok'],
    imageUrl: '/images/katalog/real_blue_ocean.png',
    silhouette: 'classic-wrap',
    decorType: 'blue-ocean',
  },
  {
    id: 'real_red_romantic',
    name: '33 Stems Scarlet Passion',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: '33 Mawar Merah',
    colorName: 'Deep Crimson Red',
    colorHex: '#B91C1C',
    priceFormatted: 'Rp 420.000',
    description: '33 tangkai mawar merah scarlet tebal melambangkan cinta mendalam tak tergantikan dalam wrap hitam bersayap.',
    tags: ['33 mawar', 'merah', 'lamaran', 'cinta', 'valentine'],
    imageUrl: '/images/katalog/real_red_romantic.png',
    silhouette: 'layered-origami',
    decorType: 'red-passion',
  },
  {
    id: 'real_graduation_sun',
    name: 'Graduation Scholar Golden Bloom',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Edisi Wisuda',
    colorName: 'Sunflower Gold & Maroon',
    colorHex: '#D97706',
    priceFormatted: 'Rp 285.000',
    description: 'Bunga matahari megah dengan pita wisuda, boneka mini bertoga hitam, dan kartu ucapan gelar sarjana.',
    tags: ['wisuda', 'kelulusan', 'sarjana', 'toga', 'matahari'],
    imageUrl: '/images/katalog/real_graduation_sun.png',
    silhouette: 'sunflower-flared',
    decorType: 'graduation-sun',
  },
  {
    id: 'real_birthday_confetti',
    name: 'Birthday Fiesta Party Bloom',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Ulang Tahun',
    colorName: 'Fiesta Coral & Gold',
    colorHex: '#F59E0B',
    priceFormatted: 'Rp 270.000',
    description: 'Rangkaian ceria berhias pin glitter Happy Birthday, mawar cerah, dan pita garis-garis festive meriah.',
    tags: ['ulang tahun', 'birthday', 'pesta', 'ceria'],
    imageUrl: '/images/katalog/real_birthday_confetti.png',
    silhouette: 'compact-round',
    decorType: 'birthday-fiesta',
  },
  {
    id: 'real_luxury_emerald',
    name: 'Emerald Royale Botanical',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Hijau Zamrud',
    colorName: 'Emerald Green & Gold',
    colorHex: '#047857',
    priceFormatted: 'Rp 350.000',
    description: 'Bunga putih murni di dalam balutan kain beludru hijau zamrud dengan bordir lis benang emas mewah.',
    tags: ['emerald', 'zamrud', 'hijau', 'sultan', 'mewah'],
    imageUrl: '/images/katalog/real_luxury_emerald.png',
    silhouette: 'flared-wrap',
    decorType: 'emerald-royale',
  },
  {
    id: 'real_minimalist_single',
    name: 'Wabi-Sabi Minimalist Ikebana',
    category: 'A',
    categoryLabel: 'Bunga Realistis',
    tag: 'Minimalis Jepang',
    colorName: 'Minimalist Oatmeal Beige',
    colorHex: '#A8A29E',
    priceFormatted: 'Rp 195.000',
    description: 'Gaya seni bunga Jepang Ikebana bergaris tegas, tenang, dan bersih dengan satu kuntum mawar soliter sempurna.',
    tags: ['minimalis', 'jepang', 'ikebana', 'wabisabi', 'simpel'],
    imageUrl: '/images/katalog/real_minimalist_single.png',
    silhouette: 'minimal-cone',
    decorType: 'minimal-single',
  },

  // B. BUCKET UNIK / ANEH (20 Desain)
  {
    id: 'unik_heart_shaped',
    name: 'Full Heart Red Velvet Silhouette',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Siluet Hati 3D',
    colorName: 'Crimson Heart Red',
    colorHex: '#E11D48',
    priceFormatted: 'Rp 365.000',
    description: 'Buket berbentuk hati 3D sempurna tersusun dari 50 kuntum mawar merah rapat bergaris pinggir emas mengkilap.',
    tags: ['hati', 'heart', 'cinta', 'unik', 'love'],
    imageUrl: '/images/katalog/unik_heart_shaped.png',
    silhouette: 'heart-shape',
    decorType: 'heart-velvet',
  },
  {
    id: 'unik_butterfly_wings',
    name: 'Morpho Butterfly Wings Bloom',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Sayap Kupu-Kupu',
    colorName: 'Morpho Cyan & Indigo',
    colorHex: '#0284C7',
    priceFormatted: 'Rp 345.000',
    description: 'Kertas wrap berukir sepasang sayap kupu-kupu raksasa yang membentang anggun mengitari rangkaian bunga toska.',
    tags: ['kupu-kupu', 'butterfly', 'sayap', 'fantasi', 'unik'],
    imageUrl: '/images/katalog/unik_butterfly_wings.png',
    silhouette: 'butterfly-wings',
    decorType: 'butterfly-morpho',
  },
  {
    id: 'unik_royal_crown',
    name: 'The Empress Imperial Crown',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Mahkota Sultan',
    colorName: 'Imperial Gold & Velvet',
    colorHex: '#CA8A04',
    priceFormatted: 'Rp 395.000',
    description: 'Buket berstruktur mahkota kerajaan emas bertabur mutiara dengan pusat bunga mawar merah beludru bermahkota permata.',
    tags: ['mahkota', 'crown', 'ratu', 'sultan', 'emas'],
    imageUrl: '/images/katalog/unik_royal_crown.png',
    silhouette: 'crown-shape',
    decorType: 'royal-crown',
  },
  {
    id: 'unik_celestial_star',
    name: 'Starlight Celestial 5-Point Star',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Bintang Bintang',
    colorName: 'Star Yellow & Midnight',
    colorHex: '#FBBF24',
    priceFormatted: 'Rp 330.000',
    description: 'Siluet bintang lima sudut geometris tajam berisi paduan baby breath kuning berkilau dan mawar putih.',
    tags: ['bintang', 'star', 'kosmik', 'unik', 'geometris'],
    imageUrl: '/images/katalog/unik_celestial_star.png',
    silhouette: 'star-shape',
    decorType: 'celestial-star',
  },
  {
    id: 'unik_fan_oriental',
    name: 'Kyoto Golden Silk Fan',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Kipas Tradisional',
    colorName: 'Gold & Cherry Blossom',
    colorHex: '#F43F5E',
    priceFormatted: 'Rp 320.000',
    description: 'Buket melebar anggun menyerupai kipas lipat sutra tradisional Jepang dengan untaian rumbai emas klasik.',
    tags: ['kipas', 'fan', 'jepang', 'oriental', 'anggun'],
    imageUrl: '/images/katalog/unik_fan_oriental.png',
    silhouette: 'fan-shape',
    decorType: 'fan-oriental',
  },
  {
    id: 'unik_spiral_galaxy',
    name: 'Andromeda Spiral Helix Galaxy',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Spiral Galaksi',
    colorName: 'Nebula Purple & Teal',
    colorHex: '#8B5CF6',
    priceFormatted: 'Rp 340.000',
    description: 'Susunan bunga memutar spiral aerodinamis mirip galaksi kosmik dengan wrap berputar dinamis memukau.',
    tags: ['spiral', 'galaksi', 'futuristik', 'modern'],
    imageUrl: '/images/katalog/unik_spiral_galaxy.png',
    silhouette: 'spiral-shape',
    decorType: 'spiral-galaxy',
  },
  {
    id: 'unik_oversized_ribbon',
    name: 'Dramatic Oversized French Bow',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Pita Raksasa',
    colorName: 'Ruby Red Giant Bow',
    colorHex: '#BE123C',
    priceFormatted: 'Rp 315.000',
    description: 'Buket dengan pita satin merah berukuran raksasa 40cm yang menjuntai dramatis menawan bagai gaun pesta.',
    tags: ['pita besar', 'bow', 'dramatis', 'merah', 'cantik'],
    imageUrl: '/images/katalog/unik_oversized_ribbon.png',
    silhouette: 'oversized-ribbon',
    decorType: 'giant-ribbon',
  },
  {
    id: 'unik_asymmetrical_wave',
    name: 'Haute Couture Asymmetrical Pleat',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Asimetris Modern',
    colorName: 'Charcoal & Champagne',
    colorHex: '#334155',
    priceFormatted: 'Rp 310.000',
    description: 'Desain lipatan kertas tinggi-rendah asimetris bergaya arsitektur fesyen Paris dengan sudut-sudut tegas modern.',
    tags: ['asimetris', 'couture', 'modern', 'arsitektur'],
    imageUrl: '/images/katalog/unik_asymmetrical_wave.png',
    silhouette: 'asymmetrical-wrap',
    decorType: 'asym-pleat',
  },
  {
    id: 'unik_layered_origami',
    name: '7-Layer Cascading Origami Fan',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Origami 7 Lapis',
    colorName: 'Nude, Rose & Gold',
    colorHex: '#D97706',
    priceFormatted: 'Rp 325.000',
    description: 'Tujuh lapis kertas origami presisi bertingkat dengan warna harmonis membingkai rangkaian bunga layaknya karya seni.',
    tags: ['origami', 'berlapis', 'tingkat', 'kertas', 'rapi'],
    imageUrl: '/images/katalog/unik_layered_origami.png',
    silhouette: 'layered-origami',
    decorType: 'layered-origami',
  },
  {
    id: 'unik_cone_waffle',
    name: 'Gelato Waffle Cone Sweet Bloom',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Cone Es Krim',
    colorName: 'Waffle Tan & Pastel Pink',
    colorHex: '#D97706',
    priceFormatted: 'Rp 275.000',
    description: 'Buket berbentuk corong cone es krim waffle raksasa bertekstur kotak-kotak dengan puncak bunga mekar warna pastel.',
    tags: ['cone', 'es krim', 'waffle', 'manis', 'lucu'],
    imageUrl: '/images/katalog/unik_cone_waffle.png',
    silhouette: 'cone-waffle',
    decorType: 'waffle-cone',
  },
  {
    id: 'unik_crystal_faceted',
    name: 'Geometric Prism Crystal Gem',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Kristal Prismatik',
    colorName: 'Diamond Iridescent',
    colorHex: '#38BDF8',
    priceFormatted: 'Rp 355.000',
    description: 'Kertas kaku bersegi-segi prisma kristal dengan lapisan holografik memantulkan spektrum cahaya warna-warni.',
    tags: ['kristal', 'prisma', 'geometris', 'berlian'],
    imageUrl: '/images/katalog/unik_crystal_faceted.png',
    silhouette: 'faceted-gem',
    decorType: 'crystal-gem',
  },
  {
    id: 'unik_handbag_purse',
    name: 'Chanel Style Florist Pearl Purse',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Bentuk Tas Jinjing',
    colorName: 'Noir Quilted & Pearl',
    colorHex: '#18181B',
    priceFormatted: 'Rp 375.000',
    description: 'Buket berstruktur tas jinjing pesta bertekstur quilted dengan rantai pegangan mutiara elegan yang bisa ditenteng.',
    tags: ['tas', 'handbag', 'purse', 'mutiara', 'fashion'],
    imageUrl: '/images/katalog/unik_handbag_purse.png',
    silhouette: 'handbag-purse',
    decorType: 'pearl-handbag',
  },
  {
    id: 'unik_picnic_basket',
    name: 'Provence Woven Rattan Basket',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Keranjang Rotan',
    colorName: 'Natural Rattan & Sage',
    colorHex: '#854D0E',
    priceFormatted: 'Rp 290.000',
    description: 'Buket wadah keranjang rotan anyaman alami Provence dengan gagang melengkung penuh bunga mawar liar dan lavender.',
    tags: ['keranjang', 'rotan', 'basket', 'vintage', 'pedesaan'],
    imageUrl: '/images/katalog/unik_picnic_basket.png',
    silhouette: 'basket-shape',
    decorType: 'rattan-basket',
  },
  {
    id: 'unik_cloud_fluffy',
    name: 'Cumulus Cotton Fluffy Cloud',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Awan Berbulu',
    colorName: 'Pure Fluffy White',
    colorHex: '#F8FAFC',
    priceFormatted: 'Rp 280.000',
    description: 'Siluet awan gembul melayang terbuat dari paduan kapas murni dan baby breath salju berhias tetesan kristal transparan.',
    tags: ['awan', 'cloud', 'kapas', 'lembut', 'fluffy'],
    imageUrl: '/images/katalog/unik_cloud_fluffy.png',
    silhouette: 'cloud-dome',
    decorType: 'fluffy-cloud',
  },
  {
    id: 'unik_futuristic_neon',
    name: 'Cyberpunk 2077 Hologram Neon',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Cyberpunk Futuristik',
    colorName: 'Neon Magenta & Cyan',
    colorHex: '#D946EF',
    priceFormatted: 'Rp 360.000',
    description: 'Wrap film holografik futuristik dengan garis neon menyala tajam dan mawar ungu elektrik berbalut akrilik modern.',
    tags: ['cyberpunk', 'futuristik', 'neon', 'hologram', 'sci-fi'],
    imageUrl: '/images/katalog/unik_futuristic_neon.png',
    silhouette: 'futuristic-cyber',
    decorType: 'cyber-neon',
  },
  {
    id: 'unik_sculptural_paper',
    name: 'Architectural Sculptural Wave',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Seni Patung Modern',
    colorName: 'Alabaster Architectural',
    colorHex: '#78716C',
    priceFormatted: 'Rp 340.000',
    description: 'Lembaran kertas karton tebal melengkung bebas menyerupai instalasi seni museum dengan bunga anggrek terangkat anggun.',
    tags: ['skulptur', 'patung', 'arsitektur', 'seni'],
    imageUrl: '/images/katalog/unik_sculptural_paper.png',
    silhouette: 'sculptural-wave',
    decorType: 'sculptural-art',
  },
  {
    id: 'unik_geometric_hexagon',
    name: 'Modern Hexagon Prism Vessel',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Heksagon Geometris',
    colorName: 'Matte Obsidian & Copper',
    colorHex: '#1E293B',
    priceFormatted: 'Rp 335.000',
    description: 'Wadah lipat bersudut heksagon simetris 6 sisi beraksen lis tembaga rose gold dengan bunga tertata rapi.',
    tags: ['heksagon', 'geometris', 'prism', 'sudut'],
    imageUrl: '/images/katalog/unik_geometric_hexagon.png',
    silhouette: 'hexagon-vessel',
    decorType: 'hexagon-prism',
  },
  {
    id: 'unik_transparent_glass',
    name: 'Lucite Crystal Floating Cylinder',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Mika Transparan',
    colorName: 'Crystal Clear & Rose',
    colorHex: '#38BDF8',
    priceFormatted: 'Rp 320.000',
    description: 'Tabung mika bening tembus pandang 100% menampakkan keindahan batang bunga melayang di dalam kristal kaca.',
    tags: ['transparan', 'bening', 'kaca', 'mika', 'minimalis'],
    imageUrl: '/images/katalog/unik_transparent_glass.png',
    silhouette: 'transparent-tube',
    decorType: 'transparent-lucite',
  },
  {
    id: 'unik_double_sided',
    name: 'Yin Yang Dualism Red & White',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Dua Sisi Kontras',
    colorName: 'Crimson Red & Pure White',
    colorHex: '#991B1B',
    priceFormatted: 'Rp 350.000',
    description: 'Buket dua muka: separuh sisi mawar merah beludru kertas hitam, separuh sisi mawar putih salju kertas putih.',
    tags: ['yinyang', 'dua sisi', 'kontras', 'merah putih'],
    imageUrl: '/images/katalog/unik_double_sided.png',
    silhouette: 'double-sided',
    decorType: 'yinyang-split',
  },
  {
    id: 'unik_gift_box_burst',
    name: 'Exploding Surprise Bloom Box',
    category: 'B',
    categoryLabel: 'Bentuk Unik',
    tag: 'Kotak Kado Merekah',
    colorName: 'Burgundy & Blush Silk',
    colorHex: '#831843',
    priceFormatted: 'Rp 370.000',
    description: 'Kotak kado mewah dengan tutup terbuka di mana puluhan kuntum mawar merekah menyembur keluar menakjubkan.',
    tags: ['gift box', 'kotak kado', 'kejutan', 'merekah'],
    imageUrl: '/images/katalog/unik_gift_box_burst.png',
    silhouette: 'gift-box-burst',
    decorType: 'burst-box',
  },

  // C. CHARACTER / ANIME THEMED (16 Desain)
  {
    id: 'anime_naruto_sage',
    name: 'Naruto Konoha Hokage Scroll',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Naruto Shippuden',
    colorName: 'Ninja Orange & Black',
    colorHex: '#F97316',
    priceFormatted: 'Rp 330.000',
    description: 'Buket bertema ninja Konoha dengan wrap oranye-hitam, pusaran Uzumaki, daun ikat kepala, dan tali shinobi.',
    tags: ['naruto', 'anime', 'hokage', 'oranye', 'konoha'],
    imageUrl: '/images/katalog/anime_naruto_sage.png',
    silhouette: 'flared-wrap',
    decorType: 'naruto-scroll',
  },
  {
    id: 'anime_onepiece_sunny',
    name: 'One Piece Thousand Sunny Barrel',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'One Piece Pirate',
    colorName: 'Straw Hat & Ocean Blue',
    colorHex: '#EAB308',
    priceFormatted: 'Rp 340.000',
    description: 'Buket tong kapal Thousand Sunny kayu bertali tambang, topi jerami Luffy, dan bendera bajak laut ceria.',
    tags: ['one piece', 'luffy', 'bajak laut', 'anime', 'topi jerami'],
    imageUrl: '/images/katalog/anime_onepiece_sunny.png',
    silhouette: 'barrel-tub',
    decorType: 'onepiece-barrel',
  },
  {
    id: 'anime_demonslayer_kamado',
    name: 'Demon Slayer Tanjiro Haori Check',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Demon Slayer',
    colorName: 'Checkerboard Green & Black',
    colorHex: '#15803D',
    priceFormatted: 'Rp 335.000',
    description: 'Wrap motif kotak-kotak hijau zamrud dan hitam khas haori Tanjiro dengan anting hanafuda dan pita merah membara.',
    tags: ['demon slayer', 'kimetsu', 'tanjiro', 'anime', 'hijau'],
    imageUrl: '/images/katalog/anime_demonslayer_kamado.png',
    silhouette: 'flared-wrap',
    decorType: 'demonslayer-check',
  },
  {
    id: 'anime_jujutsu_domain',
    name: 'Jujutsu Kaisen Infinite Void',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Jujutsu Kaisen',
    colorName: 'Infinite Black & Cyan Neon',
    colorHex: '#06B6D4',
    priceFormatted: 'Rp 345.000',
    description: 'Nuansa domain expansion Satoru Gojo serba hitam pekat dengan cahaya biru neon kosmik dan pita penutup mata.',
    tags: ['jujutsu', 'gojo', 'satoru', 'anime', 'hitam'],
    imageUrl: '/images/katalog/anime_jujutsu_domain.png',
    silhouette: 'flared-wrap',
    decorType: 'jujutsu-void',
  },
  {
    id: 'anime_pokemon_master',
    name: 'Pokéball Champion Trainer Sphere',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Pokémon Trainer',
    colorName: 'Pokéball Red & White',
    colorHex: '#EF4444',
    priceFormatted: 'Rp 320.000',
    description: 'Buket berbentuk bola Pokéball separuh merah menyala, separuh putih bersih dengan tombol tengah perak mengkilap.',
    tags: ['pokemon', 'pokeball', 'anime', 'trainer', 'merah'],
    imageUrl: '/images/katalog/anime_pokemon_master.png',
    silhouette: 'sphere-dome',
    decorType: 'pokeball-sphere',
  },
  {
    id: 'anime_stitch_tropical',
    name: 'Stitch Experiment 626 Aloha',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Stitch Disney',
    colorName: 'Hawaiian Cyan & Azure',
    colorHex: '#0284C7',
    priceFormatted: 'Rp 325.000',
    description: 'Wrap biru kepulauan Hawaii dengan sepasang telinga Stitch menggemaskan dan pita bunga kembang sepatu tropis.',
    tags: ['stitch', 'aloha', 'hawaii', 'biru', 'disney'],
    imageUrl: '/images/katalog/anime_stitch_tropical.png',
    silhouette: 'flared-wrap',
    decorType: 'stitch-aloha',
  },
  {
    id: 'anime_kuromi_gothic',
    name: 'Kuromi Gothic Lolita Punk',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Sanrio Kuromi',
    colorName: 'Gothic Purple & Jet Black',
    colorHex: '#7C3AED',
    priceFormatted: 'Rp 335.000',
    description: 'Renda hitam lolita dan wrap lavender berhias lambang tengkorak Kuromi punk dan pita sayap kelelawar.',
    tags: ['kuromi', 'sanrio', 'gothic', 'ungu', 'hitam'],
    imageUrl: '/images/katalog/anime_kuromi_gothic.png',
    silhouette: 'flared-wrap',
    decorType: 'kuromi-gothic',
  },
  {
    id: 'anime_cinnamoroll_cloud',
    name: 'Cinnamoroll Sky Angel Wings',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Sanrio Cinnamoroll',
    colorName: 'Pastel Baby Blue & White',
    colorHex: '#7DD3FC',
    priceFormatted: 'Rp 330.000',
    description: 'Wrap biru langit pastel lembut dengan sepasang telinga kelinci berbulu putih dan liontin bintang emas.',
    tags: ['cinnamoroll', 'sanrio', 'biru', 'awan', 'kelinci'],
    imageUrl: '/images/katalog/anime_cinnamoroll_cloud.png',
    silhouette: 'flared-wrap',
    decorType: 'cinnamoroll-cloud',
  },
  {
    id: 'anime_hellokitty_red',
    name: 'Hello Kitty Princess Scarlet Bow',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Sanrio Hello Kitty',
    colorName: 'Princess Pink & Red Bow',
    colorHex: '#F43F5E',
    priceFormatted: 'Rp 330.000',
    description: 'Wrap pink pastel dengan renda scallop putih, pita satin merah mengembang 3D dan liontin hati emas Sanrio.',
    tags: ['hello kitty', 'sanrio', 'pink', 'pita merah', 'imut'],
    imageUrl: '/images/katalog/anime_hellokitty_red.png',
    silhouette: 'flared-wrap',
    decorType: 'hellokitty-bow',
  },
  {
    id: 'anime_doraemon_bell',
    name: 'Doraemon 4D Pocket Robotic Bell',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Doraemon Classic',
    colorName: 'Robotic Blue & Yellow Bell',
    colorHex: '#2563EB',
    priceFormatted: 'Rp 325.000',
    description: 'Wrap biru kobalt cerah dengan kalung pita merah berlonceng emas dan saku kantong ajaib 4D serbaguna.',
    tags: ['doraemon', 'lonceng', 'biru', 'kantong ajaib', 'anime'],
    imageUrl: '/images/katalog/anime_doraemon_bell.png',
    silhouette: 'flared-wrap',
    decorType: 'doraemon-bell',
  },
  {
    id: 'anime_totoro_acorn',
    name: 'Totoro Woodland Spirit Acorn',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Studio Ghibli',
    colorName: 'Sage Green & Wooden Acorn',
    colorHex: '#4D7C0F',
    priceFormatted: 'Rp 335.000',
    description: 'Kertas berserat hijau sage alami bertema roh hutan Ghibli dengan daun pakis dan gantungan biji pohon ek.',
    tags: ['totoro', 'ghibli', 'hutan', 'hijau', 'acorn'],
    imageUrl: '/images/katalog/anime_totoro_acorn.png',
    silhouette: 'flared-wrap',
    decorType: 'totoro-woodland',
  },
  {
    id: 'anime_pikachu_spark',
    name: 'Pikachu Electric Volt Tail',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Pokémon Pikachu',
    colorName: 'Sunflower Yellow & Volt Black',
    colorHex: '#EAB308',
    priceFormatted: 'Rp 325.000',
    description: 'Wrap kuning ceria dengan telinga runcing Pikachu hitam-kuning, pipi merah cerah, dan pita ekor petir.',
    tags: ['pikachu', 'pokemon', 'kuning', 'petir', 'anime'],
    imageUrl: '/images/katalog/anime_pikachu_spark.png',
    silhouette: 'flared-wrap',
    decorType: 'pikachu-spark',
  },
  {
    id: 'anime_sailormoon_cosmic',
    name: 'Sailor Moon Cosmic Crescent Moon',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Sailor Moon',
    colorName: 'Cosmic Lilac & Navy Stars',
    colorHex: '#8B5CF6',
    priceFormatted: 'Rp 345.000',
    description: 'Wrap anime magical girl berlipit ungu lilac & navy dengan bros liontin bulan sabit emas kristal bintang.',
    tags: ['sailor moon', 'bulan sabit', 'magical girl', 'anime', 'lilac'],
    imageUrl: '/images/katalog/anime_sailormoon_cosmic.png',
    silhouette: 'flared-wrap',
    decorType: 'sailormoon-moon',
  },
  {
    id: 'anime_boy_cool',
    name: 'Shonen Dark Hero Crimson Edge',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Shonen Anime',
    colorName: 'Blood Crimson & Jet Black',
    colorHex: '#991B1B',
    priceFormatted: 'Rp 320.000',
    description: 'Buket bergaya anime aksi shonen dengan kombinasi wrap hitam karbon beraksen merah tajam dan pita edgy.',
    tags: ['anime boy', 'shonen', 'hitam merah', 'keren', 'edgy'],
    imageUrl: '/images/katalog/anime_boy_cool.png',
    silhouette: 'flared-wrap',
    decorType: 'shonen-hero',
  },
  {
    id: 'anime_girl_magical',
    name: 'Shojo Magical Starlight Princess',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Shojo Anime',
    colorName: 'Iridescent Pink & Star Gold',
    colorHex: '#F472B6',
    priceFormatted: 'Rp 325.000',
    description: 'Buket romantis anime shojo bertabur pita kilau bintang, gradasi pink mutiara, dan mawar pastel merekah.',
    tags: ['anime girl', 'shojo', 'magical', 'pink', 'bintang'],
    imageUrl: '/images/katalog/anime_girl_magical.png',
    silhouette: 'flared-wrap',
    decorType: 'shojo-princess',
  },
  {
    id: 'anime_mascot_chibi',
    name: 'Chibi Kawaii Mascot Blossom',
    category: 'C',
    categoryLabel: 'Anime & Karakter',
    tag: 'Chibi Mascot',
    colorName: 'Pastel Coral & Lemon',
    colorHex: '#FBBF24',
    priceFormatted: 'Rp 310.000',
    description: 'Buket berhias karakter maskot anime chibi lucu dengan senyum ceria di antara hamparan bunga krisan pastel.',
    tags: ['chibi', 'maskot', 'lucu', 'anime', 'pastel'],
    imageUrl: '/images/katalog/anime_mascot_chibi.png',
    silhouette: 'compact-round',
    decorType: 'chibi-mascot',
  },

  // D. CUTE / KAWAII (13 Desain)
  {
    id: 'kawaii_teddy_plush',
    name: 'Honey Bear Fluffy Plushie',
    category: 'D',
    categoryLabel: 'Cute & Kawaii',
    tag: 'Boneka Beruang',
    colorName: 'Warm Honey & Caramel',
    colorHex: '#B45309',
    priceFormatted: 'Rp 290.000',
    description: 'Boneka beruang teddy bear plushie cokelat hangat memeluk mawar krem lembut dalam balutan pita satin cokelat.',
    tags: ['teddy', 'beruang', 'boneka', 'lucu', 'hangat'],
    imageUrl: '/images/katalog/kawaii_teddy_plush.png',
    silhouette: 'compact-round',
    decorType: 'teddy-plush',
  },
  {
    id: 'kawaii_bunny_rabbit',
    name: 'Fluffy White Ear Bunny Blossom',
    category: 'D',
    categoryLabel: 'Cute & Kawaii',
    tag: 'Kelinci Imut',
    colorName: 'Marshmallow White & Pink',
    colorHex: '#FCE7F3',
    priceFormatted: 'Rp 285.000',
    description: 'Buket dengan sepasang telinga kelinci putih tegak panjang berbulu lembut di antara kuntum mawar baby pink.',
    tags: ['kelinci', 'bunny', 'pink', 'putih', 'telinga'],
    imageUrl: '/images/katalog/kawaii_bunny_rabbit.png',
    silhouette: 'flared-wrap',
    decorType: 'bunny-ears',
  },
  {
    id: 'kawaii_kitty_paw',
    name: 'Playful Calico Kitty Paw Pad',
    category: 'D',
    categoryLabel: 'Cute & Kawaii',
    tag: 'Telapak Kucing',
    colorName: 'Cat Paw Pink & Cream',
    colorHex: '#FDA4AF',
    priceFormatted: 'Rp 280.000',
    description: 'Aksen telapak kaki kucing paw pad pink kenyal menggemaskan berpadu mawar cerah dan pita lonceng kucing mini.',
    tags: ['kucing', 'kitty', 'paw', 'pawpad', 'anabul'],
    imageUrl: '/images/katalog/kawaii_kitty_paw.png',
    silhouette: 'compact-round',
    decorType: 'kitty-paw',
  },
  {
    id: 'kawaii_puppy_corgi',
    name: 'Cheerful Corgi Smile Bloom',
    category: 'D',
    categoryLabel: 'Cute & Kawaii',
    tag: 'Corgi Lucu',
    colorName: 'Corgi Golden & White',
    colorHex: '#F59E0B',
    priceFormatted: 'Rp 285.000',
    description: 'Karakter corgi tersenyum bahagia dengan kuping segitiga berdiri di tengah rangkaian bunga matahari kuning cerah.',
    tags: ['anjing', 'puppy', 'corgi', 'anabul', 'kuning'],
    imageUrl: '/images/katalog/kawaii_puppy_corgi.png',
    silhouette: 'compact-round',
    decorType: 'corgi-puppy',
  },
  {
    id: 'kawaii_panda_bamboo',
    name: 'Sleepy Baby Panda Bamboo',
    category: 'D',
    categoryLabel: 'Cute & Kawaii',
    tag: 'Panda Gembul',
    colorName: 'Monochrome Panda & Green',
    colorHex: '#10B981',
    priceFormatted: 'Rp 290.000',
    description: 'Panda hitam putih gembul memeluk ranting bambu keberuntungan di antara bunga krisan putih salju.',
    tags: ['panda', 'bambu', 'hijau', 'lucu', 'gembul'],
    imageUrl: '/images/katalog/kawaii_panda_bamboo.png',
    silhouette: 'compact-round',
    decorType: 'panda-bamboo',
  },
  {
    id: 'kawaii_froggy_green',
    name: 'Lucky Pond Froggy Prince',
    category: 'D',
    categoryLabel: 'Cute & Kawaii',
    tag: 'Katak Hijau',
    colorName: 'Pond Green & Mint',
    colorHex: '#22C55E',
    priceFormatted: 'Rp 275.000',
    description: 'Katak hijau kawaii bermahkota daun teratai mungil dengan mata bulat ramah di tengah bunga daisy putih.',
    tags: ['katak', 'kodok', 'frog', 'hijau', 'mint'],
    imageUrl: '/images/katalog/kawaii_froggy_green.png',
    silhouette: 'compact-round',
    decorType: 'froggy-green',
  },
  {
    id: 'kawaii_duck_yellow',
    name: 'Quacky Sunshine Rubber Duck',
    category: 'D',
    categoryLabel: 'Cute & Kawaii',
    tag: 'Bebek Kuning',
    colorName: 'Sunny Yellow & Orange Beak',
    colorHex: '#FBBF24',
    priceFormatted: 'Rp 270.000',
    description: 'Bebek kuning ceria dengan paruh oranye imut di dalam balutan kertas polkadot cerah ceria.',
    tags: ['bebek', 'duck', 'kuning', 'polkadot', 'ceria'],
    imageUrl: '/images/katalog/kawaii_duck_yellow.png',
    silhouette: 'compact-round',
    decorType: 'duck-yellow',
  },
  {
    id: 'kawaii_mushroom_fairy',
    name: 'Fairy Red Toadstool Mushroom',
    category: 'D',
    categoryLabel: 'Cute & Kawaii',
    tag: 'Jamur Dongeng',
    colorName: 'Crimson Red & White Spots',
    colorHex: '#DC2626',
    priceFormatted: 'Rp 280.000',
    description: 'Buket bertema negeri peri dengan ornamen jamur merah berbintik putih ala hutan dongeng magis.',
    tags: ['jamur', 'mushroom', 'peri', 'dongeng', 'merah'],
    imageUrl: '/images/katalog/kawaii_mushroom_fairy.png',
    silhouette: 'compact-round',
    decorType: 'mushroom-fairy',
  },
  {
    id: 'kawaii_cotton_candy',
    name: 'Marshmallow Candy Rainbow Cloud',
    category: 'D',
    categoryLabel: 'Cute & Kawaii',
    tag: 'Permen Kapas',
    colorName: 'Pastel Rainbow Swirl',
    colorHex: '#F472B6',
    priceFormatted: 'Rp 285.000',
    description: 'Kombinasi bunga berwarna pastel permen kapas: baby pink, mint green, dan sky blue dengan pita lollipop.',
    tags: ['permen kapas', 'candy', 'rainbow', 'marshmallow', 'manis'],
    imageUrl: '/images/katalog/kawaii_cotton_candy.png',
    silhouette: 'cloud-dome',
    decorType: 'cotton-candy',
  },
  {
    id: 'kawaii_rainbow_pastel',
    name: 'Pastel Rainbow Bridge Harmony',
    category: 'D',
    categoryLabel: 'Cute & Kawaii',
    tag: 'Pelangi Pastel',
    colorName: '7-Color Pastel Arc',
    colorHex: '#818CF8',
    priceFormatted: 'Rp 295.000',
    description: 'Gradasi 7 warna pelangi lembut pastel dalam satu buket penuh harmoni kedamaian dan kebahagiaan.',
    tags: ['pelangi', 'rainbow', 'pastel', 'warna-warni'],
    imageUrl: '/images/katalog/kawaii_rainbow_pastel.png',
    silhouette: 'flared-wrap',
    decorType: 'rainbow-pastel',
  },
  {
    id: 'kawaii_soft_cloud',
    name: 'Smiling Sky Cloud Starlight',
    category: 'D',
    categoryLabel: 'Cute & Kawaii',
    tag: 'Awan Tersenyum',
    colorName: 'Cloud White & Sky Azure',
    colorHex: '#38BDF8',
    priceFormatted: 'Rp 275.000',
    description: 'Buket awan putih tersenyum ramah bertabur gantungan bintang emas kecil dan pita sutra biru langit.',
    tags: ['awan', 'cloud', 'bintang', 'langit', 'lucu'],
    imageUrl: '/images/katalog/kawaii_soft_cloud.png',
    silhouette: 'cloud-dome',
    decorType: 'smiling-cloud',
  },
  {
    id: 'kawaii_glitter_star',
    name: 'Twinkle Golden Glitter Star',
    category: 'D',
    categoryLabel: 'Cute & Kawaii',
    tag: 'Bintang Berkilau',
    colorName: 'Glitter Gold & Butter Yellow',
    colorHex: '#FDE047',
    priceFormatted: 'Rp 280.000',
    description: 'Buket berhias ornamen bintang kuning glitter berkilau dengan mawar kuning cerah dan pita satin berkilau.',
    tags: ['bintang', 'star', 'glitter', 'kuning', 'kemilau'],
    imageUrl: '/images/katalog/kawaii_glitter_star.png',
    silhouette: 'star-shape',
    decorType: 'glitter-star',
  },
  {
    id: 'kawaii_cupid_heart',
    name: 'Cupid Winged Heart Pastel',
    category: 'D',
    categoryLabel: 'Cute & Kawaii',
    tag: 'Hati Sayap Malaikat',
    colorName: 'Cupid Pink & Angel White',
    colorHex: '#FB7185',
    priceFormatted: 'Rp 290.000',
    description: 'Bentuk hati pink lembut bersayap malaikat putih mungil pembawa pesan cinta manis dari Cupid.',
    tags: ['cupid', 'hati', 'sayap', 'angel', 'pink'],
    imageUrl: '/images/katalog/kawaii_cupid_heart.png',
    silhouette: 'heart-shape',
    decorType: 'cupid-heart',
  },

  // E. LUXURY & SULTAN (13 Desain)
  {
    id: 'luxury_black_gold',
    name: '24K Royal Noir Gold Leaf',
    category: 'E',
    categoryLabel: 'Luxury & Sultan',
    tag: 'Sultan Emas 24K',
    colorName: 'Matte Obsidian & 24K Gold',
    colorHex: '#D97706',
    priceFormatted: 'Rp 450.000',
    description: 'Kertas wrap hitam beludru gelap berpadu mawar merah tua berlapis serpihan emas 24 karat murni.',
    tags: ['emas', 'gold', 'hitam', 'sultan', 'mewah', '24k'],
    imageUrl: '/images/katalog/luxury_black_gold.png',
    silhouette: 'flared-wrap',
    decorType: 'noir-gold',
  },
  {
    id: 'luxury_white_gold',
    name: 'Imperial Carrara White & Gold',
    category: 'E',
    categoryLabel: 'Luxury & Sultan',
    tag: 'Marmer Emas',
    colorName: 'Carrara Marble & Gilded Edge',
    colorHex: '#CA8A04',
    priceFormatted: 'Rp 420.000',
    description: 'Buket kertas motif marmer Italia Carrara putih dengan lis foil emas berkilau dan mawar putih mekar.',
    tags: ['marmer', 'putih', 'emas', 'imperial', 'mewah'],
    imageUrl: '/images/katalog/luxury_white_gold.png',
    silhouette: 'flared-wrap',
    decorType: 'white-marble-gold',
  },
  {
    id: 'luxury_champagne',
    name: 'French Champagne Silk Elegance',
    category: 'E',
    categoryLabel: 'Luxury & Sultan',
    tag: 'Sampanye Mewah',
    colorName: 'Champagne Beige & Silk',
    colorHex: '#D4A373',
    priceFormatted: 'Rp 390.000',
    description: 'Nuansa warna sampanye Prancis hangat berpadu kain sutra bertekstur lembut dan mawar nude karamel.',
    tags: ['champagne', 'sampanye', 'sutra', 'hangat', 'mewah'],
    imageUrl: '/images/katalog/luxury_champagne.png',
    silhouette: 'classic-wrap',
    decorType: 'champagne-silk',
  },
  {
    id: 'luxury_burgundy_wine',
    name: 'Bordeaux Burgundy Royal Velvet',
    category: 'E',
    categoryLabel: 'Luxury & Sultan',
    tag: 'Merah Wine',
    colorName: 'Bordeaux Burgundy & Gold',
    colorHex: '#881337',
    priceFormatted: 'Rp 410.000',
    description: 'Kain beludru merah anggur Bordeaux pekat dengan pita sutra merah marun dan mawar merah gelap berkelas.',
    tags: ['burgundy', 'wine', 'marun', 'beludru', 'mewah'],
    imageUrl: '/images/katalog/luxury_burgundy_wine.png',
    silhouette: 'flared-wrap',
    decorType: 'burgundy-velvet',
  },
  {
    id: 'luxury_emerald_glam',
    name: 'Royal Emerald Green & Gilt',
    category: 'E',
    categoryLabel: 'Luxury & Sultan',
    tag: 'Zamrud Sultan',
    colorName: 'Emerald Green & Gold Thread',
    colorHex: '#065F46',
    priceFormatted: 'Rp 430.000',
    description: 'Warna hijau zamrud kerajaan yang agung dibalut tali tambang emas kuno dan mawar krem bermahkota emas.',
    tags: ['emerald', 'zamrud', 'hijau', 'emas', 'agung'],
    imageUrl: '/images/katalog/luxury_emerald_glam.png',
    silhouette: 'flared-wrap',
    decorType: 'emerald-gilt',
  },
  {
    id: 'luxury_midnight_navy',
    name: 'Midnight Sapphire Celestial Stars',
    category: 'E',
    categoryLabel: 'Luxury & Sultan',
    tag: 'Safir Bintang',
    colorName: 'Deep Sapphire & Star Gold',
    colorHex: '#1E3A8A',
    priceFormatted: 'Rp 400.000',
    description: 'Wrap biru safir malam pekat berhias rasi bintang emas halus dan bunga mawar biru laut eksotis.',
    tags: ['safir', 'navy', 'bintang', 'emas', 'mewah'],
    imageUrl: '/images/katalog/luxury_midnight_navy.png',
    silhouette: 'flared-wrap',
    decorType: 'navy-celestial',
  },
  {
    id: 'luxury_matte_noir',
    name: 'Monolithic All-Matte Black Obsidian',
    category: 'E',
    categoryLabel: 'Luxury & Sultan',
    tag: 'Serba Hitam Matte',
    colorName: 'Triple Matte Black',
    colorHex: '#09090B',
    priceFormatted: 'Rp 420.000',
    description: 'Keanggunan mutlak serba hitam: wrap hitam doff pekat, mawar hitam baccara, dan pita garis monokrom eksklusif.',
    tags: ['hitam', 'matte', 'noir', 'obsidian', 'mewah'],
    imageUrl: '/images/katalog/luxury_matte_noir.png',
    silhouette: 'korean-pleat',
    decorType: 'matte-noir',
  },
  {
    id: 'luxury_velvet_plush',
    name: 'Ruby Plush Velvet Cascade',
    category: 'E',
    categoryLabel: 'Luxury & Sultan',
    tag: 'Beludru Ruby',
    colorName: 'Plush Ruby Velvet',
    colorHex: '#9F1239',
    priceFormatted: 'Rp 415.000',
    description: 'Lapisan luar kain beludru tebal lembut anti-air dengan tekstur mewah saat disentuh membungkus mawar merah.',
    tags: ['velvet', 'beludru', 'ruby', 'mewah', 'merah'],
    imageUrl: '/images/katalog/luxury_velvet_plush.png',
    silhouette: 'flared-wrap',
    decorType: 'ruby-velvet',
  },
  {
    id: 'luxury_satin_cascade',
    name: 'Cascading Italian Silk Ribbon',
    category: 'E',
    categoryLabel: 'Luxury & Sultan',
    tag: 'Pita Sutra Menjuntai',
    colorName: 'Blush Silk & Pure Rose',
    colorHex: '#FB7185',
    priceFormatted: 'Rp 385.000',
    description: 'Pita sutra satin Italia selebar 8 cm yang menjuntai panjang anggun mengalir hingga ke bawah buket.',
    tags: ['satin', 'sutra', 'pita panjang', 'anggun', 'mewah'],
    imageUrl: '/images/katalog/luxury_satin_cascade.png',
    silhouette: 'oversized-ribbon',
    decorType: 'satin-cascade',
  },
  {
    id: 'luxury_pearl_garland',
    name: 'South Sea Pearl Garland Bloom',
    category: 'E',
    categoryLabel: 'Luxury & Sultan',
    tag: 'Untaian Mutiara',
    colorName: 'Lustrous Pearl & White Rose',
    colorHex: '#E2E8F0',
    priceFormatted: 'Rp 460.000',
    description: 'Untaian mutiara laut berkilauan mengalungi kelopak mawar putih bersih dengan kemewahan putri bangsawan.',
    tags: ['mutiara', 'pearl', 'putih', 'kalung', 'sultan'],
    imageUrl: '/images/katalog/luxury_pearl_garland.png',
    silhouette: 'flared-wrap',
    decorType: 'pearl-garland',
  },
  {
    id: 'luxury_crystal_swarovski',
    name: 'Swarovski Crystal Dew Sparkle',
    category: 'E',
    categoryLabel: 'Luxury & Sultan',
    tag: 'Kristal Swarovski',
    colorName: 'Prism Diamond Sparkle',
    colorHex: '#38BDF8',
    priceFormatted: 'Rp 480.000',
    description: 'Setiap kuntum mawar dihiasi butiran kristal prisma berkilau memantulkan kilauan cahaya layaknya berlian asli.',
    tags: ['kristal', 'swarovski', 'berlian', 'kemilau', 'sultan'],
    imageUrl: '/images/katalog/luxury_crystal_swarovski.png',
    silhouette: 'flared-wrap',
    decorType: 'crystal-dew',
  },
  {
    id: 'luxury_gold_leaf',
    name: 'Gilded 24K Gold Leaf Petals',
    category: 'E',
    categoryLabel: 'Luxury & Sultan',
    tag: 'Kelopak Emas Murni',
    colorName: '24K Gold Leaf & Carmine',
    colorHex: '#EAB308',
    priceFormatted: 'Rp 495.000',
    description: 'Tepian kelopak mawar dilapisi lembaran daun emas 24 karat murni yang tidak akan pudar selamanya.',
    tags: ['gold leaf', 'daun emas', '24k', 'sultan', 'termahal'],
    imageUrl: '/images/katalog/luxury_gold_leaf.png',
    silhouette: 'layered-origami',
    decorType: 'gold-leaf-petals',
  },
  {
    id: 'luxury_giant_rose',
    name: 'Empress 15cm Ecuadorian Rose',
    category: 'E',
    categoryLabel: 'Luxury & Sultan',
    tag: 'Mawar Raksasa',
    colorName: 'Giant Scarlet Ecuadorian',
    colorHex: '#BE123C',
    priceFormatted: 'Rp 450.000',
    description: 'Mawar Ekuador raksasa premium berdiameter 15 cm dengan mahkota kelopak tebal yang memukau mata.',
    tags: ['mawar raksasa', 'ecuador', 'besar', 'sultan', 'mewah'],
    imageUrl: '/images/katalog/luxury_giant_rose.png',
    silhouette: 'flared-wrap',
    decorType: 'giant-rose',
  },

  // F. GIFT & SNACK BOUQUET (17 Desain)
  {
    id: 'gift_ferrero_gold',
    name: 'Ferrero Rocher Golden Pyramid',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Cokelat Ferrero',
    colorName: 'Golden Hazelnut Foil',
    colorHex: '#CA8A04',
    priceFormatted: 'Rp 365.000',
    description: 'Piramida 16 butir cokelat Ferrero Rocher emas berbalut mawar merah scarlet dan pita satin cokelat emas.',
    tags: ['cokelat', 'ferrero', 'emas', 'snack', 'hadiah'],
    imageUrl: '/images/katalog/gift_ferrero_gold.png',
    silhouette: 'compact-round',
    decorType: 'ferrero-pyramid',
  },
  {
    id: 'gift_kinder_snack',
    name: 'Sweet Chocolate Bar Fiesta',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Snack Cokelat',
    colorName: 'Cadbury Purple & Silver',
    colorHex: '#6B21A8',
    priceFormatted: 'Rp 275.000',
    description: 'Buket aneka cokelat batangan favorit (KitKat, Silverqueen, Cadbury) tersusun artistik dengan pita ceria.',
    tags: ['cokelat', 'snack', 'jajanan', 'silverqueen', 'kitkat'],
    imageUrl: '/images/katalog/gift_kinder_snack.png',
    silhouette: 'layered-origami',
    decorType: 'chocolate-bars',
  },
  {
    id: 'gift_candy_lollipop',
    name: 'Rainbow Chupa Chups Candy Fun',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Permen Lollipop',
    colorName: 'Rainbow Candy Swirl',
    colorHex: '#EC4899',
    priceFormatted: 'Rp 220.000',
    description: 'Kumpulan permen lolipop warna-warni buah segar dengan wrap polkadot cerah kesukaan semua kalangan.',
    tags: ['permen', 'candy', 'lollipop', 'manis', 'ceria'],
    imageUrl: '/images/katalog/gift_candy_lollipop.png',
    silhouette: 'compact-round',
    decorType: 'candy-lollipop',
  },
  {
    id: 'gift_teddy_couple',
    name: 'Wedding Bride & Groom Teddy',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Boneka Pengantin',
    colorName: 'Bridal White & Tuxedo Noir',
    colorHex: '#F8FAFC',
    priceFormatted: 'Rp 340.000',
    description: 'Sepasang boneka beruang pengantin lengkap dengan tuksedo hitam dan gaun berenda putih di antara mawar salju.',
    tags: ['boneka', 'pengantin', 'wedding', 'teddy', 'nikah'],
    imageUrl: '/images/katalog/gift_teddy_couple.png',
    silhouette: 'compact-round',
    decorType: 'teddy-couple',
  },
  {
    id: 'gift_money_banknotes',
    name: 'Sultan Origami Money Bloom',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Buket Uang Asli',
    colorName: 'Red 100K Banknotes & Gold',
    colorHex: '#DC2626',
    priceFormatted: 'Rp 380.000',
    description: 'Buket lembaran uang origami yang dibentuk menyerupai kuncup kelopak mawar mekar dengan pita emas mewah.',
    tags: ['uang', 'money bouquet', 'rupiah', 'sultan', 'hadiah'],
    imageUrl: '/images/katalog/gift_money_banknotes.png',
    silhouette: 'flared-wrap',
    decorType: 'money-roses',
  },
  {
    id: 'gift_korean_makeup',
    name: 'K-Beauty Glamour Makeup Bouquet',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Makeup & Kosmetik',
    colorName: 'Velvet Lip Tint Rose',
    colorHex: '#E11D48',
    priceFormatted: 'Rp 395.000',
    description: 'Paket kosmetik Korea: lip tint beludru, cushion, blush on, dan maskara tertata cantik di antara bunga mawar.',
    tags: ['makeup', 'kosmetik', 'kbeauty', 'wanita', 'cewek'],
    imageUrl: '/images/katalog/gift_korean_makeup.png',
    silhouette: 'flared-wrap',
    decorType: 'makeup-cosmetics',
  },
  {
    id: 'gift_glowing_skincare',
    name: 'Glow Up Skincare Radiance Kit',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Skincare Glowing',
    colorName: 'Serum Teal & Pure White',
    colorHex: '#0D9488',
    priceFormatted: 'Rp 410.000',
    description: 'Set produk perawatan kulit glowing: serum hyaluronic, toner, dan pelembap berhias mawar putih bersih.',
    tags: ['skincare', 'glowing', 'serum', 'wanita', 'perawatan'],
    imageUrl: '/images/katalog/gift_glowing_skincare.png',
    silhouette: 'flared-wrap',
    decorType: 'skincare-serum',
  },
  {
    id: 'gift_french_perfume',
    name: 'Chanel French Fragrance Essence',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Parfum Mewah',
    colorName: 'Amber Crystal & Soft Rose',
    colorHex: '#F59E0B',
    priceFormatted: 'Rp 435.000',
    description: 'Botol parfum kaca kristal Prancis elegan diletakkan sebagai pusat mahkota buket bunga beraroma memikat.',
    tags: ['parfum', 'perfume', 'wangi', 'mewah', 'kado'],
    imageUrl: '/images/katalog/gift_french_perfume.png',
    silhouette: 'flared-wrap',
    decorType: 'perfume-bottle',
  },
  {
    id: 'gift_pashmina_hijab',
    name: 'Silk Pashmina Hijab Rosette',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Hijab Pashmina',
    colorName: 'Muted Rose & Silk Taupe',
    colorHex: '#BE185D',
    priceFormatted: 'Rp 295.000',
    description: 'Kain hijab pashmina sutra premium dilipat dengan teknik origami membentuk kuntum mawar mekar sempurna.',
    tags: ['hijab', 'pashmina', 'jilbab', 'muslimah', 'kado'],
    imageUrl: '/images/katalog/gift_pashmina_hijab.png',
    silhouette: 'flared-wrap',
    decorType: 'pashmina-rose',
  },
  {
    id: 'gift_mini_plushies',
    name: '9-Kawaii Mini Plushies Family',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Banyak Boneka Mini',
    colorName: 'Multicolor Pastel Friends',
    colorHex: '#F472B6',
    priceFormatted: 'Rp 310.000',
    description: 'Kumpulan 9 boneka mini plushie aneka karakter lucu menggemaskan tersenyum di antara kelopak bunga.',
    tags: ['boneka mini', 'plushies', 'lucu', 'banyak boneka'],
    imageUrl: '/images/katalog/gift_mini_plushies.png',
    silhouette: 'compact-round',
    decorType: 'mini-plushies',
  },
  {
    id: 'gift_graduation_toga',
    name: 'Magna Cum Laude Bachelor Teddy',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Wisuda & Boneka Toga',
    colorName: 'Toga Black & Satin Maroon',
    colorHex: '#991B1B',
    priceFormatted: 'Rp 320.000',
    description: 'Boneka beruang wisuda lengkap dengan topi toga, medali emas, tabung ijazah, dan selempang kelulusan.',
    tags: ['wisuda', 'kelulusan', 'toga', 'sarjana', 'boneka'],
    imageUrl: '/images/katalog/gift_graduation_toga.png',
    silhouette: 'flared-wrap',
    decorType: 'toga-scholar',
  },
  {
    id: 'gift_baby_newborn',
    name: 'Welcome Little Prince Newborn Hamper',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Kado Bayi Baru Lahir',
    colorName: 'Baby Azure & Cloud Cream',
    colorHex: '#38BDF8',
    priceFormatted: 'Rp 295.000',
    description: 'Buket perlengkapan bayi mungil: sepatu rajut bayi, kaos kaki boneka, dan mainan kerincingan pastel.',
    tags: ['bayi', 'newborn', 'melahirkan', 'baby shower', 'anak'],
    imageUrl: '/images/katalog/gift_baby_newborn.png',
    silhouette: 'compact-round',
    decorType: 'baby-newborn',
  },
  {
    id: 'gift_coffee_artisan',
    name: 'Specialty Nusantara Drip Coffee Kit',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Kopi Nusantara',
    colorName: 'Espresso Dark & Burlap',
    colorHex: '#451A03',
    priceFormatted: 'Rp 285.000',
    description: 'Buket sachet specialty drip coffee pilihan nusantara (Gayo, Toraja, Kintamani) dengan cangkir keramik rustic.',
    tags: ['kopi', 'coffee', 'gayo', 'cowok', 'hadiah'],
    imageUrl: '/images/katalog/gift_coffee_artisan.png',
    silhouette: 'flared-wrap',
    decorType: 'coffee-drip',
  },
  {
    id: 'gift_tea_blossom',
    name: 'Artisan Blooming Herbal Flower Tea',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Teh Bunga Herbal',
    colorName: 'Chamomile Yellow & Mint',
    colorHex: '#84CC16',
    priceFormatted: 'Rp 275.000',
    description: 'Koleksi teh seduh bunga mekar (blooming tea ball, chamomile, french rose bud) dalam tabung kaca estetik.',
    tags: ['teh', 'tea', 'herbal', 'sehat', 'chamomile'],
    imageUrl: '/images/katalog/gift_tea_blossom.png',
    silhouette: 'compact-round',
    decorType: 'tea-blossom',
  },
  {
    id: 'gift_stationery_cute',
    name: 'Pastel Study Journal Stationery Kit',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Alat Tulis Estetik',
    colorName: 'Pastel Mint & Lilac',
    colorHex: '#A78BFA',
    priceFormatted: 'Rp 265.000',
    description: 'Buket alat tulis estetik: pena gel pastel, washi tape motif bunga, sticky notes, dan highlighter pastel.',
    tags: ['stationery', 'alat tulis', 'belajar', 'sekolah', 'lucu'],
    imageUrl: '/images/katalog/gift_stationery_cute.png',
    silhouette: 'flared-wrap',
    decorType: 'stationery-kit',
  },
  {
    id: 'gift_fruit_fresh',
    name: 'Fresh Chocolate Dipped Strawberry Orchard',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Buah Segar & Cokelat',
    colorName: 'Ruby Strawberry & Dark Cocoa',
    colorHex: '#BE123C',
    priceFormatted: 'Rp 350.000',
    description: 'Stroberi segar merah ranum berbalut cokelat Belgia manis dihiasi taburan kacang almond dan mawar pink.',
    tags: ['buah', 'stroberi', 'cokelat', 'segar', 'enak'],
    imageUrl: '/images/katalog/gift_fruit_fresh.png',
    silhouette: 'compact-round',
    decorType: 'strawberry-choc',
  },
  {
    id: 'gift_anniversary_special',
    name: 'Golden 50th Diamond Jubilee Anniversary',
    category: 'F',
    categoryLabel: 'Gift & Snack',
    tag: 'Anniversary Spesial',
    colorName: 'Gilded Gold & Pure White',
    colorHex: '#D97706',
    priceFormatted: 'Rp 480.000',
    description: 'Buket perayaan anniversary termegah dengan mawar putih murni, liontin angka emas, dan pita satin keemasan.',
    tags: ['anniversary', 'ulang tahun pernikahan', 'emas', 'istimewa'],
    imageUrl: '/images/katalog/gift_anniversary_special.png',
    silhouette: 'layered-origami',
    decorType: 'anniversary-gold',
  },
];

// Helper SVG Builder untuk setiap siluet & dekorasi murni transparan (800 x 800)
function generateBouquetSvg(item: CatalogItem): string {
  const { silhouette, colorHex, decorType } = item;
  const w = 800;
  const h = 800;

  // Palet Turunan
  const primary = colorHex;
  const secondary = '#ffffff';

  // SVG Elements berdasarkan siluet dan kategori
  let bodySvg = '';

  if (silhouette === 'heart-shape') {
    // Siluet Bentuk Hati 3D
    bodySvg = `
      <!-- Heart Wrap Foundation -->
      <path d="M 400,680 C 260,560 140,440 140,300 C 140,190 230,130 330,150 C 370,160 400,190 400,210 C 400,190 430,160 470,150 C 570,130 660,190 660,300 C 660,440 540,560 400,680 Z" fill="${primary}" filter="url(#dropShadow)" />
      <!-- Heart Inner Cushion -->
      <path d="M 400,640 C 280,530 170,420 170,305 C 170,210 245,160 330,175 C 365,185 390,210 400,225 C 410,210 435,185 470,175 C 555,160 630,210 630,305 C 630,420 520,530 400,640 Z" fill="#1e1b18" opacity="0.85" />
      <!-- Floral Blooms inside Heart -->
      <g filter="url(#softGlow)">
        ${generateHeartFlowers(primary, 400, 360)}
      </g>
      <!-- Gold Rim Lining -->
      <path d="M 400,670 C 265,550 150,430 150,302 C 150,195 235,135 330,155 C 370,165 395,195 400,215 C 405,195 430,165 470,155 C 565,135 650,195 650,302 C 650,430 535,550 400,670 Z" fill="none" stroke="#FDE047" stroke-width="5" />
      <!-- Satin Ribbon Bow at Point -->
      <ellipse cx="400" cy="650" rx="42" ry="18" fill="#FDE047" />
      <circle cx="400" cy="650" r="16" fill="#D97706" />
      <path d="M 370,655 C 330,680 310,740 300,770 L 325,765 C 335,730 355,680 380,660 Z" fill="#FDE047" />
      <path d="M 430,655 C 470,680 490,740 500,770 L 475,765 C 465,730 445,680 420,660 Z" fill="#FDE047" />
    `;
  } else if (silhouette === 'crown-shape') {
    // Siluet Mahkota Kerajaan
    bodySvg = `
      <!-- Crown Base Wrapper -->
      <path d="M 230,420 L 190,720 L 610,720 L 570,420 Z" fill="#18181B" filter="url(#dropShadow)" />
      <!-- Floral Cloud -->
      <g>
        ${generateFlowerCluster(primary, 400, 370, 160)}
      </g>
      <!-- Crown Spikes -->
      <path d="M 180,450 L 220,240 L 310,340 L 400,180 L 490,340 L 580,240 L 620,450 Z" fill="${primary}" stroke="#FEF08A" stroke-width="6" filter="url(#dropShadow)" />
      <!-- Crown Jewels -->
      <circle cx="400" cy="190" r="18" fill="#EF4444" stroke="#FEF08A" stroke-width="4" />
      <circle cx="220" cy="250" r="14" fill="#3B82F6" stroke="#FEF08A" stroke-width="3" />
      <circle cx="580" cy="250" r="14" fill="#3B82F6" stroke="#FEF08A" stroke-width="3" />
      <!-- Royal Gold Band -->
      <rect x="210" y="440" width="380" height="35" rx="8" fill="#EAB308" stroke="#FEF08A" stroke-width="3" />
      <!-- Royal Ribbon Bow -->
      <ellipse cx="400" cy="540" rx="55" ry="24" fill="#DC2626" />
      <circle cx="400" cy="540" r="18" fill="#F59E0B" />
    `;
  } else if (silhouette === 'butterfly-wings') {
    // Siluet Sayap Kupu-Kupu
    bodySvg = `
      <!-- Left Upper Wing -->
      <path d="M 400,430 C 350,300 150,160 90,260 C 50,330 90,440 230,480 C 310,500 370,460 400,430 Z" fill="${primary}" filter="url(#dropShadow)" />
      <path d="M 390,420 C 340,310 170,200 120,280 C 90,330 130,410 240,450 Z" fill="#ffffff" opacity="0.3" />
      <!-- Right Upper Wing -->
      <path d="M 400,430 C 450,300 650,160 710,260 C 750,330 710,440 570,480 C 490,500 430,460 400,430 Z" fill="${primary}" filter="url(#dropShadow)" />
      <path d="M 410,420 C 460,310 630,200 680,280 C 710,330 670,410 560,450 Z" fill="#ffffff" opacity="0.3" />
      <!-- Central Floral Bouquet -->
      <g>
        ${generateFlowerCluster(primary, 400, 390, 140)}
      </g>
      <!-- Lower Body Wrapper -->
      <path d="M 330,490 L 350,730 L 450,730 L 470,490 Z" fill="#18181B" filter="url(#dropShadow)" />
      <ellipse cx="400" cy="520" rx="45" ry="18" fill="#FDE047" />
    `;
  } else if (silhouette === 'star-shape') {
    // Siluet Bintang 5 Sudut
    bodySvg = `
      <!-- Five Point Star Contour -->
      <path d="M 400,120 L 470,300 L 670,320 L 510,440 L 560,630 L 400,520 L 240,630 L 290,440 L 130,320 L 330,300 Z" fill="${primary}" filter="url(#dropShadow)" />
      <path d="M 400,160 L 455,310 L 615,330 L 490,425 L 530,580 L 400,490 L 270,580 L 310,425 L 185,330 L 345,310 Z" fill="#18181B" opacity="0.75" />
      <!-- Floral Center -->
      <g>
        ${generateFlowerCluster(primary, 400, 380, 130)}
      </g>
      <!-- Stem Handle -->
      <path d="M 360,570 L 375,740 L 425,740 L 440,570 Z" fill="#D97706" />
      <circle cx="400" cy="580" r="22" fill="#FDE047" />
    `;
  } else if (silhouette === 'fan-shape') {
    // Siluet Kipas Jepang
    bodySvg = `
      <!-- Fan Arc Base -->
      <path d="M 400,670 L 140,320 C 220,180 580,180 660,320 Z" fill="${primary}" filter="url(#dropShadow)" />
      <!-- Fan Pleats / Creases -->
      <path d="M 400,670 L 220,240 M 400,670 L 310,200 M 400,670 L 400,190 M 400,670 L 490,200 M 400,670 L 580,240" stroke="#FEF08A" stroke-width="2.5" opacity="0.7" />
      <!-- Floral Crown along Fan Arc -->
      <g>
        ${generateFlowerCluster(primary, 400, 270, 170)}
      </g>
      <!-- Japanese Silk Tassel Handle -->
      <ellipse cx="400" cy="670" rx="35" ry="16" fill="#F59E0B" />
      <path d="M 390,680 L 385,760 M 400,680 L 400,770 M 410,680 L 415,760" stroke="#F59E0B" stroke-width="4" />
    `;
  } else if (silhouette === 'cone-waffle') {
    // Siluet Waffle Cone
    bodySvg = `
      <!-- Waffle Cone Wrapper -->
      <path d="M 400,740 L 250,380 L 550,380 Z" fill="#D97706" filter="url(#dropShadow)" />
      <!-- Waffle Grid Lines -->
      <g stroke="#92400E" stroke-width="2.5" opacity="0.6">
        <line x1="280" y1="420" x2="430" y2="700" />
        <line x1="330" y1="400" x2="470" y2="650" />
        <line x1="380" y1="390" x2="510" y2="600" />
        <line x1="520" y1="420" x2="370" y2="700" />
        <line x1="470" y1="400" x2="330" y2="650" />
        <line x1="420" y1="390" x2="290" y2="600" />
      </g>
      <!-- Ice Cream Scoop Flower Head -->
      <g>
        ${generateFlowerCluster(primary, 400, 310, 160)}
      </g>
      <!-- Pastel Wrapper Band -->
      <rect x="280" y="440" width="240" height="28" rx="6" fill="#FDF2F8" stroke="#F472B6" stroke-width="2" />
    `;
  } else if (silhouette === 'barrel-tub') {
    // Siluet Tong Kayu Barrel (One Piece / Rustic)
    bodySvg = `
      <!-- Wooden Barrel Body -->
      <path d="M 230,340 C 200,470 200,560 230,680 L 570,680 C 600,560 600,470 570,340 Z" fill="#78350F" filter="url(#dropShadow)" />
      <!-- Barrel Steel Hoops -->
      <path d="M 215,420 C 340,435 460,435 585,420" stroke="#1C1917" stroke-width="12" fill="none" />
      <path d="M 220,600 C 340,615 460,615 580,600" stroke="#1C1917" stroke-width="12" fill="none" />
      <!-- Barrel Staves Lines -->
      <path d="M 300,340 L 300,680 M 370,340 L 370,680 M 430,340 L 430,680 M 500,340 L 500,680" stroke="#451A03" stroke-width="3" />
      <!-- Top Floral Overflow -->
      <g>
        ${generateFlowerCluster(primary, 400, 290, 175)}
      </g>
      <!-- Straw Hat or Pirate Emblem -->
      <circle cx="400" cy="510" r="32" fill="#FDE047" stroke="#B45309" stroke-width="3" />
      <circle cx="400" cy="510" r="16" fill="#DC2626" />
    `;
  } else if (silhouette === 'cloud-dome') {
    // Siluet Awan / Fluffy Baby Breath
    bodySvg = `
      <!-- Fluffy Cloud Clusters Base -->
      <g filter="url(#dropShadow)">
        <circle cx="280" cy="330" r="85" fill="#F8FAFC" />
        <circle cx="520" cy="330" r="85" fill="#F8FAFC" />
        <circle cx="360" cy="240" r="95" fill="#F8FAFC" />
        <circle cx="440" cy="240" r="95" fill="#F8FAFC" />
        <circle cx="400" cy="340" r="120" fill="#F8FAFC" />
      </g>
      <!-- Floral Sprinkles -->
      <g>
        ${generateFlowerCluster(primary, 400, 310, 150)}
      </g>
      <!-- Soft Pastel Wrapper & Ribbon -->
      <path d="M 270,440 C 270,540 330,640 360,720 L 440,720 C 470,640 530,540 530,440 Z" fill="${primary}" filter="url(#dropShadow)" />
      <!-- Big Soft Bow -->
      <ellipse cx="400" cy="490" rx="55" ry="22" fill="#ffffff" />
      <circle cx="400" cy="490" r="16" fill="#F59E0B" />
      <path d="M 370,500 L 340,650 L 375,640 Z" fill="#ffffff" />
      <path d="M 430,500 L 460,650 L 425,640 Z" fill="#ffffff" />
    `;
  } else if (silhouette === 'handbag-purse') {
    // Siluet Tas Jinjing Florist Handbag
    bodySvg = `
      <!-- Pearl Handle Arch -->
      <path d="M 290,360 C 290,160 510,160 510,360" fill="none" stroke="#F8FAFC" stroke-width="18" stroke-linecap="round" filter="url(#dropShadow)" />
      <!-- Handbag Body Wrapper -->
      <path d="M 230,360 L 250,680 C 250,710 270,720 300,720 L 500,720 C 530,720 550,710 550,680 L 570,360 Z" fill="${primary}" filter="url(#dropShadow)" />
      <!-- Quilted Diamonds Stitching -->
      <g stroke="#ffffff" stroke-width="1.5" opacity="0.35">
        <line x1="260" y1="420" x2="540" y2="700" />
        <line x1="280" y1="370" x2="550" y2="640" />
        <line x1="540" y1="420" x2="260" y2="700" />
        <line x1="520" y1="370" x2="250" y2="640" />
      </g>
      <!-- Floral Bloom Spill from Handbag -->
      <g>
        ${generateFlowerCluster('#ffffff', 400, 310, 150)}
      </g>
      <!-- Gold Turnlock Clasp -->
      <rect x="375" y="450" width="50" height="32" rx="8" fill="#EAB308" stroke="#FEF08A" stroke-width="2" />
      <circle cx="400" cy="466" r="8" fill="#713F12" />
    `;
  } else {
    // Classic / Flared / Korean Pleat / Layered Origami Siluet Default
    bodySvg = `
      <!-- Back Wrapper Wings -->
      <path d="M 170,240 L 280,680 L 520,680 L 630,240 C 560,200 480,180 400,180 C 320,180 240,200 170,240 Z" fill="${primary}" filter="url(#dropShadow)" />
      <!-- Wing Highlights / Inner Layers -->
      <path d="M 210,260 L 300,680 L 500,680 L 590,260 C 530,220 460,205 400,205 C 340,205 270,220 210,260 Z" fill="#18181B" opacity="0.25" />
      <!-- Lush Floral Bouquet Core -->
      <g>
        ${generateFlowerCluster(primary, 400, 320, 165)}
      </g>
      <!-- Front Origami Collar Folds -->
      <path d="M 250,450 C 320,490 370,510 400,510 C 430,510 480,490 550,450 L 510,720 L 290,720 Z" fill="${primary}" filter="url(#dropShadow)" />
      <!-- Collar Inner Lapel -->
      <path d="M 310,480 L 400,540 L 490,480 L 460,710 L 340,710 Z" fill="#ffffff" opacity="0.2" />
      <!-- French Ribbon Bow -->
      <ellipse cx="400" cy="530" rx="55" ry="20" fill="#ffffff" />
      <circle cx="400" cy="530" r="16" fill="#F59E0B" />
      <path d="M 370,540 C 340,580 320,670 310,730 L 340,720 C 350,670 370,590 390,550 Z" fill="#ffffff" />
      <path d="M 430,540 C 460,580 480,670 490,730 L 460,720 C 450,670 430,590 410,550 Z" fill="#ffffff" />
    `;
  }

  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Drop Shadow Filter for Clean 3D Cutout -->
      <filter id="dropShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.32" />
      </filter>
      <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <!-- 100% TRANSPARENT CANVAS: ZERO BACKGROUND, ZERO TABLE, ZERO ROOM -->
    <g id="bouquet-cutout-object">
      ${bodySvg}
    </g>
  </svg>`;
}

// Helper untuk menghasilkan rangkaian bunga kelopak tajam & padat
function generateFlowerCluster(mainColor: string, cx: number, cy: number, radius: number): string {
  let res = '';
  const petals = 28;
  const colors = [mainColor, '#ffffff', mainColor, '#FDE047', mainColor, '#F472B6', '#F8FAFC'];

  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2;
    const r = (i % 3 === 0 ? 0.35 : i % 2 === 0 ? 0.65 : 0.95) * radius;
    const fx = cx + Math.cos(angle) * r;
    const fy = cy + Math.sin(angle) * r * 0.75;
    const sz = 24 + (i % 4) * 8;
    const color = colors[i % colors.length];

    res += `
      <circle cx="${fx}" cy="${fy}" r="${sz}" fill="${color}" stroke="#1f2937" stroke-width="1.5" stroke-opacity="0.15" />
      <circle cx="${fx}" cy="${fy}" r="${sz * 0.55}" fill="${color}" opacity="0.8" />
      <circle cx="${fx}" cy="${fy}" r="${sz * 0.22}" fill="#F59E0B" />
    `;
  }
  return res;
}

// Helper khusus rangkaian bunga bentuk hati
function generateHeartFlowers(mainColor: string, cx: number, cy: number): string {
  let res = '';
  const count = 38;
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    // Persamaan parametrik kurva hati
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const scale = 11;
    const fx = cx + hx * scale;
    const fy = cy + hy * scale;

    res += `
      <circle cx="${fx}" cy="${fy}" r="22" fill="${mainColor}" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.25" />
      <circle cx="${fx}" cy="${fy}" r="11" fill="#FEF08A" opacity="0.6" />
      <circle cx="${fx}" cy="${fy}" r="5" fill="#ffffff" />
    `;
  }
  return res;
}

export async function GET() {
  console.log('🚀 Memulai Pembuatan 101 Desain Buket PNG Transparan...');

  // 1. Pastikan folder output ada
  if (!fs.existsSync(KATALOG_DIR)) {
    fs.mkdirSync(KATALOG_DIR, { recursive: true });
  }

  const results: string[] = [];

  // 2. Tulis file TypeScript app/data/catalog100.ts agar website memiliki database 101 buket lengkap
  const tsContent = `export interface CatalogBouquet {
  id: string;
  name: string;
  category: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  categoryLabel: string;
  tag: string;
  colorName: string;
  colorHex: string;
  priceFormatted: string;
  description: string;
  tags: string[];
  imageUrl: string;
}

export const CATALOG_BOUQUETS: CatalogBouquet[] = ${JSON.stringify(
    CATALOG_ITEMS.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      categoryLabel: item.categoryLabel,
      tag: item.tag,
      colorName: item.colorName,
      colorHex: item.colorHex,
      priceFormatted: item.priceFormatted,
      description: item.description,
      tags: item.tags,
      imageUrl: item.imageUrl,
    })),
    null,
    2
  )};

export const CATALOG_CATEGORIES = [
  { id: 'all', label: '🌟 Semua Koleksi', count: 101 },
  { id: 'A', label: '🌹 Bunga Realistis', count: 22 },
  { id: 'B', label: '✨ Bentuk Unik', count: 20 },
  { id: 'C', label: '🍥 Anime & Karakter', count: 16 },
  { id: 'D', label: '🧸 Cute & Kawaii', count: 13 },
  { id: 'E', label: '👑 Luxury & Sultan', count: 13 },
  { id: 'F', label: '🎁 Gift & Snack Bouquet', count: 17 },
];
`;

  fs.writeFileSync(CATALOG_TS, tsContent, 'utf8');
  console.log('✓ Database catalog100.ts berhasil ditulis!');

  // 3. Hasilkan 101 file PNG Transparan Murni menggunakan Sharp
  for (const item of CATALOG_ITEMS) {
    const targetFile = path.join(KATALOG_DIR, `${item.id}.png`);
    const svgCode = generateBouquetSvg(item);

    try {
      const pngBuffer = await sharp(Buffer.from(svgCode))
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true,
          quality: 100,
        })
        .toBuffer();

      fs.writeFileSync(targetFile, pngBuffer);
      results.push(`✓ ${item.id}.png`);
    } catch (err: any) {
      console.error(`Gagal render ${item.id}:`, err);
      results.push(`✗ ${item.id}: ${err.message}`);
    }
  }

  console.log(`✅ Selesai memproses ${results.length} aset PNG transparan murni!`);

  return NextResponse.json({
    status: 'success',
    count: results.length,
    message: '101 Desain Buket PNG Transparan Murni berhasil dibuat & terdaftar!',
    generatedFiles: results.slice(0, 15),
  });
}
