'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flower, ArrowLeft, BookOpen, Crown, Gamepad2, Sparkles } from 'lucide-react';
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
      {/* ── DESKTOP NAVIGATION BAR (>= 768px) ── */}
      <div className="navbar-inner-centered navbar-desktop-only">
        {/* SISI KIRI: LINK NAVIGASI / TOMBOL KEMBALI */}
        <div className="navbar-left-cluster">
          {!isHome ? (
            <Link
              href="/"
              className="navbar-sub-nav-btn navbar-nav-left"
              aria-label={t('nav_home')}
              title={t('nav_home')}
              id="nav-btn-home"
            >
              <ArrowLeft size={16} />
              <span className="nav-btn-text">{t('nav_home')}</span>
            </Link>
          ) : (
            <div className="navbar-nav-links flex items-center gap-2">
              <Link
                href="/minigames"
                className="navbar-sub-nav-btn"
                title={t('nav_minigames')}
                id="nav-btn-minigames-desktop"
              >
                <Gamepad2 size={15} className="text-rose-600" />
                <span>{t('nav_minigames')}</span>
              </Link>
              <Link
                href="/tutorial"
                className="navbar-sub-nav-btn"
                title={t('nav_tutorial')}
                id="nav-btn-tutorial-desktop"
              >
                <BookOpen size={15} className="text-rose-600" />
                <span>{t('nav_tutorial')}</span>
              </Link>
            </div>
          )}
        </div>

        {/* TENGAH: LOGO BRAND UTAMA */}
        <Link
          href="/"
          className="navbar-brand-centered"
          aria-label="Bucket Bunga Laysa Home"
        >
          <span className="navbar-brand-icon-wrap">
            <Flower size={18} className="navbar-brand-icon" />
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

        {/* SISI KANAN: CTA & GANTI BAHASA */}
        <div className="navbar-right-cluster">
          {isHome ? (
            <Link
              href="/menu"
              className="navbar-sub-nav-btn navbar-cta-nav"
              title="Buat Buket"
              id="nav-btn-create-desktop"
            >
              <Sparkles size={14} className="text-rose-500" />
              <span>Buat Buket</span>
            </Link>
          ) : pathname !== '/tutorial' ? (
            <Link
              href="/tutorial"
              className="navbar-sub-nav-btn navbar-nav-right nav-tutorial-desktop"
              aria-label={t('nav_tutorial')}
              title={t('nav_tutorial')}
              id="nav-btn-tutorial-desktop-alt"
            >
              <BookOpen size={15} />
              <span className="nav-btn-text">{t('nav_tutorial')}</span>
            </Link>
          ) : null}
          <LanguageSwitcher variant="compact" />
        </div>
      </div>

      {/* ── MOBILE 2-ROW NAVIGATION BAR (< 768px) ── */}
      <div className="navbar-mobile-wrapper">
        {/* BARIS 1: LOGO DI TENGAH + SWITCH BAHASA DI KANAN */}
        <div className="navbar-mobile-row-top">
          {!isHome ? (
            <Link
              href="/"
              className="navbar-mobile-back-btn"
              aria-label={t('nav_home')}
              title={t('nav_home')}
            >
              <ArrowLeft size={16} />
            </Link>
          ) : (
            <div className="navbar-mobile-spacer" />
          )}

          <Link
            href="/"
            className="navbar-brand-centered navbar-brand-mobile"
            aria-label="Bucket Bunga Laysa Home"
          >
            <span className="navbar-brand-icon-wrap">
              <Flower size={16} className="navbar-brand-icon" />
            </span>
            <span className="navbar-brand-text">
              <span className="brand-title">Bucket Bunga</span>
              <span className="brand-accent">Laysa</span>
              {isPremium && (
                <span className="navbar-vip-pill" title={t('nav_vip_account')}>
                  <Crown size={11} className="text-amber-300" />
                  <span>VIP</span>
                </span>
              )}
            </span>
          </Link>

          <div className="navbar-mobile-lang-wrap">
            <LanguageSwitcher variant="compact" />
          </div>
        </div>

        {/* BARIS 2: MENU RINGKAS (MINI GAMES, TUTORIAL, BUAT BUKET) */}
        <div className="navbar-mobile-row-bottom">
          <Link
            href="/minigames"
            className={`navbar-mobile-pill-btn ${pathname === '/minigames' ? 'active' : ''}`}
            id="mobile-nav-minigames"
          >
            <Gamepad2 size={13} className="text-rose-600 shrink-0" />
            <span>Mini Games</span>
          </Link>

          <Link
            href="/tutorial"
            className={`navbar-mobile-pill-btn ${pathname === '/tutorial' ? 'active' : ''}`}
            id="mobile-nav-tutorial"
          >
            <BookOpen size={13} className="text-rose-600 shrink-0" />
            <span>Tutorial</span>
          </Link>

          <Link
            href="/menu"
            className={`navbar-mobile-pill-btn navbar-mobile-pill-cta ${pathname === '/menu' || pathname === '/designer' ? 'active' : ''}`}
            id="mobile-nav-create"
          >
            <Sparkles size={13} className="text-amber-400 shrink-0" />
            <span>Buat Buket</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
