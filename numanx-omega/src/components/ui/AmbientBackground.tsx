import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  baseAlpha: number
  alpha: number
  pulseSpeed: number
  isBright: boolean
  color: string
}

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof document === 'undefined') return true
    const c = document.body.className
    // Active if dark, cosmic, or any dark-based theme; default to dark if unset
    return c === '' || c.includes('dark') || c.includes('theme-cosmic') || c.includes('theme-amoled') || c.includes('theme-cyberpunk') || c.includes('theme-rgb')
  })

  // Watch for theme class changes on body
  useEffect(() => {
    const checkTheme = () => {
      const c = document.body.className
      const dark = c === '' ? true : (c.includes('dark') || c.includes('theme-cosmic') || c.includes('theme-amoled') || c.includes('theme-cyberpunk') || c.includes('theme-rgb'))
      setIsDarkTheme(dark)
    }
    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let time = 0
    let width = window.innerWidth
    let height = window.innerHeight
    const particles: Particle[] = []

    const mouse = { x: -9999, y: -9999, active: false }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Responsive setup with device pixel ratio
    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      initParticles()
    }

    const initParticles = () => {
      particles.length = 0
      // Scale count smoothly between 30 (mobile) and 75 (large desktop)
      const targetCount = Math.min(75, Math.max(30, Math.floor((width * height) / 22000)))

      for (let i = 0; i < targetCount; i++) {
        const isBright = Math.random() < 0.18
        const r = isBright ? Math.random() * 1.2 + 1.8 : Math.random() * 0.9 + 0.8
        const baseAlpha = isBright ? Math.random() * 0.35 + 0.6 : Math.random() * 0.3 + 0.25

        // Star colors: electric cyan (#38bdf8), soft celestial blue (#93c5fd), bright white (#ffffff), soft lavender (#c084fc)
        const colors = isDarkTheme
          ? ['240, 246, 255', '56, 189, 248', '147, 197, 253', '192, 132, 252']
          : ['92, 76, 242', '124, 58, 237', '59, 130, 246']
        const color = colors[Math.floor(Math.random() * colors.length)]

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          r,
          baseAlpha,
          alpha: baseAlpha,
          pulseSpeed: Math.random() * 0.02 + 0.008,
          isBright,
          color,
        })
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const onPointerMove = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    }

    const onPointerLeave = () => {
      mouse.active = false
      mouse.x = -9999
      mouse.y = -9999
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })

    const maxDist = 135
    const maxDistSq = maxDist * maxDist
    const mouseDist = 145
    const mouseDistSq = mouseDist * mouseDist

    const render = () => {
      time += 1
      ctx.clearRect(0, 0, width, height)

      // Draw subtle ambient radial glow on canvas (top-center and bottom-right)
      if (isDarkTheme) {
        const glow1 = ctx.createRadialGradient(width * 0.5, height * 0.15, 0, width * 0.5, height * 0.15, width * 0.6)
        glow1.addColorStop(0, 'rgba(30, 58, 138, 0.12)')
        glow1.addColorStop(0.5, 'rgba(15, 23, 42, 0.04)')
        glow1.addColorStop(1, 'transparent')
        ctx.fillStyle = glow1
        ctx.fillRect(0, 0, width, height)
      }

      // Update particle positions
      const len = particles.length
      for (let i = 0; i < len; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        // Wrap around bounds with gentle margin
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        // Gentle breathing shimmer
        p.alpha = Math.max(0.1, p.baseAlpha + Math.sin(time * p.pulseSpeed + i) * 0.2)

        // Mouse interaction (gentle proximity push)
        if (mouse.active) {
          const mdx = p.x - mouse.x
          const mdy = p.y - mouse.y
          const mDistSq = mdx * mdx + mdy * mdy
          if (mDistSq < mouseDistSq && mDistSq > 0) {
            const mDist = Math.sqrt(mDistSq)
            const push = (1 - mDist / mouseDist) * 0.6
            p.x += (mdx / mDist) * push
            p.y += (mdy / mDist) * push

            // Draw connective line from star to mouse cursor
            const lineAlpha = (1 - mDist / mouseDist) * (isDarkTheme ? 0.35 : 0.2)
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.strokeStyle = isDarkTheme
              ? `rgba(56, 189, 248, ${lineAlpha})`
              : `rgba(92, 76, 242, ${lineAlpha})`
            ctx.lineWidth = 0.9
            ctx.stroke()
          }
        }
      }

      // Draw constellation plexus lines between particles
      for (let i = 0; i < len; i++) {
        const pi = particles[i]
        for (let j = i + 1; j < len; j++) {
          const pj = particles[j]
          const dx = pi.x - pj.x
          const dy = pi.y - pj.y
          const distSq = dx * dx + dy * dy

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq)
            const lineAlpha = (1 - dist / maxDist) * (isDarkTheme ? 0.16 : 0.08)
            ctx.beginPath()
            ctx.moveTo(pi.x, pi.y)
            ctx.lineTo(pj.x, pj.y)
            ctx.strokeStyle = isDarkTheme
              ? `rgba(125, 160, 240, ${lineAlpha})`
              : `rgba(92, 76, 242, ${lineAlpha})`
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
        }
      }

      // Draw stars / nodes
      for (let i = 0; i < len; i++) {
        const p = particles[i]

        // Outer soft glow halo for bright stars
        if (p.isBright && isDarkTheme) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 2.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha * 0.22})`
          ctx.fill()
        }

        // Star core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`
        ctx.fill()
      }

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render)
      }
    }

    render()

    // Pause animation when tab is inactive to save battery and GPU cycles
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId)
      } else if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isDarkTheme])

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
      style={{
        backgroundColor: isDarkTheme ? '#060919' : 'transparent',
        transition: 'background-color 0.4s ease',
      }}
    >
      {/* Layer 1: Ambient Cosmic Space Glows */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: isDarkTheme
            ? 'radial-gradient(circle at 50% -10%, rgba(30, 58, 138, 0.35) 0%, rgba(14, 22, 50, 0.15) 50%, transparent 80%), radial-gradient(circle at 85% 35%, rgba(99, 102, 241, 0.12) 0%, transparent 55%), radial-gradient(circle at 15% 75%, rgba(56, 189, 248, 0.08) 0%, transparent 50%)'
            : 'radial-gradient(circle at 50% 0%, rgba(92, 76, 242, 0.05) 0%, transparent 60%)',
          opacity: 1,
        }}
      />

      {/* Layer 2: Precision Dot Matrix Grid (Image 1) */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          backgroundImage: isDarkTheme
            ? 'radial-gradient(circle, rgba(140, 168, 235, 0.22) 1.25px, transparent 1.25px)'
            : 'radial-gradient(circle, rgba(92, 76, 242, 0.08) 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          backgroundPosition: '0 0',
          maskImage: 'radial-gradient(ellipse at 50% 35%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,0.3) 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 35%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,0.3) 100%)',
          opacity: 0.95,
        }}
      />

      {/* Layer 3: Dynamic Constellation Plexus Particle Canvas (Images 2 & 3) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}
