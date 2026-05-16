import { useState, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  icon?: string
}

interface ToastContextType {
  addToast: (message: string, type?: Toast['type'], icon?: string) => void
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let toastId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast['type'] = 'info', icon?: string) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type, icon }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const typeStyles: Record<Toast['type'], string> = {
    success: 'bg-green-500/20 border-green-500 text-green-500',
    error: 'bg-red-500/20 border-red-500 text-red-500',
    info: 'bg-[var(--primary)]/20 border-[var(--primary)]',
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-500',
  }

  const typeIcons: Record<Toast['type'], string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.7, right: 0.1 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) removeToast(toast.id)
              }}
              whileDrag={{ scale: 0.95, opacity: 0.8 }}
              onClick={() => removeToast(toast.id)}
              className="pointer-events-auto px-4 py-2.5 rounded-xl border backdrop-blur-md text-xs font-medium shadow-lg flex items-center gap-2 cursor-grab active:cursor-grabbing select-none"
              style={{ borderColor: 'var(--border)', background: 'var(--glass-bg)' }}
            >
              <span className="text-sm">{toast.icon || typeIcons[toast.type]}</span>
              <span>{toast.message}</span>
              <motion.span
                className="ml-2 text-[9px] opacity-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
              >
                ← swipe
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
