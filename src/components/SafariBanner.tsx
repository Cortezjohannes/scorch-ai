'use client'

import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { ThemeContext } from '@/context/ThemeContext'

/**
 * Detects if the user is using Safari browser
 */
function isSafari(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isSafariUA = /safari/.test(userAgent)
  const isChromeUA = /chrome/.test(userAgent)
  const isEdgeUA = /edge/.test(userAgent)
  const isOperaUA = /opr/.test(userAgent)
  
  // Safari detection: has 'safari' but not 'chrome', 'edge', or 'opr'
  return isSafariUA && !isChromeUA && !isEdgeUA && !isOperaUA
}

export function SafariBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  
  // Safely get theme context
  let prefix = 'light'
  try {
    const themeContext = useContext(ThemeContext)
    if (themeContext) {
      prefix = themeContext.theme === 'dark' ? 'dark' : 'light'
    }
  } catch (e) {
    // Context not available, use default
    prefix = 'light'
  }

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('safari-banner-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
      return
    }

    // Check if user is on Safari
    if (isSafari()) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('safari-banner-dismissed', 'true')
  }

  if (!isVisible || isDismissed) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6">
      <div className={`${prefix}-card border ${prefix}-border rounded-lg shadow-lg max-w-4xl mx-auto p-4 flex items-center justify-between gap-4`}>
        <div className="flex-1">
          <p className={`${prefix}-text-primary text-sm sm:text-base`}>
            <span className="font-semibold">Greenlit works best when used on a desktop or tablet.</span> For the best experience, please use Google Chrome or any Chromium browser.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className={`${prefix}-text-secondary hover:${prefix}-text-primary transition-colors flex-shrink-0 p-1 rounded hover:bg-opacity-10 hover:bg-gray-500`}
          aria-label="Dismiss banner"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}



