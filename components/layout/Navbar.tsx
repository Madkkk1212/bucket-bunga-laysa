'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flower, ArrowLeft, BookOpen, Crown } from 'lucide-react';
import { useOptionalDesign } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const designCtx = useOptionalDesign();
  const isPremium = designCtx?.isPremiumUnlocked;
  const userName = designCtx?.premiumUserName;
  const { t } = useLanguage();

  // ── Stealth Owner Gateway Shortcut ──
  // Akses mudah bagi pemilik tanpa diketahui pengunjung publik:
  // 1. Tekan kombinasi keyboard Ctrl + Shift + A (atau Cmd + Shift + A)
  // 2. Ketuk/klik logo bunga 5x dengan cepat
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretBrandClick = (e: React.MouseEvent) => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1500);

    if (clickCountRef.current >= 5) {
      e.preventDefault();
      clickCountRef.current = 0;
      window.location.href = '/lys-atelier-vault-89x';
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.location.href = '/lys-atelier-vault-89x';
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <nav className="navbar navbar-centered">
      <div className="navbar-inner-centered" style={{ position: 'relative' }}>
        {!isHome && (
          <Link
            href="/"
            className="navbar-sub-nav-btn navbar-nav-left"
            aria-label={t('nav_home')}
            id="nav-btn-home"
          >
            <ArrowLeft size={15} />
            <span>{t('nav_home')}</span>
          </Link>
        )}

        <Link
          href="/"
          onClick={handleSecretBrandClick}
          className="navbar-brand-centered"
          aria-label="Bucket Bunga Laysa Home"
        >
          <span className="navbar-brand-icon-wrap">
            <Flower size={20} className="navbar-brand-icon" />
          </span>
          <span className="navbar-brand-text">
            <span className="brand-title">Bucket Bunga</span>
            <span className="brand-accent">Laysa</span>
            {isPremium && (
              <span className="navbar-vip-pill" title={t('nav_vip_account')}>
                <Crown size={12} className="text-amber-300" />
                <span>VIP{userName ? ` • ${userName.split(' ')[0]}` : ''}</span>
              </span>
            )}
          </span>
        </Link>

        <div className="navbar-right-cluster" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isHome && pathname !== '/tutorial' && (
            <Link
              href="/tutorial"
              className="navbar-sub-nav-btn navbar-nav-right"
              aria-label={t('nav_tutorial')}
              id="nav-btn-tutorial"
            >
              <BookOpen size={15} />
              <span>{t('nav_tutorial')}</span>
            </Link>
          )}
          <LanguageSwitcher variant="compact" />
        </div>
      </div>
    </nav>
  );
}
