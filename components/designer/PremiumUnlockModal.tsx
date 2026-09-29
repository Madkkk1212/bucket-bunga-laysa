'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, MessageCircle, X, ArrowRight, ArrowLeft, ShieldCheck, 
  KeyRound, User, Crown, Clock, Calendar, Sparkles, Ticket
} from 'lucide-react';
import ModalPortal from '../ui/ModalPortal';
import { useDesign, getOrCreateDeviceId } from '@/context/DesignContext';

interface PremiumUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName?: string;
  itemType?: 'bucket' | 'bunga';
  defaultTier?: 'daily' | 'weekly' | 'lifetime';
  onOpenGarden?: () => void;
}

type PricingTierKey = 'daily' | 'weekly' | 'lifetime';
type ModalStep = 'VOUCHERS' | 'VOUCHER_DETAIL' | 'ENTER_CODE' | 'ENTER_NAME' | 'THANK_YOU';

const DEFAULT_PERKS: Record<PricingTierKey, { title: string; badge?: string; features: string[] }> = {
  daily: {
    title: '⏱️ Manfaat Paket Harian (24 Jam):',
    badge: 'Terjangkau & Praktis',
    features: [
      'Buka seluruh 100+ koleksi bunga & pembungkus buket',
      'Masa aktif 24 jam bebas rangkai & unduh sepuasnya',
      'Bisa terhubung hingga 5 perangkat bersamaan',
      'Unduh hasil buket jernih beresolusi HD',
      'Akses instan tanpa ribet daftar akun',
    ],
  },
  weekly: {
    title: '📅 Manfaat Paket Mingguan (7 Hari):',
    badge: 'Paling Hemat (Diskon 52%)',
    features: [
      'Buka seluruh 100+ koleksi bunga & pembungkus buket',
      'Masa aktif 7 hari penuh (Ideal untuk kado, wisuda & ultah)',
      'Bebas edit & simpan berbagai rancangan buket kapan saja',
      'Bisa terhubung hingga 5 perangkat bersamaan',
      'Jauh lebih hemat dibanding beli paket harian berulang kali',
    ],
  },
  lifetime: {
    title: '👑 Keuntungan Eksklusif VIP Sultan (Selamanya):',
    badge: 'Paling Lengkap & Permanen',
    features: [
      'Akses VIP permanen SELAMANYA (sekali bayar tanpa langganan)',
      '🌸 EKSKLUSIF: Buka Fitur Kebun Bunga Harian Streak 🔥 (Solo / Pasangan)',
      'Ekspor Kualitas Tertinggi Ultra HD 4K & Stiker WA (Transparan)',
      'Kartu Ucapan Kaligrafi Eksklusif & Ornamen Pita Mewah',
      'Bisa terhubung hingga 5 perangkat bersama keluarga / pasangan',
      'Akses gratis ke seluruh varian bunga & buket baru di masa depan',
    ],
  },
};

export default function PremiumUnlockModal({
  isOpen,
  onClose,
  itemName,
  defaultTier = 'lifetime',
  onOpenGarden,
}: PremiumUnlockModalProps) {
  const { unlockPremium, isPremiumUnlocked, premiumUserName } = useDesign();
  const [step, setStep] = useState<ModalStep>('VOUCHERS');
  const [code, setCode] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');
  const [verifiedTier, setVerifiedTier] = useState<PricingTierKey>('lifetime');
  const [userName, setUserName] = useState(premiumUserName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedTier, setSelectedTier] = useState<PricingTierKey>(defaultTier);

  const [codeInfo, setCodeInfo] = useState<{
    isOwner: boolean;
    ownerName?: string;
    slotNumber: number;
    maxDevices: number;
    tier?: string;
    expiresAt?: string | null;
    hasGardenAccess?: boolean;
  } | null>(null);

  const [pricingData, setPricingData] = useState<any>({
    basePrice: 85000,
    finalPrice: 17000,
    hasDiscount: true,
    discountBadge: 'Diskon 80%',
    promoLabel: 'Promo Terbatas',
    tiers: {
      daily: {
        key: 'daily',
        name: 'Paket Harian (24 Jam)',
        durationLabel: '24 Jam',
        basePrice: 10000,
        promoPrice: 5000,
        finalPrice: 5000,
        hasDiscount: true,
        discountPercentage: 50,
        discountBadge: 'Hemat 50%',
        isActive: true,
        gardenAccess: false,
      },
      weekly: {
        key: 'weekly',
        name: 'Paket Mingguan (7 Hari)',
        durationLabel: '7 Hari',
        basePrice: 25000,
        promoPrice: 12000,
        finalPrice: 12000,
        hasDiscount: true,
        discountPercentage: 52,
        discountBadge: 'Hemat 52%',
        isActive: true,
        gardenAccess: false,
      },
      lifetime: {
        key: 'lifetime',
        name: 'Paket Selamanya (VIP Sultan)',
        durationLabel: 'Selamanya',
        basePrice: 85000,
        promoPrice: 17000,
        finalPrice: 17000,
        hasDiscount: true,
        discountPercentage: 80,
        discountBadge: '👑 Terpopuler & Lengkap',
        isActive: true,
        gardenAccess: true,
      },
    },
  });

  const displayWaNumber = '0895-1461-8737';
  const cleanWaNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6289514618737').replace(/[^0-9]/g, '');

  // Reset step to vouchers when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('VOUCHERS');
      setErrorMsg('');
      setSuccessMsg('');
      fetch('/api/settings/pricing')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.pricing) {
            setPricingData(data.pricing);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const activeTierConfig = pricingData?.tiers?.[selectedTier] || {
    basePrice: 17000,
    finalPrice: 17000,
    hasDiscount: false,
    durationLabel: 'Selamanya',
  };

  const formattedPrice = `Rp ${activeTierConfig.finalPrice.toLocaleString('id-ID')}`;

  // WhatsApp order template with bullet benefits
  let waCustomText = '';
  if (selectedTier === 'daily') {
    waCustomText = `Halo Admin Laysa Florist, saya ingin pesan Kode Akses VIP Paket Harian 24 Jam (${formattedPrice}).\n\nBenefit:\n• Bebas rangkai semua bunga & buket (24 Jam)\n• Hingga 5 perangkat bersamaan\n• Format HD jernih\n\nBoleh minta nomor rekening/QRIS untuk pembayarannya? Terima kasih!`;
  } else if (selectedTier === 'weekly') {
    waCustomText = `Halo Admin Laysa Florist, saya ingin pesan Kode Akses VIP Paket Mingguan 7 Hari (${formattedPrice}).\n\nBenefit:\n• Bebas rangkai & edit semua bunga & buket (7 Hari)\n• Sangat cocok untuk kado wisuda & ultah\n• Hingga 5 perangkat bersamaan\n\nBoleh minta nomor rekening/QRIS untuk pembayarannya? Terima kasih!`;
  } else {
    waCustomText = `Halo Admin Laysa Florist, saya ingin pesan Kode Akses VIP Paket Selamanya Sultan (${formattedPrice}).\n\nBenefit Eksklusif:\n• Akses VIP Selamanya (Permanen Sekali Bayar)\n• EKSKLUSIF: Buka Fitur Kebun Bunga Streak 🔥\n• Ekspor Ultra HD 4K & Stiker WA Transparan\n• Hingga 5 perangkat bersamaan\n\nBoleh minta nomor rekening/QRIS untuk pembayarannya? Terima kasih!`;
  }

  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(waCustomText)}`;

  // Pilih voucher card dari daftar
  const handleSelectVoucher = (tierKey: PricingTierKey) => {
    setSelectedTier(tierKey);
    setStep('VOUCHER_DETAIL');
    setErrorMsg('');
  };

  // Verifikasi Kode Akses
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Silakan masukkan kode akses terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), checkOnly: true, deviceId }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.valid) {
        setVerifiedCode(data.code || code.trim().toUpperCase());
        setVerifiedTier(data.tier || 'lifetime');
        setCodeInfo({
          isOwner: Boolean(data.isOwner),
          ownerName: data.ownerName || data.registeredName || '',
          slotNumber: data.slotNumber ?? (data.deviceCount + 1),
          maxDevices: data.maxDevices ?? 5,
          tier: data.tier,
          expiresAt: data.expiresAt,
          hasGardenAccess: data.hasGardenAccess,
        });
        if (data.isOwner) {
          setUserName(data.registeredName || premiumUserName || '');
        } else {
          setUserName(premiumUserName || '');
        }
        setStep('ENTER_NAME');
        setErrorMsg('');
      } else {
        setErrorMsg(data.message || 'Kode akses tidak valid atau tidak ditemukan.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('Gagal terhubung ke server verifikasi. Periksa koneksi internet Anda.');
    }
  };

  // Input Nama & Aktivasi Selesai -> Lanjut ke Thank You Popup
  const handleClaimName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg('Silakan masukkan nama Anda untuk mengaktifkan kode ini.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const targetCode = verifiedCode || code.trim();
    const res = await unlockPremium(targetCode, userName.trim());
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || `Akses VIP aktif untuk ${userName.trim()}!`);
      // Lanjut ke popup Terima Kasih
      setStep('THANK_YOU');
    } else {
      setErrorMsg(res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="boutique-modal-backdrop" onClick={onClose}>
        <div
          className="boutique-modal-sheet"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            type="button"
            className="boutique-modal-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>

          {/* ═══════════════════════════════════════════════════════════
              STEP 1: PILIH TIKET VOUCHER (SEPERTI GAMBAR REFERENSI)
              ═══════════════════════════════════════════════════════════ */}
          {step === 'VOUCHERS' && (
            <div>
              <div className="boutique-modal-header">
                <span className="boutique-eyebrow">Studio Buket Laysa</span>
                <h3 className="boutique-modal-title">
                  Pilih Tiket Voucher VIP
                </h3>
                <p className="boutique-modal-desc">
                  {itemName ? (
                    <>
                      Koleksi <strong className="text-stone-900">"{itemName}"</strong> siap digunakan. Pilih voucher hemat Anda di bawah ini:
                    </>
                  ) : (
                    'Pilih salah satu kupon diskon di bawah ini untuk membuka seluruh bunga, buket & fitur eksklusif:'
                  )}
                </p>
              </div>

              {/* Daftar Tiket Voucher Bergaya Kupon Fisik */}
              <div className="voucher-tickets-list">
                {/* 1. VOUCHER HARIAN (24 JAM) */}
                <div
                  className="voucher-ticket-item"
                  onClick={() => handleSelectVoucher('daily')}
                  title="Klik untuk memilih Paket Harian (24 Jam)"
                >
                  <div className="voucher-ticket-left">
                    <div className="voucher-ticket-badge-row">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        {pricingData.tiers.daily.discountBadge || 'Hemat 50%'}
                      </span>
                    </div>
                    <div className="voucher-ticket-discount">
                      <span>50%</span>
                      <span className="voucher-ticket-discount-sub">OFF</span>
                    </div>
                    <div className="voucher-ticket-title">
                      Paket Harian (24 Jam)
                    </div>
                    <div className="voucher-ticket-sub">
                      <span className="voucher-ticket-price">Rp {pricingData.tiers.daily.finalPrice.toLocaleString('id-ID')}</span>
                      <span>•</span>
                      <span className="voucher-ticket-strike">Rp {pricingData.tiers.daily.basePrice.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="voucher-ticket-perforation" />

                  <div className="voucher-ticket-right">
                    <div className="voucher-ticket-brand-icon">
                      <Clock size={20} className="text-amber-600" />
                    </div>
                    <div className="voucher-ticket-brand-name">
                      Laysa Atelier
                    </div>
                    <div className="voucher-ticket-validity">
                      Aktif 24 Jam
                    </div>
                    <div className="voucher-ticket-notch-right" />
                  </div>
                </div>

                {/* 2. VOUCHER MINGGUAN (7 HARI) */}
                <div
                  className="voucher-ticket-item"
                  onClick={() => handleSelectVoucher('weekly')}
                  title="Klik untuk memilih Paket Mingguan (7 Hari)"
                >
                  <div className="voucher-ticket-left">
                    <div className="voucher-ticket-badge-row">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                        {pricingData.tiers.weekly.discountBadge || 'Paling Hemat 52%'}
                      </span>
                    </div>
                    <div className="voucher-ticket-discount">
                      <span>52%</span>
                      <span className="voucher-ticket-discount-sub">OFF</span>
                    </div>
                    <div className="voucher-ticket-title">
                      Paket Mingguan (7 Hari)
                    </div>
                    <div className="voucher-ticket-sub">
                      <span className="voucher-ticket-price">Rp {pricingData.tiers.weekly.finalPrice.toLocaleString('id-ID')}</span>
                      <span>•</span>
                      <span className="voucher-ticket-strike">Rp {pricingData.tiers.weekly.basePrice.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="voucher-ticket-perforation" />

                  <div className="voucher-ticket-right">
                    <div className="voucher-ticket-brand-icon" style={{ background: '#eef2ff' }}>
                      <Calendar size={20} className="text-indigo-600" />
                    </div>
                    <div className="voucher-ticket-brand-name">
                      Laysa Atelier
                    </div>
                    <div className="voucher-ticket-validity">
                      Aktif 7 Hari
                    </div>
                    <div className="voucher-ticket-notch-right" />
                  </div>
                </div>

                {/* 3. VOUCHER SELAMANYA (VIP SULTAN + KEBUN STREAK) */}
                <div
                  className="voucher-ticket-item lifetime-gold"
                  onClick={() => handleSelectVoucher('lifetime')}
                  title="Klik untuk memilih Paket Selamanya VIP Sultan"
                >
                  <div className="voucher-ticket-left">
                    <div className="voucher-ticket-badge-row">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        👑 Terpopuler &amp; Termasuk Kebun
                      </span>
                    </div>
                    <div className="voucher-ticket-discount gold">
                      <span>80%</span>
                      <span className="voucher-ticket-discount-sub">OFF</span>
                    </div>
                    <div className="voucher-ticket-title" style={{ color: '#92400e' }}>
                      Paket Selamanya (VIP Sultan)
                    </div>
                    <div className="voucher-ticket-sub">
                      <span className="voucher-ticket-price" style={{ color: '#b45309' }}>
                        Rp {pricingData.tiers.lifetime.finalPrice.toLocaleString('id-ID')}
                      </span>
                      <span>•</span>
                      <span className="voucher-ticket-strike">Rp {pricingData.tiers.lifetime.basePrice.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="text-[11px] font-bold text-amber-700 mt-1 flex items-center gap-1">
                      <span>🌸 EKSKLUSIF: Kebun Bunga Streak 🔥</span>
                    </div>
                  </div>

                  <div className="voucher-ticket-perforation" />

                  <div className="voucher-ticket-right">
                    <div className="voucher-ticket-brand-icon gold">
                      <Crown size={22} className="text-amber-700" />
                    </div>
                    <div className="voucher-ticket-brand-name" style={{ color: '#92400e' }}>
                      VIP Sultan
                    </div>
                    <div className="voucher-ticket-validity" style={{ color: '#b45309', fontWeight: 700 }}>
                      Selamanya
                    </div>
                    <div className="voucher-ticket-notch-right" />
                  </div>
                </div>
              </div>

              {/* Punya Kode Alternatif */}
              <div className="mt-4 pt-3 border-t border-stone-200 text-center">
                <button
                  type="button"
                  onClick={() => setStep('ENTER_CODE')}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center justify-center gap-1 mx-auto py-1"
                >
                  <KeyRound size={13} />
                  <span>Sudah punya kode voucher? Masukkan di sini →</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STEP 2: DETAIL TIKET TERPILIH & KONFIRMASI PEMESANAN
              ═══════════════════════════════════════════════════════════ */}
          {step === 'VOUCHER_DETAIL' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setStep('VOUCHERS')}
                  className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  <ArrowLeft size={14} />
                  <span>Ganti Voucher</span>
                </button>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ✓ TIKET TERPILIH
                </span>
              </div>

              {/* Pricing Box */}
              <div className="boutique-price-box">
                <div className="boutique-price-left">
                  <span className="boutique-price-label">{activeTierConfig.name}</span>
                  <div className="boutique-price-digits">
                    {activeTierConfig.hasDiscount && (
                      <span className="text-xs line-through text-stone-400 mr-2 font-medium">
                        Rp {activeTierConfig.basePrice.toLocaleString('id-ID')}
                      </span>
                    )}
                    <span className="boutique-price-curr">Rp</span>
                    <span className="boutique-price-amount">
                      {activeTierConfig.finalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className="boutique-price-right">
                  <span className="boutique-price-badge bg-rose-50 text-rose-700 border-rose-200">
                    {activeTierConfig.discountBadge || activeTierConfig.durationLabel}
                  </span>
                  <span className="boutique-price-note">
                    {selectedTier === 'lifetime'
                      ? '🌸 Termasuk Fitur Kebun Bunga'
                      : selectedTier === 'weekly'
                      ? 'Akses penuh selama 7 hari'
                      : 'Akses penuh 24 jam'}
                  </span>
                </div>
              </div>

              {/* Perks / Manfaat Penjualan */}
              <div className="boutique-perks-card">
                <div className="boutique-perks-header">
                  <span className="boutique-perks-title">
                    {DEFAULT_PERKS[selectedTier].title}
                  </span>
                  {DEFAULT_PERKS[selectedTier].badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {DEFAULT_PERKS[selectedTier].badge}
                    </span>
                  )}
                </div>
                <ul className="boutique-perks-list">
                  {(activeTierConfig.features && activeTierConfig.features.length > 0
                    ? activeTierConfig.features
                    : DEFAULT_PERKS[selectedTier].features
                  ).map((feature: string, idx: number) => {
                    const isGardenFeature = feature.toLowerCase().includes('kebun') || feature.toLowerCase().includes('streak');
                    return (
                      <li key={idx} className={`boutique-perk-item ${isGardenFeature ? 'highlight' : ''}`}>
                        <CheckCircle2 size={13} className="boutique-perk-icon" />
                        <span>{feature}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Action: WhatsApp Direct Order */}
              <div className="boutique-action-section">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boutique-wa-button"
                  id="btn-claim-voucher-wa"
                >
                  <MessageCircle size={18} className="shrink-0" />
                  <div className="boutique-wa-text-group">
                    <span className="boutique-wa-main-text">Klaim Voucher via WhatsApp</span>
                    <span className="boutique-wa-sub-text">Pesan ke Admin: {displayWaNumber}</span>
                  </div>
                  <ArrowRight size={16} className="ml-auto opacity-75 shrink-0" />
                </a>
                <p className="boutique-subnote">
                  Admin akan mengirimkan kode voucher resmi setelah konfirmasi via QRIS / Bank Transfer.
                </p>
              </div>

              {/* Opsi Sudah Punya Kode */}
              <div className="text-center pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setStep('ENTER_CODE')}
                  className="text-xs font-bold text-stone-700 hover:text-stone-900 underline"
                >
                  Saya sudah bayar / punya kode? Aktivasi sekarang →
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STEP 3: MASUKKAN KODE VOUCHER (VERIFIKASI)
              ═══════════════════════════════════════════════════════════ */}
          {step === 'ENTER_CODE' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setStep('VOUCHERS')}
                  className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali ke Voucher</span>
                </button>
                <span className="text-[11px] font-bold text-stone-500">Langkah 1 dari 2</span>
              </div>

              <div className="boutique-modal-header" style={{ marginBottom: '14px' }}>
                <h3 className="boutique-modal-title">Masukkan Kode Voucher VIP</h3>
                <p className="boutique-modal-desc">
                  Ketik kode akses resmi yang diberikan Admin Laysa Florist:
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="boutique-code-form">
                <div className="boutique-form-field">
                  <label className="boutique-input-label">Kode Voucher</label>
                  <div className="boutique-input-shell">
                    <KeyRound size={15} className="boutique-input-icon" />
                    <input
                      type="text"
                      className="boutique-input uppercase-text font-mono"
                      placeholder="Contoh: VIP-ABC123 atau DAY-XYZ"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      disabled={isLoading || isPremiumUnlocked}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="boutique-submit-btn-full"
                  disabled={isLoading || isPremiumUnlocked || !code.trim()}
                  id="btn-verify-voucher-code"
                >
                  {isLoading ? <span>Memeriksa Kode...</span> : <span>Verifikasi Kode &amp; Lanjutkan →</span>}
                </button>

                {errorMsg && (
                  <div className="boutique-alert boutique-alert-error">
                    <span>{errorMsg}</span>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STEP 4: MASUKKAN NAMA PEMILIK / PENDAFTARAN PERANGKAT
              ═══════════════════════════════════════════════════════════ */}
          {step === 'ENTER_NAME' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setStep('ENTER_CODE')}
                  className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  <ArrowLeft size={14} />
                  <span>Ganti Kode</span>
                </button>
                <span className="text-[11px] font-bold text-stone-500">Langkah 2 dari 2</span>
              </div>

              {/* Badge Kode yang Terverifikasi */}
              <div className="boutique-verified-chip mb-3">
                <div className="flex items-center gap-1.5 text-xs text-stone-700 font-medium">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Kode: <strong className="text-stone-900 tracking-wider font-mono">{verifiedCode}</strong></span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold ml-1">
                    {verifiedTier === 'daily' ? '⏱️ Harian' : verifiedTier === 'weekly' ? '📅 Mingguan' : '👑 Selamanya'}
                  </span>
                </div>
              </div>

              {/* Info Kepemilikan & Slot Perangkat */}
              {codeInfo?.isOwner ? (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#92400e', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} />
                    <span>Anda adalah Pemilik Utama kode ini</span>
                  </div>
                  <div style={{ marginTop: '2px', opacity: 0.9 }}>
                    Nama Anda akan didaftarkan sebagai pemilik resmi. Kode ini bisa digunakan hingga {codeInfo.maxDevices} perangkat.
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f5f5f4', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#44403c', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 600 }}>
                    Bergabung ke kode milik <strong>{codeInfo?.ownerName || 'Pemilik'}</strong>
                  </div>
                  <div style={{ marginTop: '2px', color: '#78716c' }}>
                    Perangkat {codeInfo?.slotNumber} dari {codeInfo?.maxDevices}. Masukkan nama pengguna perangkat ini.
                  </div>
                </div>
              )}

              <form onSubmit={handleClaimName} className="boutique-code-form">
                <div className="boutique-form-field">
                  <label className="boutique-input-label">Nama Anda / Pemilik VIP</label>
                  <div className="boutique-input-shell">
                    <User size={15} className="boutique-input-icon" />
                    <input
                      type="text"
                      className="boutique-input"
                      placeholder="Ketik nama kamu di sini..."
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      disabled={isLoading || isPremiumUnlocked}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="boutique-submit-btn-full"
                  disabled={isLoading || isPremiumUnlocked || !userName.trim()}
                  id="btn-claim-vip-access"
                >
                  {isLoading ? <span>Mengaktifkan Akses...</span> : <span>Aktifkan Akses Sekarang ✨</span>}
                </button>

                {errorMsg && (
                  <div className="boutique-alert boutique-alert-error">
                    <span>{errorMsg}</span>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STEP 5: POPUP TERIMA KASIH & KARTU VIP MEMBER (SELESAI)
              ═══════════════════════════════════════════════════════════ */}
          {step === 'THANK_YOU' && (
            <div className="thank-you-container">
              {/* Celebration Burst Badge */}
              <div className="thank-you-badge">
                <CheckCircle2 size={32} />
              </div>

              <h3 className="thank-you-title">
                Terima Kasih! 🎉
              </h3>
              <p className="thank-you-desc">
                Selamat! Akses VIP Anda telah resmi aktif. Selamat berkreasi merangkai buket bunga terindah!
              </p>

              {/* Kartu Digital VIP Mewah */}
              <div className="vip-digital-pass">
                <div className="vip-pass-top">
                  <span className="vip-pass-brand flex items-center gap-1.5">
                    <Crown size={14} className="text-amber-400" />
                    <span>LAYSA ATELIER VIP PASS</span>
                  </span>
                  <span className="vip-pass-badge">
                    ● AKTIF
                  </span>
                </div>

                <div className="vip-pass-name">
                  {userName || 'Member VIP'}
                </div>
                <div className="vip-pass-tier font-mono">
                  Kode: {verifiedCode} • {verifiedTier === 'daily' ? '⏱️ Paket Harian (24 Jam)' : verifiedTier === 'weekly' ? '📅 Paket Mingguan (7 Hari)' : '👑 Paket Selamanya (VIP Sultan)'}
                </div>

                <div className="vip-pass-meta-row">
                  <div className="vip-pass-meta-item">
                    <span>Masa Aktif: </span>
                    <strong>{verifiedTier === 'lifetime' ? 'Selamanya (Permanen)' : verifiedTier === 'weekly' ? '7 Hari Penuh' : '24 Jam Penuh'}</strong>
                  </div>
                  <div className="vip-pass-meta-item">
                    <span>Slot: </span>
                    <strong>1 / {codeInfo?.maxDevices || 5} Perangkat</strong>
                  </div>
                </div>
              </div>

              {/* Callout Khusus Kebun Bunga jika Lifetime */}
              {(verifiedTier === 'lifetime' || codeInfo?.hasGardenAccess) && (
                <div
                  style={{
                    width: '100%',
                    background: '#fff7ed',
                    border: '1.5px solid #fed7aa',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    marginBottom: '16px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '12.5px', color: '#9a3412' }}>
                    <span>🌱 Fitur Kebun Bunga Streak Harian 🔥 Terbuka!</span>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#c2410c', lineHeight: 1.4 }}>
                    Anda kini dapat menanam bunga harian, memelihara api streak harian, dan mengundang pasangan via kode kebun!
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="boutique-submit-btn-full"
                  style={{ background: '#0f766e', borderColor: '#0f766e', padding: '12px' }}
                >
                  <Sparkles size={16} />
                  <span>Mulai Merangkai Buket Sekarang</span>
                </button>

                {(verifiedTier === 'lifetime' || codeInfo?.hasGardenAccess) && onOpenGarden && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenGarden();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      borderRadius: '12px',
                      background: '#fff7ed',
                      border: '1.5px solid #fdba74',
                      color: '#c2410c',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>🌱 Buka Kebun Bunga Streak 🔥</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Trust Footer */}
          {step !== 'THANK_YOU' && (
            <div className="boutique-trust-footer">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Garansi Aktivasi Resmi Studio Buket Laysa</span>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
