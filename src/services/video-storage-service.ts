/**
 * Video Storage Service
 * 
 * Handles uploading videos to Firebase Storage to avoid Firestore's 1MB document size limit
 * and ensure videos persist across devices. Follows the same pattern as image-storage-service.ts
 */

import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

/**
 * Upload video from a URL (e.g., from VEO proxy endpoint) to Firebase Storage
 * 
 * @param userId User ID (required)
 * @param videoUrl URL to download the video from (proxy URL or direct URL)
 * @param filename Optional custom filename (defaults to timestamp-based name)
 * @returns Storage download URL
 */
export async function uploadVideoToStorage(
  userId: string,
  videoUrl: string,
  filename?: string
): Promise<string> {
  const uploadId = `video_upload_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  if (!userId) {
    console.error(`❌ [${uploadId}] User ID is required to upload videos`)
    throw new Error('User ID is required to upload videos')
  }

  if (!videoUrl) {
    console.error(`❌ [${uploadId}] Video URL is required`)
    throw new Error('Video URL is required')
  }

  try {
    console.log(`📹 [${uploadId}] Starting video upload to Firebase Storage...`)
    console.log(`   User ID: ${userId.substring(0, 8)}...`)
    console.log(`   Source URL: ${videoUrl.substring(0, 100)}...`)

    // Download video from the source URL
    console.log(`📥 [${uploadId}] Downloading video from source URL...`)
    const videoResponse = await fetch(videoUrl)
    
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`)
    }

    const videoBlob = await videoResponse.blob()
    const videoSizeMB = (videoBlob.size / (1024 * 1024)).toFixed(2)
    console.log(`✅ [${uploadId}] Video downloaded: ${videoSizeMB} MB, type: ${videoBlob.type}`)

    // Generate filename if not provided
    const videoFilename = filename || `veo-video-${Date.now()}.mp4`
    const storagePath = `users/${userId}/videos/${videoFilename}`
    
    console.log(`📤 [${uploadId}] Uploading to Firebase Storage: ${storagePath}`)
    
    // Create storage reference
    const storageRef = ref(storage, storagePath)
    
    // Upload video blob to Firebase Storage
    const uploadSnapshot = await uploadBytes(storageRef, videoBlob)
    console.log(`✅ [${uploadId}] Video uploaded to Storage successfully`)
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadSnapshot.ref)
    console.log(`✅ [${uploadId}] Storage download URL obtained: ${downloadURL.substring(0, 100)}...`)
    
    return downloadURL
  } catch (error: any) {
    console.error(`❌ [${uploadId}] Error uploading video to Storage:`, error)
    throw new Error(`Failed to upload video to Storage: ${error.message}`)
  }
}

/**
 * Check if a URL is a video URL
 */
export function isVideoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  
  // Check for video file extensions
  const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v']
  const lowerUrl = url.toLowerCase()
  
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
    return true
  }
  
  // Check for video MIME types in data URLs
  if (url.startsWith('data:video/')) {
    return true
  }
  
  // Check for video proxy endpoint
  if (url.includes('/api/veo3-video-proxy')) {
    return true
  }
  
  return false
}

