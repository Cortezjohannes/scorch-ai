/**
 * Pre-Production Firestore Service
 * Handles data persistence and real-time synchronization
 */

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getStoryBible } from './story-bible-service'
import type { 
  PreProductionData, 
  EpisodePreProductionData, 
  ArcPreProductionData,
  Comment,
  Location,
  LocationsData
} from '@/types/preproduction'
import { 
  processImageForStorage,
  isBase64Image,
  shouldUploadToStorage,
  getImageSizeKB
} from './image-storage-service'
import { hashPromptSync } from './image-cache-service'

// Helper function to get episode range for an arc
export function getEpisodeRangeForArc(storyBible: any, arcIndex: number): number[] {
  if (!storyBible?.narrativeArcs) return []
  
  let runningCount = 0
  for (let i = 0; i < arcIndex; i++) {
    runningCount += storyBible.narrativeArcs[i].episodes?.length || 10
  }
  
  const arc = storyBible.narrativeArcs[arcIndex]
  const arcEpisodeCount = arc?.episodes?.length || 10
  
  return Array.from({ length: arcEpisodeCount }, (_, i) => runningCount + i + 1)
}

// Helper functions to get correct nested paths
function getPreProductionPath(userId: string, storyBibleId: string): string {
  // Skip users/ part if userId is empty (guest mode)
  if (!userId || userId.trim() === '') {
    return `storyBibles/${storyBibleId}/preproduction`
  }
  return `users/${userId}/storyBibles/${storyBibleId}/preproduction`
}

function getPreProductionDocPath(userId: string, storyBibleId: string, docId: string): string {
  // Skip users/ part if userId is empty (guest mode)
  if (!userId || userId.trim() === '') {
    return `storyBibles/${storyBibleId}/preproduction/${docId}`
  }
  return `users/${userId}/storyBibles/${storyBibleId}/preproduction/${docId}`
}

/**
 * Get the pre-production collection reference with proper nested path building
 * Firestore requires step-by-step path building, not full path strings
 * Works on both client and server side (Firebase v9+ supports SSR)
 */
function getPreProductionCollectionRef(userId: string, storyBibleId: string) {
  if (!userId || userId.trim() === '') {
    // Guest mode: storyBibles/{storyBibleId}/preproduction
    const storyBiblesRef = collection(db, 'storyBibles')
    const storyBibleRef = doc(storyBiblesRef, storyBibleId)
    return collection(storyBibleRef, 'preproduction')
  } else {
    // User mode: users/{userId}/storyBibles/{storyBibleId}/preproduction
    const usersRef = collection(db, 'users')
    const userRef = doc(usersRef, userId)
    const storyBiblesRef = collection(userRef, 'storyBibles')
    const storyBibleRef = doc(storyBiblesRef, storyBibleId)
    return collection(storyBibleRef, 'preproduction')
  }
}

// ============================================================================
// IMAGE MIGRATION TO STORAGE (PREVENT 1MB LIMIT)
// ============================================================================

/**
 * Recursively find and migrate large base64 images to Firebase Storage
 * This prevents Firestore documents from exceeding the 1MB limit
 * 
 * @param data Object to process (may be nested)
 * @param userId User ID for Storage path
 * @returns Processed object with Storage URLs instead of large base64 images
 */
async function migrateLargeImagesToStorage(
  data: any,
  userId: string,
  parentUpdateId?: string
): Promise<any> {
  const migrateId = parentUpdateId ? `${parentUpdateId}_migrate` : `migrate_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  if (!userId) {
    console.log(`⚠️  [${migrateId}] Guest mode - skipping image migration`)
    return data
  }

  if (data === null || data === undefined) {
    return data
  }

  // Handle strings - check if they're base64 images
  if (typeof data === 'string') {
    // ALL base64 images go to Storage - no size threshold!
    if (isBase64Image(data)) {
      // Upload ALL base64 images to Storage
      const imageHash = hashPromptSync(data, {})
      const sizeKB = Math.round(getImageSizeKB(data))
      
      console.log(`📦 [${migrateId}] Uploading base64 image to Storage (ALL images go to Storage)`, {
        size: `${sizeKB}KB`,
        hash: imageHash.substring(0, 16) + '...',
        userId: userId.substring(0, 8) + '...'
      })
      
      try {
        const migrationStartTime = Date.now()
        // Upload to Storage with 0KB threshold (upload all base64 images)
        const storageUrl = await processImageForStorage(userId, data, imageHash, 0)
        const migrationDuration = Date.now() - migrationStartTime
        
        if (storageUrl !== data && storageUrl.startsWith('https://')) {
          console.log(`✅ [${migrateId}] Image uploaded to Storage`, {
            duration: `${migrationDuration}ms`,
            size: `${sizeKB}KB`,
            storageUrl: storageUrl.substring(0, 60) + '...'
          })
          return storageUrl
        } else {
          console.warn(`⚠️  [${migrateId}] Image upload failed or returned non-Storage URL`, {
            returnedUrl: storageUrl.substring(0, 60) + '...',
            isStorageUrl: storageUrl.startsWith('https://')
          })
          // If upload failed, still return the data (will be base64 in Firestore as fallback)
          return data
        }
      } catch (error: any) {
        console.error(`❌ [${migrateId}] Failed to upload image to Storage:`, {
          error: error.message,
          stack: error.stack,
          size: `${sizeKB}KB`,
          hash: imageHash.substring(0, 16) + '...'
        })
        console.warn(`⚠️  [${migrateId}] Keeping original base64 image (upload failed - will be in Firestore as fallback)`)
        // Keep original if upload fails (fallback to Firestore)
        return data
      }
    }
    
    // Check if it's already a Storage URL - skip migration
    if (typeof data === 'string' && !isBase64Image(data)) {
      if (data.startsWith('https://firebasestorage.googleapis.com/') || 
          data.startsWith('https://storage.googleapis.com/')) {
        console.log(`✅ [${migrateId}] Image is already a Storage URL, skipping migration`, {
          url: data.substring(0, 60) + '...',
          userId: userId.substring(0, 8) + '...'
        })
        return data // Return as-is, no migration needed
      }
      // External URL (non-Storage) - return as-is
      console.log(`📦 [${migrateId}] External URL detected (non-Storage), keeping as-is`, {
        url: data.substring(0, 60) + '...'
      })
      return data
    }
    
    // Fallback: return data as-is for non-string types or unrecognized formats
    return data
  }

  // Handle arrays - process each element
  if (Array.isArray(data)) {
    console.log(`🔄 [${migrateId}] Processing array with ${data.length} items`)
    const results = await Promise.all(
      data.map((item, index) => {
        if (index < 5 || index === data.length - 1) { // Log first 5 and last
          console.log(`  [${migrateId}] Processing array item ${index + 1}/${data.length}`)
        }
        return migrateLargeImagesToStorage(item, userId)
      })
    )
    console.log(`✅ [${migrateId}] Array processing complete (${data.length} items)`)
    return results
  }

  // Handle objects - process each property
  if (typeof data === 'object') {
    const keys = Object.keys(data)
    const imageKeys = keys.filter(key => {
      const value = data[key]
      return typeof value === 'string' && isBase64Image(value)  // ALL base64 images
    })
    
    if (imageKeys.length > 0) {
      console.log(`🔄 [${migrateId}] Processing object with ${imageKeys.length} large image(s)`, {
        imageKeys: imageKeys.slice(0, 5) // Log first 5 keys
      })
    }
    
    const processed: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(data)) {
      processed[key] = await migrateLargeImagesToStorage(value, userId)
    }
    
    if (imageKeys.length > 0) {
      console.log(`✅ [${migrateId}] Object processing complete`)
    }
    
    return processed
  }

  // Primitive types - return as-is
  return data
}

// ============================================================================
// CREATE & UPDATE
// ============================================================================

/**
 * Create a new episode pre-production document
 */
export async function createEpisodePreProduction(
  userId: string,
  storyBibleId: string,
  episodeNumber: number,
  episodeTitle: string
): Promise<string> {
  try {
    const preproductionRef = getPreProductionCollectionRef(userId, storyBibleId)
    const docRef = doc(preproductionRef)
    const now = Date.now()
    
    const preProductionData: EpisodePreProductionData = {
      id: docRef.id,
      userId,
      storyBibleId,
      type: 'episode',
      episodeNumber,
      episodeTitle,
      createdAt: now,
      lastUpdated: now,
      collaborators: [{
        userId,
        name: 'Owner', // Will be updated with actual user info
        email: '',
        role: 'owner'
      }],
      generationStatus: 'not-started'
    }
    
    await setDoc(docRef, preProductionData)
    
    console.log('✅ Episode pre-production created:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Error creating episode pre-production:', error)
    throw error
  }
}

/**
 * Create a new production assistant document
 */
export async function createArcPreProduction(
  userId: string,
  storyBibleId: string,
  arcIndex: number,
  arcTitle: string,
  episodeNumbers: number[]
): Promise<string> {
  try {
    const preproductionRef = getPreProductionCollectionRef(userId, storyBibleId)
    const docRef = doc(preproductionRef)
    const now = Date.now()
    
    const preProductionData: ArcPreProductionData = {
      id: docRef.id,
      userId,
      storyBibleId,
      type: 'arc',
      arcIndex,
      arcTitle,
      episodeNumbers,
      createdAt: now,
      lastUpdated: now,
      collaborators: [{
        userId,
        name: 'Owner',
        email: '',
        role: 'owner'
      }],
      generationStatus: 'not-started'
    }
    
    await setDoc(docRef, preProductionData)
    
    console.log('✅ Production assistant created:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Error creating production assistant:', error)
    throw error
  }
}

/**
 * Create a new pre-production document (legacy - use createEpisodePreProduction or createArcPreProduction)
 * @deprecated Use createEpisodePreProduction or createArcPreProduction instead
 */
export async function createPreProduction(
  userId: string,
  storyBibleId: string,
  episodeNumber: number,
  episodeTitle: string
): Promise<string> {
  return createEpisodePreProduction(userId, storyBibleId, episodeNumber, episodeTitle)
}

/**
 * Update pre-production data (partial update)
 * Note: userId and storyBibleId are extracted from updates object for path resolution
 */
export async function updatePreProduction(
  docId: string,
  updates: Partial<PreProductionData>,
  userId: string,
  storyBibleId?: string
): Promise<void> {
  const functionStartId = `func_${Date.now()}_${Math.random().toString(36).substring(7)}`
  console.log(`🚀 [${functionStartId}] ========== updatePreProduction CALLED ==========`)
  console.log(`🚀 [${functionStartId}] Parameters:`, {
    docId,
    userId: userId?.substring(0, 8) + '...' || 'null',
    storyBibleId: storyBibleId || 'null',
    updateKeys: Object.keys(updates),
    hasStoryboards: 'storyboards' in updates && !!updates.storyboards
  })

  // CRITICAL: Log storyboards image data if present
  // Type guard: storyboards only exists on EpisodePreProductionData, not ArcPreProductionData
  if ('storyboards' in updates && updates.storyboards) {
    const storyboards = updates.storyboards as any
    let imageCount = 0
    let storageUrlCount = 0
    const imageFrames: any[] = []
    
    storyboards.scenes?.forEach((scene: any) => {
      scene.frames?.forEach((frame: any) => {
        if (frame.frameImage) {
          imageCount++
          const isStorageUrl = frame.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
                              frame.frameImage.startsWith('https://storage.googleapis.com/')
          if (isStorageUrl) {
            storageUrlCount++
          }
          imageFrames.push({
            frameId: frame.id,
            scene: frame.sceneNumber,
            shot: frame.shotNumber,
            imageType: isStorageUrl ? 'Storage URL ✅' : frame.frameImage.startsWith('data:') ? 'base64 ⚠️' : 'external URL',
            imageLength: frame.frameImage.length,
            imagePreview: frame.frameImage.substring(0, 80) + '...',
            fullUrl: isStorageUrl ? frame.frameImage : undefined
          })
        }
      })
    })
    
    console.log(`📸 [${functionStartId}] STORYBOARDS IMAGE DATA BEING SAVED:`, {
      totalScenes: storyboards.scenes?.length || 0,
      totalFrames: storyboards.scenes?.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0) || 0,
      framesWithImages: imageCount,
      framesWithStorageUrls: storageUrlCount,
      framesWithBase64: imageCount - storageUrlCount,
      imageFrames: imageFrames.slice(0, 5) // Log first 5 frames with images
    })
    
    if (imageCount > 0 && storageUrlCount === 0) {
      console.warn(`⚠️  [${functionStartId}] WARNING: Images found but NO Storage URLs! All ${imageCount} images are base64 or external URLs.`)
    }
    if (imageCount === 0) {
      console.warn(`⚠️  [${functionStartId}] WARNING: No images found in storyboards data being saved!`)
    }
  }
  
  try {
    // Use storyBibleId from parameter or from updates
    const sbId = storyBibleId || (updates as any).storyBibleId
    if (!sbId) {
      console.error(`❌ [${functionStartId}] ERROR: storyBibleId is required for update`)
      throw new Error('storyBibleId is required for update')
    }
    
    const docPath = getPreProductionDocPath(userId, sbId, docId)
    const docRef = doc(db, docPath)
    
    // CRITICAL: Check if document exists before updating
    // If it doesn't exist, we need to create it first or use setDoc
    const docExists = await getDoc(docRef)
    if (!docExists.exists()) {
      console.warn(`⚠️ [${functionStartId}] Document ${docId} does not exist at path ${docPath}, will create it`)
      // If document doesn't exist, we need to merge with existing data or create new
      // For now, log a warning but continue - updateDoc will fail if doc doesn't exist
      // We'll handle this in the catch block
    }
    
    // ========================================
    // MIGRATE LARGE IMAGES TO STORAGE (CRITICAL: Prevent 1MB limit)
    // ========================================
    // Before saving, scan for large base64 images and upload them to Storage
    const updateId = `update_${Date.now()}_${Math.random().toString(36).substring(7)}`
    console.log(`💾 [${updateId}] ========== STARTING PRE-PRODUCTION UPDATE ==========`)
    console.log(`💾 [${updateId}] Starting pre-production update`, {
      docId,
      userId: userId.substring(0, 8) + '...',
      storyBibleId: sbId,
      updateKeys: Object.keys(updates),
      docPath,
      docExists: docExists.exists(),
      hasStoryboards: 'storyboards' in updates && !!updates.storyboards,
      storyboardsType: 'storyboards' in updates ? typeof updates.storyboards : 'none'
    })
    
    // Count images before migration
    let imagesBeforeMigration = 0
    if ('storyboards' in updates && updates.storyboards) {
      const storyboards = updates.storyboards as any
      storyboards.scenes?.forEach((scene: any) => {
        scene.frames?.forEach((frame: any) => {
          if (frame.frameImage) {
            imagesBeforeMigration++
            const isBase64 = typeof frame.frameImage === 'string' && frame.frameImage.startsWith('data:')
            const sizeKB = isBase64 ? Math.round((frame.frameImage.length * 3) / 4 / 1024) : 0
            console.log(`📸 [${updateId}] Found image before migration:`, {
              frameId: frame.id,
              scene: frame.sceneNumber,
              shot: frame.shotNumber,
              isBase64,
              sizeKB: isBase64 ? `${sizeKB}KB` : 'external URL',
              imagePreview: frame.frameImage.substring(0, 60) + '...'
            })
          }
        })
      })
    }
    console.log(`📊 [${updateId}] Total images found before migration: ${imagesBeforeMigration}`)
    
    let processedUpdates = updates
    if (userId && userId !== 'guest') {
      console.log(`🔍 [${updateId}] User authenticated, proceeding with image migration...`)
      try {
        console.log(`🔍 [${updateId}] ========== STARTING IMAGE MIGRATION ==========`)
        console.log(`🔍 [${updateId}] Scanning for base64 images to migrate to Storage...`)
        const migrationStartTime = Date.now()
        processedUpdates = await migrateLargeImagesToStorage(updates, userId, updateId) as Partial<PreProductionData>
        const migrationDuration = Date.now() - migrationStartTime
        
        // Count images after migration
        let imagesAfterMigration = 0
        let storageUrls = 0
        let base64Images = 0
        if ('storyboards' in processedUpdates && processedUpdates.storyboards) {
          const storyboards = processedUpdates.storyboards as any
          storyboards.scenes?.forEach((scene: any) => {
            scene.frames?.forEach((frame: any) => {
              if (frame.frameImage) {
                imagesAfterMigration++
                if (frame.frameImage.startsWith('https://')) {
                  storageUrls++
                } else if (frame.frameImage.startsWith('data:')) {
                  base64Images++
                }
              }
            })
          })
        }
        
        console.log(`✅ [${updateId}] Image migration complete`, {
          duration: `${migrationDuration}ms`,
          imagesBefore: imagesBeforeMigration,
          imagesAfter: imagesAfterMigration,
          storageUrls,
          base64Images
        })
        
        // CRITICAL: Log if images were lost during migration
        if (imagesBeforeMigration > 0 && imagesAfterMigration === 0) {
          console.error(`❌ [${updateId}] CRITICAL: ALL IMAGES WERE LOST DURING MIGRATION!`, {
            imagesBefore: imagesBeforeMigration,
            imagesAfter: imagesAfterMigration
          })
        } else if (imagesBeforeMigration > imagesAfterMigration) {
          console.warn(`⚠️  [${updateId}] WARNING: Some images were lost during migration`, {
            imagesBefore: imagesBeforeMigration,
            imagesAfter: imagesAfterMigration,
            lost: imagesBeforeMigration - imagesAfterMigration
          })
        }
      } catch (error: any) {
        console.error(`⚠️  [${updateId}] Error migrating images to Storage:`, {
          error: error.message,
          stack: error.stack,
          code: error.code
        })
        // Continue with original updates if migration fails
        // This prevents blocking saves due to Storage issues
        console.warn(`⚠️  [${updateId}] Continuing with original updates (migration failed)`)
      }
    } else {
      console.log(`⚠️  [${updateId}] Skipping image migration (guest mode or no userId)`, {
        userId: userId || 'null',
        isGuest: userId === 'guest'
      })
    }
    
    // CRITICAL: Deep clean function to remove ALL undefined values and base64 images
    const deepClean = (obj: any): any => {
      if (obj === null || obj === undefined) {
        return null // Convert undefined to null for Firestore
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => deepClean(item)).filter(item => item !== null && item !== undefined)
      }
      
      if (typeof obj === 'object') {
        const cleaned: Record<string, any> = {}
        for (const [key, value] of Object.entries(obj)) {
          // Skip undefined values
          if (value === undefined) {
            continue
          }
          
          // CRITICAL: If this is frameImage and it's base64, convert to Storage URL or remove
          if (key === 'frameImage' && typeof value === 'string') {
            if (value.startsWith('data:')) {
              console.error(`❌ [${updateId}] CRITICAL: Found base64 image in frameImage! This should have been uploaded to Storage first.`)
              console.error(`❌ [${updateId}] Base64 image length: ${value.length}, cannot save to Firestore`)
              // Don't save base64 - it will fail or exceed size limit
              continue // Skip this field
            } else if (value.startsWith('https://firebasestorage.googleapis.com/') || 
                       value.startsWith('https://storage.googleapis.com/')) {
              // Valid Storage URL - keep it
              cleaned[key] = value
            } else {
              // Unknown format - log and skip
              console.warn(`⚠️ [${updateId}] Unknown frameImage format, skipping: ${value.substring(0, 50)}...`)
              continue
            }
          } else {
            // Recursively clean nested values
            const cleanedValue = deepClean(value)
            if (cleanedValue !== undefined && cleanedValue !== null) {
              cleaned[key] = cleanedValue
            }
          }
        }
        return Object.keys(cleaned).length > 0 ? cleaned : null
      }
      
      return obj
    }
    
    // Filter out undefined values (Firestore doesn't allow them)
    const cleanUpdates: Record<string, any> = {}
    for (const [key, value] of Object.entries(processedUpdates)) {
      if (value !== undefined) {
        const cleaned = deepClean(value)
        if (cleaned !== null && cleaned !== undefined) {
          cleanUpdates[key] = cleaned
        }
      }
    }
    
    // Log what we're saving (after migration)
    let finalImageCount = 0
    let finalStorageUrls = 0
    let finalBase64Images = 0
    let documentSize = 0
    const framesWithImages: any[] = []
    
    if (cleanUpdates.storyboards) {
      const storyboards = cleanUpdates.storyboards as any
      storyboards.scenes?.forEach((scene: any) => {
        scene.frames?.forEach((frame: any) => {
          if (frame.frameImage) {
            finalImageCount++
            const isStorageUrl = frame.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
                                frame.frameImage.startsWith('https://storage.googleapis.com/')
            if (isStorageUrl) {
              finalStorageUrls++
            } else if (frame.frameImage.startsWith('data:')) {
              finalBase64Images++
            }
            
            framesWithImages.push({
              frameId: frame.id,
              scene: frame.sceneNumber,
              shot: frame.shotNumber,
              imageType: isStorageUrl ? 'Storage URL ✅' : frame.frameImage.startsWith('data:') ? 'base64 ⚠️' : 'unknown',
              storageUrl: isStorageUrl ? frame.frameImage : undefined,
              imagePreview: frame.frameImage.substring(0, 80) + '...'
            })
          }
        })
      })
      documentSize = JSON.stringify(cleanUpdates).length
      
      // CRITICAL: Reject base64 images - they cannot be saved to Firestore
      if (finalBase64Images > 0) {
        console.error(`❌ [${updateId}] ========== CRITICAL: REJECTING ${finalBase64Images} BASE64 IMAGES ==========`)
        console.error(`❌ [${updateId}] Base64 images CANNOT be saved to Firestore - they must be uploaded to Storage first!`)
        
        // Remove base64 images from the data before saving
        const storyboards = cleanUpdates.storyboards as any
        storyboards.scenes?.forEach((scene: any) => {
          scene.frames?.forEach((frame: any) => {
            if (frame.frameImage && frame.frameImage.startsWith('data:')) {
              console.error(`❌ [${updateId}] Removing base64 image from frame ${frame.id} - must upload to Storage first`)
              delete frame.frameImage // Remove base64 - it will cause Firestore errors
            }
          })
        })
        
        // Recalculate after removing base64
        finalImageCount = finalStorageUrls
        finalBase64Images = 0
      }
      
      // CRITICAL: Log if we're about to save base64 images
      if (finalImageCount > 0 && finalStorageUrls === 0) {
        console.error(`❌ [${updateId}] ========== CRITICAL: ABOUT TO SAVE ${finalImageCount} BASE64 IMAGES TO FIRESTORE! ==========`)
        console.error(`❌ [${updateId}] These images will NOT persist across devices!`)
        console.error(`❌ [${updateId}] Frames with base64:`, framesWithImages.slice(0, 5))
        throw new Error(`Cannot save ${finalImageCount} base64 images to Firestore - they must be uploaded to Firebase Storage first`)
      }
    }
    
    console.log(`💾 [${updateId}] ========== SAVING TO FIRESTORE ==========`)
    console.log(`💾 [${updateId}] Saving to Firestore:`, {
      docPath,
      updates: Object.keys(cleanUpdates),
      storyboardsUpdate: cleanUpdates.storyboards ? {
        scenes: (cleanUpdates.storyboards as any).scenes?.length || 0,
        totalFrames: (cleanUpdates.storyboards as any).scenes?.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0) || 0,
        framesWithImages: finalImageCount,
        storageUrls: finalStorageUrls,
        base64Images: finalBase64Images,
        hasFrameImages: finalImageCount > 0,
        documentSize: `${Math.round(documentSize / 1024)}KB`
      } : 'none'
    })
    
    // FINAL SAFETY CHECK: Ensure no undefined values in cleanUpdates
    const finalClean: Record<string, any> = {}
    const removeUndefined = (obj: any): any => {
      if (obj === null || obj === undefined) {
        return null
      }
      if (Array.isArray(obj)) {
        return obj.map(removeUndefined).filter(item => item !== null && item !== undefined)
      }
      if (typeof obj === 'object') {
        const cleaned: Record<string, any> = {}
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            const cleanedValue = removeUndefined(value)
            if (cleanedValue !== undefined && cleanedValue !== null) {
              cleaned[key] = cleanedValue
            }
          }
        }
        return Object.keys(cleaned).length > 0 ? cleaned : null
      }
      return obj
    }
    
    for (const [key, value] of Object.entries(cleanUpdates)) {
      const cleaned = removeUndefined(value)
      if (cleaned !== null && cleaned !== undefined) {
        finalClean[key] = cleaned
      }
    }
    
    // CRITICAL: Verify storyboards structure one more time
    if (finalClean.storyboards) {
      const storyboards = finalClean.storyboards as any
      let hasBase64 = false
      let hasUndefined = false
      
      storyboards.scenes?.forEach((scene: any) => {
        scene.frames?.forEach((frame: any) => {
          // Check for undefined
          if (Object.values(frame).some(v => v === undefined)) {
            hasUndefined = true
            console.error(`❌ [${updateId}] Found undefined value in frame ${frame.id}`)
          }
          // Check for base64
          if (frame.frameImage && frame.frameImage.startsWith('data:')) {
            hasBase64 = true
            console.error(`❌ [${updateId}] Found base64 image in frame ${frame.id}`)
          }
        })
      })
      
      if (hasUndefined) {
        throw new Error(`Cannot save to Firestore: Found undefined values in storyboards data`)
      }
      if (hasBase64) {
        throw new Error(`Cannot save to Firestore: Found base64 images - must upload to Storage first`)
      }
    }
    
    const saveStartTime = Date.now()
    
    // CRITICAL: Use setDoc with merge if document doesn't exist, otherwise use updateDoc
    // This ensures images are saved even if the document was just created
    if (!docExists.exists()) {
      console.log(`📝 [${updateId}] Document doesn't exist, using setDoc with merge to create it`)
      // Get existing data if available (from previous read)
      const existingData = docExists.exists() ? (docExists.data() as any) || {} : {}
      await setDoc(docRef, {
        ...existingData,
        ...finalClean,
        id: docId, // Ensure ID is set
        userId: userId, // Ensure userId is set
        storyBibleId: sbId, // Ensure storyBibleId is set
        lastUpdated: Date.now()
      }, { merge: true })
      console.log(`✅ [${updateId}] Document created with setDoc (merge: true)`)
    } else {
      console.log(`📝 [${updateId}] Document exists, using updateDoc`)
      await updateDoc(docRef, {
        ...finalClean,
        lastUpdated: Date.now()
      })
    }
    const saveDuration = Date.now() - saveStartTime
    
    // CRITICAL: Verify the save by reading back the document
    console.log(`🔍 [${updateId}] ========== VERIFYING SAVE BY READING DOCUMENT BACK ==========`)
    const verifyStartTime = Date.now()
    const verifyDoc = await getDoc(docRef)
    const verifyDuration = Date.now() - verifyStartTime
    
    if (verifyDoc.exists()) {
      const savedData = verifyDoc.data()
      if (cleanUpdates.storyboards) {
        const savedStoryboards = savedData.storyboards as any
        let savedImageCount = 0
        let savedStorageUrlCount = 0
        const savedFramesWithImages: any[] = []
        
        savedStoryboards?.scenes?.forEach((scene: any) => {
          scene.frames?.forEach((frame: any) => {
            if (frame.frameImage) {
              savedImageCount++
              const isStorageUrl = frame.frameImage.startsWith('https://firebasestorage.googleapis.com/') || 
                                  frame.frameImage.startsWith('https://storage.googleapis.com/')
              if (isStorageUrl) {
                savedStorageUrlCount++
              }
              
              savedFramesWithImages.push({
                frameId: frame.id,
                scene: frame.sceneNumber,
                shot: frame.shotNumber,
                imageType: isStorageUrl ? 'Storage URL ✅' : frame.frameImage.startsWith('data:') ? 'base64 ⚠️' : 'unknown',
                storageUrl: isStorageUrl ? frame.frameImage : undefined,
                imagePreview: frame.frameImage.substring(0, 80) + '...'
              })
              
              console.log(`📸 [${updateId}] ✅ VERIFIED SAVED IMAGE IN FIRESTORE:`, {
                frameId: frame.id,
                scene: frame.sceneNumber,
                shot: frame.shotNumber,
                imageType: isStorageUrl ? 'Storage URL ✅' : frame.frameImage.startsWith('data:') ? 'base64 ⚠️' : 'unknown',
                storageUrl: isStorageUrl ? frame.frameImage : undefined,
                fullUrl: frame.frameImage, // Log FULL URL
                imagePreview: frame.frameImage.substring(0, 80) + '...'
              })
            }
          })
        })
        
        console.log(`✅ [${updateId}] ========== FIRESTORE SAVE VERIFIED ==========`, {
          docId,
          docPath,
          saveDuration: `${saveDuration}ms`,
          verifyDuration: `${verifyDuration}ms`,
          totalDuration: `${saveDuration + verifyDuration}ms`,
          imagesSaved: savedImageCount,
          storageUrlsSaved: savedStorageUrlCount,
          base64ImagesSaved: savedImageCount - savedStorageUrlCount,
          imagesExpected: finalImageCount,
          storageUrlsExpected: finalStorageUrls,
          match: savedImageCount === finalImageCount ? '✅' : '⚠️ MISMATCH',
          savedFramesWithImages: savedFramesWithImages.slice(0, 5) // Log first 5
        })
        
        if (savedImageCount !== finalImageCount) {
          console.error(`❌ [${updateId}] ========== IMAGE COUNT MISMATCH ==========`, {
            expected: finalImageCount,
            saved: savedImageCount,
            difference: finalImageCount - savedImageCount,
            expectedStorageUrls: finalStorageUrls,
            savedStorageUrls: savedStorageUrlCount
          })
        }
        
        if (savedImageCount > 0 && savedStorageUrlCount === 0) {
          console.error(`❌ [${updateId}] ========== CRITICAL: ${savedImageCount} IMAGES SAVED BUT NONE ARE STORAGE URLS! ==========`)
          console.error(`❌ [${updateId}] This means images will NOT persist across devices!`)
        }
      } else {
        console.log(`✅ [${updateId}] Pre-production updated: ${docId}`, {
          saveDuration: `${saveDuration}ms`,
          verifyDuration: `${verifyDuration}ms`
        })
      }
    } else {
      console.error(`❌ [${updateId}] ========== DOCUMENT DOES NOT EXIST AFTER SAVE! ==========`, {
        docPath,
        docId,
        saveDuration: `${saveDuration}ms`
      })
      throw new Error(`Document ${docId} does not exist after save`)
    }
  } catch (error) {
    console.error('❌ Error updating pre-production:', error)
    throw error
  }
}

/**
 * Update a specific tab's data
 */
export async function updatePreProductionTab(
  docId: string,
  tabName: string,
  tabData: any,
  userId: string,
  storyBibleId?: string
): Promise<void> {
  try {
    if (!storyBibleId) {
      throw new Error('storyBibleId is required for updatePreProductionTab')
    }
    const docPath = getPreProductionDocPath(userId, storyBibleId, docId)
    const docRef = doc(db, docPath)
    
    await updateDoc(docRef, {
      [tabName]: {
        ...tabData,
        lastUpdated: Date.now(),
        updatedBy: userId
      },
      lastUpdated: Date.now()
    })
    
    console.log(`✅ Tab "${tabName}" updated:`, docId)
  } catch (error) {
    console.error(`❌ Error updating tab "${tabName}":`, error)
    throw error
  }
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get pre-production by ID
 * @deprecated Use getEpisodePreProduction or getArcPreProduction instead
 */
export async function getPreProduction(
  docId: string,
  userId: string,
  storyBibleId: string
): Promise<PreProductionData | null> {
  try {
    const docPath = getPreProductionDocPath(userId, storyBibleId, docId)
    const docRef = doc(db, docPath)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as PreProductionData
    }
    
    return null
  } catch (error) {
    console.error('❌ Error getting pre-production:', error)
    throw error
  }
}

/**
 * Get episode pre-production for a specific episode
 */
export async function getEpisodePreProduction(
  userId: string,
  storyBibleId: string,
  episodeNumber: number
): Promise<EpisodePreProductionData | null> {
  try {
    // Skip if guest mode (no userId)
    if (!userId || userId === 'guest') {
      console.log(`⚠️  Skipping Firestore fetch for Episode ${episodeNumber} (guest mode)`)
      return null
    }
    
    const preproductionRef = getPreProductionCollectionRef(userId, storyBibleId)
    const q = query(
      preproductionRef,
      where('type', '==', 'episode'),
      where('episodeNumber', '==', episodeNumber)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      // CRITICAL: Check for duplicate documents
      if (querySnapshot.docs.length > 1) {
        console.warn(`⚠️  [getEpisodePreProduction] Episode ${episodeNumber} - MULTIPLE DOCUMENTS FOUND (${querySnapshot.docs.length})! Using first one.`)
        querySnapshot.docs.forEach((d, idx) => {
          const data = d.data()
          const storyboards = data.storyboards as any
          const imageCount = storyboards?.scenes?.reduce((sum: number, s: any) => 
            sum + (s.frames || []).filter((f: any) => f.frameImage).length, 0
          ) || 0
          console.log(`  Document ${idx + 1}: ID=${d.id}, lastUpdated=${data.lastUpdated}, images=${imageCount}`)
        })
      }
      
      const docSnap = querySnapshot.docs[0]
      const rawData = docSnap.data()
      
      // CRITICAL: Log the RAW data BEFORE type casting
      console.log(`📦 [getEpisodePreProduction] ========== READING EPISODE ${episodeNumber} FROM FIRESTORE ==========`)
      console.log(`📦 [getEpisodePreProduction] Episode ${episodeNumber} - Document ID: ${docSnap.id}`)
      console.log(`📦 [getEpisodePreProduction] Episode ${episodeNumber} - Document path: ${docSnap.ref.path}`)
      console.log(`📦 [getEpisodePreProduction] Episode ${episodeNumber} - RAW Firestore data keys:`, Object.keys(rawData))
      console.log(`📦 [getEpisodePreProduction] Episode ${episodeNumber} - Has storyboards in raw data:`, !!rawData.storyboards)
      console.log(`📦 [getEpisodePreProduction] Episode ${episodeNumber} - lastUpdated:`, rawData.lastUpdated)
      console.log(`📦 [getEpisodePreProduction] Episode ${episodeNumber} - lastUpdated date:`, rawData.lastUpdated ? new Date(rawData.lastUpdated).toISOString() : 'none')
      
      // CRITICAL: Check for multiple documents (this could cause issues)
      if (querySnapshot.docs.length > 1) {
        console.error(`❌ [getEpisodePreProduction] ========== MULTIPLE DOCUMENTS FOUND FOR EPISODE ${episodeNumber}! ==========`)
        querySnapshot.docs.forEach((d, idx) => {
          const data = d.data()
          const storyboards = data.storyboards as any
          const imageCount = storyboards?.scenes?.reduce((sum: number, s: any) => 
            sum + (s.frames || []).filter((f: any) => f.frameImage).length, 0
          ) || 0
          console.error(`  Document ${idx + 1}: ID=${d.id}, lastUpdated=${data.lastUpdated}, images=${imageCount}, path=${d.ref.path}`)
        })
        console.error(`❌ [getEpisodePreProduction] Using FIRST document (ID: ${docSnap.id}) - THIS MAY BE WRONG!`)
      }
      
      const data = rawData as EpisodePreProductionData
      
      // CRITICAL: Log the raw Firestore data to verify images are present
      const storyboards = (data as any).storyboards
      if (storyboards && storyboards.scenes) {
        const totalFrames = storyboards.scenes.reduce((sum: number, s: any) => 
          sum + (Array.isArray(s.frames) ? s.frames.length : 0), 0
        )
        const framesWithImages = storyboards.scenes.reduce((sum: number, s: any) => {
          if (!Array.isArray(s.frames)) return sum
          return sum + s.frames.filter((f: any) => {
            const hasImage = f.frameImage && typeof f.frameImage === 'string' && f.frameImage.trim().length > 0
            if (hasImage) {
              console.log(`  ✅ [getEpisodePreProduction] Episode ${episodeNumber} - Found frameImage in Firestore for Scene ${s.sceneNumber}, Frame ${f.id}:`, {
                frameId: f.id,
                sceneNumber: s.sceneNumber,
                shotNumber: f.shotNumber,
                frameImageLength: f.frameImage.length,
                frameImagePreview: f.frameImage.substring(0, 100),
                isStorageUrl: f.frameImage.startsWith('https://firebasestorage.googleapis.com/') || f.frameImage.startsWith('https://storage.googleapis.com/'),
                frameKeys: Object.keys(f)
              })
            }
            return hasImage
          }).length
        }, 0)
        console.log(`📦 [getEpisodePreProduction] Episode ${episodeNumber} retrieved from Firestore: ${totalFrames} frames, ${framesWithImages} with images`)
        
        // Also log a sample frame structure to see what we're getting
        if (storyboards.scenes.length > 0 && storyboards.scenes[0].frames && storyboards.scenes[0].frames.length > 0) {
          const sampleFrame = storyboards.scenes[0].frames[0]
          console.log(`📦 [getEpisodePreProduction] Sample frame structure from Firestore:`, {
            frameId: sampleFrame.id,
            hasFrameImage: !!sampleFrame.frameImage,
            frameImageType: typeof sampleFrame.frameImage,
            frameImageValue: sampleFrame.frameImage ? String(sampleFrame.frameImage).substring(0, 100) : 'undefined',
            allFrameKeys: Object.keys(sampleFrame),
            frameData: JSON.stringify(sampleFrame).substring(0, 500) // First 500 chars for more detail
          })
          
          // Log ALL frames with images to verify which ones actually have images
          console.log(`📦 [getEpisodePreProduction] Episode ${episodeNumber} - Detailed frame image status:`)
          storyboards.scenes.forEach((scene: any, sIdx: number) => {
            scene.frames?.forEach((frame: any, fIdx: number) => {
              console.log(`  Scene ${scene.sceneNumber} Frame ${fIdx + 1}: frameImage=${frame.frameImage ? 'YES (' + frame.frameImage.substring(0, 50) + '...)' : 'NO'}`)
            })
          })
        }
      } else {
        console.warn(`⚠️  [getEpisodePreProduction] Episode ${episodeNumber} has no storyboards or scenes in Firestore data`)
        console.log(`📦 [getEpisodePreProduction] Episode ${episodeNumber} - rawData keys:`, Object.keys(rawData))
        console.log(`📦 [getEpisodePreProduction] Episode ${episodeNumber} - rawData.storyboards:`, rawData.storyboards)
      }
      
      // Ensure the document ID is included in the returned data
      return {
        ...data,
        id: docSnap.id
      } as EpisodePreProductionData
    }
    
    return null
  } catch (error) {
    console.error('❌ Error getting episode pre-production:', error)
    throw error
  }
}

/**
 * Get production assistant for a specific arc
 */
export async function getArcPreProduction(
  userId: string,
  storyBibleId: string,
  arcIndex: number
): Promise<ArcPreProductionData | null> {
  try {
    // Skip if guest mode (no userId)
    if (!userId || userId === 'guest') {
      console.log(`⚠️  Skipping Firestore fetch for Arc ${arcIndex} (guest mode)`)
      return null
    }

    const preproductionRef = getPreProductionCollectionRef(userId, storyBibleId)
    const q = query(
      preproductionRef,
      where('type', '==', 'arc'),
      where('arcIndex', '==', arcIndex)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0]
      const data = docSnap.data() as ArcPreProductionData
      return {
        ...data,
        id: docSnap.id
      }
    }
    
    return null
  } catch (error) {
    console.error('❌ Error getting production assistant:', error)
    throw error
  }
}

/**
 * Get pre-production for a specific episode (legacy - use getEpisodePreProduction)
 * @deprecated Use getEpisodePreProduction instead
 */
export async function getPreProductionByEpisode(
  userId: string,
  storyBibleId: string,
  episodeNumber: number
): Promise<PreProductionData | null> {
  return getEpisodePreProduction(userId, storyBibleId, episodeNumber)
}

/**
 * Check if production assistant can be unlocked
 * Requirements: All episodes in arc generated AND have episode pre-production done
 */
export interface ArcUnlockStatus {
  canUnlock: boolean
  missingEpisodes: number[]
  missingEpisodePreProd: number[]
}

export async function canUnlockArcPreProduction(
  userId: string,
  storyBibleId: string,
  arcIndex: number,
  generatedEpisodes: Record<number, any>
): Promise<ArcUnlockStatus> {
  try {
    // Get story bible
    const storyBible = await getStoryBible(storyBibleId, userId)
    if (!storyBible?.narrativeArcs?.[arcIndex]) {
      return { canUnlock: false, missingEpisodes: [], missingEpisodePreProd: [] }
    }
    
    // Calculate episode range for this arc
    const episodeRange = getEpisodeRangeForArc(storyBible, arcIndex)
    
    // Check all episodes generated
    const missingEpisodes = episodeRange.filter(ep => !generatedEpisodes[ep])
    
    if (missingEpisodes.length > 0) {
      return { canUnlock: false, missingEpisodes, missingEpisodePreProd: [] }
    }
    
    // Check all episodes have episode pre-production
    const missingEpisodePreProd = []
    for (const epNum of episodeRange) {
      const episodePreProd = await getEpisodePreProduction(userId, storyBibleId, epNum)
      if (!episodePreProd) {
        missingEpisodePreProd.push(epNum)
      }
    }
    
    return {
      canUnlock: missingEpisodePreProd.length === 0,
      missingEpisodes: [],
      missingEpisodePreProd
    }
  } catch (error) {
    console.error('❌ Error checking arc unlock status:', error)
    return { canUnlock: false, missingEpisodes: [], missingEpisodePreProd: [] }
  }
}

/**
 * Get all pre-production documents for a story bible
 */
export async function getAllPreProductionForStoryBible(
  userId: string,
  storyBibleId: string
): Promise<PreProductionData[]> {
  try {
    const preproductionRef = getPreProductionCollectionRef(userId, storyBibleId)
    const q = query(
      preproductionRef,
      where('storyBibleId', '==', storyBibleId)
    )
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => doc.data() as PreProductionData)
  } catch (error) {
    console.error('❌ Error getting all pre-production:', error)
    throw error
  }
}

// ============================================================================
// REAL-TIME LISTENERS
// ============================================================================

/**
 * Subscribe to real-time updates for a pre-production document
 */
export function subscribeToPreProduction(
  userId: string,
  storyBibleId: string,
  docId: string,
  callback: (data: PreProductionData | null) => void
): () => void {
  const docPath = getPreProductionDocPath(userId, storyBibleId, docId)
  const docRef = doc(db, docPath)
  const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  console.log(`👂 [${subId}] Subscribing to pre-production updates:`, {
    docPath,
    userId: userId.substring(0, 8) + '...',
    docId
  })
  
  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      console.log(`📥 [${subId}] onSnapshot callback fired`, {
        exists: docSnap.exists(),
        docId,
        docPath
      })
      
      if (docSnap.exists()) {
        const data = docSnap.data() as PreProductionData
        
        // Log storyboards data if present (only exists on EpisodePreProductionData)
        if (data.type === 'episode' && data.storyboards) {
          const storyboards = data.storyboards as any
          let imageCount = 0
          storyboards.scenes?.forEach((scene: any) => {
            scene.frames?.forEach((frame: any) => {
              if (frame.frameImage) {
                imageCount++
              }
            })
          })
          
          console.log(`📥 [${subId}] Firestore data loaded (via subscription):`, {
            docId,
            hasStoryboards: true,
            scenes: storyboards.scenes?.length || 0,
            totalFrames: storyboards.scenes?.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0) || 0,
            framesWithImages: imageCount,
            lastUpdated: storyboards.lastUpdated,
            lastUpdatedDate: storyboards.lastUpdated ? new Date(storyboards.lastUpdated).toISOString() : 'none'
          })
          
          if (imageCount > 0) {
            console.log(`📸 [${subId}] Found ${imageCount} images in Firestore data`)
            storyboards.scenes?.forEach((scene: any) => {
              scene.frames?.forEach((frame: any) => {
                if (frame.frameImage) {
                  console.log(`  - Scene ${frame.sceneNumber} Shot ${frame.shotNumber}:`, {
                    frameId: frame.id,
                    imageType: frame.frameImage.startsWith('https://') ? 'Storage URL' : 'base64',
                    imageLength: frame.frameImage.length,
                    imagePreview: frame.frameImage.substring(0, 60) + '...'
                  })
                }
              })
            })
      } else {
            console.warn(`⚠️  [${subId}] No images found in Firestore storyboards data!`)
          }
        } else {
          console.log(`📥 [${subId}] Firestore data loaded (via subscription):`, {
            docId,
            hasStoryboards: false
          })
        }
        
        callback(data)
      } else {
        console.warn(`⚠️  [${subId}] Document does not exist in Firestore:`, {
          docPath,
          docId
        })
        callback(null)
      }
    },
    (error: any) => {
      console.error(`❌ [${subId}] ========== CRITICAL FIRESTORE ERROR ==========`)
      console.error(`❌ [${subId}] Error in real-time listener:`, {
        message: error.message,
        code: error.code,
        docPath,
        docId,
        userId: userId?.substring(0, 8) + '...' || 'null'
      })
      
      // Diagnose specific error codes
      if (error.code === 'permission-denied') {
        console.error(`🔒 [${subId}] PERMISSION DENIED - User may not be authenticated or rules blocking access`)
        console.error(`   Check: Is user authenticated? Firestore rules allow read?`)
      } else if (error.code === 'unavailable' || error.message?.includes('UNAVAILABLE')) {
        console.error(`🌐 [${subId}] FIRESTORE UNAVAILABLE - Network or service issue`)
      } else if (error.code === 'unauthenticated') {
        console.error(`🔐 [${subId}] UNAUTHENTICATED - User not authenticated`)
      } else if (error.code === 'failed-precondition') {
        console.error(`⚠️  [${subId}] FAILED PRECONDITION - Firestore rules may be blocking`)
      }
      
      callback(null)
    }
  )
  
  return unsubscribe
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete a pre-production document
 */
export async function deletePreProduction(
  docId: string,
  userId: string,
  storyBibleId: string
): Promise<void> {
  try {
    const docPath = getPreProductionDocPath(userId, storyBibleId, docId)
    const docRef = doc(db, docPath)
    await deleteDoc(docRef)
    
    console.log('✅ Pre-production deleted:', docId)
  } catch (error) {
    console.error('❌ Error deleting pre-production:', error)
    throw error
  }
}

// ============================================================================
// COLLABORATION
// ============================================================================

/**
 * Add a collaborator to a pre-production document
 */
export async function addCollaborator(
  docId: string,
  userId: string,
  storyBibleId: string,
  collaborator: {
    userId: string
    name: string
    email: string
    role: 'crew' | 'viewer'
  }
): Promise<void> {
  try {
    const docPath = getPreProductionDocPath(userId, storyBibleId, docId)
    const docRef = doc(db, docPath)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data() as PreProductionData
      const existingCollaborators = data.collaborators || []
      
      // Check if collaborator already exists
      const existingIndex = existingCollaborators.findIndex(
        c => c.userId === collaborator.userId
      )
      
      if (existingIndex >= 0) {
        // Update existing collaborator
        existingCollaborators[existingIndex] = {
          ...existingCollaborators[existingIndex],
          ...collaborator
        }
      } else {
        // Add new collaborator
        existingCollaborators.push(collaborator)
      }
      
      await updateDoc(docRef, {
        collaborators: existingCollaborators,
        lastUpdated: Date.now()
      })
      
      console.log('✅ Collaborator added:', collaborator.email)
    }
  } catch (error) {
    console.error('❌ Error adding collaborator:', error)
    throw error
  }
}

/**
 * Remove a collaborator from a pre-production document
 */
export async function removeCollaborator(
  docId: string,
  ownerUserId: string,
  storyBibleId: string,
  userIdToRemove: string
): Promise<void> {
  try {
    const docPath = getPreProductionDocPath(ownerUserId, storyBibleId, docId)
    const docRef = doc(db, docPath)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data() as PreProductionData
      const collaborators = (data.collaborators || []).filter(
        c => c.userId !== userIdToRemove
      )
      
      await updateDoc(docRef, {
        collaborators,
        lastUpdated: Date.now()
      })
      
      console.log('✅ Collaborator removed:', userIdToRemove)
    }
  } catch (error) {
    console.error('❌ Error removing collaborator:', error)
    throw error
  }
}

// ============================================================================
// COMMENTS
// ============================================================================

/**
 * Add a comment to a specific item in a tab
 * 
 * @param docId Pre-production document ID
 * @param userId User ID
 * @param storyBibleId Story bible ID
 * @param tabName Tab name (e.g., 'scriptBreakdown')
 * @param itemPath Path to the item (e.g., 'scenes.0' for first scene)
 * @param comment Comment object
 */
export async function addComment(
  docId: string,
  userId: string,
  storyBibleId: string,
  tabName: string,
  itemPath: string,
  comment: Comment
): Promise<void> {
  try {
    const docPath = getPreProductionDocPath(userId, storyBibleId, docId)
    const docRef = doc(db, docPath)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data() as PreProductionData
      const tabData = (data as any)[tabName]
      
      if (tabData) {
        // Navigate to the item using the path
        const pathParts = itemPath.split('.')
        let target = tabData
        
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i]
          if (i === pathParts.length - 1) {
            // Last part - add comment
            if (!target[part].comments) {
              target[part].comments = []
            }
            target[part].comments.push(comment)
          } else {
            target = target[part]
          }
        }
        
        await updateDoc(docRef, {
          [tabName]: tabData,
          lastUpdated: Date.now()
        })
        
        console.log('✅ Comment added to', itemPath)
      }
    }
  } catch (error) {
    console.error('❌ Error adding comment:', error)
    throw error
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch update multiple items in a tab
 */
export async function batchUpdateTabItems(
  docId: string,
  userId: string,
  storyBibleId: string,
  tabName: string,
  updates: Array<{
    itemPath: string
    data: any
  }>
): Promise<void> {
  try {
    const docPath = getPreProductionDocPath(userId, storyBibleId, docId)
    const docRef = doc(db, docPath)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data() as PreProductionData
      const tabData = (data as any)[tabName]
      
      if (tabData) {
        // Apply all updates
        for (const update of updates) {
          const pathParts = update.itemPath.split('.')
          let target = tabData
          
          for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i]
            if (i === pathParts.length - 1) {
              // Last part - update data
              target[part] = {
                ...target[part],
                ...update.data
              }
            } else {
              target = target[part]
            }
          }
        }
        
        await updateDoc(docRef, {
          [tabName]: tabData,
          lastUpdated: Date.now()
        })
        
        console.log(`✅ Batch update completed for ${updates.length} items`)
      }
    }
  } catch (error) {
    console.error('❌ Error in batch update:', error)
    throw error
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user has edit access
 */
export async function hasEditAccess(
  docId: string,
  ownerUserId: string,
  storyBibleId: string,
  userId: string
): Promise<boolean> {
  try {
    const docPath = getPreProductionDocPath(ownerUserId, storyBibleId, docId)
    const docRef = doc(db, docPath)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data() as PreProductionData
      
      // Owner always has access
      if (data.userId === userId) {
        return true
      }
      
      // Check collaborators
      const collaborator = data.collaborators?.find(c => c.userId === userId)
      return collaborator?.role === 'owner' || collaborator?.role === 'crew'
    }
    
    return false
  } catch (error) {
    console.error('❌ Error checking edit access:', error)
    return false
  }
}

/**
 * Update generation status
 */
export async function updateGenerationStatus(
  docId: string,
  userId: string,
  storyBibleId: string,
  status: 'not-started' | 'generating' | 'completed' | 'error',
  progress?: number
): Promise<void> {
  try {
    const docPath = getPreProductionDocPath(userId, storyBibleId, docId)
    const docRef = doc(db, docPath)
    
    const updates: any = {
      generationStatus: status,
      lastUpdated: Date.now()
    }
    
    if (progress !== undefined) {
      updates.generationProgress = progress
    }
    
    await updateDoc(docRef, updates)
    
    console.log(`✅ Generation status updated: ${status}`)
  } catch (error) {
    console.error('❌ Error updating generation status:', error)
    throw error
  }
}

// ============================================================================
// MIGRATION: Move Episode Locations to Arc Level
// ============================================================================

/**
 * Migrate locations from episode-level to arc-level
 * Converts episode locations to arc locations with episode-scene pairs
 * 
 * @param userId User ID
 * @param storyBibleId Story bible ID
 * @param arcIndex Arc index to migrate (optional - if not provided, migrates all arcs)
 * @param removeFromEpisodes Whether to remove locations from episode documents after migration
 */
export async function migrateEpisodeLocationsToArc(
  userId: string,
  storyBibleId: string,
  arcIndex?: number,
  removeFromEpisodes: boolean = false
): Promise<{
  success: boolean
  arcsMigrated: number
  locationsMigrated: number
  errors: string[]
}> {
  const errors: string[] = []
  let arcsMigrated = 0
  let locationsMigrated = 0

  try {
    console.log('🔄 Starting location migration from episodes to arcs...')
    
    // Get story bible to find arcs
    const storyBible = await getStoryBible(storyBibleId, userId)
    if (!storyBible) {
      throw new Error('Story bible not found')
    }

    // Determine which arcs to migrate
    const arcsToMigrate: number[] = arcIndex !== undefined 
      ? [arcIndex]
      : Array.from({ length: storyBible.narrativeArcs?.length || 0 }, (_, i) => i)

    console.log(`📋 Migrating ${arcsToMigrate.length} arc(s)...`)

    for (const arcIdx of arcsToMigrate) {
      try {
        console.log(`\n📍 Processing Arc ${arcIdx}...`)
        
        // Get production assistant
        const arcPreProd = await getArcPreProduction(userId, storyBibleId, arcIdx)
        if (!arcPreProd) {
          console.log(`  ⚠️  Arc ${arcIdx} pre-production not found, skipping`)
          continue
        }

        // Check if arc already has locations
        if (arcPreProd.locations?.locations && arcPreProd.locations.locations.length > 0) {
          console.log(`  ⚠️  Arc ${arcIdx} already has ${arcPreProd.locations.locations.length} locations, skipping`)
          continue
        }

        // Get episode numbers for this arc
        const episodeNumbers = getEpisodeRangeForArc(storyBible, arcIdx)
        if (episodeNumbers.length === 0) {
          console.log(`  ⚠️  Arc ${arcIdx} has no episodes, skipping`)
          continue
        }

        console.log(`  📺 Found ${episodeNumbers.length} episodes: ${episodeNumbers.join(', ')}`)

        // Aggregate locations from all episodes
        const locationMap = new Map<string, Location>()
        type LocationSceneRef = { episodeNumber: number; sceneNumber: number }

        for (const epNum of episodeNumbers) {
          try {
            const epPreProd = await getEpisodePreProduction(userId, storyBibleId, epNum)
            if (!epPreProd) {
              console.log(`    ⚠️  Episode ${epNum} pre-production not found`)
              continue
            }

            // Get locations from episode
            const epLocations = epPreProd.locations
            let locationsArray: Location[] = []

            if (epLocations) {
              if (epLocations.locations && Array.isArray(epLocations.locations)) {
                locationsArray = epLocations.locations
              } else if ((epLocations as any).selectedLocations && Array.isArray((epLocations as any).selectedLocations)) {
                locationsArray = (epLocations as any).selectedLocations
              } else if (Array.isArray(epLocations)) {
                locationsArray = epLocations
              }
            }

            if (locationsArray.length === 0) {
              console.log(`    ℹ️  Episode ${epNum} has no locations`)
              continue
            }

            console.log(`    ✅ Episode ${epNum}: Found ${locationsArray.length} locations`)

            // Convert episode locations to arc locations with episode-scene pairs
            locationsArray.forEach((loc: Location) => {
              const key = loc.recurringLocationKey || 
                `${loc.name?.toLowerCase().trim()}_${loc.address?.toLowerCase().trim() || ''}`

              // Convert scene numbers to episode-scene pairs
              // Handle both legacy (number[]) and new format (LocationSceneReference[])
              let sceneReferences: LocationSceneRef[] = []
              
              if (loc.scenes && Array.isArray(loc.scenes)) {
                // Check if scenes are already in new format (have episodeNumber)
                // Cast to any to handle legacy number[] format
                const scenesArray = loc.scenes as any[]
                const firstScene = scenesArray[0]
                if (firstScene && typeof firstScene === 'object' && 'episodeNumber' in firstScene) {
                  // Already in new format - use as is (but ensure they match current episode)
                  sceneReferences = scenesArray
                    .filter((s: any) => s.episodeNumber === epNum)
                    .map((s: any) => ({
                      episodeNumber: s.episodeNumber,
                      sceneNumber: s.sceneNumber
                    }))
                } else {
                  // Legacy format - convert numbers to episode-scene pairs
                  // Type guard: filter to only numbers, then map
                  const numberScenes: number[] = scenesArray.filter((sn: any): sn is number => typeof sn === 'number')
                  sceneReferences = numberScenes.map((sceneNum: number): LocationSceneRef => ({
                    episodeNumber: epNum,
                    sceneNumber: sceneNum
                  }))
                }
              } else if (loc.scenesLegacy && Array.isArray(loc.scenesLegacy)) {
                // Use legacy scene numbers
                sceneReferences = loc.scenesLegacy
                  .filter((sn: any) => typeof sn === 'number')
                  .map((sceneNum: number) => ({
                    episodeNumber: epNum,
                    sceneNumber: sceneNum
                  }))
              }

              if (locationMap.has(key)) {
                // Merge with existing location
                const existing = locationMap.get(key)!
                const existingScenes = (existing.scenes as LocationSceneRef[]) || []
                
                // Merge scenes (avoid duplicates)
                const mergedScenes = [...existingScenes, ...sceneReferences]
                const uniqueScenes = mergedScenes.filter((scene, index, self) =>
                  index === self.findIndex(s => 
                    s.episodeNumber === scene.episodeNumber && s.sceneNumber === scene.sceneNumber
                  )
                )

                locationMap.set(key, {
                  ...existing,
                  scenes: uniqueScenes as any,
                  cost: Math.max(existing.cost || 0, loc.cost || 0),
                  permitCost: Math.max(existing.permitCost || 0, loc.permitCost || 0)
                  // Note: scenesLegacy is not needed for arc-level locations (new format only)
                })
              } else {
                // New location - convert to arc-level format
                const { scenesLegacy, ...locWithoutLegacy } = loc
                locationMap.set(key, {
                  ...locWithoutLegacy,
                  scenes: sceneReferences as any
                  // Note: scenesLegacy removed - using new format only
                })
              }
            })
          } catch (error: any) {
            const errorMsg = `Error processing Episode ${epNum}: ${error.message}`
            console.error(`    ❌ ${errorMsg}`)
            errors.push(errorMsg)
          }
        }

        // Save aggregated locations to arc
        const aggregatedLocations = Array.from(locationMap.values())
        if (aggregatedLocations.length > 0) {
          const locationsData: LocationsData = {
            arcIndex: arcIdx,
            episodeNumbers,
            totalLocations: aggregatedLocations.length,
            locations: aggregatedLocations,
            lastUpdated: Date.now(),
            updatedBy: userId
          }

          await updatePreProduction(arcPreProd.id, { locations: locationsData }, userId, storyBibleId)
          console.log(`  ✅ Saved ${aggregatedLocations.length} locations to Arc ${arcIdx}`)
          locationsMigrated += aggregatedLocations.length
          arcsMigrated++

          // Optionally remove locations from episodes
          if (removeFromEpisodes) {
            console.log(`  🗑️  Removing locations from episode documents...`)
            for (const epNum of episodeNumbers) {
              try {
                const epPreProd = await getEpisodePreProduction(userId, storyBibleId, epNum)
                if (epPreProd && epPreProd.locations) {
                  await updatePreProduction(epPreProd.id, { locations: undefined }, userId, storyBibleId)
                  console.log(`    ✅ Removed locations from Episode ${epNum}`)
                }
              } catch (error: any) {
                const errorMsg = `Error removing locations from Episode ${epNum}: ${error.message}`
                console.error(`    ❌ ${errorMsg}`)
                errors.push(errorMsg)
              }
            }
          }
        } else {
          console.log(`  ℹ️  No locations found to migrate for Arc ${arcIdx}`)
        }
      } catch (error: any) {
        const errorMsg = `Error processing Arc ${arcIdx}: ${error.message}`
        console.error(`  ❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log(`\n✅ Migration complete!`)
    console.log(`  Arcs migrated: ${arcsMigrated}`)
    console.log(`  Locations migrated: ${locationsMigrated}`)
    if (errors.length > 0) {
      console.log(`  Errors: ${errors.length}`)
    }

    return {
      success: errors.length === 0,
      arcsMigrated,
      locationsMigrated,
      errors
    }
  } catch (error: any) {
    console.error('❌ Migration failed:', error)
    errors.push(`Migration failed: ${error.message}`)
    return {
      success: false,
      arcsMigrated,
      locationsMigrated,
      errors
    }
  }
}

