'use client';
// components/gift/objects/BookObject.tsx — Buku cerita
import React from 'react';
interface Props { isOpening?: boolean; onClick?: () => void; }
export default function BookObject({ isOpening, onClick }: Props) {
  return (
    <div className={`gift-object-wrap ${isOpening ? 'gift-object-opening' : ''}`}
      onClick={onClick} role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Buka buku cerita' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="gift-object-svg" aria-hidden="true">
        {/* Halaman terbuka kanan (saat opening) */}
        {isOpening && (
          <g style={{ transform: 'rotateY(-40deg)', transformOrigin: '100px 100px', transition: 'transform 0.7s ease-out' }}>
            <path d="M 100 40 Q 160 38 165 160 L 100 160 Z" fill="#fef9f0" stroke="#e8d5b0" strokeWidth="1.5" />
            <line x1="110" y1="75" x2="158" y2="75" stroke="#d1b896" strokeWidth="1" opacity="0.6" />
            <line x1="110" y1="90" x2="158" y2="90" stroke="#d1b896" strokeWidth="1" opacity="0.6" />
            <line x1="110" y1="105" x2="155" y2="105" stroke="#d1b896" strokeWidth="1" opacity="0.6" />
          </g>
        )}
        {/* Punggung buku */}
        <rect x="92" y="38" width="16" height="124" rx="3" fill="#7c3aed" />
        {/* Sampul buku (depan) */}
        <path d="M 35 40 Q 35 38 92 38 L 92 162 Q 35 162 35 160 Z" fill="#be185d" stroke="#9d174d" strokeWidth="2" />
        {/* Ornamen bunga di sampul */}
        <g transform="translate(63, 90)">
          {[0,72,144,216,288].map((deg, i) => (
            <ellipse key={i}
              cx={Math.cos((deg * Math.PI) / 180) * 16}
              cy={Math.sin((deg * Math.PI) / 180) * 16}
              rx="8" ry="12"
              transform={`rotate(${deg})`}
              fill="#f9a8d4" opacity="0.7" />
          ))}
          <circle cx="0" cy="0" r="8" fill="#fcd34d" />
        </g>
        {/* Garis tepi sampul */}
        <rect x="40" y="46" width="46" height="108" rx="2" fill="none" stroke="#f9a8d4" strokeWidth="1" opacity="0.5" />
        {/* Judul placeholder */}
        <rect x="44" y="130" width="38" height="14" rx="2" fill="#ffffff" opacity="0.25" />
      </svg>
    </div>
  );
}
