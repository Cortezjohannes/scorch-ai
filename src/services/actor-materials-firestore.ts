/**
 * Actor Materials Firestore Service
 * Handles storage and retrieval of actor preparation materials
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
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ActorPreparationMaterials } from '@/types/actor-materials'
import { getArcPreProduction } from './preproduction-firestore'

/**
 * Get actor materials document reference with proper nested path building
 * Firestore requires step-by-step path building, not full path strings
 */
function getActorMaterialsDocRef(userId: string, storyBibleId: string, arcIndex: number) {
  if (!userId || userId.trim() === '') {
    // Guest mode: storyBibles/{storyBibleId}/actorMaterials/arc-{arcIndex}
    const storyBiblesRef = collection(db, 'storyBibles')
    const storyBibleRef = doc(storyBiblesRef, storyBibleId)
    const actorMaterialsRef = collection(storyBibleRef, 'actorMaterials')
    return doc(actorMaterialsRef, `arc-${arcIndex}`)
  } else {
    // User mode: users/{userId}/storyBibles/{storyBibleId}/actorMaterials/arc-{arcIndex}
    const usersRef = collection(db, 'users')
    const userRef = doc(usersRef, userId)
    const storyBiblesRef = collection(userRef, 'storyBibles')
    const storyBibleRef = doc(storyBiblesRef, storyBibleId)
    const actorMaterialsRef = collection(storyBibleRef, 'actorMaterials')
    return doc(actorMaterialsRef, `arc-${arcIndex}`)
  }
}

/**
 * Save actor materials to Firestore
 */
/**
 * Recursively remove undefined values from an object (Firestore doesn't allow undefined)
 */
function sanitizeData(obj: any): any {
  if (obj === null || obj === undefined) {
    return null
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeData(item))
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const cleaned: any = {}
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = sanitizeData(obj[key])
      }
    }
    return cleaned
  }
  
  return obj
}

export async function saveActorMaterials(
  userId: string,
  storyBibleId: string,
  arcIndex: number,
  materials: ActorPreparationMaterials
): Promise<void> {
  try {
    const docRef = getActorMaterialsDocRef(userId, storyBibleId, arcIndex)
    
    // Sanitize data to remove undefined values (Firestore doesn't allow undefined)
    const sanitized = sanitizeData({
      ...materials,
      lastUpdated: Date.now()
    })
    
    await setDoc(docRef, sanitized)
    
    console.log('✅ Actor materials saved:', `arc-${arcIndex}`)
  } catch (error) {
    console.error('❌ Error saving actor materials:', error)
    throw error
  }
}

/**
 * Delete actor materials from Firestore (DEBUG ONLY)
 */
export async function deleteActorMaterials(
  userId: string,
  storyBibleId: string,
  arcIndex: number
): Promise<void> {
  try {
    const docRef = getActorMaterialsDocRef(userId, storyBibleId, arcIndex)
    await deleteDoc(docRef)
    console.log('🗑️ Actor materials deleted (DEBUG):', `arc-${arcIndex}`)
  } catch (error) {
    console.error('❌ Error deleting actor materials:', error)
    throw error
  }
}

/**
 * Get actor materials from Firestore
 */
export async function getActorMaterials(
  userId: string,
  storyBibleId: string,
  arcIndex: number
): Promise<ActorPreparationMaterials | null> {
  try {
    const docRef = getActorMaterialsDocRef(userId, storyBibleId, arcIndex)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as ActorPreparationMaterials
    }
    
    return null
  } catch (error: any) {
    // Distinguish between "document doesn't exist" (OK) vs "permission denied" (not OK)
    // Firebase errors can have code in error.code or error.code()
    const errorCode = error?.code || (typeof error?.code === 'function' ? error.code() : null)
    
    if (errorCode === 'permission-denied' || errorCode === 'PERMISSION_DENIED') {
      console.log('📝 Permission denied (document may not exist yet - this is OK):', errorCode)
      // Return null - we'll handle this gracefully in the page component
      // This is expected when materials haven't been generated yet
      return null
    }
    
    // Log other errors but still return null (materials don't exist)
    console.error('❌ Error getting actor materials:', error)
    return null
  }
}

/**
 * Check if actor materials exist
 */
export async function checkActorMaterialsExist(
  userId: string,
  storyBibleId: string,
  arcIndex: number
): Promise<boolean> {
  try {
    const materials = await getActorMaterials(userId, storyBibleId, arcIndex)
    return materials !== null
  } catch (error) {
    console.error('❌ Error checking actor materials:', error)
    return false
  }
}

/**
 * Check if user has access via casting list
 */
export async function checkCastingAccess(
  userId: string,
  userEmail: string,
  userName: string,
  storyBibleId: string,
  arcIndex: number
): Promise<boolean> {
  try {
    // Get production assistant to access casting list
    const arcPreProd = await getArcPreProduction(userId, storyBibleId, arcIndex)
    
    if (!arcPreProd?.casting?.cast) {
      return false
    }
    
    // Check if user email/name matches any cast member
    const castMembers = arcPreProd.casting.cast
    
    for (const castMember of castMembers) {
      // Check email match
      if (castMember.contact?.email && castMember.contact.email.toLowerCase() === userEmail.toLowerCase()) {
        return true
      }
      
      // Check actor name match
      if (castMember.actorName && castMember.actorName.toLowerCase() === userName.toLowerCase()) {
        return true
      }
      
      // Check character name match (if user is assigned to character)
      if (castMember.characterName && castMember.characterName.toLowerCase() === userName.toLowerCase()) {
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('❌ Error checking casting access:', error)
    return false
  }
}

/**
 * Generate share link for actor materials
 */
export async function generateShareLink(
  userId: string,
  storyBibleId: string,
  arcIndex: number
): Promise<string> {
  try {
    // Generate a unique share link ID
    const shareLinkId = `actor-${storyBibleId}-${arcIndex}-${Date.now()}-${Math.random().toString(36).substring(7)}`
    
      // Update materials with share link
      const materials = await getActorMaterials(userId, storyBibleId, arcIndex)
      if (materials) {
        const docRef = getActorMaterialsDocRef(userId, storyBibleId, arcIndex)
        await updateDoc(docRef, {
          shareLinkId,
          lastUpdated: Date.now()
        })
      }
    
    return shareLinkId
  } catch (error) {
    console.error('❌ Error generating share link:', error)
    throw error
  }
}

/**
 * Get actor materials by share link
 */
export async function getActorMaterialsByShareLink(
  shareLinkId: string
): Promise<ActorPreparationMaterials | null> {
  try {
    // Search across all story bibles for materials with this share link
    // This is a simplified approach - in production, you might want a dedicated share links collection
    const usersRef = collection(db, 'users')
    const usersSnapshot = await getDocs(usersRef)
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id
      const storyBiblesRef = collection(db, `users/${userId}/storyBibles`)
      const storyBiblesSnapshot = await getDocs(storyBiblesRef)
      
      for (const storyBibleDoc of storyBiblesSnapshot.docs) {
        const storyBibleId = storyBibleDoc.id
        const actorMaterialsRef = collection(db, `users/${userId}/storyBibles/${storyBibleId}/actorMaterials`)
        const actorMaterialsSnapshot = await getDocs(actorMaterialsRef)
        
        for (const materialsDoc of actorMaterialsSnapshot.docs) {
          const data = materialsDoc.data() as ActorPreparationMaterials
          if (data.shareLinkId === shareLinkId) {
            return data
          }
        }
      }
    }
    
    // Also check storyBibles collection (for guest mode)
    const storyBiblesRef = collection(db, 'storyBibles')
    const storyBiblesSnapshot = await getDocs(storyBiblesRef)
    
    for (const storyBibleDoc of storyBiblesSnapshot.docs) {
      const storyBibleId = storyBibleDoc.id
      const actorMaterialsRef = collection(db, `storyBibles/${storyBibleId}/actorMaterials`)
      const actorMaterialsSnapshot = await getDocs(actorMaterialsRef)
      
      for (const materialsDoc of actorMaterialsSnapshot.docs) {
        const data = materialsDoc.data() as ActorPreparationMaterials
        if (data.shareLinkId === shareLinkId) {
          return data
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('❌ Error getting actor materials by share link:', error)
    return null
  }
}

/**
 * Check if user owns the story bible
 */
export async function checkStoryBibleOwnership(
  userId: string,
  storyBibleId: string
): Promise<boolean> {
  try {
    console.log('🔍 Checking story bible ownership:', { userId, storyBibleId })
    
    // Try to get the story bible - if we can access it, user owns it
    const { getStoryBible } = await import('@/services/story-bible-service')
    const storyBible = await getStoryBible(storyBibleId, userId)
    
    console.log('📖 Story bible lookup result:', { found: !!storyBible, ownerId: storyBible?.ownerId })
    
    if (!storyBible) {
      // If story bible not found, try checking Firestore directly
      // Story bibles are stored at users/{userId}/storyBibles/{storyBibleId}
      // If we can access it, user owns it
      try {
        const { doc, getDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        const docRef = doc(db, 'users', userId, 'storyBibles', storyBibleId)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          console.log('✅ Story bible found in Firestore - user owns it')
          return true
        }
      } catch (firestoreError) {
        console.error('❌ Error checking Firestore directly:', firestoreError)
      }
      
      return false
    }
    
    // Check if ownerId matches (if set)
    if (storyBible.ownerId) {
      const isOwner = storyBible.ownerId === userId
      console.log('✅ Owner ID check:', { isOwner, storyBibleOwnerId: storyBible.ownerId, userId })
      return isOwner
    }
    
    // If no ownerId but we can access it, assume ownership
    // (since story bibles are stored under users/{userId}/storyBibles)
    console.log('✅ Story bible accessible - assuming ownership')
    return true
  } catch (error) {
    console.error('❌ Error checking story bible ownership:', error)
    return false
  }
}

/**
 * Check if user has access (story bible owner OR casting list OR share link)
 */
export async function checkActorMaterialsAccess(
  userId: string,
  userEmail: string,
  userName: string,
  storyBibleId: string,
  arcIndex: number,
  shareLinkId?: string
): Promise<{ hasAccess: boolean; method: 'casting' | 'share-link' | 'owner' | 'story-bible-owner' | null }> {
  try {
    // FIRST: Check if user owns the story bible (they should always have access)
    const isStoryBibleOwner = await checkStoryBibleOwnership(userId, storyBibleId)
    if (isStoryBibleOwner) {
      return { hasAccess: true, method: 'story-bible-owner' }
    }
    
    // Check if user is the owner of existing materials
    const materials = await getActorMaterials(userId, storyBibleId, arcIndex)
    if (materials && materials.userId === userId) {
      return { hasAccess: true, method: 'owner' }
    }
    
    // Check share link if provided
    if (shareLinkId) {
      const shareMaterials = await getActorMaterialsByShareLink(shareLinkId)
      if (shareMaterials && shareMaterials.storyBibleId === storyBibleId && shareMaterials.arcIndex === arcIndex) {
        return { hasAccess: true, method: 'share-link' }
      }
    }
    
    // Check casting access
    const hasCastingAccess = await checkCastingAccess(userId, userEmail, userName, storyBibleId, arcIndex)
    if (hasCastingAccess) {
      return { hasAccess: true, method: 'casting' }
    }
    
    return { hasAccess: false, method: null }
  } catch (error) {
    console.error('❌ Error checking actor materials access:', error)
    return { hasAccess: false, method: null }
  }
}





