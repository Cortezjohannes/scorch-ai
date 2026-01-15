import { useState, useEffect } from 'react'
import { PreProductionTheme, ThemeConfig } from '@/types/preproduction'

/**
 * Pre-Production Theme Hook
 * 
 * Manages light/dark mode for pre-production pages.
 * Defaults to dark mode, persists in localStorage.
 */

const STORAGE_KEY = 'preproduction-theme'

const lightTheme: ThemeConfig = {
  theme: 'light',
  colors: {
    background: '#ffffff',
    backgroundSecondary: '#f5f5f5',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
    card: '#ffffff',
    accent: '#00FF99',
    accentSecondary: '#00CC7A'
  }
}

const darkTheme: ThemeConfig = {
  theme: 'dark',
  colors: {
    background: '#1a1a1a',
    backgroundSecondary: '#2a2a2a',
    text: '#e7e7e7',
    textSecondary: '#999999',
    border: '#36393f',
    card: '#2a2a2a',
    accent: '#00FF99',
    accentSecondary: '#00CC7A'
  }
}

export const usePreProductionTheme = () => {
  const [theme, setTheme] = useState<PreProductionTheme>('dark') // Default to dark
  
  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as PreProductionTheme
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved)
      }
    }
  }, [])
  
  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newTheme)
    }
  }
  
  // Get current theme config
  const themeConfig = theme === 'light' ? lightTheme : darkTheme
  
  return {
    theme,
    themeConfig,
    toggleTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark'
  }
}

