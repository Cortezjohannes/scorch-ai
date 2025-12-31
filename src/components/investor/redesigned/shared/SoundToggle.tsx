'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SoundToggleProps {
  isEnabled: boolean
  onToggle: () => void
  className?: string
}

export default function SoundToggle({ isEnabled, onToggle, className = '' }: SoundToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  // Play sound effect when toggling (if enabled)
  useEffect(() => {
    if (isAnimating && isEnabled) {
      playToggleSound()
    }
  }, [isAnimating, isEnabled])

  const playToggleSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(isEnabled ? 800 : 400, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(
        isEnabled ? 600 : 300,
        audioContext.currentTime + 0.1
      )

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      // Fallback: no sound
    }
  }

  const handleClick = () => {
    setIsAnimating(true)
    onToggle()
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <button
      onClick={handleClick}
      className={`relative p-3 rounded-lg transition-colors duration-200 ${
        isEnabled
          ? 'bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981]'
          : 'bg-white/10 hover:bg-white/20 text-white/60'
      } ${className}`}
      title={isEnabled ? 'Disable sound effects' : 'Enable sound effects'}
    >
      <motion.div
        animate={isAnimating ? { scale: 1.2 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {isEnabled ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.414 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.414l3.969-3.816a1 1 0 011.616 0zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.414 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.414l3.969-3.816a1 1 0 011.616 0zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </motion.div>

      {/* Sound waves animation when enabled */}
      {isEnabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 bg-[#10B981] rounded-full"
              style={{
                height: `${4 + i * 2}px`,
                left: `${8 + i * 6}px`
              }}
              animate={{
                scaleY: [1, 0.3, 1],
                opacity: [0.7, 0.3, 0.7]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {isEnabled ? 'Sound On' : 'Sound Off'}
      </div>
    </button>
  )
}