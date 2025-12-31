# Deploy Storage Rules - Step by Step

## Method 1: Firebase Console (Fastest - 2 minutes)

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/project/greenlitai/storage/rules

2. **Copy Rules:**
   Copy everything below (lines 1-28) and paste into the console:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User videos
    match /users/{userId}/videos/{video} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User generated images (for caching and pre-production)
    match /users/{userId}/images/{imageId} {
      // Public read (for sharing via investor materials, etc.)
      allow read: if true;
      // Only owner can write
      allow write: if request.auth != null && request.auth.uid == userId;
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

3. **Click "Publish"** button at the top

4. **Done!** ✅ Rules are deployed

## Method 2: Firebase CLI (If you prefer command line)

Run these commands in your terminal:

```bash
cd /Users/yohan/Documents/reeled-ai-openai
firebase login
firebase deploy --only storage:rules
```

## Verify Deployment

After deploying, test by generating an image. You should see in console:
- ✅ "Uploading image to Firebase Storage"
- ✅ "Image uploaded to Storage!"
- ✅ No "permission denied" errors

## That's It!

Once rules are deployed, client-side uploads will work without Admin SDK! 🎉





































