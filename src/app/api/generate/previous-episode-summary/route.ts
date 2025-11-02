import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/services/azure-openai'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 [API] Previous episode summary requested')
    const { previousEpisode, seriesTitle } = await request.json()

    console.log('🔵 [API] Request data:', {
      hasEpisode: !!previousEpisode,
      episodeNumber: previousEpisode?.episodeNumber,
      episodeTitle: previousEpisode?.episodeTitle || previousEpisode?.title,
      seriesTitle,
      hasScenes: !!previousEpisode?.scenes,
      scenesCount: previousEpisode?.scenes?.length || 0,
      hasSynopsis: !!previousEpisode?.synopsis
    })

    if (!previousEpisode) {
      console.log('❌ [API] No episode data provided')
      return NextResponse.json(
        { success: false, error: 'Previous episode data is required' },
        { status: 400 }
      )
    }

    // Extract episode content
    const episodeTitle = previousEpisode.episodeTitle || previousEpisode.title || `Episode ${previousEpisode.episodeNumber}`
    const synopsis = previousEpisode.synopsis || ''
    const scenes = previousEpisode.scenes || []
    
    console.log('🔵 [API] Extracted content:', {
      episodeTitle,
      synopsisLength: synopsis.length,
      scenesCount: scenes.length,
      firstSceneFields: scenes[0] ? Object.keys(scenes[0]) : [],
      firstSceneHasScreenplay: !!scenes[0]?.screenplay,
      firstSceneHasContent: !!scenes[0]?.content,
      firstSceneHasSceneContent: !!scenes[0]?.sceneContent
    })
    
    // Build episode content for analysis
    let episodeContent = `Episode Title: ${episodeTitle}\n\n`
    
    if (synopsis) {
      episodeContent += `Synopsis: ${synopsis}\n\n`
    }
    
    if (scenes.length > 0) {
      episodeContent += `Scenes:\n`
      scenes.slice(0, 10).forEach((scene: any, index: number) => {
        episodeContent += `\nScene ${index + 1}${scene.title ? `: ${scene.title}` : ''}:\n`
        // Check multiple possible fields for scene content
        const sceneContent = scene.screenplay || scene.content || scene.sceneContent || scene.script || ''
        episodeContent += sceneContent.substring(0, 500) + '...\n'
      })
    }

    console.log('🔵 [API] Episode content length:', episodeContent.length)
    console.log('🔵 [API] First 500 chars of episode content:', episodeContent.substring(0, 500))
    console.log('🔵 [API] Calling Azure OpenAI...')

    const systemPrompt = `You are a TV show recap writer creating "Previously on..." summaries. You will be given episode content including the title, synopsis, and scene excerpts. Your job is to synthesize this into a compelling TV-style recap.

Write in past tense, keep it under 150 words, and ONLY use information from the content provided. Do not ask for content or invent details.`
    
    const userPrompt = `Write a "Previously on ${seriesTitle || 'the series'}..." recap based on the following episode content:

${episodeContent}

Write the recap now (do not ask for content, the content is above).`

    // Generate "Previously on..." style summary using Azure OpenAI
    const summary = await generateContent(userPrompt, {
      temperature: 0.3, // Lower temperature to reduce hallucination
      maxTokens: 300,
      systemPrompt: systemPrompt  // ✅ CORRECT: systemPrompt goes in options!
    })
    
    console.log('✅ [API] Summary generated:', summary.substring(0, 100) + '...')
    console.log('✅ [API] Summary length:', summary.length)

    return NextResponse.json({
      success: true,
      summary
    })
  } catch (error: any) {
    console.error('❌ [API] Error generating previous episode summary:', error)
    console.error('❌ [API] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate summary' 
      },
      { status: 500 }
    )
  }
}

