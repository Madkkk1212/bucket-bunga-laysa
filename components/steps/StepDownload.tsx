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
  QrCode,
  Check,
} from 'lucide-react';
import { useDesign } from '@/context/DesignContext';
import { downloadDesign } from '@/utils/downloadUtils';
import NavigationButtons from '../designer/NavigationButtons';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t, isEn } = useLanguage();
  const {
    design,
    resetDesign,
    setStep,
    resetToEdit2D,
    exportResolution,
    setExportResolution,
  } = useDesign();
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
    await downloadDesign(canvasRef, format, exportResolution);
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
        <h2 className="step-title">{isEn ? 'Share & Save Bouquet' : 'Kirim & Simpan Buket'}</h2>
        <p className="step-desc">
          {isEn
            ? 'Share your floral masterpiece directly via WhatsApp or download as ultra-high-resolution image.'
            : 'Bagikan kreasi buketmu langsung ke WhatsApp atau unduh sebagai gambar beresolusi tinggi.'}
        </p>
      </div>

      {/* ─── FITUR UTAMA: JADIKAN HADIAH DIGITAL INTERAKTIF (SUPABASE) ─── */}
      <div className="digital-gift-card">
        <div className="digital-gift-header">
          <div className="digital-gift-badge">
            <Gift size={14} />
            <span>{isEn ? 'Interactive Digital Gift' : 'Kado Digital Interaktif'}</span>
          </div>
          <h3 className="digital-gift-title">{isEn ? 'Send Online Greeting Card & Bouquet' : 'Kirim Kartu & Buket Online'}</h3>
          <p className="digital-gift-subtitle">
            {isEn
              ? 'Recipient will receive a special link with animated unsealing, blooming bouquet, soft acoustic music, and your private note.'
              : 'Penerima akan menerima link spesial berisi amplop surat, animasi buket mekar, alunan musik lembut, dan pesan pribadimu.'}
          </p>
        </div>

        {!giftShareUrl ? (
          <form onSubmit={handleCreateDigitalGift} className="digital-gift-form">
            <div className="gift-form-grid">
              <div className="gift-form-field">
                <label className="gift-field-label">{isEn ? 'Your Name' : 'Nama Kamu'}</label>
                <input
                  type="text"
                  placeholder={isEn ? 'e.g. Nadia' : 'Cth: Nadia'}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="gift-input"
                  maxLength={40}
                />
              </div>

              <div className="gift-form-field">
                <label className="gift-field-label">{isEn ? "Recipient's Name" : 'Nama Penerima'}</label>
                <input
                  type="text"
                  placeholder={isEn ? 'e.g. Farhan' : 'Cth: Farhan'}
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="gift-input"
                  maxLength={40}
                />
              </div>
            </div>

            <div className="gift-form-field">
              <label className="gift-field-label">
                <span>{isEn ? 'Greeting Card Message' : 'Pesan / Ucapan untuk Penerima'}</span>
              </label>
              <textarea
                rows={3}
                placeholder={isEn ? 'Write birthday wishes, graduation congratulations, or romantic note...' : 'Tuliskan ucapan ulang tahun, selamat wisuda, atau pesan manis...'}
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                className="gift-textarea"
                maxLength={500}
              />
            </div>

            <div className="gift-form-field">
              <label className="gift-field-label">
                <Music size={13} className="text-stone-500" />
                <span>{isEn ? 'Background Music Atmosphere' : 'Suasana Musik Pengiring'}</span>
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
                  <span>{isEn ? 'Generating Gift Page...' : 'Menyiapkan Halaman Hadiah...'}</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>{isEn ? 'Generate Digital Gift Link' : 'Buat Link Hadiah Digital'}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* ✨ LUXURY DIGITAL GIFT TICKET PASS */
          <div className="gift-ticket-pass">
            {/* Ribbon Header */}
            <div className="gift-ticket-ribbon">
              <span className="gift-ticket-seal">💌</span>
              <span className="gift-ticket-ribbon-text">TIKET KADO DIGITAL INTERAKTIF</span>
            </div>

            {/* Ticket Body */}
            <div className="gift-ticket-body">
              {/* Left: Info */}
              <div className="gift-ticket-info">
                <div className="gift-ticket-to-from">
                  <div className="gift-ticket-to">
                    <span className="gift-ticket-label">KEPADA</span>
                    <span className="gift-ticket-name">{recipientName || 'Penerima Spesial'}</span>
                  </div>
                  <div className="gift-ticket-arrow">❤️</div>
                  <div className="gift-ticket-from">
                    <span className="gift-ticket-label">DARI</span>
                    <span className="gift-ticket-name">{senderName || 'Seseorang yang Peduli'}</span>
                  </div>
                </div>

                {/* Music badge */}
                <div className="gift-ticket-music-badge">
                  <Music size={11} />
                  <span>{MUSIC_OPTIONS.find(m => m.id === musicTrack)?.label || '🎹 Romantic Piano'}</span>
                </div>

                {/* Letter snippet */}
                {personalMessage && (
                  <div className="gift-ticket-letter-snippet">
                    <span className="gift-ticket-quote-mark">&ldquo;</span>
                    <p>{personalMessage.length > 90 ? `${personalMessage.slice(0, 90)}...` : personalMessage}</p>
                    <span className="gift-ticket-quote-mark end">&rdquo;</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="gift-ticket-divider">
                <div className="gift-ticket-hole top" />
                <div className="gift-ticket-dashes" />
                <div className="gift-ticket-hole bottom" />
              </div>

              {/* Right: QR Code */}
              <div className="gift-ticket-qr-side">
                <div className="gift-ticket-qr-label">
                  <QrCode size={13} />
                  <span>Scan untuk Buka</span>
                </div>
                <div className="gift-ticket-qr-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(giftShareUrl || '')}&bgcolor=fff7f5&color=831843`}
                    alt="QR Code Hadiah"
                    className="gift-ticket-qr-img"
                    width={130}
                    height={130}
                  />
                </div>
                <div className="gift-ticket-link-small">
                  {giftShareUrl?.replace(/^https?:\/\//, '').slice(0, 28)}...
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="gift-ticket-actions">
              <a
                href={`https://wa.me/?text=${waShareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gift-ticket-btn-wa"
                id="btn-share-gift-wa"
              >
                <MessageCircle size={15} />
                <span>{isEn ? 'Send via WhatsApp' : 'Kirim ke WhatsApp'}</span>
              </a>

              <a
                href={`/gift/${giftId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gift-ticket-btn-preview"
                id="btn-preview-gift-page"
              >
                <ExternalLink size={14} />
                <span>{isEn ? 'Preview Gift' : 'Buka Kado'}</span>
              </a>

              <button
                type="button"
                className={`gift-ticket-btn-copy ${isCopied ? 'copied' : ''}`}
                onClick={handleCopyLink}
                id="btn-copy-gift-link"
              >
                {isCopied ? (
                  <>
                    <Check size={14} />
                    <span>{isEn ? 'Copied!' : 'Tersalin!'}</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>{isEn ? 'Copy Link' : 'Salin Link'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Reset link */}
            <button
              type="button"
              className="btn-gift-edit-link"
              onClick={() => setGiftShareUrl(null)}
            >
              {isEn ? 'Change message / Create new link' : 'Ubah Pesan / Buat Link Baru'}
            </button>
          </div>
        )}
      </div>

      {/* ─── RESOLUSI EKSPOR ULTRA (4K MASTER, 2K, 1080P) ─── */}
      <div className="form-group mt-6">
        <label className="form-label">{isEn ? 'Image Export Resolution' : 'Pilihan Resolusi Ekspor Gambar'}</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
          <button
            type="button"
            className={`format-card ${exportResolution === '4k' ? 'selected' : ''}`}
            onClick={() => setExportResolution('4k')}
            style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer' }}
          >
            <div className="format-info">
              <span className="format-name" style={{ color: '#4338ca', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>👑 Ultra 4K</span>
              </span>
              <span className="format-desc">{isEn ? '3.5x Lossless Master' : '3.5x Detail Master Ultra'}</span>
            </div>
          </button>

          <button
            type="button"
            className={`format-card ${exportResolution === '2k' ? 'selected' : ''}`}
            onClick={() => setExportResolution('2k')}
            style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer' }}
          >
            <div className="format-info">
              <span className="format-name">⚡ 2K Super HD</span>
              <span className="format-desc">{isEn ? '2x Sharp Print' : '2x Tajam & Cetak'}</span>
            </div>
          </button>

          <button
            type="button"
            className={`format-card ${exportResolution === 'hd' ? 'selected' : ''}`}
            onClick={() => setExportResolution('hd')}
            style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer' }}
          >
            <div className="format-info">
              <span className="format-name">📱 Native 1x</span>
              <span className="format-desc">{isEn ? 'Fast & Lightweight' : 'Ringan & Cepat'}</span>
            </div>
          </button>
        </div>

        {/* ─── FORMAT UNDUHAN GAMBAR (PNG / JPG) ─── */}
        <label className="form-label">{isEn ? 'Or Download Image File Directly' : 'Pilih Format File Gambar'}</label>
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
              <span className="format-name">PNG ({isEn ? 'Transparent' : 'Transparan'})</span>
              <span className="format-desc">{isEn ? 'Transparent backdrop, lossless HD' : 'Latar transparan, kualitas HD jernih'}</span>
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
              <span className="format-name">JPG ({isEn ? 'Studio Background' : 'Latar Bersih'})</span>
              <span className="format-desc">{isEn ? 'Clean studio/white backdrop, lightweight' : 'Latar putih/studio bersih, ukuran file ringan'}</span>
            </div>
          </label>
        </div>
      </div>

      {/* File info */}
      <div className="file-info-card">
        <div className="file-info-row">
          <span className="file-info-key">{isEn ? 'File Name' : 'Nama File'}</span>
          <span className="file-info-val">{filename}</span>
        </div>
        <div className="file-info-row">
          <span className="file-info-key">{isEn ? 'Export Resolution' : 'Resolusi Ekspor'}</span>
          <span className="file-info-val">
            {exportResolution === '4k'
              ? '2100 × 2100px (Ultra 4K Master)'
              : exportResolution === '2k'
              ? '1200 × 1200px (Super 2K HD)'
              : '600 × 600px (1:1 Native HD)'}
          </span>
        </div>
        <div className="file-info-row">
          <span className="file-info-key">{isEn ? 'Quality' : 'Kualitas'}</span>
          <span className="file-info-val">
            {exportResolution === '4k'
              ? 'Ultra High 4K (Lossless Master)'
              : exportResolution === '2k'
              ? 'High Definition (Sharp 2K)'
              : 'Standard HD'}
          </span>
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
            {isEn ? `Download Bouquet Design (${format.toUpperCase()})` : `Unduh Desain Buket (${format.toUpperCase()})`}
          </>
        )}
        {status === 'downloading' && (
          <>
            <span className="spinner" />
            {isEn ? 'Preparing HD image...' : 'Menyiapkan gambar HD...'}
          </>
        )}
        {status === 'done' && (
          <>
            <CheckCircle size={18} />
            {isEn ? 'Downloaded Successfully! ✓' : 'Berhasil Diunduh! ✓'}
          </>
        )}
      </button>

      {status === 'done' && (
        <div className="success-banner">
          {isEn
            ? '🎉 Your bouquet design image has been saved to your device!'
            : '🎉 Gambar desain buket Anda berhasil disimpan ke perangkat!'}
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
          {t('edit_again')}
        </button>
        <button
          id="btn-new-design"
          className="btn btn-ghost flex items-center justify-center gap-1.5"
          onClick={handleReset}
        >
          <RotateCcw size={15} />
          {t('start_new_btn')}
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
