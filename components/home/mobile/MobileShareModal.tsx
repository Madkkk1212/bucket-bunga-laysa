'use client';

import { useState } from 'react';
import { X, MessageCircle, Share2, Copy, Check, Sparkles } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import { useDesign } from '@/context/DesignContext';
import { getBucketSize } from '@/data/buckets';
import './mobile-dashboard.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenStudio?: () => void;
}

export default function MobileShareModal({ isOpen, onClose, onOpenStudio }: Props) {
  const { design } = useDesign();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentBucket = getBucketSize(design.bucketSize);
  const flowerCount = design.selectedFlowers.length;
  const targetCount = design.targetFlowerCount ?? 25;
  const cardMessage = design.text.content || 'Untuk Happy Birthday Sayang! 💖';

  const shareText = `🌸 *Bucket Bunga Laysa — Rangkaian Virtual*\n\n` +
    `✨ *Model:* ${currentBucket.label}\n` +
    `🌹 *Kapasitas:* ${targetCount} Bunga (${flowerCount} terpasang)\n` +
    `💌 *Pesan Kartu:* "${cardMessage}"\n\n` +
    `Rancang buket custom impianmu secara gratis di: https://bucketbunga-laysa.vercel.app`;

  const handleSendWA = () => {
    const encoded = encodeURIComponent(shareText);
    const waUrl = `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <h3 className="ms-title">Kirim & Bagikan Buket</h3>
                <p className="ms-subtitle">Kirimkan hasil karya buket via WhatsApp atau simpan</p>
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

          <div className="ms-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Card Summary */}
            <div style={{ borderRadius: '18px', border: '1.5px solid #E0E7FF', background: '#EEF2FF', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#4F46E5', letterSpacing: '0.5px' }}>
                  #LAYSA-2026-BKT
                </span>
                <span style={{ borderRadius: '9999px', background: '#ECFDF5', padding: '3px 8px', fontSize: '10px', fontWeight: 800, color: '#059669' }}>
                  Siap Dikirim
                </span>
              </div>
              <h4 style={{ marginTop: '6px', fontSize: '14px', fontWeight: 900, color: '#1E293B' }}>{currentBucket.label}</h4>
              <p style={{ marginTop: '2px', fontSize: '11.5px', color: '#64748B' }}>
                {flowerCount} Bunga Terangkai • Kapasitas {targetCount} Tangkai
              </p>

              <div style={{ marginTop: '10px', borderRadius: '12px', background: '#FFFFFF', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Isi Pesan Kartu:</p>
                <p style={{ marginTop: '3px', fontSize: '11.5px', fontStyle: 'italic', color: '#334155' }}>"{cardMessage}"</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleSendWA}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '16px',
                  background: '#059669',
                  color: '#FFFFFF',
                  padding: '13px',
                  fontSize: '13px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.28)',
                }}
              >
                <MessageCircle size={18} />
                <span>Kirim Langsung via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  color: '#334155',
                  border: '1.5px solid #E2E8F0',
                  padding: '12px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={16} style={{ color: '#059669' }} /> : <Copy size={16} />}
                <span>{copied ? 'Teks Berhasil Disalin!' : 'Salin Pesan & Teks Buket'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
