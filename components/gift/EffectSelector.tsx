'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { GiftEffectId } from '@/types/giftConfig';

interface EffectSelectorProps {
  selectedEffectId: GiftEffectId;
  onSelect: (id: GiftEffectId) => void;
  canUseAllEffects?: boolean;
  onUpgradeClick?: () => void;
  isEn?: boolean;
}

const EFFECTS: Array<{
  id: GiftEffectId;
  nameId: string;
  nameEn: string;
  icon: string;
  descId: string;
  descEn: string;
}> = [
  {
    id: 'petals',
    nameId: 'Kelopak Jatuh',
    nameEn: 'Falling Petals',
    icon: '🌸',
    descId: 'Kelopak mawar berguguran lembut',
    descEn: 'Soft falling rose petals',
  },
  {
    id: 'flowers',
    nameId: 'Bunga Mekar',
    nameEn: 'Blooming Flowers',
    icon: '💐',
    descId: 'Bunga-bunga bermekaran di layar',
    descEn: 'Flowers blooming on screen',
  },
  {
    id: 'butterflies',
    nameId: 'Kupu-kupu',
    nameEn: 'Butterflies',
    icon: '🦋',
    descId: 'Kupu-kupu beterbangan anggun',
    descEn: 'Graceful flying butterflies',
  },
  {
    id: 'hearts',
    nameId: 'Hujan Hati',
    nameEn: 'Love Hearts',
    icon: '💖',
    descId: 'Partikel hati melayang romantis',
    descEn: 'Romantic floating love hearts',
  },
  {
    id: 'stars',
    nameId: 'Bintang Kilap',
    nameEn: 'Sparkling Stars',
    icon: '✨',
    descId: 'Kilauan cahaya bintang keemasan',
    descEn: 'Golden sparkling starlight',
  },
  {
    id: 'confetti',
    nameId: 'Pesta Konfeti',
    nameEn: 'Party Confetti',
    icon: '🎉',
    descId: 'Ledakan konfeti warna-warni ceria',
    descEn: 'Celebratory colorful burst',
  },
  {
    id: 'roses',
    nameId: 'Hujan Mawar',
    nameEn: 'Rose Shower',
    icon: '🌹',
    descId: 'Kelopak mawar & emas berjatuhan mewah',
    descEn: 'Luxurious falling rose petals & gold',
  },
];


export default function EffectSelector({
  selectedEffectId,
  onSelect,
  canUseAllEffects = true,
  onUpgradeClick,
  isEn = false,
}: EffectSelectorProps) {
  return (
    <div className="gift-effect-selector">
      <div className="gift-section-header">
        <label className="gift-section-title">
          {isEn ? 'Opening Fullscreen Effect' : 'Efek Animasi Pembuka'}
        </label>
      </div>

      <div className="gift-selector-grid">
        {EFFECTS.map((eff) => {
          const isSelected = selectedEffectId === eff.id;
          const isLocked = !canUseAllEffects && eff.id !== 'petals';

          return (
            <button
              key={eff.id}
              type="button"
              title={isEn ? eff.descEn : eff.descId}
              onClick={() => {
                if (isLocked) {
                  if (onUpgradeClick) onUpgradeClick();
                } else {
                  onSelect(eff.id);
                }
              }}
              className={`gift-selector-btn ${isSelected ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
            >
              <span className="gift-selector-emoji">{eff.icon}</span>
              <span className="gift-selector-name">
                {isEn ? eff.nameEn : eff.nameId}
              </span>
              {isSelected ? (
                <span className="gift-selector-check">
                  <Check size={10} strokeWidth={3} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
