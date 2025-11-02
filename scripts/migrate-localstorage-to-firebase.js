#!/usr/bin/env node

/**
 * This script migrates data from localStorage to Firebase.
 * Run this script in the browser console after setting up Firebase.
 * 
 * It handles:
 * 1. User data migration
 * 2. Project data migration
 * 3. Video data migration (if any)
 */

// Function to initialize Firebase from environment variables
function initializeFirebase() {
  const firebaseConfig = {
    apiKey: localStorage.getItem('FIREBASE_API_KEY'),
    authDomain: localStorage.getItem('FIREBASE_AUTH_DOMAIN'),
    projectId: localStorage.getItem('FIREBASE_PROJECT_ID'),
    storageBucket: localStorage.getItem('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: localStorage.getItem('FIREBASE_MESSAGING_SENDER_ID'),
    appId: localStorage.getItem('FIREBASE_APP_ID'),
    measurementId: localStorage.getItem('FIREBASE_MEASUREMENT_ID')
  };
  
  // Initialize Firebase if not already initialized
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  return {
    auth: firebase.auth(),
    db: firebase.firestore(),
    storage: firebase.storage()
  };
}

// Function to authenticate user
async function authenticateUser(email, password) {
  const { auth } = initializeFirebase();
  
  try {
    // Sign in with email and password
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('User authenticated successfully:', userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    // If user doesn't exist, create a new account
    if (error.code === 'auth/user-not-found') {
      console.log('User not found, creating new account...');
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      console.log('User created successfully:', userCredential.user.email);
      return userCredential.user;
    }
    console.error('Authentication error:', error);
    throw error;
  }
}

// Function to migrate user data
async function migrateUserData(firebaseUser) {
  const { db } = initializeFirebase();
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('reeled_auth_user') || '{}');
  
  if (!userData || !userData.id) {
    console.log('No user data found in localStorage');
    return;
  }
  
  console.log('Migrating user data for:', userData.email);
  
  // Prepare user data for Firestore
  const userDocData = {
    name: userData.name || firebaseUser.displayName || 'User',
    email: userData.email || firebaseUser.email,
    profilePicture: userData.profilePicture || firebaseUser.photoURL,
    preferences: userData.preferences || {
      theme: 'dark',
      notifications: true,
      defaultStage: 'preproduction'
    },
    lastActive: firebase.firestore.Timestamp.now(),
    completedOnboarding: userData.completedOnboarding || false
  };
  
  // Save user data to Firestore
  try {
    await db.collection('users').doc(firebaseUser.uid).set(userDocData);
    console.log('User data migrated successfully');
    
    // Update the user's display name in Firebase Auth if needed
    if (userData.name && userData.name !== firebaseUser.displayName) {
      await firebaseUser.updateProfile({
        displayName: userData.name
      });
      console.log('User display name updated in Firebase Auth');
    }
  } catch (error) {
    console.error('Error migrating user data:', error);
  }
  
  return userData;
}

// Function to migrate project data
async function migrateProjects(firebaseUser, userData) {
  const { db } = initializeFirebase();
  
  if (!userData || !userData.projects || !userData.projects.length) {
    console.log('No projects found to migrate');
    return;
  }
  
  console.log(`Migrating ${userData.projects.length} projects...`);
  
  const projectPromises = userData.projects.map(async (project) => {
    if (!project.id) {
      console.warn('Skipping project with no ID:', project);
      return null;
    }
    
    try {
      // Convert dates to Firestore Timestamps
      const createdAt = project.createdAt 
        ? firebase.firestore.Timestamp.fromDate(new Date(project.createdAt))
        : firebase.firestore.Timestamp.now();
      
      const updatedAt = project.updatedAt
        ? firebase.firestore.Timestamp.fromDate(new Date(project.updatedAt))
        : firebase.firestore.Timestamp.now();
      
      const lastViewedAt = project.lastViewedAt
        ? firebase.firestore.Timestamp.fromDate(new Date(project.lastViewedAt))
        : firebase.firestore.Timestamp.now();
      
      // Prepare project data
      const projectData = {
        userId: firebaseUser.uid,
        title: project.title || 'Untitled Project',
        synopsis: project.synopsis || '',
        theme: project.theme || '',
        thumbnail: project.thumbnail || '',
        stage: project.stage || 'preproduction',
        status: project.status || 'in-progress',
        createdAt,
        updatedAt,
        lastViewedAt,
        generatedContent: project.generatedContent || {}
      };
      
      // Save project to Firestore
      let projectRef;
      if (project.id.startsWith('project-')) {
        // Create a new document with auto-generated ID
        projectRef = db.collection('projects').doc();
      } else {
        // Use the existing ID (if not using the localStorage format)
        projectRef = db.collection('projects').doc(project.id);
      }
      
      await projectRef.set(projectData);
      console.log(`Project migrated: ${project.title || 'Untitled'} (${projectRef.id})`);
      
      return {
        ...project,
        newId: projectRef.id
      };
    } catch (error) {
      console.error(`Error migrating project ${project.id}:`, error);
      return null;
    }
  });
  
  const results = await Promise.all(projectPromises);
  const migratedProjects = results.filter(Boolean);
  console.log(`Successfully migrated ${migratedProjects.length} out of ${userData.projects.length} projects`);
  
  return migratedProjects;
}

// Function to migrate videos
async function migrateVideos(firebaseUser, userData) {
  const { db, storage } = initializeFirebase();
  
  // Check if there's video data in localStorage
  // This depends on how video data was stored
  const videoData = JSON.parse(localStorage.getItem('reeled_videos') || '[]');
  
  if (!videoData || !videoData.length) {
    console.log('No videos found to migrate');
    return [];
  }
  
  console.log(`Found ${videoData.length} videos to migrate`);
  console.log('NOTE: This script cannot migrate actual video files, only metadata.');
  console.log('Video files will need to be re-uploaded manually.');
  
  // Create videos metadata document
  const videoMetadataRef = db.collection('users').doc(firebaseUser.uid)
    .collection('metadata').doc('videos');
  
  const videosMetadata = videoData.map(video => ({
    id: video.id,
    name: video.name,
    uploadDate: firebase.firestore.Timestamp.now(),
    size: video.size || 0,
    type: video.type || 'video/mp4',
    status: 'ready',
    duration: video.duration,
    thumbnail: video.thumbnail
  }));
  
  try {
    await videoMetadataRef.set({ videos: videosMetadata });
    console.log(`Video metadata migrated for ${videosMetadata.length} videos`);
    return videosMetadata;
  } catch (error) {
    console.error('Error migrating video metadata:', error);
    return [];
  }
}

// Main migration function
async function migrateToFirebase(email, password) {
  try {
    console.log('----- Starting migration from localStorage to Firebase -----');
    
    // Authenticate user
    const firebaseUser = await authenticateUser(email, password);
    
    // Migrate user data
    const userData = await migrateUserData(firebaseUser);
    
    // Migrate projects
    const migratedProjects = await migrateProjects(firebaseUser, userData);
    
    // Migrate videos
    const migratedVideos = await migrateVideos(firebaseUser, userData);
    
    console.log('----- Migration completed -----');
    console.log(`User data: ${userData ? 'Migrated' : 'None'}`);
    console.log(`Projects: ${migratedProjects.length} migrated`);
    console.log(`Videos: ${migratedVideos.length} metadata entries migrated`);
    console.log('NOTE: Video files need to be re-uploaded manually.');
    
    return {
      user: userData,
      projects: migratedProjects,
      videos: migratedVideos
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return null;
  }
}

// When running in a browser console, call this function with:
// migrateToFirebase('your-email@example.com', 'your-password');

// If running as a Node.js script:
if (typeof window === 'undefined' && require.main === module) {
  const readline = require('readline');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Enter email: ', (email) => {
    rl.question('Enter password: ', async (password) => {
      try {
        await migrateToFirebase(email, password);
      } catch (error) {
        console.error('Migration script error:', error);
      } finally {
        rl.close();
      }
    });
  });
}

// Export the function for module usage
if (typeof module !== 'undefined') {
  module.exports = { migrateToFirebase };
} 