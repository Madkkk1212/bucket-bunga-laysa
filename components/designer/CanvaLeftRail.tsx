'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { consoleAudio } from '@/utils/consoleAudio';
import {
  PackageOpen,
  Flower2,
  Mail,
  Eye,
  Download,
  Flame,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowLeft,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CanvaLeftRailProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  onOpenGarden: () => void;
  onBackToDashboard?: () => void;
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
  stepContent: React.ReactNode;
  stepTitle: string;
}

const STEP_ITEMS = [
  { step: 1, label: 'Bucket', icon: PackageOpen },
  { step: 2, label: 'Bunga', icon: Flower2 },
  { step: 3, label: 'Kartu', icon: Mail },
  { step: 4, label: 'Pratinjau', icon: Eye },
  { step: 5, label: 'Unduh', icon: Download },
];

export default function CanvaLeftRail({
  currentStep,
  onStepClick,
  onOpenGarden,
  onBackToDashboard,
  isSidebarExpanded,
  onToggleSidebar,
  stepContent,
  stepTitle,
}: CanvaLeftRailProps) {
  const { t, isEn } = useLanguage();
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(consoleAudio.getMuted());
  }, []);

  const handleToggleMute = () => {
    const next = consoleAudio.toggleMute();
    setIsMuted(next);
  };

  const handleStepSelect = (step: number) => {
    consoleAudio.play('soft');
    onStepClick(step);
    if (!isSidebarExpanded) {
      onToggleSidebar();
    }
  };

  return (
    <div className="canva-sidebar-wrapper">
      {/* ── 1. NARROW ICON RAIL (68px) ── */}
      <nav className="canva-icon-rail" aria-label={isEn ? 'Canva Studio Navigation' : 'Navigasi Studio Canva'}>
        {/* Brand Icon */}
        <Link href="/" className="canva-rail-brand" title={isEn ? 'Laysa Bouquet Home' : 'Beranda Laysa Bouquet'}>
          <div className="canva-rail-brand-icon">
            <Sparkles size={16} className="text-pink-600" />
          </div>
        </Link>

        {onBackToDashboard && (
          <button
            type="button"
            onClick={() => {
              consoleAudio.play('soft');
              onBackToDashboard();
            }}
            className="canva-rail-btn text-slate-500 hover:text-slate-900"
            title={isEn ? 'Back to Main Menu' : 'Kembali ke Menu Utama'}
          >
            <ArrowLeft size={16} />
            <span className="canva-rail-btn-label">{isEn ? 'Menu' : 'Menu'}</span>
          </button>
        )}

        <div className="canva-rail-divider" />

        {/* Step Buttons */}
        <div className="canva-rail-steps">
          {STEP_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.step;
            const isDone = currentStep > item.step;
            const localizedLabel =
              item.step === 1
                ? t('step_1_short')
                : item.step === 2
                ? t('step_2_short')
                : item.step === 3
                ? t('step_3_short')
                : item.step === 4
                ? t('step_4_short')
                : t('step_5_short');

            return (
              <button
                key={item.step}
                type="button"
                onClick={() => handleStepSelect(item.step)}
                className={`canva-rail-btn ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                title={`${t('next')} ${item.step}: ${localizedLabel}`}
              >
                <div className="canva-rail-icon-wrap">
                  <Icon size={17} />
                  {isActive && <span className="canva-rail-active-dot" />}
                </div>
                <span className="canva-rail-btn-label">{localizedLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="canva-rail-divider" />

        {/* Bottom Utility Items */}
        <div className="canva-rail-bottom">
          {/* Garden Streak */}
          <button
            type="button"
            onClick={() => {
              consoleAudio.play('chime');
              onOpenGarden();
            }}
            className="canva-rail-btn text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            title={t('rail_kebun_title')}
          >
            <Flame size={16} />
            <span className="canva-rail-btn-label">{t('rail_kebun')}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            className="canva-rail-btn text-slate-500 hover:text-slate-800"
            title={
              isMuted
                ? (isEn ? 'Unmute Studio Audio' : 'Aktifkan Suara Studio')
                : (isEn ? 'Mute Studio Audio' : 'Matikan Suara Studio')
            }
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span className="canva-rail-btn-label">{isMuted ? t('rail_bisu') : t('rail_suara')}</span>
          </button>

          {/* Tutorial */}
          <Link
            href="/tutorial"
            className="canva-rail-btn text-slate-500 hover:text-slate-800"
            title={isEn ? 'Bouquet Arranging Tutorial' : 'Panduan Tutorial Merangkai Buket'}
          >
            <BookOpen size={16} />
            <span className="canva-rail-btn-label">{t('rail_panduan')}</span>
          </Link>
        </div>
      </nav>

      {/* ── 2. COLLAPSIBLE FLYOUT PANEL (370px) ── */}
      {isSidebarExpanded && (
        <aside className="canva-flyout-panel" aria-label={isEn ? 'Step Options Panel' : 'Panel Opsi Langkah'}>
          {/* Flyout Header */}
          <div className="canva-flyout-header">
            <h2 className="canva-flyout-title">{stepTitle}</h2>
            <button
              type="button"
              onClick={() => {
                consoleAudio.play('soft');
                onToggleSidebar();
              }}
              className="canva-flyout-collapse-btn"
              title={isEn ? 'Collapse Panel (Expand Canvas)' : 'Ciutkan Panel (Perluas Kanvas)'}
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Step Form Scrollable Content */}
          <div className="canva-flyout-content">{stepContent}</div>
        </aside>
      )}
    </div>
  );
}
