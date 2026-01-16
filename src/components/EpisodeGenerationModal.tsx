'use client'

import EpisodeGenerationLoader from './EpisodeGenerationLoader'

interface EpisodeGenerationModalProps {
  isOpen: boolean
  episodeNumber: number
  seriesTitle: string
  isPremiumMode: boolean
  episodeData?: any | null  // Episode data from API response
  storyBibleId?: string  // Story bible ID for Firestore polling
  onComplete?: () => void // Optional - may handle redirect elsewhere
}

export default function EpisodeGenerationModal({
  isOpen,
  episodeNumber,
  seriesTitle,
  isPremiumMode,
  episodeData,
  storyBibleId,
  onComplete
}: EpisodeGenerationModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl p-8">
        <EpisodeGenerationLoader
          episodeNumber={episodeNumber}
          seriesTitle={seriesTitle}
          isPremiumMode={isPremiumMode}
          episodeData={episodeData}
          storyBibleId={storyBibleId}
          onComplete={onComplete}
        />
      </div>
    </div>
  )
}

