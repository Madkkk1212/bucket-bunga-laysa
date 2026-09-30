'use client';

import { useState, useEffect, useRef } from 'react';
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
  RotateCcw,
  Layers,
  Crown,
  ChevronRight,
  ChevronLeft,
  Download,
  Undo2,
  ArrowUp,
  ArrowDown,
  Move,
  X,
  Maximize2,
  Minimize2,
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
import FlowerGardenModal from '../garden/FlowerGardenModal';
import { CANVAS_RATIO_DIMENSIONS } from '@/utils/canvasUtils';
import { CanvasRatio } from '@/types/design';
import { FLOWERS } from '@/data/flowers';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';
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

const RATIO_ASPECT_MAP: Record<CanvasRatio, string> = {
  '1:1': '1 / 1',
  '9:16': '9 / 16',
  '4:5': '4 / 5',
  '3:4': '3 / 4',
};

export default function MobileStudioView({ onBack }: MobileStudioViewProps) {
  const { t, isEn } = useLanguage();
  const {
    design,
    randomizeFlowers,
    selectedFlowerUid,
    setSelectedFlowerUid,
    isBucketSelected,
    setIsBucketSelected,
    updateFlower,
    removeFlowerByUid,
    toggleFlowerLayer,
    setBouquetScale,
    setBouquetRotation,
    isPremiumUnlocked,
    premiumUserName,
    revokePremium,
    undo,
    canUndo,
    changeFlowerLayer,
    nudgeFlower,
    setCanvasRatio,
  } = useDesign();

  const [mobileStep, setMobileStep] = useState(1);
  const [hasMounted, setHasMounted] = useState(false);
  const [nudgeStep, setNudgeStep] = useState<number>(10); // 5px or 15px step for D-pad
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seqScrollRef = useRef<HTMLDivElement>(null);

  const [isFlowerPickerOpen, setIsFlowerPickerOpen] = useState(false);
  const [isBucketPickerOpen, setIsBucketPickerOpen] = useState(false);
  const [isCardEditorOpen, setIsCardEditorOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isVipCardOpen, setIsVipCardOpen] = useState(false);
  const [isGardenModalOpen, setIsGardenModalOpen] = useState(false);

  useEffect(() => { setHasMounted(true); }, []);

  const flowerCount = design.selectedFlowers.length;
  const targetCount = design.targetFlowerCount ?? 25;
  const selectedIndex = design.selectedFlowers.findIndex((f) => f.uid === selectedFlowerUid);
  const selectedFlower = selectedIndex !== -1 ? design.selectedFlowers[selectedIndex] : null;
  const currentScale = design.bouquetScale ?? 1.0;
  const currentRotation = design.bouquetRotation ?? 0;
  const currentRatio = design.canvasRatio ?? '1:1';

  // Scroll active flower chip into center view when selection changes
  useEffect(() => {
    if (selectedFlowerUid && seqScrollRef.current) {
      const chipEl = document.getElementById(`seq-chip-${selectedFlowerUid}`);
      if (chipEl) {
        chipEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedFlowerUid]);

  // Current layer of selected flower
  const selectedFlowerLayer = selectedFlower
    ? (selectedFlower.layer ?? (design.flowerPlacementMode ?? 'front'))
    : null;

  const getFlowerName = (flowerId: string) =>
    FLOWERS.find((f) => f.id === flowerId)?.name ?? flowerId;

  const getFlowerEmoji = (flowerId: string) =>
    FLOWERS.find((f) => f.id === flowerId)?.emoji ?? '🌸';

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

  const handleBucketRotate = (delta: number) => {
    const next = (currentRotation + delta + 360) % 360;
    setBouquetRotation(next);
  };

  // Previous & Next flower navigation
  const handleSelectPrevFlower = () => {
    if (flowerCount === 0) return;
    if (selectedIndex <= 0) {
      setSelectedFlowerUid(design.selectedFlowers[flowerCount - 1].uid);
    } else {
      setSelectedFlowerUid(design.selectedFlowers[selectedIndex - 1].uid);
    }
  };

  const handleSelectNextFlower = () => {
    if (flowerCount === 0) return;
    if (selectedIndex === -1 || selectedIndex >= flowerCount - 1) {
      setSelectedFlowerUid(design.selectedFlowers[0].uid);
    } else {
      setSelectedFlowerUid(design.selectedFlowers[selectedIndex + 1].uid);
    }
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
          title={isEn ? 'Back to Dashboard' : 'Kembali ke Dashboard'}
        >
          <ArrowLeft size={15} />
          <span>{t('menu')}</span>
        </button>

        <div className="ms-studio-title-box">
          <span className="ms-studio-title">{t('ms_studio_title')}</span>
          <span className="ms-studio-badge">
            {flowerCount} / {targetCount} {t('flowers_unit')}
          </span>
        </div>

        <div className="ms-studio-right-actions">
          {/* Language Switcher Compact */}
          <LanguageSwitcher variant="compact" />

          {/* VIP Badge / Unlock */}
          {hasMounted && (
            isPremiumUnlocked ? (
              <button
                type="button"
                className="ms-studio-vip-badge"
                onClick={() => setIsVipCardOpen(true)}
                title={isEn ? 'VIP Status Active' : 'Status VIP Aktif'}
              >
                <Crown size={12} />
                <span>{premiumUserName ? premiumUserName.split(' ')[0] : 'VIP'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="ms-studio-vip-unlock-btn"
                onClick={() => setIsUnlockModalOpen(true)}
                title={isEn ? 'Unlock VIP' : 'Buka Kunci VIP'}
              >
                <Crown size={14} style={{ color: '#F59E0B' }} />
              </button>
            )
          )}

          {/* Kebun Bunga Streak */}
          <button
            type="button"
            className="ms-studio-btn-icon"
            onClick={() => setIsGardenModalOpen(true)}
            title={isEn ? 'Daily Flower Garden (Fire Streak 🔥)' : 'Kebun Bunga Harian (Api Streak 🔥)'}
            style={{ background: '#FFF7ED', borderColor: '#FED7AA', color: '#EA580C' }}
          >
            <span style={{ fontSize: '13px', lineHeight: 1 }}>🌱</span>
          </button>

          {/* Undo */}
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="ms-studio-btn-icon"
            title={
              canUndo
                ? (isEn ? 'Undo Last Action' : 'Batalkan Aksi Terakhir (Undo)')
                : (isEn ? 'No undo history' : 'Tidak ada riwayat undo')
            }
            style={{
              opacity: canUndo ? 1 : 0.35,
              background: canUndo ? '#EEF2FF' : undefined,
              borderColor: canUndo ? '#A5B4FC' : undefined,
              color: canUndo ? '#4F46E5' : undefined,
            }}
          >
            <Undo2 size={16} />
          </button>

          {/* Randomize */}
          <button
            type="button"
            onClick={randomizeFlowers}
            className="ms-studio-btn-icon"
            title={isEn ? 'Shuffle Flowers' : 'Acak Bunga'}
          >
            <Sparkles size={16} style={{ color: '#D97706' }} />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="ms-studio-btn-icon"
            style={{ background: '#4F46E5', color: '#FFFFFF', borderColor: '#4F46E5' }}
            title={isEn ? 'Download / Share' : 'Unduh / Bagikan'}
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
          const localizedShortLabel =
            step.id === 1
              ? t('step_1_short')
              : step.id === 2
              ? t('step_2_short')
              : step.id === 3
              ? t('step_3_short')
              : step.id === 4
              ? t('step_4_short')
              : t('step_5_short');

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
                <span className="ms-step-label">{localizedShortLabel}</span>
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

        {/* ─── FITUR UKURAN / RASIO KANVAS ─── */}
        <div className="ms-ratio-bar">
          {(['1:1', '9:16', '4:5', '3:4'] as CanvasRatio[]).map((r) => {
            const isSelected = currentRatio === r;
            const info = CANVAS_RATIO_DIMENSIONS[r];
            return (
              <button
                key={r}
                type="button"
                className={`ms-ratio-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setCanvasRatio(r)}
                title={`${info.label} (${info.width}×${info.height}px)`}
              >
                <span>{info.icon}</span>
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>

        {/* Canvas Box (Adapts to Aspect Ratio) */}
        <div
          className="ms-studio-canvas-box"
          style={{
            aspectRatio: RATIO_ASPECT_MAP[currentRatio] || '1 / 1',
            maxHeight: currentRatio === '9:16' ? '60vh' : '52vh',
          }}
        >
          <PreviewCanvas canvasRef={canvasRef} />
        </div>

        {/* Gesture tip */}
        <div className="ms-studio-tips">
          <Sparkles size={13} style={{ color: '#6366F1', flexShrink: 0 }} />
          <span>
            {mobileStep === 1 && t('ms_tip_1')}
            {mobileStep === 2 && t('ms_tip_2')}
            {mobileStep === 3 && t('ms_tip_3')}
            {mobileStep === 4 && t('ms_tip_4')}
            {mobileStep === 5 && t('ms_tip_5')}
          </span>
        </div>

        {/* ─── FITUR MENU BUNGA KEBERAPA (DAFTAR BUNGA TERANGKAI) ─── */}
        {flowerCount > 0 && (
          <div className="ms-sequence-wrapper">
            <div className="ms-sequence-header">
              <span className="ms-sequence-title">
                <Flower2 size={13} style={{ color: '#4F46E5' }} />
                <span>
                  {selectedFlower
                    ? t('ms_seq_title_selected', { current: selectedIndex + 1, total: flowerCount })
                    : t('ms_seq_title_all', { count: flowerCount })}
                </span>
              </span>
              <div className="ms-sequence-nav">
                <button
                  type="button"
                  onClick={handleSelectPrevFlower}
                  className="ms-seq-nav-btn"
                  title={t('ms_prev_flower')}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleSelectNextFlower}
                  className="ms-seq-nav-btn"
                  title={t('ms_next_flower')}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="ms-sequence-scroll" ref={seqScrollRef}>
              {design.selectedFlowers.map((f, idx) => {
                const isSelected = selectedFlowerUid === f.uid;
                const name = getFlowerName(f.flowerId);
                const emoji = getFlowerEmoji(f.flowerId);
                const layer = f.layer ?? (design.flowerPlacementMode ?? 'front');

                return (
                  <button
                    key={f.uid}
                    id={`seq-chip-${f.uid}`}
                    type="button"
                    className={`ms-seq-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFlowerUid(null); // deselect
                      } else {
                        setSelectedFlowerUid(f.uid);
                      }
                    }}
                    title={`Pilih Bunga #${idx + 1} ${name}`}
                  >
                    <span className="ms-seq-num">#{idx + 1}</span>
                    <span>{emoji}</span>
                    <span>{name.split(' ')[0]}</span>
                    <span className={`ms-seq-layer-tag ${layer === 'front' ? 'ms-seq-tag-front' : 'ms-seq-tag-inside'}`}>
                      {layer === 'front' ? t('ms_tag_front') : t('ms_tag_inside')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── KONTROL BUNGA TERPILIH + D-PAD TOUCHSCREEN GESER PRESISI ─── */}
        {selectedFlower && (
          <div className="ms-dpad-dock">
            <div className="ms-dpad-header">
              <span className="ms-dpad-title">
                <Move size={13} />
                <span>
                  {isEn ? 'Flower' : 'Bunga'} #{selectedIndex + 1} ({getFlowerName(selectedFlower.flowerId)})
                </span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setNudgeStep(nudgeStep === 5 ? 15 : 5)}
                  className="ms-dpad-step-btn"
                  title={isEn ? 'Change nudge sensitivity (5px / 15px)' : 'Ubah sensitivitas geser (5px / 15px)'}
                >
                  {t('ms_nudge_step', { step: nudgeStep })}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFlowerUid(null)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                  title={t('ms_close_selection')}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* ── LAYOUT BARU: D-PAD + SCALE ROW + ACTION ROW ── */}

            {/* Baris 1: D-PAD geser presisi */}
            <div className="ms-dpad-layout">
              <div className="ms-dpad-cross">
                <div />
                <button
                  type="button"
                  onClick={() => nudgeFlower(selectedFlower.uid, 0, -nudgeStep)}
                  className="ms-dpad-btn"
                  title={isEn ? 'Nudge Up' : 'Geser ke Atas'}
                >
                  <ArrowUp size={16} />
                </button>
                <div />

                <button
                  type="button"
                  onClick={() => nudgeFlower(selectedFlower.uid, -nudgeStep, 0)}
                  className="ms-dpad-btn"
                  title={isEn ? 'Nudge Left' : 'Geser ke Kiri'}
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="ms-dpad-center">
                  <Move size={13} style={{ color: '#D97706' }} />
                </div>
                <button
                  type="button"
                  onClick={() => nudgeFlower(selectedFlower.uid, nudgeStep, 0)}
                  className="ms-dpad-btn"
                  title={isEn ? 'Nudge Right' : 'Geser ke Kanan'}
                >
                  <ChevronRight size={17} />
                </button>

                <div />
                <button
                  type="button"
                  onClick={() => nudgeFlower(selectedFlower.uid, 0, nudgeStep)}
                  className="ms-dpad-btn"
                  title={isEn ? 'Nudge Down' : 'Geser ke Bawah'}
                >
                  <ArrowDown size={16} />
                </button>
                <div />
              </div>

              {/* RIGHT COLUMN: Scale + Rotate + Layer + Delete */}
              <div className="ms-flower-action-col">
                {/* Baris Ukuran */}
                <div className="ms-flower-scale-row">
                  <button
                    type="button"
                    onClick={() => handleScaleSelected(-0.15)}
                    className="ms-flower-scale-btn"
                    title={isEn ? 'Shrink Flower' : 'Perkecil Bunga'}
                  >
                    <Minimize2 size={17} />
                    <span>{t('ms_scale_small')}</span>
                  </button>
                  <span className="ms-flower-scale-val">
                    {Math.round((selectedFlower.scale ?? 1) * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => handleScaleSelected(0.15)}
                    className="ms-flower-scale-btn"
                    title={isEn ? 'Enlarge Flower' : 'Perbesar Bunga'}
                  >
                    <Maximize2 size={17} />
                    <span>{t('ms_scale_large')}</span>
                  </button>
                </div>

                {/* Baris Putar */}
                <div className="ms-flower-rotate-row">
                  <button
                    type="button"
                    onClick={() => updateFlower(selectedFlower.uid, { rotation: ((selectedFlower.rotation || 0) - 15 + 360) % 360 })}
                    className="ms-flower-rotate-btn"
                    title={isEn ? 'Rotate Left 15°' : 'Putar Kiri 15°'}
                  >
                    <RotateCcw size={17} />
                  </button>
                  <span className="ms-flower-rot-val">
                    {Math.round(selectedFlower.rotation ?? 0)}°
                  </span>
                  <button
                    type="button"
                    onClick={handleRotateSelected}
                    className="ms-flower-rotate-btn"
                    title={isEn ? 'Rotate Right 15°' : 'Putar Kanan 15°'}
                  >
                    <RotateCw size={17} />
                  </button>
                </div>

                {/* Baris Layer + Delete */}
                <div className="ms-flower-action-row">
                  <button
                    type="button"
                    onClick={() => toggleFlowerLayer(selectedFlower.uid)}
                    className={`ms-flower-action-btn ${selectedFlowerLayer === 'front' ? 'ms-flower-btn-front' : 'ms-flower-btn-inside'}`}
                    title={isEn ? 'Toggle Layer' : 'Ganti Lapisan'}
                  >
                    <Layers size={15} />
                    <span>
                      {selectedFlowerLayer === 'front'
                        ? (isEn ? 'Front' : 'Depan')
                        : (isEn ? 'Inside' : 'Dalam')}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeFlowerByUid(selectedFlower.uid);
                      setSelectedFlowerUid(null);
                    }}
                    className="ms-flower-action-btn ms-flower-btn-delete"
                    title={isEn ? 'Delete Flower' : 'Hapus Bunga'}
                  >
                    <Trash2 size={15} />
                    <span>{isEn ? 'Delete' : 'Hapus'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── BUCKET CONTROLS: SCALE + ROTATE ─── */}
        <div className={`ms-bucket-control-dock ${isBucketSelected ? 'ms-bucket-dock-selected' : ''}`}>
          <div className="ms-bucket-dock-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={13} style={{ color: '#E11D48' }} />
              <span>{isEn ? 'Bouquet Controls' : 'Kontrol Buket'}</span>
            </div>
            {isBucketSelected ? (
              <span className="ms-bucket-active-chip">
                {isEn ? '✨ Active on Canvas' : '✨ Aktif di Kanvas'}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsBucketSelected(true)}
                className="ms-bucket-select-btn"
                title={isEn ? 'Select bouquet on canvas to rotate & scale directly' : 'Pilih buket di kanvas untuk putar & atur ukuran langsung'}
              >
                {isEn ? 'Edit on Canvas 👆' : 'Atur di Kanvas 👆'}
              </button>
            )}
          </div>

          <div className="ms-bucket-control-grid">
            {/* SCALE COLUMN */}
            <div className="ms-bucket-ctrl-col">
              <span className="ms-bucket-ctrl-label">{isEn ? 'Scale' : 'Ukuran'}</span>
              <div className="ms-bucket-ctrl-row">
                <button
                  type="button"
                  onClick={() => handleBucketScale(-0.1)}
                  disabled={currentScale <= 0.4}
                  className="ms-bucket-ctrl-btn"
                  title={isEn ? 'Scale Down' : 'Perkecil Buket'}
                >
                  <Minimize2 size={18} />
                </button>
                <span className="ms-bucket-ctrl-val">{Math.round(currentScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => handleBucketScale(0.1)}
                  disabled={currentScale >= 2.0}
                  className="ms-bucket-ctrl-btn"
                  title={isEn ? 'Scale Up' : 'Perbesar Buket'}
                >
                  <Maximize2 size={18} />
                </button>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="ms-bucket-ctrl-divider" />

            {/* ROTATION COLUMN */}
            <div className="ms-bucket-ctrl-col">
              <span className="ms-bucket-ctrl-label">{isEn ? 'Rotation' : 'Rotasi'}</span>
              <div className="ms-bucket-ctrl-row">
                <button
                  type="button"
                  onClick={() => handleBucketRotate(-15)}
                  className="ms-bucket-ctrl-btn"
                  title={isEn ? 'Rotate Bouquet Left 15°' : 'Putar Buket Kiri 15°'}
                >
                  <RotateCcw size={18} />
                </button>
                <span className="ms-bucket-ctrl-val">{Math.round(currentRotation)}°</span>
                <button
                  type="button"
                  onClick={() => handleBucketRotate(15)}
                  className="ms-bucket-ctrl-btn"
                  title={isEn ? 'Rotate Bouquet Right 15°' : 'Putar Buket Kanan 15°'}
                >
                  <RotateCw size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="ms-bucket-touch-tip">
            {isEn ? (
              <>💡 <strong>Direct canvas control:</strong> Touch bouquet to drag, pull <strong>↻</strong> to rotate, or <strong>⤡</strong> to resize!</>
            ) : (
              <>💡 <strong>Bisa diatur langsung di kanvas:</strong> Sentuh buket untuk seret, tarik pin <strong>↻</strong> untuk putar, atau pin <strong>⤡</strong> untuk perbesar/kecil!</>
            )}
          </div>
        </div>

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
            <span className="ms-launcher-label">{t('step_1_short')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleStepClick(2)}
            className={`ms-launcher-btn ${mobileStep === 2 ? 'ms-launcher-btn-active' : ''}`}
          >
            <div className="ms-launcher-icon-box" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
              <Flower2 size={19} />
            </div>
            <span className="ms-launcher-label">{t('step_2_short')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleStepClick(3)}
            className={`ms-launcher-btn ${mobileStep === 3 ? 'ms-launcher-btn-active' : ''}`}
          >
            <div className="ms-launcher-icon-box" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <Mail size={19} />
            </div>
            <span className="ms-launcher-label">{t('step_3_short')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleStepClick(4)}
            className={`ms-launcher-btn ${mobileStep === 4 ? 'ms-launcher-btn-active' : ''}`}
          >
            <div className="ms-launcher-icon-box" style={{ background: '#FDF4FF', color: '#C026D3' }}>
              <Palette size={19} />
            </div>
            <span className="ms-launcher-label">{t('step_4_short')}</span>
          </button>
        </div>

        {/* ─── NEXT STEP BUTTON ─── */}
        <button
          type="button"
          className="ms-next-step-btn"
          onClick={handleNextStep}
        >
          <span>
            {mobileStep === 1 && t('ms_next_step_1')}
            {mobileStep === 2 && t('ms_next_step_2')}
            {mobileStep === 3 && t('ms_next_step_3')}
            {mobileStep === 4 && t('ms_next_step_4')}
            {mobileStep === 5 && t('ms_next_step_5')}
          </span>
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* ─── BOTTOM NAV ─── */}
      <nav aria-label={isEn ? 'Mobile Studio Navigation' : 'Navigasi Studio Mobile'} className="mb-bottom-nav">
        <div className="mb-nav-container">
          <button type="button" onClick={onBack} className="mb-nav-btn" aria-label={isEn ? 'Main Menu' : 'Menu Utama'}>
            <Home size={22} strokeWidth={2.2} />
          </button>

          <button type="button" className="mb-nav-btn active" aria-label={isEn ? 'Studio Active' : 'Studio Aktif'}>
            <div className="mb-nav-indicator" />
            <span className="mb-nav-badge">{flowerCount}</span>
            <Sparkles size={22} strokeWidth={2.5} />
          </button>

          <button type="button" onClick={() => setIsFlowerPickerOpen(true)} className="mb-nav-btn" aria-label={isEn ? 'Flowers' : 'Bunga'}>
            <Flower2 size={22} />
          </button>

          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="mb-nav-btn"
            aria-label="Undo"
            style={{
              opacity: canUndo ? 1 : 0.35,
              color: canUndo ? '#4F46E5' : undefined,
            }}
          >
            <Undo2 size={22} />
          </button>

          <button type="button" onClick={() => setIsShareModalOpen(true)} className="mb-nav-btn" aria-label={isEn ? 'Download' : 'Unduh'}>
            <Download size={22} />
          </button>
        </div>
      </nav>

      {/* ─── MODALS ─── */}
      <MobileFlowerPickerModal isOpen={isFlowerPickerOpen} onClose={() => setIsFlowerPickerOpen(false)} />
      <MobileBucketPickerModal isOpen={isBucketPickerOpen} onClose={() => setIsBucketPickerOpen(false)} />
      <MobileCardEditorModal isOpen={isCardEditorOpen} onClose={() => setIsCardEditorOpen(false)} />
      <MobileThemePickerModal isOpen={isThemePickerOpen} onClose={() => setIsThemePickerOpen(false)} />
      <MobileShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        canvasRef={canvasRef}
      />
      <PremiumUnlockModal isOpen={isUnlockModalOpen} onClose={() => setIsUnlockModalOpen(false)} />
      <FlowerGardenModal
        isOpen={isGardenModalOpen}
        onClose={() => setIsGardenModalOpen(false)}
        onOpenVipModal={() => setIsUnlockModalOpen(true)}
      />
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
