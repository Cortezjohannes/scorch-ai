'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface GenerationErrorModalProps {
  isOpen: boolean
  errorMessage: string
  onRetry: () => void
  onClose: () => void
  generationType?: 'beat sheet' | 'episode'
}

export default function GenerationErrorModal({
  isOpen,
  errorMessage,
  onRetry,
  onClose,
  generationType = 'beat sheet'
}: GenerationErrorModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#1a1a1a] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Error Icon */}
          <div className="flex justify-center pt-8 pb-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Generation Failed
            </h2>
            
            <p className="text-[#e7e7e7]/80 mb-2">
              We couldn't generate your {generationType}.
            </p>
            
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
                <p className="text-red-400 text-sm font-mono">
                  {errorMessage}
                </p>
              </div>
            )}
            
            <p className="text-[#e7e7e7]/60 text-sm mb-6">
              This can happen occasionally due to API limits or network issues. Please try again.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-[#2a2a2a] border border-[#36393f] text-[#e7e7e7] font-medium rounded-lg hover:bg-[#36393f] transition-all"
              >
                Cancel
              </button>
              
              <button
                onClick={() => {
                  onClose()
                  onRetry()
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#10B981]/20 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

