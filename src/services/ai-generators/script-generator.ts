/**
 * Script Generator - AI Service
 * Generates industry-standard Hollywood-quality screenplays for 5-minute episodes
 * 
 * Uses actual EngineAIRouter with Gemini 3 Pro Preview
 * 
 * Standards:
 * - 1 page = 1 minute of screen time (target: 5 pages for 5-minute episodes)
 * - Proper screenplay formatting (slug lines, action, dialogue, etc.)
 * - Based ONLY on specific episode content - NO new narrative elements
 */

import { EngineAIRouter } from '@/services/engine-ai-router'
import type { Episode } from '@/services/episode-service'

interface ScriptGenerationParams {
  episode: Episode
  storyBible: any
  previousEpisode?: any
  allPreviousEpisodes?: any[]
  existingPreProductionData?: any
}

interface GeneratedScript {
  title: string
  episodeNumber: number
  pages: ScriptPage[]
  metadata: {
    pageCount: number
    sceneCount: number
    characterCount: number
    estimatedRuntime: string
    generatedAt: number
  }
}

interface ScriptPage {
  pageNumber: number
  elements: ScriptElement[]
}

interface ScriptElement {
  type: 'slug' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'page-break'
  content: string
  metadata?: {
    sceneNumber?: number
    characterName?: string
  }
}

/**
 * Generate a professional screenplay from episode content
 */
export async function generateScript(params: ScriptGenerationParams): Promise<GeneratedScript> {
  const { episode, storyBible, previousEpisode, allPreviousEpisodes, existingPreProductionData } = params
  
  // Extract vibe settings from episode metadata if available
  const vibeSettings = (episode as any).vibeSettings || (episode as any).generationSettings?.vibeSettings || null

  console.log('🎬 Generating screenplay for Episode', episode.episodeNumber)
  console.log('📄 Target: 5 pages (~5 minutes screen time)')

  // Build comprehensive context
  const systemPrompt = buildSystemPrompt(vibeSettings)
  const userPrompt = buildUserPrompt(params)

  try {
    // Use actual EngineAIRouter with Gemini 3 Pro Preview
    const response = await EngineAIRouter.generateContent({
      prompt: userPrompt,
      systemPrompt: systemPrompt,
      temperature: 0.8, // Creative but controlled
      maxTokens: 16000, // Enough for 5-page screenplay
      engineId: 'script-generator',
      forceProvider: 'gemini' // Gemini excels at creative writing
    })

    console.log('✅ AI Response received:', response.metadata.contentLength, 'characters')
    
    // Parse the generated script into structured format
    const structuredScript = parseScriptIntoStructure(response.content, episode)
    
    console.log('✅ Screenplay generated:', structuredScript.metadata.pageCount, 'pages')
    
    return structuredScript
  } catch (error) {
    console.error('❌ Error generating script:', error)
    throw new Error(`Script generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Build system prompt for AI
 */
function buildSystemPrompt(vibeSettings?: { tone: number; pacing: number; dialogueStyle: number } | null): string {
  const vibeGuidance = vibeSettings ? `
  
🎨 VIBE SETTINGS (APPLY THESE TO SCREENPLAY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- TONE (${vibeSettings.tone}/100): ${getToneDescription(vibeSettings.tone)}
- PACING (${vibeSettings.pacing}/100): ${getPacingDescription(vibeSettings.pacing)}
- DIALOGUE STYLE (${vibeSettings.dialogueStyle}/100): ${getDialogueDescription(vibeSettings.dialogueStyle)}

⚠️ CRITICAL: These vibe settings MUST be reflected in:
  - Action descriptions (tone affects atmosphere, pacing affects scene rhythm)
  - Dialogue style (sparse vs snappy, subtextual vs expository)
  - Scene transitions (pacing affects how quickly scenes move)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` : ''
  
  return `You are a professional Hollywood screenwriter adapting an existing episode outline into a production-ready screenplay.${vibeGuidance}

**ABSOLUTE RULES - NON-NEGOTIABLE:**

1. **THE EPISODE IS THE ALPHA AND OMEGA**
   - The episode content is the ONLY source material
   - You are FORBIDDEN from adding ANY plot elements not in the episode
   - You are FORBIDDEN from adding ANY characters not in the episode
   - You are FORBIDDEN from adding ANY locations not in the episode
   - You are FORBIDDEN from adding ANY story beats not in the episode
   - You are FORBIDDEN from changing the sequence of events
   - You are FORBIDDEN from inventing backstory, motivations, or subplots

2. **YOUR ONLY JOB IS SCREENPLAY FORMATTING**
   - Take the episode's existing scenes and format them as a screenplay
   - Expand sparse dialogue into natural speech patterns (same meaning, better flow)
   - Add visual/cinematic action descriptions to enhance what's ALREADY there
   - Add proper screenplay elements: slug lines, parentheticals, transitions
   - Make it feel like a Hollywood script WITHOUT changing the story

3. **WHAT YOU CAN DO:**
   - Format scenes with proper slug lines (INT./EXT. LOCATION - TIME)
   - Add cinematic action descriptions that visualize what the episode describes
   - Expand terse dialogue into natural conversation (same beats, better delivery)
   - Add parentheticals for actor direction (tone, movement during dialogue)
   - Add transitions (CUT TO, DISSOLVE TO) for pacing
   - Describe character emotions, body language, and visual details
   - Make the script feel cinematic and production-ready

4. **WHAT YOU CANNOT DO:**
   - Add new characters (even as background/extras with names)
   - Add new locations or scenes
   - Add new plot points or story beats
   - Change character relationships or dynamics
   - Invent character backstories or motivations beyond what's given
   - Add subplots or side narratives
   - Change the beginning, middle, or end of the story
   - Add "creative flourishes" that alter the narrative

5. **FORMAT REQUIREMENTS:**
   - SLUG LINE: "INT./EXT. LOCATION - TIME OF DAY" (all caps, left-aligned)
   - ACTION: Present tense, left-aligned, describe only what we see/hear
   - CHARACTER: Centered, all caps
   - DIALOGUE: Centered under character name, natural speech
   - PARENTHETICAL: Centered, (action during dialogue), use sparingly
   - TRANSITION: Right-aligned, "CUT TO:", only when needed
   - TARGET: 5 pages = 5 minutes of screen time

6. **TONE AND STYLE:**
   - Match the tone of the episode EXACTLY
   - Use the same genre conventions as the episode
   - Maintain character voice consistency with the episode (use dialogue strategy from story bible)
   - Keep the same emotional beats as the episode
   - Apply visual style and genre conventions from story bible when describing actions
   - Weave in thematic elements naturally through visual/action descriptions

7. **USE STORY BIBLE CONTEXT (ALL TECHNICAL SECTIONS):**
   - TENSION STRATEGY: Structure emotional peaks, escalation, and release moments in action descriptions
   - DIALOGUE STRATEGY: Match character voices and speech patterns defined in story bible (MANDATORY)
   - CHOICE ARCHITECTURE: Reference when building toward meaningful character decisions in dialogue
   - LIVING WORLD DYNAMICS: Incorporate background events and social dynamics in action lines
   - TROPE ANALYSIS: Apply genre tropes authentically in visual descriptions
   - COHESION ANALYSIS: Maintain consistency with plot/character/theme from previous episodes
   - GENRE ENHANCEMENT: Apply visual style guidance when writing action descriptions (MANDATORY)
   - THEME INTEGRATION: Subtly weave thematic symbols into visual descriptions
   - PREMISE INTEGRATION: Ensure screenplay serves the core premise
   - WORLD BUILDING: Incorporate setting atmosphere and details when describing locations
   - Remember: Use these to ENHANCE what's in the episode, NOT to add new story elements

**REMEMBER:** You are adapting, NOT creating. If it's not in the episode, it doesn't go in the script. Period.`
}

/**
 * Get dialogue language instructions for script generation
 */
function getScriptLanguageInstructions(language: string): string {
  const languageMap: Record<string, string> = {
    'tagalog': `
**DIALOGUE LANGUAGE: TAGLISH (Tagalog-English Code-Switching)**
CRITICAL: All character dialogue MUST be written in authentic Taglish.
- Characters naturally switch between Tagalog and English mid-sentence
- Use Filipino expressions: "Ano ba 'yan!", "Sige na!", "Hay nako!", "Grabe!"
- Mix English with Tagalog emotional expressions
- Use honorifics: Ate, Kuya, Tito, Tita, Ma, Pa
- Example dialogue: "Wait lang, I need to think about this muna." / "Bakit mo ginawa 'yun?"
ACTION LINES AND SLUG LINES remain in English - ONLY dialogue is in Taglish.
`,
    'thai': `
**DIALOGUE LANGUAGE: THAI (ภาษาไทย)**
CRITICAL: All character dialogue MUST be written in Thai script.
- Use appropriate politeness particles: ครับ, ค่ะ, นะ
- Include Thai cultural expressions naturally
- Example: "ทำไมเธอถึงทำแบบนั้นล่ะ?" / "ฉันไม่เข้าใจเลย..."
ACTION LINES AND SLUG LINES remain in English - ONLY dialogue is in Thai script.
`,
    'spanish': `
**DIALOGUE LANGUAGE: SPANISH (Español)**
CRITICAL: All character dialogue MUST be written in Spanish.
- Write natural, conversational Spanish
- Use appropriate formality (tú vs usted)
- Example: "¿Por qué hiciste eso? No lo entiendo." / "¡Ay, Dios mío!"
ACTION LINES AND SLUG LINES remain in English - ONLY dialogue is in Spanish.
`,
    'korean': `
**DIALOGUE LANGUAGE: KOREAN (한국어)**
CRITICAL: All character dialogue MUST be written in Korean script.
- Use appropriate speech levels (존댓말/반말)
- Include appropriate honorifics
- Example: "왜 그랬어? 이해가 안 돼." / "잠깐만, 내 얘기 좀 들어봐."
ACTION LINES AND SLUG LINES remain in English - ONLY dialogue is in Korean script.
`,
    'japanese': `
**DIALOGUE LANGUAGE: JAPANESE (日本語)**
CRITICAL: All character dialogue MUST be written in Japanese.
- Use appropriate politeness levels (敬語/タメ語)
- Include proper honorifics (-san, -kun, -chan, -sama)
- Example: "どうしてそんなことをしたの？" / "ちょっと待って、話を聞いて。"
ACTION LINES AND SLUG LINES remain in English - ONLY dialogue is in Japanese script.
`,
    'french': `
**DIALOGUE LANGUAGE: FRENCH (Français)**
CRITICAL: All character dialogue MUST be written in French.
- Write natural, conversational French
- Use appropriate formality (tu vs vous)
- Example: "Pourquoi tu as fait ça?" / "Mon Dieu... Qu'est-ce qu'on va faire?"
ACTION LINES AND SLUG LINES remain in English - ONLY dialogue is in French.
`,
    'chinese': `
**DIALOGUE LANGUAGE: CHINESE (中文)**
CRITICAL: All character dialogue MUST be written in Mandarin Chinese.
- Write dialogue in Chinese characters
- Include appropriate cultural expressions
- Example: "你为什么要这样做？" / "等一下，听我说。"
ACTION LINES AND SLUG LINES remain in English - ONLY dialogue is in Chinese characters.
`
  }
  
  return languageMap[language] || ''
}

/**
 * Helper functions for vibe settings descriptions
 */
function getToneDescription(value: number): string {
  if (value < 20) return 'DARK/GRITTY: Emphasize shadows, moral ambiguity, harsh realities. Use muted descriptions, serious dialogue, and weighty consequences.'
  if (value < 40) return 'DARK-LEANING: Thoughtful with serious undertones. Some humor but grounded in reality.'
  if (value < 60) return 'BALANCED: Mix of serious moments with lighter beats. Natural humor emerges from character interactions.'
  if (value < 80) return 'LIGHT-LEANING: Optimistic with occasional serious moments. Characters find hope and humor even in challenges.'
  return 'LIGHT/COMEDIC: Emphasis on humor, wit, and positive outlook. Quick banter, comedic timing, and characters who find levity in situations.'
}

function getPacingDescription(value: number): string {
  if (value < 20) return 'SLOW BURN: Extended character moments, contemplative pauses, detailed atmospheric descriptions. Let scenes breathe.'
  if (value < 40) return 'DELIBERATE: Thoughtful pacing with purposeful scene development. Balance action with character moments.'
  if (value < 60) return 'STEADY: Consistent forward momentum with varied scene lengths. Mix of quick and extended moments.'
  if (value < 80) return 'ENERGETIC: Faster scene transitions, more dynamic action, snappy exchanges. Keep momentum building.'
  return 'HIGH OCTANE: Rapid scene changes, intense action, quick-fire dialogue. Maximum energy and excitement.'
}

function getDialogueDescription(value: number): string {
  if (value < 20) return 'SPARSE/SUBTEXTUAL: Characters say less but mean more. Heavy use of subtext, meaningful silences, and actions that speak louder than words.'
  if (value < 40) return 'THOUGHTFUL: Measured dialogue with deeper meaning. Characters choose words carefully. Subtext is important.'
  if (value < 60) return 'NATURAL: Authentic conversational flow. Mix of direct and indirect communication based on character and situation.'
  if (value < 80) return 'ARTICULATE: Characters express themselves clearly and directly. More exposition when needed, but still natural.'
  return 'SNAPPY/EXPOSITORY: Quick wit, rapid exchanges, characters who say exactly what they mean. Fast dialogue with clear information delivery.'
}

/**
 * Build user prompt with all context
 */
function buildUserPrompt(params: ScriptGenerationParams): string {
  const { episode, storyBible, previousEpisode, allPreviousEpisodes, existingPreProductionData } = params
  
  // Get dialogue language setting
  const dialogueLanguage = storyBible.dialogueLanguage || storyBible.generationSettings?.dialogueLanguage || 'english'
  const languageInstructions = getScriptLanguageInstructions(dialogueLanguage)
  
  let prompt = `Generate a professional, industry-standard screenplay for this episode.\n\n`
  prompt += `**EPISODE LENGTH:**\n`
  prompt += `- Target runtime: 5 minutes (target: 5 pages)\n`
  prompt += `- ONLY extend to 8 minutes (8 pages) if the story genuinely requires it\n`
  prompt += `- If extending, ensure every additional minute serves a clear narrative purpose\n\n`
  
  // Add language instructions prominently if not English
  if (languageInstructions) {
    prompt += languageInstructions + `\n`
  }
  
  // Series context
  prompt += `**SERIES INFORMATION:**\n`
  prompt += `Title: ${storyBible.title || storyBible.seriesTitle || 'Untitled Series'}\n`
  prompt += `Genre: ${storyBible.genre || 'Drama'}\n`
  if (storyBible.tone) prompt += `Tone: ${storyBible.tone}\n`
  if (storyBible.logline) prompt += `Series Logline: ${storyBible.logline}\n`
  if (dialogueLanguage !== 'english') prompt += `Dialogue Language: ${dialogueLanguage.toUpperCase()}\n`
  prompt += `\n`
  
  // Add CRITICAL world rules and key locations  
  if (storyBible.worldBuilding) {
    prompt += `**WORLD/SETTING CONTEXT:**\n`
    if (typeof storyBible.worldBuilding === 'string') {
      prompt += `${storyBible.worldBuilding.substring(0, 500)}\n\n`
    } else {
      if (storyBible.worldBuilding.setting) prompt += `${storyBible.worldBuilding.setting}\n`
      if (storyBible.worldBuilding.rules) {
        prompt += `\nWorld Rules (maintain these):\n`
        if (typeof storyBible.worldBuilding.rules === 'string') {
          prompt += `${storyBible.worldBuilding.rules}\n`
        } else if (Array.isArray(storyBible.worldBuilding.rules)) {
          prompt += storyBible.worldBuilding.rules.map((r: string) => `- ${r}`).join('\n') + '\n'
        }
      }
      if (storyBible.worldBuilding.locations && Array.isArray(storyBible.worldBuilding.locations)) {
        prompt += `\nKey Locations:\n`
        storyBible.worldBuilding.locations.slice(0, 5).forEach((loc: any) => {
          prompt += `- ${loc.name}: ${loc.description || ''}`
          if (loc.atmosphere) prompt += ` (Atmosphere: ${loc.atmosphere})`
          prompt += `\n`
        })
      }
      prompt += `\n`
    }
  }
  
  // Add ALL technical tabs for comprehensive adaptation context
  prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**STORY BIBLE TECHNICAL SECTIONS (MANDATORY GUIDANCE):**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL: Use these technical sections to enhance screenplay adaptation. These provide critical guidance for authentic storytelling.\n\n`
  
  // Tension Strategy
  if (storyBible.tensionStrategy) {
    prompt += `**TENSION STRATEGY:**\n`
    const tension = storyBible.tensionStrategy
    if (tension.rawContent) {
      prompt += `${tension.rawContent}\n\n`
    } else {
      if (tension.tensionCurve) prompt += `Tension Curve: ${tension.tensionCurve}\n`
      if (tension.climaxPoints) prompt += `Climax Points: ${tension.climaxPoints}\n`
      if (tension.escalationTechniques) prompt += `Escalation Techniques: ${tension.escalationTechniques}\n`
      if (tension.emotionalBeats) prompt += `Emotional Beats: ${tension.emotionalBeats}\n`
      prompt += `\n`
    }
  }
  
  // Choice Architecture
  if (storyBible.choiceArchitecture) {
    prompt += `**CHOICE ARCHITECTURE:**\n`
    const choice = storyBible.choiceArchitecture
    if (choice.rawContent) {
      prompt += `${choice.rawContent}\n\n`
    } else {
      if (choice.keyDecisions) prompt += `Key Decisions: ${choice.keyDecisions}\n`
      if (choice.moralChoices) prompt += `Moral Choices: ${choice.moralChoices}\n`
      if (choice.consequenceMapping) prompt += `Consequence Mapping: ${choice.consequenceMapping}\n`
      prompt += `\n`
    }
  }
  
  // Living World Dynamics
  if (storyBible.livingWorldDynamics) {
    prompt += `**LIVING WORLD DYNAMICS:**\n`
    const living = storyBible.livingWorldDynamics
    if (living.rawContent) {
      prompt += `${living.rawContent}\n\n`
    } else {
      if (living.backgroundEvents) prompt += `Background Events: ${living.backgroundEvents}\n`
      if (living.socialDynamics) prompt += `Social Dynamics: ${living.socialDynamics}\n`
      if (living.economicFactors) prompt += `Economic Factors: ${living.economicFactors}\n`
      prompt += `\n`
    }
  }
  
  // Trope Analysis
  if (storyBible.tropeAnalysis) {
    prompt += `**TROPE ANALYSIS:**\n`
    const trope = storyBible.tropeAnalysis
    if (trope.rawContent) {
      prompt += `${trope.rawContent}\n\n`
    } else {
      if (trope.genreTropes) prompt += `Genre Tropes: ${trope.genreTropes}\n`
      if (trope.subvertedTropes) prompt += `Subverted Tropes: ${trope.subvertedTropes}\n`
      if (trope.originalElements) prompt += `Original Elements: ${trope.originalElements}\n`
      prompt += `\n`
    }
  }
  
  // Cohesion Analysis
  if (storyBible.cohesionAnalysis) {
    prompt += `**COHESION ANALYSIS:**\n`
    const cohesion = storyBible.cohesionAnalysis
    if (cohesion.rawContent) {
      prompt += `${cohesion.rawContent}\n\n`
    } else {
      if (cohesion.plotConsistency) prompt += `Plot Consistency: ${cohesion.plotConsistency}\n`
      if (cohesion.characterConsistency) prompt += `Character Consistency: ${cohesion.characterConsistency}\n`
      if (cohesion.thematicConsistency) prompt += `Thematic Consistency: ${cohesion.thematicConsistency}\n`
      prompt += `\n`
    }
  }
  
  // Dialogue Strategy
  if (storyBible.dialogueStrategy) {
    prompt += `**DIALOGUE STRATEGY:**\n`
    const dialogue = storyBible.dialogueStrategy
    if (dialogue.rawContent) {
      prompt += `${dialogue.rawContent}\n\n`
    } else {
      if (dialogue.characterVoice) prompt += `Character Voice: ${dialogue.characterVoice}\n`
      if (dialogue.speechPatterns) prompt += `Speech Patterns: ${dialogue.speechPatterns}\n`
      if (dialogue.subtext) prompt += `Subtext: ${dialogue.subtext}\n`
      if (dialogue.conflictDialogue) prompt += `Conflict Dialogue: ${dialogue.conflictDialogue}\n`
      prompt += `\n`
    }
  }
  
  // Genre Enhancement
  if (storyBible.genreEnhancement) {
    prompt += `**GENRE ENHANCEMENT:**\n`
    const genre = storyBible.genreEnhancement
    if (genre.rawContent) {
      prompt += `${genre.rawContent}\n\n`
    } else {
      if (genre.visualStyle) prompt += `Visual Style: ${genre.visualStyle}\n`
      if (genre.pacing) prompt += `Pacing: ${genre.pacing}\n`
      if (genre.audienceExpectations) prompt += `Audience Expectations: ${genre.audienceExpectations}\n`
      prompt += `\n`
    }
  }
  
  // Theme Integration
  if (storyBible.themeIntegration) {
    prompt += `**THEME INTEGRATION:**\n`
    const theme = storyBible.themeIntegration
    if (theme.rawContent) {
      prompt += `${theme.rawContent.substring(0, 400)}\n\n`
    } else {
      if (theme.characterIntegration) prompt += `Character Integration: ${theme.characterIntegration}\n`
      if (theme.plotIntegration) prompt += `Plot Integration: ${theme.plotIntegration}\n`
      if (theme.symbolicElements) prompt += `Symbolic Elements: ${theme.symbolicElements}\n`
      prompt += `\n`
    }
  }
  
  // Premise Integration
  if (storyBible.premiseIntegration) {
    prompt += `**PREMISE INTEGRATION:**\n`
    const premiseInt = storyBible.premiseIntegration
    if (premiseInt.rawContent) {
      prompt += `${premiseInt.rawContent.substring(0, 300)}\n\n`
    } else {
      if (premiseInt.coreQuestion) prompt += `Core Question: ${premiseInt.coreQuestion}\n`
      if (premiseInt.episodicExpression) prompt += `Episodic Expression: ${premiseInt.episodicExpression}\n`
      prompt += `\n`
    }
  }
  
  prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
  
  // Previous episodes context (for continuity)
  let previousEpisodesContext = ''
  if (allPreviousEpisodes && allPreviousEpisodes.length > 0) {
    previousEpisodesContext = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**PREVIOUS EPISODES CONTEXT (FOR CONTINUITY):**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL: Reference specific events, character development, plot threads, and consequences from previous episodes when adapting dialogue and action descriptions.\n\n`
    
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
      
      previousEpisodesContext += `Episode ${epNum}: "${epTitle}"\n`
      if (epSynopsis) {
        previousEpisodesContext += `Synopsis: ${epSynopsis}\n`
      }
      previousEpisodesContext += `\n`
    })
    
    previousEpisodesContext += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
  }
  
  // Immediate previous episode (full detail)
  if (previousEpisode) {
    const prevEpTitle = previousEpisode.title || previousEpisode.episodeTitle || `Episode ${episode.episodeNumber - 1}`
    const prevEpSynopsis = previousEpisode.synopsis || ''
    
    previousEpisodesContext += `**IMMEDIATE PREVIOUS EPISODE (Episode ${episode.episodeNumber - 1}): "${prevEpTitle}"**\n`
    if (prevEpSynopsis) {
      previousEpisodesContext += `Synopsis: ${prevEpSynopsis}\n\n`
    }
    previousEpisodesContext += `⚠️ Reference this episode extensively for character development, plot continuity, and relationship dynamics.\n\n`
  }
  
  // Episode content (PRIORITY #1)
  prompt += previousEpisodesContext
  prompt += `**EPISODE ${episode.episodeNumber}: ${episode.title || 'Untitled'}\n\n`
  
  if (episode.synopsis) {
    prompt += `Synopsis:\n${episode.synopsis}\n\n`
  }
  
  // LOG EPISODE DATA FOR DEBUGGING
  console.log('═══════════════════════════════════════')
  console.log('📺 EPISODE DATA BEING USED FOR SCRIPT:')
  console.log('═══════════════════════════════════════')
  console.log('Title:', episode.title)
  console.log('Synopsis:', episode.synopsis)
  console.log('Characters:', JSON.stringify(episode.characters, null, 2))
  console.log('Scenes:', episode.scenes?.length || 0)
  if (episode.scenes) {
    episode.scenes.forEach((scene: any, idx: number) => {
      console.log(`\nScene ${idx + 1}:`, {
        location: scene.location,
        timeOfDay: scene.timeOfDay,
        characters: scene.characters,
        content: scene.content?.substring(0, 200)
      })
    })
  }
  console.log('═══════════════════════════════════════\n')
  
  // Extract scenes from episode
  if (episode.scenes && episode.scenes.length > 0) {
    prompt += `**SCENES:**\n`
    episode.scenes.forEach((scene: any, idx: number) => {
      prompt += `Scene ${idx + 1}:\n`
      if (scene.location) prompt += `  Location: ${scene.location}\n`
      if (scene.timeOfDay) prompt += `  Time: ${scene.timeOfDay}\n`
      if (scene.description) prompt += `  ${scene.description}\n`
      if (scene.content) prompt += `  ${scene.content}\n`
      if (scene.characters && scene.characters.length > 0) {
        prompt += `  Characters: ${scene.characters.join(', ')}\n`
      }
      if (scene.dialogue) prompt += `  Dialogue: ${scene.dialogue}\n`
      prompt += `\n`
    })
  }
  
  // Extract characters
  const characters = extractCharacters(episode)
  if (characters.length > 0) {
    prompt += `**CHARACTERS:**\n`
    characters.forEach(char => {
      prompt += `- ${char.name}`
      if (char.description) prompt += `: ${char.description}`
      prompt += `\n`
    })
    prompt += `\n`
  }
  
  // Add context from other tabs if available
  if (existingPreProductionData) {
    if (existingPreProductionData.breakdown) {
      prompt += `**PRODUCTION CONTEXT (from Script Breakdown):**\n`
      prompt += `This episode has ${existingPreProductionData.breakdown.scenes?.length || 0} scenes planned.\n\n`
    }
  }
  
  // EXPLICIT BOUNDARIES - what's allowed
  prompt += `**STRICT BOUNDARIES - WHAT YOU ARE ALLOWED TO USE:**\n\n`
  
  // List all characters
  prompt += `**ALLOWED CHARACTERS (use ONLY these, no new characters):**\n`
  characters.forEach(char => {
    prompt += `  - ${char.name}\n`
  })
  prompt += `\n`
  
  // List all locations
  const locations = new Set<string>()
  if (episode.scenes) {
    episode.scenes.forEach(scene => {
      if (scene.location) locations.add(scene.location)
    })
  }
  prompt += `**ALLOWED LOCATIONS (use ONLY these, no new locations):**\n`
  locations.forEach(loc => {
    prompt += `  - ${loc}\n`
  })
  prompt += `\n`
  
  // List all scenes
  prompt += `**REQUIRED SCENES (include ALL, in this order, add NOTHING new):**\n`
  if (episode.scenes && episode.scenes.length > 0) {
    episode.scenes.forEach((scene: any, idx: number) => {
      prompt += `  Scene ${idx + 1}: ${scene.location || 'Unknown'} - ${scene.timeOfDay || 'Unknown'}\n`
    })
  }
  prompt += `\n`
  
  // Generation instructions
  prompt += `**REQUIREMENTS:**\n`
  prompt += `1. **ABSOLUTE FIDELITY**: Use ONLY the episode content above\n`
  prompt += `   - NO new characters (not even unnamed extras)\n`
  prompt += `   - NO new locations or scenes\n`
  prompt += `   - NO new plot points or story beats\n`
  prompt += `   - If it's not listed above, DON'T ADD IT\n\n`
  prompt += `2. **FORMAT**: Use proper screenplay formatting throughout\n`
  prompt += `   - Plain text only (no HTML, no markdown)\n`
  prompt += `   - Standard screenplay conventions\n\n`
  prompt += `3. **LENGTH**: Target 5 pages (5 minutes screen time)\n`
  prompt += `   - ONLY extend to 8 pages if the story genuinely requires it\n`
  prompt += `   - If extending, ensure every additional page serves a clear narrative purpose\n`
  prompt += `   - ONLY extend to 8 pages if the story genuinely requires it\n`
  prompt += `   - If extending, ensure every additional page serves a clear narrative purpose\n\n`
  prompt += `4. **YOUR JOB**: Adapt the episode into a properly formatted screenplay\n`
  prompt += `   - Expand terse dialogue into natural speech (same meaning)\n`
  prompt += `   - Add cinematic action descriptions (visualize what's there)\n`
  prompt += `   - Add proper screenplay elements (slugs, parentheticals, transitions)\n`
  prompt += `   - Make it Hollywood-quality WITHOUT changing the story\n\n`
  
  prompt += `**OUTPUT FORMAT:**\n`
  prompt += `Provide the complete screenplay in standard format:\n\n`
  prompt += `FADE IN:\n\n`
  prompt += `INT./EXT. LOCATION - TIME OF DAY\n\n`
  prompt += `Action description in present tense...\n\n`
  prompt += `CHARACTER\n`
  prompt += `Dialogue goes here.\n\n`
  prompt += `[Continue with all scenes...]\n\n`
  prompt += `FADE OUT.\n\n`
  prompt += `THE END\n\n`
  
  // FINAL EMPHATIC REMINDER
  prompt += `**═══════════════════════════════════════**\n`
  prompt += `**CRITICAL FINAL REMINDER:**\n`
  prompt += `**═══════════════════════════════════════**\n\n`
  prompt += `❌ DO NOT ADD: New characters, locations, plot points, scenes, or story beats\n`
  prompt += `❌ DO NOT CHANGE: The sequence of events, character relationships, or story outcomes\n`
  prompt += `❌ DO NOT INVENT: Backstories, motivations, or subplots not in the episode\n\n`
  prompt += `✅ DO EXPAND: Sparse dialogue into natural speech (same meaning)\n`
  prompt += `✅ DO ADD: Cinematic action descriptions that visualize what's already there\n`
  prompt += `✅ DO FORMAT: Properly with slugs, parentheticals, and transitions\n`
  if (dialogueLanguage !== 'english') {
    prompt += `✅ DO WRITE: ALL dialogue in ${dialogueLanguage.toUpperCase()} (action lines stay in English)\n`
  }
  prompt += `\n`
  prompt += `YOU ARE ADAPTING, NOT CREATING. THE EPISODE IS EVERYTHING.\n`
  prompt += `If you add even ONE element not in the episode, you have FAILED.\n`
  if (dialogueLanguage !== 'english') {
    prompt += `\n🗣️ DIALOGUE LANGUAGE REMINDER: Write all character dialogue in ${dialogueLanguage.toUpperCase()}!\n`
  }
  prompt += `\nOutput ONLY the screenplay starting with "FADE IN:" and ending with "THE END". No introduction, no notes, no explanation.`
  
  return prompt
}

/**
 * Extract characters from episode data
 */
function extractCharacters(episode: Episode): Array<{name: string, description?: string}> {
  const characters: Array<{name: string, description?: string}> = []
  
  // Try to get from episode.characters if it exists
  if (episode.characters && Array.isArray(episode.characters)) {
    return episode.characters.map((char: any) => ({
      name: char.name || char.characterName || 'Unknown',
      description: char.description || char.role || char.arc || ''
    }))
  }
  
  // Extract from scenes
  if (episode.scenes && Array.isArray(episode.scenes)) {
    const characterSet = new Set<string>()
    episode.scenes.forEach((scene: any) => {
      if (scene.characters && Array.isArray(scene.characters)) {
        scene.characters.forEach((char: string) => characterSet.add(char))
      }
    })
    characterSet.forEach(name => characters.push({ name }))
  }
  
  return characters
}

/**
 * Clean AI output by removing HTML tags and markdown
 */
function cleanAIOutput(text: string): string {
  // Remove HTML tags (e.g., <center>TEXT</center>)
  text = text.replace(/<[^>]+>/g, '')
  
  // Remove blockquote markers at start of lines (e.g., "> Dialogue")
  text = text.replace(/^>\s*/gm, '')
  
  // Remove markdown bold (e.g., **TEXT**)
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  
  // Remove markdown italic (e.g., *TEXT*)
  text = text.replace(/\*([^*]+)\*/g, '$1')
  
  // Remove quotes around transitions (e.g., "CUT TO:" -> CUT TO:)
  text = text.replace(/^"((?:FADE IN|FADE OUT|CUT TO|DISSOLVE TO|MATCH CUT TO)[^"]*)"$/gm, '$1')
  
  return text
}

/**
 * Parse generated script text into structured format
 */
function parseScriptIntoStructure(scriptText: string, episode: Episode): GeneratedScript {
  // Clean HTML/markdown from AI output first
  scriptText = cleanAIOutput(scriptText)
  
  const lines = scriptText.split('\n')
  const pages: ScriptPage[] = []
  let currentPage: ScriptPage = { pageNumber: 1, elements: [] }
  let sceneCount = 0
  let currentSceneNumber = 0 // Track current scene for all elements
  const characterSet = new Set<string>()
  
  let isInDialogue = false // Track if we're currently in a dialogue block
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    
    // Skip empty lines but preserve them in structure and exit dialogue mode
    if (!trimmedLine) {
      currentPage.elements.push({ 
        type: 'action', 
        content: '',
        metadata: currentSceneNumber > 0 ? { sceneNumber: currentSceneNumber } : undefined
      })
      isInDialogue = false // Empty line ends dialogue
      continue
    }
    
    // Detect slug line (scene heading)
    if (/^(INT\.|EXT\.|INT\/EXT\.)/i.test(trimmedLine)) {
      sceneCount++
      currentSceneNumber = sceneCount // Update current scene for subsequent elements
      currentPage.elements.push({
        type: 'slug',
        content: trimmedLine.toUpperCase(),
        metadata: { sceneNumber: sceneCount }
      })
      isInDialogue = false
      continue
    }
    
    // Detect transition
    if (/^(FADE IN:|FADE OUT\.|CUT TO:|DISSOLVE TO:|MATCH CUT TO:)/i.test(trimmedLine)) {
      currentPage.elements.push({ type: 'transition', content: trimmedLine.toUpperCase() })
      isInDialogue = false
      continue
    }
    
    // Detect character name (all caps, not too long, doesn't look like slug/transition)
    const isAllCaps = trimmedLine === trimmedLine.toUpperCase()
    const isPotentialCharacter = isAllCaps && 
        trimmedLine.length > 0 && 
        trimmedLine.length < 40 &&
        !trimmedLine.includes('.') && // Not a slug line
        !trimmedLine.includes(':') && // Not a transition
        !/^(INT|EXT|FADE|CUT|DISSOLVE|THE END)/.test(trimmedLine) // Not a keyword
    
    if (isPotentialCharacter) {
      // Look ahead to see if next non-empty line could be dialogue or parenthetical
      let hasDialogueAhead = false
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const nextTrimmed = lines[j].trim()
        if (nextTrimmed) {
          // If next line is not all caps and not a slug/transition, it's likely dialogue
          if (nextTrimmed !== nextTrimmed.toUpperCase() || nextTrimmed.startsWith('(')) {
            hasDialogueAhead = true
            break
          } else {
            break // Next line is caps, probably not dialogue
          }
        }
      }
      
      if (hasDialogueAhead) {
        characterSet.add(trimmedLine)
        currentPage.elements.push({
          type: 'character',
          content: trimmedLine,
          metadata: { 
            characterName: trimmedLine,
            sceneNumber: currentSceneNumber > 0 ? currentSceneNumber : undefined
          }
        })
        isInDialogue = true // Next lines will be dialogue
        continue
      }
    }
    
    // Detect parenthetical
    if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
      currentPage.elements.push({ 
        type: 'parenthetical', 
        content: trimmedLine,
        metadata: currentSceneNumber > 0 ? { sceneNumber: currentSceneNumber } : undefined
      })
      // Stay in dialogue mode after parenthetical
      continue
    }
    
    // Detect page break (approximate - every ~55 elements)
    if (currentPage.elements.length > 55) {
      pages.push(currentPage)
      currentPage = { pageNumber: pages.length + 1, elements: [] }
    }
    
    // Determine if this is dialogue or action
    const lastElement = currentPage.elements[currentPage.elements.length - 1]
    
    // If we're in dialogue mode and this line is not a special format, treat as dialogue
    if (isInDialogue && !isAllCaps) {
      // Multi-line dialogue: append to existing dialogue or create new dialogue element
      const dialogueMetadata = currentSceneNumber > 0 ? { sceneNumber: currentSceneNumber } : undefined
      if (lastElement && (lastElement.type === 'dialogue' || lastElement.type === 'parenthetical')) {
        // Check if we should append or create new element
        // If last was dialogue and this continues, create new dialogue line
        currentPage.elements.push({ 
          type: 'dialogue', 
          content: trimmedLine,
          metadata: dialogueMetadata
        })
      } else if (lastElement && lastElement.type === 'character') {
        // First dialogue line after character
        currentPage.elements.push({ 
          type: 'dialogue', 
          content: trimmedLine,
          metadata: dialogueMetadata
        })
      } else {
        // Shouldn't happen, but fallback to dialogue
        currentPage.elements.push({ 
          type: 'dialogue', 
          content: trimmedLine,
          metadata: dialogueMetadata
        })
      }
    } else {
      // Action line
      currentPage.elements.push({ 
        type: 'action', 
        content: trimmedLine,
        metadata: currentSceneNumber > 0 ? { sceneNumber: currentSceneNumber } : undefined
      })
      isInDialogue = false // Action ends dialogue mode
    }
  }
  
  // Add final page if not empty
  if (currentPage.elements.length > 0) {
    pages.push(currentPage)
  }
  
  return {
    title: episode.title || `Episode ${episode.episodeNumber}`,
    episodeNumber: episode.episodeNumber,
    pages,
    metadata: {
      pageCount: pages.length,
      sceneCount,
      characterCount: characterSet.size,
      estimatedRuntime: `${pages.length} minutes`,
      generatedAt: Date.now()
    }
  }
}

/**
 * Format script for display (convert back to readable format)
 */
export function formatScriptForDisplay(script: GeneratedScript): string {
  let output = ''
  
  for (const page of script.pages) {
    for (const element of page.elements) {
      switch (element.type) {
        case 'slug':
          output += `\n${element.content}\n\n`
          break
        case 'action':
          output += `${element.content}\n`
          break
        case 'character':
          output += `\n${' '.repeat(22)}${element.content}\n`
          break
        case 'dialogue':
          output += `${' '.repeat(10)}${element.content}\n`
          break
        case 'parenthetical':
          output += `${' '.repeat(16)}${element.content}\n`
          break
        case 'transition':
          output += `\n${' '.repeat(45)}${element.content}\n\n`
          break
        case 'page-break':
          output += `\n${'='.repeat(60)}\n`
          output += `${' '.repeat(25)}PAGE ${page.pageNumber}\n`
          output += `${'='.repeat(60)}\n\n`
          break
      }
    }
  }
  
  return output
}
