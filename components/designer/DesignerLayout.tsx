'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDesign } from '@/context/DesignContext';
import PreviewCanvas from '../designer/PreviewCanvas';
import DesignerSidebar from '../designer/DesignerSidebar';
import SelectionSummary from '../designer/SelectionSummary';
import MobileFlowerToolbar from '../designer/MobileFlowerToolbar';
import FlowerCountModal from '../designer/FlowerCountModal';
import PremiumUnlockModal from '../designer/PremiumUnlockModal';
import StepSize from '../steps/StepSize';
import StepFlowers from '../steps/StepFlowers';
import StepText from '../steps/StepText';
import StepPreview from '../steps/StepPreview';
import StepDownload from '../steps/StepDownload';
import { FlowerCountVariant } from '@/types/design';
import { BookOpen, Edit3, SlidersHorizontal, ChevronRight, Sparkles, Crown } from 'lucide-react';
import VipCardModal from '../designer/VipCardModal';

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
  const { design, setStep, resetToEdit2D, setTargetFlowerCount, isPremiumUnlocked, premiumUserName, revokePremium } = useDesign();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAturBungaOpen, setIsAturBungaOpen] = useState(false);
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isVipMenuOpen, setIsVipMenuOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Mark as mounted so VIP state (from localStorage) only affects UI post-hydration
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Check URL query param ?flowers=5|10|15|25|50 or prompt popup on initial load
  useEffect(() => {
    const param = searchParams.get('flowers');
    if (param) {
      const parsed = parseInt(param, 10);
      if ([5, 10, 15, 25, 50].includes(parsed)) {
        setTargetFlowerCount(parsed as FlowerCountVariant);
        try {
          sessionStorage.setItem('laysa_chosen_flower_count', String(parsed));
        } catch {
          // Ignore storage errors
        }
        return;
      }
    }

    // Check if user has already chosen in this session
    try {
      const saved = sessionStorage.getItem('laysa_chosen_flower_count');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if ([5, 10, 15, 25, 50].includes(parsed)) {
          setTargetFlowerCount(parsed as FlowerCountVariant);
          return;
        }
      }
    } catch {
      // Ignore storage errors
    }

    // Otherwise, show popup immediately on entering /designer
    setIsCountModalOpen(true);
  }, [searchParams, setTargetFlowerCount]);

  const handleConfirmFlowerCount = (count: FlowerCountVariant) => {
    setTargetFlowerCount(count);
    try {
      sessionStorage.setItem('laysa_chosen_flower_count', String(count));
    } catch {
      // Ignore
    }
    setIsCountModalOpen(false);
  };

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
            {/* VIP Badge / Unlock Button */}
            {hasMounted && isPremiumUnlocked ? (
              <button
                type="button"
                className="ds-header-vip-active-badge cursor-pointer"
                onClick={() => setIsVipMenuOpen(true)}
                title="Klik untuk lihat status VIP kamu"
                id="btn-header-vip-badge"
              >
                <Sparkles size={13} className="text-amber-500 shrink-0" />
                <span>VIP: {premiumUserName || 'Aktif'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="ds-header-vip-unlock-btn"
                onClick={() => setIsUnlockModalOpen(true)}
                title="Buka Kunci Seluruh Koleksi Bunga & Bucket VIP"
                id="btn-header-unlock-vip"
              >
                <Crown size={13} className="text-amber-500" />
                <span>Buka VIP</span>
              </button>
            )}

            {/* Pill Pilihan Kapasitas Jumlah Bunga */}
            <button
              type="button"
              className="ds-header-flower-count-btn"
              onClick={() => setIsCountModalOpen(true)}
              title="Klik untuk mengubah kuota jumlah bunga"
              id="btn-header-change-flower-count"
            >
              <span>🌸 {design.targetFlowerCount || 25} Bunga</span>
              <span className="ds-change-count-sub">(Ubah)</span>
            </button>

            {/* Tombol Menu Atur Bunga di Atas */}
            {!isFinalOrStep5 && (
              <button
                type="button"
                className={`ds-header-atur-bunga-btn ${isAturBungaOpen ? 'active' : ''}`}
                onClick={() => {
                  const next = !isAturBungaOpen;
                  setIsAturBungaOpen(next);
                  if (next && typeof window !== 'undefined' && window.innerWidth <= 768) {
                    setTimeout(() => {
                      const section = document.getElementById('mobile-atur-bunga-section') || document.getElementById('studio-canvas-section');
                      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 60);
                  }
                }}
                id="btn-top-atur-bunga"
                title="Atur susunan bunga, lapisan depan/belakang, ukuran, dan hapus bunga"
              >
                <SlidersHorizontal size={13} />
                <span className="ds-btn-text">{isAturBungaOpen ? 'Tutup Atur' : 'Atur Bunga'}</span>
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

        {/* Modal Pemilih Jumlah Bunga (5, 10, 15, 25, 50) */}
        <FlowerCountModal
          isOpen={isCountModalOpen}
          initialCount={design.targetFlowerCount || 25}
          onConfirm={handleConfirmFlowerCount}
          onClose={() => setIsCountModalOpen(false)}
          canDismiss={Boolean(design.targetFlowerCount)}
        />

        {/* Modal Buka Akses VIP via Header */}
        <PremiumUnlockModal
          isOpen={isUnlockModalOpen}
          onClose={() => setIsUnlockModalOpen(false)}
        />

        {/* VIP Card Popup saat badge VIP diklik */}
        <VipCardModal
          isOpen={isVipMenuOpen}
          onClose={() => setIsVipMenuOpen(false)}
          userName={premiumUserName || ''}
          onRevoke={revokePremium}
        />



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
                    onClick={() => {
                      const next = !isAturBungaOpen;
                      setIsAturBungaOpen(next);
                      if (next && typeof window !== 'undefined' && window.innerWidth <= 768) {
                        setTimeout(() => {
                          const section = document.getElementById('mobile-atur-bunga-section') || document.getElementById('studio-canvas-section');
                          if (section) section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }, 60);
                      }
                    }}
                    id="btn-canvas-toolbar-atur"
                  >
                    <SlidersHorizontal size={13} />
                    <span>{isAturBungaOpen ? 'Tutup Atur Bunga' : 'Menu Atur Bunga'}</span>
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

            {/* Canvas Row — canvas + menu atur bunga side-by-side di kanan */}
            <div className="ds-canvas-row">
              <div className={`ds-canvas-area ${isAturBungaOpen ? 'has-mobile-drawer' : ''}`}>
                <PreviewCanvas canvasRef={canvasRef} />
              </div>

              {/* ─── MENU ATUR BUNGA (DESKTOP: SIDEBAR KANAN • MOBILE: BOTTOM SHEET DOCKING) ─── */}
              {isAturBungaOpen && !isFinalOrStep5 && (
                <aside className="ds-atur-bunga-sidebar" id="atur-bunga-sidebar-section">
                  <SelectionSummary onClose={() => setIsAturBungaOpen(false)} />
                </aside>
              )}
            </div>

            {/* Canvas Caption */}
            <p className="ds-canvas-caption">
              {isFinalOrStep5
                ? '✨ Desain Buket berstatus FINAL • Siap diunduh dalam resolusi tinggi HD'
                : 'Geser, atur posisi, rotasi, dan susun bunga Anda secara bebas pada kanvas 2D'}
            </p>

            {/* ─── MOBILE: KONTROL ATUR BUNGA DI BAWAH TULISAN DENGAN ICON KECIL SIMPEL ─── */}
            {isAturBungaOpen && !isFinalOrStep5 && design.selectedFlowers.length > 0 && (
              <div className="ds-mobile-atur-bunga-container" id="mobile-atur-bunga-section">
                <MobileFlowerToolbar onClose={() => setIsAturBungaOpen(false)} />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
