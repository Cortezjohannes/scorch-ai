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
  InvestorMaterialsPackage,
  CharacterProfile,
  CharacterProfileLight,
  CharacterProfileDetailed,
  CharactersSectionLight
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
 * Calculate approximate size of an object in bytes (when serialized to JSON)
 * This is an approximation - Firestore uses MessagePack internally, but JSON size is close enough for validation
 */
function calculateDocumentSize(obj: any): number {
  try {
    // Calculate size of JSON string representation
    const jsonString = JSON.stringify(obj)
    // Use UTF-16 encoding size (JavaScript strings are UTF-16)
    // Each character is 2 bytes, but ASCII characters are typically 1 byte in JSON
    // This is an approximation - actual Firestore size may differ slightly
    return new Blob([jsonString]).size
  } catch (error) {
    // If serialization fails, return a very large number to trigger error
    console.error('Error calculating document size:', error)
    return Number.MAX_SAFE_INTEGER
  }
}

const FIRESTORE_MAX_DOCUMENT_SIZE = 1 * 1024 * 1024 // 1 MB = 1,048,576 bytes

/**
 * Convert full character profile to lightweight version for main document
 */
function toLightCharacter(character: CharacterProfile): CharacterProfileLight {
  return {
    name: character.name,
    role: character.role,
    age: character.age,
    // Truncate background and motivation to keep main doc small
    background: character.background?.substring(0, 200) || '',
    motivation: character.motivation?.substring(0, 200) || '',
    // Keep only top 5 traits
    keyTraits: character.keyTraits?.slice(0, 5) || [],
    imageUrl: character.imageUrl,
    imagePrompt: character.imagePrompt,
    hasDetailedData: true
  }
}

/**
 * Create lightweight package for main document (without detailed character data)
 */
function createLightweightPackage(fullPackage: InvestorMaterialsPackage): InvestorMaterialsPackage {
  const lightPackage = { ...fullPackage }
  
  // Replace full characters with lightweight versions
  if (lightPackage.characters?.mainCharacters) {
    const lightCharacters: CharactersSectionLight = {
      mainCharacters: lightPackage.characters.mainCharacters.map(toLightCharacter),
      relationshipMap: lightPackage.characters.relationshipMap
    }
    lightPackage.characters = lightCharacters as any
  }
  
  return lightPackage
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
  
  // Extract full character data before creating lightweight package
  const fullCharacters = investorPackage.characters?.mainCharacters || []
  
  // Create lightweight package (without detailed character data)
  const lightweightPackage = createLightweightPackage(investorPackage)
  const cleanedPackage = removeUndefined(lightweightPackage)
  
  // Create the shared investor materials document (with lightweight data)
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
  
  // Check document size before saving
  const documentSize = calculateDocumentSize(cleanedData)
  
  console.log(`📦 Investor materials document size: ${(documentSize / 1024).toFixed(2)} KB (${((documentSize / FIRESTORE_MAX_DOCUMENT_SIZE) * 100).toFixed(1)}% of limit)`)
  
  if (documentSize > FIRESTORE_MAX_DOCUMENT_SIZE) {
    const sizeMB = (documentSize / (1024 * 1024)).toFixed(2)
    const maxMB = (FIRESTORE_MAX_DOCUMENT_SIZE / (1024 * 1024)).toFixed(2)
    
    // Provide helpful error message with size breakdown
    const frameCount = investorPackage.visuals?.frames?.length || 0
    const characterCount = investorPackage.characters?.mainCharacters?.length || 0
    
    throw new Error(
      `Document size (${sizeMB} MB) exceeds Firestore's maximum allowed size of ${maxMB} MB. ` +
      `Package contains ${frameCount} storyboard frames and ${characterCount} characters. ` +
      `Consider reducing the number of frames or characters. ` +
      `Current size: ${documentSize.toLocaleString()} bytes, Maximum: ${FIRESTORE_MAX_DOCUMENT_SIZE.toLocaleString()} bytes.`
    )
  }
  
  // Log size for monitoring (only if close to limit)
  if (documentSize > FIRESTORE_MAX_DOCUMENT_SIZE * 0.8) {
    console.warn(`⚠️ Investor materials document size is ${((documentSize / FIRESTORE_MAX_DOCUMENT_SIZE) * 100).toFixed(1)}% of limit`)
  }
  
  // Save main document with lightweight data
  const mainDocRef = doc(db, 'sharedInvestorMaterials', linkId)
  await setDoc(mainDocRef, cleanedData)
  
  // Save detailed character data in subcollection
  if (fullCharacters.length > 0) {
    const charactersCollectionRef = collection(mainDocRef, 'characters')
    
    // Save each character as a separate document
    const characterSavePromises = fullCharacters.map(character => {
      const characterDocRef = doc(charactersCollectionRef, character.name)
      const cleanedCharacter = removeUndefined(character)
      return setDoc(characterDocRef, cleanedCharacter)
    })
    
    await Promise.all(characterSavePromises)
    console.log(`✅ Saved ${fullCharacters.length} detailed character profiles to subcollection`)
  }

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
 * 
 * NOTE: This returns lightweight character data in the main package.
 * To fetch detailed character data (actor materials, Story Bible 3D data),
 * use getCharacterDetails() or getAllCharacterDetails() after loading the main package.
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
 * Fetch detailed character data from subcollection
 */
export async function getCharacterDetails(
  linkId: string,
  characterName: string
): Promise<CharacterProfileDetailed | null> {
  try {
    const mainDocRef = doc(db, 'sharedInvestorMaterials', linkId)
    const characterDocRef = doc(collection(mainDocRef, 'characters'), characterName)
    const characterSnap = await getDoc(characterDocRef)
    
    if (!characterSnap.exists()) {
      console.warn(`Character "${characterName}" not found in subcollection for link ${linkId}`)
      return null
    }
    
    return characterSnap.data() as CharacterProfileDetailed
  } catch (error) {
    console.error(`Error fetching character details for "${characterName}":`, error)
    return null
  }
}

/**
 * Fetch all detailed character data for a link
 */
export async function getAllCharacterDetails(
  linkId: string
): Promise<CharacterProfileDetailed[]> {
  try {
    const mainDocRef = doc(db, 'sharedInvestorMaterials', linkId)
    const charactersCollectionRef = collection(mainDocRef, 'characters')
    const charactersSnap = await getDocs(charactersCollectionRef)
    
    return charactersSnap.docs.map(doc => doc.data() as CharacterProfileDetailed)
  } catch (error) {
    console.error('Error fetching all character details:', error)
    return []
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

  // Extract full character data before creating lightweight package
  const fullCharacters = investorPackage.characters?.mainCharacters || []
  
  // Create lightweight package (without detailed character data)
  const lightweightPackage = createLightweightPackage(investorPackage)
  const cleanedPackage = removeUndefined(lightweightPackage)

  // Update the shared materials document with lightweight data
  const sharedMaterialsRef = doc(db, 'sharedInvestorMaterials', linkId)
  const currentVersion = linkSnap.data().version || 1
  const cleanedData = removeUndefined({
    investorPackage: cleanedPackage,
    lastModified: serverTimestamp(),
    version: currentVersion + 1
  })
  
  // Check document size before updating
  const documentSize = calculateDocumentSize(cleanedData)
  
  console.log(`📦 Updating investor materials document size: ${(documentSize / 1024).toFixed(2)} KB (${((documentSize / FIRESTORE_MAX_DOCUMENT_SIZE) * 100).toFixed(1)}% of limit)`)
  
  if (documentSize > FIRESTORE_MAX_DOCUMENT_SIZE) {
    const sizeMB = (documentSize / (1024 * 1024)).toFixed(2)
    const maxMB = (FIRESTORE_MAX_DOCUMENT_SIZE / (1024 * 1024)).toFixed(2)
    
    const frameCount = investorPackage.visuals?.frames?.length || 0
    const characterCount = investorPackage.characters?.mainCharacters?.length || 0
    
    throw new Error(
      `Document size (${sizeMB} MB) exceeds Firestore's maximum allowed size of ${maxMB} MB. ` +
      `Package contains ${frameCount} storyboard frames and ${characterCount} characters. ` +
      `Consider reducing the number of frames or characters. ` +
      `Current size: ${documentSize.toLocaleString()} bytes, Maximum: ${FIRESTORE_MAX_DOCUMENT_SIZE.toLocaleString()} bytes.`
    )
  }
  
  // Log size for monitoring (only if close to limit)
  if (documentSize > FIRESTORE_MAX_DOCUMENT_SIZE * 0.8) {
    console.warn(`⚠️ Investor materials document size is ${((documentSize / FIRESTORE_MAX_DOCUMENT_SIZE) * 100).toFixed(1)}% of limit`)
  }

  await updateDoc(sharedMaterialsRef, cleanedData)
  
  // Update detailed character data in subcollection
  if (fullCharacters.length > 0) {
    const charactersCollectionRef = collection(sharedMaterialsRef, 'characters')
    
    // Delete existing character documents first (to handle removed characters)
    const existingCharactersSnap = await getDocs(charactersCollectionRef)
    const deletePromises = existingCharactersSnap.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    
    // Save updated character data
    const characterSavePromises = fullCharacters.map(character => {
      const characterDocRef = doc(charactersCollectionRef, character.name)
      const cleanedCharacter = removeUndefined(character)
      return setDoc(characterDocRef, cleanedCharacter)
    })
    
    await Promise.all(characterSavePromises)
    console.log(`✅ Updated ${fullCharacters.length} detailed character profiles in subcollection`)
  }

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

