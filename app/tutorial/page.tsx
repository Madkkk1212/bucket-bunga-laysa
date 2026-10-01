'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ArrowRight, Move, Download, Sparkles, 
  Layers, Palette, Award, ShieldCheck, Heart, Zap, CheckCircle2, ChevronRight
} from 'lucide-react';
import HomeBackgroundVideo from '@/components/home/HomeBackgroundVideo';
import FlowerCountModal from '@/components/designer/FlowerCountModal';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { FlowerCountVariant } from '@/types/design';
import { DesignProvider } from '@/context/DesignContext';

export default function TutorialPage() {
  return (
    <DesignProvider>
      <TutorialGameContent />
    </DesignProvider>
  );
}

function TutorialGameContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [activeStageTab, setActiveStageTab] = useState<number | null>(null);

  // Sound effect synthesizer (Web Audio API - lightweight & fast)
  const playSfx = (type: 'hover' | 'select' | 'portal') => {
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
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'select') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'portal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Audio context might be restricted before interaction, ignore safely
    }
  };

  const handleConfirmFlowerCount = (count: FlowerCountVariant) => {
    setIsCountModalOpen(false);
    playSfx('portal');
    router.push(`/designer?flowers=${count}`);
  };

  const scrollToStage = (stageId: string, index: number) => {
    playSfx('select');
    setActiveStageTab(index);
    const element = document.getElementById(stageId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="game-tutorial-container game-theme-arena relative min-h-screen">
      {/* ── 1. CINEMATIC VIDEO BACKGROUND ── */}
      <HomeBackgroundVideo />

      {/* ── 2. TOP GAME HUD HEADER ── */}
      <header className="game-hud-topbar" aria-label="Game HUD">
        <div className="game-hud-inner">
          {/* Tombol Kembali ke Menu Game */}
          <Link
            href="/menu"
            className="game-hud-back-btn"
            onClick={() => playSfx('hover')}
            aria-label={t('tut_back_menu')}
          >
            <ArrowLeft size={15} />
            <span>{t('tut_back_menu')}</span>
          </Link>

          {/* Judul Arena / Header Mode */}
          <div className="game-hud-title-wrap">
            <span className="game-hud-subbadge">{t('tut_academy_badge')}</span>
            <h1 className="game-hud-heading">{t('tut_heading')}</h1>
          </div>

          {/* Right cluster: Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LanguageSwitcher variant="compact" />
          </div>
        </div>
      </header>

      {/* ── 3. FLOATING FLORAL PARTICLES ── */}
      <div className="floral-frame-decor" aria-hidden="true">
        <span className="floating-petal petal-1">🌸</span>
        <span className="floating-petal petal-2">✨</span>
        <span className="floating-petal petal-3">🌺</span>
        <span className="floating-petal petal-4">🌸</span>
        <span className="floating-petal petal-5">✨</span>
        <span className="floating-petal petal-6">🌷</span>
      </div>

      {/* ── 4. STAGE TIMELINE QUICK BAR (QUEST MAP) ── */}
      <div className="game-tutorial-map-bar">
        <div className="game-tutorial-map-inner">
          <span className="game-map-title">{t('tut_map_title')}</span>
          <div className="game-map-chips">
            {[
              { id: 'stage-1', label: t('tut_map_stage1') },
              { id: 'stage-2', label: t('tut_map_stage2') },
              { id: 'stage-3', label: t('tut_map_stage3') },
              { id: 'stage-4', label: t('tut_map_stage4') },
              { id: 'stage-5', label: t('tut_map_stage5') },
            ].map((step, idx) => (
              <button
                key={step.id}
                type="button"
                className={`game-map-chip ${activeStageTab === idx ? 'chip-active' : ''}`}
                onClick={() => scrollToStage(step.id, idx)}
                onMouseEnter={() => playSfx('hover')}
              >
                <span>{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. MAIN 5 QUEST STAGES CONTAINER ── */}
      <main className="game-tutorial-main">
        <div className="game-tutorial-content-wrap">

          {/* ══════════ STAGE 1: PILIH KERTAS BUKET ══════════ */}
          <section className="game-stage-card" id="stage-1">
            <div className="game-stage-card-header">
              <div className="game-stage-badge badge-rose">
                <span>{t('tut_stage1_badge')}</span>
              </div>
            </div>

            <div className="game-stage-grid">
              <div className="game-stage-info">
                <h2 className="game-stage-title">{t('tut_stage1_title')}</h2>
                <p className="game-stage-desc">
                  {t('tut_stage1_desc')}
                </p>

                <div className="game-stage-bullets">
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-rose">✦</span>
                    <div>
                      <strong>{t('tut_stage1_noir_title')}</strong> {t('tut_stage1_noir_desc')}
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-amber">✦</span>
                    <div>
                      <strong>{t('tut_stage1_kraft_title')}</strong> {t('tut_stage1_kraft_desc')}
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-pink">✦</span>
                    <div>
                      <strong>{t('tut_stage1_pastel_title')}</strong> {t('tut_stage1_pastel_desc')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="game-stage-visual">
                <div className="game-stage-visual-box">
                  <div className="game-stage-preview-row">
                    <div className="game-mini-thumb">
                      <Image src="/images/bucket/bucket-1.png" alt="Noir" width={75} height={75} />
                      <span>Noir</span>
                    </div>
                    <div className="game-mini-thumb thumb-highlight">
                      <Image src="/images/bucket/bucket-2.png" alt="Kraft" width={85} height={85} />
                      <span>Kraft ★</span>
                    </div>
                    <div className="game-mini-thumb">
                      <Image src="/images/bucket/bucket-3.png" alt="Pastel" width={75} height={75} />
                      <span>Pastel</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ STAGE 2: TATA BUNGA BEBAS DI KANVAS ══════════ */}
          <section className="game-stage-card" id="stage-2">
            <div className="game-stage-card-header">
              <div className="game-stage-badge badge-cyan">
                <span>{t('tut_stage2_badge')}</span>
              </div>
            </div>

            <div className="game-stage-grid">
              <div className="game-stage-info">
                <h2 className="game-stage-title">{t('tut_stage2_title')}</h2>
                <p className="game-stage-desc">
                  {t('tut_stage2_desc')}
                </p>

                <div className="game-stage-bullets">
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-cyan">✦</span>
                    <div>
                      <strong>{t('tut_stage2_drag_title')}</strong> {t('tut_stage2_drag_desc')}
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-cyan">✦</span>
                    <div>
                      <strong>{t('tut_stage2_layer_title')}</strong> {t('tut_stage2_layer_desc')}
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-cyan">✦</span>
                    <div>
                      <strong>{t('tut_stage2_rot_title')}</strong> {t('tut_stage2_rot_desc')}
                    </div>
                  </div>
                </div>

                <div className="game-stage-pro-tip">
                  <span className="pro-tip-tag">{t('tut_stage2_tip_tag')}</span>
                  <span>{t('tut_stage2_tip_desc')}</span>
                </div>
              </div>

              <div className="game-stage-visual">
                <div className="game-stage-visual-box">
                  <div className="visual-img-container">
                    <Image 
                      src="/images/tutorial/step2_arrange.png" 
                      alt={t('tut_stage2_title')} 
                      width={280} 
                      height={240} 
                      className="game-tutorial-img"
                    />
                    <div className="game-visual-pill">
                      <Move size={13} />
                      <span>{t('tut_stage2_visual_pill')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ STAGE 3: KARTU UCAPAN KALIGRAFI ══════════ */}
          <section className="game-stage-card" id="stage-3">
            <div className="game-stage-card-header">
              <div className="game-stage-badge badge-purple">
                <span>{t('tut_stage3_badge')}</span>
              </div>
            </div>

            <div className="game-stage-grid">
              <div className="game-stage-info">
                <h2 className="game-stage-title">{t('tut_stage3_title')}</h2>
                <p className="game-stage-desc">
                  {t('tut_stage3_desc')}
                </p>

                <div className="game-stage-bullets">
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-purple">✦</span>
                    <div>
                      <strong>{t('tut_stage3_tofrom_title')}</strong> {t('tut_stage3_tofrom_desc')}
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-purple">✦</span>
                    <div>
                      <strong>{t('tut_stage3_msg_title')}</strong> {t('tut_stage3_msg_desc')}
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-purple">✦</span>
                    <div>
                      <strong>{t('tut_stage3_font_title')}</strong> {t('tut_stage3_font_desc')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="game-stage-visual">
                <div className="game-stage-visual-box">
                  <div className="game-card-mockup-frame">
                    <div className="mockup-ribbon">{t('tut_stage3_card_badge')}</div>
                    <div className="mockup-to"><strong>{t('tut_stage3_card_to')}</strong> Sarah Az-Zahra</div>
                    <p className="mockup-msg">&ldquo;{t('tut_stage3_card_quote')}&rdquo;</p>
                    <div className="mockup-from"><strong>{t('tut_stage3_card_from')}</strong> Lutfi & Keluarga 💕</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ STAGE 4: CEK DESAIN & HARMONISASI ══════════ */}
          <section className="game-stage-card" id="stage-4">
            <div className="game-stage-card-header">
              <div className="game-stage-badge badge-amber">
                <span>{t('tut_stage4_badge')}</span>
              </div>
            </div>

            <div className="game-stage-grid">
              <div className="game-stage-info">
                <h2 className="game-stage-title">{t('tut_stage4_title')}</h2>
                <p className="game-stage-desc">
                  {t('tut_stage4_desc')}
                </p>

                <div className="game-stage-bullets">
                  <div className="game-stage-bullet-item">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>{t('tut_stage4_chk1_title')}</strong> {t('tut_stage4_chk1_desc')}
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>{t('tut_stage4_chk2_title')}</strong> {t('tut_stage4_chk2_desc')}
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>{t('tut_stage4_chk3_title')}</strong> {t('tut_stage4_chk3_desc')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="game-stage-visual">
                <div className="game-stage-visual-box">
                  <div className="visual-img-container">
                    <Image 
                      src="/images/tutorial/step4_preview.png" 
                      alt={t('tut_stage4_title')} 
                      width={280} 
                      height={240} 
                      className="game-tutorial-img"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ STAGE 5: EKSPOR GAMBAR ULTRA HD 4K ══════════ */}
          <section className="game-stage-card" id="stage-5">
            <div className="game-stage-card-header">
              <div className="game-stage-badge badge-emerald">
                <span>{t('tut_stage5_badge')}</span>
              </div>
            </div>

            <div className="game-stage-grid">
              <div className="game-stage-info">
                <h2 className="game-stage-title">{t('tut_stage5_title')}</h2>
                <p className="game-stage-desc">
                  {t('tut_stage5_desc')}
                </p>

                <div className="game-stage-bullets">
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-emerald">✦</span>
                    <div>
                      <strong>{t('tut_stage5_f1_title')}</strong> {t('tut_stage5_f1_desc')}
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-emerald">✦</span>
                    <div>
                      <strong>{t('tut_stage5_f2_title')}</strong> {t('tut_stage5_f2_desc')}
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-emerald">✦</span>
                    <div>
                      <strong>{t('tut_stage5_f3_title')}</strong> {t('tut_stage5_f3_desc')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="game-stage-visual">
                <div className="game-stage-visual-box">
                  <div className="game-export-showcase">
                    <div className="export-aura-ring" />
                    <Image src="/images/home.png" alt={t('tut_stage5_title')} width={140} height={140} className="export-thumb-img" />
                    <div className="export-pill-btn">
                      <Download size={13} />
                      <span>{t('tut_stage5_btn_pill')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ GAME BOSS BANNER / CTA AKHIR ══════════ */}
          <div className="game-tutorial-cta-banner">
            <div className="cta-banner-content">
              <span className="cta-banner-badge">{t('tut_cta_badge')}</span>
              <h2 className="cta-banner-title">{t('tut_cta_title')}</h2>
              <p className="cta-banner-desc">
                {t('tut_cta_desc')}
              </p>
              
              <div className="cta-banner-actions">
                <button
                  type="button"
                  id="btn-tutorial-start"
                  className="game-btn-massive"
                  onClick={() => {
                    playSfx('select');
                    setIsCountModalOpen(true);
                  }}
                >
                  <Sparkles size={20} className="game-sparkle-spin" />
                  <span>{t('tut_cta_btn')}</span>
                  <ArrowRight size={20} className="game-arrow-pulse" />
                </button>

                <Link
                  href="/menu"
                  className="game-hud-back-btn"
                  onClick={() => playSfx('hover')}
                >
                  <ArrowLeft size={16} />
                  <span>{t('tut_cta_back')}</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── 6. BOTTOM HUD FOOTER ── */}
      <footer className="game-bottom-hud" aria-label="Status Bar">
        <div className="game-hud-hint">
          <span>{t('tut_hud_hint')}</span>
        </div>
        <div className="game-hud-version">
          <span>{t('home_hud_version')}</span>
        </div>
      </footer>

      {/* ── 7. FLOWER COUNT MODAL (KETIKA KLIK MULAI) ── */}
      <FlowerCountModal
        isOpen={isCountModalOpen}
        onClose={() => setIsCountModalOpen(false)}
        onConfirm={handleConfirmFlowerCount}
        canDismiss={true}
      />
    </div>
  );
}
