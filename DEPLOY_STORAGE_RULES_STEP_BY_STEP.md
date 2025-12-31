# Deploy Storage Rules - Exact Steps

## Where You Should Be

You should be on the **Storage Rules** page, NOT anywhere else. The console should show:
- A text editor with code
- A "Publish" button (orange/red button at top)
- NO "path/to/resource" field

## Exact Steps:

### Step 1: Navigate to Storage Rules
1. Go to: https://console.firebase.google.com/project/greenlitai/storage
2. Click on the **"Rules"** tab at the top (next to "Files" and "Usage")
3. You should see a code editor with existing rules

### Step 2: Replace All Rules
1. **Select ALL** text in the editor (Cmd+A or Ctrl+A)
2. **Delete** it
3. **Paste** the rules below:

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

### Step 3: Publish
1. Click the **"Publish"** button (orange/red button, usually at top right)
2. Confirm if asked
3. Wait for "Rules published successfully" message

## If You See "path/to/resource"

You're probably in the wrong place. Try:
1. Make sure you're on: Storage → Rules tab
2. NOT on: Storage → Files
3. NOT on: Storage → Usage

The Rules page should look like a code editor, NOT a form with fields.





































