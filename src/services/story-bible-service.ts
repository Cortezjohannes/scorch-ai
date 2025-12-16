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

export interface ImageAsset {
  imageUrl: string
  prompt: string
  generatedAt: string
  source: 'gemini' | 'azure' | 'mock'
  promptVersion?: string // Track which prompt version was used (for future updates)
}

export interface VideoAsset {
  videoUrl: string
  prompt: string
  generatedAt: string
  source: 'veo3'
  duration?: number // 4, 6, or 8 seconds
  aspectRatio?: '16:9' | '9:16' | '1:1'
  quality?: 'standard' | 'high'
  hasAudio?: boolean
  creditsUsed?: number
  cost?: {
    amount: number
    currency: string
    mode: 'fast' | 'standard'
    hasAudio: boolean
  }
}

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
  visualAssets?: {
    heroImage?: ImageAsset
    generatedAt?: string
    lastRegenerated?: string
  }
  mainCharacters?: Array<{
    [key: string]: any
    visualReference?: ImageAsset
  }>
  narrativeArcs?: Array<{
    [key: string]: any
    keyArt?: ImageAsset
  }>
  worldBuilding?: {
    [key: string]: any
    locations?: Array<{
      [key: string]: any
      conceptArt?: ImageAsset
    }>
  }
  styleReferenceImages?: string[] // URLs of 1-3 images used as style references
  styleLockedAt?: string // When style was locked after first batch
  [key: string]: any // Allow other properties from existing structure
}

const LOCALSTORAGE_KEY = 'greenlit-story-bible'

/**
 * Check if we're running in a browser environment (has window and localStorage)
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

/**
 * Recursively check for base64 images in story bible data
 * Returns array of paths where base64 images are found
 */
function findBase64Images(obj: any, path: string = ''): string[] {
  const base64Paths: string[] = []
  
  if (!obj || typeof obj !== 'object') return base64Paths
  
  // Check if this is an ImageAsset with base64 imageUrl
  if (obj.imageUrl && typeof obj.imageUrl === 'string' && obj.imageUrl.startsWith('data:')) {
    base64Paths.push(path || 'root')
    return base64Paths
  }
  
  // Recursively check arrays
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      base64Paths.push(...findBase64Images(item, `${path}[${index}]`))
    })
    return base64Paths
  }
  
  // Recursively check objects
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newPath = path ? `${path}.${key}` : key
      base64Paths.push(...findBase64Images(obj[key], newPath))
    }
  }
  
  return base64Paths
}

/**
 * Save a story bible to Firestore (if userId provided) or localStorage
 * CRITICAL: Never saves base64 images - they must be uploaded to Storage first
 * 
 * @param storyBible - The story bible to save
 * @param userId - The user ID (optional, will try to get from auth if not provided)
 * @param updatingPath - Optional path being updated (e.g., "worldBuilding.locations[3].conceptArt") for better error messages
 */
export async function saveStoryBible(
  storyBible: Partial<StoryBible>, 
  userId?: string,
  updatingPath?: string
): Promise<StoryBible> {
  const now = new Date().toISOString()
  
  // If userId not provided, try to get it from Firebase auth directly (cross-device fix)
  let finalUserId = userId
  if (!finalUserId && typeof window !== 'undefined') {
    try {
      const { auth } = await import('@/lib/firebase')
      const currentUser = auth.currentUser
      if (currentUser) {
        finalUserId = currentUser.uid
        console.log('🔍 saveStoryBible: userId not provided, using auth.currentUser:', finalUserId)
      }
    } catch (error) {
      console.warn('⚠️ Could not check Firebase auth in saveStoryBible:', error)
    }
  }
  
  const updatedStoryBible: StoryBible = {
    ...storyBible,
    id: storyBible.id || generateId(),
    status: storyBible.status || 'draft',
    createdAt: storyBible.createdAt || now,
    updatedAt: now,
    ownerId: finalUserId,
  } as StoryBible

  if (finalUserId) {
    // Save to Firestore
    try {
      console.log('💾 Saving story bible to Firestore:', {
        storyBibleId: updatedStoryBible.id,
        userId: finalUserId,
        title: updatedStoryBible.seriesTitle
      })
      const docRef = doc(db, 'users', finalUserId, 'storyBibles', updatedStoryBible.id)
      
      // Helper function to recursively remove Firestore Timestamp objects and convert them
      const cleanForFirestore = (obj: any): any => {
        if (obj === null || obj === undefined) return obj
        
        // Handle primitives
        if (typeof obj !== 'object') return obj
        
        // Check if it's a Firestore Timestamp (has toDate method)
        if (obj && typeof obj === 'object' && typeof obj.toDate === 'function') {
          // Convert Timestamp to ISO string, then back to Date for Firestore
          return Timestamp.fromDate(obj.toDate())
        }
        
        // Handle Date objects
        if (obj instanceof Date) {
          return Timestamp.fromDate(obj)
        }
        
        // Handle arrays
        if (Array.isArray(obj)) {
          return obj.map(cleanForFirestore)
        }
        
        // Handle objects - ensure they're plain objects
        if (typeof obj === 'object') {
          // Skip Firestore internal fields and non-plain objects
          if (obj.constructor && obj.constructor.name !== 'Object') {
            // Convert class instances to plain objects
            try {
              obj = JSON.parse(JSON.stringify(obj))
            } catch (e) {
              console.warn('Could not serialize object:', obj)
              return null
            }
          }
          
          const cleaned: any = {}
          for (const key in obj) {
            // Skip Firestore internal fields that shouldn't be saved
            if (key === '__snapshot' || key === '__metadata') continue
            // Skip undefined values
            if (obj[key] === undefined) continue
            cleaned[key] = cleanForFirestore(obj[key])
          }
          return cleaned
        }
        
        return obj
      }
      
      // Clean the data and prepare for Firestore
      const firestoreData = cleanForFirestore(updatedStoryBible)
      
      // Ensure createdAt and updatedAt are Timestamps
      firestoreData.createdAt = Timestamp.fromDate(new Date(updatedStoryBible.createdAt || now))
      firestoreData.updatedAt = Timestamp.fromDate(new Date(updatedStoryBible.updatedAt || now))
      
      // Handle lockedAt if it exists - convert from Timestamp to Timestamp (or remove if null)
      if (firestoreData.lockedAt) {
        if (typeof firestoreData.lockedAt.toDate === 'function') {
          firestoreData.lockedAt = Timestamp.fromDate(firestoreData.lockedAt.toDate())
        } else if (typeof firestoreData.lockedAt === 'string') {
          firestoreData.lockedAt = Timestamp.fromDate(new Date(firestoreData.lockedAt))
        }
      }
      
      await setDoc(docRef, firestoreData)
      console.log('✅ Story bible saved to Firestore successfully')
    } catch (error: any) {
      console.error('❌ Failed to save story bible to Firestore:', {
        error: error.message,
        code: error.code,
        userId: finalUserId,
        storyBibleId: updatedStoryBible.id,
        errorDetails: error.toString(),
        stack: error.stack
      })
      
      // Log the problematic data structure if it's a nested entity error
      if (error.message?.includes('nested entity') || error.code === 'invalid-argument') {
        console.error('🔍 Debugging nested entity error - checking marketing.visualAssets:', {
          hasMarketing: !!updatedStoryBible.marketing,
          hasVisualAssets: !!updatedStoryBible.marketing?.visualAssets,
          visualAssetsKeys: updatedStoryBible.marketing?.visualAssets ? Object.keys(updatedStoryBible.marketing.visualAssets) : [],
          seriesPoster: updatedStoryBible.marketing?.visualAssets?.seriesPoster ? 'exists' : 'missing',
          seriesTeaser: updatedStoryBible.marketing?.visualAssets?.seriesTeaser ? 'exists' : 'missing'
        })
      }
      
      throw error // Re-throw so caller knows it failed
    }
  } else {
    // Save to localStorage (guest mode) - only in browser
    if (isBrowser()) {
      console.log('⚠️ Guest mode - saving story bible to localStorage only (will not sync across devices)')
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updatedStoryBible))
    } else {
      // Server-side: cannot save to localStorage, throw error
      throw new Error('Cannot save story bible in guest mode on server. Provide userId or call from client.')
    }
  }

  return updatedStoryBible
}

/**
 * Get all story bibles from Firestore (if userId) or localStorage
 */
export async function getStoryBibles(userId?: string): Promise<StoryBible[]> {
  // If userId not provided, try to get it from Firebase auth directly (cross-device fix)
  let finalUserId = userId
  if (!finalUserId && typeof window !== 'undefined') {
    try {
      const { auth } = await import('@/lib/firebase')
      const currentUser = auth.currentUser
      if (currentUser) {
        finalUserId = currentUser.uid
        console.log('🔍 getStoryBibles: userId not provided, using auth.currentUser:', finalUserId)
      }
    } catch (error) {
      console.warn('⚠️ Could not check Firebase auth in getStoryBibles:', error)
    }
  }

  if (finalUserId) {
    // Fetch from Firestore
    const q = query(
      collection(db, 'users', finalUserId, 'storyBibles'),
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
    // Get from localStorage - only in browser
    if (isBrowser()) {
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
    }
    // Server-side: no localStorage, return empty array
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
  // If userId not provided, try to get it from Firebase auth directly (cross-device fix)
  let finalUserId = userId
  if (!finalUserId && typeof window !== 'undefined') {
    try {
      const { auth } = await import('@/lib/firebase')
      const currentUser = auth.currentUser
      if (currentUser) {
        finalUserId = currentUser.uid
        console.log('🔍 getStoryBible: userId not provided, using auth.currentUser:', finalUserId)
      }
    } catch (error) {
      console.warn('⚠️ Could not check Firebase auth in getStoryBible:', error)
    }
  }

  if (finalUserId) {
    // Fetch from Firestore
    try {
      console.log('📖 Loading story bible from Firestore:', { storyBibleId: id, userId: finalUserId })
      const docRef = doc(db, 'users', finalUserId, 'storyBibles', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        console.log('✅ Story bible loaded from Firestore')
        
        // Debug: Log character images
        if (data?.mainCharacters) {
          console.log(`📸 [Client] Found ${data.mainCharacters.length} characters in Firestore`)
          data.mainCharacters.forEach((char: any, idx: number) => {
            if (char?.visualReference?.imageUrl) {
              console.log(`  Character ${idx} (${char.name}): HAS IMAGE - ${char.visualReference.imageUrl.substring(0, 60)}...`)
            } else {
              console.log(`  Character ${idx} (${char.name}): NO IMAGE - visualReference:`, char?.visualReference ? 'exists but no imageUrl' : 'missing')
            }
          })
        } else {
          console.log(`📸 [Client] NO mainCharacters array in Firestore`)
        }
        
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as StoryBible
      }
      console.log('⚠️ Story bible not found in Firestore')
      return null
    } catch (error: any) {
      console.error('❌ Error loading story bible from Firestore:', {
        error: error.message,
        code: error.code,
        storyBibleId: id,
        userId: finalUserId
      })
      // On server-side, return null instead of falling back to localStorage
      if (!isBrowser()) {
        return null
      }
      // Fall through to localStorage fallback (browser only)
    }
  }
  
  // Fallback to localStorage (browser only)
  if (isBrowser()) {
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
  }
  
  // Server-side or no match: return null
  return null
}

/**
 * Get style reference images from story bible
 */
export function getStyleReferenceImages(storyBible: StoryBible): string[] {
  return storyBible.styleReferenceImages || []
}

/**
 * Set style reference images on story bible (locks style after first batch)
 */
export function setStyleReferenceImages(
  storyBible: StoryBible, 
  imageUrls: string[]
): StoryBible {
  const maxReferenceImages = 3
  return {
    ...storyBible,
    styleReferenceImages: imageUrls.slice(0, maxReferenceImages),
    styleLockedAt: new Date().toISOString()
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
    // Delete from localStorage (browser only)
    if (isBrowser()) {
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
    // Server-side: no-op (cannot delete from localStorage)
  }
}

/**
 * Migrate localStorage story bible to Firestore
 */
export async function migrateLocalStorageToFirestore(userId: string): Promise<number> {
  if (!isBrowser()) {
    // Server-side: cannot access localStorage
    return 0
  }
  
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
  if (!isBrowser()) {
    // Server-side: no localStorage
    return false
  }
  
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
  if (!isBrowser()) {
    // Server-side: no localStorage
    return []
  }
  
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
  if (!isBrowser()) {
    // Server-side: no localStorage to clear
    return
  }
  
  const keys = [
    'greenlit-story-bible',
    'scorched-story-bible',
    'reeled-story-bible'
  ]
  
  keys.forEach(key => localStorage.removeItem(key))
}

