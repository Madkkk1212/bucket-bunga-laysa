import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import NotFoundClient from '@/components/notfound/NotFoundClient';

export const metadata: Metadata = {
  title: '404: Halaman Tidak Ditemukan — Bucket Bunga Laysa',
  description: 'Kelopak ini hilang arah. Halaman yang kamu tuju mungkin sudah dipindahkan atau tautannya keliru.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PageNotFound() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-rose-50" />}>
      <NotFoundClient />
    </Suspense>
  );
}
