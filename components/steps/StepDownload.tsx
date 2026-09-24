import { useState } from 'react';
import {
  Download,
  RotateCcw,
  CheckCircle,
  Edit3,
  Sparkles,
  Gift,
  Share2,
  Copy,
  ExternalLink,
  MessageCircle,
  Music,
  Heart,
  Send,
} from 'lucide-react';
import { useDesign } from '@/context/DesignContext';
import { downloadDesign } from '@/utils/downloadUtils';
import NavigationButtons from '../designer/NavigationButtons';

interface StepDownloadProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const MUSIC_OPTIONS = [
  { id: 'romantic-piano', label: '🎹 Romantic Piano', desc: 'Melodi lembut & puitis' },
  { id: 'acoustic-love', label: '🎸 Acoustic Love', desc: 'Hangat & manis' },
  { id: 'happy-birthday', label: '🎂 Ulang Tahun Ceria', desc: 'Perayaan & kebahagiaan' },
  { id: 'lofi-chill', label: '☕ Lofi Aesthetic', desc: 'Santai & menenangkan' },
];

export default function StepDownload({ canvasRef }: StepDownloadProps) {
  const { design, resetDesign, setStep, resetToEdit2D } = useDesign();
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [status, setStatus] = useState<'idle' | 'downloading' | 'done'>('idle');

  // Digital Gift Form State
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [personalMessage, setPersonalMessage] = useState(design.text?.content || '');
  const [musicTrack, setMusicTrack] = useState('romantic-piano');
  const [isCreatingGift, setIsCreatingGift] = useState(false);
  const [giftShareUrl, setGiftShareUrl] = useState<string | null>(null);
  const [giftId, setGiftId] = useState<string | null>(null);
  const [giftError, setGiftError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = async () => {
    setStatus('downloading');
    await downloadDesign(canvasRef, format);
    setTimeout(() => setStatus('done'), 800);
  };

  const handleReset = () => {
    resetDesign();
    setStep(1);
  };

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
          message: personalMessage.trim() || design.text?.content || 'Semoga hari-harimu selalu seindah dan seharum buket bunga ini! 💐✨',
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
        setGiftError(data.message || 'Gagal membuat hadiah digital.');
      }
    } catch {
      setGiftError('Terjadi kesalahan koneksi saat membuat link hadiah.');
    } finally {
      setIsCreatingGift(false);
    }
  };

  const handleCopyLink = () => {
    if (!giftShareUrl) return;
    navigator.clipboard.writeText(giftShareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
  const filename = `bucket_bunga_laysa_${today}.${format}`;

  const waShareText = encodeURIComponent(
    `Hai ${recipientName ? recipientName : 'kamu'}! 🌸 Aku baru saja merangkai buket bunga digital spesial khusus buat kamu di Studio Laysa.\n\nBuka amplop surat & lihat buketnya di link ini ya:\n${giftShareUrl}`
  );

  return (
    <div className="step-content">
      <div className="step-header">
        <h2 className="step-title">Kirim & Simpan Buket</h2>
        <p className="step-desc">
          Bagikan kreasi buketmu langsung ke WhatsApp atau unduh sebagai gambar beresolusi tinggi.
        </p>
      </div>

      {/* ─── FITUR UTAMA: JADIKAN HADIAH DIGITAL INTERAKTIF (SUPABASE) ─── */}
      <div className="digital-gift-card">
        <div className="digital-gift-header">
          <div className="digital-gift-badge">
            <Gift size={14} />
            <span>Kado Digital Interaktif</span>
          </div>
          <h3 className="digital-gift-title">Kirim Kartu & Buket Online</h3>
          <p className="digital-gift-subtitle">
            Penerima akan menerima link spesial berisi amplop surat, animasi buket mekar, alunan musik lembut, dan pesan pribadimu.
          </p>
        </div>

        {!giftShareUrl ? (
          <form onSubmit={handleCreateDigitalGift} className="digital-gift-form">
            <div className="gift-form-grid">
              <div className="gift-form-field">
                <label className="gift-field-label">Nama Kamu</label>
                <input
                  type="text"
                  placeholder="Cth: Nadia"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="gift-input"
                  maxLength={40}
                />
              </div>

              <div className="gift-form-field">
                <label className="gift-field-label">Nama Penerima</label>
                <input
                  type="text"
                  placeholder="Cth: Farhan"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="gift-input"
                  maxLength={40}
                />
              </div>
            </div>

            <div className="gift-form-field">
              <label className="gift-field-label">
                <span>Pesan / Ucapan untuk Penerima</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan ucapan ulang tahun, selamat wisuda, atau pesan manis..."
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                className="gift-textarea"
                maxLength={500}
              />
            </div>

            <div className="gift-form-field">
              <label className="gift-field-label">
                <Music size={13} className="text-stone-500" />
                <span>Suasana Musik Pengiring</span>
              </label>
              <div className="gift-music-grid">
                {MUSIC_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`gift-music-pill ${musicTrack === m.id ? 'active' : ''}`}
                    onClick={() => setMusicTrack(m.id)}
                  >
                    <span className="gift-music-title">{m.label}</span>
                    <span className="gift-music-desc">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {giftError && (
              <div className="gift-error-alert">
                ⚠️ {giftError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-generate-gift"
              disabled={isCreatingGift}
              id="btn-create-digital-gift"
            >
              {isCreatingGift ? (
                <>
                  <span className="spinner" />
                  <span>Menyiapkan Halaman Hadiah...</span>
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
          <div className="digital-gift-success-box">
            <div className="gift-success-top">
              <div className="gift-success-icon-wrap">
                <Heart size={20} className="text-stone-700" />
              </div>
              <div>
                <h4 className="gift-success-title">Link Hadiah Siap Dikirim!</h4>
                <p className="gift-success-desc">
                  Tautan khusus untuk <strong>{recipientName || 'penerima'}</strong> telah aktif dan tersimpan.
                </p>
              </div>
            </div>

            <div className="gift-link-copy-row">
              <input
                type="text"
                readOnly
                value={giftShareUrl}
                className="gift-share-url-input"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                className={`btn-gift-copy ${isCopied ? 'copied' : ''}`}
                onClick={handleCopyLink}
                id="btn-copy-gift-link"
              >
                {isCopied ? (
                  <>
                    <CheckCircle size={15} />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            <div className="gift-share-actions-grid">
              <a
                href={`https://wa.me/?text=${waShareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gift-whatsapp"
                id="btn-share-gift-wa"
              >
                <MessageCircle size={17} />
                <span>Kirim ke WhatsApp</span>
              </a>

              <a
                href={`/gift/${giftId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gift-preview"
                id="btn-preview-gift-page"
              >
                <ExternalLink size={16} />
                <span>Buka Pratinjau</span>
              </a>
            </div>

            <button
              type="button"
              className="btn-gift-edit-link"
              onClick={() => setGiftShareUrl(null)}
            >
              Ubah Pesan / Buat Link Baru
            </button>
          </div>
        )}
      </div>

      {/* ─── FORMAT UNDUHAN GAMBAR (PNG / JPG) ─── */}
      <div className="form-group mt-6">
        <label className="form-label">Atau Unduh File Gambar Langsung</label>
        <div className="format-options">
          <label className={`format-card ${format === 'png' ? 'selected' : ''}`}>
            <input
              id="format-png"
              type="radio"
              name="format"
              value="png"
              checked={format === 'png'}
              onChange={() => setFormat('png')}
            />
            <div className="format-info">
              <span className="format-name">PNG (Transparan)</span>
              <span className="format-desc">Latar transparan, kualitas HD jernih</span>
            </div>
          </label>
          <label className={`format-card ${format === 'jpg' ? 'selected' : ''}`}>
            <input
              id="format-jpg"
              type="radio"
              name="format"
              value="jpg"
              checked={format === 'jpg'}
              onChange={() => setFormat('jpg')}
            />
            <div className="format-info">
              <span className="format-name">JPG (Latar Bersih)</span>
              <span className="format-desc">Latar putih bersih, ukuran file ringan</span>
            </div>
          </label>
        </div>
      </div>

      {/* File info */}
      <div className="file-info-card">
        <div className="file-info-row">
          <span className="file-info-key">Nama File</span>
          <span className="file-info-val">{filename}</span>
        </div>
        <div className="file-info-row">
          <span className="file-info-key">Resolusi Kanvas</span>
          <span className="file-info-val">600 × 600px (1:1 Native HD)</span>
        </div>
        <div className="file-info-row">
          <span className="file-info-key">Kualitas</span>
          <span className="file-info-val">Ultra High (Lossless Master)</span>
        </div>
      </div>

      {/* Download button */}
      <button
        id="btn-download"
        className={`btn download-btn ${status === 'done' ? 'btn-success' : 'btn-primary'}`}
        onClick={handleDownload}
        disabled={status === 'downloading'}
      >
        {status === 'idle' && (
          <>
            <Download size={18} />
            Unduh Desain Buket ({format.toUpperCase()})
          </>
        )}
        {status === 'downloading' && (
          <>
            <span className="spinner" />
            Menyiapkan gambar HD...
          </>
        )}
        {status === 'done' && (
          <>
            <CheckCircle size={18} />
            Berhasil Diunduh! ✓
          </>
        )}
      </button>

      {status === 'done' && (
        <div className="success-banner">
          🎉 Gambar desain buket Anda berhasil disimpan ke perangkat!
        </div>
      )}

      {/* Actions */}
      <div className="download-actions">
        <button
          id="btn-edit-again"
          className="btn btn-secondary flex items-center justify-center gap-1.5"
          onClick={resetToEdit2D}
          title="Kembali ke kanvas editor untuk mengubah rangkaian bunga"
        >
          <Edit3 size={15} />
          Edit Kembali Desain
        </button>
        <button
          id="btn-new-design"
          className="btn btn-ghost flex items-center justify-center gap-1.5"
          onClick={handleReset}
        >
          <RotateCcw size={15} />
          Mulai Desain Baru
        </button>
      </div>

      <NavigationButtons
        currentStep={5}
        totalSteps={5}
        onBack={() => setStep(4)}
        onNext={() => {}}
      />
    </div>
  );
}
