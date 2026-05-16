import { useMemo } from 'react'

interface Props {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}

export default function Sparkline({ data, width = 80, height = 24, color, className }: Props) {
  const path = useMemo(() => {
    if (!data || data.length < 2) return ''
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const stepX = width / (data.length - 1)
    return data.map((v, i) => {
      const x = i * stepX
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
  }, [data, width, height])

  if (!data || data.length < 2) return null

  const strokeColor = color || 'var(--primary)'

  return (
    <svg width={width} height={height} className={className} style={{ overflow: 'visible' }}>
      <path d={path} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Gradient fill under line */}
      <defs>
        <linearGradient id={`spark-grad-${width}-${height}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${width},${height} L0,${height} Z`} fill={`url(#spark-grad-${width}-${height})`} />
    </svg>
  )
}
