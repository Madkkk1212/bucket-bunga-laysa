// app/preview/[draftId]/page.tsx
// Server Component — hanya pass draftId ke client wrapper

import type { Metadata } from 'next';
import PreviewClientWrapper from './PreviewClientWrapper';

export const metadata: Metadata = {
  title: 'Preview Kado | Studio Buket Laysa',
  description: 'Lihat preview tampilan kado digital sebelum kamu kirimkan ke orang tersayang.',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ draftId: string }>;
}

export default async function PreviewPage({ params }: Props) {
  const { draftId } = await params;
  return <PreviewClientWrapper draftId={draftId} />;
}
