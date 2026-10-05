import 'server-only';
import crypto from 'node:crypto';

const VERSION = 'v1';

function getKey(): Buffer {
  const secret = process.env.GARDEN_ENCRYPTION_KEY || process.env.ADMIN_SECRET_KEY;
  if (!secret || secret.length < 24) {
    throw new Error('GARDEN_ENCRYPTION_KEY harus dikonfigurasi dengan secret minimal 24 karakter.');
  }
  return crypto.createHash('sha256').update(secret, 'utf8').digest();
}

export function encryptGardenWorldLayout(value: unknown): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [VERSION, iv.toString('base64url'), authTag.toString('base64url'), ciphertext.toString('base64url')].join('.');
}

export function decryptGardenWorldLayout<T>(value: string): T {
  const [version, ivText, tagText, ciphertextText] = value.split('.');
  if (version !== VERSION || !ivText || !tagText || !ciphertextText) {
    throw new Error('Format tata letak terenkripsi tidak valid.');
  }

  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextText, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
  return JSON.parse(plaintext) as T;
}
