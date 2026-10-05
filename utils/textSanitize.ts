// utils/textSanitize.ts
// Sanitasi dan filter teks buatan pengguna.
// Daftar kata kasar bisa diubah tanpa deploy ulang (pindah ke DB/env jika perlu).

/** Buang karakter kontrol dan HTML tags, potong panjang */
export function sanitizeText(raw: string | undefined | null, maxLength: number): string {
  if (!raw) return '';
  return raw
    // Buang karakter kontrol (ASCII 0–31 kecuali tab & newline)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Buang tag HTML
    .replace(/<[^>]*>/g, '')
    // Normalisasi whitespace berlebihan
    .replace(/\s{3,}/g, '  ')
    .trim()
    .slice(0, maxLength);
}

// ─── Daftar kata kasar (bisa diperpanjang) ────────────────────────────────
// Gunakan bentuk dasar; pengecekan case-insensitive
const PROFANITY_LIST_ID = [
  'anjing', 'anjir', 'babi', 'bangsat', 'bajingan', 'goblok', 'tolol',
  'idiot', 'bodoh', 'kampret', 'kontol', 'memek', 'ngentot', 'pepek',
  'tai', 'taik', 'sialan', 'keparat', 'brengsek', 'jancuk', 'asu',
];

const PROFANITY_LIST_EN = [
  'fuck', 'shit', 'ass', 'bitch', 'cunt', 'dick', 'cock', 'pussy',
  'bastard', 'damn', 'crap', 'whore', 'nigger', 'faggot',
];

const ALL_PROFANITY = [...PROFANITY_LIST_ID, ...PROFANITY_LIST_EN];

/** Cek apakah teks mengandung kata kasar */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = lower.split(/\s+/);
  return words.some((word) => ALL_PROFANITY.includes(word));
}
