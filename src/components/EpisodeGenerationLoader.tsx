'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface EpisodeGenerationLoaderProps {
  episodeNumber: number
  seriesTitle: string
  isPremiumMode?: boolean
  episodeData?: any | null  // Episode data from API response
  onComplete?: () => void
}

interface GenerationPhase {
  name: string
  description: string
  progress: number
  icon: string
}

const GENERATION_PHASES: GenerationPhase[] = [
  {
    name: 'Initializing',
    description: 'Preparing creative workspace...',
    progress: 10,
    icon: '🎬'
  },
  {
    name: 'Analyzing Context',
    description: 'Understanding your story universe...',
    progress: 30,
    icon: '🧠'
  },
  {
    name: 'Writing Scenes',
    description: 'Crafting narrative moments...',
    progress: 70,
    icon: '✍️'
  },
  {
    name: 'Enhancing',
    description: 'Applying cinematic engines...',
    progress: 95,
    icon: '✨'
  },
  {
    name: 'Finalizing',
    description: 'Polishing your episode...',
    progress: 100,
    icon: '🎯'
  }
]

const PREMIUM_PHASES: GenerationPhase[] = [
  {
    name: 'Initializing',
    description: 'Preparing premium workspace...',
    progress: 10,
    icon: '🎬'
  },
  {
    name: 'Analyzing Context',
    description: 'Deep analysis of story universe...',
    progress: 25,
    icon: '🧠'
  },
  {
    name: 'Writing Scenes',
    description: 'Crafting narrative foundation...',
    progress: 50,
    icon: '✍️'
  },
  {
    name: 'Engine Enhancement',
    description: 'Running 19 cinematic engines...',
    progress: 85,
    icon: '⚡'
  },
  {
    name: 'Final Synthesis',
    description: 'Weaving enhancements together...',
    progress: 100,
    icon: '✨'
  }
]

export default function EpisodeGenerationLoader({
  episodeNumber,
  seriesTitle,
  isPremiumMode = false,
  episodeData,
  onComplete
}: EpisodeGenerationLoaderProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  const phases = isPremiumMode ? PREMIUM_PHASES : GENERATION_PHASES
  const currentPhase = phases[currentPhaseIndex]
  
  // Client-side mount detection
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // REMOVED: Don't check episodeData for completion flag
  // We only want to detect completion via localStorage AFTER the episode is saved
  // This prevents premature redirects before the save completes
  
  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Smooth progress simulation
  useEffect(() => {
    const targetProgress = currentPhase.progress
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= targetProgress) {
          // Move to next phase if not at the end
          if (currentPhaseIndex < phases.length - 1) {
            setTimeout(() => {
              setCurrentPhaseIndex(currentPhaseIndex + 1)
            }, 500)
          }
          return prev
        }
        // Smooth progress increment
        const increment = (targetProgress - prev) / 20
        return Math.min(prev + Math.max(increment, 0.5), targetProgress)
      })
    }, 100)
    
    return () => clearInterval(interval)
  }, [currentPhase, currentPhaseIndex, phases.length])
  
  // Poll localStorage for completed episode
  useEffect(() => {
    console.log(`🔄 Starting to poll for episode ${episodeNumber} completion...`)
    let completionTriggered = false
    
    const pollInterval = setInterval(() => {
      try {
        const savedEpisodes = localStorage.getItem('greenlit-episodes') || 
                             localStorage.getItem('scorched-episodes') || 
                             localStorage.getItem('reeled-episodes')
        
        if (savedEpisodes) {
          const episodes = JSON.parse(savedEpisodes)
          const episode = episodes[episodeNumber]
          
          // Log polling status every 5 seconds
          if (Date.now() % 5000 < 1000) {
            console.log(`🔍 Polling status for episode ${episodeNumber}:`, {
              episodeExists: !!episode,
              hasCompletionFlag: episode?._generationComplete === true,
              episodeNumber: episode?.episodeNumber
            })
          }
          
          // Check if episode is complete with proper flags
          if (episode && episode._generationComplete === true && !completionTriggered) {
            completionTriggered = true
            console.log(`✅ Episode ${episodeNumber} generation complete! Triggering callback...`)
            setIsComplete(true)
            setProgress(100)
            setCurrentPhaseIndex(phases.length - 1)
            
            // Clear the interval immediately
            clearInterval(pollInterval)
            
            // Trigger completion callback after a brief moment
            setTimeout(() => {
              console.log(`📞 Calling onComplete callback for episode ${episodeNumber}`)
              onComplete?.()
            }, 1500)
          }
        } else {
          console.log(`⚠️ No episodes found in localStorage during polling`)
        }
      } catch (error) {
        console.error('Error polling for episode completion:', error)
      }
    }, 1000) // Poll every second
    
    return () => {
      console.log(`🛑 Stopped polling for episode ${episodeNumber}`)
      clearInterval(pollInterval)
    }
  }, [episodeNumber, onComplete, phases.length])
  
  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a]" />
      
      {/* Subtle moving gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: isPremiumMode 
            ? [
                'radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(212, 175, 55, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.3) 0%, transparent 50%)'
              ]
            : [
                'radial-gradient(circle at 20% 50%, rgba(0, 255, 153, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(0, 255, 153, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(0, 255, 153, 0.2) 0%, transparent 50%)'
              ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Main content */}
      <motion.div
        className="relative z-10 max-w-2xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Cinematic frame border */}
        <div className={`relative border-2 ${
          isPremiumMode 
            ? 'border-[#d4af37]/30' 
            : 'border-[#10B981]/30'
        } rounded-lg p-8 md:p-12 backdrop-blur-sm bg-black/40`}>
          
          {/* Film strip decoration - top */}
          <div className="absolute top-0 left-0 right-0 h-3 flex justify-between px-2">
            {[...Array(20)].map((_, i) => (
              <div key={`top-${i}`} className={`w-2 h-full ${
                isPremiumMode ? 'bg-[#d4af37]/20' : 'bg-[#10B981]/20'
              }`} />
            ))}
          </div>
          
          {/* Film strip decoration - bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-3 flex justify-between px-2">
            {[...Array(20)].map((_, i) => (
              <div key={`bottom-${i}`} className={`w-2 h-full ${
                isPremiumMode ? 'bg-[#d4af37]/20' : 'bg-[#10B981]/20'
              }`} />
            ))}
          </div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="text-6xl mb-4"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentPhase.icon}
            </motion.div>
            
            <h1 className={`text-2xl md:text-3xl font-serif font-bold mb-2 ${
              isPremiumMode 
                ? 'text-[#d4af37]' 
                : 'text-[#10B981]'
            }`}>
              {isPremiumMode ? '✨ Premium Generation' : 'Creating Episode'}
            </h1>
            
            <p className="text-[#e7e7e7]/70 text-lg">
              {seriesTitle} • Episode {episodeNumber}
            </p>
          </div>
          
          {/* Current phase */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhaseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-xl font-semibold text-[#e7e7e7] mb-2">
                {currentPhase.name}
              </h2>
              <p className="text-[#e7e7e7]/60">
                {currentPhase.description}
              </p>
            </motion.div>
          </AnimatePresence>
          
          {/* Progress bar */}
          <div className="mb-6">
            <div className="w-full h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  isPremiumMode
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#f4d03f]'
                    : 'bg-gradient-to-r from-[#10B981] to-[#00cc7a]'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            
            {/* Progress percentage and time */}
            <div className="flex justify-between items-center mt-3 text-sm">
              <span className={isPremiumMode ? 'text-[#d4af37]' : 'text-[#10B981]'}>
                {Math.round(progress)}%
              </span>
              {isMounted && (
                <span className="text-[#e7e7e7]/50">
                  {formatTime(elapsedTime)}
                </span>
              )}
            </div>
          </div>
          
          {/* Phase indicators */}
          <div className="flex justify-between items-center mb-6">
            {phases.map((phase, index) => (
              <div key={index} className="flex flex-col items-center">
                <motion.div
                  className={`w-3 h-3 rounded-full ${
                    index <= currentPhaseIndex
                      ? isPremiumMode
                        ? 'bg-[#d4af37]'
                        : 'bg-[#10B981]'
                      : 'bg-[#2a2a2a]'
                  }`}
                  animate={index === currentPhaseIndex ? {
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.7, 1]
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            ))}
          </div>
          
          {/* Premium mode indicator */}
          {isPremiumMode && (
            <motion.div
              className="text-center mt-6 text-[#d4af37]/70 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚡ Running 19 Cinematic Engines
            </motion.div>
          )}
          
          {/* Completion state */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mt-6 text-[#10B981] font-semibold"
            >
              ✓ Generation Complete • Transitioning to episode...
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}


