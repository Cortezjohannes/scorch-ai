import { useEffect, useState, useCallback } from 'react'

// Hook to detect if user prefers reduced motion
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Hook for lazy loading with intersection observer
export function useLazyLoad(options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [element, setElement] = useState<Element | null>(null)

  const observer = useCallback(
    (node: Element | null) => {
      if (node) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            setIsIntersecting(entry.isIntersecting)
          },
          {
            threshold: 0.1,
            rootMargin: '50px',
            ...options
          }
        )

        observer.observe(node)
        setElement(node)

        return () => observer.disconnect()
      }
    },
    [options]
  )

  return [observer, isIntersecting] as const
}

// Hook for debouncing values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for throttling function calls
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [throttledFunction] = useState(() => {
    let timeoutId: NodeJS.Timeout | null = null
    let lastExecTime = 0

    return ((...args: Parameters<T>) => {
      const currentTime = Date.now()

      if (currentTime - lastExecTime > delay) {
        callback(...args)
        lastExecTime = currentTime
      } else {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          callback(...args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
      }
    }) as T
  })

  return throttledFunction
}

// Hook for preloading images
export function useImagePreloader(srcs: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (srcs.length === 0) {
      setLoading(false)
      return
    }

    let loadedCount = 0
    const totalCount = srcs.length
    const newLoadedImages = new Set<string>()

    const preloadImage = (src: string) => {
      const img = new Image()
      img.onload = () => {
        newLoadedImages.add(src)
        loadedCount++
        if (loadedCount === totalCount) {
          setLoadedImages(newLoadedImages)
          setLoading(false)
        }
      }
      img.onerror = () => {
        loadedCount++
        if (loadedCount === totalCount) {
          setLoadedImages(newLoadedImages)
          setLoading(false)
        }
      }
      img.src = src
    }

    srcs.forEach(preloadImage)
  }, [srcs])

  return { loadedImages, loading }
}

// Hook for optimizing scroll handlers
export function useOptimizedScroll(callback: () => void, throttleMs = 16) {
  const throttledCallback = useThrottle(callback, throttleMs)

  useEffect(() => {
    window.addEventListener('scroll', throttledCallback, { passive: true })
    return () => window.removeEventListener('scroll', throttledCallback)
  }, [throttledCallback])
}

// Hook for detecting device capabilities
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isMobile: false,
    isTablet: false,
    hasTouch: false,
    prefersReducedMotion: false,
    lowPowerMode: false,
    highPerformanceGPU: false
  })

  useEffect(() => {
    const updateCapabilities = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isTablet = hasTouch && window.innerWidth >= 768 && window.innerWidth < 1024

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Check for high performance GPU (rough estimation)
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      const highPerformanceGPU = gl ? true : false

      setCapabilities({
        isMobile,
        isTablet,
        hasTouch,
        prefersReducedMotion,
        lowPowerMode: false, // Would need battery API or other detection
        highPerformanceGPU
      })
    }

    updateCapabilities()
    window.addEventListener('resize', updateCapabilities)
    return () => window.removeEventListener('resize', updateCapabilities)
  }, [])

  return capabilities
}

// Utility function to conditionally apply animations based on performance
export function getOptimizedAnimation(
  prefersReducedMotion: boolean,
  isMobile: boolean,
  baseAnimation: any,
  reducedAnimation: any = {}
) {
  if (prefersReducedMotion) {
    return reducedAnimation
  }

  if (isMobile) {
    // Simplify animations on mobile
    return {
      ...baseAnimation,
      transition: {
        ...baseAnimation.transition,
        duration: Math.max(0.1, baseAnimation.transition?.duration * 0.5)
      }
    }
  }

  return baseAnimation
}

// Hook for managing animation performance
export function useAnimationPerformance() {
  const { prefersReducedMotion, isMobile, hasTouch } = useDeviceCapabilities()

  const getOptimizedProps = useCallback(
    (animationProps: any) => {
      if (prefersReducedMotion) {
        return {
          initial: false,
          animate: false,
          exit: false,
          ...animationProps.reduced
        }
      }

      if (isMobile) {
        return {
          ...animationProps,
          transition: {
            ...animationProps.transition,
            duration: Math.max(0.1, (animationProps.transition?.duration || 0.3) * 0.7),
            ease: 'easeOut'
          }
        }
      }

      return animationProps
    },
    [prefersReducedMotion, isMobile]
  )

  return {
    prefersReducedMotion,
    isMobile,
    hasTouch,
    getOptimizedProps,
    shouldReduceAnimations: prefersReducedMotion || isMobile
  }
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16.67) {
        console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`)
      }
    }
  }, [componentName])
}