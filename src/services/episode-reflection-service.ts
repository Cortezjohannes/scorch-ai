/**
 * Episode Reflection Service
 * 
 * Analyzes generated episodes and extracts information to reflect back
 * into the story bible (characters, locations, world rules, timeline events)
 */

import { generateContentWithGemini } from './gemini-ai'

// ============================================================================
// TYPES
// ============================================================================

export interface NewCharacter {
  name: string
  role: string
  description: string
  firstAppearance: {
    episodeNumber: number
    context: string
  }
  suggested: boolean // AI suggested vs. explicitly mentioned
}

export interface NewLocation {
  name: string
  type: string // city, building, natural, virtual, etc.
  description: string
  significance: string
  firstMentioned: {
    episodeNumber: number
    context: string
  }
}

export interface CharacterDevelopment {
  characterName: string
  developmentType: 'growth' | 'setback' | 'revelation' | 'transformation'
  description: string
  episodeNumber: number
  significance: number // 1-10
  emotionalImpact: string
}

export interface WorldBuildingReveal {
  category: 'rule' | 'history' | 'culture' | 'technology' | 'magic' | 'social'
  title: string
  description: string
  episodeNumber: number
  significance: number // 1-10
  implications: string
}

export interface TimelineEvent {
  id: string
  title: string
  description: string
  episodeNumber: number
  sceneReference?: string
  timestamp?: string // in-universe time if specified
  type: 'character_intro' | 'plot_event' | 'world_reveal' | 'relationship_change' | 'major_decision'
  relatedCharacters: string[]
  relatedLocations: string[]
  significance: number // 1-10
}

export interface RelationshipChange {
  characters: [string, string]
  previousRelation: string
  newRelation: string
  relationshipType: 'allies' | 'enemies' | 'romantic' | 'family' | 'rivals' | 'neutral'
  strength: number // 1-10
  episodeNumber: number
  context: string
}

export interface EpisodeReflectionData {
  episodeNumber: number
  episodeTitle: string
  
  // New elements introduced
  newCharacters: NewCharacter[]
  newLocations: NewLocation[]
  
  // Character changes
  characterDevelopments: CharacterDevelopment[]
  relationshipChanges: RelationshipChange[]
  
  // World building
  worldBuildingReveals: WorldBuildingReveal[]
  
  // Timeline
  timelineEvents: TimelineEvent[]
  
  // Metadata
  analyzed: Date
  aiConfidence: number // 0-100
  needsReview: boolean
}

// ============================================================================
// EPISODE REFLECTION SERVICE
// ============================================================================

export class EpisodeReflectionService {
  private static instance: EpisodeReflectionService

  static getInstance(): EpisodeReflectionService {
    if (!EpisodeReflectionService.instance) {
      EpisodeReflectionService.instance = new EpisodeReflectionService()
    }
    return EpisodeReflectionService.instance
  }

  /**
   * Main method: Analyze an episode and extract reflection data
   */
  async analyzeEpisode(
    episode: any,
    storyBible: any,
    previousEpisodes: any[] = []
  ): Promise<EpisodeReflectionData> {
    console.log(`🔍 Analyzing Episode ${episode.episodeNumber} for story bible reflections...`)

    try {
      // Build comprehensive analysis prompt
      const analysisPrompt = this.buildAnalysisPrompt(episode, storyBible, previousEpisodes)
      
      // Get AI analysis
      const response = await generateContentWithGemini('You are an expert story analyst. Extract structured information from TV episodes.', analysisPrompt)
      
      // Parse response
      const reflectionData = this.parseAnalysisResponse(response, episode)
      
      console.log('✅ Episode reflection analysis complete:', {
        newCharacters: reflectionData.newCharacters.length,
        newLocations: reflectionData.newLocations.length,
        developments: reflectionData.characterDevelopments.length,
        worldReveals: reflectionData.worldBuildingReveals.length,
        timelineEvents: reflectionData.timelineEvents.length
      })
      
      return reflectionData
    } catch (error) {
      console.error('Error analyzing episode:', error)
      return this.getFallbackReflectionData(episode)
    }
  }

  /**
   * Build the AI analysis prompt
   */
  private buildAnalysisPrompt(episode: any, storyBible: any, previousEpisodes: any[]): string {
    const existingCharacters = (storyBible.characters || storyBible.mainCharacters || [])
      .map((c: any) => c.name)
      .join(', ')

    const existingLocations = (storyBible.worldBuilding?.locations || [])
      .map((l: any) => l.name || l)
      .join(', ')

    return `Analyze this TV episode and extract new information that should be added to the story bible.

EPISODE INFORMATION:
Title: ${episode.title || episode.episodeTitle}
Episode Number: ${episode.episodeNumber}
Synopsis: ${episode.synopsis || episode.logline || 'Not provided'}

SCENES:
${episode.scenes?.map((scene: any, idx: number) => `
Scene ${idx + 1}:
${scene.content || scene.description || scene.text}
`).join('\n') || 'No scenes provided'}

EXISTING STORY BIBLE CONTEXT:
Series: ${storyBible.seriesTitle}
Genre: ${storyBible.genre || 'Not specified'}
Theme: ${storyBible.theme || 'Not specified'}
Existing Characters: ${existingCharacters || 'None'}
Existing Locations: ${existingLocations || 'None'}

PREVIOUS EPISODES: ${previousEpisodes.length} episodes have been generated before this one.

ANALYSIS TASKS:

1. NEW CHARACTERS: Identify any NEW characters introduced in this episode who are NOT in the existing characters list.
   For each new character, provide: name, role, description, context of first appearance.

2. NEW LOCATIONS: Identify any NEW locations mentioned that are NOT in the existing locations list.
   For each new location, provide: name, type, description, significance, context.

3. CHARACTER DEVELOPMENTS: Identify significant character growth, setbacks, revelations, or transformations.
   For each development, provide: character name, development type, description, significance (1-10), emotional impact.

4. RELATIONSHIP CHANGES: Identify any changes in relationships between characters.
   For each change, provide: characters involved, previous relation, new relation, type, strength (1-10), context.

5. WORLD BUILDING REVEALS: Identify new information about the world (rules, history, culture, technology, magic, social structures).
   For each reveal, provide: category, title, description, significance (1-10), implications.

6. TIMELINE EVENTS: Identify major plot events that should be recorded in the timeline.
   For each event, provide: title, description, type, related characters/locations, significance (1-10).

Return ONLY valid JSON in this exact format:
{
  "newCharacters": [
    {
      "name": "Character Name",
      "role": "protagonist/antagonist/supporting/etc",
      "description": "Brief description",
      "firstAppearance": {
        "episodeNumber": ${episode.episodeNumber},
        "context": "How they were introduced"
      },
      "suggested": false
    }
  ],
  "newLocations": [
    {
      "name": "Location Name",
      "type": "city/building/natural/etc",
      "description": "Description",
      "significance": "Why it matters",
      "firstMentioned": {
        "episodeNumber": ${episode.episodeNumber},
        "context": "Context of mention"
      }
    }
  ],
  "characterDevelopments": [
    {
      "characterName": "Character Name",
      "developmentType": "growth/setback/revelation/transformation",
      "description": "What changed",
      "episodeNumber": ${episode.episodeNumber},
      "significance": 7,
      "emotionalImpact": "How it affects the character emotionally"
    }
  ],
  "relationshipChanges": [
    {
      "characters": ["Character A", "Character B"],
      "previousRelation": "strangers/allies/etc",
      "newRelation": "allies/enemies/etc",
      "relationshipType": "allies/enemies/romantic/family/rivals/neutral",
      "strength": 7,
      "episodeNumber": ${episode.episodeNumber},
      "context": "What caused the change"
    }
  ],
  "worldBuildingReveals": [
    {
      "category": "rule/history/culture/technology/magic/social",
      "title": "Reveal Title",
      "description": "Details of the reveal",
      "episodeNumber": ${episode.episodeNumber},
      "significance": 8,
      "implications": "What this means for the story"
    }
  ],
  "timelineEvents": [
    {
      "id": "event-${episode.episodeNumber}-1",
      "title": "Event Title",
      "description": "What happened",
      "episodeNumber": ${episode.episodeNumber},
      "type": "character_intro/plot_event/world_reveal/relationship_change/major_decision",
      "relatedCharacters": ["Character Name"],
      "relatedLocations": ["Location Name"],
      "significance": 8
    }
  ],
  "aiConfidence": 85,
  "needsReview": false
}

BE THOROUGH but CONSERVATIVE - only include items that are clearly NEW or SIGNIFICANT changes.
If nothing new is found in a category, return an empty array for that category.`
  }

  /**
   * Parse AI response into structured reflection data
   */
  private parseAnalysisResponse(response: string, episode: any): EpisodeReflectionData {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        episodeNumber: episode.episodeNumber,
        episodeTitle: episode.title || episode.episodeTitle || `Episode ${episode.episodeNumber}`,
        newCharacters: parsed.newCharacters || [],
        newLocations: parsed.newLocations || [],
        characterDevelopments: parsed.characterDevelopments || [],
        relationshipChanges: parsed.relationshipChanges || [],
        worldBuildingReveals: parsed.worldBuildingReveals || [],
        timelineEvents: parsed.timelineEvents || [],
        analyzed: new Date(),
        aiConfidence: parsed.aiConfidence || 75,
        needsReview: parsed.needsReview !== undefined ? parsed.needsReview : true
      }
    } catch (error) {
      console.error('Error parsing AI analysis response:', error)
      console.log('Raw response:', response.substring(0, 500))
      return this.getFallbackReflectionData(episode)
    }
  }

  /**
   * Fallback reflection data if AI analysis fails
   */
  private getFallbackReflectionData(episode: any): EpisodeReflectionData {
    // Basic extraction from episode data
    const timelineEvent: TimelineEvent = {
      id: `event-${episode.episodeNumber}-fallback`,
      title: episode.title || `Episode ${episode.episodeNumber}`,
      description: episode.synopsis || episode.logline || 'Episode generated',
      episodeNumber: episode.episodeNumber,
      type: 'plot_event',
      relatedCharacters: [],
      relatedLocations: [],
      significance: 5
    }

    return {
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.title || episode.episodeTitle || `Episode ${episode.episodeNumber}`,
      newCharacters: [],
      newLocations: [],
      characterDevelopments: [],
      relationshipChanges: [],
      worldBuildingReveals: [],
      timelineEvents: [timelineEvent],
      analyzed: new Date(),
      aiConfidence: 0,
      needsReview: true
    }
  }

  /**
   * Check if an episode has already been reflected
   */
  async isEpisodeReflected(episodeId: string, storyBibleId: string): Promise<boolean> {
    // This would check Firestore for reflection metadata
    // For now, return false to always allow reflection
    return false
  }

  /**
   * Mark an episode as reflected
   */
  async markEpisodeReflected(episodeId: string, storyBibleId: string, reflectionData: EpisodeReflectionData): Promise<void> {
    // This would save reflection metadata to Firestore
    console.log(`✓ Marked episode ${episodeId} as reflected in story bible ${storyBibleId}`)
  }

  /**
   * Get reflection summary for display
   */
  getReflectionSummary(reflectionData: EpisodeReflectionData): string {
    const parts: string[] = []

    if (reflectionData.newCharacters.length > 0) {
      parts.push(`${reflectionData.newCharacters.length} new character(s)`)
    }
    if (reflectionData.newLocations.length > 0) {
      parts.push(`${reflectionData.newLocations.length} new location(s)`)
    }
    if (reflectionData.characterDevelopments.length > 0) {
      parts.push(`${reflectionData.characterDevelopments.length} character development(s)`)
    }
    if (reflectionData.worldBuildingReveals.length > 0) {
      parts.push(`${reflectionData.worldBuildingReveals.length} world reveal(s)`)
    }
    if (reflectionData.timelineEvents.length > 0) {
      parts.push(`${reflectionData.timelineEvents.length} timeline event(s)`)
    }

    return parts.length > 0 ? parts.join(', ') : 'No new information detected'
  }
}

// Export singleton instance
export const episodeReflectionService = EpisodeReflectionService.getInstance()

