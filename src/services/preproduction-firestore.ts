/**
 * Pre-Production Firestore Service
 * Handles data persistence and real-time synchronization
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
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { PreProductionData, Comment } from '@/types/preproduction'

// Helper functions to get correct nested paths
function getPreProductionPath(userId: string, storyBibleId: string): string {
  return `users/${userId}/storyBibles/${storyBibleId}/preproduction`
}

function getPreProductionDocPath(userId: string, storyBibleId: string, docId: string): string {
  return `users/${userId}/storyBibles/${storyBibleId}/preproduction/${docId}`
}

// ============================================================================
// CREATE & UPDATE
// ============================================================================

/**
 * Create a new pre-production document
 */
export async function createPreProduction(
  userId: string,
  storyBibleId: string,
  episodeNumber: number,
  episodeTitle: string
): Promise<string> {
  try {
    const collectionPath = getPreProductionPath(userId, storyBibleId)
    const docRef = doc(collection(db, collectionPath))
    const now = Date.now()
    
    const preProductionData: PreProductionData = {
      id: docRef.id,
      userId,
      storyBibleId,
      episodeNumber,
      episodeTitle,
      createdAt: now,
      lastUpdated: now,
      collaborators: [{
        userId,
        name: 'Owner', // Will be updated with actual user info
        email: '',
        role: 'owner'
      }],
      generationStatus: 'not-started'
    }
    
    await setDoc(docRef, preProductionData)
    
    console.log('✅ Pre-production created:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Error creating pre-production:', error)
    throw error
  }
}

/**
 * Update pre-production data (partial update)
 * Note: userId and storyBibleId are extracted from updates object for path resolution
 */
export async function updatePreProduction(
  docId: string,
  updates: Partial<PreProductionData>,
  userId: string,
  storyBibleId?: string
): Promise<void> {
  try {
    // Use storyBibleId from parameter or from updates
    const sbId = storyBibleId || (updates as any).storyBibleId
    if (!sbId) {
      throw new Error('storyBibleId is required for update')
    }
    
    const docPath = getPreProductionDocPath(userId, sbId, docId)
    const docRef = doc(db, docPath)
    
    await updateDoc(docRef, {
      ...updates,
      lastUpdated: Date.now()
    })
    
    console.log('✅ Pre-production updated:', docId)
  } catch (error) {
    console.error('❌ Error updating pre-production:', error)
    throw error
  }
}

/**
 * Update a specific tab's data
 */
export async function updatePreProductionTab(
  docId: string,
  tabName: string,
  tabData: any,
  userId: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, docId)
    
    await updateDoc(docRef, {
      [tabName]: {
        ...tabData,
        lastUpdated: Date.now(),
        updatedBy: userId
      },
      lastUpdated: Date.now()
    })
    
    console.log(`✅ Tab "${tabName}" updated:`, docId)
  } catch (error) {
    console.error(`❌ Error updating tab "${tabName}":`, error)
    throw error
  }
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get pre-production by ID
 */
export async function getPreProduction(docId: string): Promise<PreProductionData | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as PreProductionData
    }
    
    return null
  } catch (error) {
    console.error('❌ Error getting pre-production:', error)
    throw error
  }
}

/**
 * Get pre-production for a specific episode
 */
export async function getPreProductionByEpisode(
  userId: string,
  storyBibleId: string,
  episodeNumber: number
): Promise<PreProductionData | null> {
  try {
    const collectionPath = getPreProductionPath(userId, storyBibleId)
    const q = query(
      collection(db, collectionPath),
      where('episodeNumber', '==', episodeNumber)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as PreProductionData
    }
    
    return null
  } catch (error) {
    console.error('❌ Error getting pre-production by episode:', error)
    throw error
  }
}

/**
 * Get all pre-production documents for a story bible
 */
export async function getAllPreProductionForStoryBible(
  userId: string,
  storyBibleId: string
): Promise<PreProductionData[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('storyBibleId', '==', storyBibleId)
    )
    
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => doc.data() as PreProductionData)
  } catch (error) {
    console.error('❌ Error getting all pre-production:', error)
    throw error
  }
}

// ============================================================================
// REAL-TIME LISTENERS
// ============================================================================

/**
 * Subscribe to real-time updates for a pre-production document
 */
export function subscribeToPreProduction(
  userId: string,
  storyBibleId: string,
  docId: string,
  callback: (data: PreProductionData | null) => void
): () => void {
  const docPath = getPreProductionDocPath(userId, storyBibleId, docId)
  const docRef = doc(db, docPath)
  
  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as PreProductionData)
      } else {
        callback(null)
      }
    },
    (error) => {
      console.error('❌ Error in real-time listener:', error)
      callback(null)
    }
  )
  
  return unsubscribe
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete a pre-production document
 */
export async function deletePreProduction(docId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, docId)
    await deleteDoc(docRef)
    
    console.log('✅ Pre-production deleted:', docId)
  } catch (error) {
    console.error('❌ Error deleting pre-production:', error)
    throw error
  }
}

// ============================================================================
// COLLABORATION
// ============================================================================

/**
 * Add a collaborator to a pre-production document
 */
export async function addCollaborator(
  docId: string,
  collaborator: {
    userId: string
    name: string
    email: string
    role: 'crew' | 'viewer'
  }
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data() as PreProductionData
      const existingCollaborators = data.collaborators || []
      
      // Check if collaborator already exists
      const existingIndex = existingCollaborators.findIndex(
        c => c.userId === collaborator.userId
      )
      
      if (existingIndex >= 0) {
        // Update existing collaborator
        existingCollaborators[existingIndex] = {
          ...existingCollaborators[existingIndex],
          ...collaborator
        }
      } else {
        // Add new collaborator
        existingCollaborators.push(collaborator)
      }
      
      await updateDoc(docRef, {
        collaborators: existingCollaborators,
        lastUpdated: Date.now()
      })
      
      console.log('✅ Collaborator added:', collaborator.email)
    }
  } catch (error) {
    console.error('❌ Error adding collaborator:', error)
    throw error
  }
}

/**
 * Remove a collaborator from a pre-production document
 */
export async function removeCollaborator(
  docId: string,
  userId: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data() as PreProductionData
      const collaborators = (data.collaborators || []).filter(
        c => c.userId !== userId
      )
      
      await updateDoc(docRef, {
        collaborators,
        lastUpdated: Date.now()
      })
      
      console.log('✅ Collaborator removed:', userId)
    }
  } catch (error) {
    console.error('❌ Error removing collaborator:', error)
    throw error
  }
}

// ============================================================================
// COMMENTS
// ============================================================================

/**
 * Add a comment to a specific item in a tab
 * 
 * @param docId Pre-production document ID
 * @param tabName Tab name (e.g., 'scriptBreakdown')
 * @param itemPath Path to the item (e.g., 'scenes.0' for first scene)
 * @param comment Comment object
 */
export async function addComment(
  docId: string,
  tabName: string,
  itemPath: string,
  comment: Comment
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data() as PreProductionData
      const tabData = (data as any)[tabName]
      
      if (tabData) {
        // Navigate to the item using the path
        const pathParts = itemPath.split('.')
        let target = tabData
        
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i]
          if (i === pathParts.length - 1) {
            // Last part - add comment
            if (!target[part].comments) {
              target[part].comments = []
            }
            target[part].comments.push(comment)
          } else {
            target = target[part]
          }
        }
        
        await updateDoc(docRef, {
          [tabName]: tabData,
          lastUpdated: Date.now()
        })
        
        console.log('✅ Comment added to', itemPath)
      }
    }
  } catch (error) {
    console.error('❌ Error adding comment:', error)
    throw error
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch update multiple items in a tab
 */
export async function batchUpdateTabItems(
  docId: string,
  tabName: string,
  updates: Array<{
    itemPath: string
    data: any
  }>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data() as PreProductionData
      const tabData = (data as any)[tabName]
      
      if (tabData) {
        // Apply all updates
        for (const update of updates) {
          const pathParts = update.itemPath.split('.')
          let target = tabData
          
          for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i]
            if (i === pathParts.length - 1) {
              // Last part - update data
              target[part] = {
                ...target[part],
                ...update.data
              }
            } else {
              target = target[part]
            }
          }
        }
        
        await updateDoc(docRef, {
          [tabName]: tabData,
          lastUpdated: Date.now()
        })
        
        console.log(`✅ Batch update completed for ${updates.length} items`)
      }
    }
  } catch (error) {
    console.error('❌ Error in batch update:', error)
    throw error
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user has edit access
 */
export async function hasEditAccess(
  docId: string,
  userId: string
): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION_NAME, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data() as PreProductionData
      
      // Owner always has access
      if (data.userId === userId) {
        return true
      }
      
      // Check collaborators
      const collaborator = data.collaborators?.find(c => c.userId === userId)
      return collaborator?.role === 'owner' || collaborator?.role === 'crew'
    }
    
    return false
  } catch (error) {
    console.error('❌ Error checking edit access:', error)
    return false
  }
}

/**
 * Update generation status
 */
export async function updateGenerationStatus(
  docId: string,
  status: 'not-started' | 'generating' | 'completed' | 'error',
  progress?: number
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, docId)
    
    const updates: any = {
      generationStatus: status,
      lastUpdated: Date.now()
    }
    
    if (progress !== undefined) {
      updates.generationProgress = progress
    }
    
    await updateDoc(docRef, updates)
    
    console.log(`✅ Generation status updated: ${status}`)
  } catch (error) {
    console.error('❌ Error updating generation status:', error)
    throw error
  }
}

