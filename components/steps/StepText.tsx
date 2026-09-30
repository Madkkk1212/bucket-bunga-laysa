'use client';

import { useDesign } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';
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

export default function StepText() {
  const { design, setText, setStep } = useDesign();
  const { t } = useLanguage();
  const { text } = design;

  const cardTemplates: CardTemplate[] = [
    {
      id: 'graduation',
      name: t('card_tpl_grad_name'),
      tag: t('card_tpl_grad_tag'),
      icon: GraduationCap,
      content: t('card_tpl_grad_content'),
      font: 'Playfair Display',
      cardStyle: 'elegant',
      color: '#4A2515',
      size: 13,
    },
    {
      id: 'birthday',
      name: t('card_tpl_bday_name'),
      tag: t('card_tpl_bday_tag'),
      icon: Heart,
      content: t('card_tpl_bday_content'),
      font: 'Montserrat',
      cardStyle: 'simple',
      color: '#1E293B',
      size: 13,
    },
  ];

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
        <h2 className="step-title">{t('card_header_title')}</h2>
        <p className="step-desc">
          {t('card_header_sub')}
        </p>
      </div>

      {/* 2 Preset Templates (Contoh Rapi) */}
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} className="text-amber-500" />
          {t('card_preset_title')}
        </label>
        <div className="card-preset-grid">
          {cardTemplates.map((tpl) => {
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
                  {isSelected ? t('card_tpl_installed') : t('card_tpl_use')}
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
          <strong>{t('card_drag_notice_title')}</strong>
          <p>{t('card_drag_notice_desc')}</p>
        </div>
      </div>

      {/* Quick Position Shortcuts */}
      <div className="form-group">
        <label className="form-label">{t('card_shortcuts_title')}</label>
        <div className="card-position-shortcuts">
          <button
            type="button"
            className="pos-shortcut-btn"
            onClick={() => handleQuickPosition(300, 495)}
            title={t('card_pos_bottom')}
          >
            {t('card_pos_bottom')}
          </button>
          <button
            type="button"
            className="pos-shortcut-btn"
            onClick={() => handleQuickPosition(300, 110)}
            title={t('card_pos_top')}
          >
            {t('card_pos_top')}
          </button>
          <button
            type="button"
            className="pos-shortcut-btn"
            onClick={() => handleQuickPosition(145, 160)}
            title={t('card_pos_top_left')}
          >
            {t('card_pos_top_left')}
          </button>
          <button
            type="button"
            className="pos-shortcut-btn"
            onClick={() => handleQuickPosition(455, 160)}
            title={t('card_pos_top_right')}
          >
            {t('card_pos_top_right')}
          </button>
          <button
            type="button"
            className="pos-shortcut-btn reset-pos"
            onClick={() => handleQuickPosition(300, 495)}
            title="Reset"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Card Visual Style (Putih vs Gold Foil) */}
      <div className="form-group">
        <label className="form-label">{t('card_style_title')}</label>
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
              <span className="card-style-chip">CLIP</span>
              <span className="card-style-label">{t('card_style_simple_title')}</span>
              <span className="card-style-sub">{t('card_style_simple_sub')}</span>
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
              <span className="card-style-chip gold">GOLD</span>
              <span className="card-style-label">{t('card_style_elegant_title')}</span>
              <span className="card-style-sub">{t('card_style_elegant_sub')}</span>
            </div>
          </label>
        </div>
      </div>

      {/* Text Area */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label htmlFor="text-content" className="form-label" style={{ margin: 0 }}>
            {t('card_edit_label')}
          </label>
          <span className="char-count">{text.content.length}/200</span>
        </div>
        <textarea
          id="text-content"
          className="text-input"
          placeholder={t('card_edit_placeholder')}
          maxLength={200}
          value={text.content}
          onChange={(e) => setText({ content: e.target.value })}
          rows={4}
        />
      </div>

      {/* Font Selection */}
      <div className="form-group">
        <label htmlFor="text-font" className="form-label">{t('card_font_label')}</label>
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
            {t('card_scale_label')}
          </label>
          {(text.cardScale ?? 1.0) !== 1.0 && (
            <button
              type="button"
              className="scale-reset-chip"
              onClick={() => setText({ cardScale: 1.0 })}
              title="Reset"
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
            title="−5%"
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
            ariaLabel={t('card_scale_label')}
            title={t('card_scale_label')}
          />
          <button
            type="button"
            className="scale-step-btn"
            onClick={() =>
              setText({
                cardScale: Math.min(2.0, Number(((text.cardScale ?? 1.0) + 0.05).toFixed(2))),
              })
            }
            title="+5%"
          >
            +
          </button>
        </div>
        <div className="range-labels">
          <span>{t('card_scale_compact')}</span>
          <span>{t('card_scale_standard')}</span>
          <span>{t('card_scale_large')}</span>
        </div>
      </div>

      {/* Font Size */}
      <div className="form-group">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label htmlFor="text-size" className="form-label" style={{ marginBottom: 0 }}>
            {t('card_font_size_label')}
          </label>
          {(text.size || 13) !== 13 && (
            <button
              type="button"
              className="scale-reset-chip"
              onClick={() => setText({ size: 13 })}
              title="Reset"
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
            title="−1px"
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
            ariaLabel={t('card_font_size_label')}
            title={t('card_font_size_label')}
          />
          <button
            type="button"
            className="scale-step-btn"
            onClick={() => setText({ size: Math.min(24, (text.size || 13) + 1) })}
            title="+1px"
          >
            +
          </button>
        </div>
        <div className="range-labels">
          <span>{t('card_font_size_small')}</span>
          <span>{t('card_font_size_standard')}</span>
          <span>{t('card_font_size_large')}</span>
        </div>
      </div>

      {/* Text Color */}
      <div className="form-group">
        <label className="form-label">{t('card_color_label')}</label>
        <div className="color-palettes">
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-swatch ${text.color === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setText({ color: c })}
              aria-label={`Color ${c}`}
            />
          ))}
          <input
            id="text-color-picker"
            type="color"
            value={text.color}
            onChange={(e) => setText({ color: e.target.value })}
            className="color-picker-input"
            title={t('card_color_label')}
          />
        </div>
      </div>

      <NavigationButtons
        currentStep={3}
        totalSteps={5}
        onBack={() => setStep(2)}
        onNext={() => setStep(4)}
        nextLabel={t('card_preview_btn')}
      />
    </div>
  );
}
