'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { 
  createArcPreProduction, 
  getArcPreProduction,
  getEpisodeRangeForArc,
  canUnlockArcPreProduction
} from '@/services/preproduction-firestore'
import { getStoryBible } from '@/services/story-bible-service'
import { getEpisodesForStoryBible } from '@/services/episode-service'
import { ArcPreProductionShell } from '@/components/preproduction/ArcPreProductionShell'

export default function ArcPreProductionPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [preProductionId, setPreProductionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unlockStatus, setUnlockStatus] = useState<any>(null)
  
  const arcIndex = parseInt(params.arcIndex as string)
  const storyBibleId = searchParams.get('storyBibleId')
  const hasInitialized = useRef(false)

  // Simplified initialization flow
  useEffect(() => {
    // Prevent duplicate initialization
    if (hasInitialized.current) return
    
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }

    // Validate required parameters
    if (!storyBibleId || isNaN(arcIndex)) {
      setError('Missing required parameters: storyBibleId and arcIndex')
      setIsLoading(false)
      return
    }

    // Wait for user to be available
    if (!user?.id) {
      setError('User must be authenticated to access production assistant')
      setIsLoading(false)
      return
    }

    // Initialize production assistant
    hasInitialized.current = true
    initializeArcPreProduction()
  }, [user, authLoading, storyBibleId, arcIndex])

  const initializeArcPreProduction = async () => {
    if (!storyBibleId || isNaN(arcIndex) || !user?.id) {
      setError('Invalid parameters or user not authenticated')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // Step 1: Get generated episodes
      const episodes = await getEpisodesForStoryBible(storyBibleId, user.id)
      const generatedEpisodes: Record<number, any> = episodes || {}
      
      // Step 2: Check unlock status
      const status = await canUnlockArcPreProduction(
        user.id,
        storyBibleId,
        arcIndex,
        generatedEpisodes
      )
      
      setUnlockStatus(status)
      
      if (!status.canUnlock) {
        setIsLoading(false)
        return
      }
      
      // Step 3: Get story bible for arc info
      const storyBible = await getStoryBible(storyBibleId, user.id)
      const arc = storyBible?.narrativeArcs?.[arcIndex]
      
      if (!arc) {
        setError('Arc not found in story bible')
        setIsLoading(false)
        return
      }
      
      const episodeNumbers = getEpisodeRangeForArc(storyBible, arcIndex)
      const arcTitle = arc.title || `Arc ${arcIndex + 1}`
      
      // Step 4: Check if production assistant already exists
      const existing = await getArcPreProduction(
        user.id,
        storyBibleId,
        arcIndex
      )

      if (existing) {
        console.log('✅ Found existing production assistant:', existing.id)
        setPreProductionId(existing.id)
        setIsLoading(false)
        return
      }

      // Step 5: Create new production assistant document
      console.log('📝 Creating new production assistant...')
      const newId = await createArcPreProduction(
        user.id,
        storyBibleId,
        arcIndex,
        arcTitle,
        episodeNumbers
      )

      setPreProductionId(newId)
      setIsLoading(false)
    } catch (err: any) {
      console.error('❌ Error initializing production assistant:', err)
      setError(err.message || 'Failed to initialize production assistant')
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (storyBibleId) {
      router.push(`/dashboard?id=${storyBibleId}`)
    } else {
      router.push('/profile')
    }
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#e7e7e7] text-lg">Checking arc unlock status...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-[#e7e7e7] mb-4">Error</h1>
          <p className="text-[#e7e7e7]/70 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors"
          >
            Go Back to Workspace
          </button>
        </div>
      </div>
    )
  }

  // Lock screen - arc not ready
  if (unlockStatus && !unlockStatus.canUnlock) {
    return (
      <div className={`min-h-screen ${prefix}-bg-primary flex items-center justify-center`}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className={`text-2xl font-bold ${prefix}-text-primary mb-4`}>Production Assistant Locked</h1>
          <p className={`${prefix}-text-secondary mb-4`}>
            Production assistant requires all episodes in the arc to be generated AND have episode pre-production completed.
          </p>
          
          {unlockStatus.missingEpisodes.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <p className="text-yellow-400 font-medium mb-2">Missing Episodes:</p>
              <p className={`text-sm ${prefix}-text-tertiary`}>
                Episodes {unlockStatus.missingEpisodes.join(', ')} need to be generated
              </p>
            </div>
          )}
          
          {unlockStatus.missingEpisodePreProd.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
              <p className="text-blue-400 font-medium mb-2">Missing Episode Pre-Production:</p>
              <p className={`text-sm ${prefix}-text-tertiary`}>
                Episodes {unlockStatus.missingEpisodePreProd.join(', ')} need episode pre-production
              </p>
            </div>
          )}
          
          <button
            onClick={handleBack}
            className={`px-6 py-3 ${prefix}-btn-primary font-medium rounded-lg transition-colors`}
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // No pre-production ID yet
  if (!preProductionId) {
    return (
      <div className={`min-h-screen ${prefix}-bg-primary flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 ${prefix}-border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
          <p className={`${prefix}-text-primary`}>Initializing production assistant...</p>
        </div>
      </div>
    )
  }

  // Render shell component
  return (
    <ArcPreProductionShell
      preProductionId={preProductionId}
      userId={user?.id || ''}
      storyBibleId={storyBibleId || ''}
      arcIndex={arcIndex}
      onBack={handleBack}
    />
  )
}
