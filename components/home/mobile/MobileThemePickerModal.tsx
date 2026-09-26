'use client';

import { X, Palette, Check } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import { useDesign } from '@/context/DesignContext';
import { BackgroundTheme } from '@/types/design';
import './mobile-dashboard.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const THEMES: { id: BackgroundTheme; name: string; desc: string; bgStyle: string }[] = [
  {
    id: 'studio-warm',
    name: 'Studio Warm',
    desc: 'Soft ivory & cashmere aesthetic',
    bgStyle: 'linear-gradient(135deg, #FEFAF7 0%, #EDE2D4 100%)',
  },
  {
    id: 'rose-milk',
    name: 'Rose Milk',
    desc: 'Blush pastel pink romantic',
    bgStyle: 'linear-gradient(135deg, #FFF5F7 0%, #FCE7F0 100%)',
  },
  {
    id: 'midnight-noir',
    name: 'Midnight Noir',
    desc: 'Deep luxurious dark studio',
    bgStyle: 'linear-gradient(135deg, #1E1B2E 0%, #0F0E17 100%)',
  },
  {
    id: 'sage-botanical',
    name: 'Sage Botanical',
    desc: 'Earthy mint green freshness',
    bgStyle: 'linear-gradient(135deg, #F2F8F4 0%, #D8EAD9 100%)',
  },
  {
    id: 'kraft-warm',
    name: 'Kraft Warm',
    desc: 'Artisan parchment paper',
    bgStyle: 'linear-gradient(135deg, #FBF6EE 0%, #EBDDC8 100%)',
  },
];

export default function MobileThemePickerModal({ isOpen, onClose }: Props) {
  const { design, setBgTheme } = useDesign();
  const current = design.bgTheme || 'studio-warm';

  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="ms-overlay" onClick={onClose}>
        <div className="ms-sheet" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="ms-header">
            <div className="ms-header-left">
              <div className="ms-icon-badge ms-icon-theme">
                <Palette size={20} />
              </div>
              <div>
                <h3 className="ms-title">Tema & Suasana</h3>
                <p className="ms-subtitle">Pilih latar belakang suasana studio buket</p>
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

          <div className="ms-body">
            <div className="ms-theme-grid">
              {THEMES.map((theme) => {
                const isSelected = current === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => setBgTheme(theme.id)}
                    className={`ms-theme-card ${isSelected ? 'ms-theme-card-selected' : ''}`}
                  >
                    <div
                      className="ms-theme-preview"
                      style={{ background: theme.bgStyle }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>{theme.name}</p>
                      <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{theme.desc}</p>
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '9999px',
                          background: '#C026D3',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={13} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ms-footer">
            <button
              type="button"
              onClick={onClose}
              className="ms-btn-primary"
              style={{ background: '#C026D3', boxShadow: '0 4px 14px rgba(192, 38, 211, 0.28)' }}
            >
              <span>Simpan Tema Suasana</span>
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
