# Deploy Storage Rules - Quick Fix

## You DON'T Need Admin SDK! ✅

The client-side upload should work because the Storage rules already allow authenticated users to upload to their own paths.

## Deploy Storage Rules

**Option 1: Firebase Console (Easiest)**

1. Go to: https://console.firebase.google.com/project/greenlitai/storage/rules
2. Copy the contents of `storage.rules` file
3. Paste into the Firebase Console
4. Click **"Publish"**

**Option 2: Firebase CLI**

1. Run in terminal: `firebase login` (follow the prompts)
2. Then: `firebase deploy --only storage:rules`

## Verify Rules Are Deployed

After deploying, your Storage rules should match `storage.rules` in this repo:
- ✅ `users/{userId}/images/{imageId}` - allows authenticated writes
- ✅ Public read (for sharing)

## Test It

1. Generate an image in the app
2. Check console logs - you should see:
   - "Uploading image to Firebase Storage"
   - "Image uploaded to Storage!"
   - "Saving frame update to Firestore with Storage URL"
3. Refresh the page
4. Image should persist! ✅

## Why Client-Side Works

- User is authenticated ✅
- Storage rules allow authenticated uploads ✅
- Path matches rule pattern ✅
- **No Admin SDK needed!**
