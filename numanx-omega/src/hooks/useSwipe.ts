import { useEffect, useRef } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export function useSwipe(
  ref: React.RefObject<HTMLElement | null>,
  handlers: SwipeHandlers,
  threshold = 60
) {
  const handlersRef = useRef(handlers)
  const thresholdRef = useRef(threshold)

  useEffect(() => {
    handlersRef.current = handlers
    thresholdRef.current = threshold
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let startX = 0
    let startY = 0
    let distX = 0
    let distY = 0

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      distX = e.touches[0].clientX - startX
      distY = e.touches[0].clientY - startY
    }

    const onTouchEnd = () => {
      const ax = Math.abs(distX)
      const ay = Math.abs(distY)
      const t = thresholdRef.current
      const h = handlersRef.current

      if (ax > t && ax > ay * 1.5) {
        if (distX > 0 && h.onSwipeRight) h.onSwipeRight()
        else if (distX < 0 && h.onSwipeLeft) h.onSwipeLeft()
      } else if (ay > t && ay > ax * 1.5) {
        if (distY > 0 && h.onSwipeDown) h.onSwipeDown()
        else if (distY < 0 && h.onSwipeUp) h.onSwipeUp()
      }

      distX = 0
      distY = 0
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [ref])
}
