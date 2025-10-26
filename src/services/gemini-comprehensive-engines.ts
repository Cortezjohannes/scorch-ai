/**
 * 🚀 GEMINI 2.5 PRO COMPREHENSIVE ENGINE SYSTEM
 * 
 * Phase 7: Gemini-optimized 19-engine system leveraging 2M token context
 * and advanced creative reasoning for superior episode generation.
 */

import { generateContentWithGemini } from './gemini-ai'
import { GEMINI_CONFIG } from './model-config'
import { ComprehensiveEngineNotes, ComprehensiveEngineMetadata, EngineExecutionMetadata } from './comprehensive-engines'

// 🎯 GEMINI-OPTIMIZED ENGINE CONFIGURATIONS
export const GEMINI_ENGINE_CONFIGURATIONS = {
  // ===== NARRATIVE ARCHITECTURE (6 ENGINES) =====
  
  'FractalNarrativeEngineV2': {
    name: 'FractalNarrativeEngineV2',
    category: 'narrative',
    priority: 1,
    timeout: 45000, // Optimized for Gemini speed
    retryCount: 1, // Faster recovery
    temperature: 0.95, // Maximum creativity for Gemini
    maxTokens: 1500,
    systemPrompt: 'You are a master narrative architect with advanced creative reasoning. Think deeply about fractal story structures where each part reflects the whole. Use step-by-step analysis to create sophisticated structural enhancements.',
    taskPrompt: 'Analyze the narrative structure using creative reasoning and suggest 3-5 sophisticated structural enhancements using fractal narrative principles.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about the storytelling elements and character psychology. Use your advanced creative reasoning to provide sophisticated, nuanced recommendations.

• Recursive themes that appear at scene, episode, and series levels
• Nested conflicts that mirror the overall story arc  
• Structural elegance where each scene reflects the episode's core conflict
• Pattern recognition in character behavior and story beats
• Thematic resonance across different story scales

Expected Output Format: Bullet points with specific structural recommendations enhanced by creative reasoning.`
  },
  
  'EpisodeCohesionEngineV2': {
    name: 'EpisodeCohesionEngineV2',
    category: 'narrative',
    priority: 2,
    timeout: 40000,
    retryCount: 1,
    temperature: 0.9,
    maxTokens: 1200,
    systemPrompt: 'You are a series continuity expert with advanced reasoning capabilities. Think deeply about episode-to-episode flow and character development consistency.',
    taskPrompt: 'Analyze episode cohesion using creative reasoning and suggest 3-5 enhancements for series continuity and character consistency.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Use step-by-step analysis to understand character psychology and narrative flow.

• Character development consistency across episodes
• Plot thread continuity and resolution tracking
• Thematic progression throughout the series
• Callback integration to previous episodes
• Setup for future episode developments
• Emotional arc continuity for all characters

Expected Output Format: Specific continuity recommendations with episode references enhanced by creative analysis.`
  },
  
  'ConflictArchitectureEngineV2': {
    name: 'ConflictArchitectureEngineV2',
    category: 'narrative',
    priority: 3,
    timeout: 45000,
    retryCount: 1,
    temperature: 0.95,
    maxTokens: 1400,
    systemPrompt: 'You are a conflict architect with advanced creative reasoning. Think deeply about multi-dimensional dramatic tensions and character psychology.',
    taskPrompt: 'Design sophisticated conflict layers using creative reasoning: internal vs external, character vs world, ideal vs reality.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about character motivations and psychological authenticity.

• Multi-layered conflicts operating simultaneously
• Internal character struggles reflected in external events
• Character desires vs world obstacles
• Moral dilemmas with no clear right answer
• Escalating tension that builds naturally
• Conflicts that reveal character through adversity

Expected Output Format: Layered conflict analysis with escalation strategies enhanced by psychological insight.`
  },
  
  'HookCliffhangerEngineV2': {
    name: 'HookCliffhangerEngineV2',
    category: 'narrative',
    priority: 4,
    timeout: 40000,
    retryCount: 1,
    temperature: 0.95,
    maxTokens: 1000,
    systemPrompt: 'You are a master of compelling episode openings and endings with advanced creative reasoning. Think deeply about audience psychology and engagement.',
    taskPrompt: 'Enhance episode hooks and cliffhangers using creative reasoning for maximum audience engagement and episode-to-episode retention.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about audience psychology and emotional engagement patterns.

• Compelling episode openings that immediately engage
• Cliffhanger endings that create anticipation
• Emotional hooks that connect to character stakes
• Plot hooks that advance the overall series arc
• Question-raising techniques that compel continued viewing
• Balance between resolution and anticipation

Expected Output Format: Specific hook and cliffhanger enhancement suggestions with psychological reasoning.`
  },
  
  'SerializedContinuityEngineV2': {
    name: 'SerializedContinuityEngineV2',
    category: 'narrative',
    priority: 5,
    timeout: 40000,
    retryCount: 1,
    temperature: 0.9,
    maxTokens: 1300,
    systemPrompt: 'You are a serialized storytelling expert with advanced reasoning capabilities. Think deeply about cross-episode consistency and character tracking.',
    taskPrompt: 'Ensure serialized continuity using creative reasoning with character states, world changes, and narrative thread progression.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Use step-by-step analysis to understand character development and world evolution.

• Character state consistency across episodes (what they know, feel, relationships)
• World state changes that persist (environmental, political, social changes)
• Narrative thread tracking and development (ongoing mysteries, relationships)
• Information consistency (what characters know/don't know when)
• Timeline and causality maintenance
• Relationship evolution tracking

Expected Output Format: Continuity notes with specific character and world state tracking enhanced by creative analysis.`
  },
  
  'PacingRhythmEngineV2': {
    name: 'PacingRhythmEngineV2',
    category: 'narrative',
    priority: 6,
    timeout: 40000,
    retryCount: 1,
    temperature: 0.9,
    maxTokens: 1200,
    systemPrompt: 'You are a pacing and rhythm specialist with advanced creative reasoning. Think deeply about narrative flow and audience attention management.',
    taskPrompt: 'Optimize episode pacing and rhythm using creative reasoning for maximum engagement in 5-minute format.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about audience psychology and attention span optimization.

• Determine optimal scene count per episode based on story needs (simple episodes may need 1-2, complex ones may need 6-8)
• Tension curve management (build, release, build)
• Beat placement for maximum impact
• Attention span optimization for short-form content
• Emotional rhythm and breathing room
• Dramatic peak timing and intensity

Expected Output Format: Specific pacing adjustments with timing recommendations enhanced by psychological insight.`
  },
  
  // ===== DIALOGUE & CHARACTER (2 ENGINES) =====
  
  'DialogueEngineV2': {
    name: 'DialogueEngineV2',
    category: 'character',
    priority: 7,
    timeout: 50000,
    retryCount: 1,
    temperature: 0.98, // Maximum creativity for dialogue!
    maxTokens: 1800,
    systemPrompt: 'You are a dialogue master with advanced creative reasoning and psychological insight. Think deeply about character psychology and authentic speech patterns.',
    taskPrompt: 'Enhance character dialogue using creative reasoning with psychological depth, subtext, and authentic voice differentiation.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about character psychology and authentic human communication patterns.

• Each line serves multiple purposes: character development, plot advancement, thematic exploration
• Unique voice patterns for each character (vocabulary, rhythm, cultural background)
• Subtext and what characters DON'T say directly
• Psychological authenticity in speech patterns
• Cultural and background influence on dialogue
• Conflict and tension through conversation
• Natural speech rhythms, interruptions, and overlapping dialogue

Expected Output Format: Enhanced dialogue examples with voice notes enhanced by psychological analysis.`
  },
  
  'StrategicDialogueEngine': {
    name: 'StrategicDialogueEngine',
    category: 'character',
    priority: 8,
    timeout: 45000,
    retryCount: 1,
    temperature: 0.95,
    maxTokens: 1500,
    systemPrompt: 'You are a strategic dialogue specialist with advanced reasoning capabilities. Think deeply about purposeful conversations and character motivations.',
    taskPrompt: 'Optimize dialogue using creative reasoning for strategic story advancement and character revelation.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about character motivations and strategic communication.

• Every conversation has clear dramatic purpose
• Information revelation through natural dialogue flow
• Character motivations emerging through speech patterns
• Conflict escalation through verbal tension
• Relationship dynamics expressed in conversation
• Plot advancement disguised as natural interaction

Expected Output Format: Strategic dialogue enhancements with purpose annotations enhanced by psychological insight.`
  },
  
  // ===== WORLD & ENVIRONMENT (3 ENGINES) =====
  
  'WorldBuildingEngineV2': {
    name: 'WorldBuildingEngineV2',
    category: 'world',
    priority: 9,
    timeout: 45000,
    retryCount: 1,
    temperature: 0.95,
    maxTokens: 1600,
    systemPrompt: 'You are a world-building specialist with advanced creative reasoning. Think deeply about immersive environments and atmospheric storytelling.',
    taskPrompt: 'Enhance environmental storytelling using creative reasoning with cultural details and immersive world elements.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about environmental psychology and immersive storytelling.

• Environmental storytelling through setting details
• Cultural authenticity and specific details
• Atmospheric elements that enhance mood and theme
• Location significance to character and plot
• Sensory details that immerse the audience
• World rules that create story opportunities and constraints

Expected Output Format: Environmental enhancement notes with specific setting details enhanced by creative reasoning.`
  },
  
  'LivingWorldEngineV2': {
    name: 'LivingWorldEngineV2',
    category: 'world',
    priority: 10,
    timeout: 40000,
    retryCount: 1,
    temperature: 0.9,
    maxTokens: 1200,
    systemPrompt: 'You are a living world specialist with advanced creative reasoning. Think deeply about dynamic environments and organic character interactions.',
    taskPrompt: 'Create dynamic world elements using creative reasoning including character entrances/exits and living world details.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about organic world dynamics and natural character movement.

• Natural character entrances and exits with logical reasons
• Background character presence and purpose
• World events happening beyond main story
• Environmental changes that reflect story progression
• Organic character interactions with setting
• World feeling alive and responsive to character actions

Expected Output Format: Living world enhancement notes with character movement suggestions enhanced by creative analysis.`
  },
  
  'LanguageEngineV2': {
    name: 'LanguageEngineV2',
    category: 'world',
    priority: 11,
    timeout: 40000,
    retryCount: 1,
    temperature: 0.95,
    maxTokens: 1300,
    systemPrompt: 'You are a language and cultural authenticity expert with advanced reasoning capabilities. Think deeply about authentic speech patterns and cultural nuances.',
    taskPrompt: 'Enhance dialogue using creative reasoning for cultural authenticity and character-specific language patterns.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about cultural authenticity and linguistic psychology.

• Authentic cultural speech patterns without stereotypes
• Educational background influence on vocabulary choices
• Regional and social class language variations
• Professional jargon and industry-specific language
• Generational differences in speech patterns
• Emotional state influence on language choices

Expected Output Format: Language enhancement notes with cultural authenticity guidelines enhanced by linguistic insight.`
  },
  
  // ===== FORMAT & ENGAGEMENT (4 ENGINES) =====
  
  'FiveMinuteCanvasEngineV2': {
    name: 'FiveMinuteCanvasEngineV2',
    category: 'format',
    priority: 12,
    timeout: 40000,
    retryCount: 1,
    temperature: 0.9,
    maxTokens: 1100,
    systemPrompt: 'You are a short-form content optimization specialist with advanced creative reasoning. Think deeply about narrative impact within time constraints.',
    taskPrompt: 'Optimize content structure using creative reasoning and pacing for 5-minute episode format.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about attention span psychology and narrative compression.

• Optimal scene count (2-4 scenes) and length distribution
• Attention retention techniques for short-form content
• Narrative compression without quality loss
• Hook placement for sustained engagement (every 60-90 seconds)
• Information density optimization
• Emotional impact maximization in limited time

Expected Output Format: 5-minute optimization recommendations with timing enhanced by psychological analysis.`
  },
  
  'InteractiveChoiceEngineV2': {
    name: 'InteractiveChoiceEngineV2',
    category: 'engagement',
    priority: 13,
    timeout: 45000,
    retryCount: 1,
    temperature: 0.95,
    maxTokens: 1500,
    systemPrompt: 'You are an interactive storytelling expert with advanced creative reasoning. Think deeply about meaningful choices and character agency.',
    taskPrompt: 'Design sophisticated interactive choices using creative reasoning that emerge naturally from episode events and character motivations.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about character psychology and meaningful decision-making.

• Choices emerge naturally from story events and character dilemmas
• Each option represents different character values or approaches
• Genuine consequences that affect future episodes
• Moral complexity with no obvious "right" answer
• Character-specific decision-making opportunities
• Stakes that matter to both character and audience

Expected Output Format: Enhanced choice options with consequence analysis enhanced by psychological insight.`
  },
  
  'TensionEscalationEngine': {
    name: 'TensionEscalationEngine',
    category: 'engagement',
    priority: 14,
    timeout: 40000,
    retryCount: 1,
    temperature: 0.9,
    maxTokens: 1200,
    systemPrompt: 'You are a dramatic tension specialist with advanced creative reasoning. Think deeply about emotional escalation and audience psychology.',
    taskPrompt: 'Enhance dramatic tension using creative reasoning and emotional escalation throughout the episode.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about emotional psychology and tension building.

• Natural tension building through scene progression
• Emotional stakes that increase throughout episode
• Character pressure points and breaking moments
• Conflict escalation that feels inevitable yet surprising
• Tension release moments for audience breathing
• Dramatic peaks strategically placed for maximum impact

Expected Output Format: Tension escalation notes with specific scene enhancement suggestions enhanced by psychological analysis.`
  },
  
  'GenreMasteryEngineV2': {
    name: 'GenreMasteryEngineV2',
    category: 'engagement',
    priority: 15,
    timeout: 40000,
    retryCount: 1,
    temperature: 0.9,
    maxTokens: 1300,
    systemPrompt: 'You are a genre expert with advanced creative reasoning. Think deeply about genre conventions and innovative storytelling approaches.',
    taskPrompt: 'Apply advanced genre-specific storytelling techniques using creative reasoning and innovative approaches.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about genre psychology and audience expectations.

• Genre convention utilization and subversion
• Audience expectation management
• Genre-specific pacing and structure techniques
• Trope usage and innovative variations
• Cross-genre blending when applicable
• Genre authenticity while maintaining originality

Expected Output Format: Genre-specific enhancement recommendations with technique explanations enhanced by creative analysis.`
  },
  
  // ===== GENRE-SPECIFIC ENGINES (4 ENGINES - CONDITIONAL) =====
  
  'ComedyTimingEngineV2': {
    name: 'ComedyTimingEngineV2',
    category: 'genre',
    priority: 16,
    timeout: 40000,
    retryCount: 1,
    temperature: 0.95,
    maxTokens: 1000,
    systemPrompt: 'You are a comedy expert with advanced creative reasoning. Think deeply about timing, rhythm, and comedic psychology.',
    taskPrompt: 'Enhance comedy timing using creative reasoning, beats, and comedic structure throughout the episode.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about comedic psychology and timing patterns.

• Setup-punchline structure with proper timing
• Character-based humor that reveals personality
• Situational comedy emerging from plot circumstances
• Comedic rhythm and beat placement
• Comic relief balanced with dramatic moments
• Running gags and callback humor

Expected Output Format: Comedy enhancement notes with timing specifications enhanced by comedic analysis.`
  },
  
  'HorrorEngineV2': {
    name: 'HorrorEngineV2',
    category: 'genre',
    priority: 17,
    timeout: 45000,
    retryCount: 1,
    temperature: 0.9,
    maxTokens: 1200,
    systemPrompt: 'You are a horror atmosphere specialist with advanced creative reasoning. Think deeply about psychological tension and fear psychology.',
    taskPrompt: 'Enhance horror atmosphere using creative reasoning, psychological tension, and fear elements.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about fear psychology and atmospheric tension.

• Atmospheric tension building through environmental details
• Psychological fear vs cheap jump scares
• Environmental horror through setting manipulation
• Character vulnerability and isolation
• Anticipation and dread creation techniques
• Subtle horror escalation that builds naturally

Expected Output Format: Horror enhancement notes with atmosphere suggestions enhanced by psychological analysis.`
  },
  
  'RomanceChemistryEngineV2': {
    name: 'RomanceChemistryEngineV2',
    category: 'genre',
    priority: 18,
    timeout: 45000,
    retryCount: 1,
    temperature: 0.98, // Maximum creativity for chemistry!
    maxTokens: 1400,
    systemPrompt: 'You are a relationship dynamics expert with advanced creative reasoning. Think deeply about authentic romantic chemistry and emotional connection.',
    taskPrompt: 'Enhance romantic chemistry using creative reasoning, relationship dynamics, and emotional connection between characters.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about romantic psychology and authentic emotional connection.

• Authentic chemistry between characters through subtle moments
• Emotional vulnerability and connection opportunities
• Relationship progression that feels natural and earned
• Romantic tension without cliché or forced interaction
• Character growth through relationship development
• Obstacles that test and ultimately strengthen bonds

Expected Output Format: Romance enhancement notes with chemistry suggestions enhanced by emotional analysis.`
  },
  
  'MysteryEngineV2': {
    name: 'MysteryEngineV2',
    category: 'genre',
    priority: 19,
    timeout: 45000,
    retryCount: 1,
    temperature: 0.9,
    maxTokens: 1300,
    systemPrompt: 'You are a mystery construction expert with advanced creative reasoning. Think deeply about clue placement and revelation psychology.',
    taskPrompt: 'Enhance mystery elements using creative reasoning including clue placement, revelation timing, and investigative progression.',
    specificInstructions: `🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about mystery psychology and fair play principles.

• Fair play clue placement and foreshadowing
• Information revelation timing and pacing
• Red herrings that serve the story and character development
• Investigative progression that feels logical and earned
• Character deduction and reasoning processes
• Mystery resolution that satisfies established expectations

Expected Output Format: Mystery enhancement notes with clue placement strategies enhanced by logical analysis.`
  }
}

// 🚀 GEMINI COMPREHENSIVE ENGINES ORCHESTRATOR
export async function runGeminiComprehensiveEngines(
  episodeJson: any,
  storyBible: any,
  mode: 'beast' | 'stable' = 'beast'
): Promise<{ notes: ComprehensiveEngineNotes; metadata: ComprehensiveEngineMetadata }> {
  const startTime = Date.now()
  console.log('🚀 GEMINI COMPREHENSIVE ENGINES: Starting Gemini 2.5 Pro 19-engine system...')
  
  // Initialize result structure
  const notes: ComprehensiveEngineNotes = {
    fractalNarrative: 'N/A',
    episodeCohesion: 'N/A',
    conflictArchitecture: 'N/A',
    hookCliffhanger: 'N/A',
    serializedContinuity: 'N/A',
    pacingRhythm: 'N/A',
    dialogue: 'N/A',
    strategicDialogue: 'N/A',
    worldBuilding: 'N/A',
    livingWorld: 'N/A',
    language: 'N/A',
    fiveMinuteCanvas: 'N/A',
    interactiveChoice: 'N/A',
    tensionEscalation: 'N/A',
    genreMastery: 'N/A',
    characterDepth: 'N/A',
    themeIntegration: 'N/A',
    storyboard: 'N/A',
    languageStyle: 'N/A'
  }
  
  const metadata: ComprehensiveEngineMetadata = {
    totalEnginesRun: 0,
    successfulEngines: 0,
    failedEngines: 0,
    totalExecutionTime: 0,
    successRate: 0,
    errors: [],
    phaseExecutionTimes: [],
    enginePerformance: {}
  }
  
  // Build complete context (NO TRUNCATION - leverage 2M tokens!)
  const engineContext = buildGeminiEngineContext(episodeJson, storyBible)
  
  try {
    // Execute core engines (15 engines) in parallel
    const coreEngines = [
      'FractalNarrativeEngineV2', 
      'EpisodeCohesionEngineV2', 
      'ConflictArchitectureEngineV2',
      'HookCliffhangerEngineV2', 'SerializedContinuityEngineV2', 'PacingRhythmEngineV2',
      'DialogueEngineV2', 'StrategicDialogueEngine',
      'WorldBuildingEngineV2', 'LivingWorldEngineV2', 'LanguageEngineV2',
      'FiveMinuteCanvasEngineV2', 'InteractiveChoiceEngineV2', 'TensionEscalationEngine', 'GenreMasteryEngineV2'
    ]
    
    console.log(`🚀 GEMINI CORE ENGINES: Executing ${coreEngines.length} engines in parallel...`)
    metadata.totalEnginesRun += coreEngines.length
    
    const coreResults = await executeGeminiEnginesInParallel(coreEngines, engineContext, mode)
    
    // Process core results
    for (const [engineName, result] of Object.entries(coreResults)) {
      const fieldName = getEngineFieldName(engineName)
      if (fieldName && fieldName in notes) {
        (notes as any)[fieldName] = result.success ? result.content : 'N/A'
        metadata.enginePerformance[engineName] = {
          success: result.success,
          executionTime: result.executionTime,
          retryCount: result.retryCount,
          qualityScore: result.qualityScore,
          outputLength: result.content.length,
          error: result.error
        }
        
        if (result.success) {
          metadata.successfulEngines++
        } else {
          metadata.failedEngines++
          metadata.errors.push(`${engineName}: ${result.error || 'Unknown error'}`)
        }
      }
    }
    
    // Determine and execute genre-specific engines
    const genreEngines = determineGenreEngines(storyBible.genre, storyBible.tone)
    if (genreEngines.length > 0) {
      console.log(`🎭 GEMINI GENRE ENGINES: Executing ${genreEngines.length} genre-specific engines...`)
      metadata.totalEnginesRun += genreEngines.length
      
      const genreResults = await executeGeminiEnginesInParallel(genreEngines, engineContext, mode)
      
      // Process genre results
      for (const [engineName, result] of Object.entries(genreResults)) {
        const fieldName = getEngineFieldName(engineName)
        if (fieldName) {
          (notes as any)[fieldName] = result.success ? result.content : 'N/A'
          metadata.enginePerformance[engineName] = {
            success: result.success,
            executionTime: result.executionTime,
            retryCount: result.retryCount,
            qualityScore: result.qualityScore,
            outputLength: result.content.length,
            error: result.error
          }
          
          if (result.success) {
            metadata.successfulEngines++
          } else {
            metadata.failedEngines++
            metadata.errors.push(`${engineName}: ${result.error || 'Unknown error'}`)
          }
        }
      }
    }
    
    // Calculate final metrics
    metadata.totalExecutionTime = Date.now() - startTime
    metadata.successRate = metadata.totalEnginesRun > 0 ? 
      (metadata.successfulEngines / metadata.totalEnginesRun) * 100 : 0
    
    console.log(`🎯 GEMINI COMPREHENSIVE ENGINES: Completed ${metadata.successfulEngines}/${metadata.totalEnginesRun} engines (${metadata.successRate.toFixed(1)}%) in ${metadata.totalExecutionTime}ms`)
    
    return { notes, metadata }
    
  } catch (error) {
    console.error('❌ GEMINI COMPREHENSIVE ENGINES: Critical failure:', error)
    metadata.totalExecutionTime = Date.now() - startTime
    metadata.errors.push(`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { notes, metadata }
  }
}

// 🔄 GEMINI PARALLEL ENGINE EXECUTION
async function executeGeminiEnginesInParallel(
  engineNames: string[],
  context: any,
  mode: 'beast' | 'stable'
): Promise<Record<string, any>> {
  const results: Record<string, any> = {}
  
  // Execute all engines in parallel using Promise.allSettled
  const enginePromises = engineNames.map(async (engineName) => {
    const result = await executeGeminiEngineWithFallback(engineName, context, mode)
    return { engineName, result }
  })
  
  const settledResults = await Promise.allSettled(enginePromises)
  
  // Process results
  settledResults.forEach((settled, index) => {
    const engineName = engineNames[index]
    if (settled.status === 'fulfilled') {
      results[engineName] = settled.value.result
    } else {
      console.warn(`⚠️ Gemini Engine ${engineName} promise failed:`, settled.reason)
      results[engineName] = {
        success: false,
        content: 'N/A',
        executionTime: 0,
        retryCount: 0,
        qualityScore: 0,
        error: settled.reason?.message || 'Promise rejection'
      }
    }
  })
  
  return results
}

// 🛡️ GEMINI ENGINE EXECUTION WITH FALLBACK
async function executeGeminiEngineWithFallback(
  engineName: string,
  context: any,
  mode: 'beast' | 'stable'
): Promise<any> {
  const config = GEMINI_ENGINE_CONFIGURATIONS[engineName as keyof typeof GEMINI_ENGINE_CONFIGURATIONS]
  if (!config) {
    return {
      success: false,
      content: 'N/A',
      executionTime: 0,
      retryCount: 0,
      qualityScore: 0,
      error: 'Engine configuration not found'
    }
  }
  
  const startTime = Date.now()
  let retryCount = 0
  
  for (let attempt = 0; attempt <= config.retryCount; attempt++) {
    try {
      console.log(`🔧 GEMINI ${engineName}: Attempt ${attempt + 1}/${config.retryCount + 1}`)
      
      // Build Gemini-optimized prompt
      const prompt = buildGeminiEnginePrompt(config, context)
      
      const response = await Promise.race([
        generateContentWithGemini(
          config.systemPrompt,
          prompt,
          GEMINI_CONFIG.MODELS.PRO
        ),
        
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), config.timeout)
        )
      ]) as string
      
      const executionTime = Date.now() - startTime
      const qualityScore = assessGeminiOutputQuality(response, config)
      
      console.log(`✅ GEMINI ${engineName}: Success in ${executionTime}ms (quality: ${qualityScore}/100)`)
      
      return {
        success: true,
        content: response,
        executionTime,
        retryCount: attempt,
        qualityScore
      }
      
    } catch (error) {
      retryCount = attempt + 1
      console.warn(`⚠️ GEMINI ${engineName}: Attempt ${attempt + 1} failed:`, error)
      
      if (attempt === config.retryCount) {
        // Final fallback: Generate basic content
        const fallbackContent = generateGeminiFallbackContent(engineName, config)
        const executionTime = Date.now() - startTime
        
        console.log(`🔄 GEMINI ${engineName}: Using fallback content`)
        
        return {
          success: false,
          content: fallbackContent,
          executionTime,
          retryCount,
          qualityScore: 30, // Higher quality for Gemini fallback
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }
}

// 🏗️ GEMINI SUPPORTING FUNCTIONS

function buildGeminiEngineContext(episodeJson: any, storyBible: any): any {
  return {
    seriesTitle: storyBible.seriesTitle || 'Series',
    title: episodeJson.title || 'Episode',
    episodeNumber: episodeJson.episodeNumber || 1,
    synopsis: episodeJson.synopsis || storyBible.premise?.premiseStatement || '',
    genre: storyBible.genre || 'drama',
    theme: storyBible.theme || storyBible.themes?.[0] || '',
    sceneCount: episodeJson.scenes?.length || 1,
    scenes: episodeJson.scenes || [],
    // COMPLETE CHARACTER CONTEXT (NO TRUNCATION - 2M TOKENS AVAILABLE!)
    characters: (storyBible.mainCharacters || []).map((char: any) => ({
      name: char.name || 'Character',
      archetype: char.archetype || char.premiseRole || 'Character',
      description: char.description || char.background || 'Character development in progress',
      arc: char.arc || 'Arc to be developed',
      relationships: char.relationships || 'Relationships to be explored',
      motivation: char.motivation || 'Motivation to be established',
      internalConflict: char.internalConflict || 'Internal journey to unfold',
      voice: char.voice || 'Voice to be developed',
      // Additional character details for Gemini's 2M token context
      background: char.background || 'Character background',
      personality: char.personality || 'Personality traits',
      goals: char.goals || 'Character goals',
      fears: char.fears || 'Character fears',
      secrets: char.secrets || 'Character secrets'
    })),
    worldBuilding: storyBible.worldBuilding || {
      setting: 'Contemporary setting',
      culturalContext: 'Modern society',
      locations: []
    },
    narrativeElements: storyBible.narrativeElements || {
      callbacks: 'To be established',
      foreshadowing: 'To be woven in',
      recurringMotifs: 'To be developed'
    }
  }
}

// Gemini-optimized prompt building with creative reasoning framework
function buildGeminiEnginePrompt(config: any, context: any): string {
  return `${config.taskPrompt}

🎯 GEMINI CREATIVE REASONING FRAMEWORK:
Think deeply about the storytelling elements and character psychology. Use your advanced creative reasoning to provide sophisticated, nuanced recommendations that elevate the narrative quality.

COMPREHENSIVE EPISODE CONTEXT (2M TOKEN CONTEXT - NO TRUNCATION):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Series: ${context.seriesTitle}
Episode: ${context.title} (${context.episodeNumber})
Synopsis: ${context.synopsis}
Genre: ${context.genre} | Theme: ${context.theme}
Scene Count: ${context.sceneCount}

COMPLETE CHARACTER CONTEXT (FULL DETAILS - NO TRUNCATION):
${context.characters.map((char: any, index: number) => `
━━━ ${char.name} (${char.archetype || 'Character'}) ━━━
Description: ${char.description || 'Character development in progress'}
Arc: ${char.arc || 'Arc to be developed'}
Relationships: ${char.relationships || 'Relationships to be explored'}
Motivation: ${char.motivation || 'Motivation to be established'}
Internal Conflict: ${char.internalConflict || 'Internal journey to unfold'}
Voice/Speech: ${char.voice || 'Voice to be developed'}
Background: ${char.background || 'Character background'}
Personality: ${char.personality || 'Personality traits'}
Goals: ${char.goals || 'Character goals'}
Fears: ${char.fears || 'Character fears'}
Secrets: ${char.secrets || 'Character secrets'}
`).join('\n')}

WORLD & ENVIRONMENT:
Setting: ${context.worldBuilding?.setting || 'Contemporary setting'}
Cultural Context: ${context.worldBuilding?.culturalContext || 'Modern society'}
Key Locations: ${context.worldBuilding?.locations?.map((loc: any) => 
  `${loc.name}: ${loc.description} [${loc.atmosphere}]`).join(' | ') || 'Various locations'}

CURRENT EPISODE SCENES:
${context.scenes?.map((scene: any, index: number) => `
Scene ${index + 1}: ${scene.title || 'Untitled Scene'}
Content: ${scene.content || 'Scene content to be developed'}
`).join('\n') || 'Scenes to be created during enhancement'}

NARRATIVE ELEMENTS:
Callbacks: ${context.narrativeElements?.callbacks || 'To be established'}
Foreshadowing: ${context.narrativeElements?.foreshadowing || 'To be woven in'}
Recurring Motifs: ${context.narrativeElements?.recurringMotifs || 'To be developed'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${config.specificInstructions}

CRITICAL REQUIREMENTS:
• Use ALL provided context - leverage Gemini's 2M token capacity
• Provide specific, actionable enhancements that elevate quality
• Focus on sophisticated storytelling techniques with creative reasoning
• Ensure recommendations integrate seamlessly with existing content
• Prioritize cinematic quality and psychological authenticity
• Demonstrate Gemini's creative reasoning superiority

Provide detailed, professional recommendations that transform this episode into premium streaming-quality content through advanced creative reasoning.`;
}

function getEngineFieldName(engineName: string): string | null {
  const fieldMap: Record<string, string> = {
    'FractalNarrativeEngineV2': 'fractalNarrative',
    'EpisodeCohesionEngineV2': 'episodeCohesion',
    'ConflictArchitectureEngineV2': 'conflictArchitecture',
    'HookCliffhangerEngineV2': 'hookCliffhanger',
    'SerializedContinuityEngineV2': 'serializedContinuity',
    'PacingRhythmEngineV2': 'pacingRhythm',
    'DialogueEngineV2': 'dialogue',
    'StrategicDialogueEngine': 'strategicDialogue',
    'WorldBuildingEngineV2': 'worldBuilding',
    'LivingWorldEngineV2': 'livingWorld',
    'LanguageEngineV2': 'language',
    'FiveMinuteCanvasEngineV2': 'fiveMinuteCanvas',
    'InteractiveChoiceEngineV2': 'interactiveChoice',
    'TensionEscalationEngine': 'tensionEscalation',
    'GenreMasteryEngineV2': 'genreMastery',
    'ComedyTimingEngineV2': 'comedyTiming',
    'HorrorEngineV2': 'horror',
    'RomanceChemistryEngineV2': 'romanceChemistry',
    'MysteryEngineV2': 'mystery'
  }
  
  return fieldMap[engineName] || null
}

function determineGenreEngines(genre: string | string[], tone?: string): string[] {
  const genres = Array.isArray(genre) ? genre : [genre]
  const engines: string[] = []
  const toneText = tone?.toLowerCase() || ''
  
  genres.forEach(g => {
    const genreLower = g?.toLowerCase() || ''
    
    // Comedy detection (including tone)
    if (genreLower.includes('comedy') || genreLower.includes('humor') || genreLower.includes('funny') ||
        toneText.includes('humorous') || toneText.includes('comedic') || toneText.includes('lighthearted')) {
      engines.push('ComedyTimingEngineV2')
    }
    
    // Horror/Thriller detection (including tone)
    if (genreLower.includes('horror') || genreLower.includes('thriller') || genreLower.includes('suspense') ||
        genreLower.includes('scary') || toneText.includes('dark') || toneText.includes('ominous') ||
        toneText.includes('suspenseful') || toneText.includes('eerie')) {
      engines.push('HorrorEngineV2')
    }
    
    // Romance detection (including tone)
    if (genreLower.includes('romance') || genreLower.includes('romantic') || genreLower.includes('love') ||
        toneText.includes('romantic') || toneText.includes('intimate') || toneText.includes('passionate')) {
      engines.push('RomanceChemistryEngineV2')
    }
    
    // Mystery detection (including tone)
    if (genreLower.includes('mystery') || genreLower.includes('detective') || genreLower.includes('investigation') ||
        genreLower.includes('noir') || genreLower.includes('crime') || toneText.includes('mysterious') ||
        toneText.includes('enigmatic') || toneText.includes('puzzling')) {
      engines.push('MysteryEngineV2')
    }
  })
  
  return [...new Set(engines)] // Remove duplicates
}

function assessGeminiOutputQuality(content: string, config: any): number {
  let score = 60 // Higher base score for Gemini
  
  // Length check
  if (content.length > 100) score += 15
  if (content.length > 300) score += 15
  if (content.length > 600) score += 10
  
  // Content quality indicators
  if (content.includes('•') || content.includes('-')) score += 10 // Bullet points
  if (content.split('\n').length > 3) score += 5 // Multiple lines
  if (!/N\/A|not available|unclear|generic/i.test(content)) score += 15 // Not generic
  
  // Gemini-specific sophistication indicators
  if (content.includes(':')) score += 10 // Structured format
  if (content.match(/[A-Z][A-Z ]+:/)) score += 5 // Category headers
  if (content.includes('creative reasoning') || content.includes('psychological')) score += 10 // Gemini reasoning
  
  return Math.min(score, 100)
}

function generateGeminiFallbackContent(engineName: string, config: any): string {
  const fallbacks: Record<string, string> = {
    'FractalNarrativeEngineV2': '• Consider recursive themes across scenes using creative reasoning\n• Mirror episode conflicts in character arcs with psychological depth\n• Ensure structural consistency through advanced narrative analysis',
    'EpisodeCohesionEngineV2': '• Maintain character continuity with psychological authenticity\n• Reference previous episodes through creative reasoning\n• Set up future developments with sophisticated foreshadowing',
    'ConflictArchitectureEngineV2': '• Escalate internal conflicts using psychological insight\n• Layer external pressures with creative reasoning\n• Build toward climax through advanced tension analysis',
    'HookCliffhangerEngineV2': '• Create compelling opening hook with psychological engagement\n• Build tension toward cliffhanger using creative reasoning\n• Connect ending to next episode through sophisticated narrative design',
    'SerializedContinuityEngineV2': '• Track character development with psychological authenticity\n• Maintain plot consistency through creative reasoning\n• Reference series history with sophisticated analysis',
    'PacingRhythmEngineV2': '• Balance action and dialogue using psychological timing\n• Vary scene lengths with creative reasoning\n• Optimize for 5-minute format through advanced pacing analysis',
    'DialogueEngineV2': '• Develop character voices with psychological authenticity\n• Add subtext layers using creative reasoning\n• Ensure natural flow through advanced dialogue analysis',
    'StrategicDialogueEngine': '• Purpose-driven conversations with psychological insight\n• Reveal character through speech using creative reasoning\n• Advance plot through dialogue with sophisticated analysis',
    'WorldBuildingEngineV2': '• Enhance environmental details with creative reasoning\n• Ensure world consistency through psychological authenticity\n• Add atmospheric elements with sophisticated analysis',
    'LivingWorldEngineV2': '• Make environment responsive using creative reasoning\n• Add background life with psychological authenticity\n• Create dynamic interactions through advanced analysis',
    'LanguageEngineV2': '• Improve prose rhythm with creative reasoning\n• Enhance cultural authenticity through psychological insight\n• Strengthen narrative voice with sophisticated analysis',
    'FiveMinuteCanvasEngineV2': '• Compress narrative efficiently using creative reasoning\n• Focus on core conflict with psychological depth\n• Ensure complete arc through advanced analysis',
    'InteractiveChoiceEngineV2': '• Create meaningful choices with psychological authenticity\n• Ensure clear consequences using creative reasoning\n• Balance difficulty through sophisticated analysis',
    'TensionEscalationEngine': '• Increase stakes gradually with psychological insight\n• Use dramatic reveals through creative reasoning\n• Maintain emotional pressure with advanced analysis',
    'GenreMasteryEngineV2': '• Apply genre conventions with creative reasoning\n• Subvert expectations through psychological insight\n• Enhance authenticity with sophisticated analysis',
    'ComedyTimingEngineV2': '• Perfect comedic timing with psychological insight\n• Setup-punchline structure using creative reasoning\n• Character-based humor through advanced analysis',
    'HorrorEngineV2': '• Build atmospheric dread with psychological authenticity\n• Psychological tension using creative reasoning\n• Environmental horror through sophisticated analysis',
    'RomanceChemistryEngineV2': '• Authentic emotional connection with psychological insight\n• Natural relationship progression using creative reasoning\n• Chemistry through interaction with advanced analysis',
    'MysteryEngineV2': '• Fair play clue placement with psychological authenticity\n• Logical deduction paths using creative reasoning\n• Satisfying revelations through sophisticated analysis'
  }
  
  return fallbacks[engineName] || '• General enhancement recommendations with creative reasoning\n• Consider narrative improvements through psychological insight\n• Focus on story quality with sophisticated analysis'
}

// Export for backwards compatibility
export default runGeminiComprehensiveEngines;