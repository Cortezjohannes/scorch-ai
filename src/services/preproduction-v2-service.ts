import { db } from '@/lib/firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc,
  Timestamp
} from 'firebase/firestore'
import { PreProductionV2Data } from '@/types/preproduction'

/**
 * Pre-Production V2 Service
 * 
 * Handles Firestore and localStorage operations for pre-production V2 data.
 * Supports both arc-level and episode-level pre-production.
 */

const LOCALSTORAGE_KEY_EPISODE = 'scorched-preproduction-episode-'
const LOCALSTORAGE_KEY_ARC = 'scorched-preproduction-arc-'

export interface PreProductionV2Record extends PreProductionV2Data {
  id: string
  storyBibleId: string
  arcOrEpisodeId: string
  type: 'arc' | 'episode'
  episodeNumber?: number
  arcNumber?: number
  createdAt: string
  updatedAt: string
  ownerId?: string
}

/**
 * Generate a consistent ID for pre-production records
 */
function generatePreProductionId(storyBibleId: string, arcOrEpisodeId: string): string {
  return `preprod_${storyBibleId}_${arcOrEpisodeId}_${Date.now()}`
}

/**
 * Save V2 pre-production to Firestore (if userId provided) and localStorage
 */
export async function savePreProductionV2(
  data: PreProductionV2Data,
  storyBibleId: string,
  arcOrEpisodeId: string,
  userId?: string
): Promise<PreProductionV2Record> {
  if (!storyBibleId) {
    throw new Error('storyBibleId is required to save pre-production')
  }

  if (!arcOrEpisodeId) {
    throw new Error('arcOrEpisodeId is required to save pre-production')
  }

  const now = new Date().toISOString()
  
  // Determine if this is arc or episode level
  const isArc = arcOrEpisodeId.startsWith('arc_')
  const isEpisode = arcOrEpisodeId.startsWith('episode_')
  
  const record: PreProductionV2Record = {
    ...data,
    id: generatePreProductionId(storyBibleId, arcOrEpisodeId),
    storyBibleId,
    arcOrEpisodeId,
    type: isArc ? 'arc' : 'episode',
    episodeNumber: isEpisode ? parseInt(arcOrEpisodeId.replace('episode_', '')) : undefined,
    arcNumber: isArc ? parseInt(arcOrEpisodeId.replace('arc_', '')) : undefined,
    createdAt: data.createdAt || now,
    updatedAt: now,
    ownerId: userId,
  }

  if (userId) {
    // AUTHENTICATED: Save to Firestore (primary) and localStorage (backup)
    try {
      const docRef = doc(
        db, 
        'users', userId, 
        'storyBibles', storyBibleId, 
        'preproduction', arcOrEpisodeId
      )
      
      await setDoc(docRef, {
        ...record,
        createdAt: Timestamp.fromDate(new Date(record.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(record.updatedAt))
      })
      
      console.log(`✅ Pre-production ${arcOrEpisodeId} saved to Firestore (primary)`)
      
      // Backup to localStorage
      const localKey = isEpisode 
        ? `${LOCALSTORAGE_KEY_EPISODE}${record.episodeNumber}`
        : `${LOCALSTORAGE_KEY_ARC}${record.arcNumber}`
      
      localStorage.setItem(localKey, JSON.stringify(data))
      console.log(`✅ Pre-production ${arcOrEpisodeId} backed up to localStorage`)
      
    } catch (error: any) {
      console.error('❌ FAILED to save pre-production to Firestore:', error)
      throw new Error(`Failed to save pre-production: ${error.message}`)
    }
  } else {
    // GUEST: localStorage only
    const localKey = isEpisode 
      ? `${LOCALSTORAGE_KEY_EPISODE}${record.episodeNumber}`
      : `${LOCALSTORAGE_KEY_ARC}${record.arcNumber}`
    
    localStorage.setItem(localKey, JSON.stringify(data))
    console.log(`⚠️ GUEST MODE: Pre-production ${arcOrEpisodeId} saved to localStorage only`)
  }

  return record
}

/**
 * Get V2 pre-production for a specific arc or episode
 */
export async function getPreProductionV2(
  storyBibleId: string,
  arcOrEpisodeId: string,
  userId?: string
): Promise<PreProductionV2Data | null> {
  if (!storyBibleId || !arcOrEpisodeId) {
    return null
  }

  const isEpisode = arcOrEpisodeId.startsWith('episode_')
  const isArc = arcOrEpisodeId.startsWith('arc_')
  
  if (userId) {
    // AUTHENTICATED: Try Firestore first
    try {
      const docRef = doc(
        db, 
        'users', userId, 
        'storyBibles', storyBibleId, 
        'preproduction', arcOrEpisodeId
      )
      
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        console.log(`✅ Pre-production ${arcOrEpisodeId} loaded from Firestore`)
        
        // Convert Timestamps back to strings
        return {
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as PreProductionV2Data
      }
    } catch (error) {
      console.warn('Failed to load from Firestore, falling back to localStorage:', error)
    }
  }
  
  // Fallback to localStorage (for guests or if Firestore fails)
  try {
    const localKey = isEpisode 
      ? `${LOCALSTORAGE_KEY_EPISODE}${arcOrEpisodeId.replace('episode_', '')}`
      : `${LOCALSTORAGE_KEY_ARC}${arcOrEpisodeId.replace('arc_', '')}`
    
    const stored = localStorage.getItem(localKey)
    
    if (stored) {
      console.log(`📥 Pre-production ${arcOrEpisodeId} loaded from localStorage`)
      return JSON.parse(stored) as PreProductionV2Data
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
  
  return null
}

/**
 * Check if V2 pre-production exists for an arc or episode
 */
export async function hasPreProductionV2(
  storyBibleId: string,
  arcOrEpisodeId: string,
  userId?: string
): Promise<boolean> {
  const data = await getPreProductionV2(storyBibleId, arcOrEpisodeId, userId)
  return data !== null
}

/**
 * Get all V2 pre-production records for a story bible
 */
export async function getAllPreProductionV2ForStoryBible(
  storyBibleId: string,
  userId?: string
): Promise<Record<string, PreProductionV2Data>> {
  const results: Record<string, PreProductionV2Data> = {}
  
  if (userId) {
    // Load from Firestore
    try {
      const collectionRef = collection(
        db, 
        'users', userId, 
        'storyBibles', storyBibleId, 
        'preproduction'
      )
      
      const snapshot = await getDocs(collectionRef)
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        results[doc.id] = {
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as PreProductionV2Data
      })
      
      console.log(`✅ Loaded ${snapshot.size} pre-production records from Firestore`)
    } catch (error) {
      console.error('Error loading from Firestore:', error)
    }
  }
  
  // Also check localStorage (merge with Firestore results)
  try {
    // Check for episode-level pre-production
    for (let i = 1; i <= 100; i++) {
      const key = `${LOCALSTORAGE_KEY_EPISODE}${i}`
      const stored = localStorage.getItem(key)
      if (stored) {
        const id = `episode_${i}`
        if (!results[id]) {
          results[id] = JSON.parse(stored) as PreProductionV2Data
        }
      }
    }
    
    // Check for arc-level pre-production
    for (let i = 1; i <= 20; i++) {
      const key = `${LOCALSTORAGE_KEY_ARC}${i}`
      const stored = localStorage.getItem(key)
      if (stored) {
        const id = `arc_${i}`
        if (!results[id]) {
          results[id] = JSON.parse(stored) as PreProductionV2Data
        }
      }
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
  
  return results
}

/**
 * Delete V2 pre-production for an arc or episode
 */
export async function deletePreProductionV2(
  storyBibleId: string,
  arcOrEpisodeId: string,
  userId?: string
): Promise<void> {
  const isEpisode = arcOrEpisodeId.startsWith('episode_')
  
  if (userId) {
    // Delete from Firestore
    try {
      const docRef = doc(
        db, 
        'users', userId, 
        'storyBibles', storyBibleId, 
        'preproduction', arcOrEpisodeId
      )
      
      await setDoc(docRef, {})
      console.log(`✅ Pre-production ${arcOrEpisodeId} deleted from Firestore`)
    } catch (error) {
      console.error('Error deleting from Firestore:', error)
    }
  }
  
  // Delete from localStorage
  const localKey = isEpisode 
    ? `${LOCALSTORAGE_KEY_EPISODE}${arcOrEpisodeId.replace('episode_', '')}`
    : `${LOCALSTORAGE_KEY_ARC}${arcOrEpisodeId.replace('arc_', '')}`
  
  localStorage.removeItem(localKey)
  console.log(`✅ Pre-production ${arcOrEpisodeId} deleted from localStorage`)
}

