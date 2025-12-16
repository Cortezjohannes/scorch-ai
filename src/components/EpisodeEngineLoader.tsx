'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedBackground from './AnimatedBackground'

type Step = { 
  id: string
  name: string
  icon: string
  desc: string
  weight: number
  minMs: number
  maxMs: number
}

const STEPS_ON: Step[] = [
  { id: 'draft', name: 'Story Foundation', icon: '', desc: 'Creating narrative structure', weight: 0.15, minMs: 8000, maxMs: 12000 },
  { id: 'engines', name: 'Comprehensive Enhancement', icon: '', desc: 'Running 19 AI enhancement engines', weight: 0.50, minMs: 25000, maxMs: 35000 },
  { id: 'dialogue', name: 'Character Refinement', icon: '', desc: 'Perfecting dialogue and voice', weight: 0.12, minMs: 6000, maxMs: 9000 },
  { id: 'tension', name: 'Dramatic Enhancement', icon: '', desc: 'Optimizing tension and pacing', weight: 0.12, minMs: 6000, maxMs: 9000 },
  { id: 'final', name: 'Final Integration', icon: '', desc: 'Synthesizing all enhancements', weight: 0.11, minMs: 8000, maxMs: 12000 }
]

const STEPS_OFF: Step[] = [
  { id: 'draft', name: 'Story Foundation', icon: '', desc: 'Creating narrative structure', weight: 0.30, minMs: 12000, maxMs: 18000 },
  { id: 'synth', name: 'Story-Bible Integration', icon: '', desc: 'Integrating with story bible', weight: 0.40, minMs: 15000, maxMs: 22000 },
  { id: 'final', name: 'Episode Finalization', icon: '', desc: 'Final polish and completion', weight: 0.30, minMs: 10000, maxMs: 15000 }
]

interface EpisodeEngineLoaderProps {
  open: boolean
  episodeNumber?: number
  seriesTitle?: string
  useEngines?: boolean
  onDone?: () => void
  estimatedMs?: number
  isGenerationComplete?: boolean
}

export default function EpisodeEngineLoader({
  open,
  episodeNumber,
  seriesTitle,
  useEngines = true,
  onDone,
  estimatedMs,
  isGenerationComplete = false
}: EpisodeEngineLoaderProps) {
  const steps = useMemo(() => (useEngines ? STEPS_ON : STEPS_OFF), [useEngines])
  const [active, setActive] = useState(0)
  const [overall, setOverall] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)
  const [sessionId] = useState(() => {
    // generate once to avoid hydration mismatch
    if (typeof window === 'undefined') return 'server'
    return Math.random().toString(36).slice(2, 8)
  })
  const startRef = useRef<number | null>(null)
  const perStepDurations = useMemo(() => steps.map(s => rand(s.minMs, s.maxMs)), [steps])
  
  // Ensure minimum duration covers full enhancement process
  const minDurationMs = useEngines ? 55000 : 40000 // 55s with engines, 40s without
  const calculatedTotalMs = perStepDurations.reduce((a, b) => a + b, 0)
  const totalMs = useMemo(() => Math.max(minDurationMs, estimatedMs ?? calculatedTotalMs), [estimatedMs, calculatedTotalMs])

  useEffect(() => {
    if (!open) return
    
    if (!startRef.current) {
      startRef.current = performance.now()
      setActive(0)
      setOverall(0)
      setElapsed(0)
      setDone(false)
    }

    const tick = () => {
      const now = performance.now()
      const elapsedMs = now - (startRef.current!)
      setElapsed(Math.floor(elapsedMs / 1000))

      // Progress across steps
      let remain = elapsedMs
      let accum = 0
      let idx = 0

      for (; idx < steps.length; idx++) {
        const d = perStepDurations[idx]
        const p = Math.max(0, Math.min(1, remain / d))
        accum += p * steps[idx].weight
        remain -= d
        if (remain < 0) break
      }

      setActive(Math.min(idx, steps.length - 1))
      setOverall(Math.min(100, Math.round(accum * 100)))

      // Only complete if both animation is done AND generation is complete
      if (elapsedMs >= totalMs && isGenerationComplete && !done) {
        setDone(true)
        setOverall(100)
        setTimeout(() => onDone?.(), 500)
      } else if (elapsedMs >= totalMs && !isGenerationComplete) {
        // Animation is done but generation isn't - extend loading time smoothly
        // Keep extending the total time to prevent loading screen from resetting
        const extensionMs = Math.min(elapsedMs * 0.5, 30000) // Extend up to 30 seconds max
        setOverall(Math.min(99, Math.round((elapsedMs / (totalMs + extensionMs)) * 100)))
        requestAnimationFrame(tick)
      } else {
        requestAnimationFrame(tick)
      }
    }

    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [open, steps, perStepDurations, totalMs, done, onDone])

  if (!open) return null

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ zIndex: 50 }}
      >
        <AnimatedBackground intensity="medium" />
        <div className="w-full max-w-4xl px-6 py-5 space-y-5 relative" style={{ zIndex: 1 }}>
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#10B981] via-[#059669] to-[#10B981] text-transparent bg-clip-text">
              Writing Episode {episodeNumber ?? '—'}
            </h1>
            <p className="text-xs text-[#e7e7e7]/70">{seriesTitle ?? 'Series'}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[#10B981]">Overall Progress</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-[#10B981]">{overall}%</span>
                <span className="text-xs font-mono text-[#e7e7e7]/80">⏱️ {mm}:{ss}</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-[#2a2a2a] overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#10B981] via-[#059669] to-[#10B981]"
                initial={{ width: 0 }}
                animate={{ width: `${overall}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Engine Grid */}
          <div className={`grid gap-3 ${useEngines ? 'grid-cols-5' : 'grid-cols-3'}`}>
            {steps.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-3 rounded-lg border transition-all duration-300 ${
                  i < active
                    ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20'
                    : i === active
                    ? 'border-[#10B981] bg-[#10B981]/10 shadow-lg shadow-[#10B981]/20'
                    : 'border-[#2f2f2f] bg-[#121212]'
                }`}
              >
                {/* Engine Icon and Name */}
                <div className="text-center space-y-1">
                  <div className={`text-xl ${i === active ? 'animate-pulse' : ''}`}>
                    {s.icon}
                  </div>
                  <h3 className={`text-xs font-medium ${
                    i < active
                      ? 'text-green-400'
                      : i === active
                      ? 'text-[#10B981]'
                      : 'text-[#e7e7e7]/70'
                  }`}>
                    {s.name}
                  </h3>
                  <p className="text-[10px] text-[#bdbdbd] leading-tight">
                    {s.desc}
                  </p>
                </div>

                {/* Status Indicators */}
                <div className="absolute top-1 right-1">
                  {i < active && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-400 text-sm"
                    >
                    </motion.span>
                  )}
                  {i === active && !done && (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-[#10B981] text-sm"
                    >
                    </motion.span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Current Engine Details */}
          {steps[active] && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center space-y-3"
            >
              <div className="inline-flex items-center space-x-3 p-4 rounded-xl border border-[#10B981] bg-[#10B981]/10">
                <span className="text-2xl">{steps[active].icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-[#10B981]">
                    {steps[active].name}
                  </h3>
                  <p className="text-sm text-[#e7e7e7]/80">
                    {steps[active].desc}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <div className="flex justify-between text-xs text-[#9e9e9e]">
            <span>Murphy Engine • {useEngines ? 'Engines Mode' : 'Story-Bible Mode'}</span>
            <span>Session {sessionId}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function rand(a: number, b: number): number {
  if (typeof window === 'undefined') return a // Return minimum value on server
  return a + Math.floor(Math.random() * (b - a + 1))
} 