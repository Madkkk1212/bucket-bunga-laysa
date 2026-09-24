import type { Metadata } from 'next';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import HeroActions from '@/components/home/HeroActions';

export const metadata: Metadata = {
  title: 'Bucket Bunga Laysa — Bikin Buket Bunga Online & Hadiah Virtual Gratis',
  description:
    'Rancang buket bunga virtual interaktif gratis untuk Ulang Tahun, Wisuda, Sidang Skripsi, Sahabat, dan Pacar LDR. Susun 30+ bunga aesthetic, tulis kartu ucapan, dan unduh gambar HD seketika.',
};

export default function HomePage() {
  return (
    <div className="home-page theme-pink">
      <Navbar />

      {/* ─── PERIPHERAL FLOATING FLORAL DECORATIONS (PINGGIR RAME BUNGA) ─── */}
      <div className="floral-frame-decor" aria-hidden="true">
        {/* Top-Left Floral Cluster */}
        <div className="decor-flower decor-tl-1">
          <Image src="/images/flowers/rose_pink.png" alt="" width={130} height={130} loading="lazy" sizes="(max-width: 768px) 70px, 130px" />
        </div>
        <div className="decor-flower decor-tl-2">
          <Image src="/images/flowers/babysbreath_white.png" alt="" width={95} height={95} loading="lazy" sizes="(max-width: 768px) 50px, 95px" />
        </div>
        <div className="decor-flower decor-tl-3">
          <Image src="/images/flowers/eucalyptus.png" alt="" width={110} height={110} loading="lazy" sizes="(max-width: 768px) 60px, 110px" />
        </div>

        {/* Top-Right Floral Cluster */}
        <div className="decor-flower decor-tr-1">
          <Image src="/images/flowers/hydrangea_pink.png" alt="" width={140} height={140} loading="lazy" sizes="(max-width: 768px) 75px, 140px" />
        </div>
        <div className="decor-flower decor-tr-2">
          <Image src="/images/flowers/lily_pink.png" alt="" width={105} height={105} loading="lazy" sizes="(max-width: 768px) 55px, 105px" />
        </div>

        {/* Bottom-Left Floral Cluster */}
        <div className="decor-flower decor-bl-1">
          <Image src="/images/flowers/tulip_pink.png" alt="" width={120} height={120} loading="lazy" sizes="(max-width: 768px) 65px, 120px" />
        </div>
        <div className="decor-flower decor-bl-2">
          <Image src="/images/flowers/ranunculus_pink.png" alt="" width={100} height={100} loading="lazy" sizes="(max-width: 768px) 50px, 100px" />
        </div>

        {/* Floating Petals Drifting in the Air */}
        <span className="floating-petal petal-1">🌸</span>
        <span className="floating-petal petal-2">✨</span>
        <span className="floating-petal petal-3">🌺</span>
        <span className="floating-petal petal-4">🌸</span>
        <span className="floating-petal petal-5">✨</span>
        <span className="floating-petal petal-6">🌷</span>
      </div>

      {/* ─── SECTION 1: HERO (ONLY SECTION) ─── */}
      <section className="hero-section" aria-label="Hero">
        <div className="hero-content">
          {/* Left Column: Typography & Action */}
          <div className="hero-text">
            <span className="hero-badge">
              <Sparkles size={14} style={{ display: 'inline', marginRight: 6 }} />
              Luxury Floral Atelier
            </span>
            <h1 className="hero-title">
              BIGGER.<br />
              BRIGHTER.<br />
              <span className="hero-title-accent">BEAUTIFUL.</span>
            </h1>
            <p className="hero-subtitle">
              Sentuhan keindahan bunga segar untuk setiap momen berharga Anda. Pilih bucket favorit, atur tata letak bunga sesuka hati, dan wujudkan buket impian yang memukau.
            </p>
            <HeroActions />
          </div>

          {/* Right Column: Giant home.png with Stunning Radiant Backdrop */}
          <div className="hero-visual">
            {/* Luminous Backdrop Aura Behind home.png */}
            <div className="hero-backdrop-aura" aria-hidden="true">
              <div className="aura-sunburst-glow" />
              <div className="aura-arch-frame" />
              <div className="aura-outer-ring" />
              <div className="aura-sparkle aura-sp-1">✦</div>
              <div className="aura-sparkle aura-sp-2">★</div>
              <div className="aura-sparkle aura-sp-3">✦</div>
            </div>

            {/* Transparent Bouquet */}
            <div className="hero-image-wrapper">
              <Image
                src="/images/home.png"
                alt="Bucket Bunga Laysa — Luxury Bouquet"
                width={640}
                height={640}
                priority
                fetchPriority="high"
                sizes="(max-width: 640px) 320px, (max-width: 1024px) 480px, 640px"
                className="hero-bouquet-img"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
