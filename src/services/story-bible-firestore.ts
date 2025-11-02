/**
 * Story Bible Firestore Service
 * 
 * Centralized Firestore operations for all Story Bible enrichment features:
 * - Version Control
 * - Episode Reflections
 * - Templates
 * - Lock System
 * - Relationships, Timeline, Character Visuals
 */

import { db } from '@/lib/firebase'
import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  deleteDoc,
  Timestamp,
  writeBatch,
  startAfter as firestoreStartAfter
} from 'firebase/firestore'
import type { 
  Version, 
  VersionChange 
} from './version-control'
import type { 
  EpisodeReflectionData 
} from './episode-reflection-service'
import type { 
  Template 
} from '@/types/templates'
import type { StoryBible } from './story-bible-service'

// ============================================================================
// STORY BIBLE UPDATES
// ============================================================================

/**
 * Update a single field in a story bible
 */
export async function updateStoryBibleField(
  userId: string,
  storyBibleId: string,
  field: string,
  value: any
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'storyBibles', storyBibleId)
  await updateDoc(docRef, {
    [field]: value,
    lastModified: Timestamp.now(),
    version: Timestamp.now() // Use timestamp as version
  })
  
  console.log(`✅ Updated story bible field: ${field}`)
}

/**
 * Update multiple fields in a story bible
 */
export async function updateStoryBibleFields(
  userId: string,
  storyBibleId: string,
  updates: Partial<StoryBible>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'storyBibles', storyBibleId)
  
  // Convert Date objects to Timestamps
  const firestoreUpdates: any = { ...updates }
  if (firestoreUpdates.lastModified) {
    firestoreUpdates.lastModified = Timestamp.now()
  } else {
    firestoreUpdates.lastModified = Timestamp.now()
  }
  
  await updateDoc(docRef, firestoreUpdates)
  
  console.log(`✅ Updated story bible with ${Object.keys(updates).length} field(s)`)
}

// ============================================================================
// VERSION CONTROL
// ============================================================================

/**
 * Save a version to Firestore
 */
export async function saveVersion(
  userId: string,
  storyBibleId: string,
  version: Version
): Promise<string> {
  const versionsRef = collection(db, 'users', userId, 'storyBibles', storyBibleId, 'versions')
  
  // Convert to Firestore format
  const firestoreVersion = {
    ...version,
    timestamp: Timestamp.fromDate(version.timestamp),
    changes: version.changes.map(change => ({
      ...change,
      timestamp: Timestamp.fromDate(change.timestamp)
    })),
    size: JSON.stringify(version.storyBibleSnapshot).length
  }
  
  const docRef = await addDoc(versionsRef, firestoreVersion)
  
  console.log(`✅ Version saved: ${version.id}`)
  return docRef.id
}

/**
 * Get version history for a story bible
 */
export async function getVersionHistory(
  userId: string,
  storyBibleId: string,
  limitCount: number = 50
): Promise<Version[]> {
  const versionsRef = collection(db, 'users', userId, 'storyBibles', storyBibleId, 'versions')
  const q = query(
    versionsRef,
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  )
  
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      ...data,
      id: data.id || doc.id,
      timestamp: data.timestamp?.toDate() || new Date(),
      changes: (data.changes || []).map((change: any) => ({
        ...change,
        timestamp: change.timestamp?.toDate() || new Date()
      }))
    } as Version
  })
}

/**
 * Get version history with pagination
 */
export async function getVersionHistoryPaginated(
  userId: string,
  storyBibleId: string,
  pageSize: number = 20,
  lastDoc?: any
): Promise<{ versions: Version[]; lastDoc: any }> {
  const versionsRef = collection(db, 'users', userId, 'storyBibles', storyBibleId, 'versions')
  
  let q = query(
    versionsRef,
    orderBy('timestamp', 'desc'),
    limit(pageSize)
  )
  
  if (lastDoc) {
    q = query(q, firestoreStartAfter(lastDoc))
  }
  
  const snapshot = await getDocs(q)
  const versions = snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      ...data,
      id: data.id || doc.id,
      timestamp: data.timestamp?.toDate() || new Date(),
      changes: (data.changes || []).map((change: any) => ({
        ...change,
        timestamp: change.timestamp?.toDate() || new Date()
      }))
    } as Version
  })
  
  return {
    versions,
    lastDoc: snapshot.docs[snapshot.docs.length - 1]
  }
}

/**
 * Get a specific version
 */
export async function getVersion(
  userId: string,
  storyBibleId: string,
  versionId: string
): Promise<Version | null> {
  const versions = await getVersionHistory(userId, storyBibleId, 1000)
  return versions.find(v => v.id === versionId) || null
}

/**
 * Delete old versions (keep most recent N versions)
 */
export async function deleteOldVersions(
  userId: string,
  storyBibleId: string,
  keepCount: number = 50
): Promise<number> {
  const versions = await getVersionHistory(userId, storyBibleId, 1000)
  
  if (versions.length <= keepCount) {
    return 0
  }
  
  // Sort by timestamp and keep the newest ones
  const sorted = versions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  const toDelete = sorted.slice(keepCount)
  
  const batch = writeBatch(db)
  let deleteCount = 0
  
  for (const version of toDelete) {
    const versionRef = doc(db, 'users', userId, 'storyBibles', storyBibleId, 'versions', version.id)
    batch.delete(versionRef)
    deleteCount++
    
    // Firestore batch limit is 500
    if (deleteCount >= 500) break
  }
  
  await batch.commit()
  
  console.log(`🗑️ Deleted ${deleteCount} old version(s)`)
  return deleteCount
}

// ============================================================================
// EPISODE REFLECTIONS
// ============================================================================

/**
 * Save episode reflection data
 */
export async function saveEpisodeReflection(
  userId: string,
  storyBibleId: string,
  episodeId: string,
  reflectionData: EpisodeReflectionData
): Promise<void> {
  const reflectionRef = doc(db, 'users', userId, 'storyBibles', storyBibleId, 'reflections', episodeId)
  
  await setDoc(reflectionRef, {
    episodeId,
    episodeNumber: reflectionData.episodeNumber,
    episodeTitle: reflectionData.episodeTitle,
    analyzedAt: Timestamp.now(),
    applied: false,
    appliedAt: null,
    reflectionData,
    aiConfidence: reflectionData.confidence || 0.8,
    needsReview: reflectionData.needsReview || false
  })
  
  console.log(`✅ Episode reflection saved for episode ${episodeId}`)
}

/**
 * Get episode reflection
 */
export async function getEpisodeReflection(
  userId: string,
  storyBibleId: string,
  episodeId: string
): Promise<EpisodeReflectionData | null> {
  const reflectionRef = doc(db, 'users', userId, 'storyBibles', storyBibleId, 'reflections', episodeId)
  const snapshot = await getDoc(reflectionRef)
  
  if (!snapshot.exists()) {
    return null
  }
  
  const data = snapshot.data()
  return data.reflectionData as EpisodeReflectionData
}

/**
 * Mark reflection as applied
 */
export async function markReflectionApplied(
  userId: string,
  storyBibleId: string,
  episodeId: string
): Promise<void> {
  const reflectionRef = doc(db, 'users', userId, 'storyBibles', storyBibleId, 'reflections', episodeId)
  
  await updateDoc(reflectionRef, {
    applied: true,
    appliedAt: Timestamp.now()
  })
  
  console.log(`✅ Reflection marked as applied for episode ${episodeId}`)
}

/**
 * Get all reflections for a story bible
 */
export async function getAllReflections(
  userId: string,
  storyBibleId: string
): Promise<any[]> {
  const reflectionsRef = collection(db, 'users', userId, 'storyBibles', storyBibleId, 'reflections')
  const q = query(reflectionsRef, orderBy('episodeNumber', 'asc'))
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    analyzedAt: doc.data().analyzedAt?.toDate() || new Date(),
    appliedAt: doc.data().appliedAt?.toDate() || null
  }))
}

// ============================================================================
// TEMPLATES
// ============================================================================

/**
 * Save a template
 */
export async function saveTemplate(
  userId: string,
  template: Template
): Promise<string> {
  const templatesRef = collection(db, 'users', userId, 'templates')
  
  const firestoreTemplate = {
    ...template,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
  
  if (template.id) {
    // Update existing
    const templateRef = doc(db, 'users', userId, 'templates', template.id)
    await setDoc(templateRef, firestoreTemplate)
    console.log(`✅ Template updated: ${template.id}`)
    return template.id
  } else {
    // Create new
    const docRef = await addDoc(templatesRef, firestoreTemplate)
    console.log(`✅ Template created: ${docRef.id}`)
    return docRef.id
  }
}

/**
 * Get all templates for a user
 */
export async function getTemplates(
  userId: string,
  type?: 'character' | 'world' | 'arc' | 'full_story_bible'
): Promise<Template[]> {
  const templatesRef = collection(db, 'users', userId, 'templates')
  
  let q = query(templatesRef, orderBy('updatedAt', 'desc'))
  
  if (type) {
    q = query(templatesRef, where('type', '==', type), orderBy('updatedAt', 'desc'))
  }
  
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  } as Template))
}

/**
 * Get a single template
 */
export async function getTemplate(
  userId: string,
  templateId: string
): Promise<Template | null> {
  const templateRef = doc(db, 'users', userId, 'templates', templateId)
  const snapshot = await getDoc(templateRef)
  
  if (!snapshot.exists()) {
    return null
  }
  
  const data = snapshot.data()
  return {
    ...data,
    id: snapshot.id,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date()
  } as Template
}

/**
 * Delete a template
 */
export async function deleteTemplate(
  userId: string,
  templateId: string
): Promise<void> {
  const templateRef = doc(db, 'users', userId, 'templates', templateId)
  await deleteDoc(templateRef)
  
  console.log(`🗑️ Template deleted: ${templateId}`)
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(
  userId: string,
  templateId: string
): Promise<void> {
  const templateRef = doc(db, 'users', userId, 'templates', templateId)
  const snapshot = await getDoc(templateRef)
  
  if (snapshot.exists()) {
    const currentCount = snapshot.data().usageCount || 0
    await updateDoc(templateRef, {
      usageCount: currentCount + 1
    })
  }
}

// ============================================================================
// LOCK SYSTEM
// ============================================================================

/**
 * Update story bible lock status
 */
export async function updateLockStatus(
  userId: string,
  storyBibleId: string,
  isLocked: boolean,
  episodeCount: number
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'storyBibles', storyBibleId)
  
  const updates: any = {
    isLocked,
    episodeCount,
    lastModified: Timestamp.now()
  }
  
  if (isLocked && !await isStoryBibleLocked(userId, storyBibleId)) {
    updates.lockedAt = Timestamp.now()
  }
  
  await updateDoc(docRef, updates)
  
  console.log(`🔒 Lock status updated: ${isLocked ? 'LOCKED' : 'UNLOCKED'}`)
}

/**
 * Check if story bible is locked
 */
export async function isStoryBibleLocked(
  userId: string,
  storyBibleId: string
): Promise<boolean> {
  const docRef = doc(db, 'users', userId, 'storyBibles', storyBibleId)
  const snapshot = await getDoc(docRef)
  
  if (!snapshot.exists()) {
    return false
  }
  
  return snapshot.data().isLocked || false
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch update story bible with version and lock status
 */
export async function batchUpdateStoryBible(
  userId: string,
  storyBibleId: string,
  storyBibleUpdates: Partial<StoryBible>,
  version: Version,
  lockUpdate?: { isLocked: boolean; episodeCount: number }
): Promise<void> {
  const batch = writeBatch(db)
  
  // Update story bible
  const storyBibleRef = doc(db, 'users', userId, 'storyBibles', storyBibleId)
  batch.update(storyBibleRef, {
    ...storyBibleUpdates,
    lastModified: Timestamp.now()
  })
  
  // Create version
  const versionRef = doc(collection(db, 'users', userId, 'storyBibles', storyBibleId, 'versions'))
  batch.set(versionRef, {
    ...version,
    timestamp: Timestamp.fromDate(version.timestamp),
    changes: version.changes.map(change => ({
      ...change,
      timestamp: Timestamp.fromDate(change.timestamp)
    }))
  })
  
  // Update lock if provided
  if (lockUpdate) {
    batch.update(storyBibleRef, {
      isLocked: lockUpdate.isLocked,
      episodeCount: lockUpdate.episodeCount
    })
  }
  
  await batch.commit()
  
  console.log(`✅ Batch update completed`)
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check Firestore connection
 */
export async function checkFirestoreConnection(): Promise<boolean> {
  try {
    const testRef = doc(db, 'connection_test', 'test')
    await getDoc(testRef)
    return true
  } catch (error) {
    console.error('Firestore connection failed:', error)
    return false
  }
}

