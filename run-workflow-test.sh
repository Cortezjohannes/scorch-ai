#!/bin/bash

# 🧪 Comprehensive Workflow Test Runner
# Runs full validation of Reeled AI platform

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🚀 REELED AI - COMPREHENSIVE WORKFLOW VALIDATION         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if server is running
echo "🔍 Checking if development server is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Server is running at http://localhost:3000"
else
    echo "❌ Server is not running!"
    echo ""
    echo "Please start the development server first:"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo ""
echo "📦 Installing dependencies if needed..."
npm install --silent

echo ""
echo "🔨 Compiling TypeScript test file..."
npx ts-node comprehensive-workflow-test.ts

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests completed successfully!"
else
    echo "❌ Tests failed with exit code $TEST_EXIT_CODE"
fi

echo ""
echo "📊 Test results saved to:"
echo "  - test-results-comprehensive.json (detailed report)"
echo "  - test-results-story-bible.json (generated story bible)"
echo "  - test-results-episode-comprehensive.json (generated episode)"
echo ""

exit $TEST_EXIT_CODE
















