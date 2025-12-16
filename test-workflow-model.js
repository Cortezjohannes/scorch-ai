/**
 * Test Workflow Model Verification
 * Tests actual workflow endpoints to verify Gemini 3 is being used
 */

require('dotenv').config({ path: '.env.local' });

async function testWorkflowModel() {
  console.log('🧪 Testing Workflow Model Usage\n');
  console.log('='.repeat(70));

  const baseUrl = 'http://localhost:3000';

  // Test 1: Check episode generation endpoint
  console.log('\n🔬 Test 1: Episode Generation Endpoint');
  console.log('-'.repeat(70));
  
  try {
    const testStoryBible = {
      title: 'Test Series',
      genre: 'Drama',
      synopsis: 'A test series for model verification',
      mainCharacters: [{
        name: 'Test Character',
        description: 'A test character'
      }]
    };

    console.log('📡 Calling /api/generate/episode...');
    console.log('   This should use Gemini 3 Pro Preview');
    
    const response = await fetch(`${baseUrl}/api/generate/episode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodeNumber: 1,
        storyBible: testStoryBible
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Episode generation successful');
      
      // Check what model was used
      if (data.episode) {
        console.log('📝 Episode generated:');
        console.log(`   Title: ${data.episode.title || 'N/A'}`);
        console.log(`   Generation Method: ${data.generationMethod || 'N/A'}`);
        console.log(`   AI Provider: ${data.episode.aiProvider || 'N/A'}`);
        
        if (data.episode.aiProvider) {
          if (data.episode.aiProvider.includes('gemini-3')) {
            console.log('   ✅ Using Gemini 3 Pro Preview!');
          } else if (data.episode.aiProvider.includes('gemini-2.5')) {
            console.log('   ⚠️  Still using Gemini 2.5 Pro');
          } else {
            console.log(`   ℹ️  Using: ${data.episode.aiProvider}`);
          }
        }
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Request failed: ${response.status}`);
      console.log(`   Error: ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }

  // Test 2: Check model config
  console.log('\n🔬 Test 2: Model Configuration');
  console.log('-'.repeat(70));
  
  const { GEMINI_CONFIG } = require('./src/services/model-config.ts');
  console.log('📋 Model Configuration:');
  console.log(`   PRO Model: ${GEMINI_CONFIG.MODELS.PRO}`);
  console.log(`   Stable Mode: ${GEMINI_CONFIG.getModel('stable')}`);
  console.log(`   Beast Mode: ${GEMINI_CONFIG.getModel('beast')}`);
  
  if (GEMINI_CONFIG.MODELS.PRO === 'gemini-3-pro-preview') {
    console.log('   ✅ Configuration is set to Gemini 3 Pro Preview');
  } else {
    console.log(`   ⚠️  Configuration shows: ${GEMINI_CONFIG.MODELS.PRO}`);
  }

  // Test 3: Check environment variables
  console.log('\n🔬 Test 3: Environment Variables');
  console.log('-'.repeat(70));
  
  const envModel = process.env.GEMINI_STABLE_MODE_MODEL;
  console.log(`   GEMINI_STABLE_MODE_MODEL: ${envModel || 'NOT SET'}`);
  
  if (envModel === 'gemini-3-pro-preview') {
    console.log('   ✅ Environment variable set to Gemini 3 Pro Preview');
  } else if (envModel) {
    console.log(`   ⚠️  Environment variable set to: ${envModel}`);
  } else {
    console.log('   ℹ️  Using default from code (should be gemini-3-pro-preview)');
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Verification Complete\n');
}

testWorkflowModel()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });



