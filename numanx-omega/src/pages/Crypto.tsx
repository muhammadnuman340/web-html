import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import SEOHead from '../components/ui/SEOHead'
import { fmt } from '../utils/numbers'
import { useCrypto } from '../hooks/useCrypto'
import { SUPPORTED_CRYPTO_ASSETS } from '../services/financialData'

export default function Crypto() {
  const { prices, loading, lastUpdated, status, statusMessage, refresh, convert } = useCrypto()
  const [amount, setAmount] = useState('1')
  const [from, setFrom] = useState('BTC')
  const [to, setTo] = useState('ETH')

  const v = parseFloat(amount)
  const isNegative = !isNaN(v) && v < 0
  const result = !isNaN(v) && v >= 0 ? convert(v, from, to) : null

  return (
    <div className="space-y-4">
      <SEOHead title="Crypto Converter — Bitcoin, Ethereum & Altcoin Prices" description="Free live cryptocurrency converter. Real-time prices for Bitcoin, Ethereum, Solana, XRP, Dogecoin, and 50+ cryptocurrencies via CoinGecko." path="/crypto" />
      <h1 className="text-lg font-bold"><span aria-hidden="true">₿</span> Crypto Converter</h1>

      {statusMessage && (
        <div role="status" aria-live="polite" className="text-xs px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
          {statusMessage}
        </div>
      )}

      <GlassCard>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
              aria-label="Cryptocurrency amount"
              className="flex-[2] min-w-[100px] p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--glow)] text-lg font-medium transition-all" />
            <select value={from} onChange={e => setFrom(e.target.value)}
              aria-label="Source cryptocurrency"
              className="flex-1 min-w-[60px] p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] outline-none focus:border-[var(--primary)] text-sm transition-all appearance-none cursor-pointer">
              {SUPPORTED_CRYPTO_ASSETS.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
            </select>
            <motion.button whileTap={{ scale: 0.85 }}
              onClick={() => { const f = from; setFrom(to); setTo(f) }}
              aria-label="Swap cryptocurrency pair"
              className="p-3 rounded-xl bg-[var(--primary)] text-white text-lg flex items-center justify-center w-12 shadow-md shadow-[var(--glow)] interact-lift">⇄</motion.button>
            <select value={to} onChange={e => setTo(e.target.value)}
              aria-label="Target cryptocurrency"
              className="flex-1 min-w-[60px] p-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card2)] outline-none focus:border-[var(--primary)] text-sm transition-all appearance-none cursor-pointer">
              {SUPPORTED_CRYPTO_ASSETS.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
            </select>
          </div>

          {isNegative && (
            <div className="text-xs text-red-400">Please enter a non-negative cryptocurrency amount.</div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-xs opacity-60">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-3 h-3 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
              Updating prices from CoinGecko...
            </div>
          )}

          {result !== null && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="text-3xl font-bold gradient-horizontal bg-clip-text text-transparent">{fmt(result, 6)}</div>
              <div className="text-sm opacity-60">{amount} {from} = {fmt(result, 6)} {to}</div>
            </motion.div>
          )}

          {result === null && !loading && !isNegative && (
            <div className="text-center py-4 text-xs opacity-50">
              {status === 'unavailable' || status === 'error'
                ? 'Price data currently unavailable. Click Refresh below to retry.'
                : 'Enter a valid amount to calculate conversion.'}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Price table */}
      <GlassCard>
        <div className="text-xs font-semibold uppercase mb-2 opacity-60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Market Prices (USD)</span>
            <span className="inline-flex items-center gap-1.5 text-xs opacity-75 capitalize">
              <span className={`w-1.5 h-1.5 rounded-full ${
                status === 'live' ? 'bg-[var(--success)] animate-pulse' :
                status === 'cached' ? 'bg-blue-400' :
                status === 'stale' ? 'bg-amber-400' : 'bg-red-400'
              }`} />
              {status}
              {lastUpdated && <span className="opacity-60 font-normal">({lastUpdated.toLocaleTimeString()})</span>}
            </span>
          </div>
          <button
            onClick={() => refresh()}
            disabled={loading}
            aria-label="Refresh cryptocurrency prices"
            className="text-xs px-2.5 py-1 rounded-lg border border-[var(--border)] hover:bg-[var(--card2)] disabled:opacity-40 transition-all cursor-pointer font-normal normal-case"
          >
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>
        <div className="space-y-1">
          {SUPPORTED_CRYPTO_ASSETS.map(c => (
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
