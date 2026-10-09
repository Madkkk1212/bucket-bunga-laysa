'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home, AlertCircle, Sparkles } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error cleanly for debugging
    console.error('Handled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 px-4 py-12 font-sans">
      <div className="max-w-md w-full bg-white/85 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-rose-100 text-center relative z-10">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-md">
          <AlertCircle size={36} />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-rose-700 bg-rose-100/70 mb-3 uppercase">
          Terjadi Kendala
        </span>

        <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">
          Oops, Bunga Sedang Merapikan Diri
        </h2>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          Terjadi sedikit gangguan koneksi atau proses pemuatan. Jangan khawatir, Anda dapat mencoba memuat ulang halaman ini.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 text-white text-sm font-semibold shadow-md shadow-pink-500/25 hover:from-pink-700 hover:to-rose-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw size={16} />
            <span>Coba Lagi</span>
          </button>

          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home size={16} />
            <span>Menu Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
