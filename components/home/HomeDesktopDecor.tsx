'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * Dekorasi bunga di sekeliling layar hanya dimuat di desktop (>= 768px).
 * Menghindarkan mobile dari mengunduh 1.5MB file gambar PNG yang memperlambat LCP & PageSpeed.
 */
export default function HomeDesktopDecor() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsDesktop(true);
    }
  }, []);

  if (!isDesktop) return null;

  return (
    <>
      <div className="decor-flower decor-tl-1">
        <Image src="/images/flowers/rose_pink.png" alt="" width={130} height={130} loading="lazy" sizes="130px" />
      </div>
      <div className="decor-flower decor-tl-2">
        <Image src="/images/flowers/babysbreath_white.png" alt="" width={95} height={95} loading="lazy" sizes="95px" />
      </div>
      <div className="decor-flower decor-tl-3">
        <Image src="/images/flowers/eucalyptus.png" alt="" width={110} height={110} loading="lazy" sizes="110px" />
      </div>
      <div className="decor-flower decor-tr-1">
        <Image src="/images/flowers/hydrangea_pink.png" alt="" width={140} height={140} loading="lazy" sizes="140px" />
      </div>
      <div className="decor-flower decor-tr-2">
        <Image src="/images/flowers/lily_pink.png" alt="" width={105} height={105} loading="lazy" sizes="105px" />
      </div>
      <div className="decor-flower decor-bl-1">
        <Image src="/images/flowers/tulip_pink.png" alt="" width={120} height={120} loading="lazy" sizes="120px" />
      </div>
      <div className="decor-flower decor-bl-2">
        <Image src="/images/flowers/ranunculus_pink.png" alt="" width={100} height={100} loading="lazy" sizes="100px" />
      </div>
    </>
  );
}
