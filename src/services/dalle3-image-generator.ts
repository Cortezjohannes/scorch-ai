/**
 * 🎨 DALL-E 3 Image Generation Service
 * Generates character headshots and casting visuals using Azure DALL-E 3
 */

interface DallE3ImageRequest {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number; // Number of images (1-10)
  user?: string; // Optional user identifier
}

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

interface CastingImageRequest {
  characterName: string;
  characterDescription: string;
  physicalTraits: string;
  ageRange: string;
  ethnicity?: string;
  style?: 'headshot' | 'full_body' | 'action_shot' | 'character_study';
  mood?: 'professional' | 'candid' | 'dramatic' | 'natural';
}

/**
 * DALL-E 3 Image Generation Service
 * Uses Azure OpenAI DALL-E 3 deployment for character visualization
 */
export class DallE3ImageGenerator {
  
  private readonly endpoint = 'https://johan-m9b2v62z-eastus.cognitiveservices.azure.com/openai/deployments/dall-e-3/images/generations';
  private readonly apiKey = 'CouXKPtZYfr6N8w5eGCBhtWVCYetGEhnpL3Cr7TjFUPSu1jM9fpYJQQJ99BDACYeBjFXJ3w3AAAAACOGxmRg';
  private readonly apiVersion = '2024-02-01';
  private readonly model = 'dall-e-3';
  
  /**
   * Generate character headshot for casting
   */
  async generateCharacterHeadshot(request: CastingImageRequest): Promise<DallE3ImageResponse> {
    console.log(`🎨 Generating ${request.style || 'headshot'} for ${request.characterName}...`);
    
    try {
      const optimizedPrompt = this.createCharacterPrompt(request);
      
      const imageRequest: DallE3ImageRequest = {
        prompt: optimizedPrompt,
        size: request.style === 'full_body' ? '1024x1792' : '1024x1024',
        quality: 'hd',
        style: request.mood === 'dramatic' ? 'vivid' : 'natural',
        n: 1
      };
      
      const result = await this.generateImage(imageRequest);
      
      if (result.success) {
        console.log(`✅ Successfully generated ${request.style || 'headshot'} for ${request.characterName}`);
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Failed to generate image for ${request.characterName}:`, error);
      return {
        imageUrl: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Generate multiple casting options for a character
   */
  async generateCastingOptions(request: CastingImageRequest, count: number = 3): Promise<DallE3ImageResponse[]> {
    console.log(`🎭 Generating ${count} casting options for ${request.characterName}...`);
    
    const results: DallE3ImageResponse[] = [];
    
    // Generate variations with different styles/moods
    const variations = this.createVariations(request, count);
    
    for (const variation of variations) {
      const result = await this.generateCharacterHeadshot(variation);
      results.push(result);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`🎨 Generated ${results.filter(r => r.success).length}/${count} casting options for ${request.characterName}`);
    
    return results;
  }
  
  /**
   * Core DALL-E 3 image generation
   */
  private async generateImage(request: DallE3ImageRequest): Promise<DallE3ImageResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.endpoint}?api-version=${this.apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          model: this.model,
          prompt: request.prompt,
          size: request.size || '1024x1024',
          quality: request.quality || 'hd',
          style: request.style || 'natural',
          n: request.n || 1,
          user: request.user
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DALL-E 3 API error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      const generationTime = Date.now() - startTime;
      
      if (result.data && result.data[0] && result.data[0].url) {
        return {
          imageUrl: result.data[0].url,
          revisedPrompt: result.data[0].revised_prompt,
          success: true,
          metadata: {
            size: request.size || '1024x1024',
            quality: request.quality || 'hd',
            style: request.style || 'natural',
            generationTime
          }
        };
      } else {
        throw new Error('No image URL returned from DALL-E 3');
      }
      
    } catch (error) {
      console.error('DALL-E 3 generation error:', error);
      return {
        imageUrl: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Create optimized prompt for character visualization
   */
  private createCharacterPrompt(request: CastingImageRequest): string {
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
   * Create variations of a character request
   */
  private createVariations(baseRequest: CastingImageRequest, count: number): CastingImageRequest[] {
    const variations: CastingImageRequest[] = [];
    const moods: Array<'professional' | 'candid' | 'dramatic' | 'natural'> = ['professional', 'candid', 'dramatic', 'natural'];
    const styles: Array<'headshot' | 'character_study'> = ['headshot', 'character_study'];
    
    for (let i = 0; i < count; i++) {
      variations.push({
        ...baseRequest,
        mood: moods[i % moods.length],
        style: i === 0 ? 'headshot' : styles[i % styles.length]
      });
    }
    
    return variations;
  }
  
  /**
   * Validate image generation request
   */
  private validateRequest(request: DallE3ImageRequest): boolean {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt is required');
    }
    

    
    const validSizes = ['1024x1024', '1792x1024', '1024x1792'];
    if (request.size && !validSizes.includes(request.size)) {
      throw new Error(`Invalid size. Must be one of: ${validSizes.join(', ')}`);
    }
    
    if (request.n && (request.n < 1 || request.n > 10)) {
      throw new Error('Number of images must be between 1 and 10');
    }
    
    return true;
  }
}

// Export singleton instance
export const dalle3ImageGenerator = new DallE3ImageGenerator();
export type { CastingImageRequest, DallE3ImageResponse };

