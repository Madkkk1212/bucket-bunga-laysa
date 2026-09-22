'use client';

import Image from 'next/image';
import { useDesign } from '../../context/DesignContext';
import { BUCKET_SIZES } from '../../data/buckets';
import NavigationButtons from '../designer/NavigationButtons';

export default function StepSize() {
  const { design, setBucketSize, setStep } = useDesign();

  return (
    <div className="step-content">
      <div className="step-header">
        <h2 className="step-title">Pilih Jenis Bucket</h2>
        <p className="step-desc">Pilih jenis pembungkus bucket favoritmu dari koleksi Laysa</p>
      </div>

      <div className="size-options">
        {BUCKET_SIZES.map((size) => (
          <button
            key={size.id}
            id={`size-${size.id}`}
            className={`size-card ${design.bucketSize === size.id ? 'selected' : ''}`}
            onClick={() => setBucketSize(size.id)}
            aria-pressed={design.bucketSize === size.id}
          >
            {size.image ? (
              <div className="size-visual bucket-photo-visual">
                <Image
                  src={size.image}
                  alt={size.label}
                  width={64}
                  height={68}
                  className="bucket-preview-thumb"
                  style={{
                    width: '64px',
                    height: '68px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.18))',
                  }}
                />
              </div>
            ) : (
              <div className="size-visual">
                <div className="size-bucket-icon" />
              </div>
            )}
            <div className="size-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span className="size-label">{size.label}</span>
                {size.tag && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      background: 'rgba(218, 165, 32, 0.15)',
                      color: '#B8860B',
                      padding: '2px 6px',
                      borderRadius: '10px',
                    }}
                  >
                    {size.tag}
                  </span>
                )}
              </div>
              {size.description && (
                <span className="size-desc-text" style={{ fontSize: '11px', color: '#666', lineHeight: 1.3, marginBottom: '4px' }}>
                  {size.description}
                </span>
              )}
              <span className="size-capacity">{size.capacity}</span>
            </div>
            {design.bucketSize === size.id && <span className="selected-check">✓</span>}
          </button>
        ))}
      </div>

      <NavigationButtons
        currentStep={1}
        totalSteps={5}
        onBack={() => {}}
        onNext={() => setStep(2)}
        nextLabel="Pilih & Rangkai Bunga"
      />
    </div>
  );
}
