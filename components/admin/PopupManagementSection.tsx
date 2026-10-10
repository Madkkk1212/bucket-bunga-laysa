'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Eye,
  Sliders,
} from 'lucide-react';
import type { PopupBannerItem } from '@/lib/popupBanners';

interface PopupManagementSectionProps {
  adminKey?: string;
}

export default function PopupManagementSection({ adminKey }: PopupManagementSectionProps) {
  const [slides, setSlides] = useState<PopupBannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<number | null>(null); // order index yang sedang diunggah
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewSlide, setPreviewSlide] = useState<PopupBannerItem | null>(null);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);

  const fileInputRefs = [fileInputRef1, fileInputRef2, fileInputRef3];

  const fetchSlides = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (adminKey) headers['x-admin-key'] = adminKey;

      const res = await fetch('/api/admin/popups', {
        headers,
        credentials: 'same-origin',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.slides)) {
          setSlides(data.slides);
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat daftar slide popup.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleFileUpload = async (order: number, file: File) => {
    // 1. Validasi Ekstensi dan Tipe File di Sisi Klien
    const validExts = ['jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExts.includes(ext) || !['image/jpeg', 'image/png'].includes(file.type.toLowerCase())) {
      setMessage({
        type: 'error',
        text: `File "${file.name}" ditolak. Demi keamanan website dari ancaman file berbahaya, hanya format JPG, JPEG, dan PNG yang diizinkan.`,
      });
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'Ukuran file terlalu besar. Maksimal ukuran gambar adalah 4MB.',
      });
      return;
    }

    setIsUploading(order);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('display_order', order.toString());

      const existingSlide = slides.find((s) => s.display_order === order);
      if (existingSlide) {
        formData.append('id', existingSlide.id);
      }

      const headers: Record<string, string> = {};
      if (adminKey) headers['x-admin-key'] = adminKey;

      const res = await fetch('/api/admin/popups', {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: 'success',
          text: `Slide #${order} berhasil disimpan ke Supabase!`,
        });
        if (Array.isArray(data.slides)) {
          setSlides(data.slides);
        } else {
          fetchSlides();
        }
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Gagal mengunggah gambar slide.',
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: 'Terjadi kesalahan jaringan saat mengunggah file.',
      });
    } finally {
      setIsUploading(null);
    }
  };

  const handleDeleteSlide = async (id: string, order: number) => {
    if (!confirm(`Hapus gambar slide #${order}?`)) return;

    try {
      const headers: Record<string, string> = {};
      if (adminKey) headers['x-admin-key'] = adminKey;

      const res = await fetch(`/api/admin/popups?id=${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'same-origin',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: `Slide #${order} berhasil dihapus.` });
        if (Array.isArray(data.slides)) {
          setSlides(data.slides);
        } else {
          fetchSlides();
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghapus slide.' });
    }
  };

  const handleToggleSlideActive = async (slide: PopupBannerItem) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminKey) headers['x-admin-key'] = adminKey;

      const res = await fetch('/api/admin/popups', {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify({
          id: slide.id,
          display_order: slide.display_order,
          is_active: !slide.is_active,
          image_url: slide.image_url,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (Array.isArray(data.slides)) setSlides(data.slides);
        else fetchSlides();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="adm-popup-manager">
      {/* ── Banner Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4c1d95, #6d28d9)',
          borderRadius: '18px',
          padding: '24px 28px',
          color: '#ffffff',
          marginBottom: '24px',
          boxShadow: '0 10px 30px rgba(109, 40, 217, 0.2)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ImageIcon size={22} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Popup Awal Website (Maks. 3 Slide)
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#ddd6fe', maxWidth: '640px' }}>
            Gambar promo atau pengumuman yang muncul otomatis di tengah layar saat pengunjung pertama kali membuka website.
            Jika tidak ada gambar (kosong), popup tidak akan muncul.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSlides}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* ── Status Pesan / Feedback ── */}
      {message && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            border: message.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca',
          }}
        >
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* ── Security Alert Box (Patuhi instruksi JPG, JPEG, PNG) ── */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <ShieldCheck size={24} style={{ color: '#16a34a', flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem', color: '#475569' }}>
          <strong>Proteksi Keamanan File Aktif:</strong> Sistem hanya menerima file berekstensi{' '}
          <code style={{ background: '#e2e8f0', padding: '2px 5px', borderRadius: '4px' }}>.jpg</code>,{' '}
          <code style={{ background: '#e2e8f0', padding: '2px 5px', borderRadius: '4px' }}>.jpeg</code>, dan{' '}
          <code style={{ background: '#e2e8f0', padding: '2px 5px', borderRadius: '4px' }}>.png</code> dengan verifikasi magic bytes otomatis.
          File berbahaya (script, html, svg executable) akan otomatis ditolak oleh server.
        </div>
      </div>

      {/* ── 3 Slot Slide Carousel (Maksimal 3 Slide) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {[1, 2, 3].map((order) => {
          const slide = slides.find((s) => s.display_order === order);
          const isThisUploading = isUploading === order;

          return (
            <div
              key={order}
              style={{
                background: '#ffffff',
                border: slide ? '2px solid #8b5cf6' : '2px dashed #cbd5e1',
                borderRadius: '18px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                position: 'relative',
                boxShadow: slide ? '0 6px 20px rgba(139, 92, 246, 0.08)' : 'none',
              }}
            >
              {/* Header Slot */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: slide ? '#6d28d9' : '#e2e8f0',
                      color: slide ? '#ffffff' : '#64748b',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {order}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e1b4b' }}>
                    Slide #{order}
                  </span>
                </div>

                {slide && (
                  <button
                    type="button"
                    onClick={() => handleToggleSlideActive(slide)}
                    style={{
                      background: slide.is_active ? '#dcfce7' : '#f1f5f9',
                      color: slide.is_active ? '#15803d' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {slide.is_active ? '● Aktif' : '○ Nonaktif'}
                  </button>
                )}
              </div>

              {/* Area Gambar atau Placeholder Upload */}
              {slide ? (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '4 / 5',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#0f0a19',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <img
                    src={slide.image_url}
                    alt={`Slide ${order}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />

                  {/* Tombol Preview Cepat */}
                  <button
                    type="button"
                    onClick={() => setPreviewSlide(slide)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.65)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Eye size={12} />
                    <span>Lihat</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRefs[order - 1].current?.click()}
                  style={{
                    width: '100%',
                    aspectRatio: '4 / 5',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: '20px',
                    textAlign: 'center',
                    gap: '8px',
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  <Upload size={32} color="#94a3b8" />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                    Pilih Gambar Slide #{order}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Hanya JPG, JPEG, PNG (Maks 4MB)
                  </span>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRefs[order - 1]}
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(order, file);
                  e.target.value = ''; // Reset input
                }}
              />

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => fileInputRefs[order - 1].current?.click()}
                  disabled={isThisUploading}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: slide ? '#f8fafc' : '#6d28d9',
                    color: slide ? '#334155' : '#ffffff',
                    border: slide ? '1px solid #cbd5e1' : 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: isThisUploading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isThisUploading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>{slide ? 'Ganti Gambar' : 'Unggah Gambar'}</span>
                    </>
                  )}
                </button>

                {slide && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide.id, order)}
                    title="Hapus Slide Ini"
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal Preview Visual Besar ── */}
      {previewSlide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setPreviewSlide(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '500px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '20px',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', background: '#0f0a19' }}>
              <img
                src={previewSlide.image_url}
                alt="Preview Slide"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setPreviewSlide(null)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  background: '#1e1b4b',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
