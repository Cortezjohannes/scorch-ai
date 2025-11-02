/**
 * API Route: Generate Script Breakdown
 * 
 * Analyzes screenplay from Scripts tab and generates micro-budget production breakdown
 * Uses EngineAIRouter with Gemini 2.5 Pro for analytical tasks
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateScriptBreakdown } from '@/services/ai-generators/script-breakdown-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, userId, scriptData, storyBibleData } = body

    console.log('📋 Script Breakdown Generation API called')
    console.log('  Pre-Production ID:', preProductionId)
    console.log('  Story Bible ID:', storyBibleId)
    console.log('  Episode Number:', episodeNumber)
    console.log('  User ID:', userId || 'GUEST MODE')

    // Validate required parameters
    if (!preProductionId || !storyBibleId || episodeNumber === undefined) {
      console.error('❌ Missing required parameters')
      return NextResponse.json(
        { error: 'Missing required parameters: preProductionId, storyBibleId, episodeNumber' },
        { status: 400 }
      )
    }

    // 1. Validate script data exists
    console.log('\n📄 Validating screenplay data...')
    if (!scriptData) {
      console.error('❌ No script data provided')
      return NextResponse.json(
        { 
          error: 'Please generate script first',
          details: 'Script data is required to generate breakdown. Go to Scripts tab and generate a screenplay first.'
        },
        { status: 400 }
      )
    }

    console.log('✅ Script data received')
    console.log('  Title:', scriptData.title)
    console.log('  Pages:', scriptData.metadata?.pageCount || 0)
    console.log('  Scenes:', scriptData.metadata?.sceneCount || 0)

    // 2. Validate story bible data
    console.log('\n📖 Validating story bible data...')
    if (!storyBibleData) {
      console.error('❌ Story bible data not provided')
      return NextResponse.json(
        { error: 'Story bible data not provided by client' },
        { status: 400 }
      )
    }

    console.log('✅ Story Bible data received:', storyBibleData.seriesTitle || storyBibleData.title || 'Untitled')

    // 3. Generate the breakdown
    console.log('\n🤖 Generating script breakdown with AI...')
    console.log('  Provider: Gemini 2.5 Pro (via EngineAIRouter)')
    console.log('  Focus: Micro-budget ($1k-$20k)')
    
    const breakdown = await generateScriptBreakdown({
      script: scriptData,
      storyBible: storyBibleData,
      episodeNumber: episodeNumber,
      episodeTitle: scriptData.title || `Episode ${episodeNumber}`
    })

    console.log('\n✅ Breakdown generated successfully!')
    console.log('  Scenes analyzed:', breakdown.scenes.length)
    console.log('  Total shoot time:', breakdown.totalEstimatedTime, 'minutes')
    console.log('  Total budget:', `$${breakdown.totalBudgetImpact}`)

    // Validate budget is within range (per episode for UGC series)
    if (breakdown.totalBudgetImpact > 625) {
      console.warn('⚠️  Budget exceeds typical per-episode range:', `$${breakdown.totalBudgetImpact}`)
      console.warn('   (Series budget $1k-$20k ÷ 32 episodes = ~$30-$625/ep)')
    } else if (breakdown.totalBudgetImpact < 10) {
      console.warn('⚠️  Budget seems very low:', `$${breakdown.totalBudgetImpact}`)
    } else {
      console.log('✅ Budget within UGC micro-budget range ($10-$625/episode)')
    }

    // 4. Return success (client will save to Firestore)
    console.log('\n✅ Breakdown generation complete!')
    console.log('📤 Returning breakdown to client for Firestore save')
    console.log('   (Client has Firebase Auth context for proper permissions)')

    return NextResponse.json({
      success: true,
      breakdown: breakdown,
      preProductionId,
      message: `Breakdown generated: ${breakdown.scenes.length} scenes, $${breakdown.totalBudgetImpact} total budget`
    })

  } catch (error: any) {
    console.error('\n❌ ERROR in script breakdown generation API:')
    console.error('  Message:', error.message)
    console.error('  Stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'Script breakdown generation failed',
        details: error.message || 'Unknown error',
        type: error.name || 'Error'
      },
      { status: 500 }
    )
  }
}

