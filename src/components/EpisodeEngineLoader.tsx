'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  { id: 'draft', name: 'Narrative Blueprint', icon: '🌊', desc: 'Structuring episode outline', weight: 0.25, minMs: 6000, maxMs: 8000 },
  { id: 'dialogue', name: 'Strategic Dialogue', icon: '💬', desc: 'Sharpening character voice', weight: 0.20, minMs: 5000, maxMs: 7000 },
  { id: 'tension', name: 'Tension Escalation', icon: '⚡', desc: 'Tightening dramatic beats', weight: 0.20, minMs: 5000, maxMs: 7000 },
  { id: 'choices', name: 'Choice Quality', icon: '🔀', desc: 'Aligning stakes & outcomes', weight: 0.15, minMs: 4000, maxMs: 6000 },
  { id: 'final', name: 'Final Synthesis', icon: '🧠', desc: 'Composing the episode', weight: 0.20, minMs: 5000, maxMs: 7000 }
]

const STEPS_OFF: Step[] = [
  { id: 'draft', name: 'Narrative Blueprint', icon: '🌊', desc: 'Structuring episode outline', weight: 0.35, minMs: 8000, maxMs: 12000 },
  { id: 'synth', name: 'Story-Bible Synthesis', icon: '📖', desc: 'Grounding in the bible', weight: 0.35, minMs: 8000, maxMs: 12000 },
  { id: 'final', name: 'Final Polish', icon: '🧠', desc: 'Composing the episode', weight: 0.30, minMs: 6000, maxMs: 10000 }
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
    return Math.random().toString(36).slice(2, 8)
  })
  const startRef = useRef<number | null>(null)
  const perStepDurations = useMemo(() => steps.map(s => rand(s.minMs, s.maxMs)), [steps])
  
  // Ensure minimum 35 seconds (35000ms) for the animation
  const minDurationMs = 35000
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
        // Animation is done but generation isn't - keep at 99% and wait
        setOverall(99)
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#171717] to-[#0a0a0a]"
      >
        <div className="w-full max-w-4xl px-6 py-5 space-y-5">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#e2c376] via-[#f0d995] to-[#e2c376] text-transparent bg-clip-text">
              Writing Episode {episodeNumber ?? '—'}
            </h1>
            <p className="text-xs text-[#e7e7e7]/70">{seriesTitle ?? 'Series'}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[#e2c376]">Overall Progress</span>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-[#e2c376]">{overall}%</span>
                <span className="text-xs font-mono text-[#e7e7e7]/80">⏱️ {mm}:{ss}</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-[#2a2a2a] overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#e2c376] via-[#f0d995] to-[#e2c376]"
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
                    ? 'border-[#e2c376] bg-[#e2c376]/10 shadow-lg shadow-[#e2c376]/20'
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
                      ? 'text-[#e2c376]'
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
                      ✅
                    </motion.span>
                  )}
                  {i === active && !done && (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-[#e2c376] text-sm"
                    >
                      ⚡
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
              <div className="inline-flex items-center space-x-3 p-4 rounded-xl border border-[#e2c376] bg-[#e2c376]/10">
                <span className="text-2xl">{steps[active].icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-[#e2c376]">
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
  return a + Math.floor(Math.random() * (b - a + 1))
} 