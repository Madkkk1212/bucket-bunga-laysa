'use client';

import { useState, useEffect } from 'react';
import { Lock, CheckCircle2, MessageCircle, X, ArrowRight, ShieldCheck, KeyRound, User } from 'lucide-react';
import ModalPortal from '../ui/ModalPortal';
import { useDesign, getOrCreateDeviceId } from '@/context/DesignContext';

interface PremiumUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName?: string;
  itemType?: 'bucket' | 'bunga';
}

export default function PremiumUnlockModal({
  isOpen,
  onClose,
  itemName,
  itemType = 'bucket',
}: PremiumUnlockModalProps) {
  const { unlockPremium, isPremiumUnlocked, premiumUserName } = useDesign();
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');
  const [userName, setUserName] = useState(premiumUserName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [codeInfo, setCodeInfo] = useState<{
    isOwner: boolean;
    ownerName?: string;
    slotNumber: number;
    maxDevices: number;
  } | null>(null);

  const [pricing, setPricing] = useState({
    basePrice: 10000,
    finalPrice: 10000,
    hasDiscount: false,
    discountBadge: '',
    promoLabel: '',
  });

  const displayWaNumber = '0895-1461-8737';
  const cleanWaNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6289514618737').replace(/[^0-9]/g, '');

  // Fetch harga dan status promo terbaru dari server
  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings/pricing')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.pricing) {
            setPricing(data.pricing);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const formattedPrice = `Rp ${pricing.finalPrice.toLocaleString('id-ID')}`;
  const waMessage = encodeURIComponent(
    `Halo Admin Laysa Florist, saya ingin memesan Kode Akses (${formattedPrice}) untuk membuka semua bunga & bucket di Studio Buket. Boleh minta info rekening/QRIS untuk pembayarannya? Terima kasih.`
  );
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${waMessage}`;

  // Langkah 1: Verifikasi Kode Akses
  const handleVerifyCodeStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Silakan masukkan kode akses terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

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
        setCodeInfo({
          isOwner: Boolean(data.isOwner),
          ownerName: data.ownerName || data.registeredName || '',
          slotNumber: data.slotNumber ?? (data.deviceCount + 1),
          maxDevices: data.maxDevices ?? 5,
        });
        if (data.isOwner) {
          setUserName(data.registeredName || premiumUserName || '');
        } else {
          setUserName(premiumUserName || '');
        }
        setStep(2);
        setErrorMsg('');
      } else {
        setErrorMsg(data.message || 'Kode akses tidak valid atau tidak ditemukan.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('Gagal terhubung ke server verifikasi. Periksa koneksi internet Anda.');
    }
  };

  // Langkah 2: Masukkan Nama & Aktifkan Akses
  const handleClaimNameStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg('Silakan masukkan nama Anda untuk mengaktifkan kode ini.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const targetCode = verifiedCode || code.trim();
    const res = await unlockPremium(targetCode, userName.trim());
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || `Akses VIP aktif untuk ${userName.trim()}!`);
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleBackToCode = () => {
    setStep(1);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="boutique-modal-backdrop" onClick={onClose}>
        <div
          className="boutique-modal-sheet"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="boutique-modal-title"
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

          {/* Clean Boutique Header */}
          <div className="boutique-modal-header">
            <span className="boutique-eyebrow">Studio Buket Laysa</span>
            <h3 id="boutique-modal-title" className="boutique-modal-title">
              Buka Akses Lengkap
            </h3>
            <p className="boutique-modal-desc">
              {itemName ? (
                <>
                  Pilihan <span className="font-semibold text-stone-900">"{itemName}"</span> termasuk dalam koleksi khusus. Buka sekali untuk menggunakan seluruh bunga dan jenis bucket tanpa batasan.
                </>
              ) : (
                'Gunakan seluruh varian bunga langka dan model pembungkus bucket premium tanpa perlu daftar akun.'
              )}
            </p>
          </div>

          {/* Pricing Box - Clean & Authentic */}
          <div className="boutique-price-box">
            <div className="boutique-price-left">
              <span className="boutique-price-label">
                {pricing.hasDiscount ? (pricing.promoLabel || 'Promo Spesial') : 'Biaya Akses Penuh'}
              </span>
              <div className="boutique-price-digits">
                {pricing.hasDiscount && (
                  <span className="text-xs line-through text-stone-400 mr-2 font-medium">
                    Rp {pricing.basePrice.toLocaleString('id-ID')}
                  </span>
                )}
                <span className="boutique-price-curr">Rp</span>
                <span className="boutique-price-amount">
                  {pricing.finalPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <div className="boutique-price-right">
              {pricing.hasDiscount ? (
                <span className="boutique-price-badge bg-rose-50 text-rose-700 border-rose-200">
                  {pricing.discountBadge || 'Diskon Khusus'}
                </span>
              ) : (
                <span className="boutique-price-badge">1x Bayar • Selamanya</span>
              )}
              <span className="boutique-price-note">Bebas rangkai sepuasnya</span>
            </div>
          </div>

          {/* WhatsApp Direct Order - Primary Action */}
          <div className="boutique-action-section">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="boutique-wa-button"
              id="btn-buy-code-wa"
            >
              <MessageCircle size={18} className="shrink-0" />
              <div className="boutique-wa-text-group">
                <span className="boutique-wa-main-text">Beli Kode via WhatsApp</span>
                <span className="boutique-wa-sub-text">Chat: {displayWaNumber}</span>
              </div>
              <ArrowRight size={16} className="ml-auto opacity-75 shrink-0" />
            </a>
            <p className="boutique-subnote">
              Admin akan mengirimkan kode langsung setelah pembayaran via QRIS / Bank Transfer.
            </p>
          </div>

          <div className="boutique-or-divider">
            <span>
              {step === 1 ? 'langkah 1: masukkan kode akses' : 'langkah 2: masukkan nama kamu'}
            </span>
          </div>

          {step === 1 ? (
            /* Langkah 1: Input Kode Akses */
            <form onSubmit={handleVerifyCodeStep} className="boutique-code-form">
              <div className="boutique-form-field">
                <label className="boutique-input-label">1. Masukkan Kode Akses VIP</label>
                <div className="boutique-input-shell">
                  <KeyRound size={15} className="boutique-input-icon" />
                  <input
                    type="text"
                    className="boutique-input uppercase-text"
                    placeholder="Contoh: TISUWKWK"
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
                id="btn-verify-code-step1"
              >
                {isLoading ? (
                  <span>Memeriksa Kode...</span>
                ) : (
                  <span>Periksa Kode & Lanjutkan →</span>
                )}
              </button>

              {errorMsg && (
                <div className="boutique-alert boutique-alert-error">
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>
          ) : (
            /* Langkah 2: Input Nama Pemilik Kode */
            <form onSubmit={handleClaimNameStep} className="boutique-code-form">
              {/* Badge Kode yang Terverifikasi */}
              <div className="boutique-verified-chip">
                <div className="flex items-center gap-1.5 text-xs text-stone-700 font-medium">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Kode: <strong className="text-stone-900 tracking-wider font-mono">{verifiedCode}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleBackToCode}
                  className="text-xs text-stone-400 hover:text-stone-700 underline transition-colors"
                >
                  Ganti
                </button>
              </div>

              {/* Info Kepemilikan & Slot Perangkat */}
              {codeInfo?.isOwner ? (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#92400e', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👑</span>
                    <span>Pendaftar Pertama (Pemilik Utama Kode)</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#b45309', marginTop: '3px' }}>
                    Nama ini akan tercatat sebagai Pemilik Utama kode akses VIP Studio Buket.
                  </div>
                </div>
              ) : (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#1e40af', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📱</span>
                    <span>Perangkat Tambahan (Slot {codeInfo?.slotNumber || 2} dari {codeInfo?.maxDevices || 5})</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '3px' }}>
                    Kode ini milik: <strong>{codeInfo?.ownerName || 'Pemilik Utama'}</strong>. Masukkan nama perangkat ini untuk bergabung.
                  </div>
                </div>
              )}

              <div className="boutique-form-field">
                <label className="boutique-input-label">
                  {codeInfo?.isOwner
                    ? '2. Nama Pemilik Utama (Tercatat resmi di sistem)'
                    : '2. Nama Kamu / Nama Perangkat (cth: Laptop Kasir, HP 2)'}
                </label>
                <div className="boutique-input-shell">
                  <User size={15} className="boutique-input-icon" />
                  <input
                    type="text"
                    className="boutique-input"
                    placeholder="Ketik namamu (cth: Dinda)"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    disabled={isLoading || isPremiumUnlocked}
                    maxLength={40}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="boutique-submit-btn-full"
                disabled={isLoading || isPremiumUnlocked || !userName.trim()}
                id="btn-activate-vip-step2"
              >
                {isLoading ? (
                  <span>Mengaktifkan Akses VIP...</span>
                ) : isPremiumUnlocked ? (
                  <span>Akses Aktif ✓</span>
                ) : (
                  <span>Aktifkan Akses VIP Sekarang ✨</span>
                )}
              </button>

              {errorMsg && (
                <div className="boutique-alert boutique-alert-error">
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="boutique-alert boutique-alert-success">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
            </form>
          )}

          {/* Security / trust badge */}
          <div className="boutique-trust-footer">
            <ShieldCheck size={13} className="text-stone-400" />
            <span>Tersimpan aman di perangkat ini tanpa login</span>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
