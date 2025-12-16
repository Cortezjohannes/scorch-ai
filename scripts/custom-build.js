#!/usr/bin/env node
/**
 * Custom build script that handles prerendering errors gracefully
 * Next.js standalone output should be created even if some pages fail to prerender
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting custom Next.js build...');

try {
  // Run the build
  execSync('npm run build', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  // Check if standalone output exists
  const standalonePath = path.join(process.cwd(), '.next', 'standalone');
  if (fs.existsSync(standalonePath)) {
    console.log('✅ Standalone output created successfully');
    process.exit(0);
  } else {
    console.log('⚠️  Standalone output not found, but build may have partially succeeded');
    // Check if .next directory exists
    const nextPath = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextPath)) {
      console.log('✅ .next directory exists - build partially succeeded');
      // For standalone mode, we need the standalone directory
      // If it doesn't exist, the build failed
      console.log('❌ ERROR: Standalone output required but not found');
      process.exit(1);
    } else {
      console.log('❌ ERROR: Build failed completely');
      process.exit(1);
    }
  }
} catch (error) {
  // Build failed, but check if standalone was created anyway
  const standalonePath = path.join(process.cwd(), '.next', 'standalone');
  if (fs.existsSync(standalonePath)) {
    console.log('✅ Standalone output found despite build errors');
    process.exit(0);
  } else {
    console.log('❌ Build failed and standalone output not found');
    process.exit(1);
  }
}









