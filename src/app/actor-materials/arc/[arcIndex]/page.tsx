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
import { getActorMaterials, saveActorMaterials, deleteActorMaterials } from '@/services/actor-materials-firestore'
import { getEpisodesForStoryBible } from '@/services/episode-service'
import ActorMaterialsViewer from '@/components/actor-materials/ActorMaterialsViewer'
import ActorMaterialsGenerationModal, { type GenerationProgress } from '@/components/actor-materials/ActorMaterialsGenerationModal'
import ActorMaterialsGenerationScreenModal from '@/components/actor-materials/ActorMaterialsGenerationScreenModal'
import RegenerateConfirmModal from '@/components/actor-materials/RegenerateConfirmModal'
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
  const [episodePreProdData, setEpisodePreProdData] = useState<any>({}) // Store pre-production data for character filtering
  const [episodeData, setEpisodeData] = useState<any>({}) // Store episode data for character extraction
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false) // Guard to prevent loop
  const [error, setError] = useState<string | null>(null)
  const [selectedTechnique, setSelectedTechnique] = useState<ActingTechnique | undefined>()
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | undefined>()
  const [totalCharacters, setTotalCharacters] = useState(0) // Will be updated from backend
  const [generatingCharacter, setGeneratingCharacter] = useState<string | null>(null) // Track which character is being generated
  const [selectedCharacterForGeneration, setSelectedCharacterForGeneration] = useState<string>('') // Selected character from dropdown
  const [showViewer, setShowViewer] = useState<boolean | null>(null) // null = auto-detect, true = force viewer, false = force generation
  const [showGenerationModal, setShowGenerationModal] = useState(false) // Show generation modal from viewer
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false) // Show regeneration confirmation modal
  const [pendingRegenerateCharacter, setPendingRegenerateCharacter] = useState<{ name: string; id: string } | undefined>(undefined) // Character to regenerate (if single)
  const [pendingRegenerateTechnique, setPendingRegenerateTechnique] = useState<ActingTechnique | undefined>(undefined) // Technique to use for regeneration
  
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
      // Clear any previous errors
      setError(null)
      
      // Load story bible
        const bible = await getStoryBible(storyBibleId, user?.id || '')
        if (!bible) {
        setError('Story bible not found')
          setLoading(false)
          return
        }
        setStoryBible(bible)
        // Clear error on successful load
        setError(null)

        // Check if arc exists
        if (!bible.narrativeArcs || !bible.narrativeArcs[arcIndex]) {
          setError(`Arc ${arcIndex + 1} not found`)
          setLoading(false)
        return
      }
      
        // Load episode data and pre-production data for character filtering
        const episodeNumbers = getEpisodeRangeForArc(bible, arcIndex)
        const allEpisodes = await getEpisodesForStoryBible(storyBibleId, user?.id || '')
        const preProdData: any = {}
        const episodeDataMap: any = {}
        
        for (const episodeNum of episodeNumbers) {
          if (allEpisodes[episodeNum]) {
            episodeDataMap[episodeNum] = allEpisodes[episodeNum]
            try {
              const { getEpisodePreProduction } = await import('@/services/preproduction-firestore')
              const preProd = await getEpisodePreProduction(user?.id || '', storyBibleId, episodeNum)
              if (preProd) {
                preProdData[episodeNum] = preProd
              }
            } catch (err) {
              console.warn(`⚠️ Error loading pre-prod data for episode ${episodeNum}:`, err)
            }
          }
        }
        setEpisodePreProdData(preProdData)
        setEpisodeData(episodeDataMap)
      
        // Try to load existing materials
        const existingMaterials = await getActorMaterials(
          user?.id || '',
          storyBibleId,
          arcIndex
        )
      
      if (existingMaterials) {
        setMaterials(existingMaterials)
        // If materials exist, default to showing the viewer (setShowViewer remains null for auto-detect)
        }

        // Clear any errors on successful load
        setError(null)
        setLoading(false)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load data')
        setLoading(false)
      }
    }

    loadData()
  }, [storyBibleId, arcIndex, user?.id])

  // Internal function to generate materials for a character (without state management)
  // Used by both single and batch generation
  const generateCharacterMaterials = async (
    characterName: string, 
    characterId: string,
    skipStateManagement: boolean = false
  ) => {
    if (!storyBible || !user?.id) return null

    if (!skipStateManagement) {
      setGeneratingCharacter(characterName)
      setGenerating(true)
      setError(null)
      setGenerationProgress(undefined)
    }

    try {
      console.log(`🎭 Starting actor materials generation for ${characterName}...`)

      // Get arc info
      const arc = storyBible.narrativeArcs[arcIndex]
      const episodeNumbers = getEpisodeRangeForArc(storyBible, arcIndex)
      console.log('📋 Episode numbers for arc:', episodeNumbers)

      // Load episode data and pre-production data
      console.log('📚 Loading episodes for story bible:', storyBibleId)
      const allEpisodes = await getEpisodesForStoryBible(storyBibleId, user.id)
      console.log('📚 All episodes loaded:', Object.keys(allEpisodes).length, 'episodes')
      
      const episodeData: any = {}
      const episodePreProdData: any = {}

      // Get episodes for this arc
      for (const episodeNum of episodeNumbers) {
        const episode = allEpisodes[episodeNum]
        if (episode) {
          episodeData[episodeNum] = episode

          // Try to get pre-production data for this episode
          try {
            const { getEpisodePreProduction } = await import('@/services/preproduction-firestore')
            const preProd = await getEpisodePreProduction(user.id, storyBibleId, episodeNum)
            if (preProd) {
              episodePreProdData[episodeNum] = preProd
            }
          } catch (err) {
            console.warn(`⚠️ Error loading pre-prod data for episode ${episodeNum}:`, err)
          }
        }
      }
      
      if (Object.keys(episodeData).length === 0) {
        throw new Error(`No episodes found for arc ${arcIndex + 1}. Please generate episodes first.`)
      }

      // Set up progress tracking
      if (!skipStateManagement) {
        setGenerationProgress({
          currentCharacter: characterName,
          currentPhase: 'Preparing to generate materials',
          characterIndex: 0,
          totalCharacters: 1,
          percentage: 0
        })
      }

      // Call API with SSE streaming for real-time progress
      const requestBody = {
        userId: user.id,
        storyBibleId,
        arcIndex,
        technique: selectedTechnique,
        storyBibleData: storyBible,
        episodeData,
        episodePreProdData,
        characterName, // Generate for single character
        characterId
      }
      
      console.log(`  📤 API Request for ${characterName}:`, {
        characterName,
        characterId,
        hasEpisodeData: !!episodeData && Object.keys(episodeData).length > 0,
        hasPreProdData: !!episodePreProdData && Object.keys(episodePreProdData).length > 0
      })
      
      const response = await fetch('/api/generate/actor-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
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
        buffer = lines.pop() || ''
        
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
                
                // Always update progress, but only manage state if not skipping
                // This allows batch generation to show progress while preserving state
                setGenerationProgress({
                  currentCharacter: data.characterName || characterName,
                  currentPhase: phaseName,
                  characterIndex: data.characterIndex ?? 0,
                  totalCharacters: data.totalCharacters ?? 1,
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

      // Load existing materials to merge with new character
      const existingMaterials = await getActorMaterials(
        user.id,
        storyBibleId,
        arcIndex
      )

      // Merge new character with existing materials
      let mergedMaterials: ActorPreparationMaterials
      if (existingMaterials && existingMaterials.characters && existingMaterials.characters.length > 0) {
        // Remove the character if it already exists (for regeneration)
        const existingCharIndex = existingMaterials.characters.findIndex(
          (c: any) => c.characterName.toLowerCase() === characterName.toLowerCase() ||
                     c.characterId.toLowerCase() === characterId.toLowerCase()
        )
        
        const updatedCharacters = [...existingMaterials.characters]
        if (existingCharIndex >= 0) {
          // Replace existing character
          console.log(`  Replacing existing character: ${characterName}`)
          updatedCharacters[existingCharIndex] = finalMaterials.characters[0]
        } else {
          // Add new character
          console.log(`  Adding new character: ${characterName} (total: ${updatedCharacters.length + 1})`)
          updatedCharacters.push(finalMaterials.characters[0])
        }
        
        mergedMaterials = {
          ...existingMaterials,
          characters: updatedCharacters,
          lastUpdated: Date.now()
        }
        console.log(`  Merged materials: ${mergedMaterials.characters.length} characters total`)
      } else {
        // No existing materials, use the new ones
        console.log(`  No existing materials, creating new document with ${finalMaterials.characters.length} character(s)`)
        mergedMaterials = {
          ...finalMaterials,
          lastUpdated: Date.now()
        }
      }

      // Save merged materials to Firestore
      console.log(`  💾 Saving merged materials with ${mergedMaterials.characters.length} characters`)
      await saveActorMaterials(
        user.id,
        storyBibleId,
        arcIndex,
        mergedMaterials
      )
      console.log(`  ✅ Materials saved to Firestore`)

      // Reload materials from Firestore to get the latest version
      const updatedMaterials = await getActorMaterials(
        user.id,
        storyBibleId,
        arcIndex
      )
      
      // Verify the character is in the saved materials
      if (updatedMaterials) {
        const characterExists = updatedMaterials.characters.some((c: any) => 
          c.characterName.toLowerCase() === characterName.toLowerCase()
        )
        if (!characterExists) {
          console.error(`  ⚠️ WARNING: ${characterName} not found in reloaded materials!`)
        } else {
          console.log(`  ✅ Verified ${characterName} exists in saved materials`)
        }
      }
      
      if (updatedMaterials) {
        if (!skipStateManagement) {
          setMaterials(updatedMaterials)
          // Clear selected character if it was just generated
          setSelectedCharacterForGeneration('')
          // If all characters are now generated, show viewer automatically
          // Calculate character count from story bible
          const allCharsCount = storyBible?.mainCharacters?.length || 0
          if (updatedMaterials.characters.length >= allCharsCount) {
            setShowViewer(true)
            setShowGenerationModal(false) // Close modal if all done
          }
        }
        console.log(`✅ Actor materials generated and saved for ${characterName}`)
        return updatedMaterials
      } else {
        // Fallback to what we just generated (shouldn't happen if merge worked)
        if (!skipStateManagement) {
          setMaterials(mergedMaterials)
          setSelectedCharacterForGeneration('')
        }
        console.log(`✅ Actor materials generated and saved for ${characterName}`)
        return mergedMaterials
      }

    } catch (err: any) {
      console.error('❌ Error generating materials:', err)
      if (!skipStateManagement) {
        setError(err.message || 'Failed to generate materials')
      }
      // Re-throw error so calling code can handle it (for "Generate All Remaining")
      throw err
    } finally {
      if (!skipStateManagement) {
        setGenerating(false)
        setGeneratingCharacter(null)
        setTimeout(() => setGenerationProgress(undefined), 1000)
      }
    }
  }

  // Generate materials for a single character (with state management)
  const handleGenerateCharacter = async (characterName: string, characterId: string) => {
    return await generateCharacterMaterials(characterName, characterId, false)
  }

  // Generate all remaining characters with error resilience
  const handleGenerateAllRemaining = async () => {
    if (!storyBible || !user?.id) return
    
    // Guard: Prevent re-entry if already generating a batch
    if (isGeneratingBatch || generating) {
      console.log('  ⚠️ Batch generation already in progress, ignoring duplicate call')
      return
    }
    
    // Get current remaining characters at the start (snapshot to avoid changes during generation)
    const currentRemaining = allCharacters.filter(
      char => !(materials?.characters?.some((c: any) => 
        c.characterName.toLowerCase() === char.name.toLowerCase()
      ) || false)
    )
    
    if (currentRemaining.length === 0) {
      console.log('  No remaining characters to generate')
      return
    }

    console.log(`🎭 Starting batch generation for ${currentRemaining.length} characters`)
    setIsGeneratingBatch(true) // Set guard flag
    setGenerating(true)
    setError(null)
    setGenerationProgress(undefined)

    const charactersToGenerate = [...currentRemaining] // Copy array to avoid mutation
    const successful: string[] = []
    const failed: Array<{ name: string; error: string }> = []

    try {
      console.log(`  📋 Processing ${charactersToGenerate.length} characters:`, charactersToGenerate.map(c => c.name).join(', '))
      
      for (let i = 0; i < charactersToGenerate.length; i++) {
        const char = charactersToGenerate[i]
        
        // Double-check this character hasn't been generated by another process
        const currentMaterials = await getActorMaterials(user.id, storyBibleId, arcIndex)
        const alreadyGenerated = currentMaterials?.characters?.some((c: any) => 
          c.characterName.toLowerCase() === char.name.toLowerCase()
        )
        
        if (alreadyGenerated) {
          console.log(`  ⏭️  Skipping ${char.name} - already generated (found in ${currentMaterials?.characters.length} existing characters)`)
          successful.push(char.name)
          continue
        }
        
        try {
          console.log(`🎭 Generating character ${i + 1} of ${charactersToGenerate.length}: ${char.name}`)
          
          // Update progress
          setGenerationProgress({
            currentCharacter: char.name,
            currentPhase: `Generating ${i + 1} of ${charactersToGenerate.length}`,
            characterIndex: i,
            totalCharacters: charactersToGenerate.length,
            percentage: Math.round((i / charactersToGenerate.length) * 100)
          })

          setGeneratingCharacter(char.name)

          // Generate this character WITHOUT state management (skipStateManagement = true)
          // This ensures it saves to Firestore immediately but doesn't reset our batch state
          console.log(`  📝 Calling generateCharacterMaterials for ${char.name} (ID: ${char.id})`)
          const result = await generateCharacterMaterials(char.name, char.id, true)
          
          if (!result) {
            throw new Error(`Failed to generate materials for ${char.name} - no result returned`)
          }
          
          // Verify the character was actually saved
          const verifyMaterials = await getActorMaterials(user.id, storyBibleId, arcIndex)
          const wasSaved = verifyMaterials?.characters?.some((c: any) => 
            c.characterName.toLowerCase() === char.name.toLowerCase()
          )
          
          if (!wasSaved) {
            console.error(`  ⚠️ WARNING: ${char.name} was not found in saved materials after generation`)
            throw new Error(`Failed to save materials for ${char.name}`)
          }
          
          console.log(`  ✅ Successfully generated and saved ${char.name}`)
          successful.push(char.name)
          
          // Reload materials to get updated remaining characters list
          // This ensures we don't try to regenerate already-completed characters
          const updatedMaterials = await getActorMaterials(user.id, storyBibleId, arcIndex)
          if (updatedMaterials) {
            setMaterials(updatedMaterials)
            console.log(`  📊 Current materials count: ${updatedMaterials.characters.length} characters`)
          }
          
          // Small delay to allow UI to update and Firestore to sync
          await new Promise(resolve => setTimeout(resolve, 300))
          
        } catch (err: any) {
          console.error(`❌ Failed to generate materials for ${char.name}:`, err)
          failed.push({ 
            name: char.name, 
            error: err.message || 'Unknown error' 
          })
          // Continue with next character - don't stop the whole process
        } finally {
          setGeneratingCharacter(null)
        }
      }

      // Final reload to ensure UI is up to date
      const finalMaterials = await getActorMaterials(user.id, storyBibleId, arcIndex)
      if (finalMaterials) {
        setMaterials(finalMaterials)
      }

      // Show summary
      if (failed.length > 0) {
        const failedNames = failed.map(f => f.name).join(', ')
        setError(`${successful.length} character(s) generated successfully. Failed: ${failedNames}. You can retry the failed characters individually.`)
      } else {
        setError(null) // Clear any previous errors
      }

      setGenerationProgress({
        currentCharacter: 'Complete',
        currentPhase: `Generated ${successful.length} of ${charactersToGenerate.length} characters`,
        characterIndex: charactersToGenerate.length,
        totalCharacters: charactersToGenerate.length,
        percentage: 100
      })
      
      console.log(`✅ Batch generation complete: ${successful.length} successful, ${failed.length} failed`)

    } catch (err: any) {
      console.error('❌ Error in batch generation:', err)
      setError(err.message || 'Failed to generate some characters')
    } finally {
      // CRITICAL: Always clear generation state to stop the loop
      console.log('  Clearing generation state...')
      setGenerating(false)
      setGeneratingCharacter(null)
      setIsGeneratingBatch(false) // Clear guard flag
      setTimeout(() => setGenerationProgress(undefined), 2000) // Keep final state visible longer
      console.log('  ✅ Generation state cleared - loop should stop')
    }
  }

  // Generate materials with real-time progress
  const handleGenerate = async () => {
    if (!storyBible || !user?.id) return

    setGenerating(true)
    setError(null)
    setGenerationProgress(undefined)
    setGeneratingCharacter(null)

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
      const totalChars = mainCharacters // Generate for all characters
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
                
                // Always use backend's totalCharacters if provided, otherwise use local calculation
                const backendTotalChars = data.totalCharacters
                if (backendTotalChars) {
                  setTotalCharacters(backendTotalChars)
                }
                
                setGenerationProgress({
                  currentCharacter: data.characterName || 'Processing...',
                  currentPhase: phaseName,
                  characterIndex: data.characterIndex ?? 0,
                  totalCharacters: backendTotalChars ?? totalChars,
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
    } finally {
      setGenerating(false)
      setTimeout(() => setGenerationProgress(undefined), 1000) // Keep final state visible briefly
    }
  }

  // Delete all actor materials (DEBUG ONLY)
  const handleDeleteAllMaterials = async () => {
    if (!user?.id || !storyBibleId) return
    
    const confirmed = window.confirm(
      '⚠️ DEBUG: Are you sure you want to DELETE ALL actor materials for this arc?\n\n' +
      'This action cannot be undone. This will permanently delete all generated materials.\n\n' +
      'Click OK to delete, or Cancel to abort.'
    )
    
    if (!confirmed) return
    
    try {
      console.log('🗑️ Deleting all actor materials (DEBUG)...')
      await deleteActorMaterials(user.id, storyBibleId, arcIndex)
      
      // Reload page to show generation screen
      setMaterials(null)
      setShowViewer(false)
      setError(null)
      
      // Force reload to clear any cached state
      window.location.reload()
    } catch (err: any) {
      console.error('❌ Error deleting actor materials:', err)
      setError(`Failed to delete materials: ${err.message}`)
    }
  }

  // Regenerate materials
  const handleRegenerate = async (newTechnique?: ActingTechnique, characterName?: string, characterId?: string) => {
    // If character is specified, regenerate only that character
    if (characterName && characterId) {
      // Set the new technique if provided
      if (newTechnique !== undefined) {
        setSelectedTechnique(newTechnique)
      }
      
      // Regenerate just this character with the new technique
      await handleGenerateCharacter(characterName, characterId)
      return
    }
    
    // Otherwise, regenerate all characters
    // Set the new technique if provided
    if (newTechnique !== undefined) {
      setSelectedTechnique(newTechnique)
    }
    
    // Clear existing materials and show generation modal
    setMaterials(null)
    setShowGenerationModal(false) // Close any existing modal
    setShowViewer(false) // Hide viewer
    
    // Start generation (this will show the generation progress)
    await handleGenerate()
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
            onClick={() => router.push(`/dashboard${storyBibleId ? `?id=${storyBibleId}` : ''}`)}
            className={`px-4 py-2 rounded-lg ${prefix}-btn-primary`}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const arc = storyBible?.narrativeArcs?.[arcIndex]

  // Helper function to extract character names from scene text
  const extractAllCharacterNames = (sceneText: string): string[] => {
    const names = new Set<string>()
    const lines = sceneText.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      // Character names in screenplay are ALL CAPS on their own line
      if (trimmed && trimmed === trimmed.toUpperCase() && trimmed.length > 2 && trimmed.length < 30) {
        // Filter out common scene headings
        if (!trimmed.startsWith('INT.') && !trimmed.startsWith('EXT.') && !trimmed.startsWith('FADE')) {
          // Remove parentheticals like (CONT'D)
          const cleanName = trimmed.replace(/\(.*?\)/g, '').trim()
          if (cleanName) {
            names.add(cleanName)
          }
        }
      }
    }

    return Array.from(names)
  }

  // Get list of characters for this arc - from MULTIPLE sources to ensure completeness
  const getCharactersForArc = () => {
    if (!storyBible) return []
    
    // Collect all character names from MULTIPLE sources
    const charactersInArc = new Set<string>()
    const episodeNumbers = getEpisodeRangeForArc(storyBible, arcIndex)
    
    console.log(`[Character Extraction] Processing ${episodeNumbers.length} episodes in arc: ${episodeNumbers.join(', ')}`)
    console.log(`[Character Extraction] Episode data available: ${Object.keys(episodeData).join(', ')}`)
    console.log(`[Character Extraction] Pre-prod data available: ${Object.keys(episodePreProdData).join(', ')}`)
    
    // SOURCE 1: Script breakdown scenes (most accurate)
    let hasScriptBreakdown = false
    for (const episodeNum of episodeNumbers) {
      const preProd = episodePreProdData[episodeNum]
      const scriptBreakdown = preProd?.scriptBreakdown
      
      if (scriptBreakdown?.scenes && Array.isArray(scriptBreakdown.scenes)) {
        hasScriptBreakdown = true
        console.log(`[Character Extraction] Episode ${episodeNum}: Found ${scriptBreakdown.scenes.length} scenes in script breakdown`)
        for (const scene of scriptBreakdown.scenes) {
          // Extract characters from script breakdown scene
          if (scene.characters && Array.isArray(scene.characters)) {
            for (const char of scene.characters) {
              // ScriptBreakdownCharacter has a 'name' property
              const charName = char.name || (typeof char === 'string' ? char : null)
              if (charName && typeof charName === 'string' && charName.trim()) {
                charactersInArc.add(charName.trim())
              }
            }
          }
        }
      } else {
        console.log(`[Character Extraction] Episode ${episodeNum}: No script breakdown found`)
      }
    }
    
    // SOURCE 2: Episode characters list (important for characters that may not be in breakdown)
    for (const episodeNum of episodeNumbers) {
      const episode = episodeData[episodeNum]
      if (episode?.characters) {
        console.log(`[Character Extraction] Episode ${episodeNum}: Found ${episode.characters.length} characters in episode list`)
        for (const char of episode.characters) {
          if (char.importance !== 'minor' && char.name) {
            charactersInArc.add(char.name)
          }
        }
      } else {
        console.log(`[Character Extraction] Episode ${episodeNum}: No episode data or characters list`)
      }
    }
    
    // SOURCE 3: Extract from scene content/screenplay (catch characters mentioned in dialogue/action)
    for (const episodeNum of episodeNumbers) {
      const episode = episodeData[episodeNum]
      if (episode?.scenes) {
        console.log(`[Character Extraction] Episode ${episodeNum}: Processing ${episode.scenes.length} scenes for character extraction`)
        for (const scene of episode.scenes) {
          const sceneText = scene.content || scene.screenplay || ''
          if (sceneText) {
            const extractedNames = extractAllCharacterNames(sceneText)
            if (extractedNames.length > 0) {
              console.log(`[Character Extraction]   Scene ${scene.sceneNumber}: Found ${extractedNames.length} characters: ${extractedNames.join(', ')}`)
            }
            extractedNames.forEach(name => charactersInArc.add(name))
          }
        }
      } else {
        console.log(`[Character Extraction] Episode ${episodeNum}: No scenes found in episode data`)
      }
    }
    
    // SOURCE 4: Also check pre-production scene notes for character mentions
    for (const episodeNum of episodeNumbers) {
      const preProd = episodePreProdData[episodeNum]
      if (preProd?.scenes) {
        console.log(`[Character Extraction] Episode ${episodeNum}: Processing ${preProd.scenes.length} pre-prod scenes for character extraction`)
        for (const preProdScene of preProd.scenes) {
          const sceneText = preProdScene.linkedSceneContent || preProdScene.notes || ''
          if (sceneText) {
            const extractedNames = extractAllCharacterNames(sceneText)
            extractedNames.forEach(name => charactersInArc.add(name))
          }
        }
      }
    }
    
    console.log(`[Character Extraction] Total unique characters found across all ${episodeNumbers.length} episodes: ${charactersInArc.size}`)
    console.log(`[Character Extraction] Characters: ${Array.from(charactersInArc).join(', ')}`)
    console.log(`[Character Extraction] Episodes processed: ${episodeNumbers.length}/${episodeNumbers.length} (${episodeNumbers.join(', ')})`)
    
    // Helper function to normalize character names for matching
    const normalizeName = (name: string): string => {
      return name.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '')
    }
    
    // Helper function to check if two names match (flexible matching)
    const namesMatch = (name1: string, name2: string): boolean => {
      const norm1 = normalizeName(name1)
      const norm2 = normalizeName(name2)
      
      // Exact match
      if (norm1 === norm2) return true
      
      // Check if one contains the other (for "JACE" vs "Jace" or "JASON CALACANIS" vs "JASON")
      if (norm1.includes(norm2) || norm2.includes(norm1)) {
        // Only match if the shorter name is at least 3 characters (avoid false matches)
        const shorter = norm1.length < norm2.length ? norm1 : norm2
        if (shorter.length >= 3) return true
      }
      
      // Check first name match (for "JASON CALACANIS" vs "JASON")
      const firstWord1 = norm1.split(' ')[0]
      const firstWord2 = norm2.split(' ')[0]
      if (firstWord1 === firstWord2 && firstWord1.length >= 3) return true
      
      return false
    }
    
    // Fallback: If no script breakdown available, use all main characters
    if (!hasScriptBreakdown && charactersInArc.size === 0) {
      console.log('[Character Extraction] No script breakdown found, using all main characters')
      if (storyBible.mainCharacters) {
        for (const char of storyBible.mainCharacters) {
          charactersInArc.add(char.name)
        }
      }
    }
    
    const characters: Array<{ id: string; name: string; description: string; imageUrl?: string }> = []
    const seen = new Set<string>()

    // Get characters from story bible - use flexible matching
    if (storyBible.mainCharacters) {
      console.log(`[Character Extraction] Checking ${storyBible.mainCharacters.length} story bible characters against extracted list...`)
      for (const char of storyBible.mainCharacters) {
        const charName = char.name
        if (!charName) continue
        
        // Check if this character appears in extracted list (flexible matching)
        const appearsInArc = Array.from(charactersInArc).some(extractedName => 
          namesMatch(extractedName, charName)
        )
        
        // Also check if character appears in any episode's character list
        let appearsInEpisodeList = false
        for (const episodeNum of episodeNumbers) {
          const episode = episodeData[episodeNum]
          if (episode?.characters) {
            const found = episode.characters.some((epChar: any) => 
              epChar.name && namesMatch(epChar.name, charName) && epChar.importance !== 'minor'
            )
            if (found) {
              appearsInEpisodeList = true
              break
            }
          }
        }
        
        // If character is in story bible and appears in any episode of the arc, include them
        // This ensures we don't miss characters that are in the story but extraction missed
        if ((appearsInArc || appearsInEpisodeList) && !seen.has(charName)) {
          characters.push({
            id: char.id || charName.toLowerCase().replace(/\s+/g, '-'),
            name: charName,
            description: char.description || char.background || '',
            imageUrl: char.visualReference?.imageUrl
          })
          seen.add(charName)
          console.log(`[Character Extraction]   ✓ Included: ${charName} (matched from ${appearsInArc ? 'extraction' : 'episode list'})`)
        } else if (!seen.has(charName)) {
          console.log(`[Character Extraction]   ✗ Skipped: ${charName} (not found in arc)`)
        }
      }
    }

    // Get additional characters from arc episodes that appear in episodes but not in story bible
    for (const episodeNum of episodeNumbers) {
      const episode = episodeData[episodeNum]
      if (episode?.characters) {
        for (const char of episode.characters) {
          const charName = char.name
          if (!charName || char.importance === 'minor') continue
          
          // Check if already added from story bible
          const alreadyAdded = Array.from(seen).some(seenName => namesMatch(seenName, charName))
          
          if (!alreadyAdded) {
            // Check if they appear in extracted list
            const appearsInExtracted = Array.from(charactersInArc).some(extractedName => 
              namesMatch(extractedName, charName)
            )
            
            if (appearsInExtracted && !seen.has(charName)) {
              characters.push({
                id: charName.toLowerCase().replace(/\s+/g, '-'),
                name: charName,
                description: char.description || '',
                imageUrl: undefined
              })
              seen.add(charName)
              console.log(`[Character Extraction]   ✓ Added from episode: ${charName}`)
            }
          }
        }
      }
    }

    console.log(`[Character Extraction] Final character count: ${characters.length}`)
    return characters
  }

  const allCharacters = getCharactersForArc()
  const charactersWithMaterials = materials?.characters?.map(c => c.characterName.toLowerCase()) || []
  const hasManyCharacters = allCharacters.length > 20
  const hasPartialMaterials = materials && materials.characters.length > 0 && materials.characters.length < allCharacters.length
  const allCharactersGenerated = materials && materials.characters.length === allCharacters.length
  
  // Filter out already-generated characters
  const remainingCharacters = allCharacters.filter(
    char => !charactersWithMaterials.includes(char.name.toLowerCase())
  )

  // Determine if we should show viewer or generation screen
  // Default: show viewer if materials exist, show generation if no materials
  // User can override with showViewer state (true = force viewer, false = force generation)
  const shouldShowViewer = showViewer !== null 
    ? showViewer 
    : (materials && materials.characters.length > 0) // Auto-detect: show viewer if materials exist
  
  if (shouldShowViewer && materials && materials.characters.length > 0) {
    // Materials exist - show viewer
    return (
      <>
        <div className="min-h-screen">
          <ActorMaterialsViewer
            materials={materials!}
            storyBible={storyBible}
            onRegenerate={(technique, characterName, characterId) => {
              setPendingRegenerateTechnique(technique)
              if (characterName && characterId) {
                setPendingRegenerateCharacter({ name: characterName, id: characterId })
              } else {
                setPendingRegenerateCharacter(undefined)
              }
              setShowRegenerateConfirm(true)
            }}
            onRegenerateCharacter={handleGenerateCharacter}
            onGenerateCharacter={handleGenerateCharacter}
            onDeleteAllMaterials={handleDeleteAllMaterials}
            allCharacters={allCharacters.map(char => ({
              ...char,
              imageUrl: storyBible?.mainCharacters?.find((c: any) => c.name === char.name)?.visualReference?.imageUrl
            }))}
            generatingCharacter={generatingCharacter}
            generating={generating}
            selectedTechnique={selectedTechnique}
            onOpenGenerationModal={(characterId) => {
              if (characterId) {
                setSelectedCharacterForGeneration(characterId)
              }
              setShowGenerationModal(true)
            }}
            remainingCharacters={remainingCharacters.map(char => ({
              ...char,
              imageUrl: storyBible?.mainCharacters?.find((c: any) => c.name === char.name)?.visualReference?.imageUrl
            }))}
          />
        </div>

        {/* Generation Modal with Real-Time Updates - Always available */}
        <ActorMaterialsGenerationModal
          isOpen={generating}
          progress={generationProgress}
          arcTitle={storyBible?.narrativeArcs?.[arcIndex]?.title || `Arc ${arcIndex + 1}`}
        />

        {/* Regeneration Confirmation Modal */}
        <RegenerateConfirmModal
          isOpen={showRegenerateConfirm}
          onClose={() => {
            setShowRegenerateConfirm(false)
            setPendingRegenerateTechnique(undefined)
            setPendingRegenerateCharacter(undefined)
          }}
          onConfirm={() => {
            handleRegenerate(
              pendingRegenerateTechnique,
              pendingRegenerateCharacter?.name,
              pendingRegenerateCharacter?.id
            )
          }}
          technique={pendingRegenerateTechnique}
          currentTechnique={materials?.technique}
          characterCount={allCharacters.length}
          characterName={pendingRegenerateCharacter?.name}
        />

        {/* Generation Modal */}
        <ActorMaterialsGenerationScreenModal
          isOpen={showGenerationModal}
          onClose={() => setShowGenerationModal(false)}
          remainingCharacters={remainingCharacters.map(char => ({
            ...char,
            imageUrl: storyBible?.mainCharacters?.find((c: any) => c.name === char.name)?.visualReference?.imageUrl
          }))}
          allCharacters={allCharacters.map(char => ({
            ...char,
            imageUrl: storyBible?.mainCharacters?.find((c: any) => c.name === char.name)?.visualReference?.imageUrl
          }))}
          materials={materials}
          selectedCharacterForGeneration={selectedCharacterForGeneration}
          onSelectCharacter={setSelectedCharacterForGeneration}
          selectedTechnique={selectedTechnique}
          onSelectTechnique={setSelectedTechnique}
          onGenerateSelected={() => {
            // Check both remaining and all characters (for regeneration)
            const char = remainingCharacters.find(c => c.id === selectedCharacterForGeneration) ||
                        allCharacters.find(c => c.id === selectedCharacterForGeneration)
            if (char) {
              handleGenerateCharacter(char.name, char.id)
            }
          }}
          onGenerateAllRemaining={handleGenerateAllRemaining}
          generating={generating}
          generatingCharacter={generatingCharacter}
          error={error}
          hasManyCharacters={hasManyCharacters}
        />
      </>
    )
  }

  // Show generation screen if: no materials OR user explicitly wants generation screen
  if (!shouldShowViewer || !materials || materials.characters.length === 0) {
    return (
      <>
        <div className="min-h-screen p-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.push(`/dashboard${storyBibleId ? `?id=${storyBibleId}` : ''}`)}
                className={`mb-4 flex items-center gap-2 ${prefix}-text-secondary hover:${prefix}-text-primary transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              
              <h1 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
                Actor Performance Preparation Guide
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
                  {hasPartialMaterials 
                    ? `You have materials for ${materials.characters.length} of ${allCharacters.length} characters. Generate materials for remaining characters below, or view existing materials.`
                    : 'Create comprehensive preparation materials for characters in this arc, including study guides, scene breakdowns, performance references, and practice materials.'}
                </p>

                {/* Show existing materials link if partial */}
                {hasPartialMaterials && materials && (
                  <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold ${prefix}-text-primary mb-1`}>
                          ✓ {materials.characters.length} character{materials.characters.length !== 1 ? 's' : ''} already generated
                        </p>
                        <p className={`text-sm ${prefix}-text-secondary`}>
                          {materials.characters.map(c => c.characterName).join(', ')}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowViewer(true)}
                        className={`px-4 py-2 rounded-lg ${prefix}-btn-primary text-sm`}
                      >
                        View Existing Materials
                      </button>
                    </div>
                  </div>
                )}

                {/* Character Selector Dropdown */}
                {remainingCharacters.length > 0 && (
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-3 ${prefix}-text-primary`}>
                      Select Character ({remainingCharacters.length} remaining)
                    </label>
                    <select
                      value={selectedCharacterForGeneration}
                      onChange={(e) => setSelectedCharacterForGeneration(e.target.value)}
                      className={`px-4 py-2 rounded-lg ${prefix}-input w-full max-w-xs`}
                    >
                      <option value="">-- Select a character --</option>
                      {remainingCharacters.map((char) => (
                        <option key={char.id} value={char.id}>
                          {char.name}
                        </option>
                      ))}
                    </select>
                    {selectedCharacterForGeneration && (() => {
                      const selectedChar = remainingCharacters.find(c => c.id === selectedCharacterForGeneration)
                      if (!selectedChar) return null
                      
                      return (
                        <div className={`mt-4 p-4 rounded-lg border ${prefix}-border bg-gradient-to-br ${
                          prefix === 'dark' 
                            ? 'from-black/40 to-[#1a1a1a]/60 border-[#10B981]/20' 
                            : 'from-white/80 to-gray-50/80 border-gray-300'
                        }`}>
                          <div className="flex items-start gap-4">
                            {selectedChar.imageUrl && (
                              <div className="flex-shrink-0">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#10B981]/30 shadow-lg ring-2 ring-[#10B981]/10">
                                  <img
                                    src={selectedChar.imageUrl}
                                    alt={selectedChar.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none'
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-lg font-semibold mb-2 ${prefix}-text-primary`}>
                                {selectedChar.name}
                              </h3>
                              <p className={`text-sm leading-relaxed ${prefix}-text-secondary`}>
                                {selectedChar.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}

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
          
                {/* Generate Buttons */}
                {remainingCharacters.length > 0 ? (
                  <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
                      onClick={() => {
                        const char = remainingCharacters.find(c => c.id === selectedCharacterForGeneration)
                        if (char) {
                          handleGenerateCharacter(char.name, char.id)
                        }
                      }}
                      disabled={generating || !selectedCharacterForGeneration}
                      className={`px-6 py-3 rounded-lg font-semibold ${
                        selectedCharacterForGeneration && !generating
                          ? `${prefix}-btn-primary`
                          : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {generating && generatingCharacter ? `Generating ${generatingCharacter}...` : 'Generate Selected Character'}
            </button>
                    
                    {remainingCharacters.length > 1 && (
                      <button
                        onClick={handleGenerateAllRemaining}
                  disabled={generating}
                        className={`px-6 py-3 rounded-lg font-semibold ${prefix}-btn-primary disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                        {generating && !generatingCharacter ? 'Generating...' : `Generate All Remaining (${remainingCharacters.length})`}
            </button>
                    )}
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                    <p className={`${prefix}-text-primary font-semibold`}>
                      ✓ All characters have been generated!
                    </p>
                  </div>
                )}
                
                {hasManyCharacters && remainingCharacters.length > 0 && (
                  <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className={`text-sm ${prefix}-text-secondary`}>
                      ⚠️ Generating all {remainingCharacters.length} remaining characters at once may timeout. Consider generating characters one at a time using the dropdown above.
                    </p>
                  </div>
                )}

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

