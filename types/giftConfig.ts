// types/giftConfig.ts
// Tipe data untuk fitur Kado Link v2
// Kado lama (tanpa config) → template "klasik" otomatis

// ─── ID yang tersedia ─────────────────────────────────────────────────────

export type GiftTemplateId =
  | 'klasik'
  | 'taman-mekar'
  | 'kupu-kupu-harapan'
  | 'pesta-bintang'
  | 'pernikahan'
  | 'cerita-kita'
  | 'film-kenangan'
  | 'album-surat';

export type LandingPageTemplateId = 'cerita-kita' | 'film-kenangan' | 'album-surat';

export const LANDING_TEXT_KEYS = {
  'cerita-kita': ['greeting', 'paragraph2', 'paragraph3', 'galleryLabel', 'bouquetLabel', 'bouquetCaption', 'continueLabel', 'endnote', 'signature'],
  'film-kenangan': ['letterHeading', 'toLabel', 'fromLabel', 'signature', 'bouquetLabel', 'openHint'],
  'album-surat': ['recipientPrefix', 'greeting', 'paragraph2', 'paragraph3', 'paragraph4', 'closing', 'signature', 'coverSubtitle', 'openHint', 'bouquetLabel'],
} as const satisfies Record<LandingPageTemplateId, readonly string[]>;

export type LandingTextConfig = Partial<Record<LandingPageTemplateId, Record<string, string>>>;


export type GiftObjectId =
  | 'envelope'
  | 'gift-box'
  | 'music-box'
  | 'balloon'
  | 'jar'
  | 'book';

export type GiftEffectId =
  | 'flowers'
  | 'butterflies'
  | 'petals'
  | 'hearts'
  | 'stars'
  | 'confetti'
  | 'roses';


// ─── Konfigurasi kado (disimpan di kolom config JSONB) ────────────────────

export interface GiftConfig {
  /** Versi skema konfigurasi */
  version: 2;
  /** Template visual yang digunakan */
  templateId: GiftTemplateId;
  /** Objek hadiah yang tampil sebelum dibuka */
  giftObjectId: GiftObjectId;
  /** Efek layar penuh yang muncul saat dibuka */
  effectId: GiftEffectId;
  /** Judul yang tampil di depan kado (maks 60 karakter) */
  title: string;
  /** ID YouTube 11-karakter, bukan URL mentah. null = tidak ada musik */
  youtubeVideoId?: string | null;
  /** Detik mulai YouTube (default 0) */
  youtubeStartSeconds?: number;
  /** Jumlah foto yang diunggah (0–6) */
  photoCount?: number;
  /** Teks tambahan yang dapat dikustomisasi per template landing page. */
  landingText?: LandingTextConfig;
}

// ─── Konfigurasi template (untuk registry) ────────────────────────────────

export interface TemplateColorTokens {
  bg: string;
  surface: string;
  primary: string;
  accent: string;
  text: string;
  muted: string;
  /** Warna tambahan khusus template */
  extra?: Record<string, string>;
}

export interface TemplateFonts {
  heading: string;       // nama font Google Fonts untuk judul
  body: string;          // nama font Google Fonts untuk isi
  headingWeight: string; // e.g. '400;600;700'
  bodyWeight: string;
}

export interface TemplateDefaults {
  giftObjectId: GiftObjectId;
  effectId: GiftEffectId;
  titleId: string;       // key teks default ID
  titleEn: string;       // key teks default EN
}

export interface TemplatePhotoStyle {
  /** 'polaroid' | 'carousel' | 'grid' */
  style: 'polaroid' | 'carousel' | 'grid';
  /** Rotasi acak maksimum untuk polaroid (derajat) */
  maxRotation?: number;
}

export interface TemplateRevealOrder {
  /** Urutan elemen yang muncul: 'bouquet' | 'card' | 'photos' */
  order: Array<'bouquet' | 'card' | 'photos'>;
  /** Animasi masuk tiap elemen */
  animation: 'fade-rise' | 'slide-up' | 'pop-in' | 'flip';
}

export interface TemplateConfig {
  id: GiftTemplateId;
  name: string;
  nameEn: string;
  description: string;
  /** Apakah template ini gratis */
  isFree: boolean;
  colors: TemplateColorTokens;
  fonts: TemplateFonts;
  defaults: TemplateDefaults;
  photoStyle: TemplatePhotoStyle;
  reveal: TemplateRevealOrder;
  /** CSS class tambahan yang diapply ke root element kado */
  rootClass: string;
  /** Background style inline (bisa gradient string) */
  bgStyle: string;
  /** Template landing-page ini memerlukan minimal satu foto kenangan. */
  requiresPhoto?: boolean;
}

// ─── Data kado lengkap dari API ───────────────────────────────────────────

export interface GiftData {
  id: string;
  senderName: string;
  recipientName: string;
  message: string;
  musicTrack: string;
  designData: Record<string, unknown>;
  config?: GiftConfig | null;
  createdAt?: string;
  expiresAt?: string | null;
  scheduledOpenAt?: string | null;
  views?: number;
}

// ─── Batas fitur per tier (diambil dari paket/kode akses) ─────────────────

export interface GiftTierLimits {
  maxPhotos: number;
  canUseYouTube: boolean;
  allowedTemplates: GiftTemplateId[] | 'all';
  /** null = tidak kedaluwarsa, N = N hari */
  linkDurationDays: number | null;
}

export const DEFAULT_FREE_LIMITS: GiftTierLimits = {
  maxPhotos: 1,
  canUseYouTube: false,
  allowedTemplates: ['klasik', 'taman-mekar'],
  linkDurationDays: null,
};

export const DEFAULT_PREMIUM_LIMITS: GiftTierLimits = {
  maxPhotos: 6,
  canUseYouTube: true,
  allowedTemplates: 'all',
  linkDurationDays: null,
};
