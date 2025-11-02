/**
 * Shot List Generator - AI Service
 * Generates comprehensive production shot lists from script breakdown and storyboards
 * 
 * Uses EngineAIRouter with Gemini 2.5 Pro for technical production planning
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
      shotNumber: string
      cameraAngle: string
      cameraMovement: string
      dialogueSnippet: string
      lightingNotes: string
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
}

/**
 * Generate shot list for all scenes
 */
export async function generateShotList(params: ShotListGenerationParams): Promise<ShotListData> {
  const { breakdownData, scriptData, storyBible, storyboardsData, episodeNumber, episodeTitle, userId } = params

  console.log('🎬 Generating shot list for Episode', episodeNumber)
  console.log('📋 Analyzing', breakdownData.scenes.length, 'scenes')

  if (breakdownData.scenes.length === 0) {
    throw new Error('No scenes found in script breakdown. Please generate script breakdown first.')
  }

  // Build AI prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(breakdownData, scriptData, storyBible, storyboardsData, episodeTitle)

  try {
    console.log('🤖 Calling AI for shot list generation...')
    const response = await EngineAIRouter.generateContent({
      prompt: userPrompt,
      systemPrompt: systemPrompt,
      temperature: 0.7, // Lower temperature for technical precision
      maxTokens: 12000, // Large enough for multiple scenes with detailed shots
      engineId: 'shot-list-generator',
      forceProvider: 'gemini' // Gemini excels at structured technical tasks
    })

    console.log('✅ AI Response received:', response.metadata.contentLength, 'characters')

    // Parse AI response into structured shot list data
    const shotListData = parseShotList(response.content, breakdownData, episodeNumber, episodeTitle, userId)

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
  return `You are a professional production coordinator and camera technician working on a micro-budget web series.
Your job is to create detailed shot lists that provide technical specifications for on-set execution, focusing on camera specs, duration estimates, and production efficiency.

**CRITICAL RULES:**

1. **TECHNICAL FOCUS (NOT VISUAL)**
   - Shot lists are PRODUCTION EXECUTION PLANS, not visual/creative descriptions
   - Focus on camera specs (lens, frame rate, duration) rather than visual composition
   - Prioritize on-set efficiency over creative storytelling
   - This is for the camera team and AD, not the director/cinematographer

2. **SHOT BREAKDOWN**
   - If storyboards exist, use them as reference for shot count and camera angles
   - If storyboards don't exist, generate shots directly from script breakdown
   - Analyze each scene to determine appropriate shot breakdown
   - Consider dialogue, action, and production efficiency
   - Vary shot counts per scene (simple: 2-3, medium: 4-5, complex: 6-8 shots)

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
   - Group similar camera setups together
   - Note special equipment requirements (stabilizer, lights, etc.)
   - Consider micro-budget constraints (equipment availability)
   - Keep descriptions concise and production-focused

7. **OUTPUT FORMAT**
   - Valid JSON only
   - No markdown, no code blocks, no explanations outside the JSON
   - Structure: { scenes: [ { sceneNumber, sceneTitle, location, shots: [ { shotNumber, description, cameraAngle, cameraMovement, lensRecommendation, durationEstimate, priority, fpsCameraFrameRate, notes } ] } ] }
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
  episodeTitle: string
): string {
  let prompt = `Generate comprehensive production shot list for Episode "${episodeTitle}" of the series "${storyBible?.seriesTitle || storyBible?.title || 'Untitled Series'}".\n\n`

  // Story context
  prompt += `**STORY CONTEXT:**\n`
  prompt += `Series Genre: ${storyBible?.genre || 'Drama'}\n`
  prompt += `Series Tone: ${storyBible?.tone || 'Realistic'}\n`
  prompt += `Production Model: Micro-budget web series ($1k-$20k total series budget)\n`
  prompt += `\n`

  // Episode context
  prompt += `**EPISODE:** ${episodeTitle}\n`
  prompt += `Total Scenes: ${breakdown.scenes.length}\n`
  prompt += `\n`

  // Storyboards reference
  if (storyboardsData && storyboardsData.scenes && storyboardsData.scenes.length > 0) {
    prompt += `**STORYBOARDS AVAILABLE (Use as Reference):**\n`
    prompt += `Storyboards define the visual shots - shot list should reflect these shots with technical specs.\n\n`
    storyboardsData.scenes.forEach(scene => {
      prompt += `Scene ${scene.sceneNumber}: ${scene.sceneTitle}\n`
      prompt += `  Total Shots: ${scene.frames.length}\n`
      scene.frames.forEach(frame => {
        prompt += `  Shot ${frame.shotNumber}: ${frame.cameraAngle} ${frame.cameraMovement}, ${frame.dialogueSnippet ? 'Dialogue: ' + frame.dialogueSnippet.substring(0, 50) + '...' : 'No dialogue'}\n`
      })
      prompt += `\n`
    })
    prompt += `**IMPORTANT:** Use storyboard shots as reference - generate technical shot list that reflects these shots.\n`
    prompt += `Focus on camera specs (lens, frame rate, duration) rather than visual descriptions.\n\n`
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
  prompt += `- description: Brief production-focused description (what happens, not visual composition)\n`
  prompt += `- cameraAngle: Camera angle type (wide, medium, close-up, extreme-close-up, over-shoulder, pov, dutch)\n`
  prompt += `- cameraMovement: Camera movement type (static, pan, tilt, dolly, tracking, handheld, steadicam, crane)\n`
  prompt += `- lensRecommendation: Recommended lens (e.g., "24mm", "50mm", "85mm", "24-70mm")\n`
  prompt += `- durationEstimate: Estimated shot duration in seconds (based on dialogue length and action)\n`
  prompt += `- priority: Shot priority (must-have, nice-to-have, optional)\n`
  prompt += `- fpsCameraFrameRate: Frame rate if different from 24fps (e.g., 60 for slow-mo, omit if 24fps)\n`
  prompt += `- notes: Production notes (equipment needs, special considerations, etc.)\n\n`

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
  prompt += `          "notes": "Establish location, static shot"\n`
  prompt += `        },\n`
  prompt += `        {\n`
  prompt += `          "shotNumber": "2",\n`
  prompt += `          "description": "Medium shot of Jason at window with dialogue",\n`
  prompt += `          "cameraAngle": "medium",\n`
  prompt += `          "cameraMovement": "static",\n`
  prompt += `          "lensRecommendation": "50mm",\n`
  prompt += `          "durationEstimate": 8,\n`
  prompt += `          "priority": "must-have",\n`
  prompt += `          "notes": "Key dialogue shot, static medium"\n`
  prompt += `        }\n`
  prompt += `      ]\n`
  prompt += `    }\n`
  prompt += `  ]\n`
  prompt += `}\n\n`

  prompt += `**CRITICAL REMINDERS:**\n`
  prompt += `- Output ONLY valid JSON (no markdown, no code blocks, no explanation)\n`
  prompt += `- Generate shot list for ALL scenes listed above\n`
  prompt += `- Vary shot counts per scene based on complexity (2-8 shots per scene)\n`
  prompt += `- Focus on technical specs (lens, frame rate, duration) not visual descriptions\n`
  prompt += `- Assign priorities realistically (must-have for critical story beats)\n`
  prompt += `- Consider micro-budget constraints (prefer simpler camera setups)\n`
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
  userId: string
): ShotListData {
  try {
    let cleaned = aiResponse.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const parsed = JSON.parse(cleaned)

    if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
      throw new Error('Invalid AI response structure: expected scenes array')
    }

    const shotListScenes: ShotListScene[] = parsed.scenes.map((scene: any) => {
      const breakdownScene = breakdownData.scenes.find(s => s.sceneNumber === scene.sceneNumber)
      const sceneTitle = scene.sceneTitle || breakdownScene?.sceneTitle || `Scene ${scene.sceneNumber}`
      const location = scene.location || breakdownScene?.location || 'Location TBD'

      const shots: Shot[] = Array.isArray(scene.shots)
        ? scene.shots.map((shot: any, shotIdx: number) => ({
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
            status: 'planned',
            comments: []
          }))
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

