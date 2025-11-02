/**
 * Template Types
 */

export type TemplateType = 'character' | 'world' | 'arc' | 'full_story_bible'

export interface CharacterTemplate {
  type: 'character'
  name: string
  description: string
  structure: {
    physiology: any
    sociology: any
    psychology: any
    voiceProfile: any
  }
  createdAt: Date
  createdBy?: string
}

export interface WorldTemplate {
  type: 'world'
  name: string
  description: string
  structure: {
    setting: string
    rules: string
    locations: any[]
    culture?: string
    history?: string
  }
  createdAt: Date
  createdBy?: string
}

export interface ArcTemplate {
  type: 'arc'
  name: string
  description: string
  structure: {
    arcTitle: string
    description: string
    episodes: string
    keyEvents: string[]
    characterFocus: string
    thematicPurpose: string
  }
  createdAt: Date
  createdBy?: string
}

export interface FullStoryBibleTemplate {
  type: 'full_story_bible'
  name: string
  description: string
  structure: any // Full story bible structure
  createdAt: Date
  createdBy?: string
}

export type Template = CharacterTemplate | WorldTemplate | ArcTemplate | FullStoryBibleTemplate

export interface TemplateLibrary {
  templates: Template[]
  lastUpdated: Date
}

