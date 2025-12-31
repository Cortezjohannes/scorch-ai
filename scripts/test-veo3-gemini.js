/**
 * Test script for VEO 3.1 via Gemini API
 * This script tests the actual Gemini API connection using GEMINI_API_KEY
 */

require('dotenv').config({ path: '.env.local' });

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

async function testVEO3GeminiAPI() {
  console.log('🧪 Testing VEO 3.1 Gemini API Connection...\n');
  
  // Check environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not set');
    console.log('💡 Set it in .env.local: GEMINI_API_KEY=your-api-key');
    process.exit(1);
  }
  
  if (apiKey.length < 10) {
    console.error('❌ GEMINI_API_KEY is too short, please check the value');
    process.exit(1);
  }
  
  console.log(`✅ API Key found (${apiKey.substring(0, 10)}...)`);
  
  // Test standard model
  const models = [
    { name: 'VEO 3.1 Standard', id: 'veo-3.1-generate-preview' },
    { name: 'VEO 3.1 Fast', id: 'veo-3.1-fast-generate-preview' }
  ];
  
  for (const model of models) {
    try {
      console.log(`\n🎬 Testing ${model.name} (${model.id})...`);
      
      const testPrompt = 'A serene landscape with mountains at sunset, cinematic quality';
      const apiUrl = `${GEMINI_API_BASE_URL}/models/${model.id}:predictLongRunning`;
      
      console.log(`📡 Calling: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{
            prompt: testPrompt
          }]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ${model.name} API error (${response.status}):`, errorText.substring(0, 300));
        
        if (response.status === 403) {
          console.log('\n💡 This might mean:');
          console.log('   1. Your API key does not have access to VEO 3.1');
          console.log('   2. You need to enable billing on your Google Cloud project');
          console.log('   3. VEO 3.1 requires a paid tier subscription');
        } else if (response.status === 404) {
          console.log('\n💡 Model not found. This might mean:');
          console.log('   1. The model ID is incorrect');
          console.log('   2. VEO 3.1 is not available in your region');
        }
        continue;
      }
      
      const result = await response.json();
      
      if (result.name) {
        console.log(`✅ ${model.name} operation started!`);
        console.log(`   Operation name: ${result.name}`);
        console.log(`\n💡 Note: Video generation takes 60-90 seconds.`);
        console.log(`   You can poll the operation at: ${GEMINI_API_BASE_URL}/${result.name}`);
        console.log(`   Use header: x-goog-api-key: ${apiKey.substring(0, 10)}...`);
      } else {
        console.log(`⚠️  ${model.name} response:`, JSON.stringify(result).substring(0, 200));
      }
      
    } catch (error) {
      console.error(`❌ ${model.name} test failed:`, error.message);
    }
  }
  
  console.log('\n✅ Basic API connectivity tests completed!');
  console.log('💡 If operations started successfully, VEO 3.1 is accessible.');
  console.log('💡 You can now test video generation at /test-veo3');
}

testVEO3GeminiAPI().catch(console.error);


































