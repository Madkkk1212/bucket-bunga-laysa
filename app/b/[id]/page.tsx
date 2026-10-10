import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import GiftShortUnboxing from '@/components/gift/GiftShortUnboxing';
import { getLocalGift, type StoredGift } from '@/lib/giftsStorage';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getAdminClient } from '@/utils/supabase/admin';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchGiftData(id: string): Promise<StoredGift | null> {
  if (!id) return null;

  // 1. Try local storage (fastest)
  const local = getLocalGift(id);
  if (local) return local;

  // 2. Try Supabase
  try {
    const dbClient = getAdminClient() || supabase;
    if (isSupabaseConfigured && dbClient) {
      const { data, error } = await dbClient
        .from('digital_gifts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          senderName: data.sender_name,
          recipientName: data.recipient_name,
          message: data.message,
          musicTrack: data.music_track || 'romantic-piano',
          designData: data.design_data,
          createdAt: data.created_at,
          views: data.views_count || 0,
        };
      }
    }
  } catch (err) {
    console.warn('[app/b/[id]] Fetch gift error:', err);
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const gift = await fetchGiftData(id);

  if (!gift) {
    return {
      title: 'Buket Bunga Tidak Ditemukan — Bucket Bunga Laysa',
      description: 'Link kado buket bunga virtual tidak ditemukan atau sudah berakhir.',
    };
  }

  const title = `Buket Bunga dari ${gift.senderName} untuk ${gift.recipientName} 🌸`;
  const description = `Buka kado buket bunga virtual dan pesan manis di Studio Buket Bunga Laysa.`;

  return {
    title,
    description,
    openGraph: {
      title: `Buket Bunga untuk ${gift.recipientName} 💌`,
      description: `Ada kejutan buket bunga virtual spesial dari ${gift.senderName}! Buka kadonya sekarang.`,
      url: `/b/${id}`,
      siteName: 'Bucket Bunga Laysa',
      images: [
        {
          url: '/images/home.webp',
          width: 800,
          height: 800,
          alt: 'Buket Bunga Virtual',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/home.webp'],
    },
  };
}

export default async function ShortGiftPage({ params }: PageProps) {
  const { id } = await params;
  const gift = await fetchGiftData(id);

  if (!gift) {
    redirect('/pagenotfound');
  }

  return <GiftShortUnboxing gift={gift} />;
}
