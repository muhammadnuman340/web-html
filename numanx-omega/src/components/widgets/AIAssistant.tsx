import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getAllCategories } from '../../engine/converter'
import { getExplanations, getFormulaExplanation } from '../../engine/learning'
import { analytics } from '../../engine/analytics'
import { aiEngine } from '../../engine/aiEngine'
import type { Suggestion } from '../../engine/aiEngine'

interface Message {
  id: number
  type: 'assistant' | 'user' | 'tip' | 'suggestion'
  text: string
  icon?: string
  timestamp: number
}

export default function AIAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([{
    id: 1, type: 'assistant', text: "I'm your NX-COS assistant. Ask me about conversions, formulas, or get suggestions based on your usage.",
    icon: '🤖', timestamp: Date.now()
  }])
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const msgId = useRef(2)

  const cats = useMemo(() => getAllCategories(), [])
  const summary = analytics.getSummary()

  const suggestions = useMemo(() => {
    const s: Suggestion[] = []
    const next = aiEngine.getNextAction([])
    if (next) s.push(next)
    if (summary.totalConversions > 0) {
      s.push({ type: 'tip', label: `Most used: ${summary.mostUsedCategory}`, description: `${summary.mostUsedCategory} conversions`, confidence: 0.7 })
    }
    return s
  }, [summary])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (text: string, type: Message['type'], icon?: string) => {
    setMessages(prev => [...prev, {
      id: msgId.current++, type, text, icon: icon || '🤖', timestamp: Date.now()
    }])
  }

  const handleSend = useCallback(() => {
    const q = input.trim()
    if (!q) return
    setInput('')
    addMessage(q, 'user', '👤')

    const lower = q.toLowerCase()

    // Check for category explanations
    const catMatch = cats.find(c =>
      c.lb.toLowerCase().includes(lower) || lower.includes(c.id)
    )
    if (catMatch) {
      const exps = getExplanations(catMatch.id)
      if (exps.length > 0) {
        addMessage(`📖 **${catMatch.lb}** — ${exps[0].title}`, 'assistant')
        addMessage(exps[0].explanation, 'assistant')
        if (exps[0].formula) addMessage(`Formula: ${exps[0].formula}`, 'assistant')
        return
      }
    }

    // Check for help/about
    if (lower.includes('help') || lower.includes('feature') || lower.includes('what can')) {
      addMessage('I can help with:\n• Converting units (try "5 km in miles")\n• Explaining formulas\n• Showing your usage stats\n• Finding categories & units\n• Guiding you through modes', 'assistant')
      return
    }

    // Stats check
    if (lower.includes('stat') || lower.includes('usage') || lower.includes('analytics')) {
      addMessage(`📊 **Your Stats** — Total: ${summary.totalConversions} | Top: ${summary.mostUsedCategory} | Peak: ${summary.peakDay} | Score: ${analytics.getProductivityScore()}%`, 'assistant')
      return
    }

    // Mode explanation
    if (lower.includes('mode') || lower.includes('student') || lower.includes('engineer') || lower.includes('trader') || lower.includes('scientist')) {
      addMessage('🎓 **Student** — Simplified UI + explanations\n🔧 **Engineer** — Precision + advanced units\n🔬 **Scientist** — Constants + math\n💹 **Trader** — Currency + crypto focus\n⚡ **Fast** — Minimal instant mode\n🚀 **Pro** — Full analytics + AI', 'assistant')
      return
    }

    // Conversion format explanation
    if (lower.includes('convert') || lower.includes('format') || lower.includes('how to')) {
      addMessage('You can type conversions naturally like:\n• "5 km in miles"\n• "100 USD to EUR"\n• "(5m + 20cm) × 2"\n• "convert 30C to F"\n\nTry it in the converter panel!', 'assistant')
      return
    }

    // Suggestions based on usage
    if (lower.includes('suggest') || lower.includes('recommend')) {
      if (suggestions.length > 0) {
        addMessage(`💡 **Suggestions** — ${suggestions.slice(0, 3).map(s => s.label).join(' • ')}`, 'assistant')
      } else {
        addMessage('💡 Start converting to get personalized suggestions!', 'assistant')
      }
      return
    }

    // Shortcuts
    if (lower.includes('shortcut') || lower.includes('key')) {
      addMessage('⌘K — Command bar\n⌘⇧C — Quick convert\n⌘H — History\n⌘D — Dark mode\nEsc — Close/clear', 'assistant')
      return
    }

    // General fallback
    addMessage('I understand you want help with that. Try asking about:\n• A specific category (e.g., "length")\n• Your usage stats ("my stats")\n• Modes ("what are the modes")\n• Shortcuts ("keyboard shortcuts")', 'assistant')
  }, [input, cats, suggestions, summary])

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
              <span className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center text-sm">🧠</span>
              <span className="font-semibold text-sm">NX-COS AI</span>
            </div>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <button onClick={onClose} className="text-xs opacity-40 hover:opacity-100 p-1">✕</button>
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
                  <span className="text-sm mt-1 shrink-0">{msg.icon}</span>
                )}
                <div className={`rounded-xl px-3 py-2 text-xs max-w-[85%] ${
                  msg.type === 'user'
                    ? 'bg-[var(--primary)] text-white'
                    : msg.type === 'tip'
                    ? 'bg-yellow-500/10 text-yellow-600'
                    : 'bg-[var(--card2)]'
                }`}>
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                  ))}
                </div>
                {msg.type === 'user' && (
                  <span className="text-sm mt-1 shrink-0">👤</span>
                )}
              </motion.div>
            ))}

            {/* Suggestions */}
            {suggestions.length > 0 && messages.length < 4 && (
              <div className="pt-2 space-y-1">
                <div className="text-[10px] opacity-40 uppercase tracking-wide">Suggestions</div>
                {suggestions.slice(0, 3).map((s, i) => (
                  <button key={i} onClick={() => { setInput(s.label); setTimeout(handleSend, 100) }}
                    className="block w-full text-left text-xs p-2 rounded-lg hover:bg-[var(--border)] transition-colors">
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[var(--border)]">
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card2)] text-xs outline-none focus:border-[var(--primary)] transition-colors"
              />
              <button onClick={handleSend}
                className="px-3 py-2 rounded-xl bg-[var(--primary)] text-white text-xs interact-lift">→</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
