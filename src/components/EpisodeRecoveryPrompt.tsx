'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { recoverLocalStorageEpisode } from '@/services/episode-service'

interface EpisodeRecoveryPromptProps {
  isOpen: boolean
  recoverableEpisodes: number[]
  storyBibleId: string
  userId: string
  onClose: () => void
  onRecoveryComplete: () => void
}

export default function EpisodeRecoveryPrompt({
  isOpen,
  recoverableEpisodes,
  storyBibleId,
  userId,
  onClose,
  onRecoveryComplete
}: EpisodeRecoveryPromptProps) {
  const [isRecovering, setIsRecovering] = useState(false)
  const [recoveryStatus, setRecoveryStatus] = useState<Record<number, 'pending' | 'success' | 'error'>>({})

  const handleRecover = async () => {
    setIsRecovering(true)
    
    // Initialize status for all episodes
    const initialStatus: Record<number, 'pending' | 'success' | 'error'> = {}
    recoverableEpisodes.forEach(num => {
      initialStatus[num] = 'pending'
    })
    setRecoveryStatus(initialStatus)

    // Recover each episode
    for (const episodeNumber of recoverableEpisodes) {
      try {
        const success = await recoverLocalStorageEpisode(episodeNumber, storyBibleId, userId)
        setRecoveryStatus(prev => ({
          ...prev,
          [episodeNumber]: success ? 'success' : 'error'
        }))
      } catch (error) {
        console.error(`Error recovering episode ${episodeNumber}:`, error)
        setRecoveryStatus(prev => ({
          ...prev,
          [episodeNumber]: 'error'
        }))
      }
    }

    setIsRecovering(false)
    
    // Wait a moment to show results, then trigger reload
    setTimeout(() => {
      onRecoveryComplete()
    }, 1500)
  }

  const handleSkip = () => {
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
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleSkip}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#1a1a1a] border border-[#10B981]/30 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Icon */}
          <div className="flex justify-center pt-8 pb-4">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/20 border-2 border-[#10B981]/40 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-[#10B981]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" 
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Episodes Found in Local Storage
            </h2>
            
            <p className="text-[#e7e7e7]/80 mb-4">
              We found {recoverableEpisodes.length} episode{recoverableEpisodes.length !== 1 ? 's' : ''} on this device that {recoverableEpisodes.length !== 1 ? 'aren\'t' : 'isn\'t'} in your cloud storage yet.
            </p>

            {/* Episode list */}
            <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4 mb-6">
              <div className="text-left space-y-2">
                {recoverableEpisodes.map(num => (
                  <div 
                    key={num} 
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-[#e7e7e7]">Episode {num}</span>
                    {recoveryStatus[num] && (
                      <span className={`text-xs ${
                        recoveryStatus[num] === 'success' 
                          ? 'text-green-400' 
                          : recoveryStatus[num] === 'error'
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}>
                        {recoveryStatus[num] === 'success' ? '✓ Recovered' : 
                         recoveryStatus[num] === 'error' ? '✗ Failed' : 
                         '⟳ Recovering...'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-[#e7e7e7]/60 text-sm mb-6">
              Would you like to recover {recoverableEpisodes.length !== 1 ? 'these episodes' : 'this episode'} to your account?
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                disabled={isRecovering}
                className="flex-1 px-6 py-3 bg-[#2a2a2a] border border-[#36393f] text-[#e7e7e7] font-medium rounded-lg hover:bg-[#36393f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip
              </button>
              
              <button
                onClick={handleRecover}
                disabled={isRecovering}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#10B981]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRecovering ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Recovering...
                  </>
                ) : (
                  'Recover Episodes'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

