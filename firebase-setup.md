# Firebase Setup for Reeled AI

This document provides instructions for setting up Firebase for the Reeled AI application.

## Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter "reeled-ai" as the project name
4. Configure Google Analytics (optional)
5. Create the project

## Set Up Firestore Database

1. In the Firebase console, navigate to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location closest to your users
5. Click "Enable"

## Set Up Authentication

1. Navigate to "Authentication" in the Firebase console
2. Click "Get started"
3. Enable Email/Password authentication:
   - Click "Email/Password"
   - Enable "Email/Password"
   - Click "Save"
4. (Optional) Enable Google authentication:
   - Click "Google"
   - Enable "Google"
   - Configure your OAuth consent screen if needed
   - Add your app's domain to the authorized domains
   - Click "Save"

## Set Up Storage

1. Navigate to "Storage" in the Firebase console
2. Click "Get started"
3. Choose "Start in production mode"
4. Select a location closest to your users
5. Click "Done"

## Get Firebase Configuration

1. Navigate to "Project settings" (gear icon in the top left)
2. Scroll down to "Your apps" section
3. Click the web app icon (</>) to add a web app if you haven't already
4. Enter "reeled-ai-web" as the app nickname
5. Click "Register app"
6. Copy the Firebase configuration object shown
7. Add the configuration values to your `.env.local` file using the following keys:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
   ```

## Update Firestore Rules

1. Navigate to "Firestore Database" in the Firebase console
2. Click "Rules" tab
3. Update the rules to the following:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow authenticated users to read and write their own data
       match /users/{userId} {
         allow create, read, update, delete: if request.auth != null && request.auth.uid == userId;
         
         // Allow access to subcollections
         match /{subCollection}/{docId} {
           allow create, read, update, delete: if request.auth != null && request.auth.uid == userId;
         }
       }
       
       // Allow public access to shared resources if needed
       match /public/{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

## Update Storage Rules

1. Navigate to "Storage" in the Firebase console
2. Click "Rules" tab
3. Update the rules to the following:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Allow authenticated users to read and write their own data
       match /users/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Allow public access to shared resources if needed
       match /public/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

## Test Your Integration

1. Make sure you've added all environment variables to `.env.local`
2. Run the application: `npm run dev`
3. Test user authentication by signing up, signing in, and signing out
4. Verify data storage by creating and accessing data
5. Check Firebase console to ensure data is being stored correctly

## Monitoring and Logs

1. Navigate to "Functions" > "Logs" to monitor server-side functions
2. Use "Authentication" > "Users" to monitor user activity
3. Check "Storage" and "Firestore Database" for data storage monitoring
4. Set up Firebase Analytics for more detailed usage metrics 