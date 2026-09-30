import crypto from 'crypto';

// Secret key derivation
const MASTER_SECRET =
  process.env.DRAFT_ENCRYPTION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'laysa-atelier-secret-key-bouquet-2026-aes256';

// Buat 32-byte key menggunakan SHA-256
const ENCRYPTION_KEY = crypto.createHash('sha256').update(MASTER_SECRET).digest();
const ALGORITHM = 'aes-256-gcm';

export interface EncryptedPayload {
  encryptedData: string;
  iv: string;
  authTag: string;
}

/**
 * Enkripsi objek / teks menggunakan AES-256-GCM
 */
export function encryptData(plainTextOrObj: string | Record<string, any>): EncryptedPayload {
  const text = typeof plainTextOrObj === 'string' ? plainTextOrObj : JSON.stringify(plainTextOrObj);
  const iv = crypto.randomBytes(12); // GCM standard 96-bit IV
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

/**
 * Dekripsi data terenkripsi AES-256-GCM
 */
export function decryptData(encryptedData: string, ivHex: string, authTagHex?: string): any {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  if (authTagHex) {
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  }

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
}
