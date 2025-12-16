'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from '@/components/ui/ClientMotion'
import { useTheme } from '@/context/ThemeContext'

interface Engine {
  id: string
  name: string
  icon: string
  description: string
}

interface StoryForgeLoaderProps {
  isVisible: boolean
  progress?: number
  currentStep?: string
  engines?: Engine[]
  currentEngineIndex?: number
  statusMessage?: string
  elapsedTime?: number
  onComplete?: () => void
}

// Real engine definitions matching the actual story bible generation
const REAL_ENGINES: Engine[] = [
  { id: 'premise', name: 'Premise Engine', icon: '🎯', description: 'Analyzing story foundation and thematic structure' },
  { id: 'character', name: 'Character Engine', icon: '👥', description: 'Creating complex 3D characters with psychology' },
  { id: 'narrative', name: 'Narrative Engine', icon: '📖', description: 'Building fractal story structure and arcs' },
  { id: 'world', name: 'World Engine', icon: '🌍', description: 'Building immersive settings and environments' },
  { id: 'marketing', name: 'Marketing Engine', icon: '📢', description: 'Developing comprehensive marketing strategy' },
  { id: 'dialogue', name: 'Dialogue Engine', icon: '💬', description: 'Crafting strategic character conversations' },
  { id: 'tension', name: 'Tension Engine', icon: '⚡', description: 'Building and releasing dramatic tension' },
  { id: 'genre', name: 'Genre Engine', icon: '🎭', description: 'Optimizing for genre-specific storytelling' },
  { id: 'choice', name: 'Choice Engine', icon: '🔀', description: 'Creating meaningful branching narratives' },
  { id: 'theme', name: 'Theme Engine', icon: '🎨', description: 'Integrating thematic elements throughout' },
  { id: 'living', name: 'Living World Engine', icon: '🌱', description: 'Making the world feel alive and reactive' },
  { id: 'trope', name: 'Trope Engine', icon: '🔄', description: 'Subverting and enhancing genre conventions' },
  { id: 'cohesion', name: 'Cohesion Engine', icon: '🔗', description: 'Ensuring story elements connect logically' }
]

// Helper function for time formatting
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function StoryForgeLoader({
  isVisible,
  progress: propProgress = 0,
  currentStep: propCurrentStep = 'Initializing...',
  engines: propEngines = [],
  currentEngineIndex: propCurrentEngineIndex = 0,
  statusMessage: propStatusMessage,
  elapsedTime: propElapsedTime = 0,
  onComplete
}: StoryForgeLoaderProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Use provided engines or fall back to REAL_ENGINES
  const engines = propEngines.length > 0 ? propEngines : REAL_ENGINES
  
  // State for real-time API progress
  const [realProgress, setRealProgress] = useState(0)
  const [currentEngineIndex, setCurrentEngineIndex] = useState(0)
  const [statusMessage, setStatusMessage] = useState('Initializing...')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  
  // Use refs to track if we should use API data or props
  const useApiData = useRef(false)
  
  // Start timer when component becomes visible
  useEffect(() => {
    if (isVisible && !startTime) {
      setStartTime(Date.now())
      setElapsedTime(0)
      setIsComplete(false)
      useApiData.current = true
    }
  }, [isVisible, startTime])
  
  // Update elapsed time every second
  useEffect(() => {
    if (!startTime || !isVisible) return
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setElapsedTime(elapsed)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [startTime, isVisible])
  
  // Poll engine status API for real-time progress
  useEffect(() => {
    if (!isVisible || !useApiData.current) return
    
    const pollEngineProgress = async () => {
      try {
        const response = await fetch('/api/engine-status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.progress) {
            const { engines: engineData, overallProgress, currentEngine } = data.progress
            
            // Update overall progress
            if (typeof overallProgress === 'number') {
              setRealProgress(overallProgress)
            }
            
            // Update current engine index
            if (typeof currentEngine === 'number') {
              setCurrentEngineIndex(Math.min(currentEngine, engines.length - 1))
            }
            
            // Update status message from active engine
            if (engineData && Array.isArray(engineData) && engineData.length > 0) {
              const activeEngine = engineData.find((e: any) => e.status === 'active') || engineData[engineData.length - 1]
              if (activeEngine && activeEngine.message) {
                setStatusMessage(activeEngine.message)
              } else if (currentEngine < engines.length) {
                setStatusMessage(engines[currentEngine]?.description || 'Processing...')
              }
            }
          }
          
          // Check if generation is complete
          if (data.session && data.session.isComplete && realProgress >= 95) {
            setIsComplete(true)
            setRealProgress(100)
            setStatusMessage('Story generation complete!')
            
            if (onComplete) {
              setTimeout(() => onComplete(), 2000)
            }
            return // Stop polling
          }
        }
      } catch (error) {
        console.warn('Failed to fetch engine progress:', error)
        // Fall back to props if API fails
        useApiData.current = false
      }
    }
    
    // Poll every 500ms for smooth updates
    const interval = setInterval(pollEngineProgress, 500)
    
    // Initial poll
    pollEngineProgress()
    
    return () => clearInterval(interval)
  }, [isVisible, engines, realProgress, onComplete])
  
  // Determine which values to use (API data or props)
  const progress = useApiData.current ? realProgress : propProgress
  const currentStep = useApiData.current ? statusMessage : propCurrentStep
  const displayStatusMessage = useApiData.current ? statusMessage : (propStatusMessage || propCurrentStep)
  const displayElapsedTime = useApiData.current ? elapsedTime : propElapsedTime
  const displayEngineIndex = useApiData.current ? currentEngineIndex : propCurrentEngineIndex
  
  const circumference = 2 * Math.PI * 60
  const offset = circumference - (progress / 100) * circumference
  
  const currentEngine = engines[displayEngineIndex] || engines[0]

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Banner Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-2xl px-4"
        >
          <div className={`p-4 rounded-lg border-2 ${
            isDark 
              ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-200' 
              : 'bg-yellow-50 border-yellow-400 text-yellow-900'
          } shadow-lg`}>
            <p className="text-sm font-semibold text-center">
              ⚠️ Generation takes approximately 10-15 minutes. Please do not leave this page or generation will fail.
            </p>
          </div>
        </motion.div>

        {/* Floating Particles Background - Rising from Bottom */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => {
            const baseX = (i * 8.33) % 100 // Distribute across width (0-100%)
            const baseDuration = 4 + (i % 3)
            const baseDelay = i * 0.5
            
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: isDark ? '#10B981' : '#059669',
                  left: `${baseX}%`,
                  top: '100%',
                  boxShadow: isDark 
                    ? `0 0 8px #10B981, 0 0 12px #10B981`
                    : `0 0 8px #059669, 0 0 12px #059669`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  y: '-100vh',
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0]
                }}
                transition={{
                  duration: baseDuration,
                  repeat: Infinity,
                  delay: baseDelay,
                  ease: "easeOut"
                }}
              />
            )
          })}
        </div>

        {/* Main Content */}
        <div className="text-center space-y-8 max-w-md relative z-10">
          {/* Progress Ring with Breathing Glow */}
          <div className="relative w-48 h-48 mx-auto">
            <svg className="transform -rotate-90 w-full h-full">
              <circle
                cx="96"
                cy="96"
                r="60"
                stroke={isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="60"
                stroke={isDark ? '#10B981' : '#E2C376'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ 
                  strokeDashoffset: offset,
                  filter: [
                    isDark ? 'drop-shadow(0 0 8px #10B981)' : 'drop-shadow(0 0 8px #E2C376)',
                    isDark ? 'drop-shadow(0 0 16px #10B981)' : 'drop-shadow(0 0 16px #E2C376)',
                    isDark ? 'drop-shadow(0 0 8px #10B981)' : 'drop-shadow(0 0 8px #E2C376)',
                  ],
                }}
                transition={{ 
                  strokeDashoffset: { duration: 0.3 },
                  filter: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold ${isDark ? 'text-[#10B981]' : 'text-[#E2C376]'}`}>
                  {Math.round(progress)}%
                </div>
                <div className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  {formatTime(displayElapsedTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Current Engine Content */}
          {currentEngine && (
            <motion.div
              key={currentEngine.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className={`text-5xl ${isDark ? 'text-[#10B981]' : 'text-[#E2C376]'}`}>
                {currentEngine.icon}
              </div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                {currentEngine.name}
              </h3>
              <p className={`${isDark ? 'text-white/70' : 'text-black/70'}`}>
                {displayStatusMessage || currentEngine.description}
              </p>
            </motion.div>
          )}

          {/* Status Message */}
          {displayStatusMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`p-4 rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} border`}
            >
              <p className={`text-sm italic ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                {displayStatusMessage}
              </p>
            </motion.div>
          )}

          {/* Playbook Flavor Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`p-4 rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} border`}
          >
            <p className={`text-sm italic ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              "Every great story starts with a single moment. We're crafting yours now."
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

