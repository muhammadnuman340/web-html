import { useEffect, useRef, useState } from 'react'

function formatVal(v: number, d: number) {
  return v.toFixed(d)
}

export default function AnimatedNumber({ value, duration = 300, decimals = 2 }: { value: number | null; duration?: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prevValue = useRef(value)
  const isInvalid = value === null || value === undefined || !isFinite(value)
  const [display, setDisplay] = useState(isInvalid ? '—' : formatVal(value, decimals))

  useEffect(() => {
    if (isInvalid) return
    const from = prevValue.current !== null && isFinite(prevValue.current) ? prevValue.current : value
    const to = value!
    prevValue.current = value
    if (from === to) return

    const start = performance.now()
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = from + (to - from) * eased
      setDisplay(formatVal(current, decimals))
      if (t < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value, duration, decimals, isInvalid])

  return <span ref={ref} className="tabular-nums">{display}</span>
}

function formatVal(v: number, d: number) {
  return v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: d })
}
