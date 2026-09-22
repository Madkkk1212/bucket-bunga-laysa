'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import GardenLoadingTransition from '../ui/GardenLoadingTransition';

export default function HeroActions() {
  const [isStartingGarden, setIsStartingGarden] = useState<boolean>(false);

  return (
    <>
      <div className="hero-actions">
        <button
          type="button"
          id="btn-design-hero"
          className="hero-cta"
          onClick={() => setIsStartingGarden(true)}
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

      {/* Enchanted Flower Garden Loading Transition Modal */}
      {isStartingGarden && (
        <GardenLoadingTransition
          autoNavigate={true}
          targetUrl="/designer"
          durationMs={2200}
          onFinish={() => setIsStartingGarden(false)}
        />
      )}
    </>
  );
}
