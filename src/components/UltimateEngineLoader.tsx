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
  { id: 'narrative', name: 'Narrative Engine', icon: '🌊', description: 'Building fractal story structure and arcs' },
  { id: 'world', name: 'World Engine', icon: '🌍', description: 'Building immersive settings and environments' },
  { id: 'dialogue', name: 'Dialogue Engine', icon: '💬', description: 'Crafting strategic character conversations' },
  { id: 'tension', name: 'Tension Engine', icon: '⚡', description: 'Building and releasing dramatic tension' },
  { id: 'genre', name: 'Genre Engine', icon: '🎨', description: 'Optimizing for genre-specific storytelling' },
  { id: 'choice', name: 'Choice Engine', icon: '🔀', description: 'Creating meaningful branching narratives' },
  { id: 'theme', name: 'Theme Engine', icon: '🎭', description: 'Integrating thematic elements throughout' },
  { id: 'living', name: 'Living World Engine', icon: '🌟', description: 'Making the world feel alive and reactive' },
  { id: 'trope', name: 'Trope Engine', icon: '🎪', description: 'Subverting and enhancing genre conventions' },
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
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 8))
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
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        style={{ fontFamily: 'League Spartan, sans-serif' }}
      >
        {/* Fire Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover opacity-30 -z-10"
        >
          <source src="/fire_background.mp4" type="video/mp4" />
        </video>
        {/* Main Container - More Compact */}
        <div className="w-full max-w-5xl p-4 space-y-4">
          
        {/* Revolutionary Header */}
        <motion.div
            initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
            className="text-center space-y-4"
        >
            <div className="w-20 h-20 mx-auto ember-shadow rounded-xl flex items-center justify-center animate-emberFloat bg-[#e2c376]/10 border border-[#e2c376]/30">
              <span className="text-4xl">🔥</span>
            </div>
            <h1 className="text-5xl font-black elegant-fire fire-gradient animate-flameFlicker">
              SCORCHED ENGINE
          </h1>
            <p className="text-lg text-white/90 elegant-fire">
              Session {sessionId} • {REAL_ENGINES.length} Revolutionary Engines
            </p>
            <p className="text-white/80 elegant-fire">
              {isComplete ? '🔥 EMPIRE FORGED!' : statusMessage}
            </p>
        </motion.div>

        {/* Revolutionary Progress */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
            className="space-y-4 rebellious-card p-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-[#e2c376] elegant-fire">EMPIRE PROGRESS</h2>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-black text-[#e2c376] elegant-fire">{Math.round(overallProgress)}%</span>
                <span className="text-lg text-white/90 elegant-fire font-mono">
                  🕐 {formatElapsedTime(elapsedTime)}
                </span>
              </div>
            </div>
            
            <div className="relative h-4 bg-black/50 rounded-full overflow-hidden border border-[#e2c376]/30">
              <motion.div
                className="h-full bg-gradient-to-r from-[#D62828] via-[#FF6B00] to-[#e2c376] ember-shadow"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          </motion.div>

          {/* Engine Grid - Compact 4x3 Layout */}
          <div className="grid grid-cols-4 gap-3 max-w-4xl mx-auto">
            {REAL_ENGINES.map((engine, index) => {
              const isActive = index === currentEngineIndex
              const isCompleted = engineProgress[engine.id] >= 100
              const progress = engineProgress[engine.id] || 0
                  
                  return (
                    <motion.div
                  key={engine.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    isActive 
                      ? 'border-[#e2c376] bg-[#e2c376]/20 ember-shadow animate-emberFloat' 
                      : isCompleted 
                        ? 'border-[#e2c376]/60 bg-[#e2c376]/10' 
                        : 'border-[#e2c376]/30 bg-black/50'
                  }`}
                >
                  {/* Engine Icon and Name */}
                  <div className="text-center space-y-1">
                    <div className={`text-2xl ${isActive ? 'animate-pulse' : ''}`}>
                      {engine.icon}
                    </div>
                    <h3 className={`text-sm font-black elegant-fire ${
                      isActive ? 'text-[#e2c376] animate-flameFlicker' : 
                      isCompleted ? 'text-[#e2c376]/80' : 'text-white/70'
                        }`}>
                          {engine.name}
                    </h3>
                  </div>

                  {/* Revolutionary Progress Bar */}
                  <div className="mt-3 space-y-2">
                    <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-[#e2c376]/30">
                      <motion.div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isActive ? 'bg-gradient-to-r from-[#D62828] to-[#e2c376] ember-shadow' : 
                          isCompleted ? 'bg-[#e2c376]' : 'bg-[#e2c376]/30'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-center font-black elegant-fire text-[#e2c376]">
                      {Math.round(progress)}%
                    </div>
                      </div>

                                    {/* Revolutionary Status Indicators */}
                  <div className="absolute top-2 right-2">
                      {isCompleted && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[#e2c376] text-lg"
                        >
                          🔥
                        </motion.span>
                      )}
                      {isActive && !isCompleted && (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="text-[#FF6B00] text-lg animate-pulse"
                        >
                          ⚡
                        </motion.span>
                      )}
                  </div>
                    </motion.div>
                  )
                })}
          </div>

          {/* Revolutionary Engine Details */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center space-x-4 p-6 rebellious-card ember-shadow">
              <span className="text-3xl animate-pulse">{REAL_ENGINES[currentEngineIndex]?.icon}</span>
              <div>
                <h3 className="text-xl font-black text-[#e2c376] elegant-fire animate-flameFlicker">
                  {REAL_ENGINES[currentEngineIndex]?.name}
                </h3>
                <p className="text-lg text-white/90 elegant-fire">
                  {REAL_ENGINES[currentEngineIndex]?.description}
                </p>
              </div>
              </div>
            </motion.div>

        {/* Revolutionary Status Bar */}
        <motion.div
            initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
            className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-[#e2c376]/30 p-4"
        >
            <div className="flex justify-between items-center text-lg max-w-6xl mx-auto elegant-fire">
            <div className="flex space-x-8">
                <span className="text-[#e2c376]">
                  🔥 Phase: {Math.floor(overallProgress / 25) + 1} of 4
              </span>
                <span className="text-white/80">
                  ⚡ Revolutionary AI: Scorched Routing
              </span>
            </div>
            <div className="flex space-x-6">
                <span className="text-[#e2c376]">
                  🔥 {Object.values(engineProgress).filter(p => p >= 100).length} Forged
                </span>
                <span className="text-[#FF6B00] animate-pulse">
                  ⚡ {currentEngineIndex + 1} Burning
                </span>
                <span className="text-white/70">
                  ⏳ {REAL_ENGINES.length - currentEngineIndex - 1} Awaiting
                </span>
              </div>
            </div>
          </motion.div>
          </div>
      </motion.div>
    </AnimatePresence>
  )
}