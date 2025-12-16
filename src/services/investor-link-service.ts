/**
 * Investor Link Service
 * Manages shareable links for investor materials packages
 */

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
import type { 
  InvestorLink, 
  SharedInvestorMaterials, 
  InvestorMaterialsPackage 
} from '@/types/investor-materials'

/**
 * Remove undefined values from an object (Firestore doesn't support undefined)
 */
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item))
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const cleaned: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
        cleaned[key] = removeUndefined(obj[key])
      }
    }
    return cleaned
  }
  
  return obj
}

/**
 * Create a shareable link for investor materials
 */
export async function createInvestorLink(
  investorPackage: InvestorMaterialsPackage,
  ownerId?: string,
  ownerName?: string,
  customization?: { whyYou?: string }
): Promise<{ linkId: string; shareUrl: string }> {
  const linkId = nanoid(8) // Generate 8-character ID
  
  // Clean the package to remove undefined values
  const cleanedPackage = removeUndefined(investorPackage)
  
  // Create the shared investor materials document
  const sharedMaterialsData: any = {
    linkId,
    investorPackage: cleanedPackage,
    createdAt: serverTimestamp(),
    lastModified: serverTimestamp(),
    version: 1
  }

  if (ownerId) {
    sharedMaterialsData.ownerId = ownerId
    sharedMaterialsData.ownerName = ownerName || 'Anonymous'
  }

  // Remove any undefined values from the document data
  const cleanedData = removeUndefined(sharedMaterialsData)
  
  await setDoc(doc(db, 'sharedInvestorMaterials', linkId), cleanedData)

  // If authenticated user, create metadata in investorLinks
  if (ownerId) {
    const linkData: any = {
      linkId,
      storyBibleId: investorPackage.storyBibleId,
      arcIndex: investorPackage.arcIndex,
      ownerId,
      ownerName: ownerName || 'Anonymous',
      isActive: true,
      createdAt: serverTimestamp(),
      viewCount: 0
    }

    if (customization) {
      linkData.customization = customization
    }

    await setDoc(doc(db, 'investorLinks', linkId), linkData)
  }

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/investor/${linkId}`
  
  return { linkId, shareUrl }
}

/**
 * Get shared investor materials by link ID
 */
export async function getSharedInvestorMaterials(linkId: string): Promise<SharedInvestorMaterials | null> {
  try {
    const docRef = doc(db, 'sharedInvestorMaterials', linkId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    
    // Increment view count if owner metadata exists
    try {
      const linkRef = doc(db, 'investorLinks', linkId)
      const linkSnap = await getDoc(linkRef)
      if (linkSnap.exists()) {
        await updateDoc(linkRef, {
          viewCount: increment(1)
        })
      }
    } catch (error: any) {
      // Suppress permission errors for public shares; do not log noisy errors
      if (error?.code !== 'permission-denied') {
        console.warn('Error updating view count:', error)
      }
    }

    return {
      id: docSnap.id,
      linkId: data.linkId,
      investorPackage: data.investorPackage,
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      lastModified: data.lastModified?.toDate?.()?.toISOString() || new Date().toISOString(),
      version: data.version || 1
    }
  } catch (error) {
    console.error('Error fetching shared investor materials:', error)
    return null
  }
}

/**
 * Update an existing investor link with a new package (regenerate)
 */
export async function updateInvestorLink(
  linkId: string,
  investorPackage: InvestorMaterialsPackage,
  ownerId: string
): Promise<void> {
  // Verify ownership
  const linkRef = doc(db, 'investorLinks', linkId)
  const linkSnap = await getDoc(linkRef)

  if (!linkSnap.exists()) {
    throw new Error('Investor link not found')
  }

  if (linkSnap.data().ownerId !== ownerId) {
    throw new Error('Unauthorized: You do not own this investor link')
  }

  // Clean the package to remove undefined values
  const cleanedPackage = removeUndefined(investorPackage)

  // Update the shared materials document
  const sharedMaterialsRef = doc(db, 'sharedInvestorMaterials', linkId)
  const currentVersion = linkSnap.data().version || 1
  const cleanedData = removeUndefined({
    investorPackage: cleanedPackage,
    lastModified: serverTimestamp(),
    version: currentVersion + 1
  })

  await updateDoc(sharedMaterialsRef, cleanedData)

  // Update the link metadata
  await updateDoc(linkRef, {
    lastModified: serverTimestamp()
  })
}

/**
 * Revoke an investor link (authenticated owners only)
 */
export async function revokeInvestorLink(linkId: string, ownerId: string): Promise<void> {
  // Verify ownership
  const linkRef = doc(db, 'investorLinks', linkId)
  const linkSnap = await getDoc(linkRef)

  if (!linkSnap.exists()) {
    throw new Error('Investor link not found')
  }

  if (linkSnap.data().ownerId !== ownerId) {
    throw new Error('Unauthorized: You do not own this investor link')
  }

  // Mark as inactive instead of deleting (keeps analytics)
  await updateDoc(linkRef, {
    isActive: false
  })

  // Optionally delete the shared materials itself
  const sharedMaterialsRef = doc(db, 'sharedInvestorMaterials', linkId)
  await deleteDoc(sharedMaterialsRef)
}

/**
 * Get all investor links for a user
 */
export async function getUserInvestorLinks(ownerId: string, storyBibleId?: string): Promise<InvestorLink[]> {
  const constraints = [where('ownerId', '==', ownerId)]
  if (storyBibleId) {
    constraints.push(where('storyBibleId', '==', storyBibleId))
  }
  const q = query(collection(db, 'investorLinks'), ...constraints)

  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      linkId: data.linkId,
      storyBibleId: data.storyBibleId,
      arcIndex: data.arcIndex,
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      isActive: data.isActive,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      viewCount: data.viewCount || 0,
      expiresAt: data.expiresAt?.toDate?.()?.toISOString(),
      customization: data.customization
    }
  })
}

/**
 * Check if an investor link is valid and active
 */
export async function isInvestorLinkValid(linkId: string): Promise<boolean> {
  try {
    const linkRef = doc(db, 'investorLinks', linkId)
    const linkSnap = await getDoc(linkRef)

    if (!linkSnap.exists()) {
      // If no metadata, check if shared materials exists (guest share)
      const materialsRef = doc(db, 'sharedInvestorMaterials', linkId)
      const materialsSnap = await getDoc(materialsRef)
      return materialsSnap.exists()
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
    console.error('Error checking investor link validity:', error)
    return false
  }
}

/**
 * Track a link view (for analytics)
 */
export async function trackLinkView(linkId: string): Promise<void> {
  try {
    const linkRef = doc(db, 'investorLinks', linkId)
    const linkSnap = await getDoc(linkRef)
    
    if (linkSnap.exists()) {
      await updateDoc(linkRef, {
        viewCount: increment(1),
        lastViewed: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error tracking link view:', error)
    // Don't throw - analytics failures shouldn't break the app
  }
}

/**
 * Update customization for an investor link
 */
export async function updateInvestorLinkCustomization(
  linkId: string,
  ownerId: string,
  customization: { whyYou?: string }
): Promise<void> {
  // Verify ownership
  const linkRef = doc(db, 'investorLinks', linkId)
  const linkSnap = await getDoc(linkRef)

  if (!linkSnap.exists()) {
    throw new Error('Investor link not found')
  }

  if (linkSnap.data().ownerId !== ownerId) {
    throw new Error('Unauthorized: You do not own this investor link')
  }

  await updateDoc(linkRef, {
    customization,
    lastModified: serverTimestamp()
  })

  // Also update the shared materials package
  const materialsRef = doc(db, 'sharedInvestorMaterials', linkId)
  const materialsSnap = await getDoc(materialsRef)
  
  if (materialsSnap.exists()) {
    const materialsData = materialsSnap.data()
    if (materialsData.investorPackage) {
      materialsData.investorPackage.callToAction.whyYou = customization.whyYou
      await updateDoc(materialsRef, {
        investorPackage: materialsData.investorPackage,
        lastModified: serverTimestamp(),
        version: increment(1)
      })
    }
  }
}

