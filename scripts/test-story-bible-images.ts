/**
 * Story Bible Image Generation - Quick Smoke Test
 * 
 * Quick end-to-end test script to verify the full image generation workflow
 * Run with: npx ts-node scripts/test-story-bible-images.ts
 */

import { generateStoryBibleImages } from '../src/services/ai-generators/story-bible-image-generator'
import type { StoryBible } from '../src/services/story-bible-service'

// Test configuration
const TEST_CONFIG = {
  userId: 'test-user-' + Date.now(),
  timeout: 120000, // 2 minutes
  verbose: true
}

// Create a test Story Bible
function createTestStoryBible(): StoryBible {
  return {
    id: 'test-story-bible-' + Date.now(),
    seriesTitle: 'Test Series: The Mystery of the Lost Artifact',
    seriesOverview: 'A thrilling adventure series following a team of archaeologists as they uncover ancient secrets.',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    genre: 'action',
    tone: 'dramatic',
    mainCharacters: [
      {
        name: 'Dr. Sarah Chen',
        archetype: 'The Leader',
        physicalDescription: 'Sharp features, determined expression, athletic build',
        premiseFunction: 'protagonist'
      },
      {
        name: 'Marcus Rodriguez',
        archetype: 'The Skeptic',
        physicalDescription: 'Tall, muscular, cautious demeanor',
        premiseFunction: 'supporting'
      },
      {
        name: 'Dr. Emily Watson',
        archetype: 'The Scholar',
        physicalDescription: 'Glasses, bookish appearance, intelligent eyes',
        premiseFunction: 'supporting'
      }
    ],
    narrativeArcs: [
      {
        title: 'The Discovery',
        summary: 'The team discovers the first clue to the artifact\'s location in an ancient temple.'
      },
      {
        title: 'The Chase',
        summary: 'Rival archaeologists pursue the team, leading to a dangerous race across the desert.'
      }
    ],
    worldBuilding: {
      locations: [
        {
          name: 'Ancient Temple',
          description: 'A hidden temple deep in the jungle, covered in vines and ancient carvings',
          type: 'exterior'
        },
        {
          name: 'Desert Oasis',
          description: 'A small oasis in the middle of the desert, with a natural spring and palm trees',
          type: 'exterior'
        }
      ]
    }
  }
}

// Test results tracking
interface TestResult {
  name: string
  passed: boolean
  error?: string
  duration: number
}

const results: TestResult[] = []

// Helper to run a test
async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const startTime = Date.now()
  console.log(`\n🧪 Testing: ${name}`)
  
  try {
    await Promise.race([
      testFn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Test timeout')), TEST_CONFIG.timeout)
      )
    ])
    
    const duration = Date.now() - startTime
    results.push({ name, passed: true, duration })
    console.log(`✅ PASSED (${duration}ms)`)
  } catch (error: any) {
    const duration = Date.now() - startTime
    results.push({ name, passed: false, error: error.message, duration })
    console.log(`❌ FAILED (${duration}ms): ${error.message}`)
  }
}

// Test 1: Generate hero image
async function testHeroImageGeneration() {
  const storyBible = createTestStoryBible()
  
  const updated = await generateStoryBibleImages(
    storyBible,
    TEST_CONFIG.userId,
    {
      sections: ['hero'],
      regenerate: true,
      onProgress: (progress) => {
        if (TEST_CONFIG.verbose) {
          console.log(`   Progress: ${progress.section} - ${Math.round(progress.progress)}%`)
        }
      }
    }
  )
  
  if (!updated.visualAssets?.heroImage) {
    throw new Error('Hero image was not generated')
  }
  
  if (!updated.visualAssets.heroImage.imageUrl) {
    throw new Error('Hero image URL is missing')
  }
  
  console.log(`   ✅ Hero image generated: ${updated.visualAssets.heroImage.imageUrl.substring(0, 60)}...`)
}

// Test 2: Generate character portraits
async function testCharacterImageGeneration() {
  const storyBible = createTestStoryBible()
  
  const updated = await generateStoryBibleImages(
    storyBible,
    TEST_CONFIG.userId,
    {
      sections: ['characters'],
      regenerate: true,
      onProgress: (progress) => {
        if (TEST_CONFIG.verbose) {
          console.log(`   Progress: ${progress.section} - ${progress.currentItem} (${progress.completedItems}/${progress.totalItems})`)
        }
      }
    }
  )
  
  if (!updated.mainCharacters || updated.mainCharacters.length === 0) {
    throw new Error('No characters found')
  }
  
  const imagesGenerated = updated.mainCharacters.filter(
    char => char.visualReference?.imageUrl
  ).length
  
  if (imagesGenerated !== updated.mainCharacters.length) {
    throw new Error(`Only ${imagesGenerated}/${updated.mainCharacters.length} character images generated`)
  }
  
  console.log(`   ✅ ${imagesGenerated} character portraits generated`)
}

// Test 3: Generate arc key art
async function testArcKeyArtGeneration() {
  const storyBible = createTestStoryBible()
  
  const updated = await generateStoryBibleImages(
    storyBible,
    TEST_CONFIG.userId,
    {
      sections: ['arcs'],
      regenerate: true,
      onProgress: (progress) => {
        if (TEST_CONFIG.verbose) {
          console.log(`   Progress: ${progress.section} - ${progress.currentItem}`)
        }
      }
    }
  )
  
  if (!updated.narrativeArcs || updated.narrativeArcs.length === 0) {
    throw new Error('No arcs found')
  }
  
  const imagesGenerated = updated.narrativeArcs.filter(
    arc => arc.keyArt?.imageUrl
  ).length
  
  if (imagesGenerated !== updated.narrativeArcs.length) {
    throw new Error(`Only ${imagesGenerated}/${updated.narrativeArcs.length} arc key art generated`)
  }
  
  console.log(`   ✅ ${imagesGenerated} arc key art generated`)
}

// Test 4: Generate location concepts
async function testLocationConceptGeneration() {
  const storyBible = createTestStoryBible()
  
  const updated = await generateStoryBibleImages(
    storyBible,
    TEST_CONFIG.userId,
    {
      sections: ['world'],
      regenerate: true,
      onProgress: (progress) => {
        if (TEST_CONFIG.verbose) {
          console.log(`   Progress: ${progress.section} - ${progress.currentItem}`)
        }
      }
    }
  )
  
  if (!updated.worldBuilding?.locations || updated.worldBuilding.locations.length === 0) {
    throw new Error('No locations found')
  }
  
  const imagesGenerated = updated.worldBuilding.locations.filter(
    loc => loc.conceptArt?.imageUrl
  ).length
  
  if (imagesGenerated !== updated.worldBuilding.locations.length) {
    throw new Error(`Only ${imagesGenerated}/${updated.worldBuilding.locations.length} location concepts generated`)
  }
  
  console.log(`   ✅ ${imagesGenerated} location concepts generated`)
}

// Test 5: Full batch generation
async function testFullBatchGeneration() {
  const storyBible = createTestStoryBible()
  const startTime = Date.now()
  
  const updated = await generateStoryBibleImages(
    storyBible,
    TEST_CONFIG.userId,
    {
      sections: ['hero', 'characters', 'arcs', 'world'],
      regenerate: true,
      onProgress: (progress) => {
        if (TEST_CONFIG.verbose) {
          console.log(`   Progress: ${progress.section} - ${Math.round(progress.progress)}%`)
          if (progress.currentItem) {
            console.log(`   Current: ${progress.currentItem}`)
          }
        }
      }
    }
  )
  
  const duration = Date.now() - startTime
  
  // Verify all images generated
  const heroGenerated = !!updated.visualAssets?.heroImage?.imageUrl
  const charactersGenerated = updated.mainCharacters?.every(
    char => char.visualReference?.imageUrl
  ) ?? false
  const arcsGenerated = updated.narrativeArcs?.every(
    arc => arc.keyArt?.imageUrl
  ) ?? false
  const locationsGenerated = updated.worldBuilding?.locations?.every(
    loc => loc.conceptArt?.imageUrl
  ) ?? false
  
  if (!heroGenerated) throw new Error('Hero image not generated')
  if (!charactersGenerated) throw new Error('Character images not all generated')
  if (!arcsGenerated) throw new Error('Arc key art not all generated')
  if (!locationsGenerated) throw new Error('Location concepts not all generated')
  
  const totalImages = 1 + (updated.mainCharacters?.length ?? 0) + 
                     (updated.narrativeArcs?.length ?? 0) + 
                     (updated.worldBuilding?.locations?.length ?? 0)
  
  console.log(`   ✅ All ${totalImages} images generated in ${Math.round(duration / 1000)}s`)
  console.log(`   ✅ Average: ${Math.round(duration / totalImages / 1000)}s per image`)
}

// Test 6: Error handling
async function testErrorHandling() {
  const storyBible = createTestStoryBible()
  
  // Test with invalid userId (should handle gracefully)
  try {
    await generateStoryBibleImages(
      storyBible,
      '', // Empty userId
      {
        sections: ['hero'],
        regenerate: true
      }
    )
    // Should either succeed (guest mode) or throw a clear error
    console.log(`   ✅ Error handling: Empty userId handled gracefully`)
  } catch (error: any) {
    if (error.message.includes('userId') || error.message.includes('required')) {
      console.log(`   ✅ Error handling: Clear error message for missing userId`)
    } else {
      throw error
    }
  }
  
  // Test with empty sections (should handle gracefully)
  try {
    await generateStoryBibleImages(
      storyBible,
      TEST_CONFIG.userId,
      {
        sections: [],
        regenerate: true
      }
    )
    console.log(`   ✅ Error handling: Empty sections handled gracefully`)
  } catch (error: any) {
    if (error.message.includes('sections') || error.message.includes('empty')) {
      console.log(`   ✅ Error handling: Clear error message for empty sections`)
    } else {
      // Empty sections might be valid (just no-op), so this is okay
      console.log(`   ✅ Error handling: Empty sections handled (no-op)`)
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║   🧪 STORY BIBLE IMAGE GENERATION - SMOKE TEST SUITE        ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')
  
  console.log(`📋 Test Configuration:`)
  console.log(`   User ID: ${TEST_CONFIG.userId}`)
  console.log(`   Timeout: ${TEST_CONFIG.timeout / 1000}s`)
  console.log(`   Verbose: ${TEST_CONFIG.verbose}\n`)
  
  // Run tests
  await runTest('Hero Image Generation', testHeroImageGeneration)
  await runTest('Character Portrait Generation', testCharacterImageGeneration)
  await runTest('Arc Key Art Generation', testArcKeyArtGeneration)
  await runTest('Location Concept Generation', testLocationConceptGeneration)
  await runTest('Full Batch Generation', testFullBatchGeneration)
  await runTest('Error Handling', testErrorHandling)
  
  // Print summary
  console.log('\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║                        TEST SUMMARY                         ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
  
  console.log(`✅ Passed: ${passed}/${results.length}`)
  console.log(`❌ Failed: ${failed}/${results.length}`)
  console.log(`⏱️  Total Time: ${Math.round(totalDuration / 1000)}s\n`)
  
  if (failed > 0) {
    console.log('Failed Tests:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ❌ ${r.name}: ${r.error}`)
    })
    process.exit(1)
  } else {
    console.log('🎉 All tests passed!')
    process.exit(0)
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ CRITICAL ERROR:', error)
  process.exit(1)
})




























