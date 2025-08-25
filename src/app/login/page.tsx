'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const redirectPath = searchParams.get('redirect') || '/'
  
  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectPath)
    }
  }, [isAuthenticated, isLoading, router, redirectPath])
  
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
            className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center mx-auto mb-6 animate-emberFloat"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-4xl">🔥</span>
          </motion.div>
          <motion.div 
            className="w-12 h-12 border-4 border-t-[#e2c376] border-r-[#e2c37650] border-b-[#e2c37630] border-l-[#e2c37620] rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/90 text-lg elegant-fire">Igniting the revolution...</p>
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
            {/* Revolutionary Header */}
            <div className="text-center mb-12">
              {/* Fire Icon */}
              <motion.div
                className="w-20 h-20 ember-shadow rounded-xl flex items-center justify-center mx-auto mb-8 animate-emberFloat"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/">
                  <span className="text-5xl cursor-pointer">🔥</span>
                </Link>
              </motion.div>
              
              {/* Revolutionary Title */}
              <motion.div
                initial={{ letterSpacing: "-0.1em", opacity: 0 }}
                animate={{ letterSpacing: "0.02em", opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.3 }}
              >
                <Link href="/" className="inline-block">
                  <h1 className="text-4xl md:text-5xl font-black elegant-fire fire-gradient animate-flameFlicker mb-4">
                    SCORCHED AI
                  </h1>
                </Link>
              </motion.div>
              
              {/* Revolutionary Subtitle */}
              <motion.p 
                className="text-lg md:text-xl text-white/90 max-w-md mx-auto leading-relaxed elegant-fire"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <span className="text-[#e2c376] font-bold">Ignite your access</span> to the revolution. 
                Continue forging your creative empire.
              </motion.p>
            </div>
            
            {/* Revolutionary Login Form Container */}
            <motion.div
              className="rebellious-card p-8 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#D62828]/10 via-[#FF6B00]/10 to-[#e2c376]/10 opacity-50"></div>
              
              <div className="relative z-10">
                <LoginForm />
              </div>
            </motion.div>
            
            {/* Revolutionary Footer */}
            <motion.div 
              className="mt-8 text-center text-white/60 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <p className="elegant-fire">
                By signing in, you pledge allegiance to our{' '}
                <Link href="/terms" className="text-[#e2c376] hover:text-[#D62828] font-bold transition-colors">
                  Terms of Revolution
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#e2c376] hover:text-[#D62828] font-bold transition-colors">
                  Privacy Manifesto
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 