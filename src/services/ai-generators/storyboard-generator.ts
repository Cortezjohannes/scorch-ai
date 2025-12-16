/**
 * Storyboard Generator - AI Service
 * Generates comprehensive storyboard frames from script breakdown data
 * 
 * Uses EngineAIRouter with Gemini 3 Pro Preview for creative visual storytelling
 * 
 * Standards:
 * - Analyze script breakdown to determine shot breakdown per scene
 * - Generate detailed storyboard frames with visual descriptions
 * - Create image prompts optimized for DALL-E 3 generation
 * - Consider micro-budget production constraints
 * - Match visual style to story bible tone/genre
 */

import { EngineAIRouter } from '@/services/engine-ai-router'
import type { ScriptBreakdownData, StoryboardsData, StoryboardFrame, StoryboardScene, StoryboardArtStyle } from '@/types/preproduction'
import {
  extractArtStyleFromStoryBible,
  generateStyleFromGenre,
  getDefaultArtStyle,
  applyArtStyleToPrompt
} from '@/services/storyboard-art-style'

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

  // Extract or generate art style for consistent image generation
  let artStyle: StoryboardArtStyle
  const extractedStyle = extractArtStyleFromStoryBible(storyBible)
  if (extractedStyle) {
    artStyle = extractedStyle
    console.log('🎨 Using art style from story bible:', artStyle.name)
  } else {
    artStyle = generateStyleFromGenre(
      storyBible?.genre || 'drama',
      storyBible?.tone || 'realistic',
      storyBible?.visualStyle || null
    )
    console.log('🎨 Generated art style from genre:', artStyle.name)
  }

  // Build AI prompts with art style
  const systemPrompt = buildSystemPrompt(artStyle)
  const userPrompt = buildUserPrompt(breakdownData, scriptData, storyBible, episodeTitle, artStyle)

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
    const storyboardsData = parseStoryboards(response.content, breakdownData, episodeNumber, episodeTitle, userId, artStyle)

    console.log('✅ Storyboards generated:')
    console.log('  Total frames:', storyboardsData.totalFrames)
    console.log('  Scenes:', storyboardsData.scenes.length)
    console.log('  Art style:', storyboardsData.artStyle?.name || 'Not set')
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
function buildSystemPrompt(artStyle: StoryboardArtStyle): string {
  const styleDescription = `${artStyle.renderingStyle} style, ${artStyle.colorTreatment}, ${artStyle.lineWeight} line work, ${artStyle.shadingStyle}, ${artStyle.referenceStyle} aesthetic`
  
  return `You are a professional storyboard artist and cinematographer working on a micro-budget web series.
Your job is to create detailed storyboard frames that break down each scene into individual shots, providing clear visual planning for the director, cinematographer, and production team. Each frame must read like a narrative moment from the script, not a production instruction.

**ABSOLUTELY CRITICAL - SCRIPT ACCURACY:**
- BEFORE generating any frame descriptions, you MUST carefully read and analyze the COMPLETE SCRIPT CONTENT provided for each scene
- Every frame description MUST accurately reflect what is ACTUALLY written in the script
- Frame descriptions must include SPECIFIC character actions, reactions, interactions, and dialogue as written in the script
- DO NOT create generic, vague, or placeholder descriptions that don't match the script
- Examples of script-accurate descriptions:
  * GOOD: "Niko's eyes widen in shock as he sees Julian enter, his hands clenching into fists as anger surges"
  * GOOD: "Julian steps closer to Johannes, voice dropping to a threatening whisper, establishing dominance"
  * GOOD: "Johannes shoves back from the wall, teeth clenched, ready to fight back against Julian"
  * BAD: "Two characters in a room" (too vague, no specific action)
  * BAD: "Tense conversation" (doesn't describe what's actually happening)
  * BAD: "Medium shot of characters" (no action, no story context)

**CRITICAL RULES:**

1. **SHOT BREAKDOWN ANALYSIS**
   - Analyze each scene to determine the appropriate number of shots needed
   - Consider dialogue, action, character movement, and visual storytelling needs
   - Break down scenes into logical shot sequences (establishing shots, coverage, close-ups, reactions)
   - For micro-budget: Prioritize shots that can be achieved efficiently (avoid overly complex camera moves unless essential)

2. **VISUAL COMPOSITION - MUST MATCH SCRIPT**
   - For each shot, provide detailed visual description that ACCURATELY reflects the script:
     * **CRITICAL: What's ACTUALLY happening in THIS SHOT from the script** - include the specific narrative action, character interactions, reactions, and story beats as written
     * Write as a narrative moment (what the audience sees happening), not as production instructions (avoid "we see", "the camera shows", or placeholder directions)
     * Character positions and blocking based on script action lines
     * Character expressions and reactions matching the script's emotional beats
     * Composition and framing (rule of thirds, leading lines, depth)
     * Camera perspective and eye level
     * Visual elements in frame (props, backgrounds, foreground elements from script)
     * **Specific script context** - what the characters are actually doing according to the script (e.g., "Niko's fists clench as Julian steps in", "Julian corners Johannes against the wall")
     * DO NOT create generic descriptions - every detail should reflect what's written in the script

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

5. **SCRIPT CONTEXT EXTRACTION - CRITICAL FOR FAMILIARITY**
   - **ABSOLUTELY CRITICAL: Every frame MUST have a scriptContext field containing the actual script action happening in this specific frame**
   - The scriptContext should be a SHORT, SPECIFIC description of what is actually happening in the script at this moment
   - Extract directly from the script content provided - do NOT create generic descriptions
   - Focus on the key action, reaction, or dialogue that makes this moment unique
   - Format: Brief, narrative action description (2-15 words) that captures the essence of this specific frame
   - Examples of GOOD scriptContext:
     * "Bayani grabs the EMERGENCY RELEASE LEVER above the door"
     * "Her hand passes STRAIGHT THROUGH the plastic handle"
     * "Julian pokes at a longganisa sausage on his plate"
     * "The sausage is VIBRATING slightly"
     * "Niko's eyes widen in shock as Julian enters"
     * "Julian steps closer, voice dropping to threatening whisper"
   - Examples of BAD scriptContext:
     * "Two characters in a room" (too vague, no specific action)
     * "Tense conversation" (doesn't describe what's actually happening)
     * "Medium shot of characters" (no action, just technical description)
     * "Interior scene" (no character action)

6. **IMAGE GENERATION PROMPTS - CRITICAL: SCRIPT ACCURACY & ART STYLE CONSISTENCY**
   - **ABSOLUTELY CRITICAL: imagePrompts MUST reflect the ACTUAL SCRIPT CONTENT and use scriptContext as primary reference**
   - The imagePrompt should be BASED ON the scriptContext field - what is ACTUALLY happening in this specific frame
   - **ALL image prompts MUST use the EXACT same art style for consistency across all frames**
   - **VISUAL STORYTELLING: These frames will be consumed like illustrated fiction books or graphic novels**
   - **Images must tell the story through visual composition alone - character expressions, body language, environmental details**
   - **ABSOLUTELY NO dialog bubbles, speech bubbles, text overlays, or written words should appear in the images**
   - Art Style: ${artStyle.name} - ${artStyle.description}
   - Style Specification: ${styleDescription}

   **What to Include in imagePrompt (IN THIS ORDER):**
   1. Setting/location (from script)
   2. Shot type and camera angle
   3. **SCRIPT ACTION FROM scriptContext** - The actual action happening in this frame as described in scriptContext
   4. Character positions, expressions, and body language (matching script emotion and action)
   5. Visual composition and framing (cinematic, narrative-driven)
   6. Lighting mood (supporting the emotional tone)
   7. Art style specification (mandatory ending)

   **Examples of SCRIPT-ACCURATE imagePrompts (using scriptContext for tight visual storytelling):**
   - GOOD: "Living room at dawn, wide shot from high angle, Niko's eyes widen in shock as Julian enters the room, Niko's body tenses with clenched fists showing anger, Julian framed menacingly in doorway backlit by hallway light, dramatic composition emphasizing threat through body language and positioning, natural window light creating atmospheric tension, ${styleDescription}, consistent storyboard art style"
   - GOOD: "Office interior, medium close-up from side angle, Julian steps closer with threatening posture, his face intense and intimidating as he speaks in low threatening whisper, Johannes pressed against wall with fearful defensive expression, tense composition with shallow depth emphasizing confrontation, harsh overhead lighting casting dramatic shadows on faces, ${styleDescription}, consistent storyboard art style"
   - GOOD: "Train compartment interior, close-up from eye level, Bayani's hand reaching for the EMERGENCY RELEASE LEVER above door, her expression determined and focused, hand outstretched mid-action capturing precise moment, tight framing on hand and lever with emergency signage visible, dim overhead lighting with emergency light glow, ${styleDescription}, consistent storyboard art style"
   - BAD: "Two characters in a room" (no specific action, too vague, no visual storytelling)
   - BAD: "Tense conversation between characters" (doesn't describe what's ACTUALLY happening, no body language or expressions)
   - BAD: "Medium shot of interior" (no character action, no script context, no emotional storytelling)

   **Format:** "[Location], [shot type] shot from [angle], [SCRIPT ACTION FROM scriptContext with character body language and expressions], [character positions and emotional states shown through visual elements], [cinematic composition emphasizing the story moment], [lighting mood supporting emotional tone], ${styleDescription}, consistent storyboard art style"

   - **MANDATORY: Every imagePrompt MUST end with: "${styleDescription}, consistent storyboard art style"**
   - **CRITICAL: Use the EXACT same style specification in every imagePrompt to ensure visual consistency**
   - **CRITICAL: imagePrompt MUST accurately depict what's in scriptContext - no generic placeholders**
   - **CRITICAL: Focus on visual storytelling - expressions, body language, composition that tells the story without text or dialog bubbles**

6. **PRODUCTION NOTES**
   - Identify props visible in each frame
   - Note special equipment requirements (if any)
   - Estimate shot duration (in seconds)
   - Consider scene continuity and transitions

7. **OUTPUT FORMAT - CRITICAL JSON VALIDATION**
   - **MUST be valid JSON** - no syntax errors, no missing values, no trailing commas
   - **EVERY field MUST have a value** - use empty string "" for text fields, [] for arrays, never leave values blank
   - **NO markdown, NO code blocks, NO explanations outside the JSON**
   - Structure: { scenes: [ { sceneNumber, shots: [ { shotNumber, description, scriptContext, cameraAngle, cameraMovement, dialogueSnippet, lightingNotes, propsInFrame, estimatedDuration, imagePrompt, visualNotes } ] } ] }
   - **CRITICAL: All string fields must have quotes and values: "lightingNotes": "value" NOT "lightingNotes": or "lightingNotes": \n**
   - **CRITICAL: All array fields must have brackets: "propsInFrame": [] NOT "propsInFrame": or "propsInFrame": \n**
   - Ensure all fields are populated realistically (use "" for empty strings, [] for empty arrays)
   - **CRITICAL: Every imagePrompt field must include the art style specification at the end**
   - **Test your JSON before outputting - it must parse without errors**
`
}

/**
 * Build user prompt with all context
 */
function buildUserPrompt(
  breakdown: ScriptBreakdownData,
  script: GeneratedScript,
  storyBible: any,
  episodeTitle: string,
  artStyle: StoryboardArtStyle
): string {
  let prompt = `Generate comprehensive storyboard frames for Episode "${episodeTitle}" of the series "${storyBible?.seriesTitle || storyBible?.title || 'Untitled Series'}".\n\n`

  // Story context (CORE DATA)
  prompt += `**STORY CONTEXT:**\n`
  if (storyBible?.seriesOverview) {
    prompt += `Series Overview: ${storyBible.seriesOverview}\n\n`
  }
  prompt += `Series Genre: ${storyBible?.genre || 'Drama'}\n`
  prompt += `Series Tone: ${storyBible?.tone || 'Realistic'}\n`
  prompt += `Visual Style: ${storyBible?.visualStyle || 'Naturalistic'}\n`
  if (storyBible?.logline) prompt += `Series Logline: ${storyBible.logline}\n`
  prompt += `Production Model: Micro-budget web series ($1k-$20k total series budget)\n`
  prompt += `\n`
  
  // Add technical tabs for better visual storytelling
  if (storyBible?.genreEnhancement) {
    prompt += `**GENRE & VISUAL STYLE GUIDE:**\n`
    const genre = storyBible.genreEnhancement
    if (genre.rawContent) {
      prompt += `${genre.rawContent.substring(0, 400)}\n\n`
    } else {
      if (genre.visualStyle) prompt += `Visual Style: ${genre.visualStyle}\n`
      if (genre.pacing) prompt += `Pacing: ${genre.pacing}\n`
      if (genre.audienceExpectations) prompt += `Audience Expectations: ${genre.audienceExpectations}\n\n`
    }
  }
  
  if (storyBible?.worldBuilding) {
    prompt += `**WORLD/SETTING (for location atmosphere):**\n`
    if (typeof storyBible.worldBuilding === 'string') {
      prompt += `${storyBible.worldBuilding.substring(0, 400)}\n\n`
    } else {
      if (storyBible.worldBuilding.setting) prompt += `Setting: ${storyBible.worldBuilding.setting}\n`
      if (storyBible.worldBuilding.rules) {
        prompt += `World Rules: ${typeof storyBible.worldBuilding.rules === 'string' ? storyBible.worldBuilding.rules.substring(0, 200) : ''}\n`
      }
      if (storyBible.worldBuilding.locations && Array.isArray(storyBible.worldBuilding.locations)) {
        prompt += `Key Locations (for visual reference):\n`
        storyBible.worldBuilding.locations.slice(0, 3).forEach((loc: any) => {
          prompt += `- ${loc.name}: ${loc.atmosphere || loc.description || ''}\n`
        })
      }
      prompt += `\n`
    }
  }
  
  if (storyBible?.tensionStrategy) {
    prompt += `**TENSION/PACING (for shot intensity):**\n`
    const tension = storyBible.tensionStrategy
    if (tension.rawContent) {
      prompt += `${tension.rawContent.substring(0, 300)}\n\n`
    } else {
      if (tension.escalationTechniques) prompt += `Escalation: ${tension.escalationTechniques}\n\n`
    }
  }
  
  if (storyBible?.themeIntegration) {
    prompt += `**THEME (for visual symbolism):**\n`
    const theme = storyBible.themeIntegration
    if (theme.rawContent) {
      prompt += `${theme.rawContent.substring(0, 250)}\n\n`
    } else {
      if (theme.symbolicElements) prompt += `Symbolic Elements: ${theme.symbolicElements}\n\n`
    }
  }
  
  // Art style specification for consistent image generation
  prompt += `**ART STYLE FOR ALL STORYBOARD IMAGES (MANDATORY):**\n`
  prompt += `Style Name: ${artStyle.name}\n`
  prompt += `Description: ${artStyle.description}\n`
  prompt += `Style Specification: ${artStyle.renderingStyle} style, ${artStyle.colorTreatment}, ${artStyle.lineWeight} line work, ${artStyle.shadingStyle}, ${artStyle.referenceStyle} aesthetic\n`
  prompt += `**CRITICAL: Every imagePrompt MUST end with this exact style specification followed by ", consistent storyboard art style"\n`
  prompt += `\n`

  // Episode context
  prompt += `**EPISODE:** ${episodeTitle}\n`
  prompt += `Total Scenes: ${breakdown.scenes.length}\n`
  prompt += `\n`

  // Process each scene with full script content
  prompt += `**SCENES TO STORYBOARD:**\n\n`
  prompt += `**CRITICAL: For each scene below, you MUST carefully read and analyze the FULL SCRIPT CONTENT before generating frame descriptions. Frame descriptions MUST accurately reflect what is ACTUALLY happening in the script - character actions, dialogue, reactions, and interactions. Do NOT create generic or vague descriptions that don't match the script.**\n\n`
  
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
    
    // Extract FULL script content for this scene (all action lines and dialogue)
    const sceneScriptContent = extractFullSceneContent(script, scene.sceneNumber)
    
    if (sceneScriptContent.fullContent && sceneScriptContent.fullContent.trim().length > 0) {
      console.log(`  ✅ Scene ${scene.sceneNumber}: Extracted ${sceneScriptContent.actionLines.length} action lines, ${sceneScriptContent.dialogueLines.length} dialogue lines`)
      prompt += `\n**COMPLETE SCRIPT CONTENT FOR THIS SCENE (REQUIRED READING):**\n`
      prompt += `Read this entire script section carefully. Each frame description MUST match what is written here:\n\n`
      prompt += `${sceneScriptContent.fullContent}\n\n`
      
      // Highlight key actions
      if (sceneScriptContent.actionLines.length > 0) {
        prompt += `**Key Actions in Script:**\n`
        sceneScriptContent.actionLines.forEach((action, idx) => {
          prompt += `${idx + 1}. ${action}\n`
        })
        prompt += `\n`
      }
      
      // Highlight dialogue
      if (sceneScriptContent.dialogueLines.length > 0) {
        prompt += `**Dialogue in Script:**\n`
        sceneScriptContent.dialogueLines.forEach(({ character, dialogue }) => {
          prompt += `${character}: "${dialogue}"\n`
        })
        prompt += `\n`
      }
    } else {
      // Fallback to scene content if script extraction fails
      console.warn(`  ⚠️  Scene ${scene.sceneNumber}: Script extraction failed, using fallback content`)
      if (scene.linkedSceneContent && scene.linkedSceneContent.trim().length > 0) {
        console.log(`  ✅ Scene ${scene.sceneNumber}: Using linkedSceneContent (${scene.linkedSceneContent.length} chars)`)
        prompt += `\n**COMPLETE SCRIPT CONTENT FOR THIS SCENE (REQUIRED READING):**\n`
        prompt += `Read this entire script section carefully. Each frame description MUST match what is written here:\n\n`
        prompt += `${scene.linkedSceneContent}\n\n`
      } else if (scene.notes && scene.notes.trim().length > 0) {
        console.log(`  ✅ Scene ${scene.sceneNumber}: Using scene notes (${scene.notes.length} chars)`)
        prompt += `\n**Scene Notes:**\n${scene.notes}\n\n`
      } else {
        console.warn(`  ❌ Scene ${scene.sceneNumber}: No script content available - AI will generate without script reference`)
      }
    }
    
    prompt += `---\n\n`
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
  prompt += `- description: **CRITICAL - MUST MATCH SCRIPT**: Brief, shot-specific summary that accurately describes what is ACTUALLY happening in THIS SHOT according to the script. Include:\n`
  prompt += `  * What characters are doing (specific actions from script: "Niko sees Julian and reacts violently", "Julian threatens Johannes establishing dominance", "Johannes fights back")\n`
  prompt += `  * Character interactions and reactions as written in the script\n`
  prompt += `  * The specific moment/action this shot captures from the script\n`
  prompt += `  * Visual composition details\n`
  prompt += `  * DO NOT create vague or generic descriptions - they MUST reflect the actual script content\n`
  prompt += `  * Examples of GOOD descriptions: "Niko's eyes widen as he sees Julian enter the room, his body tensing in shock and anger", "Julian stands over Johannes, voice low and threatening, establishing his dominance in the confrontation", "Johannes pushes back from the wall, hands clenched, ready to fight back against Julian's threat"\n`
  prompt += `  * Examples of BAD descriptions: "Two characters in a room", "Tense conversation", "Medium shot of characters" (too vague, no specific action)\n`
  prompt += `- scriptContext: **CRITICAL - ACTUAL SCRIPT ACTION**: Short, specific description of what is ACTUALLY happening in the script at this exact moment. Extract directly from script content - no generic descriptions.\n`
  prompt += `  * Focus on the key action, reaction, or dialogue that makes this moment unique\n`
  prompt += `  * Format: Brief narrative action (2-15 words) capturing the essence of this frame\n`
  prompt += `  * Examples: "Bayani grabs the EMERGENCY RELEASE LEVER above the door", "Her hand passes STRAIGHT THROUGH the plastic handle", "Julian pokes at a longganisa sausage on his plate"\n`
  prompt += `  * DO NOT use generic descriptions like "two characters talking" or "tense moment"\n`
  prompt += `- cameraAngle: Camera angle type (wide, medium, close-up, extreme close-up, over-shoulder, two-shot, etc.)\n`
  prompt += `- cameraMovement: Camera movement type (static, pan, tilt, dolly, zoom, handheld, tracking, etc.)\n`
  prompt += `- dialogueSnippet: Any dialogue or voice-over in this shot (from script if available)\n`
  prompt += `- lightingNotes: Lighting mood and direction (e.g., "warm window light from left, soft fill from right")\n`
  prompt += `- propsInFrame: Array of props visible in this shot\n`
  prompt += `- estimatedDuration: Estimated shot duration in seconds (e.g., "3s", "5s")\n`
  prompt += `- imagePrompt: **CRITICAL - MUST BE SCRIPT-ACCURATE**: This field generates the actual storyboard image. It MUST describe what is ACTUALLY happening in the script for THIS shot.\n`
  prompt += `  * Review the script content provided above for this scene\n`
  prompt += `  * Base the imagePrompt on the description field (which is already script-accurate)\n`
  prompt += `  * Include SPECIFIC character names and their ACTUAL actions from the script (e.g., "Niko sees Julian and reacts violently with clenched fists", "Julian threatens Johannes establishing dominance", "Johannes fights back shoving against the wall")\n`
  prompt += `  * Format: "[Location/setting from script], [shot type] shot, [SPECIFIC CHARACTER ACTION FROM SCRIPT - exact action happening], [character positions and expressions matching script], [visual composition], [lighting mood], ${artStyle.renderingStyle} style, ${artStyle.colorTreatment}, ${artStyle.lineWeight} line work, ${artStyle.shadingStyle}, ${artStyle.referenceStyle} aesthetic, consistent storyboard art style"\n`
  prompt += `  * DO NOT use vague descriptions like "characters talking" or "tense moment" - describe the ACTUAL action\n`
  prompt += `  * The imagePrompt should paint a clear picture of the specific moment in the script this shot captures\n`
  prompt += `- visualNotes: Additional visual notes for production team focused on this specific shot. Keep brief and shot-specific.\n\n`

  prompt += `**OUTPUT FORMAT:**\n\n`
  prompt += `Provide ONLY valid JSON with this structure:\n\n`
  prompt += `{\n`
  prompt += `  "scenes": [\n`
  prompt += `    {\n`
  prompt += `      "sceneNumber": 1,\n`
  prompt += `      "shots": [\n`
  prompt += `        {\n`
  prompt += `          "shotNumber": "1",\n`
  prompt += `          "description": "Wide shot of the penthouse living room at night. JASON stands silhouetted against the window, holding a whiskey tumbler. Based on script: He's contemplating a major decision about selling his Uber stock, lost in thought as he looks out at the city lights. The room is dimly lit with warm accent lighting, emphasizing his isolation and the weight of the decision.",\n`
  prompt += `          "scriptContext": "Jason stares out the window, contemplating selling his Uber stock",\n`
  prompt += `          "cameraAngle": "wide",\n`
  prompt += `          "cameraMovement": "static",\n`
  prompt += `          "dialogueSnippet": "",\n`
  prompt += `          "lightingNotes": "Dark, moody lighting. Window light creates silhouette. Warm accent lights from bar area.",\n`
  prompt += `          "propsInFrame": ["whiskey tumbler", "bar", "windows"],\n`
  prompt += `          "estimatedDuration": "5s",\n`
  prompt += `          "imagePrompt": "Cinematic storyboard frame, wide shot from eye level, luxurious penthouse living room at night, JASON contemplating decision about selling his Uber stock [SPECIFIC SCRIPT ACTION], standing in silhouette against floor-to-ceiling windows holding whiskey glass, looking out at city lights lost in thought processing the decision [EXACT EMOTIONAL STATE FROM SCRIPT], dark moody lighting with warm accent lights, dramatic composition emphasizing isolation and weight of decision, ${artStyle.renderingStyle} style, ${artStyle.colorTreatment}, ${artStyle.lineWeight} line work, ${artStyle.shadingStyle}, ${artStyle.referenceStyle} aesthetic, consistent storyboard art style",\n`
  prompt += `          "visualNotes": "Establishing shot. Emphasize isolation and scale of the space."\n`
  prompt += `        },\n`
  prompt += `        {\n`
  prompt += `          "shotNumber": "2",\n`
  prompt += `          "description": "Medium shot of JASON's face in profile, looking at the whiskey glass. Based on script: He's processing the decision about selling his Uber stock, appearing troubled and lost in thought. The city lights create a soft rim light on his face, highlighting his internal conflict.",\n`
  prompt += `          "scriptContext": "Jason looks at whiskey glass, troubled by the Uber decision",\n`
  prompt += `          "cameraAngle": "medium",\n`
  prompt += `          "cameraMovement": "static",\n`
  prompt += `          "dialogueSnippet": "VOICE (V.O.): You want out on Uber? Are you sure?",\n`
  prompt += `          "lightingNotes": "Profile lighting with rim light from window. Soft fill light from practicals.",\n`
  prompt += `          "propsInFrame": ["whiskey tumbler"],\n`
  prompt += `          "estimatedDuration": "3s",\n`
  prompt += `          "imagePrompt": "Cinematic storyboard frame, medium shot from side angle, JASON in profile contemplating the Uber stock decision [SPECIFIC SCRIPT ACTION], looking at whiskey glass with troubled expression processing internal conflict about selling his stock [EXACT EMOTIONAL STATE FROM SCRIPT], soft rim lighting from window, dramatic mood emphasizing emotional weight of decision, ${artStyle.renderingStyle} style, ${artStyle.colorTreatment}, ${artStyle.lineWeight} line work, ${artStyle.shadingStyle}, ${artStyle.referenceStyle} aesthetic, consistent storyboard art style",\n`
  prompt += `          "visualNotes": "Character moment. Focus on emotional state."\n`
  prompt += `        }\n`
  prompt += `      ]\n`
  prompt += `    }\n`
  prompt += `  ]\n`
  prompt += `}\n\n`

  prompt += `**CRITICAL REMINDERS:**\n`
  prompt += `- **MOST IMPORTANT: READ THE FULL SCRIPT CONTENT for each scene before generating frames. Every frame description MUST accurately match what is written in the script.**\n`
  prompt += `- Frame descriptions must include SPECIFIC character actions, reactions, and interactions as written in the script (e.g., "Niko sees Julian and reacts violently", "Julian threatens Johannes", "Johannes fights back")\n`
  prompt += `- DO NOT create vague, generic, or placeholder descriptions - every description must reflect actual script content\n`
  prompt += `- Analyze character interactions carefully: Who is doing what? How are they reacting? What is the specific action happening in this shot?\n`
  prompt += `- **CRITICAL JSON VALIDATION: Output ONLY valid JSON with NO syntax errors**\n`
  prompt += `  * Every field MUST have a value - use "" for empty strings, [] for empty arrays\n`
  prompt += `  * NO missing values after colons (e.g., "lightingNotes": "" NOT "lightingNotes": \n)\n`
  prompt += `  * NO trailing commas before closing braces/brackets\n`
  prompt += `  * NO markdown, NO code blocks, NO explanations outside the JSON\n`
  prompt += `  * Test your JSON - it must parse without errors\n`
  prompt += `- Generate storyboard frames for ALL scenes listed above\n`
  prompt += `- VARY shot counts per scene based on complexity - simple scenes (2-3 shots), medium (4-5 shots), complex (6-8 shots)\n`
  prompt += `- DO NOT use the same shot count for every scene - analyze each scene independently\n`
  prompt += `- **Keep descriptions concise but SPECIFIC** - focus on the exact action happening in THIS shot from the script\n`
  prompt += `- Create detailed image prompts that describe the SPECIFIC ACTION from the script, not generic placeholders\n`
  prompt += `- **CRITICAL: Every imagePrompt MUST end with the exact art style specification: "${artStyle.renderingStyle} style, ${artStyle.colorTreatment}, ${artStyle.lineWeight} line work, ${artStyle.shadingStyle}, ${artStyle.referenceStyle} aesthetic, consistent storyboard art style"\n`
  prompt += `- This ensures ALL storyboard images use the same visual style for consistency\n`
  prompt += `- Consider micro-budget production constraints\n`
  prompt += `- **Remember: If the script says "Niko sees Julian and reacts violently", your frame description must say something like "Niko's eyes widen as he spots Julian, his body tensing in shock and anger" - NOT "Two characters in a room" or "Tense moment"**`

  return prompt
}

/**
 * Extract complete scene content (all action lines, dialogue, and character names) from script
 * This provides the full context needed for accurate storyboard frame descriptions
 */
function extractFullSceneContent(script: GeneratedScript, sceneNumber: number): {
  fullContent: string
  actionLines: string[]
  dialogueLines: Array<{ character: string; dialogue: string }>
} {
  const actionLines: string[] = []
  const dialogueLines: Array<{ character: string; dialogue: string }> = []
  let currentCharacter: string | null = null
  const contentParts: string[] = []
  
  for (const page of script.pages || []) {
    for (const element of page.elements || []) {
      if (element.metadata?.sceneNumber === sceneNumber) {
        if (element.type === 'slug') {
          contentParts.push(`SCENE HEADING: ${element.content}`)
        } else if (element.type === 'action') {
          const actionText = element.content?.trim() || ''
          if (actionText) {
            actionLines.push(actionText)
            contentParts.push(`ACTION: ${actionText}`)
          }
        } else if (element.type === 'character') {
          currentCharacter = element.content?.trim() || null
          if (currentCharacter) {
            contentParts.push(`CHARACTER: ${currentCharacter}`)
          }
        } else if (element.type === 'dialogue' && currentCharacter) {
          const dialogueText = element.content?.trim() || ''
          if (dialogueText) {
            dialogueLines.push({ character: currentCharacter, dialogue: dialogueText })
            contentParts.push(`${currentCharacter}: ${dialogueText}`)
          }
        } else if (element.type === 'parenthetical') {
          const parenthetical = element.content?.trim() || ''
          if (parenthetical) {
            contentParts.push(`(${parenthetical})`)
          }
        }
      }
    }
  }
  
  return {
    fullContent: contentParts.join('\n'),
    actionLines,
    dialogueLines
  }
}

/**
 * Parse AI response into structured storyboard data
 */
function parseStoryboards(
  aiResponse: string,
  breakdown: ScriptBreakdownData,
  episodeNumber: number,
  episodeTitle: string,
  userId: string,
  artStyle: StoryboardArtStyle
): StoryboardsData {
  try {
    console.log('📊 Parsing storyboard data...')
    console.log('   Raw response length:', aiResponse.length)
    console.log('   Raw response (first 200 chars):', aiResponse.substring(0, 200))
    
    // Use the robust storyboard-specific JSON parser from json-utils
    const { cleanAndParseStoryboardJSON } = require('@/lib/json-utils')
    
    let parsed
    try {
      parsed = cleanAndParseStoryboardJSON(aiResponse)
      console.log('✅ Successfully parsed storyboard JSON using robust parser')
    } catch (parseError: any) {
      console.error('❌ JSON parse error with robust parser:', parseError.message)
      
      // Last resort: try manual recovery for storyboards
      console.warn('⚠️ Attempting manual storyboard recovery...')
      
      let cleaned = aiResponse.trim()
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      // Fix common JSON issues
      cleaned = cleaned
        .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
        .replace(/,(\s*[}\]])/g, '$1')
      
      // Try to find the scenes array
      const scenesMatch = cleaned.match(/"scenes"\s*:\s*(\[[\s\S]*?\])/);
      if (scenesMatch) {
        try {
          const scenesArray = JSON.parse(scenesMatch[1]);
          parsed = { scenes: scenesArray };
          console.log('✅ Recovered storyboard by extracting scenes array');
        } catch (e) {
          throw new Error(`Failed to parse storyboards: ${parseError.message}`);
        }
      } else {
        throw new Error(`Failed to parse storyboards: ${parseError.message}`);
      }
    }

    if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
      throw new Error('Invalid AI response structure: expected scenes array')
    }

    // Helper to strip instructional phrasing so blurbs read as narrative
    const stripInstructional = (text: string): string => {
      if (!text) return ''
      return text
        .replace(/^shot\s*\d+\s*:\s*/i, '')
        .replace(/^frame\s*\d+\s*:\s*/i, '')
        .replace(/^we\s+see\s+/i, '')
        .replace(/^the\s+camera\s+(shows|sees|captures)\s+/i, '')
        .replace(/\b(camera|shot)\s+shows\s+/gi, '')
        .trim()
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
          // Use the description as-is, but ensure it's brief, shot-specific, and narrative
          let enhancedDescription = stripInstructional(shot.description || '')
          let enhancedNotes = stripInstructional(shot.visualNotes || '')
          
          // Clean up description - remove redundant scene location info if present
          if (enhancedDescription) {
            // Remove patterns like "Scene: [location]" or ".. Scene: [location]" at the end
            enhancedDescription = enhancedDescription.replace(/\s*\.\s*Scene:\s*[^.]*$/i, '').trim()
            enhancedDescription = enhancedDescription.replace(/\s*Scene:\s*[^.]*$/i, '').trim()
            // Remove trailing periods/dots
            enhancedDescription = enhancedDescription.replace(/\.+$/, '').trim()
          }
          
          // If no description, create a brief shot-specific summary
          if (!enhancedDescription) {
            // Get a brief summary of what's happening in the scene for context
            const sceneSummary = breakdownScene.linkedSceneContent 
              ? breakdownScene.linkedSceneContent.substring(0, 140).replace(/\n/g, ' ').trim()
              : breakdownScene.notes 
              ? breakdownScene.notes.substring(0, 140).replace(/\n/g, ' ').trim()
              : ''
            
            if (sceneSummary) {
              enhancedDescription = stripInstructional(sceneSummary)
            } else {
              enhancedDescription = `Shot ${shot.shotNumber}`
            }
          }
          
          // Use description for notes if notes are empty
          if (!enhancedNotes) {
            enhancedNotes = enhancedDescription
          } else {
            // Clean up notes similarly - remove redundant scene location
            enhancedNotes = enhancedNotes.replace(/\s*\.\s*Scene:\s*[^.]*$/i, '').trim()
            enhancedNotes = enhancedNotes.replace(/\s*Scene:\s*[^.]*$/i, '').trim()
            enhancedNotes = enhancedNotes.replace(/\.+$/, '').trim()
            enhancedNotes = stripInstructional(enhancedNotes)
          }
          
          // Ensure image prompt includes art style
          let imagePrompt = shot.imagePrompt || generateFallbackImagePrompt(shot, breakdownScene, artStyle)
          
          // Apply art style to prompt if not already included
          if (!imagePrompt.includes('consistent storyboard art style')) {
            imagePrompt = applyArtStyleToPrompt(imagePrompt, artStyle)
          }
          
          // Ensure all required fields have defaults to prevent undefined values
          const frame: StoryboardFrame = {
            id: `frame_${Date.now()}_${globalShotCounter}`,
            shotNumber: shot.shotNumber || String(globalShotCounter),
            sceneNumber: sceneNumber,
            frameImage: undefined, // Will be generated later by user
            imagePrompt: imagePrompt || '',
            scriptContext: (shot.scriptContext && String(shot.scriptContext).trim()) || undefined,
            cameraAngle: (shot.cameraAngle && String(shot.cameraAngle).trim()) || 'medium',
            cameraMovement: (shot.cameraMovement && String(shot.cameraMovement).trim()) || 'static',
            dialogueSnippet: (shot.dialogueSnippet && String(shot.dialogueSnippet).trim()) || '',
            lightingNotes: (shot.lightingNotes && String(shot.lightingNotes).trim()) || `Lighting based on ${breakdownScene.timeOfDay.toLowerCase()} setting`,
            propsInFrame: Array.isArray(shot.propsInFrame) ? shot.propsInFrame.filter((p: any) => p && String(p).trim()) : [],
            referenceImages: [],
            status: 'draft',
            notes: enhancedNotes || enhancedDescription || `Shot ${shot.shotNumber}`,
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
      updatedBy: userId,
      artStyle: artStyle // Store art style for consistency across regenerations
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
function generateFallbackImagePrompt(shot: ShotFrame, scene: any, artStyle: StoryboardArtStyle): string {
  const shotType = shot.cameraAngle || 'medium'
  const location = scene.location || 'interior'
  const timeOfDay = scene.timeOfDay || 'DAY'
  const description = shot.description || 'cinematic scene'
  
  // Include scene context if available
  const sceneContext = scene.linkedSceneContent 
    ? scene.linkedSceneContent.substring(0, 200).replace(/\n/g, ' ')
    : scene.notes 
    ? scene.notes.substring(0, 200).replace(/\n/g, ' ')
    : ''
  
  const contextPart = sceneContext ? `, scene context: ${sceneContext}` : ''
  
  const basePrompt = `Cinematic storyboard frame, ${shotType} shot, ${description}${contextPart}, ${location} setting, ${timeOfDay.toLowerCase()} lighting`
  
  // Apply art style to ensure consistency
  return applyArtStyleToPrompt(basePrompt, artStyle)
}
