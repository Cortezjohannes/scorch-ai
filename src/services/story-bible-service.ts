import { db } from '@/lib/firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore'

export type StoryBibleStatus = 'draft' | 'in-progress' | 'complete'

export interface StoryBible {
  id: string
  seriesTitle: string
  seriesOverview?: string
  characters?: any[]
  storyArcs?: any[]
  worldElements?: any[]
  status: StoryBibleStatus
  createdAt: string
  updatedAt: string
  ownerId?: string
  [key: string]: any // Allow other properties from existing structure
}

const LOCALSTORAGE_KEY = 'greenlit-story-bible'

/**
 * Save a story bible to Firestore (if userId provided) or localStorage
 */
export async function saveStoryBible(
  storyBible: Partial<StoryBible>, 
  userId?: string
): Promise<StoryBible> {
  const now = new Date().toISOString()
  
  const updatedStoryBible: StoryBible = {
    ...storyBible,
    id: storyBible.id || generateId(),
    status: storyBible.status || 'draft',
    createdAt: storyBible.createdAt || now,
    updatedAt: now,
    ownerId: userId,
  } as StoryBible

  if (userId) {
    // Save to Firestore
    const docRef = doc(db, 'users', userId, 'storyBibles', updatedStoryBible.id)
    await setDoc(docRef, {
      ...updatedStoryBible,
      createdAt: Timestamp.fromDate(new Date(updatedStoryBible.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(updatedStoryBible.updatedAt))
    })
  } else {
    // Save to localStorage
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updatedStoryBible))
  }

  return updatedStoryBible
}

/**
 * Get all story bibles from Firestore (if userId) or localStorage
 */
export async function getStoryBibles(userId?: string): Promise<StoryBible[]> {
  if (userId) {
    // Fetch from Firestore
    const q = query(
      collection(db, 'users', userId, 'storyBibles'),
      orderBy('updatedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as StoryBible
    })
  } else {
    // Get from localStorage
    const stored = localStorage.getItem(LOCALSTORAGE_KEY)
    if (stored) {
      try {
        const storyBible = JSON.parse(stored)
        return [storyBible] // Return as array for consistency
      } catch (e) {
        console.error('Error parsing localStorage story bible:', e)
        return []
      }
    }
    return []
  }
}

/**
 * Get a single story bible by ID
 */
export async function getStoryBible(
  id: string, 
  userId?: string
): Promise<StoryBible | null> {
  if (userId) {
    // Fetch from Firestore
    const docRef = doc(db, 'users', userId, 'storyBibles', id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as StoryBible
    }
    return null
  } else {
    // Get from localStorage
    const stored = localStorage.getItem(LOCALSTORAGE_KEY)
    if (stored) {
      try {
        const storyBible = JSON.parse(stored)
        if (storyBible.id === id) {
          return storyBible
        }
      } catch (e) {
        console.error('Error parsing localStorage story bible:', e)
      }
    }
    return null
  }
}

/**
 * Delete a story bible
 */
export async function deleteStoryBible(
  id: string, 
  userId?: string
): Promise<void> {
  if (userId) {
    // Delete from Firestore
    const docRef = doc(db, 'users', userId, 'storyBibles', id)
    await deleteDoc(docRef)
  } else {
    // Delete from localStorage
    const stored = localStorage.getItem(LOCALSTORAGE_KEY)
    if (stored) {
      try {
        const storyBible = JSON.parse(stored)
        if (storyBible.id === id) {
          localStorage.removeItem(LOCALSTORAGE_KEY)
        }
      } catch (e) {
        console.error('Error deleting localStorage story bible:', e)
      }
    }
  }
}

/**
 * Migrate localStorage story bible to Firestore
 */
export async function migrateLocalStorageToFirestore(userId: string): Promise<number> {
  const stored = localStorage.getItem(LOCALSTORAGE_KEY)
  if (!stored) return 0

  try {
    const storyBible = JSON.parse(stored)
    await saveStoryBible(storyBible, userId)
    // Don't remove from localStorage yet - let user decide
    return 1
  } catch (e) {
    console.error('Error migrating story bible:', e)
    return 0
  }
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `sb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if there are any story bibles in localStorage
 */
export function hasLocalStorageBibles(): boolean {
  const keys = [
    'greenlit-story-bible',
    'scorched-story-bible', 
    'reeled-story-bible'
  ]
  
  return keys.some(key => {
    const stored = localStorage.getItem(key)
    if (!stored) return false
    try {
      const parsed = JSON.parse(stored)
      return parsed && (parsed.seriesTitle || parsed.storyBible?.seriesTitle)
    } catch {
      return false
    }
  })
}

/**
 * Get all localStorage story bibles (handles multiple keys)
 */
export function getLocalStorageBibles(): StoryBible[] {
  const keys = [
    'greenlit-story-bible',
    'scorched-story-bible',
    'reeled-story-bible'
  ]
  
  const bibles: StoryBible[] = []
  
  keys.forEach(key => {
    const stored = localStorage.getItem(key)
    if (!stored) return
    
    try {
      const parsed = JSON.parse(stored)
      const bible = parsed.storyBible || parsed
      
      if (bible && bible.seriesTitle) {
        bibles.push({
          ...bible,
          id: bible.id || generateId(),
          status: bible.status || 'draft',
          createdAt: bible.createdAt || new Date().toISOString(),
          updatedAt: bible.updatedAt || new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error(`Error parsing ${key}:`, error)
    }
  })
  
  return bibles
}

/**
 * Check if a story bible already exists in Firestore
 */
export async function checkForDuplicate(
  storyBible: StoryBible,
  userId: string
): Promise<StoryBible | null> {
  const firestoreBibles = await getStoryBibles(userId)
  
  // Check by exact title match or ID match
  const duplicate = firestoreBibles.find(
    fb => fb.seriesTitle === storyBible.seriesTitle || 
          fb.id === storyBible.id
  )
  
  return duplicate || null
}

/**
 * Migrate all localStorage bibles to Firestore
 */
export async function migrateAllLocalBibles(
  userId: string,
  options: {
    skipDuplicates?: boolean
    clearAfterMigration?: boolean
  } = {}
): Promise<{ migrated: number; skipped: number; errors: number }> {
  const localBibles = getLocalStorageBibles()
  let migrated = 0
  let skipped = 0
  let errors = 0
  
  for (const bible of localBibles) {
    try {
      // Check for duplicates
      const duplicate = await checkForDuplicate(bible, userId)
      
      if (duplicate && options.skipDuplicates) {
        console.log(`Skipping duplicate: ${bible.seriesTitle}`)
        skipped++
        continue
      }
      
      // If duplicate exists but we're not skipping, generate new ID
      if (duplicate) {
        bible.id = generateId()
        bible.seriesTitle = `${bible.seriesTitle} (Copy)`
      }
      
      await saveStoryBible(bible, userId)
      migrated++
    } catch (error) {
      console.error(`Error migrating ${bible.seriesTitle}:`, error)
      errors++
    }
  }
  
  // Clear localStorage if requested and all migrated successfully
  if (options.clearAfterMigration && errors === 0) {
    clearLocalStorage()
  }
  
  return { migrated, skipped, errors }
}

/**
 * Clear all story bible data from localStorage
 */
export function clearLocalStorage(): void {
  const keys = [
    'greenlit-story-bible',
    'scorched-story-bible',
    'reeled-story-bible'
  ]
  
  keys.forEach(key => localStorage.removeItem(key))
}

