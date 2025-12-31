/**
 * API Route: Generate Casting Profiles
 * 
 * Generates comprehensive casting profiles for all characters based on script breakdown and screenplay
 * Uses EngineAIRouter with Gemini 3 Pro Preview for analytical + creative casting analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateCasting } from '@/services/ai-generators/casting-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, arcPreProductionId, episodeNumbers, userId, breakdownData, scriptData, storyBibleData, episodePreProdData } = body

    console.log('🎭 Casting Profiles Generation API called')
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
        totalScenes: 0
      }
      
      Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]: [string, any]) => {
        const epNum = parseInt(epNumStr)
        const breakdown = epPreProd.scriptBreakdown
        if (breakdown?.scenes && Array.isArray(breakdown.scenes) && breakdown.scenes.length > 0) {
          console.log(`  ✅ Episode ${epNum}: Found ${breakdown.scenes.length} scenes in breakdown`)
          aggregatedBreakdown.scenes.push(...breakdown.scenes)
          aggregatedBreakdown.totalScenes += breakdown.scenes.length
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
        { 
          error: 'Please generate script breakdown first',
          details: 'Script breakdown is required to identify characters. Go to Script Breakdown tab and generate a breakdown first.'
        },
        { status: 400 }
      )
    }

    console.log('✅ Script Breakdown data received')
    console.log('  Total scenes:', finalBreakdownData.totalScenes || finalBreakdownData.scenes?.length)
    
    // Check if breakdown has characters
    const hasCharacters = finalBreakdownData.scenes?.some((scene: any) => 
      scene.characters && scene.characters.length > 0
    )
    if (!hasCharacters) {
      console.error('❌ No characters found in script breakdown')
      return NextResponse.json(
        { 
          error: 'No characters found in script breakdown',
          details: 'Please ensure your script breakdown includes character information. Regenerate script breakdown if needed.'
        },
        { status: 400 }
      )
    }

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
        { 
          error: 'Please generate script first',
          details: 'Script data is required for character context. Go to Scripts tab and generate a screenplay first.'
        },
        { status: 400 }
      )
    }

    console.log('✅ Script data received:', finalScriptData.title || (isArcContext ? `Arc (${episodeNumbers?.length || 0} episodes)` : `Episode ${episodeNumber}`))

    // 3. Validate Story Bible
    console.log('\n📖 Validating Story Bible data...')
    if (!storyBibleData) {
      console.error('❌ Story bible data not provided')
      return NextResponse.json(
        { error: 'Story bible data not provided by client' },
        { status: 400 }
      )
    }

    console.log('✅ Story Bible data received:', storyBibleData.seriesTitle || storyBibleData.title || 'Untitled')

    // 4. Generate casting profiles with AI
    console.log('\n🤖 Generating casting profiles with AI...')
    console.log('  Provider: Gemini 3 Pro Preview (via EngineAIRouter)')
    console.log('  Target: Comprehensive profiles for all characters')
    console.log('  Includes: Archetypes, actor templates, requirements, casting notes')

    const castingData = await generateCasting({
      breakdownData: finalBreakdownData,
      scriptData: finalScriptData,
      storyBible: storyBibleData,
      episodeNumber: isArcContext ? 0 : episodeNumber, // Use 0 for arc context
      episodeTitle: finalScriptData.title || (isArcContext ? `Arc (${episodeNumbers?.length || 0} episodes)` : `Episode ${episodeNumber}`)
    })

    console.log('\n✅ Casting profiles generated successfully!')
    console.log('  Total characters:', castingData.cast.length)
    console.log('  Leads:', castingData.cast.filter(c => c.characterProfile?.priority === 'lead').length)
    console.log('  Supporting:', castingData.cast.filter(c => c.characterProfile?.priority === 'supporting').length)
    console.log('  Background:', castingData.cast.filter(c => c.characterProfile?.priority === 'extra').length)

    // 5. Return success (client will handle saving to Firestore)
    console.log('\n✅ Casting generation complete!')
    console.log('📤 Returning casting profiles to client for Firestore save')

    return NextResponse.json({
      success: true,
      casting: castingData,
      preProductionId,
      message: `Generated ${castingData.cast.length} casting profiles with archetypes and actor templates`
    })

  } catch (error: any) {
    console.error('\n❌ ERROR in casting generation API:')
    console.error('  Message:', error.message)
    console.error('  Stack:', error.stack)

    return NextResponse.json(
      {
        error: 'Casting generation failed',
        details: error.message || 'Unknown error',
        type: error.name || 'Error'
      },
      { status: 500 }
    )
  }
}

