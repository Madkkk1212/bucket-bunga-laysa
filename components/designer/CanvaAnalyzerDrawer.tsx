'use client';

import React from 'react';
import { useDesign } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';
import ConsoleRadarChart from './ConsoleRadarChart';
import { AestheticMetrics } from '@/utils/bouquetConsolePresets';
import { consoleAudio } from '@/utils/consoleAudio';
import {
  X,
  Sparkles,
  Crown,
  Gem,
  Info,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Tag,
} from 'lucide-react';

interface CanvaAnalyzerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: AestheticMetrics;
  onOpenVipModal: () => void;
  onOpenVipCard: () => void;
}

export default function CanvaAnalyzerDrawer({
  isOpen,
  onClose,
  metrics,
  onOpenVipModal,
  onOpenVipCard,
}: CanvaAnalyzerDrawerProps) {
  const { design, isPremiumUnlocked, premiumUserName } = useDesign();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const estimatedPrice = (45000 + design.selectedFlowers.length * 6000).toLocaleString('id-ID');

  return (
    <aside className="canva-analyzer-drawer" aria-label={t('analyzer_title_drawer')}>
      {/* Header */}
      <div className="canva-drawer-header">
        <div className="canva-drawer-title-group">
          <BarChart3 size={16} style={{ color: '#4f46e5' }} />
          <h2 className="canva-drawer-title">{t('analyzer_title_drawer')}</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            consoleAudio.play('soft');
            onClose();
          }}
          className="canva-drawer-close-btn"
          title={t('analyzer_close')}
        >
          <X size={16} />
        </button>
      </div>

      <div className="canva-drawer-body">
        {/* VIP Profile Card */}
        <div className="canva-profile-card">
          <div className="canva-profile-info">
            <div className="canva-profile-avatar">
              {isPremiumUnlocked ? (
                <Crown size={15} style={{ color: '#d97706' }} />
              ) : (
                <Sparkles size={15} style={{ color: '#94a3b8' }} />
              )}
            </div>
            <div className="canva-profile-texts">
              <p className="canva-profile-role">
                {isPremiumUnlocked ? 'VIP Member' : t('analyzer_guest_role')}
              </p>
              <p className="canva-profile-name">
                {isPremiumUnlocked ? premiumUserName || t('analyzer_active_member') : t('analyzer_guest_mode')}
              </p>
            </div>
          </div>

          {isPremiumUnlocked ? (
            <button
              type="button"
              onClick={onOpenVipCard}
              className="canva-vip-action-btn"
            >
              <span>{t('analyzer_vip_card_btn')}</span>
              <ChevronRight size={12} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenVipModal}
              className="canva-vip-action-btn"
            >
              <Gem size={11} />
              <span>{t('analyzer_open_vip_btn')}</span>
            </button>
          )}
        </div>

        {/* Radar Chart */}
        <div className="canva-chart-container">
          <ConsoleRadarChart metrics={metrics} targetCount={design.targetFlowerCount || 25} />
        </div>

        {/* Breakdown Items */}
        <div className="canva-metrics-list">
          <div className="canva-metric-item">
            <span className="canva-metric-label">
              <TrendingUp size={13} style={{ color: '#10b981' }} />
              <span>{t('analyzer_eval_label')}</span>
            </span>
            <span className="canva-metric-val">{metrics.ratingLabel}</span>
          </div>

          <div className="canva-metric-item">
            <span className="canva-metric-label">
              <Tag size={13} style={{ color: '#6366f1' }} />
              <span>{t('analyzer_price_label')}</span>
            </span>
            <span className="canva-metric-price">Rp {estimatedPrice}</span>
          </div>

          <div className="canva-metric-item">
            <span className="canva-metric-label">
              <Info size={13} style={{ color: '#94a3b8' }} />
              <span>{t('analyzer_cap_label')}</span>
            </span>
            <span className="canva-metric-val">
              {t('analyzer_stems_unit', { count: design.selectedFlowers.length, target: design.targetFlowerCount || 25 })}
            </span>
          </div>
        </div>

        {/* Design Advice Tip */}
        <div className="canva-tip-box">
          <p>{t('analyzer_tip')}</p>
        </div>
      </div>
    </aside>
  );
}
