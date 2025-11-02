/**
 * Relationship Detector Service
 * 
 * Analyzes episodes to detect character relationships
 */

import { generateContentWithGemini } from './gemini-ai'
import { CharacterRelationship, RelationshipSuggestion, RelationshipType } from '@/types/relationships'

// ============================================================================
// RELATIONSHIP DETECTOR SERVICE
// ============================================================================

export class RelationshipDetectorService {
  private static instance: RelationshipDetectorService

  static getInstance(): RelationshipDetectorService {
    if (!RelationshipDetectorService.instance) {
      RelationshipDetectorService.instance = new RelationshipDetectorService()
    }
    return RelationshipDetectorService.instance
  }

  /**
   * Detect relationships from episode content
   */
  async detectRelationships(
    episode: any,
    characters: string[]
  ): Promise<RelationshipSuggestion[]> {
    if (characters.length < 2) {
      return []
    }

    console.log(`🔍 Detecting relationships in Episode ${episode.episodeNumber}...`)

    try {
      const prompt = this.buildDetectionPrompt(episode, characters)
      const response = await generateContentWithGemini('You are an expert at analyzing character relationships in stories.', prompt)
      const suggestions = this.parseRelationshipSuggestions(response, episode.episodeNumber)
      
      console.log(`✅ Detected ${suggestions.length} relationship(s)`)
      return suggestions
    } catch (error) {
      console.error('Error detecting relationships:', error)
      return []
    }
  }

  /**
   * Build relationship detection prompt
   */
  private buildDetectionPrompt(episode: any, characters: string[]): string {
    return `Analyze this TV episode and identify character relationships.

EPISODE: ${episode.title || `Episode ${episode.episodeNumber}`}

CHARACTERS TO ANALYZE:
${characters.join(', ')}

SCENES:
${episode.scenes?.map((scene: any, idx: number) => `
Scene ${idx + 1}:
${scene.content || scene.description}
`).join('\n') || 'No scenes'}

TASK:
Identify ALL relationships between the listed characters based on their interactions in this episode.
For each relationship, determine:
- Which two characters are involved
- The type of relationship (allies, enemies, romantic, family, rivals, neutral, mentor-student, professional)
- The strength of the relationship (1-10)
- Evidence from the episode supporting this relationship
- Your confidence in this assessment (0-100)

Return ONLY valid JSON in this format:
{
  "relationships": [
    {
      "characters": ["Character A", "Character B"],
      "suggestedType": "allies",
      "strength": 7,
      "reasoning": "Evidence from episode showing why this relationship type and strength",
      "confidence": 85,
      "basedOnEpisodes": [${episode.episodeNumber}]
    }
  ]
}

Only include relationships where you have clear evidence from the episode.
If characters don't interact in this episode, don't suggest a relationship.`
  }

  /**
   * Parse relationship suggestions from AI response
   */
  private parseRelationshipSuggestions(response: string, episodeNumber: number): RelationshipSuggestion[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return []
      }

      const parsed = JSON.parse(jsonMatch[0])
      return (parsed.relationships || []).map((rel: any) => ({
        characters: rel.characters as [string, string],
        suggestedType: rel.suggestedType as RelationshipType,
        reasoning: rel.reasoning,
        confidence: rel.confidence || 75,
        basedOnEpisodes: rel.basedOnEpisodes || [episodeNumber]
      }))
    } catch (error) {
      console.error('Error parsing relationship suggestions:', error)
      return []
    }
  }

  /**
   * Merge relationship suggestions with existing relationships
   */
  mergeRelationships(
    existing: CharacterRelationship[],
    suggestions: RelationshipSuggestion[],
    episodeNumber: number
  ): CharacterRelationship[] {
    const merged = [...existing]

    suggestions.forEach(suggestion => {
      // Find existing relationship
      const existingIndex = merged.findIndex(rel => {
        const hasChar1 = rel.characters.includes(suggestion.characters[0])
        const hasChar2 = rel.characters.includes(suggestion.characters[1])
        return hasChar1 && hasChar2
      })

      if (existingIndex !== -1) {
        // Update existing relationship
        const existing = merged[existingIndex]
        existing.evolution.push({
          episode: episodeNumber,
          change: `Relationship observed: ${suggestion.suggestedType}`,
          context: suggestion.reasoning,
          timestamp: new Date()
        })
        existing.updatedAt = new Date()
      } else {
        // Create new relationship
        merged.push({
          id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          characters: suggestion.characters,
          type: suggestion.suggestedType,
          strength: 5, // Default strength, can be adjusted
          description: suggestion.reasoning,
          evolution: [
            {
              episode: episodeNumber,
              change: `Relationship detected: ${suggestion.suggestedType}`,
              context: suggestion.reasoning,
              timestamp: new Date()
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'auto'
        })
      }
    })

    return merged
  }
}

// Export singleton instance
export const relationshipDetector = RelationshipDetectorService.getInstance()

