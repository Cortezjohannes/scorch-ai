/**
 * Character Visual Consistency Service
 * 
 * Manages character visual references and ensures consistency across generations
 */

export interface VisualReference {
  imageUrl: string
  style: 'photorealistic' | 'anime' | 'comic' | 'painterly' | 'sketch'
  prompt: string
  generatedAt: Date
  version: number
}

export interface CharacterVisuals {
  characterName: string
  currentReference?: VisualReference
  history: VisualReference[]
  stylePreference?: 'photorealistic' | 'anime' | 'comic' | 'painterly' | 'sketch'
  basePrompt: string // Core description that should remain consistent
}

// ============================================================================
// CHARACTER VISUAL CONSISTENCY SERVICE
// ============================================================================

export class CharacterVisualConsistencyService {
  private static instance: CharacterVisualConsistencyService
  private characterVisuals: Map<string, CharacterVisuals> = new Map()

  static getInstance(): CharacterVisualConsistencyService {
    if (!CharacterVisualConsistencyService.instance) {
      CharacterVisualConsistencyService.instance = new CharacterVisualConsistencyService()
    }
    return CharacterVisualConsistencyService.instance
  }

  /**
   * Build consistent prompt for character image generation
   */
  buildConsistentPrompt(
    characterName: string,
    characterDescription: any,
    style: VisualReference['style'] = 'photorealistic'
  ): string {
    // Extract key visual details
    const physiology = characterDescription.physiology || {}
    const appearance = physiology.appearance || characterDescription.description || ''
    const age = physiology.age || 'adult'
    const gender = physiology.gender || ''
    const build = physiology.build || ''

    // Check if we have an existing base prompt for consistency
    const existing = this.characterVisuals.get(characterName)
    if (existing && existing.basePrompt) {
      return this.enhancePromptWithStyle(existing.basePrompt, style)
    }

    // Build new base prompt
    let basePrompt = `Portrait of ${characterName}`

    if (gender) basePrompt += `, ${gender}`
    if (age) basePrompt += `, ${age}`
    if (build) basePrompt += `, ${build} build`
    if (appearance) basePrompt += `, ${appearance}`

    // Add quality modifiers
    basePrompt += ', high quality, detailed, professional'

    // Store for future consistency
    if (!existing) {
      this.characterVisuals.set(characterName, {
        characterName,
        history: [],
        basePrompt,
        stylePreference: style
      })
    }

    return this.enhancePromptWithStyle(basePrompt, style)
  }

  /**
   * Enhance base prompt with style-specific modifiers
   */
  private enhancePromptWithStyle(basePrompt: string, style: VisualReference['style']): string {
    const styleModifiers = {
      photorealistic: 'photorealistic, cinematic lighting, 8k, ultra detailed, realistic skin texture',
      anime: 'anime style, cel shaded, vibrant colors, manga-inspired',
      comic: 'comic book style, bold lines, dynamic shading, graphic novel aesthetic',
      painterly: 'oil painting style, artistic, brush strokes, impressionistic',
      sketch: 'pencil sketch, hand drawn, artistic lines, grayscale or minimal color'
    }

    return `${basePrompt}, ${styleModifiers[style]}`
  }

  /**
   * Store visual reference for a character
   */
  storeVisualReference(
    characterName: string,
    imageUrl: string,
    prompt: string,
    style: VisualReference['style']
  ): void {
    let visuals = this.characterVisuals.get(characterName)

    if (!visuals) {
      visuals = {
        characterName,
        history: [],
        basePrompt: prompt,
        stylePreference: style
      }
      this.characterVisuals.set(characterName, visuals)
    }

    const reference: VisualReference = {
      imageUrl,
      style,
      prompt,
      generatedAt: new Date(),
      version: visuals.history.length + 1
    }

    visuals.currentReference = reference
    visuals.history.push(reference)

    // Keep only last 10 versions to save memory
    if (visuals.history.length > 10) {
      visuals.history = visuals.history.slice(-10)
    }
  }

  /**
   * Get visual reference for a character
   */
  getVisualReference(characterName: string): VisualReference | undefined {
    return this.characterVisuals.get(characterName)?.currentReference
  }

  /**
   * Get visual history for a character
   */
  getVisualHistory(characterName: string): VisualReference[] {
    return this.characterVisuals.get(characterName)?.history || []
  }

  /**
   * Get preferred style for a character
   */
  getPreferredStyle(characterName: string): VisualReference['style'] | undefined {
    return this.characterVisuals.get(characterName)?.stylePreference
  }

  /**
   * Set style preference for a character
   */
  setStylePreference(characterName: string, style: VisualReference['style']): void {
    const visuals = this.characterVisuals.get(characterName)
    if (visuals) {
      visuals.stylePreference = style
    }
  }

  /**
   * Restore a previous visual version
   */
  restoreVersion(characterName: string, version: number): boolean {
    const visuals = this.characterVisuals.get(characterName)
    if (!visuals) return false

    const versionRef = visuals.history.find(ref => ref.version === version)
    if (!versionRef) return false

    visuals.currentReference = versionRef
    return true
  }

  /**
   * Export visuals for persistence
   */
  exportVisuals(): Record<string, CharacterVisuals> {
    const exported: Record<string, CharacterVisuals> = {}
    this.characterVisuals.forEach((value, key) => {
      exported[key] = value
    })
    return exported
  }

  /**
   * Import visuals from storage
   */
  importVisuals(data: Record<string, CharacterVisuals>): void {
    Object.entries(data).forEach(([key, value]) => {
      this.characterVisuals.set(key, value)
    })
  }

  /**
   * Get global style setting for all characters
   */
  getGlobalStylePreference(): VisualReference['style'] | null {
    // Check if all characters use the same style
    const styles = new Set<VisualReference['style']>()
    this.characterVisuals.forEach(visuals => {
      if (visuals.stylePreference) {
        styles.add(visuals.stylePreference)
      }
    })

    return styles.size === 1 ? Array.from(styles)[0] : null
  }

  /**
   * Set global style for all characters
   */
  setGlobalStylePreference(style: VisualReference['style']): void {
    this.characterVisuals.forEach(visuals => {
      visuals.stylePreference = style
    })
  }
}

// Export singleton instance
export const characterVisualConsistency = CharacterVisualConsistencyService.getInstance()

