'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from '@/components/ui/ClientMotion'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { getStoryBible } from '@/services/story-bible-service'
import { getEpisodesForStoryBible, Episode } from '@/services/episode-service'
import { getEpisodePreProduction, getEpisodeRangeForArc } from '@/services/preproduction-firestore'
import { getActorMaterials } from '@/services/actor-materials-firestore'
import DashboardStats from '@/components/dashboard/DashboardStats'
import QuickAccessCards from '@/components/dashboard/QuickAccessCards'
import EpisodeGenerationSuite from '@/components/workspace/EpisodeGenerationSuite'
import ShareInvestorMaterialsModal from '@/components/share/ShareInvestorMaterialsModal'

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  
  const [storyBible, setStoryBible] = useState<any>(null)
  const [episodes, setEpisodes] = useState<Record<number, Episode>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Stats
  const [stats, setStats] = useState({
    totalEpisodes: 0,
    generatedEpisodes: 0,
    preProductionCompleted: 0,
    arcsReadyForProduction: 0
  })

  // Generation Suite Modal
  const [showGenerationSuite, setShowGenerationSuite] = useState(false)
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState(1)
  
  // Share Modal
  const [showShareModal, setShowShareModal] = useState(false)
  
  // Window dimensions for particles
  const [windowHeight, setWindowHeight] = useState(800)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowHeight(window.innerHeight)
      const handleResize = () => setWindowHeight(window.innerHeight)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Get next episode number
  const getNextEpisodeNumber = () => {
    const episodeNumbers = Object.keys(episodes).map(Number).sort((a, b) => b - a)
    return episodeNumbers.length > 0 ? episodeNumbers[0] + 1 : 1
  }

  const handleOpenGenerationSuite = () => {
    console.log('handleOpenGenerationSuite called')
    const nextEp = getNextEpisodeNumber()
    console.log('Next episode number:', nextEp)
    console.log('storyBible:', !!storyBible)
    console.log('storyBibleId:', storyBibleId)
    setCurrentEpisodeNumber(nextEp)
    setShowGenerationSuite(true)
    console.log('showGenerationSuite set to true')
  }

  const handleGenerationComplete = async () => {
    setShowGenerationSuite(false)
    // Reload episodes and recalculate stats
    const storyBibleId = storyBible?.id || searchParams.get('id')
    if (storyBibleId && user?.id && storyBible) {
      const loadedEpisodes = await getEpisodesForStoryBible(storyBibleId, user.id)
      setEpisodes(loadedEpisodes)
      const episodeList = Object.values(loadedEpisodes)
      
      // Recalculate all stats (same logic as in useEffect)
      let totalEpisodes = 0
      if (storyBible?.narrativeArcs) {
        totalEpisodes = storyBible.narrativeArcs.reduce((sum: number, arc: any) => {
          return sum + (arc.episodes?.length || 10)
        }, 0)
      }
      
      const generatedEpisodes = episodeList.length
      
      let preProductionCompleted = 0
      for (const episode of episodeList) {
        try {
          const preProd = await getEpisodePreProduction(user.id, storyBibleId, episode.episodeNumber)
          if (preProd) {
            preProductionCompleted++
          }
        } catch (error) {
          // Continue
        }
      }
      
      let arcsReadyForProduction = 0
      if (storyBible?.narrativeArcs) {
        for (let arcIndex = 0; arcIndex < storyBible.narrativeArcs.length; arcIndex++) {
          const episodeNumbers = getEpisodeRangeForArc(storyBible, arcIndex)
          
          let allEpisodesHavePreProd = true
          for (const epNum of episodeNumbers) {
            if (!loadedEpisodes[epNum]) {
              allEpisodesHavePreProd = false
              break
            }
            
            try {
              const preProd = await getEpisodePreProduction(user.id, storyBibleId, epNum)
              if (!preProd) {
                allEpisodesHavePreProd = false
                break
              }
            } catch (error) {
              allEpisodesHavePreProd = false
              break
            }
          }
          
          if (allEpisodesHavePreProd) {
            try {
              const actorMaterials = await getActorMaterials(user.id, storyBibleId, arcIndex)
              if (actorMaterials) {
                arcsReadyForProduction++
              }
            } catch (error) {
              // Continue
            }
          }
        }
      }
      
      setStats({ 
        totalEpisodes, 
        generatedEpisodes, 
        preProductionCompleted, 
        arcsReadyForProduction 
      })
    }
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

  // Redirect if not authenticated (but allow guests with story bible in localStorage)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Check if guest has a story bible in localStorage
      const localBible = localStorage.getItem('greenlit-story-bible')
      if (!localBible) {
        // No story bible, redirect to login
        const storyBibleId = searchParams.get('id')
        const redirectPath = storyBibleId ? `/dashboard?id=${storyBibleId}` : '/dashboard'
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`)
      }
      // If they have a story bible, allow them to stay (they can view it)
    }
  }, [isAuthenticated, authLoading, router, searchParams])

  // Load story bible and episodes
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return
      
      try {
        setLoading(true)
        const storyBibleId = searchParams.get('id')
        
        // Allow guest users to access dashboard if they have a story bible in localStorage
        if (!isAuthenticated && !storyBibleId) {
          // Check if there's a story bible in localStorage for guest users
          const localBible = localStorage.getItem('greenlit-story-bible')
          if (!localBible) {
            setError('No story bible found. Please generate a story bible first.')
            setLoading(false)
            return
          }
        }
        
        // For authenticated users, require an ID
        if (isAuthenticated && !storyBibleId) {
          setError('No story bible ID provided')
          setLoading(false)
          return
        }

        // Load story bible
        // Check both useAuth hook and Firebase auth directly (fallback for cross-device issues)
        let userIdToUse = user?.id
        if (!userIdToUse && typeof window !== 'undefined') {
          try {
            const { auth } = await import('@/lib/firebase')
            const currentUser = auth.currentUser
            if (currentUser) {
              userIdToUse = currentUser.uid
              console.log('🔍 Dashboard: useAuth returned null, but Firebase auth.currentUser exists:', userIdToUse)
            }
          } catch (authError) {
            console.error('❌ Error checking Firebase auth in dashboard:', authError)
          }
        }

        let loadedBible: any = null
        if (userIdToUse && storyBibleId) {
          // Try to load from Firestore
          const bible = await getStoryBible(storyBibleId, userIdToUse)
          if (bible) {
            loadedBible = bible
            setStoryBible(bible)
          } else {
            // Fallback to localStorage
            const localBible = localStorage.getItem('greenlit-story-bible')
            if (localBible) {
              const parsed = JSON.parse(localBible)
              loadedBible = parsed.storyBible || parsed
              setStoryBible(loadedBible)
            } else {
              setError('Story bible not found')
              setLoading(false)
              return
            }
          }
        } else {
          // Guest mode or no userId - load from localStorage
          const localBible = localStorage.getItem('greenlit-story-bible')
          if (localBible) {
            const parsed = JSON.parse(localBible)
            loadedBible = parsed.storyBible || parsed
            setStoryBible(loadedBible)
          } else {
            setError('Story bible not found')
            setLoading(false)
            return
          }
        }

        // Load episodes (use storyBibleId from URL or from loaded story bible)
        const bibleIdForEpisodes = storyBibleId || loadedBible?.id || ''
        let loadedEpisodes: Record<number, Episode> = {}
        if (bibleIdForEpisodes) {
          loadedEpisodes = await getEpisodesForStoryBible(bibleIdForEpisodes, userIdToUse)
          setEpisodes(loadedEpisodes)
        } else {
          // No episodes for guest users without ID
          setEpisodes({})
        }

        // Calculate stats
        const episodeList = Object.values(loadedEpisodes)
        
        // 1. Total episodes from story bible (sum of all arc episodes)
        let totalEpisodes = 0
        if (loadedBible?.narrativeArcs) {
          totalEpisodes = loadedBible.narrativeArcs.reduce((sum: number, arc: any) => {
            return sum + (arc.episodes?.length || 10)
          }, 0)
        }
        
        // 2. Generated episodes (episodes that exist)
        const generatedEpisodes = episodeList.length
        
        // 3. Pre-production completed (episodes with pre-production data)
        let preProductionCompleted = 0
        if (bibleIdForEpisodes && userIdToUse) {
          // Check pre-production for all generated episodes
          for (const episode of episodeList) {
            try {
              const preProd = await getEpisodePreProduction(userIdToUse, bibleIdForEpisodes, episode.episodeNumber)
              if (preProd) {
                preProductionCompleted++
              }
            } catch (error) {
              // Episode doesn't have pre-production, continue
            }
          }
        }
        
        // 4. Arcs ready for production (all episodes have pre-prod + actor materials exist)
        let arcsReadyForProduction = 0
        if (loadedBible?.narrativeArcs && bibleIdForEpisodes && userIdToUse) {
          for (let arcIndex = 0; arcIndex < loadedBible.narrativeArcs.length; arcIndex++) {
            const episodeNumbers = getEpisodeRangeForArc(loadedBible, arcIndex)
            
            // Check if all episodes in arc have pre-production
            let allEpisodesHavePreProd = true
            for (const epNum of episodeNumbers) {
              // Episode must exist
              if (!loadedEpisodes[epNum]) {
                allEpisodesHavePreProd = false
                break
              }
              
              // Episode must have pre-production
              try {
                const preProd = await getEpisodePreProduction(userIdToUse, bibleIdForEpisodes, epNum)
                if (!preProd) {
                  allEpisodesHavePreProd = false
                  break
                }
              } catch (error) {
                allEpisodesHavePreProd = false
                break
              }
            }
            
            // If all episodes have pre-prod, check if actor materials exist
            if (allEpisodesHavePreProd) {
              try {
                const actorMaterials = await getActorMaterials(userIdToUse, bibleIdForEpisodes, arcIndex)
                if (actorMaterials) {
                  arcsReadyForProduction++
                }
              } catch (error) {
                // Actor materials don't exist, arc is not ready
              }
            }
          }
        }

        setStats({ 
          totalEpisodes, 
          generatedEpisodes, 
          preProductionCompleted, 
          arcsReadyForProduction 
        })
        
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [searchParams, user, authLoading])

  // Calculate storyBibleId early (before early returns)
  const storyBibleId = storyBible?.id || searchParams.get('id') || ''
  
  // Debug logging (must be before early returns)
  useEffect(() => {
    console.log('🔍 Dashboard Debug:')
    console.log('  - storyBible?.id:', storyBible?.id)
    console.log('  - searchParams.get("id"):', searchParams.get('id'))
    console.log('  - storyBibleId:', storyBibleId)
  }, [storyBible?.id, searchParams, storyBibleId])

  if (loading) {
    return (
      <div className={`min-h-screen ${prefix}-bg-primary flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 border-t-${prefix === 'dark' ? 'green-primary' : 'gold-primary'} border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4`}></div>
          <p className={`${prefix}-text-secondary`}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !storyBible) {
    return (
      <div className={`min-h-screen ${prefix}-bg-primary flex items-center justify-center p-4`}>
        <div className={`max-w-md w-full ${prefix}-card ${prefix}-border p-6 rounded-lg text-center`}>
          <h2 className={`text-2xl font-bold mb-4 ${prefix}-text-primary`}>Error</h2>
          <p className={`mb-6 ${prefix}-text-secondary`}>
            {error || 'Story bible not found'}
          </p>
          <button
            onClick={() => router.push('/profile')}
            className={`px-6 py-3 rounded-lg font-medium ${prefix}-btn-primary`}
          >
            Back to Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative`} style={{ 
      backgroundColor: theme === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(242, 243, 245, 0.95)'
    }}>
      {/* Floating Particles Background - Fixed behind everything */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {[...Array(12)].map((_, i) => {
          const baseX = (i * 200) % 1200
          const baseY = windowHeight + (i * 50)
          const baseDuration = 4 + (i % 3)
          const baseDelay = i * 0.5
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                backgroundColor: theme === 'dark' ? '#10B981' : '#C9A961',
                width: '4px',
                height: '4px',
                left: `${baseX}px`,
                top: `${baseY}px`,
                boxShadow: theme === 'dark' 
                  ? '0 0 8px rgba(16, 185, 129, 0.8), 0 0 16px rgba(16, 185, 129, 0.4)'
                  : '0 0 8px rgba(201, 169, 97, 0.8), 0 0 16px rgba(201, 169, 97, 0.4)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                y: -windowHeight - 100,
                scale: [0, 1.5, 0],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: baseDuration,
                repeat: Infinity,
                delay: baseDelay,
                ease: "easeOut"
              }}
            />
          )
        })}
      </div>

      {/* Header */}
      <header className={`h-16 border-b ${prefix}-border ${prefix}-bg-primary flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95`} style={{ zIndex: 50 }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/profile')}
            className={`text-sm ${prefix}-text-secondary hover:${prefix}-text-primary transition-colors flex items-center gap-1`}
          >
            <span>←</span>
            <span>Back to Profile</span>
          </button>
          <div className={`h-4 w-px ${prefix}-bg-border`}></div>
          <div>
            <h1 className={`text-lg font-bold ${prefix}-text-primary`}>
              {storyBible.seriesTitle || 'Untitled Series'}
            </h1>
            <p className={`text-xs ${prefix}-text-secondary`}>
              Production Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {storyBible.genre && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${prefix}-bg-secondary ${prefix}-text-secondary`}>
              {storyBible.genre}
            </span>
          )}
          {storyBible?.narrativeArcs && storyBible.narrativeArcs.length > 0 && (
            <button
              onClick={() => setShowShareModal(true)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                theme === 'dark' 
                  ? 'bg-[#10B981] text-black hover:bg-[#059669] shadow-lg shadow-green-500/20' 
                  : 'bg-[#C9A961] text-white hover:bg-[#B8944F] shadow-lg shadow-yellow-500/20'
              }`}
            >
              Share
            </button>
          )}
          {user && (
            <div className={`w-8 h-8 rounded-full ${prefix}-bg-secondary ${prefix}-border border`}></div>
          )}
        </div>
      </header>

        {/* Main Content */}
        <main className={`${prefix}-bg-primary p-8 relative`} style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
              Production Dashboard
            </h2>
            <p className={`text-sm ${prefix}-text-secondary`}>
              Overview of your current series in production
            </p>
          </motion.div>

          {/* Stats */}
          <DashboardStats stats={stats} theme={theme} />

          {/* Story Builder */}
          <QuickAccessCards 
            storyBibleId={storyBibleId || ''} 
            storyBible={storyBible}
            episodes={episodes}
            theme={theme}
            onOpenGenerationSuite={handleOpenGenerationSuite}
            userId={user?.id}
            userName={user?.displayName || user?.email || undefined}
            totalEpisodes={stats.totalEpisodes}
          />

          {/* Series Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-lg font-semibold ${prefix}-text-primary`}>Series Progress</h3>
              <span className={`text-sm font-medium ${prefix}-text-secondary`}>
                {stats.preProductionCompleted} / {stats.totalEpisodes} Episodes
              </span>
            </div>
            <div className={`relative h-6 rounded-full overflow-hidden ${prefix}-bg-secondary shadow-inner`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.totalEpisodes > 0 ? (stats.preProductionCompleted / stats.totalEpisodes) * 100 : 0}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className={`h-full ${prefix === 'dark' ? 'bg-gradient-to-r from-green-500 via-emerald-400 to-green-500' : 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500'} rounded-full relative overflow-hidden shadow-lg progress-shimmer`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer-overlay"></div>
              </motion.div>
              <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${prefix === 'dark' ? 'text-white' : 'text-gray-900'} drop-shadow-sm z-10`}>
                {stats.totalEpisodes > 0 ? Math.round((stats.preProductionCompleted / stats.totalEpisodes) * 100) : 0}%
              </div>
            </div>
            <p className={`text-xs mt-2 ${prefix}-text-tertiary`}>
              Pre-production progress across all episodes
            </p>
          </motion.div>

        </div>
      </main>

      {/* Episode Generation Suite Modal */}
      {storyBible && (storyBibleId || searchParams.get('id')) && (
        <EpisodeGenerationSuite
          isOpen={showGenerationSuite}
          onClose={() => setShowGenerationSuite(false)}
          episodeNumber={currentEpisodeNumber}
          storyBible={storyBible}
          storyBibleId={storyBibleId || searchParams.get('id') || ''}
          previousChoice={getPreviousEpisodeChoice()}
          onComplete={handleGenerationComplete}
        />
      )}

      {/* Share Modal */}
      {storyBible?.narrativeArcs && storyBible.narrativeArcs.length > 0 && (
        <ShareInvestorMaterialsModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          storyBibleId={storyBibleId || searchParams.get('id') || ''}
          arcIndex={0}
          ownerId={user?.id}
          ownerName={user?.displayName || user?.email || undefined}
        />
      )}
    </div>
  )
}

