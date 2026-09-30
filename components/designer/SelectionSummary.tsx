'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useDesign } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';
import { FLOWERS } from '@/data/flowers';
import { ArrowUpToLine, ArrowDownToLine, Trash2, X, SlidersHorizontal, Plus, Minus } from 'lucide-react';

interface SelectionSummaryProps {
  onClose?: () => void;
}

export default function SelectionSummary({ onClose }: SelectionSummaryProps) {
  const { isEn } = useLanguage();
  const {
    design,
    updateFlower,
    removeFlowerByUid,
    changeFlowerLayer,
    toggleFlowerLayer,
    setFlowerLayer,
    setFlowerPlacementMode,
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
          <span className="simple-atur-title">{isEn ? 'Flowers in Bouquet' : 'Daftar Bunga di Buket'}</span>
          <span className="simple-atur-count-pill">{placed.length} {isEn ? 'Flowers' : 'Bunga'}</span>
        </div>

        {onClose && (
          <button
            type="button"
            className="simple-atur-close-btn"
            onClick={onClose}
            aria-label={isEn ? 'Close arrange menu' : 'Tutup menu atur bunga'}
            title={isEn ? 'Close arrange menu' : 'Tutup menu atur bunga'}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── Pengaturan Posisi Bunga Buket: Di Dalam vs Di Depan Buket ── */}
      {placed.length > 0 && (
        <div className="atur-posisi-buket-bar">
          <div className="atur-posisi-label">
            <span>{isEn ? 'Position All Flowers:' : 'Posisi Semua Bunga Sekaligus:'}</span>
          </div>
          <div className="atur-posisi-toggle-wrap">
            <button
              type="button"
              className={`atur-posisi-btn ${(design.flowerPlacementMode || 'inside') === 'inside' ? 'active' : ''}`}
              onClick={() => setFlowerPlacementMode('inside')}
              title={isEn ? 'All flowers placed inside bouquet pocket' : 'Semua bunga terselip alami ke dalam kantung buket'}
            >
              📥 {isEn ? 'All Inside' : 'Semua di Dalam'}
            </button>
            <button
              type="button"
              className={`atur-posisi-btn ${design.flowerPlacementMode === 'front' ? 'active-gold' : ''}`}
              onClick={() => setFlowerPlacementMode('front')}
              title={isEn ? 'All flowers bloom in front of wrapper and ribbon' : 'Semua bunga mekar di depan gambar buket dan pita'}
            >
              ✨ {isEn ? 'All in Front' : 'Semua di Depan'}
            </button>
          </div>
        </div>
      )}

      {/* ── List Kartu Bunga: Rapi & Nyaman Tanpa Tumpang Tindih ── */}
      <div className="simple-atur-body">
        {placed.length === 0 ? (
          <div className="simple-atur-empty">
            <span className="text-2xl mb-1">🌸</span>
            <p className="text-xs text-gray-500 font-medium">
              {isEn
                ? 'No flowers in bouquet yet. Select flowers above to begin arranging!'
                : 'Belum ada bunga di buket. Pilih bunga di atas untuk mulai merangkai!'}
            </p>
          </div>
        ) : (
          <div className="simple-atur-list">
            {placed.map((f, idx) => {
              const isSelected = selectedFlowerUid === f.uid;
              const flowerName = getFlowerName(f.flowerId);
              const effectivePos = f.layer !== undefined ? f.layer : (design.flowerPlacementMode || 'inside');

              return (
                <div
                  key={f.uid}
                  id={`flower-card-${f.uid}`}
                  className={`simple-flower-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedFlowerUid(isSelected ? null : f.uid)}
                  onMouseEnter={() => setHoveredFlowerUid(f.uid)}
                  onMouseLeave={() => setHoveredFlowerUid(null)}
                  title={isEn ? 'Click to select this flower on canvas' : 'Klik untuk memilih bunga ini di kanvas'}
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
                        <span className="flower-card-sub">
                          {isEn ? `Flower #${idx + 1}` : `Bunga #${idx + 1}`} • {isEn ? 'Size' : 'Ukuran'} {Math.round((f.scale || 1) * 100)}%
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="flower-card-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFlowerByUid(f.uid);
                      }}
                      title={isEn ? `Delete ${flowerName}` : `Hapus ${flowerName}`}
                      aria-label={isEn ? 'Delete flower' : 'Hapus bunga'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Baris 2: Posisi Bunga di Buket (Di Dalam vs Di Depan) */}
                  <div className="flower-card-posisi-row" onClick={(e) => e.stopPropagation()}>
                    <span className="flower-posisi-label">{isEn ? 'Position:' : 'Posisi Buket:'}</span>
                    <div className="flower-posisi-toggle">
                      <button
                        type="button"
                        className={`flower-posisi-btn ${effectivePos === 'inside' ? 'active-inside' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFlowerLayer(f.uid, 'inside');
                        }}
                        title={isEn ? 'Place this flower inside bouquet' : 'Selipkan bunga ini ke dalam buket'}
                      >
                        📥 {isEn ? 'Inside' : 'Di Dalam'}
                      </button>
                      <button
                        type="button"
                        className={`flower-posisi-btn ${effectivePos === 'front' ? 'active-front' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFlowerLayer(f.uid, 'front');
                        }}
                        title={isEn ? 'Show this flower blooming in front of wrapper' : 'Tampilkan bunga ini mekar di depan buket / pita'}
                      >
                        ✨ {isEn ? 'In Front' : 'Di Depan'}
                      </button>
                    </div>
                  </div>

                  {/* Baris 3: Toolbar Urutan Tumpuk & Ukuran Bunga */}
                  <div
                    className="flower-card-actions-row"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Urutan Tumpukan Bunga */}
                    <div className="flower-card-order-group">
                      <span className="flower-actions-sublabel">{isEn ? 'Stack:' : 'Tumpuk:'}</span>
                      <button
                        type="button"
                        className="flower-card-btn layer-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeFlowerLayer(f.uid, 'top');
                        }}
                        title={isEn ? 'Bring this flower to the top of the stack' : 'Bawa urutan bunga ini ke paling atas tumpukan'}
                      >
                        <ArrowUpToLine size={12} />
                        <span>{isEn ? 'Top' : 'Atas'}</span>
                      </button>
                      <button
                        type="button"
                        className="flower-card-btn layer-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          changeFlowerLayer(f.uid, 'bottom');
                        }}
                        title={isEn ? 'Send this flower to the bottom of the stack' : 'Kirim urutan bunga ini ke paling bawah tumpukan'}
                      >
                        <ArrowDownToLine size={12} />
                        <span>{isEn ? 'Bottom' : 'Bawah'}</span>
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
                        title={isEn ? 'Shrink flower' : 'Perkecil bunga'}
                        aria-label={isEn ? 'Shrink flower' : 'Perkecil bunga'}
                      >
                        <Minus size={11} />
                      </button>
                      <span className="flower-card-scale-val">
                        {Math.round((f.scale ?? 1) * 100)}%
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
                        title={isEn ? 'Enlarge flower' : 'Perbesar bunga'}
                        aria-label={isEn ? 'Enlarge flower' : 'Perbesar bunga'}
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
