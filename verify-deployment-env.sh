#!/bin/bash
# Pre-Deployment Environment Verification Script

echo "🔍 REELED AI - Pre-Deployment Environment Check"
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a variable is set
check_env_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env.local 2>/dev/null | cut -d'=' -f2)
    
    if [ -n "$var_value" ] && [ "$var_value" != "your_" ] && [ "$var_value" != "[" ]; then
        echo -e "${GREEN}✓${NC} $var_name is set"
        return 0
    else
        echo -e "${RED}✗${NC} $var_name is NOT set or empty"
        return 1
    fi
}

# Function to check optional variable
check_optional_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env.local 2>/dev/null | cut -d'=' -f2)
    
    if [ -n "$var_value" ] && [ "$var_value" != "your_" ] && [ "$var_value" != "[" ]; then
        echo -e "${GREEN}✓${NC} $var_name is set"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $var_name is NOT set (optional)"
        return 1
    fi
}

# Check if .env.local exists
echo "📄 Checking for .env.local file..."
if [ ! -f .env.local ]; then
    echo -e "${RED}✗ .env.local file not found!${NC}"
    echo "Please create .env.local with your environment variables"
    exit 1
fi
echo -e "${GREEN}✓${NC} .env.local found"
echo ""

# Critical AI Services
echo "🤖 AI Services Configuration"
echo "----------------------------"
check_env_var "GEMINI_API_KEY"
check_env_var "AZURE_OPENAI_ENDPOINT"
check_env_var "AZURE_OPENAI_API_KEY"
check_env_var "AZURE_OPENAI_API_VERSION"
check_env_var "AZURE_OPENAI_DEPLOYMENT"
echo ""

# Firebase Configuration
echo "🔥 Firebase Configuration"
echo "-------------------------"
check_env_var "NEXT_PUBLIC_FIREBASE_API_KEY"
check_env_var "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
check_env_var "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
check_env_var "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
check_env_var "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
check_env_var "NEXT_PUBLIC_FIREBASE_APP_ID"
check_optional_var "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
echo ""

# Optional Services
echo "📸 Optional Services"
echo "-------------------"
check_optional_var "UNSPLASH_ACCESS_KEY"
check_optional_var "UNSPLASH_SECRET_KEY"
echo ""

# Google Cloud Configuration
echo "☁️  Google Cloud Configuration"
echo "-----------------------------"
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -n "$PROJECT_ID" ]; then
    echo -e "${GREEN}✓${NC} Active project: $PROJECT_ID"
else
    echo -e "${RED}✗${NC} No active Google Cloud project set"
    echo "Run: gcloud config set project reeled-ai-production"
fi
echo ""

# Check Docker
echo "🐳 Docker Status"
echo "---------------"
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker is installed and running"
    else
        echo -e "${YELLOW}⚠${NC} Docker is installed but not running"
        echo "Please start Docker Desktop"
    fi
else
    echo -e "${RED}✗${NC} Docker is not installed"
fi
echo ""

# Check gcloud authentication
echo "🔐 Google Cloud Authentication"
echo "------------------------------"
if gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q "@"; then
    ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -1)
    echo -e "${GREEN}✓${NC} Authenticated as: $ACCOUNT"
else
    echo -e "${RED}✗${NC} Not authenticated with Google Cloud"
    echo "Run: gcloud auth login"
fi
echo ""

# Build check
echo "🏗️  Build Status"
echo "---------------"
if [ -d ".next" ]; then
    echo -e "${GREEN}✓${NC} .next build directory exists"
    echo -e "${YELLOW}⚠${NC} Consider running 'npm run build' for a fresh build before deployment"
else
    echo -e "${YELLOW}⚠${NC} No .next build directory found"
    echo "You should run 'npm run build' to test locally first"
fi
echo ""

# Dependencies check
echo "📦 Dependencies"
echo "--------------"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
else
    echo -e "${RED}✗${NC} node_modules not found"
    echo "Run: npm install"
fi
echo ""

# Summary
echo "================================================"
echo "📊 DEPLOYMENT READINESS SUMMARY"
echo "================================================"

# Count issues
CRITICAL_MISSING=0

# Check critical variables
for var in "GEMINI_API_KEY" "AZURE_OPENAI_ENDPOINT" "AZURE_OPENAI_API_KEY" "NEXT_PUBLIC_FIREBASE_API_KEY" "NEXT_PUBLIC_FIREBASE_PROJECT_ID"; do
    if ! grep -q "^${var}=" .env.local 2>/dev/null || grep "^${var}=" .env.local 2>/dev/null | grep -q "your_\|^\["; then
        ((CRITICAL_MISSING++))
    fi
done

if [ $CRITICAL_MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ All critical environment variables are configured${NC}"
    echo -e "${GREEN}✅ Ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Authenticate: gcloud auth login"
    echo "2. Configure Docker: gcloud auth configure-docker us-central1-docker.pkg.dev"
    echo "3. Deploy: gcloud builds submit --config cloudbuild.yaml"
else
    echo -e "${RED}❌ Missing $CRITICAL_MISSING critical environment variable(s)${NC}"
    echo -e "${YELLOW}⚠️  Please configure all required variables in .env.local${NC}"
    echo ""
    echo "Refer to production.env.template for the required variables"
fi

echo ""
echo "For detailed deployment instructions, see DEPLOYMENT_PLAN.md"




