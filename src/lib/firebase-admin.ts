/**
 * Firebase Admin SDK Initialization
 * 
 * This is for SERVER-SIDE ONLY operations (API routes, server components)
 * It bypasses security rules and has elevated permissions
 */

import admin from 'firebase-admin';

// Check if Admin SDK is already initialized
if (!admin.apps.length) {
  try {
    // Option 1: Use environment variables (recommended for production)
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    
    if (projectId && privateKey && clientEmail) {
      // Initialize with environment variables
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      });
      
      console.log('✅ Firebase Admin SDK initialized from environment variables');
    } else {
      // Option 2: Use service account JSON file (easier for local development)
      // The file should be at: lib/firebase-admin/serviceAccountKey.json
      try {
        const path = require('path');
        const fs = require('fs');
        const serviceAccountPath = path.join(process.cwd(), 'lib', 'firebase-admin', 'serviceAccountKey.json');
        
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
          
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: serviceAccount.project_id + '.appspot.com',
          });
          
          console.log('✅ Firebase Admin SDK initialized from service account file');
        } 
        // Option 3: Try Application Default Credentials (works in Cloud Run/GCE automatically)
        else {
          console.warn('⚠️  Firebase Admin SDK: Service account file not found');
          console.log('💡 Trying Application Default Credentials (works on Cloud Run)...');
          
          try {
            // Initialize with Application Default Credentials (ADC)
            // This works automatically in Cloud Run, GCE, GKE where service accounts are attached
            admin.initializeApp({
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId || 'greenlitai'}.appspot.com`,
            });
            
            console.log('✅ Firebase Admin SDK initialized using Application Default Credentials');
            console.log('💡 This works automatically in Cloud Run - no keys needed!');
          } catch (adcError: any) {
            console.warn('⚠️  Application Default Credentials not available:', adcError.message);
            console.warn('⚠️  Image uploads will fallback to client-side uploads');
            console.warn('💡 This is OK - client-side uploads will still work!');
          }
        }
      } catch (error: any) {
        console.warn('⚠️  Firebase Admin SDK: Could not load service account file:', error.message);
        console.warn('⚠️  Image uploads will fallback to client-side uploads');
      }
    }
  } catch (error: any) {
    // Don't throw - gracefully degrade to client-side uploads
    console.warn('⚠️  Firebase Admin SDK initialization failed:', error.message);
    console.warn('⚠️  This is OK - client-side uploads will be used instead');
    console.warn('💡 For Cloud Run: Admin SDK will work automatically via Application Default Credentials');
  }
}

// Export Admin SDK services only if initialized
export function getAdminStorage() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized. Client-side uploads will be used instead.');
  }
  return admin.storage();
}

export function getAdminFirestore() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized. Client-side operations will be used instead.');
  }
  return admin.firestore();
}

export function isAdminInitialized(): boolean {
  return admin.apps.length > 0;
}

// Legacy exports (will throw if not initialized)
export const adminStorage = admin.apps.length > 0 ? admin.storage() : null;
export const adminFirestore = admin.apps.length > 0 ? admin.firestore() : null;
export { admin };

