import { Link } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import { PAGE_META } from '../config/pageMeta'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { AUTHORITY_SOURCES_LIST } from '../config/authoritySources'

export default function About() {
  return (
    <article className="space-y-8 max-w-3xl mx-auto py-2">
      <SEOHead
        {...PAGE_META['/about']}
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
          About Omega X Converter
        </h1>
        <p className="text-sm sm:text-base text-[var(--text2)] leading-relaxed">
          Omega X Converter by NumanX Studio is an open, high-precision, zero-latency unit conversion and calculation engine built for engineers, researchers, students, and everyday power users.
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

      {/* Authoritative Standards & Primary References */}
      <section aria-labelledby="standards-heading" className="space-y-4 pt-2">
        <div className="space-y-1">
          <h2 id="standards-heading" className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
            <span>🏛️ Authoritative Standards & Primary References</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text2)] leading-relaxed">
            Omega X Converter relies exclusively on primary institutional metrological sources to ensure mathematical correctness, exact definitions, and transparent scientific grounding across all 28 categories.
          </p>
        </div>

        <div className="space-y-3">
          {AUTHORITY_SOURCES_LIST.map((src) => (
            <div key={src.id} className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--text)]">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{src.title}</span>
                      <span aria-hidden="true" className="text-xs">↗</span>
                    </a>
                  </h3>
                  <p className="text-[11px] text-[var(--text2)]">{src.organization} &middot; <span className="font-mono">{src.documentRef}</span></p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] self-start sm:self-auto">
                  {src.domain}
                </span>
              </div>
              <ul className="text-xs text-[var(--text2)] list-disc list-inside space-y-0.5 pl-1">
                {src.supports.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-[11px] text-[var(--text2)] leading-relaxed">
          <strong className="text-[var(--text)]">Institutional Non-Affiliation Notice:</strong> Omega X Converter by NumanX Studio references official standards documentation from BIPM, NIST, and CODATA to verify conversion formulas and coefficients. These references do not constitute an endorsement, certification, or official partnership by NIST, BIPM, CODATA, or any government agency.
        </div>
      </section>

      {/* Explore Links */}
      <section className="p-6 rounded-2xl bg-[var(--card2)] border border-[var(--border)] space-y-4 text-center">
        <h2 className="text-lg font-bold text-[var(--text)]">Ready to Explore?</h2>
        <p className="text-xs sm:text-sm text-[var(--text2)] max-w-md mx-auto">
          Access all 28 conversion categories, interactive formula calculators, and in-depth blog tutorials.
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
