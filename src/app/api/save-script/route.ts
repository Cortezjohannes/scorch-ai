import { NextRequest, NextResponse } from 'next/server'

/**
 * API endpoint for saving edited script content
 * Pre-production scripts are always editable
 */
export async function POST(request: NextRequest) {
  try {
    const script = await request.json()
    
    if (!script) {
      return NextResponse.json(
        { error: 'Script data is required' },
        { status: 400 }
      )
    }

    // Add timestamp and version tracking
    script.lastModified = new Date().toISOString()
    script.version = (script.version || 0) + 1
    script.editCount = (script.editCount || 0) + 1

    // Validate and normalize script structure
    if (script.episodes) {
      script.episodes = script.episodes.map((episode: any, episodeIndex: number) => {
        const normalizedEpisode = {
          ...episode,
          id: episode.id || `episode_${episodeIndex}`,
          lastModified: new Date().toISOString()
        }

        if (normalizedEpisode.scenes) {
          normalizedEpisode.scenes = normalizedEpisode.scenes.map((scene: any, sceneIndex: number) => {
            const normalizedScene = {
              ...scene,
              id: scene.id || `scene_${sceneIndex}`,
              lastModified: new Date().toISOString()
            }

            if (normalizedScene.elements) {
              normalizedScene.elements = normalizedScene.elements.map((element: any, elementIndex: number) => ({
                ...element,
                id: element.id || `element_${elementIndex}`,
                lastModified: new Date().toISOString()
              }))
            }

            return normalizedScene
          })
        }

        return normalizedEpisode
      })
    }

    // Calculate script statistics
    const stats = calculateScriptStats(script)

    // TODO: Integrate with your existing persistence mechanism
    // This should match your current pre-production storage system
    
    // Example Firebase integration (uncomment when ready):
    /*
    import { db } from '@/lib/firebase'
    import { doc, setDoc } from 'firebase/firestore'
    
    const docId = script.id || 'main-script'
    await setDoc(doc(db, 'scripts', docId), script)
    */

    // Example local storage approach (for development):
    if (typeof window !== 'undefined') {
      localStorage.setItem('script', JSON.stringify(script))
    }

    // Log the save operation
    console.log('📝 Script Saved:', {
      id: script.id || 'main-script',
      episodes: stats.episodeCount,
      scenes: stats.sceneCount,
      elements: stats.elementCount,
      version: script.version,
      editCount: script.editCount,
      timestamp: script.lastModified
    })

    // Emit event for real-time updates
    try {
      // Example WebSocket notification:
      // wss.broadcast({
      //   type: 'script-updated',
      //   data: {
      //     scriptId: script.id,
      //     version: script.version,
      //     stats
      //   }
      // })
    } catch (error) {
      console.warn('Failed to emit real-time update:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'Script saved successfully',
      script: {
        id: script.id || 'main-script',
        version: script.version,
        editCount: script.editCount,
        lastModified: script.lastModified,
        stats
      }
    })

  } catch (error) {
    console.error('Error saving script:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save script',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * Calculate statistics about the script
 */
function calculateScriptStats(script: any) {
  const stats = {
    episodeCount: 0,
    sceneCount: 0,
    elementCount: 0,
    pageEstimate: 0,
    wordCount: 0,
    dialogueLines: 0,
    actionLines: 0
  }

  if (script.episodes) {
    stats.episodeCount = script.episodes.length

    script.episodes.forEach((episode: any) => {
      if (episode.scenes) {
        stats.sceneCount += episode.scenes.length

        episode.scenes.forEach((scene: any) => {
          if (scene.elements) {
            stats.elementCount += scene.elements.length

            scene.elements.forEach((element: any) => {
              if (element.content) {
                const wordCount = element.content.split(/\s+/).length
                stats.wordCount += wordCount

                switch (element.type) {
                  case 'dialogue':
                    stats.dialogueLines++
                    break
                  case 'action':
                    stats.actionLines++
                    break
                }
              }
            })
          }
        })
      }
    })
  }

  // Rough page estimate (250 words per page for screenplays)
  stats.pageEstimate = Math.ceil(stats.wordCount / 250)

  return stats
}

