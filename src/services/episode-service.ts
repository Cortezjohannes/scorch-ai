import { db } from '@/lib/firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query,
  orderBy,
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
  [key: string]: any // Allow other properties from existing structure
}

const LOCALSTORAGE_KEY = 'greenlit-episodes'

/**
 * Generate a unique ID for an episode
 */
function generateEpisodeId(storyBibleId: string, episodeNumber: number): string {
  return `ep_${storyBibleId}_${episodeNumber}_${Date.now()}`
}

/**
 * Helper function to load episodes from localStorage
 */
function loadFromLocalStorage(storyBibleId: string): Record<number, Episode> {
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
    ownerId: userId,
  } as Episode

  if (userId) {
    // AUTHENTICATED: Firestore is primary, localStorage is backup
    try {
      const docRef = doc(db, 'users', userId, 'storyBibles', storyBibleId, 'episodes', updatedEpisode.id)
      await setDoc(docRef, {
        ...updatedEpisode,
        generatedAt: Timestamp.fromDate(new Date(updatedEpisode.generatedAt)),
        lastModified: Timestamp.fromDate(new Date(updatedEpisode.lastModified))
      })
      console.log(`✅ Episode ${updatedEpisode.episodeNumber} saved to Firestore (primary)`)
      
      // Also backup to localStorage for offline access
      const stored = localStorage.getItem(LOCALSTORAGE_KEY)
      const episodes = stored ? JSON.parse(stored) : {}
      episodes[updatedEpisode.episodeNumber] = updatedEpisode
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(episodes))
      console.log(`✅ Episode ${updatedEpisode.episodeNumber} backed up to localStorage`)
    } catch (error: any) {
      console.error('❌ FAILED to save episode to Firestore:', error)
      throw new Error(`Failed to save episode: ${error.message}`)
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

  if (userId) {
    // AUTHENTICATED: Try Firestore first, fallback to localStorage
    try {
      const episodesRef = collection(db, 'users', userId, 'storyBibles', storyBibleId, 'episodes')
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
 * Delete an episode
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
    // Delete from Firestore
    try {
      const episodesRef = collection(db, 'users', userId, 'storyBibles', storyBibleId, 'episodes')
      const snapshot = await getDocs(episodesRef)
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        if (data.episodeNumber === episodeNumber && data.storyBibleId === storyBibleId) {
          await deleteDoc(docSnap.ref)
          console.log(`✅ Episode ${episodeNumber} deleted from Firestore`)
          return
        }
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
    // Delete from Firestore
    try {
      const episodesRef = collection(db, 'users', userId, 'storyBibles', storyBibleId, 'episodes')
      const snapshot = await getDocs(episodesRef)
      
      for (const docSnap of snapshot.docs) {
        await deleteDoc(docSnap.ref)
        deletedCount++
      }
      
      console.log(`✅ Deleted ${deletedCount} episodes from Firestore for story bible ${storyBibleId}`)
    } catch (error) {
      console.error('Error deleting episodes from Firestore:', error)
      throw error
    }
  } else {
    // Delete from localStorage
    const stored = localStorage.getItem(LOCALSTORAGE_KEY)
    if (stored) {
      try {
        const episodes = JSON.parse(stored)
        const filtered: Record<number, Episode> = {}
        
        Object.keys(episodes).forEach(key => {
          const episode = episodes[key]
          // Keep episodes from other story bibles
          if (episode.storyBibleId && episode.storyBibleId !== storyBibleId) {
            filtered[Number(key)] = episode
          } else if (!episode.storyBibleId) {
            // If no storyBibleId, assume it belongs to current story bible and delete
            deletedCount++
          } else {
            deletedCount++
          }
        })
        
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(filtered))
        console.log(`✅ Deleted ${deletedCount} episodes from localStorage for story bible ${storyBibleId}`)
      } catch (e) {
        console.error('Error deleting localStorage episodes:', e)
        throw e
      }
    }
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

