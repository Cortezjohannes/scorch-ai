/**
 * 🎭 CONTENT ENHANCEMENT MIDDLEWARE
 * The bridge between existing content generation and AI engine enhancement
 * 
 * CORE FUNCTION: "Steroid Injection" for Existing Content Generation
 * - Wraps existing content generation functions with engine enhancement
 * - Maintains 100% backward compatibility
 * - Provides transparent quality improvement
 * - Implements bulletproof fallback mechanisms
 * 
 * INTEGRATION PHILOSOPHY:
 * - Non-destructive enhancement of existing functions
 * - Zero breaking changes to current workflow
 * - Progressive enhancement with user control
 * - Performance optimization with caching
 */

import { enhancedOrchestrator, TabEnhancementRequest, EnhancementOptions, EnhancementResult, NarrativeContext } from './enhanced-orchestrator'

// ============================================================================
// CONTENT ENHANCEMENT WRAPPER INTERFACES
// ============================================================================

export interface ContentGenerationRequest {
  contentType: 'script' | 'storyboard' | 'props' | 'location' | 'casting' | 'marketing' | 'postProduction' | 'narrative'
  originalPrompt: string
  context: any
  storyBible?: any
  episodeData?: any
  arcIndex?: number
  enhancementOptions?: Partial<EnhancementOptions>
}

export interface EnhancedContentResult {
  content: any
  enhanced: boolean
  originalContent?: any
  enhancementMetadata: {
    enginesUsed: string[]
    processingTime: number
    qualityScore: number
    fallbackReason?: string
  }
}

export interface ContentGenerationFunction {
  (prompt: string, context?: any): Promise<any>
}

// ============================================================================
// MAIN CONTENT ENHANCEMENT MIDDLEWARE
// ============================================================================

export class ContentEnhancementMiddleware {
  private static instance: ContentEnhancementMiddleware
  private narrativeContextCache: Map<string, NarrativeContext> = new Map()
  private enhancementSettings: EnhancementOptions

  constructor() {
    // Default enhancement settings - can be overridden per request
    this.enhancementSettings = {
      useEngines: true,
      qualityLevel: 'standard',
      mode: 'beast',
      fallbackOnError: true,
      maxProcessingTime: 30000, // 30 seconds max
      enableConsistencyValidation: true,
      performanceOptimization: true
    }
  }

  public static getInstance(): ContentEnhancementMiddleware {
    if (!ContentEnhancementMiddleware.instance) {
      ContentEnhancementMiddleware.instance = new ContentEnhancementMiddleware()
    }
    return ContentEnhancementMiddleware.instance
  }

  /**
   * 🚀 MAIN ENHANCEMENT WRAPPER
   * Wraps any content generation function with engine enhancement
   */
  async enhanceContentGeneration(
    originalGenerationFn: ContentGenerationFunction,
    request: ContentGenerationRequest
  ): Promise<EnhancedContentResult> {
    const startTime = Date.now()
    
    console.log(`\n🎭 ═══════════════════════════════════════════════════════════════════════════════════`);
    console.log(`🚀 CONTENT ENHANCEMENT MIDDLEWARE: ${request.contentType.toUpperCase()} GENERATION`);
    console.log(`📝 Original Prompt: ${request.originalPrompt.substring(0, 100)}...`);
    console.log(`🎭 ═══════════════════════════════════════════════════════════════════════════════════`);

    try {
      // STAGE 1: Generate original content first (fallback safety)
      console.log(`📋 Stage 1: Generating original content...`);
      const originalContent = await this.executeOriginalGeneration(originalGenerationFn, request)
      
      // STAGE 2: Build narrative context for enhancement
      console.log(`🧠 Stage 2: Building narrative context...`);
      const narrativeContext = await this.buildNarrativeContext(request)
      
      // STAGE 3: Configure enhancement options
      console.log(`⚙️ Stage 3: Configuring enhancement options...`);
      const enhancementOptions = this.mergeEnhancementOptions(request.enhancementOptions)
      
      // STAGE 4: Execute engine enhancement (with fallback to original)
      console.log(`⚡ Stage 4: Executing engine enhancement...`);
      const enhancementResult = await this.executeEngineEnhancement(
        originalContent,
        request.contentType,
        narrativeContext,
        enhancementOptions
      )
      
      // STAGE 5: Return final result
      const totalProcessingTime = Date.now() - startTime
      console.log(`✅ ENHANCEMENT COMPLETE: ${request.contentType} in ${totalProcessingTime}ms`);
      console.log(`📊 Final Quality Score: ${(enhancementResult.qualityScore * 100).toFixed(1)}%`);
      console.log(`🎭 ═══════════════════════════════════════════════════════════════════════════════════\n`);
      
      return {
        content: enhancementResult.content,
        enhanced: enhancementResult.enhanced,
        originalContent,
        enhancementMetadata: {
          enginesUsed: enhancementResult.enginesUsed,
          processingTime: totalProcessingTime,
          qualityScore: enhancementResult.qualityScore,
          fallbackReason: enhancementResult.fallbackReason
        }
      }
      
    } catch (error) {
      console.error(`❌ CRITICAL ERROR in content enhancement:`, error);
      
      // BULLETPROOF FALLBACK: Generate original content if everything fails
      try {
        const fallbackContent = await this.executeOriginalGeneration(originalGenerationFn, request)
        const fallbackTime = Date.now() - startTime
        
        console.log(`🛡️ FALLBACK SUCCESSFUL: Returning original content after ${fallbackTime}ms`);
        console.log(`🎭 ═══════════════════════════════════════════════════════════════════════════════════\n`);
        
        return {
          content: fallbackContent,
          enhanced: false,
          originalContent: fallbackContent,
          enhancementMetadata: {
            enginesUsed: [],
            processingTime: fallbackTime,
            qualityScore: 0.5,
            fallbackReason: `Critical enhancement failure: ${error instanceof Error ? error.message : String(error)}`
          }
        }
      } catch (fallbackError) {
        console.error(`💥 FALLBACK FAILED:`, fallbackError);
        throw new Error(`Complete system failure: ${error instanceof Error ? error.message : String(error)} | Fallback: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`)
      }
    }
  }

  /**
   * 🔧 CONVENIENT WRAPPER FUNCTIONS FOR SPECIFIC CONTENT TYPES
   * Pre-configured functions for each tab type
   */

  async enhanceScriptGeneration(
    originalFn: ContentGenerationFunction,
    prompt: string,
    context: any,
    storyBible?: any
  ): Promise<EnhancedContentResult> {
    return this.enhanceContentGeneration(originalFn, {
      contentType: 'script',
      originalPrompt: prompt,
      context,
      storyBible,
      enhancementOptions: {
        qualityLevel: 'professional', // Scripts get highest quality
        enableConsistencyValidation: true
      }
    })
  }

  async enhanceStoryboardGeneration(
    originalFn: ContentGenerationFunction,
    prompt: string,
    context: any,
    storyBible?: any
  ): Promise<EnhancedContentResult> {
    return this.enhanceContentGeneration(originalFn, {
      contentType: 'storyboard',
      originalPrompt: prompt,
      context,
      storyBible,
      enhancementOptions: {
        qualityLevel: 'professional',
        performanceOptimization: true
      }
    })
  }

  async enhanceCastingGeneration(
    originalFn: ContentGenerationFunction,
    prompt: string,
    context: any,
    storyBible?: any
  ): Promise<EnhancedContentResult> {
    return this.enhanceContentGeneration(originalFn, {
      contentType: 'casting',
      originalPrompt: prompt,
      context,
      storyBible,
      enhancementOptions: {
        qualityLevel: 'standard',
        maxProcessingTime: 20000 // Faster for casting
      }
    })
  }

  async enhanceMarketingGeneration(
    originalFn: ContentGenerationFunction,
    prompt: string,
    context: any,
    storyBible?: any
  ): Promise<EnhancedContentResult> {
    return this.enhanceContentGeneration(originalFn, {
      contentType: 'marketing',
      originalPrompt: prompt,
      context,
      storyBible,
      enhancementOptions: {
        qualityLevel: 'standard',
        enableConsistencyValidation: false // Marketing can be more flexible
      }
    })
  }

  async enhancePropsGeneration(
    originalFn: ContentGenerationFunction,
    prompt: string,
    context: any,
    storyBible?: any
  ): Promise<EnhancedContentResult> {
    return this.enhanceContentGeneration(originalFn, {
      contentType: 'props',
      originalPrompt: prompt,
      context,
      storyBible,
      enhancementOptions: {
        qualityLevel: 'standard'
      }
    })
  }

  async enhanceLocationGeneration(
    originalFn: ContentGenerationFunction,
    prompt: string,
    context: any,
    storyBible?: any
  ): Promise<EnhancedContentResult> {
    return this.enhanceContentGeneration(originalFn, {
      contentType: 'location',
      originalPrompt: prompt,
      context,
      storyBible,
      enhancementOptions: {
        qualityLevel: 'standard'
      }
    })
  }

  async enhancePostProductionGeneration(
    originalFn: ContentGenerationFunction,
    prompt: string,
    context: any,
    storyBible?: any
  ): Promise<EnhancedContentResult> {
    return this.enhanceContentGeneration(originalFn, {
      contentType: 'postProduction',
      originalPrompt: prompt,
      context,
      storyBible,
      enhancementOptions: {
        qualityLevel: 'standard'
      }
    })
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async executeOriginalGeneration(
    originalFn: ContentGenerationFunction,
    request: ContentGenerationRequest
  ): Promise<any> {
    try {
      return await originalFn(request.originalPrompt, request.context)
    } catch (error) {
      console.error(`❌ Original generation failed:`, error);
      throw new Error(`Original content generation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async buildNarrativeContext(request: ContentGenerationRequest): Promise<NarrativeContext> {
    const contextKey = this.generateContextKey(request)
    
    // Check cache first
    if (this.narrativeContextCache.has(contextKey)) {
      return this.narrativeContextCache.get(contextKey)!
    }

    // Build new narrative context
    const narrativeContext: NarrativeContext = {
      storyBible: request.storyBible || {},
      episodeData: request.episodeData || {},
      characterStates: new Map(),
      worldState: {},
      previousContent: new Map(),
      genre: this.extractGenre(request),
      theme: this.extractTheme(request),
      projectId: this.extractProjectId(request),
      arcIndex: request.arcIndex
    }

    // Cache the context
    this.narrativeContextCache.set(contextKey, narrativeContext)
    
    return narrativeContext
  }

  private mergeEnhancementOptions(userOptions?: Partial<EnhancementOptions>): EnhancementOptions {
    return {
      ...this.enhancementSettings,
      ...userOptions
    }
  }

  private async executeEngineEnhancement(
    originalContent: any,
    contentType: string,
    narrativeContext: NarrativeContext,
    enhancementOptions: EnhancementOptions
  ): Promise<EnhancementResult> {
    const enhancementRequest: TabEnhancementRequest = {
      tabType: contentType as any,
      originalContent,
      narrativeContext,
      enhancementOptions
    }

    return await enhancedOrchestrator.enhanceTabContent(enhancementRequest)
  }

  private generateContextKey(request: ContentGenerationRequest): string {
    return `${request.contentType}-${request.arcIndex || 0}-${JSON.stringify(request.storyBible).slice(0, 50)}`
  }

  private extractGenre(request: ContentGenerationRequest): string[] {
    if (request.storyBible?.genre) {
      return Array.isArray(request.storyBible.genre) 
        ? request.storyBible.genre 
        : [request.storyBible.genre]
    }
    if (request.context?.genre) {
      return Array.isArray(request.context.genre) 
        ? request.context.genre 
        : [request.context.genre]
    }
    return ['drama'] // Default genre
  }

  private extractTheme(request: ContentGenerationRequest): string {
    return request.storyBible?.theme || 
           request.context?.theme || 
           'Human connection and growth'
  }

  private extractProjectId(request: ContentGenerationRequest): string | undefined {
    return request.context?.projectId || 
           request.storyBible?.projectId
  }

  // ============================================================================
  // CONFIGURATION METHODS
  // ============================================================================

  public updateGlobalSettings(newSettings: Partial<EnhancementOptions>) {
    this.enhancementSettings = {
      ...this.enhancementSettings,
      ...newSettings
    }
    console.log(`🔧 Enhancement settings updated:`, newSettings);
  }

  public enableBeastMode() {
    this.updateGlobalSettings({
      mode: 'beast',
      qualityLevel: 'professional',
      maxProcessingTime: 60000, // Allow more time for beast mode
      performanceOptimization: true
    })
    console.log(`🦁 BEAST MODE ACTIVATED: Maximum quality enhancement enabled`);
  }

  public enableStableMode() {
    this.updateGlobalSettings({
      mode: 'stable',
      qualityLevel: 'standard',
      maxProcessingTime: 30000,
      performanceOptimization: true
    })
    console.log(`🔹 STABLE MODE ACTIVATED: Reliable performance optimization enabled`);
  }

  public disableEngines() {
    this.updateGlobalSettings({
      useEngines: false
    })
    console.log(`🛑 ENGINES DISABLED: Content generation will use original functions only`);
  }

  public enableEngines() {
    this.updateGlobalSettings({
      useEngines: true
    })
    console.log(`🚀 ENGINES ENABLED: Enhanced content generation activated`);
  }

  public clearCache() {
    this.narrativeContextCache.clear()
    console.log(`🧹 Narrative context cache cleared`);
  }
}

// ============================================================================
// SINGLETON INSTANCE AND CONVENIENCE EXPORTS
// ============================================================================

export const contentEnhancer = ContentEnhancementMiddleware.getInstance()

// Convenience functions for direct use
export const enhanceScript = contentEnhancer.enhanceScriptGeneration.bind(contentEnhancer)
export const enhanceStoryboard = contentEnhancer.enhanceStoryboardGeneration.bind(contentEnhancer)
export const enhanceCasting = contentEnhancer.enhanceCastingGeneration.bind(contentEnhancer)
export const enhanceMarketing = contentEnhancer.enhanceMarketingGeneration.bind(contentEnhancer)
export const enhanceProps = contentEnhancer.enhancePropsGeneration.bind(contentEnhancer)
export const enhanceLocation = contentEnhancer.enhanceLocationGeneration.bind(contentEnhancer)
export const enhancePostProduction = contentEnhancer.enhancePostProductionGeneration.bind(contentEnhancer)

// Configuration functions
export const enableBeastMode = () => contentEnhancer.enableBeastMode()
export const enableStableMode = () => contentEnhancer.enableStableMode()
export const disableEngines = () => contentEnhancer.disableEngines()
export const enableEngines = () => contentEnhancer.enableEngines()
export const clearEnhancementCache = () => contentEnhancer.clearCache()


