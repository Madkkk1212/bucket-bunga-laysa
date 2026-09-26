'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Flower2,
  Package,
  Mail,
  Palette,
  Share2,
  Home,
  Trash2,
  RotateCw,
  Layers,
  ZoomIn,
  ZoomOut,
  Crown,
  ChevronRight,
  Download,
  Undo2,
  ArrowUp,
  Minus,
  Plus,
} from 'lucide-react';
import { useDesign } from '@/context/DesignContext';
import PreviewCanvas from './PreviewCanvas';
import MobileFlowerPickerModal from '../home/mobile/MobileFlowerPickerModal';
import MobileBucketPickerModal from '../home/mobile/MobileBucketPickerModal';
import MobileCardEditorModal from '../home/mobile/MobileCardEditorModal';
import MobileThemePickerModal from '../home/mobile/MobileThemePickerModal';
import MobileShareModal from '../home/mobile/MobileShareModal';
import PremiumUnlockModal from './PremiumUnlockModal';
import VipCardModal from './VipCardModal';
import '@/components/home/mobile/mobile-dashboard.css';

interface MobileStudioViewProps {
  onBack: () => void;
}

// ─── 5 TAHAPAN DESAIN ───────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Buket',   color: '#E11D48', shortLabel: 'Buket'   },
  { id: 2, label: 'Bunga',   color: '#4F46E5', shortLabel: 'Bunga'   },
  { id: 3, label: 'Kartu',   color: '#D97706', shortLabel: 'Kartu'   },
  { id: 4, label: 'Suasana', color: '#C026D3', shortLabel: 'Suasana' },
  { id: 5, label: 'Unduh',   color: '#059669', shortLabel: 'Unduh'   },
] as const;

const NEXT_LABEL: Record<number, string> = {
  1: 'Lanjut: Pilih & Rangkai Bunga',
  2: 'Lanjut: Tulis Kartu Ucapan',
  3: 'Lanjut: Pratinjau Suasana',
  4: 'Lanjut: Unduh Buket HD',
  5: 'Selesai & Bagikan',
};

export default function MobileStudioView({ onBack }: MobileStudioViewProps) {
  const {
    design,
    randomizeFlowers,
    selectedFlowerUid,
    setSelectedFlowerUid,
    updateFlower,
    removeFlowerByUid,
    toggleFlowerLayer,
    setBouquetScale,
    isPremiumUnlocked,
    premiumUserName,
    revokePremium,
    undo,
    canUndo,
    changeFlowerLayer,
  } = useDesign();

  const [mobileStep, setMobileStep] = useState(1);
  const [hasMounted, setHasMounted] = useState(false);

  const [isFlowerPickerOpen, setIsFlowerPickerOpen] = useState(false);
  const [isBucketPickerOpen, setIsBucketPickerOpen] = useState(false);
  const [isCardEditorOpen, setIsCardEditorOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isVipCardOpen, setIsVipCardOpen] = useState(false);

  useEffect(() => { setHasMounted(true); }, []);

  const flowerCount = design.selectedFlowers.length;
  const targetCount = design.targetFlowerCount ?? 25;
  const selectedFlower = design.selectedFlowers.find((f) => f.uid === selectedFlowerUid);
  const currentScale = design.bouquetScale ?? 1.0;

  // Current layer of selected flower
  const selectedFlowerLayer = selectedFlower
    ? (selectedFlower.layer ?? (design.flowerPlacementMode ?? 'front'))
    : null;

  const handleRotateSelected = () => {
    if (!selectedFlower) return;
    updateFlower(selectedFlower.uid, { rotation: ((selectedFlower.rotation || 0) + 15) % 360 });
  };

  const handleScaleSelected = (delta: number) => {
    if (!selectedFlower) return;
    const current = selectedFlower.scale || 1;
    updateFlower(selectedFlower.uid, { scale: Math.max(0.3, Math.min(2.5, current + delta)) });
  };

  const handleBucketScale = (delta: number) => {
    const next = Math.max(0.4, Math.min(2.0, currentScale + delta));
    setBouquetScale(Math.round(next * 20) / 20); // snap to 0.05 steps
  };

  const openStepModal = (step: number) => {
    switch (step) {
      case 1: setIsBucketPickerOpen(true); break;
      case 2: setIsFlowerPickerOpen(true); break;
      case 3: setIsCardEditorOpen(true); break;
      case 4: setIsThemePickerOpen(true); break;
      case 5: setIsShareModalOpen(true); break;
    }
  };

  const handleStepClick = (step: number) => {
    setMobileStep(step);
    openStepModal(step);
  };

  const handleNextStep = () => {
    if (mobileStep < 5) {
      const next = mobileStep + 1;
      setMobileStep(next);
      openStepModal(next);
    } else {
      setIsShareModalOpen(true);
    }
  };

  return (
    <div className="ms-studio-root">
      {/* ─── 1. TOP HEADER BAR ─── */}
      <header className="ms-studio-topbar">
        <button
          type="button"
          onClick={onBack}
          className="ms-studio-back-btn"
          title="Kembali ke Dashboard"
        >
          <ArrowLeft size={15} />
          <span>Menu</span>
        </button>

        <div className="ms-studio-title-box">
          <span className="ms-studio-title">Studio Rangkai</span>
          <span className="ms-studio-badge">
            {flowerCount} / {targetCount} Bunga
          </span>
        </div>

        <div className="ms-studio-right-actions">
          {/* VIP Badge / Unlock */}
          {hasMounted && (
            isPremiumUnlocked ? (
              <button
                type="button"
                className="ms-studio-vip-badge"
                onClick={() => setIsVipCardOpen(true)}
                title="Status VIP Aktif"
              >
                <Crown size={12} />
                <span>{premiumUserName ? premiumUserName.split(' ')[0] : 'VIP'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="ms-studio-vip-unlock-btn"
                onClick={() => setIsUnlockModalOpen(true)}
                title="Buka Kunci VIP"
              >
                <Crown size={14} style={{ color: '#F59E0B' }} />
              </button>
            )
          )}

          {/* Undo */}
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="ms-studio-btn-icon"
            title="Batalkan Aksi Terakhir"
            style={{ opacity: canUndo ? 1 : 0.35 }}
          >
            <Undo2 size={16} />
          </button>

          {/* Randomize */}
          <button
            type="button"
            onClick={randomizeFlowers}
            className="ms-studio-btn-icon"
            title="Acak Bunga"
          >
            <Sparkles size={16} style={{ color: '#D97706' }} />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="ms-studio-btn-icon"
            style={{ background: '#4F46E5', color: '#FFFFFF', borderColor: '#4F46E5' }}
            title="Unduh / Bagikan"
          >
            <Share2 size={15} />
          </button>
        </div>
      </header>

      {/* ─── 2. STEP INDICATOR ─── */}
      <div className="ms-step-strip">
        {STEPS.map((step, i) => {
          const isDone = mobileStep > step.id;
          const isActive = mobileStep === step.id;
          return (
            <div key={step.id} className="ms-step-segment">
              <button
                type="button"
                className={`ms-step-item ${isActive ? 'ms-step-active' : ''} ${isDone ? 'ms-step-done' : ''}`}
                onClick={() => handleStepClick(step.id)}
                style={{ '--step-color': step.color } as React.CSSProperties}
              >
                <div className="ms-step-circle">
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span className="ms-step-label">{step.shortLabel}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`ms-step-connector ${isDone ? 'ms-step-connector-done' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ─── 3. CANVAS + CONTROLS ─── */}
      <div className="ms-studio-canvas-container">

        {/* Canvas */}
        <div className="ms-studio-canvas-box">
          <PreviewCanvas />
        </div>

        {/* Gesture tip */}
        <div className="ms-studio-tips">
          <Sparkles size={13} style={{ color: '#6366F1', flexShrink: 0 }} />
          <span>
            {mobileStep === 1 && 'Pilih model buket favoritmu untuk memulai'}
            {mobileStep === 2 && 'Sentuh & geser bunga untuk atur posisi. Ketuk bunga untuk kontrol.'}
            {mobileStep === 3 && 'Tulis pesan kartu ucapan yang spesial'}
            {mobileStep === 4 && 'Pilih suasana & latar belakang yang sesuai'}
            {mobileStep === 5 && 'Unduh dalam kualitas HD atau bagikan via WhatsApp'}
          </span>
        </div>

        {/* ─── BUCKET SCALE CONTROLS ─── */}
        <div className="ms-bucket-scale-dock">
          <span className="ms-dock-section-label">
            <Package size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Ukuran Buket
          </span>
          <div className="ms-dock-scale-row">
            <button
              type="button"
              onClick={() => handleBucketScale(-0.1)}
              disabled={currentScale <= 0.4}
              className="ms-dock-scale-btn"
              title="Perkecil Buket"
            >
              <Minus size={14} />
            </button>
            <span className="ms-dock-scale-value">{Math.round(currentScale * 100)}%</span>
            <button
              type="button"
              onClick={() => handleBucketScale(0.1)}
              disabled={currentScale >= 2.0}
              className="ms-dock-scale-btn"
              title="Perbesar Buket"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* ─── SELECTED FLOWER CONTROLS ─── */}
        {selectedFlower && (
          <div className="ms-flower-dock">
            {/* Layer Toggle — front/behind bucket */}
            <button
              type="button"
              onClick={() => toggleFlowerLayer(selectedFlower.uid)}
              className={`ms-dock-btn ${selectedFlowerLayer === 'front' ? 'ms-dock-btn-active-front' : 'ms-dock-btn-active-inside'}`}
              title={selectedFlowerLayer === 'front' ? 'Posisi: Di Depan Buket (ketuk untuk ke Dalam)' : 'Posisi: Di Dalam Buket (ketuk untuk ke Depan)'}
            >
              <Layers size={14} />
              <span>{selectedFlowerLayer === 'front' ? 'Depan' : 'Dalam'}</span>
            </button>

            {/* Z-order: move flower forward in stack */}
            <button
              type="button"
              onClick={() => changeFlowerLayer(selectedFlower.uid, 'up')}
              className="ms-dock-btn"
              title="Naikkan Urutan Lapisan"
            >
              <ArrowUp size={14} />
              <span>Naik</span>
            </button>

            {/* Rotate */}
            <button
              type="button"
              onClick={handleRotateSelected}
              className="ms-dock-btn"
              title="Putar 15°"
            >
              <RotateCw size={14} />
              <span>Putar</span>
            </button>

            {/* Scale up */}
            <button
              type="button"
              onClick={() => handleScaleSelected(0.1)}
              className="ms-dock-btn"
              title="Perbesar Bunga"
            >
              <ZoomIn size={14} />
              <span>Besar</span>
            </button>

            {/* Scale down */}
            <button
              type="button"
              onClick={() => handleScaleSelected(-0.1)}
              className="ms-dock-btn"
              title="Perkecil Bunga"
            >
              <ZoomOut size={14} />
              <span>Kecil</span>
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => {
                removeFlowerByUid(selectedFlower.uid);
                setSelectedFlowerUid(null);
              }}
              className="ms-dock-btn ms-dock-btn-delete"
              title="Hapus Bunga Ini"
            >
              <Trash2 size={14} />
              <span>Hapus</span>
            </button>
          </div>
        )}

        {/* ─── QUICK LAUNCHER TABS (4 tools) ─── */}
        <div className="ms-studio-launchers">
          <button
            type="button"
            onClick={() => handleStepClick(1)}
            className={`ms-launcher-btn ${mobileStep === 1 ? 'ms-launcher-btn-active' : ''}`}
          >
            <div className="ms-launcher-icon-box" style={{ background: '#FFF1F2', color: '#E11D48' }}>
              <Package size={19} />
            </div>
            <span className="ms-launcher-label">Buket</span>
          </button>

          <button
            type="button"
            onClick={() => handleStepClick(2)}
            className={`ms-launcher-btn ${mobileStep === 2 ? 'ms-launcher-btn-active' : ''}`}
          >
            <div className="ms-launcher-icon-box" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
              <Flower2 size={19} />
            </div>
            <span className="ms-launcher-label">Bunga</span>
          </button>

          <button
            type="button"
            onClick={() => handleStepClick(3)}
            className={`ms-launcher-btn ${mobileStep === 3 ? 'ms-launcher-btn-active' : ''}`}
          >
            <div className="ms-launcher-icon-box" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <Mail size={19} />
            </div>
            <span className="ms-launcher-label">Kartu</span>
          </button>

          <button
            type="button"
            onClick={() => handleStepClick(4)}
            className={`ms-launcher-btn ${mobileStep === 4 ? 'ms-launcher-btn-active' : ''}`}
          >
            <div className="ms-launcher-icon-box" style={{ background: '#FDF4FF', color: '#C026D3' }}>
              <Palette size={19} />
            </div>
            <span className="ms-launcher-label">Suasana</span>
          </button>
        </div>

        {/* ─── NEXT STEP BUTTON ─── */}
        <button
          type="button"
          className="ms-next-step-btn"
          onClick={handleNextStep}
        >
          <span>{NEXT_LABEL[mobileStep]}</span>
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* ─── BOTTOM NAV ─── */}
      <nav aria-label="Navigasi Studio Mobile" className="mb-bottom-nav">
        <div className="mb-nav-container">
          <button type="button" onClick={onBack} className="mb-nav-btn" aria-label="Menu Utama">
            <Home size={22} strokeWidth={2.2} />
          </button>

          <button type="button" className="mb-nav-btn active" aria-label="Studio Aktif">
            <div className="mb-nav-indicator" />
            <span className="mb-nav-badge">{flowerCount}</span>
            <Sparkles size={22} strokeWidth={2.5} />
          </button>

          <button type="button" onClick={() => setIsFlowerPickerOpen(true)} className="mb-nav-btn" aria-label="Bunga">
            <Flower2 size={22} />
          </button>

          <button type="button" onClick={undo} disabled={!canUndo} className="mb-nav-btn" aria-label="Undo" style={{ opacity: canUndo ? 1 : 0.35 }}>
            <Undo2 size={22} />
          </button>

          <button type="button" onClick={() => setIsShareModalOpen(true)} className="mb-nav-btn" aria-label="Unduh">
            <Download size={22} />
          </button>
        </div>
      </nav>

      {/* ─── MODALS ─── */}
      <MobileFlowerPickerModal isOpen={isFlowerPickerOpen} onClose={() => setIsFlowerPickerOpen(false)} />
      <MobileBucketPickerModal isOpen={isBucketPickerOpen} onClose={() => setIsBucketPickerOpen(false)} />
      <MobileCardEditorModal isOpen={isCardEditorOpen} onClose={() => setIsCardEditorOpen(false)} />
      <MobileThemePickerModal isOpen={isThemePickerOpen} onClose={() => setIsThemePickerOpen(false)} />
      <MobileShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      <PremiumUnlockModal isOpen={isUnlockModalOpen} onClose={() => setIsUnlockModalOpen(false)} />
      {isPremiumUnlocked && (
        <VipCardModal
          isOpen={isVipCardOpen}
          onClose={() => setIsVipCardOpen(false)}
          userName={premiumUserName || ''}
          onRevoke={() => { revokePremium?.(); setIsVipCardOpen(false); }}
        />
      )}
    </div>
  );
}
