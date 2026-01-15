'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'

interface ActorApplicationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ActorApplicationModal({ isOpen, onClose }: ActorApplicationModalProps) {
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whyPartner: '',
    isExperienced: false,
    imdbOrPortfolio: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        // Clear IMDb/portfolio field when checkbox is unchecked
        imdbOrPortfolio: checked ? prev.imdbOrPortfolio : ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/actor-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }

      setIsSubmitted(true)
    } catch (err: any) {
      console.error('Error submitting application:', err)
      setError(err.message || 'Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form when closing
      setFormData({
        name: '',
        email: '',
        whyPartner: '',
        isExperienced: false,
        imdbOrPortfolio: ''
      })
      setIsSubmitted(false)
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <div className="min-h-screen flex items-center justify-center">
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-2xl ${prefix === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'} border ${prefix === 'dark' ? 'border-[#10B981]/30' : 'border-[#10B981]/20'} rounded-2xl shadow-2xl overflow-hidden my-8`}
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${prefix === 'dark' ? 'from-[#10B981]/10' : 'from-[#10B981]/5'} to-transparent pointer-events-none`} />
            
            {/* Content */}
            <div className="relative p-8">
              {/* Close button */}
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className={`absolute top-4 right-4 ${prefix === 'dark' ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'} transition-colors disabled:opacity-50`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {!isSubmitted ? (
                <>
                  {/* Header */}
                  <div className="mb-6">
                    <h2 className={`text-3xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-2`}>
                      BE A GREENLIT ACTOR
                    </h2>
                    <p className={`${prefix === 'dark' ? 'text-[#E7E7E7]/70' : 'text-black/70'} text-sm`}>
                      Join our community of professional actors ready to take control of their careers.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className={`block text-sm font-medium ${prefix === 'dark' ? 'text-[#E7E7E7]/80' : 'text-black/80'} mb-2`}>
                        Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#10B981] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          prefix === 'dark' 
                            ? 'bg-[#121212] text-white border-[#10B981]/20 placeholder-[#E7E7E7]/40' 
                            : 'bg-white text-black border-gray-300 placeholder-gray-400'
                        }`}
                        placeholder="Your full name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className={`block text-sm font-medium ${prefix === 'dark' ? 'text-[#E7E7E7]/80' : 'text-black/80'} mb-2`}>
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#10B981] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          prefix === 'dark' 
                            ? 'bg-[#121212] text-white border-[#10B981]/20 placeholder-[#E7E7E7]/40' 
                            : 'bg-white text-black border-gray-300 placeholder-gray-400'
                        }`}
                        placeholder="your@email.com"
                      />
                    </div>

                    {/* Why Partner */}
                    <div>
                      <label className={`block text-sm font-medium ${prefix === 'dark' ? 'text-[#E7E7E7]/80' : 'text-black/80'} mb-2`}>
                        Why you want to partner with Greenlit <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        name="whyPartner"
                        value={formData.whyPartner}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#10B981] transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
                          prefix === 'dark' 
                            ? 'bg-[#121212] text-white border-[#10B981]/20 placeholder-[#E7E7E7]/40' 
                            : 'bg-white text-black border-gray-300 placeholder-gray-400'
                        }`}
                        placeholder="Tell us about your goals, what you're looking for, and why you want to work with Greenlit..."
                      />
                    </div>

                    {/* Experienced Actor Checkbox */}
                    <div>
                      <label className={`flex items-center gap-3 cursor-pointer ${prefix === 'dark' ? 'text-[#E7E7E7]' : 'text-black'}`}>
                        <input
                          type="checkbox"
                          name="isExperienced"
                          checked={formData.isExperienced}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className="w-5 h-5 rounded border-gray-300 text-[#10B981] focus:ring-[#10B981] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm font-medium">Are you an experienced actor?</span>
                      </label>
                    </div>

                    {/* IMDb/Portfolio Field (conditional) */}
                    {formData.isExperienced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label className={`block text-sm font-medium ${prefix === 'dark' ? 'text-[#E7E7E7]/80' : 'text-black/80'} mb-2`}>
                          IMDb Link or Portfolio URL
                        </label>
                        <input
                          type="url"
                          name="imdbOrPortfolio"
                          value={formData.imdbOrPortfolio}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#10B981] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            prefix === 'dark' 
                              ? 'bg-[#121212] text-white border-[#10B981]/20 placeholder-[#E7E7E7]/40' 
                              : 'bg-white text-black border-gray-300 placeholder-gray-400'
                          }`}
                          placeholder="https://www.imdb.com/name/... or your portfolio URL"
                        />
                      </motion.div>
                    )}

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

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#10B981]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </motion.button>
                  </form>
                </>
              ) : (
                /* Success Message */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border-2 border-[#10B981]/40 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className={`text-2xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-2`}>
                      Application Submitted!
                    </h3>
                    <p className={`${prefix === 'dark' ? 'text-[#E7E7E7]/70' : 'text-black/70'} text-sm mb-6`}>
                      Thank you for your interest in partnering with Greenlit. You will receive a response within 72 hours.
                    </p>
                    <button
                      onClick={handleClose}
                      className="px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#10B981]/20 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}



