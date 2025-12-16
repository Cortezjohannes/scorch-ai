/**
 * Client-only framer-motion wrapper
 * 
 * This module provides a drop-in replacement for framer-motion that
 * prevents SSR/build-time errors by only loading framer-motion on the client.
 * 
 * Usage: Replace `import { motion, AnimatePresence } from 'framer-motion'` 
 * with `import { motion, AnimatePresence } from '@/components/ui/ClientMotion'`
 */

'use client'

import { useEffect, useState, useMemo, memo } from 'react'

// Cache for motion components to prevent recreation on every render
const motionComponentCache = new Map<string, any>()

// Motion component factory that only loads framer-motion on client
// This function is completely inert until the component actually renders
function createMotionComponent(elementName: string) {
  // Return cached component if it exists
  if (motionComponentCache.has(elementName)) {
    return motionComponentCache.get(elementName)
  }

  // Return a component that never imports framer-motion during SSR/build
  const MotionComponent = memo(function (props: any) {
    // Use a ref to track if we've loaded motion to avoid re-renders
    const [motionLoaded, setMotionLoaded] = useState(false)
    const [MotionElement, setMotionElement] = useState<any>(null)
    
    useEffect(() => {
      // Only run on client after mount
      if (typeof window === 'undefined') return
      
      // Dynamically import framer-motion only on client
      const loadMotion = async () => {
        try {
          const mod = await import('framer-motion')
          const MotionComp = (mod.motion as any)[elementName]
          if (MotionComp) {
            setMotionElement(() => MotionComp)
            setMotionLoaded(true)
          }
        } catch (e) {
          console.warn('Failed to load framer-motion:', e)
        }
      }
      
      loadMotion()
    }, [])

    // Strip motion props during SSR/build
    const { 
      initial, animate, transition, whileHover, whileTap, exit, 
      variants, layout, layoutId, layoutDependency, layoutScroll, 
      layoutRoot, drag, dragConstraints, dragElastic, dragMomentum,
      dragPropagation, dragDirectionLock, dragTransition, ...rest 
    } = props
    
    const Component = elementName as any

    // During SSR/build or before motion loads, render regular element
    if (!motionLoaded || !MotionElement) {
      return <Component {...rest} />
    }

    // On client with motion loaded, render with motion
    return <MotionElement {...props} />
  })
  
  // Set display name for debugging
  MotionComponent.displayName = `ClientMotion.${elementName}`
  
  // Cache the component
  motionComponentCache.set(elementName, MotionComponent)
  
  return MotionComponent
}

// Create motion object with lazy getters that don't evaluate until accessed
// Use Object.defineProperty to create truly lazy getters
const motionObj: any = {}
const elementNames = ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 
  'button', 'a', 'section', 'nav', 'header', 'footer', 'main', 'ul', 'li', 
  'form', 'input', 'textarea', 'label', 'select', 'img', 'svg', 'article', 
  'aside', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'circle', 'rect', 'path', 'line', 'polyline', 'polygon', 'ellipse', 'g', 'text', 'tspan']

// Pre-create and cache all motion components to prevent flickering
elementNames.forEach((name) => {
  const component = createMotionComponent(name)
  Object.defineProperty(motionObj, name, {
    get() {
      return component
    },
    enumerable: true,
    configurable: true
  })
})

export const motion = motionObj

// AnimatePresence wrapper
export function AnimatePresence({ children, ...props }: any) {
  const [AnimatePresenceComponent, setAnimatePresenceComponent] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Only import framer-motion after component mounts (client-side only)
    if (typeof window !== 'undefined') {
      import('framer-motion').then((mod) => {
        setAnimatePresenceComponent(() => mod.AnimatePresence)
      })
    }
  }, [])

  // During SSR, just render children without animation
  if (!isMounted || !AnimatePresenceComponent) {
    return <>{children}</>
  }

  return <AnimatePresenceComponent {...props}>{children}</AnimatePresenceComponent>
}

