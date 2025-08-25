/**
 * Short-Form Format Engine - 5-Minute Episode Optimization Specialist
 * 
 * This engine optimizes content for short-form drama format (5 minutes, 16:9).
 * It ensures every second counts, maximizing engagement and narrative impact
 * within strict time constraints while maintaining cinematic quality.
 * 
 * Core Capabilities:
 * - 5-minute episode structure optimization
 * - 16:9 visual format optimization
 * - Mobile-first viewing experience enhancement
 * - Content density and pacing optimization
 * - Platform-specific adaptation
 * - Attention span psychology integration
 * 
 * Format Requirements: 5 minutes per episode, 16:9 aspect ratio, mobile-optimized
 */

import { generateContent } from './azure-openai';
import { FiveMinuteCanvasEngineV2, type FiveMinuteCanvasEngineRecommendation } from './five-minute-canvas-engine-v2';

// ===== CORE INTERFACES =====

export interface ShortFormBlueprint {
  projectId: string;
  formatMetadata: FormatMetadata;
  episodeStructure: OptimizedEpisodeStructure;
  visualOptimization: VisualOptimization;
  contentDensity: ContentDensityAnalysis;
  engagementStrategy: EngagementStrategy;
  platformAdaptation: PlatformAdaptation;
  qualityMetrics: FormatQualityMetrics;
}

export interface FormatMetadata {
  episodeDuration: number; // 5 minutes = 300 seconds
  aspectRatio: '16:9';
  targetPlatform: string[];
  viewingContext: 'mobile-first' | 'multi-device';
  contentType: 'drama' | 'comedy' | 'thriller' | 'romance';
  targetDemographic: string;
  bingeOptimized: boolean;
}

export interface OptimizedEpisodeStructure {
  hookTiming: HookTiming; // 0-15 seconds critical
  developmentBeats: StoryBeat[];
  climaxTiming: ClimaxTiming; // Around 3:30-4:00
  resolutionTiming: ResolutionTiming;
  cliffhangerPlacement: CliffhangerPlacement;
  totalBeats: number;
  pacingProfile: PacingProfile;
}

export interface VisualOptimization {
  compositionRules: CompositionRule[];
  framingOptimization: FramingOptimization;
  textReadability: TextReadability;
  actionFraming: ActionFraming;
  closeUpBalance: number; // Percentage of close-ups vs wide shots
  mobileFriendlyElements: MobileFriendlyElement[];
}

export interface ContentDensityAnalysis {
  informationDensity: number; // Information per minute
  dialogueEfficiency: DialogueEfficiency;
  visualStorytellingRatio: number; // Visual vs expository content
  characterDevelopmentRate: number;
  plotAdvancementRate: number;
  cognitiveLoadScore: number; // 0-100, optimal around 70-80
}

export interface EngagementStrategy {
  attentionCaptureElements: AttentionElement[];
  retentionTechniques: RetentionTechnique[];
  emotionalBeats: EmotionalBeat[];
  curiosityGaps: CuriosityGap[];
  payoffDistribution: PayoffDistribution;
}

// ===== SUPPORTING INTERFACES =====

export interface HookTiming {
  openingSeconds: number; // Must be ≤ 15
  hookType: 'visual' | 'dialogue' | 'action' | 'mystery' | 'emotional';
  engagementScore: number; // Predicted retention score
  thumbStopPotential: number; // Social media scroll-stopping power
}

export interface StoryBeat {
  timestamp: number; // Seconds from start
  beatType: 'setup' | 'inciting' | 'development' | 'complication' | 'climax' | 'resolution';
  duration: number; // Seconds
  intensity: number; // 1-10 emotional/tension level
  purpose: string;
  essentialLevel: 'critical' | 'important' | 'optional';
}

export interface CompositionRule {
  rule: string;
  application: string;
  mobileOptimization: string;
  effectiveness: number; // 0-100
}

export interface DialogueEfficiency {
  wordsPerMinute: number;
  essentialDialogueRatio: number; // Essential vs filler dialogue
  subTextDensity: number;
  naturalnesScore: number; // How natural it sounds when compressed
  informationDeliveryRate: number;
}

export interface AttentionElement {
  type: 'visual' | 'audio' | 'narrative' | 'character';
  placement: number; // Seconds from start
  intensity: number; // 1-10
  duration: number;
  effectiveness: number; // Predicted engagement score
}

// ===== MAIN ENGINE CLASS =====

export class ShortFormFormatEngine {
  
  /**
   * 5-MINUTE CANVAS V2.0 ENHANCED: Generate strategic framework for 16:9 episodic content
   */
  static async generateEnhanced5MinuteCanvas(
    context: {
      projectTitle: string;
      genre: string;
      targetAudience: string;
      platform: string;
      episodeCount: number;
      productionBudget: string;
      releaseStrategy: string;
    },
    requirements: {
      attentionStrategy: 'hook-focused' | 'binge-designed' | 'viral-optimized' | 'retention-maximized';
      compressionLevel: 'moderate' | 'aggressive' | 'extreme' | 'radical';
      visualApproach: 'mobile-first' | 'cross-platform' | 'cinematic' | 'native';
      productionMethod: 'agile' | 'traditional' | 'minimal' | 'optimized';
      distributionFocus: 'single-platform' | 'multi-platform' | 'discovery-driven' | 'algorithm-optimized';
    },
    options: {
      dopaminePacing?: boolean;
      formatFrictionMinimization?: boolean;
      narrativeCompression?: boolean;
      mobileOptimization?: boolean;
      crossPlatformStrategy?: boolean;
    } = {}
  ): Promise<{ blueprint: ShortFormBlueprint; canvasFramework: FiveMinuteCanvasEngineRecommendation }> {
    try {
      console.log(`🎬 5-MINUTE CANVAS ENGINE V2.0: Creating strategic 16:9 episodic framework...`);
      
      // Generate 5-Minute Canvas Framework V2.0
      const canvasFramework = await FiveMinuteCanvasEngineV2.generateFiveMinuteCanvasRecommendation(
        context,
        requirements,
        options
      );
      
      // Convert to traditional short-form inputs
      const legacyInputs = this.convertCanvasToLegacyInputs(context, requirements, canvasFramework);
      
      // Generate enhanced short-form blueprint
      const blueprint = await this.generateShortFormBlueprint(
        legacyInputs.narrativeContent,
        legacyInputs.targetPlatform,
        legacyInputs.contentType
      );
      
      // Apply 5-Minute Canvas V2.0 enhancements
      const enhancedBlueprint = this.applyCanvasFrameworkToBlueprint(
        blueprint,
        canvasFramework
      );
      
      console.log(`✅ 5-MINUTE CANVAS ENGINE V2.0: Generated strategic framework with ${canvasFramework.primaryRecommendation.confidence * 100}% confidence`);
      
      return {
        blueprint: enhancedBlueprint,
        canvasFramework
      };
    } catch (error) {
      console.error('❌ 5-Minute Canvas Engine V2.0 failed:', error);
      throw error;
    }
  }

  /**
   * Generate optimized short-form blueprint for 5-minute episodes
   */
  static async generateShortFormBlueprint(
    narrativeContent: any,
    targetPlatform: string[] = ['streaming', 'social'],
    contentType: string = 'drama'
  ): Promise<ShortFormBlueprint> {
    try {
      console.log('🎬 Generating 5-minute episode optimization...');
      
      // AI-powered format optimization
      const formatOptimization = await this.optimizeForShortFormAI(narrativeContent, targetPlatform, contentType);
      
      // Structure optimization
      const episodeStructure = await this.optimizeEpisodeStructureAI(narrativeContent, formatOptimization);
      
      // Visual optimization for 16:9 mobile viewing
      const visualOptimization = await this.optimizeVisualFormatAI(narrativeContent, episodeStructure);
      
      // Content density analysis and optimization
      const contentDensity = await this.analyzeContentDensityAI(narrativeContent, episodeStructure);
      
      // Engagement strategy development
      const engagementStrategy = await this.developEngagementStrategyAI(narrativeContent, episodeStructure);
      
      return {
        projectId: narrativeContent.projectId || 'short-form-project',
        formatMetadata: {
          episodeDuration: 300, // 5 minutes
          aspectRatio: '16:9',
          targetPlatform,
          viewingContext: 'mobile-first',
          contentType: contentType as any,
          targetDemographic: 'mobile-first viewers',
          'binge-optimized': true
        },
        episodeStructure,
        visualOptimization,
        contentDensity,
        engagementStrategy,
        platformAdaptation: await this.adaptForPlatformsAI(targetPlatform, episodeStructure),
        qualityMetrics: await this.calculateQualityMetricsAI(episodeStructure, contentDensity, engagementStrategy)
      };
      
    } catch (error) {
      console.error('Short-form format optimization failed:', error);
      return this.generateShortFormBlueprintFallback(narrativeContent, targetPlatform, contentType);
    }
  }
  
  /**
   * AI-powered format optimization
   */
  private static async optimizeForShortFormAI(narrativeContent: any, targetPlatform: string[], contentType: string): Promise<any> {
    const prompt = `Optimize this narrative content for 5-minute episodes in 16:9 format:

CONTENT: ${JSON.stringify(narrativeContent, null, 2)}
PLATFORM: ${targetPlatform.join(', ')}
TYPE: ${contentType}

Requirements:
- 5 minutes maximum per episode
- 16:9 aspect ratio (horizontal)
- Mobile-first viewing optimization
- Maximum engagement and retention
- Binge-watching optimization

Analyze:
1. Content compression opportunities
2. Essential vs non-essential elements
3. Pacing optimization for short attention spans
4. Hook placement for immediate engagement
5. Visual storytelling over exposition

Return JSON with optimization recommendations.`;

    try {
      const result = await generateContent(prompt, {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 2000
      });
      
      return typeof result === 'string' ? JSON.parse(result) : result;
    } catch (error) {
      return { optimizationLevel: 'basic', recommendations: [] };
    }
  }
  
  /**
   * Episode structure optimization for 5-minute format
   */
  private static async optimizeEpisodeStructureAI(narrativeContent: any, formatOptimization: any): Promise<OptimizedEpisodeStructure> {
    const prompt = `Create optimal episode structure for 5-minute drama episodes:

CONTENT: ${JSON.stringify(narrativeContent, null, 2)}
OPTIMIZATION: ${JSON.stringify(formatOptimization, null, 2)}

5-Minute Structure Requirements:
- 0-15 seconds: Hook (critical engagement window)
- 15-180 seconds: Development and escalation
- 180-240 seconds: Climax and peak tension
- 240-280 seconds: Resolution/revelation
- 280-300 seconds: Cliffhanger/next episode setup

Return JSON with precise timing, beat placement, and pacing profile.`;

    try {
      const result = await generateContent(prompt, {
        model: 'gpt-4o',
        temperature: 0.6,
        maxTokens: 1500
      });
      
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      
      return {
        hookTiming: {
          openingSeconds: 15,
          hookType: parsed.hookType || 'emotional',
          engagementScore: parsed.engagementScore || 85,
          thumbStopPotential: parsed.thumbStopPotential || 80
        },
        developmentBeats: parsed.developmentBeats || [],
        climaxTiming: parsed.climaxTiming || { startTime: 210, peakTime: 240 },
        resolutionTiming: parsed.resolutionTiming || { startTime: 240, endTime: 280 },
        cliffhangerPlacement: parsed.cliffhangerPlacement || { startTime: 280, intensity: 8 },
        totalBeats: parsed.totalBeats || 8,
        pacingProfile: parsed.pacingProfile || { type: 'accelerating', intensity: 'high' }
      };
      
    } catch (error) {
      return this.getDefaultEpisodeStructure();
    }
  }
  
  /**
   * Visual optimization for 16:9 mobile viewing
   */
  private static async optimizeVisualFormatAI(narrativeContent: any, episodeStructure: OptimizedEpisodeStructure): Promise<VisualOptimization> {
    const prompt = `Optimize visual elements for 16:9 mobile viewing:

CONTENT: ${JSON.stringify(narrativeContent, null, 2)}
STRUCTURE: ${JSON.stringify(episodeStructure, null, 2)}

16:9 Mobile Optimization:
- Horizontal composition for landscape viewing
- Text readability on small screens
- Close-up vs wide shot balance
- Action framing for mobile consumption
- Visual clarity and impact

Return JSON with specific visual optimization guidelines.`;

    try {
      const result = await generateContent(prompt, {
        model: 'gpt-4o',
        temperature: 0.5,
        maxTokens: 1000
      });
      
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      
      return {
        compositionRules: parsed.compositionRules || [],
        framingOptimization: parsed.framingOptimization || {},
        textReadability: parsed.textReadability || {},
        actionFraming: parsed.actionFraming || {},
        closeUpBalance: parsed.closeUpBalance || 60, // 60% close-ups for mobile
        mobileFriendlyElements: parsed.mobileFriendlyElements || []
      };
      
    } catch (error) {
      return this.getDefaultVisualOptimization();
    }
  }
  
  /**
   * Fallback blueprint generation
   */
  private static generateShortFormBlueprintFallback(narrativeContent: any, targetPlatform: string[], contentType: string): ShortFormBlueprint {
    return {
      projectId: narrativeContent.projectId || 'short-form-project',
      formatMetadata: {
        episodeDuration: 300,
        aspectRatio: '16:9',
        targetPlatform,
        viewingContext: 'mobile-first',
        contentType: contentType as any,
        targetDemographic: 'mobile-first viewers',
        'binge-optimized': true
      },
      episodeStructure: this.getDefaultEpisodeStructure(),
      visualOptimization: this.getDefaultVisualOptimization(),
      contentDensity: this.getDefaultContentDensity(),
      engagementStrategy: this.getDefaultEngagementStrategy(),
      platformAdaptation: { platforms: targetPlatform, adaptations: [] },
      qualityMetrics: { overallScore: 75, areas: [] }
    };
  }
  
  // Default structure helpers
  private static getDefaultEpisodeStructure(): OptimizedEpisodeStructure {
    return {
      hookTiming: {
        openingSeconds: 15,
        hookType: 'emotional',
        engagementScore: 80,
        thumbStopPotential: 75
      },
      developmentBeats: [],
      climaxTiming: { startTime: 210, peakTime: 240 },
      resolutionTiming: { startTime: 240, endTime: 280 },
      cliffhangerPlacement: { startTime: 280, intensity: 8 },
      totalBeats: 8,
      pacingProfile: { type: 'accelerating', intensity: 'high' }
    };
  }
  
  private static getDefaultVisualOptimization(): VisualOptimization {
    return {
      compositionRules: [],
      framingOptimization: {},
      textReadability: {},
      actionFraming: {},
      closeUpBalance: 60,
      mobileFriendlyElements: []
    };
  }
  
  private static getDefaultContentDensity(): ContentDensityAnalysis {
    return {
      informationDensity: 80,
      dialogueEfficiency: { wordsPerMinute: 180, essentialDialogueRatio: 0.85, subTextDensity: 0.7, naturalnesScore: 80, informationDeliveryRate: 90 },
      visualStorytellingRatio: 0.7,
      characterDevelopmentRate: 85,
      plotAdvancementRate: 90,
      cognitiveLoadScore: 75
    };
  }
  
  private static getDefaultEngagementStrategy(): EngagementStrategy {
    return {
      attentionCaptureElements: [],
      retentionTechniques: [],
      emotionalBeats: [],
      curiosityGaps: [],
      payoffDistribution: {}
    };
  }
  
  // Additional helper methods would be implemented here...
  private static async analyzeContentDensityAI(narrativeContent: any, episodeStructure: OptimizedEpisodeStructure): Promise<ContentDensityAnalysis> {
    // Implementation would analyze content density for 5-minute format
    return this.getDefaultContentDensity();
  }
  
  private static async developEngagementStrategyAI(narrativeContent: any, episodeStructure: OptimizedEpisodeStructure): Promise<EngagementStrategy> {
    // Implementation would develop engagement strategy
    return this.getDefaultEngagementStrategy();
  }
  
  private static async adaptForPlatformsAI(targetPlatform: string[], episodeStructure: OptimizedEpisodeStructure): Promise<any> {
    // Implementation would adapt for specific platforms
    return { platforms: targetPlatform, adaptations: [] };
  }
  
  private static async calculateQualityMetricsAI(episodeStructure: OptimizedEpisodeStructure, contentDensity: ContentDensityAnalysis, engagementStrategy: EngagementStrategy): Promise<any> {
    // Implementation would calculate quality metrics
    return { overallScore: 85, areas: ['pacing', 'engagement', 'format-compliance'] };
  }

  /**
   * Helper method to convert 5-Minute Canvas V2.0 context to legacy inputs
   */
  private static convertCanvasToLegacyInputs(
    context: any,
    requirements: any,
    framework: FiveMinuteCanvasEngineRecommendation
  ): any {
    return {
      narrativeContent: {
        projectId: `canvas-${Date.now()}`,
        title: context.projectTitle,
        genre: context.genre,
        episodes: Array.from({ length: context.episodeCount }, (_, i) => ({
          id: `ep-${i + 1}`,
          title: `Episode ${i + 1}`,
          duration: 300, // 5 minutes
          structure: framework.primaryRecommendation.microStructure.fiveActFramework,
          compression: framework.primaryRecommendation.compressionMastery.structuralCompression
        })),
        targetAudience: context.targetAudience,
        productionBudget: context.productionBudget
      },
      targetPlatform: this.getPlatformArray(context.platform, requirements.distributionFocus),
      contentType: context.genre
    };
  }

  /**
   * Helper method to get platform array based on distribution strategy
   */
  private static getPlatformArray(primaryPlatform: string, distributionFocus: string): string[] {
    if (distributionFocus === 'multi-platform') {
      return ['youtube', 'instagram', 'tiktok', 'streaming'];
    } else if (distributionFocus === 'discovery-driven') {
      return ['youtube', 'tiktok', 'instagram'];
    }
    
    return [primaryPlatform];
  }

  /**
   * Helper method to apply 5-Minute Canvas V2.0 framework to blueprint
   */
  private static applyCanvasFrameworkToBlueprint(
    blueprint: ShortFormBlueprint,
    framework: FiveMinuteCanvasEngineRecommendation
  ): ShortFormBlueprint {
    const enhancedBlueprint = { ...blueprint };
    
    // Add 5-Minute Canvas V2.0 framework metadata
    (enhancedBlueprint as any).canvasFrameworkV2 = {
      frameworkVersion: 'FiveMinuteCanvasEngineV2',
      confidence: framework.primaryRecommendation.confidence,
      
      // Strategic Foundation
      psychologicalFoundation: {
        attentionSpanReality: framework.primaryRecommendation.psychologicalFoundation.attentionSpanReality,
        dopaminePacing: framework.primaryRecommendation.psychologicalFoundation.dopaminePacing,
        formatFriction: framework.primaryRecommendation.psychologicalFoundation.formatFriction
      },
      
      // Narrative Compression
      compressionMastery: {
        structuralCompression: framework.primaryRecommendation.compressionMastery.structuralCompression,
        characterCompression: framework.primaryRecommendation.compressionMastery.characterCompression,
        dialogueCompression: framework.primaryRecommendation.compressionMastery.dialogueCompression
      },
      
      // 300-Second Structure
      microStructure: {
        fiveActFramework: framework.primaryRecommendation.microStructure.fiveActFramework,
        beatSheetTimestamps: framework.primaryRecommendation.microStructure.beatSheetTimestamps,
        pacingInformation: framework.primaryRecommendation.microStructure.pacingInformation
      },
      
      // Mobile Optimization
      visualStrategy: {
        compositionalRules: framework.primaryRecommendation.mobileOptimization.compositionalRules,
        visualDensity: framework.primaryRecommendation.mobileOptimization.visualDensity,
        textDesign: framework.primaryRecommendation.mobileOptimization.textDesign
      },
      
      // Genre Adaptation
      genreFrameworks: framework.primaryRecommendation.genreFrameworks,
      
      // Production Strategy
      productionExecution: framework.primaryRecommendation.productionExecution,
      
      // Platform Ecosystem
      distributionStrategy: framework.primaryRecommendation.distributionStrategy,
      
      // Strategic Guidance
      canvasStrategy: framework.canvasStrategy,
      implementationGuidance: framework.implementationGuidance
    };
    
    // Enhance episode structure with Canvas V2.0 micro-structure
    if (enhancedBlueprint.episodeStructure) {
      (enhancedBlueprint.episodeStructure as any).microStructureEnhancement = {
        fiveActFramework: framework.primaryRecommendation.microStructure.fiveActFramework,
        dopaminePacing: framework.primaryRecommendation.psychologicalFoundation.dopaminePacing,
        compressionLevel: framework.primaryRecommendation.compressionMastery.structuralCompression
      };
    }
    
    // Enhance platform optimization with Canvas V2.0 mobile strategy
    if (enhancedBlueprint.platformOptimization) {
      enhancedBlueprint.platformOptimization.forEach((optimization: any) => {
        optimization.canvasEnhancement = {
          formatFriction: framework.primaryRecommendation.psychologicalFoundation.formatFriction,
          compositionalRules: framework.primaryRecommendation.mobileOptimization.compositionalRules,
          crossPlatformStrategy: framework.primaryRecommendation.distributionStrategy.crossPlatformOptimization
        };
      });
    }
    
    // Enhance attention optimization with Canvas V2.0 psychology
    if (enhancedBlueprint.attentionOptimization) {
      (enhancedBlueprint.attentionOptimization as any).psychologicalFoundation = {
        attentionSpanReality: framework.primaryRecommendation.psychologicalFoundation.attentionSpanReality,
        retentionStrategy: framework.primaryRecommendation.distributionStrategy.audienceRetention,
        engagementOptimization: framework.primaryRecommendation.microStructure.pacingInformation
      };
    }
    
    // Enhance visual guidelines with Canvas V2.0 mobile optimization
    if (enhancedBlueprint.visualGuidelines) {
      (enhancedBlueprint.visualGuidelines as any).mobileOptimization = {
        compositionalRules: framework.primaryRecommendation.mobileOptimization.compositionalRules,
        visualDensity: framework.primaryRecommendation.mobileOptimization.visualDensity,
        textDesign: framework.primaryRecommendation.mobileOptimization.textDesign
      };
    }
    
    return enhancedBlueprint;
  }
}


