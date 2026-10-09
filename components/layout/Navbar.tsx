'use client';

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
