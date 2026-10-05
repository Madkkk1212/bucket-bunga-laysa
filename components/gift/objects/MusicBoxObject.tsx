'use client';
// components/gift/objects/MusicBoxObject.tsx
import React from 'react';

interface Props { isOpening?: boolean; onClick?: () => void; }

export default function MusicBoxObject({ isOpening, onClick }: Props) {
  return (
    <div className={`gift-object-wrap ${isOpening ? 'gift-object-opening' : ''}`}
      onClick={onClick} role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Buka kotak musik' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="gift-object-svg" aria-hidden="true">
        {/* Badan kotak kayu */}
        <rect x="30" y="110" width="140" height="80" rx="8" fill="#c8956c" stroke="#8b5a2b" strokeWidth="2.5" />
        {/* Tekstur kayu */}
        <line x1="30" y1="135" x2="170" y2="135" stroke="#8b5a2b" strokeWidth="1" opacity="0.4" />
        <line x1="30" y1="155" x2="170" y2="155" stroke="#8b5a2b" strokeWidth="1" opacity="0.4" />
        {/* Engsel */}
        <rect x="92" y="107" width="16" height="8" rx="3" fill="#8b5a2b" />

        {/* Tutup kotak (terbuka saat isOpening) */}
        <g style={{
          transform: isOpening ? 'rotateX(-110deg)' : 'rotateX(0deg)',
          transition: 'transform 0.7s ease-out',
          transformOrigin: '100px 112px',
          transformStyle: 'preserve-3d',
        }}>
          <rect x="30" y="90" width="140" height="22" rx="8" fill="#d4a57c" stroke="#8b5a2b" strokeWidth="2.5" />
          {/* Ornamen penutup */}
          <rect x="85" y="97" width="30" height="8" rx="4" fill="#8b5a2b" opacity="0.5" />
        </g>

        {/* Balerin (muncul + berputar saat opening) */}
        {isOpening && (
          <g className="music-box-ballerina" transform="translate(100, 100)">
            {/* Kepala */}
            <circle cx="0" cy="-50" r="10" fill="#f5d0a9" />
            {/* Badan */}
            <ellipse cx="0" cy="-32" rx="7" ry="14" fill="#ec4899" />
            {/* Rok */}
            <path d="M -15 -20 Q 0 -10 15 -20 Q 10 0 0 0 Q -10 0 -15 -20Z" fill="#f9a8d4" />
            {/* Kaki */}
            <line x1="-4" y1="0" x2="-8" y2="20" stroke="#f5d0a9" strokeWidth="3" strokeLinecap="round" />
            <line x1="4" y1="0" x2="8" y2="20" stroke="#f5d0a9" strokeWidth="3" strokeLinecap="round" />
            {/* Lengan */}
            <line x1="-7" y1="-35" x2="-22" y2="-48" stroke="#f5d0a9" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="7" y1="-35" x2="22" y2="-48" stroke="#f5d0a9" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* Not musik */}
        {isOpening && (
          <g className="music-box-notes" opacity="0.8">
            <text x="140" y="85" fontSize="18" fill="#a855f7">♪</text>
            <text x="55" y="80" fontSize="14" fill="#be185d">♫</text>
            <text x="155" y="65" fontSize="12" fill="#d97706">♩</text>
          </g>
        )}
      </svg>
    </div>
  );
}
