/**
 * Quick Gemini API Key Test
 * Tests if the new Gemini API key is working correctly
 */

require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API Key...\n');

  // Check if API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    console.error('   Make sure .env.local file exists and contains GEMINI_API_KEY');
    process.exit(1);
  }

  // Validate API key format
  console.log(`✅ API Key found: ${apiKey.substring(0, 10)}... (${apiKey.length} characters)`);

  if (apiKey.length < 10) {
    console.error('❌ API Key appears to be too short');
    process.exit(1);
  }

  // Check which API key we're using
  const expectedKey = 'AIzaSyDJEnINiuvI0SULRTqb5O1xgDYUZu_NwQo';
  if (apiKey === expectedKey) {
    console.log('✅ Using NEW API key (AIzaSyDJEn...)\n');
  } else {
    console.log('⚠️  Using DIFFERENT API key than expected');
    console.log(`   Expected: ${expectedKey.substring(0, 10)}...`);
    console.log(`   Got: ${apiKey.substring(0, 10)}...\n`);
  }

  try {
    // Initialize Gemini
    console.log('📡 Initializing Gemini API client...');
    const genAI = new GoogleGenerativeAI(apiKey);

    // Get the model name
    const modelName = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-3-pro-preview';
    console.log(`🤖 Using model: ${modelName}\n`);

    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 200,
      }
    });

    // Make a simple test API call
    console.log('🚀 Making test API call to Gemini...');
    const testPrompt = 'Respond with exactly this sentence: "Hello! The Gemini API is working correctly."';
    
    const startTime = Date.now();
    const result = await model.generateContent(testPrompt);
    const endTime = Date.now();

    const response = result.response;
    const text = response.text();
    const duration = endTime - startTime;

    console.log(`✅ API call successful! (${duration}ms)\n`);
    console.log('📝 Response from Gemini:');
    console.log(`   "${text}"`);
    
    // Check if response is empty
    if (!text || text.trim().length === 0) {
      console.log('   ⚠️  Warning: Response text is empty');
      console.log('   📊 Response object:', JSON.stringify(response, null, 2));
    } else {
      console.log(`   ✅ Response length: ${text.length} characters\n`);
    }

    // Additional validation
    console.log('📊 Validation:');
    console.log(`   ✅ API Key accepted by Google`);
    console.log(`   ✅ Model ${modelName} is accessible`);
    console.log(`   ✅ Response received successfully`);
    console.log(`   ✅ Response time: ${duration}ms\n`);

    console.log('🎉 Gemini API is working correctly with the new key!');

    return true;

  } catch (error) {
    console.error('\n❌ Gemini API test failed!\n');
    
    if (error.message) {
      console.error('Error message:', error.message);
    }

    // Check for common error types
    if (error.message?.includes('API key')) {
      console.error('\n❌ API KEY ERROR:');
      console.error('   The API key appears to be invalid or not properly configured');
      console.error('   Please verify:');
      console.error('   1. The API key is correct');
      console.error('   2. The API key has proper permissions');
      console.error('   3. The .env.local file is in the project root');
    } else if (error.status === 400) {
      console.error('\n❌ BAD REQUEST:');
      console.error('   The request to Gemini API was malformed');
    } else if (error.status === 429) {
      console.error('\n❌ RATE LIMIT:');
      console.error('   You have exceeded your Gemini API quota or rate limit');
    } else if (error.status === 403) {
      console.error('\n❌ FORBIDDEN:');
      console.error('   Your API key does not have permission to use this model');
      console.error('   The API key may be invalid or expired');
    } else {
      console.error('Full error:', error);
    }

    process.exit(1);
  }
}

// Run the test
testGeminiAPI()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  });

