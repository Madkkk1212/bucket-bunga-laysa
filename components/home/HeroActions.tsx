'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import FlowerCountModal from '../designer/FlowerCountModal';
import { FlowerCountVariant } from '@/types/design';

export default function HeroActions() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pre-fetch designer route chunk as soon as home page loads for instant navigation
  useEffect(() => {
    router.prefetch('/designer');
  }, [router]);

  const handleOpenCountModal = () => {
    setIsModalOpen(true);
  };

  const handleConfirmCount = (count: FlowerCountVariant) => {
    setIsModalOpen(false);
    router.push(`/designer?flowers=${count}`);
  };

  return (
    <>
      <div className="hero-actions">
        <button
          type="button"
          id="btn-design-hero"
          className="hero-cta"
          onClick={handleOpenCountModal}
          aria-label="Mulai merancang buket bunga"
        >
          <span>MULAI RANCANG BUKET</span>
          <ArrowRight size={18} />
        </button>

        <Link
          href="/tutorial"
          id="btn-tutorial-hero"
          className="hero-btn-tutorial"
          aria-label="Lihat panduan tutorial merangkai buket"
        >
          <BookOpen size={16} />
          <span>TUTORIAL</span>
        </Link>
      </div>

      <FlowerCountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCount}
        canDismiss={true}
      />
    </>
  );
}
