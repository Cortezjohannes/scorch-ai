/**
 * Script Breakdown Generator - AI Service
 * Analyzes Hollywood-grade screenplays and generates micro-budget production breakdowns
 * 
 * Uses EngineAIRouter with Gemini 2.5 Pro for analytical tasks
 * 
 * Standards:
 * - Extract ONLY what exists in the screenplay
 * - Focus on micro-budget production ($1k-$20k range)
 * - Scene-by-scene analysis with cast, props, locations, equipment, budget
 * - Practical, actionable breakdown for indie web series
 */

import { EngineAIRouter } from '@/services/engine-ai-router'
import type { ScriptBreakdownData, ScriptBreakdownScene, ScriptBreakdownCharacter, ScriptBreakdownProp } from '@/types/preproduction'

interface GeneratedScript {
  title: string
  episodeNumber: number
  pages: ScriptPage[]
  metadata: {
    pageCount: number
    sceneCount: number
    characterCount: number
    estimatedRuntime: string
    generatedAt: number
  }
}

interface ScriptPage {
  pageNumber: number
  elements: ScriptElement[]
}

interface ScriptElement {
  type: 'slug' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'page-break'
  content: string
  metadata?: {
    sceneNumber?: number
    characterName?: string
  }
}

interface BreakdownGenerationParams {
  script: GeneratedScript
  storyBible: any
  episodeNumber: number
  episodeTitle: string
}

/**
 * Generate script breakdown from screenplay
 */
export async function generateScriptBreakdown(params: BreakdownGenerationParams): Promise<ScriptBreakdownData> {
  const { script, storyBible, episodeNumber, episodeTitle } = params

  console.log('📋 Generating script breakdown for Episode', episodeNumber)
  console.log('📄 Analyzing', script.metadata.sceneCount, 'scenes')

  // Extract scenes from screenplay
  const scriptScenes = parseScriptToScenes(script)
  
  console.log('✅ Extracted', scriptScenes.length, 'scenes from screenplay')

  // Build AI prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(script, storyBible, scriptScenes)

  try {
    // Use EngineAIRouter with Gemini 2.5 Pro (analytical tasks)
    const response = await EngineAIRouter.generateContent({
      prompt: userPrompt,
      systemPrompt: systemPrompt,
      temperature: 0.6, // Balanced - creative but consistent
      maxTokens: 8000, // Enough for detailed breakdown
      engineId: 'script-breakdown-generator',
      forceProvider: 'gemini' // Gemini excels at analysis
    })

    console.log('✅ AI Response received:', response.metadata.contentLength, 'characters')
    
    // Parse AI response into structured breakdown
    const structuredBreakdown = structureBreakdownData(response.content, script, episodeNumber, episodeTitle)
    
    console.log('✅ Breakdown generated:', structuredBreakdown.scenes.length, 'scenes')
    console.log('💰 Total budget impact: $', structuredBreakdown.totalBudgetImpact)
    
    return structuredBreakdown
  } catch (error) {
    console.error('❌ Error generating breakdown:', error)
    throw new Error(`Breakdown generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract scenes from GeneratedScript structure
 */
function parseScriptToScenes(script: GeneratedScript): Array<{
  sceneNumber: number
  heading: string
  content: string
  pageStart: number
  pageEnd: number
}> {
  const scenes: Array<{
    sceneNumber: number
    heading: string
    content: string
    pageStart: number
    pageEnd: number
  }> = []

  let currentScene: any = null
  let sceneContent: string[] = []

  for (const page of script.pages) {
    for (const element of page.elements) {
      if (element.type === 'slug' && element.metadata?.sceneNumber) {
        // Save previous scene if exists
        if (currentScene) {
          currentScene.content = sceneContent.join('\n')
          currentScene.pageEnd = page.pageNumber
          scenes.push(currentScene)
        }

        // Start new scene
        currentScene = {
          sceneNumber: element.metadata.sceneNumber,
          heading: element.content,
          content: '',
          pageStart: page.pageNumber,
          pageEnd: page.pageNumber
        }
        sceneContent = [element.content]
      } else if (currentScene) {
        // Add to current scene content
        if (element.content.trim()) {
          sceneContent.push(element.content)
        }
      }
    }
  }

  // Save last scene
  if (currentScene) {
    currentScene.content = sceneContent.join('\n')
    currentScene.pageEnd = script.pages[script.pages.length - 1]?.pageNumber || currentScene.pageStart
    scenes.push(currentScene)
  }

  return scenes
}

/**
 * Build system prompt for AI
 */
function buildSystemPrompt(): string {
  return `You are a professional production coordinator analyzing a screenplay for micro-budget web series production ($1k-$20k total budget per episode).

**YOUR ROLE:**
- Analyze the screenplay scene-by-scene
- Extract ALL production elements that exist in the script
- Provide realistic micro-budget cost estimates
- Focus on practical, actionable breakdown for indie filmmakers

**STRICT RULES:**

1. **EXTRACT ONLY - DO NOT INVENT**
   - List ONLY characters that speak or are described in the script
   - List ONLY props that are mentioned or used in the script
   - List ONLY locations that appear in the script
   - Do NOT add equipment, props, or requirements not in the script

2. **ULTRA-MICRO-BUDGET FOCUS (UGC WEB SERIES)**
   - Total SERIES budget: $1k-$20k for ALL 32 episodes
   - Per episode budget: $30-$625 (depending on series budget and episode complexity)
   - Simple dialogue scene: $5-$50 (minimal props, free location)
   - Scene with extras/props: $70-$190 (extras $30-$40/day, cheap props)
   - Complex location scene: $100-$200 (location fee + props)
   - ACTORS ARE NOT PAID (revenue share model)
   - CREW IS NOT INCLUDED (optional, added in Budget tab)
   - Focus on absolute essentials: extras, props, location fees only

3. **CHARACTER ANALYSIS**
   - Count dialogue lines per character per scene
   - Classify importance: "lead" (main character), "supporting" (significant role), "background" (minimal lines)
   - Only count characters who actually appear in that specific scene

4. **PROP ANALYSIS**
   - List items characters physically interact with
   - Classify importance: "hero" (featured/critical), "secondary" (noticeable), "background" (set dressing)
   - Source: "buy" ($5-$50), "rent" ($20-$100), "borrow" (free), "actor-owned" (free)
   - UGC reality: Most props are cheap/borrowed/actor-owned
   - Budget: $5-$50 per prop (aim for low end)

5. **LOCATION & TIME ANALYSIS**
   - Extract from slug line: INT./EXT. and location name
   - Time of day: DAY, NIGHT, SUNRISE, SUNSET, MAGIC_HOUR
   - Keep location names exactly as written in slug lines

6. **SHOOT TIME ESTIMATION (5-MINUTE EPISODES)**
   - These are SHORT episodes (5 min = 5 pages) with REHEARSED actors
   - Multiple episodes shot per day (actors are prepared)
   - Simple dialogue scene: 15-30 minutes total
   - Scene with movement/blocking: 30-45 minutes total
   - Complex scene (multiple actors/action): 45-90 minutes total
   - Total per episode: 30 min - 2 hours maximum
   - DO NOT over-estimate (actors rehearse beforehand!)

7. **EQUIPMENT NEEDS**
   - Only list special equipment if the scene clearly requires it
   - Examples: stabilizer for moving shots, lights for night scenes, microphones for outdoor scenes
   - Assume basic camera/audio gear is already available
   - Don't over-specify - keep it simple

8. **OUTPUT FORMAT**
   - Provide structured JSON output
   - One scene object per scene in the screenplay
   - Include all required fields
   - Use exact location names from slug lines
   - Be specific and practical

**REMEMBER:** You're helping indie filmmakers plan a realistic, affordable shoot. Extract what's in the script, estimate fairly, and keep it practical.`
}

/**
 * Build user prompt with script context
 */
function buildUserPrompt(
  script: GeneratedScript,
  storyBible: any,
  scriptScenes: Array<{ sceneNumber: number; heading: string; content: string }>
): string {
  let prompt = `Analyze this screenplay and create a detailed production breakdown for micro-budget filming.\n\n`

  // Series context
  prompt += `**SERIES INFORMATION:**\n`
  prompt += `Title: ${storyBible.seriesTitle || storyBible.title || 'Untitled Series'}\n`
  prompt += `Genre: ${storyBible.genre || 'Drama'}\n`
  prompt += `Format: UGC Web Series (User-Generated Content)\n`
  prompt += `Total Series Budget: $1,000 - $20,000 for ALL 32 episodes\n`
  prompt += `Per Episode Budget: ~$30-$625 (ultra-micro-budget)\n`
  prompt += `Episode Runtime: 5 minutes\n`
  prompt += `Production Model: Actors NOT paid (revenue share), crew optional\n\n`

  // Script metadata
  prompt += `**SCREENPLAY:**\n`
  prompt += `Title: ${script.title}\n`
  prompt += `Episode: ${script.episodeNumber}\n`
  prompt += `Pages: ${script.metadata.pageCount}\n`
  prompt += `Scenes: ${script.metadata.sceneCount}\n`
  prompt += `Characters: ${script.metadata.characterCount}\n\n`

  // Scenes to analyze
  prompt += `**SCENES TO ANALYZE:**\n\n`
  scriptScenes.forEach((scene, idx) => {
    prompt += `Scene ${scene.sceneNumber}:\n`
    prompt += `Slug Line: ${scene.heading}\n`
    prompt += `Content:\n${scene.content.substring(0, 1000)}${scene.content.length > 1000 ? '...' : ''}\n\n`
    prompt += `---\n\n`
  })

  // Instructions
  prompt += `**YOUR TASK:**\n\n`
  prompt += `Analyze each scene and provide a detailed breakdown with:\n\n`
  prompt += `1. **Scene Info:**\n`
  prompt += `   - Scene number and title (from slug line)\n`
  prompt += `   - Location (extract from slug line)\n`
  prompt += `   - Time of day (DAY/NIGHT/SUNRISE/SUNSET/MAGIC_HOUR)\n\n`

  prompt += `2. **Characters:**\n`
  prompt += `   - List all characters who appear or speak in THIS scene\n`
  prompt += `   - Count dialogue lines for each character in THIS scene\n`
  prompt += `   - Importance: "lead" (main character), "supporting" (significant role), "background" (1-2 lines)\n\n`

  prompt += `3. **Props:**\n`
  prompt += `   - List items characters interact with in THIS scene\n`
  prompt += `   - Importance: "hero" (featured), "secondary" (noticeable), "background" (set dressing)\n`
  prompt += `   - Source: "buy" (<$50), "rent" ($50-200), "borrow" (free), "actor-owned" (free)\n`
  prompt += `   - Estimated cost for each prop\n\n`

  prompt += `4. **Special Requirements:**\n`
  prompt += `   - Equipment needed beyond basic camera/mic (stabilizer, lights, etc.)\n`
  prompt += `   - Only include if scene clearly requires it\n`
  prompt += `   - Keep list short and practical\n\n`

  prompt += `5. **Shoot Time Estimate:**\n`
  prompt += `   - Minutes needed to shoot this scene\n`
  prompt += `   - Based on complexity, dialogue, action\n`
  prompt += `   - Include setup time\n\n`

  prompt += `6. **Budget Impact (UGC ULTRA-MICRO-BUDGET):**\n`
  prompt += `   - Total cost for this scene in dollars\n`
  prompt += `   - Include ONLY: location fees (if any), prop costs, extras pay ($30-$40/day)\n`
  prompt += `   - EXCLUDE: Actor pay (revenue share), crew (optional/Budget tab)\n`
  prompt += `   - Simple dialogue (2 actors, no extras): $5-$20 (props only)\n`
  prompt += `   - Scene with extras: $60-$130 (1-3 extras @ $30-$40/day + props)\n`
  prompt += `   - Scene with location fee: $50-$150 (location + props)\n`
  prompt += `   - Complex (extras + location + props): $130-$250\n`
  prompt += `   - Target: Keep TOTAL episode under $30-$625 range\n\n`

  prompt += `7. **Production Notes:**\n`
  prompt += `   - Brief notes on production considerations\n`
  prompt += `   - Challenges, tips, or important details\n\n`

  // Output format
  prompt += `**OUTPUT FORMAT:**\n\n`
  prompt += `Provide ONLY a valid JSON array with this structure:\n\n`
  prompt += `[\n`
  prompt += `  {\n`
  prompt += `    "sceneNumber": 1,\n`
  prompt += `    "sceneTitle": "Jason's Penthouse - Morning",\n`
  prompt += `    "location": "INT. JASON'S PENTHOUSE",\n`
  prompt += `    "timeOfDay": "DAY",\n`
  prompt += `    "estimatedShootTime": 20,\n`
  prompt += `    "characters": [\n`
  prompt += `      {"name": "JASON", "lineCount": 5, "importance": "lead"}\n`
  prompt += `    ],\n`
  prompt += `    "props": [\n`
  prompt += `      {"item": "Whiskey tumbler", "importance": "hero", "source": "buy", "estimatedCost": 8}\n`
  prompt += `    ],\n`
  prompt += `    "specialRequirements": ["Natural light from windows"],\n`
  prompt += `    "budgetImpact": 8,\n`
  prompt += `    "notes": "Simple dialogue scene, actor's apartment (free location), cheap prop, natural lighting, 2 actors (revenue share - no cost)"\n`
  prompt += `  }\n`
  prompt += `]\n\n`

  prompt += `**CRITICAL REMINDERS:**\n`
  prompt += `- Output ONLY valid JSON (no markdown, no explanation)\n`
  prompt += `- Extract from screenplay ONLY (no invention)\n`
  prompt += `- ULTRA-MICRO-BUDGET: Total episode should be $30-$625 MAX\n`
  prompt += `- Actors are NOT paid (revenue share model)\n`
  prompt += `- Extras: $30-$40/day ONLY if scene requires background actors\n`
  prompt += `- Props: Mostly cheap ($5-$50) or actor-owned (free)\n`
  prompt += `- Locations: Often free (actor's home, public spaces)\n`
  prompt += `- Crew NOT included (added separately in Budget tab)\n`
  prompt += `- One object per scene\n`
  prompt += `- All fields required\n`

  return prompt
}

/**
 * Parse AI response and structure breakdown data
 */
function structureBreakdownData(
  aiResponse: string,
  script: GeneratedScript,
  episodeNumber: number,
  episodeTitle: string
): ScriptBreakdownData {
  console.log('📊 Structuring breakdown data...')

  // Clean response - remove markdown code blocks if present
  let cleanedResponse = aiResponse.trim()
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  } else if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }

  try {
    const parsedScenes = JSON.parse(cleanedResponse)

    if (!Array.isArray(parsedScenes)) {
      throw new Error('AI response is not an array')
    }

    // Convert to TypeScript types
    const scenes: ScriptBreakdownScene[] = parsedScenes.map((scene: any) => ({
      id: `scene-${scene.sceneNumber}-${Date.now()}`,
      sceneNumber: scene.sceneNumber || 0,
      sceneTitle: scene.sceneTitle || 'Untitled Scene',
      location: scene.location || 'Unknown Location',
      timeOfDay: validateTimeOfDay(scene.timeOfDay),
      estimatedShootTime: scene.estimatedShootTime || 20,
      characters: (scene.characters || []).map((char: any) => ({
        name: char.name || 'Unknown',
        lineCount: char.lineCount || 0,
        importance: validateImportance(char.importance)
      })),
      props: (scene.props || []).map((prop: any) => ({
        item: prop.item || 'Unknown Item',
        importance: validatePropImportance(prop.importance),
        source: validatePropSource(prop.source),
        estimatedCost: prop.estimatedCost || 0
      })),
      specialRequirements: scene.specialRequirements || [],
      budgetImpact: scene.budgetImpact || 0,
      status: 'not-started',
      notes: scene.notes || '',
      comments: [],
      linkedEpisode: episodeNumber,
      linkedSceneContent: scene.sceneTitle
    }))

    // Calculate totals
    const totalScenes = scenes.length
    const totalEstimatedTime = scenes.reduce((sum, scene) => sum + scene.estimatedShootTime, 0)
    const totalBudgetImpact = scenes.reduce((sum, scene) => sum + scene.budgetImpact, 0)

    console.log('✅ Breakdown structured successfully')
    console.log(`  Scenes: ${totalScenes}`)
    console.log(`  Total Time: ${totalEstimatedTime} minutes`)
    console.log(`  Total Budget: $${totalBudgetImpact}`)

    return {
      episodeNumber,
      episodeTitle,
      totalScenes,
      totalEstimatedTime,
      totalBudgetImpact,
      scenes,
      lastUpdated: Date.now(),
      updatedBy: 'ai-generator'
    }
  } catch (error) {
    console.error('❌ Error parsing AI response:', error)
    console.error('Raw response:', cleanedResponse.substring(0, 500))
    throw new Error(`Failed to parse breakdown data: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
  }
}

/**
 * Validation helpers
 */
function validateTimeOfDay(value: any): 'DAY' | 'NIGHT' | 'SUNRISE' | 'SUNSET' | 'MAGIC_HOUR' {
  const valid = ['DAY', 'NIGHT', 'SUNRISE', 'SUNSET', 'MAGIC_HOUR']
  const upper = String(value).toUpperCase()
  return valid.includes(upper) ? upper as any : 'DAY'
}

function validateImportance(value: any): 'lead' | 'supporting' | 'background' {
  const valid = ['lead', 'supporting', 'background']
  const lower = String(value).toLowerCase()
  return valid.includes(lower) ? lower as any : 'supporting'
}

function validatePropImportance(value: any): 'hero' | 'secondary' | 'background' {
  const valid = ['hero', 'secondary', 'background']
  const lower = String(value).toLowerCase()
  return valid.includes(lower) ? lower as any : 'secondary'
}

function validatePropSource(value: any): 'buy' | 'rent' | 'borrow' | 'actor-owned' {
  const valid = ['buy', 'rent', 'borrow', 'actor-owned']
  const lower = String(value).toLowerCase()
  return valid.includes(lower) ? lower as any : 'buy'
}

