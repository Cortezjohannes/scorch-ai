'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StorySection, EpisodeSummary } from '@/types/investor-materials'

interface EpisodeGridProps {
  story: StorySection
}

interface EpisodeModalProps {
  episodes: EpisodeSummary[]
  initialEpisodeNumber: number
  isOpen: boolean
  onClose: () => void
}

function EpisodeModal({ episodes, initialEpisodeNumber, isOpen, onClose }: EpisodeModalProps) {
  const [activeEpisodeNumber, setActiveEpisodeNumber] = useState(initialEpisodeNumber)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setActiveEpisodeNumber(initialEpisodeNumber)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, initialEpisodeNumber])

  const activeEpisode = episodes.find(ep => ep.episodeNumber === activeEpisodeNumber) || episodes[0]

  if (!activeEpisode) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#0A0A0A] border border-[#10B981]/30 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#10B981]/20">
              <h3 className="text-2xl font-bold text-white">The Story</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Episode Tabs */}
            <div className="flex gap-2 border-b border-[#10B981]/20 px-6 overflow-x-auto">
              {episodes.map((episode) => (
                <button
                  key={episode.episodeNumber}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveEpisodeNumber(episode.episodeNumber)
                  }}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap relative transition-colors ${
                    activeEpisodeNumber === episode.episodeNumber
                      ? 'text-[#10B981]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Episode {episode.episodeNumber}: {episode.title}
                  {activeEpisodeNumber === episode.episodeNumber && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981]" />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Episode Header */}
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    Episode {activeEpisode.episodeNumber}
                  </h4>
                  <p className="text-lg text-[#10B981]">{activeEpisode.title}</p>
                </div>

                {/* Synopsis */}
                {activeEpisode.summary && (
                  <div>
                    <h5 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Synopsis</h5>
                    <p className="text-white/90 leading-relaxed">{activeEpisode.summary}</p>
                  </div>
                )}

                {/* Episode Rundown */}
                {activeEpisode.episodeRundown && (
                  <div>
                    <h5 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Episode Rundown</h5>
                    <p className="text-white/90 leading-relaxed">{activeEpisode.episodeRundown}</p>
                  </div>
                )}

                {/* Scenes */}
                {activeEpisode.scenes && activeEpisode.scenes.length > 0 ? (
                  <div>
                    <h5 className="text-sm font-semibold text-white/50 mb-4 uppercase tracking-wider">Scenes</h5>
                    <div className="space-y-6">
                      {activeEpisode.scenes.map((scene, idx) => (
                        <div
                          key={idx}
                          className="p-6 bg-[#121212] rounded-lg border border-[#10B981]/20"
                        >
                          <h6 className="text-lg font-semibold text-white mb-3">
                            Scene {scene.sceneNumber}: {scene.title}
                          </h6>
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
                    {activeEpisode.keyBeat && (
                      <div>
                        <h5 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Key Beat</h5>
                        <p className="text-white/80">{activeEpisode.keyBeat}</p>
                      </div>
                    )}
                    {activeEpisode.emotionalBeat && (
                      <div>
                        <h5 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Emotional Beat</h5>
                        <p className="text-white/80">{activeEpisode.emotionalBeat}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function EpisodeGrid({ story }: EpisodeGridProps) {
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEpisodeClick = (episode: EpisodeSummary) => {
    setSelectedEpisodeNumber(episode.episodeNumber)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedEpisodeNumber(null), 300) // Delay to allow animation
  }

  return (
    <>
      <div className="space-y-10">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{story.arcTitle}</h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">{story.arcDescription}</p>
        </div>

        {/* Episode Grid - 2x4 layout with better spacing */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {story.episodes.map((episode) => {
            const gradientIntensity = 0.1 + (episode.episodeNumber * 0.05)

            return (
              <motion.div
                key={episode.episodeNumber}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative aspect-[3/4] rounded-xl cursor-pointer transition-all duration-300 overflow-hidden group"
                style={{
                  background: `linear-gradient(135deg, rgba(16, 185, 129, ${gradientIntensity}), rgba(5, 150, 105, ${gradientIntensity}))`
                }}
                onClick={() => handleEpisodeClick(episode)}
              >
                {/* Episode Number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <div className="text-6xl md:text-7xl font-bold mb-3 text-[#10B981] transition-transform group-hover:scale-110">
                    {episode.episodeNumber}
                  </div>
                  <p className="text-sm md:text-base text-center text-white/90 font-medium px-2">
                    {episode.title}
                  </p>
                </div>

                {/* Click Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white/70 bg-black/50 px-3 py-1 rounded-full">
                    Click for details
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Transformation Callout */}
        {story.transformation && (story.transformation.start || story.transformation.end || story.transformation.journey) && (
          <div className="mt-12 p-8 bg-[#121212] rounded-2xl border border-[#10B981]/20">
            <h3 className="text-2xl font-bold mb-6 text-white">The Transformation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {story.transformation.start && (
                <div>
                  <p className="text-sm text-white/50 mb-2 uppercase tracking-wider">Start</p>
                  <p className="text-lg text-white/90">{story.transformation.start}</p>
                </div>
              )}
              {story.transformation.end && (
                <div>
                  <p className="text-sm text-white/50 mb-2 uppercase tracking-wider">End</p>
                  <p className="text-lg text-white/90">{story.transformation.end}</p>
                </div>
              )}
            </div>
            {story.transformation.journey && (
              <div className="mt-6 pt-6 border-t border-[#10B981]/20">
                <p className="text-white/80 leading-relaxed">{story.transformation.journey}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Episode Modal */}
      <EpisodeModal
        episodes={story.episodes}
        initialEpisodeNumber={selectedEpisodeNumber || story.episodes[0]?.episodeNumber || 1}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
