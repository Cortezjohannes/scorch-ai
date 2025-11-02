/**
 * Template Manager Service
 * 
 * Manages reusable templates for characters, worlds, and story arcs
 * Integrates with Firestore for persistent storage
 */

import { Template, CharacterTemplate, WorldTemplate, ArcTemplate, FullStoryBibleTemplate } from '@/types/templates'
import { 
  saveTemplate as saveTemplateToFirestore, 
  getTemplates as getTemplatesFromFirestore, 
  deleteTemplate as deleteTemplateFromFirestore,
  incrementTemplateUsage 
} from './story-bible-firestore'

// ============================================================================
// TEMPLATE MANAGER SERVICE
// ============================================================================

export class TemplateManagerService {
  private static instance: TemplateManagerService
  private templates: Map<string, Template> = new Map() // Memory fallback

  static getInstance(): TemplateManagerService {
    if (!TemplateManagerService.instance) {
      TemplateManagerService.instance = new TemplateManagerService()
    }
    return TemplateManagerService.instance
  }

  /**
   * Create a character template
   */
  async createCharacterTemplate(
    name: string,
    description: string,
    character: any,
    userId?: string
  ): Promise<CharacterTemplate> {
    const template: CharacterTemplate = {
      type: 'character',
      name,
      description,
      structure: {
        physiology: character.physiology || {},
        sociology: character.sociology || {},
        psychology: character.psychology || {},
        voiceProfile: character.voiceProfile || {}
      },
      createdAt: new Date(),
      createdBy: userId,
      tags: [],
      usageCount: 0
    }

    // Save to Firestore if userId
    if (userId) {
      try {
        const templateId = await saveTemplateToFirestore(userId, template)
        template.id = templateId
        console.log(`✅ Character template saved to Firestore: ${name}`)
      } catch (error) {
        console.error('❌ Failed to save template to Firestore:', error)
        // Fall back to memory
        const id = this.generateTemplateId(template)
        template.id = id
        this.templates.set(id, template)
      }
    } else {
      // Memory only
      const id = this.generateTemplateId(template)
      template.id = id
      this.templates.set(id, template)
    }

    console.log(`✅ Character template created: ${name}`)
    return template
  }

  /**
   * Create a world template
   */
  async createWorldTemplate(
    name: string,
    description: string,
    worldBuilding: any,
    userId?: string
  ): Promise<WorldTemplate> {
    const template: WorldTemplate = {
      type: 'world',
      name,
      description,
      structure: {
        setting: worldBuilding.setting || '',
        rules: worldBuilding.rules || '',
        locations: worldBuilding.locations || [],
        culture: worldBuilding.culture,
        history: worldBuilding.history
      },
      createdAt: new Date(),
      createdBy: userId,
      tags: [],
      usageCount: 0
    }

    // Save to Firestore if userId
    if (userId) {
      try {
        const templateId = await saveTemplateToFirestore(userId, template)
        template.id = templateId
        console.log(`✅ World template saved to Firestore: ${name}`)
      } catch (error) {
        console.error('❌ Failed to save template to Firestore:', error)
        // Fall back to memory
        const id = this.generateTemplateId(template)
        template.id = id
        this.templates.set(id, template)
      }
    } else {
      // Memory only
      const id = this.generateTemplateId(template)
      template.id = id
      this.templates.set(id, template)
    }

    console.log(`✅ World template created: ${name}`)
    return template
  }

  /**
   * Create an arc template
   */
  async createArcTemplate(
    name: string,
    description: string,
    arc: any,
    userId?: string
  ): Promise<ArcTemplate> {
    const template: ArcTemplate = {
      type: 'arc',
      name,
      description,
      structure: {
        arcTitle: arc.arcTitle || arc.name || '',
        description: arc.description || '',
        episodes: arc.episodes || '',
        keyEvents: arc.keyEvents || [],
        characterFocus: arc.characterFocus || '',
        thematicPurpose: arc.thematicPurpose || ''
      },
      createdAt: new Date(),
      createdBy: userId,
      tags: [],
      usageCount: 0
    }

    // Save to Firestore if userId
    if (userId) {
      try {
        const templateId = await saveTemplateToFirestore(userId, template)
        template.id = templateId
        console.log(`✅ Arc template saved to Firestore: ${name}`)
      } catch (error) {
        console.error('❌ Failed to save template to Firestore:', error)
        // Fall back to memory
        const id = this.generateTemplateId(template)
        template.id = id
        this.templates.set(id, template)
      }
    } else {
      // Memory only
      const id = this.generateTemplateId(template)
      template.id = id
      this.templates.set(id, template)
    }

    console.log(`✅ Arc template created: ${name}`)
    return template
  }

  /**
   * Create a full story bible template
   */
  async createFullTemplate(
    name: string,
    description: string,
    storyBible: any,
    userId?: string
  ): Promise<FullStoryBibleTemplate> {
    const template: FullStoryBibleTemplate = {
      type: 'full_story_bible',
      name,
      description,
      structure: JSON.parse(JSON.stringify(storyBible)), // Deep clone
      createdAt: new Date(),
      createdBy: userId,
      tags: [],
      usageCount: 0
    }

    // Save to Firestore if userId
    if (userId) {
      try {
        const templateId = await saveTemplateToFirestore(userId, template)
        template.id = templateId
        console.log(`✅ Full template saved to Firestore: ${name}`)
      } catch (error) {
        console.error('❌ Failed to save template to Firestore:', error)
        // Fall back to memory
        const id = this.generateTemplateId(template)
        template.id = id
        this.templates.set(id, template)
      }
    } else {
      // Memory only
      const id = this.generateTemplateId(template)
      template.id = id
      this.templates.set(id, template)
    }

    console.log(`✅ Full story bible template created: ${name}`)
    return template
  }

  /**
   * Get all templates
   */
  async getAllTemplates(userId?: string): Promise<Template[]> {
    if (userId) {
      try {
        return await getTemplatesFromFirestore(userId)
      } catch (error) {
        console.error('❌ Failed to get templates from Firestore:', error)
        // Fall back to memory
        return Array.from(this.templates.values())
      }
    }
    return Array.from(this.templates.values())
  }

  /**
   * Get templates by type
   */
  async getTemplatesByType(
    type: Template['type'], 
    userId?: string
  ): Promise<Template[]> {
    if (userId) {
      try {
        return await getTemplatesFromFirestore(userId, type)
      } catch (error) {
        console.error('❌ Failed to get templates from Firestore:', error)
        // Fall back to memory
        const allTemplates = Array.from(this.templates.values())
        return allTemplates.filter(t => t.type === type)
      }
    }
    
    const allTemplates = Array.from(this.templates.values())
    return allTemplates.filter(t => t.type === type)
  }

  /**
   * Get a specific template
   */
  getTemplate(templateId: string): Template | undefined {
    return this.templates.get(templateId)
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string, userId?: string): Promise<boolean> {
    if (userId) {
      try {
        await deleteTemplateFromFirestore(userId, templateId)
        console.log(`🗑️ Template deleted from Firestore: ${templateId}`)
        return true
      } catch (error) {
        console.error('❌ Failed to delete template from Firestore:', error)
        // Fall back to memory
        return this.templates.delete(templateId)
      }
    }
    
    const deleted = this.templates.delete(templateId)
    if (deleted) {
      console.log(`🗑️ Template deleted: ${templateId}`)
    }
    return deleted
  }

  /**
   * Increment template usage (when applied)
   */
  async trackTemplateUsage(templateId: string, userId?: string): Promise<void> {
    if (userId) {
      try {
        await incrementTemplateUsage(userId, templateId)
      } catch (error) {
        console.error('❌ Failed to track template usage:', error)
      }
    }
  }

  /**
   * Apply character template
   */
  applyCharacterTemplate(template: CharacterTemplate): any {
    return {
      name: 'New Character',
      archetype: 'To be defined',
      premiseFunction: 'To be defined',
      ...template.structure,
      createdFrom: template.name
    }
  }

  /**
   * Apply world template
   */
  applyWorldTemplate(template: WorldTemplate): any {
    return {
      ...template.structure,
      createdFrom: template.name
    }
  }

  /**
   * Apply arc template
   */
  applyArcTemplate(template: ArcTemplate): any {
    return {
      ...template.structure,
      createdFrom: template.name
    }
  }

  /**
   * Merge template with existing data
   */
  mergeTemplate(
    template: Template,
    existingData: any,
    strategy: 'replace' | 'append' | 'hybrid' = 'hybrid'
  ): any {
    switch (strategy) {
      case 'replace':
        return template.type === 'full_story_bible'
          ? (template as FullStoryBibleTemplate).structure
          : this.applyTemplate(template)

      case 'append':
        if (template.type === 'character') {
          return {
            ...existingData,
            characters: [
              ...(existingData.characters || []),
              this.applyCharacterTemplate(template as CharacterTemplate)
            ]
          }
        } else if (template.type === 'arc') {
          return {
            ...existingData,
            narrativeArcs: [
              ...(existingData.narrativeArcs || []),
              this.applyArcTemplate(template as ArcTemplate)
            ]
          }
        }
        return existingData

      case 'hybrid':
        // Merge intelligently, keeping existing data and adding new
        const templateData = this.applyTemplate(template)
        return this.deepMerge(existingData, templateData)

      default:
        return existingData
    }
  }

  /**
   * Apply any template
   */
  private applyTemplate(template: Template): any {
    switch (template.type) {
      case 'character':
        return this.applyCharacterTemplate(template as CharacterTemplate)
      case 'world':
        return this.applyWorldTemplate(template as WorldTemplate)
      case 'arc':
        return this.applyArcTemplate(template as ArcTemplate)
      case 'full_story_bible':
        return (template as FullStoryBibleTemplate).structure
      default:
        return {}
    }
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any): any {
    const output = { ...target }

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key]
          } else {
            output[key] = this.deepMerge(target[key], source[key])
          }
        } else {
          output[key] = source[key]
        }
      })
    }

    return output
  }

  /**
   * Check if value is an object
   */
  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item)
  }

  /**
   * Generate template ID
   */
  private generateTemplateId(template: Template): string {
    return `${template.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Export templates
   */
  exportTemplates(): string {
    const templates = this.getAllTemplates()
    return JSON.stringify(templates, null, 2)
  }

  /**
   * Import templates
   */
  importTemplates(templatesJson: string): void {
    try {
      const templates = JSON.parse(templatesJson) as Template[]
      templates.forEach(template => {
        const id = this.generateTemplateId(template)
        this.templates.set(id, template)
      })
      console.log(`✅ Imported ${templates.length} template(s)`)
    } catch (error) {
      console.error('Error importing templates:', error)
    }
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): Template[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllTemplates().filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery)
    )
  }
}

// Export singleton instance
export const templateManager = TemplateManagerService.getInstance()

