// In-memory fallback storage for digital gifts when Supabase is offline / not yet configured
export interface StoredGift {
  id: string;
  senderName: string;
  recipientName: string;
  message: string;
  musicTrack: string;
  designData: any;
  createdAt: string;
  views: number;
}

const globalForGifts = globalThis as unknown as {
  giftsMemoryStore: Map<string, StoredGift>;
};

export const giftsMemoryStore =
  globalForGifts.giftsMemoryStore || new Map<string, StoredGift>();

if (process.env.NODE_ENV !== 'production') {
  globalForGifts.giftsMemoryStore = giftsMemoryStore;
}
