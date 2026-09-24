'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flower, ArrowLeft, BookOpen } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  // ── Stealth Owner Gateway Shortcut ──
  // Akses mudah bagi pemilik tanpa diketahui pengunjung publik:
  // 1. Tekan kombinasi keyboard Ctrl + Shift + A (atau Cmd + Shift + A)
  // 2. Ketuk/klik logo bunga 5x dengan cepat
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretBrandClick = (e: React.MouseEvent) => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1500);

    if (clickCountRef.current >= 5) {
      e.preventDefault();
      clickCountRef.current = 0;
      window.location.href = '/lys-atelier-vault-89x';
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.location.href = '/lys-atelier-vault-89x';
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <nav className="navbar navbar-centered">
      <div className="navbar-inner-centered">
        {!isHome && (
          <Link
            href="/"
            className="navbar-sub-nav-btn navbar-nav-left"
            aria-label="Kembali ke Beranda"
            id="nav-btn-home"
          >
            <ArrowLeft size={15} />
            <span>Beranda</span>
          </Link>
        )}

        <Link
          href="/"
          onClick={handleSecretBrandClick}
          className="navbar-brand-centered"
          aria-label="Bucket Bunga Laysa Home"
        >
          <span className="navbar-brand-icon-wrap">
            <Flower size={20} className="navbar-brand-icon" />
          </span>
          <span className="navbar-brand-text">
            <span className="brand-title">Bucket Bunga</span>
            <span className="brand-accent">Laysa</span>
          </span>
        </Link>

        {!isHome && pathname !== '/tutorial' && (
          <Link
            href="/tutorial"
            className="navbar-sub-nav-btn navbar-nav-right"
            aria-label="Panduan Tutorial"
            id="nav-btn-tutorial"
          >
            <BookOpen size={15} />
            <span>Tutorial</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
