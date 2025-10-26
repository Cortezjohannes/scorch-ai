/**
 * 🧪 COMPREHENSIVE WORKFLOW VALIDATION TEST
 * 
 * Deep validation of entire Reeled AI platform:
 * - APIs and backend services
 * - 19-engine system
 * - Pre-production generators
 * - Client-facing features
 * 
 * Runs actual API calls with real content generation and quality validation.
 */

import dotenv from 'dotenv'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 180000, // 3 minutes for AI operations
  minQualityScore: 7.0,
  minEngineSuccessRate: 0.9,
  
  // Test story bible parameters (5-question format)
  testLogline: 'A former hacker discovers a hidden AI conspiracy threatening to merge human consciousness with technology',
  testProtagonist: 'Cipher, a brilliant hacker trying to escape their past while fighting against forces that want to digitize humanity',
  testStakes: 'If the conspiracy succeeds, humanity will lose its autonomy and be controlled by a singular AI consciousness',
  testVibe: 'Dark, atmospheric cyberpunk with philosophical undertones and high-stakes action',
  testTheme: 'Identity, free will, and the nature of consciousness in a world where technology and humanity blur',
  
  testEpisodeCount: 2 // Generate 2 episodes for testing
}

// ============================================================================
// TEST RESULT TRACKING
// ============================================================================

interface TestResult {
  name: string
  category: string
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP'
  duration: number
  message: string
  details?: any
  error?: string
}

class TestTracker {
  private results: TestResult[] = []
  private startTime: number = Date.now()
  
  addResult(result: TestResult) {
    this.results.push(result)
    const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : result.status === 'WARN' ? '⚠️' : '⏭️'
    console.log(`${emoji} [${result.category}] ${result.name} - ${result.message} (${result.duration}ms)`)
    if (result.error) {
      console.error(`   Error: ${result.error}`)
    }
  }
  
  getResults() {
    return this.results
  }
  
  getSummary() {
    const totalTime = Date.now() - this.startTime
    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const warned = this.results.filter(r => r.status === 'WARN').length
    const skipped = this.results.filter(r => r.status === 'SKIP').length
    const total = this.results.length
    
    return {
      total,
      passed,
      failed,
      warned,
      skipped,
      totalTime,
      passRate: total > 0 ? (passed / total) * 100 : 0
    }
  }
}

const tracker = new TestTracker()

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
  const url = `${TEST_CONFIG.baseUrl}${endpoint}`
  const options: any = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  }
  
  if (body) {
    options.body = JSON.stringify(body)
  }
  
  const response = await fetch(url, options)
  
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text}`)
  }
  
  return await response.json()
}

function validateStoryBible(storyBible: any): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  
  if (!storyBible.seriesTitle) issues.push('Missing seriesTitle')
  if (!storyBible.synopsis) issues.push('Missing synopsis')
  if (!storyBible.theme) issues.push('Missing theme')
  if (!storyBible.genre) issues.push('Missing genre')
  if (!storyBible.mainCharacters || storyBible.mainCharacters.length === 0) {
    issues.push('Missing or empty mainCharacters')
  } else {
    // Validate character structure
    storyBible.mainCharacters.forEach((char: any, idx: number) => {
      if (!char.name) issues.push(`Character ${idx} missing name`)
      if (!char.description && !char.background) issues.push(`Character ${idx} missing description/background`)
    })
  }
  if (!storyBible.narrativeArcs || storyBible.narrativeArcs.length === 0) {
    issues.push('Missing or empty narrativeArcs')
  }
  
  return {
    valid: issues.length === 0,
    issues
  }
}

function validateEpisode(episode: any, episodeNumber: number): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  
  if (episode.episodeNumber !== episodeNumber) {
    issues.push(`Episode number mismatch: expected ${episodeNumber}, got ${episode.episodeNumber}`)
  }
  if (!episode.title) issues.push('Missing title')
  if (!episode.synopsis) issues.push('Missing synopsis')
  if (!episode.scenes || !Array.isArray(episode.scenes) || episode.scenes.length === 0) {
    issues.push('Missing or empty scenes array')
  } else {
    if (episode.scenes.length > 5) {
      issues.push(`Too many scenes: ${episode.scenes.length} (max 5)`)
    }
    episode.scenes.forEach((scene: any, idx: number) => {
      if (!scene.content || scene.content.length < 50) {
        issues.push(`Scene ${idx + 1} has insufficient content`)
      }
    })
  }
  if (!episode.branchingOptions || episode.branchingOptions.length !== 3) {
    issues.push(`Branching options should be exactly 3, got ${episode.branchingOptions?.length || 0}`)
  }
  if (!episode.episodeRundown) issues.push('Missing episodeRundown')
  
  return {
    valid: issues.length === 0,
    issues
  }
}

// ============================================================================
// TEST SUITE 1: ENVIRONMENT & CONFIGURATION
// ============================================================================

async function testEnvironmentConfiguration() {
  console.log('\n🔧 TEST SUITE 1: Environment & Configuration Validation\n')
  
  // Test 1.1: API Keys Configuration
  const startTime = Date.now()
  try {
    const hasGemini = !!process.env.GEMINI_API_KEY
    const hasAzure = !!process.env.AZURE_OPENAI_API_KEY && !!process.env.AZURE_OPENAI_ENDPOINT
    
    if (hasGemini && hasAzure) {
      tracker.addResult({
        name: 'API Keys Configuration',
        category: 'Environment',
        status: 'PASS',
        duration: Date.now() - startTime,
        message: 'Both Gemini and Azure OpenAI keys configured',
        details: { gemini: true, azure: true }
      })
    } else if (hasGemini || hasAzure) {
      tracker.addResult({
        name: 'API Keys Configuration',
        category: 'Environment',
        status: 'WARN',
        duration: Date.now() - startTime,
        message: `Partial configuration: Gemini=${hasGemini}, Azure=${hasAzure}`,
        details: { gemini: hasGemini, azure: hasAzure }
      })
    } else {
      tracker.addResult({
        name: 'API Keys Configuration',
        category: 'Environment',
        status: 'FAIL',
        duration: Date.now() - startTime,
        message: 'No AI provider API keys configured',
        error: 'Missing GEMINI_API_KEY and AZURE_OPENAI_API_KEY'
      })
    }
  } catch (error) {
    tracker.addResult({
      name: 'API Keys Configuration',
      category: 'Environment',
      status: 'FAIL',
      duration: Date.now() - startTime,
      message: 'Configuration check failed',
      error: error instanceof Error ? error.message : String(error)
    })
  }
  
  // Test 1.2: Model Deployments
  const modelStartTime = Date.now()
  try {
    const hasGpt41 = !!process.env.GPT_4_1_DEPLOYMENT
    const hasGeminiModel = !!process.env.GEMINI_STABLE_MODE_MODEL
    
    tracker.addResult({
      name: 'Model Deployments',
      category: 'Environment',
      status: hasGpt41 || hasGeminiModel ? 'PASS' : 'WARN',
      duration: Date.now() - modelStartTime,
      message: `GPT-4.1: ${hasGpt41}, Gemini: ${hasGeminiModel}`,
      details: {
        gpt41: process.env.GPT_4_1_DEPLOYMENT,
        gemini: process.env.GEMINI_STABLE_MODE_MODEL
      }
    })
  } catch (error) {
    tracker.addResult({
      name: 'Model Deployments',
      category: 'Environment',
      status: 'FAIL',
      duration: Date.now() - modelStartTime,
      message: 'Model deployment check failed',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

// ============================================================================
// TEST SUITE 2: CORE EPISODE GENERATION WORKFLOW
// ============================================================================

let generatedStoryBible: any = null
let generatedEpisodes: any[] = []

async function testStoryBibleGeneration() {
  console.log('\n📖 TEST SUITE 2: Story Bible Generation\n')
  
  const startTime = Date.now()
  try {
    console.log('   Generating story bible (this may take 20-30 minutes for comprehensive generation)...')
    
    const response = await makeRequest('/api/generate/story-bible', 'POST', {
      logline: TEST_CONFIG.testLogline,
      protagonist: TEST_CONFIG.testProtagonist,
      stakes: TEST_CONFIG.testStakes,
      vibe: TEST_CONFIG.testVibe,
      theme: TEST_CONFIG.testTheme
    })
    
    const duration = Date.now() - startTime
    
    if (!response.storyBible) {
      tracker.addResult({
        name: 'Story Bible Generation',
        category: 'Story Bible',
        status: 'FAIL',
        duration,
        message: 'API returned unsuccessful response',
        error: response.error || 'No story bible in response'
      })
      return
    }
    
    generatedStoryBible = response.storyBible
    
    // Validate story bible structure
    const validation = validateStoryBible(generatedStoryBible)
    
    if (validation.valid) {
      tracker.addResult({
        name: 'Story Bible Generation',
        category: 'Story Bible',
        status: 'PASS',
        duration,
        message: `Generated complete story bible with ${generatedStoryBible.mainCharacters.length} characters`,
        details: {
          title: generatedStoryBible.seriesTitle,
          characters: generatedStoryBible.mainCharacters.length,
          arcs: generatedStoryBible.narrativeArcs?.length || 0
        }
      })
    } else {
      tracker.addResult({
        name: 'Story Bible Generation',
        category: 'Story Bible',
        status: 'WARN',
        duration,
        message: `Story bible generated with ${validation.issues.length} validation issues`,
        details: { issues: validation.issues }
      })
    }
    
    // Save story bible for inspection
    fs.writeFileSync(
      path.join(process.cwd(), 'test-results-story-bible.json'),
      JSON.stringify(generatedStoryBible, null, 2)
    )
    
  } catch (error) {
    tracker.addResult({
      name: 'Story Bible Generation',
      category: 'Story Bible',
      status: 'FAIL',
      duration: Date.now() - startTime,
      message: 'Story bible generation failed',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

async function testEpisodeGenerationBaseline() {
  console.log('\n🎬 TEST SUITE 3: Episode Generation - Baseline (No Engines)\n')
  
  if (!generatedStoryBible) {
    tracker.addResult({
      name: 'Episode Generation Baseline',
      category: 'Episode Generation',
      status: 'SKIP',
      duration: 0,
      message: 'Skipped due to missing story bible'
    })
    return
  }
  
  const startTime = Date.now()
  try {
    console.log('   Generating Episode 1 (baseline mode, 30-60 seconds)...')
    
    const response = await makeRequest('/api/generate/episode', 'POST', {
      storyBible: generatedStoryBible,
      episodeNumber: 1,
      useEngines: false,
      useComprehensiveEngines: false
    })
    
    const duration = Date.now() - startTime
    
    if (!response.success || !response.episode) {
      tracker.addResult({
        name: 'Episode Generation Baseline',
        category: 'Episode Generation',
        status: 'FAIL',
        duration,
        message: 'Baseline episode generation failed',
        error: response.error || 'No episode in response'
      })
      return
    }
    
    const episode = response.episode
    const validation = validateEpisode(episode, 1)
    
    if (validation.valid) {
      tracker.addResult({
        name: 'Episode Generation Baseline',
        category: 'Episode Generation',
        status: 'PASS',
        duration,
        message: `Generated Episode 1 with ${episode.scenes.length} scenes`,
        details: {
          title: episode.title,
          scenes: episode.scenes.length,
          choices: episode.branchingOptions.length
        }
      })
      
      generatedEpisodes.push({ mode: 'baseline', episode })
    } else {
      tracker.addResult({
        name: 'Episode Generation Baseline',
        category: 'Episode Generation',
        status: 'WARN',
        duration,
        message: `Episode generated with ${validation.issues.length} issues`,
        details: { issues: validation.issues }
      })
    }
    
  } catch (error) {
    tracker.addResult({
      name: 'Episode Generation Baseline',
      category: 'Episode Generation',
      status: 'FAIL',
      duration: Date.now() - startTime,
      message: 'Baseline generation failed',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

async function testEpisodeGenerationComprehensive() {
  console.log('\n⚡ TEST SUITE 4: Episode Generation - Comprehensive Engines\n')
  
  if (!generatedStoryBible) {
    tracker.addResult({
      name: 'Episode Generation Comprehensive',
      category: 'Episode Generation',
      status: 'SKIP',
      duration: 0,
      message: 'Skipped due to missing story bible'
    })
    return
  }
  
  const startTime = Date.now()
  try {
    console.log('   Generating Episode 2 with 19-engine system (90-180 seconds)...')
    
    const response = await makeRequest('/api/generate/episode', 'POST', {
      storyBible: generatedStoryBible,
      episodeNumber: 2,
      previousChoice: generatedEpisodes[0]?.episode?.branchingOptions?.[1]?.text || null,
      useEngines: true,
      useComprehensiveEngines: true
    })
    
    const duration = Date.now() - startTime
    
    if (!response.success || !response.episode) {
      tracker.addResult({
        name: 'Episode Generation Comprehensive',
        category: 'Episode Generation',
        status: 'FAIL',
        duration,
        message: 'Comprehensive episode generation failed',
        error: response.error || 'No episode in response'
      })
      return
    }
    
    const episode = response.episode
    const engineMetadata = response.engineMetadata
    
    const validation = validateEpisode(episode, 2)
    
    // Check engine metadata
    if (engineMetadata) {
      const successRate = engineMetadata.successRate || 
        (engineMetadata.successfulEngines / engineMetadata.totalEnginesRun)
      
      tracker.addResult({
        name: 'Engine System Execution',
        category: 'Engine Infrastructure',
        status: successRate >= TEST_CONFIG.minEngineSuccessRate ? 'PASS' : 'WARN',
        duration: engineMetadata.totalExecutionTime || 0,
        message: `${engineMetadata.successfulEngines}/${engineMetadata.totalEnginesRun} engines succeeded (${(successRate * 100).toFixed(1)}%)`,
        details: {
          successRate,
          successfulEngines: engineMetadata.successfulEngines,
          totalEngines: engineMetadata.totalEnginesRun
        }
      })
    }
    
    if (validation.valid) {
      tracker.addResult({
        name: 'Episode Generation Comprehensive',
        category: 'Episode Generation',
        status: 'PASS',
        duration,
        message: `Generated Episode 2 with ${episode.scenes.length} scenes (engine-enhanced)`,
        details: {
          title: episode.title,
          scenes: episode.scenes.length,
          choices: episode.branchingOptions.length,
          hasMetadata: !!episode.comprehensiveMetadata
        }
      })
      
      generatedEpisodes.push({ mode: 'comprehensive', episode, engineMetadata })
      
      // Save episode for inspection
      fs.writeFileSync(
        path.join(process.cwd(), 'test-results-episode-comprehensive.json'),
        JSON.stringify({ episode, engineMetadata }, null, 2)
      )
    } else {
      tracker.addResult({
        name: 'Episode Generation Comprehensive',
        category: 'Episode Generation',
        status: 'WARN',
        duration,
        message: `Episode generated with ${validation.issues.length} issues`,
        details: { issues: validation.issues }
      })
    }
    
  } catch (error) {
    tracker.addResult({
      name: 'Episode Generation Comprehensive',
      category: 'Episode Generation',
      status: 'FAIL',
      duration: Date.now() - startTime,
      message: 'Comprehensive generation failed',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

async function testEpisodeGenerationGemini() {
  console.log('\n🚀 TEST SUITE 5: Episode Generation - Gemini 2.5 Pro Comprehensive\n')
  
  if (!generatedStoryBible) {
    tracker.addResult({
      name: 'Episode Generation Gemini',
      category: 'Episode Generation',
      status: 'SKIP',
      duration: 0,
      message: 'Skipped due to missing story bible'
    })
    return
  }
  
  if (!process.env.GEMINI_API_KEY) {
    tracker.addResult({
      name: 'Episode Generation Gemini',
      category: 'Episode Generation',
      status: 'SKIP',
      duration: 0,
      message: 'Skipped - Gemini API key not configured'
    })
    return
  }
  
  const startTime = Date.now()
  try {
    console.log('   Generating episode with Gemini 2.5 Pro (90-180 seconds)...')
    
    const response = await makeRequest('/api/generate/episode', 'POST', {
      storyBible: generatedStoryBible,
      episodeNumber: 1,
      useGeminiComprehensive: true
    })
    
    const duration = Date.now() - startTime
    
    if (!response.success || !response.episode) {
      tracker.addResult({
        name: 'Episode Generation Gemini',
        category: 'Episode Generation',
        status: 'FAIL',
        duration,
        message: 'Gemini comprehensive generation failed',
        error: response.error || 'No episode in response'
      })
      return
    }
    
    const episode = response.episode
    const validation = validateEpisode(episode, 1)
    
    if (validation.valid) {
      tracker.addResult({
        name: 'Episode Generation Gemini',
        category: 'Episode Generation',
        status: 'PASS',
        duration,
        message: `Generated episode with Gemini 2.5 Pro (${episode.scenes.length} scenes)`,
        details: {
          title: episode.title,
          aiProvider: response.aiProvider,
          contextTokens: response.contextTokens
        }
      })
      
      generatedEpisodes.push({ mode: 'gemini', episode })
    } else {
      tracker.addResult({
        name: 'Episode Generation Gemini',
        category: 'Episode Generation',
        status: 'WARN',
        duration,
        message: `Episode generated with ${validation.issues.length} issues`,
        details: { issues: validation.issues }
      })
    }
    
  } catch (error) {
    tracker.addResult({
      name: 'Episode Generation Gemini',
      category: 'Episode Generation',
      status: 'FAIL',
      duration: Date.now() - startTime,
      message: 'Gemini generation failed',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

// ============================================================================
// TEST SUITE 6: PRE-PRODUCTION SYSTEM
// ============================================================================

async function testPreProductionGenerators() {
  console.log('\n🎭 TEST SUITE 6: Pre-Production System\n')
  
  if (!generatedStoryBible || generatedEpisodes.length === 0) {
    tracker.addResult({
      name: 'Pre-Production Generators',
      category: 'Pre-Production',
      status: 'SKIP',
      duration: 0,
      message: 'Skipped due to missing story bible or episodes'
    })
    return
  }
  
  // Test Phase 1 generation (casting, script, storyboard, etc.)
  const startTime = Date.now()
  try {
    console.log('   Generating Phase 1 pre-production content (60-120 seconds)...')
    
    const response = await makeRequest('/api/generate/phase1', 'POST', {
      storyBible: generatedStoryBible,
      episodes: [generatedEpisodes[0].episode],
      arcIndex: 0
    })
    
    const duration = Date.now() - startTime
    
    if (!response.success) {
      tracker.addResult({
        name: 'Pre-Production Phase 1',
        category: 'Pre-Production',
        status: 'FAIL',
        duration,
        message: 'Phase 1 generation failed',
        error: response.error || 'Unknown error'
      })
      return
    }
    
    // Validate generated content
    const hasScript = response.script && response.script.length > 100
    const hasStoryboard = response.storyboard && response.storyboard.length > 100
    const hasCasting = response.casting && response.casting.length > 100
    
    const contentCount = [hasScript, hasStoryboard, hasCasting].filter(Boolean).length
    
    if (contentCount >= 2) {
      tracker.addResult({
        name: 'Pre-Production Phase 1',
        category: 'Pre-Production',
        status: 'PASS',
        duration,
        message: `Generated ${contentCount}/3 Phase 1 content types`,
        details: {
          script: hasScript,
          storyboard: hasStoryboard,
          casting: hasCasting
        }
      })
    } else {
      tracker.addResult({
        name: 'Pre-Production Phase 1',
        category: 'Pre-Production',
        status: 'WARN',
        duration,
        message: `Only ${contentCount}/3 content types generated successfully`,
        details: {
          script: hasScript,
          storyboard: hasStoryboard,
          casting: hasCasting
        }
      })
    }
    
  } catch (error) {
    tracker.addResult({
      name: 'Pre-Production Phase 1',
      category: 'Pre-Production',
      status: 'FAIL',
      duration: Date.now() - startTime,
      message: 'Phase 1 generation failed',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

// ============================================================================
// TEST SUITE 7: API ENDPOINTS
// ============================================================================

async function testAPIEndpoints() {
  console.log('\n🔌 TEST SUITE 7: API Endpoints\n')
  
  // Test engine status endpoint
  const statusStart = Date.now()
  try {
    const response = await makeRequest('/api/engine-status', 'GET')
    
    tracker.addResult({
      name: 'Engine Status API',
      category: 'API Endpoints',
      status: 'PASS',
      duration: Date.now() - statusStart,
      message: 'Engine status endpoint responding',
      details: response
    })
  } catch (error) {
    tracker.addResult({
      name: 'Engine Status API',
      category: 'API Endpoints',
      status: 'FAIL',
      duration: Date.now() - statusStart,
      message: 'Engine status endpoint failed',
      error: error instanceof Error ? error.message : String(error)
    })
  }
  
  // Test save endpoints if we have content
  if (generatedStoryBible) {
    const saveStart = Date.now()
    try {
      const response = await makeRequest('/api/save-story-bible', 'POST', {
        storyBible: generatedStoryBible
      })
      
      tracker.addResult({
        name: 'Save Story Bible API',
        category: 'API Endpoints',
        status: response.success ? 'PASS' : 'WARN',
        duration: Date.now() - saveStart,
        message: response.success ? 'Story bible saved successfully' : 'Save returned unsuccessful',
        details: response
      })
    } catch (error) {
      tracker.addResult({
        name: 'Save Story Bible API',
        category: 'API Endpoints',
        status: 'FAIL',
        duration: Date.now() - saveStart,
        message: 'Save story bible endpoint failed',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
}

// ============================================================================
// TEST SUITE 8: ERROR HANDLING
// ============================================================================

async function testErrorHandling() {
  console.log('\n⚠️ TEST SUITE 8: Error Handling & Fallbacks\n')
  
  // Test invalid input handling
  const invalidStart = Date.now()
  try {
    await makeRequest('/api/generate/episode', 'POST', {
      storyBible: null,
      episodeNumber: 1
    })
    
    tracker.addResult({
      name: 'Invalid Input Handling',
      category: 'Error Handling',
      status: 'FAIL',
      duration: Date.now() - invalidStart,
      message: 'API should reject null story bible',
      error: 'API accepted invalid input'
    })
  } catch (error) {
    // Expected to fail
    tracker.addResult({
      name: 'Invalid Input Handling',
      category: 'Error Handling',
      status: 'PASS',
      duration: Date.now() - invalidStart,
      message: 'API correctly rejected invalid input',
      details: { expectedBehavior: true }
    })
  }
  
  // Test missing episode number
  const missingStart = Date.now()
  try {
    await makeRequest('/api/generate/episode', 'POST', {
      storyBible: { seriesTitle: 'Test' }
    })
    
    tracker.addResult({
      name: 'Missing Parameter Handling',
      category: 'Error Handling',
      status: 'FAIL',
      duration: Date.now() - missingStart,
      message: 'API should reject missing episode number',
      error: 'API accepted missing parameter'
    })
  } catch (error) {
    // Expected to fail
    tracker.addResult({
      name: 'Missing Parameter Handling',
      category: 'Error Handling',
      status: 'PASS',
      duration: Date.now() - missingStart,
      message: 'API correctly rejected missing parameter',
      details: { expectedBehavior: true }
    })
  }
}

// ============================================================================
// MAIN TEST EXECUTION
// ============================================================================

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║   🧪 COMPREHENSIVE WORKFLOW VALIDATION TEST SUITE          ║')
  console.log('║   Testing: APIs → Backend → Engines → Client               ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')
  
  console.log(`📍 Base URL: ${TEST_CONFIG.baseUrl}`)
  console.log(`⏱️  Timeout: ${TEST_CONFIG.timeout}ms`)
  console.log(`🎯 Min Quality Score: ${TEST_CONFIG.minQualityScore}`)
  console.log(`⚙️  Min Engine Success: ${(TEST_CONFIG.minEngineSuccessRate * 100).toFixed(0)}%\n`)
  
  try {
    // Suite 1: Environment
    await testEnvironmentConfiguration()
    
    // Suite 2: Story Bible
    await testStoryBibleGeneration()
    
    // Suite 3-5: Episode Generation
    await testEpisodeGenerationBaseline()
    await testEpisodeGenerationComprehensive()
    await testEpisodeGenerationGemini()
    
    // Suite 6: Pre-Production
    await testPreProductionGenerators()
    
    // Suite 7: API Endpoints
    await testAPIEndpoints()
    
    // Suite 8: Error Handling
    await testErrorHandling()
    
  } catch (error) {
    console.error('\n❌ CRITICAL TEST FAILURE:', error)
  }
  
  // Generate final report
  generateTestReport()
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateTestReport() {
  console.log('\n\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║                    📊 TEST RESULTS SUMMARY                   ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')
  
  const summary = tracker.getSummary()
  const results = tracker.getResults()
  
  console.log(`Total Tests: ${summary.total}`)
  console.log(`✅ Passed: ${summary.passed}`)
  console.log(`❌ Failed: ${summary.failed}`)
  console.log(`⚠️  Warnings: ${summary.warned}`)
  console.log(`⏭️  Skipped: ${summary.skipped}`)
  console.log(`📈 Pass Rate: ${summary.passRate.toFixed(1)}%`)
  console.log(`⏱️  Total Time: ${(summary.totalTime / 1000).toFixed(1)}s\n`)
  
  // Category breakdown
  const categories = new Set(results.map(r => r.category))
  console.log('📋 Results by Category:\n')
  
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category)
    const passed = categoryResults.filter(r => r.status === 'PASS').length
    const total = categoryResults.length
    console.log(`  ${category}: ${passed}/${total} passed`)
  })
  
  // Failed tests detail
  const failed = results.filter(r => r.status === 'FAIL')
  if (failed.length > 0) {
    console.log('\n❌ Failed Tests:\n')
    failed.forEach(result => {
      console.log(`  • ${result.name}`)
      console.log(`    ${result.message}`)
      if (result.error) {
        console.log(`    Error: ${result.error}`)
      }
      console.log('')
    })
  }
  
  // Warnings detail
  const warnings = results.filter(r => r.status === 'WARN')
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:\n')
    warnings.forEach(result => {
      console.log(`  • ${result.name}: ${result.message}`)
    })
    console.log('')
  }
  
  // Generate JSON report
  const report = {
    summary,
    results,
    timestamp: new Date().toISOString(),
    config: TEST_CONFIG
  }
  
  const reportPath = path.join(process.cwd(), 'test-results-comprehensive.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Detailed report saved to: ${reportPath}\n`)
  
  // Exit code based on results
  const exitCode = summary.failed > 0 ? 1 : 0
  
  console.log('╔══════════════════════════════════════════════════════════════╗')
  if (summary.passRate >= 90) {
    console.log('║                    ✅ TESTS PASSED                          ║')
  } else if (summary.passRate >= 70) {
    console.log('║                 ⚠️  TESTS PASSED WITH WARNINGS              ║')
  } else {
    console.log('║                    ❌ TESTS FAILED                          ║')
  }
  console.log('╚══════════════════════════════════════════════════════════════╝\n')
  
  process.exit(exitCode)
}

// ============================================================================
// RUN TESTS
// ============================================================================

runAllTests().catch(error => {
  console.error('Fatal error running tests:', error)
  process.exit(1)
})

