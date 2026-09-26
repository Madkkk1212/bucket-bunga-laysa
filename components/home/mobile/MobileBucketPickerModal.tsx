'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { X, Check, Package, Crown, Lock, ArrowRight } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import { useDesign } from '@/context/DesignContext';
import { BUCKET_SIZES } from '@/data/buckets';
import PremiumUnlockModal from '@/components/designer/PremiumUnlockModal';
import './mobile-dashboard.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileBucketPickerModal({ isOpen, onClose }: Props) {
  const { design, setBucketSize, isPremiumUnlocked } = useDesign();
  const [activeTheme, setActiveTheme] = useState<'all' | 'korean' | 'luxury' | 'anime'>('all');
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [lockedItemName, setLockedItemName] = useState<string | undefined>(undefined);

  // Tampilkan SEMUA buket – premium tetap tampil dengan lock badge
  const filteredBuckets = useMemo(() => {
    return BUCKET_SIZES.filter((b) => {
      if (activeTheme === 'korean' && b.category !== 'korean') return false;
      if (activeTheme === 'luxury' && !b.themeName?.includes('Luxury')) return false;
      if (
        activeTheme === 'anime' &&
        !['onepiece', 'naruto', 'kuromi', 'stitch', 'doraemon', 'cinnamoroll', 'totoro', 'sailormoon', 'pikachu', 'hellokitty'].includes(b.category || '')
      ) {
        return false;
      }
      return true;
    });
  }, [activeTheme]);

  const handleBucketSelect = (bucket: typeof BUCKET_SIZES[number]) => {
    if (bucket.isPremium && !isPremiumUnlocked) {
      setLockedItemName(bucket.label);
      setIsUnlockModalOpen(true);
      return;
    }
    setBucketSize(bucket.id);
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
                <div className="ms-icon-badge ms-icon-bucket">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="ms-title">Pilih Model Buket</h3>
                  <p className="ms-subtitle">Koleksi Signature, Korean Origami & Luxury Wrap</p>
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

            {/* VIP Banner (if not unlocked) */}
            {!isPremiumUnlocked && (
              <button
                type="button"
                className="ms-vip-banner"
                onClick={() => { setLockedItemName(undefined); setIsUnlockModalOpen(true); }}
              >
                <Crown size={14} style={{ color: '#F59E0B', flexShrink: 0 }} />
                <span>Buka <strong>VIP</strong> untuk akses semua model buket eksklusif</span>
                <ArrowRight size={13} style={{ flexShrink: 0, marginLeft: 'auto' }} />
              </button>
            )}

            {/* Theme Filters */}
            <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid #F1F5F9', width: '100%', boxSizing: 'border-box' }}>
              <div className="ms-chip-row">
                {[
                  { id: 'all', label: 'Semua Model' },
                  { id: 'korean', label: 'Korean Signature' },
                  { id: 'luxury', label: 'Royal Luxury' },
                  { id: 'anime', label: 'Karakter & Anime' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTheme(t.id as any)}
                    className={`ms-chip ${activeTheme === t.id ? 'ms-chip-active-rose' : ''}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bucket Grid */}
            <div className="ms-body">
              <div className="ms-bucket-grid">
                {filteredBuckets.map((bucket) => {
                  const isSelected = design.bucketSize === bucket.id;
                  const isLocked = Boolean(bucket.isPremium && !isPremiumUnlocked);
                  return (
                    <button
                      key={bucket.id}
                      type="button"
                      onClick={() => handleBucketSelect(bucket)}
                      className={`ms-bucket-card ${isSelected ? 'ms-bucket-card-selected' : ''} ${isLocked ? 'ms-bucket-card-locked' : ''}`}
                    >
                      {isSelected && !isLocked && (
                        <div className="ms-bucket-check-badge">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}

                      {/* VIP Lock overlay */}
                      {isLocked && (
                        <div className="ms-bucket-lock-overlay">
                          <div className="ms-bucket-lock-icon">
                            <Crown size={16} />
                          </div>
                          <span className="ms-bucket-lock-label">VIP</span>
                        </div>
                      )}

                      <div className="ms-bucket-thumb">
                        <Image
                          src={bucket.image || bucket.frontImage || '/images/bucket/bucket-1.png'}
                          alt={bucket.label}
                          width={120}
                          height={100}
                          className={`ms-bucket-img ${isLocked ? 'ms-img-locked' : ''}`}
                          loading="lazy"
                        />
                      </div>

                      <div className="ms-bucket-info">
                        <p className="ms-bucket-label">
                          {bucket.label}
                          {isLocked && <span className="ms-vip-tag"> VIP</span>}
                        </p>
                        <p className="ms-bucket-tag">{bucket.themeName || bucket.tag || 'Buket Elegan'}</p>
                        <span className="ms-bucket-badge">
                          {isLocked ? (
                            <><Lock size={8} style={{ display: 'inline', marginRight: '2px' }} />Buka VIP</>
                          ) : (
                            bucket.capacity || 'Kapasitas 25 Bunga'
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="ms-footer">
              <button
                type="button"
                onClick={onClose}
                className="ms-btn-primary"
                style={{ background: '#E11D48', boxShadow: '0 4px 14px rgba(225, 29, 72, 0.28)' }}
              >
                <span>Simpan Pilihan Model</span>
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
        itemType="bucket"
      />
    </>
  );
}
