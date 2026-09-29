'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, Droplets, Flame, Sparkles, Heart, Plus, 
  RotateCw, Share2, Search, X, Check, 
  Smartphone, ChevronRight, HelpCircle, Eye, Info,
  ZoomIn, ZoomOut, Compass
} from 'lucide-react';
import { useDesign } from '@/context/DesignContext';
import { 
  GARDEN_40_FLOWERS, 
  GARDEN_CATEGORIES, 
  GardenFlowerDef, 
  getFlowerByKey 
} from '@/data/gardenCatalog';
import { encryptGardenData, decryptGardenData } from '@/lib/cryptoGarden';

// ── Types ──
export interface GardenTile {
  id: number;
  row: number;
  col: number;
  planted: boolean;
  flowerKey?: string;
  flowerName?: string;
  flowerLatin?: string;
  flowerCategory?: string;
  flowerImage?: string;
  flowerColor?: string;
  growthStage?: 1 | 2 | 3 | 4; // 1: Bibit (Tunas), 2: Kuncup, 3: Mekar Sempurna, 4: Puspa Cahaya
  waterCount?: number; // Akumulasi frekuensi penyiraman
  wateredToday?: boolean;
  lastWateredTime?: string;
  plantedAt?: string;
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
        wateredToday: false,
        plantedAt: flower ? new Date().toISOString() : undefined,
      });
    }
  }
  return tiles;
}

export default function IsometricGardenView() {
  const { premiumUserName } = useDesign();
  
  // ── Garden State ──
  const [gardenName, setGardenName] = useState('Kebun Cinta Laysa');
  const [partnerName, setPartnerName] = useState('Pasangan Bahagia');
  const [gardenCode, setGardenCode] = useState('LAY777');
  const [streakCount, setStreakCount] = useState(14);
  const [focusedHours, setFocusedHours] = useState('9.2');
  const [tiles, setTiles] = useState<GardenTile[]>(() => generateDefault5x5Grid());
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
  const [inspectTile, setInspectTile] = useState<GardenTile | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLandscapeHintDismissed, setIsLandscapeHintDismissed] = useState(false);
  const [bgMode, setBgMode] = useState<'gemini' | 'sky'>('gemini');

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

  // ── 40 Flower Filter & Search State ──
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

      if (savedGridRaw) {
        const parsedGrid: GardenTile[] = JSON.parse(savedGridRaw);
        const migratedGrid = parsedGrid.map(t => {
          if (t.planted && t.flowerKey) {
            const def = getFlowerByKey(t.flowerKey);
            if (def) {
              return {
                ...t,
                flowerImage: def.image,
                flowerName: def.name,
                flowerLatin: def.latinName,
                flowerCategory: def.category,
                flowerColor: def.colorHex
              };
            }
          }
          return t;
        });
        setTiles(migratedGrid);
      } else {
        const initial = generateDefault5x5Grid();
        setTiles(initial);
        localStorage.setItem('bucket_garden_5x5_grid_v3', JSON.stringify(initial));
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
  }, []);

  // ── Save Tiles to Local Storage ──
  const updateTilesAndSave = useCallback((newTiles: GardenTile[]) => {
    setTiles(newTiles);
    try {
      localStorage.setItem('bucket_garden_5x5_grid_v3', JSON.stringify(newTiles));
    } catch (e) {
      console.warn('Storage save warning:', e);
    }
  }, []);

  // ── TRIGGER WATERING WITH LIVING ANIMATIONS ──
  const waterTile = useCallback((tileId: number) => {
    let growthOccurred = false;
    let newStageReached: number | null = null;
    let targetFlowerName = 'Bunga';

    setTiles(prev => {
      const updated = prev.map(t => {
        if (t.id === tileId && t.planted) {
          targetFlowerName = t.flowerName || 'Bunga';
          const currentCount = (t.waterCount || 0) + 1;
          
          // Perkembangan pertumbuhan:
          // 0 siraman -> Stage 1 (Bibit Tunas Mungil)
          // 1-2 siraman -> Stage 2 (Kuncup Mekar Bersemi)
          // 3-5 siraman -> Stage 3 (Bunga Mekar Sempurna)
          // 6+ siraman -> Stage 4 (Puspa Cahaya Radiant)
          let calculatedStage: 1 | 2 | 3 | 4 = 1;
          if (currentCount >= 6) calculatedStage = 4;
          else if (currentCount >= 3) calculatedStage = 3;
          else if (currentCount >= 1) calculatedStage = 2;

          if (calculatedStage > (t.growthStage || 1)) {
            growthOccurred = true;
            newStageReached = calculatedStage;
          }

          return {
            ...t,
            waterCount: currentCount,
            growthStage: calculatedStage,
            wateredToday: true,
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
    setTimeout(() => playSound(growthOccurred ? 'growth' : 'chime'), 100);

    // 4. Visual Feedback Toast
    if (growthOccurred && newStageReached) {
      const stageLabels: Record<number, string> = {
        2: '🌿 Kuncup Mekar Bersemi',
        3: '🌸 Bunga Mekar Sempurna',
        4: '✨ Puspa Cahaya Keemasan Radiant'
      };
      triggerToast(`🎉 LEVEL UP! ${targetFlowerName} berkembang menjadi ${stageLabels[newStageReached]}!`);
    } else {
      triggerToast(`💧 ${targetFlowerName} disiram air segar! Daun & kelopak berseri ceria ✨`);
    }
  }, [playSound, triggerToast]);

  // ── PLANT A FLOWER (USER MUST CHOOSE FIRST, ALWAYS STARTS AS SMALL SPROUT) ──
  const handlePlantFlower = (flower: GardenFlowerDef) => {
    if (targetTileId === null) return;

    const newTiles = tiles.map(t => {
      if (t.id === targetTileId) {
        return {
          ...t,
          planted: true,
          flowerKey: flower.key,
          flowerName: flower.name,
          flowerLatin: flower.latinName,
          flowerCategory: flower.category,
          flowerImage: flower.image,
          flowerColor: flower.colorHex,
          growthStage: 1 as const, // Selalu mulai dari Bibit Tunas Mungil!
          waterCount: 0,
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
    triggerToast(`🌱 Bibit ${flower.name} ditanam! Siram dengan air agar mulai bersemi.`);
  };

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

  // ── Tile Click Handler ──
  const handleTileClick = (tile: GardenTile) => {
    // If user was dragging to rotate island, do not open modals
    if (dragDistanceRef.current > 8) return;

    setTargetTileId(tile.id);

    if (!tile.planted) {
      // Empty plot: User MUST choose flower first before planting on this exact tile!
      setIsSeedModalOpen(true);
      playSound('click');
    } else {
      // Planted plot: Open Inspection Drawer with growth progress, details, and water action
      setInspectTile(tile);
      playSound('click');
    }
  };

  // ── Water All Plants ──
  const handleWaterAll = () => {
    const updated = tiles.map(t => {
      if (!t.planted) return t;
      const count = (t.waterCount || 0) + 1;
      let stage: 1 | 2 | 3 | 4 = t.growthStage || 1;
      if (count >= 6) stage = 4;
      else if (count >= 3) stage = 3;
      else if (count >= 1) stage = 2;

      return {
        ...t,
        waterCount: count,
        growthStage: stage,
        wateredToday: true,
        lastWateredTime: new Date().toISOString()
      };
    });

    updateTilesAndSave(updated);
    playSound('splash');
    setTimeout(() => playSound('growth'), 120);
    triggerToast('🚿 Seluruh bunga di kebun berhasil disiram air segar! Kelopak & daun bergoyang riang 🌸✨');
  };

  // ── Reset All Plants to Small Sprouts (Mulai dari Bibit Kecil) ──
  const handleResetToBibit = () => {
    const resetGrid = tiles.map(t => {
      if (!t.planted) return t;
      return {
        ...t,
        growthStage: 1 as const,
        waterCount: 0,
        wateredToday: false
      };
    });
    updateTilesAndSave(resetGrid);
    playSound('plant');
    triggerToast('🌱 Semua tanaman kini kembali mulai dari bibit mungil! Rawat dan siram agar berkembang.');
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
      className="game-kebun-arena select-none relative min-h-screen overflow-x-hidden flex flex-col justify-between"
      ref={gardenContainerRef}
    >
      {/* ── 1. CINEMATIC GEMINI BOTANICAL SANCTUARY BACKDROP ── */}
      <div className="garden-sky-backdrop" aria-hidden="true">
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
        <div className="sky-sun-flare" />
        <div className="floating-petal petal-1">🌸</div>
        <div className="floating-petal petal-2">✨</div>
        <div className="floating-petal petal-3">🌺</div>
        <div className="floating-petal petal-4">🌷</div>
        <div className="floating-petal petal-5">🦋</div>
      </div>

      {/* ── 2. TOP HUD: BALANCED RESPONSIVE HEADER ── */}
      <header className="garden-top-hud">
        <div className="garden-top-hud-inner">
          {/* Row Left: Back button to Game Menu */}
          <Link 
            href="/menu" 
            className="garden-back-btn" 
            onClick={() => playSound('click')}
            aria-label="Kembali ke Menu Game"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">KEMBALI KE MENU</span>
            <span className="sm:hidden">MENU</span>
          </Link>

          {/* Row Center: Title & Garden Stats */}
          <div className="garden-header-center">
            <span className="garden-subtag">✦ 3D ISOMETRIC BOTANICAL OASIS ✦</span>
            <h1 className="garden-title">{gardenName}</h1>
            <div className="garden-streak-pill">
              <span className="flex items-center gap-1.5 text-amber-300 font-extrabold">
                <Flame size={14} className="animate-bounce" />
                {streakCount} HARI STREAK 🔥
              </span>
              <span className="hud-sep">•</span>
              <span className="text-emerald-300 font-bold">
                {plantedCount}/25 DITANAM 🌸
              </span>
              <span className="hud-sep hidden md:inline">•</span>
              <span className="text-sky-200 font-bold hidden md:inline">
                FOCUSED {focusedHours}H ⏱️
              </span>
            </div>
          </div>

          {/* Row Right: Action Cluster */}
          <div className="garden-top-actions">
            <button
              type="button"
              className="garden-hud-btn"
              onClick={() => {
                setBgMode(prev => prev === 'gemini' ? 'sky' : 'gemini');
                playSound('click');
              }}
              title="Ganti Tema Latar Belakang (Pemandangan Alam Gemini / Langit Pastel)"
            >
              <Sparkles size={15} className="text-amber-300" />
              <span className="hidden lg:inline">{bgMode === 'gemini' ? 'Tema: Alam' : 'Tema: Langit'}</span>
            </button>
            <button
              type="button"
              className="garden-hud-btn"
              onClick={handleResetToBibit}
              title="Mulai semua bunga dari bibit mungil"
            >
              <RotateCw size={15} className="text-emerald-400" />
              <span className="hidden lg:inline">Reset ke Bibit</span>
            </button>
            <button
              type="button"
              className="garden-hud-btn"
              onClick={() => setIsNotesModalOpen(true)}
              title="Buku Catatan Cinta"
            >
              <Heart size={16} className="text-rose-400" />
              <span className="hidden md:inline">Diary</span>
            </button>
            <button
              type="button"
              className="garden-hud-btn"
              onClick={() => setIsCodeModalOpen(true)}
              title="Undang Pasangan (Kode Kebun)"
            >
              <Share2 size={16} className="text-amber-400" />
              <span className="hidden md:inline">Undang</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── 3. MOBILE LANDSCAPE TIP BANNER ── */}
      {!isLandscapeHintDismissed && (
        <div className="mobile-landscape-banner md:hidden">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="rotate-90 text-amber-300 animate-pulse" />
            <span>Mode <strong>Landscape</strong> direkomendasikan untuk pandangan pulau lebih lega!</span>
          </div>
          <button 
            type="button" 
            className="text-white/70 hover:text-white p-1"
            onClick={() => setIsLandscapeHintDismissed(true)}
          >
            <X size={15} />
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
        {/* Floating Focused Time badge */}
        <div className="garden-floating-time-stat" aria-label="Garden Focus Time">
          <div className="time-stat-label">Focused Time</div>
          <div className="time-stat-value">{focusedHours} hours</div>
        </div>

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

                          {/* Dynamic Flower Blossom with Spring Physics according to Growth Stage */}
                          <div className="flower-blossom-wrapper">
                            <div className="flower-sway-anim">
                              {stage === 1 ? (
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

                          {/* Subtle water prompt if dry */}
                          {!tile.wateredToday && (
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
                          <span className="empty-sublabel">Pilih Bibit</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
                setIsSeedModalOpen(true);
              } else {
                triggerToast('🌸 Seluruh 25 petak sudah penuh! Ketuk salah satu bunga untuk mengganti jenisnya.');
              }
              playSound('click');
            }}
          >
            <Plus size={16} />
            <span>PILIH BIBIT</span>
          </button>
        </div>
      </footer>

      {/* ── 7. SEED PICKER MODAL (40 PILIHAN BUNGA BERBEDA & KONSISTEN) ── */}
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
              Pilih bunga impianmu! Bunga akan ditanam mulai dari <strong>bibit tunas mungil</strong> dan bertumbuh seiring kamu menyiramnya:
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

      {/* ── 8. PLANT INSPECTION DETAIL DRAWER / MODAL ── */}
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

              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left mb-4 text-xs font-sans text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lokasi Petak:</span>
                  <span className="font-bold text-slate-800">Baris {inspectTile.row + 1}, Kolom {inspectTile.col + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Disiram:</span>
                  <span className="font-bold text-slate-800">{inspectTile.waterCount || 0} kali</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Hari Ini:</span>
                  <span className={`font-bold ${inspectTile.wateredToday ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {inspectTile.wateredToday ? '💧 Segar Berseri' : '🥀 Butuh Siraman'}
                  </span>
                </div>
              </div>

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

      {/* ── 11. SUCCESS FLOATING TOAST ── */}
      {toastMessage && (
        <div className="garden-floating-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
