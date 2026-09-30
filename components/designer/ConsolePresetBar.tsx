'use client';

import React from 'react';
import { useDesign } from '@/context/DesignContext';
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
          <span>Preset Formasi:</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="console-preset-btn"
            onClick={() => handleApplyPreset('dome')}
            title="Terapkan Formasi Kubah Bulat Klasik"
          >
            <CircleDot size={12} className="text-pink-400" />
            <span>Kubah</span>
          </button>

          <button
            type="button"
            className="console-preset-btn"
            onClick={() => handleApplyPreset('fan')}
            title="Terapkan Formasi Kipas Megah Bertingkat"
          >
            <span>🪭</span>
            <span>Kipas</span>
          </button>

          <button
            type="button"
            className="console-preset-btn"
            onClick={() => handleApplyPreset('heart')}
            title="Terapkan Formasi Siluet Bentuk Hati Romantis"
          >
            <Heart size={12} className="text-rose-400" />
            <span>Hati</span>
          </button>

          <button
            type="button"
            className="console-preset-btn"
            onClick={() => handleApplyPreset('minimalist')}
            title="Terapkan Formasi Minimalis Berpusat Intim"
          >
            <span>🎯</span>
            <span>Minimalis</span>
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
          title="Kembalikan Perubahan Terakhir (Undo)"
        >
          <Undo2 size={13} />
          <span>Undo</span>
        </button>

        {/* Randomize */}
        <button
          type="button"
          className="console-quick-action-btn"
          onClick={handleRandomize}
          title="Acak Variasi & Komposisi Bunga"
        >
          <Shuffle size={13} />
          <span>Acak</span>
        </button>

        {/* Inside / Front Placement Toggle */}
        <button
          type="button"
          className={`console-quick-action-btn ${design.flowerPlacementMode === 'front' ? 'active-gold' : ''}`}
          onClick={() => {
            consoleAudio.play('switch');
            setFlowerPlacementMode(design.flowerPlacementMode === 'front' ? 'inside' : 'front');
          }}
          title="Ubah posisi semua bunga (di dalam kantung vs di depan pita buket)"
        >
          <Layers size={13} />
          <span>{design.flowerPlacementMode === 'front' ? 'Di Depan' : 'Di Dalam'}</span>
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
            title="Buka / Tutup Daftar Bunga Terpasang"
          >
            <SlidersHorizontal size={13} />
            <span>Daftar ({design.selectedFlowers.length})</span>
          </button>
        )}
      </div>
    </div>
  );
}
