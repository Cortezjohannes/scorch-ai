/**
 * API Route: Generate Shot List
 * 
 * Generates comprehensive production shot lists for all scenes based on script breakdown, script data, and storyboards
 * Uses EngineAIRouter with Gemini 3 Pro Preview for technical production planning
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateShotList } from '@/services/ai-generators/shot-list-generator'
import { getStoryBible } from '@/services/story-bible-service'
import { getPreProduction } from '@/services/preproduction-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, userId, breakdownData, scriptData, storyBibleData, storyboardsData } = body

    console.log('🎬 Shot List Generation API called')
    console.log('  Pre-Production ID:', preProductionId)
    console.log('  Story Bible ID:', storyBibleId)
    console.log('  Episode Number:', episodeNumber)
    console.log('  User ID:', userId || 'GUEST MODE')

    if (!preProductionId || !storyBibleId || episodeNumber === undefined) {
      console.error('❌ Missing required parameters')
      return NextResponse.json(
        { error: 'Missing required parameters: preProductionId, storyBibleId, episodeNumber' },
        { status: 400 }
      )
    }

    console.log('\n📋 Validating Script Breakdown data...')
    if (!breakdownData) {
      console.error('❌ Script breakdown data not provided')
      return NextResponse.json(
        {
          error: 'Please generate script breakdown first',
          details: 'Script breakdown is required to identify scenes and generate shot lists. Go to Script Breakdown tab and generate a breakdown first.'
        },
        { status: 400 }
      )
    }
    console.log('✅ Script Breakdown data received')
    console.log('  Total scenes:', breakdownData.totalScenes || breakdownData.scenes?.length)

    if (!breakdownData.scenes || breakdownData.scenes.length === 0) {
      console.error('❌ No scenes found in script breakdown')
      return NextResponse.json(
        {
          error: 'Script breakdown has no scenes',
          details: 'Please generate script breakdown with scenes first. Go to Script Breakdown tab and generate a breakdown.'
        },
        { status: 400 }
      )
    }

    console.log('\n📝 Validating Script data...')
    if (!scriptData) {
      console.error('❌ Script data not provided')
      return NextResponse.json(
        {
          error: 'Please generate script first',
          details: 'Script data is required for shot list generation. Go to Scripts tab and generate a script first.'
        },
        { status: 400 }
      )
    }
    console.log('✅ Script data received:', scriptData.title || `Episode ${episodeNumber}`)

    console.log('\n📖 Validating Story Bible data...')
    if (!storyBibleData) {
      console.error('❌ Story bible data not provided')
      return NextResponse.json(
        { error: 'Story bible data not provided by client' },
        { status: 400 }
      )
    }
    console.log('✅ Story Bible data received:', storyBibleData.seriesTitle || storyBibleData.title || 'Untitled')

    console.log('\n🖼️ Checking for Storyboards data...')
    if (storyboardsData && storyboardsData.scenes && storyboardsData.scenes.length > 0) {
      console.log('✅ Storyboards data found - will use as reference for shot list')
      console.log('  Total storyboard scenes:', storyboardsData.scenes.length)
      console.log('  Shot list will reflect storyboard shots with technical specs')
    } else {
      console.log('⚠️ No storyboards found - will generate shot list directly from script breakdown')
    }

    console.log('\n🤖 Generating shot list with AI...')
    console.log('  Provider: Gemini 3 Pro Preview (via EngineAIRouter)')
    console.log('  Target: Technical production shot list for all scenes')
    console.log('  Includes: Camera specs, lens recommendations, duration estimates, priorities')

    const shotList = await generateShotList({
      breakdownData,
      scriptData,
      storyBible: storyBibleData,
      storyboardsData: storyboardsData || undefined,
      episodeNumber,
      episodeTitle: breakdownData.episodeTitle || `Episode ${episodeNumber}`,
      userId: userId || 'guest'
    })

    console.log('\n✅ Shot list generated successfully!')
    console.log('  Total shots:', shotList.totalShots)
    console.log('  Scenes with shots:', shotList.scenes.length)
    shotList.scenes.forEach(scene => {
      console.log(`    Scene ${scene.sceneNumber}: ${scene.totalShots} shots`)
    })

    return NextResponse.json({
      success: true,
      shotList,
      preProductionId,
      message: `Generated ${shotList.totalShots} shots across ${shotList.scenes.length} scenes`
    })

  } catch (error: any) {
    console.error('\n❌ ERROR in shot list generation API:')
    console.error('  Message:', error.message)
    console.error('  Stack:', error.stack)

    return NextResponse.json(
      {
        error: 'Shot list generation failed',
        details: error.message || 'Unknown error',
        type: error.name || 'Error'
      },
      { status: 500 }
    )
  }
}

