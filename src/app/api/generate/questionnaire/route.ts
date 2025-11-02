/**
 * API Route: Generate Contextual Questionnaire
 * 
 * Generates project-specific questions for Props/Wardrobe and Equipment generation
 * Uses EngineAIRouter with Gemini 2.5 Pro for contextual understanding
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateQuestionnaire } from '@/services/ai-generators/questionnaire-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, userId, scriptData, breakdownData, storyBibleData, castingData, questionnaireType } = body

    console.log('❓ Questionnaire Generation API called')
    console.log('  Pre-Production ID:', preProductionId)
    console.log('  Story Bible ID:', storyBibleId)
    console.log('  Episode Number:', episodeNumber)
    console.log('  Questionnaire Type:', questionnaireType || 'both')
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
          details: 'Script breakdown is required to generate contextual questions. Go to Script Breakdown tab and generate a breakdown first.'
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
          details: 'Script data is required for questionnaire context. Go to Scripts tab and generate a screenplay first.'
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

    // 4. Check for Casting Data (optional but helpful)
    if (castingData?.cast) {
      const confirmedCast = castingData.cast.filter((c: any) => c.status === 'confirmed')
      console.log('✅ Casting data received:', confirmedCast.length, 'confirmed actors')
    } else {
      console.log('⚠️ No casting data provided - questions will be more generic')
    }

    // 5. Generate questionnaire with AI
    console.log('\n🤖 Generating questionnaire with AI...')
    console.log('  Provider: Gemini 2.5 Pro (via EngineAIRouter)')
    console.log('  Target: Contextual questions for', questionnaireType || 'both')

    const questionnaire = await generateQuestionnaire({
      scriptData,
      breakdownData,
      storyBible: storyBibleData,
      castingData,
      episodeNumber,
      episodeTitle: scriptData.title || `Episode ${episodeNumber}`,
      questionnaireType: questionnaireType || 'both'
    })

    console.log('\n✅ Questionnaire generated successfully!')
    console.log('  Categories:', questionnaire.categories.length)
    const totalQuestions = questionnaire.categories.reduce((sum, cat) => sum + cat.questions.length, 0)
    console.log('  Total questions:', totalQuestions)

    // 6. Return success (client will handle saving answers)
    console.log('\n✅ Questionnaire generation complete!')
    console.log('📤 Returning questionnaire to client for user input')

    return NextResponse.json({
      success: true,
      questionnaire,
      preProductionId,
      message: `Generated ${totalQuestions} contextual questions across ${questionnaire.categories.length} categories`
    })

  } catch (error: any) {
    console.error('\n❌ ERROR in questionnaire generation API:')
    console.error('  Message:', error.message)
    console.error('  Stack:', error.stack)

    return NextResponse.json(
      {
        error: 'Questionnaire generation failed',
        details: error.message || 'Unknown error',
        type: error.name || 'Error'
      },
      { status: 500 }
    )
  }
}


