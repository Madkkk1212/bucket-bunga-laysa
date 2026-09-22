'use client';

import { useDesign } from '../../context/DesignContext';
import NavigationButtons from '../designer/NavigationButtons';
import { Sparkles, Move, GraduationCap, Heart, RotateCcw } from 'lucide-react';
import SmartNumberInput from '../ui/SmartNumberInput';

const FONT_OPTIONS = [
  'Montserrat',
  'Playfair Display',
  'Georgia',
  'Arial',
  'Times New Roman',
  'Courier New',
];

const TEXT_COLORS = [
  '#1E293B', '#4A2515', '#8B5A3C', '#B8860B', '#15803D',
  '#BE185D', '#6D28D9', '#0284C7', '#334155', '#D97706',
];

interface CardTemplate {
  id: string;
  name: string;
  tag: string;
  icon: typeof GraduationCap;
  content: string;
  font: string;
  cardStyle: 'simple' | 'elegant';
  color: string;
  size: number;
}

const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: 'graduation',
    name: 'Wisuda & Kelulusan',
    tag: 'Contoh 1 • Elegan',
    icon: GraduationCap,
    content: 'Happy Graduation! 🎓✨\nSelamat atas pencapaian luar biasamu.\nSemoga langkah ke depan selalu sukses!\n~ Sahabat Tercinta ~',
    font: 'Playfair Display',
    cardStyle: 'elegant',
    color: '#4A2515',
    size: 13,
  },
  {
    id: 'birthday',
    name: 'Ulang Tahun & Kasih Sayang',
    tag: 'Contoh 2 • Romantis',
    icon: Heart,
    content: 'Happy Birthday, My Dear! 🎂🌸\nSemoga harimu seindah bunga ini,\npenuh tawa, cinta & bahagia selamanya.\n~ Forever & Always ❤️ ~',
    font: 'Montserrat',
    cardStyle: 'simple',
    color: '#1E293B',
    size: 13,
  },
];

export default function StepText() {
  const { design, setText, setStep } = useDesign();
  const { text } = design;

  const handleApplyTemplate = (tpl: CardTemplate) => {
    setText({
      content: tpl.content,
      font: tpl.font,
      cardStyle: tpl.cardStyle,
      color: tpl.color,
      size: tpl.size,
    });
  };

  const handleQuickPosition = (cx: number, cy: number) => {
    setText({ cardX: cx, cardY: cy });
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <h2 className="step-title">Kartu Ucapan Buket</h2>
        <p className="step-desc">
          Kartu ucapan eksklusif seperti kartu nama pada buket, dapat diseret & diatur bebas posisinya.
        </p>
      </div>

      {/* 2 Preset Templates (Contoh Rapi) */}
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} className="text-amber-500" />
          Pilih Contoh Template Kartu Rapi (2 Pilihan)
        </label>
        <div className="card-preset-grid">
          {CARD_TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            const isSelected = text.content === tpl.content;

            return (
              <button
                key={tpl.id}
                type="button"
                className={`card-preset-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleApplyTemplate(tpl)}
              >
                <div className="card-preset-header">
                  <span className="card-preset-tag">{tpl.tag}</span>
                  <Icon size={14} className="card-preset-icon" />
                </div>
                <h4 className="card-preset-title">{tpl.name}</h4>
                <p className="card-preset-preview">
                  {tpl.content.split('\n')[0]}
                </p>
                <span className="card-preset-apply-btn">
                  {isSelected ? '✓ Terpasang' : 'Gunakan Template'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag & Position Interactive Notice */}
      <div className="card-drag-notice">
        <div className="card-drag-notice-icon">
          <Move size={16} />
        </div>
        <div className="card-drag-notice-text">
          <strong>Bisa Diseret Bebas di Layar Canvas!</strong>
          <p>Klik dan seret (drag & drop) kartu ucapan di area pratinjau untuk menempatkannya di manapun.</p>
        </div>
      </div>

      {/* Quick Position Shortcuts */}
      <div className="form-group">
        <label className="form-label">Pintasan Posisi Kartu</label>
        <div className="card-position-shortcuts">
          <button
            type="button"
            className="pos-shortcut-btn"
            onClick={() => handleQuickPosition(300, 495)}
            title="Letakkan di bawah dekat pita"
          >
            ⬇️ Bawah (Pita)
          </button>
          <button
            type="button"
            className="pos-shortcut-btn"
            onClick={() => handleQuickPosition(300, 110)}
            title="Letakkan di atas buket"
          >
            ⬆️ Atas
          </button>
          <button
            type="button"
            className="pos-shortcut-btn"
            onClick={() => handleQuickPosition(145, 160)}
            title="Letakkan di kiri atas"
          >
            ↖️ Kiri Atas
          </button>
          <button
            type="button"
            className="pos-shortcut-btn"
            onClick={() => handleQuickPosition(455, 160)}
            title="Letakkan di kanan atas"
          >
            ↗️ Kanan Atas
          </button>
          <button
            type="button"
            className="pos-shortcut-btn reset-pos"
            onClick={() => handleQuickPosition(300, 495)}
            title="Reset ke posisi default"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Card Visual Style (Putih vs Gold Foil) */}
      <div className="form-group">
        <label className="form-label">Desain Kartu Ucapan</label>
        <div className="card-style-picker">
          <label
            className={`card-style-option ${text.cardStyle === 'simple' || !text.cardStyle ? 'active' : ''}`}
            onClick={() => setText({ cardStyle: 'simple' })}
          >
            <input
              type="radio"
              name="cardStyle"
              checked={text.cardStyle === 'simple' || !text.cardStyle}
              onChange={() => setText({ cardStyle: 'simple' })}
            />
            <div className="card-style-preview style-simple">
              <span className="card-style-chip">KLIP</span>
              <span className="card-style-label">Kartu Putih Minimalis</span>
              <span className="card-style-sub">Kertas putih bersih, klip metalik modern</span>
            </div>
          </label>

          <label
            className={`card-style-option ${text.cardStyle === 'elegant' ? 'active' : ''}`}
            onClick={() => setText({ cardStyle: 'elegant' })}
          >
            <input
              type="radio"
              name="cardStyle"
              checked={text.cardStyle === 'elegant'}
              onChange={() => setText({ cardStyle: 'elegant' })}
            />
            <div className="card-style-preview style-elegant">
              <span className="card-style-chip gold">EMAS</span>
              <span className="card-style-label">Kartu Luxury Gold Foil</span>
              <span className="card-style-sub">Kertas linen krem, bingkai emas ganda & ornamen</span>
            </div>
          </label>
        </div>
      </div>

      {/* Text Area */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label htmlFor="text-content" className="form-label" style={{ margin: 0 }}>
            Tulis / Edit Pesan Kartu Ucapan
          </label>
          <span className="char-count">{text.content.length}/200</span>
        </div>
        <textarea
          id="text-content"
          className="text-input"
          placeholder="Tulis pesan personal Anda di sini..."
          maxLength={200}
          value={text.content}
          onChange={(e) => setText({ content: e.target.value })}
          rows={4}
        />
      </div>

      {/* Font Selection */}
      <div className="form-group">
        <label htmlFor="text-font" className="form-label">Gaya Tulisan (Font)</label>
        <select
          id="text-font"
          className="form-select"
          value={text.font}
          onChange={(e) => setText({ font: e.target.value })}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Card Scale Slider & Input */}
      <div className="form-group">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label htmlFor="card-scale" className="form-label" style={{ marginBottom: 0 }}>
            Skala Ukuran Kartu
          </label>
          {(text.cardScale ?? 1.0) !== 1.0 && (
            <button
              type="button"
              className="scale-reset-chip"
              onClick={() => setText({ cardScale: 1.0 })}
              title="Kembalikan ukuran kartu ke 100%"
            >
              Reset
            </button>
          )}
        </div>
        <div className="slider-control-row">
          <button
            type="button"
            className="scale-step-btn"
            onClick={() =>
              setText({
                cardScale: Math.max(0.6, Number(((text.cardScale ?? 1.0) - 0.05).toFixed(2))),
              })
            }
            title="Perkecil 5%"
          >
            −
          </button>
          <input
            id="card-scale"
            type="range"
            className="range-slider"
            min={60}
            max={200}
            step={1}
            value={Math.round((text.cardScale ?? 1.0) * 100)}
            onChange={(e) => setText({ cardScale: Number(e.target.value) / 100 })}
          />
          <SmartNumberInput
            value={Math.round((text.cardScale ?? 1.0) * 100)}
            min={60}
            max={200}
            step={1}
            unit="%"
            onChange={(val) => setText({ cardScale: val / 100 })}
            ariaLabel="Ketik skala ukuran kartu (%)"
            title="Ketik skala ukuran kartu (%)"
          />
          <button
            type="button"
            className="scale-step-btn"
            onClick={() =>
              setText({
                cardScale: Math.min(2.0, Number(((text.cardScale ?? 1.0) + 0.05).toFixed(2))),
              })
            }
            title="Perbesar 5%"
          >
            +
          </button>
        </div>
        <div className="range-labels">
          <span>Kompak (60%)</span>
          <span>Standar (100%)</span>
          <span>Besar (200%)</span>
        </div>
      </div>

      {/* Font Size */}
      <div className="form-group">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label htmlFor="text-size" className="form-label" style={{ marginBottom: 0 }}>
            Ukuran Tulisan Kartu
          </label>
          {(text.size || 13) !== 13 && (
            <button
              type="button"
              className="scale-reset-chip"
              onClick={() => setText({ size: 13 })}
              title="Kembalikan ukuran font ke default 13px"
            >
              Reset
            </button>
          )}
        </div>
        <div className="slider-control-row">
          <button
            type="button"
            className="scale-step-btn"
            onClick={() => setText({ size: Math.max(11, (text.size || 13) - 1) })}
            title="Perkecil 1px"
          >
            −
          </button>
          <input
            id="text-size"
            type="range"
            className="range-slider"
            min={11}
            max={24}
            step={1}
            value={text.size || 13}
            onChange={(e) => setText({ size: Number(e.target.value) })}
          />
          <SmartNumberInput
            value={text.size || 13}
            min={11}
            max={24}
            step={1}
            unit="px"
            onChange={(val) => setText({ size: val })}
            ariaLabel="Ketik ukuran tulisan kartu (px)"
            title="Ketik ukuran tulisan kartu (px)"
          />
          <button
            type="button"
            className="scale-step-btn"
            onClick={() => setText({ size: Math.min(24, (text.size || 13) + 1) })}
            title="Perbesar 1px"
          >
            +
          </button>
        </div>
        <div className="range-labels">
          <span>Kecil (11px)</span>
          <span>Standar (13px)</span>
          <span>Besar (24px)</span>
        </div>
      </div>

      {/* Text Color */}
      <div className="form-group">
        <label className="form-label">Warna Tulisan</label>
        <div className="color-palettes">
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-swatch ${text.color === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setText({ color: c })}
              aria-label={`Warna ${c}`}
            />
          ))}
          <input
            id="text-color-picker"
            type="color"
            value={text.color}
            onChange={(e) => setText({ color: e.target.value })}
            className="color-picker-input"
            title="Pilih warna kustom"
          />
        </div>
      </div>

      <NavigationButtons
        currentStep={3}
        totalSteps={5}
        onBack={() => setStep(2)}
        onNext={() => setStep(4)}
        nextLabel="Pratinjau Buket"
      />
    </div>
  );
}
