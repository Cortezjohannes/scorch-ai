'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import Link from 'next/link'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignupFormData = z.infer<typeof signupSchema>

interface SignupFormProps {
  isModal?: boolean
}

export function SignupForm({ isModal = false }: SignupFormProps) {
  const { signUp } = useAuth()
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
              await signUp(data.email, data.password, data.name)
    } catch (error) {
      console.error('Signup error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle = prefix === 'dark' ? {} : {
    backgroundColor: '#FFFFFF',
    color: '#1A1A1A',
    border: '1px solid #E2E8F0',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    width: '100%'
  }

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className={`block text-sm font-medium ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-1.5`}>
          Full Name
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className={prefix === 'dark' ? `${prefix}-input w-full` : 'w-full'}
          style={inputStyle}
          placeholder="John Doe"
          disabled={isSubmitting}
        />
        {errors.name && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-1.5 text-sm ${prefix === 'dark' ? 'text-red-400' : 'text-red-600'}`}
          >
            {errors.name.message}
          </motion.p>
        )}
      </div>

      <div>
        <label htmlFor="email" className={`block text-sm font-medium ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-1.5`}>
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={prefix === 'dark' ? `${prefix}-input w-full` : 'w-full'}
          style={inputStyle}
          placeholder="you@example.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-1.5 text-sm ${prefix === 'dark' ? 'text-red-400' : 'text-red-600'}`}
          >
            {errors.email.message}
          </motion.p>
        )}
      </div>

      <div>
        <label htmlFor="password" className={`block text-sm font-medium ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-1.5`}>
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className={prefix === 'dark' ? `${prefix}-input w-full` : 'w-full'}
          style={inputStyle}
          placeholder="••••••••"
          disabled={isSubmitting}
        />
        {errors.password && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-1.5 text-sm ${prefix === 'dark' ? 'text-red-400' : 'text-red-600'}`}
          >
            {errors.password.message}
          </motion.p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className={`block text-sm font-medium ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-1.5`}>
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          className={prefix === 'dark' ? `${prefix}-input w-full` : 'w-full'}
          style={inputStyle}
          placeholder="••••••••"
          disabled={isSubmitting}
        />
        {errors.confirmPassword && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-1.5 text-sm ${prefix === 'dark' ? 'text-red-400' : 'text-red-600'}`}
          >
            {errors.confirmPassword.message}
          </motion.p>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`${prefix === 'dark' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'} border rounded-lg p-3 text-sm`}
        >
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all ${
          isSubmitting
            ? 'opacity-50 cursor-not-allowed'
            : ''
        } ${
          prefix === 'dark'
            ? 'bg-[#10B981] text-black hover:bg-[#059669]'
            : 'bg-[#10B981] text-white hover:bg-[#059669]'
        }`}
        whileHover={!isSubmitting ? { scale: 1.01 } : {}}
        whileTap={!isSubmitting ? { scale: 0.99 } : {}}
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </motion.button>
      
      {!isModal && (
        <div className={`text-center mt-3 ${prefix === 'dark' ? 'text-white/60' : 'text-black/60'} text-sm`}>
          Already have an account?{' '}
          <Link href="/login" className={`${prefix === 'dark' ? 'text-[#10B981]' : 'text-[#059669]'} hover:underline font-medium`}>
            Sign in
          </Link>
        </div>
      )}
    </form>
  )

  if (isModal) {
    return formContent
  }

  return formContent
} 