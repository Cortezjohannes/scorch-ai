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
  Timestamp
} from 'firebase/firestore'

export interface PreProduction {
  id: string
  episodeId: string
  episodeNumber: number
  storyBibleId: string // REQUIRED - must match episode's story bible
  script: any
  storyboard: any[]
  castingBrief: any
  propsList: any[]
  locationsList: any[]
  wardrobe: any[]
  productionNotes?: string
  status: 'generating' | 'complete' | 'error'
  generatedAt: string
  updatedAt: string
  ownerId?: string
  [key: string]: any // Allow other properties
}

const LOCALSTORAGE_KEY = 'greenlit-preproduction-content'

/**
 * Generate a unique ID for pre-production
 */
function generatePreProductionId(storyBibleId: string, episodeNumber: number): string {
  return `preprod_${storyBibleId}_ep${episodeNumber}_${Date.now()}`
}

/**
 * Helper function to load pre-production from localStorage
 */
function loadFromLocalStorage(storyBibleId: string, episodeNumber: number): PreProduction | null {
  const keys = [
    LOCALSTORAGE_KEY,
    'scorched-preproduction-content',
    'reeled-preproduction-content',
    'greenlit-preproduction',
    'scorched-preproduction',
    'reeled-preproduction'
  ]
  
  for (const key of keys) {
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        const allPreProduction = JSON.parse(stored)
        const preProduction = allPreProduction[`episode-${episodeNumber}`]
        
        if (preProduction) {
          // Check if it belongs to this story bible or has no storyBibleId (legacy)
          if (!preProduction.storyBibleId || preProduction.storyBibleId === storyBibleId) {
            console.log(`✅ Loaded pre-production for episode ${episodeNumber} from localStorage`)
            return {
              ...preProduction,
              storyBibleId: preProduction.storyBibleId || storyBibleId // Set if missing
            }
          }
        }
      } catch (e) {
        console.error(`Error parsing localStorage key ${key}:`, e)
      }
    }
  }
  
  return null
}

/**
 * Save pre-production to Firestore (if userId provided) or localStorage
 * Pre-production is ALWAYS tied to a story bible
 */
export async function savePreProduction(
  preProduction: Partial<PreProduction>,
  storyBibleId: string,
  userId?: string
): Promise<PreProduction> {
  if (!storyBibleId) {
    throw new Error('storyBibleId is required to save pre-production')
  }

  if (!preProduction.episodeNumber) {
    throw new Error('episodeNumber is required to save pre-production')
  }

  const now = new Date().toISOString()
  
  const updatedPreProduction: PreProduction = {
    ...preProduction,
    id: preProduction.id || generatePreProductionId(storyBibleId, preProduction.episodeNumber),
    storyBibleId, // ALWAYS set this
    episodeNumber: preProduction.episodeNumber,
    episodeId: preProduction.episodeId || `ep_${preProduction.episodeNumber}`,
    script: preProduction.script || {},
    storyboard: preProduction.storyboard || [],
    castingBrief: preProduction.castingBrief || {},
    propsList: preProduction.propsList || [],
    locationsList: preProduction.locationsList || [],
    wardrobe: preProduction.wardrobe || [],
    status: preProduction.status || 'complete',
    generatedAt: preProduction.generatedAt || now,
    updatedAt: now,
    ownerId: userId,
  } as PreProduction

  if (userId) {
    // AUTHENTICATED: Firestore is primary, localStorage is backup
    try {
      const docRef = doc(
        db, 
        'users', userId, 
        'storyBibles', storyBibleId, 
        'preproduction', updatedPreProduction.id
      )
      await setDoc(docRef, {
        ...updatedPreProduction,
        generatedAt: Timestamp.fromDate(new Date(updatedPreProduction.generatedAt)),
        updatedAt: Timestamp.fromDate(new Date(updatedPreProduction.updatedAt))
      })
      console.log(`✅ Pre-production for episode ${updatedPreProduction.episodeNumber} saved to Firestore (primary)`)
      
      // Also backup to localStorage for offline access
      const stored = localStorage.getItem(LOCALSTORAGE_KEY)
      const allPreProduction = stored ? JSON.parse(stored) : {}
      allPreProduction[`episode-${updatedPreProduction.episodeNumber}`] = updatedPreProduction
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(allPreProduction))
      console.log(`✅ Pre-production for episode ${updatedPreProduction.episodeNumber} backed up to localStorage`)
    } catch (error: any) {
      console.error('❌ FAILED to save pre-production to Firestore:', error)
      throw new Error(`Failed to save pre-production: ${error.message}`)
    }
  } else {
    // GUEST: localStorage only
    const stored = localStorage.getItem(LOCALSTORAGE_KEY)
    const allPreProduction = stored ? JSON.parse(stored) : {}
    allPreProduction[`episode-${updatedPreProduction.episodeNumber}`] = updatedPreProduction
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(allPreProduction))
    console.log(`⚠️ GUEST MODE: Pre-production for episode ${updatedPreProduction.episodeNumber} saved to localStorage only (will not sync across devices)`)
  }

  return updatedPreProduction
}

/**
 * Get pre-production for a specific episode in a story bible
 */
export async function getPreProduction(
  storyBibleId: string,
  episodeNumber: number,
  userId?: string
): Promise<PreProduction | null> {
  if (!storyBibleId) {
    console.warn('storyBibleId is required to get pre-production')
    return null
  }

  if (userId) {
    // AUTHENTICATED: Try Firestore first, fallback to localStorage
    try {
      const preProductionRef = collection(
        db, 
        'users', userId, 
        'storyBibles', storyBibleId, 
        'preproduction'
      )
      const q = query(preProductionRef, where('episodeNumber', '==', episodeNumber))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0]
        const data = docSnap.data()
        
        // Verify it belongs to this story bible
        if (data.storyBibleId === storyBibleId) {
          console.log(`✅ Loaded pre-production for episode ${episodeNumber} from Firestore`)
          return {
            ...data,
            id: docSnap.id,
            generatedAt: data.generatedAt?.toDate?.()?.toISOString() || data.generatedAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          } as PreProduction
        }
      }
      return null
    } catch (error) {
      console.error('❌ Error loading from Firestore, trying localStorage:', error)
      // FALLBACK: Try localStorage
      return loadFromLocalStorage(storyBibleId, episodeNumber)
    }
  } else {
    // GUEST: localStorage only
    console.log('⚠️ GUEST MODE: Loading pre-production from localStorage')
    return loadFromLocalStorage(storyBibleId, episodeNumber)
  }
}

/**
 * Check if pre-production exists for a specific episode
 */
export async function hasPreProduction(
  storyBibleId: string,
  episodeNumber: number,
  userId?: string
): Promise<boolean> {
  const preProduction = await getPreProduction(storyBibleId, episodeNumber, userId)
  return preProduction !== null
}

/**
 * Get all pre-production for a story bible
 */
export async function getAllPreProductionForStoryBible(
  storyBibleId: string,
  userId?: string
): Promise<Record<number, PreProduction>> {
  if (!storyBibleId) {
    console.warn('storyBibleId is required to get all pre-production')
    return {}
  }

  if (userId) {
    // Fetch from Firestore
    try {
      const preProductionRef = collection(
        db, 
        'users', userId, 
        'storyBibles', storyBibleId, 
        'preproduction'
      )
      const snapshot = await getDocs(preProductionRef)
      
      const preProductions: Record<number, PreProduction> = {}
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        
        // Only include pre-production for this story bible
        if (data.storyBibleId === storyBibleId) {
          const preProduction: PreProduction = {
            ...data,
            id: doc.id,
            generatedAt: data.generatedAt?.toDate?.()?.toISOString() || data.generatedAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          } as PreProduction
          preProductions[preProduction.episodeNumber] = preProduction
        }
      })
      
      console.log(`✅ Loaded ${Object.keys(preProductions).length} pre-production entries from Firestore for story bible ${storyBibleId}`)
      return preProductions
    } catch (error) {
      console.error('Error loading pre-production from Firestore:', error)
      return {}
    }
  } else {
    // Get from localStorage
    const stored = localStorage.getItem(LOCALSTORAGE_KEY) ||
                   localStorage.getItem('scorched-preproduction-content') ||
                   localStorage.getItem('reeled-preproduction-content')
    
    if (stored) {
      try {
        const allPreProduction = JSON.parse(stored)
        const preProductions: Record<number, PreProduction> = {}
        
        Object.keys(allPreProduction).forEach(key => {
          const preProduction = allPreProduction[key]
          
          // Only include pre-production for this story bible
          if (!preProduction.storyBibleId || preProduction.storyBibleId === storyBibleId) {
            preProductions[preProduction.episodeNumber] = {
              ...preProduction,
              storyBibleId: preProduction.storyBibleId || storyBibleId
            }
          }
        })
        
        console.log(`✅ Loaded ${Object.keys(preProductions).length} pre-production entries from localStorage for story bible ${storyBibleId}`)
        return preProductions
      } catch (e) {
        console.error('Error parsing localStorage pre-production:', e)
        return {}
      }
    }
    return {}
  }
}

/**
 * Delete pre-production for an episode
 */
export async function deletePreProduction(
  storyBibleId: string,
  episodeNumber: number,
  userId?: string
): Promise<void> {
  if (!storyBibleId) {
    throw new Error('storyBibleId is required to delete pre-production')
  }

  if (userId) {
    // Delete from Firestore
    try {
      const preProductionRef = collection(
        db, 
        'users', userId, 
        'storyBibles', storyBibleId, 
        'preproduction'
      )
      const q = query(preProductionRef, where('episodeNumber', '==', episodeNumber))
      const snapshot = await getDocs(q)
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        if (data.storyBibleId === storyBibleId) {
          await deleteDoc(docSnap.ref)
          console.log(`✅ Pre-production for episode ${episodeNumber} deleted from Firestore`)
        }
      }
    } catch (error) {
      console.error('Error deleting pre-production from Firestore:', error)
      throw error
    }
  } else {
    // Delete from localStorage
    const stored = localStorage.getItem(LOCALSTORAGE_KEY)
    if (stored) {
      try {
        const allPreProduction = JSON.parse(stored)
        const key = `episode-${episodeNumber}`
        const preProduction = allPreProduction[key]
        
        // Only delete if it belongs to this story bible
        if (preProduction && (!preProduction.storyBibleId || preProduction.storyBibleId === storyBibleId)) {
          delete allPreProduction[key]
          localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(allPreProduction))
          console.log(`✅ Pre-production for episode ${episodeNumber} deleted from localStorage`)
        }
      } catch (e) {
        console.error('Error deleting localStorage pre-production:', e)
        throw e
      }
    }
  }
}

/**
 * Delete all pre-production for a story bible
 */
export async function deleteAllPreProductionForStoryBible(
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
      const preProductionRef = collection(
        db, 
        'users', userId, 
        'storyBibles', storyBibleId, 
        'preproduction'
      )
      const snapshot = await getDocs(preProductionRef)
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data()
        if (data.storyBibleId === storyBibleId) {
          await deleteDoc(docSnap.ref)
          deletedCount++
        }
      }
      
      console.log(`✅ Deleted ${deletedCount} pre-production entries from Firestore for story bible ${storyBibleId}`)
    } catch (error) {
      console.error('Error deleting pre-production from Firestore:', error)
      throw error
    }
  } else {
    // Delete from localStorage
    const stored = localStorage.getItem(LOCALSTORAGE_KEY)
    if (stored) {
      try {
        const allPreProduction = JSON.parse(stored)
        const filtered: Record<string, PreProduction> = {}
        
        Object.keys(allPreProduction).forEach(key => {
          const preProduction = allPreProduction[key]
          
          // Keep pre-production from other story bibles
          if (preProduction.storyBibleId && preProduction.storyBibleId !== storyBibleId) {
            filtered[key] = preProduction
          } else if (!preProduction.storyBibleId) {
            // If no storyBibleId, assume it belongs to current story bible and delete
            deletedCount++
          } else {
            deletedCount++
          }
        })
        
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(filtered))
        console.log(`✅ Deleted ${deletedCount} pre-production entries from localStorage for story bible ${storyBibleId}`)
      } catch (e) {
        console.error('Error deleting localStorage pre-production:', e)
        throw e
      }
    }
  }

  return deletedCount
}

/**
 * Migrate localStorage pre-production to Firestore for a specific story bible
 */
export async function migratePreProductionToFirestore(
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
  
  // Get local pre-production
  const localPreProductions = await getAllPreProductionForStoryBible(storyBibleId)
  
  // Get Firestore pre-production to check for duplicates
  const firestorePreProductions = await getAllPreProductionForStoryBible(storyBibleId, userId)
  
  for (const episodeNum of Object.keys(localPreProductions)) {
    const preProduction = localPreProductions[Number(episodeNum)]
    
    try {
      // Check for duplicates
      const duplicate = firestorePreProductions[Number(episodeNum)]
      
      if (duplicate && options.skipDuplicates) {
        console.log(`Skipping duplicate pre-production for episode ${episodeNum}`)
        skipped++
        continue
      }
      
      // Ensure pre-production has storyBibleId
      if (!preProduction.storyBibleId) {
        preProduction.storyBibleId = storyBibleId
      }
      
      // Migrate to Firestore
      await savePreProduction(preProduction, storyBibleId, userId)
      migrated++
    } catch (error) {
      console.error(`Error migrating pre-production for episode ${episodeNum}:`, error)
      errors++
    }
  }
  
  // Clear localStorage if requested and all migrated successfully
  if (options.clearAfterMigration && errors === 0) {
    await deleteAllPreProductionForStoryBible(storyBibleId)
  }
  
  return { migrated, skipped, errors }
}

