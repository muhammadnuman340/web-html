import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import SEOHead from '../components/ui/SEOHead'
import { PAGE_META } from '../config/pageMeta'
import { getAllCategories } from '../engine/converter'
import { buildCategoriesDirectorySchema } from '../config/schema'
import { categoryIcon } from '../config/categoryIcons'

export default function Categories() {
  const cats = useMemo(() => getAllCategories(), [])
  const [filter, setFilter] = useState('')

  const filteredCats = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return cats
    return cats.filter(c =>
      c.lb.toLowerCase().includes(q) ||
      c.un.some(u => u.lb.toLowerCase().includes(q) || u.id.toLowerCase().includes(q))
    )
  }, [cats, filter])

  const totalUnits = cats.reduce((a, c) => a + c.un.length, 0)
  const categoriesSchema = useMemo(() => buildCategoriesDirectorySchema(cats), [cats])

  return (
    <article className="space-y-6">
      <SEOHead {...PAGE_META['/categories']} path="/categories" schema={categoriesSchema} />

      <header className="space-y-3">
        <h1>All conversion categories</h1>
        <p className="text-lg text-[var(--text2)]">{cats.length} categories and {totalUnits} units.</p>
      </header>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text2)]" aria-hidden="true" />
        <input
          type="search"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search categories or units"
          className="w-full min-h-[48px] pl-10 pr-12 rounded-xl border border-[var(--border-control)] bg-[var(--card)] text-base text-[var(--text)] hover:border-[var(--text)]"
          aria-label="Filter categories and units"
        />
        {filter && (
          <button type="button" onClick={() => setFilter('')} className="absolute right-1 top-1/2 -translate-y-1/2 btn-icon border-transparent" aria-label="Clear filter">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {filteredCats.length === 0 ? (
        <p className="nx-card p-8 text-center text-[var(--text2)]">
          No categories match "{filter}". Try length, weight, miles or celsius.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCats.map(cat => {
            const Icon = categoryIcon(cat.id)
            return (
              <li key={cat.id}>
                <Link to={`/convert/${cat.id}`} className="nx-card-link flex gap-3 h-full p-4">
                  <Icon size={22} className="text-[var(--text2)] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block font-semibold">{cat.lb}</span>
                    <span className="block mt-1 text-[15px] text-[var(--text2)] line-clamp-2">
                      {cat.un.length} units: {cat.un.slice(0, 4).map(u => u.lb).join(', ')}{cat.un.length > 4 ? ' and more' : ''}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}
