'use client';

import { useState } from 'react';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import ModalPortal from '../ui/ModalPortal';
import { FlowerCountVariant } from '@/types/design';

interface FlowerCountModalProps {
  isOpen: boolean;
  initialCount?: FlowerCountVariant;
  onConfirm: (count: FlowerCountVariant) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

interface VariantOption {
  count: FlowerCountVariant;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  desc: string;
  isPopular?: boolean;
  colorHex: string;
}

const FLOWER_COUNT_VARIANTS: VariantOption[] = [
  {
    count: 5,
    title: '5 Bunga',
    subtitle: 'Mini Sweet',
    badge: 'Minimalis',
    icon: '🌸',
    desc: 'Mungil, manis & hemat ruang untuk ucapan sederhana',
    colorHex: '#EC4899',
  },
  {
    count: 10,
    title: '10 Bunga',
    subtitle: 'Petite Bloom',
    badge: 'Kompak',
    icon: '💐',
    desc: 'Buket mungil pas untuk kado ulang tahun & sahabat',
    colorHex: '#8B5CF6',
  },
  {
    count: 15,
    title: '15 Bunga',
    subtitle: 'Medium Classic',
    badge: 'Harmonis',
    icon: '🌺',
    desc: 'Proporsi seimbang antara bunga utama & filler yang menawan',
    colorHex: '#06B6D4',
  },
  {
    count: 25,
    title: '25 Bunga',
    subtitle: 'Signature Lush',
    badge: '⭐ Paling Favorit',
    icon: '🌹',
    desc: 'Rangkaian rimbun mewah bervolume penuh & dramatis',
    isPopular: true,
    colorHex: '#F59E0B',
  },
  {
    count: 50,
    title: '50 Bunga',
    subtitle: 'Grand Royale',
    badge: '👑 Mega Luxury',
    icon: '👑',
    desc: 'Koleksi sultan spektakuler untuk perayaan akbar & lamaran',
    colorHex: '#10B981',
  },
];

export default function FlowerCountModal({
  isOpen,
  initialCount = 25,
  onConfirm,
  onClose,
  canDismiss = false,
}: FlowerCountModalProps) {
  const [selected, setSelected] = useState<FlowerCountVariant>(initialCount);

  const handleSelect = (count: FlowerCountVariant) => {
    setSelected(count);
  };

  const handleConfirm = () => {
    onConfirm(selected);
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={canDismiss && onClose ? onClose : () => {}}>
      <div className="flower-count-modal-backdrop">
        <div
          className="flower-count-modal-card"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="flower-count-title"
        >
          {/* Header */}
          <div className="flower-count-modal-header">
            <div className="flower-count-badge-wrap">
              <span className="flower-count-top-badge">
                <Sparkles size={13} className="text-pink-500" />
                <span>STUDIO BUKET LAYSA</span>
              </span>
            </div>
            <h2 id="flower-count-title" className="flower-count-modal-title">
              Pilih Jumlah Bunga
            </h2>
            <p className="flower-count-modal-desc">
              Pilih kapasitas karangan bunga impianmu sebelum mulai merangkai di studio.
            </p>
          </div>

          {/* 5 Variants Grid */}
          <div className="flower-count-grid" role="radiogroup" aria-label="Pilih jumlah bunga">
            {FLOWER_COUNT_VARIANTS.map((v) => {
              const isSelected = selected === v.count;
              return (
                <div
                  key={v.count}
                  className={`flower-count-option-card ${isSelected ? 'selected' : ''} ${v.isPopular ? 'popular' : ''}`}
                  onClick={() => handleSelect(v.count)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(v.count);
                    }
                  }}
                >
                  {/* Popular ribbon */}
                  {v.isPopular && (
                    <div className="flower-count-popular-tag">
                      <span>Favorit</span>
                    </div>
                  )}

                  <div className="flower-count-card-top">
                    <span className="flower-count-emoji">{v.icon}</span>
                    <span className="flower-count-badge-pill" style={{ color: v.colorHex }}>
                      {v.badge}
                    </span>
                  </div>

                  <div className="flower-count-card-body">
                    <div className="flower-count-number">{v.title}</div>
                    <div className="flower-count-subtitle">{v.subtitle}</div>
                    <p className="flower-count-card-desc">{v.desc}</p>
                  </div>

                  <div className="flower-count-check-wrap">
                    {isSelected ? (
                      <span className="flower-count-check-active">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="flower-count-check-empty" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="flower-count-modal-footer">
            <button
              type="button"
              id="btn-confirm-flower-count"
              className="btn-confirm-flower-count"
              onClick={handleConfirm}
            >
              <span>Mulai Rangkai {selected} Bunga</span>
              <ChevronRight size={18} />
            </button>
            <p className="flower-count-footer-hint">
              Kapasitas {selected} bunga • Bebas atur posisi, jenis bunga &amp; pembungkus di dalam studio
            </p>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
