'use client';

import Navbar from '@/components/layout/Navbar';
import HeroActions from '@/components/home/HeroActions';
import HomeBackgroundVideo from '@/components/home/HomeBackgroundVideo';
import HomeDesktopDecor from '@/components/home/HomeDesktopDecor';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeClientView() {
  const { t } = useLanguage();

  return (
    <div className="home-page theme-pink game-theme-arena relative" suppressHydrationWarning>
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
          {/* SISI KIRI: TITLE, DESKRIPSI & TOMBOL UTAMA */}
          <div className="hero-text game-hero-text">
            <div className="hero-text-container hero-fade-in">
              {/* Modern & High-Contrast Aesthetic Title (2 Lines Only) */}
              <h1 className="game-theme-title hero-fade-in stagger-1">
                <span className="game-title-line-1">{t('home_hero_title_1')}</span>
                <span className="game-theme-title-accent game-title-line-2">{t('home_hero_title_2')}</span>
              </h1>

              {/* Subheadline Penjelas Produk */}
              <p className="hero-subtitle hero-fade-in stagger-2">
                {t('home_hero_subtitle')}
              </p>

              {/* Action Command Button (Buat Buket Sekarang) */}
              <HeroActions />
            </div>
          </div>

          {/* SISI KANAN: 3D MYTHIC ITEM SHOWCASE (PEDESTAL) */}
          <div className="hero-visual game-visual-stage">
            <div className="game-pedestal-showcase hero-fade-in stagger-4">
              {/* Feature Step Pill */}
              <div className="game-rarity-pill">
                <span className="game-rarity-sparkle">🎀</span>
                <span>{t('home_ssr_badge')}</span>
              </div>

              {/* Magical Soft Radial Aura */}
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
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. BOTTOM HUD FOOTER (TICKER) ── */}
      <footer className="game-bottom-hud" aria-label="Status Bar">
        <div className="game-hud-hint">
          <span className="game-hud-icon">🎁</span>
          <span>{t('home_hud_hint')}</span>
        </div>
        <div className="game-hud-version">
          <span>{t('home_hud_version')}</span>
        </div>
      </footer>
    </div>
  );
}
