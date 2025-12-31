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

import { useEffect, useState, memo, type ComponentType } from 'react'

// Track if we're on the client side - check at module load time
const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'

// Simple passthrough component for server-side rendering
function createPassthroughComponent(elementName: string): ComponentType<any> {
  return function PassthroughComponent(props: any) {
    const { 
      initial, animate, transition, whileHover, whileTap, exit, 
      variants, layout, layoutId, layoutDependency, layoutScroll, 
      layoutRoot, drag, dragConstraints, dragElastic, dragMomentum,
      dragPropagation, dragDirectionLock, dragTransition, ...rest 
    } = props
    const Component = elementName as any
    return <Component {...rest} />
  }
}

// Cache for framer-motion module - only on client
let framerMotionModule: any = null
let motionModulePromise: Promise<any> | null = null

const loadFramerMotion = (): Promise<any> => {
  // Never load on server
  if (!isClient) {
    return Promise.resolve(null)
  }
  
  // Return cached module if available
  if (framerMotionModule) {
    return Promise.resolve(framerMotionModule)
  }
  
  // Return existing promise if already loading
  if (motionModulePromise) {
    return motionModulePromise
  }
  
  // Create new promise to load framer-motion
  motionModulePromise = import('framer-motion')
    .then((mod) => {
      framerMotionModule = mod
      return mod
    })
    .catch((e) => {
      console.warn('Failed to load framer-motion:', e)
      motionModulePromise = null
      return null
    })
  
  return motionModulePromise
}

// Motion component factory that only loads framer-motion on client
function createMotionComponent(elementName: string) {
  // On server, return passthrough immediately
  if (!isClient) {
    return createPassthroughComponent(elementName)
  }

  const MotionComponent = memo(function (props: any) {
    const [motionLoaded, setMotionLoaded] = useState(false)
    const [MotionElement, setMotionElement] = useState<any>(null)
    const [isMounted, setIsMounted] = useState(false)
    
    useEffect(() => {
      // Double-check we're on client
      if (typeof window === 'undefined' || typeof document === 'undefined') return
      
      // Use a longer delay to ensure React is fully initialized and context is available
      const timeoutId = setTimeout(() => {
        setIsMounted(true)
        
        // Load framer-motion after mount with additional delay to ensure React context is ready
        const loadMotion = async () => {
          try {
            // Wait multiple ticks to ensure React context is fully initialized
            await new Promise(resolve => setTimeout(resolve, 10))
            
            const mod = await loadFramerMotion()
            if (mod && mod.motion) {
              const MotionComp = (mod.motion as any)[elementName]
              if (MotionComp) {
                setMotionElement(() => MotionComp)
                setMotionLoaded(true)
              }
            }
          } catch (err) {
            console.warn(`Failed to load motion component ${elementName}:`, err)
          }
        }
        
        loadMotion()
      }, 50) // 50ms delay to ensure React is ready
      
      return () => clearTimeout(timeoutId)
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
    if (!isMounted || !motionLoaded || !MotionElement) {
      return <Component {...rest} />
    }

    // On client with motion loaded, render with motion
    return <MotionElement {...props} />
  })
  
  // Set display name for debugging
  MotionComponent.displayName = `ClientMotion.${elementName}`
  
  return MotionComponent
}

// Create motion object with lazy getters
const motionObj: any = {}
const elementNames = ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 
  'button', 'a', 'section', 'nav', 'header', 'footer', 'main', 'ul', 'li', 
  'form', 'input', 'textarea', 'label', 'select', 'img', 'svg', 'article', 
  'aside', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'circle', 'rect', 'path', 'line', 'polyline', 'polygon', 'ellipse', 'g', 'text', 'tspan']

// Create components lazily - only when accessed
elementNames.forEach((name) => {
  let component: any = null
  Object.defineProperty(motionObj, name, {
    get() {
      if (!component) {
        component = createMotionComponent(name)
      }
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
    // Only run on client
    if (!isClient || typeof window === 'undefined' || typeof document === 'undefined') return
    
    // Use a longer delay to ensure React is fully initialized
    const timeoutId = setTimeout(() => {
      setIsMounted(true)
      
      // Load framer-motion after mount with additional delay
      const loadAnimatePresence = async () => {
        try {
          // Wait multiple ticks to ensure React context is fully initialized
          await new Promise(resolve => setTimeout(resolve, 10))
          
          const mod = await loadFramerMotion()
          if (mod && mod.AnimatePresence) {
            setAnimatePresenceComponent(() => mod.AnimatePresence)
          }
        } catch (err) {
          console.warn('Failed to load AnimatePresence:', err)
        }
      }
      
      loadAnimatePresence()
    }, 50) // 50ms delay to ensure React is ready
    
    return () => clearTimeout(timeoutId)
  }, [])

  // During SSR, just render children without animation
  if (!isMounted || !AnimatePresenceComponent) {
    return <>{children}</>
  }

  return <AnimatePresenceComponent {...props}>{children}</AnimatePresenceComponent>
}

