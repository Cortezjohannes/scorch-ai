'use client'

import React from 'react'
import { motion } from '@/components/ui/ClientMotion'
import { useTheme } from '@/context/ThemeContext'

export default function GlobalThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        color: isDark ? '#10B981' : '#000000',
        focusRingColor: isDark ? '#10B981' : '#C9A961'
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
        className="text-lg"
      >
        {isDark ? '🌙' : '☀️'}
      </motion.div>
    </button>
  )
}

