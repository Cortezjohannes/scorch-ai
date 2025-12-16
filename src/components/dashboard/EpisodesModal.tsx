'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Episode } from '@/services/episode-service'

interface EpisodesModalProps {
  isOpen: boolean
  onClose: () => void
  episodes: Record<number, Episode>
  storyBibleId: string
  theme: 'light' | 'dark'
}

export default function EpisodesModal({
  isOpen,
  onClose,
  episodes,
  storyBibleId,
  theme
}: EpisodesModalProps) {
  const router = useRouter()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'number' | 'date'>('number')

  const episodeList = Object.values(episodes)

  // Filter and sort episodes
  const filteredAndSortedEpisodes = episodeList
    .filter(episode => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return (
        episode.title?.toLowerCase().includes(query) ||
        episode.synopsis?.toLowerCase().includes(query) ||
        episode.episodeNumber.toString().includes(query)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'number') {
        return b.episodeNumber - a.episodeNumber
      } else {
        const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0
        const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0
        return dateB - dateA
      }
    })

  const handleEpisodeClick = (episode: Episode) => {
    router.push(`/episode/${episode.id}?storyBibleId=${storyBibleId}`)
    onClose()
  }

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-hidden"
          >
            <div className={`h-full ${prefix}-bg-primary ${prefix}-border rounded-xl shadow-2xl flex flex-col overflow-hidden`}>
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${prefix}-border flex-shrink-0`}>
                <div>
                  <h2 className={`text-2xl font-bold ${prefix}-text-primary`}>Generated Episodes</h2>
                  <p className={`text-sm ${prefix}-text-secondary mt-1`}>
                    {episodeList.length} {episodeList.length === 1 ? 'episode' : 'episodes'} total
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 ${prefix}-bg-secondary ${prefix}-text-secondary rounded-lg hover:${prefix}-bg-tertiary transition-colors`}
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search and Sort */}
              <div className={`p-4 border-b ${prefix}-border ${prefix}-bg-secondary flex flex-col sm:flex-row gap-4`}>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search episodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2 pr-10 ${prefix}-bg-primary ${prefix}-border rounded-lg ${prefix}-text-primary focus:outline-none focus:ring-2 focus:ring-[#10B981] text-sm`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${prefix}-text-secondary`}>Sort by:</span>
                  <button
                    onClick={() => setSortBy('number')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === 'number'
                        ? `${prefix}-bg-accent ${prefix}-text-accent`
                        : `${prefix}-bg-primary ${prefix}-text-secondary hover:${prefix}-bg-tertiary`
                    }`}
                  >
                    Episode #
                  </button>
                  <button
                    onClick={() => setSortBy('date')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === 'date'
                        ? `${prefix}-bg-accent ${prefix}-text-accent`
                        : `${prefix}-bg-primary ${prefix}-text-secondary hover:${prefix}-bg-tertiary`
                    }`}
                  >
                    Date
                  </button>
                </div>
              </div>

              {/* Episodes List */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredAndSortedEpisodes.length === 0 ? (
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-12 text-center`}>
                    <div className={`text-4xl mb-4`}>🎬</div>
                    <h3 className={`text-xl font-bold ${prefix}-text-primary mb-2`}>
                      {searchQuery ? 'No Episodes Found' : 'No Episodes Yet'}
                    </h3>
                    <p className={`${prefix}-text-secondary`}>
                      {searchQuery
                        ? `No episodes match "${searchQuery}". Try a different search term.`
                        : 'Start creating your series by generating your first episode.'}
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
                        className={`p-5 rounded-lg ${prefix}-card ${prefix}-border cursor-pointer hover:${prefix}-border-accent transition-all relative overflow-hidden group`}
                      >
                        {/* Status indicator bar */}
                        <div className={`absolute top-0 left-0 right-0 h-1 ${
                          episode.status === 'completed' || episode.status === 'pre-production-done'
                            ? `${prefix}-bg-accent`
                            : `${prefix}-bg-secondary`
                        }`}></div>
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className={`text-base font-semibold ${prefix}-text-primary mb-1`}>
                              Episode {episode.episodeNumber}
                            </div>
                            {episode.title && (
                              <div className={`text-sm font-medium ${prefix}-text-accent mb-2`}>
                                {episode.title}
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-xs">
                              {episode.lastModified && (
                                <span className={prefix + '-text-tertiary'}>
                                  📅 {new Date(episode.lastModified).toLocaleDateString()}
                                </span>
                              )}
                              {episode.scenes && (
                                <span className={prefix + '-text-tertiary'}>
                                  🎬 {episode.scenes.length} scenes
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            episode.status === 'completed' 
                              ? `${prefix}-bg-accent ${prefix}-text-accent`
                              : episode.status === 'pre-production-done'
                              ? `${prefix}-bg-accent ${prefix}-text-accent`
                              : episode.status === 'pre-production-ready'
                              ? `${prefix}-bg-secondary ${prefix}-text-secondary border ${prefix}-border`
                              : `${prefix}-bg-secondary ${prefix}-text-secondary`
                          }`}>
                            {episode.status === 'completed' ? '✓ Completed' :
                             episode.status === 'pre-production-done' ? '✓ Pre-Prod' :
                             episode.status === 'pre-production-ready' ? 'Active' : 'Draft'}
                          </span>
                        </div>
                        {episode.synopsis && (
                          <p className={`text-xs ${prefix}-text-secondary line-clamp-3 leading-relaxed`}>
                            {episode.synopsis}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

