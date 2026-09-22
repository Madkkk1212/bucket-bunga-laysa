'use client';

import { useRef } from 'react';
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
import { BookOpen, Edit3 } from 'lucide-react';

const STEP_TITLES: Record<number, string> = {
  1: 'Pilih Jenis Bucket',
  2: 'Pilih Bunga & Rangkai',
  3: 'Tulis Kartu Ucapan',
  4: 'Pratinjau Desain Buket',
  5: 'Unduh Hasil Rangkaian',
};

export default function DesignerLayout() {
  const { design, setStep, resetToEdit2D } = useDesign();
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
          <div className="flex items-center gap-3">
            <h1 className="ds-header-title">{STEP_TITLES[design.currentStep]}</h1>
            {isFinalOrStep5 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                PRODUK FINAL
              </span>
            )}
          </div>
          <Link href="/tutorial" className="ds-header-tutorial-btn" id="nav-btn-tutorial-designer">
            <BookOpen size={15} />
            Tutorial
          </Link>
        </header>

        {/* Content Area */}
        <div className="ds-content">
          {/* Step Form Panel */}
          <section className="ds-step-panel">
            <div className="ds-step-form">{renderStep()}</div>
          </section>

          {/* Canvas + Selection Summary */}
          <section className="ds-canvas-panel">
            {/* ─── TOOLBAR KANVAS 2D ─── */}
            <div className="ds-view-tabs flex items-center justify-between">
              {!isFinalOrStep5 ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Studio RANGKAIAN
                  </span>
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

            {/* Canvas Row — canvas on left, selection summary on right */}
            <div className="ds-canvas-row">
              {/* Canvas Area */}
              <div className="ds-canvas-area">
                <PreviewCanvas canvasRef={canvasRef} />
              </div>

              {/* Selection Summary panel — hanya ditampilkan saat tahap editor 2D */}
              {!isFinalOrStep5 && <SelectionSummary />}
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
    </div>
  );
}
