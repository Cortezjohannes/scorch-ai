import type { PostProductionDataContext } from './postproduction-data-loader'
import type { ShotMapping } from './postproduction-shot-mapper'

export interface SceneIntelligence {
  sceneNumber: number
  script: {
    actionLines: string[]
    dialogue: string[]
    sceneDescription: string
  }
  shots: {
    total: number
    shotNumbers: number[]
    cameraAngles: string[]
  }
  vfx: {
    shotsNeedingVFX: Array<{
      shotId: string
      shotNumber: number
      reason: string
    }>
    propsToRemove: Array<{
      prop: string
      reason: string
    }>
    backgroundChanges: Array<{
      description: string
      type: string
    }>
  }
  editing: {
    suggestedCuts: Array<{
      time: number
      reason: string
    }>
    pacingNotes: string[]
    transitionSuggestions: string[]
  }
}

/**
 * Generate scene intelligence from post-production data
 * Analyzes a scene to provide editing, VFX, and post-production insights
 */
export async function generateSceneIntelligence(
  sceneNumber: number,
  data: PostProductionDataContext,
  shotMappings: ShotMapping[]
): Promise<SceneIntelligence | null> {
  try {
    // Find scene data from various sources
    const shotListScene = data.shotList?.scenes.find(
      (s) => s.sceneNumber === sceneNumber
    )
    const storyboardScene = data.storyboards?.scenes.find(
      (s) => s.sceneNumber === sceneNumber
    )
    const scriptScene = data.script?.scenes.find(
      (s) => s.sceneNumber === sceneNumber
    )

    // Extract script information
    const actionLines: string[] = []
    const dialogue: string[] = []
    let sceneDescription = ''

    if (scriptScene) {
      sceneDescription = scriptScene.content || ''
      if (scriptScene.dialogue) {
        scriptScene.dialogue.forEach((d) => {
          dialogue.push(`${d.character}: ${d.lines}`)
        })
      }
      // Extract action lines from content (non-dialogue text)
      const contentLines = scriptScene.content.split('\n').filter((line) => {
        const trimmed = line.trim()
        return trimmed && !trimmed.match(/^[A-Z][A-Z\s]+:/) // Not dialogue
      })
      actionLines.push(...contentLines)
    }

    // Extract shot information
    const sceneShots = shotMappings.filter((m) => m.sceneNumber === sceneNumber)
    const shotNumbers = sceneShots.map((s) => s.shotNumber)
    const cameraAngles = sceneShots
      .map((s) => s.cameraAngle)
      .filter((angle): angle is string => !!angle)

    // Analyze VFX needs (basic heuristics)
    const shotsNeedingVFX: SceneIntelligence['vfx']['shotsNeedingVFX'] = []
    const propsToRemove: SceneIntelligence['vfx']['propsToRemove'] = []
    const backgroundChanges: SceneIntelligence['vfx']['backgroundChanges'] = []

    if (shotListScene) {
      shotListScene.shots.forEach((shot) => {
        const description = (shot.description || '').toLowerCase()
        
        // Detect VFX needs from shot descriptions
        if (
          description.includes('green screen') ||
          description.includes('cgi') ||
          description.includes('composite') ||
          description.includes('vfx')
        ) {
          shotsNeedingVFX.push({
            shotId: shot.id,
            shotNumber: shot.shotNumber,
            reason: 'VFX requirement detected in shot description'
          })
        }

        // Detect background changes
        if (description.includes('background') || description.includes('location change')) {
          backgroundChanges.push({
            description: shot.description || 'Background change required',
            type: 'location'
          })
        }
      })
    }

    // Generate editing suggestions (basic heuristics)
    const suggestedCuts: SceneIntelligence['editing']['suggestedCuts'] = []
    const pacingNotes: string[] = []
    const transitionSuggestions: string[] = []

    if (shotListScene) {
      const totalDuration = shotListScene.shots.reduce(
        (sum, shot) => sum + (shot.duration || 5),
        0
      )

      if (totalDuration > 60) {
        pacingNotes.push('Scene may be too long, consider trimming')
      }

      if (shotListScene.shots.length > 5) {
        pacingNotes.push('Multiple shots detected, ensure smooth transitions')
        transitionSuggestions.push('Use cross-fade or match cut between shots')
      }
    }

    return {
      sceneNumber,
      script: {
        actionLines,
        dialogue,
        sceneDescription
      },
      shots: {
        total: sceneShots.length,
        shotNumbers,
        cameraAngles: [...new Set(cameraAngles)] // Unique angles
      },
      vfx: {
        shotsNeedingVFX,
        propsToRemove,
        backgroundChanges
      },
      editing: {
        suggestedCuts,
        pacingNotes,
        transitionSuggestions
      }
    }
  } catch (error) {
    console.error(`Error generating scene intelligence for scene ${sceneNumber}:`, error)
    return null
  }
}






