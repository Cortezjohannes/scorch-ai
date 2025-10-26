'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CollapsibleSectionProps {
  title: string
  icon?: string
  children: React.ReactNode
  isEmptyDefault?: boolean
  className?: string
}

/**
 * Collapsible section for forms - automatically collapses empty/default sections
 * to reduce visual clutter while keeping content accessible
 */
export default function CollapsibleSection({
  title,
  icon,
  children,
  isEmptyDefault = false,
  className = ''
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(!isEmptyDefault)

  return (
    <div className={`bg-[#1a1a1a] rounded-lg overflow-hidden ${className}`}>
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#242424] transition-colors group"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <h5 className="text-[#00FF99] font-bold">{title}</h5>
          {isEmptyDefault && !isExpanded && (
            <span className="text-xs text-white/40 ml-2">(click to expand)</span>
          )}
        </div>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/60 group-hover:text-white/80 transition-colors"
        >
          ▼
        </motion.span>
      </button>

      {/* Content - Collapsible */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-2 text-sm">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Helper function to check if a value is "empty" or placeholder
 */
export function isEmptyValue(value: any): boolean {
  if (!value) return true
  
  const str = String(value).trim().toLowerCase()
  
  const placeholders = [
    'tbd',
    'to be defined',
    'to be determined',
    'n/a',
    'none',
    'unknown',
    'average',
    'good',  // Default health/build values
    'middle class' // Default class value
  ]
  
  return placeholders.includes(str) || str.length === 0
}

/**
 * Helper function to check if an entire section is empty
 */
export function isSectionEmpty(obj: Record<string, any>, ignoreKeys: string[] = []): boolean {
  return Object.entries(obj).every(([key, value]) => {
    if (ignoreKeys.includes(key)) return true
    
    // Arrays: check if empty or all items are empty
    if (Array.isArray(value)) {
      return value.length === 0 || value.every(isEmptyValue)
    }
    
    // Objects: recursively check
    if (typeof value === 'object' && value !== null) {
      return isSectionEmpty(value, ignoreKeys)
    }
    
    // Primitive values
    return isEmptyValue(value)
  })
}







