/**
 * Test Nano Banana Pro (Gemini Image Generation)
 * Tests if gemini-3-pro-image-preview is working for image generation
 */

require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testNanoBanana() {
  console.log('🍌 Testing Nano Banana Pro (Gemini Image Generation)...\n');
  
  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    return;
  }
  
  console.log(`✅ API Key found (length: ${apiKey.length})`);
  console.log(`   First 4 chars: ${apiKey.substring(0, 4)}`);
  console.log(`   Last 4 chars: ${apiKey.substring(apiKey.length - 4)}\n`);
  
  // Nano Banana Pro model name
  const modelName = 'gemini-3-pro-image-preview';
  console.log(`📋 Testing with model: ${modelName}\n`);
  
  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ GoogleGenerativeAI initialized\n');
    
    // Test 1: Check if model exists and is accessible
    console.log('🧪 Test 1: Checking model availability...');
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        }
      });
      
      console.log(`✅ Test 1 PASSED - Model ${modelName} is accessible\n`);
    } catch (error) {
      console.error(`❌ Test 1 FAILED`);
      console.error(`   Error: ${error.message}`);
      if (error.status === 404) {
        console.error(`   ⚠️  Model not found. This model may not be available yet.`);
        console.error(`   💡 Try checking: https://ai.google.dev/models`);
      }
      if (error.status === 403) {
        console.error(`   ⚠️  Access forbidden. Check API key permissions.`);
      }
      if (error.status === 429) {
        console.error(`   ⚠️  Rate limit exceeded. Wait and try again.`);
      }
      console.log('');
    }
    
    // Test 2: Try simple image generation
    console.log('🧪 Test 2: Simple image generation test...');
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        }
      });
      
      const prompt = 'A simple test image: a red apple on a white background';
      console.log(`   Prompt: "${prompt}"`);
      console.log(`   Generating image...`);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Check if response contains image data
      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        const candidate = candidates[0];
        
        // Check for image in content
        if (candidate.content && candidate.content.parts) {
          const parts = candidate.content.parts;
          const imageParts = parts.filter(part => part.inlineData || part.url);
          
          if (imageParts.length > 0) {
            console.log(`✅ Test 2 PASSED - Image generated successfully!`);
            console.log(`   Found ${imageParts.length} image part(s) in response`);
            
            // Check image format
            imageParts.forEach((part, index) => {
              if (part.inlineData) {
                console.log(`   Image ${index + 1}: Base64 data (${part.inlineData.mimeType || 'unknown format'})`);
                console.log(`   Data length: ${part.inlineData.data?.length || 0} characters`);
              } else if (part.url) {
                console.log(`   Image ${index + 1}: URL - ${part.url}`);
              }
            });
          } else {
            console.log(`⚠️  Test 2 PARTIAL - Response received but no image data found`);
            console.log(`   Response structure:`, JSON.stringify(candidate.content, null, 2).substring(0, 500));
          }
        } else {
          console.log(`⚠️  Test 2 PARTIAL - Response received but unexpected structure`);
          console.log(`   Response:`, JSON.stringify(candidate, null, 2).substring(0, 500));
        }
      } else {
        console.log(`⚠️  Test 2 PARTIAL - No candidates in response`);
        console.log(`   Response:`, JSON.stringify(response, null, 2).substring(0, 500));
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ Test 2 FAILED`);
      console.error(`   Error: ${error.message}`);
      if (error.status) console.error(`   Status: ${error.status}`);
      if (error.statusText) console.error(`   Status Text: ${error.statusText}`);
      
      // Check for specific error types
      if (error.message?.includes('not support') || error.message?.includes('image generation')) {
        console.error(`   ⚠️  This model may not support image generation yet.`);
        console.error(`   💡 Image generation may still be in preview/limited access.`);
      }
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        console.error(`   ⚠️  Quota or rate limit issue. Check your API usage.`);
      }
      console.log('');
    }
    
    // Test 3: Check response structure
    console.log('🧪 Test 3: Checking response structure...');
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.7,
        }
      });
      
      const result = await model.generateContent('Test');
      const response = await result.response;
      
      console.log(`✅ Test 3 PASSED - Got response from model`);
      console.log(`   Response type: ${typeof response}`);
      console.log(`   Has candidates: ${!!response.candidates}`);
      console.log(`   Candidates count: ${response.candidates?.length || 0}`);
      
      if (response.usageMetadata) {
        console.log(`   Usage metadata:`, JSON.stringify(response.usageMetadata, null, 2));
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ Test 3 FAILED`);
      console.error(`   Error: ${error.message}`);
      console.log('');
    }
    
    // Summary
    console.log('📊 Test Summary:');
    console.log('   Nano Banana Pro (gemini-3-pro-image-preview) is Google\'s image generation model.');
    console.log('   If tests pass, the model is accessible and working.');
    console.log('   If tests fail with 404, the model may not be available in your region/account yet.');
    console.log('   Image generation features may require special access or be in limited preview.\n');
    
  } catch (error) {
    console.error('❌ Failed to initialize Gemini API');
    console.error(`   Error: ${error.message}`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack}`);
    }
  }
}

// Run the test
testNanoBanana().catch(console.error);










