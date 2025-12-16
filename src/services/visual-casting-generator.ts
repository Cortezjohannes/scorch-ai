/**
 * 🎭 Visual Casting Generator Service
 * Orchestrates AI image and video generation for casting characters
 * Uses Gemini (Nano Banana - fast model) for casting images and VEO 3 for videos
 * 
 * All images are automatically uploaded to Firebase Storage for persistence.
 */

import { generateImageWithStorage } from './image-generation-with-storage';
import { veo3VideoGenerator, VEO3VideoRequest, VEO3VideoResponse } from './veo3-video-generator';

// Legacy types for backward compatibility
interface DallE3ImageResponse {
  imageUrl: string;
  revisedPrompt?: string;
  success: boolean;
  error?: string;
  metadata?: {
    size: string;
    quality: string;
    style: string;
    generationTime: number;
  };
}

interface Imagen3ImageResponse {
  imageUrl: string;
  success: boolean;
  error?: string;
}

interface CastingImageRequest {
  characterName: string;
  characterDescription: string;
  physicalTraits: string;
  ageRange: string;
  ethnicity?: string;
  style?: 'headshot' | 'full_body' | 'action_shot' | 'character_study';
  mood?: 'professional' | 'candid' | 'dramatic' | 'natural';
}

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
  userId: string; // Required for Firebase Storage upload
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
   * Generate character images using Gemini (Nano Banana Pro)
   * Images are automatically uploaded to Firebase Storage
   * Uses parallel batching for multiple images
   */
  private async generateCharacterImages(request: CastingVisualRequest): Promise<{
    primary: DallE3ImageResponse[];
    backup: Imagen3ImageResponse[];
    errors: string[];
  }> {
    const errors: string[] = [];
    const primaryImages: DallE3ImageResponse[] = [];
    const backupImages: Imagen3ImageResponse[] = []; // Not used anymore, kept for compatibility
    
    const imageCount = request.visualOptions.imageCount || 2;
    const imageStyles = request.visualOptions.imageStyles || ['headshot', 'character_study'];
    const imageMoods = request.visualOptions.imageMoods || ['professional', 'natural'];
    
    // If only generating 1 image, do it sequentially (no need for parallel)
    if (imageCount === 1) {
      const style = imageStyles[0];
      const mood = imageMoods[0];
      
      const prompt = this.buildCharacterPrompt({
        characterName: request.character.name,
        characterDescription: request.character.description,
        physicalTraits: request.character.physicalTraits,
        ageRange: request.character.ageRange,
        ethnicity: request.character.ethnicity,
        style,
        mood
      });
      
      try {
        console.log(`🎨 [Casting] Generating ${style} image for ${request.character.name}...`);
        
        // 🎯 Use NANO BANANA (fast) for casting images
        const result = await generateImageWithStorage(prompt, {
          userId: request.userId,
          context: 'character',
          aspectRatio: style === 'full_body' ? '9:16' : '1:1',
          quality: 'hd',
          style: 'natural',
          model: 'nano-banana' // Fast model for casting
        });
        
        primaryImages.push({
          imageUrl: result.imageUrl,
          success: result.success,
          error: result.error,
          metadata: result.metadata ? {
            size: result.metadata.aspectRatio === '9:16' ? '1024x1792' : '1024x1024',
            quality: 'hd',
            style: 'natural',
            generationTime: result.metadata.generationTime
          } : undefined
        });
        
        if (!result.success) {
          errors.push(`Gemini failed for ${style}: ${result.error}`);
        } else {
          console.log(`✅ [Casting] ${style} image generated and saved to Storage`);
        }
      } catch (error) {
        errors.push(`Gemini generation error for ${style}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        primaryImages.push({
          imageUrl: '',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      return {
        primary: primaryImages,
        backup: backupImages,
        errors
      };
    }
    
    // For multiple images, use parallel generation
    const { generateImagesInParallel } = await import('@/services/parallel-image-generator');
    type ParallelTask<T> = { id: string; execute: () => Promise<T>; priority?: number };
    
    const tasks: ParallelTask<DallE3ImageResponse> = [];
    
    for (let i = 0; i < imageCount; i++) {
      const style = imageStyles[i % imageStyles.length];
      const mood = imageMoods[i % imageMoods.length];
      
      const prompt = this.buildCharacterPrompt({
        characterName: request.character.name,
        characterDescription: request.character.description,
        physicalTraits: request.character.physicalTraits,
        ageRange: request.character.ageRange,
        ethnicity: request.character.ethnicity,
        style,
        mood
      });
      
      tasks.push({
        id: `${request.character.name}-${style}-${i}`,
        execute: async () => {
          console.log(`🎨 [Casting] Generating ${style} image for ${request.character.name}...`);
          
          // 🎯 Use NANO BANANA (fast) for casting images
          const result = await generateImageWithStorage(prompt, {
            userId: request.userId,
            context: 'character',
            aspectRatio: style === 'full_body' ? '9:16' : '1:1',
            quality: 'hd',
            style: 'natural',
            model: 'nano-banana' // Fast model for casting
          });
          
          const imageResponse: DallE3ImageResponse = {
            imageUrl: result.imageUrl,
            success: result.success,
            error: result.error,
            metadata: result.metadata ? {
              size: result.metadata.aspectRatio === '9:16' ? '1024x1792' : '1024x1024',
              quality: 'hd',
              style: 'natural',
              generationTime: result.metadata.generationTime
            } : undefined
          };
          
          if (!result.success) {
            throw new Error(`Gemini failed for ${style}: ${result.error}`);
          } else {
            console.log(`✅ [Casting] ${style} image generated and saved to Storage`);
          }
          
          return imageResponse;
        },
        onError: (error) => {
          errors.push(`Gemini generation error for ${style}: ${error.message}`);
          primaryImages.push({
            imageUrl: '',
            success: false,
            error: error.message
          });
        }
      });
    }
    
    // Execute in parallel with batching
    const parallelResult = await generateImagesInParallel(tasks, {
      rateLimitRPM: 20,
      sequentialCount: 3,
      batchSize: 12
    });
    
    // Process results
    for (const taskResult of parallelResult.results) {
      if (taskResult.success && taskResult.result) {
        primaryImages.push(taskResult.result);
      } else if (taskResult.error) {
        errors.push(taskResult.error);
        primaryImages.push({
          imageUrl: '',
          success: false,
          error: taskResult.error
        });
      }
    }
    
    return {
      primary: primaryImages,
      backup: backupImages, // Empty, kept for backward compatibility
      errors
    };
  }
  
  /**
   * Build a detailed prompt for character image generation
   */
  private buildCharacterPrompt(request: CastingImageRequest): string {
    const {
      characterName,
      characterDescription,
      physicalTraits,
      ageRange,
      ethnicity,
      style = 'headshot',
      mood = 'professional'
    } = request;
    
    let prompt = '';
    
    // Base character description
    if (style === 'headshot') {
      prompt = `Professional casting headshot of a ${ageRange} year old`;
    } else if (style === 'full_body') {
      prompt = `Full body character portrait of a ${ageRange} year old`;
    } else if (style === 'action_shot') {
      prompt = `Dynamic action shot of a ${ageRange} year old`;
    } else {
      prompt = `Character study portrait of a ${ageRange} year old`;
    }
    
    // Add ethnicity if specified
    if (ethnicity) {
      prompt += ` ${ethnicity}`;
    }
    
    // Add physical traits
    prompt += ` person with ${physicalTraits}`;
    
    // Add character context
    if (characterDescription) {
      prompt += `. Character context: ${characterDescription}`;
    }
    
    // Add style specifics
    if (style === 'headshot') {
      prompt += '. Professional headshot style, clean background, good lighting, casting photo quality';
    } else if (style === 'full_body') {
      prompt += '. Full body shot, neutral pose, clean background';
    } else if (style === 'action_shot') {
      prompt += '. Dynamic pose showing character in action, cinematic lighting';
    }
    
    // Add mood specifics
    if (mood === 'professional') {
      prompt += '. Professional photography, high quality, studio lighting';
    } else if (mood === 'dramatic') {
      prompt += '. Dramatic lighting, intense expression, cinematic quality';
    } else if (mood === 'natural') {
      prompt += '. Natural lighting, relaxed expression, candid feel';
    }
    
    // Technical specifications
    prompt += '. High resolution, photorealistic, detailed, professional quality';
    
    return prompt;
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
    return {
      gemini: { available: true, service: 'Gemini Nano Banana Pro (Images)' },
      veo3: { available: true, service: 'VEO 3 (Video)' }
    };
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

