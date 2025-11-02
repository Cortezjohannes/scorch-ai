# Firestore Permission Fix Instructions

## Problem
Episodes are failing to save with "permission-denied" error even though the user is authenticated.

## Root Cause
The Firestore security rules had conflicting allow statements that were causing permission issues.

## Solution Applied

### 1. Updated Firestore Rules (`firestore.rules`)
Fixed the conflicting security rules for episodes:
```
allow read: if request.auth != null && request.auth.uid == userId;
allow create, update: if request.auth != null && 
                        request.auth.uid == userId &&
                        request.resource.data.storyBibleId == storyBibleId;
allow delete: if request.auth != null && request.auth.uid == userId;
```

### 2. Added Data Sanitization (`src/services/episode-service.ts`)
- Removes `undefined` values that Firestore rejects
- Properly sanitizes nested objects
- Adds detailed logging for debugging

## **REQUIRED: Deploy the Rules**

You need to deploy the updated Firestore rules manually:

```bash
# Re-authenticate with Firebase
firebase login --reauth

# Deploy the updated rules
firebase deploy --only firestore:rules
```

## Test After Deployment
1. Refresh your browser to get the updated code
2. Try generating an episode again
3. Check the console logs for detailed save information
4. The save should now succeed

## If Still Failing
Check the console logs for:
- `storyBibleIdType` and `pathStoryBibleIdType` (should both be "string")
- `idsMatch` (should be true)
- `allKeys` (list of all fields being saved)

If there are still issues, the detailed logs will show exactly what data is being sent to Firestore.

