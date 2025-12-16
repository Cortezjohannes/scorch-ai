#!/bin/sh
# Build script that continues even if prerendering fails
# Next.js standalone output is created even if some pages fail to prerender

set +e  # Don't exit on error

echo "Starting Next.js build..."
npm run build

BUILD_EXIT=$?
echo "Build completed with exit code: $BUILD_EXIT"

# Check if standalone output was created
if [ -d .next/standalone ]; then
  echo "✓ Standalone output created successfully"
  exit 0
fi

# If standalone doesn't exist, check if .next directory exists
if [ ! -d .next ]; then
  echo "✗ ERROR: .next directory not found - build failed completely"
  exit 1
fi

# If .next exists but standalone doesn't, the build partially failed
# This shouldn't happen with Next.js standalone mode, but we'll check
echo "⚠ WARNING: .next directory exists but standalone not found"
echo "This may indicate a configuration issue with Next.js standalone mode"
exit 1









