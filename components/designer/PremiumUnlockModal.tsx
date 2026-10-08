'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, MessageCircle, X, ArrowRight, ArrowLeft, ShieldCheck, 
  KeyRound, User, Crown, Clock, Calendar, Sparkles, Ticket
} from 'lucide-react';
import ModalPortal from '../ui/ModalPortal';
import { useDesign, getOrCreateDeviceId } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';

interface PremiumUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName?: string;
  itemType?: 'bucket' | 'bunga';
  defaultTier?: string;
  onOpenGarden?: () => void;
}

type PricingTierKey = 'daily' | 'weekly' | 'lifetime' | string;
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
    title: '👑 Keuntungan Eksklusif Paket Selamanya (VIP):',
    badge: 'Paling Lengkap & Permanen',
    features: [
      'Akses VIP permanen SELAMANYA (sekali bayar tanpa langganan)',
      '🌸 EKSKLUSIF: Buka Fitur Kebun Bunga Harian Streak 🔥 (Solo / Pasangan)',
      '🔒 Autosave Cloud Terenkripsi AES-256 (Draft aman antar perangkat)',
      '🖼️ Custom Background Kanvas (Gunakan foto studio pribadi sesuai rasio kanvas)',
      '👑 Ekspor Kualitas Tertinggi Ultra HD 4K (3.5x Lossless Master)',
      'Kartu Ucapan Kaligrafi Eksklusif & Ornamen Pita Mewah',
      'Bisa terhubung hingga 5 perangkat bersama keluarga / pasangan',
      'Akses gratis ke seluruh varian bunga & buket baru di masa depan',
    ],
  },
};

const DEFAULT_PERKS_EN: Record<PricingTierKey, { title: string; badge?: string; features: string[] }> = {
  daily: {
    title: '⏱️ Daily Package Benefits (24 Hours):',
    badge: 'Affordable & Practical',
    features: [
      'Unlock all 100+ flowers & bouquet wrappers',
      '24 hours active period: design & download unlimited',
      'Connect up to 5 devices simultaneously',
      'Download sharp HD resolution bouquets',
      'Instant access without account registration hassle',
    ],
  },
  weekly: {
    title: '📅 Weekly Package Benefits (7 Days):',
    badge: 'Best Value (52% OFF)',
    features: [
      'Unlock all 100+ flowers & bouquet wrappers',
      'Full 7 days active period (Ideal for gifts & celebrations)',
      '🔒 AES-256 Encrypted Cloud Autosave & Multi-device sync',
      'Connect up to 5 devices simultaneously',
      'Much more economical than repeating daily passes',
    ],
  },
  lifetime: {
    title: '👑 Exclusive Lifetime VIP Privileges:',
    badge: 'Ultimate & Permanent',
    features: [
      'Permanent VIP access FOREVER (one-time payment, no subscriptions)',
      '🌸 EXCLUSIVE: Unlock Daily Flower Garden Streak 🔥 (Solo / Partner)',
      '🔒 AES-256 Encrypted Cloud Vault (Seamless multi-device sync)',
      '🖼️ Custom Canvas Background (Use personal studio backdrop with aspect ratio tool)',
      '👑 Ultra HD 4K Highest Quality Export (3.5x Lossless Master)',
      'Exclusive Calligraphy Greeting Cards & Luxury Ribbon Ornaments',
      'Connect up to 5 devices together with family / partner',
      'Free access to all future new flower & bouquet releases',
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
  const router = useRouter();
  const { unlockPremium, isPremiumUnlocked, premiumUserName } = useDesign();
  const { isEn } = useLanguage();
  const [step, setStep] = useState<ModalStep>('VOUCHERS');
  const [code, setCode] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');
  const [verifiedTier, setVerifiedTier] = useState<PricingTierKey>('lifetime');
  const [userName, setUserName] = useState(premiumUserName || '');
  const [gardenNameInput, setGardenNameInput] = useState('');
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
        name: 'Paket Selamanya (VIP Lifetime)',
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

  const currentPerks = isEn ? DEFAULT_PERKS_EN : DEFAULT_PERKS;

  const activeTierConfig = pricingData?.tiers?.[selectedTier] || {
    name: selectedTier === 'daily' ? 'Paket Harian (24 Jam)' : selectedTier === 'weekly' ? 'Paket Mingguan (7 Hari)' : 'Paket Selamanya (VIP)',
    basePrice: 17000,
    finalPrice: 17000,
    hasDiscount: false,
    durationLabel: 'Selamanya',
    features: [],
  };

  const currentTierPerks = useMemo(() => {
    if (currentPerks[selectedTier as any]) {
      return currentPerks[selectedTier as any];
    }
    const t = pricingData?.tiers?.[selectedTier];
    if (t) {
      return {
        title: `✨ ${isEn ? 'Benefits for' : 'Manfaat'} ${t.name || selectedTier}:`,
        badge: t.discountBadge || t.badge || 'Voucher Spesial',
        features: Array.isArray(t.features) && t.features.length > 0 ? t.features : [
          'Buka seluruh 100+ koleksi bunga & pembungkus buket',
          `Masa aktif studio ${t.durationLabel || `${t.durationDays} Hari`}`,
          'Bisa terhubung hingga 5 perangkat bersamaan',
          'Unduh hasil buket jernih beresolusi HD',
        ],
      };
    }
    return currentPerks.lifetime;
  }, [currentPerks, selectedTier, pricingData, isEn]);

  const formattedPrice = `Rp ${(activeTierConfig.finalPrice ?? activeTierConfig.basePrice ?? 17000).toLocaleString('id-ID')}`;

  // WhatsApp order template with bullet benefits
  let waCustomText = '';
  if (selectedTier === 'daily') {
    waCustomText = isEn
      ? `Hello Admin Laysa Florist, I would like to order a 24-Hour Daily VIP Access Code (${formattedPrice}).\n\nBenefits:\n• Access all flowers & wrappers (24 Hours)\n• Up to 5 devices simultaneously\n• Crystal clear HD format\n\nMay I have the payment details / QRIS? Thank you!`
      : `Halo Admin Laysa Florist, saya ingin pesan Kode Akses VIP Paket Harian 24 Jam (${formattedPrice}).\n\nBenefit:\n• Bebas rangkai semua bunga & buket (24 Jam)\n• Hingga 5 perangkat bersamaan\n• Format HD jernih\n\nBoleh minta nomor rekening/QRIS untuk pembayarannya? Terima kasih!`;
  } else if (selectedTier === 'weekly') {
    waCustomText = isEn
      ? `Hello Admin Laysa Florist, I would like to order a 7-Day Weekly VIP Access Code (${formattedPrice}).\n\nBenefits:\n• Freely arrange & edit all flowers & wrappers (7 Days)\n• Ideal for celebrations & gifts\n• Up to 5 devices simultaneously\n\nMay I have the payment details / QRIS? Thank you!`
      : `Halo Admin Laysa Florist, saya ingin pesan Kode Akses VIP Paket Mingguan 7 Hari (${formattedPrice}).\n\nBenefit:\n• Bebas rangkai & edit semua bunga & buket (7 Hari)\n• Sangat cocok untuk kado wisuda & ultah\n• Hingga 5 perangkat bersamaan\n\nBoleh minta nomor rekening/QRIS untuk pembayarannya? Terima kasih!`;
  } else if (selectedTier === 'lifetime') {
    waCustomText = isEn
      ? `Hello Admin Laysa Florist, I would like to order a Lifetime VIP Access Code (${formattedPrice}).\n\nExclusive Benefits:\n• Permanent VIP Access Forever (One-time payment)\n• EXCLUSIVE: Unlock Daily Flower Garden Streak 🔥\n• Ultra HD 4K & Transparent WA Stickers\n• Up to 5 devices simultaneously\n\nMay I have the payment details / QRIS? Thank you!`
      : `Halo Admin Laysa Florist, saya ingin pesan Kode Akses VIP Paket Selamanya (${formattedPrice}).\n\nBenefit Eksklusif:\n• Akses VIP Selamanya (Permanen Sekali Bayar)\n• EKSKLUSIF: Buka Fitur Kebun Bunga Streak 🔥\n• Ekspor Ultra HD 4K & Stiker WA Transparan\n• Hingga 5 perangkat bersamaan\n\nBoleh minta nomor rekening/QRIS untuk pembayarannya? Terima kasih!`;
  } else {
    const customName = activeTierConfig.name || `Paket ${selectedTier}`;
    const customDuration = activeTierConfig.durationLabel || (activeTierConfig.durationDays ? `${activeTierConfig.durationDays} Hari` : 'Spesial');
    waCustomText = isEn
      ? `Hello Admin Laysa Florist, I would like to order a VIP Access Code for ${customName} (${formattedPrice}).\n\nBenefits:\n• Access all flowers & wrappers (${customDuration})\n• Up to 5 devices simultaneously\n• Crystal clear HD format\n\nMay I have the payment details / QRIS? Thank you!`
      : `Halo Admin Laysa Florist, saya ingin pesan Kode Akses VIP ${customName} (${formattedPrice}).\n\nBenefit:\n• Bebas rangkai semua bunga & buket (${customDuration})\n• Hingga 5 perangkat bersamaan\n• Format HD jernih\n\nBoleh minta nomor rekening/QRIS untuk pembayarannya? Terima kasih!`;
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
      setErrorMsg(isEn ? 'Please enter your access code first.' : 'Silakan masukkan kode akses terlebih dahulu.');
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
        setErrorMsg(data.message || (isEn ? 'Access code invalid or not found.' : 'Kode akses tidak valid atau tidak ditemukan.'));
      }
    } catch {
      setIsLoading(false);
      setErrorMsg(isEn ? 'Failed to connect to verification server. Please check your internet connection.' : 'Gagal terhubung ke server verifikasi. Periksa koneksi internet Anda.');
    }
  };

  // Input Nama & Aktivasi Selesai -> Lanjut ke Thank You Popup
  const handleClaimName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg(isEn ? 'Please enter your name to activate this code.' : 'Silakan masukkan nama Anda untuk mengaktifkan kode ini.');
      return;
    }

    const isLifetime = verifiedTier === 'lifetime' || Boolean(codeInfo?.hasGardenAccess);
    if (isLifetime && !gardenNameInput.trim()) {
      setErrorMsg(isEn ? 'As a Lifetime VIP owner, your flower garden must be named first 🌸' : 'Sebagai pemilik Paket Selamanya, kebun bunga kamu wajib dinamai terlebih dahulu 🌸');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const targetCode = verifiedCode || code.trim();
    const res = await unlockPremium(targetCode, userName.trim());
    setIsLoading(false);

    if (res.success) {
      if (isLifetime && gardenNameInput.trim()) {
        try {
          const trimmedGarden = gardenNameInput.trim();
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
      }
      setSuccessMsg(res.message || (isEn ? `VIP Access active for ${userName.trim()}!` : `Akses VIP aktif untuk ${userName.trim()}!`));
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
            aria-label={isEn ? 'Close' : 'Tutup'}
          >
            <X size={18} />
          </button>

          {/* ═══════════════════════════════════════════════════════════
              STEP 1: PILIH TIKET VOUCHER (SEPERTI GAMBAR REFERENSI)
              ═══════════════════════════════════════════════════════════ */}
          {step === 'VOUCHERS' && (
            <div>
              <div className="boutique-modal-header">
                <span className="boutique-eyebrow">
                  {isEn ? 'Laysa Bouquet Studio' : 'Studio Buket Laysa'}
                </span>
                <h3 className="boutique-modal-title">
                  {isEn ? 'Choose VIP Voucher Ticket' : 'Pilih Tiket Voucher VIP'}
                </h3>
                <p className="boutique-modal-desc">
                  {itemName ? (
                    isEn ? (
                      <>
                        Collection <strong className="text-stone-900">"{itemName}"</strong> is ready to use. Choose your voucher below:
                      </>
                    ) : (
                      <>
                        Koleksi <strong className="text-stone-900">"{itemName}"</strong> siap digunakan. Pilih voucher hemat Anda di bawah ini:
                      </>
                    )
                  ) : (
                    isEn
                      ? 'Select one of the discount vouchers below to unlock all flowers, bouquets & exclusive features:'
                      : 'Pilih salah satu kupon diskon di bawah ini untuk membuka seluruh bunga, buket & fitur eksklusif:'
                  )}
                </p>
              </div>

              {/* Daftar Tiket Voucher Bergaya Kupon Fisik */}
              <div className="voucher-tickets-list">
                {Object.keys(pricingData.tiers || {})
                  .filter((key) => {
                    const t = pricingData.tiers[key];
                    return t && t.isActive !== false && t.isDisplayed !== false;
                  })
                  .map((key) => {
                    const t = pricingData.tiers[key];
                    const isLifetime = key === 'lifetime' || Boolean(t.gardenAccess);
                    const hasDisc = t.hasDiscount ?? (t.promoPrice < t.basePrice);
                    const finalPrice = t.finalPrice ?? (hasDisc ? t.promoPrice : t.basePrice);
                    const pct = t.discountPercentage ?? (hasDisc && t.basePrice > 0 ? Math.round(((t.basePrice - finalPrice) / t.basePrice) * 100) : 0);
                    const badge = t.discountBadge || t.badge || (pct > 0 ? (isEn ? `Save ${pct}%` : `Hemat ${pct}%`) : '');
                    
                    let validityText = t.durationLabel;
                    if (!validityText) {
                      validityText = t.durationDays === 0
                        ? (isEn ? 'Forever' : 'Selamanya')
                        : t.durationDays === 1
                        ? (isEn ? 'Active 24 Hours' : 'Aktif 24 Jam')
                        : (isEn ? `Active ${t.durationDays} Days` : `Aktif ${t.durationDays} Hari`);
                    }

                    return (
                      <div
                        key={key}
                        className={`voucher-ticket-item ${isLifetime ? 'lifetime-gold' : ''}`}
                        onClick={() => handleSelectVoucher(key)}
                        title={isEn ? `Click to select ${t.name || key}` : `Klik untuk memilih ${t.name || key}`}
                      >
                        <div className="voucher-ticket-left">
                          {badge && (
                            <div className="voucher-ticket-badge-row">
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                isLifetime
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : key === 'weekly'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {badge}
                              </span>
                            </div>
                          )}
                          {hasDisc && pct > 0 ? (
                            <div className={`voucher-ticket-discount ${isLifetime ? 'gold' : ''}`}>
                              <span>{pct}%</span>
                              <span className="voucher-ticket-discount-sub">OFF</span>
                            </div>
                          ) : (
                            <div className={`voucher-ticket-discount ${isLifetime ? 'gold' : ''}`}>
                              <span className="text-xl">VIP</span>
                              <span className="voucher-ticket-discount-sub">PASS</span>
                            </div>
                          )}
                          <div className="voucher-ticket-title" style={isLifetime ? { color: '#92400e' } : {}}>
                            {t.name || key}
                          </div>
                          <div className="voucher-ticket-sub">
                            <span className="voucher-ticket-price" style={isLifetime ? { color: '#b45309' } : {}}>
                              Rp {finalPrice.toLocaleString('id-ID')}
                            </span>
                            {hasDisc && (
                              <>
                                <span>•</span>
                                <span className="voucher-ticket-strike">Rp {t.basePrice.toLocaleString('id-ID')}</span>
                              </>
                            )}
                          </div>
                          {t.gardenAccess && (
                            <div className="text-[11px] font-bold text-amber-700 mt-1 flex items-center gap-1">
                              <span>{isEn ? '🌸 EXCLUSIVE: Flower Garden Streak 🔥' : '🌸 EKSKLUSIF: Kebun Bunga Streak 🔥'}</span>
                            </div>
                          )}
                        </div>

                        <div className="voucher-ticket-perforation" />

                        <div className="voucher-ticket-right">
                          <div
                            className={`voucher-ticket-brand-icon ${isLifetime ? 'gold' : ''}`}
                            style={{
                              background: isLifetime ? '#fef3c7' : key === 'weekly' ? '#eef2ff' : '#fffbeb',
                            }}
                          >
                            {isLifetime ? (
                              <Crown size={22} className="text-amber-700" />
                            ) : key === 'weekly' ? (
                              <Calendar size={20} className="text-indigo-600" />
                            ) : (
                              <Clock size={20} className="text-amber-600" />
                            )}
                          </div>
                          <div className="voucher-ticket-brand-name" style={isLifetime ? { color: '#92400e' } : {}}>
                            {isLifetime ? (isEn ? 'VIP Lifetime' : 'VIP Selamanya') : 'Laysa Atelier'}
                          </div>
                          <div className="voucher-ticket-validity" style={isLifetime ? { color: '#b45309', fontWeight: 700 } : {}}>
                            {validityText}
                          </div>
                          <div className="voucher-ticket-notch-right" />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Punya Kode Alternatif */}
              <div className="mt-4 pt-3 border-t border-stone-200 text-center">
                <button
                  type="button"
                  onClick={() => setStep('ENTER_CODE')}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center justify-center gap-1 mx-auto py-1"
                >
                  <KeyRound size={13} />
                  <span>{isEn ? 'Already have a voucher code? Enter here →' : 'Sudah punya kode voucher? Masukkan di sini →'}</span>
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
                  <span>{isEn ? 'Change Voucher' : 'Ganti Voucher'}</span>
                </button>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {isEn ? '✓ SELECTED TICKET' : '✓ TIKET TERPILIH'}
                </span>
              </div>

              {/* Pricing Box */}
              <div className="boutique-price-box">
                <div className="boutique-price-left">
                  <span className="boutique-price-label">
                    {isEn
                      ? (selectedTier === 'daily' ? 'Daily Package (24 Hours)' : selectedTier === 'weekly' ? 'Weekly Package (7 Days)' : 'Lifetime Package (VIP)')
                      : activeTierConfig.name}
                  </span>
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
                    {activeTierConfig.discountBadge || activeTierConfig.badge || (activeTierConfig.hasDiscount ? `${activeTierConfig.discountPercentage || 50}% OFF` : (isEn ? 'SPECIAL' : 'SPESIAL'))}
                  </span>
                  <span className="boutique-price-note">
                    {selectedTier === 'lifetime' || Boolean(activeTierConfig.gardenAccess)
                      ? (isEn ? '🌸 Flower Garden Feature Included' : '🌸 Termasuk Fitur Kebun Bunga')
                      : selectedTier === 'weekly'
                      ? (isEn ? 'Full access for 7 days' : 'Akses penuh selama 7 hari')
                      : selectedTier === 'daily'
                      ? (isEn ? 'Full access for 24 hours' : 'Akses penuh 24 jam')
                      : (isEn ? `Full access for ${activeTierConfig.durationLabel || `${activeTierConfig.durationDays} days`}` : `Akses penuh selama ${activeTierConfig.durationLabel || `${activeTierConfig.durationDays} hari`}`)}
                  </span>
                </div>
              </div>

              {/* Perks / Manfaat Penjualan */}
              <div className="boutique-perks-card">
                <div className="boutique-perks-header">
                  <span className="boutique-perks-title">
                    {currentTierPerks.title}
                  </span>
                  {currentTierPerks.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {currentTierPerks.badge}
                    </span>
                  )}
                </div>
                <ul className="boutique-perks-list">
                  {currentTierPerks.features.map((feature: string, idx: number) => {
                    const isGardenFeature = feature.toLowerCase().includes('kebun') || feature.toLowerCase().includes('garden') || feature.toLowerCase().includes('streak');
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
                    <span className="boutique-wa-main-text">
                      {isEn ? 'Claim Voucher via WhatsApp' : 'Klaim Voucher via WhatsApp'}
                    </span>
                    <span className="boutique-wa-sub-text">
                      {isEn ? `Order to Admin: ${displayWaNumber}` : `Pesan ke Admin: ${displayWaNumber}`}
                    </span>
                  </div>
                  <ArrowRight size={16} className="ml-auto opacity-75 shrink-0" />
                </a>
                <p className="boutique-subnote">
                  {isEn
                    ? 'Admin will send your official voucher code after confirmation via QRIS / Bank Transfer.'
                    : 'Admin akan mengirimkan kode voucher resmi setelah konfirmasi via QRIS / Bank Transfer.'}
                </p>
              </div>

              {/* Opsi Sudah Punya Kode */}
              <div className="text-center pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setStep('ENTER_CODE')}
                  className="text-xs font-bold text-stone-700 hover:text-stone-900 underline"
                >
                  {isEn ? 'Already paid / have a code? Activate now →' : 'Saya sudah bayar / punya kode? Aktivasi sekarang →'}
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
                  <span>{isEn ? 'Back to Vouchers' : 'Kembali ke Voucher'}</span>
                </button>
                <span className="text-[11px] font-bold text-stone-500">
                  {isEn ? 'Step 1 of 2' : 'Langkah 1 dari 2'}
                </span>
              </div>

              <div className="boutique-modal-header" style={{ marginBottom: '14px' }}>
                <h3 className="boutique-modal-title">
                  {isEn ? 'Enter VIP Voucher Code' : 'Masukkan Kode Voucher VIP'}
                </h3>
                <p className="boutique-modal-desc">
                  {isEn
                    ? 'Type the official access code provided by Laysa Florist Admin:'
                    : 'Ketik kode akses resmi yang diberikan Admin Laysa Florist:'}
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="boutique-code-form">
                <div className="boutique-form-field">
                  <label className="boutique-input-label">{isEn ? 'Voucher Code' : 'Kode Voucher'}</label>
                  <div className="boutique-input-shell">
                    <KeyRound size={15} className="boutique-input-icon" />
                    <input
                      type="text"
                      className="boutique-input uppercase-text font-mono"
                      placeholder={isEn ? 'Example: VIP-ABC123 or DAY-XYZ' : 'Contoh: VIP-ABC123 atau DAY-XYZ'}
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
                  {isLoading
                    ? <span>{isEn ? 'Checking Code...' : 'Memeriksa Kode...'}</span>
                    : <span>{isEn ? 'Verify Code & Continue →' : 'Verifikasi Kode & Lanjutkan →'}</span>}
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
                  <span>{isEn ? 'Change Code' : 'Ganti Kode'}</span>
                </button>
                <span className="text-[11px] font-bold text-stone-500">
                  {isEn ? 'Step 2 of 2' : 'Langkah 2 dari 2'}
                </span>
              </div>

              {/* Badge Kode yang Terverifikasi */}
              <div className="boutique-verified-chip mb-3">
                <div className="flex items-center gap-1.5 text-xs text-stone-700 font-medium">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>{isEn ? 'Code:' : 'Kode:'} <strong className="text-stone-900 tracking-wider font-mono">{verifiedCode}</strong></span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold ml-1">
                    {verifiedTier === 'daily'
                      ? (isEn ? '⏱️ Daily' : '⏱️ Harian')
                      : verifiedTier === 'weekly'
                      ? (isEn ? '📅 Weekly' : '📅 Mingguan')
                      : (isEn ? '👑 Lifetime' : '👑 Selamanya')}
                  </span>
                </div>
              </div>

              {/* Info Kepemilikan & Slot Perangkat */}
              {codeInfo?.isOwner ? (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#92400e', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} />
                    <span>{isEn ? 'You are the primary Owner of this code' : 'Anda adalah Pemilik Utama kode ini'}</span>
                  </div>
                  <div style={{ marginTop: '2px', opacity: 0.9 }}>
                    {isEn
                      ? `Your name will be registered as official owner. This code can be used on up to ${codeInfo.maxDevices} devices.`
                      : `Nama Anda akan didaftarkan sebagai pemilik resmi. Kode ini bisa digunakan hingga ${codeInfo.maxDevices} perangkat.`}
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f5f5f4', border: '1px solid #e7e5e4', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#44403c', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 600 }}>
                    {isEn ? `Joining code owned by ${codeInfo?.ownerName || 'Owner'}` : `Bergabung ke kode milik ${codeInfo?.ownerName || 'Pemilik'}`}
                  </div>
                  <div style={{ marginTop: '2px', color: '#78716c' }}>
                    {isEn
                      ? `Device ${codeInfo?.slotNumber} of ${codeInfo?.maxDevices}. Enter username for this device.`
                      : `Perangkat ${codeInfo?.slotNumber} dari ${codeInfo?.maxDevices}. Masukkan nama pengguna perangkat ini.`}
                  </div>
                </div>
              )}

              <form onSubmit={handleClaimName} className="boutique-code-form">
                <div className="boutique-form-field">
                  <label className="boutique-input-label">{isEn ? 'Your Name / VIP Owner' : 'Nama Anda / Pemilik VIP'}</label>
                  <div className="boutique-input-shell">
                    <User size={15} className="boutique-input-icon" />
                    <input
                      type="text"
                      className="boutique-input"
                      placeholder={isEn ? 'Type your name here...' : 'Ketik nama kamu di sini...'}
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

                {(verifiedTier === 'lifetime' || Boolean(codeInfo?.hasGardenAccess)) && (
                  <div className="boutique-form-field">
                    <label className="boutique-input-label flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>{isEn ? 'Your Flower Garden Name' : 'Nama Kebun Bunga Anda'}</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </span>
                      <span className="text-[10px] text-amber-700 font-extrabold px-1.5 py-0.5 rounded bg-amber-100">
                        {isEn ? 'LIFETIME VIP REQUIRED 👑' : 'KHUSUS PAKET SELAMANYA 👑'}
                      </span>
                    </label>
                    <div className="boutique-input-shell">
                      <span className="boutique-input-icon text-sm">🌸</span>
                      <input
                        type="text"
                        className="boutique-input"
                        placeholder={isEn ? 'e.g. Laysa Love Sanctuary, Our Rose Garden...' : 'Misal: Kebun Cinta Laysa, Taman Mawar Kita...'}
                        value={gardenNameInput}
                        onChange={(e) => {
                          setGardenNameInput(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        disabled={isLoading || isPremiumUnlocked}
                        required
                      />
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-stone-500 self-center">{isEn ? 'Options:' : 'Pilihan:'}</span>
                      {(isEn
                        ? ['Our Rose Garden 🌹', 'Laysa Love Sanctuary ✨', 'Happy Blossom 🌼']
                        : ['Taman Mawar Kita 🌹', 'Kebun Kasih Laysa ✨', 'Puspa Bahagia 🌼']
                      ).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setGardenNameInput(preset)}
                          className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-amber-100 text-stone-700 font-medium transition"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="boutique-submit-btn-full"
                  disabled={
                    isLoading || 
                    isPremiumUnlocked || 
                    !userName.trim() || 
                    ((verifiedTier === 'lifetime' || Boolean(codeInfo?.hasGardenAccess)) && !gardenNameInput.trim())
                  }
                  id="btn-claim-vip-access"
                >
                  {isLoading
                    ? <span>{isEn ? 'Activating Access...' : 'Mengaktifkan Akses...'}</span>
                    : <span>{isEn ? 'Activate Access Now ✨' : 'Aktifkan Akses Sekarang ✨'}</span>}
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
                {isEn ? 'Thank You! 🎉' : 'Terima Kasih! 🎉'}
              </h3>
              <p className="thank-you-desc">
                {isEn
                  ? 'Congratulations! Your VIP Access is now officially active. Enjoy creating the most stunning bouquets!'
                  : 'Selamat! Akses VIP Anda telah resmi aktif. Selamat berkreasi merangkai buket bunga terindah!'}
              </p>

              {/* Kartu Digital VIP Mewah */}
              <div className="vip-digital-pass">
                <div className="vip-pass-top">
                  <span className="vip-pass-brand flex items-center gap-1.5">
                    <Crown size={14} className="text-amber-400" />
                    <span>LAYSA ATELIER VIP PASS</span>
                  </span>
                  <span className="vip-pass-badge">
                    {isEn ? '● ACTIVE' : '● AKTIF'}
                  </span>
                </div>

                <div className="vip-pass-name">
                  {userName || (isEn ? 'VIP Member' : 'Member VIP')}
                </div>
                <div className="vip-pass-tier font-mono">
                  {isEn ? 'Code:' : 'Kode:'} {verifiedCode} • {
                    verifiedTier === 'daily'
                      ? (isEn ? '⏱️ Daily Pass (24 Hours)' : '⏱️ Paket Harian (24 Jam)')
                      : verifiedTier === 'weekly'
                      ? (isEn ? '📅 Weekly Pass (7 Days)' : '📅 Paket Mingguan (7 Hari)')
                      : (isEn ? '👑 Lifetime Pass (VIP)' : '👑 Paket Selamanya (VIP)')
                  }
                </div>

                <div className="vip-pass-meta-row">
                  <div className="vip-pass-meta-item">
                    <span>{isEn ? 'Validity: ' : 'Masa Aktif: '}</span>
                    <strong>
                      {verifiedTier === 'lifetime'
                        ? (isEn ? 'Forever (Permanent)' : 'Selamanya (Permanen)')
                        : verifiedTier === 'weekly'
                        ? (isEn ? 'Full 7 Days' : '7 Hari Penuh')
                        : (isEn ? 'Full 24 Hours' : '24 Jam Penuh')}
                    </strong>
                  </div>
                  <div className="vip-pass-meta-item">
                    <span>{isEn ? 'Slot: ' : 'Slot: '}</span>
                    <strong>{isEn ? `1 / ${codeInfo?.maxDevices || 5} Devices` : `1 / ${codeInfo?.maxDevices || 5} Perangkat`}</strong>
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
                    <span>{isEn ? '🌱 Daily Flower Garden Streak Feature 🔥 Unlocked!' : '🌱 Fitur Kebun Bunga Streak Harian 🔥 Terbuka!'}</span>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#c2410c', lineHeight: 1.4 }}>
                    {isEn
                      ? 'You can now plant daily flowers, nurture your daily fire streak, and invite your partner via garden code!'
                      : 'Anda kini dapat menanam bunga harian, memelihara api streak harian, dan mengundang pasangan via kode kebun!'}
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
                  <span>{isEn ? 'Start Arranging Bouquet Now' : 'Mulai Merangkai Buket Sekarang'}</span>
                </button>

                {(verifiedTier === 'lifetime' || codeInfo?.hasGardenAccess) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenGarden) {
                        onOpenGarden();
                      } else {
                        router.push('/minigames');
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '11px',
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
                    <span>
                      {isEn
                        ? `🌱 Open Flower Garden ${gardenNameInput ? `"${gardenNameInput}"` : ''} 🔥`
                        : `🌱 Buka Kebun Bunga ${gardenNameInput ? `"${gardenNameInput}"` : ''} 🔥`}
                    </span>
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
              <span>
                {isEn
                  ? 'Official Activation Guarantee by Laysa Bouquet Studio'
                  : 'Garansi Aktivasi Resmi Studio Buket Laysa'}
              </span>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
