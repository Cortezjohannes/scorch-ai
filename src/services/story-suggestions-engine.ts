/**
 * Story Suggestions Engine
 * 
 * Analyzes story bible and episodes to suggest improvements and opportunities
 */

import { generateContentWithGemini } from './gemini-ai'

// ============================================================================
// TYPES
// ============================================================================

export interface StorySuggestion {
  id: string
  category: 'character' | 'world' | 'plot' | 'theme' | 'relationship'
  priority: 'low' | 'medium' | 'high'
  title: string
  description: string
  reasoning: string
  actionable: boolean
  suggestedAction?: string
  relatedContent?: string[]
}

export interface SuggestionResult {
  suggestions: StorySuggestion[]
  generatedAt: Date
  confidence: number
}

// ============================================================================
// STORY SUGGESTIONS ENGINE
// ============================================================================

export class StorySuggestionsEngine {
  private static instance: StorySuggestionsEngine

  static getInstance(): StorySuggestionsEngine {
    if (!StorySuggestionsEngine.instance) {
      StorySuggestionsEngine.instance = new StorySuggestionsEngine()
    }
    return StorySuggestionsEngine.instance
  }

  /**
   * Generate comprehensive suggestions for story improvement
   */
  async generateSuggestions(
    storyBible: any,
    episodes: any[] = []
  ): Promise<SuggestionResult> {
    console.log('💡 Generating story suggestions...')

    try {
      const prompt = this.buildSuggestionsPrompt(storyBible, episodes)
      const response = await generateContentWithGemini('You are a professional story consultant. Analyze stories and suggest meaningful improvements.', prompt)
      const suggestions = this.parseSuggestions(response)
      
      console.log(`✅ Generated ${suggestions.length} suggestion(s)`)
      
      return {
        suggestions,
        generatedAt: new Date(),
        confidence: 80
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
      return {
        suggestions: [],
        generatedAt: new Date(),
        confidence: 0
      }
    }
  }

  /**
   * Build suggestions prompt
   */
  private buildSuggestionsPrompt(storyBible: any, episodes: any[]): string {
    const characterCount = (storyBible.characters || storyBible.mainCharacters || []).length
    const locationCount = (storyBible.worldBuilding?.locations || []).length
    const episodeCount = episodes.length

    return `Analyze this story bible and generated episodes to suggest improvements and opportunities.

STORY BIBLE:
${JSON.stringify(storyBible, null, 2)}

EPISODES GENERATED: ${episodeCount}
${episodes.slice(0, 5).map(ep => `
Episode ${ep.episodeNumber}: ${ep.title || 'Untitled'}
Synopsis: ${ep.synopsis || ep.logline || 'N/A'}
`).join('\n')}

CURRENT STATISTICS:
- Characters: ${characterCount}
- Locations: ${locationCount}
- Episodes: ${episodeCount}

TASK:
Analyze the story and suggest improvements in these categories:

1. CHARACTER DEVELOPMENT
   - Underdeveloped characters (introduced but no arc progression)
   - Characters who haven't appeared in recent episodes
   - Missing character relationships
   - Unexplored character backstories

2. WORLD BUILDING
   - Mentioned locations never visited
   - Unexplored world rules or systems
   - Cultural elements that could be expanded
   - Historical background that could enrich the story

3. PLOT THREADS
   - Dangling plot threads (setup without payoff)
   - Opportunities for callbacks to earlier episodes
   - Potential story arcs not yet explored
   - Conflicts that could be deepened

4. THEME & TONE
   - Theme not reinforced in recent episodes
   - Tonal inconsistencies
   - Missed opportunities to explore the premise
   - Symbolic elements that could be stronger

5. RELATIONSHIPS
   - Characters who haven't interacted yet
   - Relationship dynamics that could be explored
   - Missing relationship evolution
   - Conflict opportunities between characters

For each suggestion, provide:
- Category
- Priority (low/medium/high)
- Title (short, actionable)
- Description (what to do)
- Reasoning (why this would improve the story)
- Suggested action (specific next step)
- Related content (characters/locations/episodes involved)

Return ONLY valid JSON in this format:
{
  "suggestions": [
    {
      "id": "suggestion-1",
      "category": "character/world/plot/theme/relationship",
      "priority": "low/medium/high",
      "title": "Short, actionable title",
      "description": "What needs to be done",
      "reasoning": "Why this would improve the story",
      "actionable": true/false,
      "suggestedAction": "Specific next step to take",
      "relatedContent": ["Character A", "Location B", "Episode 3"]
    }
  ]
}

Focus on ACTIONABLE suggestions that would meaningfully improve the story.
Prioritize suggestions based on impact and feasibility.`
  }

  /**
   * Parse suggestions from AI response
   */
  private parseSuggestions(response: string): StorySuggestion[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return []
      }

      const parsed = JSON.parse(jsonMatch[0])
      return (parsed.suggestions || []).map((s: any, idx: number) => ({
        id: s.id || `suggestion-${idx + 1}`,
        category: s.category || 'general',
        priority: s.priority || 'medium',
        title: s.title || 'Suggestion',
        description: s.description || '',
        reasoning: s.reasoning || '',
        actionable: s.actionable !== false,
        suggestedAction: s.suggestedAction,
        relatedContent: s.relatedContent || []
      }))
    } catch (error) {
      console.error('Error parsing suggestions:', error)
      return []
    }
  }

  /**
   * Filter suggestions by category
   */
  filterByCategory(
    suggestions: StorySuggestion[],
    category: StorySuggestion['category']
  ): StorySuggestion[] {
    return suggestions.filter(s => s.category === category)
  }

  /**
   * Filter suggestions by priority
   */
  filterByPriority(
    suggestions: StorySuggestion[],
    priority: StorySuggestion['priority']
  ): StorySuggestion[] {
    return suggestions.filter(s => s.priority === priority)
  }

  /**
   * Get high priority suggestions
   */
  getHighPriority(suggestions: StorySuggestion[]): StorySuggestion[] {
    return this.filterByPriority(suggestions, 'high')
  }

  /**
   * Sort suggestions by priority
   */
  sortByPriority(suggestions: StorySuggestion[]): StorySuggestion[] {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return [...suggestions].sort((a, b) => 
      priorityOrder[b.priority] - priorityOrder[a.priority]
    )
  }
}

// Export singleton instance
export const storySuggestionsEngine = StorySuggestionsEngine.getInstance()

