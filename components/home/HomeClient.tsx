'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Monitor, Smartphone } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import HeroActions from '@/components/home/HeroActions';
import { DesignProvider } from '@/context/DesignContext';
import MobileDashboard from './mobile/MobileDashboard';

export default function HomeClient() {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  return (
    <DesignProvider>
      {viewMode === 'mobile' ? (
        /* ─── MOBILE DASHBOARD VIEW (PRIMARY) ─── */
        <div className="min-h-screen bg-[#EEF2F6] flex flex-col items-center justify-start sm:py-6">
          {/* Desktop-only floating preview switcher */}
          <div className="hidden sm:flex items-center gap-2 mb-3 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-indigo-100 shadow-sm text-xs font-semibold text-gray-700">
            <span className="flex items-center gap-1.5 text-indigo-600 font-bold">
              <Smartphone size={15} />
              Tampilan Mobile App Buket Laysa
            </span>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className="text-gray-500 hover:text-indigo-600 transition flex items-center gap-1 cursor-pointer"
            >
              <Monitor size={14} />
              Beralih ke Versi Desktop
            </button>
          </div>

          {/* Smartphone Frame Container */}
          <div className="w-full sm:max-w-[430px] min-h-screen sm:min-h-[880px] sm:max-h-[92vh] sm:overflow-y-auto sm:rounded-[36px] bg-[#F8F9FE] sm:shadow-[0_24px_60px_-15px_rgba(79,70,229,0.22)] sm:border-[5px] sm:border-slate-800/10 relative overflow-x-hidden no-scrollbar">
            <MobileDashboard />
          </div>
        </div>
      ) : (
        /* ─── DESKTOP VIEW (ACCESSIBLE VIA SWITCHER) ─── */
        <div className="home-page theme-pink relative">
          {/* Floating Switcher Back to Mobile */}
          <div className="fixed top-4 right-4 z-50">
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg hover:bg-indigo-700 transition active:scale-95 cursor-pointer"
            >
              <Smartphone size={15} />
              <span>Buka Tampilan Mobile Baru</span>
            </button>
          </div>

          <Navbar />

          {/* Peripheral Floating Floral Decorations */}
          <div className="floral-frame-decor" aria-hidden="true">
            <div className="decor-flower decor-tl-1">
              <Image src="/images/flowers/rose_pink.png" alt="" width={130} height={130} loading="lazy" sizes="(max-width: 768px) 70px, 130px" />
            </div>
            <div className="decor-flower decor-tl-2">
              <Image src="/images/flowers/babysbreath_white.png" alt="" width={95} height={95} loading="lazy" sizes="(max-width: 768px) 50px, 95px" />
            </div>
            <div className="decor-flower decor-tl-3">
              <Image src="/images/flowers/eucalyptus.png" alt="" width={110} height={110} loading="lazy" sizes="(max-width: 768px) 60px, 110px" />
            </div>

            <div className="decor-flower decor-tr-1">
              <Image src="/images/flowers/hydrangea_pink.png" alt="" width={140} height={140} loading="lazy" sizes="(max-width: 768px) 75px, 140px" />
            </div>
            <div className="decor-flower decor-tr-2">
              <Image src="/images/flowers/lily_pink.png" alt="" width={105} height={105} loading="lazy" sizes="(max-width: 768px) 55px, 105px" />
            </div>

            <div className="decor-flower decor-bl-1">
              <Image src="/images/flowers/tulip_pink.png" alt="" width={120} height={120} loading="lazy" sizes="(max-width: 768px) 65px, 120px" />
            </div>
            <div className="decor-flower decor-bl-2">
              <Image src="/images/flowers/ranunculus_pink.png" alt="" width={100} height={100} loading="lazy" sizes="(max-width: 768px) 50px, 100px" />
            </div>

            <span className="floating-petal petal-1">🌸</span>
            <span className="floating-petal petal-2">✨</span>
            <span className="floating-petal petal-3">🌺</span>
            <span className="floating-petal petal-4">🌸</span>
            <span className="floating-petal petal-5">✨</span>
            <span className="floating-petal petal-6">🌷</span>
          </div>

          {/* Hero Section */}
          <section className="hero-section" aria-label="Hero">
            <div className="hero-content">
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

              <div className="hero-visual">
                <div className="hero-backdrop-aura" aria-hidden="true">
                  <div className="aura-sunburst-glow" />
                  <div className="aura-arch-frame" />
                  <div className="aura-outer-ring" />
                  <div className="aura-sparkle aura-sp-1">✦</div>
                  <div className="aura-sparkle aura-sp-2">★</div>
                  <div className="aura-sparkle aura-sp-3">✦</div>
                </div>

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
      )}
    </DesignProvider>
  );
}
