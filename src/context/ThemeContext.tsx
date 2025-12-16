'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  const { user, isAuthenticated } = useAuth()

  // Load theme from Firestore if authenticated, otherwise from localStorage
  useEffect(() => {
    const loadTheme = async () => {
      let initialTheme: Theme = 'light'

      // Try to load from localStorage first (for instant UI)
      const savedTheme = localStorage.getItem('theme') as Theme | null
      if (savedTheme) {
        initialTheme = savedTheme
        setThemeState(initialTheme)
        document.documentElement.setAttribute('data-theme', initialTheme)
      }

      // If authenticated, fetch from Firestore and override
      if (isAuthenticated && user?.id) {
        try {
          const userRef = doc(db, 'users', user.id)
          const userDoc = await getDoc(userRef)
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            if (userData.preferences?.theme) {
              initialTheme = userData.preferences.theme
              setThemeState(initialTheme)
              document.documentElement.setAttribute('data-theme', initialTheme)
              // Sync localStorage with Firestore value
              localStorage.setItem('theme', initialTheme)
            }
          }
        } catch (error) {
          console.error('Failed to load theme from Firestore:', error)
          // Fall back to localStorage value
        }
      }

      setMounted(true)
    }

    loadTheme()
  }, [isAuthenticated, user?.id])

  // Update document and persist when theme changes
  useEffect(() => {
    if (!mounted) return

    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)

    // Save to Firestore if authenticated
    if (isAuthenticated && user?.id) {
      const saveTheme = async () => {
        try {
          const userRef = doc(db, 'users', user.id)
          const userDoc = await getDoc(userRef)
          
          if (userDoc.exists()) {
            // Update existing user document
            await updateDoc(userRef, {
              'preferences.theme': theme,
              updatedAt: new Date().toISOString()
            })
          } else {
            // Create new user document with preferences
            await setDoc(userRef, {
              preferences: { theme },
              updatedAt: new Date().toISOString()
            }, { merge: true })
          }
        } catch (error) {
          console.error('Failed to save theme to Firestore:', error)
        }
      }
      
      saveTheme()
    }
  }, [theme, mounted, isAuthenticated, user?.id])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Return default theme instead of throwing
    // This allows components to work even if ThemeProvider isn't available yet
    return {
      theme: 'light' as Theme,
      toggleTheme: () => {},
      setTheme: () => {}
    }
  }
  return context
}

