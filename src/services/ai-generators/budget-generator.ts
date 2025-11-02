/**
 * Budget Generator - AI Service
 * Analyzes script and breakdown to suggest realistic OPTIONAL budget items
 * 
 * Uses EngineAIRouter with Gemini 2.5 Pro
 * 
 * Budget Structure:
 * - BASE budget: From Script Breakdown (extras, props, locations) - READ-ONLY
 * - OPTIONAL budget: AI-suggested PRODUCTION crew & equipment - USER-CONTROLLED
 * - TOTAL: BASE + selected OPTIONAL items
 * 
 * IMPORTANT: Greenlit AI automates ALL post-production (editing, color, sound mix, VFX, music).
 * Only suggest PRODUCTION crew (on-set) and equipment rental.
 */

import { EngineAIRouter } from '@/services/engine-ai-router'
import type { ScriptBreakdownData } from '@/types/preproduction'

interface BudgetGenerationParams {
  scriptData: any  // GeneratedScript from Scripts tab
  breakdownData: ScriptBreakdownData  // From Script Breakdown tab
  storyBible: any
  episodeNumber: number
}

export interface BaseBudget {
  extras: number
  props: number
  locations: number
  total: number
  source: 'script-breakdown'
}

export interface BudgetLineItem {
  id: string
  role?: string  // for crew
  item?: string  // for equipment/misc
  costRange: [number, number]
  suggestedCost: number
  necessity: 'highly-recommended' | 'recommended' | 'optional'
  reason: string
  included: boolean
  custom?: boolean
}

export interface OptionalBudget {
  crew: BudgetLineItem[]  // PRODUCTION crew only (camera op, sound person, gaffer, PA)
  equipment: BudgetLineItem[]  // Rental equipment (camera, lights, audio gear)
  miscellaneous: BudgetLineItem[]  // Catering, transport, insurance, permits
  total: number
  // NOTE: No post-production - Greenlit AI automates editing, color, sound mix, VFX, music!
}

export interface BudgetAnalysis {
  baseOnly: number
  withHighlyRecommended: number
  withRecommended: number
  withAll: number
  withinRange: boolean
  recommendation: string
}

export interface GeneratedBudget {
  baseBudget: BaseBudget
  optionalBudget: OptionalBudget
  totalBudget: number
  budgetAnalysis: BudgetAnalysis
  generated: true
  lastGenerated: number
  status: 'draft'
}

/**
 * Generate budget suggestions from script and breakdown
 */
export async function generateBudget(params: BudgetGenerationParams): Promise<GeneratedBudget> {
  const { scriptData, breakdownData, storyBible, episodeNumber } = params

  console.log('💰 Generating budget for Episode', episodeNumber)
  console.log('📊 BASE budget from breakdown:', breakdownData.totalBudgetImpact)

  // 1. Extract BASE budget from breakdown
  const baseBudget = extractBaseBudget(breakdownData)
  console.log('✅ BASE budget calculated:', baseBudget.total)

  // 2. Build AI prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(params, baseBudget)

  try {
    // 3. Call AI to suggest OPTIONAL items
    console.log('🤖 Calling AI for OPTIONAL budget suggestions...')
    const response = await EngineAIRouter.generateContent({
      prompt: userPrompt,
      systemPrompt: systemPrompt,
      temperature: 0.7, // Balanced suggestions
      maxTokens: 8000,
      engineId: 'budget-generator',
      forceProvider: 'gemini' // Gemini excels at analytical tasks
    })

    console.log('✅ AI Response received:', response.metadata.contentLength, 'characters')

    // 4. Parse AI response into structured data
    const optionalBudget = parseOptionalBudget(response.content)
    
    // 5. Generate budget analysis
    const budgetAnalysis = generateBudgetAnalysis(baseBudget, optionalBudget)

    // 6. Calculate totals
    const totalBudget = baseBudget.total + optionalBudget.total

    console.log('✅ Budget generated successfully!')
    console.log('  BASE:', `$${baseBudget.total}`)
    console.log('  OPTIONAL (all):', `$${optionalBudget.total}`)
    console.log('  TOTAL:', `$${totalBudget}`)

    return {
      baseBudget,
      optionalBudget,
      totalBudget,
      budgetAnalysis,
      generated: true,
      lastGenerated: Date.now(),
      status: 'draft'
    }
  } catch (error) {
    console.error('❌ Error generating budget:', error)
    throw new Error(`Budget generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract BASE budget from Script Breakdown
 */
function extractBaseBudget(breakdown: ScriptBreakdownData): BaseBudget {
  // Calculate costs by category
  let extras = 0
  let props = 0
  let locations = 0

  breakdown.scenes.forEach(scene => {
    // Extras cost (characters marked as "background" or with 0 lines)
    const extrasInScene = scene.characters.filter(
      char => char.importance === 'background' || char.lineCount === 0
    )
    extras += extrasInScene.length * 15 // Avg $15/day per extra

    // Props cost
    scene.props.forEach(prop => {
      props += prop.estimatedCost || 0
    })

    // Location cost (if special requirements or fees mentioned)
    if (scene.specialRequirements?.some(req => 
      req.toLowerCase().includes('fee') || 
      req.toLowerCase().includes('rental') ||
      req.toLowerCase().includes('permit')
    )) {
      locations += 50 // Estimated location fee
    }
  })

  const total = breakdown.totalBudgetImpact

  return {
    extras,
    props,
    locations: total - extras - props, // Remaining goes to locations
    total,
    source: 'script-breakdown'
  }
}

/**
 * Build system prompt for AI
 */
function buildSystemPrompt(): string {
  return `You are a micro-budget film production advisor analyzing a 5-minute web series episode.

Your job is to suggest OPTIONAL PRODUCTION crew and equipment based on the script and breakdown complexity.

**CRITICAL RULES:**

1. **BASE BUDGET IS FIXED**
   - Extras, props, locations come from Script Breakdown
   - You CANNOT change BASE budget
   - Only suggest OPTIONAL production items

2. **GREENLIT AI AUTOMATES POST-PRODUCTION**
   - 🚫 DO NOT SUGGEST: Editors, colorists, sound mixers, VFX artists, music composers
   - ✅ GREENLIT AI HANDLES: All editing, color grading, sound mixing, VFX, music generation
   - ✅ ONLY SUGGEST: ON-SET production crew and equipment

3. **UGC ULTRA-MICRO-BUDGET FOCUS**
   - Total series: $1k-$20k for ALL 32 episodes
   - Per episode target: $30-$625
   - BASE budget already calculated
   - OPTIONAL budget should fit within remaining budget

4. **PRODUCTION CREW (ON-SET ONLY)**
   - Camera Operator/DP: $100-$300/day (indie rates)
   - Sound Person (on-set recording): $100-$200/day
   - Gaffer/Lighting Tech: $100-$200/day
   - PA/Production Assistant: $50-$100/day
   - Grip: $75-$150/day
   - Give cost RANGES [min, max]

5. **SUGGESTION PRIORITIES**
   - "highly-recommended": Essential for production quality (sound person for recording)
   - "recommended": Improves production (camera operator, gaffer)
   - "optional": Nice to have (PA, grip, additional crew)

6. **JUSTIFY SUGGESTIONS**
   - Each item needs a REASON based on script analysis
   - "3 different locations require experienced camera operator" (specific)
   - NOT "professional look" (vague)

7. **BUDGET AWARENESS**
   - If BASE is $165 and target is $625, you have $460 for OPTIONAL
   - Prioritize most impactful items
   - Warn if all suggestions exceed remaining budget

8. **OUTPUT FORMAT**
   - Valid JSON only
   - No markdown, no code blocks, no explanations
   - Match the exact structure specified`
}

/**
 * Build user prompt with all context
 */
function buildUserPrompt(
  params: BudgetGenerationParams,
  baseBudget: BaseBudget
): string {
  const { scriptData, breakdownData, storyBible, episodeNumber } = params

  let prompt = `Analyze this episode and suggest OPTIONAL budget items.\n\n`

  // Series context
  prompt += `**SERIES INFORMATION:**\n`
  prompt += `Title: ${storyBible.seriesTitle || storyBible.title || 'Untitled'}\n`
  prompt += `Genre: ${storyBible.genre || 'Drama'}\n`
  prompt += `Format: UGC Web Series (5-minute episodes)\n`
  prompt += `Series Budget: $1,000 - $20,000 for ALL 32 episodes\n`
  prompt += `Target per episode: $30-$625\n\n`

  // Episode info
  prompt += `**EPISODE ${episodeNumber}:**\n`
  prompt += `Title: ${scriptData.title || 'Untitled'}\n`
  prompt += `Runtime: ~${scriptData.metadata?.estimatedRuntime || '5 minutes'}\n\n`

  // BASE budget (fixed)
  prompt += `**BASE BUDGET (from Script Breakdown - FIXED):**\n`
  prompt += `Total: $${baseBudget.total}\n`
  prompt += `  - Extras: $${baseBudget.extras}\n`
  prompt += `  - Props: $${baseBudget.props}\n`
  prompt += `  - Locations: $${baseBudget.locations}\n\n`

  // Script complexity analysis
  prompt += `**SCRIPT COMPLEXITY:**\n`
  prompt += `Scenes: ${breakdownData.totalScenes}\n`
  prompt += `Total shoot time: ${breakdownData.totalEstimatedTime} minutes\n`
  prompt += `Unique locations: ${new Set(breakdownData.scenes.map(s => s.location)).size}\n`
  prompt += `Total characters: ${new Set(breakdownData.scenes.flatMap(s => s.characters.map(c => c.name))).size}\n\n`

  // Scene breakdown overview
  prompt += `**SCENES OVERVIEW:**\n`
  breakdownData.scenes.forEach((scene, idx) => {
    prompt += `Scene ${idx + 1}: ${scene.location} (${scene.timeOfDay})\n`
    prompt += `  - Characters: ${scene.characters.length}\n`
    prompt += `  - Props: ${scene.props.length}\n`
    prompt += `  - Shoot time: ${scene.estimatedShootTime} min\n`
    prompt += `  - Special needs: ${scene.specialRequirements.join(', ') || 'None'}\n`
    prompt += `  - Budget: $${scene.budgetImpact}\n\n`
  })

  // Budget calculation
  const remaining = 625 - baseBudget.total
  prompt += `**BUDGET CALCULATION:**\n`
  prompt += `Episode target: $625\n`
  prompt += `BASE budget (fixed): $${baseBudget.total}\n`
  prompt += `Remaining for OPTIONAL: $${remaining}\n\n`

  // Request format
  prompt += `**TASK:**\n`
  prompt += `Suggest OPTIONAL items in these categories:\n`
  prompt += `1. PRODUCTION Crew (camera operator, sound person for on-set recording, gaffer/lighting tech, PA, grip)\n`
  prompt += `2. Equipment Rental (camera package, audio gear, lighting kit, stabilizer, lenses)\n`
  prompt += `3. Miscellaneous (catering, transportation, insurance, additional permits)\n\n`
  prompt += `**IMPORTANT:** DO NOT suggest post-production crew! Greenlit AI automates all editing, color grading, sound mixing, VFX, and music generation.\n\n`

  prompt += `For each item, provide:\n`
  prompt += `- role or item name\n`
  prompt += `- costRange: [min, max] (realistic UGC rates)\n`
  prompt += `- suggestedCost: number (mid-point or realistic estimate)\n`
  prompt += `- necessity: "highly-recommended" | "recommended" | "optional"\n`
  prompt += `- reason: specific justification based on script analysis\n`
  prompt += `- included: true (default - user can toggle off)\n\n`

  // Output format
  prompt += `**OUTPUT FORMAT:**\n\n`
  prompt += `Provide ONLY valid JSON with this structure:\n\n`
  prompt += `{\n`
  prompt += `  "crew": [\n`
  prompt += `    {\n`
  prompt += `      "id": "crew-1",\n`
  prompt += `      "role": "Camera Operator",\n`
  prompt += `      "costRange": [100, 300],\n`
  prompt += `      "suggestedCost": 200,\n`
  prompt += `      "necessity": "recommended",\n`
  prompt += `      "reason": "3 different locations with varying lighting conditions require experienced camera work for consistent production quality",\n`
  prompt += `      "included": true\n`
  prompt += `    },\n`
  prompt += `    {\n`
  prompt += `      "id": "crew-2",\n`
  prompt += `      "role": "Sound Person (On-Set Recording)",\n`
  prompt += `      "costRange": [100, 200],\n`
  prompt += `      "suggestedCost": 150,\n`
  prompt += `      "necessity": "highly-recommended",\n`
  prompt += `      "reason": "Clean dialogue recording across 3 locations is critical - Greenlit AI will handle post-production mixing",\n`
  prompt += `      "included": true\n`
  prompt += `    }\n`
  prompt += `  ],\n`
  prompt += `  "equipment": [...],\n`
  prompt += `  "miscellaneous": [...]\n`
  prompt += `}\n\n`

  prompt += `**CRITICAL REMINDERS:**\n`
  prompt += `- Output ONLY valid JSON (no markdown, no code blocks, no explanation)\n`
  prompt += `- Base budget is FIXED at $${baseBudget.total}\n`
  prompt += `- You have $${remaining} remaining for OPTIONAL items\n`
  prompt += `- 🚫 NO POST-PRODUCTION CREW (Greenlit AI automates editing, color, sound, VFX, music)\n`
  prompt += `- ✅ ONLY PRODUCTION crew (on-set camera, sound recording, lighting, etc.)\n`
  prompt += `- Prioritize by necessity (highly-recommended > recommended > optional)\n`
  prompt += `- Justify each item with specific script/breakdown analysis\n`
  prompt += `- Use realistic UGC micro-budget rates\n`
  prompt += `- All items are SUGGESTIONS (user can accept/reject)\n`

  return prompt
}

/**
 * Parse AI response into structured optional budget
 */
function parseOptionalBudget(aiResponse: string): OptionalBudget {
  try {
    // Clean response (remove markdown code blocks if present)
    let cleanedResponse = aiResponse.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '')
    }

    const parsed = JSON.parse(cleanedResponse)

    // Convert arrays to BudgetLineItem[]
    const crew: BudgetLineItem[] = (parsed.crew || []).map((item: any, idx: number) => ({
      id: item.id || `crew-${idx + 1}`,
      role: item.role,
      costRange: item.costRange,
      suggestedCost: item.suggestedCost,
      necessity: item.necessity,
      reason: item.reason,
      included: item.included !== false
    }))

    const equipment: BudgetLineItem[] = (parsed.equipment || []).map((item: any, idx: number) => ({
      id: item.id || `equipment-${idx + 1}`,
      item: item.item,
      costRange: item.costRange,
      suggestedCost: item.suggestedCost,
      necessity: item.necessity,
      reason: item.reason,
      included: item.included !== false
    }))

    const miscellaneous: BudgetLineItem[] = (parsed.miscellaneous || []).map((item: any, idx: number) => ({
      id: item.id || `misc-${idx + 1}`,
      item: item.item,
      costRange: item.costRange,
      suggestedCost: item.suggestedCost,
      necessity: item.necessity,
      reason: item.reason,
      included: item.included !== false
    }))

    // Calculate total (only included items)
    const total = [
      ...crew,
      ...equipment,
      ...miscellaneous
    ].reduce((sum, item) => sum + (item.included ? item.suggestedCost : 0), 0)

    return {
      crew,
      equipment,
      miscellaneous,
      total
    }
  } catch (error) {
    console.error('❌ Error parsing AI response:', error)
    console.error('Response:', aiResponse)
    throw new Error('Failed to parse AI budget suggestions')
  }
}

/**
 * Generate budget analysis
 */
function generateBudgetAnalysis(
  baseBudget: BaseBudget,
  optionalBudget: OptionalBudget
): BudgetAnalysis {
  const allItems = [
    ...optionalBudget.crew,
    ...optionalBudget.equipment,
    ...optionalBudget.miscellaneous
  ]

  const highlyRecommendedCost = allItems
    .filter(item => item.necessity === 'highly-recommended')
    .reduce((sum, item) => sum + item.suggestedCost, 0)

  const recommendedCost = allItems
    .filter(item => item.necessity === 'recommended' || item.necessity === 'highly-recommended')
    .reduce((sum, item) => sum + item.suggestedCost, 0)

  const allCost = allItems.reduce((sum, item) => sum + item.suggestedCost, 0)

  const baseOnly = baseBudget.total
  const withHighlyRecommended = baseOnly + highlyRecommendedCost
  const withRecommended = baseOnly + recommendedCost
  const withAll = baseOnly + allCost

  const withinRange = withRecommended <= 625

  let recommendation = ''
  if (withHighlyRecommended <= 625) {
    recommendation = '✅ Budget is within range with highly-recommended items. Consider adding recommended items if budget allows.'
  } else if (withRecommended <= 625) {
    recommendation = '⚠️ Select only highly-recommended items to stay within budget. Review optional items carefully.'
  } else {
    recommendation = `🔴 Even with just highly-recommended items, budget exceeds $625 target. Current total with highly-recommended: $${withHighlyRecommended}. Consider reducing or removing items.`
  }

  return {
    baseOnly,
    withHighlyRecommended,
    withRecommended,
    withAll,
    withinRange,
    recommendation
  }
}

