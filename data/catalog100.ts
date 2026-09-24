export interface CatalogBouquet {
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

export const CATALOG_BOUQUETS: CatalogBouquet[] = [
  {
    "id": "real_mawar_merah",
    "name": "Romantic Velvet Red Rose",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Best Seller Mawar",
    "colorName": "Scarlet Red & Noir",
    "colorHex": "#DC2626",
    "priceFormatted": "Rp 285.000",
    "description": "Buket mawar merah scarlet beludru segar dalam balutan kertas hitam matte berlapis dengan pita satin merah merekah.",
    "tags": [
      "mawar",
      "merah",
      "romantis",
      "valentine",
      "anniversary"
    ],
    "imageUrl": "/images/katalog/real_mawar_merah.png"
  },
  {
    "id": "real_mawar_pink",
    "name": "Sweet Blush Pink Rose",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Pastel Aesthetic",
    "colorName": "Soft Pink Blush",
    "colorHex": "#EC4899",
    "priceFormatted": "Rp 275.000",
    "description": "Rangkaian mawar pink pastel lembut dengan balutan kertas nude cream dan pita organza sutra transparan.",
    "tags": [
      "mawar",
      "pink",
      "pastel",
      "ulang tahun",
      "manis"
    ],
    "imageUrl": "/images/katalog/real_mawar_pink.png"
  },
  {
    "id": "real_mawar_putih",
    "name": "Pure Casablanca White Rose",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Elegance Monokrom",
    "colorName": "Snow White & Silver",
    "colorHex": "#F8FAFC",
    "priceFormatted": "Rp 295.000",
    "description": "Mawar putih salju murni dengan sentuhan baby breath halus dalam kertas marmer putih mutiara berlis perak.",
    "tags": [
      "mawar",
      "putih",
      "elegan",
      "pernikahan",
      "sidang"
    ],
    "imageUrl": "/images/katalog/real_mawar_putih.png"
  },
  {
    "id": "real_mawar_peach",
    "name": "Warm Sunset Peach Rose",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Hangat & Menawan",
    "colorName": "Apricot Peach",
    "colorHex": "#FB923C",
    "priceFormatted": "Rp 280.000",
    "description": "Mawar peach jingga hangat berpadu daun eucalyptus perak dalam wrap cokelat nude keemasan.",
    "tags": [
      "mawar",
      "peach",
      "senja",
      "hangat",
      "wisuda"
    ],
    "imageUrl": "/images/katalog/real_mawar_peach.png"
  },
  {
    "id": "real_tulip_spring",
    "name": "Dutch Spring Meadow Tulip",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Eropa Klasik",
    "colorName": "Dutch Magenta & Sun",
    "colorHex": "#E11D48",
    "priceFormatted": "Rp 310.000",
    "description": "Bunga tulip segar Belanda dengan kelopak anggun menjulang dalam wrap kraft kertas berlipit rapi.",
    "tags": [
      "tulip",
      "musim semi",
      "belanda",
      "segar"
    ],
    "imageUrl": "/images/katalog/real_tulip_spring.png"
  },
  {
    "id": "real_lily_casablanca",
    "name": "Imperial White Lily Majesty",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Kemegahan Abadi",
    "colorName": "Royal White & Gold",
    "colorHex": "#FAFAF9",
    "priceFormatted": "Rp 340.000",
    "description": "Bunga lily Casablanca putih mekar megah bermahkota benang sari keemasan dengan aroma mewah semerbak.",
    "tags": [
      "lily",
      "lili",
      "putih",
      "mewah",
      "anggun"
    ],
    "imageUrl": "/images/katalog/real_lily_casablanca.png"
  },
  {
    "id": "real_daisy_meadow",
    "name": "Sunny Wild Daisy Meadow",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Ceria & Alami",
    "colorName": "Daisy White & Yellow",
    "colorHex": "#FACC15",
    "priceFormatted": "Rp 220.000",
    "description": "Kumpulan bunga daisy liar putih berbintik kuning matahari cerah dalam balutan kertas kraft cokelat vintage.",
    "tags": [
      "daisy",
      "bunga liar",
      "ceria",
      "sahabat"
    ],
    "imageUrl": "/images/katalog/real_daisy_meadow.png"
  },
  {
    "id": "real_baby_breath",
    "name": "White Cloud Eternal Baby Breath",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Awan Abadi",
    "colorName": "Cotton White",
    "colorHex": "#F1F5F9",
    "priceFormatted": "Rp 250.000",
    "description": "Gumpalan awan baby breath putih padat abadi dengan wrap kertas abu-abu soft dan pita rami rustic.",
    "tags": [
      "baby breath",
      "awan",
      "putih",
      "rustic",
      "wisuda"
    ],
    "imageUrl": "/images/katalog/real_baby_breath.png"
  },
  {
    "id": "real_sunflower_radiant",
    "name": "Radiant Sunshine Sunflower",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Semangat Wisuda",
    "colorName": "Golden Sunflower Yellow",
    "colorHex": "#EAB308",
    "priceFormatted": "Rp 265.000",
    "description": "Bunga matahari kuning cerah mekar merekah simbol optimisme dan kejayaan diiringi daun ruscus hijau.",
    "tags": [
      "matahari",
      "sunflower",
      "kuning",
      "wisuda",
      "semangat"
    ],
    "imageUrl": "/images/katalog/real_sunflower_radiant.png"
  },
  {
    "id": "real_peony_royal",
    "name": "Royal Empress Peony Bloom",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Ultra Luxury Peony",
    "colorName": "Magenta Peony Rose",
    "colorHex": "#BE185D",
    "priceFormatted": "Rp 380.000",
    "description": "Bunga peony berlapis-lapis tebal dengan gradasi pink magenta mewah berbalut kertas satin bergelombang.",
    "tags": [
      "peony",
      "pink",
      "mahal",
      "sultan",
      "mewah"
    ],
    "imageUrl": "/images/katalog/real_peony_royal.png"
  },
  {
    "id": "real_hydrangea_azure",
    "name": "Azure Sky French Hydrangea",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Biru Lembut",
    "colorName": "Hydrangea Azure Blue",
    "colorHex": "#38BDF8",
    "priceFormatted": "Rp 295.000",
    "description": "Hydrangea biru langit berbentuk bola bunga padat megah dengan kertas pembungkus putih mutiara.",
    "tags": [
      "hydrangea",
      "biru",
      "langit",
      "prancis",
      "adem"
    ],
    "imageUrl": "/images/katalog/real_hydrangea_azure.png"
  },
  {
    "id": "real_carnation_grace",
    "name": "Sweet Maternal Carnation Grace",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Hari Ibu & Kasih",
    "colorName": "Carnation Rose & Coral",
    "colorHex": "#FB7185",
    "priceFormatted": "Rp 235.000",
    "description": "Anyelir berenda lembut warna coral dan pink fuchsia penuh makna kasih sayang dan terima kasih tulus.",
    "tags": [
      "anyelir",
      "carnation",
      "ibu",
      "kasih",
      "pink"
    ],
    "imageUrl": "/images/katalog/real_carnation_grace.png"
  },
  {
    "id": "real_mix_flower_spring",
    "name": "Springtime Floral Symphony",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Campuran Harmonis",
    "colorName": "Multicolor Spring",
    "colorHex": "#F43F5E",
    "priceFormatted": "Rp 325.000",
    "description": "Harmoni paduan mawar, tulip, lili, daisy, dan krisan warna-warni yang memancarkan pesona kebun musim semi.",
    "tags": [
      "mix",
      "campuran",
      "warna-warni",
      "meriah",
      "lengkap"
    ],
    "imageUrl": "/images/katalog/real_mix_flower_spring.png"
  },
  {
    "id": "real_pastel_dream",
    "name": "Lavender Whisper Pastel Dream",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Dreamy Lavender",
    "colorName": "Pastel Lilac & Cream",
    "colorHex": "#C084FC",
    "priceFormatted": "Rp 290.000",
    "description": "Rangkaian mawar lilac pastel, hydrangea krem, dan aster ungu muda dalam balutan kertas sutra lavender.",
    "tags": [
      "pastel",
      "lavender",
      "ungu",
      "dreamy",
      "aesthetic"
    ],
    "imageUrl": "/images/katalog/real_pastel_dream.png"
  },
  {
    "id": "real_white_elegant",
    "name": "Monochrome Silver White Luxe",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Monokrom Anggun",
    "colorName": "Silver & Alabaster",
    "colorHex": "#E2E8F0",
    "priceFormatted": "Rp 330.000",
    "description": "Koleksi serba putih premium dari mawar putih, calla lily, dan aster salju dengan aksen pita perak mengkilap.",
    "tags": [
      "putih",
      "silver",
      "monokrom",
      "nikah",
      "mewah"
    ],
    "imageUrl": "/images/katalog/real_white_elegant.png"
  },
  {
    "id": "real_pink_aesthetic",
    "name": "Seoul Korean Pink Wave",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Korean Florist",
    "colorName": "Dusty Pink & Beige",
    "colorHex": "#F472B6",
    "priceFormatted": "Rp 295.000",
    "description": "Gaya buket florist Gangnam Seoul dengan kertas bergelombang tebal, sayap origami, dan mawar pink peach mekar.",
    "tags": [
      "korea",
      "pink",
      "seoul",
      "aesthetic",
      "kdrama"
    ],
    "imageUrl": "/images/katalog/real_pink_aesthetic.png"
  },
  {
    "id": "real_blue_ocean",
    "name": "Midnight Deep Ocean Blue",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Biru Safir",
    "colorName": "Ocean Navy & Sapphire",
    "colorHex": "#1D4ED8",
    "priceFormatted": "Rp 315.000",
    "description": "Mawar biru royal berpadu hydrangea sapphire dengan balutan kertas biru malam beraksen pita navy satin mengkilap.",
    "tags": [
      "biru",
      "ocean",
      "safir",
      "navy",
      "cowok"
    ],
    "imageUrl": "/images/katalog/real_blue_ocean.png"
  },
  {
    "id": "real_red_romantic",
    "name": "33 Stems Scarlet Passion",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "33 Mawar Merah",
    "colorName": "Deep Crimson Red",
    "colorHex": "#B91C1C",
    "priceFormatted": "Rp 420.000",
    "description": "33 tangkai mawar merah scarlet tebal melambangkan cinta mendalam tak tergantikan dalam wrap hitam bersayap.",
    "tags": [
      "33 mawar",
      "merah",
      "lamaran",
      "cinta",
      "valentine"
    ],
    "imageUrl": "/images/katalog/real_red_romantic.png"
  },
  {
    "id": "real_graduation_sun",
    "name": "Graduation Scholar Golden Bloom",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Edisi Wisuda",
    "colorName": "Sunflower Gold & Maroon",
    "colorHex": "#D97706",
    "priceFormatted": "Rp 285.000",
    "description": "Bunga matahari megah dengan pita wisuda, boneka mini bertoga hitam, dan kartu ucapan gelar sarjana.",
    "tags": [
      "wisuda",
      "kelulusan",
      "sarjana",
      "toga",
      "matahari"
    ],
    "imageUrl": "/images/katalog/real_graduation_sun.png"
  },
  {
    "id": "real_birthday_confetti",
    "name": "Birthday Fiesta Party Bloom",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Ulang Tahun",
    "colorName": "Fiesta Coral & Gold",
    "colorHex": "#F59E0B",
    "priceFormatted": "Rp 270.000",
    "description": "Rangkaian ceria berhias pin glitter Happy Birthday, mawar cerah, dan pita garis-garis festive meriah.",
    "tags": [
      "ulang tahun",
      "birthday",
      "pesta",
      "ceria"
    ],
    "imageUrl": "/images/katalog/real_birthday_confetti.png"
  },
  {
    "id": "real_luxury_emerald",
    "name": "Emerald Royale Botanical",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Hijau Zamrud",
    "colorName": "Emerald Green & Gold",
    "colorHex": "#047857",
    "priceFormatted": "Rp 350.000",
    "description": "Bunga putih murni di dalam balutan kain beludru hijau zamrud dengan bordir lis benang emas mewah.",
    "tags": [
      "emerald",
      "zamrud",
      "hijau",
      "sultan",
      "mewah"
    ],
    "imageUrl": "/images/katalog/real_luxury_emerald.png"
  },
  {
    "id": "real_minimalist_single",
    "name": "Wabi-Sabi Minimalist Ikebana",
    "category": "A",
    "categoryLabel": "Bunga Realistis",
    "tag": "Minimalis Jepang",
    "colorName": "Minimalist Oatmeal Beige",
    "colorHex": "#A8A29E",
    "priceFormatted": "Rp 195.000",
    "description": "Gaya seni bunga Jepang Ikebana bergaris tegas, tenang, dan bersih dengan satu kuntum mawar soliter sempurna.",
    "tags": [
      "minimalis",
      "jepang",
      "ikebana",
      "wabisabi",
      "simpel"
    ],
    "imageUrl": "/images/katalog/real_minimalist_single.png"
  },
  {
    "id": "unik_heart_shaped",
    "name": "Full Heart Red Velvet Silhouette",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Siluet Hati 3D",
    "colorName": "Crimson Heart Red",
    "colorHex": "#E11D48",
    "priceFormatted": "Rp 365.000",
    "description": "Buket berbentuk hati 3D sempurna tersusun dari 50 kuntum mawar merah rapat bergaris pinggir emas mengkilap.",
    "tags": [
      "hati",
      "heart",
      "cinta",
      "unik",
      "love"
    ],
    "imageUrl": "/images/katalog/unik_heart_shaped.png"
  },
  {
    "id": "unik_butterfly_wings",
    "name": "Morpho Butterfly Wings Bloom",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Sayap Kupu-Kupu",
    "colorName": "Morpho Cyan & Indigo",
    "colorHex": "#0284C7",
    "priceFormatted": "Rp 345.000",
    "description": "Kertas wrap berukir sepasang sayap kupu-kupu raksasa yang membentang anggun mengitari rangkaian bunga toska.",
    "tags": [
      "kupu-kupu",
      "butterfly",
      "sayap",
      "fantasi",
      "unik"
    ],
    "imageUrl": "/images/katalog/unik_butterfly_wings.png"
  },
  {
    "id": "unik_royal_crown",
    "name": "The Empress Imperial Crown",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Mahkota Sultan",
    "colorName": "Imperial Gold & Velvet",
    "colorHex": "#CA8A04",
    "priceFormatted": "Rp 395.000",
    "description": "Buket berstruktur mahkota kerajaan emas bertabur mutiara dengan pusat bunga mawar merah beludru bermahkota permata.",
    "tags": [
      "mahkota",
      "crown",
      "ratu",
      "sultan",
      "emas"
    ],
    "imageUrl": "/images/katalog/unik_royal_crown.png"
  },
  {
    "id": "unik_celestial_star",
    "name": "Starlight Celestial 5-Point Star",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Bintang Bintang",
    "colorName": "Star Yellow & Midnight",
    "colorHex": "#FBBF24",
    "priceFormatted": "Rp 330.000",
    "description": "Siluet bintang lima sudut geometris tajam berisi paduan baby breath kuning berkilau dan mawar putih.",
    "tags": [
      "bintang",
      "star",
      "kosmik",
      "unik",
      "geometris"
    ],
    "imageUrl": "/images/katalog/unik_celestial_star.png"
  },
  {
    "id": "unik_fan_oriental",
    "name": "Kyoto Golden Silk Fan",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Kipas Tradisional",
    "colorName": "Gold & Cherry Blossom",
    "colorHex": "#F43F5E",
    "priceFormatted": "Rp 320.000",
    "description": "Buket melebar anggun menyerupai kipas lipat sutra tradisional Jepang dengan untaian rumbai emas klasik.",
    "tags": [
      "kipas",
      "fan",
      "jepang",
      "oriental",
      "anggun"
    ],
    "imageUrl": "/images/katalog/unik_fan_oriental.png"
  },
  {
    "id": "unik_spiral_galaxy",
    "name": "Andromeda Spiral Helix Galaxy",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Spiral Galaksi",
    "colorName": "Nebula Purple & Teal",
    "colorHex": "#8B5CF6",
    "priceFormatted": "Rp 340.000",
    "description": "Susunan bunga memutar spiral aerodinamis mirip galaksi kosmik dengan wrap berputar dinamis memukau.",
    "tags": [
      "spiral",
      "galaksi",
      "futuristik",
      "modern"
    ],
    "imageUrl": "/images/katalog/unik_spiral_galaxy.png"
  },
  {
    "id": "unik_oversized_ribbon",
    "name": "Dramatic Oversized French Bow",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Pita Raksasa",
    "colorName": "Ruby Red Giant Bow",
    "colorHex": "#BE123C",
    "priceFormatted": "Rp 315.000",
    "description": "Buket dengan pita satin merah berukuran raksasa 40cm yang menjuntai dramatis menawan bagai gaun pesta.",
    "tags": [
      "pita besar",
      "bow",
      "dramatis",
      "merah",
      "cantik"
    ],
    "imageUrl": "/images/katalog/unik_oversized_ribbon.png"
  },
  {
    "id": "unik_asymmetrical_wave",
    "name": "Haute Couture Asymmetrical Pleat",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Asimetris Modern",
    "colorName": "Charcoal & Champagne",
    "colorHex": "#334155",
    "priceFormatted": "Rp 310.000",
    "description": "Desain lipatan kertas tinggi-rendah asimetris bergaya arsitektur fesyen Paris dengan sudut-sudut tegas modern.",
    "tags": [
      "asimetris",
      "couture",
      "modern",
      "arsitektur"
    ],
    "imageUrl": "/images/katalog/unik_asymmetrical_wave.png"
  },
  {
    "id": "unik_layered_origami",
    "name": "7-Layer Cascading Origami Fan",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Origami 7 Lapis",
    "colorName": "Nude, Rose & Gold",
    "colorHex": "#D97706",
    "priceFormatted": "Rp 325.000",
    "description": "Tujuh lapis kertas origami presisi bertingkat dengan warna harmonis membingkai rangkaian bunga layaknya karya seni.",
    "tags": [
      "origami",
      "berlapis",
      "tingkat",
      "kertas",
      "rapi"
    ],
    "imageUrl": "/images/katalog/unik_layered_origami.png"
  },
  {
    "id": "unik_cone_waffle",
    "name": "Gelato Waffle Cone Sweet Bloom",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Cone Es Krim",
    "colorName": "Waffle Tan & Pastel Pink",
    "colorHex": "#D97706",
    "priceFormatted": "Rp 275.000",
    "description": "Buket berbentuk corong cone es krim waffle raksasa bertekstur kotak-kotak dengan puncak bunga mekar warna pastel.",
    "tags": [
      "cone",
      "es krim",
      "waffle",
      "manis",
      "lucu"
    ],
    "imageUrl": "/images/katalog/unik_cone_waffle.png"
  },
  {
    "id": "unik_crystal_faceted",
    "name": "Geometric Prism Crystal Gem",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Kristal Prismatik",
    "colorName": "Diamond Iridescent",
    "colorHex": "#38BDF8",
    "priceFormatted": "Rp 355.000",
    "description": "Kertas kaku bersegi-segi prisma kristal dengan lapisan holografik memantulkan spektrum cahaya warna-warni.",
    "tags": [
      "kristal",
      "prisma",
      "geometris",
      "berlian"
    ],
    "imageUrl": "/images/katalog/unik_crystal_faceted.png"
  },
  {
    "id": "unik_handbag_purse",
    "name": "Chanel Style Florist Pearl Purse",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Bentuk Tas Jinjing",
    "colorName": "Noir Quilted & Pearl",
    "colorHex": "#18181B",
    "priceFormatted": "Rp 375.000",
    "description": "Buket berstruktur tas jinjing pesta bertekstur quilted dengan rantai pegangan mutiara elegan yang bisa ditenteng.",
    "tags": [
      "tas",
      "handbag",
      "purse",
      "mutiara",
      "fashion"
    ],
    "imageUrl": "/images/katalog/unik_handbag_purse.png"
  },
  {
    "id": "unik_picnic_basket",
    "name": "Provence Woven Rattan Basket",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Keranjang Rotan",
    "colorName": "Natural Rattan & Sage",
    "colorHex": "#854D0E",
    "priceFormatted": "Rp 290.000",
    "description": "Buket wadah keranjang rotan anyaman alami Provence dengan gagang melengkung penuh bunga mawar liar dan lavender.",
    "tags": [
      "keranjang",
      "rotan",
      "basket",
      "vintage",
      "pedesaan"
    ],
    "imageUrl": "/images/katalog/unik_picnic_basket.png"
  },
  {
    "id": "unik_cloud_fluffy",
    "name": "Cumulus Cotton Fluffy Cloud",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Awan Berbulu",
    "colorName": "Pure Fluffy White",
    "colorHex": "#F8FAFC",
    "priceFormatted": "Rp 280.000",
    "description": "Siluet awan gembul melayang terbuat dari paduan kapas murni dan baby breath salju berhias tetesan kristal transparan.",
    "tags": [
      "awan",
      "cloud",
      "kapas",
      "lembut",
      "fluffy"
    ],
    "imageUrl": "/images/katalog/unik_cloud_fluffy.png"
  },
  {
    "id": "unik_futuristic_neon",
    "name": "Cyberpunk 2077 Hologram Neon",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Cyberpunk Futuristik",
    "colorName": "Neon Magenta & Cyan",
    "colorHex": "#D946EF",
    "priceFormatted": "Rp 360.000",
    "description": "Wrap film holografik futuristik dengan garis neon menyala tajam dan mawar ungu elektrik berbalut akrilik modern.",
    "tags": [
      "cyberpunk",
      "futuristik",
      "neon",
      "hologram",
      "sci-fi"
    ],
    "imageUrl": "/images/katalog/unik_futuristic_neon.png"
  },
  {
    "id": "unik_sculptural_paper",
    "name": "Architectural Sculptural Wave",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Seni Patung Modern",
    "colorName": "Alabaster Architectural",
    "colorHex": "#78716C",
    "priceFormatted": "Rp 340.000",
    "description": "Lembaran kertas karton tebal melengkung bebas menyerupai instalasi seni museum dengan bunga anggrek terangkat anggun.",
    "tags": [
      "skulptur",
      "patung",
      "arsitektur",
      "seni"
    ],
    "imageUrl": "/images/katalog/unik_sculptural_paper.png"
  },
  {
    "id": "unik_geometric_hexagon",
    "name": "Modern Hexagon Prism Vessel",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Heksagon Geometris",
    "colorName": "Matte Obsidian & Copper",
    "colorHex": "#1E293B",
    "priceFormatted": "Rp 335.000",
    "description": "Wadah lipat bersudut heksagon simetris 6 sisi beraksen lis tembaga rose gold dengan bunga tertata rapi.",
    "tags": [
      "heksagon",
      "geometris",
      "prism",
      "sudut"
    ],
    "imageUrl": "/images/katalog/unik_geometric_hexagon.png"
  },
  {
    "id": "unik_transparent_glass",
    "name": "Lucite Crystal Floating Cylinder",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Mika Transparan",
    "colorName": "Crystal Clear & Rose",
    "colorHex": "#38BDF8",
    "priceFormatted": "Rp 320.000",
    "description": "Tabung mika bening tembus pandang 100% menampakkan keindahan batang bunga melayang di dalam kristal kaca.",
    "tags": [
      "transparan",
      "bening",
      "kaca",
      "mika",
      "minimalis"
    ],
    "imageUrl": "/images/katalog/unik_transparent_glass.png"
  },
  {
    "id": "unik_double_sided",
    "name": "Yin Yang Dualism Red & White",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Dua Sisi Kontras",
    "colorName": "Crimson Red & Pure White",
    "colorHex": "#991B1B",
    "priceFormatted": "Rp 350.000",
    "description": "Buket dua muka: separuh sisi mawar merah beludru kertas hitam, separuh sisi mawar putih salju kertas putih.",
    "tags": [
      "yinyang",
      "dua sisi",
      "kontras",
      "merah putih"
    ],
    "imageUrl": "/images/katalog/unik_double_sided.png"
  },
  {
    "id": "unik_gift_box_burst",
    "name": "Exploding Surprise Bloom Box",
    "category": "B",
    "categoryLabel": "Bentuk Unik",
    "tag": "Kotak Kado Merekah",
    "colorName": "Burgundy & Blush Silk",
    "colorHex": "#831843",
    "priceFormatted": "Rp 370.000",
    "description": "Kotak kado mewah dengan tutup terbuka di mana puluhan kuntum mawar merekah menyembur keluar menakjubkan.",
    "tags": [
      "gift box",
      "kotak kado",
      "kejutan",
      "merekah"
    ],
    "imageUrl": "/images/katalog/unik_gift_box_burst.png"
  },
  {
    "id": "anime_naruto_sage",
    "name": "Naruto Konoha Hokage Scroll",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Naruto Shippuden",
    "colorName": "Ninja Orange & Black",
    "colorHex": "#F97316",
    "priceFormatted": "Rp 330.000",
    "description": "Buket bertema ninja Konoha dengan wrap oranye-hitam, pusaran Uzumaki, daun ikat kepala, dan tali shinobi.",
    "tags": [
      "naruto",
      "anime",
      "hokage",
      "oranye",
      "konoha"
    ],
    "imageUrl": "/images/katalog/anime_naruto_sage.png"
  },
  {
    "id": "anime_onepiece_sunny",
    "name": "One Piece Thousand Sunny Barrel",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "One Piece Pirate",
    "colorName": "Straw Hat & Ocean Blue",
    "colorHex": "#EAB308",
    "priceFormatted": "Rp 340.000",
    "description": "Buket tong kapal Thousand Sunny kayu bertali tambang, topi jerami Luffy, dan bendera bajak laut ceria.",
    "tags": [
      "one piece",
      "luffy",
      "bajak laut",
      "anime",
      "topi jerami"
    ],
    "imageUrl": "/images/katalog/anime_onepiece_sunny.png"
  },
  {
    "id": "anime_demonslayer_kamado",
    "name": "Demon Slayer Tanjiro Haori Check",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Demon Slayer",
    "colorName": "Checkerboard Green & Black",
    "colorHex": "#15803D",
    "priceFormatted": "Rp 335.000",
    "description": "Wrap motif kotak-kotak hijau zamrud dan hitam khas haori Tanjiro dengan anting hanafuda dan pita merah membara.",
    "tags": [
      "demon slayer",
      "kimetsu",
      "tanjiro",
      "anime",
      "hijau"
    ],
    "imageUrl": "/images/katalog/anime_demonslayer_kamado.png"
  },
  {
    "id": "anime_jujutsu_domain",
    "name": "Jujutsu Kaisen Infinite Void",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Jujutsu Kaisen",
    "colorName": "Infinite Black & Cyan Neon",
    "colorHex": "#06B6D4",
    "priceFormatted": "Rp 345.000",
    "description": "Nuansa domain expansion Satoru Gojo serba hitam pekat dengan cahaya biru neon kosmik dan pita penutup mata.",
    "tags": [
      "jujutsu",
      "gojo",
      "satoru",
      "anime",
      "hitam"
    ],
    "imageUrl": "/images/katalog/anime_jujutsu_domain.png"
  },
  {
    "id": "anime_pokemon_master",
    "name": "Pokéball Champion Trainer Sphere",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Pokémon Trainer",
    "colorName": "Pokéball Red & White",
    "colorHex": "#EF4444",
    "priceFormatted": "Rp 320.000",
    "description": "Buket berbentuk bola Pokéball separuh merah menyala, separuh putih bersih dengan tombol tengah perak mengkilap.",
    "tags": [
      "pokemon",
      "pokeball",
      "anime",
      "trainer",
      "merah"
    ],
    "imageUrl": "/images/katalog/anime_pokemon_master.png"
  },
  {
    "id": "anime_stitch_tropical",
    "name": "Stitch Experiment 626 Aloha",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Stitch Disney",
    "colorName": "Hawaiian Cyan & Azure",
    "colorHex": "#0284C7",
    "priceFormatted": "Rp 325.000",
    "description": "Wrap biru kepulauan Hawaii dengan sepasang telinga Stitch menggemaskan dan pita bunga kembang sepatu tropis.",
    "tags": [
      "stitch",
      "aloha",
      "hawaii",
      "biru",
      "disney"
    ],
    "imageUrl": "/images/katalog/anime_stitch_tropical.png"
  },
  {
    "id": "anime_kuromi_gothic",
    "name": "Kuromi Gothic Lolita Punk",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Sanrio Kuromi",
    "colorName": "Gothic Purple & Jet Black",
    "colorHex": "#7C3AED",
    "priceFormatted": "Rp 335.000",
    "description": "Renda hitam lolita dan wrap lavender berhias lambang tengkorak Kuromi punk dan pita sayap kelelawar.",
    "tags": [
      "kuromi",
      "sanrio",
      "gothic",
      "ungu",
      "hitam"
    ],
    "imageUrl": "/images/katalog/anime_kuromi_gothic.png"
  },
  {
    "id": "anime_cinnamoroll_cloud",
    "name": "Cinnamoroll Sky Angel Wings",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Sanrio Cinnamoroll",
    "colorName": "Pastel Baby Blue & White",
    "colorHex": "#7DD3FC",
    "priceFormatted": "Rp 330.000",
    "description": "Wrap biru langit pastel lembut dengan sepasang telinga kelinci berbulu putih dan liontin bintang emas.",
    "tags": [
      "cinnamoroll",
      "sanrio",
      "biru",
      "awan",
      "kelinci"
    ],
    "imageUrl": "/images/katalog/anime_cinnamoroll_cloud.png"
  },
  {
    "id": "anime_hellokitty_red",
    "name": "Hello Kitty Princess Scarlet Bow",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Sanrio Hello Kitty",
    "colorName": "Princess Pink & Red Bow",
    "colorHex": "#F43F5E",
    "priceFormatted": "Rp 330.000",
    "description": "Wrap pink pastel dengan renda scallop putih, pita satin merah mengembang 3D dan liontin hati emas Sanrio.",
    "tags": [
      "hello kitty",
      "sanrio",
      "pink",
      "pita merah",
      "imut"
    ],
    "imageUrl": "/images/katalog/anime_hellokitty_red.png"
  },
  {
    "id": "anime_doraemon_bell",
    "name": "Doraemon 4D Pocket Robotic Bell",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Doraemon Classic",
    "colorName": "Robotic Blue & Yellow Bell",
    "colorHex": "#2563EB",
    "priceFormatted": "Rp 325.000",
    "description": "Wrap biru kobalt cerah dengan kalung pita merah berlonceng emas dan saku kantong ajaib 4D serbaguna.",
    "tags": [
      "doraemon",
      "lonceng",
      "biru",
      "kantong ajaib",
      "anime"
    ],
    "imageUrl": "/images/katalog/anime_doraemon_bell.png"
  },
  {
    "id": "anime_totoro_acorn",
    "name": "Totoro Woodland Spirit Acorn",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Studio Ghibli",
    "colorName": "Sage Green & Wooden Acorn",
    "colorHex": "#4D7C0F",
    "priceFormatted": "Rp 335.000",
    "description": "Kertas berserat hijau sage alami bertema roh hutan Ghibli dengan daun pakis dan gantungan biji pohon ek.",
    "tags": [
      "totoro",
      "ghibli",
      "hutan",
      "hijau",
      "acorn"
    ],
    "imageUrl": "/images/katalog/anime_totoro_acorn.png"
  },
  {
    "id": "anime_pikachu_spark",
    "name": "Pikachu Electric Volt Tail",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Pokémon Pikachu",
    "colorName": "Sunflower Yellow & Volt Black",
    "colorHex": "#EAB308",
    "priceFormatted": "Rp 325.000",
    "description": "Wrap kuning ceria dengan telinga runcing Pikachu hitam-kuning, pipi merah cerah, dan pita ekor petir.",
    "tags": [
      "pikachu",
      "pokemon",
      "kuning",
      "petir",
      "anime"
    ],
    "imageUrl": "/images/katalog/anime_pikachu_spark.png"
  },
  {
    "id": "anime_sailormoon_cosmic",
    "name": "Sailor Moon Cosmic Crescent Moon",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Sailor Moon",
    "colorName": "Cosmic Lilac & Navy Stars",
    "colorHex": "#8B5CF6",
    "priceFormatted": "Rp 345.000",
    "description": "Wrap anime magical girl berlipit ungu lilac & navy dengan bros liontin bulan sabit emas kristal bintang.",
    "tags": [
      "sailor moon",
      "bulan sabit",
      "magical girl",
      "anime",
      "lilac"
    ],
    "imageUrl": "/images/katalog/anime_sailormoon_cosmic.png"
  },
  {
    "id": "anime_boy_cool",
    "name": "Shonen Dark Hero Crimson Edge",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Shonen Anime",
    "colorName": "Blood Crimson & Jet Black",
    "colorHex": "#991B1B",
    "priceFormatted": "Rp 320.000",
    "description": "Buket bergaya anime aksi shonen dengan kombinasi wrap hitam karbon beraksen merah tajam dan pita edgy.",
    "tags": [
      "anime boy",
      "shonen",
      "hitam merah",
      "keren",
      "edgy"
    ],
    "imageUrl": "/images/katalog/anime_boy_cool.png"
  },
  {
    "id": "anime_girl_magical",
    "name": "Shojo Magical Starlight Princess",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Shojo Anime",
    "colorName": "Iridescent Pink & Star Gold",
    "colorHex": "#F472B6",
    "priceFormatted": "Rp 325.000",
    "description": "Buket romantis anime shojo bertabur pita kilau bintang, gradasi pink mutiara, dan mawar pastel merekah.",
    "tags": [
      "anime girl",
      "shojo",
      "magical",
      "pink",
      "bintang"
    ],
    "imageUrl": "/images/katalog/anime_girl_magical.png"
  },
  {
    "id": "anime_mascot_chibi",
    "name": "Chibi Kawaii Mascot Blossom",
    "category": "C",
    "categoryLabel": "Anime & Karakter",
    "tag": "Chibi Mascot",
    "colorName": "Pastel Coral & Lemon",
    "colorHex": "#FBBF24",
    "priceFormatted": "Rp 310.000",
    "description": "Buket berhias karakter maskot anime chibi lucu dengan senyum ceria di antara hamparan bunga krisan pastel.",
    "tags": [
      "chibi",
      "maskot",
      "lucu",
      "anime",
      "pastel"
    ],
    "imageUrl": "/images/katalog/anime_mascot_chibi.png"
  },
  {
    "id": "kawaii_teddy_plush",
    "name": "Honey Bear Fluffy Plushie",
    "category": "D",
    "categoryLabel": "Cute & Kawaii",
    "tag": "Boneka Beruang",
    "colorName": "Warm Honey & Caramel",
    "colorHex": "#B45309",
    "priceFormatted": "Rp 290.000",
    "description": "Boneka beruang teddy bear plushie cokelat hangat memeluk mawar krem lembut dalam balutan pita satin cokelat.",
    "tags": [
      "teddy",
      "beruang",
      "boneka",
      "lucu",
      "hangat"
    ],
    "imageUrl": "/images/katalog/kawaii_teddy_plush.png"
  },
  {
    "id": "kawaii_bunny_rabbit",
    "name": "Fluffy White Ear Bunny Blossom",
    "category": "D",
    "categoryLabel": "Cute & Kawaii",
    "tag": "Kelinci Imut",
    "colorName": "Marshmallow White & Pink",
    "colorHex": "#FCE7F3",
    "priceFormatted": "Rp 285.000",
    "description": "Buket dengan sepasang telinga kelinci putih tegak panjang berbulu lembut di antara kuntum mawar baby pink.",
    "tags": [
      "kelinci",
      "bunny",
      "pink",
      "putih",
      "telinga"
    ],
    "imageUrl": "/images/katalog/kawaii_bunny_rabbit.png"
  },
  {
    "id": "kawaii_kitty_paw",
    "name": "Playful Calico Kitty Paw Pad",
    "category": "D",
    "categoryLabel": "Cute & Kawaii",
    "tag": "Telapak Kucing",
    "colorName": "Cat Paw Pink & Cream",
    "colorHex": "#FDA4AF",
    "priceFormatted": "Rp 280.000",
    "description": "Aksen telapak kaki kucing paw pad pink kenyal menggemaskan berpadu mawar cerah dan pita lonceng kucing mini.",
    "tags": [
      "kucing",
      "kitty",
      "paw",
      "pawpad",
      "anabul"
    ],
    "imageUrl": "/images/katalog/kawaii_kitty_paw.png"
  },
  {
    "id": "kawaii_puppy_corgi",
    "name": "Cheerful Corgi Smile Bloom",
    "category": "D",
    "categoryLabel": "Cute & Kawaii",
    "tag": "Corgi Lucu",
    "colorName": "Corgi Golden & White",
    "colorHex": "#F59E0B",
    "priceFormatted": "Rp 285.000",
    "description": "Karakter corgi tersenyum bahagia dengan kuping segitiga berdiri di tengah rangkaian bunga matahari kuning cerah.",
    "tags": [
      "anjing",
      "puppy",
      "corgi",
      "anabul",
      "kuning"
    ],
    "imageUrl": "/images/katalog/kawaii_puppy_corgi.png"
  },
  {
    "id": "kawaii_panda_bamboo",
    "name": "Sleepy Baby Panda Bamboo",
    "category": "D",
    "categoryLabel": "Cute & Kawaii",
    "tag": "Panda Gembul",
    "colorName": "Monochrome Panda & Green",
    "colorHex": "#10B981",
    "priceFormatted": "Rp 290.000",
    "description": "Panda hitam putih gembul memeluk ranting bambu keberuntungan di antara bunga krisan putih salju.",
    "tags": [
      "panda",
      "bambu",
      "hijau",
      "lucu",
      "gembul"
    ],
    "imageUrl": "/images/katalog/kawaii_panda_bamboo.png"
  },
  {
    "id": "kawaii_froggy_green",
    "name": "Lucky Pond Froggy Prince",
    "category": "D",
    "categoryLabel": "Cute & Kawaii",
    "tag": "Katak Hijau",
    "colorName": "Pond Green & Mint",
    "colorHex": "#22C55E",
    "priceFormatted": "Rp 275.000",
    "description": "Katak hijau kawaii bermahkota daun teratai mungil dengan mata bulat ramah di tengah bunga daisy putih.",
    "tags": [
      "katak",
      "kodok",
      "frog",
      "hijau",
      "mint"
    ],
    "imageUrl": "/images/katalog/kawaii_froggy_green.png"
  },
  {
    "id": "kawaii_duck_yellow",
    "name": "Quacky Sunshine Rubber Duck",
    "category": "D",
    "categoryLabel": "Cute & Kawaii",
    "tag": "Bebek Kuning",
    "colorName": "Sunny Yellow & Orange Beak",
    "colorHex": "#FBBF24",
    "priceFormatted": "Rp 270.000",
    "description": "Bebek kuning ceria dengan paruh oranye imut di dalam balutan kertas polkadot cerah ceria.",
    "tags": [
      "bebek",
      "duck",
      "kuning",
      "polkadot",
      "ceria"
    ],
    "imageUrl": "/images/katalog/kawaii_duck_yellow.png"
  },
  {
    "id": "kawaii_mushroom_fairy",
    "name": "Fairy Red Toadstool Mushroom",
    "category": "D",
    "categoryLabel": "Cute & Kawaii",
    "tag": "Jamur Dongeng",
    "colorName": "Crimson Red & White Spots",
    "colorHex": "#DC2626",
    "priceFormatted": "Rp 280.000",
    "description": "Buket bertema negeri peri dengan ornamen jamur merah berbintik putih ala hutan dongeng magis.",
    "tags": [
      "jamur",
      "mushroom",
      "peri",
      "dongeng",
      "merah"
    ],
    "imageUrl": "/images/katalog/kawaii_mushroom_fairy.png"
  },
  {
    "id": "kawaii_cotton_candy",
    "name": "Marshmallow Candy Rainbow Cloud",
    "category": "D",
    "categoryLabel": "Cute & Kawaii",
    "tag": "Permen Kapas",
    "colorName": "Pastel Rainbow Swirl",
    "colorHex": "#F472B6",
    "priceFormatted": "Rp 285.000",
    "description": "Kombinasi bunga berwarna pastel permen kapas: baby pink, mint green, dan sky blue dengan pita lollipop.",
    "tags": [
      "permen kapas",
      "candy",
      "rainbow",
      "marshmallow",
      "manis"
    ],
    "imageUrl": "/images/katalog/kawaii_cotton_candy.png"
  },
  {
    "id": "kawaii_rainbow_pastel",
    "name": "Pastel Rainbow Bridge Harmony",
    "category": "D",
    "categoryLabel": "Cute & Kawaii",
    "tag": "Pelangi Pastel",
    "colorName": "7-Color Pastel Arc",
    "colorHex": "#818CF8",
    "priceFormatted": "Rp 295.000",
    "description": "Gradasi 7 warna pelangi lembut pastel dalam satu buket penuh harmoni kedamaian dan kebahagiaan.",
    "tags": [
      "pelangi",
      "rainbow",
      "pastel",
      "warna-warni"
    ],
    "imageUrl": "/images/katalog/kawaii_rainbow_pastel.png"
  },
  {
    "id": "kawaii_soft_cloud",
    "name": "Smiling Sky Cloud Starlight",
    "category": "D",
    "categoryLabel": "Cute & Kawaii",
    "tag": "Awan Tersenyum",
    "colorName": "Cloud White & Sky Azure",
    "colorHex": "#38BDF8",
    "priceFormatted": "Rp 275.000",
    "description": "Buket awan putih tersenyum ramah bertabur gantungan bintang emas kecil dan pita sutra biru langit.",
    "tags": [
      "awan",
      "cloud",
      "bintang",
      "langit",
      "lucu"
    ],
    "imageUrl": "/images/katalog/kawaii_soft_cloud.png"
  },
  {
    "id": "kawaii_glitter_star",
    "name": "Twinkle Golden Glitter Star",
    "category": "D",
    "categoryLabel": "Cute & Kawaii",
    "tag": "Bintang Berkilau",
    "colorName": "Glitter Gold & Butter Yellow",
    "colorHex": "#FDE047",
    "priceFormatted": "Rp 280.000",
    "description": "Buket berhias ornamen bintang kuning glitter berkilau dengan mawar kuning cerah dan pita satin berkilau.",
    "tags": [
      "bintang",
      "star",
      "glitter",
      "kuning",
      "kemilau"
    ],
    "imageUrl": "/images/katalog/kawaii_glitter_star.png"
  },
  {
    "id": "kawaii_cupid_heart",
    "name": "Cupid Winged Heart Pastel",
    "category": "D",
    "categoryLabel": "Cute & Kawaii",
    "tag": "Hati Sayap Malaikat",
    "colorName": "Cupid Pink & Angel White",
    "colorHex": "#FB7185",
    "priceFormatted": "Rp 290.000",
    "description": "Bentuk hati pink lembut bersayap malaikat putih mungil pembawa pesan cinta manis dari Cupid.",
    "tags": [
      "cupid",
      "hati",
      "sayap",
      "angel",
      "pink"
    ],
    "imageUrl": "/images/katalog/kawaii_cupid_heart.png"
  },
  {
    "id": "luxury_black_gold",
    "name": "24K Royal Noir Gold Leaf",
    "category": "E",
    "categoryLabel": "Luxury & Sultan",
    "tag": "Sultan Emas 24K",
    "colorName": "Matte Obsidian & 24K Gold",
    "colorHex": "#D97706",
    "priceFormatted": "Rp 450.000",
    "description": "Kertas wrap hitam beludru gelap berpadu mawar merah tua berlapis serpihan emas 24 karat murni.",
    "tags": [
      "emas",
      "gold",
      "hitam",
      "sultan",
      "mewah",
      "24k"
    ],
    "imageUrl": "/images/katalog/luxury_black_gold.png"
  },
  {
    "id": "luxury_white_gold",
    "name": "Imperial Carrara White & Gold",
    "category": "E",
    "categoryLabel": "Luxury & Sultan",
    "tag": "Marmer Emas",
    "colorName": "Carrara Marble & Gilded Edge",
    "colorHex": "#CA8A04",
    "priceFormatted": "Rp 420.000",
    "description": "Buket kertas motif marmer Italia Carrara putih dengan lis foil emas berkilau dan mawar putih mekar.",
    "tags": [
      "marmer",
      "putih",
      "emas",
      "imperial",
      "mewah"
    ],
    "imageUrl": "/images/katalog/luxury_white_gold.png"
  },
  {
    "id": "luxury_champagne",
    "name": "French Champagne Silk Elegance",
    "category": "E",
    "categoryLabel": "Luxury & Sultan",
    "tag": "Sampanye Mewah",
    "colorName": "Champagne Beige & Silk",
    "colorHex": "#D4A373",
    "priceFormatted": "Rp 390.000",
    "description": "Nuansa warna sampanye Prancis hangat berpadu kain sutra bertekstur lembut dan mawar nude karamel.",
    "tags": [
      "champagne",
      "sampanye",
      "sutra",
      "hangat",
      "mewah"
    ],
    "imageUrl": "/images/katalog/luxury_champagne.png"
  },
  {
    "id": "luxury_burgundy_wine",
    "name": "Bordeaux Burgundy Royal Velvet",
    "category": "E",
    "categoryLabel": "Luxury & Sultan",
    "tag": "Merah Wine",
    "colorName": "Bordeaux Burgundy & Gold",
    "colorHex": "#881337",
    "priceFormatted": "Rp 410.000",
    "description": "Kain beludru merah anggur Bordeaux pekat dengan pita sutra merah marun dan mawar merah gelap berkelas.",
    "tags": [
      "burgundy",
      "wine",
      "marun",
      "beludru",
      "mewah"
    ],
    "imageUrl": "/images/katalog/luxury_burgundy_wine.png"
  },
  {
    "id": "luxury_emerald_glam",
    "name": "Royal Emerald Green & Gilt",
    "category": "E",
    "categoryLabel": "Luxury & Sultan",
    "tag": "Zamrud Sultan",
    "colorName": "Emerald Green & Gold Thread",
    "colorHex": "#065F46",
    "priceFormatted": "Rp 430.000",
    "description": "Warna hijau zamrud kerajaan yang agung dibalut tali tambang emas kuno dan mawar krem bermahkota emas.",
    "tags": [
      "emerald",
      "zamrud",
      "hijau",
      "emas",
      "agung"
    ],
    "imageUrl": "/images/katalog/luxury_emerald_glam.png"
  },
  {
    "id": "luxury_midnight_navy",
    "name": "Midnight Sapphire Celestial Stars",
    "category": "E",
    "categoryLabel": "Luxury & Sultan",
    "tag": "Safir Bintang",
    "colorName": "Deep Sapphire & Star Gold",
    "colorHex": "#1E3A8A",
    "priceFormatted": "Rp 400.000",
    "description": "Wrap biru safir malam pekat berhias rasi bintang emas halus dan bunga mawar biru laut eksotis.",
    "tags": [
      "safir",
      "navy",
      "bintang",
      "emas",
      "mewah"
    ],
    "imageUrl": "/images/katalog/luxury_midnight_navy.png"
  },
  {
    "id": "luxury_matte_noir",
    "name": "Monolithic All-Matte Black Obsidian",
    "category": "E",
    "categoryLabel": "Luxury & Sultan",
    "tag": "Serba Hitam Matte",
    "colorName": "Triple Matte Black",
    "colorHex": "#09090B",
    "priceFormatted": "Rp 420.000",
    "description": "Keanggunan mutlak serba hitam: wrap hitam doff pekat, mawar hitam baccara, dan pita garis monokrom eksklusif.",
    "tags": [
      "hitam",
      "matte",
      "noir",
      "obsidian",
      "mewah"
    ],
    "imageUrl": "/images/katalog/luxury_matte_noir.png"
  },
  {
    "id": "luxury_velvet_plush",
    "name": "Ruby Plush Velvet Cascade",
    "category": "E",
    "categoryLabel": "Luxury & Sultan",
    "tag": "Beludru Ruby",
    "colorName": "Plush Ruby Velvet",
    "colorHex": "#9F1239",
    "priceFormatted": "Rp 415.000",
    "description": "Lapisan luar kain beludru tebal lembut anti-air dengan tekstur mewah saat disentuh membungkus mawar merah.",
    "tags": [
      "velvet",
      "beludru",
      "ruby",
      "mewah",
      "merah"
    ],
    "imageUrl": "/images/katalog/luxury_velvet_plush.png"
  },
  {
    "id": "luxury_satin_cascade",
    "name": "Cascading Italian Silk Ribbon",
    "category": "E",
    "categoryLabel": "Luxury & Sultan",
    "tag": "Pita Sutra Menjuntai",
    "colorName": "Blush Silk & Pure Rose",
    "colorHex": "#FB7185",
    "priceFormatted": "Rp 385.000",
    "description": "Pita sutra satin Italia selebar 8 cm yang menjuntai panjang anggun mengalir hingga ke bawah buket.",
    "tags": [
      "satin",
      "sutra",
      "pita panjang",
      "anggun",
      "mewah"
    ],
    "imageUrl": "/images/katalog/luxury_satin_cascade.png"
  },
  {
    "id": "luxury_pearl_garland",
    "name": "South Sea Pearl Garland Bloom",
    "category": "E",
    "categoryLabel": "Luxury & Sultan",
    "tag": "Untaian Mutiara",
    "colorName": "Lustrous Pearl & White Rose",
    "colorHex": "#E2E8F0",
    "priceFormatted": "Rp 460.000",
    "description": "Untaian mutiara laut berkilauan mengalungi kelopak mawar putih bersih dengan kemewahan putri bangsawan.",
    "tags": [
      "mutiara",
      "pearl",
      "putih",
      "kalung",
      "sultan"
    ],
    "imageUrl": "/images/katalog/luxury_pearl_garland.png"
  },
  {
    "id": "luxury_crystal_swarovski",
    "name": "Swarovski Crystal Dew Sparkle",
    "category": "E",
    "categoryLabel": "Luxury & Sultan",
    "tag": "Kristal Swarovski",
    "colorName": "Prism Diamond Sparkle",
    "colorHex": "#38BDF8",
    "priceFormatted": "Rp 480.000",
    "description": "Setiap kuntum mawar dihiasi butiran kristal prisma berkilau memantulkan kilauan cahaya layaknya berlian asli.",
    "tags": [
      "kristal",
      "swarovski",
      "berlian",
      "kemilau",
      "sultan"
    ],
    "imageUrl": "/images/katalog/luxury_crystal_swarovski.png"
  },
  {
    "id": "luxury_gold_leaf",
    "name": "Gilded 24K Gold Leaf Petals",
    "category": "E",
    "categoryLabel": "Luxury & Sultan",
    "tag": "Kelopak Emas Murni",
    "colorName": "24K Gold Leaf & Carmine",
    "colorHex": "#EAB308",
    "priceFormatted": "Rp 495.000",
    "description": "Tepian kelopak mawar dilapisi lembaran daun emas 24 karat murni yang tidak akan pudar selamanya.",
    "tags": [
      "gold leaf",
      "daun emas",
      "24k",
      "sultan",
      "termahal"
    ],
    "imageUrl": "/images/katalog/luxury_gold_leaf.png"
  },
  {
    "id": "luxury_giant_rose",
    "name": "Empress 15cm Ecuadorian Rose",
    "category": "E",
    "categoryLabel": "Luxury & Sultan",
    "tag": "Mawar Raksasa",
    "colorName": "Giant Scarlet Ecuadorian",
    "colorHex": "#BE123C",
    "priceFormatted": "Rp 450.000",
    "description": "Mawar Ekuador raksasa premium berdiameter 15 cm dengan mahkota kelopak tebal yang memukau mata.",
    "tags": [
      "mawar raksasa",
      "ecuador",
      "besar",
      "sultan",
      "mewah"
    ],
    "imageUrl": "/images/katalog/luxury_giant_rose.png"
  },
  {
    "id": "gift_ferrero_gold",
    "name": "Ferrero Rocher Golden Pyramid",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Cokelat Ferrero",
    "colorName": "Golden Hazelnut Foil",
    "colorHex": "#CA8A04",
    "priceFormatted": "Rp 365.000",
    "description": "Piramida 16 butir cokelat Ferrero Rocher emas berbalut mawar merah scarlet dan pita satin cokelat emas.",
    "tags": [
      "cokelat",
      "ferrero",
      "emas",
      "snack",
      "hadiah"
    ],
    "imageUrl": "/images/katalog/gift_ferrero_gold.png"
  },
  {
    "id": "gift_kinder_snack",
    "name": "Sweet Chocolate Bar Fiesta",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Snack Cokelat",
    "colorName": "Cadbury Purple & Silver",
    "colorHex": "#6B21A8",
    "priceFormatted": "Rp 275.000",
    "description": "Buket aneka cokelat batangan favorit (KitKat, Silverqueen, Cadbury) tersusun artistik dengan pita ceria.",
    "tags": [
      "cokelat",
      "snack",
      "jajanan",
      "silverqueen",
      "kitkat"
    ],
    "imageUrl": "/images/katalog/gift_kinder_snack.png"
  },
  {
    "id": "gift_candy_lollipop",
    "name": "Rainbow Chupa Chups Candy Fun",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Permen Lollipop",
    "colorName": "Rainbow Candy Swirl",
    "colorHex": "#EC4899",
    "priceFormatted": "Rp 220.000",
    "description": "Kumpulan permen lolipop warna-warni buah segar dengan wrap polkadot cerah kesukaan semua kalangan.",
    "tags": [
      "permen",
      "candy",
      "lollipop",
      "manis",
      "ceria"
    ],
    "imageUrl": "/images/katalog/gift_candy_lollipop.png"
  },
  {
    "id": "gift_teddy_couple",
    "name": "Wedding Bride & Groom Teddy",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Boneka Pengantin",
    "colorName": "Bridal White & Tuxedo Noir",
    "colorHex": "#F8FAFC",
    "priceFormatted": "Rp 340.000",
    "description": "Sepasang boneka beruang pengantin lengkap dengan tuksedo hitam dan gaun berenda putih di antara mawar salju.",
    "tags": [
      "boneka",
      "pengantin",
      "wedding",
      "teddy",
      "nikah"
    ],
    "imageUrl": "/images/katalog/gift_teddy_couple.png"
  },
  {
    "id": "gift_money_banknotes",
    "name": "Sultan Origami Money Bloom",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Buket Uang Asli",
    "colorName": "Red 100K Banknotes & Gold",
    "colorHex": "#DC2626",
    "priceFormatted": "Rp 380.000",
    "description": "Buket lembaran uang origami yang dibentuk menyerupai kuncup kelopak mawar mekar dengan pita emas mewah.",
    "tags": [
      "uang",
      "money bouquet",
      "rupiah",
      "sultan",
      "hadiah"
    ],
    "imageUrl": "/images/katalog/gift_money_banknotes.png"
  },
  {
    "id": "gift_korean_makeup",
    "name": "K-Beauty Glamour Makeup Bouquet",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Makeup & Kosmetik",
    "colorName": "Velvet Lip Tint Rose",
    "colorHex": "#E11D48",
    "priceFormatted": "Rp 395.000",
    "description": "Paket kosmetik Korea: lip tint beludru, cushion, blush on, dan maskara tertata cantik di antara bunga mawar.",
    "tags": [
      "makeup",
      "kosmetik",
      "kbeauty",
      "wanita",
      "cewek"
    ],
    "imageUrl": "/images/katalog/gift_korean_makeup.png"
  },
  {
    "id": "gift_glowing_skincare",
    "name": "Glow Up Skincare Radiance Kit",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Skincare Glowing",
    "colorName": "Serum Teal & Pure White",
    "colorHex": "#0D9488",
    "priceFormatted": "Rp 410.000",
    "description": "Set produk perawatan kulit glowing: serum hyaluronic, toner, dan pelembap berhias mawar putih bersih.",
    "tags": [
      "skincare",
      "glowing",
      "serum",
      "wanita",
      "perawatan"
    ],
    "imageUrl": "/images/katalog/gift_glowing_skincare.png"
  },
  {
    "id": "gift_french_perfume",
    "name": "Chanel French Fragrance Essence",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Parfum Mewah",
    "colorName": "Amber Crystal & Soft Rose",
    "colorHex": "#F59E0B",
    "priceFormatted": "Rp 435.000",
    "description": "Botol parfum kaca kristal Prancis elegan diletakkan sebagai pusat mahkota buket bunga beraroma memikat.",
    "tags": [
      "parfum",
      "perfume",
      "wangi",
      "mewah",
      "kado"
    ],
    "imageUrl": "/images/katalog/gift_french_perfume.png"
  },
  {
    "id": "gift_pashmina_hijab",
    "name": "Silk Pashmina Hijab Rosette",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Hijab Pashmina",
    "colorName": "Muted Rose & Silk Taupe",
    "colorHex": "#BE185D",
    "priceFormatted": "Rp 295.000",
    "description": "Kain hijab pashmina sutra premium dilipat dengan teknik origami membentuk kuntum mawar mekar sempurna.",
    "tags": [
      "hijab",
      "pashmina",
      "jilbab",
      "muslimah",
      "kado"
    ],
    "imageUrl": "/images/katalog/gift_pashmina_hijab.png"
  },
  {
    "id": "gift_mini_plushies",
    "name": "9-Kawaii Mini Plushies Family",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Banyak Boneka Mini",
    "colorName": "Multicolor Pastel Friends",
    "colorHex": "#F472B6",
    "priceFormatted": "Rp 310.000",
    "description": "Kumpulan 9 boneka mini plushie aneka karakter lucu menggemaskan tersenyum di antara kelopak bunga.",
    "tags": [
      "boneka mini",
      "plushies",
      "lucu",
      "banyak boneka"
    ],
    "imageUrl": "/images/katalog/gift_mini_plushies.png"
  },
  {
    "id": "gift_graduation_toga",
    "name": "Magna Cum Laude Bachelor Teddy",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Wisuda & Boneka Toga",
    "colorName": "Toga Black & Satin Maroon",
    "colorHex": "#991B1B",
    "priceFormatted": "Rp 320.000",
    "description": "Boneka beruang wisuda lengkap dengan topi toga, medali emas, tabung ijazah, dan selempang kelulusan.",
    "tags": [
      "wisuda",
      "kelulusan",
      "toga",
      "sarjana",
      "boneka"
    ],
    "imageUrl": "/images/katalog/gift_graduation_toga.png"
  },
  {
    "id": "gift_baby_newborn",
    "name": "Welcome Little Prince Newborn Hamper",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Kado Bayi Baru Lahir",
    "colorName": "Baby Azure & Cloud Cream",
    "colorHex": "#38BDF8",
    "priceFormatted": "Rp 295.000",
    "description": "Buket perlengkapan bayi mungil: sepatu rajut bayi, kaos kaki boneka, dan mainan kerincingan pastel.",
    "tags": [
      "bayi",
      "newborn",
      "melahirkan",
      "baby shower",
      "anak"
    ],
    "imageUrl": "/images/katalog/gift_baby_newborn.png"
  },
  {
    "id": "gift_coffee_artisan",
    "name": "Specialty Nusantara Drip Coffee Kit",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Kopi Nusantara",
    "colorName": "Espresso Dark & Burlap",
    "colorHex": "#451A03",
    "priceFormatted": "Rp 285.000",
    "description": "Buket sachet specialty drip coffee pilihan nusantara (Gayo, Toraja, Kintamani) dengan cangkir keramik rustic.",
    "tags": [
      "kopi",
      "coffee",
      "gayo",
      "cowok",
      "hadiah"
    ],
    "imageUrl": "/images/katalog/gift_coffee_artisan.png"
  },
  {
    "id": "gift_tea_blossom",
    "name": "Artisan Blooming Herbal Flower Tea",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Teh Bunga Herbal",
    "colorName": "Chamomile Yellow & Mint",
    "colorHex": "#84CC16",
    "priceFormatted": "Rp 275.000",
    "description": "Koleksi teh seduh bunga mekar (blooming tea ball, chamomile, french rose bud) dalam tabung kaca estetik.",
    "tags": [
      "teh",
      "tea",
      "herbal",
      "sehat",
      "chamomile"
    ],
    "imageUrl": "/images/katalog/gift_tea_blossom.png"
  },
  {
    "id": "gift_stationery_cute",
    "name": "Pastel Study Journal Stationery Kit",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Alat Tulis Estetik",
    "colorName": "Pastel Mint & Lilac",
    "colorHex": "#A78BFA",
    "priceFormatted": "Rp 265.000",
    "description": "Buket alat tulis estetik: pena gel pastel, washi tape motif bunga, sticky notes, dan highlighter pastel.",
    "tags": [
      "stationery",
      "alat tulis",
      "belajar",
      "sekolah",
      "lucu"
    ],
    "imageUrl": "/images/katalog/gift_stationery_cute.png"
  },
  {
    "id": "gift_fruit_fresh",
    "name": "Fresh Chocolate Dipped Strawberry Orchard",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Buah Segar & Cokelat",
    "colorName": "Ruby Strawberry & Dark Cocoa",
    "colorHex": "#BE123C",
    "priceFormatted": "Rp 350.000",
    "description": "Stroberi segar merah ranum berbalut cokelat Belgia manis dihiasi taburan kacang almond dan mawar pink.",
    "tags": [
      "buah",
      "stroberi",
      "cokelat",
      "segar",
      "enak"
    ],
    "imageUrl": "/images/katalog/gift_fruit_fresh.png"
  },
  {
    "id": "gift_anniversary_special",
    "name": "Golden 50th Diamond Jubilee Anniversary",
    "category": "F",
    "categoryLabel": "Gift & Snack",
    "tag": "Anniversary Spesial",
    "colorName": "Gilded Gold & Pure White",
    "colorHex": "#D97706",
    "priceFormatted": "Rp 480.000",
    "description": "Buket perayaan anniversary termegah dengan mawar putih murni, liontin angka emas, dan pita satin keemasan.",
    "tags": [
      "anniversary",
      "ulang tahun pernikahan",
      "emas",
      "istimewa"
    ],
    "imageUrl": "/images/katalog/gift_anniversary_special.png"
  }
];

export const CATALOG_CATEGORIES = [
  { id: 'all', label: '🌟 Semua Koleksi', count: 101 },
  { id: 'A', label: '🌹 Bunga Realistis', count: 22 },
  { id: 'B', label: '✨ Bentuk Unik', count: 20 },
  { id: 'C', label: '🍥 Anime & Karakter', count: 16 },
  { id: 'D', label: '🧸 Cute & Kawaii', count: 13 },
  { id: 'E', label: '👑 Luxury & Sultan', count: 13 },
  { id: 'F', label: '🎁 Gift & Snack Bouquet', count: 17 },
];
