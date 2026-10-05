'use client';

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Music, Volume2, VolumeX, Play, Pause, AlertCircle, Sparkles } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  startSeconds?: number;
  /** Kept for API compat */
  autoPlay?: boolean;
  /** When true, the player card UI becomes visible */
  isOpen?: boolean;
  /** Kept for backwards compatibility */
  preload?: boolean;
  /** If true, starts playing audio immediately from mount */
  startImmediate?: boolean;
  /** If true, always displays the floating music control card */
  showCardAlways?: boolean;
  onFallbackAudio?: () => void;
  isEn?: boolean;
}

/**
 * Senior Frontend YouTube Audio Engine:
 * - Pre-loads muted + playsinline to pass browser autoplay constraints without stalling.
 * - Listens to onReady event from YouTube IFrame postMessage API.
 * - Unmutes automatically on first document gesture (pointerdown/touchstart/click).
 * - Exposes interactive controls: Play, Pause, Mute, Fallback.
 */
const YouTubePlayer = forwardRef<HTMLIFrameElement, YouTubePlayerProps>(
  function YouTubePlayer(
    {
      videoId,
      startSeconds = 0,
      isOpen = false,
      startImmediate = false,
      showCardAlways = false,
      onFallbackAudio,
      isEn = false,
    },
    ref
  ) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [userGestureGiven, setUserGestureGiven] = useState(false);

    const internalRef = useRef<HTMLIFrameElement>(null);
    const iframeRef = (ref as React.RefObject<HTMLIFrameElement>) ?? internalRef;

    const postCommand = (func: string, args: any[] = []) => {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      }
    };

    const playAndUnmute = () => {
      postCommand('unMute');
      postCommand('setVolume', [100]);
      postCommand('playVideo');
      setIsPlaying(true);
      setIsMuted(false);
    };

    // Listen for YouTube IFrame messages (onReady, stateChange, onError)
    useEffect(() => {
      const handleMessage = (e: MessageEvent) => {
        try {
          if (typeof e.data === 'string') {
            const data = JSON.parse(e.data);

            if (data.event === 'onReady') {
              setIsPlayerReady(true);
              if (startImmediate || isOpen || userGestureGiven) {
                playAndUnmute();
              }
            }

            if (data.event === 'infoDelivery' && data.info) {
              if (data.info.playerState === 1) setIsPlaying(true);
              if (data.info.playerState === 2) setIsPlaying(false);
              if (typeof data.info.muted === 'boolean') setIsMuted(data.info.muted);
            }

            if (data.event === 'onError' || data.info === 101 || data.info === 150) {
              setHasError(true);
              onFallbackAudio?.();
            }
          }
        } catch {
          // ignore non-YT window messages
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [startImmediate, isOpen, userGestureGiven, onFallbackAudio]);

    // Browser User Activation Gate: Unlock audio on first user touch/click anywhere on page
    useEffect(() => {
      const handleUserInteraction = () => {
        setUserGestureGiven(true);
        if (startImmediate || isOpen) {
          playAndUnmute();
        }
      };

      window.addEventListener('pointerdown', handleUserInteraction, { once: true, passive: true });
      window.addEventListener('keydown', handleUserInteraction, { once: true, passive: true });

      return () => {
        window.removeEventListener('pointerdown', handleUserInteraction);
        window.removeEventListener('keydown', handleUserInteraction);
      };
    }, [videoId, startImmediate, isOpen]);

    // Handle isOpen or startImmediate changes
    useEffect(() => {
      if (isOpen || startImmediate) {
        const timer = setTimeout(() => {
          playAndUnmute();
        }, 120);
        return () => clearTimeout(timer);
      }
    }, [isOpen, startImmediate, videoId]);

    const togglePlay = () => {
      if (isPlaying) {
        postCommand('pauseVideo');
        setIsPlaying(false);
      } else {
        postCommand('playVideo');
        postCommand('unMute');
        setIsPlaying(true);
        setIsMuted(false);
      }
    };

    const toggleMute = () => {
      if (isMuted) {
        postCommand('unMute');
        setIsMuted(false);
      } else {
        postCommand('mute');
        setIsMuted(true);
      }
    };

    // YouTube embed URL with optimal flags:
    // enablejsapi=1, autoplay=1, mute=1 (starts streaming silently without browser block), playsinline=1
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=1&mute=1&playsinline=1&controls=0&loop=1&playlist=${videoId}&start=${startSeconds}&modestbranding=1&rel=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

    const isCardVisible = isOpen || showCardAlways;

    return (
      <>
        {/* ── Persistent hidden iframe with full autoplay permissions ── */}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title="YouTube Soundtrack Stream"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          aria-hidden="true"
          tabIndex={-1}
          style={{
            position: 'fixed',
            left: -9999,
            top: -9999,
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
            border: 'none',
          }}
        />

        {/* ── Floating Modern Music Card ── */}
        {isCardVisible && (
          <div className="gift-music-card fixed bottom-4 right-4 z-40 bg-white/95 backdrop-blur-md border border-pink-200/90 rounded-2xl shadow-xl px-3.5 py-2.5 flex items-center gap-3 max-w-xs sm:max-w-sm transition-all duration-300 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            {/* Visualizer Icon */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 shrink-0 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              {isPlaying && !isMuted ? (
                <div className="flex gap-0.5 items-end h-4">
                  <span className="w-1 bg-white rounded-full animate-bounce h-4" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 bg-white rounded-full animate-bounce h-2.5" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 bg-white rounded-full animate-bounce h-4" style={{ animationDelay: '300ms' }} />
                  <span className="w-1 bg-white rounded-full animate-bounce h-2" style={{ animationDelay: '100ms' }} />
                </div>
              ) : (
                <Music size={16} className="text-white" />
              )}
            </div>

            {/* Info & Status */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPlaying && !isMuted ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'
                  }`}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700">
                  {isPlaying && !isMuted
                    ? (isEn ? 'Soundtrack Playing' : 'Lagu Diputar')
                    : (isEn ? 'Soundtrack Paused' : 'Musik Kado')}
                </span>
              </div>
              <p className="text-xs font-semibold text-stone-800 truncate mt-0.5">
                {hasError
                  ? (isEn ? 'Fallback Instrument Active' : 'Melodi Halus Aktif')
                  : (isEn ? 'Special Gift Soundtrack' : 'Soundtrack Spesial')}
              </p>
            </div>

            {/* Play / Mute Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 flex items-center justify-center transition-all active:scale-95 shadow-xs"
                title={isPlaying ? 'Pause Musik' : 'Putar Musik'}
                aria-label={isPlaying ? 'Pause music' : 'Play music'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-all active:scale-95"
                title={isMuted ? 'Suara Aktif' : 'Senyapkan'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>

            {hasError && (
              <div className="absolute -top-7 right-0 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                <AlertCircle size={11} />
                <span>Video dibatasi YT (memainkan melodi)</span>
              </div>
            )}
          </div>
        )}
      </>
    );
  }
);

export default YouTubePlayer;
