/**
 * Story Bible Migration Script
 * 
 * Migrates localStorage story bibles to Firestore with enrichment fields
 */

import { db } from '@/lib/firebase'
import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore'
import { getStoryBibles, saveStoryBible } from '@/services/story-bible-service'
import { updateStoryBibleFields } from '@/services/story-bible-firestore'

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

/**
 * Add new enrichment fields to existing story bibles
 */
export async function migrateStoryBibles(userId: string): Promise<{
  success: number
  failed: number
  errors: string[]
}> {
  const bibles = await getStoryBibles(userId)
  let success = 0
  let failed = 0
  const errors: string[] = []
  
  console.log(`📦 Migrating ${bibles.length} story bible(s)...`)
  
  for (const bible of bibles) {
    try {
      const updates = {
        // Lock System
        isLocked: false,
        lockedAt: null,
        episodeCount: 0,
        
        // Relationships
        relationships: {
          characterRelations: [],
          lastUpdated: new Date()
        },
        
        // Timeline
        timeline: {
          events: [],
          chronologyType: 'episodic' as const,
          lastUpdated: new Date()
        },
        
        // Visual References
        characterVisuals: {},
        
        // Metadata
        lastEpisodeReflection: null,
        
        // Version tracking
        version: bible.version || 1,
        lastModified: new Date()
      }
      
      await updateStoryBibleFields(userId, bible.id, updates)
      success++
      console.log(`✅ Migrated: ${bible.seriesTitle}`)
    } catch (error) {
      failed++
      const errorMsg = `Failed to migrate ${bible.seriesTitle}: ${error}`
      errors.push(errorMsg)
      console.error(`❌ ${errorMsg}`)
    }
  }
  
  console.log(`\n📊 Migration complete:`)
  console.log(`  ✅ Success: ${success}`)
  console.log(`  ❌ Failed: ${failed}`)
  
  return { success, failed, errors }
}

/**
 * Migrate a single story bible from localStorage to Firestore
 */
export async function migrateLocalBibleToFirestore(
  localBible: any,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Add enrichment fields
    const enrichedBible = {
      ...localBible,
      
      // Lock System
      isLocked: false,
      lockedAt: null,
      episodeCount: 0,
      
      // Relationships
      relationships: {
        characterRelations: [],
        lastUpdated: new Date()
      },
      
      // Timeline
      timeline: {
        events: [],
        chronologyType: 'episodic' as const,
        lastUpdated: new Date()
      },
      
      // Visual References
      characterVisuals: {},
      
      // Metadata
      lastEpisodeReflection: null,
      
      // Version tracking
      version: 1,
      lastModified: new Date(),
      
      // Ensure IDs
      id: localBible.id || `sb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: localBible.status || 'draft',
      createdAt: localBible.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await saveStoryBible(enrichedBible, userId)
    
    console.log(`✅ Migrated local bible to Firestore: ${enrichedBible.seriesTitle}`)
    return { success: true }
  } catch (error) {
    const errorMsg = `Migration failed: ${error}`
    console.error(`❌ ${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}

/**
 * Check if a story bible needs migration
 */
export function needsMigration(storyBible: any): boolean {
  return (
    storyBible.isLocked === undefined ||
    storyBible.relationships === undefined ||
    storyBible.timeline === undefined ||
    storyBible.characterVisuals === undefined
  )
}

/**
 * Batch migrate multiple story bibles
 */
export async function batchMigrateStoryBibles(
  userId: string,
  storyBibleIds: string[]
): Promise<{
  migrated: string[]
  skipped: string[]
  failed: { id: string; error: string }[]
}> {
  const migrated: string[] = []
  const skipped: string[] = []
  const failed: { id: string; error: string }[] = []
  
  for (const id of storyBibleIds) {
    try {
      const docRef = doc(db, 'users', userId, 'storyBibles', id)
      const snapshot = await getDoc(docRef)
      
      if (!snapshot.exists()) {
        skipped.push(id)
        continue
      }
      
      const storyBible = snapshot.data()
      
      if (!needsMigration(storyBible)) {
        skipped.push(id)
        console.log(`⏭️  Skipped (already migrated): ${id}`)
        continue
      }
      
      const updates = {
        isLocked: false,
        lockedAt: null,
        episodeCount: 0,
        relationships: {
          characterRelations: [],
          lastUpdated: Timestamp.now()
        },
        timeline: {
          events: [],
          chronologyType: 'episodic',
          lastUpdated: Timestamp.now()
        },
        characterVisuals: {},
        lastEpisodeReflection: null,
        version: storyBible.version || 1,
        lastModified: Timestamp.now()
      }
      
      await updateDoc(docRef, updates)
      migrated.push(id)
      console.log(`✅ Migrated: ${id}`)
    } catch (error) {
      failed.push({ id, error: String(error) })
      console.error(`❌ Failed to migrate ${id}:`, error)
    }
  }
  
  return { migrated, skipped, failed }
}

/**
 * Verify migration was successful
 */
export async function verifyMigration(
  userId: string,
  storyBibleId: string
): Promise<{
  success: boolean
  missing: string[]
  message: string
}> {
  try {
    const docRef = doc(db, 'users', userId, 'storyBibles', storyBibleId)
    const snapshot = await getDoc(docRef)
    
    if (!snapshot.exists()) {
      return {
        success: false,
        missing: [],
        message: 'Story bible not found'
      }
    }
    
    const data = snapshot.data()
    const requiredFields = [
      'isLocked',
      'episodeCount',
      'relationships',
      'timeline',
      'characterVisuals',
      'version'
    ]
    
    const missing = requiredFields.filter(field => data[field] === undefined)
    
    if (missing.length > 0) {
      return {
        success: false,
        missing,
        message: `Missing fields: ${missing.join(', ')}`
      }
    }
    
    return {
      success: true,
      missing: [],
      message: 'Migration verified successfully'
    }
  } catch (error) {
    return {
      success: false,
      missing: [],
      message: `Verification error: ${error}`
    }
  }
}

