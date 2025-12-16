'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import EpisodeStudio from '@/components/EpisodeStudio'
import { useAuth } from '@/context/AuthContext'
import { getStoryBible } from '@/services/story-bible-service'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'

export default function EpisodeStudioPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [storyBible, setStoryBible] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeprecationNotice, setShowDeprecationNotice] = useState(true)
  const [episodeNumber, setEpisodeNumber] = useState<number | null>(null)
  
  // Wait for params to be available (important for production builds)
  useEffect(() => {
    if (!params || !params.episodeNumber) {
      console.log('⏳ Waiting for params to be available...', params)
      return
    }
    
    const rawEpisodeNumber = params.episodeNumber as string
    console.log('📝 Raw episode number from params:', rawEpisodeNumber, 'Type:', typeof rawEpisodeNumber)
    
    // Handle episode number parsing - check for string "NaN" or invalid values
    if (rawEpisodeNumber && rawEpisodeNumber !== 'NaN' && rawEpisodeNumber !== 'undefined') {
      const parsed = parseInt(rawEpisodeNumber, 10)
      if (!isNaN(parsed) && parsed > 0) {
        console.log('✅ Valid episode number parsed:', parsed)
        setEpisodeNumber(parsed)
      } else {
        console.error(`❌ Failed to parse episode number: ${rawEpisodeNumber} -> ${parsed}`)
        const storyBibleId = searchParams.get('storyBibleId')
        router.push(storyBibleId ? `/dashboard?id=${storyBibleId}` : '/dashboard')
      }
    } else {
      console.error(`❌ Invalid episode number in URL: ${rawEpisodeNumber}, redirecting to dashboard`)
      const storyBibleId = searchParams.get('storyBibleId')
      router.push(storyBibleId ? `/dashboard?id=${storyBibleId}` : '/dashboard')
    }
  }, [params, router, searchParams])

  // Load story bible - must be before early returns (React Hook rules)
  useEffect(() => {
    const loadStoryBible = async () => {
      try {
        // Check for story bible ID in URL params
        const storyBibleId = searchParams.get('storyBibleId')
        
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
          console.log('📂 No story bible ID specified, loading from localStorage')
          loadFromLocalStorage()
        }
      } catch (err) {
        console.error('Error loading story bible:', err)
        setError('Failed to load story bible')
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
      } else {
        setError('No story bible found. Please create a series first.')
      }
    }

    loadStoryBible()
  }, [searchParams, user])

  // Get previous choice if available
  const getPreviousChoice = (): string | undefined => {
    if (episodeNumber === null) return undefined
    
    try {
      const savedChoices = localStorage.getItem('greenlit-user-choices') || 
                          localStorage.getItem('scorched-user-choices') || 
                          localStorage.getItem('reeled-user-choices')
      
      if (savedChoices) {
        const choices = JSON.parse(savedChoices)
        const previousEpisodeChoice = choices.find((choice: any) => 
          choice.episodeNumber === episodeNumber - 1
        )
        return previousEpisodeChoice?.choiceText
      }
    } catch (err) {
      console.error('Error loading previous choices:', err)
    }
    return undefined
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(18,18,18)] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p className="text-[#e7e7e7]/70">Loading Episode Studio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const storyBibleId = searchParams.get('storyBibleId')
    return (
      <div className="min-h-screen bg-[rgb(18,18,18)] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Episode Studio Error</h1>
          <p className="text-[#e7e7e7]/70 mb-6">{error}</p>
          <button
            onClick={() => router.push(storyBibleId ? `/dashboard?id=${storyBibleId}` : '/profile')}
            className="btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!storyBible) {
    return (
      <div className="min-h-screen bg-[rgb(18,18,18)] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-xl font-bold mb-2">No Story Bible Found</h1>
          <p className="text-[#e7e7e7]/70 mb-6">
            Please create a series first before accessing the Episode Studio.
          </p>
          <button
            onClick={() => router.push('/demo')}
            className="btn-primary"
          >
            Create Series
          </button>
        </div>
      </div>
    )
  }

  const storyBibleId = searchParams.get('storyBibleId')

  return (
    <div>
      {/* Deprecation Notice */}
      {showDeprecationNotice && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm border-b border-yellow-400/50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-black font-semibold text-sm">
                  Episode Studio has moved to Workspace
                </p>
                <p className="text-black/80 text-xs">
                  Use the new Generation Suite in Workspace for a better experience with context panels and improved workflow.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {storyBibleId && (
                <button
                  onClick={() => {
                    router.push(`/workspace?id=${storyBibleId}`)
                  }}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/80 transition-colors"
                >
                  Go to Workspace
                </button>
              )}
              <button
                onClick={() => setShowDeprecationNotice(false)}
                className="px-3 py-2 text-black hover:bg-black/10 rounded-lg text-sm transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      {storyBibleId && (
        <div className={`fixed ${showDeprecationNotice ? 'top-16' : 'top-4'} left-4 z-50`}>
          <button
            onClick={() => router.push(`/dashboard?id=${storyBibleId}`)}
            className="px-4 py-2 bg-black/50 backdrop-blur-sm text-white/70 hover:text-white rounded-lg text-sm transition-colors border border-white/10"
          >
            ← Dashboard
          </button>
        </div>
      )}
      
      {/* Legacy Episode Studio - Still functional for backward compatibility */}
      <div className={showDeprecationNotice ? 'pt-16' : ''}>
    <EpisodeStudio
      storyBible={storyBible}
      episodeNumber={episodeNumber}
      previousChoice={getPreviousChoice()}
      storyBibleId={storyBibleId || undefined}
    />
      </div>
    </div>
  )
}

