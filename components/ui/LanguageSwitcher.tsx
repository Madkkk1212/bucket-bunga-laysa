'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'standard' | 'compact';
  className?: string;
}

export default function LanguageSwitcher({
  variant = 'standard',
  className = '',
}: LanguageSwitcherProps) {
  const { language, setLanguage, isId, isEn } = useLanguage();

  if (variant === 'compact') {
    return (
      <div className={`lang-switcher-compact ${className}`} role="group" aria-label="Pilih Bahasa / Select Language">
        <button
          type="button"
          onClick={() => setLanguage('id')}
          className={`lang-btn-mini ${isId ? 'active' : ''}`}
          title="Bahasa Indonesia"
          aria-pressed={isId}
        >
          <span>ID</span>
        </button>
        <span className="lang-mini-divider">/</span>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`lang-btn-mini ${isEn ? 'active' : ''}`}
          title="English"
          aria-pressed={isEn}
        >
          <span>EN</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`lang-switcher-pill ${className}`} role="group" aria-label="Pilih Bahasa / Select Language">
      <Globe size={13} className="lang-icon" />
      <button
        type="button"
        onClick={() => setLanguage('id')}
        className={`lang-toggle-btn ${isId ? 'active' : ''}`}
        title="Beralih ke Bahasa Indonesia"
        aria-pressed={isId}
      >
        <span className="lang-flag">🇮🇩</span>
        <span className="lang-text">ID</span>
      </button>

      <span className="lang-divider" />

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`lang-toggle-btn ${isEn ? 'active' : ''}`}
        title="Switch to English"
        aria-pressed={isEn}
      >
        <span className="lang-flag">🇬🇧</span>
        <span className="lang-text">EN</span>
      </button>
    </div>
  );
}
