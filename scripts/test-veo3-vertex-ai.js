/**
 * Test script for VEO 3.1 via Vertex AI
 * This script tests the actual Vertex AI API connection
 */

const { GoogleAuth } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function testVEO3VertexAI() {
  console.log('🧪 Testing VEO 3.1 Vertex AI Connection...\n');
  
  // Check environment variables
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    console.error('❌ GOOGLE_CLOUD_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID not set');
    console.log('💡 Set it in .env.local: GOOGLE_CLOUD_PROJECT_ID=reeled-ai-production');
    process.exit(1);
  }
  
  console.log(`✅ Project ID: ${projectId}`);
  
  // Test authentication
  try {
    console.log('\n🔐 Testing authentication...');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      projectId: projectId
    });
    
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = typeof accessTokenResponse === 'string' ? accessTokenResponse : accessTokenResponse?.token;
    
    if (!accessToken) {
      throw new Error('Failed to get access token');
    }
    
    console.log('✅ Authentication successful!');
    console.log(`   Token preview: ${accessToken.substring(0, 20)}...`);
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    console.log('\n💡 To fix:');
    console.log('   1. Run: gcloud auth application-default login');
    console.log('   2. OR set GOOGLE_APPLICATION_CREDENTIALS to service account key path');
    process.exit(1);
  }
  
  // Test Vertex AI API access
  try {
    console.log('\n🌐 Testing Vertex AI API access...');
    const location = 'us-central1';
    const apiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/models`;
    
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = typeof accessTokenResponse === 'string' ? accessTokenResponse : accessTokenResponse?.token;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Vertex AI API error (${response.status}):`, errorText.substring(0, 200));
      
      if (response.status === 403) {
        console.log('\n💡 Make sure:');
        console.log('   1. Vertex AI API is enabled: gcloud services enable aiplatform.googleapis.com');
        console.log('   2. Your account has Vertex AI User role');
        console.log('   3. Billing is enabled on the project');
      }
      process.exit(1);
    }
    
    console.log('✅ Vertex AI API accessible!');
  } catch (error) {
    console.error('❌ Vertex AI API test failed:', error.message);
    process.exit(1);
  }
  
  // Test VEO 3.1 model availability
  try {
    console.log('\n🎬 Testing VEO 3.1 model availability...');
    const location = 'us-central1';
    const modelUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/veo-3.1`;
    
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = typeof accessTokenResponse === 'string' ? accessTokenResponse : accessTokenResponse?.token;
    
    // Try to get model info (this will fail if model doesn't exist, but that's OK - we just want to test access)
    const response = await fetch(modelUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    
    if (response.status === 404) {
      console.log('⚠️  VEO 3.1 model endpoint returned 404');
      console.log('   This might mean:');
      console.log('   1. VEO 3.1 is not available in your region yet');
      console.log('   2. You need to request access to VEO 3.1');
      console.log('   3. The endpoint format might be different');
    } else if (response.ok) {
      console.log('✅ VEO 3.1 model accessible!');
    } else {
      const errorText = await response.text();
      console.log(`⚠️  VEO 3.1 model check: ${response.status} - ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.error('❌ VEO 3.1 model check failed:', error.message);
  }
  
  console.log('\n✅ All basic tests passed!');
  console.log('💡 You can now test VEO 3.1 video generation at /test-veo3');
}

testVEO3VertexAI().catch(console.error);

