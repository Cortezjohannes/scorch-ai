import { NextRequest, NextResponse } from 'next/server'
import { analyzeStoryForEpisodeGeneration } from '@/services/story-analyzer'
import { logger } from '@/services/console-logger'

// Set maximum execution time to 2 minutes (120 seconds) - analysis is fast
export const maxDuration = 120

/**
 * API Endpoint: Analyze Story for Episode Generation
 * 
 * Receives story bible and returns intelligent vibe settings,
 * director's notes, and episode goal for episode generation.
 * 
 * Used by "Surprise Me" feature and auto-generation workflows.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storyBible, episodeNumber, previousChoice } = body
    
    // Validation
    if (!storyBible) {
      return NextResponse.json(
        { error: 'Story bible is required' },
        { status: 400 }
      )
    }
    
    if (!episodeNumber || typeof episodeNumber !== 'number' || episodeNumber < 1) {
      return NextResponse.json(
        { error: 'Valid episode number is required' },
        { status: 400 }
      )
    }
    
    logger.startNewSession(`Story Analysis - Episode ${episodeNumber}`)
    
    console.log(`📊 Analyzing story for episode ${episodeNumber} settings...`)
    
    // Perform analysis
    const settings = await analyzeStoryForEpisodeGeneration(
      storyBible,
      episodeNumber,
      previousChoice
    )
    
    logger.milestone(`Analysis complete: Tone ${settings.vibeSettings.tone}, Pacing ${settings.vibeSettings.pacing}, Dialogue ${settings.vibeSettings.dialogueStyle}`)
    
    return NextResponse.json({
      success: true,
      settings,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Story analysis error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    logger.error('Story Analysis', 'Analysis Engine', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json(
      { 
        error: 'Story analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}










