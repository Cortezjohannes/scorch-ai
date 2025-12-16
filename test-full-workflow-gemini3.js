/**
 * Full Workflow Test - Create Series and Generate Episode
 * Tests the complete workflow to verify Gemini 3 Pro Preview is used
 */

require('dotenv').config({ path: '.env.local' });

async function testFullWorkflow() {
  console.log('🧪 Full Workflow Test - Gemini 3 Pro Preview Verification\n');
  console.log('='.repeat(70));

  const baseUrl = 'http://localhost:3000';

  // Step 1: Create a test story bible
  const testStoryBible = {
    seriesTitle: 'Gemini 3 Test Series',
    genre: 'Drama',
    premise: {
      premiseStatement: 'A test series to verify Gemini 3 Pro Preview integration in the actual workflow'
    },
    mainCharacters: [
      {
        name: 'Alex',
        description: 'A determined protagonist facing personal challenges',
        role: 'Protagonist',
        archetype: 'Hero'
      },
      {
        name: 'Sam',
        description: 'A supportive friend who provides emotional grounding',
        role: 'Supporting',
        archetype: 'Mentor'
      }
    ],
    themes: ['Determination', 'Friendship', 'Growth'],
    tone: 'Dramatic but hopeful'
  };

  console.log('📖 Step 1: Story Bible Created');
  console.log(`   Title: ${testStoryBible.seriesTitle}`);
  console.log(`   Genre: ${testStoryBible.genre}\n`);

  // Step 2: Generate Episode 1
  console.log('🎬 Step 2: Generating Episode 1...');
  console.log('   ⚠️  Watch server console for Gemini 3 logs!\n');
  console.log('   Expected logs:');
  console.log('   - 🚀 [GEMINI] Generating beat sheet with Gemini 3 Pro Preview...');
  console.log('   - ✅ [GEMINI] Beat sheet generated: ... using gemini-3-pro-preview');
  console.log('   - 🚀 [GEMINI] Generating episode content with Gemini 3 Pro Preview...');
  console.log('   - ✅ [GEMINI] Episode generated: ... using gemini-3-pro-preview\n');

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
      console.log(`✅ Episode generated successfully in ${(duration / 1000).toFixed(2)}s\n`);
      
      console.log('📝 Episode Results:');
      console.log(`   Success: ${data.success}`);
      console.log(`   Generation Method: ${data.generationMethod || 'N/A'}`);
      
      if (data.episode) {
        console.log(`   Episode Title: ${data.episode.title || 'N/A'}`);
        console.log(`   Scenes: ${data.episode.scenes?.length || 0}`);
        
        // Calculate content stats
        const totalContent = (data.episode.scenes || []).reduce((sum, scene) => 
          sum + (scene.content?.length || 0), 0);
        console.log(`   Total Content: ${totalContent.toLocaleString()} characters`);
        
        if (data.episode.scenes && data.episode.scenes.length > 0) {
          const firstScene = data.episode.scenes[0];
          console.log(`   First Scene Preview: ${(firstScene.content || '').substring(0, 100)}...`);
        }
      }

      if (data.usedIntelligentDefaults) {
        console.log(`\n   ✅ Used Intelligent Defaults`);
      }
      if (data.analyzedSettings) {
        console.log(`   ✅ Analyzed Settings Applied`);
      }

    } else {
      const errorText = await response.text();
      console.log(`❌ Request failed: ${response.status}`);
      console.log(`   Error: ${errorText.substring(0, 300)}`);
    }
  } catch (error) {
    console.log(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 Verification Checklist:');
  console.log('='.repeat(70));
  console.log('✅ Check server console logs for:');
  console.log('   1. 🚀 [GEMINI] Generating beat sheet with Gemini 3 Pro Preview...');
  console.log('   2. ✅ [GEMINI] Beat sheet generated: ... using gemini-3-pro-preview');
  console.log('   3. 🚀 [GEMINI] Generating episode content with Gemini 3 Pro Preview...');
  console.log('   4. ✅ [GEMINI] Episode generated: ... using gemini-3-pro-preview');
  console.log('\n❌ If you see "gpt-4.1" or "azure" in the logs, Gemini 3 is NOT being used');
  console.log('✅ If you see "gemini-3-pro-preview" in all logs, integration is successful!');
  console.log('='.repeat(70));
}

testFullWorkflow()
  .then(() => {
    console.log('\n✅ Full workflow test complete!\n');
    console.log('📊 Next Steps:');
    console.log('   1. Check the server console (where you ran "npm run dev")');
    console.log('   2. Look for the Gemini 3 Pro Preview logs listed above');
    console.log('   3. Verify the episode was generated successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

