import type { PostProductionDataContext } from './postproduction-data-loader'

export interface ShotMapping {
  sceneNumber: number
  shotId: string
  shotNumber: number
  storyboardFrameId?: string
  storyboardFrameNumber?: number
  description?: string
  cameraAngle?: string
}

/**
 * Map shots from shot list to corresponding storyboard frames
 * Creates a unified mapping between production shots and visual storyboards
 */
export function mapShotsToStoryboards(
  shotList: PostProductionDataContext['shotList'],
  storyboards: PostProductionDataContext['storyboards']
): ShotMapping[] {
  if (!shotList || !storyboards) {
    return []
  }

  const mappings: ShotMapping[] = []

  // Iterate through shot list scenes
  shotList.scenes.forEach((shotScene) => {
    // Find corresponding storyboard scene
    const storyboardScene = storyboards.scenes.find(
      (sbScene) => sbScene.sceneNumber === shotScene.sceneNumber
    )

    if (!storyboardScene) {
      // If no matching storyboard scene, still include shots without frame mapping
      shotScene.shots.forEach((shot) => {
        mappings.push({
          sceneNumber: shotScene.sceneNumber,
          shotId: shot.id,
          shotNumber: shot.shotNumber,
          description: shot.description,
          cameraAngle: shot.cameraAngle
        })
      })
      return
    }

    // Map shots to frames by shot number
    shotScene.shots.forEach((shot) => {
      // Try to find matching frame by shot number
      const matchingFrame = storyboardScene.frames.find(
        (frame) => frame.shotNumber === shot.shotNumber
      )

      mappings.push({
        sceneNumber: shotScene.sceneNumber,
        shotId: shot.id,
        shotNumber: shot.shotNumber,
        storyboardFrameId: matchingFrame?.id,
        storyboardFrameNumber: matchingFrame?.shotNumber,
        description: shot.description || matchingFrame?.description,
        cameraAngle: shot.cameraAngle || matchingFrame?.cameraAngle
      })
    })
  })

  return mappings
}








