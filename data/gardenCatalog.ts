export interface GardenFlowerDef {
  key: string;
  name: string;
  latinName: string;
  category: 'Mawar' | 'Tulip' | 'Lili & Anggrek' | 'Padang & Herba' | 'Tropis & Eksotis';
  image: string;
  meaning: string;
  colorHex: string;
  emoji: string;
  rarity: 'Umum' | 'Langka' | 'Epik' | 'Legendaris';
  fragrance: 'Lembut' | 'Semerbak' | 'Manis' | 'Segar';
  description: string;
}

export const GARDEN_40_FLOWERS: GardenFlowerDef[] = [
  // ── 1. KELUARGA MAWAR (7 JENIS) ──
  {
    key: 'rose_red',
    name: 'Mawar Merah Sejati',
    latinName: 'Rosa gallica rubra',
    category: 'Mawar',
    image: '/images/garden/rose_red.svg',
    meaning: 'Cinta Abadi & Gairah Jiwa',
    colorHex: '#E11D48',
    emoji: '🌹',
    rarity: 'Umum',
    fragrance: 'Semerbak',
    description: 'Tanaman mawar merah berakar kuat dengan duri pelindung dan mahkota kelopak merah beludru yang melambangkan komitmen cinta sejati.'
  },
  {
    key: 'rose_white',
    name: 'Mawar Putih Salju',
    latinName: 'Rosa alba celestial',
    category: 'Mawar',
    image: '/images/garden/rose_white.svg',
    meaning: 'Ketulusan Hati & Kesucian Janji',
    colorHex: '#F8FAFC',
    emoji: '🤍',
    rarity: 'Umum',
    fragrance: 'Lembut',
    description: 'Pohon mawar putih berdaun zamrud, pembawa ketenangan batin dan ketulusan niat.'
  },
  {
    key: 'rose_pink',
    name: 'Mawar Pink Pastel',
    latinName: 'Rosa centifolia doux',
    category: 'Mawar',
    image: '/images/garden/rose_pink.svg',
    meaning: 'Kelembutan Kasih & Rasa Syukur',
    colorHex: '#FB7185',
    emoji: '🌸',
    rarity: 'Umum',
    fragrance: 'Manis',
    description: 'Nuansa merah muda pastel yang merefleksikan keanggunan, rasa syukur, dan senyuman tulus.'
  },
  {
    key: 'rose_peach',
    name: 'Mawar Peach Anggun',
    latinName: 'Rosa floribunda pêche',
    category: 'Mawar',
    image: '/images/garden/rose_peach.svg',
    meaning: 'Kehangatan Batin & Keramahan',
    colorHex: '#FDBA74',
    emoji: '🍑',
    rarity: 'Langka',
    fragrance: 'Manis',
    description: 'Gradasi peach hangat yang menyejukkan pandangan, simbol kehangatan silaturahmi dan simpati.'
  },
  {
    key: 'rose_cream',
    name: 'Mawar Champagne Cream',
    latinName: 'Rosa odorata champagne',
    category: 'Mawar',
    image: '/images/garden/rose_cream.svg',
    meaning: 'Keanggunan Berkelas & Pesona Abadi',
    colorHex: '#FEF3C7',
    emoji: '🥂',
    rarity: 'Epik',
    fragrance: 'Lembut',
    description: 'Warna krem sampanye mewah yang memancarkan pesona aristokratik yang tenang.'
  },
  {
    key: 'rose_orange',
    name: 'Mawar Sunset Jingga',
    latinName: 'Rosa chinensis sunset',
    category: 'Mawar',
    image: '/images/garden/rose_orange.svg',
    meaning: 'Antusiasme & Semangat Membara',
    colorHex: '#FB923C',
    emoji: '🌅',
    rarity: 'Langka',
    fragrance: 'Segar',
    description: 'Pancaran jingga hangat bagai lembayung senja, menyuntikkan energi positif dan optimisme.'
  },
  {
    key: 'rose_yellow',
    name: 'Mawar Kuning Mentari',
    latinName: 'Rosa foetida solis',
    category: 'Mawar',
    image: '/images/garden/rose_yellow.svg',
    meaning: 'Persahabatan Tulus & Sukacita',
    colorHex: '#FBBF24',
    emoji: '💛',
    rarity: 'Umum',
    fragrance: 'Segar',
    description: 'Kuning keemasan bagai mentari fajar, simbol persahabatan sejati yang saling menguatkan.'
  },

  // ── 2. KELUARGA TULIP (4 JENIS) ──
  {
    key: 'tulip_pink',
    name: 'Tulip Pink Sutra',
    latinName: 'Tulipa gesneriana pastel',
    category: 'Tulip',
    image: '/images/garden/tulip_pink.svg',
    meaning: 'Kasih Sayang Murni & Janji Manis',
    colorHex: '#F472B6',
    emoji: '🌷',
    rarity: 'Umum',
    fragrance: 'Lembut',
    description: 'Tumbuh tegak dengan daun pita lebar dan piala kuncup merah muda yang menawan.'
  },
  {
    key: 'tulip_red',
    name: 'Tulip Merah Crimson',
    latinName: 'Tulipa suaveolens rubra',
    category: 'Tulip',
    image: '/images/garden/tulip_red.svg',
    meaning: 'Deklarasi Cinta Terbuka',
    colorHex: '#DC2626',
    emoji: '❤️',
    rarity: 'Langka',
    fragrance: 'Segar',
    description: 'Kilau merah tegas yang berani menyatakan perasaan tanpa ragu di bawah sinar fajar.'
  },
  {
    key: 'tulip_purple',
    name: 'Tulip Ungu Imperial',
    latinName: 'Tulipa humilis royale',
    category: 'Tulip',
    image: '/images/garden/tulip_purple.svg',
    meaning: 'Kemuliaan Jiwa & Martabat',
    colorHex: '#A855F7',
    emoji: '💜',
    rarity: 'Epik',
    fragrance: 'Lembut',
    description: 'Warna ungu ningrat yang eksklusif, melambangkan kebijaksanaan dan rasa hormat yang tinggi.'
  },
  {
    key: 'tulip_yellow',
    name: 'Tulip Kuning Mentari',
    latinName: 'Tulipa sylvestris aura',
    category: 'Tulip',
    image: '/images/garden/tulip_yellow.svg',
    meaning: 'Sinar Kebahagiaan Hidup',
    colorHex: '#FACC15',
    emoji: '✨',
    rarity: 'Umum',
    fragrance: 'Segar',
    description: 'Kelopak ceria yang mekar menyongsong cahaya musim semi dengan semangat baru.'
  },

  // ── 3. KELUARGA LILI & ANGGREK (5 JENIS) ──
  {
    key: 'orchid_pink',
    name: 'Anggrek Bulan Pink',
    latinName: 'Phalaenopsis amabilis rosea',
    category: 'Lili & Anggrek',
    image: '/images/garden/orchid_pink.svg',
    meaning: 'Keanggunan Luhur & Kesabaran',
    colorHex: '#EC4899',
    emoji: '🌸',
    rarity: 'Epik',
    fragrance: 'Semerbak',
    description: 'Anggrek tropis dengan daun tebal berdaging dan tangkai melengkung pembawa puspa pesona.'
  },
  {
    key: 'lily_white',
    name: 'Lili Casablanca Putih',
    latinName: 'Lilium candidum royal',
    category: 'Lili & Anggrek',
    image: '/images/garden/lily_white.svg',
    meaning: 'Kemurnian Jiwa & Martabat Mulia',
    colorHex: '#E2E8F0',
    emoji: '🤍',
    rarity: 'Langka',
    fragrance: 'Semerbak',
    description: 'Bunga terompet bintang putih bersih dengan benang sari keemasan yang megah.'
  },
  {
    key: 'lily_pink',
    name: 'Lili Pink Stargazer',
    latinName: 'Lilium orientalis stargazer',
    category: 'Lili & Anggrek',
    image: '/images/garden/lily_pink.svg',
    meaning: 'Kemakmuran & Cita-Cita Luhur',
    colorHex: '#F43F5E',
    emoji: '🌺',
    rarity: 'Langka',
    fragrance: 'Semerbak',
    description: 'Kelopak bertepikan putih dengan bintik karismatik yang menghadap langit kebun.'
  },
  {
    key: 'lily_orange',
    name: 'Lili Harimau Jingga',
    latinName: 'Lilium lancifolium ignis',
    category: 'Lili & Anggrek',
    image: '/images/garden/lily_orange.svg',
    meaning: 'Keberanian & Semangat Petualang',
    colorHex: '#EA580C',
    emoji: '🔥',
    rarity: 'Langka',
    fragrance: 'Segar',
    description: 'Corak eksotis menyala yang memancarkan energi keberanian untuk menghadapi rintangan.'
  },
  {
    key: 'calla_white',
    name: 'Calla Lily Arum',
    latinName: 'Zantedeschia aethiopica',
    category: 'Lili & Anggrek',
    image: '/images/garden/calla_white.svg',
    meaning: 'Keindahan Minimalis & Kelahiran Baru',
    colorHex: '#F1F5F9',
    emoji: '🌿',
    rarity: 'Legendaris',
    fragrance: 'Lembut',
    description: 'Siluet seludang putih meliuk anggun dengan tongkol emas menjulang dari daun panah tebal.'
  },

  // ── 4. PADANG & HERBA (15 JENIS) ──
  {
    key: 'sunflower',
    name: 'Bunga Matahari Pagi',
    latinName: 'Helianthus annuus radiant',
    category: 'Padang & Herba',
    image: '/images/garden/sunflower.svg',
    meaning: 'Loyalitas Teguh & Harapan Cerah',
    colorHex: '#F59E0B',
    emoji: '🌻',
    rarity: 'Umum',
    fragrance: 'Segar',
    description: 'Batang kokoh berbulu halus dengan piringan mahkota matahari emas yang setia menghadap surya.'
  },
  {
    key: 'hydrangea_blue',
    name: 'Hortensia Biru Langit',
    latinName: 'Hydrangea macrophylla azure',
    category: 'Padang & Herba',
    image: '/images/garden/hydrangea_blue.svg',
    meaning: 'Rasa Syukur & Kedamaian Batin',
    colorHex: '#38BDF8',
    emoji: '🪻',
    rarity: 'Langka',
    fragrance: 'Segar',
    description: 'Semak daun lebar rimbun bermahkota kubah bunga biru lembut bagai gumpalan awan pagi.'
  },
  {
    key: 'hydrangea_pink',
    name: 'Hortensia Pink Sutra',
    latinName: 'Hydrangea hortensia douce',
    category: 'Padang & Herba',
    image: '/images/garden/hydrangea_pink.svg',
    meaning: 'Kedekatan Emosional yang Tulus',
    colorHex: '#F472B6',
    emoji: '🌸',
    rarity: 'Langka',
    fragrance: 'Lembut',
    description: 'Rumpun bunga manis yang mencerminkan pelukan hangat dan keharmonisan keluarga.'
  },
  {
    key: 'hydrangea_purple',
    name: 'Hortensia Ungu Senja',
    latinName: 'Hydrangea serrata twilight',
    category: 'Padang & Herba',
    image: '/images/garden/hydrangea_purple.svg',
    meaning: 'Pemahaman Hati & Misteri Indah',
    colorHex: '#9333EA',
    emoji: '💜',
    rarity: 'Epik',
    fragrance: 'Lembut',
    description: 'Gradasi ungu mistis pembawa aura ketenangan yang mendalam saat matahari terbenam.'
  },
  {
    key: 'chrysanthemum_white',
    name: 'Krisan Putih Embun',
    latinName: 'Chrysanthemum morifolium nivea',
    category: 'Padang & Herba',
    image: '/images/garden/chrysanthemum_white.svg',
    meaning: 'Ketenteraman Jiwa & Panjang Umur',
    colorHex: '#CBD5E1',
    emoji: '🌼',
    rarity: 'Umum',
    fragrance: 'Segar',
    description: 'Kelopak tersusun rapat yang melambangkan keabadian, ketenangan pikiran, dan kebenaran.'
  },
  {
    key: 'chrysanthemum_pink',
    name: 'Krisan Pink Blossom',
    latinName: 'Chrysanthemum indicum roseum',
    category: 'Padang & Herba',
    image: '/images/garden/chrysanthemum_pink.svg',
    meaning: 'Kegembiraan Hari & Cinta Lembut',
    colorHex: '#F43F5E',
    emoji: '🌺',
    rarity: 'Umum',
    fragrance: 'Manis',
    description: 'Bunga semarak yang membawa tawa dan warna ceria ke setiap sudut taman cinta.'
  },
  {
    key: 'chrysanthemum_yellow',
    name: 'Krisan Emas Gemilang',
    latinName: 'Chrysanthemum coronarium aurum',
    category: 'Padang & Herba',
    image: '/images/garden/chrysanthemum_yellow.svg',
    meaning: 'Kejayaan & Rezeki Melimpah',
    colorHex: '#EAB308',
    emoji: '🌟',
    rarity: 'Umum',
    fragrance: 'Segar',
    description: 'Kilau emas mahkota krisan kuno, perlambang berkah, kemakmuran, dan kehormatan.'
  },
  {
    key: 'gerbera_red',
    name: 'Gerbera Merah Scarlet',
    latinName: 'Gerbera jamesonii rubra',
    category: 'Padang & Herba',
    image: '/images/garden/gerbera_red.svg',
    meaning: 'Keceriaan Spontan & Ketangguhan',
    colorHex: '#EF4444',
    emoji: '🌹',
    rarity: 'Umum',
    fragrance: 'Segar',
    description: 'Piringan kelopak tegas yang senantiasa tersenyum riang, penolak kesedihan dan lelah.'
  },
  {
    key: 'lavender',
    name: 'Lavender Provence',
    latinName: 'Lavandula angustifolia vera',
    category: 'Padang & Herba',
    image: '/images/garden/lavender.svg',
    meaning: 'Ketenangan Jiwa & Perlindungan',
    colorHex: '#A78BFA',
    emoji: '🪻',
    rarity: 'Langka',
    fragrance: 'Semerbak',
    description: 'Semak daun abu-abu keperakan dengan bulir bunga ungu beraroma semerbak penyejuk hati.'
  },
  {
    key: 'iris_purple',
    name: 'Iris Ungu Pelangi',
    latinName: 'Iris germanica violet',
    category: 'Padang & Herba',
    image: '/images/garden/iris_purple.svg',
    meaning: 'Kebijaksanaan & Pesan Harapan',
    colorHex: '#818CF8',
    emoji: '🦋',
    rarity: 'Langka',
    fragrance: 'Segar',
    description: 'Daun pedang tegak dengan mahkota ungu pelangi berjanggut kuning keemasan.'
  },
  {
    key: 'aster_purple',
    name: 'Aster Peacock Ungu',
    latinName: 'Symphyotrichum novae-angliae',
    category: 'Padang & Herba',
    image: '/images/garden/aster_purple.svg',
    meaning: 'Kesabaran & Keajaiban Cinta',
    colorHex: '#A855F7',
    emoji: '💜',
    rarity: 'Umum',
    fragrance: 'Lembut',
    description: 'Bunga bintang kecil yang mekar subur di padang rumput, simbol kesetiaan penuh kesabaran.'
  },
  {
    key: 'babysbreath_white',
    name: "Baby's Breath Murni",
    latinName: 'Gypsophila paniculata alba',
    category: 'Padang & Herba',
    image: '/images/garden/babysbreath_white.svg',
    meaning: 'Napas Cinta yang Abadi',
    colorHex: '#F8FAFC',
    emoji: '🤍',
    rarity: 'Umum',
    fragrance: 'Lembut',
    description: 'Rimbun ranting halus bertaburkan rintik bunga putih mungil bagai kabut bintang.'
  },
  {
    key: 'carnation_grace',
    name: 'Anyelir Anggun Kasih',
    latinName: 'Dianthus caryophyllus grace',
    category: 'Padang & Herba',
    image: '/images/garden/carnation_grace.svg',
    meaning: 'Kasih Ibu & Kekaguman Tulus',
    colorHex: '#FB7185',
    emoji: '💐',
    rarity: 'Langka',
    fragrance: 'Semerbak',
    description: 'Renda kelopak bergerigi khas yang melambangkan kehangatan asuhan dan pengorbanan suci.'
  },
  {
    key: 'daisy_meadow',
    name: 'Daisy Padang Rumput',
    latinName: 'Bellis perennis meadow',
    category: 'Padang & Herba',
    image: '/images/garden/daisy_meadow.svg',
    meaning: 'Kepolosan & Permulaan Bahagia',
    colorHex: '#FBBF24',
    emoji: '🌼',
    rarity: 'Umum',
    fragrance: 'Segar',
    description: 'Bunga liar putih berpusat emas yang mewakili kejujuran hati dan awal petualangan baru.'
  },
  {
    key: 'hydrangea_azure',
    name: 'Hortensia Azure Samudera',
    latinName: 'Hydrangea coerulea abyss',
    category: 'Padang & Herba',
    image: '/images/garden/hydrangea_azure.svg',
    meaning: 'Kedalaman Komitmen Hati',
    colorHex: '#0284C7',
    emoji: '🌊',
    rarity: 'Epik',
    fragrance: 'Segar',
    description: 'Biru pekat bagai palung samudera yang tenang, lambang keteguhan janji yang tak goyah.'
  },

  // ── 5. TROPIS & EKSOTIS (9 JENIS) ──
  {
    key: 'dahlia_orange',
    name: 'Dahlia Orange Api',
    latinName: 'Dahlia pinnata ignea',
    category: 'Tropis & Eksotis',
    image: '/images/garden/dahlia_orange.svg',
    meaning: 'Keteguhan Martabat & Karisma',
    colorHex: '#F97316',
    emoji: '🌺',
    rarity: 'Langka',
    fragrance: 'Manis',
    description: 'Geometri kelopak tersusun melingkar sempurna, simbol keunikan karakter dan daya tarik magis.'
  },
  {
    key: 'foxglove_purple',
    name: 'Foxglove Ungu Royal',
    latinName: 'Digitalis purpurea majalis',
    category: 'Tropis & Eksotis',
    image: '/images/garden/foxglove_purple.svg',
    meaning: 'Intuisi Rahasia & Misteri Hati',
    colorHex: '#C084FC',
    emoji: '🔔',
    rarity: 'Epik',
    fragrance: 'Lembut',
    description: 'Menara lonceng ungu bertitik magis yang menjulang anggun dari lantai kebun.'
  },
  {
    key: 'protea_pink',
    name: 'Protea Pink Mahkota Raja',
    latinName: 'Protea cynaroides rex',
    category: 'Tropis & Eksotis',
    image: '/images/garden/protea_pink.svg',
    meaning: 'Transformasi & Ketangguhan Mental',
    colorHex: '#FB7185',
    emoji: '👑',
    rarity: 'Legendaris',
    fragrance: 'Segar',
    description: 'Tanaman purba megah mahkota Afrika Selatan dengan daun kaku tebal dan braktea pink runcing.'
  },
  {
    key: 'ranunculus_pink',
    name: 'Ranunculus Pink Peony',
    latinName: 'Ranunculus asiaticus rose',
    category: 'Tropis & Eksotis',
    image: '/images/garden/ranunculus_pink.svg',
    meaning: 'Daya Pikat yang Memukau',
    colorHex: '#F472B6',
    emoji: '🏵️',
    rarity: 'Langka',
    fragrance: 'Lembut',
    description: 'Ratusan lapisan kelopak tipis seperti kertas sutra, memancarkan pesona magnetis tak terlupakan.'
  },
  {
    key: 'eucalyptus',
    name: 'Daun Silver Eucalyptus',
    latinName: 'Eucalyptus gunnii argentum',
    category: 'Tropis & Eksotis',
    image: '/images/garden/eucalyptus.svg',
    meaning: 'Penyembuhan Jiwa & Kesegaran',
    colorHex: '#34D399',
    emoji: '🌿',
    rarity: 'Umum',
    fragrance: 'Semerbak',
    description: 'Dedaunan bulat uang perak beraroma menthol menyegarkan, menyucikan atmosfer dan penat jiwa.'
  },
  {
    key: 'ruscus',
    name: 'Daun Ruscus Zamrud',
    latinName: 'Ruscus aculeatus smaragdus',
    category: 'Tropis & Eksotis',
    image: '/images/garden/ruscus.svg',
    meaning: 'Ketahanan Abadi & Daya Hidup',
    colorHex: '#10B981',
    emoji: '🍃',
    rarity: 'Umum',
    fragrance: 'Segar',
    description: 'Dedaunan hijau zamrud runcing yang kokoh dan tahan lama, fondasi rimbun kebun asri.'
  },
  {
    key: 'peony_royal',
    name: 'Peony Royal Permata',
    latinName: 'Paeonia lactiflora imperialis',
    category: 'Tropis & Eksotis',
    image: '/images/garden/peony_royal.svg',
    meaning: 'Kemakmuran & Romantisme Mewah',
    colorHex: '#F43F5E',
    emoji: '🌺',
    rarity: 'Legendaris',
    fragrance: 'Semerbak',
    description: 'Ratu bunga kekaisaran timur berdaun rimbun dengan kuncup mekar bergelombang mewah.'
  },
  {
    key: 'gypsophila_crystal',
    name: 'Gypsophila Kristal Biru',
    latinName: 'Gypsophila elegans celeste',
    category: 'Tropis & Eksotis',
    image: '/images/garden/gypsophila_crystal.svg',
    meaning: 'Keajaiban Tak Terduga & Kedamaian',
    colorHex: '#93C5FD',
    emoji: '✨',
    rarity: 'Langka',
    fragrance: 'Lembut',
    description: 'Rintik kristal es bunga biru lembut yang mempercantik setiap sudut kebun dengan keanggunan.'
  },
  {
    key: 'sakura_spring',
    name: 'Sakura Musim Semi',
    latinName: 'Prunus serrulata hanami',
    category: 'Tropis & Eksotis',
    image: '/images/garden/sakura_spring.svg',
    meaning: 'Pembaharuan Hidup & Keindahan Momen',
    colorHex: '#F9A8D4',
    emoji: '🌸',
    rarity: 'Legendaris',
    fragrance: 'Manis',
    description: 'Dahan kayu berliku dengan kuncup kelopak merah muda lima helai menyambut musim semi.'
  }
];

export const GARDEN_CATEGORIES = [
  'Semua',
  'Mawar',
  'Tulip',
  'Lili & Anggrek',
  'Padang & Herba',
  'Tropis & Eksotis'
] as const;

export function getFlowerByKey(key: string): GardenFlowerDef | undefined {
  return GARDEN_40_FLOWERS.find(f => f.key === key);
}
