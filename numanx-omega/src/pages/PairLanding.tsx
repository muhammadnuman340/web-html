import { useState, useMemo } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import { getAllCategories, convert } from '../engine/converter'
import { fmt, parseSmart } from '../utils/numbers'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { useToast } from '../hooks/useToast'
import { resolveCategoryId } from '../engine/routes'
import { buildPairSchema } from '../config/schema'
import { parsePairQueryVal, getGuideForPair } from '../config/guideRelations'
import { findUnit, getPairEditorial } from '../config/pairEditorial'

function PairLandingInner({
  catParam,
  pairParam,
  initialVal,
}: {
  catParam?: string
  pairParam: string
  initialVal: string
}) {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const allCats = useMemo(() => getAllCategories(), [])

  // Parse pair: "kg-to-lbs" -> from: "kg", to: "lbs"
  const { fromSlug, toSlug } = useMemo(() => {
    if (!pairParam) return { fromSlug: '', toSlug: '' }
    const parts = pairParam.toLowerCase().split('-to-')
    if (parts.length === 2) {
      return { fromSlug: parts[0], toSlug: parts[1] }
    }
    return { fromSlug: '', toSlug: '' }
  }, [pairParam])

  // Resolve category and units
  const resolution = (() => {
    if (!fromSlug || !toSlug) return null

    // If category was specified in URL, check that first
    if (catParam) {
      const resolvedCatId = resolveCategoryId(catParam) || catParam.toLowerCase()
      const cat = allCats.find(c => c.id.toLowerCase() === resolvedCatId)
      if (cat) {
        const u1 = findUnit(cat, fromSlug)
        const u2 = findUnit(cat, toSlug)
        if (u1 && u2) return { cat, u1, u2 }
      }
    }

    // Otherwise, search across all categories
    for (const cat of allCats) {
      const u1 = findUnit(cat, fromSlug)
      const u2 = findUnit(cat, toSlug)
      if (u1 && u2) return { cat, u1, u2 }
    }

    return null
  })()

  const [fromValue, setFromValue] = useState(initialVal)

  const numFrom = useMemo(() => {
    if (!resolution) return 0
    const parsed = parseSmart(fromValue, resolution.u1.r)
    return parsed !== null ? parsed : 0
  }, [fromValue, resolution])
  const convertedValue = useMemo(() => {
    if (!resolution) return null
    return convert(numFrom, resolution.cat.id, resolution.u1.id, resolution.u2.id)
  }, [numFrom, resolution])

  const unitRatio = useMemo(() => {
    if (!resolution) return null
    return convert(1, resolution.cat.id, resolution.u1.id, resolution.u2.id)
  }, [resolution])

  const inverseUnitRatio = useMemo(() => {
    if (!resolution) return null
    return convert(1, resolution.cat.id, resolution.u2.id, resolution.u1.id)
  }, [resolution])

  const cat = resolution?.cat
  const u1 = resolution?.u1
  const u2 = resolution?.u2

  // Table increments
  const tableValues = [1, 2, 3, 5, 10, 15, 20, 25, 50, 75, 100, 250, 500, 1000]

  const handleSwap = () => {
    if (!cat || !u1 || !u2) return
    navigate(`/convert/${cat.id}/${u2.id.toLowerCase()}-to-${u1.id.toLowerCase()}`)
  }

  const handleCopy = () => {
    if (convertedValue === null || !u1 || !u2) return
    const text = `${fromValue} ${u1.lb} = ${fmt(convertedValue, 6)} ${u2.lb}`
    navigator.clipboard.writeText(text)
    showToast('Copied to clipboard!', 'success')
  }

  const editorial = useMemo(() => {
    if (!cat || !u1 || !u2) return null
    return getPairEditorial(cat, u1, u2, pairParam)
  }, [cat, u1, u2, pairParam])

  const pageTitle = u1 && u2 ? `Convert ${u1.lb} to ${u2.lb} (${u1.id} to ${u2.id})` : ''
  const metaDescription = u1 && u2 && editorial ? `Free online ${u1.lb} to ${u2.lb} converter. ${editorial.directAnswer.summary} Includes live calculator, exact formula, and 1 to 1000 conversion chart.` : ''

  const relatedGuide = useMemo(() => {
    if (!cat || !pairParam) return undefined
    return getGuideForPair(cat.id, pairParam)
  }, [cat, pairParam])

  const schema = useMemo(() => {
    if (!cat || !u1 || !u2) return null
    return buildPairSchema(cat, u1, u2, unitRatio, inverseUnitRatio, pairParam, editorial?.faqs, editorial?.directAnswer.summary)
  }, [cat, u1, u2, pairParam, unitRatio, inverseUnitRatio, editorial])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadCSV = () => {
    if (!cat || !u1 || !u2) return
    const header = `"${u1.lb} (${u1.id})","${u2.lb} (${u2.id})","Reciprocal ${u2.id}","Reciprocal ${u1.id}"\n`
    const body = tableValues.map(v => {
      const resFwd = convert(v, cat.id, u1.id, u2.id)
      const resBwd = convert(v, cat.id, u2.id, u1.id)
      return `"${v}","${resFwd !== null ? fmt(resFwd, 6) : ''}","${v}","${resBwd !== null ? fmt(resBwd, 6) : ''}"`
    }).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${u1.id}-to-${u2.id}-conversion-table.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('Downloaded CSV Table!', 'success')
  }

  if (!resolution || !cat || !u1 || !u2) {
    return (
      <div className="text-center py-16 space-y-4">
        <SEOHead
          title="Conversion Pair Not Found — Omega X"
          description={`The requested conversion pair "${pairParam || ''}" could not be resolved. Browse all unit categories.`}
          path={location.pathname}
          noindex={true}
        />
        <div className="text-4xl" role="img" aria-hidden="true">🔍</div>
        <h1 className="text-xl font-bold text-[var(--text)]">Conversion Pair Not Found</h1>
        <p className="text-xs text-[var(--text2)] max-w-md mx-auto">
          We couldn't resolve the pair "{pairParam}". Please select a category to find your units.
        </p>
        <Link
          to="/categories"
          className="inline-block px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:brightness-110 transition-all"
        >
          Browse All Categories
        </Link>
      </div>
    )
  }

  return (
    <article className="space-y-6">
      <SEOHead
        title={pageTitle}
        description={metaDescription}
        path={`/convert/${cat.id}/${pairParam}`}
        schema={schema as Record<string, unknown>}
      />

      {/* Breadcrumb matching Image 2 */}
      <Breadcrumbs
        items={[
          { label: 'Tools', path: '/categories' },
          { label: cat.lb, path: `/convert/${cat.id}` },
          { label: `${u1.lb} to ${u2.lb}` }
        ]}
        backTo={{ label: `All ${cat.lb} Tools`, path: `/convert/${cat.id}` }}
      />

      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-hidden="true">{cat.ic}</span>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            Convert {u1.lb} to {u2.lb}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text2)] opacity-85">
          Fast, precise online conversion tool from {u1.lb} ({u1.id}) to {u2.lb} ({u2.id}) with formula and cheat sheet table.
        </p>
      </header>

      {/* Interactive Two-Way Converter Card */}
      <section aria-labelledby="live-calc-heading" className="glass-liquid rounded-2xl p-4 sm:p-6 border border-[var(--border)] space-y-4">
        <h2 id="live-calc-heading" className="sr-only">Live {u1.lb} to {u2.lb} Converter</h2>

        <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
          {/* From Box */}
          <div className="sm:col-span-5 space-y-1.5">
            <label htmlFor="from-val" className="text-xs font-semibold text-[var(--text)] flex justify-between">
              <span>{u1.lb}</span>
              <span className="text-xs text-[var(--text2)] opacity-70 font-mono">({u1.id})</span>
            </label>
            <input
              id="from-val"
              type="text"
              inputMode="decimal"
              value={fromValue}
              onChange={e => setFromValue(e.target.value)}
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-base font-bold text-[var(--text)] font-mono outline-none focus:border-[var(--primary)] transition-colors tabular-nums"
              aria-label={`Value in ${u1.lb}`}
            />
          </div>

          {/* Swap Button */}
          <div className="sm:col-span-1 flex justify-center py-1 sm:py-0">
            <button
              onClick={handleSwap}
              className="btn-icon w-10 h-10 rounded-full border border-[var(--border)] glass text-sm"
              aria-label="Swap conversion units"
              title="Swap units"
            >
              <span aria-hidden="true">⇄</span>
            </button>
          </div>

          {/* To Box */}
          <div className="sm:col-span-5 space-y-1.5">
            <div className="text-xs font-semibold text-[var(--text)] flex justify-between">
              <span>{u2.lb}</span>
              <span className="text-xs text-[var(--text2)] opacity-70 font-mono">({u2.id})</span>
            </div>
            <div
              role="region"
              aria-live="polite"
              aria-atomic="true"
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-base font-bold text-[var(--primary)] font-mono flex items-center justify-between tabular-nums"
            >
              <span>{convertedValue !== null ? fmt(convertedValue, 6) : '—'}</span>
              <button
                onClick={handleCopy}
                className="btn-chip text-xs py-0.5 px-2"
                aria-label="Copy result"
                title="Copy result"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Quick Equality Statement */}
        <div className="text-center pt-2 border-t border-[var(--border)]/60 text-xs text-[var(--text2)] font-mono">
          1 {u1.id} = <strong className="text-[var(--text)] font-semibold">{unitRatio !== null ? fmt(unitRatio, 6) : '—'} {u2.id}</strong>
          <span className="mx-2 opacity-40 select-none">·</span>
          1 {u2.id} = <strong className="text-[var(--text)] font-semibold">{inverseUnitRatio !== null ? fmt(inverseUnitRatio, 6) : '—'} {u1.id}</strong>
        </div>
      </section>

      {/* AEO Direct-Answer Block */}
      {editorial && (
        <section aria-labelledby="aeo-answer-heading" className="glass-liquid rounded-2xl p-4 sm:p-5 border border-[var(--primary)]/30 bg-[var(--primary)]/5 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[var(--primary)] text-white text-xs font-bold flex items-center justify-center" aria-hidden="true">⚡</span>
            <h2 id="aeo-answer-heading" className="text-sm font-bold text-[var(--text)]">
              {editorial.directAnswer.heading}
            </h2>
          </div>
          <p className="text-sm font-semibold text-[var(--text)] leading-relaxed">
            {editorial.directAnswer.summary}
          </p>
          <div className="p-3 rounded-xl bg-[var(--card2)] border border-[var(--border)] font-mono text-xs text-[var(--primary)] font-bold">
            Formula: {editorial.directAnswer.formulaDisplay}
          </div>
          <p className="text-xs text-[var(--text2)] opacity-85 leading-relaxed">
            {editorial.directAnswer.calculationRule}
          </p>
        </section>
      )}

      {/* Pair-Specific Metrological Explanation */}
      {editorial && (
        <section aria-labelledby="explanation-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-3">
          <h2 id="explanation-heading" className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
            <span role="img" aria-hidden="true">📐</span> {editorial.explanation.heading}
          </h2>
          <div className="space-y-2 text-xs text-[var(--text2)] opacity-90 leading-relaxed">
            {editorial.explanation.paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="text-xs text-[var(--text2)] opacity-75 pt-1 border-t border-[var(--border)]/40 flex items-center gap-1.5 font-mono">
            <span className="font-semibold text-[var(--text)]">Standard Metrology:</span> {editorial.explanation.systemContext}
          </div>
        </section>
      )}

      {/* Practical Real-World Use Cases */}
      {editorial && editorial.useCases.length > 0 && (
        <section aria-labelledby="usecases-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-3">
          <h2 id="usecases-heading" className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
            <span role="img" aria-hidden="true">🎯</span> Common Practical Applications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {editorial.useCases.map((uc, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--card2)] border border-[var(--border)] space-y-1">
                <h3 className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                  {uc.domain}
                </h3>
                <p className="text-xs text-[var(--text2)] opacity-85 leading-relaxed">
                  {uc.context}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reciprocal Relationship & Cross-Linking */}
      {editorial && (
        <section aria-labelledby="reciprocal-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold uppercase tracking-wider">
                {editorial.reciprocal.badgeText}
              </span>
              <h2 id="reciprocal-heading" className="text-xs font-bold text-[var(--text)]">
                Reverse Conversion Option
              </h2>
            </div>
            <p className="text-xs text-[var(--text2)] opacity-85">
              {editorial.reciprocal.description}
            </p>
          </div>
          <Link
            to={editorial.reciprocal.url}
            className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:brightness-110 transition-all whitespace-nowrap self-start sm:self-center"
          >
            {editorial.reciprocal.anchorText} &rarr;
          </Link>
        </section>
      )}

      {/* Contextual Educational Guide Callout */}
      {relatedGuide && (
        <section aria-labelledby="guide-callout-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--primary)]/30 bg-[var(--primary)]/5 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 id="guide-callout-heading" className="text-sm font-bold text-[var(--text)]">
                Need detailed formula derivations or worked calculation steps?
              </h2>
              <p className="text-xs text-[var(--text2)] opacity-85 mt-1">
                Read our in-depth {relatedGuide.title} Conversion Guide with step-by-step mathematical proofs, lookup tables, and worked examples.
              </p>
            </div>
            <Link
              to={`/guides/${relatedGuide.guideSlug}`}
              className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap self-start sm:self-center"
            >
              Read {relatedGuide.title} Guide &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* 1 to 100 Precomputed Conversion Reference Table */}
      <section aria-labelledby="table-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 id="table-heading" className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
              <span role="img" aria-hidden="true">📊</span> {u1.lb} to {u2.lb} Conversion Table
            </h2>
            <span className="text-xs text-[var(--text2)] opacity-70">1 to 1,000 reference values</span>
          </div>

          <div className="flex items-center gap-1.5 no-print">
            <button
              onClick={handlePrint}
              className="btn-secondary text-xs gap-1.5"
              title="Print or Save as PDF"
              aria-label="Print or save conversion table as PDF"
            >
              <span aria-hidden="true">🖨️</span>
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              className="btn-secondary text-xs gap-1.5"
              title="Download Excel / CSV"
              aria-label="Download conversion table as CSV"
            >
              <span aria-hidden="true">📥</span>
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Printable Title visible during print */}
        <div className="hidden print:block text-center py-2 border-b border-gray-300">
          <h2 className="text-lg font-bold text-[var(--text)]">NumanX Omega — {u1.lb} to {u2.lb} Conversion Sheet</h2>
          <p className="text-xs text-gray-600">Formula: 1 {u1.id} = {unitRatio !== null ? fmt(unitRatio, 6) : ''} {u2.id}</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-xs text-left border-collapse">
            <caption className="sr-only">
              {u1.lb} to {u2.lb} Conversion Table and Multi-Unit Equivalence Matrix
            </caption>
            <thead className="bg-[var(--card2)] text-[var(--text)] font-semibold border-b border-[var(--border)]">
              <tr>
                <th scope="col" className="p-2.5 font-bold text-[var(--text)]">{u1.lb} ({u1.id})</th>
                <th scope="col" className="p-2.5 text-[var(--primary)] font-bold">{u2.lb} ({u2.id})</th>
                <th scope="col" className="p-2.5 hidden sm:table-cell font-bold text-[var(--text)]">{u2.lb} ({u2.id})</th>
                <th scope="col" className="p-2.5 hidden sm:table-cell text-[var(--text)] font-bold">{u1.lb} ({u1.id})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/60 font-mono text-xs">
              {tableValues.map(v => {
                const resForward = convert(v, cat.id, u1.id, u2.id)
                const resBackward = convert(v, cat.id, u2.id, u1.id)
                return (
                  <tr key={v} className="hover:bg-[var(--border)]/30 transition-colors">
                    <th scope="row" className="p-2.5 font-semibold text-[var(--text)] text-left font-mono">{v} {u1.id}</th>
                    <td className="p-2.5 text-[var(--primary)] font-bold font-mono">{resForward !== null ? fmt(resForward, 4) : '—'} {u2.id}</td>
                    <td className="p-2.5 hidden sm:table-cell text-[var(--text2)] font-mono">{v} {u2.id}</td>
                    <td className="p-2.5 hidden sm:table-cell text-[var(--text)] font-mono">{resBackward !== null ? fmt(resBackward, 4) : '—'} {u1.id}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Related Pairs in Category */}
      <section aria-labelledby="related-pairs-heading" className="glass rounded-2xl p-4 border border-[var(--border)] space-y-3">
        <h2 id="related-pairs-heading" className="text-sm font-bold text-[var(--text)]">
          Other Popular {cat.lb} Conversions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {cat.un.slice(0, 6).filter(u => u.id !== u1.id).map(other => (
            <Link
              key={other.id}
              to={`/convert/${cat.id}/${u1.id.toLowerCase()}-to-${other.id.toLowerCase()}`}
              className="p-2.5 rounded-xl glass border border-transparent hover:border-[var(--border)] text-xs transition-all interact-lift flex items-center justify-between"
            >
              <span className="font-medium text-[var(--text)]">{u1.id} → {other.id}</span>
              <span className="text-xs text-[var(--text2)] opacity-70 truncate">{other.lb}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions — Visible FAQ Parity */}
      <section aria-labelledby="pair-faq-heading" className="space-y-3">
        <h2 id="pair-faq-heading" className="text-sm font-semibold flex items-center gap-2 text-[var(--text)]">
          <span aria-hidden="true">❓</span> Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {editorial?.faqs.map((f, i) => (
            <details key={i} className="group glass rounded-xl border border-[var(--border)] overflow-hidden" open={i === 0}>
              <summary className="flex items-center justify-between p-3.5 text-xs font-semibold cursor-pointer select-none text-[var(--text)] hover:text-[var(--primary)] transition-colors list-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2 pr-2">
                  <span className="w-5 h-5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-bold flex-shrink-0" aria-hidden="true">Q</span>
                  <span>{f.question}</span>
                </span>
                <span className="text-xs opacity-70 group-open:rotate-180 transition-transform duration-200 flex-shrink-0" aria-hidden="true">▼</span>
              </summary>
              <div className="px-3.5 pb-3.5 pt-1 text-xs text-[var(--text2)] opacity-90 leading-relaxed border-t border-[var(--border)]/40">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Return to Category */}
      <div className="pt-2 text-center">
        <Link
          to={`/convert/${cat.id}`}
          className="text-xs text-[var(--primary)] hover:underline font-semibold"
        >
          ← Return to All {cat.lb} Units & Interactive Tools
        </Link>
      </div>
    </article>
  )
}

export default function PairLanding() {
  const { category: catParam, pair: pairParam = '' } = useParams<{ category?: string; pair: string }>()
  const [searchParams] = useSearchParams()
  const rawVal = searchParams.get('val')
  const initialVal = parsePairQueryVal(rawVal)
  const routeKey = `${catParam ?? ''}/${pairParam}?val=${rawVal ?? ''}`

  return (
    <PairLandingInner
      key={routeKey}
      catParam={catParam}
      pairParam={pairParam}
      initialVal={initialVal}
    />
  )
}
