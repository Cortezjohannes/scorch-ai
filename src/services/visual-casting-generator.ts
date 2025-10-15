/**
 * 🎭 Visual Casting Generator Service
 * Orchestrates AI image and video generation for casting characters
 * Combines DALL-E 3, VEO 3, and Imagen 3 services
 */

import { dalle3ImageGenerator, CastingImageRequest, DallE3ImageResponse } from './dalle3-image-generator';
import { veo3VideoGenerator, VEO3VideoRequest, VEO3VideoResponse } from './veo3-video-generator';
import { imagen3BackupGenerator, CastingImageBackupRequest, Imagen3ImageResponse } from './imagen3-backup-generator';

interface CastingVisualRequest {
  character: {
    name: string;
    description: string;
    physicalTraits: string;
    ageRange: string;
    ethnicity?: string;
    emotionalRange?: string[];
    characterArc?: string;
    performanceNotes?: string;
  };
  visualOptions: {
    generateImages: boolean;
    generateVideo: boolean;
    imageCount?: number;
    videoStyle?: 'realistic' | 'cinematic' | 'documentary';
    imageStyles?: Array<'headshot' | 'full_body' | 'character_study'>;
    imageMoods?: Array<'professional' | 'candid' | 'dramatic' | 'natural'>;
  };
  episodeId: string;
  priority?: 'low' | 'medium' | 'high';
}

interface CastingVisualResponse {
  characterName: string;
  images: {
    primary: DallE3ImageResponse[];
    backup: Imagen3ImageResponse[];
  };
  videos: VEO3VideoResponse[];
  success: boolean;
  errors: string[];
  metadata: {
    totalImages: number;
    totalVideos: number;
    primaryImageSuccess: number;
    backupImageSuccess: number;
    videoSuccess: number;
    generationTime: number;
    creditsUsed: number;
    remainingVideoCredits: number;
  };
}

interface BatchCastingRequest {
  characters: CastingVisualRequest[];
  episodeId: string;
  options: {
    maxConcurrent?: number;
    prioritizeVideos?: boolean;
    fallbackToBackup?: boolean;
    generateThumbnails?: boolean;
  };
}

/**
 * Visual Casting Generator
 * Main orchestrator for AI-powered casting visuals
 */
export class VisualCastingGenerator {
  
  /**
   * Generate complete visual package for a character
   */
  async generateCharacterVisuals(request: CastingVisualRequest): Promise<CastingVisualResponse> {
    console.log(`🎭 Generating visual package for ${request.character.name}...`);
    
    const startTime = Date.now();
    const errors: string[] = [];
    let creditsUsed = 0;
    
    const response: CastingVisualResponse = {
      characterName: request.character.name,
      images: {
        primary: [],
        backup: []
      },
      videos: [],
      success: false,
      errors: [],
      metadata: {
        totalImages: 0,
        totalVideos: 0,
        primaryImageSuccess: 0,
        backupImageSuccess: 0,
        videoSuccess: 0,
        generationTime: 0,
        creditsUsed: 0,
        remainingVideoCredits: veo3VideoGenerator.getRemainingCredits(request.episodeId)
      }
    };
    
    try {
      // Generate images if requested
      if (request.visualOptions.generateImages) {
        console.log(`🎨 Generating images for ${request.character.name}...`);
        
        // Primary image generation with DALL-E 3
        const imageResults = await this.generateCharacterImages(request);
        response.images.primary = imageResults.primary;
        response.images.backup = imageResults.backup;
        
        response.metadata.primaryImageSuccess = imageResults.primary.filter(img => img.success).length;
        response.metadata.backupImageSuccess = imageResults.backup.filter(img => img.success).length;
        response.metadata.totalImages = response.metadata.primaryImageSuccess + response.metadata.backupImageSuccess;
        
        if (imageResults.errors.length > 0) {
          errors.push(...imageResults.errors);
        }
      }
      
      // Generate videos if requested and credits available
      if (request.visualOptions.generateVideo) {
        console.log(`🎬 Generating video for ${request.character.name}...`);
        
        const remainingCredits = veo3VideoGenerator.getRemainingCredits(request.episodeId);
        if (remainingCredits > 0) {
          const videoResult = await this.generateCharacterVideo(request);
          if (videoResult) {
            response.videos.push(videoResult);
            response.metadata.videoSuccess = videoResult.success ? 1 : 0;
            creditsUsed = videoResult.success ? 1 : 0;
          }
        } else {
          errors.push(`No video credits remaining for episode ${request.episodeId}`);
        }
      }
      
      // Calculate final metrics
      response.metadata.totalVideos = response.videos.length;
      response.metadata.generationTime = Date.now() - startTime;
      response.metadata.creditsUsed = creditsUsed;
      response.metadata.remainingVideoCredits = veo3VideoGenerator.getRemainingCredits(request.episodeId);
      
      response.success = (response.metadata.totalImages > 0 || response.metadata.totalVideos > 0);
      response.errors = errors;
      
      console.log(`✅ Visual package complete for ${request.character.name}: ${response.metadata.totalImages} images, ${response.metadata.totalVideos} videos`);
      
    } catch (error) {
      console.error(`❌ Failed to generate visuals for ${request.character.name}:`, error);
      response.success = false;
      response.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }
    
    return response;
  }
  
  /**
   * Generate visuals for multiple characters in batch
   */
  async generateBatchVisuals(request: BatchCastingRequest): Promise<CastingVisualResponse[]> {
    console.log(`🎭 Generating batch visuals for ${request.characters.length} characters...`);
    
    const {
      maxConcurrent = 2,
      prioritizeVideos = false,
      fallbackToBackup = true
    } = request.options;
    
    const results: CastingVisualResponse[] = [];
    
    // Sort by priority if specified
    const sortedCharacters = [...request.characters].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium']);
    });
    
    // Process in batches to avoid overwhelming the APIs
    for (let i = 0; i < sortedCharacters.length; i += maxConcurrent) {
      const batch = sortedCharacters.slice(i, i + maxConcurrent);
      
      console.log(`🔄 Processing batch ${Math.floor(i / maxConcurrent) + 1}: ${batch.map(c => c.character.name).join(', ')}`);
      
      const batchPromises = batch.map(characterRequest => 
        this.generateCharacterVisuals(characterRequest)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`❌ Batch generation failed for ${batch[index].character.name}:`, result.reason);
          results.push({
            characterName: batch[index].character.name,
            images: { primary: [], backup: [] },
            videos: [],
            success: false,
            errors: [result.reason?.message || 'Batch generation failed'],
            metadata: {
              totalImages: 0,
              totalVideos: 0,
              primaryImageSuccess: 0,
              backupImageSuccess: 0,
              videoSuccess: 0,
              generationTime: 0,
              creditsUsed: 0,
              remainingVideoCredits: 0
            }
          });
        }
      });
      
      // Delay between batches
      if (i + maxConcurrent < sortedCharacters.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`🎬 Batch complete: ${successCount}/${request.characters.length} characters processed successfully`);
    
    return results;
  }
  
  /**
   * Generate character images using primary and backup services
   */
  private async generateCharacterImages(request: CastingVisualRequest): Promise<{
    primary: DallE3ImageResponse[];
    backup: Imagen3ImageResponse[];
    errors: string[];
  }> {
    const errors: string[] = [];
    const primaryImages: DallE3ImageResponse[] = [];
    const backupImages: Imagen3ImageResponse[] = [];
    
    const imageCount = request.visualOptions.imageCount || 2;
    const imageStyles = request.visualOptions.imageStyles || ['headshot', 'character_study'];
    const imageMoods = request.visualOptions.imageMoods || ['professional', 'natural'];
    
    // Create image requests
    const imageRequests: CastingImageRequest[] = [];
    for (let i = 0; i < imageCount; i++) {
      imageRequests.push({
        characterName: request.character.name,
        characterDescription: request.character.description,
        physicalTraits: request.character.physicalTraits,
        ageRange: request.character.ageRange,
        ethnicity: request.character.ethnicity,
        style: imageStyles[i % imageStyles.length],
        mood: imageMoods[i % imageMoods.length]
      });
    }
    
    // Try DALL-E 3 primary generation
    try {
      for (const imageRequest of imageRequests) {
        const result = await dalle3ImageGenerator.generateCharacterHeadshot(imageRequest);
        primaryImages.push(result);
        
        if (!result.success) {
          errors.push(`DALL-E 3 failed for ${imageRequest.style}: ${result.error}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      errors.push(`DALL-E 3 service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Use Imagen 3 backup if primary failed or as additional options
    const failedPrimary = primaryImages.filter(img => !img.success).length;
    if (failedPrimary > 0) {
      console.log(`🖼️ Using Imagen 3 backup for ${failedPrimary} failed images...`);
      
      try {
        // Convert to backup request format
        const backupRequests: CastingImageBackupRequest[] = imageRequests.slice(0, failedPrimary).map(req => ({
          characterName: req.characterName,
          characterDescription: req.characterDescription,
          physicalTraits: req.physicalTraits,
          ageRange: req.ageRange,
          ethnicity: req.ethnicity,
          style: req.style,
          mood: req.mood
        }));
        
        for (const backupRequest of backupRequests) {
          const result = await imagen3BackupGenerator.generateCharacterHeadshot(backupRequest);
          backupImages.push(result);
          
          if (!result.success) {
            errors.push(`Imagen 3 backup failed for ${backupRequest.style}: ${result.error}`);
          }
          
          // Delay between backup requests
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        errors.push(`Imagen 3 backup service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return {
      primary: primaryImages,
      backup: backupImages,
      errors
    };
  }
  
  /**
   * Generate character performance video
   */
  private async generateCharacterVideo(request: CastingVisualRequest): Promise<VEO3VideoResponse | null> {
    try {
      const videoRequest: VEO3VideoRequest = {
        characterName: request.character.name,
        characterDescription: request.character.description,
        sceneDescription: `Character introduction and performance sample for ${request.character.name}`,
        performanceNotes: request.character.performanceNotes || 
          `Performance showcasing character traits: ${request.character.physicalTraits}. Character arc: ${request.character.characterArc || 'character development'}`,
        videoStyle: request.visualOptions.videoStyle || 'realistic',
        duration: 30,
        aspectRatio: '16:9',
        quality: 'high'
      };
      
      return await veo3VideoGenerator.generateCharacterVideo(videoRequest, request.episodeId);
      
    } catch (error) {
      console.error(`❌ Video generation failed for ${request.character.name}:`, error);
      return null;
    }
  }
  
  /**
   * Get service status and availability
   */
  async getServiceStatus() {
    const status = {
      dalle3: { available: true, service: 'DALL-E 3 (Primary)' },
      veo3: { available: true, service: 'VEO 3 (Video)' },
      imagen3: { available: false, service: 'Imagen 3 (Backup)' }
    };
    
    try {
      // Check Imagen 3 availability
      status.imagen3.available = await imagen3BackupGenerator.isAvailable();
    } catch (error) {
      status.imagen3.available = false;
    }
    
    return status;
  }
  
  /**
   * Get credit status for an episode
   */
  getVideoCreditsStatus(episodeId: string) {
    return {
      remaining: veo3VideoGenerator.getRemainingCredits(episodeId),
      maxPerEpisode: 3,
      service: 'VEO 3'
    };
  }
}

// Export singleton instance
export const visualCastingGenerator = new VisualCastingGenerator();
export type { CastingVisualRequest, CastingVisualResponse, BatchCastingRequest };

