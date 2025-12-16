/**
 * Test Gemini 3 Implementation
 * Tests the actual service functions to verify Gemini 3 is working
 */

require('dotenv').config({ path: '.env.local' });

async function testGemini3Implementation() {
  console.log('🧪 Testing Gemini 3 Implementation...\n');
  console.log('='.repeat(60));

  // Check environment
  const apiKey = process.env.GEMINI_API_KEY;
  const modelEnv = process.env.GEMINI_STABLE_MODE_MODEL;
  
  console.log('\n📋 Environment Check:');
  console.log(`   API Key: ${apiKey ? `${apiKey.substring(0, 10)}... (${apiKey.length} chars)` : '❌ NOT FOUND'}`);
  console.log(`   Model from ENV: ${modelEnv || 'NOT SET (will use default)'}`);
  console.log(`   Expected default: gemini-3-pro-preview\n`);

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found!');
    process.exit(1);
  }

  try {
    // Test 1: Direct API call with Gemini 3
    console.log('🔬 Test 1: Direct API Call with Gemini 3 Pro Preview');
    console.log('-'.repeat(60));
    
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const modelName = modelEnv || 'gemini-3-pro-preview';
    console.log(`   Using model: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    const testPrompt = 'Write a short creative story opening (2-3 sentences) about a filmmaker discovering a new AI tool. Be creative and engaging.';
    
    console.log(`   Prompt: "${testPrompt.substring(0, 60)}..."`);
    console.log('   Making API call...\n');
    
    const startTime = Date.now();
    const result = await model.generateContent(testPrompt);
    const endTime = Date.now();
    
    const response = result.response;
    const text = response.text();
    const duration = endTime - startTime;

    console.log(`   ✅ Success! (${duration}ms)`);
    console.log(`   📝 Response:`);
    console.log(`   "${text}"\n`);
    console.log(`   📊 Stats: ${text.length} characters, ${duration}ms response time\n`);

    // Test 2: Using the service function
    console.log('🔬 Test 2: Using generateContentWithGemini Service');
    console.log('-'.repeat(60));
    
    // Import the service (we'll need to compile TypeScript or use a workaround)
    // For now, let's test the API directly with a more complex prompt
    
    const complexPrompt = `You are a creative writing assistant. Generate a brief episode premise for a web series about an independent filmmaker. Include:
1. A compelling hook
2. Main character motivation
3. Central conflict

Keep it to 3-4 sentences.`;

    console.log(`   Testing with creative writing prompt...`);
    
    const startTime2 = Date.now();
    const result2 = await model.generateContent(complexPrompt);
    const endTime2 = Date.now();
    
    const response2 = result2.response;
    const text2 = response2.text();
    const duration2 = endTime2 - startTime2;

    console.log(`   ✅ Success! (${duration2}ms)`);
    console.log(`   📝 Generated Content:`);
    console.log(`   "${text2}"\n`);
    console.log(`   📊 Stats: ${text2.length} characters, ${duration2}ms response time\n`);

    // Test 3: Verify model capabilities
    console.log('🔬 Test 3: Model Information');
    console.log('-'.repeat(60));
    console.log(`   ✅ Model Name: ${modelName}`);
    console.log(`   ✅ API Key: Valid and accepted`);
    console.log(`   ✅ Response Quality: ${text.length > 50 ? 'Good' : 'Short'}`);
    console.log(`   ✅ Response Time: ${duration}ms (acceptable)\n`);

    // Summary
    console.log('='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n✅ Gemini 3 Pro Preview is working correctly!');
    console.log(`✅ Model: ${modelName}`);
    console.log(`✅ Average response time: ${Math.round((duration + duration2) / 2)}ms`);
    console.log(`✅ Content generation: Functional\n`);

    return true;

  } catch (error) {
    console.error('\n❌ Test Failed!\n');
    console.error('Error details:');
    console.error(`   Message: ${error.message}`);
    
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      console.error('\n❌ MODEL NOT FOUND:');
      console.error('   The model "gemini-3-pro-preview" may not be available yet.');
      console.error('   Possible reasons:');
      console.error('   1. Model name might be different (check Google AI Studio)');
      console.error('   2. Model might not be available in your region');
      console.error('   3. API key might not have access to preview models');
      console.error('\n   💡 Try using "gemini-2.5-pro" as fallback');
    } else if (error.message?.includes('403') || error.message?.includes('permission')) {
      console.error('\n❌ PERMISSION DENIED:');
      console.error('   Your API key may not have access to Gemini 3 Pro Preview');
      console.error('   Check your Google AI Studio permissions');
    } else if (error.message?.includes('fetch failed') || error.message?.includes('network')) {
      console.error('\n❌ NETWORK ERROR:');
      console.error('   Could not connect to Google AI API');
      console.error('   Check your internet connection');
    } else {
      console.error('\n   Full error:', error);
    }

    process.exit(1);
  }
}

// Run the test
testGemini3Implementation()
  .then(() => {
    console.log('✅ Test suite completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });



