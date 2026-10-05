// app/api/gifts/preview/route.ts
// Route untuk menyimpan draft sementara gift (TTL 30 menit) ke memori server.
// Draft tidak disimpan ke database, hanya ke in-memory Map dengan expiry.
// Digunakan oleh fitur "Preview Kado" sebelum link resmi digenerate.

import { NextRequest, NextResponse } from 'next/server';

interface DraftGift {
  senderName: string;
  recipientName: string;
  message: string;
  designData: Record<string, unknown>;
  config: Record<string, unknown>;
  photos: Array<{ dataUrl: string; altText?: string }>;
  expiresAt: number; // Unix ms
}

// In-memory store (valid untuk sesi server, auto-expired)
const draftStore = new Map<string, DraftGift>();

// Cleanup expired drafts setiap request
function cleanup() {
  const now = Date.now();
  for (const [key, draft] of draftStore.entries()) {
    if (draft.expiresAt < now) draftStore.delete(key);
  }
}

// POST /api/gifts/preview — simpan draft, return draftId
export async function POST(req: NextRequest) {
  try {
    cleanup();
    const body = await req.json();

    const draftId = `draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const draft: DraftGift = {
      senderName: body.senderName || 'Seseorang',
      recipientName: body.recipientName || 'Untukmu',
      message: body.message || '',
      designData: body.designData || {},
      config: body.config || {},
      photos: body.photos || [],
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 menit
    };

    draftStore.set(draftId, draft);

    return NextResponse.json({ success: true, draftId });
  } catch {
    return NextResponse.json({ success: false, message: 'Gagal menyimpan draft.' }, { status: 400 });
  }
}

// GET /api/gifts/preview?id=draft_xxx — ambil draft
export async function GET(req: NextRequest) {
  cleanup();
  const draftId = req.nextUrl.searchParams.get('id');
  if (!draftId) {
    return NextResponse.json({ success: false, message: 'Missing draft ID.' }, { status: 400 });
  }

  const draft = draftStore.get(draftId);
  if (!draft) {
    return NextResponse.json({ success: false, message: 'Draft not found or expired.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, draft });
}

// PUT /api/gifts/preview — perbarui draft yang sedang diedit di preview
export async function PUT(req: NextRequest) {
  try {
    cleanup();
    const body = await req.json();
    const { draftId, ...updates } = body;

    if (!draftId) {
      return NextResponse.json({ success: false, message: 'Missing draft ID.' }, { status: 400 });
    }

    const existing = draftStore.get(draftId);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Draft not found or expired.' }, { status: 404 });
    }

    const updated: DraftGift = {
      ...existing,
      ...(updates.senderName !== undefined ? { senderName: updates.senderName } : {}),
      ...(updates.recipientName !== undefined ? { recipientName: updates.recipientName } : {}),
      ...(updates.message !== undefined ? { message: updates.message } : {}),
      ...(updates.photos !== undefined ? { photos: updates.photos } : {}),
      config: {
        ...(existing.config || {}),
        ...(updates.config || {}),
      },
      expiresAt: Date.now() + 30 * 60 * 1000, // extend 30 menit
    };

    draftStore.set(draftId, updated);
    return NextResponse.json({ success: true, draft: updated });
  } catch {
    return NextResponse.json({ success: false, message: 'Gagal memperbarui draft.' }, { status: 500 });
  }
}
