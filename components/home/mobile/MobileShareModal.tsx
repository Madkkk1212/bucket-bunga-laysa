'use client';

import { useState, RefObject } from 'react';
import {
  X,
  MessageCircle,
  Share2,
  Copy,
  Check,
  Download,
  Gift,
  Music,
  Heart,
  Send,
  ExternalLink,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import { useDesign } from '@/context/DesignContext';
import { getBucketSize } from '@/data/buckets';
import { downloadDesign } from '@/utils/downloadUtils';
import './mobile-dashboard.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenStudio?: () => void;
  canvasRef?: RefObject<HTMLCanvasElement | null>;
}

const MUSIC_OPTIONS = [
  { id: 'romantic-piano', label: '🎹 Romantic Piano', desc: 'Melodi lembut & puitis' },
  { id: 'acoustic-love', label: '🎸 Acoustic Love', desc: 'Hangat & manis romantis' },
  { id: 'happy-birthday', label: '🎂 Ulang Tahun Ceria', desc: 'Perayaan & kebahagiaan' },
  { id: 'lofi-chill', label: '☕ Lofi Aesthetic', desc: 'Santai & menenangkan' },
];

export default function MobileShareModal({ isOpen, onClose, canvasRef }: Props) {
  const { design } = useDesign();

  const [activeTab, setActiveTab] = useState<'gift' | 'download' | 'whatsapp'>('gift');

  // Digital Gift Form State
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [personalMessage, setPersonalMessage] = useState(
    design.text.content || 'Semoga hari-harimu selalu seindah dan seharum buket bunga ini! 💐✨'
  );
  const [musicTrack, setMusicTrack] = useState('romantic-piano');
  const [isCreatingGift, setIsCreatingGift] = useState(false);
  const [giftShareUrl, setGiftShareUrl] = useState<string | null>(null);
  const [giftId, setGiftId] = useState<string | null>(null);
  const [giftError, setGiftError] = useState<string | null>(null);
  const [isCopiedGift, setIsCopiedGift] = useState(false);

  // Download State
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'done'>('idle');

  // WhatsApp Text State
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const currentBucket = getBucketSize(design.bucketSize);
  const flowerCount = design.selectedFlowers.length;
  const targetCount = design.targetFlowerCount ?? 25;
  const cardMessage = design.text.content || 'Untuk Happy Birthday Sayang! 💖';

  // 1. Digital Gift Creator
  const handleCreateDigitalGift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingGift(true);
    setGiftError(null);

    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: senderName.trim() || 'Seseorang yang Mengagumimu',
          recipientName: recipientName.trim() || 'Untukmu',
          message: personalMessage.trim() || cardMessage,
          musicTrack,
          designData: design,
        }),
      });

      const data = await res.json();
      if (data.success && data.shareUrl) {
        const fullUrl = `${window.location.origin}${data.shareUrl}`;
        setGiftShareUrl(fullUrl);
        setGiftId(data.id);
      } else {
        setGiftError(data.message || 'Gagal membuat kado digital.');
      }
    } catch {
      setGiftError('Terjadi kesalahan koneksi saat membuat link kado.');
    } finally {
      setIsCreatingGift(false);
    }
  };

  const handleCopyGiftLink = () => {
    if (!giftShareUrl) return;
    navigator.clipboard.writeText(giftShareUrl);
    setIsCopiedGift(true);
    setTimeout(() => setIsCopiedGift(false), 2000);
  };

  const giftWaText = encodeURIComponent(
    `Hai ${recipientName ? recipientName : 'kamu'}! 🌸 Aku baru saja merangkai buket bunga digital spesial khusus buat kamu di Studio Laysa.\n\nBuka amplop surat & lihat buketnya di link ini ya:\n${giftShareUrl}`
  );

  // 2. Download Image Handler
  const handleDownloadImage = async () => {
    setDownloadStatus('downloading');
    try {
      await downloadDesign(canvasRef, format);
      setDownloadStatus('done');
      setTimeout(() => setDownloadStatus('idle'), 3500);
    } catch {
      setDownloadStatus('idle');
    }
  };

  // 3. Simple WA Text Share
  const summaryShareText =
    `🌸 *Bucket Bunga Laysa — Rangkaian Virtual*\n\n` +
    `✨ *Model:* ${currentBucket.label}\n` +
    `🌹 *Kapasitas:* ${targetCount} Bunga (${flowerCount} terpasang)\n` +
    `💌 *Pesan Kartu:* "${cardMessage}"\n\n` +
    `Rancang buket custom impianmu secara gratis di: ${typeof window !== 'undefined' ? window.location.origin : 'https://bucketbunga-laysa.vercel.app'}`;

  const handleSendWA = () => {
    const encoded = encodeURIComponent(summaryShareText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryShareText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="ms-overlay" onClick={onClose}>
        <div className="ms-sheet" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="ms-header">
            <div className="ms-header-left">
              <div className="ms-icon-badge ms-icon-share">
                <Share2 size={20} />
              </div>
              <div>
                <h3 className="ms-title">Kirim & Unduh Buket</h3>
                <p className="ms-subtitle">Buat link kado berlagu, unduh HD, atau kirim WA</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ms-close-btn"
              aria-label="Tutup"
            >
              <X size={16} />
            </button>
          </div>

          <div className="ms-body">
            {/* Tab Bar */}
            <div className="ms-tab-bar">
              <button
                type="button"
                className={`ms-tab-btn ${activeTab === 'gift' ? 'ms-tab-btn-active' : ''}`}
                onClick={() => setActiveTab('gift')}
              >
                <Gift size={13} />
                <span>Buat Link & Lagu</span>
              </button>
              <button
                type="button"
                className={`ms-tab-btn ${activeTab === 'download' ? 'ms-tab-btn-active' : ''}`}
                onClick={() => setActiveTab('download')}
              >
                <Download size={13} />
                <span>Unduh Gambar</span>
              </button>
              <button
                type="button"
                className={`ms-tab-btn ${activeTab === 'whatsapp' ? 'ms-tab-btn-active' : ''}`}
                onClick={() => setActiveTab('whatsapp')}
              >
                <MessageCircle size={13} />
                <span>Teks WA</span>
              </button>
            </div>

            {/* ─── TAB 1: KADO DIGITAL (BUAT LINK & PILIH LAGU) ─── */}
            {activeTab === 'gift' && (
              <div>
                {!giftShareUrl ? (
                  <form onSubmit={handleCreateDigitalGift}>
                    <div style={{ marginBottom: '12px', background: '#F8FAFC', borderRadius: '14px', padding: '10px 12px', border: '1px solid #E2E8F0' }}>
                      <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                        ✨ <strong>Kado Digital Interaktif:</strong> Penerima akan membuka amplop surat virtual yang diiringi musik pilihanmu dan animasi buket mekar!
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
                      <div>
                        <label className="ms-form-label">Nama Kamu</label>
                        <input
                          type="text"
                          placeholder="Cth: Nadia"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="ms-input"
                          maxLength={35}
                        />
                      </div>
                      <div>
                        <label className="ms-form-label">Nama Penerima</label>
                        <input
                          type="text"
                          placeholder="Cth: Farhan"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="ms-input"
                          maxLength={35}
                        />
                      </div>
                    </div>

                    <div className="ms-form-field">
                      <label className="ms-form-label">Pesan / Ucapan Spesial</label>
                      <textarea
                        rows={3}
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        className="ms-textarea"
                        placeholder="Tulis ucapan personal..."
                        maxLength={350}
                      />
                    </div>

                    {/* MUSIC OPTIONS */}
                    <div className="ms-form-field">
                      <label className="ms-form-label">
                        <Music size={13} style={{ color: '#7C3AED' }} />
                        <span>Pilih Lagu Musik Pengiring</span>
                      </label>
                      <div className="ms-music-grid">
                        {MUSIC_OPTIONS.map((m) => {
                          const isSelected = musicTrack === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              className={`ms-music-pill ${isSelected ? 'active' : ''}`}
                              onClick={() => setMusicTrack(m.id)}
                            >
                              <span className="ms-music-title">{m.label}</span>
                              <span className="ms-music-desc">{m.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {giftError && (
                      <div style={{ padding: '8px 12px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '10px', fontSize: '11px', marginBottom: '12px' }}>
                        ⚠️ {giftError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isCreatingGift}
                      className="ms-btn-primary"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                        boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                        marginTop: '6px',
                      }}
                    >
                      {isCreatingGift ? (
                        <>
                          <span className="spinner" />
                          <span>Menyiapkan Link Kado...</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Buat Link Hadiah Digital</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* GIFT LINK READY */
                  <div className="ms-gift-success-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', flexShrink: 0 }}>
                        <Heart size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: '#1E293B' }}>
                          Link Kado Siap Dikirim! 🎉
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748B' }}>
                          Khusus untuk <strong>{recipientName || 'penerima'}</strong> dengan lagu {MUSIC_OPTIONS.find(m => m.id === musicTrack)?.label.split(' ')[1] || 'spesial'}.
                        </p>
                      </div>
                    </div>

                    {/* Copy Link Input */}
                    <div className="ms-link-row">
                      <input
                        type="text"
                        readOnly
                        value={giftShareUrl}
                        className="ms-link-input"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        type="button"
                        className={`ms-btn-copy ${isCopiedGift ? 'copied' : ''}`}
                        onClick={handleCopyGiftLink}
                      >
                        {isCopiedGift ? <Check size={14} /> : <Copy size={14} />}
                        <span>{isCopiedGift ? 'Tersalin!' : 'Salin'}</span>
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <a
                        href={`https://wa.me/?text=${giftWaText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          borderRadius: '14px',
                          background: '#059669',
                          color: '#FFFFFF',
                          padding: '12px',
                          fontSize: '12.5px',
                          fontWeight: 800,
                          textDecoration: 'none',
                          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.28)',
                        }}
                      >
                        <MessageCircle size={16} />
                        <span>Kirim Link via WhatsApp</span>
                      </a>

                      <a
                        href={`/gift/${giftId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          borderRadius: '14px',
                          background: '#FFFFFF',
                          color: '#334155',
                          border: '1.5px solid #CBD5E1',
                          padding: '11px',
                          fontSize: '12px',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={15} />
                        <span>Buka Pratinjau Kado</span>
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGiftShareUrl(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6366F1',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                        marginTop: '4px',
                      }}
                    >
                      Ubah Pesan / Buat Link Baru
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 2: UNDUH GAMBAR BUKET (PNG / JPG) ─── */}
            {activeTab === 'download' && (
              <div>
                <p className="ms-preset-title">Pilih Format Gambar Unduhan</p>
                <div className="ms-format-grid">
                  <button
                    type="button"
                    className={`ms-format-card ${format === 'png' ? 'active' : ''}`}
                    onClick={() => setFormat('png')}
                  >
                    <div className="ms-format-title">
                      <span>PNG Transparan</span>
                      {format === 'png' && <CheckCircle size={15} />}
                    </div>
                    <span className="ms-format-desc">Latar transparan, kualitas HD murni jernih</span>
                  </button>

                  <button
                    type="button"
                    className={`ms-format-card ${format === 'jpg' ? 'active' : ''}`}
                    onClick={() => setFormat('jpg')}
                  >
                    <div className="ms-format-title">
                      <span>JPG Bersih</span>
                      {format === 'jpg' && <CheckCircle size={15} />}
                    </div>
                    <span className="ms-format-desc">Latar warna studio, ukuran file ringan</span>
                  </button>
                </div>

                {/* File spec card */}
                <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '12px', border: '1px solid #E2E8F0', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Resolusi Kanvas:</span>
                    <strong style={{ color: '#1E293B' }}>600 × 600px (1:1 HD)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Format File:</span>
                    <strong style={{ color: '#1E293B' }}>{format.toUpperCase()} Image</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                    <span style={{ color: '#64748B' }}>Kualitas Gambar:</span>
                    <strong style={{ color: '#059669' }}>Ultra High (Lossless)</strong>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={downloadStatus === 'downloading'}
                  className="ms-btn-primary"
                  style={{
                    background: downloadStatus === 'done' ? '#059669' : '#4F46E5',
                    boxShadow: downloadStatus === 'done' ? '0 4px 14px rgba(5, 150, 105, 0.3)' : '0 4px 14px rgba(79, 70, 229, 0.3)',
                  }}
                >
                  {downloadStatus === 'idle' && (
                    <>
                      <Download size={16} />
                      <span>Unduh Desain Buket ({format.toUpperCase()})</span>
                    </>
                  )}
                  {downloadStatus === 'downloading' && (
                    <>
                      <span className="spinner" />
                      <span>Menyiapkan File Gambar HD...</span>
                    </>
                  )}
                  {downloadStatus === 'done' && (
                    <>
                      <CheckCircle size={16} />
                      <span>Berhasil Diunduh! ✓</span>
                    </>
                  )}
                </button>

                {downloadStatus === 'done' && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', fontSize: '11px', color: '#065F46', textAlign: 'center' }}>
                    🎉 File buket bunga berhasil disimpan ke perangkat ponsel Anda!
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 3: RINGKASAN PESAN WHATSAPP ─── */}
            {activeTab === 'whatsapp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ borderRadius: '16px', border: '1.5px solid #E0E7FF', background: '#EEF2FF', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#4F46E5' }}>
                      #LAYSA-BUKET-CUSTOM
                    </span>
                    <span style={{ borderRadius: '9999px', background: '#ECFDF5', padding: '2px 8px', fontSize: '10px', fontWeight: 800, color: '#059669' }}>
                      Siap Dikirim
                    </span>
                  </div>
                  <h4 style={{ marginTop: '6px', fontSize: '13.5px', fontWeight: 900, color: '#1E293B' }}>{currentBucket.label}</h4>
                  <p style={{ marginTop: '2px', fontSize: '11px', color: '#64748B' }}>
                    {flowerCount} Bunga Terpasang • Kapasitas {targetCount} Tangkai
                  </p>

                  <div style={{ marginTop: '8px', borderRadius: '10px', background: '#FFFFFF', padding: '8px 10px' }}>
                    <p style={{ fontSize: '9.5px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', margin: 0 }}>Isi Kartu:</p>
                    <p style={{ marginTop: '2px', fontSize: '11.5px', fontStyle: 'italic', color: '#334155', margin: 0 }}>"{cardMessage}"</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendWA}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '14px',
                    background: '#059669',
                    color: '#FFFFFF',
                    padding: '12px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.28)',
                  }}
                >
                  <MessageCircle size={16} />
                  <span>Kirim Pesan ke WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '14px',
                    background: '#FFFFFF',
                    color: '#334155',
                    border: '1.5px solid #CBD5E1',
                    padding: '11px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {copiedText ? <Check size={15} style={{ color: '#059669' }} /> : <Copy size={15} />}
                  <span>{copiedText ? 'Teks Berhasil Disalin!' : 'Salin Teks Ringkasan Buket'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
