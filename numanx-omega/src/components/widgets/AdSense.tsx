import { useEffect, useRef } from 'react'

interface Props {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  className?: string
  width?: number
  height?: number
}

export default function AdSense({ slot, format = 'auto', className = '', width, height }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  const isFixed = width && height

  useEffect(() => {
    if (initialized.current) return
    try {
      const win = window as any
      if (win.adsbygoogle) {
        win.adsbygoogle.push({})
        initialized.current = true
      }
    } catch {}
  }, [])

  return (
    <div className={`omega-ad-wrapper ${className}`} ref={ref}>
      <div className="text-[9px] uppercase tracking-wider opacity-20 text-center mb-1">— Sponsored —</div>
      <ins
        className="adsbygoogle"
        style={isFixed ? { display: 'inline-block', width, height } : { display: 'block' }}
        data-ad-client="ca-pub-9437859906171826"
        data-ad-slot={slot}
        {...(isFixed ? {} : { 'data-ad-format': format, 'data-full-width-responsive': 'true' })}
      />
    </div>
  )
}
