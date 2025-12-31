# Firebase Admin SDK Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get Service Account Key

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **greenlitai**
3. Click ⚙️ **Project Settings** (gear icon)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Click **Generate Key** in the popup
7. A JSON file will download

### Step 2: Place the Key File

Move the downloaded JSON file to:
```
lib/firebase-admin/serviceAccountKey.json
```

**Important:** The file is already in `.gitignore` - it won't be committed to git.

### Step 3: Restart Your Dev Server

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Verify It Works

Look for this message in your server console:
```
✅ Firebase Admin SDK initialized from service account file
```

If you see this, you're all set! 🎉

## Alternative: Environment Variables (For Production)

Instead of using a file, you can set these in `.env.local`:

```bash
FIREBASE_ADMIN_PROJECT_ID=greenlitai
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@greenlitai.iam.gserviceaccount.com
```

Get these values from the service account JSON file you downloaded.

## Troubleshooting

### "Firebase Admin SDK not initialized"
- Check that `serviceAccountKey.json` exists in `lib/firebase-admin/`
- Verify the JSON file is valid (not corrupted)
- Check server console for specific error messages

### "Story bible not found" error
- Make sure Firebase Admin SDK initialized successfully
- Check that the story bible exists in Firestore
- Verify the user ID matches the story bible owner

### Still having issues?
Check the server console logs - they'll show exactly what's happening during initialization.




































