'use client';
// components/gift/objects/JarObject.tsx — Toples kenangan
import React from 'react';
interface Props { isOpening?: boolean; onClick?: () => void; }
export default function JarObject({ isOpening, onClick }: Props) {
  return (
    <div className={`gift-object-wrap ${isOpening ? 'gift-object-opening' : ''}`}
      onClick={onClick} role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Buka toples kenangan' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}>
      <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="gift-object-svg" aria-hidden="true">
        {/* Tutup toples */}
        <g style={{ transform: isOpening ? 'translateY(-20px)' : 'translateY(0)', transition: 'transform 0.6s ease-out' }}>
          <rect x="60" y="55" width="80" height="22" rx="6" fill="#d97706" stroke="#b45309" strokeWidth="2" />
          <rect x="72" y="48" width="56" height="12" rx="5" fill="#b45309" stroke="#92400e" strokeWidth="1.5" />
        </g>
        {/* Badan toples (kaca transparan) */}
        <path d="M 55 75 Q 50 100 50 140 Q 50 175 100 178 Q 150 175 150 140 Q 150 100 145 75 Z"
          fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="2" opacity="0.85" />
        {/* Kilap kaca */}
        <path d="M 62 85 Q 65 110 64 140" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        {/* Bintang lipat di dalam toples */}
        {['#fcd34d','#ec4899','#a855f7','#34d399','#f97316'].map((c, i) => (
          <text key={i} x={75 + (i % 3) * 18} y={110 + Math.floor(i / 3) * 22} fontSize="16" fill={c} opacity="0.9">★</text>
        ))}
        {/* Label toples */}
        <rect x="70" y="138" width="60" height="22" rx="4" fill="#fff7ed" stroke="#fed7aa" strokeWidth="1.5" />
        <text x="100" y="153" textAnchor="middle" fontSize="9" fill="#9a3412" fontFamily="serif">kenangan</text>
      </svg>
    </div>
  );
}
