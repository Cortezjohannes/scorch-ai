const fetch = require('node-fetch');
const fs = require('fs');

async function testEpisodeGeneration() {
  console.log('🎬 Testing Episode Generation Workflow...\n');
  
  // Load the story bible we just generated
  let storyBible;
  try {
    storyBible = JSON.parse(fs.readFileSync('quick-test-story-bible.json', 'utf8'));
    console.log('📖 Loaded story bible:', storyBible.seriesTitle);
    console.log('👥 Characters:', storyBible.mainCharacters.length);
    console.log('📚 Arcs:', storyBible.narrativeArcs.length);
  } catch (error) {
    console.log('❌ Could not load story bible:', error.message);
    return;
  }
  
  // Test 1: Baseline Episode Generation (no engines)
  console.log('\n🎯 TEST 1: Baseline Episode Generation (GPT-4.1 only)');
  const baselineStart = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/generate/episode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyBible: storyBible,
        episodeNumber: 1,
        useEngines: false,
        useComprehensiveEngines: false
      })
    });
    
    const baselineDuration = (Date.now() - baselineStart) / 1000;
    console.log(`⏱️  Baseline generation: ${baselineDuration.toFixed(1)} seconds`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.episode) {
        console.log('✅ Baseline episode generated successfully');
        console.log(`📺 Title: ${data.episode.title}`);
        console.log(`🎬 Scenes: ${data.episode.scenes?.length || 0}`);
        console.log(`🔀 Choices: ${data.episode.branchingOptions?.length || 0}`);
        
        // Save baseline episode
        fs.writeFileSync('test-baseline-episode.json', JSON.stringify(data.episode, null, 2));
        console.log('💾 Saved to test-baseline-episode.json');
        
        // Test 2: Comprehensive Episode Generation (19 engines)
        console.log('\n⚡ TEST 2: Comprehensive Episode Generation (19 engines)');
        const comprehensiveStart = Date.now();
        
        try {
          const compResponse = await fetch('http://localhost:3000/api/generate/episode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storyBible: storyBible,
              episodeNumber: 2,
              previousChoice: data.episode.branchingOptions?.[1]?.text || null,
              useEngines: true,
              useComprehensiveEngines: true
            })
          });
          
          const compDuration = (Date.now() - comprehensiveStart) / 1000;
          console.log(`⏱️  Comprehensive generation: ${compDuration.toFixed(1)} seconds`);
          
          if (compResponse.ok) {
            const compData = await compResponse.json();
            if (compData.episode) {
              console.log('✅ Comprehensive episode generated successfully');
              console.log(`📺 Title: ${compData.episode.title}`);
              console.log(`🎬 Scenes: ${compData.episode.scenes?.length || 0}`);
              console.log(`🔀 Choices: ${compData.episode.branchingOptions?.length || 0}`);
              
              if (compData.engineMetadata) {
                console.log(`⚙️  Engines: ${compData.engineMetadata.successfulEngines}/${compData.engineMetadata.totalEnginesRun} succeeded`);
                console.log(`📊 Success Rate: ${(compData.engineMetadata.successRate * 100).toFixed(1)}%`);
              }
              
              // Save comprehensive episode
              fs.writeFileSync('test-comprehensive-episode.json', JSON.stringify({
                episode: compData.episode,
                engineMetadata: compData.engineMetadata
              }, null, 2));
              console.log('💾 Saved to test-comprehensive-episode.json');
              
              // Test 3: Gemini Episode Generation
              console.log('\n🚀 TEST 3: Gemini 2.5 Pro Episode Generation');
              const geminiStart = Date.now();
              
              try {
                const geminiResponse = await fetch('http://localhost:3000/api/generate/episode', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    storyBible: storyBible,
                    episodeNumber: 1,
                    useGeminiComprehensive: true
                  })
                });
                
                const geminiDuration = (Date.now() - geminiStart) / 1000;
                console.log(`⏱️  Gemini generation: ${geminiDuration.toFixed(1)} seconds`);
                
                if (geminiResponse.ok) {
                  const geminiData = await geminiResponse.json();
                  if (geminiData.episode) {
                    console.log('✅ Gemini episode generated successfully');
                    console.log(`📺 Title: ${geminiData.episode.title}`);
                    console.log(`🎬 Scenes: ${geminiData.episode.scenes?.length || 0}`);
                    console.log(`🔀 Choices: ${geminiData.episode.branchingOptions?.length || 0}`);
                    console.log(`🤖 AI Provider: ${geminiData.aiProvider || 'gemini'}`);
                    
                    // Save Gemini episode
                    fs.writeFileSync('test-gemini-episode.json', JSON.stringify(geminiData.episode, null, 2));
                    console.log('💾 Saved to test-gemini-episode.json');
                    
                    console.log('\n🎉 ALL EPISODE GENERATION TESTS PASSED!');
                    console.log('\n📊 SUMMARY:');
                    console.log(`   Baseline: ${baselineDuration.toFixed(1)}s`);
                    console.log(`   Comprehensive: ${compDuration.toFixed(1)}s`);
                    console.log(`   Gemini: ${geminiDuration.toFixed(1)}s`);
                    
                    return true;
                  } else {
                    console.log('❌ No episode in Gemini response');
                    return false;
                  }
                } else {
                  console.log('❌ Gemini generation failed:', compResponse.status);
                  return false;
                }
              } catch (geminiError) {
                console.log('❌ Gemini generation error:', geminiError.message);
                return false;
              }
              
            } else {
              console.log('❌ No episode in comprehensive response');
              return false;
            }
          } else {
            console.log('❌ Comprehensive generation failed:', compResponse.status);
            return false;
          }
        } catch (compError) {
          console.log('❌ Comprehensive generation error:', compError.message);
          return false;
        }
        
      } else {
        console.log('❌ No episode in baseline response');
        return false;
      }
    } else {
      console.log('❌ Baseline generation failed:', response.status);
      return false;
    }
  } catch (baselineError) {
    console.log('❌ Baseline generation error:', baselineError.message);
    return false;
  }
}

// Run the test
testEpisodeGeneration().then(success => {
  console.log(`\n🎯 Episode Generation Test Result: ${success ? 'PASS' : 'FAIL'}`);
  process.exit(success ? 0 : 1);
});















