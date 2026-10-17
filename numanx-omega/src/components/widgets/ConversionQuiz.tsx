import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllCategories, convert } from '../../engine/converter'

interface QuizQuestion {
  category: string
  catIcon: string
  fromUnit: string
  fromLabel: string
  toUnit: string
  toLabel: string
  value: number
  correctAnswer: number
  options: number[]
}

function generateQuestion(): QuizQuestion {
  const cats = getAllCategories()
  const cat = cats[Math.floor(Math.random() * cats.length)]
  const fromIdx = Math.floor(Math.random() * cat.un.length)
  let toIdx = Math.floor(Math.random() * cat.un.length)
  while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * cat.un.length)
  const fromUnit = cat.un[fromIdx]
  const toUnit = cat.un[toIdx]
  const values = [0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000]
  const value = values[Math.floor(Math.random() * values.length)]
  const result = convert(value, cat.id, fromUnit.id, toUnit.id)
  const correct = result !== null ? parseFloat(result.toFixed(4)) : 0

  const options = new Set<number>([correct])
  while (options.size < 4) {
    const offset = (Math.random() > 0.5 ? 1 : -1) * Math.max(correct * 0.1, 1) * (Math.floor(Math.random() * 5) + 1)
    const alt = parseFloat((correct + offset).toFixed(4))
    if (alt > 0 && alt !== correct) options.add(alt)
  }
  const shuffled = Array.from(options).sort(() => Math.random() - 0.5)

  return {
    category: cat.lb, catIcon: cat.ic || '🔄',
    fromUnit: fromUnit.id, fromLabel: fromUnit.lb,
    toUnit: toUnit.id, toLabel: toUnit.lb,
    value, correctAnswer: correct, options: shuffled,
  }
}

export default function ConversionQuiz() {
  const [question, setQuestion] = useState<QuizQuestion>(generateQuestion)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [showResult, setShowResult] = useState(false)
  const [streak, setStreak] = useState(0)

  const isCorrect = selected !== null && selected === question.correctAnswer

  const handleSelect = useCallback((val: number) => {
    if (selected !== null) return
    setSelected(val)
    setShowResult(true)
    const correct = val === question.correctAnswer
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    setStreak(s => correct ? s + 1 : 0)
  }, [selected, question.correctAnswer])

  const next = useCallback(() => {
    setQuestion(generateQuestion())
    setSelected(null)
    setShowResult(false)
  }, [])

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🧠</span>
          <span className="text-sm font-semibold">Conversion Quiz</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          {streak >= 3 && <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500">🔥 {streak} streak</span>}
          <span className="opacity-60">{score.correct}/{score.total} ({accuracy}%)</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${question.value}-${question.fromUnit}-${question.toUnit}`}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-sm">
            <span aria-hidden="true">{question.catIcon}</span>
            <span className="opacity-60">{question.category}</span>
          </div>
          <div className="text-center py-2">
            <span className="text-lg font-bold">Convert {question.value} {question.fromLabel}</span>
            <span className="mx-2 opacity-30">→</span>
            <span className="text-lg font-bold text-[var(--primary)]">? {question.toLabel}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {question.options.map((opt, i) => {
              const isSelected = selected === opt
              const isCorrectOpt = opt === question.correctAnswer
              return (
                <motion.button key={i} whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(opt)}
                  className={`p-2.5 rounded-xl text-sm font-mono font-bold transition-all ${
                    !showResult
                      ? 'glass border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-[0_0_0_3px_var(--glow)]'
                      : isCorrectOpt
                        ? 'bg-green-500/20 text-green-500 border border-green-500/50'
                        : isSelected
                          ? 'bg-red-500/20 text-red-500 border border-red-500/50'
                          : 'glass border border-[var(--border)] opacity-40'
                  }`}
                  disabled={showResult}
                >
                  {opt}
                  {showResult && isCorrectOpt && <span className="ml-1">✓</span>}
                  {showResult && isSelected && !isCorrectOpt && <span className="ml-1">✗</span>}
                </motion.button>
              )
            })}
          </div>
          {showResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-between pt-1"
            >
              <span className={`text-xs ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect ? '✓ Correct!' : `✗ Answer: ${question.correctAnswer} ${question.toLabel}`}
              </span>
              <button onClick={next}
                className="px-3 py-1.5 rounded-lg text-xs bg-[var(--primary)] text-white interact-lift">
                Next →
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
