import { motion, AnimatePresence } from 'framer-motion'

export default function AIFloatingButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="mb-1 px-3 py-1.5 rounded-xl glass text-xs font-medium text-[var(--text)] border border-[var(--border)] shadow-lg whitespace-nowrap"
          >
            Ask AI ✨
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={onToggle}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-xl transition-all ${
          open
            ? 'bg-[var(--text)] text-[var(--bg)] rotate-45'
            : 'gradient-primary text-white shadow-[var(--glow)]'
        }`}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
      >
        <motion.span animate={{ rotate: open ? 45 : 0 }}>{open ? '✕' : '🧠'}</motion.span>
      </motion.button>
      {!open && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 w-12 h-12 rounded-full bg-[var(--primary)]/20 -z-10"
        />
      )}
    </div>
  )
}
