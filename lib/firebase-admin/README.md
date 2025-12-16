# Firebase Admin SDK Setup

This directory is for Firebase Admin SDK service account credentials.

## Setup Instructions

### Option 1: Service Account Key File (Recommended for Local Development)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **greenlitai**
3. Click the gear icon ⚙️ next to "Project Overview"
4. Go to **Project Settings**
5. Click the **Service Accounts** tab
6. Click **Generate New Private Key**
7. Save the downloaded JSON file as `serviceAccountKey.json` in this directory (`lib/firebase-admin/serviceAccountKey.json`)

The file should look like:
```json
{
  "type": "service_account",
  "project_id": "greenlitai",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@greenlitai.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**⚠️ IMPORTANT:** This file contains sensitive credentials. It's already in `.gitignore` - never commit it!

### Option 2: Environment Variables (Recommended for Production)

Add these to your `.env.local` file:

```bash
FIREBASE_ADMIN_PROJECT_ID=greenlitai
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@greenlitai.iam.gserviceaccount.com
```

**Note:** The `FIREBASE_ADMIN_PRIVATE_KEY` should include the `\n` characters as shown (they'll be replaced automatically).

### Verify Setup

After setting up, restart your Next.js dev server. You should see one of these messages in the console:

- ✅ `Firebase Admin SDK initialized from service account file`
- ✅ `Firebase Admin SDK initialized from environment variables`
- ✅ `Firebase Admin SDK initialized using Application Default Credentials`

If you see warnings, the Admin SDK will gracefully fall back to client-side operations.




























