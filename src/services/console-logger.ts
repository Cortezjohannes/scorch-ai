/**
 * Reeled AI Console Logger
 * Provides clean, structured console output for production tracking
 */

export interface LogPhase {
  name: string
  totalSteps: number
  currentStep: number
  engines?: string[]
  overallProgress?: number
}

export interface LogEngine {
  name: string
  icon: string
  status: 'activating' | 'processing' | 'complete' | 'standby'
  timeElapsed?: number
}

export class ConsoleLogger {
  private static instance: ConsoleLogger
  private currentPhase: LogPhase | null = null
  private startTime: number = Date.now()
  private phaseStartTime: number = Date.now()
  private engines: LogEngine[] = []

  private constructor() {}

  static getInstance(): ConsoleLogger {
    if (!ConsoleLogger.instance) {
      ConsoleLogger.instance = new ConsoleLogger()
    }
    return ConsoleLogger.instance
  }

  // Clear and initialize the console for a new generation session
  startNewSession(sessionName: string) {
    console.clear()
    this.startTime = Date.now()
    this.phaseStartTime = Date.now()
    this.currentPhase = null
    this.engines = []
    
    console.log(`
┌─────────────────────────────────────────────────────────────────┐
│                       🎬 REELED AI STUDIO                       │
│                     ${sessionName.padStart(20).padEnd(40)}                     │
└─────────────────────────────────────────────────────────────────┘
`)
  }

  // Start a new phase with its engines
  startPhase(phase: LogPhase) {
    this.currentPhase = phase
    this.phaseStartTime = Date.now()
    
    const overallPercent = phase.overallProgress || 0
    const phasePercent = Math.round((phase.currentStep / phase.totalSteps) * 100)
    
    console.log(`
┌─ PHASE: ${phase.name.toUpperCase().padEnd(50)} ─┐
│ Progress: Step ${phase.currentStep}/${phase.totalSteps} (${phasePercent}%) │ Overall: ${overallPercent}%  │
└─────────────────────────────────────────────────────────────────┘`)

    // Show engines for this phase
    if (phase.engines && phase.engines.length > 0) {
      console.log('🏛️  Murphy Pillar Engines:')
      phase.engines.forEach(engine => {
        console.log(`   ⚡ ${engine}`)
      })
      console.log('')
    }
  }

  // Update current phase progress
  updatePhase(stepName: string, currentStep?: number) {
    if (!this.currentPhase) return
    
    if (currentStep) {
      this.currentPhase.currentStep = currentStep
    }
    
    const phasePercent = Math.round((this.currentPhase.currentStep / this.currentPhase.totalSteps) * 100)
    const timeElapsed = Math.round((Date.now() - this.phaseStartTime) / 1000)
    
    console.log(`⏳ ${stepName} | ${phasePercent}% | ${timeElapsed}s elapsed`)
  }

  // Log engine activation
  activateEngine(engineName: string, engineIcon: string = '⚡') {
    const timeElapsed = Math.round((Date.now() - this.phaseStartTime) / 1000)
    console.log(`${engineIcon} ${engineName} Engine → ACTIVATED (${timeElapsed}s)`)
  }

  // Log engine processing
  processEngine(engineName: string, details: string, engineIcon: string = '⚡') {
    console.log(`   ${engineIcon} ${engineName}: ${details}`)
  }

  // Log engine completion
  completeEngine(engineName: string, result: string, engineIcon: string = '✅') {
    const timeElapsed = Math.round((Date.now() - this.phaseStartTime) / 1000)
    console.log(`${engineIcon} ${engineName} Engine → COMPLETE | ${result} (${timeElapsed}s)`)
  }

  // Log important milestones
  milestone(message: string, icon: string = '🎯') {
    const timeElapsed = Math.round((Date.now() - this.startTime) / 1000)
    console.log(`${icon} MILESTONE: ${message} | Total: ${timeElapsed}s`)
  }

  // Log errors with context
  error(phase: string, engine: string, error: string) {
    console.log(`❌ ERROR in ${phase} → ${engine}: ${error}`)
  }

  // Log warnings
  warning(message: string) {
    console.log(`⚠️  WARNING: ${message}`)
  }

  // Complete the entire session
  completeSession(sessionName: string, finalResult: string) {
    const totalTime = Math.round((Date.now() - this.startTime) / 1000)
    const minutes = Math.floor(totalTime / 60)
    const seconds = totalTime % 60
    
    console.log(`
┌─────────────────────────────────────────────────────────────────┐
│                    ✅ SESSION COMPLETE                          │
│ ${sessionName.padEnd(63)} │
│ Result: ${finalResult.padEnd(55)} │
│ Total Time: ${minutes}m ${seconds}s${' '.repeat(47 - `${minutes}m ${seconds}s`.length)} │
└─────────────────────────────────────────────────────────────────┘
`)
  }

  // Log JSON parsing attempts
  logJsonParsing(attempt: number, strategy: string, success: boolean) {
    const status = success ? '✅' : '❌'
    console.log(`   ${status} JSON Parse Attempt ${attempt}: ${strategy}`)
  }

  // Log API calls
  logApiCall(service: string, model: string, purpose: string) {
    console.log(`🌐 API CALL: ${service} (${model}) → ${purpose}`)
  }

  // Log fallback usage
  logFallback(primary: string, fallback: string, reason: string) {
    console.log(`🔄 FALLBACK: ${primary} → ${fallback} (${reason})`)
  }

  // Raw console output for backward compatibility
  raw(message: string) {
    console.log(message)
  }
}

// Export singleton instance
export const logger = ConsoleLogger.getInstance()

// Engine configurations for different phases
export const ENGINE_CONFIGS = {
  STORY_BIBLE: {
    phase: 'Story Bible Generation',
    engines: [
      '🎯 Premise Engine',
      '👥 3D Character Engine', 
      '🌊 Fractal Narrative Engine',
      '💬 Strategic Dialogue Engine',
      '🎭 Intelligent Trope Engine',
      '🌍 Living World Engine'
    ]
  },
  EPISODE: {
    phase: 'Episode Generation',
    engines: [
      '🎬 Interactive Choice Engine',
      '🎨 Genre Mastery Engine',
      '⚡ Tension Escalation Engine',
      '💬 Strategic Dialogue Engine',
      '🌊 Fractal Narrative Engine'
    ]
  },
  PREPRODUCTION: {
    phase: 'Pre-Production',
    engines: [
      '🏗️ World Building Engine',
      '😂 Comedy Timing Engine',
      '😱 Horror Atmosphere Engine',
      '💕 Romance Chemistry Engine',
      '🔍 Mystery Construction Engine',
      '🎬 Production Planning Engine'
    ]
  }
}