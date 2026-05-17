import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCategory, getAllCategories, convert, convertAll, getFormula } from '../../engine/converter'
import { fmtSmart, fmtComma, parseSmart } from '../../utils/numbers'
import { parseNaturalLanguage, parseMixedExpression, extractUnit, extractNumber, generateSteps } from '../../engine/smartParser'
import { analytics } from '../../engine/analytics'
import { getExplanations, getFormulaExplanation, getDetailedSteps } from '../../engine/learning'
import { getAllChains, executeChain, suggestChain } from '../../engine/conversionChains'
import { executeBatch, parseCSV, generateSequence, batchStats } from '../../engine/batchEngine'
import type { AppMode } from '../widgets/ModeSwitcher'
import { useToast } from '../../hooks/useToast'
import { useClipboardDetection } from '../../hooks/useClipboard'
import AdSense from '../widgets/AdSense'
import { findVisualContext } from '../../engine/visualContext'

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
  const [showAllCats, setShowAllCats] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

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
      if (!fromUnit || !cat.un.find(u => u.id === fromUnit)) {
        const first = saved.from && cat.un.find(u => u.id === saved.from) ? saved.from : (initialFrom && cat.un.find(u => u.id === initialFrom) ? initialFrom : cat.un[0]?.id)
        setFromUnit(first || '')
      }
      if (!toUnit || !cat.un.find(u => u.id === toUnit)) {
        const second = saved.to && cat.un.find(u => u.id === saved.to) ? saved.to : (initialTo && cat.un.find(u => u.id === initialTo) ? initialTo : cat.un[Math.min(1, cat.un.length - 1)]?.id)
        setToUnit(second || '')
      }
    }
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
        if (res) setChainResult(res.links)
      }
      return
    }

    if (cat && fromUnit && toUnit) {
      let rawVal: number | null = null

      const parsed = parseNaturalLanguage(fromVal)
      if (parsed.type === 'convert' && parsed.value !== undefined && parsed.fromUnit && parsed.toUnit) {
        setIsNatural(true)
        if (parsed.fromUnit !== fromUnit) setFromUnit(parsed.fromUnit)
        if (parsed.toUnit !== toUnit) setToUnit(parsed.toUnit)
        rawVal = parsed.value
      } else {
        setIsNatural(false)

        const mixed = parseMixedExpression(fromVal)
        if (mixed) {
          const baseUnit = mixed.units[0]
          let total = 0
          for (let i = 0; i < mixed.values.length; i++) {
            const v = convert(mixed.values[i], catId, mixed.units[i], baseUnit)
            if (v !== null) total += (mixed.ops[i - 1] === '-' ? -v : v)
          }
          rawVal = total
          if (baseUnit !== fromUnit) setFromUnit(baseUnit)
        } else {
          rawVal = parseSmart(fromVal)
        }
      }

      if (rawVal !== null) {
        const r = convert(rawVal, catId, fromUnit, toUnit)
        setResult(r)
        setPulseKey(k => k + 1)
        setAllResults(convertAll(rawVal, catId, fromUnit))
        const f = getFormula(catId, fromUnit, toUnit)
        setFormula(f)

        const fu = cat.un.find(u => u.id === fromUnit)
        const tu = cat.un.find(u => u.id === toUnit)
        if (fu && tu && fu.r && tu.r) {
          const factor = fu.r / tu.r
          setExplanation(getFormulaExplanation(fu.lb, tu.lb, factor))
          setSteps(getDetailedSteps(fu.lb, tu.lb, rawVal, r || 0, factor))
          analytics.track({ type: 'convert', category: catId, fromUnit, toUnit })
        }
      } else {
        setResult(null); setAllResults([]); setFormula(''); setExplanation(null); setSteps([])
      }
    }
  }, [fromVal, fromUnit, toUnit, catId, chainMode, activeChain])

  const handleConvert = useCallback(() => {
    const v = parseSmart(fromVal)
    if (v !== null && result !== null) {
      onHistoryAdd?.(catId, v, fromUnit, result, toUnit)
    }
  }, [fromVal, result, fromUnit, toUnit, catId, onHistoryAdd])

  useEffect(() => {
    const timer = setTimeout(handleConvert, 1000)
    return () => clearTimeout(timer)
  }, [result])

  // Auto-scroll to result
  useEffect(() => {
    if (result !== null && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [result])

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

  const copyResult = useCallback(() => {
    if (result !== null) {
      const text = `${fromVal} ${fromUnit} = ${fmtR(result)} ${toUnit}`
      navigator.clipboard.writeText(text).then(() => {
        setCopyBtnIcon('✅')
        setTimeout(() => setCopyBtnIcon('📋'), 1200)
        addToast('Copied!', 'success', '📋')
      }).catch(() => {
        addToast('Copy failed', 'error', '❌')
      })
    }
  }, [result, fromVal, fromUnit, toUnit])

  const shareResult = useCallback(() => {
    if (result === null) return
    const text = `${fromVal} ${fromUnit} = ${fmtR(result)} ${toUnit} — Omega X Converter`
    if (navigator.share) {
      navigator.share({ title: 'Omega X Converter', text }).catch(() => {})
    } else {
      copyResult()
    }
  }, [result, fromVal, fromUnit, toUnit, copyResult])

  const hasError = fromVal.trim() !== '' && parseSmart(fromVal) !== null && result === null && fromUnit && toUnit

  // Visual context — real-world comparisons
  const visualRef = useMemo(() => {
    if (result === null) return null
    // Convert result to base unit for matching
    return findVisualContext(catId, result, toUnit)
  }, [result, catId, toUnit])

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
          <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white">⛓ Chain</span>
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
                  background: `linear-gradient(135deg, ${c.cl || '#6c63ff'}, ${c.cl || '#6c63ff'}cc)`,
                  boxShadow: `0 4px 12px ${c.cl || '#6c63ff'}40`
                } : {}}>
                <span className="text-lg">{c.ic}</span>
                <span className="truncate w-full text-center leading-tight">{c.lb}</span>
              </button>
            ))}
          </div>
          {cats.length > 9 && (
            <button onClick={() => setShowAllCats(!showAllCats)}
              className="w-full mt-1.5 px-3 py-1.5 rounded-xl glass text-xs text-center hover:bg-[var(--border)] transition-all interact-lift font-medium">
              {showAllCats ? '▲ Show Less' : `▼ See All Categories (${cats.length})`}
            </button>
          )}
        </div>
        {/* Desktop: wrap-around pill grid */}
        <div className="hidden lg:flex flex-wrap gap-1">
          {cats.map(c => (
            <button key={c.id} onClick={() => { setCatId(c.id); setChainMode(false); setChainResult(null); setBatchMode(false) }}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-300 font-medium interact-lift ${
                catId === c.id
                  ? 'text-white shadow-lg scale-105'
                  : 'glass opacity-60 hover:opacity-100'
              }`}
              style={catId === c.id ? {
                background: `linear-gradient(135deg, ${c.cl || '#6c63ff'}, ${c.cl || '#6c63ff'}cc)`,
                boxShadow: `0 4px 16px ${c.cl || '#6c63ff'}50`
              } : {}}>
              {c.ic} {c.lb}
            </button>
          ))}
        </div>
      </div>

      {/* Chain selector (when chain mode is off) */}
      {mode !== 'fast' && !chainMode && (
        <div className="flex gap-1 overflow-x-auto">
          <button onClick={() => autoSuggestChain()}
            className="px-2.5 py-1 rounded-lg text-[10px] border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white transition-all flex items-center gap-1">
            ⛓ Chain: {suggestChain(catId) ? chains.find(c => c.id === suggestChain(catId))?.label : 'Not available'}
          </button>
          {chains.map(chain => (
            <button key={chain.id} onClick={() => { setActiveChain(chain.id); setChainMode(true) }}
              className="px-2.5 py-1 rounded-lg text-[10px] border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white transition-all">
              {chain.icon} {chain.label}
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
              <span className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
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
        <div className="text-[10px] flex items-center gap-1 flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 text-[9px]">🧠 AI</span>
          <span className="opacity-60">Detected: </span>
          <span className="font-mono opacity-70">{parseNaturalLanguage(fromVal).raw}</span>
          {parseNaturalLanguage(fromVal).intent && (
            <span className="px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] text-[9px]">
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
          <div className="flex items-center gap-1.5 text-[10px] opacity-50 mb-1">
            <span className="font-medium text-[var(--primary)]">{cat?.lb}</span>
            <span className="opacity-30">➔</span>
            <span>{fu?.lb || fromUnit}</span>
            <span className="opacity-30">to</span>
            <span className="font-medium">{tu?.lb || toUnit}</span>
          </div>
        )
      })()}

      {/* Converter UI */}
      <div className="space-y-3">
        <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <input ref={inputRef} type="text" value={fromVal}
                onChange={e => setFromVal(e.target.value)}
                placeholder={mode === 'student' ? 'Type: "5 km in miles" or "(5km + 200m)"' : '0'}
                className="w-full p-3 pr-8 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] text-[var(--text)] text-2xl sm:text-3xl font-bold outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_4px_var(--glow),0_0_30px_var(--glow)] transition-all placeholder:text-base"
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}
                onDrop={e => { e.preventDefault(); const v = e.dataTransfer.getData('text/plain'); if (v) setFromVal(v) }}
              />
            {mode === 'student' && !fromVal && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] opacity-30">try "5 km in miles"</span>
            )}
            {/* Clipboard detection badge */}
            {clipSuggestion && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-6 left-0 flex items-center gap-1 z-10">
                <button onClick={() => { setFromVal(clipSuggestion.text); clearClip() }}
                  className="px-2 py-0.5 rounded-lg text-[9px] bg-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all flex items-center gap-1 whitespace-nowrap">
                  📋 {clipSuggestion.label}
                </button>
                <button onClick={clearClip}
                  className="p-0.5 rounded text-[8px] opacity-30 hover:opacity-100">✕</button>
              </motion.div>
            )}
          </div>
          <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}
            className="p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] text-[var(--text)] text-sm outline-none focus:border-[var(--primary)] transition-colors min-w-[80px]">
            {cat?.un.map(u => <option key={u.id} value={u.id}>{u.lb}</option>)}
          </select>
        </div>

        <div className="flex justify-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={swap}
            animate={{ rotate: swapRotation }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-lg shadow-lg shadow-[var(--primary)]/30 interact-lift">⇅</motion.button>
          {mode !== 'fast' && (
            <>
              <button onClick={() => setFrac(!frac)}
                className={`px-3 py-1 rounded-full text-xs transition-all interact-lift ${frac ? 'bg-[var(--primary)] text-white' : 'glass'}`}>frac</button>
              <button onClick={() => setSci(!sci)}
                className={`px-3 py-1 rounded-full text-xs transition-all interact-lift ${sci ? 'bg-[var(--primary)] text-white' : 'glass'}`}>sci</button>
              <button onClick={() => setShowExplanation(!showExplanation)}
                className={`px-3 py-1 rounded-full text-xs transition-all interact-lift ${showExplanation ? 'bg-[var(--accent)] text-white' : 'glass'}`}>
                {mode === 'scientist' ? '🔬' : '📖'}
              </button>
              <button onClick={() => setBatchMode(!batchMode)}
                className={`px-3 py-1 rounded-full text-xs transition-all interact-lift ${batchMode ? 'bg-[var(--primary)] text-white' : 'glass'}`}>
                📋 Batch
              </button>
            </>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex-1 relative group">
            <div ref={resultRef}
              className={`w-full p-4 rounded-xl border-2 bg-[var(--card2)] text-[var(--text)] text-2xl font-bold min-h-[56px] flex items-center cursor-pointer transition-all duration-300 ${
                result !== null
                  ? 'border-[var(--primary)]/40 shadow-[0_0_30px_var(--glow)]'
                  : hasError
                    ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                    : 'border-[var(--border)]'
              } ${pulseKey > 0 ? 'result-pulse' : ''}`}
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

            {/* Error state */}
            {hasError && (
              <div className="error-state text-[10px] text-red-500/60 mt-1 flex items-center gap-1">
                <span>⚠️</span>
                <span>Can't convert — incompatible units or missing conversion factor</span>
              </div>
            )}

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
              {result !== null && (
                <>
                  <button onClick={shareResult}
                    className="share-btn w-7 h-7 rounded-lg bg-[var(--card2)] border border-[var(--border)] flex items-center justify-center text-[10px] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all"
                    data-tooltip="Share">
                    📤
                  </button>
                  <button onClick={copyResult}
                    className="w-7 h-7 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center text-[10px] hover:shadow-lg hover:shadow-[var(--primary)]/30 transition-all"
                    data-tooltip="Copy">
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
                  <button onClick={() => { copyResult(); setContextMenu(null) }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[var(--border)] transition-colors flex items-center gap-2">
                    📋 Copy Result
                  </button>
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
            className="p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] text-[var(--text)] text-sm outline-none focus:border-[var(--primary)] transition-colors min-w-[80px]">
            {cat?.un.map(u => <option key={u.id} value={u.id}>{u.lb}</option>)}
          </select>
        </div>
      </div>

      {formula && <div className="text-xs text-center opacity-60 italic">{formula}</div>}

      {/* AdSense */}
      <AdSense slot="4648257834" format="auto" />

      {/* Visual context — real-world comparison */}
      {visualRef && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
          <span className="text-sm">{visualRef.emoji}</span>
          <span className="opacity-70">{fmtR(result)} {toUnit} ≈ <strong>{visualRef.label}</strong></span>
        </motion.div>
      )}

      {/* Step-by-step explanation */}
      {showExplanation && (explanation || steps.length > 0) && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden">
          <div className="glass-holographic rounded-xl p-3 space-y-2">
            <div className="text-xs font-semibold mb-1">📖 Step-by-Step</div>
            {steps.length > 0 && (
              <div className="space-y-1">
                {steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1">
                    <span className="w-5 h-5 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[9px] font-bold">{i + 1}</span>
                    <span className="font-medium w-20 opacity-70">{s.label}</span>
                    <span className="text-[11px] opacity-60">{s.detail}</span>
                  </div>
                ))}
              </div>
            )}
            {explanation && <div className="text-xs opacity-70 mt-2 p-2 rounded-lg bg-[var(--bg)]">{explanation}</div>}
            {explanations.length > 0 && (
              <div className="mt-2 pt-2 border-t border-[var(--border)]">
                <div className="text-[10px] font-semibold uppercase tracking-wide opacity-50">Learn more</div>
                {explanations.slice(0, 2).map((ex, i) => (
                  <div key={i} className="mt-1 text-xs">
                    <div className="font-medium">{ex.title}</div>
                    {ex.formula && <div className="font-mono mt-0.5 opacity-50 text-[11px]">{ex.formula}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Batch mode */}
      {batchMode && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden">
          <div className="glass rounded-xl p-3 space-y-2">
            <div className="text-xs font-semibold">📋 Batch Convert</div>
            <textarea value={batchInput} onChange={e => setBatchInput(e.target.value)}
              placeholder="Enter values (comma, newline, or semicolon separated)&#10;e.g.: 1, 2, 5, 10, 100&#10;or: 1&#10;2&#10;3"
              className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--card2)] text-sm outline-none min-h-[60px] resize-none" />
            <div className="flex gap-2">
              <button onClick={handleBatchConvert}
                className="px-3 py-1.5 rounded-lg text-xs bg-[var(--primary)] text-white interact-lift">Convert All</button>
              <button onClick={() => setBatchInput(generateSequence(1, 100, 10).join('\n'))}
                className="px-3 py-1.5 rounded-lg text-xs bg-[var(--border)] interact-lift">1-100</button>
              <button onClick={() => setBatchInput(generateSequence(0, 1000, 100).join('\n'))}
                className="px-3 py-1.5 rounded-lg text-xs bg-[var(--border)] interact-lift">0-1000</button>
            </div>
            {batchResults.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-0.5">
                {batchResults.map((r, i) => (
                  <div key={i} className="flex justify-between text-xs p-1 rounded hover:bg-[var(--border)]">
                    <span>{r.input} {fromUnit}</span>
                    <span className="opacity-50">=</span>
                    <span className="font-medium">{fmtR(r.result)} {toUnit}</span>
                  </div>
                ))}
                <div className="pt-1 border-t border-[var(--border)] text-[10px] opacity-50">
                  {batchResults.filter(r => r.result !== null).length} results
                </div>
                <div className="flex gap-1 pt-1">
                  <button onClick={() => {
                    const csv = 'input,result\n' + batchResults.map(r => `${r.input},${r.result ?? ''}`).join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a'); a.href = url; a.download = 'conversion-results.csv'
                    a.click(); URL.revokeObjectURL(url); addToast('CSV downloaded', 'success', '📥')
                  }} className="px-2 py-1 rounded-lg text-[9px] border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white transition-all">📥 CSV</button>
                  <button onClick={() => {
                    const json = JSON.stringify(batchResults, null, 2)
                    const blob = new Blob([json], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a'); a.href = url; a.download = 'conversion-results.json'
                    a.click(); URL.revokeObjectURL(url); addToast('JSON downloaded', 'success', '📥')
                  }} className="px-2 py-1 rounded-lg text-[9px] border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white transition-all">📥 JSON</button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Quick values */}
      {quickValues.length > 0 && !chainMode && !batchMode && (
        <div className="flex gap-1 flex-wrap">
          {quickValues.map(v => (
            <button key={v} onClick={() => setFromVal(String(v))}
              className="px-2 py-1 rounded-lg text-xs border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white transition-all interact-lift">
              {v < 1 ? String(v) : v >= 1e6 ? '1M' : v >= 1e3 ? '1K' : String(v)}
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
          <span className="text-xs opacity-60">Precision: {prec}</span>
          <input type="range" min="0" max="12" value={prec} onChange={e => setPrec(Number(e.target.value))}
            className="flex-1 accent-[var(--primary)]" />
        </div>
      )}

      {/* All conversions */}
      {allResults.length > 0 && mode !== 'fast' && !chainMode && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-60">All Conversions</div>
          <div className="space-y-0.5 max-h-48 overflow-y-auto">
            {allResults.map(r => {
              const maxVal = Math.max(...allResults.map(x => Math.abs(x.value || 0)), 1)
              const pct = Math.abs(r.value || 0) / maxVal * 100
              return (
                <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--border)] cursor-pointer text-xs interact-lift"
                  onClick={() => setToUnit(r.id)}>
                  <span className="flex-1 text-right font-medium">{fmtR(r.value)}</span>
                  <span className="w-16 opacity-70">{r.label}</span>
                  <div className="w-12 h-1.5 rounded-full overflow-hidden bg-[var(--border)]">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(pct, 1)}%`, background: cat?.cl || '#6c63ff' }} />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom banner ad */}
      <div className="flex justify-center pt-2">
        <AdSense slot="4063145925" width={320} height={50} />
      </div>
    </div>
  )
}
