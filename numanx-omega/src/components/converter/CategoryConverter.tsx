import { useMemo, useState } from 'react'
import ConverterCard from './ConverterCard'
import { getAllCategories } from '../../engine/converter'

// Sensible starting pairs for the most used categories
const DEFAULT_PAIRS: Record<string, [string, string]> = {
  length: ['m', 'ft'], mass: ['kg', 'lb'], temp: ['c', 'f'], volume: ['l', 'gal'],
}

interface Props {
  initialCategory?: string
  initialFrom?: string
  initialTo?: string
  initialValue?: string
}

/** Category picker + converter card, used on the home page and /converter. */
export default function CategoryConverter({ initialCategory = 'length', initialFrom, initialTo, initialValue }: Props) {
  const allCats = useMemo(() => getAllCategories(), [])
  const [catId, setCatId] = useState(() => (allCats.some(c => c.id === initialCategory) ? initialCategory : 'length'))
  const [firstCat] = useState(catId)
  const cat = allCats.find(c => c.id === catId) ?? allCats[0]

  const has = (id?: string): id is string => !!id && cat.un.some(u => u.id === id)
  const [fromId, toId] = (() => {
    // Units from the URL only apply to the category they came with
    if (cat.id === firstCat && has(initialFrom) && has(initialTo)) return [initialFrom, initialTo]
    const d = DEFAULT_PAIRS[cat.id]
    if (d && has(d[0]) && has(d[1])) return d
    return [cat.un[0].id, (cat.un[1] ?? cat.un[0]).id]
  })()

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <label htmlFor="category-select" className="block text-[13px] font-semibold text-[var(--text2)] mb-1.5">Category</label>
        <select
          id="category-select"
          value={cat.id}
          onChange={e => setCatId(e.target.value)}
          className="w-full min-h-[48px] rounded-xl border border-[var(--border-control)] bg-[var(--card)] text-[var(--text)] px-3 text-base hover:border-[var(--text)]"
        >
          {allCats.map(c => <option key={c.id} value={c.id}>{c.lb}</option>)}
        </select>
      </div>
      <ConverterCard
        key={cat.id}
        cat={cat}
        fromId={fromId}
        toId={toId}
        initialValue={cat.id === firstCat && initialValue ? initialValue : '1'}
        title={`${cat.lb} converter`}
      />
    </div>
  )
}

/** Converter card for one fixed category (blog posts and guides). */
export function FixedCategoryConverter({ catId, from, to }: { catId: string; from?: string; to?: string }) {
  const cat = getAllCategories().find(c => c.id === catId)
  if (!cat || cat.un.length < 2) return null
  const has = (id?: string): id is string => !!id && cat.un.some(u => u.id === id)
  const d = DEFAULT_PAIRS[cat.id]
  const fromId = has(from) ? from : d && has(d[0]) ? d[0] : cat.un[0].id
  const toId = has(to) ? to : d && has(d[1]) ? d[1] : cat.un[1].id
  return <ConverterCard cat={cat} fromId={fromId} toId={toId} title={`${cat.lb} converter`} />
}
