'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS, Language, TranslationKey } from '@/utils/translations';
import { consoleAudio } from '@/utils/consoleAudio';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
  isId: boolean;
  isEn: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'laysa_bouquet_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && (saved === 'id' || saved === 'en')) {
        setLanguageState(saved);
      }
    } catch {
      // Ignore localStorage errors in private browsing
    }
    setHasMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    consoleAudio.play('soft');
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'id' ? 'en' : 'id');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>): string => {
      const dict = TRANSLATIONS[language] as Record<string, string>;
      const fallbackDict = TRANSLATIONS.id as Record<string, string>;
      let text = dict[key] ?? fallbackDict[key] ?? key;

      if (params) {
        Object.entries(params).forEach(([paramKey, val]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
        });
      }

      return text;
    },
    [language]
  );

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isId: language === 'id',
    isEn: language === 'en',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Graceful fallback if used outside provider
    return {
      language: 'id' as Language,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key: string, params?: Record<string, string | number>) => {
        let text = (TRANSLATIONS.id as Record<string, string>)[key] ?? key;
        if (params) {
          Object.entries(params).forEach(([paramKey, val]) => {
            text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
          });
        }
        return text;
      },
      isId: true,
      isEn: false,
    };
  }
  return ctx;
}
