import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
}

const GROUPS = [
  {
    label: 'Navigation',
    items: [
      { keys: ['⌘', 'K'], desc: 'Command palette' },
      { keys: ['⌘', '⇧', 'C'], desc: 'Quick convert' },
      { keys: ['⌘', 'H'], desc: 'History' },
      { keys: ['⌘', 'D'], desc: 'Toggle dark mode' },
      { keys: ['?'], desc: 'This panel' },
    ],
  },
  {
    label: 'Converter',
    items: [
      { keys: ['Esc'], desc: 'Clear input / Close panels' },
      { keys: ['Tab'], desc: 'Next unit selector' },
      { keys: ['Enter'], desc: 'Copy result' },
    ],
  },
  {
    label: 'Modes',
    items: [
      { keys: ['🎓'], desc: 'Student — simplified + explanations' },
      { keys: ['🔧'], desc: 'Engineer — precision focus' },
      { keys: ['🔬'], desc: 'Scientist — constants & math' },
      { keys: ['💹'], desc: 'Trader — currency & crypto' },
      { keys: ['⚡'], desc: 'Fast — minimal instant mode' },
      { keys: ['🚀'], desc: 'Pro — full analytics & AI' },
    ],
  },
]

export default function ShortcutsPanel({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[400] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="relative glass rounded-2xl p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-[var(--border)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold">⌨️ Keyboard Shortcuts</h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--border)] text-xs opacity-50 hover:opacity-100 transition-all">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {GROUPS.map(group => (
                <div key={group.label}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider opacity-40 mb-2">{group.label}</div>
                  <div className="space-y-1">
                    {group.items.map(item => (
                      <div key={item.desc} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[var(--border)] transition-colors">
                        <span className="text-xs opacity-70">{item.desc}</span>
                        <span className="flex items-center gap-1">
                          {item.keys.map((k, i) => (
                            <span key={i}>
                              <kbd>{k}</kbd>
                              {i < item.keys.length - 1 && <span className="text-[9px] opacity-30 mx-0.5">+</span>}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border)] text-[10px] opacity-30 text-center">
              Press <kbd>?</kbd> anytime to open this panel
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
