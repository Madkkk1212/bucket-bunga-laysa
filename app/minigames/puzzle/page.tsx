import type { Metadata } from 'next';
import { DesignProvider } from '@/context/DesignContext';
import PuzzlePageClient from '@/components/puzzle/PuzzlePageClient';

export const metadata: Metadata = {
  title: 'Puzzle Jigsaw — Mini Games · Bucket Bunga Laysa',
  description: 'Mainkan puzzle jigsaw foto interaktif! Pilih foto bunga favoritmu, tentukan tingkat kesulitan, lalu susun kembali potongan jigsawnya.',
  alternates: { canonical: '/minigames/puzzle' },
};

export default function PuzzlePage() {
  return (
    <DesignProvider>
      <PuzzlePageClient />
    </DesignProvider>
  );
}
