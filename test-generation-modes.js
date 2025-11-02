/**
 * COMPREHENSIVE EPISODE GENERATION TEST SUITE
 * Tests Standard vs Premium mode with detailed logging
 */

const API_BASE = 'http://localhost:3002'

// Mock Story Bible for testing
const mockStoryBible = {
  id: 'test_bible_001',
  seriesTitle: 'The Last Archive',
  genre: 'sci-fi thriller',
  premise: {
    premiseStatement: 'Knowledge is power, but some truths are better left buried',
    character: 'A brilliant archivist who discovers forbidden information',
    conflict: 'Uncover the truth while staying alive',
    resolution: 'Truth at any cost'
  },
  mainCharacters: [
    {
      name: 'Dr. Sarah Chen',
      role: 'protagonist',
      description: 'A meticulous digital archivist who values truth above all. Haunted by a past cover-up.',
      personality: 'Obsessive, brilliant, socially awkward, fiercely independent'
    },
    {
      name: 'Marcus Vale',
      role: 'antagonist',
      description: 'Powerful government official who will do anything to protect state secrets',
      personality: 'Charismatic, ruthless, calculating, sees himself as a patriot'
    },
    {
      name: 'Alex Torres',
      role: 'ally',
      description: 'Sarah\'s former colleague and hacker friend. Comic relief with a serious side.',
      personality: 'Witty, loyal, tech-savvy, haunted by past mistakes'
    }
  ],
  worldBuilding: 'Near-future where all human knowledge is digitized in massive government archives. Information control is absolute. Underground resistance movements fight for knowledge freedom.',
  thematicElements: ['truth vs security', 'individual vs state', 'knowledge as power', 'the cost of knowing']
}

const vibeSettings = {
  tone: 30, // Dark/gritty
  pacing: 70, // High octane
  dialogueStyle: 45 // Balanced
}

const directorsNotes = 'Focus on atmosphere and tension. Show the paranoia of living in a surveillance state. The archive should feel both vast and claustrophobic.'

console.log('═══════════════════════════════════════════════════════════')
console.log('  EPISODE GENERATION TEST SUITE')
console.log('═══════════════════════════════════════════════════════════\n')

// Test 1: Generate Beat Sheet
async function testBeatSheetGeneration() {
  console.log('📋 TEST 1: Beat Sheet Generation')
  console.log('─────────────────────────────────────────────────────────')
  
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${API_BASE}/api/generate/beat-sheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyBible: mockStoryBible,
        episodeNumber: 1,
        episodeGoal: 'Sarah discovers the first encrypted file that shouldn\'t exist',
        vibeSettings,
        directorsNotes,
        previousChoice: null
      })
    })
    
    const duration = Date.now() - startTime
    
    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Beat sheet generation FAILED')
      console.error('   Error:', error)
      return null
    }
    
    const data = await response.json()
    
    console.log(`✅ Beat sheet generated in ${(duration / 1000).toFixed(1)}s`)
    console.log(`   Length: ${data.beatSheet.length} characters`)
    console.log(`   Preview: ${data.beatSheet.substring(0, 150)}...`)
    
    return data.beatSheet
    
  } catch (error) {
    console.error('❌ Beat sheet generation ERROR:', error.message)
    return null
  }
}

// Test 2: Standard Mode (No Engines)
async function testStandardMode(beatSheet) {
  console.log('\n📝 TEST 2: Standard Mode Generation (NO ENGINES)')
  console.log('─────────────────────────────────────────────────────────')
  
  const startTime = Date.now()
  
  try {
    console.log('⏳ Starting standard generation...')
    
    const response = await fetch(`${API_BASE}/api/generate/episode-from-beats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyBible: mockStoryBible,
        episodeNumber: 1,
        beatSheet,
        vibeSettings,
        directorsNotes,
        previousChoice: null
      })
    })
    
    const duration = Date.now() - startTime
    
    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Standard mode FAILED')
      console.error('   Error:', error)
      return null
    }
    
    const data = await response.json()
    
    console.log(`\n✅ STANDARD MODE COMPLETE in ${(duration / 1000).toFixed(1)}s`)
    console.log('─────────────────────────────────────────────────────────')
    console.log(`   Episode Title: ${data.episode.title}`)
    console.log(`   Scenes: ${data.episode.scenes?.length || 0}`)
    console.log(`   Total Words: ${JSON.stringify(data.episode).length}`)
    console.log(`   Generation Type: ${data.episode.generationType}`)
    console.log(`   Has Engine Metadata: ${!!data.episode.engineMetadata}`)
    
    if (data.episode.scenes && data.episode.scenes.length > 0) {
      const firstScene = data.episode.scenes[0]
      console.log(`\n   First Scene Preview:`)
      console.log(`   "${firstScene.content?.substring(0, 200) || 'No content'}..."`)
    }
    
    return data.episode
    
  } catch (error) {
    console.error('❌ Standard mode ERROR:', error.message)
    return null
  }
}

// Test 3: Premium Mode (19 Engines)
async function testPremiumMode(beatSheet) {
  console.log('\n🌟 TEST 3: Premium Mode Generation (19 ENGINES)')
  console.log('─────────────────────────────────────────────────────────')
  
  const startTime = Date.now()
  let lastUpdate = startTime
  
  try {
    console.log('⏳ Starting premium generation with 19 engines...')
    console.log('   (This will take 60-120 seconds)')
    
    // Start progress updates
    const progressInterval = setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
      process.stdout.write(`\r   ⏱️  Elapsed: ${elapsed}s (engines running...)`)
    }, 1000)
    
    const response = await fetch(`${API_BASE}/api/generate/episode-premium`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyBible: mockStoryBible,
        episodeNumber: 2,
        beatSheet,
        vibeSettings,
        directorsNotes,
        previousChoice: null
      })
    })
    
    clearInterval(progressInterval)
    const duration = Date.now() - startTime
    
    console.log('\n')
    
    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Premium mode FAILED')
      console.error('   Error:', error)
      return null
    }
    
    const data = await response.json()
    
    console.log(`\n✅ PREMIUM MODE COMPLETE in ${(duration / 1000).toFixed(1)}s`)
    console.log('─────────────────────────────────────────────────────────')
    console.log(`   Episode Title: ${data.episode.title}`)
    console.log(`   Scenes: ${data.episode.scenes?.length || 0}`)
    console.log(`   Total Words: ${JSON.stringify(data.episode).length}`)
    console.log(`   Generation Type: ${data.episode.generationType}`)
    console.log(`   Has Engine Metadata: ${!!data.episode.engineMetadata}`)
    
    if (data.episode.engineMetadata) {
      console.log(`\n   🎯 ENGINE PERFORMANCE:`)
      console.log(`   Total Engines: ${data.episode.engineMetadata.totalEnginesRun}`)
      console.log(`   Successful: ${data.episode.engineMetadata.successfulEngines}`)
      console.log(`   Failed: ${data.episode.engineMetadata.failedEngines}`)
      console.log(`   Success Rate: ${data.episode.engineMetadata.successRate?.toFixed(1)}%`)
      console.log(`   Execution Time: ${(data.episode.engineMetadata.totalExecutionTime / 1000).toFixed(1)}s`)
    }
    
    if (data.episode.scenes && data.episode.scenes.length > 0) {
      const firstScene = data.episode.scenes[0]
      console.log(`\n   First Scene Preview:`)
      console.log(`   "${firstScene.content?.substring(0, 200) || 'No content'}..."`)
    }
    
    return data.episode
    
  } catch (error) {
    console.error('❌ Premium mode ERROR:', error.message)
    return null
  }
}

// Test 4: Quality Comparison
function compareQuality(standardEpisode, premiumEpisode) {
  console.log('\n📊 TEST 4: Quality Comparison')
  console.log('─────────────────────────────────────────────────────────')
  
  if (!standardEpisode || !premiumEpisode) {
    console.log('❌ Cannot compare - one or both episodes missing')
    return
  }
  
  const standardContent = JSON.stringify(standardEpisode)
  const premiumContent = JSON.stringify(premiumEpisode)
  
  console.log('\n   METRICS COMPARISON:')
  console.log('   ┌────────────────────────────┬──────────┬──────────┐')
  console.log('   │ Metric                     │ Standard │ Premium  │')
  console.log('   ├────────────────────────────┼──────────┼──────────┤')
  console.log(`   │ Total Length               │ ${String(standardContent.length).padEnd(8)} │ ${String(premiumContent.length).padEnd(8)} │`)
  console.log(`   │ Scene Count                │ ${String(standardEpisode.scenes?.length || 0).padEnd(8)} │ ${String(premiumEpisode.scenes?.length || 0).padEnd(8)} │`)
  console.log(`   │ Has Engine Metadata        │ ${String(!!standardEpisode.engineMetadata ? 'Yes' : 'No').padEnd(8)} │ ${String(!!premiumEpisode.engineMetadata ? 'Yes' : 'No').padEnd(8)} │`)
  
  if (standardEpisode.scenes?.[0] && premiumEpisode.scenes?.[0]) {
    const stdScene = standardEpisode.scenes[0].content || ''
    const premScene = premiumEpisode.scenes[0].content || ''
    console.log(`   │ First Scene Length         │ ${String(stdScene.length).padEnd(8)} │ ${String(premScene.length).padEnd(8)} │`)
  }
  
  console.log('   └────────────────────────────┴──────────┴──────────┘')
  
  const lengthDiff = ((premiumContent.length / standardContent.length - 1) * 100).toFixed(1)
  console.log(`\n   📈 Premium is ${lengthDiff}% ${lengthDiff > 0 ? 'longer' : 'shorter'} than Standard`)
  
  if (premiumEpisode.engineMetadata) {
    console.log(`   🎯 Premium used ${premiumEpisode.engineMetadata.successfulEngines} engines`)
  } else {
    console.log(`   ⚠️  Premium has NO engine metadata (engines may not have run!)`)
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting comprehensive test suite...\n')
  
  // Test 1: Beat Sheet
  const beatSheet = await testBeatSheetGeneration()
  if (!beatSheet) {
    console.log('\n❌ Test suite aborted - beat sheet generation failed')
    return
  }
  
  // Test 2: Standard Mode
  const standardEpisode = await testStandardMode(beatSheet)
  
  // Test 3: Premium Mode
  const premiumEpisode = await testPremiumMode(beatSheet)
  
  // Test 4: Compare
  compareQuality(standardEpisode, premiumEpisode)
  
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('  TEST SUITE COMPLETE')
  console.log('═══════════════════════════════════════════════════════════\n')
  
  // Summary
  console.log('📋 SUMMARY:')
  console.log(`   Beat Sheet: ${beatSheet ? '✅ Success' : '❌ Failed'}`)
  console.log(`   Standard Mode: ${standardEpisode ? '✅ Success' : '❌ Failed'}`)
  console.log(`   Premium Mode: ${premiumEpisode ? '✅ Success' : '❌ Failed'}`)
  
  if (premiumEpisode?.engineMetadata) {
    console.log(`\n   🎯 ENGINES CONFIRMED WORKING: ${premiumEpisode.engineMetadata.successfulEngines}/${premiumEpisode.engineMetadata.totalEnginesRun} engines ran successfully`)
  } else if (premiumEpisode) {
    console.log(`\n   ⚠️  WARNING: Premium episode has no engine metadata - engines may not have run!`)
  }
}

// Execute
runAllTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error)
  process.exit(1)
})


