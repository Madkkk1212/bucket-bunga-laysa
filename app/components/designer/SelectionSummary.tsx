'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useDesign } from '../../context/DesignContext';
import { FLOWERS } from '../../data/flowers';
import { ArrowUpToLine, ArrowDownToLine, Trash2, X, SlidersHorizontal, Plus, Minus } from 'lucide-react';

interface SelectionSummaryProps {
  onClose?: () => void;
}

export default function SelectionSummary({ onClose }: SelectionSummaryProps) {
  const {
    design,
    updateFlower,
    removeFlowerByUid,
    changeFlowerLayer,
    selectedFlowerUid,
    setSelectedFlowerUid,
    setHoveredFlowerUid,
  } = useDesign();

  const placed = design.selectedFlowers;

  const getFlowerName = (flowerId: string) =>
    FLOWERS.find((f) => f.id === flowerId)?.name ?? flowerId;

  const getFlowerEmoji = (flowerId: string) =>
    FLOWERS.find((f) => f.id === flowerId)?.emoji ?? '🌸';

  // Otomatis scroll ke kartu bunga yang sedang dipilih di kanvas
  useEffect(() => {
    if (selectedFlowerUid) {
      const cardEl = document.getElementById(`flower-card-${selectedFlowerUid}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedFlowerUid]);

  return (
    <div className="simple-atur-panel">
      {/* ── Mobile Grab Handle Bar ── */}
      <div className="mobile-drawer-handle-bar" />

      {/* ── Header: Ringkas & Bersih ── */}
      <div className="simple-atur-header">
        <div className="simple-atur-title-wrap">
          <SlidersHorizontal size={15} className="text-pink-600" />
          <span className="simple-atur-title">Daftar Bunga di Buket</span>
          <span className="simple-atur-count-pill">{placed.length} Bunga</span>
        </div>

        {onClose && (
          <button
            type="button"
            className="simple-atur-close-btn"
            onClick={onClose}
            aria-label="Tutup menu atur bunga"
            title="Tutup menu atur bunga"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── List Kartu Bunga: Rapi & Nyaman Tanpa Tumpang Tindih ── */}
      <div className="simple-atur-body">
        {placed.length === 0 ? (
          <div className="simple-atur-empty">
            <span className="text-2xl mb-1">🌸</span>
            <p className="text-xs text-gray-500 font-medium">
              Belum ada bunga di buket. Pilih bunga di atas untuk mulai merangkai!
            </p>
          </div>
        ) : (
          <div className="simple-atur-list">
            {placed.map((f, idx) => {
              const isSelected = selectedFlowerUid === f.uid;
              const flowerName = getFlowerName(f.flowerId);

              return (
                <div
                  key={f.uid}
                  id={`flower-card-${f.uid}`}
                  className={`simple-flower-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedFlowerUid(isSelected ? null : f.uid)}
                  onMouseEnter={() => setHoveredFlowerUid(f.uid)}
                  onMouseLeave={() => setHoveredFlowerUid(null)}
                  title="Klik untuk memilih bunga ini di kanvas"
                >
                  {/* Baris 1: Header Bunga (Nomor, Thumbnail, Nama, dan Tombol Hapus) */}
                  <div className="flower-card-top-row">
                    <div className="flower-card-identity">
                      <span className="flower-card-number">#{idx + 1}</span>
                      <div className="flower-card-thumb">
                        {f.imageUrl ? (
                          <Image
                            src={f.imageUrl}
                            alt={flowerName}
                            width={36}
                            height={36}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-base">{getFlowerEmoji(f.flowerId)}</span>
                        )}
                      </div>
                      <div className="flower-card-meta">
                        <span className="flower-card-name" title={flowerName}>{flowerName}</span>
                        <span className="flower-card-sub">Bunga #{idx + 1} • Ukuran {Math.round((f.scale || 1) * 100)}%</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="flower-card-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFlowerByUid(f.uid);
                      }}
                      title={`Hapus ${flowerName}`}
                      aria-label="Hapus bunga"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Baris 2: Toolbar Kontrol Lapisan & Ukuran */}
                  <div
                    className="flower-card-bottom-row"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Atur Lapisan Depan / Belakang */}
                    <div className="flower-card-layer-group">
                      <button
                        type="button"
                        className="flower-card-btn layer-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeFlowerLayer(f.uid, 'top');
                        }}
                        title="Bawa bunga ini ke paling depan"
                      >
                        <ArrowUpToLine size={12} />
                        <span>Depan</span>
                      </button>
                      <button
                        type="button"
                        className="flower-card-btn layer-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeFlowerLayer(f.uid, 'bottom');
                        }}
                        title="Kirim bunga ini ke paling belakang"
                      >
                        <ArrowDownToLine size={12} />
                        <span>Belakang</span>
                      </button>
                    </div>

                    {/* Atur Ukuran: [-] 100% [+] */}
                    <div className="flower-card-scale-group" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="flower-card-scale-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentScale = f.scale ?? 1;
                          const newScale = Math.max(0.4, Number((currentScale - 0.1).toFixed(2)));
                          updateFlower(f.uid, {
                            scale: newScale,
                            size: Math.round(92 * newScale),
                          });
                        }}
                        title="Perkecil bunga"
                        aria-label="Perkecil bunga"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="flower-card-scale-val">
                        {Math.round((f.scale || 1) * 100)}%
                      </span>
                      <button
                        type="button"
                        className="flower-card-scale-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentScale = f.scale ?? 1;
                          const newScale = Math.min(2.5, Number((currentScale + 0.1).toFixed(2)));
                          updateFlower(f.uid, {
                            scale: newScale,
                            size: Math.round(92 * newScale),
                          });
                        }}
                        title="Perbesar bunga"
                        aria-label="Perbesar bunga"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
