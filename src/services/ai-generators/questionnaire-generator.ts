/**
 * Questionnaire Generator - AI Service
 * Generates contextual questions based on episode/script/breakdown for Props/Wardrobe and Equipment generation
 * 
 * Uses EngineAIRouter with Gemini 3 Pro Preview for contextual understanding
 * 
 * Standards:
 * - Generate project-specific questions tailored to script content
 * - Categorize questions for easy UI display
 * - Focus on micro-budget production constraints ($1k-$20k series total)
 * - Gather critical context before generating props/wardrobe/equipment breakdowns
 */

import { EngineAIRouter } from '@/services/engine-ai-router'
import type { ScriptBreakdownData, CastingData } from '@/types/preproduction'

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

interface QuestionnaireGenerationParams {
  scriptData: GeneratedScript
  breakdownData: ScriptBreakdownData
  storyBible: any
  castingData?: CastingData
  episodeNumber: number
  episodeTitle: string
  questionnaireType: 'props-wardrobe' | 'equipment' | 'both'
  isArcContext?: boolean
  episodeNumbers?: number[]
}

export interface QuestionnaireQuestion {
  id: string
  category: 'cast-capabilities' | 'production-crew' | 'existing-equipment' | 'budget-constraints' | 'materials-access' | 'logistics'
  question: string
  type: 'yes-no' | 'multiple-choice' | 'text' | 'number'
  options?: string[] // For multiple-choice
  required: boolean
  helpText?: string // Contextual help
}

export interface Questionnaire {
  id: string
  questionnaireType: 'props-wardrobe' | 'equipment' | 'both'
  episodeNumber: number
  episodeTitle: string
  categories: {
    category: string
    questions: QuestionnaireQuestion[]
  }[]
  generatedAt: number
}

/**
 * Generate contextual questionnaire for Props/Wardrobe and/or Equipment
 */
export async function generateQuestionnaire(params: QuestionnaireGenerationParams): Promise<Questionnaire> {
  const { scriptData, breakdownData, storyBible, castingData, episodeNumber, episodeTitle, questionnaireType, isArcContext, episodeNumbers } = params

  console.log('❓ Generating questionnaire for', questionnaireType)
  console.log('📋 Analyzing', breakdownData.scenes.length, 'scenes')
  console.log('  Context:', isArcContext ? `ARC (${episodeNumbers?.length || 0} episodes)` : `EPISODE ${episodeNumber}`)

  // Build AI prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(scriptData, breakdownData, storyBible, castingData, episodeTitle, questionnaireType, isArcContext, episodeNumbers)

  try {
    // Use EngineAIRouter with Gemini 3 Pro Preview (analytical + contextual understanding)
    console.log('🤖 Calling AI for questionnaire generation...')
    const response = await EngineAIRouter.generateContent({
      prompt: userPrompt,
      systemPrompt: systemPrompt,
      temperature: 0.3, // Lower temperature for more consistent, logical questions
      maxTokens: 4000, // Enough for structured questions
      engineId: 'questionnaire-generator',
      forceProvider: 'gemini' // Gemini excels at contextual understanding
    })

    console.log('✅ AI Response received:', response.metadata.contentLength, 'characters')
    
    // Parse AI response into structured questionnaire
    const questionnaire = parseQuestionnaire(response.content, questionnaireType, episodeNumber, episodeTitle, isArcContext)
    
    console.log('✅ Questionnaire generated:', questionnaire.categories.length, 'categories')
    console.log('  Total questions:', questionnaire.categories.reduce((sum, cat) => sum + cat.questions.length, 0))
    
    return questionnaire
  } catch (error) {
    console.error('❌ Error generating questionnaire:', error)
    throw new Error(`Questionnaire generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Build system prompt for AI
 */
function buildSystemPrompt(): string {
  return `You are a production coordinator creating a pre-production questionnaire for a micro-budget web series ($1k-$20k total series budget, 5-minute episodes).

Your job is to generate contextual, project-specific questions that gather critical information before generating props/wardrobe and equipment breakdowns.

**CRITICAL RULES:**

1. **QUESTION QUALITY**
   - Questions must be SPECIFIC to this project (based on script/breakdown)
   - Avoid generic questions - tailor to actual script content
   - Questions should feel natural, not overwhelming
   - Maximum 12-15 questions total

2. **CATEGORIZATION**
   - Cast Capabilities: Actor equipment/materials, locations
   - Production Crew: Hiring crew vs DIY, what roles
   - Existing Equipment: What equipment already owned
   - Budget Constraints: Micro-budget specifics
   - Materials Access: Cast connections for props/wardrobe
   - Logistics: Transportation, storage, timing

3. **QUESTION TYPES**
   - Yes/No: Simple boolean answers
   - Multiple Choice: 2-5 options
   - Text: Short answer (1-2 sentences)
   - Number: Specific quantities, costs, days

4. **MICRO-BUDGET FOCUS**
   - Prioritize questions that affect cost
   - Ask about existing resources (owned equipment, cast-owned props)
   - Identify opportunities to save money
   - Consider DIY/borrow options

5. **CONTEXTUAL RELEVANCE**
   - If script has outdoor scenes → ask about weather gear, lighting for outdoor
   - If script has special props → ask if cast can source/borrow
   - If script has many characters → ask about wardrobe budget
   - If script has action scenes → ask about safety equipment

6. **OUTPUT FORMAT**
   - Valid JSON only
   - No markdown, no code blocks, no explanations
   - Match the exact structure specified`
}

/**
 * Build user prompt with all context
 */
function buildUserPrompt(
  scriptData: GeneratedScript,
  breakdownData: ScriptBreakdownData,
  storyBible: any,
  castingData: CastingData | undefined,
  episodeTitle: string,
  questionnaireType: 'props-wardrobe' | 'equipment' | 'both',
  isArcContext?: boolean,
  episodeNumbers?: number[]
): string {
  const contextLabel = isArcContext ? `arc (${episodeNumbers?.length || 0} episodes)` : `episode`
  const contextName = isArcContext ? episodeTitle : episodeTitle
  let prompt = `Generate a contextual questionnaire for ${questionnaireType === 'both' ? 'Props/Wardrobe and Equipment' : questionnaireType === 'props-wardrobe' ? 'Props/Wardrobe' : 'Equipment'} generation for this ${contextName} ${contextLabel}.\n\n`

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
    prompt += `World Rules: ${typeof storyBible.worldBuilding.rules === 'string' ? storyBible.worldBuilding.rules.substring(0, 150) : ''}\n`
  }
  prompt += `Production Budget: $1k-$20k TOTAL for entire series (32 episodes)\n`
  prompt += `Episode Runtime: ~5 minutes\n\n`

  // Episode/Arc context
  if (isArcContext) {
    prompt += `**ARC:** ${episodeTitle}\n`
    prompt += `Episodes: ${episodeNumbers?.length || 0}\n`
    prompt += `Total Scenes: ${breakdownData.scenes.length} (across all episodes)\n`
    // Aggregate unique characters from all scenes
    const uniqueCharacters = new Set(breakdownData.scenes.flatMap(s => s.characters?.map((c: any) => c.name) || []))
    prompt += `Total Characters: ${uniqueCharacters.size} (across all episodes)\n\n`
  } else {
    prompt += `**EPISODE:** ${episodeTitle}\n`
    prompt += `Scenes: ${breakdownData.scenes.length}\n`
    // Calculate unique characters from scenes
    const uniqueCharacters = new Set(breakdownData.scenes.flatMap(s => s.characters?.map((c: any) => c.name) || []))
    prompt += `Characters: ${uniqueCharacters.size}\n\n`
  }

  // Script breakdown highlights
  prompt += `**SCRIPT BREAKDOWN HIGHLIGHTS:**\n`
  
  // Location types
  const locationTypes = breakdownData.scenes.map(s => s.location?.includes('INT') ? 'Interior' : 'Exterior')
  const interiorCount = locationTypes.filter(t => t === 'Interior').length
  const exteriorCount = locationTypes.filter(t => t === 'Exterior').length
  prompt += `- Interior scenes: ${interiorCount}, Exterior scenes: ${exteriorCount}\n`

  // Props summary
  if (breakdownData.scenes.some(s => s.props && s.props.length > 0)) {
    const allProps = breakdownData.scenes.flatMap(s => s.props || [])
    prompt += `- Props identified: ${allProps.length} total\n`
    if (allProps.length > 0) {
      prompt += `  Key props: ${allProps.slice(0, 5).map(p => p.item).join(', ')}\n`
    }
  }

  // Characters
  if (breakdownData.scenes.some(s => s.characters && s.characters.length > 0)) {
    const uniqueCharacters = new Set(breakdownData.scenes.flatMap(s => s.characters?.map(c => c.name) || []))
    prompt += `- Characters: ${Array.from(uniqueCharacters).join(', ')}\n`
  }

  // Cast information (if available)
  if (castingData?.cast && castingData.cast.length > 0) {
    prompt += `\n**CAST INFORMATION:**\n`
    const confirmedCast = castingData.cast.filter(c => c.status === 'confirmed')
    prompt += `- Confirmed actors: ${confirmedCast.length}\n`
    const castWithLocation = confirmedCast.filter(c => c.city || c.state || c.country)
    if (castWithLocation.length > 0) {
      prompt += `- Actors with location data: ${castWithLocation.length}\n`
    }
  }

  prompt += `\n`

  // Task description
  prompt += `**TASK:**\n`
  if (isArcContext) {
    prompt += `Generate 8-12 contextual questions that will help generate accurate ${questionnaireType === 'both' ? 'props/wardrobe and equipment' : questionnaireType} breakdowns for the ENTIRE ARC (all ${episodeNumbers?.length || 0} episodes).\n\n`
    prompt += `Questions should:\n`
    prompt += `1. Be specific to THIS ARC's needs across all episodes (not generic)\n`
    prompt += `2. Identify cost-saving opportunities for the entire arc (owned equipment, cast-owned props)\n`
    prompt += `3. Gather information about existing resources for the whole series\n`
    prompt += `4. Consider micro-budget constraints for the entire arc\n`
    prompt += `5. Cover all relevant categories for arc-wide production\n`
    prompt += `6. Ask about resources that will be shared across multiple episodes\n\n`
  } else {
    prompt += `Generate 8-12 contextual questions that will help generate accurate ${questionnaireType === 'both' ? 'props/wardrobe and equipment' : questionnaireType} breakdowns.\n\n`
    prompt += `Questions should:\n`
    prompt += `1. Be specific to THIS script's needs (not generic)\n`
    prompt += `2. Identify cost-saving opportunities (owned equipment, cast-owned props)\n`
    prompt += `3. Gather information about existing resources\n`
    prompt += `4. Consider micro-budget constraints\n`
    prompt += `5. Cover all relevant categories\n\n`
  }

  prompt += `**OUTPUT FORMAT:**\n\n`
  prompt += `Return a JSON object with this structure:\n`
  prompt += `{\n`
  prompt += `  "categories": [\n`
  prompt += `    {\n`
  prompt += `      "category": "cast-capabilities",\n`
  prompt += `      "questions": [\n`
  prompt += `        {\n`
  prompt += `          "id": "q1",\n`
  prompt += `          "category": "cast-capabilities",\n`
  prompt += `          "question": "Do any cast members own cameras or production equipment?",\n`
  prompt += `          "type": "yes-no",\n`
  prompt += `          "required": true,\n`
  prompt += `          "helpText": "This helps identify existing equipment to avoid rental costs"\n`
  prompt += `        }\n`
  prompt += `      ]\n`
  prompt += `    }\n`
  prompt += `  ]\n`
  prompt += `}\n\n`

  prompt += `Valid question types: "yes-no", "multiple-choice", "text", "number"\n`
  prompt += `Valid categories: "cast-capabilities", "production-crew", "existing-equipment", "budget-constraints", "materials-access", "logistics"\n`
  prompt += `For multiple-choice, include "options" array with 2-5 choices.\n`
  prompt += `Keep helpText concise (one sentence).\n\n`

  prompt += `**CRITICAL REMINDERS:**\n`
  prompt += `- Output ONLY valid JSON (no markdown, no code blocks)\n`
  prompt += `- Generate questions specific to THIS script\n`
  prompt += `- Maximum 15 questions total\n`
  prompt += `- Questions should feel natural and conversational\n`

  return prompt
}

/**
 * Parse AI response into structured questionnaire
 */
function parseQuestionnaire(
  aiResponse: string,
  questionnaireType: 'props-wardrobe' | 'equipment' | 'both',
  episodeNumber: number,
  episodeTitle: string,
  isArcContext?: boolean
): Questionnaire {
  try {
    // Clean AI output (remove markdown code blocks if present)
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
    if (!parsed.categories || !Array.isArray(parsed.categories)) {
      throw new Error('Invalid questionnaire structure: missing categories array')
    }

    const categories = parsed.categories.map((cat: any, idx: number) => ({
      category: cat.category || `category-${idx + 1}`,
      questions: (cat.questions || []).map((q: any, qIdx: number) => ({
        id: q.id || `q_${idx}_${qIdx}`,
        category: q.category || cat.category || `category-${idx + 1}`,
        question: q.question || '',
        type: q.type || 'text',
        options: q.options || undefined,
        required: q.required !== undefined ? q.required : true,
        helpText: q.helpText || undefined
      }))
    }))

    return {
      id: `questionnaire_${Date.now()}`,
      questionnaireType,
      episodeNumber,
      episodeTitle,
      categories,
      generatedAt: Date.now()
    }
  } catch (error) {
    console.error('Failed to parse questionnaire:', error)
    console.error('AI Response:', aiResponse)
    throw new Error(`Failed to parse questionnaire: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}


