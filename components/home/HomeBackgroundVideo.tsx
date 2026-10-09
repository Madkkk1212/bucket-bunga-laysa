'use client';

import React, { useState, useEffect } from 'react';

export default function HomeBackgroundVideo() {
  const [canLoadVideo, setCanLoadVideo] = useState(false);

  useEffect(() => {
    // Hindari mengunduh video 7.4MB di perangkat mobile dengan koneksi seluler lambat
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
    const isSaveData = (navigator as any)?.connection?.saveData === true;
    if (isDesktop && !isSaveData) {
      setCanLoadVideo(true);
    }
  }, []);

  return (
    <div className="home-video-bg-container" aria-hidden="true">
      {canLoadVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="home-video-bg"
        >
          <source src="/home.mp4" type="video/mp4" />
        </video>
      ) : null}
      <div className="home-video-overlay" />
    </div>
  );
}
