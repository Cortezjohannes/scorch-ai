/**
 * Unified Image Generation with Firebase Storage
 * 
 * This service wraps image generation with automatic Firebase Storage upload.
 * ALL image generation in the app should use this service to ensure images
 * persist across devices via Firebase Storage URLs.
 * 
 * 🎯 MODEL SELECTION:
 * - NANO BANANA (default): Fast, efficient - for Characters, Locations, Arcs, Casting, Props
 * - NANO BANANA PRO: High quality - for Storyboards, Marketing, Hero Images
 * 
 * Flow:
 * 1. Generate image using Gemini (model based on options.model)
 * 2. Upload to Firebase Storage (if userId provided)
 * 3. Return Storage URL (persists forever) instead of base64 (temporary)
 * 
 * Usage:
 * - Client-side: Use generateImageWithStorage() - requires authenticated user
 * - Server-side: Use generateImageWithStorageAdmin() - uses Admin SDK
 */

import { generateImageWithGemini, generateGeminiImage, type GeminiImageOptions, type GeminiImageResponse, type ImageModel } from './gemini-image-generator'
import { uploadImageToStorage, processImageForStorage, isBase64Image } from './image-storage-service'
import { hashPrompt } from './image-cache-service'

export interface ImageGenerationWithStorageOptions extends GeminiImageOptions {
  /** User ID - required for Storage upload */
  userId: string
  /** Context for cache key generation */
  context?: 'storyboard' | 'story-bible' | 'character' | 'marketing' | 'location' | 'prop' | 'costume'
  /** Skip storage upload (returns raw base64) - use only for testing */
  skipStorage?: boolean
}

export interface ImageGenerationWithStorageResult {
  /** Firebase Storage URL (or base64 if skipStorage=true or no userId) */
  imageUrl: string
  /** Whether the image was uploaded to Storage */
  uploadedToStorage: boolean
  /** Original prompt used */
  prompt: string
  /** Generation metadata */
  metadata?: {
    model: string
    aspectRatio: string
    generationTime: number
    storageUploadTime?: number
  }
  /** Error message if generation failed */
  error?: string
  /** Whether generation was successful */
  success: boolean
}

/**
 * Generate an image and automatically upload to Firebase Storage
 * 
 * This is the RECOMMENDED function for all client-side image generation.
 * It ensures images persist across devices by storing them in Firebase Storage.
 * 
 * @param prompt - Image generation prompt
 * @param options - Generation options including userId (required for Storage)
 * @returns Image URL (Firebase Storage URL if userId provided, base64 otherwise)
 */
export async function generateImageWithStorage(
  prompt: string,
  options: ImageGenerationWithStorageOptions
): Promise<ImageGenerationWithStorageResult> {
  const startTime = Date.now()
  const requestId = `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  console.log(`🎨 [${requestId}] Starting image generation with storage`, {
    promptLength: prompt.length,
    promptPreview: prompt.substring(0, 80) + '...',
    userId: options.userId ? options.userId.substring(0, 8) + '...' : 'none',
    context: options.context || 'default',
    hasReferenceImages: !!options.referenceImages?.length,
    skipStorage: options.skipStorage || false
  })
  
  try {
    // Step 1: Generate image using Gemini
    // Model selection: defaults to nano-banana (fast) unless explicitly set
    const genStartTime = Date.now()
    const geminiResult = await generateImageWithGemini(prompt, {
      aspectRatio: options.aspectRatio,
      quality: options.quality,
      style: options.style,
      width: options.width,
      height: options.height,
      referenceImages: options.referenceImages,
      characterDescriptions: options.characterDescriptions,
      characterImageMap: options.characterImageMap,
      artStyleDescription: options.artStyleDescription,
      model: options.model // Pass through model selection (nano-banana or nano-banana-pro)
    })
    const genDuration = Date.now() - genStartTime
    
    if (!geminiResult.success || !geminiResult.imageUrl) {
      console.error(`❌ [${requestId}] Image generation failed:`, geminiResult.error)
      return {
        imageUrl: '',
        uploadedToStorage: false,
        prompt,
        success: false,
        error: geminiResult.error || 'Image generation failed'
      }
    }
    
    console.log(`✅ [${requestId}] Image generated in ${genDuration}ms`, {
      imageType: geminiResult.imageUrl.startsWith('data:') ? 'base64' : 'URL',
      imageSize: geminiResult.imageUrl.length
    })
    
    // Step 2: Upload to Firebase Storage (if userId provided and not skipped)
    let finalImageUrl = geminiResult.imageUrl
    let uploadedToStorage = false
    let storageUploadTime: number | undefined
    
    if (options.userId && !options.skipStorage && isBase64Image(geminiResult.imageUrl)) {
      const uploadStartTime = Date.now()
      const promptHash = await hashPrompt(prompt, undefined, options.context)
      
      console.log(`📤 [${requestId}] Uploading to Firebase Storage...`, {
        userId: options.userId.substring(0, 8) + '...',
        hash: promptHash.substring(0, 16) + '...'
      })
      
      // CRITICAL: Upload to Storage - throw error if it fails
      // NEVER return base64 - this violates IMAGE_GENERATION_AND_STORAGE.md
      finalImageUrl = await uploadImageToStorage(
        options.userId,
        geminiResult.imageUrl,
        promptHash
      )
      
      // CRITICAL: Verify we got a Storage URL, not base64
      if (finalImageUrl.startsWith('data:')) {
        throw new Error('Storage upload failed - received base64 instead of Storage URL')
      }
      
      storageUploadTime = Date.now() - uploadStartTime
      uploadedToStorage = true
      
      console.log(`✅ [${requestId}] Uploaded to Storage in ${storageUploadTime}ms`, {
        storageUrl: finalImageUrl.substring(0, 60) + '...'
      })
    } else if (!options.userId) {
      console.warn(`⚠️ [${requestId}] No userId provided, skipping Storage upload (image won't persist)`)
    } else if (options.skipStorage) {
      console.log(`⏭️ [${requestId}] Storage upload skipped (skipStorage=true)`)
    }
    
    const totalDuration = Date.now() - startTime
    console.log(`✅ [${requestId}] Complete in ${totalDuration}ms`, {
      uploadedToStorage,
      imageType: uploadedToStorage ? 'Storage URL' : 'base64'
    })
    
    return {
      imageUrl: finalImageUrl,
      uploadedToStorage,
      prompt,
      success: true,
      metadata: {
        model: geminiResult.metadata?.model || 'gemini',
        aspectRatio: geminiResult.metadata?.aspectRatio || options.aspectRatio || '1:1',
        generationTime: genDuration,
        storageUploadTime
      }
    }
  } catch (error: any) {
    console.error(`❌ [${requestId}] Image generation error:`, error.message)
    return {
      imageUrl: '',
      uploadedToStorage: false,
      prompt,
      success: false,
      error: error.message || 'Unknown error'
    }
  }
}

/**
 * Generate multiple images with automatic Storage upload
 * 
 * Processes images sequentially to avoid rate limiting.
 * 
 * @param requests - Array of {prompt, options} pairs
 * @param onProgress - Progress callback
 * @returns Array of generation results
 */
export async function generateBatchImagesWithStorage(
  requests: Array<{ prompt: string; options: ImageGenerationWithStorageOptions }>,
  onProgress?: (completed: number, total: number, current: string) => void
): Promise<ImageGenerationWithStorageResult[]> {
  const results: ImageGenerationWithStorageResult[] = []
  
  console.log(`🎨 [Batch] Starting batch generation of ${requests.length} images`)
  
  for (let i = 0; i < requests.length; i++) {
    const { prompt, options } = requests[i]
    
    if (onProgress) {
      onProgress(i, requests.length, prompt.substring(0, 50))
    }
    
    const result = await generateImageWithStorage(prompt, options)
    results.push(result)
    
    // Rate limiting delay between requests
    if (i < requests.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  if (onProgress) {
    onProgress(requests.length, requests.length, 'Complete')
  }
  
  const successCount = results.filter(r => r.success).length
  const storageCount = results.filter(r => r.uploadedToStorage).length
  
  console.log(`✅ [Batch] Complete: ${successCount}/${requests.length} generated, ${storageCount} uploaded to Storage`)
  
  return results
}

/**
 * Helper to ensure an image URL is a Storage URL
 * 
 * If the image is base64, uploads it to Storage first.
 * If it's already a Storage URL, returns as-is.
 * 
 * @param imageUrl - Image URL (base64 or Storage URL)
 * @param userId - User ID for Storage upload
 * @param promptForHash - Prompt to use for hash generation
 * @param context - Context for cache key
 * @returns Firebase Storage URL
 */
export async function ensureStorageUrl(
  imageUrl: string,
  userId: string,
  promptForHash: string,
  context?: string
): Promise<string> {
  // Already a Storage URL
  if (imageUrl.startsWith('https://firebasestorage.googleapis.com/') ||
      imageUrl.startsWith('https://storage.googleapis.com/')) {
    return imageUrl
  }
  
  // Not base64 - external URL, can't upload
  if (!isBase64Image(imageUrl)) {
    console.warn('⚠️ ensureStorageUrl: Cannot upload external URL to Storage')
    return imageUrl
  }
  
  // Upload base64 to Storage
  if (!userId) {
    console.warn('⚠️ ensureStorageUrl: No userId provided, cannot upload to Storage')
    return imageUrl
  }
  
  try {
    const promptHash = await hashPrompt(promptForHash, undefined, context)
    return await uploadImageToStorage(userId, imageUrl, promptHash)
  } catch (error: any) {
    console.error('❌ ensureStorageUrl: Upload failed:', error.message)
    return imageUrl // Return original as fallback
  }
}

// Re-export types for convenience
export type { GeminiImageOptions, GeminiImageResponse }
