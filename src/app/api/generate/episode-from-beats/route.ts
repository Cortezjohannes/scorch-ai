import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/services/azure-openai'
import { logger } from '@/services/console-logger'

// Set maximum execution time to 5 minutes (300 seconds)
export const maxDuration = 300

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
    
    // Enhanced request validation
    const validationErrors = []
    
    if (!storyBible) {
      validationErrors.push('Story bible is required')
    } else {
      if (!storyBible.seriesTitle) validationErrors.push('Story bible must have a series title')
      if (!storyBible.mainCharacters || storyBible.mainCharacters.length === 0) {
        validationErrors.push('Story bible must have at least one character')
      }
    }
    
    if (!episodeNumber || typeof episodeNumber !== 'number' || episodeNumber < 1) {
      validationErrors.push('Valid episode number is required')
    }
    
    if (!beatSheet || beatSheet.trim().length < 50) {
      validationErrors.push('Beat sheet must be at least 50 characters long')
    }
    
    if (vibeSettings) {
      if (typeof vibeSettings.tone !== 'number' || vibeSettings.tone < 0 || vibeSettings.tone > 100) {
        validationErrors.push('Tone must be a number between 0 and 100')
      }
      if (typeof vibeSettings.pacing !== 'number' || vibeSettings.pacing < 0 || vibeSettings.pacing > 100) {
        validationErrors.push('Pacing must be a number between 0 and 100')
      }
      if (typeof vibeSettings.dialogueStyle !== 'number' || vibeSettings.dialogueStyle < 0 || vibeSettings.dialogueStyle > 100) {
        validationErrors.push('Dialogue style must be a number between 0 and 100')
      }
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationErrors.join(', '),
          validationErrors
        },
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
    
    const systemPrompt = `You are a master storyteller with expertise in creating engaging narrative prose episodes. 

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL: YOUR PRIMARY DIRECTIVE IS TO FOLLOW THE DIRECTOR'S INPUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The user has spent time crafting:
1. A BEAT SHEET - This is your structural blueprint. Follow it closely.
2. VIBE SETTINGS - Tone, pacing, and dialogue style. Apply these precisely.
3. DIRECTOR'S NOTES - Specific creative vision. These are mandatory, not suggestions.

If the director says "focus on the sound of rain," you MUST include rain sounds.
The beat sheet provides story structure - you decide how many scenes best serve the 5-minute episode (typically 2-3 substantial scenes).
If tone is set to 20 (dark), the episode MUST feel dark - not balanced, not light.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 NARRATIVE ARCHITECTURE:
- Create multi-layered conflicts (internal vs external, character vs world, ideal vs reality)
- Ensure character consistency using full story context
- Build tension naturally through escalating stakes and challenges
- Structure scenes for maximum emotional impact and pacing
- Connect episodes through callbacks and character development arcs
- **FOLLOW THE BEAT SHEET as structural guidance - adapt beats into 2-3 substantial scenes for 5-minute runtime**

✍️ PROSE & DIALOGUE:
- Write rich narrative prose that reads like a great novel (NOT screenplay format)
- Create authentic dialogue with subtext that reveals character psychology
- Show character emotions through action, thought, and sensory details
- Develop distinct voices for each character
- Weave dialogue naturally into narrative flow
- **MATCH DIALOGUE STYLE SETTING: sparse vs snappy, subtextual vs expository**

🌍 WORLD & ATMOSPHERE:
- Create immersive sensory details that make the world feel alive
- Build atmosphere through environment, weather, lighting, sounds
- Use setting to reflect character emotional states
- Make the world reactive to character actions
- Integrate theme through environmental storytelling
- **INCORPORATE DIRECTOR'S SENSORY AND ATMOSPHERIC NOTES EXPLICITLY**

🎭 GENRE & ENGAGEMENT:
- Apply genre conventions authentically while innovating
- Balance formula with surprise
- Create moments that resonate emotionally
- Build toward meaningful character choices
- Maintain series continuity and consequences

🎨 VIBE EXECUTION (CRITICAL - NON-NEGOTIABLE):
- **TONE SETTING:** If 0-30 (dark), use shadows, moral ambiguity, harsh realities
- **TONE SETTING:** If 30-70 (balanced), authentic emotional range with both light and heavy moments
- **TONE SETTING:** If 70-100 (light), emphasize hope, humor, optimism even in challenges
- **PACING SETTING:** If 0-30 (slow burn), extended moments, contemplation, let scenes breathe
- **PACING SETTING:** If 30-70 (steady), consistent forward momentum with varied rhythm
- **PACING SETTING:** If 70-100 (high octane), rapid transitions, intense action, quick-fire exchanges
- **DIALOGUE STYLE:** Match the requested style precisely (see above)
- **DIRECTOR'S VISION:** Every specific note must appear in the content

📖 NARRATIVE PROSE FORMAT:
- Write like a novelist, not a screenwriter
- Third-person with rich interiority
- Natural dialogue woven into prose
- Vivid sensory descriptions
- Chapter-like scenes that flow naturally

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ QUALITY CHECK BEFORE RETURNING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ask yourself:
1. Are there 2-3 substantial scenes appropriate for a 5-minute episode?
2. Does the tone match the vibe setting? (Check: is it too light/dark compared to setting?)
3. Is the pacing appropriate? (Check: are scenes too rushed/slow for the setting?)
4. Did I include ALL elements from the director's notes?
5. Does the dialogue style match the requested style?
6. Is each scene deep and fully developed rather than rushed?

If NO to any question, revise before returning.

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
    
    // Add completion flags for proper loading screen detection
    const enhancedEpisode = {
      ...parsedEpisode,
      _generationComplete: true,
      generationType: 'standard'
    }
    
    return NextResponse.json({
      success: true,
      episode: enhancedEpisode,
      beatSheet,
      vibeSettings,
      directorsNotes
    })
    
  } catch (error) {
    console.error('❌ Script generation error:', error)
    logger.error('Episode Generation', 'Script Engine', error instanceof Error ? error.message : 'Unknown error')
    
    // Enhanced error handling with specific error types
    let errorMessage = 'Script generation failed'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        errorMessage = 'AI service authentication failed'
        errorDetails = 'Please check API configuration'
        statusCode = 503
      } else if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
        errorMessage = 'AI service timeout'
        errorDetails = 'The AI service took too long to respond. Please try again.'
        statusCode = 504
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        errorMessage = 'AI service rate limit exceeded'
        errorDetails = 'Too many requests. Please wait a moment and try again.'
        statusCode = 429
      } else if (error.message.includes('JSON') || error.message.includes('parse')) {
        errorMessage = 'Invalid response format'
        errorDetails = 'The AI service returned an unexpected response format.'
        statusCode = 502
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      { status: statusCode }
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

ADAPTATION REQUIREMENTS (MANDATORY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ CRITICAL RULES - MUST FOLLOW:

1. BEAT SHEET STRUCTURE:
   - Use the beats above as structural guidance for the story flow
   - THIS IS A 5-MINUTE SHORT-FORM EPISODE - create 2-3 scenes MAXIMUM
   - 5-minute runtime = 2-3 deep scenes (each 2-2.5 minutes), NOT 4-5 shallow scenes
   - Quality over quantity: FEWER scenes with MORE depth
   - Combine multiple beats into single powerful, immersive scenes
   - Each scene must be substantial enough to feel like a complete story moment

2. VIBE SETTINGS (NON-NEGOTIABLE):
   - Tone ${vibeSettings.tone}/100: ${getDetailedToneDirection(vibeSettings.tone)}
   - Pacing ${vibeSettings.pacing}/100: ${getDetailedPacingDirection(vibeSettings.pacing)}
   - Dialogue ${vibeSettings.dialogueStyle}/100: ${getDetailedDialogueDirection(vibeSettings.dialogueStyle)}
   - These MUST be reflected in your prose style, scene rhythm, and character speech

3. DIRECTOR'S NOTES (MANDATORY):
   ${directorsNotes ? `The director specifically requested:\n   "${directorsNotes}"\n   EVERY element of this must appear in the episode content.` : 'No specific director notes provided.'}

4. QUALITY REQUIREMENTS:
   • Rich narrative prose (not screenplay format)
   • Natural dialogue woven into prose
   • Vivid sensory descriptions matching requested atmosphere
   • Character authenticity and series continuity
   • Compelling branching choices that emerge organically from the story

⚠️ BEFORE YOU RETURN YOUR RESPONSE:
   - Verify you have 2-3 deep, substantial scenes appropriate for 5-minute runtime
   - Check tone matches vibe setting (reread your content - is it actually dark/light as requested?)
   - Confirm pacing is appropriate (are scenes slow/fast as requested?)
   - Ensure ALL director's notes are incorporated
   - Confirm each scene is fully developed, not rushed or shallow

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
    // Typically 2-3 scenes for 5-minute episodes
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
