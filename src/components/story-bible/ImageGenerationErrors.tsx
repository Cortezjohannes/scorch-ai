/**
 * Image Generation Errors Component
 * 
 * Displays and allows recovery from image generation errors
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, RefreshCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export interface GenerationError {
  item: string
  error: string
  section: 'hero' | 'characters' | 'arcs' | 'world'
}

interface ImageGenerationErrorsProps {
  errors: GenerationError[]
  onRetry: (error: GenerationError) => Promise<void>
  onRetryAll: () => Promise<void>
  onDismiss: () => void
  isRetrying?: boolean
  retryingItem?: string
}

export default function ImageGenerationErrors({
  errors,
  onRetry,
  onRetryAll,
  onDismiss,
  isRetrying = false,
  retryingItem
}: ImageGenerationErrorsProps) {
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set())

  if (errors.length === 0) {
    return null
  }

  const visibleErrors = errors.filter(
    (err, index) => !dismissedErrors.has(`${err.section}-${err.item}-${index}`)
  )

  if (visibleErrors.length === 0) {
    return null
  }

  const handleDismiss = (error: GenerationError, index: number) => {
    setDismissedErrors(prev => new Set([...prev, `${error.section}-${error.item}-${index}`]))
    if (visibleErrors.length === 1) {
      setTimeout(onDismiss, 300) // Delay to allow animation
    }
  }

  const sectionLabels: Record<string, string> = {
    hero: 'Hero Image',
    characters: 'Character Portraits',
    arcs: 'Arc Key Art',
    world: 'Location Concepts'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${prefix}-card ${prefix}-border border-l-4 border-red-500 rounded-lg p-4 mb-4`}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className={`${prefix}-text-primary font-semibold mb-2`}>
              {visibleErrors.length} Image Generation Error{visibleErrors.length > 1 ? 's' : ''}
            </h3>
            
            <div className="space-y-2 mb-4">
              {visibleErrors.map((error, index) => (
                <div
                  key={`${error.section}-${error.item}-${index}`}
                  className={`${prefix}-bg-secondary ${prefix}-border rounded p-3 flex items-start justify-between gap-3`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${prefix}-text-primary font-medium text-sm`}>
                        {error.item}
                      </span>
                      <span className={`${prefix}-text-tertiary text-xs px-2 py-0.5 rounded ${prefix}-bg-tertiary`}>
                        {sectionLabels[error.section] || error.section}
                      </span>
                    </div>
                    <p className={`${prefix}-text-secondary text-xs`}>
                      {error.error}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onRetry(error)}
                      disabled={isRetrying && retryingItem === error.item}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                        isRetrying && retryingItem === error.item
                          ? `${prefix}-bg-tertiary ${prefix}-text-tertiary cursor-not-allowed`
                          : `bg-red-500/20 text-red-400 hover:bg-red-500/30`
                      }`}
                      title="Retry this image"
                    >
                      {isRetrying && retryingItem === error.item ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" />
                          Retry
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDismiss(error, index)}
                      disabled={isRetrying}
                      className={`${prefix}-text-tertiary hover:${prefix}-text-primary transition-colors p-1`}
                      title="Dismiss error"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {visibleErrors.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onRetryAll}
                  disabled={isRetrying}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isRetrying
                      ? `${prefix}-bg-tertiary ${prefix}-text-tertiary cursor-not-allowed`
                      : `bg-red-500 text-white hover:bg-red-600`
                  }`}
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Retrying All...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Retry All Failed Images
                    </>
                  )}
                </button>
                
                <button
                  onClick={onDismiss}
                  disabled={isRetrying}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${prefix}-btn-secondary`}
                >
                  Dismiss All
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Success notification component
 */
export function ImageGenerationSuccess({
  message,
  onDismiss
}: {
  message: string
  onDismiss: () => void
}) {
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${prefix}-card ${prefix}-border border-l-4 border-green-500 rounded-lg p-4 mb-4`}
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className={`${prefix}-text-primary font-medium`}>{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className={`${prefix}-text-tertiary hover:${prefix}-text-primary transition-colors`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}




































