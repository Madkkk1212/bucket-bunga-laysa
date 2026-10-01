'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { DesignProvider } from '@/context/DesignContext';
import { useLanguage } from '@/context/LanguageContext';

function StudioLoadingFallback() {
  const { t } = useLanguage();
  return (
    <div
      className="ds-root studio-loader-fallback"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        width: '100%',
        color: '#be185d',
        fontFamily: 'var(--font-montserrat, sans-serif)',
        gap: '1rem',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: '#fdf8f5',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(190, 24, 93, 0.2)',
          borderTopColor: '#be185d',
          borderRadius: '50%',
          animation: 'studioSpin 0.9s linear infinite',
        }}
      />
      <style>{`
        @keyframes studioSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, color: '#9d174d' }}>
        {t('designer_loading_fallback')}
      </p>
    </div>
  );
}

const DesignerClient = dynamic(() => import('@/components/designer/DesignerClient'), {
  ssr: false,
  loading: () => <StudioLoadingFallback />,
});

export default function StudioLoader() {
  return (
    <DesignProvider>
      <Suspense fallback={<StudioLoadingFallback />}>
        <DesignerClient />
      </Suspense>
    </DesignProvider>
  );
}
