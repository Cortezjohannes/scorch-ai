/**
 * API Route: Generate Budget
 * 
 * Generates budget suggestions with BASE + OPTIONAL costs
 * Uses EngineAIRouter with Gemini 2.5 Pro
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateBudget } from '@/services/ai-generators/budget-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, userId, scriptData, breakdownData, storyBibleData } = body

    console.log('💰 Budget Generation API called')
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

    // 1. Validate Script Breakdown exists
    console.log('\n📋 Validating Script Breakdown data...')
    if (!breakdownData) {
      console.error('❌ Script breakdown data not provided')
      return NextResponse.json(
        { error: 'Script breakdown required', details: 'Please generate script breakdown first' },
        { status: 400 }
      )
    }

    console.log('✅ Script Breakdown data received')
    console.log('  Total scenes:', breakdownData.totalScenes || breakdownData.scenes?.length)
    console.log('  BASE budget:', `$${breakdownData.totalBudgetImpact}`)

    // 2. Validate Script exists
    console.log('\n📝 Validating Script data...')
    if (!scriptData) {
      console.error('❌ Script data not provided')
      return NextResponse.json(
        { error: 'Script required', details: 'Please generate script first' },
        { status: 400 }
      )
    }

    console.log('✅ Script data received:', scriptData.title || `Episode ${episodeNumber}`)

    // 3. Validate Story Bible
    console.log('\n📖 Validating Story Bible data...')
    if (!storyBibleData) {
      console.error('❌ Story bible data not provided')
      return NextResponse.json(
        { error: 'Story bible required', details: 'Story bible data not provided by client' },
        { status: 400 }
      )
    }

    console.log('✅ Story Bible data received:', storyBibleData.seriesTitle || storyBibleData.title || 'Untitled')

    // 4. Generate budget with AI
    console.log('\n🤖 Generating budget suggestions with AI...')
    console.log('  Provider: Gemini 2.5 Pro (via EngineAIRouter)')
    console.log('  BASE budget: $' + breakdownData.totalBudgetImpact)
    console.log('  Target range: $30-$625/episode')

    const generatedBudget = await generateBudget({
      scriptData,
      breakdownData,
      storyBible: storyBibleData,
      episodeNumber
    })

    console.log('\n✅ Budget generated successfully!')
    console.log('  BASE budget:', `$${generatedBudget.baseBudget.total}`)
    console.log('  OPTIONAL total (all items):', `$${generatedBudget.optionalBudget.total}`)
    console.log('  TOTAL (if all selected):', `$${generatedBudget.totalBudget}`)
    console.log('  Crew suggestions:', generatedBudget.optionalBudget.crew.length)
    console.log('  Equipment suggestions:', generatedBudget.optionalBudget.equipment.length)
    console.log('  Misc suggestions:', generatedBudget.optionalBudget.miscellaneous.length)

    // Validate budget is within range (with recommended items)
    const withRecommended = generatedBudget.budgetAnalysis.withRecommended
    if (withRecommended > 625) {
      console.warn('⚠️  Budget with recommended items exceeds per-episode target:', `$${withRecommended}`)
      console.warn('   (Target: $30-$625/episode)')
    } else if (withRecommended < 30) {
      console.warn('⚠️  Budget seems very low:', `$${withRecommended}`)
    } else {
      console.log('✅ Budget within UGC micro-budget range ($30-$625/episode)')
    }

    // 5. Return success (client will save to Firestore)
    console.log('\n✅ Budget generation complete!')
    console.log('📤 Returning budget to client for Firestore save')
    console.log('   (Client has Firebase Auth context for proper permissions)')

    return NextResponse.json({
      success: true,
      budget: generatedBudget,
      preProductionId,
      message: `Budget generated: BASE $${generatedBudget.baseBudget.total} + OPTIONAL $${generatedBudget.optionalBudget.total} (${generatedBudget.optionalBudget.crew.length + generatedBudget.optionalBudget.equipment.length + generatedBudget.optionalBudget.miscellaneous.length} items suggested)`
    })

  } catch (error: any) {
    console.error('\n❌ ERROR in budget generation API:')
    console.error('  Message:', error.message)
    console.error('  Stack:', error.stack)

    return NextResponse.json(
      {
        error: 'Budget generation failed',
        details: error.message || 'Unknown error',
        type: error.name || 'Error'
      },
      { status: 500 }
    )
  }
}

