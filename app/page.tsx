import type { Metadata } from 'next';
import Image from 'next/image';
import { Sparkles, Trophy, Flame } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import HeroActions from '@/components/home/HeroActions';
import HomeClientView from '@/components/home/HomeClientView';
import { DesignProvider } from '@/context/DesignContext';

export const metadata: Metadata = {
  title: 'Bucket Bunga Laysa — Bikin Buket Bunga Online & Hadiah Virtual Gratis',
  description:
    'Rancang buket bunga virtual interaktif gratis untuk Ulang Tahun, Wisuda, Sidang Skripsi, Sahabat, dan Pacar LDR. Susun 30+ bunga aesthetic, tulis kartu ucapan, dan unduh gambar HD seketika.',
};

export default function HomePage() {
  return (
    <DesignProvider>
      <HomeClientView />
    </DesignProvider>
  );
}
