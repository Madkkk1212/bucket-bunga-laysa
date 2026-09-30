'use client';

import React, { useMemo } from 'react';
import { useDesign } from '@/context/DesignContext';
import ConsoleRadarChart from './ConsoleRadarChart';
import ConsoleFlowerController from './ConsoleFlowerController';
import { computeAestheticMetrics } from '@/utils/bouquetConsolePresets';
import { consoleAudio } from '@/utils/consoleAudio';
import { Crown, Sparkles, ChevronRight, Gem, Info } from 'lucide-react';

interface ConsoleRightPanelProps {
  onOpenVipModal: () => void;
  onOpenVipCard: () => void;
}

export default function ConsoleRightPanel({
  onOpenVipModal,
  onOpenVipCard,
}: ConsoleRightPanelProps) {
  const {
    design,
    isPremiumUnlocked,
    premiumUserName,
    premiumTier,
  } = useDesign();

  // Compute live aesthetic metrics
  const metrics = useMemo(() => {
    return computeAestheticMetrics(
      design.selectedFlowers,
      design.targetFlowerCount || 25
    );
  }, [design.selectedFlowers, design.targetFlowerCount]);

  // Estimate bouquet value
  const estimatedPrice = useMemo(() => {
    const baseWrap = 45000;
    const flowerCost = design.selectedFlowers.length * 6000;
    return (baseWrap + flowerCost).toLocaleString('id-ID');
  }, [design.selectedFlowers.length]);

  return (
    <aside className="console-right-panel" aria-label="Panel Analisis & Controller Konsol">
      {/* ── 1. VIP Profile Status Capsule ── */}
      <div className="console-user-card">
        <div className="flex items-center gap-3">
          <div className="console-user-avatar">
            {isPremiumUnlocked ? (
              <Crown size={16} className="text-amber-400" />
            ) : (
              <Sparkles size={16} className="text-slate-400" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {isPremiumUnlocked ? 'Member Studio' : 'Mode Reguler'}
            </span>
            <span className="text-xs font-bold text-slate-100 truncate max-w-[130px]">
              {isPremiumUnlocked ? premiumUserName || 'VIP Member' : 'Studio Tamu'}
            </span>
          </div>
        </div>

        {isPremiumUnlocked ? (
          <button
            type="button"
            onClick={() => {
              consoleAudio.play('click');
              onOpenVipCard();
            }}
            className="console-vip-status-btn active"
            title="Buka Kartu Identitas VIP"
          >
            <span>VIP Card</span>
            <ChevronRight size={12} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              consoleAudio.play('chime');
              onOpenVipModal();
            }}
            className="console-vip-status-btn unlock"
            title="Buka Koleksi Bunga & Pembungkus VIP Eksklusif"
          >
            <Gem size={12} className="text-amber-300" />
            <span>Buka VIP</span>
          </button>
        )}
      </div>

      {/* ── 2. Aesthetic Radar Chart Widget ── */}
      <div className="console-panel-section">
        <ConsoleRadarChart metrics={metrics} targetCount={design.targetFlowerCount || 25} />
      </div>

      {/* ── 3. Console D-Pad & Controller Widget ── */}
      <div className="console-panel-section">
        <ConsoleFlowerController />
      </div>

      {/* ── 4. Live Commercial Estimate Pill ── */}
      <div className="console-estimate-card">
        <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Info size={12} className="text-cyan-400" />
            <span>Estimasi Rangkaian:</span>
          </span>
          <span className="font-extrabold text-cyan-300 font-mono">Rp {estimatedPrice}</span>
        </div>
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, Math.round((design.selectedFlowers.length / (design.targetFlowerCount || 25)) * 100))}%`,
            }}
          />
        </div>
      </div>
    </aside>
  );
}
