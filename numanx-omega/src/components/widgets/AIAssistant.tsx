import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getAllCategories, convert, getFormula, convertAll } from '../../engine/converter'
import { getExplanations } from '../../engine/learning'
import { analytics } from '../../engine/analytics'
import { aiEngine } from '../../engine/aiEngine'
import type { Suggestion } from '../../engine/aiEngine'
import { findKnowledge, getPageHelp, getRandomTip } from '../../engine/appKnowledge'
import { parseNaturalLanguage, extractUnit } from '../../engine/smartParser'

interface Message {
  id: number
  type: 'assistant' | 'user' | 'tip' | 'suggestion'
  text: string
  icon?: string
  timestamp: number
}

const PAGE_TIPS: Record<string, { welcome: string; tips: string[] }> = {
  '/': { welcome: "You're on the Home page. I can help you navigate or start a conversion.", tips: ['Try "convert 5 km to miles"', 'View your recent stats', 'Explore features'] },
  '/converter': { welcome: "You're on the Converter. Type a value and I'll suggest units based on your history.", tips: ['Type naturally like "5 km in miles"', 'Try batch mode for multiple values', 'Use chains for step-by-step conversions'] },
  '/dashboard': { welcome: "You're on the Dashboard. Ask me about your usage patterns.", tips: ['Check your top categories', 'Review conversion history', 'Get productivity insights'] },
  '/categories': { welcome: "You're browsing categories. Tell me which one you need help with.", tips: ['Ask about unit formulas', 'Find specific units', 'Get category recommendations'] },
  '/currency': { welcome: "You're on Currency. I can help with exchange rates.", tips: ['Try "100 USD to EUR"', 'Check crypto rates', 'Set up favorites'] },
  '/crypto': { welcome: "You're on Crypto. Ask about specific cryptocurrencies.", tips: ['Convert between coins', 'Check current rates', 'Compare values'] },
  '/history': { welcome: "You're on History. I can help analyze your conversion patterns.", tips: ['Search your history', 'Find frequent pairs', 'Export your data'] },
  '/settings': { welcome: "You're on Settings. I can help configure your experience.", tips: ['Change your theme', 'Adjust precision', 'Toggle haptic feedback'] },
  '/formulas': { welcome: "You're exploring formulas. Ask me to explain any conversion.", tips: ['Search for a formula', 'Click to copy', 'Learn step-by-step'] },
  '/favorites': { welcome: "You're on Favorites. Ask me to suggest new conversions to save.", tips: ['Add frequent conversions', 'Organize by category', 'Quick-access your top picks'] },
  '/help': { welcome: "You're on Help. I can guide you through any feature.", tips: ['Ask about modes', 'Learn keyboard shortcuts', 'Get started guide'] },
}

function roundSmart(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString()
  const abs = Math.abs(n)
  if (abs >= 1e6) return n.toExponential(4)
  if (abs >= 1) return n.toFixed(abs < 10 ? 4 : abs < 100 ? 3 : abs < 1000 ? 2 : 1)
  if (abs >= 1e-3) return n.toFixed(6)
  return n.toExponential(3)
}

function getReplyChips(msg: Message, ctx: { lastCat?: string; lastAction?: string }): { label: string; query: string }[] {
  const text = msg.text.toLowerCase()
  if (text.includes('stat') || ctx.lastAction === 'stats')
    return [{ label: '📊 Recent conversions', query: 'show recent conversions' }, { label: '🏆 Best day', query: 'what is my best day' }, { label: '📈 Productivity', query: 'what is my productivity score' }]
  if (text.includes('mode') || ctx.lastAction === 'mode')
    return [{ label: '🎓 Student mode', query: 'tell me about student mode' }, { label: '🔬 Scientist mode', query: 'tell me about scientist mode' }, { label: '💹 Trader mode', query: 'tell me about trader mode' }]
  if (text.includes('shortcut') || ctx.lastAction === 'shortcut')
    return [{ label: '💡 Show tips', query: 'show me tips' }, { label: '❓ How to convert', query: 'how to convert' }, { label: '📚 All features', query: 'what can you do' }]
  if (ctx.lastCat)
    return [{ label: '📖 Tell me more', query: 'tell me more' }, { label: '📐 Show formula', query: `formula for ${ctx.lastCat}` }, { label: '🔗 Related', query: `related to ${ctx.lastCat}` }]
  return [
    { label: '💡 Tell me more', query: 'tell me more' },
    { label: '📚 What can you do?', query: 'what can you do' },
    { label: '⚡ Show tips', query: 'tips' }
  ]
}

const NAV_ACTIONS: Record<string, string> = {
  converter: '/converter',
  dashboard: '/dashboard',
  categories: '/categories',
  settings: '/settings',
  history: '/history',
  favorites: '/favorites',
  currency: '/currency',
  crypto: '/crypto',
  formulas: '/formulas',
  help: '/help',
  home: '/',
}

const CHAT_STORAGE_KEY = 'uc_ai_chat'

function saveChat(messages: Message[]) {
  try {
    const data = messages.slice(-50).map(m => ({ type: m.type, text: m.text, icon: m.icon, timestamp: m.timestamp }))
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

function loadChat(): Message[] | null {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

export default function AIAssistant({ onClose, currentPage }: { onClose: () => void; currentPage?: string }) {
  const navigate = useNavigate()
  const pageKey = Object.keys(PAGE_TIPS).find(k => currentPage?.startsWith(k)) || '/'
  const pageInfo = PAGE_TIPS[pageKey]
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = loadChat()
    if (saved && saved.length >= 2) return saved
    return [{
      id: 1, type: 'assistant', text: `🤖 ${pageInfo.welcome}`,
      icon: '🤖', timestamp: Date.now()
    }, {
      id: 2, type: 'suggestion', text: `💡 **Tips for this page** — ${pageInfo.tips.join(' • ')}`,
      icon: '💡', timestamp: Date.now()
    }]
  })
  const [input, setInput] = useState('')
  const [isOpen] = useState(true)
  const [liveSuggestions, setLiveSuggestions] = useState<{ label: string; action?: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const msgId = useRef(messages.length + 1)
  const conversationContext = useRef<{ lastCat?: string; lastAction?: string; lastFormula?: string }>({})

  const cats = useMemo(() => getAllCategories(), [])
  const summary = analytics.getSummary()
  const handleSendRef = useRef<((q?: string) => void) | null>(null)

  // Save chat on message change
  useEffect(() => {
    saveChat(messages)
  }, [messages])

  const SUGGESTED_QUESTIONS = useMemo(() => [
    { label: 'How to convert?', action: 'how to convert' },
    { label: 'Change theme', action: 'theme' },
    { label: 'What are modes?', action: 'mode' },
    { label: 'Keyboard shortcuts', action: 'shortcut' },
    { label: 'My stats', action: 'stats' },
    { label: 'Batch mode', action: 'batch' },
  ], [])

  const suggestions = useMemo(() => {
    const s: Suggestion[] = []
    const next = aiEngine.getNextAction([])
    if (next) s.push(next)
    if (summary.totalConversions > 0) {
      s.push({ type: 'tip', label: `Most used: ${summary.mostUsedCategory}`, description: `${summary.mostUsedCategory} conversions`, confidence: 0.7 })
    }
    pageInfo.tips.forEach(t => {
      s.push({ type: 'tip', label: t, description: 'Page tip', confidence: 0.6 })
    })
    return s
  }, [summary, pageInfo])

  const replyChips = useMemo(() => {
    const last = [...messages].reverse().find(m => m.type === 'assistant')
    const ctx = conversationContext.current
    return last ? getReplyChips(last, ctx) : []
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = useCallback((text: string, type: Message['type'], icon?: string) => {
    setMessages(prev => [...prev, {
      id: msgId.current++, type, text, icon: icon || '🤖', timestamp: Date.now()
    }])
  }, [])

  const handleLiveSuggest = useCallback((value: string) => {
    if (!value.trim()) { setLiveSuggestions([]); return }
    const lower = value.toLowerCase()
    const kb = findKnowledge(lower)
    const results: { label: string; action?: string }[] = []
    kb.slice(0, 3).forEach(e => {
      results.push({ label: e.title, action: e.keywords[0] })
    })
    SUGGESTED_QUESTIONS.filter(q => q.label.toLowerCase().includes(lower) || lower.includes(q.action)).slice(0, 2).forEach(q => {
      if (!results.some(r => r.label === q.label)) results.push(q)
    })
    setLiveSuggestions(results.slice(0, 4))
  }, [SUGGESTED_QUESTIONS])

  const executeAction = useCallback((action: string) => {
    const path = NAV_ACTIONS[action]
    if (path) { navigate(path); onClose() }
  }, [navigate, onClose])

  const handleSend = useCallback(() => {
    const q = input.trim()
    if (!q) return
    setInput('')
    setLiveSuggestions([])
    addMessage(q, 'user', '👤')

    const lower = q.toLowerCase()
    const ctx = conversationContext.current
    const isFollowUp = ['tell me more', 'more', 'explain further', 'what else', 'another', 'also', 'and', 'go on', 'continue'].some(p => lower.includes(p))

    // Slash commands
    if (q.startsWith('/')) {
      const parts = q.slice(1).split(/\s+/)
      const cmd = parts[0].toLowerCase()
      const arg = parts.slice(1).join(' ')
      switch (cmd) {
        case 'go':
          if (arg) {
            const path = NAV_ACTIONS[arg]
            if (path) { navigate(path); onClose() }
            else addMessage(`Unknown page "${arg}". Try: ${Object.keys(NAV_ACTIONS).join(', ')}`, 'assistant')
          } else {
            addMessage('Usage: /go {page} — e.g. /go converter', 'assistant')
          }
          return
        case 'clear':
          setMessages([])
          localStorage.removeItem(CHAT_STORAGE_KEY)
          msgId.current = 1
          return
        case 'help':
          ctx.lastAction = 'help'
          addMessage('I can help with:\n• Converting units (try "5 km in miles")\n• Explaining formulas\n• Showing your usage stats\n• Finding categories & units\n• Guiding you through modes\n\n**Slash commands:** /go, /help, /clear, /stats, /modes, /theme', 'assistant')
          return
        case 'stats':
          ctx.lastAction = 'stats'
          addMessage(`📊 **Your Stats** — Total: ${summary.totalConversions} | Top: ${summary.mostUsedCategory} | Peak: ${summary.peakDay} | Score: ${analytics.getProductivityScore()}%`, 'assistant')
          if (summary.totalConversions > 0) {
            addMessage(`🔄 **Recent**: ${analytics.getRecentConversions(5).filter(e => e.fromUnit).map(e => `${e.fromUnit}→${e.toUnit}`).join(', ') || 'None'}`, 'assistant')
          }
          return
        case 'modes':
          ctx.lastAction = 'mode'
          addMessage('🎓 **Student** — Simplified + explanations\n🔧 **Engineer** — Precision + advanced\n🔬 **Scientist** — Constants + math\n💹 **Trader** — Currency + crypto\n⚡ **Fast** — Minimal instant\n🚀 **Pro** — Full analytics + AI', 'assistant')
          return
        case 'theme':
          addMessage('Available themes: **Light**, **Dark (AMOLED)**, **Cyberpunk**, **RGB**, **Holographic**\nTip: I match light/dark based on your system preference too!', 'assistant')
          return
        default:
          addMessage(`Unknown command "${cmd}". Try: /help, /go, /stats, /modes, /theme, /clear`, 'assistant')
      }
      return
    }

    // Live conversion: detect "5 km to miles" / "what's 5 km" / "half a km" / "5, 10, 15 km to mi"
    const parsed = parseNaturalLanguage(q)
    if (parsed.type === 'convert' && parsed.value != null && parsed.fromUnit) {

      // Natural language value overrides: "half a km" → 0.5, "a km" → 1, "5 and a half km" → 5.5
      const lowerQ = q.toLowerCase()
      let effectiveValue = parsed.value
      if (/half\s+a/.test(lowerQ)) effectiveValue = 0.5
      else if (/^a\s+\w+/.test(lowerQ) || /^an\s+\w+/.test(lowerQ)) effectiveValue = 1
      else if (/(\d+)\s+and\s+a\s+half/.test(lowerQ)) {
        const m = lowerQ.match(/(\d+)\s+and\s+a\s+half/)
        if (m) effectiveValue = parseFloat(m[1]) + 0.5
      }

      // Batch conversion: "convert 5, 10, 15 km to miles"
      const batchMatch = q.match(/(\d+\.?\d*(?:\s*,\s*\d+\.?\d*)+)\s*(.+?)\s+(?:to|in|as)\s+(.+)/i)
      if (batchMatch) {
        const batchValues = batchMatch[1].split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
        if (batchValues.length >= 2) {
          const batchFromRaw = batchMatch[2].trim()
          const batchToRaw = batchMatch[3].trim()
          const batchFromUnit = extractUnit(batchFromRaw)
          const batchToUnit = extractUnit(batchToRaw)
          if (batchFromUnit && batchToUnit) {
            const allCats = getAllCategories()
            const bFromCat = allCats.find(c => c.un.some(u => u.id === batchFromUnit))
            const bToCat = allCats.find(c => c.un.some(u => u.id === batchToUnit))
            if (bFromCat && bToCat && bFromCat.id === bToCat.id) {
              const bFromLabel = bFromCat.un.find(u => u.id === batchFromUnit)?.lb || batchFromUnit
              const bToLabel = bToCat.un.find(u => u.id === batchToUnit)?.lb || batchToUnit
              const results = batchValues.map(v => {
                analytics.track({ type: 'convert', category: bFromCat.id, fromUnit: batchFromUnit, toUnit: batchToUnit })
                const r = convert(v, bFromCat.id, batchFromUnit, batchToUnit)
                return { from: v, result: r }
              })
              const validResults = results.filter(r => r.result != null)
              if (validResults.length > 0) {
                ctx.lastCat = bFromCat.id
                addMessage(`📦 **Batch** — ${bFromLabel} → ${bToLabel}`, 'assistant')
                addMessage(validResults.map(r => `${r.from} → **${roundSmart(r.result!)}**`).join('\n'), 'assistant')
                const formula = getFormula(bFromCat.id, batchFromUnit, batchToUnit)
                if (formula) addMessage(`📐 ${formula}`, 'tip')
                addMessage(`➡ converter`, 'assistant')
                return
              }
            }
          }
        }
      }

      // Helper: do a single conversion and emit messages
      const doConversion = (val: number, fromUnit: string, toUnit: string) => {
        const allCats = getAllCategories()
        const fromCat = allCats.find(c => c.un.some(u => u.id === fromUnit))
        const toCat = allCats.find(c => c.un.some(u => u.id === toUnit))
        if (!fromCat || !toCat) {
          const allCats = getAllCategories()
          const missing = !fromCat ? fromUnit : toUnit
          const similar = allCats.flatMap(c => c.un.map(u => ({ id: u.id, cat: c.lb, label: u.lb })))
            .filter(u => u.id.includes(missing.toLowerCase()) || missing.toLowerCase().includes(u.id) || u.label.toLowerCase().includes(missing.toLowerCase()))
            .slice(0, 4)
          if (similar.length > 0) {
            addMessage(`❌ Unknown unit "${missing}". Did you mean: ${similar.map(s => `${s.id} (${s.cat})`).join(', ')}?`, 'assistant')
          } else {
            addMessage(`❌ Unknown unit "${missing}". Try common units like km, mi, kg, lb, C, F, USD, EUR`, 'assistant')
          }
          return true
        }
        if (fromCat.id !== toCat.id) {
          addMessage(`⚠️ ${fromUnit} (${fromCat.lb}) and ${toUnit} (${toCat.lb}) are in different categories`, 'assistant')
          return true
        }
        const result = convert(val, fromCat.id, fromUnit, toUnit)
        if (result == null) {
          addMessage(`❌ Can't convert ${fromUnit} → ${toUnit}`, 'assistant')
          return true
        }
        // Record to analytics
        analytics.track({ type: 'convert', category: fromCat.id, fromUnit, toUnit })

        const fromLabel = fromCat.un.find(u => u.id === fromUnit)?.lb || fromUnit
        const toLabel = toCat.un.find(u => u.id === toUnit)?.lb || toUnit
        const formula = getFormula(fromCat.id, fromUnit, toUnit)
        const allResults = convertAll(val, fromCat.id, fromUnit)
        const others = allResults.filter(r => r.id !== toUnit && r.value != null).slice(0, 4)
        ctx.lastCat = fromCat.id
        const catIcon = fromCat.ic || '📐'

        addMessage(`${catIcon} ${fromCat.lb} — ${val} ${fromLabel} → ${toLabel}`, 'assistant')
        addMessage(`**${roundSmart(val)} ${fromLabel} = ${roundSmart(result)} ${toLabel}**`, 'assistant')

        // Steps breakdown
        if (formula) {
          addMessage(`📐 ${formula}`, 'tip')
          if (fromCat.id !== 'temp' && fromCat.id !== 'fuel') {
            const fu = fromCat.un.find(u => u.id === fromUnit)
            const tu = toCat.un.find(u => u.id === toUnit)
            if (fu?.r && tu?.r) {
              addMessage(`Step: ${val} × ${fu.r} ÷ ${tu.r} = ${roundSmart(result)}`, 'tip')
            }
          }
        }

        if (others.length > 0) {
          addMessage(`Also: ${others.map(r => `${r.label}: ${roundSmart(r.value as number)}`).join(' • ')}`, 'suggestion')
        }
        // Currency/crypto rate context
        if (fromCat.curr || fromCat.crypto) {
          addMessage(`💱 Rates update periodically — check Currency Center for latest`, 'tip')
        }
        addMessage(`➡ converter`, 'assistant')
        addMessage(`💡 Try "tell me more" for ${fromCat.lb}`, 'suggestion')
        return true
      }

      // No target unit: show all results
      if (!parsed.toUnit) {
        // Smart default: use user's most frequent pair in this category
        const allCats = getAllCategories()
        const fromCat = allCats.find(c => c.un.some(u => u.id === parsed.fromUnit))
        if (fromCat) {
          const freqPair = analytics.getSuggestedPairs().find(p => p.startsWith(parsed.fromUnit! + '→'))
          if (freqPair) {
            const target = freqPair.split('→')[1]
            if (target && doConversion(effectiveValue, parsed.fromUnit, target)) return
          }
          // Fallback: show all results
          const fromLabel = fromCat.un.find(u => u.id === parsed.fromUnit)?.lb || parsed.fromUnit
          const allResults = convertAll(effectiveValue, fromCat.id, parsed.fromUnit)
          const valid = allResults.filter(r => r.value != null).slice(0, 6)
          if (valid.length > 0) {
            analytics.track({ type: 'convert', category: fromCat.id, fromUnit: parsed.fromUnit })
            ctx.lastCat = fromCat.id
            addMessage(`${fromCat.ic || '📐'} ${fromCat.lb} — ${effectiveValue} ${fromLabel}`, 'assistant')
            const lines = valid.map((r, i) => {
              const val = r.value as number
              return `${i === 0 ? '▸' : ' '} ${r.label}: **${roundSmart(val)}**`
            })
            addMessage(lines.join('\n'), 'assistant')
            const formula = getFormula(fromCat.id, parsed.fromUnit, valid[0].id)
            if (formula) addMessage(`📐 ${formula}`, 'tip')
            addMessage(`➡ converter`, 'assistant')
            return
          }
        }
      }

      // Has target unit
      if (parsed.fromUnit && parsed.toUnit) {
        doConversion(effectiveValue, parsed.fromUnit, parsed.toUnit)
        return
      }
    }

    // Pure number: show quick convert presets
    const plainNum = q.match(/^(\d+\.?\d*)$/)
    if (plainNum) {
      const n = parseFloat(plainNum[1])
      const suggested = analytics.getSuggestedPairs().slice(0, 3)
      if (suggested.length > 0) {
        addMessage(`🔢 **${n}** — Quick conversions based on your history`, 'assistant')
        suggested.forEach(pair => {
          const [fu, tu] = pair.split('→')
          const cat = getAllCategories().find(c => c.un.some(u => u.id === fu))
          if (cat) {
            const r = convert(n, cat.id, fu, tu)
            if (r != null) {
              const fl = cat.un.find(u => u.id === fu)?.lb || fu
              const tl = cat.un.find(u => u.id === tu)?.lb || tu
              addMessage(`  ${roundSmart(n)} ${fl} = **${roundSmart(r)} ${tl}**`, 'tip')
            }
          }
        })
        addMessage(`💡 Type "${n} km to miles" for any specific conversion`, 'suggestion')
        return
      }
      // No history: show universal presets
      const presets: { v: number; fu: string; tu: string; cat: string }[] = [
        { v: n, fu: 'km', tu: 'mi', cat: 'length' },
        { v: n, fu: 'kg', tu: 'lb', cat: 'mass' },
        { v: n, fu: 'C', tu: 'F', cat: 'temp' },
        { v: n, fu: 'USD', tu: 'EUR', cat: 'currency' },
      ]
      addMessage(`🔢 **${n}** — Common conversions`, 'assistant')
      presets.forEach(p => {
        const cat = getAllCategories().find(c => c.id === p.cat)
        if (cat) {
          const r = convert(n, p.cat, p.fu, p.tu)
          if (r != null) {
            const fl = cat.un.find(u => u.id === p.fu)?.lb || p.fu
            const tl = cat.un.find(u => u.id === p.tu)?.lb || p.tu
            addMessage(`  ${roundSmart(n)} ${fl} = **${roundSmart(r)} ${tl}**`, 'tip')
          }
        }
      })
      addMessage(`💡 Type "${n} km to miles" for any specific conversion`, 'suggestion')
      return
    }

    // Check for navigation actions
    for (const [key, path] of Object.entries(NAV_ACTIONS)) {
      if (lower.includes(`go to ${key}`) || lower.includes(`open ${key}`) || lower.includes(`navigate to ${key}`)) {
        navigate(path); onClose()
        return
      }
    }

    // Follow-up: expand on previous context
    if (isFollowUp && ctx.lastCat && !cats.find(c => c.lb.toLowerCase().includes(lower) || lower.includes(c.id))) {
      const exps = getExplanations(ctx.lastCat)
      const nextIdx = exps.findIndex(e => e.title.toLowerCase().includes(ctx.lastFormula || '')) + 1
      const nextExp = exps[nextIdx] || exps[0]
      if (nextExp) {
        addMessage(`📖 **More about ${ctx.lastCat}** — ${nextExp.title}`, 'assistant')
        addMessage(nextExp.explanation, 'assistant')
        if (nextExp.formula) addMessage(`Formula: ${nextExp.formula}`, 'assistant')
        ctx.lastFormula = nextExp.title
        return
      }
    }

    // Check for category explanations
    const catMatch = cats.find(c =>
      c.lb.toLowerCase().includes(lower) || lower.includes(c.id)
    )
    if (catMatch) {
      const exps = getExplanations(catMatch.id)
      if (exps.length > 0) {
        ctx.lastCat = catMatch.id
        ctx.lastFormula = exps[0].title
        addMessage(`📖 **${catMatch.lb}** — ${exps[0].title}`, 'assistant')
        addMessage(exps[0].explanation, 'assistant')
        if (exps[0].formula) addMessage(`Formula: ${exps[0].formula}`, 'assistant')
        if (exps.length > 1) addMessage(`💡 Ask "tell me more" for more details`, 'assistant')
        return
      }
    }

    // Check for help/about
    if (lower.includes('help') || lower.includes('feature') || lower.includes('what can')) {
      ctx.lastAction = 'help'
      addMessage('I can help with:\n• Converting units (try "5 km in miles")\n• Explaining formulas\n• Showing your usage stats\n• Finding categories & units\n• Guiding you through modes', 'assistant')
      return
    }

    // Stats check
    if (lower.includes('stat') || lower.includes('usage') || lower.includes('analytics')) {
      ctx.lastAction = 'stats'
      addMessage(`📊 **Your Stats** — Total: ${summary.totalConversions} | Top: ${summary.mostUsedCategory} | Peak: ${summary.peakDay} | Score: ${analytics.getProductivityScore()}%`, 'assistant')
      if (summary.totalConversions > 0) {
        addMessage(`🔄 **Recent conversions**: ${analytics.getRecentConversions(5).filter(e => e.fromUnit).map(e => `${e.fromUnit}→${e.toUnit}`).join(', ') || 'None yet'}`, 'assistant')
      }
      return
    }

    // Mode explanation
    if (lower.includes('mode') || lower.includes('student') || lower.includes('engineer') || lower.includes('trader') || lower.includes('scientist')) {
      ctx.lastAction = 'mode'
      addMessage('🎓 **Student** — Simplified UI + explanations\n🔧 **Engineer** — Precision + advanced units\n🔬 **Scientist** — Constants + math\n💹 **Trader** — Currency + crypto focus\n⚡ **Fast** — Minimal instant mode\n🚀 **Pro** — Full analytics + AI', 'assistant')
      addMessage('💡 Ask "tell me more" about any mode for details', 'assistant')
      return
    }

    // Conversion format explanation
    if (lower.includes('convert') || lower.includes('format') || lower.includes('how to')) {
      ctx.lastAction = 'convert'
      addMessage('You can type conversions naturally like:\n• "5 km in miles"\n• "100 USD to EUR"\n• "(5m + 20cm) × 2"\n• "convert 30C to F"\n\nTry it in the converter panel!', 'assistant')
      return
    }

    // Suggestions based on usage
    if (lower.includes('suggest') || lower.includes('recommend')) {
      ctx.lastAction = 'suggest'
      if (suggestions.length > 0) {
        addMessage(`💡 **Suggestions** — ${suggestions.slice(0, 3).map(s => s.label).join(' • ')}`, 'assistant')
      } else {
        addMessage('💡 Start converting to get personalized suggestions!', 'assistant')
      }
      return
    }

    // Shortcuts
    if (lower.includes('shortcut') || lower.includes('key')) {
      ctx.lastAction = 'shortcut'
      addMessage('⌘K — Command bar\n⌘⇧C — Quick convert\n⌘H — History\n⌘D — Dark mode\n⌘⇧A — AI Assistant\nEsc — Close/clear', 'assistant')
      return
    }

    // Follow-up fallback with context
    if (isFollowUp && ctx.lastAction) {
      if (ctx.lastAction === 'mode') {
        addMessage('Each mode tailors the UI to your workflow:\n• **Student** — Learn with explanations\n• **Engineer** — Precision tools\n• **Fast** — Minimal interface\nTry switching in the sidebar or settings!', 'assistant')
        return
      }
      if (ctx.lastAction === 'stats') {
        const recent = analytics.getRecentConversions(5)
        const pairs = recent.filter(e => e.fromUnit && e.toUnit).map(e => `${e.fromUnit}→${e.toUnit}`).join(', ')
        addMessage(`📈 **Recent activity** — ${recent.length} recent conversions${pairs ? ': ' + pairs : ''}`, 'assistant')
        return
      }
    }

    // App knowledge base query
    const kbResults = findKnowledge(lower)
    if (kbResults.length > 0) {
      const top = kbResults[0]
      ctx.lastAction = top.category
      addMessage(`📚 **${top.title}**`, 'assistant')
      addMessage(top.content, 'assistant')
      if (kbResults.length > 1) {
        const related = kbResults.slice(1, 3).map(e => e.title).join(' • ')
        addMessage(`💡 Related: ${related}`, 'suggestion')
      }
      if (top.related && top.related.length > 0) {
        addMessage(`🔗 Try asking about: ${top.related.slice(0, 3).join(', ')}`, 'suggestion')
      }
      return
    }

    // Random tip fallback
    const randomTip = getRandomTip()
    addMessage(`💡 **Tip** — ${randomTip.title}\n${randomTip.content}`, 'assistant')
  }, [input, cats, suggestions, summary, addMessage, navigate, onClose])

  handleSendRef.current = handleSend

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-80 z-50 glass border-l border-[var(--border)] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center text-sm" aria-hidden="true">🧠</span>
              <span className="font-semibold text-sm">NX-COS AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              {messages.length > 2 && <span className="text-[8px] opacity-30">{messages.length}</span>}
              <button onClick={() => { setMessages([]); localStorage.removeItem(CHAT_STORAGE_KEY); msgId.current = 1 }}
                className="text-[8px] opacity-30 hover:opacity-100 p-1" aria-label="Clear chat">🗑</button>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <button onClick={onClose} className="text-xs opacity-40 hover:opacity-100 p-1" aria-label="Close AI assistant">✕</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map(msg => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : ''}`}
              >
                {msg.type !== 'user' && (
                  <span className="text-sm mt-1 shrink-0" aria-hidden="true">{msg.icon}</span>
                )}
                <div className={`rounded-xl px-3 py-2 text-xs max-w-[85%] group relative ${
                  msg.type === 'user'
                    ? 'bg-[var(--primary)] text-white'
                    : msg.type === 'tip'
                    ? 'bg-yellow-500/10 text-yellow-600'
                    : 'bg-[var(--card2)]'
                }`}>
                  {msg.type !== 'user' && (
                    <button onClick={() => { navigator.clipboard.writeText(msg.text) }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-[9px] p-0.5 rounded hover:bg-[var(--border)] transition-all" aria-label="Copy message">
                      📋
                    </button>
                  )}
                  {msg.text.split('\n').map((line, i) => {
                    const trimmed = line.trim()
                    const navMatch = trimmed.match(/^➡\s*(\w+)/)
                    if (navMatch && NAV_ACTIONS[navMatch[1].toLowerCase()]) {
                      const action = navMatch[1].toLowerCase()
                      return (
                        <button key={i} onClick={() => executeAction(action)}
                          className="mt-1 px-2 py-1 rounded-lg text-[9px] font-medium bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all inline-flex items-center gap-1">
                          Go to {action.charAt(0).toUpperCase() + action.slice(1)} →
                        </button>
                      )
                    }
                    return <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                  })}
                </div>
                {msg.type === 'user' && (
                  <span className="text-sm mt-1 shrink-0" aria-hidden="true">👤</span>
                )}
              </motion.div>
            ))}

            {/* Smart Reply Chips */}
            {messages.length > 1 && replyChips.length > 0 && (
              <div className="pt-1 space-y-1">
                <div className="text-[10px] opacity-40 uppercase tracking-wide">Quick replies</div>
                <div className="flex flex-wrap gap-1">
                  {replyChips.map((chip, i) => (
                    <button key={i} onClick={() => { setInput(chip.query); setTimeout(() => handleSendRef.current?.(), 100) }}
                      className="text-[10px] px-2 py-1 rounded-full glass border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all">
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && messages.length < 4 && (
              <div className="pt-2 space-y-1">
                <div className="text-[10px] opacity-40 uppercase tracking-wide">Suggestions</div>
                {suggestions.slice(0, 3).map((s, i) => (
                  <button key={i} onClick={() => { setInput(s.label); setTimeout(() => handleSendRef.current?.(), 100) }}
                    className="block w-full text-left text-xs p-2 rounded-lg hover:bg-[var(--border)] transition-colors">
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* Suggested questions (shown when no messages or scrolled to bottom) */}
            {messages.length < 4 && (
              <div className="pt-2">
                <div className="text-[10px] opacity-40 uppercase tracking-wide mb-1">Quick questions</div>
                <div className="grid grid-cols-2 gap-1">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button key={i} onClick={() => { setInput(q.label); setTimeout(() => handleSendRef.current?.(), 100) }}
                      className="text-left text-[10px] p-1.5 rounded-lg glass border border-[var(--border)] hover:border-[var(--primary)] transition-colors truncate">
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[var(--border)] relative">
            {/* Live suggestions dropdown */}
            <AnimatePresence>
              {liveSuggestions.length > 0 && input.trim() && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-full left-3 right-3 mb-1 glass rounded-xl overflow-hidden shadow-lg border border-[var(--border)]">
                  {liveSuggestions.map((s, i) => (
                    <button key={i} onClick={() => { setInput(s.label); setLiveSuggestions([]); setTimeout(() => handleSendRef.current?.(), 100) }}
                      className="w-full text-left px-3 py-2 text-[11px] hover:bg-[var(--border)] transition-colors flex items-center gap-2">
                      <span className="text-[9px] opacity-40">💡</span>
                      {s.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <input value={input} onChange={e => { setInput(e.target.value); handleLiveSuggest(e.target.value) }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSend()
                  if (e.key === 'Escape') setLiveSuggestions([])
                }}
                placeholder="Ask anything..."
                className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs outline-none focus:border-[var(--primary)] transition-colors"
              />
              <button onClick={handleSend}
                className="px-3 py-2 rounded-xl bg-[var(--primary)] text-white text-xs interact-lift" aria-label="Send message">→</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
