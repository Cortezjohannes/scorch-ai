import { db, auth } from '@/lib/firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore'

export interface Episode {
  id: string
  episodeNumber: number
  storyBibleId: string // REQUIRED - episodes must belong to a story bible
  title?: string
  synopsis?: string
  scenes: any[]
  arcIndex?: number
  arcTitle?: string
  status: 'draft' | 'completed' | 'pre-production-ready' | 'pre-production-done'
  version: number
  editCount: number
  generatedAt: string
  lastModified: string
  ownerId?: string
  metadata?: {
    plotThreads?: string[]
    continuityChecker?: {
      callbacks: string[]
      chekhovsGuns: string[]
    }
    worldBuildingRef?: string
    suggestedDirection?: string
  }
  [key: string]: any // Allow other properties from existing structure
}

const LOCALSTORAGE_KEY = 'greenlit-episodes'

/**
 * Generate a unique ID for an episode
 */
function generateEpisodeId(storyBibleId: string, episodeNumber: number): string {
  return `ep_${episodeNumber}`
}

/**
 * Helper function to load episodes from localStorage
 * Server-safe: Returns empty object if called on server (no localStorage available)
 */
function loadFromLocalStorage(storyBibleId: string): Record<number, Episode> {
  // Server-side check: localStorage doesn't exist on server
  if (typeof window === 'undefined') {
    console.log('⚠️ loadFromLocalStorage called on server - returning empty object')
    return {}
  }
  
  const stored = localStorage.getItem(LOCALSTORAGE_KEY) ||
                 localStorage.getItem('scorched-episodes') ||
                 localStorage.getItem('reeled-episodes')
  
  if (stored) {
    try {
      const allEpisodes = JSON.parse(stored)
      const episodes: Record<number, Episode> = {}
      Object.keys(allEpisodes).forEach(key => {
        const episode = allEpisodes[key]
        // Only include episodes for this story bible
        // For legacy episodes without storyBibleId, we'll include them
        if (!episode.storyBibleId || episode.storyBibleId === storyBibleId) {
          episodes[Number(key)] = {
            ...episode,
            storyBibleId: episode.storyBibleId || storyBibleId // Set if missing
          }
        }
      })
      console.log(`✅ Loaded ${Object.keys(episodes).length} episodes from localStorage`)
      return episodes
    } catch (e) {
      console.error('Error parsing localStorage episodes:', e)
      return {}
    }
  }
  return {}
}

/**
 * Save an episode to Firestore (if userId provided) or localStorage
 * Episodes are ALWAYS tied to a story bible
 */
export async function saveEpisode(
  episode: Partial<Episode>, 
  storyBibleId: string,
  userId?: string
): Promise<Episode> {
  if (!storyBibleId) {
    throw new Error('storyBibleId is required to save an episode')
  }

  // If userId not provided, try to get it from Firebase auth directly (cross-device fix)
  let finalUserId = userId
  if (!finalUserId && typeof window !== 'undefined') {
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        finalUserId = currentUser.uid
        console.log('🔍 saveEpisode: userId not provided, using auth.currentUser:', finalUserId)
      }
    } catch (error) {
      console.warn('⚠️ Could not check Firebase auth in saveEpisode:', error)
    }
  }

  const now = new Date().toISOString()
  
  const updatedEpisode: Episode = {
    ...episode,
    id: episode.id || generateEpisodeId(storyBibleId, episode.episodeNumber!),
    storyBibleId, // ALWAYS set this
    episodeNumber: episode.episodeNumber!,
    scenes: episode.scenes || [],
    status: episode.status || 'draft',
    version: episode.version || 1,
    editCount: episode.editCount || 0,
    generatedAt: episode.generatedAt || now,
    lastModified: now,
    ownerId: finalUserId,
  } as Episode

  if (finalUserId) {
    // AUTHENTICATED: Firestore ONLY - no localStorage backup
    try {
      // Check if user is actually authenticated
      const currentUser = auth.currentUser
      console.log('🔐 Firestore save attempt:', {
        userId: finalUserId,
        currentAuthUser: currentUser?.uid,
        isAuthenticated: !!currentUser,
        storyBibleId,
        episodeId: updatedEpisode.id,
        episodeNumber: updatedEpisode.episodeNumber,
        documentStoryBibleId: updatedEpisode.storyBibleId,
        path: `users/${finalUserId}/storyBibles/${storyBibleId}/episodes/${updatedEpisode.id}`
      })
      
      if (!currentUser) {
        // Auth session expired - force user to re-authenticate
        console.error('🔐 Firebase Auth session expired')
        throw new Error('AUTH_EXPIRED:Your session has expired. Please sign in again to continue.')
      }
      
      if (currentUser.uid !== finalUserId) {
        throw new Error(`Auth mismatch: currentUser.uid (${currentUser.uid}) !== userId (${finalUserId})`)
      }
      
      const docRef = doc(db, 'users', finalUserId, 'storyBibles', storyBibleId, 'episodes', updatedEpisode.id)
      
      // Sanitize data to remove undefined values and convert timestamps
      const sanitizeData = (obj: any): any => {
        const cleaned: any = {}
        for (const key in obj) {
          if (obj[key] !== undefined) {
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Timestamp)) {
              cleaned[key] = sanitizeData(obj[key])
            } else {
              cleaned[key] = obj[key]
            }
          }
        }
        return cleaned
      }
      
      const dataToSave = sanitizeData({
        ...updatedEpisode,
        generatedAt: Timestamp.fromDate(new Date(updatedEpisode.generatedAt)),
        lastModified: Timestamp.fromDate(new Date(updatedEpisode.lastModified))
      })
      
      console.log('📄 Document data being saved:', {
        hasStoryBibleId: !!dataToSave.storyBibleId,
        storyBibleIdValue: dataToSave.storyBibleId,
        pathStoryBibleId: storyBibleId,
        idsMatch: dataToSave.storyBibleId === storyBibleId,
        storyBibleIdType: typeof dataToSave.storyBibleId,
        pathStoryBibleIdType: typeof storyBibleId,
        allKeys: Object.keys(dataToSave)
      })
      
      await setDoc(docRef, dataToSave)
      console.log(`✅ Episode ${updatedEpisode.episodeNumber} saved to Firestore`)
    } catch (error: any) {
      console.error('❌ FAILED to save episode to Firestore:', {
        error: error.message,
        code: error.code,
        userId,
        storyBibleId,
        episodeNumber: updatedEpisode.episodeNumber
      })
      throw new Error(`Failed to save episode to Firestore: ${error.message}`)
    }
  } else {
    // GUEST: localStorage only
    const stored = localStorage.getItem(LOCALSTORAGE_KEY)
    const episodes = stored ? JSON.parse(stored) : {}
    episodes[updatedEpisode.episodeNumber] = updatedEpisode
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(episodes))
    console.log(`⚠️ GUEST MODE: Episode ${updatedEpisode.episodeNumber} saved to localStorage only (will not sync across devices)`)
  }

  return updatedEpisode
}

/**
 * Get all episodes for a specific story bible
 * Returns a Record keyed by episode number for easy lookup
 */
export async function getEpisodesForStoryBible(
  storyBibleId: string,
  userId?: string
): Promise<Record<number, Episode>> {
  if (!storyBibleId) {
    console.warn('storyBibleId is required to get episodes')
    return {}
  }

  // If userId not provided, try to get it from Firebase auth directly (cross-device fix)
  let finalUserId = userId
  if (!finalUserId && typeof window !== 'undefined') {
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        finalUserId = currentUser.uid
        console.log('🔍 getEpisodesForStoryBible: userId not provided, using auth.currentUser:', finalUserId)
      }
    } catch (error) {
      console.warn('⚠️ Could not check Firebase auth in getEpisodesForStoryBible:', error)
    }
  }

  if (finalUserId) {
    // AUTHENTICATED: Try Firestore first, fallback to localStorage
    try {
      console.log('📖 Loading episodes from Firestore:', { storyBibleId, userId: finalUserId })
      const episodesRef = collection(db, 'users', finalUserId, 'storyBibles', storyBibleId, 'episodes')
      const q = query(episodesRef, orderBy('episodeNumber', 'asc'))
      const snapshot = await getDocs(q)
      
      const episodes: Record<number, Episode> = {}
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        const episode: Episode = {
          ...data,
          id: doc.id,
          generatedAt: data.generatedAt?.toDate?.()?.toISOString() || data.generatedAt,
          lastModified: data.lastModified?.toDate?.()?.toISOString() || data.lastModified,
        } as Episode
        
        // Only include episodes that match this story bible
        if (episode.storyBibleId === storyBibleId) {
          episodes[episode.episodeNumber] = episode
        }
      })
      
      console.log(`✅ Loaded ${Object.keys(episodes).length} episodes from Firestore`)
      return episodes
    } catch (error) {
      console.error('❌ Error loading from Firestore, trying localStorage:', error)
      // FALLBACK: Try localStorage
      return loadFromLocalStorage(storyBibleId)
    }
  } else {
    // GUEST: localStorage only
    console.log('⚠️ GUEST MODE: Loading episodes from localStorage')
    return loadFromLocalStorage(storyBibleId)
  }
}

/**
 * Get a single episode by number for a specific story bible
 */
export async function getEpisode(
  storyBibleId: string,
  episodeNumber: number, 
  userId?: string
): Promise<Episode | null> {
  if (!storyBibleId) {
    console.warn('storyBibleId is required to get episode')
    return null
  }

  if (userId) {
    // Fetch from Firestore
    try {
      const episodesRef = collection(db, 'users', userId, 'storyBibles', storyBibleId, 'episodes')
      const snapshot = await getDocs(episodesRef)
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        if (data.episodeNumber === episodeNumber && data.storyBibleId === storyBibleId) {
          return {
            ...data,
            id: docSnap.id,
            generatedAt: data.generatedAt?.toDate?.()?.toISOString() || data.generatedAt,
            lastModified: data.lastModified?.toDate?.()?.toISOString() || data.lastModified,
          } as Episode
        }
      }
      return null
    } catch (error) {
      console.error('Error loading episode from Firestore:', error)
      return null
    }
  } else {
    // Get from localStorage
    const episodes = await getEpisodesForStoryBible(storyBibleId)
    return episodes[episodeNumber] || null
  }
}

/**
 * Recover an episode from localStorage and migrate to Firestore
 * Returns true if recovered, false if not found
 */
export async function recoverLocalStorageEpisode(
  episodeNumber: number,
  storyBibleId: string,
  userId: string
): Promise<boolean> {
  try {
    console.log(`🔍 Checking localStorage for episode ${episodeNumber}...`)
    
    // Check localStorage for the episode
    const savedEpisodes = typeof window !== 'undefined' 
      ? (localStorage.getItem('greenlit-episodes') || 
         localStorage.getItem('scorched-episodes') || 
         localStorage.getItem('reeled-episodes')) 
      : null
    
    if (!savedEpisodes) {
      console.log('No episodes found in localStorage')
      return false
    }
    
    const episodes = JSON.parse(savedEpisodes)
    const episode = episodes[episodeNumber]
    
    if (!episode) {
      console.log(`Episode ${episodeNumber} not found in localStorage`)
      return false
    }
    
    console.log(`✅ Found episode ${episodeNumber} in localStorage, migrating to Firestore...`)
    
    // Migrate to Firestore with correct ID and storyBibleId
    const episodeToSave = {
      ...episode,
      storyBibleId, // Ensure correct storyBibleId
      episodeNumber,
      status: episode.status || 'completed'
    }
    
    await saveEpisode(episodeToSave, storyBibleId, userId)
    
    console.log(`✅ Successfully recovered episode ${episodeNumber} to Firestore`)
    return true
  } catch (error) {
    console.error(`❌ Failed to recover episode ${episodeNumber}:`, error)
    return false
  }
}

/**
 * Check which episodes exist in localStorage but not in Firestore
 */
export async function findRecoverableEpisodes(
  storyBibleId: string,
  userId: string
): Promise<number[]> {
  try {
    // Get episodes from Firestore
    const firestoreEpisodes = await getEpisodesForStoryBible(storyBibleId, userId)
    const firestoreEpisodeNumbers = Object.keys(firestoreEpisodes).map(Number)
    
    // Check localStorage for episodes
    const savedEpisodes = typeof window !== 'undefined' 
      ? (localStorage.getItem('greenlit-episodes') || 
         localStorage.getItem('scorched-episodes') || 
         localStorage.getItem('reeled-episodes')) 
      : null
    
    if (!savedEpisodes) {
      return []
    }
    
    const localEpisodes = JSON.parse(savedEpisodes)
    const localEpisodeNumbers = Object.keys(localEpisodes).map(Number)
    
    // Find episodes in localStorage but not in Firestore
    const recoverable = localEpisodeNumbers.filter(
      num => !firestoreEpisodeNumbers.includes(num)
    )
    
    console.log(`🔍 Found ${recoverable.length} recoverable episodes:`, recoverable)
    return recoverable
  } catch (error) {
    console.error('Error finding recoverable episodes:', error)
    return []
  }
}

/**
 * Delete an episode and its pre-production data
 */
export async function deleteEpisode(
  storyBibleId: string,
  episodeNumber: number, 
  userId?: string
): Promise<void> {
  if (!storyBibleId) {
    throw new Error('storyBibleId is required to delete episode')
  }

  if (userId) {
    // Delete episode from Firestore
    try {
      const episodesRef = collection(db, 'users', userId, 'storyBibles', storyBibleId, 'episodes')
      const snapshot = await getDocs(episodesRef)
      
      let episodeId: string | null = null
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        if (data.episodeNumber === episodeNumber && data.storyBibleId === storyBibleId) {
          episodeId = docSnap.id
          await deleteDoc(docSnap.ref)
          console.log(`✅ Episode ${episodeNumber} deleted from Firestore`)
          break
        }
      }
      
      // Delete episode reflection if it exists
      if (episodeId) {
        try {
          const reflectionRef = doc(db, 'users', userId, 'storyBibles', storyBibleId, 'reflections', episodeId)
          const reflectionSnap = await getDoc(reflectionRef)
          if (reflectionSnap.exists()) {
            await deleteDoc(reflectionRef)
            console.log(`✅ Episode reflection for episode ${episodeNumber} deleted from Firestore`)
          }
        } catch (reflectionError) {
          console.error('Error deleting episode reflection from Firestore:', reflectionError)
          // Don't throw - episode deletion should succeed even if reflection deletion fails
        }
      }
      
      // Delete pre-production data for this episode
      try {
        const preProductionRef = collection(db, 'users', userId, 'storyBibles', storyBibleId, 'preproduction')
        const preProdQuery = query(
          preProductionRef,
          where('type', '==', 'episode'),
          where('episodeNumber', '==', episodeNumber)
        )
        const preProdSnapshot = await getDocs(preProdQuery)
        
        for (const docSnap of preProdSnapshot.docs) {
          await deleteDoc(docSnap.ref)
          console.log(`✅ Pre-production for episode ${episodeNumber} deleted from Firestore`)
        }
        
        // Also try V2 format (episode_ prefix)
        const v2DocId = `episode_${episodeNumber}`
        try {
          const v2DocRef = doc(preProductionRef, v2DocId)
          const v2DocSnap = await getDoc(v2DocRef)
          if (v2DocSnap.exists()) {
            await deleteDoc(v2DocRef)
            console.log(`✅ Pre-production V2 for episode ${episodeNumber} deleted from Firestore`)
          }
        } catch (v2Error) {
          // V2 doc might not exist, that's okay
          console.log(`ℹ️  No V2 pre-production found for episode ${episodeNumber}`)
        }
      } catch (preProdError) {
        console.error('Error deleting pre-production from Firestore:', preProdError)
        // Don't throw - episode deletion should succeed even if pre-prod deletion fails
      }
    } catch (error) {
      console.error('Error deleting episode from Firestore:', error)
      throw error
    }
  } else {
    // Delete from localStorage
    const stored = localStorage.getItem(LOCALSTORAGE_KEY)
    if (stored) {
      try {
        const episodes = JSON.parse(stored)
        const episode = episodes[episodeNumber]
        
        // Only delete if it belongs to this story bible
        if (episode && (!episode.storyBibleId || episode.storyBibleId === storyBibleId)) {
          delete episodes[episodeNumber]
          localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(episodes))
          console.log(`✅ Episode ${episodeNumber} deleted from localStorage`)
        }
      } catch (e) {
        console.error('Error deleting localStorage episode:', e)
        throw e
      }
    }
    
    // Delete pre-production from localStorage
    try {
      const preProdKeys = [
        'greenlit-preproduction',
        'scorched-preproduction',
        'reeled-preproduction',
        'preproduction'
      ]
      
      for (const key of preProdKeys) {
        const storedPreProd = localStorage.getItem(key)
        if (storedPreProd) {
          try {
            const allPreProduction = JSON.parse(storedPreProd)
            const episodeKey = `episode-${episodeNumber}`
            
            if (allPreProduction[episodeKey]) {
              delete allPreProduction[episodeKey]
              localStorage.setItem(key, JSON.stringify(allPreProduction))
              console.log(`✅ Pre-production for episode ${episodeNumber} deleted from localStorage (${key})`)
            }
            
            // Also check V2 format
            const v2Key = `episode_${episodeNumber}`
            if (allPreProduction[v2Key]) {
              delete allPreProduction[v2Key]
              localStorage.setItem(key, JSON.stringify(allPreProduction))
              console.log(`✅ Pre-production V2 for episode ${episodeNumber} deleted from localStorage (${key})`)
            }
          } catch (e) {
            // Continue to next key
            console.log(`ℹ️  No pre-production found in ${key}`)
          }
        }
      }
    } catch (preProdError) {
      console.error('Error deleting pre-production from localStorage:', preProdError)
      // Don't throw - episode deletion should succeed even if pre-prod deletion fails
    }
  }
}

/**
 * Delete all episodes for a story bible
 */
export async function deleteAllEpisodesForStoryBible(
  storyBibleId: string,
  userId?: string
): Promise<number> {
  if (!storyBibleId) {
    throw new Error('storyBibleId is required')
  }

  let deletedCount = 0

  if (userId) {
    // AUTHENTICATED USERS: Delete from BOTH Firestore AND localStorage
    
    // 1. Delete from Firestore (check multiple storyBibleId variations)
    const storyBibleIdsToCheck = [storyBibleId]
    
    // Also check for deterministic fallback ID if it looks like we have a real ID
    // (real IDs start with 'sb_', fallback IDs start with 'bible_')
    if (storyBibleId.startsWith('sb_')) {
      // Try to find fallback ID by checking localStorage episodes
      const LEGACY_KEYS = ['greenlit-episodes', 'scorched-episodes', 'reeled-episodes']
      for (const key of LEGACY_KEYS) {
        const stored = localStorage.getItem(key)
        if (stored) {
          try {
            const episodes = JSON.parse(stored)
            // Find any episodes that might be for this story bible but with different ID
            Object.values(episodes).forEach((ep: any) => {
              if (ep.storyBibleId && 
                  ep.storyBibleId !== storyBibleId && 
                  ep.storyBibleId.startsWith('bible_') &&
                  !storyBibleIdsToCheck.includes(ep.storyBibleId)) {
                storyBibleIdsToCheck.push(ep.storyBibleId)
              }
            })
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
    
    // Delete from Firestore for all found storyBibleIds
    try {
      for (const sbId of storyBibleIdsToCheck) {
        const episodesRef = collection(db, 'users', userId, 'storyBibles', sbId, 'episodes')
        const snapshot = await getDocs(episodesRef)
        
        for (const docSnap of snapshot.docs) {
          await deleteDoc(docSnap.ref)
          deletedCount++
        }
        
        if (snapshot.docs.length > 0) {
          console.log(`✅ Deleted ${snapshot.docs.length} episodes from Firestore under storyBibleId: ${sbId}`)
        }
      }
      
      console.log(`✅ Total: Deleted ${deletedCount} episodes from Firestore`)
    } catch (error) {
      console.error('Error deleting episodes from Firestore:', error)
      throw error
    }
    
    // 2. Delete from localStorage (ALL legacy keys)
    const LEGACY_KEYS = ['greenlit-episodes', 'scorched-episodes', 'reeled-episodes']
    let totalLocalDeleteCount = 0

    for (const key of LEGACY_KEYS) {
      const stored = localStorage.getItem(key)
      if (stored) {
        try {
          const episodes = JSON.parse(stored)
          const filtered: Record<number, Episode> = {}
          let localDeleteCount = 0
          
          Object.keys(episodes).forEach(epKey => {
            const episode = episodes[epKey]
            // Keep episodes from other story bibles
            // Delete if storyBibleId matches any of our IDs or if no storyBibleId
            const shouldDelete = !episode.storyBibleId || storyBibleIdsToCheck.includes(episode.storyBibleId)
            
            if (!shouldDelete) {
              filtered[Number(epKey)] = episode
            } else {
              localDeleteCount++
            }
          })
          
          if (Object.keys(filtered).length > 0) {
            localStorage.setItem(key, JSON.stringify(filtered))
          } else {
            localStorage.removeItem(key) // Remove empty key entirely
          }
          totalLocalDeleteCount += localDeleteCount
          
          if (localDeleteCount > 0) {
            console.log(`✅ Deleted ${localDeleteCount} episodes from localStorage key: ${key}`)
          }
        } catch (e) {
          console.error(`Error deleting localStorage episodes from ${key}:`, e)
        }
      }
    }

    console.log(`✅ Total: Deleted ${totalLocalDeleteCount} episodes from localStorage`)
  } else {
    // GUEST USERS: Delete from localStorage only (ALL legacy keys)
    const LEGACY_KEYS = ['greenlit-episodes', 'scorched-episodes', 'reeled-episodes']

    for (const key of LEGACY_KEYS) {
      const stored = localStorage.getItem(key)
      if (stored) {
        try {
          const episodes = JSON.parse(stored)
          const filtered: Record<number, Episode> = {}
          
          Object.keys(episodes).forEach(epKey => {
            const episode = episodes[epKey]
            // Keep episodes from other story bibles
            const shouldDelete = !episode.storyBibleId || episode.storyBibleId === storyBibleId
            
            if (!shouldDelete) {
              filtered[Number(epKey)] = episode
            } else {
              deletedCount++
            }
          })
          
          if (Object.keys(filtered).length > 0) {
            localStorage.setItem(key, JSON.stringify(filtered))
          } else {
            localStorage.removeItem(key) // Remove empty key entirely
          }
        } catch (e) {
          console.error(`Error deleting localStorage episodes from ${key}:`, e)
          throw e
        }
      }
    }

    console.log(`✅ Deleted ${deletedCount} episodes from localStorage for story bible ${storyBibleId}`)
  }

  return deletedCount
}

/**
 * Migrate localStorage episodes to Firestore for a specific story bible
 */
export async function migrateEpisodesToFirestore(
  storyBibleId: string,
  userId: string,
  options: {
    skipDuplicates?: boolean
    clearAfterMigration?: boolean
  } = {}
): Promise<{ migrated: number; skipped: number; errors: number }> {
  if (!storyBibleId || !userId) {
    throw new Error('storyBibleId and userId are required for migration')
  }

  let migrated = 0
  let skipped = 0
  let errors = 0
  
  // Get local episodes
  const localEpisodes = await getEpisodesForStoryBible(storyBibleId)
  
  // Get Firestore episodes to check for duplicates
  const firestoreEpisodes = await getEpisodesForStoryBible(storyBibleId, userId)
  
  for (const episodeNum of Object.keys(localEpisodes)) {
    const episode = localEpisodes[Number(episodeNum)]
    
    try {
      // Check for duplicates
      const duplicate = firestoreEpisodes[Number(episodeNum)]
      
      if (duplicate && options.skipDuplicates) {
        console.log(`Skipping duplicate episode ${episodeNum}`)
        skipped++
        continue
      }
      
      // Ensure episode has storyBibleId
      if (!episode.storyBibleId) {
        episode.storyBibleId = storyBibleId
      }
      
      // Migrate to Firestore
      await saveEpisode(episode, storyBibleId, userId)
      migrated++
    } catch (error) {
      console.error(`Error migrating episode ${episodeNum}:`, error)
      errors++
    }
  }
  
  // Clear localStorage if requested and all migrated successfully
  if (options.clearAfterMigration && errors === 0) {
    await deleteAllEpisodesForStoryBible(storyBibleId)
  }
  
  return { migrated, skipped, errors }
}

/**
 * Check if there are any episodes in localStorage for a story bible
 */
export function hasLocalEpisodes(storyBibleId?: string): boolean {
  const keys = [
    'greenlit-episodes',
    'scorched-episodes',
    'reeled-episodes'
  ]
  
  return keys.some(key => {
    const stored = localStorage.getItem(key)
    if (!stored) return false
    try {
      const episodes = JSON.parse(stored)
      if (!storyBibleId) {
        // If no storyBibleId provided, just check if any episodes exist
        return Object.keys(episodes).length > 0
      }
      // Check if any episodes match this story bible
      return Object.values(episodes).some((ep: any) => 
        !ep.storyBibleId || ep.storyBibleId === storyBibleId
      )
    } catch {
      return false
    }
  })
}

/**
 * Episode Ideas/Suggestions Interface
 */
export interface EpisodeIdeas {
  id: string
  storyBibleId: string
  episodeNumber: number
  choices: Array<{
    id: number
    text: string
    description?: string
    isCanonical: boolean
  }>
  generatedAt: string
  lastModified: string
  ownerId?: string
}

const EPISODE_IDEAS_LOCALSTORAGE_KEY = 'episode-ideas'

/**
 * Save episode ideas to Firestore (if userId provided) or localStorage
 */
export async function saveEpisodeIdeas(
  episodeIdeas: Omit<EpisodeIdeas, 'id' | 'generatedAt' | 'lastModified'>,
  storyBibleId: string,
  userId?: string
): Promise<EpisodeIdeas> {
  if (!storyBibleId) {
    throw new Error('storyBibleId is required to save episode ideas')
  }

  // If userId not provided, try to get it from Firebase auth directly
  let finalUserId = userId
  if (!finalUserId && typeof window !== 'undefined') {
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        finalUserId = currentUser.uid
        console.log('🔍 saveEpisodeIdeas: userId not provided, using auth.currentUser:', finalUserId)
      }
    } catch (error) {
      console.warn('⚠️ Could not check Firebase auth in saveEpisodeIdeas:', error)
    }
  }

  const now = new Date().toISOString()
  const ideasId = `ideas_ep_${episodeIdeas.episodeNumber}`
  
  const updatedIdeas: EpisodeIdeas = {
    ...episodeIdeas,
    id: ideasId,
    storyBibleId,
    generatedAt: now,
    lastModified: now,
    ownerId: finalUserId
  }

  if (finalUserId) {
    // AUTHENTICATED: Firestore ONLY
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('AUTH_EXPIRED:Your session has expired. Please sign in again to continue.')
      }
      
      if (currentUser.uid !== finalUserId) {
        throw new Error(`Auth mismatch: currentUser.uid (${currentUser.uid}) !== userId (${finalUserId})`)
      }
      
      const docRef = doc(db, 'users', finalUserId, 'storyBibles', storyBibleId, 'episodeIdeas', ideasId)
      
      const dataToSave = {
        ...updatedIdeas,
        generatedAt: Timestamp.fromDate(new Date(updatedIdeas.generatedAt)),
        lastModified: Timestamp.fromDate(new Date(updatedIdeas.lastModified))
      }
      
      await setDoc(docRef, dataToSave)
      console.log(`✅ Episode ideas for episode ${episodeIdeas.episodeNumber} saved to Firestore`)
    } catch (error: any) {
      console.error('❌ FAILED to save episode ideas to Firestore:', {
        error: error.message,
        code: error.code,
        userId,
        storyBibleId,
        episodeNumber: episodeIdeas.episodeNumber
      })
      throw new Error(`Failed to save episode ideas to Firestore: ${error.message}`)
    }
  } else {
    // GUEST: localStorage only
    if (typeof window === 'undefined') {
      throw new Error('Cannot save episode ideas: localStorage not available (server-side)')
    }
    const stored = localStorage.getItem(EPISODE_IDEAS_LOCALSTORAGE_KEY)
    const allIdeas = stored ? JSON.parse(stored) : {}
    const key = `${storyBibleId}_${episodeIdeas.episodeNumber}`
    allIdeas[key] = updatedIdeas
    localStorage.setItem(EPISODE_IDEAS_LOCALSTORAGE_KEY, JSON.stringify(allIdeas))
    console.log(`⚠️ GUEST MODE: Episode ideas for episode ${episodeIdeas.episodeNumber} saved to localStorage only`)
  }

  return updatedIdeas
}

/**
 * Get episode ideas for a specific episode
 */
export async function getEpisodeIdeas(
  storyBibleId: string,
  episodeNumber: number,
  userId?: string
): Promise<EpisodeIdeas | null> {
  if (!storyBibleId) {
    console.warn('storyBibleId is required to get episode ideas')
    return null
  }

  // If userId not provided, try to get it from Firebase auth directly
  let finalUserId = userId
  if (!finalUserId && typeof window !== 'undefined') {
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        finalUserId = currentUser.uid
        console.log('🔍 getEpisodeIdeas: userId not provided, using auth.currentUser:', finalUserId)
      }
    } catch (error) {
      console.warn('⚠️ Could not check Firebase auth in getEpisodeIdeas:', error)
    }
  }

  if (finalUserId) {
    // AUTHENTICATED: Try Firestore first, fallback to localStorage
    try {
      const ideasId = `ideas_ep_${episodeNumber}`
      const docRef = doc(db, 'users', finalUserId, 'storyBibles', storyBibleId, 'episodeIdeas', ideasId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        const ideas: EpisodeIdeas = {
          ...data,
          id: docSnap.id,
          generatedAt: data.generatedAt?.toDate?.()?.toISOString() || data.generatedAt,
          lastModified: data.lastModified?.toDate?.()?.toISOString() || data.lastModified,
        } as EpisodeIdeas
        
        console.log(`✅ Loaded episode ideas for episode ${episodeNumber} from Firestore`)
        return ideas
      }
      
      console.log(`ℹ️  No episode ideas found in Firestore for episode ${episodeNumber}`)
      // Fallback to localStorage
      return getEpisodeIdeasFromLocalStorage(storyBibleId, episodeNumber)
    } catch (error) {
      console.error('❌ Error loading episode ideas from Firestore, trying localStorage:', error)
      return getEpisodeIdeasFromLocalStorage(storyBibleId, episodeNumber)
    }
  } else {
    // GUEST: localStorage only
    return getEpisodeIdeasFromLocalStorage(storyBibleId, episodeNumber)
  }
}

/**
 * Helper to get episode ideas from localStorage
 */
function getEpisodeIdeasFromLocalStorage(storyBibleId: string, episodeNumber: number): EpisodeIdeas | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  try {
    const stored = localStorage.getItem(EPISODE_IDEAS_LOCALSTORAGE_KEY)
    if (!stored) {
      return null
    }
    
    const allIdeas = JSON.parse(stored)
    const key = `${storyBibleId}_${episodeNumber}`
    const ideas = allIdeas[key]
    
    if (ideas) {
      console.log(`✅ Loaded episode ideas for episode ${episodeNumber} from localStorage`)
      return ideas as EpisodeIdeas
    }
    
    return null
  } catch (error) {
    console.error('Error loading episode ideas from localStorage:', error)
    return null
  }
}

