/**
 * Enhanced Engine Logger - Comprehensive Real-Time Engine Tracking
 * 
 * Provides detailed logging and status tracking for all 60+ Murphy Pillar engines
 * with timestamps, performance metrics, and visual progress indicators.
 */

export interface EngineLogEntry {
  engineName: string;
  phase: string;
  status: 'initializing' | 'processing' | 'completed' | 'failed';
  timestamp: string;
  duration?: number;
  details?: string;
  outputSize?: number;
  mode: 'beast' | 'stable';
  provider?: 'azure' | 'gemini';
}

export class EngineLogger {
  private static entries: EngineLogEntry[] = [];
  private static sessionId: string = Math.random().toString(36).substring(2, 8);
  private static sessionStartTime: number = Date.now();
  private static engineStartTimes: Map<string, number> = new Map();

  /**
   * Initialize a new engine logging session
   */
  static initializeSession(mode: 'beast' | 'stable', totalEngines: number) {
    this.sessionId = Math.random().toString(36).substring(2, 8);
    this.sessionStartTime = Date.now();
    this.entries = [];
    this.engineStartTimes.clear();

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString().substring(11, 23);
      
    }
  }

  /**
   * Log phase start with comprehensive details
   */
  static logPhaseStart(phase: string, engineCount: number, description: string) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString().substring(11, 23);
      const sessionDuration = ((Date.now() - this.sessionStartTime) / 1000).toFixed(1);
      
      console.log(`📝 [${timestamp}] DESCRIPTION: ${description}`);
    }
  }

  /**
   * Log engine initialization with detailed setup info
   */
  static logEngineStart(
    engineName: string, 
    phase: string, 
    description: string, 
    mode: 'beast' | 'stable',
    inputSize?: number
  ) {
    const timestamp = new Date().toISOString().substring(11, 23);
    const startTime = Date.now();
    this.engineStartTimes.set(engineName, startTime);

    // Create log entry
    const entry: EngineLogEntry = {
      engineName,
      phase,
      status: 'initializing',
      timestamp,
      mode,
      details: description
    };
    this.entries.push(entry);

    // Enhanced console logging - only in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📋 [${timestamp}] └─ TASK: ${description}`);
      if (inputSize) {
      }
      console.log(`🔄 [${timestamp}] └─ STATUS: Starting advanced ${engineName.toLowerCase()} algorithms...`);
    }
  }

  /**
   * Log engine processing status with real-time updates
   */
  static logEngineProcessing(
    engineName: string, 
    provider: 'azure' | 'gemini', 
    model: string,
    processingDetails?: string
  ) {
    const timestamp = new Date().toISOString().substring(11, 23);
    const startTime = this.engineStartTimes.get(engineName);
    const processingTime = startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : '0.0';

    // Update log entry
    const entry = this.entries.find(e => e.engineName === engineName && e.status === 'initializing');
    if (entry) {
      entry.status = 'processing';
      entry.provider = provider;
    }

    console.log(`🔄 [${timestamp}] ${engineName}: ${provider.toUpperCase()} processing via ${model}...`);
    console.log(`⏳ [${timestamp}] └─ PROCESSING TIME: ${processingTime}s`);
    if (processingDetails) {
      console.log(`📡 [${timestamp}] └─ DETAILS: ${processingDetails}`);
    }
  }

  /**
   * Log engine completion with comprehensive results
   */
  static logEngineComplete(
    engineName: string, 
    result: string, 
    outputSize?: number,
    provider?: 'azure' | 'gemini'
  ) {
    const timestamp = new Date().toISOString().substring(11, 23);
    const startTime = this.engineStartTimes.get(engineName);
    const duration = startTime ? (Date.now() - startTime) / 1000 : 0;

    // Update log entry
    const entry = this.entries.find(e => e.engineName === engineName && e.status === 'processing');
    if (entry) {
      entry.status = 'completed';
      entry.duration = duration;
      entry.outputSize = outputSize;
    }

    const completedCount = this.entries.filter(e => e.status === 'completed').length;
    const totalEngines = this.entries.length;

    if (outputSize) {
      console.log(`📈 [${timestamp}] └─ OUTPUT: ${outputSize} characters generated`);
    }
    if (provider) {
      console.log(`🏆 [${timestamp}] └─ PROVIDER: ${provider.toUpperCase()}`);
    }
    // Calculate progress percentage safely
    const progressPercent = totalEngines > 0 ? (completedCount/totalEngines*100).toFixed(1) : '100.0';
    console.log(`🔥 [${timestamp}] ══════════════════════════════════════════════════════════════════════════════`);

    // Clear start time
    this.engineStartTimes.delete(engineName);
  }

  /**
   * Log engine failure with detailed error information
   */
  static logEngineError(engineName: string, error: string, errorDetails?: string) {
    const timestamp = new Date().toISOString().substring(11, 23);
    const startTime = this.engineStartTimes.get(engineName);
    const duration = startTime ? (Date.now() - startTime) / 1000 : 0;

    // Update log entry
    const entry = this.entries.find(e => e.engineName === engineName);
    if (entry) {
      entry.status = 'failed';
      entry.duration = duration;
      entry.details = error;
    }

    console.log(`🚨 [${timestamp}] └─ ERROR: ${error}`);
    if (errorDetails) {
      console.log(`📋 [${timestamp}] └─ DETAILS: ${errorDetails}`);
    }

    // Clear start time
    this.engineStartTimes.delete(engineName);
  }

  /**
   * Log phase completion with comprehensive statistics
   */
  static logPhaseComplete(phase: string, successCount: number, totalCount: number) {
    const timestamp = new Date().toISOString().substring(11, 23);
    const phaseEntries = this.entries.filter(e => e.phase === phase);
    const avgDuration = phaseEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / phaseEntries.length;
    const successRate = (successCount / totalCount * 100).toFixed(1);

    console.log(`📈 [${timestamp}] └─ SUCCESS RATE: ${successRate}% (${successCount}/${totalCount} engines)`);
  }

  /**
   * Log session completion with comprehensive analytics
   */
  static logSessionComplete() {
    const timestamp = new Date().toISOString().substring(11, 23);
    const sessionDuration = (Date.now() - this.sessionStartTime) / 1000;
    const completedEngines = this.entries.filter(e => e.status === 'completed').length;
    const failedEngines = this.entries.filter(e => e.status === 'failed').length;
    const totalEngines = this.entries.length;
    const avgDuration = this.entries.reduce((sum, e) => sum + (e.duration || 0), 0) / this.entries.length;
    const successRate = (completedEngines / totalEngines * 100).toFixed(1);

    console.log(`\n🎊 [${timestamp}] ═══════════════════════════════════════════════════════════════════════════════`);
    console.log(`🏆 [${timestamp}] SESSION ${this.sessionId.toUpperCase()} COMPLETE!`);
    console.log(`📈 [${timestamp}] └─ SUCCESS RATE: ${successRate}% (${completedEngines}/${totalEngines} engines)`);
    if (failedEngines > 0) {
    }
    console.log(`💎 [${timestamp}] └─ QUALITY SCORE: ${successRate === '100.0' ? '99.5/100 - PERFECT EXECUTION' : `${Math.min(parseFloat(successRate) + 5, 95)}/100`}`);
  }

  /**
   * Get current session statistics
   */
  static getSessionStats() {
    const completedEngines = this.entries.filter(e => e.status === 'completed').length;
    const activeEngines = this.entries.filter(e => e.status === 'processing').length;
    const failedEngines = this.entries.filter(e => e.status === 'failed').length;
    const totalEngines = this.entries.length;
    const sessionDuration = (Date.now() - this.sessionStartTime) / 1000;

    return {
      sessionId: this.sessionId,
      sessionDuration,
      completedEngines,
      activeEngines,
      failedEngines,
      totalEngines,
      successRate: totalEngines > 0 ? (completedEngines / totalEngines * 100) : 0,
      entries: [...this.entries]
    };
  }

  /**
   * Get current session status for real-time tracking
   */
  static getCurrentSession() {
    const currentPhase = this.entries.length > 0 ? this.entries[this.entries.length - 1].phase : 'Initializing';
    const activeEngines = this.entries.filter(e => e.status === 'processing');
    const completedEngines = this.entries.filter(e => e.status === 'completed');
    const currentEngine = activeEngines.length > 0 ? activeEngines[activeEngines.length - 1] : null;
    
    return {
      sessionId: this.sessionId,
      currentPhase,
      currentEngine: currentEngine?.engineName || null,
      currentEngineDetails: currentEngine?.details || null,
      activeEngines: activeEngines.map(e => ({
        name: e.engineName,
        phase: e.phase,
        startTime: e.timestamp
      })),
      completedEngines: completedEngines.map(e => e.engineName),
      isActive: activeEngines.length > 0
    };
  }

  /**
   * Generate real-time progress display
   */
  static displayProgressBar() {
    const stats = this.getSessionStats();
    const progressPercent = stats.totalEngines > 0 ? (stats.completedEngines / stats.totalEngines * 100) : 0;
    const barLength = 50;
    const filledLength = Math.round((progressPercent / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    const timestamp = new Date().toISOString().substring(11, 23);
  }
}

export default EngineLogger;