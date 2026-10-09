import crypto from 'crypto';

/**
 * LAYSA GARDEN — ADVANCED SENSITIVE DATA ENCRYPTION ENGINE
 * Mengamankan data sensitif kebun (pilihan bunga, pesan cinta / dailyNotes, partner info)
 * Menggunakan enkripsi standar industri AES-256-GCM dengan authentication tag & IV acak per-record.
 */

// Secret key derivation (AES-256 requires exactly 32 bytes)
function getEncryptionSecret(): string {
  const secret = process.env.GARDEN_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) {
    throw new Error('GARDEN_ENCRYPTION_KEY harus diatur dan minimal 32 karakter.');
  }
  return secret;
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard recommended IV length for AES-GCM

/**
 * Menghasilkan kunci 32-byte konsisten dari secret menggunakan SHA-256
 */
function getMasterKey(): Buffer {
  return crypto.createHash('sha256').update(getEncryptionSecret()).digest();
}

/**
 * Enkripsi data sensitif menjadi string terlindungi: iv:authTag:ciphertext
 */
export function encryptGardenData(data: unknown): string {
  if (data === null || data === undefined) return '';
  const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
  if (plaintext === undefined) throw new Error('Data kebun tidak dapat diserialisasi.');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Dekripsi string data sensitif ke format aslinya
 */
export function decryptGardenData<T = unknown>(cipherString: string, fallback?: T): T {
  try {
    if (!cipherString || typeof cipherString !== 'string') {
      return (cipherString as unknown) as T;
    }

    // Periksa apakah string berformat iv:authTag:ciphertext
    const parts = cipherString.split(':');
    if (parts.length !== 3) {
      // Data bukan format terenkripsi (misal legacy plain text), return langsung
      try {
        return JSON.parse(cipherString);
      } catch {
        return (cipherString as unknown) as T;
      }
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, getMasterKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted);
    } catch {
      return (decrypted as unknown) as T;
    }
  } catch (error) {
    console.warn('[Garden Crypto] Decryption verification failed or data corrupted:', error);
    if (fallback !== undefined) return fallback;
    throw new Error('Data kebun tidak dapat didekripsi dengan kunci yang dikonfigurasi.');
  }
}
