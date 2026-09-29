'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HeroActions() {
  const router = useRouter();

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
        aria-label="Mulai buat bucket"
      >
        <Sparkles size={22} className="game-sparkle-spin" />
        <span>MULAI BUAT BUCKET</span>
        <ArrowRight size={22} className="game-arrow-pulse" />
      </Link>
    </div>
  );
}
