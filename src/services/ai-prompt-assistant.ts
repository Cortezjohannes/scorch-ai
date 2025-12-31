/**
 * AI Prompt Assistant Service
 * 
 * Provides AI-powered content generation for story bible elements
 * Returns multiple options for user selection and customization
 */

import { generateContentWithGemini } from './gemini-ai'

// ============================================================================
// TYPES
// ============================================================================

export interface AIOption {
  id: string
  content: any
  reasoning: string
  confidence: number // 0-100
}

export interface AIGenerationResult {
  options: AIOption[]
  prompt: string
  timestamp: Date
}

export interface CharacterSectionData {
  name?: string
  archetype?: string
  premiseFunction?: string
  existingData?: any
}

export interface WorldBuildingContext {
  seriesTitle?: string
  genre?: string
  theme?: string
  existingWorld?: any
}

export interface StoryArcContext {
  storyBible: any
  existingArcs?: any[]
  arcNumber?: number
}

// ============================================================================
// AI PROMPT ASSISTANT SERVICE
// ============================================================================

export class AIPromptAssistant {
  private static instance: AIPromptAssistant

  static getInstance(): AIPromptAssistant {
    if (!AIPromptAssistant.instance) {
      AIPromptAssistant.instance = new AIPromptAssistant()
    }
    return AIPromptAssistant.instance
  }

  /**
   * Generate character section content with 3 variants
   */
  async generateCharacterSection(
    existingData: CharacterSectionData,
    sectionType: 'physiology' | 'sociology' | 'psychology' | 'backstory' | 'voiceProfile',
    userPrompt: string
  ): Promise<AIGenerationResult> {
    console.log(`🎭 Generating character ${sectionType} with AI...`)

    const systemPrompt = this.buildCharacterSectionPrompt(existingData, sectionType, userPrompt)
    
    try {
      const response = await generateContentWithGemini('You are an expert story consultant helping writers create rich characters and worlds.', systemPrompt)
      const parsed = this.parseMultipleOptions(response, sectionType)
      
      return {
        options: parsed,
        prompt: systemPrompt,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error generating character section:', error)
      return this.getFallbackOptions(sectionType)
    }
  }

  /**
   * Generate world building element with 3 variants
   */
  async generateWorldBuildingElement(
    context: WorldBuildingContext,
    elementType: 'setting' | 'rules' | 'location' | 'culture' | 'history',
    userPrompt: string
  ): Promise<AIGenerationResult> {
    console.log(`🌍 Generating world building ${elementType} with AI...`)

    const systemPrompt = this.buildWorldBuildingPrompt(context, elementType, userPrompt)
    
    try {
      const response = await generateContentWithGemini('You are an expert story consultant helping writers create rich characters and worlds.', systemPrompt)
      const parsed = this.parseMultipleOptions(response, elementType)
      
      return {
        options: parsed,
        prompt: systemPrompt,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error generating world building:', error)
      return this.getFallbackOptions(elementType)
    }
  }

  /**
   * Generate story arc with 3 narrative paths
   */
  async generateStoryArc(
    context: StoryArcContext,
    arcPrompt: string,
    existingArcs: any[] = []
  ): Promise<AIGenerationResult> {
    console.log('📚 Generating story arc with AI...')

    const systemPrompt = this.buildStoryArcPrompt(context, arcPrompt, existingArcs)
    
    try {
      const response = await generateContentWithGemini('You are an expert story consultant helping writers create rich characters and worlds.', systemPrompt)
      const parsed = this.parseMultipleOptions(response, 'arc')
      
      return {
        options: parsed,
        prompt: systemPrompt,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error generating story arc:', error)
      return this.getFallbackOptions('arc')
    }
  }

  /**
   * Enrich dialogue profile with 3 voice patterns
   */
  async enrichDialogueProfile(
    characterData: any,
    stylePrompt: string
  ): Promise<AIGenerationResult> {
    console.log('💬 Generating dialogue profile with AI...')

    const systemPrompt = this.buildDialogueProfilePrompt(characterData, stylePrompt)
    
    try {
      const response = await generateContentWithGemini('You are an expert story consultant helping writers create rich characters and worlds.', systemPrompt)
      const parsed = this.parseMultipleOptions(response, 'dialogue')
      
      return {
        options: parsed,
        prompt: systemPrompt,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error generating dialogue profile:', error)
      return this.getFallbackOptions('dialogue')
    }
  }

  /**
   * Expand world rules with 3 variants
   */
  async expandWorldRules(
    worldBuilding: any,
    rulesPrompt: string
  ): Promise<AIGenerationResult> {
    console.log('📜 Expanding world rules with AI...')

    const systemPrompt = this.buildWorldRulesPrompt(worldBuilding, rulesPrompt)
    
    try {
      const response = await generateContentWithGemini('You are an expert story consultant helping writers create rich characters and worlds.', systemPrompt)
      const parsed = this.parseMultipleOptions(response, 'rules')
      
      return {
        options: parsed,
        prompt: systemPrompt,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error expanding world rules:', error)
      return this.getFallbackOptions('rules')
    }
  }

  // ============================================================================
  // PROMPT BUILDERS
  // ============================================================================

  private buildCharacterSectionPrompt(
    data: CharacterSectionData,
    sectionType: string,
    userPrompt: string
  ): string {

    // Extract story context from existingData if available
    const storyContext = data.existingData?.storyContext || {}
    const genre = storyContext.genre || 'general'
    const tone = storyContext.tone || 'balanced'
    const theme = storyContext.theme || 'personal growth'
    const existingCharacters = storyContext.mainCharacters || []
    const locations = storyContext.worldBuilding?.locations || []

    const baseContext = `
CHARACTER PROFILE:
Name: ${data.name || 'Unnamed Character'}
Archetype: ${data.archetype || 'Not specified'}
Premise Function: ${data.premiseFunction || 'Not specified'}

STORY CONTEXT:
Genre: ${genre}
Tone: ${tone}
Theme: ${theme}
Setting: ${locations.map((l: any) => l.name).join(', ') || 'Various locations'}
Existing Characters: ${existingCharacters.map((c: any) => `${c.name} (${c.archetype})`).join(', ') || 'None'}

USER REQUEST: ${userPrompt}

CURRENT CHARACTER DATA: ${JSON.stringify(data.existingData || {}, null, 2)}
`

    const sectionInstructions = {
      physiology: `Generate 3 distinct PHYSIOLOGY profiles that serve the character's story function.

CRITICAL REQUIREMENTS:
• Age appropriate for ${genre} genre (avoid cliché ages like 25, 42, etc.)
• Physical traits that reflect their ${data.archetype || 'character'} archetype
• Health and build that support their premise function: "${data.premiseFunction || ''}"
• Distinctive features that make them memorable in a ${genre} story
• Gender presentation that feels authentic and purposeful

Each option should include: age, gender, appearance, height, build, health, physicalTraits (array), defects (if relevant), heredity.

AVOID CLICHÉS: No "tall, dark, handsome" men or "petite, beautiful" women. Make each profile unique and story-serving.`,

      sociology: `Generate 3 distinct SOCIOLOGY backgrounds that create compelling conflict opportunities.

CRITICAL REQUIREMENTS:
• Social class and occupation that intersect with the story's ${theme} theme
• Education level that supports their ${data.archetype || 'character'} archetype
• Economic status that creates tension or opportunity in a ${genre} story
• Community standing that affects their relationships with existing characters
• Cultural/political affiliations that matter to the plot

Each option should include: class, occupation, education, homeLife, religion, race, nationality, politicalAffiliation, hobbies, communityStanding, economicStatus, familyRelationships.

CONSIDER EXISTING CAST: ${existingCharacters.map((c: any) => c.name).join(', ') || 'No existing characters'} - create backgrounds that complement rather than duplicate.`,

      psychology: `Generate 3 distinct PSYCHOLOGY profiles using Egri's 3D character model with Want vs Need arcs.

CRITICAL REQUIREMENTS:
• Core value that opposes or complements the story's ${theme} theme
• Want vs Need psychology: external goal vs internal lesson they must learn
• Primary flaw that creates obstacles and drives character growth
• Temperament and attitude that make them compelling in a ${tone} story
• Fears and ambitions that connect to their premise function

Each option should include: coreValue, opposingValue, moralStandpoint, want, need, primaryFlaw, secondaryFlaws, temperament (array), attitude, complexes, ambitions, frustrations, fears, superstitions, likes, dislikes, iq, abilities, talents, childhood, trauma, successes.

ENSURE PSYCHOLOGICAL DEPTH: Each profile should feel like a real person with internal conflict and growth potential.`,

      backstory: `Generate 3 distinct BACKSTORY narratives (2-3 paragraphs each) that explain character development.

CRITICAL REQUIREMENTS:
• Backstory that explains HOW they developed their core psychology
• Key formative events that shaped their ${data.archetype || 'character'} archetype
• Experiences that justify their premise function: "${data.premiseFunction || ''}"
• Connections to the story's ${theme} theme and ${genre} genre elements
• Emotional resonance that makes readers care about their journey

Each backstory should be 2-3 paragraphs, emotionally engaging, and rich with specific details that feel earned rather than contrived.

AVOID TROPE HEAVY BACKSTORIES: No "lost their family in a fire" unless it serves a unique purpose. Make each backstory distinctive and character-specific.`,

      voiceProfile: `Generate 3 distinct VOICE PROFILES that reveal character personality through speech.

CRITICAL REQUIREMENTS:
• Speech pattern that reflects their social background and psychology
• Vocabulary level appropriate for their education and occupation
• Unique quirks that make their dialogue memorable and distinctive
• Voice characteristics that serve their ${data.archetype || 'character'} archetype
• Accent/dialect that fits their background and story setting

Each option should include: vocabulary, rhythm, catchphrases, uniqueExpressions, accent, voiceNotes.

MAKE THEM DISTINCTIVE: Avoid generic "confident" or "hesitant" - be specific about HOW they speak that reveals their inner world.`
    }

    const qualityGuidelines = `
QUALITY GUIDELINES:
• Each option must be substantively different, not minor variations
• Consider how this section affects the character's relationships with: ${existingCharacters.map((c: any) => c.name).join(', ') || 'other characters'}
• Ensure consistency with established character traits and story requirements
• Make choices that create interesting story possibilities, not just "cool" elements
• Balance realism with genre expectations for ${genre} stories

CONFIDENCE SCORING:
• 95-100: Perfect fit for character and story
• 85-94: Good fit with minor considerations
• 70-84: Acceptable but could be improved
• <70: Not recommended

Return ONLY valid JSON in this exact format:
{
  "options": [
    {
      "id": "option-1",
      "content": { /* section-specific data */ },
      "reasoning": "Why this option works for the character and story (2-3 sentences)",
      "confidence": 90
    },
    {
      "id": "option-2",
      "content": { /* section-specific data */ },
      "reasoning": "Why this option works for the character and story (2-3 sentences)",
      "confidence": 88
    },
    {
      "id": "option-3",
      "content": { /* section-specific data */ },
      "reasoning": "Why this option works for the character and story (2-3 sentences)",
      "confidence": 85
    }
  ]
}`

    return `${baseContext}

${sectionInstructions[sectionType as keyof typeof sectionInstructions]}

${qualityGuidelines}`
  }

  private buildWorldBuildingPrompt(
    context: WorldBuildingContext,
    elementType: string,
    userPrompt: string
  ): string {
    const baseContext = `
Series: ${context.seriesTitle || 'Untitled'}
Genre: ${context.genre || 'Not specified'}
Theme: ${context.theme || 'Not specified'}

User Request: ${userPrompt}

Existing World: ${JSON.stringify(context.existingWorld || {}, null, 2)}
`

    const elementInstructions = {
      setting: `Generate 3 distinct SETTING descriptions (2-3 paragraphs each).
Each should establish the world's physical environment, atmosphere, and key locations.
Vary the scope and focus - one broad, one specific, one atmospheric.`,
      
      rules: `Generate 3 distinct sets of WORLD RULES.
Each should define how the world operates (laws of nature, magic systems, social structures, technology level).
Make them internally consistent but offer different power levels or complexities.`,
      
      location: `Generate 3 distinct LOCATION descriptions.
Each should include: name, type, description, significance, atmosphere, key features.
Make them varied in scope and purpose - one major, one intimate, one mysterious.`,
      
      culture: `Generate 3 distinct CULTURAL FRAMEWORKS.
Each should include: values, customs, social norms, taboos, celebrations, hierarchy.
Make them culturally rich and distinct from each other.`,
      
      history: `Generate 3 distinct HISTORICAL BACKGROUNDS (2-3 paragraphs each).
Each should explain the world's past, major events, and how they shaped the present.
Vary the tone - one tragic, one triumphant, one mysterious.`
    }

    return `${baseContext}

${elementInstructions[elementType as keyof typeof elementInstructions]}

Return ONLY valid JSON in this exact format:
{
  "options": [
    {
      "id": "option-1",
      "content": { /* element-specific data */ },
      "reasoning": "Why this option enriches the world",
      "confidence": 85
    },
    {
      "id": "option-2",
      "content": { /* element-specific data */ },
      "reasoning": "Why this option enriches the world",
      "confidence": 90
    },
    {
      "id": "option-3",
      "content": { /* element-specific data */ },
      "reasoning": "Why this option enriches the world",
      "confidence": 88
    }
  ]
}`
  }

  private buildStoryArcPrompt(
    context: StoryArcContext,
    arcPrompt: string,
    existingArcs: any[]
  ): string {
    return `
Story Bible Context:
Series: ${context.storyBible?.seriesTitle || 'Untitled'}
Genre: ${context.storyBible?.genre || 'Not specified'}
Theme: ${context.storyBible?.theme || 'Not specified'}

Existing Arcs: ${existingArcs.map((arc, i) => `Arc ${i + 1}: ${arc.arcTitle || arc.name}`).join(', ')}

User Request: ${arcPrompt}

Generate 3 distinct NARRATIVE ARC paths. Each should include:
- arcTitle: Compelling title for this arc
- description: What this arc is about (2-3 sentences)
- episodes: Suggested episode range (e.g., "1-5")
- keyEvents: Array of 3-5 major plot points
- characterFocus: Which characters drive this arc
- thematicPurpose: How this arc serves the overall theme
- emotionalJourney: The emotional arc from beginning to end

Make each arc distinctly different in tone, focus, and narrative approach.

Return ONLY valid JSON in this exact format:
{
  "options": [
    {
      "id": "option-1",
      "content": { /* arc data */ },
      "reasoning": "Why this arc works for the story",
      "confidence": 85
    },
    {
      "id": "option-2",
      "content": { /* arc data */ },
      "reasoning": "Why this arc works for the story",
      "confidence": 90
    },
    {
      "id": "option-3",
      "content": { /* arc data */ },
      "reasoning": "Why this arc works for the story",
      "confidence": 88
    }
  ]
}`
  }

  private buildDialogueProfilePrompt(
    characterData: any,
    stylePrompt: string
  ): string {
    return `
Character: ${characterData.name || 'Unnamed'}
Archetype: ${characterData.archetype || 'Not specified'}
Background: ${JSON.stringify(characterData.sociology || {}, null, 2)}
Psychology: ${JSON.stringify(characterData.psychology || {}, null, 2)}

User Request: ${stylePrompt}

Generate 3 distinct DIALOGUE/VOICE PROFILES for this character. Each should include:
- speechPattern: How they structure sentences and speak
- vocabulary: Their word choice level and style
- quirks: Array of 3-5 unique verbal tics, phrases, or habits
- exampleDialogue: 2-3 example lines showing the voice in action

Make each profile distinctly different - vary formality, rhythm, and personality.

Return ONLY valid JSON in this exact format:
{
  "options": [
    {
      "id": "option-1",
      "content": {
        "speechPattern": "...",
        "vocabulary": "...",
        "quirks": ["...", "...", "..."],
        "exampleDialogue": ["...", "...", "..."]
      },
      "reasoning": "Why this voice fits the character",
      "confidence": 85
    },
    {
      "id": "option-2",
      "content": { /* voice profile */ },
      "reasoning": "Why this voice fits the character",
      "confidence": 90
    },
    {
      "id": "option-3",
      "content": { /* voice profile */ },
      "reasoning": "Why this voice fits the character",
      "confidence": 88
    }
  ]
}`
  }

  private buildWorldRulesPrompt(
    worldBuilding: any,
    rulesPrompt: string
  ): string {
    return `
Existing World:
${JSON.stringify(worldBuilding, null, 2)}

User Request: ${rulesPrompt}

Generate 3 distinct sets of WORLD RULES that expand or clarify how this world operates.
Each should include detailed rules about physics, magic, technology, social structures, or other defining aspects.

Make them internally consistent with existing world building but offer different levels of complexity or focus areas.

Return ONLY valid JSON in this exact format:
{
  "options": [
    {
      "id": "option-1",
      "content": "Detailed rules description...",
      "reasoning": "Why these rules enhance the world",
      "confidence": 85
    },
    {
      "id": "option-2",
      "content": "Detailed rules description...",
      "reasoning": "Why these rules enhance the world",
      "confidence": 90
    },
    {
      "id": "option-3",
      "content": "Detailed rules description...",
      "reasoning": "Why these rules enhance the world",
      "confidence": 88
    }
  ]
}`
  }

  // ============================================================================
  // PARSING & FALLBACKS
  // ============================================================================

  private parseMultipleOptions(response: string, sectionType: string): AIOption[] {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      if (parsed.options && Array.isArray(parsed.options)) {
        return parsed.options.map((opt: any, idx: number) => ({
          id: opt.id || `option-${idx + 1}`,
          content: opt.content,
          reasoning: opt.reasoning || 'AI-generated option',
          confidence: opt.confidence || 75
        }))
      }

      throw new Error('Invalid options format')
    } catch (error) {
      console.error('Error parsing AI response:', error)
      console.log('Raw response:', response.substring(0, 500))
      return this.getFallbackOptions(sectionType).options
    }
  }

  private getFallbackOptions(sectionType: string): AIGenerationResult {
    const fallbacks: Record<string, AIOption[]> = {
      physiology: [
        {
          id: 'fallback-1',
          content: {
            age: '25-35',
            gender: 'To be determined',
            appearance: 'Average build, unremarkable features',
            build: 'Average',
            health: 'Good',
            physicalTraits: []
          },
          reasoning: 'Neutral baseline physiology',
          confidence: 50
        }
      ],
      sociology: [
        {
          id: 'fallback-1',
          content: {
            class: 'Middle class',
            occupation: 'To be determined',
            education: 'High school or equivalent',
            homeLife: 'Stable',
            economicStatus: 'Comfortable',
            communityStanding: 'Average'
          },
          reasoning: 'Neutral baseline sociology',
          confidence: 50
        }
      ],
      psychology: [
        {
          id: 'fallback-1',
          content: {
            coreValue: 'To be defined',
            moralStandpoint: 'Neutral good',
            want: 'To be defined',
            need: 'To be defined',
            primaryFlaw: 'To be defined',
            temperament: ['Balanced'],
            enneagramType: 'Type 9',
            fears: ['Loss', 'Failure'],
            strengths: ['Determination', 'Adaptability']
          },
          reasoning: 'Neutral baseline psychology',
          confidence: 50
        }
      ],
      default: [
        {
          id: 'fallback-1',
          content: 'AI generation temporarily unavailable. Please try again or enter manually.',
          reasoning: 'Fallback option',
          confidence: 50
        }
      ]
    }

    return {
      options: fallbacks[sectionType] || fallbacks.default,
      prompt: 'Fallback generation',
      timestamp: new Date()
    }
  }
}

// Export singleton instance
export const aiPromptAssistant = AIPromptAssistant.getInstance()

