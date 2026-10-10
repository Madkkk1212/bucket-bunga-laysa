'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Flower, Sparkles, Home, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

// 14 petal configurations with varied positions, sizes, and delays
const PETALS = [
  { id: 1, left: '6%', size: '20px', delay: '0s', duration: '9s', icon: '🌸' },
  { id: 2, left: '14%', size: '15px', delay: '2.5s', duration: '11s', icon: '✨' },
  { id: 3, left: '22%', size: '24px', delay: '1s', duration: '8.5s', icon: '🌺' },
  { id: 4, left: '31%', size: '18px', delay: '4s', duration: '10s', icon: '🌸' },
  { id: 5, left: '42%', size: '16px', delay: '0.5s', duration: '12s', icon: '🌷' },
  { id: 6, left: '50%', size: '22px', delay: '3.2s', duration: '9.2s', icon: '🌸' },
  { id: 7, left: '58%', size: '14px', delay: '1.8s', duration: '10.5s', icon: '✨' },
  { id: 8, left: '67%', size: '25px', delay: '0.2s', duration: '8s', icon: '🌺' },
  { id: 9, left: '76%', size: '19px', delay: '4.5s', duration: '11.5s', icon: '🌸' },
  { id: 10, left: '84%', size: '21px', delay: '2s', duration: '9.8s', icon: '🌷' },
  { id: 11, left: '92%', size: '16px', delay: '3.6s', duration: '10.2s', icon: '🌸' },
  { id: 12, left: '97%', size: '23px', delay: '1.2s', duration: '8.8s', icon: '✨' },
];

export default function NotFoundClient() {
  const { t, isEn } = useLanguage();
  const searchParams = useSearchParams();
  const [invalidPath, setInvalidPath] = useState<string>('');
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // 1. Check searchParams first
    const fromParam = searchParams.get('from');
    if (fromParam) {
      setInvalidPath(fromParam);
      return;
    }

    // 2. Check sessionStorage if captured prior to redirect
    try {
      const stored = sessionStorage.getItem('laysa_last_invalid_path');
      if (stored) {
        setInvalidPath(stored);
        sessionStorage.removeItem('laysa_last_invalid_path');
        return;
      }
    } catch {
      // ignore
    }

    // 3. Fallback: check document.referrer if available
    try {
      if (typeof document !== 'undefined' && document.referrer) {
        const refUrl = new URL(document.referrer);
        if (refUrl.origin === window.location.origin && refUrl.pathname !== '/pagenotfound') {
          setInvalidPath(refUrl.pathname);
        }
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  useEffect(() => {
    // Check if video should be loaded (desktop or fast connection)
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 640;
    const isSaveData = (navigator as any)?.connection?.saveData === true;
    if (isDesktop && !isSaveData) {
      setVideoLoaded(true);
    }
  }, []);

  return (
    <main
      className="not-found-main-wrapper"
      role="main"
      aria-label={isEn ? '404 Page Not Found' : 'Halaman 404 Tidak Ditemukan'}
    >
      <style jsx global>{`
        .not-found-main-wrapper {
          min-height: 100dvh;
          width: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          overflow-x: hidden;
          background-color: #fff0f5;
          box-sizing: border-box;
          font-family: var(--font-montserrat, 'Montserrat', sans-serif);
        }

        /* ── BACKGROUND LAYER WITH HOMEPAGE VIDEO / IMAGE & SOFT PINK OVERLAY ── */
        .not-found-bg-layer {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .not-found-video-media {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          transform: translate(-50%, -50%);
          object-fit: cover;
          filter: brightness(0.95) saturate(1.1);
        }

        .not-found-img-fallback {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.95) saturate(1.1);
        }

        /* Soft Pink Atmosphere Overlay */
        .not-found-overlay-tint {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 40%, rgba(255, 241, 245, 0.72) 0%, rgba(255, 225, 235, 0.9) 100%),
            linear-gradient(180deg, rgba(255, 245, 248, 0.78) 0%, rgba(253, 226, 236, 0.92) 100%);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* ── FALLING PETALS ANIMATION (12 LIGHTWEIGHT PARTICLES) ── */
        .not-found-petals-field {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .not-found-petal {
          position: absolute;
          top: -30px;
          user-select: none;
          animation-name: notFoundPetalFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          opacity: 0.85;
        }

        @keyframes notFoundPetalFall {
          0% {
            transform: translateY(-20px) rotate(0deg) translateX(0px);
            opacity: 0;
          }
          12% {
            opacity: 0.85;
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(24px);
          }
          88% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(105vh) rotate(360deg) translateX(-18px);
            opacity: 0;
          }
        }

        /* ── FLOATING TOP HEADER (LANGUAGE SWITCHER) ── */
        .not-found-top-header {
          position: fixed;
          top: 18px;
          right: 20px;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* ── CENTRAL NOT FOUND CARD ── */
        .not-found-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 560px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 28px;
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          box-shadow:
            0 24px 60px -12px rgba(244, 63, 94, 0.22),
            0 10px 24px -4px rgba(225, 29, 72, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.8);
          padding: 44px 36px 38px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          box-sizing: border-box;
          animation: notFoundCardEntry 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (max-width: 640px) {
          .not-found-card {
            padding: 32px 20px 28px 20px;
            border-radius: 24px;
            gap: 15px;
          }
        }

        @keyframes notFoundCardEntry {
          0% {
            opacity: 0;
            transform: translateY(22px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* ── ICON EMBLEM (88px, CENTER TOP) ── */
        .not-found-emblem-wrap {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow:
            0 14px 30px -4px rgba(244, 63, 94, 0.42),
            0 0 0 5px rgba(255, 255, 255, 0.85);
          animation: notFoundFloat 3.8s ease-in-out infinite;
          margin-bottom: 2px;
          flex-shrink: 0;
        }

        @keyframes notFoundFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(4deg);
          }
        }

        /* ── GIANT "404" TEXT WITH PINK-ROSE GRADIENT ── */
        .not-found-digits {
          font-size: clamp(4rem, 14vw, 7rem);
          font-weight: 900;
          line-height: 0.95;
          letter-spacing: -0.04em;
          margin: 0;
          background: linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #be123c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.75);
          filter: drop-shadow(0 2px 2px rgba(255, 255, 255, 0.8)) drop-shadow(0 6px 20px rgba(244, 63, 94, 0.35));
          animation: notFoundPop 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
          animation-delay: 0.15s;
          user-select: none;
        }

        @keyframes notFoundPop {
          0% {
            opacity: 0;
            transform: scale(0.85);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* ── BADGE PILL ── */
        .not-found-badge-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #be123c;
          background: rgba(254, 205, 211, 0.65);
          border: 1px solid rgba(251, 113, 133, 0.35);
          margin-top: -4px;
        }

        /* ── HEADING (H1) ── */
        .not-found-heading {
          font-size: clamp(1.45rem, 4vw, 1.95rem);
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.25;
        }

        /* ── DESCRIPTION TEXT ── */
        .not-found-description {
          font-size: 15px;
          color: #475569;
          line-height: 1.62;
          max-width: 430px;
          margin: 0 auto;
        }

        @media (max-width: 640px) {
          .not-found-description {
            font-size: 14px;
          }
        }

        /* ── BUTTONS CLUSTER (DUA TOMBOL SEJAJAR DI TENGAH) ── */
        .not-found-btn-cluster {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          margin-top: 6px;
        }

        @media (max-width: 520px) {
          .not-found-btn-cluster {
            flex-direction: column;
            width: 100%;
          }
        }

        .not-found-btn {
          height: 48px;
          padding: 0 24px;
          border-radius: 16px;
          font-size: 14.5px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
          cursor: pointer;
        }

        @media (max-width: 520px) {
          .not-found-btn {
            width: 100%;
          }
        }

        .not-found-btn-primary {
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          color: #ffffff;
          box-shadow: 0 8px 24px -2px rgba(225, 29, 72, 0.32);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .not-found-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -2px rgba(225, 29, 72, 0.44), 0 0 20px rgba(244, 63, 94, 0.35);
          filter: brightness(1.05);
        }

        .not-found-btn-primary:active {
          transform: translateY(0);
        }

        .not-found-btn-secondary {
          background: rgba(255, 255, 255, 0.95);
          color: #334155;
          border: 1.5px solid #cbd5e1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .not-found-btn-secondary:hover {
          background: #ffffff;
          border-color: #f43f5e;
          color: #e11d48;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(244, 63, 94, 0.16), 0 0 16px rgba(251, 113, 133, 0.22);
        }

        .not-found-btn-secondary:active {
          transform: translateY(0);
        }

        .not-found-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.4);
        }

        /* ── INVALID PATH FOOTER NOTE ── */
        .not-found-path-hint {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          padding: 4px 12px;
          border-radius: 8px;
          background: rgba(241, 245, 249, 0.85);
          border: 1px solid rgba(226, 232, 240, 0.8);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 11.5px;
          color: #64748b;
          max-width: 90%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .not-found-path-label {
          font-weight: 600;
          color: #94a3b8;
        }

        .not-found-path-value {
          color: #be123c;
          font-weight: 500;
        }

        /* ── ACCESSIBILITY: PREFERS-REDUCED-MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          .not-found-petal {
            animation: none !important;
            display: none !important;
          }
          .not-found-emblem-wrap {
            animation: none !important;
          }
          .not-found-card {
            animation: none !important;
          }
          .not-found-digits {
            animation: none !important;
          }
          .not-found-btn {
            transition: none !important;
          }
        }
      `}</style>

      {/* ── 1. BACKGROUND WITH HOME VIDEO & GARDEN POSTER OVERLAY ── */}
      <div className="not-found-bg-layer" aria-hidden="true">
        {videoLoaded ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="not-found-video-media"
          >
            <source src="/home.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/images/home.webp"
            alt="Garden Background"
            className="not-found-img-fallback"
          />
        )}
        <div className="not-found-overlay-tint" />
      </div>

      {/* ── 2. FALLING FLOWER PETALS (12 PARTICLES) ── */}
      <div className="not-found-petals-field" aria-hidden="true">
        {PETALS.map((p) => (
          <span
            key={p.id}
            className="not-found-petal"
            style={{
              left: p.left,
              fontSize: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          >
            {p.icon}
          </span>
        ))}
      </div>

      {/* ── 3. FLOATING TOP-RIGHT LANGUAGE SWITCHER ── */}
      <header className="not-found-top-header">
        <LanguageSwitcher variant="compact" />
      </header>

      {/* ── 4. CENTER CARD ── */}
      <section className="not-found-card" aria-labelledby="not-found-heading-id">
        {/* Floral Emblem (88px, Center Top) */}
        <div className="not-found-emblem-wrap" aria-hidden="true">
          <Flower size={46} strokeWidth={2.2} />
        </div>

        {/* Big 404 Display */}
        <span className="not-found-digits" aria-hidden="true">
          404
        </span>

        {/* Small Label Pill */}
        <span className="not-found-badge-pill">
          {t('not_found_badge')}
        </span>

        {/* Main Title (h1) */}
        <h1 id="not-found-heading-id" className="not-found-heading">
          {t('not_found_title')}
        </h1>

        {/* Subtitle Description */}
        <p className="not-found-description">
          {t('not_found_desc')}
        </p>

        {/* Action Buttons: Buat Buket & Ke Beranda */}
        <div className="not-found-btn-cluster">
          <Link
            href="/menu"
            className="not-found-btn not-found-btn-primary"
            aria-label={t('not_found_btn_create')}
          >
            <Sparkles size={18} className="shrink-0" />
            <span>{t('not_found_btn_create')}</span>
          </Link>

          <Link
            href="/"
            className="not-found-btn not-found-btn-secondary"
            aria-label={t('not_found_btn_home')}
          >
            <Home size={18} className="shrink-0" />
            <span>{t('not_found_btn_home')}</span>
          </Link>
        </div>

        {/* Optional invalid path indicator */}
        {invalidPath && (
          <div className="not-found-path-hint" title={`Path: ${invalidPath}`}>
            <span className="not-found-path-label">{t('not_found_address_label')}</span>
            <span className="not-found-path-value">{invalidPath}</span>
          </div>
        )}
      </section>
    </main>
  );
}
