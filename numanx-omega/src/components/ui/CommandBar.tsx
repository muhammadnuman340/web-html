import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { parseNaturalLanguage } from '../../engine/smartParser'
import { getAllCategories } from '../../engine/converter'

interface Props {
  open: boolean
  onClose: () => void
  onConvert: (val: number, from: string, to: string) => void
}

export default function CommandBar({ open, onClose, onConvert }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ label: string; type: string; action: () => void }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase()
    const parsed = parseNaturalLanguage(query)
    const r: { label: string; type: string; action: () => void }[] = []

    if (parsed.type === 'convert' && parsed.value && parsed.fromUnit && parsed.toUnit) {
      r.push({
        label: `🔄 Convert ${parsed.value} ${parsed.fromUnit} → ${parsed.toUnit}`,
        type: 'convert',
        action: () => { onConvert(parsed.value!, parsed.fromUnit!, parsed.toUnit!); onClose() }
      })
    }

    getAllCategories().forEach(c => {
      if (c.lb.toLowerCase().includes(q) || c.id.includes(q)) {
        r.push({
          label: `${c.ic} ${c.lb}`,
          type: 'category',
          action: () => { navigate(`/converter?cat=${c.id}`); onClose() }
        })
      }
      c.un.forEach(u => {
        if (u.lb.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)) {
          r.push({
            label: `${u.lb} → ${c.ic} ${c.lb}`,
            type: 'unit',
            action: () => { navigate(`/converter?cat=${c.id}`); onClose() }
          })
        }
      })
    })

    const pages = [
      { label: '🏠 Home', path: '/' }, { label: '📊 Dashboard', path: '/dashboard' },
      { label: '🔄 Converter', path: '/converter' }, { label: '💵 Currency', path: '/currency' },
      { label: '₿ Crypto', path: '/crypto' }, { label: '⭐ Favorites', path: '/favorites' },
      { label: '📜 History', path: '/history' }, { label: '⚙️ Settings', path: '/settings' },
      { label: '📐 Formulas', path: '/formulas' }, { label: 'ℹ️ Help', path: '/help' }
    ]
    pages.forEach(p => {
      if (p.label.toLowerCase().includes(q)) {
        r.push({ label: p.label, type: 'page', action: () => { navigate(p.path); onClose() } })
      }
    })

    // Quick math
    const mathMatch = query.match(/^(\d+\.?\d*)\s*([+\-*/])\s*(\d+\.?\d*)$/)
    if (mathMatch) {
      const v1 = parseFloat(mathMatch[1]), op = mathMatch[2], v2 = parseFloat(mathMatch[3])
      let mathResult = 0
      switch (op) {
        case '+': mathResult = v1 + v2; break
        case '-': mathResult = v1 - v2; break
        case '*': mathResult = v1 * v2; break
        case '/': mathResult = v2 !== 0 ? v1 / v2 : 0; break
      }
      r.push({
        label: `🧮 ${v1} ${op} ${v2} = ${mathResult}`,
        type: 'math',
        action: () => { navigator.clipboard?.writeText(String(mathResult)); onClose() }
      })
    }

    setResults(r.slice(0, 10))
  }, [query, navigate, onConvert, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg glass rounded-2xl shadow-2xl overflow-hidden border border-[var(--border)]"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
              <span className="text-lg opacity-50">⌘</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search, convert, or calculate... (e.g. '5 km in miles', '100+200')"
                className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
              />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)] opacity-40">Esc</kbd>
            </div>

            {results.length > 0 && (
              <div className="max-h-72 overflow-y-auto p-2 space-y-0.5">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={r.action}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-[var(--border)] transition-colors flex items-center gap-2 interact-lift"
                  >
                    <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                      r.type === 'convert' ? 'text-green-500 bg-green-500/10' :
                      r.type === 'category' ? 'text-blue-500 bg-blue-500/10' :
                      r.type === 'math' ? 'text-yellow-500 bg-yellow-500/10' :
                      'opacity-50'
                    }`}>{r.type}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            )}

            {query && results.length === 0 && (
              <div className="p-6 text-center text-sm opacity-40">No results found</div>
            )}

            <div className="px-4 py-2 border-t border-[var(--border)] text-[10px] opacity-30 flex gap-4 flex-wrap">
              <span>⌘K Open</span>
              <span>↓↑ Navigate</span>
              <span>⏎ Select</span>
              <span>Esc Close</span>
              <span>⌘⇧C Quick Convert</span>
              <span>⌘H History</span>
              <span>⌘D Dark Mode</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
