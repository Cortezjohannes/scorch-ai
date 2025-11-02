/**
 * Story Bible Sync Service
 * 
 * Handles bidirectional sync between episodes and story bible
 * Applies approved reflection data to story bible tabs
 */

import { EpisodeReflectionData } from './episode-reflection-service'

// ============================================================================
// TYPES
// ============================================================================

export interface SyncResult {
  success: boolean
  updatedStoryBible?: any
  error?: string
  changesSummary: {
    charactersAdded: number
    locationsAdded: number
    developmentsApplied: number
    worldRevealsAdded: number
    timelineEventsAdded: number
    relationshipsAdded: number
  }
}

export interface SelectedUpdates {
  newCharacters: any[]
  newLocations: any[]
  characterDevelopments: any[]
  worldBuildingReveals: any[]
  timelineEvents: any[]
  relationshipChanges: any[]
}

// ============================================================================
// STORY BIBLE SYNC SERVICE
// ============================================================================

export class StoryBibleSyncService {
  private static instance: StoryBibleSyncService

  static getInstance(): StoryBibleSyncService {
    if (!StoryBibleSyncService.instance) {
      StoryBibleSyncService.instance = new StoryBibleSyncService()
    }
    return StoryBibleSyncService.instance
  }

  /**
   * Apply selected updates to story bible
   */
  async applyUpdatesToStoryBible(
    storyBible: any,
    selectedUpdates: SelectedUpdates
  ): Promise<SyncResult> {
    console.log('📝 Applying updates to story bible...')

    try {
      const updatedStoryBible = JSON.parse(JSON.stringify(storyBible)) // Deep clone

      let changesSummary = {
        charactersAdded: 0,
        locationsAdded: 0,
        developmentsApplied: 0,
        worldRevealsAdded: 0,
        timelineEventsAdded: 0,
        relationshipsAdded: 0
      }

      // Apply new characters
      if (selectedUpdates.newCharacters.length > 0) {
        changesSummary.charactersAdded = this.applyNewCharacters(
          updatedStoryBible,
          selectedUpdates.newCharacters
        )
      }

      // Apply new locations
      if (selectedUpdates.newLocations.length > 0) {
        changesSummary.locationsAdded = this.applyNewLocations(
          updatedStoryBible,
          selectedUpdates.newLocations
        )
      }

      // Apply character developments
      if (selectedUpdates.characterDevelopments.length > 0) {
        changesSummary.developmentsApplied = this.applyCharacterDevelopments(
          updatedStoryBible,
          selectedUpdates.characterDevelopments
        )
      }

      // Apply world building reveals
      if (selectedUpdates.worldBuildingReveals.length > 0) {
        changesSummary.worldRevealsAdded = this.applyWorldBuildingReveals(
          updatedStoryBible,
          selectedUpdates.worldBuildingReveals
        )
      }

      // Apply timeline events
      if (selectedUpdates.timelineEvents.length > 0) {
        changesSummary.timelineEventsAdded = this.applyTimelineEvents(
          updatedStoryBible,
          selectedUpdates.timelineEvents
        )
      }

      // Apply relationship changes
      if (selectedUpdates.relationshipChanges.length > 0) {
        changesSummary.relationshipsAdded = this.applyRelationshipChanges(
          updatedStoryBible,
          selectedUpdates.relationshipChanges
        )
      }

      // Update metadata
      updatedStoryBible.lastUpdated = new Date().toISOString()
      updatedStoryBible.lastEpisodeReflection = {
        timestamp: new Date().toISOString(),
        changesSummary
      }

      console.log('✅ Story bible updated successfully:', changesSummary)

      return {
        success: true,
        updatedStoryBible,
        changesSummary
      }
    } catch (error) {
      console.error('Error applying updates to story bible:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        changesSummary: {
          charactersAdded: 0,
          locationsAdded: 0,
          developmentsApplied: 0,
          worldRevealsAdded: 0,
          timelineEventsAdded: 0,
          relationshipsAdded: 0
        }
      }
    }
  }

  /**
   * Apply new characters to story bible
   */
  private applyNewCharacters(storyBible: any, newCharacters: any[]): number {
    if (!storyBible.characters) {
      storyBible.characters = []
    }
    if (!storyBible.mainCharacters) {
      storyBible.mainCharacters = []
    }

    let added = 0

    newCharacters.forEach(char => {
      // Check if character already exists
      const exists = storyBible.characters.some(
        (existing: any) => existing.name.toLowerCase() === char.name.toLowerCase()
      )

      if (!exists) {
        const newCharacter = {
          name: char.name,
          archetype: char.role,
          premiseFunction: `Introduced in Episode ${char.firstAppearance.episodeNumber}`,
          description: char.description,
          introducedIn: char.firstAppearance.episodeNumber,
          introducedThrough: 'episode_reflection',
          backstory: char.firstAppearance.context,
          arc: 'To be developed',
          physiology: {
            age: 'TBD',
            gender: 'TBD',
            appearance: char.description,
            build: 'Average',
            health: 'Good',
            physicalTraits: []
          },
          sociology: {
            class: 'TBD',
            occupation: 'TBD',
            education: 'TBD',
            homeLife: 'TBD',
            economicStatus: 'TBD',
            communityStanding: 'TBD'
          },
          psychology: {
            coreValue: 'To be defined',
            moralStandpoint: 'TBD',
            want: 'To be defined',
            need: 'To be defined',
            primaryFlaw: 'To be defined',
            temperament: ['TBD'],
            enneagramType: 'TBD',
            fears: [],
            strengths: []
          },
          voiceProfile: {
            speechPattern: 'TBD',
            vocabulary: 'Average',
            quirks: []
          }
        }

        storyBible.characters.push(newCharacter)
        storyBible.mainCharacters.push({
          name: char.name,
          archetype: char.role,
          description: char.description,
          arc: `Introduced in Episode ${char.firstAppearance.episodeNumber}. ${char.firstAppearance.context}`
        })
        added++
      }
    })

    return added
  }

  /**
   * Apply new locations to story bible
   */
  private applyNewLocations(storyBible: any, newLocations: any[]): number {
    if (!storyBible.worldBuilding) {
      storyBible.worldBuilding = {}
    }
    if (!storyBible.worldBuilding.locations) {
      storyBible.worldBuilding.locations = []
    }

    let added = 0

    newLocations.forEach(loc => {
      // Check if location already exists
      const exists = storyBible.worldBuilding.locations.some(
        (existing: any) => {
          const existingName = typeof existing === 'string' ? existing : existing.name
          return existingName.toLowerCase() === loc.name.toLowerCase()
        }
      )

      if (!exists) {
        storyBible.worldBuilding.locations.push({
          name: loc.name,
          type: loc.type,
          description: loc.description,
          significance: loc.significance,
          firstAppeared: loc.firstMentioned.episodeNumber,
          context: loc.firstMentioned.context
        })
        added++
      }
    })

    return added
  }

  /**
   * Apply character developments to story bible
   */
  private applyCharacterDevelopments(storyBible: any, developments: any[]): number {
    if (!storyBible.characters) {
      storyBible.characters = []
    }

    let applied = 0

    developments.forEach(dev => {
      // Find the character
      const characterIndex = storyBible.characters.findIndex(
        (char: any) => char.name.toLowerCase() === dev.characterName.toLowerCase()
      )

      if (characterIndex !== -1) {
        const character = storyBible.characters[characterIndex]

        // Initialize developments array if it doesn't exist
        if (!character.developments) {
          character.developments = []
        }

        // Add development
        character.developments.push({
          episodeNumber: dev.episodeNumber,
          type: dev.developmentType,
          description: dev.description,
          significance: dev.significance,
          emotionalImpact: dev.emotionalImpact,
          timestamp: new Date().toISOString()
        })

        // Update character arc with latest development
        if (character.arc) {
          character.arc += `\n\nEpisode ${dev.episodeNumber}: ${dev.description}`
        } else {
          character.arc = `Episode ${dev.episodeNumber}: ${dev.description}`
        }

        applied++
      }
    })

    return applied
  }

  /**
   * Apply world building reveals to story bible
   */
  private applyWorldBuildingReveals(storyBible: any, reveals: any[]): number {
    if (!storyBible.worldBuilding) {
      storyBible.worldBuilding = {}
    }
    if (!storyBible.worldBuilding.reveals) {
      storyBible.worldBuilding.reveals = []
    }

    let added = 0

    reveals.forEach(reveal => {
      storyBible.worldBuilding.reveals.push({
        category: reveal.category,
        title: reveal.title,
        description: reveal.description,
        episodeNumber: reveal.episodeNumber,
        significance: reveal.significance,
        implications: reveal.implications,
        timestamp: new Date().toISOString()
      })

      // Also update the appropriate world building section
      switch (reveal.category) {
        case 'rule':
          if (!storyBible.worldBuilding.rules) {
            storyBible.worldBuilding.rules = ''
          }
          storyBible.worldBuilding.rules += `\n\n${reveal.title}: ${reveal.description}`
          break
        case 'history':
          if (!storyBible.worldBuilding.history) {
            storyBible.worldBuilding.history = ''
          }
          storyBible.worldBuilding.history += `\n\n${reveal.title}: ${reveal.description}`
          break
        case 'culture':
          if (!storyBible.worldBuilding.culture) {
            storyBible.worldBuilding.culture = ''
          }
          storyBible.worldBuilding.culture += `\n\n${reveal.title}: ${reveal.description}`
          break
      }

      added++
    })

    return added
  }

  /**
   * Apply timeline events to story bible
   */
  private applyTimelineEvents(storyBible: any, events: any[]): number {
    if (!storyBible.timeline) {
      storyBible.timeline = {
        events: [],
        chronologyType: 'episodic'
      }
    }

    let added = 0

    events.forEach(event => {
      // Check if event already exists
      const exists = storyBible.timeline.events.some(
        (existing: any) => existing.id === event.id
      )

      if (!exists) {
        storyBible.timeline.events.push(event)
        added++
      }
    })

    // Sort timeline events by episode number
    storyBible.timeline.events.sort((a: any, b: any) => a.episodeNumber - b.episodeNumber)

    return added
  }

  /**
   * Apply relationship changes to story bible
   */
  private applyRelationshipChanges(storyBible: any, changes: any[]): number {
    if (!storyBible.relationships) {
      storyBible.relationships = {
        characterRelations: []
      }
    }

    let added = 0

    changes.forEach(change => {
      // Find existing relationship or create new one
      const existingIndex = storyBible.relationships.characterRelations.findIndex(
        (rel: any) => {
          const hasChar1 = rel.characters.includes(change.characters[0])
          const hasChar2 = rel.characters.includes(change.characters[1])
          return hasChar1 && hasChar2
        }
      )

      if (existingIndex !== -1) {
        // Update existing relationship
        const existing = storyBible.relationships.characterRelations[existingIndex]
        existing.type = change.relationshipType
        existing.strength = change.strength
        existing.description = change.context

        if (!existing.evolution) {
          existing.evolution = []
        }
        existing.evolution.push({
          episode: change.episodeNumber,
          change: `${change.previousRelation} → ${change.newRelation}`,
          context: change.context
        })
      } else {
        // Create new relationship
        storyBible.relationships.characterRelations.push({
          characters: change.characters,
          type: change.relationshipType,
          strength: change.strength,
          description: change.context,
          evolution: [
            {
              episode: change.episodeNumber,
              change: `${change.previousRelation} → ${change.newRelation}`,
              context: change.context
            }
          ]
        })
        added++
      }
    })

    return added
  }

  /**
   * Get sync summary for display
   */
  getSyncSummary(changesSummary: any): string {
    const parts: string[] = []

    if (changesSummary.charactersAdded > 0) {
      parts.push(`${changesSummary.charactersAdded} character(s)`)
    }
    if (changesSummary.locationsAdded > 0) {
      parts.push(`${changesSummary.locationsAdded} location(s)`)
    }
    if (changesSummary.developmentsApplied > 0) {
      parts.push(`${changesSummary.developmentsApplied} development(s)`)
    }
    if (changesSummary.worldRevealsAdded > 0) {
      parts.push(`${changesSummary.worldRevealsAdded} world reveal(s)`)
    }
    if (changesSummary.timelineEventsAdded > 0) {
      parts.push(`${changesSummary.timelineEventsAdded} timeline event(s)`)
    }
    if (changesSummary.relationshipsAdded > 0) {
      parts.push(`${changesSummary.relationshipsAdded} relationship(s)`)
    }

    return parts.length > 0 ? `Added: ${parts.join(', ')}` : 'No changes applied'
  }
}

// Export singleton instance
export const storyBibleSync = StoryBibleSyncService.getInstance()


