#!/bin/bash
# Debug Console Cleanup Script
# Removes debug console.log statements from production code

echo "🧹 Starting debug console cleanup..."

# Function to clean debug console.log statements
clean_debug_logs() {
    local file="$1"
    echo "Cleaning: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Remove debug console.log statements (keep errors and warnings)
    # This removes lines with emojis and debug keywords
    sed -i '' '/console\.log.*[🚀✅❌⚠️🔍📊🎯🎭🏛️🔧⚡🎪🎬]/d' "$file"
    sed -i '' '/console\.log.*DEBUG/d' "$file"
    sed -i '' '/console\.log.*TEST/d' "$file"
    sed -i '' '/console\.log.*TEMP/d' "$file"
    
    echo "✅ Cleaned: $file"
}

# High priority files with most console.log statements
HIGH_PRIORITY_FILES=(
    "src/services/master-conductor.ts"
    "src/services/engine-logger.ts"
    "src/services/console-logger.ts"
    "src/services/fallback-recovery-system.ts"
    "src/services/enhanced-orchestrator.ts"
    "src/services/performance-optimization-system.ts"
    "src/services/quality-validation-framework.ts"
)

# Medium priority files
MEDIUM_PRIORITY_FILES=(
    "src/services/foundation-engine-system.ts"
    "src/services/engine-integration-test.ts"
    "src/services/content-enhancement-demo.ts"
    "src/services/preproduction-v2-generators.ts"
    "src/services/ai-orchestrator.ts"
    "src/app/api/generate/complete-narrative/route.ts"
    "src/app/api/generate/route.ts"
)

echo "🎯 Cleaning high priority files..."
for file in "${HIGH_PRIORITY_FILES[@]}"; do
    if [ -f "$file" ]; then
        clean_debug_logs "$file"
    else
        echo "⚠️ File not found: $file"
    fi
done

echo "🎯 Cleaning medium priority files..."
for file in "${MEDIUM_PRIORITY_FILES[@]}"; do
    if [ -f "$file" ]; then
        clean_debug_logs "$file"
    else
        echo "⚠️ File not found: $file"
    fi
done

echo "🧹 Debug cleanup complete!"
echo "📊 Summary:"
echo "- Removed debug console.log statements with emojis"
echo "- Removed DEBUG, TEST, TEMP console.log statements"
echo "- Kept console.error and console.warn statements"
echo "- Created backups of all modified files"

echo ""
echo "🔍 To verify cleanup:"
echo "grep -r 'console\.log.*[🚀✅❌⚠️🔍📊🎯🎭🏛️🔧⚡🎪🎬]' src/ | wc -l"
echo ""
echo "📁 Backup files created with .backup extension"
echo "🔄 To restore: mv file.ts.backup file.ts"



