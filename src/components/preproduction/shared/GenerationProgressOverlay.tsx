'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface GenerationStep {
  id: string
  label: string
  status: 'pending' | 'generating' | 'completed' | 'error'
  error?: string
}

interface GenerationProgressOverlayProps {
  isVisible: boolean
  steps: GenerationStep[]
  currentStep?: string
  progress: number // 0-100
  title?: string
  subtitle?: string
}

export function GenerationProgressOverlay({
  isVisible,
  steps,
  currentStep,
  progress,
  title = 'Generating Pre-Production Materials',
  subtitle = 'Creating episode production materials...'
}: GenerationProgressOverlayProps) {
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Reset timer when overlay becomes visible
  useEffect(() => {
    if (isVisible && !startTime) {
      setStartTime(Date.now())
      setElapsedTime(0)
    } else if (!isVisible) {
      setStartTime(null)
      setElapsedTime(0)
    }
  }, [isVisible, startTime])

  // Update elapsed time every second
  useEffect(() => {
    if (!isVisible || !startTime) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000) // seconds
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible, startTime])

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1a1a1a] border-2 border-[#10B981] rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
          >
            <div className="text-center mb-8">
              <motion.div
                className="w-20 h-20 mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full rounded-full border-4 border-t-[#10B981] border-r-[#10B981]/50 border-b-[#10B981]/30 border-l-[#10B981]/10" />
              </motion.div>
              <h2 className="text-2xl font-bold text-[#e7e7e7] mb-2">
                {title}
              </h2>
              <p className="text-[#e7e7e7]/70">
                {subtitle}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#e7e7e7]/70">Overall Progress</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#10B981]/70 font-mono">{formatTime(elapsedTime)}</span>
                  <span className="text-sm font-bold text-[#10B981]">{progress}%</span>
                </div>
              </div>
              <div className="w-full bg-[#2a2a2a] rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#10B981] to-[#059669]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-3">
              {steps.map((step, index) => {
                const isActive = step.status === 'generating'
                const isCompleted = step.status === 'completed'
                const isError = step.status === 'error'
                const isPending = step.status === 'pending'

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'bg-[#10B981]/10 border-[#10B981]'
                        : isCompleted
                        ? 'bg-green-500/10 border-green-500/50'
                        : isError
                        ? 'bg-red-500/10 border-red-500/50'
                        : 'bg-[#2a2a2a] border-[#36393f] opacity-60'
                    }`}
                  >
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {isActive && (
                        <motion.div
                          className="w-6 h-6 rounded-full border-2 border-[#10B981] border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                      {isCompleted && (
                        <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center">
                          <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {isError && (
                        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      {isPending && (
                        <div className="w-6 h-6 rounded-full bg-[#36393f] border-2 border-[#36393f]" />
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          isActive
                            ? 'text-[#10B981]'
                            : isCompleted
                            ? 'text-green-400'
                            : isError
                            ? 'text-red-400'
                            : 'text-[#e7e7e7]/50'
                        }`}
                      >
                        {step.label}
                      </div>
                      {isActive && (
                        <motion.div
                          className="text-xs text-[#10B981]/70 mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Generating...
                        </motion.div>
                      )}
                      {isError && step.error && (
                        <div className="text-xs text-red-400 mt-1">
                          {step.error}
                        </div>
                      )}
                    </div>

                    {/* Step Number */}
                    <div className="text-xs text-[#e7e7e7]/50">
                      {index + 1} / {steps.length}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Current Step Highlight */}
            {currentStep && steps.find(s => s.id === currentStep)?.status === 'generating' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-[#10B981]/5 border border-[#10B981]/30 rounded-lg"
              >
                <p className="text-sm text-[#10B981] text-center">
                  <span className="font-medium">Currently generating:</span>{' '}
                  {steps.find(s => s.id === currentStep)?.label || currentStep}
                </p>
              </motion.div>
            )}

            {/* Error Recovery Message */}
            {steps.some(s => s.status === 'error') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <p className="text-sm text-red-400 text-center">
                  Some steps failed. You can retry generation or continue manually.
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

