'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Sparkles,
  Music,
  Volume2,
  VolumeX,
  Download,
  Share2,
  ExternalLink,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { getBucketSize } from '@/data/buckets';
import { BACKGROUND_THEMES } from '@/utils/canvasUtils';

interface GiftData {
  id: string;
  senderName: string;
  recipientName: string;
  message: string;
  musicTrack: string;
  designData: any;
  createdAt?: string;
  views?: number;
}

export default function GiftReceiverPage() {
  const params = useParams();
  const giftId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [gift, setGift] = useState<GiftData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Experience state
  const [isOpen, setIsOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const melodyTimerRef = useRef<any>(null);

  // Fetch gift data from API
  useEffect(() => {
    if (!giftId) return;

    fetch(`/api/gifts/${giftId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.gift) {
          setGift(data.gift);
        } else {
          setError(data.message || 'Hadiah digital tidak ditemukan.');
        }
      })
      .catch(() => {
        setError('Gagal memuat hadiah. Silakan periksa koneksi internet Anda.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [giftId]);

  // Gentle procedural melody synthesizer using Web Audio API (Zero external MP3 dependencies)
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
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Notes in pentatonic scale: C4, D4, E4, G4, A4, C5, D5, E5
      const freqs = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
      let noteIndex = 0;

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
      setIsAudioPlaying(true);
    } catch {
      // Audio not supported or blocked by browser policy
    }
  };

  const stopProceduralBGM = () => {
    if (melodyTimerRef.current) {
      clearTimeout(melodyTimerRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
    }
    setIsAudioPlaying(false);
  };

  const toggleAudio = () => {
    if (isAudioPlaying) {
      stopProceduralBGM();
    } else {
      startProceduralBGM();
    }
  };

  const handleOpenGift = () => {
    setIsOpen(true);
    startProceduralBGM();
  };

  if (loading) {
    return (
      <div className="gift-page-container flex-col">
        <div className="gift-spinner-ring" />
        <p className="mt-4 text-sm font-medium text-pink-700 animate-pulse">
          Mempersiapkan buket hadiah digital Anda...
        </p>
      </div>
    );
  }

  if (error || !gift) {
    return (
      <div className="gift-page-container">
        <div className="gift-card-envelope text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-2xl">
            🥀
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Hadiah Tidak Ditemukan</h2>
          <p className="text-sm text-gray-600 mb-6">{error || 'Tautan ini mungkin sudah tidak aktif atau salah.'}</p>
          <Link href="/designer" className="btn btn-primary inline-flex items-center gap-2">
            <Sparkles size={16} />
            <span>Rangkai Buket Sendiri</span>
          </Link>
        </div>
      </div>
    );
  }

  const design = gift.designData || {};
  const bucketId = design.bucketSize || 'bucket-1';
  const bucketInfo = getBucketSize(bucketId);
  const flowers = design.selectedFlowers || [];
  const textConfig = design.text || {};
  const currentTheme = BACKGROUND_THEMES.find((t) => t.id === design.bgTheme) || BACKGROUND_THEMES[0];

  return (
    <div
      className="gift-page-root"
      style={{
        background: currentTheme?.previewColor
          ? `radial-gradient(circle at 50% 30%, #ffffff 0%, ${currentTheme.previewColor} 100%)`
          : 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #fce7f3 100%)',
      }}
    >
      {/* Floating Petals Ambient Effect */}
      <div className="gift-ambient-petals" aria-hidden="true">
        <div className="petal p1">🌸</div>
        <div className="petal p2">✨</div>
        <div className="petal p3">💐</div>
        <div className="petal p4">🌸</div>
        <div className="petal p5">💖</div>
        <div className="petal p6">✨</div>
      </div>

      {/* Floating Audio Toggle */}
      {isOpen && (
        <button
          type="button"
          className="gift-bgm-toggle"
          onClick={toggleAudio}
          title={isAudioPlaying ? 'Matikan Melodi' : 'Nyalakan Melodi'}
          aria-label="Toggle musik latar"
        >
          {isAudioPlaying ? (
            <>
              <Volume2 size={16} className="text-pink-600 animate-pulse" />
              <span>Melodi Bunga</span>
            </>
          ) : (
            <>
              <VolumeX size={16} className="text-gray-400" />
              <span>Melodi Hening</span>
            </>
          )}
        </button>
      )}

      {/* STATE 1: ENVELOPE COVER (BEFORE UNSEALING) */}
      {!isOpen ? (
        <div className="gift-unopened-wrapper">
          <div className="gift-envelope-box">
            <div className="gift-envelope-badge">
              <Sparkles size={14} />
              <span>HADIAH SPESIAL DIGITAL</span>
            </div>

            <div className="gift-envelope-wax-seal" onClick={handleOpenGift}>
              <div className="wax-seal-inner">
                <Heart size={36} className="text-white fill-white animate-pulse" />
              </div>
            </div>

            <div className="gift-envelope-addresses">
              <div className="gift-addr-to">
                <span className="gift-addr-label">Untuk yang teristimewa:</span>
                <h1 className="gift-addr-name">{gift.recipientName}</h1>
              </div>

              <div className="gift-addr-divider" />

              <div className="gift-addr-from">
                <span className="gift-addr-label">Rangkaian penuh kasih dari:</span>
                <p className="gift-sender-name">{gift.senderName}</p>
              </div>
            </div>

            <button
              type="button"
              className="gift-btn-open-seal"
              onClick={handleOpenGift}
              id="btn-open-gift-envelope"
            >
              <Sparkles size={18} />
              <span>Buka Amplop & Lihat Buketmu</span>
            </button>
            <span className="gift-open-hint">Sentuh tombol untuk membuka kejutan</span>
          </div>
        </div>
      ) : (
        /* STATE 2: REVEALED BOUQUET & LOVE LETTER */
        <div className="gift-opened-wrapper">
          {/* Top greeting badge */}
          <div className="gift-revealed-header">
            <span className="gift-greeting-chip">
              <Heart size={14} className="text-pink-500 fill-pink-500" />
              <span>Untuk {gift.recipientName}</span>
            </span>
            <h2 className="gift-revealed-title">Buket Bunga Cantik Khusus Untukmu</h2>
            <p className="gift-revealed-sub">
              Dirangkai dengan tulus oleh <strong>{gift.senderName}</strong> di Studio Buket Laysa
            </p>
          </div>

          {/* Bouquet Canvas Showcase Frame */}
          <div className="gift-canvas-frame">
            <div className="gift-bouquet-visual">
              {/* If final2D image is present, display it, otherwise display composite visual */}
              {design.final2D?.image ? (
                <img
                  src={design.final2D.image}
                  alt="Buket Bunga Spesial"
                  className="gift-final-image"
                />
              ) : (
                <div className="gift-composite-wrap">
                  {/* Bucket wrapper */}
                  {bucketInfo?.image && (
                    <Image
                      src={bucketInfo.image}
                      alt={bucketInfo.label}
                      width={380}
                      height={400}
                      className="gift-bucket-img"
                      style={{
                        filter: `drop-shadow(0 12px 28px rgba(0,0,0,0.18)) ${bucketInfo.cssFilter || ''}`,
                      }}
                      unoptimized
                    />
                  )}
                  {/* Sample flowers overlay */}
                  <div className="gift-flowers-overlay">
                    {flowers.slice(0, 15).map((f: any, idx: number) => (
                      <img
                        key={f.uid || idx}
                        src={f.imageUrl}
                        alt="bunga"
                        className="gift-overlay-flower"
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
          <div className="gift-letter-card">
            <div className="gift-letter-header">
              <span className="gift-letter-label">Surat & Ucapan Spesial</span>
              <span className="gift-letter-date">
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="gift-letter-body">
              <p className="gift-letter-salutation">Dear {gift.recipientName},</p>
              <div className="gift-letter-content">
                {gift.message ? (
                  <p>{gift.message}</p>
                ) : (
                  <p>Semoga buket bunga ini selalu menghadirkan senyuman dan kebahagiaan di setiap langkahmu! 💐✨</p>
                )}
              </div>
              <p className="gift-letter-signature">
                Dari yang selalu mendoakanmu,
                <br />
                <strong>{gift.senderName}</strong>
              </p>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="gift-footer-actions">
            <Link href="/designer" className="btn btn-primary gift-btn-make-own" id="btn-gift-create-own">
              <Sparkles size={16} />
              <span>Rangkai Buket Hadiahmu Sendiri</span>
            </Link>

            <Link href="/" className="btn btn-secondary gift-btn-home">
              <span>Kunjungi Laysa Florist</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
