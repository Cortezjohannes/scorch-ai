import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/services/azure-openai'
import { logger } from '@/services/console-logger'

interface VibeSettings {
  tone: number // 0-100: Dark/Gritty <---> Light/Comedic
  pacing: number // 0-100: Slow Burn <---> High Octane
  dialogueStyle: number // 0-100: Sparse/Subtextual <---> Snappy/Expository
}

// 🎯 STAGE 2: Script Generation from Beat Sheet + Vibe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      storyBible, 
      episodeNumber, 
      beatSheet, 
      vibeSettings, 
      directorsNotes, 
      previousChoice,
      editedScenes 
    } = body
    
    if (!storyBible || !episodeNumber || !beatSheet) {
      return NextResponse.json(
        { error: 'Story bible, episode number, and beat sheet are required' },
        { status: 400 }
      )
    }

    logger.startNewSession(`Script Generation from Beats - Episode ${episodeNumber}`)
    logger.milestone(`Beat Sheet Length: ${beatSheet.length} characters`)
    if (directorsNotes) {
      logger.milestone(`Director's Notes: ${directorsNotes.substring(0, 100)}...`)
    }
    
    // Build comprehensive script generation prompt
    const scriptPrompt = buildScriptPrompt(
      storyBible, 
      episodeNumber, 
      beatSheet, 
      vibeSettings, 
      directorsNotes, 
      previousChoice,
      editedScenes
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

    console.log('🎬 Generating script from beat sheet with vibe settings:', vibeSettings)
    
    const result = await generateContent(scriptPrompt, {
      model: 'gpt-4.1',
      systemPrompt,
      temperature: 0.9, // Maximum creativity for final script
      maxTokens: 8000 // Large token count for detailed episodes
    })
    
    // Parse the generated episode with robust fallback handling
    let parsedEpisode
    try {
      // First try: Direct JSON parsing
      parsedEpisode = JSON.parse(result)
    } catch (directParseError) {
      try {
        // Second try: Extract JSON from markdown code blocks
        const jsonMatch = result.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
        if (jsonMatch && jsonMatch[1]) {
          parsedEpisode = JSON.parse(jsonMatch[1])
        } else {
          // Third try: Find any JSON-like structure
          const anyJsonMatch = result.match(/\{[\s\S]*\}/)
          if (anyJsonMatch) {
            parsedEpisode = JSON.parse(anyJsonMatch[0])
          } else {
            throw new Error('No JSON found in response')
          }
        }
      } catch (parseError) {
        console.error('Failed to parse episode JSON:', parseError)
        console.log('Raw AI response:', result.substring(0, 500) + '...')
        
        // Enhanced fallback structure based on beat sheet
        const beatLines = beatSheet.split('\n').filter((line: string) => line.trim().length > 0)
        const fallbackContent = beatLines.length > 0 ? 
          beatLines.slice(0, 3).join('\n\n') : 
          'The episode unfolds according to the beat sheet structure.'
        
        parsedEpisode = {
          episodeNumber,
          title: `Episode ${episodeNumber}`,
          synopsis: beatSheet.length > 200 ? beatSheet.substring(0, 200) + '...' : beatSheet,
          scenes: [
            {
              sceneNumber: 1,
              title: "Episode Scene",
              content: fallbackContent + '\n\n[Episode continues based on beat sheet and creative direction...]'
            }
          ],
          branchingOptions: [
            { id: 1, text: "Continue the story", isCanonical: true },
            { id: 2, text: "Explore alternative path", isCanonical: false },
            { id: 3, text: "Focus on character development", isCanonical: false }
          ],
          episodeRundown: `Episode generated from beat sheet with custom vibe settings. Director's notes: ${directorsNotes ? directorsNotes.substring(0, 100) + '...' : 'Applied creative direction'}`
        }
      }
    }
    
    // Ensure required fields
    if (!parsedEpisode.episodeNumber) {
      parsedEpisode.episodeNumber = episodeNumber
    }
    if (!parsedEpisode.title) {
      parsedEpisode.title = `Episode ${episodeNumber}`
    }
    if (!parsedEpisode.scenes || !Array.isArray(parsedEpisode.scenes)) {
      parsedEpisode.scenes = [
        {
          sceneNumber: 1,
          title: "Episode Scene",
          content: "The episode unfolds based on the beat sheet and creative direction."
        }
      ]
    }
    if (!parsedEpisode.branchingOptions || !Array.isArray(parsedEpisode.branchingOptions)) {
      parsedEpisode.branchingOptions = [
        { id: 1, text: "Continue the story", isCanonical: true },
        { id: 2, text: "Explore character depth", isCanonical: false },
        { id: 3, text: "Take different approach", isCanonical: false }
      ]
    }
    
    logger.milestone('Script generation complete')
    
    return NextResponse.json({
      success: true,
      episode: parsedEpisode,
      beatSheet,
      vibeSettings,
      directorsNotes
    })
    
  } catch (error) {
    console.error('❌ Script generation error:', error)
    logger.error('Episode Generation', 'Script Engine', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json(
      { 
        error: 'Script generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function buildScriptPrompt(
  storyBible: any,
  episodeNumber: number,
  beatSheet: string,
  vibeSettings: VibeSettings,
  directorsNotes: string,
  previousChoice?: string,
  editedScenes?: any
): string {
  
  // Extract key story elements
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  const genre = storyBible.genre || 'Drama'
  const premise = storyBible.premise?.premiseStatement || 'A story unfolds...'
  
  // Build COMPREHENSIVE character context using FULL 3D profiles
  const characters = (storyBible.mainCharacters || [])
    .map((char: any) => {
      // Check if this is a 3D character (has physiology, sociology, psychology)
      const is3D = char.physiology && char.sociology && char.psychology
      
      if (is3D) {
        // USE FULL 3D CHARACTER DATA
        return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${char.name} (${char.premiseFunction || char.archetype || 'Character'})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏃 PHYSIOLOGY (How they appear):
  Age: ${char.physiology.age}
  Gender: ${char.physiology.gender}
  Appearance: ${char.physiology.appearance}
  Physical Traits: ${char.physiology.physicalTraits?.join(', ') || 'Standard build'}

🏛️ SOCIOLOGY (Their place in society):
  Class: ${char.sociology.class}
  Occupation: ${char.sociology.occupation}
  Education: ${char.sociology.education}
  Economic Status: ${char.sociology.economicStatus}

🧠 PSYCHOLOGY (Their inner world - CRITICAL FOR SCENES):
  Core Value: ${char.psychology.coreValue}
  WANT (External Goal): ${char.psychology.want}
  NEED (Internal Lesson): ${char.psychology.need}
  PRIMARY FLAW: ${char.psychology.primaryFlaw}
  Temperament: ${char.psychology.temperament?.join(', ') || 'Balanced'}
  Moral Standpoint: ${char.psychology.moralStandpoint}
  Top Fear: ${char.psychology.fears?.[0] || 'Unknown'}
  Strengths: ${char.psychology.strengths?.join(', ') || 'Resilient'}

📖 BACKSTORY: ${char.backstory || 'Backstory in development'}

🎭 CHARACTER ARC: ${char.arc || 'Character growth journey'}

🗣️ VOICE PROFILE:
  Speech Pattern: ${char.voiceProfile?.speechPattern || 'Natural dialogue'}
  Vocabulary: ${char.voiceProfile?.vocabulary || 'Standard'}
  Quirks: ${char.voiceProfile?.quirks?.join(', ') || 'None specified'}

💡 WRITING GUIDANCE:
  - Show their WANT in actions (what they pursue)
  - Hide their NEED in subtext (what they actually need to learn)
  - Let their FLAW create obstacles until growth occurs
  - Use their voice profile for authentic dialogue
  - Reference their backstory when relevant
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
      } else {
        // Fallback for legacy characters
        return `
━━━ ${char.name || 'Character'} (${char.archetype || 'Role'}) ━━━
Background: ${char.background || char.description || 'Character development in progress'}
Motivation: ${char.motivation || 'Internal drive to be explored'}
Personality: ${char.personality || 'Unique traits to be shown through action'}
Speech Patterns: ${char.voice || char.speechPatterns || 'Authentic voice to be developed'}
Relationships: ${char.relationships || 'Connections to other characters'}
Character Arc: ${char.arc || 'Growth journey throughout series'}
    `
      }
    })
    .join('\n')

  // Build world context
  const worldContext = storyBible.worldBuilding ? `
WORLD & ATMOSPHERE:
Setting: ${storyBible.worldBuilding.setting || 'Contemporary setting'}
Atmosphere: ${storyBible.worldBuilding.atmosphere || 'Realistic and grounded'}
Key Locations: ${(storyBible.worldBuilding.locations || []).map((loc: any) => 
    `${loc.name}: ${loc.description} [${loc.atmosphere || 'Standard atmosphere'}]`).join(' | ') || 'Various locations'}
Cultural Context: ${storyBible.worldBuilding.culturalContext || 'Modern society'}
Visual Style: ${storyBible.worldBuilding.visualStyle || 'Cinematic realism'}
  ` : ''

  // Convert vibe settings to creative direction
  const vibeDirection = `
VIBE & CREATIVE DIRECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TONE (${vibeSettings.tone}/100): ${getDetailedToneDirection(vibeSettings.tone)}

PACING (${vibeSettings.pacing}/100): ${getDetailedPacingDirection(vibeSettings.pacing)}

DIALOGUE STYLE (${vibeSettings.dialogueStyle}/100): ${getDetailedDialogueDirection(vibeSettings.dialogueStyle)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `

  // Director's notes section
  const directorVision = directorsNotes ? `
DIRECTOR'S VISION & NOTES:
${directorsNotes}

IMPLEMENTATION GUIDANCE:
- Weave these notes naturally into scene descriptions and character actions
- Use subtext and visual storytelling to convey deeper meanings
- Include sensory details and atmospheric elements as specified
- Maintain cinematic quality while honoring the director's creative vision
  ` : ''

  // Previous episode context
  const previousContext = previousChoice ? `
PREVIOUS EPISODE CONTEXT:
User's Previous Choice: "${previousChoice}"
- This choice creates consequences and character reactions in the current episode
- Reference this decision naturally in character dialogue and situations
  ` : ''

  // Edited scenes context (if any scenes were edited)
  const editedScenesContext = editedScenes && editedScenes.length > 0 ? `
EDITED SCENES FROM PREVIOUS EPISODES:
The following scenes have been edited by the user and should be considered as the canonical version:

${editedScenes.map((scene: any, index: number) => `
Scene ${scene.sceneNumber || index + 1}:
${scene.content}
`).join('\n')}

IMPORTANT: These edited scenes represent the user's creative vision and should be referenced when creating continuity. Any character development, plot points, or details established in these edited scenes must be respected and built upon.
  ` : ''

  return `Create Episode ${episodeNumber} of "${seriesTitle}" based on the provided beat sheet, vibe settings, and creative direction.

SERIES FOUNDATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Series: ${seriesTitle}
Genre: ${genre}
Premise: ${premise}

COMPLETE CHARACTER CONTEXT:${characters}

${worldContext}

${vibeDirection}

${directorVision}

${previousContext}

${editedScenesContext}

BEAT SHEET TO ADAPT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${beatSheet}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ADAPTATION REQUIREMENTS:
• Transform the beat sheet into a complete, cinematic episode
• Create 3-6 scenes based on the beats provided (flexible structure)
• Apply ALL vibe settings precisely to tone, pacing, and dialogue
• Incorporate director's notes seamlessly into the narrative
• Maintain character authenticity and series continuity
• Include rich visual descriptions and atmospheric details
• Develop authentic dialogue with subtext and character-specific voices
• Create compelling branching choices that emerge from the story

CRITICAL OUTPUT FORMAT:
Return ONLY valid JSON in this exact structure:

{
  "episodeNumber": ${episodeNumber},
  "title": "[Compelling episode title]",
  "synopsis": "[Brief episode summary reflecting vibe and content]",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "[Scene title]",
      "content": "[Full scene with rich descriptions, authentic dialogue, character actions. Apply vibe settings here - tone in atmosphere, pacing in scene flow, dialogue style in conversations.]"
    }
    // Continue for all scenes based on beat sheet
  ],
  "branchingOptions": [
    {
      "id": 1,
      "text": "[Meaningful choice that emerges from episode events]",
      "isCanonical": true
    },
    {
      "id": 2,
      "text": "[Alternative choice reflecting character values/approaches]",
      "isCanonical": false
    },
    {
      "id": 3,
      "text": "[Third choice offering different story direction]",
      "isCanonical": false
    }
  ],
  "episodeRundown": "[Comprehensive analysis of episode's narrative significance, character development, and series impact]"
}

Transform the beat sheet into cinematic storytelling that perfectly executes the vibe settings and director's vision while maintaining the authentic voice and world of the series.`
}

// Helper functions for vibe direction
function getDetailedToneDirection(value: number): string {
  if (value < 20) {
    return "DARK/GRITTY: Emphasize shadows, moral ambiguity, harsh realities. Use muted descriptions, serious dialogue, and weighty consequences. Characters face difficult truths."
  } else if (value < 40) {
    return "DARK-LEANING: Thoughtful with serious undertones. Some humor but grounded in reality. Characters deal with real stakes and genuine challenges."
  } else if (value < 60) {
    return "BALANCED: Mix of serious moments with lighter beats. Natural humor emerges from character interactions. Authentic emotional range."
  } else if (value < 80) {
    return "LIGHT-LEANING: Optimistic with occasional serious moments. Characters find hope and humor even in challenges. Upbeat but not superficial."
  } else {
    return "LIGHT/COMEDIC: Emphasis on humor, wit, and positive outlook. Quick banter, comedic timing, and characters who find levity in situations."
  }
}

function getDetailedPacingDirection(value: number): string {
  if (value < 20) {
    return "SLOW BURN: Extended character moments, contemplative pauses, detailed atmospheric descriptions. Let scenes breathe. Focus on subtext and internal development."
  } else if (value < 40) {
    return "DELIBERATE: Thoughtful pacing with purposeful scene development. Balance action with character moments. Build tension gradually."
  } else if (value < 60) {
    return "STEADY: Consistent forward momentum with varied scene lengths. Mix of quick and extended moments based on narrative needs."
  } else if (value < 80) {
    return "ENERGETIC: Faster scene transitions, more dynamic action, snappy exchanges. Keep momentum building throughout episode."
  } else {
    return "HIGH OCTANE: Rapid scene changes, intense action, quick-fire dialogue. Maximum energy and excitement. Fast-paced storytelling."
  }
}

function getDetailedDialogueDirection(value: number): string {
  if (value < 20) {
    return "SPARSE/SUBTEXTUAL: Characters say less but mean more. Heavy use of subtext, meaningful silences, and actions that speak louder than words."
  } else if (value < 40) {
    return "THOUGHTFUL: Measured dialogue with deeper meaning. Characters choose words carefully. Subtext is important."
  } else if (value < 60) {
    return "NATURAL: Authentic conversational flow. Mix of direct and indirect communication based on character and situation."
  } else if (value < 80) {
    return "ARTICULATE: Characters express themselves clearly and directly. More exposition when needed, but still natural."
  } else {
    return "SNAPPY/EXPOSITORY: Quick wit, rapid exchanges, characters who say exactly what they mean. Fast dialogue with clear information delivery."
  }
}
