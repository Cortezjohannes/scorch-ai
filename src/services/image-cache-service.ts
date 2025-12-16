/**
 * Image Cache Service
 * 
 * Handles caching of generated images in Firestore to prevent redundant API calls.
 * Large images are automatically stored in Firebase Storage, with URLs cached in Firestore.
 */

import { db } from '@/lib/firebase'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp
} from 'firebase/firestore'
import { 
  processImageForStorage,
  isBase64Image,
  getImageSizeKB
} from './image-storage-service'

/**
 * Cached image interface
 */
export interface CachedImage {
  prompt: string
  promptHash: string
  finalPrompt: string
  artStyle?: any
  imageUrl: string  // Storage URL or small base64
  source: string    // 'gemini', 'azure', 'openai', 'mock'
  createdAt: Date
  lastUsedAt: Date
  usageCount: number
  userId: string
}

/**
 * Normalize prompt for consistent hashing
 */
function normalizePrompt(prompt: string): string {
  // Trim whitespace and normalize
  return prompt.trim().toLowerCase()
}

/**
 * Normalize art style object for consistent hashing
 */
function normalizeArtStyle(artStyle?: any): string {
  if (!artStyle || typeof artStyle !== 'object') {
    return ''
  }

  // Create a stable string representation
  const styleParts: string[] = []
  
  if (artStyle.name) styleParts.push(`name:${artStyle.name}`)
  if (artStyle.description) styleParts.push(`desc:${artStyle.description}`)
  if (artStyle.colorTreatment) styleParts.push(`color:${artStyle.colorTreatment}`)
  if (artStyle.renderingStyle) styleParts.push(`render:${artStyle.renderingStyle}`)
  if (artStyle.lineWeight) styleParts.push(`line:${artStyle.lineWeight}`)
  if (artStyle.shadingStyle) styleParts.push(`shade:${artStyle.shadingStyle}`)
  if (artStyle.referenceStyle) styleParts.push(`ref:${artStyle.referenceStyle}`)

  // Sort for consistent ordering
  return styleParts.sort().join('|')
}

/**
 * Generate a SHA-256 hash of prompt + artStyle + context for cache key
 * Uses Web Crypto API for browser compatibility
 */
export async function hashPrompt(prompt: string, artStyle?: any, context?: string): Promise<string> {
  const normalizedPrompt = normalizePrompt(prompt)
  const normalizedStyle = normalizeArtStyle(artStyle)
  const normalizedContext = context ? `|CONTEXT|${context}` : ''
  
  // Combine prompt, style, and context for hashing
  const combined = normalizedPrompt + '|STYLE|' + normalizedStyle + normalizedContext
  
  // Use Web Crypto API for SHA-256 (works in browser and Node.js)
  const encoder = new TextEncoder()
  const data = encoder.encode(combined)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

/**
 * Synchronous hash function (fallback for sync contexts)
 * Uses a simple hash function - less secure but fast
 */
export function hashPromptSync(prompt: string, artStyle?: any, context?: string): string {
  const normalizedPrompt = normalizePrompt(prompt)
  const normalizedStyle = normalizeArtStyle(artStyle)
  const normalizedContext = context ? `|CONTEXT|${context}` : ''
  
  // Combine prompt, style, and context for hashing
  const combined = normalizedPrompt + '|STYLE|' + normalizedStyle + normalizedContext
  
  // Simple hash function (FNV-1a variant)
  let hash = 2166136261
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  
  return hash.toString(36) // Base36 encoding
}

/**
 * Get cached image from Firestore
 * 
 * @param userId User ID
 * @param prompt Original prompt
 * @param artStyle Optional art style object
 * @param context Optional context ('storyboard' | 'story-bible')
 * @returns Cached image or null if not found
 */
export async function getCachedImage(
  userId: string,
  prompt: string,
  artStyle?: any,
  context?: string
): Promise<CachedImage | null> {
  const cacheId = `cache_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  // Detect server-side (no auth context)
  const isServer = typeof window === 'undefined'
  
  if (!userId) {
    console.log(`🔍 [${cacheId}] Cache check skipped (no userId - guest mode)`)
    return null // Guest mode - no caching
  }
  
  // Skip cache check on server-side (no auth, will fail)
  if (isServer) {
    console.log(`⏭️  [${cacheId}] Skipping server-side cache check (no auth context)`)
    return null
  }

  try {
    console.log(`🔍 [${cacheId}] Checking cache`, {
      userId: userId.substring(0, 8) + '...',
      promptLength: prompt.length,
      hasArtStyle: !!artStyle
    })
    
    const hashStartTime = Date.now()
    const promptHash = await hashPrompt(prompt, artStyle)
    const hashDuration = Date.now() - hashStartTime
    
    console.log(`🔑 [${cacheId}] Prompt hash generated`, {
      hash: promptHash.substring(0, 16) + '...',
      hashDuration: `${hashDuration}ms`
    })
    
    const cacheDocRef = doc(db, 'users', userId, 'imageCache', promptHash)
    const cachePath = `users/${userId}/imageCache/${promptHash.substring(0, 16)}...`
    console.log(`📂 [${cacheId}] Checking Firestore path: ${cachePath}`)

    const fetchStartTime = Date.now()
    const docSnap = await getDoc(cacheDocRef)
    const fetchDuration = Date.now() - fetchStartTime

    if (!docSnap.exists()) {
      console.log(`❌ [${cacheId}] Cache miss - document does not exist`, {
        fetchDuration: `${fetchDuration}ms`
      })
      return null
    }

    const data = docSnap.data()

    // Convert Firestore Timestamps to Dates
    const cachedImage: CachedImage = {
      prompt: data.prompt,
      promptHash: data.promptHash,
      finalPrompt: data.finalPrompt || data.prompt,
      artStyle: data.artStyle,
      imageUrl: data.imageUrl,
      source: data.source || 'unknown',
      createdAt: data.createdAt?.toDate() || new Date(),
      lastUsedAt: data.lastUsedAt?.toDate() || new Date(),
      usageCount: data.usageCount || 0,
      userId: data.userId || userId
    }

    console.log(`✅ [${cacheId}] CACHE HIT!`, {
      hash: promptHash.substring(0, 16) + '...',
      fetchDuration: `${fetchDuration}ms`,
      imageUrl: cachedImage.imageUrl.substring(0, 60) + '...',
      imageType: cachedImage.imageUrl.startsWith('data:') ? 'base64' : 'Storage URL',
      source: cachedImage.source,
      usageCount: cachedImage.usageCount,
      createdAt: cachedImage.createdAt.toISOString(),
      lastUsedAt: cachedImage.lastUsedAt.toISOString()
    })

    // Update usage stats (async, don't wait)
    updateCacheUsage(userId, promptHash).then(() => {
      console.log(`📊 [${cacheId}] Cache usage stats updated`)
    }).catch(err => {
      console.warn(`⚠️  [${cacheId}] Failed to update cache usage stats:`, {
        error: err.message,
        stack: err.stack
      })
    })

    return cachedImage
  } catch (error: any) {
    console.error(`❌ [${cacheId}] Error getting cached image:`, {
      error: error.message,
      stack: error.stack,
      userId: userId.substring(0, 8) + '...'
    })
    return null // Fail gracefully - continue with generation
  }
}

/**
 * Update cache usage statistics (last used time and count)
 */
async function updateCacheUsage(userId: string, promptHash: string): Promise<void> {
  try {
    const cacheDocRef = doc(db, 'users', userId, 'imageCache', promptHash)
    
    // Get current count first
    const docSnap = await getDoc(cacheDocRef)
    if (docSnap.exists()) {
      const currentCount = docSnap.data().usageCount || 0
      
      // Update with incremented count
      await updateDoc(cacheDocRef, {
        lastUsedAt: Timestamp.now(),
        usageCount: currentCount + 1
      })
    }
  } catch (error: any) {
    // Don't throw - this is just for stats
    console.warn('⚠️  Failed to update cache usage:', error.message)
  }
}

/**
 * Save image to cache in Firestore
 * 
 * Automatically uploads large base64 images to Storage before caching.
 * 
 * @param userId User ID
 * @param prompt Original prompt
 * @param artStyle Optional art style object
 * @param imageUrl Generated image URL (base64 or external URL)
 * @param source Image source ('gemini', 'azure', 'openai', 'mock')
 * @param finalPrompt Final prompt used (after artStyle transformation)
 * @param context Optional context ('storyboard' | 'story-bible')
 */
export async function saveCachedImage(
  userId: string,
  prompt: string,
  artStyle: any | undefined,
  imageUrl: string,
  source: string,
  finalPrompt?: string,
  context?: string
): Promise<void> {
  const saveId = `save_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  // Detect server-side (no auth context)
  const isServer = typeof window === 'undefined'
  
  if (!userId) {
    console.log(`⚠️  [${saveId}] No userId provided, skipping cache save (guest mode)`)
    return // Guest mode - no caching
  }
  
  // Skip cache save on server-side (no auth, will fail)
  // Client-side migration will handle Storage upload when saving to Firestore
  if (isServer) {
    console.log(`⏭️  [${saveId}] Skipping server-side cache save (no auth context). Client will handle caching when saving to Firestore.`)
    return
  }

  try {
    console.log(`💾 [${saveId}] Starting cache save`, {
      userId: userId.substring(0, 8) + '...',
      promptLength: prompt.length,
      hasArtStyle: !!artStyle,
      context: context || 'none',
      source,
      imageUrlType: imageUrl.startsWith('data:') ? 'base64' : 'external URL',
      imageUrlLength: imageUrl.length
    })
    
    const hashStartTime = Date.now()
    const promptHash = await hashPrompt(prompt, artStyle, context)
    const hashDuration = Date.now() - hashStartTime
    
    console.log(`🔑 [${saveId}] Prompt hash generated`, {
      hash: promptHash.substring(0, 16) + '...',
      hashDuration: `${hashDuration}ms`
    })
    
    // SKIP Storage upload on server-side (no auth context)
    // Storage upload will happen client-side when saving to Firestore
    const isServer = typeof window === 'undefined'
    
    let processedImageUrl = imageUrl
    
    if (!isServer) {
      // Client-side: Upload to Storage
      console.log(`📦 [${saveId}] Processing image for storage (CLIENT-SIDE: ALL base64 images go to Storage)`)
      const processStartTime = Date.now()
      try {
        processedImageUrl = await processImageForStorage(
          userId,
          imageUrl,
          promptHash,
          0 // 0 = upload ALL base64 images to Storage (no threshold)
        )
        const processDuration = Date.now() - processStartTime
        console.log(`✅ [${saveId}] Client-side Storage upload complete`, {
          processDuration: `${processDuration}ms`,
          uploaded: processedImageUrl !== imageUrl
        })
      } catch (error: any) {
        console.warn(`⚠️  [${saveId}] Client-side Storage upload failed, keeping base64:`, error.message)
        // Keep base64 - migration will handle it later
        processedImageUrl = imageUrl
      }
    } else {
      // Server-side: Skip Storage upload (no auth), keep base64
      console.log(`⏭️  [${saveId}] Skipping Storage upload (server-side, no auth). Client will upload when saving to Firestore.`)
      processedImageUrl = imageUrl // Keep base64 - client migration will handle it
    }
    
    const processDuration = 0 // Not used on server
    
    const imageChanged = processedImageUrl !== imageUrl
    console.log(`✅ [${saveId}] Image processing complete`, {
      processDuration: `${processDuration}ms`,
      imageChanged,
      originalType: imageUrl.startsWith('data:') ? 'base64' : 'external URL',
      processedType: processedImageUrl.startsWith('data:') ? 'base64' : 'Storage URL',
      processedUrl: processedImageUrl.substring(0, 60) + '...'
    })

    // Prepare cache document
    const cacheData = {
      prompt,
      promptHash,
      finalPrompt: finalPrompt || prompt,
      artStyle: artStyle || null,
      imageUrl: processedImageUrl, // Storage URL or small base64
      source,
      createdAt: Timestamp.now(),
      lastUsedAt: Timestamp.now(),
      usageCount: 0,
      userId
    }

    const cacheDocRef = doc(db, 'users', userId, 'imageCache', promptHash)
    const cachePath = `users/${userId}/imageCache/${promptHash.substring(0, 16)}...`
    console.log(`📂 [${saveId}] Saving to Firestore: ${cachePath}`)
    
    const saveStartTime = Date.now()
    await setDoc(cacheDocRef, cacheData)
    const saveDuration = Date.now() - saveStartTime

    const imageType = isBase64Image(processedImageUrl) ? 'base64' : 'Storage URL'
    const sizeKB = isBase64Image(processedImageUrl) 
      ? Math.round(getImageSizeKB(processedImageUrl))
      : 'N/A'

    console.log(`✅ [${saveId}] Image cached successfully`, {
      hash: promptHash.substring(0, 16) + '...',
      saveDuration: `${saveDuration}ms`,
      totalDuration: `${Date.now() - hashStartTime}ms`,
      type: imageType,
      size: imageType === 'base64' ? `${sizeKB}KB` : 'N/A',
      source,
      imageUrl: processedImageUrl.substring(0, 60) + '...'
    })
  } catch (error: any) {
    console.error(`❌ [${saveId}] Error saving cached image:`, {
      error: error.message,
      stack: error.stack,
      userId: userId.substring(0, 8) + '...',
      source
    })
    // Don't throw - cache failures shouldn't break image generation
  }
}

