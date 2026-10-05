'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, Flame, Droplets, Sparkles, Heart, Copy, Check, UserPlus, 
  Crown, RefreshCw, Send, Calendar, ShieldCheck, ChevronRight
} from 'lucide-react';
import ModalPortal from '../ui/ModalPortal';
import { useDesign, getOrCreateDeviceId } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';

interface DailyNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface GardenData {
  id: string;
  gardenCode: string;
  gardenName: string;
  flowerType: string;
  flowerName: string;
  growthStage: number; // 1 - 5
  streakCount: number;
  ownerName: string;
  ownerDeviceId: string;
  partnerName?: string | null;
  partnerDeviceId?: string | null;
  lastWateredAt: string;
  lastWateredBy: string;
  wateredToday: boolean;
  dailyNotes: DailyNote[];
}

interface FlowerGardenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVipModal: () => void;
}

const FLOWER_OPTIONS = [
  { id: 'rose_red', name: 'Mawar Merah Sejati', nameEn: 'True Red Rose', emoji: '🌹', desc: 'Simbol cinta abadi dan ketulusan mendalam', descEn: 'Symbol of eternal love and deep sincerity' },
  { id: 'tulip_pink', name: 'Tulip Pastel Romantis', nameEn: 'Romantic Pastel Tulip', emoji: '🌷', desc: 'Kasih sayang lembut dan kehangatan hati', descEn: 'Gentle affection and heartwarming tenderness' },
  { id: 'sunflower', name: 'Bunga Matahari Hangat', nameEn: 'Warm Sunflower', emoji: '🌻', desc: 'Keceriaan, kesetiaan, dan sinar harapan', descEn: 'Joy, faithfulness, and rays of hope' },
  { id: 'hydrangea_blue', name: 'Hortensia Biru Syahdu', nameEn: 'Serene Blue Hydrangea', emoji: '🪻', desc: 'Rasa syukur dan ketenangan jiwa', descEn: 'Heartfelt gratitude and inner peace' },
  { id: 'lavender_purple', name: 'Lavender Kedamaian', nameEn: 'Peaceful Lavender', emoji: '💐', desc: 'Keanggunan, ketenangan, dan kesetiaan', descEn: 'Elegance, calm serenity, and devotion' },
];

export default function FlowerGardenModal({
  isOpen,
  onClose,
  onOpenVipModal,
}: FlowerGardenModalProps) {
  const { hasGardenAccess, premiumUserName } = useDesign();
  const { isEn } = useLanguage();
  
  // State
  const [garden, setGarden] = useState<GardenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [showWateringFx, setShowWateringFx] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Form states jika belum punya kebun
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [gardenName, setGardenName] = useState('');
  const [ownerName, setOwnerName] = useState(premiumUserName || '');
  const [selectedFlower, setSelectedFlower] = useState('rose_red');
  const [joinCode, setJoinCode] = useState('');
  const [partnerJoinName, setPartnerJoinName] = useState(premiumUserName || '');
  const [dailyNoteText, setDailyNoteText] = useState('');
  const [actionError, setActionError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Fetch garden info
  const fetchGarden = useCallback(async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch(`/api/garden?deviceId=${encodeURIComponent(deviceId)}`);
      const data = await res.json();
      if (data.success && data.garden) {
        setGarden(data.garden);
      } else {
        setGarden(null);
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchGarden();
      if (premiumUserName) {
        setOwnerName(premiumUserName);
        setPartnerJoinName(premiumUserName);
      }
    }
  }, [isOpen, fetchGarden, premiumUserName]);

  // Handler Buat Kebun Baru
  const handleCreateGarden = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim()) {
      setActionError(isEn ? 'Please enter your name.' : 'Silakan masukkan nama Anda.');
      return;
    }
    if (!gardenName.trim()) {
      setActionError(isEn ? 'Garden name is required before planting 🌸' : 'Nama kebun bunga wajib diisi sebelum mulai menanam 🌸');
      return;
    }
    setIsLoading(true);
    setActionError('');
    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch('/api/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          deviceId,
          ownerName: ownerName.trim(),
          gardenName: gardenName.trim(),
          flowerType: selectedFlower,
        }),
      });
      const data = await res.json();
      if (data.success && data.garden) {
        setGarden(data.garden);
        setActionError(data.warning || '');
        window.dispatchEvent(new Event('bucket-garden-link-updated'));
        try {
          const trimmedGarden = gardenName.trim();
          const existing = localStorage.getItem('bucket_garden_info_v3');
          let info: any = { name: trimmedGarden, partner: '', streak: 14 };
          if (existing) {
            try {
              const parsed = JSON.parse(existing);
              info = { ...parsed, name: trimmedGarden };
            } catch {}
          }
          localStorage.setItem('bucket_garden_info_v3', JSON.stringify(info));
          localStorage.setItem('bucket_garden_named', 'true');
        } catch {}
        setSuccessToast(isEn ? '🌱 Flower garden planted successfully!' : '🌱 Kebun bunga berhasil ditanam!');
        setTimeout(() => setSuccessToast(''), 3000);
      } else {
        setActionError(data.message || (isEn ? 'Failed to create garden.' : 'Gagal membuat kebun.'));
      }
    } catch {
      setActionError(isEn ? 'Connection lost. Please try again.' : 'Koneksi terputus. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Gabung Kebun Pasangan
  const handleJoinGarden = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setActionError(isEn ? 'Please enter 6-digit garden code.' : 'Masukkan 6 digit kode kebun.');
      return;
    }
    if (!partnerJoinName.trim()) {
      setActionError(isEn ? 'Please enter your name.' : 'Silakan masukkan nama Anda.');
      return;
    }
    setIsLoading(true);
    setActionError('');
    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch('/api/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          deviceId,
          gardenCode: joinCode.trim().toUpperCase(),
          partnerName: partnerJoinName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchGarden();
        window.dispatchEvent(new Event('bucket-garden-link-updated'));
        setSuccessToast(isEn ? '💕 Joined garden successfully!' : '💕 Berhasil bergabung ke kebun!');
        setTimeout(() => setSuccessToast(''), 3000);
      } else {
        setActionError(data.message || (isEn ? 'Failed to join garden.' : 'Gagal bergabung ke kebun.'));
      }
    } catch {
      setActionError(isEn ? 'Connection lost. Please try again.' : 'Koneksi terputus. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler Siram Bunga
  const handleWaterFlower = async () => {
    if (!garden) return;
    setIsWatering(true);
    setActionError('');
    try {
      const deviceId = getOrCreateDeviceId();
      const defaultName = isEn ? 'Flower Lover' : 'Pencinta Bunga';
      const userName = (garden.ownerDeviceId === deviceId ? garden.ownerName : garden.partnerName) || premiumUserName || defaultName;
      
      const res = await fetch('/api/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'water',
          deviceId,
          gardenCode: garden.gardenCode,
          userName,
          note: dailyNoteText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowWateringFx(true);
        setDailyNoteText('');
        setSuccessToast(isEn ? `✨ Streak increased to ${data.streakCount} days 🔥!` : `✨ Api streak naik ke ${data.streakCount} hari 🔥!`);
        await fetchGarden();
        setTimeout(() => setShowWateringFx(false), 2400);
        setTimeout(() => setSuccessToast(''), 4000);
      } else {
        setActionError(data.message || (isEn ? 'Failed to water flower.' : 'Gagal menyiram bunga.'));
      }
    } catch {
      setActionError(isEn ? 'Connection lost while watering.' : 'Koneksi terputus saat menyiram.');
    } finally {
      setIsWatering(false);
    }
  };

  const handleCopyCode = () => {
    if (!garden?.gardenCode) return;
    navigator.clipboard.writeText(garden.gardenCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Visual Tahap Pertumbuhan
  const renderPlantVisual = () => {
    if (!garden) return null;
    const stage = garden.growthStage;
    
    // Label dan ikon berdasarkan stage
    let stageTitle = isEn ? 'Stage 1: Seed Planted' : 'Tahap 1: Bibit Tertanam';
    let stageEmoji = '🌱';
    let stageBadge = isEn ? 'Tiny Seed' : 'Bibit Mungil';
    let plantScale = 'scale-90';

    if (stage === 2) {
      stageTitle = isEn ? 'Stage 2: Lush Green Sprout' : 'Tahap 2: Tunas Daun Rimbun';
      stageEmoji = '🌿';
      stageBadge = isEn ? 'Fresh Sprout' : 'Tunas Segar';
      plantScale = 'scale-100';
    } else if (stage === 3) {
      stageTitle = isEn ? 'Stage 3: Delicate Flower Bud' : 'Tahap 3: Kuncup Bunga Cantik';
      stageEmoji = '🌷';
      stageBadge = isEn ? 'Opening Bud' : 'Kuncup Merekah';
      plantScale = 'scale-110';
    } else if (stage === 4) {
      stageTitle = isEn ? 'Stage 4: Full Blossom' : 'Tahap 4: Bunga Mekar Sempurna';
      stageEmoji = '🌸';
      stageBadge = isEn ? 'Beautiful Bloom' : 'Mekar Indah';
      plantScale = 'scale-125';
    } else if (stage >= 5) {
      stageTitle = isEn ? 'Stage 5: Crystal Bloom' : 'Tahap 5: Bunga Kristal Abadi';
      stageEmoji = '✨👑';
      stageBadge = isEn ? 'Radiant Legend' : 'Legendaris Bercahaya';
      plantScale = 'scale-140';
    }

    return (
      <div className="garden-plant-container">
        {/* Particle Glow Background */}
        <div className={`garden-aura-circle stage-${stage}`} />
        
        {/* Animasi siram air */}
        {showWateringFx && (
          <div className="garden-watering-fx">
            <span className="drop-1">💧</span>
            <span className="drop-2">💧</span>
            <span className="drop-3">✨</span>
            <span className="drop-4">💕</span>
          </div>
        )}

        <div className={`garden-plant-visual ${plantScale}`}>
          <div className="garden-pot">🪴</div>
          <div className="garden-flower-bloom">{stageEmoji}</div>
        </div>

        <div className="garden-stage-info">
          <span className="garden-stage-badge">{stageBadge}</span>
          <h4 className="garden-stage-title">{stageTitle}</h4>
          <p className="garden-stage-hint">
            {stage < 5 
              ? (isEn ? 'Water every day together to grow flower to the next stage!' : 'Siram setiap hari bersama untuk menumbuhkan bunga ke tahap berikutnya!')
              : (isEn ? 'Incredible! Your shared flower has bloomed perpetually at maximum level!' : 'Luar biasa! Bunga cinta kalian telah mekar abadi di tingkat maksimal!')
            }
          </p>
        </div>
      </div>
    );
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="boutique-modal-backdrop" onClick={onClose}>
        <div
          className="boutique-modal-sheet garden-modal-sheet"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            type="button"
            className="boutique-modal-close"
            onClick={onClose}
            aria-label={isEn ? 'Close' : 'Tutup'}
          >
            <X size={18} />
          </button>

          {/* ── KONDISI 1: Belum Punya VIP Selamanya (Gated Lifetime VIP) ── */}
          {!hasGardenAccess ? (
            <div className="garden-locked-view">
              <div className="garden-lock-header">
                <div className="garden-crown-badge">
                  <Crown size={22} className="text-amber-500" />
                </div>
                <span className="boutique-eyebrow text-amber-700">
                  {isEn ? 'Exclusive Feature for Lifetime VIP Members' : 'Fitur Eksklusif Member VIP Selamanya'}
                </span>
                <h3 className="boutique-modal-title">
                  {isEn ? 'Daily Flower Garden (Fire Streak 🔥)' : 'Kebun Bunga Harian (Api Streak 🔥)'}
                </h3>
                <p className="boutique-modal-desc">
                  {isEn
                    ? 'Water flowers together with your partner or friend every day like the Fire streak on TikTok. Watch your flowers bloom with your shared consistency!'
                    : 'Siram bunga bersama pasangan atau sahabat setiap harinya seperti fitur Api di TikTok. Bunga bertumbuh mekar seiring konsistensi kalian!'}
                </p>
              </div>

              {/* Preview Fitur Kebun */}
              <div className="garden-perks-grid">
                <div className="garden-perk-card">
                  <div className="garden-perk-icon">🔥</div>
                  <div className="garden-perk-text">
                    <strong>{isEn ? 'TikTok Fire Streak' : 'Streak Api TikTok'}</strong>
                    <span>{isEn ? 'Keep track of your consecutive days together.' : 'Catat konsistensi hari kalian tanpa putus.'}</span>
                  </div>
                </div>
                <div className="garden-perk-card">
                  <div className="garden-perk-icon">🌱➡️🌸</div>
                  <div className="garden-perk-text">
                    <strong>{isEn ? 'Real Flower Evolution' : 'Evolusi Bunga Nyata'}</strong>
                    <span>{isEn ? 'From seed, sprout, to dazzling legendary bloom.' : 'Dari bibit, tunas, hingga mekar berkilau legendaris.'}</span>
                  </div>
                </div>
                <div className="garden-perk-card">
                  <div className="garden-perk-icon">💌</div>
                  <div className="garden-perk-text">
                    <strong>{isEn ? 'Invite Together via Code' : 'Undang Berdua via Kode'}</strong>
                    <span>{isEn ? 'Send 6-digit code to partner & leave sweet notes daily.' : 'Kirim kode 6 digit ke pasangan & titip pesan cinta tiap hari.'}</span>
                  </div>
                </div>
              </div>

              <div className="garden-upgrade-cta">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVipModal();
                  }}
                  className="boutique-submit-btn-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold"
                >
                  <Crown size={18} className="mr-2 inline" />
                  {isEn ? 'Unlock Lifetime VIP Now' : 'Buka VIP Selamanya Sekarang'}
                </button>
                <p className="boutique-subnote mt-2">
                  {isEn
                    ? 'Available in Lifetime Package (One-time payment, active forever).'
                    : 'Tersedia di Paket Selamanya (Sekali bayar aktif tanpa batas waktu).'}
                </p>
              </div>
            </div>
          ) : (
            /* ── KONDISI 2: Sudah Punya VIP Selamanya ── */
            <div className="garden-unlocked-view">
              {/* Header Kebun */}
              <div className="garden-unlocked-header">
                <div className="flex items-center gap-2">
                  <span className="garden-streak-chip">
                    <Flame size={16} className="text-orange-500 animate-pulse fill-orange-500" />
                    <strong>{garden?.streakCount || 1} {isEn ? 'Days' : 'Hari'}</strong>
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {isEn ? 'Daily Flower Garden' : 'Kebun Bunga Harian'}
                  </span>
                </div>
                <h3 className="boutique-modal-title mt-1">
                  {garden ? garden.gardenName : (isEn ? 'Exclusive Flower Garden' : 'Kebun Bunga Eksklusif')}
                </h3>
              </div>

              {successToast && (
                <div className="boutique-alert boutique-alert-success mb-3">
                  <span>{successToast}</span>
                </div>
              )}
              {actionError && (
                <div className="boutique-alert boutique-alert-error mb-3">
                  <span>{actionError}</span>
                </div>
              )}

              {/* JIKA BELUM ADA KEBUN (FORM BUAT / GABUNG) */}
              {!garden ? (
                <div className="garden-setup-container">
                  <div className="garden-setup-tabs">
                    <button
                      type="button"
                      className={`garden-setup-tab ${mode === 'create' ? 'active' : ''}`}
                      onClick={() => setMode('create')}
                    >
                      {isEn ? '🌱 Plant New Flower' : '🌱 Tanam Bunga Baru'}
                    </button>
                    <button
                      type="button"
                      className={`garden-setup-tab ${mode === 'join' ? 'active' : ''}`}
                      onClick={() => setMode('join')}
                    >
                      {isEn ? '💌 Join Partner Garden' : '💌 Gabung Kebun Pasangan'}
                    </button>
                  </div>

                  {mode === 'create' ? (
                    <form onSubmit={handleCreateGarden} className="garden-form">
                      <div className="boutique-form-field">
                        <label className="boutique-input-label">{isEn ? 'Your Name' : 'Nama Kamu'}</label>
                        <input
                          type="text"
                          className="boutique-input"
                          placeholder={isEn ? 'e.g. Sarah' : 'Cth: Sarah'}
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="boutique-form-field">
                        <label className="boutique-input-label flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span>{isEn ? 'Your Flower Garden Name' : 'Nama Kebun Bunga Anda'}</span>
                            <span className="text-rose-500 font-bold">*</span>
                          </span>
                          <span className="text-[10px] text-amber-700 font-extrabold px-1.5 py-0.5 rounded bg-amber-100">
                            {isEn ? 'REQUIRED *' : 'WAJIB *'}
                          </span>
                        </label>
                        <input
                          type="text"
                          className="boutique-input"
                          placeholder={isEn ? 'e.g. Sarah & Reza Love Garden, Our Sanctuary...' : 'Cth: Kebun Cinta Sarah & Reza, Taman Mawar Kita...'}
                          value={gardenName}
                          onChange={(e) => setGardenName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="boutique-form-field">
                        <label className="boutique-input-label">{isEn ? 'Select First Flower Seed' : 'Pilih Bibit Bunga Pertama'}</label>
                        <div className="garden-flower-selector">
                          {FLOWER_OPTIONS.map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setSelectedFlower(f.id)}
                              className={`garden-flower-opt ${selectedFlower === f.id ? 'active' : ''}`}
                            >
                              <span className="text-2xl">{f.emoji}</span>
                              <div className="text-left">
                                <div className="font-semibold text-xs text-stone-800">{isEn ? f.nameEn : f.name}</div>
                                <div className="text-[10px] text-stone-500 line-clamp-1">{isEn ? f.descEn : f.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="boutique-submit-btn-full"
                      >
                        {isLoading
                          ? (isEn ? 'Planting Seed...' : 'Menanam Bibit...')
                          : (isEn ? 'Plant Flower Now 🌱' : 'Tanam Bunga Sekarang 🌱')}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleJoinGarden} className="garden-form">
                      <div className="boutique-form-field">
                        <label className="boutique-input-label">{isEn ? 'Garden Code (6 Characters)' : 'Kode Kebun (6 Karakter)'}</label>
                        <input
                          type="text"
                          className="boutique-input uppercase-text font-mono tracking-widest text-center text-lg"
                          placeholder="ROSE88"
                          maxLength={8}
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value)}
                          required
                        />
                        <span className="text-[11px] text-stone-500 mt-1">
                          {isEn ? 'Ask for the 6-digit garden code from your partner / friend.' : 'Minta kode kebun 6 digit dari pasangan / temanmu.'}
                        </span>
                      </div>

                      <div className="boutique-form-field">
                        <label className="boutique-input-label">{isEn ? 'Your Name' : 'Nama Kamu'}</label>
                        <input
                          type="text"
                          className="boutique-input"
                          placeholder={isEn ? 'e.g. Reza' : 'Cth: Reza'}
                          value={partnerJoinName}
                          onChange={(e) => setPartnerJoinName(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="boutique-submit-btn-full"
                      >
                        {isLoading
                          ? (isEn ? 'Connecting...' : 'Menghubungkan...')
                          : (isEn ? 'Join Garden 💕' : 'Gabung ke Kebun 💕')}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* JIKA SUDAH ADA KEBUN: TAMPILAN DASHBOARD KEBUN */
                <div className="garden-dashboard">
                  {/* Kode Undang & Partner Bar */}
                  <div className="garden-partner-bar">
                    <div className="garden-code-chip" onClick={handleCopyCode} title={isEn ? 'Click to copy code' : 'Klik untuk salin kode'}>
                      <span className="text-[11px] text-stone-500">{isEn ? 'Code:' : 'Kode:'}</span>
                      <strong className="font-mono text-sm tracking-wider text-stone-800">{garden.gardenCode}</strong>
                      {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={13} className="text-stone-400" />}
                    </div>

                    <div className="garden-members-view">
                      <div className="garden-member-badge" title={isEn ? 'Owner' : 'Pemilik'}>
                        👑 {garden.ownerName}
                      </div>
                      <span className="text-stone-400 text-xs">&amp;</span>
                      {garden.partnerName ? (
                        <div className="garden-member-badge partner" title={isEn ? 'Partner' : 'Pasangan'}>
                          💕 {garden.partnerName}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="garden-invite-pill"
                        >
                          <UserPlus size={12} />
                          <span>{isEn ? 'Invite Partner' : 'Undang Pasangan'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Bunga Bertumbuh */}
                  {renderPlantVisual()}

                  {/* Tombol Siram Bunga Harian */}
                  <div className="garden-watering-section">
                    {garden.wateredToday ? (
                      <div className="garden-watered-notice">
                        <Sparkles size={16} className="text-amber-500" />
                        <div>
                          <strong>{isEn ? 'Fresh Bloom Today!' : 'Bunga Segar Hari Ini!'}</strong>
                          <p>
                            {isEn
                              ? `Already watered by ${garden.lastWateredBy}. Come back tomorrow to keep the fire streak burning 🔥`
                              : `Sudah disiram oleh ${garden.lastWateredBy}. Kembali lagi besok untuk menjaga api streak 🔥`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="garden-water-action-box">
                        <div className="boutique-form-field mb-2">
                          <input
                            type="text"
                            className="boutique-input text-xs"
                            placeholder={isEn ? 'Write a sweet note today... (optional)' : 'Tulis pesan manis hari ini... (opsional)'}
                            value={dailyNoteText}
                            onChange={(e) => setDailyNoteText(e.target.value)}
                            maxLength={100}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleWaterFlower}
                          disabled={isWatering}
                          className="garden-water-btn"
                        >
                          <Droplets size={18} className="animate-bounce" />
                          <span>
                            {isWatering
                              ? (isEn ? 'Watering...' : 'Sedang Menyiram...')
                              : (isEn ? 'Water Flower Today 💧 (+1 🔥 Streak)' : 'Siram Bunga Hari Ini 💧 (+1 🔥 Streak)')}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Catatan Harian (Love Notes Board) */}
                  <div className="garden-notes-section">
                    <h5 className="garden-notes-title">
                      {isEn ? '💌 Garden Daily Notes' : '💌 Catatan Harian Kebun'}
                    </h5>
                    <div className="garden-notes-list">
                      {garden.dailyNotes && garden.dailyNotes.length > 0 ? (
                        garden.dailyNotes.slice(0, 5).map((note) => (
                          <div key={note.id} className="garden-note-bubble">
                            <span className="garden-note-author">{note.author}:</span>
                            <span className="garden-note-text">{note.text}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-stone-400 italic">
                          {isEn ? 'No notes yet.' : 'Belum ada catatan.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
