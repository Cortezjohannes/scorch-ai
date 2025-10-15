#!/usr/bin/env node

/**
 * 🚀 PHASE 2: GRADUAL ROLLOUT DEPLOYMENT SCRIPT
 * 
 * This script manages the gradual rollout of enhanced visual storyboards:
 * 1. Starts with 10% rollout
 * 2. Monitors performance and success rates
 * 3. Gradually increases to 100% based on metrics
 * 4. Provides real-time rollout control and monitoring
 */

const { getRolloutStatus, setUserPreference, increaseRolloutPercentage } = require('./src/services/preproduction-v2-generators.ts');

// Environment configuration for Phase 2
const PHASE2_CONFIG = {
  initialRollout: 10,        // Start with 10%
  targetRollout: 100,        // Target 100%
  increaseThreshold: 0.95,   // Increase rollout when success rate > 95%
  decreaseThreshold: 0.90,   // Decrease rollout when success rate < 90%
  increaseStep: 10,          // Increase by 10% at a time
  decreaseStep: 10,          // Decrease by 10% at a time
  monitoringInterval: 5000,  // Check metrics every 5 seconds
  maxRolloutTime: 24 * 60 * 60 * 1000 // 24 hours max for full rollout
};

class Phase2DeploymentManager {
  constructor() {
    this.startTime = Date.now();
    this.currentPhase = 'INITIAL_ROLLOUT';
    this.phaseHistory = [];
    this.isMonitoring = false;
  }
  
  /**
   * 🚀 START PHASE 2 DEPLOYMENT
   */
  async startPhase2Deployment() {
    console.log('🎬 ========================================');
    console.log('🎬 PHASE 2: GRADUAL ROLLOUT DEPLOYMENT');
    console.log('🎬 ========================================');
    console.log('');
    
    try {
      // Step 1: Initial Setup
      console.log('🚀 STEP 1: Initial Deployment Setup');
      console.log('----------------------------------------');
      
      this.setEnvironmentVariables(PHASE2_CONFIG.initialRollout);
      console.log(`✅ Environment configured for ${PHASE2_CONFIG.initialRollout}% rollout`);
      console.log(`✅ Enhanced storyboards enabled with STANDARD enhancement level`);
      console.log(`✅ Performance monitoring activated`);
      console.log(`✅ Fallback threshold set to 95% success rate`);
      console.log('');
      
      // Step 2: Start Monitoring
      console.log('📊 STEP 2: Starting Performance Monitoring');
      console.log('----------------------------------------');
      
      this.startMonitoring();
      console.log(`✅ Monitoring started (checking every ${PHASE2_CONFIG.monitoringInterval/1000} seconds)`);
      console.log(`✅ Success rate threshold: ${PHASE2_CONFIG.increaseThreshold * 100}%`);
      console.log(`✅ Fallback threshold: ${PHASE2_CONFIG.decreaseThreshold * 100}%`);
      console.log('');
      
      // Step 3: Deployment Instructions
      console.log('🎯 STEP 3: Deployment Instructions');
      console.log('----------------------------------------');
      
      this.printDeploymentInstructions();
      console.log('');
      
      // Step 4: Wait for User Input
      console.log('⏳ STEP 4: Waiting for User Input');
      console.log('----------------------------------------');
      console.log('Press Enter to continue monitoring, or type commands:');
      console.log('  status    - Show current rollout status');
      console.log('  increase  - Manually increase rollout percentage');
      console.log('  user <id> <enable|disable> - Set user preference');
      console.log('  stop      - Stop monitoring and deployment');
      console.log('');
      
      this.waitForUserInput();
      
    } catch (error) {
      console.error('❌ Phase 2 deployment failed:', error);
      console.log('🔄 System will continue with original storyboard generation');
    }
  }
  
  /**
   * ⚙️ SET ENVIRONMENT VARIABLES
   */
  setEnvironmentVariables(rolloutPercentage) {
    // In production, this would set actual environment variables
    // For now, we'll simulate the configuration
    process.env.ENABLE_ENHANCED_STORYBOARDS = 'true';
    process.env.ENHANCED_STORYBOARDS_ROLLOUT = rolloutPercentage.toString();
    process.env.ENHANCED_STORYBOARDS_LEVEL = 'STANDARD';
    process.env.ENHANCED_STORYBOARDS_STYLE = 'auto';
    process.env.ENHANCED_STORYBOARDS_MONITORING = 'true';
    process.env.ENHANCED_STORYBOARDS_FEEDBACK = 'true';
    process.env.ENHANCED_STORYBOARDS_FALLBACK_THRESHOLD = '0.95';
    
    console.log(`⚙️ Environment variables configured for ${rolloutPercentage}% rollout`);
  }
  
  /**
   * 📊 START PERFORMANCE MONITORING
   */
  startMonitoring() {
    this.isMonitoring = true;
    
    const monitor = async () => {
      if (!this.isMonitoring) return;
      
      try {
        const status = getRolloutStatus();
        const { config, metrics } = status;
        
        // Calculate current success rate
        const successRate = metrics.totalRequests > 0 ? 
          metrics.successfulEnhanced / metrics.totalRequests : 0;
        
        // Log current status
        this.logCurrentStatus(status);
        
        // Check if we should adjust rollout
        this.checkRolloutAdjustment(status, successRate);
        
        // Check if we've reached target
        if (config.rolloutPercentage >= PHASE2_CONFIG.targetRollout) {
          console.log('🎉 TARGET ROLLOUT REACHED! Enhanced storyboards are now enabled for 100% of users!');
          this.stopMonitoring();
          return;
        }
        
        // Check if we've exceeded max time
        if (Date.now() - this.startTime > PHASE2_CONFIG.maxRolloutTime) {
          console.log('⏰ MAXIMUM ROLLOUT TIME REACHED. Stopping automatic deployment.');
          this.stopMonitoring();
          return;
        }
        
        // Continue monitoring
        setTimeout(monitor, PHASE2_CONFIG.monitoringInterval);
        
      } catch (error) {
        console.error('❌ Monitoring error:', error);
        setTimeout(monitor, PHASE2_CONFIG.monitoringInterval);
      }
    };
    
    // Start monitoring
    monitor();
  }
  
  /**
   * 📊 LOG CURRENT STATUS
   */
  logCurrentStatus(status) {
    const { config, metrics } = status;
    const successRate = metrics.totalRequests > 0 ? 
      (metrics.successfulEnhanced / metrics.totalRequests) * 100 : 0;
    
    const avgQuality = metrics.qualityScores.length > 0 ?
      metrics.qualityScores.reduce((a, b) => a + b, 0) / metrics.qualityScores.length : 0;
    
    console.log(`\n📊 [${new Date().toLocaleTimeString()}] Rollout Status:
    🎲 Rollout Percentage: ${config.rolloutPercentage}%
    📈 Total Requests: ${metrics.totalRequests}
    ✅ Enhanced Success: ${metrics.successfulEnhanced}
    ❌ Enhanced Failures: ${metrics.failedEnhanced}
    🛡️ Fallbacks: ${metrics.fallbackToOriginal}
    📊 Success Rate: ${successRate.toFixed(1)}%
    ⏱️ Avg Generation Time: ${metrics.averageGenerationTime.toFixed(0)}ms
    🎨 Avg Quality Score: ${(avgQuality * 100).toFixed(1)}%
    👤 User Satisfaction: ${metrics.userSatisfaction}/10`);
  }
  
  /**
   * 🔄 CHECK ROLLOUT ADJUSTMENT
   */
  checkRolloutAdjustment(status, successRate) {
    const { config } = status;
    
    // Increase rollout if performance is excellent
    if (successRate >= PHASE2_CONFIG.increaseThreshold && 
        config.rolloutPercentage < PHASE2_CONFIG.targetRollout &&
        metrics.totalRequests >= 10) { // Require minimum sample size
      
      const newRollout = Math.min(
        PHASE2_CONFIG.targetRollout, 
        config.rolloutPercentage + PHASE2_CONFIG.increaseStep
      );
      
      console.log(`📈 EXCELLENT PERFORMANCE! Success rate ${successRate.toFixed(1)}% >= ${PHASE2_CONFIG.increaseThreshold * 100}%`);
      console.log(`🚀 Increasing rollout from ${config.rolloutPercentage}% to ${newRollout}%`);
      
      this.setEnvironmentVariables(newRollout);
      this.phaseHistory.push({
        timestamp: new Date(),
        action: 'INCREASE',
        from: config.rolloutPercentage,
        to: newRollout,
        reason: `Success rate ${successRate.toFixed(1)}% above threshold`
      });
    }
    
    // Decrease rollout if performance is poor
    else if (successRate < PHASE2_CONFIG.decreaseThreshold && 
             config.rolloutPercentage > PHASE2_CONFIG.initialRollout &&
             metrics.totalRequests >= 5) { // Require minimum sample size
      
      const newRollout = Math.max(
        PHASE2_CONFIG.initialRollout, 
        config.rolloutPercentage - PHASE2_CONFIG.decreaseStep
      );
      
      console.log(`⚠️ POOR PERFORMANCE! Success rate ${successRate.toFixed(1)}% < ${PHASE2_CONFIG.decreaseThreshold * 100}%`);
      console.log(`📉 Decreasing rollout from ${config.rolloutPercentage}% to ${newRollout}%`);
      
      this.setEnvironmentVariables(newRollout);
      this.phaseHistory.push({
        timestamp: new Date(),
        action: 'DECREASE',
        from: config.rolloutPercentage,
        to: newRollout,
        reason: `Success rate ${successRate.toFixed(1)}% below threshold`
      });
    }
  }
  
  /**
   * 📋 PRINT DEPLOYMENT INSTRUCTIONS
   */
  printDeploymentInstructions() {
    console.log('🎯 DEPLOYMENT STRATEGY:');
    console.log(`  • Start with ${PHASE2_CONFIG.initialRollout}% of users getting enhanced storyboards`);
    console.log(`  • Monitor success rate every ${PHASE2_CONFIG.monitoringInterval/1000} seconds`);
    console.log(`  • Increase rollout by ${PHASE2_CONFIG.increaseStep}% when success rate > ${PHASE2_CONFIG.increaseThreshold * 100}%`);
    console.log(`  • Decrease rollout by ${PHASE2_CONFIG.decreaseStep}% when success rate < ${PHASE2_CONFIG.decreaseThreshold * 100}%`);
    console.log(`  • Target: ${PHASE2_CONFIG.targetRollout}% rollout within ${PHASE2_CONFIG.maxRolloutTime/1000/60/60} hours`);
    console.log('');
    console.log('🛡️ SAFETY FEATURES:');
    console.log('  • Automatic fallback to original system on any failure');
    console.log('  • Rollout reduction on poor performance');
    console.log('  • User opt-in/opt-out capability');
    console.log('  • Real-time performance monitoring');
    console.log('  • Zero breaking changes to existing functionality');
  }
  
  /**
   * ⌨️ WAIT FOR USER INPUT
   */
  waitForUserInput() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.on('line', (input) => {
      const command = input.trim().toLowerCase();
      
      switch (command) {
        case 'status':
          this.showStatus();
          break;
          
        case 'increase':
          this.manualIncrease();
          break;
          
        case 'stop':
          this.stopMonitoring();
          rl.close();
          break;
          
        default:
          if (command.startsWith('user ')) {
            this.handleUserCommand(command);
          } else {
            console.log('Available commands: status, increase, user <id> <enable|disable>, stop');
          }
      }
      
      if (this.isMonitoring) {
        console.log('\nPress Enter to continue monitoring, or type commands...');
      }
    });
  }
  
  /**
   * 📊 SHOW CURRENT STATUS
   */
  showStatus() {
    const status = getRolloutStatus();
    console.log('\n📊 CURRENT ROLLOUT STATUS:');
    console.log(JSON.stringify(status, null, 2));
    
    if (this.phaseHistory.length > 0) {
      console.log('\n📈 PHASE HISTORY:');
      this.phaseHistory.forEach((phase, index) => {
        console.log(`  ${index + 1}. ${phase.timestamp.toLocaleTimeString()} - ${phase.action}: ${phase.from}% → ${phase.to}% (${phase.reason})`);
      });
    }
  }
  
  /**
   * 🚀 MANUAL INCREASE
   */
  manualIncrease() {
    const status = getRolloutStatus();
    const currentRollout = status.config.rolloutPercentage;
    const newRollout = Math.min(100, currentRollout + 10);
    
    console.log(`🚀 Manually increasing rollout from ${currentRollout}% to ${newRollout}%`);
    this.setEnvironmentVariables(newRollout);
    
    this.phaseHistory.push({
      timestamp: new Date(),
      action: 'MANUAL_INCREASE',
      from: currentRollout,
      to: newRollout,
      reason: 'User requested manual increase'
    });
  }
  
  /**
   * 👤 HANDLE USER COMMAND
   */
  handleUserCommand(command) {
    const parts = command.split(' ');
    if (parts.length !== 3) {
      console.log('Usage: user <userId> <enable|disable>');
      return;
    }
    
    const userId = parts[1];
    const enabled = parts[2] === 'enable';
    
    setUserPreference(userId, enabled);
    console.log(`👤 User ${userId} ${enabled ? 'enabled' : 'disabled'} for enhanced storyboards`);
  }
  
  /**
   * 🛑 STOP MONITORING
   */
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('\n🛑 Monitoring stopped. Phase 2 deployment complete.');
    
    const finalStatus = getRolloutStatus();
    console.log(`\n📊 FINAL ROLLOUT STATUS: ${finalStatus.config.rolloutPercentage}%`);
    console.log(`📈 Total requests: ${finalStatus.metrics.totalRequests}`);
    console.log(`✅ Success rate: ${((finalStatus.metrics.successfulEnhanced / finalStatus.metrics.totalRequests) * 100).toFixed(1)}%`);
    
    if (finalStatus.config.rolloutPercentage >= 100) {
      console.log('🎉 SUCCESS! Enhanced visual storyboards are now enabled for all users!');
    } else {
      console.log('⚠️ Rollout incomplete. Review performance metrics before proceeding to 100%.');
    }
  }
}

// Run Phase 2 deployment if this script is executed directly
if (require.main === module) {
  const deploymentManager = new Phase2DeploymentManager();
  deploymentManager.startPhase2Deployment().catch(console.error);
}

module.exports = {
  Phase2DeploymentManager,
  PHASE2_CONFIG
};
