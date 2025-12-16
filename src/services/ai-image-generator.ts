/**
 * AI Image Generator Service
 * 
 * Generates reference images for storyboards, props, locations, and costumes
 * 
 * 🎯 MODEL SELECTION:
 * - NANO BANANA (gemini-2.5-flash-image): Fast - for props, locations, costumes
 * - NANO BANANA PRO (gemini-3-pro-image-preview): High quality - for storyboards
 * 
 * NOTE: For persistent images that need to be saved to Firebase Storage,
 * use generateImageWithStorage() from image-generation-with-storage.ts instead.
 * This service returns raw image URLs (base64) without automatic Storage upload.
 */

import { generateGeminiImage, GeminiImageOptions, type ImageModel } from './gemini-image-generator';
import { generateImageWithStorage, type ImageGenerationWithStorageOptions } from './image-generation-with-storage';

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  quality?: 'standard' | 'hd';
  style?: 'natural' | 'vivid';
}

export class AIImageGenerator {
  
  /**
   * Generate a cinematic storyboard frame
   * 🎯 Uses NANO BANANA PRO for high quality storyboard images
   */
  static async generateStoryboardFrame(
    sceneDescription: string,
    shotType: string,
    aspectRatio: '16:9' | '9:16' = '16:9',
    options: ImageGenerationOptions = {}
  ): Promise<string> {
    const prompt = `Cinematic storyboard frame, ${shotType}, ${sceneDescription}, ${aspectRatio} aspect ratio, professional film still, detailed composition, high quality, black and white sketch style`;
    
    console.log(`🎨 Generating storyboard image with NANO BANANA PRO: ${shotType}`);
    
    try {
      // Use Gemini for image generation - NANO BANANA PRO for high quality storyboards
      const geminiOptions: GeminiImageOptions = {
        aspectRatio: aspectRatio === '16:9' ? '16:9' : '9:16',
        quality: options.quality || 'standard',
        style: 'natural', // Storyboards should be natural/realistic
        model: 'nano-banana-pro' // High quality for storyboards
      };
      
      const imageUrl = await generateGeminiImage(prompt, geminiOptions);
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate storyboard image:', error);
      // Return placeholder image URL
      return this.getPlaceholderImage('storyboard', aspectRatio);
    }
  }
  
  /**
   * Generate a prop reference image
   * 🎯 Uses NANO BANANA (fast) for props
   */
  static async generatePropReference(
    propDescription: string,
    options: ImageGenerationOptions = {}
  ): Promise<string> {
    const prompt = `Professional product photography, ${propDescription}, white background, clean composition, detailed, catalog quality, studio lighting`;
    
    console.log(`🎨 Generating prop image with NANO BANANA: ${propDescription}`);
    
    try {
      const geminiOptions: GeminiImageOptions = {
        aspectRatio: '1:1',
        quality: options.quality || 'standard',
        style: 'natural',
        model: 'nano-banana' // Fast model for props
      };
      
      const imageUrl = await generateGeminiImage(prompt, geminiOptions);
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate prop image:', error);
      return this.getPlaceholderImage('prop');
    }
  }
  
  /**
   * Generate a location reference image
   * 🎯 Uses NANO BANANA (fast) for locations
   */
  static async generateLocationReference(
    locationDescription: string,
    options: ImageGenerationOptions = {}
  ): Promise<string> {
    const prompt = `Cinematic location photography, ${locationDescription}, empty space, natural lighting, 16:9 composition, establishing shot quality, architectural photography style`;
    
    console.log(`🎨 Generating location image with NANO BANANA: ${locationDescription}`);
    
    try {
      const geminiOptions: GeminiImageOptions = {
        aspectRatio: '16:9',
        quality: options.quality || 'standard',
        style: 'natural',
        model: 'nano-banana' // Fast model for locations
      };
      
      const imageUrl = await generateGeminiImage(prompt, geminiOptions);
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate location image:', error);
      return this.getPlaceholderImage('location', '16:9');
    }
  }
  
  /**
   * Generate a costume/wardrobe reference image
   * 🎯 Uses NANO BANANA (fast) for costumes
   */
  static async generateCostumeReference(
    costumeDescription: string,
    options: ImageGenerationOptions = {}
  ): Promise<string> {
    const prompt = `Fashion catalog photography, ${costumeDescription}, full body, neutral gray background, professional lighting, fashion editorial style`;
    
    console.log(`🎨 Generating costume image with NANO BANANA: ${costumeDescription}`);
    
    try {
      const geminiOptions: GeminiImageOptions = {
        aspectRatio: '9:16',
        quality: options.quality || 'standard',
        style: 'natural',
        model: 'nano-banana' // Fast model for costumes
      };
      
      const imageUrl = await generateGeminiImage(prompt, geminiOptions);
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate costume image:', error);
      return this.getPlaceholderImage('costume', '9:16');
    }
  }
  
  /**
   * Generate a general image (exported for use by components like CharacterGallery)
   */
  static async generateImage(
    prompt: string,
    options: ImageGenerationOptions & { model?: string } = {}
  ): Promise<string> {
    try {
      // Determine aspect ratio from width/height if provided
      let aspectRatio: '1:1' | '16:9' | '9:16' = '1:1';
      if (options.width && options.height) {
        const ratio = options.width / options.height;
        if (ratio > 1.5) {
          aspectRatio = '16:9';
        } else if (ratio < 0.7) {
          aspectRatio = '9:16';
        } else {
          aspectRatio = '1:1';
        }
      }
      
      const geminiOptions: GeminiImageOptions = {
        aspectRatio,
        quality: options.quality || 'standard',
        style: options.style || 'natural'
      };
      
      const imageUrl = await generateGeminiImage(prompt, geminiOptions);
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate image:', error);
      // Return placeholder as fallback
      const aspectRatio = options.width && options.height 
        ? (options.width > options.height ? '16:9' : options.width < options.height ? '9:16' : '1:1')
        : '1:1';
      return this.getPlaceholderImage('generated', aspectRatio);
    }
  }
  
  /**
   * Get placeholder image URL (for development or fallback)
   */
  private static getPlaceholderImage(
    type: 'storyboard' | 'prop' | 'location' | 'costume' | 'generated',
    aspectRatio: '16:9' | '9:16' | '1:1' = '16:9'
  ): string {
    const dimensions = aspectRatio === '16:9' ? '1792x1024' :
                       aspectRatio === '9:16' ? '1024x1792' :
                       '1024x1024';
    
    const labels = {
      storyboard: 'Storyboard Frame',
      prop: 'Prop Reference',
      location: 'Location Reference',
      costume: 'Costume Reference',
      generated: 'Generated Image'
    };
    
    // Return a placeholder.com image with appropriate text
    return `https://via.placeholder.com/${dimensions}/1a1a1a/e2c376?text=${encodeURIComponent(labels[type])}`;
  }
  
  /**
   * Batch generate multiple images (with rate limiting)
   */
  static async generateBatch(
    requests: Array<{
      type: 'storyboard' | 'prop' | 'location' | 'costume';
      description: string;
      shotType?: string;
      aspectRatio?: '16:9' | '9:16';
    }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<string[]> {
    const results: string[] = [];
    
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      
      try {
        let imageUrl: string;
        
        switch (request.type) {
          case 'storyboard':
            imageUrl = await this.generateStoryboardFrame(
              request.description,
              request.shotType || 'medium shot',
              request.aspectRatio || '16:9'
            );
            break;
          case 'prop':
            imageUrl = await this.generatePropReference(request.description);
            break;
          case 'location':
            imageUrl = await this.generateLocationReference(request.description);
            break;
          case 'costume':
            imageUrl = await this.generateCostumeReference(request.description);
            break;
          default:
            imageUrl = this.getPlaceholderImage('generated');
        }
        
        results.push(imageUrl);
        
        if (onProgress) {
          onProgress(i + 1, requests.length);
        }
        
        // Rate limiting: wait 1 second between requests
        if (i < requests.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Failed to generate image ${i + 1}:`, error);
        results.push(this.getPlaceholderImage('generated'));
      }
    }
    
    return results;
  }
}

/**
 * Helper function to extract key visual elements from scene description
 */
export function extractVisualElements(sceneContent: string): {
  location: string;
  timeOfDay: string;
  characters: string[];
  props: string[];
  mood: string;
} {
  // Simple extraction logic - can be enhanced with NLP
  const location = sceneContent.match(/(?:INT\.|EXT\.)\s+([A-Z\s]+)/)?.[1]?.trim() || 'Unknown location';
  const timeOfDay = sceneContent.match(/(?:DAY|NIGHT|MORNING|EVENING|DAWN|DUSK)/)?.[0] || 'DAY';
  
  // Extract character names (all caps words)
  const characterMatches = sceneContent.match(/\b[A-Z]{2,}\b/g) || [];
  const characters = [...new Set(characterMatches)].filter(name => 
    name.length > 1 && !['INT', 'EXT', 'DAY', 'NIGHT', 'MORNING', 'EVENING'].includes(name)
  );
  
  // Extract potential props (nouns after articles or prepositions)
  const propMatches = sceneContent.match(/(?:a|an|the)\s+([a-z]+)/gi) || [];
  const props = [...new Set(propMatches.map(m => m.trim()))];
  
  // Determine mood from keywords
  const moodKeywords = {
    tense: ['tense', 'nervous', 'anxious', 'worried'],
    happy: ['happy', 'joyful', 'laughing', 'smiling'],
    sad: ['sad', 'crying', 'tears', 'depressed'],
    angry: ['angry', 'furious', 'yelling', 'shouting'],
    romantic: ['romantic', 'intimate', 'tender', 'loving']
  };
  
  let mood = 'neutral';
  for (const [moodType, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => sceneContent.toLowerCase().includes(keyword))) {
      mood = moodType;
      break;
    }
  }
  
  return { location, timeOfDay, characters, props, mood };
}

/**
 * Export generateImage function for use by components
 * This is a convenience wrapper around AIImageGenerator.generateImage
 * 
 * @deprecated Use generateImageAndSave() instead for persistent images
 */
export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions & { model?: string } = {}
): Promise<string> {
  return AIImageGenerator.generateImage(prompt, options);
}

/**
 * Generate an image and save to Firebase Storage
 * 
 * This is the RECOMMENDED function for generating images that need to persist.
 * It generates the image using Gemini and automatically uploads to Firebase Storage.
 * 
 * @param prompt - Image generation prompt
 * @param userId - User ID (required for Firebase Storage)
 * @param options - Generation options
 * @returns Firebase Storage URL (or base64 if upload fails)
 */
export async function generateImageAndSave(
  prompt: string,
  userId: string,
  options: ImageGenerationOptions & { 
    context?: 'storyboard' | 'character' | 'prop' | 'location' | 'costume' | 'marketing'
  } = {}
): Promise<{ imageUrl: string; uploadedToStorage: boolean; error?: string }> {
  // Determine aspect ratio from width/height if provided
  let aspectRatio: '1:1' | '16:9' | '9:16' = '1:1';
  if (options.width && options.height) {
    const ratio = options.width / options.height;
    if (ratio > 1.5) {
      aspectRatio = '16:9';
    } else if (ratio < 0.7) {
      aspectRatio = '9:16';
    } else {
      aspectRatio = '1:1';
    }
  }
  
  const result = await generateImageWithStorage(prompt, {
    userId,
    context: options.context || 'storyboard',
    aspectRatio,
    quality: options.quality || 'standard',
    style: options.style || 'natural'
  });
  
  return {
    imageUrl: result.imageUrl,
    uploadedToStorage: result.uploadedToStorage,
    error: result.error
  };
}




