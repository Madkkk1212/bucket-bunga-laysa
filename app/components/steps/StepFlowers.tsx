'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDesign } from '../../context/DesignContext';
import { FLOWERS } from '../../data/flowers';
import { FlowerCategory } from '../../types/design';
import NavigationButtons from '../designer/NavigationButtons';

type CategoryFilter = 'all' | FlowerCategory;

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'main', label: '🌹 Utama' },
  { id: 'filler', label: '✨ Filler' },
  { id: 'greenery', label: '🌿 Daun' },
];

const ITEMS_PER_PAGE = 9; // Tepat 3 baris x 3 kolom = 9 bunga

export default function StepFlowers() {
  const {
    addFlower, removeFlowerByType, getFlowerCount,
    getTotalFlowers, getMaxFlowers, setStep,
  } = useDesign();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

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

  const filtered = FLOWERS.filter((f) => {
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedFlowers = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
          placeholder="Cari bunga..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="sf-search-input"
          aria-label="Cari bunga"
        />
      </div>

      {/* ── Flower Grid: 3 Baris x 3 Kolom (Tepat 9 Bunga) ── */}
      <div className="sf-flower-grid" role="list">
        {paginatedFlowers.map((flower) => {
          const count = getFlowerCount(flower.id);
          const isMaxed = total >= max;
          return (
            <div
              key={flower.id}
              role="listitem"
              className={`sf-flower-card ${count > 0 ? 'sf-flower-selected' : ''}`}
              title={flower.name}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  'application/flower',
                  JSON.stringify({
                    id: flower.id,
                    name: flower.name,
                    imageUrl: flower.imageUrl,
                    category: flower.category,
                    emoji: flower.emoji,
                    color: flower.color,
                  })
                );
                e.dataTransfer.effectAllowed = 'copy';
              }}
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
                {count > 0 && (
                  <span className="sf-count-chip">{count}</span>
                )}
              </div>

              <span className="sf-flower-name">{flower.name}</span>

              <div className="sf-flower-btns">
                <button
                  type="button"
                  className="sf-btn sf-btn-remove"
                  onClick={() => removeFlowerByType(flower.id)}
                  disabled={count === 0}
                  aria-label={`Kurangi ${flower.name}`}
                >
                  <Minus size={11} />
                </button>
                <button
                  type="button"
                  className="sf-btn sf-btn-add"
                  onClick={() => addFlower(flower)}
                  disabled={isMaxed}
                  aria-label={`Tambah ${flower.name}`}
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="sf-no-results">Tidak ada bunga yang cocok 🌾</p>
        )}
      </div>

      {/* ── Navigasi Halaman Bunga (Jika lebih dari 3 baris) ── */}
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
    </div>
  );
}
