# Deploying to Google Cloud Run

This guide provides instructions for deploying the Reeled AI application to Google Cloud Run.

## Prerequisites

- Google Cloud SDK installed and configured
- Docker installed
- Access to Google Cloud project with Cloud Run API enabled
- Git repository access

## Deployment Steps

### 1. Clone the repository and checkout the deployment branch

```bash
git clone [repository-url]
cd prototype-reeled-ai
git checkout deployment-prep
```

### 2. Set up environment variables

Create a `.env.production` file based on the template:

```bash
cp production.env.template .env.production
```

Edit the `.env.production` file and fill in all the required API keys and configuration values.

### 3. Modify the deployment script (if needed)

Open `deploy-cloud-run.sh` and update the following variables if necessary:

- `PROJECT_ID`: Your Google Cloud project ID
- `SERVICE_NAME`: The name of your Cloud Run service
- `REGION`: The region to deploy to (default: us-central1)

### 4. Run the deployment script

```bash
./deploy-cloud-run.sh
```

This script will:
- Build a Docker image
- Push it to Google Container Registry
- Deploy the image to Cloud Run

### 5. Verify the deployment

After deployment completes, the script will output the URL of your deployed application. Open it in a browser to verify everything is working correctly.

## Continuous Deployment (Optional)

For continuous deployment, you can set up Cloud Build triggers to automatically deploy on new commits to the main branch. See Google Cloud documentation for details.

## Troubleshooting

### Image not building correctly
- Ensure Docker is running
- Check that you have the right permissions for Google Container Registry

### Deployment fails
- Check Cloud Run logs for errors
- Verify that all environment variables are correctly set
- Ensure your Google Cloud project has sufficient quota

### Application not loading correctly
- Check browser console for errors
- Verify that environment variables are correctly set in the Cloud Run service
- Check application logs in Cloud Run console 