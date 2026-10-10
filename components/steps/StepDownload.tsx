import { useState, useMemo } from 'react';
import {
  Download,
  RotateCcw,
  CheckCircle,
  Edit3,
  Sparkles,
  Gift,
  Copy,
  ExternalLink,
  MessageCircle,
  Music,
  Heart,
  Send,
  QrCode,
  Check,
  Eye,
  Loader2,
} from 'lucide-react';
import { useDesign } from '@/context/DesignContext';
import { downloadDesign } from '@/utils/downloadUtils';
import NavigationButtons from '../designer/NavigationButtons';
import { useLanguage } from '@/context/LanguageContext';
import TemplateSelector from '../gift/TemplateSelector';
import GiftObjectSelector from '../gift/GiftObjectSelector';
import EffectSelector from '../gift/EffectSelector';
import YouTubeInput from '../gift/YouTubeInput';
import PhotoUploader, { ClientPhoto } from '../gift/PhotoUploader';
import PremiumUnlockModal from '../designer/PremiumUnlockModal';
import ShortGiftShareModal from '../gift/ShortGiftShareModal';
import { GIFT_TEMPLATES } from '../gift/templates';
import type { GiftTemplateId, GiftObjectId, GiftEffectId } from '@/types/giftConfig';

interface StepDownloadProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function StepDownload({ canvasRef }: StepDownloadProps) {
  const { t, isEn } = useLanguage();
  const [isShortShareModalOpen, setIsShortShareModalOpen] = useState(false);
  const {
    design,
    resetDesign,
    setStep,
    resetToEdit2D,
    exportResolution,
    setExportResolution,
    isPremiumUnlocked,
  } = useDesign();

  // Active Tab: 'gift-link' | 'download-image'
  const [activeTab, setActiveTab] = useState<'gift-link' | 'download-image'>('gift-link');

  // Image Download State
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [status, setStatus] = useState<'idle' | 'downloading' | 'done'>('idle');

  // Digital Gift Form State
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [personalMessage, setPersonalMessage] = useState(design.text?.content || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<GiftTemplateId>('klasik');
  const [selectedObjectId, setSelectedObjectId] = useState<GiftObjectId>('envelope');
  const [selectedEffectId, setSelectedEffectId] = useState<GiftEffectId>('petals');
  const [giftTitle, setGiftTitle] = useState('');
  const [isTitleCustomized, setIsTitleCustomized] = useState(false);

  // YouTube State
  const [youtubeData, setYoutubeData] = useState<{ videoId: string | null; startSeconds: number }>({
    videoId: null,
    startSeconds: 0,
  });

  // Photos State
  const [photos, setPhotos] = useState<ClientPhoto[]>([]);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  // Generating & Ticket State
  const [isCreatingGift, setIsCreatingGift] = useState(false);
  const [giftCreationStage, setGiftCreationStage] = useState<'creating' | 'uploading' | null>(null);
  const [giftShareUrl, setGiftShareUrl] = useState<string | null>(null);
  const [giftId, setGiftId] = useState<string | null>(null);
  const [giftError, setGiftError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Comprehensive VIP check (context + localStorage fallback)
  const isVipUser = useMemo(() => {
    if (isPremiumUnlocked) return true;
    if (typeof window !== 'undefined') {
      const unlocked = localStorage.getItem('laysa_premium_unlocked') === 'true';
      const code = Boolean(localStorage.getItem('laysa_access_code'));
      const tier = Boolean(localStorage.getItem('laysa_premium_tier'));
      if (unlocked || code || tier) return true;
    }
    return false;
  }, [isPremiumUnlocked]);

  // Change default object & effect when template changes
  const handleSelectTemplate = (tmplId: GiftTemplateId) => {
    setSelectedTemplateId(tmplId);
    setGiftError(null);
    const tmpl = GIFT_TEMPLATES[tmplId];
    if (tmpl) {
      setSelectedObjectId(tmpl.defaults.giftObjectId);
      setSelectedEffectId(tmpl.defaults.effectId);
      if (!isTitleCustomized) {
        setGiftTitle(isEn ? tmpl.defaults.titleEn : tmpl.defaults.titleId);
      }
      if (tmpl.requiresPhoto) {
        window.setTimeout(() => document.getElementById('gift-photo-upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
      }
    }
  };

  const handleDownload = async () => {
    setStatus('downloading');
    await downloadDesign(canvasRef, format, exportResolution, design);
    setTimeout(() => setStatus('done'), 800);
  };

  const handleReset = () => {
    resetDesign();
    setStep(1);
  };

  // Preview Gift — simpan draft sementara lalu buka tab baru
  const handlePreview = async () => {
    setIsPreviewLoading(true);
    try {
      const res = await fetch('/api/gifts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: senderName.trim() || 'Seseorang yang Mengagumimu',
          recipientName: recipientName.trim() || 'Untukmu',
          message:
            personalMessage.trim() ||
            design.text?.content ||
            'Semoga hari-harimu selalu seindah dan seharum buket bunga ini! 💐✨',
          designData: design,
          config: {
            version: 2,
            templateId: selectedTemplateId,
            giftObjectId: selectedObjectId,
            effectId: selectedEffectId,
            title:
              giftTitle.trim() ||
              (isEn ? 'A Special Bouquet For You' : 'Buket Bunga Spesial Untukmu'),
            youtubeVideoId: youtubeData.videoId || null,
            youtubeStartSeconds: youtubeData.startSeconds || 0,
          },
          photos: photos.map((p) => ({ dataUrl: p.dataUrl, altText: p.altText })),
        }),
      });
      const data = await res.json();
      if (data.success && data.draftId) {
        window.open(`/preview/${data.draftId}`, '_blank', 'noopener,noreferrer');
      } else {
        alert('Gagal membuat preview. Coba lagi.');
      }
    } catch {
      alert('Terjadi kesalahan saat membuat preview.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Submit Gift Creation (Duration is automatically handled by Admin package settings)
  const handleCreateDigitalGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (GIFT_TEMPLATES[selectedTemplateId]?.requiresPhoto && photos.length === 0) {
      setGiftError(isEn ? 'Add at least one memory photo for this landing-page template.' : 'Tambahkan minimal satu foto kenangan untuk template landing page ini.');
      document.getElementById('gift-photo-upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsCreatingGift(true);
    setGiftCreationStage('creating');
    setGiftError(null);

    try {
      const accessCode =
        typeof window !== 'undefined'
          ? localStorage.getItem('laysa_access_code') || ''
          : '';

      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: senderName.trim() || 'Seseorang yang Mengagumimu',
          recipientName: recipientName.trim() || 'Untukmu',
          message:
            personalMessage.trim() ||
            design.text?.content ||
            'Semoga hari-harimu selalu seindah dan seharum buket bunga ini! 💐✨',
          musicTrack: youtubeData.videoId ? 'youtube' : 'romantic-piano',
          designData: design,
          accessCode,
          config: {
            version: 2,
            templateId: selectedTemplateId,
            giftObjectId: selectedObjectId,
            effectId: selectedEffectId,
            title:
              giftTitle.trim() ||
              (isEn ? 'A Special Bouquet For You' : 'Buket Bunga Spesial Untukmu'),
            youtubeVideoId: youtubeData.videoId || null,
            youtubeStartSeconds: youtubeData.startSeconds || 0,
            photoCount: photos.length,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.shareUrl) {
        const fullUrl = `${window.location.origin}${data.shareUrl}`;

        // Upload photos if any
        if (photos.length > 0) {
          setGiftCreationStage('uploading');
          try {
            const photoResponse = await fetch(`/api/gifts/${data.id}/photos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                photos: photos.map((p, idx) => ({
                  dataUrl: p.dataUrl,
                  altText: p.altText,
                  displayOrder: idx,
                })),
              }),
            });
            const photoResult = await photoResponse.json().catch(() => null);
            if (!photoResponse.ok || !photoResult?.success) {
              setGiftError(isEn ? 'The link is ready, but some photos could not be saved. Please re-upload them.' : 'Link sudah siap, tetapi foto belum semuanya tersimpan. Coba unggah ulang foto.');
            }
          } catch (uploadErr) {
            console.warn('Failed to upload photos:', uploadErr);
            setGiftError(isEn ? 'The link is ready, but photo upload was interrupted.' : 'Link sudah siap, tetapi unggahan foto terputus. Coba unggah ulang foto.');
          }
        }
        setGiftShareUrl(fullUrl);
        setGiftId(data.id);
      } else {
        setGiftError(data.message || (isEn ? 'Failed to create digital gift.' : 'Gagal membuat kado digital.'));
      }
    } catch {
      setGiftError(isEn ? 'Connection error while creating gift link.' : 'Terjadi kesalahan koneksi saat membuat link kado.');
    } finally {
      setIsCreatingGift(false);
      setGiftCreationStage(null);
    }
  };

  const handleCopyLink = async () => {
    if (!giftShareUrl) return;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(giftShareUrl);
      else throw new Error('Clipboard tidak tersedia.');
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setGiftError(isEn ? 'Clipboard is unavailable. Select and copy the link manually.' : 'Clipboard tidak tersedia. Pilih lalu salin link secara manual.');
    }
  };

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
  const filename = `bucket_bunga_laysa_${today}.${format}`;

  const waShareText = encodeURIComponent(
    `Hai ${recipientName ? recipientName : 'kamu'}! 🌸 Aku baru saja merangkai buket bunga digital spesial khusus buat kamu di Studio Laysa.\n\nBuka kado & lihat kejutan buketnya di link ini ya:\n${giftShareUrl}`
  );

  return (
    <div className="step-content">
      {/* Header */}
      <div className="step-header">
        <h2 className="step-title">{isEn ? 'Share & Save Bouquet' : 'Kirim & Simpan Buket'}</h2>
        <p className="step-desc">
          {isEn
            ? 'Create an interactive digital gift link or download crystal-clear HD bouquet image.'
            : 'Buat tautan kado digital interaktif beranimasi atau unduh gambar buket resolusi tinggi.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="gift-tab-bar">
        <button
          type="button"
          onClick={() => setActiveTab('gift-link')}
          className={`gift-tab-btn ${activeTab === 'gift-link' ? 'active' : ''}`}
        >
          <Gift size={15} />
          <span>{isEn ? 'Interactive Gift Link' : 'Kado Link Interaktif'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('download-image')}
          className={`gift-tab-btn ${activeTab === 'download-image' ? 'active' : ''}`}
        >
          <Download size={15} />
          <span>{isEn ? 'Download HD Image' : 'Unduh Gambar HD'}</span>
        </button>
      </div>

      {/* ─── TAB 1: KADO LINK INTERAKTIF ─── */}
      {activeTab === 'gift-link' && (
        <div className="digital-gift-card">
          <div className="digital-gift-header">
            <div className="digital-gift-badge">
              <Gift size={13} />
              <span>{isEn ? 'Interactive Digital Gift' : 'Kado Link Interaktif'}</span>
            </div>
            <h3 className="digital-gift-title">
              {isEn ? 'Personalized Gift Experience' : 'Kado Digital Interaktif'}
            </h3>
          </div>

          {!giftShareUrl ? (
            <form onSubmit={handleCreateDigitalGift} className="digital-gift-form">
              {/* ─── CARD 1: 🌸 TEMA, OBJEK & EFEK ─── */}
              <div className="gift-studio-card">
                <div className="gift-card-header">
                  <div className="gift-step-pill">01</div>
                  <h4 className="gift-card-title">
                    <span>{isEn ? 'Theme, Object & Effect' : 'Tema, Objek & Animasi'}</span>
                  </h4>
                </div>

                {/* 1. Template Selector */}
                <TemplateSelector
                  selectedTemplateId={selectedTemplateId}
                  onSelect={handleSelectTemplate}
                  allowedTemplates={isVipUser ? 'all' : ['klasik', 'taman-mekar']}
                  onUpgradeClick={() => setIsUnlockModalOpen(true)}
                  isEn={isEn}
                />

                <div className="gift-divider-subtle" />

                {/* 2. Gift Object & Effect Selectors */}
                <GiftObjectSelector
                  selectedObjectId={selectedObjectId}
                  onSelect={setSelectedObjectId}
                  canUseAllObjects={isVipUser}
                  onUpgradeClick={() => setIsUnlockModalOpen(true)}
                  isEn={isEn}
                />

                <div className="gift-divider-subtle" />

                <EffectSelector
                  selectedEffectId={selectedEffectId}
                  onSelect={setSelectedEffectId}
                  canUseAllEffects={isVipUser}
                  onUpgradeClick={() => setIsUnlockModalOpen(true)}
                  isEn={isEn}
                />
              </div>

              {/* ─── CARD 2: ✍️ PENERIMA & SURAT UCAPAN ─── */}
              <div className="gift-studio-card">
                <div className="gift-card-header">
                  <div className="gift-step-pill">02</div>
                  <h4 className="gift-card-title">
                    <span>{isEn ? 'Sender & Recipient' : 'Penerima & Surat Ucapan'}</span>
                  </h4>
                </div>

                <div className="gift-form-grid">
                  <div className="gift-form-field">
                    <label className="gift-field-label">
                      <span>{isEn ? 'Your Name' : 'Nama Pengirim'}</span>
                      <span className="gift-field-hint">{isEn ? 'Required' : 'Wajib'}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={isEn ? 'e.g. Farhan' : 'Cth: Farhan'}
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="gift-input"
                      maxLength={40}
                      required
                    />
                  </div>

                  <div className="gift-form-field">
                    <label className="gift-field-label">
                      <span>{isEn ? "Recipient's Name" : 'Nama Penerima'}</span>
                      <span className="gift-field-hint">{isEn ? 'Required' : 'Wajib'}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={isEn ? 'e.g. Nadia' : 'Cth: Nadia'}
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="gift-input"
                      maxLength={40}
                      required
                    />
                  </div>
                </div>

                <div className="gift-form-field">
                  <label className="gift-field-label">
                    <span>{isEn ? 'Front Greeting' : 'Kalimat Pembuka Depan'}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? 'e.g. A Special Bouquet For You' : 'Cth: Untukmu yang selalu mekar di hatiku...'}
                    value={giftTitle}
                    onChange={(e) => {
                      setGiftTitle(e.target.value);
                      setIsTitleCustomized(true);
                    }}
                    className="gift-input"
                    maxLength={60}
                  />
                </div>

                <div className="gift-form-field">
                  <label className="gift-field-label">
                    <span>{isEn ? 'Greeting Letter' : 'Isi Surat & Ucapan'}</span>
                    <span className="gift-field-hint">{personalMessage.length}/500</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      isEn
                        ? 'Write heartfelt wishes or love note...'
                        : 'Tuliskan ucapan selamat, doa tulus, atau pesan manis...'
                    }
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    className="gift-textarea"
                    maxLength={500}
                  />
                </div>
              </div>

              {/* ─── CARD 3: 🎵 SOUNDTRACK & FOTO ─── */}
              <div className="gift-studio-card gift-media-card" id="gift-photo-upload-section">
                <div className="gift-card-header">
                  <div className="gift-step-pill">03</div>
                  <h4 className="gift-card-title">
                    <span>{isEn ? 'Music & Photos' : 'Soundtrack & Foto'}</span>
                  </h4>
                </div>

                {/* YouTube Song Integration */}
                <YouTubeInput
                  videoId={youtubeData.videoId}
                  startSeconds={youtubeData.startSeconds}
                  onChange={setYoutubeData}
                  canUseYouTube={true}
                  isEn={isEn}
                />

                {/* Photo Uploader */}
                <PhotoUploader
                  photos={photos}
                  onChange={setPhotos}
                  maxPhotos={isVipUser ? 6 : 1}
                  onUpgradeClick={() => setIsUnlockModalOpen(true)}
                  isEn={isEn}
                />
                {GIFT_TEMPLATES[selectedTemplateId]?.requiresPhoto && photos.length === 0 && (
                  <p className="gift-required-photo-hint" role="status">
                    {isEn ? 'This landing page needs at least one photo. Choose a photo and it will appear at the top of the shared gift page.' : 'Template landing page ini perlu minimal satu foto. Pilih foto, lalu foto akan muncul di bagian pembuka halaman kado.'}
                  </p>
                )}
              </div>

              {giftError && (
                <div className="gift-error-alert text-xs p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  ⚠️ {giftError}
                </div>
              )}

              {/* Preview Button */}
              <button
                type="button"
                onClick={handlePreview}
                disabled={isPreviewLoading || isCreatingGift}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-sm transition-all duration-200 hover:border-purple-400 disabled:opacity-50"
                id="btn-preview-gift"
              >
                {isPreviewLoading ? (
                  <><Loader2 size={16} className="animate-spin" /><span>{isEn ? 'Opening Preview...' : 'Membuka Preview...'}</span></>
                ) : (
                  <><Eye size={16} /><span>{isEn ? 'Preview Gift Experience (Opens New Tab)' : 'Lihat Preview Kado (Tab Baru)'}</span></>
                )}
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-generate-gift-luxury"
                disabled={isCreatingGift}
                id="btn-create-digital-gift"
              >
                {isCreatingGift ? (
                  <>
                    <span className="spinner" />
                    <span>{giftCreationStage === 'uploading'
                      ? (isEn ? `Uploading ${photos.length} photo${photos.length === 1 ? '' : 's'}...` : `Mengunggah ${photos.length} foto...`)
                      : (isEn ? 'Creating your gift link...' : 'Membuat link kado...')}</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>{isEn ? 'Generate Interactive Gift Link' : 'Buat Link Kado Digital Interaktif'}</span>
                    <Sparkles size={16} />
                  </>
                )}
              </button>
            </form>


          ) : (
            /* ✨ LUXURY DIGITAL GIFT TICKET PASS */
            <div className="gift-ticket-pass animate-in fade-in duration-500">
              {/* Ribbon Header */}
              <div className="gift-ticket-ribbon">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="gift-ticket-seal">💌</span>
                  <span className="gift-ticket-ribbon-text truncate">
                    {isEn ? 'DIGITAL GIFT PASS' : 'TIKET KADO DIGITAL'}
                  </span>
                </div>
                <span className="gift-ticket-ribbon-tag shrink-0">LAYSA ATELIER</span>
              </div>

              {/* Main Ticket Card Content */}
              <div className="gift-ticket-content">
                {/* TO / FROM Block */}
                <div className="gift-ticket-to-from-card">
                  <div className="gift-ticket-party">
                    <span className="gift-ticket-party-role">{isEn ? 'TO' : 'UNTUK'}</span>
                    <span className="gift-ticket-party-name" title={recipientName}>
                      {recipientName || (isEn ? 'Special Recipient' : 'Penerima Spesial')}
                    </span>
                  </div>

                  <div className="gift-ticket-heart-badge">
                    <Heart size={16} className="text-rose-500 fill-rose-500 animate-pulse" />
                  </div>

                  <div className="gift-ticket-party text-right">
                    <span className="gift-ticket-party-role">{isEn ? 'FROM' : 'DARI'}</span>
                    <span className="gift-ticket-party-name" title={senderName}>
                      {senderName || (isEn ? 'Someone Who Cares' : 'Seseorang yang Peduli')}
                    </span>
                  </div>
                </div>

                {/* Badges: Template & Music only */}
                <div className="gift-ticket-chips-row">
                  <div className="gift-ticket-chip">
                    <Sparkles size={11} className="text-pink-600" />
                    <span>{selectedTemplateId ? selectedTemplateId.replace('-', ' ') : 'Klasik'}</span>
                  </div>

                  <div className="gift-ticket-chip">
                    <Music size={11} className="text-pink-600" />
                    <span>{youtubeData.videoId ? 'YouTube Soundtrack' : (isEn ? 'Classic Melody' : 'Melodi Klasik')}</span>
                  </div>
                </div>

                {/* Letter Greeting Note Snippet */}
                {personalMessage && (
                  <div className="gift-ticket-quote-box">
                    <span className="gift-ticket-quote-sym">&ldquo;</span>
                    <p className="gift-ticket-quote-text">{personalMessage}</p>
                    <span className="gift-ticket-quote-sym right">&rdquo;</span>
                  </div>
                )}
              </div>

              {/* Perforated Tear Line (Horizontal Boarding Pass Style) */}
              <div className="gift-ticket-perforation">
                <div className="gift-ticket-punch left" />
                <div className="gift-ticket-perforated-line" />
                <div className="gift-ticket-punch right" />
              </div>

              {/* QR Stub Section */}
              {giftError && (
                <p role="alert" className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
                  {giftError}
                </p>
              )}
              <div className="gift-ticket-stub">
                <div className="gift-ticket-stub-header">
                  <QrCode size={13} className="text-pink-700" />
                  <span>{isEn ? 'SCAN OR TAP TO OPEN' : 'SCAN ATAU KLIK UNTUK BUKA'}</span>
                </div>

                <a
                  href={`/gift/${giftId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gift-ticket-qr-container"
                  title={isEn ? 'Open gift preview' : 'Buka preview kado'}
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(giftShareUrl || '')}&bgcolor=ffffff&color=831843`}
                    alt="QR Code Hadiah"
                    className="gift-ticket-qr-code"
                    width={130}
                    height={130}
                  />
                  <span className="gift-ticket-qr-hint">
                    {isEn ? 'Tap to preview gift' : 'Sentuh untuk preview kado'}
                  </span>
                </a>

                {/* URL preview pill */}
                <div
                  className="gift-ticket-url-pill"
                  onClick={handleCopyLink}
                  title={isEn ? 'Click to copy link' : 'Klik untuk salin link'}
                >
                  <span className="truncate">{giftShareUrl?.replace(/^https?:\/\//, '')}</span>
                  {isCopied ? <Check size={12} className="text-emerald-600 shrink-0" /> : <Copy size={12} className="text-stone-400 shrink-0" />}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="gift-ticket-actions">
                <a
                  href={`https://wa.me/?text=${waShareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gift-ticket-btn-wa"
                  id="btn-share-gift-wa"
                >
                  <MessageCircle size={16} />
                  <span>{isEn ? 'Send via WhatsApp' : 'Kirim ke WhatsApp'}</span>
                </a>

                <div className="gift-ticket-btn-group">
                  <a
                    href={`/gift/${giftId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gift-ticket-btn-open"
                    id="btn-preview-gift-page"
                  >
                    <ExternalLink size={13} />
                    <span>{isEn ? 'Open Gift' : 'Buka Kado'}</span>
                  </a>

                  <button
                    type="button"
                    className={`gift-ticket-btn-copy ${isCopied ? 'copied' : ''}`}
                    onClick={handleCopyLink}
                    id="btn-copy-gift-link"
                  >
                    {isCopied ? (
                      <>
                        <Check size={13} />
                        <span>{isEn ? 'Copied!' : 'Tersalin!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>{isEn ? 'Copy Link' : 'Salin Link'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Reset button */}
              <div className="p-3 text-center bg-white/40 border-t border-pink-100">
                <button
                  type="button"
                  className="text-xs font-semibold text-pink-700 hover:text-pink-900 underline transition-colors"
                  onClick={() => setGiftShareUrl(null)}
                >
                  {isEn ? '← Edit Details / Create Another Gift' : '← Edit Detail / Buat Kado Baru'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: UNDUH GAMBAR RESOLUSI TINGGI ─── */}
      {activeTab === 'download-image' && (
        <div className="download-image-section bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          {/* Resolusi Ekspor */}
          <div className="form-group mb-4">
            <label className="gift-section-title mb-2">
              {isEn ? 'Export Resolution' : 'Pilihan Resolusi Ekspor'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '12px' }}>
              <button
                type="button"
                className={`format-card ${exportResolution === '4k' ? 'selected' : ''}`}
                onClick={() => setExportResolution('4k')}
                style={{ padding: '8px 6px', textAlign: 'center', cursor: 'pointer', borderRadius: '10px' }}
              >
                <div className="format-info" style={{ textAlign: 'center' }}>
                  <span className="format-name" style={{ color: '#be185d', fontSize: '11px', fontWeight: 700, display: 'block' }}>
                    👑 4K Ultra
                  </span>
                </div>
              </button>

              <button
                type="button"
                className={`format-card ${exportResolution === '2k' ? 'selected' : ''}`}
                onClick={() => setExportResolution('2k')}
                style={{ padding: '8px 6px', textAlign: 'center', cursor: 'pointer', borderRadius: '10px' }}
              >
                <div className="format-info" style={{ textAlign: 'center' }}>
                  <span className="format-name" style={{ fontSize: '11px', fontWeight: 700, display: 'block' }}>
                    ⚡ 2K Super
                  </span>
                </div>
              </button>

              <button
                type="button"
                className={`format-card ${exportResolution === 'hd' ? 'selected' : ''}`}
                onClick={() => setExportResolution('hd')}
                style={{ padding: '8px 6px', textAlign: 'center', cursor: 'pointer', borderRadius: '10px' }}
              >
                <div className="format-info" style={{ textAlign: 'center' }}>
                  <span className="format-name" style={{ fontSize: '11px', fontWeight: 700, display: 'block' }}>
                    📱 1x HD
                  </span>
                </div>
              </button>
            </div>

            {/* Format PNG / JPG */}
            <label className="gift-section-title mb-2">
              {isEn ? 'Image Format' : 'Format Gambar'}
            </label>
            <div className="gift-duration-options" style={{ marginTop: '0', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`gift-duration-btn ${format === 'png' ? 'active' : ''}`}
              >
                PNG ({isEn ? 'Transparent' : 'Transparan'})
              </button>
              <button
                type="button"
                onClick={() => setFormat('jpg')}
                className={`gift-duration-btn ${format === 'jpg' ? 'active' : ''}`}
              >
                JPG ({isEn ? 'White BG' : 'Latar Putih'})
              </button>
            </div>
          </div>

          {/* File info */}
          <div className="file-info-card" style={{ padding: '10px 12px', borderRadius: '12px', fontSize: '11.5px' }}>
            <div className="file-info-row" style={{ padding: '3px 0' }}>
              <span className="file-info-key">{isEn ? 'File' : 'Nama File'}</span>
              <span className="file-info-val truncate max-w-[160px]">{filename}</span>
            </div>
            <div className="file-info-row" style={{ padding: '3px 0' }}>
              <span className="file-info-key">{isEn ? 'Size' : 'Ukuran'}</span>
              <span className="file-info-val">
                {exportResolution === '4k'
                  ? '2100 × 2100px (4K)'
                  : exportResolution === '2k'
                  ? '1200 × 1200px (2K)'
                  : '600 × 600px (HD)'}
              </span>
            </div>
          </div>

          {/* Action Buttons: Unduh Gambar & Buat Link & Kirim */}
          <div className="flex flex-col sm:flex-row gap-2.5 mt-3">
            <button
              id="btn-download"
              className={`btn download-btn ${status === 'done' ? 'btn-success' : 'btn-primary'} flex-1`}
              onClick={handleDownload}
              disabled={status === 'downloading'}
              style={{ padding: '12px', borderRadius: '12px', fontSize: '13px' }}
            >
              {status === 'idle' && (
                <>
                  <Download size={16} />
                  <span>{isEn ? `Download Image (${format.toUpperCase()})` : `Unduh Gambar (${format.toUpperCase()})`}</span>
                </>
              )}
              {status === 'downloading' && (
                <>
                  <span className="spinner" />
                  <span>{isEn ? 'Preparing image...' : 'Menyiapkan gambar...'}</span>
                </>
              )}
              {status === 'done' && (
                <>
                  <CheckCircle size={16} />
                  <span>{isEn ? 'Downloaded! ✓' : 'Berhasil Diunduh! ✓'}</span>
                </>
              )}
            </button>

            {/* C.1: Tombol "Buat Link & Kirim" di samping tombol unduh gambar */}
            <button
              id="btn-create-short-link"
              type="button"
              className="btn btn-secondary flex-1 flex items-center justify-center gap-2 border-pink-300 text-pink-700 bg-pink-50/80 hover:bg-pink-100 font-bold shadow-xs cursor-pointer"
              onClick={() => setIsShortShareModalOpen(true)}
              style={{ padding: '12px', borderRadius: '12px', fontSize: '13px' }}
            >
              <Send size={15} className="text-rose-600 shrink-0" />
              <span>{t('gift_create_link_btn')}</span>
            </button>
          </div>

          {status === 'done' && (
            <div className="success-banner mt-2.5 text-xs py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-medium">
              {isEn ? '🎉 Bouquet image saved successfully!' : '🎉 Gambar buket berhasil disimpan!'}
            </div>
          )}
        </div>
      )}

      {/* Common bottom actions */}
      <div className="download-actions mt-8 flex flex-wrap gap-2 justify-center">
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

      <PremiumUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        itemName={isEn ? 'Kado Link VIP Package' : 'Paket VIP Kado Link'}
      />

      {/* C.1 & C.4: Modal Buat Link & Kirim Lewat Link (/b/[id]) */}
      <ShortGiftShareModal
        isOpen={isShortShareModalOpen}
        onClose={() => setIsShortShareModalOpen(false)}
        initialSenderName={senderName}
        initialRecipientName={recipientName}
        initialMessage={personalMessage || design.text?.content || ''}
        design={design}
        canvasRef={canvasRef}
      />
    </div>
  );
}
