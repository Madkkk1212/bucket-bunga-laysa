'use client';

import { X, Bell, ArrowRight } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import './mobile-dashboard.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenStudio?: () => void;
}

const NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Pendaftaran Buket Hadiah & Wisuda 2026',
    desc: 'Gratis kartu ucapan kaligrafi & pita satin premium edisi 2026 untuk wisuda & sidang skripsi.',
    time: 'Aktif Sekarang',
    badge: 'Promo Wisuda',
    color: '#10B981',
  },
  {
    id: 'notif-2',
    title: 'Koleksi Signature Korean Noir & Royal Gold',
    desc: 'Hadir dengan sayap origami lebar dan kertas beludru matte hitam yang mewah untuk momen ulang tahun.',
    time: 'Terbaru',
    badge: 'Edisi Mewah',
    color: '#4F46E5',
  },
  {
    id: 'notif-3',
    title: 'Ekspor Gambar HD Siap Kirim WhatsApp',
    desc: 'Simpan buket bunga resolusi tinggi 2000px tanpa watermark untuk dikirimkan tepat jam 00:00.',
    time: 'Fitur Studio',
    badge: 'Gratis',
    color: '#D97706',
  },
];

export default function MobileNotificationsModal({ isOpen, onClose, onOpenStudio }: Props) {
  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="ms-overlay" onClick={onClose}>
        <div className="ms-sheet" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="ms-header">
            <div className="ms-header-left">
              <div className="ms-icon-badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                <Bell size={20} />
              </div>
              <div>
                <h3 className="ms-title">Pemberitahuan & Informasi</h3>
                <p className="ms-subtitle">Update promo dan fitur terbaru Buket Laysa</p>
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

          {/* List */}
          <div className="ms-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {NOTIFICATIONS.map((n) => (
              <div
                key={n.id}
                style={{
                  borderRadius: '16px',
                  border: '1.5px solid #F1F5F9',
                  background: '#FFFFFF',
                  padding: '14px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ borderRadius: '9999px', background: '#EEF2FF', padding: '3px 8px', fontSize: '10.5px', fontWeight: 800, color: n.color }}>
                    {n.badge}
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{n.time}</span>
                </div>
                <h4 style={{ marginTop: '8px', fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>{n.title}</h4>
                <p style={{ marginTop: '4px', fontSize: '11.5px', color: '#64748B', lineHeight: 1.4 }}>{n.desc}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="ms-footer">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenStudio) onOpenStudio();
              }}
              className="ms-btn-primary"
            >
              <span>Mulai Rancang Buket Sekarang</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
