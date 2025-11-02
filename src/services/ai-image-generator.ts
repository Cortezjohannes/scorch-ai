/**
 * AI Image Generator Service
 * 
 * Generates reference images for storyboards, props, locations, and costumes
 * using DALL-E 3 or Stable Diffusion APIs
 */

import { generateContent } from './azure-openai';

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  quality?: 'standard' | 'hd';
  style?: 'natural' | 'vivid';
}

export class AIImageGenerator {
  
  /**
   * Generate a cinematic storyboard frame
   */
  static async generateStoryboardFrame(
    sceneDescription: string,
    shotType: string,
    aspectRatio: '16:9' | '9:16' = '16:9',
    options: ImageGenerationOptions = {}
  ): Promise<string> {
    const prompt = `Cinematic storyboard frame, ${shotType}, ${sceneDescription}, ${aspectRatio} aspect ratio, professional film still, detailed composition, high quality, black and white sketch style`;
    
    console.log(`🎨 Generating storyboard image: ${shotType}`);
    
    try {
      // Use DALL-E 3 via Azure OpenAI
      const imageUrl = await this.callDallE3(prompt, {
        width: aspectRatio === '16:9' ? 1792 : 1024,
        height: aspectRatio === '16:9' ? 1024 : 1792,
        quality: options.quality || 'standard',
        style: 'natural' // Storyboards should be natural/realistic
      });
      
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate storyboard image:', error);
      // Return placeholder image URL
      return this.getPlaceholderImage('storyboard', aspectRatio);
    }
  }
  
  /**
   * Generate a prop reference image
   */
  static async generatePropReference(
    propDescription: string,
    options: ImageGenerationOptions = {}
  ): Promise<string> {
    const prompt = `Professional product photography, ${propDescription}, white background, clean composition, detailed, catalog quality, studio lighting`;
    
    console.log(`🎨 Generating prop image: ${propDescription}`);
    
    try {
      const imageUrl = await this.callDallE3(prompt, {
        width: 1024,
        height: 1024,
        quality: options.quality || 'standard',
        style: 'natural'
      });
      
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate prop image:', error);
      return this.getPlaceholderImage('prop');
    }
  }
  
  /**
   * Generate a location reference image
   */
  static async generateLocationReference(
    locationDescription: string,
    options: ImageGenerationOptions = {}
  ): Promise<string> {
    const prompt = `Cinematic location photography, ${locationDescription}, empty space, natural lighting, 16:9 composition, establishing shot quality, architectural photography style`;
    
    console.log(`🎨 Generating location image: ${locationDescription}`);
    
    try {
      const imageUrl = await this.callDallE3(prompt, {
        width: 1792,
        height: 1024,
        quality: options.quality || 'standard',
        style: 'natural'
      });
      
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate location image:', error);
      return this.getPlaceholderImage('location', '16:9');
    }
  }
  
  /**
   * Generate a costume/wardrobe reference image
   */
  static async generateCostumeReference(
    costumeDescription: string,
    options: ImageGenerationOptions = {}
  ): Promise<string> {
    const prompt = `Fashion catalog photography, ${costumeDescription}, full body, neutral gray background, professional lighting, fashion editorial style`;
    
    console.log(`🎨 Generating costume image: ${costumeDescription}`);
    
    try {
      const imageUrl = await this.callDallE3(prompt, {
        width: 1024,
        height: 1792,
        quality: options.quality || 'standard',
        style: 'natural'
      });
      
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate costume image:', error);
      return this.getPlaceholderImage('costume', '9:16');
    }
  }
  
  /**
   * Call DALL-E 3 API via Azure OpenAI
   */
  private static async callDallE3(
    prompt: string,
    options: {
      width: number;
      height: number;
      quality: 'standard' | 'hd';
      style: 'natural' | 'vivid';
    }
  ): Promise<string> {
    try {
      // Check if DALL-E API key is available
      const apiKey = process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️ No OpenAI API key found, returning placeholder image');
        return this.getPlaceholderImage('generated');
      }
      
      // For now, we'll use a simplified approach
      // In production, you'd call the actual DALL-E 3 API
      // This would require additional setup with Azure OpenAI or OpenAI directly
      
      console.log(`🎨 DALL-E 3 prompt: ${prompt.substring(0, 100)}...`);
      console.log(`   Size: ${options.width}x${options.height}, Quality: ${options.quality}`);
      
      // TODO: Implement actual DALL-E 3 API call
      // For now, return a placeholder
      return this.getPlaceholderImage('generated', options.width > options.height ? '16:9' : '9:16');
      
    } catch (error) {
      console.error('DALL-E 3 API call failed:', error);
      throw error;
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




