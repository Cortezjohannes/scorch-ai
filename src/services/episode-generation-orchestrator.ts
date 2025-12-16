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
import { EngineAIRouter } from './engine-ai-router'
import { logger } from './console-logger'

export interface OrchestratorRequest {
  storyBible: any
  episodeNumber: number
  previousChoice?: string
  previousEpisode?: any // Immediate previous episode data (scenes, synopsis, content, etc.)
  allPreviousEpisodes?: any[] // ALL previous episodes for full context (for choice generation)
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
  const { storyBible, episodeNumber, previousChoice, previousEpisode, allPreviousEpisodes, userChoices } = request
  
  try {
    logger.startNewSession(`Orchestrated Episode ${episodeNumber} Generation`)
    logger.milestone('Using intelligent defaults workflow')
    
    // STEP 1: Analyze story and get intelligent settings
    console.log(`🎭 Orchestrator: Analyzing story for episode ${episodeNumber}...`)
    const analyzedSettings = await analyzeStoryForEpisodeGeneration(
      storyBible,
      episodeNumber,
      previousChoice,
      previousEpisode
    )
    
    logger.milestone(`Intelligent settings: Tone ${analyzedSettings.vibeSettings.tone}, Pacing ${analyzedSettings.vibeSettings.pacing}`)
    
    // STEP 2: Generate beat sheet with analyzed goal
    console.log(`📋 Orchestrator: Generating beat sheet...`)
    const beatSheet = await generateBeatSheet(
      storyBible,
      episodeNumber,
      analyzedSettings.episodeGoal,
      previousChoice,
      previousEpisode
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
      previousChoice,
      previousEpisode,
      allPreviousEpisodes
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
  previousChoice?: string,
  previousEpisode?: any
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
  
  // Build previous episode context
  let previousEpisodeContext = ''
  if (previousEpisode) {
    const prevEpTitle = previousEpisode.title || previousEpisode.episodeTitle || `Episode ${episodeNumber - 1}`
    const prevEpSynopsis = previousEpisode.synopsis || ''
    const prevEpScenes = previousEpisode.scenes || []
    
    previousEpisodeContext = `\n\nPREVIOUS EPISODE (Episode ${episodeNumber - 1}): "${prevEpTitle}"`
    
    if (prevEpSynopsis) {
      previousEpisodeContext += `\nSynopsis: ${prevEpSynopsis}`
    }
    
    if (prevEpScenes.length > 0) {
      previousEpisodeContext += `\n\nPrevious Episode Scenes:`
      prevEpScenes.forEach((scene: any, index: number) => {
        const sceneTitle = scene.title || `Scene ${scene.sceneNumber || index + 1}`
        const sceneContent = scene.content || scene.screenplay || scene.sceneContent || ''
        // Include first 300 chars of each scene for context
        const contentPreview = sceneContent.substring(0, 300) + (sceneContent.length > 300 ? '...' : '')
        previousEpisodeContext += `\n\n${sceneTitle}:\n${contentPreview}`
      })
    }
  }
  
  const previousContext = previousChoice 
    ? `${previousEpisodeContext}\n\nPREVIOUS CHOICE: "${previousChoice}"

CRITICAL NARRATIVE STRUCTURE REQUIREMENTS:
When a previous choice exists, the beat sheet MUST follow this progression:
1. START: Show the immediate aftermath and consequences of the previous episode's ending
   - Reference specific events, characters, and situations from the previous episode above
   - Where do the characters find themselves after the choice was made?
   - What are the immediate reactions and ripple effects?
   
2. MIDDLE: Build tension, conflict, and development leading toward the chosen option
   - Create escalating complications that naturally lead to the chosen option's narrative moment
   - Develop character motivations, conflicts, and situations that build toward the choice
   - DO NOT jump directly to the choice's consequences - show the journey there
   
3. END: Place the chosen option's narrative beat near the end (final 1-2 beats)
   - The chosen option should feel like the natural culmination of the episode's buildup
   - The final beat should end on a specific emotional note (high/low, good/bad) reflecting the choice's impact
   - Set up the consequences for the next episode, but don't fully resolve them yet

The episode should feel like a gradual progression toward the chosen option, not a sudden jump.`
    : previousEpisodeContext
  
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
- Include specific actions, not vague descriptions${previousChoice ? '\n\nWhen a previous choice exists:\n- Start with the immediate aftermath of the previous episode\n- Build gradually toward the chosen option (don\'t jump to consequences)\n- Place the chosen option\'s narrative moment near the end\n- End on a specific emotional note (high/low, good/bad)' : ''}

Format each beat clearly (e.g., "Beat 1:", "Beat 2:", etc.)`

  const systemPrompt = `You are a master story architect specializing in episode structure and narrative beats. You create detailed, flexible beat sheets that serve as the structural foundation for cinematic episodes.

CRITICAL: Use the comprehensive story bible context (including tension strategy, dialogue patterns, genre conventions, trope analysis, theme integration, choice architecture, living world dynamics, and cohesion guidelines) to inform your beat sheet:
- Apply the TENSION STRATEGY to structure rising/falling action and emotional beats
- Consider CHOICE ARCHITECTURE when planning pivotal moments and decision points
- Use TROPE ANALYSIS to balance genre expectations with fresh storytelling
- Integrate THEME throughout the beats (don't save it for the end)
- Reference DIALOGUE STRATEGY for character voice consistency
- Incorporate LIVING WORLD elements to make the setting feel reactive and alive
- Follow COHESION ANALYSIS guidelines to maintain consistency with previous episodes

Return ONLY the beat sheet content - no JSON, no explanations, just the structured beats.`

  console.log('🚀 [GEMINI] Generating beat sheet with Gemini 3 Pro Preview...')
  const response = await EngineAIRouter.generateContent({
    prompt,
    systemPrompt,
    temperature: 0.85,
    maxTokens: 2000,
    engineId: 'beat-sheet-generator',
    forceProvider: 'gemini' // Use Gemini 3 Pro Preview for creative tasks
  })
  
  console.log(`✅ [GEMINI] Beat sheet generated: ${response.metadata.contentLength} chars using ${response.model}`)
  return response.content
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
  previousChoice?: string,
  previousEpisode?: any,
  allPreviousEpisodes?: any[]
): Promise<any> {
  
  const scriptPrompt = buildScriptPrompt(
    storyBible,
    episodeNumber,
    beatSheet,
    vibeSettings,
    directorsNotes,
    previousChoice,
    previousEpisode,
    allPreviousEpisodes
  )
  
  const systemPrompt = `You are a master storyteller with expertise in creating engaging narrative prose episodes. You excel at:

🎬 NARRATIVE ARCHITECTURE:
- Create multi-layered conflicts (internal vs external, character vs world, ideal vs reality)
- Ensure character consistency using full story context
- Build tension naturally through escalating stakes and challenges (follow TENSION STRATEGY from story bible)
- Structure scenes for maximum emotional impact and pacing
- Connect episodes through callbacks and character development arcs

✍️ PROSE & DIALOGUE:
- Write rich narrative prose that reads like a great novel (NOT screenplay format)
- Create authentic dialogue with subtext that reveals character psychology
- Show character emotions through action, thought, and sensory details
- Develop distinct voices for each character (follow DIALOGUE STRATEGY from story bible)
- Weave dialogue naturally into narrative flow
- Use character-specific speech patterns and voices defined in the story bible

🌍 WORLD & ATMOSPHERE:
- Create immersive sensory details that make the world feel alive
- Build atmosphere through environment, weather, lighting, sounds
- Use setting to reflect character emotional states
- Make the world reactive to character actions (incorporate LIVING WORLD DYNAMICS)
- Integrate theme through environmental storytelling
- Include background events and social dynamics that make the world feel real

🎭 GENRE & ENGAGEMENT:
- Apply genre conventions authentically while innovating (reference GENRE ENHANCEMENT and TROPE ANALYSIS)
- Balance formula with surprise - subvert expected tropes when appropriate
- Create moments that resonate emotionally
- Build toward meaningful character choices (informed by CHOICE ARCHITECTURE)
- Maintain series continuity and consequences (follow COHESION ANALYSIS)

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

🎯 STORY BIBLE INTEGRATION (CRITICAL):
- Use TENSION STRATEGY to structure emotional peaks and valleys
- Apply DIALOGUE STRATEGY for consistent character voices
- Incorporate LIVING WORLD DYNAMICS for immersive background details
- Reference TROPE ANALYSIS to balance expectations with innovation
- Follow THEME INTEGRATION to weave themes throughout (not just symbolism)
- Use CHOICE ARCHITECTURE to create meaningful branching moments
- Maintain COHESION with previous episodes and character arcs
- Apply GENRE ENHANCEMENT for visual style and audience expectations

You create episodes that are enjoyable to READ and REVIEW, making the narrative prose engaging before it becomes a script.`

  console.log('🚀 [GEMINI] Generating episode content with Gemini 3 Pro Preview...')
  const response = await EngineAIRouter.generateContent({
    prompt: scriptPrompt,
    systemPrompt,
    temperature: 0.9, // Maximum creativity for final script
    maxTokens: 8000,
    engineId: 'episode-generator',
    forceProvider: 'gemini' // Use Gemini 3 Pro Preview for creative writing
  })
  
  console.log(`✅ [GEMINI] Episode generated: ${response.metadata.contentLength} chars using ${response.model}`)
  
  // Parse the result
  let parsedEpisode
  try {
    parsedEpisode = JSON.parse(response.content)
  } catch (parseError) {
    // Try to extract JSON from markdown blocks
    const jsonMatch = response.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
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
 * Select relevant characters for an episode based on arc and narrative context
 */
function selectRelevantCharacters(
  storyBible: any,
  episodeNumber: number
): any[] {
  if (!storyBible.mainCharacters || !Array.isArray(storyBible.mainCharacters)) {
    return [];
  }
  
  const allCharacters = storyBible.mainCharacters;
  
  // If we have 5 or fewer characters, include them all
  if (allCharacters.length <= 5) {
    return allCharacters;
  }
  
  // Find current narrative arc
  let currentArcCharacters: Set<string> = new Set();
  if (storyBible.narrativeArcs && Array.isArray(storyBible.narrativeArcs)) {
    let episodeCount = 0;
    for (const arc of storyBible.narrativeArcs) {
      const arcEpisodeCount = arc.episodes?.length || 10;
      if (episodeNumber <= episodeCount + arcEpisodeCount) {
        // This is the current arc
        // Extract character names mentioned in arc summary or episodes
        const arcText = (arc.summary || '') + ' ' + (arc.title || '');
        allCharacters.forEach((char: any) => {
          if (arcText.includes(char.name)) {
            currentArcCharacters.add(char.name);
          }
        });
        
        // Check if arc has character focus information
        if (arc.focusCharacters && Array.isArray(arc.focusCharacters)) {
          arc.focusCharacters.forEach((name: string) => currentArcCharacters.add(name));
        }
        
        break;
      }
      episodeCount += arcEpisodeCount;
    }
  }
  
  // Always include protagonists (characters with premiseRole like 'protagonist' or first 2 characters)
  const relevantCharacters = allCharacters.filter((char: any, index: number) => {
    // Include if:
    // 1. They're a protagonist/main character (first 2-3 characters or have 'protagonist' role)
    if (index < 2) return true;
    if (char.premiseRole && (char.premiseRole.toLowerCase().includes('protagonist') || 
        char.premiseRole.toLowerCase().includes('main'))) return true;
    if (char.archetype && (char.archetype.toLowerCase().includes('protagonist') || 
        char.archetype.toLowerCase().includes('hero'))) return true;
    
    // 2. They're mentioned in the current arc
    if (currentArcCharacters.has(char.name)) return true;
    
    // 3. They have relationships with included characters (check relationships)
    if (char.relationships) {
      const relText = typeof char.relationships === 'string' ? 
        char.relationships : JSON.stringify(char.relationships);
      // Check if any already-included character is mentioned in relationships
      for (let i = 0; i < Math.min(3, allCharacters.length); i++) {
        if (relText.includes(allCharacters[i].name)) return true;
      }
    }
    
    return false;
  });
  
  // If we filtered too much, ensure at least 3-4 characters are included
  if (relevantCharacters.length < 3 && allCharacters.length >= 3) {
    return allCharacters.slice(0, Math.min(5, allCharacters.length));
  }
  
  return relevantCharacters;
}

/**
 * Build comprehensive story bible context for prompts
 */
function buildComprehensiveStoryBibleContext(storyBible: any, episodeNumber?: number): string {
  if (!storyBible) return 'No story bible provided.';
  
  const sections: string[] = [];
  
  // Core Identity + Series Overview (BIG PICTURE)
  sections.push('=== SERIES IDENTITY & OVERVIEW ===');
  if (storyBible.seriesTitle) sections.push(`Series Title: ${storyBible.seriesTitle}`);
  if (storyBible.genre) sections.push(`Genre: ${storyBible.genre}`);
  if (storyBible.tone) sections.push(`Tone: ${storyBible.tone}`);
  if (storyBible.targetAudience) {
    const audience = typeof storyBible.targetAudience === 'string' 
      ? storyBible.targetAudience 
      : storyBible.targetAudience.primary || storyBible.targetAudience.primaryAudience || '';
    if (audience) sections.push(`Target Audience: ${audience}`);
  }
  
  // CRITICAL: Add Series Overview for big picture context
  if (storyBible.seriesOverview) {
    sections.push(`\nSERIES OVERVIEW (Big Picture):`);
    sections.push(storyBible.seriesOverview);
  } else if (storyBible.synopsis) {
    sections.push(`\nSynopsis: ${storyBible.synopsis}`);
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
  
  // Characters (filtered by relevance if episodeNumber provided)
  const charactersToInclude = episodeNumber ? 
    selectRelevantCharacters(storyBible, episodeNumber) : 
    storyBible.mainCharacters || [];
    
  if (charactersToInclude.length > 0) {
    sections.push('\n=== CHARACTERS ===');
    if (episodeNumber && storyBible.mainCharacters && 
        charactersToInclude.length < storyBible.mainCharacters.length) {
      sections.push(`(Showing ${charactersToInclude.length} of ${storyBible.mainCharacters.length} characters relevant to Episode ${episodeNumber})`);
    }
    charactersToInclude.forEach((char: any, index: number) => {
      const charDetails: string[] = [];
      charDetails.push(`${index + 1}. ${char.name || 'Unnamed Character'}`);
      if (char.archetype || char.premiseRole) charDetails.push(`   Archetype/Role: ${char.archetype || char.premiseRole}`);
      if (char.description) {
        const desc = typeof char.description === 'string' ? char.description : JSON.stringify(char.description);
        charDetails.push(`   Description: ${desc}`);
      }
      
      // CRITICAL: Add Psychology (want, need, fear, goals)
      if (char.psychology) {
        charDetails.push(`   PSYCHOLOGY:`);
        if (char.psychology.want) charDetails.push(`     - Want (external goal): ${char.psychology.want}`);
        if (char.psychology.need) charDetails.push(`     - Need (internal): ${char.psychology.need}`);
        if (char.psychology.fear || char.psychology.fears) {
          const fearText = typeof char.psychology.fears === 'string' ? char.psychology.fears : 
                          Array.isArray(char.psychology.fears) ? char.psychology.fears.join(', ') : 
                          char.psychology.fear || '';
          if (fearText) charDetails.push(`     - Fears: ${fearText}`);
        }
        if (char.psychology.goals) charDetails.push(`     - Goals: ${char.psychology.goals}`);
        if (char.psychology.values) charDetails.push(`     - Values: ${char.psychology.values}`);
        if (char.psychology.temperament) charDetails.push(`     - Temperament: ${char.psychology.temperament}`);
        if (char.psychology.flaw || char.psychology.primaryFlaw) charDetails.push(`     - Flaw: ${char.psychology.flaw || char.psychology.primaryFlaw}`);
      }
      
      // CRITICAL: Add Sociology (occupation, class, background)
      if (char.sociology) {
        charDetails.push(`   SOCIOLOGY:`);
        if (char.sociology.occupation) charDetails.push(`     - Occupation: ${char.sociology.occupation}`);
        if (char.sociology.class) charDetails.push(`     - Social Class: ${char.sociology.class}`);
        if (char.sociology.education) charDetails.push(`     - Education: ${char.sociology.education}`);
        if (char.sociology.homeLife) charDetails.push(`     - Home Life: ${char.sociology.homeLife}`);
        if (char.sociology.economicStatus) charDetails.push(`     - Economic Status: ${char.sociology.economicStatus}`);
      }
      
      // CRITICAL: Add Physiology (age, appearance, physical traits)
      if (char.physiology) {
        charDetails.push(`   PHYSIOLOGY:`);
        if (char.physiology.age) charDetails.push(`     - Age: ${char.physiology.age}`);
        if (char.physiology.gender) charDetails.push(`     - Gender: ${char.physiology.gender}`);
        if (char.physiology.appearance) charDetails.push(`     - Appearance: ${char.physiology.appearance}`);
        if (char.physiology.build) charDetails.push(`     - Build: ${char.physiology.build}`);
        if (char.physiology.physicalTraits && Array.isArray(char.physiology.physicalTraits)) {
          charDetails.push(`     - Physical Traits: ${char.physiology.physicalTraits.join(', ')}`);
        }
      }
      
      // Legacy fields (fallback if psychology/sociology/physiology not available)
      if (char.background && !char.sociology) {
        const bg = typeof char.background === 'string' ? char.background : JSON.stringify(char.background);
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
      if (char.motivation && !char.psychology) charDetails.push(`   Motivation: ${char.motivation}`);
      if (char.internalConflict) charDetails.push(`   Internal Conflict: ${char.internalConflict}`);
      if (char.voice) charDetails.push(`   Voice: ${char.voice}`);
      sections.push(charDetails.join('\n'));
    });
  }
  
  // World Building (CRITICAL: Include rules and key locations)
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
      
      // CRITICAL: World Rules are core to story consistency
      if (storyBible.worldBuilding.rules) {
        sections.push(`\nWORLD RULES (CRITICAL - Maintain these):`);
        if (Array.isArray(storyBible.worldBuilding.rules)) {
          sections.push(storyBible.worldBuilding.rules.map((r: string) => `- ${r}`).join('\n'));
        } else if (typeof storyBible.worldBuilding.rules === 'string') {
          sections.push(storyBible.worldBuilding.rules);
        }
      }
      
      // CRITICAL: Key Locations with full details (atmosphere, significance)
      if (storyBible.worldBuilding.locations && Array.isArray(storyBible.worldBuilding.locations)) {
        sections.push('\nKEY LOCATIONS (Use these for authenticity):');
        storyBible.worldBuilding.locations.forEach((loc: any) => {
          const locDetails: string[] = [];
          if (loc.name) locDetails.push(`  📍 ${loc.name}`);
          if (loc.type) locDetails.push(`     Type: ${loc.type}`);
          if (loc.description) {
            const desc = typeof loc.description === 'string' ? loc.description : JSON.stringify(loc.description);
            locDetails.push(`     Description: ${desc}`);
          }
          if (loc.significance) locDetails.push(`     Significance: ${loc.significance}`);
          if (loc.atmosphere) locDetails.push(`     Atmosphere: ${loc.atmosphere}`);
          if (loc.recurringEvents && Array.isArray(loc.recurringEvents)) {
            locDetails.push(`     Recurring Events: ${loc.recurringEvents.join(', ')}`);
          }
          if (loc.conflicts && Array.isArray(loc.conflicts)) {
            locDetails.push(`     Conflicts: ${loc.conflicts.join(', ')}`);
          }
          sections.push(locDetails.join('\n'));
        });
      }
      
      // Additional world building fields
      if (storyBible.worldBuilding.timePeriod) sections.push(`\nTime Period: ${storyBible.worldBuilding.timePeriod}`);
      if (storyBible.worldBuilding.culturalContext) sections.push(`Cultural Context: ${storyBible.worldBuilding.culturalContext}`);
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
  
  // Tension Strategy (from Technical Tab)
  if (storyBible.tensionStrategy) {
    sections.push('\n=== TENSION STRATEGY ===');
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
    sections.push('\n=== CHOICE ARCHITECTURE ===');
    const choice = storyBible.choiceArchitecture;
    if (choice.rawContent) {
      sections.push(typeof choice.rawContent === 'string' ? choice.rawContent : JSON.stringify(choice.rawContent));
    } else {
      if (choice.keyDecisions) sections.push(`Key Decisions: ${choice.keyDecisions}`);
      if (choice.moralChoices) sections.push(`Moral Choices: ${choice.moralChoices}`);
      if (choice.consequenceMapping) sections.push(`Consequence Mapping: ${choice.consequenceMapping}`);
      if (choice.branchingStructure) sections.push(`Branching Structure: ${choice.branchingStructure}`);
    }
  }
  
  // Living World Dynamics (from Technical Tab)
  if (storyBible.livingWorldDynamics) {
    sections.push('\n=== LIVING WORLD DYNAMICS ===');
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
    sections.push('\n=== TROPE ANALYSIS ===');
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
    sections.push('\n=== COHESION ANALYSIS ===');
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
    sections.push('\n=== DIALOGUE STRATEGY ===');
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
    sections.push('\n=== GENRE ENHANCEMENT ===');
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
    sections.push('\n=== THEME INTEGRATION ===');
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
    sections.push('\n=== PREMISE INTEGRATION ===');
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

/**
 * Build the comprehensive script prompt (adapted from episode-from-beats route)
 */
function buildScriptPrompt(
  storyBible: any,
  episodeNumber: number,
  beatSheet: string,
  vibeSettings: any,
  directorsNotes: string,
  previousChoice?: string,
  previousEpisode?: any,
  allPreviousEpisodes?: any[]
): string {
  // Build comprehensive story bible context with character filtering
  const storyBibleContext = buildComprehensiveStoryBibleContext(storyBible, episodeNumber);
  
  const seriesTitle = storyBible.seriesTitle || 'Untitled Series'
  const genre = storyBible.genre || 'Drama'
  const premise = storyBible.premise?.premiseStatement || 'A story unfolds...'

  // Vibe direction
  const vibeDirection = `
VIBE SETTINGS:
- Tone: ${vibeSettings.tone}/100 (${getToneLabel(vibeSettings.tone)})
- Pacing: ${vibeSettings.pacing}/100 (${getPacingLabel(vibeSettings.pacing)})
- Dialogue: ${vibeSettings.dialogueStyle}/100 (${getDialogueLabel(vibeSettings.dialogueStyle)})`

  const directorVision = directorsNotes ? `\n\nDIRECTOR'S NOTES:\n${directorsNotes}` : ''
  
  // Build ALL previous episodes context for full story continuity
  let allPreviousEpisodesContext = ''
  if (allPreviousEpisodes && allPreviousEpisodes.length > 0) {
    allPreviousEpisodesContext = `\n\n📺 ALL PREVIOUS EPISODES (Full Story Context):`
    
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
      
      allPreviousEpisodesContext += `\n\nEpisode ${epNum}: "${epTitle}"`
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
          // Include scene preview (first 300 chars)
          const preview = sceneContent.substring(0, 300) + (sceneContent.length > 300 ? '...' : '')
          allPreviousEpisodesContext += `\n\n  ${sceneTitle}:\n  ${preview}`
        })
      }
    })
  }
  
  // Build immediate previous episode context (full detail)
  let previousEpisodeContext = ''
  if (previousEpisode) {
    const prevEpTitle = previousEpisode.title || previousEpisode.episodeTitle || `Episode ${episodeNumber - 1}`
    const prevEpSynopsis = previousEpisode.synopsis || ''
    const prevEpScenes = previousEpisode.scenes || []
    
    previousEpisodeContext = `\n\nPREVIOUS EPISODE (Episode ${episodeNumber - 1}): "${prevEpTitle}"`
    
    if (prevEpSynopsis) {
      previousEpisodeContext += `\nSynopsis: ${prevEpSynopsis}`
    }
    
    if (prevEpScenes.length > 0) {
      previousEpisodeContext += `\n\nPrevious Episode Scenes:`
      prevEpScenes.forEach((scene: any, index: number) => {
        const sceneTitle = scene.title || `Scene ${scene.sceneNumber || index + 1}`
        const sceneContent = scene.content || scene.screenplay || scene.sceneContent || ''
        // Include full scene content for better context
        previousEpisodeContext += `\n\n${sceneTitle}:\n${sceneContent}`
      })
    }
  }
  
  const previousContext = previousChoice 
    ? `${allPreviousEpisodesContext}${previousEpisodeContext}\n\nPREVIOUS CHOICE: "${previousChoice}"

🔗 NARRATIVE PROGRESSION REQUIREMENTS (When Previous Choice Exists):
- START from where the previous episode ended - reference specific events, characters, and situations from the previous episode above
- Show the immediate aftermath and consequences of the previous episode's ending
- Build GRADUALLY toward the chosen option - do NOT jump directly to showing its consequences
- Show the journey, complications, and development that lead to the chosen option's narrative moment
- Create a natural progression that feels like events unfolding, not a sudden jump
- END on a specific emotional note (high/low, good/bad) that reflects the choice's impact
- The chosen option should feel like the natural culmination of the episode's buildup, not the starting point`
    : `${allPreviousEpisodesContext}${previousEpisodeContext}`

  return `Create Episode ${episodeNumber} of "${seriesTitle}" based on the provided beat sheet and creative direction.

${storyBibleContext}

${vibeDirection}${directorVision}${previousContext}

BEAT SHEET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${beatSheet}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 CRITICAL: This is a 5-MINUTE SHORT-FORM EPISODE (NOT a full TV episode!)

🎯 LEVERAGE STORY BIBLE TECHNICAL TABS:
The story bible contains rich technical guidance - USE IT:
- TENSION STRATEGY: Follow the tension curve, use escalation techniques, place emotional beats strategically
- DIALOGUE STRATEGY: Match character voices, use their speech patterns, incorporate subtext
- CHOICE ARCHITECTURE: Build toward the meaningful choices defined in the architecture
- LIVING WORLD: Include background events, show social dynamics, make the world feel reactive
- TROPE ANALYSIS: Apply genre tropes authentically, subvert where appropriate
- COHESION: Maintain consistency with plot/character/theme from previous episodes
- THEME INTEGRATION: Weave theme through character actions and plot, not just symbolism
- GENRE ENHANCEMENT: Match the visual style and pacing expectations

Transform the beat sheet into a complete, cinematic episode with 2-3 SUBSTANTIAL SCENES:
- 5-minute runtime = 2-3 scenes MAXIMUM (each scene 2-2.5 minutes)
- Fewer, deeper scenes are MUCH better than many shallow ones
- Each scene must be rich, immersive, and fully developed
- Combine multiple beats into single powerful scenes if needed

${previousChoice ? `\n📈 NARRATIVE FLOW (With Previous Choice):
- Follow the beat sheet's gradual progression - start with aftermath, build to the choice
- Each scene should advance the story toward the chosen option's narrative moment
- Show the consequences and complications that arise from the previous episode
- Build tension and character development naturally, leading to the chosen option
- End the episode on a clear emotional note (high/low, good/bad) that reflects where the story now stands
- DO NOT start the episode with the chosen option already in effect - show how we get there\n` : ''}

Apply ALL vibe settings precisely. Create compelling branching choices that emerge from the story.

🎯 CRITICAL CHOICE GENERATION REQUIREMENTS:
The branching options MUST:
1. DIRECTLY emerge from THIS episode's final scene's specific events, dialogue, conflicts, or revelations
2. Reference EXACT character names, relationships, objects, locations, or information from THIS episode
3. Reference and build upon events, character arcs, and plot threads from ALL previous episodes shown above
4. Show continuity with the full story - reference past choices, character development, and ongoing conflicts
5. Allow ANY character (not just the protagonist) to take decisive action based on episode events
6. Present genuine moral dilemmas, strategic decisions, or relationship choices from the episode
7. Create consequences that will fundamentally alter the next episode's story direction
8. NEVER use generic templates or make up events that didn't happen - each choice must be grounded in actual story events
9. Focus on pivotal moments: betrayals, discoveries, confrontations, alliances, secrets revealed, etc.
10. EXACTLY 3 choices total - no more, no less
11. Mark EXACTLY ONE choice as "isCanonical: true" - the choice that best aligns with the story bible's premise, themes, and character arcs

IMPORTANT: Choices must reference actual events, characters, and situations from the previous episodes above. Do NOT invent new plot points or characters that haven't been established in the story.

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
    {"id": 1, "text": "Choice text that references specific events from this and previous episodes", "isCanonical": true},
    {"id": 2, "text": "Choice text that references specific events from this and previous episodes", "isCanonical": false},
    {"id": 3, "text": "Choice text that references specific events from this and previous episodes", "isCanonical": false}
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











