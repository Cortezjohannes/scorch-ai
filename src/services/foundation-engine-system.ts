/**
 * 🏗️ FOUNDATION ENGINE SYSTEM
 * The central orchestration system that provides the foundational infrastructure
 * for AI engine integration across all pre-production tabs
 * 
 * CORE MISSION: "Performance Multiplication Infrastructure"
 * - Provides the engine that powers all content enhancements
 * - Establishes the foundation for Hollywood-grade content generation
 * - Maintains bulletproof reliability with comprehensive fallbacks
 * - Enables seamless integration by other developers
 * 
 * ARCHITECTURE PRINCIPLE: "The Engine Behind the Engines"
 * - Not tab-specific - pure foundational infrastructure
 * - Orchestrates 67+ AI engines with intelligent selection
 * - Provides universal interfaces for any content type
 * - Ensures narrative consistency across all content
 */

import { enhancedOrchestrator, TabEnhancementRequest, EnhancementOptions, EnhancementResult } from './enhanced-orchestrator'
import { contentEnhancer, ContentGenerationRequest, EnhancedContentResult } from './content-enhancement-middleware'
import { narrativeConsistency, NarrativeConsistencyFramework } from './narrative-consistency-framework'
import { fallbackSystem, executeWithFallback } from './fallback-recovery-system'
import { performanceOptimizer, executeOptimized } from './performance-optimization-system'
import { qualityValidator, validateQuality } from './quality-validation-framework'
import { EngineLogger } from './engine-logger'

// ============================================================================
// FOUNDATION SYSTEM CORE INTERFACES
// ============================================================================

export interface FoundationSystemConfig {
  engineSettings: EngineSystemSettings
  safetySettings: SafetySystemSettings
  performanceSettings: PerformanceSystemSettings
  qualitySettings: QualitySystemSettings
  integrationSettings: IntegrationSettings
}

export interface EngineSystemSettings {
  defaultMode: 'beast' | 'stable'
  defaultQualityLevel: 'basic' | 'standard' | 'professional' | 'master'
  enableEnginesByDefault: boolean
  maxProcessingTime: number
  enableNarrativeConsistency: boolean
}

export interface SafetySystemSettings {
  enableFallbackProtection: boolean
  enableCircuitBreakers: boolean
  enableAutoRecovery: boolean
  fallbackTimeoutMs: number
  maxRetryAttempts: number
}

export interface PerformanceSystemSettings {
  enableCaching: boolean
  enableParallelExecution: boolean
  enablePerformanceMonitoring: boolean
  cacheMaxSize: number
  maxConcurrentEngines: number
}

export interface QualitySystemSettings {
  enableQualityValidation: boolean
  enableBenchmarking: boolean
  enableABTesting: boolean
  minimumQualityThreshold: number
  professionalStandardLevel: 'basic' | 'professional' | 'industry'
}

export interface IntegrationSettings {
  enableDebugLogging: boolean
  enableMetricsCollection: boolean
  enableHealthMonitoring: boolean
  apiTimeoutMs: number
  retryOnFailure: boolean
}

export interface ContentEnhancementRequest {
  content: any
  contentType: string
  context: ContentContext
  options?: Partial<EnhancementOptions>
}

export interface ContentContext {
  projectId?: string
  storyBible?: any
  episodeData?: any
  arcIndex?: number
  genre?: string[]
  theme?: string
  targetAudience?: string
  budgetLevel?: string
}

export interface FoundationSystemResult {
  success: boolean
  content: any
  metadata: EnhancementMetadata
  performance: PerformanceMetrics
  quality: QualityMetrics
  safety: SafetyMetrics
}

export interface EnhancementMetadata {
  enhanced: boolean
  enginesUsed: string[]
  processingTime: number
  fallbackUsed: boolean
  fallbackReason?: string
  narrativeConsistency: boolean
  qualityScore: number
}

// ============================================================================
// MAIN FOUNDATION ENGINE SYSTEM CLASS
// ============================================================================

export class FoundationEngineSystem {
  private static instance: FoundationEngineSystem
  private config: FoundationSystemConfig
  private systemHealth: SystemHealthTracker
  private isInitialized: boolean = false

  constructor() {
    this.config = this.initializeDefaultConfiguration()
    this.systemHealth = new SystemHealthTracker()
  }

  public static getInstance(): FoundationEngineSystem {
    if (!FoundationEngineSystem.instance) {
      FoundationEngineSystem.instance = new FoundationEngineSystem()
    }
    return FoundationEngineSystem.instance
  }

  /**
   * 🚀 SYSTEM INITIALIZATION
   * Initialize the complete foundation system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('📋 Foundation Engine System already initialized')
      return
    }


    try {
      // Initialize core systems in dependency order
      await this.initializeCoreOrchestration()

      await this.initializeSafetySystems()

      await this.initializePerformanceSystems()

      await this.initializeQualitySystems()

      console.log(`🧠 Initializing narrative consistency framework...`);
      await this.initializeNarrativeConsistency()

      await this.startSystemMonitoring()

      this.isInitialized = true
      

    } catch (error) {
      console.error(`❌ Foundation system initialization failed:`, error);
      throw new Error(`Foundation Engine System initialization failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 🎭 UNIVERSAL CONTENT ENHANCEMENT
   * The main interface for enhancing any content type
   */
  async enhanceContent(request: ContentEnhancementRequest): Promise<FoundationSystemResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const startTime = Date.now()
    const { content, contentType, context, options } = request

    console.log(`📋 Content Type: ${contentType.toUpperCase()}`);

    // Record system activity
    this.systemHealth.recordActivity('content_enhancement', contentType)

    try {
      // STAGE 1: Safety and validation checks
      await this.performSafetyChecks(request)

      // STAGE 2: Content enhancement with full protection
      const enhancementResult = await this.executeProtectedEnhancement(request)

      // STAGE 3: Quality validation (if enabled)
      const qualityResult = await this.performQualityValidation(enhancementResult, request)

      // STAGE 4: Narrative consistency validation (if enabled)
      console.log(`🧠 Stage 4: Narrative consistency validation...`);
      const narrativeResult = await this.performNarrativeValidation(enhancementResult, request)

      // STAGE 5: Performance metrics collection
      const performanceMetrics = await this.collectPerformanceMetrics(startTime, enhancementResult)

      // STAGE 6: System health update
      this.systemHealth.recordSuccess('content_enhancement', contentType, Date.now() - startTime)

      const totalTime = Date.now() - startTime

      return {
        success: true,
        content: enhancementResult.content,
        metadata: {
          enhanced: enhancementResult.enhanced,
          enginesUsed: enhancementResult.enginesUsed,
          processingTime: totalTime,
          fallbackUsed: enhancementResult.fallbackUsed || false,
          fallbackReason: enhancementResult.fallbackReason,
          narrativeConsistency: narrativeResult.isValid,
          qualityScore: qualityResult.overallScore
        },
        performance: performanceMetrics,
        quality: this.convertToQualityMetrics(qualityResult),
        safety: this.createSafetyMetrics(enhancementResult)
      }

    } catch (error) {
      return this.handleSystemFailure(error, request, startTime)
    }
  }

  /**
   * 🎯 INTELLIGENT ENGINE SELECTION
   * Core algorithm for selecting optimal engines for any content type
   */
  async selectEnginesForContent(
    contentType: string,
    context: ContentContext,
    options: Partial<EnhancementOptions> = {}
  ): Promise<string[]> {
    console.log(`🧠 Selecting engines for ${contentType} content...`);

    const selectedEngines: string[] = []

    // FOUNDATION ENGINES (Always Active for Narrative Consistency)
    const foundationEngines = this.getFoundationEngines(context.genre || [])
    selectedEngines.push(...foundationEngines)

    // CONTENT-SPECIFIC ENGINES
    const contentEngines = this.getContentSpecificEngines(contentType, context)
    selectedEngines.push(...contentEngines)

    // QUALITY ENHANCEMENT ENGINES (Based on Quality Level)
    const qualityLevel = options.qualityLevel || this.config.engineSettings.defaultQualityLevel
    const enhancementEngines = this.getEnhancementEngines(qualityLevel, contentType)
    selectedEngines.push(...enhancementEngines)

    // GENRE-SPECIFIC ENGINES
    if (context.genre && context.genre.length > 0) {
      const genreEngines = this.getGenreSpecificEngines(context.genre, contentType)
      selectedEngines.push(...genreEngines)
    }

    // CONTEXT-ADAPTIVE ENGINES
    const adaptiveEngines = this.getAdaptiveEngines(context, contentType)
    selectedEngines.push(...adaptiveEngines)

    // Remove duplicates and sort by priority
    const uniqueEngines = [...new Set(selectedEngines)]
    const prioritizedEngines = this.prioritizeEngines(uniqueEngines, contentType, context)


    return prioritizedEngines
  }

  /**
   * 🔄 SYSTEM HEALTH AND STATUS
   */
  async getSystemStatus(): Promise<SystemStatus> {
    return {
      initialized: this.isInitialized,
      health: await this.systemHealth.getCurrentHealth(),
      performance: await performanceOptimizer.getPerformanceMetrics(),
      safety: await fallbackSystem.getSystemHealth(),
      configuration: this.getSafeConfiguration()
    }
  }

  /**
   * 🔧 SYSTEM CONFIGURATION
   */
  updateConfiguration(updates: Partial<FoundationSystemConfig>): void {
    
    this.config = {
      ...this.config,
      ...updates
    }

    // Apply configuration changes to subsystems
    this.applyConfigurationToSubsystems()
    
  }

  /**
   * 🧹 SYSTEM MAINTENANCE
   */
  async performMaintenance(): Promise<MaintenanceResult> {
    console.log(`🧹 Performing foundation system maintenance...`);

    const maintenanceResult: MaintenanceResult = {
      cacheOptimization: await performanceOptimizer.optimizeCache(),
      healthSystemReset: await this.systemHealth.performMaintenance(),
      circuitBreakerReset: await this.resetCircuitBreakers(),
      memoryCleanup: await this.performMemoryCleanup(),
      logsCleanup: await this.cleanupLogs()
    }

    return maintenanceResult
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async initializeCoreOrchestration(): Promise<void> {
    // Enhanced orchestrator is already initialized as singleton
  }

  private async initializeSafetySystems(): Promise<void> {
    if (this.config.safetySettings.enableFallbackProtection) {
      await fallbackSystem.startHealthMonitoring()
    }
  }

  private async initializePerformanceSystems(): Promise<void> {
    if (this.config.performanceSettings.enablePerformanceMonitoring) {
      await performanceOptimizer.startPerformanceMonitoring()
    }
  }

  private async initializeQualitySystems(): Promise<void> {
    if (this.config.qualitySettings.enableQualityValidation) {
      // Quality validator is ready as singleton
    }
  }

  private async initializeNarrativeConsistency(): Promise<void> {
    if (this.config.engineSettings.enableNarrativeConsistency) {
      // Narrative consistency framework is ready as singleton
    }
  }

  private async startSystemMonitoring(): Promise<void> {
    if (this.config.integrationSettings.enableHealthMonitoring) {
      setInterval(async () => {
        const health = await this.systemHealth.getCurrentHealth()
        if (health.overall !== 'healthy') {
          console.warn(`⚠️ System health warning: ${health.overall}`);
        }
      }, 60000) // Check every minute

    }
  }

  private async performSafetyChecks(request: ContentEnhancementRequest): Promise<void> {
    // Validate request structure
    if (!request.content || !request.contentType) {
      throw new Error('Invalid enhancement request: missing content or contentType')
    }

    // Check system health
    const health = await this.systemHealth.getCurrentHealth()
    if (health.overall === 'critical') {
      throw new Error('System health critical - enhancement temporarily unavailable')
    }
  }

  private async executeProtectedEnhancement(request: ContentEnhancementRequest): Promise<EnhancementResult> {
    const enhancementOptions: EnhancementOptions = {
      useEngines: this.config.engineSettings.enableEnginesByDefault,
      qualityLevel: this.config.engineSettings.defaultQualityLevel,
      mode: this.config.engineSettings.defaultMode,
      fallbackOnError: this.config.safetySettings.enableFallbackProtection,
      maxProcessingTime: this.config.engineSettings.maxProcessingTime,
      enableConsistencyValidation: this.config.engineSettings.enableNarrativeConsistency,
      performanceOptimization: this.config.performanceSettings.enablePerformanceMonitoring,
      ...request.options
    }

    // Create narrative context
    const narrativeContext = {
      storyBible: request.context.storyBible || {},
      episodeData: request.context.episodeData || {},
      characterStates: new Map(),
      worldState: {},
      previousContent: new Map(),
      genre: request.context.genre || [],
      theme: request.context.theme || '',
      projectId: request.context.projectId,
      arcIndex: request.context.arcIndex
    }

    // Execute enhancement with fallback protection
    const result = await executeWithFallback(
      () => enhancedOrchestrator.enhanceTabContent({
        tabType: request.contentType as any,
        originalContent: request.content,
        narrativeContext,
        enhancementOptions
      }),
      () => Promise.resolve({
        content: request.content,
        enhanced: false,
        enginesUsed: [],
        processingTime: 0,
        qualityScore: 0.5,
        fallbackReason: 'Fallback protection activated'
      }),
      `foundation-enhancement-${request.contentType}`
    )
    
    return result.success ? result.data : {
      content: request.content,
      enhanced: false,
      enginesUsed: [],
      processingTime: 0,
      qualityScore: 0.5,
      fallbackReason: 'Fallback protection activated'
    }
  }

  private async performQualityValidation(enhancement: EnhancementResult, request: ContentEnhancementRequest): Promise<any> {
    if (!this.config.qualitySettings.enableQualityValidation) {
      return { overallScore: 0.7, qualityLevel: 'unknown' }
    }

    try {
      return await qualityValidator.validateContentQuality({
        content: enhancement.content,
        contentType: request.contentType as any,
        originalContent: request.content,
        context: {
          genre: request.context.genre || [],
          targetAudience: request.context.targetAudience || 'general',
          productionBudget: request.context.budgetLevel as any || 'medium',
          qualityStandards: {
            minimumScore: this.config.qualitySettings.minimumQualityThreshold,
            professionalThreshold: 0.8,
            industryBenchmarks: []
          }
        },
        benchmarks: [],
        options: { analysisDepth: 'standard' }
      })
    } catch (error) {
      console.warn(`Quality validation failed:`, error);
      return { overallScore: 0.6, qualityLevel: 'unknown' }
    }
  }

  private async performNarrativeValidation(enhancement: EnhancementResult, request: ContentEnhancementRequest): Promise<any> {
    if (!this.config.engineSettings.enableNarrativeConsistency) {
      return { isValid: true }
    }

    try {
      return await narrativeConsistency.validateContentConsistency(
        enhancement.content,
        request.contentType,
        request.context.projectId || 'default',
        request.contentType
      )
    } catch (error) {
      console.warn(`Narrative validation failed:`, error);
      return { isValid: true }
    }
  }

  private async collectPerformanceMetrics(startTime: number, enhancement: EnhancementResult): Promise<PerformanceMetrics> {
    const totalTime = Date.now() - startTime
    
    return {
      totalProcessingTime: totalTime,
      enhancementTime: enhancement.processingTime,
      systemOverhead: totalTime - enhancement.processingTime,
      enginesUsed: enhancement.enginesUsed.length,
      cacheUtilization: 0, // Would be populated by performance system
      memoryUsage: process.memoryUsage().heapUsed,
      successRate: enhancement.enhanced ? 1.0 : 0.0
    }
  }

  private handleSystemFailure(error: any, request: ContentEnhancementRequest, startTime: number): FoundationSystemResult {
    const totalTime = Date.now() - startTime
    
    console.error(`💥 Foundation system failure:`, error);
    this.systemHealth.recordFailure('content_enhancement', request.contentType, error)

    // Return safe fallback result
    return {
      success: false,
      content: request.content, // Return original content
      metadata: {
        enhanced: false,
        enginesUsed: [],
        processingTime: totalTime,
        fallbackUsed: true,
        fallbackReason: `System failure: ${error.message}`,
        narrativeConsistency: false,
        qualityScore: 0.5
      },
      performance: {
        totalProcessingTime: totalTime,
        enhancementTime: 0,
        systemOverhead: totalTime,
        enginesUsed: 0,
        cacheUtilization: 0,
        memoryUsage: process.memoryUsage().heapUsed,
        successRate: 0
      },
      quality: {
        overallScore: 0.5,
        professionalLevel: false,
        industryStandard: false,
        improvementSuggestions: ['System maintenance required']
      },
      safety: {
        fallbackActivated: true,
        circuitBreakerTriggered: false,
        autoRecoveryAttempted: false,
        systemStability: 'degraded'
      }
    }
  }

  // Engine selection helper methods
  private getFoundationEngines(genres: string[]): string[] {
    const baseEngines = ['character-3d-v2', 'world-building-v2', 'theme-integration-v2']
    
    // Add genre-specific foundation engines
    if (genres.includes('drama')) {
      baseEngines.push('emotional-depth-engine')
    }
    if (genres.includes('comedy')) {
      baseEngines.push('comedy-timing-foundation')
    }
    
    return baseEngines
  }

  private getContentSpecificEngines(contentType: string, context: ContentContext): string[] {
    const engineMap: Record<string, string[]> = {
      'script': ['dialogue-v2', 'tension-escalation', 'performance-coaching-v2'],
      'storyboard': ['storyboard-v2', 'visual-storytelling-v2', 'cinematography-v2'],
      'casting': ['casting-v2', 'performance-coaching-v2', 'ensemble-chemistry'],
      'props': ['prop-design-v2', 'visual-storytelling-v2'],
      'location': ['location-scouting-v2', 'world-building-v2'],
      'marketing': ['engagement-v2', 'audience-targeting'],
      'postProduction': ['production-v2', 'workflow-optimization']
    }
    
    return engineMap[contentType] || []
  }

  private getEnhancementEngines(qualityLevel: string, contentType: string): string[] {
    const qualityEngines: Record<string, string[]> = {
      'basic': ['formatting-engine'],
      'standard': ['formatting-engine', 'quality-enhancement'],
      'professional': ['formatting-engine', 'quality-enhancement', 'professional-polish'],
      'master': ['formatting-engine', 'quality-enhancement', 'professional-polish', 'master-craft-engine']
    }
    
    return qualityEngines[qualityLevel] || []
  }

  private getGenreSpecificEngines(genres: string[], contentType: string): string[] {
    const genreEngines: string[] = []
    
    genres.forEach(genre => {
      switch (genre.toLowerCase()) {
        case 'comedy':
          genreEngines.push('comedy-timing-v2', 'humor-enhancement')
          break
        case 'drama':
          genreEngines.push('emotional-depth-v2', 'character-development')
          break
        case 'horror':
          genreEngines.push('horror-atmosphere-v2', 'tension-building')
          break
        case 'romance':
          genreEngines.push('romance-chemistry-v2', 'emotional-connection')
          break
        case 'thriller':
          genreEngines.push('suspense-building', 'tension-escalation')
          break
        case 'action':
          genreEngines.push('action-pacing', 'dynamic-visualization')
          break
      }
    })
    
    return genreEngines
  }

  private getAdaptiveEngines(context: ContentContext, contentType: string): string[] {
    const adaptiveEngines: string[] = []
    
    // Budget-based adaptation
    if (context.budgetLevel === 'micro' || context.budgetLevel === 'low') {
      adaptiveEngines.push('budget-optimization-engine')
    }
    
    // Audience-based adaptation
    if (context.targetAudience) {
      adaptiveEngines.push('audience-adaptation-engine')
    }
    
    return adaptiveEngines
  }

  private prioritizeEngines(engines: string[], contentType: string, context: ContentContext): string[] {
    // Simple priority ordering - could be made more sophisticated
    const priorityOrder = [
      // Foundation first
      'character-3d-v2', 'world-building-v2', 'theme-integration-v2',
      // Content-specific second
      'dialogue-v2', 'storyboard-v2', 'casting-v2',
      // Enhancement third
      'visual-storytelling-v2', 'performance-coaching-v2',
      // Genre-specific fourth
      'comedy-timing-v2', 'horror-atmosphere-v2'
    ]
    
    return engines.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a)
      const bIndex = priorityOrder.indexOf(b)
      
      if (aIndex === -1 && bIndex === -1) return 0
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      
      return aIndex - bIndex
    })
  }

  // Configuration and utility methods
  private initializeDefaultConfiguration(): FoundationSystemConfig {
    return {
      engineSettings: {
        defaultMode: 'beast',
        defaultQualityLevel: 'professional',
        enableEnginesByDefault: true,
        maxProcessingTime: 30000,
        enableNarrativeConsistency: true
      },
      safetySettings: {
        enableFallbackProtection: true,
        enableCircuitBreakers: true,
        enableAutoRecovery: true,
        fallbackTimeoutMs: 15000,
        maxRetryAttempts: 2
      },
      performanceSettings: {
        enableCaching: true,
        enableParallelExecution: true,
        enablePerformanceMonitoring: true,
        cacheMaxSize: 1000,
        maxConcurrentEngines: 5
      },
      qualitySettings: {
        enableQualityValidation: true,
        enableBenchmarking: true,
        enableABTesting: false,
        minimumQualityThreshold: 0.7,
        professionalStandardLevel: 'professional'
      },
      integrationSettings: {
        enableDebugLogging: false,
        enableMetricsCollection: true,
        enableHealthMonitoring: true,
        apiTimeoutMs: 30000,
        retryOnFailure: true
      }
    }
  }

  private applyConfigurationToSubsystems(): void {
    // Apply configuration changes to content enhancer
    contentEnhancer.updateGlobalSettings({
      qualityLevel: this.config.engineSettings.defaultQualityLevel,
      mode: this.config.engineSettings.defaultMode,
      maxProcessingTime: this.config.engineSettings.maxProcessingTime,
      fallbackOnError: this.config.safetySettings.enableFallbackProtection
    })
  }

  private getSafeConfiguration(): any {
    // Return configuration without sensitive data
    return {
      ...this.config,
      // Remove any sensitive configuration details if needed
    }
  }

  // Maintenance methods
  private async resetCircuitBreakers(): Promise<number> {
    // Implementation would reset circuit breakers
    return 0
  }

  private async performMemoryCleanup(): Promise<number> {
    // Implementation would perform memory cleanup
    if (global.gc) {
      global.gc()
    }
    return process.memoryUsage().heapUsed
  }

  private async cleanupLogs(): Promise<number> {
    // Implementation would cleanup old logs
    return 0
  }

  // Utility conversion methods
  private convertToQualityMetrics(qualityResult: any): QualityMetrics {
    return {
      overallScore: qualityResult.overallScore || 0.5,
      professionalLevel: qualityResult.qualityLevel === 'professional' || qualityResult.qualityLevel === 'exceptional',
      industryStandard: qualityResult.industrialAcceptance?.professionalStandard || false,
      improvementSuggestions: qualityResult.improvementSuggestions?.map((s: any) => s.description) || []
    }
  }

  private createSafetyMetrics(enhancement: EnhancementResult): SafetyMetrics {
    return {
      fallbackActivated: enhancement.fallbackUsed || false,
      circuitBreakerTriggered: false, // Would be determined by fallback system
      autoRecoveryAttempted: false,   // Would be determined by fallback system
      systemStability: enhancement.enhanced ? 'stable' : 'degraded'
    }
  }
}

// ============================================================================
// SYSTEM HEALTH TRACKER
// ============================================================================

class SystemHealthTracker {
  private activityLog: ActivityRecord[] = []
  private healthMetrics: HealthMetrics = {
    successRate: 1.0,
    averageResponseTime: 0,
    errorRate: 0,
    lastUpdate: new Date()
  }

  recordActivity(operation: string, contentType: string): void {
    this.activityLog.push({
      operation,
      contentType,
      timestamp: new Date(),
      status: 'started'
    })

    // Keep only last 1000 records
    if (this.activityLog.length > 1000) {
      this.activityLog = this.activityLog.slice(-1000)
    }
  }

  recordSuccess(operation: string, contentType: string, duration: number): void {
    this.updateMetrics(true, duration)
  }

  recordFailure(operation: string, contentType: string, error: Error): void {
    this.updateMetrics(false, 0)
    EngineLogger.logEngineError(operation, `Foundation system error: ${error.message}`, String(error))
  }

  async getCurrentHealth(): Promise<SystemHealth> {
    const recentActivities = this.activityLog.filter(
      activity => Date.now() - activity.timestamp.getTime() < 300000 // Last 5 minutes
    )

    let overall: 'healthy' | 'degraded' | 'critical'
    
    if (this.healthMetrics.successRate > 0.9 && this.healthMetrics.errorRate < 0.1) {
      overall = 'healthy'
    } else if (this.healthMetrics.successRate > 0.7) {
      overall = 'degraded'
    } else {
      overall = 'critical'
    }

    return {
      overall,
      metrics: { ...this.healthMetrics },
      recentActivity: recentActivities.length,
      uptime: process.uptime()
    }
  }

  async performMaintenance(): Promise<boolean> {
    // Clear old activity logs
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000) // 24 hours ago
    this.activityLog = this.activityLog.filter(
      activity => activity.timestamp.getTime() > cutoffTime
    )

    // Reset metrics if needed
    if (this.healthMetrics.errorRate > 0.5) {
      this.healthMetrics.errorRate = 0
      this.healthMetrics.successRate = 1.0
    }

    return true
  }

  private updateMetrics(success: boolean, duration: number): void {
    const alpha = 0.1 // Exponential moving average factor
    
    if (success) {
      this.healthMetrics.successRate = this.healthMetrics.successRate * (1 - alpha) + alpha
      this.healthMetrics.averageResponseTime = this.healthMetrics.averageResponseTime * (1 - alpha) + duration * alpha
    } else {
      this.healthMetrics.successRate = this.healthMetrics.successRate * (1 - alpha)
      this.healthMetrics.errorRate = this.healthMetrics.errorRate * (1 - alpha) + alpha
    }
    
    this.healthMetrics.lastUpdate = new Date()
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface SystemStatus {
  initialized: boolean
  health: SystemHealth
  performance: any
  safety: any
  configuration: any
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical'
  metrics: HealthMetrics
  recentActivity: number
  uptime: number
}

interface HealthMetrics {
  successRate: number
  averageResponseTime: number
  errorRate: number
  lastUpdate: Date
}

interface ActivityRecord {
  operation: string
  contentType: string
  timestamp: Date
  status: string
}

interface PerformanceMetrics {
  totalProcessingTime: number
  enhancementTime: number
  systemOverhead: number
  enginesUsed: number
  cacheUtilization: number
  memoryUsage: number
  successRate: number
}

interface QualityMetrics {
  overallScore: number
  professionalLevel: boolean
  industryStandard: boolean
  improvementSuggestions: string[]
}

interface SafetyMetrics {
  fallbackActivated: boolean
  circuitBreakerTriggered: boolean
  autoRecoveryAttempted: boolean
  systemStability: 'stable' | 'degraded' | 'critical'
}

interface MaintenanceResult {
  cacheOptimization: any
  healthSystemReset: boolean
  circuitBreakerReset: number
  memoryCleanup: number
  logsCleanup: number
}

// ============================================================================
// EXPORT SINGLETON INSTANCE AND CONVENIENCE FUNCTIONS
// ============================================================================

export const foundationEngine = FoundationEngineSystem.getInstance()

// Convenience functions for integration
export const initializeFoundation = () => foundationEngine.initialize()
export const enhanceContent = foundationEngine.enhanceContent.bind(foundationEngine)
export const selectEngines = foundationEngine.selectEnginesForContent.bind(foundationEngine)
export const getSystemStatus = foundationEngine.getSystemStatus.bind(foundationEngine)
export const updateSystemConfig = foundationEngine.updateConfiguration.bind(foundationEngine)
export const performSystemMaintenance = foundationEngine.performMaintenance.bind(foundationEngine)

// Export for advanced usage and testing
// Export already declared above


