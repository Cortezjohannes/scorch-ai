'use client'

import { useCallback, useEffect, useState } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeContext } from '@/context/ThemeContext'
import { useContext } from 'react'
import { SafariBanner } from '@/components/SafariBanner'
import { ChatProvider } from '@/context/ChatContext'
import ChatWidget from '@/components/chat/ChatWidget'

// Polyfill for EmptyRanges to prevent Safari/iOS errors
// This variable may be referenced by video player libraries or range APIs
if (typeof window !== 'undefined' && typeof (window as any).EmptyRanges === 'undefined') {
  (window as any).EmptyRanges = Object.freeze([])
}

// Custom error boundary component
function ErrorBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback: (error: Error) => React.ReactNode
}) {
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Caught in error boundary:', error)
      setError(error.error)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (error) {
    return <>{fallback(error)}</>
  }

  return <>{children}</>
}

// Error fallback component - theme-aware with fallback
function AuthErrorFallback({ error }: { error: Error }) {
  // Safely get theme context, default to dark if not available
  let theme: 'light' | 'dark' = 'dark'
  let prefix = 'dark'
  
  try {
    const themeContext = useContext(ThemeContext)
    if (themeContext) {
      theme = themeContext.theme
      prefix = theme === 'dark' ? 'dark' : 'light'
    }
  } catch (e) {
    // Context not available, use default
    prefix = 'dark'
  }
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${prefix}-bg-primary p-4`}>
      <div className={`${prefix}-card border ${prefix}-border rounded-xl p-6 max-w-md w-full`}>
        <h1 className={`${prefix}-text-gold text-2xl font-bold mb-4`}>Something went wrong</h1>
        <p className={`${prefix}-text-secondary mb-6`}>{error.message || 'Unknown error occurred'}</p>
        <button
          onClick={() => window.location.reload()}
          className={`${prefix}-btn-gold px-4 py-2 rounded-lg transition-colors`}
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}

interface ClientLayoutProps {
  children: React.ReactNode
}

// Client layout wrapper with error handling and theme support
function ClientLayoutContent({ children }: ClientLayoutProps) {
  // Safely get theme context, default to dark if not available
  let theme: 'light' | 'dark' = 'dark'
  let prefix = 'dark'
  
  try {
    const themeContext = useContext(ThemeContext)
    if (themeContext) {
      theme = themeContext.theme
      prefix = theme === 'dark' ? 'dark' : 'light'
    }
  } catch (e) {
    // Context not available, use default
    prefix = 'dark'
  }
  
  return (
    <div className={`min-h-screen w-full no-scroll-bounce ${prefix}-bg-primary`}>
      <div className="mobile-safe-area mx-auto min-h-screen w-full overflow-x-hidden">
        {children}
      </div>
      <SafariBanner />
      <ChatWidget />
    </div>
  )
}

// Client layout wrapper with error handling
export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ErrorBoundary fallback={(error) => <AuthErrorFallback error={error} />}>
      <AuthProvider>
        <ChatProvider>
          <ClientLayoutContent>
            {children}
          </ClientLayoutContent>
        </ChatProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
} 