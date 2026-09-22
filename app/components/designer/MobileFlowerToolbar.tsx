'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useDesign } from '../../context/DesignContext';
import { FLOWERS } from '../../data/flowers';
import { ArrowUpToLine, ArrowDownToLine, Trash2, Plus, Minus, SlidersHorizontal, X } from 'lucide-react';

interface MobileFlowerToolbarProps {
  onClose?: () => void;
}

export default function MobileFlowerToolbar({ onClose }: MobileFlowerToolbarProps) {
  const {
    design,
    updateFlower,
    removeFlowerByUid,
    changeFlowerLayer,
    selectedFlowerUid,
    setSelectedFlowerUid,
  } = useDesign();

  const placed = design.selectedFlowers;
  const chipsScrollRef = useRef<HTMLDivElement>(null);
  const [isRowCollapsed, setIsRowCollapsed] = useState(false);

  // Jika belum ada bunga yang dipilih, default ke bunga terakhir atau pertama
  const activeFlower = !isRowCollapsed
    ? (placed.find((f) => f.uid === selectedFlowerUid) || placed[placed.length - 1])
    : null;

  const getFlowerName = (flowerId: string) =>
    FLOWERS.find((f) => f.id === flowerId)?.name ?? flowerId;

  const getFlowerEmoji = (flowerId: string) =>
    FLOWERS.find((f) => f.id === flowerId)?.emoji ?? '🌸';

  // Otomatis scroll chip bunga yang aktif ke tengah
  useEffect(() => {
    if (activeFlower) {
      const chipEl = document.getElementById(`m-chip-${activeFlower.uid}`);
      if (chipEl && chipsScrollRef.current) {
        chipEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeFlower?.uid]);

  if (placed.length === 0) return null;

  const flowerName = activeFlower ? getFlowerName(activeFlower.flowerId) : '';
  const currentScale = activeFlower ? (activeFlower.scale ?? 1) : 1;
  const activeIndex = activeFlower ? placed.findIndex((f) => f.uid === activeFlower.uid) : 0;

  const handleDecreaseScale = () => {
    if (!activeFlower) return;
    const newScale = Math.max(0.4, Number((currentScale - 0.1).toFixed(2)));
    updateFlower(activeFlower.uid, {
      scale: newScale,
      size: Math.round(92 * newScale),
    });
  };

  const handleIncreaseScale = () => {
    if (!activeFlower) return;
    const newScale = Math.min(2.5, Number((currentScale + 0.1).toFixed(2)));
    updateFlower(activeFlower.uid, {
      scale: newScale,
      size: Math.round(92 * newScale),
    });
  };

  return (
    <div className="mobile-flower-toolbar">
      {/* ─── Baris 1: Chip Pilihan Bunga (Horizontal Scroll) ─── */}
      <div className="m-chips-wrapper" ref={chipsScrollRef}>
        <div className="m-chips-label">
          <SlidersHorizontal size={11} className="text-pink-600" />
          <span>Atur:</span>
        </div>
        <div className="m-chips-list">
          {placed.map((f, idx) => {
            const isSelected = activeFlower?.uid === f.uid;
            const name = getFlowerName(f.flowerId);
            return (
              <button
                key={f.uid}
                id={`m-chip-${f.uid}`}
                type="button"
                className={`m-flower-chip ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  if (isSelected) {
                    // Jika diklik lagi, toggle tutup / buka baris kontrol
                    setIsRowCollapsed((prev) => !prev);
                  } else {
                    setIsRowCollapsed(false);
                    setSelectedFlowerUid(f.uid);
                  }
                }}
                title={isSelected ? `Klik lagi untuk sembunyikan kontrol ${name}` : `Pilih ${name}`}
              >
                <span className="m-chip-num">#{idx + 1}</span>
                <span className="m-chip-emoji">{getFlowerEmoji(f.flowerId)}</span>
                <span className="m-chip-name">{name}</span>
              </button>
            );
          })}
        </div>
        {onClose && (
          <button
            type="button"
            className="m-toolbar-close-btn"
            onClick={onClose}
            title="Tutup menu atur bunga"
            aria-label="Tutup menu atur bunga"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ─── Baris 2: Toolbar Kontrol Cepat dengan Icon Kecil Simpel ─── */}
      {activeFlower && (
        <div className="m-controls-row">
          {/* Info Bunga Aktif */}
          <div className="m-active-info">
            <div className="m-active-thumb">
              {activeFlower.imageUrl ? (
                <Image
                  src={activeFlower.imageUrl}
                  alt={flowerName}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              ) : (
                <span className="text-xs">{getFlowerEmoji(activeFlower.flowerId)}</span>
              )}
            </div>
            <span className="m-active-name" title={flowerName}>
              #{activeIndex + 1} {flowerName}
            </span>
          </div>

          {/* Group Kontrol Lapisan & Ukuran & Hapus */}
          <div className="m-actions-group">
            {/* Lapisan Depan / Belakang */}
            <div className="m-action-subgroup">
              <button
                type="button"
                className="m-btn-icon"
                onClick={() => changeFlowerLayer(activeFlower.uid, 'top')}
                title="Bawa ke paling depan"
              >
                <ArrowUpToLine size={13} />
                <span className="m-btn-txt">Depan</span>
              </button>
              <button
                type="button"
                className="m-btn-icon"
                onClick={() => changeFlowerLayer(activeFlower.uid, 'bottom')}
                title="Kirim ke paling belakang"
              >
                <ArrowDownToLine size={13} />
                <span className="m-btn-txt">Belakang</span>
              </button>
            </div>

            <div className="m-divider" />

            {/* Ukuran: [-] 100% [+] */}
            <div className="m-scale-subgroup">
              <button
                type="button"
                className="m-btn-scale"
                onClick={handleDecreaseScale}
                title="Perkecil bunga"
                aria-label="Perkecil bunga"
              >
                <Minus size={11} />
              </button>
              <span className="m-scale-val">
                {Math.round(currentScale * 100)}%
              </span>
              <button
                type="button"
                className="m-btn-scale"
                onClick={handleIncreaseScale}
                title="Perbesar bunga"
                aria-label="Perbesar bunga"
              >
                <Plus size={11} />
              </button>
            </div>

            <div className="m-divider" />

            {/* Tombol Hapus */}
            <button
              type="button"
              className="m-btn-delete"
              onClick={() => {
                removeFlowerByUid(activeFlower.uid);
                setSelectedFlowerUid(null);
              }}
              title="Hapus bunga ini"
              aria-label="Hapus bunga ini"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
