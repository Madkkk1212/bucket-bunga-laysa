'use client';

import { useEffect, useRef } from 'react';
import { Sparkles, X, LogOut, ShieldCheck, Crown, ExternalLink } from 'lucide-react';
import ModalPortal from '../ui/ModalPortal';

interface VipCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onRevoke: () => void;
}

export default function VipCardModal({ isOpen, onClose, userName, onRevoke }: VipCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const firstName = userName ? userName.split(' ')[0] : 'Member';

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
          padding: '20px',
        }}
        onClick={onClose}
      >
        <div
          ref={cardRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '360px',
            background: 'linear-gradient(145deg, #1c1412 0%, #2d1f0e 50%, #1a120a 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(251,191,36,0.3)',
            boxShadow: '0 0 0 1px rgba(251,191,36,0.1), 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(180,100,0,0.15)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '14px', right: '14px',
              background: 'rgba(255,255,255,0.08)', border: 'none',
              borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
              transition: 'background 0.2s',
            }}
          >
            <X size={16} />
          </button>

          {/* Glow decoration */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '150px', height: '150px',
            background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Header */}
          <div style={{ padding: '32px 28px 20px', textAlign: 'center' }}>
            {/* Crown icon */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 6px rgba(251,191,36,0.15), 0 8px 24px rgba(180,100,0,0.4)',
            }}>
              <Crown size={28} color="#fff" fill="#fff" />
            </div>

            <p style={{ color: 'rgba(251,191,36,0.7)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
              Member VIP Studio Buket
            </p>
            <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: '0 0 4px', lineHeight: 1.2 }}>
              Halo, {firstName}! 🌸
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
              Akses penuh semua koleksi premium aktif
            </p>
          </div>

          {/* Card body */}
          <div style={{ padding: '0 24px 24px' }}>
            {/* Member card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(217,119,6,0.08) 100%)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Sparkles size={15} color="#f59e0b" />
                <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 700 }}>Keistimewaan VIP Anda</span>
              </div>
              {[
                '✓  Semua model bucket premium terbuka',
                '✓  Semua varian bunga langka tersedia',
                '✓  Download desain resolusi HD',
                '✓  Akses selamanya di perangkat ini',
              ].map((item, i) => (
                <div key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '22px' }}>{item}</div>
              ))}
            </div>

            {/* Member name tag */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.04)', borderRadius: '12px',
              padding: '10px 14px', marginBottom: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Terdaftar atas nama</div>
                <div style={{ color: '#fff', fontSize: '15px', fontWeight: 800, marginTop: '2px' }}>{userName || 'Member VIP'}</div>
              </div>
              <div style={{
                background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)',
                borderRadius: '8px', padding: '4px 10px',
              }}>
                <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700 }}>AKTIF</span>
              </div>
            </div>

            {/* Security note */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <ShieldCheck size={13} color="rgba(255,255,255,0.3)" />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>Tersimpan aman di perangkat ini</span>
            </div>

            {/* Revoke button */}
            <button
              onClick={() => { onRevoke(); onClose(); }}
              style={{
                width: '100%', padding: '12px',
                background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)',
                borderRadius: '12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                color: '#f87171', fontSize: '13px', fontWeight: 700,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(225,29,72,0.16)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(225,29,72,0.08)')}
              id="btn-revoke-vip-card"
            >
              <LogOut size={14} />
              Keluar / Cabut VIP di Perangkat Ini
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
