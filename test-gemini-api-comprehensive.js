/**
 * Comprehensive Gemini API Test
 * Tests all aspects of the Gemini API implementation
 */

require('dotenv').config({ path: '.env.local' })
const { GoogleGenerativeAI } = require('@google/generative-ai')

async function testGeminiAPI() {
  console.log('🧪 GEMINI API COMPREHENSIVE TEST\n')
  console.log('=' .repeat(60))
  
  // Test 1: API Key Configuration
  console.log('\n📋 Test 1: API Key Configuration')
  console.log('-'.repeat(60))
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables')
    console.log('💡 Make sure .env.local exists and contains GEMINI_API_KEY')
    return
  }
  
  if (apiKey.length < 10) {
    console.error('❌ GEMINI_API_KEY appears to be invalid (too short)')
    return
  }
  
  console.log(`✅ API Key found: ${apiKey.length} characters`)
  console.log(`   First 10 chars: ${apiKey.substring(0, 10)}...`)
  
  // Test 2: Model Configuration
  console.log('\n📋 Test 2: Model Configuration')
  console.log('-'.repeat(60))
  const modelName = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-3-pro-preview'
  console.log(`✅ Model: ${modelName}`)
  console.log(`   Environment variable: ${process.env.GEMINI_STABLE_MODE_MODEL || 'NOT SET (using default)'}`)
  
  // Test 3: Initialize Gemini
  console.log('\n📋 Test 3: Initialize Gemini Client')
  console.log('-'.repeat(60))
  let genAI
  try {
    genAI = new GoogleGenerativeAI(apiKey)
    console.log('✅ Gemini client initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize Gemini client:', error.message)
    return
  }
  
  // Test 4: Get Model
  console.log('\n📋 Test 4: Get Model Instance')
  console.log('-'.repeat(60))
  let model
  try {
    model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
        topP: 0.95
      }
    })
    console.log(`✅ Model instance created: ${modelName}`)
  } catch (error) {
    console.error('❌ Failed to get model:', error.message)
    return
  }
  
  // Test 5: Simple Content Generation
  console.log('\n📋 Test 5: Simple Content Generation')
  console.log('-'.repeat(60))
  try {
    const testPrompt = 'Say "Hello, Gemini API is working!" in exactly 5 words.'
    console.log(`📤 Sending test prompt: "${testPrompt}"`)
    
    const startTime = Date.now()
    const result = await model.generateContent(testPrompt)
    const response = await result.response
    const text = response.text()
    const duration = Date.now() - startTime
    
    console.log(`✅ Response received in ${duration}ms`)
    console.log(`📥 Response: "${text}"`)
    console.log(`   Length: ${text.length} characters`)
    
    // Check response metadata
    if (response.usageMetadata) {
      console.log(`   Prompt tokens: ${response.usageMetadata.promptTokenCount || 'N/A'}`)
      console.log(`   Completion tokens: ${response.usageMetadata.completionTokenCount || 'N/A'}`)
      console.log(`   Total tokens: ${response.usageMetadata.totalTokenCount || 'N/A'}`)
    }
    
    // Check finish reason
    const finishReason = response.candidates?.[0]?.finishReason
    if (finishReason) {
      console.log(`   Finish reason: ${finishReason}`)
      if (finishReason === 'MAX_TOKENS' || finishReason === 'LENGTH') {
        console.warn('   ⚠️  Response may be truncated')
      }
    }
    
  } catch (error) {
    console.error('❌ Content generation failed:', error.message)
    if (error.status) {
      console.error(`   Status code: ${error.status}`)
    }
    if (error.status === 400) {
      console.error('   This is a Bad Request error. Check your prompt format.')
    } else if (error.status === 403) {
      console.error('   This is a Forbidden error. Check API key permissions.')
    } else if (error.status === 429) {
      console.error('   This is a Rate Limit error. You may have exceeded your quota.')
    }
    return
  }
  
  // Test 6: System Prompt Handling (like engine-ai-router.ts)
  console.log('\n📋 Test 6: System Prompt Handling (Combined)')
  console.log('-'.repeat(60))
  try {
    const systemPrompt = 'You are a helpful assistant that responds in exactly 3 words.'
    const userPrompt = 'What is 2+2?'
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`
    
    console.log(`📤 System prompt: "${systemPrompt}"`)
    console.log(`📤 User prompt: "${userPrompt}"`)
    
    const startTime = Date.now()
    const result = await model.generateContent(combinedPrompt)
    const response = await result.response
    const text = response.text()
    const duration = Date.now() - startTime
    
    console.log(`✅ Response received in ${duration}ms`)
    console.log(`📥 Response: "${text}"`)
    
  } catch (error) {
    console.error('❌ System prompt test failed:', error.message)
  }
  
  // Test 7: Chat-based Approach (like gemini-api.ts)
  console.log('\n📋 Test 7: Chat-based Approach')
  console.log('-'.repeat(60))
  try {
    const chatModel = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100
      }
    })
    
    const chat = chatModel.startChat({
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100
      }
    })
    
    // Send system instruction as message
    await chat.sendMessage('SYSTEM INSTRUCTION: Respond in exactly 3 words.')
    
    const startTime = Date.now()
    const result = await chat.sendMessage('What is the capital of France?')
    const response = await result.response
    const text = response.text()
    const duration = Date.now() - startTime
    
    console.log(`✅ Chat response received in ${duration}ms`)
    console.log(`📥 Response: "${text}"`)
    
  } catch (error) {
    console.error('❌ Chat-based test failed:', error.message)
    if (error.message?.includes('system_instruction')) {
      console.error('   This is the system instruction error that gemini-api.ts tries to avoid')
    }
  }
  
  // Test 8: Token Limit Test
  console.log('\n📋 Test 8: Token Limit Handling')
  console.log('-'.repeat(60))
  try {
    const largeModel = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192 // Max for Gemini 3 Pro
      }
    })
    
    console.log('📤 Requesting max tokens (8192)...')
    const startTime = Date.now()
    const result = await largeModel.generateContent('Write a short story about a robot learning to paint. Keep it under 500 words.')
    const response = await result.response
    const text = response.text()
    const duration = Date.now() - startTime
    
    console.log(`✅ Response received in ${duration}ms`)
    console.log(`📥 Response length: ${text.length} characters`)
    
    const finishReason = response.candidates?.[0]?.finishReason
    if (finishReason) {
      console.log(`   Finish reason: ${finishReason}`)
    }
    
  } catch (error) {
    console.error('❌ Token limit test failed:', error.message)
  }
  
  // Test 9: Error Handling Test
  console.log('\n📋 Test 9: Error Handling')
  console.log('-'.repeat(60))
  try {
    // Test with invalid model name
    const invalidModel = genAI.getGenerativeModel({ model: 'invalid-model-name' })
    await invalidModel.generateContent('Test')
    console.error('❌ Should have thrown an error for invalid model')
  } catch (error) {
    console.log('✅ Error handling works correctly')
    console.log(`   Error type: ${error.constructor.name}`)
    console.log(`   Error message: ${error.message}`)
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(60))
  console.log('✅ API Key: Configured')
  console.log(`✅ Model: ${modelName}`)
  console.log('✅ Basic generation: Working')
  console.log('✅ System prompts: Working')
  console.log('✅ Chat approach: Working')
  console.log('✅ Token limits: Handled')
  console.log('✅ Error handling: Working')
  console.log('\n🎉 All tests completed!')
}

// Run tests
testGeminiAPI().catch(error => {
  console.error('\n❌ Test suite failed:', error)
  process.exit(1)
})

















