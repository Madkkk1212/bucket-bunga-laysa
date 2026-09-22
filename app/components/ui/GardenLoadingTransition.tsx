'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Flower2 } from 'lucide-react';

interface GardenLoadingTransitionProps {
  onFinish?: () => void;
  autoNavigate?: boolean;
  targetUrl?: string;
  durationMs?: number;
  standalone?: boolean;
}

const GARDEN_STAGES = [
  {
    min: 0,
    max: 33,
    title: 'Membuka Gerbang Taman Bunga...',
    subtitle: 'Menghirup semerbak aroma wisteria, mawar mekar, dan embun pagi',
    icon: '🌿',
  },
  {
    min: 34,
    max: 70,
    title: 'Memetik Kuntum Bunga Pilihan Segar...',
    subtitle: 'Menyiapkan mawar beludru, krisan pompom, dan aster warna-warni',
    icon: '🌸',
  },
  {
    min: 71,
    max: 100,
    title: 'Mempersiapkan Studio Rangkai...',
    subtitle: 'Menata kertas buket bersayap & pita garis impian Anda',
    icon: '✨',
  },
];

const PETALS = [
  { id: 1, left: '4%', delay: '0s', dur: '4.5s', size: 24, emoji: '🌸' },
  { id: 2, left: '12%', delay: '0.8s', dur: '5.2s', size: 20, emoji: '🌺' },
  { id: 3, left: '20%', delay: '0.3s', dur: '4.8s', size: 22, emoji: '🌷' },
  { id: 4, left: '29%', delay: '1.4s', dur: '5.5s', size: 18, emoji: '🌸' },
  { id: 5, left: '38%', delay: '0.2s', dur: '4.6s', size: 21, emoji: '✨' },
  { id: 6, left: '48%', delay: '1.8s', dur: '5.3s', size: 26, emoji: '🌸' },
  { id: 7, left: '58%', delay: '0.5s', dur: '4.9s', size: 20, emoji: '🌼' },
  { id: 8, left: '68%', delay: '1.1s', dur: '4.4s', size: 23, emoji: '🌺' },
  { id: 9, left: '77%', delay: '0.1s', dur: '5.0s', size: 22, emoji: '🌸' },
  { id: 10, left: '86%', delay: '1.6s', dur: '4.7s', size: 24, emoji: '🌷' },
  { id: 11, left: '94%', delay: '0.7s', dur: '5.2s', size: 19, emoji: '✨' },
  { id: 12, left: '15%', delay: '2.1s', dur: '4.9s', size: 22, emoji: '🌸' },
  { id: 13, left: '62%', delay: '2.4s', dur: '4.7s', size: 21, emoji: '🌺' },
  { id: 14, left: '82%', delay: '2.7s', dur: '5.1s', size: 23, emoji: '🌷' },
];

const emptySubscribe = () => () => {};

export default function GardenLoadingTransition({
  onFinish,
  autoNavigate = true,
  targetUrl = '/designer',
  durationMs = 2000,
  standalone = false,
}: GardenLoadingTransitionProps) {
  const router = useRouter();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [progress, setProgress] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    // Prevent background scrolling while loading overlay is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const startTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const rawPct = Math.min(100, (elapsed / durationMs) * 100);

      // Smooth natural blooming curve
      const easeProgress = 100 * (1 - Math.pow(1 - rawPct / 100, 2.2));
      setProgress(Math.round(easeProgress));

      if (rawPct < 100) {
        animId = requestAnimationFrame(tick);
      } else {
        setIsExiting(true);
        setTimeout(() => {
          if (onFinish) onFinish();
          if (autoNavigate && !standalone) {
            router.push(targetUrl);
          }
        }, 280);
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      document.body.style.overflow = originalOverflow;
      if (animId) cancelAnimationFrame(animId);
    };
  }, [durationMs, autoNavigate, onFinish, targetUrl, router, standalone]);

  const currentStage =
    GARDEN_STAGES.find((s) => progress >= s.min && progress <= s.max) || GARDEN_STAGES[0];

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onFinish) onFinish();
      if (autoNavigate && !standalone) {
        router.push(targetUrl);
      }
    }, 120);
  };

  // Ensure portal only runs on the client to avoid SSR hydration mismatches
  if (!mounted) return null;

  const overlayContent = (
    <aside
      className={`garden-fullscreen-overlay ${isExiting ? 'garden-overlay-exit' : ''}`}
      role="status"
      aria-label="Loading Studio Buket Bunga"
      style={{
        position: 'fixed',
        inset: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ─── 1. FULL PAGE PANORAMA: ENCHANTED FLOWER GARDEN ─── */}
      <div className="garden-fullscreen-backdrop">
        <Image
          src="/images/flower_garden_portal.jpg"
          alt="Taman Bunga Laysa Atelier"
          fill
          priority
          sizes="100vw"
          className="garden-fullscreen-bg-img"
        />
        {/* Soft Dreamy Sunbeams & Ambient Glow */}
        <div className="garden-fullscreen-mist" />
        <div className="garden-fullscreen-sunbeams" />
      </div>

      {/* ─── 2. FLOATING PETALS & FLUTTERING BUTTERFLIES ─── */}
      <div className="garden-fullscreen-petals" aria-hidden="true">
        {PETALS.map((p) => (
          <span
            key={p.id}
            className="garden-falling-petal"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.dur,
              fontSize: `${p.size}px`,
            }}
          >
            {p.emoji}
          </span>
        ))}

        {/* Fluttering Butterflies */}
        <div className="garden-butterfly butterfly-1">
          <span className="butterfly-wings">🦋</span>
        </div>
        <div className="garden-butterfly butterfly-2">
          <span className="butterfly-wings">🦋</span>
        </div>
      </div>

      {/* ─── 3. CENTERED FULL-SCREEN GLASSMORPHISM LOADER ─── */}
      <div className="garden-fullscreen-content">
        <div className="garden-fullscreen-card">
          {/* Top Badge */}
          <div className="garden-badge-wrap">
            <span className="garden-atelier-badge">
              <Sparkles size={13} className="text-amber-500" />
              <span>TAMAN BUNGA ATELIER LAYSA</span>
              <Sparkles size={13} className="text-amber-500" />
            </span>
          </div>

          {/* Central Blooming Flower Emblem */}
          <div className="garden-flower-emblem-wrap">
            <div className="flower-emblem-halo-outer" />
            <div className="flower-emblem-halo-inner" />
            <div className="flower-emblem-disc">
              <Image
                src="/images/blooming_garden_flower.jpg"
                alt="Bunga Mekar di Taman"
                width={140}
                height={140}
                priority
                className="flower-emblem-img"
              />
              <div className="flower-emblem-glow" />
            </div>
          </div>

          {/* Dynamic Stage Typography */}
          <div className="garden-stage-text-block">
            <div className="stage-icon-bounce">{currentStage.icon}</div>
            <h2 className="stage-heading">{currentStage.title}</h2>
            <p className="stage-subheading">{currentStage.subtitle}</p>
          </div>

          {/* Botanical Progress Bar with Flower Marker */}
          <div className="garden-progress-block">
            <div className="progress-track-botanical">
              <div
                className="progress-fill-botanical"
                style={{ width: `${Math.min(100, Math.max(4, progress))}%` }}
              >
                <div className="progress-flower-tip">
                  <Flower2 size={16} className="tip-flower-icon" />
                </div>
              </div>
            </div>

            <div className="progress-meta-row">
              <span className="progress-quote-text">
                Menyusun keindahan bunga segar untuk momen istimewa Anda...
              </span>
              <span className="progress-percentage-val">{progress}%</span>
            </div>
          </div>

          {/* Quick Skip Button */}
          {!standalone && (
            <div className="garden-skip-action-wrap">
              <button
                type="button"
                className="garden-skip-action-btn"
                onClick={handleSkip}
                title="Langsung Masuk ke Studio Rancang"
              >
                <span>Langsung Masuk ke Studio</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  // Mount directly into document.body outside all local containers
  return createPortal(overlayContent, document.body);
}
