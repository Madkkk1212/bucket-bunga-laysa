'use client';

import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey, TRANSLATIONS } from '@/utils/translations';

interface ClientTranslationProps {
  k: TranslationKey;
  fallback?: string;
}

export default function ClientTranslation({ k, fallback }: ClientTranslationProps) {
  const { t } = useLanguage();
  const text = t(k);
  if (!text || text === k) {
    return <>{fallback ?? (TRANSLATIONS.id as Record<string, string>)[k] ?? k}</>;
  }
  return <>{text}</>;
}
