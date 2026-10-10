'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { PopupBannerItem } from '@/lib/popupBanners';

export default function InitialPopupModal() {
  const [banners, setBanners] = useState<PopupBannerItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Cek apakah pengunjung sudah menutup popup di sesi ini atau memilih "Jangan tampilkan hari ini"
    const dismissedUntil = localStorage.getItem('laysa_popup_dismissed_until');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) return;

    const dismissed = sessionStorage.getItem('laysa_initial_popup_dismissed');
    if (dismissed === 'true') return;

    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/popups');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
            setBanners(data.banners.slice(0, 3)); // Maksimal 3 slide
            // Berikan delay singkat (600ms) agar halaman siap sebelum popup muncul
            setTimeout(() => {
              setIsOpen(true);
            }, 600);
          }
        }
      } catch {
        // Abaikan jika offline
      }
    };

    fetchBanners();
  }, []);

  // Autoplay carousel jika slide lebih dari 1
  useEffect(() => {
    if (!isOpen || banners.length <= 1) return;

    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isOpen, banners.length]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const handleClose = (dontShowToday = false) => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('laysa_initial_popup_dismissed', 'true');
      if (dontShowToday) {
        localStorage.setItem(
          'laysa_popup_dismissed_until',
          (Date.now() + 24 * 60 * 60 * 1000).toString()
        );
      }
    }
  };

  // Jika tidak ada gambar banner aktif atau modal ditutup, jangan render apapun
  if (!isOpen || banners.length === 0) {
    return null;
  }

  const activeBanner = banners[currentSlide] || banners[0];

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
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={() => handleClose(false)}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup Silang di Kanan Atas */}
        <button
          type="button"
          onClick={() => handleClose(false)}
          aria-label="Tutup popup"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.6)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <X size={18} />
        </button>

        {/* ── Area Gambar Slide ── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 5',
            maxHeight: '68vh',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {activeBanner.link_url ? (
            <a
              href={activeBanner.link_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              <img
                src={activeBanner.image_url}
                alt={activeBanner.title || `Slide ${currentSlide + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  background: '#0f0a19',
                }}
              />
            </a>
          ) : (
            <img
              src={activeBanner.image_url}
              alt={activeBanner.title || `Slide ${currentSlide + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#0f0a19',
              }}
            />
          )}

          {/* Navigasi Panah Kiri & Kanan (Jika Slide > 1) */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Slide sebelumnya"
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.85)',
                  color: '#1e1b4b',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Slide selanjutnya"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.85)',
                  color: '#1e1b4b',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Indikator Titik-Titik Slide (Dots) */}
          {banners.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                background: 'rgba(0, 0, 0, 0.45)',
                padding: '4px 10px',
                borderRadius: '999px',
                backdropFilter: 'blur(4px)',
              }}
            >
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    width: idx === currentSlide ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '999px',
                    background: idx === currentSlide ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  aria-label={`Buka slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer Tombol Tutup & Opsi Hari Ini ── */}
        <div
          style={{
            padding: '12px 18px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #f1f5f9',
            fontSize: '0.82rem',
          }}
        >
          <button
            type="button"
            onClick={() => handleClose(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 500,
              padding: '6px 0',
            }}
          >
            Jangan tampilkan lagi hari ini
          </button>

          <button
            type="button"
            onClick={() => handleClose(false)}
            style={{
              padding: '7px 18px',
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
