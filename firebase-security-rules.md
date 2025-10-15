# Firebase Security Rules for Reeled AI

This document contains the security rules for Firestore and Storage to be applied to your Firebase project.

## Firestore Security Rules

Copy and paste these rules into the Firestore Rules section of your Firebase console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User metadata collections
      match /metadata/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Project rules - users can only access their own projects
    match /projects/{projectId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Storage Security Rules

Copy and paste these rules into the Storage Rules section of your Firebase console:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User videos
    match /users/{userId}/videos/{video} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public thumbnails that can be read by anyone but only written by owner
    match /thumbnails/{userId}/{filename} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## How to Apply These Rules

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. For Firestore rules:
   - Navigate to Firestore Database
   - Click on the "Rules" tab
   - Replace the existing rules with the Firestore rules above
   - Click "Publish"
4. For Storage rules:
   - Navigate to Storage
   - Click on the "Rules" tab
   - Replace the existing rules with the Storage rules above
   - Click "Publish"

## Security Considerations

These rules implement the following security principles:

1. Authentication required for most operations
2. Users can only access their own data
3. Users cannot access other users' data
4. Thumbnails are publicly readable but only the owner can modify them
5. Default deny for all other resources

Make sure to test these rules thoroughly in development before deploying to production. You can use the Firebase Emulator Suite to test your security rules locally. 