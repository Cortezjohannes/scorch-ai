/**
 * Test script for Gemini Image Generation Integration
 * 
 * Tests the Gemini 3 image generation service and API route
 */

const fetch = require('node-fetch');

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_PROMPTS = [
  'A serene landscape with mountains and a river at sunset',
  'A professional headshot portrait of a character',
  'A cinematic storyboard frame showing a dramatic scene',
  'A simple red apple on a white background'
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

/**
 * Test the API route directly
 */
async function testAPIRoute(prompt) {
  try {
    log(`Testing API route with prompt: "${prompt.substring(0, 50)}..."`, 'cyan');
    
    const response = await fetch(`${API_URL}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      log(`❌ API Error: ${data.error || response.statusText}`, 'red');
      return { success: false, error: data.error || response.statusText };
    }

    if (data.success && (data.imageUrl || data.url)) {
      const imageUrl = data.imageUrl || data.url;
      const isDataUrl = imageUrl.startsWith('data:image/');
      const source = data.source || 'unknown';
      
      log(`✅ API Success!`, 'green');
      log(`   Source: ${source}`, 'cyan');
      log(`   Image URL type: ${isDataUrl ? 'Data URL (base64)' : 'External URL'}`, 'cyan');
      log(`   Image URL length: ${imageUrl.length} characters`, 'cyan');
      
      if (isDataUrl) {
        const mimeType = imageUrl.match(/data:([^;]+)/)?.[1] || 'unknown';
        log(`   MIME type: ${mimeType}`, 'cyan');
      }
      
      return { 
        success: true, 
        imageUrl,
        source,
        isDataUrl,
        metadata: data
      };
    } else {
      log(`❌ Invalid response format`, 'red');
      return { success: false, error: 'Invalid response format' };
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Test the Gemini image generation service directly (if running in Node.js with access)
 */
async function testServiceDirectly() {
  try {
    logSection('Testing Gemini Image Service Directly');
    
    // This would require importing the service, which might not work in this context
    // We'll test via API instead
    log('Note: Direct service testing requires module import', 'yellow');
    log('Testing via API route instead...', 'yellow');
    
    return true;
  } catch (error) {
    log(`❌ Direct service test failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  logSection('🧪 Gemini Image Generation Integration Test');
  
  log(`Testing against: ${API_URL}`, 'blue');
  log(`Make sure the server is running!`, 'yellow');
  log(`\nPress Ctrl+C to cancel, or wait 3 seconds to continue...\n`, 'yellow');
  
  // Wait 3 seconds
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  // Test 1: API Route with simple prompt
  logSection('Test 1: Simple Image Generation');
  results.total++;
  const test1 = await testAPIRoute(TEST_PROMPTS[0]);
  if (test1.success) {
    results.passed++;
    results.details.push({ test: 'Simple Image', status: 'PASSED', source: test1.source });
  } else {
    results.failed++;
    results.details.push({ test: 'Simple Image', status: 'FAILED', error: test1.error });
  }

  // Test 2: Character portrait
  logSection('Test 2: Character Portrait');
  results.total++;
  const test2 = await testAPIRoute(TEST_PROMPTS[1]);
  if (test2.success) {
    results.passed++;
    results.details.push({ test: 'Character Portrait', status: 'PASSED', source: test2.source });
  } else {
    results.failed++;
    results.details.push({ test: 'Character Portrait', status: 'FAILED', error: test2.error });
  }

  // Test 3: Storyboard frame
  logSection('Test 3: Storyboard Frame');
  results.total++;
  const test3 = await testAPIRoute(TEST_PROMPTS[2]);
  if (test3.success) {
    results.passed++;
    results.details.push({ test: 'Storyboard Frame', status: 'PASSED', source: test3.source });
  } else {
    results.failed++;
    results.details.push({ test: 'Storyboard Frame', status: 'FAILED', error: test3.error });
  }

  // Test 4: Simple object
  logSection('Test 4: Simple Object');
  results.total++;
  const test4 = await testAPIRoute(TEST_PROMPTS[3]);
  if (test4.success) {
    results.passed++;
    results.details.push({ test: 'Simple Object', status: 'PASSED', source: test4.source });
  } else {
    results.failed++;
    results.details.push({ test: 'Simple Object', status: 'FAILED', error: test4.error });
  }

  // Summary
  logSection('📊 Test Results Summary');
  
  log(`Total Tests: ${results.total}`, 'bright');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  console.log('\nDetailed Results:');
  results.details.forEach((detail, index) => {
    const statusColor = detail.status === 'PASSED' ? 'green' : 'red';
    log(`  ${index + 1}. ${detail.test}: ${detail.status}`, statusColor);
    if (detail.source) {
      log(`     Source: ${detail.source}`, 'cyan');
    }
    if (detail.error) {
      log(`     Error: ${detail.error}`, 'red');
    }
  });

  // Check if Gemini is being used
  const geminiTests = results.details.filter(d => d.source === 'gemini');
  if (geminiTests.length > 0) {
    log(`\n✅ Gemini is being used for ${geminiTests.length} test(s)`, 'green');
  } else {
    log(`\n⚠️  Warning: No tests used Gemini as the source`, 'yellow');
    log(`   Check IMAGE_GENERATION_PROVIDER environment variable`, 'yellow');
  }

  // Final verdict
  console.log('\n' + '='.repeat(60));
  if (results.failed === 0) {
    log('🎉 All tests passed!', 'green');
  } else {
    log(`⚠️  ${results.failed} test(s) failed`, 'yellow');
  }
  console.log('='.repeat(60) + '\n');

  return results.failed === 0;
}

// Run tests
if (require.main === module) {
  runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`\n❌ Fatal error: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runTests, testAPIRoute };














































