'use client';
// components/gift/EffectLayer.tsx
// Efek partikel layar penuh saat kado dibuka.
// Semua efek menggunakan Canvas 2D atau CSS animation.
// Hormati prefers-reduced-motion: jika aktif, skip animasi sama sekali.

import React, { useEffect, useRef, useCallback } from 'react';
import type { GiftEffectId } from '@/types/giftConfig';

interface Props {
  effectId: GiftEffectId;
  isActive: boolean;
  /** Callback setelah efek selesai (default 4 detik) */
  onComplete?: () => void;
}

// ─── Deteksi reduced-motion ───────────────────────────────────────────────
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ─── Deteksi performa HP (kasar) ─────────────────────────────────────────
function getParticleCount(base: number): number {
  if (typeof navigator === 'undefined') return base;
  const cores = navigator.hardwareConcurrency ?? 4;
  return cores <= 4 ? Math.floor(base * 0.55) : base;
}

// ─── Tipe partikel ────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  life: number;  // 0–1
  shape?: 'circle' | 'rect' | 'heart' | 'star';
}

// ─── Fungsi bantu ─────────────────────────────────────────────────────────
function rand(min: number, max: number) { return min + Math.random() * (max - min); }
function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// Gambar hati di canvas
function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.bezierCurveTo(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.3);
  ctx.bezierCurveTo(x - size * 0.5, y + size * 0.6, x, y + size * 0.8, x, y + size);
  ctx.bezierCurveTo(x, y + size * 0.8, x + size * 0.5, y + size * 0.6, x + size * 0.5, y + size * 0.3);
  ctx.bezierCurveTo(x + size * 0.5, y, x, y, x, y + size * 0.3);
  ctx.closePath();
  ctx.fill();
}

// Gambar bintang
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const innerAngle = angle + (2 * Math.PI) / 10;
    if (i === 0) ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    else ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.lineTo(cx + Math.cos(innerAngle) * r * 0.4, cy + Math.sin(innerAngle) * r * 0.4);
  }
  ctx.closePath();
  ctx.fill();
}

// ─── Konfigurasi tiap efek ────────────────────────────────────────────────
const EFFECT_CONFIGS: Record<GiftEffectId, {
  colors: string[];
  baseCount: number;
  createParticle: (w: number, h: number) => Particle;
  drawParticle: (ctx: CanvasRenderingContext2D, p: Particle) => void;
  updateParticle: (p: Particle) => void;
}> = {
  petals: {
    colors: ['#fda4af','#f9a8d4','#fbcfe8','#fce7f3','#fecdd3'],
    baseCount: 60,
    createParticle: (w, h) => ({
      x: rand(0, w), y: rand(-50, -10),
      vx: rand(-0.8, 0.8), vy: rand(1.5, 3),
      size: rand(8, 18), color: randItem(['#fda4af','#f9a8d4','#fbcfe8']),
      alpha: rand(0.6, 1), rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.04, 0.04), life: 1, shape: 'circle',
    }),
    drawParticle: (ctx, p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha * p.life;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    updateParticle: (p) => {
      p.x += p.vx + Math.sin(p.life * 10) * 0.5;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.life -= 0.004;
    },
  },

  flowers: {
    colors: ['#ec4899','#be185d','#f9a8d4','#a855f7','#fda4af'],
    baseCount: 40,
    createParticle: (w, h) => ({
      x: rand(0, w), y: rand(-30, h * 0.3),
      vx: rand(-1, 1), vy: rand(-3, -1),
      size: rand(10, 22), color: randItem(['#ec4899','#be185d','#f9a8d4']),
      alpha: 1, rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.06, 0.06), life: 1,
    }),
    drawParticle: (ctx, p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha * p.life;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((i * 2 * Math.PI) / 5);
        ctx.beginPath();
        ctx.ellipse(0, -p.size * 0.6, p.size * 0.3, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    updateParticle: (p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04; // gravity
      p.rotation += p.rotationSpeed;
      p.life -= 0.005;
    },
  },

  butterflies: {
    colors: ['#a855f7','#ec4899','#f9a8d4','#c4b5fd'],
    baseCount: 20,
    createParticle: (w, h) => ({
      x: rand(0, w), y: rand(h * 0.3, h * 0.8),
      vx: rand(-2, 2), vy: rand(-2.5, -0.5),
      size: rand(16, 28), color: randItem(['#a855f7','#ec4899','#c4b5fd']),
      alpha: 1, rotation: rand(-0.3, 0.3),
      rotationSpeed: rand(-0.02, 0.02), life: 1,
    }),
    drawParticle: (ctx, p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha * p.life;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      // Sayap kiri atas
      ctx.beginPath();
      ctx.ellipse(-p.size * 0.7, -p.size * 0.4, p.size * 0.7, p.size * 0.45, -0.5, 0, Math.PI * 2);
      ctx.fill();
      // Sayap kanan atas
      ctx.beginPath();
      ctx.ellipse(p.size * 0.7, -p.size * 0.4, p.size * 0.7, p.size * 0.45, 0.5, 0, Math.PI * 2);
      ctx.fill();
      // Sayap kiri bawah (lebih kecil)
      ctx.beginPath();
      ctx.ellipse(-p.size * 0.5, p.size * 0.2, p.size * 0.4, p.size * 0.3, -0.3, 0, Math.PI * 2);
      ctx.fill();
      // Sayap kanan bawah
      ctx.beginPath();
      ctx.ellipse(p.size * 0.5, p.size * 0.2, p.size * 0.4, p.size * 0.3, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Badan
      ctx.fillStyle = '#1c0a1a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.5, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    updateParticle: (p) => {
      p.x += p.vx + Math.sin(Date.now() * 0.003 + p.life * 20) * 1.2;
      p.y += p.vy + Math.cos(Date.now() * 0.004 + p.life * 15) * 0.8;
      p.life -= 0.004;
    },
  },

  hearts: {
    colors: ['#be185d','#ec4899','#f9a8d4','#fda4af','#ff6b8a'],
    baseCount: 50,
    createParticle: (w, h) => ({
      x: rand(0, w), y: rand(h * 0.6, h + 20),
      vx: rand(-1, 1), vy: rand(-4, -2),
      size: rand(10, 22), color: randItem(['#be185d','#ec4899','#f9a8d4']),
      alpha: 1, rotation: 0, rotationSpeed: 0, life: 1, shape: 'heart',
    }),
    drawParticle: (ctx, p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha * p.life;
      ctx.fillStyle = p.color;
      drawHeart(ctx, p.x - p.size * 0.5, p.y - p.size * 0.5, p.size);
      ctx.restore();
    },
    updateParticle: (p) => {
      p.x += p.vx + Math.sin(p.life * 8) * 0.6;
      p.y += p.vy;
      p.vy += 0.05;
      p.life -= 0.005;
    },
  },

  stars: {
    colors: ['#fcd34d','#fbbf24','#f59e0b','#ffffff','#fef9c3'],
    baseCount: 80,
    createParticle: (w, h) => ({
      x: rand(0, w), y: rand(0, h),
      vx: rand(-0.5, 0.5), vy: rand(-0.5, 0.5),
      size: rand(6, 16), color: randItem(['#fcd34d','#fbbf24','#ffffff']),
      alpha: rand(0.4, 1), rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.05, 0.05), life: 1, shape: 'star',
    }),
    drawParticle: (ctx, p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha * Math.abs(Math.sin(p.life * 8));
      ctx.fillStyle = p.color;
      drawStar(ctx, p.x, p.y, p.size);
      ctx.restore();
    },
    updateParticle: (p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.life -= 0.003;
      if (p.life < 0.1) p.life = 0.9; // twinkle loop
    },
  },

  confetti: {
    colors: ['#ec4899','#d97706','#fcd34d','#a855f7','#34d399','#f97316','#ffffff'],
    baseCount: 80,
    createParticle: (w, h) => ({
      x: rand(0, w), y: rand(-30, -5),
      vx: rand(-2, 2), vy: rand(3, 6),
      size: rand(6, 14), color: randItem(['#ec4899','#d97706','#fcd34d','#a855f7','#34d399']),
      alpha: 1, rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.15, 0.15), life: 1, shape: 'rect',
    }),
    drawParticle: (ctx, p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha * p.life;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillRect(-p.size * 0.5, -p.size * 0.25, p.size, p.size * 0.5);
      ctx.restore();
    },
    updateParticle: (p) => {
      p.x += p.vx + Math.sin(p.rotation) * 0.5;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.vy += 0.03;
      p.life -= 0.004;
    },
  },

  roses: {
    colors: ['#f9a8d4', '#fce7f3', '#fbcfe8', '#fdf2f8', '#c9a84c', '#f9f4e8'],
    baseCount: 55,
    createParticle: (w, h) => ({
      x: rand(0, w), y: rand(-60, -10),
      vx: rand(-0.6, 0.6), vy: rand(1.2, 2.8),
      size: rand(10, 22),
      color: randItem(['#f9a8d4', '#fbcfe8', '#fce7f3', '#fdf2f8', '#c9a84c']),
      alpha: rand(0.7, 1), rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.03, 0.03), life: 1, shape: 'circle',
    }),
    drawParticle: (ctx, p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha * p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      // Rose petal: layered ellipses with golden shimmer
      ctx.fillStyle = p.color;
      // Outer petal
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.55, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      // Inner petal highlight
      ctx.fillStyle = p.color === '#c9a84c' ? '#fef9c3' : '#ffffff';
      ctx.globalAlpha = (p.alpha * p.life) * 0.35;
      ctx.beginPath();
      ctx.ellipse(0, -p.size * 0.2, p.size * 0.25, p.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    updateParticle: (p) => {
      p.x += p.vx + Math.sin(p.life * 7 + p.rotation) * 0.4;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.life -= 0.0035;
    },
  },
};


// ─── Komponen Utama ───────────────────────────────────────────────────────

export default function EffectLayer({ effectId, isActive, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef<number>(0);
  const DURATION_MS = 4500;

  const stopEffect = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    particlesRef.current = [];
  }, []);

  useEffect(() => {
    if (!isActive) { stopEffect(); return; }
    if (prefersReducedMotion()) { onComplete?.(); return; }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cfg = EFFECT_CONFIGS[effectId] ?? EFFECT_CONFIGS['petals'];
    const count = getParticleCount(cfg.baseCount);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Init partikel
    particlesRef.current = Array.from({ length: count }, () =>
      cfg.createParticle(canvas.width, canvas.height)
    );

    startTimeRef.current = performance.now();

    // Hentikan otomatis setelah DURATION_MS
    const timer = setTimeout(() => {
      stopEffect();
      onComplete?.();
    }, DURATION_MS);

    // Stop saat tab tidak aktif
    const handleVisibility = () => {
      if (document.hidden) stopEffect();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0.01);

      // Spawn partikel baru secara bertahap
      if (particlesRef.current.length < count * 0.8 && Math.random() < 0.3) {
        particlesRef.current.push(cfg.createParticle(canvas.width, canvas.height));
      }

      for (const p of particlesRef.current) {
        cfg.drawParticle(ctx, p);
        cfg.updateParticle(p);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
      stopEffect();
    };
  }, [isActive, effectId, stopEffect, onComplete]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',
        zIndex: 999,
      }}
    />
  );
}
