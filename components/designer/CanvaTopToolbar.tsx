'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDesign } from '@/context/DesignContext';
import { FLOWERS } from '@/data/flowers';
import { consoleAudio } from '@/utils/consoleAudio';
import { generatePresetLayout, PresetFormationType } from '@/utils/bouquetConsolePresets';
import {
  Undo2,
  Redo2,
  Shuffle,
  Layers,
  Sparkles,
  Flower2,
  RotateCw,
  RotateCcw,
  Minus,
  Plus,
  ArrowUpToLine,
  ArrowDownToLine,
  Copy,
  Trash2,
  X,
  Compass,
  BarChart2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Move,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CanvaTopToolbarProps {
  onToggleAnalyzer: () => void;
  isAnalyzerOpen: boolean;
  score: number;
  isSidebarExpanded?: boolean;
  onToggleSidebar?: () => void;
}

export default function CanvaTopToolbar({
  onToggleAnalyzer,
  isAnalyzerOpen,
  score,
  isSidebarExpanded = true,
  onToggleSidebar,
}: CanvaTopToolbarProps) {
  const { t } = useLanguage();
  const {
    design,
    undo,
    canUndo,
    randomizeFlowers,
    applyFlowerFormation,
    setFlowerPlacementMode,
    selectedFlowerUid,
    setSelectedFlowerUid,
    updateFlower,
    changeFlowerLayer,
    duplicateFlower,
    removeFlowerByUid,
    nudgeFlower,
    isPremiumUnlocked,
    setStep,
  } = useDesign();

  const [hasMounted, setHasMounted] = useState(false);
  const [isNudgeOpen, setIsNudgeOpen] = useState(false);
  const [isFlowerMenuOpen, setIsFlowerMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [nudgePos, setNudgePos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const menuRef = useRef<HTMLDivElement>(null);
  const nudgeRef = useRef<HTMLDivElement>(null);
  const flowerBtnRef = useRef<HTMLButtonElement>(null);
  const nudgeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Click outside to close flower menu
  useEffect(() => {
    if (!isFlowerMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        flowerBtnRef.current &&
        !flowerBtnRef.current.contains(target)
      ) {
        setIsFlowerMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFlowerMenuOpen]);

  // Click outside to close nudge popover
  useEffect(() => {
    if (!isNudgeOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        nudgeRef.current &&
        !nudgeRef.current.contains(target) &&
        nudgeBtnRef.current &&
        !nudgeBtnRef.current.contains(target)
      ) {
        setIsNudgeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNudgeOpen]);

  const toggleFlowerMenu = () => {
    if (!isFlowerMenuOpen && flowerBtnRef.current) {
      const rect = flowerBtnRef.current.getBoundingClientRect();
      setMenuPos({
        top: Math.round(rect.bottom + 6),
        left: Math.max(12, Math.min(Math.round(rect.left), window.innerWidth - 280)),
      });
    }
    consoleAudio.play('soft');
    setIsFlowerMenuOpen((prev) => !prev);
  };

  const toggleNudge = () => {
    if (!isNudgeOpen && nudgeBtnRef.current) {
      const rect = nudgeBtnRef.current.getBoundingClientRect();
      setNudgePos({
        top: Math.round(rect.bottom + 6),
        left: Math.max(12, Math.min(Math.round(rect.left), window.innerWidth - 130)),
      });
    }
    consoleAudio.play('soft');
    setIsNudgeOpen((prev) => !prev);
  };

  const selectedFlower = design.selectedFlowers.find((f) => f.uid === selectedFlowerUid);
  const selectedDef = selectedFlower ? FLOWERS.find((f) => f.id === selectedFlower.flowerId) : null;

  // Preset Handler
  const handleApplyPreset = (type: PresetFormationType) => {
    consoleAudio.play('paper');
    const newFlowers = generatePresetLayout(
      type,
      design.selectedFlowers,
      design.targetFlowerCount || 25,
      isPremiumUnlocked
    );
    applyFlowerFormation(newFlowers);
  };

  // Rotation Handlers
  const handleRotate = (deltaDeg: number) => {
    if (!selectedFlower) return;
    consoleAudio.play('soft');
    const currentDeg =
      selectedFlower.customRotation ??
      Math.round((selectedFlower.rotation || 0) * (180 / Math.PI));
    const nextDeg = ((currentDeg + deltaDeg + 180) % 360) - 180;
    const rad = nextDeg * (Math.PI / 180);
    updateFlower(selectedFlower.uid, {
      rotation: rad,
      customRotation: nextDeg,
    });
  };

  // Scale Handlers
  const handleScale = (multiplier: number) => {
    if (!selectedFlower) return;
    consoleAudio.play('soft');
    const baseRadius = selectedFlower.radius || 60;
    const nextRadius = Math.max(35, Math.min(115, Math.round(baseRadius * multiplier)));
    updateFlower(selectedFlower.uid, {
      radius: nextRadius,
      scale: Number((nextRadius / 60).toFixed(2)),
    });
  };

  // Nudge Handler
  const handleNudge = (dx: number, dy: number) => {
    if (!selectedFlower) return;
    consoleAudio.play('dpad');
    nudgeFlower(selectedFlower.uid, dx, dy);
  };

  const currentDeg = selectedFlower
    ? selectedFlower.customRotation ??
      Math.round((selectedFlower.rotation || 0) * (180 / Math.PI))
    : 0;

  const currentScalePercent = selectedFlower
    ? Math.round(((selectedFlower.radius || 60) / 60) * 100)
    : 100;

  return (
    <div
      className="canva-context-toolbar"
      role="toolbar"
      aria-label="Toolbar Studio"
      onWheel={(e) => {
        if (e.deltaY !== 0) {
          e.currentTarget.scrollLeft += e.deltaY;
        }
      }}
    >
      {/* ── MODE 1: BUNGA TERPILIH (CONTEXTUAL FLOWER CONTROLS) ── */}
      {selectedFlower ? (
        <div className="canva-toolbar-row animate-fade-in">
          {/* Expand Sidebar Button if Collapsed */}
          {!isSidebarExpanded && onToggleSidebar && (
            <>
              <button
                type="button"
                className="canva-tool-btn canva-tool-btn-expand"
                onClick={() => {
                  consoleAudio.play('soft');
                  onToggleSidebar();
                }}
                title={t('open_panel')}
              >
                <ChevronRight size={14} />
                <span>{t('open_panel')}</span>
              </button>
              <div className="canva-toolbar-divider" />
            </>
          )}

          {/* Flower Indicator */}
          <div className="canva-selected-badge">
            <span className="canva-selected-badge-emoji">{selectedDef?.emoji || '🌸'}</span>
            <span className="canva-selected-badge-name">{selectedDef?.name || 'Bunga'}</span>
          </div>

          <div className="canva-toolbar-divider" />

          {/* Precision Nudge Toggle */}
          <div className="canva-nudge-wrapper">
            <button
              ref={nudgeBtnRef}
              type="button"
              className={`canva-tool-btn ${isNudgeOpen ? 'active' : ''}`}
              onClick={toggleNudge}
              title={t('nudge_title')}
            >
              <Move size={14} />
              <span>{t('nudge')}</span>
            </button>
          </div>

          {/* Rotation Controls */}
          <div className="canva-stepper-control">
            <button
              type="button"
              className="canva-stepper-btn"
              onClick={() => handleRotate(-15)}
              title="Putar -15°"
            >
              <RotateCcw size={13} />
            </button>
            <span className="canva-stepper-val">{currentDeg}°</span>
            <button
              type="button"
              className="canva-stepper-btn"
              onClick={() => handleRotate(15)}
              title="Putar +15°"
            >
              <RotateCw size={13} />
            </button>
          </div>

          {/* Scale Controls */}
          <div className="canva-stepper-control">
            <button
              type="button"
              className="canva-stepper-btn"
              onClick={() => handleScale(0.9)}
              title="Perkecil Ukuran"
            >
              <Minus size={13} />
            </button>
            <span className="canva-stepper-val">{currentScalePercent}%</span>
            <button
              type="button"
              className="canva-stepper-btn"
              onClick={() => handleScale(1.1)}
              title="Perbesar Ukuran"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="canva-toolbar-divider" />

          {/* Layer Controls */}
          <button
            type="button"
            className="canva-tool-btn"
            onClick={() => {
              consoleAudio.play('switch');
              changeFlowerLayer(selectedFlower.uid, 'up');
            }}
            title="Maju Satu Lapisan"
          >
            <ArrowUpToLine size={14} />
            <span>Maju</span>
          </button>

          <button
            type="button"
            className="canva-tool-btn"
            onClick={() => {
              consoleAudio.play('switch');
              changeFlowerLayer(selectedFlower.uid, 'down');
            }}
            title="Mundur Satu Lapisan"
          >
            <ArrowDownToLine size={14} />
            <span>Mundur</span>
          </button>

          {/* Duplicate */}
          <button
            type="button"
            className="canva-tool-btn"
            onClick={() => {
              consoleAudio.play('soft');
              duplicateFlower(selectedFlower.uid);
            }}
            title="Duplikat Bunga Ini"
          >
            <Copy size={14} />
            <span>Duplikat</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            className="canva-tool-btn canva-tool-btn-danger"
            onClick={() => {
              consoleAudio.play('snip');
              removeFlowerByUid(selectedFlower.uid);
            }}
            title="Hapus Bunga Ini"
          >
            <Trash2 size={14} />
            <span>Hapus</span>
          </button>

          {/* Deselect / Done */}
          <button
            type="button"
            className="canva-tool-btn canva-tool-btn-close"
            onClick={() => {
              consoleAudio.play('soft');
              setSelectedFlowerUid(null);
            }}
            title="Tutup Pilihan Bunga (Esc)"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        /* ── MODE 2: KANVAS DEFAULT (CLEAN CANVAS ACTIONS) ── */
        <div className="canva-toolbar-row">
          {/* Expand Sidebar Button if Collapsed */}
          {!isSidebarExpanded && onToggleSidebar && (
            <>
              <button
                type="button"
                className="canva-tool-btn canva-tool-btn-expand"
                onClick={() => {
                  consoleAudio.play('soft');
                  onToggleSidebar();
                }}
                title={t('open_panel')}
              >
                <ChevronRight size={14} />
                <span>{t('open_panel')}</span>
              </button>
              <div className="canva-toolbar-divider" />
            </>
          )}

          {/* Undo */}
          <button
            type="button"
            className="canva-tool-btn"
            disabled={!canUndo}
            onClick={() => {
              consoleAudio.play('soft');
              undo();
            }}
            title={t('undo_title')}
          >
            <Undo2 size={14} />
            <span>{t('undo')}</span>
          </button>

          <div className="canva-toolbar-divider" />

          {/* Preset Formations Pills */}
          <div className="canva-toolbar-group">
            <span className="canva-toolbar-label">
              <Compass size={13} />
              <span>{t('formation')}</span>
            </span>

            <button
              type="button"
              className="canva-preset-pill"
              onClick={() => handleApplyPreset('dome')}
              title={t('formation_dome_title')}
            >
              <span>{t('formation_dome')}</span>
            </button>

            <button
              type="button"
              className="canva-preset-pill"
              onClick={() => handleApplyPreset('fan')}
              title={t('formation_fan_title')}
            >
              <span>{t('formation_fan')}</span>
            </button>

            <button
              type="button"
              className="canva-preset-pill"
              onClick={() => handleApplyPreset('heart')}
              title={t('formation_heart_title')}
            >
              <span>{t('formation_heart')}</span>
            </button>

            <button
              type="button"
              className="canva-preset-pill"
              onClick={() => handleApplyPreset('minimalist')}
              title={t('formation_minimalist_title')}
            >
              <span>{t('formation_minimalist')}</span>
            </button>
          </div>

          <div className="canva-toolbar-divider" />

          {/* Placement Toggle: Di Dalam vs Di Depan Kantung */}
          <button
            type="button"
            className={`canva-tool-btn ${design.flowerPlacementMode === 'front' ? 'active-amber' : ''}`}
            onClick={() => {
              consoleAudio.play('switch');
              setFlowerPlacementMode(design.flowerPlacementMode === 'front' ? 'inside' : 'front');
            }}
            title={t('layer_toggle_title')}
          >
            <Layers size={13} />
            <span>{design.flowerPlacementMode === 'front' ? t('layer_front') : t('layer_inside')}</span>
          </button>

          {/* Randomize */}
          <button
            type="button"
            className="canva-tool-btn"
            onClick={() => {
              consoleAudio.play('paper');
              randomizeFlowers();
            }}
            title={t('randomize_title')}
          >
            <Shuffle size={13} />
            <span>{t('randomize')}</span>
          </button>

          {/* Menu Dropdown Pilih Bunga Terangkai */}
          {design.selectedFlowers.length > 0 && (
            <div className="canva-dropdown-wrapper">
              <div className="canva-toolbar-divider" />
              <button
                ref={flowerBtnRef}
                type="button"
                className={`canva-tool-btn ${isFlowerMenuOpen ? 'active' : ''}`}
                onClick={toggleFlowerMenu}
                title={t('arranged_flowers_title')}
              >
                <Flower2 size={13} style={{ color: '#ec4899' }} />
                <span>{t('flowers_unit')} ({design.selectedFlowers.length})</span>
                <ChevronDown
                  size={12}
                  style={{
                    transform: isFlowerMenuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.15s ease',
                  }}
                />
              </button>
            </div>
          )}

          {/* Right: Analyzer Drawer Toggle Button */}
          <button
            type="button"
            style={{ marginLeft: 'auto' }}
            className={`canva-analyzer-btn ${isAnalyzerOpen ? 'active' : ''}`}
            onClick={() => {
              consoleAudio.play('soft');
              onToggleAnalyzer();
            }}
            title="Buka Panel Analisis & Skor Estetika Buket"
          >
            <BarChart2 size={14} style={{ color: '#4f46e5' }} />
            <span style={{ fontWeight: 600, color: '#334155' }}>Analisis</span>
            <span style={{
              padding: '2px 6px',
              borderRadius: '9999px',
              fontSize: '10px',
              fontWeight: 700,
              background: '#e0e7ff',
              color: '#3730a3'
            }}>
              {score > 0 ? `${score}%` : 'Lihat'}
            </span>
          </button>
        </div>
      )}

      {/* ── 1. PORTAL: FLOWER LIST DROPDOWN MENU (IMMUNE TO OVERFLOW CLIPPING) ── */}
      {hasMounted && isFlowerMenuOpen && createPortal(
        <div
          ref={menuRef}
          className="canva-flower-dropdown-menu"
          style={{
            position: 'fixed',
            top: `${menuPos.top}px`,
            left: `${menuPos.left}px`,
            zIndex: 99999,
          }}
        >
          <div className="canva-dropdown-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flower2 size={13} style={{ color: '#ec4899' }} />
              <span className="canva-dropdown-title">
                Bunga di Buket ({design.selectedFlowers.length})
              </span>
            </div>
            <button
              type="button"
              className="canva-dropdown-close"
              onClick={() => setIsFlowerMenuOpen(false)}
              title="Tutup menu"
            >
              <X size={13} />
            </button>
          </div>

          <div className="canva-dropdown-list">
            {design.selectedFlowers.map((f, i) => {
              const flowerDef = FLOWERS.find((item) => item.id === f.flowerId);
              return (
                <button
                  key={f.uid}
                  type="button"
                  className="canva-dropdown-item"
                  onClick={() => {
                    consoleAudio.play('soft');
                    setSelectedFlowerUid(f.uid);
                    setIsFlowerMenuOpen(false);
                  }}
                  title={`Pilih ${flowerDef?.name || 'Bunga'}`}
                >
                  <span className="canva-dropdown-item-emoji">
                    {flowerDef?.emoji || '🌸'}
                  </span>
                  <span className="canva-dropdown-item-name">
                    {flowerDef?.name || `Bunga #${i + 1}`}
                  </span>
                  <span className="canva-dropdown-item-badge">
                    #{i + 1}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="canva-dropdown-footer">
            <button
              type="button"
              className="canva-dropdown-add-btn"
              onClick={() => {
                consoleAudio.play('soft');
                setStep(2);
                setIsFlowerMenuOpen(false);
              }}
              title="Buka katalog lengkap untuk menambah bunga baru"
            >
              <Plus size={13} />
              <span>Katalog Bunga (Langkah 2)</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── 2. PORTAL: D-PAD NUDGE POPOVER (IMMUNE TO OVERFLOW CLIPPING) ── */}
      {hasMounted && isNudgeOpen && createPortal(
        <div
          ref={nudgeRef}
          className="canva-nudge-popover"
          style={{
            position: 'fixed',
            top: `${nudgePos.top}px`,
            left: `${nudgePos.left}px`,
            zIndex: 99999,
          }}
        >
          <button
            type="button"
            className="canva-nudge-btn"
            onClick={() => handleNudge(0, -6)}
            title="Geser Atas"
          >
            <ChevronUp size={14} />
          </button>
          <div className="canva-nudge-center-row">
            <button
              type="button"
              className="canva-nudge-btn"
              onClick={() => handleNudge(-6, 0)}
              title="Geser Kiri"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="canva-nudge-dot">•</div>
            <button
              type="button"
              className="canva-nudge-btn"
              onClick={() => handleNudge(6, 0)}
              title="Geser Kanan"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <button
            type="button"
            className="canva-nudge-btn"
            onClick={() => handleNudge(0, 6)}
            title="Geser Bawah"
          >
            <ChevronDown size={14} />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
