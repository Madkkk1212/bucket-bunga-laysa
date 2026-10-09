'use client';

import Navbar from '@/components/layout/Navbar';
import HeroActions from '@/components/home/HeroActions';
import HomeBackgroundVideo from '@/components/home/HomeBackgroundVideo';
import HomeDesktopDecor from '@/components/home/HomeDesktopDecor';
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
        {/* Dekorasi bunga besar hanya di-render di layar desktop (>= 768px) agar mobile hemat 1.5MB data */}
        <HomeDesktopDecor />
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

              {/* Floating Bouquet Item with responsive mobile LCP optimization */}
              <div className="hero-image-wrapper game-floating-item">
                <picture>
                  <source media="(max-width: 640px)" srcSet="/images/home-mobile.webp" type="image/webp" />
                  <source media="(min-width: 641px)" srcSet="/images/home.webp" type="image/webp" />
                  <img
                    src="/images/home.webp"
                    alt="Bucket Bunga Laysa — Buket Bunga Cantik"
                    width={640}
                    height={640}
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                    className="hero-bouquet-img"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </picture>
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
