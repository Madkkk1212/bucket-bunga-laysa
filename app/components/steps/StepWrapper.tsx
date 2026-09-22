'use client';

import { useDesign } from '../../context/DesignContext';
import { WRAPPER_TYPES } from '../../data/wrappers';
import NavigationButtons from '../designer/NavigationButtons';

export default function StepWrapper() {
  const { design, setWrapperType, setStep } = useDesign();

  return (
    <div className="step-content">
      <div className="step-header">
        <h2 className="step-title">Choose Wrapper Paper</h2>
        <p className="step-desc">Select your preferred wrapping style</p>
      </div>

      <div className="wrapper-grid">
        {WRAPPER_TYPES.map((wrapper) => (
          <button
            key={wrapper.id}
            id={`wrapper-${wrapper.id}`}
            className={`wrapper-card ${design.wrapperType === wrapper.id ? 'selected' : ''}`}
            onClick={() => setWrapperType(wrapper.id)}
            aria-pressed={design.wrapperType === wrapper.id}
          >
            <div
              className="wrapper-swatch"
              style={{ backgroundColor: wrapper.color }}
              aria-hidden="true"
            >
              {wrapper.texture === 'shiny' && (
                <div className="wrapper-sheen" />
              )}
            </div>
            <span className="wrapper-label">{wrapper.label}</span>
            {design.wrapperType === wrapper.id && (
              <span className="selected-badge">✓</span>
            )}
          </button>
        ))}
      </div>

      <NavigationButtons
        currentStep={2}
        totalSteps={6}
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
      />
    </div>
  );
}
