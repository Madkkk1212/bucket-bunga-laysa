'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useDesign } from '../../context/DesignContext';
import { getBucketSize } from '../../data/buckets';
import { FLOWERS } from '../../data/flowers';
import { PlacedFlower } from '../../types/design';
import { ArrowUpToLine, ArrowDownToLine, Copy, Trash2, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import SmartNumberInput from '../ui/SmartNumberInput';

interface SelectionSummaryProps {
  onClose?: () => void;
}

export default function SelectionSummary({ onClose }: SelectionSummaryProps) {
  const {
    design,
    updateFlower,
    removeFlowerByUid,
    changeFlowerLayer,
    duplicateFlower,
    selectedFlowerUid,
    setSelectedFlowerUid,
    setHoveredFlowerUid,
  } = useDesign();

  const bucket = getBucketSize(design.bucketSize);
  const placed = design.selectedFlowers;

  // Track which flower groups are expanded in the picker
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(placed.map(f => f.flowerId)));

  const getFlowerName = (flowerId: string) =>
    FLOWERS.find((f) => f.id === flowerId)?.name ?? flowerId;

  const getFlowerEmoji = (flowerId: string) =>
    FLOWERS.find((f) => f.id === flowerId)?.emoji ?? '🌸';

  // Currently selected flower (if any)
  const selectedFlower = placed.find((f) => f.uid === selectedFlowerUid);
  const selectedGlobalIndex = selectedFlower
    ? placed.findIndex((f) => f.uid === selectedFlower.uid)
    : -1;

  // Group placed flowers by flowerId
  const groups = placed.reduce<
    Record<
      string,
      {
        name: string;
        emoji: string;
        imageUrl?: string;
        items: (PlacedFlower & { globalIndex: number })[];
      }
    >
  >((acc, f, idx) => {
    if (!acc[f.flowerId]) {
      acc[f.flowerId] = {
        name: getFlowerName(f.flowerId),
        emoji: getFlowerEmoji(f.flowerId),
        imageUrl: f.imageUrl,
        items: [],
      };
    }
    acc[f.flowerId].items.push({ ...f, globalIndex: idx });
    return acc;
  }, {});

  const uniqueTypes = Array.from(new Set(placed.map((f) => f.flowerId)));

  const toggleGroup = (flowerId: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(flowerId)) next.delete(flowerId);
      else next.add(flowerId);
      return next;
    });
  };

  return (
    <aside className="artisan-panel">
      {/* ── Header: Buket Info ── */}
      <div className="artisan-header">
        <div className="artisan-header-main">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-pink-600" />
            <span className="artisan-title">Atur Bunga & Buket Anda</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="artisan-badge">{placed.length} Bunga</span>
            {onClose && (
              <button
                type="button"
                className="artisan-drawer-close-btn"
                onClick={onClose}
                aria-label="Tutup menu atur bunga"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <p className="artisan-subtitle">Buket: {bucket.label}</p>
      </div>

      {/* ── 1. INSPECTOR: PENGATURAN BUNGA TERPILIH ── */}
      <div className="artisan-card inspector-card">
        <div className="inspector-card-header">
          <span className="inspector-title">
            <Sparkles size={13} className="text-amber-600" />
            Pengaturan Bunga Terpilih
          </span>
          {selectedFlower && (
            <button
              type="button"
              className="inspector-close-btn"
              onClick={() => setSelectedFlowerUid(null)}
              title="Tutup pengaturan bunga ini"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {selectedFlower ? (
          <div className="inspector-body">
            {/* Selected Flower Identity */}
            <div className="inspector-flower-identity">
              <div className="inspector-flower-thumb">
                {selectedFlower.imageUrl ? (
                  <Image
                    src={selectedFlower.imageUrl}
                    alt={getFlowerName(selectedFlower.flowerId)}
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-xl">{getFlowerEmoji(selectedFlower.flowerId)}</span>
                )}
              </div>
              <div className="inspector-flower-meta">
                <span className="inspector-flower-name">
                  {getFlowerName(selectedFlower.flowerId)}
                </span>
                <span className="inspector-flower-tag">
                  Bunga ke-{selectedGlobalIndex + 1} di buket
                </span>
              </div>
            </div>

            {/* Solusi Bunga Kedaleman: Tombol Lapisan Depan / Belakang */}
            <div className="inspector-section">
              <span className="inspector-section-label">Lapisan Buket (Posisi Tumpukan)</span>
              <div className="inspector-layer-actions">
                <button
                  type="button"
                  className="inspector-btn-primary"
                  onClick={() => changeFlowerLayer(selectedFlower.uid, 'top')}
                  title="Tarik bunga ini ke lapisan paling depan agar tidak tertutup bunga lain"
                >
                  <ArrowUpToLine size={14} />
                  <span>Tarik ke Paling Depan</span>
                </button>

                <button
                  type="button"
                  className="inspector-btn-secondary"
                  onClick={() => changeFlowerLayer(selectedFlower.uid, 'bottom')}
                  title="Kirim bunga ini ke lapisan paling belakang/bawah"
                >
                  <ArrowDownToLine size={13} />
                  <span>Kirim ke Belakang</span>
                </button>
              </div>
            </div>

            {/* Slider & Input Ukuran Bunga */}
            <div className="inspector-section">
              <div className="inspector-slider-header">
                <span className="inspector-section-label">Ukuran Bunga</span>
                {(selectedFlower.size ?? 80) !== 80 && (
                  <button
                    type="button"
                    className="scale-reset-chip"
                    onClick={() =>
                      updateFlower(selectedFlower.uid, {
                        size: 80,
                        isManual: true,
                      })
                    }
                    title="Kembalikan ukuran bunga ke default 80px"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="slider-control-row">
                <button
                  type="button"
                  className="scale-step-btn"
                  onClick={() =>
                    updateFlower(selectedFlower.uid, {
                      size: Math.max(40, (selectedFlower.size ?? 80) - 5),
                      isManual: true,
                    })
                  }
                  title="Perkecil 5px"
                >
                  −
                </button>
                <input
                  type="range"
                  min={40}
                  max={180}
                  step={1}
                  value={selectedFlower.size ?? 80}
                  onChange={(e) =>
                    updateFlower(selectedFlower.uid, {
                      size: Number(e.target.value),
                      isManual: true,
                    })
                  }
                  className="artisan-slider"
                />
                <SmartNumberInput
                  value={selectedFlower.size ?? 80}
                  min={40}
                  max={180}
                  step={1}
                  unit="px"
                  onChange={(val) =>
                    updateFlower(selectedFlower.uid, {
                      size: val,
                      isManual: true,
                    })
                  }
                  ariaLabel="Ketik ukuran bunga (px)"
                  title="Ketik ukuran bunga (px)"
                />
                <button
                  type="button"
                  className="scale-step-btn"
                  onClick={() =>
                    updateFlower(selectedFlower.uid, {
                      size: Math.min(180, (selectedFlower.size ?? 80) + 5),
                      isManual: true,
                    })
                  }
                  title="Perbesar 5px"
                >
                  +
                </button>
              </div>
              <div className="inspector-slider-hints">
                <span>Kecil (40px)</span>
                <span>Standar (80px / 100%)</span>
                <span>Besar (180px)</span>
              </div>
            </div>

            {/* Slider & Input Rotasi Bunga */}
            {(() => {
              const currentRotDeg = Math.round(
                (((selectedFlower.customRotation ?? selectedFlower.rotation ?? 0) * 180) / Math.PI),
              );
              return (
                <div className="inspector-section">
                  <div className="inspector-slider-header">
                    <span className="inspector-section-label">Rotasi Bunga</span>
                    {currentRotDeg !== 0 && (
                      <button
                        type="button"
                        className="scale-reset-chip"
                        onClick={() =>
                          updateFlower(selectedFlower.uid, {
                            customRotation: 0,
                            isManual: true,
                          })
                        }
                        title="Kembalikan rotasi bunga ke 0°"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="slider-control-row">
                    <button
                      type="button"
                      className="scale-step-btn"
                      onClick={() => {
                        const newDeg = Math.max(-180, currentRotDeg - 15);
                        updateFlower(selectedFlower.uid, {
                          customRotation: (newDeg * Math.PI) / 180,
                          isManual: true,
                        });
                      }}
                      title="Putar kiri 15°"
                    >
                      ↺
                    </button>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={1}
                      value={currentRotDeg}
                      onChange={(e) =>
                        updateFlower(selectedFlower.uid, {
                          customRotation: (Number(e.target.value) * Math.PI) / 180,
                          isManual: true,
                        })
                      }
                      className="artisan-slider"
                    />
                    <SmartNumberInput
                      value={currentRotDeg}
                      min={-180}
                      max={180}
                      step={1}
                      unit="°"
                      onChange={(val) =>
                        updateFlower(selectedFlower.uid, {
                          customRotation: (val * Math.PI) / 180,
                          isManual: true,
                        })
                      }
                      ariaLabel="Ketik rotasi bunga (°)"
                      title="Ketik rotasi bunga (°)"
                    />
                    <button
                      type="button"
                      className="scale-step-btn"
                      onClick={() => {
                        const newDeg = Math.min(180, currentRotDeg + 15);
                        updateFlower(selectedFlower.uid, {
                          customRotation: (newDeg * Math.PI) / 180,
                          isManual: true,
                        });
                      }}
                      title="Putar kanan 15°"
                    >
                      ↻
                    </button>
                  </div>
                  <div className="inspector-slider-hints">
                    <span>-180°</span>
                    <span>Tegak (0°)</span>
                    <span>+180°</span>
                  </div>
                </div>
              );
            })()}

            {/* Quick Action Buttons: Duplikat & Hapus */}
            <div className="inspector-actions-row">
              <button
                type="button"
                className="inspector-action-btn"
                onClick={() => duplicateFlower(selectedFlower.uid)}
                title="Duplikat bunga ini"
              >
                <Copy size={13} />
                <span>Duplikat</span>
              </button>

              <button
                type="button"
                className="inspector-action-btn delete"
                onClick={() => {
                  removeFlowerByUid(selectedFlower.uid);
                  setSelectedFlowerUid(null);
                }}
                title="Hapus bunga ini dari buket"
              >
                <Trash2 size={13} />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="inspector-empty">
            <span className="inspector-empty-icon">🌸</span>
            <p className="inspector-empty-text">
              Klik salah satu bunga di buket, atau klik nomornya pada daftar di bawah untuk mengaturnya.
            </p>
          </div>
        )}
      </div>

      {/* ── 2. PEMILIH BUNGA: SOLUSI JIKA TERTUTUP / KEDALEMAN ── */}
      <div className="artisan-card picker-card">
        <div className="picker-card-header">
          <span className="picker-title">Pilih Bunga di Buket</span>
          <span className="picker-sub">Bila tertutup bunga lain</span>
        </div>

        {placed.length === 0 ? (
          <p className="picker-empty">Belum ada bunga di buket.</p>
        ) : (
          <div className="picker-groups">
            {uniqueTypes.map((flowerId) => {
              const group = groups[flowerId];
              const isExpanded = expandedTypes.has(flowerId);
              const hasActiveChild = group.items.some((f) => f.uid === selectedFlowerUid);

              return (
                <div
                  key={flowerId}
                  className={`picker-group-item ${hasActiveChild ? 'active-group' : ''}`}
                >
                  {/* Group header bar */}
                  <button
                    type="button"
                    className="picker-group-toggle"
                    onClick={() => toggleGroup(flowerId)}
                  >
                    <span className="picker-group-emoji">{group.emoji}</span>
                    <span className="picker-group-name">{group.name}</span>
                    <span className="picker-group-count">{group.items.length}</span>
                    <span className="picker-group-chevron">{isExpanded ? '▾' : '▸'}</span>
                  </button>

                  {/* Horizontal Flower Instance Chips */}
                  {isExpanded && (
                    <div className="picker-chips-container">
                      <span className="picker-chips-label">Nomor bunga:</span>
                      <div className="picker-chips">
                        {group.items.map((f) => {
                          const isSelected = f.uid === selectedFlowerUid;

                          return (
                            <button
                              key={f.uid}
                              type="button"
                              className={`picker-chip ${isSelected ? 'selected' : ''}`}
                              onClick={() => setSelectedFlowerUid(isSelected ? null : f.uid)}
                              onMouseEnter={() => setHoveredFlowerUid(f.uid)}
                              onMouseLeave={() => setHoveredFlowerUid(null)}
                              title={`Bunga ke-${f.globalIndex + 1} (Sorot di buket)`}
                            >
                              #{f.globalIndex + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="picker-hint">
          <span>💡 <strong>Tips:</strong> Arahkan mouse ke nomor <code>#1, #2...</code> untuk melihat letak bunganya di buket, lalu klik untuk mengaturnya.</span>
        </div>
      </div>

      {onClose && (
        <div className="artisan-drawer-footer">
          <button
            type="button"
            className="btn btn-primary artisan-finish-btn"
            onClick={onClose}
          >
            Selesai Mengatur
          </button>
        </div>
      )}
    </aside>
  );
}
