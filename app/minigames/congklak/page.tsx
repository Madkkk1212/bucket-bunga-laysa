import type { Metadata } from 'next';
import HtmlMiniGameEntry from '@/components/minigames/HtmlMiniGameEntry';
import { HTML_MINIGAME_CATALOG } from '@/components/minigames/htmlMiniGameCatalog';

export const metadata: Metadata = {
  title: 'Congklak 3D — Mini Games · Bucket Bunga Laysa',
  description: 'Main congklak 3D sendiri, berdua di satu perangkat, atau online bersama teman.',
  alternates: { canonical: '/minigames/congklak' },
};

export default async function CongklakPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string | string[]; role?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialRoomCode = typeof params.room === 'string' ? params.room : '';
  const initialRole = params.role === 'host' ? 'host' : params.role === 'guest' ? 'guest' : undefined;

  return <HtmlMiniGameEntry game={HTML_MINIGAME_CATALOG.congklak} initialRoomCode={initialRoomCode} initialRole={initialRole} />;
}
