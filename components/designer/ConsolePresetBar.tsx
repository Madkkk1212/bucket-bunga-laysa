'use client';

import React from 'react';
import { useDesign } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';
import { consoleAudio } from '@/utils/consoleAudio';
import {
  generatePresetLayout,
  PresetFormationType,
} from '@/utils/bouquetConsolePresets';
import {
  Undo2,
  Shuffle,
  Sparkles,
  Layers,
  Heart,
  CircleDot,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';

interface ConsolePresetBarProps {
  onToggleSummary?: () => void;
  isSummaryOpen?: boolean;
}

export default function ConsolePresetBar({
  onToggleSummary,
  isSummaryOpen = false,
}: ConsolePresetBarProps) {
  const { isEn } = useLanguage();
  const {
    design,
    undo,
    canUndo,
    randomizeFlowers,
    applyFlowerFormation,
    setFlowerPlacementMode,
    isPremiumUnlocked,
  } = useDesign();

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

  const handleRandomize = () => {
    consoleAudio.play('paper');
    randomizeFlowers();
  };

  const handleUndo = () => {
    if (!canUndo) return;
    consoleAudio.play('click');
    undo();
  };

  return (
    <div className="console-preset-toolbar">
      {/* Left: Preset Formations */}
      <div className="console-preset-left">
        <span className="console-preset-label">
          <Compass size={13} className="text-cyan-400" />
          <span>{isEn ? 'Formation Preset:' : 'Preset Formasi:'}</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="console-preset-btn"
            onClick={() => handleApplyPreset('dome')}
            title={isEn ? 'Apply Classic Round Dome Formation' : 'Terapkan Formasi Kubah Bulat Klasik'}
          >
            <CircleDot size={12} className="text-pink-400" />
            <span>{isEn ? 'Dome' : 'Kubah'}</span>
          </button>

          <button
            type="button"
            className="console-preset-btn"
            onClick={() => handleApplyPreset('fan')}
            title={isEn ? 'Apply Majestic Fan Formation' : 'Terapkan Formasi Kipas Megah Bertingkat'}
          >
            <span>🪭</span>
            <span>{isEn ? 'Fan' : 'Kipas'}</span>
          </button>

          <button
            type="button"
            className="console-preset-btn"
            onClick={() => handleApplyPreset('heart')}
            title={isEn ? 'Apply Romantic Heart Formation' : 'Terapkan Formasi Siluet Bentuk Hati Romantis'}
          >
            <Heart size={12} className="text-rose-400" />
            <span>{isEn ? 'Heart' : 'Hati'}</span>
          </button>

          <button
            type="button"
            className="console-preset-btn"
            onClick={() => handleApplyPreset('minimalist')}
            title={isEn ? 'Apply Intimate Minimalist Formation' : 'Terapkan Formasi Minimalis Berpusat Intim'}
          >
            <span>🎯</span>
            <span>{isEn ? 'Minimalist' : 'Minimalis'}</span>
          </button>
        </div>
      </div>

      {/* Right: Quick Canvas Actions (Undo, Randomize, Placement, Atur) */}
      <div className="console-preset-right">
        {/* Undo */}
        <button
          type="button"
          className="console-quick-action-btn"
          disabled={!canUndo}
          onClick={handleUndo}
          title={isEn ? 'Revert Last Action (Undo)' : 'Kembalikan Perubahan Terakhir (Undo)'}
        >
          <Undo2 size={13} />
          <span>Undo</span>
        </button>

        {/* Randomize */}
        <button
          type="button"
          className="console-quick-action-btn"
          onClick={handleRandomize}
          title={isEn ? 'Randomize Flower Positions & Layout' : 'Acak Variasi & Komposisi Bunga'}
        >
          <Shuffle size={13} />
          <span>{isEn ? 'Shuffle' : 'Acak'}</span>
        </button>

        {/* Inside / Front Placement Toggle */}
        <button
          type="button"
          className={`console-quick-action-btn ${design.flowerPlacementMode === 'front' ? 'active-gold' : ''}`}
          onClick={() => {
            consoleAudio.play('switch');
            setFlowerPlacementMode(design.flowerPlacementMode === 'front' ? 'inside' : 'front');
          }}
          title={isEn ? 'Toggle flower placement (inside pocket vs in front)' : 'Ubah posisi semua bunga (di dalam kantung vs di depan pita buket)'}
        >
          <Layers size={13} />
          <span>
            {design.flowerPlacementMode === 'front'
              ? (isEn ? 'In Front' : 'Di Depan')
              : (isEn ? 'Inside' : 'Di Dalam')}
          </span>
        </button>

        {/* Atur Bunga Drawer Toggle */}
        {onToggleSummary && (
          <button
            type="button"
            className={`console-quick-action-btn ${isSummaryOpen ? 'active' : ''}`}
            onClick={() => {
              consoleAudio.play('click');
              onToggleSummary();
            }}
            title={isEn ? 'Toggle Arranged Flower List' : 'Buka / Tutup Daftar Bunga Terpasang'}
          >
            <SlidersHorizontal size={13} />
            <span>{isEn ? `List (${design.selectedFlowers.length})` : `Daftar (${design.selectedFlowers.length})`}</span>
          </button>
        )}
      </div>
    </div>
  );
}
