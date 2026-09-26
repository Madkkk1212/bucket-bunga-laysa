'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { X, Search, Plus, Minus, Sparkles, ArrowRight, Flower2, Crown, Lock } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import { useDesign } from '@/context/DesignContext';
import { FLOWERS } from '@/data/flowers';
import PremiumUnlockModal from '@/components/designer/PremiumUnlockModal';
import './mobile-dashboard.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenStudio?: () => void;
}

export default function MobileFlowerPickerModal({ isOpen, onClose, onOpenStudio }: Props) {
  const { design, addFlower, removeFlowerByType, isPremiumUnlocked, randomizeFlowers } = useDesign();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<'all' | 'main' | 'filler' | 'greenery'>('all');
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [lockedItemName, setLockedItemName] = useState<string | undefined>(undefined);

  const maxQuota = design.targetFlowerCount ?? 25;
  const currentTotal = design.selectedFlowers.length;
  const isFull = currentTotal >= maxQuota;

  // Tampilkan SEMUA bunga – premium tetap tampil dengan lock badge
  const filteredFlowers = useMemo(() => {
    return FLOWERS.filter((f) => {
      if (selectedCat !== 'all' && f.category !== selectedCat) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          (f.colorName && f.colorName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, selectedCat]);

  const countMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const f of design.selectedFlowers) {
      map[f.flowerId] = (map[f.flowerId] || 0) + 1;
    }
    return map;
  }, [design.selectedFlowers]);

  const handleLockedTap = (flowerName: string) => {
    setLockedItemName(flowerName);
    setIsUnlockModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalPortal isOpen={isOpen} onClose={onClose}>
        <div className="ms-overlay" onClick={onClose}>
          <div className="ms-sheet" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="ms-header">
              <div className="ms-header-left">
                <div className="ms-icon-badge ms-icon-flower">
                  <Flower2 size={20} />
                </div>
                <div>
                  <h3 className="ms-title">Pilih Koleksi Bunga</h3>
                  <p className="ms-subtitle">
                    Terpasang: <strong style={{ color: '#4F46E5' }}>{currentTotal}</strong> / {maxQuota} Tangkai
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="ms-close-btn"
                aria-label="Tutup"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quota Progress Bar */}
            <div className="ms-progress-track">
              <div
                className="ms-progress-bar"
                style={{
                  width: `${Math.min(100, (currentTotal / maxQuota) * 100)}%`,
                  background: isFull ? 'linear-gradient(90deg, #F59E0B, #EF4444)' : undefined,
                }}
              />
            </div>

            {/* VIP Banner (if not unlocked) */}
            {!isPremiumUnlocked && (
              <button
                type="button"
                className="ms-vip-banner"
                onClick={() => { setLockedItemName(undefined); setIsUnlockModalOpen(true); }}
              >
                <Crown size={14} style={{ color: '#F59E0B', flexShrink: 0 }} />
                <span>Buka <strong>VIP</strong> untuk akses 40+ bunga premium eksklusif</span>
                <ArrowRight size={13} style={{ flexShrink: 0, marginLeft: 'auto' }} />
              </button>
            )}

            {/* Search & Categories */}
            <div style={{ padding: '0 12px 8px', width: '100%', boxSizing: 'border-box' }}>
              <div className="ms-search-box">
                <Search size={15} className="ms-search-icon" />
                <input
                  type="text"
                  placeholder="Cari mawar, tulip, krisan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ms-search-input"
                />
              </div>

              {/* Category tabs */}
              <div className="ms-chip-row">
                {[
                  { id: 'all', label: 'Semua Bunga' },
                  { id: 'main', label: 'Bunga Utama' },
                  { id: 'filler', label: 'Filler / Manis' },
                  { id: 'greenery', label: 'Dedaunan' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCat(cat.id as any)}
                    className={`ms-chip ${selectedCat === cat.id ? 'ms-chip-active' : ''}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Flowers Grid */}
            <div className="ms-body">
              <div className="ms-flower-grid">
                {filteredFlowers.map((flower) => {
                  const count = countMap[flower.id] || 0;
                  const isLocked = Boolean(flower.isPremium && !isPremiumUnlocked);
                  return (
                    <div
                      key={flower.id}
                      className={`ms-flower-card ${count > 0 ? 'ms-flower-card-active' : ''} ${isLocked ? 'ms-flower-card-locked' : ''}`}
                    >
                      {/* VIP Lock Badge */}
                      {isLocked && (
                        <div className="ms-vip-lock-badge" title="Item VIP Premium">
                          <Crown size={9} />
                        </div>
                      )}

                      <div className="ms-flower-thumb">
                        <Image
                          src={flower.imageUrl}
                          alt={flower.name}
                          width={32}
                          height={32}
                          className={`ms-flower-img ${isLocked ? 'ms-img-locked' : ''}`}
                          loading="lazy"
                        />
                      </div>
                      <div className="ms-flower-info">
                        <p className="ms-flower-name" title={flower.name}>
                          {flower.name}
                          {isLocked && <span className="ms-vip-tag"> VIP</span>}
                        </p>
                        <p className="ms-flower-sub">{flower.colorName || 'Segar'}</p>

                        {isLocked ? (
                          /* Locked: Show unlock button */
                          <button
                            type="button"
                            className="ms-btn-unlock-vip"
                            onClick={() => handleLockedTap(flower.name)}
                          >
                            <Lock size={9} />
                            <span>Buka VIP</span>
                          </button>
                        ) : (
                          /* Unlocked: Normal counter */
                          <div className="ms-flower-counter">
                            <button
                              type="button"
                              disabled={count === 0}
                              onClick={() => removeFlowerByType(flower.id)}
                              className="ms-btn-counter ms-btn-minus"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="ms-counter-value">{count}</span>
                            <button
                              type="button"
                              disabled={isFull}
                              onClick={() => addFlower(flower)}
                              className="ms-btn-counter ms-btn-plus"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Action */}
            <div className="ms-footer">
              <button
                type="button"
                onClick={randomizeFlowers}
                className="ms-btn-secondary"
              >
                <Sparkles size={14} style={{ color: '#D97706' }} />
                <span>Acak Semua</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenStudio) onOpenStudio();
                }}
                className="ms-btn-primary"
              >
                <span>Terapkan & Rangkai</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>

      {/* VIP Unlock Modal */}
      <PremiumUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        itemName={lockedItemName}
        itemType="bunga"
      />
    </>
  );
}
