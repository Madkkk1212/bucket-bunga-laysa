'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Search } from 'lucide-react';
import { useDesign } from '../../context/DesignContext';
import { FLOWERS, FLOWER_CATEGORY_LABELS } from '../../data/flowers';
import { FlowerCategory } from '../../types/design';
import NavigationButtons from '../designer/NavigationButtons';

type CategoryFilter = 'all' | FlowerCategory;

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'main', label: '🌹 Utama' },
  { id: 'filler', label: '✨ Filler' },
  { id: 'greenery', label: '🌿 Daun' },
];

export default function StepFlowers() {
  const {
    addFlower, removeFlowerByType, getFlowerCount,
    getTotalFlowers, getMaxFlowers, setStep,
  } = useDesign();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const total = getTotalFlowers();
  const max = getMaxFlowers();

  const filtered = FLOWERS.filter((f) => {
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
              onClick={() => setCategoryFilter(tab.id)}
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
          onChange={(e) => setSearch(e.target.value)}
          className="sf-search-input"
          aria-label="Cari bunga"
        />
      </div>

      {/* ── Flower Grid ── */}
      <div className="sf-flower-grid" role="list">
        {filtered.map((flower) => {
          const count = getFlowerCount(flower.id);
          const isMaxed = total >= max;
          return (
            <div
              key={flower.id}
              role="listitem"
              className={`sf-flower-card ${count > 0 ? 'sf-flower-selected' : ''}`}
              title={flower.description || flower.name}
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

              <span className={`sf-cat-tag cat-${flower.category}`}>
                {FLOWER_CATEGORY_LABELS[flower.category] || flower.category}
              </span>
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
