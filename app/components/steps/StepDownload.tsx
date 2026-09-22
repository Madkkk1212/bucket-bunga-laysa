'use client';

import { useState } from 'react';
import { Download, RotateCcw, CheckCircle, Edit3, Sparkles } from 'lucide-react';
import { useDesign } from '../../context/DesignContext';
import { downloadDesign } from '../../utils/downloadUtils';
import NavigationButtons from '../designer/NavigationButtons';

interface StepDownloadProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function StepDownload({ canvasRef }: StepDownloadProps) {
  const { resetDesign, setStep, resetToEdit2D } = useDesign();
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [status, setStatus] = useState<'idle' | 'downloading' | 'done'>('idle');

  const handleDownload = async () => {
    setStatus('downloading');
    await downloadDesign(canvasRef, format);
    setTimeout(() => setStatus('done'), 800);
  };

  const handleReset = () => {
    resetDesign();
    setStep(1);
  };

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
  const filename = `bucket_bunga_laysa_${today}.${format}`;

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            PRODUK FINAL
          </span>
        </div>
        <h2 className="step-title">Unduh Hasil Rangkaian</h2>
        <p className="step-desc">Simpan kreasi buket bunga Anda dalam format gambar beresolusi tinggi (HD).</p>
      </div>

      {/* ─── FORMAT UNDUHAN ─── */}
      <div className="form-group">
        <label className="form-label">Format Gambar</label>
        <div className="format-options">
          <label className={`format-card ${format === 'png' ? 'selected' : ''}`}>
            <input
              id="format-png"
              type="radio"
              name="format"
              value="png"
              checked={format === 'png'}
              onChange={() => setFormat('png')}
            />
            <div className="format-info">
              <span className="format-name">PNG (Transparan)</span>
              <span className="format-desc">Latar transparan, kualitas HD jernih</span>
            </div>
          </label>
          <label className={`format-card ${format === 'jpg' ? 'selected' : ''}`}>
            <input
              id="format-jpg"
              type="radio"
              name="format"
              value="jpg"
              checked={format === 'jpg'}
              onChange={() => setFormat('jpg')}
            />
            <div className="format-info">
              <span className="format-name">JPG (Latar Bersih)</span>
              <span className="format-desc">Latar putih bersih, ukuran file ringan</span>
            </div>
          </label>
        </div>
      </div>

      {/* File info */}
      <div className="file-info-card">
        <div className="file-info-row">
          <span className="file-info-key">Nama File</span>
          <span className="file-info-val">{filename}</span>
        </div>
        <div className="file-info-row">
          <span className="file-info-key">Resolusi Kanvas</span>
          <span className="file-info-val">600 × 600px (1:1 Native HD)</span>
        </div>
        <div className="file-info-row">
          <span className="file-info-key">Kualitas</span>
          <span className="file-info-val">Ultra High (Lossless Master)</span>
        </div>
      </div>

      {/* Download button */}
      <button
        id="btn-download"
        className={`btn download-btn ${status === 'done' ? 'btn-success' : 'btn-primary'}`}
        onClick={handleDownload}
        disabled={status === 'downloading'}
      >
        {status === 'idle' && (
          <>
            <Download size={18} />
            Unduh Desain Buket ({format.toUpperCase()})
          </>
        )}
        {status === 'downloading' && (
          <>
            <span className="spinner" />
            Menyiapkan gambar HD...
          </>
        )}
        {status === 'done' && (
          <>
            <CheckCircle size={18} />
            Berhasil Diunduh! ✓
          </>
        )}
      </button>

      {status === 'done' && (
        <div className="success-banner">
          🎉 Gambar desain buket Anda berhasil disimpan ke perangkat!
        </div>
      )}

      {/* Order consultation note */}
      <div className="mt-4 p-3 rounded-lg bg-pink-50 border border-pink-200 text-xs text-pink-900 flex items-start gap-2.5">
        <Sparkles size={16} className="text-pink-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Ingin Merangkai Buket Nyata Ini?</p>
          <p className="text-pink-800 leading-relaxed">
            Kirimkan file gambar yang Anda unduh ke WhatsApp florist kami agar dapat dirangkai persis sesuai kreasi Anda!
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="download-actions">
        <button
          id="btn-edit-again"
          className="btn btn-secondary flex items-center justify-center gap-1.5"
          onClick={resetToEdit2D}
          title="Kembali ke kanvas editor untuk mengubah rangkaian bunga"
        >
          <Edit3 size={15} />
          Edit Kembali Desain
        </button>
        <button
          id="btn-new-design"
          className="btn btn-ghost flex items-center justify-center gap-1.5"
          onClick={handleReset}
        >
          <RotateCcw size={15} />
          Mulai Desain Baru
        </button>
      </div>

      <NavigationButtons
        currentStep={5}
        totalSteps={5}
        onBack={() => setStep(4)}
        onNext={() => {}}
      />
    </div>
  );
}
