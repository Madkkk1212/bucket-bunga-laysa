'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Play, Lock, Star, Sparkles, Gamepad2, Puzzle, Dice5 } from 'lucide-react';

// ═══════════════════════════════════════════════════
// GAME CATALOG & PLACEHOLDERS
// ═══════════════════════════════════════════════════

interface MiniGame {
  id: string;
  title: string;
  badge: string;
  badgeBg: string;
  rating: string;
  posterUrl?: string;     // artwork if available
  year: string;
  genre: string;
  tagline: string;
  status: 'play' | 'soon';
  isPlaceholder?: boolean;
  glowColor: string;
  route: string;
  artwork: 'puzzle' | 'snakes' | 'congklak' | 'soon';
}

const GAMES: MiniGame[] = [
  {
    id: 'puzzle',
    title: 'Puzzle',
    badge: 'PUZZLE',
    badgeBg: '#6366f1',
    rating: '9.5',
    posterUrl: '/images/home.png',
    year: 'Siap Main',
    genre: 'Susun Foto · Solo',
    tagline: 'Pilih foto bunga atau upload fotomu sendiri, lalu susun potongan puzzle hingga utuh!',
    status: 'play',
    glowColor: 'rgba(99, 102, 241, 0.45)',
    route: '/minigames/puzzle',
    artwork: 'puzzle',
  },
  {
    id: 'ular-tangga',
    title: 'Ular Tangga',
    badge: 'ULAR TANGGA',
    badgeBg: '#10b981',
    rating: 'Baru',
    year: 'Siap Main',
    genre: 'Dadu · Lokal & Online',
    tagline: 'Lempar dadu, naiki tangga, hindari ular, dan balapan sampai kotak 100 bersama teman.',
    status: 'play',
    glowColor: 'rgba(16, 185, 129, 0.32)',
    route: '/minigames/ular-tangga',
    artwork: 'snakes',
  },
  {
    id: 'congklak',
    title: 'Congklak 3D',
    badge: 'CONGKLAK',
    badgeBg: '#9b6b37',
    rating: 'Baru',
    year: 'Siap Main',
    genre: 'Strategi · 2 Pemain',
    tagline: 'Sebarkan biji, kumpulkan ke rumahmu, dan tantang teman di papan congklak 3D.',
    status: 'play',
    glowColor: 'rgba(201, 162, 92, 0.35)',
    route: '/minigames/congklak',
    artwork: 'congklak',
  },
  {
    id: 'slot-3',
    title: 'Segera Hadir',
    badge: 'SLOT 3',
    badgeBg: 'rgba(255, 255, 255, 0.15)',
    rating: '—',
    year: 'Segera',
    genre: 'Slot Kosong',
    tagline: 'Ruang untuk mini game berikutnya. Sedang disiapkan!',
    status: 'soon',
    isPlaceholder: true,
    glowColor: 'rgba(148, 163, 184, 0.25)',
    route: '#',
    artwork: 'soon',
  },
  {
    id: 'slot-4',
    title: 'Segera Hadir',
    badge: 'SLOT 4',
    badgeBg: 'rgba(255, 255, 255, 0.15)',
    rating: '—',
    year: 'Segera',
    genre: 'Slot Kosong',
    tagline: 'Ruang untuk mini game berikutnya. Sedang disiapkan!',
    status: 'soon',
    isPlaceholder: true,
    glowColor: 'rgba(148, 163, 184, 0.25)',
    route: '#',
    artwork: 'soon',
  },
];

// ═══════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════

export default function MiniGamesHub() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragDelta = useRef(0);

  const prev = useCallback(() => setActive(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setActive(i => Math.min(GAMES.length - 1, i + 1)), []);

  // Direct navigation to /{gamenya}
  const handlePlay = useCallback((game: MiniGame) => {
    if (game.status === 'soon' || game.isPlaceholder) return;
    router.push(game.route);
  }, [router]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName))) return;
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, prev, next, handlePlay]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragDelta.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    dragDelta.current = e.touches[0].clientX - dragStartX.current;
  };
  const onTouchEnd = () => {
    if (dragDelta.current < -45) next();
    if (dragDelta.current > 45) prev();
  };

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(false);
    dragStartX.current = e.clientX;
    dragDelta.current = 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    dragDelta.current = e.clientX - dragStartX.current;
    if (Math.abs(dragDelta.current) > 5) setIsDragging(true);
  };
  const onMouseUp = () => {
    if (Math.abs(dragDelta.current) > 45) {
      if (dragDelta.current < 0) next(); else prev();
    }
    setIsDragging(false);
  };

  const activeGame = GAMES[active];

  return (
    <div className="mg-cinema-hub">
      {/* ── AMBIENT RADIAL GLOW ── */}
      <div
        className="mg-cinema-ambient"
        style={{
          background: `radial-gradient(circle 560px at 50% 50%, ${activeGame.glowColor} 0%, rgba(255,250,253,0.82) 62%, #fffafd 100%)`
        }}
        aria-hidden
      />

      {/* ── CINEMATIC TOP HEADER ── */}
      <header className="mg-cinema-header">
        <div className="mg-cinema-pill">
          <Sparkles size={13} className="text-amber-400" />
          <span>Mini Games Arcade</span>
        </div>
        <h1 className="mg-cinema-title">Pilih Game</h1>
        <p className="mg-cinema-desc">Geser atau klik poster untuk memilih game</p>
      </header>

      {/* ── CAROUSEL STAGE ── */}
      <div
        className="mg-cinema-stage"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="mg-cinema-track">
          {GAMES.map((game, idx) => {
            const offset = idx - active;
            const isActive = offset === 0;
            const isNear = Math.abs(offset) <= 2;

            // 3D Cover Flow Transform matching reference screenshot
            const translateX = offset * 210;
            const rotateY = offset * -22;
            const scale = isActive ? 1 : Math.max(0.72, 0.85 - Math.abs(offset) * 0.08);
            const opacity = isActive ? 1 : Math.max(0.35, 0.6 - Math.abs(offset) * 0.15);
            const zIndex = 20 - Math.abs(offset) * 5;

            return (
              <div
                key={game.id}
                className={`mg-poster-card ${isActive ? 'mg-poster-card--active' : ''} ${game.isPlaceholder ? 'mg-poster-card--placeholder' : ''}`}
                style={{
                  transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                  opacity,
                  zIndex,
                  visibility: isNear ? 'visible' : 'hidden',
                }}
                onClick={() => {
                  if (!isDragging) {
                    if (!isActive) {
                      setActive(idx);
                    } else {
                      handlePlay(game);
                    }
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  if (isActive) handlePlay(game);
                  else setActive(idx);
                }}
                role="button"
                tabIndex={isActive ? 0 : -1}
                aria-label={`${game.title} — ${game.status === 'play' ? 'Main sekarang' : 'Segera hadir'}`}
              >
                {/* Poster Artwork or Placeholder Canvas */}
                {game.posterUrl ? (
                  <div className="mg-poster-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={game.posterUrl}
                      alt={game.title}
                      className="mg-poster-img"
                      draggable={false}
                    />
                    <div className="mg-poster-overlay" />
                  </div>
                ) : (
                  <div className={`mg-poster-placeholder-body mg-poster-art--${game.artwork}`}>
                    <div className="mg-placeholder-grid-pattern" aria-hidden />
                    {game.artwork === 'snakes' ? (
                      <div className="mg-snake-art" aria-hidden="true">
                        <div className="mg-snake-art-board">
                          {Array.from({ length: 25 }, (_, cell) => <i key={cell} />)}
                          <span className="mg-snake-art-ladder" />
                          <span className="mg-snake-art-snake" />
                        </div>
                        <Dice5 size={54} strokeWidth={1.5} className="mg-snake-art-dice" />
                      </div>
                    ) : game.artwork === 'congklak' ? (
                      <div className="mg-congklak-art" aria-hidden="true">
                        {Array.from({ length: 7 }, (_, pit) => <i key={pit} />)}
                        <span className="mg-congklak-store" />
                      </div>
                    ) : (
                      <div className="mg-placeholder-icon-box">
                        {game.artwork === 'puzzle' ? <Puzzle size={36} /> : <Gamepad2 size={36} />}
                      </div>
                    )}
                  </div>
                )}

                {/* Top Badge & Rating Row */}
                <div className="mg-poster-top">
                  <div
                    className="mg-poster-badge"
                    style={{ background: game.badgeBg }}
                  >
                    {game.badge}
                  </div>
                  <div className="mg-poster-rating">
                    <span>{game.rating}</span>
                    {game.rating !== '—' && (
                      <Star size={11} className="mg-star-icon" fill="currentColor" />
                    )}
                  </div>
                </div>

                {/* Prominent Center Play or Plus Action on Active Card */}
                {isActive && (
                  <div className="mg-poster-center-action">
                    {game.status === 'play' ? (
                      <button
                        type="button"
                        className="mg-poster-play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(game);
                        }}
                        aria-label={`Mulai game ${game.title}`}
                        id={`mg-play-btn-${game.id}`}
                      >
                        <Play size={34} fill="currentColor" className="ml-1" />
                      </button>
                    ) : (
                      <div className="mg-poster-lock-icon" aria-label="Segera hadir">
                        <Lock size={26} />
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Information (Title, Year, Genre) */}
                <div className="mg-poster-bottom">
                  <h2 className="mg-poster-title">{game.title}</h2>
                  <div className="mg-poster-meta">
                    <span className="mg-meta-pill">{game.year}</span>
                    <span className="mg-meta-dot">•</span>
                    <span className="mg-meta-genre">{game.genre}</span>
                  </div>
                  {isActive && (
                    <p className="mg-poster-tagline">{game.tagline}</p>
                  )}
                </div>

                {/* Highlight Glow Border */}
                {isActive && (
                  <div
                    className="mg-poster-glow-border"
                    style={{
                      boxShadow: game.isPlaceholder
                        ? '0 0 0 2px rgba(255,255,255,0.12), 0 15px 40px rgba(0,0,0,0.6)'
                        : `0 0 0 2px rgba(255,255,255,0.25), 0 15px 45px ${game.glowColor}`,
                    }}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── ARROW NAVIGATION (LEFT / RIGHT) ── */}
        <button
          type="button"
          className="mg-cinema-arrow mg-cinema-arrow--prev"
          onClick={prev}
          disabled={active === 0}
          aria-label="Game sebelumnya"
          id="btn-mg-prev"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          type="button"
          className="mg-cinema-arrow mg-cinema-arrow--next"
          onClick={next}
          disabled={active === GAMES.length - 1}
          aria-label="Game berikutnya"
          id="btn-mg-next"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* ── BOTTOM CONTROLS & STATUS ── */}
      <footer className="mg-cinema-footer">
        {/* Dot indicators */}
        <div className="mg-cinema-dots" role="tablist" aria-label="Daftar game">
          {GAMES.map((game, idx) => (
            <button
              key={game.id}
              type="button"
              className={`mg-cinema-dot ${idx === active ? 'mg-cinema-dot--active' : ''}`}
              onClick={() => setActive(idx)}
              role="tab"
              aria-selected={idx === active}
              aria-label={game.title}
            />
          ))}
        </div>

        {/* Quick Launch CTA Button */}
        <div className="mg-cinema-cta-bar">
          {activeGame.status === 'play' ? (
            <button
              type="button"
              className="mg-cinema-cta-btn"
              onClick={() => handlePlay(activeGame)}
              id="btn-mg-main-sekarang"
            >
              <Play size={18} fill="currentColor" />
              <span>Mainkan Sekarang</span>
            </button>
          ) : (
            <div className="mg-cinema-cta-soon">
              <Lock size={15} />
              <span>Slot Kosong · Segera Hadir</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
