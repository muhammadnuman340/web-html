import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllCategories, getCategory } from '../engine/converter'
import { addCustomUnit } from '../engine/converter'
import { useToast } from '../hooks/useToast'
import type { CustomUnit } from '../types'

const CUSTOM_KEY = 'uc_custom_units'

function loadCustom(): CustomUnit[] {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]') } catch { return [] }
}

function saveCustom(units: CustomUnit[]) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(units))
}

export default function CustomUnits() {
  const [customs, setCustoms] = useState<CustomUnit[]>(loadCustom)
  const [catId, setCatId] = useState('length')
  const [name, setName] = useState('')
  const [sym, setSym] = useState('')
  const [rate, setRate] = useState('')
  const { addToast } = useToast()
  const cats = useMemo(() => getAllCategories(), [])

  const add = useCallback(() => {
    if (!name.trim() || !sym.trim() || !rate.trim()) {
      addToast('Fill all fields', 'warning', '⚠️')
      return
    }
    const r = parseFloat(rate)
    if (isNaN(r) || r <= 0) {
      addToast('Rate must be a positive number', 'error', '❌')
      return
    }
    const id = sym.trim().toLowerCase().replace(/\s+/g, '_')
    const cat = getCategory(catId)
    if (cat && cat.un.find(u => u.id === id)) {
      addToast('Symbol already exists in this category', 'warning', '⚠️')
      return
    }
    const ok = addCustomUnit(catId, id, name.trim(), r)
    if (!ok) { addToast('Failed to add unit', 'error', '❌'); return }
    const cu: CustomUnit = { lb: name.trim(), id, r, cat: catId }
    const next = [...customs, cu]
    setCustoms(next)
    saveCustom(next)
    addToast(`Added ${name} (${id})`, 'success', '✅')
    setName(''); setSym(''); setRate('')
  }, [name, sym, rate, catId, customs, addToast])

  const remove = useCallback((idx: number) => {
    const next = customs.filter((_, i) => i !== idx)
    setCustoms(next)
    saveCustom(next)
    // Reload page to reflect changes
    window.location.reload()
  }, [customs])

  const grouped = useMemo(() => {
    const g: Record<string, CustomUnit[]> = {}
    for (const c of customs) {
      if (!g[c.cat]) g[c.cat] = []
      g[c.cat].push(c)
    }
    return g
  }, [customs])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="page-header">
        <h2 className="text-lg font-bold">⚒️ Custom Unit Creator</h2>
        <p className="text-xs opacity-40 mt-1">Define your own units and conversion factors</p>
      </div>

      {/* Add form */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wide opacity-50">New Custom Unit</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select value={catId} onChange={e => setCatId(e.target.value)}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs outline-none focus:border-[var(--primary)]">
            {cats.filter(c => !c.curr && !c.crypto).map(c => (
              <option key={c.id} value={c.id}>{c.ic} {c.lb}</option>
            ))}
          </select>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Unit name (e.g. MyToken)"
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs outline-none focus:border-[var(--primary)]" />
          <input type="text" value={sym} onChange={e => setSym(e.target.value)}
            placeholder="Symbol (e.g. MTK)"
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs outline-none focus:border-[var(--primary)]" />
          <input type="text" value={rate} onChange={e => setRate(e.target.value)}
            placeholder="1 of base = ?"
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs outline-none focus:border-[var(--primary)]" />
        </div>
        <div className="text-[10px] opacity-30">Rate: how many base units equal 1 of your unit (e.g., for length base is meters)</div>
        <button onClick={add}
          className="w-full py-2 rounded-xl text-sm font-medium bg-[var(--primary)] text-white hover:shadow-lg hover:shadow-[var(--primary)]/30 transition-all interact-lift">
          + Add Custom Unit
        </button>
      </div>

      {/* Existing custom units */}
      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-3">
          {Object.entries(grouped).map(([cat, units]) => {
            const c = cats.find(x => x.id === cat)
            return (
              <div key={cat}>
                <div className="text-xs font-semibold opacity-50 mb-1 flex items-center gap-1">
                  <span>{c?.ic || '📦'}</span>
                  <span>{c?.lb || cat}</span>
                  <span className="opacity-30">· {units.length} units</span>
                </div>
                <div className="space-y-1">
                  {units.map((u, i) => (
                    <div key={u.id}
                      className="glass rounded-xl px-3 py-2 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{u.lb}</span>
                        <span className="text-xs opacity-40 ml-2">({u.id})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] opacity-40">1 = {u.r}</span>
                        <button onClick={() => remove(customs.indexOf(u))}
                          className="p-1 rounded-lg text-[10px] opacity-30 hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 transition-all">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 opacity-30 text-xs">
          No custom units yet. Create your first one above.
        </div>
      )}

      <div className="text-[10px] opacity-20 text-center">
        Custom units are stored locally in your browser and will be available in the converter.
      </div>
    </motion.div>
  )
}
