import { useState, useEffect } from 'react'
import GlassCard from '../components/ui/GlassCard'
import { fmt } from '../utils/numbers'

const CRYPTO_LIST = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' }
]

export default function Crypto() {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [amount, setAmount] = useState('1')
  const [from, setFrom] = useState('BTC')
  const [to, setTo] = useState('ETH')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = CRYPTO_LIST.map(c => c.id).join(',')
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
      .then(r => r.json())
      .then(d => {
        const p: Record<string, number> = {}
        CRYPTO_LIST.forEach(c => { p[c.symbol] = d[c.id]?.usd || 0 })
        setPrices(p)
      })
      .catch(() => { /* use defaults */ })
      .finally(() => setLoading(false))
  }, [])

  const convert = (v: number, f: string, t: string) => {
    if (!prices[f] || !prices[t]) return null
    return v * prices[f] / prices[t]
  }

  const v = parseFloat(amount)
  const result = !isNaN(v) ? convert(v, from, to) : null

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">₿ Crypto Converter</h2>
      {loading && <div className="text-sm opacity-60 animate-pulse">Loading prices from CoinGecko...</div>}

      <GlassCard>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="flex-1 p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] outline-none focus:border-[var(--primary)] text-lg font-medium" />
            <select value={from} onChange={e => setFrom(e.target.value)}
              className="p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] outline-none min-w-[80px]">
              {CRYPTO_LIST.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
            </select>
            <button onClick={() => { const f = from; setFrom(to); setTo(f) }}
              className="text-xl px-2">⇄</button>
            <select value={to} onChange={e => setTo(e.target.value)}
              className="p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] outline-none min-w-[80px]">
              {CRYPTO_LIST.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
            </select>
          </div>

          {result !== null && (
            <div className="text-center py-4">
              <div className="text-3xl font-bold">{fmt(result, 6)}</div>
              <div className="text-sm opacity-60">{amount} {from}</div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Price table */}
      <GlassCard>
        <div className="text-xs font-semibold uppercase mb-2 opacity-60">Live Prices (USD)</div>
        <div className="space-y-1">
          {CRYPTO_LIST.map(c => (
            <div key={c.symbol} className="flex justify-between p-2 rounded-lg text-sm hover:bg-[var(--border)]">
              <span><span className="font-medium">{c.symbol}</span> <span className="text-xs opacity-50">{c.name}</span></span>
              <span className="font-medium">${prices[c.symbol] ? fmt(prices[c.symbol], 2) : '—'}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
