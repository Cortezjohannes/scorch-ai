/**
 * Image Storage Service
 * 
 * Handles uploading images to Firebase Storage to avoid Firestore's 1MB document size limit.
 * Automatically uploads large base64 images to Storage and returns lightweight URLs.
 */

import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL, uploadString, deleteObject } from 'firebase/storage'

/**
 * Check if a string is a base64 data URL image
 */
export function isBase64Image(data: string): boolean {
  return typeof data === 'string' && 
         data.startsWith('data:image/') && 
         data.includes('base64,')
}

/**
 * Calculate approximate size of base64 image in KB
 */
export function getImageSizeKB(data: string): number {
  if (!isBase64Image(data)) {
    // External URL - assume small (just the URL string)
    return data.length / 1024
  }
  
  // Extract base64 portion (after comma)
  const base64Part = data.split(',')[1] || ''
  // Base64 encoding is ~33% larger than original
  // Approximate: base64 length / 1.33 = original bytes
  const approximateBytes = (base64Part.length * 3) / 4
  return approximateBytes / 1024 // Convert to KB
}

/**
 * Check if image should be uploaded to Storage based on size threshold
 */
export function shouldUploadToStorage(
  data: string,
  thresholdKB: number = 100
): boolean {
  // Always upload base64 images above threshold
  if (isBase64Image(data)) {
    const sizeKB = getImageSizeKB(data)
    return sizeKB > thresholdKB
  }
  
  // External URLs don't need upload
  return false
}

/**
 * Convert base64 data URL to Blob
 */
export function base64ToBlob(dataUrl: string): Blob {
  if (!isBase64Image(dataUrl)) {
    throw new Error('Invalid base64 image data URL')
  }

  // Extract base64 data and mime type
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid data URL format')
  }

  const mimeType = matches[1]
  const base64Data = matches[2]

  // Convert base64 to binary
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)

  return new Blob([byteArray], { type: mimeType })
}

/**
 * Upload image to Firebase Storage
 * 
 * @param userId User ID (required)
 * @param imageData Base64 data URL or external URL
 * @param promptHash Hash to use as filename (ensures consistent naming for caching)
 * @returns Storage download URL
 */
export async function uploadImageToStorage(
  userId: string,
  imageData: string,
  promptHash: string
): Promise<string> {
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  if (!userId) {
    console.error(`❌ [${uploadId}] User ID is required to upload images`)
    throw new Error('User ID is required to upload images')
  }

  if (!imageData) {
    console.error(`❌ [${uploadId}] Image data is required`)
    throw new Error('Image data is required')
  }

  // If it's already an external URL, return as-is
  if (!isBase64Image(imageData)) {
    console.log(`📦 [${uploadId}] Image is already an external URL, skipping upload:`, {
      url: imageData.substring(0, 60) + '...',
      urlLength: imageData.length
    })
    return imageData
  }

  try {
    const imageSizeKB = Math.round(getImageSizeKB(imageData))
    console.log(`📤 [${uploadId}] Starting Storage upload`, {
      userId: userId.substring(0, 8) + '...',
      hash: promptHash.substring(0, 16) + '...',
      imageSize: `${imageSizeKB}KB`
    })
    
    // Determine file extension from mime type
    const mimeMatch = imageData.match(/data:([^;]+);/)
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'
    const extension = mimeType.split('/')[1] || 'png'

    // Create storage path: users/{userId}/images/{promptHash}.{ext}
    const storagePath = `users/${userId}/images/${promptHash}.${extension}`
    const storageRef = ref(storage, storagePath)

    console.log(`📂 [${uploadId}] Storage path: ${storagePath}`, {
      mimeType,
      extension
    })

    const uploadStartTime = Date.now()
    // Upload using uploadString for base64 data URLs (more efficient)
    await uploadString(storageRef, imageData, 'data_url')
    const uploadDuration = Date.now() - uploadStartTime
    
    console.log(`✅ [${uploadId}] Image uploaded to Storage`, {
      uploadDuration: `${uploadDuration}ms`,
      size: `${imageSizeKB}KB`
    })

    // Get download URL
    const urlStartTime = Date.now()
    const downloadURL = await getDownloadURL(storageRef)
    const urlDuration = Date.now() - urlStartTime

    console.log(`✅ [${uploadId}] Storage upload complete`, {
      totalDuration: `${Date.now() - uploadStartTime}ms`,
      uploadDuration: `${uploadDuration}ms`,
      urlDuration: `${urlDuration}ms`,
      downloadURL: downloadURL.substring(0, 60) + '...',
      size: `${imageSizeKB}KB`
    })
    
    return downloadURL
  } catch (error: any) {
    console.error(`❌ [${uploadId}] Error uploading image to Storage:`, {
      error: error.message,
      stack: error.stack,
      code: error.code,
      userId: userId.substring(0, 8) + '...',
      hash: promptHash.substring(0, 16) + '...'
    })
    throw new Error(`Failed to upload image to Storage: ${error.message}`)
  }
}

/**
 * Process image: upload ALL base64 images to Storage
 * 
 * This is the main function to use - it automatically handles:
 * - ALL base64 images → Upload to Storage (if thresholdKB is 0, which is default)
 * - Base64 images above threshold → Upload to Storage (if thresholdKB > 0)
 * - External URLs → Return as-is (already Storage URLs or external)
 * 
 * @param userId User ID (required for upload)
 * @param imageData Base64 data URL or external URL
 * @param promptHash Hash for consistent naming
 * @param thresholdKB Size threshold in KB (default: 0 = upload ALL base64 images)
 * @returns Storage URL or original data (depending on threshold)
 */
export async function processImageForStorage(
  userId: string,
  imageData: string,
  promptHash: string,
  thresholdKB: number = 0  // Default 0 = upload ALL base64 images to Storage
): Promise<string> {
  const processId = `process_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  // If no userId, can't upload - return as-is (for guest mode)
  if (!userId) {
    console.log(`⚠️  [${processId}] No userId provided, skipping Storage upload (guest mode)`)
    return imageData
  }

  const isBase64 = isBase64Image(imageData)
  const sizeKB = isBase64 ? getImageSizeKB(imageData) : 0
  
  // If threshold is 0, upload ALL base64 images to Storage
  // If threshold > 0, only upload if exceeds threshold
  const shouldUpload = thresholdKB === 0 
    ? isBase64  // Upload ALL base64 if threshold is 0
    : (isBase64 && sizeKB > thresholdKB)  // Otherwise use threshold
  
  console.log(`🔍 [${processId}] Processing image for storage`, {
    userId: userId.substring(0, 8) + '...',
    hash: promptHash.substring(0, 16) + '...',
    isBase64,
    sizeKB: isBase64 ? `${Math.round(sizeKB)}KB` : 'N/A (external URL)',
    thresholdKB: thresholdKB === 0 ? '0 (upload ALL)' : `${thresholdKB}KB`,
    shouldUpload
  })

  if (shouldUpload) {
    const reason = thresholdKB === 0 
      ? 'All base64 images go to Storage' 
      : `Image exceeds ${thresholdKB}KB threshold (${Math.round(sizeKB)}KB)`
    console.log(`📦 [${processId}] Uploading to Storage: ${reason}`)
    return await uploadImageToStorage(userId, imageData, promptHash)
  }

  // Already an external URL (not base64) - return as-is
  if (!isBase64Image(imageData)) {
    console.log(`✅ [${processId}] Image is external URL, returning as-is`)
    return imageData
  }

  // This shouldn't happen if threshold is 0, but handle it anyway
  console.log(`⚠️  [${processId}] Image is ${Math.round(sizeKB)}KB base64, but not uploading (threshold: ${thresholdKB}KB)`)
  return imageData
}

/**
 * Delete an image from Firebase Storage
 * 
 * @param imageUrl Storage URL or full download URL
 * @returns true if deleted, false if not a Storage URL or deletion failed
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<boolean> {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false
  }
  
  // Only delete Storage URLs
  if (!imageUrl.startsWith('https://firebasestorage.googleapis.com/') && 
      !imageUrl.startsWith('https://storage.googleapis.com/')) {
    console.log('⏭️  Skipping deletion - not a Storage URL:', imageUrl.substring(0, 60))
    return false
  }
  
  try {
    // Extract the storage path from the URL
    // Storage URLs look like: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    // Or: https://storage.googleapis.com/{bucket}/{path}
    let storagePath: string | null = null
    
    if (imageUrl.includes('/o/')) {
      // Firebase Storage URL format
      const match = imageUrl.match(/\/o\/([^?]+)/)
      if (match) {
        storagePath = decodeURIComponent(match[1])
      }
    } else if (imageUrl.includes('storage.googleapis.com/')) {
      // Direct Storage URL format
      const match = imageUrl.match(/storage\.googleapis\.com\/[^/]+\/(.+?)(\?|$)/)
      if (match) {
        storagePath = decodeURIComponent(match[1])
      }
    }
    
    if (!storagePath) {
      console.warn('⚠️  Could not extract storage path from URL:', imageUrl.substring(0, 60))
      return false
    }
    
    console.log(`🗑️  Deleting image from Storage: ${storagePath}`)
    const storageRef = ref(storage, storagePath)
    await deleteObject(storageRef)
    console.log(`✅ Image deleted from Storage: ${storagePath}`)
    return true
  } catch (error: any) {
    // If file doesn't exist, that's okay (might have been deleted already)
    if (error.code === 'storage/object-not-found') {
      console.log('ℹ️  Image already deleted or not found:', imageUrl.substring(0, 60))
      return true
    }
    console.error('❌ Error deleting image from Storage:', error)
    return false
  }
}

