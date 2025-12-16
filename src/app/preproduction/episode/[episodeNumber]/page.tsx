'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { 
  createEpisodePreProduction, 
  getEpisodePreProduction 
} from '@/services/preproduction-firestore'
import { EpisodePreProductionShell } from '@/components/preproduction/EpisodePreProductionShell'
import type { EpisodePreProductionData } from '@/types/preproduction'

export default function EpisodePreProductionPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [preProductionId, setPreProductionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const episodeNumber = parseInt(params.episodeNumber as string)
  const storyBibleId = searchParams.get('storyBibleId')
  const episodeTitle = searchParams.get('episodeTitle') || `Episode ${episodeNumber}`

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('⏳ Waiting for auth to load...')
      return
    }

    // Check required parameters
    if (!storyBibleId || isNaN(episodeNumber)) {
      setError('Missing required parameters: storyBibleId and episodeNumber')
      setIsLoading(false)
      return
    }

    // Initialize episode pre-production (works with or without user)
    console.log('✅ Initializing episode pre-production, user:', user ? user.email : 'guest mode')
    initializePreProduction()
  }, [user, authLoading, storyBibleId, episodeNumber])

  const initializePreProduction = async () => {
    if (!storyBibleId || isNaN(episodeNumber)) return

    try {
      setIsLoading(true)
      
      // Only use Firestore if user is authenticated
      if (user?.id) {
        console.log('🔐 Authenticated mode: checking Firestore for episode pre-production')
        console.log('  User ID:', user.id)
        console.log('  Episode Number:', episodeNumber)
        
        // CRITICAL: Check for V2 document first (uses ID = episode_{episodeNumber})
        const v2DocumentId = `episode_${episodeNumber}`
        try {
          const { doc, getDoc } = await import('firebase/firestore')
          const { db } = await import('@/lib/firebase')
          const v2DocRef = doc(
            db,
            'users', user.id,
            'storyBibles', storyBibleId,
            'preproduction', v2DocumentId
          )
          const v2DocSnap = await getDoc(v2DocRef)
          
          if (v2DocSnap.exists()) {
            const v2Data = v2DocSnap.data()
            console.log('✅ Found V2 pre-production document in Firestore', {
              documentId: v2DocumentId,
              episodeNumber,
              hasData: !!v2Data,
              hasStoryboards: !!v2Data.storyboards,
              storyboardScenes: v2Data.storyboards?.scenes?.length || 0
            })
            setPreProductionId(v2DocumentId)
            setIsLoading(false)
            return
          }
        } catch (v2Error) {
          console.warn('⚠️ Error checking V2 document, falling back to legacy query:', v2Error)
        }
        
        // Fallback: Check legacy system (queries by type and episodeNumber)
        const existing = await getEpisodePreProduction(
          user.id,
          storyBibleId,
          episodeNumber
        )

        if (existing && existing.id) {
          console.log('✅ Found existing episode pre-production in Firestore (legacy)', {
            preProductionId: existing.id.substring(0, 20) + '...',
            episodeNumber,
            storyBibleId,
            hasStoryboards: !!existing.storyboards,
            storyboardScenes: existing.storyboards?.scenes?.length || 0
          })
          setPreProductionId(existing.id)
          setIsLoading(false)
          return
        }

        // Create new episode pre-production document with V2 ID format
        // This ensures it matches what the generation API expects
        console.log('📝 Creating new episode pre-production in Firestore with V2 ID format')
        const v2Id = `episode_${episodeNumber}`
        try {
          const { doc, setDoc, Timestamp } = await import('firebase/firestore')
          const { db } = await import('@/lib/firebase')
          const newDocRef = doc(
            db,
            'users', user.id,
            'storyBibles', storyBibleId,
            'preproduction', v2Id
          )
          
          await setDoc(newDocRef, {
            id: v2Id,
            userId: user.id,
            storyBibleId,
            type: 'episode',
            episodeNumber,
            episodeTitle,
            createdAt: Timestamp.now(),
            lastUpdated: Timestamp.now(),
            generationStatus: 'not-started',
            collaborators: [{
              userId: user.id,
              name: 'Owner',
              email: '',
              role: 'owner'
            }]
          })
          
          console.log('✅ Created new pre-production document with V2 ID:', v2Id)
          setPreProductionId(v2Id)
        } catch (createError) {
          console.error('❌ Error creating V2 document, falling back to legacy:', createError)
          // Fallback to legacy creation
          const newId = await createEpisodePreProduction(
            user.id,
            storyBibleId,
            episodeNumber,
            episodeTitle
          )
          setPreProductionId(newId)
        }
      } else {
        console.log('👤 Guest mode: using localStorage for episode pre-production')
        // Guest mode: create a local ID
        const localId = `episode_preprod_${storyBibleId}_ep${episodeNumber}`
        setPreProductionId(localId)
      }
      
      setIsLoading(false)
    } catch (err: any) {
      console.error('Error initializing episode pre-production:', err)
      setError(err.message || 'Failed to initialize episode pre-production')
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

  if (authLoading || isLoading) {
    return (
      <div className={`min-h-screen ${prefix}-bg-primary flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 ${prefix}-border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
          <p className={`${prefix}-text-primary text-lg`}>Initializing episode pre-production...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen ${prefix}-bg-primary flex items-center justify-center`}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className={`text-2xl font-bold ${prefix}-text-primary mb-4`}>Error</h1>
          <p className={`${prefix}-text-secondary mb-6`}>{error}</p>
          <button
            onClick={handleBack}
            className={`px-6 py-3 ${prefix}-btn-primary font-medium rounded-lg transition-colors`}
          >
            Go Back to Workspace
          </button>
        </div>
      </div>
    )
  }

  if (!preProductionId) {
    return (
      <div className={`min-h-screen ${prefix}-bg-primary flex items-center justify-center`}>
        <div className="text-center">
          <p className={`${prefix}-text-primary`}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <EpisodePreProductionShell
      preProductionId={preProductionId}
      userId={user?.id || ''}
      storyBibleId={storyBibleId || ''}
      episodeNumber={episodeNumber}
      onBack={handleBack}
    />
  )
}

