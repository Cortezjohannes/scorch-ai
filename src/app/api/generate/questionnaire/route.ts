/**
 * API Route: Generate Contextual Questionnaire
 * 
 * Generates project-specific questions for Props/Wardrobe and Equipment generation
 * Uses EngineAIRouter with Gemini 3 Pro Preview for contextual understanding
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateQuestionnaire } from '@/services/ai-generators/questionnaire-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, arcPreProductionId, episodeNumbers, episodePreProdData, userId, scriptData, breakdownData, storyBibleData, castingData, questionnaireType } = body

    const isArcContext = !!arcPreProductionId

    console.log('❓ Questionnaire Generation API called')
    console.log('  Pre-Production ID:', preProductionId)
    console.log('  Story Bible ID:', storyBibleId)
    console.log('  Episode Number:', episodeNumber)
    console.log('  Production Assistant ID:', arcPreProductionId)
    console.log('  Episode Numbers:', episodeNumbers)
    console.log('  Questionnaire Type:', questionnaireType || 'both')
    console.log('  User ID:', userId || 'GUEST MODE')
    console.log('  Context:', isArcContext ? 'ARC' : 'EPISODE')

    // Validate required parameters
    if (!preProductionId || !storyBibleId) {
      console.error('❌ Missing required parameters')
      return NextResponse.json(
        { error: 'Missing required parameters: preProductionId, storyBibleId' },
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

    // Aggregate breakdown and script data based on context
    let aggregatedBreakdown: any = null
    let aggregatedScript: any = null
    let episodeTitle = ''

    if (isArcContext) {
      // Arc context: use breakdownData from request if provided, otherwise aggregate from episodes
      console.log('\n📋 Getting Script Breakdown data for arc context...')
      
      if (breakdownData && breakdownData.scenes && breakdownData.scenes.length > 0) {
        // Use breakdown data provided directly in request body
        console.log('✅ Using breakdown data from request body')
        aggregatedBreakdown = breakdownData
        aggregatedScript = scriptData || null
      } else {
        // Aggregate from all episodes
        console.log('📊 Aggregating Script Breakdown data from episodes...')
        aggregatedBreakdown = {
          scenes: [],
          totalScenes: 0
        }
        const scripts: any[] = []

        if (episodePreProdData) {
          Object.values(episodePreProdData).forEach((epPreProd: any) => {
            if (epPreProd.scriptBreakdown?.scenes) {
              aggregatedBreakdown.scenes.push(...epPreProd.scriptBreakdown.scenes)
              aggregatedBreakdown.totalScenes += epPreProd.scriptBreakdown.scenes.length
            }
            if (epPreProd.scripts?.fullScript) {
              scripts.push(epPreProd.scripts.fullScript)
            }
          })
        }

        if (aggregatedBreakdown.scenes.length === 0) {
          console.error('❌ No script breakdown data found in any episode')
          return NextResponse.json(
            { 
              error: 'Please generate script breakdown for at least one episode first',
              details: 'Script breakdown is required to generate contextual questions. Go to Script Breakdown tab and generate a breakdown first.'
            },
            { status: 400 }
          )
        }

        aggregatedScript = scripts[0] || scriptData || null // Use first script as reference, or provided scriptData
        console.log('✅ Aggregated Script Breakdown data from episodes')
        console.log('  Total scenes:', aggregatedBreakdown.totalScenes)
        console.log('  Episodes with breakdown:', Object.values(episodePreProdData || {}).filter((ep: any) => ep?.scriptBreakdown?.scenes?.length > 0).length)
      }

      episodeTitle = `Arc (${episodeNumbers?.length || 0} episodes)`
    } else {
      // Episode context: use provided data
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

      aggregatedBreakdown = breakdownData
      aggregatedScript = scriptData
      episodeTitle = scriptData.title || `Episode ${episodeNumber}`

      console.log('✅ Script Breakdown data received')
      console.log('  Total scenes:', aggregatedBreakdown.totalScenes || aggregatedBreakdown.scenes?.length)
      console.log('✅ Script data received:', episodeTitle)
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

    // 4. Check for Casting Data (optional but helpful)
    if (castingData?.cast) {
      const confirmedCast = castingData.cast.filter((c: any) => c.status === 'confirmed')
      console.log('✅ Casting data received:', confirmedCast.length, 'confirmed actors')
    } else {
      console.log('⚠️ No casting data provided - questions will be more generic')
    }

    // 5. Generate questionnaire with AI
    console.log('\n🤖 Generating questionnaire with AI...')
    console.log('  Provider: Gemini 3 Pro Preview (via EngineAIRouter)')
    console.log('  Target: Contextual questions for', questionnaireType || 'both')
    console.log('  Context:', isArcContext ? 'ARC-WIDE' : 'EPISODE-SPECIFIC')

    const questionnaire = await generateQuestionnaire({
      scriptData: aggregatedScript,
      breakdownData: aggregatedBreakdown,
      storyBible: storyBibleData,
      castingData,
      episodeNumber: isArcContext ? 0 : episodeNumber, // Use 0 for arc context
      episodeTitle,
      questionnaireType: questionnaireType || 'both',
      isArcContext,
      episodeNumbers: isArcContext ? episodeNumbers : undefined
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


