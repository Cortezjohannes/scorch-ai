/**
 * Episode Generation Orchestrator
 * 
 * Smart wrapper that accepts simple inputs and orchestrates the complete
 * episode generation workflow with intelligent defaults.
 * 
 * This provides backward compatibility for the old /api/generate/episode
 * while using the new Director's Chair workflow internally.
 */

import { analyzeStoryForEpisodeGeneration, EpisodeGenerationSettings } from './story-analyzer'
import { generateContent } from './azure-openai'
import { logger } from './console-logger'

export interface OrchestratorRequest {
  storyBible: any
  episodeNumber: number
  previousChoice?: string
  userChoices?: any[]
  mode?: string // legacy parameter, for compatibility
}

export interface OrchestratorResult {
  success: boolean
  episode: any
  metadata?: {
    usedIntelligentDefaults: boolean
    analyzedSettings: EpisodeGenerationSettings
    generationPath: 'orchestrator'
    timestamp: string
  }
  error?: string
}

/**
 * Main orchestration function: generates episode with intelligent defaults
 */
export async function generateEpisodeWithIntelligentDefaults(
  request: OrchestratorRequest
): Promise<OrchestratorResult> {
  const { storyBible, episodeNumber, previousChoice, userChoices } = request
  
  try {
    logger.startNewSession(`Orchestrated Episode ${episodeNumber} Generation`)
    logger.milestone('Using intelligent defaults workflow')
    
    // STEP 1: Analyze story and get intelligent settings
    console.log(`🎭 Orchestrator: Analyzing story for episode ${episodeNumber}...`)
    const analyzedSettings = await analyzeStoryForEpisodeGeneration(
      storyBible,
      episodeNumber,
      previousChoice
    )
    
    logger.milestone(`Intelligent settings: Tone ${analyzedSettings.vibeSettings.tone}, Pacing ${analyzedSettings.vibeSettings.pacing}`)
    
    // STEP 2: Generate beat sheet with analyzed goal
    console.log(`📋 Orchestrator: Generating beat sheet...`)
    const beatSheet = await generateBeatSheet(
      storyBible,
      episodeNumber,
      analyzedSettings.episodeGoal,
      previousChoice
    )
    
    logger.milestone(`Beat sheet generated (${beatSheet.length} chars)`)
    
    // STEP 3: Generate episode using the Director's Chair workflow
    console.log(`🎬 Orchestrator: Generating episode with intelligent settings...`)
    const episode = await generateEpisodeFromBeats(
      storyBible,
      episodeNumber,
      beatSheet,
      analyzedSettings.vibeSettings,
      analyzedSettings.directorsNotes,
      previousChoice
    )
    
    logger.milestone('Episode generation complete via orchestrator')
    
    return {
      success: true,
      episode,
      metadata: {
        usedIntelligentDefaults: true,
        analyzedSettings,
        generationPath: 'orchestrator',
        timestamp: new Date().toISOString()
      }
    }
    
  } catch (error) {
    console.error('❌ Orchestrator error:', error)
    logger.error('Episode Orchestrator', 'Generation', error instanceof Error ? error.message : 'Unknown error')
    
    return {
      success: false,
      episode: null,
      error: error instanceof Error ? error.message : 'Episode generation failed'
    }
  }
}

/**
 * Internal: Generate beat sheet
 */
async function generateBeatSheet(
  storyBible: any,
  episodeNumber: number,
  episodeGoal: string,
  previousChoice?: string
): Promise<string> {
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  const genre = storyBible.genre || 'Drama'
  const premise = storyBible.premise?.premiseStatement || storyBible.premise || 'A story unfolds...'
  
  // Get current arc info
  let currentArcInfo = ''
  if (storyBible.narrativeArcs && storyBible.narrativeArcs.length > 0) {
    let episodeCount = 0
    for (const arc of storyBible.narrativeArcs) {
      const arcEpisodeCount = arc.episodes?.length || 10
      if (episodeNumber <= episodeCount + arcEpisodeCount) {
        currentArcInfo = `\nCurrent Arc: ${arc.title}\n${arc.summary}`
        break
      }
      episodeCount += arcEpisodeCount
    }
  }
  
  const previousContext = previousChoice 
    ? `\n\nPREVIOUS CHOICE: "${previousChoice}"\nThis episode should continue from this choice.`
    : ''
  
  const prompt = `Create a detailed beat sheet for Episode ${episodeNumber} of "${seriesTitle}".

SERIES CONTEXT:
Genre: ${genre}
Premise: ${premise}${currentArcInfo}${previousContext}

EPISODE GOAL:
${episodeGoal}

CREATE A BEAT SHEET:
Break the episode into 3-6 narrative beats (story moments). Each beat should:
- Advance the plot or develop characters
- Have a clear purpose
- Connect naturally to the next beat
- Include specific actions, not vague descriptions

Format each beat clearly (e.g., "Beat 1:", "Beat 2:", etc.)`

  const systemPrompt = `You are a master story architect specializing in episode structure and narrative beats. You create detailed, flexible beat sheets that serve as the structural foundation for cinematic episodes.

Return ONLY the beat sheet content - no JSON, no explanations, just the structured beats.`

  const result = await generateContent(prompt, {
    model: 'gpt-4.1',
    systemPrompt,
    temperature: 0.85,
    maxTokens: 2000
  })
  
  return result
}

/**
 * Internal: Generate episode from beats
 * This replicates the core logic from /api/generate/episode-from-beats/route.ts
 */
async function generateEpisodeFromBeats(
  storyBible: any,
  episodeNumber: number,
  beatSheet: string,
  vibeSettings: any,
  directorsNotes: string,
  previousChoice?: string
): Promise<any> {
  
  const scriptPrompt = buildScriptPrompt(
    storyBible,
    episodeNumber,
    beatSheet,
    vibeSettings,
    directorsNotes,
    previousChoice
  )
  
  const systemPrompt = `You are a master storyteller with expertise in creating engaging narrative prose episodes. You excel at:

🎬 NARRATIVE ARCHITECTURE:
- Create multi-layered conflicts (internal vs external, character vs world, ideal vs reality)
- Ensure character consistency using full story context
- Build tension naturally through escalating stakes and challenges
- Structure scenes for maximum emotional impact and pacing
- Connect episodes through callbacks and character development arcs

✍️ PROSE & DIALOGUE:
- Write rich narrative prose that reads like a great novel (NOT screenplay format)
- Create authentic dialogue with subtext that reveals character psychology
- Show character emotions through action, thought, and sensory details
- Develop distinct voices for each character
- Weave dialogue naturally into narrative flow

🌍 WORLD & ATMOSPHERE:
- Create immersive sensory details that make the world feel alive
- Build atmosphere through environment, weather, lighting, sounds
- Use setting to reflect character emotional states
- Make the world reactive to character actions
- Integrate theme through environmental storytelling

🎭 GENRE & ENGAGEMENT:
- Apply genre conventions authentically while innovating
- Balance formula with surprise
- Create moments that resonate emotionally
- Build toward meaningful character choices
- Maintain series continuity and consequences

🎨 VIBE EXECUTION:
- Perfectly match the requested tone (dark/light spectrum)
- Execute pacing according to vibe settings (slow burn/fast)
- Style dialogue as requested (sparse/expository)
- Incorporate director's specific creative vision

📖 NARRATIVE PROSE FORMAT:
- Write like a novelist, not a screenwriter
- Third-person with rich interiority
- Natural dialogue woven into prose
- Vivid sensory descriptions
- Chapter-like scenes that flow naturally

You create episodes that are enjoyable to READ and REVIEW, making the narrative prose engaging before it becomes a script.`

  const result = await generateContent(scriptPrompt, {
    model: 'gpt-4.1',
    systemPrompt,
    temperature: 0.9, // Maximum creativity for final script
    maxTokens: 8000
  })
  
  // Parse the result
  let parsedEpisode
  try {
    parsedEpisode = JSON.parse(result)
  } catch (parseError) {
    // Try to extract JSON from markdown blocks
    const jsonMatch = result.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (jsonMatch && jsonMatch[1]) {
      parsedEpisode = JSON.parse(jsonMatch[1])
    } else {
      // Fallback structure
      parsedEpisode = {
        episodeNumber,
        title: `Episode ${episodeNumber}`,
        synopsis: beatSheet.substring(0, 200) + '...',
        scenes: [
          {
            sceneNumber: 1,
            title: "Episode Scene",
            content: "The episode unfolds according to the beat sheet and creative direction."
          }
        ],
        branchingOptions: [
          { id: 1, text: "Continue the story", isCanonical: true },
          { id: 2, text: "Explore alternative path", isCanonical: false },
          { id: 3, text: "Focus on character development", isCanonical: false }
        ],
        episodeRundown: `Episode generated with intelligent defaults.`
      }
    }
  }
  
  // Ensure required fields
  if (!parsedEpisode.episodeNumber) parsedEpisode.episodeNumber = episodeNumber
  if (!parsedEpisode.title) parsedEpisode.title = `Episode ${episodeNumber}`
  if (!parsedEpisode.scenes || !Array.isArray(parsedEpisode.scenes)) {
    parsedEpisode.scenes = [{
      sceneNumber: 1,
      title: "Episode Scene",
      content: "Episode content"
    }]
  }
  if (!parsedEpisode.branchingOptions || !Array.isArray(parsedEpisode.branchingOptions)) {
    parsedEpisode.branchingOptions = [
      { id: 1, text: "Continue the story", isCanonical: true },
      { id: 2, text: "Explore character depth", isCanonical: false },
      { id: 3, text: "Take different approach", isCanonical: false }
    ]
  }
  
  return parsedEpisode
}

/**
 * Build the comprehensive script prompt (adapted from episode-from-beats route)
 */
function buildScriptPrompt(
  storyBible: any,
  episodeNumber: number,
  beatSheet: string,
  vibeSettings: any,
  directorsNotes: string,
  previousChoice?: string
): string {
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  const genre = storyBible.genre || 'Drama'
  const premise = storyBible.premise?.premiseStatement || 'A story unfolds...'
  
  // Build character context
  const characters = (storyBible.mainCharacters || [])
    .map((char: any) => {
      const is3D = char.physiology && char.sociology && char.psychology
      if (is3D) {
        return `\n${char.name} (${char.premiseFunction || 'Character'})\n  WANT: ${char.psychology.want}\n  NEED: ${char.psychology.need}\n  FLAW: ${char.psychology.primaryFlaw}`
      } else {
        return `\n${char.name} (${char.archetype || 'Role'}): ${char.description || char.background || 'Character in story'}`
      }
    })
    .join('\n')

  // Vibe direction
  const vibeDirection = `
VIBE SETTINGS:
- Tone: ${vibeSettings.tone}/100 (${getToneLabel(vibeSettings.tone)})
- Pacing: ${vibeSettings.pacing}/100 (${getPacingLabel(vibeSettings.pacing)})
- Dialogue: ${vibeSettings.dialogueStyle}/100 (${getDialogueLabel(vibeSettings.dialogueStyle)})`

  const directorVision = directorsNotes ? `\n\nDIRECTOR'S NOTES:\n${directorsNotes}` : ''
  const previousContext = previousChoice ? `\n\nPREVIOUS CHOICE: "${previousChoice}"` : ''

  return `Create Episode ${episodeNumber} of "${seriesTitle}" based on the provided beat sheet and creative direction.

SERIES: ${seriesTitle}
GENRE: ${genre}
PREMISE: ${premise}

CHARACTERS:${characters}
${vibeDirection}${directorVision}${previousContext}

BEAT SHEET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${beatSheet}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 CRITICAL: This is a 5-MINUTE SHORT-FORM EPISODE (NOT a full TV episode!)

Transform the beat sheet into a complete, cinematic episode with 2-3 SUBSTANTIAL SCENES:
- 5-minute runtime = 2-3 scenes MAXIMUM (each scene 2-2.5 minutes)
- Fewer, deeper scenes are MUCH better than many shallow ones
- Each scene must be rich, immersive, and fully developed
- Combine multiple beats into single powerful scenes if needed

Apply ALL vibe settings precisely. Create compelling branching choices that emerge from the story.

RETURN ONLY valid JSON:
{
  "episodeNumber": ${episodeNumber},
  "title": "Episode Title",
  "synopsis": "Brief episode summary",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene title",
      "content": "Rich narrative prose with vivid descriptions and natural dialogue"
    }
  ],
  "branchingOptions": [
    {"id": 1, "text": "Choice text", "isCanonical": true},
    {"id": 2, "text": "Choice text", "isCanonical": false},
    {"id": 3, "text": "Choice text", "isCanonical": false}
  ],
  "episodeRundown": "Comprehensive analysis of episode significance"
}`
}

// Helper functions
function getToneLabel(value: number): string {
  if (value < 20) return 'Very Dark/Gritty'
  if (value < 40) return 'Dark-Leaning'
  if (value < 60) return 'Balanced'
  if (value < 80) return 'Light-Leaning'
  return 'Light/Comedic'
}

function getPacingLabel(value: number): string {
  if (value < 20) return 'Slow Burn'
  if (value < 40) return 'Deliberate'
  if (value < 60) return 'Steady'
  if (value < 80) return 'Energetic'
  return 'High Octane'
}

function getDialogueLabel(value: number): string {
  if (value < 20) return 'Sparse/Subtextual'
  if (value < 40) return 'Thoughtful'
  if (value < 60) return 'Natural'
  if (value < 80) return 'Articulate'
  return 'Snappy/Expository'
}











