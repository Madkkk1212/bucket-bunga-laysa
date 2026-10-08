import type { Metadata } from 'next';
import { DesignProvider } from '@/context/DesignContext';
import PuzzlePageClient from '@/components/puzzle/PuzzlePageClient';

export const metadata: Metadata = {
  title: 'Puzzle — Bucket Bunga Laysa',
  description: 'Main game puzzle susun foto bunga interaktif',
};

export default function PuzzlePage() {
  return (
    <main className="pg-main">
      <DesignProvider>
        <PuzzlePageClient />
      </DesignProvider>
    </main>
  );
}
