import { NextRequest, NextResponse } from 'next/server'
import { generateStructuredContent } from '@/services/azure-openai'

export async function POST(request: NextRequest) {
  try {
    const { choiceText, choiceDescription, storyBible, episodeNumber } = await request.json()

    if (!choiceText || !storyBible) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const systemPrompt = `You are an expert story analyst and creative director with deep expertise in narrative structure, character development, and cinematic storytelling. Your analyses are comprehensive, detailed, and production-ready.

When analyzing choices and generating creative parameters, you:
- Provide extensive, detailed content (not brief summaries)
- Consider all narrative implications and character arcs
- Generate production-ready director's notes with specific guidance
- Create episode goals that are specific, actionable, and rich in detail
- Think deeply about tone, pacing, and stylistic choices

Your output should be thorough, professional, and immediately usable for production.`

    // Build comprehensive context
    const mainCharacters = storyBible.mainCharacters?.map((char: any) => 
      `- ${char.name}: ${char.description || char.premiseRole || 'Character'}`
    ).join('\n') || 'Unknown characters'
    
    const narrativeArcs = storyBible.narrativeArcs?.map((arc: any, idx: number) => 
      `Arc ${idx + 1}: ${arc.title || `Arc ${idx + 1}`} - ${arc.summary || 'No summary'}`
    ).join('\n') || 'No arcs defined'
    
    const themes = Array.isArray(storyBible.themes) 
      ? storyBible.themes.join(', ') 
      : storyBible.themes || storyBible.theme || 'Character development'

    const analysisPrompt = `
STORY BIBLE CONTEXT:
Series Title: ${storyBible.seriesTitle || 'Untitled Series'}
Genre: ${storyBible.genre || 'Drama'}
Premise: ${storyBible.premise?.premiseStatement || storyBible.premise || 'A compelling story unfolds...'}
Themes: ${themes}

Main Characters:
${mainCharacters}

Narrative Arcs:
${narrativeArcs}

PREVIOUS EPISODE CHOICE:
Choice: "${choiceText}"
Description: "${choiceDescription || 'No description provided'}"

This choice was made at the end of Episode ${episodeNumber - 1}, and now we're planning Episode ${episodeNumber}.

ANALYSIS REQUIRED:
Based on this choice from Episode ${episodeNumber - 1}, provide a comprehensive, detailed analysis for Episode ${episodeNumber}:

1. ENHANCED EPISODE GOAL (150-300 words):
   - A detailed, specific goal that builds directly on this choice
   - Explain what narrative threads this choice opens
   - Describe what character development should occur
   - Outline key plot points that should be addressed
   - Be specific about what this episode needs to accomplish
   - Consider the emotional and thematic implications

2. VIBE SETTINGS:
   Determine the appropriate creative parameters:
   - Tone (0-100): 0=Dark/Gritty, 50=Balanced, 100=Light/Comedic
   - Pacing (0-100): 0=Slow Burn/Contemplative, 50=Steady, 100=High Octane/Fast-Paced
   - Dialogue Style (0-100): 0=Sparse/Subtextual, 50=Balanced, 100=Snappy/Expository
   
   Consider: What atmosphere best serves this story direction? How should the pacing reflect the consequences of this choice?

3. DIRECTOR'S NOTES (200-400 words):
   Provide comprehensive creative guidance including:
   - Specific directorial elements that would enhance this narrative
   - Visual and tonal recommendations
   - Character relationship dynamics to emphasize
   - Key moments or beats to highlight
   - Emotional journey and pacing considerations
   - Production notes on atmosphere, mood, and style
   - How to visually and narratively continue from the previous choice
   - Specific scenes or moments that should be emphasized
   - Continuity notes and callbacks to previous episodes

Consider deeply:
- What immediate and long-term consequences does this choice create?
- What emotional journey should the characters go through in this episode?
- What atmosphere and pacing would best serve this story direction?
- What specific directorial elements (visual style, editing pace, music tone, etc.) would enhance this narrative?
- How should this episode feel different from or similar to previous episodes?
- What character relationships or dynamics should be explored?
- What themes should be emphasized?

Respond with a JSON object containing:
{
  "episodeGoal": "A detailed, comprehensive episode goal (150-300 words) that is specific, actionable, and rich in narrative detail",
  "vibeSettings": {
    "tone": 0-100 (0=Dark/Gritty, 100=Light/Comedic),
    "pacing": 0-100 (0=Slow Burn, 100=High Octane), 
    "dialogueStyle": 0-100 (0=Sparse/Subtextual, 100=Snappy/Expository)
  },
  "directorsNotes": "Comprehensive, detailed director's notes (200-400 words) with specific creative guidance, production notes, visual recommendations, and narrative considerations"
}`

    const options = {
      temperature: 0.85, // Increased for more creative, detailed output
      max_tokens: 2500 // Increased significantly for longer, more detailed content
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

