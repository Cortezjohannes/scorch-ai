'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PostProductionDataContext } from '@/services/postproduction-data-loader'
import type { EditingInstructions } from '@/types/editing-instructions'

interface SceneEditingCardProps {
  sceneNumber: number
  sceneTitle?: string
  location?: string
  storyboardFrames: Array<{
    id: string
    shotNumber: number
    frameImage?: string
    description?: string
    cameraAngle?: string
  }>
  shotList: Array<{
    id: string
    shotNumber: number
    description?: string
    cameraAngle?: string
    duration?: number
  }>
  editingInstructions?: EditingInstructions
  isGenerating?: boolean
  onGenerateInstructions: () => void
  postProductionData: PostProductionDataContext | null
}

export function SceneEditingCard({
  sceneNumber,
  sceneTitle,
  location,
  storyboardFrames,
  shotList,
  editingInstructions,
  isGenerating = false,
  onGenerateInstructions,
  postProductionData
}: SceneEditingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasInstructions = !!editingInstructions

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121212] border border-[#10B981]/20 rounded-xl overflow-hidden hover:border-[#10B981]/40 transition-all"
    >
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-[#1a1a1a]/50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center">
            <span className="text-[#10B981] font-bold text-lg">{sceneNumber}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1">
              {sceneTitle || `Scene ${sceneNumber}`}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              {location && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {storyboardFrames.length} frame{storyboardFrames.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {shotList.length} shot{shotList.length !== 1 ? 's' : ''}
              </span>
              {hasInstructions && (
                <span className="flex items-center gap-1.5 text-[#10B981]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Ready
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!hasInstructions && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onGenerateInstructions()
              }}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isGenerating
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-[#10B981] text-black hover:bg-[#059669]'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Instructions'}
            </button>
          )}
          <motion.svg
            className="w-5 h-5 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 space-y-6 border-t border-[#10B981]/10">
              {/* Storyboard Frames - Larger with more context */}
              {storyboardFrames.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#10B981] mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Storyboard Reference
                  </h4>
                  <div className="overflow-x-auto pb-4 -mx-2 px-2">
                    <div className="flex gap-6 min-w-max">
                      {storyboardFrames.map((frame, frameIndex) => (
                        <motion.div
                          key={frame.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: frameIndex * 0.05 }}
                          className="flex-shrink-0 w-72 bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#10B981]/20 hover:border-[#10B981]/40 transition-all"
                        >
                          {frame.frameImage ? (
                            <div className="relative">
                              <img
                                src={frame.frameImage}
                                alt={`Scene ${sceneNumber} - Shot ${frame.shotNumber}`}
                                className="w-full h-auto object-contain bg-[#0a0a0a]"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-48 bg-[#0a0a0a] flex items-center justify-center text-gray-500 text-sm">
                                        Image unavailable
                                      </div>
                                    `
                                  }
                                }}
                              />
                              <div className="absolute top-2 right-2 bg-[#10B981]/90 text-black text-xs font-bold px-2 py-1 rounded">
                                Shot {frame.shotNumber}
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-48 bg-[#0a0a0a] flex items-center justify-center text-gray-500 text-sm">
                              No image
                            </div>
                          )}
                          <div className="p-4 bg-[#1a1a1a]">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm font-semibold text-white">Shot {frame.shotNumber}</p>
                                {frame.cameraAngle && (
                                  <p className="text-xs text-[#10B981] mt-1">{frame.cameraAngle}</p>
                                )}
                              </div>
                            </div>
                            {frame.description && (
                              <p className="text-xs text-gray-400 line-clamp-2 mt-2">{frame.description}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Shot List */}
              {shotList.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#10B981] mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Shot List ({shotList.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {shotList.map((shot) => (
                      <div
                        key={shot.id}
                        className="bg-[#1a1a1a] border border-[#10B981]/10 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white">Shot {shot.shotNumber}</span>
                          {shot.duration && (
                            <span className="text-xs text-gray-400">{shot.duration}s</span>
                          )}
                        </div>
                        {shot.cameraAngle && (
                          <p className="text-xs text-[#10B981] mb-1">{shot.cameraAngle}</p>
                        )}
                        {shot.description && (
                          <p className="text-xs text-gray-400 line-clamp-2">{shot.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Editing Instructions */}
              {editingInstructions && (
                <div className="bg-[#1a1a1a] border border-[#10B981]/20 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-[#10B981] mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Editing Instructions
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Pacing */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">Pacing</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] capitalize">
                          {editingInstructions.pacing.overall}
                        </span>
                      </div>
                      {editingInstructions.pacing.notes.length > 0 && (
                        <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                          {editingInstructions.pacing.notes.map((note, i) => (
                            <li key={i}>{note}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Cuts */}
                    {editingInstructions.cuts.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Suggested Cuts</span>
                          <span className="text-xs text-gray-400">{editingInstructions.cuts.length} cut{editingInstructions.cuts.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="space-y-2">
                          {editingInstructions.cuts.slice(0, 3).map((cut, i) => (
                            <div key={i} className="text-xs text-gray-400 bg-[#0a0a0a] rounded p-2">
                              <span className="text-[#10B981] font-medium">{cut.time}s</span> - {cut.reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transitions */}
                    {editingInstructions.transitions.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-white">Transitions</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {editingInstructions.transitions.map((transition, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                              {transition.type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
