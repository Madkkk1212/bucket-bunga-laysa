'use client';

import Link from 'next/link';
import { X, BookOpen, Crown, Palette, MessageCircle, RotateCcw, Sparkles } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import { useDesign } from '@/context/DesignContext';
import './mobile-dashboard.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenUnlockVip?: () => void;
}

export default function MobileQuickMenuModal({ isOpen, onClose, onOpenUnlockVip }: Props) {
  const { isPremiumUnlocked, premiumUserName, resetDesign } = useDesign();

  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="ms-overlay" onClick={onClose}>
        <div className="ms-sheet" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="ms-header">
            <div>
              <h3 className="ms-title">Menu Buket Laysa</h3>
              <p className="ms-subtitle">Layanan & Akses Studio Rangkaian</p>
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

          <div className="ms-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* VIP Status card */}
            <div style={{ borderRadius: '18px', border: '1.5px solid #FDE68A', background: '#FEF3C7', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Crown size={18} style={{ color: '#D97706' }} />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E' }}>Akses VIP Atelier</span>
                </div>
                {isPremiumUnlocked ? (
                  <span style={{ borderRadius: '9999px', background: '#FDE68A', padding: '3px 8px', fontSize: '10.5px', fontWeight: 800, color: '#92400E' }}>
                    Aktif ({premiumUserName || 'VIP'})
                  </span>
                ) : (
                  <span style={{ borderRadius: '9999px', background: '#FFFFFF', padding: '3px 8px', fontSize: '10.5px', fontWeight: 700, color: '#B45309' }}>
                    Koleksi Standar
                  </span>
                )}
              </div>
              {!isPremiumUnlocked && onOpenUnlockVip && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUnlockVip();
                  }}
                  style={{
                    marginTop: '10px',
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: '12px',
                    background: '#D97706',
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)',
                  }}
                >
                  <Sparkles size={14} />
                  <span>Buka Akses Koleksi Bunga & Buket VIP</span>
                </button>
              )}
            </div>

            {/* Menu List */}
            <Link
              href="/tutorial"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '16px',
                border: '1.5px solid #F1F5F9',
                background: '#FFFFFF',
                padding: '12px 14px',
                textDecoration: 'none',
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} />
              </div>
              <div>
                <p style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E293B' }}>Panduan Tutorial</p>
                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Langkah mudah merangkai buket bunga virtual</p>
              </div>
            </Link>

            <a
              href="https://wa.me/?text=Halo,%20saya%20ingin%20tanya%20tentang%20Buket%20Bunga%20Laysa"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '16px',
                border: '1.5px solid #F1F5F9',
                background: '#FFFFFF',
                padding: '12px 14px',
                textDecoration: 'none',
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={20} />
              </div>
              <div>
                <p style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E293B' }}>Konsultasi WhatsApp</p>
                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Bantuan pesan khusus dan custom order</p>
              </div>
            </a>

            {/* Reset option */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset rangkaian buket ke pengaturan awal?')) {
                  resetDesign();
                  onClose();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '16px',
                border: '1.5px solid #FEE2E2',
                background: '#FFF5F5',
                padding: '12px 14px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RotateCcw size={18} />
              </div>
              <div>
                <p style={{ fontSize: '12.5px', fontWeight: 800, color: '#DC2626' }}>Reset Rangkaian</p>
                <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '2px' }}>Hapus seluruh pilihan bunga & ulangi dari awal</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
