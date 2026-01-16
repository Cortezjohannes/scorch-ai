/**
 * Payload Optimizer for API Requests
 * 
 * Optimizes large payloads to prevent timeout and memory issues,
 * especially on mobile devices like iPad/Safari
 */

interface OptimizedEpisode {
  episodeNumber: number
  title?: string
  synopsis?: string
  scenes?: Array<{
    sceneNumber: number
    title?: string
    content?: string
  }>
  // Only include essential fields
}

interface OptimizedStoryBible {
  seriesTitle?: string
  genre?: string
  tone?: string
  premise?: any
  mainCharacters?: any[]
  // Include technical sections but truncate if too large
  tensionStrategy?: any
  choiceArchitecture?: any
  livingWorldDynamics?: any
  tropeAnalysis?: any
  cohesionAnalysis?: any
  dialogueStrategy?: any
  genreEnhancement?: any
  themeIntegration?: any
  premiseIntegration?: any
  // Truncate other large fields
  [key: string]: any
}

/**
 * Optimize episode data for API requests
 * Only includes essential fields to reduce payload size
 */
export function optimizeEpisode(episode: any): OptimizedEpisode {
  if (!episode) return null as any

  return {
    episodeNumber: episode.episodeNumber,
    title: episode.title || episode.episodeTitle,
    synopsis: episode.synopsis,
    // Only include scene summaries, not full content
    scenes: episode.scenes?.map((scene: any) => ({
      sceneNumber: scene.sceneNumber,
      title: scene.title,
      // Truncate content to first 500 chars for context
      content: scene.content?.substring(0, 500) || scene.summary
    })) || []
  }
}

/**
 * Optimize all previous episodes array
 * Reduces to summaries only to minimize payload size
 */
export function optimizePreviousEpisodes(episodes: any[]): OptimizedEpisode[] {
  if (!episodes || episodes.length === 0) return []

  return episodes.map(ep => optimizeEpisode(ep))
}

/**
 * Optimize story bible by truncating large fields
 */
export function optimizeStoryBible(storyBible: any): OptimizedStoryBible {
  if (!storyBible) return storyBible

  const optimized: any = { ...storyBible }

  // Truncate very long text fields
  const maxFieldLength = 5000 // 5KB per field max
  
  const fieldsToTruncate = [
    'premise',
    'worldBuilding',
    'seriesDescription',
    'marketing',
    'productionNotes'
  ]

  fieldsToTruncate.forEach(field => {
    if (optimized[field] && typeof optimized[field] === 'string') {
      if (optimized[field].length > maxFieldLength) {
        optimized[field] = optimized[field].substring(0, maxFieldLength) + '... [truncated]'
      }
    } else if (optimized[field] && typeof optimized[field] === 'object') {
      const str = JSON.stringify(optimized[field])
      if (str.length > maxFieldLength) {
        // Try to preserve structure while truncating
        optimized[field] = JSON.parse(str.substring(0, maxFieldLength) + '"}')
      }
    }
  })

  return optimized
}

/**
 * Calculate payload size in bytes
 */
export function getPayloadSize(payload: any): number {
  try {
    return new Blob([JSON.stringify(payload)]).size
  } catch {
    return JSON.stringify(payload).length
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Check if payload is too large for mobile devices
 * iPad/Safari has stricter limits (~4-6MB practical limit)
 */
export function isPayloadTooLarge(payload: any, maxSizeMB: number = 4): boolean {
  const size = getPayloadSize(payload)
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return size > maxSizeBytes
}

/**
 * Optimize full episode generation payload
 */
export function optimizeEpisodeGenerationPayload(data: {
  storyBible: any
  episodeNumber: number
  beatSheet: string
  vibeSettings?: any
  directorsNotes?: string
  previousChoice?: string
  previousEpisode?: any
  allPreviousEpisodes?: any[]
}): {
  storyBible: any
  episodeNumber: number
  beatSheet: string
  vibeSettings?: any
  directorsNotes?: string
  previousChoice?: string
  previousEpisode?: any
  allPreviousEpisodes?: any[]
  _optimized: boolean
  _originalSize: number
  _optimizedSize: number
} {
  const originalSize = getPayloadSize(data)
  
  const optimized = {
    storyBible: optimizeStoryBible(data.storyBible),
    episodeNumber: data.episodeNumber,
    beatSheet: data.beatSheet,
    vibeSettings: data.vibeSettings,
    directorsNotes: data.directorsNotes,
    previousChoice: data.previousChoice,
    // Optimize previous episode - only include essential context
    previousEpisode: data.previousEpisode ? optimizeEpisode(data.previousEpisode) : undefined,
    // Optimize all previous episodes - reduce to summaries
    allPreviousEpisodes: data.allPreviousEpisodes ? optimizePreviousEpisodes(data.allPreviousEpisodes) : undefined,
    _optimized: true,
    _originalSize: originalSize,
    _optimizedSize: 0
  }

  optimized._optimizedSize = getPayloadSize(optimized)

  console.log(`📦 Payload optimization:`, {
    original: formatBytes(originalSize),
    optimized: formatBytes(optimized._optimizedSize),
    reduction: formatBytes(originalSize - optimized._optimizedSize),
    reductionPercent: Math.round((1 - optimized._optimizedSize / originalSize) * 100) + '%'
  })

  return optimized
}

