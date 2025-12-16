'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import AnimatedBackground from '@/components/AnimatedBackground'
import GlobalThemeToggle from '@/components/navigation/GlobalThemeToggle'
import Link from 'next/link'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const redirectPath = searchParams.get('redirect') || '/'
  const [showAlreadyLoggedIn, setShowAlreadyLoggedIn] = useState(false)
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 Login Page State:');
    console.log('  - isLoading:', isLoading);
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - user:', user);
    console.log('  - redirectPath:', redirectPath);
  }, [isLoading, isAuthenticated, user, redirectPath])
  
  // Check if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      console.log('✅ Already authenticated!');
      
      // If there's a redirect parameter and it's not /login, auto-redirect
      if (redirectPath && redirectPath !== '/' && redirectPath !== '/login') {
        console.log('  → Auto-redirecting to:', redirectPath);
        router.push(redirectPath);
      } else {
        // Otherwise show "Already Logged In" screen
        console.log('  → Showing "Already Logged In" screen');
        setShowAlreadyLoggedIn(true);
      }
    }
  }, [isAuthenticated, isLoading, user, redirectPath, router])
  
  // Show "Already Logged In" message
  if (showAlreadyLoggedIn && user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${prefix}-bg-primary px-4 relative`} style={{ fontFamily: 'League Spartan, sans-serif' }}>
        <AnimatedBackground variant="halo" intensity="low" page="login" />
        <div className="fixed top-4 right-4 z-50">
          <GlobalThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className={`${prefix}-card border ${prefix}-border rounded-xl p-6 ${prefix}-shadow-lg text-center`}>
            <div className="mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border-2 border-[#10B981]/40 rounded-full flex items-center justify-center mx-auto`}>
                <span className="text-2xl">✓</span>
              </div>
            </div>

            <h2 className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669] mb-2`}>
              Already Logged In
            </h2>
            
            <p className={`${prefix}-text-secondary text-sm mb-6`}>
              Signed in as <span className={`${prefix}-text-green font-medium`}>{user.email}</span>
            </p>

            <div className="space-y-2">
              <button
                onClick={() => router.push('/')}
                className={`w-full px-4 py-2 ${prefix}-btn-primary font-semibold rounded-lg transition-all`}
              >
                Continue to Home
              </button>

              <button
                onClick={() => router.push('/profile')}
                className={`w-full px-4 py-2 ${prefix}-bg-accent border ${prefix}-border ${prefix}-text-green font-medium rounded-lg hover:${prefix}-bg-accent/50 transition-all`}
              >
                Go to Profile
              </button>

              <button
                onClick={async () => {
                  await signOut();
                  setShowAlreadyLoggedIn(false);
                }}
                className={`w-full px-4 py-2 bg-transparent border border-red-500/30 text-red-400 font-medium rounded-lg hover:bg-red-500/10 transition-all text-sm`}
              >
                Logout & Login as Different User
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${prefix}-bg-primary`} style={{ fontFamily: 'League Spartan, sans-serif' }}>
        <div className="text-center">
          <div 
            className="w-8 h-8 border-2 border-t-[#10B981] border-r-transparent border-b-transparent border-l-transparent rounded-full mx-auto mb-3"
            style={{
              animation: 'spin 1s linear infinite'
            }}
          />
          <p className={`${prefix}-text-secondary text-sm`}>Loading...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className={`min-h-screen flex items-center justify-center ${prefix}-bg-primary px-4 relative`}
      style={{ fontFamily: 'League Spartan, sans-serif' }}
    >
      <AnimatedBackground variant="halo" intensity="low" page="login" />
      <div className="fixed top-4 right-4 z-50">
        <GlobalThemeToggle />
      </div>
      <div className="w-full max-w-md">
        {/* Compact Header */}
        <div className="text-center mb-6">
              <Link href="/">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669] mb-2">
              Greenlit
                  </h1>
                </Link>
          <p className={`text-sm ${prefix}-text-secondary`}>
            Sign in to continue
          </p>
            </div>
            
        {/* Login Form */}
        <div className={`${prefix}-card border ${prefix}-border rounded-xl p-6 ${prefix}-shadow-lg`}>
                <LoginForm />
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center light-bg-primary" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        <div className="text-center">
          <div 
            className="w-8 h-8 border-2 border-t-[#10B981] border-r-transparent border-b-transparent border-l-transparent rounded-full mx-auto mb-3"
            style={{
              animation: 'spin 1s linear infinite'
            }}
          />
          <p className="light-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
} 