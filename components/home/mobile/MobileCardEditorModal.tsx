'use client';

import { useState } from 'react';
import { X, Mail, Sparkles, Check } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import { useDesign } from '@/context/DesignContext';
import './mobile-dashboard.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_MESSAGES = [
  {
    title: 'Untuk Happy Birthday Sayang! 💖',
    text: 'Selamat ulang tahun cintaku! Semoga setiap harimu dipenuhi kebahagiaan, tawa, dan cinta yang tak pernah pudar.',
    label: 'Ulang Tahun 🎂',
  },
  {
    title: 'Selamat Wisuda Sahabatku! 🎓',
    text: 'Selamat atas gelar barumu! Perjuangan dan lelahmu akhirnya berbuah manis. Proud of you!',
    label: 'Wisuda 🎓',
  },
  {
    title: 'Happy Anniversary Kasihku! 💍',
    text: 'Terima kasih telah menemani setiap langkah dan hariku. Aku bersyukur memilikimu selamanya.',
    label: 'Anniversary 💍',
  },
  {
    title: 'Maafin Aku Ya Sayang 🕊️',
    text: 'Dari lubuk hati terdalam, maafkan kesalahanku ya. Bunga ini tanda ketulusan cintaku untukmu.',
    label: 'Minta Maaf 🕊️',
  },
  {
    title: 'Terima Kasih Terbaik 🌸',
    text: 'Terima kasih atas segala ketulusan, bantuan, dan kebaikan hatimu yang tak terhingga.',
    label: 'Terima Kasih 🌸',
  },
];

export default function MobileCardEditorModal({ isOpen, onClose }: Props) {
  const { design, setText } = useDesign();
  const [content, setContent] = useState(design.text.content || PRESET_MESSAGES[0].text);
  const [font, setFont] = useState(design.text.font || 'Montserrat');

  if (!isOpen) return null;

  const handleApplyPreset = (p: typeof PRESET_MESSAGES[0]) => {
    setContent(p.text);
    setText({ content: p.text });
  };

  const handleSave = () => {
    setText({ content, font });
    onClose();
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="ms-overlay" onClick={onClose}>
        <div className="ms-sheet" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="ms-header">
            <div className="ms-header-left">
              <div className="ms-icon-badge ms-icon-card">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="ms-title">Kartu Ucapan Kado</h3>
                <p className="ms-subtitle">Tulis pesan manis yang terpasang di buket bunga</p>
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
            {/* Quick Preset Pills */}
            <div style={{ marginBottom: '14px' }}>
              <p className="ms-preset-title">Pilih Kalimat Rekomendasi</p>
              <div className="ms-chip-row">
                {PRESET_MESSAGES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="ms-preset-btn"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div style={{ marginBottom: '14px' }}>
              <p className="ms-preset-title">Isi Kalimat Ucapan</p>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setText({ content: e.target.value });
                }}
                rows={4}
                className="ms-card-textarea"
                placeholder="Tulis ucapan manismu di sini..."
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#94A3B8' }}>
                <span>*Akan otomatis tercetak di kartu ucapan</span>
                <span>{content.length} karakter</span>
              </div>
            </div>

            {/* Font Style Selection */}
            <div>
              <p className="ms-preset-title">Gaya Huruf / Font</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { id: 'Montserrat', name: 'Modern' },
                  { id: 'Playfair Display', name: 'Elegan' },
                  { id: 'Great Vibes', name: 'Kaligrafi' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setFont(f.id);
                      setText({ font: f.id });
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '12px',
                      border: font === f.id ? '2px solid #D97706' : '1.5px solid #F1F5F9',
                      background: font === f.id ? '#FEF3C7' : '#FFFFFF',
                      color: font === f.id ? '#B45309' : '#475569',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="ms-footer">
            <button
              type="button"
              onClick={handleSave}
              className="ms-btn-primary"
              style={{ background: '#D97706', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.28)' }}
            >
              <Check size={16} />
              <span>Simpan Ucapan Kartu</span>
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
