'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import AnimatedBackground from '@/components/AnimatedBackground'

interface UserChoice {
  episodeNumber: number
  choiceId: number
  choiceText: string
}

export default function WorkspacePage() {
  const router = useRouter()
  const [storyBible, setStoryBible] = useState<any>(null)
  const [userChoices, setUserChoices] = useState<UserChoice[]>([])
  const [loading, setLoading] = useState(true)
  const [activeArcIndex, setActiveArcIndex] = useState(0)
  const [lastViewedEpisode, setLastViewedEpisode] = useState(1)
  const [generatedEpisodes, setGeneratedEpisodes] = useState<Record<number, boolean>>({})
  const [highestGeneratedEpisode, setHighestGeneratedEpisode] = useState<number>(0)
  const [highestCompletedArc, setHighestCompletedArc] = useState<number>(0)
  const [completedArcs, setCompletedArcs] = useState<Record<number, boolean>>({})
  const [productionContentExists, setProductionContentExists] = useState<Record<number, boolean>>({})
  const [isClient, setIsClient] = useState(false)
  
  // Effect to set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Check if production content exists for an arc
  const checkProductionContent = (arcIndex: number): boolean => {
    try {
      const savedContent = localStorage.getItem('greenlit-preproduction-content') || localStorage.getItem('scorched-preproduction-content') || localStorage.getItem('reeled-preproduction-content')
      if (!savedContent) return false
      
      const parsedContent = JSON.parse(savedContent)
      // Check if any content exists for this arc
      const arcContentKeys = Object.keys(parsedContent).filter(key => key.startsWith(`arc${arcIndex}-`))
      return arcContentKeys.length > 0
    } catch (e) {
      return false
    }
  }
  
  useEffect(() => {
    const loadData = () => {
      try {
        // Load story bible - check both new and legacy keys
        const greenlitBible = localStorage.getItem('greenlit-story-bible')
        const scorchedBible = localStorage.getItem('scorched-story-bible')
        const reeledBible = localStorage.getItem('reeled-story-bible')
        const savedBible = greenlitBible || scorchedBible || reeledBible
        
        if (savedBible) {
          const parsed = JSON.parse(savedBible)
          setStoryBible(parsed.storyBible)
        } else {
          console.log('ℹ️ No story bible found in workspace, but allowing user to stay')
          // Don't redirect - let the workspace show empty state
        }
        
        // Load user choices
        const savedChoices = localStorage.getItem('greenlit-user-choices') || localStorage.getItem('scorched-user-choices') || localStorage.getItem('reeled-user-choices')
        if (savedChoices) {
          const choices = JSON.parse(savedChoices)
          setUserChoices(choices)
          
          // Find the last episode the user has viewed
          if (choices.length > 0) {
            const episodeNumbers = choices.map((c: UserChoice) => c.episodeNumber)
            const lastEpisode = Math.max(...episodeNumbers)
            setLastViewedEpisode(lastEpisode + 1)
            
            // ENHANCED: Calculate arc index based on actual arc structure, not fixed 10 episodes
            let currentArcIndex = 0
            let episodeCount = 0
            
            if (storyBible && storyBible.narrativeArcs) {
              for (let i = 0; i < storyBible.narrativeArcs.length; i++) {
                const arc = storyBible.narrativeArcs[i]
                const arcEpisodeCount = arc.episodes?.length || 10 // fallback to 10 if not specified
                
                if (lastEpisode <= episodeCount + arcEpisodeCount) {
                  currentArcIndex = i
                  break
                }
                episodeCount += arcEpisodeCount
              }
            }
            
            setActiveArcIndex(currentArcIndex)
            
            // Automatically mark arcs as completed based on actual arc structure
            const completedArcsData: Record<number, boolean> = {}
            
            if (storyBible && storyBible.narrativeArcs) {
              let runningEpisodeCount = 0
              
              // For each arc, check if all episodes are completed
              for (let arcIndex = 0; arcIndex < storyBible.narrativeArcs.length; arcIndex++) {
                const arc = storyBible.narrativeArcs[arcIndex]
                const arcEpisodeCount = arc.episodes?.length || 10
                const arcStartEpisode = runningEpisodeCount + 1
                const arcEndEpisode = runningEpisodeCount + arcEpisodeCount
                
              // Check if all episodes in this arc are completed
                const arcComplete = Array.from({ length: arcEpisodeCount }, (_, i) => {
                  const episodeNumber = arcStartEpisode + i
                return choices.some((c: UserChoice) => c.episodeNumber === episodeNumber)
              }).every(Boolean)
              
              if (arcComplete) {
                  console.log(`Arc ${arcIndex + 1} is complete based on user choices (${arcEpisodeCount} episodes)`)
                completedArcsData[arcIndex] = true
                
                // Save to localStorage
                localStorage.setItem('greenlit-completed-arcs', JSON.stringify(completedArcsData))
                }
                
                runningEpisodeCount += arcEpisodeCount
              }
            }
            
            // Set the completed arcs
            setCompletedArcs(completedArcsData)
          }
        }
        
        // Load generated episodes
        const savedEpisodes = localStorage.getItem('greenlit-episodes') || localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes')
        if (savedEpisodes) {
          const episodes = JSON.parse(savedEpisodes)
          const episodeIds = Object.keys(episodes).map(Number)
          
          // Track which episodes have been generated
          const episodeStatus: Record<number, boolean> = {}
          episodeIds.forEach(id => {
            episodeStatus[id] = true
          })
          setGeneratedEpisodes(episodeStatus)
          
          // Find highest generated episode
          if (episodeIds.length > 0) {
            const maxEpisode = Math.max(...episodeIds)
            setHighestGeneratedEpisode(maxEpisode)
            
            // Calculate highest completed arc based on actual arc episode counts
            let highestArc = 0
            let runningEpisodeCount = 0
            
                         if (storyBible && storyBible.narrativeArcs) {
               for (let arcIndex = 0; arcIndex < storyBible.narrativeArcs.length; arcIndex++) {
                 const arc = storyBible.narrativeArcs[arcIndex]
                const arcEpisodeCount = arc.episodes?.length || 10
                
                if (maxEpisode <= runningEpisodeCount + arcEpisodeCount) {
                  highestArc = arcIndex
                  break
                }
                runningEpisodeCount += arcEpisodeCount
              }
              
                             // Check if the current arc is complete
               const currentArc = storyBible.narrativeArcs[highestArc]
              if (currentArc) {
                const arcEpisodeCount = currentArc.episodes?.length || 10
                const arcStartEpisode = runningEpisodeCount + 1
                const arcEndEpisode = runningEpisodeCount + arcEpisodeCount
                
                const isArcComplete = Array(arcEpisodeCount).fill(0).every((_, i) => {
                  const episodeInArc = arcStartEpisode + i
              return episodeStatus[episodeInArc] || episodeInArc > maxEpisode
            })
            
            setHighestCompletedArc(isArcComplete ? highestArc : Math.max(0, highestArc - 1))
              }
            } else {
              // Fallback to old calculation if no arc structure
              highestArc = Math.floor((maxEpisode - 1) / 10)
              const isArcComplete = Array(10).fill(0).every((_, i) => {
                const episodeInArc = highestArc * 10 + i + 1
                return episodeStatus[episodeInArc] || episodeInArc > maxEpisode
              })
              setHighestCompletedArc(isArcComplete ? highestArc : Math.max(0, highestArc - 1))
            }
          }
        }
        
        // Load completed arcs
        const savedCompletedArcs = localStorage.getItem('greenlit-completed-arcs') || localStorage.getItem('scorched-completed-arcs') || localStorage.getItem('reeled-completed-arcs')
        if (savedCompletedArcs) {
          try {
            const arcsData = JSON.parse(savedCompletedArcs)
            console.log('Loaded completed arcs from localStorage:', arcsData)
            setCompletedArcs(arcsData)
          } catch (e) {
            console.error('Error parsing completed arcs:', e)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        // Check production content existence for all arcs
        const productionStatus: Record<number, boolean> = {}
        if (storyBible && storyBible.narrativeArcs) {
          storyBible.narrativeArcs.forEach((_: any, index: number) => {
            productionStatus[index] = checkProductionContent(index)
          })
        }
        setProductionContentExists(productionStatus)
        
        setLoading(false)
      }
    }
    
    loadData()
  }, [router])

  // Check if an arc is completed
  const isArcCompleted = (arcIndex: number): boolean => {
    // Check both saved completed arcs and user choices
    if (Boolean(completedArcs[arcIndex])) {
      return true
    }
    
    // Check if all episodes in this arc have been completed based on actual arc structure
    if (userChoices.length > 0 && storyBible && storyBible.narrativeArcs) {
      let runningEpisodeCount = 0
      
      // Calculate the actual episode range for this arc
      for (let i = 0; i < arcIndex; i++) {
        const arc = storyBible.narrativeArcs[i]
        runningEpisodeCount += arc.episodes?.length || 10
      }
      
      const currentArc = storyBible.narrativeArcs[arcIndex]
      if (!currentArc) return false
      
      const arcEpisodeCount = currentArc.episodes?.length || 10
      const arcStartEpisode = runningEpisodeCount + 1
      const arcEndEpisode = runningEpisodeCount + arcEpisodeCount
      
      // Check if we have choices for all episodes in this arc
      const episodesInArc = Array.from({ length: arcEpisodeCount }, (_, i) => arcStartEpisode + i)
      const completedInArc = episodesInArc.filter(epNum => 
        userChoices.some(choice => choice.episodeNumber === epNum)
      )
      
      const isComplete = completedInArc.length === arcEpisodeCount
      if (isComplete) {
        // Update local state
        const updatedCompletedArcs = { ...completedArcs }
        updatedCompletedArcs[arcIndex] = true
        setCompletedArcs(updatedCompletedArcs)
        
        // Save to localStorage
        localStorage.setItem('greenlit-completed-arcs', JSON.stringify(updatedCompletedArcs))
        
        return true
      }
    }
    
    return false
  }

  // Check if an episode is generated
  const isEpisodeGenerated = (episodeNumber: number): boolean => {
    return Boolean(generatedEpisodes[episodeNumber])
  }
  
  // Check if an episode is accessible (previous episode is generated)
  const isEpisodeAccessible = (episodeNumber: number): boolean => {
    if (episodeNumber === 1) return true
    return isEpisodeGenerated(episodeNumber - 1)
  }
  
  // Check if an arc is accessible (previous arc is completed)
  const isArcAccessible = (arcIndex: number): boolean => {
    if (arcIndex === 0) return true
    return highestCompletedArc >= arcIndex - 1
  }
  
  // Check if an arc is locked (previous arc not completed)
  const isArcLocked = (arcIndex: number): boolean => {
    return !isArcAccessible(arcIndex)
  }
  
  // Handle starting production for an arc
  const handleStartProduction = (arcIndex: number) => {
    try {
      // Get all workspace episodes - USE CORRECT GREENLIT KEYS
      const savedEpisodes = localStorage.getItem('greenlit-episodes') || localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes')
      const workspaceEpisodes = savedEpisodes ? JSON.parse(savedEpisodes) : {}
      
      // Get updated story bible with user choice adaptations and mode - USE CORRECT GREENLIT KEYS
      const savedBible = localStorage.getItem('greenlit-story-bible') || localStorage.getItem('scorched-story-bible') || localStorage.getItem('reeled-story-bible')
      const currentStoryBible = savedBible ? JSON.parse(savedBible).storyBible : storyBible
      
      // Get user's original mode choice from the same saved bible data
      let userMode = 'beast' // default fallback
      if (savedBible) {
        try {
          const parsed = JSON.parse(savedBible)
          userMode = parsed.creativeMode || 'beast'
          console.log(`Using user's chosen mode: ${userMode}`)
        } catch (e) {
          console.warn('Could not parse saved bible for mode, using beast mode')
        }
      }

      // Filter episodes for the specific arc using actual arc structure
      let arcStartEpisode = 1
      let arcEndEpisode = 10
      
      if (currentStoryBible && currentStoryBible.narrativeArcs) {
        let runningEpisodeCount = 0
        
        // Calculate actual episode range for this arc
        for (let i = 0; i < arcIndex; i++) {
          const arc = currentStoryBible.narrativeArcs[i]
          runningEpisodeCount += arc.episodes?.length || 10
        }
        
        const targetArc = currentStoryBible.narrativeArcs[arcIndex]
        if (targetArc) {
          const arcEpisodeCount = targetArc.episodes?.length || 10
          arcStartEpisode = runningEpisodeCount + 1
          arcEndEpisode = runningEpisodeCount + arcEpisodeCount
        }
      } else {
        // Fallback to old calculation if no arc structure
        arcStartEpisode = arcIndex * 10 + 1
        arcEndEpisode = arcIndex * 10 + 10
      }
      
      const arcEpisodes = Object.values(workspaceEpisodes)
        .filter((ep: any) => ep.episodeNumber >= arcStartEpisode && ep.episodeNumber <= arcEndEpisode)
        .sort((a: any, b: any) => a.episodeNumber - b.episodeNumber)

      // Prepare comprehensive data for pre-production
      const preProductionData = {
        arcIndex,
        storyBible: currentStoryBible,
        workspaceEpisodes: workspaceEpisodes,
        arcEpisodes: arcEpisodes,
        userChoices: userChoices,
        generatedEpisodes: generatedEpisodes,
        completedArcs: completedArcs,
        mode: userMode // Pass user's original mode choice
      }

      // Store comprehensive data for pre-production access
      localStorage.setItem('greenlit-preproduction-data', JSON.stringify(preProductionData))
      
    // Save the arc index to local storage so the results page knows which arc to show
    localStorage.setItem('greenlit-production-arc', arcIndex.toString())
      
    // Set flag to auto-generate content
    localStorage.setItem('greenlit-auto-generate', 'true')
      
      console.log(`Starting production for Arc ${arcIndex + 1} with ${arcEpisodes.length} workspace episodes`)
      
    // Navigate to V2 pre-production with the arc parameter
    router.push(`/preproduction/v2?arc=${arcIndex + 1}`)
    } catch (error) {
      console.error('Error preparing production data:', error)
      // Fallback to basic production start
      localStorage.setItem('greenlit-production-arc', arcIndex.toString())
      localStorage.setItem('greenlit-auto-generate', 'true')
      router.push(`/preproduction/v2?arc=${arcIndex + 1}`)
    }
  }

  const handleContinue = () => {
    // Automatically update story bible with latest episodes before continuing
    try {
      const savedEpisodes = localStorage.getItem('greenlit-episodes') || localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes')
      const savedBible = localStorage.getItem('greenlit-story-bible') || localStorage.getItem('scorched-story-bible') || localStorage.getItem('reeled-story-bible')
      
      if (savedEpisodes && savedBible) {
        const episodes = JSON.parse(savedEpisodes)
        const bibleData = JSON.parse(savedBible)
        
        // Update story bible with latest episode developments
        const episodeArray = Object.values(episodes)
        if (episodeArray.length > 0) {
          // This would trigger the dynamic adaptation in story-bible page
          console.log('Auto-updating story bible with', episodeArray.length, 'episodes')
        }
      }
    } catch (error) {
      console.error('Error updating story bible:', error)
    }
    
    // Find the next episode to continue from
    const highestCompletedEpisode = userChoices.length > 0 
      ? Math.max(...userChoices.map(c => c.episodeNumber)) 
      : 0
      
    const nextEpisode = highestCompletedEpisode + 1
    const totalEpisodes = storyBible.narrativeArcs?.reduce((total: number, arc: any) => total + (arc.episodes?.length || 10), 0) || 60
    
    if (nextEpisode <= totalEpisodes) {
      // Route to Episode Studio for enhanced two-stage generation
      router.push(`/episode-studio/${nextEpisode}`)
    } else {
      // Series is complete
      alert('You have completed all episodes!')
    }
  }
  
  const handleRestart = () => {
    if (confirm('Are you sure you want to restart? This will clear all your choices and episodes.')) {
      console.log('🔄 Starting complete story restart...')
      
      // Clear ALL episode and choice data
      const keysToRemove = [
        'greenlit-user-choices',
        'greenlit-episodes', 
        'greenlit-completed-arcs',
        'scorched-user-choices',
        'scorched-episodes',
        'scorched-completed-arcs',
        'reeled-user-choices',
        'reeled-episodes',
        'reeled-completed-arcs'
      ]
      
      let cleared = 0
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
          console.log(`🗑️ Removed: ${key}`)
          cleared++
        }
      })
      
      // Reset all state
      setUserChoices([])
      setLastViewedEpisode(1)
      setActiveArcIndex(0)
      setGeneratedEpisodes({})
      setHighestGeneratedEpisode(0)
      setHighestCompletedArc(0)
      setCompletedArcs({})
      setProductionContentExists({})
      
      console.log(`✅ Cleared ${cleared} keys - story restarted!`)
      alert(`✅ Story restarted! Cleared ${cleared} keys. You can now start fresh from Episode 1.`)
    }
  }

  const handleResetPreProduction = () => {
    if (confirm('Are you sure you want to reset pre-production results? This will clear all generated pre-production content and allow you to regenerate it.')) {
      console.log('🗑️ Starting comprehensive pre-production cleanup...')
      console.log('🔍 Current localStorage keys:', Object.keys(localStorage))

      // Keys to clear (pre-production content only)
      const keysToRemove = [
        'greenlit-preproduction-content',
        'greenlit-preproduction-data',
        'reeled-preproduction-data',
        'reeled-preproduction-content',
        'scorched-preproduction-content',
        'scorched-preproduction-data',
        'greenlit-preproduction-0',  // Arc-specific keys
        'greenlit-preproduction-1',
        'greenlit-preproduction-2',
        'greenlit-preproduction-3',
        'greenlit-preproduction-4',
        'reeled-preproduction-0',
        'reeled-preproduction-1',
        'reeled-preproduction-2',
        'reeled-preproduction-3',
        'reeled-preproduction-4',
        'scorched-preproduction-0',
        'scorched-preproduction-1',
        'scorched-preproduction-2',
        'scorched-preproduction-3',
        'scorched-preproduction-4'
      ]

      let cleared = 0
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
          console.log(`🗑️ Removed: ${key}`)
          cleared++
        }
      })

      // Also check for any other preproduction keys dynamically
      Object.keys(localStorage).forEach(key => {
        if ((key.includes('preproduction') || key.includes('preProduction')) && 
            !key.includes('story-bible') && 
            !key.includes('episodes') &&
            !key.includes('workspace-episodes')) {
          localStorage.removeItem(key)
          console.log(`🗑️ Removed (dynamic): ${key}`)
          cleared++
        }
      })
      
      // Reset production content existence flags
      setProductionContentExists({})
      
      console.log(`✅ Cleared ${cleared} pre-production keys`)
      console.log('📖 Preserved story bible and episodes data')
      console.log('🔍 Remaining localStorage keys:', Object.keys(localStorage))
      
      // Show success message
      alert(`✅ Pre-production cleared! Removed ${cleared} keys while preserving story bible and episodes. Ready to regenerate fresh content!`)
    }
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

  // Helper: format and derive concise arc synopsis
  const formatArcSynopsis = (text: string) => {
    if (!text) return 'Synopsis forthcoming.';
    // Remove boilerplate like "Narrative arc 1:" or "Arc 1:"
    let s = text
      .replace(/^Narrative\s*arc\s*\d*\s*[:\-]?\s*/i, '')
      .replace(/^Arc\s*\d*\s*[:\-]?\s*/i, '')
      .replace(/^exploring\s+/i, '')
      .trim();

    // Keep only the first sentence; cap length
    const m = s.match(/(.+?[.!?])(\s|$)/);
    if (m) s = m[1].trim();
    if (s.length > 220) s = s.slice(0, 217).trimEnd() + '...';
    if (!/[.!?]$/.test(s)) s += '.';
    return s;
  };

  // Arc synopsis from provided summary or fallback to episode summaries
  const getArcSynopsis = (arc: any) => {
    const s = arc?.summary?.toString().trim();
    if (s) return formatArcSynopsis(s);
    const eps = (arc?.episodes || []).map((e: any) => e?.summary).filter(Boolean);
    if (eps.length >= 1) return formatArcSynopsis(eps[0]);
    return 'Synopsis forthcoming.';
  };

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
        {/* Revolutionary Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Fire Icon */}
          <motion.div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.6, 1, 0.6],
                filter: [
                  "brightness(1) drop-shadow(0 0 10px rgba(0, 255, 153, 0.3))",
                  "brightness(1.2) drop-shadow(0 0 20px rgba(0, 255, 153, 0.6))",
                  "brightness(1) drop-shadow(0 0 10px rgba(0, 255, 153, 0.3))"
                ]
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
          
          {/* Series Title */}
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 font-medium greenlit-gradient"
            initial={{ letterSpacing: "-0.1em", opacity: 0 }}
            animate={{ letterSpacing: "0.02em", opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            {storyBible.seriesTitle || "YOUR GREENLIT SERIES"}
          </motion.h1>

          {/* Revolutionary Subtitle */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="space-y-4"
          >
            <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed font-medium">
              Your professional workspace where <span className="text-[#00FF99] font-bold">epic stories come to life</span> through AI-powered narrative generation
            </p>
            
            {/* Revolutionary Stats */}
            <motion.div 
              className="flex flex-wrap justify-center gap-6 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
            {storyBible.mainCharacters && (
                <div className="px-4 py-2 bg-gradient-to-r from-[#00FF99]/20 to-[#00CC7A]/20 border border-[#00FF99]/30 rounded-xl">
                  <span className="text-[#00FF99] font-bold text-sm font-medium">{storyBible.mainCharacters.length} MAIN CHARACTERS</span>
                </div>
              )}
              <div className="px-4 py-2 bg-gradient-to-r from-[#00FF99]/20 to-[#00CC7A]/20 border border-[#00FF99]/30 rounded-xl">
                <span className="text-[#00FF99] font-bold text-sm font-medium">{(storyBible.narrativeArcs?.reduce((total: number, arc: any) => total + (arc.episodes?.length || 10), 0)) || '40-80'} EPISODES</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-[#00FF99]/20 to-[#00CC7A]/20 border border-[#00FF99]/30 rounded-xl">
                <span className="text-[#00FF99] font-bold text-sm font-medium">{userChoices.length} CHOICES MADE</span>
          </div>
            </motion.div>
          </motion.div>
        </motion.div>
          
        {/* Revolutionary Progress Overview */}
        <motion.div
          className="mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <div className="bg-[#1e1e1e] border border-[#36393f] rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#00FF99] mb-2 font-medium cinematic-header">PROFESSIONAL PROGRESS</h2>
                <p className="text-white/90 font-medium">
                  {userChoices.length} of {storyBible.narrativeArcs?.reduce((total: number, arc: any) => total + (arc.episodes?.length || 10), 0) || '40-80'} episodes completed
                </p>
              </div>
              
              <div className="flex gap-4">
                <motion.button
                  onClick={() => router.push('/story-bible')}
                  className="px-6 py-3 border-2 border-[#00FF99] text-[#00FF99] rounded-xl font-bold elegant-fire hover:bg-[#00FF99]/10 transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📖 View Story Bible
                </motion.button>
                <motion.button
                  onClick={handleContinue}
                  className="burn-button px-8 py-3 text-lg font-bold"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 elegant-fire">⚡ CONTINUE STORY</span>
                </motion.button>
              </div>
            </div>
            
            {/* Revolutionary Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-white/70 elegant-fire">
                <span>Episode 1</span>
                <span>Episode {storyBible.narrativeArcs?.reduce((total: number, arc: any) => total + (arc.episodes?.length || 10), 0) || '40-80'}</span>
              </div>
              <div className="h-4 bg-[#2a2a2a] rounded-full overflow-hidden border border-[#00FF99]/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#00FF99] via-[#00CC7A] to-[#00FF99] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(userChoices.length / (storyBible.narrativeArcs?.reduce((total: number, arc: any) => total + (arc.episodes?.length || 10), 0) || 60)) * 100}%` }}
                  transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Revolutionary Narrative Arcs Navigation */}
        <motion.div 
          className="mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-[#00FF99] mb-6 text-center font-medium cinematic-header">NARRATIVE ARCS</h2>
          <div className="flex overflow-x-auto pb-2 gap-2">
            {storyBible.narrativeArcs?.map((arc: any, index: number) => {
              const isLocked = isArcLocked(index);
              const isCompleted = isArcCompleted(index);
              
              return (
              <button
                key={index}
                  onClick={() => !isLocked && setActiveArcIndex(index)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors relative ${
                  activeArcIndex === index 
                    ? 'bg-[#00FF99] text-black font-medium' 
                    : isCompleted 
                        ? 'bg-[#2a2a2a] text-[#00FF99] border border-[#00FF9940]'
                        : isLocked
                          ? 'bg-[#2a2a2a]/60 text-[#e7e7e7]/40 cursor-not-allowed'
                    : 'bg-[#2a2a2a] text-[#e7e7e7] hover:bg-[#36393f]'
                }`}
                  disabled={isLocked}
              >
                  {isCompleted && (
                    <span className="inline-block w-2 h-2 rounded-full bg-[#00FF99] mr-1"></span>
                  )}
                Arc {index + 1}: {arc.title}
                  
                  {/* Frosted glass effect for locked arcs */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-[#1a1a1a]/70 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#e7e7e7]/70 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs text-[#e7e7e7]/70">Locked</span>
                      </div>
                    </div>
                  )}
              </button>
              );
            })}
          </div>
        </motion.div>
        
        {/* Active Arc Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeArcIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            {storyBible.narrativeArcs[activeArcIndex] && (
              <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                  <div>
                <h3 className="text-2xl font-bold text-[#00FF99] mb-2">
                  {storyBible.narrativeArcs[activeArcIndex].title}
                </h3>
                    <p className="text-[#e7e7e7]/90 max-w-3xl">
                  {getArcSynopsis(storyBible.narrativeArcs[activeArcIndex])}
                </p>
                  </div>
                  
                  {/* Production button for completed arcs */}
                  {isArcCompleted(activeArcIndex) && (
                    <div className="mt-4 md:mt-0">
                      <motion.button
                        onClick={() => handleStartProduction(activeArcIndex)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-5 py-3 font-bold rounded-lg shadow-lg flex items-center ${
                          productionContentExists[activeArcIndex] 
                            ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white' 
                            : 'bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-black'
                        }`}
                      >
                        {productionContentExists[activeArcIndex] ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                        {productionContentExists[activeArcIndex] ? 'See Production' : 'Start Production'}
                      </motion.button>
                    </div>
                  )}
                </div>
                
                {/* Episodes Grid */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-3">Episodes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {storyBible.narrativeArcs[activeArcIndex]?.episodes?.map((episodeData: any, episodeIndex: number) => {
                      // Calculate the actual episode number for this arc
                      let runningEpisodeCount = 0;
                      for (let i = 0; i < activeArcIndex; i++) {
                        const arc = storyBible.narrativeArcs[i];
                        runningEpisodeCount += arc.episodes?.length || 10;
                      }
                      const episodeNumber = runningEpisodeCount + episodeIndex + 1;
                      const hasCompleted = userChoices.some(choice => choice.episodeNumber === episodeNumber);
                      const isNext = episodeNumber === lastViewedEpisode;
                      const episodeDetails = storyBible.narrativeArcs[activeArcIndex].episodes?.find(
                        (e: any) => e.number === episodeIndex + 1 || parseInt(e.number) === episodeIndex + 1
                      );
                      
                      // Check if this episode is accessible
                      const isAccessible = isEpisodeAccessible(episodeNumber);
                      const isGenerated = isEpisodeGenerated(episodeNumber);
                      
                      // Content for the episode card
                      const EpisodeCard = () => (
                        <div className={`border rounded-lg p-4 transition-all relative ${
                            hasCompleted 
                              ? 'bg-[#00FF9915] border-[#00FF9940] hover:border-[#00FF99]' 
                              : isNext
                                ? 'bg-[#2a2a2a] border-[#00FF9940] hover:border-[#00FF99]'
                                : 'bg-[#2a2a2a] border-[#36393f] hover:border-[#00FF9940]'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              hasCompleted 
                                ? 'bg-[#00FF99] text-black' 
                                : isNext
                                  ? 'bg-[#00FF9940] text-[#00FF99]'
                                  : 'bg-[#36393f] text-[#e7e7e7]/70'
                            }`}>
                              {episodeNumber}/{storyBible.narrativeArcs?.reduce((total: number, arc: any) => total + (arc.episodes?.length || 10), 0) || '40-80'}
                            </span>
                            {hasCompleted && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#00FF99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          
                          <h5 className="font-medium mb-1">
                            {episodeDetails?.title || `Episode ${episodeIndex + 1}`}
                          </h5>
                          
                          {episodeDetails?.summary && (
                            <p className="text-xs text-[#e7e7e7]/70 line-clamp-2">
                              {episodeDetails.summary}
                            </p>
                          )}
                          
                          {/* Show user choice if made */}
                          {hasCompleted && (
                            <div className="mt-2 pt-2 border-t border-[#36393f] text-xs">
                              <div className="text-[#e7e7e7]/50">Your choice:</div>
                              <div className="text-[#00FF99]">
                                {userChoices.find(c => c.episodeNumber === episodeNumber)?.choiceText || "Choice made"}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                      
                      // Return a link or a locked card
                      return (
                        <div key={episodeIndex} className="relative">
                          {isAccessible ? (
                            <Link href={`/episode/${episodeNumber}`}>
                              <EpisodeCard />
                        </Link>
                          ) : (
                            <div className="cursor-not-allowed">
                              <EpisodeCard />
                              {/* Frosted glass effect for locked episodes */}
                              <div className="absolute inset-0 bg-[#1a1a1a]/70 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <div className="inline-flex items-center justify-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#e7e7e7]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  </div>
                                  <span className="text-xs text-[#e7e7e7]/70">
                                    {episodeNumber > 1 ? "Complete previous episode first" : "Locked"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Revolutionary Tools and Actions */}
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 mb-12">
          <h3 className="text-lg font-bold mb-4">Story Management</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button
              onClick={handleRestart}
              className="p-4 bg-[#2a2a2a] border border-[#36393f] rounded-lg hover:bg-[#36393f] transition-colors"
            >
              <div className="font-medium mb-1">🔄 Clear Episodes</div>
              <div className="text-xs text-[#e7e7e7]/70">Clear all episodes, choices, and progress - start fresh</div>
            </button>
            
            <button
              onClick={handleResetPreProduction}
              className="p-4 bg-[#2a2a2a] border border-[#00FF99] rounded-lg hover:bg-[#00FF99] hover:text-black transition-colors"
            >
              <div className="font-medium mb-1">🗑️ Clear Pre-Production</div>
              <div className="text-xs text-[#e7e7e7]/70">Remove all cached pre-production data (preserves story bible & episodes)</div>
            </button>
            
            <button
              onClick={() => router.push('/story-bible')}
              className="p-4 bg-[#2a2a2a] border border-[#36393f] rounded-lg hover:bg-[#36393f] transition-colors"
            >
              <div className="font-medium mb-1">View Story Bible</div>
              <div className="text-xs text-[#e7e7e7]/70">Review your series characters, arcs and world-building</div>
            </button>
            
            <button
              onClick={() => router.push('/projects')}
              className="p-4 bg-[#2a2a2a] border border-[#e2c37640] rounded-lg hover:bg-[#e2c37620] transition-colors"
            >
              <div className="font-medium mb-1 text-[#00FF99]">Project Workspace</div>
              <div className="text-xs text-[#e7e7e7]/70">Access complete pre-production tools</div>
            </button>
            
            <button
              onClick={() => window.print()}
              className="p-4 bg-[#2a2a2a] border border-[#36393f] rounded-lg hover:bg-[#36393f] transition-colors"
            >
              <div className="font-medium mb-1">Export Story</div>
              <div className="text-xs text-[#e7e7e7]/70">Print or save your story as PDF</div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 