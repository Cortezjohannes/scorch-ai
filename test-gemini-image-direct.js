/**
 * Direct test of Gemini Image Generation Service
 * Tests the service module directly without needing the API server
 */

require('dotenv').config({ path: '.env.local' });

// Note: This requires the service to be importable
// We'll use dynamic import for ES modules

async function testDirectService() {
  console.log('🧪 Testing Gemini Image Generation Service Directly\n');
  console.log('='.repeat(60) + '\n');

  // Check environment
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    console.error('   Make sure .env.local file exists and contains GEMINI_API_KEY');
    process.exit(1);
  }

  console.log(`✅ API Key found: ${apiKey.substring(0, 10)}... (${apiKey.length} characters)\n`);

  try {
    // Try to import the service
    console.log('📦 Importing Gemini Image Generation Service...');
    const { generateImageWithGemini } = await import('./src/services/gemini-image-generator.ts');
    console.log('✅ Service imported successfully\n');

    // Test 1: Simple image generation
    console.log('Test 1: Simple Image Generation');
    console.log('─'.repeat(60));
    const testPrompt1 = 'A simple red apple on a white background';
    console.log(`Prompt: "${testPrompt1}"\n`);

    try {
      const result1 = await generateImageWithGemini(testPrompt1, {
        aspectRatio: '1:1',
        quality: 'standard',
        style: 'natural'
      });

      if (result1.success && result1.imageUrl) {
        console.log('✅ Test 1 PASSED');
        console.log(`   Model: ${result1.metadata?.model || 'unknown'}`);
        console.log(`   Generation time: ${result1.metadata?.generationTime || 0}ms`);
        console.log(`   Image URL type: ${result1.imageUrl.startsWith('data:') ? 'Data URL' : 'External URL'}`);
        console.log(`   Image URL length: ${result1.imageUrl.length} characters\n`);
      } else {
        console.log('❌ Test 1 FAILED');
        console.log(`   Error: ${result1.error || 'Unknown error'}\n`);
      }
    } catch (error) {
      console.log('❌ Test 1 FAILED');
      console.log(`   Error: ${error.message}\n`);
    }

    // Test 2: Character portrait
    console.log('Test 2: Character Portrait');
    console.log('─'.repeat(60));
    const testPrompt2 = 'Professional headshot portrait of a character, studio lighting';
    console.log(`Prompt: "${testPrompt2}"\n`);

    try {
      const result2 = await generateImageWithGemini(testPrompt2, {
        aspectRatio: '1:1',
        quality: 'standard',
        style: 'natural'
      });

      if (result2.success && result2.imageUrl) {
        console.log('✅ Test 2 PASSED');
        console.log(`   Model: ${result2.metadata?.model || 'unknown'}`);
        console.log(`   Generation time: ${result2.metadata?.generationTime || 0}ms\n`);
      } else {
        console.log('❌ Test 2 FAILED');
        console.log(`   Error: ${result2.error || 'Unknown error'}\n`);
      }
    } catch (error) {
      console.log('❌ Test 2 FAILED');
      console.log(`   Error: ${error.message}\n`);
    }

    // Test 3: Storyboard frame
    console.log('Test 3: Storyboard Frame');
    console.log('─'.repeat(60));
    const testPrompt3 = 'Cinematic storyboard frame, medium shot, dramatic scene, black and white';
    console.log(`Prompt: "${testPrompt3}"\n`);

    try {
      const result3 = await generateImageWithGemini(testPrompt3, {
        aspectRatio: '16:9',
        quality: 'standard',
        style: 'natural'
      });

      if (result3.success && result3.imageUrl) {
        console.log('✅ Test 3 PASSED');
        console.log(`   Model: ${result3.metadata?.model || 'unknown'}`);
        console.log(`   Generation time: ${result3.metadata?.generationTime || 0}ms\n`);
      } else {
        console.log('❌ Test 3 FAILED');
        console.log(`   Error: ${result3.error || 'Unknown error'}\n`);
      }
    } catch (error) {
      console.log('❌ Test 3 FAILED');
      console.log(`   Error: ${error.message}\n`);
    }

    console.log('='.repeat(60));
    console.log('✅ Direct service test completed\n');

  } catch (error) {
    console.error('❌ Failed to import service:', error.message);
    console.error('\nNote: This test requires TypeScript compilation or a build step.');
    console.error('Try running the API route test instead: node test-gemini-image-generation.js\n');
    process.exit(1);
  }
}

// Run test
testDirectService()
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  });






































