'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { GiftObjectId } from '@/types/giftConfig';

interface GiftObjectSelectorProps {
  selectedObjectId: GiftObjectId;
  onSelect: (id: GiftObjectId) => void;
  canUseAllObjects?: boolean;
  onUpgradeClick?: () => void;
  isEn?: boolean;
}

const OBJECTS: Array<{
  id: GiftObjectId;
  nameId: string;
  nameEn: string;
  icon: string;
  descId: string;
  descEn: string;
}> = [
  {
    id: 'envelope',
    nameId: 'Amplop Surat',
    nameEn: 'Letter Envelope',
    icon: '💌',
    descId: 'Segel lilin merah muda klasik',
    descEn: 'Classic wax seal envelope',
  },
  {
    id: 'gift-box',
    nameId: 'Kotak Kado',
    nameEn: 'Gift Box',
    icon: '🎁',
    descId: 'Pita emas dengan kilau partikel',
    descEn: 'Golden ribbon with sparkle lid',
  },
  {
    id: 'music-box',
    nameId: 'Kotak Musik',
    nameEn: 'Music Box',
    icon: '🎶',
    descId: 'Balerin mungil yang berputar',
    descEn: 'Charming spinning ballerina',
  },
  {
    id: 'balloon',
    nameId: 'Balon Kejutan',
    nameEn: 'Balloon Cluster',
    icon: '🎈',
    descId: 'Tiga balon melayang ceria',
    descEn: 'Floating pastel balloons',
  },
  {
    id: 'jar',
    nameId: 'Toples Kenangan',
    nameEn: 'Memory Jar',
    icon: '🫙',
    descId: 'Toples kaca bintang origami',
    descEn: 'Glass jar with origami stars',
  },
  {
    id: 'book',
    nameId: 'Buku Cerita',
    nameEn: 'Story Book',
    icon: '📖',
    descId: 'Halaman terbuka penuh kenangan',
    descEn: 'Storybook unfolding petals',
  },
];

export default function GiftObjectSelector({
  selectedObjectId,
  onSelect,
  canUseAllObjects = true,
  onUpgradeClick,
  isEn = false,
}: GiftObjectSelectorProps) {
  return (
    <div className="gift-object-selector">
      <div className="gift-section-header">
        <label className="gift-section-title">
          {isEn ? 'Opening Gift Object' : 'Objek Pembuka Kado'}
        </label>
      </div>

      <div className="gift-selector-grid">
        {OBJECTS.map((obj) => {
          const isSelected = selectedObjectId === obj.id;
          const isLocked = !canUseAllObjects && obj.id !== 'envelope';

          return (
            <button
              key={obj.id}
              type="button"
              title={isEn ? obj.descEn : obj.descId}
              onClick={() => {
                if (isLocked) {
                  if (onUpgradeClick) onUpgradeClick();
                } else {
                  onSelect(obj.id);
                }
              }}
              className={`gift-selector-btn ${isSelected ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
            >
              <span className="gift-selector-emoji">{obj.icon}</span>
              <span className="gift-selector-name">
                {isEn ? obj.nameEn : obj.nameId}
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
