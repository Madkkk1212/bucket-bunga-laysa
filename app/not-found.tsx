'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Sparkles, ArrowLeft, Flower } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 px-4 py-12 relative overflow-hidden font-sans">
      {/* Decorative Floral Floating Particles */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-40">
        <span className="absolute top-10 left-10 text-4xl animate-bounce">🌸</span>
        <span className="absolute top-1/4 right-12 text-3xl animate-pulse">✨</span>
        <span className="absolute bottom-20 left-1/5 text-4xl animate-bounce" style={{ animationDelay: '1s' }}>🌺</span>
        <span className="absolute bottom-12 right-1/4 text-3xl animate-pulse" style={{ animationDelay: '1.5s' }}>🌷</span>
      </div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-pink-100/80 text-center relative z-10 transition-all">
        {/* Emblem */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-500/25">
          <Flower size={42} className="text-white animate-spin" style={{ animationDuration: '12s' }} />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-pink-700 bg-pink-100/70 mb-3 uppercase">
          404 • Halaman Tidak Ditemukan
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 tracking-tight">
          Kelopak Ini Hilang Arah
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
          Halaman yang Anda tuju mungkin sudah dipindahkan atau tautan yang dimasukkan keliru. Mari kembali ke taman buket bunga kami!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-white text-sm font-semibold shadow-md shadow-pink-500/25 hover:from-pink-700 hover:to-rose-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles size={16} />
            <span>Menu Utama</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home size={16} />
            <span>Ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
