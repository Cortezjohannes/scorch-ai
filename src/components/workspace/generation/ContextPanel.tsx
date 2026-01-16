'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getEpisode, saveEpisode } from '@/services/episode-service'
import { useAuth } from '@/context/AuthContext'

interface ContextPanelProps {
  previousEpisode: any | null
  previousEpisodeSummary: string
  loadingSummary: boolean
  storyBible: any
  episodeNumber: number
  arcInfo: {
    arcIndex: number
    arcTitle: string
    episodeInArc: number
    totalInArc: number
  }
  theme: 'light' | 'dark'
  storyBibleId?: string
  allPreviousEpisodes?: any[]
  episodeGoal?: string
  beatSheet?: string
}

export default function ContextPanel({
  previousEpisode,
  previousEpisodeSummary,
  loadingSummary,
  storyBible,
  episodeNumber,
  arcInfo,
  theme,
  storyBibleId,
  allPreviousEpisodes = [],
  episodeGoal = '',
  beatSheet = ''
}: ContextPanelProps) {
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const { user } = useAuth()
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    recap: true,
    continuity: false,
    worldBuilding: false,
    plotThreads: false,
    suggestedDirection: false,
    arcProgress: true
  })

  // AI-generated content state
  const [plotThreads, setPlotThreads] = useState<string[]>([])
  const [loadingPlotThreads, setLoadingPlotThreads] = useState(false)
  const [continuityChecker, setContinuityChecker] = useState<{ callbacks: string[], chekhovsGuns: string[] } | null>(null)
  const [loadingContinuity, setLoadingContinuity] = useState(false)
  const [worldBuildingRef, setWorldBuildingRef] = useState<string>('')
  const [loadingWorldBuilding, setLoadingWorldBuilding] = useState(false)
  const [suggestedDirection, setSuggestedDirection] = useState<string>('')
  const [loadingSuggestedDirection, setLoadingSuggestedDirection] = useState(false)

  // Calculate arc progress
  const calculateArcProgress = () => {
    const progress = (arcInfo.episodeInArc / arcInfo.totalInArc) * 100
    return Math.round(progress)
  }

  const arcProgress = calculateArcProgress()

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Load metadata from Firestore on mount
  useEffect(() => {
    const loadMetadata = async () => {
      if (!storyBibleId || !user?.id) return

      try {
        const episode = await getEpisode(storyBibleId, episodeNumber, user.id)
        if (episode?.metadata) {
          if (episode.metadata.plotThreads) {
            setPlotThreads(episode.metadata.plotThreads)
          }
          if (episode.metadata.continuityChecker) {
            setContinuityChecker(episode.metadata.continuityChecker)
          }
          if (episode.metadata.worldBuildingRef) {
            setWorldBuildingRef(episode.metadata.worldBuildingRef)
          }
          if (episode.metadata.suggestedDirection) {
            setSuggestedDirection(episode.metadata.suggestedDirection)
          }
        }
      } catch (error) {
        console.error('Error loading episode metadata:', error)
      }
    }

    loadMetadata()
  }, [storyBibleId, episodeNumber, user?.id])

  // Generate plot threads
  const generatePlotThreads = async () => {
    if (loadingPlotThreads || plotThreads.length > 0) return

    setLoadingPlotThreads(true)
    try {
      const response = await fetch('/api/generate/plot-threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          episodeNumber,
          previousEpisode,
          allPreviousEpisodes,
          episodeGoal
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate plot threads')
      }

      const data = await response.json()
      if (data.success && data.plotThreads) {
        setPlotThreads(data.plotThreads)

        // Save to Firestore ONLY if episode exists and has content
        if (storyBibleId && user?.id) {
          try {
            const episode = await getEpisode(storyBibleId, episodeNumber, user.id)
            // Only save metadata if episode exists AND has actual content (scenes)
            if (episode && episode.scenes && episode.scenes.length > 0) {
              await saveEpisode({
                ...episode,
                metadata: {
                  ...episode?.metadata,
                  plotThreads: data.plotThreads
                }
              }, storyBibleId, user.id)
              console.log('✅ Saved plot threads to Firestore')
            } else {
              console.log('⚠️ Episode not yet created or empty - keeping plot threads in memory only')
            }
          } catch (error) {
            console.error('Error saving plot threads to Firestore:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error generating plot threads:', error)
      setPlotThreads(['Failed to generate plot threads'])
    } finally {
      setLoadingPlotThreads(false)
    }
  }

  // Generate continuity checker
  const generateContinuityChecker = async () => {
    if (loadingContinuity || continuityChecker) return

    setLoadingContinuity(true)
    try {
      const response = await fetch('/api/generate/continuity-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          episodeNumber,
          previousEpisode,
          allPreviousEpisodes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate continuity checker')
      }

      const data = await response.json()
      if (data.success && data.continuityChecker) {
        setContinuityChecker(data.continuityChecker)

        // Save to Firestore ONLY if episode exists and has content
        if (storyBibleId && user?.id) {
          try {
            const episode = await getEpisode(storyBibleId, episodeNumber, user.id)
            // Only save metadata if episode exists AND has actual content (scenes)
            if (episode && episode.scenes && episode.scenes.length > 0) {
              await saveEpisode({
                ...episode,
                metadata: {
                  ...episode?.metadata,
                  continuityChecker: data.continuityChecker
                }
              }, storyBibleId, user.id)
              console.log('✅ Saved continuity checker to Firestore')
            } else {
              console.log('⚠️ Episode not yet created or empty - keeping continuity checker in memory only')
            }
          } catch (error) {
            console.error('Error saving continuity checker to Firestore:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error generating continuity checker:', error)
      setContinuityChecker({
        callbacks: ['Failed to generate continuity checker'],
        chekhovsGuns: []
      })
    } finally {
      setLoadingContinuity(false)
    }
  }

  // Generate world building reference
  const generateWorldBuildingRef = async () => {
    if (loadingWorldBuilding || worldBuildingRef) return

    setLoadingWorldBuilding(true)
    try {
      const response = await fetch('/api/generate/world-building-ref', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          episodeNumber,
          allPreviousEpisodes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate world building reference')
      }

      const data = await response.json()
      if (data.success && data.worldBuildingRef) {
        setWorldBuildingRef(data.worldBuildingRef)

        // Save to Firestore ONLY if episode exists and has content
        if (storyBibleId && user?.id) {
          try {
            const episode = await getEpisode(storyBibleId, episodeNumber, user.id)
            // Only save metadata if episode exists AND has actual content (scenes)
            if (episode && episode.scenes && episode.scenes.length > 0) {
              await saveEpisode({
                ...episode,
                metadata: {
                  ...episode?.metadata,
                  worldBuildingRef: data.worldBuildingRef
                }
              }, storyBibleId, user.id)
              console.log('✅ Saved world building ref to Firestore')
            } else {
              console.log('⚠️ Episode not yet created or empty - keeping world building ref in memory only')
            }
          } catch (error) {
            console.error('Error saving world building ref to Firestore:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error generating world building reference:', error)
      setWorldBuildingRef('Failed to generate world building reference')
    } finally {
      setLoadingWorldBuilding(false)
    }
  }

  // Generate suggested direction
  const generateSuggestedDirection = async () => {
    if (loadingSuggestedDirection || suggestedDirection) return

    setLoadingSuggestedDirection(true)
    try {
      const response = await fetch('/api/generate/suggested-direction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          episodeNumber,
          previousEpisode,
          allPreviousEpisodes,
          episodeGoal,
          beatSheet
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate suggested direction')
      }

      const data = await response.json()
      if (data.success && data.suggestedDirection) {
        setSuggestedDirection(data.suggestedDirection)

        // Save to Firestore ONLY if episode exists and has content
        if (storyBibleId && user?.id) {
          try {
            const episode = await getEpisode(storyBibleId, episodeNumber, user.id)
            // Only save metadata if episode exists AND has actual content (scenes)
            if (episode && episode.scenes && episode.scenes.length > 0) {
              await saveEpisode({
                ...episode,
                metadata: {
                  ...episode?.metadata,
                  suggestedDirection: data.suggestedDirection
                }
              }, storyBibleId, user.id)
              console.log('✅ Saved suggested direction to Firestore')
            } else {
              console.log('⚠️ Episode not yet created or empty - keeping suggested direction in memory only')
            }
          } catch (error) {
            console.error('Error saving suggested direction to Firestore:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error generating suggested direction:', error)
      setSuggestedDirection('Failed to generate suggested direction')
    } finally {
      setLoadingSuggestedDirection(false)
    }
  }

  // Auto-generate on section expand if not already loaded
  useEffect(() => {
    if (expandedSections.plotThreads && plotThreads.length === 0 && !loadingPlotThreads && storyBibleId && user?.id) {
      generatePlotThreads()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedSections.plotThreads, plotThreads.length, loadingPlotThreads])

  useEffect(() => {
    if (expandedSections.continuity && !continuityChecker && !loadingContinuity && storyBibleId && user?.id) {
      generateContinuityChecker()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedSections.continuity, continuityChecker, loadingContinuity])

  useEffect(() => {
    if (expandedSections.worldBuilding && !worldBuildingRef && !loadingWorldBuilding && storyBibleId && user?.id) {
      generateWorldBuildingRef()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedSections.worldBuilding, worldBuildingRef, loadingWorldBuilding])

  useEffect(() => {
    if (expandedSections.suggestedDirection && !suggestedDirection && !loadingSuggestedDirection && storyBibleId && user?.id) {
      generateSuggestedDirection()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedSections.suggestedDirection, suggestedDirection, loadingSuggestedDirection])

  return (
    <div className="space-y-4">
      <h3 className={`text-sm font-semibold ${prefix}-text-primary mb-4`}>Context & Reference</h3>

      {/* Previous Episode Recap - Blue accent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg border-l-4 border-blue-500 ${prefix}-card ${prefix}-border overflow-hidden`}
      >
        <button
          onClick={() => toggleSection('recap')}
          className={`w-full p-3 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 transition-colors`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className={`text-sm font-semibold ${prefix}-text-primary`}>Previous Episode Recap</span>
          </div>
          <span className={`text-xs ${prefix}-text-tertiary`}>
            {expandedSections.recap ? '▼' : '▶'}
          </span>
        </button>
        {expandedSections.recap && (
          <div className={`p-3 ${prefix}-bg-primary`}>
            {loadingSummary ? (
              <div className={`text-sm ${prefix}-text-secondary`}>Loading recap...</div>
            ) : previousEpisodeSummary ? (
              <p className={`text-sm ${prefix}-text-secondary leading-relaxed`}>
                {previousEpisodeSummary}
              </p>
            ) : previousEpisode ? (
              <p className={`text-sm ${prefix}-text-secondary leading-relaxed`}>
                {previousEpisode.synopsis || 'No summary available for previous episode.'}
              </p>
            ) : (
              <p className={`text-sm ${prefix}-text-secondary`}>
                This is the first episode. No previous recap available.
              </p>
            )}
            {previousEpisode && (
              <div className={`mt-2 text-xs ${prefix}-text-tertiary`}>
                Episode {episodeNumber - 1} • {previousEpisode.scenes?.length || 0} scenes
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Continuity Checker - Orange accent - Moved to top */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-lg border-l-4 border-orange-500 ${prefix}-card ${prefix}-border overflow-hidden`}
      >
        <button
          onClick={() => toggleSection('continuity')}
          className={`w-full p-3 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 transition-colors`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className={`text-sm font-semibold ${prefix}-text-primary`}>Continuity Checker</span>
            {loadingContinuity && (
              <span className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin ml-2"></span>
            )}
          </div>
          <span className={`text-xs ${prefix}-text-tertiary`}>
            {expandedSections.continuity ? '▼' : '▶'}
          </span>
        </button>
        {expandedSections.continuity && (
          <div className={`p-3 ${prefix}-bg-primary space-y-3`}>
            {loadingContinuity ? (
              <div className={`text-sm ${prefix}-text-secondary`}>Generating continuity analysis...</div>
            ) : continuityChecker ? (
              <>
                <div>
                  <div className={`text-xs font-semibold ${prefix}-text-primary mb-2`}>Callbacks Needed:</div>
                  <div className="space-y-1">
                    {continuityChecker.callbacks.map((callback, idx) => (
                      <div key={idx} className={`text-sm ${prefix}-text-secondary flex items-start gap-2`}>
                        <span className="text-orange-500">↩</span>
                        <span>{callback}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className={`text-xs font-semibold ${prefix}-text-primary mb-2`}>Chekhov's Guns:</div>
                  <div className="space-y-1">
                    {continuityChecker.chekhovsGuns.map((gun, idx) => (
                      <div key={idx} className={`text-sm ${prefix}-text-secondary flex items-start gap-2`}>
                        <span className="text-orange-500">🔫</span>
                        <span>{gun}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className={`text-sm ${prefix}-text-secondary`}>
                Click to generate continuity analysis
                    </div>
                  )}
                </div>
        )}
      </motion.div>

      {/* World-Building Reference - Indigo accent - Below Continuity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-lg border-l-4 border-indigo-500 ${prefix}-card ${prefix}-border overflow-hidden`}
      >
        <button
          onClick={() => toggleSection('worldBuilding')}
          className={`w-full p-3 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 transition-colors`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span className={`text-sm font-semibold ${prefix}-text-primary`}>World-Building Ref</span>
            {loadingWorldBuilding && (
              <span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin ml-2"></span>
            )}
          </div>
          <span className={`text-xs ${prefix}-text-tertiary`}>
            {expandedSections.worldBuilding ? '▼' : '▶'}
          </span>
        </button>
        {expandedSections.worldBuilding && (
          <div className={`p-3 ${prefix}-bg-primary`}>
            {loadingWorldBuilding ? (
              <div className={`text-sm ${prefix}-text-secondary`}>Generating world building reference...</div>
            ) : worldBuildingRef ? (
              <p className={`text-sm ${prefix}-text-secondary leading-relaxed`}>
                {worldBuildingRef}
              </p>
            ) : (
              <div className={`text-sm ${prefix}-text-secondary`}>
                Click to generate world building reference
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Plot Threads - Gold/Yellow accent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-lg border-l-4 border-[#E2C376] ${prefix}-card ${prefix}-border overflow-hidden`}
      >
        <button
          onClick={() => toggleSection('plotThreads')}
          className={`w-full p-3 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 transition-colors`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#E2C376]"></div>
            <span className={`text-sm font-semibold ${prefix}-text-primary`}>Plot Threads</span>
            {loadingPlotThreads && (
              <span className="w-3 h-3 border-2 border-[#E2C376] border-t-transparent rounded-full animate-spin ml-2"></span>
            )}
          </div>
          <span className={`text-xs ${prefix}-text-tertiary`}>
            {expandedSections.plotThreads ? '▼' : '▶'}
          </span>
        </button>
        {expandedSections.plotThreads && (
          <div className={`p-3 ${prefix}-bg-primary space-y-2`}>
            {loadingPlotThreads ? (
              <div className={`text-sm ${prefix}-text-secondary`}>Generating plot threads...</div>
            ) : plotThreads.length > 0 ? (
              plotThreads.map((thread, idx) => (
              <div key={idx} className={`text-sm ${prefix}-text-secondary flex items-start gap-2`}>
                <span className="text-[#E2C376]">•</span>
                <span>{thread}</span>
                </div>
              ))
            ) : (
              <div className={`text-sm ${prefix}-text-secondary`}>
                Click to generate plot threads
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Suggested Direction - Teal/Green accent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className={`rounded-lg border-l-4 border-teal-500 ${prefix}-card ${prefix}-border overflow-hidden`}
      >
        <button
          onClick={() => toggleSection('suggestedDirection')}
          className={`w-full p-3 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 transition-colors`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500"></div>
            <span className={`text-sm font-semibold ${prefix}-text-primary`}>Suggested Direction</span>
            {loadingSuggestedDirection && (
              <span className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full animate-spin ml-2"></span>
            )}
          </div>
          <span className={`text-xs ${prefix}-text-tertiary`}>
            {expandedSections.suggestedDirection ? '▼' : '▶'}
          </span>
        </button>
        {expandedSections.suggestedDirection && (
          <div className={`p-3 ${prefix}-bg-primary`}>
            {loadingSuggestedDirection ? (
              <div className={`text-sm ${prefix}-text-secondary`}>Generating suggested directions...</div>
            ) : suggestedDirection ? (
              <div className={`text-sm ${prefix}-text-secondary leading-relaxed whitespace-pre-line`}>
                {suggestedDirection}
              </div>
            ) : (
              <div className={`text-sm ${prefix}-text-secondary`}>
                Click to generate suggested directions
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Arc Progress Tracker - Purple accent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-lg border-l-4 border-purple-500 ${prefix}-card ${prefix}-border overflow-hidden`}
      >
        <button
          onClick={() => toggleSection('arcProgress')}
          className={`w-full p-3 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 transition-colors`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className={`text-sm font-semibold ${prefix}-text-primary`}>Arc Progress</span>
          </div>
          <span className={`text-xs ${prefix}-text-tertiary`}>
            {expandedSections.arcProgress ? '▼' : '▶'}
          </span>
        </button>
        {expandedSections.arcProgress && (
          <div className={`p-3 ${prefix}-bg-primary`}>
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className={`text-xs ${prefix}-text-secondary`}>{arcInfo.arcTitle}</span>
                <span className={`text-xs font-semibold text-purple-500`}>{arcProgress}%</span>
              </div>
              <div className={`h-2 rounded-full ${prefix}-bg-secondary overflow-hidden`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${arcProgress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                />
              </div>
            </div>
            <div className={`text-xs ${prefix}-text-secondary`}>
              Episode {arcInfo.episodeInArc} of {arcInfo.totalInArc} in this arc
            </div>
            <div className={`mt-2 flex gap-1`}>
              {Array.from({ length: arcInfo.totalInArc }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded ${
                    idx < arcInfo.episodeInArc
                      ? 'bg-purple-500'
                      : idx === arcInfo.episodeInArc - 1
                      ? 'bg-purple-500 ring-2 ring-purple-500/30'
                      : `${prefix}-bg-secondary`
                  }`}
                  title={`Episode ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
