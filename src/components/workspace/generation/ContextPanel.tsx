'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

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
}

export default function ContextPanel({
  previousEpisode,
  previousEpisodeSummary,
  loadingSummary,
  storyBible,
  episodeNumber,
  arcInfo,
  theme
}: ContextPanelProps) {
  const prefix = theme === 'dark' ? 'dark' : 'light'
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    recap: true,
    characters: true,
    plotThreads: true,
    worldBuilding: false,
    themes: false,
    arcProgress: true,
    continuity: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Get characters for this episode
  const getEpisodeCharacters = () => {
    if (!storyBible?.narrativeArcs?.[arcInfo.arcIndex]?.episodes?.[arcInfo.episodeInArc - 1]) {
      return storyBible?.mainCharacters?.slice(0, 4) || []
    }
    
    const episode = storyBible.narrativeArcs[arcInfo.arcIndex].episodes[arcInfo.episodeInArc - 1]
    const characterNames = episode?.characters || []
    
    if (characterNames.length === 0) {
      return storyBible?.mainCharacters?.slice(0, 4) || []
    }
    
    return characterNames.map((name: string) => {
      const char = storyBible?.mainCharacters?.find((c: any) => 
        c.name?.toLowerCase() === name.toLowerCase()
      )
      return char || { name, description: '' }
    }).slice(0, 4)
  }

  // Get active plot threads
  const getPlotThreads = () => {
    const threads: string[] = []
    
    if (previousEpisode) {
      if (previousEpisode.branchingOptions) {
        threads.push('Branching narrative choices pending')
      }
      if (previousEpisode.scenes?.some((s: any) => s.content?.includes('?'))) {
        threads.push('Unresolved questions from previous episode')
      }
    }
    
    if (storyBible?.narrativeArcs?.[arcInfo.arcIndex]?.description) {
      threads.push(`Arc focus: ${storyBible.narrativeArcs[arcInfo.arcIndex].description.substring(0, 50)}...`)
    }
    
    return threads.length > 0 ? threads : ['No active plot threads identified']
  }

  // Get world-building quick ref
  const getWorldBuildingRef = () => {
    const refs: { category: string; items: string[] }[] = []
    
    if (storyBible?.locations && storyBible.locations.length > 0) {
      refs.push({
        category: 'Locations',
        items: storyBible.locations.slice(0, 3).map((loc: any) => loc.name || loc)
      })
    }
    
    if (storyBible?.worldBuilding) {
      const world = storyBible.worldBuilding
      if (world.rules || world.magicSystem || world.technology) {
        refs.push({
          category: 'World Rules',
          items: [
            world.rules ? 'Custom rules established' : '',
            world.magicSystem ? 'Magic system active' : '',
            world.technology ? 'Technology defined' : ''
          ].filter(Boolean)
        })
      }
    }
    
    return refs
  }

  // Get themes
  const getThemes = () => {
    const themes: string[] = []
    
    if (storyBible?.themes && storyBible.themes.length > 0) {
      themes.push(...storyBible.themes.slice(0, 3))
    } else if (storyBible?.premise) {
      themes.push('Series premise themes')
    }
    
    if (storyBible?.narrativeArcs?.[arcInfo.arcIndex]?.themes) {
      themes.push(...storyBible.narrativeArcs[arcInfo.arcIndex].themes.slice(0, 2))
    }
    
    return themes.length > 0 ? themes : ['Themes to be explored']
  }

  // Calculate arc progress
  const calculateArcProgress = () => {
    // This would ideally come from actual episode data
    // For now, estimate based on episode number
    const progress = (arcInfo.episodeInArc / arcInfo.totalInArc) * 100
    return Math.round(progress)
  }

  // Get continuity suggestions
  const getContinuitySuggestions = () => {
    const suggestions: string[] = []
    
    if (previousEpisode) {
      if (previousEpisode.scenes?.length > 0) {
        const lastScene = previousEpisode.scenes[previousEpisode.scenes.length - 1]
        if (lastScene.content) {
          suggestions.push('Consider callback to previous episode\'s final scene')
        }
      }
      
      if (previousEpisode.branchingOptions) {
        suggestions.push('Reference the choice made in previous episode')
      }
    }
    
    if (episodeNumber > 1) {
      suggestions.push('Maintain character voice consistency')
      suggestions.push('Continue established plot threads')
    }
    
    return suggestions.length > 0 ? suggestions : ['No specific continuity notes']
  }

  const episodeCharacters = getEpisodeCharacters()
  const plotThreads = getPlotThreads()
  const worldBuildingRef = getWorldBuildingRef()
  const themes = getThemes()
  const arcProgress = calculateArcProgress()
  const continuitySuggestions = getContinuitySuggestions()

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

      {/* Character Context - Green accent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-lg border-l-4 border-[#10B981] ${prefix}-card ${prefix}-border overflow-hidden`}
      >
        <button
          onClick={() => toggleSection('characters')}
          className={`w-full p-3 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 transition-colors`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
            <span className={`text-sm font-semibold ${prefix}-text-primary`}>Character Context</span>
          </div>
          <span className={`text-xs ${prefix}-text-tertiary`}>
            {expandedSections.characters ? '▼' : '▶'}
          </span>
        </button>
        {expandedSections.characters && (
          <div className={`p-3 ${prefix}-bg-primary space-y-3`}>
            {episodeCharacters.length > 0 ? (
              episodeCharacters.map((char: any, idx: number) => (
                <div key={idx} className={`p-2 rounded ${prefix}-bg-secondary`}>
                  <div className={`text-sm font-medium ${prefix}-text-primary mb-1`}>
                    {char.name}
                  </div>
                  {char.description && (
                    <div className={`text-xs ${prefix}-text-secondary line-clamp-2`}>
                      {char.description}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={`text-sm ${prefix}-text-secondary`}>No characters specified for this episode</div>
            )}
          </div>
        )}
      </motion.div>

      {/* Plot Threads - Gold/Yellow accent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-lg border-l-4 border-[#E2C376] ${prefix}-card ${prefix}-border overflow-hidden`}
      >
        <button
          onClick={() => toggleSection('plotThreads')}
          className={`w-full p-3 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 transition-colors`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#E2C376]"></div>
            <span className={`text-sm font-semibold ${prefix}-text-primary`}>Plot Threads</span>
          </div>
          <span className={`text-xs ${prefix}-text-tertiary`}>
            {expandedSections.plotThreads ? '▼' : '▶'}
          </span>
        </button>
        {expandedSections.plotThreads && (
          <div className={`p-3 ${prefix}-bg-primary space-y-2`}>
            {plotThreads.map((thread, idx) => (
              <div key={idx} className={`text-sm ${prefix}-text-secondary flex items-start gap-2`}>
                <span className="text-[#E2C376]">•</span>
                <span>{thread}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Arc Progress Tracker - Purple accent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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

      {/* Continuity Checker - Red/Orange accent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-lg border-l-4 border-orange-500 ${prefix}-card ${prefix}-border overflow-hidden`}
      >
        <button
          onClick={() => toggleSection('continuity')}
          className={`w-full p-3 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 transition-colors`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className={`text-sm font-semibold ${prefix}-text-primary`}>Continuity Checker</span>
          </div>
          <span className={`text-xs ${prefix}-text-tertiary`}>
            {expandedSections.continuity ? '▼' : '▶'}
          </span>
        </button>
        {expandedSections.continuity && (
          <div className={`p-3 ${prefix}-bg-primary space-y-2`}>
            {continuitySuggestions.map((suggestion, idx) => (
              <div key={idx} className={`text-sm ${prefix}-text-secondary flex items-start gap-2`}>
                <span className="text-orange-500">💡</span>
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* World-Building Quick Ref - Purple accent */}
      {worldBuildingRef.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`rounded-lg border-l-4 border-indigo-500 ${prefix}-card ${prefix}-border overflow-hidden`}
        >
          <button
            onClick={() => toggleSection('worldBuilding')}
            className={`w-full p-3 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 transition-colors`}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className={`text-sm font-semibold ${prefix}-text-primary`}>World-Building Ref</span>
            </div>
            <span className={`text-xs ${prefix}-text-tertiary`}>
              {expandedSections.worldBuilding ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.worldBuilding && (
            <div className={`p-3 ${prefix}-bg-primary space-y-3`}>
              {worldBuildingRef.map((ref, idx) => (
                <div key={idx}>
                  <div className={`text-xs font-semibold ${prefix}-text-primary mb-1`}>
                    {ref.category}
                  </div>
                  <div className="space-y-1">
                    {ref.items.map((item, itemIdx) => (
                      <div key={itemIdx} className={`text-xs ${prefix}-text-secondary`}>
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Themes & Tone - Red accent */}
      {themes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`rounded-lg border-l-4 border-red-500 ${prefix}-card ${prefix}-border overflow-hidden`}
        >
          <button
            onClick={() => toggleSection('themes')}
            className={`w-full p-3 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 transition-colors`}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className={`text-sm font-semibold ${prefix}-text-primary`}>Themes & Tone</span>
            </div>
            <span className={`text-xs ${prefix}-text-tertiary`}>
              {expandedSections.themes ? '▼' : '▶'}
            </span>
          </button>
          {expandedSections.themes && (
            <div className={`p-3 ${prefix}-bg-primary space-y-2`}>
              {themes.map((theme, idx) => (
                <div key={idx} className={`text-sm ${prefix}-text-secondary flex items-start gap-2`}>
                  <span className="text-red-500">🎭</span>
                  <span>{theme}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

