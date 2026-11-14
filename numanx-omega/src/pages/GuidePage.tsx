import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import { guideContent } from '../engine/guideContent'
import UniversalConverter from '../components/converter/UniversalConverter'
import { buildGuideSchema } from '../config/schema'
import { getGuideRelationship } from '../config/guideRelations'
import { BLOG_POSTS } from '../data/blogPosts'
import ConversionQuiz from '../components/widgets/ConversionQuiz'

export default function GuidePage() {
  const { slug } = useParams<{ slug: string }>()
  const content = slug ? guideContent[slug] : null
  const rel = slug ? getGuideRelationship(slug) : undefined
  const [copiedFormula, setCopiedFormula] = useState(false)

  const relatedPosts = (rel && rel.relatedPostSlugs.length)
    ? BLOG_POSTS.filter(p => rel.relatedPostSlugs.includes(p.slug))
    : []

  if (!content) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-xl font-bold mb-2">Guide not found</h1>
        <p className="text-sm opacity-60 mb-4">The guide "{slug}" does not exist yet.</p>
        <Link to="/guides" className="text-sm text-[var(--primary)] hover:underline">Browse all guides →</Link>
      </div>
    )
  }

  const guideSchema = buildGuideSchema(content)

  const handleCopyFormula = () => {
    if (!content.formula) return
    navigator.clipboard.writeText(content.formula)
    setCopiedFormula(true)
    setTimeout(() => setCopiedFormula(false), 2000)
  }

  return (
    <article className="space-y-6">
      <SEOHead
        title={content.title}
        description={content.metaDesc}
        path={`/guides/${content.slug}`}
        schema={guideSchema}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs opacity-60 flex gap-1.5 flex-wrap items-center">
        <Link to="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
        <span className="opacity-40">/</span>
        <Link to="/guides" className="hover:text-[var(--primary)] transition-colors">Guides</Link>
        <span className="opacity-40">/</span>
        <Link to={`/convert/${content.relatedCat}`} className="hover:text-[var(--primary)] transition-colors">
          {rel?.categoryName || (content.relatedCat.charAt(0).toUpperCase() + content.relatedCat.slice(1))}
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--primary)] font-medium">{rel?.pairLabel || content.slug}</span>
      </nav>

      {/* Masterclass Header */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-1 rounded-full border border-[var(--primary)]/20">
            Masterclass Guide
          </span>
          <span className="text-[11px] opacity-70 bg-[var(--card)] px-2.5 py-1 rounded-full border border-[var(--border)]">
            ⏱️ ~5 min read
          </span>
          <span className="text-[11px] opacity-70 bg-[var(--card)] px-2.5 py-1 rounded-full border border-[var(--border)]">
            🏛️ {content.source ? 'Culinary Standards' : 'NIST & Regional Standard'}
          </span>
          {rel?.pairLabel && (
            <span className="text-[11px] font-medium text-[var(--text2)] bg-[var(--card)] px-2.5 py-1 rounded-full border border-[var(--border)]">
              🎯 Target: {rel.pairLabel}
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">{content.h1}</h1>
        <p className="text-sm sm:text-base opacity-75 leading-relaxed text-[var(--text2)] max-w-3xl">{content.intro}</p>
      </header>

      {/* Focused Interactive Live Converter */}
      <section aria-labelledby="convert-heading" className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-1">
          <div>
            <h2 id="convert-heading" className="text-sm sm:text-base font-semibold text-[var(--text)] flex items-center gap-2">
              <span aria-hidden="true">⚡</span>
              <span>Interactive Live Calculator</span>
            </h2>
            <p className="text-xs text-[var(--text2)] opacity-70">
              Pre-focused for {rel?.pairLabel || content.h1}. Enter any value to calculate exact conversions in real time.
            </p>
          </div>
          {rel && (
            <Link
              to={rel.pairPath}
              className="text-xs text-[var(--primary)] font-medium hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Open Dedicated Pair Page</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
        <div className="glass-liquid rounded-2xl p-3 sm:p-5 border border-[var(--border)] shadow-lg shadow-black/5">
          <UniversalConverter
            category={content.relatedCat}
            initialFrom={rel?.fromUnit}
            initialTo={rel?.toUnit}
            initialValue={1}
            hideCategoryPicker={true}
            compactOnMobile={true}
            variant="embedded"
          />
        </div>
      </section>

      {/* Formula & Method */}
      <section aria-labelledby="formula-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 id="formula-heading" className="text-sm font-semibold flex items-center gap-2">
            <span aria-hidden="true">📐</span>
            <span>Mathematical Conversion Formula</span>
          </h2>
          <button
            onClick={handleCopyFormula}
            className="text-xs px-2.5 py-1 rounded-lg bg-[var(--card)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors text-[var(--text2)]"
            title="Copy formula"
          >
            {copiedFormula ? '✓ Copied' : '📋 Copy Formula'}
          </button>
        </div>
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 font-mono text-sm sm:text-base text-center text-[var(--primary)] font-semibold shadow-inner">
          {content.formula}
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Step-by-Step Method:</div>
          <ol className="space-y-2">
            {content.steps.map((s, i) => (
              <li key={i} className="text-xs sm:text-sm opacity-80 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border border-[var(--primary)]/20">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Conversion table */}
      <section aria-labelledby="table-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 id="table-heading" className="text-sm font-semibold flex items-center gap-2">
            <span aria-hidden="true">📊</span>
            <span>Quick Reference Conversion Table</span>
          </h2>
          <span className="text-[11px] opacity-60">Verified {content.table.length} reference values</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-xs text-left border-collapse">
            <caption className="sr-only">{content.h1} Quick Conversion Table</caption>
            <thead className="bg-[var(--card)] border-b border-[var(--border)]">
              <tr>
                <th scope="col" className="py-2.5 px-3 font-semibold text-[var(--text)]">Input Value</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-[var(--primary)]">Exact Value</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-[var(--text2)]">Everyday Rounded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {content.table.map(row => (
                <tr key={row.from} className="hover:bg-[var(--border)]/30 transition-colors">
                  <th scope="row" className="py-2 px-3 font-medium text-left font-normal">{row.from}</th>
                  <td className="py-2 px-3 font-mono font-medium text-[var(--primary)]">{row.to}</td>
                  <td className="py-2 px-3 opacity-70">{row.rounded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Real-world examples */}
      <section aria-labelledby="examples-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-3">
        <h2 id="examples-heading" className="text-sm font-semibold flex items-center gap-2">
          <span aria-hidden="true">💡</span>
          <span>Real-World Applications & Examples</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {content.examples.map((ex, i) => (
            <div key={i} className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-start gap-2.5 text-xs text-[var(--text2)]">
              <span className="text-[var(--primary)] font-bold mt-0.5">•</span>
              <span className="leading-relaxed">{ex}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Metrology Practice Quiz */}
      <ConversionQuiz
        category={content.relatedCat}
        title={`${content.h1} Mastery Quiz`}
      />

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-3">
        <h2 id="faq-heading" className="text-sm font-semibold flex items-center gap-2">
          <span aria-hidden="true">❓</span>
          <span>Frequently Asked Questions</span>
        </h2>
        <div className="space-y-3">
          {content.faq.map(f => (
            <div key={f.q} className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1">
              <h3 className="text-xs sm:text-sm font-semibold text-[var(--text)]">{f.q}</h3>
              <p className="text-xs text-[var(--text2)] opacity-80 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related guides & Directory Navigation */}
      <section aria-labelledby="related-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="related-heading" className="text-sm font-semibold flex items-center gap-2">
            <span aria-hidden="true">📚</span>
            <span>Related Conversion Guides</span>
          </h2>
          <Link to="/guides" className="text-xs text-[var(--primary)] hover:underline font-medium">
            Browse all guides &rarr;
          </Link>
        </div>
        <div className="flex gap-2 flex-wrap">
          {content.relatedGuides.map(g => (
            <Link key={g.slug} to={`/guides/${g.slug}`}
              className="px-3 py-1.5 rounded-xl bg-[var(--card)] hover:bg-[var(--border)] border border-[var(--border)] text-xs transition-all interact-lift">
              {g.label} →
            </Link>
          ))}
          <Link to={`/convert/${content.relatedCat}`}
            className="px-3 py-1.5 rounded-xl bg-[var(--card)] hover:bg-[var(--border)] border border-[var(--border)] text-xs text-[var(--primary)] font-medium transition-all interact-lift">
            All {rel?.categoryName || content.relatedCat} converters →
          </Link>
        </div>
      </section>

      {/* Interactive Pair Converter & Category Directory */}
      {rel && (
        <section aria-labelledby="interactive-pair-heading" className="glass rounded-2xl p-4 border border-[var(--border)]">
          <h2 id="interactive-pair-heading" className="text-sm font-semibold mb-3">Interactive Pair Converter & Category Directory</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to={rel.pairPath}
              className="p-3.5 rounded-xl bg-[var(--card)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors flex items-center justify-between">
                  <span>Convert {rel.title} Interactively</span>
                  <span aria-hidden="true">&rarr;</span>
                </div>
                <div className="text-[11px] opacity-60 mt-1">
                  Open the full two-way interactive converter with real-time calculations and copyable results.
                </div>
              </div>
              <div className="text-[11px] text-[var(--primary)] font-medium mt-2">
                Launch interactive pair tool &rarr;
              </div>
            </Link>
            <Link
              to={rel.categoryPath}
              className="p-3.5 rounded-xl bg-[var(--card)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors flex items-center justify-between">
                  <span>Explore All {rel.categoryName} Conversions</span>
                  <span aria-hidden="true">&rarr;</span>
                </div>
                <div className="text-[11px] opacity-60 mt-1">
                  Browse the comprehensive directory of all units, reference charts, and live matrices in {rel.categoryName.toLowerCase()}.
                </div>
              </div>
              <div className="text-[11px] text-[var(--primary)] font-medium mt-2">
                View {rel.categoryName} directory &rarr;
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Related Technical Articles */}
      {relatedPosts.length > 0 && (
        <section aria-labelledby="related-articles-heading" className="glass rounded-2xl p-4 border border-[var(--border)]">
          <h2 id="related-articles-heading" className="text-sm font-semibold mb-3">Related Technical Articles</h2>
          <div className="space-y-2">
            {relatedPosts.map(post => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="block p-3 rounded-xl bg-[var(--card)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors group"
              >
                <div className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors flex items-center justify-between">
                  <span>{post.title}</span>
                  <span aria-hidden="true">&rarr;</span>
                </div>
                <div className="text-[11px] opacity-60 mt-0.5 line-clamp-1">
                  {post.excerpt}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Standards & Metrological Grounding */}
      <section aria-labelledby="standards-grounding-heading" className="glass rounded-2xl p-4 border border-[var(--border)] text-xs text-[var(--text2)] space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-[var(--text)]">
          <span aria-hidden="true">🏛️</span>
          <span id="standards-grounding-heading">Standards Reference & Metrological Grounding</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          {content.source
            ? `Calculations and ingredient reference weights in this guide are sourced from ${content.source}. Review our complete `
            : 'Calculations and conversion factors in this guide adhere to NIST Special Publication 811, BIPM SI brochure, and official provincial real estate / Mandi standards. Review our complete '}
          <Link to="/about" className="text-[var(--primary)] underline hover:opacity-80">institutional standards and sources directory</Link>.
        </p>
      </section>
    </article>
  )
}
