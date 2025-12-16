'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ScheduleGenerationProgressProps {
  isVisible: boolean
  currentEpisode: number        // Current episode being processed
  totalEpisodes: number          // Total episodes to schedule
  completedEpisodes: number      // How many episodes completed
  currentEpisodeTitle: string    // e.g., "Episodes 1, 2, 3, 5, 8"
  onCancel?: () => void
}

export function ScheduleGenerationProgressOverlay({
  isVisible,
  currentEpisode,
  totalEpisodes,
  completedEpisodes,
  currentEpisodeTitle,
  onCancel
}: ScheduleGenerationProgressProps) {
  const progress = totalEpisodes > 0 ? (completedEpisodes / totalEpisodes) * 100 : 0
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#121212]/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-8 max-w-2xl w-full shadow-2xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#10B981] mb-2">
                Generating Shooting Schedule
              </h2>
              <p className="text-[#e7e7e7]/70">
                Optimizing scene grouping across episodes for maximum efficiency...
              </p>
            </div>
            
            {/* Overall Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center text-sm text-[#e7e7e7]/70 mb-2">
                <span>Overall Progress</span>
                <span className="font-bold text-[#10B981]">
                  {completedEpisodes} / {totalEpisodes} episodes processed
                </span>
              </div>
              <div className="w-full bg-[#2a2a2a] rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#10B981] to-[#059669]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            
            {/* Current Episode */}
            <div className="mb-6 p-4 bg-[#10B981]/10 border border-[#10B981] rounded-lg">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-6 h-6 rounded-full border-2 border-[#10B981] border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <div className="flex-1">
                  <div className="text-sm text-[#e7e7e7]/70 mb-1">
                    Currently Processing
                  </div>
                  <div className="text-lg font-semibold text-[#10B981]">
                    {currentEpisodeTitle}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Message */}
            <div className="text-center text-sm text-[#e7e7e7]/50">
              <p>Analyzing scene breakdowns, locations, and cast availability...</p>
              <p className="mt-1">This may take 30-60 seconds.</p>
            </div>
            
            {/* Cancel Button (optional) */}
            {onCancel && (
              <div className="mt-6 text-center">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-sm text-[#e7e7e7]/70 hover:text-[#e7e7e7] transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}














