import { getEpisodePreProduction } from './preproduction-firestore'
import type { EpisodePreProductionData } from '@/types/preproduction'

export interface PostProductionDataContext {
  storyBibleId: string
  episodeNumber: number
  episode?: {
    title: string
    synopsis: string
    scenes: Array<{
      sceneNumber: number
      content: string
    }>
  }
  storyboards?: {
    scenes: Array<{
      sceneNumber: number
      frames: Array<{
        id: string
        shotNumber: number
        frameImage?: string
        description?: string
        cameraAngle?: string
        notes?: string
      }>
    }>
  }
  shotList?: {
    scenes: Array<{
      sceneNumber: number
      sceneTitle?: string
      location?: string
      shots: Array<{
        id: string
        shotNumber: number
        description?: string
        cameraAngle?: string
        duration?: number
        priority?: string
      }>
    }>
  }
  script?: {
    scenes: Array<{
      sceneNumber: number
      content: string
      dialogue?: Array<{
        character: string
        lines: string
      }>
    }>
  }
}

/**
 * Load post-production data for an episode
 * Combines pre-production data (storyboards, shot list, scripts) into a unified context
 */
export async function loadPostProductionData(
  storyBibleId: string,
  episodeNumber: number,
  userId?: string
): Promise<PostProductionDataContext | null> {
  try {
    if (!userId) {
      console.warn('No userId provided, cannot load post-production data')
      return null
    }

    // Load episode pre-production data
    const preProductionData = await getEpisodePreProduction(
      userId,
      storyBibleId,
      episodeNumber
    )

    if (!preProductionData) {
      console.warn(`No pre-production data found for episode ${episodeNumber}`)
      return null
    }

    // Transform pre-production data into post-production context
    const context: PostProductionDataContext = {
      storyBibleId,
      episodeNumber: preProductionData.episodeNumber,
      episode: {
        title: preProductionData.episodeTitle || `Episode ${episodeNumber}`,
        synopsis: preProductionData.episodeSynopsis || '',
        scenes: []
      }
    }

    // Extract storyboards
    if (preProductionData.storyboards) {
      context.storyboards = {
        scenes: preProductionData.storyboards.scenes?.map((scene: any) => ({
          sceneNumber: scene.sceneNumber || scene.number || 0,
          frames: (scene.frames || []).map((frame: any) => ({
            id: frame.id || frame.frameId || '',
            shotNumber: frame.shotNumber || frame.number || 0,
            frameImage: frame.frameImage,
            description: frame.description || frame.notes,
            cameraAngle: frame.cameraAngle || frame.angle,
            notes: frame.notes
          }))
        })) || []
      }
    }

    // Extract shot list
    if (preProductionData.shotList) {
      context.shotList = {
        scenes: preProductionData.shotList.scenes?.map((scene: any) => ({
          sceneNumber: scene.sceneNumber || scene.number || 0,
          sceneTitle: scene.sceneTitle || scene.title,
          location: scene.location,
          shots: (scene.shots || []).map((shot: any) => ({
            id: shot.id || shot.shotId || '',
            shotNumber: shot.shotNumber || shot.number || 0,
            description: shot.description || shot.notes,
            cameraAngle: shot.cameraAngle || shot.angle,
            duration: shot.duration || shot.estimatedDuration,
            priority: shot.priority || shot.importance
          }))
        })) || []
      }
    }

    // Extract script/breakdown data
    if (preProductionData.scriptBreakdown) {
      context.script = {
        scenes: preProductionData.scriptBreakdown.scenes?.map((scene: any) => ({
          sceneNumber: scene.sceneNumber || scene.number || 0,
          content: scene.content || scene.description || '',
          dialogue: scene.dialogue || []
        })) || []
      }
    }

    // Extract episode scenes from breakdown or script
    if (preProductionData.scriptBreakdown?.scenes) {
      context.episode = {
        ...context.episode!,
        scenes: preProductionData.scriptBreakdown.scenes.map((scene: any) => ({
          sceneNumber: scene.sceneNumber || scene.number || 0,
          content: scene.content || scene.description || ''
        }))
      }
    }

    return context
  } catch (error) {
    console.error('Error loading post-production data:', error)
    return null
  }
}







