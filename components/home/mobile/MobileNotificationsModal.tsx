'use client';

import { X, Bell, ArrowRight } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import { useLanguage } from '@/context/LanguageContext';
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
    titleEn: '2026 Graduation & Gift Bouquet Registration',
    desc: 'Gratis kartu ucapan kaligrafi & pita satin premium edisi 2026 untuk wisuda & sidang skripsi.',
    descEn: 'Free calligraphy greeting card & premium 2026 satin ribbon for graduations & defenses.',
    time: 'Aktif Sekarang',
    timeEn: 'Active Now',
    badge: 'Promo Wisuda',
    badgeEn: 'Graduation Promo',
    color: '#10B981',
  },
  {
    id: 'notif-2',
    title: 'Koleksi Signature Korean Noir & Royal Gold',
    titleEn: 'Signature Korean Noir & Royal Gold Collection',
    desc: 'Hadir dengan sayap origami lebar dan kertas beludru matte hitam yang mewah untuk momen ulang tahun.',
    descEn: 'Featuring wide origami wings and luxurious matte black velvet wrap for special celebrations.',
    time: 'Terbaru',
    timeEn: 'New',
    badge: 'Edisi Mewah',
    badgeEn: 'Luxury Edition',
    color: '#4F46E5',
  },
  {
    id: 'notif-3',
    title: 'Ekspor Gambar HD Siap Kirim WhatsApp',
    titleEn: 'HD Image Export Ready for WhatsApp',
    desc: 'Simpan buket bunga resolusi tinggi 2000px tanpa watermark untuk dikirimkan tepat jam 00:00.',
    descEn: 'Save high-resolution 2000px bouquet artwork with no watermarks to send right at midnight.',
    time: 'Fitur Studio',
    timeEn: 'Studio Feature',
    badge: 'Gratis',
    badgeEn: 'Free',
    color: '#D97706',
  },
];

export default function MobileNotificationsModal({ isOpen, onClose, onOpenStudio }: Props) {
  const { language } = useLanguage();
  const isEn = language === 'en';

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
                <h3 className="ms-title">{isEn ? 'Notifications & News' : 'Pemberitahuan & Informasi'}</h3>
                <p className="ms-subtitle">{isEn ? 'Latest studio updates, promos and features' : 'Update promo dan fitur terbaru Buket Laysa'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ms-close-btn"
              aria-label={isEn ? 'Close' : 'Tutup'}
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
                    {isEn ? n.badgeEn : n.badge}
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{isEn ? n.timeEn : n.time}</span>
                </div>
                <h4 style={{ marginTop: '8px', fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>{isEn ? n.titleEn : n.title}</h4>
                <p style={{ marginTop: '4px', fontSize: '11.5px', color: '#64748B', lineHeight: 1.4 }}>{isEn ? n.descEn : n.desc}</p>
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
              <span>{isEn ? 'Start Designing Bouquet Now' : 'Mulai Rancang Buket Sekarang'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
