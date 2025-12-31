/**
 * Test the CORRECT API format based on official documentation
 * https://ai.google.dev/gemini-api/docs/video
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

// Test formats based on documentation
const testFormats = [
  {
    name: 'Format from docs: instances with prompt only',
    body: {
      instances: [{
        prompt: 'A serene landscape with mountains at sunset'
      }]
    }
  },
  {
    name: 'Format: instances with prompt + aspectRatio at instance level',
    body: {
      instances: [{
        prompt: 'A serene landscape with mountains at sunset',
        aspectRatio: '9:16'
      }]
    }
  },
  {
    name: 'Format: Top-level parameters (not in instances)',
    body: {
      prompt: 'A serene landscape with mountains at sunset',
      aspectRatio: '9:16'
    }
  },
  {
    name: 'Format: instances + top-level config',
    body: {
      instances: [{
        prompt: 'A serene landscape with mountains at sunset'
      }],
      aspectRatio: '9:16'
    }
  },
  {
    name: 'Format: instances with config object',
    body: {
      instances: [{
        prompt: 'A serene landscape with mountains at sunset',
        config: {
          aspectRatio: '9:16'
        }
      }]
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
      return { success: true, format: format.name, body: format.body };
    } else {
      console.log(`❌ FAILED! Status: ${response.status}`);
      try {
        const error = JSON.parse(responseText);
        console.log(`   Error:`, error.error?.message || JSON.stringify(error).substring(0, 300));
      } catch {
        console.log(`   Error text:`, responseText.substring(0, 300));
      }
      return { success: false, format: format.name, status: response.status };
    }
  } catch (error) {
    console.log(`❌ ERROR:`, error.message);
    return { success: false, format: format.name, error: error.message };
  }
}

async function runTests() {
  console.log('🔍 Testing VEO 3.1 API Formats Based on Official Documentation\n');
  console.log(`📡 Endpoint: ${apiUrl}\n`);
  
  const results = [];
  
  for (const format of testFormats) {
    const result = await testFormat(format);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\n📊 SUMMARY:');
  const successful = results.filter(r => r.success);
  
  if (successful.length > 0) {
    console.log(`\n✅ Working format:`);
    console.log(JSON.stringify(successful[0].body, null, 2));
  } else {
    console.log(`\n❌ No formats worked - all parameters must be in prompt`);
  }
}

runTests().catch(console.error);
































