import { NextRequest, NextResponse } from 'next/server'
import { generateStructuredContent } from '@/services/azure-openai'

export async function POST(request: NextRequest) {
  try {
    const { choiceText, choiceDescription, storyBible, episodeNumber } = await request.json()

    if (!choiceText || !storyBible) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const systemPrompt = `You are an expert story analyst and creative director. Analyze the given choice from the previous episode and determine the optimal creative parameters for continuing the story.

Your task is to analyze the choice and generate:
1. An enhanced episode goal that builds on this choice
2. Appropriate vibe settings (tone, pacing, dialogue style)
3. Director's notes that provide creative guidance

Consider the story bible context, character development, and narrative flow.`

    const analysisPrompt = `
STORY BIBLE CONTEXT:
Series: ${storyBible.seriesTitle || 'Untitled Series'}
Main Characters: ${storyBible.mainCharacters?.map((char: any) => char.name).join(', ') || 'Unknown'}
Genre: ${storyBible.genre || 'Drama'}
Theme: ${storyBible.theme || 'Character development'}

PREVIOUS EPISODE CHOICE:
Choice: "${choiceText}"
Description: "${choiceDescription || 'No description provided'}"

ANALYSIS REQUIRED:
Based on this choice from Episode ${episodeNumber - 1}, analyze what this means for Episode ${episodeNumber} and provide:

1. ENHANCED EPISODE GOAL: A refined, specific goal that builds on this choice
2. VIBE ANALYSIS: Determine the appropriate tone, pacing, and dialogue style
3. DIRECTOR'S NOTES: Creative guidance for executing this continuation

Consider:
- What consequences does this choice create?
- What emotional journey should the characters go through?
- What atmosphere and pacing would best serve this story direction?
- What specific directorial elements would enhance this narrative?

Respond with a JSON object containing:
{
  "episodeGoal": "Enhanced episode goal text",
  "vibeSettings": {
    "tone": 0-100 (0=Dark/Gritty, 100=Light/Comedic),
    "pacing": 0-100 (0=Slow Burn, 100=High Octane), 
    "dialogueStyle": 0-100 (0=Sparse/Subtextual, 100=Snappy/Expository)
  },
  "directorsNotes": "Detailed creative guidance and directorial notes"
}`

    const options = {
      temperature: 0.8,
      max_tokens: 1000
    }

    const result = await generateStructuredContent(analysisPrompt, systemPrompt, options)
    
    return NextResponse.json({ 
      success: true, 
      analysis: result 
    })

  } catch (error) {
    console.error('Choice analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze choice',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

