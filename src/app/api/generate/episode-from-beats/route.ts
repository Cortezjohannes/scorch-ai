import { NextRequest, NextResponse } from 'next/server'
import { EngineAIRouter } from '@/services/engine-ai-router'
import { logger } from '@/services/console-logger'

// Set maximum execution time to 10 minutes (600 seconds)
// Episode generation with comprehensive story bible context and all previous episodes can take longer
export const maxDuration = 600

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
      previousEpisode,
      allPreviousEpisodes,
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
      previousEpisode,
      allPreviousEpisodes,
      editedScenes
    )
    
    const systemPrompt = `You are a master storyteller with expertise in creating engaging narrative prose episodes. 

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL: YOUR PRIMARY DIRECTIVE IS TO FOLLOW THE DIRECTOR'S INPUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The user has spent time crafting:
1. A BEAT SHEET - This is your structural blueprint. Follow it closely. **EVERY BEAT MUST APPEAR.**
2. VIBE SETTINGS - Tone, pacing, and dialogue style. Apply these precisely.
3. DIRECTOR'S NOTES - Specific creative vision. These are mandatory, not suggestions.

If the director says "focus on the sound of rain," you MUST include rain sounds.
The beat sheet provides story structure - **COUNT THE BEATS, then create AT LEAST that many scenes (one scene per beat minimum).**
**Scene count is UNLIMITED - if there are 9 beats, create 9+ scenes. If there are 6 beats, create 6+ scenes.**
**DO NOT REMOVE SCENES - DO NOT SKIP BEATS - EVERY BEAT MUST HAVE ITS OWN SCENE.**
If tone is set to 20 (dark), the episode MUST feel dark - not balanced, not light.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 NARRATIVE ARCHITECTURE:
- Create multi-layered conflicts (internal vs external, character vs world, ideal vs reality)
- **CRITICAL: Use the COMPLETE story bible context provided above - including ALL technical sections (Tension Strategy, Choice Architecture, Living World, Trope Analysis, Cohesion, Dialogue Strategy, Genre Enhancement, Theme Integration, Premise Integration)**
- **CRITICAL: Reference ALL previous episodes provided - use specific events, character development, plot threads, and consequences from past episodes**
- Ensure character consistency using full story context from story bible AND previous episodes
- Build tension naturally using the TENSION STRATEGY from the story bible technical sections
- Structure scenes for maximum emotional impact and pacing according to story bible guidance
- Connect episodes through callbacks, character development arcs, and continuity from previous episodes
- **FOLLOW THE BEAT SHEET as structural guidance - ALL beats must be represented in the episode**
- **COUNT THE BEATS in the beat sheet - CREATE AT LEAST THAT MANY SCENES (one scene per beat)**
- **NO BEATS CAN BE SKIPPED - if you skip even one beat, you have failed**
- **NO SCENES CAN BE REMOVED - if the beat sheet has 9 beats, create 9+ scenes**
- **Scene count is UNLIMITED - if there are 9 beats, create 9 scenes minimum**
- **EACH BEAT DESERVES ITS OWN SCENE - DO NOT COMBINE BEATS UNLESS ABSOLUTELY NECESSARY**
- **DO NOT DEFAULT TO 3 SCENES - COUNT THE BEATS AND CREATE THAT MANY SCENES**
- Apply CHOICE ARCHITECTURE from story bible when building toward meaningful decisions
- Incorporate LIVING WORLD DYNAMICS to make the world feel reactive and alive
- Use TROPE ANALYSIS to balance genre expectations with fresh storytelling
- Follow COHESION ANALYSIS to maintain consistency with previous episodes
- Apply DIALOGUE STRATEGY for authentic character voices
- Use GENRE ENHANCEMENT for visual style and pacing
- Integrate THEME throughout using THEME INTEGRATION guidance

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

⚠️ MANDATORY VERIFICATION CHECKLIST - ANSWER EACH QUESTION:

1. **BEAT COUNT VERIFICATION:**
   - How many beats are in the beat sheet? (Count them)
   - How many beats did I include in my episode? (Count them)
   - Are these numbers EXACTLY the same? If NO, you MUST add the missing beats.

2. **BEAT-BY-BEAT VERIFICATION:**
   - Beat 1: Is it in the episode? Where? (List the scene number)
   - Beat 2: Is it in the episode? Where? (List the scene number)
   - Beat 3: Is it in the episode? Where? (List the scene number)
   - [Continue for ALL beats in the beat sheet]
   - If ANY beat is missing, you MUST add it before returning.

3. **SCENE COUNT VERIFICATION:**
   - How many scenes did I create?
   - Is this enough to include ALL beats properly?
   - If beats are missing, create more scenes to include them.
   - There is NO limit on scene count - use as many as needed.

4. **QUALITY VERIFICATION:**
   - Does the tone match the vibe setting? (Check: is it too light/dark compared to setting?)
   - Is the pacing appropriate? (Check: are scenes too rushed/slow for the setting?)
   - Did I include ALL elements from the director's notes?
   - Does the dialogue style match the requested style?
   - Is each scene deep and fully developed rather than rushed?

**IF YOU ANSWERED "NO" OR "MISSING" TO ANY BEAT QUESTION, YOU MUST REVISE AND INCLUDE ALL BEATS BEFORE RETURNING.**

You create episodes that are enjoyable to READ and REVIEW, making the narrative prose engaging before it becomes a script.`

    console.log('🎬 Generating script from beat sheet with vibe settings:', vibeSettings)
    console.log('🚀 Using Gemini 3 Pro Preview for episode generation...')
    
    const result = await EngineAIRouter.generateContent({
      prompt: scriptPrompt,
      systemPrompt,
      temperature: 0.9, // Maximum creativity for final script
      maxTokens: 8000, // Large token count for detailed episodes
      engineId: 'episode-generator',
      forceProvider: 'gemini' // Use Gemini 3 Pro Preview for creative writing
    })
    
    console.log(`✅ [GEMINI] Episode generated: ${result.metadata.contentLength} chars using ${result.model}`)
    
    // Parse the generated episode with robust fallback handling
    let parsedEpisode
    try {
      // First try: Direct JSON parsing
      parsedEpisode = JSON.parse(result.content)
    } catch (directParseError) {
      try {
        // Second try: Extract JSON from markdown code blocks
        const jsonMatch = result.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
        if (jsonMatch && jsonMatch[1]) {
          parsedEpisode = JSON.parse(jsonMatch[1])
        } else {
          // Third try: Find any JSON-like structure
          const anyJsonMatch = result.content.match(/\{[\s\S]*\}/)
          if (anyJsonMatch) {
            parsedEpisode = JSON.parse(anyJsonMatch[0])
          } else {
            throw new Error('No JSON found in response')
          }
        }
      } catch (parseError) {
        console.error('Failed to parse episode JSON:', parseError)
        console.log('Raw AI response:', result.content.substring(0, 500) + '...')
        
        // Enhanced fallback structure based on beat sheet - include ALL beats
        const beatLines = beatSheet.split('\n').filter((line: string) => line.trim().length > 0)
        const fallbackContent = beatLines.length > 0 ? 
          beatLines.join('\n\n') : 
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
  
  // ===== TECHNICAL SECTIONS (CRITICAL - MUST BE USED) =====
  
  // Tension Strategy (from Technical Tab)
  if (storyBible.tensionStrategy) {
    sections.push('\n=== TENSION STRATEGY (TECHNICAL) ===');
    const tension = storyBible.tensionStrategy;
    if (tension.rawContent) {
      sections.push(typeof tension.rawContent === 'string' ? tension.rawContent : JSON.stringify(tension.rawContent));
    } else {
      if (tension.tensionCurve) sections.push(`Tension Curve: ${tension.tensionCurve}`);
      if (tension.climaxPoints) sections.push(`Climax Points: ${tension.climaxPoints}`);
      if (tension.releaseMoments) sections.push(`Release Moments: ${tension.releaseMoments}`);
      if (tension.escalationTechniques) sections.push(`Escalation Techniques: ${tension.escalationTechniques}`);
      if (tension.emotionalBeats) sections.push(`Emotional Beats: ${tension.emotionalBeats}`);
    }
  }
  
  // Choice Architecture (from Technical Tab)
  if (storyBible.choiceArchitecture) {
    sections.push('\n=== CHOICE ARCHITECTURE (TECHNICAL) ===');
    const choice = storyBible.choiceArchitecture;
    if (choice.rawContent) {
      sections.push(typeof choice.rawContent === 'string' ? choice.rawContent : JSON.stringify(choice.rawContent));
    } else {
      if (choice.keyDecisions) sections.push(`Key Decisions: ${choice.keyDecisions}`);
      if (choice.moralChoices) sections.push(`Moral Choices: ${choice.moralChoices}`);
      if (choice.consequenceMapping) sections.push(`Consequence Mapping: ${choice.consequenceMapping}`);
      if (choice.branchingStructure) sections.push(`Branching Structure: ${choice.branchingStructure}`);
      if (choice.characterGrowth) sections.push(`Character Growth: ${choice.characterGrowth}`);
      if (choice.thematicChoices) sections.push(`Thematic Choices: ${choice.thematicChoices}`);
    }
  }
  
  // Living World Dynamics (from Technical Tab)
  if (storyBible.livingWorldDynamics) {
    sections.push('\n=== LIVING WORLD DYNAMICS (TECHNICAL) ===');
    const living = storyBible.livingWorldDynamics;
    if (living.rawContent) {
      sections.push(typeof living.rawContent === 'string' ? living.rawContent : JSON.stringify(living.rawContent));
    } else {
      if (living.backgroundEvents) sections.push(`Background Events: ${living.backgroundEvents}`);
      if (living.socialDynamics) sections.push(`Social Dynamics: ${living.socialDynamics}`);
      if (living.economicFactors) sections.push(`Economic Factors: ${living.economicFactors}`);
      if (living.culturalEvolution) sections.push(`Cultural Evolution: ${living.culturalEvolution}`);
    }
  }
  
  // Trope Analysis (from Technical Tab)
  if (storyBible.tropeAnalysis) {
    sections.push('\n=== TROPE ANALYSIS (TECHNICAL) ===');
    const trope = storyBible.tropeAnalysis;
    if (trope.rawContent) {
      sections.push(typeof trope.rawContent === 'string' ? trope.rawContent : JSON.stringify(trope.rawContent));
    } else {
      if (trope.genreTropes) sections.push(`Genre Tropes: ${trope.genreTropes}`);
      if (trope.subvertedTropes) sections.push(`Subverted Tropes: ${trope.subvertedTropes}`);
      if (trope.originalElements) sections.push(`Original Elements: ${trope.originalElements}`);
      if (trope.tropeMashups) sections.push(`Trope Mashups: ${trope.tropeMashups}`);
    }
  }
  
  // Cohesion Analysis (from Technical Tab)
  if (storyBible.cohesionAnalysis) {
    sections.push('\n=== COHESION ANALYSIS (TECHNICAL) ===');
    const cohesion = storyBible.cohesionAnalysis;
    if (cohesion.rawContent) {
      sections.push(typeof cohesion.rawContent === 'string' ? cohesion.rawContent : JSON.stringify(cohesion.rawContent));
    } else {
      if (cohesion.plotConsistency) sections.push(`Plot Consistency: ${cohesion.plotConsistency}`);
      if (cohesion.characterConsistency) sections.push(`Character Consistency: ${cohesion.characterConsistency}`);
      if (cohesion.thematicConsistency) sections.push(`Thematic Consistency: ${cohesion.thematicConsistency}`);
      if (cohesion.emotionalJourney) sections.push(`Emotional Journey: ${cohesion.emotionalJourney}`);
    }
  }
  
  // Dialogue Strategy (from Technical Tab)
  if (storyBible.dialogueStrategy) {
    sections.push('\n=== DIALOGUE STRATEGY (TECHNICAL) ===');
    const dialogue = storyBible.dialogueStrategy;
    if (dialogue.rawContent) {
      sections.push(typeof dialogue.rawContent === 'string' ? dialogue.rawContent : JSON.stringify(dialogue.rawContent));
    } else {
      if (dialogue.characterVoice) sections.push(`Character Voice: ${dialogue.characterVoice}`);
      if (dialogue.conflictDialogue) sections.push(`Conflict Dialogue: ${dialogue.conflictDialogue}`);
      if (dialogue.subtext) sections.push(`Subtext: ${dialogue.subtext}`);
      if (dialogue.speechPatterns) sections.push(`Speech Patterns: ${dialogue.speechPatterns}`);
    }
  }
  
  // Genre Enhancement (from Technical Tab)
  if (storyBible.genreEnhancement) {
    sections.push('\n=== GENRE ENHANCEMENT (TECHNICAL) ===');
    const genre = storyBible.genreEnhancement;
    if (genre.rawContent) {
      sections.push(typeof genre.rawContent === 'string' ? genre.rawContent : JSON.stringify(genre.rawContent));
    } else {
      if (genre.visualStyle) sections.push(`Visual Style: ${genre.visualStyle}`);
      if (genre.pacing) sections.push(`Genre Pacing: ${genre.pacing}`);
      if (genre.tropes) sections.push(`Genre Tropes: ${typeof genre.tropes === 'string' ? genre.tropes : JSON.stringify(genre.tropes)}`);
      if (genre.audienceExpectations) sections.push(`Audience Expectations: ${genre.audienceExpectations}`);
    }
  }
  
  // Theme Integration (from Technical Tab)
  if (storyBible.themeIntegration) {
    sections.push('\n=== THEME INTEGRATION (TECHNICAL) ===');
    const themeInt = storyBible.themeIntegration;
    if (themeInt.rawContent) {
      sections.push(typeof themeInt.rawContent === 'string' ? themeInt.rawContent : JSON.stringify(themeInt.rawContent));
    } else {
      if (themeInt.characterIntegration) sections.push(`Character Integration: ${themeInt.characterIntegration}`);
      if (themeInt.plotIntegration) sections.push(`Plot Integration: ${themeInt.plotIntegration}`);
      if (themeInt.symbolicElements) sections.push(`Symbolic Elements: ${themeInt.symbolicElements}`);
      if (themeInt.thematicArcs) sections.push(`Thematic Arcs: ${themeInt.thematicArcs}`);
    }
  }
  
  // Premise Integration (from Premise Tab)
  if (storyBible.premiseIntegration) {
    sections.push('\n=== PREMISE INTEGRATION (TECHNICAL) ===');
    const premiseInt = storyBible.premiseIntegration;
    if (premiseInt.rawContent) {
      sections.push(typeof premiseInt.rawContent === 'string' ? premiseInt.rawContent : JSON.stringify(premiseInt.rawContent));
    } else {
      if (premiseInt.coreQuestion) sections.push(`Core Question: ${premiseInt.coreQuestion}`);
      if (premiseInt.episodicExpression) sections.push(`Episodic Expression: ${premiseInt.episodicExpression}`);
      if (premiseInt.consistencyChecks) sections.push(`Consistency Checks: ${premiseInt.consistencyChecks}`);
    }
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
  previousEpisode?: any,
  allPreviousEpisodes?: any[],
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

  // Build ALL previous episodes context for full story continuity
  let allPreviousEpisodesContext = ''
  if (allPreviousEpisodes && allPreviousEpisodes.length > 0) {
    allPreviousEpisodesContext = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📺 ALL PREVIOUS EPISODES (FULL STORY CONTEXT - USE ALL OF THIS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL: Reference specific events, character development, plot threads, relationships, and consequences from ALL previous episodes below.`
    
    // Sort episodes by episode number
    const sortedEpisodes = [...allPreviousEpisodes].sort((a, b) => {
      const aNum = a.episodeNumber || 0
      const bNum = b.episodeNumber || 0
      return aNum - bNum
    })
    
    sortedEpisodes.forEach((ep: any) => {
      const epNum = ep.episodeNumber || '?'
      const epTitle = ep.title || ep.episodeTitle || `Episode ${epNum}`
      const epSynopsis = ep.synopsis || ''
      
      allPreviousEpisodesContext += `\n\n📺 Episode ${epNum}: "${epTitle}"`
      if (epSynopsis) {
        allPreviousEpisodesContext += `\nSynopsis: ${epSynopsis}`
      }
      
      // Include key scenes for context (limit to 2-3 most important scenes per episode to avoid token bloat)
      const scenes = ep.scenes || []
      if (scenes.length > 0) {
        const keyScenes = scenes.slice(-2) // Last 2 scenes are usually most relevant
        keyScenes.forEach((scene: any, index: number) => {
          const sceneTitle = scene.title || `Scene ${scene.sceneNumber || index + 1}`
          const sceneContent = scene.content || scene.screenplay || scene.sceneContent || ''
          // Include scene preview (first 400 chars for better context)
          const preview = sceneContent.substring(0, 400) + (sceneContent.length > 400 ? '...' : '')
          allPreviousEpisodesContext += `\n\n  ${sceneTitle}:\n  ${preview}`
        })
      }
    })
    
    allPreviousEpisodesContext += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ USE THIS CONTEXT: Reference character arcs, plot developments, relationships, choices, and consequences from the episodes above. Build continuity naturally.`
  }
  
  // Build immediate previous episode context (full detail)
  let previousEpisodeContext = ''
  if (previousEpisode) {
    const prevEpTitle = previousEpisode.title || previousEpisode.episodeTitle || `Episode ${episodeNumber - 1}`
    const prevEpSynopsis = previousEpisode.synopsis || ''
    const prevEpScenes = previousEpisode.scenes || []
    
    previousEpisodeContext = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📺 IMMEDIATE PREVIOUS EPISODE (Episode ${episodeNumber - 1}): "${prevEpTitle}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL: This is the episode immediately before the current one. Reference it extensively.`
    
    if (prevEpSynopsis) {
      previousEpisodeContext += `\n\nSynopsis: ${prevEpSynopsis}`
    }
    
    if (prevEpScenes.length > 0) {
      previousEpisodeContext += `\n\nPrevious Episode Scenes (FULL CONTENT - Use for continuity):`
      prevEpScenes.forEach((scene: any, index: number) => {
        const sceneTitle = scene.title || `Scene ${scene.sceneNumber || index + 1}`
        const sceneContent = scene.content || scene.screenplay || scene.sceneContent || ''
        // Include full scene content for better context
        previousEpisodeContext += `\n\n${sceneTitle}:\n${sceneContent}`
      })
    }
  }
  
  // Previous choice context
  const previousContext = previousChoice 
    ? `${allPreviousEpisodesContext}${previousEpisodeContext}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PREVIOUS CHOICE: "${previousChoice}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 NARRATIVE PROGRESSION REQUIREMENTS (When Previous Choice Exists):
- START from where the previous episode ended - reference specific events, characters, and situations from the previous episode above
- Show the immediate aftermath and consequences of the previous episode's ending
- Build GRADUALLY toward the chosen option - do NOT jump directly to showing its consequences
- Show the journey, complications, and development that lead to the chosen option's narrative moment
- Create a natural progression that feels like events unfolding, not a sudden jump
- END on a specific emotional note (high/low, good/bad) that reflects the choice's impact
- The chosen option should feel like the natural culmination of the episode's buildup, not the starting point`
    : `${allPreviousEpisodesContext}${previousEpisodeContext}`

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 COMPLETE STORY BIBLE CONTEXT (USE ALL OF THIS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${storyBibleContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL: The story bible above includes TECHNICAL SECTIONS marked as "(TECHNICAL)" - these are MANDATORY guidance:
- TENSION STRATEGY: Use this to structure emotional peaks, escalation, and release moments
- CHOICE ARCHITECTURE: Reference this when building toward meaningful character decisions
- LIVING WORLD DYNAMICS: Incorporate background events, social dynamics, and world reactivity
- TROPE ANALYSIS: Apply genre tropes authentically and subvert where appropriate
- COHESION ANALYSIS: Maintain plot/character/thematic consistency with previous episodes
- DIALOGUE STRATEGY: Match character voices, speech patterns, and subtext techniques
- GENRE ENHANCEMENT: Follow visual style, pacing, and audience expectations
- THEME INTEGRATION: Weave themes through character actions and plot, not just symbolism
- PREMISE INTEGRATION: Ensure episode serves the core premise and maintains consistency
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

⚠️ **CRITICAL FIRST STEP:**
1. COUNT how many beats are in the beat sheet above
2. Write down that number
3. Before returning your response, verify you included EXACTLY that many beats
4. If the number doesn't match, you MUST add the missing beats

ADAPTATION REQUIREMENTS (MANDATORY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ CRITICAL RULES - MUST FOLLOW:

1. BEAT SHEET STRUCTURE (CRITICAL - ABSOLUTE REQUIREMENT):
   
   ⚠️ **BEAT INCLUSION - ABSOLUTE MANDATE - NO EXCEPTIONS:**
   - **EVERY SINGLE BEAT from the beat sheet MUST appear in the final episode**
   - **NO BEATS CAN BE SKIPPED, OMITTED, REMOVED, OR IGNORED**
   - **IF THE BEAT SHEET HAS 9 BEATS, ALL 9 MUST BE IN THE EPISODE**
   - **IF THE BEAT SHEET HAS 6 BEATS, ALL 6 MUST BE IN THE EPISODE**
   - **IF THE BEAT SHEET HAS 4 BEATS, ALL 4 MUST BE IN THE EPISODE**
   - **COUNT THE BEATS IN THE BEAT SHEET - THAT IS YOUR MANDATORY MINIMUM SCENE COUNT**
   - Each beat must be clearly represented - preferably as its own dedicated scene
   - When combining beats, ensure ALL combined beats are FULLY present, not abbreviated
   - **DO NOT REMOVE SCENES - DO NOT SKIP BEATS - DO NOT CONDENSE BEYOND RECOGNIZABILITY**
   
   ⚠️ **SCENE COUNT - UNLIMITED AND BEAT-DRIVEN:**
   - **THERE IS NO SCENE LIMIT - use as many scenes as needed to include ALL beats**
   - **IF THE BEAT SHEET HAS 9 BEATS, CREATE AT LEAST 9 SCENES (one per beat)**
   - **IF THE BEAT SHEET HAS 6 BEATS, CREATE AT LEAST 6 SCENES (one per beat)**
   - **THE SCENE COUNT MUST MATCH OR EXCEED THE BEAT COUNT**
   - **DO NOT DEFAULT TO 3 SCENES - COUNT THE BEATS AND CREATE THAT MANY SCENES**
   - **EACH BEAT DESERVES ITS OWN SCENE - DO NOT COMBINE UNLESS ABSOLUTELY NECESSARY**
   - Each scene must be substantial and fully developed
   - Quality AND completeness: Every scene must be deep AND every beat must be included
   - **REMOVING SCENES IS FORBIDDEN - REMOVING BEATS IS FORBIDDEN**

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

⚠️ BEFORE YOU RETURN YOUR RESPONSE - MANDATORY VERIFICATION:
   
   **STEP 1: BEAT VERIFICATION (CRITICAL - DO THIS FIRST):**
   1. Count how many beats are in the beat sheet above
   2. List each beat by name/number
   3. Go through your scenes and verify EACH beat appears
   4. If ANY beat is missing, ADD IT before returning
   5. If you combined beats, verify BOTH beats are fully present in that scene
   
   **STEP 2: SCENE COUNT VERIFICATION:**
   - COUNT the beats in the beat sheet: _____
   - COUNT the scenes you created: _____
   - **THE SCENE COUNT MUST MATCH OR EXCEED THE BEAT COUNT**
   - **IF YOU HAVE 9 BEATS, YOU MUST HAVE AT LEAST 9 SCENES**
   - **IF YOU HAVE 6 BEATS, YOU MUST HAVE AT LEAST 6 SCENES**
   - **IF YOUR SCENE COUNT IS LESS THAN YOUR BEAT COUNT, YOU HAVE FAILED**
   - Create additional scenes to match the beat count - one scene per beat minimum
   
   **STEP 3: QUALITY VERIFICATION:**
   - Check tone matches vibe setting (reread your content - is it actually dark/light as requested?)
   - Confirm pacing is appropriate (are scenes slow/fast as requested?)
   - Ensure ALL director's notes are incorporated
   - Confirm each scene is fully developed, not rushed or shallow
   ${dialogueLanguage !== 'english' ? `- VERIFY all dialogue is written in ${dialogueLanguage.toUpperCase()} with cultural authenticity` : ''}
   
   **IF YOU SKIP EVEN ONE BEAT, YOU HAVE FAILED. REVISE AND INCLUDE IT.**

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
    // ⚠️ CRITICAL: Create as many scenes as needed to include ALL beats. Scene count is unlimited - use however many scenes are required to represent EVERY beat from the beat sheet.
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

Transform the beat sheet into cinematic storytelling that perfectly executes the vibe settings and director's vision while maintaining the authentic voice and world of the series.

⚠️ **FINAL VERIFICATION BEFORE RETURNING - MANDATORY:**
1. Count beats in beat sheet: _____
2. Count scenes you created: _____
3. **SCENE COUNT MUST EQUAL OR EXCEED BEAT COUNT** - If you have 9 beats, you need 9+ scenes
4. Count beats in your episode: _____
5. **BEAT COUNT MUST MATCH BEAT SHEET COUNT EXACTLY** - If NO, add missing beats NOW.
6. List each beat and where it appears:
   - Beat 1: Scene _____ (MUST EXIST)
   - Beat 2: Scene _____ (MUST EXIST)
   - Beat 3: Scene _____ (MUST EXIST)
   - Beat 4: Scene _____ (MUST EXIST)
   - Beat 5: Scene _____ (MUST EXIST)
   - Beat 6: Scene _____ (MUST EXIST)
   - Beat 7: Scene _____ (MUST EXIST)
   - Beat 8: Scene _____ (MUST EXIST)
   - Beat 9: Scene _____ (MUST EXIST)
   - [Continue for ALL beats - if beat sheet has 9 beats, list all 9]
7. **IF ANY BEAT IS MISSING, YOU MUST ADD IT BEFORE RETURNING**
8. **IF SCENE COUNT IS LESS THAN BEAT COUNT, YOU MUST CREATE MORE SCENES**

**IF YOU RETURN WITHOUT ALL BEATS OR WITH FEWER SCENES THAN BEATS, YOU HAVE FAILED THE TASK.**`
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
