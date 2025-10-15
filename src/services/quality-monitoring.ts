/**
 * 🔍 AUTOMATED QUALITY MONITORING SYSTEM
 * 
 * Real-time quality tracking and performance monitoring for episode generation.
 * Phase 4: Advanced Testing & Validation
 */

import { assessComprehensiveEpisodeQuality, QualityMetrics } from './quality-assessment'

// 📊 MONITORING INTERFACES

export interface QualityMonitoringSession {
  sessionId: string
  startTime: Date
  endTime?: Date
  totalEpisodes: number
  successfulEpisodes: number
  failedEpisodes: number
  averageQualityScore: number
  qualityDistribution: QualityDistribution
  enginePerformance: EnginePerformanceMetrics
  realTimeMetrics: RealTimeMetrics[]
}

export interface QualityDistribution {
  masterpiece: number    // 9.0+
  cinematic: number      // 8.0-8.9
  excellent: number      // 7.0-7.9
  good: number          // 5.0-6.9
  basic: number         // <5.0
}

export interface EnginePerformanceMetrics {
  engineSuccessRates: Record<string, number>
  averageExecutionTimes: Record<string, number>
  qualityContributions: Record<string, number>
  failureReasons: Record<string, string[]>
}

export interface RealTimeMetrics {
  timestamp: Date
  episodeId: string
  qualityScore: number
  qualityClassification: string
  engineSuccessRate: number
  processingTime: number
  genre: string[]
  issues: string[]
}

export interface StressTestScenario {
  name: string
  description: string
  storyBible: any
  expectedChallenges: string[]
  successCriteria: {
    minQualityScore: number
    maxProcessingTime: number
    requiredEngineSuccessRate: number
  }
}

// 🎯 QUALITY MONITORING CLASS

export class QualityMonitor {
  private currentSession: QualityMonitoringSession | null = null
  private sessions: QualityMonitoringSession[] = []
  private realTimeData: RealTimeMetrics[] = []
  
  // 🚀 START MONITORING SESSION
  
  startSession(sessionId?: string): string {
    const id = sessionId || `session_${Date.now()}`
    
    this.currentSession = {
      sessionId: id,
      startTime: new Date(),
      totalEpisodes: 0,
      successfulEpisodes: 0,
      failedEpisodes: 0,
      averageQualityScore: 0,
      qualityDistribution: {
        masterpiece: 0,
        cinematic: 0,
        excellent: 0,
        good: 0,
        basic: 0
      },
      enginePerformance: {
        engineSuccessRates: {},
        averageExecutionTimes: {},
        qualityContributions: {},
        failureReasons: {}
      },
      realTimeMetrics: []
    }
    
    console.log(`🔍 Quality monitoring session started: ${id}`)
    return id
  }
  
  // 📊 RECORD EPISODE GENERATION
  
  async recordEpisodeGeneration(
    episodeId: string,
    episode: any,
    storyBible: any,
    processingTime: number,
    engineMetadata?: any
  ): Promise<RealTimeMetrics> {
    if (!this.currentSession) {
      throw new Error('No active monitoring session')
    }
    
    try {
      // Assess episode quality
      const qualityMetrics = assessComprehensiveEpisodeQuality(
        episode,
        storyBible,
        storyBible.genre || []
      )
      
      // Calculate engine success rate
      const engineSuccessRate = engineMetadata ? 
        engineMetadata.successfulEngines / engineMetadata.totalEngines : 1.0
      
      // Create real-time metrics
      const metrics: RealTimeMetrics = {
        timestamp: new Date(),
        episodeId,
        qualityScore: qualityMetrics.overallScore,
        qualityClassification: qualityMetrics.qualityClassification,
        engineSuccessRate,
        processingTime,
        genre: Array.isArray(storyBible.genre) ? storyBible.genre : [storyBible.genre || 'Unknown'],
        issues: this.detectQualityIssues(qualityMetrics)
      }
      
      // Update session statistics
      this.updateSessionStats(qualityMetrics, engineSuccessRate, engineMetadata)
      
      // Store real-time data
      this.realTimeData.push(metrics)
      this.currentSession.realTimeMetrics.push(metrics)
      
      // Log real-time quality assessment
      console.log(`📊 Quality Assessment - Episode ${episodeId}:`)
      console.log(`   Quality Score: ${qualityMetrics.overallScore}/10 (${qualityMetrics.qualityClassification})`)
      console.log(`   Engine Success: ${Math.round(engineSuccessRate * 100)}%`)
      console.log(`   Processing Time: ${processingTime}ms`)
      if (metrics.issues.length > 0) {
        console.log(`   Issues: ${metrics.issues.join(', ')}`)
      }
      
      return metrics
      
    } catch (error) {
      console.error(`❌ Quality monitoring error for episode ${episodeId}:`, error)
      this.currentSession.failedEpisodes++
      throw error
    }
  }
  
  // 📈 UPDATE SESSION STATISTICS
  
  private updateSessionStats(
    qualityMetrics: QualityMetrics,
    engineSuccessRate: number,
    engineMetadata?: any
  ): void {
    if (!this.currentSession) return
    
    this.currentSession.totalEpisodes++
    
    if (qualityMetrics.overallScore >= 5.0) {
      this.currentSession.successfulEpisodes++
    } else {
      this.currentSession.failedEpisodes++
    }
    
    // Update quality distribution
    const classification = qualityMetrics.qualityClassification.toLowerCase()
    if (classification === 'masterpiece') this.currentSession.qualityDistribution.masterpiece++
    else if (classification === 'cinematic') this.currentSession.qualityDistribution.cinematic++
    else if (classification === 'excellent') this.currentSession.qualityDistribution.excellent++
    else if (classification === 'good') this.currentSession.qualityDistribution.good++
    else this.currentSession.qualityDistribution.basic++
    
    // Update average quality score
    const totalScore = this.currentSession.realTimeMetrics.reduce((sum, m) => sum + m.qualityScore, 0) + qualityMetrics.overallScore
    this.currentSession.averageQualityScore = totalScore / this.currentSession.totalEpisodes
    
    // Update engine performance if metadata available
    if (engineMetadata && engineMetadata.enginePerformance) {
      this.updateEnginePerformance(engineMetadata.enginePerformance)
    }
  }
  
  // 🔧 UPDATE ENGINE PERFORMANCE METRICS
  
  private updateEnginePerformance(enginePerformance: Record<string, any>): void {
    if (!this.currentSession) return
    
    Object.entries(enginePerformance).forEach(([engineName, performance]) => {
      // Update success rates
      if (!this.currentSession!.enginePerformance.engineSuccessRates[engineName]) {
        this.currentSession!.enginePerformance.engineSuccessRates[engineName] = 0
      }
      
      const currentRate = this.currentSession!.enginePerformance.engineSuccessRates[engineName]
      const newRate = performance.success ? 1 : 0
      this.currentSession!.enginePerformance.engineSuccessRates[engineName] = 
        (currentRate + newRate) / 2 // Simple running average
      
      // Update execution times
      if (!this.currentSession!.enginePerformance.averageExecutionTimes[engineName]) {
        this.currentSession!.enginePerformance.averageExecutionTimes[engineName] = 0
      }
      
      const currentTime = this.currentSession!.enginePerformance.averageExecutionTimes[engineName]
      this.currentSession!.enginePerformance.averageExecutionTimes[engineName] = 
        (currentTime + performance.executionTime) / 2
      
      // Track failure reasons
      if (!performance.success && performance.error) {
        if (!this.currentSession!.enginePerformance.failureReasons[engineName]) {
          this.currentSession!.enginePerformance.failureReasons[engineName] = []
        }
        this.currentSession!.enginePerformance.failureReasons[engineName].push(performance.error)
      }
    })
  }
  
  // 🔍 DETECT QUALITY ISSUES
  
  private detectQualityIssues(qualityMetrics: QualityMetrics): string[] {
    const issues: string[] = []
    
    if (qualityMetrics.characterDepth.score < 6) {
      issues.push('Low character depth')
    }
    
    if (qualityMetrics.dialogueQuality.score < 6) {
      issues.push('Poor dialogue quality')
    }
    
    if (qualityMetrics.narrativeStructure.score < 6) {
      issues.push('Weak narrative structure')
    }
    
    if (qualityMetrics.worldBuilding.score < 6) {
      issues.push('Insufficient world-building')
    }
    
    if (qualityMetrics.genreExecution.score < 6) {
      issues.push('Poor genre execution')
    }
    
    if (qualityMetrics.choiceQuality.score < 6) {
      issues.push('Low choice quality')
    }
    
    if (qualityMetrics.cinematicElements.score < 6) {
      issues.push('Lacks cinematic elements')
    }
    
    return issues
  }
  
  // 📊 END SESSION AND GENERATE REPORT
  
  endSession(): QualityMonitoringSession | null {
    if (!this.currentSession) {
      console.warn('⚠️ No active monitoring session to end')
      return null
    }
    
    this.currentSession.endTime = new Date()
    this.sessions.push(this.currentSession)
    
    const session = this.currentSession
    this.currentSession = null
    
    console.log(`📊 Quality monitoring session ended: ${session.sessionId}`)
    console.log(`   Episodes: ${session.totalEpisodes} (${session.successfulEpisodes} successful)`)
    console.log(`   Average Quality: ${session.averageQualityScore.toFixed(2)}/10`)
    console.log(`   Cinematic Episodes: ${session.qualityDistribution.cinematic + session.qualityDistribution.masterpiece}`)
    
    return session
  }
  
  // 📈 GET REAL-TIME STATISTICS
  
  getCurrentStats(): any {
    if (!this.currentSession) return null
    
    const recentMetrics = this.realTimeData.slice(-10) // Last 10 episodes
    
    return {
      sessionId: this.currentSession.sessionId,
      episodeCount: this.currentSession.totalEpisodes,
      averageQuality: this.currentSession.averageQualityScore,
      successRate: this.currentSession.successfulEpisodes / Math.max(this.currentSession.totalEpisodes, 1),
      cinematicRate: (this.currentSession.qualityDistribution.cinematic + this.currentSession.qualityDistribution.masterpiece) / Math.max(this.currentSession.totalEpisodes, 1),
      recentTrend: recentMetrics.map(m => m.qualityScore),
      engineHealth: this.calculateEngineHealth()
    }
  }
  
  // 🔧 CALCULATE ENGINE HEALTH
  
  private calculateEngineHealth(): any {
    if (!this.currentSession) return {}
    
    const health: any = {}
    
    Object.entries(this.currentSession.enginePerformance.engineSuccessRates).forEach(([engine, rate]) => {
      health[engine] = {
        successRate: rate,
        status: rate >= 0.9 ? 'Healthy' : rate >= 0.7 ? 'Warning' : 'Critical',
        averageTime: this.currentSession!.enginePerformance.averageExecutionTimes[engine] || 0
      }
    })
    
    return health
  }
}

// 🧪 STRESS TESTING SCENARIOS

export const STRESS_TEST_SCENARIOS: StressTestScenario[] = [
  {
    name: "Large Character Cast",
    description: "Story bible with 15+ characters to test context handling",
    storyBible: {
      seriesTitle: "The Academy",
      premise: "Elite boarding school with dark secrets and complex social hierarchies among students and faculty.",
      genre: ["Drama", "Mystery", "Thriller"],
      tone: "Dark academic drama with psychological complexity",
      mainCharacters: [
        { name: "Alexandra Sterling", description: "Head girl with political ambitions and family secrets" },
        { name: "Marcus Chen", description: "Scholarship student fighting class discrimination" },
        { name: "Isabella Rosewood", description: "Artistic rebel from old money family" },
        { name: "James Whitmore", description: "Star athlete hiding academic struggles" },
        { name: "Sophia Nakamura", description: "Brilliant scientist with social anxiety" },
        { name: "David Torres", description: "Theater prodigy dealing with identity crisis" },
        { name: "Emma Sullivan", description: "Student council president with eating disorder" },
        { name: "Lucas Martinez", description: "Tech genius involved in hacking scandal" },
        { name: "Olivia Blackwood", description: "Legacy student rebelling against family expectations" },
        { name: "Noah Kim", description: "Pre-med student under intense parental pressure" },
        { name: "Hannah Foster", description: "Debate team captain with anger management issues" },
        { name: "Ryan O'Connor", description: "Class clown masking deep depression" },
        { name: "Zoe Washington", description: "Activist fighting systemic racism at school" },
        { name: "Prof. Elena Vasquez", description: "Psychology teacher with unethical methods" },
        { name: "Dean Margaret Ashford", description: "Authoritarian administrator protecting school reputation" },
        { name: "Coach Tom Bradley", description: "Athletics director involved in recruiting scandal" }
      ],
      setting: "Prestigious New England boarding school with Gothic architecture and hidden passages"
    },
    expectedChallenges: ["Character limit handling", "Complex relationship dynamics", "Narrative coherence"],
    successCriteria: {
      minQualityScore: 7.5,
      maxProcessingTime: 90000, // 90 seconds
      requiredEngineSuccessRate: 0.85
    }
  },
  
  {
    name: "Genre Fusion Complex",
    description: "Multi-genre story testing all genre-specific engines simultaneously",
    storyBible: {
      seriesTitle: "Midnight at the Cosmic Café", 
      premise: "A supernatural coffee shop serves as a meeting point for time travelers, where romantic entanglements complicate murder investigations across multiple timelines.",
      genre: ["Science Fiction", "Romance", "Mystery", "Comedy", "Horror", "Fantasy"],
      tone: "Whimsical yet mysterious, romantic tension with comedic moments and underlying cosmic horror",
      mainCharacters: [
        { name: "Luna Hartwell", description: "Time-traveling barista from 1920s with psychic abilities and romantic confusion" },
        { name: "Detective Alex Nova", description: "Modern cop investigating murders across timelines while falling for Luna" },
        { name: "Professor Malik Singh", description: "Quantum physicist who discovered the café's temporal properties" },
        { name: "Madame Zelda", description: "Mysterious café owner who may not be entirely human" }
      ],
      worldBuilding: {
        timeTravel: "Coffee-based temporal mechanics allow travel between specific time periods",
        supernatural: "Café exists in quantum superposition across multiple timelines simultaneously",
        mystery: "Murders in different eras connected through temporal manipulation",
        romance: "Love transcends time but creates paradoxes and complications"
      },
      setting: "Interdimensional café that appears differently in each time period but maintains consistent cosmic energy"
    },
    expectedChallenges: ["Multiple genre integration", "Complex world-building", "Tonal balance"],
    successCriteria: {
      minQualityScore: 8.0,
      maxProcessingTime: 120000, // 2 minutes
      requiredEngineSuccessRate: 0.8
    }
  },
  
  {
    name: "Psychological Complexity Extreme",
    description: "Deeply psychological narrative testing character depth engines",
    storyBible: {
      seriesTitle: "Mirrors of the Mind",
      premise: "A psychological research facility where patients' repressed memories manifest as physical entities that must be confronted to achieve healing.",
      genre: ["Psychological Horror", "Drama", "Fantasy"],
      tone: "Deeply introspective with surreal elements and emotional intensity",
      mainCharacters: [
        {
          name: "Dr. Sarah Chen",
          description: "Psychiatrist who can enter patients' memory landscapes but risks losing herself in their traumas",
          psychologicalProfile: "Survivor of childhood abuse using her profession to heal others while avoiding her own trauma",
          innerConflicts: "Professional dedication vs personal emotional safety, helper vs patient, control vs vulnerability"
        },
        {
          name: "Michael Torres",
          description: "War veteran whose PTSD manifests as violent shadow creatures that attack both him and others",
          psychologicalProfile: "Complex PTSD with dissociative episodes, survivor guilt, and emotional numbing",
          innerConflicts: "Warrior identity vs victim reality, masculine strength vs emotional vulnerability, past heroism vs current helplessness"
        }
      ],
      psychologicalThemes: [
        "Trauma as both poison and teacher",
        "The cost of healing others while remaining broken",
        "Memory as subjective truth versus objective reality",
        "The thin line between helping and enabling",
        "Confronting inner demons literally and figuratively"
      ]
    },
    expectedChallenges: ["Deep psychological complexity", "Character motivation clarity", "Emotional authenticity"],
    successCriteria: {
      minQualityScore: 8.5,
      maxProcessingTime: 75000, // 75 seconds
      requiredEngineSuccessRate: 0.9
    }
  }
];

// 🧪 STRESS TESTING RUNNER

export class StressTestRunner {
  private monitor: QualityMonitor
  
  constructor() {
    this.monitor = new QualityMonitor()
  }
  
  async runStressTest(scenario: StressTestScenario, endpoint: string): Promise<any> {
    console.log(`\n🧪 STRESS TEST: ${scenario.name}`)
    console.log(`📋 Description: ${scenario.description}`)
    console.log(`🎯 Expected Challenges: ${scenario.expectedChallenges.join(', ')}`)
    
    const sessionId = this.monitor.startSession(`stress_${scenario.name.replace(/\s+/g, '_').toLowerCase()}`)
    
    try {
      const startTime = Date.now()
      
      // Generate episode
      const response = await fetch(`${endpoint}/api/generate/episode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible: scenario.storyBible,
          episodeNumber: 1,
          useEngines: true
        })
      })
      
      const processingTime = Date.now() - startTime
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(`Generation failed: ${result.error}`)
      }
      
      // Record metrics
      const metrics = await this.monitor.recordEpisodeGeneration(
        `stress_episode_1`,
        result.episode,
        scenario.storyBible,
        processingTime,
        result.metadata
      )
      
      // Evaluate against success criteria
      const success = this.evaluateStressTestSuccess(metrics, processingTime, scenario.successCriteria)
      
      console.log(`📊 STRESS TEST RESULTS:`)
      console.log(`   Quality Score: ${metrics.qualityScore}/10 (Target: ${scenario.successCriteria.minQualityScore})`)
      console.log(`   Processing Time: ${processingTime}ms (Target: <${scenario.successCriteria.maxProcessingTime}ms)`)
      console.log(`   Engine Success Rate: ${Math.round(metrics.engineSuccessRate * 100)}% (Target: ${scenario.successCriteria.requiredEngineSuccessRate * 100}%)`)
      console.log(`   Overall Result: ${success.passed ? '✅ PASS' : '❌ FAIL'}`)
      
      if (!success.passed) {
        console.log(`   Failed Criteria: ${success.failedCriteria.join(', ')}`)
      }
      
      this.monitor.endSession()
      
      return {
        scenario: scenario.name,
        metrics,
        processingTime,
        success: success.passed,
        failedCriteria: success.failedCriteria
      }
      
    } catch (error) {
      console.error(`❌ Stress test ${scenario.name} failed:`, error.message)
      this.monitor.endSession()
      return {
        scenario: scenario.name,
        error: error.message,
        success: false
      }
    }
  }
  
  private evaluateStressTestSuccess(
    metrics: RealTimeMetrics,
    processingTime: number,
    criteria: StressTestScenario['successCriteria']
  ): { passed: boolean, failedCriteria: string[] } {
    const failedCriteria: string[] = []
    
    if (metrics.qualityScore < criteria.minQualityScore) {
      failedCriteria.push(`Quality score ${metrics.qualityScore} below ${criteria.minQualityScore}`)
    }
    
    if (processingTime > criteria.maxProcessingTime) {
      failedCriteria.push(`Processing time ${processingTime}ms exceeds ${criteria.maxProcessingTime}ms`)
    }
    
    if (metrics.engineSuccessRate < criteria.requiredEngineSuccessRate) {
      failedCriteria.push(`Engine success rate ${Math.round(metrics.engineSuccessRate * 100)}% below ${criteria.requiredEngineSuccessRate * 100}%`)
    }
    
    return {
      passed: failedCriteria.length === 0,
      failedCriteria
    }
  }
  
  async runAllStressTests(endpoint: string): Promise<any[]> {
    console.log('🧪 RUNNING ALL STRESS TESTS...')
    
    const results = []
    
    for (const scenario of STRESS_TEST_SCENARIOS) {
      const result = await this.runStressTest(scenario, endpoint)
      results.push(result)
      
      // Cool down between tests
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
    
    const successCount = results.filter(r => r.success).length
    const successRate = successCount / results.length
    
    console.log(`\n🏆 STRESS TEST SUMMARY:`)
    console.log(`   Tests Passed: ${successCount}/${results.length} (${Math.round(successRate * 100)}%)`)
    console.log(`   Overall Status: ${successRate >= 0.8 ? '✅ EXCELLENT' : successRate >= 0.6 ? '⚠️ ACCEPTABLE' : '❌ NEEDS IMPROVEMENT'}`)
    
    return results
  }
}

// Create singleton instances for easy access
export const qualityMonitor = new QualityMonitor()
export const stressTestRunner = new StressTestRunner()

export default QualityMonitor
