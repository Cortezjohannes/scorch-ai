/**
 * Test script to discover the EXACT API format for VEO 3.1
 * Let's test different parameter formats to see what actually works
 */

require('dotenv').config({ path: '.env.local' });

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not set');
  process.exit(1);
}

const model = 'veo-3.1-generate-preview';
const apiUrl = `${GEMINI_API_BASE_URL}/models/${model}:predictLongRunning`;

// Test different request formats
const testFormats = [
  {
    name: 'Format 1: Only prompt (current)',
    body: {
      instances: [{
        prompt: 'A serene landscape with mountains at sunset'
      }]
    }
  },
  {
    name: 'Format 2: prompt + aspect_ratio',
    body: {
      instances: [{
        prompt: 'A serene landscape with mountains at sunset',
        aspect_ratio: '9:16'
      }]
    }
  },
  {
    name: 'Format 3: prompt + aspectRatio (camelCase)',
    body: {
      instances: [{
        prompt: 'A serene landscape with mountains at sunset',
        aspectRatio: '9:16'
      }]
    }
  },
  {
    name: 'Format 4: prompt + video_length_seconds',
    body: {
      instances: [{
        prompt: 'A serene landscape with mountains at sunset',
        video_length_seconds: 8
      }]
    }
  },
  {
    name: 'Format 5: prompt + durationSeconds (camelCase)',
    body: {
      instances: [{
        prompt: 'A serene landscape with mountains at sunset',
        durationSeconds: 8
      }]
    }
  },
  {
    name: 'Format 6: prompt + generate_audio',
    body: {
      instances: [{
        prompt: 'A serene landscape with mountains at sunset',
        generate_audio: false
      }]
    }
  },
  {
    name: 'Format 7: All parameters (snake_case)',
    body: {
      instances: [{
        prompt: 'A serene landscape with mountains at sunset',
        aspect_ratio: '9:16',
        video_length_seconds: 8,
        generate_audio: false
      }]
    }
  },
  {
    name: 'Format 8: All parameters (camelCase)',
    body: {
      instances: [{
        prompt: 'A serene landscape with mountains at sunset',
        aspectRatio: '9:16',
        durationSeconds: 8,
        generateAudio: false
      }]
    }
  },
  {
    name: 'Format 9: Top-level parameters (not in instances)',
    body: {
      prompt: 'A serene landscape with mountains at sunset',
      aspectRatio: '9:16',
      durationSeconds: 8,
      generateAudio: false
    }
  }
];

async function testFormat(format) {
  try {
    console.log(`\n🧪 Testing: ${format.name}`);
    console.log(`📤 Request body:`, JSON.stringify(format.body, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(format.body)
    });
    
    const responseText = await response.text();
    
    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log(`✅ SUCCESS! Status: ${response.status}`);
      if (result.name) {
        console.log(`   Operation started: ${result.name}`);
      }
      console.log(`   Response:`, JSON.stringify(result).substring(0, 200));
      return { success: true, format: format.name, body: format.body };
    } else {
      console.log(`❌ FAILED! Status: ${response.status}`);
      try {
        const error = JSON.parse(responseText);
        console.log(`   Error:`, error.error?.message || JSON.stringify(error).substring(0, 200));
      } catch {
        console.log(`   Error text:`, responseText.substring(0, 200));
      }
      return { success: false, format: format.name, status: response.status };
    }
  } catch (error) {
    console.log(`❌ ERROR:`, error.message);
    return { success: false, format: format.name, error: error.message };
  }
}

async function runTests() {
  console.log('🔍 Testing VEO 3.1 API Request Formats\n');
  console.log(`📡 Endpoint: ${apiUrl}\n`);
  
  const results = [];
  
  for (const format of testFormats) {
    const result = await testFormat(format);
    results.push(result);
    
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n📊 SUMMARY:');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Successful formats (${successful.length}):`);
  successful.forEach(r => {
    console.log(`   - ${r.format}`);
    console.log(`     Body:`, JSON.stringify(r.body, null, 6));
  });
  
  console.log(`\n❌ Failed formats (${failed.length}):`);
  failed.forEach(r => {
    console.log(`   - ${r.format} (Status: ${r.status || 'Error'})`);
  });
  
  if (successful.length > 0) {
    console.log('\n🎯 RECOMMENDED FORMAT:');
    console.log(JSON.stringify(successful[0].body, null, 2));
  }
}

runTests().catch(console.error);
































