# Reeled AI Deployment Options

This repository contains the Reeled AI application with the following deployment options.

## Overview

The Reeled AI application uses:

- **Next.js**: For the frontend and API routes
- **Firebase**: For authentication, database, and storage
- **Google Gemini AI**: For AI-powered content generation
- **Unsplash API**: For image integration

## Deployment Options

### Option 1: Google Cloud Run (Recommended for Production)

For a fully managed, scalable deployment with custom domains, follow the detailed instructions in:

📄 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

Key features of Cloud Run deployment:
- Automatic scaling based on traffic
- Managed SSL certificates
- Custom domain support (app.reeledai.com)
- Professional monitoring and logging
- Automated CI/CD pipeline support

### Option 2: Firebase Hosting

For a simpler deployment focused on static content, follow:

📄 [FIREBASE_GUIDE.md](./FIREBASE_GUIDE.md)

Key features of Firebase Hosting:
- Built-in integration with Firebase services
- Fast global CDN
- Free SSL certificates
- Easy GitHub integration for CI/CD

## Environment Variables

Regardless of the deployment option, you'll need to set up the following environment variables:

```
# AI Services
GEMINI_API_KEY=your_gemini_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
UNSPLASH_SECRET_KEY=your_unsplash_secret_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

## Quick Start for Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and fill in your API keys
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Help and Support

If you encounter any issues during deployment, check the following:

1. Ensure all environment variables are correctly set
2. Check the logs of your deployment for specific error messages
3. Verify that all required services are enabled in Google Cloud/Firebase
4. Ensure your Google Cloud/Firebase billing is set up correctly

## License

This project is licensed under the MIT License - see the LICENSE file for details. 