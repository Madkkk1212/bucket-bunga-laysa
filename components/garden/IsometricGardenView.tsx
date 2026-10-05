'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, Droplets, Flame, Sparkles, Heart, Plus, 
  RotateCw, Share2, Search, X, Check, 
  Smartphone, ChevronRight, HelpCircle, Eye, Info,
  ZoomIn, ZoomOut, Compass, Crown,
  BookOpen, Trash2, Scissors, Volume2, VolumeX, ShoppingBag, MoreHorizontal, RotateCcw,
  Maximize2, Minimize2
} from 'lucide-react';
import { getOrCreateDeviceId, useDesign } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { FLOWERS } from '@/data/flowers';
import PremiumUnlockModal from '@/components/designer/PremiumUnlockModal';
import GardenWorldFrame from './GardenWorldFrame';
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
import { addStarterCityIfWorldIsEmpty, EMPTY_GARDEN_WORLD_LAYOUT, type GardenWorldLayout } from './worldLayoutTypes';

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
  scale?: number;
  rotation?: number;
}

// Kebun baru dimulai tanpa ornamen lama. Bunga pengguna tersimpan terpisah pada state grid.
export const DEFAULT_PLACED_DECORATIONS: PlacedDecoration[] = [];
const GARDEN_SCENE_VERSION = 'diorama-meadow-v2';

// Lapisan bawah yang padat—tanpa kanopi pohon kartun—agar bunga pengguna tetap jadi fokus.
const GARDEN_BOX_FOREST = [
  ...Array.from({ length: 24 }, (_, index) => {
    const row = Math.floor(index / 6);
    return { id: `meadow-${index}`, x: 30 + (index % 6) * 70 + (row % 2) * 12, y: 38 + row * 102, type: 'meadow', scale: 0.84 + (index % 3) * 0.08 };
  }),
  ...Array.from({ length: 18 }, (_, index) => {
    const row = Math.floor(index / 6);
    return { id: `fern-${index}`, x: 46 + (index % 6) * 67 + ((row + 1) % 2) * 16, y: 68 + row * 110, type: 'fern', scale: 0.78 + (index % 4) * 0.07 };
  }),
  ...Array.from({ length: 16 }, (_, index) => {
    const row = Math.floor(index / 4);
    return { id: `wildflower-${index}`, x: 58 + (index % 4) * 98 + (row % 2) * 18, y: 88 + row * 78, type: 'wildflower', scale: 0.76 + (index % 3) * 0.08 };
  }),
  ...Array.from({ length: 14 }, (_, index) => ({ id: `lavender-${index}`, x: 44 + (index % 5) * 80 + (Math.floor(index / 5) % 2) * 24, y: 118 + Math.floor(index / 5) * 104, type: 'lavender', scale: 0.72 + (index % 3) * 0.08 })),
  ...Array.from({ length: 12 }, (_, index) => ({ id: `understory-${index}`, x: 42 + (index % 4) * 106, y: 70 + Math.floor(index / 4) * 120, type: 'shrub', scale: 0.7 + (index % 3) * 0.06 })),
];

// Pengisi lanskap hanya dekoratif: tidak mengubah 25 petak tanam atau progres kebun.
const GARDEN_LANDSCAPE_FILLERS = [
  // Kanopi besar menjadi lapisan belakang; pulau terasa seperti hutan, bukan papan tanam.
  { id: 'forest-nw-a', x: 48, y: 54, type: 'tree-lilac', scale: 1.42 },
  { id: 'forest-nw-b', x: 94, y: 72, type: 'tree-moss', scale: 1.2 },
  { id: 'forest-north-a', x: 158, y: 36, type: 'tree-lilac', scale: 1.38 },
  { id: 'forest-north-b', x: 218, y: 42, type: 'tree-moss', scale: 1.25 },
  { id: 'forest-ne-a', x: 302, y: 54, type: 'tree-lilac', scale: 1.44 },
  { id: 'forest-ne-b', x: 360, y: 82, type: 'tree-moss', scale: 1.2 },
  { id: 'forest-west-a', x: 44, y: 148, type: 'tree-moss', scale: 1.12 },
  { id: 'forest-west-b', x: 58, y: 238, type: 'tree-lilac', scale: 1.26 },
  { id: 'forest-east-a', x: 364, y: 150, type: 'tree-lilac', scale: 1.22 },
  { id: 'forest-east-b', x: 368, y: 250, type: 'tree-moss', scale: 1.3 },
  { id: 'forest-sw-a', x: 78, y: 336, type: 'tree-lilac', scale: 1.32 },
  { id: 'forest-sw-b', x: 140, y: 368, type: 'tree-moss', scale: 1.18 },
  { id: 'forest-south-a', x: 212, y: 376, type: 'tree-lilac', scale: 1.42 },
  { id: 'forest-se-a', x: 286, y: 362, type: 'tree-moss', scale: 1.25 },
  { id: 'forest-se-b', x: 342, y: 328, type: 'tree-lilac', scale: 1.3 },
  { id: 'meadow-a', x: 122, y: 126, type: 'flowerbed', scale: 1.08 },
  { id: 'meadow-b', x: 202, y: 112, type: 'flowerbed', scale: 0.98 },
  { id: 'meadow-c', x: 282, y: 146, type: 'flowerbed', scale: 1.04 },
  { id: 'grove-a', x: 152, y: 166, type: 'tree-lilac', scale: 1.05 },
  { id: 'grove-b', x: 248, y: 176, type: 'tree-moss', scale: 1.04 },
  { id: 'meadow-d', x: 122, y: 224, type: 'flowerbed', scale: 1.12 },
  { id: 'meadow-e', x: 208, y: 214, type: 'flowerbed', scale: 0.94 },
  { id: 'meadow-f', x: 288, y: 242, type: 'flowerbed', scale: 1.12 },
  { id: 'grove-c', x: 164, y: 278, type: 'tree-moss', scale: 1.02 },
  { id: 'grove-d', x: 264, y: 286, type: 'tree-lilac', scale: 1.05 },
  { id: 'meadow-g', x: 154, y: 302, type: 'flowerbed', scale: 1.02 },
  { id: 'meadow-h', x: 244, y: 316, type: 'flowerbed', scale: 1.14 },
  { id: 'meadow-i', x: 86, y: 186, type: 'flowerbed', scale: 0.94 },
  { id: 'meadow-j', x: 326, y: 198, type: 'flowerbed', scale: 0.98 },
  { id: 'meadow-k', x: 88, y: 270, type: 'flowerbed', scale: 0.9 },
  { id: 'meadow-l', x: 326, y: 294, type: 'flowerbed', scale: 0.96 },
  // Understory rapat: sengaja saling bertumpuk agar tidak ada bidang rumput kosong.
  { id: 'shrub-01', x: 78, y: 112, type: 'shrub', scale: 1.02 },
  { id: 'shrub-02', x: 124, y: 98, type: 'shrub', scale: 0.9 },
  { id: 'shrub-03', x: 178, y: 88, type: 'shrub', scale: 1.08 },
  { id: 'shrub-04', x: 238, y: 92, type: 'shrub', scale: 0.94 },
  { id: 'shrub-05', x: 296, y: 106, type: 'shrub', scale: 1.05 },
  { id: 'shrub-06', x: 342, y: 126, type: 'shrub', scale: 0.92 },
  { id: 'shrub-07', x: 90, y: 166, type: 'shrub', scale: 1.08 },
  { id: 'shrub-08', x: 136, y: 188, type: 'shrub', scale: 0.95 },
  { id: 'shrub-09', x: 194, y: 158, type: 'shrub', scale: 1.12 },
  { id: 'shrub-10', x: 252, y: 204, type: 'shrub', scale: 0.96 },
  { id: 'shrub-11', x: 316, y: 172, type: 'shrub', scale: 1.1 },
  { id: 'shrub-12', x: 338, y: 232, type: 'shrub', scale: 0.96 },
  { id: 'shrub-13', x: 82, y: 238, type: 'shrub', scale: 1.04 },
  { id: 'shrub-14', x: 122, y: 270, type: 'shrub', scale: 0.92 },
  { id: 'shrub-15', x: 188, y: 244, type: 'shrub', scale: 1.08 },
  { id: 'shrub-16', x: 228, y: 272, type: 'shrub', scale: 0.94 },
  { id: 'shrub-17', x: 286, y: 286, type: 'shrub', scale: 1.12 },
  { id: 'shrub-18', x: 330, y: 276, type: 'shrub', scale: 0.9 },
  { id: 'shrub-19', x: 92, y: 324, type: 'shrub', scale: 1.02 },
  { id: 'shrub-20', x: 152, y: 334, type: 'shrub', scale: 1.08 },
  { id: 'shrub-21', x: 212, y: 342, type: 'shrub', scale: 0.96 },
  { id: 'shrub-22', x: 264, y: 336, type: 'shrub', scale: 1.1 },
  { id: 'shrub-23', x: 318, y: 326, type: 'shrub', scale: 0.94 },
  { id: 'lavender-01', x: 116, y: 144, type: 'lavender', scale: 1.1 },
  { id: 'lavender-02', x: 224, y: 134, type: 'lavender', scale: 1.05 },
  { id: 'lavender-03', x: 300, y: 226, type: 'lavender', scale: 1.12 },
  { id: 'lavender-04', x: 164, y: 236, type: 'lavender', scale: 1.05 },
  { id: 'lavender-05', x: 222, y: 304, type: 'lavender', scale: 1.08 },
  { id: 'hedge-north', x: 205, y: 12, type: 'hedge', scale: 1.05 },
  { id: 'tree-northwest', x: 128, y: 36, type: 'tree-lilac', scale: 0.88 },
  { id: 'tree-northeast', x: 274, y: 34, type: 'tree-lilac', scale: 0.95 },
  { id: 'hedge-northwest', x: 82, y: 24, type: 'hedge', scale: 0.72 },
  { id: 'hedge-northeast', x: 326, y: 24, type: 'hedge', scale: 0.72 },
  { id: 'bloom-northeast', x: 344, y: 58, type: 'bloom', scale: 0.9 },
  { id: 'bloom-northwest', x: 56, y: 64, type: 'bloom', scale: 0.78 },
  { id: 'stone-east', x: 392, y: 218, type: 'stone', scale: 0.92 },
  { id: 'tree-east', x: 375, y: 160, type: 'tree-moss', scale: 0.8 },
  { id: 'hedge-east', x: 392, y: 124, type: 'hedge-vertical', scale: 0.68 },
  { id: 'hedge-east-lower', x: 390, y: 312, type: 'hedge-vertical', scale: 0.68 },
  { id: 'hedge-south', x: 205, y: 395, type: 'hedge', scale: 1.1 },
  { id: 'hedge-southwest', x: 85, y: 389, type: 'hedge', scale: 0.7 },
  { id: 'hedge-southeast', x: 326, y: 389, type: 'hedge', scale: 0.7 },
  { id: 'bloom-southwest', x: 60, y: 348, type: 'bloom', scale: 0.82 },
  { id: 'tree-southwest', x: 108, y: 364, type: 'tree-moss', scale: 0.8 },
  { id: 'stone-west', x: 14, y: 186, type: 'stone', scale: 0.9 },
  { id: 'hedge-west', x: 18, y: 110, type: 'hedge-vertical', scale: 0.65 },
  { id: 'hedge-west-lower', x: 20, y: 290, type: 'hedge-vertical', scale: 0.65 },
  { id: 'path-one', x: 120, y: 80, type: 'path', scale: 0.75 },
  { id: 'path-two', x: 292, y: 320, type: 'path', scale: 0.75 },
  { id: 'path-three', x: 95, y: 296, type: 'path', scale: 0.62 },
  { id: 'path-four', x: 317, y: 120, type: 'path', scale: 0.62 },
  { id: 'sparkle-one', x: 46, y: 218, type: 'sparkle', scale: 1 },
  { id: 'sparkle-two', x: 364, y: 238, type: 'sparkle', scale: 0.85 },
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
function generateDefault5x5Grid(size = 5): GardenTile[] {
  const tiles: GardenTile[] = [];
  let id = 0;
  const dimension = Math.max(5, Math.min(10, Math.floor(size) || 5));
  for (let r = 0; r < dimension; r++) {
    for (let c = 0; c < dimension; c++) {
      tiles.push({
        id: id++,
        row: r,
        col: c,
        planted: false,
        growthStage: 1,
        waterCount: 0,
        daysWatered: 0,
        wateredToday: false,
      });
    }
  }
  return tiles;
}

function resizeGardenTiles(tiles: GardenTile[], requestedSize: number): GardenTile[] {
  const existingSize = tiles.reduce((largest, tile) => Math.max(largest, tile.row + 1, tile.col + 1), 5);
  const size = Math.max(existingSize, 5, Math.min(10, Math.floor(requestedSize) || 5));
  const next = generateDefault5x5Grid(size);
  tiles.forEach((tile) => {
    if (tile.row < size && tile.col < size) {
      const id = tile.row * size + tile.col;
      next[id] = { ...next[id], ...tile, id, row: tile.row, col: tile.col };
    }
  });
  return next;
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
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const syncFullscreenState = () => setIsGardenFullscreen(document.fullscreenElement === gardenContainerRef.current);
    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings/pricing')
      .then((response) => response.json())
      .then((data) => {
        const configuredSize = Number(data?.pricing?.gardenSize);
        const configuredFieldSize = Number(data?.pricing?.gardenFieldSize);
        if (!cancelled && Number.isFinite(configuredFieldSize)) {
          setGardenFieldSize(Math.max(8, Math.min(16, Math.floor(configuredFieldSize))));
        }
        if (cancelled || !Number.isFinite(configuredSize)) return;
        const nextSize = Math.max(5, Math.min(10, Math.floor(configuredSize)));
        setGardenSize(nextSize);
        setTiles((current) => {
          const resized = resizeGardenTiles(current, nextSize);
          try { localStorage.setItem('bucket_garden_grid_v5', JSON.stringify(resized)); } catch {}
          return resized;
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  
  // ── Garden State ──
  const [gardenName, setGardenName] = useState('Kebun Cinta Laysa');
  const [partnerName, setPartnerName] = useState('Pasangan Bahagia');
  const [gardenCode, setGardenCode] = useState('');
  const [streakCount, setStreakCount] = useState(14);
  const [gardenSize, setGardenSize] = useState(5);
  const [gardenFieldSize, setGardenFieldSize] = useState(8);
  const [isGardenFullscreen, setIsGardenFullscreen] = useState(false);
  const [tiles, setTiles] = useState<GardenTile[]>(() => generateDefault5x5Grid());
  const [placedDecos, setPlacedDecos] = useState<PlacedDecoration[]>(DEFAULT_PLACED_DECORATIONS);
  const [worldLayout, setWorldLayout] = useState<GardenWorldLayout>(EMPTY_GARDEN_WORLD_LAYOUT);
  const [worldLayoutRevision, setWorldLayoutRevision] = useState(0);
  const [worldSaveStatus, setWorldSaveStatus] = useState<'loading' | 'saving' | 'saved' | 'device' | 'error'>('loading');
  const [worldSaveError, setWorldSaveError] = useState('');
  const [gardenLocalReady, setGardenLocalReady] = useState(false);
  const [gardenLinkRevision, setGardenLinkRevision] = useState(0);
  const [seedFeedback, setSeedFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const tilesRef = useRef(tiles);
  const placedDecosRef = useRef(placedDecos);
  tilesRef.current = tiles;
  placedDecosRef.current = placedDecos;
  const worldDeviceIdRef = useRef('');
  const worldStorageReadyRef = useRef(false);
  const worldSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const worldSaveRequestRef = useRef(0);
  const worldLayoutLoadedRef = useRef(false);

  const persistWorldLayout = useCallback((layout: GardenWorldLayout, deviceId: string, remote = true) => {
    const requestId = ++worldSaveRequestRef.current;
    const storageKey = `bucket_garden_world_layout_v1:${deviceId}`;
    try { localStorage.setItem(storageKey, JSON.stringify(layout)); } catch {}

    if (!remote || !worldStorageReadyRef.current) {
      setWorldSaveStatus('device');
      return;
    }

    setWorldSaveStatus('saving');
    if (worldSaveTimerRef.current) clearTimeout(worldSaveTimerRef.current);
    worldSaveTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/garden/world-layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId, layout, tiles: tilesRef.current, placedDecorations: placedDecosRef.current }),
        });
        const result = await response.json();
        if (requestId !== worldSaveRequestRef.current) return;
        if (!response.ok || !result.success) {
          setWorldSaveStatus(result.gardenNotLinked ? 'device' : 'error');
          setWorldSaveError(result.message || 'Gagal menyimpan tata letak kebun ke Supabase.');
          return;
        }
        setWorldSaveError('');
        setWorldSaveStatus('saved');
      } catch {
        if (requestId === worldSaveRequestRef.current) {
          setWorldSaveError('Koneksi ke Supabase terputus. Data lokal tetap tersimpan.');
          setWorldSaveStatus('error');
        }
      }
    }, 650);
  }, []);

  useEffect(() => {
    const handleGardenLinkUpdate = () => setGardenLinkRevision((revision) => revision + 1);
    window.addEventListener('bucket-garden-link-updated', handleGardenLinkUpdate);
    return () => window.removeEventListener('bucket-garden-link-updated', handleGardenLinkUpdate);
  }, []);

  const handleWorldLayoutChange = useCallback((layout: GardenWorldLayout) => {
    if (!worldLayoutLoadedRef.current) return;
    setWorldLayout(layout);
    persistWorldLayout(layout, worldDeviceIdRef.current);
  }, [persistWorldLayout]);

  useEffect(() => {
    if (!gardenLocalReady) return;
    try {
      localStorage.setItem('bucket_garden_grid_v5', JSON.stringify(tiles));
      localStorage.setItem('bucket_garden_placed_decorations_v2', JSON.stringify(placedDecos));
    } catch {
      setWorldSaveError('Penyimpanan browser penuh atau diblokir; progres bunga tidak dapat disimpan di perangkat ini.');
      setWorldSaveStatus('error');
      return;
    }
    if (!worldLayoutLoadedRef.current || worldLayoutRevision < 1) return;
    persistWorldLayout(worldLayout, worldDeviceIdRef.current, true);
  }, [gardenLocalReady, tiles, placedDecos, worldLayout, worldLayoutRevision, persistWorldLayout]);

  useEffect(() => {
    if (!gardenLocalReady) return;
    worldLayoutLoadedRef.current = false;
    worldStorageReadyRef.current = false;
    setWorldSaveStatus('loading');
    const deviceId = getOrCreateDeviceId();
    if (!deviceId) {
      worldLayoutLoadedRef.current = true;
      setWorldSaveStatus('device');
      return;
    }
    worldDeviceIdRef.current = deviceId;
    const storageKey = `bucket_garden_world_layout_v1:${deviceId}`;
    let localLayout: GardenWorldLayout | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) localLayout = JSON.parse(raw) as GardenWorldLayout;
    } catch {}

    let cancelled = false;
    const loadLayout = async () => {
      try {
        let linkWarning = '';
        const gardenResponse = await fetch(`/api/garden?deviceId=${encodeURIComponent(deviceId)}`, { cache: 'no-store' });
        const gardenResult = await gardenResponse.json();
        if (gardenResult.success && gardenResult.garden?.gardenCode) {
          const syncResponse = await fetch('/api/garden', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sync-local', deviceId, gardenCode: gardenResult.garden.gardenCode }),
          });
          const syncResult = await syncResponse.json();
          if (!syncResponse.ok || !syncResult.success) linkWarning = syncResult.message || 'Kebun belum dapat ditautkan ke Supabase.';
        }

        const response = await fetch(`/api/garden/world-layout?deviceId=${encodeURIComponent(deviceId)}`, { cache: 'no-store' });
        const result = await response.json();
        if (cancelled) return;
        if (response.ok && result.success) {
          worldStorageReadyRef.current = true;
          setGardenCode(String(result.gardenCode || ''));
          if (result.layout && typeof result.layout === 'object') {
            const initialLayout = addStarterCityIfWorldIsEmpty(result.layout as GardenWorldLayout);
            setWorldLayout(initialLayout);
            try { localStorage.setItem(storageKey, JSON.stringify(initialLayout)); } catch {}
          } else if (localLayout) {
            const initialLayout = addStarterCityIfWorldIsEmpty(localLayout);
            setWorldLayout(initialLayout);
            try { localStorage.setItem(storageKey, JSON.stringify(initialLayout)); } catch {}
          } else {
            const initialLayout = addStarterCityIfWorldIsEmpty(EMPTY_GARDEN_WORLD_LAYOUT);
            setWorldLayout(initialLayout);
            try { localStorage.setItem(storageKey, JSON.stringify(initialLayout)); } catch {}
          }
          if (Array.isArray(result.tiles)) {
            setTiles(result.tiles as GardenTile[]);
            try { localStorage.setItem('bucket_garden_grid_v5', JSON.stringify(result.tiles)); } catch {}
          }
          if (Array.isArray(result.placedDecorations)) {
            setPlacedDecos(result.placedDecorations as PlacedDecoration[]);
            try { localStorage.setItem('bucket_garden_placed_decorations_v2', JSON.stringify(result.placedDecorations)); } catch {}
          }
          const hasSavedState = result.hasSavedState === true;
          setWorldSaveStatus(hasSavedState ? 'saved' : 'saving');
          setWorldSaveError(hasSavedState
            ? (result.gardenLinked ? '' : linkWarning
              ? `${linkWarning} Tata letak tersimpan terenkripsi untuk perangkat ini.`
              : 'Tata letak tersimpan terenkripsi di Supabase untuk perangkat ini; tautkan kode kebun bila ingin berbagi scene dengan pasangan.')
            : 'Belum ada tata letak tersimpan. Sedang membuat snapshot pertama di Supabase…');
        } else {
          if (localLayout) setWorldLayout(addStarterCityIfWorldIsEmpty(localLayout));
          worldStorageReadyRef.current = false;
          setGardenCode('');
          setWorldSaveStatus('error');
          setWorldSaveError(linkWarning || result.message || 'Gagal memuat data kebun dari Supabase.');
        }
      } catch {
        if (cancelled) return;
        worldStorageReadyRef.current = false;
        if (localLayout) setWorldLayout(addStarterCityIfWorldIsEmpty(localLayout));
        setWorldSaveStatus('error');
        setWorldSaveError('Koneksi ke Supabase terputus. Tata letak lokal tetap dipertahankan.');
      } finally {
        if (!cancelled) {
          worldLayoutLoadedRef.current = true;
          setWorldLayoutRevision((revision) => revision + 1);
        }
      }
    };
    void loadLayout();
    return () => {
      cancelled = true;
      if (worldSaveTimerRef.current) clearTimeout(worldSaveTimerRef.current);
    };
  }, [gardenLocalReady, gardenLinkRevision]);

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
      text: 'Selamat datang di Kebun Bunga! Pilih bibit dari koleksi bunga dan siram setiap hari agar tumbuh menjadi puspa cahaya 💕',
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
  const [waterFeedback, setWaterFeedback] = useState<{ tileId: number; alreadyWatered: boolean } | null>(null);

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
    setGardenLocalReady(false);
    try {
      // One-time reset of the old pre-filled garden; preserves profile, basket and flower collection.
      localStorage.removeItem('bucket_garden_5x5_grid_v3');
      localStorage.removeItem('bucket_garden_grid_v4');
      const savedGridRaw = localStorage.getItem('bucket_garden_grid_v5');
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
        const initial = generateDefault5x5Grid(gardenSize);
        setTiles(initial);
        localStorage.setItem('bucket_garden_grid_v5', JSON.stringify(initial));
      }

      // Reset ornamen kebun lama satu kali untuk lanskap diorama baru; bunga/grid tidak disentuh.
      const savedDecoRaw = localStorage.getItem('bucket_garden_placed_decorations_v2');
      const hasCurrentScene = localStorage.getItem('bucket_garden_scene_version') === GARDEN_SCENE_VERSION;
      if (!hasCurrentScene) {
        setPlacedDecos([]);
        localStorage.setItem('bucket_garden_placed_decorations_v2', JSON.stringify([]));
        localStorage.setItem('bucket_garden_scene_version', GARDEN_SCENE_VERSION);
      } else if (savedDecoRaw) {
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
      setTiles(generateDefault5x5Grid(gardenSize));
    }
    setGardenLocalReady(true);

    return () => {
      soundscapeRef.current?.stop();
    };
  }, [gardenSize]);

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
    try {
      localStorage.setItem('bucket_garden_grid_v5', JSON.stringify(newTiles));
    } catch {
      const message = 'Penyimpanan perangkat penuh atau diblokir. Bibit belum dapat disimpan.';
      setWorldSaveError(message);
      setWorldSaveStatus('error');
      return false;
    }
    setTiles(newTiles);
    return true;
  }, []);

  // ── TRIGGER WATERING WITH DAILY STREAK LOGIC (PER HARI, BUKAN CEPAT MEKAR) ──
  const waterTile = useCallback((tileId: number) => {
    const todayStr = getTodayDateStr();
    const tileBeforeWatering = tiles.find(t => t.id === tileId);
    const wasAlreadyWatered = tileBeforeWatering?.lastWateredDate === todayStr;
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
        localStorage.setItem('bucket_garden_grid_v5', JSON.stringify(updated));
      } catch {}

      return updated;
    });

    // 1. Respons game: siraman baru memantul, siraman ulang hanya memunculkan status segar.
    if (!wasAlreadyWatered) {
      setWateredTileAnimations(prev => new Set(prev).add(tileId));
    }
    setTimeout(() => {
      setWateredTileAnimations(prev => {
        const next = new Set(prev);
        next.delete(tileId);
        return next;
      });
    }, 850);
    setWaterFeedback({ tileId, alreadyWatered: wasAlreadyWatered });
    setTimeout(() => setWaterFeedback(current => current?.tileId === tileId ? null : current), wasAlreadyWatered ? 900 : 1400);

    // 2. Live Water Splash & Soil Ripple
    const splashId = Date.now() + Math.random();
    const particles = wasAlreadyWatered ? [
      { id: 1, tx: -12, ty: -16, char: '✦' },
      { id: 2, tx: 12, ty: -16, char: '✦' },
      { id: 3, tx: 0, ty: -24, char: '✓' },
    ] : [
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

  // ── PLANT A FLOWER (MULAI DARI BIBIT TUNAS MUNGIL) ──
  const handlePlantFlower = (flower: GardenFlowerDef) => {
    if (worldSaveStatus === 'loading') {
      setSeedFeedback({ tone: 'error', message: 'Data kebun masih dimuat dari Supabase. Tunggu sebentar, lalu coba tanam lagi.' });
      return;
    }
    if (targetTileId === null) {
      setSeedFeedback({ tone: 'error', message: 'Belum ada petak kosong yang dipilih. Tutup katalog, lalu klik petak kosong di kebun.' });
      return;
    }
    const selectedTile = tiles.find((tile) => tile.id === targetTileId);
    if (!selectedTile || selectedTile.planted) {
      setSeedFeedback({ tone: 'error', message: 'Petak ini sudah terisi atau tidak ditemukan. Pilih petak kosong lagi.' });
      setTargetTileId(null);
      return;
    }

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

    if (!updateTilesAndSave(newTiles)) {
      setSeedFeedback({ tone: 'error', message: 'Bibit belum ditanam karena penyimpanan perangkat gagal. Periksa ruang penyimpanan browser lalu coba lagi.' });
      return;
    }
    setTargetTileId(null);
    setSeedFeedback(null);
    setIsSeedModalOpen(false);
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
      scale: 1,
      rotation: 0,
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

  // ── KUSTOMISASI ORNAMEN: ukuran & putaran tersimpan bersama posisi ──
  const updateDecorationTransform = (id: string, patch: Partial<Pick<PlacedDecoration, 'scale' | 'rotation'>>) => {
    setPlacedDecos(current => {
      const updated = current.map(deco => deco.id === id ? { ...deco, ...patch } : deco);
      try {
        localStorage.setItem('bucket_garden_placed_decorations_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setInspectDeco(current => current?.id === id ? { ...current, ...patch } : current);
    playSound('click');
  };

  const handleDecorationMove3D = (id: string, x: number, y: number) => {
    setPlacedDecos(current => {
      const updated = current.map(deco => deco.id === id ? { ...deco, x, y } : deco);
      try {
        localStorage.setItem('bucket_garden_placed_decorations_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });
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

  }, [isDraggingWaterCan]);

  // Tile targeting is now raycast against the real 3D garden surface.
  useEffect(() => {
    if (!isDraggingWaterCan || activeHoverTileId === null) return;
    const tile = tiles.find(candidate => candidate.id === activeHoverTileId);
    if (tile?.planted && !tile.wateredToday) waterTile(tile.id);
  }, [activeHoverTileId, isDraggingWaterCan, tiles, waterTile]);

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

  const openSeedPicker = (preferredTile?: GardenTile) => {
    const currentPreferredTile = preferredTile
      ? tiles.find((tile) => tile.id === preferredTile.id && !tile.planted)
      : undefined;
    const emptyTile = currentPreferredTile || tiles.find((tile) => !tile.planted);
    setTargetTileId(emptyTile?.id ?? null);
    setSeedFeedback(emptyTile ? null : {
      tone: 'error',
      message: 'Semua petak sudah terisi. Kosongkan atau petik bunga sebelum menanam lagi.',
    });
    // Always reopen on the flower catalog with a clean search so stale filter
    // state cannot make the popup appear blank or show only ornaments.
    setSeedPickerTab('flowers');
    setSelectedCategory('Semua');
    setSearchQuery('');
    setIsSeedModalOpen(true);
    playSound('click');
  };

  const closeSeedPicker = () => {
    setIsSeedModalOpen(false);
    setTargetTileId(null);
    setSeedFeedback(null);
  };

  useEffect(() => {
    if (!isSeedModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSeedModalOpen(false);
        setTargetTileId(null);
        setSeedFeedback(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSeedModalOpen]);

  // ── Tile Click Handler (MURNI UNTUK TANAM BUNGA PADA 25 PETAK TANAH) ──
  const handleTileClick = (tile: GardenTile) => {
    if (!tile.planted) {
      openSeedPicker(tile);
      return;
    }
    setTargetTileId(tile.id);
    setInspectTile(tile);
    playSound('click');
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
                {plantedCount}/{tiles.length} {isEn ? 'Planted 🌸' : 'Ditanam 🌸'}
              </span>
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
              className="garden-hud-btn garden-desktop-secondary"
              onClick={() => { setIsHerbariumOpen(true); playSound('click'); }}
              title={isEn ? 'Encyclopedia of 40 Flowers (Flora Dex)' : 'Ensiklopedia 40 Bunga (Flora Dex)'}
            >
              <BookOpen size={14} className="text-amber-300" />
              <span className="hidden md:inline">{isEn ? 'Collection' : 'Koleksi'} ({discoveredKeys.size}/40)</span>
            </button>

            {/* Diary Catatan Cinta */}
            <button
              type="button"
              className="garden-hud-btn garden-desktop-secondary"
              onClick={() => setIsNotesModalOpen(true)}
              title={isEn ? 'Love Notes Diary' : 'Buku Catatan Cinta'}
            >
              <Heart size={14} className="text-pink-400" />
              <span className="hidden md:inline">Diary</span>
            </button>

            {/* Undang Pasangan */}
            <button
              type="button"
              className="garden-hud-btn garden-desktop-secondary"
              onClick={() => setIsCodeModalOpen(true)}
              title={isEn ? 'Invite Partner (Garden Code)' : 'Undang Pasangan (Kode Kebun)'}
            >
              <Share2 size={14} className="text-amber-400" />
              <span className="hidden md:inline">{isEn ? 'Invite' : 'Undang'}</span>
            </button>

            {/* Language Switcher */}
            <div className="garden-language-switcher">
              <LanguageSwitcher variant="compact" />
            </div>

            {/* Mobile overflow keeps secondary actions reachable without crowding the header. */}
            <div className="garden-mobile-tools">
              <button
                type="button"
                className={`garden-mobile-tools-trigger ${isMobileToolsOpen ? 'active' : ''}`}
                onClick={() => setIsMobileToolsOpen((open) => !open)}
                aria-expanded={isMobileToolsOpen}
                aria-controls="garden-mobile-tools-menu"
                title={isEn ? 'More garden tools' : 'Alat kebun lainnya'}
              >
                <MoreHorizontal size={18} />
                <span className="sr-only">{isEn ? 'More garden tools' : 'Alat kebun lainnya'}</span>
              </button>
              {isMobileToolsOpen && (
                <div id="garden-mobile-tools-menu" className="garden-mobile-tools-menu">
                  <button type="button" onClick={() => { setIsHerbariumOpen(true); setIsMobileToolsOpen(false); playSound('click'); }}>
                    <BookOpen size={16} />
                    <span>{isEn ? 'Collection' : 'Koleksi'} ({discoveredKeys.size}/40)</span>
                  </button>
                  <button type="button" onClick={() => { setIsNotesModalOpen(true); setIsMobileToolsOpen(false); playSound('click'); }}>
                    <Heart size={16} />
                    <span>{isEn ? 'Love diary' : 'Diary cinta'}</span>
                  </button>
                  <button type="button" onClick={() => { setIsCodeModalOpen(true); setIsMobileToolsOpen(false); playSound('click'); }}>
                    <Share2 size={16} />
                    <span>{isEn ? 'Invite partner' : 'Undang pasangan'}</span>
                  </button>
                  <div className="garden-mobile-language-row">
                    <span>{isEn ? 'Language' : 'Bahasa'}</span>
                    <LanguageSwitcher variant="compact" />
                  </div>
                </div>
              )}
            </div>
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
      <main className="garden-stage-viewport select-none">
        <div className="garden-stage-toolbar" role="toolbar" aria-label="Alat utama kebun">
          <button
            ref={waterCanBtnRef}
            type="button"
            id="tool-btn-watering-can"
            className={`garden-stage-tool water ${isDraggingWaterCan ? 'active' : ''}`}
            onPointerDown={(event) => {
              event.preventDefault();
              handleStartWaterDrag(event.clientX, event.clientY);
            }}
            title="Sentuh dan geser ke petak untuk menyiram"
          >
            <Droplets size={17} />
            <span>Penyiram <small>{wateredCount}/{tiles.length}</small></span>
          </button>
          <button type="button" className="garden-stage-tool water-all" onClick={handleWaterAll} title="Siram semua bunga">
            <Sparkles size={16} /> <span>Siram semua</span>
          </button>
          <button
            type="button"
            className="garden-stage-tool plant"
            onClick={() => openSeedPicker()}
            title="Pilih bibit bunga untuk ditanam"
          >
            <Plus size={17} /> <span>Tanam bibit</span>
          </button>
          <button
            type="button"
            className="garden-stage-tool fullscreen"
            onClick={async () => {
              try {
                if (document.fullscreenElement) {
                  await document.exitFullscreen();
                  (screen.orientation as ScreenOrientation & { unlock?: () => void }).unlock?.();
                  return;
                }
                const container = gardenContainerRef.current;
                if (!container?.requestFullscreen) {
                  triggerToast('Mode layar penuh tidak didukung browser ini. Coba putar HP ke posisi mendatar.');
                  return;
                }
                await container.requestFullscreen();
                const orientation = screen.orientation as ScreenOrientation & { lock?: (mode: string) => Promise<void> };
                try { await orientation.lock?.('landscape'); } catch { /* Browser atau perangkat menolak kunci orientasi. */ }
              } catch {
                triggerToast('Browser menolak layar penuh. Putar HP ke posisi mendatar untuk tampilan terbaik.');
              }
            }}
            aria-label={isGardenFullscreen ? 'Keluar dari layar penuh' : 'Layar penuh dan mode lanskap'}
            title={isGardenFullscreen ? 'Keluar layar penuh' : 'Layar penuh · lanskap bila didukung'}
          >
            {isGardenFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            <span>{isGardenFullscreen ? 'Keluar' : 'Layar penuh'}</span>
          </button>
        </div>
        <GardenWorldFrame
          tiles={tiles}
          gardenSize={Math.max(gardenSize, Math.ceil(Math.sqrt(tiles.length)))}
          fieldSize={gardenFieldSize}
          worldLayout={worldLayout}
          worldLayoutRevision={worldLayoutRevision}
          worldSaveStatus={worldSaveStatus}
          worldSaveError={worldSaveError}
          wateredTileAnimations={wateredTileAnimations}
          isWaterDragging={isDraggingWaterCan}
          onTileClick={handleTileClick}
          onTileHover={setActiveHoverTileId}
          onWorldLayoutChange={handleWorldLayoutChange}
        />

        {/* 3D ISOMETRIC ISLAND PLATFORM (100% Persis Desain Asli, Rotatable 360°) */}
        <div 
          className="island-3d-wrapper garden-legacy-scene"
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
            {/* Bayangan dasar, tanpa pedestal putih yang memunculkan celah visual. */}
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
              {/* Lanskap pengisi mengikuti pulau 360°, tetapi tidak pernah menutup area tanam. */}
              <div className="garden-landscape-fillers garden-box-forest" aria-hidden="true">
                {GARDEN_BOX_FOREST.map((filler) => (
                  <span
                    key={filler.id}
                    className={`garden-landscape-filler filler-${filler.type}`}
                    style={{
                      left: `${filler.x}px`,
                      top: `${filler.y}px`,
                      transform: `translate(-50%, -50%) rotateZ(${-yaw}deg) rotateX(${-pitch}deg) scale(${filler.scale})`,
                    }}
                  />
                ))}
              </div>
              <div className="garden-living-activity" aria-hidden="true">
                {[
                  { id: 'butterfly-a', x: 104, y: 104, kind: 'butterfly', delay: '0s' },
                  { id: 'butterfly-b', x: 306, y: 256, kind: 'butterfly', delay: '1.8s' },
                  { id: 'bee-a', x: 274, y: 96, kind: 'bee', delay: '0.8s' },
                  { id: 'firefly-a', x: 74, y: 264, kind: 'firefly', delay: '1.2s' },
                  { id: 'firefly-b', x: 336, y: 352, kind: 'firefly', delay: '2.4s' },
                ].map((activity) => (
                  <span
                    key={activity.id}
                    className={`garden-activity ${activity.kind}`}
                    style={{
                      left: `${activity.x}px`,
                      top: `${activity.y}px`,
                      animationDelay: activity.delay,
                      transform: `translate(-50%, -50%) rotateZ(${-yaw}deg) rotateX(${-pitch}deg)`,
                    }}
                  />
                ))}
              </div>
              {/* 5x5 Isometric Grid Cells */}
              <div className="grid-5x5-isometric">
                {tiles.map((tile) => {
                  const isHoveredByWaterCan = activeHoverTileId === tile.id;
                  const isWaterBounceActive = wateredTileAnimations.has(tile.id);
                  const isSelected = targetTileId === tile.id;
                  const stage = tile.growthStage || 1;
                  const activeSplash = splashEffects.find(s => s.tileId === tile.id);
                  const isCurrentWaterFeedback = waterFeedback?.tileId === tile.id;

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
                      } ${isWaterBounceActive ? 'flower-being-watered' : ''} ${
                        isCurrentWaterFeedback ? (waterFeedback?.alreadyWatered ? 'water-already-feedback' : 'water-fresh-feedback') : ''
                      }`}
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

                      {isCurrentWaterFeedback && (
                        <span className={`water-status-pop ${waterFeedback?.alreadyWatered ? 'already' : 'fresh'}`}>
                          {waterFeedback?.alreadyWatered ? '✓ Sudah segar' : '💧 Segar!'}
                        </span>
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
                        <div className="tile-empty-gardenbed" style={{ transform: `translate(-50%, -50%) rotateZ(${-yaw}deg) rotateX(${-pitch}deg)` }}>
                          <span className={`gardenbed-foliage bed-${tile.id % 4}`} />
                          <span className="gardenbed-flower flower-one" />
                          <span className="gardenbed-flower flower-two" />
                          <span className="gardenbed-plant-cta"><Plus size={13} /><span>Tanam</span></span>
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
                        transform: `rotateZ(${-yaw}deg) rotateX(${-pitch}deg) rotateZ(${deco.rotation || 0}deg) scale(${deco.scale || 1})`
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
        <div className="three-orbit-controls-hud garden-legacy-controls">
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
        <div className="three-orbit-hint garden-legacy-hint">
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

      {/* ── 7. SEED PICKER MODAL (MURNI 40 VARIETAS BUNGA) ── */}
      {isSeedModalOpen && typeof document !== 'undefined' && createPortal((
        <div className="garden-modal-backdrop garden-seed-picker-backdrop" onClick={closeSeedPicker}>
          <div className="garden-modal-box seed-picker-box" role="dialog" aria-modal="true" aria-labelledby="garden-seed-picker-heading" onClick={e => e.stopPropagation()}>
            <div className="garden-modal-header">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌱</span>
                  <h3 id="garden-seed-picker-heading" className="modal-heading-text">Pilih Varietas Bibit (40 Spesies)</h3>
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
                onClick={closeSeedPicker}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <p className="modal-sub-desc">
              Pilih bunga impianmu! Bunga akan ditanam mulai dari <strong>bibit tunas mungil</strong> dan bertumbuh seiring kamu menyiramnya setiap hari 🌱💧
            </p>

            {(seedFeedback || worldSaveStatus === 'loading') && (
              <div className={`garden-seed-save-feedback feedback-${seedFeedback?.tone || 'success'}`} role="status" aria-live="polite">
                <strong>{seedFeedback?.message || 'Memuat status dan isi kebun sebelum bibit ditanam…'}</strong>
                <span>
                  {worldSaveStatus === 'saving' ? 'Mengirim perubahan ke Supabase…' :
                    worldSaveStatus === 'saved' ? 'Tata letak dan petak bunga sudah tersinkron.' :
                    worldSaveStatus === 'device' ? 'Belum tersinkron ke Supabase; perubahan tetap ada di perangkat ini.' :
                    worldSaveStatus === 'error' ? 'Sinkronisasi Supabase gagal.' : 'Menyiapkan penyimpanan…'}
                </span>
                {worldSaveError && <small>{worldSaveError}</small>}
                {targetTileId === null && (
                  <button type="button" onClick={() => { setIsSeedModalOpen(false); setSeedFeedback(null); }}>
                    {tiles.some((tile) => !tile.planted) ? 'Tutup, lalu pilih petak lain' : 'Tutup katalog'}
                  </button>
                )}
              </div>
            )}

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
                <article
                  key={flower.key}
                  className={`seed-option-card ${targetTileId === null || worldSaveStatus === 'loading' ? 'seed-option-disabled' : ''}`}
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
                    <span className="seed-meaning">&ldquo;{flower.meaning}&rdquo;</span>
                  </div>

                  <button
                    type="button" 
                    className="seed-pick-btn"
                    disabled={targetTileId === null || worldSaveStatus === 'loading'}
                    onClick={() => handlePlantFlower(flower)}
                  >
                    Tanam Bibit 🌱
                  </button>
                </article>
              ))}

                {filteredFlowers.length === 0 && (
                <div className="text-center py-8 text-slate-500 font-sans text-sm col-span-full">
                  Tidak ada bunga yang cocok dengan pencarian "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        </div>
      ), document.body)}

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

                  <div className="deco-customizer" aria-label="Kustomisasi ornamen">
                    <div className="deco-customizer-heading">
                      <span>Kustomisasi ornamen</span>
                      <button
                        type="button"
                        onClick={() => updateDecorationTransform(inspectDeco.id, { scale: 1, rotation: 0 })}
                        title="Kembalikan ukuran dan putaran awal"
                      >
                        <RotateCcw size={13} /> Reset
                      </button>
                    </div>
                    <div className="deco-customizer-grid">
                      <div className="deco-adjustment">
                        <span>Ukuran</span>
                        <div className="deco-adjustment-controls">
                          <button type="button" onClick={() => updateDecorationTransform(inspectDeco.id, { scale: Math.max(0.7, Number(((inspectDeco.scale ?? 1) - 0.1).toFixed(1))) })} aria-label="Perkecil ornamen">−</button>
                          <strong>{Math.round((inspectDeco.scale ?? 1) * 100)}%</strong>
                          <button type="button" onClick={() => updateDecorationTransform(inspectDeco.id, { scale: Math.min(1.5, Number(((inspectDeco.scale ?? 1) + 0.1).toFixed(1))) })} aria-label="Perbesar ornamen">+</button>
                        </div>
                      </div>
                      <div className="deco-adjustment">
                        <span>Putaran</span>
                        <div className="deco-adjustment-controls">
                          <button type="button" onClick={() => updateDecorationTransform(inspectDeco.id, { rotation: (inspectDeco.rotation ?? 0) - 15 })} aria-label="Putar ornamen ke kiri">↶</button>
                          <strong>{inspectDeco.rotation ?? 0}°</strong>
                          <button type="button" onClick={() => updateDecorationTransform(inspectDeco.id, { rotation: (inspectDeco.rotation ?? 0) + 15 })} aria-label="Putar ornamen ke kanan">↷</button>
                        </div>
                      </div>
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
              <div className="code-badge-massive">{gardenCode || 'Belum terhubung'}</div>
              <p className="code-desc">
                {gardenCode
                  ? 'Bagikan kode kebun ini ke pasangan agar dekorasi 3D dan kebun tersinkron di perangkat kalian.'
                  : 'Buat atau gabung kebun memakai kode dari Menu terlebih dahulu. Setelah terhubung, tata letak 3D akan tersimpan dan tersinkron di sini.'}
              </p>
            </div>

            <button
              type="button"
              className="copy-code-btn"
              disabled={!gardenCode}
              onClick={() => {
                if (gardenCode && typeof navigator !== 'undefined') {
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
