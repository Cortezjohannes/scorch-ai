import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/services/azure-openai'
import { logger } from '@/services/console-logger'

// 🎯 STAGE 1: Beat Sheet Generation from Episode Goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storyBible, episodeNumber, episodeGoal, previousChoice } = body
    
    if (!storyBible || !episodeNumber || !episodeGoal) {
      return NextResponse.json(
        { error: 'Story bible, episode number, and episode goal are required' },
        { status: 400 }
      )
    }

    logger.startNewSession(`Beat Sheet Generation - Episode ${episodeNumber}`)
    logger.milestone(`Episode Goal: ${episodeGoal}`)
    
    // Build comprehensive context for beat sheet generation
    const beatSheetPrompt = buildBeatSheetPrompt(storyBible, episodeNumber, episodeGoal, previousChoice)
    
    const systemPrompt = `You are a master story architect specializing in episode structure and narrative beats. You create detailed, flexible beat sheets that serve as the structural foundation for cinematic episodes.

Your beat sheets are:
- FLEXIBLE: Support 3-6 scenes based on narrative needs (no rigid 3-scene constraint)
- CINEMATIC: Focus on visual storytelling and dramatic moments
- CHARACTER-DRIVEN: Center on character development and relationships
- COHERENT: Maintain continuity with series and previous episodes
- ENGAGING: Include compelling hooks, conflicts, and resolutions

Return ONLY the beat sheet content - no JSON, no explanations, just the structured beats.`

    console.log('🎯 Generating beat sheet for episode goal:', episodeGoal)
    
    const result = await generateContent(beatSheetPrompt, {
      model: 'gpt-4.1',
      systemPrompt,
      temperature: 0.85, // High creativity for structure
      maxTokens: 2000
    })
    
    // Validate and enhance the result
    let finalBeatSheet = result
    if (!result || result.length < 50) {
      // Generate fallback beat sheet if the result is too short
      finalBeatSheet = generateFallbackBeatSheet(episodeGoal, episodeNumber, storyBible)
      console.warn('Generated fallback beat sheet due to short AI response')
    }
    
    logger.milestone('Beat sheet generation complete')
    
    return NextResponse.json({
      success: true,
      beatSheet: finalBeatSheet,
      episodeNumber,
      episodeGoal,
      fallbackUsed: finalBeatSheet !== result
    })
    
  } catch (error) {
    console.error('❌ Beat sheet generation error:', error)
    logger.error('Beat Sheet Generation', 'Beat Sheet Engine', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json(
      { 
        error: 'Beat sheet generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function buildBeatSheetPrompt(
  storyBible: any, 
  episodeNumber: number, 
  episodeGoal: string, 
  previousChoice?: string
): string {
  // Extract key story elements
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  const genre = storyBible.genre || 'Drama'
  const tone = storyBible.tone || 'Balanced'
  const premise = storyBible.premise?.premiseStatement || 'A story unfolds...'
  
  // Build character context (no truncation)
  const characters = (storyBible.mainCharacters || [])
    .map((char: any) => `
• ${char.name || 'Character'} (${char.archetype || 'Role'}):
  - Background: ${char.background || char.description || 'To be developed'}
  - Motivation: ${char.motivation || 'Internal drive to be explored'}
  - Arc: ${char.arc || 'Character journey in progress'}
  - Relationships: ${char.relationships || 'Connections to be defined'}
    `)
    .join('\n')

  // Build world context
  const worldBuilding = storyBible.worldBuilding ? `
WORLD CONTEXT:
- Setting: ${storyBible.worldBuilding.setting || 'Contemporary setting'}
- Atmosphere: ${storyBible.worldBuilding.atmosphere || 'Realistic tone'}
- Key Locations: ${(storyBible.worldBuilding.locations || []).map((loc: any) => 
    `${loc.name}: ${loc.description}`).join(', ') || 'Various locations'}
- Cultural Context: ${storyBible.worldBuilding.culturalContext || 'Modern society'}
  ` : ''

  // Find relevant narrative arc
  const narrativeArcInfo = (storyBible.narrativeArcs || [])
    .filter((arc: any) => {
      const episodes = arc.episodes || []
      return episodes.some((ep: any) => ep.number === episodeNumber)
    })
    .map((arc: any) => {
      const episode = (arc.episodes || []).find((ep: any) => ep.number === episodeNumber)
      return `
ARC CONTEXT:
- Arc Title: ${arc.title || `Arc ${Math.ceil(episodeNumber / 10)}`}
- Arc Theme: ${arc.theme || arc.summary || 'Continuing journey'}
- Episode Position: ${episode?.title || `Episode ${episodeNumber}`}
- Arc Summary: ${arc.summary || 'Story progression continues...'}
      `
    })[0] || ''

  // Previous episode context if available
  const previousContext = previousChoice ? `
PREVIOUS EPISODE CONTEXT:
- User's Previous Choice: "${previousChoice}"
- This choice creates ripple effects and consequences that should influence the current episode
  ` : ''

  return `Create a detailed beat sheet for Episode ${episodeNumber} of "${seriesTitle}".

SERIES CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Series: ${seriesTitle}
Genre: ${genre} | Tone: ${tone}
Premise: ${premise}

CHARACTERS:${characters}

${worldBuilding}

${narrativeArcInfo}

${previousContext}

EPISODE GOAL:
"${episodeGoal}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEAT SHEET REQUIREMENTS:
• Create 3-6 scenes based on what the story needs (no rigid constraints)
• Each beat should advance the episode goal while developing characters
• Include specific dramatic moments, conflicts, and character interactions
• Ensure each scene has clear purpose and emotional stakes
• Design scenes for approximately 5-minute total runtime
• Include compelling opening hook and cliffhanger ending
• Maintain series continuity and character consistency
• Consider the genre and tone in scene construction

BEAT SHEET FORMAT:
══════════════════════════════════════════════════════════════
EPISODE ${episodeNumber}: [Episode Title]
══════════════════════════════════════════════════════════════

OPENING HOOK (30-60 seconds):
[Compelling opening that immediately engages audience]

BEAT 1: [Scene Title] (Location - Time)
PURPOSE: [What this scene accomplishes]
CONFLICT: [Central tension or obstacle]
CHARACTER FOCUS: [Which characters drive this scene]
KEY MOMENTS:
• [Specific dramatic beat]
• [Character development moment]
• [Plot advancement]
TRANSITION: [How it leads to next scene]

BEAT 2: [Scene Title] (Location - Time)
[Same detailed structure]

[Continue for 3-6 beats as needed]

CLIFFHANGER/RESOLUTION (30-60 seconds):
[Compelling ending that resolves episode goal while setting up future episodes]

EPISODE THEME: [What deeper meaning or character growth occurs]
CHARACTER ARCS: [How characters change or develop]
SERIES IMPACT: [How this episode affects the larger story]
══════════════════════════════════════════════════════════════

Create a beat sheet that transforms the episode goal into compelling, cinematic storytelling that advances both character and plot while maintaining the series' unique voice and vision.`
}

// Fallback beat sheet generator for when AI fails
function generateFallbackBeatSheet(episodeGoal: string, episodeNumber: number, storyBible: any): string {
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  const mainCharacter = storyBible.mainCharacters?.[0]?.name || 'Protagonist'
  
  return `══════════════════════════════════════════════════════════════
EPISODE ${episodeNumber}: ${episodeGoal}
══════════════════════════════════════════════════════════════

OPENING HOOK (30-60 seconds):
${mainCharacter} faces an immediate challenge that connects to the episode goal: "${episodeGoal}"

BEAT 1: Establishing the Situation (Location - Present)
PURPOSE: Set up the central conflict and character motivations
CONFLICT: ${mainCharacter} must confront the main challenge
CHARACTER FOCUS: ${mainCharacter} and supporting characters
KEY MOMENTS:
• Introduction of the episode's central problem
• Character reactions and initial decisions
• Stakes are established
TRANSITION: Conflict escalates, forcing action

BEAT 2: Rising Action and Development (Location - Present)  
PURPOSE: Develop the conflict and character relationships
CONFLICT: Obstacles increase, tensions rise
CHARACTER FOCUS: Character interactions and growth
KEY MOMENTS:
• Characters work toward resolving the episode goal
• Relationships are tested or strengthened
• New complications arise
TRANSITION: Builds toward climactic moment

BEAT 3: Resolution and Forward Movement (Location - Present)
PURPOSE: Address the episode goal and set up future episodes
CONFLICT: Final confrontation or decision point
CHARACTER FOCUS: Character growth and change
KEY MOMENTS:
• Episode goal is addressed (success/failure/complication)
• Character development is solidified
• Series progression is advanced
TRANSITION: Sets up next episode

CLIFFHANGER/RESOLUTION (30-60 seconds):
The resolution of "${episodeGoal}" leads to new questions and challenges for future episodes

EPISODE THEME: Growth, challenge, and progression
CHARACTER ARCS: ${mainCharacter} develops through facing the episode challenge
SERIES IMPACT: This episode advances the overall narrative of ${seriesTitle}
══════════════════════════════════════════════════════════════`
}
