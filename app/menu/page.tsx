'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, BookOpen, Flame, ArrowLeft, ArrowRight, 
  Crown, Heart, Palette, Layers, Award, ShieldCheck, Zap
} from 'lucide-react';
import HomeBackgroundVideo from '@/components/home/HomeBackgroundVideo';
import FlowerCountModal from '@/components/designer/FlowerCountModal';
import FlowerGardenModal from '@/components/garden/FlowerGardenModal';
import PremiumUnlockModal from '@/components/designer/PremiumUnlockModal';
import { FlowerCountVariant } from '@/types/design';
import { DesignProvider } from '@/context/DesignContext';

export default function GameMenuPage() {
  return (
    <DesignProvider>
      <GameMenuContent />
    </DesignProvider>
  );
}

function GameMenuContent() {
  const router = useRouter();

  // Modals state
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [isGardenModalOpen, setIsGardenModalOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  // Sound effect synthesizer (Web Audio API - instant, no external files)
  const playSfx = (type: 'hover' | 'select' | 'portal') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'select') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'portal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, ctx.currentTime); // G4
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2); // A5
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Audio context might be restricted before interaction, ignore safely
    }
  };

  // Handler for Confirm Flower Count -> push to designer
  const handleConfirmFlowerCount = (count: FlowerCountVariant) => {
    setIsCountModalOpen(false);
    playSfx('portal');
    router.push(`/designer?flowers=${count}`);
  };

  const handleOpenBuatBucket = () => {
    playSfx('select');
    setIsCountModalOpen(true);
  };

  const handleOpenTutorial = () => {
    playSfx('select');
    router.push('/tutorial');
  };

  const handleOpenKebun = () => {
    playSfx('select');
    router.push('/kebun');
  };

  return (
    <div className="game-menu-container theme-pink game-theme-arena relative min-h-screen">
      {/* ── 1. CINEMATIC VIDEO BACKGROUND ── */}
      <HomeBackgroundVideo />

      {/* ── 2. TOP GAME HUD HEADER (COMPACT) ── */}
      <header className="game-hud-topbar" aria-label="Game HUD">
        <div className="game-hud-inner">
          {/* Tombol Kembali ke Beranda */}
          <Link
            href="/"
            className="game-hud-back-btn"
            onClick={() => playSfx('hover')}
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft size={15} />
            <span>KEMBALI KE BERANDA</span>
          </Link>

          {/* Judul Arena / Header Mode */}
          <div className="game-hud-title-wrap">
            <span className="game-hud-subbadge">✦ FLORIST ATELIER HUB ✦</span>
            <h1 className="game-hud-heading">PILIH MODE PERMAINAN</h1>
          </div>

          {/* Status Pemain / Atelier Badge */}
          <div className="game-hud-player-status">
            <span className="game-hud-badge-icon">👑</span>
            <div className="game-hud-badge-info">
              <span className="game-hud-player-rank">MASTER FLORIST</span>
              <span className="game-hud-player-level">LVL. 99 • UNLIMITED</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── 3. FLOATING FLORAL PARTICLES ── */}
      <div className="floral-frame-decor" aria-hidden="true">
        <span className="floating-petal petal-1">🌸</span>
        <span className="floating-petal petal-2">✨</span>
        <span className="floating-petal petal-3">🌺</span>
        <span className="floating-petal petal-4">🌸</span>
        <span className="floating-petal petal-5">✨</span>
        <span className="floating-petal petal-6">🌷</span>
      </div>

      {/* ── 4. 3 GAME MENU CARDS GRID (COMPACT & FULLY CLICKABLE) ── */}
      <main className="game-cards-main-section">
        <div className="game-cards-grid">
          
          {/* ═════════ MENU 1: BUAT BUCKET (MODE UTAMA) ═════════ */}
          <div 
            className="game-card game-card-craft cursor-pointer"
            onClick={handleOpenBuatBucket}
            onMouseEnter={() => playSfx('hover')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenBuatBucket(); }}
            aria-label="Pilih Mode Buat Bucket"
          >
            {/* Rarity & Mode Badge */}
            <div className="game-card-tag tag-craft">
              <Sparkles size={12} className="text-amber-300 animate-spin" />
              <span>MODE UTAMA • CRAFT STUDIO</span>
            </div>

            {/* Visual Icon / Artwork Preview */}
            <div className="game-card-visual-wrapper">
              <div className="game-card-aura aura-craft" />
              <div className="game-card-img-box">
                <Image
                  src="/images/home.png"
                  alt="Buat Buket Bunga"
                  width={130}
                  height={130}
                  className="game-card-img-float"
                  priority
                />
              </div>
            </div>

            {/* Content Details */}
            <div className="game-card-body">
              <h2 className="game-card-title">BUAT BUCKET</h2>
              <p className="game-card-tagline">Studio Rangkai Bunga Aesthetic</p>
              
              <ul className="game-card-features">
                <li>
                  <Sparkles size={13} className="feature-icon text-rose-500" />
                  <span>Susun 100+ Bunga & Kertas Buket</span>
                </li>
                <li>
                  <Zap size={13} className="feature-icon text-amber-500" />
                  <span>Kartu Ucapan & Ekspor Ultra HD 4K</span>
                </li>
              </ul>
            </div>

            {/* Action Trigger Button */}
            <div className="game-card-action-bar">
              <button
                type="button"
                id="btn-menu-craft"
                className="game-card-btn btn-craft"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenBuatBucket();
                }}
              >
                <span>MULAI MERANGKAI</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* ═════════ MENU 2: TUTORIAL (AKADEMI FLORIST) ═════════ */}
          <div 
            className="game-card game-card-tutorial cursor-pointer"
            onClick={handleOpenTutorial}
            onMouseEnter={() => playSfx('hover')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenTutorial(); }}
            aria-label="Pilih Mode Tutorial"
          >
            {/* Rarity & Mode Badge */}
            <div className="game-card-tag tag-tutorial">
              <BookOpen size={12} className="text-cyan-300" />
              <span>PANDUAN • ACADEMY</span>
            </div>

            {/* Visual Icon / Artwork Preview */}
            <div className="game-card-visual-wrapper">
              <div className="game-card-aura aura-tutorial" />
              <div className="game-card-icon-emblem bg-gradient-to-br from-indigo-500 to-sky-400">
                <span className="game-emblem-emoji">📖</span>
                <span className="game-emblem-sparkle">✨</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="game-card-body">
              <h2 className="game-card-title">TUTORIAL</h2>
              <p className="game-card-tagline">Panduan & Trik Florist Handal</p>
              
              <ul className="game-card-features">
                <li>
                  <Layers size={13} className="feature-icon text-indigo-500" />
                  <span>Teknik Layering Bunga & Komposisi</span>
                </li>
                <li>
                  <Award size={13} className="feature-icon text-teal-500" />
                  <span>Panduan Mengganti Kertas & Tips HD</span>
                </li>
              </ul>
            </div>

            {/* Action Trigger Button */}
            <div className="game-card-action-bar">
              <button
                type="button"
                id="btn-menu-tutorial"
                className="game-card-btn btn-tutorial"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenTutorial();
                }}
              >
                <span>BACA PANDUAN</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* ═════════ MENU 3: KEBUN (DAILY STREAK HARIAN) ═════════ */}
          <div 
            className="game-card game-card-garden cursor-pointer"
            onClick={handleOpenKebun}
            onMouseEnter={() => playSfx('hover')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenKebun(); }}
            aria-label="Pilih Mode Kebun Bunga"
          >
            {/* Rarity & Mode Badge */}
            <div className="game-card-tag tag-garden">
              <Flame size={12} className="text-amber-300 animate-bounce" />
              <span>HARIAN • DAILY STREAK 🔥</span>
            </div>

            {/* Visual Icon / Artwork Preview */}
            <div className="game-card-visual-wrapper">
              <div className="game-card-aura aura-garden" />
              <div className="game-card-icon-emblem bg-gradient-to-br from-emerald-500 to-teal-400">
                <span className="game-emblem-emoji">🌱</span>
                <span className="game-emblem-sparkle">🔥</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="game-card-body">
              <h2 className="game-card-title">KEBUN BUNGA</h2>
              <p className="game-card-tagline">Rawat Bunga Bersama Pasangan</p>
              
              <ul className="game-card-features">
                <li>
                  <Heart size={13} className="feature-icon text-rose-500" />
                  <span>Tanam Bunga Cinta & Rawat Berdua</span>
                </li>
                <li>
                  <Flame size={13} className="feature-icon text-amber-500" />
                  <span>Siram Tiap Hari & Jaga Api Streak 🔥</span>
                </li>
              </ul>
            </div>

            {/* Action Trigger Button */}
            <div className="game-card-action-bar">
              <button
                type="button"
                id="btn-menu-garden"
                className="game-card-btn btn-garden"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenKebun();
                }}
              >
                <span>BUKA KEBUN BUNGA</span>
                <Flame size={16} />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* ── 5. BOTTOM GAME HUD FOOTER (COMPACT) ── */}
      <footer className="game-bottom-hud" aria-label="Game Hub Status">
        <div className="game-hud-status">
          <span className="game-status-dot" />
          <span>SERVER: ONLINE • ATELIER READY</span>
        </div>
        <div className="game-hud-hint">
          <span>💡 TIPS: KLIK KARTU &quot;BUAT BUCKET&quot; UNTUK MEMULAI MERANGKAI BUNGA IMPIANMU</span>
        </div>
        <div className="game-hud-version">
          <span>VER 2.5 • LAYSA STUDIO</span>
        </div>
      </footer>

      {/* ── 6. INTERACTIVE MODALS ── */}
      {/* Modal 1: Pemilihan Jumlah Bunga untuk Studio */}
      <FlowerCountModal
        isOpen={isCountModalOpen}
        onClose={() => setIsCountModalOpen(false)}
        onConfirm={handleConfirmFlowerCount}
        canDismiss={true}
      />

      {/* Modal 2: Kebun Bunga Streak Harian */}
      <FlowerGardenModal
        isOpen={isGardenModalOpen}
        onClose={() => setIsGardenModalOpen(false)}
        onOpenVipModal={() => {
          setIsGardenModalOpen(false);
          setIsVipModalOpen(true);
        }}
      />

      {/* Modal 3: VIP Sultan Unlock (jika dibuka dari kebun) */}
      <PremiumUnlockModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        onOpenGarden={() => {
          setIsVipModalOpen(false);
          setIsGardenModalOpen(true);
        }}
      />
    </div>
  );
}
