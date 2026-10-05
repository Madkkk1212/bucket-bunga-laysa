'use client';

import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, AlertCircle, Clock, ExternalLink, X, Music2, Sparkles, Volume2 } from 'lucide-react';
import { parseYouTubeUrl } from '@/utils/youtubeParser';

const YouTubeIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

interface YouTubeInputProps {
  videoId?: string | null;
  startSeconds?: number;
  onChange: (data: { videoId: string | null; startSeconds: number }) => void;
  canUseYouTube?: boolean;
  onUpgradeClick?: () => void;
  isEn?: boolean;
}

export default function YouTubeInput({
  videoId = null,
  startSeconds = 0,
  onChange,
  canUseYouTube = true,
  onUpgradeClick,
  isEn = false,
}: YouTubeInputProps) {
  const [urlInput, setUrlInput] = useState(
    videoId ? `https://www.youtube.com/watch?v=${videoId}` : ''
  );
  const [seconds, setSeconds] = useState(startSeconds);
  const [currentId, setCurrentId] = useState<string | null>(videoId || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoId !== currentId) {
      setCurrentId(videoId || null);
      if (videoId && !urlInput) {
        setUrlInput(`https://www.youtube.com/watch?v=${videoId}`);
      }
    }
  }, [videoId]);

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    setError(null);

    const trimmed = val.trim();
    if (!trimmed) {
      setCurrentId(null);
      onChange({ videoId: null, startSeconds: seconds });
      return;
    }

    const result = parseYouTubeUrl(trimmed);
    if (result.videoId) {
      setCurrentId(result.videoId);
      setError(null);
      const newSec = result.startSeconds > 0 ? result.startSeconds : seconds;
      if (result.startSeconds > 0) setSeconds(result.startSeconds);
      onChange({ videoId: result.videoId, startSeconds: newSec });
    } else {
      setCurrentId(null);
      setError(
        isEn
          ? result.error || 'Invalid YouTube link. Example: https://youtu.be/xxx or youtube.com/watch?v=xxx'
          : result.error || 'Link YouTube tidak valid. Cth: https://youtu.be/xxx atau youtube.com/watch?v=xxx'
      );
    }
  };

  const handleClear = () => {
    setUrlInput('');
    setCurrentId(null);
    setError(null);
    setSeconds(0);
    onChange({ videoId: null, startSeconds: 0 });
  };

  const handleSecondsChange = (val: number) => {
    const s = Math.max(0, Math.min(3600, val));
    setSeconds(s);
    onChange({ videoId: currentId, startSeconds: s });
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="gift-yt-box">
      {/* Header */}
      <div className="gift-yt-header">
        <div className="gift-yt-title-wrap">
          <div className="gift-yt-badge-icon">
            <YouTubeIcon size={15} />
          </div>
          <div className="gift-yt-title-row">
            <h4 className="gift-yt-title">
              {isEn ? 'YouTube Soundtrack' : 'Lagu YouTube'}
            </h4>
            <span className="gift-yt-pill-tag">
              <Sparkles size={10} />
              <span>{isEn ? 'Auto-play' : 'Otomatis'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Input Row */}
      <div className="gift-yt-input-container">
        <div className="gift-yt-input-field">
          <div className="gift-yt-input-icon">
            <Music2 size={16} />
          </div>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={
              isEn
                ? 'Paste any YouTube song link (e.g. youtu.be/...)'
                : 'Tempel link lagu YouTube favoritmu (cth: youtu.be/...)'
            }
            className="gift-yt-text-input"
          />
          {urlInput && (
            <button
              type="button"
              onClick={handleClear}
              className="gift-yt-clear-btn"
              title={isEn ? 'Clear link' : 'Hapus tautan'}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="gift-yt-error-banner">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Verified Preview & Start Controller */}
      {currentId && (
        <div className="gift-yt-card-preview">
          <div className="gift-yt-card-left">
            <div className="gift-yt-thumb-wrapper">
              <img
                src={`https://img.youtube.com/vi/${currentId}/mqdefault.jpg`}
                alt="Thumbnail Lagu"
                className="gift-yt-thumb-img"
              />
              <div className="gift-yt-thumb-overlay">
                <Play size={16} fill="white" />
              </div>
            </div>

            <div className="gift-yt-info-group">
              <div className="gift-yt-ready-badge">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>{isEn ? 'Soundtrack Connected' : 'Soundtrack Terhubung'}</span>
              </div>
              <div className="gift-yt-actions-links">
                <a
                  href={`https://www.youtube.com/watch?v=${currentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gift-yt-preview-link"
                >
                  <span>{isEn ? 'Test Video' : 'Uji Putar Lagu'}</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          <div className="gift-yt-card-right">
            <div className="gift-yt-seconds-header">
              <div className="gift-yt-clock-label">
                <Clock size={13} />
                <span>{isEn ? 'Start Music At:' : 'Mulai Pada:'}</span>
              </div>
              <span className="gift-yt-time-display">
                {formatTime(seconds)} ({seconds}s)
              </span>
            </div>

            <div className="gift-yt-preset-chips">
              {[0, 15, 30, 45, 60].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSecondsChange(s)}
                  className={`gift-yt-chip ${seconds === s ? 'active' : ''}`}
                >
                  {s === 0 ? (isEn ? 'Start' : 'Awal') : `${s}s`}
                </button>
              ))}
            </div>

            <div className="gift-yt-slider-row">
              <input
                type="range"
                min={0}
                max={300}
                step={1}
                value={seconds}
                onChange={(e) => handleSecondsChange(parseInt(e.target.value) || 0)}
                className="gift-yt-slider"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
