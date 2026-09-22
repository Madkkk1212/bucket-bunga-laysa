'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flower, ArrowLeft, BookOpen } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <nav className="navbar navbar-centered">
      <div className="navbar-inner-centered">
        {!isHome && (
          <Link href="/" className="navbar-sub-nav-btn navbar-nav-left" aria-label="Kembali ke Beranda" id="nav-btn-home">
            <ArrowLeft size={15} />
            <span>Beranda</span>
          </Link>
        )}

        <Link href="/" className="navbar-brand-centered" aria-label="Bucket Bunga Laysa Home">
          <span className="navbar-brand-icon-wrap">
            <Flower size={20} className="navbar-brand-icon" />
          </span>
          <span className="navbar-brand-text">
            <span className="brand-title">Bucket Bunga</span>
            <span className="brand-accent">Laysa</span>
          </span>
        </Link>

        {!isHome && pathname !== '/tutorial' && (
          <Link href="/tutorial" className="navbar-sub-nav-btn navbar-nav-right" aria-label="Panduan Tutorial" id="nav-btn-tutorial">
            <BookOpen size={15} />
            <span>Tutorial</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
