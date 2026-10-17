import { useState } from 'react'

interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
}

const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'All-Purpose Flour', amount: 2, unit: 'cup' },
  { id: '2', name: 'Granulated Sugar', amount: 1, unit: 'cup' },
  { id: '3', name: 'Unsalted Butter (melted)', amount: 0.5, unit: 'cup' },
  { id: '4', name: 'Whole Milk', amount: 0.75, unit: 'cup' },
  { id: '5', name: 'Baking Powder', amount: 2, unit: 'tsp' },
  { id: '6', name: 'Vanilla Extract', amount: 1, unit: 'tbsp' },
  { id: '7', name: 'Salt', amount: 0.5, unit: 'tsp' },
]

export default function CookingRecipeScaler() {
  const [multiplier, setMultiplier] = useState<number>(2)
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS)
  const [newIngredientName, setNewIngredientName] = useState('')
  const [newAmount, setNewAmount] = useState(1)
  const [newUnit, setNewUnit] = useState('cup')

  const formatFraction = (val: number): string => {
    const whole = Math.floor(val)
    const dec = Math.round((val - whole) * 100) / 100

    let frac = ''
    if (Math.abs(dec - 0.25) < 0.05) frac = '¼'
    else if (Math.abs(dec - 0.33) < 0.05) frac = '⅓'
    else if (Math.abs(dec - 0.5) < 0.05) frac = '½'
    else if (Math.abs(dec - 0.66) < 0.05) frac = '⅔'
    else if (Math.abs(dec - 0.75) < 0.05) frac = '¾'

    if (whole > 0 && frac) return `${whole} ${frac}`
    if (frac) return frac
    return Number.isInteger(val) ? String(val) : val.toFixed(2)
  }

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newIngredientName.trim()) return
    setIngredients(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newIngredientName.trim(),
        amount: newAmount,
        unit: newUnit,
      }
    ])
    setNewIngredientName('')
    setNewAmount(1)
  }

  const handleRemove = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id))
  }

  const multipliers = [
    { label: '0.5× (Half)', val: 0.5 },
    { label: '1× (Original)', val: 1 },
    { label: '1.5×', val: 1.5 },
    { label: '2× (Double)', val: 2 },
    { label: '3× (Triple)', val: 3 },
  ]

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span aria-hidden="true">🍳</span> Interactive Kitchen Recipe Portion Scaler
          </h2>
          <p className="text-xs opacity-60 mt-0.5">
            Multiply recipe quantities for baking and dinner parties without messy fraction math.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {multipliers.map(m => (
            <button
              key={m.label}
              onClick={() => setMultiplier(m.val)}
              className={`btn-chip text-xs ${multiplier === m.val ? 'active' : ''}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredient Table */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs opacity-60 px-1">
          <span className="font-semibold uppercase tracking-wider text-xs">Ingredient Name</span>
          <div className="flex gap-8">
            <span className="font-semibold uppercase tracking-wider text-xs w-20 text-right">Base</span>
            <span className="font-semibold uppercase tracking-wider text-xs w-24 text-right text-[var(--primary)]">Scaled ({multiplier}×)</span>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]/30 rounded-xl border border-[var(--border)] bg-[var(--card2)]/40 overflow-hidden">
          {ingredients.map(item => {
            const scaled = item.amount * multiplier
            return (
              <div key={item.id} className="flex items-center justify-between py-2 px-3 text-xs hover:bg-[var(--border)]/20 transition-colors">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="opacity-40 hover:opacity-100 text-xs text-red-400"
                    title="Remove item"
                    aria-label={`Remove ${item.name}`}
                  >
                    ✕
                  </button>
                  <span className="font-medium text-[var(--text)]">{item.name}</span>
                </div>

                <div className="flex items-center gap-8 font-mono">
                  <span className="text-xs opacity-60 w-20 text-right">
                    {formatFraction(item.amount)} {item.unit}
                  </span>
                  <span className="text-xs font-bold text-[var(--primary)] w-24 text-right">
                    {formatFraction(scaled)} {item.unit}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Custom Ingredient Form */}
      <form onSubmit={handleAddIngredient} className="flex flex-col sm:flex-row gap-2 pt-1 text-xs">
        <input
          type="text"
          value={newIngredientName}
          onChange={e => setNewIngredientName(e.target.value)}
          placeholder="Add ingredient (e.g., Brown Sugar)..."
          className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] outline-none focus:border-[var(--primary)]"
        />
        <input
          type="number"
          step={0.25}
          min={0.1}
          value={newAmount}
          onChange={e => setNewAmount(parseFloat(e.target.value) || 1)}
          className="w-20 px-2.5 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] outline-none font-mono text-right"
        />
        <select
          value={newUnit}
          onChange={e => setNewUnit(e.target.value)}
          className="px-2.5 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] outline-none cursor-pointer"
        >
          <option value="cup">cup</option>
          <option value="tbsp">tbsp</option>
          <option value="tsp">tsp</option>
          <option value="fl oz">fl oz</option>
          <option value="mL">mL</option>
          <option value="g">g</option>
        </select>
        <button
          type="submit"
          className="btn-primary text-xs"
        >
          + Add
        </button>
      </form>
    </div>
  )
}
