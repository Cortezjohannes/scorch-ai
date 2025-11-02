'use client';

import { db, auth, storage } from './firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadString } from 'firebase/storage';

/**
 * Utility function to migrate data from localStorage to Firebase
 * @param userId The authenticated user's ID
 */
export async function migrateLocalStorageToFirebase(userId: string) {
  if (!userId) {
    console.error('User ID is required for migration');
    return { success: false, error: 'User ID is required' };
  }

  try {
    // Get all localStorage items
    const projectsData = localStorage.getItem('projects');
    const videosData = localStorage.getItem('videos');
    const userPreferences = localStorage.getItem('userPreferences');

    // Create user document reference
    const userRef = doc(db, 'users', userId);
    
    // Check if user document exists
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(userRef, {
        createdAt: new Date(),
        lastLogin: new Date()
      });
    }

    // Migrate projects if they exist
    if (projectsData) {
      const projects = JSON.parse(projectsData);
      const projectsRef = collection(db, 'users', userId, 'projects');
      
      for (const project of projects) {
        await setDoc(doc(projectsRef, project.id), {
          ...project,
          updatedAt: new Date(),
          migratedFromLocal: true
        });
      }
    }

    // Migrate videos if they exist
    if (videosData) {
      const videos = JSON.parse(videosData);
      const videosRef = collection(db, 'users', userId, 'videos');
      
      for (const video of videos) {
        // Save video metadata to Firestore
        await setDoc(doc(videosRef, video.id), {
          ...video,
          updatedAt: new Date(),
          migratedFromLocal: true
        });
        
        // If video has a dataUrl, upload to Storage
        if (video.dataUrl) {
          const storageRef = ref(storage, `users/${userId}/videos/${video.id}`);
          await uploadString(storageRef, video.dataUrl, 'data_url');
          
          // Update the document with the storage reference
          await setDoc(doc(videosRef, video.id), {
            storageUri: `users/${userId}/videos/${video.id}`,
            hasDataUrl: true
          }, { merge: true });
        }
      }
    }

    // Migrate user preferences if they exist
    if (userPreferences) {
      const preferences = JSON.parse(userPreferences);
      await setDoc(doc(userRef, 'preferences'), {
        ...preferences,
        updatedAt: new Date()
      });
    }

    return { success: true, message: 'Data migration completed successfully' };
  } catch (error: any) {
    console.error('Error during migration:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if a user has already migrated their data
 * @param userId The authenticated user's ID
 */
export async function hasMigratedData(userId: string): Promise<boolean> {
  if (!userId) return false;
  
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return false;
    
    const preferencesRef = doc(userRef, 'preferences');
    const preferencesDoc = await getDoc(preferencesRef);
    
    return preferencesDoc.exists() && preferencesDoc.data()?.migratedFromLocal === true;
  } catch (error: any) {
    console.error('Error checking migration status:', error);
    return false;
  }
} 