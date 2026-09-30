'use client';

import React from 'react';
import { useDesign } from '@/context/DesignContext';
import { FLOWERS } from '@/data/flowers';
import { consoleAudio } from '@/utils/consoleAudio';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  RotateCcw,
  Copy,
  Trash2,
  Layers,
  ArrowUpToLine,
  ArrowDownToLine,
  Sparkles,
  Maximize2,
  Gamepad2,
} from 'lucide-react';

interface ConsoleFlowerControllerProps {
  onSoundTrigger?: (type: 'click' | 'dpad' | 'switch' | 'snip') => void;
}

export default function ConsoleFlowerController({ onSoundTrigger }: ConsoleFlowerControllerProps) {
  const {
    design,
    selectedFlowerUid,
    setSelectedFlowerUid,
    nudgeFlower,
    updateFlower,
    changeFlowerLayer,
    duplicateFlower,
    removeFlowerByUid,
    toggleFlowerLayer,
  } = useDesign();

  const selectedFlower = design.selectedFlowers.find((f) => f.uid === selectedFlowerUid);
  const selectedDef = selectedFlower ? FLOWERS.find((f) => f.id === selectedFlower.flowerId) : null;

  const playFx = (type: 'click' | 'dpad' | 'switch' | 'snip' = 'dpad') => {
    consoleAudio.play(type);
    if (onSoundTrigger) onSoundTrigger(type);
  };

  const handleNudge = (dx: number, dy: number) => {
    if (!selectedFlowerUid) return;
    playFx('dpad');
    nudgeFlower(selectedFlowerUid, dx, dy);
  };

  const handleRotate = (deltaDeg: number) => {
    if (!selectedFlower || !selectedFlowerUid) return;
    playFx('click');
    const currentDeg = selectedFlower.customRotation ?? Math.round((selectedFlower.rotation || 0) * (180 / Math.PI));
    const nextDeg = ((currentDeg + deltaDeg + 180) % 360) - 180;
    const rad = nextDeg * (Math.PI / 180);
    updateFlower(selectedFlowerUid, {
      rotation: rad,
      customRotation: nextDeg,
    });
  };

  const handleSetRotation = (deg: number) => {
    if (!selectedFlower || !selectedFlowerUid) return;
    const rad = deg * (Math.PI / 180);
    updateFlower(selectedFlowerUid, {
      rotation: rad,
      customRotation: deg,
    });
  };

  const handleScaleChange = (scaleMultiplier: number) => {
    if (!selectedFlower || !selectedFlowerUid) return;
    playFx('click');
    const baseRadius = selectedFlower.radius || 60;
    const nextRadius = Math.max(35, Math.min(115, Math.round(baseRadius * scaleMultiplier)));
    updateFlower(selectedFlowerUid, {
      radius: nextRadius,
      scale: Number((nextRadius / 60).toFixed(2)),
    });
  };

  const handleSetScaleSlider = (val: number) => {
    if (!selectedFlower || !selectedFlowerUid) return;
    updateFlower(selectedFlowerUid, {
      radius: val,
      scale: Number((val / 60).toFixed(2)),
    });
  };

  const currentDeg = selectedFlower
    ? selectedFlower.customRotation ?? Math.round((selectedFlower.rotation || 0) * (180 / Math.PI))
    : 0;

  const currentScale = selectedFlower ? selectedFlower.radius || 60 : 60;

  return (
    <div className="console-controller-card">
      <div className="console-controller-header">
        <div className="flex items-center gap-2">
          <Gamepad2 size={15} className="text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">
            Console Controller
          </span>
        </div>
        {selectedFlower ? (
          <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30 truncate max-w-[130px]">
            {selectedDef?.emoji || '🌸'} {selectedDef?.name || 'Bunga'}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400">Belum Ada Seleksi</span>
        )}
      </div>

      {!selectedFlower ? (
        <div className="console-controller-idle">
          <div className="console-idle-icon-wrap">
            <Sparkles size={20} className="text-cyan-400/80 animate-pulse" />
          </div>
          <p className="text-xs font-medium text-slate-300">Pilih Bunga di Kanvas</p>
          <p className="text-[11px] text-slate-400 leading-relaxed text-center px-4">
            Klik bunga pada kanvas atau daftar di bawah untuk membuka kontrol D-Pad, rotasi halus, dan skala milimeter.
          </p>

          {/* Quick Flower Selector Carousel */}
          {design.selectedFlowers.length > 0 && (
            <div className="console-quick-flowers-strip">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Pilih Cepat:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full scrollbar-none">
                {design.selectedFlowers.map((f, i) => {
                  const flowerDef = FLOWERS.find((item) => item.id === f.flowerId);
                  return (
                    <button
                      key={f.uid}
                      type="button"
                      onClick={() => {
                        playFx('click');
                        setSelectedFlowerUid(f.uid);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-[11px] text-slate-200 flex items-center gap-1 shrink-0 transition"
                      title={flowerDef?.name || `Bunga ${i + 1}`}
                    >
                      <span>{flowerDef?.emoji || '🌸'}</span>
                      <span className="max-w-[70px] truncate">{flowerDef?.name || `#${i + 1}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="console-controller-active-body">
          {/* D-Pad & Layering Grid */}
          <div className="console-dpad-row">
            {/* Tactile D-PAD */}
            <div className="console-dpad-pad">
              <button
                type="button"
                className="dpad-btn dpad-up"
                onClick={() => handleNudge(0, -6)}
                title="Geser Bunga ke Atas"
                aria-label="Geser ke Atas"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                className="dpad-btn dpad-left"
                onClick={() => handleNudge(-6, 0)}
                title="Geser Bunga ke Kiri"
                aria-label="Geser ke Kiri"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="dpad-center">
                <span className="dpad-center-dot" />
              </div>
              <button
                type="button"
                className="dpad-btn dpad-right"
                onClick={() => handleNudge(6, 0)}
                title="Geser Bunga ke Kanan"
                aria-label="Geser ke Kanan"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                className="dpad-btn dpad-down"
                onClick={() => handleNudge(0, 6)}
                title="Geser Bunga ke Bawah"
                aria-label="Geser ke Bawah"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Quick Action Buttons on Right of D-Pad */}
            <div className="console-action-column">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className="console-mini-action-btn"
                  onClick={() => {
                    playFx('switch');
                    changeFlowerLayer(selectedFlower.uid, 'up');
                  }}
                  title="Naikkan Lapisan (Maju ke Depan)"
                >
                  <ArrowUpToLine size={13} />
                  <span>Maju</span>
                </button>
                <button
                  type="button"
                  className="console-mini-action-btn"
                  onClick={() => {
                    playFx('switch');
                    changeFlowerLayer(selectedFlower.uid, 'down');
                  }}
                  title="Turunkan Lapisan (Mundur ke Belakang)"
                >
                  <ArrowDownToLine size={13} />
                  <span>Mundur</span>
                </button>
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  className="console-mini-action-btn"
                  onClick={() => {
                    playFx('click');
                    duplicateFlower(selectedFlower.uid);
                  }}
                  title="Gandakan Bunga Ini"
                >
                  <Copy size={13} />
                  <span>Duplikat</span>
                </button>
                <button
                  type="button"
                  className="console-mini-action-btn text-rose-300 hover:text-rose-100 hover:bg-rose-950/50 hover:border-rose-700/50"
                  onClick={() => {
                    playFx('snip');
                    removeFlowerByUid(selectedFlower.uid);
                  }}
                  title="Hapus Bunga Ini dari Buket"
                >
                  <Trash2 size={13} />
                  <span>Hapus</span>
                </button>
              </div>

              {/* Toggle Inside / Front Bag */}
              <button
                type="button"
                className={`console-mini-action-btn w-full justify-center ${selectedFlower.layer === 'front' ? 'text-amber-300 border-amber-500/40 bg-amber-950/30' : ''}`}
                onClick={() => {
                  playFx('switch');
                  toggleFlowerLayer(selectedFlower.uid);
                }}
                title="Pindahkan bunga antara di dalam atau di depan kantung buket"
              >
                <Layers size={13} />
                <span>{selectedFlower.layer === 'front' ? 'Di Depan Pita' : 'Di Dalam Kantung'}</span>
              </button>
            </div>
          </div>

          {/* Sliders: Rotation & Scale */}
          <div className="console-sliders-box">
            {/* Rotation Slider */}
            <div className="console-slider-group">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1">
                  <RotateCw size={12} className="text-cyan-400" />
                  <span>Rotasi:</span>
                </span>
                <span className="font-mono text-cyan-300 font-bold">{currentDeg}°</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="console-slider-step-btn"
                  onClick={() => handleRotate(-15)}
                  title="Putar Berlawanan Jarum Jam -15°"
                >
                  <RotateCcw size={12} />
                </button>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={currentDeg}
                  onChange={(e) => handleSetRotation(parseInt(e.target.value, 10))}
                  className="console-slider-range"
                />
                <button
                  type="button"
                  className="console-slider-step-btn"
                  onClick={() => handleRotate(15)}
                  title="Putar Searah Jarum Jam +15°"
                >
                  <RotateCw size={12} />
                </button>
              </div>
            </div>

            {/* Scale Slider */}
            <div className="console-slider-group">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1">
                  <Maximize2 size={12} className="text-cyan-400" />
                  <span>Ukuran / Skala:</span>
                </span>
                <span className="font-mono text-cyan-300 font-bold">{Math.round((currentScale / 60) * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="console-slider-step-btn"
                  onClick={() => handleScaleChange(0.9)}
                  title="Perkecil Ukuran"
                >
                  -
                </button>
                <input
                  type="range"
                  min="35"
                  max="115"
                  value={currentScale}
                  onChange={(e) => handleSetScaleSlider(parseInt(e.target.value, 10))}
                  className="console-slider-range"
                />
                <button
                  type="button"
                  className="console-slider-step-btn"
                  onClick={() => handleScaleChange(1.1)}
                  title="Perbesar Ukuran"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
