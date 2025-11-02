/**
 * 🚀 PRODUCTION EPISODE GENERATOR
 * 
 * Production-safe episode generation with comprehensive error handling and fallbacks.
 * Phase 5: Production Deployment Implementation
 */

import { runComprehensiveEngines, ComprehensiveEngineNotes } from './engines-comprehensive'
import { generateContent } from './azure-openai'
import { productionQualityMonitor, ProductionEpisodeLog } from './production-quality-monitor'
import { logger } from './console-logger'

// 📊 PRODUCTION SAFETY INTERFACES

export interface ProductionGenerationRequest {
  storyBible: any
  episodeNumber: number
  previousChoice?: string
  userChoices?: any[]
  sessionId?: string
  userId?: string
  featureFlags?: string[]
  qualityThreshold?: number
  maxProcessingTime?: number
}

export interface ProductionGenerationResult {
  success: boolean
  episode?: any
  generationMode: 'comprehensive' | 'enhanced_baseline' | 'basic_fallback'
  qualityScore: number
  processingTime: number
  engineMetadata?: any
  fallbackReason?: string
  warnings: string[]
  log: ProductionEpisodeLog
}

export interface FallbackConfig {
  enableComprehensiveEngines: boolean
  enableEnhancedBaseline: boolean
  enableBasicFallback: boolean
  qualityThreshold: number
  maxRetries: number
  retryDelay: number
  engineTimeoutMs: number
}

// 🎯 PRODUCTION EPISODE GENERATOR CLASS

export class ProductionEpisodeGenerator {
  private fallbackConfig: FallbackConfig
  
  constructor(fallbackConfig?: Partial<FallbackConfig>) {
    this.fallbackConfig = {
      enableComprehensiveEngines: true,
      enableEnhancedBaseline: true, 
      enableBasicFallback: true,
      qualityThreshold: 7.0,
      maxRetries: 2,
      retryDelay: 1000,
      engineTimeoutMs: 60000,
      ...fallbackConfig
    }
    
    console.log('🚀 Production Episode Generator initialized')
    console.log(`   Quality Threshold: ${this.fallbackConfig.qualityThreshold}/10`)
    console.log(`   Max Retries: ${this.fallbackConfig.maxRetries}`)
    console.log(`   Engine Timeout: ${this.fallbackConfig.engineTimeoutMs}ms`)
  }
  
  // 🎯 MAIN PRODUCTION-SAFE GENERATION METHOD
  
  async generateEpisodeWithProductionSafety(request: ProductionGenerationRequest): Promise<ProductionGenerationResult> {
    const sessionId = request.sessionId || `session_${Date.now()}`
    const episodeId = `episode_${request.episodeNumber}_${Date.now()}`
    const startTime = Date.now()
    
    logger.startNewSession(`Production Episode ${request.episodeNumber}`)
    
    const warnings: string[] = []
    let result: ProductionGenerationResult | null = null
    
    try {
      // Step 1: Try comprehensive engines (if enabled)
      if (this.fallbackConfig.enableComprehensiveEngines && this.shouldUseComprehensiveEngines(request)) {
        console.log('🚀 PRODUCTION: Attempting comprehensive engine generation...')
        result = await this.attemptComprehensiveGeneration(request, sessionId, episodeId, startTime)
        
        if (result.success && result.qualityScore >= this.fallbackConfig.qualityThreshold) {
          console.log(`✅ PRODUCTION: Comprehensive generation successful (${result.qualityScore}/10)`)
          return result
        } else {
          warnings.push(`Comprehensive engines failed or quality insufficient (${result?.qualityScore || 0}/10)`)
        }
      }
      
      // Step 2: Try enhanced baseline (if enabled)
      if (this.fallbackConfig.enableEnhancedBaseline) {
        console.log('🔄 PRODUCTION: Falling back to enhanced baseline generation...')
        result = await this.attemptEnhancedBaselineGeneration(request, sessionId, episodeId, startTime)
        
        if (result.success && result.qualityScore >= this.fallbackConfig.qualityThreshold) {
          console.log(`✅ PRODUCTION: Enhanced baseline successful (${result.qualityScore}/10)`)
          result.warnings = warnings
          return result
        } else {
          warnings.push(`Enhanced baseline failed or quality insufficient (${result?.qualityScore || 0}/10)`)
        }
      }
      
      // Step 3: Basic fallback (always enabled as last resort)
      if (this.fallbackConfig.enableBasicFallback) {
        console.log('🆘 PRODUCTION: Using basic fallback generation...')
        result = await this.attemptBasicFallbackGeneration(request, sessionId, episodeId, startTime)
        
        if (result.success) {
          console.log(`⚠️ PRODUCTION: Basic fallback completed (${result.qualityScore}/10)`)
          result.warnings = warnings
          return result
        } else {
          warnings.push('Basic fallback generation failed')
        }
      }
      
      // If all methods failed, return error result
      throw new Error('All generation methods failed')
      
    } catch (error) {
      console.error('❌ PRODUCTION: Critical episode generation failure:', error)
      
      // Create emergency fallback result
      const processingTime = Date.now() - startTime
      const emergencyEpisode = this.createEmergencyFallbackEpisode(request)
      
      const emergencyLog = await productionQualityMonitor.assessEpisodeQuality(
        emergencyEpisode,
        request.storyBible,
        sessionId,
        episodeId,
        processingTime
      )
      
      return {
        success: false,
        episode: emergencyEpisode,
        generationMode: 'basic_fallback',
        qualityScore: 2.0, // Emergency fallback quality
        processingTime,
        fallbackReason: 'Critical system failure - emergency fallback used',
        warnings: [...warnings, 'Emergency fallback activated'],
        log: emergencyLog
      }
    }
  }
  
  // 🎭 COMPREHENSIVE ENGINES GENERATION
  
  private async attemptComprehensiveGeneration(
    request: ProductionGenerationRequest, 
    sessionId: string, 
    episodeId: string,
    startTime: number
  ): Promise<ProductionGenerationResult> {
    try {
      // Generate episode draft first
      const draft = await this.generateEpisodeDraft(request.storyBible, request.episodeNumber, request.previousChoice)
      
      // Run comprehensive engines with timeout
      const enginePromise = runComprehensiveEngines(
        draft, 
        request.storyBible, 
        'beast',
        {
          includeGenreEngines: true,
          maxConcurrency: 5,
          timeoutOverride: this.fallbackConfig.engineTimeoutMs
        }
      )
      
      const engineResult = await Promise.race([
        enginePromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Engine timeout')), this.fallbackConfig.engineTimeoutMs)
        )
      ]) as any
      
      // Generate final episode using comprehensive engine notes
      const finalEpisode = await this.generateFinalEpisodeWithEngines(
        draft,
        request.storyBible,
        request.episodeNumber,
        request.previousChoice,
        engineResult.notes
      )
      
      const processingTime = Date.now() - startTime
      
      // Assess quality and log
      const log = await productionQualityMonitor.assessEpisodeQuality(
        finalEpisode,
        request.storyBible,
        sessionId,
        episodeId,
        processingTime,
        engineResult.metadata
      )
      
      return {
        success: true,
        episode: finalEpisode,
        generationMode: 'comprehensive',
        qualityScore: log.qualityScore,
        processingTime,
        engineMetadata: engineResult.metadata,
        warnings: [],
        log
      }
      
    } catch (error) {
      console.error('❌ Comprehensive generation failed:', error)
      const processingTime = Date.now() - startTime
      
      // Create a basic log entry for the failure
      const failureLog = await productionQualityMonitor.assessEpisodeQuality(
        { title: 'Failed Episode', scenes: [] },
        request.storyBible,
        sessionId,
        episodeId,
        processingTime
      )
      
      return {
        success: false,
        generationMode: 'comprehensive',
        qualityScore: 0,
        processingTime,
        fallbackReason: `Comprehensive engines failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        warnings: [],
        log: failureLog
      }
    }
  }
  
  // 🔧 ENHANCED BASELINE GENERATION
  
  private async attemptEnhancedBaselineGeneration(
    request: ProductionGenerationRequest,
    sessionId: string,
    episodeId: string,
    startTime: number
  ): Promise<ProductionGenerationResult> {
    try {
      // Generate episode draft
      const draft = await this.generateEpisodeDraft(request.storyBible, request.episodeNumber, request.previousChoice)
      
      // Use enhanced baseline approach (high creativity, complete context, no engines)
      const finalEpisode = await this.generateEnhancedBaselineEpisode(
        draft,
        request.storyBible,
        request.episodeNumber,
        request.previousChoice
      )
      
      const processingTime = Date.now() - startTime
      
      // Assess quality and log
      const log = await productionQualityMonitor.assessEpisodeQuality(
        finalEpisode,
        request.storyBible,
        sessionId,
        episodeId,
        processingTime
      )
      
      return {
        success: true,
        episode: finalEpisode,
        generationMode: 'enhanced_baseline',
        qualityScore: log.qualityScore,
        processingTime,
        warnings: [],
        log
      }
      
    } catch (error) {
      console.error('❌ Enhanced baseline generation failed:', error)
      const processingTime = Date.now() - startTime
      
      const failureLog = await productionQualityMonitor.assessEpisodeQuality(
        { title: 'Failed Episode', scenes: [] },
        request.storyBible,
        sessionId,
        episodeId,
        processingTime
      )
      
      return {
        success: false,
        generationMode: 'enhanced_baseline',
        qualityScore: 0,
        processingTime,
        fallbackReason: `Enhanced baseline failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        warnings: [],
        log: failureLog
      }
    }
  }
  
  // 🆘 BASIC FALLBACK GENERATION
  
  private async attemptBasicFallbackGeneration(
    request: ProductionGenerationRequest,
    sessionId: string,
    episodeId: string,
    startTime: number
  ): Promise<ProductionGenerationResult> {
    try {
      // Create a basic but functional episode
      const basicEpisode = await this.generateBasicFallbackEpisode(
        request.storyBible,
        request.episodeNumber,
        request.previousChoice
      )
      
      const processingTime = Date.now() - startTime
      
      // Assess quality and log
      const log = await productionQualityMonitor.assessEpisodeQuality(
        basicEpisode,
        request.storyBible,
        sessionId,
        episodeId,
        processingTime
      )
      
      return {
        success: true,
        episode: basicEpisode,
        generationMode: 'basic_fallback',
        qualityScore: log.qualityScore,
        processingTime,
        fallbackReason: 'Used basic fallback due to comprehensive engine failures',
        warnings: [],
        log
      }
      
    } catch (error) {
      console.error('❌ Basic fallback generation failed:', error)
      const processingTime = Date.now() - startTime
      
      const failureLog = await productionQualityMonitor.assessEpisodeQuality(
        { title: 'Failed Episode', scenes: [] },
        request.storyBible,
        sessionId,
        episodeId,
        processingTime
      )
      
      return {
        success: false,
        generationMode: 'basic_fallback',
        qualityScore: 0,
        processingTime,
        fallbackReason: `Basic fallback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        warnings: [],
        log: failureLog
      }
    }
  }
  
  // 🔧 HELPER GENERATION METHODS
  
  private async generateEpisodeDraft(storyBible: any, episodeNumber: number, previousChoice?: string): Promise<any> {
    const draftPrompt = `Create a narrative blueprint for Episode ${episodeNumber}:

STORY BIBLE: ${JSON.stringify(storyBible, null, 2)}
${previousChoice ? `PREVIOUS CHOICE: ${previousChoice}` : ''}

Focus on creating a strong narrative foundation:
1. Episode title and premise
2. Key story beats and emotional arc
3. Character moments and growth
4. Central conflict and resolution approach
5. How this episode advances the overall series

Return JSON:
{
  "title": "Episode Title",
  "premise": "What this episode is about",
  "storyBeats": ["Beat 1", "Beat 2", "Beat 3"],
  "characterFocus": "Which characters are central",
  "conflict": "Main conflict/tension",
  "emotionalArc": "Character emotional journey",
  "seriesProgression": "How this advances the series"
}`
    
    try {
      const result = await generateContent(draftPrompt, {
        systemPrompt: 'You are a narrative architect. Create clear, compelling episode foundations. Return ONLY valid JSON.',
        temperature: 0.9,
        maxTokens: 2000,
        model: 'gpt-4.1' as any
      })
      
      // Try to parse JSON, with fallback
      try {
        return JSON.parse(result)
      } catch {
        // Create fallback draft if JSON parsing fails
        return {
          title: `Episode ${episodeNumber}`,
          premise: 'Episode premise',
          storyBeats: ['Opening', 'Conflict', 'Resolution'],
          characterFocus: 'Main characters',
          conflict: 'Central conflict',
          emotionalArc: 'Character growth',
          seriesProgression: 'Series advancement'
        }
      }
    } catch (error) {
      console.warn('Episode draft generation failed, using fallback:', error)
      return {
        title: `Episode ${episodeNumber}`,
        premise: 'Episode premise',
        storyBeats: ['Opening', 'Conflict', 'Resolution'],
        characterFocus: 'Main characters',
        conflict: 'Central conflict',
        emotionalArc: 'Character growth',
        seriesProgression: 'Series advancement'
      }
    }
  }
  
  private async generateFinalEpisodeWithEngines(
    draft: any,
    storyBible: any,
    episodeNumber: number,
    previousChoice?: string,
    engineNotes?: ComprehensiveEngineNotes
  ): Promise<any> {
    // This would use the Phase 3 comprehensive engine integration
    // For now, simulate enhanced generation
    
    const prompt = `Create Episode ${episodeNumber} of "${storyBible.seriesTitle}" using the comprehensive engine enhancement system.

BASE DRAFT: ${JSON.stringify(draft, null, 2)}

COMPREHENSIVE ENGINE ENHANCEMENTS:
${engineNotes ? this.formatEngineNotes(engineNotes) : 'No engine enhancements available.'}

STORY CONTEXT: ${this.buildCompleteStoryContext(storyBible)}

Create a cinematic-quality 5-minute episode with:
- Rich character development and dialogue
- Sophisticated narrative structure
- Immersive world-building
- Genre-appropriate elements
- Professional polish

Return valid JSON with: title, synopsis, scenes, branchingOptions, episodeRundown`
    
    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a master cinematic storyteller creating premium 5-minute episodes. Return valid JSON only.',
        temperature: 0.9,
        maxTokens: 8000,
        model: 'gpt-4.1' as any
      })
      
      return this.parseEpisodeJSON(result, episodeNumber)
    } catch (error) {
      console.error('Final episode generation failed:', error)
      throw error
    }
  }
  
  private async generateEnhancedBaselineEpisode(
    draft: any,
    storyBible: any,
    episodeNumber: number,
    previousChoice?: string
  ): Promise<any> {
    const prompt = `Create Episode ${episodeNumber} of "${storyBible.seriesTitle}" with enhanced quality.

BASE DRAFT: ${JSON.stringify(draft, null, 2)}

COMPLETE STORY CONTEXT: ${this.buildCompleteStoryContext(storyBible)}
${previousChoice ? `PREVIOUS CHOICE: ${previousChoice}` : ''}

Create a high-quality 5-minute episode with:
- Character-driven narrative
- Engaging dialogue
- Clear structure
- Emotional resonance
- Genre-appropriate tone

Return valid JSON with: title, synopsis, scenes, branchingOptions, episodeRundown`
    
    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an experienced TV writer creating engaging 5-minute episodes. Return valid JSON only.',
        temperature: 0.85,
        maxTokens: 6000,
        model: 'gpt-4.1' as any
      })
      
      return this.parseEpisodeJSON(result, episodeNumber)
    } catch (error) {
      console.error('Enhanced baseline generation failed:', error)
      throw error
    }
  }
  
  private async generateBasicFallbackEpisode(
    storyBible: any,
    episodeNumber: number,
    previousChoice?: string
  ): Promise<any> {
    const prompt = `Create Episode ${episodeNumber} of "${storyBible.seriesTitle}".

SERIES INFO:
- Title: ${storyBible.seriesTitle}
- Premise: ${storyBible.premise}
- Genre: ${storyBible.genre}
- Main Characters: ${storyBible.mainCharacters?.map((c: any) => c.name).join(', ')}

${previousChoice ? `Previous Choice: ${previousChoice}` : ''}

Create a basic but functional 5-minute episode.

Return JSON: {"title": "Title", "synopsis": "Synopsis", "scenes": [{"sceneNumber": 1, "title": "Scene", "content": "Content"}], "branchingOptions": [{"id": 1, "text": "Choice", "description": "Desc", "isCanonical": true}], "episodeRundown": "Summary"}`
    
    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a TV writer creating basic episodes. Return valid JSON only.',
        temperature: 0.7,
        maxTokens: 3000,
        model: 'gpt-4.1' as any
      })
      
      return this.parseEpisodeJSON(result, episodeNumber)
    } catch (error) {
      console.error('Basic fallback generation failed:', error)
      throw error
    }
  }
  
  private createEmergencyFallbackEpisode(request: ProductionGenerationRequest): any {
    return {
      episodeNumber: request.episodeNumber,
      title: `Episode ${request.episodeNumber}`,
      synopsis: `An episode of ${request.storyBible.seriesTitle || 'the series'} continues the story.`,
      scenes: [
        {
          sceneNumber: 1,
          title: "The Story Continues",
          content: `The characters of ${request.storyBible.seriesTitle || 'the series'} find themselves in a new situation that tests their relationships and drives the story forward. Through dialogue and action, they navigate the challenges before them, making decisions that will impact their future.`
        }
      ],
      branchingOptions: [
        {
          id: 1,
          text: "Continue with the current approach",
          description: "The characters proceed with their current plan",
          isCanonical: true
        },
        {
          id: 2,
          text: "Try a different strategy",
          description: "The characters decide to change their approach",
          isCanonical: false
        },
        {
          id: 3,
          text: "Seek help from others",
          description: "The characters reach out for assistance",
          isCanonical: false
        }
      ],
      episodeRundown: "This episode advances the story and provides meaningful choices for the audience."
    }
  }
  
  // 🔧 UTILITY METHODS
  
  private shouldUseComprehensiveEngines(request: ProductionGenerationRequest): boolean {
    // Check feature flags, user settings, system health, etc.
    const featureFlags = request.featureFlags || []
    return featureFlags.includes('comprehensive_engines') || featureFlags.includes('all_features')
  }
  
  private formatEngineNotes(notes: ComprehensiveEngineNotes): string {
    return `
🎭 NARRATIVE ARCHITECTURE:
• Fractal Narrative: ${notes.fractalNarrative}
• Episode Cohesion: ${notes.episodeCohesion}
• Conflict Architecture: ${notes.conflictArchitecture}
• Tension Escalation: ${notes.tensionEscalation}
• Pacing & Rhythm: ${notes.pacingRhythm}
• Five-Minute Canvas: ${notes.fiveMinuteCanvas}

🎪 CHARACTER & DIALOGUE:
• Strategic Dialogue: ${notes.strategicDialogue}
• Character Depth: ${notes.characterDepth}

🌍 WORLD & ENVIRONMENT:
• World Building: ${notes.worldBuilding}
• Living World: ${notes.livingWorld}
• Theme Integration: ${notes.themeIntegration}

🎬 FORMAT & ENGAGEMENT:
• Interactive Choices: ${notes.interactiveChoice}
• Serialized Continuity: ${notes.serializedContinuity}
• Visual Storyboard: ${notes.storyboard}
• Language & Style: ${notes.languageStyle}

🎭 GENRE-SPECIFIC:
${notes.comedyTiming ? `• Comedy Timing: ${notes.comedyTiming}` : ''}
${notes.horrorAtmosphere ? `• Horror Atmosphere: ${notes.horrorAtmosphere}` : ''}
${notes.romanceChemistry ? `• Romance Chemistry: ${notes.romanceChemistry}` : ''}
${notes.mysteryConstruction ? `• Mystery Construction: ${notes.mysteryConstruction}` : ''}
`
  }
  
  private buildCompleteStoryContext(storyBible: any): string {
    // Use the Phase 1 complete context function
    const contextParts = []
    
    if (storyBible.premise) contextParts.push(`PREMISE: ${storyBible.premise}`)
    if (storyBible.themes) contextParts.push(`THEMES: ${storyBible.themes.join(', ')}`)
    if (storyBible.setting) contextParts.push(`SETTING: ${storyBible.setting}`)
    
    if (storyBible.mainCharacters) {
      const characters = storyBible.mainCharacters.map((char: any, i: number) => 
        `${i + 1}. ${char.name} (${char.archetype || char.role || 'Character'}): ${char.description || 'Character in the story'}`
      ).join('\n')
      contextParts.push(`CHARACTERS:\n${characters}`)
    }
    
    return contextParts.join('\n\n')
  }
  
  private parseEpisodeJSON(content: string, episodeNumber: number): any {
    try {
      // Try direct parsing first
      return JSON.parse(content)
    } catch {
      // Try extracting JSON from markdown
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1])
        } catch {
          // Fallback to basic structure
        }
      }
      
      // Return basic fallback structure
      return {
        episodeNumber,
        title: `Episode ${episodeNumber}`,
        synopsis: "An episode of the series continues the story.",
        scenes: [
          {
            sceneNumber: 1,
            title: "Scene 1",
            content: "The story continues with character development and plot progression."
          }
        ],
        branchingOptions: [
          { id: 1, text: "Continue the story", description: "Proceed with the narrative", isCanonical: true },
          { id: 2, text: "Change direction", description: "Take a different approach", isCanonical: false },
          { id: 3, text: "Explore relationships", description: "Focus on character relationships", isCanonical: false }
        ],
        episodeRundown: "This episode advances the narrative and provides meaningful choices."
      }
    }
  }
}

// Create singleton instance for global use
export const productionEpisodeGenerator = new ProductionEpisodeGenerator()

export default ProductionEpisodeGenerator
