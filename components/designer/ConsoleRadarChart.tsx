'use client';

import React from 'react';
import { AestheticMetrics } from '@/utils/bouquetConsolePresets';
import { Sparkles, Palette, CheckCircle2, Scale, Layers } from 'lucide-react';

interface ConsoleRadarChartProps {
  metrics: AestheticMetrics;
  targetCount: number;
}

export default function ConsoleRadarChart({ metrics, targetCount }: ConsoleRadarChartProps) {
  // Center of 180x180 viewBox
  const cx = 90;
  const cy = 90;
  const maxR = 64;

  // 4 axes:
  // Top (0 deg / -90 from standard): Harmoni Warna
  // Right (90 deg): Kerapatan
  // Bottom (180 deg): Keseimbangan
  // Left (270 deg): Keragaman
  const axes = [
    { label: 'Harmoni', key: 'harmonyScore', val: metrics.harmonyScore, angle: -Math.PI / 2, icon: Palette },
    { label: 'Kerapatan', key: 'fullnessScore', val: metrics.fullnessScore, angle: 0, icon: Layers },
    { label: 'Keseimbangan', key: 'balanceScore', val: metrics.balanceScore, angle: Math.PI / 2, icon: Scale },
    { label: 'Keragaman', key: 'diversityScore', val: metrics.diversityScore, angle: Math.PI, icon: Sparkles },
  ];

  // Grid levels at 33%, 66%, 100%
  const gridLevels = [0.33, 0.66, 1.0];

  const getPointsString = (level: number) => {
    return axes
      .map((axis) => {
        const r = maxR * level;
        const x = cx + r * Math.cos(axis.angle);
        const y = cy + r * Math.sin(axis.angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Data polygon points
  const dataPoints = axes.map((axis) => {
    const ratio = Math.max(0.12, Math.min(1.0, axis.val / 100));
    const r = maxR * ratio;
    const x = cx + r * Math.cos(axis.angle);
    const y = cy + r * Math.sin(axis.angle);
    return { x, y, val: axis.val, label: axis.label };
  });

  const dataPointsString = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Rating badge color
  const getBadgeColor = (score: number) => {
    if (score >= 88) return 'from-emerald-400 to-teal-500 text-white border-emerald-500/30';
    if (score >= 70) return 'from-cyan-400 to-blue-500 text-white border-cyan-500/30';
    if (score >= 50) return 'from-amber-400 to-orange-500 text-white border-amber-500/30';
    return 'from-slate-400 to-slate-500 text-slate-200 border-slate-600/30';
  };

  return (
    <div className="console-radar-card">
      <div className="console-radar-header">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">
            Analisis Estetika
          </span>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r border shadow-sm ${getBadgeColor(metrics.totalScore)}`}>
          {metrics.totalScore}/100
        </div>
      </div>

      {/* SVG Radar Display */}
      <div className="console-radar-svg-wrap">
        <svg viewBox="0 0 180 180" className="console-radar-svg" aria-label="Grafik Radar Estetika Rangkaian Buket">
          <defs>
            {/* Radar area gradient */}
            <linearGradient id="consoleRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.45" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="consoleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Concentric Polygons */}
          {gridLevels.map((lvl, idx) => (
            <polygon
              key={`grid-${idx}`}
              points={getPointsString(lvl)}
              fill={idx === 2 ? 'rgba(30, 41, 59, 0.4)' : 'none'}
              stroke="rgba(148, 163, 184, 0.18)"
              strokeWidth="1"
              strokeDasharray={idx === 1 ? '3 3' : 'none'}
            />
          ))}

          {/* Radial Cross Axis Lines */}
          {axes.map((axis, i) => {
            const ex = cx + maxR * Math.cos(axis.angle);
            const ey = cy + maxR * Math.sin(axis.angle);
            return (
              <line
                key={`axis-${i}`}
                x1={cx}
                y1={cy}
                x2={ex}
                y2={ey}
                stroke="rgba(148, 163, 184, 0.22)"
                strokeWidth="1"
              />
            );
          })}

          {/* Glowing Data Polygon */}
          <polygon
            points={dataPointsString}
            fill="url(#consoleRadarGrad)"
            stroke="#38bdf8"
            strokeWidth="2"
            filter="url(#consoleGlow)"
            className="transition-all duration-300 ease-out"
          />

          {/* Data Vertex Nodes */}
          {dataPoints.map((pt, i) => (
            <circle
              key={`dot-${i}`}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#ffffff"
              stroke="#0284c7"
              strokeWidth="2"
              className="transition-all duration-300 ease-out"
            />
          ))}

          {/* Axis Labels in SVG */}
          <text x={cx} y={15} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700">
            Harmoni
          </text>
          <text x={172} y={cy + 3} textAnchor="end" fill="#94a3b8" fontSize="9" fontWeight="700">
            Kerapatan
          </text>
          <text x={cx} y={173} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700">
            Seimbang
          </text>
          <text x={8} y={cy + 3} textAnchor="start" fill="#94a3b8" fontSize="9" fontWeight="700">
            Ragam
          </text>
        </svg>
      </div>

      {/* Metrics Summary Strip */}
      <div className="console-radar-stats">
        <div className="console-stat-pill">
          <span className="text-[10px] text-slate-400">Tangkai</span>
          <span className="text-xs font-bold text-slate-100">
            {metrics.flowerCount} / {targetCount}
          </span>
        </div>
        <div className="console-stat-pill">
          <span className="text-[10px] text-slate-400">Varietas</span>
          <span className="text-xs font-bold text-cyan-300">
            {metrics.uniqueSpeciesCount} Jenis
          </span>
        </div>
        <div className="console-stat-pill">
          <span className="text-[10px] text-slate-400">Status</span>
          <span className="text-xs font-bold text-emerald-300 truncate max-w-[85px]" title={metrics.ratingLabel}>
            {metrics.ratingLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
