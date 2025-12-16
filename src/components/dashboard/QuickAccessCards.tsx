'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Episode } from '@/services/episode-service'
import EpisodePreProductionSelector from './EpisodePreProductionSelector'
import ArcPreProductionSelector from './ArcPreProductionSelector'
import ActorMaterialsSelector from './ActorMaterialsSelector'
import EpisodesModal from './EpisodesModal'

interface QuickAccessCardsProps {
  storyBibleId: string
  storyBible: any
  episodes: Record<number, Episode>
  theme: 'light' | 'dark'
  onOpenGenerationSuite?: () => void
  userId?: string
  userName?: string
  totalEpisodes?: number
}

export default function QuickAccessCards({ storyBibleId, storyBible, episodes, theme, onOpenGenerationSuite, userId, userName, totalEpisodes = 0 }: QuickAccessCardsProps) {
  const router = useRouter()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false)
  const [showArcSelector, setShowArcSelector] = useState(false)
  const [showActorMaterialsSelector, setShowActorMaterialsSelector] = useState(false)
  const [showEpisodesModal, setShowEpisodesModal] = useState(false)

  // Get the next episode number to generate
  const getNextEpisodeNumber = () => {
    const episodeNumbers = Object.keys(episodes).map(Number).sort((a, b) => b - a)
    return episodeNumbers.length > 0 ? episodeNumbers[0] + 1 : 1
  }

  // Check if all episodes are generated
  const generatedEpisodesCount = Object.keys(episodes).length
  const allEpisodesGenerated = totalEpisodes > 0 && generatedEpisodesCount >= totalEpisodes

  // Get Episode Studio subtitle based on state
  const getEpisodeStudioSubtitle = () => {
    if (generatedEpisodesCount === 0) {
      return 'Start writing an episode'
    } else if (allEpisodesGenerated) {
      return 'All episodes generated'
    } else {
      return 'Write the next episode'
    }
  }

  const handleEpisodeStudioClick = (e: React.MouseEvent) => {
    if (allEpisodesGenerated) {
      e.preventDefault()
      e.stopPropagation()
      return // Don't allow clicking if all episodes are generated
    }
    e.preventDefault()
    e.stopPropagation()
    console.log('Episode Studio clicked, onOpenGenerationSuite:', !!onOpenGenerationSuite, typeof onOpenGenerationSuite)
    if (onOpenGenerationSuite && typeof onOpenGenerationSuite === 'function') {
      console.log('Opening generation suite modal')
      onOpenGenerationSuite()
      return
    }
    console.log('Falling back to workspace page')
    router.push(`/workspace?id=${storyBibleId}`)
  }

  // Rearranged order: Story Bible, Episode Studio, Episode Guide
  const quickAccessCards = [
    { 
      icon: '📖', 
      title: 'Story Bible', 
      desc: 'view the overall details of the story',
      onClick: () => {
        if (!storyBibleId || storyBibleId.trim() === '') {
          console.error('Story Bible ID is missing, cannot navigate to story bible page')
          console.error('storyBibleId value:', storyBibleId)
          alert('Story Bible ID is missing. Please refresh the page or select a story bible from your profile.')
          return
        }
        console.log('Navigating to story bible page with ID:', storyBibleId)
        router.push(`/story-bible?id=${storyBibleId}`)
      }
    },
    { 
      icon: '⚡', 
      title: 'Episode Studio', 
      desc: getEpisodeStudioSubtitle(),
      onClick: handleEpisodeStudioClick,
      disabled: allEpisodesGenerated
    },
    { 
      icon: '🎞️', 
      title: 'Episode Guide', 
      desc: 'view the story so far',
      onClick: () => setShowEpisodesModal(true)
    }
  ]

  const productionTools = [
    { 
      icon: '🎬', 
      title: 'Pre-Production', 
      desc: 'View scripts, storyboards, breakdown, and more',
      selector: true,
      onClick: () => setShowEpisodeSelector(true)
    },
    { 
      icon: '📐', 
      title: 'Production Assistant', 
      desc: 'Key locations, props, budget, scheduling, and more',
      selector: true,
      onClick: () => setShowArcSelector(true)
    },
    { 
      icon: '🎭', 
      title: 'Actor Preparation Guide', 
      desc: 'everything you\'ll need to prepare for the shoot',
      selector: true,
      onClick: () => setShowActorMaterialsSelector(true)
    }
  ]

  return (
    <div className="space-y-6">
      {/* Story Builder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <h2 className={`text-xl font-semibold mb-4 ${prefix}-text-primary`}>Story Builder</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {quickAccessCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.15 + idx * 0.05 }}
              onClick={card.disabled ? undefined : card.onClick}
              className={`p-6 rounded-lg ${card.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${prefix}-card ${prefix}-border ${card.disabled ? '' : `hover:${prefix}-border-accent`} transition-all relative`}
            >
              <div className="text-4xl mb-3">{card.icon}</div>
              <div className={`text-lg font-semibold mb-1 ${prefix}-text-primary`}>{card.title}</div>
              <div className={`text-xs ${prefix}-text-secondary`}>{card.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Production */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className={`text-xl font-semibold mb-4 ${prefix}-text-primary`}>Production</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {productionTools.map((tool, idx) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
              onClick={tool.onClick}
              className={`p-6 rounded-lg cursor-pointer ${prefix}-card ${prefix}-border hover:${prefix}-border-accent transition-all relative`}
            >
              <div className="text-4xl mb-3">{tool.icon}</div>
              <div className={`text-lg font-semibold mb-1 ${prefix}-text-primary`}>{tool.title}</div>
              <div className={`text-xs ${prefix}-text-secondary`}>{tool.desc}</div>
              {tool.selector && (
                <div className={`absolute top-4 right-4 text-xs ${prefix}-text-tertiary`}>▼</div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Selector Modals */}
      <EpisodePreProductionSelector
        isOpen={showEpisodeSelector}
        onClose={() => setShowEpisodeSelector(false)}
        episodes={episodes}
        storyBibleId={storyBibleId}
        theme={theme}
      />
      
      <ArcPreProductionSelector
        isOpen={showArcSelector}
        onClose={() => setShowArcSelector(false)}
        storyBible={storyBible}
        storyBibleId={storyBibleId}
        episodes={episodes}
        theme={theme}
        onOpenGenerationSuite={onOpenGenerationSuite}
      />
      
      <ActorMaterialsSelector
        isOpen={showActorMaterialsSelector}
        onClose={() => setShowActorMaterialsSelector(false)}
        storyBible={storyBible}
        storyBibleId={storyBibleId}
        episodes={episodes}
        theme={theme}
        onOpenGenerationSuite={onOpenGenerationSuite}
      />
      
      <EpisodesModal
        isOpen={showEpisodesModal}
        onClose={() => setShowEpisodesModal(false)}
        episodes={episodes}
        storyBibleId={storyBibleId}
        theme={theme}
      />
      
    </div>
  )
}

