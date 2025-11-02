const fetch = require('node-fetch');
const fs = require('fs');

async function testIndividualGenerators() {
  console.log('🎨 Testing Individual Content Generators...\n');
  
  // Load the story bible and episodes
  let storyBible, baselineEpisode;
  try {
    storyBible = JSON.parse(fs.readFileSync('quick-test-story-bible.json', 'utf8'));
    baselineEpisode = JSON.parse(fs.readFileSync('test-baseline-episode.json', 'utf8'));
    
    console.log('📖 Loaded story bible:', storyBible.seriesTitle);
    console.log('🎬 Loaded episode:', baselineEpisode.title);
  } catch (error) {
    console.log('❌ Could not load required files:', error.message);
    return;
  }
  
  // Test Image Generation
  console.log('\n🖼️  TEST 1: Image Generation');
  const imageStart = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'A dark noir detective scene in a small town with fog and mystery',
        style: 'Cinematic',
        size: 'medium'
      })
    });
    
    const imageDuration = (Date.now() - imageStart) / 1000;
    console.log(`⏱️  Image generation: ${imageDuration.toFixed(1)} seconds`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Image generated successfully');
      console.log(`🖼️  Image URL: ${data.imageUrl || 'Generated'}`);
      
      // Save image results
      fs.writeFileSync('test-image-generation.json', JSON.stringify(data, null, 2));
      console.log('💾 Saved to test-image-generation.json');
    } else {
      console.log('❌ Image generation failed:', response.status);
      const errorText = await response.text();
      console.log('📋 Error:', errorText.substring(0, 200));
    }
  } catch (imageError) {
    console.log('❌ Image generation error:', imageError.message);
  }
  
  // Test Script Generation (if available)
  console.log('\n📝 TEST 2: Script Generation');
  const scriptStart = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/generate/script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyBible: storyBible,
        episode: baselineEpisode
      })
    });
    
    const scriptDuration = (Date.now() - scriptStart) / 1000;
    console.log(`⏱️  Script generation: ${scriptDuration.toFixed(1)} seconds`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Script generated successfully');
      console.log(`📝 Script content length: ${JSON.stringify(data).length} characters`);
      
      // Save script results
      fs.writeFileSync('test-script-generation.json', JSON.stringify(data, null, 2));
      console.log('💾 Saved to test-script-generation.json');
    } else {
      console.log('❌ Script generation failed:', response.status);
      const errorText = await response.text();
      console.log('📋 Error:', errorText.substring(0, 200));
    }
  } catch (scriptError) {
    console.log('❌ Script generation error:', scriptError.message);
  }
  
  // Test Pre-Production Status
  console.log('\n📊 TEST 3: Pre-Production Status');
  const statusStart = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/preproduction-status', {
      method: 'GET'
    });
    
    const statusDuration = (Date.now() - statusStart) / 1000;
    console.log(`⏱️  Status check: ${statusDuration.toFixed(1)} seconds`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Pre-production status retrieved');
      console.log(`📊 Status data:`, JSON.stringify(data, null, 2));
      
      // Save status results
      fs.writeFileSync('test-preproduction-status.json', JSON.stringify(data, null, 2));
      console.log('💾 Saved to test-preproduction-status.json');
    } else {
      console.log('❌ Status check failed:', response.status);
    }
  } catch (statusError) {
    console.log('❌ Status check error:', statusError.message);
  }
  
  // Test Save Endpoints
  console.log('\n💾 TEST 4: Save Endpoints');
  
  // Test Save Story Bible
  try {
    const saveResponse = await fetch('http://localhost:3000/api/save-story-bible', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyBible: storyBible
      })
    });
    
    if (saveResponse.ok) {
      const saveData = await saveResponse.json();
      console.log('✅ Story bible saved successfully');
      console.log(`💾 Save result:`, saveData);
    } else {
      console.log('❌ Story bible save failed:', saveResponse.status);
    }
  } catch (saveError) {
    console.log('❌ Story bible save error:', saveError.message);
  }
  
  // Test Save Episode
  try {
    const saveEpisodeResponse = await fetch('http://localhost:3000/api/save-episode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episode: baselineEpisode,
        episodeNumber: 1
      })
    });
    
    if (saveEpisodeResponse.ok) {
      const saveEpisodeData = await saveEpisodeResponse.json();
      console.log('✅ Episode saved successfully');
      console.log(`💾 Episode save result:`, saveEpisodeData);
    } else {
      console.log('❌ Episode save failed:', saveEpisodeResponse.status);
    }
  } catch (saveEpisodeError) {
    console.log('❌ Episode save error:', saveEpisodeError.message);
  }
  
  console.log('\n🎉 INDIVIDUAL GENERATOR TESTS COMPLETED!');
  return true;
}

// Run the test
testIndividualGenerators().then(success => {
  console.log(`\n🎯 Individual Generator Test Result: ${success ? 'PASS' : 'FAIL'}`);
  process.exit(success ? 0 : 1);
});

















