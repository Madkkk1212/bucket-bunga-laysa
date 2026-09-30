'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronRight, Check, X, Layers, Sparkles, Crown, Lock, Upload, Crop, Trash2, AlertCircle } from 'lucide-react';
import { useDesign } from '@/context/DesignContext';
import { BUCKET_SIZES, getBucketSize } from '@/data/buckets';
import { CANVAS_RATIO_DIMENSIONS, BACKGROUND_THEMES } from '@/utils/canvasUtils';
import { CanvasRatio, BucketSizeCategory, BucketTheme } from '@/types/design';
import ModalPortal from '../ui/ModalPortal';
import PremiumUnlockModal from '../designer/PremiumUnlockModal';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t, isEn } = useLanguage();
  const {
    design,
    setBucketSize,
    setCanvasRatio,
    setBgTheme,
    setCustomBgImage,
    setStep,
    isPremiumUnlocked,
  } = useDesign();

  // Filter state
  const [themeFilter, setThemeFilter] = useState<ThemeFilterType>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBucketInModal, setSelectedBucketInModal] = useState<string>('bucket-naruto');
  const [premiumModalItem, setPremiumModalItem] = useState<string | null>(null);

  // VIP Custom Background Modal State
  const [isCustomBgModalOpen, setIsCustomBgModalOpen] = useState<boolean>(false);
  const [customBgPreview, setCustomBgPreview] = useState<string | null>(design.customBgImage || null);
  const [rawImgElement, setRawImgElement] = useState<HTMLImageElement | null>(null);
  const [rawImgDims, setRawImgDims] = useState<{ width: number; height: number } | null>(null);
  const [isRatioMatching, setIsRatioMatching] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
          <h2 className="step-title">{t('bucket_model_title')}</h2>
          <p className="step-desc">{t('bucket_model_sub')}</p>
        </div>

        <button
          type="button"
          className="btn btn-primary step-top-next-btn"
          onClick={() => setStep(2)}
          id="btn-step1-next-top"
          aria-label={t('next')}
        >
          <span>{t('next')}: {t('step_2_short')}</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ─── FILTER TABS (TEMA BUCKET) ─── */}
      <div className="bucket-filter-section">
        <div className="bucket-filter-row-wrap">
          <span className="bucket-filter-label">{t('bucket_filter_theme')}</span>
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
          <span>{t('bucket_see_all', { count: BUCKET_SIZES.length })}</span>
          <ChevronRight size={14} className="see-all-arrow" />
        </button>
      </div>

      {/* ─── PILIHAN RASIO KANVAS ─── */}
      <div className="step-section-group">
        <div className="step-section-header">
          <h3 className="step-section-title">{t('canvas_ratio_title')}</h3>
          <p className="step-section-sub">{t('canvas_ratio_sub')}</p>
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
          <h3 className="step-section-title">{t('studio_theme_title')}</h3>
          <p className="step-section-sub">{t('studio_theme_sub')}</p>
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

          {/* ── VIP EXCLUSIVE: CUSTOM CANVAS BACKGROUND ── */}
          <button
            type="button"
            className={`theme-card-clean ${design.bgTheme === 'custom' ? 'selected' : ''}`}
            onClick={() => {
              if (!isPremiumUnlocked) {
                setPremiumModalItem(isEn ? 'Custom VIP Canvas Background' : 'Latar Belakang Kanvas Kustom VIP');
                return;
              }
              setCustomBgPreview(design.customBgImage || null);
              setIsCustomBgModalOpen(true);
            }}
            title={isEn ? 'Set Custom VIP Canvas Background' : 'Gunakan Latar Belakang Kanvas Kustom (Khusus VIP)'}
          >
            <span
              className="theme-card-clean-dot"
              style={{
                background: design.customBgImage
                  ? `url(${design.customBgImage}) center/cover`
                  : 'linear-gradient(135deg, #f59e0b, #ec4899)',
              }}
            />
            <span className="theme-card-clean-name" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>{isEn ? 'Custom Background' : 'Background Kustom'}</span>
              {!isPremiumUnlocked && <Crown size={12} className="text-amber-500" />}
            </span>
            {design.bgTheme === 'custom' && (
              <span className="theme-card-clean-check">
                <Check size={13} strokeWidth={3} />
              </span>
            )}
          </button>
        </div>

        {design.bgTheme === 'custom' && design.customBgImage && (
          <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              onClick={() => {
                setCustomBgPreview(design.customBgImage || null);
                setIsCustomBgModalOpen(true);
              }}
            >
              <Crop size={13} />
              <span>{isEn ? 'Adjust / Change Custom Background' : 'Ganti / Sesuaikan Background'}</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost text-xs py-1.5 px-2.5 text-rose-600 flex items-center gap-1"
              onClick={() => {
                setCustomBgImage(null);
                setBgTheme('studio-warm');
              }}
              title={isEn ? 'Reset to default studio background' : 'Kembalikan ke latar studio default'}
            >
              <Trash2 size={13} />
              <span>{isEn ? 'Remove' : 'Hapus'}</span>
            </button>
          </div>
        )}
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
                  {isEn ? 'Complete Bucket Collection' : 'Koleksi Lengkap Bucket'}
                </h3>
                <p className="bucket-modal-subtitle">
                  {isEn
                    ? 'Choose your favorite bucket wrapping size and theme from Laysa collection'
                    : 'Pilih ukuran dan tema pembungkus bucket favoritmu dari koleksi Laysa'}
                </p>
              </div>
              <button
                type="button"
                className="bucket-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label={isEn ? 'Close modal' : 'Tutup popup'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Filter Tabs */}
            <div style={{ padding: '8px 20px 0', borderBottom: '1px solid #f0ece6' }}>
              <div className="bucket-filter-section">
                <div className="bucket-filter-row-wrap">
                  <span className="bucket-filter-label">{isEn ? 'Theme:' : 'Tema:'}</span>
                  <div className="bucket-filter-pills-row">
                    {THEME_FILTER_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        className={`bucket-filter-pill ${themeFilter === tab.id ? 'active' : ''}`}
                        onClick={() => setThemeFilter(tab.id)}
                      >
                        {tab.id === 'all' ? (isEn ? 'All Themes' : 'Semua Tema') : tab.label}
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
                <span>{isEn ? 'Confirm & Apply to Bouquet' : 'Selesai & Pasang ke Buket'}</span>
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>

      {/* ─── MODAL KUSTOM BACKGROUND VIP DENGAN VALIDASI UKURAN PRESISI ─── */}
      <ModalPortal isOpen={isCustomBgModalOpen} onClose={() => setIsCustomBgModalOpen(false)}>
        <div className="bucket-modal-backdrop" onClick={() => setIsCustomBgModalOpen(false)}>
          <div
            className="bucket-modal-container"
            style={{ maxWidth: '520px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            {/* Header */}
            <div className="bucket-modal-header">
              <div className="bucket-modal-title-group">
                <h3 className="bucket-modal-title flex items-center gap-2">
                  <Crown size={18} className="text-amber-500" />
                  <span>{isEn ? 'VIP Custom Canvas Background' : 'Latar Belakang Kanvas Kustom VIP'}</span>
                </h3>
                <p className="bucket-modal-subtitle">
                  {isEn
                    ? 'Upload your personal studio backdrop. Image must fit the active canvas aspect ratio.'
                    : 'Gunakan gambar studio pribadi. Ukuran gambar wajib sesuai rasio kanvas agar buket tampil sempurna.'}
                </p>
              </div>
              <button
                type="button"
                className="bucket-modal-close-btn"
                onClick={() => setIsCustomBgModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
              {/* Target Ratio Requirement Pill */}
              {(() => {
                const targetRatioDims = CANVAS_RATIO_DIMENSIONS[design.canvasRatio || '1:1'];
                const targetRatio = targetRatioDims.width / targetRatioDims.height;
                const ratioLabel = targetRatioDims.subLabel;

                const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const result = event.target?.result as string;
                    const img = new window.Image();
                    img.onload = () => {
                      setRawImgElement(img);
                      setRawImgDims({ width: img.naturalWidth, height: img.naturalHeight });
                      const curRatio = img.naturalWidth / img.naturalHeight;
                      const matches = Math.abs(curRatio - targetRatio) < 0.05;
                      setIsRatioMatching(matches);
                      setCustomBgPreview(result);
                    };
                    img.src = result;
                  };
                  reader.readAsDataURL(file);
                };

                const handleAutoCropToRatio = () => {
                  if (!rawImgElement) return;
                  const canvas = document.createElement('canvas');
                  canvas.width = targetRatioDims.width * 2;
                  canvas.height = targetRatioDims.height * 2;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;

                  let sWidth = rawImgElement.naturalWidth;
                  let sHeight = rawImgElement.naturalHeight;
                  let sx = 0;
                  let sy = 0;
                  const curRatio = rawImgElement.naturalWidth / rawImgElement.naturalHeight;

                  if (curRatio > targetRatio) {
                    sWidth = rawImgElement.naturalHeight * targetRatio;
                    sx = (rawImgElement.naturalWidth - sWidth) / 2;
                  } else {
                    sHeight = rawImgElement.naturalWidth / targetRatio;
                    sy = (rawImgElement.naturalHeight - sHeight) / 2;
                  }

                  ctx.drawImage(rawImgElement, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
                  const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
                  setCustomBgPreview(croppedDataUrl);
                  setIsRatioMatching(true);
                };

                return (
                  <div>
                    {/* Ratio Info Bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '16px',
                    }}>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                        {isEn ? 'Active Canvas Ratio:' : 'Rasio Kanvas Aktif:'}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#4338ca',
                        background: '#e0e7ff',
                        padding: '3px 8px',
                        borderRadius: '9999px',
                      }}>
                        {targetRatioDims.label} ({ratioLabel} • {targetRatioDims.width}×{targetRatioDims.height}px)
                      </span>
                    </div>

                    {/* Image Preview Box */}
                    {customBgPreview ? (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{
                          width: '100%',
                          height: '240px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: `2px solid ${isRatioMatching ? '#22c55e' : '#f59e0b'}`,
                          position: 'relative',
                          background: '#000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <img
                            src={customBgPreview}
                            alt="Preview Background"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </div>

                        {/* Ratio Status & Auto-Crop Tool */}
                        <div style={{ marginTop: '10px' }}>
                          {isRatioMatching ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '12.5px', fontWeight: 600 }}>
                              <Check size={16} />
                              <span>{isEn ? 'Size matches canvas ratio perfectly! ✓' : 'Ukuran pas sempurna dengan rasio kanvas! ✓'}</span>
                            </div>
                          ) : (
                            <div style={{
                              background: '#fffbeb',
                              border: '1px solid #fef3c7',
                              padding: '10px',
                              borderRadius: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontSize: '12px' }}>
                                <AlertCircle size={15} />
                                <span>
                                  {isEn
                                    ? `Image ratio does not match ${ratioLabel}. Use auto-crop to prevent distortion.`
                                    : `Rasio gambar (${rawImgDims?.width}×${rawImgDims?.height}px) belum pas dengan rasio ${ratioLabel}.`}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="btn btn-secondary text-xs py-1.5 flex items-center justify-center gap-1.5"
                                onClick={handleAutoCropToRatio}
                              >
                                <Crop size={14} />
                                <span>{isEn ? `✂️ Auto-Crop to ${ratioLabel}` : `✂️ Potong Otomatis Presisi ke Rasio ${ratioLabel}`}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: '2px dashed #cbd5e1',
                          borderRadius: '12px',
                          padding: '36px 20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          marginBottom: '16px',
                          background: '#f8fafc',
                        }}
                      >
                        <Upload size={32} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#334155', margin: 0 }}>
                          {isEn ? 'Click to upload background image' : 'Klik untuk memilih gambar latar'}
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                          {isEn ? `Recommended ratio: ${ratioLabel} (JPG/PNG)` : `Rekomendasi rasio: ${ratioLabel} (JPG/PNG)`}
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary flex-1"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={14} />
                        <span>{customBgPreview ? (isEn ? 'Change Image' : 'Pilih Gambar Lain') : (isEn ? 'Browse File' : 'Cari File')}</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary flex-1"
                        disabled={!customBgPreview}
                        onClick={() => {
                          if (customBgPreview) {
                            setCustomBgImage(customBgPreview);
                            setIsCustomBgModalOpen(false);
                          }
                        }}
                      >
                        <Check size={15} />
                        <span>{isEn ? 'Apply to Canvas' : 'Pasang ke Kanvas'}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
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
