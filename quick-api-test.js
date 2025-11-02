/**
 * Quick API Test - Check story bible generation response structure
 */

const fetch = require('node-fetch');

async function testStoryBibleAPI() {
  console.log('🧪 Testing Story Bible API Response Structure...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/generate/story-bible', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        logline: "A detective discovers a murder in a small town",
        protagonist: "Sarah, a determined detective with a troubled past",
        stakes: "If she fails, the killer will strike again", 
        vibe: "Dark noir thriller",
        theme: "Justice and redemption"
      })
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('📊 Response Length:', text.length);
    console.log('📊 Response Type:', response.headers.get('content-type'));
    
    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      console.log('✅ Valid JSON Response:');
      console.log('📋 Response Keys:', Object.keys(json));
      console.log('📋 Success Field:', json.success);
      console.log('📋 Story Bible Field:', !!json.storyBible);
      
      if (json.storyBible) {
        console.log('📋 Story Bible Keys:', Object.keys(json.storyBible));
        console.log('📋 Series Title:', json.storyBible.seriesTitle);
        console.log('📋 Character Count:', json.storyBible.mainCharacters?.length);
      }
      
      if (json.error) {
        console.log('❌ Error Field:', json.error);
      }
      
    } catch (parseError) {
      console.log('❌ Not valid JSON');
      console.log('📋 First 500 chars:', text.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testStoryBibleAPI();

















