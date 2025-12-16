/**
 * Test Azure OpenAI API in Deployment
 * This script helps diagnose why Azure might work locally but not in Cloud Run
 */

require('dotenv').config({ path: '.env.local' });

async function testAzureDeployment() {
  console.log('🔍 Testing Azure OpenAI Configuration for Deployment...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
  const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview';
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1';
  
  console.log(`  AZURE_OPENAI_ENDPOINT: ${azureEndpoint ? '✅ Set' : '❌ Missing'}`);
  if (azureEndpoint) {
    console.log(`    Value: ${azureEndpoint}`);
    // Check if endpoint ends with /
    if (!azureEndpoint.endsWith('/')) {
      console.log(`    ⚠️  Warning: Endpoint should end with '/'`);
    }
  }
  
  console.log(`  AZURE_OPENAI_API_KEY: ${azureApiKey ? `✅ Set (length: ${azureApiKey.length})` : '❌ Missing'}`);
  if (azureApiKey) {
    console.log(`    First 4 chars: ${azureApiKey.substring(0, 4)}`);
    console.log(`    Last 4 chars: ${azureApiKey.substring(azureApiKey.length - 4)}`);
  }
  
  console.log(`  AZURE_OPENAI_API_VERSION: ${azureApiVersion}`);
  console.log(`  AZURE_OPENAI_DEPLOYMENT: ${azureDeployment}`);
  console.log('');
  
  if (!azureEndpoint || !azureApiKey) {
    console.error('❌ Missing required Azure OpenAI configuration');
    return;
  }
  
  // Test 1: Construct URL
  console.log('🧪 Test 1: URL Construction...');
  const baseEndpoint = azureEndpoint.endsWith('/') ? azureEndpoint : `${azureEndpoint}/`;
  const url = `${baseEndpoint}openai/deployments/${azureDeployment}/chat/completions?api-version=${azureApiVersion}`;
  console.log(`  URL: ${url}`);
  console.log(`  ✅ URL constructed successfully\n`);
  
  // Test 2: Test API call
  console.log('🧪 Test 2: API Call Test...');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureApiKey
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Azure OpenAI is working!"' }
        ],
        temperature: 0.7,
        max_tokens: 50
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`  Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Could not parse error response' }));
      console.error(`  ❌ Test 2 FAILED`);
      console.error(`  Error:`, JSON.stringify(errorData, null, 2));
      
      // Common error diagnostics
      if (response.status === 401) {
        console.error(`  💡 Issue: Authentication failed - check API key`);
      } else if (response.status === 404) {
        console.error(`  💡 Issue: Deployment not found - check deployment name: ${azureDeployment}`);
      } else if (response.status === 403) {
        console.error(`  💡 Issue: Access forbidden - check API key permissions`);
      } else if (response.status === 429) {
        console.error(`  💡 Issue: Rate limit exceeded - check quota`);
      }
    } else {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      console.log(`  ✅ Test 2 PASSED`);
      console.log(`  Response: ${content}`);
    }
    
    console.log('');
  } catch (error) {
    console.error(`  ❌ Test 2 FAILED`);
    console.error(`  Error: ${error.message}`);
    
    if (error.name === 'AbortError') {
      console.error(`  💡 Issue: Request timed out - check network connectivity`);
    } else if (error.message.includes('fetch')) {
      console.error(`  💡 Issue: Network error - check endpoint URL and connectivity`);
    }
    console.log('');
  }
  
  // Test 3: Check Cloud Run secret access
  console.log('🧪 Test 3: Cloud Run Secret Configuration...');
  console.log(`  In Cloud Run, Azure API key should be stored in secret: azure-openai-api-key`);
  console.log(`  Check with: gcloud secrets versions access latest --secret="azure-openai-api-key"`);
  console.log(`  Verify secret exists: gcloud secrets list | grep azure-openai-api-key`);
  console.log('');
  
  // Summary
  console.log('📊 Summary:');
  console.log('  If tests pass locally but fail in Cloud Run:');
  console.log('  1. Verify secret is accessible: gcloud secrets describe azure-openai-api-key');
  console.log('  2. Check Cloud Run service account has secret access');
  console.log('  3. Verify environment variables are set in Cloud Run deployment');
  console.log('  4. Check Cloud Run logs: gcloud run services logs read reeled-ai-v2 --region=us-central1');
  console.log('');
}

// Run the test
testAzureDeployment().catch(console.error);









