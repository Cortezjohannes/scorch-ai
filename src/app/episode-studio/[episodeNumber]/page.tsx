'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import EpisodeStudio from '@/components/EpisodeStudio'
import { useAuth } from '@/context/AuthContext'
import { getStoryBible } from '@/services/story-bible-service'

export default function EpisodeStudioPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [storyBible, setStoryBible] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const episodeNumber = parseInt(params.episodeNumber as string)

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF99] mx-auto mb-4"></div>
          <p className="text-[#e7e7e7]/70">Loading Episode Studio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[rgb(18,18,18)] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Episode Studio Error</h1>
          <p className="text-[#e7e7e7]/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/workspace')}
            className="btn-primary"
          >
            Return to Workspace
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
    <EpisodeStudio
      storyBible={storyBible}
      episodeNumber={episodeNumber}
      previousChoice={getPreviousChoice()}
      storyBibleId={storyBibleId || undefined}
    />
  )
}

