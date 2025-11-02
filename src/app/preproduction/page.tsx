'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSearchParams, useRouter } from 'next/navigation'
import { PreProductionShell } from '@/components/preproduction/PreProductionShell'
import { 
  createPreProduction, 
  getPreProductionByEpisode 
} from '@/services/preproduction-firestore'
import type { PreProductionData } from '@/types/preproduction'

export default function PreProductionPage() {
  const { user, isLoading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [preProductionId, setPreProductionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const storyBibleId = searchParams.get('storyBibleId')
  const episodeNumber = searchParams.get('episodeNumber')
  const episodeTitle = searchParams.get('episodeTitle') || `Episode ${episodeNumber}`
  const autoGenerate = searchParams.get('autoGenerate') === 'true'

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('⏳ Waiting for auth to load...')
      return
    }

    // Check required parameters
    if (!storyBibleId || !episodeNumber) {
      setError('Missing required parameters: storyBibleId and episodeNumber')
      setIsLoading(false)
      return
    }

    // Initialize pre-production (works with or without user)
    console.log('✅ Initializing pre-production, user:', user ? user.email : 'guest mode')
    initializePreProduction()
  }, [user, authLoading, storyBibleId, episodeNumber])

  const initializePreProduction = async () => {
    if (!storyBibleId || !episodeNumber) return

    try {
      setIsLoading(true)
      
      // Only use Firestore if user is authenticated
      if (user?.id) {
        console.log('🔐 Authenticated mode: checking Firestore for pre-production')
        console.log('  User ID:', user.id)
        
        // Check if pre-production already exists
        const existing = await getPreProductionByEpisode(
          user.id,
          storyBibleId,
          parseInt(episodeNumber)
        )

        if (existing) {
          console.log('✅ Found existing pre-production in Firestore')
          setPreProductionId(existing.id)
          setIsLoading(false)
          return
        }

        // Create new pre-production document
        console.log('📝 Creating new pre-production in Firestore')
        const newId = await createPreProduction(
          user.id,
          storyBibleId,
          parseInt(episodeNumber),
          episodeTitle
        )

        setPreProductionId(newId)
        
        // If autoGenerate is true, trigger generation
        if (autoGenerate) {
          await triggerGeneration(newId)
        }
      } else {
        console.log('👤 Guest mode: using localStorage for pre-production')
        // Guest mode: create a local ID
        const localId = `preprod_${storyBibleId}_ep${episodeNumber}`
        setPreProductionId(localId)
      }
      
      setIsLoading(false)
    } catch (err: any) {
      console.error('Error initializing pre-production:', err)
      setError(err.message || 'Failed to initialize pre-production')
      setIsLoading(false)
    }
  }

  const triggerGeneration = async (preprodId: string) => {
    try {
      const response = await fetch('/api/generate/preproduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId: preprodId,
          storyBibleId,
          episodeNumber: parseInt(episodeNumber!),
          userId: user?.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate pre-production content')
      }

      const result = await response.json()
      console.log('Generation started:', result)
    } catch (error) {
      console.error('Error triggering generation:', error)
    }
  }

  const handleBack = () => {
    if (storyBibleId) {
      router.push(`/workspace?storyBibleId=${storyBibleId}`)
    } else {
      router.push('/workspace')
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00FF99] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#e7e7e7] text-lg">Initializing pre-production...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-[#e7e7e7] mb-4">Error</h1>
          <p className="text-[#e7e7e7]/70 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors"
          >
            Go Back to Workspace
          </button>
        </div>
      </div>
    )
  }

  if (!preProductionId) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#e7e7e7]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <PreProductionShell
      preProductionId={preProductionId}
      userId={user?.id || ''}
      storyBibleId={storyBibleId || ''}
      onBack={handleBack}
    />
  )
}

