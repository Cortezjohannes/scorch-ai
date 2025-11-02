/**
 * Canon Validator Service
 * 
 * Validates edits against established canon to prevent contradictions
 */

import { generateContentWithGemini } from './gemini-ai'

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationWarning {
  id: string
  type: 'character_trait' | 'world_rule' | 'timeline' | 'relationship' | 'general'
  severity: 'low' | 'medium' | 'high'
  message: string
  conflictingContent: string
  suggestion: string
  canOverride: boolean
}

export interface ValidationResult {
  valid: boolean
  warnings: ValidationWarning[]
  suggestions: string[]
  confidence: number // 0-100
}

// ============================================================================
// CANON VALIDATOR SERVICE
// ============================================================================

export class CanonValidatorService {
  private static instance: CanonValidatorService

  static getInstance(): CanonValidatorService {
    if (!CanonValidatorService.instance) {
      CanonValidatorService.instance = new CanonValidatorService()
    }
    return CanonValidatorService.instance
  }

  /**
   * Validate a story bible edit against canon
   */
  async validateEdit(
    field: string,
    oldValue: any,
    newValue: any,
    fullStoryBible: any,
    episodes: any[] = []
  ): Promise<ValidationResult> {
    console.log(`🔍 Validating edit to ${field}...`)

    try {
      const prompt = this.buildValidationPrompt(field, oldValue, newValue, fullStoryBible, episodes)
      const response = await generateContentWithGemini('You are a story consistency validator. Detect contradictions and maintain narrative coherence.', prompt)
      const result = this.parseValidationResponse(response)
      
      console.log(`✅ Validation complete: ${result.valid ? 'VALID' : 'WARNINGS FOUND'}`)
      return result
    } catch (error) {
      console.error('Error validating edit:', error)
      return {
        valid: true,
        warnings: [],
        suggestions: [],
        confidence: 0
      }
    }
  }

  /**
   * Run full consistency check on story bible
   */
  async runFullConsistencyCheck(
    storyBible: any,
    episodes: any[] = []
  ): Promise<ValidationResult> {
    console.log('🔍 Running full consistency check...')

    try {
      const prompt = this.buildFullCheckPrompt(storyBible, episodes)
      const response = await generateContentWithGemini('You are a story consistency validator. Detect contradictions and maintain narrative coherence.', prompt)
      const result = this.parseValidationResponse(response)
      
      console.log(`✅ Full check complete: ${result.warnings.length} issue(s) found`)
      return result
    } catch (error) {
      console.error('Error running consistency check:', error)
      return {
        valid: true,
        warnings: [],
        suggestions: [],
        confidence: 0
      }
    }
  }

  /**
   * Build validation prompt for a specific edit
   */
  private buildValidationPrompt(
    field: string,
    oldValue: any,
    newValue: any,
    storyBible: any,
    episodes: any[]
  ): string {
    return `You are a story consistency validator. Analyze this proposed edit to detect potential contradictions with established canon.

FIELD BEING EDITED: ${field}

OLD VALUE:
${JSON.stringify(oldValue, null, 2)}

NEW VALUE:
${JSON.stringify(newValue, null, 2)}

FULL STORY BIBLE CONTEXT:
${JSON.stringify(storyBible, null, 2)}

EPISODES GENERATED: ${episodes.length}
${episodes.slice(0, 3).map(ep => `Episode ${ep.episodeNumber}: ${ep.title}`).join('\n')}
${episodes.length > 3 ? '...' : ''}

TASK:
1. Identify any contradictions between the new value and established canon
2. Check if this change affects already-generated episodes
3. Detect timeline inconsistencies
4. Flag character trait changes that contradict previous behavior
5. Identify world rule violations

Return ONLY valid JSON in this format:
{
  "valid": true/false,
  "warnings": [
    {
      "id": "warning-1",
      "type": "character_trait/world_rule/timeline/relationship/general",
      "severity": "low/medium/high",
      "message": "Clear description of the conflict",
      "conflictingContent": "Quote the conflicting existing content",
      "suggestion": "How to resolve this conflict",
      "canOverride": true/false
    }
  ],
  "suggestions": [
    "General suggestion for maintaining consistency"
  ],
  "confidence": 85
}

If there are no conflicts, return valid=true with empty warnings array.
Severity levels:
- low: Minor inconsistency, probably fine
- medium: Notable contradiction, needs review
- high: Major canon violation, should be reconsidered`
  }

  /**
   * Build prompt for full consistency check
   */
  private buildFullCheckPrompt(storyBible: any, episodes: any[]): string {
    return `You are a story consistency validator. Analyze this entire story bible for internal contradictions and inconsistencies.

STORY BIBLE:
${JSON.stringify(storyBible, null, 2)}

EPISODES GENERATED: ${episodes.length}

TASK:
Analyze the story bible for:
1. Character contradictions (traits, backstory, arcs that don't align)
2. World building inconsistencies (rules that contradict each other)
3. Timeline problems (event order, character ages, chronology issues)
4. Relationship contradictions (relationships that don't make sense together)
5. Theme/tone misalignments

Return ONLY valid JSON in the same format as the edit validation, listing all found issues.

Focus on real contradictions, not minor stylistic differences.`
  }

  /**
   * Parse AI validation response
   */
  private parseValidationResponse(response: string): ValidationResult {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        valid: parsed.valid !== false,
        warnings: (parsed.warnings || []).map((w: any, idx: number) => ({
          id: w.id || `warning-${idx}`,
          type: w.type || 'general',
          severity: w.severity || 'medium',
          message: w.message || 'Potential inconsistency detected',
          conflictingContent: w.conflictingContent || '',
          suggestion: w.suggestion || '',
          canOverride: w.canOverride !== false
        })),
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 75
      }
    } catch (error) {
      console.error('Error parsing validation response:', error)
      return {
        valid: true,
        warnings: [],
        suggestions: [],
        confidence: 0
      }
    }
  }

  /**
   * Quick validation helpers
   */
  
  validateCharacterTrait(
    characterName: string,
    traitField: string,
    newValue: any,
    storyBible: any
  ): boolean {
    // Simple check: does character exist and have this trait defined
    const character = (storyBible.characters || []).find(
      (c: any) => c.name === characterName
    )

    if (!character) return true // New character, no conflicts
    
    const oldValue = character[traitField]
    if (!oldValue) return true // Trait not previously defined

    // If significantly different, flag for AI validation
    return oldValue === newValue
  }

  validateTimelineOrder(events: any[]): boolean {
    // Check if events are in chronological order by episode number
    for (let i = 1; i < events.length; i++) {
      if (events[i].episodeNumber < events[i - 1].episodeNumber) {
        return false
      }
    }
    return true
  }

  validateWorldRule(newRule: string, existingRules: string[]): boolean {
    // Basic check for obvious contradictions
    const contradictionKeywords = ['never', 'always', 'impossible', 'forbidden', 'required']
    const newRuleLower = newRule.toLowerCase()
    
    return !existingRules.some(rule => {
      const ruleLower = rule.toLowerCase()
      return contradictionKeywords.some(keyword => 
        newRuleLower.includes(keyword) && ruleLower.includes(keyword)
      )
    })
  }
}

// Export singleton instance
export const canonValidator = CanonValidatorService.getInstance()

