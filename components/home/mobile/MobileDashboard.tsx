'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  ChevronDown,
  Flower2,
  Package,
  Mail,
  SlidersHorizontal,
  Palette,
  Sparkles,
  MessageCircle,
  Download,
  X,
  ArrowRight,
  Home,
  Share2,
  Crown,
} from 'lucide-react';
import { useDesign } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';
import { getBucketSize } from '@/data/buckets';
import { FlowerCountVariant } from '@/types/design';
import PreviewCanvas from '@/components/designer/PreviewCanvas';
import FlowerCountModal from '@/components/designer/FlowerCountModal';
import PremiumUnlockModal from '@/components/designer/PremiumUnlockModal';
import VipCardModal from '@/components/designer/VipCardModal';
import MobileFlowerPickerModal from './MobileFlowerPickerModal';
import MobileBucketPickerModal from './MobileBucketPickerModal';
import MobileCardEditorModal from './MobileCardEditorModal';
import MobileThemePickerModal from './MobileThemePickerModal';
import MobileQuickMenuModal from './MobileQuickMenuModal';
import MobileNotificationsModal from './MobileNotificationsModal';
import MobileShareModal from './MobileShareModal';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import './mobile-dashboard.css';

interface MobileDashboardProps {
  onOpenStudio?: () => void;
}

export default function MobileDashboard({ onOpenStudio }: MobileDashboardProps = {}) {
  const router = useRouter();
  const { design, setTargetFlowerCount, randomizeFlowers, isPremiumUnlocked, premiumUserName, revokePremium } = useDesign();
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

  // ── Nuansa Waktu Mengikuti Jam Lokal (Pagi, Siang, Sore, Malam) ──
  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());

  useEffect(() => {
    const updateHour = () => setCurrentHour(new Date().getHours());
    updateHour();
    const timer = setInterval(updateHour, 30000);
    return () => clearInterval(timer);
  }, []);

  const timeGreeting = useMemo(() => {
    if (isEn) {
      if (currentHour >= 4 && currentHour < 11) {
        return {
          header: 'Good morning,',
          card: 'Good Morning, My Love! ☀️🌸',
        };
      }
      if (currentHour >= 11 && currentHour < 15) {
        return {
          header: 'Good afternoon,',
          card: 'Good Afternoon, Sweetheart! 🌼✨',
        };
      }
      if (currentHour >= 15 && currentHour < 19) {
        return {
          header: 'Good evening,',
          card: 'Good Evening, Beloved! 🌅💐',
        };
      }
      return {
        header: 'Good night,',
        card: 'Good Night, My Love! 🌙💖',
      };
    }

    // Indonesian: Pagi (04:00-10:59), Siang (11:00-14:59), Sore (15:00-18:59), Malam (19:00-03:59)
    if (currentHour >= 4 && currentHour < 11) {
      return {
        header: 'Selamat pagi,',
        card: 'Selamat Pagi Sayang! ☀️🌸',
      };
    }
    if (currentHour >= 11 && currentHour < 15) {
      return {
        header: 'Selamat siang,',
        card: 'Selamat Siang Manis! 🌼✨',
      };
    }
    if (currentHour >= 15 && currentHour < 19) {
      return {
        header: 'Selamat sore,',
        card: 'Selamat Sore Tercinta! 🌅💐',
      };
    }
    return {
      header: 'Selamat malam,',
      card: 'Selamat Malam Sayang! 🌙💖',
    };
  }, [currentHour, isEn]);

  // Modals state
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [isFlowerPickerOpen, setIsFlowerPickerOpen] = useState(false);
  const [isBucketPickerOpen, setIsBucketPickerOpen] = useState(false);
  const [isCardEditorOpen, setIsCardEditorOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUnlockVipOpen, setIsUnlockVipOpen] = useState(false);
  const [isVipCardOpen, setIsVipCardOpen] = useState(false);

  // Notification card visibility
  const [isNotifBannerVisible, setIsNotifBannerVisible] = useState(true);

  // Sparkle feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentBucket = getBucketSize(design.bucketSize);
  const flowerCount = design.targetFlowerCount || 25;
  const currentCardTitle = design.text.content?.trim()
    ? (design.text.content.length > 28 ? design.text.content.substring(0, 28) + '...' : design.text.content)
    : timeGreeting.card;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  const handleRandomize = () => {
    randomizeFlowers();
    showToast(isEn ? '✨ Bouquet randomized with fresh flowers!' : '✨ Buket berhasil diacak dengan paduan bunga baru!');
  };

  const handleGoToStudio = () => {
    if (onOpenStudio) {
      onOpenStudio();
    } else {
      router.push(`/designer?flowers=${flowerCount}`);
    }
  };

  return (
    <div className="mb-root">
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="mb-toast">
          <Sparkles size={14} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mb-container">
        {/* ─── 1. TOP HEADER BAR ─── */}
        <header className="mb-header">
          <div>
            <p className="mb-header-sub">{timeGreeting.header}</p>
            <div className="flex items-center gap-2">
              <h1 className="mb-header-title">
                Buket Laysa.
              </h1>
              {hasMounted && isPremiumUnlocked && (
                <span className="mb-vip-title-pill" title="Status Akun VIP Sultan Aktif">
                  <Crown size={11} className="text-amber-300" />
                  VIP
                </span>
              )}
            </div>
          </div>

          <div className="mb-header-right-cluster">
            {/* Language Switcher Compact */}
            <LanguageSwitcher variant="compact" />

            {/* VIP Badge / Unlock Button */}
            {hasMounted && (
              isPremiumUnlocked ? (
                <button
                  type="button"
                  className="mb-header-vip-badge"
                  onClick={() => setIsVipCardOpen(true)}
                  title="Status VIP Aktif"
                  id="mobile-btn-vip-badge"
                >
                  <Crown size={13} className="text-amber-400" />
                  <span>VIP{premiumUserName ? ` • ${premiumUserName.split(' ')[0]}` : ''}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="mb-header-vip-unlock-btn"
                  onClick={() => setIsUnlockVipOpen(true)}
                  title="Buka Kunci VIP"
                  id="mobile-btn-unlock-vip"
                >
                  <Crown size={14} style={{ color: '#F59E0B' }} />
                  <span>VIP</span>
                </button>
              )
            )}

            <button
              type="button"
              id="mobile-btn-quick-menu"
              onClick={() => setIsQuickMenuOpen(true)}
              aria-label="Buka menu cepat"
              className="mb-header-btn-grid"
            >
              <LayoutGrid size={21} strokeWidth={2.2} />
            </button>
          </div>
        </header>

        {/* ─── 2. FEATURED HERO GRADIENT CARD ─── */}
        <div
          id="mobile-hero-card"
          className="mb-hero-card"
        >
          {/* Decorative Background Aura */}
          <div aria-hidden="true" className="mb-hero-aura-1" />
          <div aria-hidden="true" className="mb-hero-aura-2" />

          <div className="mb-hero-content">
            {/* Left Content */}
            <div className="mb-hero-left">
              {/* Top Tag & Active Dot */}
              <div className="mb-hero-tag-row">
                {hasMounted && isPremiumUnlocked ? (
                  <span className="mb-hero-tag mb-hero-tag-vip">
                    <Crown size={11} className="text-amber-300 animate-pulse" />
                    VIP SULTAN • #LAYSA-2026-BKT
                  </span>
                ) : (
                  <span className="mb-hero-tag">
                    #LAYSA-2026-BKT
                  </span>
                )}
                <span className="mb-hero-dot" />
              </div>

              {/* Main Heading (Editable / Clickable) */}
              <h2
                onClick={() => setIsCardEditorOpen(true)}
                className="mb-hero-greeting"
                title={isEn ? 'Tap to edit greeting message' : 'Ketuk untuk mengubah tulisan ucapan'}
              >
                {currentCardTitle}
              </h2>

              {/* Subtitle */}
              <p className="mb-hero-sub">
                {currentBucket.label} • {flowerCount} {isEn ? 'Flowers' : 'Bunga'}
              </p>

              {/* Bottom Controls */}
              <div className="mb-hero-controls">
                <span className="mb-hero-count-text">
                  {flowerCount} {isEn ? 'Flowers' : 'Bunga'}
                </span>

                <button
                  type="button"
                  id="mobile-btn-flower-dropdown"
                  onClick={() => setIsCountModalOpen(true)}
                  className="mb-hero-dropdown-btn"
                >
                  <span>{flowerCount} {isEn ? 'Stems' : 'Tangkai'}</span>
                  <ChevronDown size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Right Side Bouquet 3D Illustration */}
            <div
              onClick={handleGoToStudio}
              className="mb-hero-bouquet-wrap"
              title={isEn ? 'Tap to open bouquet studio' : 'Ketuk untuk membuka studio perangkai buket'}
            >
              <Image
                src="/images/mobile-hero-bouquet.png"
                alt={isEn ? 'Laysa Flower Bouquet' : 'Buket Bunga Laysa'}
                width={130}
                height={130}
                priority
                className="mb-hero-bouquet-img"
              />
            </div>
          </div>
        </div>

        {/* ─── 3. MENU INFORMASI (8 QUICK ACTION ICONS) ─── */}
        <section className="mb-section">
          <h3 className="mb-section-title">
            {isEn ? 'Quick Menu' : 'Menu Informasi'}
          </h3>

          <div className="mb-menu-grid">
            {/* 1. Bunga */}
            <button
              type="button"
              id="mobile-menu-bunga"
              onClick={() => setIsFlowerPickerOpen(true)}
              className="mb-menu-item"
            >
              <div className="mb-menu-icon-box mb-icon-bunga">
                <Flower2 size={21} />
              </div>
              <span className="mb-menu-label">{isEn ? 'Flowers' : 'Bunga'}</span>
            </button>

            {/* 2. Buket */}
            <button
              type="button"
              id="mobile-menu-buket"
              onClick={() => setIsBucketPickerOpen(true)}
              className="mb-menu-item"
            >
              <div className="mb-menu-icon-box mb-icon-buket">
                <Package size={21} />
              </div>
              <span className="mb-menu-label">{isEn ? 'Wrap' : 'Buket'}</span>
            </button>

            {/* 3. Kartu */}
            <button
              type="button"
              id="mobile-menu-kartu"
              onClick={() => setIsCardEditorOpen(true)}
              className="mb-menu-item"
            >
              <div className="mb-menu-icon-box mb-icon-kartu">
                <Mail size={21} />
              </div>
              <span className="mb-menu-label">{isEn ? 'Card' : 'Kartu'}</span>
            </button>

            {/* 4. Kapasitas */}
            <button
              type="button"
              id="mobile-menu-kapasitas"
              onClick={() => setIsCountModalOpen(true)}
              className="mb-menu-item"
            >
              <div className="mb-menu-icon-box mb-icon-kapasitas">
                <SlidersHorizontal size={21} />
              </div>
              <span className="mb-menu-label">{isEn ? 'Capacity' : 'Kapasitas'}</span>
            </button>

            {/* 5. Suasana */}
            <button
              type="button"
              id="mobile-menu-suasana"
              onClick={() => setIsThemePickerOpen(true)}
              className="mb-menu-item"
            >
              <div className="mb-menu-icon-box mb-icon-suasana">
                <Palette size={21} />
              </div>
              <span className="mb-menu-label">{isEn ? 'Ambiance' : 'Suasana'}</span>
            </button>

            {/* 6. Acak */}
            <button
              type="button"
              id="mobile-menu-acak"
              onClick={handleRandomize}
              className="mb-menu-item"
            >
              <div className="mb-menu-icon-box mb-icon-acak">
                <Sparkles size={21} />
              </div>
              <span className="mb-menu-label">{isEn ? 'Shuffle' : 'Acak'}</span>
            </button>

            {/* 7. Kirim WA */}
            <button
              type="button"
              id="mobile-menu-wa"
              onClick={() => setIsShareModalOpen(true)}
              className="mb-menu-item"
            >
              <div className="mb-menu-icon-box mb-icon-wa">
                <MessageCircle size={21} />
              </div>
              <span className="mb-menu-label">{isEn ? 'Send WA' : 'Kirim WA'}</span>
            </button>

            {/* 8. Ekspor */}
            <button
              type="button"
              id="mobile-menu-ekspor"
              onClick={() => setIsShareModalOpen(true)}
              className="mb-menu-item"
            >
              <div className="mb-menu-icon-box mb-icon-ekspor">
                <Download size={21} />
              </div>
              <span className="mb-menu-label">{isEn ? 'Export' : 'Ekspor'}</span>
            </button>
          </div>
        </section>

        {/* ─── FITUR SPESIAL: MINI GAMES ─── */}
        <section className="mb-section" style={{ marginTop: '-4px' }}>
          <Link
            href="/minigames"
            style={{
              background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
              border: '1.5px solid #C7D2FE',
              borderRadius: '20px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: '#6366F1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.25)',
                }}
              >
                🎮
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#312E81' }}>
                    Mini Games
                  </h4>
                  <span style={{ fontSize: '10px', fontWeight: 800, background: '#C7D2FE', color: '#3730A3', padding: '1px 6px', borderRadius: '9999px' }}>
                    Gratis!
                  </span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#4338CA' }}>
                  {isEn ? 'Play interactive flower jigsaw puzzles & more' : 'Mainkan puzzle susun bunga & games interaktif'}
                </p>
              </div>
            </div>
            <ArrowRight size={16} style={{ color: '#6366F1', flexShrink: 0 }} />
          </Link>
        </section>

        {/* ─── 4. NOTIFIKASI SECTION ─── */}
        <section className="mb-section">
          <div className="mb-section-header">
            <h3 className="mb-section-title">
              {isEn ? 'Notifications' : 'Notifikasi'}
            </h3>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="mb-section-link"
            >
              {isEn ? 'See all' : 'Lihat semua'}
            </button>
          </div>

          {isNotifBannerVisible && (
            <div className="mb-notif-card">
              <div className="mb-notif-left">
                {/* Green Vertical Accent Bar */}
                <div className="mb-notif-bar" />
                <div>
                  <h4 className="mb-notif-heading">
                    {isEn ? '2026 Gift & Graduation Bouquet Registration' : 'Pendaftaran Buket Hadiah & Wisuda'}
                  </h4>
                  <p className="mb-notif-body">
                    {isEn ? 'Free calligraphy card & 2026 premium satin ribbon' : 'Gratis kartu ucapan kaligrafi & pita satin premium edisi 2026'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNotifBannerVisible(false)}
                className="mb-notif-close"
                aria-label={isEn ? 'Close notification' : 'Tutup notifikasi'}
              >
                <X size={15} />
              </button>
            </div>
          )}
        </section>

        {/* ─── 5. PRATINJAU LANGSUNG RANGKAIAN ─── */}
        <section className="mb-section">
          <div className="mb-section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mb-hero-dot" />
              <h3 className="mb-section-title">
                {isEn ? 'Live Bouquet Preview' : 'Pratinjau Langsung Rangkaian'}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleGoToStudio}
              className="mb-section-link"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>{isEn ? 'Open Studio' : 'Buka Studio'}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Canvas Preview Container Card */}
          <div className="mb-canvas-card">
            <div className="mb-canvas-wrapper">
              <PreviewCanvas />
            </div>

            {/* Quick Action Pills Under Canvas */}
            <div className="mb-canvas-actions">
              <button
                type="button"
                onClick={() => setIsBucketPickerOpen(true)}
                className="mb-canvas-btn mb-canvas-btn-model"
              >
                <Package size={13} />
                <span>{isEn ? 'Change Wrap' : 'Ganti Model'}</span>
              </button>

              <button
                type="button"
                onClick={handleRandomize}
                className="mb-canvas-btn mb-canvas-btn-acak"
              >
                <Sparkles size={13} />
                <span>{isEn ? 'Shuffle' : 'Acak Bunga'}</span>
              </button>

              <button
                type="button"
                onClick={handleGoToStudio}
                className="mb-canvas-btn mb-canvas-btn-studio"
              >
                <span>{isEn ? 'Studio Edit' : 'Edit Studio'}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ─── 6. FIXED BOTTOM NAVIGATION BAR ─── */}
      <nav
        aria-label={isEn ? 'Mobile Main Navigation' : 'Navigasi Utama Mobile'}
        className="mb-bottom-nav"
      >
        <div className="mb-nav-container">
          {/* 1. Home / Beranda (Active with purple top bar indicator) */}
          <button
            type="button"
            className="mb-nav-btn active"
            aria-label={isEn ? 'Home' : 'Beranda'}
          >
            {/* Top Indicator Line */}
            <div className="mb-nav-indicator" />
            <Home size={22} strokeWidth={2.5} />
          </button>

          {/* 2. Rangkai / Studio with red badge */}
          <button
            type="button"
            onClick={handleGoToStudio}
            className="mb-nav-btn"
            aria-label={isEn ? 'Arrange in Studio' : 'Rangkai Buket di Studio'}
          >
            {/* Badge showing target flower count (e.g. 25) */}
            <span className="mb-nav-badge">
              {flowerCount}
            </span>
            <div style={{ marginTop: '4px' }}>
              <Sparkles size={22} />
            </div>
          </button>

          {/* 3. Bunga */}
          <button
            type="button"
            onClick={() => setIsFlowerPickerOpen(true)}
            className="mb-nav-btn"
            aria-label={isEn ? 'Flower Catalog' : 'Katalog Bunga'}
          >
            <div style={{ marginTop: '4px' }}>
              <Flower2 size={22} />
            </div>
          </button>

          {/* 4. Kartu */}
          <button
            type="button"
            onClick={() => setIsCardEditorOpen(true)}
            className="mb-nav-btn"
            aria-label={isEn ? 'Greeting Card' : 'Kartu Ucapan'}
          >
            <div style={{ marginTop: '4px' }}>
              <Mail size={22} />
            </div>
          </button>

          {/* 5. Bagikan */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="mb-nav-btn"
            aria-label={isEn ? 'Share Bouquet' : 'Bagikan Buket'}
          >
            <div style={{ marginTop: '4px' }}>
              <Share2 size={22} />
            </div>
          </button>
        </div>
      </nav>

      {/* ─── MODALS ─── */}
      <FlowerCountModal
        isOpen={isCountModalOpen}
        initialCount={flowerCount as FlowerCountVariant}
        onConfirm={(count) => {
          setTargetFlowerCount(count);
          setIsCountModalOpen(false);
          showToast(isEn ? `Bouquet capacity set to ${count} flowers` : `Kapasitas buket diubah menjadi ${count} bunga`);
        }}
        onClose={() => setIsCountModalOpen(false)}
        canDismiss={true}
      />

      <MobileFlowerPickerModal
        isOpen={isFlowerPickerOpen}
        onClose={() => setIsFlowerPickerOpen(false)}
        onOpenStudio={handleGoToStudio}
      />

      <MobileBucketPickerModal
        isOpen={isBucketPickerOpen}
        onClose={() => setIsBucketPickerOpen(false)}
      />

      <MobileCardEditorModal
        isOpen={isCardEditorOpen}
        onClose={() => setIsCardEditorOpen(false)}
      />

      <MobileThemePickerModal
        isOpen={isThemePickerOpen}
        onClose={() => setIsThemePickerOpen(false)}
      />

      <MobileQuickMenuModal
        isOpen={isQuickMenuOpen}
        onClose={() => setIsQuickMenuOpen(false)}
        onOpenUnlockVip={() => setIsUnlockVipOpen(true)}
      />

      <MobileNotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onOpenStudio={handleGoToStudio}
      />

      <MobileShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onOpenStudio={handleGoToStudio}
      />

      <PremiumUnlockModal
        isOpen={isUnlockVipOpen}
        onClose={() => setIsUnlockVipOpen(false)}
      />

      {isPremiumUnlocked && (
        <VipCardModal
          isOpen={isVipCardOpen}
          onClose={() => setIsVipCardOpen(false)}
          userName={premiumUserName || ''}
          onRevoke={() => {
            revokePremium?.();
            setIsVipCardOpen(false);
          }}
        />
      )}
    </div>
  );
}
