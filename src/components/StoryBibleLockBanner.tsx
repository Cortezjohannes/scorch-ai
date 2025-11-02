'use client'

import { Lock, Unlock, Info, AlertTriangle } from 'lucide-react'
import { storyBibleLock } from '@/services/story-bible-lock'

// ============================================================================
// TYPES
// ============================================================================

interface StoryBibleLockBannerProps {
  episodeCount: number
  onLearnMore?: () => void
}

// ============================================================================
// STORY BIBLE LOCK BANNER
// ============================================================================

export default function StoryBibleLockBanner({
  episodeCount,
  onLearnMore
}: StoryBibleLockBannerProps) {
  const lockStatus = storyBibleLock.checkLockStatus(episodeCount)
  const displayInfo = storyBibleLock.formatLockStatusMessage(episodeCount)

  const getVariantClasses = () => {
    switch (displayInfo.variant) {
      case 'warning':
        return 'bg-yellow-900/30 border-yellow-500/50 text-yellow-200'
      case 'info':
        return 'bg-blue-900/30 border-blue-500/50 text-blue-200'
      case 'success':
        return 'bg-green-900/30 border-green-500/50 text-green-200'
      default:
        return 'bg-gray-800 border-gray-700 text-gray-300'
    }
  }

  return (
    <div className={`rounded-lg border-2 p-4 mb-6 ${getVariantClasses()}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 text-3xl mt-0.5">
          {lockStatus.isLocked ? (
            <Lock className="w-6 h-6" />
          ) : (
            <Unlock className="w-6 h-6" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white">{displayInfo.title}</h3>
            {lockStatus.isLocked && (
              <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                {episodeCount} Episode{episodeCount !== 1 ? 's' : ''} Generated
              </span>
            )}
          </div>

          <p className="text-sm mb-3">{displayInfo.message}</p>

          {lockStatus.isLocked && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-green-200">You can still add new characters using the Character Wizard</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-green-200">Use Episode Reflection to update the story bible from generated episodes</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-red-400 font-bold">✗</span>
                <span className="text-red-200">Editing existing content is disabled to maintain consistency</span>
              </div>
            </div>
          )}

          {!lockStatus.isLocked && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mt-2">
              <div className="flex items-start gap-2 text-sm text-blue-200">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Tip:</strong> Once you generate your first episode, the story bible will lock to prevent
                  continuity issues. Make sure your core world building and character foundations are solid before
                  generating episodes!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Learn More */}
        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="flex-shrink-0 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          >
            Learn More
          </button>
        )}
      </div>
    </div>
  )
}

