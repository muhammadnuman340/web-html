import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useCurrency } from '../../hooks/useCurrency'
import { CURRENCY_LIST } from '../../engine/constants'
import { fmt } from '../../utils/numbers'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

export default function CurrencyCenter() {
  const { rates, loading, lastUpdated, convert: convCurrency } = useCurrency()
  const [amount, setAmount] = useState('1')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [result, setResult] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<string[]>(['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED'])

  useEffect(() => {
    if (convCurrency && amount) {
      const v = parseFloat(amount)
      if (!isNaN(v)) setResult(convCurrency(v, from, to))
    }
  }, [amount, from, to, convCurrency])

  const chartData = rates ? {
    labels: CURRENCY_LIST.slice(0, 10),
    datasets: [{
      label: `Rates vs ${from}`,
      data: CURRENCY_LIST.slice(0, 10).map(c => rates[c] ? rates[from] / rates[c] : 0),
      borderColor: '#6c63ff', backgroundColor: 'rgba(108,99,255,0.1)',
      fill: true, tension: 0.4, pointRadius: 3
    }]
  } : null

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
          className="flex-1 p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] outline-none focus:border-[var(--primary)] text-lg font-medium" />
        <select value={from} onChange={e => setFrom(e.target.value)}
          className="p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] outline-none min-w-[80px]">
          {CURRENCY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => { const f = from; setFrom(to); setTo(f) }}
          className="text-xl px-2">⇄</motion.button>
        <select value={to} onChange={e => setTo(e.target.value)}
          className="p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] outline-none min-w-[80px]">
          {CURRENCY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {result !== null && (
        <div className="text-center py-4">
          <div className="text-3xl font-bold">{fmt(result)}</div>
          <div className="text-sm opacity-60">{amount} {from} = {fmt(result)} {to}</div>
        </div>
      )}

      {loading && <div className="text-center text-sm opacity-60 animate-pulse">Loading live rates...</div>}
      {lastUpdated && <div className="text-xs text-center opacity-40">Updated: {lastUpdated.toLocaleTimeString()}</div>}

      {/* Quick favorites */}
      <div className="flex gap-1 flex-wrap">
        {favorites.map(c => (
          <button key={c} onClick={() => setTo(c)}
            className="px-3 py-1 rounded-full text-xs border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white transition-all">
            {c}
          </button>
        ))}
      </div>

      {/* Chart */}
      {chartData && (
        <div className="h-48">
          <Line data={chartData} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(255,255,255,0.05)' } } }
          }} />
        </div>
      )}

      {/* All rates table */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-60">All Rates</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-48 overflow-y-auto">
          {CURRENCY_LIST.filter(c => c !== from).slice(0, 30).map(c => (
            <div key={c} className="flex justify-between p-1.5 rounded-lg text-xs hover:bg-[var(--border)]">
              <span className="font-medium">{c}</span>
              <span className="opacity-60">{rates ? fmt(rates[c] / rates[from], 4) : '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
