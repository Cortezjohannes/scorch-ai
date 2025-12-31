/**
 * Unified Character Creator Service
 *
 * Consolidates all character generation engines into a single, mode-aware service
 * Supports 3 complexity modes: minimal, balanced, detailed
 */

import {
  CharacterComplexity,
  CharacterRole,
  UnifiedCharacter,
  CharacterGenerationOptions,
  CharacterGenerationResult,
  CharacterCore,
  CharacterBasic,
  CharacterBalanced,
  CharacterDetailed,
  SimplifiedPhysiology,
  CorePsychology,
  BasicVoice,
  CharacterUpgradeDirection
} from '@/types/unified-character'
import { StoryBible } from '@/services/story-bible-service'
import type { StoryPremise } from './premise-engine'
import { generateAIContent, generateStructuredAIContent } from './unified-ai-generator'
import { AIPromptAssistant } from './ai-prompt-assistant'

export class CharacterCreatorUnified {

  private static instance: CharacterCreatorUnified
  private aiAssistant: AIPromptAssistant

  static getInstance(): CharacterCreatorUnified {
    if (!CharacterCreatorUnified.instance) {
      CharacterCreatorUnified.instance = new CharacterCreatorUnified()
    }
    return CharacterCreatorUnified.instance
  }

  private constructor() {
    this.aiAssistant = AIPromptAssistant.getInstance()
  }

  /**
   * MAIN ENTRY POINT: Generate character with mode-aware logic
   */
  async generateCharacter(
    mode: CharacterComplexity,
    userInput: Partial<UnifiedCharacter>,
    storyContext: StoryBible,
    options: CharacterGenerationOptions = {}
  ): Promise<CharacterGenerationResult> {

    console.log(`🎭 [Unified Creator] Generating ${mode} character: ${userInput.name || 'Unnamed'}`)

    try {
    switch (mode) {
      case 'minimal':
          return await this.generateMinimalCharacter(userInput, storyContext, options)

      case 'balanced':
          return await this.generateBalancedCharacter(userInput, storyContext, options)

      case 'detailed':
          return await this.generateDetailedCharacter(userInput, storyContext, options)

      default:
        throw new Error(`Unknown character complexity mode: ${mode}`)
      }
    } catch (error) {
      console.error(`❌ [Unified Creator] Generation failed:`, error)

      // Return fallback character
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        character: this.createFallbackCharacter(userInput, mode, storyContext),
        confidence: 0,
        reasoning: `Generation failed: ${errorMessage}`
      }
    }
  }

  /**
   * MINIMAL MODE: User provides minimal input, AI generates FULL 3D character
   */
  private async generateMinimalCharacter(
    userInput: Partial<UnifiedCharacter>,
    storyContext: StoryBible,
    options: CharacterGenerationOptions
  ): Promise<CharacterGenerationResult> {

    console.log('🎨 [MINIMAL MODE] Starting FULL 3D character generation...')
    console.log('   Input name:', userInput.name)
    console.log('   Input role:', userInput.role)
    console.log('   Input description:', userInput.basic?.description)

    // Use CharacterEngineV2 to generate FULL 3D character
    // User only provides minimal input, but output is always full quality
    const characterConcept = userInput.basic?.description || userInput.name || 'A complex character'
    const role = userInput.role || 'protagonist'

    console.log('🎨 [MINIMAL MODE] Using CharacterEngineV2 for full 3D generation...')
    
    const detailedResult = await this.generateDetailed3DCharacter(userInput, storyContext, options)
    console.log('✅ [MINIMAL MODE] Full 3D character generated:', detailedResult.name)
    console.log('🔍 [MINIMAL MODE] Name check - userInput.name:', userInput.name, '| detailedResult.name:', detailedResult.name)

    // CRITICAL: ALWAYS use user-provided name if available
    const finalName = userInput.name || detailedResult.name || 'Unnamed'
    if (userInput.name && detailedResult.name !== userInput.name) {
      console.warn(`⚠️ [MINIMAL MODE] AI generated name "${detailedResult.name}" but using user-provided name "${userInput.name}"`)
    }

    // Generate descriptive character title/archetype
    const descriptiveTitle = await this.generateDescriptiveCharacterTitle(
      finalName,
      detailedResult,
      userInput,
      storyContext
    )

    const character: UnifiedCharacter = {
      id: this.generateId(),
      name: finalName, // ALWAYS prioritize user-provided name
      role: (userInput.role || detailedResult.role || 'protagonist') as CharacterRole,
      complexity: 'minimal', // Mode is about input, not output
      basic: {
        description: detailedResult.psychology.childhood || userInput.basic?.description || '',
        archetype: descriptiveTitle,
        premiseFunction: descriptiveTitle
      },
      balanced: {
        physiology: this.convertToSimplifiedPhysiology(detailedResult.physiology),
        psychology: this.convertToCorePsychology(detailedResult.psychology, detailedResult),
        backstory: detailedResult.psychology.childhood,
        voiceProfile: this.convertToBasicVoice(detailedResult.voice)
      },
      detailed: {
        fullPhysiology: detailedResult.physiology,
        fullSociology: detailedResult.sociology,
        fullPsychology: detailedResult.psychology,
        characterEvolution: detailedResult.transformationStages || [],
        relationships: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiGenerated: true,
      lastEditedBy: 'ai'
    }

    // Enrich character with missing fields
    const enrichedCharacter = await this.enrichCharacterFields(character, userInput, storyContext, detailedResult)

    return {
      character: enrichedCharacter,
      confidence: 0.95,
      reasoning: 'Full 3D character generated from minimal user input'
    }
  }

  /**
   * BALANCED MODE: User provides balanced input, AI generates FULL 3D character
   */
  private async generateBalancedCharacter(
    userInput: Partial<UnifiedCharacter>,
    storyContext: StoryBible,
    options: CharacterGenerationOptions
  ): Promise<CharacterGenerationResult> {

    console.log('🎨 [BALANCED MODE] Starting FULL 3D character generation...')
    console.log('   User provided more detailed input, using CharacterEngineV2...')

    // Use CharacterEngineV2 to generate FULL 3D character
    // User provides more input, but output is still full quality
    const characterConcept = userInput.basic?.description || 
                            (userInput.balanced?.physiology?.appearance ? 
                              `${userInput.name || 'Character'}: ${userInput.balanced.physiology.appearance}` : 
                              userInput.name) || 
                            'A complex character'

    console.log('🎨 [BALANCED MODE] Using CharacterEngineV2 for full 3D generation...')
    
    const detailedResult = await this.generateDetailed3DCharacter(userInput, storyContext, options)
    console.log('✅ [BALANCED MODE] Full 3D character generated:', detailedResult.name)
    console.log('🔍 [BALANCED MODE] Name check - userInput.name:', userInput.name, '| detailedResult.name:', detailedResult.name)

    // CRITICAL: ALWAYS use user-provided name if available, regardless of what AI generated
    const finalName = userInput.name || detailedResult.name || 'Unnamed'
    if (userInput.name && detailedResult.name !== userInput.name) {
      console.warn(`⚠️ [BALANCED MODE] AI generated name "${detailedResult.name}" but using user-provided name "${userInput.name}"`)
    }

    // Generate descriptive character title/archetype
    const descriptiveTitle = await this.generateDescriptiveCharacterTitle(
      finalName,
      detailedResult,
      userInput,
      storyContext
    )

    const character: UnifiedCharacter = {
      id: this.generateId(),
      name: finalName, // ALWAYS prioritize user-provided name
      role: (userInput.role || detailedResult.role || 'protagonist') as CharacterRole,
      complexity: 'balanced', // Mode is about input, not output
      basic: {
        description: detailedResult.psychology.childhood || userInput.basic?.description || '',
        archetype: descriptiveTitle,
        premiseFunction: descriptiveTitle
      },
      balanced: {
        // Merge user-provided physiology with AI-generated, prioritizing user input
        physiology: {
          ...this.convertToSimplifiedPhysiology(detailedResult.physiology),
          // Override with user-provided values if they exist
          ...(userInput.balanced?.physiology?.age && { age: userInput.balanced.physiology.age }),
          ...(userInput.balanced?.physiology?.gender && { gender: userInput.balanced.physiology.gender }),
          ...(userInput.balanced?.physiology?.appearance && { appearance: userInput.balanced.physiology.appearance }),
          ...(userInput.balanced?.physiology?.build && { build: userInput.balanced.physiology.build }),
          ...(userInput.balanced?.physiology?.health && { health: userInput.balanced.physiology.health }),
          ...(userInput.balanced?.physiology?.keyTraits && { keyTraits: userInput.balanced.physiology.keyTraits })
        },
        // Merge user-provided psychology with AI-generated, prioritizing user input
        psychology: {
          ...this.convertToCorePsychology(detailedResult.psychology, detailedResult),
          // Override with user-provided values if they exist
          ...(userInput.balanced?.psychology?.coreValue && { coreValue: userInput.balanced.psychology.coreValue }),
          ...(userInput.balanced?.psychology?.want && { want: userInput.balanced.psychology.want }),
          ...(userInput.balanced?.psychology?.need && { need: userInput.balanced.psychology.need }),
          ...(userInput.balanced?.psychology?.primaryFlaw && { primaryFlaw: userInput.balanced.psychology.primaryFlaw })
        },
        backstory: userInput.balanced?.backstory || detailedResult.psychology.childhood || '',
        // Merge user-provided voice with AI-generated, prioritizing user input
        voiceProfile: {
          ...this.convertToBasicVoice(detailedResult.voice),
          ...(userInput.balanced?.voiceProfile?.speechPattern && { speechPattern: userInput.balanced.voiceProfile.speechPattern })
        }
      },
      detailed: {
        fullPhysiology: detailedResult.physiology,
        fullSociology: detailedResult.sociology,
        fullPsychology: detailedResult.psychology,
        characterEvolution: detailedResult.transformationStages || [],
        relationships: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiGenerated: true,
      lastEditedBy: 'ai'
    }

    // Enrich character with missing fields
    const enrichedCharacter = await this.enrichCharacterFields(character, userInput, storyContext, detailedResult)

    return {
      character: enrichedCharacter,
      confidence: 0.95,
      reasoning: 'Full 3D character generated from balanced user input'
    }
  }

  /**
   * DETAILED MODE: Full Egri 3D model (5-10 minutes)
   */
  private async generateDetailedCharacter(
    userInput: Partial<UnifiedCharacter>,
    storyContext: StoryBible,
    options: CharacterGenerationOptions
  ): Promise<CharacterGenerationResult> {

    console.log('🎨 [DETAILED MODE] Generating full 3D character using CharacterEngineV2...')
    // Use the existing detailed engine for full 3D character generation
    const detailedResult = await this.generateDetailed3DCharacter(userInput, storyContext, options)
    console.log('✅ [DETAILED MODE] 3D character generated:', detailedResult.name)
    console.log('🔍 [DETAILED MODE] Name check - userInput.name:', userInput.name, '| detailedResult.name:', detailedResult.name)

    // CRITICAL: ALWAYS use user-provided name if available
    const finalName = userInput.name || detailedResult.name || 'Unnamed'
    if (userInput.name && detailedResult.name !== userInput.name) {
      console.warn(`⚠️ [DETAILED MODE] AI generated name "${detailedResult.name}" but using user-provided name "${userInput.name}"`)
    }

    // Generate descriptive character title
    const descriptiveTitle = await this.generateDescriptiveCharacterTitle(
      finalName,
      detailedResult,
      userInput,
      storyContext
    )

    const character: UnifiedCharacter = {
      id: this.generateId(),
      name: finalName, // ALWAYS prioritize user-provided name
      role: (userInput.role || detailedResult.role) as CharacterRole,
      complexity: 'detailed',
      basic: {
        description: detailedResult.psychology.childhood || '',
        archetype: descriptiveTitle,
        premiseFunction: descriptiveTitle
      },
      balanced: {
        physiology: this.convertToSimplifiedPhysiology(detailedResult.physiology),
        psychology: this.convertToCorePsychology(detailedResult.psychology, detailedResult),
        backstory: detailedResult.psychology.childhood,
        voiceProfile: this.convertToBasicVoice(detailedResult.voice)
      },
      detailed: {
        fullPhysiology: detailedResult.physiology,
        fullSociology: detailedResult.sociology,
        fullPsychology: detailedResult.psychology,
        characterEvolution: detailedResult.transformationStages || [],
        relationships: [] // Would be generated separately
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiGenerated: true,
      lastEditedBy: 'ai'
    }

    // Enrich character with missing fields
    const enrichedCharacter = await this.enrichCharacterFields(character, userInput, storyContext, detailedResult)

    return {
      character: enrichedCharacter,
      confidence: 0.95,
      reasoning: 'Full Egri 3D character model'
    }
  }

  // ========================================
  // AI CONTENT GENERATION METHODS
  // ========================================

  private async generateMinimalAIContent(
    name: string,
    role: CharacterRole,
    description: string,
    storyContext: StoryBible
  ): Promise<{
    physiology: SimplifiedPhysiology
    backstory: string
    voiceProfile: BasicVoice
  }> {

    const storyPrompt = this.buildStoryContextPrompt(storyContext)

    const prompt = `Create a character for this story:

CHARACTER: ${name} (${role})
DESCRIPTION: ${description}
${storyPrompt}

Provide the following in a structured format:

AGE: [character's age or age range]
GENDER: [character's gender]
APPEARANCE: [2-3 sentences describing physical appearance and distinctive features]

BACKSTORY:
[One compelling paragraph explaining their background and how they fit into this story world]

SPEECH PATTERN:
[2-3 sentences describing how they speak, vocabulary level, and any distinctive speech quirks]

Keep it concise but vivid and fitting for the story world.`

    try {
      console.log('🎨 [MINIMAL AI] Generating character content for:', name)
      const result = await generateAIContent(prompt, {
        systemPrompt: 'You are a character designer. Create quick, story-fitting characters with vivid details.',
        temperature: 0.7,
        maxTokens: 500
      })
      console.log('✅ [MINIMAL AI] Received AI response:', result.substring(0, 100) + '...')

    return {
        physiology: {
          age: this.extractFromResult(result, 'age') || 'adult',
          gender: this.extractFromResult(result, 'gender') || 'unspecified',
          appearance: this.extractFromResult(result, 'appearance') || description,
          keyTraits: []
        },
        backstory: this.extractBackstory(result),
        voiceProfile: {
          speechPattern: this.extractSpeechPattern(result),
          vocabulary: this.extractVocabulary(result)
        }
      }
    } catch (error) {
      console.error('❌ [MINIMAL AI] Generation failed:', error)
      return this.generateMinimalFallback(name, role)
    }
  }

  private async generateBalancedAIContent(
    name: string,
    role: CharacterRole,
    basic: CharacterBasic,
    storyContext: StoryBible,
    userBalanced?: Partial<CharacterBalanced>
  ): Promise<{
    physiology: SimplifiedPhysiology
    psychology: CorePsychology
    backstory: string
    voiceProfile: BasicVoice
  }> {

    const storyPrompt = this.buildStoryContextPrompt(storyContext)

    const prompt = `Create a rich, balanced character for this story:

CHARACTER: ${name} (${role})
ARCHETYPE: ${basic.archetype}
DESCRIPTION: ${basic.description}
PREMISE FUNCTION: ${basic.premiseFunction}
${storyPrompt}

${userBalanced ? `USER INPUT:
- Appearance: ${userBalanced.physiology?.appearance || 'Not specified'}
- Key trait/flaw: ${userBalanced.psychology?.primaryFlaw || 'Not specified'}
- Motivation: ${userBalanced.psychology?.want || 'Not specified'}
` : ''}

Provide a complete character profile in this structured format:

AGE: [specific age or range]
GENDER: [gender identity]
APPEARANCE: [3-4 sentences describing physical appearance, build, distinctive features]

PSYCHOLOGY:
WANT: [What they consciously desire - 1 sentence]
NEED: [What they truly need to grow - 1 sentence]
PRIMARY FLAW: [Their main character flaw - 1 sentence]

BACKSTORY:
[2-3 compelling paragraphs explaining their history, formative experiences, and how they became who they are today]

VOICE PROFILE:
SPEECH PATTERN: [How they speak - rhythm, tone, formality]
VOCABULARY: [Their word choice and language level]

Make them feel psychologically real and integrated into the story world.`

    try {
      console.log('🎨 [BALANCED AI] Generating character content for:', name)
      const result = await generateAIContent(prompt, {
        systemPrompt: 'You are an expert character psychologist. Create rich, psychologically complex characters that serve the story.',
        temperature: 0.8,
        maxTokens: 1000
      })
      console.log('✅ [BALANCED AI] Received AI response:', result.substring(0, 100) + '...')

      // Parse the structured result
      return this.parseBalancedResult(result, name, role)
    } catch (error) {
      console.error('❌ [BALANCED AI] Generation failed:', error)
      return this.generateBalancedFallback(name, role, basic, storyContext)
    }
  }

  private async generateDetailed3DCharacter(
    userInput: Partial<UnifiedCharacter>,
    storyContext: StoryBible,
    options: CharacterGenerationOptions
  ): Promise<any> {

    console.log('🎨 [3D GENERATOR] Using CharacterEngineV2 for full 3D character generation...')
    
    // Use the existing CharacterEngineV2 for FULL 3D character generation
    const { CharacterEngineV2 } = await import('./character-engine-v2')

    const premise: StoryPremise = {
      theme: storyContext.theme || 'personal growth',
      premiseStatement: storyContext.premise?.premiseStatement || 'A story unfolds',
      premiseType: storyContext.premise?.premiseType || 'opposing-values',
      character: storyContext.theme || 'personal growth',
      conflict: storyContext.premise?.conflict || 'Internal and external challenges',
      resolution: storyContext.premise?.resolution || 'Character growth and resolution',
      isTestable: storyContext.premise?.isTestable ?? true,
      isSpecific: storyContext.premise?.isSpecific ?? true,
      isArgued: storyContext.premise?.isArgued ?? true,
      logline: storyContext.premise?.logline
    }

    // Build comprehensive character concept from ALL user input
    // The AI's job is to ENHANCE these inputs, not replace them
    const conceptParts: string[] = []
    
    // 1. NAME (always include if provided)
    if (userInput.name) {
      conceptParts.push(`Name: ${userInput.name}`)
    }
    
    // 2. BASIC INFO
    if (userInput.basic?.description) {
      conceptParts.push(`Description: ${userInput.basic.description.trim()}`)
    }
    if (userInput.basic?.archetype) {
      conceptParts.push(`Archetype: ${userInput.basic.archetype}`)
    }
    if (userInput.basic?.premiseFunction) {
      conceptParts.push(`Premise Function: ${userInput.basic.premiseFunction}`)
    }
    
    // 3. PHYSIOLOGY (from balanced mode)
    const physiologyDetails: string[] = []
    if (userInput.balanced?.physiology?.appearance) {
      physiologyDetails.push(userInput.balanced.physiology.appearance)
    }
    if (userInput.balanced?.physiology?.age) {
      physiologyDetails.push(`Age: ${userInput.balanced.physiology.age}`)
    }
    if (userInput.balanced?.physiology?.gender) {
      physiologyDetails.push(`Gender: ${userInput.balanced.physiology.gender}`)
    }
    if (userInput.balanced?.physiology?.keyTraits && userInput.balanced.physiology.keyTraits.length > 0) {
      physiologyDetails.push(`Distinctive Features: ${userInput.balanced.physiology.keyTraits.join(', ')}`)
    }
    if (physiologyDetails.length > 0) {
      conceptParts.push(`Physical Appearance: ${physiologyDetails.join('. ')}`)
    }
    
    // 4. SOCIOLOGY (from balanced mode)
    const sociologyDetails: string[] = []
    if (userInput.balanced?.sociology?.occupation) {
      sociologyDetails.push(`Occupation: ${userInput.balanced.sociology.occupation}`)
    }
    if (userInput.balanced?.sociology?.education) {
      sociologyDetails.push(`Education: ${userInput.balanced.sociology.education}`)
    }
    if (userInput.balanced?.sociology?.socialClass) {
      sociologyDetails.push(`Social Class: ${userInput.balanced.sociology.socialClass}`)
    }
    if (userInput.balanced?.sociology?.homeLife) {
      sociologyDetails.push(`Home Life: ${userInput.balanced.sociology.homeLife}`)
    }
    if (userInput.balanced?.sociology?.economicStatus) {
      sociologyDetails.push(`Economic Status: ${userInput.balanced.sociology.economicStatus}`)
    }
    if (sociologyDetails.length > 0) {
      conceptParts.push(`Social Background: ${sociologyDetails.join('. ')}`)
    }
    
    // 5. PSYCHOLOGY (from balanced mode) - CRITICAL
    const psychologyDetails: string[] = []
    if (userInput.balanced?.psychology?.coreValue) {
      psychologyDetails.push(`Core Value/Trait: ${userInput.balanced.psychology.coreValue}`)
    }
    if (userInput.balanced?.psychology?.want) {
      const wantText = typeof userInput.balanced.psychology.want === 'string' 
        ? userInput.balanced.psychology.want 
        : userInput.balanced.psychology.want?.consciousGoal || ''
      if (wantText) {
        psychologyDetails.push(`WANT (External Goal): ${wantText}`)
      }
    }
    if (userInput.balanced?.psychology?.need) {
      const needText = typeof userInput.balanced.psychology.need === 'string'
        ? userInput.balanced.psychology.need
        : userInput.balanced.psychology.need?.unconsciousTruth || ''
      if (needText) {
        psychologyDetails.push(`NEED (Internal Lesson): ${needText}`)
      }
    }
    if (userInput.balanced?.psychology?.primaryFlaw) {
      psychologyDetails.push(`Primary Flaw: ${userInput.balanced.psychology.primaryFlaw}`)
    }
    if (userInput.balanced?.psychology?.temperament && userInput.balanced.psychology.temperament.length > 0) {
      psychologyDetails.push(`Temperament: ${userInput.balanced.psychology.temperament.join(', ')}`)
    }
    if (userInput.balanced?.psychology?.keyFears && userInput.balanced.psychology.keyFears.length > 0) {
      psychologyDetails.push(`Fears: ${userInput.balanced.psychology.keyFears.join(', ')}`)
    }
    if (userInput.balanced?.psychology?.keyStrengths && userInput.balanced.psychology.keyStrengths.length > 0) {
      psychologyDetails.push(`Strengths: ${userInput.balanced.psychology.keyStrengths.join(', ')}`)
    }
    if (psychologyDetails.length > 0) {
      conceptParts.push(`Psychology: ${psychologyDetails.join('. ')}`)
    }
    
    // 6. BACKSTORY
    if (userInput.balanced?.backstory) {
      conceptParts.push(`Backstory: ${userInput.balanced.backstory}`)
    }
    
    // 7. VOICE PROFILE
    if (userInput.balanced?.voiceProfile?.speechPattern) {
      conceptParts.push(`Speech Pattern: ${userInput.balanced.voiceProfile.speechPattern}`)
    }
    
    // 8. DETAILED MODE DATA (if provided)
    if (userInput.detailed?.fullPhysiology) {
      const detailedPhys = userInput.detailed.fullPhysiology
      if (detailedPhys.appearance) {
        conceptParts.push(`Detailed Appearance: ${detailedPhys.appearance}`)
      }
    }
    if (userInput.detailed?.fullSociology) {
      const detailedSoc = userInput.detailed.fullSociology
      if (detailedSoc.occupation?.primary) {
        conceptParts.push(`Detailed Occupation: ${detailedSoc.occupation.primary}`)
      }
    }
    if (userInput.detailed?.fullPsychology) {
      const detailedPsych = userInput.detailed.fullPsychology
      if (detailedPsych.want?.consciousGoal) {
        conceptParts.push(`Detailed Want: ${detailedPsych.want.consciousGoal}`)
      }
      if (detailedPsych.need?.unconsciousTruth) {
        conceptParts.push(`Detailed Need: ${detailedPsych.need.unconsciousTruth}`)
      }
    }
    
    // Combine all parts into comprehensive character concept
    let characterConcept = conceptParts.join('\n\n')
    
    // Fallback if nothing provided
    if (!characterConcept.trim()) {
      characterConcept = userInput.name 
        ? `${userInput.name}: A complex, multi-dimensional character`
        : 'A complex, multi-dimensional character'
    }

    console.log('🎨 [3D GENERATOR] ==========================================')
    console.log('🎨 [3D GENERATOR] COMPREHENSIVE CHARACTER CONCEPT:')
    console.log(characterConcept)
    console.log('🎨 [3D GENERATOR] ==========================================')
    console.log('🎨 [3D GENERATOR] Role:', userInput.role || 'protagonist')
    console.log('🎨 [3D GENERATOR] User input fields provided:', {
      name: !!userInput.name,
      role: !!userInput.role,
      basic: {
        description: !!userInput.basic?.description,
        archetype: !!userInput.basic?.archetype,
        premiseFunction: !!userInput.basic?.premiseFunction
      },
      balanced: {
        physiology: !!userInput.balanced?.physiology,
        sociology: !!userInput.balanced?.sociology,
        psychology: !!userInput.balanced?.psychology,
        backstory: !!userInput.balanced?.backstory,
        voiceProfile: !!userInput.balanced?.voiceProfile
      },
      detailed: {
        fullPhysiology: !!userInput.detailed?.fullPhysiology,
        fullSociology: !!userInput.detailed?.fullSociology,
        fullPsychology: !!userInput.detailed?.fullPsychology
      }
    })

    const architectedCharacter = await CharacterEngineV2.architectCharacter(
      premise,
      userInput.role || 'protagonist',
      characterConcept,
      {
        complexityLevel: 'lean-forward',
        narrativeFormat: 'feature',
        culturalBackground: 'diverse',
        targetAudience: 'general',
        enneagramHint: undefined
      }
    )

    console.log('✅ [3D GENERATOR] Full 3D character generated successfully')
    return architectedCharacter
  }

  /**
   * Upgrade character complexity (minimal → balanced → detailed)
   */
  async upgradeCharacter(
    character: UnifiedCharacter,
    direction: CharacterUpgradeDirection,
    storyContext: StoryBible
  ): Promise<CharacterGenerationResult> {

    console.log(`⬆️ [Unified Creator] Upgrading character ${character.name} from ${character.complexity}`)

    try {
      switch (direction) {
        case 'minimal-to-balanced':
          return await this.upgradeMinimalToBalanced(character, storyContext)

        case 'balanced-to-detailed':
          return await this.upgradeBalancedToDetailed(character, storyContext)

        default:
          throw new Error(`Unknown upgrade direction: ${direction}`)
      }
    } catch (error) {
      console.error(`❌ [Unified Creator] Upgrade failed:`, error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        character,
        confidence: 0,
        reasoning: `Upgrade failed: ${errorMessage}`
      }
    }
  }

  private async upgradeMinimalToBalanced(
    character: UnifiedCharacter,
    storyContext: StoryBible
  ): Promise<CharacterGenerationResult> {

    // Use existing balanced generation but preserve minimal data
    const userInput: Partial<UnifiedCharacter> = {
      name: character.name,
      role: character.role,
      basic: character.basic,
      complexity: 'balanced'
    }

    const result = await this.generateBalancedCharacter(userInput, storyContext, { aiAssist: true })

    // Merge with existing character data
    const upgradedCharacter: UnifiedCharacter = {
      ...result.character,
      id: character.id, // Keep original ID
      createdAt: character.createdAt, // Keep original creation date
      updatedAt: new Date().toISOString()
    }

    return {
      character: upgradedCharacter,
      confidence: result.confidence,
      reasoning: `Upgraded from minimal to balanced: ${result.reasoning}`
    }
  }

  private async upgradeBalancedToDetailed(
    character: UnifiedCharacter,
    storyContext: StoryBible
  ): Promise<CharacterGenerationResult> {

    // Use existing detailed generation
    const userInput: Partial<UnifiedCharacter> = {
      name: character.name,
      role: character.role,
      basic: character.basic,
      balanced: character.balanced,
      complexity: 'detailed'
    }

    const result = await this.generateDetailedCharacter(userInput, storyContext, { aiAssist: true })

    // Merge with existing character data
    const upgradedCharacter: UnifiedCharacter = {
      ...result.character,
      id: character.id, // Keep original ID
      createdAt: character.createdAt, // Keep original creation date
      updatedAt: new Date().toISOString()
    }

    return {
      character: upgradedCharacter,
      confidence: result.confidence,
      reasoning: `Upgraded from balanced to detailed: ${result.reasoning}`
    }
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  private generateId(): string {
    return `char_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private async generateContextualName(
    userInput: Partial<UnifiedCharacter>,
    storyContext: StoryBible
  ): Promise<string> {

    if (userInput.name) return userInput.name

    const existingNames = storyContext.mainCharacters?.map(c => c.name).filter(Boolean) || []
    const role: CharacterRole = userInput.role || 'ally' // 'supporting' is not a valid CharacterRole
    const genre = storyContext.genre || 'general'
    const tone = storyContext.tone || 'balanced'
    const setting = storyContext.worldBuilding?.locations?.[0]?.name || 'contemporary'

    // Analyze existing name patterns to avoid duplicates
    const existingFirstNames = existingNames.map(name => name.split(' ')[0].toLowerCase())
    const existingLastNames = existingNames.map(name => name.split(' ').slice(1).join(' ').toLowerCase())

    // Avoid overused fantasy names
    const forbiddenNames = [
      'maya', 'mira', 'elena', 'soren', 'alex', 'jordan', 'casey', 'blake', 'riley',
      'kyle', 'taylor', 'jamie', 'dylan', 'logan', 'avery', 'skylar', 'peyton',
      // Common fantasy tropes
      'aragorn', 'legolas', 'gimli', 'frodo', 'gandalf', 'dumbledore', 'harry', 'ron', 'hermione',
      'luke', 'leia', 'han', 'vader', 'skywalker', 'yoda', 'obi-wan'
    ]

    const forbiddenFirst = [...existingFirstNames, ...forbiddenNames]
    const forbiddenLast = [...existingLastNames, 'smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis', 'rodriguez', 'martinez']

    // Genre-specific naming preferences
    const genreHints: Record<string, string> = {
      'fantasy': 'Consider Celtic, Norse, Slavic, or invented names with meaning',
      'sci-fi': 'Modern names, callsigns, or culturally blended names',
      'mystery': 'Ordinary names that could hide secrets',
      'romance': 'Evocative, memorable names with emotional resonance',
      'horror': 'Names that feel unsettling or carry hidden meanings',
      'historical': 'Period-appropriate names from the era',
      'contemporary': 'Modern, diverse names reflecting current demographics'
    }

    const roleHints: Partial<Record<CharacterRole, string>> = {
      'protagonist': 'A name that feels heroic or relatable, easy to remember',
      'antagonist': 'A name that might sound trustworthy but could be deceptive',
      'mentor': 'A name that suggests wisdom, experience, or authority',
      'ally': 'A name that feels supportive and approachable',
      'love-interest': 'An attractive, memorable name with romantic connotations',
      'rival': 'A name that sounds competitive or challenging',
      'comic-relief': 'A fun, memorable name that stands out',
      'wildcard': 'An unusual or striking name that fits their unpredictable nature'
    }

    const genreKey = genre.toLowerCase()
    const genreHint = genreHints[genreKey] || genreHints[Object.keys(genreHints).find(k => genreKey.includes(k)) || 'contemporary'] || 'Fitting for the genre and setting'
    const roleHint = roleHints[role] || 'Suitable for their character function'

    const prompt = `Create a distinctive character name for a ${role} in a ${genre} ${tone} story set in ${setting}.

EXISTING CHARACTERS: ${existingNames.join(', ') || 'None yet'}
STORY TITLE: "${storyContext.seriesTitle || 'Untitled'}"
STORY THEME: "${storyContext.theme || 'Personal growth'}"

REQUIREMENTS:
• Genre-appropriate: ${genreHint}
• Role-appropriate: ${roleHint}
• Original & distinctive - avoid cliché names and existing character names
• 1-2 words maximum
• Should feel authentic to the story world
• Consider cultural diversity and representation

FORBIDDEN FIRST NAMES: ${forbiddenFirst.slice(0, 10).join(', ')}
FORBIDDEN LAST NAMES: ${forbiddenLast.slice(0, 8).join(', ')}

Generate 1 perfect name that fits naturally into this story world. Return ONLY the name, no explanation.`

    try {
      const result = await generateAIContent(prompt, {
        systemPrompt: 'You are a master character namer who creates distinctive, story-appropriate names that avoid clichés and feel authentic to their world.',
        temperature: 0.9, // Higher creativity for naming
        maxTokens: 15 // Keep it short for just the name
      })

      const name = result.trim()

      // Validate the name
      if (name && name.length >= 2 && name.length <= 30 && !name.includes(' ')) {
        // Check if it contains forbidden words
        const nameLower = name.toLowerCase()
        if (!forbiddenFirst.includes(nameLower)) {
          return name
        }
      }

      // If validation fails, try again with stricter constraints
      console.warn('Generated name failed validation, trying fallback approach')
      return this.generateContextualNameFallback(userInput, storyContext)

    } catch (error) {
      console.warn('AI name generation failed:', error)
      return this.generateContextualNameFallback(userInput, storyContext)
    }
  }

  private generateContextualNameFallback(
    userInput: Partial<UnifiedCharacter>,
    storyContext: StoryBible
  ): string {

    const role = userInput.role || 'character'
    const genre = storyContext.genre || 'general'

    // Diverse name pools organized by style
    const namePools = {
      fantasy: [
        ['Elara', 'Thorne', 'Kael', 'Sylva', 'Draven', 'Lyra', 'Corin', 'Nova'],
        ['Finn', 'Sage', 'Rune', 'Willow', 'Drex', 'Luna', 'Galen', 'Iris']
      ],
      scifi: [
        ['Jax', 'Nova', 'Zara', 'Rex', 'Lira', 'Kane', 'Sable', 'Vex'],
        ['Orion', 'Lyric', 'Cruz', 'Echo', 'Storm', 'Blaze', 'Zero', 'Flux']
      ],
      mystery: [
        ['Ellis', 'Quinn', 'Reid', 'Sage', 'Drew', 'Lane', 'Rivers', 'Cole'],
        ['Morgan', 'Riley', 'Blake', 'Jordan', 'Taylor', 'Casey', 'Alex', 'Rowan']
      ],
      contemporary: [
        ['Aiden', 'Maya', 'Ethan', 'Zoe', 'Liam', 'Aria', 'Noah', 'Luna'],
        ['Oliver', 'Sophia', 'Lucas', 'Emma', 'Mason', 'Ava', 'Ethan', 'Isabella']
      ]
    }

    // Select appropriate pool
    const genreKey = genre.toLowerCase().includes('fantasy') ? 'fantasy' :
                     genre.toLowerCase().includes('sci') ? 'scifi' :
                     genre.toLowerCase().includes('mystery') ? 'mystery' : 'contemporary'

    const pools = namePools[genreKey]
    const selectedPool = pools[Math.floor(Math.random() * pools.length)]

    // Avoid existing names
    const existingNames = storyContext.mainCharacters?.map(c => c.name.toLowerCase()) || []
    const availableNames = selectedPool.filter(name => !existingNames.includes(name.toLowerCase()))

    if (availableNames.length > 0) {
      return availableNames[Math.floor(Math.random() * availableNames.length)]
    }

    // Ultimate fallback
    const timestamp = Date.now().toString().slice(-4)
    return `${role.charAt(0).toUpperCase() + role.slice(1)}${timestamp}`
  }

  private inferRoleFromContext(userInput: Partial<UnifiedCharacter>, storyContext: StoryBible): CharacterRole {
    // Simple inference based on story needs
    const existingRoles = storyContext.mainCharacters?.map(c => c.archetype?.toLowerCase()).filter(Boolean) || []

    if (!existingRoles.includes('protagonist')) return 'protagonist'
    if (!existingRoles.includes('antagonist')) return 'antagonist'
    if (!existingRoles.includes('mentor')) return 'mentor'

    return 'ally' // 'supporting' is not a valid CharacterRole
  }

  private getArchetypeFromRole(role: CharacterRole): string {
    const roleMap: Record<CharacterRole, string> = {
      protagonist: 'Hero',
      antagonist: 'Villain',
      'love-interest': 'Love Interest',
      mentor: 'Mentor',
      ally: 'Ally',
      rival: 'Rival',
      family: 'Family Member',
      friend: 'Friend',
      'authority-figure': 'Authority Figure',
      'comic-relief': 'Comic Relief',
      wildcard: 'Wildcard',
      ensemble: 'Ensemble',
      catalyst: 'Catalyst',
      mirror: 'Mirror',
      threshold: 'Threshold Guardian',
      'secondary-antagonist': 'Secondary Antagonist'
    }

    return roleMap[role] || 'Supporting Character'
  }

  private async generatePremiseFunction(
    name: string,
    role: CharacterRole,
    storyContext: StoryBible
  ): Promise<string> {

    const premise = storyContext.premise?.premiseStatement || 'A story unfolds'
    const theme = storyContext.theme || 'personal growth'

    const prompt = `How does ${name} (${role}) serve to test or prove this story premise?

Premise: "${premise}"
Theme: "${theme}"

Write 1-2 sentences explaining their narrative function.`

    try {
      const result = await generateAIContent(prompt, {
        systemPrompt: 'You are a story analyst. Explain character functions in premise-driven narratives.',
        temperature: 0.6,
        maxTokens: 100
      })

      return result.trim()
    } catch (error) {
      return `${name} serves as ${role} to test the story's themes of ${theme}`
    }
  }

  private createMinimalPsychology(
    name: string,
    role: CharacterRole,
    storyContext: StoryBible
  ): CorePsychology {

    const theme = storyContext.theme || 'personal growth'

    return {
      coreValue: theme,
      want: `Achieve their goals as ${role}`,
      need: `Learn about ${theme}`,
      primaryFlaw: 'Generic flaw',
      temperament: ['Adaptable'],
      keyFears: ['Failure'],
      keyStrengths: ['Determination']
    }
  }

  private buildStoryContextPrompt(storyContext: StoryBible): string {
    return `
STORY CONTEXT:
Title: ${storyContext.seriesTitle || 'Untitled'}
Genre: ${storyContext.genre || 'General'}
Tone: ${storyContext.tone || 'Balanced'}
Setting: ${storyContext.worldBuilding?.locations?.map(l => l.name).join(', ') || 'Various locations'}
Existing Characters: ${storyContext.mainCharacters?.map(c => `${c.name} (${c.archetype})`).join(', ') || 'None yet'}
Premise: ${storyContext.premise?.premiseStatement || 'A story unfolds'}
Theme: ${storyContext.theme || 'Personal growth'}`
  }

  // ========================================
  // PARSING AND CONVERSION METHODS
  // ========================================

  private extractFromResult(result: string, field: string): string | null {
    const regex = new RegExp(`${field}:?\\s*(.+?)(?=\\n|$)`, 'i')
    const match = result.match(regex)
    return match ? match[1].trim() : null
  }

  private extractTraits(result: string): string[] {
    const traitsMatch = result.match(/traits?:?\s*(.+?)(?=\n|$)/i)
    if (traitsMatch) {
      return traitsMatch[1].split(',').map(t => t.trim()).filter(t => t)
    }
    return ['distinctive feature']
  }

  private extractBackstory(result: string): string {
    // Use [\s\S] instead of . with 's' flag for broader compatibility
    const backstoryMatch = result.match(/backstory:?\s*([\s\S]+?)(?=speech|$)/i)
    return backstoryMatch ? backstoryMatch[1].trim() : 'A character with their own story.'
  }

  private extractSpeechPattern(result: string): string {
    // Use [\s\S] instead of . with 's' flag for broader compatibility
    const speechMatch = result.match(/speech\s*pattern:?\s*([\s\S]+?)(?=vocabulary|$)/i)
    return speechMatch ? speechMatch[1].trim() : 'Speaks clearly and directly.'
  }

  private extractVocabulary(result: string): string {
    // Use [\s\S] instead of . with 's' flag for broader compatibility
    const vocabMatch = result.match(/vocabulary:?\s*([\s\S]+?)(?=\n|$)/i)
    return vocabMatch ? vocabMatch[1].trim() : 'Standard vocabulary'
  }

  private parseBalancedResult(
    result: string,
    name: string,
    role: CharacterRole
  ): {
    physiology: SimplifiedPhysiology
    psychology: CorePsychology
    backstory: string
    voiceProfile: BasicVoice
  } {

    // Extract structured fields from the AI response
    const age = this.extractFromResult(result, 'age') || 'adult'
    const gender = this.extractFromResult(result, 'gender') || 'unspecified'
    const appearance = this.extractFromResult(result, 'appearance') || 'Distinctive appearance'
    
    const want = this.extractFromResult(result, 'want') || 'To achieve their goals'
    const need = this.extractFromResult(result, 'need') || 'To learn and grow'
    const primaryFlaw = this.extractFromResult(result, 'primary flaw') || 'A specific character flaw'
    
    const backstory = this.extractBackstory(result)
    const speechPattern = this.extractSpeechPattern(result)
    const vocabulary = this.extractVocabulary(result)

    return {
      physiology: {
        age,
        gender,
        appearance,
        keyTraits: []
      },
      psychology: {
        coreValue: 'personal growth',
        want,
        need,
        primaryFlaw,
        temperament: [],
        keyFears: [],
        keyStrengths: []
      },
      backstory,
      voiceProfile: {
        speechPattern,
        vocabulary
      }
    }
  }

  private convertToSimplifiedPhysiology(fullPhysiology: any): SimplifiedPhysiology {
    // Include ALL fields from full physiology, not just a subset
    return {
      age: fullPhysiology.age || fullPhysiology.ageRange || undefined,
      gender: fullPhysiology.gender,
      appearance: fullPhysiology.appearance || fullPhysiology.physicalDescription,
      build: fullPhysiology.build,
      health: fullPhysiology.health || (fullPhysiology.healthConditions && fullPhysiology.healthConditions.length > 0 
        ? `Generally healthy with ${fullPhysiology.healthConditions.join(', ')}`
        : 'Good health'),
      keyTraits: fullPhysiology.physicalTraits || fullPhysiology.distinctiveFeatures || []
    }
  }

  private convertToCorePsychology(fullPsychology: any, architectedCharacter?: any): CorePsychology {
    // Extract foundation data from architected character if available
    const foundation = architectedCharacter ? {
      enneagramType: architectedCharacter.enneagramType,
      bigFiveProfile: architectedCharacter.bigFiveProfile,
      jungianPsyche: architectedCharacter.jungianPsyche
    } : null

    // Extract want - handle both object and string formats, ensure it's not undefined
    let want = fullPsychology?.want
    if (!want) {
      console.warn('⚠️ [CONVERSION] want is missing from fullPsychology, checking alternatives...')
      // Try to extract from other locations
      want = fullPsychology?.consciousGoal || fullPsychology?.externalObjective || undefined
    }
    // Ensure want is an object if it exists but is a string
    if (want && typeof want === 'string') {
      want = { consciousGoal: want, externalObjective: want }
    }
    // Log for debugging
    if (want) {
      console.log('✅ [CONVERSION] Extracted want:', typeof want === 'object' ? want.consciousGoal || want : want)
    } else {
      console.warn('⚠️ [CONVERSION] want is still undefined after extraction attempts')
    }

    // Extract need - handle both object and string formats
    let need = fullPsychology?.need
    if (!need) {
      console.warn('⚠️ [CONVERSION] need is missing from fullPsychology, checking alternatives...')
      need = fullPsychology?.unconsciousTruth || fullPsychology?.internalLesson || undefined
    }
    // Ensure need is an object if it exists but is a string
    if (need && typeof need === 'string') {
      need = { unconsciousTruth: need, internalLesson: need }
    }
    if (need) {
      console.log('✅ [CONVERSION] Extracted need:', typeof need === 'object' ? need.unconsciousTruth || need : need)
    }

    // Extract or generate all required fields
    return {
      coreValue: fullPsychology.coreValue || foundation?.enneagramType?.basicDesire || 'To find meaning and purpose',
      opposingValue: fullPsychology.opposingValue,
      moralStandpoint: fullPsychology.moralStandpoint || fullPsychology.moralNeed || 'Ethical framework to be determined',
      want: want, // Now properly extracted
      need: need, // Now properly extracted
      primaryFlaw: fullPsychology.primaryFlaw || fullPsychology.psychologicalNeed || fullPsychology.moralNeed || 'Character flaw to be determined',
      secondaryFlaws: fullPsychology.secondaryFlaws || [],
      temperament: fullPsychology.temperament || (foundation?.bigFiveProfile ? this.extractTemperamentFromBigFive(foundation.bigFiveProfile) : []),
      attitude: fullPsychology.attitude || foundation?.jungianPsyche?.persona?.publicMask || 'Attitude to be determined',
      keyFears: fullPsychology.fears || fullPsychology.vulnerabilities?.fears || [],
      keyStrengths: fullPsychology.abilities || fullPsychology.agency?.influenceStrategies || []
    }
  }

  private extractTemperamentFromBigFive(bigFive: any): string[] {
    const traits: string[] = []
    if (bigFive.extraversion?.score >= 7) traits.push('Outgoing')
    if (bigFive.extraversion?.score <= 4) traits.push('Introverted')
    if (bigFive.conscientiousness?.score >= 7) traits.push('Organized')
    if (bigFive.agreeableness?.score >= 7) traits.push('Cooperative')
    if (bigFive.neuroticism?.score >= 7) traits.push('Anxious')
    if (bigFive.openness?.score >= 7) traits.push('Creative')
    return traits.length > 0 ? traits : ['Balanced']
  }

  private convertToBasicVoice(voice: any): BasicVoice {
    // Handle CharacterVoice from ArchitectedCharacter
    if (voice && voice.lexicon && voice.syntax) {
      const vocabLevel = voice.lexicon?.vocabularyLevel || 'conversational'
      const pace = voice.rhythm?.speakingPace || 'moderate'
      const sentenceLength = voice.syntax?.sentenceLength || 'medium'
      
    return {
        speechPattern: `Speaks with ${pace} pace, ${sentenceLength} sentences, ${vocabLevel} vocabulary`,
        vocabulary: vocabLevel,
        quirks: voice.lexicon?.uniqueWords || []
      }
    }
    
    // Fallback for other voice formats
    return {
      speechPattern: voice?.voiceNotes || 'Speaks distinctly',
      vocabulary: voice?.vocabulary || 'standard',
      quirks: voice?.catchphrases || []
    }
  }

  /**
   * Enrich character with missing required fields using targeted AI calls
   */
  private async enrichCharacterFields(
    character: UnifiedCharacter,
    userInput: Partial<UnifiedCharacter>,
    storyContext: StoryBible,
    architectedCharacter: any
  ): Promise<UnifiedCharacter> {
    console.log('🔧 [ENRICHMENT] Checking for missing fields...')

    const enriched = { ...character }
    const missingFields: string[] = []

    // Check Psychology fields
    const psychology = enriched.balanced?.psychology || enriched.detailed?.fullPsychology
    if (!psychology?.coreValue || psychology.coreValue === 'To find meaning and purpose') {
      missingFields.push('coreValue')
    }
    if (!psychology?.moralStandpoint || psychology.moralStandpoint === 'Ethical framework to be determined') {
      missingFields.push('moralStandpoint')
    }
    // Check want - can be string or object with consciousGoal
    if (!psychology?.want || (typeof psychology.want === 'object' && !psychology.want.consciousGoal) || (typeof psychology.want === 'string' && psychology.want.trim().length === 0)) {
      missingFields.push('want')
    }
    // Check need - can be string or object with unconsciousTruth
    if (!psychology?.need || (typeof psychology.need === 'object' && !psychology.need.unconsciousTruth) || (typeof psychology.need === 'string' && psychology.need.trim().length === 0)) {
      missingFields.push('need')
    }
    if (!psychology?.primaryFlaw || psychology.primaryFlaw === 'Character flaw to be determined') {
      missingFields.push('primaryFlaw')
    }
    if (!psychology?.temperament || psychology.temperament.length === 0) {
      missingFields.push('temperament')
    }
    if (!psychology?.attitude || psychology.attitude === 'Attitude to be determined') {
      missingFields.push('attitude')
    }
    if (!psychology?.iq) {
      missingFields.push('iq')
    }
    if (!psychology?.keyFears || psychology.keyFears.length === 0) {
      missingFields.push('fears')
    }

    // Check Sociology fields
    const sociology = enriched.detailed?.fullSociology || enriched.balanced?.sociology
    // Check occupation - can be at top level or nested in profession.occupation
    const hasOccupation = sociology?.occupation || sociology?.profession?.occupation
    if (!hasOccupation) {
      missingFields.push('occupation')
    }
    // Check class - can be at top level or nested in socialClass.economic
    const hasClass = sociology?.class || sociology?.socialClass?.economic
    if (!hasClass) {
      missingFields.push('class')
    }
    if (!sociology?.homeLife) {
      missingFields.push('homeLife')
    }
    if (!sociology?.economicStatus) {
      missingFields.push('economicStatus')
    }
    if (!sociology?.communityStanding) {
      missingFields.push('communityStanding')
    }

    // Check Physiology fields
    const physiology = enriched.balanced?.physiology || enriched.detailed?.fullPhysiology
    if (!physiology?.health || physiology.health === 'Good health') {
      missingFields.push('health')
    }
    if (!physiology?.keyTraits || (Array.isArray(physiology.keyTraits) && physiology.keyTraits.length === 0)) {
      missingFields.push('physicalTraits')
    }

    if (missingFields.length === 0) {
      console.log('✅ [ENRICHMENT] All required fields present')
      // Still enhance description
      enriched.basic.description = await this.enhanceCharacterDescription(enriched, userInput, storyContext)
      return enriched
    }

    console.log(`🔧 [ENRICHMENT] Missing fields: ${missingFields.join(', ')}`)

    // Generate missing fields with targeted AI calls
    const enrichedData = await this.generateMissingFields(
      missingFields,
      character,
      userInput,
      storyContext,
      architectedCharacter
    )

    // Apply enriched data
    if (enrichedData.psychology) {
      if (enriched.balanced) {
        enriched.balanced.psychology = { ...enriched.balanced.psychology, ...enrichedData.psychology }
      }
      if (enriched.detailed) {
        enriched.detailed.fullPsychology = { ...enriched.detailed.fullPsychology, ...enrichedData.psychology }
      }
    }

    if (enrichedData.sociology) {
      if (enriched.detailed) {
        // Merge sociology data, ensuring occupation and class are properly set
        const mergedSociology = { ...enriched.detailed.fullSociology, ...enrichedData.sociology }
        // Ensure occupation is set at top level and in profession
        if (enrichedData.sociology.occupation) {
          mergedSociology.occupation = enrichedData.sociology.occupation
          if (mergedSociology.profession) {
            mergedSociology.profession = { ...mergedSociology.profession, occupation: enrichedData.sociology.occupation }
          } else {
            mergedSociology.profession = { occupation: enrichedData.sociology.occupation }
          }
        }
        // Ensure class is set at top level and in socialClass
        if (enrichedData.sociology.class) {
          mergedSociology.class = enrichedData.sociology.class
          if (mergedSociology.socialClass) {
            mergedSociology.socialClass = { ...mergedSociology.socialClass, economic: enrichedData.sociology.class }
          } else {
            mergedSociology.socialClass = { economic: enrichedData.sociology.class }
          }
        }
        enriched.detailed.fullSociology = mergedSociology
      }
    }

    if (enrichedData.physiology) {
      if (enriched.balanced) {
        enriched.balanced.physiology = { ...enriched.balanced.physiology, ...enrichedData.physiology }
      }
      if (enriched.detailed) {
        enriched.detailed.fullPhysiology = { ...enriched.detailed.fullPhysiology, ...enrichedData.physiology }
      }
    }

    // Enhance description
    enriched.basic.description = await this.enhanceCharacterDescription(enriched, userInput, storyContext)

    console.log('✅ [ENRICHMENT] Character enrichment complete')
    return enriched
  }

  /**
   * Generate missing fields with targeted AI calls
   */
  private async generateMissingFields(
    missingFields: string[],
    character: UnifiedCharacter,
    userInput: Partial<UnifiedCharacter>,
    storyContext: StoryBible,
    architectedCharacter: any
  ): Promise<any> {
    const result: any = { psychology: {}, sociology: {}, physiology: {} }

    const characterContext = `
Character: ${character.name}
Role: ${character.role}
Description: ${character.basic?.description || ''}
Existing Psychology: ${JSON.stringify(character.balanced?.psychology || character.detailed?.fullPsychology || {}, null, 2)}
Existing Sociology: ${JSON.stringify(character.detailed?.fullSociology || {}, null, 2)}
Existing Physiology: ${JSON.stringify(character.balanced?.physiology || character.detailed?.fullPhysiology || {}, null, 2)}
User Input: ${JSON.stringify(userInput, null, 2)}
Story Context: ${storyContext.theme || ''} - ${storyContext.premise?.premiseStatement || ''}
`

    // Generate psychology fields
    const psychFields = missingFields.filter(f => ['coreValue', 'moralStandpoint', 'want', 'need', 'primaryFlaw', 'temperament', 'attitude', 'iq', 'fears'].includes(f))
    if (psychFields.length > 0) {
      const prompt = `Generate the following psychology fields for this character:
${characterContext}

Missing fields: ${psychFields.join(', ')}

Generate ONLY these fields as JSON:
{
  ${psychFields.includes('coreValue') ? '"coreValue": "<their fundamental belief or value>",' : ''}
  ${psychFields.includes('moralStandpoint') ? '"moralStandpoint": "<their ethical framework>",' : ''}
  ${psychFields.includes('want') ? '"want": {"consciousGoal": "<what they consciously pursue>", "externalObjective": "<external goal>", "whatTheyThinkWillMakeThemHappy": "<what they think will make them happy>", "pursuitStrategy": "<how they pursue it>"},' : ''}
  ${psychFields.includes('need') ? '"need": {"unconsciousTruth": "<what they unconsciously need>", "internalLesson": "<internal lesson>", "whatTheyActuallyNeedForFulfillment": "<what they actually need>", "thematicSignificance": "<thematic significance>"},' : ''}
  ${psychFields.includes('primaryFlaw') ? '"primaryFlaw": "<their main character flaw>",' : ''}
  ${psychFields.includes('temperament') ? '"temperament": ["<trait1>", "<trait2>", "<trait3>"],' : ''}
  ${psychFields.includes('attitude') ? '"attitude": "<their general attitude>",' : ''}
  ${psychFields.includes('iq') ? '"iq": "<intelligence description>",' : ''}
  ${psychFields.includes('fears') ? '"keyFears": ["<fear1>", "<fear2>"]' : ''}
}

Output ONLY valid JSON.`

      try {
        const response = await generateAIContent(prompt, {
          systemPrompt: 'You are an expert character psychologist. Generate specific, detailed character psychology fields.',
          temperature: 0.8,
          maxTokens: 1000
        })
        const parsed = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
        result.psychology = { ...result.psychology, ...parsed }
        console.log(`✅ [ENRICHMENT] Generated psychology fields: ${psychFields.join(', ')}`)
      } catch (error) {
        console.error('❌ [ENRICHMENT] Failed to generate psychology fields:', error)
      }
    }

    // Generate sociology fields
    const socFields = missingFields.filter(f => ['occupation', 'class', 'homeLife', 'economicStatus', 'communityStanding'].includes(f))
    if (socFields.length > 0) {
      const prompt = `Generate the following sociology fields for this character:
${characterContext}

Missing fields: ${socFields.join(', ')}

Generate ONLY these fields as JSON:
{
  ${socFields.includes('occupation') ? '"occupation": "<their job/profession>",' : ''}
  ${socFields.includes('class') ? '"class": "<their social class: underclass/working/middle/upper-middle/upper>",' : ''}
  ${socFields.includes('homeLife') ? '"homeLife": "<description of living situation>",' : ''}
  ${socFields.includes('economicStatus') ? '"economicStatus": "<financial situation>",' : ''}
  ${socFields.includes('communityStanding') ? '"communityStanding": "<how they are viewed>"' : ''}
}

Output ONLY valid JSON.`

      try {
        const response = await generateAIContent(prompt, {
          systemPrompt: 'You are an expert in character sociology. Generate specific, detailed character sociology fields.',
          temperature: 0.8,
          maxTokens: 800
        })
        const parsed = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
        result.sociology = { ...result.sociology, ...parsed }
        console.log(`✅ [ENRICHMENT] Generated sociology fields: ${socFields.join(', ')}`)
      } catch (error) {
        console.error('❌ [ENRICHMENT] Failed to generate sociology fields:', error)
      }
    }

    // Generate physiology fields
    const physFields = missingFields.filter(f => ['health', 'physicalTraits'].includes(f))
    if (physFields.length > 0) {
      const prompt = `Generate the following physiology fields for this character:
${characterContext}

Missing fields: ${physFields.join(', ')}

Generate ONLY these fields as JSON:
{
  ${physFields.includes('health') ? '"health": "<description of physical health>",' : ''}
  ${physFields.includes('physicalTraits') ? '"keyTraits": ["<trait1>", "<trait2>", "<trait3>"]' : ''}
}

Output ONLY valid JSON.`

      try {
        const response = await generateAIContent(prompt, {
          systemPrompt: 'You are an expert in character physiology. Generate specific, detailed character physiology fields.',
          temperature: 0.8,
          maxTokens: 600
        })
        const parsed = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
        result.physiology = { ...result.physiology, ...parsed }
        console.log(`✅ [ENRICHMENT] Generated physiology fields: ${physFields.join(', ')}`)
      } catch (error) {
        console.error('❌ [ENRICHMENT] Failed to generate physiology fields:', error)
      }
    }

    return result
  }

  /**
   * Enhance character description based on all generated fields
   */
  /**
   * Generate a descriptive character title/archetype (e.g., "The Visionary VC", "The Legacy Gatekeeper")
   * Similar to how story bible characters get their titles
   */
  private async generateDescriptiveCharacterTitle(
    name: string,
    detailedResult: any,
    userInput: Partial<UnifiedCharacter>,
    storyContext: StoryBible
  ): Promise<string> {
    // Extract character details
    const occupation = detailedResult.sociology?.profession?.occupation || 
                      detailedResult.sociology?.occupation || 
                      userInput.detailed?.fullSociology?.profession?.occupation ||
                      userInput.detailed?.fullSociology?.occupation ||
                      ''
    const role = detailedResult.role || userInput.role || 'character'
    const want = typeof detailedResult.psychology?.want === 'string'
      ? detailedResult.psychology.want
      : detailedResult.psychology?.want?.consciousGoal || ''
    const flaw = detailedResult.psychology?.primaryFlaw || ''
    const coreValue = detailedResult.psychology?.coreValue || ''
    const age = detailedResult.physiology?.age || userInput.balanced?.physiology?.age || ''
    
    const characterContext = `
Character Name: ${name}
Age: ${age || 'Not specified'}
Role: ${role}
Occupation: ${occupation || 'Not specified'}
Core Value: ${coreValue || 'Not specified'}
Want: ${want || 'Not specified'}
Primary Flaw: ${flaw || 'Not specified'}
Story Theme: ${storyContext.theme || 'Not specified'}
Story Premise: ${storyContext.premise?.premiseStatement || 'Not specified'}
`

    const prompt = `Create a compelling, descriptive character title/archetype for this character.

Examples of good character titles:
- "The Visionary VC" (for a venture capitalist)
- "The Legacy Gatekeeper" (for a studio executive)
- "The Gym-Rat Genius" (for a tech prodigy)
- "The Washed-Up Action Hero" (for a former action star)
- "The Goth Auteur" (for a filmmaker)
- "The Panic-Attack Attorney" (for a lawyer)

Character Context:
${characterContext}

Create a descriptive title that:
- Is 2-5 words maximum
- Captures their defining characteristic, occupation, or role
- Uses "The" as a prefix when appropriate (e.g., "The Visionary VC")
- Is memorable and specific (not generic like "ally in the story")
- Reflects their personality, profession, or narrative function
- Avoids generic role descriptions

Output ONLY the title, no explanation, no quotes, no markdown.`

    try {
      const title = await generateAIContent(prompt, {
        systemPrompt: 'You are an expert at creating memorable, descriptive character titles that capture a character\'s essence, occupation, or defining trait. Create titles like "The Visionary VC" or "The Legacy Gatekeeper" - specific and evocative, not generic.',
        temperature: 0.8,
        maxTokens: 20
      })
      const cleaned = title.trim().replace(/^["']|["']$/g, '').replace(/^The /i, 'The ') // Ensure "The" is capitalized
      // Fallback if result is too generic
      if (cleaned.toLowerCase().includes('in the story') || cleaned.length < 3) {
        return this.generateFallbackTitle(name, occupation, role)
      }
      return cleaned
    } catch (error) {
      console.error('❌ [TITLE GENERATION] Failed to generate descriptive title:', error)
      return this.generateFallbackTitle(name, occupation, role)
    }
  }

  /**
   * Generate a fallback title if AI generation fails
   */
  private generateFallbackTitle(name: string, occupation: string, role: string): string {
    if (occupation && occupation.trim()) {
      // Use occupation-based title
      const occ = occupation.trim()
      if (occ.length > 0) {
        return `The ${occ.charAt(0).toUpperCase() + occ.slice(1)}`
      }
    }
    // Fallback to role-based title
    const roleTitles: Record<string, string> = {
      'protagonist': 'The Protagonist',
      'antagonist': 'The Antagonist',
      'ally': 'The Ally',
      'love-interest': 'The Love Interest',
      'mentor': 'The Mentor',
      'rival': 'The Rival',
      'ensemble': 'The Ensemble Member'
    }
    return roleTitles[role] || `The ${role.charAt(0).toUpperCase() + role.slice(1)}`
  }

  private async enhanceCharacterDescription(
    character: UnifiedCharacter,
    userInput: Partial<UnifiedCharacter>,
    storyContext: StoryBible
  ): Promise<string> {
    const originalDescription = userInput.basic?.description || character.basic?.description || ''
    
    // Extract key character details for narrative description
    const name = character.name
    const age = character.balanced?.physiology?.age || character.detailed?.fullPhysiology?.age
    const occupation = character.detailed?.fullSociology?.profession?.occupation || character.detailed?.fullSociology?.occupation || ''
    const role = character.role
    const want = typeof character.balanced?.psychology?.want === 'string' 
      ? character.balanced.psychology.want 
      : character.balanced?.psychology?.want?.consciousGoal || character.detailed?.fullPsychology?.want?.consciousGoal || ''
    const need = typeof character.balanced?.psychology?.need === 'string'
      ? character.balanced.psychology.need
      : character.balanced?.psychology?.need?.unconsciousTruth || character.detailed?.fullPsychology?.need?.unconsciousTruth || ''
    const flaw = character.balanced?.psychology?.primaryFlaw || character.detailed?.fullPsychology?.primaryFlaw || ''
    const sociology = character.detailed?.fullSociology || {}
    const psychology = character.balanced?.psychology || character.detailed?.fullPsychology || {}

    const characterContext = `
Character Name: ${name}
Age: ${age || 'Not specified'}
Role in Story: ${role}
Occupation: ${occupation}
Social Class: ${sociology.socialClass?.economic || sociology.class || 'Not specified'}
Education: ${typeof sociology.education === 'string' ? sociology.education : sociology.education?.level || 'Not specified'}
Home Life: ${sociology.homeLife || 'Not specified'}
Economic Status: ${sociology.economicStatus || 'Not specified'}
Community Standing: ${sociology.communityStanding || 'Not specified'}

Psychology:
- Core Value: ${psychology.coreValue || 'Not specified'}
- Want (External Goal): ${want || 'Not specified'}
- Need (Internal Lesson): ${need || 'Not specified'}
- Primary Flaw: ${flaw || 'Not specified'}
- Attitude: ${psychology.attitude || 'Not specified'}

Original User Input: ${originalDescription}
Story Context: ${storyContext.theme || ''} - ${storyContext.premise?.premiseStatement || ''}
`

    const prompt = `Create a compelling, narrative character description in the style of professional character introductions.

Examples of good character descriptions:
- "Tia is a 27-year-old viral sensation with 40 million TikTok followers and zero respect from the industry."
- "A relic of 1990s blockbuster excess trying desperately to remain relevant in a TikTok world."
- "Gordy is a loud, brash studio executive who thinks he's still in the 90s."

Character Context:
${characterContext}

Create a 1-2 sentence narrative description that:
- Opens with a hook that captures who they are (age, occupation, status, or defining characteristic)
- Uses their sociology (occupation, social standing, background) to create context
- Mentions their psychology (want, need, flaw) to show their internal conflict
- Is written in third person, present tense
- Is punchy, memorable, and sets up their role in the story
- Does NOT focus on physical appearance (that's in the Physiology section)
- Focuses on their narrative function, status, and psychological state

Output ONLY the description text, no markdown, no JSON, no quotes.`

    try {
      const enhanced = await generateAIContent(prompt, {
        systemPrompt: 'You are an expert character writer. Create punchy, narrative character descriptions that hook the reader and establish the character\'s role and psychology. Focus on narrative function, not physical description.',
        temperature: 0.9,
        maxTokens: 300
      })
      const cleaned = enhanced.trim().replace(/^["']|["']$/g, '') // Remove surrounding quotes if any
      return cleaned
    } catch (error) {
      console.error('❌ [ENRICHMENT] Failed to enhance description:', error)
      // Fallback: create a simple narrative description
      const fallback = age && occupation 
        ? `${name} is a ${age}-year-old ${occupation}${role !== 'protagonist' ? ` serving as ${role} in the story` : ''}.`
        : originalDescription || `${name} is a ${role} in the story.`
      return fallback
    }
  }

  // ========================================
  // FALLBACK METHODS
  // ========================================

  private generateMinimalFallback(
    name: string,
    role: CharacterRole
  ): {
    physiology: SimplifiedPhysiology
    backstory: string
    voiceProfile: BasicVoice
  } {

    return {
      physiology: {
        gender: 'unspecified',
        appearance: 'Distinctive features',
        keyTraits: ['memorable trait']
      },
      backstory: `${name} is a ${role} character with their own motivations and background.`,
      voiceProfile: {
        speechPattern: 'Speaks in a manner fitting their role.'
      }
    }
  }

  private generateBalancedFallback(
    name: string,
    role: CharacterRole,
    basic: CharacterBasic,
    storyContext: StoryBible
  ): {
    physiology: SimplifiedPhysiology
    psychology: CorePsychology
    backstory: string
    voiceProfile: BasicVoice
  } {

    const theme = storyContext.theme || 'personal growth'

    return {
      physiology: {
        gender: 'specified',
        appearance: 'Detailed appearance',
        keyTraits: ['key trait']
      },
      psychology: {
        coreValue: theme,
        want: 'Achieve their goals',
        need: `Learn about ${theme}`,
        primaryFlaw: 'Character flaw',
        temperament: ['determined'],
        keyFears: ['failure'],
        keyStrengths: ['resilience']
      },
      backstory: 'A detailed backstory that integrates with the story world.',
      voiceProfile: {
        speechPattern: 'Distinctive speech pattern.'
      }
    }
  }

  private createFallbackCharacter(
    userInput: Partial<UnifiedCharacter>,
    mode: CharacterComplexity,
    storyContext: StoryBible
  ): UnifiedCharacter {

    return {
      id: this.generateId(),
      name: userInput.name || 'Fallback Character',
      role: userInput.role || 'ally', // 'supporting' is not a valid CharacterRole
      complexity: mode,
      basic: {
        description: userInput.basic?.description || 'A character',
        archetype: userInput.basic?.archetype,
        premiseFunction: userInput.basic?.premiseFunction
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiGenerated: false,
      lastEditedBy: 'user'
    }
  }
}

// Export singleton instance
export const characterCreatorUnified = CharacterCreatorUnified.getInstance()
