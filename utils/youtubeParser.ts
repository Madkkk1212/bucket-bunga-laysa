// utils/youtubeParser.ts
// Parser ketat URL YouTube. Hanya simpan 11-karakter video ID, bukan URL mentah.
// JANGAN ubah validasi regex tanpa review keamanan.

/** Pola yang diterima:
 *  - youtube.com/watch?v=ID
 *  - youtu.be/ID
 *  - youtube.com/shorts/ID
 *  - music.youtube.com/watch?v=ID
 *  - youtube.com/embed/ID
 *  Semua bisa diikuti parameter tambahan (&t=, dll.)
 */
const YT_PATTERNS: RegExp[] = [
  /(?:youtube\.com\/watch\?(?:[^&]*&)*v=)([A-Za-z0-9_-]{11})/,
  /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
  /(?:music\.youtube\.com\/watch\?(?:[^&]*&)*v=)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
];

/** Video ID yang valid: tepat 11 karakter [A-Za-z0-9_-] */
const VALID_ID_RE = /^[A-Za-z0-9_-]{11}$/;

export interface YouTubeParseResult {
  videoId: string | null;
  startSeconds: number;
  error?: string;
}

/**
 * Parse URL YouTube menjadi videoId dan startSeconds.
 * Jika tidak valid, kembalikan videoId: null dan pesan error.
 */
export function parseYouTubeUrl(raw: string): YouTubeParseResult {
  if (!raw || typeof raw !== 'string') {
    return { videoId: null, startSeconds: 0, error: 'Link tidak boleh kosong.' };
  }

  const trimmed = raw.trim();

  // Coba cocokkan tiap pola
  let videoId: string | null = null;
  for (const pattern of YT_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match && match[1] && VALID_ID_RE.test(match[1])) {
      videoId = match[1];
      break;
    }
  }

  if (!videoId) {
    return {
      videoId: null,
      startSeconds: 0,
      error: 'Link YouTube tidak valid. Coba format: youtube.com/watch?v=... atau youtu.be/...',
    };
  }

  // Ambil start time (?t= atau &t=)
  let startSeconds = 0;
  const tMatch = trimmed.match(/[?&]t=(\d+)/);
  if (tMatch) {
    startSeconds = Math.max(0, parseInt(tMatch[1], 10));
  }

  return { videoId, startSeconds };
}

/** Hanya validasi ID (untuk validasi server-side dari config tersimpan) */
export function isValidYouTubeId(id: string | null | undefined): boolean {
  if (!id) return false;
  return VALID_ID_RE.test(id);
}

/** Ambil hanya videoId (11 karakter) atau null jika tidak valid */
export function parseYouTubeId(raw: string): string | null {
  return parseYouTubeUrl(raw).videoId;
}

/** Cek apakah URL YouTube valid */
export function isYouTubeUrlValid(raw: string): boolean {
  return parseYouTubeUrl(raw).videoId !== null;
}

