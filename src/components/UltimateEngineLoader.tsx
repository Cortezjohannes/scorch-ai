'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface UltimateEngineLoaderProps {
  isVisible: boolean
  progress?: number
  currentStep?: string
  onComplete?: () => void
}

// Real engine definitions matching the actual story bible generation
const REAL_ENGINES = [
  { id: 'premise', name: 'Premise Engine', icon: '🎯', description: 'Analyzing story foundation and thematic structure' },
  { id: 'character', name: 'Character Engine', icon: '👥', description: 'Creating complex 3D characters with psychology' },
  { id: 'narrative', name: 'Narrative Engine', icon: '📖', description: 'Building fractal story structure and arcs' },
  { id: 'world', name: 'World Engine', icon: '🌍', description: 'Building immersive settings and environments' },
  { id: 'dialogue', name: 'Dialogue Engine', icon: '💬', description: 'Crafting strategic character conversations' },
  { id: 'tension', name: 'Tension Engine', icon: '⚡', description: 'Building and releasing dramatic tension' },
  { id: 'genre', name: 'Genre Engine', icon: '🎭', description: 'Optimizing for genre-specific storytelling' },
  { id: 'choice', name: 'Choice Engine', icon: '🔀', description: 'Creating meaningful branching narratives' },
  { id: 'theme', name: 'Theme Engine', icon: '🎨', description: 'Integrating thematic elements throughout' },
  { id: 'living', name: 'Living World Engine', icon: '🌱', description: 'Making the world feel alive and reactive' },
  { id: 'trope', name: 'Trope Engine', icon: '🔄', description: 'Subverting and enhancing genre conventions' },
  { id: 'cohesion', name: 'Cohesion Engine', icon: '🔗', description: 'Ensuring story elements connect logically' }
]

export default function UltimateEngineLoader({ 
  isVisible, 
  progress = 0, 
  currentStep = 'Initializing Murphy Engine...', 
  onComplete 
}: UltimateEngineLoaderProps) {
  const [currentEngineIndex, setCurrentEngineIndex] = useState(0)
  const [engineProgress, setEngineProgress] = useState<{ [key: string]: number }>({})
  const [overallProgress, setOverallProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return 'server'
    return Math.random().toString(36).substring(2, 8)
  })
  const [statusMessage, setStatusMessage] = useState('Initializing Murphy Engine...')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  // Start timer when component becomes visible - RESET on each new session
  useEffect(() => {
    if (isVisible) {
      console.log('🕐 Resetting timer for new generation session')
      setStartTime(Date.now())
      setElapsedTime(0)
      setIsComplete(false)
      setOverallProgress(0)
      setEngineProgress({})
      setStatusMessage('Initializing Murphy Engine...')
    }
  }, [isVisible])

  // Update elapsed time every second
  useEffect(() => {
    if (!startTime) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  // Format elapsed time as MM:SS
  const formatElapsedTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Real-time engine progress polling (connected to actual API progress)
  useEffect(() => {
    if (!isVisible) return

    // Poll the real engine status API for actual progress
    const pollEngineProgress = async () => {
      try {
        const response = await fetch('/api/engine-status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('🔍 Full API Response:', JSON.stringify(data, null, 2))
          
          if (data.progress) {
            const { engines, overallProgress, currentEngine } = data.progress
            console.log('🔍 Progress Object:', { engines, overallProgress, currentEngine })
            
            // Update overall progress
            setOverallProgress(overallProgress || 0)
            
            // Update current engine index
            if (typeof currentEngine === 'number') {
              setCurrentEngineIndex(Math.min(currentEngine, REAL_ENGINES.length - 1))
              console.log('🔍 Current engine index set to:', currentEngine)
            }
            
            // 🔧 CRITICAL FIX: Update individual engine progress from API
            if (engines && engines.length > 0) {
              const newEngineProgress: { [key: string]: number } = {}
              
              // Engine IDs from API exactly match REAL_ENGINES IDs (premise, character, narrative, etc.)
              console.log('📊 Engine progress received:', engines.map((e: any) => `${e.engineId}: ${e.progress}%`))
              
              engines.forEach((engineData: any) => {
                if (engineData.engineId && typeof engineData.progress === 'number') {
                  // Direct mapping - API engine IDs already match our REAL_ENGINES IDs
                  newEngineProgress[engineData.engineId] = Math.max(0, Math.min(100, engineData.progress))
                  console.log(`✅ ${engineData.engineId}: ${engineData.progress}%`)
                }
              })
              
              // Mark previous engines as complete if current engine is ahead
              REAL_ENGINES.forEach((engine, index) => {
                if (index < currentEngine && !newEngineProgress[engine.id]) {
                  newEngineProgress[engine.id] = 100 // Previous engines should be complete
                }
                if (index === currentEngine && !newEngineProgress[engine.id]) {
                  // Current engine should have some progress if it's active
                  newEngineProgress[engine.id] = Math.max(10, overallProgress / REAL_ENGINES.length * (index + 1))
                }
              })
              
              console.log('🔄 Updating individual engine progress:', newEngineProgress)
              setEngineProgress(newEngineProgress)
              
              // Update status message
              const activeEngine = engines.find((e: any) => e.status === 'active') 
                || engines[engines.length - 1] // fallback to most recent
                
              if (activeEngine && activeEngine.message) {
                setStatusMessage(activeEngine.message)
              } else if (currentEngine < REAL_ENGINES.length) {
                setStatusMessage(REAL_ENGINES[currentEngine]?.description || 'Processing...')
              }
            } else if (overallProgress > 0) {
              // 🔧 FALLBACK: If engines array is empty but we have overall progress, estimate individual progress
              console.log('⚠️ No engines data from API, estimating from overall progress:', overallProgress + '%')
              const newEngineProgress: { [key: string]: number } = {}
              
              // Estimate which engines should be complete/active based on overall progress
              const progressPerEngine = 100 / REAL_ENGINES.length
              const currentEngineByProgress = Math.floor(overallProgress / progressPerEngine)
              const currentEngineProgress = (overallProgress % progressPerEngine) / progressPerEngine * 100
              
              REAL_ENGINES.forEach((engine, index) => {
                if (index < currentEngineByProgress) {
                  newEngineProgress[engine.id] = 100 // Completed engines
                } else if (index === currentEngineByProgress) {
                  newEngineProgress[engine.id] = Math.max(10, currentEngineProgress) // Current engine
                } else {
                  newEngineProgress[engine.id] = 0 // Future engines
                }
              })
              
              setCurrentEngineIndex(currentEngineByProgress)
              setEngineProgress(newEngineProgress)
              setStatusMessage(REAL_ENGINES[currentEngineByProgress]?.description || 'Processing...')
              console.log('🔄 Estimated engine progress:', newEngineProgress)
            }
          }
          
          // Check if generation is complete
          if (data.session && data.session.isComplete && overallProgress >= 95) {
            console.log('🎉 Generation actually complete - overall progress:', overallProgress)
            setIsComplete(true)
            setOverallProgress(100)
            setStatusMessage('Story generation complete!')
            
            // 🔧 CRITICAL FIX: Mark all engines as complete when session is done
            const completedEngineProgress: { [key: string]: number } = {}
            REAL_ENGINES.forEach(engine => {
              completedEngineProgress[engine.id] = 100
            })
            setEngineProgress(completedEngineProgress)
            console.log('🎉 All engines marked as complete!')
            
            if (onComplete) {
              setTimeout(() => onComplete(), 2000)
            }
            return // Stop polling
          } else if (data.session && data.session.isComplete) {
            console.log('⚠️ Session claims complete but progress only:', overallProgress, '% - ignoring completion flag')
          }
        }
      } catch (error) {
        console.warn('Failed to fetch real engine progress, falling back to simulation:', error)
        
        // Fallback to time-based simulation if API fails
      const elapsed = Date.now() - (startTime || Date.now())
        const totalTime = REAL_ENGINES.length * 3000
        const simulatedProgress = Math.min((elapsed / totalTime) * 100, 100)
        const simulatedEngineIndex = Math.min(Math.floor(elapsed / 3000), REAL_ENGINES.length - 1)
        
        setOverallProgress(Math.round(simulatedProgress))
        setCurrentEngineIndex(simulatedEngineIndex)
        
        // 🔧 CRITICAL FIX: Also simulate individual engine progress in fallback
        const newEngineProgress: { [key: string]: number } = {}
        REAL_ENGINES.forEach((engine, index) => {
          if (index < simulatedEngineIndex) {
            // Previous engines are complete
            newEngineProgress[engine.id] = 100
          } else if (index === simulatedEngineIndex) {
            // Current engine progress within its time slot
            const engineElapsed = elapsed - (index * 3000)
            const engineProgress = Math.max(0, Math.min(100, (engineElapsed / 3000) * 100))
            newEngineProgress[engine.id] = engineProgress
          } else {
            // Future engines haven't started
            newEngineProgress[engine.id] = 0
          }
        })
        
        console.log('🔄 Fallback simulation - updating individual engine progress:', newEngineProgress)
        setEngineProgress(newEngineProgress)
        
        if (simulatedEngineIndex < REAL_ENGINES.length) {
          setStatusMessage(REAL_ENGINES[simulatedEngineIndex].description)
        }
        
        if (simulatedProgress >= 100) {
        setIsComplete(true)
        setStatusMessage('Story generation complete!')
          
          // 🔧 CRITICAL FIX: Mark all engines as complete in fallback mode too
          const completedEngineProgress: { [key: string]: number } = {}
          REAL_ENGINES.forEach(engine => {
            completedEngineProgress[engine.id] = 100
          })
          setEngineProgress(completedEngineProgress)
          console.log('🎉 Fallback - All engines marked as complete!')
          
        if (onComplete) {
          setTimeout(() => onComplete(), 2000)
          }
        }
      }
    }

    // Poll every 500ms for smooth real-time updates
    const interval = setInterval(pollEngineProgress, 500)
    
    // Initial poll
    pollEngineProgress()
    
    return () => clearInterval(interval)
  }, [isVisible, onComplete, startTime])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a] flex items-center justify-center"
        style={{ fontFamily: 'League Spartan, sans-serif' }}
      >
        {/* Animated Background with Brand Colors */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#00FF99]/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
          {/* Gradient orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF99]/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00CC7A]/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>
        {/* Main Container - More Compact */}
        <div className="w-full max-w-5xl p-4 space-y-4">
          
        {/* Sophisticated Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          {/* Animated Logo */}
          <motion.div
            className="relative w-24 h-24 mx-auto"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF99]/20 to-[#00CC7A]/20 rounded-2xl blur-xl" />
            <div className="relative w-full h-full bg-gradient-to-br from-[#00FF99]/10 to-[#00CC7A]/10 rounded-2xl border border-[#00FF99]/30 flex items-center justify-center backdrop-blur-sm">
              <motion.span
                className="text-4xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ⚡
              </motion.span>
            </div>
          </motion.div>
          
          {/* Main Title with Enhanced Typography */}
          <motion.h1
            className="text-6xl font-black bg-gradient-to-r from-white via-[#00FF99] to-white bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: '200% 100%',
            }}
          >
              GREENLIT ENGINES
          </motion.h1>
          
          {/* Subtitle with Better Spacing */}
          <div className="space-y-2">
            <motion.p
              className="text-xl text-white/90 font-medium tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Session {sessionId} • {REAL_ENGINES.length} Revolutionary Engines
            </motion.p>
            <motion.div
              className="h-8 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.p
                className="text-lg text-[#00FF99] font-medium px-4 py-2 rounded-full bg-[#00FF99]/10 border border-[#00FF99]/30"
                animate={{
                  scale: isComplete ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: isComplete ? Infinity : 0,
                }}
              >
              {isComplete ? '🎬 PRODUCTION COMPLETE!' : statusMessage}
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        {/* Sophisticated Progress Section */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative bg-gradient-to-r from-black/40 via-black/60 to-black/40 backdrop-blur-sm border border-[#00FF99]/20 rounded-2xl p-8 shadow-2xl"
        >
          {/* Progress Header */}
          <div className="flex justify-between items-center mb-6">
            <motion.h2
              className="text-2xl font-bold bg-gradient-to-r from-[#00FF99] to-[#00CC7A] bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: '200% 100%',
              }}
            >
              PRODUCTION PROGRESS
            </motion.h2>
            <div className="flex items-center space-x-6">
              <motion.div
                className="text-center"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="text-3xl font-black text-[#00FF99]">{Math.round(overallProgress)}%</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">Complete</div>
              </motion.div>
              <div className="text-center">
                <div className="text-lg text-white/90 font-mono font-medium">
                  🕐 {formatElapsedTime(elapsedTime)}
                </div>
                <div className="text-xs text-white/60 uppercase tracking-wider">Elapsed</div>
              </div>
              </div>
            </div>
            
          {/* Enhanced Progress Bar */}
          <div className="relative">
            <div className="h-6 bg-black/50 rounded-full overflow-hidden border border-[#00FF99]/30 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00CC7A] via-[#00FF99] to-[#33FFAD] relative"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Shimmer effect */}
            <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#00FF99]/20 to-[#00CC7A]/20 blur-sm"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>
            
            {/* Progress markers */}
            <div className="flex justify-between mt-2 text-xs text-white/60">
              {[0, 25, 50, 75, 100].map((marker) => (
                <div key={marker} className="text-center">
                  <div className="w-1 h-1 bg-white/40 rounded-full mx-auto mb-1" />
                  {marker}%
                </div>
              ))}
            </div>
          </div>
          </motion.div>

        {/* Sophisticated Engine Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-4 gap-4 max-w-5xl mx-auto"
        >
            {REAL_ENGINES.map((engine, index) => {
              const isActive = index === currentEngineIndex
              const isCompleted = engineProgress[engine.id] >= 100
              const progress = engineProgress[engine.id] || 0
            const isUpcoming = index > currentEngineIndex
                  
                  return (
                    <motion.div
                  key={engine.id}
                initial={{ scale: 0, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.6,
                  ease: "easeOut"
                }}
                whileHover={{ scale: 1.02 }}
                className={`relative group p-6 rounded-2xl border-2 transition-all duration-500 backdrop-blur-sm ${
                    isActive 
                    ? 'border-[#00FF99] bg-gradient-to-br from-[#00FF99]/20 via-[#00FF99]/10 to-[#00CC7A]/20 shadow-2xl shadow-[#00FF99]/20' 
                      : isCompleted 
                      ? 'border-[#00FF99]/60 bg-gradient-to-br from-[#00FF99]/10 to-[#00CC7A]/10 shadow-lg' 
                      : isUpcoming
                        ? 'border-[#00FF99]/20 bg-black/30'
                        : 'border-[#00FF99]/30 bg-black/40'
                }`}
              >
                {/* Engine Status Glow */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#00FF99]/10 to-[#00CC7A]/10 rounded-2xl blur-xl"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                  {/* Engine Icon and Name */}
                <div className="relative text-center space-y-3">
                  <motion.div
                    className={`text-3xl ${isActive ? 'animate-pulse' : ''}`}
                    animate={isActive ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: isActive ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  >
                      {engine.icon}
                  </motion.div>
                  <h3 className={`text-sm font-bold transition-all duration-300 ${
                    isActive ? 'text-[#00FF99]' : 
                    isCompleted ? 'text-[#00FF99]/90' : 
                    isUpcoming ? 'text-white/50' : 'text-white/70'
                        }`}>
                          {engine.name}
                    </h3>
                  </div>

                {/* Enhanced Progress Bar */}
                <div className="mt-4 space-y-3">
                  <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden border border-[#00FF99]/30 shadow-inner">
                      <motion.div
                      className={`h-full rounded-full relative ${
                        isActive ? 'bg-gradient-to-r from-[#00CC7A] to-[#00FF99]' : 
                        isCompleted ? 'bg-gradient-to-r from-[#00FF99] to-[#00CC7A]' : 
                        'bg-[#00FF99]/30'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      {/* Shimmer effect for active engines */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </motion.div>
                    </div>
                  <div className="flex justify-between items-center">
                    <div className={`text-xs font-bold ${
                      isActive ? 'text-[#00FF99]' : 
                      isCompleted ? 'text-[#00FF99]/80' : 
                      'text-white/60'
                    }`}>
                      {Math.round(progress)}%
                    </div>
                      {isCompleted && (
                      <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        className="text-[#00FF99] text-sm"
                      >
                        ✓
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="absolute top-3 right-3">
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="w-6 h-6 bg-[#00FF99] rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-bold">✓</span>
                    </motion.div>
                  )}
                  {isActive && !isCompleted && (
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="w-6 h-6 bg-gradient-to-r from-[#00FF99] to-[#00CC7A] rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xs">⚡</span>
                    </motion.div>
                      )}
                  </div>
                    </motion.div>
                  )
                })}
        </motion.div>

        {/* Sophisticated Engine Details */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center space-y-6"
        >
          <motion.div
            className="inline-flex items-center space-x-6 p-8 bg-gradient-to-r from-black/40 via-black/60 to-black/40 backdrop-blur-sm border border-[#00FF99]/20 rounded-2xl shadow-2xl"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="text-4xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {REAL_ENGINES[currentEngineIndex]?.icon}
            </motion.div>
            <div className="text-left">
              <motion.h3
                className="text-2xl font-bold bg-gradient-to-r from-[#00FF99] to-[#00CC7A] bg-clip-text text-transparent mb-2"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: '200% 100%',
                }}
              >
                  {REAL_ENGINES[currentEngineIndex]?.name}
              </motion.h3>
              <p className="text-lg text-white/90 font-medium max-w-md">
                  {REAL_ENGINES[currentEngineIndex]?.description}
                </p>
              </div>
          </motion.div>
            </motion.div>

        {/* Sophisticated Status Bar */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-black/95 via-black/90 to-black/95 backdrop-blur-md border-t border-[#00FF99]/30 p-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              {/* Left side - Phase info */}
              <div className="flex items-center space-x-8">
                <motion.div
                  className="flex items-center space-x-3"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="w-3 h-3 bg-[#00FF99] rounded-full animate-pulse" />
                  <span className="text-[#00FF99] font-bold text-lg">
                    Phase {Math.floor(overallProgress / 25) + 1} of 4
              </span>
                </motion.div>
                <div className="flex items-center space-x-2">
                  <span className="text-white/80 text-lg">⚡</span>
                  <span className="text-white/80 font-medium">Production AI: Greenlit Routing</span>
                </div>
            </div>

              {/* Right side - Engine stats */}
              <div className="flex items-center space-x-8">
                <motion.div
                  className="flex items-center space-x-2"
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <span className="text-[#00FF99] text-lg">✅</span>
                  <span className="text-[#00FF99] font-bold">
                    {Object.values(engineProgress).filter(p => p >= 100).length} Complete
                </span>
                </motion.div>
                
                <motion.div
                  className="flex items-center space-x-2"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <span className="text-[#00CC7A] text-lg">⚡</span>
                  <span className="text-[#00CC7A] font-bold">
                    {currentEngineIndex + 1} Active
                </span>
                </motion.div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-white/70 text-lg">⏳</span>
                  <span className="text-white/70 font-medium">
                    {REAL_ENGINES.length - currentEngineIndex - 1} Awaiting
                </span>
                </div>
              </div>
              </div>
            </div>
          </motion.div>
          </div>
      </motion.div>
    </AnimatePresence>
  )
}