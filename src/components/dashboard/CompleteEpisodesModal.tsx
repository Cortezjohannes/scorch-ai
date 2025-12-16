'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface CompleteEpisodesModalProps {
  isOpen: boolean
  onClose: () => void
  remainingEpisodes: number
  storyBibleId: string
  theme: 'light' | 'dark'
  onOpenGenerationSuite?: () => void
}

export default function CompleteEpisodesModal({
  isOpen,
  onClose,
  remainingEpisodes,
  storyBibleId,
  theme,
  onOpenGenerationSuite
}: CompleteEpisodesModalProps) {
  const router = useRouter()
  const prefix = theme === 'dark' ? 'dark' : 'light'

  const handleGoToWorkspace = () => {
    onClose()
    if (onOpenGenerationSuite) {
      onOpenGenerationSuite()
    } else {
      router.push(`/workspace?id=${storyBibleId}`)
    }
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
          className={`relative ${prefix}-card ${prefix}-border rounded-lg ${prefix}-shadow-lg max-w-md w-full overflow-hidden flex flex-col`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${prefix}-border flex items-center justify-between`}>
            <div>
              <h2 className={`text-xl font-bold ${prefix}-text-primary`}>
                Complete Episodes First
              </h2>
              <p className={`text-sm mt-1 ${prefix}-text-secondary`}>
                Generate all episodes before accessing pre-production
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
          <div className="p-6">
            <div className={`text-center mb-6`}>
              <div className={`text-5xl mb-4 ${prefix}-text-primary`}>
                📺
              </div>
              <p className={`text-base ${prefix}-text-primary mb-2`}>
                You need to generate all episodes for an arc before you can access pre-production materials.
              </p>
              <p className={`text-sm ${prefix}-text-secondary`}>
                {remainingEpisodes > 0 ? (
                  <>
                    <span className={`font-semibold ${prefix}-text-accent`}>
                      {remainingEpisodes} episode{remainingEpisodes !== 1 ? 's' : ''}
                    </span>{' '}
                    {remainingEpisodes === 1 ? 'remains' : 'remain'} to be generated.
                  </>
                ) : (
                  'Please generate episodes first.'
                )}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${prefix}-border flex justify-end gap-3`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium ${prefix}-btn-ghost`}
            >
              Cancel
            </button>
            <button
              onClick={handleGoToWorkspace}
              className={`px-4 py-2 rounded-lg font-medium ${prefix}-btn-primary`}
            >
              Go to Workspace
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
































