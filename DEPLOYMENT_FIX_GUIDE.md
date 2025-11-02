# Google Cloud Run Deployment Fix Guide

This guide addresses the Artifact Registry 403 error and provides a complete deployment solution.

## 🚨 The 403 Error Problem

The 403 Forbidden error occurs because:
1. **Container Registry vs Artifact Registry**: Your config uses the old `gcr.io` (Container Registry) instead of the newer Artifact Registry
2. **Authentication Issues**: Missing proper Docker authentication setup
3. **IAM Permissions**: Insufficient permissions for Cloud Build service account

## 🔧 Solution Steps

### Step 1: Fix Authentication and Permissions

Run the fix script to resolve the 403 error:

```bash
./fix-artifact-registry-403.sh
```

This script will:
- ✅ Enable required Google Cloud APIs
- ✅ Create Artifact Registry repository
- ✅ Configure Docker authentication
- ✅ Grant proper IAM permissions
- ✅ Test authentication

### Step 2: Deploy to Cloud Run

After fixing the 403 error, deploy your application:

```bash
./deploy-cloud-run-fixed.sh
```

## 📋 What Changed

### Updated Files:

1. **`cloudbuild.yaml`** - Updated to use Artifact Registry:
   - Changed from `gcr.io/reeled-ai-production/` to `us-central1-docker.pkg.dev/reeled-ai-production/reeled-ai-repo/`

2. **`deploy-cloud-run-fixed.sh`** - New deployment script with:
   - Proper authentication setup
   - Artifact Registry configuration
   - Error handling
   - Custom domain setup

3. **`fix-artifact-registry-403.sh`** - New fix script that:
   - Creates Artifact Registry repository
   - Configures Docker authentication
   - Sets up proper IAM permissions
   - Tests the setup

## 🚀 Quick Start

1. **Fix the 403 error first:**
   ```bash
   ./fix-artifact-registry-403.sh
   ```

2. **Deploy your application:**
   ```bash
   ./deploy-cloud-run-fixed.sh
   ```

3. **Your app will be available at:**
   - Cloud Run URL: `https://reeled-ai-v2-[hash]-uc.a.run.app`
   - Custom domain: `https://app.reeledai.com` (after DNS verification)

## 🔍 Troubleshooting

### If you still get 403 errors:

1. **Check your authentication:**
   ```bash
   gcloud auth list
   gcloud config get-value project
   ```

2. **Verify Artifact Registry repository exists:**
   ```bash
   gcloud artifacts repositories list --location=us-central1
   ```

3. **Test Docker authentication:**
   ```bash
   gcloud auth configure-docker us-central1-docker.pkg.dev
   docker pull hello-world
   docker tag hello-world us-central1-docker.pkg.dev/reeled-ai-production/reeled-ai-repo/test:latest
   docker push us-central1-docker.pkg.dev/reeled-ai-production/reeled-ai-repo/test:latest
   ```

### If deployment fails:

1. **Check Cloud Build logs:**
   ```bash
   gcloud builds list --limit=5
   gcloud builds log [BUILD_ID]
   ```

2. **Check Cloud Run logs:**
   ```bash
   gcloud run services logs read reeled-ai-v2 --region=us-central1
   ```

## 📚 Key Differences from Original Setup

| Aspect | Original (Broken) | Fixed Version |
|--------|-------------------|---------------|
| Registry | Container Registry (`gcr.io`) | Artifact Registry (`docker.pkg.dev`) |
| Authentication | Basic | Full Docker + IAM setup |
| Permissions | Minimal | Complete service account roles |
| Error Handling | None | Comprehensive |
| Testing | None | Authentication verification |

## 🎯 Next Steps

After successful deployment:

1. **Set up custom domain DNS** (if using custom domain)
2. **Configure environment variables** in Cloud Run console
3. **Set up monitoring** and logging
4. **Configure CI/CD** for automatic deployments

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Google Cloud Run documentation
3. Check Cloud Build and Cloud Run logs for specific error messages










