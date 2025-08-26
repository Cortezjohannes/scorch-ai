'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PageLayout } from '@/components/layout/PageLayout'
import { StoryOverviewDashboard } from '@/components/story-bible/StoryOverviewDashboard'
import { CharacterGalaxy } from '@/components/story-bible/CharacterGalaxy'
import { WorldExplorer } from '@/components/story-bible/WorldExplorer'

// Enhanced view mode types
type ViewMode = 'overview' | 'characters' | 'world' | 'arcs' | 'choices' | 'premise' | 'tension' | 'choice-arch' | 'living-world' | 'trope' | 'cohesion' | 'dialogue' | 'genre' | 'theme'

export default function StoryBiblePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [storyBible, setStoryBible] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<ViewMode>('overview')
  const [loading, setLoading] = useState(true)
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0)
  const [currentArcIndex, setCurrentArcIndex] = useState(0)
  const [showTechnicalTabs, setShowTechnicalTabs] = useState(false)
  const [showTechnicalModal, setShowTechnicalModal] = useState(false)
  
  // Helper function to safely get content with fallback to rawContent
  const getContentOrFallback = (obj: any, field: string) => {
    const value = obj?.[field] ?? obj?.rawContent
    if (!value) return 'Content not available'

    const tryParseJSON = (s: unknown) => {
      if (typeof s !== 'string') return null
      const t = s.trim()
      if (!(t.startsWith('{') || t.startsWith('['))) return null
      try { return JSON.parse(t) } catch { return null }
    }

    const stringifyItem = (item: any): string => {
      if (item == null) return ''
      if (typeof item === 'string') return item

      if (Array.isArray(item)) {
        const parts = item.map((it) => stringifyItem(it)).filter(Boolean)
        return parts.join(' • ')
      }

      if (typeof item === 'object') {
        // Special handling for genre tropes object
        if ('embrace' in item || 'subvert' in item || 'avoid' in item) {
          const fmt = (x: any) => Array.isArray(x) ? x.join(', ') : String(x ?? '')
          return `Embrace: ${fmt(item.embrace)} | Subvert: ${fmt(item.subvert)} | Avoid: ${fmt(item.avoid)}`
        }

        // Prefer common label/description fields if present
        const labelKeys = ['title', 'name', 'label', 'decisionID', 'id', 'character', 'choice', 'key', 'type', 'arc', 'role']
        const descKeys  = ['summary', 'description', 'text', 'details', 'value', 'impact']
        const labelKey = labelKeys.find(k => k in item)
        const descKey  = descKeys.find(k => k in item)

        if (labelKey || descKey) {
          const parts = []
          if (labelKey) parts.push(String(item[labelKey]))
          if (descKey) parts.push(String(item[descKey]))
          return parts.join(' — ')
        }

        // Flatten shallow key: value pairs where values are strings/arrays
        const pairs = Object.entries(item).map(([k, v]) => {
          if (typeof v === 'string') return `${k}: ${v}`
          if (Array.isArray(v)) {
            const s = v.map((it) => stringifyItem(it)).filter(Boolean).join(', ')
            return s ? `${k}: ${s}` : ''
          }
          return ''
        }).filter(Boolean)

        if (pairs.length) return pairs.join(' • ')

        // Fallback to compact JSON
        return JSON.stringify(item)
      }

      return String(item)
    }

    // If we got a JSON-like string, parse then format
    const parsed = tryParseJSON(value)
    return stringifyItem(parsed ?? value)
  }
  
  useEffect(() => {
    const loadStoryBible = () => {
      try {
        // Updated to look for Scorched AI localStorage key
        const savedBible = localStorage.getItem('scorched-story-bible') || localStorage.getItem('reeled-story-bible')
        const savedEpisodes = localStorage.getItem('reeled-episodes')
        
        console.log('🔍 Loading story bible from localStorage:')
        console.log('- Raw localStorage data:', savedBible)
        console.log('- Data exists:', savedBible ? 'YES' : 'NO')
        console.log('- Data length:', savedBible ? savedBible.length : 0)
        
        if (savedBible) {
          try {
            const parsed = JSON.parse(savedBible)
            console.log('📖 Parsed story bible data structure:', {
              hasStoryBible: !!parsed.storyBible,
              hasSynopsis: !!parsed.synopsis,
              hasTheme: !!parsed.theme,
              keys: Object.keys(parsed)
            });
            
            // Validate that we have the required story bible data
            if (!parsed.storyBible) {
              console.error('❌ Missing storyBible property in saved data:', parsed)
              throw new Error('Invalid story bible data structure')
            }
            
            let dynamicStoryBible = { ...parsed.storyBible }
            
            // Apply user choices to update the story bible dynamically
            if (savedEpisodes) {
              try {
                const episodes = JSON.parse(savedEpisodes)
                dynamicStoryBible = applyUserChoicesToStoryBible(dynamicStoryBible, episodes)
                console.log('✨ Applied user choices to story bible')
              } catch (episodeError) {
                console.warn('⚠️ Failed to parse episodes, using base story bible:', episodeError)
              }
            }
            
            console.log('✅ Setting story bible state with keys:', Object.keys(dynamicStoryBible));
            setStoryBible(dynamicStoryBible)
          } catch (parseError) {
            console.error('💥 Failed to parse story bible JSON:', parseError)
            console.error('💥 Raw data that failed to parse:', savedBible.substring(0, 200) + '...')
            
            // Try to recover by clearing corrupted data and redirecting
            localStorage.removeItem('reeled-story-bible')
            alert('Story bible data was corrupted and has been cleared. Please generate a new story bible.')
            router.push('/')
          }
        } else {
          console.log('❌ No saved bible found in localStorage')
          console.log('📍 Current URL:', window.location.href)
          console.log('📍 Available localStorage keys:', Object.keys(localStorage))
          
          // Give user a chance to go back instead of auto-redirecting
          const shouldRedirect = confirm('No story bible found. Would you like to go back to create one?')
          if (shouldRedirect) {
            router.push('/')
          }
        }
      } catch (error) {
        console.error('💥 Unexpected error loading story bible:', error)
        console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    // Add a small delay to ensure localStorage is fully available
    const timeoutId = setTimeout(loadStoryBible, 100)
    return () => clearTimeout(timeoutId)
  }, [router])

    // Function to apply user choices to dynamically update the story bible
  const applyUserChoicesToStoryBible = (originalBible: any, episodes: any[]) => {
    if (!episodes || episodes.length === 0) return originalBible
    
    const updatedBible = { ...originalBible }
    
    // Track fan choices and their impacts
    const fanChoices: any[] = []
    const newCharacters: any[] = []
    const newLocations: any[] = []
    const storyEvolution: any[] = []
    const characterDevelopments: any[] = []
    const plotThreads: any[] = []
    
    episodes.forEach((episode, index) => {
      // Track user choices
      if (episode.chosenPath) {
        fanChoices.push({
          episode: episode.episodeNumber,
          choice: episode.chosenPath,
          impact: `This choice shaped the direction of Episode ${episode.episodeNumber + 1}`
        })
      }
      
      // Track new characters introduced
      if (episode.newCharacters && episode.newCharacters.length > 0) {
        episode.newCharacters.forEach((char: string) => {
          if (!newCharacters.find(c => c.name === char)) {
            newCharacters.push({
              name: char,
              introducedInEpisode: episode.episodeNumber,
              description: "Character introduced through fan choices and story evolution",
              archetype: "Supporting Character",
              arc: `Introduced through user choice in Episode ${episode.episodeNumber}`
            })
          }
        })
      }
      
      // Track new locations introduced
      if (episode.newLocations && episode.newLocations.length > 0) {
        episode.newLocations.forEach((loc: string) => {
          if (!newLocations.find(l => l.name === loc)) {
            newLocations.push({
              name: loc,
              introducedInEpisode: episode.episodeNumber,
              description: "Location introduced through story progression"
            })
          }
        })
      }
      
      // Track story evolution through callbacks and foreshadowing
      if (episode.callbacks && episode.callbacks.length > 0) {
        storyEvolution.push({
          episode: episode.episodeNumber,
          type: 'callback',
          elements: episode.callbacks
        })
      }
      
      if (episode.foreshadowing && episode.foreshadowing.length > 0) {
        storyEvolution.push({
          episode: episode.episodeNumber,
          type: 'foreshadowing',
          elements: episode.foreshadowing
        })
      }

      // Track character developments from episode content
      if (episode.scenes && episode.scenes.length > 0) {
        episode.scenes.forEach((scene: any) => {
          // Extract character interactions and dialogue patterns
          if (scene.content) {
            // Look for character interactions in scene content
            const characterMentions = (updatedBible.mainCharacters || []).map((char: any) => char.name)
            characterMentions.forEach((charName: string) => {
              if (scene.content.toLowerCase().includes(charName.toLowerCase())) {
                characterDevelopments.push({
                  episode: episode.episodeNumber,
                  character: charName,
                  development: `Featured in Episode ${episode.episodeNumber}`,
                  sceneContext: scene.content.substring(0, 200) + "..."
                })
              }
            })
          }
          
          // Track explicit character development if present
          if (scene.characterDevelopment) {
            characterDevelopments.push({
              episode: episode.episodeNumber,
              character: scene.characterDevelopment.character,
              development: scene.characterDevelopment.development,
              sceneContext: scene.content?.substring(0, 200) || ""
            })
          }
        })
      }

      // Track plot threads and story arcs that emerge from choices
      if (episode.plotThreads && episode.plotThreads.length > 0) {
        plotThreads.push({
          episode: episode.episodeNumber,
          threads: episode.plotThreads
        })
      }

      // Track dialogue patterns and character voice consistency
      if (episode.scenes) {
        episode.scenes.forEach((scene: any) => {
          if (scene.dialogue && scene.dialogue.length > 0) {
            scene.dialogue.forEach((line: any) => {
              // Track character-specific dialogue for voice consistency
              const existingCharacterVoice = updatedBible.characterVoices?.find((cv: any) => cv.character === line.character)
              if (!existingCharacterVoice && updatedBible.characterVoices) {
                updatedBible.characterVoices.push({
                  character: line.character,
                  firstAppearance: episode.episodeNumber,
                  sampleDialogue: [line.line],
                  voiceNotes: line.direction || "Standard delivery"
                })
              } else if (existingCharacterVoice) {
                existingCharacterVoice.sampleDialogue.push(line.line)
              }
            })
          }
        })
      }
    })
    
    // Apply dynamic adaptations to the story bible
    updatedBible.fanChoices = fanChoices
    updatedBible.newCharacters = newCharacters
    updatedBible.newLocations = newLocations
    updatedBible.storyEvolution = storyEvolution
    updatedBible.characterDevelopments = characterDevelopments
    updatedBible.plotThreads = plotThreads
    updatedBible.episodesGenerated = episodes.length
    updatedBible.lastUpdated = new Date().toISOString()
    
    // Initialize character voices tracking
    if (!updatedBible.characterVoices) {
      updatedBible.characterVoices = []
    }
    
    // Update main characters list with new characters and development tracking
    if (newCharacters.length > 0) {
      updatedBible.mainCharacters = [
        ...(updatedBible.mainCharacters || []),
        ...newCharacters.map(char => ({
          name: char.name,
          archetype: char.archetype,
          arc: char.arc,
          description: `Introduced in Episode ${char.introducedInEpisode} through story evolution`,
          introducedThrough: 'user_choice'
        }))
      ]
    }

    // Update existing character arcs with developments from episodes
    if (characterDevelopments.length > 0 && updatedBible.mainCharacters) {
      updatedBible.mainCharacters = updatedBible.mainCharacters.map((char: any) => {
        const developments = characterDevelopments.filter(dev => 
          dev.character.toLowerCase().includes(char.name.toLowerCase()) ||
          char.name.toLowerCase().includes(dev.character.toLowerCase())
        )
        
        if (developments.length > 0) {
          const latestDevelopment = developments[developments.length - 1]
          return {
            ...char,
            arc: `${char.arc} | Recent development: ${latestDevelopment.development}`,
            lastUpdatedEpisode: latestDevelopment.episode
          }
        }
        return char
      })
    }
    
    // Update world building with new locations
    if (newLocations.length > 0) {
      if (!updatedBible.worldBuilding) {
        updatedBible.worldBuilding = { locations: [] }
      }
      if (!updatedBible.worldBuilding.locations) {
        updatedBible.worldBuilding.locations = []
      }
      
      updatedBible.worldBuilding.locations = [
        ...updatedBible.worldBuilding.locations,
        ...newLocations
      ]
    }

    // Update narrative arcs with actual episode content and choice consequences  
    if (updatedBible.narrativeArcs && episodes.length > 0) {
      updatedBible.narrativeArcs = updatedBible.narrativeArcs.map((arc: any, arcIndex: number) => {
        const arcStartEpisode = arcIndex * 10 + 1
        const arcEndEpisode = arcIndex * 10 + 10
        const arcEpisodes = episodes.filter(ep => 
          ep.episodeNumber >= arcStartEpisode && ep.episodeNumber <= arcEndEpisode
        )

        if (arcEpisodes.length > 0) {
          // Update arc summary based on actual episode content
          const choiceConsequences = arcEpisodes
            .filter(ep => ep.chosenPath)
            .map(ep => `Episode ${ep.episodeNumber}: ${ep.chosenPath}`)
            .join('; ')

          const enhancedSummary = arc.summary + 
            (choiceConsequences ? ` | Shaped by choices: ${choiceConsequences}` : '')

          // Update episodes with actual generated content
          const updatedEpisodes = arc.episodes ? arc.episodes.map((episodeInfo: any) => {
            const actualEpisode = arcEpisodes.find(ep => ep.episodeNumber === (arcIndex * 10 + episodeInfo.number))
            if (actualEpisode) {
              return {
                ...episodeInfo,
                title: actualEpisode.episodeTitle || episodeInfo.title,
                summary: actualEpisode.synopsis || episodeInfo.summary,
                actuallyGenerated: true,
                chosenPath: actualEpisode.chosenPath || null
              }
            }
            return episodeInfo
          }) : []

          return {
            ...arc,
            summary: enhancedSummary,
            episodes: updatedEpisodes,
            lastUpdated: new Date().toISOString(),
            episodesGenerated: arcEpisodes.length
          }
        }
        return arc
      })
    }

    // Add dynamic story adaptations section
    updatedBible.dynamicAdaptations = {
      totalEpisodesGenerated: episodes.length,
      totalChoicesMade: fanChoices.length,
      newElementsAdded: newCharacters.length + newLocations.length,
      lastEpisodeGenerated: episodes.length > 0 ? episodes[episodes.length - 1].episodeNumber : 0,
      adaptationLevel: episodes.length > 0 ? 'Active' : 'Static'
    }
    
    return updatedBible
  }

    const handleBeginEpisode = () => {
    const synopsis = searchParams.get('synopsis') || ''
    const theme = searchParams.get('theme') || ''
    router.push(`/episode/1?synopsis=${encodeURIComponent(synopsis)}&theme=${encodeURIComponent(theme)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-20 h-20 border-4 border-t-[#e2c376] border-r-[#e2c37650] border-b-[#e2c37630] border-l-[#e2c37620] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[#e7e7e7]/70 mt-4">Loading your Story Bible...</p>
        </motion.div>
      </div>
    )
  }

  if (!storyBible) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl text-[#e7e7e7]">Story Bible not found</h2>
        <p className="text-[#e7e7e7]/70 mt-2">Your story bible could not be loaded.</p>
        <button 
          className="mt-6 px-4 py-2 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors"
          onClick={() => router.push('/')}
        >
          Return to Start
        </button>
      </div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen p-4 sm:p-6 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ fontFamily: 'League Spartan, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Revolutionary Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Fire Icon */}
          <motion.div
            className="w-20 h-20 ember-shadow rounded-xl flex items-center justify-center mx-auto mb-6 animate-emberFloat"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-6xl">🔥</span>
          </motion.div>
          
          {/* Series Title */}
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 elegant-fire fire-gradient animate-flameFlicker"
            initial={{ letterSpacing: "-0.1em", opacity: 0 }}
            animate={{ letterSpacing: "0.02em", opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            {storyBible.seriesTitle || "YOUR SCORCHED EMPIRE"}
          </motion.h1>
          
          {/* Revolutionary Subtitle */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="space-y-4"
          >
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed elegant-fire">
              Your revolutionary story bible forged by 
              <span className="text-[#e2c376] font-bold"> 14 AI Rebellion Engines</span>
            </p>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <div className="px-4 py-2 bg-gradient-to-r from-[#D62828]/20 to-[#FF6B00]/20 border border-[#e2c376]/30 rounded-xl">
                <span className="text-[#e2c376] font-bold text-sm elegant-fire">⚡ PREMISE ENGINE</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-[#D62828]/20 to-[#FF6B00]/20 border border-[#e2c376]/30 rounded-xl">
                <span className="text-[#e2c376] font-bold text-sm elegant-fire">👥 CHARACTER FORGE</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-[#D62828]/20 to-[#FF6B00]/20 border border-[#e2c376]/30 rounded-xl">
                <span className="text-[#e2c376] font-bold text-sm elegant-fire">🌍 WORLD INCINERATOR</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Revolutionary Navigation */}
        <motion.div 
          className="flex flex-col items-center mb-12 space-y-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {/* Main Rebellious Tabs */}
          <motion.div 
            className="rebellious-card p-2 flex flex-wrap justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {(['premise', 'overview', 'characters', 'arcs', 'world', 'choices'] as const).map((tab, index) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-button ${activeTab === tab ? 'tab-button-active' : ''}`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
              >
                <span className="relative z-10">
                  {tab === 'premise' ? '🎯 Premise' : 
                   tab === 'overview' ? '📖 Overview' :
                   tab === 'characters' ? '👥 Characters' :
                   tab === 'arcs' ? '📚 Story Arcs' :
                   tab === 'world' ? '🌍 World' :
                   tab === 'choices' ? '⚡ Your Choices' : 
                   (tab as string).charAt(0).toUpperCase() + (tab as string).slice(1)}
                </span>
                
                {activeTab === tab && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#D62828]/20 via-[#FF6B00]/20 to-[#e2c376]/20 rounded-xl"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Revolutionary Advanced Analysis */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            <motion.button
              onClick={() => setShowTechnicalModal(true)}
              className="burn-button py-3 px-6 text-sm font-bold"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 elegant-fire">⚙️ ADVANCED REBELLION ANALYSIS</span>
            </motion.button>
            {showTechnicalTabs && (
              <motion.span 
                className="text-[#e2c376] text-sm font-bold elegant-fire flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="animate-pulse">🔥</span>
                Advanced engines active
              </motion.span>
            )}
          </motion.div>
        </motion.div>

          {/* Technical Tabs (when enabled) */}
          {showTechnicalTabs && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1e1e1e]/60 border border-[#e2c376]/30 rounded-lg p-1 flex flex-wrap"
            >
              {(['tension', 'choice-arch', 'living-world', 'trope', 'cohesion', 'dialogue', 'genre', 'theme'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md transition-all text-sm ${
                    activeTab === tab 
                      ? 'bg-[#e2c376]/80 text-black font-medium' 
                      : 'text-[#e2c376]/80 hover:text-[#e2c376] hover:bg-[#2a2a2a]'
                  }`}
                >
                  {tab === 'tension' ? '⚡ Tension' :
                   tab === 'choice-arch' ? '🎯 Choice' :
                   tab === 'living-world' ? '🌍 Living World' :
                   tab === 'trope' ? '📖 Trope' :
                   tab === 'cohesion' ? '🔗 Cohesion' :
                   tab === 'dialogue' ? '🗣️ Dialogue' :
                   tab === 'genre' ? '🎭 Genre' :
                   tab === 'theme' ? '🎯 Theme' : tab}
                </button>
              ))}
            </motion.div>
          )}

        {/* Technical Tabs Modal */}
        <AnimatePresence>
          {showTechnicalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowTechnicalModal(false)
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 max-w-lg w-full"
              >
                <h3 className="text-2xl font-bold text-[#e2c376] mb-4">
                  ⚙️ Advanced Analysis
                </h3>
                <p className="text-[#e7e7e7]/90 mb-6 leading-relaxed">
                  Would you like to see the technical analysis tabs? These contain detailed AI analysis including 
                  tension escalation, choice architecture, trope analysis, and narrative cohesion that power 
                  your story generation behind the scenes.
                </p>
                <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-[#e2c376] mb-2">Technical Tabs Include:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-[#e2c376]">⚡</span>
                      <span>Tension Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#e2c376]">🎯</span>
                      <span>Choice Architecture</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#e2c376]">🌍</span>
                      <span>Living World</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#e2c376]">📖</span>
                      <span>Trope Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#e2c376]">🔗</span>
                      <span>Cohesion Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#e2c376]">🗣️</span>
                      <span>Dialogue Strategy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#e2c376]">🎭</span>
                      <span>Genre Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#e2c376]">🎯</span>
                      <span>Theme Integration</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowTechnicalModal(false)}
                    className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={() => {
                      setShowTechnicalTabs(true)
                      setShowTechnicalModal(false)
                    }}
                    className="px-6 py-2 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors"
                  >
                    Show Technical Tabs
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 shadow-lg mb-8"
          >
            {/* Premise Tab Content - NEW */}
            {activeTab === 'premise' && storyBible.premise && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-[#1a1a1a] border border-[#e2c376] rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-[#e2c376] mb-4 flex items-center">
                    🎯 Story Premise - The Foundation
                  </h3>
                  
                  <div className="bg-[#2a2a2a] rounded-lg p-6 border-l-4 border-[#e2c376] mb-6">
                    <h4 className="text-xl font-bold text-white mb-2">
                      "{storyBible.premise.premiseStatement}"
                    </h4>
                    <p className="text-[#e7e7e7]/70">
                      <strong>Egri's Equation:</strong> {storyBible.premise.character} + {storyBible.premise.conflict} → {storyBible.premise.resolution}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-[#e2c376]">Core Elements</h4>
                      <div className="space-y-3">
                        <div className="bg-[#2a2a2a] rounded-lg p-4">
                          <p className="text-sm text-[#e7e7e7]/70">Theme</p>
                          <p className="font-bold text-white">{storyBible.premise.theme}</p>
                        </div>
                        <div className="bg-[#2a2a2a] rounded-lg p-4">
                          <p className="text-sm text-[#e7e7e7]/70">Premise Type</p>
                          <p className="font-bold text-white">{storyBible.premise.premiseType}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-[#e2c376]">Story Function</h4>
                      <p className="text-[#e7e7e7]/90 text-sm leading-relaxed">
                        Every character, scene, and user choice in this story serves to prove this central premise. 
                        This ensures narrative coherence and emotional satisfaction by building toward a logical conclusion.
                      </p>
                      
                      {storyBible.premiseValidation && (
                        <div className={`rounded-lg p-4 ${
                          storyBible.premiseValidation.strength === 'strong' ? 'bg-green-900/20 border border-green-500/30' :
                          storyBible.premiseValidation.strength === 'moderate' ? 'bg-yellow-900/20 border border-yellow-500/30' :
                          'bg-red-900/20 border border-red-500/30'
                        }`}>
                          <p className="text-sm font-bold">
                            Premise Strength: {storyBible.premiseValidation.strength.toUpperCase()}
                          </p>
                          {storyBible.premiseValidation.issues.length > 0 && (
                            <p className="text-xs mt-1 opacity-70">
                              {storyBible.premiseValidation.issues.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Revolutionary Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div 
                className="space-y-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="rebellious-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <h2 className="text-3xl font-black text-center mb-6 elegant-fire fire-gradient">
                    🔥 YOUR REVOLUTIONARY SERIES
                  </h2>
                  <p className="text-xl text-white/90 leading-relaxed text-center elegant-fire">
                    {storyBible.seriesOverview || "A compelling rebellion spanning multiple episodes, forged to challenge the status quo and ignite audiences worldwide."}
                  </p>
                </motion.div>
                
                {storyBible.potentialBranchingPaths && (
                  <motion.div 
                    className="rebellious-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <h3 className="text-xl font-semibold text-[#e2c376] mb-3 elegant-fire">⚡ Branching Paths</h3>
                    <p className="text-white/90 elegant-fire">{storyBible.potentialBranchingPaths}</p>
                  </motion.div>
                )}
                
                {/* Revolutionary Stats Grid */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  {[
                    { value: storyBible.mainCharacters?.length || 0, label: "Rebel Characters", icon: "👥" },
                    { value: storyBible.narrativeArcs?.length || 0, label: "Story Arcs", icon: "📚" },
                    { value: storyBible.episodesGenerated || 0, label: "Episodes Forged", icon: "🔥" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="rebellious-card text-center p-6"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="text-5xl mb-3 animate-emberFloat">
                        {stat.icon}
                    </div>
                      <div className="text-4xl font-black text-[#e2c376] mb-2 elegant-fire">
                        {stat.value}
                  </div>
                      <div className="text-white/70 font-bold elegant-fire">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Characters Tab - Enhanced for 3D Characters */}
            {activeTab === 'characters' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-[#e2c376] flex items-center">
                    👥 Character Profiles
                    {storyBible.characters3D && (
                      <span className="ml-3 text-sm bg-[#e2c376] text-black px-2 py-1 rounded-lg">
                        3D Psychology
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentCharacterIndex(Math.max(0, currentCharacterIndex - 1))}
                      className="p-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] disabled:opacity-50"
                      disabled={currentCharacterIndex === 0}
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setCurrentCharacterIndex(Math.min(storyBible.mainCharacters.length - 1, currentCharacterIndex + 1))}
                      className="p-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] disabled:opacity-50"
                      disabled={currentCharacterIndex === storyBible.mainCharacters.length - 1}
                    >
                      →
                    </button>
                  </div>
                </div>

                {storyBible.mainCharacters && storyBible.mainCharacters.length > 0 && (
                  <div className="grid gap-6">
                    {/* Character Navigation */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {storyBible.mainCharacters.map((character: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentCharacterIndex(index)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentCharacterIndex === index
                              ? 'bg-[#e2c376] text-black font-bold'
                              : 'bg-[#2a2a2a] text-[#e7e7e7] hover:bg-[#36393f]'
                          }`}
                        >
                          {character.name}
                          {character.premiseRole && (
                            <span className="ml-2 text-xs opacity-70">
                              ({character.premiseRole})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {/* Character Detail View */}
                    {(() => {
                      const character = storyBible.mainCharacters[currentCharacterIndex];
                      const is3D = character.physiology && character.sociology && character.psychology;
                      
                      return (
                      <motion.div
                        key={currentCharacterIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-[#2a2a2a] rounded-xl p-6"
                        >
                          {/* Character Header */}
                          <div className="mb-6">
                            <h4 className="text-2xl font-bold text-white mb-2">{character.name}</h4>
                            {character.premiseFunction ? (
                              <p className="text-[#e2c376] font-medium">{character.premiseFunction}</p>
                            ) : (
                              <p className="text-[#e7e7e7]/70">{character.archetype || 'Character'}</p>
                            )}
                              </div>

                          {is3D ? (
                            /* 3D Character Display */
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Physiology */}
                              <div className="bg-[#1a1a1a] rounded-lg p-4">
                                <h5 className="text-[#e2c376] font-bold mb-3 flex items-center">
                                  🏃 Physiology
                                </h5>
                                <div className="space-y-2 text-sm">
                                  <p><strong>Age:</strong> {character.physiology.age}</p>
                                  <p><strong>Gender:</strong> {character.physiology.gender}</p>
                                  <p><strong>Appearance:</strong> {character.physiology.appearance}</p>
                                  <p><strong>Build:</strong> {character.physiology.build}</p>
                                  <p><strong>Health:</strong> {character.physiology.health}</p>
                                  {character.physiology.physicalTraits?.length > 0 && (
                                    <p><strong>Traits:</strong> {character.physiology.physicalTraits.join(', ')}</p>
                                  )}
                            </div>
                          </div>

                              {/* Sociology */}
                              <div className="bg-[#1a1a1a] rounded-lg p-4">
                                <h5 className="text-[#e2c376] font-bold mb-3 flex items-center">
                                  🏛️ Sociology
                                </h5>
                                <div className="space-y-2 text-sm">
                                  <p><strong>Class:</strong> {character.sociology.class}</p>
                                  <p><strong>Occupation:</strong> {character.sociology.occupation}</p>
                                  <p><strong>Education:</strong> {character.sociology.education}</p>
                                  <p><strong>Home Life:</strong> {character.sociology.homeLife}</p>
                                  <p><strong>Economic Status:</strong> {character.sociology.economicStatus}</p>
                                  <p><strong>Community Standing:</strong> {character.sociology.communityStanding}</p>
                                </div>
                            </div>
                            
                              {/* Psychology */}
                              <div className="bg-[#1a1a1a] rounded-lg p-4 md:col-span-2 lg:col-span-1">
                                <h5 className="text-[#e2c376] font-bold mb-3 flex items-center">
                                  🧠 Psychology
                                </h5>
                                <div className="space-y-3 text-sm">
                                  <div className="bg-[#2a2a2a] rounded-lg p-3 border-l-4 border-green-400">
                                    <p><strong>Core Value:</strong> {character.psychology.coreValue}</p>
                                    <p><strong>Moral Standpoint:</strong> {character.psychology.moralStandpoint}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 gap-2">
                                    <div className="bg-[#2a2a2a] rounded-lg p-3 border-l-4 border-blue-400">
                                      <p className="text-blue-400 font-bold text-xs mb-1">WANT (External Goal)</p>
                                      <p>{character.psychology.want}</p>
                                    </div>
                                    <div className="bg-[#2a2a2a] rounded-lg p-3 border-l-4 border-purple-400">
                                      <p className="text-purple-400 font-bold text-xs mb-1">NEED (Internal Lesson)</p>
                                      <p>{character.psychology.need}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-[#2a2a2a] rounded-lg p-3 border-l-4 border-red-400">
                                    <p className="text-red-400 font-bold text-xs mb-1">PRIMARY FLAW</p>
                                    <p>{character.psychology.primaryFlaw}</p>
                                    <p className="text-xs mt-1 text-[#e7e7e7]/60">*Creates obstacles until growth occurs</p>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <p><strong>Temperament:</strong> {character.psychology.temperament?.join(', ') || 'Not specified'}</p>
                                    <p><strong>Attitude:</strong> {character.psychology.attitude}</p>
                                    <p><strong>IQ:</strong> {character.psychology.iq}</p>
                                    <p><strong>Top Fear:</strong> {character.psychology.fears?.[0] || 'Unknown'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Legacy Character Display */
                            <div className="space-y-4">
                              <div className="bg-[#1a1a1a] rounded-lg p-4">
                                <h5 className="text-[#e2c376] font-bold mb-2">Character Overview</h5>
                                <p className="text-[#e7e7e7]/90 mb-3">{character.description}</p>
                                <p className="text-sm"><strong>Archetype:</strong> {character.archetype}</p>
                                {character.arc && (
                                  <p className="text-sm"><strong>Character Arc:</strong> {character.arc}</p>
                                )}
                              </div>
                              </div>
                            )}
                            
                          {/* Speech Pattern (if available) */}
                          {character.speechPattern && (
                            <div className="mt-6 bg-[#1a1a1a] rounded-lg p-4">
                              <h5 className="text-[#e2c376] font-bold mb-3 flex items-center">
                                🗣️ Speech Pattern
                              </h5>
                              <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <p><strong>Vocabulary:</strong> {character.speechPattern.vocabulary}</p>
                                <p><strong>Rhythm:</strong> {character.speechPattern.rhythm}</p>
                                <p><strong>Voice Notes:</strong> {character.speechPattern.voiceNotes}</p>
                            </div>
                          </div>
                          )}

                          {/* Living Narrative Info */}
                          {character.arcIntroduction && (
                            <div className="mt-6 bg-[#1a1a1a] rounded-lg p-4">
                              <h5 className="text-[#e2c376] font-bold mb-3 flex items-center">
                                📖 Living Narrative
                              </h5>
                              <div className="text-sm space-y-1">
                                <p><strong>Introduces:</strong> Arc {character.arcIntroduction}</p>
                                {character.arcDeparture && (
                                  <p><strong>Departs:</strong> Arc {character.arcDeparture} ({character.departureReason})</p>
                                )}
                                <p className="text-[#e7e7e7]/70 mt-2">
                                  This character's role evolves based on story needs and user choices.
                                </p>
                        </div>
                            </div>
                          )}
                      </motion.div>
                      );
                    })()}
                  </div>
                )}

                {/* Character Relationships (if available) */}
                {storyBible.characterRelationships && storyBible.characterRelationships.length > 0 && (
                  <div className="mt-8 bg-[#1a1a1a] rounded-xl p-6">
                    <h4 className="text-[#e2c376] font-bold mb-4">🔗 Character Relationships</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {storyBible.characterRelationships.map((rel: any, index: number) => (
                        <div key={index} className="bg-[#2a2a2a] rounded-lg p-4">
                          <h5 className="font-bold text-white mb-2">
                            {rel.character1} & {rel.character2}
                          </h5>
                          <p className="text-sm text-[#e7e7e7]/90 mb-2">
                            <strong>Type:</strong> {rel.relationshipType}
                          </p>
                          <p className="text-sm text-[#e7e7e7]/90 mb-2">
                            <strong>Dynamic:</strong> {rel.dynamic}
                          </p>
                          <p className="text-xs text-[#e2c376]">
                            <strong>Premise Relevance:</strong> {rel.premiseRelevance}
                          </p>
                  </div>
                      ))}
                  </div>
              </div>
                )}
              </motion.div>
            )}

            {/* Arcs Tab */}
            {activeTab === 'arcs' && (
              <div>
                <h2 className="text-2xl font-bold text-[#e2c376] mb-6">Narrative Arcs</h2>
                
                {storyBible.narrativeArcs && storyBible.narrativeArcs.length > 0 ? (
                  <div className="space-y-8">
                    {/* Arc Navigation */}
                    <div className="flex flex-wrap gap-2">
                      {storyBible.narrativeArcs.map((arc: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentArcIndex(index)}
                          className={`px-3 py-1.5 rounded-full transition-all ${
                            currentArcIndex === index
                              ? 'bg-[#e2c376] text-black font-medium'
                              : 'bg-[#2a2a2a] text-[#e7e7e7]/80 hover:bg-[#36393f]'
                          }`}
                        >
                          Arc {index + 1}: {arc.title}
                        </button>
                      ))}
                    </div>
                    
                    {/* Current Arc */}
                    {storyBible.narrativeArcs[currentArcIndex] && (
                      <motion.div
                        key={currentArcIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-6">
                          <h3 className="text-2xl font-bold text-[#e2c376] mb-4">
                            {storyBible.narrativeArcs[currentArcIndex].title}
                          </h3>
                          <p className="text-[#e7e7e7]/90 mb-6">
                            {storyBible.narrativeArcs[currentArcIndex].summary}
                          </p>
                          
                          {/* Episodes in this arc */}
                          {storyBible.narrativeArcs[currentArcIndex].episodes && 
                           storyBible.narrativeArcs[currentArcIndex].episodes.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold text-[#e2c376] mb-4">Episodes</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {storyBible.narrativeArcs[currentArcIndex].episodes.map((episode: any, episodeIndex: number) => (
                                  <div 
                                    key={episodeIndex}
                                    className="bg-[#1e1e1e] border border-[#36393f] rounded-lg p-4 hover:border-[#e2c37640] transition-colors"
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <h5 className="font-medium text-[#e2c376]">Episode {episode.number}</h5>
                                      <span className="text-xs text-[#e7e7e7]/50">{`${currentArcIndex * 10 + episodeIndex + 1}/60`}</span>
                                    </div>
                                    <h6 className="font-medium mb-2">{episode.title}</h6>
                                    <p className="text-sm text-[#e7e7e7]/70">{episode.summary}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#e7e7e7]/50">
                    No narrative arc information available
                  </div>
                )}
              </div>
            )}

            {/* World Building Tab */}
            {activeTab === 'world' && (
              <div>
                <h2 className="text-2xl font-bold text-[#e2c376] mb-6">World Building</h2>
                
                {storyBible.worldBuilding ? (
                  <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-semibold text-[#e2c376] mb-3">Setting</h3>
                        <p className="text-[#e7e7e7]/90 bg-[#2a2a2a] p-4 rounded-lg border border-[#36393f]">
                        {getContentOrFallback(storyBible.worldBuilding, 'setting')}
                        </p>
                      </div>
                    
                      <div>
                        <h3 className="text-xl font-semibold text-[#e2c376] mb-3">Rules of the World</h3>
                        {Array.isArray(storyBible.worldBuilding.rules) ? (
                          <ul className="list-disc pl-6 text-[#e7e7e7]/90 bg-[#2a2a2a] p-4 rounded-lg border border-[#36393f] space-y-1">
                            {storyBible.worldBuilding.rules.map((r: string, i: number) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[#e7e7e7]/90 bg-[#2a2a2a] p-4 rounded-lg border border-[#36393f]">
                            {getContentOrFallback(storyBible.worldBuilding, 'rules')}
                          </p>
                        )}
                      </div>
                    
                    {storyBible.worldBuilding.locations && storyBible.worldBuilding.locations.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-[#e2c376] mb-3">Key Locations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {storyBible.worldBuilding.locations.map((location: any, index: number) => (
                            <div 
                              key={index}
                              className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-[#e2c376]">{location.name}</h4>
                                {location.type && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-[#1a1a1a] border border-[#36393f] text-[#e7e7e7]/70">
                                    {location.type}
                                  </span>
                                )}
                              </div>
                              {location.significance && (
                                <p className="text-xs text-[#e7e7e7]/60">{location.significance}</p>
                              )}
                              {location.description && (
                                <p className="text-sm text-[#e7e7e7]/80">{location.description}</p>
                              )}
                              {Array.isArray(location.recurringEvents) && location.recurringEvents.length > 0 && (
                                <div className="text-xs text-[#e7e7e7]/70">
                                  <span className="font-semibold text-[#e2c376]">Recurring Events:</span>
                                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                                    {location.recurringEvents.map((e: string, i: number) => <li key={i}>{e}</li>)}
                                  </ul>
                                </div>
                              )}
                              {Array.isArray(location.conflicts) && location.conflicts.length > 0 && (
                                <div className="text-xs text-[#e7e7e7]/70">
                                  <span className="font-semibold text-[#e2c376]">Conflicts:</span>
                                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                                    {location.conflicts.map((c: string, i: number) => <li key={i}>{c}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#e7e7e7]/50">
                    No world building information available
                  </div>
                )}
              </div>
            )}

            {/* Choices Tab */}
            {activeTab === 'choices' && (
              <div>
                <h2 className="text-2xl font-bold text-[#e2c376] mb-6">Your Story Journey</h2>
                
                {storyBible.episodesGenerated && storyBible.episodesGenerated > 0 ? (
                  <div className="space-y-8">
                    {/* Progress Overview */}
                    <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-[#e2c376] mb-4">Story Progress</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-[#1e1e1e] rounded-lg">
                          <div className="text-2xl font-bold text-[#e2c376] mb-1">
                            {storyBible.episodesGenerated}
                          </div>
                          <div className="text-sm text-[#e7e7e7]/70">Episodes Generated</div>
                        </div>
                        <div className="text-center p-4 bg-[#1e1e1e] rounded-lg">
                          <div className="text-2xl font-bold text-[#e2c376] mb-1">
                            {storyBible.fanChoices?.length || 0}
                          </div>
                          <div className="text-sm text-[#e7e7e7]/70">Choices Made</div>
                        </div>
                        <div className="text-center p-4 bg-[#1e1e1e] rounded-lg">
                          <div className="text-2xl font-bold text-[#e2c376] mb-1">
                            {(storyBible.newCharacters?.length || 0) + (storyBible.newLocations?.length || 0)}
                          </div>
                          <div className="text-sm text-[#e7e7e7]/70">New Elements Added</div>
                        </div>
                      </div>
                    </div>

                    {/* Fan Choices */}
                    {storyBible.fanChoices && storyBible.fanChoices.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-[#e2c376] mb-4">Your Decisions</h3>
                        <div className="space-y-4">
                          {storyBible.fanChoices.map((choice: any, index: number) => (
                            <div key={index} className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-[#e2c376]">Episode {choice.episode}</span>
                                <span className="text-xs text-[#e7e7e7]/50">Your Choice</span>
                              </div>
                              <p className="text-[#e7e7e7]/90 mb-2">{choice.choice}</p>
                              <p className="text-sm text-[#e7e7e7]/70 italic">{choice.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Characters */}
                    {storyBible.newCharacters && storyBible.newCharacters.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-[#e2c376] mb-4">Characters Introduced Through Your Journey</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {storyBible.newCharacters.map((character: any, index: number) => (
                            <div key={index} className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-[#e2c376]">{character.name}</h4>
                                <span className="text-xs text-[#e7e7e7]/50">Episode {character.introducedInEpisode}</span>
                              </div>
                              <p className="text-sm text-[#e7e7e7]/80">{character.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Locations */}
                    {storyBible.newLocations && storyBible.newLocations.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-[#e2c376] mb-4">New Locations Discovered</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {storyBible.newLocations.map((location: any, index: number) => (
                            <div key={index} className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-[#e2c376]">{location.name}</h4>
                                <span className="text-xs text-[#e7e7e7]/50">Episode {location.introducedInEpisode}</span>
                              </div>
                              <p className="text-sm text-[#e7e7e7]/80">{location.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Story Evolution */}
                    {storyBible.storyEvolution && storyBible.storyEvolution.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-[#e2c376] mb-4">Story Evolution</h3>
                        <div className="space-y-4">
                          {storyBible.storyEvolution.map((evolution: any, index: number) => (
                            <div key={index} className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-[#e2c376]">Episode {evolution.episode}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  evolution.type === 'callback' 
                                    ? 'bg-blue-500/20 text-blue-300' 
                                    : 'bg-purple-500/20 text-purple-300'
                                }`}>
                                  {evolution.type === 'callback' ? 'Callback' : 'Foreshadowing'}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {evolution.elements.map((element: string, elemIndex: number) => (
                                  <p key={elemIndex} className="text-sm text-[#e7e7e7]/80">• {element}</p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-[#e7e7e7]/50 mb-4">No episodes generated yet</div>
                    <p className="text-sm text-[#e7e7e7]/70">
                      Start generating episodes to see how your choices shape the story!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Technical Tabs Content */}
            {/* Tension Analysis Tab */}
            {activeTab === 'tension' && storyBible.tensionStrategy && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#e2c376] flex items-center">
                  ⚡ Tension Escalation Analysis
                  <span className="ml-3 text-sm bg-[#e2c376]/20 text-[#e2c376] px-2 py-1 rounded-lg border border-[#e2c376]/30">
                    AI Generated
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Tension Curve</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tensionStrategy, 'tensionCurve')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Climax Points</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tensionStrategy, 'climaxPoints')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Release Moments</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tensionStrategy, 'releaseMoments')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Escalation Techniques</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tensionStrategy, 'escalationTechniques')}</p>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] border border-[#e2c376]/30 rounded-lg p-4">
                  <h3 className="text-[#e2c376] font-bold mb-3">Emotional Beats</h3>
                  <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tensionStrategy, 'emotionalBeats')}</p>
                </div>
              </div>
            )}

            {/* Choice Architecture Tab */}
            {activeTab === 'choice-arch' && storyBible.choiceArchitecture && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#e2c376] flex items-center">
                  🎯 Choice Architecture Analysis
                  <span className="ml-3 text-sm bg-[#e2c376]/20 text-[#e2c376] px-2 py-1 rounded-lg border border-[#e2c376]/30">
                    AI Generated
                  </span>
                </h2>
                <div className="space-y-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Key Decisions</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.choiceArchitecture, 'keyDecisions')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Moral Choices</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.choiceArchitecture, 'moralChoices')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Consequence Mapping</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.choiceArchitecture, 'consequenceMapping')}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#1a1a1a] border border-[#e2c376]/30 rounded-lg p-4">
                      <h3 className="text-[#e2c376] font-bold mb-3">Character Growth</h3>
                      <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.choiceArchitecture, 'characterGrowth')}</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#e2c376]/30 rounded-lg p-4">
                      <h3 className="text-[#e2c376] font-bold mb-3">Thematic Choices</h3>
                      <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.choiceArchitecture, 'thematicChoices')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Living World Tab */}
            {activeTab === 'living-world' && storyBible.livingWorldDynamics && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#e2c376] flex items-center">
                  🌍 Living World Dynamics
                  <span className="ml-3 text-sm bg-[#e2c376]/20 text-[#e2c376] px-2 py-1 rounded-lg border border-[#e2c376]/30">
                    AI Generated
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Background Events</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.livingWorldDynamics, 'backgroundEvents')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Social Dynamics</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.livingWorldDynamics, 'socialDynamics')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Economic Factors</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.livingWorldDynamics, 'economicFactors')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Political Undercurrents</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.livingWorldDynamics, 'politicalUndercurrents')}</p>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] border border-[#e2c376]/30 rounded-lg p-4">
                  <h3 className="text-[#e2c376] font-bold mb-3">Cultural Shifts</h3>
                  <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.livingWorldDynamics, 'culturalShifts')}</p>
                </div>
              </div>
            )}

            {/* Trope Analysis Tab */}
            {activeTab === 'trope' && storyBible.tropeAnalysis && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#e2c376] flex items-center">
                  📖 Trope Analysis
                  <span className="ml-3 text-sm bg-[#e2c376]/20 text-[#e2c376] px-2 py-1 rounded-lg border border-[#e2c376]/30">
                    AI Generated
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Genre Tropes Used</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tropeAnalysis, 'genreTropes')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Subverted Tropes</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tropeAnalysis, 'subvertedTropes')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Original Elements</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tropeAnalysis, 'originalElements')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Audience Expectations</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tropeAnalysis, 'audienceExpectations')}</p>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] border border-[#e2c376]/30 rounded-lg p-4">
                  <h3 className="text-[#e2c376] font-bold mb-3">Innovative Twists</h3>
                  <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tropeAnalysis, 'innovativeTwists')}</p>
                </div>
              </div>
            )}

            {/* Cohesion Analysis Tab */}
            {activeTab === 'cohesion' && storyBible.cohesionAnalysis && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#e2c376] flex items-center">
                  🔗 Cohesion Analysis
                  <span className="ml-3 text-sm bg-[#e2c376]/20 text-[#e2c376] px-2 py-1 rounded-lg border border-[#e2c376]/30">
                    AI Generated
                  </span>
                </h2>
                <div className="space-y-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Narrative Cohesion</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.cohesionAnalysis, 'narrativeCohesion')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Thematic Continuity</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.cohesionAnalysis, 'thematicContinuity')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Character Arcs</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.cohesionAnalysis, 'characterArcs')}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#1a1a1a] border border-[#e2c376]/30 rounded-lg p-4">
                      <h3 className="text-[#e2c376] font-bold mb-3">Plot Consistency</h3>
                      <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.cohesionAnalysis, 'plotConsistency')}</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#e2c376]/30 rounded-lg p-4">
                      <h3 className="text-[#e2c376] font-bold mb-3">Emotional Journey</h3>
                      <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.cohesionAnalysis, 'emotionalJourney')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dialogue Strategy Tab */}
            {activeTab === 'dialogue' && storyBible.dialogueStrategy && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#e2c376] flex items-center">
                  🗣️ Dialogue Strategy
                  <span className="ml-3 text-sm bg-[#e2c376]/20 text-[#e2c376] px-2 py-1 rounded-lg border border-[#e2c376]/30">
                    AI Generated
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Character Voice</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.dialogueStrategy, 'characterVoice')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Conflict Dialogue</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.dialogueStrategy, 'conflictDialogue')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Subtext</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.dialogueStrategy, 'subtext')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Speech Patterns</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.dialogueStrategy, 'speechPatterns')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Genre Enhancement Tab */}
            {activeTab === 'genre' && storyBible.genreEnhancement && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#e2c376] flex items-center">
                  🎭 Genre Enhancement
                  <span className="ml-3 text-sm bg-[#e2c376]/20 text-[#e2c376] px-2 py-1 rounded-lg border border-[#e2c376]/30">
                    AI Generated
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Visual Style</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.genreEnhancement, 'visualStyle')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Pacing</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.genreEnhancement, 'pacing')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Tropes</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.genreEnhancement, 'tropes')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Audience Expectations</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.genreEnhancement, 'audienceExpectations')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Integration Tab */}
            {activeTab === 'theme' && storyBible.themeIntegration && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#e2c376] flex items-center">
                  🎯 Theme Integration
                  <span className="ml-3 text-sm bg-[#e2c376]/20 text-[#e2c376] px-2 py-1 rounded-lg border border-[#e2c376]/30">
                    AI Generated
                  </span>
                </h2>
                <div className="space-y-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Character Integration</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.themeIntegration, 'characterIntegration')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Plot Integration</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.themeIntegration, 'plotIntegration')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Symbolic Elements</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.themeIntegration, 'symbolicElements')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#e2c376] font-bold mb-3">Resolution Strategy</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.themeIntegration, 'resolutionStrategy')}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Revolutionary Call-to-Action */}
        <motion.div 
          className="text-center space-y-8 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {/* Motivational Text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="rebellious-card p-8 max-w-3xl mx-auto"
          >
            <h3 className="text-2xl md:text-3xl font-black elegant-fire fire-gradient mb-4">
              🔥 YOUR EMPIRE AWAITS
            </h3>
            <p className="text-lg text-white/90 elegant-fire">
              The foundation is forged. Now <span className="text-[#e2c376] font-bold">ignite the revolution</span> and bring your rebellious vision to life.
            </p>
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
          <motion.button
            onClick={() => router.push('/projects')}
              className="px-8 py-4 border-2 border-[#e2c376] text-[#e2c376] rounded-xl font-bold text-lg elegant-fire hover:bg-[#e2c376]/10 transition-all"
              whileHover={{ scale: 1.05, y: -3, borderColor: "#e2c376", boxShadow: "0 10px 30px rgba(226, 195, 118, 0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              ⚡ View All Rebellions
          </motion.button>
            
          <motion.button
            onClick={() => router.push('/workspace')}
              className="burn-button px-10 py-4 text-xl font-black"
              whileHover={{ 
                scale: 1.05, 
                y: -3,
                boxShadow: "0 15px 40px rgba(214, 40, 40, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 elegant-fire">🔥 CONTINUE THE REVOLUTION</span>
          </motion.button>
          </motion.div>
          
          {/* Revolutionary Footer */}
          <motion.div 
            className="pt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            <p className="text-white/50 text-sm elegant-fire">
              No gatekeepers • No committees • <span className="text-[#e2c376]">60% ownership guaranteed</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
} 