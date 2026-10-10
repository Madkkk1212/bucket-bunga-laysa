'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Gift,
  FileText,
  Crown,
  Eye,
  Check,
  Smartphone,
  Laptop,
  Heart,
  Music,
} from 'lucide-react';
import { GIFT_TEMPLATES } from '@/components/gift/templates';
import type { GiftTemplateId } from '@/types/giftConfig';

interface VipItemPreviewModalProps {
  type: 'card' | 'gift_template';
  itemKey: string;
  itemName: string;
  isVip: boolean;
  onClose: () => void;
}

export default function VipItemPreviewModal({
  type,
  itemKey,
  itemName,
  isVip,
  onClose,
}: VipItemPreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');

  // ── Render Preview Kartu Ucapan ──
  const renderCardPreview = () => {
    switch (itemKey) {
      case 'elegant':
        return (
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              borderRadius: '20px',
              background: 'linear-gradient(145deg, #18181b 0%, #09090b 100%)',
              border: '2px solid #d4af37',
              boxShadow: '0 20px 45px rgba(212, 175, 55, 0.25), inset 0 0 25px rgba(212, 175, 55, 0.1)',
              padding: '32px 28px',
              color: '#fef08a',
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'center',
            }}
          >
            {/* Lis Foil Emas Mengkilap */}
            <div
              style={{
                position: 'absolute',
                inset: '8px',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '12px',
                pointerEvents: 'none',
              }}
            />

            {/* Badge Gold Foil */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #d4af37, #b45309)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                marginBottom: '18px',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
              }}
            >
              <Crown size={12} />
              <span>LUXURY GOLD FOIL</span>
            </div>

            <h3
              style={{
                fontFamily: 'serif',
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#fef08a',
                margin: '0 0 14px 0',
                letterSpacing: '0.02em',
                textShadow: '0 2px 8px rgba(212, 175, 55, 0.5)',
              }}
            >
              Untukmu yang Paling Berharga
            </h3>

            <p
              style={{
                fontFamily: 'serif',
                fontSize: '0.92rem',
                lineHeight: 1.7,
                color: '#fef9c3',
                margin: '0 0 20px 0',
                fontStyle: 'italic',
              }}
            >
              &ldquo;Semoga setiap lembar kelopak bunga ini menjadi saksi ketulusan dan doa terbaik untuk kebahagiaanmu hari ini dan selamanya.&rdquo;
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid rgba(212, 175, 55, 0.3)',
                fontSize: '0.78rem',
                color: '#d4af37',
              }}
            >
              <span>Dengan Penuh Kasih,</span>
              <strong style={{ letterSpacing: '0.05em' }}>— Seseorang yang Mengagumimu</strong>
            </div>

            {/* Wax Seal Emas Timbul */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #fde047 0%, #b45309 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                border: '2px solid #fef08a',
              }}
            >
              ⚜️
            </div>
          </div>
        );

      case 'graduation':
        return (
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              border: '2px solid #38bdf8',
              boxShadow: '0 20px 45px rgba(56, 189, 248, 0.25)',
              padding: '32px 28px',
              color: '#ffffff',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🎓</div>
            <span
              style={{
                background: '#0284c7',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
              }}
            >
              EDISI KHUSUS WISUDA
            </span>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '14px 0 10px 0', color: '#38bdf8' }}>
              Happy Graduation! S.T. / S.Kom.
            </h3>

            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#cbd5e1', margin: '0 0 18px 0' }}>
              Selamat atas gelar barumu! Perjuangan panjang, begadang, dan revisi akhirnya terbayar tuntas dengan manis hari ini. Bangga sekali padamu!
            </p>

            <div style={{ paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '0.78rem', color: '#94a3b8' }}>
              Semoga sukses selalu menantimu di langkah berikutnya! 🚀✨
            </div>
          </div>
        );

      case 'birthday':
        return (
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #fff1f2 0%, #fce7f3 100%)',
              border: '2px solid #f43f5e',
              boxShadow: '0 20px 45px rgba(244, 63, 94, 0.18)',
              padding: '32px 28px',
              color: '#881337',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🎂🎀</div>
            <span
              style={{
                background: '#f43f5e',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}
            >
              SPECIAL BIRTHDAY CELEBRATION
            </span>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '14px 0 10px 0', color: '#be123c' }}>
              Selamat Ulang Tahun yang Terindah!
            </h3>

            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#9f1239', margin: '0 0 18px 0' }}>
              Semoga bertambahnya usiamu membawa limpahan kebahagiaan, kesehatan, dan impian yang tercapai satu per satu. You deserve all the good things! 🎉
            </p>

            <div style={{ paddingTop: '14px', borderTop: '1px solid #fecdd3', fontSize: '0.78rem', color: '#be123c', fontWeight: 600 }}>
              Lots of Love & Hugs ❤️
            </div>
          </div>
        );

      default: // simple
        return (
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              borderRadius: '16px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08)',
              padding: '30px 24px',
              color: '#334155',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Paper Clip Visual */}
            <div
              style={{
                position: 'absolute',
                top: '-10px',
                left: '28px',
                width: '16px',
                height: '34px',
                borderRadius: '8px',
                border: '3px solid #94a3b8',
                background: '#ffffff',
              }}
            />

            <span
              style={{
                background: '#f1f5f9',
                color: '#475569',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              KARTU MINIMALIS STANDAR
            </span>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '16px 0 10px 0', color: '#1e293b' }}>
              Sebuah Pesan Manis Untukmu
            </h3>

            <p style={{ fontSize: '0.86rem', lineHeight: 1.6, color: '#64748b', margin: '0 0 18px 0' }}>
              Buket bunga ini dirangkai khusus untuk mencerahkan harimu. Semoga harimu menyenangkan dan dipenuhi senyuman! 💐
            </p>

            <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: '#94a3b8' }}>
              Format kartu kertas simpel, bersih & rapi.
            </div>
          </div>
        );
    }
  };

  // ── Render Preview Template Kado Digital ──
  const renderTemplatePreview = () => {
    const tmpl = (GIFT_TEMPLATES as any)[itemKey];
    if (!tmpl) {
      return (
        <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
          Data template &ldquo;{itemKey}&rdquo; tidak ditemukan.
        </div>
      );
    }

    return (
      <div
        style={{
          width: '100%',
          maxWidth: deviceMode === 'mobile' ? '340px' : '620px',
          height: deviceMode === 'mobile' ? '580px' : '440px',
          borderRadius: deviceMode === 'mobile' ? '36px' : '18px',
          background: tmpl.bgStyle || '#ffffff',
          border: deviceMode === 'mobile' ? '10px solid #1e1b4b' : '2px solid #cbd5e1',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Notch HP jika mode mobile */}
        {deviceMode === 'mobile' && (
          <div
            style={{
              width: '110px',
              height: '18px',
              background: '#1e1b4b',
              margin: '0 auto',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
              zIndex: 10,
            }}
          />
        )}

        {/* Header Tema */}
        <div
          style={{
            padding: '16px 20px',
            textAlign: 'center',
            color: tmpl.colors.primary,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.75)',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Sparkles size={11} />
            <span>TEMA: {tmpl.name.toUpperCase()}</span>
          </div>

          <h2
            style={{
              fontFamily: tmpl.fonts.heading,
              fontSize: '1.35rem',
              fontWeight: 800,
              margin: '12px 0 4px 0',
              color: tmpl.colors.text || '#1e1b4b',
            }}
          >
            {tmpl.defaults.titleId}
          </h2>

          <span style={{ fontSize: '0.78rem', color: tmpl.colors.muted }}>
            Dari: <strong>Seseorang yang Mengagumimu</strong>
          </span>
        </div>

        {/* Center Stage: Mockup Amplop & Buket Terbuka */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '10px 20px',
          }}
        >
          {/* Mockup Amplop / Gift Object */}
          <div
            style={{
              width: '130px',
              height: '110px',
              borderRadius: '16px',
              background: tmpl.colors.surface || '#ffffff',
              border: `2px solid ${tmpl.colors.accent}`,
              boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              animation: 'bounce 3s infinite',
            }}
          >
            <div style={{ fontSize: '2.5rem' }}>💌</div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: tmpl.colors.primary }}>
              Klik Untuk Membuka
            </span>
          </div>

          {/* Animasi Partikel Floating Petals / Stars */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <span style={{ animation: 'pulse 1.5s infinite' }}>✨</span>
            <span>🌸</span>
            <span style={{ animation: 'pulse 2s infinite' }}>💐</span>
            <span>✨</span>
          </div>
        </div>

        {/* Footer Mockup: Music & Interactive Prompt */}
        <div
          style={{
            padding: '12px 18px',
            background: 'rgba(255, 255, 255, 0.85)',
            borderTop: `1px solid ${tmpl.colors.accent}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: tmpl.colors.text,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Music size={13} color={tmpl.colors.primary} />
            <span>Musik Latar Romantis</span>
          </div>
          <span style={{ fontWeight: 700, color: tmpl.colors.primary }}>
            {tmpl.photoStyle.style === 'polaroid' ? '📸 Galeri Foto Polaroid' : '✨ Efek Interaktif'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(15, 10, 25, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: type === 'gift_template' ? '740px' : '480px',
          background: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '18px 24px',
            background: '#1e1b4b',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isVip ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isVip ? <Crown size={16} color="#ffffff" /> : <Eye size={16} color="#ffffff" />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                Pratinjau Hasil: {itemName}
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#c7d2fe' }}>
                {type === 'card' ? 'Tampilan kartu ucapan fisik' : 'Tampilan landing page kado digital'} • Status: {isVip ? 'VIP Eksklusif' : 'Standar'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Toolbar Switcher jika template kado (Mobile vs Desktop) */}
        {type === 'gift_template' && (
          <div
            style={{
              padding: '10px 24px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Mode Pratinjau Layar:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: deviceMode === 'mobile' ? '1px solid #6366f1' : '1px solid #cbd5e1',
                  background: deviceMode === 'mobile' ? '#e0e7ff' : '#ffffff',
                  color: deviceMode === 'mobile' ? '#4338ca' : '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Smartphone size={13} />
                <span>HP / Smartphone</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceMode('desktop')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: deviceMode === 'desktop' ? '1px solid #6366f1' : '1px solid #cbd5e1',
                  background: deviceMode === 'desktop' ? '#e0e7ff' : '#ffffff',
                  color: deviceMode === 'desktop' ? '#4338ca' : '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Laptop size={13} />
                <span>Laptop / Layar Lebar</span>
              </button>
            </div>
          </div>
        )}

        {/* Canvas Visual Display Area */}
        <div
          style={{
            padding: '30px 24px',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {type === 'card' ? renderCardPreview() : renderTemplatePreview()}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Pratinjau visual akurat sesuai yang dilihat penerima buket.
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              background: '#1e1b4b',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
