/**
 * 🎭 REELED AI ENGINE ORCHESTRATOR
 * Supreme engine management system that prioritizes V2 engines and provides
 * real-time progress tracking for animated loading screens
 */

export interface EngineStatus {
  id: string
  name: string
  version: 'v1' | 'v2' | 'latest'
  category: 'core' | 'genre' | 'production' | 'enhancement'
  status: 'idle' | 'initializing' | 'active' | 'completing' | 'complete' | 'error'
  progress: number
  currentTask?: string
  estimatedTime: number
  priority: number
  isActive: boolean
}

export interface ProcessPhase {
  id: string
  name: string
  description: string
  engines: string[]
  progress: number
  status: 'pending' | 'active' | 'complete'
  estimatedTime: number
}

export interface LoadingState {
  currentPhase: ProcessPhase
  allPhases: ProcessPhase[]
  activeEngines: EngineStatus[]
  overallProgress: number
  totalEstimatedTime: number
  elapsedTime: number
  currentTask: string
  isComplete: boolean
}

// 🚀 PRIORITIZED ENGINE REGISTRY - V2 FIRST!
export const ENGINE_REGISTRY = {
  // ⚡ CORE ENGINES (Always Active)
  core: [
    {
      id: 'premise-v2',
      name: 'Premise Engine V2',
      version: 'v2' as const,
      category: 'core' as const,
      priority: 1,
      estimatedTime: 3000,
      description: 'Generates premise-driven story foundation with Egri\'s equation'
    },
    {
      id: 'character-3d-v2',
      name: '3D Character Engine V2',
      version: 'v2' as const,
      category: 'core' as const,
      priority: 2,
      estimatedTime: 4000,
      description: 'Creates psychologically complex characters with physiology, sociology, psychology'
    },
    {
      id: 'fractal-narrative-v2',
      name: 'Fractal Narrative Engine V2',
      version: 'v2' as const,
      category: 'core' as const,
      priority: 3,
      estimatedTime: 3500,
      description: 'Structures adaptive narrative arcs with variable episode counts'
    },
    {
      id: 'strategic-dialogue',
      name: 'Strategic Dialogue Engine',
      version: 'latest' as const,
      category: 'core' as const,
      priority: 4,
      estimatedTime: 2500,
      description: 'Crafts character voices and purposeful dialogue'
    },
    {
      id: 'world-building-v2',
      name: 'World Building Engine V2',
      version: 'v2' as const,
      category: 'core' as const,
      priority: 5,
      estimatedTime: 2000,
      description: 'Creates immersive settings and locations'
    }
  ],

  // 🎭 GENRE ENGINES (Conditional)
  genre: [
    {
      id: 'comedy-timing-v2',
      name: 'Comedy Timing Engine V2',
      version: 'v2' as const,
      category: 'genre' as const,
      priority: 6,
      estimatedTime: 2000,
      description: 'Perfect comedic pacing and timing'
    },
    {
      id: 'horror-atmosphere-v2',
      name: 'Horror Atmosphere Engine V2',
      version: 'v2' as const,
      category: 'genre' as const,
      priority: 7,
      estimatedTime: 2500,
      description: 'Creates spine-chilling atmosphere and tension'
    },
    {
      id: 'romance-chemistry-v2',
      name: 'Romance Chemistry Engine V2',
      version: 'v2' as const,
      category: 'genre' as const,
      priority: 8,
      estimatedTime: 2200,
      description: 'Builds authentic romantic connections'
    },
    {
      id: 'mystery-construction-v2',
      name: 'Mystery Construction Engine V2',
      version: 'v2' as const,
      category: 'genre' as const,
      priority: 9,
      estimatedTime: 2800,
      description: 'Crafts intricate mystery plots and clues'
    },
    {
      id: 'tension-escalation',
      name: 'Tension Escalation Engine',
      version: 'latest' as const,
      category: 'genre' as const,
      priority: 10,
      estimatedTime: 2300,
      description: 'Builds emotional intensity and stakes'
    }
  ],

  // 🎬 PRODUCTION ENGINES (Pre/Post Production)
  production: [
    {
      id: 'storyboard-v2',
      name: 'Storyboard Engine V2',
      version: 'v2' as const,
      category: 'production' as const,
      priority: 11,
      estimatedTime: 3000,
      description: 'Visual scene planning and shot composition'
    },
    {
      id: 'casting-v2',
      name: 'Casting Engine V2',
      version: 'v2' as const,
      category: 'production' as const,
      priority: 12,
      estimatedTime: 2500,
      description: 'Character casting and performance direction'
    },
    {
      id: 'location-scouting-v2',
      name: 'Location Engine V2',
      version: 'v2' as const,
      category: 'production' as const,
      priority: 13,
      estimatedTime: 2000,
      description: 'Location scouting and set design'
    },
    {
      id: 'sound-design-v2',
      name: 'Sound Design Engine V2',
      version: 'v2' as const,
      category: 'production' as const,
      priority: 14,
      estimatedTime: 2200,
      description: 'Audio landscape and music scoring'
    },
    {
      id: 'visual-storytelling-v2',
      name: 'Visual Storytelling Engine V2',
      version: 'v2' as const,
      category: 'production' as const,
      priority: 15,
      estimatedTime: 2800,
      description: 'Cinematography and visual narrative'
    },
    {
      id: 'production-scheduling-v2',
      name: 'Production Engine V2',
      version: 'v2' as const,
      category: 'production' as const,
      priority: 16,
      estimatedTime: 1800,
      description: 'Production scheduling and resource management'
    }
  ],

  // ✨ ENHANCEMENT ENGINES (Quality & Polish)
  enhancement: [
    {
      id: 'interactive-choice-v2',
      name: 'Choice Engine V2',
      version: 'v2' as const,
      category: 'enhancement' as const,
      priority: 17,
      estimatedTime: 2000,
      description: 'Interactive branching narratives'
    },
    {
      id: 'living-world-v2',
      name: 'Living World Engine V2',
      version: 'v2' as const,
      category: 'enhancement' as const,
      priority: 18,
      estimatedTime: 1500,
      description: 'Dynamic character entry and exit'
    },
    {
      id: 'theme-integration-v2',
      name: 'Theme Integration Engine V2',
      version: 'v2' as const,
      category: 'enhancement' as const,
      priority: 19,
      estimatedTime: 1800,
      description: 'Cohesive thematic development'
    },
    {
      id: 'pacing-rhythm-v2',
      name: 'Pacing Engine V2',
      version: 'v2' as const,
      category: 'enhancement' as const,
      priority: 20,
      estimatedTime: 2000,
      description: 'Perfect narrative pacing and rhythm'
    },
    {
      id: 'engagement-v2',
      name: 'Engagement Engine V2',
      version: 'v2' as const,
      category: 'enhancement' as const,
      priority: 21,
      estimatedTime: 1600,
      description: 'Audience engagement optimization'
    }
  ]
}

// 🎯 PROCESS PHASE DEFINITIONS
export const PROCESS_PHASES = {
  storyBible: [
    {
      id: 'foundation',
      name: 'Foundation',
      description: 'Building story premise and core framework',
      engines: ['premise-v2', 'world-building-v2'],
      estimatedTime: 5000
    },
    {
      id: 'character-creation',
      name: 'Character Creation',
      description: 'Generating 3D psychological character profiles',
      engines: ['character-3d-v2', 'strategic-dialogue'],
      estimatedTime: 6500
    },
    {
      id: 'narrative-structure',
      name: 'Narrative Structure',
      description: 'Crafting adaptive narrative arcs and episodes',
      engines: ['fractal-narrative-v2', 'theme-integration-v2', 'pacing-rhythm-v2'],
      estimatedTime: 6300
    },
    {
      id: 'genre-enhancement',
      name: 'Genre Enhancement',
      description: 'Applying genre-specific storytelling techniques',
      engines: [], // Populated dynamically based on detected genre
      estimatedTime: 4000
    },
    {
      id: 'interactive-polish',
      name: 'Interactive Polish',
      description: 'Adding choice systems and living world elements',
      engines: ['interactive-choice-v2', 'living-world-v2', 'engagement-v2'],
      estimatedTime: 4500
    }
  ],

  episode: [
    {
      id: 'narrative-analysis',
      name: 'Narrative Analysis',
      description: 'Analyzing story context and character arcs',
      engines: ['fractal-narrative-v2', 'character-3d-v2'],
      estimatedTime: 3000
    },
    {
      id: 'scene-generation',
      name: 'Scene Generation',
      description: 'Creating compelling scenes and dialogue',
      engines: ['strategic-dialogue', 'tension-escalation'],
      estimatedTime: 4000
    },
    {
      id: 'choice-integration',
      name: 'Choice Integration',
      description: 'Building interactive decision points',
      engines: ['interactive-choice-v2', 'engagement-v2'],
      estimatedTime: 3500
    }
  ],

  preproduction: [
    {
      id: 'visual-planning',
      name: 'Visual Planning',
      description: 'Storyboarding and visual development',
      engines: ['storyboard-v2', 'visual-storytelling-v2'],
      estimatedTime: 5500
    },
    {
      id: 'casting-planning',
      name: 'Casting & Performance',
      description: 'Character casting and performance direction',
      engines: ['casting-v2', 'performance-coaching-v2'],
      estimatedTime: 4500
    },
    {
      id: 'technical-prep',
      name: 'Technical Preparation',
      description: 'Location, sound, and production planning',
      engines: ['location-scouting-v2', 'sound-design-v2', 'production-scheduling-v2'],
      estimatedTime: 6000
    }
  ]
}

// 🎮 ENGINE ORCHESTRATOR CLASS
export class EngineOrchestrator {
  private activeEngines: Map<string, EngineStatus> = new Map()
  private currentPhase: ProcessPhase | null = null
  private allPhases: ProcessPhase[] = []
  private callbacks: Map<string, (state: LoadingState) => void> = new Map()
  private startTime: number = 0
  
  // 🚀 Initialize process
  initializeProcess(processType: keyof typeof PROCESS_PHASES, options: {
    synopsis?: string
    theme?: string
    genre?: string[]
    mode?: 'beast' | 'stable'
  } = {}): LoadingState {
    this.startTime = Date.now()
    this.activeEngines.clear()
    
    // Get base phases for process type
    const basePhases = PROCESS_PHASES[processType]
    
    // Customize phases based on options
    this.allPhases = this.customizePhases(basePhases, options)
    
    // Initialize first phase
    this.currentPhase = this.allPhases[0]
    this.currentPhase.status = 'active'
    
    // Initialize engines for current phase
    this.initializePhaseEngines(this.currentPhase)
    
    return this.getLoadingState()
  }
  
  // 🎯 Customize phases based on story requirements
  private customizePhases(basePhases: any[], options: any): ProcessPhase[] {
    return basePhases.map(phase => {
      const customizedPhase = { ...phase, status: 'pending' as const, progress: 0 }
      
      // Add genre engines to genre enhancement phase
      if (phase.id === 'genre-enhancement' && options.genre) {
        const genreEngines = this.selectGenreEngines(options.genre)
        customizedPhase.engines = [...phase.engines, ...genreEngines]
      }
      
      return customizedPhase
    })
  }
  
  // 🎭 Select appropriate genre engines
  private selectGenreEngines(genres: string[]): string[] {
    const engineMap: Record<string, string> = {
      'comedy': 'comedy-timing-v2',
      'horror': 'horror-atmosphere-v2', 
      'romance': 'romance-chemistry-v2',
      'mystery': 'mystery-construction-v2',
      'thriller': 'tension-escalation'
    }
    
    return genres.map(genre => engineMap[genre.toLowerCase()]).filter(Boolean)
  }
  
  // ⚡ Initialize engines for current phase
  private initializePhaseEngines(phase: ProcessPhase) {
    phase.engines.forEach(engineId => {
      const engineConfig = this.findEngineConfig(engineId)
      if (engineConfig) {
        const engineStatus: EngineStatus = {
          id: engineId,
          name: engineConfig.name,
          version: engineConfig.version,
          category: engineConfig.category,
          status: 'initializing',
          progress: 0,
          estimatedTime: engineConfig.estimatedTime,
          priority: engineConfig.priority,
          isActive: true,
          currentTask: 'Initializing...'
        }
        
        this.activeEngines.set(engineId, engineStatus)
      }
    })
  }
  
  // 🔍 Find engine configuration
  private findEngineConfig(engineId: string) {
    const allEngines = [
      ...ENGINE_REGISTRY.core,
      ...ENGINE_REGISTRY.genre,
      ...ENGINE_REGISTRY.production,
      ...ENGINE_REGISTRY.enhancement
    ]
    
    return allEngines.find(engine => engine.id === engineId)
  }
  
  // 📊 Update engine progress
  updateEngineProgress(engineId: string, progress: number, task?: string) {
    const engine = this.activeEngines.get(engineId)
    if (engine) {
      engine.progress = Math.min(100, progress)
      engine.status = progress >= 100 ? 'complete' : 'active'
      if (task) engine.currentTask = task
      
      this.activeEngines.set(engineId, engine)
      this.updatePhaseProgress()
      this.notifyCallbacks()
    }
  }
  
  // 🎯 Update phase progress
  private updatePhaseProgress() {
    if (!this.currentPhase) return
    
    const phaseEngines = Array.from(this.activeEngines.values())
      .filter(engine => this.currentPhase!.engines.includes(engine.id))
    
    if (phaseEngines.length === 0) return
    
    const totalProgress = phaseEngines.reduce((sum, engine) => sum + engine.progress, 0)
    this.currentPhase.progress = totalProgress / phaseEngines.length
    
    // Check if phase is complete
    if (this.currentPhase.progress >= 100) {
      this.currentPhase.status = 'complete'
      this.moveToNextPhase()
    }
  }
  
  // ➡️ Move to next phase
  private moveToNextPhase() {
    const currentIndex = this.allPhases.indexOf(this.currentPhase!)
    const nextIndex = currentIndex + 1
    
    if (nextIndex < this.allPhases.length) {
      this.currentPhase = this.allPhases[nextIndex]
      this.currentPhase.status = 'active'
      this.initializePhaseEngines(this.currentPhase)
    }
  }
  
  // 📱 Get current loading state
  getLoadingState(): LoadingState {
    const overallProgress = this.calculateOverallProgress()
    const elapsedTime = Date.now() - this.startTime
    const totalEstimatedTime = this.allPhases.reduce((sum, phase) => sum + phase.estimatedTime, 0)
    
    return {
      currentPhase: this.currentPhase!,
      allPhases: this.allPhases,
      activeEngines: Array.from(this.activeEngines.values()).filter(engine => engine.isActive),
      overallProgress,
      totalEstimatedTime,
      elapsedTime,
      currentTask: this.getCurrentTask(),
      isComplete: overallProgress >= 100
    }
  }
  
  // 📈 Calculate overall progress
  private calculateOverallProgress(): number {
    if (this.allPhases.length === 0) return 0
    
    const totalProgress = this.allPhases.reduce((sum, phase) => sum + phase.progress, 0)
    return totalProgress / this.allPhases.length
  }
  
  // 📝 Get current task description
  private getCurrentTask(): string {
    const activeEngine = Array.from(this.activeEngines.values())
      .find(engine => engine.status === 'active')
    
    return activeEngine?.currentTask || this.currentPhase?.description || 'Processing...'
  }
  
  // 🔔 Register callback for state updates
  onStateUpdate(callbackId: string, callback: (state: LoadingState) => void) {
    this.callbacks.set(callbackId, callback)
  }
  
  // 🔕 Unregister callback
  offStateUpdate(callbackId: string) {
    this.callbacks.delete(callbackId)
  }
  
  // 📢 Notify all callbacks
  private notifyCallbacks() {
    const state = this.getLoadingState()
    this.callbacks.forEach(callback => callback(state))
  }
}

// 🌟 Export singleton instance
export const engineOrchestrator = new EngineOrchestrator()