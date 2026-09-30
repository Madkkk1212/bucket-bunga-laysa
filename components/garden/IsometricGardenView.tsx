'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, Droplets, Flame, Sparkles, Heart, Plus, 
  RotateCw, Share2, Search, X, Check, 
  Smartphone, ChevronRight, HelpCircle, Eye, Info,
  ZoomIn, ZoomOut, Compass, Crown,
  BookOpen, FastForward, Trash2, Scissors, Volume2, VolumeX, ShoppingBag
} from 'lucide-react';
import { useDesign } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { FLOWERS } from '@/data/flowers';
import PremiumUnlockModal from '@/components/designer/PremiumUnlockModal';
import { 
  GARDEN_40_FLOWERS, 
  GARDEN_CATEGORIES, 
  GardenFlowerDef, 
  getFlowerByKey,
  GARDEN_ORNAMENTS,
  GardenOrnamentDef,
  getOrnamentByKey
} from '@/data/gardenCatalog';
import { encryptGardenData, decryptGardenData } from '@/lib/cryptoGarden';

// ── Helper Waktu & Tahap Pertumbuhan Harian (Daily Streak Growth) ──
export function getTodayDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ── Nuansa Waktu Otomatis Berdasarkan Jam Komputer / HP ──
export function getSystemTimeOfDay(): 'day' | 'sunset' | 'night' {
  const hour = new Date().getHours();
  // Siang: 06:00 - 16:59
  if (hour >= 6 && hour < 17) return 'day';
  // Senja: 17:00 - 18:59 (Golden Hour)
  if (hour >= 17 && hour < 19) return 'sunset';
  // Malam: 19:00 - 05:59 (Malam Berpendar & Kunang-kunang)
  return 'night';
}

export function calculateGrowthStage(daysWatered: number): 1 | 2 | 3 | 4 {
  if (daysWatered >= 7) return 4; // Hari 7+: Puspa Cahaya Legendaris
  if (daysWatered >= 5) return 3; // Hari 5-6: Mekar Sempurna
  if (daysWatered >= 3) return 2; // Hari 3-4: Kuncup Bersemi
  return 1;                       // Hari 0-2: Bibit Tunas Mungil
}

// ── Types ──
export interface GardenTile {
  id: number;
  row: number;
  col: number;
  planted: boolean;
  isOrnament?: boolean;
  ornamentKey?: string;
  flowerKey?: string;
  flowerName?: string;
  flowerLatin?: string;
  flowerCategory?: string;
  flowerImage?: string;
  flowerColor?: string;
  growthStage?: 1 | 2 | 3 | 4; // 1: Bibit (Tunas), 2: Kuncup, 3: Mekar Sempurna, 4: Puspa Cahaya
  waterCount?: number;         // Total frekuensi penyiraman
  daysWatered?: number;        // Akumulasi HARI disiram (1-7+)
  lastWateredDate?: string;    // Tanggal terakhir disiram YYYY-MM-DD
  wateredToday?: boolean;
  lastWateredTime?: string;
  plantedAt?: string;
}

export interface PlacedDecoration {
  id: string;
  ornamentKey: string;
  name: string;
  x: number; // in pixels on the 410px island surface (-30 to 385)
  y: number; // in pixels on the 410px island surface (-30 to 385)
}

export const DEFAULT_PLACED_DECORATIONS: PlacedDecoration[] = [
  { id: 'deco-arch', ornamentKey: 'ornament_arch', name: 'Gapura Mawar', x: 177, y: -24 },
  { id: 'deco-fountain', ornamentKey: 'ornament_fountain', name: 'Air Mancur', x: 177, y: 378 },
  { id: 'deco-bench', ornamentKey: 'ornament_bench', name: 'Bangku Kayu', x: -24, y: 177 },
  { id: 'deco-lantern', ornamentKey: 'ornament_lantern', name: 'Lentera Peri', x: 378, y: 177 },
  { id: 'deco-cat', ornamentKey: 'ornament_cat', name: 'Si Mpus', x: 340, y: 30 },
];

// ── Bunga Hasil Petik untuk Studio Buket ──
export interface HarvestedFlowerItem {
  uid: string;
  flowerKey: string;
  flowerName: string;
  flowerLatin?: string;
  flowerImage: string;
  flowerColor: string;
  stage: 3 | 4;
  harvestedAt: string;
}

// ── Web Audio Nature Synthesizer (Zero Network, Pure Organic Soundscapes) ──
class GardenSoundscape {
  private ctx: AudioContext | null = null;
  private timer: number | null = null;
  private activeTime: 'day' | 'sunset' | 'night' = 'day';

  public start(time: 'day' | 'sunset' | 'night') {
    this.activeTime = time;
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.loopSound();
    } catch {}
  }

  public setTime(time: 'day' | 'sunset' | 'night') {
    this.activeTime = time;
  }

  public stop() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ctx) {
      try { this.ctx.close(); } catch {}
      this.ctx = null;
    }
  }

  private loopSound() {
    this.playEffect();
    this.timer = window.setInterval(() => {
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.playEffect();
    }, 3400);
  }

  private playEffect() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.activeTime === 'day') {
      this.playChirp(now, 2600 + Math.random() * 400);
      if (Math.random() > 0.4) {
        setTimeout(() => {
          if (this.ctx) this.playChirp(this.ctx.currentTime, 3100 + Math.random() * 300);
        }, 180);
      }
    } else if (this.activeTime === 'sunset') {
      this.playWaterTrickle(now);
    } else {
      this.playCricket(now);
      if (Math.random() > 0.5) {
        this.playWindChime(now);
      }
    }
  }

  private playChirp(t: number, freq: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.35, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.85, t + 0.16);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.045, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  private playWaterTrickle(t: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(580, t + 0.12);
    gain.gain.setValueAtTime(0.035, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  private playCricket(t: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(4500, t);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.02, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.11);
  }

  private playWindChime(t: number) {
    if (!this.ctx) return;
    const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
    const f = freqs[Math.floor(Math.random() * freqs.length)];
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, t);
    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.75);
  }
}

export interface GardenNote {
  id: string;
  author: string;
  text: string;
  time: string;
}

interface SplashEffect {
  id: number;
  tileId: number;
  particles: Array<{ id: number; tx: number; ty: number; char: string }>;
}

// ── Visual Komponen Bibit Tunas Mungil (Stage 1: Mulai dari Kecil) ──
function SeedlingSproutVisual({ color = '#f43f5e', name = 'Bibit' }: { color?: string; name?: string }) {
  return (
    <div className="seedling-sprout-wrap" title={`${name} (Tahap Bibit Tunas Mungil)`}>
      <span className="plant-growth-badge badge-stage-1">🌱 Bibit</span>
      <svg viewBox="0 0 60 56" width="46" height="46" fill="none" className="seedling-sprout-svg" shapeRendering="geometricPrecision">
        {/* Tender Sprout Stem (Starts right at bottom center y=56) */}
        <path d="M30 56 Q29 40 30 26" stroke="#16a34a" strokeWidth="4" strokeLinecap="round"/>
        {/* Left Baby Leaf */}
        <path d="M30 38 C14 36 10 20 22 18 C30 24 30 36 30 38 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.2"/>
        <path d="M18 24 Q24 28 30 38" stroke="#86efac" strokeWidth="1" strokeLinecap="round"/>
        {/* Right Baby Leaf */}
        <path d="M30 36 C46 34 50 18 38 16 C30 22 30 34 30 36 Z" fill="#4ade80" stroke="#15803d" strokeWidth="1.2"/>
        <path d="M42 22 Q36 26 30 36" stroke="#bbf7d0" strokeWidth="1" strokeLinecap="round"/>
        {/* Tiny Colored Seedling Bud on top */}
        <circle cx="30" cy="20" r="5" fill={color} stroke="#ffffff" strokeWidth="1.2" />
        <circle cx="28.5" cy="18.5" r="1.5" fill="#ffffff" opacity="0.85"/>
        <path d="M26 24 Q30 27 34 24" stroke="#15803d" strokeWidth="1.2" fill="none"/>
      </svg>
    </div>
  );
}

// ── Visual Komponen Kuncup Tunas Muda (Stage 2: Kuncup Berkembang) ──
function BuddingPlantVisual({ color = '#f43f5e', name = 'Kuncup' }: { color?: string; name?: string }) {
  return (
    <div className="budding-plant-wrap" title={`${name} (Tahap Kuncup Mekar)`}>
      <span className="plant-growth-badge badge-stage-2">🌿 Kuncup</span>
      <svg viewBox="0 0 70 72" width="54" height="58" fill="none" className="budding-plant-svg" shapeRendering="geometricPrecision">
        {/* Taller Stem (Starts right at bottom center y=72) */}
        <path d="M35 72 Q34 48 35 28" stroke="#15803d" strokeWidth="4.5" strokeLinecap="round"/>
        {/* 4 Developing Leaves */}
        <path d="M35 58 Q18 56 14 44 Q26 42 35 52" fill="#16a34a" stroke="#14532d" strokeWidth="1.2"/>
        <path d="M35 48 Q52 46 56 34 Q44 32 35 42" fill="#22c55e" stroke="#14532d" strokeWidth="1.2"/>
        <path d="M35 38 Q20 34 18 24 Q28 24 35 32" fill="#4ade80" stroke="#15803d" strokeWidth="1"/>
        {/* Swelling Bud with Petal Tips */}
        <ellipse cx="35" cy="20" rx="10" ry="14" fill={color} stroke="#ffffff" strokeWidth="1.2" />
        {/* Green Calyx Sepals wrapping bud */}
        <path d="M27 24 C29 30 41 30 43 24 L35 32 Z" fill="#15803d"/>
        <path d="M35 8 L35 16" stroke="#ffffff" strokeWidth="1" opacity="0.6"/>
      </svg>
    </div>
  );
}

// ── Visual Komponen 5 Ornamen & Dekorasi Taman Abadi ──
function GardenOrnamentVisual({ 
  ornamentKey, 
  timeOfDay 
}: { 
  ornamentKey?: string; 
  timeOfDay: 'day' | 'sunset' | 'night';
}) {
  if (ornamentKey === 'ornament_fountain') {
    return (
      <div className="garden-ornament-wrap ornament-fountain" title="Air Mancur Cinta Klasik">
        <span className="plant-growth-badge badge-ornament">⛲ Air Mancur</span>
        <svg viewBox="0 0 80 80" width="70" height="70" fill="none" className="ornament-svg">
          <ellipse cx="40" cy="68" rx="34" ry="10" fill="#94a3b8" stroke="#475569" strokeWidth="2"/>
          <ellipse cx="40" cy="67" rx="30" ry="7" fill="#38bdf8" opacity="0.8"/>
          <path d="M36 68 L36 46 Q40 44 44 46 L44 68 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5"/>
          <ellipse cx="40" cy="46" rx="22" ry="6.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="2"/>
          <ellipse cx="40" cy="45" rx="18.5" ry="4.5" fill="#0284c7" opacity="0.85"/>
          <path d="M38 46 L38 28 Q40 26 42 28 L42 46 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5"/>
          <ellipse cx="40" cy="27" rx="10" ry="3.5" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5"/>
          <path d="M40 26 Q30 14 26 44" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
          <path d="M40 26 Q50 14 54 44" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85"/>
          <path d="M40 25 Q32 8 40 4 Q48 8 40 25" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <circle cx="26" cy="45" r="2" fill="#bae6fd" />
          <circle cx="54" cy="45" r="2" fill="#bae6fd" />
          <circle cx="40" cy="5" r="1.5" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  if (ornamentKey === 'ornament_bench') {
    return (
      <div className="garden-ornament-wrap ornament-bench" title="Bangku Kayu Romantis">
        <span className="plant-growth-badge badge-ornament">🪑 Bangku</span>
        <svg viewBox="0 0 80 80" width="70" height="70" fill="none" className="ornament-svg">
          <path d="M16 30 L64 30 L64 48 L16 48 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" rx="2"/>
          <line x1="20" y1="36" x2="60" y2="36" stroke="#d97706" strokeWidth="2"/>
          <line x1="20" y1="42" x2="60" y2="42" stroke="#d97706" strokeWidth="2"/>
          <polygon points="12,48 68,48 64,58 16,58" fill="#d97706" stroke="#78350f" strokeWidth="2"/>
          <path d="M40 46 C37 42 32 43 32 47 C32 52 40 56 40 56 C40 56 48 52 48 47 C48 43 43 42 40 46 Z" fill="#f43f5e" stroke="#be123c" strokeWidth="1"/>
          <path d="M16 58 L14 74" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M64 58 L66 74" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M22 58 L20 71" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M58 58 L60 71" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }

  if (ornamentKey === 'ornament_lantern') {
    const isGlowTime = timeOfDay === 'sunset' || timeOfDay === 'night';
    return (
      <div className={`garden-ornament-wrap ornament-lantern ${isGlowTime ? 'glow-active' : ''}`} title="Lentera Peri (Fairy Lamp)">
        <span className="plant-growth-badge badge-ornament">🏮 Lentera</span>
        <svg viewBox="0 0 80 80" width="70" height="70" fill="none" className="ornament-svg">
          <circle cx="40" cy="38" r={isGlowTime ? "24" : "14"} fill={isGlowTime ? "#fbbf24" : "#fef08a"} opacity={isGlowTime ? "0.6" : "0.25"} filter="blur(6px)"/>
          <path d="M40 76 L40 22" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M40 24 C40 14 54 14 54 22" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M48 22 L60 22 L58 38 L50 38 Z" fill={isGlowTime ? "#fbbf24" : "#fef08a"} stroke="#0f172a" strokeWidth="1.8"/>
          <polygon points="46,22 62,22 54,16" fill="#0f172a"/>
          <ellipse cx="54" cy="30" rx="2" ry="4" fill="#ea580c"/>
          <ellipse cx="54" cy="30" rx="1" ry="2.5" fill="#fef08a"/>
          <ellipse cx="40" cy="74" rx="8" ry="3" fill="#334155"/>
        </svg>
      </div>
    );
  }

  if (ornamentKey === 'ornament_cat') {
    return (
      <div className="garden-ornament-wrap ornament-cat" title="Kucing Putih Tidur">
        <span className="plant-growth-badge badge-ornament">🐱 Si Mpus</span>
        <svg viewBox="0 0 80 80" width="70" height="70" fill="none" className="ornament-svg">
          <ellipse cx="40" cy="66" rx="24" ry="7" fill="#86efac" opacity="0.6"/>
          <ellipse cx="40" cy="58" rx="16" ry="11" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5"/>
          <ellipse cx="26" cy="54" rx="9" ry="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5"/>
          <polygon points="20,49 22,42 26,47" fill="#f43f5e" stroke="#cbd5e1" strokeWidth="1"/>
          <polygon points="27,47 31,43 33,49" fill="#f43f5e" stroke="#cbd5e1" strokeWidth="1"/>
          <path d="M22 55 Q24 57 26 55" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
          <circle cx="21" cy="57" r="1" fill="#f43f5e"/>
          <path d="M54 60 C58 56 62 48 58 44 C55 42 52 46 54 50" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <text x="14" y="38" fill="#6366f1" fontSize="10" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="18" y="30" fill="#818cf8" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Z</text>
        </svg>
      </div>
    );
  }

  // ornament_arch (Gapura Mawar)
  return (
    <div className="garden-ornament-wrap ornament-arch" title="Gapura Lengkung Mawar">
      <span className="plant-growth-badge badge-ornament">💐 Gapura Mawar</span>
      <svg viewBox="0 0 80 80" width="70" height="70" fill="none" className="ornament-svg">
        <path d="M20 74 L20 36 Q40 14 60 36 L60 74" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M25 72 L25 38 Q40 18 55 38 L55 72" stroke="#b45309" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <circle cx="20" cy="38" r="6" fill="#15803d"/>
        <circle cx="20" cy="38" r="4" fill="#f43f5e"/>
        <circle cx="28" cy="24" r="6" fill="#15803d"/>
        <circle cx="28" cy="24" r="4" fill="#fb7185"/>
        <circle cx="40" cy="18" r="7" fill="#15803d"/>
        <circle cx="40" cy="18" r="5" fill="#e11d48"/>
        <circle cx="52" cy="24" r="6" fill="#15803d"/>
        <circle cx="52" cy="24" r="4" fill="#fb7185"/>
        <circle cx="60" cy="38" r="6" fill="#15803d"/>
        <circle cx="60" cy="38" r="4" fill="#f43f5e"/>
      </svg>
    </div>
  );
}

// ── Initial 5x5 Grid Generator (Semua Bunga Dimulai dari Bibit Mungil / Stage 1) ──
function generateDefault5x5Grid(): GardenTile[] {
  const tiles: GardenTile[] = [];
  let id = 0;

  // Starter garden: Semua bunga mulai dari bibit mungil (stage 1)
  const starterPlanted: Record<string, string> = {
    '1,1': 'rose_red',
    '1,3': 'tulip_pink',
    '2,2': 'orchid_pink',
    '3,1': 'sunflower',
    '3,3': 'hydrangea_blue',
  };

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const coordKey = `${r},${c}`;
      const flowerKey = starterPlanted[coordKey];
      const flower = flowerKey ? getFlowerByKey(flowerKey) : undefined;

      tiles.push({
        id: id++,
        row: r,
        col: c,
        planted: !!flower,
        flowerKey: flower?.key,
        flowerName: flower?.name,
        flowerLatin: flower?.latinName,
        flowerCategory: flower?.category,
        flowerImage: flower?.image,
        flowerColor: flower?.colorHex,
        growthStage: 1, // SEMUA MULAI DARI BIBIT MUNGIL!
        waterCount: 0,
        daysWatered: 0,
        wateredToday: false,
        plantedAt: flower ? new Date().toISOString() : undefined,
      });
    }
  }
  return tiles;
}

export default function IsometricGardenView() {
  const { premiumUserName, isPremiumUnlocked, addFlower } = useDesign();
  const { isEn } = useLanguage();
  const [hasMounted, setHasMounted] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  // ── Fitur Suara Alam Imersif & Keranjang Hasil Petik Bunga ──
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const soundscapeRef = useRef<GardenSoundscape | null>(null);
  const [harvestedBasket, setHarvestedBasket] = useState<HarvestedFlowerItem[]>([]);
  const [isBasketDrawerOpen, setIsBasketDrawerOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  // ── Garden State ──
  const [gardenName, setGardenName] = useState('Kebun Cinta Laysa');
  const [partnerName, setPartnerName] = useState('Pasangan Bahagia');
  const [gardenCode, setGardenCode] = useState('LAY777');
  const [streakCount, setStreakCount] = useState(14);
  const [tiles, setTiles] = useState<GardenTile[]>(() => generateDefault5x5Grid());

  // ── Garden Naming State for VIP Sultan ──
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
  const [gardenNameDraft, setGardenNameDraft] = useState('');
  const [partnerNameDraft, setPartnerNameDraft] = useState('');

  useEffect(() => {
    if (!hasMounted) return;
    try {
      const isNamed = localStorage.getItem('bucket_garden_named');
      if (isPremiumUnlocked && !isNamed) {
        setGardenNameDraft(gardenName || 'Kebun Cinta Laysa');
        setPartnerNameDraft(partnerName || '');
        setIsNamingModalOpen(true);
      }
    } catch {}
  }, [hasMounted, isPremiumUnlocked, gardenName, partnerName]);

  const handleSaveGardenName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = gardenNameDraft.trim();
    if (!trimmed) {
      setToastMessage('Nama kebun bunga tidak boleh kosong! 🌸');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setGardenName(trimmed);
    const partnerTrimmed = partnerNameDraft.trim();
    if (partnerTrimmed) {
      setPartnerName(partnerTrimmed);
    }
    try {
      const existing = localStorage.getItem('bucket_garden_info_v3');
      let info: { name: string; partner: string; streak: number } = {
        name: trimmed,
        partner: partnerTrimmed || partnerName,
        streak: streakCount,
      };
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          info = {
            ...parsed,
            name: trimmed,
            partner: partnerTrimmed || parsed.partner || partnerName,
          };
        } catch {}
      }
      localStorage.setItem('bucket_garden_info_v3', JSON.stringify(info));
      localStorage.setItem('bucket_garden_named', 'true');
    } catch {}
    setIsNamingModalOpen(false);
    playSound('chime');
    setToastMessage(`Nama kebun disimpan: "${trimmed}" ✨`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [notes, setNotes] = useState<GardenNote[]>([
    {
      id: 'note-1',
      author: 'Laysa Florist',
      text: 'Selamat datang di Kebun Bunga 5x5! Setiap bunga dimulai dari bibit mungil. Siram setiap hari agar bertumbuh menjadi puspa cahaya 💕',
      time: 'Pagi ini'
    },
    {
      id: 'note-2',
      author: 'Pasangan',
      text: 'Bibit baru sudah ditanam di tanah subur! Semangat siram setiap hari ya 🌸💧',
      time: 'Kemarin'
    }
  ]);

  // ── UI Modals & Drawers ──
  const [targetTileId, setTargetTileId] = useState<number | null>(null);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [isDecorationModalOpen, setIsDecorationModalOpen] = useState(false);
  const [decorationSearchQuery, setDecorationSearchQuery] = useState('');
  const [inspectTile, setInspectTile] = useState<GardenTile | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLandscapeHintDismissed, setIsLandscapeHintDismissed] = useState(false);
  const [bgMode, setBgMode] = useState<'gemini' | 'sky'>('gemini');

  // ── Drag & Drop Free-Position Decorations (Bisa di Pinggir & di Sela-Sela Bunga) ──
  const [placedDecos, setPlacedDecos] = useState<PlacedDecoration[]>(DEFAULT_PLACED_DECORATIONS);
  const [activeDraggingDecoId, setActiveDraggingDecoId] = useState<string | null>(null);
  const [inspectDeco, setInspectDeco] = useState<PlacedDecoration | null>(null);

  const decoDragStateRef = useRef<{
    id: string;
    startPointer: { x: number; y: number };
    startX: number;
    startY: number;
    hasMoved: boolean;
  } | null>(null);

  // ── Extended Features State ──
  // Nuansa waktu otomatis sinkron dengan jam lokal (tanpa perlu diklik)
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>(() => getSystemTimeOfDay());
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const syncTime = () => {
      setTimeOfDay(getSystemTimeOfDay());
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hh}:${mm}`);
    };
    syncTime();
    const timer = setInterval(syncTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const [isHerbariumOpen, setIsHerbariumOpen] = useState(false);
  const [herbariumCategory, setHerbariumCategory] = useState<string>('Semua');
  const [herbariumDetailFlower, setHerbariumDetailFlower] = useState<GardenFlowerDef | null>(null);
  const [discoveredKeys, setDiscoveredKeys] = useState<Set<string>>(() => new Set(['rose_red', 'tulip_pink', 'orchid_pink', 'sunflower', 'hydrangea_blue']));

  // ── 360° Orbital Camera State (100% Persis dengan Tampilan Asli) ──
  const [yaw, setYaw] = useState(-45); // default -45 deg
  const [pitch, setPitch] = useState(60); // default 60 deg
  const [zoomScale, setZoomScale] = useState(1.0);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [isTopViewActive, setIsTopViewActive] = useState(false);

  // Drag tracking
  const isOrbitDraggingRef = useRef(false);
  const lastPointerPosRef = useRef({ x: 0, y: 0 });
  const dragDistanceRef = useRef(0);

  // Auto-spin animation loop
  useEffect(() => {
    if (!isAutoRotate) return;
    let frameId: number;
    const step = () => {
      setYaw(prev => (prev + 0.35) % 360);
      frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isAutoRotate]);

  // ── 40 Flower Filter & Search State & Ornaments ──
  const [seedPickerTab, setSeedPickerTab] = useState<'flowers' | 'ornaments'>('flowers');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ── Drag & Drop Touchscreen Watering State ──
  const [isDraggingWaterCan, setIsDraggingWaterCan] = useState(false);
  const [waterCanPos, setWaterCanPos] = useState<{ x: number; y: number } | null>(null);
  const [activeHoverTileId, setActiveHoverTileId] = useState<number | null>(null);
  const [waterDropParticles, setWaterDropParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  // ── Dynamic Live Water Splash & Bounce Physics ──
  const [wateredTileAnimations, setWateredTileAnimations] = useState<Set<number>>(new Set());
  const [splashEffects, setSplashEffects] = useState<SplashEffect[]>([]);

  const gardenContainerRef = useRef<HTMLDivElement>(null);
  const waterCanBtnRef = useRef<HTMLButtonElement>(null);
  const tileDomRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // ── Instant Web Audio Synthesizer ──
  const playSound = useCallback((type: 'splash' | 'plant' | 'click' | 'chime' | 'growth') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'splash') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(340, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.14, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === 'chime') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'growth') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      } else if (type === 'plant') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
        osc.start();
        osc.stop(ctx.currentTime + 0.14);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {}
  }, []);

  // Show Toast
  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3400);
  }, []);

  // ── Load & Initialize from Encrypted LocalStorage ──
  useEffect(() => {
    try {
      const savedGridRaw = localStorage.getItem('bucket_garden_5x5_grid_v3');
      const savedGardenInfo = localStorage.getItem('bucket_garden_info_v3');
      const savedDiscoveredRaw = localStorage.getItem('bucket_garden_discovered_keys');
      const todayStr = getTodayDateStr();

      if (savedDiscoveredRaw) {
        try {
          const keysArr: string[] = JSON.parse(savedDiscoveredRaw);
          setDiscoveredKeys(new Set(keysArr));
        } catch {}
      }

      if (savedGridRaw) {
        const parsedGrid: GardenTile[] = JSON.parse(savedGridRaw);
        const migratedGrid = parsedGrid.map(t => {
          let updated = { ...t };

          // Pastikan 25 petak tanah bersih HANYA untuk bunga (bila ada bekas ornamen, bersihkan ke petak kosong)
          if (t.isOrnament) {
            return {
              id: t.id,
              row: t.row,
              col: t.col,
              planted: false,
              growthStage: 1 as const,
              waterCount: 0,
              daysWatered: 0,
              wateredToday: false,
            };
          }

          if (t.planted && t.flowerKey) {
            const def = getFlowerByKey(t.flowerKey);
            if (def) {
              updated = {
                ...updated,
                flowerImage: def.image,
                flowerName: def.name,
                flowerLatin: def.latinName,
                flowerCategory: def.category,
                flowerColor: def.colorHex
              };
            }
          }
          // Daily streak logic: recalculate wateredToday according to today's date!
          const isToday = t.lastWateredDate === todayStr;
          const days = t.daysWatered !== undefined ? t.daysWatered : (t.growthStage === 4 ? 7 : t.growthStage === 3 ? 5 : t.growthStage === 2 ? 3 : 0);
          return {
            ...updated,
            wateredToday: isToday,
            daysWatered: days,
            growthStage: calculateGrowthStage(days)
          };
        });
        setTiles(migratedGrid);
      } else {
        const initial = generateDefault5x5Grid();
        setTiles(initial);
        localStorage.setItem('bucket_garden_5x5_grid_v3', JSON.stringify(initial));
      }

      // Load Free-Position Draggable Decorations
      const savedDecoRaw = localStorage.getItem('bucket_garden_placed_decorations_v2');
      if (savedDecoRaw) {
        try {
          const parsedDeco: PlacedDecoration[] = JSON.parse(savedDecoRaw);
          if (Array.isArray(parsedDeco) && parsedDeco.length > 0) {
            setPlacedDecos(parsedDeco);
          }
        } catch {}
      } else {
        setPlacedDecos(DEFAULT_PLACED_DECORATIONS);
        localStorage.setItem('bucket_garden_placed_decorations_v2', JSON.stringify(DEFAULT_PLACED_DECORATIONS));
      }

      // Load Keranjang Bunga Hasil Petik
      const savedBasketRaw = localStorage.getItem('bucket_garden_harvested_basket_v1');
      if (savedBasketRaw) {
        try {
          const parsedBasket = JSON.parse(savedBasketRaw);
          if (Array.isArray(parsedBasket)) setHarvestedBasket(parsedBasket);
        } catch {}
      }

      if (savedGardenInfo) {
        const info = JSON.parse(savedGardenInfo);
        if (info.name) setGardenName(info.name);
        if (info.partner) setPartnerName(info.partner);
        if (info.streak) setStreakCount(info.streak);
      }
    } catch {
      setTiles(generateDefault5x5Grid());
    }

    return () => {
      soundscapeRef.current?.stop();
    };
  }, []);

  // Sinkronisasi suasana audio dengan jam lokal saat berubah
  useEffect(() => {
    soundscapeRef.current?.setTime(timeOfDay);
  }, [timeOfDay]);

  // Update Herbarium Discovered Flowers whenever grid changes
  useEffect(() => {
    setDiscoveredKeys(prev => {
      const next = new Set(prev);
      tiles.forEach(t => {
        if (t.planted && t.flowerKey) next.add(t.flowerKey);
      });
      try {
        localStorage.setItem('bucket_garden_discovered_keys', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, [tiles]);

  // ── Save Tiles to Local Storage ──
  const updateTilesAndSave = useCallback((newTiles: GardenTile[]) => {
    setTiles(newTiles);
    try {
      localStorage.setItem('bucket_garden_5x5_grid_v3', JSON.stringify(newTiles));
    } catch (e) {
      console.warn('Storage save warning:', e);
    }
  }, []);

  // ── TRIGGER WATERING WITH DAILY STREAK LOGIC (PER HARI, BUKAN CEPAT MEKAR) ──
  const waterTile = useCallback((tileId: number) => {
    const todayStr = getTodayDateStr();
    let growthOccurred = false;
    let newStageReached: number | null = null;
    let targetFlowerName = 'Bunga';
    let alreadyWateredToday = false;
    let currentDaysCount = 0;

    setTiles(prev => {
      const updated = prev.map(t => {
        if (t.id === tileId && t.planted) {
          if (t.isOrnament) {
            targetFlowerName = t.flowerName || 'Ornamen';
            return {
              ...t,
              wateredToday: true,
              waterCount: (t.waterCount || 0) + 1,
              lastWateredDate: todayStr,
              lastWateredTime: new Date().toISOString()
            };
          }

          targetFlowerName = t.flowerName || 'Bunga';

          if (t.lastWateredDate === todayStr) {
            alreadyWateredToday = true;
            return t;
          }

          const currentDays = (t.daysWatered || 0) + 1;
          currentDaysCount = currentDays;
          const calculatedStage = calculateGrowthStage(currentDays);

          if (calculatedStage > (t.growthStage || 1)) {
            growthOccurred = true;
            newStageReached = calculatedStage;
          }

          return {
            ...t,
            waterCount: (t.waterCount || 0) + 1,
            daysWatered: currentDays,
            growthStage: calculatedStage,
            wateredToday: true,
            lastWateredDate: todayStr,
            lastWateredTime: new Date().toISOString()
          };
        }
        return t;
      });

      try {
        localStorage.setItem('bucket_garden_5x5_grid_v3', JSON.stringify(updated));
      } catch {}

      return updated;
    });

    // 1. Spring Physics Bounce & Sway
    setWateredTileAnimations(prev => new Set(prev).add(tileId));
    setTimeout(() => {
      setWateredTileAnimations(prev => {
        const next = new Set(prev);
        next.delete(tileId);
        return next;
      });
    }, 850);

    // 2. Live Water Splash & Soil Ripple
    const splashId = Date.now() + Math.random();
    const particles = [
      { id: 1, tx: -18, ty: -22, char: '💧' },
      { id: 2, tx: 18, ty: -24, char: '💧' },
      { id: 3, tx: -10, ty: -30, char: '✨' },
      { id: 4, tx: 12, ty: -28, char: '💧' },
      { id: 5, tx: 0, ty: -34, char: '✨' },
    ];
    setSplashEffects(prev => [...prev.slice(-6), { id: splashId, tileId, particles }]);
    setTimeout(() => {
      setSplashEffects(prev => prev.filter(s => s.id !== splashId));
    }, 700);

    // 3. Audio Feedback
    playSound('splash');

    if (alreadyWateredToday) {
      triggerToast(`💧 ${targetFlowerName} sudah disiram hari ini! Tanah masih segar & lembab. Kembali esok hari untuk melihat kuncup & mekarnya ya 💕`);
      return;
    }

    setTimeout(() => playSound(growthOccurred ? 'growth' : 'chime'), 100);

    const clickedTile = tiles.find(t => t.id === tileId);
    if (clickedTile && clickedTile.isOrnament) {
      triggerToast(`✨ Ornamen ${clickedTile.flowerName} dibersihkan dengan semprotan air segar! ⛲`);
      return;
    }

    if (alreadyWateredToday) {
      triggerToast(`🌱 ${targetFlowerName} sudah disiram dan segar hari ini! Tunggu esok hari agar tanah kembali siap menerima air 💕`);
      return;
    }

    // 4. Visual Feedback Toast Berdasarkan Progres Harian
    if (growthOccurred && newStageReached) {
      if (newStageReached === 2) {
        triggerToast(`🌿 Kuncup bunga mulai bersemi! (Hari ke-3 siraman harian). Terus rawat bersama pasangan ya!`);
      } else if (newStageReached === 3) {
        triggerToast(`🌸 MEKAR SEMPURNA! ${targetFlowerName} mekar indah di hari ke-5 berkat kesabaranmu!`);
      } else if (newStageReached === 4) {
        triggerToast(`✨ PUSPA CAHAYA LEGENDARIS! 7 Hari streak penuh tercapai! Kelopak bunga berkilau emas!`);
      }
    } else {
      triggerToast(`💧 Siraman harian hari ini berhasil! Tanaman semakin subur (Hari ke-${currentDaysCount}/7). Streak bertambah 🔥`);
    }
  }, [playSound, triggerToast, tiles]);

  // ── Simulasi Esok Hari (Fitur Mempercepat Hari untuk Testing / Pasangan) ──
  const handleSimulateNextDay = () => {
    const updated = tiles.map(t => ({
      ...t,
      wateredToday: false,
      lastWateredDate: '2000-01-01'
    }));
    updateTilesAndSave(updated);
    setStreakCount(s => {
      const next = s + 1;
      try {
        const infoRaw = localStorage.getItem('bucket_garden_info_v3');
        const info = infoRaw ? JSON.parse(infoRaw) : {};
        localStorage.setItem('bucket_garden_info_v3', JSON.stringify({ ...info, streak: next }));
      } catch {}
      return next;
    });
    playSound('growth');
    triggerToast('⏩ Hari telah berganti ke esok hari! Tanah mulai kering, silakan siram kembali untuk melanjutkan perkembangan bunga 🌱💧');
  };

  // ── PLANT A FLOWER (MULAI DARI BIBIT TUNAS MUNGIL) ──
  const handlePlantFlower = (flower: GardenFlowerDef) => {
    if (targetTileId === null) return;

    const newTiles = tiles.map(t => {
      if (t.id === targetTileId) {
        return {
          ...t,
          planted: true,
          isOrnament: false,
          ornamentKey: undefined,
          flowerKey: flower.key,
          flowerName: flower.name,
          flowerLatin: flower.latinName,
          flowerCategory: flower.category,
          flowerImage: flower.image,
          flowerColor: flower.colorHex,
          growthStage: 1 as const, // Selalu mulai dari Bibit Tunas Mungil!
          waterCount: 0,
          daysWatered: 0,
          wateredToday: false,
          plantedAt: new Date().toISOString()
        };
      }
      return t;
    });

    updateTilesAndSave(newTiles);
    setIsSeedModalOpen(false);
    setTargetTileId(null);
    playSound('plant');
    triggerToast(`🌱 Bibit ${flower.name} ditanam! Siram setiap hari agar bertumbuh menjadi puspa cahaya.`);
  };

  // ── PASANG ORNAMEN BARU KE KEBUN UNTUK DI-DRAG ──
  const handleAddOrnament = (ornament: GardenOrnamentDef) => {
    const newId = `deco-${Date.now()}`;
    const defaultCoords = [
      { x: 177, y: -24 },
      { x: 177, y: 378 },
      { x: -24, y: 177 },
      { x: 378, y: 177 },
      { x: 340, y: 30 },
      { x: 80, y: 80 },   // sela bunga
      { x: 275, y: 80 },  // sela bunga
      { x: 80, y: 275 },  // sela bunga
      { x: 275, y: 275 }, // sela bunga
    ];
    const coord = defaultCoords[placedDecos.length % defaultCoords.length];
    const newDeco: PlacedDecoration = {
      id: newId,
      ornamentKey: ornament.key,
      name: ornament.name,
      x: coord.x,
      y: coord.y,
    };
    const updated = [...placedDecos, newDeco];
    setPlacedDecos(updated);
    try {
      localStorage.setItem('bucket_garden_placed_decorations_v2', JSON.stringify(updated));
    } catch {}
    setIsDecorationModalOpen(false);
    playSound('chime');
    triggerToast(`✨ ${ornament.name} dipasang! Sentuh dan geser (drag) untuk mengatur posisinya sesukamu ⛲`);
  };

  // ── LEPAS ORNAMEN DARI KEBUN ──
  const handleRemovePlacedDeco = (id: string) => {
    const updated = placedDecos.filter(d => d.id !== id);
    setPlacedDecos(updated);
    try {
      localStorage.setItem('bucket_garden_placed_decorations_v2', JSON.stringify(updated));
    } catch {}
    setInspectDeco(null);
    playSound('click');
    triggerToast('🗑️ Ornamen berhasil dilepas dari kebun.');
  };

  // ── DRAG & DROP DECORATIONS DI PULAU TAMAN ──
  const handleStartDecoDrag = (e: React.PointerEvent, deco: PlacedDecoration) => {
    e.stopPropagation();
    decoDragStateRef.current = {
      id: deco.id,
      startPointer: { x: e.clientX, y: e.clientY },
      startX: deco.x,
      startY: deco.y,
      hasMoved: false
    };
    setActiveDraggingDecoId(deco.id);
  };

  useEffect(() => {
    if (!activeDraggingDecoId) return;

    const onDecoMoveGlobal = (e: PointerEvent) => {
      if (!decoDragStateRef.current) return;
      const { id, startPointer, startX, startY } = decoDragStateRef.current;
      const dx = e.clientX - startPointer.x;
      const dy = e.clientY - startPointer.y;

      if (Math.hypot(dx, dy) > 4) {
        decoDragStateRef.current.hasMoved = true;
      }

      // Proyeksi trigonometri invers layar ke koordinat 3D pulau
      const radYaw = (yaw * Math.PI) / 180;
      const radPitch = (pitch * Math.PI) / 180;
      const sinPitch = Math.max(0.3, Math.sin(radPitch));
      const screenDx = dx / zoomScale;
      const screenDy = dy / zoomScale;
      const sy = screenDy / sinPitch;

      const deltaIslandX = screenDx * Math.cos(radYaw) + sy * Math.sin(radYaw);
      const deltaIslandY = -screenDx * Math.sin(radYaw) + sy * Math.cos(radYaw);

      // Bebas digeser ke pinggir pulau (-30px) hingga ke sela-sela petak bunga (385px)
      const newX = Math.round(Math.max(-30, Math.min(385, startX + deltaIslandX)));
      const newY = Math.round(Math.max(-30, Math.min(385, startY + deltaIslandY)));

      setPlacedDecos(prev => prev.map(d => d.id === id ? { ...d, x: newX, y: newY } : d));
    };

    const onDecoUpGlobal = () => {
      const state = decoDragStateRef.current;
      if (state) {
        if (state.hasMoved) {
          // Berhasil digeser, simpan posisi ke storage
          setPlacedDecos(current => {
            try {
              localStorage.setItem('bucket_garden_placed_decorations_v2', JSON.stringify(current));
            } catch {}
            return current;
          });
          playSound('click');
        } else {
          // Ketukan biasa tanpa geser: buka drawer detail ornamen
          setPlacedDecos(current => {
            const found = current.find(d => d.id === state.id);
            if (found) {
              setInspectDeco(found);
              playSound('click');
            }
            return current;
          });
        }
      }
      decoDragStateRef.current = null;
      setActiveDraggingDecoId(null);
    };

    window.addEventListener('pointermove', onDecoMoveGlobal, { passive: false });
    window.addEventListener('pointerup', onDecoUpGlobal);
    window.addEventListener('pointercancel', onDecoUpGlobal);

    return () => {
      window.removeEventListener('pointermove', onDecoMoveGlobal);
      window.removeEventListener('pointerup', onDecoUpGlobal);
      window.removeEventListener('pointercancel', onDecoUpGlobal);
    };
  }, [activeDraggingDecoId, yaw, pitch, zoomScale, playSound]);

  // ── TOUCHSCREEN & MOUSE DRAG AND DROP WATERING LOGIC ──
  const handleStartWaterDrag = (clientX: number, clientY: number) => {
    setIsDraggingWaterCan(true);
    setWaterCanPos({ x: clientX, y: clientY });
    playSound('click');
  };

  const handlePointerMove = useCallback((e: PointerEvent | React.PointerEvent) => {
    if (!isDraggingWaterCan) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    setWaterCanPos({ x: clientX, y: clientY });

    if (Math.random() > 0.35) {
      setWaterDropParticles(prev => [
        ...prev.slice(-14),
        { id: Date.now() + Math.random(), x: clientX - 20, y: clientY + 16 }
      ]);
    }

    const nozzleX = clientX - 25;
    const nozzleY = clientY + 32;

    let hoveredTileId: number | null = null;
    tileDomRefs.current.forEach((element, id) => {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      if (
        nozzleX >= rect.left &&
        nozzleX <= rect.right &&
        nozzleY >= rect.top &&
        nozzleY <= rect.bottom
      ) {
        hoveredTileId = id;
      }
    });

    setActiveHoverTileId(hoveredTileId);

    if (hoveredTileId !== null) {
      const tile = tiles.find(t => t.id === hoveredTileId);
      if (tile && tile.planted && !tile.wateredToday) {
        waterTile(hoveredTileId);
      }
    }
  }, [isDraggingWaterCan, tiles, waterTile]);

  const handlePointerUp = useCallback(() => {
    if (!isDraggingWaterCan) return;

    if (activeHoverTileId !== null) {
      const tile = tiles.find(t => t.id === activeHoverTileId);
      if (tile && tile.planted) {
        waterTile(activeHoverTileId);
      }
    }

    setIsDraggingWaterCan(false);
    setWaterCanPos(null);
    setActiveHoverTileId(null);
    setWaterDropParticles([]);
  }, [isDraggingWaterCan, activeHoverTileId, tiles, waterTile]);

  useEffect(() => {
    if (!isDraggingWaterCan) return;

    const onPointerMoveGlobal = (e: PointerEvent) => handlePointerMove(e);
    const onPointerUpGlobal = () => handlePointerUp();

    window.addEventListener('pointermove', onPointerMoveGlobal, { passive: false });
    window.addEventListener('pointerup', onPointerUpGlobal);
    window.addEventListener('pointercancel', onPointerUpGlobal);

    return () => {
      window.removeEventListener('pointermove', onPointerMoveGlobal);
      window.removeEventListener('pointerup', onPointerUpGlobal);
      window.removeEventListener('pointercancel', onPointerUpGlobal);
    };
  }, [isDraggingWaterCan, handlePointerMove, handlePointerUp]);

  // ── Tile Click Handler (MURNI UNTUK TANAM BUNGA PADA 25 PETAK TANAH) ──
  const handleTileClick = (tile: GardenTile) => {
    // If user was dragging to rotate island, do not open modals
    if (dragDistanceRef.current > 8) return;

    setTargetTileId(tile.id);

    if (!tile.planted) {
      // Petak tanah kosong: Langsung buka katalog 40 Bibit Bunga! (Bukan dekorasi)
      setIsSeedModalOpen(true);
      playSound('click');
    } else {
      // Planted plot: Open Inspection Drawer with growth progress, details, and water action
      setInspectTile(tile);
      playSound('click');
    }
  };

  // ── Water All Plants (Daily Check) ──
  const handleWaterAll = () => {
    const todayStr = getTodayDateStr();
    let anyWatered = false;

    const updated = tiles.map(t => {
      if (!t.planted) return t;
      if (t.lastWateredDate === todayStr) return t;

      anyWatered = true;
      const currentDays = (t.daysWatered || 0) + 1;
      const stage = calculateGrowthStage(currentDays);

      return {
        ...t,
        waterCount: (t.waterCount || 0) + 1,
        daysWatered: currentDays,
        growthStage: stage,
        wateredToday: true,
        lastWateredDate: todayStr,
        lastWateredTime: new Date().toISOString()
      };
    });

    updateTilesAndSave(updated);
    playSound('splash');
    setTimeout(() => playSound('growth'), 120);

    if (anyWatered) {
      triggerToast('🚿 Seluruh bunga di kebun berhasil disiram untuk hari ini! Streak bertambah & kelopak bergoyang riang 🌸✨');
    } else {
      triggerToast('💧 Semua tanaman sudah segar disiram hari ini! Kembali esok hari untuk siraman berikutnya ya 💕');
    }
  };

  // ── Reset All Plants to Small Sprouts (Mulai dari Bibit Kecil) ──
  const handleResetToBibit = () => {
    const resetGrid = tiles.map(t => {
      if (!t.planted) return t;
      return {
        ...t,
        growthStage: 1 as const,
        waterCount: 0,
        daysWatered: 0,
        wateredToday: false,
        lastWateredDate: undefined
      };
    });
    updateTilesAndSave(resetGrid);
    playSound('plant');
    triggerToast('🌱 Semua tanaman kini kembali mulai dari bibit mungil! Rawat setiap hari agar berkembang.');
  };

  // ── TOGGLE SUARA ALAM IMERSIF (BURUNG, GEMERCIK AIR, JANGKRIK) ──
  const handleToggleAudio = () => {
    if (!isAudioEnabled) {
      if (!soundscapeRef.current) soundscapeRef.current = new GardenSoundscape();
      soundscapeRef.current.start(timeOfDay);
      setIsAudioEnabled(true);
      triggerToast('🍃 Suara alam imersif aktif! Menikmati suasana damai kebun cinta.');
    } else {
      soundscapeRef.current?.stop();
      setIsAudioEnabled(false);
      triggerToast('🔇 Suara alam dinonaktifkan.');
    }
  };

  // ── PETIK BUNGA MEKAR MENJADI BUKET NYATA ──
  const handleHarvestBloom = (tile: GardenTile) => {
    if (!tile.planted || !tile.flowerKey) return;
    const newItem: HarvestedFlowerItem = {
      uid: `harvest_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      flowerKey: tile.flowerKey,
      flowerName: tile.flowerName || 'Bunga Kebun',
      flowerLatin: tile.flowerLatin,
      flowerImage: tile.flowerImage || '/images/garden/rose_red.svg',
      flowerColor: tile.flowerColor || '#f43f5e',
      stage: (tile.growthStage as 3 | 4) || 3,
      harvestedAt: new Date().toISOString()
    };

    const next = [newItem, ...harvestedBasket];
    setHarvestedBasket(next);
    try {
      localStorage.setItem('bucket_garden_harvested_basket_v1', JSON.stringify(next));
    } catch {}

    // Registrasi ke Studio Buket
    try {
      const matching = FLOWERS.find(f => f.id === tile.flowerKey || f.name.toLowerCase().includes((tile.flowerName || '').toLowerCase()));
      if (matching) {
        addFlower(matching);
      } else {
        addFlower({
          id: tile.flowerKey,
          name: tile.flowerName || 'Bunga Kebun',
          imageUrl: tile.flowerImage || '/images/flowers/rose_pink.png',
          category: 'main',
          emoji: '🌸',
          color: tile.flowerColor || '#f43f5e',
          description: tile.flowerLatin || 'Bunga segar dari Kebun Cinta Laysa'
        });
      }
    } catch (e) {
      console.warn('Bouquet context push notice:', e);
    }

    // Reset petak ke bibit mungil (Stage 1) agar siklus cinta terus berlanjut
    const updated = tiles.map(t => {
      if (t.id === tile.id) {
        return {
          ...t,
          growthStage: 1 as const,
          daysWatered: 0,
          waterCount: 0,
          wateredToday: false,
          lastWateredDate: undefined,
        };
      }
      return t;
    });
    updateTilesAndSave(updated);
    setInspectTile(null);
    playSound('growth');
    setTimeout(() => playSound('chime'), 120);
    triggerToast(`✂️ Bunga ${tile.flowerName} berhasil dipetik dan dimasukkan ke Keranjang Buket! 💐`);
    setIsBasketDrawerOpen(true);
  };

  // ── Filtered 40 Flower Catalog ──
  const filteredFlowers = useMemo(() => {
    return GARDEN_40_FLOWERS.filter(f => {
      const matchCategory = selectedCategory === 'Semua' || f.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = !query || 
        f.name.toLowerCase().includes(query) || 
        f.latinName.toLowerCase().includes(query) || 
        f.meaning.toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Selected Target Tile (for accurate placement feedback)
  const targetTile = targetTileId !== null ? tiles.find(t => t.id === targetTileId) : null;

  // Counts
  const plantedCount = tiles.filter(t => t.planted).length;
  const wateredCount = tiles.filter(t => t.wateredToday).length;

  return (
    <div 
      className="game-kebun-arena select-none relative h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between"
      ref={gardenContainerRef}
    >
      {/* ── 1. CINEMATIC BOTANICAL SANCTUARY BACKDROP (SIANG / SENJA / MALAM) ── */}
      <div className={`garden-sky-backdrop time-${timeOfDay}`} aria-hidden="true">
        {bgMode === 'gemini' ? (
          <>
            <div className="garden-photo-bg" />
            <div className="garden-photo-overlay" />
          </>
        ) : (
          <>
            <div className="sky-cloud cloud-1" />
            <div className="sky-cloud cloud-2" />
          </>
        )}

        {/* Stars Layer in Night Mode */}
        {timeOfDay === 'night' && <div className="night-stars-layer" />}

        {/* Bioluminescent Fireflies in Night Mode */}
        {timeOfDay === 'night' && (
          <>
            <div className="firefly-particle" style={{ left: '12%', top: '28%', animationDelay: '0s' }} />
            <div className="firefly-particle" style={{ left: '28%', top: '48%', animationDelay: '1.2s' }} />
            <div className="firefly-particle" style={{ left: '46%', top: '32%', animationDelay: '0.6s' }} />
            <div className="firefly-particle" style={{ left: '62%', top: '56%', animationDelay: '2.1s' }} />
            <div className="firefly-particle" style={{ left: '76%', top: '34%', animationDelay: '1.7s' }} />
            <div className="firefly-particle" style={{ left: '20%', top: '64%', animationDelay: '2.8s' }} />
            <div className="firefly-particle" style={{ left: '54%', top: '68%', animationDelay: '3.4s' }} />
            <div className="firefly-particle" style={{ left: '84%', top: '58%', animationDelay: '0.9s' }} />
          </>
        )}

        <div className="sky-sun-flare" />
        <div className="floating-petal petal-1">🌸</div>
        <div className="floating-petal petal-2">✨</div>
        <div className="floating-petal petal-3">🌺</div>
        <div className="floating-petal petal-4">🌷</div>
        <div className="floating-petal petal-5">🦋</div>

        {/* ── PARTIKEL KELOPAK BUNGA MELAYANG TERTIUP ANGIN (AMBIENT BREEZE) ── */}
        <div className="ambient-petal-layer" aria-hidden="true">
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className={`floating-blossom-petal petal-${timeOfDay}`}
              style={{
                left: `${(i * 10) + 3}%`,
                animationDelay: `${i * 1.3}s`,
                animationDuration: `${7 + (i % 5)}s`,
                ['--drift-x' as string]: `${((i % 2 === 0 ? 1 : -1) * (40 + (i * 12)))}px`,
                ['--rot' as string]: `${(i * 90) + 180}deg`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── 2. TOP HUD: COMPACT & BALANCED RESPONSIVE HEADER ── */}
      <header className="garden-top-hud">
        <div className="garden-top-hud-inner">
          {/* Row Left: Back button to Game Menu */}
          <Link 
            href="/menu" 
            className="garden-back-btn" 
            onClick={() => playSound('click')}
            aria-label="Kembali ke Menu Game"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">MENU</span>
          </Link>

          {/* Row Center: Title & Garden Stats */}
          <div className="garden-header-center">
            <button
              type="button"
              className="garden-title-btn group"
              onClick={() => {
                setGardenNameDraft(gardenName);
                setPartnerNameDraft(partnerName);
                setIsNamingModalOpen(true);
              }}
              title="Klik untuk mengubah nama kebun bunga"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '2px 8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px',
                transition: 'background 0.2s',
              }}
            >
              <h1 className="garden-title" style={{ margin: 0 }}>{gardenName}</h1>
              <span style={{ fontSize: '11px', opacity: 0.6 }} className="group-hover:opacity-100 transition-opacity">
                ✏️
              </span>
            </button>
            <div className="garden-streak-pill">
              <span className="flex items-center gap-1.5 text-amber-300 font-extrabold">
                <Flame size={13} className="animate-bounce text-amber-400" />
                {streakCount} {isEn ? 'Days Streak 🔥' : 'Hari Streak 🔥'}
              </span>
              <span className="hud-sep">•</span>
              <span className="text-emerald-300 font-bold">
                {plantedCount}/25 {isEn ? 'Planted 🌸' : 'Ditanam 🌸'}
              </span>
              <button
                type="button"
                className="ml-1 px-2 py-0.5 bg-amber-400/20 hover:bg-amber-400/35 border border-amber-300/40 rounded-full text-[10px] font-extrabold text-amber-300 flex items-center gap-1 transition"
                onClick={handleSimulateNextDay}
                title={isEn ? 'Simulate next day (dries soil for growth)' : 'Simulasi hari esok (tanah kering untuk perkembangan)'}
              >
                <FastForward size={11} />
                <span>{isEn ? 'Tomorrow' : 'Esok Hari'}</span>
              </button>
            </div>
          </div>

          {/* Row Right: Action Cluster & Atmosphere Controls */}
          <div className="garden-top-actions">
            {/* Ambient Nature Sound Toggle */}
            <button
              type="button"
              className={`garden-audio-btn ${isAudioEnabled ? 'active' : ''}`}
              onClick={handleToggleAudio}
              title={isAudioEnabled ? (isEn ? 'Mute Nature Ambience' : 'Matikan Suara Alam') : (isEn ? 'Turn On Nature Ambience' : 'Nyalakan Suara Alam Imersif (Burung / Air / Jangkrik)')}
            >
              {isAudioEnabled ? <Volume2 size={13} className="text-amber-300" /> : <VolumeX size={13} />}
              <span className="hidden sm:inline">{isAudioEnabled ? (isEn ? 'Audio Active' : 'Audio Aktif') : (isEn ? 'Nature Sound' : 'Suara Alam')}</span>
              {isAudioEnabled && (
                <div className="equalizer-bars" aria-hidden="true">
                  <span className="eq-bar" />
                  <span className="eq-bar" />
                  <span className="eq-bar" />
                  <span className="eq-bar" />
                </div>
              )}
            </button>

            {/* Keranjang Hasil Petik Bunga */}
            <button
              type="button"
              className="garden-hud-btn"
              onClick={() => { setIsBasketDrawerOpen(true); playSound('click'); }}
              title={isEn ? 'Harvested Flowers Basket (Ready for Bouquet Studio)' : 'Keranjang Bunga Hasil Petik (Siap Dirangkai di Studio Buket)'}
            >
              <ShoppingBag size={14} className="text-rose-400" />
              <span className="font-bold text-rose-300">{isEn ? 'Bouquet' : 'Buket'} ({harvestedBasket.length})</span>
            </button>

            {/* Automatic Real-Time Atmosphere Badge */}
            <div 
              className="time-auto-badge" 
              title={isEn ? `Garden atmosphere syncs with local time: ${timeOfDay === 'night' ? 'Glowing Night' : timeOfDay === 'sunset' ? 'Golden Sunset' : 'Bright Day'}` : `Nuansa kebun otomatis mengikuti jam lokal: ${timeOfDay === 'night' ? 'Malam Berpendar' : timeOfDay === 'sunset' ? 'Senja Emas' : 'Siang Cerah'}`}
            >
              <span>{timeOfDay === 'night' ? '🌙' : timeOfDay === 'sunset' ? '🌅' : '☀️'}</span>
              <span className="hidden md:inline font-bold">
                {timeOfDay === 'night' ? (isEn ? 'Night' : 'Malam') : timeOfDay === 'sunset' ? (isEn ? 'Sunset' : 'Senja') : (isEn ? 'Day' : 'Siang')}
              </span>
            </div>

            {/* Ensiklopedia Bunga 40 (Flora Dex) */}
            <button
              type="button"
              className="garden-hud-btn"
              onClick={() => { setIsHerbariumOpen(true); playSound('click'); }}
              title={isEn ? 'Encyclopedia of 40 Flowers (Flora Dex)' : 'Ensiklopedia 40 Bunga (Flora Dex)'}
            >
              <BookOpen size={14} className="text-amber-300" />
              <span className="hidden md:inline">{isEn ? 'Collection' : 'Koleksi'} ({discoveredKeys.size}/40)</span>
            </button>

            {/* Diary Catatan Cinta */}
            <button
              type="button"
              className="garden-hud-btn"
              onClick={() => setIsNotesModalOpen(true)}
              title={isEn ? 'Love Notes Diary' : 'Buku Catatan Cinta'}
            >
              <Heart size={14} className="text-pink-400" />
              <span className="hidden md:inline">Diary</span>
            </button>

            {/* Undang Pasangan */}
            <button
              type="button"
              className="garden-hud-btn"
              onClick={() => setIsCodeModalOpen(true)}
              title={isEn ? 'Invite Partner (Garden Code)' : 'Undang Pasangan (Kode Kebun)'}
            >
              <Share2 size={14} className="text-amber-400" />
              <span className="hidden md:inline">{isEn ? 'Invite' : 'Undang'}</span>
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher variant="compact" />
          </div>
        </div>
      </header>

      {/* ── 3. MOBILE LANDSCAPE TIP BANNER ── */}
      {!isLandscapeHintDismissed && (
        <div className="mobile-landscape-banner md:hidden">
          <div className="flex items-center gap-2">
            <Smartphone size={15} className="rotate-90 text-amber-300 animate-pulse" />
            <span>Mode <strong>Landscape</strong> direkomendasikan untuk pandangan pulau lebih lega!</span>
          </div>
          <button 
            type="button" 
            className="text-white/70 hover:text-white p-1"
            onClick={() => setIsLandscapeHintDismissed(true)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── 4. MAIN 360° ORBITAL 3D GARDEN STAGE ── */}
      <main 
        className="garden-stage-viewport select-none cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={(e) => {
          if (isDraggingWaterCan) return;
          isOrbitDraggingRef.current = true;
          lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
          dragDistanceRef.current = 0;
        }}
        onPointerMove={(e) => {
          if (!isOrbitDraggingRef.current || isDraggingWaterCan) return;
          const dx = e.clientX - lastPointerPosRef.current.x;
          const dy = e.clientY - lastPointerPosRef.current.y;
          dragDistanceRef.current += Math.abs(dx) + Math.abs(dy);
          lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
          setYaw(prev => (prev + dx * 0.55) % 360);
          setPitch(prev => Math.max(25, Math.min(80, prev + dy * 0.4)));
        }}
        onPointerUp={() => {
          isOrbitDraggingRef.current = false;
        }}
        onPointerCancel={() => {
          isOrbitDraggingRef.current = false;
        }}
        onWheel={(e) => {
          setZoomScale(z => Math.max(0.7, Math.min(1.4, z - e.deltaY * 0.001)));
        }}
      >

        {/* 3D ISOMETRIC ISLAND PLATFORM (100% Persis Desain Asli, Rotatable 360°) */}
        <div 
          className="island-3d-wrapper"
          style={{
            transform: `translateZ(${Math.round(1200 * (1 - 1 / zoomScale))}px)`,
          }}
        >
          {/* Rotator Container (Rotasi 360° Horizontal & Pitch Atas) */}
          <div 
            className="island-3d-rotator"
            style={{
              transform: `rotateX(${pitch}deg) rotateZ(${yaw}deg)`,
            }}
          >
            {/* Soft White Rounded Pedestal Base */}
            <div className="island-pedestal-base" />

            {/* Dirt Bottom Plate */}
            <div className="dirt-cliff-bottom" />

            {/* 4 3D Cliff Walls for 360° Solid Diorama */}
            <div className="dirt-cliff-wall front-left">
              <svg className="grass-fringe-svg" viewBox="0 0 410 14" preserveAspectRatio="none">
                <path d="M0,0 L410,0 L410,5 Q390,14 370,4 Q350,14 330,4 Q310,14 290,4 Q270,14 250,4 Q230,14 210,4 Q190,14 170,4 Q150,14 130,4 Q110,14 90,4 Q70,14 50,4 Q30,14 10,4 L0,4 Z" fill="#68bf2b" />
              </svg>
            </div>
            <div className="dirt-cliff-wall front-right">
              <svg className="grass-fringe-svg" viewBox="0 0 410 14" preserveAspectRatio="none">
                <path d="M0,0 L410,0 L410,5 Q390,14 370,4 Q350,14 330,4 Q310,14 290,4 Q270,14 250,4 Q230,14 210,4 Q190,14 170,4 Q150,14 130,4 Q110,14 90,4 Q70,14 50,4 Q30,14 10,4 L0,4 Z" fill="#52a61e" />
              </svg>
            </div>
            <div className="dirt-cliff-wall back-right">
              <svg className="grass-fringe-svg" viewBox="0 0 410 14" preserveAspectRatio="none">
                <path d="M0,0 L410,0 L410,5 Q390,14 370,4 Q350,14 330,4 Q310,14 290,4 Q270,14 250,4 Q230,14 210,4 Q190,14 170,4 Q150,14 130,4 Q110,14 90,4 Q70,14 50,4 Q30,14 10,4 L0,4 Z" fill="#4ade80" />
              </svg>
            </div>
            <div className="dirt-cliff-wall back-left">
              <svg className="grass-fringe-svg" viewBox="0 0 410 14" preserveAspectRatio="none">
                <path d="M0,0 L410,0 L410,5 Q390,14 370,4 Q350,14 330,4 Q310,14 290,4 Q270,14 250,4 Q230,14 210,4 Q190,14 170,4 Q150,14 130,4 Q110,14 90,4 Q70,14 50,4 Q30,14 10,4 L0,4 Z" fill="#4ade80" />
              </svg>
            </div>

            {/* Top Lush Green Grass Surface (Isometric Diamond) */}
            <div className="island-grass-surface" style={{ transform: 'translateZ(0px)' }}>
              {/* 5x5 Isometric Grid Cells */}
              <div className="grid-5x5-isometric">
                {tiles.map((tile) => {
                  const isHoveredByWaterCan = activeHoverTileId === tile.id;
                  const isWaterBounceActive = wateredTileAnimations.has(tile.id);
                  const isSelected = targetTileId === tile.id;
                  const stage = tile.growthStage || 1;
                  const activeSplash = splashEffects.find(s => s.tileId === tile.id);

                  // 3D dynamic depth sorting for 360 degree rotation
                  const rad = (yaw * Math.PI) / 180;
                  const tileDepth = Math.round(
                    ((tile.col - 2) * Math.sin(rad) + (tile.row - 2) * Math.cos(rad)) * 10
                  ) + 50;

                  return (
                    <div
                      key={tile.id}
                      ref={(el) => {
                        if (el) tileDomRefs.current.set(tile.id, el);
                        else tileDomRefs.current.delete(tile.id);
                      }}
                      className={`iso-tile-cell row-${tile.row} col-${tile.col} ${
                        isSelected ? 'tile-selected' : ''
                      } ${
                        tile.planted ? `tile-planted growth-stage-${stage}` : 'tile-empty'
                      } ${tile.wateredToday ? 'tile-watered' : 'tile-dry'} ${
                        isHoveredByWaterCan ? 'tile-hover-water' : ''
                      } ${isWaterBounceActive ? 'flower-being-watered' : ''}`}
                      onClick={() => handleTileClick(tile)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Petak (${tile.row + 1}, ${tile.col + 1}): ${
                        tile.planted ? `${tile.flowerName} (Tahap ${stage})` : 'Kosong (Klik untuk Pilih Bibit)'
                      }`}
                      style={{
                        zIndex: tileDepth
                      }}
                    >
                      {/* Isometric Soil Patch (Anchored at exact center) */}
                      <div className="tile-soil-polygon" />

                      {/* Live Water Splash & Soil Ripple on Impact */}
                      {activeSplash && (
                        <div className="water-splash-burst" aria-hidden="true">
                          <div className="soil-ripple-ring" />
                          {activeSplash.particles.map(p => (
                            <span
                              key={p.id}
                              className="splash-drop"
                              style={{
                                ['--tx' as string]: `${p.tx}px`,
                                ['--ty' as string]: `${p.ty}px`,
                              }}
                            >
                              {p.char}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Plant Content - COUNTER-ROTATES WITH YAW & PITCH TO ALWAYS FACE SCREEN FLAT */}
                      {tile.planted ? (
                        <div 
                          className="tile-flower-stand"
                          style={{
                            transform: `rotateZ(${-yaw}deg) rotateX(${-pitch}deg)`
                          }}
                        >
                          {/* Radiant Aura if Stage 4 */}
                          {stage === 4 && <div className="radiant-glow-ring" />}

                          {/* Dewdrop sparkle aura if watered */}
                          {tile.wateredToday && (
                            <div className="water-sparkle-aura" aria-hidden="true">
                              <span className="dewdrop dew-1">💧</span>
                              <span className="dewdrop dew-2">✨</span>
                            </div>
                          )}

                          {/* Dynamic Flower Blossom */}
                          <div className="flower-blossom-wrapper">
                            <div className="flower-sway-anim">
                              {tile.isOrnament ? (
                                <GardenOrnamentVisual ornamentKey={tile.ornamentKey} timeOfDay={timeOfDay} />
                              ) : stage === 1 ? (
                                <SeedlingSproutVisual color={tile.flowerColor} name={tile.flowerName} />
                              ) : stage === 2 ? (
                                <BuddingPlantVisual color={tile.flowerColor} name={tile.flowerName} />
                              ) : (
                                <div className="blooming-flower-wrap">
                                  <span className={`plant-growth-badge ${stage === 4 ? 'badge-stage-4' : 'badge-stage-3'}`}>
                                    {stage === 4 ? '✨ Puspa Cahaya' : '🌸 Mekar'}
                                  </span>
                                  <Image
                                    src={tile.flowerImage || '/images/garden/rose_red.svg'}
                                    alt={tile.flowerName || 'Bunga'}
                                    width={stage === 4 ? 240 : 222}
                                    height={stage === 4 ? 276 : 258}
                                    unoptimized
                                    priority={tile.row < 2}
                                    className="iso-flower-img select-none pointer-events-none"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Subtle water prompt if dry (Hanya untuk bunga hidup) */}
                          {!tile.wateredToday && !tile.isOrnament && (
                            <div className="dry-prompt-drop" title="Tarik alat siram ke sini!">
                              <Droplets size={12} className="text-sky-400 animate-bounce" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div 
                          className="tile-empty-marker"
                          style={{
                            transform: `translate(-50%, -50%) rotateZ(${-yaw}deg) rotateX(${-pitch}deg)`
                          }}
                        >
                          <Plus size={16} className="text-emerald-800/60" />
                          <span className="empty-sublabel">Tanam</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Free-Position Drag & Drop Decorations (Bisa Digeser Bebas di Pinggir & di Sela-Sela Bunga) */}
              {placedDecos.map((deco) => {
                const isDraggingThis = activeDraggingDecoId === deco.id;

                // 3D dynamic depth sorting untuk rotasi 360 derajat
                const rad = (yaw * Math.PI) / 180;
                const normX = (deco.x - 177) / 75;
                const normY = (deco.y - 177) / 75;
                const decoDepth = Math.round((normX * Math.sin(rad) + normY * Math.cos(rad)) * 10) + 52;

                return (
                  <div
                    key={deco.id}
                    className={`draggable-deco-item ${isDraggingThis ? 'is-dragging' : ''}`}
                    style={{
                      left: `${deco.x}px`,
                      top: `${deco.y}px`,
                      zIndex: isDraggingThis ? 1000 : decoDepth,
                    }}
                    onPointerDown={(e) => handleStartDecoDrag(e, deco)}
                    role="button"
                    tabIndex={0}
                    title={`${deco.name} (Tahan & Geser untuk mengatur posisi di pinggir atau di sela bunga)`}
                  >
                    {/* Stone Paver Base Circular Plate */}
                    <div className="deco-paver-base" />

                    {/* Drag hint indicator */}
                    <div className="deco-drag-hint">
                      <span>⠿ Geser</span>
                    </div>

                    {/* Upright Item Counter-Rotated against Yaw and Pitch */}
                    <div
                      className="deco-stand-upright"
                      style={{
                        transform: `rotateZ(${-yaw}deg) rotateX(${-pitch}deg)`
                      }}
                    >
                      <div className="deco-placed-item">
                        <GardenOrnamentVisual ornamentKey={deco.ornamentKey} timeOfDay={timeOfDay} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 3D CAMERA FLOATING CONTROLLER HUD ── */}
        <div className="three-orbit-controls-hud">
          {/* 360 Auto-Rotate Toggle */}
          <button
            type="button"
            className={`three-hud-btn ${isAutoRotate ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoRotate(!isAutoRotate);
              playSound('click');
            }}
            title={isAutoRotate ? 'Jeda Putar Otomatis' : 'Putar 360° Otomatis'}
          >
            <RotateCw size={14} className={isAutoRotate ? 'animate-spin' : ''} />
            <span>Auto-360°</span>
          </button>

          {/* Top-Down vs Diorama Angle Toggle */}
          <button
            type="button"
            className={`three-hud-btn ${isTopViewActive ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isTopViewActive) {
                setPitch(60);
                setYaw(-45);
                setIsTopViewActive(false);
              } else {
                setPitch(76);
                setIsTopViewActive(true);
              }
              playSound('click');
            }}
            title="Ganti Sudut Pandang Atas / Diorama"
          >
            <Eye size={14} />
            <span>{isTopViewActive ? 'Sudut Atas' : 'Diorama'}</span>
          </button>

          {/* Zoom In & Out */}
          <button
            type="button"
            className="three-hud-btn"
            onClick={(e) => {
              e.stopPropagation();
              setZoomScale(z => Math.min(1.4, z + 0.15));
              playSound('click');
            }}
            title="Zoom Dekat"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            className="three-hud-btn"
            onClick={(e) => {
              e.stopPropagation();
              setZoomScale(z => Math.max(0.7, z - 0.15));
              playSound('click');
            }}
            title="Zoom Jauh"
          >
            <ZoomOut size={14} />
          </button>

          {/* Reset Camera to Default Isometric View */}
          <button
            type="button"
            className="three-hud-btn"
            onClick={(e) => {
              e.stopPropagation();
              setYaw(-45);
              setPitch(60);
              setZoomScale(1.0);
              setIsAutoRotate(false);
              setIsTopViewActive(false);
              playSound('click');
            }}
            title="Reset Posisi Kamera"
          >
            <Compass size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Floating Orbital Hint */}
        <div className="three-orbit-hint">
          <Sparkles size={13} className="text-amber-300 animate-pulse" />
          <span>Drag / Geser layar untuk memutar pulau 360° • Bebas lihat dari atas</span>
        </div>
      </main>

      {/* ── 5. DRAGGABLE FLOATING WATERING CAN (CURSOR FOLLOW) ── */}
      {isDraggingWaterCan && waterCanPos && (
        <div 
          className="water-can-floating-cursor"
          style={{
            left: `${waterCanPos.x}px`,
            top: `${waterCanPos.y}px`
          }}
          aria-hidden="true"
        >
          <div className="pouring-can-visual">
            <span className="watering-can-emoji">🚿</span>
            <div className="water-pour-stream">
              <span className="stream-particle p-1">💧</span>
              <span className="stream-particle p-2">💧</span>
              <span className="stream-particle p-3">✨</span>
            </div>
          </div>
        </div>
      )}

      {/* Falling spray droplets */}
      {waterDropParticles.map(p => (
        <span 
          key={p.id}
          className="water-drop-spray"
          style={{ left: `${p.x}px`, top: `${p.y}px` }}
          aria-hidden="true"
        >
          💧
        </span>
      ))}

      {/* ── 6. BOTTOM TOOLBAR (ERGONOMIC TOUCHSCREEN CONTROLS) ── */}
      <footer className="garden-bottom-hud">
        <div className="garden-bottom-hud-inner">
          {/* Tool 1: Interactive Draggable Watering Can */}
          <div className="tool-card tool-water-can">
            <button
              ref={waterCanBtnRef}
              type="button"
              id="tool-btn-watering-can"
              className={`water-can-trigger-btn ${isDraggingWaterCan ? 'active-dragging' : ''}`}
              onPointerDown={(e) => {
                e.preventDefault();
                handleStartWaterDrag(e.clientX, e.clientY);
              }}
              title="Sentuh & Geser (Drag) melintasi bunga untuk menyiram!"
            >
              <div className="water-can-icon-wrap">
                <span className="water-can-icon">🚿</span>
                <span className="water-can-badge">{wateredCount}/25</span>
              </div>
              <div className="tool-text-info">
                <span className="tool-main-name">ALAT PENYIRAM</span>
                <span className="tool-sub-hint">Tarik ke Bunga 💧</span>
              </div>
            </button>
          </div>

          {/* Tool 2: Siram Semua Sekaligus */}
          <button
            type="button"
            className="garden-quick-btn btn-water-all"
            onClick={handleWaterAll}
            title="Siram seluruh bunga sekaligus"
          >
            <Droplets size={16} />
            <span>SIRAM SEMUA</span>
          </button>

          {/* Tool 3: Tanam Bibit Baru */}
          <button
            type="button"
            className="garden-quick-btn btn-plant-seed"
            onClick={() => {
              const empty = tiles.find(t => !t.planted);
              if (empty) {
                setTargetTileId(empty.id);
              }
              setSeedPickerTab('flowers');
              if (selectedCategory === 'Dekorasi') setSelectedCategory('Semua');
              setIsSeedModalOpen(true);
              playSound('click');
            }}
            title="Buka katalog 40 varietas bibit bunga"
          >
            <Plus size={16} />
            <span>PILIH BIBIT</span>
          </button>

          {/* Tool 4: Pasang Ornamen & Dekorasi (Drag & Drop) */}
          <button
            type="button"
            className="garden-quick-btn btn-dekorasi-taman"
            onClick={() => {
              setIsDecorationModalOpen(true);
              playSound('click');
            }}
            title="Buka pilihan 5 ornamen untuk dipasang dan digeser bebas di taman"
          >
            <Sparkles size={16} />
            <span>+ DEKORASI</span>
          </button>
        </div>
      </footer>

      {/* ── 7. SEED PICKER MODAL (MURNI 40 VARIETAS BUNGA) ── */}
      {isSeedModalOpen && (
        <div className="garden-modal-backdrop" onClick={() => {
          setIsSeedModalOpen(false);
          setTargetTileId(null);
        }}>
          <div className="garden-modal-box seed-picker-box" onClick={e => e.stopPropagation()}>
            <div className="garden-modal-header">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌱</span>
                  <h3 className="modal-heading-text">Pilih Varietas Bibit (40 Spesies)</h3>
                </div>
                {targetTile && (
                  <div className="target-tile-badge-info mt-1">
                    <span>📍 Menanam di Petak: <strong>Baris {targetTile.row + 1}, Kolom {targetTile.col + 1}</strong></span>
                  </div>
                )}
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => {
                  setIsSeedModalOpen(false);
                  setTargetTileId(null);
                }}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <p className="modal-sub-desc">
              Pilih bunga impianmu! Bunga akan ditanam mulai dari <strong>bibit tunas mungil</strong> dan bertumbuh seiring kamu menyiramnya setiap hari 🌱💧
            </p>

            {/* Category Filter Tabs */}
            <div className="seed-filter-tabs">
              {GARDEN_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`seed-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    playSound('click');
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="seed-search-input-wrap">
              <Search size={16} className="seed-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama bunga, nama latin, atau makna..."
                className="seed-search-input"
              />
            </div>

            {/* 40 Flower Grid List */}
            <div className="seed-grid-picker">
              {filteredFlowers.map((flower) => (
                <div
                  key={flower.key}
                  className="seed-option-card"
                  onClick={() => handlePlantFlower(flower)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="seed-img-wrap">
                    <Image
                      src={flower.image}
                      alt={flower.name}
                      width={52}
                      height={52}
                      className="seed-flower-thumb"
                    />
                  </div>

                  <div className="seed-info-wrap">
                    <div className="seed-name-line">
                      <span className="seed-name">{flower.name}</span>
                      <span className={`seed-rarity-pill rarity-${flower.rarity}`}>
                        {flower.rarity}
                      </span>
                    </div>
                    <span className="seed-latin">{flower.latinName}</span>
                    <span className="seed-meaning">"{flower.meaning}"</span>
                  </div>

                  <button 
                    type="button" 
                    className="seed-pick-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlantFlower(flower);
                    }}
                  >
                    Tanam Bibit 🌱
                  </button>
                </div>
              ))}

              {filteredFlowers.length === 0 && (
                <div className="text-center py-8 text-slate-500 font-sans text-sm col-span-full">
                  Tidak ada bunga yang cocok dengan pencarian "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 8. DECORATION MODAL (PASANG ORNAMEN & BEBAS DI-DRAG KE MANA SAJA) ── */}
      {isDecorationModalOpen && (
        <div className="garden-modal-backdrop" onClick={() => setIsDecorationModalOpen(false)}>
          <div className="garden-modal-box decoration-picker-box" onClick={e => e.stopPropagation()}>
            <div className="garden-modal-header">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⛲</span>
                  <h3 className="modal-heading-text">+ Pasang Ornamen Dekorasi</h3>
                </div>
                <span className="text-xs text-amber-700 font-semibold mt-1">
                  🖐️ Bebas digeser (drag & drop) ke pinggir pulau maupun di sela-sela bunga!
                </span>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setIsDecorationModalOpen(false)}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <p className="modal-sub-desc">
              Pilih ornamen dekorasi taman abadi. Setelah dipasang, kamu bisa bebas menyentuh dan <strong>menggesernya (drag & drop)</strong> ke posisi favoritmu — baik di tepian pulau maupun di sela-sela bunga! ⛲✨
            </p>

            {/* Search Input for Decorations */}
            <div className="seed-search-input-wrap">
              <Search size={16} className="seed-search-icon" />
              <input
                type="text"
                value={decorationSearchQuery}
                onChange={(e) => setDecorationSearchQuery(e.target.value)}
                placeholder="Cari ornamen taman (air mancur, bangku, lentera, kucing, gapura)..."
                className="seed-search-input"
              />
            </div>

            {/* 5 Ornament Grid */}
            <div className="seed-grid-picker">
              {GARDEN_ORNAMENTS.filter(orn => 
                !decorationSearchQuery.trim() || 
                orn.name.toLowerCase().includes(decorationSearchQuery.toLowerCase()) || 
                orn.meaning.toLowerCase().includes(decorationSearchQuery.toLowerCase()) ||
                orn.description.toLowerCase().includes(decorationSearchQuery.toLowerCase())
              ).map(orn => (
                <div
                  key={orn.key}
                  className="seed-option-card"
                  style={{ borderColor: '#fde68a', background: '#fffbeb' }}
                  onClick={() => handleAddOrnament(orn)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="seed-img-wrap" style={{ background: '#fef3c7', borderColor: '#fde68a' }}>
                    <span style={{ fontSize: '28px' }} className="select-none">{orn.emoji}</span>
                  </div>

                  <div className="seed-info-wrap">
                    <div className="seed-name-line">
                      <span className="seed-name text-slate-800">{orn.name}</span>
                      <span className="seed-rarity-pill" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                        Dekorasi
                      </span>
                    </div>
                    <span className="seed-latin" style={{ color: '#b45309' }}>"{orn.meaning}"</span>
                    <span className="seed-meaning text-slate-600">{orn.description}</span>
                  </div>

                  <button 
                    type="button" 
                    className="seed-pick-btn"
                    style={{ background: '#f59e0b', color: '#ffffff' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddOrnament(orn);
                    }}
                  >
                    Pasang ✨
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 9. DECORATION DETAIL DRAWER (KETIKA ORNAMEN DIKETUK) ── */}
      {inspectDeco && (
        <div className="garden-modal-backdrop" onClick={() => setInspectDeco(null)}>
          <div className="garden-modal-box plant-inspect-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="garden-modal-header">
              <div className="flex items-center gap-2">
                <span className="text-xl">⛲</span>
                <h3 className="modal-heading-text">Dekorasi Taman</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setInspectDeco(null)}
              >
                <X size={18} />
              </button>
            </div>

            {(() => {
              const def = getOrnamentByKey(inspectDeco.ornamentKey);
              return (
                <div className="plant-inspect-card">
                  <div className="inspect-flower-preview" style={{ height: '90px' }}>
                    <GardenOrnamentVisual ornamentKey={inspectDeco.ornamentKey} timeOfDay={timeOfDay} />
                  </div>

                  <h2 className="inspect-title">{def?.name || inspectDeco.name}</h2>
                  <span className="inspect-latin" style={{ color: '#b45309', fontWeight: 700 }}>
                    "{def?.meaning || 'Keindahan Abadi'}"
                  </span>

                  <div className="w-full bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-left mb-4 text-xs font-sans text-slate-700 space-y-2 mt-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold bg-amber-100/80 px-2.5 py-1.5 rounded-xl border border-amber-300">
                      <span>🖐️ Bebas Di-Drag & Drop</span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1">
                      <span className="text-slate-500">Kondisi:</span>
                      <span className="font-bold text-emerald-600">✨ Indah & Terawat</span>
                    </div>
                    <div className="pt-1.5 border-t border-amber-200/80 text-[11.5px] text-slate-600 leading-relaxed">
                      💡 <strong>Tips:</strong> Kamu bisa langsung menyentuh dan <strong>menggeser (drag)</strong> ornamen ini di layar ke posisi mana pun — baik di pinggir pulau maupun di sela-sela petak bunga!
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="inspect-actions">
                    <button
                      type="button"
                      className="inspect-btn-water"
                      style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                      onClick={() => {
                        playSound('splash');
                        triggerToast(`🚿 ${def?.name || 'Ornamen'} dibersihkan dengan semprotan air segar! Berkilau cerah ✨`);
                        setInspectDeco(null);
                      }}
                    >
                      <Droplets size={16} />
                      <span>Bersihkan Air 🚿</span>
                    </button>
                    <button
                      type="button"
                      className="inspect-btn-change"
                      onClick={() => {
                        setInspectDeco(null);
                        setIsDecorationModalOpen(true);
                      }}
                    >
                      <RotateCw size={14} />
                      <span>Ganti Ornamen</span>
                    </button>
                    <button
                      type="button"
                      className="inspect-btn-change hover:!border-rose-400 hover:!text-rose-600"
                      onClick={() => handleRemovePlacedDeco(inspectDeco.id)}
                    >
                      <Trash2 size={14} />
                      <span>Lepas</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── 10. PLANT INSPECTION DETAIL DRAWER (MURNI KHUSUS BUNGA PADA 25 PETAK TANAH) ── */}
      {inspectTile && inspectTile.planted && (
        <div className="garden-modal-backdrop" onClick={() => setInspectTile(null)}>
          <div className="garden-modal-box plant-inspect-box" onClick={e => e.stopPropagation()}>
            <div className="garden-modal-header">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌸</span>
                <h3 className="modal-heading-text">Detail Tanaman</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setInspectTile(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="plant-inspect-card">
                <div className="inspect-flower-preview">
                  {inspectTile.growthStage === 4 && <div className="radiant-glow-ring" />}
                  {inspectTile.growthStage === 1 ? (
                    <SeedlingSproutVisual color={inspectTile.flowerColor} name={inspectTile.flowerName} />
                  ) : inspectTile.growthStage === 2 ? (
                    <BuddingPlantVisual color={inspectTile.flowerColor} name={inspectTile.flowerName} />
                  ) : (
                    <Image
                      src={inspectTile.flowerImage || '/images/garden/rose_red.svg'}
                      alt={inspectTile.flowerName || 'Bunga'}
                      width={110}
                      height={110}
                      className="inspect-flower-img"
                    />
                  )}
                </div>

                <h2 className="inspect-title">{inspectTile.flowerName}</h2>
                <span className="inspect-latin">{inspectTile.flowerLatin || 'Spesies Botani Istimewa'}</span>

                {/* Growth Progress Stepper */}
                <div className="inspect-growth-stepper">
                  <div className={`growth-step-node ${(inspectTile.growthStage || 1) >= 1 ? 'active-step' : ''}`}>
                    <span className="growth-step-icon">🌱</span>
                    <span>1. Bibit</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                  <div className={`growth-step-node ${(inspectTile.growthStage || 1) >= 2 ? 'active-step' : ''}`}>
                    <span className="growth-step-icon">🌿</span>
                    <span>2. Kuncup</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                  <div className={`growth-step-node ${(inspectTile.growthStage || 1) >= 3 ? 'active-step' : ''}`}>
                    <span className="growth-step-icon">🌸</span>
                    <span>3. Mekar</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                  <div className={`growth-step-node ${(inspectTile.growthStage || 1) >= 4 ? 'active-step' : ''}`}>
                    <span className="growth-step-icon">✨</span>
                    <span>4. Puspa</span>
                  </div>
                </div>

                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left mb-3 text-xs font-sans text-slate-600 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lokasi Petak:</span>
                    <span className="font-bold text-slate-800">Baris {inspectTile.row + 1}, Kolom {inspectTile.col + 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hari Terawat (Streak):</span>
                    <span className="font-bold text-indigo-600">{inspectTile.daysWatered || 0} Hari Siraman</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status Hari Ini:</span>
                    <span className={`font-bold ${inspectTile.wateredToday ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {inspectTile.wateredToday ? '💧 Sudah Disiram (Segar)' : '🥀 Belum Disiram Hari Ini'}
                    </span>
                  </div>
                </div>

                {/* ── FITUR PETIK BUNGA UNTUK DIRANGKAI KE STUDIO BUKET ── */}
                {(inspectTile.growthStage || 1) >= 3 && (
                  <div className="harvest-bloom-card">
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5 font-bold text-rose-950 text-xs">
                        <span className="text-sm">🌸</span>
                        <span>Bunga Siap Dirangkai!</span>
                      </div>
                      <span className="text-[11px] text-slate-600 font-sans mt-0.5">
                        Petik bunga ini untuk langsung dibawa ke Studio Perangkai Buket.
                      </span>
                    </div>
                    <button
                      type="button"
                      className="harvest-btn-glow"
                      onClick={() => handleHarvestBloom(inspectTile)}
                    >
                      <Scissors size={14} />
                      <span>Petik Bunga ✂️</span>
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="inspect-actions">
                  <button
                    type="button"
                    className="inspect-btn-water"
                    onClick={() => {
                      waterTile(inspectTile.id);
                      setInspectTile(null);
                    }}
                  >
                    <Droplets size={16} />
                    <span>Siram Bunga Ini</span>
                  </button>
                  <button
                    type="button"
                    className="inspect-btn-change"
                    onClick={() => {
                      setTargetTileId(inspectTile.id);
                      setInspectTile(null);
                      setIsSeedModalOpen(true);
                    }}
                  >
                    <RotateCw size={14} />
                    <span>Ganti Bibit</span>
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* ── 11. KERANJANG BUNGA HASIL PETIK MODAL / DRAWER ── */}
      {isBasketDrawerOpen && (
        <div className="garden-modal-backdrop" onClick={() => setIsBasketDrawerOpen(false)}>
          <div className="garden-modal-box basket-drawer-box" onClick={e => e.stopPropagation()}>
            <div className="garden-modal-header">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧺</span>
                <div>
                  <h3 className="modal-heading-text">Keranjang Hasil Petik Bunga</h3>
                  <span className="text-xs text-rose-600 font-semibold">
                    {harvestedBasket.length} tangkai bunga segar tersimpan
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setIsBasketDrawerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="modal-sub-desc">
              Bunga mekar dari kebun cinta yang telah dipetik dan siap kamu rangkai bersama kertas wrapper, pita, dan kartu ucapan di <strong>Studio Perangkai Buket</strong> 💐
            </p>

            {harvestedBasket.length === 0 ? (
              <div className="text-center py-10 px-4 bg-rose-50/50 rounded-2xl border border-rose-100 mt-2">
                <span className="text-4xl block mb-2 select-none">🌱</span>
                <h4 className="font-bold text-slate-800 text-sm">Keranjang Masih Kosong</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Siram tanaman di kebun setiap hari hingga mencapai Tahap 3 (Mekar) atau Tahap 4 (Puspa Cahaya) untuk bisa dipetik!
                </p>
              </div>
            ) : (
              <>
                <div className="harvest-grid-list">
                  {harvestedBasket.map((item) => (
                    <div key={item.uid} className="harvest-item-card">
                      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                        <Image
                          src={item.flowerImage}
                          alt={item.flowerName}
                          width={44}
                          height={44}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-col text-left flex-1 min-w-0">
                        <span className="font-bold text-slate-900 text-xs truncate">{item.flowerName}</span>
                        <span className="text-[10.5px] text-rose-600 font-medium">
                          {item.stage === 4 ? '✨ Puspa Cahaya' : '🌸 Mekar Sempurna'}
                        </span>
                        <span className="text-[9.5px] text-slate-400 mt-0.5">
                          {new Date(item.harvestedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                  <Link
                    href="/menu"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-200 transition active:scale-95"
                    onClick={() => playSound('chime')}
                  >
                    <span>💐 Buka Studio & Rangkai Buket</span>
                  </Link>
                  <button
                    type="button"
                    className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 text-xs font-bold transition"
                    onClick={() => {
                      if (confirm('Kosongkan keranjang hasil petik?')) {
                        setHarvestedBasket([]);
                        localStorage.removeItem('bucket_garden_harvested_basket_v1');
                        triggerToast('🧺 Keranjang berhasil dikosongkan.');
                      }
                    }}
                  >
                    Bersihkan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── 9. DIARY / LOVE NOTES MODAL (ENCRYPTED) ── */}
      {isNotesModalOpen && (
        <div className="garden-modal-backdrop" onClick={() => setIsNotesModalOpen(false)}>
          <div className="garden-modal-box notes-modal-box" onClick={e => e.stopPropagation()}>
            <div className="garden-modal-header">
              <div className="flex items-center gap-2">
                <Heart size={20} className="text-rose-500 fill-rose-500" />
                <h3 className="modal-heading-text">Buku Catatan Kebun Cinta</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setIsNotesModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="notes-list-scroll">
              {notes.map(n => (
                <div key={n.id} className="note-card-item">
                  <div className="note-header-line">
                    <span className="note-author">💌 {n.author}</span>
                    <span className="note-time">{n.time}</span>
                  </div>
                  <p className="note-text-body">{n.text}</p>
                </div>
              ))}
            </div>

            {/* Input Catatan Baru */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem('noteText') as HTMLInputElement;
                if (input && input.value.trim()) {
                  setNotes(prev => [
                    ...prev,
                    {
                      id: `note-${Date.now()}`,
                      author: premiumUserName || 'Saya',
                      text: input.value.trim(),
                      time: 'Baru saja'
                    }
                  ]);
                  input.value = '';
                  playSound('plant');
                  triggerToast('💌 Pesan cinta berhasil ditempelkan di kebun!');
                }
              }}
              className="note-new-form"
            >
              <input
                type="text"
                name="noteText"
                placeholder="Tulis pesan manis untuk pasanganmu..."
                className="note-input-field"
                required
              />
              <button type="submit" className="note-send-btn">
                <span>Kirim</span>
                <Heart size={14} className="fill-white" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 10. KODE KEBUN PASANGAN MODAL ── */}
      {isCodeModalOpen && (
        <div className="garden-modal-backdrop" onClick={() => setIsCodeModalOpen(false)}>
          <div className="garden-modal-box code-modal-box" onClick={e => e.stopPropagation()}>
            <div className="garden-modal-header">
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <h3 className="modal-heading-text">Akses Kebun Pasangan (Duet)</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setIsCodeModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="code-display-card">
              <span className="code-sub-label">KODE KEBUN ANDA:</span>
              <div className="code-badge-massive">{gardenCode}</div>
              <p className="code-desc">
                Bagikan kode 6 digit ini ke pasangan Anda agar kalian bisa merawat dan menyiram 25 bunga ini bersama-sama dari HP masing-masing!
              </p>
            </div>

            <button
              type="button"
              className="copy-code-btn"
              onClick={() => {
                if (typeof navigator !== 'undefined') {
                  navigator.clipboard.writeText(
                    `Yuk rawat kebun bunga 3D kita berdua di Bucket Bunga Laysa! Masukkan kode kebun: ${gardenCode} 💕`
                  );
                  triggerToast('📋 Teks undangan kebun berhasil disalin ke clipboard!');
                  playSound('chime');
                }
              }}
            >
              <span>Salin Undangan untuk WhatsApp</span>
              <Check size={16} />
            </button>
          </div>
        </div>
      )}


      {/* ── 10.2 HERBARIUM / FLORA DEX 40 MODAL ── */}
      {isHerbariumOpen && (
        <div className="garden-modal-backdrop" onClick={() => {
          setIsHerbariumOpen(false);
          setHerbariumDetailFlower(null);
        }}>
          <div className="herbarium-modal-box" onClick={e => e.stopPropagation()}>
            <div className="herbarium-header-strip">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📖</span>
                <div>
                  <h3 className="font-extrabold text-lg text-white font-['Fredoka']">Ensiklopedia 40 Bunga Cinta</h3>
                  <p className="text-xs text-amber-200">Kamus Filosofi & Bahasa Bunga (Floriography)</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn text-white"
                onClick={() => {
                  setIsHerbariumOpen(false);
                  setHerbariumDetailFlower(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Collection Progress Bar */}
            <div className="herbarium-progress-bar-wrap">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 font-['Fredoka']">
                <span>KOLEKSI TERBUKA:</span>
                <span className="text-rose-600 font-extrabold">{discoveredKeys.size} / 40 SPESIES</span>
              </div>
              <div className="herbarium-progress-track">
                <div 
                  className="herbarium-progress-fill" 
                  style={{ width: `${Math.min(100, (discoveredKeys.size / 40) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Category tabs */}
            <div className="seed-filter-tabs px-6 py-2 border-b border-slate-100">
              {GARDEN_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`seed-tab-btn ${herbariumCategory === cat ? 'active' : ''}`}
                  onClick={() => setHerbariumCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Flowers Grid */}
            <div className="herbarium-grid-content">
              {GARDEN_40_FLOWERS
                .filter(f => herbariumCategory === 'Semua' || f.category === herbariumCategory)
                .map(flower => {
                  const isUnlocked = discoveredKeys.has(flower.key);
                  return (
                    <div
                      key={flower.key}
                      className={`herbarium-card ${!isUnlocked ? 'is-locked' : ''}`}
                      onClick={() => {
                        if (isUnlocked) setHerbariumDetailFlower(flower);
                        else triggerToast('🔒 Bunga ini belum pernah ditanam di kebunmu! Tanam bibitnya untuk membuka ensiklopedia.');
                      }}
                    >
                      <div className="herbarium-flower-img-box">
                        {isUnlocked ? (
                          <Image
                            src={flower.image}
                            alt={flower.name}
                            width={56}
                            height={56}
                            unoptimized
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-black text-xl">
                            ?
                          </div>
                        )}
                      </div>
                      <span className="herbarium-card-name">
                        {isUnlocked ? flower.name : 'Misterius'}
                      </span>
                      <span className="herbarium-card-latin">
                        {isUnlocked ? flower.latinName : 'Spesies belum terbuka'}
                      </span>
                      <span className={`seed-rarity-pill rarity-${flower.rarity} text-[8px] mt-1`}>
                        {isUnlocked ? flower.rarity : 'Terkunci'}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Detail Flower Popup inside Herbarium */}
            {herbariumDetailFlower && (
              <div className="p-4 bg-slate-900 text-white flex flex-col md:flex-row items-center gap-4 border-t border-slate-800 animate-fadeIn">
                <div className="w-16 h-16 bg-white/10 rounded-2xl p-2 flex items-center justify-center flex-shrink-0">
                  <Image
                    src={herbariumDetailFlower.image}
                    alt={herbariumDetailFlower.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm font-['Fredoka']">{herbariumDetailFlower.name}</h4>
                    <span className="text-[11px] text-slate-400 italic">({herbariumDetailFlower.latinName})</span>
                  </div>
                  <p className="text-xs text-amber-300 font-semibold mt-0.5">
                    Makna: &ldquo;{herbariumDetailFlower.meaning}&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                    {herbariumDetailFlower.description}
                  </p>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold text-white flex-shrink-0"
                  onClick={() => setHerbariumDetailFlower(null)}
                >
                  Tutup Info
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 11. VIP SULTAN GATE LOCK SCREEN (Jika Belum VIP) ── */}
      {hasMounted && !isPremiumUnlocked && (
        <div className="garden-vip-gate-overlay">
          <div className="garden-vip-gate-card">
            <div className="vip-gate-crown-icon">
              <Crown size={38} className="text-amber-400 fill-amber-400" />
              <span className="vip-gate-flower-badge">🌸</span>
            </div>
            <span className="vip-gate-kicker">FITUR EKSKLUSIF SULTAN</span>
            <h2 className="vip-gate-title">Kebun Bunga 3D Terkunci</h2>
            <p className="vip-gate-desc">
              Fitur merawat dan menyiram kebun bunga 3D duet bersama pasangan hanya terbuka untuk member <strong>VIP Sultan</strong>.
            </p>
            
            <div className="vip-gate-perks-list">
              <div className="vip-perk-item">
                <span>👑</span>
                <span>{isEn ? 'Access 40+ Rare & Exclusive Flowers' : 'Akses 40+ Koleksi Bunga Eksklusif & Langka'}</span>
              </div>
              <div className="vip-perk-item">
                <span>💧</span>
                <span>{isEn ? 'Daily Growth & Streak Watering System' : 'Sistem Rawat & Siram Harian Bersama Pasangan'}</span>
              </div>
              <div className="vip-perk-item">
                <span>✨</span>
                <span>{isEn ? 'Love Letters Diary & Encrypted Garden' : 'Papan Pesona & Surat Cinta Terenkripsi'}</span>
              </div>
            </div>

            <div className="vip-gate-actions">
              <button
                type="button"
                className="vip-gate-btn-primary"
                onClick={() => setIsVipModalOpen(true)}
              >
                <Sparkles size={18} />
                <span>{isEn ? 'Unlock Sultan VIP Access Now' : 'Buka Akses VIP Sultan Sekarang'}</span>
              </button>
              <Link href="/menu" className="vip-gate-btn-secondary">
                <ArrowLeft size={15} />
                <span>{isEn ? 'Back to Main Menu' : 'Kembali ke Menu Utama'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 12. VIP UNLOCK MODAL ── */}
      <PremiumUnlockModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
      />

      {/* ── 13. SUCCESS FLOATING TOAST ── */}
      {toastMessage && (
        <div className="garden-floating-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 14. MODAL PENAMAAN KEBUN BUNGA (WAJIB VIP SULTAN) ── */}
      {isNamingModalOpen && (
        <div
          className="garden-naming-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="garden-naming-card"
            style={{
              background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)',
              border: '1.5px solid rgba(251, 191, 36, 0.45)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(251, 191, 36, 0.2)',
              borderRadius: '24px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px 24px',
              color: '#f8fafc',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            {/* Close button only visible if garden was already named once */}
            {typeof window !== 'undefined' && localStorage.getItem('bucket_garden_named') && (
              <button
                type="button"
                onClick={() => setIsNamingModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                }}
                aria-label={isEn ? 'Close' : 'Tutup'}
              >
                <X size={16} />
              </button>
            )}

            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)',
                fontSize: '28px',
              }}
            >
              👑
            </div>

            <span
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#fde047',
                backgroundColor: 'rgba(253, 224, 71, 0.15)',
                border: '1px solid rgba(253, 224, 71, 0.3)',
                borderRadius: '999px',
                padding: '4px 12px',
                marginBottom: '10px',
              }}
            >
              {isEn ? 'Lifetime Sultan VIP' : 'VIP Sultan Selamanya'}
            </span>

            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px', color: '#ffffff' }}>
              {isEn ? 'Name Your Flower Garden 🌸' : 'Beri Nama Kebun Bunga Anda 🌸'}
            </h2>

            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 18px' }}>
              {isEn
                ? 'As a Sultan VIP member, please name your garden before planting and caring for flowers:'
                : 'Sebagai pemilik VIP Sultan, kebun Anda wajib diberi nama sebelum mulai menanam dan merawat bunga:'}
            </p>

            <form onSubmit={handleSaveGardenName} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#fcd34d', marginBottom: '6px' }}>
                  {isEn ? 'Flower Garden Name' : 'Nama Kebun Bunga'} <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  value={gardenNameDraft}
                  onChange={(e) => setGardenNameDraft(e.target.value)}
                  placeholder={isEn ? 'E.g.: Laysa Love Sanctuary, Our Rose Garden...' : 'Cth: Kebun Cinta Laysa, Taman Mawar Kita...'}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1.5px solid rgba(251, 191, 36, 0.5)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  {isEn ? 'Owner / Partner Name (Optional)' : 'Nama Pemilik / Pasangan (Opsional)'}
                </label>
                <input
                  type="text"
                  value={partnerNameDraft}
                  onChange={(e) => setPartnerNameDraft(e.target.value)}
                  placeholder={isEn ? 'E.g.: Sarah & Partner' : 'Cth: Laysa & Pasangan'}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '2px 0 6px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', alignSelf: 'center' }}>
                  {isEn ? 'Examples:' : 'Contoh:'}
                </span>
                {(isEn 
                  ? ['Our Rose Sanctuary 🌹', 'Laysa Love Garden ✨', 'Happy Blossoms 🌼']
                  : ['Taman Mawar Kita 🌹', 'Kebun Kasih Laysa ✨', 'Puspa Bahagia 🌼']
                ).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGardenNameDraft(preset)}
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#e2e8f0',
                      cursor: 'pointer',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!gardenNameDraft.trim()}
                style={{
                  marginTop: '4px',
                  padding: '13px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                  border: '1px solid #fbbf24',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: gardenNameDraft.trim() ? 'pointer' : 'not-allowed',
                  opacity: gardenNameDraft.trim() ? 1 : 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.45)',
                  transition: 'all 0.2s',
                }}
              >
                <Sparkles size={16} />
                <span>{isEn ? 'Save & Enter Flower Garden 🌸' : 'Simpan & Masuk Kebun Bunga 🌸'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
