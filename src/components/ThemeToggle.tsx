'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        backgroundColor: theme === 'dark' ? '#34D399' : '#E5E5E5',
        focusRingColor: theme === 'light' ? '#C9A961' : '#10B981'
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span
        className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg"
        style={{
          transform: theme === 'dark' ? 'translateX(2rem)' : 'translateX(0.25rem)'
        }}
      >
        <span className="flex h-full w-full items-center justify-center text-xs">
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </span>
    </button>
  )
}

