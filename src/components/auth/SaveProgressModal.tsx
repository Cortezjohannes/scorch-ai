'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthModal } from './AuthModal'

type SaveProgressModalProps = {
  isOpen: boolean
  onClose: () => void
  onContinueWithoutLogin: () => void
}

export function SaveProgressModal({ isOpen, onClose, onContinueWithoutLogin }: SaveProgressModalProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  
  const handleLoginClick = () => {
    setAuthModalOpen(true)
  }
  
  const handleContinue = () => {
    onClose()
    onContinueWithoutLogin()
  }
  
  return (
    <>
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
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#1e1f22] rounded-xl overflow-hidden shadow-xl p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#e2c37620] flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#e2c376]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-center mb-2">Save Your Progress</h3>
                
                <p className="text-[#e7e7e7]/80 text-center mb-6">
                  To save your project and access it later, you'll need to log in or create an account. Your progress will not be saved unless you're logged in.
                </p>
                
                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={handleLoginClick}
                    className="btn-primary w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Log In or Sign Up
                  </motion.button>
                  
                  <button
                    onClick={handleContinue}
                    className="w-full py-2 text-[#e7e7e7]/70 hover:text-[#e7e7e7] transition-colors text-sm"
                  >
                    I'll log in later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        initialView="login"
      />
    </>
  )
} 