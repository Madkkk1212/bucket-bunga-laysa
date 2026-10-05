'use client';
// components/gift/objects/GiftBoxObject.tsx
import React from 'react';

interface Props { isOpening?: boolean; onClick?: () => void; }

export default function GiftBoxObject({ isOpening, onClick }: Props) {
  return (
    <div
      className={`gift-object-wrap ${isOpening ? 'gift-object-opening' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Buka kotak kado' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="gift-object-svg" aria-hidden="true">
        {/* Kotak badan */}
        <rect x="25" y="90" width="150" height="100" rx="6" fill="#fde68a" stroke="#d97706" strokeWidth="2.5" />
        {/* Pita vertikal */}
        <rect x="90" y="90" width="20" height="100" fill="#ec4899" opacity="0.85" />
        {/* Pita horizontal di kotak */}
        <rect x="25" y="122" width="150" height="16" fill="#ec4899" opacity="0.85" />

        {/* Tutup kotak (terangkat saat isOpening) */}
        <g style={{ transform: isOpening ? 'translateY(-30px) rotate(-5deg)' : 'translateY(0)', transition: 'transform 0.5s ease-out', transformOrigin: '100px 90px' }}>
          <rect x="18" y="70" width="164" height="28" rx="5" fill="#fbbf24" stroke="#d97706" strokeWidth="2.5" />
          {/* Pita di tutup */}
          <rect x="88" y="70" width="24" height="28" fill="#ec4899" opacity="0.85" />
          {/* Simpul pita */}
          <ellipse cx="100" cy="70" rx="28" ry="14" fill="#be185d" />
          <ellipse cx="72" cy="64" rx="16" ry="10" fill="#ec4899" transform="rotate(-30 72 64)" />
          <ellipse cx="128" cy="64" rx="16" ry="10" fill="#ec4899" transform="rotate(30 128 64)" />
          <circle cx="100" cy="70" r="8" fill="#be185d" />
          <circle cx="100" cy="70" r="4" fill="#ffffff" opacity="0.6" />
        </g>

        {/* Sparkle keluar saat opening */}
        {isOpening && (
          <g className="gift-box-sparkles">
            {[[80,50],[120,45],[100,35],[65,60],[135,55]].map(([x,y],i) => (
              <g key={i} transform={`translate(${x},${y})`}>
                <line x1="0" y1="-6" x2="0" y2="6" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
                <line x1="-6" y1="0" x2="6" y2="0" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
