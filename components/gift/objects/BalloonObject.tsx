'use client';
// components/gift/objects/BalloonObject.tsx
import React from 'react';

interface Props { isOpening?: boolean; onClick?: () => void; }

export default function BalloonObject({ isOpening, onClick }: Props) {
  return (
    <div className={`gift-object-wrap ${isOpening ? 'gift-object-opening' : ''}`}
      onClick={onClick} role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Sentuh balon kado' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}>
      <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="gift-object-svg" aria-hidden="true">
        {/* Balon kiri */}
        <ellipse cx="65" cy="85" rx="42" ry="50" fill="#ec4899" opacity="0.9" />
        <ellipse cx="55" cy="72" rx="12" ry="16" fill="#ffffff" opacity="0.25" />
        <path d="M65 135 Q 62 148 70 155" stroke="#be185d" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Balon tengah (sedikit lebih besar) */}
        <ellipse cx="100" cy="75" rx="48" ry="56" fill="#be185d" opacity="0.95" />
        <ellipse cx="88" cy="60" rx="14" ry="18" fill="#ffffff" opacity="0.25" />
        <path d="M100 131 L 100 160" stroke="#9d174d" strokeWidth="2" strokeLinecap="round" />

        {/* Balon kanan */}
        <ellipse cx="135" cy="85" rx="42" ry="50" fill="#a855f7" opacity="0.85" />
        <ellipse cx="125" cy="72" rx="12" ry="16" fill="#ffffff" opacity="0.25" />
        <path d="M135 135 Q 138 148 130 155" stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Tali disatukan */}
        <path d="M70 155 Q 85 175 100 160 Q 115 175 130 155 Q 120 185 100 180 Q 80 185 70 155Z"
          fill="none" stroke="#9d174d" strokeWidth="1.5" strokeLinecap="round" />

        {/* Bintang kecil dekoratif */}
        {isOpening && (
          <g>
            {[[30,40],[170,50],[40,120],[165,110]].map(([x,y],i) => (
              <text key={i} x={x} y={y} fontSize="14" fill="#fcd34d" opacity="0.8">★</text>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
