#!/usr/bin/env node

/**
 * Firebase Connection Test Script
 * Tests Firebase initialization, Firestore, and Authentication
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDoc, doc, deleteDoc } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testFirebaseConnection() {
  log('\n🔥 Firebase Connection Test\n', 'blue');
  
  try {
    // Step 1: Check environment variables
    log('Step 1: Checking environment variables...', 'yellow');
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ];
    
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }
    log('✅ All environment variables present', 'green');
    
    // Step 2: Initialize Firebase
    log('\nStep 2: Initializing Firebase...', 'yellow');
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };
    
    const app = initializeApp(firebaseConfig);
    log(`✅ Firebase initialized (Project: ${firebaseConfig.projectId})`, 'green');
    
    // Step 3: Test Firestore connection
    log('\nStep 3: Testing Firestore connection...', 'yellow');
    const db = getFirestore(app);
    
    // Write test document
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Firebase connection test'
    };
    
    const testCollection = collection(db, 'connection_test');
    const docRef = await addDoc(testCollection, testData);
    log(`✅ Test document created (ID: ${docRef.id})`, 'green');
    
    // Read test document
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      log('✅ Test document read successfully', 'green');
      log(`   Data: ${JSON.stringify(docSnap.data())}`, 'blue');
    } else {
      throw new Error('Failed to read test document');
    }
    
    // Delete test document
    await deleteDoc(docRef);
    log('✅ Test document deleted', 'green');
    
    // Step 4: Test Authentication service
    log('\nStep 4: Testing Authentication service...', 'yellow');
    const auth = getAuth(app);
    log(`✅ Auth initialized (Domain: ${auth.config.authDomain})`, 'green');
    
    // Final summary
    log('\n' + '='.repeat(50), 'green');
    log('🎉 ALL TESTS PASSED!', 'green');
    log('='.repeat(50), 'green');
    log('\nFirebase is ready to use!', 'green');
    log('\nNext steps:', 'blue');
    log('1. Deploy Firestore rules: firebase deploy --only firestore:rules', 'blue');
    log('2. Start building the sharing feature!', 'blue');
    
    process.exit(0);
    
  } catch (error) {
    log('\n' + '='.repeat(50), 'red');
    log('❌ TEST FAILED', 'red');
    log('='.repeat(50), 'red');
    log(`\nError: ${error.message}`, 'red');
    
    if (error.code) {
      log(`Error code: ${error.code}`, 'red');
    }
    
    log('\nPossible solutions:', 'yellow');
    log('1. Check that all environment variables are set in .env.local', 'yellow');
    log('2. Verify Firestore Database is enabled in Firebase Console', 'yellow');
    log('3. Check Firebase project permissions', 'yellow');
    log('4. Make sure you\'re using the correct Firebase project', 'yellow');
    
    process.exit(1);
  }
}

// Run the test
testFirebaseConnection();







