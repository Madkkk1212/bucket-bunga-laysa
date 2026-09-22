'use client';

import Image from 'next/image';
import { ChevronRight, Check } from 'lucide-react';
import { useDesign } from '../../context/DesignContext';
import { BUCKET_SIZES } from '../../data/buckets';
import NavigationButtons from '../designer/NavigationButtons';

export default function StepSize() {
  const { design, setBucketSize, setStep } = useDesign();

  return (
    <div className="step-content">
      {/* ─── HEADER DENGAN TOMBOL NEXT DI ATAS ─── */}
      <div className="step-header-with-top-action">
        <div className="step-header-text">
          <h2 className="step-title">Pilih Jenis Bucket</h2>
          <p className="step-desc">Pilih pembungkus bucket favoritmu dari koleksi Laysa</p>
        </div>

        <button
          type="button"
          className="btn btn-primary step-top-next-btn"
          onClick={() => setStep(2)}
          id="btn-step1-next-top"
          aria-label="Lanjut ke langkah berikutnya"
        >
          <span>Lanjut: Rangkai Bunga</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ─── PILIHAN BUCKET (HANYA FOTO & NAMA) ─── */}
      <div className="size-options size-options-clean">
        {BUCKET_SIZES.map((size) => {
          const isSelected = design.bucketSize === size.id;
          return (
            <button
              key={size.id}
              id={`size-${size.id}`}
              type="button"
              className={`size-card-clean ${isSelected ? 'selected' : ''}`}
              onClick={() => setBucketSize(size.id)}
              aria-pressed={isSelected}
            >
              <div className="size-card-clean-visual">
                {size.image ? (
                  <Image
                    src={size.image}
                    alt={size.label}
                    width={72}
                    height={76}
                    className="bucket-preview-thumb"
                    style={{
                      width: '72px',
                      height: '76px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))',
                    }}
                  />
                ) : (
                  <div className="size-bucket-icon" />
                )}
              </div>

              <div className="size-card-clean-info">
                <span className="size-card-clean-name">{size.label}</span>
              </div>

              <div className="size-card-clean-check">
                {isSelected ? (
                  <span className="check-badge-active">
                    <Check size={14} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="check-badge-inactive" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom navigation */}
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
