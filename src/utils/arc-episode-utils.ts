import { Episode } from '@/services/episode-service'
import { getEpisodeRangeForArc } from '@/services/preproduction-firestore'

/**
 * Check if an episode is fully generated (not a draft)
 */
export function isEpisodeFullyGenerated(episode: Episode | undefined): boolean {
  if (!episode) return false
  // An episode is fully generated if it's not in draft status
  return episode.status !== 'draft'
}

/**
 * Check if an arc has all its episodes fully generated
 */
export function arcHasAllEpisodesGenerated(
  storyBible: any,
  arcIndex: number,
  episodes: Record<number, Episode>
): boolean {
  if (!storyBible?.narrativeArcs || !storyBible.narrativeArcs[arcIndex]) {
    return false
  }

  const episodeNumbers = getEpisodeRangeForArc(storyBible, arcIndex)
  
  if (episodeNumbers.length === 0) {
    return false
  }

  // Check if all episodes in the arc are fully generated
  return episodeNumbers.every(epNum => isEpisodeFullyGenerated(episodes[epNum]))
}

/**
 * Get the number of episodes that still need to be generated for an arc
 */
export function getRemainingEpisodesCount(
  storyBible: any,
  arcIndex: number,
  episodes: Record<number, Episode>
): number {
  if (!storyBible?.narrativeArcs || !storyBible.narrativeArcs[arcIndex]) {
    return 0
  }

  const episodeNumbers = getEpisodeRangeForArc(storyBible, arcIndex)
  
  const remainingCount = episodeNumbers.filter(
    epNum => !isEpisodeFullyGenerated(episodes[epNum])
  ).length

  return remainingCount
}

/**
 * Get arcs that have all episodes fully generated
 */
export function getReadyArcs(
  storyBible: any,
  episodes: Record<number, Episode>
): number[] {
  if (!storyBible?.narrativeArcs) {
    return []
  }

  const readyArcs: number[] = []
  
  for (let i = 0; i < storyBible.narrativeArcs.length; i++) {
    if (arcHasAllEpisodesGenerated(storyBible, i, episodes)) {
      readyArcs.push(i)
    }
  }

  return readyArcs
}

/**
 * Get total remaining episodes across all arcs
 */
export function getTotalRemainingEpisodes(
  storyBible: any,
  episodes: Record<number, Episode>
): number {
  if (!storyBible?.narrativeArcs) {
    return 0
  }

  let total = 0
  for (let i = 0; i < storyBible.narrativeArcs.length; i++) {
    total += getRemainingEpisodesCount(storyBible, i, episodes)
  }

  return total
}








































