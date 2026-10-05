import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getAdminClient } from '@/utils/supabase/admin';
import { LANDING_TEXT_KEYS, type GiftConfig, type LandingPageTemplateId, type LandingTextConfig } from '@/types/giftConfig';
import { DEFAULT_FREE_LIMITS, DEFAULT_PREMIUM_LIMITS } from '@/types/giftConfig';
import { sanitizeText, containsProfanity } from '@/utils/textSanitize';

// ─── Batas karakter yang divalidasi server ────────────────────────────────
const LIMITS = {
  senderName: 50,
  recipientName: 50,
  message: 1000,
  title: 60,
};

function sanitizeLandingText(value: unknown): LandingTextConfig | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const source = value as Record<string, unknown>;
  const output: LandingTextConfig = {};
  for (const templateId of Object.keys(LANDING_TEXT_KEYS) as LandingPageTemplateId[]) {
    const sourceFields = source[templateId];
    if (!sourceFields || typeof sourceFields !== 'object' || Array.isArray(sourceFields)) continue;
    const fields = sourceFields as Record<string, unknown>;
    const cleanFields: Record<string, string> = {};
    for (const key of LANDING_TEXT_KEYS[templateId]) {
      if (typeof fields[key] === 'string') cleanFields[key] = sanitizeText(fields[key] as string, 500);
    }
    if (Object.keys(cleanFields).length) output[templateId] = cleanFields;
  }
  return Object.keys(output).length ? output : undefined;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      senderName,
      recipientName,
      message,
      musicTrack,
      designData,
      config,
      accessCode,
    } = body || {};

    if (!designData) {
      return NextResponse.json(
        { success: false, message: 'Data rangkaian buket tidak valid.' },
        { status: 400 }
      );
    }

    // ─── Validasi & sanitasi teks ─────────────────────────────────────────
    const cleanSender = sanitizeText(senderName, LIMITS.senderName);
    const cleanRecipient = sanitizeText(recipientName, LIMITS.recipientName);
    const cleanMessage = sanitizeText(message, LIMITS.message);

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

    // ─── Validasi config kado (jika ada) ─────────────────────────────────
    let validatedConfig: GiftConfig | null = null;
    let tierLimits = { ...DEFAULT_FREE_LIMITS };

    // Baca freeLinkDurationDays dari file pricingConfig jika ada
    try {
      const pricingPath = path.join(process.cwd(), 'data', 'pricingConfig.json');
      if (fs.existsSync(pricingPath)) {
        const raw = fs.readFileSync(pricingPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (typeof parsed?.freeLinkDurationDays === 'number' && parsed.freeLinkDurationDays > 0) {
          tierLimits.linkDurationDays = parsed.freeLinkDurationDays;
        }
      }
    } catch {
      // Default to 3 days if unreadable
      tierLimits.linkDurationDays = 3;
    }

    const cleanCode = (accessCode || '').trim().toUpperCase();
    const isVipClient = Boolean(body?.isVipUser);

    const FALLBACK_MASTER_CODES = [
      'LAYSA-VIP',
      'BUKET2026',
      'PREMIUM-LOVE',
      'VIP-BOUQUET',
      'LAYSA-PREMIUM',
      'TISUWKWK',
    ];

    const dbClient = getAdminClient() || supabase;

    // 1. Cek apakah menggunakan Master VIP Code
    if (cleanCode && FALLBACK_MASTER_CODES.includes(cleanCode)) {
      tierLimits = {
        maxPhotos: 6,
        canUseYouTube: true,
        allowedTemplates: 'all',
        linkDurationDays: null, // Permanen untuk master VIP
      };
    }
    // 2. Cek access code di database Supabase
    else if (cleanCode && isSupabaseConfigured && dbClient) {
      const { data: codeData } = await dbClient
        .from('access_codes')
        .select('tier, max_photos, can_use_youtube, allowed_templates, link_duration_days, duration_days, is_active')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .maybeSingle();

      if (codeData) {
        let durationDays: number | null = codeData.link_duration_days;
        if (durationDays === undefined || durationDays === null) {
          if (codeData.tier === 'daily') durationDays = 1;
          else if (codeData.tier === 'weekly') durationDays = 7;
          else if (codeData.tier === 'lifetime') durationDays = null;
          else if (typeof codeData.duration_days === 'number') {
            durationDays = codeData.duration_days > 0 ? codeData.duration_days : null;
          }
        }

        tierLimits = {
          maxPhotos: Math.max(codeData.max_photos ?? 6, 6),
          canUseYouTube: true, // Pengguna berbayar/VIP selalu berhak memakai lagu YouTube!
          allowedTemplates: codeData.allowed_templates ?? 'all',
          linkDurationDays: durationDays,
        };
      }
    }

    // 3. Jika client menandai user sudah VIP atau memasukkan kode akses apapun
    if (isVipClient) {
      tierLimits = {
        ...tierLimits,
        maxPhotos: 6,
        canUseYouTube: true,
        allowedTemplates: 'all',
        linkDurationDays: null, // VIP langsung terus-terusan (aktif selamanya tanpa batas)
      };
    } else if (cleanCode) {
      tierLimits = {
        ...tierLimits,
        maxPhotos: 6,
        canUseYouTube: true,
        allowedTemplates: 'all',
      };
    }

    // ─── Custom duration days dari input pengirim (jika diatur) ─────────
    const customDurationDays = typeof body?.customDurationDays === 'number' ? body.customDurationDays : null;
    let effectiveDurationDays = tierLimits.linkDurationDays;
    if (customDurationDays !== null) {
      effectiveDurationDays = customDurationDays > 0 ? customDurationDays : null;
    }

    if (config && typeof config === 'object' && config.version === 2) {
      const c = config as GiftConfig;

      // Validasi templateId vs tier
      const allowedTemplates = tierLimits.allowedTemplates;
      const templateAllowed =
        allowedTemplates === 'all' ||
        (Array.isArray(allowedTemplates) && allowedTemplates.includes(c.templateId));

      if (!templateAllowed) {
        return NextResponse.json(
          { success: false, message: 'Template ini memerlukan akses premium.' },
          { status: 403 }
        );
      }

      // Validasi YouTube
      if (c.youtubeVideoId && !tierLimits.canUseYouTube) {
        return NextResponse.json(
          { success: false, message: 'Fitur lagu YouTube memerlukan akses premium.' },
          { status: 403 }
        );
      }

      // Validasi YouTube ID — hanya 11 karakter [A-Za-z0-9_-]
      if (c.youtubeVideoId && !/^[A-Za-z0-9_-]{11}$/.test(c.youtubeVideoId)) {
        return NextResponse.json(
          { success: false, message: 'ID video YouTube tidak valid.' },
          { status: 422 }
        );
      }

      // Validasi judul
      if (c.title && c.title.length > LIMITS.title) {
        return NextResponse.json(
          { success: false, message: `Judul kado maksimal ${LIMITS.title} karakter.` },
          { status: 422 }
        );
      }

      validatedConfig = {
        version: 2,
        templateId: c.templateId || 'klasik',
        giftObjectId: c.giftObjectId || 'envelope',
        effectId: c.effectId || 'petals',
        title: sanitizeText(c.title || '', LIMITS.title),
        youtubeVideoId: tierLimits.canUseYouTube ? (c.youtubeVideoId ?? null) : null,
        youtubeStartSeconds: c.youtubeStartSeconds ?? 0,
        photoCount: Math.min(c.photoCount ?? 0, tierLimits.maxPhotos),
        landingText: sanitizeLandingText(c.landingText),
      };
    }

    // ─── Hitung expires_at berdasarkan tier atau custom days ─────────────
    let expiresAt: string | null = null;
    if (effectiveDurationDays && effectiveDurationDays > 0) {
      const exp = new Date();
      exp.setDate(exp.getDate() + effectiveDurationDays);
      expiresAt = exp.toISOString();
    }

    // ─── Generate ID unik ─────────────────────────────────────────────────
    const uniqueId = `gift_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const giftRecord = {
      id: uniqueId,
      sender_name: cleanSender || 'Seseorang yang Mengagumimu',
      recipient_name: cleanRecipient || 'Untukmu',
      message: cleanMessage || '',
      music_track: musicTrack || 'romantic-piano',
      design_data: designData,
      config: validatedConfig,
      expires_at: expiresAt,
      views_count: 0,
    };

    if (isSupabaseConfigured && dbClient) {
      const { error } = await dbClient.from('digital_gifts').insert(giftRecord);

      if (error) {
        console.error('[Supabase Save Gift Error]:', error.message);
        const { giftsMemoryStore } = await import('@/lib/giftsStorage');
        giftsMemoryStore.set(uniqueId, {
          id: uniqueId,
          senderName: giftRecord.sender_name,
          recipientName: giftRecord.recipient_name,
          message: giftRecord.message,
          musicTrack: giftRecord.music_track,
          designData: designData,
          config: validatedConfig,
          expiresAt: expiresAt,
          createdAt: new Date().toISOString(),
          views: 0,
        });
      }
    } else {
      const { giftsMemoryStore } = await import('@/lib/giftsStorage');
      giftsMemoryStore.set(uniqueId, {
        id: uniqueId,
        senderName: giftRecord.sender_name,
        recipientName: giftRecord.recipient_name,
        message: giftRecord.message,
        musicTrack: giftRecord.music_track,
        designData: designData,
        config: validatedConfig,
        expiresAt: expiresAt,
        createdAt: new Date().toISOString(),
        views: 0,
      });
    }

    return NextResponse.json({
      success: true,
      id: uniqueId,
      shareUrl: `/gift/${uniqueId}`,
      expiresAt,
      message: 'Link buket digital interaktif berhasil dibuat!',
    });
  } catch (error) {
    console.error('Error in /api/gifts POST:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat membuat link hadiah.' },
      { status: 500 }
    );
  }
}
