import { useEffect, useState, useCallback } from 'react'

// Hook for touch gestures
export function useTouchGestures(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 50
) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > threshold
    const isRightSwipe = distanceX < -threshold
    const isUpSwipe = distanceY > threshold
    const isDownSwipe = distanceY < -threshold

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft()
    if (isRightSwipe && onSwipeRight) onSwipeRight()
    if (isUpSwipe && onSwipeUp) onSwipeUp()
    if (isDownSwipe && onSwipeDown) onSwipeDown()

    setTouchStart(null)
    setTouchEnd(null)
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return { touchStart, touchEnd }
}

// Hook for pinch gestures (zoom)
export function usePinchGesture(
  onPinch?: (scale: number, center: { x: number; y: number }) => void,
  onPinchEnd?: () => void
) {
  const [initialDistance, setInitialDistance] = useState<number | null>(null)
  const [currentScale, setCurrentScale] = useState(1)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      )
      setInitialDistance(distance)
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && initialDistance) {
      e.preventDefault()

      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const currentDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      )

      const scale = currentDistance / initialDistance
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      }

      setCurrentScale(scale)
      onPinch?.(scale, center)
    }
  }, [initialDistance, onPinch])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      setInitialDistance(null)
      onPinchEnd?.()
    }
  }, [onPinchEnd])

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return { currentScale }
}

// Hook for mobile viewport detection
export function useMobileViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    isPortrait: true,
    isMobile: false,
    isTablet: false,
    safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 }
  })

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isPortrait = height > width
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024

      // Get safe area insets for notched devices
      const testEl = document.createElement('div')
      testEl.style.cssText = `
        position: fixed;
        top: env(safe-area-inset-top);
        right: env(safe-area-inset-right);
        bottom: env(safe-area-inset-bottom);
        left: env(safe-area-inset-left);
        pointer-events: none;
        visibility: hidden;
      `
      document.body.appendChild(testEl)

      const computedStyle = getComputedStyle(testEl)
      const safeAreaInsets = {
        top: parseInt(computedStyle.top) || 0,
        right: parseInt(computedStyle.right) || 0,
        bottom: parseInt(computedStyle.bottom) || 0,
        left: parseInt(computedStyle.left) || 0
      }

      document.body.removeChild(testEl)

      setViewport({
        width,
        height,
        isPortrait,
        isMobile,
        isTablet,
        safeAreaInsets
      })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    window.addEventListener('orientationchange', updateViewport)

    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('orientationchange', updateViewport)
    }
  }, [])

  return viewport
}

// Hook for mobile-optimized scroll
export function useMobileScroll(
  onScroll?: (scrollY: number, direction: 'up' | 'down') => void,
  throttleMs = 16
) {
  const [scrollY, setScrollY] = useState(0)
  const [direction, setDirection] = useState<'up' | 'down'>('down')
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const currentDirection = currentScrollY > lastScrollY ? 'down' : 'up'

          setScrollY(currentScrollY)
          setDirection(currentDirection)
          setLastScrollY(currentScrollY)

          onScroll?.(currentScrollY, currentDirection)
          ticking = false
        })
        ticking = true
      }
    }

    // Throttle scroll events
    let scrollTimeout: NodeJS.Timeout
    const throttledScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScroll, throttleMs)
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', throttledScroll)
      clearTimeout(scrollTimeout)
    }
  }, [onScroll, throttleMs, lastScrollY])

  return { scrollY, direction }
}

// Hook for mobile keyboard detection
export function useMobileKeyboard() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const initialViewportHeight = window.visualViewport?.height || window.innerHeight

    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight
      const heightDifference = initialViewportHeight - currentHeight

      // Consider keyboard visible if height difference is significant
      const isVisible = heightDifference > 150
      setIsKeyboardVisible(isVisible)
      setKeyboardHeight(isVisible ? heightDifference : 0)
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
      return () => window.visualViewport!.removeEventListener('resize', handleViewportChange)
    } else {
      // Fallback for browsers without visualViewport
      window.addEventListener('resize', handleViewportChange)
      return () => window.removeEventListener('resize', handleViewportChange)
    }
  }, [])

  return { isKeyboardVisible, keyboardHeight }
}

// Utility function to get mobile-optimized animation props
export function getMobileOptimizedAnimation(
  isMobile: boolean,
  hasTouch: boolean,
  baseAnimation: any,
  touchAnimation?: any
) {
  if (!isMobile) return baseAnimation

  if (hasTouch && touchAnimation) {
    return touchAnimation
  }

  // Reduce complexity for mobile
  return {
    ...baseAnimation,
    transition: {
      ...baseAnimation.transition,
      duration: Math.max(0.1, baseAnimation.transition?.duration * 0.6),
      ease: 'easeOut'
    }
  }
}

// Hook for mobile gesture hints
export function useMobileGestureHints() {
  const [showHints, setShowHints] = useState(false)
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Show hints for first-time mobile users
    const isMobile = window.innerWidth < 768
    const hasSeenHints = localStorage.getItem('mobile-gesture-hints-seen')

    if (isMobile && !hasSeenHints) {
      setShowHints(true)
    }
  }, [])

  const dismissHint = (hintId: string) => {
    setDismissedHints(prev => new Set([...prev, hintId]))
    localStorage.setItem('mobile-gesture-hints-seen', 'true')
    setShowHints(false)
  }

  return {
    showHints,
    dismissedHints,
    dismissHint
  }
}