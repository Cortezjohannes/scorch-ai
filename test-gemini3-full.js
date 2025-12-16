/**
 * Full Gemini 3 Pro Test Suite
 * Comprehensive testing of all Gemini 3 integration points
 */

require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

async function test1_DirectAPICall() {
  console.log('\n🔬 Test 1: Direct API Call with Gemini 3 Pro Preview');
  console.log('-'.repeat(70));
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-3-pro-preview';
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
      }
    });

    const prompt = 'Write a creative opening scene description for a web series episode. Be vivid and engaging. (2-3 sentences)';
    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const duration = Date.now() - startTime;
    
    const text = result.response.text();
    const finishReason = result.response.candidates?.[0]?.finishReason;
    
    if (text && text.length > 50) {
      logTest('Direct API Call', true, `Generated ${text.length} chars in ${duration}ms. Finish: ${finishReason}`);
      console.log(`   📝 Sample: "${text.substring(0, 100)}..."`);
      return { success: true, text, duration };
    } else {
      logTest('Direct API Call', false, `Response too short: ${text.length} chars`);
      return { success: false };
    }
  } catch (error) {
    logTest('Direct API Call', false, error.message);
    return { success: false, error: error.message };
  }
}

async function test2_ServiceFunction() {
  console.log('\n🔬 Test 2: Service Function (generateContentWithGemini)');
  console.log('-'.repeat(70));
  
  try {
    // Simulate the service function
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-3-pro-preview';
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const systemPrompt = 'You are a professional screenwriter specializing in web series.';
    const userPrompt = 'Generate a brief character description for a protagonist in a mystery series.';
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const startTime = Date.now();
    const result = await model.generateContent(combinedPrompt);
    const duration = Date.now() - startTime;
    
    const text = result.response.text();
    
    if (text && text.length > 30) {
      logTest('Service Function', true, `Generated ${text.length} chars in ${duration}ms`);
      console.log(`   📝 Response: "${text.substring(0, 150)}..."`);
      return { success: true, text, duration };
    } else {
      logTest('Service Function', false, `Response too short: ${text.length} chars`);
      return { success: false };
    }
  } catch (error) {
    logTest('Service Function', false, error.message);
    return { success: false, error: error.message };
  }
}

async function test3_CreativeContent() {
  console.log('\n🔬 Test 3: Creative Content Generation');
  console.log('-'.repeat(70));
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-3-pro-preview';
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 800,
        topP: 0.8,
        topK: 40,
      }
    });

    const prompt = `Create a brief episode premise for a web series. Include:
- Episode title
- Main conflict
- Character arc
- Emotional tone

Format as a short paragraph.`;
    
    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const duration = Date.now() - startTime;
    
    const text = result.response.text();
    
    if (text && text.length > 100) {
      logTest('Creative Content', true, `Generated ${text.length} chars in ${duration}ms`);
      console.log(`   📝 Generated premise:`);
      console.log(`   "${text}"`);
      return { success: true, text, duration };
    } else {
      logTest('Creative Content', false, `Response too short: ${text.length} chars`);
      return { success: false };
    }
  } catch (error) {
    logTest('Creative Content', false, error.message);
    return { success: false, error: error.message };
  }
}

async function test4_StructuredOutput() {
  console.log('\n🔬 Test 4: Structured JSON Output');
  console.log('-'.repeat(70));
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-3-pro-preview';
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        responseMimeType: 'application/json',
      }
    });

    const prompt = `Generate a JSON object with:
{
  "title": "episode title",
  "genre": "genre name",
  "mood": "emotional tone"
}`;
    
    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const duration = Date.now() - startTime;
    
    const text = result.response.text();
    
    try {
      const json = JSON.parse(text);
      if (json.title && json.genre && json.mood) {
        logTest('Structured JSON Output', true, `Valid JSON in ${duration}ms`);
        console.log(`   📝 JSON:`, JSON.stringify(json, null, 2));
        return { success: true, json, duration };
      } else {
        logTest('Structured JSON Output', false, 'JSON missing required fields');
        return { success: false };
      }
    } catch (parseError) {
      logTest('Structured JSON Output', false, `Invalid JSON: ${parseError.message}`);
      console.log(`   📝 Raw response: "${text}"`);
      return { success: false };
    }
  } catch (error) {
    logTest('Structured JSON Output', false, error.message);
    return { success: false, error: error.message };
  }
}

async function test5_ModelConfiguration() {
  console.log('\n🔬 Test 5: Model Configuration Verification');
  console.log('-'.repeat(70));
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const envModel = process.env.GEMINI_STABLE_MODE_MODEL;
    const defaultModel = 'gemini-3-pro-preview';
    const modelName = envModel || defaultModel;
    
    console.log(`   📋 Environment Model: ${envModel || 'NOT SET'}`);
    console.log(`   📋 Default Model: ${defaultModel}`);
    console.log(`   📋 Using Model: ${modelName}`);
    
    if (modelName === 'gemini-3-pro-preview') {
      logTest('Model Configuration', true, 'Using Gemini 3 Pro Preview');
    } else {
      logTest('Model Configuration', false, `Using ${modelName} instead of gemini-3-pro-preview`);
    }
    
    // Verify model is accessible
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const testResult = await model.generateContent('Say "test"');
    const testText = testResult.response.text();
    
    if (testText && testText.toLowerCase().includes('test')) {
      logTest('Model Accessibility', true, `Model ${modelName} is accessible`);
      return { success: true, modelName };
    } else {
      logTest('Model Accessibility', false, 'Model not responding correctly');
      return { success: false };
    }
  } catch (error) {
    logTest('Model Configuration', false, error.message);
    return { success: false, error: error.message };
  }
}

async function test6_Performance() {
  console.log('\n🔬 Test 6: Performance Benchmark');
  console.log('-'.repeat(70));
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-3-pro-preview';
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    });

    const times = [];
    const prompts = [
      'Write one sentence about filmmaking.',
      'Describe a character in one sentence.',
      'Create a scene setting in one sentence.',
    ];
    
    for (let i = 0; i < prompts.length; i++) {
      const startTime = Date.now();
      const result = await model.generateContent(prompts[i]);
      const duration = Date.now() - startTime;
      times.push(duration);
      
      const text = result.response.text();
      if (text && text.length > 0) {
        console.log(`   ✅ Request ${i + 1}: ${duration}ms (${text.length} chars)`);
      }
    }
    
    const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`   📊 Average: ${avgTime}ms | Min: ${minTime}ms | Max: ${maxTime}ms`);
    
    if (avgTime < 15000) {
      logTest('Performance', true, `Average response time: ${avgTime}ms`);
      return { success: true, avgTime, minTime, maxTime };
    } else {
      logTest('Performance', false, `Slow average response time: ${avgTime}ms`);
      return { success: false, avgTime };
    }
  } catch (error) {
    logTest('Performance', false, error.message);
    return { success: false, error: error.message };
  }
}

async function test7_ErrorHandling() {
  console.log('\n🔬 Test 7: Error Handling');
  console.log('-'.repeat(70));
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-3-pro-preview';
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Test with invalid model name (should handle gracefully)
    try {
      const invalidModel = genAI.getGenerativeModel({ model: 'gemini-invalid-model-xyz' });
      await invalidModel.generateContent('test');
      logTest('Error Handling', false, 'Should have failed with invalid model');
      return { success: false };
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        logTest('Error Handling', true, 'Properly handles invalid model name');
        return { success: true };
      } else {
        logTest('Error Handling', false, `Unexpected error: ${error.message}`);
        return { success: false };
      }
    }
  } catch (error) {
    logTest('Error Handling', false, error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 GEMINI 3 PRO FULL TEST SUITE');
  console.log('='.repeat(70));
  console.log(`\n📅 Started: ${new Date().toISOString()}\n`);

  const testResults = {
    test1: await test1_DirectAPICall(),
    test2: await test2_ServiceFunction(),
    test3: await test3_CreativeContent(),
    test4: await test4_StructuredOutput(),
    test5: await test5_ModelConfiguration(),
    test6: await test6_Performance(),
    test7: await test7_ErrorHandling(),
  };

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`\n✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  
  console.log('\n📋 Detailed Results:');
  results.tests.forEach((test, index) => {
    console.log(`   ${index + 1}. ${test.passed ? '✅' : '❌'} ${test.name}`);
    if (test.details) console.log(`      ${test.details}`);
  });

  console.log('\n' + '='.repeat(70));
  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Gemini 3 Pro Preview is fully functional!');
  } else if (results.passed > results.failed) {
    console.log('⚠️  MOST TESTS PASSED. Review failures above.');
  } else {
    console.log('❌ MULTIPLE TESTS FAILED. Review errors above.');
  }
  console.log('='.repeat(70));
  console.log(`\n📅 Completed: ${new Date().toISOString()}\n`);

  return results.failed === 0;
}

// Run all tests
runAllTests()
  .then((allPassed) => {
    process.exit(allPassed ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });



