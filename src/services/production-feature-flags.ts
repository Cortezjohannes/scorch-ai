/**
 * 🚀 PRODUCTION FEATURE FLAGS SYSTEM
 * 
 * Gradual rollout and emergency rollback system for production deployment.
 * Phase 5: Production Deployment Implementation
 */

// 📊 FEATURE FLAG INTERFACES

export interface FeatureFlag {
  name: string
  description: string
  enabled: boolean
  rolloutPercentage: number // 0-100
  rolloutRules: RolloutRule[]
  emergencyDisable: boolean
  createdAt: Date
  updatedAt: Date
  owner: string
  dependencies?: string[]
  metrics: FeatureFlagMetrics
}

export interface RolloutRule {
  type: 'user_id' | 'session_id' | 'user_agent' | 'ip_address' | 'random' | 'beta_tester'
  condition: string
  percentage: number
  description: string
}

export interface FeatureFlagMetrics {
  totalRequests: number
  enabledRequests: number
  successfulRequests: number
  averageQuality: number
  averageProcessingTime: number
  errorRate: number
  lastUpdated: Date
}

export interface FeatureFlagContext {
  userId?: string
  sessionId?: string
  userAgent?: string
  ipAddress?: string
  isBetaTester?: boolean
  customAttributes?: Record<string, any>
}

export interface RolloutStrategy {
  name: string
  description: string
  phases: RolloutPhase[]
  rollbackTriggers: RollbackTrigger[]
  monitoringPeriod: number // hours
}

export interface RolloutPhase {
  phase: number
  percentage: number
  duration: number // hours
  qualityThreshold: number
  errorRateThreshold: number
  description: string
}

export interface RollbackTrigger {
  type: 'quality_degradation' | 'error_rate_spike' | 'processing_time_spike' | 'manual'
  threshold: number
  timeWindow: number // minutes
  description: string
}

// 🎯 PRODUCTION FEATURE FLAGS CONFIGURATION

export const PRODUCTION_FEATURE_FLAGS: Record<string, FeatureFlag> = {
  comprehensive_engines: {
    name: 'comprehensive_engines',
    description: 'Enable comprehensive 19-engine system for episode generation',
    enabled: true,
    rolloutPercentage: 100, // Start with gradual rollout
    rolloutRules: [
      {
        type: 'random',
        condition: 'random_percentage',
        percentage: 100,
        description: 'Random rollout to percentage of users'
      }
    ],
    emergencyDisable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: 'episode-generation-team',
    dependencies: ['complete_context', 'high_temperature'],
    metrics: {
      totalRequests: 0,
      enabledRequests: 0,
      successfulRequests: 0,
      averageQuality: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      lastUpdated: new Date()
    }
  },
  
  complete_context: {
    name: 'complete_context',
    description: 'Use complete character context without truncation (Phase 1 fix)',
    enabled: true,
    rolloutPercentage: 100,
    rolloutRules: [
      {
        type: 'random',
        condition: 'always_enabled',
        percentage: 100,
        description: 'Foundation feature - always enabled'
      }
    ],
    emergencyDisable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: 'episode-generation-team',
    metrics: {
      totalRequests: 0,
      enabledRequests: 0,
      successfulRequests: 0,
      averageQuality: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      lastUpdated: new Date()
    }
  },
  
  high_temperature: {
    name: 'high_temperature',
    description: 'Use optimized temperature settings (0.85-0.95) for maximum creativity',
    enabled: true,
    rolloutPercentage: 100,
    rolloutRules: [
      {
        type: 'random',
        condition: 'always_enabled',
        percentage: 100,
        description: 'Foundation feature - always enabled'
      }
    ],
    emergencyDisable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: 'episode-generation-team',
    metrics: {
      totalRequests: 0,
      enabledRequests: 0,
      successfulRequests: 0,
      averageQuality: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      lastUpdated: new Date()
    }
  },
  
  genre_engines: {
    name: 'genre_engines',
    description: 'Enable genre-specific engines (comedy, horror, romance, mystery)',
    enabled: true,
    rolloutPercentage: 90,
    rolloutRules: [
      {
        type: 'random',
        condition: 'random_percentage',
        percentage: 90,
        description: 'Gradual rollout to 90% of users'
      }
    ],
    emergencyDisable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: 'episode-generation-team',
    dependencies: ['comprehensive_engines'],
    metrics: {
      totalRequests: 0,
      enabledRequests: 0,
      successfulRequests: 0,
      averageQuality: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      lastUpdated: new Date()
    }
  },
  
  enhanced_fallbacks: {
    name: 'enhanced_fallbacks',
    description: 'Enable enhanced fallback system with multiple quality levels',
    enabled: true,
    rolloutPercentage: 100,
    rolloutRules: [
      {
        type: 'random',
        condition: 'always_enabled',
        percentage: 100,
        description: 'Safety feature - always enabled'
      }
    ],
    emergencyDisable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: 'episode-generation-team',
    metrics: {
      totalRequests: 0,
      enabledRequests: 0,
      successfulRequests: 0,
      averageQuality: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      lastUpdated: new Date()
    }
  },
  
  production_monitoring: {
    name: 'production_monitoring',
    description: 'Enable comprehensive production quality monitoring and alerting',
    enabled: true,
    rolloutPercentage: 100,
    rolloutRules: [
      {
        type: 'random',
        condition: 'always_enabled',
        percentage: 100,
        description: 'Monitoring - always enabled'
      }
    ],
    emergencyDisable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: 'episode-generation-team',
    metrics: {
      totalRequests: 0,
      enabledRequests: 0,
      successfulRequests: 0,
      averageQuality: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      lastUpdated: new Date()
    }
  },
  
  beta_features: {
    name: 'beta_features',
    description: 'Enable experimental features for beta testing',
    enabled: false,
    rolloutPercentage: 5,
    rolloutRules: [
      {
        type: 'beta_tester',
        condition: 'is_beta_tester',
        percentage: 100,
        description: 'Only for beta testers'
      },
      {
        type: 'random',
        condition: 'random_percentage',
        percentage: 5,
        description: 'Random 5% of users'
      }
    ],
    emergencyDisable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: 'episode-generation-team',
    metrics: {
      totalRequests: 0,
      enabledRequests: 0,
      successfulRequests: 0,
      averageQuality: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      lastUpdated: new Date()
    }
  }
}

// 🎯 ROLLOUT STRATEGIES

export const ROLLOUT_STRATEGIES: Record<string, RolloutStrategy> = {
  comprehensive_engines_rollout: {
    name: 'comprehensive_engines_rollout',
    description: 'Gradual rollout of comprehensive 19-engine system',
    phases: [
      {
        phase: 1,
        percentage: 25,
        duration: 48, // 48 hours
        qualityThreshold: 7.5,
        errorRateThreshold: 0.05,
        description: 'Initial rollout to 25% of users'
      },
      {
        phase: 2,
        percentage: 50,
        duration: 72, // 72 hours
        qualityThreshold: 7.8,
        errorRateThreshold: 0.03,
        description: 'Expand to 50% of users if metrics look good'
      },
      {
        phase: 3,
        percentage: 75,
        duration: 48, // 48 hours
        qualityThreshold: 8.0,
        errorRateThreshold: 0.02,
        description: 'Expand to 75% of users'
      },
      {
        phase: 4,
        percentage: 100,
        duration: 168, // 1 week
        qualityThreshold: 8.0,
        errorRateThreshold: 0.02,
        description: 'Full rollout with ongoing monitoring'
      }
    ],
    rollbackTriggers: [
      {
        type: 'quality_degradation',
        threshold: 7.0,
        timeWindow: 30,
        description: 'Quality falls below 7.0 for 30 minutes'
      },
      {
        type: 'error_rate_spike',
        threshold: 0.1,
        timeWindow: 15,
        description: 'Error rate exceeds 10% for 15 minutes'
      },
      {
        type: 'processing_time_spike',
        threshold: 90000, // 90 seconds
        timeWindow: 20,
        description: 'Processing time exceeds 90s for 20 minutes'
      }
    ],
    monitoringPeriod: 24
  }
}

// 🎯 FEATURE FLAG MANAGER CLASS

export class FeatureFlagManager {
  private flags: Record<string, FeatureFlag>
  private rolloutStrategies: Record<string, RolloutStrategy>
  private activeRollouts: Map<string, { strategy: RolloutStrategy, currentPhase: number, phaseStartTime: Date }>
  
  constructor() {
    this.flags = { ...PRODUCTION_FEATURE_FLAGS }
    this.rolloutStrategies = { ...ROLLOUT_STRATEGIES }
    this.activeRollouts = new Map()
    
    console.log('🚀 Feature Flag Manager initialized')
    console.log(`   Total flags: ${Object.keys(this.flags).length}`)
    console.log(`   Enabled flags: ${Object.values(this.flags).filter(f => f.enabled).length}`)
  }
  
  // 🎯 CHECK IF FEATURE IS ENABLED
  
  isFeatureEnabled(flagName: string, context: FeatureFlagContext = {}): boolean {
    const flag = this.flags[flagName]
    
    if (!flag) {
      console.warn(`⚠️ Feature flag '${flagName}' not found`)
      return false
    }
    
    // Check emergency disable
    if (flag.emergencyDisable) {
      console.log(`🚨 Feature '${flagName}' emergency disabled`)
      return false
    }
    
    // Check if flag is globally disabled
    if (!flag.enabled) {
      return false
    }
    
    // Check dependencies
    if (flag.dependencies) {
      for (const dependency of flag.dependencies) {
        if (!this.isFeatureEnabled(dependency, context)) {
          console.log(`⛓️ Feature '${flagName}' disabled due to dependency '${dependency}'`)
          return false
        }
      }
    }
    
    // Check rollout rules
    const enabled = this.evaluateRolloutRules(flag, context)
    
    // Update metrics
    this.updateFeatureMetrics(flagName, true, enabled)
    
    return enabled
  }
  
  // 🎯 EVALUATE ROLLOUT RULES
  
  private evaluateRolloutRules(flag: FeatureFlag, context: FeatureFlagContext): boolean {
    for (const rule of flag.rolloutRules) {
      if (this.evaluateRule(rule, context, flag.rolloutPercentage)) {
        return true
      }
    }
    return false
  }
  
  private evaluateRule(rule: RolloutRule, context: FeatureFlagContext, rolloutPercentage: number): boolean {
    switch (rule.type) {
      case 'user_id':
        if (context.userId) {
          return this.hashToPercentage(context.userId) < rolloutPercentage
        }
        return false
        
      case 'session_id':
        if (context.sessionId) {
          return this.hashToPercentage(context.sessionId) < rolloutPercentage
        }
        return false
        
      case 'beta_tester':
        return context.isBetaTester === true
        
      case 'random':
        return Math.random() * 100 < rolloutPercentage
        
      case 'user_agent':
        if (context.userAgent && rule.condition) {
          return context.userAgent.toLowerCase().includes(rule.condition.toLowerCase())
        }
        return false
        
      case 'ip_address':
        if (context.ipAddress && rule.condition) {
          return context.ipAddress.startsWith(rule.condition)
        }
        return false
        
      default:
        return false
    }
  }
  
  // 🎯 HASH TO PERCENTAGE (FOR CONSISTENT ROLLOUTS)
  
  private hashToPercentage(input: string): number {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100
  }
  
  // 🎯 UPDATE FEATURE METRICS
  
  updateFeatureMetrics(
    flagName: string, 
    requested: boolean, 
    enabled: boolean, 
    success?: boolean, 
    quality?: number, 
    processingTime?: number
  ): void {
    const flag = this.flags[flagName]
    if (!flag) return
    
    const metrics = flag.metrics
    
    if (requested) {
      metrics.totalRequests++
      
      if (enabled) {
        metrics.enabledRequests++
        
        if (success !== undefined) {
          if (success) {
            metrics.successfulRequests++
          }
          
          // Update error rate
          metrics.errorRate = 1 - (metrics.successfulRequests / metrics.enabledRequests)
        }
        
        if (quality !== undefined) {
          // Update average quality (running average)
          metrics.averageQuality = (
            (metrics.averageQuality * (metrics.enabledRequests - 1)) + quality
          ) / metrics.enabledRequests
        }
        
        if (processingTime !== undefined) {
          // Update average processing time (running average)
          metrics.averageProcessingTime = (
            (metrics.averageProcessingTime * (metrics.enabledRequests - 1)) + processingTime
          ) / metrics.enabledRequests
        }
      }
      
      metrics.lastUpdated = new Date()
    }
  }
  
  // 🚀 ROLLOUT MANAGEMENT
  
  startRollout(flagName: string, strategyName: string): boolean {
    const flag = this.flags[flagName]
    const strategy = this.rolloutStrategies[strategyName]
    
    if (!flag || !strategy) {
      console.error(`❌ Cannot start rollout: flag '${flagName}' or strategy '${strategyName}' not found`)
      return false
    }
    
    // Start with first phase
    const firstPhase = strategy.phases[0]
    flag.rolloutPercentage = firstPhase.percentage
    flag.enabled = true
    flag.updatedAt = new Date()
    
    this.activeRollouts.set(flagName, {
      strategy,
      currentPhase: 0,
      phaseStartTime: new Date()
    })
    
    console.log(`🚀 Started rollout '${strategyName}' for feature '${flagName}' at ${firstPhase.percentage}%`)
    return true
  }
  
  checkRolloutProgress(): void {
    for (const [flagName, rollout] of this.activeRollouts.entries()) {
      const flag = this.flags[flagName]
      const currentPhase = rollout.strategy.phases[rollout.currentPhase]
      const phaseElapsed = Date.now() - rollout.phaseStartTime.getTime()
      const phaseDurationMs = currentPhase.duration * 60 * 60 * 1000 // Convert hours to ms
      
      // Check rollback triggers
      if (this.checkRollbackTriggers(flagName, rollout.strategy)) {
        this.executeRollback(flagName, 'Automatic rollback triggered')
        continue
      }
      
      // Check if phase duration completed and metrics are good
      if (phaseElapsed >= phaseDurationMs) {
        const metrics = flag.metrics
        const qualityGood = metrics.averageQuality >= currentPhase.qualityThreshold
        const errorRateGood = metrics.errorRate <= currentPhase.errorRateThreshold
        
        if (qualityGood && errorRateGood) {
          // Advance to next phase
          this.advanceRolloutPhase(flagName)
        } else {
          // Metrics not good enough, consider rollback
          this.executeRollback(flagName, `Phase ${rollout.currentPhase + 1} metrics did not meet thresholds`)
        }
      }
    }
  }
  
  private advanceRolloutPhase(flagName: string): void {
    const rollout = this.activeRollouts.get(flagName)
    const flag = this.flags[flagName]
    
    if (!rollout || !flag) return
    
    const nextPhaseIndex = rollout.currentPhase + 1
    
    if (nextPhaseIndex >= rollout.strategy.phases.length) {
      // Rollout complete
      console.log(`✅ Rollout complete for feature '${flagName}' at 100%`)
      this.activeRollouts.delete(flagName)
      return
    }
    
    const nextPhase = rollout.strategy.phases[nextPhaseIndex]
    
    // Update flag to next phase
    flag.rolloutPercentage = nextPhase.percentage
    flag.updatedAt = new Date()
    
    // Update rollout tracking
    rollout.currentPhase = nextPhaseIndex
    rollout.phaseStartTime = new Date()
    
    console.log(`🚀 Advanced rollout for '${flagName}' to phase ${nextPhaseIndex + 1} (${nextPhase.percentage}%)`)
  }
  
  private checkRollbackTriggers(flagName: string, strategy: RolloutStrategy): boolean {
    const flag = this.flags[flagName]
    if (!flag) return false
    
    const metrics = flag.metrics
    const now = Date.now()
    
    for (const trigger of strategy.rollbackTriggers) {
      switch (trigger.type) {
        case 'quality_degradation':
          if (metrics.averageQuality < trigger.threshold) {
            const timeSinceUpdate = now - metrics.lastUpdated.getTime()
            if (timeSinceUpdate >= trigger.timeWindow * 60 * 1000) {
              console.log(`🚨 Rollback trigger: Quality ${metrics.averageQuality} below ${trigger.threshold} for ${trigger.timeWindow} minutes`)
              return true
            }
          }
          break
          
        case 'error_rate_spike':
          if (metrics.errorRate > trigger.threshold) {
            console.log(`🚨 Rollback trigger: Error rate ${metrics.errorRate} above ${trigger.threshold}`)
            return true
          }
          break
          
        case 'processing_time_spike':
          if (metrics.averageProcessingTime > trigger.threshold) {
            console.log(`🚨 Rollback trigger: Processing time ${metrics.averageProcessingTime}ms above ${trigger.threshold}ms`)
            return true
          }
          break
      }
    }
    
    return false
  }
  
  // 🚨 EMERGENCY ROLLBACK
  
  executeRollback(flagName: string, reason: string): void {
    const flag = this.flags[flagName]
    if (!flag) return
    
    // Disable the feature
    flag.enabled = false
    flag.emergencyDisable = true
    flag.updatedAt = new Date()
    
    // Remove from active rollouts
    this.activeRollouts.delete(flagName)
    
    console.log(`🚨 EMERGENCY ROLLBACK: Feature '${flagName}' disabled. Reason: ${reason}`)
    
    // TODO: Send alerts, notifications, etc.
  }
  
  manualRollback(flagName: string, reason: string): boolean {
    const flag = this.flags[flagName]
    if (!flag) {
      console.error(`❌ Cannot rollback: feature '${flagName}' not found`)
      return false
    }
    
    this.executeRollback(flagName, `Manual rollback: ${reason}`)
    return true
  }
  
  // 🎯 CONFIGURATION MANAGEMENT
  
  updateFlag(flagName: string, updates: Partial<FeatureFlag>): boolean {
    const flag = this.flags[flagName]
    if (!flag) {
      console.error(`❌ Cannot update: feature '${flagName}' not found`)
      return false
    }
    
    Object.assign(flag, updates, { updatedAt: new Date() })
    console.log(`✅ Updated feature flag '${flagName}'`)
    return true
  }
  
  getActiveFlags(): string[] {
    return Object.entries(this.flags)
      .filter(([_, flag]) => flag.enabled && !flag.emergencyDisable)
      .map(([name, _]) => name)
  }
  
  getFlagMetrics(flagName: string): FeatureFlagMetrics | null {
    const flag = this.flags[flagName]
    return flag ? flag.metrics : null
  }
  
  getAllMetrics(): Record<string, FeatureFlagMetrics> {
    const metrics: Record<string, FeatureFlagMetrics> = {}
    for (const [name, flag] of Object.entries(this.flags)) {
      metrics[name] = flag.metrics
    }
    return metrics
  }
  
  getRolloutStatus(): Array<{ flagName: string, strategy: string, phase: number, percentage: number }> {
    const status = []
    for (const [flagName, rollout] of this.activeRollouts.entries()) {
      status.push({
        flagName,
        strategy: rollout.strategy.name,
        phase: rollout.currentPhase + 1,
        percentage: rollout.strategy.phases[rollout.currentPhase].percentage
      })
    }
    return status
  }
}

// Create singleton instance for global access
export const featureFlagManager = new FeatureFlagManager()

// Start rollout monitoring
setInterval(() => {
  featureFlagManager.checkRolloutProgress()
}, 5 * 60 * 1000) // Check every 5 minutes

export default FeatureFlagManager
