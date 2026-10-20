import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import { getAllCategories } from '../engine/converter'
import { categoryContent } from '../engine/categoryContent'
import { getCategoryStandards } from '../engine/categoryStandards'
import UniversalConverter from '../components/converter/UniversalConverter'
import CategoryLiveMatrix from '../components/category/CategoryLiveMatrix'
import CategoryCheatSheet from '../components/category/CategoryCheatSheet'
import CategorySpecialWidget from '../components/category/special/CategorySpecialWidget'
import LengthProToolkit from '../components/category/special/LengthProToolkit'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { resolveCategoryId } from '../engine/routes'
import { canonicalUrl } from '../config/site'

interface Props {
  categorySlug?: string
}

export default function CategoryLanding({ categorySlug }: Props) {
  const { category: paramCategory } = useParams<{ category: string }>()
  const rawCategory = categorySlug || paramCategory
  const category = rawCategory ? (resolveCategoryId(rawCategory) || rawCategory.toLowerCase()) : undefined
  const content = category ? categoryContent[category] : null
  const cat = category ? getAllCategories().find(c => c.id === category) : null

  const allCats = useMemo(() => getAllCategories(), [])

  const stdInfo = useMemo(() => {
    if (!cat) return null
    return getCategoryStandards(cat.id, cat.lb, cat.un.map(u => u.lb))
  }, [cat])

  const pageTitle = useMemo(() => {
    if (!cat) return ''
    if (cat.id === 'length') return 'Length Converter (Decimal & Fractional) — Instant NIST Chart'
    return content?.title || `${cat.lb} Converter — Instant Precision Calculator | Omega X`
  }, [cat, content])

  const pageDesc = useMemo(() => {
    if (!cat) return ''
    if (cat.id === 'length') {
      return 'Precision length converter with architectural fractions (1/64"), compound feet & inches, machinist socket tolerances, and NIST SP 811 tables.'
    }
    return content?.metaDesc || `Free online ${cat.lb.toLowerCase()} unit converter. Convert ${cat.un.slice(0, 5).map(u => u.lb).join(', ')} instantly with formulas and printable cheat sheets.`
  }, [cat, content])

  const categorySchema = useMemo(() => {
    if (!cat) return null
    const pageUrl = canonicalUrl(`/convert/${cat.id}`)
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          '@id': `${pageUrl}#software`,
          name: pageTitle,
          url: pageUrl,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'All',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${pageUrl}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Categories', item: canonicalUrl('/categories') },
            { '@type': 'ListItem', position: 3, name: `${cat.lb} Converter`, item: pageUrl }
          ]
        },
        ...(content?.faq?.length
          ? [
              {
                '@type': 'FAQPage',
                '@id': `${pageUrl}#faq`,
                mainEntity: content.faq.map((f: { q: string; a: string }) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a }
                }))
              }
            ]
          : [])
      ]
    }
  }, [cat, content, pageTitle])

  if (!content || !cat) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4" role="img" aria-hidden="true">🔍</div>
        <h1 className="text-xl font-bold mb-2">Category not found</h1>
        <p className="text-sm opacity-70 mb-4">The conversion category "{category}" does not exist.</p>
        <Link to="/categories" className="text-sm text-[var(--primary)] hover:underline font-medium">Browse all categories →</Link>
      </div>
    )
  }

  const currentIndex = allCats.findIndex(c => c.id === cat.id)
  const prevCat = currentIndex > 0 ? allCats[currentIndex - 1] : allCats[allCats.length - 1]
  const nextCat = currentIndex < allCats.length - 1 ? allCats[currentIndex + 1] : allCats[0]

  return (
    <article className="space-y-6">
      <SEOHead
        title={pageTitle}
        description={pageDesc}
        path={`/convert/${cat.id}`}
        schema={categorySchema}
      />

      {/* Breadcrumb matching Image 2 */}
      <Breadcrumbs
        items={[
          { label: 'Tools', path: '/categories' },
          { label: cat.lb }
        ]}
        backTo={{ label: 'All Tools', path: '/categories' }}
      />

      {/* Header */}
      <header className="glass rounded-2xl p-5 border border-[var(--border)] overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: cat.cl || 'var(--primary)' }} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-xl bg-[var(--card2)] border border-[var(--border)]" role="img" aria-hidden="true">{cat.ic}</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">{content.h1}</h1>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--text2)]">
                <span className="font-bold text-[var(--primary)]">{cat.un.length} Precision Units</span>
                <span aria-hidden="true">·</span>
                <span>Instant Offline PWA</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card2)] self-start sm:self-auto text-[var(--text)]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: cat.cl || 'var(--primary)' }} aria-hidden="true" />
            <span>Dedicated Page</span>
          </div>
        </div>

        {/* AEO Position-Zero Answer Capsule (Active across ALL categories) */}
        {stdInfo && (
          <aside role="note" aria-label="Quick Answer Summary" className="glass rounded-xl p-4 border border-[var(--border)] text-xs sm:text-sm text-[var(--text2)] space-y-2 my-3">
            <p className="text-[var(--text)] leading-relaxed">
              {stdInfo.aeoCapsule}
            </p>
          </aside>
        )}

        <p className="text-xs sm:text-sm text-[var(--text2)] leading-relaxed">{content.intro}</p>
      </header>

      {/* Flagship Category Interactive Widget (if available) */}
      <CategorySpecialWidget category={cat.id} />

      {/* Length Pro Toolkit (Tape Snap, Blueprint Scale Multiplier, Nominal Lumber & Sockets) */}
      {cat.id === 'length' && <LengthProToolkit baseMeters={1.75} />}

      {/* Metrological Authority & Standards Callout (Active across ALL categories) */}
      {stdInfo && (
        <section aria-labelledby="authority-heading" className="glass rounded-xl p-4 border border-[var(--border)] text-xs text-[var(--text2)] space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-[var(--text)]">
            <span aria-hidden="true">🏛️</span>
            <span id="authority-heading">Metrological Authority & Standards Compliance</span>
          </div>
          <p className="leading-relaxed">
            {stdInfo.standardsStatement}
          </p>
        </section>
      )}

      {/* Embedded Primary Universal Converter */}
      <section aria-labelledby="convert-heading">
        <h2 id="convert-heading" className="text-sm font-bold mb-2 text-[var(--text)] flex items-center gap-2">
          <span className="p-1 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]" aria-hidden="true">{cat.ic}</span>
          <span>{cat.lb} Precision Calculator</span>
        </h2>
        <div className="glass-liquid rounded-2xl p-4 sm:p-5 border border-[var(--border)]">
          <UniversalConverter category={cat.id} hideCategoryPicker={true} />
        </div>
      </section>

      {/* Live Multi-Unit Matrix (Universal across all categories) */}
      <CategoryLiveMatrix cat={cat} />

      {/* Conversion Table & Cheat Sheet */}
      <CategoryCheatSheet cat={cat} />

      {/* Popular conversion pairs */}
      <section aria-labelledby="pairs-heading">
        <h2 id="pairs-heading" className="text-sm font-semibold mb-3 text-[var(--text)]">Popular {cat.lb} Conversions</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {content.popularPairs.map(p => (
            <Link key={p.from + p.to} to={`/convert/${cat.id}/${p.from.toLowerCase()}-to-${p.to.toLowerCase()}`}
              className="glass rounded-xl p-3 hover:shadow-md transition-all interact-lift border border-transparent hover:border-[var(--border)]">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
                <span>{p.from}</span>
                <span className="opacity-50" aria-hidden="true">→</span>
                <span>{p.to}</span>
              </div>
              <div className="text-xs text-[var(--text2)] mt-0.5">{p.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Formula */}
      {content.formula && (
        <section aria-labelledby="formula-heading" className="glass rounded-2xl p-4 border border-[var(--border)]">
          <h2 id="formula-heading" className="text-sm font-semibold mb-2 text-[var(--text)]">Conversion Formula & Ratio</h2>
          <p className="text-xs text-[var(--text2)] opacity-90 leading-relaxed font-mono">{content.formula}</p>
        </section>
      )}

      {/* Use cases */}
      <section aria-labelledby="uses-heading" className="glass rounded-2xl p-4">
        <h2 id="uses-heading" className="text-sm font-semibold mb-2 text-[var(--text)]">Common Use Cases & Applications</h2>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {content.useCases.map(u => (
            <li key={u} className="text-xs text-[var(--text2)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" aria-hidden="true" />
              <span>{u}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Accessible Interactive FAQ Accordion */}
      {content.faq && content.faq.length > 0 && (
        <section aria-labelledby="faq-heading" className="glass rounded-2xl p-4">
          <h2 id="faq-heading" className="text-sm font-semibold mb-3 flex items-center gap-2 text-[var(--text)]">
            <span aria-hidden="true">❓</span> Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {content.faq.map((f, idx) => (
              <details key={f.q} className="group glass rounded-xl border border-[var(--border)] overflow-hidden" open={idx === 0}>
                <summary className="flex items-center justify-between p-3.5 text-xs font-semibold cursor-pointer select-none text-[var(--text)] hover:text-[var(--primary)] transition-colors list-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2 pr-2">
                    <span className="w-5 h-5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-bold flex-shrink-0" aria-hidden="true">Q</span>
                    <span>{f.q}</span>
                  </span>
                  <span className="text-xs opacity-70 group-open:rotate-180 transition-transform duration-200 flex-shrink-0" aria-hidden="true">▼</span>
                </summary>
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-[var(--text2)] opacity-90 leading-relaxed border-t border-[var(--border)]/40">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Cyclical Category Navigation Strip */}
      <nav aria-label="Category pagination" className="glass rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-[var(--border)]">
        <Link
          to={`/convert/${prevCat.id}`}
          className="btn-secondary w-full sm:w-auto text-xs font-semibold gap-2 px-4 py-2"
          aria-label={`Previous category: ${prevCat.lb}`}
        >
          <span aria-hidden="true">←</span>
          <span aria-hidden="true">{prevCat.ic}</span>
          <span>{prevCat.lb}</span>
        </Link>
        <Link
          to="/categories"
          className="w-full sm:w-auto text-center px-4 py-2 text-xs font-bold text-[var(--primary)] hover:underline"
        >
          Browse All {allCats.length} Categories
        </Link>
        <Link
          to={`/convert/${nextCat.id}`}
          className="btn-secondary w-full sm:w-auto text-xs font-semibold gap-2 px-4 py-2"
          aria-label={`Next category: ${nextCat.lb}`}
        >
          <span>{nextCat.lb}</span>
          <span aria-hidden="true">{nextCat.ic}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </nav>

      {/* Related categories */}
      <section aria-labelledby="related-heading">
        <h2 id="related-heading" className="text-sm font-semibold mb-3 text-[var(--text)]">Related Conversion Categories</h2>
        <div className="flex gap-2 flex-wrap">
          {allCats.filter(c => c.id !== cat.id).slice(0, 10).map(c => (
            <Link key={c.id} to={`/convert/${c.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs hover:bg-[var(--border)] transition-all interact-lift border border-transparent hover:border-[var(--border)] text-[var(--text)]">
              <span aria-hidden="true">{c.ic}</span>
              <span>{c.lb}</span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  )
}
