'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface GenerationIndicatorProps {
  isGenerating: boolean
  phase: string
  completionMessage?: string
  className?: string
  readyToShow?: boolean
  progressPercentage?: number
  statusText?: string
}

export function GenerationIndicator({ 
  isGenerating, 
  phase, 
  completionMessage = "Generation complete!",
  className = "",
  readyToShow = true,
  progressPercentage = 0,
  statusText
}: GenerationIndicatorProps) {
  if (!readyToShow) return null

  return (
    <div className={`bg-[#2a2a2a] border border-[#36393f] rounded-xl p-6 ${className}`}>
      <div className="flex flex-col items-center">
        {isGenerating ? (
          <motion.div 
            className="relative w-32 h-32 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Progress circle background */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#36393f" 
                strokeWidth="8"
              />
              {/* Progress circle fill */}
              <motion.circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#e2c376" 
                strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray={283} // 2 * π * r
                strokeDashoffset={283 - (283 * progressPercentage / 100)}
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * progressPercentage / 100) }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </svg>
            
            {/* Animated icon in the center */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0.7 }}
              animate={{ 
                scale: [0.7, 0.8, 0.7],
                rotate: [0, 10, 0, -10, 0]
              }}
              transition={{ 
                scale: { duration: 2, repeat: Infinity },
                rotate: { duration: 5, repeat: Infinity }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#e2c376]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </motion.div>
            
            {/* Progress percentage in center */}
            <div className="absolute inset-0 flex items-center justify-center mt-14">
              <span className="text-sm font-bold text-[#e2c376]">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="w-24 h-24 mb-6 flex items-center justify-center text-[#e2c376]"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
        )}
        
        <motion.h3 
          className="text-xl font-bold mb-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isGenerating ? `Creating ${phase}` : completionMessage}
        </motion.h3>
        
        <motion.p 
          className="text-[#e7e7e7]/70 text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isGenerating ? (
            statusText || "Please wait while we generate your content..."
          ) : (
            "Ready to proceed to the next step."
          )}
        </motion.p>
        
        {isGenerating && (
          <div className="w-full max-w-xs mx-auto">
            <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#e2c376] to-[#c4a75f]" 
                style={{ width: `${progressPercentage}%` }}
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 