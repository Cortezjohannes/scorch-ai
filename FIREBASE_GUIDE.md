# Firebase Integration Guide for Reeled AI

This guide provides detailed instructions for setting up and integrating Firebase with the Reeled AI application.

## Prerequisites

1. **Google Account**: You must have a Google account to use Firebase.
2. **Reeled AI Application**: You should have the Reeled AI application codebase ready.
3. **npm**: You should have npm installed to manage dependencies.

## Step 1: Create a Firebase Project

1. **Visit the Firebase Console**: Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. **Create a Project**:
   - Click "Add Project"
   - Enter a project name (e.g., "Reeled AI")
   - Choose whether to enable Google Analytics (recommended)
   - Accept the terms and continue
   - Configure Google Analytics if applicable
   - Click "Create project"

## Step 2: Set Up Firebase Authentication

1. **Enable Authentication**:
   - In the Firebase Console, navigate to "Authentication"
   - Click "Get Started"
   - Enable the authentication methods you need:
     - Email/Password (required)
     - Google Sign-In (optional but recommended)
     - Other methods as needed
   - Configure each method according to your requirements

2. **Set Up Authorized Domains**:
   - Still in the Authentication section, navigate to the "Settings" tab
   - Add your domains to the "Authorized domains" list:
     - localhost (for development)
     - app.reeledai.com (for production)
     - Any other domains you'll use

## Step 3: Set Up Firestore Database

1. **Create a Firestore Database**:
   - In the Firebase Console, navigate to "Firestore Database"
   - Click "Create database"
   - Choose "Start in production mode" (recommended for real applications)
   - Select a location for your database (choose a region close to your users)
   - Click "Enable"

2. **Set Up Firestore Security Rules**:
   - In the Firestore Database section, navigate to the "Rules" tab
   - Update the rules to allow authenticated access:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow authenticated users to read and write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Allow authenticated users to read and write their own projects
       match /projects/{projectId} {
         allow read, write: if request.auth != null && 
                            resource.data.userId == request.auth.uid;
         allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
       }
       
       // Allow authenticated users to read and write their own videos
       match /videos/{videoId} {
         allow read, write: if request.auth != null && 
                            resource.data.userId == request.auth.uid;
         allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

## Step 4: Set Up Firebase Storage

1. **Create a Storage Bucket**:
   - In the Firebase Console, navigate to "Storage"
   - Click "Get started"
   - Choose "Start in production mode" (recommended)
   - Select a location for your storage (match your Firestore location)
   - Click "Done"

2. **Set Up Storage Security Rules**:
   - In the Storage section, navigate to the "Rules" tab
   - Update the rules to allow authenticated access:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Allow authenticated users to read and write their own files
       match /users/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Allow authenticated users to read and write their own project files
       match /projects/{projectId}/{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && 
                      firestore.get(/databases/(default)/documents/projects/$(projectId)).data.userId == request.auth.uid;
       }
       
       // Allow authenticated users to read and write their own video files
       match /videos/{videoId}/{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && 
                      firestore.get(/databases/(default)/documents/videos/$(videoId)).data.userId == request.auth.uid;
       }
     }
   }
   ```

## Step 5: Get Firebase Configuration

1. **Register Your Web App**:
   - In the Firebase Console, navigate to Project Overview
   - Click the web icon (</>) to add a web app
   - Enter a name for your app (e.g., "Reeled AI Web")
   - Register the app
   - Copy the Firebase configuration object (firebaseConfig)

2. **Add Firebase Config to Environment Variables**:
   - Update your `.env.local` file with the Firebase configuration values:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

## Step 6: Install Firebase SDK

1. **Install Firebase Packages**:
   ```bash
   npm install firebase
   ```

## Step 7: Initialize Firebase in Your Application

1. **Create a Firebase Configuration File**:
   - Create or update `src/lib/firebase.ts`:
   ```typescript
   import { initializeApp, getApps } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   import { getAuth } from 'firebase/auth';
   import { getStorage } from 'firebase/storage';

   const firebaseConfig = {
     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
     measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
   };

   // Initialize Firebase
   const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
   const db = getFirestore(app);
   const auth = getAuth(app);
   const storage = getStorage(app);

   export { db, auth, storage };
   ```

## Step 8: Create Firebase Utility Functions

1. **Create Authentication Utilities**:
   - Create or update `src/lib/auth.ts`:
   ```typescript
   import { 
     createUserWithEmailAndPassword, 
     signInWithEmailAndPassword, 
     signOut as firebaseSignOut,
     updateProfile,
     UserCredential,
     User
   } from 'firebase/auth';
   import { auth } from './firebase';

   export const signUp = async (email: string, password: string, displayName: string): Promise<UserCredential> => {
     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
     await updateProfile(userCredential.user, { displayName });
     return userCredential;
   };

   export const signIn = async (email: string, password: string): Promise<UserCredential> => {
     return signInWithEmailAndPassword(auth, email, password);
   };

   export const signOut = async (): Promise<void> => {
     return firebaseSignOut(auth);
   };

   export const getCurrentUser = (): User | null => {
     return auth.currentUser;
   };
   ```

2. **Create Firestore Data Utilities**:
   - Create or update `src/lib/database.ts`:
   ```typescript
   import { 
     collection, 
     doc, 
     setDoc, 
     getDoc, 
     getDocs, 
     query, 
     where,
     updateDoc,
     deleteDoc
   } from 'firebase/firestore';
   import { db } from './firebase';

   // User functions
   export const createUserProfile = async (userId: string, data: any) => {
     return setDoc(doc(db, 'users', userId), {
       ...data,
       createdAt: new Date(),
       updatedAt: new Date()
     });
   };

   export const getUserProfile = async (userId: string) => {
     const docRef = doc(db, 'users', userId);
     const docSnap = await getDoc(docRef);
     return docSnap.exists() ? docSnap.data() : null;
   };

   // Project functions
   export const createProject = async (projectData: any) => {
     const docRef = doc(collection(db, 'projects'));
     await setDoc(docRef, {
       ...projectData,
       id: docRef.id,
       createdAt: new Date(),
       updatedAt: new Date()
     });
     return docRef.id;
   };

   export const getUserProjects = async (userId: string) => {
     const q = query(collection(db, 'projects'), where('userId', '==', userId));
     const querySnapshot = await getDocs(q);
     return querySnapshot.docs.map(doc => doc.data());
   };

   export const getProject = async (projectId: string) => {
     const docRef = doc(db, 'projects', projectId);
     const docSnap = await getDoc(docRef);
     return docSnap.exists() ? docSnap.data() : null;
   };

   export const updateProject = async (projectId: string, data: any) => {
     const docRef = doc(db, 'projects', projectId);
     return updateDoc(docRef, {
       ...data,
       updatedAt: new Date()
     });
   };

   export const deleteProject = async (projectId: string) => {
     return deleteDoc(doc(db, 'projects', projectId));
   };

   // Video functions
   export const saveVideo = async (videoData: any) => {
     const docRef = doc(collection(db, 'videos'));
     await setDoc(docRef, {
       ...videoData,
       id: docRef.id,
       createdAt: new Date(),
       updatedAt: new Date()
     });
     return docRef.id;
   };

   export const getUserVideos = async (userId: string) => {
     const q = query(collection(db, 'videos'), where('userId', '==', userId));
     const querySnapshot = await getDocs(q);
     return querySnapshot.docs.map(doc => doc.data());
   };
   ```

3. **Create Storage Utilities**:
   - Create or update `src/lib/storage.ts`:
   ```typescript
   import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
   import { storage } from './firebase';

   export const uploadFile = async (file: File, path: string): Promise<string> => {
     const storageRef = ref(storage, path);
     await uploadBytes(storageRef, file);
     return getDownloadURL(storageRef);
   };

   export const uploadUserVideo = async (userId: string, file: File, filename: string): Promise<string> => {
     const path = `users/${userId}/videos/${filename}`;
     return uploadFile(file, path);
   };

   export const uploadProjectMedia = async (userId: string, projectId: string, file: File, filename: string): Promise<string> => {
     const path = `projects/${projectId}/media/${filename}`;
     return uploadFile(file, path);
   };

   export const deleteFile = async (path: string): Promise<void> => {
     const storageRef = ref(storage, path);
     return deleteObject(storageRef);
   };
   ```

## Step 9: Implement Authentication UI

1. **Create SignUp Component**:
   ```jsx
   'use client';
   import { useState } from 'react';
   import { signUp } from '@/lib/auth';
   import { createUserProfile } from '@/lib/database';
   import { useRouter } from 'next/navigation';

   const SignUpPage = () => {
     const [name, setName] = useState('');
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(false);
     const router = useRouter();

     const handleSignUp = async (e) => {
       e.preventDefault();
       setLoading(true);
       setError('');
       
       try {
         const userCredential = await signUp(email, password, name);
         await createUserProfile(userCredential.user.uid, {
           email,
           displayName: name,
           userId: userCredential.user.uid
         });
         router.push('/projects');
       } catch (err) {
         setError(err.message);
       } finally {
         setLoading(false);
       }
     };

     return (
       <div className="flex flex-col items-center justify-center min-h-screen p-4">
         <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
           <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
           {error && <div className="text-red-500 mb-4">{error}</div>}
           <form onSubmit={handleSignUp}>
             <div className="mb-4">
               <label className="block text-sm font-medium mb-1">Name</label>
               <input
                 type="text"
                 className="w-full p-2 border rounded"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 required
               />
             </div>
             <div className="mb-4">
               <label className="block text-sm font-medium mb-1">Email</label>
               <input
                 type="email"
                 className="w-full p-2 border rounded"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
             <div className="mb-4">
               <label className="block text-sm font-medium mb-1">Password</label>
               <input
                 type="password"
                 className="w-full p-2 border rounded"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
                 minLength={6}
               />
             </div>
             <button
               type="submit"
               className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
               disabled={loading}
             >
               {loading ? 'Creating Account...' : 'Sign Up'}
             </button>
           </form>
         </div>
       </div>
     );
   };

   export default SignUpPage;
   ```

2. **Create SignIn Component**:
   ```jsx
   'use client';
   import { useState } from 'react';
   import { signIn } from '@/lib/auth';
   import { useRouter } from 'next/navigation';

   const SignInPage = () => {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(false);
     const router = useRouter();

     const handleSignIn = async (e) => {
       e.preventDefault();
       setLoading(true);
       setError('');
       
       try {
         await signIn(email, password);
         router.push('/projects');
       } catch (err) {
         setError(err.message);
       } finally {
         setLoading(false);
       }
     };

     return (
       <div className="flex flex-col items-center justify-center min-h-screen p-4">
         <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
           <h1 className="text-2xl font-bold mb-4">Sign In</h1>
           {error && <div className="text-red-500 mb-4">{error}</div>}
           <form onSubmit={handleSignIn}>
             <div className="mb-4">
               <label className="block text-sm font-medium mb-1">Email</label>
               <input
                 type="email"
                 className="w-full p-2 border rounded"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
             <div className="mb-4">
               <label className="block text-sm font-medium mb-1">Password</label>
               <input
                 type="password"
                 className="w-full p-2 border rounded"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
             </div>
             <button
               type="submit"
               className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
               disabled={loading}
             >
               {loading ? 'Signing In...' : 'Sign In'}
             </button>
           </form>
         </div>
       </div>
     );
   };

   export default SignInPage;
   ```

## Step 10: Implement Data Migration Utility

Create a utility to migrate data from localStorage to Firebase when users sign in:

```typescript
// src/lib/dataMigration.ts
import { getCurrentUser } from './auth';
import { createProject, updateProject } from './database';
import { uploadProjectMedia } from './storage';

export const migrateLocalStorageToFirebase = async () => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Get projects from localStorage
  const localProjects = localStorage.getItem('projects');
  if (!localProjects) return;
  
  try {
    const projects = JSON.parse(localProjects);
    
    // Create each project in Firebase
    for (const project of projects) {
      // Create a new project in Firestore
      const projectId = await createProject({
        ...project,
        userId: user.uid
      });
      
      // If the project has videos or images, upload them to Storage
      if (project.videos && project.videos.length > 0) {
        // This would need to be adapted based on how your videos are stored
        // You may need to convert base64 to files first
      }
    }
    
    // Optionally, clear localStorage after migration
    // localStorage.removeItem('projects');
    
    return true;
  } catch (error) {
    console.error('Error migrating data to Firebase:', error);
    return false;
  }
};
```

## Step 11: Deploy to Firebase Hosting (Optional)

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**:
   ```bash
   firebase init hosting
   ```
   - Select your project
   - Choose your public directory (usually "out" for Next.js with static export)
   - Configure as a single-page app? (No for Next.js)
   - Set up automatic builds and deploys with GitHub? (Optional)

4. **Build Your Next.js Project**:
   ```bash
   npm run build
   ```

5. **Deploy to Firebase Hosting**:
   ```bash
   firebase deploy --only hosting
   ```

## Conclusion

Your Reeled AI application is now integrated with Firebase, providing secure authentication, real-time database capabilities, and cloud storage for your files. Users can now access their projects from any device and collaborate with others seamlessly.

For more information, refer to the [Firebase documentation](https://firebase.google.com/docs). 