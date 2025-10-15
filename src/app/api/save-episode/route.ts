import { NextRequest, NextResponse } from 'next/server'

/**
 * API endpoint for saving edited episode content
 * Handles scene edits and maintains episode integrity
 */
export async function POST(request: NextRequest) {
  try {
    const episode = await request.json()
    
    if (!episode) {
      return NextResponse.json(
        { error: 'Episode data is required' },
        { status: 400 }
      )
    }

    // Validate episode structure
    if (!episode.episodeNumber && !episode.id) {
      return NextResponse.json(
        { error: 'Episode must have either episodeNumber or id' },
        { status: 400 }
      )
    }

    // Add timestamp and version tracking
    episode.lastModified = new Date().toISOString()
    episode.version = (episode.version || 0) + 1
    episode.editCount = (episode.editCount || 0) + 1

    // Validate scenes structure
    if (episode.scenes) {
      episode.scenes = episode.scenes.map((scene: any, index: number) => ({
        ...scene,
        id: scene.id || `scene_${index}`,
        lastModified: new Date().toISOString(),
        sceneNumber: index + 1
      }))
    }

    // TODO: Integrate with your existing persistence mechanism
    // This should match your current episode storage system
    
    // Example Firebase integration (uncomment when ready):
    /*
    import { db } from '@/lib/firebase'
    import { doc, setDoc } from 'firebase/firestore'
    
    const docId = episode.id || `episode_${episode.episodeNumber}`
    await setDoc(doc(db, 'episodes', docId), episode)
    */

    // Example local storage approach (for development):
    if (typeof window !== 'undefined') {
      const existingEpisodes = JSON.parse(localStorage.getItem('episodes') || '{}')
      existingEpisodes[episode.id || episode.episodeNumber] = episode
      localStorage.setItem('episodes', JSON.stringify(existingEpisodes))
    }

    // Log the save operation
    console.log('🎬 Episode Saved:', {
      id: episode.id,
      episodeNumber: episode.episodeNumber,
      title: episode.title || episode.episodeTitle,
      scenes: episode.scenes?.length || 0,
      version: episode.version,
      editCount: episode.editCount,
      timestamp: episode.lastModified
    })

    // Check if this edit affects subsequent episodes (for constraint checking)
    const hasNextEpisode = await checkForNextEpisode(episode.episodeNumber)
    if (hasNextEpisode) {
      console.log('⚠️ Warning: This episode has subsequent episodes. Future edits may be locked.')
    }

    // Emit event for real-time updates
    try {
      // Example WebSocket notification:
      // wss.broadcast({
      //   type: 'episode-updated',
      //   data: {
      //     episodeId: episode.id,
      //     episodeNumber: episode.episodeNumber,
      //     version: episode.version
      //   }
      // })
    } catch (error) {
      console.warn('Failed to emit real-time update:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'Episode saved successfully',
      episode: {
        id: episode.id,
        episodeNumber: episode.episodeNumber,
        version: episode.version,
        editCount: episode.editCount,
        lastModified: episode.lastModified,
        hasNextEpisode
      }
    })

  } catch (error) {
    console.error('Error saving episode:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save episode',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * Check if there's a next episode that would lock editing
 */
async function checkForNextEpisode(currentEpisodeNumber: number): Promise<boolean> {
  try {
    // TODO: Implement check based on your data storage
    // This should check if episode (currentEpisodeNumber + 1) exists
    
    // Example Firebase check:
    /*
    import { db } from '@/lib/firebase'
    import { collection, query, where, getDocs } from 'firebase/firestore'
    
    const q = query(
      collection(db, 'episodes'),
      where('episodeNumber', '==', currentEpisodeNumber + 1)
    )
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
    */

    // Example local storage check:
    if (typeof window !== 'undefined') {
      const existingEpisodes = JSON.parse(localStorage.getItem('episodes') || '{}')
      return Object.values(existingEpisodes).some((ep: any) => 
        ep.episodeNumber === currentEpisodeNumber + 1
      )
    }

    return false
  } catch (error) {
    console.error('Error checking for next episode:', error)
    return false
  }
}

