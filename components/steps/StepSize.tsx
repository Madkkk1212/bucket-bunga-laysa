'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { ChevronRight, Check, X, Layers, Sparkles, Crown, Lock } from 'lucide-react';
import { useDesign } from '@/context/DesignContext';
import { BUCKET_SIZES, getBucketSize } from '@/data/buckets';
import { CANVAS_RATIO_DIMENSIONS, BACKGROUND_THEMES } from '@/utils/canvasUtils';
import { CanvasRatio, BucketSizeCategory, BucketTheme } from '@/types/design';
import ModalPortal from '../ui/ModalPortal';
import PremiumUnlockModal from '../designer/PremiumUnlockModal';

type ThemeFilterType = 'all' | BucketTheme;

const THEME_FILTER_TABS: { id: ThemeFilterType; label: string }[] = [
  { id: 'all', label: 'Semua Tema' },
  { id: 'naruto', label: '🍥 Naruto' },
  { id: 'kuromi', label: '🖤 Kuromi' },
  { id: 'stitch', label: '🌺 Stitch' },
  { id: 'doraemon', label: '🔔 Doraemon' },
  { id: 'cinnamoroll', label: '☁️ Cinnamoroll' },
  { id: 'totoro', label: '🍃 Totoro Ghibli' },
  { id: 'sailormoon', label: '🌙 Sailor Moon' },
  { id: 'pikachu', label: '⚡ Pikachu' },
  { id: 'hellokitty', label: '🎀 Hello Kitty' },
  { id: 'koran', label: '📰 Vintage Koran' },
  { id: 'heart', label: '💖 Heart Box' },
  { id: 'onepiece', label: '🏴‍☠️ One Piece' },
  { id: 'korean', label: '✨ Korean Classic' },
  { id: 'rustic', label: '🪵 Rustic Wood' },
];

export default function StepSize() {
  const {
    design,
    setBucketSize,
    setCanvasRatio,
    setBgTheme,
    setStep,
    isPremiumUnlocked,
  } = useDesign();

  // Filter state
  const [themeFilter, setThemeFilter] = useState<ThemeFilterType>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBucketInModal, setSelectedBucketInModal] = useState<string>('bucket-naruto');
  const [premiumModalItem, setPremiumModalItem] = useState<string | null>(null);

  const currentBucketId = design.bucketSize || 'bucket-1';
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

  // Filtered buckets based on current theme selection
  const filteredBuckets = useMemo(() => {
    return BUCKET_SIZES.filter((b) => {
      return themeFilter === 'all' || b.category === themeFilter;
    });
  }, [themeFilter]);

  // Display buckets in quick picker:
  // If no filters are active, highlight featured buckets
  // Otherwise display all matching buckets
  const displayBuckets = useMemo(() => {
    if (themeFilter === 'all') {
      const featured = [
        'bucket-213-1',
        'bucket-213-4',
        'bucket-213-6',
        'bucket-213-7',
        'bucket-213-8',
        'bucket-213-9',
        'bucket-213-10',
        'bucket-213-12',
        'bucket-213-15',
        'bucket-213-18',
        'bucket-213-20',
        'bucket-213-24',
        'bucket-213-28',
        'bucket-213-31',
        'bucket-luxury-gold',
        'bucket-luxury-champagne',
        'bucket-luxury-emerald',
        'bucket-naruto',
        'bucket-kuromi',
        'bucket-stitch',
        'bucket-doraemon',
        'bucket-cinnamoroll',
        'bucket-totoro',
        'bucket-sailormoon',
        'bucket-pikachu',
        'bucket-hellokitty',
        'bucket-koran',
        'bucket-koran-2',
        'bucket-heart-box',
        'bucket-onepiece',
        'bucket-onepiece-2',
        'bucket-1',
        'bucket-mini-noir',
        'bucket-rustic',
      ];
      const current = getBucketSize(currentBucketId);
      const list = [
        ...featured.map(getBucketSize),
      ];
      if (!featured.includes(currentBucketId)) {
        list.unshift(current);
      }
      return list;
    }
    return filteredBuckets;
  }, [themeFilter, currentBucketId, filteredBuckets]);

  const handleSelectBucket = (id: string) => {
    const bucket = getBucketSize(id);
    if (bucket.isPremium && !isPremiumUnlocked) {
      setPremiumModalItem(bucket.label);
      return;
    }
    setBucketSize(id);
  };

  const handleOpenModal = () => {
    setSelectedBucketInModal(currentBucketId);
    setIsModalOpen(true);
  };

  const handleConfirmModal = () => {
    const bucket = getBucketSize(selectedBucketInModal);
    if (bucket.isPremium && !isPremiumUnlocked) {
      setPremiumModalItem(bucket.label);
      return;
    }
    handleSelectBucket(selectedBucketInModal);
    setIsModalOpen(false);
  };

  return (
    <div className="step-content">
      {/* ─── HEADER DENGAN TOMBOL NEXT DI ATAS ─── */}
      <div className="step-header-with-top-action">
        <div className="step-header-text">
          <h2 className="step-title">Pilih Jenis Bucket</h2>
          <p className="step-desc">Pilih tema dan model pembungkus bucket favoritmu dari koleksi Laysa</p>
        </div>

        <button
          type="button"
          className="btn btn-primary step-top-next-btn"
          onClick={() => setStep(2)}
          id="btn-step1-next-top"
          aria-label="Lanjut ke langkah berikutnya"
        >
          <span>Lanjut: Rangkai Bunga</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ─── FILTER TABS (TEMA BUCKET) ─── */}
      <div className="bucket-filter-section">
        <div className="bucket-filter-row-wrap">
          <span className="bucket-filter-label">Tema:</span>
          <div className="bucket-filter-pills-row" role="tablist" aria-label="Filter Tema Bucket">
            {THEME_FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={themeFilter === tab.id}
                className={`bucket-filter-pill ${themeFilter === tab.id ? 'active' : ''}`}
                onClick={() => setThemeFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PILIHAN KARTU BUCKET CEPAT ─── */}
      <div className="size-options size-options-clean">
        {displayBuckets.map((size) => {
          const isSelected = currentBucketId === size.id;
          const isLocked = Boolean(size.isPremium && hasMounted && !isPremiumUnlocked);

          return (
            <button
              key={size.id}
              id={`size-${size.id}`}
              type="button"
              className={`size-card-clean ${isSelected ? 'selected' : ''} ${isLocked ? 'size-card-locked' : ''}`}
              onClick={() => handleSelectBucket(size.id)}
              aria-pressed={isSelected}
            >
              <div className="size-card-clean-visual">
                {size.image ? (
                  <Image
                    src={size.image}
                    alt={size.label}
                    width={76}
                    height={80}
                    className="bucket-preview-thumb"
                    style={{
                      width: '76px',
                      height: '80px',
                      objectFit: 'contain',
                      filter: `drop-shadow(0 4px 10px rgba(0,0,0,0.18)) ${size.cssFilter || ''}`,
                    }}
                  />
                ) : (
                  <div className="size-bucket-icon" />
                )}
                {isLocked && (
                  <span className="bucket-vip-overlay-badge" title="Koleksi VIP Terkunci">
                    <Crown size={12} className="text-amber-500" />
                    <span>VIP</span>
                  </span>
                )}
              </div>

              <div className="size-card-clean-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px', flexWrap: 'wrap' }}>
                  {isLocked && (
                    <span className="bucket-pill-badge badge-vip">
                      <Lock size={10} /> VIP
                    </span>
                  )}
                  {size.isNew && (
                    <span className="bucket-pill-badge badge-new">🔥 Baru</span>
                  )}
                </div>
                <span className="size-card-clean-name">{size.label}</span>
              </div>

              <div className="size-card-clean-check">
                {isLocked ? (
                  <span className="check-badge-locked" title="Terkunci VIP">
                    <Lock size={13} className="text-amber-600" />
                  </span>
                ) : isSelected ? (
                  <span className="check-badge-active">
                    <Check size={14} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="check-badge-inactive" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── TOMBOL: LIHAT SEMUA JENIS BUCKET (MEMUNCULKAN POPUP KATALOG) ─── */}
      <div className="see-all-buckets-wrap">
        <button
          type="button"
          className="btn-see-all-buckets"
          onClick={handleOpenModal}
          id="btn-see-all-buckets"
          title="Buka popup untuk memilih dari semua koleksi bucket Laysa"
        >
          <Layers size={15} />
          <span>Lihat Semua Jenis Bucket ({BUCKET_SIZES.length} Pilihan)</span>
          <ChevronRight size={14} className="see-all-arrow" />
        </button>
      </div>

      {/* ─── PILIHAN RASIO KANVAS ─── */}
      <div className="step-section-group">
        <div className="step-section-header">
          <h3 className="step-section-title">Format Rasio Kanvas</h3>
          <p className="step-section-sub">Pilih ukuran proporsi kanvas untuk media sosial atau cetak</p>
        </div>

        <div className="ratio-cards-grid">
          {(Object.keys(CANVAS_RATIO_DIMENSIONS) as CanvasRatio[]).map((r) => {
            const info = CANVAS_RATIO_DIMENSIONS[r];
            const isSelected = (design.canvasRatio ?? '1:1') === r;
            return (
              <button
                key={r}
                id={`ratio-option-${r.replace(':', '-')}`}
                type="button"
                className={`ratio-select-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setCanvasRatio(r)}
                aria-pressed={isSelected}
              >
                <div className="ratio-card-icon-wrap">
                  <span className="ratio-card-icon">{info.icon}</span>
                </div>
                <div className="ratio-card-text">
                  <span className="ratio-card-title">{info.label}</span>
                  <span className="ratio-card-dims">{info.subLabel} • {info.width}×{info.height}px</span>
                </div>
                <div className="ratio-card-check">
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── PILIHAN TEMA LATAR KANVAS ─── */}
      <div className="step-section-group">
        <div className="step-section-header">
          <h3 className="step-section-title">Tema Latar Studio</h3>
          <p className="step-section-sub">Pilih pencahayaan dan warna latar belakang studio foto buket</p>
        </div>

        <div className="theme-options-grid">
          {BACKGROUND_THEMES.map((theme) => {
            const isSelected = (design.bgTheme ?? 'studio-warm') === theme.id;
            return (
              <button
                key={theme.id}
                id={`theme-option-${theme.id}`}
                type="button"
                className={`theme-card-clean ${isSelected ? 'selected' : ''}`}
                onClick={() => setBgTheme(theme.id)}
                aria-pressed={isSelected}
              >
                <span
                  className="theme-card-clean-dot"
                  style={{ background: theme.previewColor }}
                />
                <span className="theme-card-clean-name">{theme.name}</span>
                {isSelected && (
                  <span className="theme-card-clean-check">
                    <Check size={13} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── MODAL KATALOG LENGKAP SEMUA JENIS BUCKET ─── */}
      <ModalPortal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div
          className="bucket-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bucket-modal-container bucket-wizard-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bucket-modal-title"
          >
            {/* Modal Header */}
            <div className="bucket-modal-header">
              <div className="bucket-modal-title-group">
                <h3 id="bucket-modal-title" className="bucket-modal-title">
                  Koleksi Lengkap Bucket
                </h3>
                <p className="bucket-modal-subtitle">
                  Pilih ukuran dan tema pembungkus bucket favoritmu dari koleksi Laysa
                </p>
              </div>
              <button
                type="button"
                className="bucket-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup popup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Filter Tabs */}
            <div style={{ padding: '8px 20px 0', borderBottom: '1px solid #f0ece6' }}>
              <div className="bucket-filter-section">
                <div className="bucket-filter-row-wrap">
                  <span className="bucket-filter-label">Tema:</span>
                  <div className="bucket-filter-pills-row">
                    {THEME_FILTER_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        className={`bucket-filter-pill ${themeFilter === tab.id ? 'active' : ''}`}
                        onClick={() => setThemeFilter(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body: Grid Semua Jenis Bucket */}
            <div className="bucket-catalog-grid">
              {filteredBuckets.map((b) => {
                const isSelected = selectedBucketInModal === b.id;
                const isLocked = Boolean(b.isPremium && !isPremiumUnlocked);

                return (
                  <div
                    key={b.id}
                    className={`bucket-catalog-card ${isSelected ? 'selected' : ''} ${isLocked ? 'card-locked' : ''}`}
                    onClick={() => {
                      if (isLocked) {
                        setPremiumModalItem(b.label);
                        return;
                      }
                      setSelectedBucketInModal(b.id);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (isLocked) {
                          setPremiumModalItem(b.label);
                        } else {
                          setSelectedBucketInModal(b.id);
                        }
                      }
                    }}
                  >
                    <div className="bucket-catalog-img-frame">
                      {b.image ? (
                        <Image
                          src={b.image}
                          alt={b.label}
                          width={72}
                          height={78}
                          className="bucket-catalog-img"
                          style={{
                            filter: `drop-shadow(0 4px 10px rgba(0,0,0,0.16)) ${b.cssFilter || ''}`,
                          }}
                        />
                      ) : (
                        <div className="size-bucket-icon" />
                      )}
                      {isLocked && (
                        <span className="bucket-vip-overlay-badge" title="Koleksi VIP Terkunci">
                          <Crown size={12} className="text-amber-500" />
                          <span>VIP</span>
                        </span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px', flexWrap: 'wrap' }}>
                        {isLocked && (
                          <span className="bucket-pill-badge badge-vip">
                            <Lock size={10} /> VIP
                          </span>
                        )}
                        {b.isNew && (
                          <span className="bucket-pill-badge badge-new">🔥 Baru</span>
                        )}
                      </div>
                      <h4 className="bucket-catalog-name">{b.label}</h4>
                    </div>

                    {isLocked ? (
                      <span className="bucket-catalog-lock" title="Terkunci VIP">
                        <Lock size={13} className="text-amber-600" />
                      </span>
                    ) : isSelected ? (
                      <span className="bucket-catalog-check">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer: Selesai & Pasang ke Buket */}
            <div className="bucket-modal-footer">
              <button
                type="button"
                className="btn btn-primary bucket-modal-done-btn"
                onClick={handleConfirmModal}
              >
                <Check size={16} />
                <span>Selesai & Pasang ke Buket</span>
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>

      {/* Modal Buka Akses VIP Bucket */}
      <PremiumUnlockModal
        isOpen={Boolean(premiumModalItem)}
        onClose={() => setPremiumModalItem(null)}
        itemName={premiumModalItem || undefined}
        itemType="bucket"
      />
    </div>
  );
}
