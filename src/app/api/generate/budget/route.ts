/**
 * API Route: Generate Budget
 * 
 * Generates budget suggestions with BASE + OPTIONAL costs
 * Uses EngineAIRouter with Gemini 3 Pro Preview
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateBudget } from '@/services/ai-generators/budget-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, arcPreProductionId, episodeNumbers, userId, scriptData, breakdownData, storyBibleData, episodePreProdData } = body

    console.log('💰 Budget Generation API called')
    console.log('  Pre-Production ID:', preProductionId)
    console.log('  Story Bible ID:', storyBibleId)
    console.log('  Episode Number:', episodeNumber)
    console.log('  Production Assistant ID:', arcPreProductionId)
    console.log('  Episode Numbers:', episodeNumbers)
    console.log('  User ID:', userId || 'GUEST MODE')

    const isArcContext = !!arcPreProductionId
    const effectivePreProductionId = preProductionId || arcPreProductionId

    // Validate required parameters - accept either preProductionId or arcPreProductionId
    if (!effectivePreProductionId || !storyBibleId) {
      console.error('❌ Missing required parameters')
      return NextResponse.json(
        { error: 'Missing required parameters: preProductionId (or arcPreProductionId) and storyBibleId' },
        { status: 400 }
      )
    }

    // For episode context, episodeNumber is required
    // For arc context, arcPreProductionId and episodeNumbers are required
    if (!isArcContext && episodeNumber === undefined) {
      console.error('❌ Missing episodeNumber for episode context')
      return NextResponse.json(
        { error: 'Missing required parameter: episodeNumber' },
        { status: 400 }
      )
    }

    if (isArcContext && (!episodeNumbers || episodeNumbers.length === 0)) {
      console.error('❌ Missing episodeNumbers for arc context')
      return NextResponse.json(
        { error: 'Missing required parameter: episodeNumbers for arc context' },
        { status: 400 }
      )
    }

    // 1. Validate Script Breakdown exists
    console.log('\n📋 Validating Script Breakdown data...')
    
    // For arc context, try to aggregate from episodePreProdData if breakdownData is missing
    let finalBreakdownData = breakdownData
    if (isArcContext && !breakdownData && episodePreProdData) {
      console.log('📊 No breakdown data provided, aggregating from episodes...')
      const aggregatedBreakdown: any = {
        scenes: [],
        totalScenes: 0,
        totalBudgetImpact: 0
      }
      
      Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]: [string, any]) => {
        const epNum = parseInt(epNumStr)
        const breakdown = epPreProd.scriptBreakdown
        if (breakdown?.scenes && Array.isArray(breakdown.scenes) && breakdown.scenes.length > 0) {
          console.log(`  ✅ Episode ${epNum}: Found ${breakdown.scenes.length} scenes in breakdown`)
          aggregatedBreakdown.scenes.push(...breakdown.scenes)
          aggregatedBreakdown.totalScenes += breakdown.scenes.length
          aggregatedBreakdown.totalBudgetImpact += breakdown.totalBudgetImpact || 0
        }
      })
      
      if (aggregatedBreakdown.scenes.length > 0) {
        finalBreakdownData = aggregatedBreakdown
        console.log(`✅ Aggregated ${aggregatedBreakdown.scenes.length} scenes from episodes`)
      }
    }
    
    if (!finalBreakdownData) {
      console.error('❌ Script breakdown data not provided')
      return NextResponse.json(
        { error: 'Script breakdown required', details: 'Please generate script breakdown first' },
        { status: 400 }
      )
    }

    console.log('✅ Script Breakdown data received')
    console.log('  Total scenes:', finalBreakdownData.totalScenes || finalBreakdownData.scenes?.length)
    console.log('  BASE budget:', `$${finalBreakdownData.totalBudgetImpact || 0}`)

    // 2. Validate Script exists
    console.log('\n📝 Validating Script data...')
    
    // For arc context, try to aggregate from episodePreProdData if scriptData is missing
    let finalScriptData = scriptData
    if (isArcContext && !scriptData && episodePreProdData) {
      console.log('📊 No script data provided, aggregating from episodes...')
      const aggregatedScripts: any[] = []
      
      Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]: [string, any]) => {
        const epNum = parseInt(epNumStr)
        const scripts = epPreProd.scripts
        if (scripts?.fullScript) {
          console.log(`  ✅ Episode ${epNum}: Found script`)
          aggregatedScripts.push(scripts.fullScript)
        }
      })
      
      if (aggregatedScripts.length > 0) {
        finalScriptData = aggregatedScripts[0]
        console.log(`✅ Using script from Episode ${Object.entries(episodePreProdData).find(([_, ep]: [string, any]) => ep.scripts?.fullScript)?.[0] || 'unknown'}`)
      }
    }
    
    if (!finalScriptData) {
      console.error('❌ Script data not provided')
      return NextResponse.json(
        { error: 'Script required', details: 'Please generate script first' },
        { status: 400 }
      )
    }

    console.log('✅ Script data received:', finalScriptData.title || (isArcContext ? `Arc (${episodeNumbers?.length || 0} episodes)` : `Episode ${episodeNumber}`))

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
    console.log('  Provider: Gemini 3 Pro Preview (via EngineAIRouter)')
    console.log('  BASE budget: $' + finalBreakdownData.totalBudgetImpact)
    console.log('  Target range: $30-$625/episode')

    const generatedBudget = await generateBudget({
      scriptData: finalScriptData,
      breakdownData: finalBreakdownData,
      storyBible: storyBibleData,
      episodeNumber: isArcContext ? 0 : episodeNumber // Use 0 for arc context
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

