'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export function SessionExpiry() {
  const auth = useAuth()
  const isSessionExpired = auth?.isSessionExpired || false
  const refreshSession = auth?.refreshSession || (() => {})
  const logout = auth?.logout || (() => {})
  
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(60)
  
  // Monitor session expiry and show warning when needed
  useEffect(() => {
    if (isSessionExpired) {
      setShowWarning(true)
      setCountdown(60)
      
      // Start countdown timer
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    } else {
      setShowWarning(false)
    }
  }, [isSessionExpired])
  
  // Auto logout when countdown reaches zero
  useEffect(() => {
    if (countdown === 0 && showWarning) {
      logout()
    }
  }, [countdown, showWarning, logout])
  
  // Handle session renewal
  const handleRenewSession = () => {
    refreshSession()
    setShowWarning(false)
  }
  
  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        >
          <div className="mt-4 mx-4 p-4 bg-[#2a2a2a] border border-[#e2c376] rounded-lg shadow-lg max-w-md">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-[#e2c376]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-[#e7e7e7]">
                  Your session is about to expire
                </h3>
                <div className="mt-2 text-sm text-[#e7e7e7]/70">
                  <p>
                    You will be logged out in {countdown} seconds due to inactivity.
                  </p>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={handleRenewSession}
                    className="bg-[#e2c376] text-black px-3 py-1 rounded-md text-sm font-medium hover:bg-[#d4b46a] transition-colors"
                  >
                    Stay Logged In
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-[#e7e7e7]/70 px-3 py-1 rounded-md text-sm font-medium hover:text-[#e7e7e7] transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Add default export to fix the dynamic import issue
export default SessionExpiry; 