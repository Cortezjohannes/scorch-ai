/**
 * 🧪 ENGINE INTEGRATION TEST SUITE
 * Comprehensive testing of engines calling real APIs and generating content
 * 
 * PURPOSE: Verify that engines actually work end-to-end
 * - Test individual engines with real API calls
 * - Test foundation system integration
 * - Verify content quality and format
 * - Test fallback mechanisms
 * - Performance and reliability testing
 */

import { foundationEngine, enhanceContent, initializeFoundation } from './foundation-engine-system'
import { 
  DialogueEngineV2, 
  StoryboardEngineV2, 
  CastingEngineV2,
  PerformanceCoachingEngineV2,
  VisualStorytellingEngineV2,
  WorkingEngineRegistry
} from './working-engine-implementations'
import { AIOrchestrator } from './ai-orchestrator'

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

interface TestConfig {
  enableAPITests: boolean
  testMode: 'beast' | 'stable'
  timeoutMs: number
  expectedMinLength: number
  maxRetries: number
}

const DEFAULT_TEST_CONFIG: TestConfig = {
  enableAPITests: true,
  testMode: 'beast',
  timeoutMs: 60000, // 60 seconds
  expectedMinLength: 100,
  maxRetries: 2
}

// ============================================================================
// ENGINE INTEGRATION TEST SUITE
// ============================================================================

export class EngineIntegrationTest {
  private config: TestConfig
  private results: TestResult[] = []
  
  constructor(config: Partial<TestConfig> = {}) {
    this.config = { ...DEFAULT_TEST_CONFIG, ...config }
  }
  
  /**
   * 🚀 RUN COMPLETE ENGINE TEST SUITE
   * Test all engines end-to-end with real API calls
   */
  async runCompleteTestSuite(): Promise<TestSuiteResult> {
    console.log(`\n🧪 ═══════════════════════════════════════════════════════════════════════════════════`);
    console.log(`🤖 Mode: ${this.config.testMode.toUpperCase()}`);
    console.log(`🔄 Max Retries: ${this.config.maxRetries}`);
    console.log(`🧪 ═══════════════════════════════════════════════════════════════════════════════════`);
    
    const testStartTime = Date.now()
    
    try {
      // TEST 1: Foundation System Initialization
      await this.testFoundationInitialization()
      
      // TEST 2: Individual Engine API Tests
      await this.testIndividualEngines()
      
      // TEST 3: Foundation System Integration
      await this.testFoundationIntegration()
      
      // TEST 4: Real Content Generation End-to-End
      await this.testRealContentGeneration()
      
      // TEST 5: Error Handling and Fallbacks
      await this.testErrorHandlingAndFallbacks()
      
      // TEST 6: Performance and Reliability
      await this.testPerformanceAndReliability()
      
      const totalTime = Date.now() - testStartTime
      const successCount = this.results.filter(r => r.success).length
      const failureCount = this.results.filter(r => !r.success).length
      
      console.log(`🧪 ═══════════════════════════════════════════════════════════════════════════════════\n`);
      
      return {
        success: failureCount === 0,
        totalTests: this.results.length,
        passed: successCount,
        failed: failureCount,
        totalTime,
        results: this.results
      }
      
    } catch (error) {
      console.error(`💥 TEST SUITE FAILED:`, error);
      return {
        success: false,
        totalTests: this.results.length,
        passed: 0,
        failed: this.results.length,
        totalTime: Date.now() - testStartTime,
        results: this.results,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }
  
  /**
   * 🏗️ Test Foundation System Initialization
   */
  async testFoundationInitialization(): Promise<void> {
    const test = await this.runTest('Foundation Initialization', async () => {
      await initializeFoundation()
      
      const systemStatus = await foundationEngine.getSystemStatus()
      
      if (!systemStatus.initialized) {
        throw new Error('Foundation system not properly initialized')
      }
      
      if (systemStatus.health.overall === 'critical') {
        throw new Error(`System health critical: ${systemStatus.health.overall}`)
      }
      
      return {
        initialized: systemStatus.initialized,
        health: systemStatus.health.overall,
        enginesAvailable: WorkingEngineRegistry.getAvailableEngines().length
      }
    })
    
    if (test.data) {
    }
  }
  
  /**
   * 🎭 Test Individual Engines with Real API Calls
   */
  async testIndividualEngines(): Promise<void> {
    // Test DialogueEngineV2
    const dialogueTest = await this.runTest('DialogueEngineV2 API Test', async () => {
      const result = await DialogueEngineV2.generateDialogueSequence(
        {
          characters: [
            { name: 'Alex', description: 'Protagonist, conflicted about their decision' },
            { name: 'Jordan', description: 'Best friend, voice of reason' }
          ],
          sceneObjective: 'Alex must decide whether to take a job offer in another city',
          conflictType: 'emotional',
          genre: 'drama',
          setting: 'Coffee shop, late afternoon',
          stakes: 'Alex\'s future and friendship'
        },
        {
          masterTechnique: 'sorkin',
          subtextLevel: 'moderate',
          conflictIntensity: 7,
          lengthTarget: 'medium',
          emotionalArc: 'uncertainty to clarity'
        },
        {
          mode: this.config.testMode,
          voiceDifferentiation: true,
          performanceNotes: true
        }
      )
      
      if (!result.dialogue || !result.metadata) {
        throw new Error('DialogueEngineV2 returned invalid result structure')
      }
      
      const dialogueContent = JSON.stringify(result.dialogue)
      if (dialogueContent.length < this.config.expectedMinLength) {
        throw new Error(`Generated dialogue too short: ${dialogueContent.length} characters`)
      }
      
      return {
        contentLength: dialogueContent.length,
        technique: result.metadata.technique,
        characterCount: result.metadata.characters,
        apiProvider: result.metadata.apiProvider
      }
    })
    
    if (dialogueTest.data) {
      console.log(`      Content Length: ${dialogueTest.data.contentLength} chars`);
      console.log(`      API Provider: ${dialogueTest.data.apiProvider}`);
    }
    
    // Test StoryboardEngineV2
    const storyboardTest = await this.runTest('StoryboardEngineV2 API Test', async () => {
      const result = await StoryboardEngineV2.generateStoryboardSequence(
        'INT. COFFEE SHOP - DAY\n\nAlex sits across from Jordan at a small table. The afternoon light streams through large windows. Alex holds a job offer letter, hands trembling slightly.',
        [
          { name: 'Alex', description: 'Protagonist, mid-20s, anxious' },
          { name: 'Jordan', description: 'Best friend, supportive' }
        ],
        { logline: 'A story about difficult life decisions and friendship' },
        {
          genre: 'drama',
          cinematographerStyle: 'naturalistic',
          complexity: 'lean-forward',
          budget: 'medium',
          targetDuration: 90,
          mode: this.config.testMode
        }
      )
      
      if (!result.storyboard || !result.metadata) {
        throw new Error('StoryboardEngineV2 returned invalid result structure')
      }
      
      const shotCount = result.storyboard.shots?.length || 0
      if (shotCount === 0) {
        throw new Error('No shots generated in storyboard')
      }
      
      return {
        shotCount,
        style: result.metadata.style,
        apiProvider: result.metadata.apiProvider
      }
    })
    
    console.log(`   🎨 StoryboardEngineV2: ${storyboardTest.success ? 'PASS' : 'FAIL'}`);
    if (storyboardTest.data) {
      console.log(`      Shot Count: ${storyboardTest.data.shotCount}`);
      console.log(`      API Provider: ${storyboardTest.data.apiProvider}`);
    }
    
    // Test CastingEngineV2
    const castingTest = await this.runTest('CastingEngineV2 API Test', async () => {
      const result = await CastingEngineV2.generateCastingRecommendation(
        {
          projectType: 'film',
          genre: 'drama',
          budget: 'medium',
          timeline: '6 weeks pre-production',
          castingObjectives: ['authentic performances', 'ensemble chemistry']
        },
        {
          characterProfiles: [
            { name: 'Alex', age: '25-30', role: 'lead', traits: ['conflicted', 'intelligent', 'vulnerable'] }
          ],
          performanceStyle: 'naturalistic',
          ensembleDynamics: ['friendship tension', 'emotional support'],
          representationGoals: ['diverse casting', 'authentic performances']
        },
        {
          methodologyPreference: 'stanislavski',
          diversityPriority: 'important',
          mode: this.config.testMode
        }
      )
      
      if (!result.casting || !result.metadata) {
        throw new Error('CastingEngineV2 returned invalid result structure')
      }
      
      return {
        characterCount: result.metadata.characterCount,
        methodology: result.metadata.methodology,
        apiProvider: result.metadata.apiProvider
      }
    })
    
    if (castingTest.data) {
      console.log(`      Characters: ${castingTest.data.characterCount}`);
      console.log(`      API Provider: ${castingTest.data.apiProvider}`);
    }
  }
  
  /**
   * 🎯 Test Foundation System Integration
   */
  async testFoundationIntegration(): Promise<void> {
    const integrationTest = await this.runTest('Foundation System Integration', async () => {
      const result = await enhanceContent({
        content: {
          scene: 'Coffee shop conversation about life decisions',
          characters: ['Alex', 'Jordan'],
          conflict: 'Alex must choose between career and friendship'
        },
        contentType: 'script',
        context: {
          projectId: 'test-project-001',
          genre: ['drama'],
          theme: 'friendship and difficult choices',
          targetAudience: 'adults',
          budgetLevel: 'medium'
        },
        options: {
          qualityLevel: 'professional',
          mode: this.config.testMode,
          useEngines: true,
          fallbackOnError: true
        }
      })
      
      if (!result.success) {
        throw new Error(`Foundation enhancement failed: ${result.metadata.fallbackReason}`)
      }
      
      if (!result.content) {
        throw new Error('No enhanced content returned')
      }
      
      return {
        enhanced: result.metadata.enhanced,
        enginesUsed: result.metadata.enginesUsed.length,
        qualityScore: result.metadata.qualityScore,
        processingTime: result.metadata.processingTime,
        narrativeConsistency: result.metadata.narrativeConsistency
      }
    })
    
    if (integrationTest.data) {
      console.log(`      Enhanced: ${integrationTest.data.enhanced ? 'YES' : 'NO'}`);
      console.log(`      Engines Used: ${integrationTest.data.enginesUsed}`);
      console.log(`      Quality Score: ${(integrationTest.data.qualityScore * 100).toFixed(1)}%`);
      console.log(`      Processing Time: ${integrationTest.data.processingTime}ms`);
    }
  }
  
  /**
   * 📝 Test Real Content Generation End-to-End
   */
  async testRealContentGeneration(): Promise<void> {
    const realContentTest = await this.runTest('Real Content Generation End-to-End', async () => {
      // Test multiple content types through the foundation system
      const testCases = [
        {
          type: 'script',
          content: 'A tense conversation between two friends about a betrayal',
          expectedEngines: ['dialogue-v2']
        },
        {
          type: 'storyboard', 
          content: 'Visual planning for an emotional confrontation scene',
          expectedEngines: ['storyboard-v2', 'visual-storytelling-v2']
        },
        {
          type: 'casting',
          content: 'Casting recommendations for dramatic lead roles',
          expectedEngines: ['casting-v2']
        }
      ]
      
      const results = []
      
      for (const testCase of testCases) {
        const result = await enhanceContent({
          content: { description: testCase.content },
          contentType: testCase.type,
          context: {
            genre: ['drama'],
            theme: 'betrayal and redemption',
            budgetLevel: 'medium'
          },
          options: {
            mode: this.config.testMode,
            useEngines: true,
            qualityLevel: 'professional'
          }
        })
        
        results.push({
          type: testCase.type,
          success: result.success && result.metadata.enhanced,
          enginesUsed: result.metadata.enginesUsed,
          qualityScore: result.metadata.qualityScore
        })
      }
      
      const successCount = results.filter(r => r.success).length
      
      return {
        totalTests: results.length,
        successCount,
        results
      }
    })
    
    console.log(`   📝 Real Content Generation: ${realContentTest.success ? 'PASS' : 'FAIL'}`);
    if (realContentTest.data) {
      console.log(`      Content Types Tested: ${realContentTest.data.totalTests}`);
      console.log(`      Successful: ${realContentTest.data.successCount}`);
    }
  }
  
  /**
   * 🛡️ Test Error Handling and Fallbacks
   */
  async testErrorHandlingAndFallbacks(): Promise<void> {
    const fallbackTest = await this.runTest('Error Handling and Fallbacks', async () => {
      // Test with invalid content that should trigger fallbacks
      const result = await enhanceContent({
        content: null, // Invalid content to test fallback
        contentType: 'script',
        context: {
          genre: ['drama']
        },
        options: {
          mode: this.config.testMode,
          fallbackOnError: true,
          useEngines: true
        }
      })
      
      // Should still return a result (fallback)
      if (!result.content) {
        throw new Error('Fallback did not provide content')
      }
      
      return {
        fallbackActivated: result.metadata.fallbackUsed,
        fallbackReason: result.metadata.fallbackReason,
        contentReturned: !!result.content
      }
    })
    
    if (fallbackTest.data) {
      console.log(`      Fallback Activated: ${fallbackTest.data.fallbackActivated ? 'YES' : 'NO'}`);
      console.log(`      Content Returned: ${fallbackTest.data.contentReturned ? 'YES' : 'NO'}`);
    }
  }
  
  /**
   * ⚡ Test Performance and Reliability
   */
  async testPerformanceAndReliability(): Promise<void> {
    const performanceTest = await this.runTest('Performance and Reliability', async () => {
      const testRuns = 3
      const results = []
      
      for (let i = 0; i < testRuns; i++) {
        const startTime = Date.now()
        
        const result = await enhanceContent({
          content: `Test content for performance run ${i + 1}`,
          contentType: 'script',
          context: {
            genre: ['comedy'],
            theme: 'performance testing'
          },
          options: {
            mode: this.config.testMode,
            qualityLevel: 'standard'
          }
        })
        
        const endTime = Date.now()
        
        results.push({
          run: i + 1,
          success: result.success,
          processingTime: endTime - startTime,
          enhanced: result.metadata.enhanced
        })
      }
      
      const avgTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length
      const successRate = results.filter(r => r.success).length / results.length
      
      return {
        testRuns,
        averageTime: avgTime,
        successRate,
        results
      }
    })
    
    if (performanceTest.data) {
      console.log(`      Average Time: ${performanceTest.data.averageTime.toFixed(0)}ms`);
      console.log(`      Success Rate: ${(performanceTest.data.successRate * 100).toFixed(1)}%`);
    }
  }
  
  /**
   * 🧪 Run individual test with timeout and retry logic
   */
  private async runTest(testName: string, testFunction: () => Promise<any>): Promise<TestResult> {
    console.log(`   🧪 Running: ${testName}...`);
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const startTime = Date.now()
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Test timeout')), this.config.timeoutMs)
        })
        
        const testPromise = testFunction()
        const data = await Promise.race([testPromise, timeoutPromise])
        
        const endTime = Date.now()
        
        const result: TestResult = {
          name: testName,
          success: true,
          duration: endTime - startTime,
          attempt,
          data
        }
        
        this.results.push(result)
        return result
        
      } catch (error) {
        const endTime = Date.now()
        
        if (attempt === this.config.maxRetries) {
          const result: TestResult = {
            name: testName,
            success: false,
            duration: endTime,
            attempt,
            error: error instanceof Error ? error.message : String(error)
          }
          
          this.results.push(result)
          return result
        } else {
        }
      }
    }
    
    throw new Error('This should never be reached')
  }
  
  /**
   * 🎯 Quick API Connectivity Test
   */
  async quickAPITest(): Promise<boolean> {
    
    try {
      const response = await AIOrchestrator.generateContent({
        prompt: 'Test prompt for API connectivity',
        systemPrompt: 'You are testing API connectivity. Respond with "API Working".',
        temperature: 0.1,
        maxTokens: 50,
        mode: this.config.testMode
      }, 'APIConnectivityTest')
      
      const success = response.content.length > 0
      console.log(`   🤖 Provider: ${response.provider}`);
      console.log(`   📝 Response: "${response.content.substring(0, 50)}..."`);
      
      return success
      
    } catch (error) {
      return false
    }
  }
}

// ============================================================================
// TEST RESULT INTERFACES
// ============================================================================

interface TestResult {
  name: string
  success: boolean
  duration: number
  attempt: number
  data?: any
  error?: string
}

interface TestSuiteResult {
  success: boolean
  totalTests: number
  passed: number
  failed: number
  totalTime: number
  results: TestResult[]
  error?: string
}

// ============================================================================
// CONVENIENCE EXPORT FUNCTIONS
// ============================================================================

/**
 * 🚀 Run complete engine integration test suite
 */
export async function runEngineTests(config?: Partial<TestConfig>): Promise<TestSuiteResult> {
  const tester = new EngineIntegrationTest(config)
  return await tester.runCompleteTestSuite()
}

/**
 * 🔧 Quick test to verify API connectivity
 */
export async function quickAPIConnectivityTest(mode: 'beast' | 'stable' = 'beast'): Promise<boolean> {
  const tester = new EngineIntegrationTest({ testMode: mode })
  return await tester.quickAPITest()
}

/**
 * 🎭 Test individual engine
 */
export async function testSingleEngine(engineId: string, mode: 'beast' | 'stable' = 'beast'): Promise<any> {
  console.log(`🧪 Testing individual engine: ${engineId}...`);
  
  switch (engineId) {
    case 'dialogue-v2':
      return await DialogueEngineV2.generateDialogueSequence(
        {
          characters: [{ name: 'Test Character', description: 'Test' }],
          sceneObjective: 'Test dialogue generation',
          conflictType: 'emotional',
          genre: 'drama',
          setting: 'Test setting',
          stakes: 'Test stakes'
        },
        {
          subtextLevel: 'minimal',
          conflictIntensity: 5,
          lengthTarget: 'short',
          emotionalArc: 'test arc'
        },
        { mode }
      )
      
    case 'storyboard-v2':
      return await StoryboardEngineV2.generateStoryboardSequence(
        'Test scene',
        [{ name: 'Test Character' }],
        { logline: 'Test story' },
        { mode }
      )
      
    default:
      throw new Error(`Engine ${engineId} not available for individual testing`)
  }
}

// Export the test class and functions
// Export already declared above


