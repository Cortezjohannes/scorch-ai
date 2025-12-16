'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'
import AnimatedBackground from '@/components/AnimatedBackground'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { getEpisodesForStoryBible, hasLocalEpisodes, Episode, findRecoverableEpisodes } from '@/services/episode-service'
import { hasPreProductionV2 } from '@/services/preproduction-v2-service'
import { getStoryBible } from '@/services/story-bible-service'
import { canUnlockArcPreProduction, getEpisodeRangeForArc, getEpisodePreProduction } from '@/services/preproduction-firestore'
import GuestModeWarning from '@/components/GuestModeWarning'
import EpisodeRecoveryPrompt from '@/components/EpisodeRecoveryPrompt'
import EpisodeGenerationSuite from '@/components/workspace/EpisodeGenerationSuite'

export default function WorkspacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const [storyBible, setStoryBible] = useState<any>(null)
  const [currentStoryBibleId, setCurrentStoryBibleId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatedEpisodes, setGeneratedEpisodes] = useState<Record<number, any>>({})
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number>(1)
  const [preProductionStatus, setPreProductionStatus] = useState<Record<number, boolean>>({})
  const [isClient, setIsClient] = useState(false)
  
  // Episode recovery state
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false)
  const [recoverableEpisodes, setRecoverableEpisodes] = useState<number[]>([])
  
  // Generation suite modal state
  const [showGenerationSuite, setShowGenerationSuite] = useState(false)
  
  // Production assistant state
  const [arcUnlockStatuses, setArcUnlockStatuses] = useState<Record<number, any>>({})
  const [checkingArcStatuses, setCheckingArcStatuses] = useState(false)
  
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
        // Wait for auth to finish loading before determining storage mode
        if (authLoading) {
          console.log('⏳ Waiting for auth to load before loading story bible...')
          return
        }
        
        // Check for story bible ID in URL params
        const storyBibleId = searchParams.get('id')
        
        // Check both useAuth hook and Firebase auth directly (fallback for cross-device issues)
        let userIdToUse = user?.id
        if (!userIdToUse && typeof window !== 'undefined') {
          try {
            const { auth } = await import('@/lib/firebase')
            const currentUser = auth.currentUser
            if (currentUser) {
              userIdToUse = currentUser.uid
              console.log('🔍 Workspace: useAuth returned null, but Firebase auth.currentUser exists:', userIdToUse)
            }
          } catch (authError) {
            console.error('❌ Error checking Firebase auth in workspace:', authError)
          }
        }
        
        if (storyBibleId && userIdToUse) {
          // Load specific story bible from Firestore
          console.log('🔍 Loading story bible from Firestore with ID:', storyBibleId)
          console.log(`👤 Authenticated as: ${userIdToUse}`)
          try {
            const firestoreBible = await getStoryBible(storyBibleId, userIdToUse)
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
          // No ID specified or not authenticated, load from localStorage (legacy/guest behavior)
          if (!userIdToUse && storyBibleId) {
            console.log('📂 Guest mode: Loading from localStorage')
          } else if (!storyBibleId) {
            console.log('📂 No ID specified, loading from localStorage')
          }
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
  }, [searchParams, user, authLoading])
  
  // Load episodes when story bible ID is available
  useEffect(() => {
    const loadEpisodes = async () => {
      if (!currentStoryBibleId) return
      
      // Wait for auth to finish loading before determining storage mode
      if (authLoading) {
        console.log('⏳ Waiting for auth to load before loading episodes...')
        return
      }
      
      try {
        console.log(`📺 Loading episodes for story bible: ${currentStoryBibleId}`)
        console.log(`👤 Auth state: ${user ? `authenticated (${user.email})` : 'guest mode'}`)
        
        // Load episodes using service (handles Firestore and localStorage)
        const episodes = await getEpisodesForStoryBible(currentStoryBibleId, user?.id)
        setGeneratedEpisodes(episodes)
        
        // Check episode pre-production status (new system)
        const preProductionFlags: Record<number, boolean> = {}
        if (user?.id) {
          for (const epNum of Object.keys(episodes)) {
            try {
              const episodePreProd = await getEpisodePreProduction(
                user.id,
                currentStoryBibleId,
                Number(epNum)
              )
              preProductionFlags[Number(epNum)] = !!episodePreProd
            } catch (error) {
              console.error(`Error checking pre-production for episode ${epNum}:`, error)
              preProductionFlags[Number(epNum)] = false
            }
          }
        } else {
          // Fallback to V2 check for guest mode
          for (const epNum of Object.keys(episodes)) {
            const hasPreProd = await hasPreProductionV2(
              currentStoryBibleId, 
              `episode_${epNum}`,
              user?.id
            )
            preProductionFlags[Number(epNum)] = hasPreProd
          }
        }
        setPreProductionStatus(preProductionFlags)
        
        console.log(`✅ Loaded ${Object.keys(episodes).length} episodes with pre-production status`)
        
        // Check for recoverable episodes (only for authenticated users)
        if (user) {
          const recoverable = await findRecoverableEpisodes(currentStoryBibleId, user.id)
          if (recoverable.length > 0) {
            setRecoverableEpisodes(recoverable)
            setShowRecoveryPrompt(true)
          }
        }
      } catch (error) {
        console.error('Error loading episodes:', error)
      }
    }
    
    if (currentStoryBibleId) {
      loadEpisodes()
    }
  }, [currentStoryBibleId, user, authLoading])
  
  // Update current episode when episodes change
  useEffect(() => {
    if (storyBible && Object.keys(generatedEpisodes).length > 0) {
      setCurrentEpisodeNumber(getCurrentEpisode())
    }
  }, [generatedEpisodes, storyBible])

  // Check arc unlock statuses when episodes and pre-production status changes
  useEffect(() => {
    const checkArcStatuses = async () => {
      if (!storyBible?.narrativeArcs || !currentStoryBibleId || !user?.id || checkingArcStatuses) return
      
      setCheckingArcStatuses(true)
      
      try {
        const statuses: Record<number, any> = {}
        
        for (let i = 0; i < storyBible.narrativeArcs.length; i++) {
          const status = await canUnlockArcPreProduction(
            user.id,
            currentStoryBibleId,
            i,
            generatedEpisodes
          )
          statuses[i] = status
        }
        
        setArcUnlockStatuses(statuses)
      } catch (error) {
        console.error('Error checking arc unlock statuses:', error)
      } finally {
        setCheckingArcStatuses(false)
      }
    }
    
    // Only check if we have episodes and pre-production status loaded
    if (Object.keys(generatedEpisodes).length > 0 && Object.keys(preProductionStatus).length > 0) {
      checkArcStatuses()
    }
  }, [generatedEpisodes, preProductionStatus, storyBible, currentStoryBibleId, user?.id, checkingArcStatuses])
  
  // Handle starting an episode
  const handleStartEpisode = (episodeNumber: number) => {
    if (!currentStoryBibleId) {
      console.error('No story bible ID available')
      return
    }
    setShowGenerationSuite(true)
  }
  
  // Get previous episode choice
  const getPreviousEpisodeChoice = (): string | undefined => {
    try {
      const savedChoices = localStorage.getItem('greenlit-user-choices') || 
                          localStorage.getItem('scorched-user-choices') || 
                          localStorage.getItem('reeled-user-choices')
      
      if (savedChoices) {
        const choices = JSON.parse(savedChoices)
        const previousEpisodeChoice = choices.find((choice: any) => 
          choice.episodeNumber === currentEpisodeNumber - 1
        )
        return previousEpisodeChoice?.choiceText
      }
    } catch (err) {
      console.error('Error loading previous choices:', err)
    }
    return undefined
  }
  
  // Handle episode generation complete
  const handleEpisodeGenerationComplete = () => {
    setShowGenerationSuite(false)
    // Reload episodes to show the new one
    window.location.reload()
  }
  
  // Handle continuing to next episode
  const handleContinueToNextEpisode = () => {
    if (!currentStoryBibleId) {
      console.error('No story bible ID available')
      return
    }
    const nextEpisode = getCurrentEpisode()
    setCurrentEpisodeNumber(nextEpisode)
    setShowGenerationSuite(true)
  }
  
  // Handle starting pre-production for an episode
  const handleStartPreProduction = (episodeNumber: number) => {
    try {
      console.log(`🎬 Starting episode pre-production for episode ${episodeNumber}`)
      
      if (!currentStoryBibleId) {
        console.error('No story bible ID available')
        return
      }
      
      // Get episode data from state (works for both Firestore and localStorage)
      const episode = generatedEpisodes[episodeNumber]
      
      if (!episode) {
        console.error(`Episode ${episodeNumber} not found in generated episodes`)
        alert(`Episode ${episodeNumber} not found. Please generate it first.`)
        return
      }
      
      console.log('✅ Episode data found:', episode)
      
      // Get episode title
      const episodeTitle = getEpisodeTitle(episodeNumber)
      
      // Navigate to new episode pre-production route
      router.push(`/preproduction/episode/${episodeNumber}?storyBibleId=${currentStoryBibleId}&episodeTitle=${encodeURIComponent(episodeTitle)}`)
    } catch (error) {
      console.error('Error preparing pre-production:', error)
      alert(`Error starting pre-production: ${error}`)
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
    
    // Get episode title
    const episodeTitle = getEpisodeTitle(episodeNumber)
    
    // Navigate to new episode pre-production route
    router.push(`/preproduction/episode/${episodeNumber}?storyBibleId=${currentStoryBibleId}&episodeTitle=${encodeURIComponent(episodeTitle)}`)
  }

  // Handle opening production assistant
  const handleOpenArcPreProduction = (arcIndex: number) => {
    if (!currentStoryBibleId) {
      console.error('No story bible ID available')
      return
    }
    
    router.push(`/preproduction/arc/${arcIndex}?storyBibleId=${currentStoryBibleId}`)
  }
  
  // Handle clear episodes
  const handleClearEpisodes = async () => {
    if (confirm('Are you sure you want to clear all episodes? This cannot be undone.')) {
      try {
        // Import the delete function
        const { deleteAllEpisodesForStoryBible } = await import('@/services/episode-service')
        
        // Delete from Firestore (if authenticated) or localStorage (if guest)
        const deletedCount = await deleteAllEpisodesForStoryBible(
          currentStoryBibleId || 'default',
          user?.id
        )
        
        console.log(`✅ Cleared ${deletedCount} episodes`)
        
        // Clear local state
        setGeneratedEpisodes({})
        setCurrentEpisodeNumber(1)
        setPreProductionStatus({})
        
        // Show success message
        alert(`Successfully cleared ${deletedCount} episode(s)`)
        
        // Reload the page to refresh the episode list
        window.location.reload()
      } catch (error) {
        console.error('Failed to clear episodes:', error)
        alert('Failed to clear episodes. Please try again.')
      }
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
            className="w-20 h-20 border-4 border-t-[#10B981] border-r-[#10B98150] border-b-[#10B98130] border-l-[#10B98120] rounded-full"
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
          className="mt-6 px-4 py-2 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors"
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
      className={`min-h-screen p-4 sm:p-6 md:p-8 relative ${prefix}-bg-primary`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ fontFamily: 'League Spartan, sans-serif', zIndex: 1 }}
    >
      <AnimatedBackground intensity="low" />
      
      <div className="max-w-7xl mx-auto">
        {/* Guest Mode Warning */}
        <GuestModeWarning />
        
        {/* Breadcrumb Navigation */}
        {currentStoryBibleId && (
          <motion.div
            className="mb-6 flex items-center gap-2 text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => router.push(`/dashboard?id=${currentStoryBibleId}`)}
              className={`${prefix}-text-secondary hover:${prefix}-text-primary transition-colors`}
            >
              Dashboard
            </button>
            <span className={prefix + '-text-tertiary'}>/</span>
            <span className={prefix + '-text-primary'}>Workspace</span>
          </motion.div>
        )}
        
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

          <p className={`text-sm md:text-base ${prefix}-text-secondary max-w-2xl mx-auto`}>
            Production Command Center
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className={`px-4 py-2 ${prefix}-bg-accent border ${prefix}-border rounded-lg`}>
              <span className={`${prefix}-text-accent font-bold text-sm`} style={{ color: '#10B981' }}>
                {completedEpisodes}/{totalEpisodes} Episodes Completed
              </span>
            </div>
            {(() => {
              const readyForPreProd = completedEpisodesList.filter(epNum => !preProductionStatus[epNum]).length
              const completedPreProd = completedEpisodesList.filter(epNum => preProductionStatus[epNum]).length
              return (
                <div className={`px-4 py-2 border rounded-lg ${
                  readyForPreProd > 0 
                    ? `${prefix}-bg-accent ${prefix}-border animate-pulse` 
                    : `${prefix}-bg-accent ${prefix}-border`
                }`}>
                  <span className={`font-bold text-sm ${prefix}-text-accent`} style={{ color: '#10B981' }}>
                    🎬 {completedPreProd}/{completedEpisodes} Pre-Production
                    {readyForPreProd > 0 && ` (+${readyForPreProd} ready)`}
                  </span>
                </div>
              )
            })()}
            {storyBible.mainCharacters && (
              <div className={`px-4 py-2 ${prefix}-bg-accent border ${prefix}-border rounded-lg`}>
                <span className={`${prefix}-text-accent font-bold text-sm`} style={{ color: '#10B981' }}>
                  {storyBible.mainCharacters.length} Characters
                </span>
              </div>
            )}
            <div className={`px-4 py-2 ${prefix}-bg-accent border ${prefix}-border rounded-lg`}>
              <span className={`${prefix}-text-accent font-bold text-sm`} style={{ color: '#10B981' }}>
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
            <div className={`${prefix}-card border ${prefix}-border rounded-xl p-6 md:p-8 h-full`}>
              <div className="flex items-start justify-between mb-4">
              <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${prefix}-bg-accent ${prefix}-border`} style={{ color: '#10B981' }}>
                      {isCurrentEpisodeGenerated ? 'Completed' : 'Next Episode'}
                    </span>
                    {currentStatus === 'pre-production-done' && (
                      <span className={`text-xs px-3 py-1 rounded-full ${prefix}-bg-accent ${prefix}-border`} style={{ color: '#10B981' }}>
                        Pre-Production ✓
                      </span>
                    )}
                  </div>
                  <h2 className={`text-2xl md:text-3xl font-bold ${prefix}-text-primary mb-1`}>
                    Episode {currentEpisodeNumber}
                  </h2>
                  <p className={`${prefix}-text-accent text-sm font-medium`} style={{ color: '#10B981' }}>
                    {currentArcInfo.arcTitle} • Episode {currentArcInfo.episodeInArc} of {currentArcInfo.totalInArc}
                </p>
              </div>
            </div>
            
              <h3 className={`text-xl font-semibold ${prefix}-text-primary mb-3`}>
                {getEpisodeTitle(currentEpisodeNumber)}
              </h3>
              
              <p className={`${prefix}-text-secondary text-sm mb-4 leading-relaxed line-clamp-3`}>
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border-2 border-[#10B981]/40 flex items-center justify-center text-sm font-bold text-[#10B981] hover:border-[#10B981] transition-colors">
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
                  <span className="text-xs text-[#10B981] font-bold">
                    {Math.round((getArcProgressDots(currentArcInfo.arcIndex).filter(d => d.isCompleted).length / getArcProgressDots(currentArcInfo.arcIndex).length) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {getArcProgressDots(currentArcInfo.arcIndex).map((dot, idx) => (
        <motion.div 
                      key={idx}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        dot.isCurrent 
                          ? 'bg-[#10B981] ring-2 ring-[#10B981]/30' 
                          : dot.isCompleted 
                            ? 'bg-[#10B981]/60' 
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
                    <div className="text-lg font-bold text-[#10B981]">
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
                    className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] text-black px-6 py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-[#10B981]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                  >
                    ✍️ Start Writing Episode {currentEpisodeNumber}
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      onClick={handleContinueToNextEpisode}
                      className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] text-black px-6 py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-[#10B981]/20 transition-all"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ⚡ Continue to Episode {currentEpisodeNumber + 1}
                      </motion.button>
                    
                    {currentStatus === 'pre-production-ready' && (
                      <motion.button
                        onClick={() => handleStartPreProduction(currentEpisodeNumber)}
                        className="flex-1 bg-[#36393f] border-2 border-[#10B981] text-[#10B981] px-6 py-4 rounded-lg font-bold text-lg hover:bg-[#10B981]/10 transition-all"
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
                        className="mt-4 p-4 bg-gradient-to-r from-[#10B981]/10 to-[#059669]/10 border border-[#10B981]/30 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">💡</span>
                          <div className="flex-1">
                            <p className="text-[#10B981] font-bold text-sm mb-1">
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
                                  className="px-3 py-1.5 bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-xs rounded-lg hover:bg-[#10B981]/30 transition-all font-medium"
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
            <div className={`${prefix}-card border ${prefix}-border rounded-xl p-6 h-full`}>
              <h3 className={`text-lg font-bold ${prefix}-text-primary mb-4 flex items-center justify-between`}>
                <span>Completed Episodes</span>
                <span className={`text-sm font-normal ${prefix}-text-accent`} style={{ color: '#10B981' }}>{completedEpisodes}</span>
              </h3>

              {completedEpisodesList.length === 0 ? (
                <div className={`text-center py-8 ${prefix}-text-tertiary`}>
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
                        className={`${prefix}-card-secondary border ${prefix}-border rounded-lg p-4 hover:${prefix}-border transition-all`}
                        style={{ borderColor: hasPreProduction ? 'rgba(0, 255, 153, 0.4)' : undefined }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${prefix}-btn-primary font-bold`}>
                                EP {episodeNum}
                              </span>
                              {hasPreProduction && (
                                <span className={`text-xs px-2 py-0.5 rounded ${prefix}-bg-accent ${prefix}-text-accent`} style={{ color: '#10B981' }}>
                                  ✓
                                </span>
                              )}
                            </div>
                            <h4 className={`font-semibold ${prefix}-text-primary text-sm line-clamp-1`}>
                              {episode.episodeTitle || episode.title || `Episode ${episodeNum}`}
                            </h4>
                            <p className={`text-xs ${prefix}-text-secondary mt-1`}>
                              {arcInfo.arcTitle}
                            </p>
                            {/* Scene count and timestamp */}
                            <div className={`flex items-center gap-3 mt-2 text-xs ${prefix}-text-tertiary`}>
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
                            className={`flex-1 px-3 py-2 ${prefix}-bg-secondary ${prefix}-text-secondary text-xs rounded hover:${prefix}-bg-secondary/80 transition-colors font-medium`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            👁️ View
                          </motion.button>
                          {!hasPreProduction ? (
                            <motion.button
                              onClick={() => handleStartPreProduction(episodeNum)}
                              className={`flex-1 px-3 py-2 ${prefix}-bg-accent border ${prefix}-border text-xs rounded hover:${prefix}-bg-accent/50 transition-all font-bold`}
                              style={{ color: '#10B981' }}
                              whileHover={{ scale: 1.05, y: -1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              🎬 Pre-Prod
                            </motion.button>
                          ) : (
                            <motion.button
                              onClick={() => handleViewPreProduction(episodeNum)}
                              className={`flex-1 px-3 py-2 ${prefix}-bg-accent border ${prefix}-border text-xs rounded hover:${prefix}-bg-accent/50 transition-colors font-medium`}
                              style={{ color: '#10B981' }}
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
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#36393f] text-[#e7e7e7] text-sm rounded-lg hover:border-[#10B981]/40 hover:text-[#10B981] transition-all text-left"
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
            <span className="text-sm text-[#10B981]">
              {Math.round((completedEpisodes / totalEpisodes) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-[#2a2a2a] rounded-full overflow-hidden border border-[#10B981]/30">
            <motion.div
              className="h-full bg-gradient-to-r from-[#10B981] via-[#059669] to-[#10B981]"
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

        {/* Production Assistant Section */}
        {storyBible?.narrativeArcs && storyBible.narrativeArcs.length > 0 && (
          <motion.div
            className="mt-6 bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#e7e7e7] flex items-center gap-2">
                <span>🎭</span>
                Production Assistant
              </h3>
              {checkingArcStatuses && (
                <div className="flex items-center gap-2 text-xs text-[#e7e7e7]/50">
                  <div className="w-3 h-3 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
                  <span>Checking...</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-[#e7e7e7]/70 mb-4">
              Coordinate casting, scheduling, budget, and equipment across all episodes in each arc.
            </p>

            <div className="space-y-3">
              {storyBible.narrativeArcs.map((arc: any, arcIndex: number) => {
                const unlockStatus = arcUnlockStatuses[arcIndex]
                const episodeRange = getEpisodeRangeForArc(storyBible, arcIndex)
                const completedInArc = episodeRange.filter(ep => generatedEpisodes[ep]).length
                const totalInArc = episodeRange.length
                const hasEpisodePreProd = episodeRange.filter(ep => preProductionStatus[ep]).length
                
                const canUnlock = unlockStatus?.canUnlock || false
                const missingEpisodes = unlockStatus?.missingEpisodes || []
                const missingEpisodePreProd = unlockStatus?.missingEpisodePreProd || []
                
                return (
                  <motion.div
                    key={arcIndex}
                    className={`bg-[#2a2a2a] rounded-lg border-2 p-4 ${
                      canUnlock 
                        ? 'border-[#10B981]/50 hover:border-[#10B981] cursor-pointer' 
                        : 'border-[#36393f] opacity-70'
                    } transition-all`}
                    whileHover={canUnlock ? { scale: 1.02 } : {}}
                    onClick={canUnlock ? () => handleOpenArcPreProduction(arcIndex) : undefined}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-base font-bold text-[#e7e7e7]">
                            {arc.title || `Arc ${arcIndex + 1}`}
                          </h4>
                          {canUnlock && (
                            <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] rounded text-xs font-medium border border-[#10B981]/40">
                              ✓ Ready
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-[#e7e7e7]/70 mb-3">
                          <span>
                            {completedInArc} / {totalInArc} episodes generated
                          </span>
                          <span>•</span>
                          <span>
                            {hasEpisodePreProd} / {totalInArc} with episode pre-prod
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] transition-all duration-500"
                              style={{ width: `${(completedInArc / totalInArc) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Unlock Status Messages */}
                        {!canUnlock && (
                          <div className="space-y-1">
                            {missingEpisodes.length > 0 && (
                              <p className="text-xs text-yellow-400">
                                🔒 Missing episodes: {missingEpisodes.join(', ')}
                              </p>
                            )}
                            {missingEpisodePreProd.length > 0 && (
                              <p className="text-xs text-orange-400">
                                📋 Complete episode pre-prod for: {missingEpisodePreProd.join(', ')}
                              </p>
                            )}
                            {missingEpisodes.length === 0 && missingEpisodePreProd.length === 0 && (
                              <p className="text-xs text-[#e7e7e7]/50">
                                Complete all episodes and their pre-production to unlock
                              </p>
                            )}
                          </div>
                        )}

                        {canUnlock && (
                          <p className="text-xs text-[#10B981] font-medium">
                            ✓ Ready for production assistant! Click to open.
                          </p>
                        )}
                      </div>
                      
                      {canUnlock && (
                        <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenArcPreProduction(arcIndex)
                          }}
                            className="px-4 py-2 bg-[#10B981] text-black rounded-lg font-bold hover:bg-[#059669] transition-colors text-sm"
                        >
                          Open →
                        </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const currentStoryBibleId = storyBible?.id || searchParams.get('id') || searchParams.get('storyBibleId')
                              if (currentStoryBibleId) {
                                router.push(`/actor-materials/arc/${arcIndex}?storyBibleId=${currentStoryBibleId}`)
                              }
                            }}
                            className="px-4 py-2 bg-[#e2c376] text-black rounded-lg font-bold hover:bg-[#f0d995] transition-colors text-sm"
                            title="Actor Preparation Materials"
                          >
                            🎭 Materials
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Help Text */}
            <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#36393f]">
              <p className="text-xs text-[#e7e7e7]/60">
                <span className="font-medium text-[#10B981]">💡 Tip:</span> Production assistant becomes available once all episodes in an arc are generated and have completed their episode pre-production. This allows you to coordinate casting, scheduling, and budgeting across the entire arc.
              </p>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Episode Recovery Modal */}
      {user && currentStoryBibleId && (
        <EpisodeRecoveryPrompt
          isOpen={showRecoveryPrompt}
          recoverableEpisodes={recoverableEpisodes}
          storyBibleId={currentStoryBibleId}
          userId={user.id}
          onClose={() => setShowRecoveryPrompt(false)}
          onRecoveryComplete={() => {
            setShowRecoveryPrompt(false)
            // Reload episodes after recovery
            window.location.reload()
          }}
        />
      )}
      
      {/* Episode Generation Suite Modal */}
      {storyBible && currentStoryBibleId && (
        <EpisodeGenerationSuite
          isOpen={showGenerationSuite}
          onClose={() => setShowGenerationSuite(false)}
          episodeNumber={currentEpisodeNumber}
          storyBible={storyBible}
          storyBibleId={currentStoryBibleId}
          previousChoice={getPreviousEpisodeChoice()}
          onComplete={handleEpisodeGenerationComplete}
        />
      )}
    </motion.div>
  )
} 
