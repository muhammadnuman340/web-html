import { useRef, useCallback, useEffect, useState } from 'react'

export function useTilt<T extends HTMLElement>(maxTilt = 8) {
  const ref = useRef<T>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouse = useCallback((e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setTilt({
      x: -(y - 0.5) * maxTilt * 2,
      y: (x - 0.5) * maxTilt * 2,
    })
  }, [maxTilt])

  const handleLeave = useCallback(() => setTilt({ x: 0, y: 0 }), [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener('mousemove', handleMouse)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mousemove', handleMouse)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [handleMouse, handleLeave])

  const style = {
    transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
    transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.08s ease-out',
  }

  return { ref, tilt, style }
}
