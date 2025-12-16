// Firebase configuration and initialization
// Works on both server (API routes) and client (components)
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth, type NextOrObserver, type User } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Detect server-side rendering
const isServer = typeof window === 'undefined';

// Create mock implementations for Firebase services
const createMockFirestore = () => {
  const mockDb = {} as any;
  mockDb.collection = () => ({
    doc: () => ({
      get: async () => ({
        exists: false,
        data: () => ({})
      })
    })
  });
  return mockDb as Firestore;
};

const createMockAuth = () => {
  const mockAuth = {} as any;
  mockAuth.currentUser = null;
  mockAuth.onAuthStateChanged = (observer: any) => {
    if (typeof observer === 'function') {
      observer(null);
    }
    return () => {};
  };
  mockAuth.signInWithEmailAndPassword = async () => ({ user: null });
  mockAuth.createUserWithEmailAndPassword = async () => ({ user: null });
  mockAuth.signOut = async () => {};
  return mockAuth as Auth;
};

const createMockStorage = () => {
  const mockStorage = {} as any;
  mockStorage.ref = () => ({
    put: async () => ({})
  });
  return mockStorage as FirebaseStorage;
};

// Initialize Firebase or mocks
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;
let app: any;

// Check if Firebase credentials are available
const hasFirebaseConfig = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'dummy-api-key';

// Initialize Firebase on both server and client
// Firebase v9+ client SDK works in Next.js API routes
if (!hasFirebaseConfig) {
  // No config: use mocks
  console.warn('Firebase disabled: Using mock implementation (missing credentials)');
  db = createMockFirestore();
  auth = createMockAuth();
  storage = createMockStorage();
  app = {};
} else {
  // Initialize real Firebase (works on both server and client)
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    const env = isServer ? 'server' : 'client';
    console.log(`🔥 Initializing Firebase on ${env}...`);
    console.log('  Project ID:', firebaseConfig.projectId);
    
    // Initialize Firebase
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize Firebase services
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    
    console.log(`✅ Firebase initialized successfully on ${env}!`);
    console.log('✅ Firestore, Auth, and Storage ready');
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    
    // Provide mock implementations on error
    db = createMockFirestore();
    auth = createMockAuth();
    storage = createMockStorage();
    app = {};
  }
}

export { app, auth, db, storage }; 