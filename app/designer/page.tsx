import type { Metadata } from 'next';
import { DesignProvider } from '../context/DesignContext';
import DesignerLayout from '../components/designer/DesignerLayout';

export const metadata: Metadata = {
  title: 'Studio Desain Buket — Bucket Bunga Laysa',
  description:
    'Rancang buket bunga impianmu secara interaktif di Bucket Bunga Laysa. Pilih jenis buket, bunga, kartu ucapan, dan ekspor hasil desain berkualitas tinggi.',
};

export default function DesignerPage() {
  return (
    <DesignProvider>
      <DesignerLayout />
    </DesignProvider>
  );
}
