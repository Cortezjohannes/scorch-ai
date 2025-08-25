'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { SaveProgressModal } from './auth/SaveProgressModal'

// Detect server-side rendering
const isServer = typeof window === 'undefined';

// Memoize the schema to prevent recreation on re-renders
const projectSchema = z.object({
  synopsis: z.string()
    .min(50, 'Synopsis should be at least 50 characters')
    .max(1000, 'Synopsis should not exceed 1000 characters'),
  theme: z.string()
    .min(10, 'Theme should be at least 10 characters')
    .max(200, 'Theme should not exceed 200 characters'),
})

type ProjectFormData = z.infer<typeof projectSchema>

export function ProjectForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [formData, setFormData] = useState<ProjectFormData | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  // Check if we're on the client side after mount
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Use memoized resolver to prevent recreation on re-renders
  const resolver = useMemo(() => zodResolver(projectSchema), [])
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver,
    defaultValues: {
      synopsis: '',
      theme: ''
    }
  })

  // Use useCallback to memoize function definitions
  const processFormSubmission = useCallback((data: ProjectFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Save data to localStorage only in browser
      if (!isServer && typeof window !== 'undefined') {
        localStorage.setItem('projectData', JSON.stringify({
          title: `Project ${new Date().toLocaleDateString()}`,
          synopsis: data.synopsis,
          theme: data.theme,
          createdAt: new Date().toISOString()
        }))
      }
      
      // Navigate to pre-production with the form data
      router.push(`/preproduction?synopsis=${encodeURIComponent(data.synopsis)}&theme=${encodeURIComponent(data.theme)}`)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setIsSubmitting(false)
    }
  }, [router])

  const onSubmit = useCallback(async (data: ProjectFormData) => {
    // Store the form data
    setFormData(data)
    
    // If user is not authenticated, show the save progress modal
    if (!isAuthenticated) {
      setSaveModalOpen(true)
      return
    }
    
    // Otherwise, process the form submission directly
    processFormSubmission(data)
  }, [isAuthenticated, processFormSubmission])

  const handleContinueWithoutLogin = useCallback(() => {
    if (formData) {
      processFormSubmission(formData)
    }
  }, [formData, processFormSubmission])

  // Return a simplified form during server-side rendering
  if (!isClient) {
    return (
      <div className="card max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#e2c376] to-[#c4a75f] text-transparent bg-clip-text">
            Create Your Web Series
          </h2>
          <p className="text-[#e7e7e7]/70">
            Start by providing your synopsis and theme. We'll guide you through the entire production process.
          </p>
        </div>
        
        <form className="space-y-6">
          <div>
            <label htmlFor="synopsis" className="block text-sm font-medium text-[#e2c376] mb-2">
              Synopsis
            </label>
            <textarea
              id="synopsis"
              rows={6}
              className="input-field"
              placeholder="Enter your web series synopsis..."
              disabled={false}
            />
          </div>

          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-[#e2c376] mb-2">
              Theme
            </label>
            <textarea
              id="theme"
              rows={3}
              className="input-field"
              placeholder="Enter the overarching theme..."
              disabled={false}
            />
          </div>

          <button
            type="button"
            className="btn-primary w-full"
          >
            Start Production
          </button>
        </form>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card max-w-3xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#e2c376] to-[#c4a75f] text-transparent bg-clip-text">
          Create Your Web Series
        </h2>
        <p className="text-[#e7e7e7]/70">
          Start by providing your synopsis and theme. We'll guide you through the entire production process.
        </p>
        
        {!isAuthenticated && (
          <div className="mt-4 p-4 bg-[#e2c37610] border border-[#e2c37630] rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-[#e2c376] mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p className="text-sm text-[#e7e7e7]/90">
                  <strong>Save your progress:</strong> To save your projects and access them later, 
                  <Link href="/signup" className="text-[#e2c376] hover:underline ml-1">
                    create an account
                  </Link> or 
                  <Link href="/login" className="text-[#e2c376] hover:underline ml-1">
                    sign in
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="synopsis" className="block text-sm font-medium text-[#e2c376] mb-2">
            Synopsis
          </label>
          <textarea
            id="synopsis"
            {...register('synopsis')}
            rows={6}
            className="input-field"
            placeholder="Enter your web series synopsis..."
            disabled={isSubmitting}
          />
          {errors.synopsis && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-[#e2c376]"
            >
              {errors.synopsis.message}
            </motion.p>
          )}
        </div>

        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-[#e2c376] mb-2">
            Theme
          </label>
          <textarea
            id="theme"
            {...register('theme')}
            rows={3}
            className="input-field"
            placeholder="Enter the overarching theme..."
            disabled={isSubmitting}
          />
          {errors.theme && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-[#e2c376]"
            >
              {errors.theme.message}
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
          {isSubmitting ? 'Processing...' : 'Start Production'}
        </motion.button>
      </form>
      
      <SaveProgressModal 
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onContinueWithoutLogin={handleContinueWithoutLogin}
      />
    </motion.div>
  )
} 