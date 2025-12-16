/**
 * Server-side only story bible service using Firebase Admin SDK
 * This file should NEVER be imported in client components
 * Use only in API routes and server components
 */

import { getAdminFirestore } from '@/lib/firebase-admin'
import type { StoryBible } from './story-bible-service'

/**
 * Get a single story bible by ID using Firebase Admin (server-side only)
 * This bypasses Firestore security rules and is safe to use in API routes
 */
export async function getStoryBibleServer(
  id: string,
  userId: string
): Promise<StoryBible | null> {
  // Only use on server-side
  if (typeof window !== 'undefined') {
    console.warn('⚠️ getStoryBibleServer should only be called on the server. Use getStoryBible instead.')
    return null
  }

  try {
    console.log('📖 Loading story bible from Firestore (Admin SDK):', { storyBibleId: id, userId })
    
    // Check if Admin SDK is initialized
    const { isAdminInitialized } = require('@/lib/firebase-admin')
    if (!isAdminInitialized()) {
      console.error('❌ Firebase Admin SDK not initialized!')
      console.error('💡 Check server startup logs for Firebase Admin SDK initialization messages')
      throw new Error('Firebase Admin SDK not initialized. Check server logs for initialization errors.')
    }
    
    const adminDb = getAdminFirestore()
    const docRef = adminDb.collection('users').doc(userId).collection('storyBibles').doc(id)
    
    console.log(`🔍 Attempting to fetch: users/${userId}/storyBibles/${id}`)
    const docSnap = await docRef.get()
    
    if (docSnap.exists) {
      const data = docSnap.data()
      console.log('✅ Story bible loaded from Firestore (Admin SDK):', {
        id: docSnap.id,
        title: data?.seriesTitle || 'Untitled',
        hasData: !!data
      })
      
      // Debug: Log character images
      if (data?.mainCharacters) {
        console.log(`📸 [Server] Found ${data.mainCharacters.length} characters in Firestore`)
        data.mainCharacters.forEach((char: any, idx: number) => {
          if (char?.visualReference?.imageUrl) {
            console.log(`  Character ${idx} (${char.name}): HAS IMAGE - ${char.visualReference.imageUrl.substring(0, 60)}...`)
          } else {
            console.log(`  Character ${idx} (${char.name}): NO IMAGE - visualReference:`, char?.visualReference ? 'exists but no imageUrl' : 'missing')
          }
        })
      } else {
        console.log(`📸 [Server] NO mainCharacters array in Firestore`)
      }
      
      // Debug: Log location images for comparison
      if (data?.worldBuilding?.locations) {
        console.log(`🌍 [Server] Found ${data.worldBuilding.locations.length} locations in Firestore`)
        data.worldBuilding.locations.forEach((loc: any, idx: number) => {
          if (loc?.conceptArt?.imageUrl) {
            console.log(`  Location ${idx} (${loc.name}): HAS IMAGE - ${loc.conceptArt.imageUrl.substring(0, 60)}...`)
          } else {
            console.log(`  Location ${idx} (${loc.name}): NO IMAGE`)
          }
        })
      }
      
      return {
        ...data,
        id: docSnap.id,
        createdAt: data?.createdAt?.toDate?.()?.toISOString() || data?.createdAt || new Date().toISOString(),
        updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || data?.updatedAt || new Date().toISOString(),
      } as StoryBible
    }
    
    console.log('⚠️ Story bible not found in Firestore (Admin SDK)')
    console.log('🔍 Document does not exist at path:', `users/${userId}/storyBibles/${id}`)
    
    // Try to list story bibles for this user to debug
    try {
      const userStoryBiblesRef = adminDb.collection('users').doc(userId).collection('storyBibles')
      const snapshot = await userStoryBiblesRef.limit(5).get()
      console.log(`📋 Found ${snapshot.size} story bibles for user ${userId}:`)
      snapshot.forEach((doc) => {
        console.log(`  - ${doc.id}: ${doc.data()?.seriesTitle || 'Untitled'}`)
      })
    } catch (listError: any) {
      console.error('❌ Could not list story bibles:', listError.message)
    }
    
    return null
  } catch (error: any) {
    console.error('❌ Error loading story bible from Firestore (Admin SDK):', {
      error: error.message,
      code: error.code,
      stack: error.stack,
      storyBibleId: id,
      userId
    })
    throw error // Re-throw so caller can see the actual error
  }
}

/**
 * Save a story bible to Firestore using Firebase Admin SDK (server-side only)
 * This bypasses Firestore security rules and is safe to use in API routes
 */
export async function saveStoryBibleServer(
  storyBible: Partial<StoryBible>,
  userId: string
): Promise<StoryBible> {
  // Only use on server-side
  if (typeof window !== 'undefined') {
    console.warn('⚠️ saveStoryBibleServer should only be called on the server. Use saveStoryBible instead.')
    throw new Error('saveStoryBibleServer can only be called on the server')
  }

  try {
    console.log('💾 Saving story bible to Firestore (Admin SDK):', {
      storyBibleId: storyBible.id,
      userId,
      title: storyBible.seriesTitle
    })
    
    // Check if Admin SDK is initialized
    const { isAdminInitialized } = require('@/lib/firebase-admin')
    if (!isAdminInitialized()) {
      console.error('❌ Firebase Admin SDK not initialized!')
      throw new Error('Firebase Admin SDK not initialized. Check server logs for initialization errors.')
    }
    
    const adminDb = getAdminFirestore()
    const admin = require('firebase-admin')
    
    const now = new Date()
    const updatedStoryBible: StoryBible = {
      ...storyBible,
      id: storyBible.id || `sb_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: storyBible.status || 'draft',
      createdAt: storyBible.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
      ownerId: userId,
    } as StoryBible
    
    const docRef = adminDb.collection('users').doc(userId).collection('storyBibles').doc(updatedStoryBible.id)
    
    // Helper function to clean invalid image URLs (SVG data URLs) before saving
    // This prevents old invalid data from blocking saves
    let cleanedCount = 0
    const cleanInvalidImageUrls = (obj: any, path: string = ''): any => {
      if (typeof obj === 'string') {
        // Replace SVG data URLs with empty string (they're invalid and can't be used)
        if (obj.startsWith('data:image/svg+xml')) {
          cleanedCount++
          console.log(`🧹 [Save Story Bible] Cleaning invalid SVG image URL at ${path || 'root'}`)
          return '' // Empty string - invalid images should be empty, not SVG data URLs
        }
        return obj
      }
      
      if (Array.isArray(obj)) {
        return obj.map((item, index) => cleanInvalidImageUrls(item, `${path}[${index}]`))
      }
      
      if (typeof obj === 'object' && obj !== null && !(obj instanceof Date)) {
        const cleaned: any = {}
        for (const key in obj) {
          cleaned[key] = cleanInvalidImageUrls(obj[key], path ? `${path}.${key}` : key)
        }
        return cleaned
      }
      
      return obj
    }
    
    // Clean invalid image URLs before validation
    const cleanedStoryBible = cleanInvalidImageUrls(updatedStoryBible) as StoryBible
    if (cleanedCount > 0) {
      console.log(`🧹 [Save Story Bible] Cleaned ${cleanedCount} invalid SVG image URL(s) before saving`)
    }
    
    // Helper function to detect base64 images (CRITICAL: prevent Firestore 1MB limit errors)
    // Helper function to clean data for Firestore
    const cleanForFirestore = (obj: any): any => {
      // Remove undefined values (Firestore doesn't allow undefined)
      if (obj === undefined) return null
      if (obj === null) return null
      
      // Convert Date strings to Firestore Timestamp
      if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(obj)) {
        try {
          return admin.firestore.Timestamp.fromDate(new Date(obj))
        } catch {
          return obj
        }
      }
      
      // Handle existing Firestore Timestamps
      if (obj && typeof obj === 'object' && typeof obj.toDate === 'function') {
        return admin.firestore.Timestamp.fromDate(obj.toDate())
      }
      
      // Remove functions and other non-serializable data
      if (typeof obj === 'function') {
        return null
      }
      
      if (Array.isArray(obj)) {
        return obj.map(cleanForFirestore).filter((item) => item !== undefined)
      }
      
      if (typeof obj === 'object' && !(obj instanceof Date)) {
        const cleaned: any = {}
        for (const key in obj) {
          // Skip metadata and snapshot properties
          if (key === '__snapshot' || key === '__metadata') continue
          
          const value = cleanForFirestore(obj[key])
          // Only include non-undefined values
          if (value !== undefined) {
            cleaned[key] = value
          }
        }
        return cleaned
      }
      
      return obj
    }
    
    // Clean the data and prepare for Firestore
    const firestoreData = cleanForFirestore(cleanedStoryBible)
    
    // Ensure createdAt and updatedAt are Timestamps
    firestoreData.createdAt = admin.firestore.Timestamp.fromDate(new Date(cleanedStoryBible.createdAt || now))
    firestoreData.updatedAt = admin.firestore.Timestamp.fromDate(new Date(cleanedStoryBible.updatedAt || now))
    
    // Handle lockedAt if it exists
    if (firestoreData.lockedAt) {
      if (typeof firestoreData.lockedAt.toDate === 'function') {
        firestoreData.lockedAt = admin.firestore.Timestamp.fromDate(firestoreData.lockedAt.toDate())
      } else if (typeof firestoreData.lockedAt === 'string') {
        firestoreData.lockedAt = admin.firestore.Timestamp.fromDate(new Date(firestoreData.lockedAt))
      }
    }
    
    await docRef.set(firestoreData)
    console.log('✅ Story bible saved to Firestore successfully (Admin SDK)')
    
    return updatedStoryBible
  } catch (error: any) {
    console.error('❌ Failed to save story bible to Firestore (Admin SDK):', {
      error: error.message,
      code: error.code,
      userId,
      storyBibleId: storyBible.id
    })
    throw error
  }
}

