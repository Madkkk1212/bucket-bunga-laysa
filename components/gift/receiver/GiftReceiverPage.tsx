'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Sparkles,
  Music,
  Volume2,
  VolumeX,
  RotateCcw,
  Flag,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { getBucketSize } from '@/data/buckets';
import { BACKGROUND_THEMES } from '@/utils/canvasUtils';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { getTemplateConfig } from '../templates';
import GiftObjectScene from '../GiftObjectScene';
import EffectLayer from '../EffectLayer';
import PhotoDisplay, { PhotoItem } from './PhotoDisplay';
import DigitalGiftLanding from './DigitalGiftLanding';
import YouTubePlayer from './YouTubePlayer';
import ReportModal from './ReportModal';
import type { GiftData, GiftConfig } from '@/types/giftConfig';

interface Props {
  giftId: string;
}

export default function GiftReceiverPage({ giftId }: Props) {
  const { isEn } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [gift, setGift] = useState<GiftData | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Experience state
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showEffect, setShowEffect] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // YouTube preload: render iframe immediately after gift loaded,
  // trigger play on open (no delay waiting for animation)
  const ytPlayerRef = useRef<HTMLIFrameElement | null>(null);
  const ytPlayTriggered = useRef(false);

  // Procedural audio synthesizer fallback
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const melodyTimerRef = useRef<any>(null);

  // Fetch gift data
  useEffect(() => {
    if (!giftId) return;

    fetch(`/api/gifts/${giftId}`)
      .then((res) => {
        if (res.status === 410) {
          setIsExpired(true);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.gift) {
          setGift(data.gift);
        } else {
          setError(data.message || (isEn ? 'Gift not found.' : 'Hadiah tidak ditemukan.'));
        }
      })
      .catch(() => {
        setError(isEn ? 'Failed to load gift.' : 'Gagal memuat hadiah digital.');
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch photos
    fetch(`/api/gifts/${giftId}/photos`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.photos)) {
          setPhotos(data.photos);
        }
      })
      .catch(() => {});
  }, [giftId, isEn]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      if (melodyTimerRef.current) clearTimeout(melodyTimerRef.current);
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend();
      }
    };
  }, []);

  // Procedural BGM synthesizer
  const startProceduralBGM = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
      }
      const ctx = audioContextRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const freqs = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
      const playChime = () => {
        if (!ctx || ctx.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const freq = freqs[Math.floor(Math.random() * freqs.length)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2.3);

        const nextTime = 700 + Math.random() * 900;
        melodyTimerRef.current = setTimeout(playChime, nextTime);
      };

      playChime();
      setIsSynthPlaying(true);
    } catch {
      // Audio not supported
    }
  };

  const stopProceduralBGM = () => {
    if (melodyTimerRef.current) clearTimeout(melodyTimerRef.current);
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
    }
    setIsSynthPlaying(false);
  };

  const toggleSynth = () => {
    if (isSynthPlaying) stopProceduralBGM();
    else startProceduralBGM();
  };

  // Trigger YT play immediately when user interacts (gesture)
  const triggerYTPlay = () => {
    if (ytPlayTriggered.current) return;
    ytPlayTriggered.current = true;
    const iframe = ytPlayerRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
        '*'
      );
    }
  };

  // Open Gift sequence
  const handleOpenGift = () => {
    if (isOpen || isOpening) return;
    setIsOpening(true);

    // Trigger audio immediately on user gesture — no delay
    const config = gift?.config;
    if (config?.youtubeVideoId) {
      triggerYTPlay();
    } else {
      startProceduralBGM();
    }

    setTimeout(() => {
      setIsOpen(true);
      setShowEffect(true);
      setIsOpening(false);
    }, 700);
  };

  // Replay
  const handleReplay = () => {
    setIsOpen(false);
    setIsOpening(false);
    setShowEffect(false);
    stopProceduralBGM();
  };

  // Loading state
  if (loading) {
    return (
      <div
        suppressHydrationWarning
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-4"
      >
        <div className="gift-spinner-ring" />
        <p className="mt-4 text-sm font-medium text-pink-700 animate-pulse">
          {isEn ? 'Preparing your digital bouquet gift...' : 'Mempersiapkan buket hadiah digital Anda...'}
        </p>
      </div>
    );
  }

  // Expired state
  if (isExpired) {
    return (
      <div
        suppressHydrationWarning
        className="min-h-screen flex items-center justify-center bg-stone-50 p-4"
      >
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-stone-100">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Calendar size={32} />
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">
            {isEn ? 'Gift Link Has Expired' : 'Link Kado Sudah Berakhir'}
          </h2>
          <p className="text-xs text-stone-600 mb-6 leading-relaxed">
            {isEn
              ? 'This digital bouquet gift link has reached its active duration according to the sender package.'
              : 'Masa aktif tautan kado buket digital ini telah selesai sesuai dengan durasi paket pengirim.'}
          </p>
          <Link href="/designer" className="btn btn-primary inline-flex items-center gap-2 w-full justify-center">
            <Sparkles size={16} />
            <span>{isEn ? 'Create New Bouquet' : 'Buat Buket Baru'}</span>
          </Link>
        </div>
      </div>
    );
  }

  // Error / Not found state
  if (error || !gift) {
    return (
      <div
        suppressHydrationWarning
        className="min-h-screen flex items-center justify-center bg-stone-50 p-4"
      >
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-stone-100">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 text-3xl">
            🥀
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">
            {isEn ? 'Gift Not Found' : 'Hadiah Tidak Ditemukan'}
          </h2>
          <p className="text-xs text-stone-600 mb-6">{error}</p>
          <Link href="/designer" className="btn btn-primary inline-flex items-center gap-2 w-full justify-center">
            <Sparkles size={16} />
            <span>{isEn ? 'Design Bouquet in Studio' : 'Rangkai Buket di Studio'}</span>
          </Link>
        </div>
      </div>
    );
  }

  // Template configuration
  const config = gift.config;
  const templateConfig = getTemplateConfig(config?.templateId);
  const isLandingPageTemplate = ['cerita-kita', 'film-kenangan', 'album-surat'].includes(templateConfig.id);
  const giftObjectId = config?.giftObjectId || templateConfig.defaults.giftObjectId;
  const effectId = config?.effectId || templateConfig.defaults.effectId;
  const giftTitle = config?.title || (isEn ? templateConfig.defaults.titleEn : templateConfig.defaults.titleId);

  const design = (gift.designData || {}) as any;
  const bucketId = design.bucketSize || 'bucket-1';
  const bucketInfo = getBucketSize(bucketId);
  const flowers = (design.selectedFlowers || []) as Array<{ uid?: string; imageUrl?: string }>;
  const currentTheme = BACKGROUND_THEMES.find((t) => t.id === design.bgTheme) || BACKGROUND_THEMES[0];
  const bouquetVisual = (
    <div className="gift-bouquet-visual max-w-md w-full flex items-center justify-center">
      {design.final2D?.image ? (
        <img src={design.final2D.image} alt={isEn ? 'A special bouquet' : 'Buket bunga spesial'} className="gift-final-image max-h-[480px] w-auto object-contain rounded-2xl drop-shadow-2xl" />
      ) : (
        <div className="gift-composite-wrap relative w-72 h-80 flex items-center justify-center">
          {bucketInfo?.image && <Image src={bucketInfo.image} alt={bucketInfo.label} width={320} height={340} className="gift-bucket-img object-contain drop-shadow-xl" unoptimized />}
          <div className="gift-flowers-overlay absolute inset-0 pointer-events-none">
            {flowers.slice(0, 15).map((f, idx: number) => (
              <img key={f.uid || idx} src={f.imageUrl} alt={isEn ? 'Flower' : 'Bunga'} className="gift-overlay-flower absolute w-16 h-16 object-contain" style={{ left: `${40 + (idx % 5) * 6}%`, top: `${30 + Math.floor(idx / 5) * 8}%`, transform: `translate(-50%, -50%) rotate(${((idx * 45) % 90) - 45}deg) scale(0.85)` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      suppressHydrationWarning
      className={`gift-page-root min-h-screen relative overflow-x-hidden ${templateConfig.rootClass}`}
      style={{
        background: templateConfig.bgStyle || currentTheme?.previewColor || 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #fce7f3 100%)',
      }}
    >
      {/* Dynamic Google Fonts for Template */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href={`https://fonts.googleapis.com/css2?family=${templateConfig.fonts.heading}:wght@${templateConfig.fonts.headingWeight}&family=${templateConfig.fonts.body}:wght@${templateConfig.fonts.bodyWeight}&display=swap`}
        rel="stylesheet"
      />

      {/* Floating Language Switcher */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 50 }}>
        <LanguageSwitcher variant="compact" />
      </div>

      {/* Fullscreen Effect Layer */}
      {showEffect && (
        <EffectLayer
          effectId={effectId}
          isActive={showEffect}
          onComplete={() => setShowEffect(false)}
        />
      )}

      {/* Music Player: YouTube — preloaded immediately, shown after open */}
      {config?.youtubeVideoId ? (
        <YouTubePlayer
          ref={ytPlayerRef}
          videoId={config.youtubeVideoId}
          startSeconds={config.youtubeStartSeconds || 0}
          autoPlay={false}
          preload={!isOpen}
          onFallbackAudio={startProceduralBGM}
          isEn={isEn}
          isOpen={isOpen}
        />
      ) : isOpen && (
        <button
          type="button"
          className="gift-bgm-toggle"
          onClick={toggleSynth}
          title={isSynthPlaying ? (isEn ? 'Mute Music' : 'Matikan Melodi') : (isEn ? 'Play Music' : 'Nyalakan Melodi')}
        >
          {isSynthPlaying ? (
            <>
              <Volume2 size={16} className="text-pink-600 animate-pulse" />
              <span>{isEn ? 'Floral Melody' : 'Melodi Bunga'}</span>
            </>
          ) : (
            <>
              <VolumeX size={16} className="text-gray-400" />
              <span>{isEn ? 'Muted' : 'Melodi Hening'}</span>
            </>
          )}
        </button>
      )}

      {/* ─── STATE 1: UNOPENED OBJECT SCENE ─── */}
      {isLandingPageTemplate ? (
        <DigitalGiftLanding
          templateId={templateConfig.id as 'cerita-kita' | 'film-kenangan' | 'album-surat'}
          title={giftTitle}
          senderName={gift.senderName}
          recipientName={gift.recipientName}
          message={gift.message}
          landingText={config?.landingText}
          photos={photos}
          bouquet={bouquetVisual}
          isOpen={isOpen}
          isOpening={isOpening}
          isEn={isEn}
          onOpenGift={handleOpenGift}
        />
      ) : !isOpen ? (
        <div className={`gift-unopened-container min-h-screen w-full flex items-center justify-center p-4 ${isLandingPageTemplate ? 'gift-story-cover-container' : ''}`}>
          {isLandingPageTemplate ? (
            <section className="gift-story-cover">
              <div className="gift-story-cover-photo">
                {photos[0] ? (
                  <img src={photos[0].url} alt={photos[0].altText || (isEn ? 'A favorite memory' : 'Kenangan pilihan')} />
                ) : <div className="gift-story-cover-fallback" aria-hidden="true">✿</div>}
                <span>{isEn ? 'A memory, kept for you' : 'Kenangan yang kusimpan untukmu'}</span>
              </div>
              <div className="gift-story-cover-copy">
                <p>{isEn ? 'A SMALL PAGE, JUST FOR YOU' : 'SEBUAH HALAMAN KECIL, KHUSUS UNTUKMU'}</p>
                <span className="gift-story-cover-to">{isEn ? `For ${gift.recipientName}` : `Untuk ${gift.recipientName}`}</span>
                <h1 style={{ fontFamily: templateConfig.fonts.heading.replace('+', ' ') }}>{giftTitle}</h1>
                <div className="gift-story-cover-rule" />
                <span className="gift-story-cover-from">{isEn ? `With love, ${gift.senderName}` : `Dengan tulus, ${gift.senderName}`}</span>
                <button type="button" onClick={handleOpenGift} disabled={isOpening}>
                  <Sparkles size={17} /> {isOpening ? (isEn ? 'Opening…' : 'Membuka…') : (isEn ? 'Open our story' : 'Buka cerita kita')}
                </button>
                <small>{isEn ? 'Tap to reveal the photos, bouquet and letter' : 'Sentuh untuk melihat foto, buket, dan surat'}</small>
              </div>
            </section>
          ) : (
          <div className="gift-envelope-box max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-200/80 text-center flex flex-col items-center">
            {/* Top Badge */}
            <div className="gift-envelope-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-100 mb-6">
              <Sparkles size={14} />
              <span>{isEn ? 'SPECIAL DIGITAL SURPRISE' : 'KEJUTAN BUKET DIGITAL'}</span>
            </div>

            {/* Custom Interactive SVG Object */}
            <div className="my-2 transform hover:scale-105 transition-transform duration-300">
              <GiftObjectScene
                giftObjectId={giftObjectId}
                isOpening={isOpening}
                onClick={handleOpenGift}
              />
            </div>

            {/* Title / Greeting banner */}
            <p className="mt-4 text-sm font-medium text-pink-600 italic">
              {giftTitle}
            </p>

            {/* Addresses */}
            <div className="gift-envelope-addresses w-full my-6 p-4 rounded-2xl bg-stone-50/70 border border-stone-100">
              <div className="gift-addr-to mb-3">
                <span className="gift-addr-label text-xs uppercase tracking-wider text-stone-400 font-semibold block mb-0.5">
                  {isEn ? 'To the most special one:' : 'Untuk yang teristimewa:'}
                </span>
                <h1
                  className="gift-addr-name text-2xl font-bold text-stone-900"
                  style={{ fontFamily: templateConfig.fonts.heading.replace('+', ' ') }}
                >
                  {gift.recipientName}
                </h1>
              </div>

              <div className="gift-addr-divider h-px bg-stone-200/70 w-24 mx-auto my-2" />

              <div className="gift-addr-from">
                <span className="gift-addr-label text-xs uppercase tracking-wider text-stone-400 font-semibold block mb-0.5">
                  {isEn ? 'Arranged with heartfelt care from:' : 'Rangkaian tulus dari:'}
                </span>
                <p className="gift-sender-name text-base font-semibold text-pink-700">
                  {gift.senderName}
                </p>
              </div>
            </div>

            {/* Open Button */}
            <button
              type="button"
              className="gift-btn-open-seal w-full py-3.5 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
              onClick={handleOpenGift}
              disabled={isOpening}
              id="btn-open-gift-envelope"
            >
              <Sparkles size={18} />
              <span>
                {isOpening
                  ? (isEn ? 'Opening surprise...' : 'Membuka kejutan...')
                  : (isEn ? 'Open Surprise & Reveal Bouquet' : 'Buka Kado & Lihat Buketmu')}
              </span>
            </button>

            <span className="gift-open-hint text-[11px] text-stone-400 mt-2">
              {isEn ? 'Tap to play music & open bouquet' : 'Sentuh untuk memutar lagu & melihat buket'}
            </span>
          </div>
          )}
        </div>
      ) : (
        /* ─── STATE 2: REVEALED BOUQUET & LOVE LETTER ─── */
        <div className="gift-opened-wrapper max-w-3xl mx-auto px-4 py-12 animate-in fade-in duration-700">
          {/* Header Greeting */}
          <div className="gift-revealed-header text-center mb-8">
            <span className="gift-greeting-chip inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/80 backdrop-blur-xs text-pink-700 border border-pink-200 shadow-sm mb-3">
              <Heart size={14} className="text-pink-500 fill-pink-500" />
              <span>{isEn ? `Specially For ${gift.recipientName}` : `Khusus Untuk ${gift.recipientName}`}</span>
            </span>
            <h2
              className="gift-revealed-title text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight"
              style={{ fontFamily: templateConfig.fonts.heading.replace('+', ' ') }}
            >
              {isEn ? 'A Gorgeous Floral Bouquet Just For You' : 'Buket Bunga Cantik Khusus Untukmu'}
            </h2>
            <p className="gift-revealed-sub text-xs sm:text-sm text-stone-600 mt-2">
              {isEn ? (
                <>Arranged with heartfelt care by <strong>{gift.senderName}</strong> at Laysa Bouquet Studio</>
              ) : (
                <>Dirangkai dengan tulus oleh <strong>{gift.senderName}</strong> di Studio Buket Laysa</>
              )}
            </p>
          </div>

          {isLandingPageTemplate && photos.length > 0 && (
            <section className="gift-landing-hero" aria-label={isEn ? 'Our photo memories' : 'Foto kenangan kita'}>
              <p className="gift-landing-kicker">{isEn ? 'A LITTLE PAGE ABOUT US' : 'SEPOTONG CERITA TENTANG KITA'}</p>
              <PhotoDisplay
                photos={photos}
                photoStyle={templateConfig.photoStyle}
                isEn={isEn}
              />
              <p className="gift-landing-caption">
                {isEn ? `${gift.senderName} made this page just for ${gift.recipientName}.` : `${gift.senderName} membuat halaman ini khusus untuk ${gift.recipientName}.`}
              </p>
            </section>
          )}

          {/* Bouquet Canvas Showcase Frame */}
          <div className="gift-canvas-frame my-8 bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-white flex flex-col items-center justify-center">
            <div className="gift-bouquet-visual max-w-md w-full flex items-center justify-center">
              {design.final2D?.image ? (
                <img
                  src={design.final2D.image}
                  alt="Buket Bunga Spesial"
                  className="gift-final-image max-h-[480px] w-auto object-contain rounded-2xl drop-shadow-2xl"
                />
              ) : (
                <div className="gift-composite-wrap relative w-72 h-80 flex items-center justify-center">
                  {bucketInfo?.image && (
                    <Image
                      src={bucketInfo.image}
                      alt={bucketInfo.label}
                      width={320}
                      height={340}
                      className="gift-bucket-img object-contain drop-shadow-xl"
                      unoptimized
                    />
                  )}
                  <div className="gift-flowers-overlay absolute inset-0 pointer-events-none">
                    {flowers.slice(0, 15).map((f: any, idx: number) => (
                      <img
                        key={f.uid || idx}
                        src={f.imageUrl}
                        alt="bunga"
                        className="gift-overlay-flower absolute w-16 h-16 object-contain"
                        style={{
                          left: `${40 + (idx % 5) * 6}%`,
                          top: `${30 + Math.floor(idx / 5) * 8}%`,
                          transform: `translate(-50%, -50%) rotate(${((idx * 45) % 90) - 45}deg) scale(0.85)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Letter Card Message */}
          <div className="gift-letter-card bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-pink-100 my-8">
            <div className="gift-letter-header flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <span className="gift-letter-label text-xs font-semibold uppercase tracking-wider text-pink-700">
                {isEn ? 'Special Letter & Note' : 'Surat & Pesan Spesial'}
              </span>
              <span className="gift-letter-date text-xs text-stone-400">
                {gift.createdAt
                  ? new Date(gift.createdAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : new Date().toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
              </span>
            </div>

            <div className="gift-letter-body">
              <p
                className="gift-letter-salutation text-lg font-bold text-stone-900 mb-3"
                style={{ fontFamily: templateConfig.fonts.heading.replace('+', ' ') }}
              >
                Dear {gift.recipientName},
              </p>
              <div className="gift-letter-content text-sm sm:text-base leading-relaxed text-stone-700 whitespace-pre-line mb-6">
                {gift.message || (
                  <p>
                    {isEn
                      ? 'May this floral bouquet always bring warmth, smiles, and happiness to your journey! 💐✨'
                      : 'Semoga buket bunga ini selalu menghadirkan senyuman dan kebahagiaan di setiap langkahmu! 💐✨'}
                  </p>
                )}
              </div>
              <p className="gift-letter-signature text-xs sm:text-sm text-stone-600">
                {isEn ? 'With heartfelt love & best wishes,' : 'Rangkaian tulus dari,'}
                <br />
                <strong className="text-stone-900 text-base">{gift.senderName}</strong>
              </p>
            </div>
          </div>

          {/* Photos Showcase (if any) */}
          {photos.length > 0 && !isLandingPageTemplate && (
            <PhotoDisplay
              photos={photos}
              photoStyle={templateConfig.photoStyle}
              isEn={isEn}
            />
          )}

          {/* Footer Actions */}
          <div className="gift-footer-actions flex flex-wrap gap-3 justify-center items-center mt-12 mb-6">
            <Link
              href="/designer"
              className="btn btn-primary px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-pink-500/20 inline-flex items-center gap-2"
              id="btn-gift-create-own"
            >
              <Sparkles size={16} />
              <span>{isEn ? 'Design Your Own Bouquet' : 'Rangkai Buket Hadiahmu Sendiri'}</span>
            </Link>

            <button
              type="button"
              onClick={handleReplay}
              className="btn btn-secondary px-5 py-3 rounded-2xl font-semibold inline-flex items-center gap-2"
            >
              <RotateCcw size={16} />
              <span>{isEn ? 'Replay Surprise' : 'Buka Ulang Hadiah'}</span>
            </button>

            <Link href="/" className="btn btn-secondary px-5 py-3 rounded-2xl font-semibold">
              <span>{isEn ? 'Visit Florist' : 'Kunjungi Florist'}</span>
            </Link>
          </div>

          {/* Report Button & Expiry badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-stone-400 text-xs px-4 border-t border-stone-200/50 pt-4">
            <div className="flex items-center gap-1.5">
              {gift.expiresAt ? (
                <>
                  <Calendar size={13} />
                  <span>
                    {isEn ? 'Active until: ' : 'Masa aktif: '}
                    {new Date(gift.expiresAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </>
              ) : (
                <span>{isEn ? 'Permanent Gift Pass' : 'Tautan Kado Permanen'}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="hover:text-rose-600 transition-colors inline-flex items-center gap-1 text-[11px]"
            >
              <Flag size={12} />
              <span>{isEn ? 'Report inappropriate content' : 'Laporkan kado bermasalah'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        giftId={giftId}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        isEn={isEn}
      />
    </div>
  );
}
