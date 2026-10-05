'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import type { TemplatePhotoStyle } from '@/types/giftConfig';

export interface PhotoItem {
  id: string;
  url: string;
  altText?: string;
  displayOrder?: number;
}

interface PhotoDisplayProps {
  photos: PhotoItem[];
  photoStyle?: TemplatePhotoStyle;
  isEn?: boolean;
}

export default function PhotoDisplay({
  photos,
  photoStyle = { style: 'polaroid', maxRotation: 3 },
  isEn = false,
}: PhotoDisplayProps) {
  const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);

  if (!photos || photos.length === 0) return null;

  const styleType = photoStyle.style || 'polaroid';

  return (
    <div className="gift-photos-section my-8 w-full max-w-2xl mx-auto px-4">
      {/* Section Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-100">
          <ImageIcon size={13} />
          <span>{isEn ? 'Sweet Memories' : 'Kenangan Manis Bersama'}</span>
        </span>
      </div>

      {/* ─── 1. POLAROID STYLE ─── */}
      {styleType === 'polaroid' && (
        <div className="flex flex-wrap justify-center items-center gap-6 py-2">
          {photos.map((photo, idx) => {
            const maxRot = photoStyle.maxRotation ?? 3;
            // Alternating rotation for lively polaroid feel
            const rotations = [-maxRot, maxRot, -maxRot * 0.7, maxRot * 0.8, -maxRot * 0.5, maxRot * 0.6];
            const rot = rotations[idx % rotations.length];

            return (
              <div
                key={photo.id || idx}
                onClick={() => setLightboxPhoto(photo)}
                className="cursor-pointer group relative bg-white p-3.5 pb-5 rounded-sm shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:rotate-0"
                style={{
                  transform: `rotate(${rot}deg)`,
                  width: photos.length === 1 ? '320px' : '240px',
                  maxWidth: '90vw',
                }}
              >
                {/* Simulated Washi Tape on top */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-pink-100/70 border border-pink-200/50 backdrop-blur-xs transform -rotate-2 pointer-events-none"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                />

                <div className="aspect-square w-full overflow-hidden bg-stone-100 rounded-xs relative">
                  <img
                    src={photo.url}
                    alt={photo.altText || 'Kenangan manis'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <ZoomIn size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                  </div>
                </div>

                {photo.altText && (
                  <p className="mt-3 text-center text-xs font-handwriting text-stone-700 font-medium truncate px-1">
                    {photo.altText}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── 2. CAROUSEL STYLE ─── */}
      {styleType === 'carousel' && (
        <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-pink-100 overflow-hidden">
          <div className="relative aspect-4/3 sm:aspect-16/10 w-full rounded-xl overflow-hidden bg-stone-900 flex items-center justify-center">
            {photos[activeCarouselIdx] && (
              <img
                src={photos[activeCarouselIdx].url}
                alt={photos[activeCarouselIdx].altText || 'Kenangan'}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setLightboxPhoto(photos[activeCarouselIdx])}
              />
            )}

            {/* Navigation buttons */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveCarouselIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveCarouselIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                  aria-label="Next photo"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-xs">
              {activeCarouselIdx + 1} / {photos.length}
            </div>
          </div>

          {photos[activeCarouselIdx]?.altText && (
            <p className="mt-3 text-center text-sm text-stone-700 italic font-medium px-4">
              &ldquo;{photos[activeCarouselIdx].altText}&rdquo;
            </p>
          )}

          {/* Dots Indicator */}
          {photos.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveCarouselIdx(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeCarouselIdx ? 'w-6 bg-pink-600' : 'w-2 bg-pink-200 hover:bg-pink-300'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 3. GRID STYLE ─── */}
      {styleType === 'grid' && (
        <div
          className={`grid gap-3 ${
            photos.length === 1
              ? 'grid-cols-1 max-w-sm mx-auto'
              : photos.length === 2
              ? 'grid-cols-2'
              : photos.length === 3
              ? 'grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-3'
          }`}
        >
          {photos.map((photo, idx) => (
            <div
              key={photo.id || idx}
              onClick={() => setLightboxPhoto(photo)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-stone-100 shadow-sm hover:shadow-md cursor-pointer border border-pink-100"
            >
              <img
                src={photo.url}
                alt={photo.altText || 'Kenangan'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
              </div>
              {photo.altText && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs truncate">{photo.altText}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── LIGHTBOX MODAL ─── */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
            aria-label="Close photo"
          >
            <X size={22} />
          </button>

          <div
            className="max-w-3xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.altText || 'Kenangan'}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            {lightboxPhoto.altText && (
              <p className="mt-3 text-white text-sm text-center px-4 max-w-lg">
                {lightboxPhoto.altText}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
