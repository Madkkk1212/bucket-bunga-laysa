'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Search, ChevronDown, ChevronLeft, ChevronRight, Crown, Lock } from 'lucide-react';
import { useDesign } from '@/context/DesignContext';
import { FLOWERS } from '@/data/flowers';
import { FlowerCategory } from '@/types/design';
import NavigationButtons from '../designer/NavigationButtons';
import PremiumUnlockModal from '../designer/PremiumUnlockModal';

type CategoryFilter = 'all' | FlowerCategory;

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Semua Bunga' },
  { id: 'main', label: '🌹 Utama' },
  { id: 'filler', label: '✨ Filler' },
  { id: 'greenery', label: '🌿 Dedaunan' },
];

const ITEMS_PER_PAGE = 9; // 3 baris x 3 kolom = 9 bunga per halaman

export default function StepFlowers() {
  const {
    addFlower,
    removeFlowerByType,
    getFlowerCount,
    getTotalFlowers,
    getMaxFlowers,
    setStep,
    isPremiumUnlocked,
  } = useDesign();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [premiumModalItem, setPremiumModalItem] = useState<string | null>(null);

  const total = getTotalFlowers();
  const max = getMaxFlowers();
  const isMaxed = total >= max;

  const handleCategoryChange = (tabId: CategoryFilter) => {
    setCategoryFilter(tabId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  // Filter flowers directly by category and search query
  const filteredFlowers = FLOWERS.filter((flower) => {
    const matchesCategory = categoryFilter === 'all' || flower.category === categoryFilter;
    const matchesSearch =
      flower.name.toLowerCase().includes(search.toLowerCase()) ||
      (flower.description && flower.description.toLowerCase().includes(search.toLowerCase())) ||
      (flower.colorName && flower.colorName.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredFlowers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedFlowers = filteredFlowers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

      {/* ── Petunjuk Ringkas ── */}
      <div className="sf-hint-bar">
        <span>💡 Pilih bunga favoritmu untuk langsung ditambahkan ke dalam buket</span>
      </div>

      {/* ── Flower Grid: 3 Baris x 3 Kolom (Tepat 9 Bunga per Halaman) ── */}
      <div className="sf-flower-grid" role="list">
        {paginatedFlowers.map((flower) => {
          const count = getFlowerCount(flower.id);
          const isLocked = Boolean(flower.isPremium && !isPremiumUnlocked);

          return (
            <div
              key={flower.id}
              role="listitem"
              className={`sf-flower-card ${count > 0 ? 'sf-flower-selected' : ''} ${isLocked ? 'sf-card-locked' : ''}`}
              onClick={() => {
                if (isLocked) {
                  setPremiumModalItem(flower.name);
                  return;
                }
                if (!isMaxed) {
                  addFlower(flower);
                }
              }}
              title={
                isLocked
                  ? `Item VIP Eksklusif: Klik untuk membuka ${flower.name}`
                  : isMaxed
                  ? 'Buket sudah penuh'
                  : `Klik untuk menambahkan ${flower.name}`
              }
            >
              <div className="sf-flower-img-wrap">
                <Image
                  src={flower.imageUrl}
                  alt={flower.name}
                  width={64}
                  height={64}
                  className="sf-flower-img"
                  unoptimized
                />
                {isLocked && (
                  <span className="sf-flower-vip-badge" title="Koleksi VIP Terkunci">
                    <Crown size={11} className="text-amber-500" />
                    <span>VIP</span>
                  </span>
                )}
                {count > 0 && (
                  <span className="sf-count-chip" title={`${count} bunga ${flower.name} di buket`}>
                    {count}
                  </span>
                )}
              </div>

              <span className="sf-flower-name flex items-center justify-center gap-1">
                {isLocked && <Lock size={11} className="text-amber-600 shrink-0" />}
                <span>{flower.name}</span>
              </span>

              {/* Action Buttons: Plus/Minus or Tambah */}
              <div className="sf-flower-btns" onClick={(e) => e.stopPropagation()}>
                {isLocked ? (
                  <button
                    type="button"
                    className="sf-btn sf-btn-locked"
                    onClick={() => setPremiumModalItem(flower.name)}
                    title="Buka Kunci Akses VIP"
                  >
                    <Crown size={12} className="text-amber-500" />
                    <span className="sf-btn-text">Buka VIP</span>
                  </button>
                ) : count > 0 ? (
                  <>
                    <button
                      type="button"
                      className="sf-btn sf-btn-minus"
                      onClick={() => removeFlowerByType(flower.id)}
                      title={`Kurangi 1 ${flower.name}`}
                      aria-label={`Kurangi 1 ${flower.name}`}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="sf-flower-card-count">{count}</span>
                    <button
                      type="button"
                      className="sf-btn sf-btn-plus"
                      onClick={() => addFlower(flower)}
                      disabled={isMaxed}
                      title={isMaxed ? 'Buket sudah penuh' : `Tambah 1 ${flower.name}`}
                      aria-label={`Tambah 1 ${flower.name}`}
                    >
                      <Plus size={13} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="sf-btn sf-btn-add"
                    onClick={() => addFlower(flower)}
                    disabled={isMaxed}
                    title={isMaxed ? 'Buket sudah penuh' : `Tambah 1 ${flower.name}`}
                  >
                    <Plus size={13} />
                    <span className="sf-btn-text">Tambah</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredFlowers.length === 0 && (
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

      {/* Modal Buka Akses VIP */}
      <PremiumUnlockModal
        isOpen={Boolean(premiumModalItem)}
        onClose={() => setPremiumModalItem(null)}
        itemName={premiumModalItem || undefined}
        itemType="bunga"
      />
    </div>
  );
}
