import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import SEOHead from '../components/ui/SEOHead'
import { getAllCategories, convert } from '../engine/converter'
import { fmt, parseSmart } from '../utils/numbers'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { useToast } from '../hooks/useToast'
import { resolveCategoryId } from '../engine/routes'
import { canonicalUrl } from '../config/site'
import type { CategoryDef, UnitDef } from '../types'

function findUnit(cat: CategoryDef, raw: string): UnitDef | undefined {
  const q = raw.trim().toLowerCase()
  const qSpaced = q.replace(/-/g, ' ')
  // Clean plural 's' or 'es'
  const singular = q.endsWith('ies') ? q.slice(0, -3) + 'y' :
                   q.endsWith('es') ? q.slice(0, -2) :
                   q.endsWith('s') ? q.slice(0, -1) : q
  const singularSpaced = qSpaced.endsWith('ies') ? qSpaced.slice(0, -3) + 'y' :
                         qSpaced.endsWith('es') ? qSpaced.slice(0, -2) :
                         qSpaced.endsWith('s') ? qSpaced.slice(0, -1) : qSpaced

  return cat.un.find(u => {
    const uid = u.id.toLowerCase()
    const ulb = u.lb.toLowerCase()
    if (uid === q || ulb === q || uid === qSpaced || ulb === qSpaced) return true
    if (uid === singular || ulb === singular || uid === singularSpaced || ulb === singularSpaced) return true
    if (u.al?.some(a => {
      const alLower = a.toLowerCase()
      return alLower === q || alLower === qSpaced || alLower === singular || alLower === singularSpaced
    })) return true
    return false
  })
}

export default function PairLanding() {
  const { category: catParam, pair: pairParam } = useParams<{ category?: string; pair: string }>()
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
  const resolution = useMemo(() => {
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
  }, [allCats, catParam, fromSlug, toSlug])

  const [fromValue, setFromValue] = useState<string>('1')

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

  const pageTitle = u1 && u2 ? `Convert ${u1.lb} to ${u2.lb} (${u1.id} to ${u2.id})` : ''
  const metaDescription = u1 && u2 ? `Free online ${u1.lb} to ${u2.lb} converter. 1 ${u1.lb} = ${unitRatio !== null ? fmt(unitRatio, 4) : ''} ${u2.lb}. Includes live calculator, exact formula, and 1 to 100 conversion chart.` : ''

  const schema = useMemo(() => {
    if (!cat || !u1 || !u2) return null
    const pageUrl = canonicalUrl(`/convert/${cat.id}/${pairParam}`)
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          '@id': `${pageUrl}#software`,
          name: `${u1.lb} to ${u2.lb} Precision Calculator`,
          url: pageUrl,
          description: metaDescription,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'All',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${pageUrl}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Categories', item: canonicalUrl('/categories') },
            { '@type': 'ListItem', position: 3, name: cat.lb, item: canonicalUrl(`/convert/${cat.id}`) },
            { '@type': 'ListItem', position: 4, name: `${u1.lb} to ${u2.lb}`, item: pageUrl },
          ],
        },
        {
          '@type': 'FAQPage',
          '@id': `${pageUrl}#faq`,
          mainEntity: [
            {
              '@type': 'Question',
              name: `How many ${u2.lb} in 1 ${u1.lb}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `1 ${u1.lb} (${u1.id}) is equal to ${unitRatio !== null ? fmt(unitRatio, 6) : ''} ${u2.lb} (${u2.id}).`,
              },
            },
            {
              '@type': 'Question',
              name: `How to convert ${u1.lb} to ${u2.lb}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `To convert from ${u1.lb} to ${u2.lb}, multiply the value by ${unitRatio !== null ? fmt(unitRatio, 6) : 'the conversion factor'}.`,
              },
            },
          ],
        },
      ],
    }
  }, [cat, u1, u2, pairParam, metaDescription, unitRatio])

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

      {/* Formula & Explanation */}
      <section aria-labelledby="formula-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-3">
        <h2 id="formula-heading" className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
          <span role="img" aria-hidden="true">📐</span> How to Convert {u1.lb} to {u2.lb}
        </h2>
        <div className="p-3.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] font-mono text-xs text-[var(--primary)] font-semibold">
          {cat.id === 'temp'
            ? u1.id === 'C' && u2.id === 'F'
              ? '°F = (°C × 9/5) + 32'
              : u1.id === 'F' && u2.id === 'C'
              ? '°C = (°F - 32) × 5/9'
              : `${u2.id} = formula(${u1.id})`
            : `${u2.id} = ${u1.id} × ${unitRatio !== null ? fmt(unitRatio, 8) : ''}`}
        </div>
        <div className="text-xs text-[var(--text2)] opacity-85 leading-relaxed space-y-1">
          <p>
            <strong>Step 1:</strong> Take the number of {u1.lb} you want to convert (for example, 10 {u1.id}).
          </p>
          <p>
            <strong>Step 2:</strong> {cat.id === 'temp' ? 'Apply the scale temperature formula.' : `Multiply by the conversion factor (${unitRatio !== null ? fmt(unitRatio, 6) : ''}).`}
          </p>
          <p>
            <strong>Result:</strong> 10 {u1.id} = {convert(10, cat.id, u1.id, u2.id) !== null ? fmt(convert(10, cat.id, u1.id, u2.id)!, 4) : ''} {u2.id}.
          </p>
        </div>
      </section>

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
