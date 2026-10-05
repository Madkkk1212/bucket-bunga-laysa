'use client';

import React from 'react';
import { Sparkles, Lock, Check } from 'lucide-react';
import { GIFT_TEMPLATES } from './templates';
import type { GiftTemplateId } from '@/types/giftConfig';

interface TemplateSelectorProps {
  selectedTemplateId: GiftTemplateId;
  onSelect: (templateId: GiftTemplateId) => void;
  allowedTemplates?: GiftTemplateId[] | 'all';
  onUpgradeClick?: () => void;
  isEn?: boolean;
}

export default function TemplateSelector({
  selectedTemplateId,
  onSelect,
  allowedTemplates = ['klasik', 'taman-mekar'],
  onUpgradeClick,
  isEn = false,
}: TemplateSelectorProps) {
  const templates = Object.values(GIFT_TEMPLATES);

  const isTemplateAllowed = (id: GiftTemplateId) => {
    if (allowedTemplates === 'all') return true;
    return Array.isArray(allowedTemplates) && allowedTemplates.includes(id);
  };

  return (
    <div className="gift-template-selector">
      <div className="gift-section-header">
        <label className="gift-section-title">
          {isEn ? 'Gift Theme & Template' : 'Pilihan Template & Tema'}
        </label>
      </div>

      <div className="gift-template-grid">
        {templates.map((tmpl) => {
          const isSelected = selectedTemplateId === tmpl.id;
          const allowed = isTemplateAllowed(tmpl.id);

          return (
            <button
              type="button"
              key={tmpl.id}
              onClick={() => {
                if (allowed) {
                  onSelect(tmpl.id);
                } else if (onUpgradeClick) {
                  onUpgradeClick();
                }
              }}
              className={`gift-template-card ${isSelected ? 'active' : ''} ${!allowed ? 'locked' : ''}`}
              aria-pressed={isSelected}
              aria-label={`${isEn ? tmpl.nameEn : tmpl.name}${tmpl.requiresPhoto ? (isEn ? ', add a photo' : ', perlu foto') : ''}${!allowed ? (isEn ? ', premium' : ', VIP') : ''}`}
            >
              {/* Top Banner Palette */}
              <div
                className="gift-template-palette-bar"
                style={{ background: tmpl.bgStyle }}
              >
                {/* Dots showing primary & accent colors */}
                <div className="gift-template-dots">
                  <span
                    className="gift-template-dot"
                    style={{ backgroundColor: tmpl.colors.primary }}
                  />
                  <span
                    className="gift-template-dot"
                    style={{ backgroundColor: tmpl.colors.accent }}
                  />
                  {tmpl.colors.extra && Object.values(tmpl.colors.extra)[0] && (
                    <span
                      className="gift-template-dot"
                      style={{ backgroundColor: Object.values(tmpl.colors.extra)[0] }}
                    />
                  )}
                </div>

                {/* Badge: Free vs VIP */}
                {tmpl.isFree ? (
                  <span className="gift-template-badge-free">
                    FREE
                  </span>
                ) : (
                  <span className="gift-template-badge-vip">
                    <Sparkles size={9} />
                    <span>VIP</span>
                  </span>
                )}
              </div>

              {/* Title & Status */}
              <div className="gift-template-card-header">
                <span className="gift-template-title-text">
                  {isEn ? tmpl.nameEn : tmpl.name}
                </span>

                <div className="gift-template-status-icons">
                  {isSelected && (
                    <span className="gift-template-check-icon">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                  {!allowed && (
                    <span className="gift-template-lock-icon">
                      <Lock size={11} />
                    </span>
                  )}
                </div>
              </div>
              {tmpl.requiresPhoto && (
                <span className="gift-template-photo-required">
                  {isEn ? 'Landing page · add a photo' : 'Landing page · tambah foto'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
