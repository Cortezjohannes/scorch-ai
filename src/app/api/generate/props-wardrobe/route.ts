/**
 * API Route: Generate Props/Wardrobe Breakdown
 * 
 * Generates props and wardrobe breakdowns based on script, breakdown, and questionnaire answers
 * Uses EngineAIRouter with Gemini 2.5 Pro for analytical + practical generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { generatePropsWardrobe } from '@/services/ai-generators/props-wardrobe-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, userId, scriptData, breakdownData, storyBibleData, questionnaireAnswers } = body

    console.log('🎬 Props/Wardrobe Generation API called')
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
          details: 'Script breakdown is required to identify props and wardrobe needs. Go to Script Breakdown tab and generate a breakdown first.'
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
          details: 'Script data is required for props/wardrobe context. Go to Scripts tab and generate a screenplay first.'
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

    // 4. Check for Questionnaire Answers (optional but recommended)
    if (questionnaireAnswers && Object.keys(questionnaireAnswers).length > 0) {
      console.log('✅ Questionnaire answers received:', Object.keys(questionnaireAnswers).length, 'answers')
      console.log('  Will use answers to determine source (actor-owned, borrow, etc.)')
    } else {
      console.log('⚠️ No questionnaire answers provided - will use default assumptions')
    }

    // 5. Generate props/wardrobe with AI
    console.log('\n🤖 Generating props/wardrobe with AI...')
    console.log('  Provider: Gemini 2.5 Pro (via EngineAIRouter)')
    console.log('  Target: Comprehensive props and wardrobe breakdown')
    console.log('  Budget focus: $5-$350 per episode (micro-budget)')

    const propsWardrobeData = await generatePropsWardrobe({
      scriptData,
      breakdownData,
      storyBible: storyBibleData,
      episodeNumber,
      episodeTitle: scriptData.title || `Episode ${episodeNumber}`,
      questionnaireAnswers
    })

    console.log('\n✅ Props/Wardrobe generated successfully!')
    console.log('  Props:', propsWardrobeData.props.length)
    console.log('  Wardrobe:', propsWardrobeData.wardrobe.length)
    console.log('  Total cost: $', propsWardrobeData.totalCost)
    console.log('  Total items:', propsWardrobeData.totalItems)

    // 6. Return success (client will save to Firestore)
    console.log('\n✅ Props/Wardrobe generation complete!')
    console.log('📤 Returning props/wardrobe breakdown to client')

    return NextResponse.json({
      success: true,
      propsWardrobe: propsWardrobeData,
      preProductionId,
      message: `Generated ${propsWardrobeData.props.length} props and ${propsWardrobeData.wardrobe.length} wardrobe items (Total: $${propsWardrobeData.totalCost})`
    })

  } catch (error: any) {
    console.error('\n❌ ERROR in props/wardrobe generation API:')
    console.error('  Message:', error.message)
    console.error('  Stack:', error.stack)

    return NextResponse.json(
      {
        error: 'Props/Wardrobe generation failed',
        details: error.message || 'Unknown error',
        type: error.name || 'Error'
      },
      { status: 500 }
    )
  }
}


