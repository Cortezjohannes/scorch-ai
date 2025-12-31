'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface LoadingCinematicProps {
  message?: string
  variant?: 'spinner' | 'progress' | 'film' | 'pulse'
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingCinematic({
  message = 'Loading...',
  variant = 'film',
  size = 'md'
}: LoadingCinematicProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const renderSpinner = () => (
    <motion.div
      className={`${sizeClasses[size]} border-4 border-[#10B981]/20 border-t-[#10B981] rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )

  const renderProgress = () => (
    <div className="space-y-2">
      <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#10B981] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <p className="text-xs text-white/60 text-center">Processing...</p>
    </div>
  )

  const renderFilm = () => (
    <div className="relative">
      {/* Film strip container */}
      <div className="relative bg-black rounded-lg p-4 border border-white/20">
        {/* Film perforation holes */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around px-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>

        {/* Film frames */}
        <div className="flex space-x-2 px-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-8 h-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded border border-gray-500"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.95, 1.05, 0.95]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>

        {/* Film perforation holes */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-around px-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2 + 0.5
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading text */}
      <motion.p
        className="text-sm text-white/70 text-center mt-4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Developing...
      </motion.p>
    </div>
  )

  const renderPulse = () => (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-[#10B981] rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return renderSpinner()
      case 'progress':
        return renderProgress()
      case 'film':
        return renderFilm()
      case 'pulse':
        return renderPulse()
      default:
        return renderSpinner()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      {renderLoader()}
      {message && (
        <motion.p
          className="text-white/70 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}