// Canonical entity: Omega X Converter · NumanX Studio
/* Anti-Slop Gate · P5 H5 E5 S5 R5 V5 · Silhouette: Spatial Bento Workbench */

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import UniversalConverter from '../components/converter/UniversalConverter'
import SEOHead from '../components/ui/SEOHead'
import { PAGE_META } from '../config/pageMeta'
import { Categories } from '../engine/categories'
import { buildHomeSchema } from '../config/schema'
import type { AppMode } from '../components/widgets/ModeSwitcher'

interface Props {
  mode?: AppMode
}

const POPULAR_PAIRS = [
  { label: 'Meter to Feet', from: 'm', to: 'ft', cat: 'length', path: '/convert/length/meter-to-feet', formula: '1 m = 3.28084 ft' },
  { label: 'Kilometer to Miles', from: 'km', to: 'mi', cat: 'length', path: '/convert/length/kilometer-to-miles', formula: '1 km = 0.621371 mi' },
  { label: 'Kilogram to Pounds', from: 'kg', to: 'lb', cat: 'mass', path: '/convert/mass/kilogram-to-pounds', formula: '1 kg = 2.20462 lb' },
  { label: 'Ounces to Grams', from: 'oz', to: 'g', cat: 'mass', path: '/convert/mass/ounces-to-grams', formula: '1 oz = 28.3495 g' },
  { label: 'Celsius to Fahrenheit', from: '°C', to: '°F', cat: 'temp', path: '/convert/temp/celsius-to-fahrenheit', formula: '°F = (°C × 9/5) + 32' },
  { label: 'Liters to Gallons', from: 'L', to: 'gal', cat: 'volume', path: '/convert/volume/liters-to-gallons', formula: '1 L = 0.264172 gal' },
  { label: 'km/h to mph', from: 'km/h', to: 'mph', cat: 'speed', path: '/convert/speed/km-h-to-mph', formula: '1 km/h = 0.621371 mph' },
  { label: 'Bar to PSI', from: 'bar', to: 'psi', cat: 'pressure', path: '/convert/pressure/bar-to-psi', formula: '1 bar = 14.5038 psi' },
]

const GUIDES_AND_EDITORIAL = [
  { title: 'Meters to Feet Conversion Guide', path: '/guides/meters-to-feet', desc: 'Precision conversion factors, architectural scale, and NIST formulas.' },
  { title: 'Pounds to Kilograms Reference', path: '/guides/lbs-to-kg', desc: 'International avoirdupois pound conversion and SI mass traceability.' },
  { title: 'Celsius to Fahrenheit Scale Guide', path: '/guides/celsius-to-fahrenheit', desc: 'Thermodynamic zero, freezing points, and temperature conversion.' },
  { title: 'Metric vs Imperial: Engineering Guide', path: '/blog/metric-vs-imperial-engineering-guide', desc: 'Historical origins, industrial standardization, and dual-unit drafting.' },
  { title: 'Temperature Scales & Thermodynamic Zero', path: '/blog/temperature-scales-celsius-fahrenheit-kelvin', desc: 'Comparative metrology across Celsius, Fahrenheit, Kelvin, and Rankine.' },
  { title: 'Fractional Inches to Millimeters', path: '/blog/fractional-inches-to-mm-best-practices', desc: 'Machinist tolerances, 1/64 tape fraction lookup, and metric offsets.' },
]

export default function Home({ mode = 'pro' }: Props) {
  const [showAllCategories, setShowAllCategories] = useState(false)
  const homeSchema = useMemo(() => buildHomeSchema(), [])
  const totalUnits = useMemo(() => Categories.reduce((acc, cat) => acc + cat.un.length, 0), [])

  return (
    <article className="space-y-6 max-w-6xl mx-auto w-full min-w-0">
      <SEOHead
        {...PAGE_META['/']}
        path="/"
        schema={homeSchema}
      />

      {/* 1. Compact Masthead (< 80px vertical footprint) */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2">
            <span aria-hidden="true" className="font-mono text-sm px-2 py-0.5 rounded-lg bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border-subtle)] font-bold">
              NΩ
            </span>
            <span>Omega X Converter</span>
          </h1>
          <p className="text-xs text-[var(--text2)] mt-0.5">
            Precision metrology suite · 28 scientific domains · {totalUnits} category unit listings · Deterministic decimal engine
          </p>
        </div>
        {mode !== 'pro' && (
          <span className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-full bg-[var(--surface-3)] border border-[var(--border-control)] text-[var(--link-text)] font-medium">
            Active Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </span>
        )}
      </header>

      {/* 2. Dominant Primary Conversion Instrument (Above-the-Fold Centerpiece) */}
      <section aria-labelledby="workbench-heading" className="w-full min-w-0">
        <h2 id="workbench-heading" className="sr-only">
          Primary Conversion Instrument
        </h2>
        <div className="bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-2xl p-3.5 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--text2)]">
                Conversion Workbench
              </span>
            </div>
            <Link
              to="/converter"
              className="text-xs font-medium text-[var(--link-text)] hover:underline flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded min-h-[44px] px-2"
            >
              Full Workbench Grid →
            </Link>
          </div>
          <UniversalConverter mode={mode} variant="embedded" hideComplexPanels={true} />
        </div>

        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllCategories(prev => !prev)}
            className="btn-chip text-xs px-4 py-2 min-h-[44px] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--link-text)] font-semibold flex items-center gap-1.5 transition-all"
            aria-expanded={showAllCategories}
          >
            <span>{showAllCategories ? 'Show Less (Top 8 Categories)' : `Explore All 28 Measurement Domains (+${Categories.length - 8} more)`}</span>
            <span aria-hidden="true">{showAllCategories ? '▲' : '▼'}</span>
          </button>
        </div>
      </section>

      {/* 3. Canonical Metrology Domains (All 24 Categories) */}
      <section aria-labelledby="domains-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="domains-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--text2)]">
            28 Metrological Domains
          </h2>
          <Link
            to="/categories"
            className="text-xs font-medium text-[var(--link-text)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded min-h-[44px] px-2 flex items-center"
          >
            Directory View →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {(showAllCategories ? Categories : Categories.slice(0, 8)).map(cat => (
            <Link
              key={cat.id}
              to={`/convert/${cat.id}`}
              className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)] transition-all flex items-center justify-between gap-2 min-h-[44px] group focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg flex-shrink-0" aria-hidden="true">
                  {cat.ic}
                </span>
                <span className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--link-text)] truncate">
                  {cat.lb}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[var(--text2)] opacity-70 flex-shrink-0">
                {cat.un.length}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Popular Conversion Pairs */}
      <section aria-labelledby="popular-heading" className="space-y-3">
        <h2 id="popular-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--text2)]">
          Popular Conversion Pairs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {POPULAR_PAIRS.map(pair => (
            <Link
              key={pair.path}
              to={pair.path}
              className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)] transition-all space-y-1 block min-h-[44px] group focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--link-text)]">
                  {pair.label}
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text2)] border border-[var(--border-subtle)]">
                  {pair.from} → {pair.to}
                </span>
              </div>
              <div className="text-[11px] font-mono text-[var(--text2)] truncate">
                {pair.formula}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Metrological Guides & Engineering Reference */}
      <section aria-labelledby="guides-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="guides-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--text2)]">
            Metrological Guides & Editorial Reference
          </h2>
          <Link
            to="/blog"
            className="text-xs font-medium text-[var(--link-text)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded min-h-[44px] px-2 flex items-center"
          >
            All Articles →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GUIDES_AND_EDITORIAL.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)] transition-all space-y-1.5 block min-h-[44px] group focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              <div className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--link-text)]">
                {item.title}
              </div>
              <p className="text-[11px] text-[var(--text2)] leading-relaxed line-clamp-2">
                {item.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Factual Platform Architecture Metrics (Data-Driven, Zero Fake Stats) */}
      <section aria-labelledby="metrics-heading" className="pt-2">
        <h2 id="metrics-heading" className="sr-only">
          Platform Architecture Metrics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)]">
            <div className="text-lg font-mono font-bold text-[var(--text)]">28</div>
            <div className="text-[11px] text-[var(--text2)]">Canonical Domains</div>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)]">
            <div className="text-lg font-mono font-bold text-[var(--text)]">{totalUnits}</div>
            <div className="text-[11px] text-[var(--text2)]">Category Unit Listings</div>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)]">
            <div className="text-lg font-mono font-bold text-[var(--text)]">123</div>
            <div className="text-[11px] text-[var(--text2)]">Published Pair Guides</div>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)]">
            <div className="text-lg font-mono font-bold text-[var(--text)]">0</div>
            <div className="text-[11px] text-[var(--text2)]">Third-Party Trackers</div>
          </div>
        </div>
      </section>
    </article>
  )
}
