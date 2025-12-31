/**
 * Service for generating images for storyboard frames in bulk
 * Extracted from StoryboardsTab for reuse in auto-generation flow
 * 
 * 🎯 Uses NANO BANANA PRO for high quality storyboard images
 */

import type { StoryboardsData, StoryboardFrame } from '@/types/preproduction'
import type { StoryBible } from '@/services/story-bible-service'
import { getStoryboardReferenceImages } from '@/services/storyboard-reference-service'
import { generateImagesInParallel, type ParallelTask } from '@/services/parallel-image-generator'

/**
 * Extract scriptContext fallback from frame data when not available in frame object
 */
function extractFallbackScriptContext(frame: StoryboardFrame, breakdownData?: any, sceneNumber?: number): string | undefined {
  // Try frame.notes first - often contains script-accurate descriptions
  if (frame.notes && frame.notes.trim()) {
    // Look for action-oriented content in notes
    const notes = frame.notes.toLowerCase()

    // Skip technical descriptions
    const technicalTerms = ['shot', 'camera', 'angle', 'wide', 'medium', 'close-up', 'pan', 'tilt', 'dolly', 'static', 'lighting', 'props']
    const hasTechnicalTerm = technicalTerms.some(term => notes.includes(term))

    if (!hasTechnicalTerm && frame.notes.length > 10 && frame.notes.length < 100) {
      return frame.notes.trim()
    }
  }

  // Try dialogueSnippet - extract action context around dialogue
  if (frame.dialogueSnippet && frame.dialogueSnippet.trim()) {
    const dialogue = frame.dialogueSnippet.trim()

    // Look for action context in breakdown data
    if (breakdownData?.scenes && sceneNumber) {
      const sceneData = breakdownData.scenes.find((s: any) => s.sceneNumber === sceneNumber)
      if (sceneData?.linkedSceneContent) {
        // Find dialogue in script and extract surrounding action
        const scriptContent = sceneData.linkedSceneContent.toLowerCase()
        const dialogueIndex = scriptContent.indexOf(dialogue.toLowerCase())

        if (dialogueIndex !== -1) {
          // Extract 50 characters before dialogue for context
          const start = Math.max(0, dialogueIndex - 50)
          const contextBefore = sceneData.linkedSceneContent.substring(start, dialogueIndex).trim()

          // Look for action verbs in the context
          const actionWords = ['says', 'asks', 'replies', 'responds', 'yells', 'whispers', 'grabs', 'looks', 'turns', 'stands', 'sits', 'walks']
          const lastAction = contextBefore.split('.').reverse().find((sentence: string) =>
            actionWords.some(word => sentence.toLowerCase().includes(word))
          )

          if (lastAction && lastAction.trim().length > 5) {
            return lastAction.trim()
          }
        }
      }
    }

    // Fallback: Use dialogue as context
    return `speaking: "${dialogue.length > 30 ? dialogue.substring(0, 30) + '...' : dialogue}"`
  }

  // Try imagePrompt - extract action from prompt
  if (frame.imagePrompt) {
    const prompt = frame.imagePrompt.toLowerCase()

    // Look for action phrases in prompt
    const actionPatterns = [
      /([a-zA-Z\s]+ing)/g, // gerunds like "grabbing", "looking"
      /(grabs?|looks?|turns?|stands?|sits?|walks?|runs?|pokes?|points?)/g, // action verbs
      /(eyes widen|hands clench|fists clench|body tenses)/g // specific reactions
    ]

    for (const pattern of actionPatterns) {
      const matches = [...prompt.matchAll(pattern)]
      if (matches.length > 0) {
        // Return first meaningful action found
        const action = matches[0][0].trim()
        if (action.length > 3 && action.length < 50) {
          return action.charAt(0).toUpperCase() + action.slice(1)
        }
      }
    }
  }

  return undefined
}

export interface GenerateImageProgress {
  current: number
  total: number
  frameId: string | null
}

export interface GenerateImageResult {
  success: number
  failed: number
  errors: Array<{ frameId: string; error: string }>
}

export interface GenerateImageCallbacks {
  onProgress?: (progress: GenerateImageProgress) => void
  onFrameComplete?: (frameId: string, success: boolean, error?: string) => void
  onMinImagesComplete?: (count: number) => void // Called when minimum required images are generated
}

export interface GenerateImageOptions {
  minImagesFirst?: number // Minimum number of images to generate before allowing continuation
}

/**
 * Generate images for all storyboard frames that have image prompts
 * 
 * @param storyboards - The storyboards data containing frames
 * @param currentUserId - User ID for image generation and storage
 * @param onFrameUpdate - Callback to save frame updates to Firestore
 * @param callbacks - Optional progress and completion callbacks
 * @param options - Optional generation options
 * @param storyBible - Story bible data for character image references (optional)
 * @param storyBibleId - Story bible ID for querying recent images (optional)
 * @returns Result with success/failure counts and errors
 */
export async function generateAllStoryboardImages(
  storyboards: StoryboardsData,
  currentUserId: string,
  onFrameUpdate: (frameId: string, updates: { frameImage: string }) => Promise<void>,
  callbacks?: GenerateImageCallbacks,
  options?: GenerateImageOptions,
  storyBible?: StoryBible,
  storyBibleId?: string,
  breakdownData?: any // NEW: Optional breakdown data to extract scene characters
): Promise<GenerateImageResult> {
  console.log('🎨 [Bulk Image Generation] Starting image generation for all frames...')
  
  // Collect all frames with image prompts
  // Skip frames that already have Storage URLs (already generated and saved)
  const allFrames: Array<{ frame: StoryboardFrame; sceneNumber: number }> = []
  storyboards.scenes?.forEach((scene) => {
    scene.frames?.forEach((frame: StoryboardFrame) => {
      if (frame.imagePrompt) {
        // Skip if frame already has a Storage URL (already generated and saved)
        const hasStorageUrl = frame.frameImage && 
          (frame.frameImage.startsWith('https://firebasestorage.googleapis.com/') ||
           frame.frameImage.startsWith('https://storage.googleapis.com/'))
        
        if (!hasStorageUrl) {
          allFrames.push({ frame, sceneNumber: scene.sceneNumber })
        } else {
          console.log(`⏭️ [Bulk Image Generation] Skipping frame ${frame.id} - already has Storage URL`)
        }
      }
    })
  })

  console.log(`📸 [Bulk Image Generation] Found ${allFrames.length} frames with image prompts`)

  if (allFrames.length === 0) {
    console.log('ℹ️ [Bulk Image Generation] No frames with image prompts found, skipping image generation')
    return { success: 0, failed: 0, errors: [] }
  }

  // Initialize progress
  if (callbacks?.onProgress) {
    callbacks.onProgress({ current: 0, total: allFrames.length, frameId: null })
  }

  const result: GenerateImageResult = {
    success: 0,
    failed: 0,
    errors: []
  }

  // Get art style from storyboards data if available
  const artStyle = storyboards.artStyle

  // Create tasks for parallel generation
  const tasks: ParallelTask<{ frameId: string; storageUrl: string }>[] = allFrames.map(({ frame, sceneNumber }) => {
    return {
      id: frame.id,
      execute: async () => {
        console.log(`🎨 [Bulk Image Generation] Generating image for frame ${frame.id} (Scene ${sceneNumber}, Shot ${frame.shotNumber})`)

        // Extract scene characters from breakdown data (most accurate source)
        let sceneCharacters: string[] | undefined
        if (breakdownData?.scenes) {
          const sceneData = breakdownData.scenes.find((s: any) => s.sceneNumber === sceneNumber)
          if (sceneData?.characters && Array.isArray(sceneData.characters)) {
            sceneCharacters = sceneData.characters.map((c: any) => c.name || c).filter((name: string) => name && name.trim())
            if (sceneCharacters && sceneCharacters.length > 0) {
              console.log(`🎨 [Bulk Image Generation] Frame ${frame.id}: Extracted ${sceneCharacters.length} scene characters: ${sceneCharacters.join(', ')}`)
            }
          }
        }

        // Get reference images (character images + recent storyboard images) and character descriptions
        let referenceImages: string[] = []
        let characterDescriptions: Array<{ name: string; description: string }> = []
        let characterImageMap: Record<string, string> = {}
        let artStyleDescription: string = ''
        if (storyBible && storyBibleId) {
          try {
            const refData = await getStoryboardReferenceImages(
              frame,
              storyBible,
              storyBibleId,
              currentUserId,
              storyboards.episodeNumber,
              sceneCharacters // NEW: Pass scene characters for precise filtering
            )
            referenceImages = refData.images
            characterDescriptions = refData.characterDescriptions
            characterImageMap = refData.characterImageMap || {}
            artStyleDescription = refData.artStyleDescription || ''
            
            // Validate character images are present
            const characterImageCount = Object.keys(characterImageMap).length
            if (characterImageCount === 0) {
              console.warn(`⚠️ [Bulk Image Generation] Frame ${frame.id}: NO CHARACTER IMAGES FOUND! Characters may not match story bible.`)
            } else {
              console.log(`✅ [Bulk Image Generation] Frame ${frame.id}: Character images validated - ${characterImageCount} character(s) have reference images`)
            }
            
            console.log(`🎨 [Bulk Image Generation] Frame ${frame.id}: Using ${referenceImages.length} reference image(s), ${characterDescriptions.length} character description(s), ${characterImageCount} character image mapping(s), art style: ${artStyleDescription}`)
            
            // Log which characters are mapped
            if (characterImageCount > 0) {
              const mappedCharacters = Object.keys(characterImageMap).join(', ')
              console.log(`👥 [Bulk Image Generation] Frame ${frame.id}: Character mappings: ${mappedCharacters}`)
            }
          } catch (refError: any) {
            console.warn(`⚠️ [Bulk Image Generation] Failed to get reference images for frame ${frame.id}:`, refError.message)
            // Continue without reference images - graceful degradation
          }
        }

        // Enhance prompt with scriptContext for tighter relevance
        let enhancedPrompt = frame.imagePrompt
        let extractedScriptContext: string | undefined

        if (frame.scriptContext) {
          // If frame has scriptContext, create a tighter prompt structure
          console.log(`🎨 [Bulk Image Generation] Frame ${frame.id}: Using existing scriptContext: "${frame.scriptContext}"`)
          extractedScriptContext = frame.scriptContext
        } else {
          // Fallback: Extract scriptContext from available frame data
          console.warn(`⚠️ [Bulk Image Generation] Frame ${frame.id}: No scriptContext in frame - attempting fallback extraction`)

          extractedScriptContext = extractFallbackScriptContext(frame, breakdownData, sceneNumber)
          if (extractedScriptContext) {
            console.log(`✅ [Bulk Image Generation] Frame ${frame.id}: Extracted fallback scriptContext: "${extractedScriptContext}"`)
          } else {
            console.warn(`⚠️ [Bulk Image Generation] Frame ${frame.id}: Could not extract fallback scriptContext - using original prompt`)
          }
        }

        if (extractedScriptContext && enhancedPrompt) {
          // Extract location/setting from existing prompt if available
          const locationMatch = enhancedPrompt.match(/^([^,]+),\s*/)
          const location = locationMatch ? locationMatch[1] : 'Scene setting'

          // Create enhanced prompt that prioritizes scriptContext
          enhancedPrompt = `${location}, ${extractedScriptContext}, ${enhancedPrompt.replace(/^[^,]+,\s*/, '')}`

          console.log(`🎨 [Bulk Image Generation] Frame ${frame.id}: Enhanced prompt: "${enhancedPrompt.substring(0, 100)}..."`)
        }

        // Ensure enhancedPrompt is defined before using it
        if (!enhancedPrompt) {
          console.error(`❌ [Bulk Image Generation] Frame ${frame.id}: No image prompt available, skipping image generation`)
          throw new Error(`Frame ${frame.id} has no image prompt`)
        }

        // Call image generation API
        // 🎯 Use NANO BANANA PRO for high quality storyboard images
        // 🎯 Use SQUARE (1:1) aspect ratio for storyboard frames
        const imageResponse = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            scriptContext: frame.scriptContext || undefined, // Pass scriptContext for validation
            artStyle: artStyle || undefined,
            userId: currentUserId,
            referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
            characterDescriptions: characterDescriptions.length > 0 ? characterDescriptions : undefined,
            characterImageMap: Object.keys(characterImageMap).length > 0 ? characterImageMap : undefined,
            artStyleDescription: artStyleDescription || undefined,
            aspectRatio: '1:1', // SQUARE orientation for storyboard frames
            model: 'nano-banana-pro' // High quality for storyboards
          })
        })

        if (!imageResponse.ok) {
          const contentType = imageResponse.headers.get('content-type') || ''
          const isJSON = contentType.includes('application/json')
          const text = await imageResponse.text()
          
          if (!isJSON && (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html'))) {
            throw new Error('Server returned HTML error page')
          }
          
          let errorMessage = 'Image generation failed'
          if (isJSON && text) {
            try {
              const errorData = JSON.parse(text)
              errorMessage = errorData.error || errorData.message || errorMessage
            } catch {
              errorMessage = text.substring(0, 200) || `Server error: ${imageResponse.status}`
            }
          } else {
            errorMessage = text.substring(0, 200) || `Server error: ${imageResponse.status}`
          }
          throw new Error(errorMessage)
        }

        const imageText = await imageResponse.text()
        if (!imageText) {
          throw new Error('Empty response from server')
        }

        // Check if response is HTML (error page)
        if (imageText.trim().startsWith('<!DOCTYPE') || imageText.trim().startsWith('<html')) {
          throw new Error('Server returned HTML instead of JSON')
        }

        let imageResult
        try {
          imageResult = JSON.parse(imageText)
        } catch (e) {
          throw new Error('Failed to parse JSON response')
        }

        let imageUrl = imageResult.imageUrl || imageResult.url
        if (!imageUrl) {
          throw new Error('No image URL in response')
        }

        // Handle Storage URL or upload to Storage
        let finalImageUrl: string
        const isAlreadyStorageUrl = imageUrl.includes('firebasestorage.googleapis.com') || 
                                     imageUrl.startsWith('https://storage.googleapis.com/')
        
        if (isAlreadyStorageUrl) {
          finalImageUrl = imageUrl
          console.log(`✅ [Bulk Image Generation] Frame ${frame.id}: API returned Storage URL`)
        } else {
          // Upload to Storage client-side
          console.log(`📤 [Bulk Image Generation] Uploading frame ${frame.id} to Firebase Storage...`)
          const { uploadImageToStorage } = await import('@/services/image-storage-service')
          const { hashPrompt } = await import('@/services/image-cache-service')
          
          // Convert external URLs to base64 if needed
          let imageDataToUpload = imageUrl
          if (!imageUrl.startsWith('data:')) {
            const fetchResponse = await fetch(imageUrl)
            if (!fetchResponse.ok) {
              throw new Error(`Failed to fetch external image: ${fetchResponse.statusText}`)
            }
            const imageBlob = await fetchResponse.blob()
            imageDataToUpload = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(imageBlob)
            })
          }
          
          const promptHash = await hashPrompt(frame.imagePrompt || `frame-${frame.id}`, artStyle || undefined)
          finalImageUrl = await uploadImageToStorage(currentUserId, imageDataToUpload, promptHash)
          console.log(`✅ [Bulk Image Generation] Frame ${frame.id} uploaded to Storage: ${finalImageUrl.substring(0, 50)}...`)
          console.log(`🔗 [Bulk Image Generation] Frame ${frame.id} FULL Storage URL:`, finalImageUrl)
        }

        // CRITICAL: Validate Storage URL before saving - MUST be a Firebase Storage URL
        const isStorageUrl = finalImageUrl.startsWith('https://firebasestorage.googleapis.com/') || 
                            finalImageUrl.startsWith('https://storage.googleapis.com/')
        
        if (!isStorageUrl) {
          console.error(`❌ [Bulk Image Generation] Frame ${frame.id}: CRITICAL ERROR - Image is NOT a Storage URL!`, {
            frameId: frame.id,
            sceneNumber: frame.sceneNumber,
            shotNumber: frame.shotNumber,
            urlType: finalImageUrl.startsWith('data:') ? 'base64' : 'unknown',
            urlPreview: finalImageUrl.substring(0, 100) + '...',
            urlLength: finalImageUrl.length
          })
          throw new Error('Invalid Storage URL format - image must be uploaded to Firebase Storage first')
        }
        
        // Log successful Storage URL validation
        console.log(`✅ [Bulk Image Generation] Frame ${frame.id}: Valid Storage URL confirmed`, {
          frameId: frame.id,
          sceneNumber: frame.sceneNumber,
          shotNumber: frame.shotNumber,
          storageUrl: finalImageUrl.substring(0, 80) + '...',
          urlLength: finalImageUrl.length
        })

        // Save frame update via callback
        console.log(`💾 [Bulk Image Generation] Saving frame ${frame.id} to Firestore...`, {
          frameId: frame.id,
          storageUrl: finalImageUrl,
          urlLength: finalImageUrl.length,
          isStorageUrl: finalImageUrl.startsWith('https://firebasestorage.googleapis.com/') || finalImageUrl.startsWith('https://storage.googleapis.com/'),
          sceneNumber: frame.sceneNumber,
          shotNumber: frame.shotNumber
        })
        const saveStartTime = Date.now()
        await onFrameUpdate(frame.id, {
          frameImage: finalImageUrl
        })
        const saveDuration = Date.now() - saveStartTime
        console.log(`✅ [Bulk Image Generation] Frame ${frame.id} saved in ${saveDuration}ms`)

        return { frameId: frame.id, storageUrl: finalImageUrl }
      },
      onError: (error: Error) => {
        console.error(`❌ [Bulk Image Generation] Error generating image for frame ${frame.id}:`, error.message)
      }
    }
  })

  // Track success count for minImagesFirst callback
  let currentSuccessCount = 0

  // Execute tasks in parallel with batching
  const parallelResult = await generateImagesInParallel(tasks, {
    onProgress: (completed, total, currentId) => {
      if (callbacks?.onProgress) {
        callbacks.onProgress({ current: completed, total, frameId: currentId || null })
      }
    },
    onTaskComplete: (id, success, error) => {
      if (success) {
        currentSuccessCount++
        result.success++
        
        console.log(`✅ [Bulk Image Generation] Image generated and saved to Firestore`, {
          frameId: id,
          successCount: result.success,
          failedCount: result.failed
        })
        
        // Check if we've reached the minimum required images
        if (options?.minImagesFirst && currentSuccessCount === options.minImagesFirst && callbacks?.onMinImagesComplete) {
          console.log(`🎯 [Bulk Image Generation] Minimum ${options.minImagesFirst} images completed!`)
          callbacks.onMinImagesComplete(currentSuccessCount)
        }
      } else {
        result.failed++
        result.errors.push({ frameId: id, error: error || 'Unknown error' })
      }
      
      if (callbacks?.onFrameComplete) {
        callbacks.onFrameComplete(id, success, error)
      }
    },
    rateLimitRPM: 20,
    sequentialCount: 3,
    batchSize: 12
  })

  // Update result counts from parallel execution (already updated in callbacks, but ensure consistency)
  result.success = parallelResult.success
  result.failed = parallelResult.failed

  console.log(`✅ [Bulk Image Generation] Image generation completed: ${result.success} succeeded, ${result.failed} failed`)
  
  // Clear progress
  if (callbacks?.onProgress) {
    callbacks.onProgress({ current: allFrames.length, total: allFrames.length, frameId: null })
  }

  return result
}

