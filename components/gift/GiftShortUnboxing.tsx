'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Sparkles,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Flower2,
  Gift as GiftIcon,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { getBucketSize } from '@/data/buckets';
import { preloadFlowers } from '@/utils/canvasUtils';
import type { StoredGift } from '@/lib/giftsStorage';

interface Props {
  gift: StoredGift;
}

export default function GiftShortUnboxing({ gift }: Props) {
  const { t, isEn } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [showPetals, setShowPetals] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Preload all flower & bouquet assets immediately so the unboxing never flickers
  useEffect(() => {
    const design = gift.designData;
    if (design && Array.isArray(design.selectedFlowers) && design.selectedFlowers.length > 0) {
      preloadFlowers(design.selectedFlowers, design.bucketSize || 'bucket-1');
    }
  }, [gift]);

  // Synthesizer audio context for gentle unboxing melody
  const audioContextRef = useRef<AudioContext | null>(null);

  const playMagicalChime = () => {
    if (isSoundMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const now = ctx.currentTime;
      // Arpeggio chords (C major 9th / Pentatonic: C5, E5, G5, B5, D6, E6)
      const notes = [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.3);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const handleOpenGift = () => {
    if (isOpen || isOpening) return;
    setIsOpening(true);
    playMagicalChime();

    // Trigger box opening and petals explosion
    setTimeout(() => {
      setShowPetals(true);
      setIsOpen(true);
      setIsOpening(false);
    }, 900);
  };

  const handleReplay = () => {
    setIsOpen(false);
    setIsOpening(false);
    setShowPetals(false);
  };

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch {
      // Ignore
    }
  };

  const design = gift.designData || {};
  const flowers = Array.isArray(design.selectedFlowers) ? design.selectedFlowers : [];
  const bucketInfo = getBucketSize(design.bucketSize || 'medium');
  const cardMessage = gift.message || design.text?.content || '';

  return (
    <div className="short-gift-root relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden">
      {/* Background radial atmosphere */}
      <div className="short-gift-bg-aura pointer-events-none" aria-hidden="true" />

      {/* Floating Petals FX */}
      {showPetals && (
        <div className="short-gift-petals-layer pointer-events-none" aria-hidden="true">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={i}
              className={`falling-petal-item petal-anim-${(i % 5) + 1}`}
              style={{
                left: `${(i * 4.7) % 96}%`,
                animationDelay: `${(i * 0.18) % 2.5}s`,
                animationDuration: `${3.5 + ((i * 0.3) % 2.5)}s`,
              }}
            >
              {['🌸', '🌺', '✨', '🌷', '✦'][i % 5]}
            </span>
          ))}
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="short-gift-topbar w-full px-4 py-3 flex items-center justify-between z-20">
        <Link href="/" className="short-gift-brand flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
            <Flower2 size={16} />
          </span>
          <span className="text-sm font-bold text-pink-900 tracking-tight">
            Bucket Bunga <span className="text-pink-600 font-serif italic">Laysa</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-pink-200 flex items-center justify-center text-pink-700 shadow-sm"
            title={isSoundMuted ? 'Nyalakan Musik' : 'Matikan Musik'}
            aria-label="Toggle Sound"
          >
            {isSoundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <LanguageSwitcher variant="compact" />
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="short-gift-stage flex-1 flex flex-col items-center justify-center px-4 py-6 z-10 w-full max-w-lg mx-auto">
        {!isOpen ? (
          /* ─── STAGE 1: CLOSED GIFT BOX ─── */
          <div
            className={`short-gift-box-wrapper w-full text-center flex flex-col items-center transition-all duration-700 ${
              isOpening ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
            }`}
          >
            {/* Header To / From Pill */}
            <div className="short-gift-card-tofrom mb-5 px-5 py-2.5 rounded-full bg-white/85 backdrop-blur-md border border-pink-200/90 shadow-md inline-flex items-center gap-2 text-xs font-semibold text-pink-900">
              <GiftIcon size={14} className="text-rose-500 animate-bounce" />
              <span>
                {isEn ? 'Gift for ' : 'Kado untuk '}
                <strong className="text-rose-600 font-bold">{gift.recipientName}</strong>
                {isEn ? ' from ' : ' dari '}
                <strong className="text-pink-700 font-bold">{gift.senderName}</strong>
              </span>
            </div>

            {/* Interactive 3D Gift Box Object */}
            <div
              onClick={handleOpenGift}
              className={`short-gift-box-object cursor-pointer select-none my-3 transform hover:scale-105 active:scale-95 transition-transform duration-300 ${
                isOpening ? 'opening-box-anim' : 'floating-box-anim'
              }`}
              role="button"
              tabIndex={0}
              aria-label={isEn ? 'Tap to open gift box' : 'Sentuh untuk membuka kotak kado'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleOpenGift();
              }}
            >
              <div className="gift-box-visual-3d">
                {/* Box Lid */}
                <div className={`gift-box-lid ${isOpening ? 'lid-lift-anim' : ''}`}>
                  <div className="gift-box-ribbon-bow">🎀</div>
                  <div className="gift-box-lid-base" />
                </div>
                {/* Box Base */}
                <div className="gift-box-body">
                  <div className="gift-box-vertical-ribbon" />
                  <div className="gift-box-horizontal-ribbon" />
                  <div className="gift-box-seal">
                    <span>💌</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Text */}
            <h1 className="text-xl sm:text-2xl font-black text-pink-950 mt-4 mb-2 tracking-tight">
              {isEn ? 'You Have a Special Flower Gift!' : 'Ada Kado Buket Spesial Untukmu!'}
            </h1>
            <p className="text-xs sm:text-sm text-pink-800/80 max-w-xs mx-auto mb-6">
              {isEn
                ? 'Tap the magic box above to untie the ribbon and see your bouquet.'
                : 'Sentuh kotak kado di atas untuk membuka pita dan melihat buket bungamu.'}
            </p>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleOpenGift}
              disabled={isOpening}
              className="short-gift-btn-open w-full max-w-xs py-4 px-6 rounded-2xl font-extrabold text-white text-base shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition-all"
              id="btn-open-gift-box"
            >
              <Sparkles size={18} className="animate-spin" />
              <span>
                {isOpening
                  ? isEn
                    ? 'Opening Gift…'
                    : 'Membuka Kado…'
                  : isEn
                  ? 'Tap to Open Gift 🎁'
                  : 'Ketuk untuk Buka Kado 🎁'}
              </span>
            </button>
          </div>
        ) : (
          /* ─── STAGE 2: REVEALED BOUQUET & HEARTFELT LETTER ─── */
          <div className="short-gift-revealed-wrapper w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
            {/* Top Greeting Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-pink-700 border border-pink-200 shadow-sm mb-4">
              <Heart size={14} className="text-rose-500 fill-rose-500 animate-pulse" />
              <span>
                {isEn ? `Special Bouquet for ${gift.recipientName}` : `Buket Spesial untuk ${gift.recipientName}`}
              </span>
            </div>

            {/* Bouquet Display Card with Aura */}
            <div className="short-gift-bouquet-card relative w-full rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-2xl border border-white/80 overflow-hidden mb-6">
              <div className="short-gift-bouquet-aura pointer-events-none" aria-hidden="true" />

              {/* Bouquet Image Display */}
              <div className="relative z-10 w-full flex items-center justify-center py-2 floating-bouquet-anim">
                {design.final2D?.image ? (
                  <img
                    src={design.final2D.image}
                    alt="Buket Bunga Spesial"
                    className="max-h-[360px] sm:max-h-[420px] w-auto object-contain rounded-2xl drop-shadow-2xl"
                  />
                ) : (
                  <div className="relative w-64 h-72 flex items-center justify-center">
                    {bucketInfo?.image && (
                      <Image
                        src={bucketInfo.image}
                        alt={bucketInfo.label}
                        width={280}
                        height={300}
                        className="object-contain drop-shadow-xl"
                        unoptimized
                      />
                    )}
                    <div className="absolute inset-0 pointer-events-none">
                      {flowers.map((f: any, idx: number) => {
                        const rot =
                          typeof f.rotation === 'number' && !isNaN(f.rotation)
                            ? f.rotation
                            : typeof f.customRotation === 'number' && !isNaN(f.customRotation)
                            ? (f.customRotation * 180) / Math.PI
                            : ((idx * 45) % 90) - 45;
                        const sc =
                          typeof f.scale === 'number' && !isNaN(f.scale)
                            ? Math.max(0.3, Math.min(3.0, f.scale))
                            : 0.85;
                        const leftPct =
                          f.isManual && typeof f.x === 'number'
                            ? `${Math.max(10, Math.min(90, (f.x / 500) * 100))}%`
                            : `${38 + (idx % 5) * 7}%`;
                        const topPct =
                          f.isManual && typeof f.y === 'number'
                            ? `${Math.max(10, Math.min(85, (f.y / 500) * 100))}%`
                            : `${28 + Math.floor(idx / 5) * 9}%`;

                        return (
                          <img
                            key={f.uid || idx}
                            src={f.imageUrl}
                            alt="bunga"
                            className="absolute w-14 h-14 object-contain"
                            style={{
                              left: leftPct,
                              top: topPct,
                              transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${sc})`,
                              zIndex: typeof f.zIndex === 'number' ? f.zIndex : idx + 1,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bouquet Summary Pill */}
              <div className="relative z-10 mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50/90 border border-pink-200 text-[11px] font-bold text-pink-700">
                <span>💐 {flowers.length > 0 ? `${flowers.length} Bunga Pilihan` : 'Rangkaian Cantik'}</span>
                <span>•</span>
                <span>🎀 Pita & Kertas Elegan</span>
              </div>
            </div>

            {/* Unfolded Love Note / Greeting Card */}
            <div className="short-gift-letter-card w-full rounded-3xl p-6 sm:p-7 shadow-xl border border-pink-100 bg-white/95 backdrop-blur-md mb-6 text-left relative overflow-hidden">
              <div className="short-gift-letter-seal absolute top-4 right-4 text-2xl select-none opacity-80">
                💌
              </div>

              <div className="mb-3">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">
                  {isEn ? 'TO' : 'UNTUK'}
                </span>
                <h2 className="text-xl font-black text-pink-950">
                  {gift.recipientName}
                </h2>
              </div>

              {/* Message Body */}
              <div className="my-4 p-4 rounded-2xl bg-pink-50/50 border border-pink-100/70">
                <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-medium whitespace-pre-wrap">
                  {cardMessage}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold block mb-0.5">
                  {isEn ? 'WITH HEARTFELT CARE FROM' : 'DENGAN TULUS DARI'}
                </span>
                <p className="text-base font-bold text-rose-600">
                  {gift.senderName}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="short-gift-actions-grid w-full flex flex-col sm:flex-row gap-3">
              {/* Buat Buket Juga Button (Required) */}
              <Link
                href="/"
                className="short-gift-btn-create flex-1 py-3.5 px-5 rounded-2xl font-extrabold text-white text-center shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                id="btn-create-bouquet-too"
              >
                <Sparkles size={16} />
                <span>{t('gift_create_own')}</span>
              </Link>

              {/* Salin Link Button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-3.5 px-5 rounded-2xl font-bold text-pink-800 bg-white/90 border border-pink-200 shadow-md hover:bg-pink-50 flex items-center justify-center gap-2 text-sm transform active:scale-95 transition-all"
                id="btn-copy-gift-link"
              >
                {isCopied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                <span>{isCopied ? t('gift_copied') : t('gift_copy_link')}</span>
              </button>

              {/* Putar Ulang Animasi */}
              <button
                type="button"
                onClick={handleReplay}
                className="w-12 h-12 rounded-2xl bg-white/90 border border-pink-200 flex items-center justify-center text-pink-700 shadow-md hover:bg-pink-50 shrink-0 self-center sm:self-auto"
                title={isEn ? 'Replay unboxing' : 'Buka kado lagi'}
                aria-label="Replay"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-[11px] text-pink-800/70 z-10">
        <p>© 2026 Bucket Bunga Laysa • Studio Buket Bunga Virtual</p>
      </footer>
    </div>
  );
}
