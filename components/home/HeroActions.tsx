'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroActions() {
  const router = useRouter();
  const { t } = useLanguage();

  // Pre-fetch game menu and designer routes for instantaneous navigation
  useEffect(() => {
    router.prefetch('/menu');
    router.prefetch('/designer');
  }, [router]);

  return (
    <div className="hero-actions game-actions-single">
      {/* ── SATU-SATUNYA TOMBOL UTAMA: MULAI BUAT BUCKET ── */}
      <Link
        href="/menu"
        id="btn-start-game"
        className="game-btn-primary game-btn-massive"
        aria-label={t('home_hero_start_btn')}
      >
        <Sparkles size={22} className="game-sparkle-spin" />
        <span>{t('home_hero_start_btn')}</span>
        <ArrowRight size={22} className="game-arrow-pulse" />
      </Link>

      {/* ── BENEFIT HIGHLIGHTS UNDER BUTTON ── */}
      <div className="hero-trust-row" aria-label="Keunggulan Layanan">
        <span className="hero-trust-chip">
          <Sparkles size={13} className="text-amber-500" />
          <span>100% Gratis</span>
        </span>
        <span className="hero-trust-dot">•</span>
        <span className="hero-trust-chip">
          <span>Tanpa Daftar</span>
        </span>
        <span className="hero-trust-dot">•</span>
        <span className="hero-trust-chip">
          <span>Unduh Kualitas HD</span>
        </span>
      </div>
    </div>
  );
}
