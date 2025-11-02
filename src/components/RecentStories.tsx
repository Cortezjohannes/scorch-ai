'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface RecentStory {
  storyBible: {
    seriesTitle: string
    creativeMode?: string
  }
  timestamp: string
}

export function RecentStories() {
  const [recentStories, setRecentStories] = useState<RecentStory[]>([])
  const router = useRouter()

  // Load recent stories from localStorage
  useEffect(() => {
    try {
      // Check for greenlit-story-bible (new), scorched-story-bible (legacy), and reeled-story-bible (legacy)
      const greenlitBible = localStorage.getItem('greenlit-story-bible')
      const scorchedBible = localStorage.getItem('scorched-story-bible')
      const reeledBible = localStorage.getItem('reeled-story-bible')
      
      const savedBible = greenlitBible || scorchedBible || reeledBible
      
      if (savedBible) {
        const story = JSON.parse(savedBible)
        setRecentStories([story])
      } else {
        // Check if we have stories in another format or in a different key
        const otherStories = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('greenlit-') || key.startsWith('reeled-') || key.startsWith('scorched-')) && key !== 'reeled-user-choices' && key !== 'reeled-episodes' && key !== 'reeled-narratives') {
            try {
              const item = JSON.parse(localStorage.getItem(key) || '{}')
              if (item.storyBible && item.storyBible.seriesTitle) {
                otherStories.push(item)
              }
            } catch (e) {
              // Skip items that can't be parsed
            }
          }
        }
        if (otherStories.length > 0) {
          setRecentStories(otherStories)
        }
      }
    } catch (error) {
      console.error('Error loading recent stories:', error)
    }
  }, [])

  // No recent stories
  if (recentStories.length === 0) {
    return null
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date)
    } catch (e) {
      return 'Unknown date'
    }
  }

  // Navigate to continue a story
  const continueStory = () => {
    router.push('/story-bible')
  }

  // Navigate to a specific episode
  const goToEpisode = (number: number) => {
    router.push(`/episode/${number}`)
  }

  return (
    <motion.div 
      className="mt-8 w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-xl font-bold mb-4 text-[#00FF99]">Recent Stories</h2>
      
      <div className="space-y-3">
        {recentStories.map((story, index) => {
          const storyTitle = story.storyBible?.seriesTitle || 'Untitled Story'
          const creationDate = story.timestamp ? formatDate(story.timestamp) : 'Unknown date'
          const mode = story.storyBible?.creativeMode || 'beast'
          
          return (
            <motion.div 
              key={index}
              className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4 hover:border-[#00FF99] transition-colors"
              whileHover={{ y: -2 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-[#e7e7e7]">{storyTitle}</h3>
                  <p className="text-[#e7e7e7]/60 text-sm">Created: {creationDate}</p>
                  <div className="flex items-center mt-1">
                    <span className="inline-block w-2 h-2 rounded-full mr-2 bg-[#00FF99]"></span>
                    <span className="text-xs text-[#e7e7e7]/70">Multi-Model AI</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={continueStory}
                    className="px-3 py-1.5 text-sm bg-[#00FF99] text-black rounded-md hover:bg-[#00CC7A] transition-colors"
                  >
                    Story Bible
                  </button>
                  <button 
                    onClick={() => goToEpisode(1)}
                    className="px-3 py-1.5 text-sm bg-[#36393f] text-[#e7e7e7] rounded-md hover:bg-[#444] transition-colors"
                  >
                    Episodes
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
} 