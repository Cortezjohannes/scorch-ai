'use client'

import { useCallback, useEffect, useState } from 'react'
import { AuthProvider } from '@/context/AuthContext'

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

// Error fallback component
function AuthErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      <div className="bg-[#1a1a1a] border border-[#e2c37640] rounded-xl p-6 max-w-md w-full">
        <h1 className="text-[#e2c376] text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-[#e7e7e7] mb-6">{error.message || 'Unknown error occurred'}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#e2c376] text-black px-4 py-2 rounded-lg hover:bg-[#d4b46a] transition-colors"
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

// Client layout wrapper with error handling
export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ErrorBoundary fallback={(error) => <AuthErrorFallback error={error} />}>
      <AuthProvider>
        <div className="min-h-screen w-full no-scroll-bounce">
          <div className="pointer-events-none fixed inset-0 z-30 transition duration-300 bg-[#12121220]" />
          
          <div className="mobile-safe-area mx-auto min-h-screen w-full overflow-x-hidden">
            {children}
          </div>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
} 