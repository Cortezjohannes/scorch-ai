# Firebase Admin SDK Setup Guide

This guide will help you set up Firebase Admin SDK so server-side API routes can upload images to Firebase Storage without requiring user authentication.

## Why Admin SDK?

The Admin SDK bypasses Firebase security rules and allows server-side operations (like uploading images in API routes) without needing an authenticated user. This solves the "permission denied" errors you were seeing.

## Step 1: Get Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **greenlitai**
3. Click the gear icon ⚙️ → **Project settings**
4. Go to the **Service accounts** tab
5. Click **Generate new private key** button
6. Click **Generate key** in the confirmation dialog
7. A JSON file will download - **SAVE THIS SECURELY!** It contains admin credentials

The JSON file looks like:
```json
{
  "type": "service_account",
  "project_id": "greenlitai",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@greenlitai.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

## Step 2: Choose Setup Method

You have **TWO options** for providing credentials:

### Option A: JSON File (Easier for Local Development) ✅ RECOMMENDED

1. Create the directory:
   ```bash
   mkdir -p lib/firebase-admin
   ```

2. Move your downloaded JSON file there:
   ```bash
   mv ~/Downloads/greenlitai-firebase-adminsdk-xxxxx-xxxxx.json lib/firebase-admin/serviceAccountKey.json
   ```

3. The file is already in `.gitignore` so it won't be committed

That's it! The code will automatically detect and use this file.

### Option B: Environment Variables (Better for Production/Deployment)

Extract these 3 values from the JSON file:

1. `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
2. `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (keep the `\n` characters!)
3. `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`

Add to `.env.local`:
```bash
FIREBASE_ADMIN_PROJECT_ID=greenlitai
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your full key here...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@greenlitai.iam.gserviceaccount.com
```

**Important:** The private key must be in quotes and keep the `\n` characters exactly as they are!

## Step 3: Verify Setup

The Admin SDK is already installed. Once you add the credentials, restart your dev server:

```bash
npm run dev
```

You should see in the console:
```
✅ Firebase Admin SDK initialized from service account file
```

Or:
```
✅ Firebase Admin SDK initialized from environment variables
```

## Step 4: Test It

Once set up, the image generation API will automatically:
1. Generate the image
2. Upload it to Firebase Storage using Admin SDK
3. Return the Storage URL (not base64!)

You'll see logs like:
```
📤 Starting Admin SDK Storage upload...
✅ Image uploaded to Storage via Admin SDK
```

## Security Notes

⚠️ **NEVER commit the service account JSON file or credentials to git!**
- The file is already in `.gitignore`
- For production, use environment variables or secret management
- The service account has admin access to your Firebase project

## Troubleshooting

**Error: "Cannot find module '../../lib/firebase-admin/serviceAccountKey.json'"**
- Make sure you created the file at the correct path
- Check the file name is exactly `serviceAccountKey.json`

**Error: "Error initializing Firebase Admin SDK"**
- Verify the JSON file is valid
- Check environment variables are set correctly (if using Option B)
- Make sure private key includes the `\n` characters

**Error: "Permission denied" or "Unauthorized"**
- Service account might not have Storage permissions
- Check Firebase Console → IAM & Admin → Service Accounts
- Ensure the service account has "Storage Admin" role

## Next Steps

After setup, images will be uploaded directly to Firebase Storage in the API route, and only Storage URLs will be saved to Firestore. No more base64 bloat!
