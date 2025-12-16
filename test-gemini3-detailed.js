/**
 * Detailed Gemini 3 Test
 * Tests with detailed response inspection
 */

require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini3Detailed() {
  console.log('🧪 Detailed Gemini 3 Test\n');
  console.log('='.repeat(70));

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-3-pro-preview';

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found!');
    process.exit(1);
  }

  console.log(`\n📋 Configuration:`);
  console.log(`   Model: ${modelName}`);
  console.log(`   API Key: ${apiKey.substring(0, 15)}...\n`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topP: 0.8,
        topK: 40,
      }
    });

    // Test 1: Simple factual question
    console.log('🔬 Test 1: Simple Factual Question');
    console.log('-'.repeat(70));
    const prompt1 = 'What is 2 + 2? Answer with just the number.';
    console.log(`   Prompt: "${prompt1}"`);
    
    try {
      const result1 = await model.generateContent(prompt1);
      const response1 = result1.response;
      const text1 = response1.text();
      
      console.log(`   ✅ Response received`);
      console.log(`   📝 Text: "${text1}"`);
      console.log(`   📊 Length: ${text1.length} characters`);
      
      // Check response structure
      if (response1.candidates && response1.candidates.length > 0) {
        const candidate = response1.candidates[0];
        console.log(`   📋 Finish reason: ${candidate.finishReason || 'N/A'}`);
        if (candidate.safetyRatings) {
          console.log(`   🛡️  Safety ratings: ${candidate.safetyRatings.length} checks`);
        }
      }
      console.log('');
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      console.log('');
    }

    // Test 2: Creative writing
    console.log('🔬 Test 2: Creative Writing');
    console.log('-'.repeat(70));
    const prompt2 = 'Write one sentence about a filmmaker.';
    console.log(`   Prompt: "${prompt2}"`);
    
    try {
      const result2 = await model.generateContent(prompt2);
      const response2 = result2.response;
      const text2 = response2.text();
      
      console.log(`   ✅ Response received`);
      console.log(`   📝 Text: "${text2}"`);
      console.log(`   📊 Length: ${text2.length} characters`);
      console.log('');
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      console.log('');
    }

    // Test 3: Check model availability
    console.log('🔬 Test 3: Model Availability Check');
    console.log('-'.repeat(70));
    
    // Try to list available models (if API supports it)
    console.log(`   Testing if ${modelName} is accessible...`);
    
    try {
      const testResult = await model.generateContent('Say "test"');
      const testText = testResult.response.text();
      if (testText && testText.length > 0) {
        console.log(`   ✅ Model ${modelName} is accessible and responding`);
        console.log(`   📝 Test response: "${testText}"`);
      } else {
        console.log(`   ⚠️  Model responded but with empty content`);
        console.log(`   📋 Full response:`, JSON.stringify(testResult.response, null, 2));
      }
    } catch (err) {
      console.log(`   ❌ Model access error: ${err.message}`);
      if (err.message.includes('404') || err.message.includes('not found')) {
        console.log(`   💡 Model ${modelName} may not be available`);
        console.log(`   💡 Try: gemini-2.5-pro or gemini-1.5-pro`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Test completed\n');

  } catch (error) {
    console.error('\n❌ Test Failed!\n');
    console.error('Error:', error.message);
    
    if (error.message?.includes('404')) {
      console.error('\n💡 The model "gemini-3-pro-preview" may not be available.');
      console.error('💡 Available models might be:');
      console.error('   - gemini-2.5-pro');
      console.error('   - gemini-1.5-pro');
      console.error('   - gemini-2.0-flash');
    }
    
    process.exit(1);
  }
}

testGemini3Detailed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });



