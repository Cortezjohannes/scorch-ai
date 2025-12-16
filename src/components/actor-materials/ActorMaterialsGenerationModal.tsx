/**
 * Actor Materials Generation Modal - Brand-Aligned Design
 * Shows loading state with detailed progress matching app's cinematic aesthetic
 */

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface GenerationProgress {
  currentCharacter: string
  currentPhase: string
  characterIndex: number
  totalCharacters: number
  percentage: number
}

interface ActorMaterialsGenerationModalProps {
  isOpen: boolean
  progress?: GenerationProgress
  arcTitle: string
  onComplete?: () => void
}

export default function ActorMaterialsGenerationModal({
  isOpen,
  progress,
  arcTitle,
  onComplete
}: ActorMaterialsGenerationModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [recentUpdates, setRecentUpdates] = useState<string[]>([])

  // Mount detection for hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Timer
  useEffect(() => {
    if (!isOpen) {
      setElapsedTime(0)
      return
    }

    const startTime = Date.now()
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  // Track recent updates for animation
  useEffect(() => {
    if (progress?.currentPhase) {
      setRecentUpdates(prev => {
        const newUpdates = [
          `${progress.currentCharacter}: ${progress.currentPhase}`,
          ...prev.slice(0, 4)
        ]
        return newUpdates
      })
    }
  }, [progress?.currentPhase, progress?.currentCharacter])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const percentage = progress?.percentage || 0
  const currentCharacter = progress?.currentCharacter || '...'
  const currentPhase = progress?.currentPhase || 'Initializing...'
  const characterIndex = progress?.characterIndex || 0
  const totalCharacters = progress?.totalCharacters || 5

  // Determine which phase we're in for status indicators
  const isCore = currentPhase.includes('study guide') || currentPhase.includes('scene analysis')
  const isRelationships = currentPhase.includes('relationship')
  const isPractice = currentPhase.includes('practice')

  const phaseNumber = isCore ? 1 : isRelationships ? 2 : isPractice ? 3 : 0

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl"
        >
          {/* Main container with cinematic border */}
          <div className="relative border-2 border-[#10B981]/30 rounded-lg p-6 sm:p-8 md:p-10 backdrop-blur-sm bg-black/40">
            
            {/* Film strip decoration - top */}
            <div className="absolute top-0 left-0 right-0 h-3 flex justify-between px-2">
              {[...Array(20)].map((_, i) => (
                <div key={`top-${i}`} className="w-2 h-full bg-[#10B981]/20" />
              ))}
            </div>
            
            {/* Film strip decoration - bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-3 flex justify-between px-2">
              {[...Array(20)].map((_, i) => (
                <div key={`bottom-${i}`} className="w-2 h-full bg-[#10B981]/20" />
              ))}
            </div>

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl sm:text-6xl mb-4"
              >
                🎭
              </motion.div>
              
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#10B981] mb-2">
                Generating Actor Materials
              </h2>
              <p className="text-[#e7e7e7]/70 text-sm sm:text-base">
                {arcTitle}
              </p>
            </div>

            {/* Current Status - Large and Prominent */}
            <div className="mb-6">
              <div className="text-center mb-4">
                <div className="text-[#e7e7e7]/60 text-xs sm:text-sm mb-1">
                  Character {characterIndex + 1} of {totalCharacters}
                </div>
                <motion.div
                  key={currentCharacter}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[#e7e7e7] text-lg sm:text-xl font-semibold mb-2"
                >
                  {currentCharacter}
                </motion.div>
                <motion.div
                  key={currentPhase}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#e7e7e7]/70 text-sm sm:text-base"
                >
                  {currentPhase}
                </motion.div>
              </div>

              {/* Progress Bar - Brand Green */}
              <div className="mb-3">
                <div className="w-full h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#10B981] to-[#00cc7a]"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs sm:text-sm">
                  <span className="text-[#10B981] font-semibold">
                    {Math.round(percentage)}%
                  </span>
                  {isMounted && (
                    <span className="text-[#e7e7e7]/50 font-mono">
                      {formatTime(elapsedTime)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Generation Phases */}
            <div className="space-y-2 sm:space-y-3 mb-6">
              <PhaseItem 
                number={1}
                label="Core Materials"
                sublabel="Study guides, scene analysis, emotional journey"
                complete={phaseNumber > 1 || (phaseNumber === 1 && percentage > 30)}
                active={phaseNumber === 1}
              />
              <PhaseItem 
                number={2}
                label="Relationship Dynamics"
                sublabel="Deep relationship maps, power dynamics, conflicts"
                complete={phaseNumber > 2 || (phaseNumber === 2 && percentage > 60)}
                active={phaseNumber === 2}
              />
              <PhaseItem 
                number={3}
                label="Practice Materials"
                sublabel="Performance references, monologues, on-set prep"
                complete={percentage === 100}
                active={phaseNumber === 3}
              />
            </div>

            {/* Recent Updates Feed */}
            <div className="mb-6 bg-black/30 rounded-lg border border-[#10B981]/10 p-4 min-h-[100px]">
              <div className="text-xs sm:text-sm text-[#e7e7e7]/60 mb-2 font-semibold">
                Recent Updates:
              </div>
              <div className="space-y-1">
                <AnimatePresence mode="popLayout">
                  {recentUpdates.slice(0, 5).map((update, index) => (
                    <motion.div
                      key={`${update}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1 - (index * 0.15), x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-xs sm:text-sm text-[#e7e7e7]/70"
                    >
                      <span className="text-[#10B981]">▸</span> {update}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {recentUpdates.length === 0 && (
                  <div className="text-xs sm:text-sm text-[#e7e7e7]/50 italic">
                    Initializing generation...
                  </div>
                )}
              </div>
            </div>

            {/* Stats Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm border-t border-[#10B981]/10 pt-4">
              <div className="flex items-center gap-2 text-[#e7e7e7]/60">
                <span className="text-[#10B981]">●</span>
                <span>{totalCharacters * 3} AI calls</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-[#e7e7e7]/60">
                  <span className="text-[#10B981] font-semibold">Enhanced</span> quality
                </div>
                <div className="text-[#e7e7e7]/60">
                  <span className="text-[#10B981] font-semibold">3</span> phases
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function PhaseItem({ 
  number, 
  label, 
  sublabel,
  complete, 
  active 
}: { 
  number: number
  label: string
  sublabel: string
  complete: boolean
  active: boolean 
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
      active ? 'bg-[#10B981]/10 border border-[#10B981]/30' : 'bg-transparent'
    }`}>
      <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
        complete 
          ? 'bg-[#10B981] border-[#10B981]' 
          : active 
            ? 'border-[#10B981] bg-[#10B981]/20' 
            : 'border-[#2a2a2a] bg-transparent'
      }`}>
        {complete ? (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : active ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#10B981] rounded-full"
          />
        ) : (
          <span className="text-[#2a2a2a] text-xs sm:text-sm font-bold">{number}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm sm:text-base font-semibold transition-colors ${
          complete ? 'text-[#10B981]' : active ? 'text-[#e7e7e7]' : 'text-[#e7e7e7]/40'
        }`}>
          {label}
        </div>
        <div className={`text-xs sm:text-sm transition-colors mt-0.5 ${
          complete ? 'text-[#10B981]/70' : active ? 'text-[#e7e7e7]/70' : 'text-[#e7e7e7]/30'
        }`}>
          {sublabel}
        </div>
      </div>
    </div>
  )
}
