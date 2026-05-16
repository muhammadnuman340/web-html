import { motion, AnimatePresence } from 'framer-motion'
import { useMonetization } from '../../hooks/useMonetization'

export default function ProSettingsModal() {
  const { proSettingsOpen, setProSettingsOpen, isPro, setPro } = useMonetization()

  return (
    <AnimatePresence>
      {proSettingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          onClick={() => setProSettingsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="relative glass rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[var(--border)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <span className="text-lg">🚀</span> Pro Settings
              </h3>
              <button onClick={() => setProSettingsOpen(false)} className="p-1 rounded-lg hover:bg-[var(--border)] text-xs opacity-50 hover:opacity-100">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="glass rounded-xl px-3 py-2 flex items-center justify-between">
                <span>Pro Status</span>
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-[10px] font-semibold">✓ Active</span>
              </div>
              <div className="glass rounded-xl px-3 py-2 flex items-center justify-between">
                <span>Ads</span>
                <span className="text-green-500">Removed</span>
              </div>
              <div className="glass rounded-xl px-3 py-2 flex items-center justify-between">
                <span>Batch Mode</span>
                <span className="text-green-500">Unlocked</span>
              </div>
              <div className="glass rounded-xl px-3 py-2 flex items-center justify-between">
                <span>Cross Chains</span>
                <span className="text-green-500">Unlocked</span>
              </div>
              <div className="glass rounded-xl px-3 py-2 flex items-center justify-between">
                <span>CSV Export</span>
                <span className="text-green-500">Unlocked</span>
              </div>
            </div>

            {isPro && (
              <button onClick={() => { if (confirm('Reset Pro status? This will re-enable ads and lock features.')) { setPro(false); setProSettingsOpen(false) } }}
                className="mt-4 w-full py-2 rounded-xl text-xs glass border border-red-500/30 text-red-500/60 hover:bg-red-500/10 transition-all">
                Reset Pro Status
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
