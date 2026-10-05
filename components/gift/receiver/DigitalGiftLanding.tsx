'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ImagePlus } from 'lucide-react';
import type { LandingPageTemplateId, LandingTextConfig } from '@/types/giftConfig';
import type { PhotoItem } from './PhotoDisplay';

export type LandingTemplateId = LandingPageTemplateId;

export const LANDING_TEXT_FIELDS: Record<LandingTemplateId, Array<{ key: string; label: string; defaultValue: string }>> = {
  'cerita-kita': [
    { key: 'greeting', label: 'Sapaan surat', defaultValue: 'Dear Love,' },
    { key: 'paragraph2', label: 'Paragraf kedua', defaultValue: 'Thank you for being my safe place, my biggest smile, and my favorite person to spend every ordinary day with.' },
    { key: 'paragraph3', label: 'Paragraf penutup', defaultValue: "Happy Girlfriend's Day. You deserve to feel loved today and every day after." },
    { key: 'galleryLabel', label: 'Label galeri', defaultValue: 'LITTLE MOMENTS, BIG MEMORIES' },
    { key: 'bouquetLabel', label: 'Judul buket', defaultValue: 'A bouquet for you' },
    { key: 'bouquetCaption', label: 'Keterangan buket', defaultValue: 'Made with love by {senderName}' },
    { key: 'continueLabel', label: 'Tombol lanjut', defaultValue: 'Continue our story' },
    { key: 'endnote', label: 'Kalimat penutup galeri', defaultValue: 'A bouquet and a little note, from {senderName} to {recipientName}.' },
    { key: 'signature', label: 'Tanda tangan', defaultValue: '— {senderName}' },
  ],
  'film-kenangan': [
    { key: 'letterHeading', label: 'Judul surat', defaultValue: 'A LOVE LETTER' },
    { key: 'toLabel', label: 'Label penerima', defaultValue: 'TO' },
    { key: 'fromLabel', label: 'Label pengirim', defaultValue: 'FROM' },
    { key: 'signature', label: 'Tanda tangan', defaultValue: '— {senderName}' },
    { key: 'bouquetLabel', label: 'Judul buket', defaultValue: 'A bouquet for you' },
    { key: 'openHint', label: 'Petunjuk buka amplop', defaultValue: '✦ TAP THE SEAL TO OPEN ✦' },
  ],
  'album-surat': [
    { key: 'recipientPrefix', label: 'Label penerima', defaultValue: 'FOR' },
    { key: 'greeting', label: 'Sapaan surat', defaultValue: 'To my love!' },
    { key: 'paragraph2', label: 'Paragraf kedua', defaultValue: "If you asked me to be your guide for a lifetime, then find you here to show me the way that I'll be loved for a lifetime." },
    { key: 'paragraph3', label: 'Paragraf ketiga', defaultValue: 'I just want to thank you for always carrying all of my worries even though you were hurt. Even though you were hurt, I want you for you to be like anyone else, I only wish for you to see yourself as a better version of yourself.' },
    { key: 'paragraph4', label: 'Paragraf keempat', defaultValue: "And finally, happy birthday to my love! I wish you lots of joy and happiness, to grow into the man, and I hope that someday I'll be able to celebrate your birthday together with you." },
    { key: 'closing', label: 'Kalimat penutup', defaultValue: 'Love you' },
    { key: 'signature', label: 'Tanda tangan', defaultValue: 'With love, {senderName}' },
    { key: 'coverSubtitle', label: 'Subjudul sampul', defaultValue: 'A Love Letter' },
    { key: 'openHint', label: 'Petunjuk buka buku', defaultValue: '✦ CLICK TO OPEN ✦' },
    { key: 'bouquetLabel', label: 'Judul buket', defaultValue: 'A bouquet for you' },
  ],
};

interface DigitalGiftLandingProps {
  templateId: LandingTemplateId;
  title: string;
  senderName: string;
  recipientName: string;
  message: string;
  landingText?: LandingTextConfig;
  photos: PhotoItem[];
  bouquet: React.ReactNode;
  isOpen: boolean;
  isOpening?: boolean;
  isEn?: boolean;
  editablePhotos?: boolean;
  onOpenGift: () => void;
  onPhotoChange?: (index: number, dataUrl: string, fileName: string) => void;
  onTextEdit?: (field?: string) => void;
}

function LandingPhoto({
  photo,
  index,
  editable,
  alt,
  onPhotoChange,
  className = '',
  delay,
}: {
  photo?: PhotoItem;
  index: number;
  editable: boolean;
  alt: string;
  onPhotoChange?: DigitalGiftLandingProps['onPhotoChange'];
  className?: string;
  delay?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFile = async (file?: File) => {
    if (!file || !file.type.startsWith('image/') || !onPhotoChange) return;
    setProcessing(true);
    setUploadError('');
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Gagal membaca foto.'));
        reader.onload = () => {
          const image = new Image();
          image.onerror = () => reject(new Error('Foto tidak dapat dibuka.'));
          image.onload = () => {
            const maxDimension = 1200;
            const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(image.width * ratio));
            canvas.height = Math.max(1, Math.round(image.height * ratio));
            const context = canvas.getContext('2d');
            if (!context) {
              resolve(String(reader.result));
              return;
            }
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          image.src = String(reader.result);
        };
        reader.readAsDataURL(file);
      });
      onPhotoChange(index, dataUrl, file.name);
    } catch {
      setUploadError('Foto tidak bisa dibaca. Coba pilih gambar lain.');
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  if (!photo && !editable) return null;

  return (
    <div className={`dgl-photo-slot${editable ? ' is-editable' : ''}${className ? ` ${className}` : ''}`} style={delay ? { '--dgl-delay': delay } as React.CSSProperties : undefined}>
      {editable && (
        <input
          ref={inputRef}
          className="dgl-photo-input"
          type="file"
          accept="image/*"
          aria-label={alt}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      )}
      <button
        type="button"
        className="dgl-photo-button"
        onClick={() => editable && inputRef.current?.click()}
        disabled={!editable || processing}
        aria-label={editable ? (photo ? `Ganti ${alt}` : `Pilih ${alt}`) : alt}
      >
        {photo ? <img src={photo.url} alt={photo.altText || alt} /> : (
          <span className="dgl-photo-empty">
            <ImagePlus size={22} aria-hidden="true" />
            <span>{processing ? 'Memproses foto…' : 'Pilih foto'}</span>
          </span>
        )}
        {editable && photo && <span className="dgl-photo-change"><ImagePlus size={14} /> Ganti foto</span>}
      </button>
      {uploadError && <span className="dgl-photo-error" role="status">{uploadError}</span>}
    </div>
  );
}

export default function DigitalGiftLanding({
  templateId,
  title,
  senderName,
  recipientName,
  message,
  landingText = {},
  photos,
  bouquet,
  isOpen,
  isOpening = false,
  isEn = false,
  editablePhotos = false,
  onOpenGift,
  onPhotoChange,
  onTextEdit,
}: DigitalGiftLandingProps) {
  const safePhotos = photos.slice(0, 6);
  const defaultTitle = (title || ({ 'cerita-kita': 'You too divine to be Mine', 'film-kenangan': 'My Love, {recipientName}', 'album-surat': 'My Only Love' }[templateId]))
    .replaceAll('{recipientName}', recipientName);
  const defaultMessage = message || ({
    'cerita-kita': "If I could write everything you mean to me, this page would never end. So instead, I'll tell you this:",
    'film-kenangan': 'My love, ever since you came into my life, everything feels brighter and more meaningful — your smile gives me peace, your voice brings me joy, and your presence makes every moment feel complete. I carry you in my heart always, and no matter where life takes us, my love for you will only grow stronger.',
    'album-surat': 'If I could love you for one more day, I would love you for one more day. If I could look at you one more time, I would look at you one more time.',
  }[templateId]);
  const copy = (key: string, fallback?: string) => {
    const value = landingText[templateId]?.[key];
    return (typeof value === 'string' ? value : fallback || '')
      .replaceAll('{senderName}', senderName)
      .replaceAll('{recipientName}', recipientName);
  };
  const openLabel = isOpening ? (isEn ? 'Opening…' : 'Membuka…') : (isEn ? 'Open your surprise' : 'Buka kejutanmu');
  const handleTextKeyboard = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!onTextEdit || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onTextEdit();
  };

  useEffect(() => {
    if (templateId !== 'cerita-kita') return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.dgl-story-section'));
    if (!sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-active', entry.isIntersecting);
      }
    }, { threshold: 0.5 });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [templateId]);

  if (templateId === 'cerita-kita') {
    const galleryIndices = Array.from(
      { length: editablePhotos ? Math.max(3, Math.min(5, safePhotos.length)) : safePhotos.length - 1 },
      (_, slot) => slot + 1
    );
    const galleryPhotos = galleryIndices
      .map((index) => ({ index, photo: safePhotos[index] }))
      .filter(({ photo, index }) => photo || editablePhotos && index < 6);

    return (
      <main className="dgl dgl-story" lang={isEn ? 'en' : 'id'} data-editable={editablePhotos || !!onTextEdit}>
        <section className="dgl-story-section dgl-story-first is-active" aria-label={isEn ? 'Our story' : 'Cerita kita'}>
          <div className="dgl-story-card">
            <div className="dgl-story-photo-wrap dgl-fade" style={{ '--dgl-delay': '.1s' } as React.CSSProperties}>
              <LandingPhoto photo={safePhotos[0]} index={0} editable={editablePhotos} alt={isEn ? 'Our favorite photo' : 'Foto kenangan utama'} onPhotoChange={onPhotoChange} />
            </div>
            <div className="dgl-story-bouquet dgl-fade" style={{ '--dgl-delay': '.25s' } as React.CSSProperties}>
              <span className="dgl-kicker" onClick={() => onTextEdit?.('bouquetLabel')}>{copy('bouquetLabel', 'A bouquet for you')}</span>
              <div className="dgl-bouquet-frame">{bouquet}</div>
              <span className="dgl-bouquet-caption" onClick={() => onTextEdit?.('bouquetCaption')}>{copy('bouquetCaption', 'Made with love by {senderName}')}</span>
            </div>
            <article className="dgl-story-letter dgl-fade" style={{ '--dgl-delay': '.4s' } as React.CSSProperties}>
              <h1 onClick={() => onTextEdit?.('greeting')} onKeyDown={handleTextKeyboard} role={onTextEdit ? 'button' : undefined} tabIndex={onTextEdit ? 0 : undefined}>{copy('greeting', 'Dear Love,')}</h1>
              <p onClick={() => onTextEdit?.('message')} onKeyDown={handleTextKeyboard} role={onTextEdit ? 'button' : undefined} tabIndex={onTextEdit ? 0 : undefined}>{defaultMessage}</p>
              <p onClick={() => onTextEdit?.('paragraph2')} onKeyDown={handleTextKeyboard} role={onTextEdit ? 'button' : undefined} tabIndex={onTextEdit ? 0 : undefined}>{copy('paragraph2', LANDING_TEXT_FIELDS['cerita-kita'][1].defaultValue)}</p>
              <p onClick={() => onTextEdit?.('paragraph3')} onKeyDown={handleTextKeyboard} role={onTextEdit ? 'button' : undefined} tabIndex={onTextEdit ? 0 : undefined}>{copy('paragraph3', LANDING_TEXT_FIELDS['cerita-kita'][2].defaultValue)}</p>
              <span className="dgl-signature" onClick={() => onTextEdit?.('signature')}>{copy('signature', '— {senderName}')}</span>
              <button type="button" className="dgl-scroll-link" onClick={() => { onOpenGift(); document.getElementById('dgl-story-gallery')?.scrollIntoView({ behavior: 'smooth' }); }}>
                <span>{copy('continueLabel', 'Continue our story')}</span><ArrowDown size={16} />
              </button>
            </article>
          </div>
        </section>
        <section className="dgl-story-section dgl-story-second" id="dgl-story-gallery" aria-label={isEn ? 'Memory gallery' : 'Galeri kenangan'}>
          <span className="dgl-kicker dgl-fade" style={{ '--dgl-delay': '.1s' } as React.CSSProperties} onClick={() => onTextEdit?.('galleryLabel')}>{copy('galleryLabel', 'LITTLE MOMENTS, BIG MEMORIES')}</span>
          <h2 className="dgl-fade" style={{ '--dgl-delay': '.25s' } as React.CSSProperties} onClick={() => onTextEdit?.('title')}>{defaultTitle}</h2>
          {galleryPhotos.length > 0 ? (
            <div className="dgl-story-gallery dgl-fade" style={{ '--dgl-delay': '.4s' } as React.CSSProperties}>
              {galleryPhotos.map(({ index, photo }) => (
                <LandingPhoto key={index} photo={photo} index={index} editable={editablePhotos} alt={`${isEn ? 'Memory photo' : 'Foto kenangan'} ${index + 1}`} onPhotoChange={onPhotoChange} className="dgl-fade" delay={`${0.1 + (index - 1) * 0.15}s`} />
              ))}
            </div>
          ) : (
            <p className="dgl-story-endnote" onClick={() => onTextEdit?.('endnote')}>{copy('endnote', 'A bouquet and a little note, from {senderName} to {recipientName}.')}</p>
          )}
          <span className="dgl-signature dgl-fade" style={{ '--dgl-delay': '.55s' } as React.CSSProperties} onClick={() => onTextEdit?.('signature')}>{copy('signature', 'With love, {senderName}')}</span>
        </section>
      </main>
    );
  }

  if (templateId === 'film-kenangan') {
    return (
      <main className={`dgl dgl-envelope${isOpen ? ' is-open' : ''}`} lang={isEn ? 'en' : 'id'} data-editable={editablePhotos || !!onTextEdit}>
        <section className="dgl-envelope-scene" aria-label={isEn ? 'Love letter' : 'Surat cinta'}>
          <div className="dgl-envelope-back" />
          <div className="dgl-letter-sheet">
            <div className="dgl-letter-sheet-inner">
              <h1 onClick={() => onTextEdit?.('letterHeading')} onKeyDown={handleTextKeyboard} role={onTextEdit ? 'button' : undefined} tabIndex={onTextEdit ? 0 : undefined}>{copy('letterHeading', 'A LOVE LETTER')}</h1>
              <div className="dgl-envelope-tofrom">
                <span><b onClick={() => onTextEdit?.('toLabel')}>{copy('toLabel', 'TO')}</b>{recipientName}</span>
                <span><b onClick={() => onTextEdit?.('fromLabel')}>{copy('fromLabel', 'FROM')}</b>{senderName}</span>
              </div>
              <h2 className="dgl-envelope-script-title" onClick={() => onTextEdit?.('title')}>{defaultTitle.replaceAll('{recipientName}', recipientName)}</h2>
              <div className="dgl-envelope-bouquet"><span className="dgl-kicker" onClick={() => onTextEdit?.('bouquetLabel')}>{copy('bouquetLabel', 'A bouquet for you')}</span><div className="dgl-bouquet-frame">{bouquet}</div></div>
              <p onClick={() => onTextEdit?.('message')} onKeyDown={handleTextKeyboard} role={onTextEdit ? 'button' : undefined} tabIndex={onTextEdit ? 0 : undefined}>{defaultMessage}</p>
              <div className={`dgl-envelope-photos${safePhotos.length > 2 ? ' has-many' : ''}`}>
                {Array.from({ length: editablePhotos ? Math.max(2, Math.min(6, safePhotos.length + 1)) : safePhotos.length }, (_, index) => index).map((index) => (
                  <LandingPhoto key={index} photo={safePhotos[index]} index={index} editable={editablePhotos} alt={`${isEn ? 'Keepsake photo' : 'Foto kenangan'} ${index + 1}`} onPhotoChange={onPhotoChange} />
                ))}
              </div>
              <span className="dgl-signature" onClick={() => onTextEdit?.('signature')}>{copy('signature', '— {senderName}')}</span>
            </div>
            <span className="dgl-letter-quadrant quadrant-top-left" aria-hidden="true" />
            <span className="dgl-letter-quadrant quadrant-top-right" aria-hidden="true" />
            <span className="dgl-letter-quadrant quadrant-bottom-left" aria-hidden="true" />
            <span className="dgl-letter-quadrant quadrant-bottom-right" aria-hidden="true" />
          </div>
          <div className="dgl-envelope-front" aria-hidden="true"><span>♥</span></div>
          <div className="dgl-envelope-flap" aria-hidden="true" />
          {!isOpen && (
            <button type="button" className="dgl-envelope-seal" onClick={onOpenGift} disabled={isOpening} aria-label={copy('openHint', openLabel)}>
              <span>♥</span>
            </button>
          )}
          {!isOpen && <p className="dgl-open-hint" onClick={() => onTextEdit?.('openHint')}>{copy('openHint', '✦ TAP THE SEAL TO OPEN ✦')}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className={`dgl dgl-book${isOpen ? ' is-open' : ''}`} lang={isEn ? 'en' : 'id'} data-editable={editablePhotos || !!onTextEdit}>
      <section className="dgl-book-stage" aria-label={isEn ? 'Keepsake book' : 'Buku kenangan'}>
        <div className="dgl-book-spread">
          <div className="dgl-book-left">
            <div className="dgl-book-bouquet dgl-book-reveal" style={{ '--dgl-delay': '.45s' } as React.CSSProperties}><span className="dgl-kicker" onClick={() => onTextEdit?.('bouquetLabel')}>{copy('bouquetLabel', 'A bouquet for you')}</span><div className="dgl-bouquet-frame">{bouquet}</div></div>
            <div className="dgl-book-gallery">
              {Array.from({ length: editablePhotos ? Math.max(4, Math.min(6, safePhotos.length + 1)) : safePhotos.length }, (_, index) => index).map((index) => (
                <LandingPhoto key={index} photo={safePhotos[index]} index={index} editable={editablePhotos} alt={`${isEn ? 'Memory photo' : 'Foto kenangan'} ${index + 1}`} onPhotoChange={onPhotoChange} className="dgl-book-reveal" delay={`${0.6 + index * 0.3}s`} />
              ))}
            </div>
          </div>
          <article className="dgl-book-right">
            <span className="dgl-kicker dgl-book-reveal" style={{ '--dgl-delay': '.8s' } as React.CSSProperties} onClick={() => onTextEdit?.('recipientPrefix')}>{copy('recipientPrefix', 'FOR')} {recipientName.toUpperCase()}</span>
            <h1 className="dgl-book-reveal" style={{ '--dgl-delay': '1s' } as React.CSSProperties} onClick={() => onTextEdit?.('title')} onKeyDown={handleTextKeyboard} role={onTextEdit ? 'button' : undefined} tabIndex={onTextEdit ? 0 : undefined}>{defaultTitle}</h1>
            <div className="dgl-book-divider dgl-book-reveal" style={{ '--dgl-delay': '1.3s' } as React.CSSProperties}>❦</div>
            <div className="dgl-book-letter-body dgl-book-reveal" style={{ '--dgl-delay': '1.6s' } as React.CSSProperties}>
              <span className="dgl-book-greeting" onClick={() => onTextEdit?.('greeting')}>{copy('greeting', 'To my love!')}</span>
              <p onClick={() => onTextEdit?.('message')}>{defaultMessage}</p>
              {['paragraph2', 'paragraph3', 'paragraph4'].map((key) => (
                <p key={key} onClick={() => onTextEdit?.(key)}>{copy(key, LANDING_TEXT_FIELDS['album-surat'].find((field) => field.key === key)?.defaultValue)}</p>
              ))}
              <span className="dgl-book-closing" onClick={() => onTextEdit?.('closing')}>{copy('closing', 'Love you')}</span>
            </div>
            <span className="dgl-signature dgl-book-reveal" style={{ '--dgl-delay': '2.4s' } as React.CSSProperties} onClick={() => onTextEdit?.('signature')}>{copy('signature', 'With love, {senderName}')}</span>
          </article>
        </div>
        <button type="button" className="dgl-book-cover" onClick={onOpenGift} disabled={isOpening || isOpen} aria-label={openLabel} aria-hidden={isOpen} tabIndex={isOpen ? -1 : 0}>
            <span className="dgl-cover-heart">♥</span>
            <strong>{defaultTitle}</strong>
            <span className="dgl-cover-subtitle" onClick={() => onTextEdit?.('coverSubtitle')}>{copy('coverSubtitle', 'A Love Letter')}</span>
            <span className="dgl-cover-hint" onClick={(event) => { event.stopPropagation(); onTextEdit?.('openHint'); }}>{copy('openHint', '✦ CLICK TO OPEN ✦')}</span>
          </button>
      </section>
    </main>
  );
}
