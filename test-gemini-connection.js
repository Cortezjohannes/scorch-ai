/**
 * Test Gemini API Connection
 * This script tests if the Gemini API is working correctly with the current configuration
 */

require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API Connection...\n');
  
  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    return;
  }
  
  console.log(`✅ API Key found (length: ${apiKey.length})`);
  console.log(`   First 4 chars: ${apiKey.substring(0, 4)}`);
  console.log(`   Last 4 chars: ${apiKey.substring(apiKey.length - 4)}\n`);
  
  // Check model configuration
  const modelName = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-3-pro-preview';
  console.log(`📋 Testing with model: ${modelName}\n`);
  
  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ GoogleGenerativeAI initialized\n');
    
    // Test 1: Simple generation without system prompt
    console.log('🧪 Test 1: Simple generation (no system prompt)...');
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      });
      
      const result = await model.generateContent('Say "Hello, Gemini API is working!"');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ Test 1 PASSED`);
      console.log(`   Response: ${text}\n`);
    } catch (error) {
      console.error(`❌ Test 1 FAILED`);
      console.error(`   Error: ${error.message}`);
      if (error.status) console.error(`   Status: ${error.status}`);
      if (error.statusText) console.error(`   Status Text: ${error.statusText}`);
      console.log('');
    }
    
    // Test 2: Generation with system prompt (as regular message)
    console.log('🧪 Test 2: Generation with system prompt (as message)...');
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      });
      
      const chat = model.startChat();
      await chat.sendMessage('SYSTEM INSTRUCTION: You are a helpful assistant.');
      const result = await chat.sendMessage('Say "System prompt test successful!"');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ Test 2 PASSED`);
      console.log(`   Response: ${text}\n`);
    } catch (error) {
      console.error(`❌ Test 2 FAILED`);
      console.error(`   Error: ${error.message}`);
      if (error.status) console.error(`   Status: ${error.status}`);
      if (error.statusText) console.error(`   Status Text: ${error.statusText}`);
      console.log('');
    }
    
    // Test 3: Test with EngineAIRouter style (concatenated prompt)
    console.log('🧪 Test 3: Generation with concatenated system prompt (EngineAIRouter style)...');
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      });
      
      const systemPrompt = 'You are a professional assistant.';
      const userPrompt = 'Say "Concatenated prompt test successful!"';
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ Test 3 PASSED`);
      console.log(`   Response: ${text}\n`);
    } catch (error) {
      console.error(`❌ Test 3 FAILED`);
      console.error(`   Error: ${error.message}`);
      if (error.status) console.error(`   Status: ${error.status}`);
      if (error.statusText) console.error(`   Status Text: ${error.statusText}`);
      console.log('');
    }
    
    // Test 4: Check available models
    console.log('🧪 Test 4: Checking model availability...');
    try {
      // Try to list models (if API supports it)
      console.log(`   Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Try a minimal request to see if model exists
      const result = await model.generateContent('Hi');
      const response = await result.response;
      
      console.log(`✅ Test 4 PASSED - Model ${modelName} is accessible\n`);
    } catch (error) {
      console.error(`❌ Test 4 FAILED - Model ${modelName} may not be available`);
      console.error(`   Error: ${error.message}`);
      if (error.status === 404) {
        console.error(`   ⚠️  Model not found. Try: gemini-2.0-flash-exp, gemini-1.5-pro, or gemini-1.5-flash`);
      }
      if (error.status === 403) {
        console.error(`   ⚠️  Access forbidden. Check API key permissions.`);
      }
      if (error.status === 429) {
        console.error(`   ⚠️  Rate limit exceeded. Wait and try again.`);
      }
      console.log('');
    }
    
    // Summary
    console.log('📊 Test Summary:');
    console.log('   Check the results above to see which tests passed or failed.');
    console.log('   If all tests fail, check:');
    console.log('   1. API key is valid and has proper permissions');
    console.log('   2. Model name is correct (gemini-3-pro-preview)');
    console.log('   3. API quota/rate limits');
    console.log('   4. Network connectivity\n');
    
  } catch (error) {
    console.error('❌ Failed to initialize Gemini API');
    console.error(`   Error: ${error.message}`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack}`);
    }
  }
}

// Run the test
testGeminiAPI().catch(console.error);



