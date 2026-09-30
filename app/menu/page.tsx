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
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { FlowerCountVariant } from '@/types/design';
import { DesignProvider, useDesign } from '@/context/DesignContext';

export default function GameMenuPage() {
  return (
    <DesignProvider>
      <GameMenuContent />
    </DesignProvider>
  );
}

function GameMenuContent() {
  const router = useRouter();
  const { isPremiumUnlocked } = useDesign();
  const { t } = useLanguage();

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
    if (!isPremiumUnlocked) {
      setIsVipModalOpen(true);
      return;
    }
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
            aria-label={t('menu_back_home')}
          >
            <ArrowLeft size={15} />
            <span>{t('menu_back_home')}</span>
          </Link>

          {/* Judul Arena / Header Mode */}
          <div className="game-hud-title-wrap">
            <span className="game-hud-subbadge">{t('menu_atelier_hub')}</span>
            <h1 className="game-hud-heading">{t('menu_heading')}</h1>
          </div>

          {/* Right cluster: Player Status & Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="game-hud-player-status">
              <span className="game-hud-badge-icon">👑</span>
              <div className="game-hud-badge-info">
                <span className="game-hud-player-rank">{t('menu_player_rank')}</span>
                <span className="game-hud-player-level">{t('menu_player_level')}</span>
              </div>
            </div>
            <LanguageSwitcher variant="compact" />
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
            aria-label={t('menu_card1_title')}
          >
            {/* Rarity & Mode Badge */}
            <div className="game-card-tag tag-craft">
              <Sparkles size={12} className="text-amber-300 animate-spin" />
              <span>{t('menu_card1_tag')}</span>
            </div>

            {/* Visual Icon / Artwork Preview */}
            <div className="game-card-visual-wrapper">
              <div className="game-card-aura aura-craft" />
              <div className="game-card-img-box">
                <Image
                  src="/images/home.png"
                  alt={t('menu_card1_title')}
                  width={130}
                  height={130}
                  className="game-card-img-float"
                  priority
                />
              </div>
            </div>

            {/* Content Details */}
            <div className="game-card-body">
              <h2 className="game-card-title">{t('menu_card1_title')}</h2>
              <p className="game-card-tagline">{t('menu_card1_sub')}</p>
              
              <ul className="game-card-features">
                <li>
                  <Sparkles size={13} className="feature-icon text-rose-500" />
                  <span>{t('menu_card1_feat1')}</span>
                </li>
                <li>
                  <Zap size={13} className="feature-icon text-amber-500" />
                  <span>{t('menu_card1_feat2')}</span>
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
                <span>{t('menu_card1_btn')}</span>
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
            aria-label={t('menu_card2_title')}
          >
            {/* Rarity & Mode Badge */}
            <div className="game-card-tag tag-tutorial">
              <BookOpen size={12} className="text-cyan-300" />
              <span>{t('menu_card2_tag')}</span>
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
              <h2 className="game-card-title">{t('menu_card2_title')}</h2>
              <p className="game-card-tagline">{t('menu_card2_sub')}</p>
              
              <ul className="game-card-features">
                <li>
                  <Layers size={13} className="feature-icon text-indigo-500" />
                  <span>{t('menu_card2_feat1')}</span>
                </li>
                <li>
                  <Award size={13} className="feature-icon text-teal-500" />
                  <span>{t('menu_card2_feat2')}</span>
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
                <span>{t('menu_card2_btn')}</span>
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
            aria-label={t('menu_card3_title')}
          >
            {/* Rarity & Mode Badge */}
            <div className={`game-card-tag tag-garden ${!isPremiumUnlocked ? 'tag-locked' : ''}`}>
              {isPremiumUnlocked ? (
                <>
                  <Flame size={12} className="text-amber-300 animate-bounce" />
                  <span>{t('menu_card3_tag_unlocked')}</span>
                </>
              ) : (
                <>
                  <Crown size={12} className="text-amber-300" />
                  <span>{t('menu_card3_tag_locked')}</span>
                </>
              )}
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
              <h2 className="game-card-title">{t('menu_card3_title')}</h2>
              <p className="game-card-tagline">{t('menu_card3_sub')}</p>
              
              <ul className="game-card-features">
                <li>
                  <Heart size={13} className="feature-icon text-rose-500" />
                  <span>{t('menu_card3_feat1')}</span>
                </li>
                <li>
                  <Flame size={13} className="feature-icon text-amber-500" />
                  <span>{t('menu_card3_feat2')}</span>
                </li>
              </ul>
            </div>

            {/* Action Trigger Button */}
            <div className="game-card-action-bar">
              <button
                type="button"
                id="btn-menu-garden"
                className={`game-card-btn btn-garden ${!isPremiumUnlocked ? 'btn-garden-locked' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenKebun();
                }}
              >
                <span>{isPremiumUnlocked ? t('menu_card3_btn_unlocked') : t('menu_card3_btn_locked')}</span>
                {isPremiumUnlocked ? <Flame size={16} /> : <Crown size={16} className="text-amber-300" />}
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* ── 5. BOTTOM GAME HUD FOOTER (COMPACT) ── */}
      <footer className="game-bottom-hud" aria-label="Game Hub Status">
        <div className="game-hud-status">
          <span className="game-status-dot" />
          <span>{t('menu_hud_status')}</span>
        </div>
        <div className="game-hud-hint">
          <span>{t('menu_hud_hint')}</span>
        </div>
        <div className="game-hud-version">
          <span>{t('home_hud_version')}</span>
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
        defaultTier="lifetime"
        onOpenGarden={() => {
          setIsVipModalOpen(false);
          router.push('/kebun');
        }}
      />
    </div>
  );
}
