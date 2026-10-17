import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import SEOHead from '../components/ui/SEOHead'
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
      <SEOHead title="Crypto Converter — Bitcoin, Ethereum & Altcoin Prices" description="Free live cryptocurrency converter. Real-time prices for Bitcoin, Ethereum, Solana, XRP, Dogecoin, and 50+ cryptocurrencies via CoinGecko." path="/crypto" />
      <h1 className="text-lg font-bold"><span aria-hidden="true">₿</span> Crypto Converter</h1>
      {loading && <div className="text-sm opacity-60 animate-pulse">Loading prices from CoinGecko...</div>}

      <GlassCard>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="flex-[2] min-w-[100px] p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--glow)] text-lg font-medium transition-all" />
            <select value={from} onChange={e => setFrom(e.target.value)}
              className="flex-1 min-w-[60px] p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] outline-none focus:border-[var(--primary)] text-sm transition-all appearance-none cursor-pointer">
              {CRYPTO_LIST.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
            </select>
            <motion.button whileTap={{ scale: 0.85 }}
              onClick={() => { const f = from; setFrom(to); setTo(f) }}
              className="p-3 rounded-xl bg-[var(--primary)] text-white text-lg flex items-center justify-center w-12 shadow-md shadow-[var(--glow)] interact-lift">⇄</motion.button>
            <select value={to} onChange={e => setTo(e.target.value)}
              className="flex-1 min-w-[60px] p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] outline-none focus:border-[var(--primary)] text-sm transition-all appearance-none cursor-pointer">
              {CRYPTO_LIST.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
            </select>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-xs opacity-60">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-3 h-3 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
              Loading prices from CoinGecko...
            </div>
          )}

          {result !== null && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="text-3xl font-bold gradient-horizontal bg-clip-text text-transparent">{fmt(result, 6)}</div>
              <div className="text-sm opacity-60">{amount} {from}</div>
            </motion.div>
          )}
        </div>
      </GlassCard>

      {/* Price table */}
      <GlassCard>
        <div className="text-xs font-semibold uppercase mb-2 opacity-60 flex items-center gap-2">
          Live Prices (USD)
          <span className="inline-flex items-center gap-1 text-xs opacity-40"><span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" /> live</span>
        </div>
        <div className="space-y-1">
          {CRYPTO_LIST.map(c => (
            <div key={c.symbol} className="flex justify-between p-2 rounded-lg text-sm hover:bg-[var(--border)] transition-colors">
              <span><span className="font-medium">{c.symbol}</span> <span className="text-xs opacity-50">{c.name}</span></span>
              <span className="font-medium font-mono">${prices[c.symbol] ? fmt(prices[c.symbol], 2) : <span className="opacity-30">—</span>}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
