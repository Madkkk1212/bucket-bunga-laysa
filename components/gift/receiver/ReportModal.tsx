'use client';

import React, { useState } from 'react';
import { Flag, X, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  giftId: string;
  isOpen: boolean;
  onClose: () => void;
  isEn?: boolean;
}

const REPORT_REASONS_ID = [
  'Konten tidak pantas atau vulgar',
  'Pelecehan atau intimidasi',
  'Spam atau tautan mencurigakan',
  'Pelanggaran privasi / foto tanpa izin',
  'Lainnya',
];

const REPORT_REASONS_EN = [
  'Inappropriate or offensive content',
  'Harassment or intimidation',
  'Spam or suspicious link',
  'Privacy violation / unauthorized photo',
  'Other',
];

export default function ReportModal({
  giftId,
  isOpen,
  onClose,
  isEn = false,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customDetail, setCustomDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const reasons = isEn ? REPORT_REASONS_EN : REPORT_REASONS_ID;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === (isEn ? 'Other' : 'Lainnya')
      ? customDetail.trim()
      : selectedReason + (customDetail.trim() ? `: ${customDetail.trim()}` : '');

    if (!finalReason || finalReason.length < 3) {
      setErrorMessage(isEn ? 'Please choose or write a reason.' : 'Pilih atau tuliskan alasan laporan.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/gifts/${giftId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: finalReason }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2200);
      } else {
        setErrorMessage(data.message || (isEn ? 'Failed to submit report.' : 'Gagal mengirim laporan.'));
      }
    } catch {
      setErrorMessage(isEn ? 'Connection error. Please try again.' : 'Terjadi kendala koneksi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600">
            <Flag size={18} />
            <h3 className="font-semibold text-stone-900 text-sm">
              {isEn ? 'Report This Digital Gift' : 'Laporkan Kado Digital Ini'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors p-1"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="py-6 text-center">
              <CheckCircle2 size={44} className="mx-auto text-emerald-500 mb-3 animate-bounce" />
              <h4 className="text-base font-bold text-stone-900 mb-1">
                {isEn ? 'Report Submitted' : 'Laporan Terkirim'}
              </h4>
              <p className="text-xs text-stone-600">
                {isEn
                  ? 'Thank you for helping keep our floral community safe.'
                  : 'Terima kasih telah membantu menjaga keamanan dan kenyamanan studio.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-stone-600">
                {isEn
                  ? 'If this gift contains harmful or inappropriate content, let our moderation team know:'
                  : 'Jika kado ini mengandung pesan/foto yang mengganggu atau melanggar norma, beri tahu tim kami:'}
              </p>

              <div className="space-y-2">
                {reasons.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedReason === r
                        ? 'border-pink-500 bg-pink-50/60 font-medium text-pink-900'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r}
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="accent-pink-600"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {isEn ? 'Additional details (optional):' : 'Penjelasan tambahan (opsional):'}
                </label>
                <textarea
                  rows={2}
                  value={customDetail}
                  onChange={(e) => setCustomDetail(e.target.value)}
                  placeholder={isEn ? 'Explain why you are reporting this gift...' : 'Jelaskan secara singkat kendala pada kado ini...'}
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  maxLength={300}
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                >
                  {isEn ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedReason}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {submitting ? (
                    <span>{isEn ? 'Submitting...' : 'Mengirim...'}</span>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>{isEn ? 'Send Report' : 'Kirim Laporan'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
