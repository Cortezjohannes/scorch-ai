'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LocationGenerationProgressProps {
  isVisible: boolean
  currentLocation: number        // Current location being generated
  totalLocations: number          // Total unique locations to generate
  currentLocationName: string     // e.g., "INT. APARTMENT"
  currentLocationScenes: number   // How many scenes use this location
  completedLocations: number      // How many locations completed
  locationGroups?: Array<{        // Optional: List of all location groups
    name: string
    sceneCount: number
    completed: boolean
  }>
  onCancel?: () => void
}

export function LocationGenerationProgressOverlay({
  isVisible,
  currentLocation,
  totalLocations,
  currentLocationName,
  currentLocationScenes,
  completedLocations,
  locationGroups,
  onCancel
}: LocationGenerationProgressProps) {
  const progress = totalLocations > 0 ? (completedLocations / totalLocations) * 100 : 0
  
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
                Generating Location Options
              </h2>
              <p className="text-[#e7e7e7]/70">
                Processing unique locations with AI deduplication...
              </p>
            </div>
            
            {/* Overall Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center text-sm text-[#e7e7e7]/70 mb-2">
                <span>Overall Progress</span>
                <span className="font-bold text-[#10B981]">
                  {completedLocations} / {totalLocations} unique locations
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
            
            {/* Current Location */}
            <div className="mb-6 p-4 bg-[#10B981]/10 border border-[#10B981] rounded-lg">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-6 h-6 rounded-full border-2 border-[#10B981] border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="flex-1">
                  <p className="text-sm text-[#e7e7e7]/50 mb-1">
                    Currently generating:
                  </p>
                  <p className="font-medium text-[#10B981]">
                    {currentLocationName} (used in {currentLocationScenes} scene{currentLocationScenes !== 1 ? 's' : ''})
                  </p>
                </div>
              </div>
            </div>
            
            {/* Location Groups List */}
            {locationGroups && locationGroups.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {locationGroups.map((location, index) => {
                  const isCompleted = location.completed
                  const isCurrent = index + 1 === currentLocation
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        isCurrent
                          ? 'bg-[#10B981]/10 border-[#10B981]'
                          : isCompleted
                          ? 'bg-green-500/10 border-green-500/50'
                          : 'bg-[#2a2a2a] border-[#36393f] opacity-60'
                      }`}
                    >
                      {isCurrent && (
                        <motion.div
                          className="w-5 h-5 rounded-full border-2 border-[#10B981] border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                      {isCompleted && <span className="text-green-500 text-xl">✓</span>}
                      {!isCurrent && !isCompleted && <span className="text-[#e7e7e7]/50 text-xl">●</span>}
                      <div className="flex-1">
                        <span className={`block ${isCompleted ? 'text-green-400' : isCurrent ? 'text-[#10B981]' : 'text-[#e7e7e7]/50'}`}>
                          {location.name}
                        </span>
                        <span className="text-xs text-[#e7e7e7]/50">
                          {location.sceneCount} scene{location.sceneCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {/* Cancel Button */}
            {onCancel && (
              <div className="mt-6 text-center">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-sm text-[#e7e7e7]/70 hover:text-[#e7e7e7] transition-colors"
                >
                  Cancel Generation
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


