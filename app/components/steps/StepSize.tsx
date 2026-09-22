'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Check, X, Layers, Palette } from 'lucide-react';
import { useDesign } from '../../context/DesignContext';
import { BUCKET_SIZES, getBucketSize } from '../../data/buckets';
import { CANVAS_RATIO_DIMENSIONS, BACKGROUND_THEMES } from '../../utils/canvasUtils';
import { CanvasRatio } from '../../types/design';
import SmartNumberInput from '../ui/SmartNumberInput';
import ModalPortal from '../ui/ModalPortal';
import NavigationButtons from '../designer/NavigationButtons';

export default function StepSize() {
  const {
    design,
    setBucketSize,
    setCanvasRatio,
    setBgTheme,
    setBouquetScale,
    setBouquetRotation,
    setStep,
  } = useDesign();

  // 3 bucket cards shown prominently in front (seperti tadi)
  const [visibleBucketIds, setVisibleBucketIds] = useState<string[]>([
    'bucket-1',
    'bucket-2',
    'bucket-3',
  ]);

  // Modal states: 'type' (pilih jenis: hanya gambar & tulisan) -> 'color' (pilih warna)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<'type' | 'color'>('type');
  const [selectedBucketInModal, setSelectedBucketInModal] = useState<string | null>(null);
  const [selectedColorInModal, setSelectedColorInModal] = useState<string>('bucket-1');

  const currentBucketId = design.bucketSize || 'bucket-1';

  // If design.bucketSize is not among visible 3 cards, ensure it is placed in the front
  const effectiveVisibleIds = visibleBucketIds.includes(currentBucketId)
    ? visibleBucketIds
    : [currentBucketId, visibleBucketIds[0], visibleBucketIds[1]];

  const handleSelectBucket = (id: string) => {
    setBucketSize(id);
    setVisibleBucketIds((prev) => {
      const rest = prev.filter((item) => item !== id);
      return [id, rest[0], rest[1]];
    });
  };

  const handleOpenModal = () => {
    setSelectedBucketInModal(null); // Mulai tanpa seleksi agar tombol Next baru muncul saat diklik
    setSelectedColorInModal(currentBucketId);
    setModalStep('type');
    setIsModalOpen(true);
  };

  const handleConfirmModal = () => {
    handleSelectBucket(selectedColorInModal);
    setIsModalOpen(false);
  };

  const currentColorBucket = getBucketSize(selectedColorInModal);

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

      {/* ─── 3 PILIHAN KARTU BUCKET DI DEPAN (SEPERTI TADI) ─── */}
      <div className="size-options size-options-clean">
        {effectiveVisibleIds.map((id) => {
          const size = getBucketSize(id);
          const isSelected = currentBucketId === size.id;
          return (
            <button
              key={size.id}
              id={`size-${size.id}`}
              type="button"
              className={`size-card-clean ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectBucket(size.id)}
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
                      filter: `drop-shadow(0 4px 10px rgba(0,0,0,0.18)) ${size.cssFilter || ''}`,
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

      {/* ─── TOMBOL: LIHAT SEMUA JENIS BUCKET (MEMUNCULKAN POPUP DENGAN BLUR) ─── */}
      <div className="see-all-buckets-wrap">
        <button
          type="button"
          className="btn-see-all-buckets"
          onClick={handleOpenModal}
          id="btn-see-all-buckets"
          title="Buka popup untuk memilih dari semua koleksi bucket Laysa"
        >
          <Layers size={15} />
          <span>Lihat Semua Jenis Bucket </span>
          <ChevronRight size={14} className="see-all-arrow" />
        </button>
      </div>

      {/* ─── PILIHAN RASIO KANVAS ─── */}
      <div className="step-section-group">
        <div className="step-section-header">
          <h3 className="step-section-title">Format Rasio Kanvas</h3>
          <p className="step-section-sub">Pilih ukuran proporsi kanvas untuk media sosial atau cetak</p>
        </div>

        <div className="ratio-cards-grid">
          {(Object.keys(CANVAS_RATIO_DIMENSIONS) as CanvasRatio[]).map((r) => {
            const info = CANVAS_RATIO_DIMENSIONS[r];
            const isSelected = (design.canvasRatio ?? '1:1') === r;
            return (
              <button
                key={r}
                id={`ratio-option-${r.replace(':', '-')}`}
                type="button"
                className={`ratio-select-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setCanvasRatio(r)}
                aria-pressed={isSelected}
              >
                <div className="ratio-card-icon-wrap">
                  <span className="ratio-card-icon">{info.icon}</span>
                </div>
                <div className="ratio-card-text">
                  <span className="ratio-card-title">{info.label}</span>
                  <span className="ratio-card-dims">{info.subLabel} • {info.width}×{info.height}px</span>
                </div>
                <div className="ratio-card-check">
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── PILIHAN TEMA LATAR KANVAS ─── */}
      <div className="step-section-group">
        <div className="step-section-header">
          <h3 className="step-section-title">Tema Latar Studio</h3>
          <p className="step-section-sub">Pilih pencahayaan dan warna latar belakang studio foto buket</p>
        </div>

        <div className="theme-options-grid">
          {BACKGROUND_THEMES.map((theme) => {
            const isSelected = (design.bgTheme ?? 'studio-warm') === theme.id;
            return (
              <button
                key={theme.id}
                id={`theme-option-${theme.id}`}
                type="button"
                className={`theme-card-clean ${isSelected ? 'selected' : ''}`}
                onClick={() => setBgTheme(theme.id)}
                aria-pressed={isSelected}
              >
                <span
                  className="theme-card-swatch"
                  style={{ backgroundColor: theme.previewColor }}
                />
                <span className="theme-card-name">{theme.badge}</span>
                {isSelected && (
                  <span className="theme-card-check">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── UKURAN & ROTASI BUKET (PENGATURAN AWAL) ─── */}
      <div className="step-section-group">
        <div className="step-section-header">
          <h3 className="step-section-title">Ukuran & Rotasi Buket</h3>
          <p className="step-section-sub">Atur skala besar kecilnya buket dan posisi kemiringan awal</p>
        </div>

        {/* Ukuran Buket */}
        <div className="step-control-card">
          <div className="step-control-card-header">
            <span className="step-control-label">Ukuran Buket:</span>
            {(design.bouquetScale ?? 1.0) !== 1.0 && (
              <button
                type="button"
                className="scale-reset-chip"
                onClick={() => setBouquetScale(1.0)}
                title="Kembalikan ukuran buket ke 100%"
              >
                Reset
              </button>
            )}
          </div>
          <div className="slider-control-row">
            <button
              type="button"
              className="scale-step-btn"
              onClick={() =>
                setBouquetScale(
                  Math.max(0.7, Number(((design.bouquetScale ?? 1.0) - 0.05).toFixed(2))),
                )
              }
              title="Perkecil buket"
            >
              −
            </button>
            <input
              type="range"
              className="artisan-slider"
              min={70}
              max={135}
              step={1}
              value={Math.round((design.bouquetScale ?? 1.0) * 100)}
              onChange={(e) => setBouquetScale(Number(e.target.value) / 100)}
            />
            <SmartNumberInput
              value={Math.round((design.bouquetScale ?? 1.0) * 100)}
              min={70}
              max={135}
              step={1}
              unit="%"
              onChange={(val) => setBouquetScale(val / 100)}
              ariaLabel="Ketik ukuran buket (%)"
              title="Ketik ukuran buket (%)"
            />
            <button
              type="button"
              className="scale-step-btn"
              onClick={() =>
                setBouquetScale(
                  Math.min(1.35, Number(((design.bouquetScale ?? 1.0) + 0.05).toFixed(2))),
                )
              }
              title="Perbesar buket"
            >
              +
            </button>
          </div>
        </div>

        {/* Putar Buket */}
        <div className="step-control-card">
          <div className="step-control-card-header">
            <span className="step-control-label">Putar Buket:</span>
            {(design.bouquetRotation ?? 0) !== 0 && (
              <button
                type="button"
                className="scale-reset-chip"
                onClick={() => setBouquetRotation(0)}
                title="Kembalikan rotasi buket ke 0°"
              >
                Reset
              </button>
            )}
          </div>
          <div className="slider-control-row">
            <button
              type="button"
              className="scale-step-btn"
              onClick={() =>
                setBouquetRotation(
                  Math.max(-180, Math.round((design.bouquetRotation ?? 0) - 15)),
                )
              }
              title="Putar kiri 15°"
            >
              ↺
            </button>
            <input
              type="range"
              className="artisan-slider"
              min={-180}
              max={180}
              step={1}
              value={design.bouquetRotation ?? 0}
              onChange={(e) => setBouquetRotation(Number(e.target.value))}
            />
            <SmartNumberInput
              value={design.bouquetRotation ?? 0}
              min={-180}
              max={180}
              step={1}
              unit="°"
              onChange={(val) => setBouquetRotation(val)}
              ariaLabel="Ketik rotasi buket (°)"
              title="Ketik rotasi buket (°)"
            />
            <button
              type="button"
              className="scale-step-btn"
              onClick={() =>
                setBouquetRotation(
                  Math.min(180, Math.round((design.bouquetRotation ?? 0) + 15)),
                )
              }
              title="Putar kanan 15°"
            >
              ↻
            </button>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <NavigationButtons
        currentStep={1}
        totalSteps={5}
        onBack={() => {}}
        onNext={() => setStep(2)}
        nextLabel="Pilih & Rangkai Bunga"
      />

      {/* ─── MODAL POPUP: STEP 1 (HANYA GAMBAR & TULISAN) ➔ NEXT ➔ STEP 2 (PILIH WARNA & SELESAI) ─── */}
      <ModalPortal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div
          className="bucket-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bucket-modal-title"
        >
          <div
            className="bucket-modal-container bucket-wizard-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bucket-modal-header">
              <div>
                <h3 id="bucket-modal-title" className="bucket-modal-title">
                  {modalStep === 'type'
                    ? 'Pilih Model Pembungkus Bucket'
                    : 'Pilih Warna Pembungkus Bucket'}
                </h3>
                <p className="bucket-modal-subtitle">
                  {modalStep === 'type'
                    ? 'Klik model pembungkus bucket di bawah untuk melanjutkan'
                    : `Tersedia ${BUCKET_SIZES.length} pilihan warna eksklusif`}
                </p>
              </div>
              <button
                type="button"
                className="bucket-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup popup"
              >
                <X size={18} />
              </button>
            </div>

            {/* ─── STEP 1 POPUP: HANYA GAMBAR DAN TULISANNYA ─── */}
            {modalStep === 'type' && (
              <div className="bucket-type-step-body">
                <div className="bucket-type-list">
                  <div
                    className={`bucket-type-card ${selectedBucketInModal ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedBucketInModal('korean-origami');
                      setSelectedColorInModal(currentBucketId);
                    }}
                  >
                    <div className="bucket-type-img-frame">
                      <Image
                        src="/images/bucket/bucket-1.png"
                        alt="Korean Origami Signature Wrap"
                        width={130}
                        height={140}
                        className="bucket-type-img"
                      />
                      {selectedBucketInModal && (
                        <span className="bucket-type-check-badge">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    <div className="bucket-type-text">
                      <h4 className="bucket-type-title">Korean Origami Signature Wrap</h4>
                    </div>
                  </div>
                </div>

                {/* ─── TOMBOL NEXT (BARU MUNCUL SAAT DIKLIK) ─── */}
                {selectedBucketInModal ? (
                  <div className="bucket-modal-footer-single">
                    <button
                      type="button"
                      className="btn btn-primary bucket-modal-next-btn"
                      onClick={() => setModalStep('color')}
                    >
                      <span>Lanjut: Pilih Warna Pembungkus</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="bucket-type-prompt-hint">
                    <span>👆 Klik model pembungkus di atas untuk memunculkan tombol Next</span>
                  </div>
                )}
              </div>
            )}

            {/* ─── STEP 2 POPUP: 1 FOTO DI TENGAH + PILIHAN WARNA & SELESAI ─── */}
            {modalStep === 'color' && (
              <div className="bucket-color-step-body">
                {/* Tombol kembali ke pilihan jenis */}
                <div className="bucket-modal-back-bar">
                  <button
                    type="button"
                    className="bucket-modal-back-btn"
                    onClick={() => setModalStep('type')}
                  >
                    <ChevronLeft size={14} />
                    <span>Kembali ke Model</span>
                  </button>
                </div>

                <div className="bucket-color-step-scrollable">
                  {/* 1 Foto Saja di Tengah (Dinamis berubah sesuai warna terpilih) */}
                  <div className="bucket-modal-hero-showcase">
                    <div className="bucket-modal-hero-frame">
                      {currentColorBucket.image ? (
                        <Image
                          key={currentColorBucket.id}
                          src={currentColorBucket.image}
                          alt={currentColorBucket.label}
                          width={140}
                          height={150}
                          className="bucket-modal-hero-img"
                          style={{
                            filter: `drop-shadow(0 10px 22px rgba(0,0,0,0.2)) ${currentColorBucket.cssFilter || ''}`,
                          }}
                        />
                      ) : (
                        <div className="size-bucket-icon" />
                      )}
                      {currentColorBucket.tag && (
                        <span className="bucket-modal-hero-tag">{currentColorBucket.tag}</span>
                      )}
                    </div>

                    <div className="bucket-modal-hero-info">
                      <div className="bucket-modal-hero-title-row">
                        <span
                          className="bucket-modal-hero-dot"
                          style={{ backgroundColor: currentColorBucket.colorHex || '#8B5A3C' }}
                        />
                        <h4 className="bucket-modal-hero-name">{currentColorBucket.label}</h4>
                      </div>
                      <p className="bucket-modal-hero-desc">{currentColorBucket.description}</p>
                    </div>
                  </div>

                  {/* Menu Warna-warnanya (Palette Swatches) */}
                  <div className="bucket-modal-palette-section">
                    <div className="bucket-modal-palette-header">
                      <span className="bucket-modal-palette-title">
                        Pilih Warna Pembungkus ({BUCKET_SIZES.length} Warna):
                      </span>
                      <span className="bucket-modal-palette-hint">
                        Klik warna untuk mengganti 1 foto di atas & kanvas
                      </span>
                    </div>

                    <div className="bucket-palette-grid">
                      {BUCKET_SIZES.map((b) => {
                        const isSelected = selectedColorInModal === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            className={`bucket-palette-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => setSelectedColorInModal(b.id)}
                          >
                            <span
                              className="bucket-palette-swatch-circle"
                              style={{ backgroundColor: b.colorHex || '#8B5A3C' }}
                            />
                            <span className="bucket-palette-label">{b.label.replace('Korean ', '')}</span>
                            {isSelected && (
                              <span className="bucket-palette-check">
                                <Check size={12} strokeWidth={3} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Modal Footer: Selesai */}
                <div className="bucket-modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary bucket-modal-done-btn"
                    onClick={handleConfirmModal}
                  >
                    <Check size={16} />
                    <span>Selesai & Pasang ke Buket</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalPortal>
    </div>
  );
}
