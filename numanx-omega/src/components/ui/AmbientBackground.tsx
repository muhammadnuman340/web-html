import { useEffect, useRef } from 'react'

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let time = 0
    let primaryColor = '124, 111, 255'
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = []

    const getCSSVar = (name: string) => {
      try {
        const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
        if (val.startsWith('#')) {
          const hex = val.slice(1)
          const r = parseInt(hex.slice(0, 2), 16)
          const g = parseInt(hex.slice(2, 4), 16)
          const b = parseInt(hex.slice(4, 6), 16)
          return `${r}, ${g}, ${b}`
        }
        return val || '124, 111, 255'
      } catch { return '124, 111, 255' }
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const count = Math.min(25, Math.floor((canvas.width * canvas.height) / 50000))
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.2 + 0.03,
      })
    }

    const draw = () => {
      time += 0.002
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      primaryColor = getCSSVar('--primary')

      const hue1 = (Math.sin(time * 0.3) * 30 + 240) % 360
      const hue2 = (Math.sin(time * 0.3 + 2) * 30 + 320) % 360
      const grad = ctx.createRadialGradient(
        canvas.width * (0.5 + Math.sin(time * 0.2) * 0.2),
        canvas.height * (0.3 + Math.cos(time * 0.15) * 0.2),
        0,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.7,
      )
      grad.addColorStop(0, `hsla(${hue1}, 70%, 60%, 0.04)`)
      grad.addColorStop(0.5, `hsla(${hue2}, 70%, 50%, 0.02)`)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${primaryColor}, ${p.alpha})`
        ctx.fill()
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(${primaryColor}, ${(1 - dist / 150) * 0.06})`
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  )
}
