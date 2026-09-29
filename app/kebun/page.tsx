import type { Metadata } from 'next';
import { DesignProvider } from '@/context/DesignContext';
import IsometricGardenView from '@/components/garden/IsometricGardenView';

export const metadata: Metadata = {
  title: 'Kebun Bunga 3D Isometrik — Bucket Bunga Laysa',
  description:
    'Rawat kebun bunga 3D isometrik 5x5 bersama pasangan. Tanam mawar, anggrek, tulip, siram tiap hari dengan kaleng air interaktif, dan pelihara api streak harian.',
};

export default function KebunPage() {
  return (
    <DesignProvider>
      <IsometricGardenView />
    </DesignProvider>
  );
}
