/**
 * A/B TEST: Episode Generation with vs without Engines
 * 
 * Generates 3 episodes using both methods:
 * - Method A: No engines (current intelligent orchestrator)
 * - Method B: With engines (old 19-engine system)
 * 
 * Saves results for side-by-side comparison
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  episodesToTest: [1, 2, 3], // Test first 3 episodes
  outputFile: 'engine-comparison-results.json',
  apiEndpoint: 'http://localhost:3000/api/generate/episode',
  timeout: 300000 // 5 minutes per episode
};

// Sample story bible for testing
const TEST_STORY_BIBLE = {
  seriesTitle: "The Algorithm",
  genre: "Thriller",
  premise: {
    premiseStatement: "A tech whistleblower must expose her company's dangerous AI while staying one step ahead of corporate surveillance."
  },
  mainCharacters: [
    {
      name: "Alex Chen",
      archetype: "Protagonist",
      premiseFunction: "The Whistleblower",
      description: "Former senior engineer who discovered the company's AI is being weaponized",
      psychology: {
        want: "Expose the truth and bring the company down",
        need: "Learn to trust others instead of working alone",
        primaryFlaw: "Paranoid and unwilling to accept help",
        coreValue: "Justice above all",
        temperament: ["Intense", "Analytical", "Guarded"],
        moralStandpoint: "Ends justify means when fighting corruption"
      }
    },
    {
      name: "Marcus Rivera",
      archetype: "Ally",
      premiseFunction: "The Journalist",
      description: "Investigative journalist who wants to help Alex expose the story",
      psychology: {
        want: "Break the biggest story of his career",
        need: "Prove he's more than just another click-chaser",
        primaryFlaw: "Too eager for recognition",
        coreValue: "Truth must be told",
        temperament: ["Charismatic", "Persistent", "Impulsive"]
      }
    },
    {
      name: "Dr. Sarah Kim",
      archetype: "Antagonist",
      premiseFunction: "The Corporate Fixer",
      description: "Head of security who will do anything to protect the company",
      psychology: {
        want: "Contain the leak and neutralize Alex",
        need: "Face that she's become what she once fought against",
        primaryFlaw: "Believes loyalty to the company justifies any action",
        coreValue: "Order and stability",
        temperament: ["Calculating", "Ruthless", "Efficient"]
      }
    }
  ],
  narrativeArcs: [
    {
      title: "The Discovery",
      summary: "Alex discovers the AI weaponization and begins gathering evidence",
      episodes: [
        { number: 1, title: "First Contact", summary: "Alex finds the first piece of evidence" },
        { number: 2, title: "Deep Dive", summary: "Alex investigates deeper and attracts attention" },
        { number: 3, title: "The Meeting", summary: "Alex meets Marcus and considers going public" }
      ]
    }
  ],
  worldBuilding: {
    setting: "Near-future San Francisco tech district",
    atmosphere: "High-tech surveillance meets noir tension",
    visualStyle: "Glass offices, neon lights, constant digital monitoring"
  }
};

async function generateEpisode(episodeNumber, useEngines, useComprehensiveEngines = false) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing Episode ${episodeNumber} - ${useEngines ? 'WITH ENGINES' : 'NO ENGINES'}`);
  console.log(`${'='.repeat(80)}`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(TEST_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storyBible: TEST_STORY_BIBLE,
        episodeNumber: episodeNumber,
        previousChoice: null,
        useEngines: useEngines,
        useComprehensiveEngines: useComprehensiveEngines
      }),
      signal: AbortSignal.timeout(TEST_CONFIG.timeout)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ Episode ${episodeNumber} generated in ${duration}s`);
    console.log(`   Title: ${data.episode?.title || 'N/A'}`);
    console.log(`   Scenes: ${data.episode?.scenes?.length || 0}`);
    console.log(`   Method: ${data.generationMethod || (useEngines ? 'engines' : 'unknown')}`);
    
    return {
      success: true,
      episode: data.episode,
      metadata: data,
      duration: parseFloat(duration),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error(`❌ Episode ${episodeNumber} failed after ${duration}s`);
    console.error(`   Error: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      duration: parseFloat(duration),
      timestamp: new Date().toISOString()
    };
  }
}

async function runComparisonTest() {
  console.log('\n' + '='.repeat(80));
  console.log('EPISODE GENERATION A/B TEST: ENGINES VS NO ENGINES');
  console.log('='.repeat(80));
  console.log(`\nTesting ${TEST_CONFIG.episodesToTest.length} episodes with each method`);
  console.log(`Story: "${TEST_STORY_BIBLE.seriesTitle}" (${TEST_STORY_BIBLE.genre})`);
  console.log(`\nStarting test at ${new Date().toLocaleString()}\n`);

  const results = {
    testMetadata: {
      storyTitle: TEST_STORY_BIBLE.seriesTitle,
      totalEpisodes: TEST_CONFIG.episodesToTest.length,
      methodA: "Intelligent Orchestrator (No Engines)",
      methodB: "19-Engine Comprehensive System",
      testDate: new Date().toLocaleString()
    },
    methodA: {
      results: [],
      totalTime: 0,
      averageTime: 0,
      successRate: 0
    },
    methodB: {
      results: [],
      totalTime: 0,
      averageTime: 0,
      successRate: 0
    }
  };

  // Test Method A: No Engines (Current System)
  console.log('\n' + '▓'.repeat(80));
  console.log('METHOD A: NO ENGINES (Intelligent Orchestrator)');
  console.log('▓'.repeat(80));
  
  for (const episodeNum of TEST_CONFIG.episodesToTest) {
    const result = await generateEpisode(episodeNum, false, false);
    results.methodA.results.push(result);
    results.methodA.totalTime += result.duration;
    if (result.success) results.methodA.successRate++;
    
    // Brief pause between episodes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  results.methodA.averageTime = results.methodA.totalTime / TEST_CONFIG.episodesToTest.length;
  results.methodA.successRate = (results.methodA.successRate / TEST_CONFIG.episodesToTest.length) * 100;

  // Test Method B: With Engines (Old System)
  console.log('\n' + '▓'.repeat(80));
  console.log('METHOD B: WITH ENGINES (19-Engine System)');
  console.log('▓'.repeat(80));
  
  for (const episodeNum of TEST_CONFIG.episodesToTest) {
    const result = await generateEpisode(episodeNum, true, true);
    results.methodB.results.push(result);
    results.methodB.totalTime += result.duration;
    if (result.success) results.methodB.successRate++;
    
    // Brief pause between episodes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  results.methodB.averageTime = results.methodB.totalTime / TEST_CONFIG.episodesToTest.length;
  results.methodB.successRate = (results.methodB.successRate / TEST_CONFIG.episodesToTest.length) * 100;

  // Save results in both root and public folder
  const publicOutputFile = path.join(__dirname, 'public', 'engine-comparison-results.json');
  
  fs.writeFileSync(
    TEST_CONFIG.outputFile,
    JSON.stringify(results, null, 2),
    'utf8'
  );
  
  // Also save to public folder for web access
  fs.writeFileSync(
    publicOutputFile,
    JSON.stringify(results, null, 2),
    'utf8'
  );

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  
  console.log('\n📊 METHOD A: NO ENGINES');
  console.log(`   Success Rate: ${results.methodA.successRate.toFixed(0)}%`);
  console.log(`   Total Time: ${results.methodA.totalTime.toFixed(2)}s`);
  console.log(`   Average Time: ${results.methodA.averageTime.toFixed(2)}s per episode`);
  
  console.log('\n📊 METHOD B: WITH ENGINES');
  console.log(`   Success Rate: ${results.methodB.successRate.toFixed(0)}%`);
  console.log(`   Total Time: ${results.methodB.totalTime.toFixed(2)}s`);
  console.log(`   Average Time: ${results.methodB.averageTime.toFixed(2)}s per episode`);
  
  const speedDiff = ((results.methodB.averageTime - results.methodA.averageTime) / results.methodA.averageTime * 100).toFixed(1);
  
  console.log('\n⚡ PERFORMANCE COMPARISON');
  console.log(`   Speed difference: ${speedDiff}% ${speedDiff > 0 ? 'slower' : 'faster'} with engines`);
  console.log(`   Time saved per episode: ${Math.abs(results.methodB.averageTime - results.methodA.averageTime).toFixed(2)}s`);
  
  console.log('\n✅ Results saved to:', TEST_CONFIG.outputFile);
  console.log('✅ Also saved to: public/engine-comparison-results.json');
  console.log('\n📊 VIEW RESULTS:');
  console.log('   🌐 Web UI: http://localhost:3000/ab-test-results');
  console.log('   📖 CLI: node view-ab-results.js');
  console.log('   📄 JSON: Check engine-comparison-results.json');
  console.log('\n' + '='.repeat(80) + '\n');
}

// Run the test
runComparisonTest().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});











