'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
}

export default function NavigationButtons({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  nextLabel,
  isNextDisabled,
}: NavigationButtonsProps) {
  const isFirst = currentStep === 1;
  const isLast = currentStep === totalSteps;

  return (
    <div className="nav-buttons">
      {!isFirst && (
        <button
          type="button"
          className="btn btn-secondary nav-btn-back"
          onClick={onBack}
          aria-label="Kembali ke langkah sebelumnya"
        >
          <ChevronLeft size={15} />
          <span>Kembali</span>
        </button>
      )}

      {!isLast && (
        <button
          type="button"
          className="btn btn-primary nav-btn-next"
          onClick={onNext}
          disabled={isNextDisabled}
          aria-label="Lanjut ke langkah berikutnya"
        >
          <span className="nav-btn-next-label">{nextLabel ?? 'Lanjut'}</span>
          <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}
