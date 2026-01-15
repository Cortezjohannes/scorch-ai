/**
 * Shot List Generator - AI Service
 * Generates comprehensive production shot lists from script breakdown and storyboards
 * 
 * Uses EngineAIRouter with Gemini 3 Pro Preview for technical production planning
 * 
 * Standards:
 * - Generate technical shot specifications for on-set efficiency
 * - Focus on camera specs (lens, frame rate, duration) rather than visual descriptions
 * - Assign priorities based on story importance
 * - Consider micro-budget constraints (prefer simpler camera setups)
 * - If storyboards exist, shot list should reflect those shots (technical version)
 */

import { EngineAIRouter } from '@/services/engine-ai-router'
import type { ScriptBreakdownData, ShotListData, Shot, ShotListScene } from '@/types/preproduction'

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

interface StoryboardsData {
  scenes: Array<{
    sceneNumber: number
    sceneTitle: string
    frames: Array<{
      id?: string
      shotNumber: string
      cameraAngle: string
      cameraMovement: string
      dialogueSnippet: string
      lightingNotes: string
      frameImage?: string
    }>
  }>
}

interface ShotListGenerationParams {
  breakdownData: ScriptBreakdownData
  scriptData: GeneratedScript
  storyBible: any
  storyboardsData?: StoryboardsData
  episodeNumber: number
  episodeTitle: string
  userId: string
}

interface SceneShotData {
  sceneNumber: number
  sceneTitle: string
  location: string
  shots: ShotFrame[]
}

interface ShotFrame {
  shotNumber: string
  description: string
  cameraAngle: string
  cameraMovement: string
  lensRecommendation?: string
  durationEstimate: number // seconds
  priority: 'must-have' | 'nice-to-have' | 'optional'
  fpsCameraFrameRate?: number
  notes: string
  actorInstructions?: string
  cameraCrewInstructions?: string
  lightingSetup?: string
  audioRequirements?: string
  continuityNotes?: string
  blockingDescription?: string
  storyboardFrameId?: string
  setupGroup?: string
  estimatedSetupTime?: number
}

/**
 * Calculate number of batches based on scene count
 * - 5 or fewer scenes: 1 batch
 * - 6-10 scenes: 2 batches
 * - 11-15 scenes: 3 batches
 * - And so on (add 1 batch per 5 additional scenes)
 */
function calculateBatchCount(sceneCount: number): number {
  if (sceneCount <= 5) {
    return 1
  }
  // For every 5 scenes, add 1 batch (minimum 2 batches for 6+ scenes)
  return Math.ceil(sceneCount / 5)
}

/**
 * Split scenes into batches
 */
function splitScenesIntoBatches<T>(scenes: T[], batchCount: number): T[][] {
  const batches: T[][] = []
  const scenesPerBatch = Math.ceil(scenes.length / batchCount)
  
  for (let i = 0; i < batchCount; i++) {
    const start = i * scenesPerBatch
    const end = Math.min(start + scenesPerBatch, scenes.length)
    batches.push(scenes.slice(start, end))
  }
  
  return batches
}

/**
 * Generate shot list for all scenes (with batching for large scene counts)
 */
export async function generateShotList(params: ShotListGenerationParams): Promise<ShotListData> {
  const { breakdownData, scriptData, storyBible, storyboardsData, episodeNumber, episodeTitle, userId } = params

  console.log('🎬 Generating shot list for Episode', episodeNumber)
  console.log('📋 Analyzing', breakdownData.scenes.length, 'scenes')

  if (breakdownData.scenes.length === 0) {
    throw new Error('No scenes found in script breakdown. Please generate script breakdown first.')
  }

  // Calculate batches based on scene count
  const batchCount = calculateBatchCount(breakdownData.scenes.length)
  console.log(`📦 Using ${batchCount} batch${batchCount > 1 ? 'es' : ''} for ${breakdownData.scenes.length} scenes`)

  // If only 1 batch, use original single-call approach
  if (batchCount === 1) {
    return await generateShotListSingleBatch(params)
  }

  // Split scenes into batches
  const sceneBatches = splitScenesIntoBatches(breakdownData.scenes, batchCount)
  console.log(`📦 Scene batches: ${sceneBatches.map((batch, idx) => `Batch ${idx + 1}: scenes ${batch[0].sceneNumber}-${batch[batch.length - 1].sceneNumber} (${batch.length} scenes)`).join(', ')}`)

  // Build system prompt (same for all batches)
  const systemPrompt = buildSystemPrompt()

  // Generate shot lists for each batch
  const allShotListScenes: ShotListScene[] = []
  
  for (let batchIdx = 0; batchIdx < sceneBatches.length; batchIdx++) {
    const sceneBatch = sceneBatches[batchIdx]
    console.log(`\n🔄 Processing batch ${batchIdx + 1}/${batchCount} (${sceneBatch.length} scenes)...`)

    // Create a subset of breakdown data for this batch
    const batchBreakdownData: ScriptBreakdownData = {
      ...breakdownData,
      scenes: sceneBatch
    }

    // Create a subset of storyboards data for this batch (if available)
    const batchStoryboardsData = storyboardsData ? {
      ...storyboardsData,
      scenes: storyboardsData.scenes.filter(s => 
        sceneBatch.some(bs => bs.sceneNumber === s.sceneNumber)
      )
    } : undefined

    // Build prompt for this batch
    const userPrompt = buildUserPrompt(batchBreakdownData, scriptData, storyBible, batchStoryboardsData, episodeTitle, batchIdx + 1, batchCount)

    try {
      console.log(`🤖 Calling AI for batch ${batchIdx + 1}...`)
      // Use Azure GPT-4.1 (better for long responses, no truncation)
      // Falls back to Gemini if Azure fails
      let response
      try {
        response = await EngineAIRouter.generateContent({
          prompt: userPrompt,
          systemPrompt: systemPrompt,
          temperature: 0.7, // Lower temperature for technical precision
          maxTokens: 12000, // Large enough for multiple scenes with detailed shots
          engineId: 'shot-list-generator',
          forceProvider: 'azure' // Azure GPT for longer responses without truncation
        })
      } catch (azureError) {
        console.warn(`⚠️ Azure GPT failed for batch ${batchIdx + 1}, falling back to Gemini:`, azureError instanceof Error ? azureError.message : String(azureError))
        // Fallback to Gemini if Azure fails
        response = await EngineAIRouter.generateContent({
          prompt: userPrompt,
          systemPrompt: systemPrompt,
          temperature: 0.7,
          maxTokens: 12000,
          engineId: 'shot-list-generator',
          forceProvider: 'gemini' // Gemini fallback
        })
      }

      console.log(`✅ Batch ${batchIdx + 1} response received:`, response.metadata.contentLength, 'characters')

      // Parse AI response for this batch
      const batchShotListData = parseShotList(response.content, batchBreakdownData, episodeNumber, episodeTitle, userId, batchStoryboardsData, storyBible, scriptData)
      
      // Add scenes from this batch to the combined result
      allShotListScenes.push(...batchShotListData.scenes)
      
      console.log(`✅ Batch ${batchIdx + 1} completed: ${batchShotListData.totalShots} shots across ${batchShotListData.scenes.length} scenes`)
    } catch (error) {
      console.error(`❌ Error generating shot list for batch ${batchIdx + 1}:`, error)
      throw new Error(`Shot list generation failed for batch ${batchIdx + 1}/${batchCount}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Combine all batches into final result
  const totalShots = allShotListScenes.reduce((sum, scene) => sum + scene.totalShots, 0)
  const completedShots = allShotListScenes.reduce((sum, scene) => sum + scene.completedShots, 0)

  // Sort scenes by scene number to ensure correct order
  allShotListScenes.sort((a, b) => a.sceneNumber - b.sceneNumber)

  const finalShotListData: ShotListData = {
    episodeNumber,
    episodeTitle,
    totalShots,
    completedShots,
    scenes: allShotListScenes,
    lastUpdated: Date.now(),
    updatedBy: userId
  }

  console.log('\n✅ Shot list generated (all batches):')
  console.log('  Total shots:', finalShotListData.totalShots)
  console.log('  Scenes:', finalShotListData.scenes.length)
  finalShotListData.scenes.forEach(scene => {
    console.log(`    Scene ${scene.sceneNumber}: ${scene.totalShots} shots`)
  })

  return finalShotListData
}

/**
 * Generate shot list for a single batch (original implementation)
 */
async function generateShotListSingleBatch(params: ShotListGenerationParams): Promise<ShotListData> {
  const { breakdownData, scriptData, storyBible, storyboardsData, episodeNumber, episodeTitle, userId } = params

  // Build AI prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(breakdownData, scriptData, storyBible, storyboardsData, episodeTitle)

  try {
    console.log('🤖 Calling AI for shot list generation...')
    // Use Azure GPT-4.1 (better for long responses, no truncation)
    // Falls back to Gemini if Azure fails
    let response
    try {
      response = await EngineAIRouter.generateContent({
        prompt: userPrompt,
        systemPrompt: systemPrompt,
        temperature: 0.7, // Lower temperature for technical precision
        maxTokens: 12000, // Large enough for multiple scenes with detailed shots
        engineId: 'shot-list-generator',
        forceProvider: 'azure' // Azure GPT for longer responses without truncation
      })
    } catch (azureError) {
      console.warn('⚠️ Azure GPT failed, falling back to Gemini:', azureError instanceof Error ? azureError.message : String(azureError))
      // Fallback to Gemini if Azure fails
      response = await EngineAIRouter.generateContent({
        prompt: userPrompt,
        systemPrompt: systemPrompt,
        temperature: 0.7,
        maxTokens: 12000,
        engineId: 'shot-list-generator',
        forceProvider: 'gemini' // Gemini fallback
      })
    }

    console.log('✅ AI Response received:', response.metadata.contentLength, 'characters')

    // Parse AI response into structured shot list data
    const shotListData = parseShotList(response.content, breakdownData, episodeNumber, episodeTitle, userId, storyboardsData, params.storyBible, params.scriptData)

    console.log('✅ Shot list generated:')
    console.log('  Total shots:', shotListData.totalShots)
    console.log('  Scenes:', shotListData.scenes.length)
    shotListData.scenes.forEach(scene => {
      console.log(`    Scene ${scene.sceneNumber}: ${scene.totalShots} shots`)
    })

    return shotListData
  } catch (error) {
    console.error('❌ Error generating shot list:', error)
    throw new Error(`Shot list generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Build system prompt for shot list generation
 */
function buildSystemPrompt(): string {
  return `You are a professional production coordinator and 1st AD working on a micro-budget 5-minute web series.
Your job is to create a production-focused shot list that explains HOW to shoot each beat: camera setup, actor direction, lighting/audio needs, continuity, and efficiency (minimal company moves).

**CRITICAL RULES:**

1. **EXECUTION FOCUS (NOT STORYBOARD DUPLICATION)**
   - Storyboards = WHAT to show (creative). Shot list = HOW to shoot it (execution).
   - Include instructions for camera crew, actors, lighting, and sound.
   - Keep descriptions concise but actionable; avoid repeating storyboard prose.

2. **SHOT BREAKDOWN**
   - If storyboards exist, use them as reference for shot count and camera angles
   - If storyboards don't exist, generate shots directly from script breakdown
   - Analyze each scene to determine appropriate shot breakdown
   - Consider dialogue, action, and production efficiency
   - Vary shot counts per scene (simple: 2-3, medium: 4-5, complex: 6-8 shots)
   - 5-minute episode constraint: keep setups lean and reduce unnecessary coverage

3. **CAMERA SPECIFICATIONS**
   - **Camera Angle**: wide, medium, close-up, extreme-close-up, over-shoulder, pov, dutch
   - **Camera Movement**: static, pan, tilt, dolly, tracking, handheld, steadicam, crane
   - **Lens Recommendation**: Based on shot type
     * Wide shots: 24mm-35mm
     * Medium shots: 50mm-85mm
     * Close-ups: 85mm-135mm
   - **Frame Rate**: Default 24fps, 60fps/120fps for slow-mo if needed
   - **Micro-budget**: Prefer simpler moves (static/pan over dolly/tracking)

4. **PRIORITY ASSIGNMENT**
   - **Must-Have**: Critical story beats, dialogue scenes, key emotional moments
   - **Nice-to-Have**: Establishing shots, reaction shots, coverage
   - **Optional**: Extreme close-ups, alternative angles, beauty shots

5. **DURATION ESTIMATES**
   - Dialogue-heavy shots: 3-8 seconds
   - Action/movement shots: 5-15 seconds
   - Establishing shots: 2-5 seconds
   - Reaction shots: 2-4 seconds
   - Base estimates on dialogue length and action complexity

6. **PRODUCTION EFFICIENCY**
   - Group similar camera setups together using setupGroup labels
   - Provide estimatedSetupTime (minutes) for each shot/setup
   - Note special equipment requirements (stabilizer, lights, etc.)
   - Consider micro-budget constraints (equipment availability)
   - Keep descriptions concise and production-focused

7. **DEPARTMENT NOTES PER SHOT**
   - actorInstructions: performance, blocking, emotional beat, eyelines
   - cameraCrewInstructions: setup, focus marks, coverage intent, critical continuity
   - lightingSetup: key/fill/rim, motivation, fixtures or practicals
   - audioRequirements: lav/boom needs, wild lines, ambience to capture
   - continuityNotes: wardrobe/props/positions that must match
   - blockingDescription: text layout of actor positions/moves
   - storyboardFrameId: link the referenced storyboard frame (if provided)

8. **OUTPUT FORMAT**
   - Valid JSON only
   - No markdown, no code blocks, no explanations outside the JSON
   - Structure: { scenes: [ { sceneNumber, sceneTitle, location, shots: [ { shotNumber, description, cameraAngle, cameraMovement, lensRecommendation, durationEstimate, priority, fpsCameraFrameRate, notes, actorInstructions, cameraCrewInstructions, lightingSetup, audioRequirements, continuityNotes, blockingDescription, storyboardFrameId, setupGroup, estimatedSetupTime } ] } ] }
   - Ensure all fields are populated realistically
`
}

/**
 * Build user prompt with all context
 */
function buildUserPrompt(
  breakdown: ScriptBreakdownData,
  script: GeneratedScript,
  storyBible: any,
  storyboardsData: StoryboardsData | undefined,
  episodeTitle: string,
  batchNumber?: number,
  totalBatches?: number
): string {
  let prompt = `Generate comprehensive production shot list for Episode "${episodeTitle}" of the series "${storyBible?.seriesTitle || storyBible?.title || 'Untitled Series'}".\n\n`
  
  // Add batch information if batching is used
  if (batchNumber && totalBatches && totalBatches > 1) {
    prompt += `**NOTE: This is batch ${batchNumber} of ${totalBatches}. Generate shot lists ONLY for the scenes listed below.\n\n`
  }

  // Story context (CORE DATA)
  prompt += `**STORY CONTEXT:**\n`
  if (storyBible?.seriesOverview) {
    prompt += `Series Overview: ${storyBible.seriesOverview}\n\n`
  }
  prompt += `Series Genre: ${storyBible?.genre || 'Drama'}\n`
  prompt += `Series Tone: ${storyBible?.tone || 'Realistic'}\n`
  prompt += `Production Model: Micro-budget web series ($1k-$20k total series budget)\n`
  prompt += `\n`
  
  // Add technical tabs for better shot planning
  if (storyBible?.genreEnhancement) {
    prompt += `**GENRE & VISUAL STYLE:**\n`
    const genre = storyBible.genreEnhancement
    if (genre.rawContent) {
      prompt += `${genre.rawContent.substring(0, 350)}\n\n`
    } else {
      if (genre.visualStyle) prompt += `Visual Style: ${genre.visualStyle}\n`
      if (genre.pacing) prompt += `Pacing: ${genre.pacing}\n\n`
    }
  }
  
  if (storyBible?.tensionStrategy) {
    prompt += `**TENSION/PACING (affects shot duration and intensity):**\n`
    const tension = storyBible.tensionStrategy
    if (tension.rawContent) {
      prompt += `${tension.rawContent.substring(0, 250)}\n\n`
    } else {
      if (tension.escalationTechniques) prompt += `Escalation: ${tension.escalationTechniques}\n\n`
    }
  }
  
  if (storyBible?.worldBuilding) {
    prompt += `**WORLD/SETTING (for location context):**\n`
    if (typeof storyBible.worldBuilding === 'string') {
      prompt += `${storyBible.worldBuilding.substring(0, 300)}\n\n`
    } else {
      if (storyBible.worldBuilding.setting) prompt += `Setting: ${storyBible.worldBuilding.setting}\n`
      if (storyBible.worldBuilding.rules) {
        prompt += `World Rules: ${typeof storyBible.worldBuilding.rules === 'string' ? storyBible.worldBuilding.rules.substring(0, 200) : ''}\n`
      }
      prompt += `\n`
    }
  }

  // Episode context
  prompt += `**EPISODE:** ${episodeTitle}\n`
  if (batchNumber && totalBatches && totalBatches > 1) {
    prompt += `Scenes in this batch: ${breakdown.scenes.length} (batch ${batchNumber} of ${totalBatches})\n`
  } else {
    prompt += `Total Scenes: ${breakdown.scenes.length}\n`
  }
  prompt += `\n`

  // Storyboards reference
  if (storyboardsData && storyboardsData.scenes && storyboardsData.scenes.length > 0) {
    prompt += `**STORYBOARDS AVAILABLE (Use as Reference):**\n`
    prompt += `Storyboards define the visual shots - shot list should reflect these shots with technical specs.\n\n`
    storyboardsData.scenes.forEach(scene => {
      prompt += `Scene ${scene.sceneNumber}: ${scene.sceneTitle}\n`
      prompt += `  Total Shots: ${scene.frames.length}\n`
      scene.frames.forEach(frame => {
        prompt += `  Shot ${frame.shotNumber}: ${frame.cameraAngle} ${frame.cameraMovement}, ${frame.dialogueSnippet ? 'Dialogue: ' + frame.dialogueSnippet.substring(0, 50) + '...' : 'No dialogue'}${frame.id ? ` (frameId: ${frame.id})` : ''}\n`
      })
      prompt += `\n`
    })
    prompt += `**IMPORTANT:** Use storyboard shots as reference - generate technical shot list that reflects these shots.\n`
    prompt += `Focus on camera specs (lens, frame rate, duration) and execution instructions (actors/camera/lighting/audio/continuity). Do NOT repeat storyboard prose.\n\n`
  } else {
    prompt += `**NOTE:** No storyboards available - generate shot list directly from script breakdown.\n\n`
  }

  // Process each scene
  prompt += `**SCENES TO BREAK DOWN INTO SHOTS:**\n\n`
  
  for (const scene of breakdown.scenes) {
    prompt += `**SCENE ${scene.sceneNumber}: ${scene.sceneTitle}**\n`
    prompt += `Location: ${scene.location}\n`
    prompt += `Time of Day: ${scene.timeOfDay}\n`
    prompt += `Estimated Shoot Time: ${scene.estimatedShootTime} minutes\n`
    
    // Characters in scene
    if (scene.characters && scene.characters.length > 0) {
      prompt += `Characters: ${scene.characters.map(c => c.name).join(', ')}\n`
    }
    
    // Props in scene
    if (scene.props && scene.props.length > 0) {
      prompt += `Props: ${scene.props.map(p => p.item).join(', ')}\n`
    }
    
    // Special requirements
    if (scene.specialRequirements && scene.specialRequirements.length > 0) {
      prompt += `Special Requirements: ${scene.specialRequirements.join(', ')}\n`
    }
    
    // Scene content/description
    if (scene.linkedSceneContent) {
      prompt += `Scene Content:\n${scene.linkedSceneContent.substring(0, 500)}\n`
    } else if (scene.notes) {
      prompt += `Scene Notes:\n${scene.notes}\n`
    }
    
    // Find script dialogue for this scene
    const scriptDialogue = findSceneDialogue(script, scene.sceneNumber)
    if (scriptDialogue) {
      prompt += `Script Dialogue:\n${scriptDialogue.substring(0, 300)}\n`
    }
    
    prompt += `\n`
  }

  // Output format instructions
  prompt += `**TASK:**\n`
  if (storyboardsData && storyboardsData.scenes.length > 0) {
    prompt += `For EACH scene above, generate a technical shot list that reflects the storyboard shots.\n`
    prompt += `Convert storyboard frames into production shot specifications (lens, frame rate, duration, priority).\n\n`
  } else {
    prompt += `For EACH scene above, analyze the scene's complexity, dialogue, and action to determine appropriate shot breakdown.\n\n`
  }
  
  prompt += `**SHOT COUNT VARIATION:**\n`
  prompt += `- Simple scenes (single location, minimal action): 2-3 shots\n`
  prompt += `- Medium complexity scenes (dialogue-heavy or moderate action): 4-5 shots\n`
  prompt += `- Complex scenes (multiple locations, heavy action, emotional beats): 6-8 shots\n`
  prompt += `- DO NOT default to the same number of shots for every scene\n`
  prompt += `- Vary the shot count based on each scene's actual needs\n\n`
  
  prompt += `For each shot, provide:\n`
  prompt += `- shotNumber: Sequential shot number within the scene (e.g., "1", "2", "3" or "1A", "1B" for variations)\n`
  prompt += `- description: Brief production-focused description (what is covered in this shot)\n`
  prompt += `- cameraAngle: Camera angle type (wide, medium, close-up, extreme-close-up, over-shoulder, pov, dutch)\n`
  prompt += `- cameraMovement: Camera movement type (static, pan, tilt, dolly, tracking, handheld, steadicam, crane)\n`
  prompt += `- lensRecommendation: Recommended lens (e.g., "24mm", "50mm", "85mm", "24-70mm")\n`
  prompt += `- durationEstimate: Estimated shot duration in seconds (based on dialogue length and action)\n`
  prompt += `- priority: Shot priority (must-have, nice-to-have, optional)\n`
  prompt += `- fpsCameraFrameRate: Frame rate if different from 24fps (e.g., 60 for slow-mo, omit if 24fps)\n`
  prompt += `- notes: Production notes (equipment needs, special considerations, etc.)\n`
  prompt += `- actorInstructions: Performance notes, blocking, emotional beat, eyelines\n`
  prompt += `- cameraCrewInstructions: Setup details for camera team, focus marks, coverage intent\n`
  prompt += `- lightingSetup: Key/fill/rim, motivation, fixtures or practicals\n`
  prompt += `- audioRequirements: Lav/boom needs, dialogue cues, ambience to capture\n`
  prompt += `- continuityNotes: Wardrobe/props/positions to match\n`
  prompt += `- blockingDescription: Text layout of actor positions/movement\n`
  prompt += `- storyboardFrameId: ID of referenced storyboard frame when provided\n`
  prompt += `- setupGroup: Label for batching similar setups (e.g., "INT Loft - 50mm Static")\n`
  prompt += `- estimatedSetupTime: Minutes to prep this shot/setup\n\n`

  prompt += `**OUTPUT FORMAT:**\n\n`
  prompt += `Provide ONLY valid JSON with this structure:\n\n`
  prompt += `{\n`
  prompt += `  "scenes": [\n`
  prompt += `    {\n`
  prompt += `      "sceneNumber": 1,\n`
  prompt += `      "sceneTitle": "INT. PENTHOUSE - NIGHT",\n`
  prompt += `      "location": "Jason's Penthouse",\n`
  prompt += `      "shots": [\n`
  prompt += `        {\n`
  prompt += `          "shotNumber": "1",\n`
  prompt += `          "description": "Wide establishing shot of penthouse living room",\n`
  prompt += `          "cameraAngle": "wide",\n`
  prompt += `          "cameraMovement": "static",\n`
  prompt += `          "lensRecommendation": "24mm",\n`
  prompt += `          "durationEstimate": 3,\n`
  prompt += `          "priority": "must-have",\n`
  prompt += `          "fpsCameraFrameRate": 24,\n`
  prompt += `          "notes": "Establish location, static shot",\n`
  prompt += `          "actorInstructions": "Actors enter frame and hold for beat",\n`
  prompt += `          "cameraCrewInstructions": "Static on sticks, lock exposure for windows",\n`
  prompt += `          "lightingSetup": "Practical lamps + soft key from camera left",\n`
  prompt += `          "audioRequirements": "Room tone capture",\n`
  prompt += `          "continuityNotes": "Lamp on, curtains half open",\n`
  prompt += `          "blockingDescription": "Jason at window, Sarah crosses behind sofa",\n`
  prompt += `          "storyboardFrameId": "frame_1",\n`
  prompt += `          "setupGroup": "INT PENTHOUSE - Wide 24mm Static",\n`
  prompt += `          "estimatedSetupTime": 5\n`
  prompt += `        },\n`
  prompt += `        {\n`
  prompt += `          "shotNumber": "2",\n`
  prompt += `          "description": "Medium shot of Jason at window with dialogue",\n`
  prompt += `          "cameraAngle": "medium",\n`
  prompt += `          "cameraMovement": "static",\n`
  prompt += `          "lensRecommendation": "50mm",\n`
  prompt += `          "durationEstimate": 8,\n`
  prompt += `          "priority": "must-have",\n`
  prompt += `          "notes": "Key dialogue shot, static medium",\n`
  prompt += `          "actorInstructions": "Jason turns from window, delivers line to Sarah",\n`
  prompt += `          "cameraCrewInstructions": "50mm on sticks, eye-level, keep window highlights controlled",\n`
  prompt += `          "lightingSetup": "Soft key camera right, negative fill on left",\n`
  prompt += `          "audioRequirements": "Boom preferred, lav backup",\n`
  prompt += `          "continuityNotes": "Glass in right hand",\n`
  prompt += `          "blockingDescription": "Jason pivots toward Sarah, holds eyeline to her mark",\n`
  prompt += `          "storyboardFrameId": "frame_2",\n`
  prompt += `          "setupGroup": "INT PENTHOUSE - 50mm Static",\n`
  prompt += `          "estimatedSetupTime": 4\n`
  prompt += `        }\n`
  prompt += `      ]\n`
  prompt += `    }\n`
  prompt += `  ]\n`
  prompt += `}\n\n`

  prompt += `**CRITICAL REMINDERS:**\n`
  prompt += `- Output ONLY valid JSON (no markdown, no code blocks, no explanation)\n`
  if (batchNumber && totalBatches && totalBatches > 1) {
    prompt += `- Generate shot list for ALL scenes listed above in this batch (batch ${batchNumber} of ${totalBatches})\n`
  } else {
    prompt += `- Generate shot list for ALL scenes listed above\n`
  }
  prompt += `- Vary shot counts per scene based on complexity (2-8 shots per scene)\n`
  prompt += `- Focus on execution: camera specs + department instructions (actors, camera, lighting, audio, continuity)\n`
  prompt += `- Assign priorities realistically (must-have for critical story beats)\n`
  prompt += `- Consider micro-budget and 5-minute runtime constraints (lean setups)\n`
  prompt += `- All fields must be populated realistically\n`

  return prompt
}

/**
 * Parse AI response into structured shot list data
 */
function parseShotList(
  aiResponse: string,
  breakdownData: ScriptBreakdownData,
  episodeNumber: number,
  episodeTitle: string,
  userId: string,
  storyboardsData?: StoryboardsData,
  storyBible?: any,
  scriptData?: GeneratedScript
): ShotListData {
  console.log('📊 Parsing shot list data...')
  console.log('   Raw response length:', aiResponse.length)
  console.log('   Raw response (first 300 chars):', aiResponse.substring(0, 300))

  // Use the robust JSON parser which handles markdown, extra text, malformed JSON, etc.
  // The cleanAndParseJSON utility will handle all the cleaning and parsing strategies

  // Helper function to try to complete incomplete JSON
  function tryCompleteIncompleteJSON(jsonStr: string): string {
    // Count open/close braces and brackets to detect incomplete JSON
    let openBraces = 0
    let openBrackets = 0
    let inString = false
    let escapeNext = false
    
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i]
      
      if (escapeNext) {
        escapeNext = false
        continue
      }
      
      if (char === '\\') {
        escapeNext = true
        continue
      }
      
      if (char === '"') {
        inString = !inString
        continue
      }
      
      if (inString) continue
      
      if (char === '{') openBraces++
      if (char === '}') openBraces--
      if (char === '[') openBrackets++
      if (char === ']') openBrackets--
    }
    
    // If we're in a string at the end, close it
    if (inString) {
      // Find the last unclosed string (look for ": " pattern)
      const lastStringMatch = jsonStr.match(/("(?:sceneTitle|location|description|notes|actorInstructions|cameraCrewInstructions|lightingSetup|audioRequirements|continuityNotes|blockingDescription|setupGroup)"\s*:\s*")([^"]*)$/)
      if (lastStringMatch) {
        jsonStr += '"'
      }
    }
    
    // Close incomplete objects/arrays
    while (openBraces > 0) {
      // Before closing, check if we need to close any incomplete arrays or strings
      if (jsonStr.match(/,\s*$/)) {
        jsonStr = jsonStr.replace(/,\s*$/, '')
      }
      jsonStr += '}'
      openBraces--
    }
    
    while (openBrackets > 0) {
      if (jsonStr.match(/,\s*$/)) {
        jsonStr = jsonStr.replace(/,\s*$/, '')
      }
      jsonStr += ']'
      openBrackets--
    }
    
    // Remove trailing commas before closing brackets/braces
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1')
    
    return jsonStr
  }

  try {
    let parsed
    try {
      // Use the robust JSON parser from json-utils
      const { cleanAndParseJSON } = require('@/lib/json-utils')
      parsed = cleanAndParseJSON(aiResponse)
      console.log('✅ Successfully parsed JSON using robust parser')
    } catch (parseError: any) {
      // If robust parser fails, try to complete incomplete JSON
      console.error('❌ JSON parse error with robust parser:', parseError.message)
      console.error('   Raw response (first 500 chars):', aiResponse.substring(0, 500))
      
      // Clean response for fallback attempts
      let cleaned = aiResponse.trim()
      
      // Extract JSON from markdown code blocks
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '')
      }
      
      // Extract JSON object if wrapped in other text
      const objectMatch = cleaned.match(/\{[\s\S]*\}/)
      if (objectMatch) {
        cleaned = objectMatch[0]
      }
      const errorPos = parseError.message.match(/position (\d+)/)?.[1]
      if (errorPos) {
        const pos = parseInt(errorPos)
        console.error('   Error position:', pos)
        const contextStart = Math.max(0, pos - 100)
        const contextEnd = Math.min(cleaned.length, pos + 100)
        console.error('   Context around error:', cleaned.substring(contextStart, contextEnd))
      }
      
      // Try to complete incomplete JSON
      try {
        const completedJSON = tryCompleteIncompleteJSON(cleaned)
        parsed = JSON.parse(completedJSON)
        console.log('✅ Recovered JSON by completing incomplete structure')
      } catch (completionError) {
        // If completion fails, try to extract valid scenes from partial JSON
        console.warn('⚠️ Could not complete JSON, trying to extract valid scenes...')
        
        // Try to find and parse individual scene objects
        const sceneMatches = cleaned.match(/\{[^{}]*"sceneNumber"\s*:\s*\d+[^{}]*\}/g)
        if (sceneMatches && sceneMatches.length > 0) {
          const validScenes: any[] = []
          for (const sceneMatch of sceneMatches) {
            try {
              // Try to complete this individual scene object
              const completedScene = tryCompleteIncompleteJSON(sceneMatch)
              const parsedScene = JSON.parse(completedScene)
              if (parsedScene.sceneNumber) {
                validScenes.push(parsedScene)
              }
            } catch (e) {
              // Skip invalid scenes
              console.warn(`⚠️ Skipping invalid scene: ${sceneMatch.substring(0, 50)}...`)
            }
          }
          
          if (validScenes.length > 0) {
            parsed = { scenes: validScenes }
            console.log(`✅ Recovered ${validScenes.length} valid scenes from partial JSON`)
          } else {
            throw new Error(`Failed to parse JSON even after recovery attempts: ${parseError.message}. First 500 chars: ${aiResponse.substring(0, 500)}`)
          }
        } else {
          // Last resort: try to extract JSON object
          const objectMatch = cleaned.match(/\{[\s\S]*\}/)
          if (objectMatch) {
            try {
              const completedObject = tryCompleteIncompleteJSON(objectMatch[0])
              parsed = JSON.parse(completedObject)
              console.log('✅ Recovered JSON by extracting and completing object')
            } catch (recoveryError) {
              throw new Error(`Failed to parse JSON even after recovery attempts: ${parseError.message}. First 500 chars: ${aiResponse.substring(0, 500)}`)
            }
          } else {
            throw new Error(`Failed to parse JSON: ${parseError.message}. First 500 chars: ${aiResponse.substring(0, 500)}`)
          }
        }
      }
    }

    if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
      throw new Error('Invalid AI response structure: expected scenes array')
    }

    const shotListScenes: ShotListScene[] = parsed.scenes.map((scene: any) => {
      const breakdownScene = breakdownData.scenes.find(s => s.sceneNumber === scene.sceneNumber)
      const sceneTitle = scene.sceneTitle || breakdownScene?.sceneTitle || `Scene ${scene.sceneNumber}`
      const location = scene.location || breakdownScene?.location || 'Location TBD'

      const shots: Shot[] = Array.isArray(scene.shots)
        ? scene.shots.map((shot: any, shotIdx: number) => {
            const storyboardFrameId = shot.storyboardFrameId || undefined
            
            // Find corresponding storyboard frame to inherit AI flags
            let canBeAIGenerated: boolean | undefined
            let aiGenerationPrompt: string | undefined
            let aiGenerationRecommendation: 'high' | 'medium' | 'low' | undefined
            
            if (storyboardFrameId && storyboardsData) {
              const storyboardScene = storyboardsData.scenes.find(s => s.sceneNumber === scene.sceneNumber)
              const storyboardFrame = storyboardScene?.frames?.find(f => f.id === storyboardFrameId)
              
              if (storyboardFrame) {
                canBeAIGenerated = storyboardFrame.canBeAIGenerated
                aiGenerationPrompt = storyboardFrame.aiGenerationPrompt
                aiGenerationRecommendation = storyboardFrame.aiGenerationRecommendation
                
                // Enhance the prompt with story bible, episode, and script context
                if (canBeAIGenerated && aiGenerationPrompt) {
                  aiGenerationPrompt = enhanceAIGenerationPrompt(
                    aiGenerationPrompt,
                    shot,
                    breakdownScene,
                    storyBible,
                    scriptData,
                    episodeNumber,
                    episodeTitle
                  )
                  console.log(`🤖 Shot ${shot.shotNumber || shotIdx + 1} (Scene ${scene.sceneNumber}) inheriting and enhancing AI prompt from storyboard frame ${storyboardFrameId} (${aiGenerationRecommendation || 'medium'} recommendation)`)
                } else if (canBeAIGenerated) {
                  console.log(`🤖 Shot ${shot.shotNumber || shotIdx + 1} (Scene ${scene.sceneNumber}) inheriting AI flags from storyboard frame ${storyboardFrameId} (${aiGenerationRecommendation || 'medium'} recommendation)`)
                }
              }
            }
            
            return {
              id: `shot_${scene.sceneNumber}_${shotIdx + 1}`,
              shotNumber: shot.shotNumber || String(shotIdx + 1),
              sceneNumber: scene.sceneNumber,
              description: shot.description || `Shot ${shot.shotNumber || shotIdx + 1}`,
              cameraAngle: shot.cameraAngle || 'medium',
              cameraMovement: shot.cameraMovement || 'static',
              lensRecommendation: shot.lensRecommendation || undefined,
              durationEstimate: shot.durationEstimate || 5,
              priority: shot.priority || 'must-have',
              fpsCameraFrameRate: shot.fpsCameraFrameRate || undefined,
              notes: shot.notes || '',
              actorInstructions: shot.actorInstructions || '',
              cameraCrewInstructions: shot.cameraCrewInstructions || '',
              lightingSetup: shot.lightingSetup || '',
              audioRequirements: shot.audioRequirements || '',
              continuityNotes: shot.continuityNotes || '',
              blockingDescription: shot.blockingDescription || '',
              storyboardFrameId: storyboardFrameId,
              setupGroup: shot.setupGroup || '',
              estimatedSetupTime: shot.estimatedSetupTime || 0,
              status: 'planned',
              comments: [],
              // Inherit AI generation flags from storyboard frame
              canBeAIGenerated: canBeAIGenerated,
              aiGenerationPrompt: aiGenerationPrompt,
              aiGenerationRecommendation: aiGenerationRecommendation
            }
          })
        : []

      return {
        sceneNumber: scene.sceneNumber,
        sceneTitle: sceneTitle,
        location: location,
        shots: shots,
        totalShots: shots.length,
        completedShots: 0 // Initially none are completed
      }
    })

    // Calculate totals
    const totalShots = shotListScenes.reduce((sum, scene) => sum + scene.totalShots, 0)
    const completedShots = shotListScenes.reduce((sum, scene) => sum + scene.completedShots, 0)

    return {
      episodeNumber,
      episodeTitle,
      totalShots,
      completedShots,
      scenes: shotListScenes,
      lastUpdated: Date.now(),
      updatedBy: userId
    }
  } catch (error) {
    console.error('❌ Error parsing AI response for shot list:', error)
    console.error('Response:', aiResponse.substring(0, 500))
    throw new Error(`Failed to parse shot list: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Find dialogue for a specific scene from script
 */
function findSceneDialogue(script: GeneratedScript, sceneNumber: number): string | null {
  if (!script.pages) return null

  const dialogueLines: string[] = []
  
  for (const page of script.pages) {
    for (const element of page.elements || []) {
      // Check if element has scene number metadata
      if (element.metadata?.sceneNumber === sceneNumber) {
        // Look for dialogue elements
        if (element.type === 'dialogue' || element.type === 'character') {
          dialogueLines.push(element.content || '')
        }
      }
    }
  }

  return dialogueLines.length > 0 ? dialogueLines.join('\n') : null
}

/**
 * Enhance AI generation prompt with scene context and relevant story bible tone/style elements
 * Focused on the particular scene and tone adjustments, not the entire story bible
 */
function enhanceAIGenerationPrompt(
  basePrompt: string,
  shot: any,
  breakdownScene: any,
  storyBible?: any,
  scriptData?: GeneratedScript,
  episodeNumber?: number,
  episodeTitle?: string
): string {
  let enhancedPrompt = basePrompt
  
  // Add scene-specific context (compact format)
  if (breakdownScene) {
    const sceneParts: string[] = []
    if (breakdownScene.location) sceneParts.push(breakdownScene.location)
    if (breakdownScene.timeOfDay) sceneParts.push(breakdownScene.timeOfDay)
    if (breakdownScene.emotionalTone) sceneParts.push(breakdownScene.emotionalTone)
    
    if (sceneParts.length > 0) {
      enhancedPrompt = `[${sceneParts.join(', ')}] ${enhancedPrompt}`
    }
  }
  
  // Add story bible visual style (most important tone element)
  if (storyBible?.genreEnhancement?.visualStyle) {
    enhancedPrompt = `${enhancedPrompt} [Style: ${storyBible.genreEnhancement.visualStyle}]`
  }
  
  // Add color palette if available
  if (storyBible?.genreEnhancement?.colorPalette) {
    enhancedPrompt = `${enhancedPrompt} [Colors: ${storyBible.genreEnhancement.colorPalette}]`
  }
  
  // Ensure prompt doesn't exceed reasonable length (keep under 1200 chars for stored prompt)
  if (enhancedPrompt.length > 1200) {
    // Prioritize: base prompt, scene context, then truncate style
    const baseLength = basePrompt.length
    const availableSpace = 1200 - baseLength - 50
    if (availableSpace > 0) {
      const contextPart = enhancedPrompt.substring(basePrompt.length)
      enhancedPrompt = basePrompt + contextPart.substring(0, availableSpace)
    } else {
      enhancedPrompt = basePrompt.substring(0, 1200)
    }
  }
  
  return enhancedPrompt.trim()
}

