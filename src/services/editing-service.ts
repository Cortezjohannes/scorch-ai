/**
 * Core Editing Service - Manages all editable content with proper constraints
 * 
 * Handles:
 * - Story Bible editing (with episode generation constraints)
 * - Episode scene editing (with next episode generation constraints)
 * - Pre-production script editing (always editable)
 * - Data persistence and real-time updates
 */

export interface EditingConstraints {
  storyBible: {
    canEditContent: boolean;
    canAddCharacters: boolean;
    reason?: string;
  };
  episodes: {
    [episodeId: string]: {
      canEditScenes: boolean;
      reason?: string;
    };
  };
  preProduction: {
    canEditScripts: boolean;
    canEditStoryboards: boolean;
    reason?: string;
  };
}

export interface EditHistory {
  id: string;
  timestamp: Date;
  userId?: string;
  entityType: 'story-bible' | 'episode' | 'scene' | 'script';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  field: string;
  oldValue: any;
  newValue: any;
  regenerationTriggered?: boolean;
}

export class EditingService {
  private static instance: EditingService;
  private editHistory: EditHistory[] = [];
  private listeners: Map<string, Function[]> = new Map();

  static getInstance(): EditingService {
    if (!EditingService.instance) {
      EditingService.instance = new EditingService();
    }
    return EditingService.instance;
  }

  /**
   * Determine editing constraints based on current project state
   */
  async getEditingConstraints(projectData: any): Promise<EditingConstraints> {
    const hasGeneratedEpisodes = this.hasGeneratedEpisodes(projectData);
    const episodeConstraints: { [key: string]: { canEditScenes: boolean; reason?: string } } = {};

    // Check each episode's editing constraints
    if (projectData.episodes) {
      Object.values(projectData.episodes).forEach((episode: any) => {
        const hasNextEpisode = this.hasNextEpisodeGenerated(episode.episodeNumber, projectData);
        episodeConstraints[episode.id] = {
          canEditScenes: !hasNextEpisode,
          reason: hasNextEpisode ? 'Next episode already generated - editing locked' : undefined
        };
      });
    }

    return {
      storyBible: {
        canEditContent: !hasGeneratedEpisodes,
        canAddCharacters: true, // Always allowed
        reason: hasGeneratedEpisodes ? 'Episodes already generated - content editing locked (except adding characters)' : undefined
      },
      episodes: episodeConstraints,
      preProduction: {
        canEditScripts: true,
        canEditStoryboards: true, // Always editable
        reason: undefined
      }
    };
  }

  /**
   * Edit story bible content with constraints
   */
  async editStoryBible(
    storyBible: any, 
    field: string, 
    newValue: any, 
    isAddingCharacter: boolean = false
  ): Promise<{ success: boolean; updatedStoryBible?: any; error?: string }> {
    try {
      const constraints = await this.getEditingConstraints({ storyBible });
      
      // Check permissions
      if (!isAddingCharacter && !constraints.storyBible.canEditContent) {
        return {
          success: false,
          error: constraints.storyBible.reason || 'Story bible editing is locked'
        };
      }

      if (isAddingCharacter && !constraints.storyBible.canAddCharacters) {
        return {
          success: false,
          error: 'Character addition is not allowed'
        };
      }

      // Perform the edit
      const updatedStoryBible = { ...storyBible };
      const oldValue = this.getNestedValue(updatedStoryBible, field);
      this.setNestedValue(updatedStoryBible, field, newValue);

      // Record edit history
      this.recordEdit({
        id: `edit_${Date.now()}`,
        timestamp: new Date(),
        entityType: 'story-bible',
        entityId: storyBible.id || 'main',
        action: 'update',
        field,
        oldValue,
        newValue
      });

      // Persist changes
      await this.persistStoryBible(updatedStoryBible);

      // Notify listeners
      this.notifyListeners('story-bible-updated', { storyBible: updatedStoryBible, field, newValue });

      return { success: true, updatedStoryBible };
    } catch (error) {
      console.error('Error editing story bible:', error);
      return { success: false, error: 'Failed to edit story bible' };
    }
  }

  /**
   * Edit episode scene with regeneration support
   */
  async editEpisodeScene(
    episode: any, 
    sceneId: string, 
    field: string, 
    newValue: any,
    shouldRegenerate: boolean = true
  ): Promise<{ success: boolean; updatedEpisode?: any; regeneratedContent?: any; error?: string }> {
    try {
      const constraints = await this.getEditingConstraints({ episodes: { [episode.id]: episode } });
      const episodeConstraint = constraints.episodes[episode.id];

      if (!episodeConstraint?.canEditScenes) {
        return {
          success: false,
          error: episodeConstraint?.reason || 'Episode editing is locked'
        };
      }

      // Find and edit the scene
      const updatedEpisode = { ...episode };
      const scenes = [...(updatedEpisode.scenes || [])];
      const sceneIndex = scenes.findIndex(scene => scene.id === sceneId);

      if (sceneIndex === -1) {
        return { success: false, error: 'Scene not found' };
      }

      const oldValue = scenes[sceneIndex][field];
      scenes[sceneIndex] = { ...scenes[sceneIndex], [field]: newValue };
      updatedEpisode.scenes = scenes;

      // Record edit history
      this.recordEdit({
        id: `edit_${Date.now()}`,
        timestamp: new Date(),
        entityType: 'scene',
        entityId: sceneId,
        action: 'update',
        field,
        oldValue,
        newValue,
        regenerationTriggered: shouldRegenerate
      });

      // Persist changes
      await this.persistEpisode(updatedEpisode);

      let regeneratedContent = null;

      // Trigger regeneration of subsequent content if requested
      if (shouldRegenerate) {
        regeneratedContent = await this.regenerateSubsequentContent(updatedEpisode, sceneIndex);
      }

      // Notify listeners
      this.notifyListeners('episode-scene-updated', { 
        episode: updatedEpisode, 
        sceneId, 
        field, 
        newValue, 
        regeneratedContent 
      });

      return { 
        success: true, 
        updatedEpisode, 
        regeneratedContent 
      };
    } catch (error) {
      console.error('Error editing episode scene:', error);
      return { success: false, error: 'Failed to edit episode scene' };
    }
  }

  /**
   * Edit pre-production script content
   */
  async editScript(
    scriptData: any, 
    episodeId: string, 
    sceneId: string, 
    elementIndex: number, 
    newContent: string
  ): Promise<{ success: boolean; updatedScript?: any; error?: string }> {
    try {
      const constraints = await this.getEditingConstraints({});
      
      if (!constraints.preProduction.canEditScripts) {
        return {
          success: false,
          error: constraints.preProduction.reason || 'Script editing is locked'
        };
      }

      // Update script content
      const updatedScript = { ...scriptData };
      const episodes = [...(updatedScript.episodes || [])];
      const episodeIndex = episodes.findIndex(ep => ep.id === episodeId);

      if (episodeIndex === -1) {
        return { success: false, error: 'Episode not found in script' };
      }

      const scenes = [...(episodes[episodeIndex].scenes || [])];
      const sceneIndex = scenes.findIndex(scene => scene.id === sceneId);

      if (sceneIndex === -1) {
        return { success: false, error: 'Scene not found in script' };
      }

      const elements = [...(scenes[sceneIndex].elements || [])];
      if (elementIndex >= elements.length) {
        return { success: false, error: 'Script element not found' };
      }

      const oldContent = elements[elementIndex].content;
      elements[elementIndex] = { ...elements[elementIndex], content: newContent };
      scenes[sceneIndex] = { ...scenes[sceneIndex], elements };
      episodes[episodeIndex] = { ...episodes[episodeIndex], scenes };
      updatedScript.episodes = episodes;

      // Record edit history
      this.recordEdit({
        id: `edit_${Date.now()}`,
        timestamp: new Date(),
        entityType: 'script',
        entityId: `${episodeId}_${sceneId}_${elementIndex}`,
        action: 'update',
        field: 'content',
        oldValue: oldContent,
        newValue: newContent
      });

      // Persist changes
      await this.persistScript(updatedScript);

      // Notify listeners
      this.notifyListeners('script-updated', { 
        script: updatedScript, 
        episodeId, 
        sceneId, 
        elementIndex, 
        newContent 
      });

      return { success: true, updatedScript };
    } catch (error) {
      console.error('Error editing script:', error);
      return { success: false, error: 'Failed to edit script' };
    }
  }

  /**
   * Add new character to story bible
   */
  async addCharacter(storyBible: any, newCharacter: any): Promise<{ success: boolean; updatedStoryBible?: any; error?: string }> {
    const characterWithId = {
      ...newCharacter,
      id: `char_${Date.now()}`,
      createdAt: new Date()
    };

    return this.editStoryBible(
      storyBible,
      'mainCharacters',
      [...(storyBible.mainCharacters || []), characterWithId],
      true // isAddingCharacter = true
    );
  }

  /**
   * Subscribe to editing events
   */
  subscribe(eventType: string, callback: Function): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Get edit history
   */
  getEditHistory(entityType?: string, entityId?: string): EditHistory[] {
    let history = this.editHistory;
    
    if (entityType) {
      history = history.filter(edit => edit.entityType === entityType);
    }
    
    if (entityId) {
      history = history.filter(edit => edit.entityId === entityId);
    }
    
    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Private helper methods

  private hasGeneratedEpisodes(projectData: any): boolean {
    return projectData.episodes && Object.keys(projectData.episodes).length > 0;
  }

  private hasNextEpisodeGenerated(episodeNumber: number, projectData: any): boolean {
    if (!projectData.episodes) return false;
    
    return Object.values(projectData.episodes).some((episode: any) => 
      episode.episodeNumber === episodeNumber + 1
    );
  }

  private async regenerateSubsequentContent(episode: any, fromSceneIndex: number): Promise<any> {
    try {
      // Call the AI regeneration service for scenes after the edited one
      const scenesToRegenerate = episode.scenes.slice(fromSceneIndex + 1);
      
      if (scenesToRegenerate.length === 0) {
        return null;
      }

      // Call your existing AI generation endpoint
      const response = await fetch('/api/regenerate-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episode,
          fromSceneIndex: fromSceneIndex + 1,
          contextFromEdit: episode.scenes[fromSceneIndex]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate content');
      }

      return await response.json();
    } catch (error) {
      console.error('Error regenerating subsequent content:', error);
      return null;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private recordEdit(edit: EditHistory): void {
    this.editHistory.push(edit);
    // Keep only last 1000 edits to prevent memory issues
    if (this.editHistory.length > 1000) {
      this.editHistory = this.editHistory.slice(-1000);
    }
  }

  private notifyListeners(eventType: string, data: any): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in edit listener:', error);
        }
      });
    }
  }

  private async persistStoryBible(storyBible: any): Promise<void> {
    // Integration with your existing persistence mechanism
    try {
      const response = await fetch('/api/save-story-bible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyBible)
      });

      if (!response.ok) {
        throw new Error('Failed to save story bible');
      }
    } catch (error) {
      console.error('Error persisting story bible:', error);
      throw error;
    }
  }

  private async persistEpisode(episode: any): Promise<void> {
    try {
      const response = await fetch('/api/save-episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(episode)
      });

      if (!response.ok) {
        throw new Error('Failed to save episode');
      }
    } catch (error) {
      console.error('Error persisting episode:', error);
      throw error;
    }
  }

  private async persistScript(script: any): Promise<void> {
    try {
      const response = await fetch('/api/save-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(script)
      });

      if (!response.ok) {
        throw new Error('Failed to save script');
      }
    } catch (error) {
      console.error('Error persisting script:', error);
      throw error;
    }
  }
}

export const editingService = EditingService.getInstance();

