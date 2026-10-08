import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Mini Games — Bucket Bunga Laysa',
  robots: { index: false },
};

export default function KebunPage() {
  redirect('/minigames');
}
