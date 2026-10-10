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
    <div className="hero-actions game-actions-single hero-fade-in stagger-3">
      {/* ── SATU-SATUNYA TOMBOL UTAMA: MULAI BUAT BUCKET ── */}
      <Link
        href="/menu"
        id="btn-start-game"
        className="game-btn-primary game-btn-massive"
        aria-label={t('home_hero_start_btn')}
      >
        <Sparkles size={22} className="game-sparkle-spin shrink-0" />
        <span className="game-btn-label-text">{t('home_hero_start_btn')}</span>
        <ArrowRight size={22} className="game-arrow-pulse shrink-0" />
      </Link>
    </div>
  );
}
