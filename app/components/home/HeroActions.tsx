'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function HeroActions() {
  const router = useRouter();

  // Pre-fetch designer route chunk as soon as home page loads for instant navigation
  useEffect(() => {
    router.prefetch('/designer');
  }, [router]);

  return (
    <div className="hero-actions">
      <button
        type="button"
        id="btn-design-hero"
        className="hero-cta"
        onClick={() => router.push('/designer')}
        aria-label="Mulai merancang buket bunga"
      >
        <span>MULAI RANCANG BUKET</span>
        <ArrowRight size={18} />
      </button>

      <Link href="/tutorial" id="btn-tutorial-hero" className="hero-btn-tutorial">
        <BookOpen size={16} />
        <span>TUTORIAL</span>
      </Link>
    </div>
  );
}
