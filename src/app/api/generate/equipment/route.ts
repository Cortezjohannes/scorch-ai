/**
 * API Route: Generate Equipment
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateEquipment } from '@/services/ai-generators/equipment-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, arcPreProductionId, episodeNumbers, userId, scriptData, breakdownData, storyBibleData, questionnaireAnswers, episodePreProdData } = body

    const isArcContext = !!arcPreProductionId
    const effectivePreProductionId = preProductionId || arcPreProductionId

    // Validate required parameters - accept either preProductionId or arcPreProductionId
    if (!effectivePreProductionId || !storyBibleId) {
      return NextResponse.json({ error: 'Missing required parameters: preProductionId (or arcPreProductionId) and storyBibleId' }, { status: 400 })
    }

    // For episode context, episodeNumber is required
    // For arc context, arcPreProductionId and episodeNumbers are required
    if (!isArcContext && episodeNumber === undefined) {
      return NextResponse.json({ error: 'Missing required parameter: episodeNumber' }, { status: 400 })
    }

    if (isArcContext && (!episodeNumbers || episodeNumbers.length === 0)) {
      return NextResponse.json({ error: 'Missing required parameter: episodeNumbers for arc context' }, { status: 400 })
    }

    // Aggregate breakdown and script data based on context
    let finalBreakdownData = breakdownData
    let finalScriptData = scriptData

    if (isArcContext) {
      // Arc context: use breakdownData from request if provided, otherwise aggregate from episodes
      if (!finalBreakdownData && episodePreProdData) {
        console.log('📊 Aggregating breakdown data from episodes...')
        const aggregatedBreakdown: any = {
          scenes: [],
          totalScenes: 0
        }
        const scripts: any[] = []

        Object.values(episodePreProdData).forEach((epPreProd: any) => {
          if (epPreProd.scriptBreakdown?.scenes) {
            aggregatedBreakdown.scenes.push(...epPreProd.scriptBreakdown.scenes)
            aggregatedBreakdown.totalScenes += epPreProd.scriptBreakdown.scenes.length
          }
          if (epPreProd.scripts?.fullScript) {
            scripts.push(epPreProd.scripts.fullScript)
          }
        })

        if (aggregatedBreakdown.scenes.length > 0) {
          finalBreakdownData = aggregatedBreakdown
          console.log(`✅ Aggregated ${aggregatedBreakdown.scenes.length} scenes from episodes`)
        }

        if (scripts.length > 0 && !finalScriptData) {
          finalScriptData = scripts[0]
        }
      }
    }

    if (!finalBreakdownData) {
      return NextResponse.json({ error: 'Please generate script breakdown first' }, { status: 400 })
    }
    if (!finalScriptData) {
      return NextResponse.json({ error: 'Please generate script first' }, { status: 400 })
    }
    if (!storyBibleData) {
      return NextResponse.json({ error: 'Story bible data not provided by client' }, { status: 400 })
    }

    const equipment = await generateEquipment({
      scriptData: finalScriptData,
      breakdownData: finalBreakdownData,
      storyBible: storyBibleData,
      episodeNumber: isArcContext ? 0 : episodeNumber, // Use 0 for arc context
      episodeTitle: finalScriptData.title || (isArcContext ? `Arc (${episodeNumbers?.length || 0} episodes)` : `Episode ${episodeNumber}`),
      questionnaireAnswers: questionnaireAnswers || {}
    })

    return NextResponse.json({
      success: true,
      equipment,
      preProductionId,
      message: `Generated ${equipment.totalItems} equipment items (Total: $${equipment.totalCost})`
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Equipment generation failed', details: error.message || 'Unknown error' }, { status: 500 })
  }
}

