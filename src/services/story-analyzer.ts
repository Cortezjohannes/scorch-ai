/**
 * Story Analyzer Service
 * Analyzes story bible to generate intelligent episode settings
 */

import { generateContent } from './azure-openai'

interface VibeSettings {
  tone: number // 0-100: Dark/Gritty <---> Light/Comedic
  pacing: number // 0-100: Slow Burn <---> High Octane
  dialogueStyle: number // 0-100: Sparse/Subtextual <---> Snappy/Expository
}

interface EpisodeSettings {
  vibeSettings: VibeSettings
  directorsNotes: string
  episodeGoal: string
}

/**
 * Analyze story bible and generate intelligent settings for episode generation
 */
export async function analyzeStoryForEpisodeGeneration(
  storyBible: any,
  episodeNumber: number,
  previousChoice?: string,
  previousEpisode?: any
): Promise<EpisodeSettings> {
  console.log(`🔍 Analyzing story for Episode ${episodeNumber}...`)
  
  // Build context from story bible - ROBUST handling of different data types
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  const genre = storyBible.genre || 'drama'
  
  // Handle worldBuilding as string or object
  let worldBuildingText = 'No world-building provided'
  if (storyBible.worldBuilding) {
    if (typeof storyBible.worldBuilding === 'string') {
      worldBuildingText = storyBible.worldBuilding.substring(0, 300)
    } else {
      worldBuildingText = JSON.stringify(storyBible.worldBuilding).substring(0, 300)
    }
  }
  
  // Build character context
  const charactersText = storyBible.mainCharacters?.map((char: any) => {
    let description = 'No description'
    if (char.description) {
      if (typeof char.description === 'string') {
        description = char.description
      } else {
        description = JSON.stringify(char.description)
      }
    }
    return `${char.name}: ${description}`
  }).join('\n') || 'No characters'
  
  // Build narrative arc context
  const arcsText = storyBible.narrativeArcs?.map((arc: any) => {
    let summary = 'No summary'
    if (arc.summary) {
      if (typeof arc.summary === 'string') {
        summary = arc.summary.substring(0, 200)
      } else {
        summary = JSON.stringify(arc.summary).substring(0, 200)
      }
    }
    return `${arc.title}: ${summary}`
  }).join('\n') || 'No narrative arcs'
  
  const premise = storyBible.premise?.premiseStatement || 'No premise'
  
  // Extract technical tabs for better vibe analysis
  let tensionContext = ''
  if (storyBible.tensionStrategy) {
    const tension = storyBible.tensionStrategy
    if (tension.rawContent) {
      tensionContext = tension.rawContent.substring(0, 200)
    } else if (tension.tensionCurve) {
      tensionContext = `Tension Curve: ${tension.tensionCurve}`
    }
  }
  
  let dialogueContext = ''
  if (storyBible.dialogueStrategy) {
    const dialogue = storyBible.dialogueStrategy
    if (dialogue.rawContent) {
      dialogueContext = dialogue.rawContent.substring(0, 200)
    } else if (dialogue.characterVoice) {
      dialogueContext = `Character Voice: ${dialogue.characterVoice}`
    }
  }
  
  let genreContext = ''
  if (storyBible.genreEnhancement) {
    const genreEnh = storyBible.genreEnhancement
    if (genreEnh.rawContent) {
      genreContext = genreEnh.rawContent.substring(0, 200)
    } else if (genreEnh.visualStyle) {
      genreContext = `Visual Style: ${genreEnh.visualStyle}`
    }
  }
  
  let themeContext = ''
  if (storyBible.themeIntegration) {
    const theme = storyBible.themeIntegration
    if (theme.rawContent) {
      themeContext = theme.rawContent.substring(0, 200)
    } else if (theme.characterIntegration) {
      themeContext = `Theme Integration: ${theme.characterIntegration}`
    }
  }
  
  // Build previous episode context
  let previousEpisodeContext = ''
  if (previousEpisode) {
    const prevEpTitle = previousEpisode.title || previousEpisode.episodeTitle || `Episode ${episodeNumber - 1}`
    const prevEpSynopsis = previousEpisode.synopsis || ''
    const prevEpScenes = previousEpisode.scenes || []
    
    previousEpisodeContext = `\n\n📺 PREVIOUS EPISODE (Episode ${episodeNumber - 1}): "${prevEpTitle}"`
    
    if (prevEpSynopsis) {
      previousEpisodeContext += `\nSynopsis: ${prevEpSynopsis}`
    }
    
    if (prevEpScenes.length > 0) {
      previousEpisodeContext += `\n\nPrevious Episode Summary:`
      prevEpScenes.forEach((scene: any, index: number) => {
        const sceneTitle = scene.title || `Scene ${scene.sceneNumber || index + 1}`
        const sceneContent = scene.content || scene.screenplay || scene.sceneContent || ''
        // Include first 200 chars of each scene for context
        const contentPreview = sceneContent.substring(0, 200) + (sceneContent.length > 200 ? '...' : '')
        previousEpisodeContext += `\n\n${sceneTitle}:\n${contentPreview}`
      })
    }
  }
  
  // Build analysis prompt
  const analysisPrompt = `Analyze this story and suggest intelligent settings for Episode ${episodeNumber}:

SERIES: ${seriesTitle}
GENRE: ${genre}

PREMISE:
${premise}

🌍 WORLD/SETTING:
${worldBuildingText}

👥 CHARACTERS:
${charactersText}

📖 NARRATIVE ARCS:
${arcsText}${previousEpisodeContext}

${tensionContext ? `\n⚡ TENSION STRATEGY:\n${tensionContext}\n` : ''}
${dialogueContext ? `\n💬 DIALOGUE STYLE:\n${dialogueContext}\n` : ''}
${genreContext ? `\n🎭 GENRE STYLE:\n${genreContext}\n` : ''}
${themeContext ? `\n🎯 THEME:\n${themeContext}\n` : ''}

${previousChoice ? `\n🔀 PREVIOUS CHOICE:\n${previousChoice}\n\nCRITICAL: When a previous choice exists, the Episode Goal must:\n- Follow naturally from where the previous episode ended (reference specific events from the previous episode above)\n- Show the immediate aftermath and consequences of the previous episode's ending\n- Build up GRADUALLY to the chosen option - do NOT jump directly to the choice's consequences\n- Create narrative beats that lead toward the chosen option's narrative moment\n- End on a specific emotional note (high/low, good/bad) that reflects the choice's impact\n- Ensure the episode feels like a natural progression, not a sudden jump\n` : ''}

Based on this story (including tension strategy, dialogue style, genre conventions, and theme), provide intelligent creative settings for Episode ${episodeNumber}:

1. **Tone** (0-100): Where 0 is dark/gritty and 100 is light/comedic
2. **Pacing** (0-100): Where 0 is slow burn and 100 is high octane
3. **Dialogue Style** (0-100): Where 0 is sparse/subtextual and 100 is snappy/expository
4. **Director's Notes**: Specific creative guidance (atmosphere, focus areas, key moments)
5. **Episode Goal**: What should happen in this episode (1-2 sentences)${previousChoice ? '\n   When a previous choice exists, the goal should describe building up to that choice gradually, not jumping to its consequences.' : ''}

Consider:
- The genre and its conventions (use GENRE STYLE guidance above)
- The overall tone of the series
- Character development needs
- Story progression for Episode ${episodeNumber}
- Natural pacing for this point in the story (use TENSION STRATEGY)
- Dialogue style preferences (use DIALOGUE STYLE guidance)
- Thematic elements to emphasize (use THEME guidance)${previousChoice ? '\n- How to naturally transition from the previous episode\'s ending\n- How to gradually build tension/conflict/development leading toward the chosen option\n- What emotional note the episode should end on (high/low, good/bad)' : ''}

Return ONLY valid JSON in this exact format:
{
  "tone": <number 0-100>,
  "pacing": <number 0-100>,
  "dialogueStyle": <number 0-100>,
  "directorsNotes": "<string>",
  "episodeGoal": "<string>"
}`

  console.log('🤖 Sending story analysis request to AI...')
  
  const result = await generateContent(analysisPrompt, {
    systemPrompt: 'You are an expert story analyst and creative director. Analyze stories and provide intelligent creative settings for episode generation.',
    temperature: 0.7,
    maxTokens: 1000
  })
  
  // Parse result
  let parsed: any
  try {
    parsed = JSON.parse(result)
  } catch (error) {
    // Try to extract JSON from markdown code block
    const jsonMatch = result.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[1])
    } else {
      throw new Error('Failed to parse analysis result as JSON')
    }
  }
  
  // Validate and return settings
  const settings: EpisodeSettings = {
    vibeSettings: {
      tone: Math.max(0, Math.min(100, parsed.tone || 50)),
      pacing: Math.max(0, Math.min(100, parsed.pacing || 50)),
      dialogueStyle: Math.max(0, Math.min(100, parsed.dialogueStyle || 50))
    },
    directorsNotes: parsed.directorsNotes || 'Focus on character development and story progression.',
    episodeGoal: parsed.episodeGoal || `Continue the story for Episode ${episodeNumber}.`
  }
  
  console.log('✅ Story analysis complete')
  console.log(`   Tone: ${settings.vibeSettings.tone}/100`)
  console.log(`   Pacing: ${settings.vibeSettings.pacing}/100`)
  console.log(`   Dialogue: ${settings.vibeSettings.dialogueStyle}/100`)
  
  return settings
}
