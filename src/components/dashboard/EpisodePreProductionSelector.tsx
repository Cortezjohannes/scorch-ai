'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Episode } from '@/services/episode-service'

interface EpisodePreProductionSelectorProps {
  isOpen: boolean
  onClose: () => void
  episodes: Record<number, Episode>
  storyBibleId: string
  theme: 'light' | 'dark'
}

export default function EpisodePreProductionSelector({
  isOpen,
  onClose,
  episodes,
  storyBibleId,
  theme
}: EpisodePreProductionSelectorProps) {
  const router = useRouter()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  
  const episodeList = Object.values(episodes)
    .sort((a, b) => a.episodeNumber - b.episodeNumber)

  const handleSelect = (episode: Episode) => {
    const episodeTitle = episode.title || `Episode ${episode.episodeNumber}`
    router.push(`/preproduction/episode/${episode.episodeNumber}?storyBibleId=${storyBibleId}&episodeTitle=${encodeURIComponent(episodeTitle)}`)
    onClose()
  }

  if (!isOpen) return null

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
                Select Episode for Pre-Production
              </h2>
              <p className={`text-sm mt-1 ${prefix}-text-secondary`}>
                Choose an episode to view or create pre-production materials
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
            {episodeList.length === 0 ? (
              <div className={`text-center py-12 ${prefix}-text-secondary`}>
                <p className="text-lg mb-2">No episodes generated yet</p>
                <p className="text-sm">Generate episodes in the Workspace first</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {episodeList.map((episode) => (
                  <motion.button
                    key={episode.episodeNumber}
                    onClick={() => handleSelect(episode)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg ${prefix}-card-secondary ${prefix}-border text-left hover:${prefix}-border-accent transition-all`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className={`text-lg font-semibold ${prefix}-text-primary`}>
                          Episode {episode.episodeNumber}
                        </div>
                        {episode.title && (
                          <div className={`text-sm ${prefix}-text-secondary mt-1`}>
                            {episode.title}
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        episode.status === 'completed' 
                          ? `${prefix}-bg-accent ${prefix}-text-accent`
                          : `${prefix}-bg-secondary ${prefix}-text-secondary`
                      }`}>
                        {episode.status === 'completed' ? 'Ready' : episode.status}
                      </span>
                    </div>
                    {episode.synopsis && (
                      <p className={`text-xs ${prefix}-text-secondary line-clamp-2 mt-2`}>
                        {episode.synopsis}
                      </p>
                    )}
                  </motion.button>
                ))}
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

