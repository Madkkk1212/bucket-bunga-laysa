import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { HTML_MINIGAME_CATALOG } from '@/components/minigames/htmlMiniGameCatalog';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = HTML_MINIGAME_CATALOG[slug];
  if (!game) return { title: 'Mini Game tidak ditemukan' };
  return {
    title: `${game.title} — Mini Games · Bucket Bunga Laysa`,
    description: `Main ${game.title} bersama teman dengan voice room Bucket Bunga Laysa.`,
    alternates: { canonical: game.route },
  };
}

export default async function HtmlMiniGamePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ room?: string | string[]; role?: string | string[] }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const game = HTML_MINIGAME_CATALOG[slug];
  if (!game) notFound();
  const search = new URLSearchParams();
  if (typeof query.room === 'string') search.set('room', query.room);
  if (typeof query.role === 'string') search.set('role', query.role);
  const queryString = search.toString();
  const suffix = queryString ? `?${queryString}` : '';
  redirect(`${game.route}${suffix}`);
}
