'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface AuthStatusModalProps {
  onSkip: () => void
}

export default function AuthStatusModal({ onSkip }: AuthStatusModalProps) {
  const { user, isAuthenticated, signIn, isLoading } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const router = useRouter()

  // Show modal after a brief delay if not authenticated
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading && !isAuthenticated) {
        setShowModal(true)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [isLoading, isAuthenticated])

  // Hide modal if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setShowModal(false)
    }
  }, [isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSigningIn(true)

    try {
      await signIn(email, password)
      setShowModal(false)
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSkip = () => {
    setShowModal(false)
    onSkip()
  }

  const handleSignUpRedirect = () => {
    router.push('/signup')
  }

  if (!showModal) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4"
      >
        <div className="min-h-screen flex items-center justify-center">
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-[#1A1A1A] border border-[#00FF99]/30 rounded-2xl shadow-2xl overflow-hidden my-8"
          >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00FF99]/10 to-transparent pointer-events-none" />
          
          {/* Content */}
          <div className="relative p-8">
            {/* Status Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-[#00FF99]/10 border border-[#00FF99]/30 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[#E7E7E7] text-sm font-medium">Not Logged In</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Sign In to Continue
            </h2>
            <p className="text-[#E7E7E7]/70 text-center mb-6">
              Login to share story bibles and save your work to the cloud
            </p>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#E7E7E7]/80 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#121212] border border-[#00FF99]/20 rounded-lg text-white placeholder-[#E7E7E7]/40 focus:outline-none focus:border-[#00FF99] transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#E7E7E7]/80 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#121212] border border-[#00FF99]/20 rounded-lg text-white placeholder-[#E7E7E7]/40 focus:outline-none focus:border-[#00FF99] transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Buttons */}
              <div className="space-y-3">
                {/* Login Button */}
                <motion.button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#00FF99]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSigningIn ? 'Signing in...' : 'Sign In'}
                </motion.button>

                {/* Sign Up Link */}
                <button
                  type="button"
                  onClick={handleSignUpRedirect}
                  className="w-full px-6 py-3 bg-transparent border border-[#00FF99]/30 text-[#00FF99] font-medium rounded-lg hover:bg-[#00FF99]/10 transition-all"
                >
                  Create Account
                </button>

                {/* Skip Button */}
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full px-6 py-3 text-[#E7E7E7]/50 hover:text-[#E7E7E7] text-sm transition-colors"
                >
                  Continue without login →
                </button>
              </div>
            </form>

            {/* Feature List */}
            <div className="mt-6 pt-6 border-t border-[#00FF99]/10">
              <p className="text-xs text-[#E7E7E7]/50 text-center mb-3">
                Benefits of signing in:
              </p>
              <div className="space-y-2">
                {[
                  '🔗 Share story bibles with custom links',
                  '☁️ Cloud sync across devices',
                  '💾 Never lose your work',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#E7E7E7]/60">
                    <div className="w-1 h-1 bg-[#00FF99] rounded-full" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

