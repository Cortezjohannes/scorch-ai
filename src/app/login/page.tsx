'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
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
      <div className="min-h-screen flex items-center justify-center py-16" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        <motion.div 
          className="max-w-lg mx-auto px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-[#1A1A1A] border border-[#00FF99]/30 rounded-2xl p-8 shadow-2xl">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00FF99]/20 to-[#00CC7A]/20 border-2 border-[#00FF99]/40 rounded-full flex items-center justify-center shadow-lg shadow-[#00FF99]/20">
                <span className="text-5xl">✓</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00FF99] to-[#00CC7A] mb-4 text-center">
              Already Logged In
            </h2>
            
            <p className="text-white/70 text-center mb-6">
              You're currently signed in as <span className="text-[#00FF99] font-medium">{user.email}</span>
            </p>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#00FF99]/20 transition-all"
              >
                Continue to Home
              </button>

              <button
                onClick={() => router.push('/profile')}
                className="w-full px-6 py-3 bg-[#00FF99]/10 border border-[#00FF99]/30 text-[#00FF99] font-medium rounded-lg hover:bg-[#00FF99]/20 transition-all"
              >
                Go to Profile
              </button>

              <button
                onClick={async () => {
                  await signOut();
                  setShowAlreadyLoggedIn(false);
                }}
                className="w-full px-6 py-3 bg-transparent border border-red-500/30 text-red-400 font-medium rounded-lg hover:bg-red-500/10 transition-all"
              >
                Logout & Login as Different User
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-[#00FF99]/20 to-[#00CC7A]/20 border-2 border-[#00FF99]/30 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#00FF99]/20 overflow-hidden"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image 
              src="/greenlitailogo.png" 
              alt="Greenlit Logo" 
              width={48}
              height={48}
              className="object-contain"
            />
          </motion.div>
          <motion.div 
            className="w-12 h-12 border-4 border-t-[#00FF99] border-r-[#00FF9950] border-b-[#00FF9930] border-l-[#00FF9920] rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/90 text-lg">Loading Greenlit...</p>
        </motion.div>
      </div>
    )
  }
  
  return (
    <motion.div 
      className="min-h-screen py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ fontFamily: 'League Spartan, sans-serif' }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Greenlit Header */}
            <div className="text-center mb-12">
              {/* Greenlit Logo */}
              <Link href="/">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-[#00FF99]/20 to-[#00CC7A]/20 border-2 border-[#00FF99]/30 rounded-xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#00FF99]/20 cursor-pointer overflow-hidden"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image 
                    src="/greenlitailogo.png" 
                    alt="Greenlit Logo" 
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </motion.div>
              </Link>
              
              {/* Greenlit Title */}
              <motion.div
                initial={{ letterSpacing: "-0.1em", opacity: 0 }}
                animate={{ letterSpacing: "0.02em", opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.3 }}
              >
                <Link href="/" className="inline-block">
                  <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00FF99] to-[#00CC7A] mb-4">
                    GREENLIT
                  </h1>
                </Link>
              </motion.div>
              
              {/* Greenlit Subtitle */}
              <motion.p 
                className="text-lg md:text-xl text-white/90 max-w-md mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <span className="text-[#00FF99] font-bold">Welcome back.</span> Sign in to access your projects and continue building your series.
              </motion.p>
            </div>
            
            {/* Greenlit Login Form Container */}
            <motion.div
              className="bg-[#1A1A1A] border border-[#00FF99]/30 rounded-2xl p-8 relative overflow-hidden shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00FF99]/10 to-transparent opacity-50"></div>
              
              <div className="relative z-10">
                <LoginForm />
              </div>
            </motion.div>
            
            {/* Greenlit Footer */}
            <motion.div 
              className="mt-8 text-center text-white/60 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <p>
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-[#00FF99] hover:text-[#00CC7A] font-medium transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#00FF99] hover:text-[#00CC7A] font-medium transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-[#00FF99]/20 to-[#00CC7A]/20 border-2 border-[#00FF99]/30 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#00FF99]/20 overflow-hidden"
          >
            <Image 
              src="/greenlitailogo.png" 
              alt="Greenlit Logo" 
              width={48}
              height={48}
              className="object-contain"
            />
          </motion.div>
          <p className="text-white/90 text-lg">Loading login...</p>
        </motion.div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
} 