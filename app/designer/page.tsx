import type { Metadata } from 'next';
import StudioLoader from './StudioLoader';
import ClientTranslation from './ClientTranslation';
import './designer-seo.css';

export const metadata: Metadata = {
  title: 'Studio Buat Buket — Bucket Bunga Laysa',
  description:
    'Rancang buket bunga virtual sesukamu secara gratis. Pilih dari 56+ model kertas buket, padukan 53+ varietas bunga botani di kanvas interaktif, tulis kartu ucapan, dan ekspor gambar HD (PNG/JPG) atau kado link dengan musik.',
  alternates: {
    canonical: '/designer',
  },
  openGraph: {
    title: 'Studio Buat Buket — Bucket Bunga Laysa',
    description:
      'Rancang buket bunga virtual sesukamu secara gratis. Pilih dari 56+ model kertas buket, padukan 53+ varietas bunga botani di kanvas interaktif, tulis kartu ucapan, dan ekspor gambar HD (PNG/JPG) atau kado link dengan musik.',
    url: 'https://bucketbunga-laysa.vercel.app/designer',
    siteName: 'Bucket Bunga Laysa',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/images/home.png',
        width: 1200,
        height: 630,
        alt: 'Bucket Bunga Laysa — Studio Buat Buket',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Studio Buat Buket — Bucket Bunga Laysa',
    description:
      'Rancang buket bunga virtual sesukamu secara gratis. Pilih dari 56+ model kertas buket, padukan 53+ varietas bunga botani di kanvas interaktif, tulis kartu ucapan, dan ekspor gambar HD (PNG/JPG) atau kado link dengan musik.',
    images: ['/images/home.png'],
  },
};

export default function DesignerPage() {
  return (
    <div className="designer-page-wrapper">
      {/* ── 1. Studio Canvas & UI (Client-Side dynamic with ssr: false & Suspense) ── */}
      <StudioLoader />

      {/* ── 2. User-Visible SEO Guide, 5 Steps & FAQ (Server-Rendered HTML & Bilingual) ── */}
      <section className="designer-seo-section" aria-labelledby="designer-seo-h1">
        <div className="designer-seo-container">
          {/* Header & Short Intro Paragraph */}
          <header className="designer-seo-header">
            <span className="designer-seo-badge">
              ✦ Studio Buket Bunga Virtual ✦
            </span>
            <h1 id="designer-seo-h1" className="designer-seo-title">
              <ClientTranslation k="designer_seo_h1" />
            </h1>
            <p className="designer-seo-intro">
              <ClientTranslation k="designer_seo_intro" />
            </p>
          </header>

          {/* 5 Studio Steps */}
          <div className="designer-seo-steps-block">
            <h2 className="designer-seo-subheading">
              <ClientTranslation k="designer_seo_steps_title" />
            </h2>
            <div className="designer-seo-steps-grid">
              {/* Step 1 */}
              <article className="designer-seo-step-card">
                <span className="designer-seo-step-badge">
                  <ClientTranslation k="designer_seo_step1_badge" />
                </span>
                <h3 className="designer-seo-step-title">
                  <ClientTranslation k="designer_seo_step1_title" />
                </h3>
                <p className="designer-seo-step-desc">
                  <ClientTranslation k="designer_seo_step1_desc" />
                </p>
              </article>

              {/* Step 2 */}
              <article className="designer-seo-step-card">
                <span className="designer-seo-step-badge">
                  <ClientTranslation k="designer_seo_step2_badge" />
                </span>
                <h3 className="designer-seo-step-title">
                  <ClientTranslation k="designer_seo_step2_title" />
                </h3>
                <p className="designer-seo-step-desc">
                  <ClientTranslation k="designer_seo_step2_desc" />
                </p>
              </article>

              {/* Step 3 */}
              <article className="designer-seo-step-card">
                <span className="designer-seo-step-badge">
                  <ClientTranslation k="designer_seo_step3_badge" />
                </span>
                <h3 className="designer-seo-step-title">
                  <ClientTranslation k="designer_seo_step3_title" />
                </h3>
                <p className="designer-seo-step-desc">
                  <ClientTranslation k="designer_seo_step3_desc" />
                </p>
              </article>

              {/* Step 4 */}
              <article className="designer-seo-step-card">
                <span className="designer-seo-step-badge">
                  <ClientTranslation k="designer_seo_step4_badge" />
                </span>
                <h3 className="designer-seo-step-title">
                  <ClientTranslation k="designer_seo_step4_title" />
                </h3>
                <p className="designer-seo-step-desc">
                  <ClientTranslation k="designer_seo_step4_desc" />
                </p>
              </article>

              {/* Step 5 */}
              <article className="designer-seo-step-card">
                <span className="designer-seo-step-badge">
                  <ClientTranslation k="designer_seo_step5_badge" />
                </span>
                <h3 className="designer-seo-step-title">
                  <ClientTranslation k="designer_seo_step5_title" />
                </h3>
                <p className="designer-seo-step-desc">
                  <ClientTranslation k="designer_seo_step5_desc" />
                </p>
              </article>
            </div>
          </div>

          {/* FAQ with 5 Questions using <details> */}
          <div className="designer-seo-faq-block">
            <h2 className="designer-seo-subheading">
              <ClientTranslation k="designer_seo_faq_title" />
            </h2>
            <div className="designer-seo-faq-list">
              {/* FAQ 1 */}
              <details className="designer-seo-details">
                <summary className="designer-seo-summary">
                  <span>
                    <ClientTranslation k="designer_seo_faq1_q" />
                  </span>
                  <span className="designer-seo-summary-icon" aria-hidden="true">▼</span>
                </summary>
                <div className="designer-seo-answer">
                  <p>
                    <ClientTranslation k="designer_seo_faq1_a" />
                  </p>
                </div>
              </details>

              {/* FAQ 2 */}
              <details className="designer-seo-details">
                <summary className="designer-seo-summary">
                  <span>
                    <ClientTranslation k="designer_seo_faq2_q" />
                  </span>
                  <span className="designer-seo-summary-icon" aria-hidden="true">▼</span>
                </summary>
                <div className="designer-seo-answer">
                  <p>
                    <ClientTranslation k="designer_seo_faq2_a" />
                  </p>
                </div>
              </details>

              {/* FAQ 3 */}
              <details className="designer-seo-details">
                <summary className="designer-seo-summary">
                  <span>
                    <ClientTranslation k="designer_seo_faq3_q" />
                  </span>
                  <span className="designer-seo-summary-icon" aria-hidden="true">▼</span>
                </summary>
                <div className="designer-seo-answer">
                  <p>
                    <ClientTranslation k="designer_seo_faq3_a" />
                  </p>
                </div>
              </details>

              {/* FAQ 4 */}
              <details className="designer-seo-details">
                <summary className="designer-seo-summary">
                  <span>
                    <ClientTranslation k="designer_seo_faq4_q" />
                  </span>
                  <span className="designer-seo-summary-icon" aria-hidden="true">▼</span>
                </summary>
                <div className="designer-seo-answer">
                  <p>
                    <ClientTranslation k="designer_seo_faq4_a" />
                  </p>
                </div>
              </details>

              {/* FAQ 5 */}
              <details className="designer-seo-details">
                <summary className="designer-seo-summary">
                  <span>
                    <ClientTranslation k="designer_seo_faq5_q" />
                  </span>
                  <span className="designer-seo-summary-icon" aria-hidden="true">▼</span>
                </summary>
                <div className="designer-seo-answer">
                  <p>
                    <ClientTranslation k="designer_seo_faq5_a" />
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
