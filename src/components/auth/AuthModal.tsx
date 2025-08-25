'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'
import { useAuth } from '@/context/AuthContext'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  initialView?: 'login' | 'signup'
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'signup'>(initialView)
  const { isAuthenticated } = useAuth()
  
  // Close modal if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      onClose()
      // Refresh the page to update UI
      window.location.reload()
    }
  }, [isAuthenticated, onClose])
  
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <div className="bg-[#1e1f22] rounded-xl overflow-hidden shadow-xl">
              <div className="flex border-b border-[#e7e7e7]/10">
                <button
                  onClick={() => setView('login')}
                  className={`flex-1 py-3 text-center transition-colors ${
                    view === 'login'
                      ? 'text-[#e2c376] border-b-2 border-[#e2c376]'
                      : 'text-[#e7e7e7]/70 hover:text-[#e7e7e7]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setView('signup')}
                  className={`flex-1 py-3 text-center transition-colors ${
                    view === 'signup'
                      ? 'text-[#e2c376] border-b-2 border-[#e2c376]'
                      : 'text-[#e7e7e7]/70 hover:text-[#e7e7e7]'
                  }`}
                >
                  Create Account
                </button>
              </div>
              
              <div className="p-6">
                {view === 'login' ? (
                  <LoginForm isModal={true} />
                ) : (
                  <SignupForm isModal={true} />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 