'use client';

import { CheckCircle2, Edit3, ShieldCheck } from 'lucide-react';
import { useDesign } from '@/context/DesignContext';
import { getBucketSize } from '@/data/buckets';
import NavigationButtons from '../designer/NavigationButtons';
import { useLanguage } from '@/context/LanguageContext';

interface StepPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function StepPreview({ canvasRef }: StepPreviewProps) {
  const { t, isEn } = useLanguage();
  const { design, getTotalFlowers, setStep, saveFinal2D, resetToEdit2D } = useDesign();
  const total = getTotalFlowers();
  const bucket = getBucketSize(design.bucketSize);

  const handleSaveFinal = () => {
    if (canvasRef?.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      saveFinal2D(dataUrl, canvasRef.current.width, canvasRef.current.height);
    }
    setStep(5);
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            {isEn ? 'DESIGN CONFIRMATION' : 'KONFIRMASI DESAIN'}
          </span>
        </div>
        <h2 className="step-title">{t('step_4_title')}</h2>
        <p className="step-desc">{t('step_4_desc')}</p>
      </div>

      <div className="preview-summary-card">
        <div className="summary-row">
          <span className="summary-key">Jenis Pembungkus</span>
          <span className="summary-val">{bucket.label}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">Total Bunga Terangkai</span>
          <span className="summary-val">{total} tangkai</span>
        </div>
        {design.text.content && (
          <div className="summary-row">
            <span className="summary-key">Pesan Kartu Ucapan</span>
            <span className="summary-val" style={{ fontStyle: 'italic', maxWidth: '200px', textAlign: 'right' }}>
              &quot;{design.text.content}&quot;
            </span>
          </div>
        )}
        <div className="summary-row">
          <span className="summary-key">Status Produk</span>
          <span className="summary-val font-semibold text-emerald-600">
            {design.final2D.status === 'final' ? 'FINAL ✓' : 'Siap Difinalisasi'}
          </span>
        </div>
      </div>

      <div className="preview-tips">
        <div className="tip-item">
          <ShieldCheck size={16} className="tip-icon text-emerald-600" />
          <p>
            <strong>Periksa Rangkaian:</strong> Desain pada kanvas ini adalah hasil akhir yang akan disimpan dan diunduh. Anda masih dapat kembali mengedit posisi bunga kapan saja.
          </p>
        </div>
      </div>

      <div className="preview-actions space-y-2">
        <button
          type="button"
          className="btn btn-primary full-width-btn py-3 text-base flex items-center justify-center gap-2 shadow-md"
          onClick={handleSaveFinal}
          id="btn-save-final-2d"
        >
          <CheckCircle2 size={18} />
          {t('finalize_btn')}
        </button>

        <button
          type="button"
          className="btn btn-secondary full-width-btn flex items-center justify-center gap-2"
          onClick={resetToEdit2D}
          id="btn-edit-2d-from-preview"
        >
          <Edit3 size={15} />
          {t('edit_again')}
        </button>
      </div>

      <NavigationButtons
        currentStep={4}
        totalSteps={5}
        onBack={() => setStep(3)}
        onNext={handleSaveFinal}
        nextLabel="Simpan & Lanjut"
      />
    </div>
  );
}
