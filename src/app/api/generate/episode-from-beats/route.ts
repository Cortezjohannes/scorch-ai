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
    
    // Detect mobile device from User-Agent (iPad fix)
    const userAgent = request.headers.get('user-agent') || ''
    const isMobile = /iPad|iPhone|Android|Mobile/i.test(userAgent)
    if (isMobile) {
      console.log('📱 Mobile device detected (iPad/iPhone) - will send lightweight response')
    }
    
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
    
    // For mobile devices: Compress verbose data instead of removing it
    // This keeps all data but reduces size for iPad compatibility
    if (isMobile) {
      console.log('📱 Compressing episode data for mobile device (keeping all data, just optimized)...')
      
      // Compress engine notes if they exist
      if (enhancedEpisode.comprehensiveEngineNotes) {
        const compressedNotes: any = {}
        Object.keys(enhancedEpisode.comprehensiveEngineNotes).forEach(key => {
          const originalNote = enhancedEpisode.comprehensiveEngineNotes[key]
          if (typeof originalNote === 'string' && originalNote.length > 200) {
            compressedNotes[key] = originalNote.substring(0, 200) + '... [truncated for mobile]'
          } else {
            compressedNotes[key] = originalNote
          }
        })
        enhancedEpisode.comprehensiveEngineNotes = compressedNotes
      }
      
      // Compress raw AI response if it exists (keep first 500 chars)
      if (enhancedEpisode.rawAIResponse && typeof enhancedEpisode.rawAIResponse === 'string') {
        if (enhancedEpisode.rawAIResponse.length > 500) {
          enhancedEpisode.rawAIResponse = enhancedEpisode.rawAIResponse.substring(0, 500) + '... [truncated for mobile]'
        }
      }
      
      console.log('✅ Episode data compressed for mobile (all data preserved, size reduced)')
    }
    
    // Prepare response object
    const responseObj = {
      success: true,
      episode: enhancedEpisode,
      beatSheet,
      vibeSettings,
      directorsNotes
    }
    
    // Calculate response size BEFORE sending (iPad diagnostic)
    const responseSize = JSON.stringify(responseObj).length
    const responseSizeMB = (responseSize / (1024 * 1024)).toFixed(2)
    
    console.log(`📦 Response size: ${responseSizeMB}MB (${responseSize} bytes)${isMobile ? ' (mobile-optimized)' : ''})`)
    
    // Warn if response is STILL very large
    if (responseSize > 5 * 1024 * 1024) { // > 5MB
      console.warn(`⚠️ Response is STILL very large (${responseSizeMB}MB) even after optimization`)
    }
    
    return NextResponse.json(responseObj)
    
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

// Helper function to build comprehensive story bible context
function buildComprehensiveStoryBibleContext(storyBible: any): string {
  if (!storyBible) return 'No story bible provided.';
  
  const sections: string[] = [];
  
  // Core Identity
  sections.push('=== SERIES IDENTITY ===');
  if (storyBible.seriesTitle) sections.push(`Series Title: ${storyBible.seriesTitle}`);
  if (storyBible.genre) sections.push(`Genre: ${storyBible.genre}`);
  if (storyBible.tone) sections.push(`Tone: ${storyBible.tone}`);
  if (storyBible.targetAudience) {
    const audience = typeof storyBible.targetAudience === 'string' 
      ? storyBible.targetAudience 
      : storyBible.targetAudience.primary || storyBible.targetAudience.primaryAudience || '';
    if (audience) sections.push(`Target Audience: ${audience}`);
  }
  
  // Premise
  if (storyBible.premise) {
    sections.push('\n=== PREMISE ===');
    if (typeof storyBible.premise === 'string') {
      sections.push(storyBible.premise);
    } else {
      if (storyBible.premise.premiseStatement) sections.push(storyBible.premise.premiseStatement);
      if (storyBible.premise.coreConflict) sections.push(`Core Conflict: ${storyBible.premise.coreConflict}`);
      if (storyBible.premise.stakes) sections.push(`Stakes: ${storyBible.premise.stakes}`);
    }
  }
  
  // Characters (ALL characters, not truncated) - Use full 3D profiles if available
  if (storyBible.mainCharacters && storyBible.mainCharacters.length > 0) {
    sections.push('\n=== CHARACTERS ===');
    storyBible.mainCharacters.forEach((char: any, index: number) => {
      const charDetails: string[] = [];
      charDetails.push(`${index + 1}. ${char.name || 'Unnamed Character'}`);
      if (char.archetype || char.premiseRole) charDetails.push(`   Archetype/Role: ${char.archetype || char.premiseRole}`);
      
      // 3D Character Profile
      if (char.physiology && char.sociology && char.psychology) {
        charDetails.push(`   PHYSIOLOGY: Age ${char.physiology.age}, ${char.physiology.gender}, ${char.physiology.appearance}`);
        charDetails.push(`   SOCIOLOGY: ${char.sociology.class}, ${char.sociology.occupation}, ${char.sociology.education}`);
        charDetails.push(`   PSYCHOLOGY: Core Value: ${char.psychology.coreValue}, Want: ${char.psychology.want}, Need: ${char.psychology.need}, Flaw: ${char.psychology.primaryFlaw}`);
        if (char.psychology.temperament) charDetails.push(`   Temperament: ${Array.isArray(char.psychology.temperament) ? char.psychology.temperament.join(', ') : char.psychology.temperament}`);
        if (char.psychology.moralStandpoint) charDetails.push(`   Moral Standpoint: ${char.psychology.moralStandpoint}`);
        if (char.psychology.fears) {
          const fears = Array.isArray(char.psychology.fears) ? char.psychology.fears.join(', ') : char.psychology.fears;
          charDetails.push(`   Fears: ${fears}`);
        }
        if (char.psychology.strengths) {
          const strengths = Array.isArray(char.psychology.strengths) ? char.psychology.strengths.join(', ') : char.psychology.strengths;
          charDetails.push(`   Strengths: ${strengths}`);
        }
      }
      
      if (char.description) {
        const desc = typeof char.description === 'string' ? char.description : JSON.stringify(char.description);
        charDetails.push(`   Description: ${desc}`);
      }
      if (char.background || char.backstory) {
        const bg = typeof (char.background || char.backstory) === 'string' ? (char.background || char.backstory) : JSON.stringify(char.background || char.backstory);
        charDetails.push(`   Background: ${bg}`);
      }
      if (char.relationships) {
        const rels = typeof char.relationships === 'string' ? char.relationships : JSON.stringify(char.relationships);
        charDetails.push(`   Relationships: ${rels}`);
      }
      if (char.arc) {
        const arc = typeof char.arc === 'string' ? char.arc : JSON.stringify(char.arc);
        charDetails.push(`   Character Arc: ${arc}`);
      }
      if (char.motivation) charDetails.push(`   Motivation: ${char.motivation}`);
      if (char.internalConflict) charDetails.push(`   Internal Conflict: ${char.internalConflict}`);
      if (char.voice || char.voiceProfile) {
        const voice = char.voiceProfile ? JSON.stringify(char.voiceProfile) : char.voice;
        charDetails.push(`   Voice: ${voice}`);
      }
      if (char.goals) {
        const goals = typeof char.goals === 'string' ? char.goals : JSON.stringify(char.goals);
        charDetails.push(`   Goals: ${goals}`);
      }
      if (char.fears) {
        const fears = typeof char.fears === 'string' ? char.fears : JSON.stringify(char.fears);
        charDetails.push(`   Fears: ${fears}`);
      }
      if (char.secrets) {
        const secrets = typeof char.secrets === 'string' ? char.secrets : JSON.stringify(char.secrets);
        charDetails.push(`   Secrets: ${secrets}`);
      }
      sections.push(charDetails.join('\n'));
    });
  }
  
  // World Building
  if (storyBible.worldBuilding) {
    sections.push('\n=== WORLD BUILDING ===');
    if (typeof storyBible.worldBuilding === 'string') {
      sections.push(storyBible.worldBuilding);
    } else {
      if (storyBible.worldBuilding.setting) {
        const setting = typeof storyBible.worldBuilding.setting === 'string' 
          ? storyBible.worldBuilding.setting 
          : JSON.stringify(storyBible.worldBuilding.setting);
        sections.push(`Setting: ${setting}`);
      }
      if (storyBible.worldBuilding.rules) {
        if (Array.isArray(storyBible.worldBuilding.rules)) {
          sections.push(`World Rules:\n${storyBible.worldBuilding.rules.map((r: string) => `- ${r}`).join('\n')}`);
        } else {
          sections.push(`World Rules: ${storyBible.worldBuilding.rules}`);
        }
      }
      if (storyBible.worldBuilding.locations && Array.isArray(storyBible.worldBuilding.locations)) {
        sections.push('\nLocations:');
        storyBible.worldBuilding.locations.forEach((loc: any) => {
          const locDetails: string[] = [];
          if (loc.name) locDetails.push(`  - ${loc.name}`);
          if (loc.type) locDetails.push(`    Type: ${loc.type}`);
          if (loc.description) {
            const desc = typeof loc.description === 'string' ? loc.description : JSON.stringify(loc.description);
            locDetails.push(`    Description: ${desc}`);
          }
          if (loc.significance) locDetails.push(`    Significance: ${loc.significance}`);
          if (loc.atmosphere) locDetails.push(`    Atmosphere: ${loc.atmosphere}`);
          if (loc.recurringEvents && Array.isArray(loc.recurringEvents)) {
            locDetails.push(`    Recurring Events: ${loc.recurringEvents.join(', ')}`);
          }
          if (loc.conflicts && Array.isArray(loc.conflicts)) {
            locDetails.push(`    Conflicts: ${loc.conflicts.join(', ')}`);
          }
          sections.push(locDetails.join('\n'));
        });
      }
      if (storyBible.worldBuilding.atmosphere) sections.push(`Atmosphere: ${storyBible.worldBuilding.atmosphere}`);
      if (storyBible.worldBuilding.culturalContext) sections.push(`Cultural Context: ${storyBible.worldBuilding.culturalContext}`);
      if (storyBible.worldBuilding.visualStyle) sections.push(`Visual Style: ${storyBible.worldBuilding.visualStyle}`);
    }
  }
  
  // Themes
  if (storyBible.theme || storyBible.themes) {
    sections.push('\n=== THEMES ===');
    if (storyBible.themes && Array.isArray(storyBible.themes)) {
      storyBible.themes.forEach((theme: string, index: number) => {
        sections.push(`${index + 1}. ${theme}`);
      });
    } else if (storyBible.theme) {
      sections.push(storyBible.theme);
    }
  }
  
  // Narrative Elements
  if (storyBible.narrativeElements) {
    sections.push('\n=== NARRATIVE ELEMENTS ===');
    if (storyBible.narrativeElements.callbacks) {
      sections.push(`Callbacks: ${storyBible.narrativeElements.callbacks}`);
    }
    if (storyBible.narrativeElements.foreshadowing) {
      sections.push(`Foreshadowing: ${storyBible.narrativeElements.foreshadowing}`);
    }
    if (storyBible.narrativeElements.recurringMotifs) {
      sections.push(`Recurring Motifs: ${storyBible.narrativeElements.recurringMotifs}`);
    }
  }
  
  // Narrative Arcs
  if (storyBible.narrativeArcs && Array.isArray(storyBible.narrativeArcs)) {
    sections.push('\n=== NARRATIVE ARCS ===');
    storyBible.narrativeArcs.forEach((arc: any, index: number) => {
      const arcDetails: string[] = [];
      arcDetails.push(`Arc ${index + 1}: ${arc.title || `Arc ${index + 1}`}`);
      if (arc.summary) {
        const summary = typeof arc.summary === 'string' ? arc.summary : JSON.stringify(arc.summary);
        arcDetails.push(`  Summary: ${summary}`);
      }
      if (arc.episodes && Array.isArray(arc.episodes)) {
        arcDetails.push(`  Episodes: ${arc.episodes.length} episodes`);
        arc.episodes.forEach((ep: any) => {
          if (ep.title) arcDetails.push(`    - Episode ${ep.number || '?'}: ${ep.title}`);
        });
      }
      sections.push(arcDetails.join('\n'));
    });
  }
  
  return sections.join('\n');
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
  // Build comprehensive story bible context
  const storyBibleContext = buildComprehensiveStoryBibleContext(storyBible);
  
  // Extract key story elements
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  const genre = storyBible.genre || 'Drama'
  const premise = storyBible.premise?.premiseStatement || 'A story unfolds...'
  
  // Build COMPREHENSIVE character context using FULL 3D profiles (for detailed character writing guidance)
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

  // World context is now included in comprehensive story bible context above
  const worldContext = '' // World context is included in storyBibleContext
  
  // Get dialogue language from story bible settings
  const dialogueLanguage = storyBible.dialogueLanguage || storyBible.generationSettings?.dialogueLanguage || 'english'
  const languageInstructions = getDialogueLanguageInstructions(dialogueLanguage)

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

${storyBibleContext}

DETAILED CHARACTER WRITING GUIDANCE:${characters}

${worldContext}

${vibeDirection}

${languageInstructions}

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
   ${dialogueLanguage !== 'english' ? `• ALL DIALOGUE MUST BE IN ${dialogueLanguage.toUpperCase()} (narrative prose stays in English)` : ''}

⚠️ BEFORE YOU RETURN YOUR RESPONSE:
   - Verify you have 2-3 deep, substantial scenes appropriate for 5-minute runtime
   - Check tone matches vibe setting (reread your content - is it actually dark/light as requested?)
   - Confirm pacing is appropriate (are scenes slow/fast as requested?)
   - Ensure ALL director's notes are incorporated
   - Confirm each scene is fully developed, not rushed or shallow
   ${dialogueLanguage !== 'english' ? `- VERIFY all dialogue is written in ${dialogueLanguage.toUpperCase()} with cultural authenticity` : ''}

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

// Helper function for dialogue language instructions
function getDialogueLanguageInstructions(language: string): string {
  const languageInstructions: Record<string, string> = {
    'english': '',  // No special instructions for English (default)
    'tagalog': `
🗣️ DIALOGUE LANGUAGE: TAGLISH (Tagalog-English Code-Switching)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**ALL DIALOGUE MUST BE IN AUTHENTIC TAGLISH:**
- Characters naturally switch between Tagalog and English mid-sentence
- Use Filipino expressions, idioms, and cultural references
- Common patterns: "Ano ba 'yan!" / "Sige na!" / "Hay nako!" / "Aba!" / "Grabe!"
- Mix English technical/modern terms with Tagalog emotional expressions
- Examples of authentic Taglish dialogue:
  * "Wait lang, I need to think about this muna."
  * "Bakit mo ginawa 'yun? You know that's not right!"
  * "I don't know anymore, pare. Ang hirap ng situation."
  * "Let me explain, pero please, don't get mad."
  * "So what now? Ano na ang plan natin?"

**CULTURAL AUTHENTICITY:**
- Incorporate Filipino values: hiya, utang na loob, pakikisama, respeto
- Use appropriate honorifics: Ate, Kuya, Tito, Tita, Ma, Pa
- Include Filipino gestures/mannerisms in action descriptions (lip pointing, eyebrow raising for yes)
- Reference Filipino contexts, food, places naturally

**NARRATIVE PROSE REMAINS IN ENGLISH** - Only dialogue is in Taglish
`,
    'thai': `
🗣️ DIALOGUE LANGUAGE: THAI (ภาษาไทย)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**ALL DIALOGUE MUST BE IN AUTHENTIC THAI:**
- Write all character dialogue in Thai script (ภาษาไทย)
- Use appropriate Thai politeness particles: ครับ (khrap), ค่ะ (ka), นะ (na)
- Include Thai expressions and idioms naturally
- Examples of Thai dialogue:
  * "ทำไมเธอถึงทำแบบนั้นล่ะ?"
  * "ฉันไม่เข้าใจเลย... มันเกิดอะไรขึ้น?"
  * "ใจเย็นๆ นะ เดี๋ยวเราค่อยคุยกัน"
  * "อย่าไปคิดมากเลย สู้ๆ นะ"

**CULTURAL AUTHENTICITY:**
- Incorporate Thai cultural values: greng jai (consideration), kruu (respect for elders), sanuk (fun)
- Use appropriate Thai honorifics and pronouns based on relationships and age
- Include Thai-specific gestures and customs in descriptions (wai greeting, etc.)
- Reference Thai contexts, food, and places naturally

**NARRATIVE PROSE REMAINS IN ENGLISH** - Only dialogue is in Thai script
`,
    'spanish': `
🗣️ DIALOGUE LANGUAGE: SPANISH (Español)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**ALL DIALOGUE MUST BE IN AUTHENTIC SPANISH:**
- Write all character dialogue in natural, conversational Spanish
- Use regional variations appropriately (Latin American or Castilian as fits the story)
- Include Spanish expressions, idioms, and interjections
- Examples of Spanish dialogue:
  * "¿Por qué hiciste eso? No lo entiendo."
  * "Mira, necesito que me escuches bien."
  * "¡Ay, Dios mío! ¿Qué vamos a hacer ahora?"
  * "No te preocupes, todo va a salir bien."
  * "¿Sabes qué? Ya me cansé de esta situación."

**CULTURAL AUTHENTICITY:**
- Incorporate cultural values: familia, honor, respeto
- Use appropriate formality levels (tú vs usted) based on character relationships
- Include culturally-specific gestures and customs in descriptions
- Reference appropriate cultural contexts, food, and places naturally

**NARRATIVE PROSE REMAINS IN ENGLISH** - Only dialogue is in Spanish
`,
    'korean': `
🗣️ DIALOGUE LANGUAGE: KOREAN (한국어)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**ALL DIALOGUE MUST BE IN AUTHENTIC KOREAN:**
- Write all character dialogue in Korean script (한글)
- Use appropriate speech levels based on relationships (존댓말/반말)
- Include Korean expressions and interjections naturally
- Examples of Korean dialogue:
  * "왜 그랬어? 이해가 안 돼."
  * "잠깐만, 내 얘기 좀 들어봐."
  * "어떡해... 이제 어떻게 해야 해?"
  * "괜찮아, 다 잘 될 거야."
  * "진짜? 그게 사실이야?"

**CULTURAL AUTHENTICITY:**
- Incorporate Korean cultural values: jeong (affection), nunchi (social awareness), respect for hierarchy
- Use appropriate honorifics and titles: 형/누나/오빠/언니, 선배/후배, -씨, -님
- Include Korean-specific gestures and customs in descriptions (bowing, etc.)
- Reference Korean contexts, food, and places naturally

**NARRATIVE PROSE REMAINS IN ENGLISH** - Only dialogue is in Korean script
`,
    'japanese': `
🗣️ DIALOGUE LANGUAGE: JAPANESE (日本語)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**ALL DIALOGUE MUST BE IN AUTHENTIC JAPANESE:**
- Write all character dialogue in Japanese (using appropriate mix of hiragana, katakana, kanji)
- Use appropriate politeness levels based on relationships (敬語/タメ語)
- Include Japanese expressions and interjections naturally
- Examples of Japanese dialogue:
  * "どうしてそんなことをしたの？"
  * "ちょっと待って、話を聞いて。"
  * "どうしよう...これからどうすればいい？"
  * "大丈夫、きっとうまくいくよ。"
  * "本当に？信じられない..."

**CULTURAL AUTHENTICITY:**
- Incorporate Japanese cultural values: wa (harmony), giri (duty), honne/tatemae
- Use appropriate honorifics: -san, -kun, -chan, -sama, senpai/kohai
- Include Japanese-specific gestures and customs in descriptions (bowing levels, etc.)
- Reference Japanese contexts, food, and places naturally

**NARRATIVE PROSE REMAINS IN ENGLISH** - Only dialogue is in Japanese script
`,
    'french': `
🗣️ DIALOGUE LANGUAGE: FRENCH (Français)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**ALL DIALOGUE MUST BE IN AUTHENTIC FRENCH:**
- Write all character dialogue in natural, conversational French
- Use appropriate formality (tu vs vous) based on character relationships
- Include French expressions and interjections naturally
- Examples of French dialogue:
  * "Pourquoi tu as fait ça? Je ne comprends pas."
  * "Écoute, il faut qu'on parle sérieusement."
  * "Mon Dieu... Qu'est-ce qu'on va faire maintenant?"
  * "Ne t'inquiète pas, tout va s'arranger."
  * "Tu sais quoi? J'en ai marre de cette situation."

**CULTURAL AUTHENTICITY:**
- Incorporate French cultural nuances and communication style
- Use appropriate levels of formality based on relationships
- Include culturally-specific gestures and customs in descriptions
- Reference French contexts, food, and places naturally

**NARRATIVE PROSE REMAINS IN ENGLISH** - Only dialogue is in French
`,
    'chinese': `
🗣️ DIALOGUE LANGUAGE: CHINESE (中文)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**ALL DIALOGUE MUST BE IN AUTHENTIC MANDARIN CHINESE:**
- Write all character dialogue in Chinese characters (简体中文 or 繁體中文 as appropriate)
- Use appropriate formality based on relationships and context
- Include Chinese expressions and interjections naturally
- Examples of Chinese dialogue:
  * "你为什么要这样做？我不明白。"
  * "等一下，听我说。"
  * "怎么办...我们现在该怎么办？"
  * "别担心，一切都会好起来的。"
  * "真的吗？我简直不敢相信。"

**CULTURAL AUTHENTICITY:**
- Incorporate Chinese cultural values: 面子 (face), 孝 (filial piety), 关系 (relationships)
- Use appropriate titles and terms of address based on relationships
- Include Chinese-specific gestures and customs in descriptions
- Reference Chinese contexts, food, and places naturally

**NARRATIVE PROSE REMAINS IN ENGLISH** - Only dialogue is in Chinese characters
`
  }
  
  return languageInstructions[language] || languageInstructions['english'] || ''
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
