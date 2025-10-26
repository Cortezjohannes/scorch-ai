'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedBackground from '@/components/AnimatedBackground'
import { useAuth } from '@/context/AuthContext'
import { getEpisodesForStoryBible, hasLocalEpisodes, Episode } from '@/services/episode-service'
import { hasPreProduction } from '@/services/preproduction-service'
import { getStoryBible } from '@/services/story-bible-service'
import GuestModeWarning from '@/components/GuestModeWarning'

export default function WorkspacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [storyBible, setStoryBible] = useState<any>(null)
  const [currentStoryBibleId, setCurrentStoryBibleId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatedEpisodes, setGeneratedEpisodes] = useState<Record<number, any>>({})
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number>(1)
  const [preProductionStatus, setPreProductionStatus] = useState<Record<number, boolean>>({})
  const [isClient, setIsClient] = useState(false)
  
  // Effect to set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Extract story bible ID from loaded story bible
  useEffect(() => {
    if (storyBible) {
      // Use existing ID or create a deterministic one from series title (NO Date.now()!)
      const bibleId = storyBible.id || `bible_${storyBible.seriesTitle?.replace(/\s+/g, '_').toLowerCase()}`
      setCurrentStoryBibleId(bibleId)
      console.log('📖 Story Bible ID set:', bibleId)
      
      // If story bible doesn't have an ID, log a warning
      if (!storyBible.id) {
        console.warn('⚠️ Story bible missing ID! Using deterministic fallback:', bibleId)
      }
    }
  }, [storyBible])
  
  // Helper: Check if pre-production exists for an episode
  const checkPreProductionExists = (episodeNumber: number): boolean => {
    try {
      const savedContent = localStorage.getItem('greenlit-preproduction-content') || 
                          localStorage.getItem('scorched-preproduction-content') || 
                          localStorage.getItem('reeled-preproduction-content')
      if (!savedContent) return false
      
      const parsedContent = JSON.parse(savedContent)
      return !!parsedContent[`episode-${episodeNumber}`]
    } catch (e) {
      return false
    }
  }
  
  // Helper: Get episode status
  const getEpisodeStatus = (episodeNumber: number): 'not-started' | 'completed' | 'pre-production-ready' | 'pre-production-done' => {
    const isGenerated = Boolean(generatedEpisodes[episodeNumber])
    const hasPreProduction = preProductionStatus[episodeNumber]
    
    if (!isGenerated) return 'not-started'
    if (hasPreProduction) return 'pre-production-done'
    return 'pre-production-ready'
  }
  
  // Helper: Get current episode (next incomplete episode)
  const getCurrentEpisode = (): number => {
    const episodeNumbers = Object.keys(generatedEpisodes).map(Number).sort((a, b) => a - b)
    if (episodeNumbers.length === 0) return 1
    
    const maxEpisode = Math.max(...episodeNumbers)
    const totalEpisodes = storyBible?.narrativeArcs?.reduce((total: number, arc: any) => total + (arc.episodes?.length || 10), 0) || 60
    
    // Return next episode after the highest completed
    return maxEpisode < totalEpisodes ? maxEpisode + 1 : maxEpisode
  }
  
  // Helper: Check if episode is accessible
  const isEpisodeAccessible = (episodeNumber: number): boolean => {
    if (episodeNumber === 1) return true
    return Boolean(generatedEpisodes[episodeNumber - 1])
  }
  
  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check for story bible ID in URL params
        const storyBibleId = searchParams.get('id')
        
        if (storyBibleId && user) {
          // Load specific story bible from Firestore
          console.log('🔍 Loading story bible from Firestore with ID:', storyBibleId)
          try {
            const firestoreBible = await getStoryBible(storyBibleId, user.id)
            if (firestoreBible) {
              setStoryBible(firestoreBible)
              console.log('✅ Story bible loaded from Firestore')
            } else {
              console.warn('⚠️ Story bible not found in Firestore, falling back to localStorage')
              loadFromLocalStorage()
            }
          } catch (error) {
            console.error('Error loading from Firestore:', error)
            loadFromLocalStorage()
          }
        } else {
          // No ID specified, load from localStorage (legacy behavior)
          console.log('📂 No ID specified, loading from localStorage')
          loadFromLocalStorage()
        }
        
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    const loadFromLocalStorage = () => {
      const greenlitBible = localStorage.getItem('greenlit-story-bible')
      const scorchedBible = localStorage.getItem('scorched-story-bible')
      const reeledBible = localStorage.getItem('reeled-story-bible')
      const savedBible = greenlitBible || scorchedBible || reeledBible
      
      if (savedBible) {
        const parsed = JSON.parse(savedBible)
        setStoryBible(parsed.storyBible)
        console.log('✅ Story bible loaded from localStorage')
      }
    }
    
    loadData()
  }, [searchParams, user])
  
  // Load episodes when story bible ID is available
  useEffect(() => {
    const loadEpisodes = async () => {
      if (!currentStoryBibleId) return
      
      try {
        console.log(`📺 Loading episodes for story bible: ${currentStoryBibleId}`)
        
        // Load episodes using service (handles Firestore and localStorage)
        const episodes = await getEpisodesForStoryBible(currentStoryBibleId, user?.id)
        setGeneratedEpisodes(episodes)
        
        // Check pre-production status for all episodes
        const preProductionFlags: Record<number, boolean> = {}
        for (const epNum of Object.keys(episodes)) {
          const hasPreProd = await hasPreProduction(
            currentStoryBibleId, 
            Number(epNum), 
            user?.id
          )
          preProductionFlags[Number(epNum)] = hasPreProd
        }
        setPreProductionStatus(preProductionFlags)
        
        console.log(`✅ Loaded ${Object.keys(episodes).length} episodes with pre-production status`)
      } catch (error) {
        console.error('Error loading episodes:', error)
      }
    }
    
    if (currentStoryBibleId) {
      loadEpisodes()
    }
  }, [currentStoryBibleId, user])
  
  // Update current episode when episodes change
  useEffect(() => {
    if (storyBible && Object.keys(generatedEpisodes).length > 0) {
      setCurrentEpisodeNumber(getCurrentEpisode())
    }
  }, [generatedEpisodes, storyBible])
  
  // Handle starting an episode
  const handleStartEpisode = (episodeNumber: number) => {
    if (!currentStoryBibleId) {
      console.error('No story bible ID available')
      return
    }
    router.push(`/episode-studio/${episodeNumber}?storyBibleId=${currentStoryBibleId}`)
  }
  
  // Handle continuing to next episode
  const handleContinueToNextEpisode = () => {
    if (!currentStoryBibleId) {
      console.error('No story bible ID available')
      return
    }
    const nextEpisode = getCurrentEpisode()
    router.push(`/episode-studio/${nextEpisode}?storyBibleId=${currentStoryBibleId}`)
  }
  
  // Handle starting pre-production for an episode
  const handleStartPreProduction = (episodeNumber: number) => {
    try {
      // Get episode data from localStorage
      const savedEpisodes = localStorage.getItem('greenlit-episodes') ||
                           localStorage.getItem('scorched-episodes') ||
                           localStorage.getItem('reeled-episodes')
      if (!savedEpisodes) return
      
      const episodes = JSON.parse(savedEpisodes)
      const episode = episodes[episodeNumber]
      
      if (!episode) {
        console.error(`Episode ${episodeNumber} not found`)
        return
      }
      
      // Get story bible
      const savedBible = localStorage.getItem('greenlit-story-bible') ||
                        localStorage.getItem('scorched-story-bible') ||
                        localStorage.getItem('reeled-story-bible')
      const storyBible = savedBible ? JSON.parse(savedBible).storyBible : null
      
      // Get creative mode
      let userMode = 'beast'
      if (savedBible) {
        try {
          const parsed = JSON.parse(savedBible)
          userMode = parsed.creativeMode || 'beast'
        } catch (e) {
          console.warn('Could not parse saved bible for mode, using beast mode')
        }
      }

      // Store data for pre-production page
      const preProductionData = {
        episodeNumber,
        episode,
        storyBible,
        mode: userMode
      }
      
      localStorage.setItem('greenlit-preproduction-episode-data', JSON.stringify(preProductionData))
      
      // Navigate to pre-production V2 with episode parameter and story bible ID
      if (!currentStoryBibleId) {
        console.error('No story bible ID available')
        return
      }
      router.push(`/preproduction/v2?episode=${episodeNumber}&storyBibleId=${currentStoryBibleId}`)
    } catch (error) {
      console.error('Error preparing pre-production:', error)
    }
  }
  
  // Handle viewing episode
  const handleViewEpisode = (episodeNumber: number) => {
    if (!currentStoryBibleId) {
      console.error('No story bible ID available')
      return
    }
    router.push(`/episode/${episodeNumber}?storyBibleId=${currentStoryBibleId}`)
  }
  
  // Handle viewing pre-production
  const handleViewPreProduction = (episodeNumber: number) => {
    if (!currentStoryBibleId) {
      console.error('No story bible ID available')
      return
    }
    router.push(`/preproduction/v2?episode=${episodeNumber}&storyBibleId=${currentStoryBibleId}`)
  }
  
  // Handle clear episodes
  const handleClearEpisodes = () => {
    if (confirm('Are you sure you want to clear all episodes? This cannot be undone.')) {
      const keysToRemove = [
        'greenlit-episodes', 
        'greenlit-completed-arcs',
        'scorched-episodes',
        'scorched-completed-arcs',
        'reeled-episodes',
        'reeled-completed-arcs'
      ]
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      setGeneratedEpisodes({})
      setCurrentEpisodeNumber(1)
      setPreProductionStatus({})
    }
  }
  
  // Handle clear pre-production
  const handleClearPreProduction = () => {
    if (confirm('Are you sure you want to clear all pre-production content?')) {
      const keysToRemove = [
        'greenlit-preproduction-content',
        'greenlit-preproduction-data',
        'greenlit-preproduction-episode-data',
        'scorched-preproduction-content',
        'scorched-preproduction-data',
        'reeled-preproduction-content',
        'reeled-preproduction-data'
      ]
      
      // Also remove episode-specific keys
      Object.keys(localStorage).forEach(key => {
        if (key.includes('preproduction') && !key.includes('story-bible')) {
          localStorage.removeItem(key)
        }
      })
      
      setPreProductionStatus({})
    }
  }
  
  // Get arc info for an episode
  const getArcInfoForEpisode = (episodeNumber: number) => {
    if (!storyBible || !storyBible.narrativeArcs) return { arcIndex: 0, arcTitle: 'Arc 1', episodeInArc: episodeNumber, totalInArc: 10 }
    
    let runningCount = 0
    for (let i = 0; i < storyBible.narrativeArcs.length; i++) {
      const arc = storyBible.narrativeArcs[i]
      const arcEpisodeCount = arc.episodes?.length || 10
      
      if (episodeNumber <= runningCount + arcEpisodeCount) {
        return {
          arcIndex: i,
          arcTitle: arc.title || `Arc ${i + 1}`,
          episodeInArc: episodeNumber - runningCount,
          totalInArc: arcEpisodeCount
        }
      }
      runningCount += arcEpisodeCount
    }
    
    return { arcIndex: 0, arcTitle: 'Arc 1', episodeInArc: episodeNumber, totalInArc: 10 }
  }
  
  // Get episode title from story bible
  const getEpisodeTitle = (episodeNumber: number): string => {
    const arcInfo = getArcInfoForEpisode(episodeNumber)
    const arc = storyBible?.narrativeArcs?.[arcInfo.arcIndex]
    const episode = arc?.episodes?.[arcInfo.episodeInArc - 1]
    return episode?.title || `Episode ${episodeNumber}`
  }
  
  // Get episode synopsis
  const getEpisodeSynopsis = (episodeNumber: number): string => {
    const arcInfo = getArcInfoForEpisode(episodeNumber)
    const arc = storyBible?.narrativeArcs?.[arcInfo.arcIndex]
    const episode = arc?.episodes?.[arcInfo.episodeInArc - 1]
    return episode?.summary || 'No synopsis available.'
  }
  
  // Get characters for an episode
  const getEpisodeCharacters = (episodeNumber: number) => {
    const arcInfo = getArcInfoForEpisode(episodeNumber)
    const arc = storyBible?.narrativeArcs?.[arcInfo.arcIndex]
    const episode = arc?.episodes?.[arcInfo.episodeInArc - 1]
    
    // Get character names from episode or use main characters
    const characterNames = episode?.characters || []
    
    // If no episode-specific characters, use main characters
    if (characterNames.length === 0 && storyBible?.mainCharacters) {
      return storyBible.mainCharacters.slice(0, 4) // Show first 4 main characters
    }
    
    // Map names to character objects from story bible
    return characterNames.map((name: string) => {
      const char = storyBible?.mainCharacters?.find((c: any) => 
        c.name?.toLowerCase() === name.toLowerCase()
      )
      return char || { name, description: '' }
    }).slice(0, 4) // Limit to 4 characters
  }
  
  // Get character initials
  const getCharacterInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  // Get timestamp for episode
  const getEpisodeTimestamp = (episodeNumber: number): string | null => {
    const episode = generatedEpisodes[episodeNumber]
    if (!episode?.generatedAt && !episode?.lastModified) return null
    
    const timestamp = episode.generatedAt || episode.lastModified
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  // Generate arc progress dots
  const getArcProgressDots = (arcIndex: number) => {
    if (!storyBible?.narrativeArcs) return []
    
    const arc = storyBible.narrativeArcs[arcIndex]
    const arcEpisodeCount = arc?.episodes?.length || 10
    
    // Calculate episode range for this arc
    let runningCount = 0
    for (let i = 0; i < arcIndex; i++) {
      runningCount += storyBible.narrativeArcs[i].episodes?.length || 10
    }
    
    const dots = []
    for (let i = 0; i < arcEpisodeCount; i++) {
      const episodeNum = runningCount + i + 1
      const isCompleted = Boolean(generatedEpisodes[episodeNum])
      const isCurrent = episodeNum === currentEpisodeNumber
      dots.push({ episodeNum, isCompleted, isCurrent })
    }
    
    return dots
  }

  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a]" />
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-20 h-20 border-4 border-t-[#00FF99] border-r-[#00FF9950] border-b-[#00FF9930] border-l-[#00FF9920] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[#e7e7e7]/70 mt-4">Loading your workspace...</p>
        </motion.div>
      </div>
    )
  }

  if (!storyBible) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        <AnimatedBackground intensity="low" />
        <h2 className="text-xl text-[#e7e7e7]">Story Bible not found</h2>
        <p className="text-[#e7e7e7]/70 mt-2">You need to create a story bible first.</p>
        <button 
          className="mt-6 px-4 py-2 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors"
          onClick={() => router.push('/')}
        >
          Create Story Bible
        </button>
      </div>
    )
  }

  const totalEpisodes = storyBible.narrativeArcs?.reduce((total: number, arc: any) => total + (arc.episodes?.length || 10), 0) || 60
  const completedEpisodes = Object.keys(generatedEpisodes).length
  const currentArcInfo = getArcInfoForEpisode(currentEpisodeNumber)
  const currentStatus = getEpisodeStatus(currentEpisodeNumber)
  const isCurrentEpisodeGenerated = Boolean(generatedEpisodes[currentEpisodeNumber])
  
  // Get sorted list of completed episodes
  const completedEpisodesList = Object.keys(generatedEpisodes)
    .map(Number)
    .sort((a, b) => b - a) // Reverse order (newest first)

  return (
    <motion.div 
      className="min-h-screen p-4 sm:p-6 md:p-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ fontFamily: 'League Spartan, sans-serif', zIndex: 1 }}
    >
      <AnimatedBackground intensity="low" />
      
      <div className="max-w-7xl mx-auto">
        {/* Guest Mode Warning */}
        <GuestModeWarning />
        
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-12 h-12"
            >
              <img 
                src="/greenlitailogo.png" 
                alt="Greenlit Logo" 
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
          
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 greenlit-gradient"
          >
            {storyBible.seriesTitle || "YOUR SERIES"}
          </motion.h1>

          <p className="text-sm md:text-base text-white/70 max-w-2xl mx-auto">
            Production Command Center
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="px-4 py-2 bg-[#00FF99]/10 border border-[#00FF99]/30 rounded-lg">
              <span className="text-[#00FF99] font-bold text-sm">
                {completedEpisodes}/{totalEpisodes} Episodes Completed
              </span>
            </div>
            {(() => {
              const readyForPreProd = completedEpisodesList.filter(epNum => !preProductionStatus[epNum]).length
              const completedPreProd = completedEpisodesList.filter(epNum => preProductionStatus[epNum]).length
              return (
                <div className={`px-4 py-2 border rounded-lg ${
                  readyForPreProd > 0 
                    ? 'bg-[#00FF99]/10 border-[#00FF99]/30 animate-pulse' 
                    : 'bg-green-500/10 border-green-500/30'
                }`}>
                  <span className={`font-bold text-sm ${
                    readyForPreProd > 0 ? 'text-[#00FF99]' : 'text-green-400'
                  }`}>
                    🎬 {completedPreProd}/{completedEpisodes} Pre-Production
                    {readyForPreProd > 0 && ` (+${readyForPreProd} ready)`}
                  </span>
                </div>
              )
            })()}
            {storyBible.mainCharacters && (
              <div className="px-4 py-2 bg-[#00FF99]/10 border border-[#00FF99]/30 rounded-lg">
                <span className="text-[#00FF99] font-bold text-sm">
                  {storyBible.mainCharacters.length} Characters
                </span>
              </div>
            )}
            <div className="px-4 py-2 bg-[#00FF99]/10 border border-[#00FF99]/30 rounded-lg">
              <span className="text-[#00FF99] font-bold text-sm">
                Current Arc: {currentArcInfo.arcIndex + 1}/{storyBible.narrativeArcs?.length || 6}
              </span>
            </div>
          </div>
        </motion.div>
          
        {/* Main Content: Hero + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Hero Section - 60% on desktop */}
        <motion.div
            className="lg:col-span-3"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#252628] border border-[#36393f] rounded-xl p-6 md:p-8 h-full">
              <div className="flex items-start justify-between mb-4">
              <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-[#00FF99]/20 text-[#00FF99] border border-[#00FF99]/40">
                      {isCurrentEpisodeGenerated ? 'Completed' : 'Next Episode'}
                    </span>
                    {currentStatus === 'pre-production-done' && (
                      <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/40">
                        Pre-Production ✓
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    Episode {currentEpisodeNumber}
                  </h2>
                  <p className="text-[#00FF99] text-sm font-medium">
                    {currentArcInfo.arcTitle} • Episode {currentArcInfo.episodeInArc} of {currentArcInfo.totalInArc}
                </p>
              </div>
            </div>
            
              <h3 className="text-xl font-semibold text-white mb-3">
                {getEpisodeTitle(currentEpisodeNumber)}
              </h3>
              
              <p className="text-[#e7e7e7]/80 text-sm mb-4 leading-relaxed line-clamp-3">
                {getEpisodeSynopsis(currentEpisodeNumber)}
              </p>

              {/* Character Avatars */}
              {getEpisodeCharacters(currentEpisodeNumber).length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#e7e7e7]/50 font-medium">Characters:</span>
              </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getEpisodeCharacters(currentEpisodeNumber).map((character: any, idx: number) => (
                <motion.div
                        key={idx}
                        className="group relative"
                        whileHover={{ scale: 1.1, y: -2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FF99]/20 to-[#00CC7A]/20 border-2 border-[#00FF99]/40 flex items-center justify-center text-sm font-bold text-[#00FF99] hover:border-[#00FF99] transition-colors">
                          {getCharacterInitials(character.name)}
              </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {character.name}
          </div>
        </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Arc Progress Timeline */}
              <div className="mb-6 p-3 bg-[#2a2a2a]/30 rounded-lg border border-[#36393f]/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#e7e7e7]/60 font-medium">Arc Progress</span>
                  <span className="text-xs text-[#00FF99] font-bold">
                    {Math.round((getArcProgressDots(currentArcInfo.arcIndex).filter(d => d.isCompleted).length / getArcProgressDots(currentArcInfo.arcIndex).length) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {getArcProgressDots(currentArcInfo.arcIndex).map((dot, idx) => (
        <motion.div 
                      key={idx}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        dot.isCurrent 
                          ? 'bg-[#00FF99] ring-2 ring-[#00FF99]/30' 
                          : dot.isCompleted 
                            ? 'bg-[#00FF99]/60' 
                            : 'bg-[#36393f]'
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      title={`Episode ${dot.episodeNum}${dot.isCurrent ? ' (Current)' : dot.isCompleted ? ' (Complete)' : ''}`}
                    />
                  ))}
                      </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-[#e7e7e7]/40">Ep {currentArcInfo.episodeInArc}</span>
                  <span className="text-xs text-[#e7e7e7]/40">of {currentArcInfo.totalInArc}</span>
                    </div>
          </div>

              {/* Episode metadata */}
              {isCurrentEpisodeGenerated && generatedEpisodes[currentEpisodeNumber] && (
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-[#2a2a2a]/50 rounded-lg border border-[#36393f]">
                  <div>
                    <div className="text-xs text-[#e7e7e7]/50 mb-1">Scenes</div>
                    <div className="text-lg font-bold text-white">
                      {generatedEpisodes[currentEpisodeNumber].scenes?.length || 0}
                  </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#e7e7e7]/50 mb-1">Status</div>
                    <div className="text-lg font-bold text-[#00FF99]">
                      Complete
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!isCurrentEpisodeGenerated ? (
                      <motion.button
                    onClick={() => handleStartEpisode(currentEpisodeNumber)}
                    disabled={!isEpisodeAccessible(currentEpisodeNumber)}
                    className="flex-1 bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-black px-6 py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-[#00FF99]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                  >
                    ✍️ Start Writing Episode {currentEpisodeNumber}
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      onClick={handleContinueToNextEpisode}
                      className="flex-1 bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-black px-6 py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-[#00FF99]/20 transition-all"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ⚡ Continue to Episode {currentEpisodeNumber + 1}
                      </motion.button>
                    
                    {currentStatus === 'pre-production-ready' && (
                      <motion.button
                        onClick={() => handleStartPreProduction(currentEpisodeNumber)}
                        className="flex-1 bg-[#36393f] border-2 border-[#00FF99] text-[#00FF99] px-6 py-4 rounded-lg font-bold text-lg hover:bg-[#00FF99]/10 transition-all"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        🎬 Start Pre-Production
                      </motion.button>
                    )}
                    
                    {currentStatus === 'pre-production-done' && (
                      <motion.button
                        onClick={() => handleViewPreProduction(currentEpisodeNumber)}
                        className="flex-1 bg-green-500/20 border-2 border-green-500 text-green-400 px-6 py-4 rounded-lg font-bold text-lg hover:bg-green-500/30 transition-all"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        👁️ View Pre-Production
                      </motion.button>
                    )}
                  </>
                            )}
                          </div>
                          
              {!isEpisodeAccessible(currentEpisodeNumber) && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    🔒 Complete Episode {currentEpisodeNumber - 1} first
                  </p>
                </div>
              )}

              {/* Timestamp for completed episodes */}
              {isCurrentEpisodeGenerated && getEpisodeTimestamp(currentEpisodeNumber) && (
                <div className="mt-4 flex items-center gap-2 text-xs text-[#e7e7e7]/40">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Written {getEpisodeTimestamp(currentEpisodeNumber)}</span>
                </div>
              )}

              {/* Smart Suggestion: Episodes Ready for Pre-Production */}
              {!isCurrentEpisodeGenerated && completedEpisodes > 0 && (
                (() => {
                  const readyForPreProd = completedEpisodesList.filter(epNum => !preProductionStatus[epNum])
                  if (readyForPreProd.length > 0) {
                    return (
                      <motion.div
                        className="mt-4 p-4 bg-gradient-to-r from-[#00FF99]/10 to-[#00CC7A]/10 border border-[#00FF99]/30 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">💡</span>
                          <div className="flex-1">
                            <p className="text-[#00FF99] font-bold text-sm mb-1">
                              {readyForPreProd.length} episode{readyForPreProd.length !== 1 ? 's' : ''} ready for pre-production!
                            </p>
                            <p className="text-[#e7e7e7]/70 text-xs mb-3">
                              Generate scripts, storyboards, and production materials
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {readyForPreProd.slice(0, 3).map(epNum => (
                                <motion.button
                                  key={epNum}
                                  onClick={() => handleStartPreProduction(epNum)}
                                  className="px-3 py-1.5 bg-[#00FF99]/20 border border-[#00FF99]/40 text-[#00FF99] text-xs rounded-lg hover:bg-[#00FF99]/30 transition-all font-medium"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  🎬 Episode {epNum}
                                </motion.button>
                              ))}
                              {readyForPreProd.length > 3 && (
                                <span className="px-3 py-1.5 text-xs text-[#e7e7e7]/50">
                                  +{readyForPreProd.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  }
                  return null
                })()
              )}

              {/* Coming Up Next Preview */}
              {isCurrentEpisodeGenerated && currentEpisodeNumber + 1 <= totalEpisodes && (
                <motion.div
                  className="mt-4 p-3 bg-[#2a2a2a]/30 border border-[#36393f]/50 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#e7e7e7]/50 font-medium">Coming Up Next:</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    Episode {currentEpisodeNumber + 1}: {getEpisodeTitle(currentEpisodeNumber + 1)}
                  </h4>
                  <p className="text-xs text-[#e7e7e7]/60 line-clamp-2 leading-relaxed">
                    {getEpisodeSynopsis(currentEpisodeNumber + 1)}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Sidebar - 40% on desktop */}
          <motion.div
            className="lg:col-span-2"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 h-full">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                <span>Completed Episodes</span>
                <span className="text-sm font-normal text-[#00FF99]">{completedEpisodes}</span>
              </h3>

              {completedEpisodesList.length === 0 ? (
                <div className="text-center py-8 text-[#e7e7e7]/50">
                  <p className="text-sm">No episodes completed yet.</p>
                  <p className="text-xs mt-2">Start writing your first episode!</p>
                                  </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {completedEpisodesList.map((episodeNum) => {
                    const episode = generatedEpisodes[episodeNum]
                    const hasPreProduction = preProductionStatus[episodeNum]
                    const arcInfo = getArcInfoForEpisode(episodeNum)
                    
                    return (
                      <motion.div
                        key={episodeNum}
                        className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4 hover:border-[#00FF99]/40 transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs px-2 py-0.5 rounded bg-[#00FF99] text-black font-bold">
                                EP {episodeNum}
                              </span>
                              {hasPreProduction && (
                                <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                                  ✓
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-white text-sm line-clamp-1">
                              {episode.episodeTitle || episode.title || `Episode ${episodeNum}`}
                            </h4>
                            <p className="text-xs text-[#e7e7e7]/60 mt-1">
                              {arcInfo.arcTitle}
                            </p>
                            {/* Scene count and timestamp */}
                            <div className="flex items-center gap-3 mt-2 text-xs text-[#e7e7e7]/40">
                              {episode.scenes && (
                                <span className="flex items-center gap-1">
                                  🎬 {episode.scenes.length} scene{episode.scenes.length !== 1 ? 's' : ''}
                                </span>
                              )}
                              {getEpisodeTimestamp(episodeNum) && (
                                <span className="flex items-center gap-1">
                                  ⏱️ {getEpisodeTimestamp(episodeNum)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
        
                        <div className="flex gap-2 mt-3">
                          <motion.button
                            onClick={() => handleViewEpisode(episodeNum)}
                            className="flex-1 px-3 py-2 bg-[#36393f] text-[#e7e7e7] text-xs rounded hover:bg-[#4a4a4a] transition-colors font-medium"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            👁️ View
                          </motion.button>
                          {!hasPreProduction ? (
                            <motion.button
                              onClick={() => handleStartPreProduction(episodeNum)}
                              className="flex-1 px-3 py-2 bg-gradient-to-r from-[#00FF99]/20 to-[#00CC7A]/20 border border-[#00FF99]/50 text-[#00FF99] text-xs rounded hover:from-[#00FF99]/30 hover:to-[#00CC7A]/30 hover:border-[#00FF99] transition-all font-bold"
                              whileHover={{ scale: 1.05, y: -1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              🎬 Pre-Prod
                            </motion.button>
                          ) : (
                            <motion.button
                              onClick={() => handleViewPreProduction(episodeNum)}
                              className="flex-1 px-3 py-2 bg-green-500/20 border border-green-500/40 text-green-400 text-xs rounded hover:bg-green-500/30 transition-colors font-medium"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              ✓ View
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-[#36393f]">
                <h4 className="text-sm font-semibold text-[#e7e7e7]/70 mb-3">Quick Actions</h4>
                <div className="space-y-2">
            <button
              onClick={() => router.push('/story-bible')}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#36393f] text-[#e7e7e7] text-sm rounded-lg hover:border-[#00FF99]/40 hover:text-[#00FF99] transition-all text-left"
            >
                    📖 Story Bible
            </button>
            <button
                    onClick={handleClearPreProduction}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#36393f] text-[#e7e7e7] text-sm rounded-lg hover:border-yellow-500/40 hover:text-yellow-400 transition-all text-left"
            >
                    🗑️ Clear Pre-Production
            </button>
            <button
                    onClick={handleClearEpisodes}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#36393f] text-[#e7e7e7] text-sm rounded-lg hover:border-red-500/40 hover:text-red-400 transition-all text-left"
            >
                    🔄 Clear All Episodes
            </button>
          </div>
        </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-white">Series Progress</h3>
            <span className="text-sm text-[#00FF99]">
              {Math.round((completedEpisodes / totalEpisodes) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-[#2a2a2a] rounded-full overflow-hidden border border-[#00FF99]/30">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00FF99] via-[#00CC7A] to-[#00FF99]"
              initial={{ width: 0 }}
              animate={{ width: `${(completedEpisodes / totalEpisodes) * 100}%` }}
              transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#e7e7e7]/50 mt-2">
            <span>Episode 1</span>
            <span>Episode {totalEpisodes}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
} 
