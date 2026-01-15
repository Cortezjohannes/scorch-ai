'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'

export default function DemoAuthModal() {
  const { user, isAuthenticated, signIn, isLoading } = useAuth()
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const router = useRouter()

  // Show modal if not authenticated (after auth check completes)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowModal(true)
    }
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
      // Modal will close automatically via useEffect when isAuthenticated becomes true
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignUpRedirect = () => {
    router.push('/signup?redirect=/demo')
  }

  // Don't show modal if authenticated or still loading
  if (isLoading || isAuthenticated || !showModal) return null

  return (
    <AnimatePresence mode="wait">
      {showModal && (
        <motion.div
          key="demo-auth-modal"
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
            className={`relative w-full max-w-md ${prefix === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'} border ${prefix === 'dark' ? 'border-[#10B981]/30' : 'border-[#10B981]/20'} rounded-2xl shadow-2xl overflow-hidden my-8`}
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${prefix === 'dark' ? 'from-[#10B981]/10' : 'from-[#10B981]/5'} to-transparent pointer-events-none`} />
            
            {/* Content */}
            <div className="relative p-8">
              {/* Status Indicator */}
              <div className="flex items-center justify-center mb-6">
                <div className={`flex items-center gap-3 px-4 py-2 ${prefix === 'dark' ? 'bg-[#10B981]/10 border-[#10B981]/30' : 'bg-[#10B981]/5 border-[#10B981]/20'} border rounded-lg`}>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className={`${prefix === 'dark' ? 'text-[#E7E7E7]' : 'text-black'} text-sm font-medium`}>Sign In Required</span>
                </div>
              </div>

              {/* Title */}
              <h2 className={`text-2xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'} text-center mb-2`}>
                Sign In to Continue
              </h2>
              <p className={`${prefix === 'dark' ? 'text-[#E7E7E7]/70' : 'text-black/70'} text-center mb-6`}>
                Sign in to save your work and access all features.
              </p>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium ${prefix === 'dark' ? 'text-[#E7E7E7]/80' : 'text-black/80'} mb-2`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 ${prefix === 'dark' ? 'bg-[#121212] text-white border-[#10B981]/20 placeholder-[#E7E7E7]/40' : 'bg-white text-black border-gray-300 placeholder-gray-400'} border rounded-lg focus:outline-none focus:border-[#10B981] transition-colors`}
                    placeholder="your@email.com"
                    required
                    disabled={isSigningIn}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className={`block text-sm font-medium ${prefix === 'dark' ? 'text-[#E7E7E7]/80' : 'text-black/80'} mb-2`}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 ${prefix === 'dark' ? 'bg-[#121212] text-white border-[#10B981]/20 placeholder-[#E7E7E7]/40' : 'bg-white text-black border-gray-300 placeholder-gray-400'} border rounded-lg focus:outline-none focus:border-[#10B981] transition-colors`}
                    placeholder="••••••••"
                    required
                    disabled={isSigningIn}
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
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#10B981]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSigningIn ? 'Signing in...' : 'Sign In'}
                  </motion.button>

                  {/* Sign Up Link */}
                  <button
                    type="button"
                    onClick={handleSignUpRedirect}
                    className={`w-full px-6 py-3 bg-transparent border ${prefix === 'dark' ? 'border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10' : 'border-[#10B981] text-[#10B981] hover:bg-[#10B981]/5'} font-medium rounded-lg transition-all`}
                  >
                    Create Account
                  </button>
                </div>
              </form>

              {/* Feature List */}
              <div className={`mt-6 pt-6 border-t ${prefix === 'dark' ? 'border-[#10B981]/10' : 'border-gray-200'}`}>
                <p className={`text-xs ${prefix === 'dark' ? 'text-[#E7E7E7]/50' : 'text-black/50'} text-center mb-3`}>
                  Benefits of signing in:
                </p>
                <div className="space-y-2">
                  {[
                    '💾 Save your work to our servers',
                    '☁️ Sync across all your devices',
                    '🔒 Keep your data secure',
                    '🚀 Access all app features',
                  ].map((benefit, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs ${prefix === 'dark' ? 'text-[#E7E7E7]/60' : 'text-black/60'}`}>
                      <div className="w-1 h-1 bg-[#10B981] rounded-full" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  )
}

