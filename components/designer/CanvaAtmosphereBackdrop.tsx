'use client';

import React from 'react';

/**
 * CanvaAtmosphereBackdrop
 * Renders an ultra-subtle, elegant floral atelier ambiance behind the canvas:
 * - Soft organic ambient light orbs (warm blush, cream, soft lavender glow)
 * - Delicate botanical vector contours & floating petal watermarks
 * - Strict pointer-events: none (zero interaction interference)
 */
export default function CanvaAtmosphereBackdrop() {
  return (
    <div className="canva-stage-ambient-backdrop" aria-hidden="true">
      {/* High-Resolution Luxury Atelier Floral Backdrop Image */}
      <div className="canva-backdrop-image" />

      {/* Ambient Blurred Organic Light Glows */}
      <div className="canva-ambient-glow-1" />
      <div className="canva-ambient-glow-2" />
      <div className="canva-ambient-glow-3" />

      {/* Top-Right: Delicate arched botanical branch with subtle leaves */}
      <svg
        className="canva-floral-ornament canva-ornament-top-right"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M190 10C160 30 130 70 120 110C110 150 90 180 60 190"
          stroke="#9f1239"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M165 35C155 30 145 35 142 45C148 50 158 48 165 35Z"
          stroke="#9f1239"
          strokeWidth="1"
          fill="#9f1239"
          fillOpacity="0.3"
        />
        <path
          d="M142 65C132 60 122 65 119 75C125 80 135 78 142 65Z"
          stroke="#9f1239"
          strokeWidth="1"
          fill="#9f1239"
          fillOpacity="0.3"
        />
        <path
          d="M125 105C115 100 105 105 102 115C108 120 118 118 125 105Z"
          stroke="#9f1239"
          strokeWidth="1"
          fill="#9f1239"
          fillOpacity="0.3"
        />
        <path
          d="M110 145C100 140 90 145 87 155C93 160 103 158 110 145Z"
          stroke="#9f1239"
          strokeWidth="1"
          fill="#9f1239"
          fillOpacity="0.3"
        />
        <path
          d="M150 50C160 55 168 52 170 42C164 38 155 42 150 50Z"
          stroke="#9f1239"
          strokeWidth="1"
          fill="#9f1239"
          fillOpacity="0.25"
        />
        <path
          d="M130 85C140 90 148 87 150 77C144 73 135 77 130 85Z"
          stroke="#9f1239"
          strokeWidth="1"
          fill="#9f1239"
          fillOpacity="0.25"
        />
      </svg>

      {/* Bottom-Left: Elegant contour bloom & foliage watermark */}
      <svg
        className="canva-floral-ornament canva-ornament-bottom-left"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 190C30 160 60 130 90 120C120 110 150 90 160 60"
          stroke="#be123c"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M70 140C60 120 70 95 90 90C110 85 125 100 120 120C115 140 90 155 70 140Z"
          stroke="#be123c"
          strokeWidth="1"
          fill="#be123c"
          fillOpacity="0.2"
        />
        <path
          d="M85 105C80 90 90 75 105 75C118 75 125 88 120 102"
          stroke="#be123c"
          strokeWidth="0.9"
        />
        <path
          d="M45 165C35 155 40 142 52 145C55 155 52 165 45 165Z"
          stroke="#be123c"
          strokeWidth="1"
          fill="#be123c"
          fillOpacity="0.25"
        />
        <path
          d="M110 115C125 110 135 118 132 130C122 132 115 125 110 115Z"
          stroke="#be123c"
          strokeWidth="1"
          fill="#be123c"
          fillOpacity="0.25"
        />
      </svg>

      {/* Floating weightless petal accents */}
      <svg
        className="canva-floral-ornament canva-ornament-petal-float"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40 30C65 20 95 40 85 70C75 100 45 90 35 65C25 40 40 30 40 30Z"
          stroke="#e11d48"
          strokeWidth="1"
          fill="#e11d48"
          fillOpacity="0.25"
        />
        <path
          d="M100 95C120 85 145 105 135 125C125 145 105 140 95 120C88 105 100 95 100 95Z"
          stroke="#e11d48"
          strokeWidth="0.9"
          fill="#e11d48"
          fillOpacity="0.2"
        />
      </svg>
    </div>
  );
}
