import { useState, useCallback, useEffect, useMemo, useRef, startTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCategory, getAllCategories, convert, convertAll, getFormula } from '../../engine/converter'
import { fmtSmart, fmtComma, parseSmart } from '../../utils/numbers'
import { parseNaturalLanguage, parseMixedExpression } from '../../engine/smartParser'
import { analytics } from '../../engine/analytics'
import { getExplanations, getFormulaExplanation, getDetailedSteps } from '../../engine/learning'
import { getAllChains, executeChain, suggestChain } from '../../engine/conversionChains'
import { executeBatch, parseCSV, generateSequence } from '../../engine/batchEngine'
import type { AppMode } from '../widgets/ModeSwitcher'
import { useToast } from '../../hooks/useToast'
import { useClipboardDetection } from '../../hooks/useClipboard'
import { toggleFavorite, getFavorites } from '../../services/storage'
import AdSense from '../widgets/AdSense'
import { findVisualContext } from '../../engine/visualContext'
import AIPredictions from '../widgets/AIPredictions'
import AIQuickActions from '../widgets/AIQuickActions'
import ConversionQuiz from '../widgets/ConversionQuiz'
import ConversionStreaks from '../widgets/ConversionStreaks'

interface Props {
  category?: string
  mode?: AppMode
  initialFrom?: string
  initialTo?: string
  initialValue?: number
  onHistoryAdd?: (cat: string, fv: number, fu: string, tv: number, tu: string) => void
}

export default function UniversalConverter({ category: initialCat, mode = 'pro', initialFrom, initialTo, initialValue, onHistoryAdd }: Props) {
  const [catId, setCatId] = useState(initialCat || 'length')
  const [fromVal, setFromVal] = useState(initialValue !== undefined ? String(initialValue) : '')
  const [fromUnit, setFromUnit] = useState(initialFrom || '')
  const [toUnit, setToUnit] = useState(initialTo || '')
  const [result, setResult] = useState<number | null>(null)
  const [allResults, setAllResults] = useState<{ id: string; label: string; value: number | null }[]>([])
  const [prec, setPrec] = useState(6)
  const [frac, setFrac] = useState(false)
  const [sci, setSci] = useState(false)
  const [formula, setFormula] = useState('')
  const [explanation, setExplanation] = useState<string | null>(null)
  const [steps, setSteps] = useState<{ label: string; detail: string }[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [isNatural, setIsNatural] = useState(false)
  const [chainMode, setChainMode] = useState(false)
  const [activeChain, setActiveChain] = useState<string | null>(null)
  const [chainResult, setChainResult] = useState<{ label: string; value: number; unit: string }[] | null>(null)
  const [batchMode, setBatchMode] = useState(false)
  const [batchInput, setBatchInput] = useState('')
  const [batchResults, setBatchResults] = useState<{ input: number; result: number | null }[]>([])
  const [swapRotation, setSwapRotation] = useState(0)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [pulseKey, setPulseKey] = useState(0)
  const [copyBtnIcon, setCopyBtnIcon] = useState('📋')
  const [copyFormat, setCopyFormat] = useState<'plain' | 'md' | 'latex'>('plain')
  const [showAllCats, setShowAllCats] = useState(false)
  const [showAllUnits, setShowAllUnits] = useState(false)
  const [showAIExplain, setShowAIExplain] = useState(false)
  const [showFavSuggestion, setShowFavSuggestion] = useState(false)
  const [modeSuggestion, setModeSuggestion] = useState<{ mode: string; label: string; icon: string } | null>(null)
  const [learningTip, setLearningTip] = useState<{ title: string; text: string } | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [catFilter, setCatFilter] = useState('')
  const [unitSuggestions, setUnitSuggestions] = useState<{ id: string; lb: string; cat: string; ic: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const inputHistory = useRef<string[]>([])
  const historyIndex = useRef(-1)


  useEffect(() => { inputRef.current?.focus() }, [catId])

  // Smart defaults — remember last units per category
  const DEFAULTS_KEY = 'uc_unit_defaults'
  function loadDefaults(cid: string): { from?: string; to?: string } {
    try { const d = JSON.parse(localStorage.getItem(DEFAULTS_KEY) || '{}'); return d[cid] || {} } catch { return {} }
  }
  function saveDefaults(cid: string, f: string, t: string) {
    try { const d = JSON.parse(localStorage.getItem(DEFAULTS_KEY) || '{}'); d[cid] = { from: f, to: t }; localStorage.setItem(DEFAULTS_KEY, JSON.stringify(d)) } catch { /* */ }
  }

  const cat = useMemo(() => getCategory(catId), [catId])
  const cats = useMemo(() => getAllCategories(), [])
  const chains = useMemo(() => getAllChains(), [])

  useEffect(() => {
    if (cat) {
      const saved = loadDefaults(catId)
      startTransition(() => {
        if (!fromUnit || !cat.un.find(u => u.id === fromUnit)) {
          const first = saved.from && cat.un.find(u => u.id === saved.from) ? saved.from : (initialFrom && cat.un.find(u => u.id === initialFrom) ? initialFrom : cat.un[0]?.id)
          setFromUnit(first || '')
        }
        if (!toUnit || !cat.un.find(u => u.id === toUnit)) {
          const second = saved.to && cat.un.find(u => u.id === saved.to) ? saved.to : (initialTo && cat.un.find(u => u.id === initialTo) ? initialTo : cat.un[Math.min(1, cat.un.length - 1)]?.id)
          setToUnit(second || '')
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catId])

  // Save defaults when units change

  useEffect(() => {
    if (fromUnit && toUnit) saveDefaults(catId, fromUnit, toUnit)
  }, [fromUnit, toUnit, catId])

  useEffect(() => {
    if (chainMode && activeChain) {
      const val = parseSmart(fromVal)
      if (val !== null) {
        const res = executeChain(activeChain, val)
        if (res) startTransition(() => setChainResult(res.links))
      }
      return
    }

    if (cat && fromUnit && toUnit) {
      let rawVal: number | null = null
      const parsed = parseNaturalLanguage(fromVal)
      if (parsed.type === 'convert' && parsed.value !== undefined && parsed.fromUnit && parsed.toUnit) {
        startTransition(() => setIsNatural(true))
        if (parsed.fromUnit !== fromUnit) startTransition(() => setFromUnit(parsed.fromUnit))
        if (parsed.toUnit !== toUnit) startTransition(() => setToUnit(parsed.toUnit))
      } else {
        startTransition(() => setIsNatural(false))

        const mixed = parseMixedExpression(fromVal)
        if (mixed) {
          const baseUnit = mixed.units[0]
          let total = 0
          for (let i = 0; i < mixed.values.length; i++) {
            const v = convert(mixed.values[i], catId, mixed.units[i], baseUnit)
            if (v !== null) total += (mixed.ops[i - 1] === '-' ? -v : v)
          }
          rawVal = total
          if (baseUnit !== fromUnit) startTransition(() => setFromUnit(baseUnit))
        } else {
          rawVal = parseSmart(fromVal)
        }
      }

      if (rawVal !== null) {
        if (fromVal && (inputHistory.current.length === 0 || inputHistory.current[inputHistory.current.length - 1] !== fromVal)) {
          inputHistory.current.push(fromVal)
          if (inputHistory.current.length > 20) inputHistory.current.shift()
        }
        historyIndex.current = -1
        const r = convert(rawVal, catId, fromUnit, toUnit)
        const f = getFormula(catId, fromUnit, toUnit)
        const fu = cat.un.find(u => u.id === fromUnit)
        const tu = cat.un.find(u => u.id === toUnit)
        const expl = fu && tu && fu.r && tu.r ? getFormulaExplanation(fu.lb, tu.lb, fu.r / tu.r) : null
        const st = fu && tu && fu.r && tu.r ? getDetailedSteps(fu.lb, tu.lb, rawVal, r || 0, fu.r / tu.r) : []
        startTransition(() => {
          setResult(r); setPulseKey(k => k + 1); setAllResults(convertAll(rawVal, catId, fromUnit))
          setFormula(f); setExplanation(expl); setSteps(st)
        })
        if (fu && tu && fu.r && tu.r) {
          analytics.track({ type: 'convert', category: catId, fromUnit, toUnit })
          // Update conversion streak
          try {
            const streak = JSON.parse(localStorage.getItem('uc_streaks') || '{}')
            const today = new Date().toISOString().slice(0, 10)
            if (streak.lastActiveDate !== today) {
              const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
              if (streak.lastActiveDate === yesterday) streak.currentStreak = (streak.currentStreak || 0) + 1
              else streak.currentStreak = 1
              streak.lastActiveDate = today
              streak.longestStreak = Math.max(streak.longestStreak || 0, streak.currentStreak)
              streak.totalActiveDays = (streak.totalActiveDays || 0) + 1
              localStorage.setItem('uc_streaks', JSON.stringify(streak))
            }
          } catch { /* ignore */ }
        }
      } else {
        startTransition(() => { setResult(null); setAllResults([]); setFormula(''); setExplanation(null); setSteps([]) })
      }
    }
  }, [fromVal, fromUnit, toUnit, catId, chainMode, activeChain, cat])

  const handleConvert = useCallback(() => {
    const v = parseSmart(fromVal)
    if (v !== null && result !== null) {
      onHistoryAdd?.(catId, v, fromUnit, result, toUnit)
    }
  }, [fromVal, result, fromUnit, toUnit, catId, onHistoryAdd])

  useEffect(() => {
    const timer = setTimeout(handleConvert, 1000)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  // Auto-scroll to result
  useEffect(() => {
    if (result !== null && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [result])

  // Smart favorites suggestion — prompt after 3+ conversions of same pair
  useEffect(() => {
    if (!result || !fromUnit || !toUnit) { setShowFavSuggestion(false); return }
    const pairKey = `${fromUnit}→${toUnit}`
    const count = analytics.getSummary().unitPairs[pairKey] || 0
    if (count >= 3) {
      getFavorites().then(favs => {
        const already = favs.some(f => f.cat === catId && f.from === fromUnit && f.to === toUnit)
        setShowFavSuggestion(!already)
      })
    } else {
      setShowFavSuggestion(false)
    }
  }, [result, fromUnit, toUnit, catId])

  // AI mode suggestion — detect patterns and suggest mode switch
  useEffect(() => {
    if (!catId || !result) { setModeSuggestion(null); return }
    const sciCats = ['energy', 'force', 'pressure', 'frequency', 'density', 'astronomy']
    const currencyCats = ['currency', 'crypto']
    const basicCats = ['length', 'mass', 'volume', 'temp']
    if (sciCats.includes(catId) && mode === 'pro') {
      setModeSuggestion({ mode: 'scientist', label: 'Scientist mode', icon: '🔬' })
    } else if (currencyCats.includes(catId) && mode === 'pro') {
      setModeSuggestion({ mode: 'trader', label: 'Trader mode', icon: '💹' })
    } else if (basicCats.includes(catId) && showExplanation && mode !== 'student') {
      setModeSuggestion({ mode: 'student', label: 'Student mode', icon: '🎓' })
    } else {
      setModeSuggestion(null)
    }
  }, [catId, result, mode, showExplanation])

  // AI learning tip — show a "Did you know?" after conversion
  useEffect(() => {
    if (!result) { setLearningTip(null); return }
    const exps = getExplanations(catId)
    if (exps.length > 0) {
      const idx = Math.floor(Math.random() * exps.length)
      const tip = exps[idx]
      setLearningTip({ title: tip.title, text: tip.explanation.length > 120 ? tip.explanation.slice(0, 120) + '…' : tip.explanation })
    }
  }, [result, catId])

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [contextMenu])

  const swap = () => {
    setSwapRotation(r => r + 180)
    const f = fromUnit; const t = toUnit
    setFromUnit(t); setToUnit(f)
  }

  const handleBatchConvert = () => {
    const values = parseCSV(batchInput)
    if (values.length === 0) return
    const results = executeBatch({ values, catId, fromUnit, toUnit })
    setBatchResults(results.map(r => ({ input: r.input, result: r.result })))
  }

  const autoSuggestChain = useCallback(() => {
    const suggestion = suggestChain(catId)
    if (suggestion) {
      setActiveChain(suggestion)
      setChainMode(true)
    }
  }, [catId])

  const fmtR = (v: number | null) => {
    if (v === null) return '—'
    let s = fmtComma(v, prec)
    if (frac) s = fmtSmart(v, prec, true)
    if (sci && v !== null && isFinite(v)) s = v.toExponential(prec)
    return s
  }

  const { addToast } = useToast()
  const { suggestion: clipSuggestion, checkClipboard, clear: clearClip } = useClipboardDetection()
  const explanations = getExplanations(catId)
  const quickValues = mode === 'fast' ? [] : [0.001, 0.01, 0.1, 1, 10, 100, 1000, 1e6]

  const copyResult = useCallback((fmt?: 'plain' | 'md' | 'latex') => {
    if (result !== null) {
      const f = fmt || copyFormat
      const val = fmtR(result)
      const text = f === 'md' ? `| ${fromVal} ${fromUnit} | ${val} ${toUnit} |` :
        f === 'latex' ? `${fromVal}\\,\\mathrm{${fromUnit}} = ${val}\\,\\mathrm{${toUnit}}` :
        `${fromVal} ${fromUnit} = ${val} ${toUnit}`
      navigator.clipboard.writeText(text).then(() => {
        setCopyBtnIcon('✅')
        setTimeout(() => setCopyBtnIcon('📋'), 1200)
        addToast('Copied!', 'success', '📋')
      }).catch(() => {
        addToast('Copy failed', 'error', '❌')
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, fromVal, fromUnit, toUnit, copyFormat])

  const shareResult = useCallback(() => {
    if (result === null) return
    const text = `${fromVal} ${fromUnit} = ${fmtR(result)} ${toUnit} — Omega X Converter`
    if (navigator.share) {
      navigator.share({ title: 'Omega X Converter', text }).catch(() => {})
    } else {
      copyResult()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, fromVal, fromUnit, toUnit, copyResult])

  const hasError = fromVal.trim() !== '' && parseSmart(fromVal) !== null && result === null && fromUnit && toUnit

  // Visual context — real-world comparisons
  const visualRef = useMemo(() => {
    if (result === null) return null
    return findVisualContext(catId, result, toUnit)
  }, [result, catId, toUnit])

  // AI: related conversion suggestions for current category
  const alsoTry = useMemo(() => {
    if (!result || fromVal === '' || !fromUnit || !toUnit) return []
    const pairs: { from: string; to: string; label: string }[] = [
      { from: 'km', to: 'mi', label: 'km → miles' },
      { from: 'm', to: 'ft', label: 'm → feet' },
      { from: 'cm', to: 'in', label: 'cm → inches' },
      { from: 'mi', to: 'km', label: 'miles → km' },
      { from: 'kg', to: 'lb', label: 'kg → pounds' },
      { from: 'g', to: 'oz', label: 'g → ounces' },
      { from: 'lb', to: 'kg', label: 'pounds → kg' },
      { from: 'l', to: 'gal', label: 'L → gallons' },
      { from: 'ml', to: 'fl_oz', label: 'mL → fl oz' },
      { from: 'c', to: 'f', label: '°C → °F' },
      { from: 'f', to: 'c', label: '°F → °C' },
      { from: 'kmh', to: 'mph', label: 'km/h → mph' },
      { from: 'sqm', to: 'sqft', label: 'm² → ft²' },
      { from: 'mb', to: 'gb', label: 'MB → GB' },
      { from: 'usd', to: 'eur', label: 'USD → EUR' },
    ]
    const catUnits = cat?.un.map(u => u.id) || []
    const relevant = pairs.filter(p =>
      p.from !== fromUnit && catUnits.includes(p.from) && catUnits.includes(p.to)
    )
    return relevant.slice(0, 3)
  }, [result, fromVal, fromUnit, toUnit, cat])

  // AI: did-you-mean unit suggestions when conversion fails
  const didYouMean = useMemo(() => {
    if (!hasError || !fromUnit && !toUnit) return []
    const all = getAllCategories()
    const suggestions: { cat: string; label: string; unit: string }[] = []
    const query = (fromUnit || toUnit).toLowerCase()
    all.forEach(c => {
      c.un.forEach(u => {
        if (u.id.toLowerCase().includes(query) || u.lb.toLowerCase().includes(query)) {
          suggestions.push({ cat: c.id, label: u.lb, unit: u.id })
        }
      })
    })
    return suggestions.filter(s => s.cat !== catId).slice(0, 3)
  }, [hasError, fromUnit, toUnit, catId])

  // Clipboard check on focus
  useEffect(() => {
    const el = inputRef.current
    if (!el || mode === 'fast') return
    const handler = () => checkClipboard()
    el.addEventListener('focus', handler)
    return () => el.removeEventListener('focus', handler)
  }, [checkClipboard, mode])

  return (
    <div className="space-y-4">
      {/* Chain mode indicator */}
      {chainMode && activeChain && (
        <div className="flex items-center gap-2 text-xs mb-2">
          <span className="px-2 py-1 rounded-lg gradient-horizontal text-white"><span aria-hidden="true">⛓</span> Chain</span>
          <span className="opacity-60">{chains.find(c => c.id === activeChain)?.label}</span>
          <button onClick={() => { setChainMode(false); setActiveChain(null); setChainResult(null) }}
            className="ml-auto px-2 py-1 rounded-lg bg-[var(--border)] text-xs">✕ Exit Chain</button>
        </div>
      )}

      {/* Responsive category selector */}
      <div className="relative">
        {/* Mobile: collapsible icon grid */}
        <div className="lg:hidden">
          <div className="grid grid-cols-3 gap-1.5">
            {cats.slice(0, showAllCats ? cats.length : 9).map(c => (
              <button key={c.id} onClick={() => { setCatId(c.id); setChainMode(false); setChainResult(null); setBatchMode(false) }}
                className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1 interact-lift ${
                  catId === c.id
                    ? 'text-white shadow-md'
                    : 'glass opacity-60 hover:opacity-100'
                }`}
                style={catId === c.id ? {
                  background: `linear-gradient(135deg, ${c.cl || '#7c6fff'}, ${c.cl || '#7c6fff'}cc)`,
                  boxShadow: `0 4px 12px ${c.cl || '#7c6fff'}40`
                } : {}}>
                <span className="text-lg" aria-hidden="true">{c.ic}</span>
                <span className="truncate w-full text-center leading-tight">{c.lb}</span>
              </button>
            ))}
          </div>
          {cats.length > 9 && (
            <button onClick={() => setShowAllCats(!showAllCats)}
              className="btn-secondary w-full mt-1.5 text-xs text-center py-1.5 font-medium">
              {showAllCats ? '▲ Show Less' : `▼ See All Categories (${cats.length})`}
            </button>
          )}
        </div>
        {/* Desktop: search + wrap-around pill grid */}
        <div className="hidden lg:flex flex-col gap-2">
          <div className="relative">
            <input type="text" value={catFilter} onChange={e => setCatFilter(e.target.value)}
              placeholder="Filter categories..."
              className="w-full px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs outline-none focus:border-[var(--primary)] transition-colors" />
            {catFilter && (
              <button onClick={() => setCatFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100" aria-label="Clear filter">✕</button>
            )}
          </div>
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Unit categories">
            {(catFilter ? cats.filter(c => c.lb.toLowerCase().includes(catFilter.toLowerCase()) || c.id.includes(catFilter.toLowerCase())) : cats).map(c => (
              <button key={c.id} onClick={() => { setCatId(c.id); setChainMode(false); setChainResult(null); setBatchMode(false) }}
                role="tab"
                aria-selected={catId === c.id}
                className={`btn-chip text-xs whitespace-nowrap transition-all duration-300 font-medium ${
                  catId === c.id
                    ? 'active text-white shadow-lg scale-105'
                    : ''
                }`}
                style={catId === c.id ? {
                  background: `linear-gradient(135deg, ${c.cl || '#7c6fff'}, ${c.cl || '#7c6fff'}cc)`,
                  boxShadow: `0 4px 16px ${c.cl || '#7c6fff'}50`
                } : {}}>
                <span aria-hidden="true">{c.ic}</span> <span>{c.lb}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chain selector (when chain mode is off) */}
      {mode !== 'fast' && !chainMode && (
        <div className="flex gap-1 overflow-x-auto py-1">
          <button onClick={() => autoSuggestChain()}
            className="btn-chip text-xs flex items-center gap-1 shrink-0">
            <span aria-hidden="true">⛓</span> Chain: {suggestChain(catId) ? chains.find(c => c.id === suggestChain(catId))?.label : 'Not available'}
          </button>
          {chains.map(chain => (
            <button key={chain.id} onClick={() => { setActiveChain(chain.id); setChainMode(true) }}
              className="btn-chip text-xs shrink-0">
              <span aria-hidden="true">{chain.icon}</span> {chain.label}
            </button>
          ))}
        </div>
      )}

      {/* Chain result */}
      {chainMode && chainResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-3 space-y-2 border-l-4" style={{ borderLeftColor: 'var(--accent)' }}>
          <div className="text-xs font-semibold uppercase tracking-wide opacity-60">Chain Result</div>
          {chainResult.map((link, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <span className="opacity-60 w-24 text-xs">{link.label}</span>
              <span className="font-mono font-bold">{fmtR(link.value)}</span>
              <span className="text-xs opacity-50">{link.unit}</span>
              {i < chainResult.length - 1 && <span className="text-xs opacity-30">→</span>}
            </div>
          ))}
          <div className="pt-2 border-t border-[var(--border)]">
            <span className="text-lg font-bold">{fmtR(chainResult[chainResult.length - 1]?.value ?? null)}</span>
            <span className="text-sm opacity-60 ml-2">{chainResult[chainResult.length - 1]?.unit}</span>
          </div>
        </motion.div>
      )}

      {/* Natural language indicator */}
      {isNatural && fromVal && (
        <div className="text-xs flex items-center gap-1 flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 text-xs"><span aria-hidden="true">🧠</span> AI</span>
          <span className="opacity-60">Detected: </span>
          <span className="font-mono opacity-70">{parseNaturalLanguage(fromVal).raw}</span>
          {parseNaturalLanguage(fromVal).intent && (
            <span className="px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] text-xs">
              Intent: {parseNaturalLanguage(fromVal).intent}
            </span>
          )}
        </div>
      )}

      {/* Breadcrumb */}
      {fromUnit && toUnit && (() => {
        const fu = cat?.un.find(u => u.id === fromUnit)
        const tu = cat?.un.find(u => u.id === toUnit)
        return (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text2)] opacity-85 mb-1" aria-label="Conversion category and units">
            <span className="font-semibold text-[var(--primary)]">{cat?.lb}</span>
            <span aria-hidden="true" className="opacity-40">➔</span>
            <span>{fu?.lb || fromUnit}</span>
            <span aria-hidden="true" className="opacity-40">to</span>
            <span className="font-semibold text-[var(--text)]">{tu?.lb || toUnit}</span>
          </div>
        )
      })()}

      {/* Converter UI */}
      <div className="space-y-3">
        <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <input ref={inputRef} type="text" value={fromVal}
                onChange={e => {
                  const v = e.target.value
                  setFromVal(v)
                  const m = v.match(/^\d+\.?\d*\s*([a-zA-Z°%]+)/)
                  if (m && m[1].length >= 1) {
                    const partial = m[1].toLowerCase()
                    const matches: { id: string; lb: string; cat: string; ic: string }[] = []
                    cats.forEach(c => {
                      c.un.forEach(u => {
                        if (u.id.toLowerCase().startsWith(partial) || u.lb.toLowerCase().startsWith(partial)) {
                          matches.push({ id: u.id, lb: u.lb, cat: c.lb, ic: c.ic || '' })
                        }
                      })
                    })
                    setUnitSuggestions(matches.slice(0, 6))
                  } else {
                    setUnitSuggestions([])
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'ArrowUp' && inputHistory.current.length > 0 && historyIndex.current < inputHistory.current.length - 1) {
                    historyIndex.current++; setFromVal(inputHistory.current[inputHistory.current.length - 1 - historyIndex.current])
                  } else if (e.key === 'ArrowDown' && historyIndex.current >= 0) {
                    historyIndex.current--
                    setFromVal(historyIndex.current >= 0 ? inputHistory.current[inputHistory.current.length - 1 - historyIndex.current] : '')
                  }
                  if (e.key === 'Escape') setUnitSuggestions([])
                }}
                placeholder={mode === 'student' ? 'Type: "5 km in miles" or "(5km + 200m)"' : '0'}
                className="w-full p-3 pr-8 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] text-[var(--text)] text-2xl sm:text-3xl font-bold outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_4px_var(--glow),0_0_30px_var(--glow)] transition-all placeholder:text-base"
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}
                onDrop={e => { e.preventDefault(); const v = e.dataTransfer.getData('text/plain'); if (v) setFromVal(v) }}
              />
            {mode === 'student' && !fromVal && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-40">try "5 km in miles"</span>
            )}
            {/* Clipboard detection badge */}
            {clipSuggestion && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-6 left-0 flex items-center gap-1 z-10">
                <button onClick={() => {
                  setFromVal(clipSuggestion.text); clearClip()
                  if (clipSuggestion.unit && cat?.un.some(u => u.id === clipSuggestion.unit)) setFromUnit(clipSuggestion.unit)
                  if (clipSuggestion.targetUnit && cat?.un.some(u => u.id === clipSuggestion.targetUnit)) setToUnit(clipSuggestion.targetUnit)
                }}
                  className="btn-chip text-xs py-0.5 px-2">
                  📋 {clipSuggestion.label}
                </button>
                <button onClick={clearClip}
                  className="btn-icon w-5 h-5 text-xs opacity-50 hover:opacity-100" aria-label="Dismiss suggestion">✕</button>
              </motion.div>
            )}

            {/* AI Unit Autocomplete */}
            {unitSuggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-1 z-20 glass rounded-xl overflow-hidden shadow-xl border border-[var(--border)]">
                <div className="p-1 space-y-0.5">
                  {unitSuggestions.map((s, i) => (
                    <button key={i} onClick={() => { setFromUnit(s.id); setUnitSuggestions([]); inputRef.current?.focus() }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-[var(--primary)]/10 transition-all text-left">
                      <span className="text-sm" aria-hidden="true">{s.ic}</span>
                      <span className="font-medium">{s.lb}</span>
                      <span className="text-xs opacity-40 ml-auto">{s.cat}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
          <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}
            aria-label="Source unit"
            className="p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] text-[var(--text)] text-sm outline-none focus:border-[var(--primary)] transition-colors min-w-[80px]">
            {cat?.un.map(u => <option key={u.id} value={u.id}>{u.lb}</option>)}
          </select>
        </div>

        <AIPredictions
          categoryId={catId}
          fromVal={fromVal}
          fromUnit={fromUnit}
          toUnit={toUnit}
          onApply={(from, to) => { setFromUnit(from); setToUnit(to) }}
        />

        {/* Recent conversions awareness */}
        {!fromVal && (() => {
          const recent = analytics.getRecentConversions(5).filter(e => e.category === catId)
          if (recent.length === 0) return null
          return (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-[var(--text2)] opacity-70 uppercase tracking-wider mr-0.5">Recent</span>
              {recent.map((e, i) => (
                <button key={i} onClick={() => { setFromUnit(e.fromUnit || ''); setToUnit(e.toUnit || '') }}
                  className="btn-chip text-xs">
                  {e.fromUnit} → {e.toUnit}
                </button>
              ))}
            </motion.div>
          )
        })()}

        <div className="flex items-center justify-between">
          <ConversionStreaks compact />
          <div className="flex gap-2 items-center">
          <motion.button whileTap={{ scale: 0.9 }} onClick={swap}
            animate={{ rotate: swapRotation }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            aria-label="Swap source and target units"
            className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-base shadow-md shadow-[var(--glow)] interact-lift">⇅</motion.button>
          {mode !== 'fast' && (
            <>
              <button onClick={() => setFrac(!frac)}
                aria-label="Toggle fraction display"
                aria-pressed={frac}
                className={`btn-chip text-xs rounded-full ${frac ? 'active' : ''}`}>frac</button>
              <button onClick={() => setSci(!sci)}
                aria-label="Toggle scientific notation"
                aria-pressed={sci}
                className={`btn-chip text-xs rounded-full ${sci ? 'active' : ''}`}>sci</button>
              <button onClick={() => setShowExplanation(!showExplanation)}
                aria-label={showExplanation ? 'Hide calculation steps' : 'Show calculation steps'}
                aria-expanded={showExplanation}
                className={`btn-chip text-xs rounded-full ${showExplanation ? 'active' : ''}`}>
                <span aria-hidden="true">{mode === 'scientist' ? '🔬' : '📖'}</span>
              </button>
              <button onClick={() => setBatchMode(!batchMode)}
                aria-label="Toggle batch conversion mode"
                aria-pressed={batchMode}
                className={`btn-chip text-xs rounded-full ${batchMode ? 'active' : ''}`}>
                <span aria-hidden="true">📋</span> Batch
              </button>
              <button onClick={() => setShowAIExplain(!showAIExplain)}
                className={`btn-chip text-xs rounded-full ${showAIExplain ? 'active' : ''}`}
                aria-label="AI explain conversion">
                <span aria-hidden="true">🤖</span> AI
              </button>
            </>
          )}
        </div>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex-1 relative group">
            <div ref={resultRef}
              className={`w-full p-4 rounded-xl border-2 bg-[var(--card2)] text-[var(--text)] text-2xl font-bold min-h-[56px] flex items-center cursor-pointer transition-all duration-300 border-l-4 ${
                result !== null
                  ? 'border-[var(--primary)]/40 shadow-[0_0_30px_var(--glow)]'
                  : hasError
                    ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                    : 'border-[var(--border)]'
              } ${pulseKey > 0 ? 'result-pulse' : ''}`}
              style={{ borderLeftColor: cat?.cl || 'var(--primary)' }}
              onClick={copyResult}
              draggable={result !== null}
              onDragStart={e => {
                if (result !== null) {
                  e.dataTransfer.setData('text/plain', String(result))
                  e.dataTransfer.effectAllowed = 'copy'
                }
              }}
              onContextMenu={e => {
                e.preventDefault()
                setContextMenu({ x: e.clientX, y: e.clientY })
              }}>
              <motion.span key={result} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="number-roll inline-block">
                {fmtR(result)}
              </motion.span>
            </div>

            {/* Error state + Did you mean? */}
            {hasError && (
              <div>
                <div className="text-xs text-red-500/80 mt-1 flex items-center gap-1">
                  <span aria-hidden="true">⚠️</span>
                  <span>Can't convert — incompatible units or missing conversion factor</span>
                </div>
                {didYouMean.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                    <span className="text-xs text-[var(--text2)] opacity-70 uppercase tracking-wider">Did you mean</span>
                    {didYouMean.map((d, i) => (
                      <button key={i} onClick={() => {
                        const c = getAllCategories().find(c => c.id === d.cat)
                        if (c) { setCatId(d.cat); setFromUnit(d.unit); setToUnit(c.un[Math.min(1, c.un.length - 1)]?.id || d.unit) }
                      }}
                        className="btn-chip text-xs">
                        {d.label} ({d.cat})
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
              {result !== null && (
                <>
                  <button onClick={shareResult}
                    className="share-btn btn-icon w-8 h-8 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-xs"
                    aria-label="Share result">
                    📤
                  </button>
                  <button onClick={copyResult}
                    className="btn-icon w-8 h-8 rounded-xl bg-[var(--primary)] text-white text-xs shadow-sm"
                    aria-label="Copy result">
                    {copyBtnIcon}
                  </button>
                </>
              )}
            </div>

            {/* Context menu */}
            <AnimatePresence>
              {contextMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="fixed z-[300] glass rounded-xl p-1 shadow-xl border border-[var(--border)] min-w-[140px] overflow-hidden"
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                  onClick={() => setContextMenu(null)}
                >
                  {(['plain', 'md', 'latex'] as const).map(f => (
                    <button key={f} onClick={() => { setCopyFormat(f); copyResult(f); setContextMenu(null) }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[var(--border)] transition-colors flex items-center gap-2 ${copyFormat === f ? 'text-[var(--primary)]' : ''}`}>
                      📋 {f === 'plain' ? 'Plain' : f === 'md' ? 'Markdown' : 'LaTeX'}
                    </button>
                  ))}
                  <button onClick={() => { swap(); setContextMenu(null) }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[var(--border)] transition-colors flex items-center gap-2">
                    ⇅ Swap Units
                  </button>
                  <button onClick={() => { setFrac(!frac); setContextMenu(null) }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[var(--border)] transition-colors flex items-center gap-2">
                    {frac ? '🔢 Decimal' : '🔢 Fraction'}
                  </button>
                  <button onClick={() => { setSci(!sci); setContextMenu(null) }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[var(--border)] transition-colors flex items-center gap-2">
                    {sci ? '🔢 Normal' : '🔢 Scientific'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <select value={toUnit} onChange={e => setToUnit(e.target.value)}
            aria-label="Target unit"
            className="p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] text-[var(--text)] text-sm outline-none focus:border-[var(--primary)] transition-colors min-w-[80px]">
            {cat?.un.map(u => <option key={u.id} value={u.id}>{u.lb}</option>)}
          </select>
        </div>
      </div>

      {formula && <div className="text-xs text-center text-[var(--text2)] opacity-85 italic">{formula}</div>}

      {/* AI Learning Tip — Did you know? */}
      {learningTip && !showAIExplain && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 px-3 py-2 rounded-xl glass border border-[var(--border)] text-xs">
          <span className="text-sm mt-0.5 shrink-0" aria-hidden="true">💡</span>
          <div>
            <span className="font-semibold text-xs text-[var(--text)]">{learningTip.title}</span>
            <p className="text-[var(--text2)] opacity-85 mt-0.5">{learningTip.text}</p>
          </div>
          <button onClick={() => setLearningTip(null)}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-xs opacity-75 hover:opacity-100 hover:bg-[var(--border)] shrink-0 ml-auto" aria-label="Dismiss tip">✕</button>
        </motion.div>
      )}

      {/* AI Explain section */}
      {showAIExplain && result !== null && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-3 space-y-2 border-l-4" style={{ borderLeftColor: 'var(--primary)' }}>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
            <span aria-hidden="true">🤖</span> AI Explanation
          </div>
          <div className="text-xs space-y-1.5">
            <p><span className="text-[var(--text2)] opacity-85">Conversion:</span> {fromVal} {fromUnit} = <strong>{fmtR(result)}</strong> {toUnit}</p>
            {explanation && <p className="text-[var(--text)] opacity-90 leading-relaxed">{explanation}</p>}
            {steps.length > 0 && (
              <div className="pt-1 space-y-1">
                <div className="text-xs text-[var(--text2)] opacity-85 uppercase tracking-wide">Steps</div>
                {steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="text-[var(--text2)] opacity-85 w-24 shrink-0 font-medium">{s.label}</span>
                    <span className="text-[var(--text)] opacity-90">{s.detail}</span>
                  </div>
                ))}
              </div>
            )}
            {visualRef && (
              <p className="pt-1 text-xs text-[var(--text)] opacity-90">
                <span className="text-[var(--text2)] opacity-85">Real-world:</span> {visualRef.emoji} {fmtR(result)} {toUnit} ≈ <strong>{visualRef.label}</strong>
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* AI: "Also try" related conversions */}
      {alsoTry.length > 0 && !showAIExplain && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs opacity-50 uppercase tracking-wider mr-0.5">Also try</span>
          {alsoTry.map((p, i) => (
            <button key={i} onClick={() => { setFromUnit(p.from); setToUnit(p.to) }}
              className="btn-chip text-xs">
              {p.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* AI Quick Actions */}
      <AIQuickActions
        categoryId={catId}
        fromUnit={fromUnit}
        toUnit={toUnit}
        result={result}
        onRepeatBatch={() => setBatchMode(true)}
        onOpenQuiz={() => setShowQuiz(p => !p)}
      />

      {/* Conversion Quiz toggle */}
      {showQuiz && (
        <ConversionQuiz />
      )}

      {/* Smart favorites suggestion */}
      {showFavSuggestion && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2">
          <button onClick={async () => {
            await toggleFavorite({ cat: catId, from: fromUnit, to: toUnit })
            setShowFavSuggestion(false)
            addToast('Added to favorites!', 'success', '⭐')
          }}
            className="btn-secondary text-xs gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400">
            ⭐ Save to favorites
          </button>
          <button onClick={() => setShowFavSuggestion(false)}
            className="btn-icon w-6 h-6 text-xs" aria-label="Dismiss favorites suggestion">✕</button>
        </motion.div>
      )}

      {/* AI mode suggestion */}
      {modeSuggestion && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2">
          <button onClick={() => {
            window.dispatchEvent(new CustomEvent('uc-mode-suggest', { detail: modeSuggestion.mode }))
            setModeSuggestion(null)
            addToast(`Switched to ${modeSuggestion.label}!`, 'success', modeSuggestion.icon)
          }}
            className="btn-secondary text-xs gap-1 border-[var(--primary)]/30 text-[var(--primary)]">
            {modeSuggestion.icon} Try {modeSuggestion.label}
          </button>
          <button onClick={() => setModeSuggestion(null)}
            className="btn-icon w-6 h-6 text-xs" aria-label="Dismiss mode suggestion">✕</button>
        </motion.div>
      )}

      {/* Visual context — real-world comparison */}
      {visualRef && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
          <span className="text-sm" aria-hidden="true">{visualRef.emoji}</span>
          <span className="text-[var(--text)] opacity-90">{fmtR(result)} {toUnit} ≈ <strong>{visualRef.label}</strong></span>
        </motion.div>
      )}

      {/* Unit comparison panel */}
      {result !== null && allResults.length > 0 && (
        <div>
          <button onClick={() => setShowAllUnits(!showAllUnits)}
            aria-expanded={showAllUnits}
            className="text-xs text-[var(--text2)] opacity-85 hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
            <span>{showAllUnits ? '▾' : '▸'}</span> Show in all {allResults.length} units
          </button>
          <AnimatePresence>
            {showAllUnits && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="glass rounded-xl p-2 mt-1 grid grid-cols-2 gap-1 text-xs">
                  {allResults.map(ar => (
                    <div key={ar.id} className="flex justify-between p-1.5 rounded-lg hover:bg-[var(--border)] cursor-pointer transition-colors"
                      onClick={() => setToUnit(ar.id)}>
                      <span className="text-[var(--text2)] opacity-85">{ar.label}</span>
                      <span className="font-mono font-medium">{ar.value !== null ? fmtR(ar.value) : '—'}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Step-by-step explanation */}
      {showExplanation && (explanation || steps.length > 0) && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden">
          <div className="glass-holographic rounded-xl p-3 space-y-2">
            <div className="text-xs font-semibold mb-1 text-[var(--text)]">📖 Step-by-Step</div>
            {steps.length > 0 && (
              <div className="space-y-1">
                {steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1">
                    <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="font-medium w-24 text-[var(--text2)] opacity-85">{s.label}</span>
                    <span className="text-xs text-[var(--text)] opacity-90">{s.detail}</span>
                  </div>
                ))}
              </div>
            )}
            {explanation && <div className="text-xs text-[var(--text)] opacity-90 mt-2 p-2 rounded-lg bg-[var(--card2)] border border-[var(--border)]">{explanation}</div>}
            {explanations.length > 0 && (
              <div className="mt-2 pt-2 border-t border-[var(--border)]">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text2)] opacity-85">Learn more</div>
                {explanations.slice(0, 2).map((ex, i) => (
                  <div key={i} className="mt-1 text-xs">
                    <div className="font-medium text-[var(--text)]">{ex.title}</div>
                    {ex.formula && <div className="font-mono mt-0.5 text-[var(--text2)] opacity-85 text-xs">{ex.formula}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* In-article fluid ad */}
      <div className="flex justify-center my-2">
        <AdSense slot="2750064252" format="fluid" layout="in-article" />
      </div>

      {/* Batch mode */}
      {batchMode && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden">
          <div className="glass rounded-xl p-3 space-y-2">
            <div className="text-xs font-semibold"><span aria-hidden="true">📋</span> Batch Convert</div>
            <textarea value={batchInput} onChange={e => setBatchInput(e.target.value)}
              placeholder="Enter values (comma, newline, or semicolon separated)&#10;e.g.: 1, 2, 5, 10, 100&#10;or: 1&#10;2&#10;3"
              aria-label="Values to batch convert"
              className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--card2)] text-sm outline-none min-h-[60px] resize-none" />
            <div className="flex gap-2">
              <button onClick={handleBatchConvert}
                className="btn-primary text-xs">Convert All</button>
              <button onClick={() => setBatchInput(generateSequence(1, 100, 10).join('\n'))}
                className="btn-secondary text-xs">1-100</button>
              <button onClick={() => setBatchInput(generateSequence(0, 1000, 100).join('\n'))}
                className="btn-secondary text-xs">0-1000</button>
            </div>
            {batchResults.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-0.5" tabIndex={0} role="region" aria-label="Batch conversion results">
                {batchResults.map((r, i) => (
                  <div key={i} className="flex justify-between text-xs p-1 rounded hover:bg-[var(--border)]">
                    <span>{r.input} {fromUnit}</span>
                    <span className="opacity-50">=</span>
                    <span className="font-medium">{fmtR(r.result)} {toUnit}</span>
                  </div>
                ))}
                <div className="pt-1 border-t border-[var(--border)] text-xs opacity-60">
                  {batchResults.filter(r => r.result !== null).length} results
                </div>
                <div className="flex gap-1 pt-1">
                  <button onClick={() => {
                    const csv = 'input,result\n' + batchResults.map(r => `${r.input},${r.result ?? ''}`).join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a'); a.href = url; a.download = 'conversion-results.csv'
                    a.click(); URL.revokeObjectURL(url); addToast('CSV downloaded', 'success', '📥')
                  }} className="btn-secondary text-xs">📥 CSV</button>
                  <button onClick={() => {
                    const json = JSON.stringify(batchResults, null, 2)
                    const blob = new Blob([json], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a'); a.href = url; a.download = 'conversion-results.json'
                    a.click(); URL.revokeObjectURL(url); addToast('JSON downloaded', 'success', '📥')
                  }} className="btn-secondary text-xs">📥 JSON</button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Quick values */}
      {quickValues.length > 0 && !chainMode && !batchMode && (
        <div className="flex gap-1.5 flex-wrap">
          {quickValues.map(v => (
            <button key={v} onClick={() => setFromVal(String(v))}
              className="btn-chip text-xs">
              {v < 1 ? String(v) : v >= 1e6 ? '1,000,000' : v >= 1e3 ? '1,000' : String(v)}
            </button>
          ))}
        </div>
      )}

      {/* Below multipliers ad */}
      <div className="flex justify-center">
        <AdSense slot="6553577897" width={320} height={100} />
      </div>

      {/* Precision */}
      {mode !== 'fast' && !chainMode && (
        <div className="flex items-center gap-3">
          <label htmlFor="precision-slider" className="text-xs text-[var(--text2)] opacity-80">Precision: {prec}</label>
          <input
            id="precision-slider"
            type="range"
            min="0"
            max="12"
            value={prec}
            onChange={e => setPrec(Number(e.target.value))}
            aria-label="Calculation precision in decimal places"
            aria-valuemin={0}
            aria-valuemax={12}
            aria-valuenow={prec}
            className="flex-1 accent-[var(--primary)]"
          />
        </div>
      )}

      {/* All conversions */}
      {allResults.length > 0 && mode !== 'fast' && !chainMode && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-[var(--text2)] opacity-85">All Conversions</div>
          <div className="space-y-0.5 max-h-48 overflow-y-auto" tabIndex={0} role="region" aria-label="All unit conversions">
            {allResults.map(r => {
              const maxVal = Math.max(...allResults.map(x => Math.abs(x.value || 0)), 1)
              const pct = Math.abs(r.value || 0) / maxVal * 100
              return (
                <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--border)] cursor-pointer text-xs interact-lift"
                  onClick={() => setToUnit(r.id)}>
                  <span className="flex-1 text-right font-medium text-[var(--text)]">{fmtR(r.value)}</span>
                  <span className="w-24 text-[var(--text2)] opacity-85">{r.label}</span>
                  <div className="w-12 h-1.5 rounded-full overflow-hidden bg-[var(--border)]">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(pct, 1)}%`, background: cat?.cl || '#6c63ff' }} />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Matched content / autorelaxed */}
      <div className="pt-4">
        <AdSense slot="9262290267" format="autorelaxed" />
      </div>
    </div>
  )
}
