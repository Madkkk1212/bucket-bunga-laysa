'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ArrowRight, Move, Download, Sparkles, 
  Layers, Palette, Award, ShieldCheck, Heart, Zap, CheckCircle2, ChevronRight
} from 'lucide-react';
import HomeBackgroundVideo from '@/components/home/HomeBackgroundVideo';
import FlowerCountModal from '@/components/designer/FlowerCountModal';
import { FlowerCountVariant } from '@/types/design';
import { DesignProvider } from '@/context/DesignContext';

export default function TutorialPage() {
  return (
    <DesignProvider>
      <TutorialGameContent />
    </DesignProvider>
  );
}

function TutorialGameContent() {
  const router = useRouter();
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [activeStageTab, setActiveStageTab] = useState<number | null>(null);

  // Sound effect synthesizer (Web Audio API - lightweight & fast)
  const playSfx = (type: 'hover' | 'select' | 'portal') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'select') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'portal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Audio context might be restricted before interaction, ignore safely
    }
  };

  const handleConfirmFlowerCount = (count: FlowerCountVariant) => {
    setIsCountModalOpen(false);
    playSfx('portal');
    router.push(`/designer?flowers=${count}`);
  };

  const scrollToStage = (stageId: string, index: number) => {
    playSfx('select');
    setActiveStageTab(index);
    const element = document.getElementById(stageId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="game-tutorial-container game-theme-arena relative min-h-screen">
      {/* ── 1. CINEMATIC VIDEO BACKGROUND ── */}
      <HomeBackgroundVideo />

      {/* ── 2. TOP GAME HUD HEADER ── */}
      <header className="game-hud-topbar" aria-label="Game HUD">
        <div className="game-hud-inner">
          {/* Tombol Kembali ke Menu Game */}
          <Link
            href="/menu"
            className="game-hud-back-btn"
            onClick={() => playSfx('hover')}
            aria-label="Kembali ke Menu Game"
          >
            <ArrowLeft size={15} />
            <span>KEMBALI KE MENU</span>
          </Link>

          {/* Judul Arena / Header Mode */}
          <div className="game-hud-title-wrap">
            <span className="game-hud-subbadge">✦ FLORIST ACADEMY ✦</span>
            <h1 className="game-hud-heading">PANDUAN MERANGKAI BUKET</h1>
          </div>

          {/* Status Pemain / Atelier Badge */}
          <div className="game-hud-player-status">
            <span className="game-hud-badge-icon">📖</span>
            <div className="game-hud-badge-info">
              <span className="game-hud-player-rank">QUEST GUIDEBOOK</span>
              <span className="game-hud-player-level">5 STAGE CEPAT</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── 3. FLOATING FLORAL PARTICLES ── */}
      <div className="floral-frame-decor" aria-hidden="true">
        <span className="floating-petal petal-1">🌸</span>
        <span className="floating-petal petal-2">✨</span>
        <span className="floating-petal petal-3">🌺</span>
        <span className="floating-petal petal-4">🌸</span>
        <span className="floating-petal petal-5">✨</span>
        <span className="floating-petal petal-6">🌷</span>
      </div>

      {/* ── 4. STAGE TIMELINE QUICK BAR (QUEST MAP) ── */}
      <div className="game-tutorial-map-bar">
        <div className="game-tutorial-map-inner">
          <span className="game-map-title">QUEST MAP:</span>
          <div className="game-map-chips">
            {[
              { id: 'stage-1', label: '1. Kertas Buket' },
              { id: 'stage-2', label: '2. Tata Bunga' },
              { id: 'stage-3', label: '3. Kartu Kaligrafi' },
              { id: 'stage-4', label: '4. Cek Desain' },
              { id: 'stage-5', label: '5. Ekspor 4K' },
            ].map((step, idx) => (
              <button
                key={step.id}
                type="button"
                className={`game-map-chip ${activeStageTab === idx ? 'chip-active' : ''}`}
                onClick={() => scrollToStage(step.id, idx)}
                onMouseEnter={() => playSfx('hover')}
              >
                <span>{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. MAIN 5 QUEST STAGES CONTAINER ── */}
      <main className="game-tutorial-main">
        <div className="game-tutorial-content-wrap">

          {/* ══════════ STAGE 1: PILIH KERTAS BUKET ══════════ */}
          <section className="game-stage-card" id="stage-1">
            <div className="game-stage-card-header">
              <div className="game-stage-badge badge-rose">
                <span>STAGE #01 • KERTAS PEMBUNGKUS</span>
              </div>
            </div>

            <div className="game-stage-grid">
              <div className="game-stage-info">
                <h2 className="game-stage-title">Pilih Model & Warna Kertas Buket</h2>
                <p className="game-stage-desc">
                  Tentukan tema buketmu dengan memilih bahan kertas pembungkus premium ala florist profesional:
                </p>

                <div className="game-stage-bullets">
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-rose">✦</span>
                    <div>
                      <strong>Korean Noir Signature:</strong> Kertas matte hitam bersayap origami mewah dan elegan.
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-amber">✦</span>
                    <div>
                      <strong>Korean Golden Kraft:</strong> Warna cokelat kraft keemasan hangat bergaya vintage klasik (<em>Favorit</em>).
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-pink">✦</span>
                    <div>
                      <strong>Pastel Rose & Sky:</strong> Kertas warna pastel lembut bernuansa manis, ceria, dan romantis.
                    </div>
                  </div>
                </div>
              </div>

              <div className="game-stage-visual">
                <div className="game-stage-visual-box">
                  <div className="game-stage-preview-row">
                    <div className="game-mini-thumb">
                      <Image src="/images/bucket/bucket-1.png" alt="Noir" width={75} height={75} />
                      <span>Noir</span>
                    </div>
                    <div className="game-mini-thumb thumb-highlight">
                      <Image src="/images/bucket/bucket-2.png" alt="Kraft" width={85} height={85} />
                      <span>Kraft ★</span>
                    </div>
                    <div className="game-mini-thumb">
                      <Image src="/images/bucket/bucket-3.png" alt="Pastel" width={75} height={75} />
                      <span>Pastel</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ STAGE 2: TATA BUNGA BEBAS DI KANVAS ══════════ */}
          <section className="game-stage-card" id="stage-2">
            <div className="game-stage-card-header">
              <div className="game-stage-badge badge-cyan">
                <span>STAGE #02 • FREE DRAG CANVAS</span>
              </div>
            </div>

            <div className="game-stage-grid">
              <div className="game-stage-info">
                <h2 className="game-stage-title">Susun & Geser Bunga Bebas Manual</h2>
                <p className="game-stage-desc">
                  Kamu memiliki kendali penuh seperti florist sungguhan! Atur posisi setiap tangkai bunga di kanvas:
                </p>

                <div className="game-stage-bullets">
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-cyan">✦</span>
                    <div>
                      <strong>Klik & Geser (Drag):</strong> Sentuh bunga di kanvas lalu geser ke titik mana pun yang kamu inginkan.
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-cyan">✦</span>
                    <div>
                      <strong>Layering Maju/Mundur:</strong> Atur urutan tumpukan bunga agar bunga utama tampil di depan dan filler di belakang.
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-cyan">✦</span>
                    <div>
                      <strong>Rotasi & Sudut Kemiringan:</strong> Putar sudut tangkai bunga agar buket terlihat mekar alami dan bervolume.
                    </div>
                  </div>
                </div>

                <div className="game-stage-pro-tip">
                  <span className="pro-tip-tag">💡 PRO TIP FLORIST:</span>
                  <span>Taruh bunga besar (Mawar/Lily) di tengah, lalu kelilingi dengan Baby&apos;s Breath dan Eucalyptus agar buket rimbun!</span>
                </div>
              </div>

              <div className="game-stage-visual">
                <div className="game-stage-visual-box">
                  <div className="visual-img-container">
                    <Image 
                      src="/images/tutorial/step2_arrange.png" 
                      alt="Tata Bunga Bebas" 
                      width={280} 
                      height={240} 
                      className="game-tutorial-img"
                    />
                    <div className="game-visual-pill">
                      <Move size={13} />
                      <span>Bisa digeser bebas manual</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ STAGE 3: KARTU UCAPAN KALIGRAFI ══════════ */}
          <section className="game-stage-card" id="stage-3">
            <div className="game-stage-card-header">
              <div className="game-stage-badge badge-purple">
                <span>STAGE #03 • INSCRIPTION SPELL</span>
              </div>
            </div>

            <div className="game-stage-grid">
              <div className="game-stage-info">
                <h2 className="game-stage-title">Sematkan Kartu Ucapan Spesial</h2>
                <p className="game-stage-desc">
                  Beri sentuhan emosional dengan menuliskan pesan manis yang otomatis terpasang pada buket:
                </p>

                <div className="game-stage-bullets">
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-purple">✦</span>
                    <div>
                      <strong>Nama Penerima & Pengirim:</strong> Cantumkan nama lengkap atau panggilan romantis kesayangan.
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-purple">✦</span>
                    <div>
                      <strong>Kata Ucapan Estetik:</strong> Ketik pesan sendiri atau gunakan template instan (Wisuda, Ulang Tahun, LDR, Anniversary).
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-purple">✦</span>
                    <div>
                      <strong>Font Kaligrafi Otomatis:</strong> Desain kartu bergaya kaligrafi elegan langsung tertancap di rangkaian bunga buketmu.
                    </div>
                  </div>
                </div>
              </div>

              <div className="game-stage-visual">
                <div className="game-stage-visual-box">
                  <div className="game-card-mockup-frame">
                    <div className="mockup-ribbon">💌 KARTU UCAPAN</div>
                    <div className="mockup-to"><strong>Untuk:</strong> Sarah Az-Zahra</div>
                    <p className="mockup-msg">&ldquo;Selamat atas wisudamu! Semoga setiap langkah barumu dipenuhi keberkahan & kebahagiaan.&rdquo;</p>
                    <div className="mockup-from"><strong>Dari:</strong> Lutfi & Keluarga 💕</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ STAGE 4: CEK DESAIN & HARMONISASI ══════════ */}
          <section className="game-stage-card" id="stage-4">
            <div className="game-stage-card-header">
              <div className="game-stage-badge badge-amber">
                <span>STAGE #04 • QUALITY CHECK</span>
              </div>
            </div>

            <div className="game-stage-grid">
              <div className="game-stage-info">
                <h2 className="game-stage-title">Periksa Kerapian & Pratinjau</h2>
                <p className="game-stage-desc">
                  Sebelum melakukan ekspor akhir, cek kembali komposisi karyamu secara menyeluruh:
                </p>

                <div className="game-stage-bullets">
                  <div className="game-stage-bullet-item">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>Keseimbangan Warna:</strong> Pastikan kombinasi warna bunga utama dan dedaunan saling melengkapi.
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>Bebas Typo:</strong> Pastikan ejaan nama dan kalimat doa di kartu ucapan sudah sempurna.
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>Bisa Diedit Ulang:</strong> Kapan pun ingin merombak posisi bunga, desain tidak akan hilang dan bisa diedit bebas.
                    </div>
                  </div>
                </div>
              </div>

              <div className="game-stage-visual">
                <div className="game-stage-visual-box">
                  <div className="visual-img-container">
                    <Image 
                      src="/images/tutorial/step4_preview.png" 
                      alt="Pratinjau Desain" 
                      width={280} 
                      height={240} 
                      className="game-tutorial-img"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ STAGE 5: EKSPOR GAMBAR ULTRA HD 4K ══════════ */}
          <section className="game-stage-card" id="stage-5">
            <div className="game-stage-card-header">
              <div className="game-stage-badge badge-emerald">
                <span>STAGE #05 • MYTHIC EXPORT</span>
              </div>
            </div>

            <div className="game-stage-grid">
              <div className="game-stage-info">
                <h2 className="game-stage-title">Unduh Hasil Desain Jernih HD & Kirim</h2>
                <p className="game-stage-desc">
                  Tahap pamungkas! Simpan karya seni buketmu ke galeri HP / laptop dengan resolusi super tajam:
                </p>

                <div className="game-stage-bullets">
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-emerald">✦</span>
                    <div>
                      <strong>Download Gratis Tanpa Batas:</strong> Simpan file PNG/JPG kualitas HD jernih tanpa watermark langsung ke perangkatmu.
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-emerald">✦</span>
                    <div>
                      <strong>Jadikan Kado Virtual:</strong> Kirimkan gambar buket bunga cantik ini kepada pasangan, sahabat, atau orang tua sebagai kejutan manis.
                    </div>
                  </div>
                  <div className="game-stage-bullet-item">
                    <span className="bullet-dot dot-emerald">✦</span>
                    <div>
                      <strong>Cetak Fisik Lewat WhatsApp:</strong> Kirim desain buketmu ke admin florist Laysa, dan buket aslinya akan dirangkai persis sesuai desainmu!
                    </div>
                  </div>
                </div>
              </div>

              <div className="game-stage-visual">
                <div className="game-stage-visual-box">
                  <div className="game-export-showcase">
                    <div className="export-aura-ring" />
                    <Image src="/images/home.png" alt="Hasil Buket HD" width={140} height={140} className="export-thumb-img" />
                    <div className="export-pill-btn">
                      <Download size={13} />
                      <span>Unduh HD Gratis</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════ GAME BOSS BANNER / CTA AKHIR ══════════ */}
          <div className="game-tutorial-cta-banner">
            <div className="cta-banner-content">
              <span className="cta-banner-badge">🏆 TUTORIAL COMPLETED</span>
              <h2 className="cta-banner-title">Siap Merangkai Buket Impianmu Sekarang?</h2>
              <p className="cta-banner-desc">
                Semua kontrol dan trik sudah kamu kuasai. Waktunya meluncur ke studio dan ciptakan karya terindahmu!
              </p>
              
              <div className="cta-banner-actions">
                <button
                  type="button"
                  id="btn-tutorial-start"
                  className="game-btn-massive"
                  onClick={() => {
                    playSfx('select');
                    setIsCountModalOpen(true);
                  }}
                >
                  <Sparkles size={20} className="game-sparkle-spin" />
                  <span>MULAI BUAT BUCKET</span>
                  <ArrowRight size={20} className="game-arrow-pulse" />
                </button>

                <Link
                  href="/menu"
                  className="game-hud-back-btn"
                  onClick={() => playSfx('hover')}
                >
                  <ArrowLeft size={16} />
                  <span>Kembali ke Menu Game</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── 6. BOTTOM GAME HUD FOOTER ── */}
      <footer className="game-bottom-hud" aria-label="Game Tutorial Status">
        <div className="game-hud-status">
          <span className="game-status-dot" />
          <span>FLORIST ACADEMY: READY • 5/5 STAGES</span>
        </div>
        <div className="game-hud-hint">
          <span>✨ TEKAN &quot;MULAI BUAT BUCKET&quot; UNTUK MEMULAI MERANGKAI KARYAMU ✨</span>
        </div>
        <div className="game-hud-version">
          <span>VER 2.5 • LAYSA STUDIO</span>
        </div>
      </footer>

      {/* ── 7. FLOWER COUNT MODAL (KETIKA KLIK MULAI) ── */}
      <FlowerCountModal
        isOpen={isCountModalOpen}
        onClose={() => setIsCountModalOpen(false)}
        onConfirm={handleConfirmFlowerCount}
        canDismiss={true}
      />
    </div>
  );
}
