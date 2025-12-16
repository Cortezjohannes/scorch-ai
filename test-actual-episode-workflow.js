/**
 * Test Actual Episode Generation Workflow
 * Tests the real workflow to verify Gemini 3 is being used
 */

require('dotenv').config({ path: '.env.local' });

async function testActualEpisodeWorkflow() {
  console.log('🧪 Testing Actual Episode Generation Workflow\n');
  console.log('='.repeat(70));

  const baseUrl = 'http://localhost:3000';

  // Create a test story bible first
  const testStoryBible = {
    title: 'Gemini 3 Verification Test Series',
    genre: 'Drama',
    synopsis: 'A test series to verify Gemini 3 Pro Preview is being used in episode generation',
    mainCharacters: [
      {
        name: 'Alex',
        description: 'A determined protagonist',
        role: 'Protagonist'
      },
      {
        name: 'Sam',
        description: 'A supportive friend',
        role: 'Supporting'
      }
    ],
    themes: ['Determination', 'Friendship'],
    tone: 'Dramatic but hopeful'
  };

  console.log('📖 Test Story Bible:');
  console.log(`   Title: ${testStoryBible.title}`);
  console.log(`   Genre: ${testStoryBible.genre}\n`);

  // Test Episode 1 Generation
  console.log('🔬 Test: Generate Episode 1');
  console.log('-'.repeat(70));
  console.log('📡 Calling /api/generate/episode...');
  console.log('   ⚠️  Watch server console for model logs!\n');
  console.log('   Look for: "🚀 [GEMINI] Starting generation with model: gemini-3-pro-preview"\n');

  try {
    const startTime = Date.now();
    
    const response = await fetch(`${baseUrl}/api/generate/episode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodeNumber: 1,
        storyBible: testStoryBible
      }),
    });

    const duration = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Episode generated in ${(duration / 1000).toFixed(2)}s\n`);
      
      console.log('📝 Episode Data:');
      console.log(`   Success: ${data.success}`);
      console.log(`   Generation Method: ${data.generationMethod || 'N/A'}`);
      
      if (data.episode) {
        console.log(`   Episode Title: ${data.episode.title || 'N/A'}`);
        console.log(`   Scenes: ${data.episode.scenes?.length || 0}`);
        console.log(`   AI Provider: ${data.episode.aiProvider || 'Not in response (check server logs)'}`);
        
        // Check for model indicators in the content
        if (data.episode.title) {
          console.log(`\n   ✅ Episode content generated successfully`);
        }
      }

      // Check response metadata
      if (data.usedIntelligentDefaults) {
        console.log(`\n   📊 Used Intelligent Defaults: ${data.usedIntelligentDefaults}`);
      }
      if (data.analyzedSettings) {
        console.log(`   📊 Analyzed Settings: ${JSON.stringify(data.analyzedSettings)}`);
      }

    } else {
      const errorText = await response.text();
      console.log(`❌ Request failed: ${response.status}`);
      console.log(`   Error: ${errorText.substring(0, 300)}`);
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 Verification Instructions:');
  console.log('='.repeat(70));
  console.log('1. Check the SERVER console (where you ran "npm run dev")');
  console.log('2. Look for these log messages:');
  console.log('   🚀 [GEMINI] Starting generation with model: gemini-3-pro-preview');
  console.log('   📋 [GEMINI] Model verification: ✅ GEMINI 3 PRO PREVIEW');
  console.log('   ✅ [GEMINI] Received response from gemini-3-pro-preview');
  console.log('\n3. If you see "gemini-2.5-pro" in the logs, there may be an issue');
  console.log('4. The episode should be generated successfully');
  console.log('='.repeat(70));
}

testActualEpisodeWorkflow()
  .then(() => {
    console.log('\n✅ Test complete - Check server console for model verification\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });



