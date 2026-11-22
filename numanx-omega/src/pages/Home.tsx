// Canonical entity: Omega X Converter · NumanX Studio

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ConverterCard from '../components/converter/ConverterCard'
import SEOHead from '../components/ui/SEOHead'
import { PAGE_META } from '../config/pageMeta'
import { Categories } from '../engine/categories'
import { getAllCategories } from '../engine/converter'
import { buildHomeSchema } from '../config/schema'
import { categoryIcon } from '../config/categoryIcons'

const POPULAR_PAIRS = [
  { label: 'Meters to feet', path: '/convert/length/meter-to-feet', formula: '1 m = 3.28084 ft' },
  { label: 'Kilometers to miles', path: '/convert/length/kilometer-to-miles', formula: '1 km = 0.621371 mi' },
  { label: 'Kilograms to pounds', path: '/convert/mass/kilogram-to-pounds', formula: '1 kg = 2.20462 lb' },
  { label: 'Ounces to grams', path: '/convert/mass/ounces-to-grams', formula: '1 oz = 28.3495 g' },
  { label: 'Celsius to Fahrenheit', path: '/convert/temp/celsius-to-fahrenheit', formula: '°F = (°C × 9/5) + 32' },
  { label: 'Liters to gallons', path: '/convert/volume/liters-to-gallons', formula: '1 L = 0.264172 gal' },
  { label: 'km/h to mph', path: '/convert/speed/km-h-to-mph', formula: '1 km/h = 0.621371 mph' },
  { label: 'Bar to PSI', path: '/convert/pressure/bar-to-psi', formula: '1 bar = 14.5038 psi' },
]

const GUIDES = [
  { title: 'Metric vs imperial: engineering guide', path: '/blog/metric-vs-imperial-engineering-guide' },
  { title: 'Temperature scales and absolute zero', path: '/blog/temperature-scales-celsius-fahrenheit-kelvin' },
  { title: 'Fractional inches to millimeters', path: '/blog/fractional-inches-to-mm-best-practices' },
]

const sectionTitle = 'text-xl sm:text-2xl'

export default function Home() {
  const homeSchema = useMemo(() => buildHomeSchema(), [])
  const allCats = useMemo(() => getAllCategories(), [])
  const [catId, setCatId] = useState('length')
  const cat = allCats.find(c => c.id === catId) ?? allCats[0]
  const totalUnits = Categories.reduce((acc, c) => acc + c.un.length, 0)

  // Sensible starting pair for the selected category
  const defaultPair: Record<string, [string, string]> = {
    length: ['m', 'ft'], mass: ['kg', 'lb'], temp: ['c', 'f'], volume: ['l', 'gal'],
  }
  const [fromId, toId] = (() => {
    const d = defaultPair[cat.id]
    if (d && cat.un.some(u => u.id === d[0]) && cat.un.some(u => u.id === d[1])) return d
    return [cat.un[0].id, (cat.un[1] ?? cat.un[0]).id]
  })()

  return (
    <article className="space-y-12">
      <SEOHead {...PAGE_META['/']} path="/" schema={homeSchema} />

      <div className="space-y-5">
        <header className="space-y-3">
          <h1>Omega X Converter</h1>
          <p className="text-lg text-[var(--text2)] max-w-2xl">
            Free unit converter with {Categories.length} categories and {totalUnits} units. Runs in your browser.
          </p>
        </header>

        <div className="max-w-xs">
          <label htmlFor="home-category" className="block text-[13px] font-semibold text-[var(--text2)] mb-1.5">Category</label>
          <select
            id="home-category"
            value={cat.id}
            onChange={e => setCatId(e.target.value)}
            className="w-full min-h-[48px] rounded-xl border border-[var(--border-control)] bg-[var(--card)] text-[var(--text)] px-3 text-base hover:border-[var(--text)]"
          >
            {allCats.map(c => <option key={c.id} value={c.id}>{c.lb}</option>)}
          </select>
        </div>
        <ConverterCard key={cat.id} cat={cat} fromId={fromId} toId={toId} title={`${cat.lb} converter`} />
      </div>

      <section aria-labelledby="popular-heading" className="space-y-4">
        <h2 id="popular-heading" className={sectionTitle}>Popular conversions</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {POPULAR_PAIRS.map(p => (
            <li key={p.path}>
              <Link to={p.path} className="nx-card-link block h-full p-4">
                <span className="block font-semibold">{p.label}</span>
                <span className="block mt-1 text-[15px] text-[var(--text2)] tabular">{p.formula}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="domains-heading" className="space-y-4">
        <h2 id="domains-heading" className={sectionTitle}>All {Categories.length} categories</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Categories.map(c => {
            const Icon = categoryIcon(c.id)
            return (
              <li key={c.id}>
                <Link to={`/convert/${c.id}`} className="nx-card-link flex items-center gap-3 h-full min-h-[56px] px-4 py-3">
                  <Icon size={20} className="text-[var(--text2)] shrink-0" aria-hidden="true" />
                  <span className="font-medium truncate">{c.lb}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="guides-heading" className="space-y-4">
        <h2 id="guides-heading" className={sectionTitle}>Guides</h2>
        <ul className="flex flex-wrap gap-2">
          {GUIDES.map(g => (
            <li key={g.path}><Link to={g.path} className="nx-chip">{g.title}</Link></li>
          ))}
          <li><Link to="/blog" className="nx-chip font-semibold">All articles</Link></li>
        </ul>
      </section>
    </article>
  )
}
