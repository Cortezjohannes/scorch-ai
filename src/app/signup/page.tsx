'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card } from '@/components/ui/card'
import { SignupForm } from '@/components/auth/SignupForm'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function SignupPage() {
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

  const benefits = [
    {
      icon: '🎭',
      title: '60% Ownership',
      description: 'Actors retain majority ownership of their content'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Creation',
      description: 'Professional-quality content from simple ideas'
    },
    {
      icon: '🔥',
      title: 'Revolutionary Platform',
      description: 'Break free from traditional Hollywood constraints'
    }
  ]
  
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
            <p className="text-body-large text-medium-contrast elegant-fire">Preparing the revolution...</p>
          </motion.div>
        </div>
      </PageLayout>
    )
  }
  
  return (
    <PageLayout showBackground={true}>
      <div className="min-h-[80vh] py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Value Proposition Side */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="elegant-fire fire-gradient text-h1 font-black mb-6 animate-flameFlicker">
              JOIN THE
              <br />
              <span className="text-ember-gold">REVOLUTION</span>
            </h1>
            
            <p className="text-body-large text-medium-contrast mb-8">
              Create professional series content with AI assistance while maintaining creative control and ownership.
            </p>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="text-3xl">{benefit.icon}</div>
                  <div>
                    <h3 className="font-bold text-high-contrast mb-1 elegant-fire">
                      {benefit.title}
                    </h3>
                    <p className="text-body text-medium-contrast">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Revolutionary manifesto */}
            <motion.div
              className="mt-8 p-6 card-hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-h3 text-ember-gold mb-3 elegant-fire">
                🔥 The Scorched Manifesto
              </h3>
              <p className="text-body text-high-contrast italic">
                "We reject the gatekeepers. We burn the bureaucracy. 
                We forge our own empire with the flames of creativity and the power of AI."
              </p>
            </motion.div>
          </motion.div>

          {/* Signup Form Side */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
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
                  Create Your Account
                </h2>
                <p className="text-body text-medium-contrast">
                  Start creating revolutionary content today
                </p>
              </div>

              <SignupForm />

              <div className="text-center mt-6">
                <p className="text-body text-medium-contrast">
                  Already have an account?{' '}
                  <Link 
                    href="/login" 
                    className="text-ember-gold hover:text-ember-gold/80 font-medium transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </Card>

            {/* Revolutionary Footer */}
            <motion.div 
              className="mt-8 text-center text-medium-contrast text-caption"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <p className="elegant-fire">
                By joining the revolution, you pledge allegiance to our{' '}
                <Link href="/terms" className="text-ember-gold hover:text-ember-gold/80 font-medium transition-colors">
                  Terms of Revolution
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-ember-gold hover:text-ember-gold/80 font-medium transition-colors">
                  Privacy Manifesto
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  )
}