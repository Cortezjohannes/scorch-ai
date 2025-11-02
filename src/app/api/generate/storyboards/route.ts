/**
 * API Route: Generate Storyboard Frames
 * 
 * Generates comprehensive storyboard frames for all scenes based on script breakdown and screenplay
 * Uses EngineAIRouter with Gemini 2.5 Pro for visual storytelling and shot breakdown
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateStoryboards } from '@/services/ai-generators/storyboard-generator'
import { getStoryBible } from '@/services/story-bible-service'
import { getPreProduction } from '@/services/preproduction-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, userId, breakdownData, scriptData, storyBibleData } = body

    console.log('🖼️ Storyboard Generation API called')
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
          details: 'Script breakdown is required to identify scenes and generate storyboard frames. Go to Script Breakdown tab and generate a breakdown first.'
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
      console.warn('⚠️ Script data not provided, will use breakdown data only')
    } else {
      console.log('✅ Script data received:', scriptData.title || `Episode ${episodeNumber}`)
    }

    console.log('\n📖 Validating Story Bible data...')
    if (!storyBibleData) {
      console.error('❌ Story bible data not provided')
      return NextResponse.json(
        { error: 'Story bible data not provided by client' },
        { status: 400 }
      )
    }
    console.log('✅ Story Bible data received:', storyBibleData.seriesTitle || storyBibleData.title || 'Untitled')

    console.log('\n🤖 Generating storyboard frames with AI...')
    console.log('  Provider: Gemini 2.5 Pro (via EngineAIRouter)')
    console.log('  Target: Detailed storyboard frames for all scenes')
    console.log('  Includes: Visual descriptions, camera specs, image prompts, lighting notes')

    const storyboards = await generateStoryboards({
      breakdownData,
      scriptData: scriptData || {
        title: breakdownData.episodeTitle || `Episode ${episodeNumber}`,
        episodeNumber,
        pages: [],
        metadata: {
          pageCount: 0,
          sceneCount: breakdownData.scenes.length,
          characterCount: 0,
          estimatedRuntime: 'N/A'
        }
      },
      storyBible: storyBibleData,
      episodeNumber,
      episodeTitle: breakdownData.episodeTitle || `Episode ${episodeNumber}`,
      userId: userId || 'guest'
    })

    console.log('\n✅ Storyboard frames generated successfully!')
    console.log('  Total frames:', storyboards.totalFrames)
    console.log('  Scenes with storyboards:', storyboards.scenes.length)
    storyboards.scenes.forEach(scene => {
      console.log(`    Scene ${scene.sceneNumber}: ${scene.frames.length} shots`)
    })

    return NextResponse.json({
      success: true,
      storyboards,
      preProductionId,
      message: `Generated ${storyboards.totalFrames} storyboard frames across ${storyboards.scenes.length} scenes`
    })

  } catch (error: any) {
    console.error('\n❌ ERROR in storyboard generation API:')
    console.error('  Message:', error.message)
    console.error('  Stack:', error.stack)

    return NextResponse.json(
      {
        error: 'Storyboard generation failed',
        details: error.message || 'Unknown error',
        type: error.name || 'Error'
      },
      { status: 500 }
    )
  }
}

