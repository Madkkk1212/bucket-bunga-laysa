'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useDesign } from '../../context/DesignContext';
import PreviewCanvas from '../designer/PreviewCanvas';
import DesignerSidebar from '../designer/DesignerSidebar';
import SelectionSummary from '../designer/SelectionSummary';
import StepSize from '../steps/StepSize';
import StepFlowers from '../steps/StepFlowers';
import StepText from '../steps/StepText';
import StepPreview from '../steps/StepPreview';
import StepDownload from '../steps/StepDownload';
import ModalPortal from '../ui/ModalPortal';
import { BookOpen, Edit3, SlidersHorizontal, ChevronRight } from 'lucide-react';

const STEP_TITLES: Record<number, string> = {
  1: 'Pilih Jenis Bucket',
  2: 'Pilih Bunga & Rangkai',
  3: 'Tulis Kartu Ucapan',
  4: 'Pratinjau Desain Buket',
  5: 'Unduh Hasil Rangkaian',
};

const STEP_TITLES_MOBILE: Record<number, string> = {
  1: 'Pilih Bucket',
  2: 'Rangkai Bunga',
  3: 'Kartu Ucapan',
  4: 'Pratinjau',
  5: 'Unduh Buket',
};

export default function DesignerLayout() {
  const { design, setStep, resetToEdit2D } = useDesign();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAturBungaOpen, setIsAturBungaOpen] = useState(false);

  const isFinalOrStep5 = design.final2D.status === 'final' || design.currentStep === 5;

  const renderStep = () => {
    switch (design.currentStep) {
      case 1:
        return <StepSize />;
      case 2:
        return <StepFlowers />;
      case 3:
        return <StepText />;
      case 4:
        return <StepPreview canvasRef={canvasRef} />;
      case 5:
        return <StepDownload canvasRef={canvasRef} />;
      default:
        return <StepSize />;
    }
  };

  return (
    <div className="ds-root">
      {/* ── Left Sidebar ── */}
      <DesignerSidebar
        currentStep={design.currentStep}
        totalSteps={5}
        onStepClick={(step) => {
          if (step <= design.currentStep) setStep(step);
        }}
      />

      {/* ── Main Area ── */}
      <div className="ds-main">
        {/* Top Header Bar */}
        <header className="ds-header">
          <div className="ds-header-left">
            <h1 className="ds-header-title">
              <span className="ds-title-desktop">{STEP_TITLES[design.currentStep]}</span>
              <span className="ds-title-mobile">{STEP_TITLES_MOBILE[design.currentStep]}</span>
            </h1>
            {isFinalOrStep5 && (
              <span className="ds-final-badge">
                FINAL
              </span>
            )}
          </div>

          <div className="ds-header-actions">
            {/* Tombol Menu Atur Bunga di Atas */}
            {!isFinalOrStep5 && (
              <button
                type="button"
                className={`ds-header-atur-bunga-btn ${isAturBungaOpen ? 'active' : ''}`}
                onClick={() => setIsAturBungaOpen(!isAturBungaOpen)}
                id="btn-top-atur-bunga"
                title="Atur susunan bunga, lapisan depan/belakang, ukuran, dan hapus bunga"
              >
                <SlidersHorizontal size={13} />
                <span className="ds-btn-text">Atur Bunga</span>
                {design.selectedFlowers.length > 0 && (
                  <span className="atur-bunga-count-pill">{design.selectedFlowers.length}</span>
                )}
              </button>
            )}

            {/* Tombol Lanjut di Atas Header */}
            {design.currentStep < 5 && (
              <button
                type="button"
                className="ds-header-next-btn"
                onClick={() => setStep(design.currentStep + 1)}
                id="btn-top-header-next"
                title="Lanjut ke langkah berikutnya"
              >
                <span>Lanjut</span>
                <ChevronRight size={13} />
              </button>
            )}

            <Link href="/tutorial" className="ds-header-tutorial-btn" id="nav-btn-tutorial-designer" title="Panduan Tutorial">
              <BookOpen size={13} />
              <span className="ds-btn-text">Tutorial</span>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="ds-content">
          {/* Step Form Panel: Pemilihan Dulu Semuanya */}
          <section className="ds-step-panel">
            <div className="ds-step-form">{renderStep()}</div>
          </section>

          {/* Canvas Panel: Hasil Studio Rangkaian di Bawah */}
          <section className="ds-canvas-panel" id="studio-canvas-section">
            {/* ─── TOOLBAR KANVAS 2D ─── */}
            <div className="ds-view-tabs flex items-center justify-between">
              {!isFinalOrStep5 ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Studio RANGKAIAN (Hasil Rangkaian)
                  </span>

                  {/* Tombol Cepat Atur Bunga di Toolbar Kanvas */}
                  <button
                    type="button"
                    className={`ds-canvas-atur-btn ${isAturBungaOpen ? 'active' : ''}`}
                    onClick={() => setIsAturBungaOpen(!isAturBungaOpen)}
                    id="btn-canvas-toolbar-atur"
                  >
                    <SlidersHorizontal size={13} />
                    <span>Menu Atur Bunga</span>
                    {design.selectedFlowers.length > 0 && (
                      <span className="atur-bunga-count-pill">{design.selectedFlowers.length}</span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Pratinjau Desain Final
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1.5 shadow-sm transition"
                    onClick={resetToEdit2D}
                    id="btn-toolbar-edit-2d"
                    title="Kembali ke editor kanvas untuk mengubah bunga"
                  >
                    <Edit3 size={13} /> Edit Desain
                  </button>
                </div>
              )}
            </div>

            {/* Canvas Row — Full width canvas */}
            <div className="ds-canvas-row">
              <div className="ds-canvas-area">
                <PreviewCanvas canvasRef={canvasRef} />
              </div>
            </div>

            {/* Canvas Caption */}
            <p className="ds-canvas-caption">
              {isFinalOrStep5
                ? '✨ Desain Buket berstatus FINAL • Siap diunduh dalam resolusi tinggi HD'
                : 'Geser, atur posisi, rotasi, dan susun bunga Anda secara bebas pada kanvas 2D'}
            </p>
          </section>
        </div>
      </div>

      {/* ─── MODAL / DRAWER ATUR BUNGA (TAMPIL HANYA SAAT DIKLIK) ─── */}
      <ModalPortal
        isOpen={isAturBungaOpen && !isFinalOrStep5}
        onClose={() => setIsAturBungaOpen(false)}
      >
        <div
          className="artisan-drawer-backdrop"
          onClick={() => setIsAturBungaOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Menu Atur Bunga Buket Anda"
        >
          <div
            className="artisan-drawer-container"
            onClick={(e) => e.stopPropagation()}
          >
            <SelectionSummary onClose={() => setIsAturBungaOpen(false)} />
          </div>
        </div>
      </ModalPortal>
    </div>
  );
}
