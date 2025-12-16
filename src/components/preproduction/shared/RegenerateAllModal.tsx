/**
 * Regenerate All Modal
 * 
 * Modal for regenerating all Production Assistant content at once
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { regenerateAllArcContent, type RegenerationProgress, type RegenerationOptions } from '@/services/arc-regeneration-service'

interface RegenerateAllModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: any) => void
  arcPreProductionId: string
  storyBibleId: string
  arcIndex: number
  episodeNumbers: number[]
  userId?: string
  storyBibleData: any
  episodePreProdData: Record<number, any>
  castingData?: any
}

const SECTIONS = [
  { key: 'includeCasting', label: 'Casting', icon: '🎭', description: 'Actor profiles and requirements' },
  { key: 'includeLocations', label: 'Locations', icon: '📍', description: 'Real-world shooting locations' },
  { key: 'includeProps', label: 'Props/Wardrobe', icon: '👗', description: 'Items and costumes needed' },
  { key: 'includeEquipment', label: 'Equipment', icon: '🎥', description: 'Camera and gear list' },
  { key: 'includeSchedule', label: 'Schedule', icon: '📅', description: 'Shooting schedule' },
  { key: 'includeBudget', label: 'Budget', icon: '💰', description: 'Cost estimates' },
  { key: 'includePermits', label: 'Permits', icon: '📄', description: 'Legal requirements' },
  { key: 'includeMarketing', label: 'Marketing', icon: '📢', description: 'Marketing strategy' },
] as const

export function RegenerateAllModal({
  isOpen,
  onClose,
  onComplete,
  arcPreProductionId,
  storyBibleId,
  arcIndex,
  episodeNumbers,
  userId,
  storyBibleData,
  episodePreProdData,
  castingData
}: RegenerateAllModalProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [progress, setProgress] = useState<RegenerationProgress | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [options, setOptions] = useState<RegenerationOptions>({
    includeCasting: true,
    includeSchedule: true,
    includeBudget: true,
    includeEquipment: true,
    includeLocations: true,
    includeProps: true,
    includePermits: true,
    includeMarketing: true,
  })

  const handleToggleOption = (key: keyof RegenerationOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSelectAll = () => {
    setOptions({
      includeCasting: true,
      includeSchedule: true,
      includeBudget: true,
      includeEquipment: true,
      includeLocations: true,
      includeProps: true,
      includePermits: true,
      includeMarketing: true,
    })
  }

  const handleDeselectAll = () => {
    setOptions({
      includeCasting: false,
      includeSchedule: false,
      includeBudget: false,
      includeEquipment: false,
      includeLocations: false,
      includeProps: false,
      includePermits: false,
      includeMarketing: false,
    })
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    setErrors({})
    setProgress({ step: 'initializing', status: 'in_progress', message: 'Starting regeneration...', progress: 0 })

    try {
      const result = await regenerateAllArcContent({
        arcPreProductionId,
        storyBibleId,
        arcIndex,
        episodeNumbers,
        userId,
        storyBibleData,
        episodePreProdData,
        castingData,
        options,
        onProgress: (prog) => {
          setProgress(prog)
        }
      })

      if (result.success) {
        setProgress({ step: 'complete', status: 'completed', message: 'Regeneration complete!', progress: 100 })
        setTimeout(() => {
          onComplete(result.data)
          onClose()
        }, 1500)
      } else {
        setErrors(result.errors || {})
        setProgress({ step: 'error', status: 'error', message: 'Regeneration completed with errors', progress: 100 })
      }
    } catch (error) {
      console.error('Regeneration failed:', error)
      setErrors({ general: error instanceof Error ? error.message : 'Unknown error' })
      setProgress({ step: 'error', status: 'error', message: 'Regeneration failed', progress: 0 })
    } finally {
      setIsRegenerating(false)
    }
  }

  const selectedCount = Object.values(options).filter(Boolean).length

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={!isRegenerating ? onClose : undefined}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-b border-gray-800 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  🔄 Regenerate Production Assistant
                </h2>
                <p className="text-sm text-gray-400">
                  Regenerate all or selected content for Arc {arcIndex + 1} ({episodeNumbers.length} episodes)
                </p>
              </div>
              {!isRegenerating && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {!isRegenerating ? (
              <>
                {/* Section Selection */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Select Content to Regenerate
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSelectAll}
                        className="px-3 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={handleDeselectAll}
                        className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {SECTIONS.map((section) => {
                      const key = section.key as keyof RegenerationOptions
                      const isSelected = options[key]

                      return (
                        <button
                          key={section.key}
                          onClick={() => handleToggleOption(key)}
                          className={`relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl ${
                              isSelected ? 'bg-blue-500/20' : 'bg-gray-700/50'
                            }`}>
                              {section.icon}
                            </div>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-white">{section.label}</div>
                            <div className="text-sm text-gray-400">{section.description}</div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-600'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 text-amber-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-amber-500 mb-1">Warning</h4>
                      <p className="text-sm text-gray-300">
                        This will regenerate selected content from scratch. Any manual edits will be lost. 
                        {selectedCount === 0 && ' Please select at least one section to continue.'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Progress Display */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="text-3xl"
                      >
                        🔄
                      </motion.div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {progress?.message || 'Regenerating...'}
                    </h3>
                    {progress?.progress !== undefined && (
                      <div className="text-sm text-gray-400">
                        {progress.progress}% complete
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress?.progress || 0}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>

                  {/* Current Step */}
                  {progress && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          progress.status === 'completed' ? 'bg-green-500' :
                          progress.status === 'error' ? 'bg-red-500' :
                          progress.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                          'bg-gray-500'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white capitalize">
                            {progress.step.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {progress.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {Object.keys(errors).length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-red-500 mb-2">Errors Occurred</h4>
                      <ul className="space-y-1">
                        {Object.entries(errors).map(([key, message]) => (
                          <li key={key} className="text-sm text-gray-300">
                            <span className="font-medium capitalize">{key}:</span> {message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800 p-6">
            <div className="flex gap-3 justify-end">
              {!isRegenerating ? (
                <>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegenerate}
                    disabled={selectedCount === 0}
                    className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    Regenerate {selectedCount > 0 && `(${selectedCount})`}
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="px-6 py-2.5 rounded-lg font-medium bg-gray-700 text-gray-500 cursor-not-allowed"
                >
                  Regenerating...
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

