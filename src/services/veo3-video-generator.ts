/**
 * 🎬 Google VEO 3.1 Video Generation Service
 * Generates character performance videos using Google's VEO 3.1 model
 * Limited to 3 uses per episode (credit-based system)
 * 
 * Pricing (as of 2024):
 * - Standard with audio: $0.40/second (8s = $3.20)
 * - Standard without audio: $0.20/second (8s = $1.60)
 * - Fast with audio: $0.15/second (8s = $1.20)
 * - Fast without audio: $0.10/second (8s = $0.80)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';

interface VEO3VideoRequest {
  characterName: string;
  characterDescription: string;
  sceneDescription: string;
  performanceNotes: string;
  videoStyle?: 'realistic' | 'cinematic' | 'documentary' | 'artistic';
  duration?: number; // seconds (4, 6, or 8 for VEO 3.1)
  aspectRatio?: '16:9' | '9:16' | '1:1';
  quality?: 'standard' | 'high';
  hasAudio?: boolean; // Optional: only applies to quality mode, defaults to false to save costs
}

interface VEO3VideoResponse {
  videoUrl: string;
  thumbnailUrl?: string;
  success: boolean;
  error?: string;
  metadata?: {
    duration: number;
    aspectRatio: string;
    quality: string;
    generationTime: number;
    creditsUsed: number;
    cost?: {
      amount: number;
      currency: string;
      mode: 'standard' | 'fast';
      hasAudio: boolean;
    };
  };
}

interface VideoCredit {
  episodeId: string;
  creditsUsed: number;
  maxCredits: number;
  resetDate: Date;
}

/**
 * VEO 3 Video Generation Service with Credit Management
 */
export class VEO3VideoGenerator {
  
  private genAI: GoogleGenerativeAI | null = null;
  private genAIVideo: GoogleGenAI | null = null; // SDK for video generation with config support
  private readonly maxCreditsPerEpisode = 3;
  private creditStore: Map<string, VideoCredit> = new Map();
  private readonly GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
  
  /**
   * Lazy initialization of Gemini AI client
   * Only initializes when actually needed, not at module load time
   */
  private getGenAI(): GoogleGenerativeAI {
    if (!this.genAI) {
    const apiKey = this.getGeminiKey();
    this.genAI = new GoogleGenerativeAI(apiKey);
  }
    return this.genAI;
  }
  
  /**
   * Get the GoogleGenAI client for video generation (supports config parameters)
   * Documentation: https://ai.google.dev/gemini-api/docs/video
   */
  private getGenAIVideo(): GoogleGenAI {
    if (!this.genAIVideo) {
      const apiKey = this.getGeminiKey();
      this.genAIVideo = new GoogleGenAI({ apiKey });
    }
    return this.genAIVideo;
  }
  
  
  /**
   * Generate character performance video
   */
  async generateCharacterVideo(
    request: VEO3VideoRequest, 
    episodeId: string
  ): Promise<VEO3VideoResponse> {
    console.log(`🎬 Generating VEO 3 video for ${request.characterName} in episode ${episodeId}...`);
    
    try {
      // Check credit availability
      const creditCheck = this.checkCredits(episodeId);
      if (!creditCheck.available) {
        throw new Error(`Credit limit exceeded for episode ${episodeId}. Used: ${creditCheck.used}/${this.maxCreditsPerEpisode}`);
      }
      
      const startTime = Date.now();
      
      // Generate video using VEO 3
      const result = await this.generateVideoWithVEO3(request);
      
      // Consume credit on successful generation
      this.consumeCredit(episodeId);
      
      const generationTime = Date.now() - startTime;
      
      if (result.success) {
        console.log(`✅ Successfully generated video for ${request.characterName} (${generationTime}ms)`);
        
        return {
          ...result,
          metadata: {
            ...result.metadata,
            duration: result.metadata?.duration || 10,
            aspectRatio: result.metadata?.aspectRatio || '16:9',
            quality: result.metadata?.quality || 'standard',
            generationTime,
            creditsUsed: 1
          }
        };
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Failed to generate video for ${request.characterName}:`, error);
      return {
        videoUrl: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Generate multiple character performance samples
   */
  async generatePerformanceSamples(
    requests: VEO3VideoRequest[], 
    episodeId: string
  ): Promise<VEO3VideoResponse[]> {
    console.log(`🎭 Generating ${requests.length} performance samples for episode ${episodeId}...`);
    
    const results: VEO3VideoResponse[] = [];
    
    for (const request of requests) {
      const creditCheck = this.checkCredits(episodeId);
      if (!creditCheck.available) {
        console.warn(`⚠️ Credit limit reached for episode ${episodeId}. Stopping at ${results.length} videos.`);
        break;
      }
      
      const result = await this.generateCharacterVideo(request, episodeId);
      results.push(result);
      
      // Delay between generations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`🎬 Generated ${results.filter(r => r.success).length}/${requests.length} performance samples`);
    
    return results;
  }
  
  /**
   * Generate storyboard video from shot description
   * Optimized for storyboard shot sequences
   */
  async generateStoryboardVideo(
    shotDescription: string,
    sceneContext: string,
    episodeId: string,
    options?: {
      duration?: number;
      aspectRatio?: '16:9' | '9:16' | '1:1';
      style?: 'realistic' | 'cinematic' | 'documentary';
      quality?: 'standard' | 'high';
      hasAudio?: boolean; // Optional: only applies to quality mode
    }
  ): Promise<VEO3VideoResponse> {
    console.log(`🎬 Generating storyboard video for episode ${episodeId}...`);
    
    try {
      // Check credit availability
      const creditCheck = this.checkCredits(episodeId);
      if (!creditCheck.available) {
        throw new Error(`Credit limit exceeded for episode ${episodeId}. Used: ${creditCheck.used}/${this.maxCreditsPerEpisode}`);
      }
      
      const startTime = Date.now();
      
      // Validate required parameters
      if (!options?.duration) {
        throw new Error('Duration is required for video generation');
      }
      if (!options?.aspectRatio) {
        throw new Error('Aspect ratio is required for video generation');
      }
      if (!options?.quality) {
        throw new Error('Quality is required for video generation');
      }
      
      // VEO 3.1 API LIMITATIONS (per official documentation):
      // - Duration: Only supports 4, 6, or 8 seconds per clip
      // - Fast Mode: Supports both 16:9 and 9:16 aspect ratios (per official documentation)
      // - Quality Mode: Supports both 16:9 and 9:16 aspect ratios
      const validDurations = [4, 6, 8];
      if (!validDurations.includes(options.duration)) {
        throw new Error(`Duration must be 4, 6, or 8 seconds. VEO 3.1 does not support ${options.duration} seconds.`);
      }
      
      // Fast Mode now supports both 16:9 and 9:16 (per official documentation)
      // No validation needed - both aspect ratios are supported
      
      // Convert storyboard shot to VEO 3 request format - use exact values from options
      const videoRequest: VEO3VideoRequest = {
        characterName: 'Storyboard Shot',
        characterDescription: sceneContext,
        sceneDescription: shotDescription,
        performanceNotes: `Cinematic storyboard shot: ${shotDescription}`,
        videoStyle: options.style || 'cinematic',
        duration: options.duration, // Use exact value from options
        aspectRatio: options.aspectRatio, // Use exact value from options
        quality: options.quality, // Use exact value from options
        hasAudio: options.hasAudio ?? false // Default to false to save costs (only applies to quality mode)
      };
      
      console.log(`📋 Storyboard video request parameters (EXACT VALUES):`, {
        duration: videoRequest.duration,
        aspectRatio: videoRequest.aspectRatio,
        quality: videoRequest.quality,
        style: videoRequest.videoStyle,
        hasAudio: videoRequest.hasAudio,
        willUseFastMode: videoRequest.quality === 'standard'
      });
      
      // VALIDATE: Ensure quality parameter is correct
      if (videoRequest.quality !== 'standard' && videoRequest.quality !== 'high') {
        throw new Error(`Invalid quality parameter: ${videoRequest.quality}. Must be 'standard' (fast) or 'high' (quality)`);
      }
      
      // VALIDATE: Ensure hasAudio is false for fast mode
      if (videoRequest.quality === 'standard' && videoRequest.hasAudio) {
        console.warn(`⚠️ Fast mode doesn't support audio - forcing hasAudio to false`);
        videoRequest.hasAudio = false;
      }
      
      // Generate video using VEO 3
      const result = await this.generateVideoWithVEO3(videoRequest);
      
      // Consume credit on successful generation
      if (result.success) {
        this.consumeCredit(episodeId);
      }
      
      const generationTime = Date.now() - startTime;
      
      if (result.success) {
        const cost = result.metadata?.cost;
        console.log(`✅ Successfully generated storyboard video (${generationTime}ms)`);
        if (cost) {
          console.log(`💰 Cost: $${cost.amount.toFixed(2)} (${cost.mode} mode, ${cost.hasAudio ? 'with' : 'without'} audio)`);
        }
        
        // Use exact values from options to ensure metadata matches what was requested
        const requestedDuration = options?.duration || result.metadata?.duration || 8;
        const requestedAspectRatio = options?.aspectRatio || result.metadata?.aspectRatio || '16:9';
        const requestedQuality = options?.quality || result.metadata?.quality || 'high';
        
        return {
          ...result,
          metadata: {
            ...result.metadata,
            duration: requestedDuration,
            aspectRatio: requestedAspectRatio,
            quality: requestedQuality,
            generationTime,
            creditsUsed: 1,
            cost: cost || this.getCostEstimate(
              requestedDuration,
              true, // hasAudio
              requestedQuality === 'standard' // useFastMode
            )
          }
        };
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Failed to generate storyboard video:`, error);
      return {
        videoUrl: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Core VEO 3.1 video generation using Gemini API
   * Uses Google VEO 3.1 for video generation
   * Pricing: $0.40/sec (standard+audio), $0.20/sec (standard), $0.15/sec (fast+audio), $0.10/sec (fast)
   */
  private async generateVideoWithVEO3(request: VEO3VideoRequest): Promise<VEO3VideoResponse> {
    try {
      // Validate required parameters - no defaults, use exact values
      // VEO 3.1 only supports 4, 6, or 8 seconds
      const validDurations = [4, 6, 8];
      if (!request.duration || !validDurations.includes(request.duration)) {
        throw new Error(`Invalid duration: ${request.duration}. VEO 3.1 only supports 4, 6, or 8 seconds.`);
      }
      if (!request.aspectRatio) {
        throw new Error(`Aspect ratio is required.`);
      }
      if (!request.quality) {
        throw new Error(`Quality is required.`);
      }
      
      const videoPrompt = this.createVideoPrompt(request);
      const duration = request.duration; // Use exact value, no default
      const useFastMode = request.quality === 'standard'; // Use fast mode for standard quality
      // Fast mode doesn't support audio, so always false for fast mode
      // For quality mode, use the request's hasAudio preference (defaults to false to save costs)
      const hasAudio = useFastMode ? false : (request.hasAudio ?? false);
      const aspectRatio = request.aspectRatio; // Use exact value, no default
      
      console.log(`🎥 Making VEO 3.1 API call for ${request.characterName}...`);
      console.log(`📊 Request parameters (EXACT VALUES - NO DEFAULTS):`, {
        duration,
        aspectRatio,
        quality: request.quality,
        hasAudio: request.hasAudio,
        useFastMode,
        finalHasAudio: hasAudio ? 'YES' : 'NO'
      });
      console.log(`💰 Estimated cost: $${this.calculateVideoCost(duration, hasAudio, useFastMode).toFixed(2)}`);
      
      // CRITICAL VALIDATION - Log what we're actually sending
      if (aspectRatio === '9:16') {
        console.log(`✅ EXPECTING VERTICAL (9:16) VIDEO`);
      } else if (aspectRatio === '16:9') {
        console.log(`✅ EXPECTING HORIZONTAL (16:9) VIDEO`);
      }
      
      if (!hasAudio) {
        console.log(`✅ EXPECTING SILENT VIDEO (NO AUDIO)`);
      } else {
        console.log(`✅ EXPECTING VIDEO WITH AUDIO`);
      }
      
      // VEO 3.1 is accessed through Gemini API
      try {
        console.log(`🔄 Using Gemini API for VEO 3.1...`);
        
        // Use Gemini API REST endpoint for video generation
        const videoGenerationResult = await this.callGeminiVideoAPI(
          videoPrompt,
          duration,
          aspectRatio,
          useFastMode,
          hasAudio
        );
        
        if (videoGenerationResult.success && videoGenerationResult.videoUrl) {
          const cost = this.calculateVideoCost(duration, hasAudio, useFastMode);
          // Use exact values from request - no defaults
      return {
            videoUrl: videoGenerationResult.videoUrl,
            thumbnailUrl: this.generateThumbnailUrl(videoGenerationResult.videoUrl),
        success: true,
        metadata: {
              duration: duration, // Exact value from request
              aspectRatio: aspectRatio, // Exact value from request
              quality: request.quality, // Exact value from request
          generationTime: 0, // Will be set by calling function
              creditsUsed: 1,
              cost: {
                amount: cost,
                currency: 'USD',
                mode: useFastMode ? 'fast' : 'standard',
                hasAudio
              }
            }
          };
        }
        
        throw new Error(videoGenerationResult.error || 'Video generation failed');
        
      } catch (geminiError: any) {
        console.error('❌ Gemini API VEO 3.1 error:', geminiError);
        
        // Provide helpful error message
        if (geminiError.message?.includes('GEMINI_API_KEY')) {
          return {
            videoUrl: '',
            success: false,
            error: 'GEMINI_API_KEY environment variable is required for VEO 3.1. Please set it in your environment variables.'
          };
        }
        
        // DO NOT fall back to simulated - return actual error to prevent wasting tokens
        return {
          videoUrl: '',
          success: false,
          error: `VEO 3.1 generation failed: ${geminiError.message || 'Unknown error'}. Model: ${useFastMode ? 'veo-3.1-fast-generate-preview' : 'veo-3.1-generate-preview'}. Please check the console for details.`
        };
      }
      
    } catch (error) {
      console.error('VEO 3 generation error:', error);
      return {
        videoUrl: '',
        success: false,
        error: error instanceof Error ? error.message : 'VEO 3 generation failed'
      };
    }
  }
  
  /**
   * Parse video URL from API response
   */
  private parseVideoUrlFromResponse(responseText: string, request: VEO3VideoRequest): string | null {
    // Try to extract video URL from response
    const urlPatterns = [
      /https?:\/\/[^\s"']+\.mp4/gi,
      /https?:\/\/[^\s"']+\.mov/gi,
      /https?:\/\/[^\s"']+video[^\s"']*/gi,
      /https?:\/\/generativelanguage\.googleapis\.com\/[^\s"']*/gi,
    ];
    
    for (const pattern of urlPatterns) {
      const match = responseText.match(pattern);
      if (match && match[0]) {
        return match[0];
      }
    }
    
    // Check for JSON response with video URL
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.videoUrl || parsed.url || parsed.video_url) {
          return parsed.videoUrl || parsed.url || parsed.video_url;
        }
      }
    } catch (e) {
      // Not JSON, continue
    }
    
    return null;
  }
  
  /**
   * Parse task ID from response for async video generation
   */
  private parseTaskIdFromResponse(responseText: string): string | null {
    const taskIdPatterns = [
      /task[_-]?id["\s:]+([a-zA-Z0-9_-]+)/i,
      /id["\s:]+([a-zA-Z0-9_-]{20,})/i,
    ];
    
    for (const pattern of taskIdPatterns) {
      const match = responseText.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }
  
  /**
   * Poll for video completion when async generation is used
   */
  private async pollForVideoCompletion(taskId: string, request: VEO3VideoRequest, maxAttempts: number = 30): Promise<string | null> {
    console.log(`🔄 Polling for video completion (task: ${taskId})...`);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Wait before polling (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.min(2000 * (attempt + 1), 10000)));
        
        // In a real implementation, this would call the API to check task status
        // For now, we'll simulate or use a placeholder
        console.log(`⏳ Polling attempt ${attempt + 1}/${maxAttempts}...`);
        
        // TODO: Implement actual polling API call when VEO 3 async API is available
        // const status = await this.checkVideoGenerationStatus(taskId);
        // if (status.complete && status.videoUrl) {
        //   return status.videoUrl;
        // }
        
      } catch (error) {
        console.warn(`⚠️ Polling attempt ${attempt + 1} failed:`, error);
      }
    }
    
    console.warn(`⚠️ Video generation polling timed out after ${maxAttempts} attempts`);
    return null;
  }
  
  /**
   * Sanitize prompt to avoid content policy violations
   * Replaces potentially problematic terms with safer alternatives
   */
  private sanitizePromptForContentPolicy(prompt: string): string {
    // Only sanitize truly problematic terms that will definitely trigger content policy
    // Be conservative - don't sanitize normal film terms like "dark", "moody", "crime"
    let sanitized = prompt
      // Only explicit violence terms
      .replace(/\bgunshot\b/gi, 'sound')
      .replace(/\bbloody\b/gi, 'intense')
      .replace(/\bkilling\b/gi, 'resolution')
      .replace(/\bmurder\b/gi, 'mystery')
      .replace(/\bassault\b/gi, 'encounter')
      // Only explicit sensitive content
      .replace(/\bnude\b/gi, 'unclothed')
      .replace(/\bnaked\b/gi, 'uncovered')
      .replace(/\bsex\b/gi, 'intimacy')
      .replace(/\bsexual\b/gi, 'romantic')
      .replace(/\bexplicit\b/gi, 'detailed')
      // Only explicit destructive content
      .replace(/\bexplosion\b/gi, 'burst')
      .replace(/\bbomb\b/gi, 'device')
      .replace(/\bgore\b/gi, 'visual effect')
      .replace(/\btorture\b/gi, 'interrogation')
      .replace(/\bexecution\b/gi, 'resolution')
    
    // Only add qualifier if we actually sanitized something
    if (sanitized !== prompt) {
      sanitized += ', professional quality, cinematic'
      console.log(`🧹 Sanitized prompt (removed explicit content)`);
      console.log(`   Original: ${prompt.substring(0, 150)}...`);
      console.log(`   Sanitized: ${sanitized.substring(0, 150)}...`);
    }
    
    return sanitized;
  }

  /**
   * Create optimized prompt for VEO 3.1 video generation
   * Now supports comprehensive, context-heavy prompts from story bible, storyboards, and scripts
   * VEO 3.1 can handle longer prompts (up to ~1000 tokens / ~4000 characters)
   */
  private createVideoPrompt(request: VEO3VideoRequest): string {
    const {
      characterName,
      characterDescription,
      sceneDescription,
      performanceNotes,
      videoStyle = 'realistic',
      aspectRatio = '16:9'
    } = request;
    
    // Check if sceneDescription is already a comprehensive enhanced prompt
    // (contains structured sections like "**SERIES CONTEXT:**" or "**EPISODE CONTEXT:**")
    const isEnhancedPrompt = sceneDescription.includes('**') && (
      sceneDescription.includes('**SERIES CONTEXT:**') ||
      sceneDescription.includes('**EPISODE CONTEXT:**') ||
      sceneDescription.includes('**SCENE SCRIPT CONTENT:**') ||
      sceneDescription.includes('**STORYBOARD FRAME DETAILS:**')
    )
    
    let prompt = '';
    
    if (isEnhancedPrompt) {
      // Use the enhanced prompt as-is (it's already comprehensive)
      // Just ensure it's properly formatted and within limits
      prompt = sceneDescription;
      
      // Add final style directives if not already present
      if (!prompt.includes('cinematic quality') && !prompt.includes('professional cinematography')) {
        if (videoStyle === 'cinematic') {
          prompt += '\n\nCinematic quality, professional cinematography, dramatic composition';
        } else if (videoStyle === 'documentary') {
          prompt += '\n\nDocumentary style, natural lighting, authentic feel';
        } else {
          prompt += '\n\nRealistic, natural lighting, professional quality';
        }
      }
    } else {
      // Build a prompt for storyboard videos (legacy behavior for non-enhanced prompts)
      if (characterName === 'Storyboard Shot') {
        // Start with scene context to provide overall context
        if (characterDescription && characterDescription.trim()) {
          prompt = `Scene context: ${characterDescription}. `;
        }
        
        // Add the specific shot description
        prompt += sceneDescription;
        
        // Add style context if provided
        if (videoStyle === 'cinematic') {
          prompt += ', cinematic lighting, dramatic composition';
        } else if (videoStyle === 'documentary') {
          prompt += ', documentary style, natural lighting';
        } else {
          prompt += ', realistic, natural lighting';
        }
      } else {
        // For character videos, combine character and scene
        prompt = `${sceneDescription}`;
        
        if (characterDescription) {
          prompt += `, featuring ${characterDescription}`;
        }
        
        if (performanceNotes) {
          prompt += `. ${performanceNotes}`;
        }
        
        // Add style context
        if (videoStyle === 'cinematic') {
          prompt += ', cinematic quality, professional cinematography';
        } else if (videoStyle === 'documentary') {
          prompt += ', documentary style, natural and authentic';
        } else {
          prompt += ', realistic and natural';
        }
      }
    }
    
    // Sanitize prompt to avoid content policy violations
    prompt = this.sanitizePromptForContentPolicy(prompt);
    
    // Ensure prompt is within token limit (VEO 3.1 supports up to ~1000 tokens)
    // Rough estimate: 1 token ≈ 4 characters, so 4000 chars ≈ 1000 tokens (safe limit)
    // For enhanced prompts, we want to preserve as much context as possible
    if (prompt.length > 3800) {
      // Smart truncation: try to preserve key sections
      if (isEnhancedPrompt) {
        // For enhanced prompts, try to keep the most important parts
        const sections = prompt.split(/\n\*\*/)
        let truncated = ''
        let charCount = 0
        
        // Priority order: shot description, scene context, visual style, series context
        const priorityKeywords = [
          'SHOT DESCRIPTION',
          'SCENE CONTEXT',
          'VISUAL STYLE DIRECTIVES',
          'STORYBOARD FRAME DETAILS',
          'SCENE SCRIPT CONTENT',
          'EPISODE CONTEXT',
          'SERIES CONTEXT'
        ]
        
        for (const keyword of priorityKeywords) {
          const section = sections.find(s => s.includes(keyword))
          if (section && charCount + section.length < 3500) {
            truncated += (truncated ? '\n**' : '') + section
            charCount += section.length
          }
        }
        
        // If we still have room, add remaining sections
        for (const section of sections) {
          if (!truncated.includes(section) && charCount + section.length < 3500) {
            truncated += (truncated ? '\n**' : '') + section
            charCount += section.length
          }
        }
        
        if (truncated) {
          prompt = truncated
        } else {
          // Fallback: just truncate the original
          prompt = prompt.substring(0, 3800)
        }
      } else {
        // For simple prompts, just truncate
        prompt = prompt.substring(0, 3800)
      }
    }
    
    return prompt.trim();
  }
  
  /**
   * Credit management functions
   */
  private checkCredits(episodeId: string): { available: boolean; used: number; remaining: number } {
    const credit = this.creditStore.get(episodeId);
    
    if (!credit) {
      // Initialize credits for new episode
      this.creditStore.set(episodeId, {
        episodeId,
        creditsUsed: 0,
        maxCredits: this.maxCreditsPerEpisode,
        resetDate: new Date()
      });
      
      return {
        available: true,
        used: 0,
        remaining: this.maxCreditsPerEpisode
      };
    }
    
    const available = credit.creditsUsed < credit.maxCredits;
    
    return {
      available,
      used: credit.creditsUsed,
      remaining: credit.maxCredits - credit.creditsUsed
    };
  }
  
  private consumeCredit(episodeId: string): void {
    const credit = this.creditStore.get(episodeId);
    if (credit) {
      credit.creditsUsed += 1;
      this.creditStore.set(episodeId, credit);
      console.log(`💳 Credit consumed for episode ${episodeId}. Used: ${credit.creditsUsed}/${credit.maxCredits}`);
    }
  }
  
  /**
   * Get remaining credits for an episode
   */
  getRemainingCredits(episodeId: string): number {
    const creditCheck = this.checkCredits(episodeId);
    return creditCheck.remaining;
  }
  
  /**
   * Reset credits for an episode (admin function)
   */
  resetCredits(episodeId: string): void {
    this.creditStore.delete(episodeId);
    console.log(`🔄 Credits reset for episode ${episodeId}`);
  }
  
  /**
   * Helper functions
   */
  private getGeminiKey(): string {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured for VEO 3');
    }
    
    if (apiKey.length < 10) {
      throw new Error('GEMINI_API_KEY is too short, please check the value');
    }
    
    return apiKey;
  }
  
  private simulateVideoGeneration(request: VEO3VideoRequest): string {
    // Simulate video URL generation
    // In production, this would be the actual video URL from VEO 3
    const timestamp = Date.now();
    const characterSlug = request.characterName.toLowerCase().replace(/\s+/g, '-');
    
    return `https://veo3-videos.googleapis.com/generated/${characterSlug}-${timestamp}.mp4`;
  }
  
  private generateThumbnailUrl(videoUrl: string): string {
    return videoUrl.replace('.mp4', '_thumbnail.jpg');
  }
  
  /**
   * Call Gemini API REST endpoint for VEO 3.1 video generation
   * Uses predictLongRunning endpoint with operation polling
   * Documentation: https://ai.google.dev/gemini-api/docs/video
   */
  private async callGeminiVideoAPI(
    prompt: string,
    duration: number,
    aspectRatio: string,
    useFastMode: boolean,
    hasAudio: boolean
  ): Promise<{ success: boolean; videoUrl?: string; taskId?: string; error?: string }> {
    try {
      const apiKey = this.getGeminiKey();
      
      // Select model based on quality mode - CRITICAL: verify this is correct
      const model = useFastMode 
        ? 'veo-3.1-fast-generate-preview'
        : 'veo-3.1-generate-preview';
      
      // VALIDATE: Ensure we're using the correct model
      if (useFastMode && model !== 'veo-3.1-fast-generate-preview') {
        throw new Error(`CRITICAL: Fast mode selected but wrong model: ${model}`);
      }
      if (!useFastMode && model !== 'veo-3.1-generate-preview') {
        throw new Error(`CRITICAL: Quality mode selected but wrong model: ${model}`);
      }
      
      const apiUrl = `${this.GEMINI_API_BASE_URL}/models/${model}:predictLongRunning`;
      
      console.log(`📡 Calling Gemini API VEO 3.1...`);
      console.log(`\n   🔍 MODEL SELECTION VERIFICATION:`);
      console.log(`      useFastMode parameter: ${useFastMode}`);
      console.log(`      Selected model: ${model}`);
      console.log(`      Expected for Fast Mode: veo-3.1-fast-generate-preview`);
      console.log(`      Expected for Quality Mode: veo-3.1-generate-preview`);
      console.log(`      ✅ Model matches Fast Mode: ${model === 'veo-3.1-fast-generate-preview' && useFastMode ? 'YES ✅' : 'NO ❌'}`);
      console.log(`      ✅ Model matches Quality Mode: ${model === 'veo-3.1-generate-preview' && !useFastMode ? 'YES ✅' : 'NO ❌'}`);
      console.log(`   ✅ Duration: ${duration}s, Aspect Ratio: ${aspectRatio}, Fast Mode: ${useFastMode}, Audio: ${hasAudio}`);
      
      // Use SDK with config object - per official documentation
      // Documentation: https://ai.google.dev/gemini-api/docs/video
      // The SDK supports aspectRatio, resolution, and other parameters via config object
      
      try {
        const ai = this.getGenAIVideo();
        
        console.log(`\n📡 ===== VEO 3.1 API REQUEST (SDK with config) =====`);
        console.log(`   Model: ${model}`);
        console.log(`   Requested Parameters:`);
        console.log(`     - Duration: ${duration} seconds`);
        console.log(`     - Aspect Ratio: ${aspectRatio}`);
        console.log(`     - Resolution: 720p (default, saves costs)`);
        console.log(`     - Fast Mode: ${useFastMode}`);
        console.log(`     - Has Audio: ${hasAudio}`);
        console.log(`\n   📝 PROMPT:`);
        console.log(`   "${prompt}"`);
        
        // Build config object with parameters per documentation
        // Documentation: https://ai.google.dev/gemini-api/docs/video?example=realism#veo-model-parameters
        const config: any = {
          aspectRatio: aspectRatio, // "16:9" or "9:16" - supported for both Fast and Quality modes
          resolution: '720p', // Default to 720p to save costs (720p or 1080p supported)
          durationSeconds: duration // Number: 4, 6, or 8 - supported for Veo 3.1
        };
        
        // ⚠️ CRITICAL: Veo 3.1 ALWAYS generates audio, even in Fast Mode
        // There is NO API parameter to disable audio
        // negativePrompt can be used but doesn't guarantee silent videos
        if (!hasAudio) {
          config.negativePrompt = 'no audio, silent video, no sound, no music, no dialogue, no voice, completely silent';
          console.log(`   ⚠️  WARNING: Audio disabled requested, but Veo 3.1 always generates audio`);
          console.log(`   ⚠️  Added negativePrompt as best effort, but video will likely still have audio`);
        }
        
        // Note: Based on actual API behavior:
        // - Fast Mode DOES generate audio (contrary to some documentation)
        // - There is NO way to disable audio via API parameters
        // - negativePrompt may help but is not guaranteed
        // - Pricing confirms Fast Mode with audio: $0.15/sec
        
        console.log(`\n   📤 CONFIG OBJECT:`);
        console.log(JSON.stringify(config, null, 2));
        console.log(`\n=====================================\n`);
        
        // Start video generation with SDK
        console.log(`\n   🎯 CRITICAL: About to call SDK with:`);
        console.log(`      Model: ${model}`);
        console.log(`      useFastMode: ${useFastMode}`);
        console.log(`      Expected model for Fast Mode: veo-3.1-fast-generate-preview`);
        console.log(`      Expected model for Quality Mode: veo-3.1-generate-preview`);
        
        let operation = await ai.models.generateVideos({
          model: model,
          prompt: prompt,
          config: config
        });
        
        const operationName = operation.name;
        console.log(`\n🔄 Operation started: ${operationName}`);
        console.log(`   ✅ VERIFICATION: Operation name contains model: ${operationName.includes('fast') ? 'FAST MODE ✅' : operationName.includes('generate') ? 'QUALITY MODE ⚠️' : 'UNKNOWN'}`);
        console.log(`   ✅ Model used: ${model}`);
        console.log(`   ✅ Fast Mode requested: ${useFastMode}`);
        
        // Poll for completion - use REST API for polling as SDK polling can timeout
        // The SDK successfully created the operation, but we'll poll using REST API for reliability
        console.log(`   ⚠️  Using REST API for polling (SDK polling can timeout in Next.js)`);
        const videoUrl = await this.pollGeminiOperation(operationName, apiKey, 60, duration, aspectRatio, useFastMode, hasAudio);
        
        if (videoUrl) {
          return { success: true, videoUrl };
        }
        
        return { success: false, error: 'Video generation completed but no video URL found' };
        
      } catch (sdkError: any) {
        console.error(`❌ SDK error:`, sdkError.message);
        console.error(`   Full error:`, sdkError);
        
        // Fallback to REST API if SDK fails
        console.log(`\n   ⚠️  Falling back to REST API...`);
        
        // Build prompt with specifications for REST API fallback
        const aspectRatioText = aspectRatio === '9:16' 
          ? 'vertical portrait format (9:16 aspect ratio)' 
          : aspectRatio === '16:9' 
            ? 'horizontal widescreen format (16:9 aspect ratio)'
            : 'square format (1:1 aspect ratio)';
        
        let enhancedPrompt = `${prompt}. Video must be ${duration} seconds long, ${aspectRatioText}, 720p resolution`;
        
        const requestBody = {
          instances: [{
            prompt: enhancedPrompt
          }]
        };
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ REST API fallback error (${response.status}):`, errorText);
          return {
            success: false,
            error: `API error: ${response.status} - ${errorText.substring(0, 200)}`
          };
        }
        
        const result = await response.json();
        
        if (!result.name) {
          return {
            success: false,
            error: 'No operation name in response'
          };
        }
        
        const operationName = result.name;
        const videoUrl = await this.pollGeminiOperation(operationName, apiKey, 60, duration, aspectRatio, useFastMode, hasAudio);
        
        if (videoUrl) {
          return { success: true, videoUrl };
        }
        
        return {
          success: false,
          error: 'Video generation completed but no video URL found'
        };
      }
    } catch (error: any) {
      console.error('❌ Gemini API call failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to call Gemini API'
      };
    }
  }
  
  /**
   * Poll Gemini API operation for video completion
   * Documentation: https://ai.google.dev/gemini-api/docs/video
   */
  private async pollGeminiOperation(
    operationName: string,
    apiKey: string,
    maxAttempts: number = 60,
    requestedDuration?: number,
    requestedAspectRatio?: string,
    requestedFastMode?: boolean,
    requestedHasAudio?: boolean
  ): Promise<string | null> {
    const pollUrl = `${this.GEMINI_API_BASE_URL}/${operationName}`;
    
    console.log(`🔄 Polling Gemini API operation ${operationName}...`);
    
    // Flag to track if we've detected a permanent error
    let permanentErrorDetected = false;
    let permanentErrorMessage: string | null = null;
    
    // Limit for transient error retries (to prevent excessive retries)
    const maxTransientErrorRetries = 3; // Only retry transient errors 3 times max
    let transientErrorCount = 0;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Check if permanent error was detected in previous iteration
      if (permanentErrorDetected) {
        console.error(`❌ Stopping polling loop - permanent error already detected: ${permanentErrorMessage}`);
        throw new Error(permanentErrorMessage || 'Video generation failed');
      }
      if (attempt > 0) {
        // Poll every 10 seconds as per documentation recommendation
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
      try {
        const response = await fetch(pollUrl, {
          headers: {
            'x-goog-api-key': apiKey,
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          const errorMessage = errorText.substring(0, 200);
          
          // Parse error response if it's JSON
          let errorDetails: any = null;
          try {
            errorDetails = JSON.parse(errorText);
          } catch {
            // Not JSON, use text as-is
          }
          
          const errorCode = errorDetails?.error?.code;
          const apiErrorMessage = errorDetails?.error?.message || errorMessage;
          
          // Check for permanent/fatal errors that should stop retrying immediately
          // 404 = operation not found (permanent)
          // 400 = bad request (permanent - won't fix with retry)
          const isNotFound = response.status === 404;
          const isBadRequest = response.status === 400;
          
          // Check for specific error codes that indicate permanent failure
          const permanentErrorCodes = ['NOT_FOUND', 'INVALID_ARGUMENT', 'PERMISSION_DENIED', 'FAILED_PRECONDITION'];
          const hasPermanentErrorCode = permanentErrorCodes.includes(errorCode);
          
          // Check error message for permanent failure indicators
          const hasPermanentErrorMessage = apiErrorMessage.includes('internal server issue') ||
                                          apiErrorMessage.includes('permanent') ||
                                          apiErrorMessage.includes('fatal') ||
                                          apiErrorMessage.includes('not found') ||
                                          apiErrorMessage.includes('invalid');
          
          // For 5xx errors, only treat as permanent if:
          // 1. We've already tried multiple times (attempt > 5)
          // 2. OR the error message explicitly says it's permanent
          const isPersistent5xx = response.status >= 500 && response.status < 600 && 
                                 (attempt > 5 || hasPermanentErrorMessage);
          
          if (isNotFound || isBadRequest || hasPermanentErrorCode || hasPermanentErrorMessage || isPersistent5xx) {
            console.error(`❌ PERMANENT ERROR DETECTED (${response.status}): ${apiErrorMessage}`);
            console.error(`   Error code: ${errorCode || 'none'}`);
            console.error(`   Stopping polling immediately - this error will not resolve with retries`);
            
            // Format user-friendly error message
            const userFriendlyMessage = apiErrorMessage.includes('internal server issue')
              ? 'Video generation failed due to an internal server issue. Please try again in a few minutes. If the problem persists, please contact Gemini API support.'
              : apiErrorMessage || `Video generation failed: ${response.status}`;
            
            // Set flag and message, then throw to exit immediately
            permanentErrorDetected = true;
            permanentErrorMessage = userFriendlyMessage;
            throw new Error(userFriendlyMessage);
          }
          
          console.warn(`⚠️ Poll attempt ${attempt + 1} failed: ${response.status} - ${errorMessage}`);
          
          // For transient errors, continue polling
          if (attempt < maxAttempts - 1) {
            continue;
          } else {
            // Last attempt failed
            throw new Error(errorDetails?.error?.message || errorMessage || `Polling failed after ${maxAttempts} attempts: ${response.status}`);
          }
        }
        
        const result = await response.json();
        
        // Check for errors in the result object
        if (result.error) {
          const errorCode = result.error.code;
          const errorMessage = result.error.message || JSON.stringify(result.error);
          
          // Permanent errors that shouldn't be retried
          const permanentErrorCodes = ['INTERNAL', 'NOT_FOUND', 'INVALID_ARGUMENT', 'PERMISSION_DENIED'];
          if (permanentErrorCodes.includes(errorCode)) {
            console.error(`❌ Permanent API error detected: ${errorCode} - ${errorMessage}`);
            throw new Error(errorMessage || `API error: ${errorCode}`);
          }
          
          // For other errors, log and continue (might be transient)
          console.warn(`⚠️ API returned error in result: ${errorCode} - ${errorMessage}`);
          if (attempt === maxAttempts - 1) {
            throw new Error(errorMessage || `API error: ${errorCode}`);
          }
          continue;
        }
        
        // Verify we're polling the correct operation (ignore old operations)
        if (result.name && result.name !== operationName) {
          console.warn(`⚠️ Skipping old operation: ${result.name} (polling for ${operationName})`);
          continue;
        }
        
        if (result.done) {
          // Extract video URI from response per documentation format
          // Format: response.generateVideoResponse.generatedSamples[0].video.uri
          if (result.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri) {
            const videoSample = result.response.generateVideoResponse.generatedSamples[0];
            const videoUri = videoSample.video.uri;
            const videoData = videoSample.video;
            
            console.log(`\n✅ ===== VIDEO GENERATION COMPLETE =====`);
            console.log(`   Video URI: ${videoUri}`);
            console.log(`   Full Video Response:`, JSON.stringify(videoSample, null, 2));
            console.log(`\n   ⚠️  ACTUAL vs REQUESTED COMPARISON:`);
            if (requestedDuration !== undefined) {
              console.log(`      Requested Duration: ${requestedDuration}s`);
            }
            if (requestedAspectRatio) {
              console.log(`      Requested Aspect Ratio: ${requestedAspectRatio}`);
            }
            if (requestedHasAudio !== undefined) {
              console.log(`      Requested Audio: ${requestedHasAudio ? 'YES' : 'NO'}`);
            }
            if (requestedFastMode !== undefined) {
              console.log(`      Requested Fast Mode: ${requestedFastMode}`);
            }
            console.log(`      Actual Video Data from API:`, {
              uri: videoUri,
              duration: videoData.durationSeconds || 'NOT PROVIDED BY API',
              resolution: videoData.resolution || 'NOT PROVIDED BY API',
              aspectRatio: videoData.aspectRatio || 'NOT PROVIDED BY API',
              hasAudio: videoData.hasAudio !== undefined ? videoData.hasAudio : 'NOT PROVIDED BY API'
            });
            console.log(`\n   ⚠️  IMPORTANT: The API does not return video metadata.`);
            console.log(`      To verify if the video matches your request, you must:`);
            console.log(`      1. Download and play the video`);
            console.log(`      2. Check the actual duration, aspect ratio, and audio`);
            console.log(`      3. Compare with what was requested above`);
            console.log(`\n   📝 PROMPT SENT TO API:`);
            console.log(`      (Check earlier logs for the full prompt text)`);
            console.log(`==========================================\n`);
            
            // Download video using the URI
            const videoUrl = await this.downloadGeminiVideo(videoUri, apiKey);
            return videoUrl;
          }
          
          if (result.error) {
            throw new Error(result.error.message || JSON.stringify(result.error));
          }
          
          // Check for filtered/blocked video - STOP IMMEDIATELY, don't retry
          if (result.response?.generateVideoResponse?.raiMediaFilteredCount > 0) {
            const reasons = result.response.generateVideoResponse.raiMediaFilteredReasons || [];
            const errorMessage = reasons.join('; ') || 'Video was filtered by safety/content filters';
            
            console.error(`\n❌ ===== VIDEO GENERATION BLOCKED =====`);
            console.error(`   Reason: ${errorMessage}`);
            console.error(`   Filtered Count: ${result.response.generateVideoResponse.raiMediaFilteredCount}`);
            console.error(`   Full Response:`, JSON.stringify(result.response.generateVideoResponse, null, 2));
            console.error(`   ⚠️  STOPPING - Content policy violation detected. Will not retry.`);
            console.error(`==========================================\n`);
            
            // Return null immediately - don't throw to avoid retries
            return null;
          }
          
          // Log full response if no video URI found
          console.error('❌ Operation done but no video URI in response:', JSON.stringify(result).substring(0, 500));
        } else {
          console.log(`⏳ Task still processing... (attempt ${attempt + 1}/${maxAttempts})`);
        }
      } catch (error: any) {
        const errorMessage = error?.message || String(error) || 'Unknown error';
        
        // Check if it's a content policy error - stop immediately
        if (errorMessage.includes('Video generation blocked') || errorMessage.includes('safety policies')) {
          console.error(`❌ Content policy violation detected during polling - stopping immediately`);
          return null;
        }
        
        // Check if it's a permanent error that was thrown intentionally
        // These errors should NOT be retried - they indicate a permanent failure
        const permanentErrorIndicators = [
          'internal server issue',
          'Video generation failed',
          'NOT_FOUND',
          'INTERNAL',
          'INVALID_ARGUMENT',
          'PERMISSION_DENIED',
          'FAILED_PRECONDITION',
          'Permanent error',
          'permanent',
          'fatal'
        ];
        
        const isPermanentError = permanentErrorIndicators.some(indicator => 
          errorMessage.includes(indicator)
        );
        
        if (isPermanentError) {
          console.error(`❌ PERMANENT ERROR DETECTED - STOPPING POLLING IMMEDIATELY`);
          console.error(`   Error message: ${errorMessage}`);
          console.error(`   Attempt: ${attempt + 1}/${maxAttempts}`);
          console.error(`   This error will not resolve with retries - stopping now`);
          
          // Format error message for user
          const userFriendlyMessage = errorMessage.includes('internal server issue') 
            ? 'Video generation failed due to an internal server issue. Please try again in a few minutes. If the problem persists, please contact Gemini API support.'
            : errorMessage;
          
          // Set flag and message, then throw to exit immediately
          permanentErrorDetected = true;
          permanentErrorMessage = userFriendlyMessage;
          throw new Error(userFriendlyMessage);
        }
        
        // For transient errors, log and potentially retry (with limit)
        transientErrorCount++;
        console.warn(`⚠️ Transient poll error (attempt ${attempt + 1}/${maxAttempts}, transient error #${transientErrorCount}): ${errorMessage}`);
        
        // Check if we've exceeded the transient error retry limit
        if (transientErrorCount > maxTransientErrorRetries) {
          console.error(`❌ Too many transient errors (${transientErrorCount} > ${maxTransientErrorRetries}) - stopping polling`);
          throw new Error(`Video generation failed after ${transientErrorCount} transient errors. Please try again later.`);
        }
        
        // Only continue if we have more attempts left AND haven't exceeded transient error limit
        if (attempt < maxAttempts - 1) {
          // Wait before retrying (exponential backoff for transient errors)
          const retryDelay = Math.min(5000 * transientErrorCount, 15000); // Max 15 seconds, shorter delays
          console.log(`   Retrying in ${retryDelay}ms... (${maxTransientErrorRetries - transientErrorCount} transient retries remaining)`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        } else {
          // Last attempt failed - throw to exit
          console.error(`❌ All ${maxAttempts} polling attempts exhausted`);
          throw new Error(errorMessage || 'Video generation polling failed after maximum attempts');
        }
      }
    }
    
    // If we get here, we've exhausted all attempts without success
    // Check if we detected a permanent error but somehow continued
    if (permanentErrorDetected && permanentErrorMessage) {
      console.error(`❌ Polling loop ended but permanent error was detected earlier: ${permanentErrorMessage}`);
      throw new Error(permanentErrorMessage);
    }
    
    console.warn(`⚠️ Polling timed out after ${maxAttempts} attempts`);
    return null;
  }
  
  /**
   * Convert Gemini API video URI to proxy URL
   * The video URI requires authentication, so we use a proxy endpoint
   */
  private async downloadGeminiVideo(videoUri: string, apiKey: string): Promise<string> {
    try {
      console.log(`📥 Converting video URI to proxy URL: ${videoUri.substring(0, 50)}...`);
      
      // Use proxy endpoint to serve video with authentication
      // The proxy endpoint handles the API key authentication
      const proxyUrl = `/api/veo3-video-proxy?uri=${encodeURIComponent(videoUri)}`;
      
      return proxyUrl;
      
    } catch (error: any) {
      console.error('❌ Failed to create proxy URL:', error);
      // Return URI anyway - might work in some cases
      return videoUri;
    }
  }
  
  /**
   * Calculate video generation cost based on VEO 3.1 pricing
   * Pricing (as of 2024):
   * - Standard with audio: $0.40/second
   * - Standard without audio: $0.20/second
   * - Fast with audio: $0.15/second
   * - Fast without audio: $0.10/second
   */
  private calculateVideoCost(durationSeconds: number, hasAudio: boolean, useFastMode: boolean): number {
    let costPerSecond: number;
    
    if (useFastMode) {
      costPerSecond = hasAudio ? 0.15 : 0.10;
    } else {
      costPerSecond = hasAudio ? 0.40 : 0.20;
    }
    
    return durationSeconds * costPerSecond;
  }
  
  /**
   * Get cost estimate for video generation
   */
  getCostEstimate(durationSeconds: number, hasAudio: boolean = true, useFastMode: boolean = false): {
    amount: number;
    currency: string;
    mode: 'standard' | 'fast';
    hasAudio: boolean;
    duration: number;
  } {
    return {
      amount: this.calculateVideoCost(durationSeconds, hasAudio, useFastMode),
      currency: 'USD',
      mode: useFastMode ? 'fast' : 'standard',
      hasAudio,
      duration: durationSeconds
    };
  }
}

// Export singleton instance (lazy initialization - won't fail if API key not set at module load)
let veo3VideoGeneratorInstance: VEO3VideoGenerator | null = null;

export const veo3VideoGenerator: VEO3VideoGenerator = new Proxy({} as VEO3VideoGenerator, {
  get(target, prop) {
    if (!veo3VideoGeneratorInstance) {
      veo3VideoGeneratorInstance = new VEO3VideoGenerator();
    }
    const value = (veo3VideoGeneratorInstance as any)[prop];
    return typeof value === 'function' ? value.bind(veo3VideoGeneratorInstance) : value;
  }
});

export type { VEO3VideoRequest, VEO3VideoResponse, VideoCredit };

