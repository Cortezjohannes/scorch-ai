'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SignupForm } from '@/components/auth/SignupForm'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import AnimatedBackground from '@/components/AnimatedBackground'
import GlobalThemeToggle from '@/components/navigation/GlobalThemeToggle'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const redirectPath = searchParams.get('redirect') || '/'
  
  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectPath)
    }
  }, [isAuthenticated, isLoading, router, redirectPath])
  
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
      <AnimatedBackground variant="halo" intensity="low" page="signup" />
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
            Create your account to get started
          </p>
            </div>
            
        {/* Signup Form */}
        <div className={`${prefix}-card border ${prefix}-border rounded-xl p-6 ${prefix}-shadow-lg mb-4`}>
                <SignupForm />
              </div>
            
            {/* Already have account link */}
        <div className="text-center">
          <p className={`${prefix === 'dark' ? 'text-white/60' : 'text-black/60'} text-sm`}>
                Already have an account?{' '}
            <Link href="/login" className={`${prefix === 'dark' ? 'text-[#10B981]' : 'text-[#059669]'} hover:underline font-medium`}>
                  Sign in
                </Link>
              </p>
        </div>
      </div>
    </div>
  )
} 