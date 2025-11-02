# Firebase Data Model for Reeled AI

This document outlines the data model used in Firebase for the Reeled AI application.

## Firestore Collections

### Users Collection

**Path**: `/users/{userId}`

This collection stores user information.

```typescript
interface User {
  name: string;              // User's display name
  email: string;             // User's email address
  profilePicture?: string;   // URL to user's profile image
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    defaultStage?: 'preproduction' | 'production' | 'postproduction';
  };
  lastActive: Timestamp;     // When the user was last active
  completedOnboarding: boolean; // Whether the user has completed onboarding
}
```

### Projects Collection

**Path**: `/projects/{projectId}`

This collection stores project information.

```typescript
interface Project {
  userId: string;            // ID of the user who owns this project
  title: string;             // Project title
  synopsis: string;          // Project synopsis
  theme: string;             // Project theme
  thumbnail?: string;        // URL to project thumbnail
  stage: 'preproduction' | 'production' | 'postproduction'; // Current project stage
  status: 'in-progress' | 'completed' | 'archived'; // Project status
  createdAt: Timestamp;      // When the project was created
  updatedAt: Timestamp;      // When the project was last updated
  lastViewedAt: Timestamp;   // When the project was last viewed
  videos?: string[];         // Array of video IDs associated with this project
  generatedContent?: {
    narrative?: any;
    storyboard?: any;
    script?: any;
    casting?: any;
    visual?: any;
    // Other generated content
  };
}
```

### User Metadata Collection

**Path**: `/users/{userId}/metadata/videos`

This collection stores metadata about user's videos.

```typescript
interface VideoMetadata {
  videos: Array<{
    id: string;              // Video ID (matches Storage path)
    name: string;            // Original filename
    uploadDate: Timestamp;   // When the video was uploaded
    size: number;            // File size in bytes
    type: string;            // MIME type
    status: 'uploading' | 'processing' | 'ready' | 'error'; // Processing status
    duration?: number;       // Video duration in seconds
    thumbnail?: string;      // URL to video thumbnail
    projectId?: string;      // ID of associated project (if any)
    metadata?: {
      fps?: number;          // Frames per second
      resolution?: string;   // Video resolution
      codec?: string;        // Video codec
      // Other technical metadata
    };
  }>;
}
```

## Firebase Storage Structure

### User Videos

**Path**: `/users/{userId}/videos/{videoId}`

Stores video files uploaded by users.

### Thumbnails

**Path**: `/thumbnails/{userId}/{filename}`

Stores thumbnail images for projects and videos.

## Relationships

- Each user can have multiple projects (one-to-many)
- Each project belongs to one user (many-to-one)
- Projects can have multiple videos (one-to-many)
- Videos can belong to one project (many-to-one)

## Queries

Common queries used in the application:

1. Get a user's projects:
   ```javascript
   const projectsRef = collection(db, 'projects');
   const q = query(projectsRef, where('userId', '==', userId));
   ```

2. Get videos for a specific project:
   ```javascript
   const userVideosRef = doc(db, 'users', userId, 'metadata', 'videos');
   const videoMetadata = (await getDoc(userVideosRef)).data().videos;
   const projectVideos = videoMetadata.filter(v => v.projectId === projectId);
   ```

3. Get a user's profile:
   ```javascript
   const userRef = doc(db, 'users', userId);
   const userProfile = await getDoc(userRef);
   ```

## Indexing

The following indexes should be created for optimal performance:

1. Collection: `projects`
   - Fields indexed: `userId` (Ascending), `createdAt` (Descending)

2. Collection: `projects`
   - Fields indexed: `userId` (Ascending), `updatedAt` (Descending)

3. Collection: `projects`
   - Fields indexed: `userId` (Ascending), `status` (Ascending), `updatedAt` (Descending)

## Data Migration

When migrating from localStorage to Firebase, use the migration script in `scripts/migrate-localstorage-to-firebase.js`. This script handles:

1. User data migration
2. Project data migration 
3. Video metadata migration

Note that the migration only transfers metadata for videos, not the actual video files which will need to be re-uploaded.

## Security

Security rules in `firebase-security-rules.md` ensure that:

1. Users can only access their own data
2. Projects can only be accessed by their creator
3. Videos can only be accessed by their owner

## Best Practices

1. Always use transactions when updating multiple documents that depend on each other
2. Keep documents small to improve read performance
3. Use subcollections for data that grows unbounded
4. Use batch writes when updating multiple documents atomically 