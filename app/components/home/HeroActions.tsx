'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen } from 'lucide-react';
import GardenLoadingTransition from '../ui/GardenLoadingTransition';

export default function HeroActions() {
  const router = useRouter();
  const [isStartingGarden, setIsStartingGarden] = useState<boolean>(false);

  // Pre-fetch designer route chunk as soon as home page loads for instant navigation
  useEffect(() => {
    router.prefetch('/designer');
  }, [router]);

  return (
    <>
      <div className="hero-actions">
        <button
          type="button"
          id="btn-design-hero"
          className="hero-cta"
          onClick={() => {
            setIsStartingGarden(true);
            router.prefetch('/designer');
          }}
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

      {/* Enchanted Flower Garden Loading Transition */}
      {isStartingGarden && (
        <GardenLoadingTransition
          autoNavigate={true}
          targetUrl="/designer"
          durationMs={1500}
        />
      )}
    </>
  );
}

