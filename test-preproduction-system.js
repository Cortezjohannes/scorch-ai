const fetch = require('node-fetch');
const fs = require('fs');

async function testPreProductionSystem() {
  console.log('🎭 Testing Pre-Production System...\n');
  
  // Load the story bible and episodes we generated
  let storyBible, baselineEpisode, comprehensiveEpisode;
  try {
    storyBible = JSON.parse(fs.readFileSync('quick-test-story-bible.json', 'utf8'));
    baselineEpisode = JSON.parse(fs.readFileSync('test-baseline-episode.json', 'utf8'));
    comprehensiveEpisode = JSON.parse(fs.readFileSync('test-comprehensive-episode.json', 'utf8'));
    
    console.log('📖 Loaded story bible:', storyBible.seriesTitle);
    console.log('🎬 Loaded episodes:', baselineEpisode.title, '&', comprehensiveEpisode.episode.title);
  } catch (error) {
    console.log('❌ Could not load required files:', error.message);
    return;
  }
  
  // Test Phase 1 Pre-Production Generation
  console.log('\n🎯 TEST 1: Phase 1 Pre-Production Generation');
  const phase1Start = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/generate/phase1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: storyBible.theme,
        concept: storyBible.synopsis,
        characters: storyBible.mainCharacters.map(char => char.name).join(', ')
      })
    });
    
    const phase1Duration = (Date.now() - phase1Start) / 1000;
    console.log(`⏱️  Phase 1 generation: ${phase1Duration.toFixed(1)} seconds`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Phase 1 pre-production generated successfully');
      
      // Check what content was generated
      const contentTypes = [];
      if (data.script && data.script.length > 100) contentTypes.push('Script');
      if (data.storyboard && data.storyboard.length > 100) contentTypes.push('Storyboard');
      if (data.casting && data.casting.length > 100) contentTypes.push('Casting');
      if (data.narrative && data.narrative.length > 100) contentTypes.push('Narrative');
      
      console.log(`📝 Generated content types: ${contentTypes.join(', ')}`);
      console.log(`📊 Content count: ${contentTypes.length}/4 types`);
      
      // Save Phase 1 results
      fs.writeFileSync('test-phase1-preproduction.json', JSON.stringify(data, null, 2));
      console.log('💾 Saved to test-phase1-preproduction.json');
      
      // Test Phase 2 Pre-Production Generation
      console.log('\n🎯 TEST 2: Phase 2 Pre-Production Generation');
      const phase2Start = Date.now();
      
      try {
        const phase2Response = await fetch('http://localhost:3000/api/generate/phase2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            synopsis: storyBible.synopsis,
            theme: storyBible.theme
          })
        });
        
        const phase2Duration = (Date.now() - phase2Start) / 1000;
        console.log(`⏱️  Phase 2 generation: ${phase2Duration.toFixed(1)} seconds`);
        
        if (phase2Response.ok) {
          const phase2Data = await phase2Response.json();
          console.log('✅ Phase 2 pre-production generated successfully');
          
          // Check Phase 2 content
          const phase2ContentTypes = [];
          if (phase2Data.productionPlanning && phase2Data.productionPlanning.length > 100) phase2ContentTypes.push('Production Planning');
          if (phase2Data.visualDevelopment && phase2Data.visualDevelopment.length > 100) phase2ContentTypes.push('Visual Development');
          if (phase2Data.technicalPrep && phase2Data.technicalPrep.length > 100) phase2ContentTypes.push('Technical Prep');
          if (phase2Data.locationScouting && phase2Data.locationScouting.length > 100) phase2ContentTypes.push('Location Scouting');
          
          console.log(`📝 Phase 2 content types: ${phase2ContentTypes.join(', ')}`);
          console.log(`📊 Phase 2 content count: ${phase2ContentTypes.length}/4 types`);
          
          // Save Phase 2 results
          fs.writeFileSync('test-phase2-preproduction.json', JSON.stringify(phase2Data, null, 2));
          console.log('💾 Saved to test-phase2-preproduction.json');
          
          // Test Individual Content Generators
          console.log('\n🎯 TEST 3: Individual Content Generators');
          
          // Test Casting Generator
          console.log('\n👥 Testing Casting Generator...');
          const castingStart = Date.now();
          
          try {
            const castingResponse = await fetch('http://localhost:3000/api/generate/casting', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                storyBible: storyBible,
                episode: baselineEpisode
              })
            });
            
            const castingDuration = (Date.now() - castingStart) / 1000;
            console.log(`⏱️  Casting generation: ${castingDuration.toFixed(1)} seconds`);
            
            if (castingResponse.ok) {
              const castingData = await castingResponse.json();
              console.log('✅ Casting generated successfully');
              console.log(`👥 Casting content length: ${JSON.stringify(castingData).length} characters`);
              
              // Save casting results
              fs.writeFileSync('test-casting-generator.json', JSON.stringify(castingData, null, 2));
              console.log('💾 Saved to test-casting-generator.json');
            } else {
              console.log('❌ Casting generation failed:', castingResponse.status);
            }
          } catch (castingError) {
            console.log('❌ Casting generation error:', castingError.message);
          }
          
          // Test Storyboard Generator
          console.log('\n🎨 Testing Storyboard Generator...');
          const storyboardStart = Date.now();
          
          try {
            const storyboardResponse = await fetch('http://localhost:3000/api/generate/storyboard', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                storyBible: storyBible,
                episode: baselineEpisode
              })
            });
            
            const storyboardDuration = (Date.now() - storyboardStart) / 1000;
            console.log(`⏱️  Storyboard generation: ${storyboardDuration.toFixed(1)} seconds`);
            
            if (storyboardResponse.ok) {
              const storyboardData = await storyboardResponse.json();
              console.log('✅ Storyboard generated successfully');
              console.log(`🎨 Storyboard content length: ${JSON.stringify(storyboardData).length} characters`);
              
              // Save storyboard results
              fs.writeFileSync('test-storyboard-generator.json', JSON.stringify(storyboardData, null, 2));
              console.log('💾 Saved to test-storyboard-generator.json');
            } else {
              console.log('❌ Storyboard generation failed:', storyboardResponse.status);
            }
          } catch (storyboardError) {
            console.log('❌ Storyboard generation error:', storyboardError.message);
          }
          
          console.log('\n🎉 PRE-PRODUCTION SYSTEM TESTS COMPLETED!');
          console.log('\n📊 SUMMARY:');
          console.log(`   Phase 1: ${phase1Duration.toFixed(1)}s (${contentTypes.length}/4 content types)`);
          console.log(`   Phase 2: ${phase2Duration.toFixed(1)}s (${phase2ContentTypes.length}/4 content types)`);
          console.log(`   Individual generators: Tested casting and storyboard`);
          
          return true;
          
        } else {
          console.log('❌ Phase 2 generation failed:', phase2Response.status);
          return false;
        }
      } catch (phase2Error) {
        console.log('❌ Phase 2 generation error:', phase2Error.message);
        return false;
      }
      
    } else {
      console.log('❌ Phase 1 generation failed:', response.status);
      return false;
    }
  } catch (phase1Error) {
    console.log('❌ Phase 1 generation error:', phase1Error.message);
    return false;
  }
}

// Run the test
testPreProductionSystem().then(success => {
  console.log(`\n🎯 Pre-Production System Test Result: ${success ? 'PASS' : 'FAIL'}`);
  process.exit(success ? 0 : 1);
});
