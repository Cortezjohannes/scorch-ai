import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/services/azure-openai'

/**
 * API endpoint for regenerating episode scenes after edits
 * Uses AI to regenerate subsequent scenes based on the edited content
 */
export async function POST(request: NextRequest) {
  try {
    const { episode, fromSceneIndex, contextFromEdit } = await request.json()
    
    if (!episode || fromSceneIndex === undefined) {
      return NextResponse.json(
        { error: 'Episode and fromSceneIndex are required' },
        { status: 400 }
      )
    }

    console.log(`🔄 Regenerating scenes from index ${fromSceneIndex} for Episode ${episode.episodeNumber}`)

    // Get the scenes that need to be regenerated
    const scenesToRegenerate = episode.scenes.slice(fromSceneIndex)
    
    if (scenesToRegenerate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scenes to regenerate',
        updatedEpisode: episode
      })
    }

    // Build context for regeneration
    const contextScenes = episode.scenes.slice(0, fromSceneIndex)
    const editedContext = contextFromEdit || (contextScenes.length > 0 ? contextScenes[contextScenes.length - 1] : null)

    // Generate regeneration prompt
    const regenerationPrompt = `You are regenerating scenes for an episode after a user edit. 

EPISODE CONTEXT:
- Episode ${episode.episodeNumber}: ${episode.title || episode.episodeTitle}
- Synopsis: ${episode.synopsis || episode.summary || 'Not provided'}

EXISTING SCENES (for context):
${contextScenes.map((scene: any, index: number) => `
Scene ${index + 1}: ${scene.title || 'Untitled'}
Location: ${scene.location || 'Not specified'}
Content: ${scene.content || scene.description || 'No content'}
`).join('\n')}

${editedContext ? `
MOST RECENT EDIT CONTEXT:
Scene: ${editedContext.title || 'Untitled'}
Content: ${editedContext.content || editedContext.description || 'No content'}
Location: ${editedContext.location || 'Not specified'}
` : ''}

SCENES TO REGENERATE (${scenesToRegenerate.length} scenes):
${scenesToRegenerate.map((scene: any, index: number) => `
Scene ${fromSceneIndex + index + 1}: ${scene.title || 'Untitled'}
Original content: ${scene.content || scene.description || 'No content'}
`).join('\n')}

TASK: Regenerate the scenes starting from Scene ${fromSceneIndex + 1}, ensuring they:
1. Flow naturally from the existing/edited content
2. Maintain narrative coherence and character consistency
3. Build towards the episode's conclusion
4. Incorporate any changes from the recent edit
5. Follow the same structure and style as existing scenes

Return ONLY valid JSON in this exact format:
{
  "regeneratedScenes": [
    {
      "id": "scene_${fromSceneIndex + 1}",
      "title": "Scene title",
      "location": "Scene location",
      "content": "Detailed scene content and action",
      "sceneNumber": ${fromSceneIndex + 1},
      "goal": {
        "character": "Main character in scene",
        "objective": "What they want to achieve",
        "stakes": "What happens if they fail"
      },
      "conflict": {
        "type": "external|internal|interpersonal|situational",
        "description": "The conflict in this scene"
      },
      "dialogueApproach": {
        "subtext": "What's really being discussed",
        "strategy": "How characters use dialogue tactically"
      }
    }
  ],
  "narrativeNotes": "Brief explanation of how the regenerated scenes connect to the edited content"
}`

    console.log('🤖 Calling AI for scene regeneration...')

    // Call AI service for regeneration
    const aiResponse = await generateContent(regenerationPrompt, {
      temperature: 0.8, // Higher creativity for regeneration
      maxTokens: 2000
    })

    if (!aiResponse) {
      throw new Error('AI regeneration failed')
    }

    // Parse AI response
    let regenerationResult
    try {
      regenerationResult = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        regenerationResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid AI response format')
      }
    }

    if (!regenerationResult.regeneratedScenes || !Array.isArray(regenerationResult.regeneratedScenes)) {
      throw new Error('AI response missing regeneratedScenes array')
    }

    // Update episode with regenerated scenes
    const updatedEpisode = { ...episode }
    const newScenes = [...updatedEpisode.scenes.slice(0, fromSceneIndex)]

    // Add regenerated scenes
    regenerationResult.regeneratedScenes.forEach((regenScene: any, index: number) => {
      newScenes.push({
        ...regenScene,
        id: regenScene.id || `scene_${fromSceneIndex + index}`,
        sceneNumber: fromSceneIndex + index + 1,
        regenerated: true,
        regeneratedAt: new Date().toISOString(),
        originalScene: scenesToRegenerate[index] || null
      })
    })

    updatedEpisode.scenes = newScenes
    updatedEpisode.lastRegeneration = {
      timestamp: new Date().toISOString(),
      fromSceneIndex,
      scenesRegenerated: regenerationResult.regeneratedScenes.length,
      narrativeNotes: regenerationResult.narrativeNotes
    }

    console.log(`✅ Regenerated ${regenerationResult.regeneratedScenes.length} scenes`)

    // Save the updated episode
    try {
      const saveResponse = await fetch('/api/save-episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEpisode)
      })

      if (!saveResponse.ok) {
        console.warn('Failed to auto-save regenerated episode')
      }
    } catch (saveError) {
      console.warn('Failed to auto-save regenerated episode:', saveError)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully regenerated ${regenerationResult.regeneratedScenes.length} scenes`,
      updatedEpisode,
      regenerationInfo: {
        fromSceneIndex,
        scenesRegenerated: regenerationResult.regeneratedScenes.length,
        narrativeNotes: regenerationResult.narrativeNotes,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error regenerating scenes:', error)
    return NextResponse.json(
      { 
        error: 'Failed to regenerate scenes',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for checking regeneration status or history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const episodeId = searchParams.get('episodeId')

    if (!episodeId) {
      return NextResponse.json(
        { error: 'Episode ID is required' },
        { status: 400 }
      )
    }

    // TODO: Fetch regeneration history from your data store
    // This is a placeholder implementation
    const regenerationHistory = {
      episodeId,
      totalRegenerations: 0,
      lastRegeneration: null,
      availableForRegeneration: true
    }

    return NextResponse.json({
      success: true,
      regenerationHistory
    })

  } catch (error) {
    console.error('Error fetching regeneration history:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch regeneration history',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

