/**
 * Story Bible Lock Service
 * 
 * Manages locking state of story bible once episodes are generated
 * Prevents editing to maintain consistency with generated content
 */

// ============================================================================
// TYPES
// ============================================================================

export interface LockStatus {
  isLocked: boolean
  reason: string
  lockedAt?: Date
  episodeCount: number
  allowedActions: {
    canEditContent: boolean
    canAddCharacters: boolean
    canAddLocations: boolean
    canEditCharacters: boolean
    canEditWorld: boolean
    canEditArcs: boolean
    canDeleteContent: boolean
  }
}

// ============================================================================
// STORY BIBLE LOCK SERVICE
// ============================================================================

export class StoryBibleLockService {
  private static instance: StoryBibleLockService

  static getInstance(): StoryBibleLockService {
    if (!StoryBibleLockService.instance) {
      StoryBibleLockService.instance = new StoryBibleLockService()
    }
    return StoryBibleLockService.instance
  }

  /**
   * Check if story bible should be locked based on episode count
   */
  checkLockStatus(episodeCount: number): LockStatus {
    const isLocked = episodeCount > 0

    if (isLocked) {
      return {
        isLocked: true,
        reason: `Story Bible is locked because ${episodeCount} episode${episodeCount !== 1 ? 's have' : ' has'} been generated. You can still edit content, but structural changes are restricted.`,
        episodeCount,
        allowedActions: {
          canEditContent: true,       // CAN edit existing content (text fields)
          canAddCharacters: true,      // CAN add new characters
          canAddLocations: true,        // CAN add locations manually
          canEditCharacters: true,     // CAN edit existing characters
          canEditWorld: true,          // CAN edit world building
          canEditArcs: true,           // CAN edit story arcs
          canDeleteContent: false      // Cannot delete anything (prevents breaking references)
        }
      }
    }

    return {
      isLocked: false,
      reason: 'Story Bible is unlocked. Generate your first episode to lock it and maintain consistency.',
      episodeCount: 0,
      allowedActions: {
        canEditContent: true,
        canAddCharacters: true,
        canAddLocations: true,
        canEditCharacters: true,
        canEditWorld: true,
        canEditArcs: true,
        canDeleteContent: true
      }
    }
  }

  /**
   * Check if a specific action is allowed
   */
  canPerformAction(
    action: keyof LockStatus['allowedActions'],
    episodeCount: number
  ): boolean {
    const status = this.checkLockStatus(episodeCount)
    return status.allowedActions[action]
  }

  /**
   * Get user-friendly message for why an action is blocked
   */
  getBlockedActionMessage(
    action: keyof LockStatus['allowedActions'],
    episodeCount: number
  ): string | null {
    if (this.canPerformAction(action, episodeCount)) {
      return null
    }

    const actionMessages: Record<string, string> = {
      canEditContent: 'You cannot edit story bible content after generating episodes. This prevents continuity issues with already-generated content.',
      canAddCharacters: 'You cannot add characters after episodes are generated.',
      canAddLocations: 'You cannot manually add locations after episodes are generated. New locations will be added automatically through Episode Reflection.',
      canEditCharacters: 'You cannot edit existing characters after episodes are generated. This prevents contradictions with how characters appear in episodes.',
      canEditWorld: 'You cannot edit world building after episodes are generated. This prevents rule changes that would contradict established content.',
      canEditArcs: 'You cannot edit story arcs after episodes are generated. Arc progression is managed through episode generation.',
      canDeleteContent: 'You cannot delete content after episodes are generated. This could create broken references in existing episodes.'
    }

    return actionMessages[action] || 'This action is not allowed when the story bible is locked.'
  }

  /**
   * Get suggested alternative action
   */
  getSuggestedAlternative(action: keyof LockStatus['allowedActions']): string {
    const alternatives: Record<string, string> = {
      canEditContent: 'Use Episode Reflection to update the story bible based on new episodes, or add new characters which is still allowed.',
      canAddCharacters: 'New characters can be added even when locked!',
      canAddLocations: 'Generate episodes that mention new locations, then use Episode Reflection to add them to the story bible.',
      canEditCharacters: 'Character development happens through episodes. Generate new episodes to evolve your characters, then use Episode Reflection to update their arcs.',
      canEditWorld: 'World building expands through episodes. Reveal new world details in episodes, then use Episode Reflection to add them.',
      canEditArcs: 'Story arcs progress through episode generation. Continue generating episodes to advance the narrative.',
      canDeleteContent: 'If you need to make major changes, consider starting a new story bible or creating a branch/alternate timeline.'
    }

    return alternatives[action] || 'Generate new episodes and use Episode Reflection to update the story bible.'
  }

  /**
   * Check if user can bypass lock (for admin/override purposes)
   */
  canOverrideLock(userRole?: string): boolean {
    // In the future, you might allow admins or creators to override
    // For now, no one can override
    return false
  }

  /**
   * Format lock status for display
   */
  formatLockStatusMessage(episodeCount: number): {
    icon: string
    title: string
    message: string
    variant: 'info' | 'warning' | 'success'
  } {
    const status = this.checkLockStatus(episodeCount)

    if (status.isLocked) {
      return {
        icon: '🔒',
        title: 'Story Bible Locked',
        message: status.reason,
        variant: 'warning'
      }
    }

    return {
      icon: '🔓',
      title: 'Story Bible Unlocked',
      message: 'You can freely edit all content. The story bible will lock after your first episode is generated.',
      variant: 'info'
    }
  }
}

// Export singleton instance
export const storyBibleLock = StoryBibleLockService.getInstance()

