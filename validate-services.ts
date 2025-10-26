/**
 * 🔧 SERVICE VALIDATION SCRIPT
 * 
 * Validates backend services, AI models, and configuration
 * without requiring the Next.js server to be running.
 */

import dotenv from 'dotenv'
import { generateContent } from './src/services/azure-openai.js'
import { generateContentWithGemini } from './src/services/gemini-ai.js'
import { runComprehensiveEngines } from './src/services/comprehensive-engines.js'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

// ============================================================================
// VALIDATION RESULTS TRACKING
// ============================================================================

interface ValidationResult {
  service: string
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP'
  message: string
  duration: number
  details?: any
  error?: string
}

const results: ValidationResult[] = []

function logResult(result: ValidationResult) {
  const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : result.status === 'WARN' ? '⚠️' : '⏭️'
  console.log(`${emoji} ${result.service}: ${result.message} (${result.duration}ms)`)
  if (result.error) {
    console.error(`   └─ Error: ${result.error}`)
  }
  results.push(result)
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

async function validateEnvironment() {
  console.log('\n🔧 VALIDATING ENVIRONMENT CONFIGURATION\n')
  
  const startTime = Date.now()
  
  // Check Gemini API Key
  const hasGemini = !!process.env.GEMINI_API_KEY
  logResult({
    service: 'Gemini API Key',
    status: hasGemini ? 'PASS' : 'WARN',
    message: hasGemini ? 'Configured' : 'Not configured',
    duration: Date.now() - startTime,
    details: { configured: hasGemini }
  })
  
  // Check Azure OpenAI
  const hasAzure = !!process.env.AZURE_OPENAI_API_KEY && !!process.env.AZURE_OPENAI_ENDPOINT
  logResult({
    service: 'Azure OpenAI Config',
    status: hasAzure ? 'PASS' : 'WARN',
    message: hasAzure ? 'Configured' : 'Not configured',
    duration: Date.now() - startTime,
    details: {
      apiKey: !!process.env.AZURE_OPENAI_API_KEY,
      endpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT
    }
  })
  
  // Check model deployments
  const modelStart = Date.now()
  const models = {
    'GPT-4.1': process.env.GPT_4_1_DEPLOYMENT,
    'Gemini Model': process.env.GEMINI_STABLE_MODE_MODEL,
    'Primary Model': process.env.PRIMARY_MODEL
  }
  
  logResult({
    service: 'Model Configuration',
    status: 'PASS',
    message: `${Object.values(models).filter(Boolean).length}/3 models configured`,
    duration: Date.now() - modelStart,
    details: models
  })
}

async function validateAzureOpenAI() {
  console.log('\n🤖 VALIDATING AZURE OPENAI SERVICE\n')
  
  if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
    logResult({
      service: 'Azure OpenAI Connection',
      status: 'SKIP',
      message: 'Azure OpenAI not configured',
      duration: 0
    })
    return
  }
  
  const startTime = Date.now()
  try {
    const result = await generateContent('Say "Hello from Azure OpenAI!" in JSON format with a "message" field.', {
      model: 'gpt-4.1',
      systemPrompt: 'You are a helpful assistant. Always respond in valid JSON format.',
      temperature: 0.7,
      maxTokens: 100
    })
    
    const duration = Date.now() - startTime
    
    if (result && result.length > 0) {
      logResult({
        service: 'Azure OpenAI Connection',
        status: 'PASS',
        message: 'Successfully generated content',
        duration,
        details: { responseLength: result.length }
      })
    } else {
      logResult({
        service: 'Azure OpenAI Connection',
        status: 'WARN',
        message: 'Connected but received empty response',
        duration
      })
    }
  } catch (error) {
    logResult({
      service: 'Azure OpenAI Connection',
      status: 'FAIL',
      message: 'Failed to connect or generate content',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

async function validateGeminiAI() {
  console.log('\n🚀 VALIDATING GEMINI AI SERVICE\n')
  
  if (!process.env.GEMINI_API_KEY) {
    logResult({
      service: 'Gemini AI Connection',
      status: 'SKIP',
      message: 'Gemini API key not configured',
      duration: 0
    })
    return
  }
  
  const startTime = Date.now()
  try {
    const result = await generateContentWithGemini(
      'You are a helpful assistant.',
      'Say "Hello from Gemini!" in a friendly way.',
      'gemini-2.5-pro'
    )
    
    const duration = Date.now() - startTime
    
    if (result && result.length > 0) {
      logResult({
        service: 'Gemini AI Connection',
        status: 'PASS',
        message: 'Successfully generated content',
        duration,
        details: { responseLength: result.length, model: 'gemini-2.5-pro' }
      })
    } else {
      logResult({
        service: 'Gemini AI Connection',
        status: 'WARN',
        message: 'Connected but received empty response',
        duration
      })
    }
  } catch (error) {
    logResult({
      service: 'Gemini AI Connection',
      status: 'FAIL',
      message: 'Failed to connect or generate content',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

async function validateEngineSystem() {
  console.log('\n⚙️ VALIDATING ENGINE INFRASTRUCTURE\n')
  
  // Create minimal test data
  const testDraft = {
    title: 'Test Episode',
    premise: 'A test episode for validation',
    storyBeats: ['Opening', 'Conflict', 'Resolution'],
    characterFocus: 'Test Character',
    conflict: 'Test conflict',
    emotionalArc: 'Test arc',
    seriesProgression: 'Test progression'
  }
  
  const testStoryBible = {
    seriesTitle: 'Validation Test Series',
    synopsis: 'A test series for validation purposes',
    theme: 'Testing and Quality Assurance',
    genre: 'Drama',
    tone: 'Professional',
    mainCharacters: [
      {
        name: 'Alex',
        archetype: 'Protagonist',
        description: 'A software tester who discovers bugs in reality itself',
        arc: 'From skeptic to believer',
        relationships: 'Works with the QA team',
        motivation: 'Find and fix all bugs',
        voice: 'Technical but friendly'
      }
    ],
    narrativeArcs: [
      {
        title: 'Arc 1: The Discovery',
        summary: 'Alex discovers the first reality bug',
        episodes: [
          { number: 1, title: 'Episode 1', summary: 'The beginning' }
        ]
      }
    ],
    worldBuilding: {
      setting: 'Modern tech company with hidden layers',
      rules: 'Reality can be debugged',
      timePeriod: 'Present day',
      culturalContext: 'Tech industry culture'
    }
  }
  
  const startTime = Date.now()
  try {
    console.log('   Running comprehensive engines (this may take 60-120 seconds)...')
    
    const engineResult = await runComprehensiveEngines(testDraft, testStoryBible, 'beast')
    
    const duration = Date.now() - startTime
    const successRate = engineResult.metadata.successfulEngines / engineResult.metadata.totalEnginesRun
    
    logResult({
      service: 'Engine System Execution',
      status: successRate >= 0.8 ? 'PASS' : successRate >= 0.6 ? 'WARN' : 'FAIL',
      message: `${engineResult.metadata.successfulEngines}/${engineResult.metadata.totalEnginesRun} engines succeeded (${(successRate * 100).toFixed(1)}%)`,
      duration,
      details: {
        successfulEngines: engineResult.metadata.successfulEngines,
        failedEngines: engineResult.metadata.failedEngines,
        totalEngines: engineResult.metadata.totalEnginesRun,
        successRate: (successRate * 100).toFixed(1) + '%',
        totalExecutionTime: engineResult.metadata.totalExecutionTime
      }
    })
    
    // Save engine results for inspection
    fs.writeFileSync(
      path.join(process.cwd(), 'validation-engine-results.json'),
      JSON.stringify(engineResult, null, 2)
    )
    
  } catch (error) {
    logResult({
      service: 'Engine System Execution',
      status: 'FAIL',
      message: 'Engine system failed to execute',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}

async function validateServiceFiles() {
  console.log('\n📁 VALIDATING SERVICE FILES\n')
  
  const criticalFiles = [
    'src/services/azure-openai.ts',
    'src/services/gemini-ai.ts',
    'src/services/comprehensive-engines.ts',
    'src/services/engines-comprehensive.ts',
    'src/services/ai-orchestrator.ts',
    'src/services/model-config.ts',
    'src/app/api/generate/episode/route.ts',
    'src/app/api/generate/story-bible/route.ts'
  ]
  
  let existingFiles = 0
  const startTime = Date.now()
  
  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      existingFiles++
    }
  }
  
  logResult({
    service: 'Critical Service Files',
    status: existingFiles === criticalFiles.length ? 'PASS' : existingFiles >= criticalFiles.length * 0.8 ? 'WARN' : 'FAIL',
    message: `${existingFiles}/${criticalFiles.length} critical files exist`,
    duration: Date.now() - startTime,
    details: { existing: existingFiles, total: criticalFiles.length }
  })
}

// ============================================================================
// MAIN VALIDATION
// ============================================================================

async function runValidation() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║        🔧 SERVICE VALIDATION - REELED AI PLATFORM           ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  
  try {
    await validateEnvironment()
    await validateServiceFiles()
    await validateAzureOpenAI()
    await validateGeminiAI()
    await validateEngineSystem()
  } catch (error) {
    console.error('\n❌ CRITICAL VALIDATION ERROR:', error)
  }
  
  // Generate summary
  console.log('\n\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║                    📊 VALIDATION SUMMARY                     ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')
  
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warned = results.filter(r => r.status === 'WARN').length
  const skipped = results.filter(r => r.status === 'SKIP').length
  const total = results.length
  
  console.log(`Total Checks: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️  Warnings: ${warned}`)
  console.log(`⏭️  Skipped: ${skipped}`)
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`)
  
  // Failed checks
  const failedChecks = results.filter(r => r.status === 'FAIL')
  if (failedChecks.length > 0) {
    console.log('❌ Failed Checks:\n')
    failedChecks.forEach(result => {
      console.log(`  • ${result.service}: ${result.message}`)
      if (result.error) {
        console.log(`    └─ ${result.error}`)
      }
    })
    console.log('')
  }
  
  // Warnings
  const warnings = results.filter(r => r.status === 'WARN')
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:\n')
    warnings.forEach(result => {
      console.log(`  • ${result.service}: ${result.message}`)
    })
    console.log('')
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    summary: { total, passed, failed, warned, skipped },
    results
  }
  
  const reportPath = path.join(process.cwd(), 'validation-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`📄 Detailed report saved to: ${reportPath}\n`)
  
  // Final status
  console.log('╔══════════════════════════════════════════════════════════════╗')
  if (failed === 0 && warned === 0) {
    console.log('║                ✅ ALL SERVICES VALIDATED                    ║')
  } else if (failed === 0) {
    console.log('║            ⚠️  SERVICES VALIDATED WITH WARNINGS             ║')
  } else {
    console.log('║                ❌ VALIDATION FAILED                         ║')
  }
  console.log('╚══════════════════════════════════════════════════════════════╝\n')
  
  process.exit(failed > 0 ? 1 : 0)
}

// Run validation
runValidation().catch(error => {
  console.error('Fatal validation error:', error)
  process.exit(1)
})

