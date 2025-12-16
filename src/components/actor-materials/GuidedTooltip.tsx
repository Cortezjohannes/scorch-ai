'use client'

import React, { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'

interface GuidedTooltipProps {
  term: string
  explanation: string
  children: React.ReactNode
}

export default function GuidedTooltip({ term, explanation, children }: GuidedTooltipProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <span className="relative inline-block group">
      <span
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="underline decoration-dotted cursor-help"
      >
        {children}
      </span>
      {isHovered && (
        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg ${prefix}-card border ${prefix}-border shadow-lg z-50 w-64`}>
          <div className={`font-semibold mb-1 ${prefix}-text-primary`}>{term}</div>
          <div className={`text-xs ${prefix}-text-secondary`}>{explanation}</div>
          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-${prefix === 'dark' ? '[#1a1a1a]' : '[#F2F3F5]'}`} />
        </div>
      )}
    </span>
  )
}

