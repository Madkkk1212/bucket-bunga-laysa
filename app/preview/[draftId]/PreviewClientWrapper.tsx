'use client';

// Wrapper client component — dynamic import dengan ssr:false hanya boleh di Client Component
import dynamic from 'next/dynamic';

const GiftPreviewPage = dynamic(
  () => import('@/components/gift/receiver/GiftPreviewPage'),
  { ssr: false }
);

export default function PreviewClientWrapper({ draftId }: { draftId: string }) {
  return <GiftPreviewPage draftId={draftId} />;
}
