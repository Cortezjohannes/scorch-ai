/**
 * Actor Materials Arc Page
 * View or generate actor preparation materials for a specific arc
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { getStoryBible } from '@/services/story-bible-service'
import { getEpisodeRangeForArc } from '@/services/preproduction-firestore'
import { getActorMaterials, saveActorMaterials } from '@/services/actor-materials-firestore'
import { getEpisodesForStoryBible } from '@/services/episode-service'
import ActorMaterialsViewer from '@/components/actor-materials/ActorMaterialsViewer'
import ActorMaterialsGenerationModal, { type GenerationProgress } from '@/components/actor-materials/ActorMaterialsGenerationModal'
import { motion } from '@/components/ui/ClientMotion'
import type { ActorPreparationMaterials, ActingTechnique } from '@/types/actor-materials'

export default function ActorMaterialsArcPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { theme } = useTheme()
  
  const arcIndex = parseInt(params.arcIndex as string)
  const storyBibleId = searchParams.get('storyBibleId') || ''
  
  const [storyBible, setStoryBible] = useState<any>(null)
  const [materials, setMaterials] = useState<ActorPreparationMaterials | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTechnique, setSelectedTechnique] = useState<ActingTechnique | undefined>()
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | undefined>()
  const [totalCharacters, setTotalCharacters] = useState(5)

  const prefix = theme === 'dark' ? 'dark' : 'light'

  // Load data
  useEffect(() => {
    async function loadData() {
      if (!storyBibleId || arcIndex === undefined) {
        setError('Missing story bible or arc information')
        setLoading(false)
        return
      }

      try {
        // Load story bible
        const bible = await getStoryBible(storyBibleId, user?.id || '')
        if (!bible) {
          setError('Story bible not found')
          setLoading(false)
          return
        }
        setStoryBible(bible)

        // Check if arc exists
        if (!bible.narrativeArcs || !bible.narrativeArcs[arcIndex]) {
          setError(`Arc ${arcIndex + 1} not found`)
          setLoading(false)
          return
        }

        // Try to load existing materials
        const existingMaterials = await getActorMaterials(
          user?.id || '',
          storyBibleId,
          arcIndex
        )

        if (existingMaterials) {
          setMaterials(existingMaterials)
        }

        setLoading(false)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load data')
        setLoading(false)
      }
    }

    loadData()
  }, [storyBibleId, arcIndex, user?.id])

  // Generate materials with real-time progress
  const handleGenerate = async () => {
    if (!storyBible || !user?.id) return

    setGenerating(true)
    setError(null)
    setGenerationProgress(undefined)

    try {
      console.log('🎭 Starting actor materials generation...')

      // Get arc info
      const arc = storyBible.narrativeArcs[arcIndex]
      const episodeNumbers = getEpisodeRangeForArc(storyBible, arcIndex)
      console.log('📋 Episode numbers for arc:', episodeNumbers)

      // Load episode data and pre-production data
      console.log('📚 Loading episodes for story bible:', storyBibleId)
      const allEpisodes = await getEpisodesForStoryBible(storyBibleId, user.id)
      console.log('📚 All episodes loaded:', Object.keys(allEpisodes).length, 'episodes')
      console.log('📚 Episode numbers needed for arc:', episodeNumbers)
      
      const episodeData: any = {}
      const episodePreProdData: any = {}

      // Get episodes for this arc
      for (const episodeNum of episodeNumbers) {
        const episode = allEpisodes[episodeNum]
        console.log(`📖 Episode ${episodeNum}:`, episode ? 'Found' : 'Missing')
        
        if (episode) {
          episodeData[episodeNum] = episode

          // Try to get pre-production data for this episode
          try {
            const { getEpisodePreProduction } = await import('@/services/preproduction-firestore')
            const preProd = await getEpisodePreProduction(user.id, storyBibleId, episodeNum)
            if (preProd) {
              episodePreProdData[episodeNum] = preProd
              console.log(`✅ Pre-prod data loaded for episode ${episodeNum}`)
            } else {
              console.log(`⚠️ No pre-prod data for episode ${episodeNum}`)
            }
          } catch (err) {
            console.warn(`⚠️ Error loading pre-prod data for episode ${episodeNum}:`, err)
          }
        }
      }
      
      console.log('📊 Final episode data:', Object.keys(episodeData).length, 'episodes')
      console.log('📊 Final pre-prod data:', Object.keys(episodePreProdData).length, 'episodes')
      
      // Check if we have any episodes
      if (Object.keys(episodeData).length === 0) {
        throw new Error(`No episodes found for arc ${arcIndex + 1}. Please generate episodes first.`)
      }

      // Set up progress tracking
      const mainCharacters = storyBible.mainCharacters?.length || 3
      const totalChars = Math.min(mainCharacters, 5)
      setTotalCharacters(totalChars)
      
      setGenerationProgress({
        currentCharacter: 'Initializing...',
        currentPhase: 'Preparing to generate materials',
        characterIndex: 0,
        totalCharacters: totalChars,
        percentage: 0
      })

      // Call API with SSE streaming for real-time progress
      const response = await fetch('/api/generate/actor-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          storyBibleId,
          arcIndex,
          technique: selectedTechnique,
          storyBibleData: storyBible,
          episodeData,
          episodePreProdData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate materials')
      }

      if (!response.body) {
        throw new Error('No response body from server')
      }

      // Read SSE stream for real-time progress
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let finalMaterials: any = null

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'error') {
                throw new Error(data.error || 'Generation failed')
              }
              
              if (data.type === 'result') {
                finalMaterials = data.materials
                continue
              }
              
              // Update progress from real backend updates
              if (data.type === 'character' || data.type === 'phase' || data.type === 'complete') {
                const phaseName = data.phase || 
                  (data.type === 'character' ? 'Starting character' : 
                   data.type === 'complete' ? 'Complete' : data.message)
                
                setGenerationProgress({
                  currentCharacter: data.characterName || 'Processing...',
                  currentPhase: phaseName,
                  characterIndex: data.characterIndex ?? 0,
                  totalCharacters: data.totalCharacters ?? totalChars,
                  percentage: data.percentage ?? 0
                })
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', line, parseError)
            }
          }
        }
      }

      if (!finalMaterials) {
        throw new Error('No materials received from server')
      }

      // Final progress update
      setGenerationProgress({
        currentCharacter: 'Complete',
        currentPhase: 'Saving materials',
        characterIndex: totalChars,
        totalCharacters: totalChars,
        percentage: 100
      })

      // Save materials to Firestore
      await saveActorMaterials(
        user.id,
        storyBibleId,
        arcIndex,
        finalMaterials
      )

      // Update state
      setMaterials(finalMaterials)
      console.log('✅ Actor materials generated and saved')

    } catch (err: any) {
      console.error('❌ Error generating materials:', err)
      setError(err.message || 'Failed to generate materials')
      // Clear interval on error too
      if (typeof progressInterval !== 'undefined') {
        clearInterval(progressInterval)
      }
    } finally {
      setGenerating(false)
      setTimeout(() => setGenerationProgress(undefined), 1000) // Keep final state visible briefly
    }
  }

  // Regenerate materials
  const handleRegenerate = async () => {
    if (window.confirm('This will replace existing materials. Continue?')) {
      setMaterials(null) // Clear existing materials
      await handleGenerate()
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-center ${prefix}-text-primary`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !storyBible) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className={`text-center ${prefix}-card ${prefix}-border rounded-lg p-8 max-w-md`}>
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>Error</h1>
          <p className={`${prefix}-text-secondary mb-4`}>{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className={`px-4 py-2 rounded-lg ${prefix}-btn-primary`}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const arc = storyBible?.narrativeArcs?.[arcIndex]

  // No materials yet - show generation screen
  if (!materials) {
    return (
      <>
        <div className="min-h-screen p-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.push('/dashboard')}
                className={`mb-4 flex items-center gap-2 ${prefix}-text-secondary hover:${prefix}-text-primary transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              
              <h1 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
                Actor Materials
              </h1>
              <p className={`text-lg ${prefix}-text-secondary`}>
                {arc?.title || `Arc ${arcIndex + 1}`}
              </p>
            </div>

            {/* Generation Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${prefix}-card ${prefix}-border rounded-xl p-8`}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎭</div>
                <h2 className={`text-2xl font-bold mb-3 ${prefix}-text-primary`}>
                  Generate Actor Preparation Materials
                </h2>
                <p className={`${prefix}-text-secondary mb-6 max-w-2xl mx-auto`}>
                  Create comprehensive preparation materials for all characters in this arc, 
                  including study guides, scene breakdowns, performance references, and practice materials.
                </p>

                {/* Technique Selector */}
                <div className="mb-8">
                  <label className={`block text-sm font-medium mb-3 ${prefix}-text-primary`}>
                    Acting Technique (Optional)
                  </label>
                  <select
                    value={selectedTechnique || ''}
                    onChange={(e) => setSelectedTechnique(e.target.value as ActingTechnique || undefined)}
                    className={`px-4 py-2 rounded-lg ${prefix}-input w-full max-w-xs`}
                  >
                    <option value="">None (General Approach)</option>
                    <optgroup label="Psychological">
                      <option value="stanislavski">Stanislavski</option>
                      <option value="meisner">Meisner</option>
                      <option value="method-acting">Method Acting</option>
                      <option value="adler">Adler</option>
                      <option value="hagen">Hagen</option>
                    </optgroup>
                    <optgroup label="Physical">
                      <option value="chekhov">Chekhov</option>
                      <option value="laban">Laban</option>
                      <option value="viewpoints">Viewpoints</option>
                    </optgroup>
                    <optgroup label="Practical">
                      <option value="practical-aesthetics">Practical Aesthetics</option>
                      <option value="spolin">Spolin</option>
                    </optgroup>
                  </select>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className={`px-8 py-3 rounded-lg font-semibold text-lg ${prefix}-btn-primary disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {generating ? 'Generating...' : 'Generate Materials'}
                </button>

                {/* Features List */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <Feature icon="📚" title="Study Guides" description="Character backgrounds, motivations, and arcs" />
                  <Feature icon="🎬" title="Scene Breakdowns" description="GOTE analysis for every scene" />
                  <Feature icon="🗣️" title="Voice & Physical" description="Movement patterns and speech rhythms" />
                  <Feature icon="🎭" title="Performance Refs" description="Similar roles to study" />
                  <Feature icon="💪" title="Practice Materials" description="Monologues and key scenes" />
                  <Feature icon="🎯" title="On-Set Prep" description="Warmups and mental checklists" />
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div className="flex-1">
                        <p className="text-red-500 font-semibold mb-1">Generation Failed</p>
                        <p className="text-red-400 text-sm">{error}</p>
                        {error.includes('No episodes') && (
                          <p className="text-red-400 text-sm mt-2">
                            💡 Tip: Make sure all episodes for this arc are generated in the Episode Studio first.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </div>

        {/* Generation Modal with Real-Time Updates */}
        <ActorMaterialsGenerationModal
          isOpen={generating}
          progress={generationProgress}
          arcTitle={arc?.title || `Arc ${arcIndex + 1}`}
        />
      </>
    )
  }

  // Materials exist - show viewer
  return (
    <div className="min-h-screen">
      <ActorMaterialsViewer
        materials={materials}
        storyBible={storyBible}
        onRegenerate={handleRegenerate}
      />
    </div>
  )
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </div>
  )
}

