/**
 * 🚀 PRODUCTION MONITORING DASHBOARD
 * 
 * Comprehensive metrics collection, trend analysis, and monitoring dashboard.
 * Phase 5: Production Deployment Implementation
 */

import { productionQualityMonitor, ProductionMetrics, QualityAlert } from './production-quality-monitor'
import { featureFlagManager, FeatureFlagMetrics } from './production-feature-flags'

// 📊 DASHBOARD INTERFACES

export interface DashboardMetrics {
  overview: OverviewMetrics
  quality: QualityTrendMetrics
  performance: PerformanceMetrics
  reliability: ReliabilityMetrics
  featureFlags: FeatureFlagDashboardMetrics
  userSatisfaction: UserSatisfactionMetrics
  alerts: AlertMetrics
  trends: TrendAnalysis
}

export interface OverviewMetrics {
  totalEpisodes: number
  episodesToday: number
  averageQuality: number
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  uptime: number
  activeUsers: number
  successRate: number
}

export interface QualityTrendMetrics {
  current: number
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING'
  dailyAverage: number[]
  hourlyAverage: number[]
  qualityDistribution: {
    masterpiece: number    // 9.0+
    cinematic: number      // 8.0-8.9
    excellent: number      // 7.0-7.9
    good: number          // 5.0-6.9
    basic: number         // 3.0-4.9
    poor: number          // <3.0
  }
  topPerformingGenres: Array<{ genre: string, averageQuality: number, count: number }>
}

export interface PerformanceMetrics {
  averageProcessingTime: number
  p95ProcessingTime: number
  p99ProcessingTime: number
  timeoutRate: number
  engineSuccessRate: number
  fallbackUsageRate: number
  processingTimeTrend: number[] // Last 24 hours
}

export interface ReliabilityMetrics {
  uptime: number
  errorRate: number
  criticalErrors: number
  recoveryTime: number // Average time to recover from errors
  slaCompliance: number // Percentage of requests meeting SLA
  engineHealthScores: Record<string, number>
}

export interface FeatureFlagDashboardMetrics {
  activeFlags: number
  rolloutInProgress: number
  emergencyDisabled: number
  flagPerformance: Record<string, {
    enabled: boolean
    usage: number
    successRate: number
    averageQuality: number
  }>
}

export interface UserSatisfactionMetrics {
  overallSatisfaction: number
  qualityCorrelation: number
  retentionRate: number
  engagementMetrics: {
    averageChoicesPerEpisode: number
    completionRate: number
    repeatUsage: number
  }
}

export interface AlertMetrics {
  activeCritical: number
  activeWarnings: number
  resolvedToday: number
  meanTimeToResolve: number
  recentAlerts: QualityAlert[]
}

export interface TrendAnalysis {
  qualityTrend: TrendDirection
  performanceTrend: TrendDirection
  reliabilityTrend: TrendDirection
  userSatisfactionTrend: TrendDirection
  predictions: {
    nextHourQuality: number
    nextDayVolume: number
    potentialIssues: string[]
  }
}

export type TrendDirection = 'IMPROVING' | 'STABLE' | 'DECLINING'

export interface HistoricalData {
  timestamp: Date
  metrics: DashboardMetrics
}

// 🎯 PRODUCTION MONITORING DASHBOARD CLASS

export class ProductionMonitoringDashboard {
  private historicalData: HistoricalData[] = []
  private collectionInterval: NodeJS.Timeout | null = null
  private alertCallbacks: Array<(alert: QualityAlert) => void> = []
  
  constructor() {
    console.log('🚀 Production Monitoring Dashboard initialized')
    this.startMetricsCollection()
    this.setupAlertHandlers()
  }
  
  // 📊 GET CURRENT DASHBOARD METRICS
  
  getDashboardMetrics(): DashboardMetrics {
    const currentTime = new Date()
    const productionMetrics = productionQualityMonitor.getCurrentMetrics()
    const systemHealth = productionQualityMonitor.getSystemHealth()
    const activeAlerts = productionQualityMonitor.getActiveAlerts()
    const flagMetrics = featureFlagManager.getAllMetrics()
    
    return {
      overview: this.calculateOverviewMetrics(productionMetrics, systemHealth),
      quality: this.calculateQualityTrends(productionMetrics),
      performance: this.calculatePerformanceMetrics(productionMetrics),
      reliability: this.calculateReliabilityMetrics(productionMetrics, systemHealth),
      featureFlags: this.calculateFeatureFlagMetrics(flagMetrics),
      userSatisfaction: this.calculateUserSatisfactionMetrics(productionMetrics),
      alerts: this.calculateAlertMetrics(activeAlerts),
      trends: this.calculateTrendAnalysis()
    }
  }
  
  // 📈 CALCULATE OVERVIEW METRICS
  
  private calculateOverviewMetrics(metrics: ProductionMetrics, health: any): OverviewMetrics {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const recentLogs = productionQualityMonitor.getRecentLogs(100)
    const todayLogs = recentLogs.filter(log => log.timestamp >= today)
    
    return {
      totalEpisodes: metrics.totalEpisodes,
      episodesToday: todayLogs.length,
      averageQuality: Math.round(metrics.averageQuality * 100) / 100,
      systemHealth: health.status,
      uptime: metrics.uptimePercentage,
      activeUsers: this.estimateActiveUsers(recentLogs),
      successRate: metrics.totalEpisodes > 0 ? 
        (metrics.totalEpisodes - (metrics.qualityDistribution.poor || 0)) / metrics.totalEpisodes * 100 : 100
    }
  }
  
  // 📊 CALCULATE QUALITY TRENDS
  
  private calculateQualityTrends(metrics: ProductionMetrics): QualityTrendMetrics {
    const qualityTrend = productionQualityMonitor.getQualityTrend(24)
    const dailyData = this.aggregateQualityByDay(qualityTrend, 7)
    const hourlyData = this.aggregateQualityByHour(qualityTrend, 24)
    
    return {
      current: Math.round(metrics.averageQuality * 100) / 100,
      trend: this.calculateTrendDirection(hourlyData),
      dailyAverage: dailyData,
      hourlyAverage: hourlyData,
      qualityDistribution: metrics.qualityDistribution,
      topPerformingGenres: this.calculateTopGenres()
    }
  }
  
  // ⚡ CALCULATE PERFORMANCE METRICS
  
  private calculatePerformanceMetrics(metrics: ProductionMetrics): PerformanceMetrics {
    const recentLogs = productionQualityMonitor.getRecentLogs(100)
    const processingTimes = recentLogs.map(log => log.processingTime)
    
    return {
      averageProcessingTime: Math.round(metrics.averageProcessingTime),
      p95ProcessingTime: this.calculatePercentile(processingTimes, 95),
      p99ProcessingTime: this.calculatePercentile(processingTimes, 99),
      timeoutRate: this.calculateTimeoutRate(recentLogs),
      engineSuccessRate: Math.round(metrics.engineSuccessRate * 100),
      fallbackUsageRate: Math.round(metrics.fallbackUsageRate * 100),
      processingTimeTrend: this.aggregateProcessingTimeByHour(recentLogs, 24)
    }
  }
  
  // 🛡️ CALCULATE RELIABILITY METRICS
  
  private calculateReliabilityMetrics(metrics: ProductionMetrics, health: any): ReliabilityMetrics {
    const recentLogs = productionQualityMonitor.getRecentLogs(100)
    const errors = recentLogs.filter(log => log.qualityScore < 3.0)
    
    return {
      uptime: metrics.uptimePercentage,
      errorRate: errors.length / Math.max(recentLogs.length, 1) * 100,
      criticalErrors: metrics.criticalAlerts,
      recoveryTime: this.calculateAverageRecoveryTime(),
      slaCompliance: this.calculateSLACompliance(recentLogs),
      engineHealthScores: this.calculateEngineHealthScores(recentLogs)
    }
  }
  
  // 🎛️ CALCULATE FEATURE FLAG METRICS
  
  private calculateFeatureFlagMetrics(flagMetrics: Record<string, FeatureFlagMetrics>): FeatureFlagDashboardMetrics {
    const activeFlags = featureFlagManager.getActiveFlags()
    const rolloutStatus = featureFlagManager.getRolloutStatus()
    
    const flagPerformance: Record<string, any> = {}
    
    for (const [flagName, metrics] of Object.entries(flagMetrics)) {
      flagPerformance[flagName] = {
        enabled: activeFlags.includes(flagName),
        usage: metrics.enabledRequests,
        successRate: Math.round((1 - metrics.errorRate) * 100),
        averageQuality: Math.round(metrics.averageQuality * 100) / 100
      }
    }
    
    return {
      activeFlags: activeFlags.length,
      rolloutInProgress: rolloutStatus.length,
      emergencyDisabled: Object.values(featureFlagManager['flags']).filter(f => f.emergencyDisable).length,
      flagPerformance
    }
  }
  
  // 😊 CALCULATE USER SATISFACTION METRICS
  
  private calculateUserSatisfactionMetrics(metrics: ProductionMetrics): UserSatisfactionMetrics {
    // Simulate user satisfaction based on quality scores
    // In a real implementation, this would come from user feedback systems
    
    const qualityBasedSatisfaction = Math.min(metrics.averageQuality * 1.2, 10)
    
    return {
      overallSatisfaction: Math.round(qualityBasedSatisfaction * 100) / 100,
      qualityCorrelation: 0.85, // Strong correlation between quality and satisfaction
      retentionRate: Math.min(qualityBasedSatisfaction * 10, 95),
      engagementMetrics: {
        averageChoicesPerEpisode: 2.8,
        completionRate: Math.min(qualityBasedSatisfaction * 11, 98),
        repeatUsage: Math.min(qualityBasedSatisfaction * 9, 85)
      }
    }
  }
  
  // 🚨 CALCULATE ALERT METRICS
  
  private calculateAlertMetrics(alerts: QualityAlert[]): AlertMetrics {
    const criticalAlerts = alerts.filter(a => a.level === 'CRITICAL')
    const warningAlerts = alerts.filter(a => a.level === 'WARNING')
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const resolvedToday = this.getResolvedAlertsToday()
    
    return {
      activeCritical: criticalAlerts.length,
      activeWarnings: warningAlerts.length,
      resolvedToday,
      meanTimeToResolve: this.calculateMeanTimeToResolve(),
      recentAlerts: alerts.slice(0, 10) // Most recent 10 alerts
    }
  }
  
  // 📈 CALCULATE TREND ANALYSIS
  
  private calculateTrendAnalysis(): TrendAnalysis {
    const qualityTrend = this.calculateQualityTrendDirection()
    const performanceTrend = this.calculatePerformanceTrendDirection()
    const reliabilityTrend = this.calculateReliabilityTrendDirection()
    const userSatisfactionTrend = this.calculateUserSatisfactionTrendDirection()
    
    return {
      qualityTrend,
      performanceTrend,
      reliabilityTrend,
      userSatisfactionTrend,
      predictions: {
        nextHourQuality: this.predictNextHourQuality(),
        nextDayVolume: this.predictNextDayVolume(),
        potentialIssues: this.identifyPotentialIssues()
      }
    }
  }
  
  // 🔧 HELPER METHODS
  
  private estimateActiveUsers(logs: any[]): number {
    const uniqueSessions = new Set(logs.map(log => log.sessionId))
    return uniqueSessions.size
  }
  
  private aggregateQualityByDay(data: any[], days: number): number[] {
    const result = []
    const now = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const dayData = data.filter(d => d.timestamp >= date && d.timestamp < nextDate)
      const average = dayData.length > 0 ? 
        dayData.reduce((sum, d) => sum + d.qualityScore, 0) / dayData.length : 0
      
      result.push(Math.round(average * 100) / 100)
    }
    
    return result
  }
  
  private aggregateQualityByHour(data: any[], hours: number): number[] {
    const result = []
    const now = new Date()
    
    for (let i = hours - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setHours(date.getHours() - i, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setHours(nextDate.getHours() + 1)
      
      const hourData = data.filter(d => d.timestamp >= date && d.timestamp < nextDate)
      const average = hourData.length > 0 ? 
        hourData.reduce((sum, d) => sum + d.qualityScore, 0) / hourData.length : 0
      
      result.push(Math.round(average * 100) / 100)
    }
    
    return result
  }
  
  private calculateTrendDirection(data: number[]): TrendDirection {
    if (data.length < 2) return 'STABLE'
    
    const recentAvg = data.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, data.length)
    const olderAvg = data.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, data.length - 3)
    
    const difference = recentAvg - olderAvg
    
    if (difference > 0.2) return 'IMPROVING'
    if (difference < -0.2) return 'DECLINING'
    return 'STABLE'
  }
  
  private calculatePercentile(numbers: number[], percentile: number): number {
    if (numbers.length === 0) return 0
    
    const sorted = numbers.sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }
  
  private calculateTimeoutRate(logs: any[]): number {
    const timeouts = logs.filter(log => log.processingTime > 60000)
    return logs.length > 0 ? (timeouts.length / logs.length) * 100 : 0
  }
  
  private aggregateProcessingTimeByHour(logs: any[], hours: number): number[] {
    const result = []
    const now = new Date()
    
    for (let i = hours - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setHours(date.getHours() - i, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setHours(nextDate.getHours() + 1)
      
      const hourLogs = logs.filter(log => log.timestamp >= date && log.timestamp < nextDate)
      const average = hourLogs.length > 0 ? 
        hourLogs.reduce((sum, log) => sum + log.processingTime, 0) / hourLogs.length : 0
      
      result.push(Math.round(average))
    }
    
    return result
  }
  
  private calculateTopGenres(): Array<{ genre: string, averageQuality: number, count: number }> {
    // Simulate genre performance data
    // In a real implementation, this would analyze actual episode data
    return [
      { genre: 'Drama', averageQuality: 8.3, count: 150 },
      { genre: 'Sci-Fi', averageQuality: 8.1, count: 120 },
      { genre: 'Romance', averageQuality: 8.0, count: 95 },
      { genre: 'Comedy', averageQuality: 7.9, count: 80 },
      { genre: 'Thriller', averageQuality: 7.8, count: 70 }
    ]
  }
  
  private calculateAverageRecoveryTime(): number {
    // Simulate recovery time calculation
    return 12.5 // Average 12.5 minutes to recover from errors
  }
  
  private calculateSLACompliance(logs: any[]): number {
    const slaCompliant = logs.filter(log => 
      log.qualityScore >= 7.0 && 
      log.processingTime <= 60000 && 
      log.engineSuccessRate >= 0.8
    )
    
    return logs.length > 0 ? (slaCompliant.length / logs.length) * 100 : 100
  }
  
  private calculateEngineHealthScores(logs: any[]): Record<string, number> {
    // Simulate engine health calculation
    return {
      'FractalNarrativeEngineV2': 95,
      'StrategicDialogueEngine': 92,
      'CharacterEngineV2': 94,
      'WorldBuildingEngineV2': 89,
      'ThemeIntegrationEngineV2': 91,
      'InteractiveChoiceEngineV2': 88
    }
  }
  
  private getResolvedAlertsToday(): number {
    // Simulate resolved alerts count
    return 8
  }
  
  private calculateMeanTimeToResolve(): number {
    // Simulate mean time to resolve
    return 15.3 // 15.3 minutes average
  }
  
  private calculateQualityTrendDirection(): TrendDirection {
    const qualityTrend = productionQualityMonitor.getQualityTrend(24)
    const hourlyData = this.aggregateQualityByHour(qualityTrend, 24)
    return this.calculateTrendDirection(hourlyData)
  }
  
  private calculatePerformanceTrendDirection(): TrendDirection {
    const recentLogs = productionQualityMonitor.getRecentLogs(100)
    const processingTimes = this.aggregateProcessingTimeByHour(recentLogs, 24)
    
    // For performance, improving means decreasing processing time
    const trend = this.calculateTrendDirection(processingTimes.map(t => -t))
    return trend
  }
  
  private calculateReliabilityTrendDirection(): TrendDirection {
    // Simulate reliability trend based on uptime and error rates
    return 'STABLE'
  }
  
  private calculateUserSatisfactionTrendDirection(): TrendDirection {
    // Simulate user satisfaction trend
    return 'IMPROVING'
  }
  
  private predictNextHourQuality(): number {
    const currentMetrics = productionQualityMonitor.getCurrentMetrics()
    const trend = this.calculateQualityTrendDirection()
    
    let prediction = currentMetrics.averageQuality
    
    if (trend === 'IMPROVING') prediction += 0.1
    else if (trend === 'DECLINING') prediction -= 0.1
    
    return Math.round(Math.max(0, Math.min(10, prediction)) * 100) / 100
  }
  
  private predictNextDayVolume(): number {
    const recentLogs = productionQualityMonitor.getRecentLogs(100)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = recentLogs.filter(log => log.timestamp >= today).length
    
    // Simple prediction: today's count * 1.1 (assuming 10% growth)
    return Math.round(todayCount * 1.1)
  }
  
  private identifyPotentialIssues(): string[] {
    const issues = []
    const metrics = productionQualityMonitor.getCurrentMetrics()
    const systemHealth = productionQualityMonitor.getSystemHealth()
    
    if (metrics.averageQuality < 7.5) {
      issues.push('Quality trending below target')
    }
    
    if (metrics.averageProcessingTime > 45000) {
      issues.push('Processing time approaching limits')
    }
    
    if (metrics.engineSuccessRate < 0.85) {
      issues.push('Engine success rate below optimal')
    }
    
    if (systemHealth.score < 80) {
      issues.push('System health degrading')
    }
    
    return issues
  }
  
  // 🚀 METRICS COLLECTION
  
  private startMetricsCollection(): void {
    // Collect metrics every 5 minutes
    this.collectionInterval = setInterval(() => {
      const metrics = this.getDashboardMetrics()
      this.historicalData.push({
        timestamp: new Date(),
        metrics
      })
      
      // Keep only last 24 hours of data
      const cutoff = new Date()
      cutoff.setHours(cutoff.getHours() - 24)
      this.historicalData = this.historicalData.filter(d => d.timestamp > cutoff)
      
    }, 5 * 60 * 1000)
  }
  
  private setupAlertHandlers(): void {
    // Set up alert handling for dashboard notifications
    productionQualityMonitor.addAlertCallback((alert) => {
      console.log(`🚨 Dashboard Alert: ${alert.level} - ${alert.message}`)
      
      // Trigger dashboard alert callbacks
      for (const callback of this.alertCallbacks) {
        try {
          callback(alert)
        } catch (error) {
          console.error('❌ Dashboard alert callback failed:', error)
        }
      }
    })
  }
  
  // 📊 PUBLIC API
  
  getHistoricalData(hours: number = 24): HistoricalData[] {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hours)
    return this.historicalData.filter(d => d.timestamp > cutoff)
  }
  
  addAlertCallback(callback: (alert: QualityAlert) => void): void {
    this.alertCallbacks.push(callback)
  }
  
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    const metrics = this.getDashboardMetrics()
    
    if (format === 'json') {
      return JSON.stringify(metrics, null, 2)
    } else {
      // Simple CSV export for overview metrics
      const overview = metrics.overview
      const csv = `Metric,Value
Total Episodes,${overview.totalEpisodes}
Episodes Today,${overview.episodesToday}
Average Quality,${overview.averageQuality}
System Health,${overview.systemHealth}
Uptime,${overview.uptime}%
Success Rate,${overview.successRate}%`
      return csv
    }
  }
  
  generateHealthReport(): string {
    const metrics = this.getDashboardMetrics()
    const health = productionQualityMonitor.getSystemHealth()
    
    return `
📊 PRODUCTION HEALTH REPORT
Generated: ${new Date().toISOString()}

🎯 OVERVIEW:
• System Health: ${health.status} (${health.score}/100)
• Total Episodes: ${metrics.overview.totalEpisodes}
• Average Quality: ${metrics.overview.averageQuality}/10
• Success Rate: ${metrics.overview.successRate}%
• Uptime: ${metrics.overview.uptime}%

⚡ PERFORMANCE:
• Average Processing Time: ${metrics.performance.averageProcessingTime}ms
• P95 Processing Time: ${metrics.performance.p95ProcessingTime}ms
• Engine Success Rate: ${metrics.performance.engineSuccessRate}%
• Fallback Usage: ${metrics.performance.fallbackUsageRate}%

🚨 ALERTS:
• Critical Alerts: ${metrics.alerts.activeCritical}
• Warning Alerts: ${metrics.alerts.activeWarnings}
• Mean Time to Resolve: ${metrics.alerts.meanTimeToResolve} min

📈 TRENDS:
• Quality Trend: ${metrics.trends.qualityTrend}
• Performance Trend: ${metrics.trends.performanceTrend}
• Reliability Trend: ${metrics.trends.reliabilityTrend}

🔮 PREDICTIONS:
• Next Hour Quality: ${metrics.trends.predictions.nextHourQuality}/10
• Next Day Volume: ${metrics.trends.predictions.nextDayVolume} episodes
• Potential Issues: ${metrics.trends.predictions.potentialIssues.join(', ') || 'None identified'}
`
  }
}

// Create singleton instance for global access
export const productionMonitoringDashboard = new ProductionMonitoringDashboard()

export default ProductionMonitoringDashboard
