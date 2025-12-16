'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface V2LoadingStep {
  id: string
  name: string
  icon: string
  description: string
  type: 'per-scene' | 'per-episode' | 'per-arc' | 'simple'
  estimatedTime: number // seconds
}

const V2_STEPS: V2LoadingStep[] = [
  { 
    id: 'script', 
    name: 'Scripts', 
    icon: '', 
    description: 'Generating scene-by-scene scripts...', 
    type: 'per-scene',
    estimatedTime: 120
  },
  { 
    id: 'storyboard', 
    name: 'Storyboards', 
    icon: '', 
    description: 'Creating visual planning per scene...', 
    type: 'per-scene',
    estimatedTime: 150
  },
  { 
    id: 'locations', 
    name: 'Locations', 
    icon: '🏗️', 
    description: 'Planning filming locations...', 
    type: 'per-episode',
    estimatedTime: 70
  },
  { 
    id: 'casting', 
    name: 'Casting', 
    icon: '', 
    description: 'Creating casting guide for arc...', 
    type: 'per-arc',
    estimatedTime: 60
  },
  { 
    id: 'marketing', 
    name: 'Marketing', 
    icon: '📢', 
    description: 'Developing marketing strategy...', 
    type: 'per-episode',
    estimatedTime: 90
  },
  { 
    id: 'postproduction', 
    name: 'Post-Production', 
    icon: '🎞️', 
    description: 'Planning post-production per scene...', 
    type: 'per-scene',
    estimatedTime: 100
  }
]

interface PreProductionV2LoadingScreenProps {
  isVisible: boolean
  storyBible: any
  arcEpisodes: any[]
  workspaceEpisodes: any
  arcIndex: number
  arcTitle: string
  onComplete: (preProductionData: any) => void
  onError?: (error: string) => void
}

interface ProgressState {
  currentStepIndex: number
  currentStepProgress: number
  overallProgress: number
  currentDetail: string
  retryCount: number
  isRetrying: boolean
  errors: string[]
  completedSteps: string[]
}

export default function PreProductionV2LoadingScreen({
  isVisible,
  storyBible,
  arcEpisodes,
  workspaceEpisodes,
  arcIndex,
  arcTitle,
  onComplete,
  onError
}: PreProductionV2LoadingScreenProps) {
  const [progress, setProgress] = useState<ProgressState>({
    currentStepIndex: 0,
    currentStepProgress: 0,
    overallProgress: 0,
    currentDetail: 'Initializing V2 pre-production system...',
    retryCount: 0,
    isRetrying: false,
    errors: [],
    completedSteps: []
  })

  const [sessionId] = useState(() => Math.random().toString(36).slice(2, 8))
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Calculate totals for progress
  const totalEpisodes = arcEpisodes.length
  const totalScenes = arcEpisodes.reduce((total, ep) => total + (ep.scenes?.length || 3), 0)

  // Reset timer and state when component becomes visible
  useEffect(() => {
    if (isVisible) {
      console.log('🕐 Resetting V2 pre-production timer for new session')
      setStartTime(Date.now())
      setElapsedTime(0)
      setProgress({
        currentStepIndex: 0,
        currentStepProgress: 0,
        overallProgress: 0,
        currentDetail: 'Initializing V2 pre-production system...',
        retryCount: 0,
        isRetrying: false,
        errors: [],
        completedSteps: []
      })
    }
  }, [isVisible])

  // Update elapsed time every second
  useEffect(() => {
    if (!startTime) return

    const interval = setInterval(() => {
      setElapsedTime(Math.round((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  useEffect(() => {
    if (!isVisible) return

    // Start V2 generation process
    startV2Generation()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [isVisible])

  // Poll for real-time log-based progress
  useEffect(() => {
    if (!isVisible) return

    console.log('🔄 Starting real-time log-based progress tracking')

    const pollProgress = async () => {
      try {
        const response = await fetch('/api/preproduction-status')
        if (response.ok) {
          const data = await response.json()
          console.log('📊 Log-based progress:', data.progress)

          if (data.progress) {
            const { currentStep, currentStepName, currentStepProgress, overallProgress, currentDetail, isComplete } = data.progress

            setProgress(prev => ({
              ...prev,
              currentStepIndex: Math.max(prev.currentStepIndex, currentStep), // Never go backwards
              currentStepProgress,
              overallProgress: Math.max(prev.overallProgress, overallProgress), // Never decrease progress
              currentDetail
            }))

            if (isComplete && overallProgress >= 100) {
              console.log('🎉 Pre-production complete - stopping progress polling')
              return // Stop polling
            }
          }
        }
      } catch (error) {
        console.warn('Failed to fetch log-based progress:', error)
      }
    }

    // Poll every 500ms for real-time updates
    const interval = setInterval(pollProgress, 500)

    return () => clearInterval(interval)
  }, [isVisible])

  const startV2Generation = async () => {
    abortControllerRef.current = new AbortController()
    
    try {
      console.log('🎬 Starting V2 Pre-Production Generation...')
      console.log(`📊 Context: ${totalEpisodes} episodes, ${totalScenes} scenes`)
      console.log('📦 Sending to API:', {
        storyBible: !!storyBible,
        arcEpisodes: arcEpisodes.length,
        workspaceEpisodes: Object.keys(workspaceEpisodes || {}).length,
        arcIndex
      })
      
      // Start log tracking for real-time progress
      await fetch('/api/preproduction-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      })

      console.log('🎬 V2 Pre-production session started - real-time log tracking enabled')
      console.log(`📊 Processing: ${totalEpisodes} episodes, ${totalScenes} scenes`)
      setProgress(prev => ({
        ...prev,
        currentDetail: `Starting V2 generation for ${totalEpisodes} episodes (${totalScenes} scenes)`
      }))
      
      // Make API call to V2 pre-production endpoint
      const response = await fetch('/api/generate/preproduction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyBible,
          arcEpisodes,
          arcIndex,
          workspaceEpisodes: workspaceEpisodes || {},
          userChoices: []
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`)
      }

      const result = await response.json()

      // Stop log tracking
      await fetch('/api/preproduction-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      })

      if (result.success) {
        console.log('🎉 V2 Pre-production API call completed successfully')
        setProgress(prev => ({
          ...prev,
          currentStepIndex: V2_STEPS.length,
          overallProgress: 100,
          currentDetail: 'V2 pre-production complete!',
          completedSteps: V2_STEPS.map(s => s.id)
        }))

        setTimeout(() => {
          onComplete(result.preProduction)
        }, 2000)
      } else {
        throw new Error(result.error || 'Generation failed')
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🚫 Generation aborted')
        
        // Stop log tracking on abort
        await fetch('/api/preproduction-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'stop' })
        })
        return
      }

      console.error('❌ V2 Generation failed:', error)
      
      // Stop log tracking on error
      await fetch('/api/preproduction-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      })
      
      if (progress.retryCount < 3) {
        // Retry logic
        setProgress(prev => ({
          ...prev,
          retryCount: prev.retryCount + 1,
          isRetrying: true,
          currentDetail: `Retrying... (Attempt ${prev.retryCount + 1}/3)`,
          errors: [...prev.errors, error.message]
        }))

        // Wait and retry
        setTimeout(() => {
          startV2Generation()
        }, Math.pow(2, progress.retryCount) * 1000)
      } else {
        // Max retries reached
        setProgress(prev => ({
          ...prev,
          currentDetail: 'Generation failed after 3 attempts',
          errors: [...prev.errors, error.message]
        }))
        
        onError?.(error.message)
      }
    }
  }



  if (!isVisible) return null

  const currentStep = V2_STEPS[progress.currentStepIndex] || V2_STEPS[V2_STEPS.length - 1]
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
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

      <div className="w-full max-w-6xl px-6 py-8 space-y-8 relative z-10">
        {/* Revolutionary Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            className="inline-flex items-center space-x-4 mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center animate-emberFloat">
              <span className="text-4xl">⚡</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-medium fire-gradient animate-flameFlicker">
              PROFESSIONAL PRE-PRODUCTION V2
            </h1>
          </motion.div>
          <p className="text-xl md:text-2xl text-white/90 font-medium">
            {storyBible?.seriesTitle || 'Your Series'} - Arc {arcIndex + 1}
          </p>
          <p className="text-lg text-white/70 font-medium">
            {totalEpisodes} Episodes • {totalScenes} Scenes • Granular Empire Building
          </p>
        </motion.div>

        {/* Revolutionary Overall Progress */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xl md:text-2xl font-bold text-[#10B981] font-medium">PROFESSIONAL PROGRESS</span>
            <div className="flex items-center gap-6">
              <span className="text-3xl md:text-4xl font-bold text-[#10B981] font-medium">{progress.overallProgress}%</span>
              <span className="text-lg font-mono text-white/80 font-medium">
                ⏱️ {formatTime(elapsedTime)}
              </span>
            </div>
          </div>
          <div className="h-6 rounded-xl bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] overflow-hidden border border-[#10B981]/20">
            <motion.div
              className="h-full bg-gradient-to-r from-[#10B981] via-[#059669] to-[#10B981]"
              initial={{ width: 0 }}
              animate={{ width: `${progress.overallProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Revolutionary Step Progress Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {V2_STEPS.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 rebellious-card transition-all duration-300 ${
                progress.completedSteps.includes(step.id)
                  ? 'border-[#e2c376]/60 shadow-[#e2c376]/20'
                  : index === progress.currentStepIndex
                  ? 'border-[#D62828]/40 shadow-[#D62828]/20'
                  : index < progress.currentStepIndex
                  ? 'border-[#FF6B00]/40 shadow-[#FF6B00]/20'
                  : 'border-[#e2c376]/20'
              }`}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="text-center space-y-3">
                <div className={`text-3xl ${index === progress.currentStepIndex ? 'animate-pulse' : ''}`}>
                  {step.icon}
                </div>
                <h3 className={`text-sm font-bold font-medium ${
                  progress.completedSteps.includes(step.id)
                    ? 'text-[#e2c376]'
                    : index === progress.currentStepIndex
                    ? 'text-[#D62828]'
                    : 'text-white/70'
                }`}>
                  {step.name}
                </h3>
                <p className="text-xs text-white/60 leading-tight font-medium">
                  {step.type === 'per-scene' ? `${totalScenes} scenes` :
                   step.type === 'per-episode' ? `${totalEpisodes} episodes` :
                   step.type === 'per-arc' ? '1 arc' : 'Simple'}
                </p>
              </div>

              {/* Revolutionary Status Icons */}
              <div className="absolute top-3 right-3">
                {progress.completedSteps.includes(step.id) && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[#e2c376] text-xl"
                  >
                    ✅
                  </motion.span>
                )}
                {index === progress.currentStepIndex && !progress.completedSteps.includes(step.id) && (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-[#D62828] text-xl"
                  >
                    ⚡
                  </motion.span>
                )}
                {progress.isRetrying && index === progress.currentStepIndex && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-[#FF6B00] text-xl"
                  >
                    🔄
                  </motion.span>
                )}
              </div>

              {/* Revolutionary Step Progress Bar */}
              {index === progress.currentStepIndex && (
                <div className="mt-3">
                  <div className="h-2 rounded-xl bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] overflow-hidden border border-[#e2c376]/20">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#10B981] via-[#059669] to-[#10B981]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.currentStepProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Revolutionary Current Step Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={progress.currentStepIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center space-x-6 p-8 rebellious-card border-[#D62828]/40">
              <span className="text-4xl">{currentStep.icon}</span>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-[#e2c376] font-medium">
                  {currentStep.name} ({progress.currentStepProgress}%)
                </h3>
                <p className="text-lg text-white/90 font-medium">
                  {progress.currentDetail}
                </p>
                {progress.retryCount > 0 && (
                  <p className="text-sm text-[#FF6B00] mt-2 font-medium">
                    Retry attempt {progress.retryCount}/3
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Revolutionary Footer */}
        <div className="flex justify-between text-sm text-white/60 font-medium">
          <div className="space-x-6">
            <span>V2 Revolutionary System</span>
            <span>Session {sessionId}</span>
          </div>
          <div className="space-x-6">
            <span>{progress.errors.length} errors</span>
            <span>GPT-4.1 (Azure OpenAI)</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}