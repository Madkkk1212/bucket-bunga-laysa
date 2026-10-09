import type { Metadata } from 'next';
import SnakeLaddersHtml from '@/components/minigames/SnakeLaddersHtml';

export const metadata: Metadata = {
  title: 'Ular Tangga — Mini Games · Bucket Bunga Laysa',
  description: 'Main ular tangga klasik bersama teman. Lempar dadu, naik tangga, hindari ular, dan capai kotak 100.',
  alternates: { canonical: '/minigames/ular-tangga' },
};

export default async function SnakeLaddersPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string | string[]; role?: string | string[] }>;
}) {
  const params = await searchParams;
  const room = typeof params.room === 'string' && params.role === 'guest' ? params.room : '';

  return <SnakeLaddersHtml initialRoomCode={room} />;
}
