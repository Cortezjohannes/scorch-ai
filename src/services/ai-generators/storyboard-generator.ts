/**
 * Storyboard Generator - AI Service
 * Generates comprehensive storyboard frames from script breakdown data
 * 
 * Uses EngineAIRouter with Gemini 2.5 Pro for creative visual storytelling
 * 
 * Standards:
 * - Analyze script breakdown to determine shot breakdown per scene
 * - Generate detailed storyboard frames with visual descriptions
 * - Create image prompts optimized for DALL-E 3 generation
 * - Consider micro-budget production constraints
 * - Match visual style to story bible tone/genre
 */

import { EngineAIRouter } from '@/services/engine-ai-router'
import type { ScriptBreakdownData, StoryboardsData, StoryboardFrame, StoryboardScene } from '@/types/preproduction'

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

interface StoryboardGenerationParams {
  breakdownData: ScriptBreakdownData
  scriptData: GeneratedScript
  storyBible: any
  episodeNumber: number
  episodeTitle: string
  userId: string
}

interface SceneShotBreakdown {
  sceneNumber: number
  sceneTitle: string
  location: string
  timeOfDay: string
  shots: ShotFrame[]
}

interface ShotFrame {
  shotNumber: string
  description: string
  cameraAngle: string
  cameraMovement: string
  dialogueSnippet: string
  lightingNotes: string
  propsInFrame: string[]
  estimatedDuration: string
  imagePrompt: string
  visualNotes: string
}

/**
 * Generate storyboard frames for all scenes
 */
export async function generateStoryboards(params: StoryboardGenerationParams): Promise<StoryboardsData> {
  const { breakdownData, scriptData, storyBible, episodeNumber, episodeTitle, userId } = params

  console.log('🖼️ Generating storyboards for Episode', episodeNumber)
  console.log('📋 Analyzing', breakdownData.scenes.length, 'scenes')

  if (breakdownData.scenes.length === 0) {
    throw new Error('No scenes found in script breakdown. Please generate script breakdown first.')
  }

  // Build AI prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(breakdownData, scriptData, storyBible, episodeTitle)

  try {
    console.log('🤖 Calling AI for storyboard generation...')
    const response = await EngineAIRouter.generateContent({
      prompt: userPrompt,
      systemPrompt: systemPrompt,
      temperature: 0.8, // Creative for visual storytelling
      maxTokens: 12000, // Large enough for multiple scenes with detailed shots
      engineId: 'storyboard-generator',
      forceProvider: 'gemini' // Gemini excels at creative visual tasks
    })

    console.log('✅ AI Response received:', response.metadata.contentLength, 'characters')

    // Parse AI response into structured storyboard data
    const storyboardsData = parseStoryboards(response.content, breakdownData, episodeNumber, episodeTitle, userId)

    console.log('✅ Storyboards generated:')
    console.log('  Total frames:', storyboardsData.totalFrames)
    console.log('  Scenes:', storyboardsData.scenes.length)
    storyboardsData.scenes.forEach(scene => {
      console.log(`    Scene ${scene.sceneNumber}: ${scene.frames.length} shots`)
    })

    return storyboardsData
  } catch (error) {
    console.error('❌ Error generating storyboards:', error)
    throw new Error(`Storyboard generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Build system prompt for storyboard generation
 */
function buildSystemPrompt(): string {
  return `You are a professional storyboard artist and cinematographer working on a micro-budget web series.
Your job is to create detailed storyboard frames that break down each scene into individual shots, providing clear visual planning for the director, cinematographer, and production team.

**CRITICAL RULES:**

1. **SHOT BREAKDOWN ANALYSIS**
   - Analyze each scene to determine the appropriate number of shots needed
   - Consider dialogue, action, character movement, and visual storytelling needs
   - Break down scenes into logical shot sequences (establishing shots, coverage, close-ups, reactions)
   - For micro-budget: Prioritize shots that can be achieved efficiently (avoid overly complex camera moves unless essential)

2. **VISUAL COMPOSITION**
   - For each shot, provide detailed visual description including:
     * Character positions and blocking
     * Composition and framing (rule of thirds, leading lines, depth)
     * Camera perspective and eye level
     * Visual elements in frame (props, backgrounds, foreground elements)

3. **CAMERA SPECIFICATIONS**
   - Camera angle: Choose from wide, medium, close-up, extreme close-up, over-shoulder, two-shot, dutch angle, bird's eye, worm's eye
   - Camera movement: static, pan, tilt, dolly, zoom, handheld, tracking, crane, steadicam
   - Shot size: extreme wide, wide, medium wide, medium, medium close-up, close-up, extreme close-up
   - Consider micro-budget constraints (prefer simpler moves when possible)

4. **LIGHTING NOTES**
   - Specify lighting mood based on scene setting and time of day
   - Note key light direction and fill requirements
   - Consider practical lights and natural light sources
   - Match lighting to emotional tone of scene

5. **IMAGE GENERATION PROMPTS**
   - Create detailed, specific prompts for DALL-E 3 image generation
   - Include: shot type, camera angle, character descriptions, setting, lighting mood, visual style
   - Format: "Cinematic storyboard frame, [shot type] shot from [angle], [visual description], [character positions], [lighting mood], [genre/style], professional film storyboard style, detailed composition"
   - Ensure prompts are optimized for storyboard visualization (not final film quality)

6. **PRODUCTION NOTES**
   - Identify props visible in each frame
   - Note special equipment requirements (if any)
   - Estimate shot duration (in seconds)
   - Consider scene continuity and transitions

7. **OUTPUT FORMAT**
   - Valid JSON only
   - No markdown, no code blocks, no explanations outside the JSON
   - Structure: { scenes: [ { sceneNumber, shots: [ { shotNumber, description, cameraAngle, cameraMovement, dialogueSnippet, lightingNotes, propsInFrame, estimatedDuration, imagePrompt, visualNotes } ] } ] }
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
  episodeTitle: string
): string {
  let prompt = `Generate comprehensive storyboard frames for Episode "${episodeTitle}" of the series "${storyBible?.seriesTitle || storyBible?.title || 'Untitled Series'}".\n\n`

  // Story context
  prompt += `**STORY CONTEXT:**\n`
  prompt += `Series Genre: ${storyBible?.genre || 'Drama'}\n`
  prompt += `Series Tone: ${storyBible?.tone || 'Realistic'}\n`
  prompt += `Visual Style: ${storyBible?.visualStyle || 'Naturalistic'}\n`
  if (storyBible?.logline) prompt += `Series Logline: ${storyBible.logline}\n`
  prompt += `Production Model: Micro-budget web series ($1k-$20k total series budget)\n`
  prompt += `\n`

  // Episode context
  prompt += `**EPISODE:** ${episodeTitle}\n`
  prompt += `Total Scenes: ${breakdown.scenes.length}\n`
  prompt += `\n`

  // Process each scene
  prompt += `**SCENES TO STORYBOARD:**\n\n`
  
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
      prompt += `Script Dialogue:\n${scriptDialogue}\n`
    }
    
    prompt += `\n`
  }

  // Output format instructions
  prompt += `**TASK:**\n`
  prompt += `For EACH scene above, analyze the scene's complexity, dialogue, action, and visual storytelling needs to determine the appropriate shot breakdown.\n\n`
  prompt += `**CRITICAL - SHOT COUNT VARIATION:**\n`
  prompt += `- Simple scenes (single location, minimal action): 2-3 shots\n`
  prompt += `- Medium complexity scenes (dialogue-heavy or moderate action): 4-5 shots\n`
  prompt += `- Complex scenes (multiple locations, heavy action, emotional beats): 6-8 shots\n`
  prompt += `- DO NOT default to the same number of shots for every scene\n`
  prompt += `- Vary the shot count based on each scene's actual needs\n\n`
  prompt += `For each shot, provide:\n`
  prompt += `- shotNumber: Sequential shot number within the scene (e.g., "1", "2", "3")\n`
  prompt += `- description: Detailed visual description of what's in the frame (characters, actions, composition)\n`
  prompt += `- cameraAngle: Camera angle type (wide, medium, close-up, extreme close-up, over-shoulder, two-shot, etc.)\n`
  prompt += `- cameraMovement: Camera movement type (static, pan, tilt, dolly, zoom, handheld, tracking, etc.)\n`
  prompt += `- dialogueSnippet: Any dialogue or voice-over in this shot (from script if available)\n`
  prompt += `- lightingNotes: Lighting mood and direction (e.g., "warm window light from left, soft fill from right")\n`
  prompt += `- propsInFrame: Array of props visible in this shot\n`
  prompt += `- estimatedDuration: Estimated shot duration in seconds (e.g., "3s", "5s")\n`
  prompt += `- imagePrompt: Detailed prompt for DALL-E 3 image generation (cinematic storyboard frame style)\n`
  prompt += `- visualNotes: Additional visual notes for production team\n\n`

  prompt += `**OUTPUT FORMAT:**\n\n`
  prompt += `Provide ONLY valid JSON with this structure:\n\n`
  prompt += `{\n`
  prompt += `  "scenes": [\n`
  prompt += `    {\n`
  prompt += `      "sceneNumber": 1,\n`
  prompt += `      "shots": [\n`
  prompt += `        {\n`
  prompt += `          "shotNumber": "1",\n`
  prompt += `          "description": "Wide shot of the penthouse living room at night. City lights visible through floor-to-ceiling windows. JASON stands silhouetted against the window, holding a whiskey tumbler. The room is dimly lit with warm accent lighting.",\n`
  prompt += `          "cameraAngle": "wide",\n`
  prompt += `          "cameraMovement": "static",\n`
  prompt += `          "dialogueSnippet": "",\n`
  prompt += `          "lightingNotes": "Dark, moody lighting. Window light creates silhouette. Warm accent lights from bar area.",\n`
  prompt += `          "propsInFrame": ["whiskey tumbler", "bar", "windows"],\n`
  prompt += `          "estimatedDuration": "5s",\n`
  prompt += `          "imagePrompt": "Cinematic storyboard frame, wide shot from eye level, luxurious penthouse living room at night, city lights visible through floor-to-ceiling windows, man in silhouette holding whiskey glass, dark moody lighting with warm accent lights, dramatic composition, professional film storyboard style",\n`
  prompt += `          "visualNotes": "Establishing shot. Emphasize isolation and scale of the space."\n`
  prompt += `        },\n`
  prompt += `        {\n`
  prompt += `          "shotNumber": "2",\n`
  prompt += `          "description": "Medium shot of JASON's face in profile, looking at the whiskey glass. He appears troubled, lost in thought. The city lights create a soft rim light on his face.",\n`
  prompt += `          "cameraAngle": "medium",\n`
  prompt += `          "cameraMovement": "static",\n`
  prompt += `          "dialogueSnippet": "VOICE (V.O.): You want out on Uber? Are you sure?",\n`
  prompt += `          "lightingNotes": "Profile lighting with rim light from window. Soft fill light from practicals.",\n`
  prompt += `          "propsInFrame": ["whiskey tumbler"],\n`
  prompt += `          "estimatedDuration": "3s",\n`
  prompt += `          "imagePrompt": "Cinematic storyboard frame, medium shot from side angle, man in profile looking at whiskey glass, troubled expression, soft rim lighting from window, dramatic mood, professional film storyboard style",\n`
  prompt += `          "visualNotes": "Character moment. Focus on emotional state."\n`
  prompt += `        }\n`
  prompt += `      ]\n`
  prompt += `    }\n`
  prompt += `  ]\n`
  prompt += `}\n\n`

  prompt += `**CRITICAL REMINDERS:**\n`
  prompt += `- Output ONLY valid JSON (no markdown, no code blocks, no explanation)\n`
  prompt += `- Generate storyboard frames for ALL scenes listed above\n`
  prompt += `- VARY shot counts per scene based on complexity - simple scenes (2-3 shots), medium (4-5 shots), complex (6-8 shots)\n`
  prompt += `- DO NOT use the same shot count for every scene - analyze each scene independently\n`
  prompt += `- Create detailed image prompts optimized for DALL-E 3 storyboard visualization\n`
  prompt += `- Match visual style to the story's genre and tone\n`
  prompt += `- Consider micro-budget production constraints\n`
  prompt += `- All information must be realistic and tailored to the scene descriptions provided`

  return prompt
}

/**
 * Find dialogue and action lines for a specific scene from script
 */
function findSceneDialogue(script: GeneratedScript, sceneNumber: number): string | null {
  const dialogueLines: string[] = []
  
  for (const page of script.pages || []) {
    for (const element of page.elements || []) {
      if (element.metadata?.sceneNumber === sceneNumber) {
        if (element.type === 'dialogue') {
          dialogueLines.push(element.content || '')
        } else if (element.type === 'action') {
          // Include key action lines for context
          const actionText = element.content || ''
          if (actionText.length < 200) {
            dialogueLines.push(`[ACTION: ${actionText}]`)
          }
        }
      }
    }
  }
  
  return dialogueLines.length > 0 ? dialogueLines.join('\n') : null
}

/**
 * Parse AI response into structured storyboard data
 */
function parseStoryboards(
  aiResponse: string,
  breakdown: ScriptBreakdownData,
  episodeNumber: number,
  episodeTitle: string,
  userId: string
): StoryboardsData {
  try {
    // Clean AI output
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

    // Build storyboard scenes with frames
    const storyboardScenes: StoryboardScene[] = []
    let globalShotCounter = 1

    for (const sceneData of parsed.scenes) {
      const sceneNumber = sceneData.sceneNumber
      const breakdownScene = breakdown.scenes.find(s => s.sceneNumber === sceneNumber)
      
      if (!breakdownScene) {
        console.warn(`Scene ${sceneNumber} not found in breakdown, skipping`)
        continue
      }

      const frames: StoryboardFrame[] = []
      
      if (sceneData.shots && Array.isArray(sceneData.shots)) {
        for (const shot of sceneData.shots) {
          const frame: StoryboardFrame = {
            id: `frame_${Date.now()}_${globalShotCounter}`,
            shotNumber: shot.shotNumber || String(globalShotCounter),
            sceneNumber: sceneNumber,
            frameImage: undefined, // Will be generated later by user
            imagePrompt: shot.imagePrompt || generateFallbackImagePrompt(shot, breakdownScene),
            cameraAngle: shot.cameraAngle || 'medium',
            cameraMovement: shot.cameraMovement || 'static',
            dialogueSnippet: shot.dialogueSnippet || '',
            lightingNotes: shot.lightingNotes || `Lighting based on ${breakdownScene.timeOfDay.toLowerCase()} setting`,
            propsInFrame: Array.isArray(shot.propsInFrame) ? shot.propsInFrame : [],
            referenceImages: [],
            status: 'draft',
            notes: shot.visualNotes || shot.description || `Shot ${shot.shotNumber}: ${shot.description || ''}`,
            comments: []
          }
          
          frames.push(frame)
          globalShotCounter++
        }
      }

      storyboardScenes.push({
        sceneNumber: sceneNumber,
        sceneTitle: breakdownScene.sceneTitle || `Scene ${sceneNumber}`,
        frames: frames
      })
    }

    // Calculate totals
    const totalFrames = storyboardScenes.reduce((sum, scene) => sum + scene.frames.length, 0)
    const finalizedFrames = storyboardScenes.reduce((sum, scene) => 
      sum + scene.frames.filter(f => f.status === 'final').length, 0
    )

    return {
      episodeNumber,
      episodeTitle,
      totalFrames,
      finalizedFrames,
      scenes: storyboardScenes,
      lastUpdated: Date.now(),
      updatedBy: userId
    }
  } catch (error) {
    console.error('❌ Error parsing AI response:', error)
    console.error('Response:', aiResponse.substring(0, 500))
    throw new Error(`Failed to parse storyboards: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate fallback image prompt if AI didn't provide one
 */
function generateFallbackImagePrompt(shot: ShotFrame, scene: any): string {
  const shotType = shot.cameraAngle || 'medium'
  const location = scene.location || 'interior'
  const timeOfDay = scene.timeOfDay || 'DAY'
  const description = shot.description || 'cinematic scene'
  
  return `Cinematic storyboard frame, ${shotType} shot, ${description}, ${location} setting, ${timeOfDay.toLowerCase()} lighting, professional film storyboard style, detailed composition`
}
