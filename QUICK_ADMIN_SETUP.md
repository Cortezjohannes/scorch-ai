# Quick Firebase Admin SDK Setup

## What You Need to Do

### Step 1: Get Service Account JSON File

1. Go to: https://console.firebase.google.com/project/greenlitai/settings/serviceaccounts/adminsdk
2. Click **"Generate new private key"**
3. Click **"Generate key"** in the dialog
4. A JSON file will download

### Step 2: Place the File

```bash
# Create the directory
mkdir -p lib/firebase-admin

# Move your downloaded JSON file there (replace with actual filename)
mv ~/Downloads/greenlitai-firebase-adminsdk-*.json lib/firebase-admin/serviceAccountKey.json
```

### Step 3: Restart Dev Server

```bash
npm run dev
```

You should see:
```
✅ Firebase Admin SDK initialized from service account file
```

### Step 4: Done!

Now when you generate images:
- ✅ Images upload directly to Firebase Storage via Admin SDK
- ✅ Only Storage URLs are saved to Firestore (no base64!)
- ✅ Images persist after refresh

## Alternative: Environment Variables

If you prefer environment variables (better for production), see `FIREBASE_ADMIN_SETUP.md` for detailed instructions.

## Troubleshooting

**"Firebase Admin SDK not initialized" error:**
- Make sure the JSON file is at: `lib/firebase-admin/serviceAccountKey.json`
- Check the filename is exactly `serviceAccountKey.json`
- Restart your dev server

**"Permission denied" error:**
- Service account needs "Storage Admin" role
- Check Firebase Console → IAM & Admin → Service Accounts





































