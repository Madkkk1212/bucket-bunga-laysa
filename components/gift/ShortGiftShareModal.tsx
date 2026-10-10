'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Copy,
  Check,
  MessageCircle,
  Share2,
  ExternalLink,
  Sparkles,
  Heart,
  Loader2,
} from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialSenderName?: string;
  initialRecipientName?: string;
  initialMessage?: string;
  design: any;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export default function ShortGiftShareModal({
  isOpen,
  onClose,
  initialSenderName = '',
  initialRecipientName = '',
  initialMessage = '',
  design,
  canvasRef,
}: Props) {
  const { t, isEn } = useLanguage();

  const [senderName, setSenderName] = useState(initialSenderName);
  const [recipientName, setRecipientName] = useState(initialRecipientName);
  const [message, setMessage] = useState(initialMessage || design?.text?.content || '');
  const [isCreating, setIsCreating] = useState(false);
  const [shortLinkUrl, setShortLinkUrl] = useState<string | null>(null);
  const [shortLinkId, setShortLinkId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasWebShare, setHasWebShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setHasWebShare(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialSenderName) setSenderName(initialSenderName);
      if (initialRecipientName) setRecipientName(initialRecipientName);
      if (initialMessage || design?.text?.content) {
        setMessage(initialMessage || design?.text?.content || '');
      }
    }
  }, [isOpen, initialSenderName, initialRecipientName, initialMessage, design]);

  if (!isOpen) return null;

  const handleCreateLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      let bouquetDataUrl: string | undefined;
      try {
        bouquetDataUrl = canvasRef?.current?.toDataURL('image/png', 0.85);
      } catch {
        // Fallback to composite
      }

      const res = await fetch('/api/b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: senderName.trim() || (isEn ? 'Someone who cares' : 'Seseorang yang Mengagumimu'),
          recipientName: recipientName.trim() || (isEn ? 'For You' : 'Untukmu'),
          message: message.trim() || (isEn ? 'A special flower bouquet made just for you!' : 'Buket bunga virtual spesial khusus untukmu! 💐✨'),
          musicTrack: 'romantic-piano',
          designData: {
            ...design,
            ...(bouquetDataUrl ? { final2D: { image: bouquetDataUrl } } : {}),
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.id) {
        const fullUrl = `${window.location.origin}/b/${data.id}`;
        setShortLinkUrl(fullUrl);
        setShortLinkId(data.id);
      } else {
        setError(data.message || (isEn ? 'Failed to generate link.' : 'Gagal membuat tautan kado.'));
      }
    } catch {
      setError(isEn ? 'Connection error occurred.' : 'Terjadi gangguan jaringan.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!shortLinkUrl) return;
    try {
      await navigator.clipboard.writeText(shortLinkUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Manual selection
    }
  };

  const handleWebShare = async () => {
    if (!shortLinkUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Buket Bunga untuk ${recipientName || 'Kamu'} 🌸`,
          text: `Hai ${recipientName || 'kamu'}! Buka kado buket bunga virtual spesial dariku di link ini ya:`,
          url: shortLinkUrl,
        });
      } catch {
        // Cancelled
      }
    } else {
      handleCopy();
    }
  };

  const waShareText = encodeURIComponent(
    isEn
      ? `Hi ${recipientName ? recipientName : 'there'}! 🌸 I just crafted a special virtual flower bouquet for you at Studio Laysa.\n\nOpen your surprise gift box here:\n${shortLinkUrl}`
      : `Hai ${recipientName ? recipientName : 'kamu'}! 🌸 Aku baru saja merangkai buket bunga digital spesial khusus buat kamu di Studio Laysa.\n\nBuka kado & lihat kejutan buketnya di link ini ya:\n${shortLinkUrl}`
  );

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-pink-100 flex flex-col max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-pink-500/25 shrink-0">
              <Send size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 tracking-tight leading-tight">
                {isEn ? 'Create Link & Send Bouquet' : 'Buat Link & Kirim Buket'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {isEn
                  ? 'Send via interactive unboxing link without login'
                  : 'Kirim buket lewat link interaktif dengan animasi buka kado'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          {!shortLinkUrl ? (
            /* ── FORM STATE: INPUT NAMES & MESSAGE ── */
            <form onSubmit={handleCreateLink} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    {isEn ? 'From (Your Name)' : 'Nama Pengirim'}
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder={isEn ? 'e.g. Farhan' : 'Cth: Farhan'}
                    maxLength={50}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-pink-500 bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    {isEn ? 'To (Recipient)' : 'Nama Penerima'}
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder={isEn ? 'e.g. Nadia' : 'Cth: Nadia'}
                    maxLength={50}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-pink-500 bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                    {isEn ? 'Greeting Card Message' : 'Isi Kartu Ucapan'}
                  </label>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {message.length}/500
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Write your heartfelt message here...'
                      : 'Tuliskan ucapan selamat atau pesan manis di sini...'
                  }
                  maxLength={500}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-pink-500 bg-stone-50/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full mt-2 py-3.5 px-5 rounded-2xl font-extrabold text-white text-sm bg-gradient-to-r from-pink-600 via-rose-600 to-rose-700 hover:from-pink-700 hover:to-rose-800 shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                id="btn-submit-short-link"
              >
                {isCreating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{isEn ? 'Creating Link…' : 'Membuat Link…'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>{isEn ? 'Generate Link & Share 🎁' : 'Buat Link & Bagikan 🎁'}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ── SUCCESS STATE: SHARE MODAL ── */
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              {/* Success pill */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
                <span className="text-base">🎉</span>
                <span>{isEn ? 'Bouquet gift link created successfully!' : 'Link kado buket berhasil dibuat!'}</span>
              </div>

              {/* URL Display box with Copy button */}
              <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="flex-1 text-xs text-stone-700 truncate font-mono select-all">
                  {shortLinkUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                  id="btn-copy-short-url"
                >
                  {isCopied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{isCopied ? t('gift_copied') : t('gift_copy_link')}</span>
                </button>
              </div>

              {/* Share Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* WhatsApp Button */}
                <a
                  href={`https://wa.me/?text=${waShareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-2xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center justify-center gap-2 transition-colors"
                  id="btn-share-whatsapp"
                >
                  <MessageCircle size={15} />
                  <span>{t('gift_share_wa')}</span>
                </a>

                {/* Web Share or Copy */}
                <button
                  type="button"
                  onClick={handleWebShare}
                  className="py-3 px-4 rounded-2xl font-bold text-xs text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 flex items-center justify-center gap-2 transition-colors"
                  id="btn-share-web-native"
                >
                  <Share2 size={15} />
                  <span>{t('gift_share_web')}</span>
                </button>
              </div>

              {/* Preview Link Button */}
              <a
                href={shortLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl font-bold text-xs text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 flex items-center justify-center gap-2 transition-colors"
                id="btn-open-short-preview"
              >
                <ExternalLink size={14} className="text-stone-400" />
                <span>{isEn ? 'Preview Gift Page (/b/…)' : 'Buka Halaman Kado (/b/…)'}</span>
              </a>

              {/* Reset to make another */}
              <button
                type="button"
                onClick={() => setShortLinkUrl(null)}
                className="w-full text-center text-[11px] font-semibold text-stone-400 hover:text-stone-600 underline pt-1"
              >
                {isEn ? '← Edit Details or Make Another Link' : '← Edit Detail atau Buat Link Lain'}
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
