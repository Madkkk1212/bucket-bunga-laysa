'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDesign } from '@/context/DesignContext';
import PreviewCanvas from '../designer/PreviewCanvas';
import SelectionSummary from '../designer/SelectionSummary';
import FlowerCountModal from '../designer/FlowerCountModal';
import PremiumUnlockModal from '../designer/PremiumUnlockModal';
import VipCardModal from '../designer/VipCardModal';
import FlowerGardenModal from '../garden/FlowerGardenModal';
import StepSize from '../steps/StepSize';
import StepFlowers from '../steps/StepFlowers';
import StepText from '../steps/StepText';
import StepPreview from '../steps/StepPreview';
import StepDownload from '../steps/StepDownload';
import CanvaLeftRail from './CanvaLeftRail';
import CanvaTopToolbar from './CanvaTopToolbar';
import CanvaAnalyzerDrawer from './CanvaAnalyzerDrawer';
import CanvaAtmosphereBackdrop from './CanvaAtmosphereBackdrop';
import FlowerLimitModal from './FlowerLimitModal';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { computeAestheticMetrics } from '@/utils/bouquetConsolePresets';
import { consoleAudio } from '@/utils/consoleAudio';
import { FlowerCountVariant } from '@/types/design';
import {
  Sparkles,
  Crown,
  ChevronRight,
  Edit3,
  Check,
  CloudCheck,
} from 'lucide-react';

interface DesignerLayoutProps {
  onBackToDashboard?: () => void;
}

export default function DesignerLayout({ onBackToDashboard }: DesignerLayoutProps = {}) {
  const { t, language } = useLanguage();

  const stepTitles: Record<number, string> = {
    1: t('step_size_title'),
    2: t('step_flowers_title'),
    3: t('step_card_title'),
    4: t('step_preview_title'),
    5: t('step_download_title'),
  };
  const {
    design,
    setStep,
    resetToEdit2D,
    setTargetFlowerCount,
    isPremiumUnlocked,
    premiumUserName,
    revokePremium,
    isFlowerLimitModalOpen,
    setIsFlowerLimitModalOpen,
  } = useDesign();

  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isVipMenuOpen, setIsVipMenuOpen] = useState(false);
  const [isGardenModalOpen, setIsGardenModalOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Editable Project Name ala Canva
  const [projectName, setProjectName] = useState('Desain Buket Spesial');
  const [isEditingName, setIsEditingName] = useState(false);

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
          // Ignore
        }
        return;
      }
    }

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
      // Ignore
    }

    setIsCountModalOpen(true);
  }, [searchParams, setTargetFlowerCount]);

  const handleConfirmFlowerCount = (count: FlowerCountVariant) => {
    consoleAudio.play('soft');
    setTargetFlowerCount(count);
    try {
      sessionStorage.setItem('laysa_chosen_flower_count', String(count));
    } catch {
      // Ignore
    }
    setIsCountModalOpen(false);
  };

  const handleNextStep = () => {
    if (design.currentStep < 5) {
      consoleAudio.play('chime');
      setStep(design.currentStep + 1);
    }
  };

  // Aesthetic metrics computed live
  const metrics = useMemo(() => {
    return computeAestheticMetrics(
      design.selectedFlowers,
      design.targetFlowerCount || 25
    );
  }, [design.selectedFlowers, design.targetFlowerCount]);

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
    <div className="canva-studio-root">
      {/* ── 1. CANVA TOP APP BAR ── */}
      <header className="canva-top-bar" aria-label="Canva Studio Header">
        {/* Left: Project title & Saved status */}
        <div className="canva-top-left">
          {isEditingName ? (
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingName(false);
              }}
              autoFocus
              className="canva-title-input"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="canva-title-display-btn"
              title="Klik untuk mengubah nama karya buket"
            >
              <span>{projectName}</span>
              <Edit3 size={12} style={{ color: '#94a3b8' }} />
            </button>
          )}

          <div className="canva-autosave-badge">
            <span className="canva-dot-emerald" />
            <span>{t('saved')}</span>
          </div>
        </div>

        {/* Right: Language switcher, Flower capacity, VIP badge, Next button */}
        <div className="canva-top-actions">
          {/* Language Switcher Toggle */}
          <LanguageSwitcher variant="standard" />

          {/* Target Flower Count Pill */}
          <button
            type="button"
            className="canva-count-pill"
            onClick={() => {
              consoleAudio.play('soft');
              setIsCountModalOpen(true);
            }}
            title="Ubah kuota jumlah bunga"
          >
            <span>🌸</span>
            <span className="font-semibold text-slate-800">
              {design.selectedFlowers.length} / {design.targetFlowerCount || 25} {t('flowers_unit')}
            </span>
            <span className="text-[11px] text-indigo-600 font-medium">({t('change')})</span>
          </button>

          {/* VIP Badge / Unlock Button */}
          {hasMounted && isPremiumUnlocked ? (
            <button
              type="button"
              className="canva-vip-pill active"
              onClick={() => {
                consoleAudio.play('soft');
                setIsVipMenuOpen(true);
              }}
              title="Lihat status keanggotaan VIP"
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>{t('vip_active', { name: premiumUserName || 'Aktif' })}</span>
            </button>
          ) : (
            <button
              type="button"
              className="canva-vip-pill"
              onClick={() => {
                consoleAudio.play('chime');
                setIsUnlockModalOpen(true);
              }}
              title="Buka seluruh koleksi bunga VIP"
            >
              <Crown size={13} className="text-amber-500" />
              <span>{t('vip_unlock')}</span>
            </button>
          )}

          {/* Next / Proceed Button */}
          {design.currentStep < 5 && (
            <button
              type="button"
              className="canva-next-btn"
              onClick={handleNextStep}
              title="Lanjut ke langkah berikutnya"
            >
              <span>{t('next')}</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </header>

      {/* ── 2. WORKSPACE AREA (LEFT RAIL + MAIN CANVAS + RIGHT DRAWER) ── */}
      <div className="canva-workspace">
        {/* Left Rail & Flyout Panel */}
        <CanvaLeftRail
          currentStep={design.currentStep}
          onStepClick={(step) => setStep(step)}
          onOpenGarden={() => setIsGardenModalOpen(true)}
          onBackToDashboard={onBackToDashboard}
          isSidebarExpanded={isSidebarExpanded}
          onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
          stepTitle={stepTitles[design.currentStep]}
          stepContent={renderStep()}
        />

        {/* Center Canvas Hero Stage */}
        <main className="canva-main-stage">
          {/* Contextual Top Toolbar (Canva-style) */}
          <CanvaTopToolbar
            onToggleAnalyzer={() => setIsAnalyzerOpen(!isAnalyzerOpen)}
            isAnalyzerOpen={isAnalyzerOpen}
            score={metrics.totalScore}
            isSidebarExpanded={isSidebarExpanded}
            onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
          />

          {/* Canvas Viewport Centered */}
          <div className="canva-canvas-viewport">
            <CanvaAtmosphereBackdrop />
            <div className="canva-canvas-frame">
              <PreviewCanvas canvasRef={canvasRef} />
            </div>
          </div>

          {/* Final Status Footer (if final) */}
          {isFinalOrStep5 && (
            <div className="canva-final-banner">
              <div className="canva-banner-left">
                <span className="canva-dot-emerald pulse" />
                <span className="canva-banner-text">
                  {t('preview_final_badge')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  consoleAudio.play('soft');
                  resetToEdit2D();
                }}
                className="canva-banner-edit-btn"
              >
                <Edit3 size={13} />
                <span>{t('edit_again')}</span>
              </button>
            </div>
          )}
        </main>

        {/* Right Drawer: Aesthetic Analyzer & VIP Info */}
        <CanvaAnalyzerDrawer
          isOpen={isAnalyzerOpen}
          onClose={() => setIsAnalyzerOpen(false)}
          metrics={metrics}
          onOpenVipModal={() => setIsUnlockModalOpen(true)}
          onOpenVipCard={() => setIsVipMenuOpen(true)}
        />
      </div>

      {/* ── MODALS ── */}
      <FlowerCountModal
        isOpen={isCountModalOpen}
        initialCount={design.targetFlowerCount || 25}
        onConfirm={handleConfirmFlowerCount}
        onClose={() => setIsCountModalOpen(false)}
        canDismiss={Boolean(design.targetFlowerCount)}
      />

      <PremiumUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
      />

      <VipCardModal
        isOpen={isVipMenuOpen}
        onClose={() => setIsVipMenuOpen(false)}
        userName={premiumUserName || ''}
        onRevoke={revokePremium}
      />

      <FlowerGardenModal
        isOpen={isGardenModalOpen}
        onClose={() => setIsGardenModalOpen(false)}
        onOpenVipModal={() => setIsUnlockModalOpen(true)}
      />

      <FlowerLimitModal
        isOpen={isFlowerLimitModalOpen}
        onClose={() => setIsFlowerLimitModalOpen(false)}
        onOpenCountModal={() => {
          setIsFlowerLimitModalOpen(false);
          setIsCountModalOpen(true);
        }}
        currentCount={design.selectedFlowers.length}
        maxLimit={design.targetFlowerCount || 25}
      />
    </div>
  );
}
