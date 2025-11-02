/**
 * API Route: Generate Equipment
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateEquipment } from '@/services/ai-generators/equipment-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, userId, scriptData, breakdownData, storyBibleData, questionnaireAnswers } = body

    if (!preProductionId || !storyBibleId || episodeNumber === undefined) {
      return NextResponse.json({ error: 'Missing required parameters: preProductionId, storyBibleId, episodeNumber' }, { status: 400 })
    }
    if (!breakdownData) {
      return NextResponse.json({ error: 'Please generate script breakdown first' }, { status: 400 })
    }
    if (!scriptData) {
      return NextResponse.json({ error: 'Please generate script first' }, { status: 400 })
    }
    if (!storyBibleData) {
      return NextResponse.json({ error: 'Story bible data not provided by client' }, { status: 400 })
    }

    const equipment = await generateEquipment({
      scriptData,
      breakdownData,
      storyBible: storyBibleData,
      episodeNumber,
      episodeTitle: scriptData.title || `Episode ${episodeNumber}`,
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

