'use client';

import { useState } from 'react';
import {
  X,
  Mail,
  Sparkles,
  Check,
  Type,
  Maximize2,
  Palette,
  Move,
  RotateCcw,
  Minus,
  Plus,
} from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import { useDesign } from '@/context/DesignContext';
import './mobile-dashboard.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_MESSAGES = [
  {
    title: 'Selamat Malam Sayang! 🌙💖',
    text: 'Selamat malam sayangku. Istirahat yang nyenyak ya, semoga mimpi indah ditemani harumnya bunga ini. Love you always!',
    label: 'Malam 🌙',
  },
  {
    title: 'Selamat Pagi Sayang! ☀️🌸',
    text: 'Selamat pagi bidadariku! Semoga harimu menyenangkan, penuh senyuman dan berkah. Semangat untuk hari ini!',
    label: 'Pagi ☀️',
  },
  {
    title: 'Selamat Siang Manis! 🌼✨',
    text: 'Selamat siang manis! Jangan lupa istirahat sejenak dan makan siang ya. Sending virtual flowers & hugs for you!',
    label: 'Siang 🌼',
  },
  {
    title: 'Selamat Sore Tercinta! 🌅💐',
    text: 'Selamat sore cinta! Melepas lelah hari ini bersama segarnya buket bunga spesial ini. Semoga harimu indah.',
    label: 'Sore 🌅',
  },
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

const FONT_OPTIONS = [
  { id: 'Montserrat', name: 'Montserrat', desc: 'Modern & Bersih' },
  { id: 'Playfair Display', name: 'Playfair', desc: 'Klasik & Elegan' },
  { id: 'Great Vibes', name: 'Great Vibes', desc: 'Kaligrafi Romantis' },
  { id: 'Georgia', name: 'Georgia', desc: 'Anggun & Hangat' },
  { id: 'Arial', name: 'Arial', desc: 'Simpel & Rapi' },
  { id: 'Times New Roman', name: 'Times', desc: 'Formal & Megah' },
];

const TEXT_COLORS = [
  '#1E293B', '#4A2515', '#8B5A3C', '#B8860B', '#15803D',
  '#BE185D', '#6D28D9', '#0284C7',
];

export default function MobileCardEditorModal({ isOpen, onClose }: Props) {
  const { design, setText } = useDesign();

  const [activeTab, setActiveTab] = useState<'text' | 'font' | 'style'>('text');
  const [content, setContent] = useState(design.text.content || PRESET_MESSAGES[0].text);
  const [font, setFont] = useState(design.text.font || 'Montserrat');
  const [fontSize, setFontSize] = useState<number>(design.text.size || 13);
  const [cardScale, setCardScale] = useState<number>(design.text.cardScale ?? 1.0);
  const [cardStyle, setCardStyle] = useState<'simple' | 'elegant'>(design.text.cardStyle || 'simple');
  const [textColor, setTextColor] = useState<string>(design.text.color || '#1E293B');

  if (!isOpen) return null;

  const handleApplyPreset = (p: typeof PRESET_MESSAGES[0]) => {
    setContent(p.text);
    setText({ content: p.text });
  };

  const handleFontSizeChange = (delta: number) => {
    const next = Math.max(10, Math.min(24, fontSize + delta));
    setFontSize(next);
    setText({ size: next });
  };

  const handleCardScaleChange = (delta: number) => {
    const next = Math.max(0.6, Math.min(2.0, Number((cardScale + delta).toFixed(2))));
    setCardScale(next);
    setText({ cardScale: next });
  };

  const handleQuickPosition = (cx: number, cy: number) => {
    setText({ cardX: cx, cardY: cy });
  };

  const handleSave = () => {
    setText({
      content,
      font,
      size: fontSize,
      cardScale,
      cardStyle,
      color: textColor,
    });
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
                <h3 className="ms-title">Kartu Ucapan Buket</h3>
                <p className="ms-subtitle">Tulis pesan, atur font, ukuran & gaya kartu</p>
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
            {/* Live Mini Preview */}
            <div
              style={{
                borderRadius: '14px',
                border: cardStyle === 'elegant' ? '1.5px solid #D4AF37' : '1.5px solid #E2E8F0',
                background: cardStyle === 'elegant' ? 'linear-gradient(135deg, #FFFDF8, #FAF3E3)' : '#FFFFFF',
                padding: '12px 14px',
                marginBottom: '14px',
                boxShadow: '0 3px 12px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    letterSpacing: '0.6px',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: cardStyle === 'elegant' ? '#FEF3C7' : '#F1F5F9',
                    color: cardStyle === 'elegant' ? '#B45309' : '#475569',
                    textTransform: 'uppercase',
                  }}
                >
                  {cardStyle === 'elegant' ? '✦ Luxury Gold Foil' : 'Minimalis Klip'}
                </span>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                  {font} • {fontSize}px • {Math.round(cardScale * 100)}%
                </span>
              </div>
              <p
                style={{
                  fontFamily: font,
                  fontSize: `${Math.max(11, fontSize * 0.9)}px`,
                  color: textColor,
                  margin: 0,
                  lineHeight: 1.45,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontStyle: font === 'Great Vibes' ? 'italic' : 'normal',
                }}
              >
                {content || 'Pesan kartu ucapan buket akan muncul di sini...'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="ms-tab-bar">
              <button
                type="button"
                className={`ms-tab-btn ${activeTab === 'text' ? 'ms-tab-btn-active' : ''}`}
                onClick={() => setActiveTab('text')}
              >
                <Mail size={13} />
                <span>Pesan</span>
              </button>
              <button
                type="button"
                className={`ms-tab-btn ${activeTab === 'font' ? 'ms-tab-btn-active' : ''}`}
                onClick={() => setActiveTab('font')}
              >
                <Type size={13} />
                <span>Font & Ukuran</span>
              </button>
              <button
                type="button"
                className={`ms-tab-btn ${activeTab === 'style' ? 'ms-tab-btn-active' : ''}`}
                onClick={() => setActiveTab('style')}
              >
                <Palette size={13} />
                <span>Gaya & Posisi</span>
              </button>
            </div>

            {/* TAB 1: TEXT & PRESETS */}
            {activeTab === 'text' && (
              <div>
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
                    maxLength={200}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#94A3B8' }}>
                    <span>*Otomatis dicetak pada kartu ucapan</span>
                    <span>{content.length}/200 karakter</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FONT & SIZES */}
            {activeTab === 'font' && (
              <div>
                {/* 1. Font Size Control */}
                <div className="ms-control-card">
                  <div className="ms-control-header">
                    <span className="ms-control-title">
                      <Type size={14} style={{ color: '#4F46E5' }} />
                      Ukuran Tulisan Kartu
                    </span>
                    <span className="ms-control-badge">{fontSize}px</span>
                  </div>
                  <div className="ms-slider-stepper-row">
                    <button
                      type="button"
                      className="ms-stepper-btn"
                      onClick={() => handleFontSizeChange(-1)}
                      disabled={fontSize <= 10}
                      title="Perkecil Font"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="range"
                      min={10}
                      max={22}
                      step={1}
                      value={fontSize}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFontSize(val);
                        setText({ size: val });
                      }}
                      className="ms-range-input"
                    />
                    <button
                      type="button"
                      className="ms-stepper-btn"
                      onClick={() => handleFontSizeChange(1)}
                      disabled={fontSize >= 22}
                      title="Perbesar Font"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* 2. Card Scale Control */}
                <div className="ms-control-card">
                  <div className="ms-control-header">
                    <span className="ms-control-title">
                      <Maximize2 size={14} style={{ color: '#059669' }} />
                      Skala Ukuran Kartu
                    </span>
                    <span className="ms-control-badge" style={{ color: '#059669', background: '#ECFDF5' }}>
                      {Math.round(cardScale * 100)}%
                    </span>
                  </div>
                  <div className="ms-slider-stepper-row">
                    <button
                      type="button"
                      className="ms-stepper-btn"
                      onClick={() => handleCardScaleChange(-0.05)}
                      disabled={cardScale <= 0.6}
                      title="Perkecil Kartu"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="range"
                      min={60}
                      max={180}
                      step={5}
                      value={Math.round(cardScale * 100)}
                      onChange={(e) => {
                        const val = Number(e.target.value) / 100;
                        setCardScale(val);
                        setText({ cardScale: val });
                      }}
                      className="ms-range-input"
                      style={{ accentColor: '#059669' }}
                    />
                    <button
                      type="button"
                      className="ms-stepper-btn"
                      onClick={() => handleCardScaleChange(0.05)}
                      disabled={cardScale >= 1.8}
                      title="Perbesar Kartu"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* 3. Font Family Grid */}
                <div style={{ marginBottom: '10px' }}>
                  <p className="ms-preset-title">Pilih Jenis Huruf (Font)</p>
                  <div className="ms-font-grid">
                    {FONT_OPTIONS.map((f) => {
                      const isSelected = font === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          className={`ms-font-card ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            setFont(f.id);
                            setText({ font: f.id });
                          }}
                        >
                          <span
                            className="ms-font-name"
                            style={{
                              fontFamily: f.id,
                              fontStyle: f.id === 'Great Vibes' ? 'italic' : 'normal',
                            }}
                          >
                            {f.name}
                          </span>
                          <span className="ms-font-preview">{f.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: STYLE & POSITION */}
            {activeTab === 'style' && (
              <div>
                {/* Card Visual Design */}
                <div style={{ marginBottom: '14px' }}>
                  <p className="ms-preset-title">Desain Kertas Kartu</p>
                  <div className="ms-card-style-grid">
                    <button
                      type="button"
                      className={`ms-card-style-card ${cardStyle === 'simple' ? 'active' : ''}`}
                      onClick={() => {
                        setCardStyle('simple');
                        setText({ cardStyle: 'simple' });
                      }}
                    >
                      <span className="ms-card-style-pill ms-pill-simple">Minimalis</span>
                      <div className="ms-card-style-name">Kartu Putih Klip</div>
                      <div className="ms-card-style-desc">Kertas putih bersih dengan klip modern</div>
                    </button>

                    <button
                      type="button"
                      className={`ms-card-style-card ${cardStyle === 'elegant' ? 'active' : ''}`}
                      onClick={() => {
                        setCardStyle('elegant');
                        setText({ cardStyle: 'elegant' });
                      }}
                    >
                      <span className="ms-card-style-pill ms-pill-gold">Luxury Gold</span>
                      <div className="ms-card-style-name">Emas & Krem</div>
                      <div className="ms-card-style-desc">Kertas linen krem & list emas ganda</div>
                    </button>
                  </div>
                </div>

                {/* Text Color Swatches */}
                <div style={{ marginBottom: '14px' }}>
                  <p className="ms-preset-title">Warna Tulisan</p>
                  <div className="ms-color-row">
                    {TEXT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`ms-color-btn ${textColor === c ? 'active' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => {
                          setTextColor(c);
                          setText({ color: c });
                        }}
                        title={c}
                      >
                        {textColor === c && <Check size={14} style={{ color: '#FFFFFF' }} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position Shortcuts */}
                <div style={{ marginBottom: '10px' }}>
                  <p className="ms-preset-title">Pintasan Posisi Kartu</p>
                  <div className="ms-pos-grid">
                    <button
                      type="button"
                      className="ms-pos-btn"
                      onClick={() => handleQuickPosition(300, 495)}
                    >
                      ⬇️ Bawah (Pita)
                    </button>
                    <button
                      type="button"
                      className="ms-pos-btn"
                      onClick={() => handleQuickPosition(300, 110)}
                    >
                      ⬆️ Atas
                    </button>
                    <button
                      type="button"
                      className="ms-pos-btn"
                      onClick={() => handleQuickPosition(145, 160)}
                    >
                      ↖️ Kiri Atas
                    </button>
                    <button
                      type="button"
                      className="ms-pos-btn"
                      onClick={() => handleQuickPosition(455, 160)}
                    >
                      ↗️ Kanan Atas
                    </button>
                    <button
                      type="button"
                      className="ms-pos-btn"
                      onClick={() => handleQuickPosition(300, 300)}
                    >
                      🎯 Tengah
                    </button>
                    <button
                      type="button"
                      className="ms-pos-btn"
                      onClick={() => handleQuickPosition(300, 495)}
                    >
                      <RotateCcw size={12} /> Reset
                    </button>
                  </div>
                  <p style={{ marginTop: '8px', fontSize: '11px', color: '#94A3B8' }}>
                    💡 Kartu juga bisa Anda geser langsung (drag & drop) di area kanvas editor!
                  </p>
                </div>
              </div>
            )}
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
              <span>Simpan & Pasang Kartu</span>
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
