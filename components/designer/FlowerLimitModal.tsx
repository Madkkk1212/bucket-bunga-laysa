'use client';

import React from 'react';
import { AlertCircle, Sparkles, ChevronRight, X } from 'lucide-react';
import ModalPortal from '../ui/ModalPortal';
import { consoleAudio } from '@/utils/consoleAudio';
import { useLanguage } from '@/context/LanguageContext';

interface FlowerLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCountModal: () => void;
  currentCount: number;
  maxLimit: number;
}

export default function FlowerLimitModal({
  isOpen,
  onClose,
  onOpenCountModal,
  currentCount,
  maxLimit,
}: FlowerLimitModalProps) {
  const { t } = useLanguage();
  const handleUpgrade = () => {
    consoleAudio.play('soft');
    onClose();
    onOpenCountModal();
  };

  const handleDismiss = () => {
    consoleAudio.play('soft');
    onClose();
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={handleDismiss}>
      <div className="flower-limit-modal-backdrop" onClick={handleDismiss}>
        <div
          className="flower-limit-modal-card"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="flower-limit-title"
        >
          {/* Close button */}
          <button
            type="button"
            className="flower-limit-close-btn"
            onClick={handleDismiss}
            title="Tutup dialog"
          >
            <X size={16} />
          </button>

          {/* Header with Icon */}
          <div className="flower-limit-header">
            <div className="flower-limit-icon-circle">
              <span className="flower-limit-icon-emoji">💐</span>
              <div className="flower-limit-icon-badge">
                <AlertCircle size={14} />
              </div>
            </div>
            <h2 id="flower-limit-title" className="flower-limit-title">
              {t('limit_modal_title')}
            </h2>
            <p className="flower-limit-desc">
              {t('limit_modal_desc', { count: maxLimit })}
            </p>
          </div>

          {/* Capacity Status Box */}
          <div className="flower-limit-status-box">
            <div className="flower-limit-status-row">
              <span className="flower-limit-status-label">Kapasitas Saat Ini</span>
              <span className="flower-limit-status-badge">100% Penuh</span>
            </div>

            <div className="flower-limit-progress-track">
              <div className="flower-limit-progress-fill" style={{ width: '100%' }} />
            </div>

            <div className="flower-limit-status-details">
              <span>🌸 Terangkai: <strong>{currentCount} tangkai</strong></span>
              <span>Batas: <strong>{maxLimit} tangkai</strong></span>
            </div>
          </div>

          {/* Tip Box */}
          <div className="flower-limit-tip-box">
            <p>
              💡 <strong>Ingin merangkai lebih banyak?</strong> Anda dapat menambah kuota bunga
              hingga <strong>50 tangkai</strong> tanpa kehilangan susunan bunga yang sudah ada, atau
              hapus beberapa bunga dari kanvas.
            </p>
          </div>

          {/* Actions */}
          <div className="flower-limit-actions">
            <button
              type="button"
              className="flower-limit-btn-upgrade"
              onClick={handleUpgrade}
            >
              <Sparkles size={16} />
              <span>{t('limit_modal_btn_upgrade')}</span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className="flower-limit-btn-dismiss"
              onClick={handleDismiss}
            >
              {t('limit_modal_btn_dismiss')}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
