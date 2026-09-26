'use client';

import { useState } from 'react';
import DesignerLayout from './DesignerLayout';
import MobileDashboard from '../home/mobile/MobileDashboard';
import MobileStudioView from './MobileStudioView';

export default function DesignerClient() {
  const [mobileTab, setMobileTab] = useState<'dashboard' | 'studio'>('dashboard');

  return (
    <>
      {/* ─── MOBILE VIEW (≤ 768px): 100% Redesigned Purpose-built Mobile App UX ─── */}
      <div className="designer-mobile-only">
        {mobileTab === 'dashboard' ? (
          <MobileDashboard onOpenStudio={() => setMobileTab('studio')} />
        ) : (
          <MobileStudioView onBack={() => setMobileTab('dashboard')} />
        )}
      </div>

      {/* ─── DESKTOP VIEW (> 768px): Full Desktop Studio ─── */}
      <div className="designer-desktop-only">
        <DesignerLayout />
      </div>
    </>
  );
}
