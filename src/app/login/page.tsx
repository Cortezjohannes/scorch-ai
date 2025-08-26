'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const [showWelcome, setShowWelcome] = useState(true)
  const redirectPath = searchParams.get('redirect') || '/'
  
  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectPath)
    }
  }, [isAuthenticated, isLoading, router, redirectPath])

  // Auto-hide welcome after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2000)
    return () => clearTimeout(timer)
  }, [])
  
  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-4xl">🔥</span>
            </motion.div>
            <p className="text-body-large text-medium-contrast elegant-fire">Igniting the revolution...</p>
          </motion.div>
        </div>
      </PageLayout>
    )
  }
  
  return (
    <PageLayout showBackground={true}>
      <div className="min-h-[80vh] flex items-center justify-center py-16">
        <div className="w-full max-w-md">
          
          {/* Welcome Animation */}
          {showWelcome && (
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 1.5 }}
              >
                🔥
              </motion.div>
              <h1 className="elegant-fire fire-gradient text-h1 font-bold animate-flameFlicker">
                Welcome Back
              </h1>
            </motion.div>
          )}

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: showWelcome ? 0.5 : 0 }}
          >
            <Card variant="content" className="p-8">
              <div className="text-center mb-6">
                <Link href="/" className="inline-block mb-4">
                  <motion.div
                    className="w-12 h-12 ember-shadow rounded-lg flex items-center justify-center mx-auto animate-emberFloat"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="text-2xl">🔥</span>
                  </motion.div>
                </Link>
                
                <h2 className="text-h2 font-bold text-high-contrast mb-2 elegant-fire">
                  Sign In to Scorched AI
                </h2>
                <p className="text-body text-medium-contrast">
                  Continue creating revolutionary content
                </p>
              </div>

              <LoginForm />

              <div className="text-center mt-6">
                <p className="text-body text-medium-contrast">
                  Don't have an account?{' '}
                  <Link 
                    href="/signup" 
                    className="text-ember-gold hover:text-ember-gold/80 font-medium transition-colors"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Additional Options */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Link
              href="/"
              className="text-medium-contrast hover:text-high-contrast text-caption touch-target transition-colors"
            >
              ← Back to Home
            </Link>
          </motion.div>

          {/* Revolutionary Footer */}
          <motion.div 
            className="mt-8 text-center text-medium-contrast text-caption"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <p className="elegant-fire">
              By signing in, you pledge allegiance to our{' '}
              <Link href="/terms" className="text-ember-gold hover:text-ember-gold/80 font-medium transition-colors">
                Terms of Revolution
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-ember-gold hover:text-ember-gold/80 font-medium transition-colors">
                Privacy Manifesto
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  )
}