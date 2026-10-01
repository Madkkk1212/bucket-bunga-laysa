'use client';

import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import HeroActions from '@/components/home/HeroActions';
import HomeBackgroundVideo from '@/components/home/HomeBackgroundVideo';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeClientView() {
  const { t } = useLanguage();

  return (
    <div className="home-page theme-pink game-theme-arena relative">
      {/* ── 1. BACKGROUND VIDEO CINEMATIC (home.mp4 — SILENT, INSTANT AUTOPLAY) ── */}
      <HomeBackgroundVideo />

      {/* ── 2. TOP HUD NAVIGATION ── */}
      <Navbar />

      {/* ── 3. FLOATING FLORAL PARTICLES (GAME PARTICLES EFFECT) ── */}
      <div className="floral-frame-decor" aria-hidden="true">
        <div className="decor-flower decor-tl-1">
          <Image src="/images/flowers/rose_pink.png" alt="" width={130} height={130} loading="lazy" sizes="130px" />
        </div>
        <div className="decor-flower decor-tl-2">
          <Image src="/images/flowers/babysbreath_white.png" alt="" width={95} height={95} loading="lazy" sizes="95px" />
        </div>
        <div className="decor-flower decor-tl-3">
          <Image src="/images/flowers/eucalyptus.png" alt="" width={110} height={110} loading="lazy" sizes="110px" />
        </div>
        <div className="decor-flower decor-tr-1">
          <Image src="/images/flowers/hydrangea_pink.png" alt="" width={140} height={140} loading="lazy" sizes="140px" />
        </div>
        <div className="decor-flower decor-tr-2">
          <Image src="/images/flowers/lily_pink.png" alt="" width={105} height={105} loading="lazy" sizes="105px" />
        </div>
        <div className="decor-flower decor-bl-1">
          <Image src="/images/flowers/tulip_pink.png" alt="" width={120} height={120} loading="lazy" sizes="120px" />
        </div>
        <div className="decor-flower decor-bl-2">
          <Image src="/images/flowers/ranunculus_pink.png" alt="" width={100} height={100} loading="lazy" sizes="100px" />
        </div>
        <span className="floating-petal petal-1">🌸</span>
        <span className="floating-petal petal-2">✨</span>
        <span className="floating-petal petal-3">🌺</span>
        <span className="floating-petal petal-4">🌸</span>
        <span className="floating-petal petal-5">✨</span>
        <span className="floating-petal petal-6">🌷</span>
      </div>

      {/* ── 4. MAIN GAME ARENA STAGE (HERO) ── */}
      <section className="hero-section game-arena-section" aria-label="Game Stage">
        <div className="hero-content game-arena-grid">
          {/* SISI KIRI: GAME TITLE & MISSION BRIEFING */}
          <div className="hero-text game-hero-text">
            {/* Massive 3D Extruded Game Title Logo */}
            <h1 className="game-theme-title">
              {t('home_hero_title_1')}<br />
              {t('home_hero_title_2')}<br />
              <span className="game-theme-title-accent">{t('home_hero_title_3')}</span>
            </h1>

            {/* Subheadline Penjelas Produk */}
            <p className="hero-subtitle text-slate-700 font-medium text-sm sm:text-base mt-3 mb-6 leading-relaxed max-w-md">
              {t('home_hero_subtitle')}
            </p>

            {/* 3D Action Command Button (Buat Buket Sekarang) */}
            <HeroActions />
          </div>

          {/* SISI KANAN: 3D MYTHIC ITEM SHOWCASE (PEDESTAL) */}
          <div className="hero-visual game-visual-stage">
            <div className="game-pedestal-showcase">
              {/* Rarity Banner */}
              <div className="game-rarity-pill">
                <span>{t('home_ssr_badge')}</span>
              </div>

              {/* Magical Aura Rings */}
              <div className="hero-backdrop-aura" aria-hidden="true">
                <div className="aura-sunburst-glow" />
                <div className="game-magic-circle" />
                <div className="aura-outer-ring" />
                <div className="aura-sparkle aura-sp-1">✦</div>
                <div className="aura-sparkle aura-sp-2">★</div>
                <div className="aura-sparkle aura-sp-3">✦</div>
              </div>

              {/* Floating Bouquet Item */}
              <div className="hero-image-wrapper game-floating-item">
                <Image
                  src="/images/home.png"
                  alt="Bucket Bunga Laysa — Buket Bunga Cantik"
                  width={640}
                  height={640}
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 1024px) 440px, 640px"
                  className="hero-bouquet-img"
                />
              </div>

              {/* Floating Benefit Highlights Card */}
              <div className="game-item-stats-card" style={{ width: 'auto', padding: '10px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#fbcfe8', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <span>{t('home_stat_benefits')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. BOTTOM HUD FOOTER (TICKER) ── */}
      <footer className="game-bottom-hud" aria-label="Status Bar">
        <div className="game-hud-hint">
          <span>{t('home_hud_hint')}</span>
        </div>
        <div className="game-hud-version">
          <span>{t('home_hud_version')}</span>
        </div>
      </footer>
    </div>
  );
}
