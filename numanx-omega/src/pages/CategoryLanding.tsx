// Canonical entity: Omega X Converter · NumanX Studio
/* Anti-Slop Gate · P5 H5 E5 S5 R5 V5 · Silhouette: Spatial Bento Workbench */

import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import { getAllCategories } from '../engine/converter'
import { categoryContent } from '../engine/categoryContent'
import { getCategoryStandards } from '../engine/categoryStandards'
import { getRelatedCategoryIds } from '../config/relatedCategories'
import UniversalConverter from '../components/converter/UniversalConverter'
import CategoryLiveMatrix from '../components/category/CategoryLiveMatrix'
import CategoryCheatSheet from '../components/category/CategoryCheatSheet'
import CategorySpecialWidget from '../components/category/special/CategorySpecialWidget'
import VisualComparisonCard from '../components/widgets/VisualComparisonCard'
import ConversionChainsCard from '../components/widgets/ConversionChainsCard'
import { suggestChain } from '../engine/conversionChains'
import LengthProToolkit from '../components/category/special/LengthProToolkit'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { resolveCategoryId } from '../engine/routes'
import { buildCategorySchema } from '../config/schema'
import { getGuidesForCategory } from '../config/guideRelations'
import { getCategoryAuthoritySources } from '../config/authoritySources'
import { cleanSlug } from '../config/pairEditorial'
import { SystemLabels, type UnitSystem } from '../types'
import { AdSlotBanner, AdSlotRectangle, AdSlotRail } from '../components/monetization/AdSlot3Tier'

const SI_BASE_UNIT_IDS = new Set(['m', 'kg', 's', 'A', 'K'])

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
  const categoryGuides = useMemo(() => (cat ? getGuidesForCategory(cat.id) : []), [cat])

  const stdInfo = useMemo(() => {
    if (!cat) return null
    return getCategoryStandards(cat.id, cat.lb, cat.un.map(u => u.lb))
  }, [cat])

  const catAuthSources = useMemo(() => (cat ? getCategoryAuthoritySources(cat.id) : []), [cat])

  const pageTitle = useMemo(() => {
    if (!cat) return ''
    return content?.title || `${cat.lb} Precision Converter | Omega X`
  }, [cat, content])

  const pageDesc = useMemo(() => {
    if (!cat) return ''
    return content?.metaDesc || `Precision ${cat.lb} converter with NIST/BIPM metrology standards.`
  }, [cat, content])

  const categorySchema = useMemo(() => {
    if (!cat) return null
    return buildCategorySchema(cat, {
      title: pageTitle,
      metaDesc: pageDesc,
      faq: content?.faq,
    })
  }, [cat, content, pageTitle, pageDesc])

  // Unit Directory system filter state
  const [systemFilter, setSystemFilter] = useState<string>('ALL')

  // Identify base reference units in category
  const baseUnits = useMemo(() => {
    if (!cat) return []
    return cat.un.filter(u => u.r === 1)
  }, [cat])

  const isCompositeCategory = baseUnits.length > 1
  const singleBaseUnit = baseUnits.length === 1 ? baseUnits[0] : null

  const availableSystems = useMemo(() => {
    if (!cat) return []
    const set = new Set<UnitSystem>()
    for (const u of cat.un) {
      if (u.s) set.add(u.s)
    }
    return Array.from(set)
  }, [cat])

  const filteredUnits = useMemo(() => {
    if (!cat) return []
    if (systemFilter === 'ALL') return cat.un
    return cat.un.filter(u => u.s === systemFilter)
  }, [cat, systemFilter])

  if (!content || !cat) {
    return (
      <div className="text-center py-16 space-y-4">
        <SEOHead
          title="Category Not Found — Omega X"
          description={`The conversion category "${category || ''}" does not exist.`}
          path={`/convert/${category || ''}`}
          noindex={true}
        />
        <div className="text-4xl" role="img" aria-hidden="true">🔍</div>
        <h1 className="text-xl font-bold text-[var(--text)]">Category Not Found</h1>
        <p className="text-xs text-[var(--text2)] max-w-md mx-auto">
          The conversion category &ldquo;{category}&rdquo; does not exist. Browse our complete metrology directory.
        </p>
        <Link
          to="/categories"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:brightness-110 transition-all min-h-[44px] min-w-[44px]"
        >
          Browse All Categories →
        </Link>
      </div>
    )
  }

  const currentIndex = allCats.findIndex(c => c.id === cat.id)
  const prevCat = currentIndex > 0 ? allCats[currentIndex - 1] : allCats[allCats.length - 1]
  const nextCat = currentIndex < allCats.length - 1 ? allCats[currentIndex + 1] : allCats[0]

  return (
    <div className="relative flex justify-center gap-6">
      <article className="space-y-4 sm:space-y-6 max-w-4xl min-w-0 flex-1">
      <SEOHead
        title={pageTitle}
        description={pageDesc}
        path={`/convert/${cat.id}`}
        schema={categorySchema as Record<string, unknown>}
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Categories', path: '/categories' },
          { label: cat.lb }
        ]}
        backTo={{ label: 'All Categories', path: '/categories' }}
      />

      {/* 1. Category Masthead (Compact Spatial Bento Header) */}
      <header className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border-subtle)] p-3 sm:p-5 overflow-hidden relative space-y-2.5 sm:space-y-3">
        {/* Canonical Category Accent Stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ background: cat.cl || 'var(--primary)' }}
          aria-hidden="true"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5 sm:pt-1">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span
              className="text-xl sm:text-3xl p-2 sm:p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-subtle)] shadow-xs flex-shrink-0"
              role="img"
              aria-hidden="true"
            >
              {cat.ic}
            </span>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-[var(--text)] tracking-tight">
                {content.h1}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 text-xs text-[var(--text2)]">
                <span className="font-semibold text-[var(--link-text)]">
                  {cat.un.length} Precision Units
                </span>
                {singleBaseUnit && (
                  <>
                    <span aria-hidden="true" className="opacity-50">·</span>
                    <span>{SI_BASE_UNIT_IDS.has(singleBaseUnit.id) ? 'SI Base Unit' : 'Reference Standard'}: <strong className="text-[var(--text)] font-mono">{singleBaseUnit.lb} ({singleBaseUnit.id})</strong></span>
                  </>
                )}
                {isCompositeCategory && (
                  <>
                    <span aria-hidden="true" className="opacity-50">·</span>
                    <span><strong className="text-[var(--text)] font-mono">{baseUnits.length} Reference Standards</strong></span>
                  </>
                )}
                {cat.id === 'temp' && (
                  <>
                    <span aria-hidden="true" className="opacity-50">·</span>
                    <span>SI Base Unit: <strong className="text-[var(--text)] font-mono">Kelvin (K)</strong></span>
                  </>
                )}
                {cat.id === 'fuel' && (
                  <>
                    <span aria-hidden="true" className="opacity-50">·</span>
                    <span><strong className="text-[var(--text)] font-mono">Fuel Economy Standards</strong></span>
                  </>
                )}
                <span aria-hidden="true" className="opacity-50 hidden sm:inline">·</span>
                <span className="hidden sm:inline">Deterministic Decimal Engine</span>
                <span aria-hidden="true" className="opacity-50 hidden sm:inline">·</span>
                <span className="hidden sm:inline">PWA Offline</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text2)] leading-relaxed max-w-3xl line-clamp-2 sm:line-clamp-none">
          {content.intro}
        </p>
      </header>

      {/* 2. Primary Conversion Instrument (Dominant Above-The-Fold Centerpiece) */}
      <section aria-labelledby="convert-heading" className="space-y-1.5 sm:space-y-2 min-w-0 max-w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <h2 id="convert-heading" className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--text2)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: cat.cl || 'var(--primary)' }} aria-hidden="true" />
            <span>{cat.lb} Conversion Workbench</span>
          </h2>
          <span className="text-[11px] sm:text-xs font-mono text-[var(--text2)] hidden xs:inline">
            Precision Metrology
          </span>
        </div>
        <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border-subtle)] p-2.5 sm:p-5 shadow-xs min-w-0 max-w-full overflow-hidden">
          <UniversalConverter category={cat.id} hideCategoryPicker={true} compactOnMobile={true} initialValue={1} />
        </div>
      </section>

      {/* Monetization Slot 2: Mid-Page 728x90 Banner */}
      <AdSlotBanner />

      {/* 3. Category Unit Discovery Directory (Swiss Technical Grid) */}
      <section aria-labelledby="units-heading" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 id="units-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--text2)] flex items-center gap-2">
              <span>{cat.lb} Unit Directory & Supported Standards</span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--surface-3)] text-[var(--text)] border border-[var(--border-subtle)]">
                {filteredUnits.length} {filteredUnits.length === 1 ? 'Unit' : 'Units'}
              </span>
            </h2>
            <p className="text-xs text-[var(--text2)] mt-0.5">
              Authoritative metrological registry of all units defined within the {cat.lb.toLowerCase()} domain.
            </p>
          </div>

          {/* System Filter Pills if category spans >1 system */}
          {availableSystems.length > 1 && (
            <div role="tablist" aria-label="Filter units by measurement system" className="flex flex-wrap gap-1 p-1 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] self-start sm:self-auto">
              <button
                type="button"
                role="tab"
                aria-selected={systemFilter === 'ALL'}
                onClick={() => setSystemFilter('ALL')}
                className={`min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
                  systemFilter === 'ALL'
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
                }`}
              >
                All ({cat.un.length})
              </button>
              {availableSystems.map(sys => {
                const count = cat.un.filter(u => u.s === sys).length
                const label = SystemLabels[sys] || sys
                return (
                  <button
                    key={sys}
                    type="button"
                    role="tab"
                    aria-selected={systemFilter === sys}
                    onClick={() => setSystemFilter(sys)}
                    className={`min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
                      systemFilter === sys
                        ? 'bg-[var(--primary)] text-white shadow-xs'
                        : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    {label} ({count})
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredUnits.map(unit => {
            const isSiBase = (unit.r === 1 || unit.id === 'K') && SI_BASE_UNIT_IDS.has(unit.id)
            const isReference = unit.r === 1 && !isSiBase
            const sysLabel = unit.s ? SystemLabels[unit.s] : undefined

            let ratioStr: string | undefined = undefined
            if (isSiBase) {
              ratioStr = 'SI Base Unit'
            } else if (isReference) {
              ratioStr = isCompositeCategory ? 'Reference Standard' : 'Category Reference Standard'
            } else if (unit.r !== undefined && singleBaseUnit) {
              // Only calculate ratio if category has a single homogeneous base unit
              const formattedRatio = unit.r >= 1e4 || unit.r <= 1e-4
                ? unit.r.toExponential(3)
                : String(unit.r)
              ratioStr = `1 ${unit.id} = ${formattedRatio} ${singleBaseUnit.id}`
            }

            return (
              <div
                key={unit.id}
                className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)] transition-all flex flex-col justify-between gap-1.5 min-h-[56px] group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="font-mono text-sm font-bold text-[var(--text)] group-hover:text-[var(--link-text)]">
                      {unit.id}
                    </span>
                    <span className="text-xs font-medium text-[var(--text)] truncate">
                      {unit.lb}
                    </span>
                  </div>
                  {sysLabel && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text2)] border border-[var(--border-subtle)] flex-shrink-0">
                      {sysLabel}
                    </span>
                  )}
                </div>
                {ratioStr && (
                  <div className="text-[11px] font-mono text-[var(--text2)] truncate opacity-85">
                    {ratioStr}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Popular Conversion Pairs (Canonical Routes) */}
      <section aria-labelledby="pairs-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="pairs-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--text2)]">
            Popular {cat.lb} Conversions
          </h2>
          <span className="text-xs text-[var(--text2)]">
            {content.popularPairs.length} Curated Guides
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {content.popularPairs.map(p => {
            const fromSlug = cleanSlug(p.from)
            const toSlug = cleanSlug(p.to)
            const pairPath = `/convert/${cat.id}/${fromSlug}-to-${toSlug}`
            return (
              <Link
                key={`${p.from}-${p.to}`}
                to={pairPath}
                className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)] transition-all space-y-1 block min-h-[52px] group focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[var(--text)] group-hover:text-[var(--link-text)]">
                  <span className="flex items-center gap-1.5">
                    <span>{p.from}</span>
                    <span className="text-[var(--primary)]" aria-hidden="true">→</span>
                    <span>{p.to}</span>
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text2)] opacity-70 group-hover:opacity-100">
                    Guide →
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text2)] leading-relaxed line-clamp-2">
                  {p.desc}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 5. Flagship Category Interactive Widgets */}
      {cat.id === 'length' && (
        <section aria-labelledby="length-pro-heading" className="min-w-0 max-w-full overflow-hidden">
          <LengthProToolkit baseMeters={1.75} />
        </section>
      )}
      <div className="min-w-0 max-w-full overflow-hidden">
        <CategorySpecialWidget category={cat.id} />
      </div>

      {/* Real-World Physical Scale Anchors */}
      <VisualComparisonCard
        category={cat.id}
        value={1}
        unitId={cat.un[0]?.id || ''}
        unitLabel={cat.un[0]?.lb || ''}
      />

      {/* Domain Multi-Step Conversion Pipeline */}
      {suggestChain(cat.id) && (
        <ConversionChainsCard category={cat.id} />
      )}

      {/* 6. Editorial Broadsheet — Technical & Metrological Reference */}
      <section aria-labelledby="reference-heading" className="space-y-3">
        <h2 id="reference-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--text2)]">
          Technical & Metrological Reference
        </h2>

        {/* Domain Metrology Overview (Complete Unabridged Prose) */}
        <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
            <span aria-hidden="true">📖</span>
            <span>{cat.lb} Metrological Domain Overview</span>
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text2)] leading-relaxed">
            {content.intro}
          </p>
        </div>

        {/* AEO Position-Zero Answer Capsule */}
        {stdInfo && (
          <aside role="note" aria-label="Quick Answer Summary" className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              <span aria-hidden="true">📋</span>
              <span>Position-Zero Answer Summary</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
              {stdInfo.aeoCapsule}
            </p>
          </aside>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Conversion Formula & Ratio */}
          {content.formula && (
            <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                <span aria-hidden="true">📐</span>
                <span>Conversion Formula & Ratio</span>
              </h3>
              <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text)] leading-relaxed overflow-x-auto">
                {content.formula}
              </div>
              <p className="text-[11px] text-[var(--text2)] leading-relaxed">
                Calculations are computed using arbitrary-precision rational fractions with zero intermediate rounding error.
              </p>
            </div>
          )}

          {/* Standards & Authority Compliance */}
          {stdInfo && (
            <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                <span aria-hidden="true">🏛️</span>
                <span>Metrological Authority & Standards</span>
              </h3>
              <p className="text-xs text-[var(--text2)] leading-relaxed">
                {stdInfo.standardsStatement}
              </p>
              <div className="pt-1 text-[11px] text-[var(--text2)]">
                {catAuthSources.length > 0 ? (
                  <>
                    Primary References:{' '}
                    {catAuthSources.map((src, i) => (
                      <span key={src.id}>
                        {i > 0 && ' · '}
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--link-text)] underline hover:opacity-80"
                        >
                          {src.documentRef}
                        </a>
                      </span>
                    ))}{' '}
                    · <Link to="/about" className="text-[var(--link-text)] underline hover:opacity-80">All Standards</Link>
                  </>
                ) : (
                  <>
                    Standards & Data Source Note: Consult our{' '}
                    <Link to="/about" className="text-[var(--link-text)] underline hover:opacity-80">
                      standards and methodology directory
                    </Link>{' '}
                    for data source provenance.
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Common Use Cases & Applications */}
        {content.useCases && content.useCases.length > 0 && (
          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
              <span aria-hidden="true">⚙️</span>
              <span>Common Engineering & Practical Applications</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text2)]">
              {content.useCases.map(u => (
                <li key={u} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 flex-shrink-0" aria-hidden="true" />
                  <span className="leading-relaxed">{u}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 7. Live Multi-Unit Projection Matrix */}
      <CategoryLiveMatrix cat={cat} />

      {/* 8. Conversion Table & Printable Reference Cheat Sheet */}
      <CategoryCheatSheet cat={cat} />

      {/* 9. Educational Guides & Reference Articles */}
      {categoryGuides.length > 0 && (
        <section aria-labelledby="guides-heading" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 id="guides-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--text2)]">
              Conversion Guides & Editorial Reference
            </h2>
            <Link
              to="/guides"
              className="text-xs font-medium text-[var(--link-text)] hover:underline min-h-[44px] px-2 flex items-center"
            >
              All 15 Guides →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryGuides.map(g => (
              <Link
                key={g.guideSlug}
                to={`/guides/${g.guideSlug}`}
                className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)] transition-all flex flex-col justify-between min-h-[64px] group focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--link-text)]">
                    {g.title} Conversion Guide
                  </div>
                  <p className="text-[11px] text-[var(--text2)] leading-relaxed line-clamp-2">
                    Step-by-step formula derivation, worked engineering examples, and quick lookup tables.
                  </p>
                </div>
                <div className="text-[11px] text-[var(--link-text)] font-semibold mt-2.5 flex items-center gap-1">
                  <span>Read educational guide</span>
                  <span aria-hidden="true">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Monetization Slot 3: Pre-FAQ 300x250 Rectangle */}
      <AdSlotRectangle />

      {/* 10. Accessible Structured FAQ Accordion */}
      {content.faq && content.faq.length > 0 && (
        <section aria-labelledby="faq-heading" className="space-y-3">
          <h2 id="faq-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--text2)] flex items-center gap-2">
            <span aria-hidden="true">❓</span>
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="space-y-2">
            {content.faq.map((f, idx) => (
              <details
                key={f.q}
                className="group rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] overflow-hidden transition-colors"
                open={idx === 0}
              >
                <summary className="flex items-center justify-between p-3.5 text-xs font-bold cursor-pointer select-none text-[var(--text)] hover:text-[var(--link-text)] transition-colors list-none [&::-webkit-details-marker]:hidden min-h-[44px]">
                  <span className="flex items-center gap-2 pr-2">
                    <span className="w-5 h-5 rounded-md bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center text-xs font-bold flex-shrink-0" aria-hidden="true">
                      Q
                    </span>
                    <span>{f.q}</span>
                  </span>
                  <span className="text-xs opacity-70 group-open:rotate-180 transition-transform duration-200 flex-shrink-0" aria-hidden="true">
                    ▼
                  </span>
                </summary>
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-[var(--text2)] leading-relaxed border-t border-[var(--border-subtle)]">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* 11. Cyclical Category Navigation Strip */}
      <nav aria-label="Category pagination" className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <Link
          to={`/convert/${prevCat.id}`}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)] hover:border-[var(--primary)] hover:bg-[var(--surface-3)] text-xs font-semibold text-[var(--text)] transition-all min-h-[44px] min-w-[44px] w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          aria-label={`Previous category: ${prevCat.lb}`}
        >
          <span aria-hidden="true">←</span>
          <span aria-hidden="true">{prevCat.ic}</span>
          <span>{prevCat.lb}</span>
        </Link>
        <Link
          to="/categories"
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-[var(--link-text)] hover:underline min-h-[44px] min-w-[44px] text-center focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          Browse All {allCats.length} Categories
        </Link>
        <Link
          to={`/convert/${nextCat.id}`}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)] hover:border-[var(--primary)] hover:bg-[var(--surface-3)] text-xs font-semibold text-[var(--text)] transition-all min-h-[44px] min-w-[44px] w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          aria-label={`Next category: ${nextCat.lb}`}
        >
          <span>{nextCat.lb}</span>
          <span aria-hidden="true">{nextCat.ic}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </nav>

      {/* 12. Related Conversion Categories */}
      <section aria-labelledby="related-heading" className="space-y-2.5">
        <h2 id="related-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--text2)]">
          Related Metrological Domains
        </h2>
        <div className="flex gap-2 flex-wrap">
          {getRelatedCategoryIds(cat.id).map(id => allCats.find(c => c.id === id)).filter((c): c is typeof allCats[0] => Boolean(c)).map(c => (
            <Link
              key={c.id}
              to={`/convert/${c.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)] text-xs font-medium text-[var(--text)] transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              <span aria-hidden="true">{c.ic}</span>
              <span>{c.lb}</span>
            </Link>
          ))}
        </div>
      </section>
    </article>
      <AdSlotRail />
    </div>
  )
}
