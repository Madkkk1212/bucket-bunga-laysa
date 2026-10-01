'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Move,
  RotateCw,
  RotateCcw,
  Plus,
  Minus,
  Layers,
  Heart,
  Download,
  Share2,
  Music,
  Gift,
  CheckCircle2,
  HelpCircle,
  Palette,
  Compass,
  Copy,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import HomeBackgroundVideo from '@/components/home/HomeBackgroundVideo';
import FlowerCountModal from '@/components/designer/FlowerCountModal';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { FlowerCountVariant } from '@/types/design';
import './tutorial.css';

export default function TutorialClientView() {
  const router = useRouter();
  const { t, isEn } = useLanguage();

  // Navigation state
  const [activeStepTab, setActiveStepTab] = useState<number>(0);
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);

  // ── Step 3 Interactive Demo Playground State ──
  const [demoRotation, setDemoRotation] = useState<number>(15);
  const [demoScale, setDemoScale] = useState<number>(1.0);
  const [demoFlower, setDemoFlower] = useState<'rose' | 'sunflower' | 'tulip'>('rose');
  const [demoLayer, setDemoLayer] = useState<'front' | 'back'>('front');

  // ── Step 4 Greeting Card Interactive State ──
  const [demoCardMoment, setDemoCardMoment] = useState<'wisuda' | 'ultah' | 'ldr' | 'maaf' | 'ibu'>('wisuda');

  // ── Step 5 Digital Gift Interactive State ──
  const [demoMusicTrack, setDemoMusicTrack] = useState<string>('romantic-piano');
  const [demoResolution, setDemoResolution] = useState<'1x' | '2x' | '4x'>('2x');

  // Sound synthesizer (Web Audio API)
  const playSfx = (type: 'hover' | 'click' | 'portal') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(460, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.09);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } else if (type === 'portal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch {
      // Audio might be muted or restricted before interaction
    }
  };

  const scrollToStep = (stepId: string, index: number) => {
    playSfx('click');
    setActiveStepTab(index);
    const element = document.getElementById(stepId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleConfirmFlowerCount = (count: FlowerCountVariant) => {
    setIsCountModalOpen(false);
    playSfx('portal');
    router.push(`/designer?flowers=${count}`);
  };

  // Flower image path for step 3 demo
  const getDemoFlowerSrc = () => {
    if (demoFlower === 'sunflower') return '/images/flowers/sunflower.png';
    if (demoFlower === 'tulip') return '/images/flowers/tulip_pink.png';
    return '/images/flowers/rose_pink.png';
  };

  // Card templates for step 4 demo
  const cardTemplates = {
    wisuda: {
      to: isEn ? 'Sarah Az-Zahra, S.Kom' : 'Sarah Az-Zahra, S.Ked',
      msg: isEn
        ? 'Happy graduation! May this milestone be the opening door to endless blessings, joy, and inspiring successes.'
        : 'Selamat atas wisudamu! Semoga setiap langkah barumu dipenuhi keberkahan, kebahagiaan, dan masa depan gemilang.',
      from: isEn ? 'With pride, Lutfi & Family' : 'Dengan bangga, Lutfi & Keluarga 💕',
    },
    ultah: {
      to: isEn ? 'My Dearest Alya' : 'Alya Tersayang 💖',
      msg: isEn
        ? 'Happy Birthday! May your 22nd year be brimming with beautiful flowers, boundless peace, and fulfilled dreams.'
        : 'Selamat ulang tahun ke-22! Semoga setiap harimu dipenuhi bunga-bunga kebahagiaan, tawa ceria, dan doa terbaik.',
      from: isEn ? 'Forever yours, Dimas' : 'Dari Dimas yang selalu sayang 🥰',
    },
    ldr: {
      to: isEn ? 'Nadia (Across the miles)' : 'Nadia di Seberang Pulau ✈️',
      msg: isEn
        ? 'Distance means so little when someone means so much. These flowers bloom just for you today and always.'
        : 'Jarak ribuan kilometer tak pernah memudarkan rasa. Buket bunga virtual ini kurangkai khusus untukmu hari ini.',
      from: isEn ? 'Counting days to meet you, Reza' : 'Menghitung hari untuk jumpa, Reza',
    },
    maaf: {
      to: isEn ? 'Clara' : 'Clara Maafkan Aku 🙏',
      msg: isEn
        ? 'I am truly sorry for my thoughtless words yesterday. Please accept this peaceful bouquet as my sincere apology.'
        : 'Aku minta maaf dari lubuk hati terdalam atas kata-kataku kemarin. Terimalah buket damai ini sebagai bukti ketulusanku.',
      from: isEn ? 'Humbly, Fajar' : 'Dari Fajar yang menyesal 🤍',
    },
    ibu: {
      to: isEn ? 'Beloved Mother' : 'Ibu Tercinta yang Hebat 🌸',
      msg: isEn
        ? 'Thank you for your infinite warmth and unconditional love. May Allah always bless you with health and happiness.'
        : 'Terima kasih atas kasih sayang tanpa batas yang tak pernah lelah. Semoga Ibu selalu sehat, bahagia, dan dilindungi Allah.',
      from: isEn ? 'Your grateful child, Putri' : 'Anakmu yang selalu bersyukur, Putri',
    },
  };

  return (
    <div className="tutorial-page-container min-h-screen" suppressHydrationWarning>
      {/* ── 1. CINEMATIC VIDEO BACKGROUND ── */}
      <HomeBackgroundVideo />

      {/* ── 2. TOP HUD NAVIGATION BAR ── */}
      <header className="tutorial-hud-header" aria-label="Tutorial Header">
        <div className="tutorial-hud-inner">
          <Link
            href="/menu"
            className="tutorial-back-btn"
            onClick={() => playSfx('hover')}
            aria-label={t('tut_back_menu')}
          >
            <ArrowLeft size={15} />
            <span>{t('tut_back_menu')}</span>
          </Link>

          <div className="tutorial-header-center">
            <span className="tutorial-header-badge">✦ {t('tut_academy_badge')} ✦</span>
            <h1 className="tutorial-header-title">{t('tut_heading')}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LanguageSwitcher variant="compact" />
          </div>
        </div>
      </header>

      {/* ── 3. FLOATING FLORAL PARTICLES DECOR ── */}
      <div className="floral-frame-decor" aria-hidden="true">
        <span className="floating-petal petal-1">🌸</span>
        <span className="floating-petal petal-2">✨</span>
        <span className="floating-petal petal-3">🌺</span>
        <span className="floating-petal petal-4">🌸</span>
        <span className="floating-petal petal-5">✨</span>
        <span className="floating-petal petal-6">🌷</span>
      </div>

      {/* ── 4. STICKY QUICK-JUMP CHAPTER TIMELINE ── */}
      <nav className="tutorial-quick-nav-bar" aria-label="Chapter Navigator">
        <div className="tutorial-quick-nav-inner">
          <span className="tutorial-nav-label">
            <Compass size={14} />
            <span>{t('tut_nav_title')}</span>
          </span>

          <div className="tutorial-nav-chips">
            {[
              { id: 'step-1', label: t('tut_step1_nav') },
              { id: 'step-2', label: t('tut_step2_nav') },
              { id: 'step-3', label: t('tut_step3_nav') },
              { id: 'step-4', label: t('tut_step4_nav') },
              { id: 'step-5', label: t('tut_step5_nav') },
            ].map((step, idx) => (
              <button
                key={step.id}
                type="button"
                className={`tutorial-nav-chip ${activeStepTab === idx ? 'chip-active' : ''}`}
                onClick={() => scrollToStep(step.id, idx)}
                onMouseEnter={() => playSfx('hover')}
              >
                <span>{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── 5. MAIN LONG-FORM CONTENT CONTAINER ── */}
      <main className="tutorial-main-content">
        <div className="tutorial-content-container">

          {/* ══════════ HERO INTRO BANNER ══════════ */}
          <section className="tutorial-hero-intro">
            <span className="tutorial-hero-badge">
              <Sparkles size={14} className="text-pink-600" />
              <span>{isEn ? 'Master Florist Guide' : 'Panduan Resmi Florist Studio'}</span>
            </span>

            <h1 className="tutorial-hero-h1">{t('tut_heading')}</h1>
            <p className="tutorial-hero-p">{t('tut_subheading')}</p>

            <div className="tutorial-hero-stats">
              <div className="tutorial-stat-pill">
                <span>📦</span>
                <span><strong>56+</strong> {isEn ? 'Wrapper Models' : 'Model Kertas Buket'}</span>
              </div>
              <div className="tutorial-stat-pill">
                <span>🌸</span>
                <span><strong>53+</strong> {isEn ? 'Botanical Blooms' : 'Varietas Bunga Botani'}</span>
              </div>
              <div className="tutorial-stat-pill">
                <span>🔄</span>
                <span><strong>360°</strong> {isEn ? 'Free Canvas Control' : 'Rotasi & Geser Bebas'}</span>
              </div>
              <div className="tutorial-stat-pill">
                <span>🎁</span>
                <span><strong>HD & Link</strong> {isEn ? 'Musical Gifts' : 'Kado Link Musik'}</span>
              </div>
            </div>
          </section>

          {/* ══════════ STEP 1: UKURAN & KERTAS BUKET ══════════ */}
          <section className="tutorial-step-card" id="step-1">
            <div className="tutorial-step-header">
              <div className="tutorial-step-badge badge-step-1">
                <span>{t('tut_step1_badge')}</span>
              </div>
              <span className="tutorial-step-counter">01 / 05</span>
            </div>

            <div className="tutorial-step-grid">
              <div className="tutorial-step-narrative">
                <h2 className="tutorial-step-title">{t('tut_step1_title')}</h2>
                <p className="tutorial-step-desc">{t('tut_step1_desc')}</p>

                <div className="tutorial-feature-list">
                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-rose">1</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step1_f1_title')}</strong>
                      <span>{t('tut_step1_f1_desc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-rose">2</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step1_f2_title')}</strong>
                      <span>{t('tut_step1_f2_desc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-rose">3</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step1_f3_title')}</strong>
                      <span>{t('tut_step1_f3_desc')}</span>
                    </div>
                  </div>
                </div>

                <div className="tutorial-pro-tip">
                  <span className="text-xl">💡</span>
                  <div>
                    <span className="tutorial-pro-tip-tag">{t('tut_step1_tip_tag')}</span>
                    <span>{t('tut_step1_tip_desc')}</span>
                  </div>
                </div>
              </div>

              {/* Mockup Frame 1: Capacity & Wrapper Selector */}
              <div className="tutorial-mockup-wrapper">
                <div className="tutorial-mockup-frame">
                  {/* Top bar mockup */}
                  <div className="mockup-toolbar-header">
                    <span style={{ fontSize: '11px', color: '#fbcfe8', fontWeight: 700 }}>
                      🎀 {isEn ? 'Bouquet Foundation' : 'Pilihan Kertas Pembungkus'}
                    </span>
                    <span className="mockup-stepper">56+ {isEn ? 'Styles' : 'Pilihan'}</span>
                  </div>

                  {/* Stage mockup */}
                  <div className="mockup-canvas-stage">
                    {/* Layer Back Wrapper */}
                    <div className="mockup-bouquet-wrapper-back">
                      <Image
                        src="/images/bucket/bucket-2.png"
                        alt="Wrapper Back"
                        width={220}
                        height={240}
                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                      />
                    </div>

                    {/* Flower inside */}
                    <div className="mockup-flower-layer" style={{ transform: 'translateY(-15px)' }}>
                      <Image
                        src="/images/flowers/rose_pink.png"
                        alt="Flower Preview"
                        width={90}
                        height={90}
                        style={{ objectFit: 'contain' }}
                      />
                    </div>

                    {/* Layer Front Wrapper */}
                    <div className="mockup-bouquet-wrapper-front">
                      <Image
                        src="/images/bucket/bucket-2.png"
                        alt="Wrapper Front"
                        width={210}
                        height={120}
                        style={{ objectFit: 'contain', width: '100%', height: '100%', clipPath: 'inset(45% 0 0 0)' }}
                      />
                    </div>
                  </div>

                  {/* Capacity picker chips bar */}
                  <div style={{ background: '#1e293b', padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                      {isEn ? 'Target Flower Capacity:' : 'Pilihan Target Kapasitas Bunga:'}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['3 Bunga', '5 Bunga', '7 Bunga', '10 Bunga ★', '15 Bunga', '25 Bunga'].map((cap, i) => (
                        <span
                          key={cap}
                          style={{
                            background: i === 3 ? '#e11d48' : 'rgba(255,255,255,0.08)',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: '9999px',
                            border: i === 3 ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.15)',
                          }}
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Callout pointers */}
                <div className="tutorial-callouts-strip">
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">1</span>
                    <span className="callout-pill-text">{t('tut_step1_callout1')}</span>
                  </div>
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">2</span>
                    <span className="callout-pill-text">{t('tut_step1_callout2')}</span>
                  </div>
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">3</span>
                    <span className="callout-pill-text">{t('tut_step1_callout3')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ STEP 2: KATALOG BUNGA BOTANI ══════════ */}
          <section className="tutorial-step-card" id="step-2">
            <div className="tutorial-step-header">
              <div className="tutorial-step-badge badge-step-2">
                <span>{t('tut_step2_badge')}</span>
              </div>
              <span className="tutorial-step-counter">02 / 05</span>
            </div>

            <div className="tutorial-step-grid">
              <div className="tutorial-step-narrative">
                <h2 className="tutorial-step-title">{t('tut_step2_title')}</h2>
                <p className="tutorial-step-desc">{t('tut_step2_desc')}</p>

                <div className="tutorial-feature-list">
                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-cyan">1</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step2_f1_title')}</strong>
                      <span>{t('tut_step2_f1_desc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-cyan">2</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step2_f2_title')}</strong>
                      <span>{t('tut_step2_f2_desc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-cyan">3</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step2_f3_title')}</strong>
                      <span>{t('tut_step2_f3_desc')}</span>
                    </div>
                  </div>
                </div>

                <div className="tutorial-pro-tip">
                  <span className="text-xl">💡</span>
                  <div>
                    <span className="tutorial-pro-tip-tag">{t('tut_step2_tip_tag')}</span>
                    <span>{t('tut_step2_tip_desc')}</span>
                  </div>
                </div>
              </div>

              {/* Mockup Frame 2: Catalog & Categories */}
              <div className="tutorial-mockup-wrapper">
                <div className="tutorial-mockup-frame">
                  {/* Top catalog header */}
                  <div className="mockup-toolbar-header">
                    <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>
                      🌿 {isEn ? 'Botanical Flower Catalog' : 'Katalog Bunga Botani (53+)'}
                    </span>
                    <span className="mockup-stepper" style={{ background: '#0369a1', borderColor: '#38bdf8' }}>
                      {isEn ? '7 / 10 Flowers' : '7 / 10 Bunga Terpasang'}
                    </span>
                  </div>

                  {/* Category Pills */}
                  <div style={{ background: '#1e293b', padding: '8px 12px', display: 'flex', gap: '6px', overflowX: 'auto' }}>
                    {['Semua', 'Mawar', 'Lily', 'Tulip', 'Matahari', 'Filler', 'Daun'].map((cat, i) => (
                      <span
                        key={cat}
                        style={{
                          background: i === 1 ? '#0284c7' : 'rgba(255,255,255,0.08)',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Grid of sample flowers */}
                  <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#090d16' }}>
                    {[
                      { name: 'Mawar Merah', file: '/images/flowers/rose_pink.png', type: 'Focal' },
                      { name: 'Bunga Matahari', file: '/images/flowers/sunflower.png', type: 'Focal' },
                      { name: 'Tulip Pink', file: '/images/flowers/tulip_pink.png', type: 'Focal' },
                      { name: 'Hydrangea', file: '/images/flowers/hydrangea_pink.png', type: 'Accent' },
                      { name: "Baby's Breath", file: '/images/flowers/babysbreath_white.png', type: 'Filler' },
                      { name: 'Eucalyptus', file: '/images/flowers/eucalyptus.png', type: 'Foliage' },
                    ].map((f) => (
                      <div
                        key={f.name}
                        style={{
                          background: '#1e293b',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '12px',
                          padding: '8px 6px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          textAlign: 'center',
                        }}
                      >
                        <Image src={f.file} alt={f.name} width={50} height={50} style={{ objectFit: 'contain' }} />
                        <span style={{ fontSize: '10.5px', color: '#fff', fontWeight: 700 }}>{f.name}</span>
                        <span style={{ fontSize: '9px', color: '#38bdf8', background: 'rgba(2,132,199,0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                          + Tambah
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Callout pointers */}
                <div className="tutorial-callouts-strip">
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">1</span>
                    <span className="callout-pill-text">{t('tut_step2_callout1')}</span>
                  </div>
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">2</span>
                    <span className="callout-pill-text">{t('tut_step2_callout2')}</span>
                  </div>
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">3</span>
                    <span className="callout-pill-text">{t('tut_step2_callout3')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ STEP 3: KANVAS STUDIO & ROTASI (KOMPLEKS & INTERAKTIF!) ══════════ */}
          <section className="tutorial-step-card" id="step-3" style={{ border: '2px solid #fbbf24' }}>
            <div className="tutorial-step-header">
              <div className="tutorial-step-badge badge-step-3">
                <span>{t('tut_step3_badge')}</span>
              </div>
              <span className="tutorial-step-counter">03 / 05</span>
            </div>

            <div className="tutorial-step-grid">
              <div className="tutorial-step-narrative">
                <h2 className="tutorial-step-title">{t('tut_step3_title')}</h2>
                <p className="tutorial-step-desc">{t('tut_step3_desc')}</p>

                <div className="tutorial-feature-list">
                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-amber">1</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step3_f1_title')}</strong>
                      <span>{t('tut_step3_f1_desc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-amber">2</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step3_f2_title')}</strong>
                      <span>{t('tut_step3_f2_desc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-amber">3</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step3_f3_title')}</strong>
                      <span>{t('tut_step3_f3_desc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-amber">4</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step3_f4_title')}</strong>
                      <span>{t('tut_step3_f4_desc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-amber">5</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step3_f5_title')}</strong>
                      <span>{t('tut_step3_f5_desc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-amber">6</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step3_f6_title')}</strong>
                      <span>{t('tut_step3_f6_desc')}</span>
                    </div>
                  </div>
                </div>

                <div className="tutorial-pro-tip">
                  <span className="text-xl">💡</span>
                  <div>
                    <span className="tutorial-pro-tip-tag">{t('tut_step3_tip_tag')}</span>
                    <span>{t('tut_step3_tip_desc')}</span>
                  </div>
                </div>
              </div>

              {/* Mockup Frame 3: Live Interactive Canvas Demo with Handles & Rotation */}
              <div className="tutorial-mockup-wrapper">
                <div className="tutorial-mockup-frame">
                  {/* Real toolbar replica */}
                  <div className="mockup-toolbar-header">
                    <div className="mockup-toolbar-group">
                      <button type="button" className="mockup-tool-btn" title="Undo">↩ Undo</button>
                      <button type="button" className="mockup-tool-btn" title="Redo">↪ Redo</button>
                    </div>

                    <div className="mockup-toolbar-group">
                      <span className="mockup-stepper">
                        <RotateCcw size={11} />
                        <span>{demoRotation}°</span>
                        <RotateCw size={11} />
                      </span>

                      <span className="mockup-stepper">
                        <span>{Math.round(demoScale * 100)}%</span>
                      </span>
                    </div>

                    <div className="mockup-toolbar-group">
                      <span className="mockup-tool-btn mockup-tool-btn-active">
                        <Move size={12} />
                        <span>Nudge</span>
                      </span>
                    </div>
                  </div>

                  {/* Canvas Stage with Active Selected Flower & Rotation Handle */}
                  <div className="mockup-canvas-stage">
                    {/* Background Wrapper */}
                    <div className="mockup-bouquet-wrapper-back">
                      <Image
                        src="/images/bucket/bucket-1.png"
                        alt="Wrapper"
                        width={220}
                        height={240}
                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                      />
                    </div>

                    {/* Left Filler Stem (fixed preview) */}
                    <div style={{ position: 'absolute', bottom: '40px', left: '40px', transform: 'rotate(-30deg)', zIndex: 2 }}>
                      <Image src="/images/flowers/babysbreath_white.png" alt="Filler" width={65} height={65} style={{ objectFit: 'contain' }} />
                    </div>

                    {/* Right Filler Stem (fixed preview) */}
                    <div style={{ position: 'absolute', bottom: '45px', right: '40px', transform: 'rotate(35deg)', zIndex: 2 }}>
                      <Image src="/images/flowers/eucalyptus.png" alt="Leaf" width={70} height={70} style={{ objectFit: 'contain' }} />
                    </div>

                    {/* The Active Interactive Flower with Selection Box & Rotate Handle */}
                    <div
                      className="mockup-selected-flower"
                      style={{
                        transform: `rotate(${demoRotation}deg) scale(${demoScale})`,
                        zIndex: demoLayer === 'front' ? 4 : 2,
                      }}
                    >
                      {/* Selection Box Outline */}
                      <div className="mockup-selection-box">
                        <div className="mockup-handle-corner handle-tl" />
                        <div className="mockup-handle-corner handle-tr" />
                        <div className="mockup-handle-corner handle-bl" />
                        <div className="mockup-handle-corner handle-br" />

                        {/* Top Rotation Knob */}
                        <div className="mockup-rotate-stalk">
                          <div className="mockup-rotate-knob">
                            <RotateCw size={8} />
                          </div>
                          <div className="mockup-rotate-stem" />
                        </div>
                      </div>

                      {/* Actual Flower Image */}
                      <Image
                        src={getDemoFlowerSrc()}
                        alt="Selected Flower"
                        width={100}
                        height={100}
                        style={{ objectFit: 'contain', display: 'block' }}
                      />
                    </div>

                    {/* Front Wrapper Bib */}
                    <div
                      className="mockup-bouquet-wrapper-front"
                      style={{ zIndex: 3 }}
                    >
                      <Image
                        src="/images/bucket/bucket-1.png"
                        alt="Front Bib"
                        width={210}
                        height={120}
                        style={{ objectFit: 'contain', width: '100%', height: '100%', clipPath: 'inset(45% 0 0 0)' }}
                      />
                    </div>
                  </div>

                  {/* ── LIVE INTERACTIVE PLAYGROUND BAR (TRY IT OUT!) ── */}
                  <div className="mockup-interactive-bar">
                    <div className="mockup-interactive-label">
                      <span>🎮 {t('tut_step3_interactive_title')}</span>
                      <span>Sudut: {demoRotation}° | Skala: {Math.round(demoScale * 100)}%</span>
                    </div>

                    <div className="mockup-interactive-buttons">
                      {/* Rotate Buttons */}
                      <button
                        type="button"
                        className="mockup-interactive-btn"
                        onClick={() => {
                          playSfx('click');
                          setDemoRotation((r) => Math.max(-60, r - 15));
                        }}
                      >
                        <RotateCcw size={12} />
                        <span>Putar -15°</span>
                      </button>

                      <button
                        type="button"
                        className="mockup-interactive-btn"
                        onClick={() => {
                          playSfx('click');
                          setDemoRotation((r) => Math.min(60, r + 15));
                        }}
                      >
                        <RotateCw size={12} />
                        <span>Putar +15°</span>
                      </button>

                      {/* Scale Buttons */}
                      <button
                        type="button"
                        className="mockup-interactive-btn"
                        onClick={() => {
                          playSfx('click');
                          setDemoScale((s) => Math.max(0.7, Number((s - 0.1).toFixed(1))));
                        }}
                      >
                        <Minus size={12} />
                        <span>Kecilkan</span>
                      </button>

                      <button
                        type="button"
                        className="mockup-interactive-btn"
                        onClick={() => {
                          playSfx('click');
                          setDemoScale((s) => Math.min(1.4, Number((s + 0.1).toFixed(1))));
                        }}
                      >
                        <Plus size={12} />
                        <span>Besarkan</span>
                      </button>

                      {/* Layer Toggle */}
                      <button
                        type="button"
                        className="mockup-interactive-btn"
                        style={{ background: demoLayer === 'front' ? '#be185d' : 'rgba(255,255,255,0.12)' }}
                        onClick={() => {
                          playSfx('click');
                          setDemoLayer((l) => (l === 'front' ? 'back' : 'front'));
                        }}
                      >
                        <Layers size={12} />
                        <span>{demoLayer === 'front' ? 'Lapisan: Depan' : 'Lapisan: Belakang'}</span>
                      </button>

                      {/* Switch Flower Variant */}
                      <button
                        type="button"
                        className="mockup-interactive-btn"
                        onClick={() => {
                          playSfx('click');
                          if (demoFlower === 'rose') setDemoFlower('sunflower');
                          else if (demoFlower === 'sunflower') setDemoFlower('tulip');
                          else setDemoFlower('rose');
                        }}
                      >
                        <span>🌸 Ganti Bunga</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Callout pointers */}
                <div className="tutorial-callouts-strip">
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">1</span>
                    <span className="callout-pill-text">{t('tut_step3_callout1')}</span>
                  </div>
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">2</span>
                    <span className="callout-pill-text">{t('tut_step3_callout2')}</span>
                  </div>
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">3</span>
                    <span className="callout-pill-text">{t('tut_step3_callout3')}</span>
                  </div>
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">4</span>
                    <span className="callout-pill-text">{t('tut_step3_callout4')}</span>
                  </div>
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">5</span>
                    <span className="callout-pill-text">{t('tut_step3_callout5')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ STEP 4: KARTU UCAPAN KALIGRAFI ══════════ */}
          <section className="tutorial-step-card" id="step-4">
            <div className="tutorial-step-header">
              <div className="tutorial-step-badge badge-step-4">
                <span>{t('tut_step4_badge')}</span>
              </div>
              <span className="tutorial-step-counter">04 / 05</span>
            </div>

            <div className="tutorial-step-grid">
              <div className="tutorial-step-narrative">
                <h2 className="tutorial-step-title">{t('tut_step4_title')}</h2>
                <p className="tutorial-step-desc">{t('tut_step4_desc')}</p>

                <div className="tutorial-feature-list">
                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-purple">1</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step4_f1_title')}</strong>
                      <span>{t('tut_step4_f1_desc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-purple">2</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step4_f2_title')}</strong>
                      <span>{t('tut_step4_f2_desc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-purple">3</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step4_f3_title')}</strong>
                      <span>{t('tut_step4_f3_desc')}</span>
                    </div>
                  </div>
                </div>

                <div className="tutorial-pro-tip">
                  <span className="text-xl">💡</span>
                  <div>
                    <span className="tutorial-pro-tip-tag">{t('tut_step4_tip_tag')}</span>
                    <span>{t('tut_step4_tip_desc')}</span>
                  </div>
                </div>
              </div>

              {/* Mockup Frame 4: Interactive Greeting Card with Moment Templates */}
              <div className="tutorial-mockup-wrapper">
                <div className="tutorial-mockup-frame">
                  {/* Top bar */}
                  <div className="mockup-toolbar-header">
                    <span style={{ fontSize: '11px', color: '#e9d5ff', fontWeight: 700 }}>
                      💌 {isEn ? 'Greeting Card Editor' : 'Editor Kartu Ucapan Kaligrafi'}
                    </span>
                    <span className="mockup-stepper" style={{ background: '#7e22ce', borderColor: '#c084fc' }}>
                      Font: Cormorant / Playfair
                    </span>
                  </div>

                  {/* Interactive card canvas preview */}
                  <div className="mockup-canvas-stage mockup-card-canvas">
                    <div className="mockup-card-body">
                      <div className="mockup-card-badge-row">
                        <span className="mockup-card-tag">💌 {demoCardMoment.toUpperCase()}</span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>Aesthetic Ribbon</span>
                      </div>

                      <div className="mockup-card-to">
                        <strong>Untuk:</strong> {cardTemplates[demoCardMoment].to}
                      </div>

                      <p className="mockup-card-message">
                        &ldquo;{cardTemplates[demoCardMoment].msg}&rdquo;
                      </p>

                      <div className="mockup-card-from">
                        <strong>Dari:</strong> {cardTemplates[demoCardMoment].from}
                      </div>
                    </div>

                    {/* Template chips to click */}
                    <div className="mockup-template-chips">
                      {[
                        { id: 'wisuda', label: '🎓 Wisuda' },
                        { id: 'ultah', label: '🎂 Ulang Tahun' },
                        { id: 'ldr', label: '✈️ Pacar LDR' },
                        { id: 'maaf', label: '🕊️ Minta Maaf' },
                        { id: 'ibu', label: '💐 Hari Ibu' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`mockup-template-chip ${demoCardMoment === item.id ? 'active' : ''}`}
                          onClick={() => {
                            playSfx('click');
                            setDemoCardMoment(item.id as typeof demoCardMoment);
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Callout pointers */}
                <div className="tutorial-callouts-strip">
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">1</span>
                    <span className="callout-pill-text">{t('tut_step4_callout1')}</span>
                  </div>
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">2</span>
                    <span className="callout-pill-text">{t('tut_step4_callout2')}</span>
                  </div>
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">3</span>
                    <span className="callout-pill-text">{t('tut_step4_callout3')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ STEP 5: EKSPOR GAMBAR HD & KADO LINK MUSIK ══════════ */}
          <section className="tutorial-step-card" id="step-5">
            <div className="tutorial-step-header">
              <div className="tutorial-step-badge badge-step-5">
                <span>{t('tut_step5_badge')}</span>
              </div>
              <span className="tutorial-step-counter">05 / 05</span>
            </div>

            <div className="tutorial-step-grid">
              <div className="tutorial-step-narrative">
                <h2 className="tutorial-step-title">{t('tut_step5_title')}</h2>
                <p className="tutorial-step-desc">{t('tut_step5_desc')}</p>

                <div className="tutorial-feature-list">
                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-emerald">1</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step5_f1_title')}</strong>
                      <span>{t('tut_step5_f1_desc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-emerald">2</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step5_f2_title')}</strong>
                      <span>{t('tut_step5_f2_desc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-feature-item">
                    <div className="tutorial-feature-icon icon-emerald">3</div>
                    <div className="tutorial-feature-content">
                      <strong>{t('tut_step5_f3_title')}</strong>
                      <span>{t('tut_step5_f3_desc')}</span>
                    </div>
                  </div>
                </div>

                <div className="tutorial-pro-tip">
                  <span className="text-xl">💡</span>
                  <div>
                    <span className="tutorial-pro-tip-tag">{t('tut_step5_tip_tag')}</span>
                    <span>{t('tut_step5_tip_desc')}</span>
                  </div>
                </div>
              </div>

              {/* Mockup Frame 5: Dual Export (HD Image & Musical Gift Link) */}
              <div className="tutorial-mockup-wrapper">
                <div className="tutorial-mockup-frame">
                  {/* Top bar */}
                  <div className="mockup-toolbar-header">
                    <span style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 700 }}>
                      🎁 {isEn ? 'Export & Musical Gift Studio' : 'Pusat Ekspor & Kado Digital Musik'}
                    </span>
                    <span className="mockup-stepper" style={{ background: '#047857', borderColor: '#34d399' }}>
                      PNG / JPG & Web Link
                    </span>
                  </div>

                  {/* Dual Card Showcase */}
                  <div className="mockup-export-dual">
                    {/* Left: HD Image Download */}
                    <div className="mockup-export-card">
                      <div className="mockup-export-card-title">
                        <Download size={14} className="text-emerald-400" />
                        <span>Unduh Gambar HD</span>
                      </div>
                      <p style={{ fontSize: '10.5px', color: '#94a3b8', margin: 0 }}>
                        Resolusi jernih tanpa watermark untuk foto WA/Instagram.
                      </p>

                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        {(['1x', '2x', '4x'] as const).map((res) => (
                          <button
                            key={res}
                            type="button"
                            onClick={() => {
                              playSfx('click');
                              setDemoResolution(res);
                            }}
                            style={{
                              flex: 1,
                              background: demoResolution === res ? '#10b981' : 'rgba(255,255,255,0.08)',
                              color: '#fff',
                              border: demoResolution === res ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '6px',
                              padding: '4px',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {res} {res === '4x' ? 'Ultra' : ''}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        style={{
                          marginTop: '6px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '7px',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                        }}
                      >
                        <Download size={12} />
                        <span>Download PNG/JPG</span>
                      </button>
                    </div>

                    {/* Right: Musical Gift Link */}
                    <div className="mockup-export-card" style={{ borderColor: 'rgba(236,72,153,0.3)' }}>
                      <div className="mockup-export-card-title">
                        <Music size={14} className="text-pink-400" />
                        <span>Kado Link Beranimasi</span>
                      </div>

                      <div className="mockup-music-tracks">
                        {[
                          { id: 'romantic-piano', label: '🎹 Romantic Piano' },
                          { id: 'acoustic-love', label: '🎸 Acoustic Love' },
                          { id: 'happy-birthday', label: '🎂 Happy Birthday' },
                          { id: 'lofi-chill', label: '☕ Lofi Aesthetic' },
                        ].map((m) => (
                          <div
                            key={m.id}
                            className={`mockup-music-track-item ${demoMusicTrack === m.id ? 'active' : ''}`}
                            onClick={() => {
                              playSfx('click');
                              setDemoMusicTrack(m.id);
                            }}
                          >
                            <span>{m.label}</span>
                            {demoMusicTrack === m.id && <span style={{ fontSize: '10px' }}>✓</span>}
                          </div>
                        ))}
                      </div>

                      <div className="mockup-gift-share-btn">
                        <Share2 size={12} />
                        <span>Salin Link Kado 🎁</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Callout pointers */}
                <div className="tutorial-callouts-strip">
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">1</span>
                    <span className="callout-pill-text">{t('tut_step5_callout1')}</span>
                  </div>
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">2</span>
                    <span className="callout-pill-text">{t('tut_step5_callout2')}</span>
                  </div>
                  <div className="tutorial-callout-pill">
                    <span className="callout-badge-number">3</span>
                    <span className="callout-pill-text">{t('tut_step5_callout3')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ GRAND BOTTOM CTA BANNER ══════════ */}
          <section className="tutorial-bottom-cta-card">
            <div className="tutorial-cta-content">
              <span className="tutorial-cta-badge">{t('tut_cta_badge')}</span>
              <h2 className="tutorial-cta-title">{t('tut_cta_title')}</h2>
              <p className="tutorial-cta-desc">{t('tut_cta_desc')}</p>

              <div className="tutorial-cta-buttons">
                <button
                  type="button"
                  id="btn-tutorial-start-now"
                  className="tutorial-btn-primary-launch"
                  onClick={() => {
                    playSfx('click');
                    setIsCountModalOpen(true);
                  }}
                >
                  <Sparkles size={18} />
                  <span>{t('tut_cta_btn')}</span>
                  <ArrowRight size={18} />
                </button>

                <Link
                  href="/"
                  className="tutorial-btn-secondary-back"
                  onClick={() => playSfx('hover')}
                >
                  <ArrowLeft size={16} />
                  <span>{t('tut_cta_back')}</span>
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ── 6. FLOWER COUNT MODAL TRIGGER ── */}
      <FlowerCountModal
        isOpen={isCountModalOpen}
        onClose={() => setIsCountModalOpen(false)}
        onConfirm={handleConfirmFlowerCount}
        canDismiss={true}
      />
    </div>
  );
}
