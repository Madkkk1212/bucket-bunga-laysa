import fs from 'fs';
import path from 'path';

// Types for stored gift
export interface StoredGiftPhoto {
  id: string;
  giftId: string;
  url: string;
  altText?: string;
  displayOrder: number;
}

export interface StoredGift {
  id: string;
  senderName: string;
  recipientName: string;
  message: string;
  musicTrack: string;
  designData: any;
  config?: any;
  expiresAt?: string | null;
  scheduledOpenAt?: string | null;
  photos?: StoredGiftPhoto[];
  createdAt: string;
  views: number;
}

const GIFTS_FILE_PATH = path.join(process.cwd(), 'data', 'gifts.json');

const globalForGifts = globalThis as unknown as {
  giftsMemoryStore: Map<string, StoredGift>;
  giftPhotosStore: Map<string, StoredGiftPhoto[]>;
  isGiftsFileLoaded?: boolean;
};

export const giftsMemoryStore =
  globalForGifts.giftsMemoryStore || new Map<string, StoredGift>();

export const giftPhotosStore =
  globalForGifts.giftPhotosStore || new Map<string, StoredGiftPhoto[]>();

if (process.env.NODE_ENV !== 'production') {
  globalForGifts.giftsMemoryStore = giftsMemoryStore;
  globalForGifts.giftPhotosStore = giftPhotosStore;
}

/**
 * Load gifts from persistent data/gifts.json if available
 */
function ensureGiftsLoaded(): void {
  if (globalForGifts.isGiftsFileLoaded) return;
  try {
    if (fs.existsSync(GIFTS_FILE_PATH)) {
      const raw = fs.readFileSync(GIFTS_FILE_PATH, 'utf-8');
      const items: StoredGift[] = JSON.parse(raw);
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item?.id && !giftsMemoryStore.has(item.id)) {
            giftsMemoryStore.set(item.id, item);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[giftsStorage] Failed to read data/gifts.json:', err);
  }
  globalForGifts.isGiftsFileLoaded = true;
}

/**
 * Persist current memory store to data/gifts.json
 */
export function persistGiftsToFile(): void {
  try {
    const list = Array.from(giftsMemoryStore.values());
    const dir = path.dirname(GIFTS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(GIFTS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[giftsStorage] Failed to write data/gifts.json:', err);
  }
}

/**
 * Save gift into memory + persistent file
 */
export function saveLocalGift(gift: StoredGift): void {
  ensureGiftsLoaded();
  giftsMemoryStore.set(gift.id, gift);
  persistGiftsToFile();
}

/**
 * Get gift by id
 */
export function getLocalGift(id: string): StoredGift | null {
  ensureGiftsLoaded();
  return giftsMemoryStore.get(id) || null;
}

/**
 * Increment view count
 */
export function incrementLocalGiftViews(id: string): number {
  ensureGiftsLoaded();
  const gift = giftsMemoryStore.get(id);
  if (gift) {
    gift.views = (gift.views || 0) + 1;
    persistGiftsToFile();
    return gift.views;
  }
  return 0;
}

/**
 * Generate 8-character random alphanumeric ID (e.g. k7m2p9qa)
 */
export function generateShortGiftId(): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
