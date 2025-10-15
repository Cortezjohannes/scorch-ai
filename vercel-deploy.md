# Deploying Reeled AI to Vercel

This guide provides the steps to deploy the Reeled AI application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
2. Your codebase pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Steps to Deploy

### 1. Push Your Code to a Git Repository

Make sure your code is pushed to a GitHub, GitLab, or Bitbucket repository.

### 2. Import Your Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." > "Project"
3. Select the repository where your Reeled AI code is located
4. Configure the project settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3. Configure Environment Variables

In the Vercel deployment settings, add the following environment variables:

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | Your Google Gemini API Key |
| `UNSPLASH_ACCESS_KEY` | Your Unsplash Access Key |
| `UNSPLASH_SECRET_KEY` | Your Unsplash Secret Key |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Your Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Your Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Your Firebase Measurement ID |

### 4. Deploy Your Project

1. Click "Deploy"
2. Wait for the build and deployment process to complete
3. Once deployed, Vercel will provide you with a URL (e.g., `reeled-ai.vercel.app`)

### 5. Configure Custom Domain (Optional)

1. In your Vercel dashboard, go to the deployed project
2. Navigate to "Settings" > "Domains"
3. Add your custom domain (e.g., `app.reeledai.com`)
4. Follow Vercel's instructions to set up DNS records with your domain provider

### 6. Verify Deployment

Visit your Vercel deployment URL to ensure the application is working correctly.

## Automatic Deployments

Vercel automatically sets up continuous deployment from your Git repository:

- When you push changes to the `main` branch, Vercel will automatically redeploy your app
- Each pull request gets a preview deployment for testing changes

## Troubleshooting

If you encounter issues during deployment:

1. Check the build logs in the Vercel dashboard
2. Ensure all environment variables are correctly set
3. Verify that the Firebase project is properly configured

For further assistance, refer to [Vercel's documentation](https://vercel.com/docs). 