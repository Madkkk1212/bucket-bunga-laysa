'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { consoleAudio } from '@/utils/consoleAudio';
import {
  PackageOpen,
  Flower2,
  Mail,
  Eye,
  Download,
  Flame,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface ConsoleLeftDockProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  onOpenGarden: () => void;
  onBackToDashboard?: () => void;
}

const STEP_ITEMS = [
  { step: 1, label: 'Bucket', icon: PackageOpen, desc: 'Pilih Ukuran & Pembungkus' },
  { step: 2, label: 'Bunga', icon: Flower2, desc: 'Rangkai Komposisi Bunga' },
  { step: 3, label: 'Kartu', icon: Mail, desc: 'Tulis Kartu Ucapan' },
  { step: 4, label: 'Pratinjau', icon: Eye, desc: 'Lihat Desain & Rasio HD' },
  { step: 5, label: 'Unduh', icon: Download, desc: 'Simpan Buket & Cetak' },
];

export default function ConsoleLeftDock({
  currentStep,
  onStepClick,
  onOpenGarden,
  onBackToDashboard,
}: ConsoleLeftDockProps) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(consoleAudio.getMuted());
  }, []);

  const handleToggleMute = () => {
    const next = consoleAudio.toggleMute();
    setIsMuted(next);
  };

  const handleStepSelect = (step: number) => {
    consoleAudio.play('click');
    onStepClick(step);
  };

  return (
    <aside className="console-left-dock" aria-label="Navigasi Konsol Studio">
      {/* Brand Icon Capsule */}
      <div className="console-dock-brand">
        <Link href="/" className="console-dock-brand-link" title="Beranda Laysa Bouquet">
          <div className="console-dock-brand-icon">
            <Sparkles size={16} className="text-cyan-300" />
          </div>
        </Link>
      </div>

      {/* Back to Dashboard if provided */}
      {onBackToDashboard && (
        <button
          type="button"
          onClick={() => {
            consoleAudio.play('click');
            onBackToDashboard();
          }}
          className="console-dock-icon-btn text-slate-400 hover:text-white"
          title="Kembali ke Menu Utama"
        >
          <ArrowLeft size={16} />
        </button>
      )}

      <div className="console-dock-divider" />

      {/* Step Buttons Capsule Rail */}
      <div className="console-dock-steps">
        {STEP_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;

          return (
            <button
              key={item.step}
              type="button"
              onClick={() => handleStepSelect(item.step)}
              className={`console-dock-step-btn ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              title={`${item.step}. ${item.label} — ${item.desc}`}
            >
              <div className="console-dock-step-icon-wrap">
                <Icon size={17} />
                {isActive && <span className="console-step-glow-dot" />}
              </div>
              <span className="console-dock-step-label">{item.label}</span>
              <span className="console-dock-step-badge">{item.step}</span>
            </button>
          );
        })}
      </div>

      <div className="console-dock-divider" />

      {/* Utility Actions */}
      <div className="console-dock-utils">
        {/* Garden Streak */}
        <button
          type="button"
          onClick={() => {
            consoleAudio.play('chime');
            onOpenGarden();
          }}
          className="console-dock-util-btn streak-glow"
          title="Kebun Bunga Harian (Api Streak 🔥)"
        >
          <Flame size={17} className="text-amber-400" />
          <span className="console-dock-util-label">Kebun</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          type="button"
          onClick={handleToggleMute}
          className={`console-dock-util-btn ${isMuted ? 'text-slate-500' : 'text-cyan-400'}`}
          title={isMuted ? 'Aktifkan Suara Konsol Taktil' : 'Matikan Suara Konsol'}
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          <span className="console-dock-util-label">{isMuted ? 'Mute' : 'Audio'}</span>
        </button>

        {/* Tutorial */}
        <Link
          href="/tutorial"
          className="console-dock-util-btn text-slate-400 hover:text-slate-200"
          title="Panduan Tutorial Merangkai Buket"
        >
          <BookOpen size={16} />
          <span className="console-dock-util-label">Bantuan</span>
        </Link>
      </div>
    </aside>
  );
}
