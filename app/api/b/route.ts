import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getAdminClient } from '@/utils/supabase/admin';
import { sanitizeText, containsProfanity } from '@/utils/textSanitize';
import {
  generateShortGiftId,
  saveLocalGift,
  type StoredGift,
} from '@/lib/giftsStorage';

// Simple in-memory rate limiter per IP: max 20 requests per 10 minutes
const ipRateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  ipRateLimitMap.set(ip, validTimestamps);
  return false;
}

export async function POST(req: Request) {
  try {
    // 1. Check IP rate limit
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat lagi.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { senderName, recipientName, message, musicTrack, designData } = body || {};

    if (!designData) {
      return NextResponse.json(
        { success: false, message: 'Data rangkaian buket tidak valid.' },
        { status: 400 }
      );
    }

    // 2. Validate & Sanitize texts
    const cleanSender = sanitizeText(senderName, 50);
    const cleanRecipient = sanitizeText(recipientName, 50);
    const cleanMessage = sanitizeText(message, 500);

    for (const [field, val] of [
      ['Nama pengirim', cleanSender],
      ['Nama penerima', cleanRecipient],
      ['Pesan', cleanMessage],
    ] as [string, string][]) {
      if (containsProfanity(val)) {
        return NextResponse.json(
          { success: false, message: `${field} mengandung kata yang tidak diizinkan.` },
          { status: 422 }
        );
      }
    }

    // 3. Generate unique 8-character ID & sanitize design transform attributes
    const shortId = generateShortGiftId();

    const sanitizedDesignData = { ...designData };
    if (Array.isArray(sanitizedDesignData.selectedFlowers)) {
      sanitizedDesignData.selectedFlowers = sanitizedDesignData.selectedFlowers.map((f: any) => {
        let rotation =
          typeof f.rotation === 'number' && !isNaN(f.rotation)
            ? ((f.rotation % 360) + 360) % 360
            : typeof f.customRotation === 'number' && !isNaN(f.customRotation)
            ? ((((f.customRotation * 180) / Math.PI) % 360) + 360) % 360
            : 0;
        if (rotation > 180) rotation -= 360;

        const scale =
          typeof f.scale === 'number' && !isNaN(f.scale)
            ? Math.max(0.3, Math.min(3.0, f.scale))
            : 1.0;

        return {
          ...f,
          rotation: Math.round(rotation * 10) / 10,
          scale: Math.round(scale * 100) / 100,
        };
      });
    }
    if (typeof sanitizedDesignData.bouquetScale === 'number' && !isNaN(sanitizedDesignData.bouquetScale)) {
      sanitizedDesignData.bouquetScale = Math.max(0.3, Math.min(3.0, sanitizedDesignData.bouquetScale));
    }
    if (typeof sanitizedDesignData.bouquetRotation === 'number' && !isNaN(sanitizedDesignData.bouquetRotation)) {
      const bRot = ((sanitizedDesignData.bouquetRotation % 360) + 360) % 360;
      sanitizedDesignData.bouquetRotation = bRot > 180 ? bRot - 360 : bRot;
    }

    const giftRecord: StoredGift = {
      id: shortId,
      senderName: cleanSender || 'Seseorang yang Mengagumimu',
      recipientName: cleanRecipient || 'Untukmu',
      message: cleanMessage || 'Semoga buket bunga ini membawa senyum bahagia untukmu! 💐✨',
      musicTrack: musicTrack || 'romantic-piano',
      designData: sanitizedDesignData,
      createdAt: new Date().toISOString(),
      views: 0,
    };

    // 4. Save to persistent local file / memory
    saveLocalGift(giftRecord);

    // 5. Save to Supabase if configured
    try {
      const dbClient = getAdminClient() || supabase;
      if (isSupabaseConfigured && dbClient) {
        await dbClient.from('digital_gifts').insert({
          id: shortId,
          sender_name: giftRecord.senderName,
          recipient_name: giftRecord.recipientName,
          message: giftRecord.message,
          music_track: giftRecord.musicTrack,
          design_data: designData,
          views_count: 0,
        });
      }
    } catch (dbErr) {
      console.warn('[POST /api/b] Supabase sync warning:', dbErr);
    }

    return NextResponse.json({
      success: true,
      id: shortId,
      url: `/b/${shortId}`,
    });
  } catch (error) {
    console.error('Error in POST /api/b:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat membuat link kado.' },
      { status: 500 }
    );
  }
}
