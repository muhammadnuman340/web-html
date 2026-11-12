import { useState, useMemo } from 'react'

export default function NumberBaseVisualizer() {
  const [decVal, setDecVal] = useState<number>(42)

  const binStr = useMemo(() => (decVal >>> 0).toString(2).padStart(8, '0'), [decVal])
  const hexStr = useMemo(() => (decVal >>> 0).toString(16).toUpperCase(), [decVal])
  const octStr = useMemo(() => (decVal >>> 0).toString(8), [decVal])

  // Gray code: n ^ (n >> 1)
  const grayCode = useMemo(() => {
    const g = (decVal >>> 0) ^ ((decVal >>> 0) >> 1)
    return (g >>> 0).toString(2).padStart(8, '0')
  }, [decVal])

  // BCD (Binary-Coded Decimal) representation
  const bcdStr = useMemo(() => {
    const s = Math.abs(decVal).toString()
    return s.split('').map(d => parseInt(d, 10).toString(2).padStart(4, '0')).join(' ')
  }, [decVal])

  // Toggle single bit in the 8-bit visualizer
  const toggleBit = (bitIndex: number) => {
    const mask = 1 << bitIndex
    setDecVal(prev => (prev ^ mask) & 0xff)
  }

  const PRESETS = [
    { label: '42 (Answer)', val: 42 },
    { label: '127 (Max 7-bit)', val: 127 },
    { label: '255 (Full Byte)', val: 255 },
    { label: '1024 (1 KiB)', val: 1024 },
    { label: '65535 (16-bit Max)', val: 65535 }
  ]

  return (
    <section aria-labelledby="number-base-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="number-base-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">🔢</span> Interactive Bit-Level Number Base & Radix Inspector
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Live interactive bit-toggle, Gray code generator, and multi-radix byte analyzer.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setDecVal(p.val)}
              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--card2)] hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] border border-[var(--border)] transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Decimal Numeric Input Slider & Field */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="w-full sm:w-1/2">
          <label className="text-xs text-[var(--text2)] font-medium mb-1 block">Decimal Value (0 - 255 byte window)</label>
          <input
            type="range"
            min="0"
            max="255"
            value={decVal > 255 ? 255 : decVal}
            onChange={e => setDecVal(Number(e.target.value))}
            className="w-full accent-[var(--primary)] cursor-pointer"
          />
        </div>
        <div className="w-full sm:w-1/2 flex items-center gap-2">
          <span className="text-xs text-[var(--text2)] font-mono">Dec:</span>
          <input
            type="number"
            value={decVal}
            onChange={e => setDecVal(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-sm font-bold font-mono outline-none focus:border-[var(--primary)] tabular-nums"
          />
        </div>
      </div>

      {/* 8-Bit Interactive Toggle Switch Bar */}
      <div className="glass rounded-xl p-3 border border-[var(--border)] space-y-2">
        <div className="flex justify-between items-center text-xs text-[var(--text2)]">
          <span className="font-semibold text-[var(--text)]">Interactive 8-Bit Register:</span>
          <span className="font-mono text-[11px]">Click any bit to flip</span>
        </div>
        <div className="grid grid-cols-8 gap-1.5 text-center">
          {[7, 6, 5, 4, 3, 2, 1, 0].map(bit => {
            const isSet = ((decVal >>> bit) & 1) === 1
            return (
              <button
                key={bit}
                onClick={() => toggleBit(bit)}
                className={`py-2 px-1 rounded-lg border font-mono transition-all ${
                  isSet
                    ? 'bg-[var(--primary)] text-white font-bold border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--card2)] text-[var(--text2)] border-[var(--border)] hover:border-[var(--primary)]/50'
                }`}
              >
                <div className="text-sm font-bold">{isSet ? '1' : '0'}</div>
                <div className="text-[10px] opacity-75 mt-0.5">2^{bit}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Multi-Base Translation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] font-medium">Binary (Base 2)</div>
          <div className="text-sm sm:text-base font-bold text-[var(--primary)] mt-1 font-mono tabular-nums break-all">
            {binStr}
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] font-medium">Hexadecimal (16)</div>
          <div className="text-sm sm:text-base font-bold text-amber-400 mt-1 font-mono tabular-nums">
            0x{hexStr}
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] font-medium">Octal (Base 8)</div>
          <div className="text-sm sm:text-base font-bold text-emerald-400 mt-1 font-mono tabular-nums">
            0o{octStr}
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] font-medium">Gray Code</div>
          <div className="text-sm sm:text-base font-bold text-purple-400 mt-1 font-mono tabular-nums break-all">
            {grayCode}
          </div>
        </div>
      </div>

      {/* BCD & ASCII info */}
      <div className="text-xs bg-[var(--card2)]/60 rounded-xl p-2.5 border border-[var(--border)] flex flex-wrap justify-between items-center gap-2 font-mono">
        <div>
          <span className="text-[var(--text2)]">BCD (8421): </span>
          <span className="font-bold text-[var(--text)]">{bcdStr}</span>
        </div>
        <div>
          <span className="text-[var(--text2)]">ASCII (if 0-127): </span>
          <span className="font-bold text-[var(--text)]">
            {decVal >= 32 && decVal <= 126 ? `'${String.fromCharCode(decVal)}'` : 'Non-printable'}
          </span>
        </div>
      </div>
    </section>
  )
}
