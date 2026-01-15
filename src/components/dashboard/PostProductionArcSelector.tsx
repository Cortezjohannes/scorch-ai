'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Episode } from '@/services/episode-service'
import { getEpisodePreProduction, getEpisodeRangeForArc } from '@/services/preproduction-firestore'

interface PostProductionArcSelectorProps {
  isOpen: boolean
  onClose: () => void
  storyBible: any
  storyBibleId: string
  episodes: Record<number, Episode>
  theme: 'light' | 'dark'
  userId?: string
}

export default function PostProductionArcSelector({
  isOpen,
  onClose,
  storyBible,
  storyBibleId,
  episodes,
  theme,
  userId
}: PostProductionArcSelectorProps) {
  const router = useRouter()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const [completedArcs, setCompletedArcs] = useState<number[]>([])
  const [checkingArcs, setCheckingArcs] = useState(true)
  
  // Check which arcs are complete for post-production
  useEffect(() => {
    const checkCompletedArcs = async () => {
      if (!storyBible?.narrativeArcs || !userId) {
        setCheckingArcs(false)
        return
      }

      const completed: number[] = []
      
      for (let arcIndex = 0; arcIndex < storyBible.narrativeArcs.length; arcIndex++) {
        const episodeNumbers = getEpisodeRangeForArc(storyBible, arcIndex)
        
        // Check if all episodes in arc are generated
        const allEpisodesGenerated = episodeNumbers.every(epNum => episodes[epNum])
        
        if (allEpisodesGenerated) {
          // Check if all episodes have pre-production
          let allHavePreProd = true
          for (const epNum of episodeNumbers) {
            try {
              const preProd = await getEpisodePreProduction(userId, storyBibleId, epNum)
              if (!preProd) {
                allHavePreProd = false
                break
              }
            } catch (error) {
              allHavePreProd = false
              break
            }
          }
          
          if (allHavePreProd) {
            completed.push(arcIndex)
          }
        }
      }
      
      setCompletedArcs(completed)
      setCheckingArcs(false)
    }

    if (isOpen) {
      checkCompletedArcs()
    }
  }, [storyBible, episodes, storyBibleId, userId, isOpen])

  const handleSelect = (arcIndex: number) => {
    router.push(`/postproduction?arcIndex=${arcIndex}&storyBibleId=${storyBibleId}`)
    onClose()
  }

  if (!isOpen) return null

  const allArcs = storyBible?.narrativeArcs || []
  const completedArcsData = allArcs.filter((_: any, index: number) => completedArcs.includes(index))

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
                Select Arc for Post-Production
              </h2>
              <p className={`text-sm mt-1 ${prefix}-text-secondary`}>
                Choose an arc to start post-production
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
            {checkingArcs ? (
              <div className={`text-center py-12 ${prefix}-text-secondary`}>
                <p className="text-lg mb-2">Checking arc completion status...</p>
              </div>
            ) : allArcs.length === 0 ? (
              <div className={`text-center py-12 ${prefix}-text-secondary`}>
                <p className="text-lg mb-2">No arcs found</p>
                <p className="text-sm">Your story bible needs narrative arcs</p>
              </div>
            ) : completedArcsData.length === 0 ? (
              <div className={`text-center py-12 ${prefix}-text-secondary`}>
                <p className="text-lg mb-2">No arcs ready for post-production</p>
                <p className="text-sm">Complete all episodes and pre-production for an arc first</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {completedArcsData.map((arc: any, idx: number) => {
                  const arcIndex = completedArcs[idx]
                  return (
                    <motion.button
                      key={arcIndex}
                      onClick={() => handleSelect(arcIndex)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg ${prefix}-card-secondary ${prefix}-border text-left hover:${prefix}-border-accent transition-all border-2 ${
                        theme === 'dark' 
                          ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50' 
                          : 'border-green-600/30 bg-green-50 hover:border-green-600/50'
                      }`}
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
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          theme === 'dark' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          Ready
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







