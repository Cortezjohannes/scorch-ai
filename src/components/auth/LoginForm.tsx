'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  isModal?: boolean
}

export function LoginForm({ isModal = false }: LoginFormProps) {
  const { signIn } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
              await signIn(data.email, data.password)
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#e2c376] mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="input-field"
          placeholder="you@example.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-[#e2c376]"
          >
            {errors.email.message}
          </motion.p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#e2c376] mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="input-field"
          placeholder="••••••••"
          disabled={isSubmitting}
        />
        {errors.password && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-[#e2c376]"
          >
            {errors.password.message}
          </motion.p>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#e2c37610] border border-[#e2c37640] rounded-xl p-4 text-[#e2c376]"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isSubmitting ? 'Signing In...' : 'Sign In'}
      </motion.button>
      
      {!isModal && (
        <div className="text-center mt-4 text-[#e7e7e7]/70 text-sm">
          Don't have an account yet?{' '}
          <Link href="/signup" className="text-[#e2c376] hover:underline">
            Sign up
          </Link>
        </div>
      )}
    </form>
  )

  if (isModal) {
    return formContent
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card max-w-md mx-auto"
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#e2c376] to-[#c4a75f] text-transparent bg-clip-text">
          Welcome Back
        </h2>
        <p className="text-[#e7e7e7]/70">
          Sign in to access your projects and continue your creative journey.
        </p>
      </div>

      {formContent}
    </motion.div>
  )
} 