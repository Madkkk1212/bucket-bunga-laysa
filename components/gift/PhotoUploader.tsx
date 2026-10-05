'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, ChevronLeft, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';

export interface ClientPhoto {
  id: string;
  dataUrl: string;
  altText: string;
}

interface PhotoUploaderProps {
  photos: ClientPhoto[];
  onChange: (photos: ClientPhoto[]) => void;
  maxPhotos?: number;
  onUpgradeClick?: () => void;
  isEn?: boolean;
}

async function compressImageClient(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotoUploader({
  photos,
  onChange,
  maxPhotos = 1,
  onUpgradeClick,
  isEn = false,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const availableSlots = maxPhotos - photos.length;
    if (availableSlots <= 0) {
      setError(
        isEn
          ? `Maximum ${maxPhotos} photo(s) reached for your package.`
          : `Batas maksimal ${maxPhotos} foto tercapai untuk paket Anda.`
      );
      return;
    }

    setIsProcessing(true);
    const newPhotos: ClientPhoto[] = [...photos];

    try {
      const filesToProcess = Array.from(files).slice(0, availableSlots);
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;
        const compressedDataUrl = await compressImageClient(file);
        newPhotos.push({
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          dataUrl: compressedDataUrl,
          altText: '',
        });
      }
      onChange(newPhotos);
    } catch {
      setError(isEn ? 'Failed to process images.' : 'Gagal memproses gambar.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
  };

  const updateCaption = (id: string, text: string) => {
    onChange(
      photos.map((p) => (p.id === id ? { ...p, altText: text.slice(0, 80) } : p))
    );
  };

  const movePhoto = (idx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= photos.length) return;
    const reordered = [...photos];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);
    onChange(reordered);
  };

  return (
    <div className="gift-photo-uploader">
      {/* Header */}
      <div className="gift-photo-header">
        <div className="gift-photo-heading">
          <div className="gift-photo-heading-icon">
            <ImageIcon size={14} />
          </div>
          <h4 className="gift-photo-heading-title">
            {isEn ? 'Memory Photos' : 'Foto Kenangan'}
          </h4>
        </div>

        <div className="gift-photo-meta">
          <span className="gift-photo-count">
            {photos.length} / {maxPhotos}
          </span>
          {maxPhotos < 6 && (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="gift-photo-upgrade"
            >
              <Sparkles size={11} />
              <span>VIP · 6 Foto</span>
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={maxPhotos > 1}
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Grid */}
      <div className="gift-photo-grid">
        {photos.map((photo, idx) => (
          <div key={photo.id} className="gift-photo-card">
            <div className="gift-photo-thumb-wrap">
              <img src={photo.dataUrl} alt="Kenangan" />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="gift-photo-del-btn"
                title="Hapus foto"
              >
                <X size={13} />
              </button>
            </div>

            <input
              type="text"
              value={photo.altText}
              onChange={(e) => updateCaption(photo.id, e.target.value)}
              placeholder={isEn ? 'Add caption...' : 'Tulis pesan singkat...'}
              className="gift-photo-caption-input"
              maxLength={80}
            />

            {/* Reorder arrows */}
            {photos.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#9ca3af', paddingTop: '2px' }}>
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => movePhoto(idx, 'left')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span>#{idx + 1}</span>
                <button
                  type="button"
                  disabled={idx === photos.length - 1}
                  onClick={() => movePhoto(idx, 'right')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: idx === photos.length - 1 ? 0.3 : 1 }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="gift-photo-upload-btn"
          >
            <div className="gift-photo-upload-icon">
              <Upload size={16} />
            </div>
            <span className="gift-photo-upload-label">
              {isProcessing
                ? (isEn ? 'Processing...' : 'Memproses...')
                : (isEn ? 'Add Photo' : 'Unggah Foto')}
            </span>
            <span className="gift-photo-upload-format">JPG/PNG/WebP</span>
          </button>
        )}
      </div>

      {error && (
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
