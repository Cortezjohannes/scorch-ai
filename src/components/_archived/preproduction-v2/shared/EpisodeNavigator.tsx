import React from 'react'
import { motion } from 'framer-motion'

/**
 * Episode Navigator Component
 * 
 * Horizontal episode tabs for navigating between episodes within a tab.
 * Mobile-optimized with touch gestures.
 */

interface Episode {
  episodeNumber: number
  episodeTitle?: string
}

interface EpisodeNavigatorProps {
  episodes: Episode[]
  activeEpisode: number
  onEpisodeChange: (episodeNumber: number) => void
  className?: string
}

export const EpisodeNavigator: React.FC<EpisodeNavigatorProps> = ({
  episodes,
  activeEpisode,
  onEpisodeChange,
  className = ''
}) => {
  if (!episodes || episodes.length === 0) {
    return null
  }
  
  // If only one episode, no need for navigation
  if (episodes.length === 1) {
    return null
  }
  
  return (
    <div className={`border-b overflow-hidden ${className}`} style={{
      borderColor: 'var(--border-color)'
    }}>
      <div className="flex overflow-x-auto scrollbar-hide touch-pan-x">
        {episodes.map((episode) => {
          const isActive = activeEpisode === episode.episodeNumber
          
          return (
            <motion.button
              key={episode.episodeNumber}
              onClick={() => onEpisodeChange(episode.episodeNumber)}
              className={`
                flex-shrink-0 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium 
                transition-all border-b-2 touch-manipulation relative
                ${isActive 
                  ? 'text-[#00FF99] border-[#00FF99]' 
                  : 'border-transparent hover:text-[#00FF99]/70 opacity-70 hover:opacity-100'
                }
              `}
              style={{
                backgroundColor: isActive ? 'rgba(0, 255, 153, 0.05)' : 'transparent'
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="hidden sm:inline">Episode </span>
              <span className="font-bold">{episode.episodeNumber}</span>
              
              {episode.episodeTitle && (
                <span className="hidden lg:inline ml-2 font-normal opacity-70">
                  - {episode.episodeTitle}
                </span>
              )}
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeEpisode"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00FF99]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default EpisodeNavigator

