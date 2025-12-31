'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMobileViewport, useTouchGestures, useMobileGestureHints, getMobileOptimizedAnimation } from './mobile-utils'
import { useAnimationPerformance } from './performance-utils'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  enableTouchGestures?: boolean
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  showMobileHints?: boolean
  mobileLayout?: 'stack' | 'grid' | 'single-column'
  tabletLayout?: 'grid' | 'single-column'
  desktopLayout?: 'full-width' | 'centered'
}

export default function ResponsiveContainer({
  children,
  className = '',
  enableTouchGestures = false,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  showMobileHints = true,
  mobileLayout = 'single-column',
  tabletLayout = 'single-column',
  desktopLayout = 'full-width'
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isPortrait, safeAreaInsets } = useMobileViewport()
  const { showHints, dismissHint } = useMobileGestureHints()
  const { isMobile: perfIsMobile, hasTouch, getOptimizedProps } = useAnimationPerformance()

  // Touch gesture handling
  useTouchGestures(
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    isMobile ? 30 : 50 // Lower threshold on mobile
  )

  // Determine layout based on screen size
  const getLayout = () => {
    if (isMobile) return mobileLayout
    if (isTablet) return tabletLayout
    return desktopLayout
  }

  const layout = getLayout()

  // Container styles based on layout and device
  const getContainerStyles = () => {
    const baseStyles = {
      paddingTop: safeAreaInsets.top,
      paddingBottom: safeAreaInsets.bottom,
      paddingLeft: safeAreaInsets.left,
      paddingRight: safeAreaInsets.right
    }

    switch (layout) {
      case 'stack':
        return {
          ...baseStyles,
          display: 'flex',
          flexDirection: 'column' as const,
          gap: isMobile ? '1rem' : '2rem',
          padding: isMobile ? '1rem' : '2rem'
        }
      case 'grid':
        return {
          ...baseStyles,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: isMobile ? '1rem' : '2rem',
          padding: isMobile ? '1rem' : '2rem'
        }
      case 'single-column':
        return {
          ...baseStyles,
          maxWidth: isMobile ? '100%' : isTablet ? '768px' : '1200px',
          margin: '0 auto',
          padding: isMobile ? '1rem' : '2rem'
        }
      case 'centered':
        return {
          ...baseStyles,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem'
        }
      case 'full-width':
      default:
        return {
          ...baseStyles,
          width: '100%',
          padding: isMobile ? '1rem' : '2rem'
        }
    }
  }

  const containerStyles = getContainerStyles()

  // Mobile gesture hints overlay
  const renderMobileHints = () => {
    if (!showMobileHints || !showHints || !isMobile) return null

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full text-center"
          >
            <div className="text-4xl mb-4">👆</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Touch Gestures</h3>
            <p className="text-gray-600 text-sm mb-4">
              Swipe left/right to navigate sections, pinch to zoom in interactive areas
            </p>
            <button
              onClick={() => dismissHint('touch-gestures')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Got it!
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Touch gesture indicators (subtle hints)
  const renderTouchIndicators = () => {
    if (!enableTouchGestures || !isMobile || !hasTouch) return null

    return (
      <div className="fixed bottom-4 right-4 z-40 flex flex-col space-y-2">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2 }}
          className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg"
        >
          <div className="text-xs text-gray-600 whitespace-nowrap">
            👈 Swipe to navigate
          </div>
        </motion.div>
      </div>
    )
  }

  // Orientation warning for mobile
  const renderOrientationWarning = () => {
    if (!isMobile || isPortrait) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-bold mb-2">Rotate to Portrait</h3>
          <p className="text-white/80">This experience works best in portrait mode</p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      {/* Orientation warning */}
      {renderOrientationWarning()}

      {/* Mobile gesture hints */}
      {renderMobileHints()}

      {/* Main container */}
      <motion.div
        className={className}
        style={containerStyles}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Responsive content wrapper */}
        <div
          className={`
            w-full
            ${isMobile ? 'space-y-4' : 'space-y-6'}
            ${layout === 'single-column' ? 'max-w-4xl mx-auto' : ''}
          `}
        >
          {children}
        </div>
      </motion.div>

      {/* Touch indicators */}
      {renderTouchIndicators()}

      {/* Mobile-optimized styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .responsive-container {
            font-size: 14px;
          }

          .responsive-container * {
            touch-action: manipulation;
          }

          /* Prevent zoom on double-tap */
          .responsive-container button,
          .responsive-container [role="button"] {
            touch-action: manipulation;
          }
        }

        @media (max-width: 480px) {
          .responsive-container {
            font-size: 13px;
          }
        }

        /* Safe area adjustments for notched devices */
        @supports (padding: max(0px)) {
          .responsive-container {
            padding-top: max(1rem, env(safe-area-inset-top));
            padding-bottom: max(1rem, env(safe-area-inset-bottom));
            padding-left: max(1rem, env(safe-area-inset-left));
            padding-right: max(1rem, env(safe-area-inset-right));
          }
        }
      `}</style>
    </>
  )
}

// HOC for making any component responsive
export function withResponsive<P extends object>(
  Component: React.ComponentType<P>,
  responsiveOptions: Omit<ResponsiveContainerProps, 'children'>
) {
  return function ResponsiveComponent(props: P) {
    return (
      <ResponsiveContainer {...responsiveOptions}>
        <Component {...props} />
      </ResponsiveContainer>
    )
  }
}

// Hook for responsive behavior
export function useResponsiveBehavior() {
  const { isMobile, isTablet, isPortrait } = useMobileViewport()
  const { shouldReduceAnimations } = useAnimationPerformance()

  return {
    isMobile,
    isTablet,
    isPortrait,
    shouldReduceAnimations,
    layout: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop' as 'mobile' | 'tablet' | 'desktop',
    getResponsiveValue: <T,>(mobile: T, tablet: T, desktop: T): T => {
      if (isMobile) return mobile
      if (isTablet) return tablet
      return desktop
    }
  }
}