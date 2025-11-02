/**
 * Timeline Types
 */

export interface TimelineEvent {
  id: string
  title: string
  description: string
  episodeNumber: number
  sceneReference?: string
  timestamp?: string // in-universe time if specified
  type: 'character_intro' | 'plot_event' | 'world_reveal' | 'relationship_change' | 'major_decision'
  relatedCharacters: string[]
  relatedLocations: string[]
  significance: number // 1-10
  createdAt?: Date
  source: 'auto' | 'manual' | 'episode_reflection'
}

export interface Timeline {
  events: TimelineEvent[]
  chronologyType: 'episodic' | 'flashbacks' | 'non-linear'
  startDate?: string // in-universe start date
  endDate?: string // in-universe end date
}

export interface TimelineFilter {
  type?: TimelineEvent['type'][]
  character?: string
  episode?: number
  minSignificance?: number
  searchQuery?: string
}

