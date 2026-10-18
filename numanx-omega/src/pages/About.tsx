import { Link } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import Breadcrumbs from '../components/ui/Breadcrumbs'

export default function About() {
  return (
    <article className="space-y-8 max-w-3xl mx-auto py-2">
      <SEOHead
        title="About NumanX Omega — Universal Unit Conversion Platform"
        description="Learn about NumanX Omega: 100% client-side privacy, NIST SP 811 metrology standards, offline PWA support, and sub-nanometer scientific calculation engine."
        path="/about"
      />

      {/* Breadcrumbs matching Image 2 */}
      <Breadcrumbs
        items={[{ label: 'About' }]}
        backTo={{ label: 'All Tools', path: '/categories' }}
      />

      {/* Header */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] text-xs font-semibold">
          <span>🔬 Metrology Standards & Engineering Mission</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
          About NumanX Omega
        </h1>
        <p className="text-sm sm:text-base text-[var(--text2)] leading-relaxed">
          NumanX Omega is an open, high-precision, zero-latency unit conversion and calculation engine built for engineers, researchers, students, and everyday power users.
        </p>
      </header>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2">
          <div className="text-2xl" aria-hidden="true">🛡️</div>
          <h2 className="text-base font-bold text-[var(--text)]">100% Client-Side Privacy</h2>
          <p className="text-xs text-[var(--text2)] leading-relaxed">
            All conversions and formulas run entirely inside your browser via local JavaScript. No numbers, notes, or calculations are ever transmitted to an external server.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2">
          <div className="text-2xl" aria-hidden="true">📏</div>
          <h2 className="text-base font-bold text-[var(--text)]">NIST & BIPM Standards</h2>
          <p className="text-xs text-[var(--text2)] leading-relaxed">
            Every conversion coefficient adheres strictly to NIST SP 811 (Guide for the Use of the International System of Units) and the BIPM SI Brochure (9th Edition).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2">
          <div className="text-2xl" aria-hidden="true">⚡</div>
          <h2 className="text-base font-bold text-[var(--text)]">Sub-Nanometer Precision</h2>
          <p className="text-xs text-[var(--text2)] leading-relaxed">
            Our calculation engine eliminates IEEE-754 binary floating-point noise using 14 significant figures without zeroing sub-nanometer or astronomical values.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2">
          <div className="text-2xl" aria-hidden="true">📱</div>
          <h2 className="text-base font-bold text-[var(--text)]">Offline PWA Architecture</h2>
          <p className="text-xs text-[var(--text2)] leading-relaxed">
            Equipped with service workers and local caching so you can calculate anywhere—on flights, job sites, and offline remote locations without internet access.
          </p>
        </div>
      </div>

      {/* Explore Links */}
      <section className="p-6 rounded-2xl bg-[var(--card2)] border border-[var(--border)] space-y-4 text-center">
        <h2 className="text-lg font-bold text-[var(--text)]">Ready to Explore?</h2>
        <p className="text-xs sm:text-sm text-[var(--text2)] max-w-md mx-auto">
          Access all 24 conversion categories, live currency rates, crypto prices, and in-depth blog tutorials.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
          <Link
            to="/categories"
            className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm shadow-[var(--glow)]"
          >
            Browse All Tools →
          </Link>
          <Link
            to="/blog"
            className="px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-xs font-semibold hover:bg-[var(--border)] transition-colors"
          >
            Read the Blog
          </Link>
        </div>
      </section>
    </article>
  )
}
