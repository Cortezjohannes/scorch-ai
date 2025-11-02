/**
 * 🎭 COMPREHENSIVE ENGINE SYSTEM - 19 SOPHISTICATED ENGINES
 * 
 * Complete parallel processing infrastructure for cinematic episode enhancement.
 * Phase 2: Engine Infrastructure Implementation
 */

import { AIOrchestrator } from './ai-orchestrator'
import { ENGINE_MODELS } from './model-config'

// 🎯 COMPREHENSIVE ENGINE NOTES INTERFACE (19 FIELDS)
export interface ComprehensiveEngineNotes {
  // NARRATIVE ARCHITECTURE (6 engines)
  fractalNarrative: string
  episodeCohesion: string
  conflictArchitecture: string
  tensionEscalation: string
  pacingRhythm: string
  fiveMinuteCanvas: string
  
  // DIALOGUE & CHARACTER (2 engines)
  strategicDialogue: string
  characterDepth: string
  
  // WORLD & ENVIRONMENT (3 engines)
  worldBuilding: string
  livingWorld: string
  themeIntegration: string
  
  // FORMAT & ENGAGEMENT (4 engines)
  interactiveChoice: string
  serializedContinuity: string
  storyboard: string
  languageStyle: string
  
  // GENRE-SPECIFIC (4 engines - conditional)
  comedyTiming?: string
  horrorAtmosphere?: string
  romanceChemistry?: string
  mysteryConstruction?: string
}

// 🚀 COMPREHENSIVE ENGINE RESULT WITH METADATA
export interface ComprehensiveEngineResult {
  notes: ComprehensiveEngineNotes
  metadata: {
    totalEngines: number
    successfulEngines: number
    failedEngines: number
    totalExecutionTime: number
    phaseExecutionTimes: number[]
    qualityScore: number
    enginePerformance: Record<string, EngineExecutionMetadata>
  }
}

// 📊 ENGINE EXECUTION METADATA
export interface EngineExecutionMetadata {
  success: boolean
  executionTime: number
  retryCount: number
  qualityScore: number
  outputLength: number
  error?: string
}

// ⚙️ ENGINE CONFIGURATION INTERFACE
export interface EngineConfig {
  name: string
  category: string
  phase: number
  priority: number
  timeout: number
  retryCount: number
  temperature: number
  maxTokens: number
  systemPrompt: string
  taskPrompt: string
  specificInstructions: string
  model?: string
}

// 🎭 COMPREHENSIVE ENGINE CONFIGURATIONS
export const ENGINE_CONFIGURATIONS: Record<string, EngineConfig> = {
  // ===== PHASE 1: NARRATIVE ARCHITECTURE (6 ENGINES) =====
  
  'FractalNarrativeEngineV2': {
    name: 'FractalNarrativeEngineV2',
    category: 'narrative',
    phase: 1,
    priority: 1,
    timeout: 30000,
    retryCount: 2,
    temperature: 0.85,
    maxTokens: 1500,
    model: ENGINE_MODELS['fractal-narrative-engine-v2'],
    systemPrompt: 'You are a master narrative architect specializing in fractal story structures where each part reflects the whole. Expert in recursive themes, nested conflicts, and structural elegance.',
    taskPrompt: 'Analyze the narrative structure and suggest 3-5 sophisticated structural enhancements using fractal narrative principles.',
    specificInstructions: `Focus on:
• Recursive themes that appear at scene, episode, and series levels
• Nested conflicts that mirror the overall story arc
• Structural elegance where each scene reflects the episode's core conflict
• Pattern recognition in character behavior and story beats
• Thematic resonance across different story scales

Return format: Bullet points with specific structural recommendations.`
  },
  
  'EpisodeCohesionEngineV2': {
    name: 'EpisodeCohesionEngineV2',
    category: 'narrative',
    phase: 1,
    priority: 2,
    timeout: 25000,
    retryCount: 2,
    temperature: 0.8,
    maxTokens: 1200,
    model: ENGINE_MODELS['episode-cohesion-engine-v2'],
    systemPrompt: 'You are a series continuity expert ensuring perfect episode-to-episode flow and series coherence.',
    taskPrompt: 'Analyze episode cohesion and suggest 3-5 enhancements for series continuity and flow.',
    specificInstructions: `Focus on:
• Character development consistency across episodes
• Plot thread continuity and resolution
• Thematic progression and series arc advancement
• Callbacks and references to previous episodes
• Setup for future episode developments

Return format: Numbered continuity recommendations.`
  },
  
  'ConflictArchitectureEngineV2': {
    name: 'ConflictArchitectureEngineV2',
    category: 'narrative',
    phase: 1,
    priority: 3,
    timeout: 25000,
    retryCount: 2,
    temperature: 0.85,
    maxTokens: 1300,
    model: ENGINE_MODELS['conflict-architecture-engine-v2'],
    systemPrompt: 'You are a conflict architecture specialist designing multi-layered dramatic tensions and character conflicts.',
    taskPrompt: 'Analyze the conflict structure and suggest 3-5 enhancements for dramatic tension and character conflict.',
    specificInstructions: `Focus on:
• Internal vs external conflicts for each character
• Conflict escalation throughout the episode
• Character motivations driving conflict
• Resolution approaches that maintain tension
• Multi-layered conflicts that intersect meaningfully

Return format: Conflict enhancement bullet points.`
  },
  
  'TensionEscalationEngine': {
    name: 'TensionEscalationEngine',
    category: 'narrative',
    phase: 1,
    priority: 4,
    timeout: 20000,
    retryCount: 2,
    temperature: 0.8,
    maxTokens: 1000,
    model: ENGINE_MODELS['tension-escalation-engine'],
    systemPrompt: 'You are a tension escalation expert creating mounting dramatic pressure and emotional stakes.',
    taskPrompt: 'Analyze dramatic tension and suggest 3-5 specific escalation techniques for maximum emotional impact.',
    specificInstructions: `Focus on:
• Scene-by-scene tension building
• Emotional stakes escalation
• Conflict pressure points
• Dramatic reveals and surprises
• Sustained tension without exhausting audience

Return format: Tension escalation techniques.`
  },
  
  'PacingRhythmEngineV2': {
    name: 'PacingRhythmEngineV2',
    category: 'narrative',
    phase: 1,
    priority: 5,
    timeout: 20000,
    retryCount: 2,
    temperature: 0.75,
    maxTokens: 1000,
    model: ENGINE_MODELS['pacing-rhythm-engine-v2'],
    systemPrompt: 'You are a pacing and rhythm specialist optimizing the flow and timing of narrative beats.',
    taskPrompt: 'Analyze episode pacing and suggest 3-5 rhythm adjustments for optimal flow and timing.',
    specificInstructions: `Focus on:
• Scene length and transition timing
• Dialogue rhythm and breathing space
• Action vs quiet moment balance
• Emotional beat spacing
• 5-minute runtime optimization

Return format: Pacing adjustment recommendations.`
  },
  
  'FiveMinuteCanvasEngineV2': {
    name: 'FiveMinuteCanvasEngineV2',
    category: 'narrative',
    phase: 1,
    priority: 6,
    timeout: 20000,
    retryCount: 2,
    temperature: 0.8,
    maxTokens: 1100,
    model: ENGINE_MODELS['five-minute-canvas-engine-v2'],
    systemPrompt: 'You are a five-minute format specialist maximizing storytelling impact within strict time constraints.',
    taskPrompt: 'Analyze the episode for 5-minute format optimization and suggest 3-5 structural refinements.',
    specificInstructions: `Focus on:
• Maximum story impact in minimal time
• Efficient scene transitions
• Compressed character development
• Quick audience engagement
• Complete narrative arc within constraints

Return format: Format optimization suggestions.`
  },
  
  // ===== PHASE 2: DIALOGUE & CHARACTER (2 ENGINES) =====
  
  'StrategicDialogueEngine': {
    name: 'StrategicDialogueEngine',
    category: 'dialogue',
    phase: 2,
    priority: 1,
    timeout: 25000,
    retryCount: 2,
    temperature: 0.9,
    maxTokens: 1400,
    model: ENGINE_MODELS['strategic-dialogue-engine'],
    systemPrompt: 'You are a dialogue master crafting character-specific voices with layered subtext and natural flow.',
    taskPrompt: 'Analyze dialogue and suggest 4-6 strategic enhancements for character voice and subtext.',
    specificInstructions: `Focus on:
• Unique voice patterns for each character
• Subtext and underlying emotions
• Conflict revelation through dialogue
• Natural conversation flow
• Cultural authenticity and speech patterns

Return format: Character-specific dialogue improvements.`
  },
  
  'CharacterEngineV2': {
    name: 'CharacterEngineV2',
    category: 'character',
    phase: 2,
    priority: 2,
    timeout: 30000,
    retryCount: 2,
    temperature: 0.85,
    maxTokens: 1500,
    model: ENGINE_MODELS['character-engine-v2'],
    systemPrompt: 'You are a character development expert creating deep psychological profiles and authentic character arcs.',
    taskPrompt: 'Analyze character development and suggest 4-6 enhancements for psychological depth and authenticity.',
    specificInstructions: `Focus on:
• Psychological motivation consistency
• Character arc progression
• Authentic behavioral patterns
• Relationship dynamics
• Internal/external character conflicts

Return format: Character development recommendations.`
  },
  
  // ===== PHASE 3: WORLD & ENVIRONMENT (3 ENGINES) =====
  
  'WorldBuildingEngineV2': {
    name: 'WorldBuildingEngineV2',
    category: 'world',
    phase: 3,
    priority: 1,
    timeout: 25000,
    retryCount: 2,
    temperature: 0.85,
    maxTokens: 1300,
    model: ENGINE_MODELS['world-building-engine-v2'],
    systemPrompt: 'You are a world-building expert creating immersive, consistent environments with rich detail.',
    taskPrompt: 'Analyze world-building elements and suggest 3-5 enhancements for environmental immersion.',
    specificInstructions: `Focus on:
• Environmental consistency and logic
• Sensory details and atmosphere
• Cultural authenticity
• Location-specific mood and tone
• World rules and constraints

Return format: World-building enhancement suggestions.`
  },
  
  'LivingWorldEngineV2': {
    name: 'LivingWorldEngineV2',
    category: 'world',
    phase: 3,
    priority: 2,
    timeout: 25000,
    retryCount: 2,
    temperature: 0.8,
    maxTokens: 1200,
    model: ENGINE_MODELS['living-world-engine-v2'],
    systemPrompt: 'You are a living world specialist making environments dynamic and responsive to character actions.',
    taskPrompt: 'Analyze world dynamism and suggest 3-5 enhancements for interactive, responsive environments.',
    specificInstructions: `Focus on:
• Environmental response to character actions
• Background activity and life
• Ambient storytelling through environment
• World state changes and consequences
• Ecosystem relationships and dynamics

Return format: Dynamic world suggestions.`
  },
  
  'ThemeIntegrationEngineV2': {
    name: 'ThemeIntegrationEngineV2',
    category: 'theme',
    phase: 3,
    priority: 3,
    timeout: 20000,
    retryCount: 2,
    temperature: 0.85,
    maxTokens: 1100,
    model: ENGINE_MODELS['theme-integration-engine-v2'],
    systemPrompt: 'You are a thematic specialist weaving deep themes seamlessly through narrative, character, and environment.',
    taskPrompt: 'Analyze thematic integration and suggest 3-5 enhancements for deeper theme resonance.',
    specificInstructions: `Focus on:
• Thematic consistency across all elements
• Subtle theme integration in action and dialogue
• Symbolic representation and metaphor
• Theme-driven character decisions
• Universal themes in specific contexts

Return format: Thematic enhancement recommendations.`
  },
  
  // ===== PHASE 4: FORMAT & ENGAGEMENT (4 ENGINES) =====
  
  'InteractiveChoiceEngineV2': {
    name: 'InteractiveChoiceEngineV2',
    category: 'engagement',
    phase: 4,
    priority: 1,
    timeout: 25000,
    retryCount: 2,
    temperature: 0.85,
    maxTokens: 1200,
    model: ENGINE_MODELS['interactive-choice-engine-v2'],
    systemPrompt: 'You are an interactive choice architect creating meaningful decisions that impact story direction.',
    taskPrompt: 'Analyze branching choices and suggest 3 enhanced options with clear consequences and stakes.',
    specificInstructions: `Focus on:
• Meaningful choice differentiation
• Clear consequence implications
• Character agency and motivation
• Series impact and progression
• Balanced choice difficulty and appeal

Return format: Three enhanced choice options with stakes.`
  },
  
  'SerializedContinuityEngineV2': {
    name: 'SerializedContinuityEngineV2',
    category: 'continuity',
    phase: 4,
    priority: 2,
    timeout: 20000,
    retryCount: 2,
    temperature: 0.75,
    maxTokens: 1000,
    model: ENGINE_MODELS['serialized-continuity-engine-v2'],
    systemPrompt: 'You are a serialization expert ensuring perfect continuity across episodes and story arcs.',
    taskPrompt: 'Analyze series continuity and suggest 3-5 enhancements for episode-to-episode consistency.',
    specificInstructions: `Focus on:
• Character trait consistency
• Plot thread tracking
• World state continuity
• Reference and callback opportunities
• Series progression tracking

Return format: Continuity improvement suggestions.`
  },
  
  'StoryboardEngineV2': {
    name: 'StoryboardEngineV2',
    category: 'visual',
    phase: 4,
    priority: 3,
    timeout: 25000,
    retryCount: 2,
    temperature: 0.8,
    maxTokens: 1300,
    model: ENGINE_MODELS['storyboard-engine-v2'],
    systemPrompt: 'You are a visual storytelling expert translating narrative into cinematic sequences and shot compositions.',
    taskPrompt: 'Analyze visual storytelling and suggest 4-6 enhancements for cinematic presentation.',
    specificInstructions: `Focus on:
• Visual narrative flow
• Shot composition suggestions
• Visual metaphor and symbolism
• Cinematic transitions
• Emotional visual storytelling

Return format: Visual storytelling recommendations.`
  },
  
  'LanguageEngineV2': {
    name: 'LanguageEngineV2',
    category: 'language',
    phase: 4,
    priority: 4,
    timeout: 20000,
    retryCount: 2,
    temperature: 0.8,
    maxTokens: 1000,
    model: ENGINE_MODELS['language-engine-v2'],
    systemPrompt: 'You are a language specialist optimizing prose style, rhythm, and cultural authenticity.',
    taskPrompt: 'Analyze language style and suggest 3-5 enhancements for prose quality and cultural authenticity.',
    specificInstructions: `Focus on:
• Prose rhythm and flow
• Cultural language authenticity
• Sensory language and imagery
• Emotional resonance through word choice
• Consistent narrative voice

Return format: Language enhancement suggestions.`
  },
  
  // ===== PHASE 5: GENRE-SPECIFIC ENGINES (CONDITIONAL) =====
  
  'ComedyTimingEngineV2': {
    name: 'ComedyTimingEngineV2',
    category: 'genre',
    phase: 5,
    priority: 1,
    timeout: 20000,
    retryCount: 2,
    temperature: 0.9,
    maxTokens: 1000,
    model: ENGINE_MODELS['comedy-timing-engine-v2'],
    systemPrompt: 'You are a comedy timing expert optimizing humor beats, setup-payoff structures, and comedic pacing.',
    taskPrompt: 'Analyze comedic elements and suggest 3-5 timing enhancements for maximum humor impact.',
    specificInstructions: `Focus on:
• Comedy beat timing and rhythm
• Setup and payoff structures
• Character-based humor authenticity
• Subversive comedy opportunities
• Comedic relief balance

Return format: Comedy timing improvements.`
  },
  
  'HorrorAtmosphereEngineV2': {
    name: 'HorrorAtmosphereEngineV2',
    category: 'genre',
    phase: 5,
    priority: 1,
    timeout: 25000,
    retryCount: 2,
    temperature: 0.85,
    maxTokens: 1200,
    model: ENGINE_MODELS['horror-atmosphere-engine-v2'],
    systemPrompt: 'You are a horror atmosphere specialist creating psychological tension and unsettling environments.',
    taskPrompt: 'Analyze horror elements and suggest 3-5 atmospheric enhancements for psychological impact.',
    specificInstructions: `Focus on:
• Psychological tension building
• Atmospheric detail and mood
• Dread escalation techniques
• Horror element subtlety
• Fear psychology and anticipation

Return format: Horror atmosphere enhancements.`
  },
  
  'RomanceChemistryEngineV2': {
    name: 'RomanceChemistryEngineV2',
    category: 'genre',
    phase: 5,
    priority: 1,
    timeout: 25000,
    retryCount: 2,
    temperature: 0.9,
    maxTokens: 1200,
    model: ENGINE_MODELS['romance-chemistry-engine-v2'],
    systemPrompt: 'You are a romance chemistry expert crafting authentic emotional connections and relationship dynamics.',
    taskPrompt: 'Analyze romantic elements and suggest 3-5 chemistry enhancements for emotional authenticity.',
    specificInstructions: `Focus on:
• Authentic emotional connection
• Romantic tension building
• Chemistry through dialogue and action
• Relationship progression authenticity
• Romantic moment timing

Return format: Romance chemistry improvements.`
  },
  
  'MysteryConstructionEngineV2': {
    name: 'MysteryConstructionEngineV2',
    category: 'genre',
    phase: 5,
    priority: 1,
    timeout: 25000,
    retryCount: 2,
    temperature: 0.8,
    maxTokens: 1300,
    model: ENGINE_MODELS['mystery-construction-engine-v2'],
    systemPrompt: 'You are a mystery construction expert designing clues, red herrings, and revelation structures.',
    taskPrompt: 'Analyze mystery elements and suggest 3-5 construction enhancements for intrigue and revelation.',
    specificInstructions: `Focus on:
• Clue placement and discovery
• Red herring balance
• Mystery revelation pacing
• Logical deduction pathways
• Suspense maintenance

Return format: Mystery construction improvements.`
  }
}

// 🚀 PARALLEL PROCESSING PHASE DEFINITIONS
export const ENGINE_PHASES = {
  1: ['FractalNarrativeEngineV2', 'EpisodeCohesionEngineV2', 'ConflictArchitectureEngineV2', 'TensionEscalationEngine', 'PacingRhythmEngineV2', 'FiveMinuteCanvasEngineV2'],
  2: ['StrategicDialogueEngine', 'CharacterEngineV2'],
  3: ['WorldBuildingEngineV2', 'LivingWorldEngineV2', 'ThemeIntegrationEngineV2'],
  4: ['InteractiveChoiceEngineV2', 'SerializedContinuityEngineV2', 'StoryboardEngineV2', 'LanguageEngineV2'],
  5: [] // Populated dynamically based on genre
}

// 🎯 MAIN COMPREHENSIVE ENGINES FUNCTION
export async function runComprehensiveEngines(
  episodeJson: any,
  storyBible: any,
  mode: 'beast' | 'stable' = 'beast',
  options: {
    includeGenreEngines?: boolean
    maxConcurrency?: number
    timeoutOverride?: number
  } = {}
): Promise<ComprehensiveEngineResult> {
  const startTime = Date.now()
  console.log('🔥 COMPREHENSIVE ENGINES: Starting 19-engine enhancement system...')
  
  const {
    includeGenreEngines = true,
    maxConcurrency = 5,
    timeoutOverride
  } = options
  
  // Initialize result structure
  const notes: ComprehensiveEngineNotes = {
    fractalNarrative: 'N/A',
    episodeCohesion: 'N/A',
    conflictArchitecture: 'N/A',
    tensionEscalation: 'N/A',
    pacingRhythm: 'N/A',
    fiveMinuteCanvas: 'N/A',
    strategicDialogue: 'N/A',
    characterDepth: 'N/A',
    worldBuilding: 'N/A',
    livingWorld: 'N/A',
    themeIntegration: 'N/A',
    interactiveChoice: 'N/A',
    serializedContinuity: 'N/A',
    storyboard: 'N/A',
    languageStyle: 'N/A'
  }
  
  const metadata = {
    totalEngines: 0,
    successfulEngines: 0,
    failedEngines: 0,
    totalExecutionTime: 0,
    phaseExecutionTimes: [] as number[],
    qualityScore: 0,
    enginePerformance: {} as Record<string, EngineExecutionMetadata>
  }
  
  // Build complete context using Phase 1 foundation
  const engineContext = buildCompleteEngineContext(episodeJson, storyBible)
  
  try {
    // Execute engines in 5 phases
    for (let phase = 1; phase <= 5; phase++) {
      const phaseStartTime = Date.now()
      
      let phaseEngines: string[]
      if (phase === 5) {
        // Phase 5: Determine genre-specific engines dynamically
        phaseEngines = includeGenreEngines ? determineGenreEngines(storyBible.genre, storyBible.tone) : []
      } else {
        phaseEngines = ENGINE_PHASES[phase as keyof typeof ENGINE_PHASES]
      }
      
      if (phaseEngines.length === 0) {
        console.log(`⏭️ PHASE ${phase}: No engines to execute`)
        metadata.phaseExecutionTimes.push(0)
        continue
      }
      
      console.log(`🚀 PHASE ${phase}: Executing ${phaseEngines.length} engines in parallel`)
      metadata.totalEngines += phaseEngines.length
      
      // Execute phase engines in parallel
      const phaseResults = await executeEnginePhase(
        phaseEngines,
        engineContext,
        mode,
        timeoutOverride
      )
      
      // Process phase results
      for (const [engineName, result] of Object.entries(phaseResults)) {
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
          }
        }
      }
      
      const phaseTime = Date.now() - phaseStartTime
      metadata.phaseExecutionTimes.push(phaseTime)
      console.log(`✅ PHASE ${phase}: Completed in ${phaseTime}ms`)
    }
    
    // Calculate overall metrics
    metadata.totalExecutionTime = Date.now() - startTime
    metadata.qualityScore = calculateQualityScore(metadata.enginePerformance)
    
    console.log(`🎯 COMPREHENSIVE ENGINES: Completed ${metadata.successfulEngines}/${metadata.totalEngines} engines in ${metadata.totalExecutionTime}ms`)
    console.log(`📊 Quality Score: ${metadata.qualityScore}/100`)
    
    return { notes, metadata }
    
  } catch (error) {
    console.error('❌ COMPREHENSIVE ENGINES: Critical failure:', error)
    metadata.totalExecutionTime = Date.now() - startTime
    return { notes, metadata }
  }
}

// 🔄 PHASE EXECUTION WITH PARALLEL PROCESSING
async function executeEnginePhase(
  engineNames: string[],
  context: any,
  mode: 'beast' | 'stable',
  timeoutOverride?: number
): Promise<Record<string, any>> {
  const results: Record<string, any> = {}
  
  // Execute all engines in parallel using Promise.allSettled
  const enginePromises = engineNames.map(async (engineName) => {
    const result = await executeEngineWithFallback(engineName, context, mode, timeoutOverride)
    return { engineName, result }
  })
  
  const settledResults = await Promise.allSettled(enginePromises)
  
  // Process results
  settledResults.forEach((settled, index) => {
    const engineName = engineNames[index]
    if (settled.status === 'fulfilled') {
      results[engineName] = settled.value.result
    } else {
      console.warn(`⚠️ Engine ${engineName} promise failed:`, settled.reason)
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

// 🛡️ ENGINE EXECUTION WITH COMPREHENSIVE FALLBACK
async function executeEngineWithFallback(
  engineName: string,
  context: any,
  mode: 'beast' | 'stable',
  timeoutOverride?: number
): Promise<any> {
  const config = ENGINE_CONFIGURATIONS[engineName]
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
  const timeout = timeoutOverride || config.timeout
  let retryCount = 0
  
  for (let attempt = 0; attempt <= config.retryCount; attempt++) {
    try {
      console.log(`🔧 ${engineName}: Attempt ${attempt + 1}/${config.retryCount + 1}`)
      
      const prompt = `${config.taskPrompt}\n\nCONTEXT:\n${JSON.stringify(context, null, 2)}\n\nSPECIFIC INSTRUCTIONS:\n${config.specificInstructions}`
      
      const response = await Promise.race([
        AIOrchestrator.generateContent({
          prompt,
          systemPrompt: config.systemPrompt,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          mode,
          model: config.model
        }, engineName),
        
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]) as any
      
      const executionTime = Date.now() - startTime
      const qualityScore = assessOutputQuality(response.content, config)
      
      console.log(`✅ ${engineName}: Success in ${executionTime}ms (quality: ${qualityScore}/100)`)
      
      return {
        success: true,
        content: response.content,
        executionTime,
        retryCount: attempt,
        qualityScore
      }
      
    } catch (error) {
      retryCount = attempt + 1
      console.warn(`⚠️ ${engineName}: Attempt ${attempt + 1} failed:`, error)
      
      if (attempt === config.retryCount) {
        // Final fallback: Generate basic content
        const fallbackContent = generateFallbackContent(engineName, config)
        const executionTime = Date.now() - startTime
        
        console.log(`🔄 ${engineName}: Using fallback content`)
        
        return {
          success: false,
          content: fallbackContent,
          executionTime,
          retryCount,
          qualityScore: 25, // Low quality for fallback
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }
}

// 🏗️ SUPPORTING FUNCTIONS

function buildCompleteEngineContext(episodeJson: any, storyBible: any): any {
  return {
    episode: {
      title: episodeJson.title,
      synopsis: episodeJson.synopsis,
      scenes: episodeJson.scenes,
      sceneCount: episodeJson.scenes?.length || 1,
      branchingOptions: episodeJson.branchingOptions
    },
    storyBible: {
      seriesTitle: storyBible.seriesTitle,
      premise: storyBible.premise,
      genre: storyBible.genre,
      tone: storyBible.tone,
      mainCharacters: storyBible.mainCharacters, // No truncation!
      worldBuilding: storyBible.worldBuilding,
      themes: storyBible.themes,
      setting: storyBible.setting,
      locations: storyBible.locations,
      relationships: storyBible.relationships,
      narrativeElements: storyBible.narrativeElements
    },
    context: {
      targetRuntime: '5 minutes',
      format: 'episodic series',
      audience: 'general',
      platform: 'streaming'
    }
  }
}

function getEngineFieldName(engineName: string): string | null {
  const fieldMap: Record<string, string> = {
    'FractalNarrativeEngineV2': 'fractalNarrative',
    'EpisodeCohesionEngineV2': 'episodeCohesion',
    'ConflictArchitectureEngineV2': 'conflictArchitecture',
    'TensionEscalationEngine': 'tensionEscalation',
    'PacingRhythmEngineV2': 'pacingRhythm',
    'FiveMinuteCanvasEngineV2': 'fiveMinuteCanvas',
    'StrategicDialogueEngine': 'strategicDialogue',
    'CharacterEngineV2': 'characterDepth',
    'WorldBuildingEngineV2': 'worldBuilding',
    'LivingWorldEngineV2': 'livingWorld',
    'ThemeIntegrationEngineV2': 'themeIntegration',
    'InteractiveChoiceEngineV2': 'interactiveChoice',
    'SerializedContinuityEngineV2': 'serializedContinuity',
    'StoryboardEngineV2': 'storyboard',
    'LanguageEngineV2': 'languageStyle',
    'ComedyTimingEngineV2': 'comedyTiming',
    'HorrorAtmosphereEngineV2': 'horrorAtmosphere',
    'RomanceChemistryEngineV2': 'romanceChemistry',
    'MysteryConstructionEngineV2': 'mysteryConstruction'
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
      engines.push('HorrorAtmosphereEngineV2')
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
      engines.push('MysteryConstructionEngineV2')
    }
  })
  
  return [...new Set(engines)] // Remove duplicates
}

function calculateQualityScore(performance: Record<string, EngineExecutionMetadata>): number {
  const engines = Object.values(performance)
  if (engines.length === 0) return 0
  
  const averageQuality = engines.reduce((sum, engine) => sum + engine.qualityScore, 0) / engines.length
  const successRate = engines.filter(e => e.success).length / engines.length * 100
  
  // Weight quality and success rate
  return Math.round((averageQuality * 0.7) + (successRate * 0.3))
}

function assessOutputQuality(content: string, config: EngineConfig): number {
  let score = 50 // Base score
  
  // Length check
  if (content.length > 100) score += 20
  if (content.length > 300) score += 10
  
  // Content quality indicators
  if (content.includes('•') || content.includes('-')) score += 10 // Bullet points
  if (content.split('\n').length > 2) score += 10 // Multiple lines
  if (!/N\/A|not available|unclear/i.test(content)) score += 10 // Not generic
  
  return Math.min(score, 100)
}

function generateFallbackContent(engineName: string, config: EngineConfig): string {
  const fallbacks: Record<string, string> = {
    'FractalNarrativeEngineV2': '• Consider recursive themes across scenes\n• Mirror episode conflicts in character arcs\n• Ensure structural consistency',
    'EpisodeCohesionEngineV2': '• Maintain character continuity\n• Reference previous episodes\n• Set up future developments',
    'ConflictArchitectureEngineV2': '• Escalate internal conflicts\n• Layer external pressures\n• Build toward climax',
    'TensionEscalationEngine': '• Increase stakes gradually\n• Use dramatic reveals\n• Maintain emotional pressure',
    'PacingRhythmEngineV2': '• Balance action and dialogue\n• Vary scene lengths\n• Optimize for 5-minute format',
    'FiveMinuteCanvasEngineV2': '• Compress narrative efficiently\n• Focus on core conflict\n• Ensure complete arc',
    'StrategicDialogueEngine': '• Develop character voices\n• Add subtext layers\n• Ensure natural flow',
    'CharacterEngineV2': '• Deepen motivations\n• Show character growth\n• Maintain consistency',
    'WorldBuildingEngineV2': '• Enhance environmental details\n• Ensure world consistency\n• Add atmospheric elements',
    'LivingWorldEngineV2': '• Make environment responsive\n• Add background life\n• Create dynamic interactions',
    'ThemeIntegrationEngineV2': '• Weave themes subtly\n• Use symbolic elements\n• Maintain thematic consistency',
    'InteractiveChoiceEngineV2': '• Create meaningful choices\n• Ensure clear consequences\n• Balance difficulty',
    'SerializedContinuityEngineV2': '• Track character development\n• Maintain plot consistency\n• Reference series history',
    'StoryboardEngineV2': '• Plan visual sequences\n• Consider shot composition\n• Enhance cinematic flow',
    'LanguageEngineV2': '• Improve prose rhythm\n• Enhance cultural authenticity\n• Strengthen narrative voice'
  }
  
  return fallbacks[engineName] || '• General enhancement recommendations\n• Consider narrative improvements\n• Focus on story quality'
}

// Export for backwards compatibility
export default runComprehensiveEngines;
