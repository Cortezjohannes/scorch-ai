const fetch = require('node-fetch');

async function testStoryBible() {
  console.log('🧪 Quick Story Bible Test...\n');
  
  const startTime = Date.now();
  
  try {
    console.log('📤 Sending request...');
    
    const response = await fetch('http://localhost:3000/api/generate/story-bible', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        logline: 'A detective discovers a murder in a small town',
        protagonist: 'Sarah, a determined detective with a troubled past',
        stakes: 'If she fails, the killer will strike again',
        vibe: 'Dark noir thriller',
        theme: 'Justice and redemption'
      })
    });
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`⏱️  Request completed in ${duration.toFixed(1)} seconds`);
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.storyBible) {
        console.log('✅ SUCCESS! Story bible generated');
        console.log(`📖 Title: ${data.storyBible.seriesTitle}`);
        console.log(`👥 Characters: ${data.storyBible.mainCharacters?.length || 0}`);
        console.log(`📚 Arcs: ${data.storyBible.narrativeArcs?.length || 0}`);
        console.log(`🌍 World Building: ${data.storyBible.worldBuilding ? 'Yes' : 'No'}`);
        
        // Save a sample for inspection
        require('fs').writeFileSync(
          'quick-test-story-bible.json',
          JSON.stringify(data.storyBible, null, 2)
        );
        console.log('💾 Saved to quick-test-story-bible.json');
        
        return true;
      } else {
        console.log('❌ No story bible in response');
        console.log('📋 Response keys:', Object.keys(data));
        return false;
      }
    } else {
      console.log('❌ HTTP Error:', response.status);
      const text = await response.text();
      console.log('📋 Response:', text.substring(0, 200));
      return false;
    }
    
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    console.log(`❌ Error after ${duration.toFixed(1)} seconds:`, error.message);
    return false;
  }
}

// Run the test
testStoryBible().then(success => {
  console.log(`\n🎯 Test Result: ${success ? 'PASS' : 'FAIL'}`);
  process.exit(success ? 0 : 1);
});















