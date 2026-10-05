// In-memory fallback storage for digital gifts when Supabase is offline / not yet configured
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

const globalForGifts = globalThis as unknown as {
  giftsMemoryStore: Map<string, StoredGift>;
  giftPhotosStore: Map<string, StoredGiftPhoto[]>;
};

export const giftsMemoryStore =
  globalForGifts.giftsMemoryStore || new Map<string, StoredGift>();

export const giftPhotosStore =
  globalForGifts.giftPhotosStore || new Map<string, StoredGiftPhoto[]>();

if (process.env.NODE_ENV !== 'production') {
  globalForGifts.giftsMemoryStore = giftsMemoryStore;
  globalForGifts.giftPhotosStore = giftPhotosStore;
}
