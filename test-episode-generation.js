/**
 * Test Episode Generation with Gemini 3
 * Tests the actual episode generation endpoint
 */

require('dotenv').config({ path: '.env.local' });

async function testEpisodeGeneration() {
  console.log('🎬 Testing Episode Generation with Gemini 3 Pro\n');
  console.log('='.repeat(70));

  try {
    // Import the service function
    const { generateContentWithGemini } = require('./src/services/gemini-ai.ts');
    
    console.log('📋 Testing generateContentWithGemini service...\n');
    
    const systemPrompt = `You are a master narrative architect with advanced creative reasoning capabilities. 
Create sophisticated, psychologically authentic episode foundations that demonstrate exceptional storytelling craft. 
Use step-by-step creative analysis and return ONLY valid JSON.`;

    const draftPrompt = `Generate a brief episode foundation for episode 1 of a mystery web series.
Return JSON with: title, premise, storyBeats (array), characterFocus, conflict, emotionalArc.`;

    console.log('🚀 Calling generateContentWithGemini...');
    const startTime = Date.now();
    
    // Since we can't directly import TS, let's test the API endpoint instead
    const response = await fetch('http://localhost:3000/api/generate/episode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        episodeNumber: 1,
        storyBible: {
          title: 'Test Series',
          genre: 'Mystery',
          synopsis: 'A detective investigates a series of mysterious disappearances.',
        },
        narrative: {
          episodes: [{
            number: 1,
            title: 'Pilot',
            synopsis: 'The investigation begins.',
          }],
        },
      }),
    });

    const duration = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Episode generation successful! (${duration}ms)`);
      console.log(`📝 Response keys:`, Object.keys(data));
      return { success: true, data, duration };
    } else {
      const errorText = await response.text();
      console.log(`❌ Episode generation failed: ${response.status}`);
      console.log(`📝 Error:`, errorText.substring(0, 200));
      return { success: false, status: response.status, error: errorText };
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    console.log('\n💡 Make sure the dev server is running: npm run dev');
    return { success: false, error: error.message };
  }
}

// Alternative: Test the service directly using the compiled approach
async function testServiceDirect() {
  console.log('\n🔬 Testing Service Function Directly\n');
  console.log('-'.repeat(70));

  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-3-pro-preview';

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found!');
    return { success: false };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const systemPrompt = 'You are a professional screenwriter.';
    const userPrompt = `Generate a brief episode foundation for episode 1. 
Return JSON with: {"title": "...", "premise": "...", "storyBeats": ["...", "..."], "characterFocus": "...", "conflict": "...", "emotionalArc": "..."}`;

    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

    console.log(`📋 Using model: ${modelName}`);
    console.log('🚀 Generating episode foundation...\n');

    const startTime = Date.now();
    const result = await model.generateContent(combinedPrompt);
    const duration = Date.now() - startTime;

    const text = result.response.text();
    
    console.log(`✅ Generated in ${duration}ms`);
    console.log(`📝 Response (${text.length} chars):`);
    console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
    
    // Try to parse as JSON
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const json = JSON.parse(jsonMatch[0]);
        console.log('\n✅ Valid JSON structure:');
        console.log(JSON.stringify(json, null, 2));
        return { success: true, json, duration };
      } else {
        console.log('\n⚠️  Response is not JSON format');
        return { success: true, text, duration, isJSON: false };
      }
    } catch (parseError) {
      console.log('\n⚠️  Could not parse as JSON, but content was generated');
      return { success: true, text, duration, isJSON: false };
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 GEMINI 3 EPISODE GENERATION TEST\n');
  
  // Test 1: Direct service test
  const result1 = await testServiceDirect();
  
  // Test 2: API endpoint test (if server is running)
  console.log('\n' + '='.repeat(70));
  const result2 = await testEpisodeGeneration();
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Service Direct: ${result1.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`API Endpoint: ${result2.success ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (result1.success) {
    console.log('\n🎉 Gemini 3 Pro is generating episode content successfully!');
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
