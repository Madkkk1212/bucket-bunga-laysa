'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const GiftReceiverPage = dynamic(
  () => import('@/components/gift/receiver/GiftReceiverPage'),
  {
    ssr: false,
    loading: () => (
      <div
        suppressHydrationWarning
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-4"
      >
        <div className="gift-spinner-ring" />
        <p className="mt-4 text-sm font-medium text-pink-700 animate-pulse">
          Mempersiapkan buket hadiah digital Anda...
        </p>
      </div>
    ),
  }
);

export default function GiftPage() {
  const params = useParams();
  const giftId = (params?.id as string) || '';
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted || !giftId) {
    return (
      <div
        suppressHydrationWarning
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-4"
      >
        <div className="gift-spinner-ring" />
        <p className="mt-4 text-sm font-medium text-pink-700 animate-pulse">
          Mempersiapkan buket hadiah digital Anda...
        </p>
      </div>
    );
  }

  return <GiftReceiverPage giftId={giftId} />;
}

