'use client';

import { DesignProvider } from '@/context/DesignContext';
import MobileDashboard from './mobile/MobileDashboard';

export default function MobileHomePage() {
  return (
    <DesignProvider>
      <MobileDashboard />
    </DesignProvider>
  );
}
