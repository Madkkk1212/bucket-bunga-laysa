'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flower } from 'lucide-react';

export default function NotFoundRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location.pathname !== '/pagenotfound') {
        sessionStorage.setItem('laysa_last_invalid_path', window.location.pathname + window.location.search);
      }
    } catch {
      // ignore
    }

    // Immediately replace URL to /pagenotfound
    router.replace('/pagenotfound');
    if (typeof window !== 'undefined' && window.location.pathname !== '/pagenotfound') {
      window.location.replace('/pagenotfound');
    }
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff0f5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#be185d',
        gap: '16px',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <meta name="robots" content="noindex, nofollow" />
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(244, 63, 94, 0.25)',
        }}
      >
        <Flower size={30} className="animate-spin" style={{ animationDuration: '6s' }} />
      </div>
      <p style={{ fontSize: '15px', fontWeight: 600, color: '#881337', margin: 0 }}>
        Mengalihkan...
      </p>
      <Link
        href="/pagenotfound"
        style={{
          fontSize: '13px',
          color: '#db2777',
          textDecoration: 'underline',
        }}
      >
        Klik di sini jika tidak beralih otomatis
      </Link>
    </div>
  );
}
