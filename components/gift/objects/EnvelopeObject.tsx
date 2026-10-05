'use client';
// components/gift/objects/EnvelopeObject.tsx
// Objek amplop — tampil sebelum kado dibuka.
// SVG buatan sendiri, tanpa karakter/IP berhak cipta.

import React from 'react';

interface Props {
  isOpening?: boolean;
  onClick?: () => void;
}

export default function EnvelopeObject({ isOpening, onClick }: Props) {
  return (
    <div
      className={`gift-object-wrap ${isOpening ? 'gift-object-opening' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Buka amplop kado' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <svg
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="gift-object-svg"
        aria-hidden="true"
      >
        {/* Badan amplop */}
        <rect x="10" y="40" width="180" height="110" rx="8" fill="#fef9f0" stroke="#e8d5b0" strokeWidth="2" />

        {/* Segel lilin (kiri-tengah) */}
        <circle cx="100" cy="95" r="22" fill="#be185d" opacity="0.92" />
        <circle cx="100" cy="95" r="16" fill="#ec4899" opacity="0.7" />
        {/* Ornamen bunga di segel */}
        <g transform="translate(100,95)">
          {[0,60,120,180,240,300].map((deg, i) => (
            <ellipse
              key={i}
              cx={Math.cos((deg * Math.PI) / 180) * 7}
              cy={Math.sin((deg * Math.PI) / 180) * 7}
              rx="3.5" ry="5"
              transform={`rotate(${deg})`}
              fill="#ffffff"
              opacity="0.6"
            />
          ))}
          <circle cx="0" cy="0" r="3" fill="#ffffff" opacity="0.9" />
        </g>

        {/* Klep atas (terbuka saat isOpening) */}
        <path
          d={isOpening
            ? 'M 10 40 L 100 10 L 190 40'
            : 'M 10 40 L 100 90 L 190 40'}
          fill="#f5e6c8"
          stroke="#e8d5b0"
          strokeWidth="2"
          className={isOpening ? 'envelope-flap-open' : 'envelope-flap-closed'}
          style={{ transformOrigin: '100px 40px', transition: 'all 0.6s ease-out' }}
        />

        {/* Garis dekoratif tepi amplop */}
        <rect x="10" y="40" width="180" height="110" rx="8" fill="none" stroke="#e8d5b0" strokeWidth="2" />

        {/* Lipatan sudut bawah */}
        <line x1="10" y1="40" x2="100" y2="90" stroke="#e8d5b0" strokeWidth="1.5" opacity="0.5" />
        <line x1="190" y1="40" x2="100" y2="90" stroke="#e8d5b0" strokeWidth="1.5" opacity="0.5" />
      </svg>
    </div>
  );
}
