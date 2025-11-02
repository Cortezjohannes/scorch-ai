import { db } from '@/lib/firebase'
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
  increment,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { nanoid } from 'nanoid'

export interface ShareLink {
  id: string
  shareId: string
  storyBibleId: string
  ownerId?: string
  ownerName?: string
  isActive: boolean
  createdAt: string
  viewCount: number
  expiresAt?: string
}

export interface SharedStoryBible {
  id: string
  shareId: string
  storyBible: any
  ownerId?: string
  ownerName?: string
  createdAt: string
  lastModified: string
}

/**
 * Create a shareable link for a story bible
 */
export async function createShareLink(
  storyBible: any,
  ownerId?: string,
  ownerName?: string
): Promise<{ shareId: string; shareUrl: string }> {
  const shareId = nanoid(8) // Generate 8-character ID
  
  // Create the shared story bible document
  const sharedBibleData: any = {
    shareId,
    storyBible,
    createdAt: serverTimestamp(),
    lastModified: serverTimestamp()
  }

  if (ownerId) {
    sharedBibleData.ownerId = ownerId
    sharedBibleData.ownerName = ownerName || 'Anonymous'
  }

  await setDoc(doc(db, 'sharedStoryBibles', shareId), sharedBibleData)

  // If authenticated user, create metadata in shareLinks
  if (ownerId) {
    const shareLinkData: any = {
      shareId,
      storyBibleId: storyBible.id || shareId,
      ownerId,
      ownerName: ownerName || 'Anonymous',
      isActive: true,
      createdAt: serverTimestamp(),
      viewCount: 0
    }

    await setDoc(doc(db, 'shareLinks', shareId), shareLinkData)
  }

  const shareUrl = `${window.location.origin}/story-bible?shared=${shareId}`
  
  return { shareId, shareUrl }
}

/**
 * Get a shared story bible by its share ID
 */
export async function getSharedStoryBible(shareId: string): Promise<SharedStoryBible | null> {
  try {
    const docRef = doc(db, 'sharedStoryBibles', shareId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    
    // Increment view count if owner metadata exists
    try {
      const linkRef = doc(db, 'shareLinks', shareId)
      const linkSnap = await getDoc(linkRef)
      if (linkSnap.exists()) {
        await updateDoc(linkRef, {
          viewCount: increment(1)
        })
      }
    } catch (error) {
      console.error('Error updating view count:', error)
      // Don't fail the whole operation if view count update fails
    }

    return {
      id: docSnap.id,
      shareId: data.shareId,
      storyBible: data.storyBible,
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      lastModified: data.lastModified?.toDate?.()?.toISOString() || new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error fetching shared story bible:', error)
    return null
  }
}

/**
 * Update a shared story bible (for collaborative editing)
 */
export async function updateSharedStoryBible(
  shareId: string,
  updatedStoryBible: any
): Promise<void> {
  const docRef = doc(db, 'sharedStoryBibles', shareId)
  await updateDoc(docRef, {
    storyBible: updatedStoryBible,
    lastModified: serverTimestamp()
  })
}

/**
 * Revoke a share link (authenticated owners only)
 */
export async function revokeShareLink(shareId: string, ownerId: string): Promise<void> {
  // Verify ownership
  const linkRef = doc(db, 'shareLinks', shareId)
  const linkSnap = await getDoc(linkRef)

  if (!linkSnap.exists()) {
    throw new Error('Share link not found')
  }

  if (linkSnap.data().ownerId !== ownerId) {
    throw new Error('Unauthorized: You do not own this share link')
  }

  // Mark as inactive instead of deleting (keeps analytics)
  await updateDoc(linkRef, {
    isActive: false
  })

  // Optionally delete the shared bible itself
  const sharedBibleRef = doc(db, 'sharedStoryBibles', shareId)
  await deleteDoc(sharedBibleRef)
}

/**
 * Get all share links for a user
 */
export async function getUserShareLinks(ownerId: string): Promise<ShareLink[]> {
  const q = query(
    collection(db, 'shareLinks'),
    where('ownerId', '==', ownerId)
  )

  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      shareId: data.shareId,
      storyBibleId: data.storyBibleId,
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      isActive: data.isActive,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      viewCount: data.viewCount || 0,
      expiresAt: data.expiresAt?.toDate?.()?.toISOString(),
    }
  })
}

/**
 * Check if a share link is valid and active
 */
export async function isShareLinkValid(shareId: string): Promise<boolean> {
  try {
    const linkRef = doc(db, 'shareLinks', shareId)
    const linkSnap = await getDoc(linkRef)

    if (!linkSnap.exists()) {
      // If no metadata, check if shared bible exists (guest share)
      const bibleRef = doc(db, 'sharedStoryBibles', shareId)
      const bibleSnap = await getDoc(bibleRef)
      return bibleSnap.exists()
    }

    const data = linkSnap.data()
    
    // Check if active
    if (!data.isActive) {
      return false
    }

    // Check if expired
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking share link validity:', error)
    return false
  }
}
