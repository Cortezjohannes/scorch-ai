/**
 * API Route: Generate Script
 * 
 * Generates industry-standard screenplay for a specific episode
 * Uses actual EngineAIRouter with Gemini 2.5 Pro
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateScript } from '@/services/ai-generators/script-generator'
import { getEpisode } from '@/services/episode-service'
import { getStoryBible } from '@/services/story-bible-service'
import { updatePreProduction, getPreProductionByEpisode } from '@/services/preproduction-firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preProductionId, storyBibleId, episodeNumber, userId, episodeData, storyBibleData } = body

    console.log('🎬 Script Generation API called')
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

    // 1. Use Episode Data from client (PRIORITY #1 - source of truth)
    // Client passes data to avoid Firebase Auth issues in server-side code
    console.log('\n📺 Using episode data from client...')
    const episode = episodeData
    
    if (!episode) {
      console.error('❌ Episode data not provided')
      return NextResponse.json(
        { error: `Episode data not provided by client` },
        { status: 400 }
      )
    }
    
    console.log('✅ Episode data received:', episode.title || `Episode ${episodeNumber}`)
    console.log('  Scenes:', episode.scenes?.length || 0)
    console.log('  Status:', episode.status)

    // 2. Use Story Bible Data from client (PRIORITY #2 - context)
    console.log('\n📖 Using story bible data from client...')
    const storyBible = storyBibleData
    
    if (!storyBible) {
      console.error('❌ Story bible data not provided')
      return NextResponse.json(
        { error: `Story bible data not provided by client` },
        { status: 400 }
      )
    }
    
    console.log('✅ Story Bible data received:', storyBible.seriesTitle || storyBible.title || 'Untitled')
    console.log('  Genre:', storyBible.genre || 'N/A')

    // 3. Skip existing pre-production data for now (would need Firebase Admin SDK)
    // TODO: Implement server-side Firebase Admin SDK for cross-tab consistency
    console.log('\n📋 Skipping existing pre-production data (server-side limitation)')
    const existingPreProductionData = null
    console.log('⚠️  Cross-tab consistency disabled for now (first implementation)')

    // 4. Generate the screenplay
    console.log('\n🤖 Generating screenplay with AI...')
    console.log('  Provider: Gemini 2.5 Pro (via EngineAIRouter)')
    console.log('  Target: 5 pages (~5 minutes)')
    
    const generatedScript = await generateScript({
      episode,
      storyBible,
      existingPreProductionData
    })

    console.log('\n✅ Screenplay generated successfully!')
    console.log('  Pages:', generatedScript.metadata.pageCount)
    console.log('  Scenes:', generatedScript.metadata.sceneCount)
    console.log('  Characters:', generatedScript.metadata.characterCount)
    console.log('  Runtime:', generatedScript.metadata.estimatedRuntime)

    // 5. Return success (client will handle saving to Firestore)
    console.log('\n✅ Screenplay generation complete!')
    console.log('📤 Returning script to client for Firestore save')
    console.log('   (Client has Firebase Auth context for proper permissions)')

    return NextResponse.json({
      success: true,
      script: generatedScript,
      preProductionId, // Pass back so client can save
      message: `Screenplay generated: ${generatedScript.metadata.pageCount} pages, ${generatedScript.metadata.sceneCount} scenes`
    })

  } catch (error: any) {
    console.error('\n❌ ERROR in script generation API:')
    console.error('  Message:', error.message)
    console.error('  Stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'Script generation failed',
        details: error.message || 'Unknown error',
        type: error.name || 'Error'
      },
      { status: 500 }
    )
  }
}
