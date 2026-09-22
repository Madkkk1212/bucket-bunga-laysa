'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BUCKET_TEMPLATES } from '../../data/templates';

interface BouquetPreviewProps {
  template: (typeof BUCKET_TEMPLATES)[0];
  size?: number;
}

function BouquetPreview({ template, size = 220 }: BouquetPreviewProps) {
  if (template.previewImage) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Image
          src={template.previewImage}
          alt={template.name}
          width={size}
          height={size}
          style={{
            maxWidth: '92%',
            maxHeight: '92%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.22))',
          }}
        />
      </div>
    );
  }

  const { wrapperColor, wrapperColor2, ribbonColor, flowerEmojis, ribbonStripe } = template;

  const cx = size / 2;
  const totalH = size * 0.88;
  const wrapperTopY = size * 0.08;
  const ribbonY = size * 0.72;
  const bottomY = size * 0.96;
  const topHalf = totalH * 0.55;
  const halfTopW = size * 0.41;
  const halfBotW = size * 0.07;
  const flowerAreaTop = size * 0.02;
  const flowerAreaBot = ribbonY - 10;
  const flowerAreaH = flowerAreaBot - flowerAreaTop;

  // Wrapper petal shapes (SVG paths)
  const petalData = [
    { angle: -0.42, color: wrapperColor2 || wrapperColor },
    { angle: -0.22, color: wrapperColor },
    { angle: -0.06, color: adjustColorSVG(wrapperColor, 12) },
    { angle: 0.06, color: adjustColorSVG(wrapperColor, 8) },
    { angle: 0.22, color: adjustColorSVG(wrapperColor, -5) },
    { angle: 0.42, color: adjustColorSVG(wrapperColor, -22) },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`bg-${template.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={template.bgColor} />
          <stop offset="100%" stopColor={adjustColorSVG(template.bgColor, -5)} />
        </linearGradient>
        {/* Main wrapper gradient */}
        <linearGradient id={`wrap-${template.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={adjustColorSVG(wrapperColor, 18)} />
          <stop offset="50%" stopColor={wrapperColor} />
          <stop offset="100%" stopColor={adjustColorSVG(wrapperColor, -28)} />
        </linearGradient>
        {/* Ribbon gradient */}
        <radialGradient id={`rib-${template.id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={adjustColorSVG(ribbonColor, 30)} />
          <stop offset="100%" stopColor={ribbonColor} />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width={size} height={size} fill={`url(#bg-${template.id})`} rx="12" />

      {/* Wrapper petals */}
      {petalData.map((petal, i) => {
        const isLeft = petal.angle < 0;
        const absA = Math.abs(petal.angle);
        const pivotX = cx + (isLeft ? -halfBotW * 0.4 : halfBotW * 0.4);
        const petalW = halfTopW * (0.68 + absA * 0.35);
        const petalH = flowerAreaH * 0.85;
        const tipX = pivotX + (isLeft ? -petalW * Math.sin(absA * 1.5) : petalW * Math.sin(absA * 1.5));
        const tipY = wrapperTopY + (wrapperTopY * absA * 0.5);

        return (
          <path
            key={i}
            d={`M ${pivotX} ${ribbonY} 
                C ${pivotX + (isLeft ? -petalW * 0.3 : petalW * 0.3)} ${ribbonY - petalH * 0.4},
                  ${tipX + (isLeft ? -petalW * 0.1 : petalW * 0.1)} ${tipY + petalH * 0.2},
                  ${tipX} ${tipY}
                L ${tipX + (isLeft ? petalW * 0.12 : -petalW * 0.12)} ${tipY + petalH * 0.1}
                C ${tipX + (isLeft ? petalW * 0.08 : -petalW * 0.08)} ${tipY + petalH * 0.4},
                  ${pivotX + (isLeft ? -petalW * 0.1 : petalW * 0.1)} ${ribbonY - petalH * 0.15},
                  ${pivotX} ${ribbonY} Z`}
            fill={petal.color}
            opacity={0.88 + i * 0.02}
          />
        );
      })}

      {/* Main wrapper body */}
      <path
        d={`M ${cx - halfTopW} ${wrapperTopY + topHalf * 0.08}
            L ${cx + halfTopW} ${wrapperTopY + topHalf * 0.08}
            L ${cx + halfBotW} ${bottomY}
            L ${cx - halfBotW} ${bottomY} Z`}
        fill={`url(#wrap-${template.id})`}
      />

      {/* Inner highlight */}
      <path
        d={`M ${cx - halfTopW * 0.42} ${wrapperTopY + topHalf * 0.08}
            L ${cx + halfTopW * 0.42} ${wrapperTopY + topHalf * 0.08}
            L ${cx + halfBotW * 0.5} ${ribbonY - 6}
            L ${cx - halfBotW * 0.5} ${ribbonY - 6} Z`}
        fill="rgba(255,255,255,0.08)"
      />

      {/* Flowers (emoji rendered as text) */}
      {flowerEmojis.map((emoji, i) => {
        const total = flowerEmojis.length;
        const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
        const r = size * 0.155 * (0.3 + (i % 3) * 0.28);
        const flowerCY = wrapperTopY + flowerAreaH * 0.42;
        const x = cx + Math.cos(angle) * r;
        const y = flowerCY + Math.sin(angle) * r * 0.6;
        const fs = size * 0.118 + (i % 3) * 4;
        return (
          <text key={i} x={x} y={y} fontSize={fs} textAnchor="middle" dominantBaseline="middle">
            {emoji}
          </text>
        );
      })}

      {/* Ribbon - left loop */}
      <path
        d={`M ${cx - 6} ${ribbonY}
            C ${cx - size * 0.11} ${ribbonY - size * 0.11},
              ${cx - size * 0.32} ${ribbonY - size * 0.12},
              ${cx - size * 0.3} ${ribbonY + size * 0.005}
            C ${cx - size * 0.28} ${ribbonY + size * 0.09},
              ${cx - size * 0.08} ${ribbonY + size * 0.055},
              ${cx - 6} ${ribbonY} Z`}
        fill={`url(#rib-${template.id})`}
        opacity="0.95"
      />
      {/* Ribbon - right loop */}
      <path
        d={`M ${cx + 6} ${ribbonY}
            C ${cx + size * 0.11} ${ribbonY - size * 0.11},
              ${cx + size * 0.32} ${ribbonY - size * 0.12},
              ${cx + size * 0.3} ${ribbonY + size * 0.005}
            C ${cx + size * 0.28} ${ribbonY + size * 0.09},
              ${cx + size * 0.08} ${ribbonY + size * 0.055},
              ${cx + 6} ${ribbonY} Z`}
        fill={`url(#rib-${template.id})`}
        opacity="0.95"
      />
      {/* Ribbon tails */}
      <path
        d={`M ${cx - 4} ${ribbonY} L ${cx - size * 0.15} ${ribbonY + size * 0.1} L ${cx - size * 0.18} ${ribbonY + size * 0.135} L ${cx - 3} ${ribbonY + size * 0.028} Z`}
        fill={ribbonColor}
        opacity="0.9"
      />
      <path
        d={`M ${cx + 4} ${ribbonY} L ${cx + size * 0.15} ${ribbonY + size * 0.1} L ${cx + size * 0.18} ${ribbonY + size * 0.135} L ${cx + 3} ${ribbonY + size * 0.028} Z`}
        fill={ribbonColor}
        opacity="0.9"
      />
      {/* Ribbon knot */}
      <ellipse cx={cx} cy={ribbonY} rx={size * 0.04} ry={size * 0.026} fill={adjustColorSVG(ribbonColor, 20)} />

      {/* Stripe pattern on ribbon if needed */}
      {ribbonStripe && (
        <g opacity="0.3">
          {[-3, -1, 1, 3].map((n) => (
            <line
              key={n}
              x1={cx + n * size * 0.04} y1={ribbonY - size * 0.12}
              x2={cx + n * size * 0.025} y2={ribbonY + size * 0.04}
              stroke={adjustColorSVG(ribbonColor, -60)}
              strokeWidth="2"
            />
          ))}
        </g>
      )}
    </svg>
  );
}

function adjustColorSVG(hex: string, amount: number): string {
  if (!hex || !hex.startsWith('#')) return hex || '#888888';
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const h = hex.replace('#', '').padStart(6, '0');
  const num = parseInt(h, 16);
  const r = clamp(((num >> 16) & 0xff) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

export default function TemplateGallery() {
  return (
    <section className="templates-section" aria-label="Design templates">
      <div className="section-container">
        <h2 className="section-title">Design Inspirations</h2>
        <p className="section-subtitle">
          12 curated bouquet styles — click any to start customizing
        </p>

        <div className="templates-grid">
          {BUCKET_TEMPLATES.map((template) => (
            <Link
              key={template.id}
              href="/designer"
              id={`template-${template.id}`}
              className="template-card"
              style={{ background: template.bgColor }}
            >
              {/* Tag badge */}
              <span
                className="template-tag"
                style={{ background: template.wrapperColor, color: template.ribbonColor }}
              >
                {template.tag}
              </span>

              {/* SVG Bouquet Preview */}
              <div className="template-preview">
                <BouquetPreview template={template} size={200} />
              </div>

              {/* Info */}
              <div className="template-info">
                <h3 className="template-name">{template.name}</h3>
                <p className="template-desc">{template.description}</p>
                <div className="template-colors">
                  {template.flowerColors.slice(0, 5).map((color, i) => (
                    <span
                      key={i}
                      className="template-color-dot"
                      style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid #ddd' : 'none' }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>

              <div className="template-cta">Customize →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
