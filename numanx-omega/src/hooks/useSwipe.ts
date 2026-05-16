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
  const startX = useRef(0)
  const startY = useRef(0)
  const distX = useRef(0)
  const distY = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      distX.current = e.touches[0].clientX - startX.current
      distY.current = e.touches[0].clientY - startY.current
    }

    const onTouchEnd = () => {
      const ax = Math.abs(distX.current)
      const ay = Math.abs(distY.current)

      if (ax > threshold && ax > ay * 1.5) {
        if (distX.current > 0 && handlers.onSwipeRight) handlers.onSwipeRight()
        else if (distX.current < 0 && handlers.onSwipeLeft) handlers.onSwipeLeft()
      } else if (ay > threshold && ay > ax * 1.5) {
        if (distY.current > 0 && handlers.onSwipeDown) handlers.onSwipeDown()
        else if (distY.current < 0 && handlers.onSwipeUp) handlers.onSwipeUp()
      }

      distX.current = 0
      distY.current = 0
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [ref.current, handlers.onSwipeLeft, handlers.onSwipeRight, handlers.onSwipeUp, handlers.onSwipeDown, threshold])
}
