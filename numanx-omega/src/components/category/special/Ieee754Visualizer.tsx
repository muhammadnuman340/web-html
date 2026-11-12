import { useState, useMemo } from 'react'

export default function Ieee754Visualizer() {
  const [val, setVal] = useState<number>(3.14159265)

  const { sign, exp, mantissa, expUnbiased, bitsString, hexString } = useMemo(() => {
    const floatView = new Float32Array(1)
    const uintView = new Uint32Array(floatView.buffer)
    floatView[0] = val
    const bits32 = uintView[0]
    const s = (bits32 >>> 31) & 1
    const e = (bits32 >>> 23) & 0xff
    const m = bits32 & 0x7fffff
    const eUnbiased = e - 127
    const fullBits = (bits32 >>> 0).toString(2).padStart(32, '0')
    const hex = (bits32 >>> 0).toString(16).toUpperCase().padStart(8, '0')

    return {
      sign: s,
      exp: e,
      mantissa: m,
      expUnbiased: eUnbiased,
      bitsString: fullBits,
      hexString: hex
    }
  }, [val])

  const signBit = bitsString.slice(0, 1)
  const expBits = bitsString.slice(1, 9)
  const mantissaBits = bitsString.slice(9)

  const PRESETS = [
    { label: '1.0', val: 1.0 },
    { label: '-1.0', val: -1.0 },
    { label: '0.1', val: 0.1 },
    { label: 'π (3.14159)', val: 3.14159265 },
    { label: '0.5', val: 0.5 },
    { label: '1024.0', val: 1024.0 },
  ]

  return (
    <section aria-labelledby="ieee754-tool-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="ieee754-tool-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">🧮</span> IEEE-754 Single-Precision (FP32) Bitfield Inspector
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Hardware-accurate breakdown of sign bit, biased exponent (bias 127), and normalized mantissa.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setVal(p.val)}
              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--card2)] hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] border border-[var(--border)] transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input control */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="w-full sm:w-1/2">
          <label className="text-xs text-[var(--text2)] font-medium mb-1 block">Floating Point Number Input</label>
          <input
            type="number"
            step="any"
            value={val}
            onChange={e => setVal(Number(e.target.value))}
            className="w-full px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-sm font-bold font-mono outline-none focus:border-[var(--primary)] tabular-nums"
          />
        </div>
        <div className="w-full sm:w-1/2 flex items-center gap-3">
          <div className="glass p-2.5 rounded-xl border border-[var(--border)] flex-1 text-center font-mono">
            <div className="text-[11px] text-[var(--text2)]">Hex Memory Word</div>
            <div className="text-sm font-bold text-amber-400 mt-0.5">0x{hexString}</div>
          </div>
          <div className="glass p-2.5 rounded-xl border border-[var(--border)] flex-1 text-center font-mono">
            <div className="text-[11px] text-[var(--text2)]">Unbiased Power (2^e)</div>
            <div className="text-sm font-bold text-blue-400 mt-0.5">2^{expUnbiased}</div>
          </div>
        </div>
      </div>

      {/* 32-Bit Visual Breakdown Bar */}
      <div className="space-y-2">
        <div className="text-xs text-[var(--text2)] font-medium">32-Bit Physical IEEE-754 Architecture (1 + 8 + 23):</div>
        <div className="flex rounded-xl overflow-hidden border border-[var(--border)] text-center font-mono text-xs font-bold leading-8 tracking-wider">
          <div className="bg-rose-500/20 text-rose-300 border-r border-rose-500/30 px-2" title="Sign Bit (1 bit)">
            {signBit}
          </div>
          <div className="bg-blue-500/20 text-blue-300 border-r border-blue-500/30 px-2 flex-1 break-all" title="Biased Exponent (8 bits)">
            {expBits}
          </div>
          <div className="bg-emerald-500/20 text-emerald-300 px-3 flex-[2.5] break-all" title="Fraction / Mantissa (23 bits)">
            {mantissaBits}
          </div>
        </div>
        <div className="flex justify-between text-[11px] font-mono px-1 text-[var(--text2)]">
          <span className="text-rose-400">Sign: {sign === 0 ? '+ (Positive)' : '- (Negative)'}</span>
          <span className="text-blue-400">Biased Exponent: {exp} (127 + {expUnbiased})</span>
          <span className="text-emerald-400">Mantissa: 0x{mantissa.toString(16).toUpperCase()}</span>
        </div>
      </div>

      {/* Mathematical Reconstruction Formula */}
      <div className="glass rounded-xl p-3 border border-[var(--border)] text-xs font-mono space-y-1">
        <div className="text-[var(--text2)] font-semibold">Mathematical Reconstruction:</div>
        <div className="text-[var(--text)]">
          Value = (-1)^{sign} × 2^({exp} - 127) × (1 + {mantissa} / 2^23)
        </div>
        <div className="text-[var(--primary)] font-bold">
          ≈ {val} (Stored in IEEE-754 Single Precision)
        </div>
      </div>
    </section>
  )
}
