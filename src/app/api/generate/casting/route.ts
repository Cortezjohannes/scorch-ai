/**
 * API Route: Generate Casting Profiles
 * 
 * Generates comprehensive casting profiles for all characters based on script breakdown and screenplay
 * Uses EngineAIRouter with Gemini 2.5 Pro for analytical + creative casting analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateCasting } from '@/services/ai-generators/casting-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, userId, breakdownData, scriptData, storyBibleData } = body

    console.log('🎭 Casting Profiles Generation API called')
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
          details: 'Script breakdown is required to identify characters. Go to Script Breakdown tab and generate a breakdown first.'
        },
        { status: 400 }
      )
    }

    console.log('✅ Script Breakdown data received')
    console.log('  Total scenes:', breakdownData.totalScenes || breakdownData.scenes?.length)
    
    // Check if breakdown has characters
    const hasCharacters = breakdownData.scenes?.some((scene: any) => 
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
    if (!scriptData) {
      console.error('❌ Script data not provided')
      return NextResponse.json(
        { 
          error: 'Please generate script first',
          details: 'Script data is required for character context. Go to Scripts tab and generate a screenplay first.'
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

    // 4. Generate casting profiles with AI
    console.log('\n🤖 Generating casting profiles with AI...')
    console.log('  Provider: Gemini 2.5 Pro (via EngineAIRouter)')
    console.log('  Target: Comprehensive profiles for all characters')
    console.log('  Includes: Archetypes, actor templates, requirements, casting notes')

    const castingData = await generateCasting({
      breakdownData,
      scriptData,
      storyBible: storyBibleData,
      episodeNumber,
      episodeTitle: scriptData.title || `Episode ${episodeNumber}`
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

