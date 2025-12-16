/**
 * Props/Wardrobe Generator - AI Service
 * Generates props and wardrobe breakdowns based on script, breakdown, and questionnaire answers
 * 
 * Uses EngineAIRouter with Gemini 3 Pro Preview for analytical + practical generation
 * 
 * Standards:
 * - Extract props and wardrobe from script breakdown
 * - Consider questionnaire answers (cast-owned, existing materials)
 * - Prioritize: actor-owned > borrow > DIY > rent > buy
 * - Cost estimates: $0 (owned/borrow) to $500 (buy)
 * - Match industry standards: hero/secondary/background importance
 */

import { EngineAIRouter } from '@/services/engine-ai-router'
import type { ScriptBreakdownData, PropsWardrobeData, PropItem, ArcPropsWardrobeData } from '@/types/preproduction'

interface GeneratedScript {
  title: string
  episodeNumber: number
  pages: any[]
  metadata: {
    pageCount: number
    sceneCount: number
    characterCount: number
    estimatedRuntime: string
  }
}

interface PropsWardrobeGenerationParams {
  scriptData: GeneratedScript | GeneratedScript[]
  breakdownData: ScriptBreakdownData
  storyBible: any
  episodeNumber?: number
  episodeNumbers?: number[]
  episodeTitle: string
  questionnaireAnswers?: Record<string, any> // Answers to contextual questionnaire
  isArcContext?: boolean
  arcIndex?: number
}

/**
 * Generate props and wardrobe breakdown
 */
export async function generatePropsWardrobe(params: PropsWardrobeGenerationParams): Promise<PropsWardrobeData | ArcPropsWardrobeData> {
  const { scriptData, breakdownData, storyBible, episodeNumber = 0, episodeNumbers, episodeTitle, questionnaireAnswers, isArcContext, arcIndex } = params

  const scriptsArray = Array.isArray(scriptData) ? scriptData : [scriptData]
  const contextLabel = isArcContext ? 'ARC' : 'EPISODE'

  console.log(`🎬 Generating props and wardrobe for ${contextLabel}`, isArcContext ? `(episodes: ${episodeNumbers?.length || 0})` : episodeNumber)
  console.log('📋 Analyzing', breakdownData.scenes.length, 'scenes')

  // Extract props and wardrobe requirements from breakdown
  const requirements = extractRequirements(breakdownData)
  console.log('✅ Extracted requirements:', requirements.props.length, 'props,', requirements.wardrobe.length, 'wardrobe items')

  // Build AI prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(
    requirements,
    scriptsArray[0],
    breakdownData,
    storyBible,
    episodeTitle,
    questionnaireAnswers,
    isArcContext,
    episodeNumbers
  )

  try {
    // Use EngineAIRouter with Gemini 3 Pro Preview (analytical + practical)
    console.log('🤖 Calling AI for props/wardrobe generation...')
    const response = await EngineAIRouter.generateContent({
      prompt: userPrompt,
      systemPrompt: systemPrompt,
      temperature: 0.5, // Balanced creativity and practicality
      maxTokens: 6000, // Enough for comprehensive breakdown
      engineId: 'props-wardrobe-generator',
      forceProvider: 'gemini'
    })

    console.log('✅ AI Response received:', response.metadata.contentLength, 'characters')
    
    // Parse AI response into structured props/wardrobe data
    const propsWardrobeData = parsePropsWardrobe(
      response.content,
      requirements,
      episodeNumber,
      episodeTitle,
      isArcContext,
      episodeNumbers,
      arcIndex
    )
    
    console.log('✅ Props/Wardrobe generated:', propsWardrobeData.props.length, 'props,', propsWardrobeData.wardrobe.length, 'wardrobe items')
    
    return propsWardrobeData
  } catch (error) {
    console.error('❌ Error generating props/wardrobe:', error)
    throw new Error(`Props/Wardrobe generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract props and wardrobe requirements from breakdown
 */
function extractRequirements(breakdown: ScriptBreakdownData): {
  props: Array<{ item: string; scenes: number[] }>
  wardrobe: Array<{ character: string; description: string; scenes: number[] }>
} {
  const propsMap = new Map<string, number[]>()
  const wardrobeMap = new Map<string, { character: string; description: string; scenes: number[] }>()

  for (const scene of breakdown.scenes) {
    // Extract props
    if (scene.props && scene.props.length > 0) {
      for (const prop of scene.props) {
        const existing = propsMap.get(prop.item) || []
        propsMap.set(prop.item, [...existing, scene.sceneNumber])
      }
    }

    // Extract wardrobe (from characters - inferred)
    if (scene.characters && scene.characters.length > 0) {
      for (const character of scene.characters) {
        // Wardrobe is typically inferred from character and scene context
        // We'll let AI generate based on script context
      }
    }
  }

  return {
    props: Array.from(propsMap.entries()).map(([item, scenes]) => ({ item, scenes })),
    wardrobe: [] // AI will generate based on script context
  }
}

/**
 * Build system prompt for AI
 */
function buildSystemPrompt(): string {
  return `You are a production designer creating props and wardrobe breakdowns for a micro-budget web series ($1k-$20k total series budget, 5-minute episodes).

Your job is to generate comprehensive props and wardrobe breakdowns based on script analysis.

**CRITICAL RULES:**

1. **EXTRACT FROM SCRIPT ONLY**
   - Only include props/wardrobe explicitly mentioned or clearly implied in the script
   - Do NOT invent props/wardrobe not in the script
   - Base all items on actual script content

2. **MICRO-BUDGET FOCUS ($1k-$20k series total)**
   - Per episode budget: $30-$625 MAX
   - Props budget: $5-$150 per episode (most should be $0-$50)
   - Wardrobe budget: $0-$200 per episode (prioritize actor-owned)
   - Total props/wardrobe per episode: $5-$350 MAX

3. **SOURCE PRIORITY (Cost-saving order)**
   - actor-owned: $0 (actor provides from personal wardrobe/items)
   - borrow: $0 (borrow from friend/family, no cost)
   - diy: $5-$30 (make it yourself, materials only)
   - rent: $10-$50 (short-term rental)
   - buy: $20-$500 (purchase new, only if necessary)

4. **IMPORTANCE LEVELS**
   - hero: Critical prop/wardrobe item (close-ups, key to scene)
   - secondary: Important but not critical (background, supporting)
   - background: Minor prop/wardrobe (set dressing, ambiance)

5. **PROCUREMENT STATUS**
   - needed: Item identified, needs to be sourced
   - sourced: Item located, contact/arrangement made
   - obtained: Item acquired and ready
   - packed: Item packed and ready for shoot day

6. **PROPS BREAKDOWN**
   - Extract ALL props from script breakdown
   - Include scene numbers where used
   - Provide realistic cost estimates
   - Suggest source based on budget constraints

7. **WARDROBE BREAKDOWN**
   - Generate wardrobe per character based on script context
   - Consider character personality, scene setting, time period
   - Prioritize actor-owned clothing
   - Include scene numbers where wardrobe appears
   - Provide cost estimates

8. **OUTPUT FORMAT**
   - Valid JSON only
   - No markdown, no code blocks, no explanations
   - Match the exact structure specified`
}

/**
 * Build user prompt with all context
 */
function buildUserPrompt(
  requirements: ReturnType<typeof extractRequirements>,
  scriptData: GeneratedScript,
  breakdownData: ScriptBreakdownData,
  storyBible: any,
  episodeTitle: string,
  questionnaireAnswers?: Record<string, any>,
  isArcContext?: boolean,
  episodeNumbers?: number[]
): string {
  const totalEpisodes = episodeNumbers?.length || 0
  let prompt = isArcContext
    ? `Generate props and wardrobe breakdown for the ARC "${episodeTitle}" covering ${totalEpisodes} episodes.\n\n`
    : `Generate props and wardrobe breakdown for ${episodeTitle} episode.\n\n`

  // Story context (CORE DATA)
  prompt += `**STORY CONTEXT:**\n`
  prompt += `Series: ${storyBible?.seriesTitle || storyBible?.title || 'Untitled Series'}\n`
  if (storyBible?.seriesOverview) {
    prompt += `Series Overview: ${storyBible.seriesOverview}\n`
  }
  prompt += `Genre: ${storyBible?.genre || 'Drama'}\n`
  prompt += `Setting: ${storyBible?.setting || storyBible?.location || 'Urban'}\n`
  if (storyBible?.worldBuilding?.setting) {
    prompt += `World Setting: ${storyBible.worldBuilding.setting}\n`
  }
  if (storyBible?.worldBuilding?.rules) {
    prompt += `World Rules: ${typeof storyBible.worldBuilding.rules === 'string' ? storyBible.worldBuilding.rules.substring(0, 200) : ''}\n`
  }
  prompt += `Time Period: ${storyBible?.timePeriod || 'Contemporary'}\n\n`

  // Episode or Arc context
  if (isArcContext) {
    prompt += `**ARC:** ${episodeTitle}\n`
    prompt += `Episodes: ${totalEpisodes}\n`
    prompt += `Budget: $30-$625 per episode; focus on shared/reusable items across the arc.\n`
    prompt += `Scenes (aggregated): ${breakdownData.scenes.length}\n\n`
  } else {
    prompt += `**EPISODE:** ${episodeTitle}\n`
    prompt += `Budget: $5-$350 TOTAL for props + wardrobe (micro-budget web series)\n`
    prompt += `Scenes: ${breakdownData.scenes.length}\n\n`
  }

  // Props from breakdown
  if (requirements.props.length > 0) {
    prompt += `**PROPS IDENTIFIED IN BREAKDOWN:**\n`
    requirements.props.forEach((prop, idx) => {
      prompt += `${idx + 1}. ${prop.item} (Scenes: ${prop.scenes.join(', ')})\n`
    })
    prompt += `\n`
  }

  // Characters (for wardrobe)
  const uniqueCharacters = new Set(breakdownData.scenes.flatMap(s => s.characters?.map(c => c.name) || []))
  if (uniqueCharacters.size > 0) {
    prompt += `**CHARACTERS (for wardrobe):**\n`
    Array.from(uniqueCharacters).forEach((char, idx) => {
      prompt += `${idx + 1}. ${char}\n`
    })
    prompt += `\n`
  }

  // Questionnaire answers (if available)
  if (questionnaireAnswers && Object.keys(questionnaireAnswers).length > 0) {
    prompt += `**QUESTIONNAIRE ANSWERS (CRITICAL CONTEXT):**\n`
    
    // Cast capabilities
    if (questionnaireAnswers.hasOwnProperty('castOwnsEquipment')) {
      prompt += `- Cast owns equipment/materials: ${questionnaireAnswers.castOwnsEquipment ? 'YES' : 'NO'}\n`
    }
    if (questionnaireAnswers.hasOwnProperty('castOwnsProps')) {
      prompt += `- Cast can provide props: ${questionnaireAnswers.castOwnsProps ? 'YES' : 'NO'}\n`
    }
    if (questionnaireAnswers.hasOwnProperty('castOwnsWardrobe')) {
      prompt += `- Cast can provide wardrobe: ${questionnaireAnswers.castOwnsWardrobe ? 'YES' : 'NO'}\n`
    }

    // Existing materials
    if (questionnaireAnswers.hasOwnProperty('existingProps')) {
      prompt += `- Existing props available: ${typeof questionnaireAnswers.existingProps === 'string' ? questionnaireAnswers.existingProps : 'YES'}\n`
    }
    if (questionnaireAnswers.hasOwnProperty('budgetForProps')) {
      prompt += `- Budget for props: $${questionnaireAnswers.budgetForProps || 0}\n`
    }

    prompt += `\n`
    prompt += `**IMPORTANT:** Use questionnaire answers to determine source (actor-owned, borrow, etc.)\n\n`
  }

  // Scene breakdown summary
  prompt += `**SCENE BREAKDOWN SUMMARY:**\n`
  breakdownData.scenes.slice(0, 5).forEach(scene => {
    prompt += `Scene ${scene.sceneNumber}: ${scene.sceneTitle || 'Untitled'}\n`
    prompt += `  Location: ${scene.location || 'Unknown'}\n`
    prompt += `  Props: ${scene.props?.map(p => p.item).join(', ') || 'None'}\n`
    prompt += `  Characters: ${scene.characters?.map(c => c.name).join(', ') || 'None'}\n`
  })
  if (breakdownData.scenes.length > 5) {
    prompt += `... and ${breakdownData.scenes.length - 5} more scenes\n`
  }
  prompt += `\n`

  // Task
  prompt += `**TASK:**\n`
  if (isArcContext) {
    prompt += `Generate comprehensive props and wardrobe breakdown for the entire arc with:\n`
    prompt += `1. All props from breakdown (plus clearly implied), grouped by reuse across episodes\n`
    prompt += `2. Wardrobe for characters across episodes; emphasize reusability and consistency\n`
    prompt += `3. Cost estimates aggregated for arc; prioritize $0 sources and sharing items\n`
    prompt += `4. Importance levels and procurement status\n`
    prompt += `5. Notes on storage/transportation and which episodes each item covers\n\n`
  } else {
    prompt += `Generate comprehensive props and wardrobe breakdown with:\n`
    prompt += `1. All props from breakdown (plus any clearly implied in script)\n`
    prompt += `2. Wardrobe for each character based on script context\n`
    prompt += `3. Cost estimates based on source (prioritize $0 sources)\n`
    prompt += `4. Importance levels and procurement status\n\n`
  }

  prompt += `**OUTPUT FORMAT:**\n\n`
  prompt += `{\n`
  prompt += `  "props": [\n`
  prompt += `    {\n`
  prompt += `      "name": "Vintage coffee mug",\n`
  prompt += `      "description": "1950s style ceramic mug with chip",\n`
  prompt += `      "scenes": [1, 3],\n`
  prompt += `      "importance": "hero",\n`
  prompt += `      "source": "borrow",\n`
  prompt += `      "estimatedCost": 0,\n`
  prompt += `      "notes": "Hero prop for close-up in Scene 1"\n`
  prompt += `    }\n`
  prompt += `  ],\n`
  prompt += `  "wardrobe": [\n`
  prompt += `    {\n`
  prompt += `      "name": "Business suit",\n`
  prompt += `      "description": "Dark navy suit, white dress shirt, tie",\n`
  prompt += `      "characterAssociated": "Jason Calacanis",\n`
  prompt += `      "scenes": [1, 2],\n`
  prompt += `      "importance": "hero",\n`
  prompt += `      "source": "actor-owned",\n`
  prompt += `      "estimatedCost": 0,\n`
  prompt += `      "notes": "Lead character's signature look"\n`
  prompt += `    }\n`
  prompt += `  ]\n`
  prompt += `}\n\n`

  prompt += `**CRITICAL REMINDERS:**\n`
  prompt += `- Output ONLY valid JSON (no markdown, no code blocks)\n`
  prompt += `- Extract from script ONLY (no invention)\n`
  prompt += `- ULTRA-MICRO-BUDGET: Total props + wardrobe should be $5-$350 MAX\n`
  prompt += `- Prioritize actor-owned, borrow, DIY over rent/buy\n`
  prompt += `- All props must have scenes array\n`
  prompt += `- All wardrobe must have characterAssociated\n`

  return prompt
}

/**
 * Parse AI response into structured props/wardrobe data
 */
function parsePropsWardrobe(
  aiResponse: string,
  requirements: ReturnType<typeof extractRequirements>,
  episodeNumber: number,
  episodeTitle: string,
  isArcContext?: boolean,
  episodeNumbers?: number[],
  arcIndex?: number
): PropsWardrobeData | ArcPropsWardrobeData {
  try {
    // Clean AI output
    let cleaned = aiResponse.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\s*/, '').replace(/```\s*$/, '')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\s*/, '').replace(/```\s*$/, '')
    }
    cleaned = cleaned.trim()

    // Parse JSON
    const parsed = JSON.parse(cleaned)

    // Validate and structure
    if (!parsed.props || !Array.isArray(parsed.props)) {
      throw new Error('Invalid props/wardrobe structure: missing props array')
    }
    if (!parsed.wardrobe || !Array.isArray(parsed.wardrobe)) {
      throw new Error('Invalid props/wardrobe structure: missing wardrobe array')
    }

    // Convert props
    const props: PropItem[] = parsed.props.map((item: any, idx: number) => ({
      id: `prop_${Date.now()}_${idx}`,
      type: 'prop' as const,
      name: item.name || `Prop ${idx + 1}`,
      description: item.description || '',
      scenes: Array.isArray(item.scenes) ? item.scenes : [item.scene || 1],
      importance: item.importance || 'secondary',
      source: item.source || 'buy',
      estimatedCost: typeof item.estimatedCost === 'number' ? item.estimatedCost : 0,
      actualCost: item.actualCost,
      vendor: item.vendor,
      procurementStatus: 'needed' as const,
      responsiblePerson: item.responsiblePerson,
      characterAssociated: undefined,
      referencePhotos: [],
      notes: item.notes || '',
      comments: []
    }))

    // Convert wardrobe
    const wardrobe: PropItem[] = parsed.wardrobe.map((item: any, idx: number) => ({
      id: `wardrobe_${Date.now()}_${idx}`,
      type: 'wardrobe' as const,
      name: item.name || `Wardrobe ${idx + 1}`,
      description: item.description || '',
      scenes: Array.isArray(item.scenes) ? item.scenes : [item.scene || 1],
      importance: item.importance || 'secondary',
      source: item.source || 'actor-owned',
      estimatedCost: typeof item.estimatedCost === 'number' ? item.estimatedCost : 0,
      actualCost: item.actualCost,
      vendor: item.vendor,
      procurementStatus: 'needed' as const,
      responsiblePerson: item.responsiblePerson,
      characterAssociated: item.characterAssociated || '',
      referencePhotos: [],
      notes: item.notes || '',
      comments: []
    }))

    const totalCost = [...props, ...wardrobe].reduce((sum, item) => sum + item.estimatedCost, 0)
    const obtainedItems = [...props, ...wardrobe].filter(item => item.procurementStatus === 'obtained' || item.procurementStatus === 'packed').length

    if (isArcContext) {
      return {
        arcTitle: episodeTitle,
        arcIndex: arcIndex ?? 0,
        episodeNumbers: episodeNumbers || [],
        totalItems: props.length + wardrobe.length,
        obtainedItems,
        totalCost,
        props,
        wardrobe,
        lastUpdated: Date.now(),
        updatedBy: 'system'
      }
    }

    return {
      episodeNumber,
      episodeTitle,
      totalItems: props.length + wardrobe.length,
      obtainedItems,
      totalCost,
      props,
      wardrobe,
      lastUpdated: Date.now(),
      updatedBy: 'system'
    }
  } catch (error) {
    console.error('Failed to parse props/wardrobe:', error)
    console.error('AI Response:', aiResponse)
    throw new Error(`Failed to parse props/wardrobe: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}


