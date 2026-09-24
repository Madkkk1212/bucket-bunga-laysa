'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const STEP_LABELS = ['Jenis Bucket', 'Bunga', 'Pesan', 'Pratinjau', 'Unduh'];

export default function StepIndicator({ currentStep, totalSteps = 5 }: StepIndicatorProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="step-indicator">
      <div className="step-progress-bar">
        <div className="step-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="step-dots">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isDone = step < currentStep;
          const isActive = step === currentStep;
          return (
            <div key={step} className={`step-dot-wrap ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
              <div className="step-dot">
                {isDone ? '✓' : step}
              </div>
              <span className="step-dot-label">{STEP_LABELS[i]}</span>
            </div>
          );
        })}
      </div>
      <p className="step-counter">Langkah {currentStep} dari {totalSteps}</p>
    </div>
  );
}
