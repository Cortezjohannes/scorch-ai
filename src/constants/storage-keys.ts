/**
 * Unified storage keys for localStorage
 * Use these constants instead of hardcoded strings
 */
export const STORAGE_KEYS = {
  EPISODES: 'greenlit-episodes',
  STORY_BIBLE: 'greenlit-story-bible',
  USER_CHOICES: 'greenlit-user-choices',
  PREPRODUCTION: 'greenlit-preproduction-content'
} as const

// Legacy keys for migration (check these for backward compatibility)
export const LEGACY_KEYS = {
  EPISODES: ['scorched-episodes', 'reeled-episodes'],
  STORY_BIBLE: ['scorched-story-bible', 'reeled-story-bible'],
  USER_CHOICES: ['scorched-user-choices', 'reeled-user-choices'],
  PREPRODUCTION: ['scorched-preproduction-content', 'reeled-preproduction-content']
} as const


