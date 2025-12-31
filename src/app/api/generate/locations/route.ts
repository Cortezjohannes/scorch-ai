/**
 * API Route: Generate Location Options
 * 
 * Generates 2-3 alternative location options per scene based on script breakdown and screenplay
 * Uses EngineAIRouter with Gemini 3 Pro Preview for analytical + creative alternatives
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateLocations } from '@/services/ai-generators/location-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      preProductionId, 
      storyBibleId, 
      episodeNumber, // Optional for arc context
      userId, 
      breakdownData, 
      scriptData, 
      storyBibleData, 
      castingData,
      // Arc-level parameters
      arcPreProductionId,
      arcIndex,
      episodeNumbers,
      aggregatedBreakdownData, // Aggregated breakdown with episode-scene pairs
      aggregatedScriptData // Aggregated script data from all episodes
    } = body

    const isArcContext = !!(arcPreProductionId || arcIndex !== undefined || episodeNumbers)
    const effectivePreProductionId = arcPreProductionId || preProductionId

    console.log('📍 Location Options Generation API called')
    console.log('  Pre-Production ID:', effectivePreProductionId)
    console.log('  Story Bible ID:', storyBibleId)
    console.log('  Context:', isArcContext ? 'ARC' : 'EPISODE')
    if (isArcContext) {
      console.log('  Arc Index:', arcIndex)
      console.log('  Episode Numbers:', episodeNumbers)
    } else {
      console.log('  Episode Number:', episodeNumber)
    }
    console.log('  User ID:', userId || 'GUEST MODE')

    // Validate required parameters
    if (!effectivePreProductionId || !storyBibleId) {
      console.error('❌ Missing required parameters')
      return NextResponse.json(
        { error: 'Missing required parameters: preProductionId (or arcPreProductionId) and storyBibleId' },
        { status: 400 }
      )
    }

    if (!isArcContext && episodeNumber === undefined) {
      console.error('❌ Missing episodeNumber for episode context')
      return NextResponse.json(
        { error: 'Missing required parameter: episodeNumber (required for episode context)' },
        { status: 400 }
      )
    }

    if (isArcContext && (!episodeNumbers || episodeNumbers.length === 0)) {
      console.error('❌ Missing episodeNumbers for arc context')
      return NextResponse.json(
        { error: 'Missing required parameter: episodeNumbers (required for arc context)' },
        { status: 400 }
      )
    }

    // 1. Validate Script Breakdown exists
    console.log('\n📋 Validating Script Breakdown data...')
    const effectiveBreakdownData = isArcContext ? aggregatedBreakdownData : breakdownData
    if (!effectiveBreakdownData) {
      console.error('❌ Script breakdown data not provided')
      return NextResponse.json(
        { 
          error: 'Please generate script breakdown first',
          details: isArcContext 
            ? 'Script breakdown is required for all episodes in the arc. Generate breakdowns for all episodes first.'
            : 'Script breakdown is required to identify location needs per scene. Go to Script Breakdown tab and generate a breakdown first.'
        },
        { status: 400 }
      )
    }

    console.log('✅ Script Breakdown data received')
    if (isArcContext) {
      console.log('  Total scenes across arc:', effectiveBreakdownData.totalScenes || effectiveBreakdownData.scenes?.length)
      console.log('  Episodes:', episodeNumbers)
    } else {
      console.log('  Total scenes:', effectiveBreakdownData.totalScenes || effectiveBreakdownData.scenes?.length)
    }

    // 2. Validate Script exists
    console.log('\n📝 Validating Script data...')
    const effectiveScriptData = isArcContext ? aggregatedScriptData : scriptData
    if (!effectiveScriptData) {
      console.error('❌ Script data not provided')
      return NextResponse.json(
        { 
          error: 'Please generate script first',
          details: isArcContext
            ? 'Script data is required for all episodes in the arc. Generate scripts for all episodes first.'
            : 'Script data is required for location context. Go to Scripts tab and generate a screenplay first.'
        },
        { status: 400 }
      )
    }

    if (isArcContext) {
      console.log('✅ Aggregated script data received for arc')
    } else {
      console.log('✅ Script data received:', effectiveScriptData.title || `Episode ${episodeNumber}`)
    }

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

    // 4. Generate location options with AI using streaming
    console.log('\n🤖 Generating location options with AI...')
    console.log('  Provider: Gemini 3 Pro Preview (via EngineAIRouter)')
    console.log('  Target: 2-3 options per scene requirement')
    console.log('  Budget focus: $0-$500 per location (prefer $0-$150)')
    console.log('  Streaming: Server-Sent Events enabled')

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate with progress callback
          const locationOptions = await generateLocations({
            breakdownData: effectiveBreakdownData,
            scriptData: effectiveScriptData,
            storyBible: storyBibleData,
            castingData, // Pass casting data for proximity-based recommendations
            episodeNumber: isArcContext ? undefined : episodeNumber,
            episodeTitle: isArcContext 
              ? `${storyBibleData.seriesTitle || storyBibleData.title || 'Arc'} - Episodes ${episodeNumbers.join(', ')}`
              : (effectiveScriptData.title || `Episode ${episodeNumber}`),
            // Arc-level parameters
            arcIndex,
            episodeNumbers: isArcContext ? episodeNumbers : undefined,
            // Progress callback for streaming
            onProgress: (progress) => {
              // Send progress event
              const data = `data: ${JSON.stringify({ type: 'progress', ...progress })}\n\n`
              controller.enqueue(encoder.encode(data))
            }
          })

          console.log('\n✅ Location options generated successfully!')
          console.log('  Scene requirements:', locationOptions.sceneRequirements.length)
          const totalOptions = locationOptions.sceneRequirements.reduce((sum, req) => sum + req.options.length, 0)
          console.log('  Total location options:', totalOptions)
          console.log('  Average options per scene:', (totalOptions / locationOptions.sceneRequirements.length).toFixed(1))

          // Send completion event
          const completeData = `data: ${JSON.stringify({ 
            type: 'complete', 
            locations: locationOptions,
            message: `Generated ${totalOptions} location options across ${locationOptions.sceneRequirements.length} scene requirements`
          })}\n\n`
          controller.enqueue(encoder.encode(completeData))
          controller.close()

          console.log('\n✅ Location generation complete!')
          console.log('📤 Stream closed successfully')
        } catch (error: any) {
          console.error('\n❌ ERROR in location generation:')
          console.error('  Message:', error.message)
          console.error('  Stack:', error.stack)

          // Send error event
          const errorData = `data: ${JSON.stringify({ 
            type: 'error', 
            message: error.message || 'Unknown error',
            details: error.stack
          })}\n\n`
          controller.enqueue(encoder.encode(errorData))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
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
