'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { EpisodeSummary } from '@/types/investor-materials'

interface EpisodesListProps {
  episodes: EpisodeSummary[]
  arcTitle?: string
  arcDescription?: string
}

interface EpisodeDetailModalProps {
  episode: EpisodeSummary
  isOpen: boolean
  onClose: () => void
}

function EpisodeDetailModal({ episode, isOpen, onClose }: EpisodeDetailModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-hidden"
          >
            <div className="h-full bg-[#0A0A0A] border border-[#10B981]/30 rounded-xl shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#10B981]/20 flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Episode {episode.episodeNumber}
                  </h2>
                  {episode.title && (
                    <p className="text-lg text-[#10B981] mt-1">{episode.title}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                  title="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Synopsis */}
                  {episode.summary && (
                    <div>
                      <h3 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Synopsis</h3>
                      <p className="text-white/90 leading-relaxed">{episode.summary}</p>
                    </div>
                  )}

                  {/* Episode Rundown */}
                  {episode.episodeRundown && (
                    <div>
                      <h3 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Episode Rundown</h3>
                      <p className="text-white/90 leading-relaxed">{episode.episodeRundown}</p>
                    </div>
                  )}

                  {/* Scenes */}
                  {episode.scenes && episode.scenes.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-semibold text-white/50 mb-4 uppercase tracking-wider">Scenes</h3>
                      <div className="space-y-6">
                        {episode.scenes.map((scene, idx) => (
                          <div
                            key={idx}
                            className="p-6 bg-[#121212] rounded-lg border border-[#10B981]/20"
                          >
                            <h4 className="text-lg font-semibold text-white mb-3">
                              Scene {scene.sceneNumber}: {scene.title}
                            </h4>
                            <div className="prose prose-invert max-w-none">
                              <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                                {scene.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Fallback: Show key beats if no scenes available
                    <div className="space-y-4">
                      {episode.keyBeat && (
                        <div>
                          <h3 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Key Beat</h3>
                          <p className="text-white/80">{episode.keyBeat}</p>
                        </div>
                      )}
                      {episode.emotionalBeat && (
                        <div>
                          <h3 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Emotional Beat</h3>
                          <p className="text-white/80">{episode.emotionalBeat}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function EpisodesList({ episodes, arcTitle, arcDescription }: EpisodesListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'number' | 'title'>('number')
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeSummary | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter and sort episodes
  const filteredAndSortedEpisodes = episodes
    .filter(episode => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return (
        episode.title?.toLowerCase().includes(query) ||
        episode.summary?.toLowerCase().includes(query) ||
        episode.episodeNumber.toString().includes(query)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'number') {
        return a.episodeNumber - b.episodeNumber
      } else {
        return (a.title || '').localeCompare(b.title || '')
      }
    })

  const handleEpisodeClick = (episode: EpisodeSummary) => {
    setSelectedEpisode(episode)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedEpisode(null), 300)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        {(arcTitle || arcDescription) && (
          <div className="text-center mb-8">
            {arcTitle && (
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{arcTitle}</h2>
            )}
            {arcDescription && (
              <p className="text-xl text-white/80 max-w-3xl mx-auto">{arcDescription}</p>
            )}
          </div>
        )}

        {/* Disclaimer Banner */}
        <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">ℹ️</span>
            <div className="flex-1">
              <p className="text-sm text-white/90 leading-relaxed">
                <strong className="text-[#10B981]">Note:</strong> This is the rough, uncut, unenhanced narrative of the episode used as the reference for the AI showrunner in writing the rest of the materials. For the full narrative experience, please read the screenplay instead.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="bg-[#121212] border border-[#10B981]/20 rounded-lg p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search episodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 bg-[#0A0A0A] border border-[#10B981]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10B981] text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">Sort by:</span>
            <button
              onClick={() => setSortBy('number')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'number'
                  ? 'bg-[#10B981] text-white'
                  : 'bg-[#0A0A0A] text-white/70 hover:bg-[#121212] border border-[#10B981]/20'
              }`}
            >
              Episode #
            </button>
            <button
              onClick={() => setSortBy('title')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'title'
                  ? 'bg-[#10B981] text-white'
                  : 'bg-[#0A0A0A] text-white/70 hover:bg-[#121212] border border-[#10B981]/20'
              }`}
            >
              Title
            </button>
          </div>
        </div>

        {/* Episodes List */}
        <div>
          {filteredAndSortedEpisodes.length === 0 ? (
            <div className="bg-[#121212] border border-[#10B981]/20 rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {searchQuery ? 'No Episodes Found' : 'No Episodes Yet'}
              </h3>
              <p className="text-white/70">
                {searchQuery
                  ? `No episodes match "${searchQuery}". Try a different search term.`
                  : 'No episodes available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedEpisodes.map((episode, idx) => (
                <motion.div
                  key={episode.episodeNumber}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => handleEpisodeClick(episode)}
                  className="p-5 rounded-lg bg-[#121212] border border-[#10B981]/20 cursor-pointer hover:border-[#10B981]/40 transition-all relative overflow-hidden group"
                >
                  {/* Status indicator bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#10B981]"></div>
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-base font-semibold text-white mb-1">
                        Episode {episode.episodeNumber}
                      </div>
                      {episode.title && (
                        <div className="text-sm font-medium text-[#10B981] mb-2">
                          {episode.title}
                        </div>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                      ✓ Episode
                    </span>
                  </div>
                  {episode.summary && (
                    <p className="text-xs text-white/70 line-clamp-3 leading-relaxed">
                      {episode.summary}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Episode Detail Modal */}
      {selectedEpisode && (
        <EpisodeDetailModal
          episode={selectedEpisode}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}




