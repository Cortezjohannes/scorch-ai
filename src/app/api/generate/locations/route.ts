/**
 * API Route: Generate Location Options
 * 
 * Generates 2-3 alternative location options per scene based on script breakdown and screenplay
 * Uses EngineAIRouter with Gemini 2.5 Pro for analytical + creative alternatives
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateLocations } from '@/services/ai-generators/location-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, userId, breakdownData, scriptData, storyBibleData, castingData } = body

    console.log('📍 Location Options Generation API called')
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
        { 
          error: 'Please generate script breakdown first',
          details: 'Script breakdown is required to identify location needs per scene. Go to Script Breakdown tab and generate a breakdown first.'
        },
        { status: 400 }
      )
    }

    console.log('✅ Script Breakdown data received')
    console.log('  Total scenes:', breakdownData.totalScenes || breakdownData.scenes?.length)

    // 2. Validate Script exists
    console.log('\n📝 Validating Script data...')
    if (!scriptData) {
      console.error('❌ Script data not provided')
      return NextResponse.json(
        { 
          error: 'Please generate script first',
          details: 'Script data is required for location context. Go to Scripts tab and generate a screenplay first.'
        },
        { status: 400 }
      )
    }

    console.log('✅ Script data received:', scriptData.title || `Episode ${episodeNumber}`)

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

    // 3b. Check for Casting Data (optional but recommended)
    if (castingData?.cast) {
      const confirmedCast = castingData.cast.filter((c: any) => c.status === 'confirmed')
      const castWithLocation = confirmedCast.filter((c: any) => c.city || c.state || c.country)
      console.log('✅ Casting data received:', confirmedCast.length, 'confirmed actors')
      console.log('  Cast with location data:', castWithLocation.length)
      if (castWithLocation.length > 0) {
        console.log('  Primary cast location:', castWithLocation[0]?.city || castWithLocation[0]?.state || castWithLocation[0]?.country)
      }
    } else {
      console.log('⚠️ No casting data provided - locations will be based on story setting only')
    }

    // 4. Generate location options with AI
    console.log('\n🤖 Generating location options with AI...')
    console.log('  Provider: Gemini 2.5 Pro (via EngineAIRouter)')
    console.log('  Target: 2-3 options per scene requirement')
    console.log('  Budget focus: $0-$500 per location (prefer $0-$150)')

    const locationOptions = await generateLocations({
      breakdownData,
      scriptData,
      storyBible: storyBibleData,
      castingData, // Pass casting data for proximity-based recommendations
      episodeNumber,
      episodeTitle: scriptData.title || `Episode ${episodeNumber}`
    })

    console.log('\n✅ Location options generated successfully!')
    console.log('  Scene requirements:', locationOptions.sceneRequirements.length)
    const totalOptions = locationOptions.sceneRequirements.reduce((sum, req) => sum + req.options.length, 0)
    console.log('  Total location options:', totalOptions)
    console.log('  Average options per scene:', (totalOptions / locationOptions.sceneRequirements.length).toFixed(1))

    // 5. Return success (client will handle selection and save to Firestore)
    console.log('\n✅ Location generation complete!')
    console.log('📤 Returning location options to client for selection')
    console.log('   (User selects preferred options, then saves to Firestore)')

    return NextResponse.json({
      success: true,
      locations: locationOptions,
      preProductionId,
      message: `Generated ${totalOptions} location options across ${locationOptions.sceneRequirements.length} scene requirements`
    })

  } catch (error: any) {
    console.error('\n❌ ERROR in location generation API:')
    console.error('  Message:', error.message)
    console.error('  Stack:', error.stack)

    return NextResponse.json(
      {
        error: 'Location generation failed',
        details: error.message || 'Unknown error',
        type: error.name || 'Error'
      },
      { status: 500 }
    )
  }
}
