'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Search, ChevronDown, ChevronLeft, ChevronRight, X, Palette, Check } from 'lucide-react';
import { useDesign } from '../../context/DesignContext';
import { FLOWER_FAMILIES } from '../../data/flowers';
import { FlowerCategory, FlowerFamily, FlowerDef } from '../../types/design';
import NavigationButtons from '../designer/NavigationButtons';
import ModalPortal from '../ui/ModalPortal';

type CategoryFilter = 'all' | FlowerCategory;

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Semua Bunga' },
  { id: 'main', label: '🌹 Utama' },
  { id: 'filler', label: '✨ Filler' },
  { id: 'greenery', label: '🌿 Dedaunan' },
];

const ITEMS_PER_PAGE = 9; // Tepat 3 baris x 3 kolom = 9 jenis bunga

export default function StepFlowers() {
  const {
    addFlower,
    removeFlowerByType,
    getFlowerCount,
    getTotalFlowers,
    getMaxFlowers,
    setStep,
  } = useDesign();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeFamilyModal, setActiveFamilyModal] = useState<FlowerFamily | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  const total = getTotalFlowers();
  const max = getMaxFlowers();

  const handleCategoryChange = (tabId: CategoryFilter) => {
    setCategoryFilter(tabId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  // Filter flower families by category and search query
  const filteredFamilies = FLOWER_FAMILIES.filter((family) => {
    const matchesCategory = categoryFilter === 'all' || family.category === categoryFilter;
    const matchesSearch =
      family.name.toLowerCase().includes(search.toLowerCase()) ||
      (family.description && family.description.toLowerCase().includes(search.toLowerCase())) ||
      family.variants.some((v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        (v.colorName && v.colorName.toLowerCase().includes(search.toLowerCase()))
      );
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredFamilies.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedFamilies = filteredFamilies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Helper to count total flowers of a family in current bouquet
  const getFamilyTotalCount = (family: FlowerFamily) => {
    return family.variants.reduce((sum, v) => sum + getFlowerCount(v.id), 0);
  };

  const handleFlowerCardClick = (family: FlowerFamily) => {
    setActiveFamilyModal(family);
    setSelectedVariantId(family.defaultFlowerId || family.variants[0].id);
  };

  // Selected variant inside modal
  const currentVariant = activeFamilyModal
    ? activeFamilyModal.variants.find((v) => v.id === selectedVariantId) || activeFamilyModal.variants[0]
    : null;
  const currentVariantCount = currentVariant ? getFlowerCount(currentVariant.id) : 0;
  const isMaxed = total >= max;

  return (
    <div className="sf-root">
      {/* ── Top Filter Bar ── */}
      <div className="sf-filter-bar">
        {/* Category Pills */}
        <div className="sf-category-pills" role="tablist" aria-label="Filter kategori bunga">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={categoryFilter === tab.id}
              className={`sf-cat-pill ${categoryFilter === tab.id ? 'sf-cat-pill-active' : ''}`}
              onClick={() => handleCategoryChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Count badge */}
        <span className={`sf-count-badge ${total >= max ? 'sf-count-full' : ''}`}>
          {total}/{max} bunga
        </span>
      </div>

      {/* ── Search ── */}
      <div className="sf-search-wrap">
        <Search size={14} className="sf-search-icon" />
        <input
          id="flower-search"
          type="text"
          placeholder="Cari jenis bunga (cth: Mawar, Tulip, Krisan)..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="sf-search-input"
          aria-label="Cari jenis bunga"
        />
      </div>

      {/* ── Petunjuk Ringkas: Bunga Rapi & Bebas Menumpuk ── */}
      <div className="sf-hint-bar">
        <span>💡 Klik salah satu jenis bunga untuk melihat 1 foto dan menu warnanya</span>
      </div>

      {/* ── Flower Family Grid: 3 Baris x 3 Kolom (Tepat 9 Jenis Bunga) ── */}
      <div className="sf-flower-grid" role="list">
        {paginatedFamilies.map((family) => {
          const familyCount = getFamilyTotalCount(family);
          const hasMultipleColors = family.variants.length > 1;
          const displayVariant = family.variants[0];

          return (
            <div
              key={family.id}
              role="listitem"
              className={`sf-flower-card sf-family-card ${familyCount > 0 ? 'sf-flower-selected' : ''}`}
              onClick={() => handleFlowerCardClick(family)}
              title={`Klik untuk melihat varian warna ${family.name}`}
            >
              <div className="sf-flower-img-wrap">
                <Image
                  src={displayVariant.imageUrl}
                  alt={family.name}
                  width={64}
                  height={64}
                  className="sf-flower-img"
                  unoptimized
                />
                {familyCount > 0 && (
                  <span className="sf-count-chip" title={`${familyCount} bunga ${family.name} di buket`}>
                    {familyCount}
                  </span>
                )}
              </div>

              <div className="sf-family-info">
                <span className="sf-flower-name">{family.name}</span>

                {/* Indikator Warna */}
                {hasMultipleColors ? (
                  <div className="sf-colors-badge-wrap">
                    <span className="sf-colors-pill">
                      <Palette size={10} />
                      <span>{family.variants.length} Warna</span>
                    </span>
                    <div className="sf-color-dots-row">
                      {family.variants.slice(0, 4).map((v) => (
                        <span
                          key={v.id}
                          className="sf-mini-color-dot"
                          style={{ backgroundColor: v.color }}
                          title={v.colorName || v.name}
                        />
                      ))}
                      {family.variants.length > 4 && (
                        <span className="sf-mini-color-more">+{family.variants.length - 4}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="sf-single-color-label">
                    {displayVariant.colorName || '1 Warna'}
                  </span>
                )}
              </div>

              {/* Action Button: Buka Warna */}
              <div className="sf-family-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="sf-btn-choose-color"
                  onClick={() => handleFlowerCardClick(family)}
                  title={`Pilih warna ${family.name}`}
                >
                  <span>{hasMultipleColors ? 'Pilih Warna' : 'Pilih Bunga'}</span>
                  <Palette size={11} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredFamilies.length === 0 && (
          <p className="sf-no-results">Tidak ada jenis bunga yang cocok 🌾</p>
        )}
      </div>

      {/* ── Navigasi Halaman Bunga (Jika lebih dari 1 halaman) ── */}
      {totalPages > 1 && (
        <div className="sf-pagination-bar">
          <button
            type="button"
            className="sf-page-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            id="btn-flower-page-prev"
            aria-label="Halaman bunga sebelumnya"
          >
            <ChevronLeft size={13} />
            <span>Sebelumnya</span>
          </button>

          <div className="sf-page-dots" aria-label={`Halaman ${safePage} dari ${totalPages}`}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`sf-page-dot-btn ${p === safePage ? 'active' : ''}`}
                onClick={() => setCurrentPage(p)}
                aria-label={`Ke halaman bunga ${p}`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="sf-page-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            id="btn-flower-page-next"
            aria-label="Halaman bunga berikutnya"
          >
            <span>Berikutnya</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* Tombol pintasan langsung lihat hasil studio di bawah */}
      {total > 0 && (
        <div className="sf-view-studio-wrap">
          <a
            href="#studio-canvas-section"
            className="sf-view-studio-pill"
            id="btn-scroll-to-studio"
          >
            <span>🌸 Lihat Hasil Studio Rangkaian ({total} Bunga)</span>
            <ChevronDown size={14} />
          </a>
        </div>
      )}

      {/* Warning */}
      {total >= max && (
        <div className="sf-warning">
          ⚠️ Kapasitas maksimum ({max} bunga) tercapai
        </div>
      )}

      {/* Navigation */}
      <div className="sf-nav">
        <NavigationButtons
          currentStep={2}
          totalSteps={5}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          isNextDisabled={total === 0}
          nextLabel="Lanjut: Kartu Ucapan"
        />
      </div>

      {/* ─── MODAL POPUP: 1 FOTO TAMPIL + MENU WARNA-WARNA (BLURRED BACKDROP DENGAN PORTAL) ─── */}
      <ModalPortal
        isOpen={!!activeFamilyModal}
        onClose={() => setActiveFamilyModal(null)}
      >
        {activeFamilyModal && currentVariant && (
          <div
            className="flower-modal-backdrop"
            onClick={() => setActiveFamilyModal(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="flower-modal-title"
          >
            <div
              className="flower-modal-container flower-single-modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flower-modal-header">
                <div className="flower-modal-header-info">
                  <div className="flower-modal-title-row">
                    <span className="flower-modal-emoji">{activeFamilyModal.emoji}</span>
                    <h3 id="flower-modal-title" className="flower-modal-title">
                      {activeFamilyModal.name}
                    </h3>
                    <span className="flower-modal-family-tag">
                      {activeFamilyModal.variants.length > 1
                        ? `${activeFamilyModal.variants.length} Pilihan Warna`
                        : '1 Pilihan Warna'}
                    </span>
                  </div>
                  <p className="flower-modal-subtitle">
                    {activeFamilyModal.description || 'Pilih warna bunga favoritmu untuk buket'}
                  </p>
                </div>

                <button
                  type="button"
                  className="flower-modal-close-btn"
                  onClick={() => setActiveFamilyModal(null)}
                  aria-label="Tutup popup"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Bar */}
              <div className="flower-modal-status-bar">
                <span className="flower-modal-status-text">
                  Bunga {activeFamilyModal.name} di Buket: <strong>{getFamilyTotalCount(activeFamilyModal)} tangkai</strong>
                </span>
                <span className={`flower-modal-capacity ${total >= max ? 'full' : ''}`}>
                  Kapasitas: {total}/{max}
                </span>
              </div>

              {/* ─── 1 FOTO SAJA YANG TAMPIL DI TENGAH (BERUBAH SESUAI WARNA TERPILIH) ─── */}
              <div className="flower-single-hero">
                <div className="flower-hero-frame">
                  <Image
                    key={currentVariant.id}
                    src={currentVariant.imageUrl}
                    alt={currentVariant.name}
                    width={140}
                    height={140}
                    className="flower-hero-img"
                    unoptimized
                  />
                  {currentVariantCount > 0 && (
                    <span className="flower-hero-badge">
                      {currentVariantCount} di Buket
                    </span>
                  )}
                </div>

                <div className="flower-hero-meta">
                  <div className="flower-hero-color-row">
                    <span
                      className="flower-hero-dot"
                      style={{ backgroundColor: currentVariant.color }}
                    />
                    <span className="flower-hero-color-title">
                      {currentVariant.colorName || currentVariant.name}
                    </span>
                  </div>
                  {currentVariant.description && (
                    <p className="flower-hero-desc">{currentVariant.description}</p>
                  )}
                </div>

                {/* Stepper & Add Button untuk Warna Terpilih */}
                <div className="flower-hero-controls">
                  <div className="flower-hero-stepper-wrap">
                    <span className="flower-hero-stepper-lbl">Jumlah:</span>
                    <div className="flower-hero-stepper">
                      <button
                        type="button"
                        className="flower-hero-step-btn minus"
                        onClick={() => removeFlowerByType(currentVariant.id)}
                        disabled={currentVariantCount === 0}
                        aria-label="Kurangi 1 bunga ini"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="flower-hero-step-count">{currentVariantCount}</span>
                      <button
                        type="button"
                        className="flower-hero-step-btn plus"
                        onClick={() => addFlower(currentVariant)}
                        disabled={isMaxed}
                        aria-label="Tambah 1 bunga ini"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary flower-hero-quick-add"
                    onClick={() => addFlower(currentVariant)}
                    disabled={isMaxed}
                  >
                    <Plus size={14} />
                    <span>Tambah {currentVariant.colorName || currentVariant.name}</span>
                  </button>
                </div>
              </div>

              {/* ─── TAMPILAN MENU WARNA-WARNA (PALETTE SWATCHES) ─── */}
              {activeFamilyModal.variants.length > 1 && (
                <div className="flower-palette-wrap">
                  <div className="flower-palette-header">
                    <span className="flower-palette-title">
                      Pilih Warna Bunga ({activeFamilyModal.variants.length} Warna):
                    </span>
                    <span className="flower-palette-hint">
                      Klik warna untuk mengganti 1 foto di atas
                    </span>
                  </div>

                  <div className="flower-palette-grid">
                    {activeFamilyModal.variants.map((v) => {
                      const isSelected = v.id === currentVariant.id;
                      const vCount = getFlowerCount(v.id);

                      return (
                        <button
                          key={v.id}
                          type="button"
                          className={`flower-palette-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedVariantId(v.id)}
                        >
                          <span
                            className="flower-palette-circle"
                            style={{ backgroundColor: v.color }}
                          />
                          <span className="flower-palette-name">
                            {v.colorName || v.name}
                          </span>
                          {vCount > 0 && (
                            <span className="flower-palette-count-chip">
                              {vCount}
                            </span>
                          )}
                          {isSelected && (
                            <span className="flower-palette-check">
                              <Check size={11} strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ringkasan warna terpilih dalam buket */}
              {getFamilyTotalCount(activeFamilyModal) > 0 && (
                <div className="flower-summary-bar">
                  <span className="flower-summary-lbl">Terpasang di Buket:</span>
                  <div className="flower-summary-chips">
                    {activeFamilyModal.variants
                      .filter((v) => getFlowerCount(v.id) > 0)
                      .map((v) => (
                        <span key={v.id} className="flower-summary-chip">
                          <span
                            className="flower-summary-dot"
                            style={{ backgroundColor: v.color }}
                          />
                          <span>{v.colorName || v.name}: <strong>{getFlowerCount(v.id)}</strong></span>
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flower-modal-footer">
                <button
                  type="button"
                  className="btn btn-primary flower-modal-done-btn"
                  onClick={() => setActiveFamilyModal(null)}
                >
                  <Check size={16} />
                  <span>Selesai Memilih</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalPortal>
    </div>
  );
}
