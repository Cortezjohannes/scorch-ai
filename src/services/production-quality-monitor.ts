/**
 * 🚀 PRODUCTION QUALITY MONITOR
 * 
 * Real-time quality monitoring and alerting system for production deployment.
 * Phase 5: Production Deployment Implementation
 */

import { assessComprehensiveEpisodeQuality, QualityMetrics } from './quality-assessment'

// 📊 PRODUCTION MONITORING INTERFACES

export interface ProductionEpisodeLog {
  sessionId: string
  episodeId: string
  timestamp: Date
  userId?: string
  storyBibleId: string
  episodeNumber: number
  generationMode: 'comprehensive' | 'enhanced_baseline' | 'basic_fallback'
  qualityScore: number
  qualityClassification: string
  processingTime: number
  engineSuccessRate: number
  engineFailures: string[]
  userAgent?: string
  ipAddress?: string
  featureFlagsActive: string[]
  fallbackReason?: string
  alertsTriggered: string[]
}

export interface ProductionMetrics {
  totalEpisodes: number
  averageQuality: number
  qualityDistribution: QualityDistribution
  engineSuccessRate: number
  averageProcessingTime: number
  uptimePercentage: number
  userSatisfactionScore: number
  criticalAlerts: number
  warningAlerts: number
  fallbackUsageRate: number
  featureFlagMetrics: Record<string, FeatureFlagMetrics>
}

export interface QualityDistribution {
  masterpiece: number    // 9.0+
  cinematic: number      // 8.0-8.9
  excellent: number      // 7.0-7.9
  good: number          // 5.0-6.9
  basic: number         // 3.0-4.9
  poor: number          // <3.0
}

export interface FeatureFlagMetrics {
  enabled: boolean
  rolloutPercentage: number
  usageCount: number
  successRate: number
  averageQuality: number
  errorRate: number
}

export interface QualityAlert {
  level: 'CRITICAL' | 'WARNING' | 'INFO'
  type: 'QUALITY_DEGRADATION' | 'ENGINE_FAILURE' | 'PERFORMANCE_ISSUE' | 'SYSTEM_ERROR'
  message: string
  timestamp: Date
  metadata: any
  resolved: boolean
  resolvedAt?: Date
}

export interface ProductionConfig {
  qualityThresholds: {
    minimum: number          // 7.0 - absolute minimum for production
    warning: number          // 7.5 - trigger warning alerts
    target: number           // 8.0 - target quality score
    excellent: number        // 8.5 - excellent quality benchmark
  }
  performanceThresholds: {
    maxProcessingTime: number      // 60000ms - maximum acceptable processing time
    warningProcessingTime: number  // 45000ms - trigger performance warnings
    targetProcessingTime: number   // 30000ms - target processing time
  }
  reliabilityThresholds: {
    minimumEngineSuccessRate: number // 0.8 - 80% minimum engine success rate
    warningEngineSuccessRate: number // 0.85 - 85% warning threshold
    targetEngineSuccessRate: number  // 0.9 - 90% target success rate
  }
  alerting: {
    enabled: boolean
    webhookUrl?: string
    emailNotifications?: string[]
    slackChannel?: string
  }
  monitoring: {
    enableRealTimeLogging: boolean
    enableMetricsCollection: boolean
    enableUserTracking: boolean
    retentionDays: number
  }
}

// 🎯 PRODUCTION QUALITY MONITOR CLASS

export class ProductionQualityMonitor {
  private config: ProductionConfig
  private logs: ProductionEpisodeLog[] = []
  private alerts: QualityAlert[] = []
  private metrics: ProductionMetrics
  private alertCallbacks: ((alert: QualityAlert) => void)[] = []
  
  constructor(config: ProductionConfig) {
    this.config = config
    this.metrics = this.initializeMetrics()
    
    console.log('🚀 Production Quality Monitor initialized')
    console.log(`   Quality Threshold: ${config.qualityThresholds.minimum}+/10`)
    console.log(`   Engine Success Rate: ${config.reliabilityThresholds.minimumEngineSuccessRate * 100}%+`)
    console.log(`   Max Processing Time: ${config.performanceThresholds.maxProcessingTime}ms`)
  }
  
  // 📊 LOG EPISODE GENERATION
  
  async logEpisodeGeneration(logData: Omit<ProductionEpisodeLog, 'timestamp' | 'alertsTriggered'>): Promise<void> {
    const log: ProductionEpisodeLog = {
      ...logData,
      timestamp: new Date(),
      alertsTriggered: []
    }
    
    // Store log
    this.logs.push(log)
    
    // Update metrics
    this.updateMetrics(log)
    
    // Check for quality issues and trigger alerts
    await this.checkQualityThresholds(log)
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production' || this.config.monitoring.enableRealTimeLogging) {
      console.log(`📊 Episode Generated - ID: ${log.episodeId}`)
      console.log(`   Quality: ${log.qualityScore}/10 (${log.qualityClassification})`)
      console.log(`   Mode: ${log.generationMode}`)
      console.log(`   Processing: ${log.processingTime}ms`)
      console.log(`   Engine Success: ${Math.round(log.engineSuccessRate * 100)}%`)
      
      if (log.alertsTriggered.length > 0) {
        console.log(`   🚨 Alerts: ${log.alertsTriggered.join(', ')}`)
      }
    }
    
    // Clean up old logs (retention policy)
    this.cleanupOldLogs()
  }
  
  // 🔍 REAL-TIME QUALITY ASSESSMENT
  
  async assessEpisodeQuality(
    episode: any,
    storyBible: any,
    sessionId: string,
    episodeId: string,
    processingTime: number,
    engineMetadata?: any
  ): Promise<ProductionEpisodeLog> {
    try {
      // Comprehensive quality assessment
      const qualityMetrics = assessComprehensiveEpisodeQuality(
        episode,
        storyBible,
        storyBible.genre || []
      )
      
      // Calculate engine success rate
      const engineSuccessRate = engineMetadata ? 
        engineMetadata.successfulEngines / engineMetadata.totalEngines : 1.0
      
      // Determine generation mode based on quality and metadata
      const generationMode = this.determineGenerationMode(qualityMetrics.overallScore, engineSuccessRate, engineMetadata)
      
      // Extract engine failures
      const engineFailures = engineMetadata?.enginePerformance ? 
        Object.entries(engineMetadata.enginePerformance)
          .filter(([_, perf]: [string, any]) => !perf.success)
          .map(([engine, _]) => engine) : []
      
      // Create log entry
      const logData: Omit<ProductionEpisodeLog, 'timestamp' | 'alertsTriggered'> = {
        sessionId,
        episodeId,
        storyBibleId: storyBible.id || 'unknown',
        episodeNumber: episode.episodeNumber || 1,
        generationMode,
        qualityScore: qualityMetrics.overallScore,
        qualityClassification: qualityMetrics.qualityClassification,
        processingTime,
        engineSuccessRate,
        engineFailures,
        featureFlagsActive: this.getActiveFeatureFlags()
      }
      
      // Log the episode generation
      await this.logEpisodeGeneration(logData)
      
      return this.logs[this.logs.length - 1] // Return the logged entry
      
    } catch (error) {
      console.error('❌ Production quality assessment failed:', error)
      
      // Create error log entry
      const errorLog: Omit<ProductionEpisodeLog, 'timestamp' | 'alertsTriggered'> = {
        sessionId,
        episodeId,
        storyBibleId: 'unknown',
        episodeNumber: 1,
        generationMode: 'basic_fallback',
        qualityScore: 0,
        qualityClassification: 'Error',
        processingTime,
        engineSuccessRate: 0,
        engineFailures: ['assessment_error'],
        featureFlagsActive: [],
        fallbackReason: 'Quality assessment failed'
      }
      
      await this.logEpisodeGeneration(errorLog)
      throw error
    }
  }
  
  // 🚨 CHECK QUALITY THRESHOLDS AND TRIGGER ALERTS
  
  private async checkQualityThresholds(log: ProductionEpisodeLog): Promise<void> {
    const alerts: QualityAlert[] = []
    
    // Critical quality threshold check
    if (log.qualityScore < this.config.qualityThresholds.minimum) {
      alerts.push({
        level: 'CRITICAL',
        type: 'QUALITY_DEGRADATION',
        message: `Episode quality ${log.qualityScore}/10 below minimum threshold ${this.config.qualityThresholds.minimum}/10`,
        timestamp: new Date(),
        metadata: { episodeId: log.episodeId, qualityScore: log.qualityScore },
        resolved: false
      })
    }
    
    // Warning quality threshold check
    else if (log.qualityScore < this.config.qualityThresholds.warning) {
      alerts.push({
        level: 'WARNING',
        type: 'QUALITY_DEGRADATION',
        message: `Episode quality ${log.qualityScore}/10 below warning threshold ${this.config.qualityThresholds.warning}/10`,
        timestamp: new Date(),
        metadata: { episodeId: log.episodeId, qualityScore: log.qualityScore },
        resolved: false
      })
    }
    
    // Engine failure threshold check
    if (log.engineSuccessRate < this.config.reliabilityThresholds.minimumEngineSuccessRate) {
      alerts.push({
        level: 'CRITICAL',
        type: 'ENGINE_FAILURE',
        message: `Engine success rate ${Math.round(log.engineSuccessRate * 100)}% below minimum ${Math.round(this.config.reliabilityThresholds.minimumEngineSuccessRate * 100)}%`,
        timestamp: new Date(),
        metadata: { episodeId: log.episodeId, engineSuccessRate: log.engineSuccessRate, failures: log.engineFailures },
        resolved: false
      })
    }
    
    // Performance threshold check
    if (log.processingTime > this.config.performanceThresholds.maxProcessingTime) {
      alerts.push({
        level: 'CRITICAL',
        type: 'PERFORMANCE_ISSUE',
        message: `Processing time ${log.processingTime}ms exceeds maximum ${this.config.performanceThresholds.maxProcessingTime}ms`,
        timestamp: new Date(),
        metadata: { episodeId: log.episodeId, processingTime: log.processingTime },
        resolved: false
      })
    }
    else if (log.processingTime > this.config.performanceThresholds.warningProcessingTime) {
      alerts.push({
        level: 'WARNING',
        type: 'PERFORMANCE_ISSUE',
        message: `Processing time ${log.processingTime}ms exceeds warning threshold ${this.config.performanceThresholds.warningProcessingTime}ms`,
        timestamp: new Date(),
        metadata: { episodeId: log.episodeId, processingTime: log.processingTime },
        resolved: false
      })
    }
    
    // Store alerts and trigger notifications
    for (const alert of alerts) {
      this.alerts.push(alert)
      log.alertsTriggered.push(`${alert.level}: ${alert.type}`)
      
      // Trigger alert callbacks
      for (const callback of this.alertCallbacks) {
        try {
          callback(alert)
        } catch (error) {
          console.error('❌ Alert callback failed:', error)
        }
      }
      
      // Log alert
      console.log(`🚨 ${alert.level} ALERT: ${alert.message}`)
    }
    
    // Update metrics with alert counts
    this.updateAlertMetrics(alerts)
  }
  
  // 📊 UPDATE PRODUCTION METRICS
  
  private updateMetrics(log: ProductionEpisodeLog): void {
    this.metrics.totalEpisodes++
    
    // Update average quality (running average)
    this.metrics.averageQuality = (
      (this.metrics.averageQuality * (this.metrics.totalEpisodes - 1)) + log.qualityScore
    ) / this.metrics.totalEpisodes
    
    // Update quality distribution
    if (log.qualityScore >= 9.0) this.metrics.qualityDistribution.masterpiece++
    else if (log.qualityScore >= 8.0) this.metrics.qualityDistribution.cinematic++
    else if (log.qualityScore >= 7.0) this.metrics.qualityDistribution.excellent++
    else if (log.qualityScore >= 5.0) this.metrics.qualityDistribution.good++
    else if (log.qualityScore >= 3.0) this.metrics.qualityDistribution.basic++
    else this.metrics.qualityDistribution.poor++
    
    // Update engine success rate (running average)
    this.metrics.engineSuccessRate = (
      (this.metrics.engineSuccessRate * (this.metrics.totalEpisodes - 1)) + log.engineSuccessRate
    ) / this.metrics.totalEpisodes
    
    // Update average processing time (running average)
    this.metrics.averageProcessingTime = (
      (this.metrics.averageProcessingTime * (this.metrics.totalEpisodes - 1)) + log.processingTime
    ) / this.metrics.totalEpisodes
    
    // Update fallback usage rate
    if (log.generationMode !== 'comprehensive') {
      this.metrics.fallbackUsageRate = (
        (this.metrics.fallbackUsageRate * (this.metrics.totalEpisodes - 1)) + 1
      ) / this.metrics.totalEpisodes
    } else {
      this.metrics.fallbackUsageRate = (
        this.metrics.fallbackUsageRate * (this.metrics.totalEpisodes - 1)
      ) / this.metrics.totalEpisodes
    }
    
    // Update feature flag metrics
    for (const flag of log.featureFlagsActive) {
      if (!this.metrics.featureFlagMetrics[flag]) {
        this.metrics.featureFlagMetrics[flag] = {
          enabled: true,
          rolloutPercentage: 100,
          usageCount: 0,
          successRate: 0,
          averageQuality: 0,
          errorRate: 0
        }
      }
      
      const flagMetrics = this.metrics.featureFlagMetrics[flag]
      flagMetrics.usageCount++
      
      // Update success rate
      const success = log.qualityScore >= this.config.qualityThresholds.minimum
      flagMetrics.successRate = (
        (flagMetrics.successRate * (flagMetrics.usageCount - 1)) + (success ? 1 : 0)
      ) / flagMetrics.usageCount
      
      // Update average quality
      flagMetrics.averageQuality = (
        (flagMetrics.averageQuality * (flagMetrics.usageCount - 1)) + log.qualityScore
      ) / flagMetrics.usageCount
    }
    
    // Calculate uptime percentage (simplified - based on successful generations)
    const successfulGenerations = this.logs.filter(l => l.qualityScore >= this.config.qualityThresholds.minimum).length
    this.metrics.uptimePercentage = (successfulGenerations / this.metrics.totalEpisodes) * 100
  }
  
  // 🚨 UPDATE ALERT METRICS
  
  private updateAlertMetrics(alerts: QualityAlert[]): void {
    for (const alert of alerts) {
      if (alert.level === 'CRITICAL') {
        this.metrics.criticalAlerts++
      } else if (alert.level === 'WARNING') {
        this.metrics.warningAlerts++
      }
    }
  }
  
  // 🎯 HELPER METHODS
  
  private determineGenerationMode(qualityScore: number, engineSuccessRate: number, engineMetadata?: any): 'comprehensive' | 'enhanced_baseline' | 'basic_fallback' {
    if (engineMetadata && engineMetadata.totalEngines >= 15 && engineSuccessRate >= 0.8 && qualityScore >= 7.0) {
      return 'comprehensive'
    } else if (qualityScore >= 6.0 && engineSuccessRate >= 0.6) {
      return 'enhanced_baseline'
    } else {
      return 'basic_fallback'
    }
  }
  
  private getActiveFeatureFlags(): string[] {
    // This would integrate with a feature flag system
    // For now, return a simplified version
    return process.env.FEATURE_FLAGS ? process.env.FEATURE_FLAGS.split(',') : ['comprehensive_engines']
  }
  
  private initializeMetrics(): ProductionMetrics {
    return {
      totalEpisodes: 0,
      averageQuality: 0,
      qualityDistribution: {
        masterpiece: 0,
        cinematic: 0,
        excellent: 0,
        good: 0,
        basic: 0,
        poor: 0
      },
      engineSuccessRate: 0,
      averageProcessingTime: 0,
      uptimePercentage: 100,
      userSatisfactionScore: 0,
      criticalAlerts: 0,
      warningAlerts: 0,
      fallbackUsageRate: 0,
      featureFlagMetrics: {}
    }
  }
  
  private cleanupOldLogs(): void {
    const retentionDate = new Date()
    retentionDate.setDate(retentionDate.getDate() - this.config.monitoring.retentionDays)
    
    this.logs = this.logs.filter(log => log.timestamp > retentionDate)
    this.alerts = this.alerts.filter(alert => alert.timestamp > retentionDate)
  }
  
  // 📊 PUBLIC API METHODS
  
  public getCurrentMetrics(): ProductionMetrics {
    return { ...this.metrics }
  }
  
  public getRecentLogs(count: number = 10): ProductionEpisodeLog[] {
    return this.logs.slice(-count)
  }
  
  public getActiveAlerts(): QualityAlert[] {
    return this.alerts.filter(alert => !alert.resolved)
  }
  
  public resolveAlert(alertId: number): void {
    if (this.alerts[alertId]) {
      this.alerts[alertId].resolved = true
      this.alerts[alertId].resolvedAt = new Date()
    }
  }
  
  public addAlertCallback(callback: (alert: QualityAlert) => void): void {
    this.alertCallbacks.push(callback)
  }
  
  public getQualityTrend(hours: number = 24): { timestamp: Date, qualityScore: number }[] {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hours)
    
    return this.logs
      .filter(log => log.timestamp > cutoff)
      .map(log => ({ timestamp: log.timestamp, qualityScore: log.qualityScore }))
  }
  
  public getSystemHealth(): {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
    score: number
    issues: string[]
  } {
    const issues: string[] = []
    let score = 100
    
    // Check quality metrics
    if (this.metrics.averageQuality < this.config.qualityThresholds.minimum) {
      issues.push('Average quality below minimum threshold')
      score -= 30
    } else if (this.metrics.averageQuality < this.config.qualityThresholds.warning) {
      issues.push('Average quality below warning threshold')
      score -= 15
    }
    
    // Check engine success rate
    if (this.metrics.engineSuccessRate < this.config.reliabilityThresholds.minimumEngineSuccessRate) {
      issues.push('Engine success rate below minimum')
      score -= 25
    }
    
    // Check processing time
    if (this.metrics.averageProcessingTime > this.config.performanceThresholds.maxProcessingTime) {
      issues.push('Average processing time exceeds maximum')
      score -= 20
    }
    
    // Check active critical alerts
    const activeCriticalAlerts = this.alerts.filter(a => !a.resolved && a.level === 'CRITICAL').length
    if (activeCriticalAlerts > 0) {
      issues.push(`${activeCriticalAlerts} active critical alerts`)
      score -= activeCriticalAlerts * 10
    }
    
    // Determine status
    const status = score >= 80 ? 'HEALTHY' : score >= 60 ? 'WARNING' : 'CRITICAL'
    
    return { status, score: Math.max(score, 0), issues }
  }
}

// 🔧 DEFAULT PRODUCTION CONFIGURATION

export const DEFAULT_PRODUCTION_CONFIG: ProductionConfig = {
  qualityThresholds: {
    minimum: 7.0,      // Absolute minimum for production
    warning: 7.5,      // Warning threshold
    target: 8.0,       // Target quality
    excellent: 8.5     // Excellence benchmark
  },
  performanceThresholds: {
    maxProcessingTime: 60000,      // 60 seconds max
    warningProcessingTime: 45000,  // 45 seconds warning
    targetProcessingTime: 30000    // 30 seconds target
  },
  reliabilityThresholds: {
    minimumEngineSuccessRate: 0.8,  // 80% minimum
    warningEngineSuccessRate: 0.85, // 85% warning
    targetEngineSuccessRate: 0.9    // 90% target
  },
  alerting: {
    enabled: true
  },
  monitoring: {
    enableRealTimeLogging: true,
    enableMetricsCollection: true,
    enableUserTracking: false, // Privacy-focused default
    retentionDays: 30
  }
}

// Create singleton instance for global access
export const productionQualityMonitor = new ProductionQualityMonitor(DEFAULT_PRODUCTION_CONFIG)

export default ProductionQualityMonitor
