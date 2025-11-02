'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PreProductionV2Shell } from '@/components/preproduction-v2/PreProductionV2Shell'
import { PreProductionV2Data } from '@/types/preproduction'
import { getPreProductionV2 } from '@/services/preproduction-v2-service'

/**
 * Pre-Production V2 Page
 * 
 * Refactored from 4,266 lines to ~200 lines.
 * All rendering logic moved to modular components.
 */

export default function PreProductionV2Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [v2Content, setV2Content] = useState<PreProductionV2Data | null>(null)
  const [storyBible, setStoryBible] = useState<any>(null)
  const [workspaceEpisodes, setWorkspaceEpisodes] = useState<any>({})
  const [arcEpisodes, setArcEpisodes] = useState<any[]>([])
  
  // Get URL parameters
  const projectId = searchParams.get('projectId') || searchParams.get('storyBibleId')
  const arcIndex = parseInt(searchParams.get('arc') || '1')
  const episodeParam = searchParams.get('episode')
  const singleEpisodeNumber = episodeParam ? parseInt(episodeParam) : null
  
  const isSingleEpisodeMode = singleEpisodeNumber !== null
  const currentEpisodeNumber = singleEpisodeNumber || 1
  
  // Load story bible and workspace episodes
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Load Story Bible
        // Try localStorage first
        const localData = typeof window !== 'undefined' 
          ? localStorage.getItem('greenlit-story-bible')
          : null
        
        let loadedStoryBible = null
        
        if (localData) {
          const parsed = JSON.parse(localData)
          loadedStoryBible = parsed
          setStoryBible(parsed)
          console.log('📖 Story bible loaded from localStorage')
        } else if (projectId && user) {
          // Try Firestore if we have a project ID and user
          const docRef = doc(db, 'storyBibles', projectId)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            const data = docSnap.data()
            loadedStoryBible = data
            setStoryBible(data)
            console.log('📖 Story bible loaded from Firestore')
          }
        }
        
        if (!loadedStoryBible) {
          console.warn('No story bible found')
          return
        }
        
        // 2. Load Workspace Episodes from Firestore OR localStorage
        if (projectId) {
          try {
            let episodes: any = {}
            
            if (user) {
              // AUTHENTICATED: Load from Firestore
              const episodesRef = collection(db, 'users', user.id, 'storyBibles', projectId, 'episodes')
              const q = query(episodesRef, orderBy('episodeNumber', 'asc'))
              const querySnapshot = await getDocs(q)
              
              querySnapshot.forEach((doc) => {
                const episodeData = doc.data()
                episodes[`episode${episodeData.episodeNumber}`] = episodeData
              })
              
              console.log(`📚 Loaded ${querySnapshot.size} episodes from Firestore`)
            } else {
              // GUEST MODE: Load from localStorage
              const stored = localStorage.getItem('greenlit-episodes')
              if (stored) {
                const allEpisodes = JSON.parse(stored)
                // Filter episodes for this story bible
                Object.keys(allEpisodes).forEach(key => {
                  const ep = allEpisodes[key]
                  if (!ep.storyBibleId || ep.storyBibleId === projectId) {
                    episodes[key] = ep
                  }
                })
                console.log(`📚 Loaded ${Object.keys(episodes).length} episodes from localStorage (guest mode)`)
              }
            }
            
            setWorkspaceEpisodes(episodes)
            
            // If in single episode mode, set arcEpisodes to just that one episode
            if (isSingleEpisodeMode && singleEpisodeNumber) {
              const targetEpisode = episodes[`episode${singleEpisodeNumber}`] || episodes[singleEpisodeNumber]
              if (targetEpisode) {
                setArcEpisodes([targetEpisode])
                console.log(`🎯 Single episode mode: Episode ${singleEpisodeNumber}`)
        } else {
                console.warn(`Episode ${singleEpisodeNumber} not found`)
          }
        } else {
              // Arc mode - get all episodes in the arc (or all if no arc filtering)
              const episodeArray = Object.values(episodes)
                .filter((ep: any) => ep && ep.episodeNumber)
                .sort((a: any, b: any) => a.episodeNumber - b.episodeNumber)
              setArcEpisodes(episodeArray)
              console.log(`🎬 Arc mode: ${episodeArray.length} episodes`)
      }
    } catch (error) {
            console.error('Error loading episodes:', error)
          }
        }
        
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    
    loadData()
  }, [projectId, user, isSingleEpisodeMode, singleEpisodeNumber])
  
  // Check for auto-generation
  useEffect(() => {
    const autoGen = typeof window !== 'undefined' 
      ? localStorage.getItem('scorched-auto-generate')
      : null
    
    // Only auto-generate if we have story bible AND episodes loaded
    const hasEpisodes = arcEpisodes.length > 0 || Object.keys(workspaceEpisodes).length > 0
    
    if (autoGen === 'true' && storyBible && hasEpisodes && !isGenerating && !showResults) {
      console.log('🚀 Auto-starting V2 generation with', arcEpisodes.length, 'episodes')
      localStorage.removeItem('scorched-auto-generate')
      startV2Generation()
    }
  }, [storyBible, arcEpisodes, workspaceEpisodes])
  
  // Load existing pre-production data
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const arcOrEpisodeId = isSingleEpisodeMode 
          ? `episode_${singleEpisodeNumber}`
          : `arc_${arcIndex}`
        
        // 1. Try Firestore first (if authenticated)
        if (user && projectId) {
          const firestoreData = await getPreProductionV2(
            projectId,
            arcOrEpisodeId,
            user.id
          )
          
          if (firestoreData) {
            setV2Content(firestoreData)
            setShowResults(true)
            console.log('📥 Loaded pre-production from Firestore')
            return
          }
        }
        
        // 2. Fallback to localStorage
        const key = isSingleEpisodeMode 
          ? `scorched-preproduction-episode-${singleEpisodeNumber}`
          : `scorched-preproduction-arc-${arcIndex}`
        
        const saved = typeof window !== 'undefined'
          ? localStorage.getItem(key)
          : null
        
        if (saved) {
          const parsed = JSON.parse(saved)
          setV2Content(parsed)
          setShowResults(true)
          console.log('📥 Loaded pre-production from localStorage')
        }
      } catch (error) {
        console.error('Error loading existing data:', error)
      }
    }
    
    loadExistingData()
  }, [arcIndex, isSingleEpisodeMode, singleEpisodeNumber, user, projectId])
  
  // Start V2 generation
  const startV2Generation = async () => {
    if (!storyBible) {
      alert('Story bible is required to generate pre-production content')
      return
    }
    
    // Check if we have episodes
    if (arcEpisodes.length === 0 && Object.keys(workspaceEpisodes).length === 0) {
      alert('No episodes found. Please create episodes in the workspace first before generating pre-production materials.')
      return
    }
    
    setIsGenerating(true)
    setShowResults(false)
    
    try {
      console.log('🎬 Starting V2 Pre-Production Generation...')
      console.log('📊 Episodes to process:', arcEpisodes)
      
      // Call the API
      const response = await fetch('/api/generate/preproduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          workspaceEpisodes,
          arcEpisodes,
          arcIndex,
          useEngines: true,
          engineLevel: 'professional',
          userId: user?.id,
          storyBibleId: projectId,
          isSingleEpisodeMode,
          singleEpisodeNumber: currentEpisodeNumber
        })
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ V2 Pre-Production Complete!', data)
      
      if (!data.success || !data.preProduction) {
        throw new Error(data.error || 'Invalid response from API')
      }
      
      // Save to state and localStorage (use preProduction field from API response)
      setV2Content(data.preProduction)
      setShowResults(true)
      
      // Save to localStorage (backup)
      const key = isSingleEpisodeMode 
        ? `scorched-preproduction-episode-${singleEpisodeNumber}`
        : `scorched-preproduction-arc-${arcIndex}`
      
      localStorage.setItem(key, JSON.stringify(data.preProduction))
      
      // Log save status
      if (data.savedToFirestore) {
        console.log('✅ Pre-production saved to Firestore and localStorage')
      } else {
        console.log('⚠️ Pre-production saved to localStorage only (guest mode)')
      }
      
    } catch (error) {
      console.error('❌ V2 Generation Error:', error)
      alert('Failed to generate pre-production content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }
  
  // Handle back navigation
  const handleBack = () => {
    router.back()
  }
  
  // Loading state
  if (isGenerating) {
      return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00FF99] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Generating comprehensive pre-production materials...</p>
          <p className="text-sm opacity-60 mt-2">This may take a few minutes</p>
            </div>
      </div>
    )
  }

  // Pre-generation state
  if (!showResults || !v2Content) {
    const hasEpisodes = arcEpisodes.length > 0 || Object.keys(workspaceEpisodes).length > 0
    
      return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold mb-4">Pre-Production V2</h1>
          <p className="text-lg opacity-70 mb-8">
            Generate comprehensive pre-production materials including scripts, storyboards, 
            props, locations, casting, marketing, and post-production guides.
          </p>
          
          {!storyBible ? (
            <div className="opacity-70">
              <div className="w-12 h-12 border-4 border-[#00FF99] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading story bible...</p>
                              </div>
          ) : !hasEpisodes ? (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold mb-3 text-yellow-400">No Episodes Found</h2>
              <p className="text-base opacity-90 mb-4">
                Pre-production materials are generated based on your episodes. 
                You need to create at least one episode before generating pre-production content.
              </p>
              <button
                onClick={() => router.push('/workspace?tab=episodes')}
                className="bg-[#00FF99] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#00CC7A] transition-colors"
              >
                Go to Workspace → Create Episodes
                        </button>
                      </div>
          ) : (
            <>
              <div className="bg-[#00FF99]/10 border border-[#00FF99]/30 rounded-lg p-6 mb-6">
                <p className="text-lg mb-2">
                  Ready to generate pre-production for <strong>{storyBible.seriesTitle || 'your series'}</strong>
                </p>
                <p className="opacity-70">
                  {isSingleEpisodeMode 
                    ? `Episode ${currentEpisodeNumber}` 
                    : `${arcEpisodes.length} episode${arcEpisodes.length === 1 ? '' : 's'}`
                  }
                    </p>
                  </div>
              <button
                onClick={startV2Generation}
                className="bg-[#00FF99] text-black px-8 py-4 rounded-lg font-medium text-lg hover:bg-[#00CC7A] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                🎬 Start Generation
                      </button>
              <p className="text-sm opacity-50 mt-4">
                This may take several minutes depending on the number of scenes
              </p>
            </>
          )}
          
              <button
            onClick={handleBack}
            className="mt-8 text-sm opacity-60 hover:opacity-100 transition-opacity"
              >
            ← Back
              </button>
            </div>
            </div>
    )
  }
  
  // Results state - use the new modular shell
    return (
    <PreProductionV2Shell
      data={v2Content}
      isGenerating={isGenerating}
      onBack={handleBack}
    />
  )
}
