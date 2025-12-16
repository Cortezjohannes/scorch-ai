'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Episode } from '@/services/episode-service'
import { getReadyArcs, getTotalRemainingEpisodes } from '@/utils/arc-episode-utils'
import CompleteEpisodesModal from './CompleteEpisodesModal'

interface ActorMaterialsSelectorProps {
  isOpen: boolean
  onClose: () => void
  storyBible: any
  storyBibleId: string
  episodes: Record<number, Episode>
  theme: 'light' | 'dark'
  onOpenGenerationSuite?: () => void
}

export default function ActorMaterialsSelector({
  isOpen,
  onClose,
  storyBible,
  storyBibleId,
  episodes,
  theme,
  onOpenGenerationSuite
}: ActorMaterialsSelectorProps) {
  const router = useRouter()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  
  const allArcs = storyBible?.narrativeArcs || []
  const readyArcIndices = getReadyArcs(storyBible, episodes)
  const readyArcs = allArcs.filter((_: any, index: number) => readyArcIndices.includes(index))
  const totalRemaining = getTotalRemainingEpisodes(storyBible, episodes)
  
  // Show complete episodes modal if no arcs are ready (but arcs exist)
  const shouldShowCompleteEpisodesModal = isOpen && readyArcs.length === 0 && allArcs.length > 0

  const handleSelect = (arcIndex: number) => {
    router.push(`/actor-materials/arc/${arcIndex}?storyBibleId=${storyBibleId}`)
    onClose()
  }

  if (!isOpen) return null

  // Show complete episodes modal instead of selector if no arcs are ready
  if (shouldShowCompleteEpisodesModal) {
    return (
      <CompleteEpisodesModal
        isOpen={shouldShowCompleteEpisodesModal}
        onClose={onClose}
        remainingEpisodes={totalRemaining}
        storyBibleId={storyBibleId}
        theme={theme}
        onOpenGenerationSuite={onOpenGenerationSuite}
      />
    )
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative ${prefix}-card ${prefix}-border rounded-lg ${prefix}-shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${prefix}-border flex items-center justify-between`}>
            <div>
              <h2 className={`text-xl font-bold ${prefix}-text-primary`}>
                Select Arc for Actor Materials
              </h2>
              <p className={`text-sm mt-1 ${prefix}-text-secondary`}>
                Choose an arc to generate or view actor preparation materials
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${prefix}-text-secondary hover:${prefix}-bg-secondary transition-colors`}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {allArcs.length === 0 ? (
              <div className={`text-center py-12 ${prefix}-text-secondary`}>
                <p className="text-lg mb-2">No arcs found</p>
                <p className="text-sm">Your story bible needs narrative arcs</p>
              </div>
            ) : readyArcs.length === 0 ? (
              <div className={`text-center py-12 ${prefix}-text-secondary`}>
                <p className="text-lg mb-2">No arcs ready</p>
                <p className="text-sm">Complete all episodes for an arc first</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {readyArcs.map((arc: any, idx: number) => {
                  const arcIndex = readyArcIndices[idx]
                  return (
                    <motion.button
                      key={arcIndex}
                      onClick={() => handleSelect(arcIndex)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg ${prefix}-card-secondary ${prefix}-border text-left hover:${prefix}-border-accent transition-all`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className={`text-lg font-semibold ${prefix}-text-primary`}>
                            Arc {arcIndex + 1}
                          </div>
                          {arc.title && (
                            <div className={`text-sm ${prefix}-text-secondary mt-1`}>
                              {arc.title}
                            </div>
                          )}
                          {arc.episodes && (
                            <div className={`text-xs ${prefix}-text-tertiary mt-1`}>
                              {arc.episodes.length} episodes
                            </div>
                          )}
                        </div>
                      </div>
                      {arc.description && (
                        <p className={`text-xs ${prefix}-text-secondary line-clamp-2 mt-2`}>
                          {arc.description}
                        </p>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${prefix}-border flex justify-end gap-3`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium ${prefix}-btn-ghost`}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

