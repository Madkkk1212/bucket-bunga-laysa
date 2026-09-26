import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DesignProvider } from '@/context/DesignContext';
import DesignerClient from '@/components/designer/DesignerClient';

export const metadata: Metadata = {
  title: 'Studio Desain Buket — Bucket Bunga Laysa',
  description:
    'Rancang buket bunga impianmu secara interaktif di Bucket Bunga Laysa. Pilih jenis buket, bunga, kartu ucapan, dan ekspor hasil desain berkualitas tinggi.',
};

export default function DesignerPage() {
  return (
    <DesignProvider>
      <Suspense fallback={<div className="ds-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#888' }}>Memuat Studio Buket...</div>}>
        <DesignerClient />
      </Suspense>
    </DesignProvider>
  );
}
