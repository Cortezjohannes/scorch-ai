/**
 * Version Control Service
 * 
 * Tracks changes to story bible with version history and rollback capability
 * Integrates with Firestore for persistent storage
 */

import { 
  saveVersion as saveVersionToFirestore, 
  getVersionHistory as getVersionHistoryFromFirestore, 
  getVersion as getVersionFromFirestore,
  deleteOldVersions
} from './story-bible-firestore'

// ============================================================================
// TYPES
// ============================================================================

export interface VersionChange {
  id: string
  timestamp: Date
  userId?: string
  changedSection: string
  changeType: 'add' | 'edit' | 'delete'
  beforeValue: any
  afterValue: any
  description: string
}

export interface Version {
  id: string
  timestamp: Date
  userId?: string
  storyBibleSnapshot: any
  changes: VersionChange[]
  description: string
  autoSave: boolean
}

// ============================================================================
// VERSION CONTROL SERVICE
// ============================================================================

export class VersionControlService {
  private static instance: VersionControlService
  private versions: Map<string, Version[]> = new Map() // storyBibleId -> versions (memory fallback)
  private maxVersions = 50

  static getInstance(): VersionControlService {
    if (!VersionControlService.instance) {
      VersionControlService.instance = new VersionControlService()
    }
    return VersionControlService.instance
  }

  /**
   * Create a new version
   */
  async createVersion(
    storyBibleId: string,
    storyBible: any,
    changes: VersionChange[],
    description: string = 'Auto-save',
    autoSave: boolean = true,
    userId?: string
  ): Promise<Version> {
    const version: Version = {
      id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId,
      storyBibleSnapshot: JSON.parse(JSON.stringify(storyBible)), // Deep clone
      changes,
      description,
      autoSave
    }

    // Save to Firestore if userId provided
    if (userId) {
      try {
        await saveVersionToFirestore(userId, storyBibleId, version)
        console.log(`✅ Version saved to Firestore: ${version.id} (${description})`)
      } catch (error) {
        console.error('❌ Failed to save version to Firestore:', error)
        // Fall back to memory storage
        this.saveToMemory(storyBibleId, version)
      }
    } else {
      // No userId, save to memory only
      this.saveToMemory(storyBibleId, version)
    }

    return version
  }

  /**
   * Save version to memory (fallback)
   */
  private saveToMemory(storyBibleId: string, version: Version): void {
    const versions = this.versions.get(storyBibleId) || []
    versions.push(version)

    // Limit version history
    if (versions.length > this.maxVersions) {
      // Keep manual saves and most recent auto-saves
      const manualSaves = versions.filter(v => !v.autoSave)
      const autoSaves = versions.filter(v => v.autoSave).slice(-20)
      this.versions.set(storyBibleId, [...manualSaves, ...autoSaves])
    } else {
      this.versions.set(storyBibleId, versions)
    }

    console.log(`✅ Version saved to memory: ${version.id}`)
  }

  /**
   * Get version history for a story bible
   */
  async getVersionHistory(storyBibleId: string, userId?: string): Promise<Version[]> {
    if (userId) {
      try {
        return await getVersionHistoryFromFirestore(userId, storyBibleId)
      } catch (error) {
        console.error('❌ Failed to get version history from Firestore:', error)
        // Fall back to memory
        return this.versions.get(storyBibleId) || []
      }
    }
    
    // No userId, get from memory
    return this.versions.get(storyBibleId) || []
  }

  /**
   * Get a specific version
   */
  async getVersion(
    storyBibleId: string, 
    versionId: string, 
    userId?: string
  ): Promise<Version | undefined> {
    if (userId) {
      try {
        const version = await getVersionFromFirestore(userId, storyBibleId, versionId)
        return version || undefined
      } catch (error) {
        console.error('❌ Failed to get version from Firestore:', error)
        // Fall back to memory
        const versions = this.versions.get(storyBibleId) || []
        return versions.find(v => v.id === versionId)
      }
    }
    
    // No userId, get from memory
    const versions = this.versions.get(storyBibleId) || []
    return versions.find(v => v.id === versionId)
  }

  /**
   * Restore a version
   */
  async restoreVersion(
    storyBibleId: string,
    versionId: string,
    userId?: string
  ): Promise<{ success: boolean; storyBible?: any; error?: string }> {
    const version = await this.getVersion(storyBibleId, versionId, userId)

    if (!version) {
      return {
        success: false,
        error: 'Version not found'
      }
    }

    // Create a rollback record
    await this.createVersion(
      storyBibleId,
      version.storyBibleSnapshot,
      [
        {
          id: `change-${Date.now()}`,
          timestamp: new Date(),
          changedSection: 'full',
          changeType: 'edit',
          beforeValue: null,
          afterValue: null,
          description: `Restored from version ${versionId}`
        }
      ],
      `Restored from: ${version.description}`,
      false,
      userId
    )

    return {
      success: true,
      storyBible: version.storyBibleSnapshot
    }
  }

  /**
   * Compare two versions
   */
  async compareVersions(
    storyBibleId: string,
    versionId1: string,
    versionId2: string,
    userId?: string
  ): Promise<{ differences: any[]; summary: string }> {
    const v1 = await this.getVersion(storyBibleId, versionId1, userId)
    const v2 = await this.getVersion(storyBibleId, versionId2, userId)

    if (!v1 || !v2) {
      return { differences: [], summary: 'One or both versions not found' }
    }

    const differences = this.findDifferences(v1.storyBibleSnapshot, v2.storyBibleSnapshot)
    const summary = `${differences.length} difference(s) found between versions`

    return { differences, summary }
  }

  /**
   * Find differences between two story bible snapshots
   */
  private findDifferences(obj1: any, obj2: any, path: string = ''): any[] {
    const differences: any[] = []

    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})])

    allKeys.forEach(key => {
      const currentPath = path ? `${path}.${key}` : key
      const val1 = obj1?.[key]
      const val2 = obj2?.[key]

      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        if (typeof val1 === 'object' && typeof val2 === 'object' && !Array.isArray(val1) && !Array.isArray(val2)) {
          differences.push(...this.findDifferences(val1, val2, currentPath))
        } else {
          differences.push({
            path: currentPath,
            before: val1,
            after: val2,
            type: !val1 ? 'added' : !val2 ? 'removed' : 'modified'
          })
        }
      }
    })

    return differences
  }

  /**
   * Get changes since a specific version
   */
  async getChangesSince(
    storyBibleId: string,
    sinceVersionId: string,
    userId?: string
  ): Promise<VersionChange[]> {
    const versions = await this.getVersionHistory(storyBibleId, userId)
    const sinceIndex = versions.findIndex(v => v.id === sinceVersionId)

    if (sinceIndex === -1) {
      return []
    }

    const recentVersions = versions.slice(sinceIndex + 1)
    return recentVersions.flatMap(v => v.changes)
  }

  /**
   * Delete old versions
   */
  pruneVersions(storyBibleId: string, keepCount: number = 20): void {
    const versions = this.versions.get(storyBibleId) || []
    
    if (versions.length > keepCount) {
      const pruned = versions.slice(-keepCount)
      this.versions.set(storyBibleId, pruned)
      console.log(`🗑️ Pruned ${versions.length - keepCount} old version(s)`)
    }
  }

  /**
   * Export version history
   */
  exportVersionHistory(storyBibleId: string): string {
    const versions = this.versions.get(storyBibleId) || []
    return JSON.stringify(versions, null, 2)
  }

  /**
   * Import version history
   */
  importVersionHistory(storyBibleId: string, historyJson: string): void {
    try {
      const versions = JSON.parse(historyJson) as Version[]
      this.versions.set(storyBibleId, versions)
      console.log(`✅ Imported ${versions.length} version(s)`)
    } catch (error) {
      console.error('Error importing version history:', error)
    }
  }

  /**
   * Set max versions to keep
   */
  setMaxVersions(max: number): void {
    this.maxVersions = max
  }
}

// Export singleton instance
export const versionControl = VersionControlService.getInstance()

