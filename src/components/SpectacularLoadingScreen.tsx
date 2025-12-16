'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EngineOrchestrator, LoadingState, EngineStatus } from '@/services/engine-orchestrator'

interface SpectacularLoadingScreenProps {
  isVisible: boolean
  processType: 'storyBible' | 'episode' | 'preproduction'
  options?: {
    synopsis?: string
    theme?: string
    genre?: string[]
    mode?: 'beast' | 'stable'
  }
  onComplete?: () => void
}

export default function SpectacularLoadingScreen({
  isVisible,
  processType,
  options = {},
  onComplete
}: SpectacularLoadingScreenProps) {
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null)
  const [orchestrator] = useState(() => new EngineOrchestrator())
  const [currentTime, setCurrentTime] = useState(new Date())
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)

  // 🎬 Initialize the loading process
  useEffect(() => {
    let cleanup: (() => void) | undefined

    if (isVisible && !loadingState) {
      const initialState = orchestrator.initializeProcess(processType, options)
      setLoadingState(initialState)
      
      // Register for state updates
      orchestrator.onStateUpdate('main-screen', (newState) => {
        setLoadingState(newState)
        
        if (newState.isComplete && onComplete) {
          setTimeout(() => onComplete(), 2000) // Delay to show completion animation
        }
      })

      // Connect to real-time engine progress updates
      cleanup = connectToRealTimeProgress()
    }
    
    return () => {
      orchestrator.offStateUpdate('main-screen')
      if (cleanup) cleanup()
    }
  }, [isVisible, processType])

  // ⏰ Update current time for live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 🎨 Particle animation system
  useEffect(() => {
    if (!isVisible || !particleCanvasRef.current) return

    const canvas = particleCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      color: string
    }> = []

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.5 ? '#e2c376' : '#36393f'
      })
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(18, 18, 18, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [isVisible])

  // 🔄 Connect to real-time engine progress updates
  const connectToRealTimeProgress = () => {
    if (!loadingState) return

    // Poll the API for real engine status updates
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_ENGINE_STATUS_URL || '/api/engine-status',
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        )
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.progress && data.progress.engines) {
            // Update each engine with real progress data
            data.progress.engines.forEach((engineData: any) => {
              // Try to find engine by exact ID match first, then by partial match
              const engine = loadingState.activeEngines.find(e => 
                e.id === engineData.engineId || 
                e.id.includes(engineData.engineId) || 
                engineData.engineId.includes(e.id) ||
                e.name.toLowerCase().includes(engineData.name?.toLowerCase() || '') ||
                engineData.name?.toLowerCase().includes(e.name.toLowerCase() || '')
              )
              
              if (engine) {
                orchestrator.updateEngineProgress(
                  engine.id,
                  engineData.progress || 0,
                  engineData.message || engineData.status || 'Processing...'
                )
              } else {
                // If engine not found, log for debugging
                console.log('⚠️ Engine not found in orchestrator:', engineData.engineId, engineData.name)
              }
            })
          }
          
          // Check if generation is complete
          if (data.session && data.session.isComplete) {
            clearInterval(pollInterval)
            // Mark all engines as complete to trigger overall completion
            loadingState.activeEngines.forEach(engine => {
              orchestrator.updateEngineProgress(engine.id, 100, 'Complete')
            })
            orchestrator.updateOverallProgress(100)
          }
        }
      } catch (error) {
        console.warn('Failed to fetch engine status:', error)
      }
    }, 500) // Poll every 500ms for smooth real-time updates

    // Clean up polling when component unmounts
    return () => clearInterval(pollInterval)
  }

  if (!isVisible || !loadingState) return null

  const { currentPhase, activeEngines, overallProgress, currentTask, isComplete } = loadingState

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ fontFamily: 'League Spartan, sans-serif' }}
      >
        {/* Fire Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        >
          <source src="/fire_background.mp4" type="video/mp4" />
        </video>

        {/* Particle Canvas Background */}
        <canvas
          ref={particleCanvasRef}
          className="absolute inset-0 pointer-events-none opacity-40"
        />

        {/* Main Loading Interface */}
        <div className="relative z-10 w-full max-w-6xl p-6 space-y-8">
          
          {/* Generation Time Warning Banner - Only for Story Bible */}
          {processType === 'storyBible' && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-gradient-to-r from-[#FF6B00]/20 via-[#D62828]/20 to-[#FF6B00]/20 border border-[#e2c376]/40 rounded-xl backdrop-blur-sm"
            >
              <div className="flex items-center justify-center space-x-3 text-center">
                <span className="text-2xl">⏱️</span>
                <p className="text-white/90 elegant-fire text-sm md:text-base">
                  <span className="font-bold text-[#e2c376]">Generation time can take 10+ minutes.</span> Please keep this page open and be patient while our AI engines craft your story bible.
                </p>
              </div>
            </motion.div>
          )}

          {/* Revolutionary Header Section */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                filter: isComplete ? ['hue-rotate(0deg)', 'hue-rotate(120deg)', 'hue-rotate(0deg)'] : 'hue-rotate(0deg)'
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center space-x-4"
            >
              <motion.div
                className="w-20 h-20 ember-shadow rounded-xl flex items-center justify-center animate-emberFloat"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-6xl">🔥</span>
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black elegant-fire fire-gradient animate-flameFlicker">
                  {isComplete ? 'EMPIRE FORGED!' : 'SCORCHED AI ACTIVE'}
                </h1>
                <p className="text-lg md:text-xl text-white/90 mt-3 elegant-fire">
                  🎯 Revolutionary AI Engines • {activeEngines.length} Systems Burning
                </p>
              </div>
            </motion.div>

            {/* Live Clock */}
            <div className="text-white/60 text-sm font-mono elegant-fire">
              {currentTime.toLocaleTimeString()} • REVOLUTION IN PROGRESS
            </div>
          </motion.div>

          {/* Revolutionary Phase Progress Bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-black text-[#e2c376] elegant-fire">{currentPhase.name}</h2>
              <span className="text-2xl md:text-3xl font-black text-[#e2c376] elegant-fire">{Math.round(overallProgress)}%</span>
            </div>
            
            <div className="relative h-6 bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] rounded-xl overflow-hidden border border-[#e2c376]/20">
              <motion.div
                className="h-full bg-gradient-to-r from-[#D62828] via-[#FF6B00] to-[#e2c376]"
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
            
            <p className="text-white/90 text-center elegant-fire text-lg">{currentPhase.description}</p>
          </motion.div>

          {/* Revolutionary Active Engines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {activeEngines.map((engine, index) => (
                <EngineCard key={engine.id} engine={engine} index={index} />
              ))}
            </AnimatePresence>
          </div>

          {/* Revolutionary Current Task Display */}
          <motion.div
            key={currentTask}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 rebellious-card"
          >
            <div className="flex items-center justify-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-[#e2c376] border-t-transparent rounded-full"
              />
              <span className="text-white/90 elegant-fire text-lg">{currentTask}</span>
            </div>
          </motion.div>

          {/* Revolutionary Success Animation */}
          {isComplete && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
                className="text-8xl"
              >
                🏆
              </motion.div>
              <div className="text-3xl font-black elegant-fire fire-gradient animate-flameFlicker">EMPIRE FORGED!</div>
              <div className="text-xl text-white/90 elegant-fire">Your revolution is complete.</div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// 🔥 Revolutionary Engine Card Component
function EngineCard({ engine, index }: { engine: EngineStatus; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1 }}
      className={`p-6 rebellious-card transition-all duration-500 ${
        engine.status === 'complete' 
          ? 'border-[#e2c376]/60 shadow-[#e2c376]/20' 
          : engine.status === 'active'
          ? 'border-[#D62828]/40 shadow-[#D62828]/20'
          : 'border-[#e2c376]/20'
      }`}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Revolutionary Engine Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={engine.status === 'active' ? { 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className={`w-4 h-4 rounded-full ${
              engine.status === 'complete' ? 'bg-[#e2c376]' :
              engine.status === 'active' ? 'bg-[#D62828]' :
              engine.status === 'error' ? 'bg-[#FF6B00]' : 'bg-[#36393f]'
            }`}
          />
          <span className="font-bold text-sm text-white/90 elegant-fire">
            {engine.name}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-xs rounded-full font-black ${
            engine.version === 'v2' ? 'bg-[#e2c376] text-black' : 'bg-[#2a2a2a] text-[#e2c376]'
          }`}>
            {engine.version.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Revolutionary Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-white/70 elegant-fire">{engine.currentTask || 'Standby'}</span>
          <span className="font-mono text-[#e2c376] font-bold">{Math.round(engine.progress)}%</span>
        </div>
        
        <div className="h-3 bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] rounded-xl overflow-hidden border border-[#e2c376]/20">
          <motion.div
            className={`h-full rounded-xl ${
              engine.status === 'complete' ? 'bg-gradient-to-r from-[#e2c376] to-[#d4b46a]' : 
              'bg-gradient-to-r from-[#D62828] via-[#FF6B00] to-[#e2c376]'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${engine.progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Revolutionary Engine Status Animation */}
      {engine.status === 'active' && (
        <motion.div
          className="mt-4 flex justify-center"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="flex space-x-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-[#e2c376] rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{ 
                  duration: 0.6, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}