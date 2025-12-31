'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ComingSoonOverlayProps {
  title: string
  description: string
  children: React.ReactNode
}

export function ComingSoonOverlay({ title, description, children }: ComingSoonOverlayProps) {
  return (
    <div className="relative">
      {children}
      
      {/* Coming Soon Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1a1a] border-2 border-[#e2c376]/50 rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl pointer-events-auto"
        >
          <div className="mb-4">
            <div className="inline-block px-4 py-2 bg-[#e2c376]/20 text-[#e2c376] rounded-full text-sm font-semibold mb-4">
              Coming Soon
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>This feature is currently under development</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

