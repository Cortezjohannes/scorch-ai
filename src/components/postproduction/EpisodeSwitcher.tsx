'use client'

import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface EpisodeSwitcherProps {
  currentEpisode: number
  availableEpisodes: number[]
  storyBibleId: string
  arcIndex: number | null
  onEpisodeChange?: (episodeNumber: number) => void
}

export function EpisodeSwitcher({
  currentEpisode,
  availableEpisodes,
  storyBibleId,
  arcIndex,
  onEpisodeChange
}: EpisodeSwitcherProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEpisodeSelect = (episodeNumber: number) => {
    if (episodeNumber === currentEpisode) {
      setIsOpen(false)
      return
    }

    // Update URL with new episode number
    const params = new URLSearchParams()
    params.set('storyBibleId', storyBibleId)
    params.set('episodeNumber', episodeNumber.toString())
    if (arcIndex !== null) {
      params.set('arcIndex', arcIndex.toString())
    }

    router.push(`/postproduction?${params.toString()}`)
    
    if (onEpisodeChange) {
      onEpisodeChange(episodeNumber)
    }
    
    setIsOpen(false)
  }

  if (availableEpisodes.length <= 1) {
    return null // Don't show switcher if there's only one episode
  }

  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg
          className="w-4 h-4 text-[#10B981]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="font-medium">Episode {currentEpisode}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-[100] overflow-hidden"
        >
          <div className="py-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-700">
              Switch Episode
            </div>
            {availableEpisodes.map((episodeNum) => (
              <button
                key={episodeNum}
                onClick={() => handleEpisodeSelect(episodeNum)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  episodeNum === currentEpisode
                    ? 'bg-[#10B981]/20 text-[#10B981] font-medium'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Episode {episodeNum}</span>
                  {episodeNum === currentEpisode && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

