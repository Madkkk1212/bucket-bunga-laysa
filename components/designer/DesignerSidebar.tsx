'use client';

import Link from 'next/link';
import { Flower2 } from 'lucide-react';

interface DesignerSidebarProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { label: 'Jenis Bucket', short: 'Bucket' },
  { label: 'Pilih Bunga', short: 'Bunga' },
  { label: 'Kartu Pesan', short: 'Pesan' },
  { label: 'Pratinjau Desain', short: 'Review' },
  { label: 'Unduh Hasil', short: 'Unduh' },
];

export default function DesignerSidebar({ currentStep, onStepClick }: DesignerSidebarProps) {
  return (
    <aside className="ds-sidebar">
      {/* Brand Header */}
      <div className="ds-sidebar-header">
        <Link href="/" className="ds-sidebar-brand" aria-label="Kembali ke Beranda">
          <Flower2 size={20} className="ds-sidebar-brand-icon" />
          <div className="ds-sidebar-brand-text">
            <span className="ds-sidebar-brand-main">BUCKET</span>
            <span className="ds-sidebar-brand-accent">LAYSA</span>
          </div>
        </Link>
        <span className="ds-mobile-step-status">
          Langkah {currentStep}/5: {STEPS[currentStep - 1]?.short}
        </span>
      </div>

      {/* Step Nav */}
      <nav className="ds-step-nav" aria-label="Langkah desain">
        {STEPS.map((step, i) => {
          const num = i + 1;
          const isDone = num < currentStep;
          const isActive = num === currentStep;

          return (
            <button
              key={num}
              type="button"
              className={`ds-step-item ${isActive ? 'ds-step-active' : ''} ${isDone ? 'ds-step-done' : ''}`}
              onClick={() => onStepClick?.(num)}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="ds-step-num">{isDone ? '✓' : num}</span>
              <span className="ds-step-label">{step.label}</span>
              <span className="ds-step-label-short">{step.short}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom decoration */}
      <div className="ds-sidebar-deco" aria-hidden="true">
        <span className="ds-sidebar-deco-flower">🌸</span>
        <span className="ds-sidebar-deco-flower">🌷</span>
        <span className="ds-sidebar-deco-flower">🌺</span>
      </div>
    </aside>
  );
}
