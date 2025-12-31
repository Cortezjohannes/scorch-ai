import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/services/azure-openai'
import { logger } from '@/services/console-logger'
import { runComprehensiveEngines } from '@/services/comprehensive-engines'

// Set maximum execution time to 10 minutes (600 seconds) for premium generation
export const maxDuration = 600

interface VibeSettings {
  tone: number // 0-100: Dark/Gritty <---> Light/Comedic
  pacing: number // 0-100: Slow Burn <---> High Octane
  dialogueStyle: number // 0-100: Sparse/Subtextual <---> Snappy/Expository
}

/**
 * Premium Episode Generation Endpoint
 * 
 * Currently uses standard generation flow.
 * TODO: Add 19-engine enhancement once basic flow is working.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      storyBible, 
      episodeNumber, 
      beatSheet, 
      vibeSettings, 
      directorsNotes, 
      previousChoice 
    } = body
    
    // Validation
    const validationErrors = []
    
    if (!storyBible) {
      validationErrors.push('Story bible is required')
    } else {
      if (!storyBible.seriesTitle) validationErrors.push('Story bible must have a series title')
      if (!storyBible.mainCharacters || storyBible.mainCharacters.length === 0) {
        validationErrors.push('Story bible must have at least one character')
      }
    }
    
    if (!episodeNumber || typeof episodeNumber !== 'number' || episodeNumber < 1) {
      validationErrors.push('Valid episode number is required')
    }
    
    if (!beatSheet || beatSheet.trim().length < 50) {
      validationErrors.push('Beat sheet must be at least 50 characters long')
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationErrors.join(', '),
          validationErrors
        },
        { status: 400 }
      )
    }

    logger.startNewSession(`Premium Episode ${episodeNumber} Generation`)
    logger.milestone('🌟 PREMIUM MODE (using enhanced generation)')
    
    // For now, use standard generation with higher quality settings
    // TODO: Add 19-engine enhancement pipeline
    
    const systemPrompt = `You are an elite storytelling AI with cinematic expertise. Create premium-quality episodes with:
- Deep character psychology and development
- Cinematic visual storytelling
- Rich atmospheric details
- Sophisticated dialogue with subtext
- Masterful pacing and rhythm
- Genre-specific excellence

Follow the beat sheet and vibe settings precisely while elevating every aspect to premium quality.`

    const scriptPrompt = `
PREMIUM EPISODE GENERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SERIES: ${storyBible.seriesTitle || 'Untitled Series'}
EPISODE: ${episodeNumber}
GENRE: ${storyBible.genre || 'Drama'}

BEAT SHEET:
${beatSheet}

VIBE SETTINGS:
- Tone: ${vibeSettings.tone}/100 (Dark ←→ Light)
- Pacing: ${vibeSettings.pacing}/100 (Slow ←→ Fast)
- Dialogue: ${vibeSettings.dialogueStyle}/100 (Sparse ←→ Expository)

DIRECTOR'S NOTES:
${directorsNotes || 'Apply premium storytelling techniques'}

CHARACTERS:
${storyBible.mainCharacters?.map((char: any) => `- ${char.name}: ${typeof char.description === 'string' ? char.description : JSON.stringify(char.description) || 'Character'}`).join('\n') || 'No characters'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate a premium-quality episode with 2-3 substantial scenes for a 5-minute runtime.

RETURN VALID JSON:
{
  "episodeNumber": ${episodeNumber},
  "title": "Episode Title",
  "synopsis": "Brief episode summary",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene Title",
      "content": "Rich narrative prose with dialogue, action, and atmosphere..."
    }
  ],
  "branchingOptions": [
    {"id": 1, "text": "Choice 1", "description": "...", "isCanonical": true},
    {"id": 2, "text": "Choice 2", "description": "...", "isCanonical": false},
    {"id": 3, "text": "Choice 3", "description": "...", "isCanonical": false}
  ]
}
`
    
    const result = await generateContent(scriptPrompt, {
      systemPrompt,
      temperature: 0.9,
      maxTokens: 8000
    })
    
    // Parse result
    let parsedEpisode
    try {
      parsedEpisode = JSON.parse(result)
    } catch (error) {
      const jsonMatch = result.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch) {
        parsedEpisode = JSON.parse(jsonMatch[1])
      } else {
        throw new Error('Failed to parse episode JSON')
      }
    }
    
    // Ensure required fields
    if (!parsedEpisode.scenes || !Array.isArray(parsedEpisode.scenes)) {
      parsedEpisode.scenes = [{
        sceneNumber: 1,
        title: "Episode Scene",
        content: "Episode content based on beat sheet."
      }]
    }
    
    if (!parsedEpisode.branchingOptions) {
      parsedEpisode.branchingOptions = [
        { id: 1, text: "Continue the story", isCanonical: true },
        { id: 2, text: "Explore alternative", isCanonical: false },
        { id: 3, text: "Focus on character", isCanonical: false }
      ]
    }
    
    // Run 19 comprehensive engines
    logger.milestone('Running 19 comprehensive engines...')
    const { notes: comprehensiveNotes, metadata: engineMetadata } = 
      await runComprehensiveEngines(parsedEpisode, storyBible, 'beast')
    
    logger.milestone(`Engines complete: ${engineMetadata.successfulEngines}/19 (${engineMetadata.successRate.toFixed(1)}%)`)
    
    // Add engine data to episode
    parsedEpisode.engineMetadata = engineMetadata
    parsedEpisode.comprehensiveEngineNotes = comprehensiveNotes
    
    logger.milestone('✅ Premium episode generation complete')
    
    // Add completion flags
    const enhancedEpisode = {
      ...parsedEpisode,
      _generationComplete: true,
      generationType: 'premium-enhanced'
    }
    
    return NextResponse.json({
      success: true,
      episode: enhancedEpisode,
      beatSheet,
      vibeSettings,
      directorsNotes,
      generationMethod: 'premium-enhanced'
    })
    
  } catch (error) {
    console.error('❌ Premium episode generation error:', error)
    logger.milestone('❌ Generation failed')
    
    return NextResponse.json(
      { 
        error: 'Failed to generate premium episode',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
