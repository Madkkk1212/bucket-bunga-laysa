import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  ArrowRight, 
  Move, 
  Download, 
  Sparkles, 
  Flower2
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Panduan Praktis — Bucket Bunga Laysa',
  description:
    'Panduan ringkas dan to-the-point cara merancang buket bunga di Bucket Bunga Laysa dalam 5 langkah cepat.',
};

export default function TutorialPage() {
  return (
    <div className="tutorial-page theme-pink-tutorial">
      {/* ─── TOPBAR NAVIGASI ─── */}
      <header className="tutorial-topbar">
        <div className="tutorial-topbar-inner">
          <Link href="/" className="tutorial-back-btn" id="btn-tutorial-back">
            <ArrowLeft size={15} />
            <span>Beranda</span>
          </Link>

          <Link href="/" className="tutorial-brand" aria-label="Beranda Bucket Bunga Laysa">
            <span className="tutorial-brand-icon">
              <Flower2 size={16} />
            </span>
            <div className="tutorial-brand-text">
              <span className="tutorial-brand-title">Bucket Bunga</span>
              <span className="tutorial-brand-accent">Laysa</span>
            </div>
          </Link>

          <Link href="/designer" className="tutorial-top-cta" id="btn-tutorial-start-top">
            <span>Mulai Rancang</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* ─── HEADER RINGKAS & TO THE POINT ─── */}
      <section className="tutorial-hero-compact">
        <div className="tutorial-container">
          <span className="tutorial-pill-badge">PANDUAN 5 LANGKAH CEPAT</span>
          <h1 className="tutorial-heading">Cara Merancang Buket Impianmu</h1>
          <p className="tutorial-subtext">
            Tanpa ribet. Ikuti langkah praktis berikut untuk merangkai buket bunga kustommu sendiri:
          </p>

          {/* Quick Step Bar / Timeline */}
          <div className="steps-quickbar">
            <a href="#step-1" className="quickbar-step">
              <span className="q-num">1</span>
              <span className="q-label">Jenis Bucket</span>
            </a>
            <span className="q-arrow">→</span>
            <a href="#step-2" className="quickbar-step">
              <span className="q-num">2</span>
              <span className="q-label">Tata Bunga</span>
            </a>
            <span className="q-arrow">→</span>
            <a href="#step-3" className="quickbar-step">
              <span className="q-num">3</span>
              <span className="q-label">Kartu Ucapan</span>
            </a>
            <span className="q-arrow">→</span>
            <a href="#step-4" className="quickbar-step">
              <span className="q-num">4</span>
              <span className="q-label">Cek Desain</span>
            </a>
            <span className="q-arrow">→</span>
            <a href="#step-5" className="quickbar-step">
              <span className="q-num">5</span>
              <span className="q-label">Unduh Desain</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 5 LANGKAH PRAKTIS ─── */}
      <main className="tutorial-steps-container">
        <div className="tutorial-container">

          {/* LANGKAH 1 */}
          <div className="step-card-compact" id="step-1">
            <div className="step-badge-circle">1</div>
            <div className="step-main-content">
              <h2 className="step-heading-compact">Pilih Jenis Bucket</h2>
              <p className="step-lead">Pilih model dan warna pembungkus buket yang kamu sukai:</p>
              
              <div className="step-points-compact">
                <div className="point-row">
                  <span className="point-bullet">•</span>
                  <div>
                    <strong>Korean Noir Signature</strong>: Wrap hitam matte bersayap origami dengan pita garis hitam-putih mewah.
                  </div>
                </div>
                <div className="point-row highlight-row">
                  <span className="point-bullet">•</span>
                  <div>
                    <strong>Korean Golden Kraft</strong>: Wrap cokelat kraft keemasan hangat bergaya vintage klasik (<em>Paling Favorit</em>).
                  </div>
                </div>
                <div className="point-row">
                  <span className="point-bullet">•</span>
                  <div>
                    <strong>Korean Pastel Rose</strong>: Wrap pink pastel lembut bernuansa manis & romantis.
                  </div>
                </div>
              </div>
            </div>

            <div className="step-visual-compact">
              <div className="size-preview-mini-grid">
                <div className="size-mini-box">
                  <Image src="/images/bucket/bucket-1.png" alt="Korean Noir" width={80} height={80} />
                  <span>Noir (Hitam)</span>
                </div>
                <div className="size-mini-box active">
                  <Image src="/images/bucket/bucket-2.png" alt="Golden Kraft" width={90} height={90} />
                  <span>Kraft (Cokelat)</span>
                  <span className="badge-pop">Favorit</span>
                </div>
                <div className="size-mini-box">
                  <Image src="/images/bucket/bucket-3.png" alt="Pastel Rose" width={80} height={80} />
                  <span>Rose (Pink)</span>
                </div>
              </div>
            </div>
          </div>

          {/* LANGKAH 2 */}
          <div className="step-card-compact" id="step-2">
            <div className="step-badge-circle">2</div>
            <div className="step-main-content">
              <h2 className="step-heading-compact">Pilih Bunga & Geser Bebas di Kanvas</h2>
              <p className="step-lead">Kamu bisa mengatur posisi setiap bunga secara bebas (manual):</p>
              
              <div className="step-points-compact">
                <div className="point-row">
                  <span className="point-bullet">1.</span>
                  <div>
                    <strong>Pilih Bunga</strong>: Klik bunga dari katalog (Mawar, Lily, Tulip, Baby&apos;s Breath, Eucalyptus, dll).
                  </div>
                </div>
                <div className="point-row">
                  <span className="point-bullet">2.</span>
                  <div>
                    <strong>Geser Manual</strong>: Klik & <strong>tahan (drag) bunga</strong> langsung di kanvas ke posisi mana pun yang kamu mau.
                  </div>
                </div>
                <div className="point-row">
                  <span className="point-bullet">3.</span>
                  <div>
                    <strong>Atur Layer & Posisi</strong>: Gunakan tombol <strong>Maju / Mundur</strong> agar tumpukan bunga rapi, dan tombol <strong>Putar</strong> untuk memiringkan bunga.
                  </div>
                </div>
              </div>

              <div className="quick-tip-box">
                💡 <strong>Tips Cepat:</strong> Taruh bunga besar (Mawar/Lily) di tengah, lalu isi pinggirnya dengan Baby&apos;s Breath dan dedaunan agar buket kelihatan rimbun.
              </div>
            </div>

            <div className="step-visual-compact">
              <div className="visual-compact-frame">
                <Image 
                  src="/images/tutorial/step2_arrange.png" 
                  alt="Geser Bunga Manual" 
                  width={340} 
                  height={300} 
                  className="compact-img"
                />
                <div className="compact-img-tag">
                  <Move size={14} />
                  <span>Bisa digeser bebas sesukamu</span>
                </div>
              </div>
            </div>
          </div>

          {/* LANGKAH 3 */}
          <div className="step-card-compact" id="step-3">
            <div className="step-badge-circle">3</div>
            <div className="step-main-content">
              <h2 className="step-heading-compact">Tulis Kartu Ucapan</h2>
              <p className="step-lead">Sematkan pesan manis untuk penerima:</p>
              
              <div className="step-points-compact">
                <div className="point-row">
                  <span className="point-bullet">•</span>
                  <div>
                    <strong>Nama Penerima & Pengirim</strong>: Tuliskan nama lengkap atau panggilan sayang.
                  </div>
                </div>
                <div className="point-row">
                  <span className="point-bullet">•</span>
                  <div>
                    <strong>Isi Pesan</strong>: Ketik ucapan sendiri atau pilih <strong>template instan</strong> (Wisuda, Ultah, Anniversary).
                  </div>
                </div>
                <div className="point-row">
                  <span className="point-bullet">•</span>
                  <div>
                    <strong>Kartu Otomatis Terpasang</strong>: Desain kartu akan langsung muncul di buket bunga.
                  </div>
                </div>
              </div>
            </div>

            <div className="step-visual-compact">
              <div className="compact-card-mockup">
                <div className="mockup-header-tag">💌 Kartu Ucapan</div>
                <div className="mockup-line"><strong>Untuk:</strong> Sarah Az-Zahra</div>
                <p className="mockup-text">&ldquo;Happy graduation! Sukses selalu untuk langkah barumu.&rdquo;</p>
                <div className="mockup-line"><strong>Dari:</strong> Lutfi & Keluarga</div>
              </div>
            </div>
          </div>

          {/* LANGKAH 4 */}
          <div className="step-card-compact" id="step-4">
            <div className="step-badge-circle">4</div>
            <div className="step-main-content">
              <h2 className="step-heading-compact">Cek Pratinjau Desain</h2>
              <p className="step-lead">Periksa kembali hasil karyamu sebelum selesai:</p>
              
              <div className="step-points-compact">
                <div className="point-row">
                  <span className="point-check">✓</span>
                  <div><strong>Kerapian Bunga</strong>: Pastikan susunan warna dan tinggi bunga sudah seimbang.</div>
                </div>
                <div className="point-row">
                  <span className="point-check">✓</span>
                  <div><strong>Teks Kartu</strong>: Pastikan nama dan pesan ucapan sudah benar bebas dari salah ketik.</div>
                </div>
                <div className="point-row">
                  <span className="point-check">✓</span>
                  <div><strong>Bisa Diedit Kembali</strong>: Kalau mau ubah posisi bunga, tinggal klik tombol <em>Kembali</em>. Desain tidak akan hilang.</div>
                </div>
              </div>
            </div>

            <div className="step-visual-compact">
              <div className="visual-compact-frame">
                <Image 
                  src="/images/tutorial/step4_preview.png" 
                  alt="Pratinjau Buket" 
                  width={340} 
                  height={300} 
                  className="compact-img"
                />
              </div>
            </div>
          </div>

          {/* LANGKAH 5 */}
          <div className="step-card-compact" id="step-5">
            <div className="step-badge-circle">5</div>
            <div className="step-main-content">
              <h2 className="step-heading-compact">Pratinjau & Unduh Desain HD</h2>
              <p className="step-lead">Tahap akhir untuk memeriksa hasil rangkaian dan menyimpan desain:</p>
              
              <div className="step-points-compact">
                <div className="point-row">
                  <span className="point-bullet">1.</span>
                  <div>
                    <strong>Periksa Kerapian</strong>: Pastikan posisi bunga, sudut rotasi, dan pesan kartu ucapan sudah sempurna.
                  </div>
                </div>
                <div className="point-row">
                  <span className="point-bullet">2.</span>
                  <div>
                    <strong>Unduh Gambar (PNG/JPG)</strong>: Klik tombol <strong>Unduh Desain</strong> untuk menyimpan gambar berkualitas tinggi (HD) tanpa watermark.
                  </div>
                </div>
                <div className="point-row">
                  <span className="point-bullet">3.</span>
                  <div>
                    <strong>Kirim ke WhatsApp Florist</strong>: Kirim gambar hasil download ke WhatsApp admin kami, dan florist kami akan langsung merangkainya sesuai desainmu!
                  </div>
                </div>
              </div>
            </div>

            <div className="step-visual-compact">
              <div className="compact-preview-box">
                <div className="compact-preview-ring">
                  <Sparkles size={16} className="compact-rotate-icon text-amber-500" />
                  <span>Hasil Desain HD</span>
                </div>
                <Image src="/images/home.png" alt="Buket Bunga Laysa" width={180} height={180} className="compact-bouquet" />
                <div className="compact-dl-btn">
                  <Download size={14} />
                  <span>Unduh Desain (PNG)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── BOTTOM CTA RINGKAS ─── */}
          <div className="tutorial-cta-box">
            <h3>Siap Merangkai Buketmu Sekarang?</h3>
            <p>Langsung coba aplikasinya, pilih bunganya, dan atur sesuka hatimu.</p>
            <div className="cta-box-buttons">
              <Link href="/designer" className="btn-cta-primary" id="btn-tutorial-start-bottom">
                <span>MULAI RANCANG BUKET</span>
                <ArrowRight size={17} />
              </Link>
              <Link href="/" className="btn-cta-secondary">
                <span>Kembali ke Beranda</span>
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
