# Fix: "Key creation is not allowed" Error

## The Problem

You're seeing this error:
> "Key creation is not allowed on this service account. Please check if service account key creation is restricted by organization policies."

This means your Google Cloud organization has a policy that prevents downloading service account keys.

## Solutions

### Solution 1: Use Application Default Credentials (Recommended for Cloud Run)

If you're deploying to Cloud Run, use Application Default Credentials instead of a downloaded key. Cloud Run automatically provides credentials.

**Update the code to use Application Default Credentials:**

### Solution 2: Check Organization Policy

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Select your project: **greenlitai**
3. Navigate to: **IAM & Admin** → **Organization Policies**
4. Search for: **"Restrict service account key creation"**
5. If it's enforced, you'll need to:
   - Contact your Google Workspace admin to exempt your project
   - OR use a different service account that's not restricted

### Solution 3: Create a New Service Account

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=greenlitai
2. Click **"Create Service Account"**
3. Name it: `firebase-storage-uploader`
4. Grant it these roles:
   - **Storage Admin** (for uploading images)
   - **Firebase Admin SDK Administrator Service Agent**
5. Click **"Done"**
6. Try generating a key for this NEW service account (it might not have the same restrictions)

### Solution 4: Use Workload Identity (Advanced)

For Cloud Run deployments, use Workload Identity which doesn't require downloading keys.

### Solution 5: Temporarily Use Client-Side Upload (Fallback)

If you can't get Admin SDK working, the client-side upload will still work - it's just less efficient.

## Quick Fix: Update Code to Support Both Methods

I'll update the code to automatically detect and use Application Default Credentials when available (for Cloud Run), and fallback to client-side uploads if Admin SDK isn't available.





























