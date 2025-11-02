import { generateContent } from './azure-openai';

// Missing type definitions (temporary compatibility types)
export type TensionEngineRecommendation = any;
export type SerializedContinuityEngineRecommendation = any;
export type EngagementEngineRecommendation = any;
export type TensionEscalationEngineV2 = any;
export type SerializedContinuityEngineV2 = any; 
export type EngagementEngineV2 = any;

/**
 * Tension Escalation Engine - AI-Powered Suspense and Emotional Peak Mastery
 * 
 * The Tension Escalation Engine represents the pinnacle of dramatic tension control and emotional manipulation.
 * This engine uses advanced AI to analyze tension patterns, create escalation architectures, and manage
 * emotional peaks with surgical precision. It ensures stories maintain optimal engagement through masterful
 * suspense building, release patterns, and emotional orchestration.
 * 
 * Core Capabilities:
 * - AI-powered tension analysis and mapping
 * - Intelligent escalation pattern design and timing
 * - Emotional peak orchestration and management
 * - Suspense building with psychological precision
 * - Strategic tension release and recovery patterns
 * - Genre-specific tension requirements adaptation
 * - Audience engagement optimization through tension control
 * 
 * Based on dramatic theory, psychology of suspense, and emotional engagement principles.
 */

// ===== CORE INTERFACES =====

export interface TensionBlueprint {
  storyContext: StoryContext;
  tensionArchitecture: TensionArchitecture;
  escalationPatterns: EscalationPattern[];
  emotionalPeaks: EmotionalPeak[];
  suspenseElements: SuspenseElement[];
  releasePatterns: ReleasePattern[];
  genreAdaptation: GenreTensionAdaptation;
  audienceOptimization: AudienceTensionOptimization;
  qualityMetrics: TensionQualityMetrics;
}

export interface TensionAnalysis {
  scene: any;
  currentTensionLevel: number; // 0-100
  tensionType: TensionType;
  escalationPotential: number; // 0-100
  emotionalState: EmotionalState;
  suspenseFactors: SuspenseFactor[];
  releaseOpportunities: ReleaseOpportunity[];
  audienceEngagement: number; // 0-100
}

export interface TensionApplication {
  scene: any;
  tensionStrategy: TensionStrategy;
  escalationTechniques: EscalationTechnique[];
  emotionalManipulation: EmotionalManipulation;
  suspenseBuilding: SuspenseBuilding;
  releaseManagement: ReleaseManagement;
  audienceImpact: TensionAudienceImpact;
  effectivenessScore: number; // 0-100
}

export interface TensionArchitecture {
  overallStructure: TensionStructure;
  actBreakdown: ActTensionMap[];
  climaxDesign: ClimaxDesign;
  tensionCurve: TensionCurve;
  emotionalJourney: EmotionalJourney;
  suspenseHierarchy: SuspenseHierarchy;
  releaseStrategy: ReleaseStrategy;
}

export interface EscalationPattern {
  id: string;
  name: string;
  type: EscalationType;
  description: string;
  tensionIncrease: number; // percentage increase
  duration: EscalationDuration;
  triggers: EscalationTrigger[];
  techniques: EscalationTechnique[];
  emotionalImpact: EmotionalImpact;
  audienceEffect: EscalationAudienceEffect;
  genreCompatibility: string[];
}

export interface EmotionalPeak {
  id: string;
  name: string;
  emotion: EmotionType;
  intensity: number; // 0-100
  buildupDuration: PeakDuration;
  peakMoment: PeakMoment;
  falloffPattern: FalloffPattern;
  recoveryTime: RecoveryTime;
  audienceImpact: EmotionalAudienceImpact;
  narrativeFunction: PeakNarrativeFunction;
}

export interface SuspenseElement {
  id: string;
  name: string;
  category: SuspenseCategory;
  technique: SuspenseTechnique;
  psychologyBasis: PsychologyBasis;
  buildupMethod: BuildupMethod;
  payoffStrategy: PayoffStrategy;
  audienceManipulation: AudienceManipulation;
  effectivenessRating: number; // 0-100
}

export interface ReleasePattern {
  id: string;
  name: string;
  type: ReleaseType;
  timing: ReleaseTiming;
  method: ReleaseMethod;
  recoveryPhase: RecoveryPhase;
  audienceRecalibration: AudienceRecalibration;
  nextTensionSetup: NextTensionSetup;
}

// ===== SUPPORTING INTERFACES =====

export type TensionType = 
  | 'dramatic-irony' 
  | 'situational-suspense' 
  | 'character-conflict' 
  | 'time-pressure' 
  | 'mystery-revelation' 
  | 'moral-dilemma' 
  | 'physical-danger' 
  | 'emotional-stakes' 
  | 'psychological-tension' 
  | 'anticipation-anxiety';

export type EscalationType = 
  | 'linear-buildup' 
  | 'exponential-acceleration' 
  | 'stepped-escalation' 
  | 'cyclical-intensification' 
  | 'sudden-spike' 
  | 'gradual-revelation' 
  | 'layered-complexity' 
  | 'countdown-pressure';

export type EmotionType = 
  | 'fear' 
  | 'anxiety' 
  | 'excitement' 
  | 'dread' 
  | 'anticipation' 
  | 'panic' 
  | 'surprise' 
  | 'relief' 
  | 'shock' 
  | 'desperation';

export type SuspenseCategory = 
  | 'information-withholding' 
  | 'time-constraint' 
  | 'character-jeopardy' 
  | 'outcome-uncertainty' 
  | 'revelation-delay' 
  | 'false-security' 
  | 'escalating-stakes' 
  | 'moral-complexity';

export type ReleaseType = 
  | 'partial-relief' 
  | 'false-resolution' 
  | 'temporary-respite' 
  | 'emotional-catharsis' 
  | 'tension-redirect' 
  | 'comedic-break' 
  | 'character-moment' 
  | 'preparation-phase';

export interface EmotionalState {
  primary: EmotionType;
  intensity: number; // 0-100
  stability: number; // 0-100
  trajectory: 'rising' | 'falling' | 'stable' | 'volatile';
}

export interface SuspenseFactor {
  factor: string;
  contribution: number; // 0-100
  manipulability: number; // 0-100
  audienceAwareness: number; // 0-100
}

export interface ReleaseOpportunity {
  timing: string;
  type: ReleaseType;
  appropriateness: number; // 0-100
  impact: string;
}

export interface TensionStrategy {
  approach: string;
  techniques: string[];
  timing: string;
  intensity: number; // 0-100
}

export interface EscalationTechnique {
  name: string;
  method: string;
  psychologicalBasis: string;
  effectiveness: number; // 0-100
}

export interface EmotionalManipulation {
  targetEmotion: EmotionType;
  methods: string[];
  intensity: number; // 0-100
  duration: string;
}

export interface SuspenseBuilding {
  techniques: string[];
  timing: string[];
  payoff: string;
  effectiveness: number; // 0-100
}

export interface ReleaseManagement {
  type: ReleaseType;
  timing: string;
  recovery: string;
  nextBuildup: string;
}

export interface TensionAudienceImpact {
  engagement: number; // 0-100
  emotional: string[];
  physical: string[];
  cognitive: string[];
}

// Basic supporting interfaces (simplified for implementation)
export interface StoryContext { genre: string; audience: string; themes: string[]; structure: any; }
export interface TensionStructure { pattern: string; peaks: number; distribution: string; }
export interface ActTensionMap { act: number; tensionLevel: number; pattern: string; }
export interface ClimaxDesign { type: string; intensity: number; techniques: string[]; }
export interface TensionCurve { points: { time: number; tension: number }[]; shape: string; }
export interface EmotionalJourney { stages: { emotion: EmotionType; duration: string }[]; }
export interface SuspenseHierarchy { levels: { priority: number; elements: string[] }[]; }
export interface ReleaseStrategy { pattern: string; frequency: string; methods: string[]; }
export interface EscalationDuration { build: string; peak: string; sustain: string; }
export interface EscalationTrigger { event: string; condition: string; timing: string; }
export interface EmotionalImpact { primary: EmotionType; secondary: EmotionType[]; intensity: number; }
export interface EscalationAudienceEffect { engagement: number; retention: number; satisfaction: number; }
export interface PeakDuration { buildup: string; peak: string; falloff: string; }
export interface PeakMoment { timing: string; triggers: string[]; execution: string; }
export interface FalloffPattern { type: string; speed: string; destination: number; }
export interface RecoveryTime { duration: string; method: string; newBaseline: number; }
export interface EmotionalAudienceImpact { immediate: string[]; lasting: string[]; discussion: string[]; }
export interface PeakNarrativeFunction { purpose: string; plotAdvancement: number; characterImpact: number; }
export interface SuspenseTechnique { name: string; method: string; effectiveness: number; }
export interface PsychologyBasis { principle: string; mechanism: string; research: string; }
export interface BuildupMethod { technique: string; duration: string; intensity: string; }
export interface PayoffStrategy { timing: string; method: string; satisfaction: number; }
export interface AudienceManipulation { techniques: string[]; ethics: string; effectiveness: number; }
export interface ReleaseTiming { moment: string; duration: string; context: string; }
export interface ReleaseMethod { technique: string; intensity: string; audience: string; }
export interface RecoveryPhase { duration: string; activities: string[]; newBaseline: number; }
export interface AudienceRecalibration { method: string; time: string; effectiveness: number; }
export interface NextTensionSetup { timing: string; type: TensionType; intensity: number; }
export interface GenreTensionAdaptation { requirements: string[]; adaptations: string[]; innovations: string[]; }
export interface AudienceTensionOptimization { demographics: string[]; preferences: string[]; strategies: string[]; }
export interface TensionQualityMetrics { 
  effectivenessScore: number; 
  audienceEngagement: number; 
  emotionalImpact: number; 
  suspenseQuality: number; 
  pacing: number; 
  overall: number; 
}

/**
 * Tension Escalation Engine - AI-Enhanced Suspense Mastery
 * 
 * This system revolutionizes dramatic tension control through intelligent analysis:
 * - Maps and analyzes tension patterns with surgical precision
 * - Creates escalation architectures for maximum emotional impact
 * - Manages emotional peaks and suspense with psychological expertise
 * - Optimizes audience engagement through strategic tension control
 */
export class TensionEscalationEngine {

  // ===== CORE TENSION GENERATION METHODS =====

  /**
   * V2.0 ENHANCED: Generate tension blueprint with comprehensive psychological framework
   */
  static async generateEnhancedTensionBlueprint(
    context: {
      projectTitle: string;
      genre: 'horror' | 'thriller' | 'drama' | 'comedy' | 'action' | 'mystery' | 'romance';
      medium: 'film' | 'television' | 'book' | 'game' | 'interactive';
      targetAudience: string;
      narrativeElements: string[];
      conflictTypes: string[];
      tensionGoals: string[];
      suspenseStyle: string;
    },
    requirements: {
      tensionObjectives: string[];
      suspenseIntensity: 'subtle' | 'moderate' | 'intense' | 'extreme';
      audienceEngagement: 'passive' | 'active' | 'participatory';
      genreFocus: boolean;
      psychologicalDepth: 'surface' | 'moderate' | 'deep';
      structuralComplexity: 'simple' | 'moderate' | 'complex';
    },
    options: {
      hitchcockApproach?: boolean;
      neuroscientificApproach?: boolean;
      genreSubversion?: boolean;
      interactiveElements?: boolean;
      serializedFormat?: boolean;
    } = {}
  ): Promise<{ blueprint: TensionBlueprint; tensionFramework: TensionEngineRecommendation }> {
    
    console.log(`⚡ TENSION ESCALATION ENGINE V2.0: Creating enhanced blueprint with comprehensive psychological framework...`);
    
    try {
      // Stage 1: Generate comprehensive tension framework
      const tensionFramework = await TensionEscalationEngineV2.generateTensionFramework(
        context,
        requirements,
        {
          hitchcockApproach: options.hitchcockApproach ?? true,
          neuroscientificApproach: options.neuroscientificApproach ?? true,
          genreSubversion: options.genreSubversion ?? false,
          interactiveElements: options.interactiveElements ?? false,
          serializedFormat: options.serializedFormat ?? false
        }
      );
      
      // Stage 2: Convert context to legacy StoryContext format
      const legacyContext = this.convertToLegacyStoryContext(
        context, requirements, tensionFramework
      );
      
      // Stage 3: Generate enhanced tension blueprint using framework insights
      const enhancedBlueprint = await this.generateTensionBlueprint(legacyContext);
      
      // Stage 4: Apply V2.0 enhancements to blueprint
      const frameworkEnhancedBlueprint = this.applyTensionFrameworkToBlueprint(
        enhancedBlueprint, tensionFramework
      );
      
      console.log(`✅ TENSION ESCALATION ENGINE V2.0: Generated enhanced blueprint with ${tensionFramework.primaryRecommendation.confidence}/10 framework confidence`);
      
      return {
        blueprint: frameworkEnhancedBlueprint,
        tensionFramework: tensionFramework
      };
      
    } catch (error) {
      console.error('❌ Enhanced Tension Escalation Engine failed:', error);
      throw new Error(`Enhanced tension blueprint generation failed: ${error}`);
    }
  }

  /**
   * SERIALIZED CONTINUITY ENHANCED: Generate tension blueprint with long-form narrative continuity
   */
  static async generateSerializedTensionBlueprint(
    context: {
      seriesTitle: string;
      genre: 'drama' | 'thriller' | 'crime' | 'mystery' | 'horror' | 'sci-fi' | 'fantasy';
      format: 'episodic' | 'serialized' | 'hybrid';
      seasonCount: number;
      episodeLength: string;
      platform: 'broadcast' | 'cable' | 'streaming';
      targetAudience: string;
    },
    requirements: {
      tensionContinuity: 'episodic-reset' | 'seasonal-build' | 'series-long' | 'multi-layered';
      cliffhangerStrategy: 'minimal' | 'strategic' | 'intensive' | 'binge-optimized';
      characterTensionArcs: 'static' | 'evolving' | 'transformative' | 'ensemble';
      audienceEngagement: 'casual' | 'dedicated' | 'binge-optimized' | 'community-driven';
      suspenseComplexity: 'simple' | 'moderate' | 'complex' | 'layered';
    },
    options: {
      continuityDepth?: 'basic' | 'moderate' | 'comprehensive' | 'novelistic';
      episodeTransitions?: boolean;
      seasonalEscalation?: boolean;
      characterArcIntegration?: boolean;
      socialEngagement?: boolean;
    } = {}
  ): Promise<{ blueprint: TensionBlueprint; continuityFramework: SerializedContinuityEngineRecommendation; tensionFramework: TensionEngineRecommendation }> {
    try {
      console.log(`🎬 SERIALIZED CONTINUITY + TENSION ESCALATION V2.0: Creating long-form tension architecture...`);
      
      // Generate Serialized Continuity Framework V2.0
      const continuityFramework = await SerializedContinuityEngineV2.generateSerializedContinuityRecommendation(
        {
          seriesTitle: context.seriesTitle,
          genre: context.genre,
          format: context.format,
          seasonCount: context.seasonCount,
          episodeLength: context.episodeLength,
          platform: context.platform,
          targetAudience: context.targetAudience
        },
        {
          continuityDepth: options.continuityDepth || 'moderate',
          characterComplexity: requirements.characterTensionArcs === 'ensemble' ? 'ensemble' : 'moderate',
          worldBuildingScope: context.genre === 'fantasy' || context.genre === 'sci-fi' ? 'extensive' : 'expanded',
          audienceEngagement: requirements.audienceEngagement,
          narrativeAmbition: requirements.suspenseComplexity === 'layered' ? 'innovative' : 'conventional'
        },
        {
          seriesBibleCreation: true,
          characterArcTracking: options.characterArcIntegration,
          plotThreadWeaving: true,
          episodeTransitionOptimization: options.episodeTransitions,
          socialMediaIntegration: options.socialEngagement
        }
      );
      
      // Convert serialized context to tension escalation context
      const tensionContext = this.convertSerializedToTensionContext(context, requirements, continuityFramework);
      
      // Generate Enhanced Tension Framework V2.0
      const tensionFramework = await TensionEscalationEngineV2.generateTensionFramework(
        tensionContext.context,
        tensionContext.requirements,
        tensionContext.options
      );
      
      // Convert to traditional tension blueprint inputs
      const legacyTensionInputs = this.convertToLegacyStoryContext(
        tensionContext.context, tensionContext.requirements, tensionFramework
      );
      
      // Generate enhanced tension blueprint
      const blueprint = await this.generateTensionBlueprint(legacyTensionInputs);
      
      // Apply Serialized Continuity + Tension V2.0 enhancements
      const enhancedBlueprint = this.applySerializedTensionFrameworkToBlueprint(
        blueprint,
        continuityFramework,
        tensionFramework
      );
      
      console.log(`✅ SERIALIZED CONTINUITY + TENSION V2.0: Generated long-form tension architecture with ${continuityFramework.primaryRecommendation.confidence * 100}% confidence`);
      
      return {
        blueprint: enhancedBlueprint,
        continuityFramework,
        tensionFramework
      };
    } catch (error) {
      console.error('❌ Serialized Continuity + Tension Escalation V2.0 failed:', error);
      throw error;
    }
  }

  /**
   * ENGAGEMENT ENGINE ENHANCED: Generate tension blueprint with neuro-narrative retention mastery
   */
  static async generateEngagementOptimizedTensionBlueprint(
    context: {
      projectTitle: string;
      genre: string;
      format: 'feature-film' | 'series' | 'short-form' | 'streaming' | 'social-media';
      platform: string;
      targetAudience: string;
      duration: string;
      episodeCount?: number;
    },
    requirements: {
      tensionEngagement: 'attention-grabbing' | 'emotion-laden' | 'curiosity-driven' | 'parasocial-building';
      retentionStrategy: 'hook-focused' | 'cliffhanger-driven' | 'character-based' | 'neurochemical-optimized';
      audienceCommitment: 'casual' | 'dedicated' | 'binge-oriented' | 'community-driven';
      psychologicalDepth: 'surface' | 'moderate' | 'deep' | 'immersive';
      suspenseComplexity: 'simple' | 'layered' | 'complex' | 'transmedia';
    },
    options: {
      neurochemicalOptimization?: boolean;
      crossPlatformStrategy?: boolean;
      culturalAdaptation?: boolean;
      fatiguePreventionProtocols?: boolean;
      transmediaIntegration?: boolean;
    } = {}
  ): Promise<{ blueprint: TensionBlueprint; engagementFramework: EngagementEngineRecommendation; tensionFramework: TensionEngineRecommendation }> {
    try {
      console.log(`🧠 ENGAGEMENT ENGINE + TENSION ESCALATION V2.0: Creating neuro-narrative retention architecture...`);
      
      // Generate Engagement Engine Framework V2.0
      const engagementFramework = await EngagementEngineV2.generateEngagementRecommendation(
        context,
        {
          engagementDepth: requirements.psychologicalDepth,
          retentionStrategy: requirements.retentionStrategy,
          audienceCommitment: requirements.audienceCommitment,
          psychologicalApproach: requirements.tensionEngagement,
          narrativeComplexity: requirements.suspenseComplexity
        },
        options
      );
      
      // Convert engagement context to tension escalation context
      const tensionContext = this.convertEngagementToTensionContext(context, requirements, engagementFramework);
      
      // Generate Enhanced Tension Framework V2.0
      const tensionFramework = await TensionEscalationEngineV2.generateTensionFramework(
        tensionContext.context,
        tensionContext.requirements,
        tensionContext.options
      );
      
      // Convert to traditional tension blueprint inputs
      const legacyTensionInputs = this.convertToLegacyStoryContext(
        tensionContext.context, tensionContext.requirements, tensionFramework
      );
      
      // Generate enhanced tension blueprint
      const blueprint = await this.generateTensionBlueprint(legacyTensionInputs);
      
      // Apply Engagement + Tension V2.0 enhancements
      const enhancedBlueprint = this.applyEngagementTensionFrameworkToBlueprint(
        blueprint,
        engagementFramework,
        tensionFramework
      );
      
      console.log(`✅ ENGAGEMENT + TENSION V2.0: Generated neuro-narrative architecture with ${engagementFramework.primaryRecommendation.confidence * 100}% confidence`);
      
      return {
        blueprint: enhancedBlueprint,
        engagementFramework,
        tensionFramework
      };
    } catch (error) {
      console.error('❌ Engagement + Tension Escalation V2.0 failed:', error);
      throw error;
    }
  }
  
  /**
   * LEGACY SUPPORT: Generates a comprehensive tension management blueprint for any story
   */
  static async generateTensionBlueprint(storyContext: StoryContext): Promise<TensionBlueprint> {
    try {
      // AI-powered tension architecture design
      const tensionArchitecture = await this.designTensionArchitectureAI(storyContext);
      
      // AI-created escalation patterns
      const escalationPatterns = await this.generateEscalationPatternsAI(storyContext);
      
      // AI-orchestrated emotional peaks
      const emotionalPeaks = await this.designEmotionalPeaksAI(storyContext, tensionArchitecture);
      
      // AI-developed suspense elements
      const suspenseElements = await this.createSuspenseElementsAI(storyContext);
      
      // AI-optimized release patterns
      const releasePatterns = await this.designReleasePatternsAI(storyContext, escalationPatterns);
      
      // AI-tailored genre adaptation
      const genreAdaptation = await this.createGenreTensionAdaptationAI(storyContext);
      
      // AI-optimized audience targeting
      const audienceOptimization = await this.optimizeForAudienceAI(storyContext);
      
      // AI-calculated quality metrics
      const qualityMetrics = await this.calculateTensionQualityMetricsAI(
        tensionArchitecture, escalationPatterns, emotionalPeaks, storyContext
    );
    
    return {
        storyContext,
        tensionArchitecture,
      escalationPatterns,
        emotionalPeaks,
        suspenseElements,
        releasePatterns,
        genreAdaptation,
        audienceOptimization,
        qualityMetrics
      };

    } catch (error) {
      console.error('AI tension blueprint generation failed:', error);
      return this.generateTensionBlueprintFallback(storyContext);
    }
  }

  /**
   * Analyzes tension levels and potential for a specific scene
   */
  static async analyzeTension(scene: any, tensionBlueprint: TensionBlueprint): Promise<TensionAnalysis> {
    try {
      // AI-powered tension level assessment
      const currentTensionLevel = await this.assessCurrentTensionLevelAI(scene, tensionBlueprint);
      
      // AI-identified tension type
      const tensionType = await this.identifyTensionTypeAI(scene, tensionBlueprint);
      
      // AI-calculated escalation potential
      const escalationPotential = await this.calculateEscalationPotentialAI(scene, tensionBlueprint);
      
      // AI-analyzed emotional state
      const emotionalState = await this.analyzeEmotionalStateAI(scene, tensionBlueprint);
      
      // AI-identified suspense factors
      const suspenseFactors = await this.identifySuspenseFactorsAI(scene, tensionBlueprint);
      
      // AI-detected release opportunities
      const releaseOpportunities = await this.detectReleaseOpportunitiesAI(scene, tensionBlueprint);
      
      // AI-predicted audience engagement
      const audienceEngagement = await this.predictAudienceEngagementAI(scene, currentTensionLevel, tensionType);
    
    return {
        scene,
        currentTensionLevel,
        tensionType,
        escalationPotential,
        emotionalState,
        suspenseFactors,
        releaseOpportunities,
        audienceEngagement
      };

    } catch (error) {
      console.error('AI tension analysis failed:', error);
      return this.analyzeTensionFallback(scene, tensionBlueprint);
    }
  }

  /**
   * Applies intelligent tension escalation to a specific scene
   */
  static async applyTensionEscalation(scene: any, tensionAnalysis: TensionAnalysis, tensionBlueprint: TensionBlueprint): Promise<TensionApplication> {
    try {
      // AI-developed tension strategy
      const tensionStrategy = await this.developTensionStrategyAI(scene, tensionAnalysis, tensionBlueprint);
      
      // AI-selected escalation techniques
      const escalationTechniques = await this.selectEscalationTechniquesAI(scene, tensionAnalysis, tensionBlueprint);
      
      // AI-designed emotional manipulation
      const emotionalManipulation = await this.designEmotionalManipulationAI(scene, tensionAnalysis);
      
      // AI-orchestrated suspense building
      const suspenseBuilding = await this.orchestrateSuspenseBuildingAI(scene, tensionAnalysis, tensionBlueprint);
      
      // AI-managed release strategy
      const releaseManagement = await this.manageReleaseStrategyAI(scene, tensionAnalysis, tensionBlueprint);
      
      // AI-predicted audience impact
      const audienceImpact = await this.predictTensionAudienceImpactAI(scene, tensionStrategy, escalationTechniques);
      
      // AI-calculated effectiveness score
      const effectivenessScore = await this.calculateTensionEffectivenessAI(
        tensionStrategy, escalationTechniques, suspenseBuilding, audienceImpact
    );
    
    return {
      scene,
        tensionStrategy,
        escalationTechniques,
        emotionalManipulation,
        suspenseBuilding,
        releaseManagement,
        audienceImpact,
        effectivenessScore
      };

    } catch (error) {
      console.error('AI tension application failed:', error);
      return this.applyTensionEscalationFallback(scene, tensionAnalysis, tensionBlueprint);
    }
  }

  /**
   * Optimizes tension flow across multiple scenes or acts
   */
  static async optimizeTensionFlow(scenes: any[], tensionBlueprint: TensionBlueprint): Promise<{ 
    optimizedFlow: TensionApplication[]; 
    flowMetrics: any; 
    recommendations: string[]; 
  }> {
    try {
      const applications = await Promise.all(
        scenes.map(async (scene) => {
          const analysis = await this.analyzeTension(scene, tensionBlueprint);
          return await this.applyTensionEscalation(scene, analysis, tensionBlueprint);
        })
      );

      const flowMetrics = await this.analyzeFlowMetricsAI(applications, tensionBlueprint);
      const recommendations = await this.generateFlowRecommendationsAI(applications, flowMetrics);

      return {
        optimizedFlow: applications,
        flowMetrics,
        recommendations
      };

    } catch (error) {
      console.error('AI tension flow optimization failed:', error);
      return this.optimizeTensionFlowFallback(scenes, tensionBlueprint);
    }
  }

  // ===== AI-POWERED CORE METHODS =====

  private static async designTensionArchitectureAI(storyContext: StoryContext): Promise<TensionArchitecture> {
    const prompt = `Design a comprehensive tension architecture for this story:

STORY CONTEXT:
- Genre: ${storyContext.genre}
- Target Audience: ${storyContext.audience}
- Themes: ${storyContext.themes.join(', ')}
- Structure: ${JSON.stringify(storyContext.structure)}

Create a tension architecture that includes:
1. Overall tension structure and pattern
2. Act-by-act tension breakdown and mapping
3. Climax design with maximum impact techniques
4. Tension curve shape and progression
5. Emotional journey mapping throughout story
6. Suspense hierarchy and priority system
7. Strategic release strategy and timing

Consider genre conventions, audience psychology, and optimal engagement patterns.

Return as JSON object with complete tension architecture.`;

    const systemPrompt = `You are a master of dramatic tension and suspense, with expertise in psychology, audience engagement, and genre storytelling. Design tension architectures that maximize emotional impact while maintaining narrative integrity.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 1500
      });

      const archData = JSON.parse(result || '{}');
    return {
        overallStructure: archData.overallStructure || { pattern: 'rising-action', peaks: 3, distribution: 'escalating' },
        actBreakdown: archData.actBreakdown || [
          { act: 1, tensionLevel: 30, pattern: 'setup' },
          { act: 2, tensionLevel: 70, pattern: 'escalation' },
          { act: 3, tensionLevel: 95, pattern: 'climax' }
        ],
        climaxDesign: archData.climaxDesign || { type: 'emotional-peak', intensity: 95, techniques: ['stakes-elevation', 'time-pressure'] },
        tensionCurve: archData.tensionCurve || { 
          points: [{ time: 0, tension: 10 }, { time: 50, tension: 70 }, { time: 90, tension: 95 }, { time: 100, tension: 20 }], 
          shape: 'exponential' 
        },
        emotionalJourney: archData.emotionalJourney || { 
          stages: [
            { emotion: 'anticipation', duration: 'act-1' },
            { emotion: 'anxiety', duration: 'act-2' },
            { emotion: 'fear', duration: 'climax' },
            { emotion: 'relief', duration: 'resolution' }
          ]
        },
        suspenseHierarchy: archData.suspenseHierarchy || { 
          levels: [
            { priority: 1, elements: ['main-conflict', 'protagonist-jeopardy'] },
            { priority: 2, elements: ['time-pressure', 'mystery-revelation'] },
            { priority: 3, elements: ['character-relationships', 'moral-dilemmas'] }
          ]
        },
        releaseStrategy: archData.releaseStrategy || { pattern: 'strategic-breaks', frequency: 'tension-dependent', methods: ['humor', 'character-moments', 'partial-resolution'] }
      };

    } catch (error) {
      return this.designTensionArchitectureFallback(storyContext);
    }
  }

  private static async generateEscalationPatternsAI(storyContext: StoryContext): Promise<EscalationPattern[]> {
    const prompt = `Generate escalation patterns optimized for this story:

STORY CONTEXT:
- Genre: ${storyContext.genre}
- Audience: ${storyContext.audience}
- Themes: ${storyContext.themes.join(', ')}

Create 3-5 escalation patterns that include:
1. Unique ID and descriptive name
2. Escalation type (linear, exponential, stepped, etc.)
3. Detailed description and application
4. Tension increase percentage and duration
5. Specific triggers and techniques
6. Emotional impact and audience effects
7. Genre compatibility assessment

Each pattern should serve different narrative purposes and audience engagement goals.

Return as JSON array of escalation pattern objects.`;

    const systemPrompt = `You are an expert in dramatic escalation and audience psychology. Create escalation patterns that build tension systematically while maintaining audience engagement and emotional investment.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.5,
        maxTokens: 1200
      });

      const patternData = JSON.parse(result || '[]');
      return patternData.map((pattern: any) => ({
        id: pattern.id || `escalation-${Date.now()}-${Math.random()}`,
        name: pattern.name || 'Standard Escalation',
        type: pattern.type || 'linear-buildup',
        description: pattern.description || 'Gradual tension increase',
        tensionIncrease: pattern.tensionIncrease || 25,
        duration: pattern.duration || { build: 'gradual', peak: 'brief', sustain: 'moderate' },
        triggers: pattern.triggers || [{ event: 'conflict-introduction', condition: 'stakes-established', timing: 'early' }],
        techniques: pattern.techniques || [{ name: 'stakes-elevation', method: 'progressive-reveal', psychologicalBasis: 'anticipation-anxiety', effectiveness: 80 }],
        emotionalImpact: pattern.emotionalImpact || { primary: 'anxiety', secondary: ['anticipation'], intensity: 75 },
        audienceEffect: pattern.audienceEffect || { engagement: 80, retention: 85, satisfaction: 75 },
        genreCompatibility: pattern.genreCompatibility || [storyContext.genre]
      }));

    } catch (error) {
      return this.generateEscalationPatternsFallback(storyContext);
    }
  }

  private static async designEmotionalPeaksAI(storyContext: StoryContext, tensionArchitecture: TensionArchitecture): Promise<EmotionalPeak[]> {
    const prompt = `Design emotional peaks for this story's tension architecture:

STORY CONTEXT:
- Genre: ${storyContext.genre}
- Audience: ${storyContext.audience}

TENSION ARCHITECTURE:
- Structure: ${tensionArchitecture.overallStructure.pattern}
- Peaks: ${tensionArchitecture.overallStructure.peaks}
- Climax Intensity: ${tensionArchitecture.climaxDesign.intensity}

Create ${tensionArchitecture.overallStructure.peaks} emotional peaks that:
1. Have unique IDs and descriptive names
2. Target specific emotions with precise intensity
3. Include detailed buildup, peak, and falloff patterns
4. Define recovery times and narrative functions
5. Maximize audience emotional impact
6. Serve specific story and character purposes

Ensure peaks escalate in intensity toward the climax while providing appropriate emotional variety.

Return as JSON array of emotional peak objects.`;

    const systemPrompt = `You are an expert in emotional storytelling and audience psychology. Design emotional peaks that create powerful, memorable experiences while serving the story's dramatic needs.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.5,
        maxTokens: 1000
      });

      const peakData = JSON.parse(result || '[]');
      return peakData.map((peak: any) => ({
        id: peak.id || `peak-${Date.now()}-${Math.random()}`,
        name: peak.name || 'Emotional Peak',
        emotion: peak.emotion || 'anxiety',
        intensity: peak.intensity || 75,
        buildupDuration: peak.buildupDuration || { buildup: 'gradual', peak: 'intense', falloff: 'moderate' },
        peakMoment: peak.peakMoment || { timing: 'climax-approach', triggers: ['revelation', 'conflict-escalation'], execution: 'dramatic' },
        falloffPattern: peak.falloffPattern || { type: 'gradual-decline', speed: 'moderate', destination: 40 },
        recoveryTime: peak.recoveryTime || { duration: 'brief', method: 'character-processing', newBaseline: 50 },
        audienceImpact: peak.audienceImpact || { immediate: ['shock', 'engagement'], lasting: ['memory-retention'], discussion: ['emotional-analysis'] },
        narrativeFunction: peak.narrativeFunction || { purpose: 'character-development', plotAdvancement: 80, characterImpact: 90 }
      }));

    } catch (error) {
      return this.designEmotionalPeaksFallback(storyContext, tensionArchitecture);
    }
  }

  private static async createSuspenseElementsAI(storyContext: StoryContext): Promise<SuspenseElement[]> {
    const prompt = `Create suspense elements optimized for this story:

STORY CONTEXT:
- Genre: ${storyContext.genre}
- Themes: ${storyContext.themes.join(', ')}
- Audience: ${storyContext.audience}

Generate 4-6 suspense elements that include:
1. Unique IDs and descriptive names
2. Suspense categories and techniques
3. Psychological basis and mechanisms
4. Buildup methods and payoff strategies
5. Audience manipulation techniques (ethical)
6. Effectiveness ratings and applications

Focus on elements that enhance the story's themes while maximizing audience engagement.

Return as JSON array of suspense element objects.`;

    const systemPrompt = `You are a master of suspense and psychological storytelling. Create suspense elements that are both effective and ethically responsible, enhancing rather than exploiting audience engagement.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.5,
        maxTokens: 1000
      });

      const suspenseData = JSON.parse(result || '[]');
      return suspenseData.map((element: any) => ({
        id: element.id || `suspense-${Date.now()}-${Math.random()}`,
        name: element.name || 'Suspense Element',
        category: element.category || 'outcome-uncertainty',
        technique: element.technique || { name: 'information-control', method: 'strategic-revelation', effectiveness: 80 },
        psychologyBasis: element.psychologyBasis || { principle: 'anticipation-anxiety', mechanism: 'uncertainty-stress', research: 'cognitive-psychology' },
        buildupMethod: element.buildupMethod || { technique: 'gradual-revelation', duration: 'extended', intensity: 'moderate' },
        payoffStrategy: element.payoffStrategy || { timing: 'optimal-moment', method: 'dramatic-revelation', satisfaction: 85 },
        audienceManipulation: element.audienceManipulation || { techniques: ['attention-focus', 'expectation-management'], ethics: 'story-service', effectiveness: 80 },
        effectivenessRating: element.effectivenessRating || 80
      }));

    } catch (error) {
      return this.createSuspenseElementsFallback(storyContext);
    }
  }

  private static async designReleasePatternsAI(storyContext: StoryContext, escalationPatterns: EscalationPattern[]): Promise<ReleasePattern[]> {
    const prompt = `Design release patterns that complement these escalation patterns:

STORY CONTEXT:
- Genre: ${storyContext.genre}
- Audience: ${storyContext.audience}

ESCALATION PATTERNS:
${escalationPatterns.map(pattern => `- ${pattern.name}: ${pattern.type} (${pattern.tensionIncrease}% increase)`).join('\n')}

Create release patterns that:
1. Have unique IDs and descriptive names
2. Define release types and optimal timing
3. Include specific release methods and techniques
4. Plan recovery phases and audience recalibration
5. Set up the next tension building cycle
6. Balance relief with maintaining engagement

Ensure patterns work harmoniously with escalation cycles for optimal tension flow.

Return as JSON array of release pattern objects.`;

    const systemPrompt = `You are an expert in tension management and audience psychology. Design release patterns that provide necessary relief while maintaining story momentum and engagement.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 800
      });

      const releaseData = JSON.parse(result || '[]');
      return releaseData.map((release: any) => ({
        id: release.id || `release-${Date.now()}-${Math.random()}`,
        name: release.name || 'Tension Release',
        type: release.type || 'partial-relief',
        timing: release.timing || { moment: 'post-peak', duration: 'brief', context: 'natural-break' },
        method: release.method || { technique: 'character-interaction', intensity: 'moderate', audience: 'broad' },
        recoveryPhase: release.recoveryPhase || { duration: 'standard', activities: ['character-processing', 'setup-next'], newBaseline: 40 },
        audienceRecalibration: release.audienceRecalibration || { method: 'gradual-reset', time: 'brief', effectiveness: 80 },
        nextTensionSetup: release.nextTensionSetup || { timing: 'post-recovery', type: 'situational-suspense', intensity: 60 }
      }));

    } catch (error) {
      return this.designReleasePatternsFallback(storyContext, escalationPatterns);
    }
  }

  private static async createGenreTensionAdaptationAI(storyContext: StoryContext): Promise<GenreTensionAdaptation> {
    const prompt = `Create genre-specific tension adaptations for this story:

GENRE: ${storyContext.genre}
AUDIENCE: ${storyContext.audience}
THEMES: ${storyContext.themes.join(', ')}

Analyze and adapt tension techniques for this genre:
1. Genre-specific tension requirements and expectations
2. Adaptation methods for universal tension principles
3. Innovation opportunities within genre constraints
4. Audience-specific optimizations

Consider genre conventions while identifying opportunities for creative innovation.

Return as JSON object with genre adaptation strategy.`;

    const systemPrompt = `You are a genre expert specializing in tension and suspense across different storytelling categories. Adapt universal tension principles to specific genre requirements while maintaining effectiveness.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 600
      });

      const adaptationData = JSON.parse(result || '{}');
    return {
        requirements: adaptationData.requirements || [`${storyContext.genre}-appropriate pacing`, 'audience-expectation fulfillment'],
        adaptations: adaptationData.adaptations || ['genre-specific escalation', 'thematic tension integration'],
        innovations: adaptationData.innovations || ['creative pattern synthesis', 'expectation subversion']
      };

    } catch (error) {
      return this.createGenreTensionAdaptationFallback(storyContext);
    }
  }

  private static async optimizeForAudienceAI(storyContext: StoryContext): Promise<AudienceTensionOptimization> {
    const prompt = `Optimize tension strategies for this target audience:

TARGET AUDIENCE: ${storyContext.audience}
GENRE: ${storyContext.genre}
THEMES: ${storyContext.themes.join(', ')}

Create audience optimization that includes:
1. Demographic analysis and tension preferences
2. Audience-specific engagement strategies
3. Optimal tension intensity and pacing
4. Cultural and psychological considerations

Return as JSON object with audience optimization plan.`;

    const systemPrompt = `You are an audience psychology expert specializing in demographic engagement and tension preferences. Optimize tension strategies for maximum audience connection and satisfaction.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 500
      });

      const optimizationData = JSON.parse(result || '{}');
      return {
        demographics: optimizationData.demographics || [storyContext.audience],
        preferences: optimizationData.preferences || ['moderate-intensity', 'character-focused'],
        strategies: optimizationData.strategies || ['gradual-buildup', 'emotional-investment']
      };

    } catch (error) {
      return this.optimizeForAudienceFallback(storyContext);
    }
  }

  private static async calculateTensionQualityMetricsAI(
    tensionArchitecture: TensionArchitecture, 
    escalationPatterns: EscalationPattern[], 
    emotionalPeaks: EmotionalPeak[], 
    storyContext: StoryContext
  ): Promise<TensionQualityMetrics> {
    const prompt = `Calculate quality metrics for this tension design:

TENSION ARCHITECTURE: ${tensionArchitecture.overallStructure.pattern} with ${tensionArchitecture.overallStructure.peaks} peaks
ESCALATION PATTERNS: ${escalationPatterns.length} patterns (avg effectiveness: ${escalationPatterns.reduce((sum, p) => sum + (p.audienceEffect?.engagement || 0), 0) / escalationPatterns.length})
EMOTIONAL PEAKS: ${emotionalPeaks.length} peaks (max intensity: ${Math.max(...emotionalPeaks.map(p => p.intensity))})
GENRE: ${storyContext.genre}
AUDIENCE: ${storyContext.audience}

Evaluate:
1. Effectiveness Score (0-100): How well does tension serve the story?
2. Audience Engagement (0-100): How engaging will this be for the target audience?
3. Emotional Impact (0-100): How powerful will the emotional experience be?
4. Suspense Quality (0-100): How masterful is the suspense construction?
5. Pacing Score (0-100): How well-paced is the tension flow?
6. Overall Quality (0-100): Composite assessment

Return as JSON object with numerical scores and brief justifications.`;

    const systemPrompt = `You are a tension and suspense quality assessor with expertise in dramatic effectiveness, audience psychology, and storytelling excellence. Provide balanced, objective evaluations.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.2,
        maxTokens: 400
      });

      const metricsData = JSON.parse(result || '{}');
    return {
        effectivenessScore: metricsData.effectivenessScore || 80,
        audienceEngagement: metricsData.audienceEngagement || 82,
        emotionalImpact: metricsData.emotionalImpact || 78,
        suspenseQuality: metricsData.suspenseQuality || 80,
        pacing: metricsData.pacing || 75,
        overall: metricsData.overall || 79
      };

    } catch (error) {
      return this.calculateTensionQualityMetricsFallback(tensionArchitecture, escalationPatterns, emotionalPeaks, storyContext);
    }
  }

  // ===== SCENE-LEVEL AI METHODS =====

  private static async assessCurrentTensionLevelAI(scene: any, tensionBlueprint: TensionBlueprint): Promise<number> {
    const prompt = `Assess the current tension level of this scene:

SCENE: ${JSON.stringify(scene)}
TENSION ARCHITECTURE: ${JSON.stringify(tensionBlueprint.tensionArchitecture)}

Rate the current tension level (0-100) based on:
1. Conflict intensity and stakes
2. Character emotional states
3. Situational pressure and urgency
4. Audience investment and concern
5. Dramatic irony and suspense elements

Return just the numerical score (0-100).`;

    const systemPrompt = `You are a tension assessment expert. Analyze scenes and provide accurate tension level ratings based on dramatic elements and audience psychology.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.2,
        maxTokens: 100
      });

      const score = parseInt(result?.trim() || '50');
      return Math.max(0, Math.min(100, score));

    } catch (error) {
      return this.assessCurrentTensionLevelFallback(scene, tensionBlueprint);
    }
  }

  private static async identifyTensionTypeAI(scene: any, tensionBlueprint: TensionBlueprint): Promise<TensionType> {
    const prompt = `Identify the primary tension type in this scene:

SCENE: ${JSON.stringify(scene)}
AVAILABLE TYPES: dramatic-irony, situational-suspense, character-conflict, time-pressure, mystery-revelation, moral-dilemma, physical-danger, emotional-stakes, psychological-tension, anticipation-anxiety

Return the most applicable tension type from the list.`;

    const systemPrompt = `You are a dramatic analysis expert. Identify tension types with precision based on scene elements and dramatic structure.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.2,
        maxTokens: 50
      });

      const tensionTypes: TensionType[] = [
        'dramatic-irony', 'situational-suspense', 'character-conflict', 'time-pressure',
        'mystery-revelation', 'moral-dilemma', 'physical-danger', 'emotional-stakes',
        'psychological-tension', 'anticipation-anxiety'
      ];

      const identified = result?.trim().toLowerCase();
      return tensionTypes.find(type => identified?.includes(type)) || 'situational-suspense';

    } catch (error) {
      return this.identifyTensionTypeFallback(scene, tensionBlueprint);
    }
  }

  private static async calculateEscalationPotentialAI(scene: any, tensionBlueprint: TensionBlueprint): Promise<number> {
    const prompt = `Calculate escalation potential for this scene:

SCENE: ${JSON.stringify(scene)}
ESCALATION PATTERNS: ${tensionBlueprint.escalationPatterns.map(p => p.name).join(', ')}

Rate the potential for tension escalation (0-100) based on:
1. Available conflict elements to intensify
2. Character emotional capacity for escalation
3. Situational factors that could worsen
4. Narrative position and story requirements
5. Audience readiness for increased tension

Return just the numerical score (0-100).`;

    const systemPrompt = `You are an escalation analysis expert. Assess scenes for their potential to increase dramatic tension effectively.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.2,
        maxTokens: 100
      });

      const score = parseInt(result?.trim() || '60');
      return Math.max(0, Math.min(100, score));

    } catch (error) {
      return this.calculateEscalationPotentialFallback(scene, tensionBlueprint);
    }
  }

  private static async analyzeEmotionalStateAI(scene: any, tensionBlueprint: TensionBlueprint): Promise<EmotionalState> {
    const prompt = `Analyze the emotional state in this scene:

SCENE: ${JSON.stringify(scene)}
EMOTIONAL JOURNEY: ${JSON.stringify(tensionBlueprint.tensionArchitecture.emotionalJourney)}

Identify:
1. Primary emotion (fear, anxiety, excitement, dread, anticipation, panic, surprise, relief, shock, desperation)
2. Intensity level (0-100)
3. Stability level (0-100)
4. Trajectory (rising, falling, stable, volatile)

Return as JSON object with emotional state analysis.`;

    const systemPrompt = `You are an emotional analysis expert specializing in dramatic scenes and character psychology.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 200
      });

      const stateData = JSON.parse(result || '{}');
    return {
        primary: stateData.primary || 'anxiety',
        intensity: stateData.intensity || 60,
        stability: stateData.stability || 70,
        trajectory: stateData.trajectory || 'rising'
      };

    } catch (error) {
      return this.analyzeEmotionalStateFallback(scene, tensionBlueprint);
    }
  }

  private static async identifySuspenseFactorsAI(scene: any, tensionBlueprint: TensionBlueprint): Promise<SuspenseFactor[]> {
    const prompt = `Identify suspense factors in this scene:

SCENE: ${JSON.stringify(scene)}
SUSPENSE ELEMENTS: ${tensionBlueprint.suspenseElements.map(e => e.name).join(', ')}

For each factor, provide:
1. Factor description
2. Contribution to suspense (0-100)
3. Manipulability for enhancement (0-100)
4. Audience awareness level (0-100)

Return as JSON array of suspense factor objects.`;

    const systemPrompt = `You are a suspense analysis expert. Identify factors that contribute to scene tension and their potential for enhancement.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 400
      });

      const factorData = JSON.parse(result || '[]');
      return factorData.map((factor: any) => ({
        factor: factor.factor || 'Unknown factor',
        contribution: factor.contribution || 60,
        manipulability: factor.manipulability || 70,
        audienceAwareness: factor.audienceAwareness || 50
      }));

    } catch (error) {
      return this.identifySuspenseFactorsFallback(scene, tensionBlueprint);
    }
  }

  private static async detectReleaseOpportunitiesAI(scene: any, tensionBlueprint: TensionBlueprint): Promise<ReleaseOpportunity[]> {
    const prompt = `Detect tension release opportunities in this scene:

SCENE: ${JSON.stringify(scene)}
RELEASE PATTERNS: ${tensionBlueprint.releasePatterns.map(p => p.name).join(', ')}

Identify opportunities for:
1. Timing and context for release
2. Type of release (partial-relief, false-resolution, etc.)
3. Appropriateness score (0-100)
4. Expected impact on audience

Return as JSON array of release opportunity objects.`;

    const systemPrompt = `You are a tension management expert. Identify appropriate moments and methods for tension release that enhance rather than undermine the dramatic experience.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 400
      });

      const opportunityData = JSON.parse(result || '[]');
      return opportunityData.map((opp: any) => ({
        timing: opp.timing || 'post-peak',
        type: opp.type || 'partial-relief',
        appropriateness: opp.appropriateness || 70,
        impact: opp.impact || 'moderate-relief'
      }));

    } catch (error) {
      return this.detectReleaseOpportunitiesFallback(scene, tensionBlueprint);
    }
  }

  private static async predictAudienceEngagementAI(scene: any, tensionLevel: number, tensionType: TensionType): Promise<number> {
    const prompt = `Predict audience engagement for this scene:

SCENE: ${JSON.stringify(scene)}
TENSION LEVEL: ${tensionLevel}/100
TENSION TYPE: ${tensionType}

Rate predicted audience engagement (0-100) based on:
1. Scene tension effectiveness
2. Tension type appeal
3. Audience attention capture
4. Emotional investment level
5. Anticipation and curiosity

Return just the numerical score (0-100).`;

    const systemPrompt = `You are an audience psychology expert. Predict engagement levels based on dramatic elements and tension effectiveness.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.2,
        maxTokens: 100
      });

      const score = parseInt(result?.trim() || '70');
      return Math.max(0, Math.min(100, score));

    } catch (error) {
      return this.predictAudienceEngagementFallback(scene, tensionLevel, tensionType);
    }
  }

  // ===== TENSION APPLICATION AI METHODS =====

  private static async developTensionStrategyAI(scene: any, tensionAnalysis: TensionAnalysis, tensionBlueprint: TensionBlueprint): Promise<TensionStrategy> {
    const prompt = `Develop a tension strategy for this scene:

SCENE: ${JSON.stringify(scene)}
TENSION ANALYSIS: Level ${tensionAnalysis.currentTensionLevel}, Type ${tensionAnalysis.tensionType}
ESCALATION POTENTIAL: ${tensionAnalysis.escalationPotential}

Create a strategy that includes:
1. Strategic approach and philosophy
2. Specific techniques to employ
3. Optimal timing and execution
4. Target intensity level

Return as JSON object with tension strategy.`;

    const systemPrompt = `You are a tension strategy expert. Develop comprehensive approaches that maximize dramatic impact while serving story needs.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 300
      });

      const strategyData = JSON.parse(result || '{}');
      return {
        approach: strategyData.approach || 'gradual-escalation',
        techniques: strategyData.techniques || ['stakes-elevation', 'time-pressure'],
        timing: strategyData.timing || 'mid-scene',
        intensity: strategyData.intensity || Math.min(100, tensionAnalysis.currentTensionLevel + 20)
      };

    } catch (error) {
      return this.developTensionStrategyFallback(scene, tensionAnalysis, tensionBlueprint);
    }
  }

  private static async selectEscalationTechniquesAI(scene: any, tensionAnalysis: TensionAnalysis, tensionBlueprint: TensionBlueprint): Promise<EscalationTechnique[]> {
    const prompt = `Select escalation techniques for this scene:

SCENE: ${JSON.stringify(scene)}
TENSION TYPE: ${tensionAnalysis.tensionType}
AVAILABLE PATTERNS: ${tensionBlueprint.escalationPatterns.map(p => p.name).join(', ')}

Select 2-4 techniques that include:
1. Technique name and method
2. Psychological basis for effectiveness
3. Effectiveness rating (0-100)
4. Application to this specific scene

Return as JSON array of escalation technique objects.`;

    const systemPrompt = `You are an escalation technique expert. Select and adapt techniques that are most effective for specific scene contexts and tension types.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 500
      });

      const techniqueData = JSON.parse(result || '[]');
      return techniqueData.map((tech: any) => ({
        name: tech.name || 'Standard Escalation',
        method: tech.method || 'Progressive intensity increase',
        psychologicalBasis: tech.psychologicalBasis || 'Audience anticipation and anxiety',
        effectiveness: tech.effectiveness || 75
      }));

    } catch (error) {
      return this.selectEscalationTechniquesFallback(scene, tensionAnalysis, tensionBlueprint);
    }
  }

  private static async designEmotionalManipulationAI(scene: any, tensionAnalysis: TensionAnalysis): Promise<EmotionalManipulation> {
    const prompt = `Design emotional manipulation for this scene:

SCENE: ${JSON.stringify(scene)}
CURRENT EMOTION: ${tensionAnalysis.emotionalState.primary} (intensity: ${tensionAnalysis.emotionalState.intensity})
TRAJECTORY: ${tensionAnalysis.emotionalState.trajectory}

Design manipulation that:
1. Targets specific emotion enhancement
2. Uses ethical, story-serving methods
3. Considers optimal intensity and duration
4. Respects audience intelligence

Return as JSON object with emotional manipulation plan.`;

    const systemPrompt = `You are an emotional storytelling expert. Design audience emotional experiences that enhance story impact while maintaining ethical standards and audience respect.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 300
      });

      const manipulationData = JSON.parse(result || '{}');
      return {
        targetEmotion: manipulationData.targetEmotion || tensionAnalysis.emotionalState.primary,
        methods: manipulationData.methods || ['character-empathy', 'stakes-elevation'],
        intensity: manipulationData.intensity || Math.min(100, tensionAnalysis.emotionalState.intensity + 15),
        duration: manipulationData.duration || 'scene-length'
      };

    } catch (error) {
      return this.designEmotionalManipulationFallback(scene, tensionAnalysis);
    }
  }

  private static async orchestrateSuspenseBuildingAI(scene: any, tensionAnalysis: TensionAnalysis, tensionBlueprint: TensionBlueprint): Promise<SuspenseBuilding> {
    const prompt = `Orchestrate suspense building for this scene:

SCENE: ${JSON.stringify(scene)}
SUSPENSE FACTORS: ${tensionAnalysis.suspenseFactors.map(f => f.factor).join(', ')}
AVAILABLE ELEMENTS: ${tensionBlueprint.suspenseElements.map(e => e.name).join(', ')}

Create suspense building that:
1. Uses specific techniques and methods
2. Times reveals and withholds strategically
3. Plans satisfying payoff
4. Maximizes effectiveness

Return as JSON object with suspense building plan.`;

    const systemPrompt = `You are a suspense orchestration expert. Build suspense systematically using proven techniques while maintaining audience satisfaction and story integrity.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 400
      });

      const suspenseData = JSON.parse(result || '{}');
      return {
        techniques: suspenseData.techniques || ['information-withholding', 'expectation-building'],
        timing: suspenseData.timing || ['gradual-reveal', 'strategic-delay'],
        payoff: suspenseData.payoff || 'dramatic-revelation',
        effectiveness: suspenseData.effectiveness || 80
      };

    } catch (error) {
      return this.orchestrateSuspenseBuildingFallback(scene, tensionAnalysis, tensionBlueprint);
    }
  }

  private static async manageReleaseStrategyAI(scene: any, tensionAnalysis: TensionAnalysis, tensionBlueprint: TensionBlueprint): Promise<ReleaseManagement> {
    const prompt = `Manage tension release strategy for this scene:

SCENE: ${JSON.stringify(scene)}
TENSION LEVEL: ${tensionAnalysis.currentTensionLevel}
RELEASE OPPORTUNITIES: ${tensionAnalysis.releaseOpportunities.map(r => r.type).join(', ')}

Plan release management that:
1. Chooses appropriate release type
2. Times release optimally
3. Plans recovery and reset
4. Sets up next tension building

Return as JSON object with release management plan.`;

    const systemPrompt = `You are a tension release expert. Manage tension relief strategically to maintain audience engagement while providing necessary emotional breaks.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 300
      });

      const releaseData = JSON.parse(result || '{}');
      return {
        type: releaseData.type || 'partial-relief',
        timing: releaseData.timing || 'post-peak',
        recovery: releaseData.recovery || 'gradual-reset',
        nextBuildup: releaseData.nextBuildup || 'delayed-restart'
      };

    } catch (error) {
      return this.manageReleaseStrategyFallback(scene, tensionAnalysis, tensionBlueprint);
    }
  }

  private static async predictTensionAudienceImpactAI(scene: any, tensionStrategy: TensionStrategy, escalationTechniques: EscalationTechnique[]): Promise<TensionAudienceImpact> {
    const prompt = `Predict audience impact of this tension application:

SCENE: ${JSON.stringify(scene)}
STRATEGY: ${tensionStrategy.approach} at intensity ${tensionStrategy.intensity}
TECHNIQUES: ${escalationTechniques.map(t => t.name).join(', ')}

Predict impact on:
1. Engagement level (0-100)
2. Emotional responses
3. Physical responses
4. Cognitive responses

Return as JSON object with audience impact predictions.`;

    const systemPrompt = `You are an audience psychology expert. Predict comprehensive audience responses to tension techniques with accuracy and depth.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 400
      });

      const impactData = JSON.parse(result || '{}');
    return {
        engagement: impactData.engagement || 80,
        emotional: impactData.emotional || ['heightened-attention', 'anxiety-increase'],
        physical: impactData.physical || ['tension-posture', 'increased-focus'],
        cognitive: impactData.cognitive || ['anticipation-processing', 'outcome-speculation']
      };

    } catch (error) {
      return this.predictTensionAudienceImpactFallback(scene, tensionStrategy, escalationTechniques);
    }
  }

  private static async calculateTensionEffectivenessAI(
    tensionStrategy: TensionStrategy, 
    escalationTechniques: EscalationTechnique[], 
    suspenseBuilding: SuspenseBuilding, 
    audienceImpact: TensionAudienceImpact
  ): Promise<number> {
    const prompt = `Calculate tension effectiveness score:

STRATEGY: ${tensionStrategy.approach} (intensity: ${tensionStrategy.intensity})
TECHNIQUES: ${escalationTechniques.length} techniques (avg effectiveness: ${escalationTechniques.reduce((sum, t) => sum + t.effectiveness, 0) / escalationTechniques.length})
SUSPENSE: ${suspenseBuilding.effectiveness} effectiveness
AUDIENCE IMPACT: ${audienceImpact.engagement} engagement

Calculate overall effectiveness (0-100) based on:
1. Strategy appropriateness and execution
2. Technique selection and application
3. Suspense building quality
4. Audience engagement achievement

Return just the numerical score (0-100).`;

    const systemPrompt = `You are a tension effectiveness assessor. Calculate accurate effectiveness scores based on strategy quality, technique application, and audience impact.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.2,
        maxTokens: 100
      });

      const score = parseInt(result?.trim() || '75');
      return Math.max(0, Math.min(100, score));

    } catch (error) {
      return this.calculateTensionEffectivenessFallback(tensionStrategy, escalationTechniques, suspenseBuilding, audienceImpact);
    }
  }

  // ===== FLOW OPTIMIZATION AI METHODS =====

  private static async analyzeFlowMetricsAI(applications: TensionApplication[], tensionBlueprint: TensionBlueprint): Promise<any> {
    const prompt = `Analyze tension flow metrics across these applications:

APPLICATIONS: ${applications.length} scenes
AVERAGE EFFECTIVENESS: ${applications.reduce((sum, app) => sum + app.effectivenessScore, 0) / applications.length}
TENSION CURVE: ${applications.map(app => app.tensionStrategy.intensity).join(' -> ')}

Analyze:
1. Flow consistency and progression
2. Peak distribution and effectiveness
3. Release pattern appropriateness
4. Overall audience journey quality

Return as JSON object with flow metrics.`;

    const systemPrompt = `You are a narrative flow analysis expert. Evaluate tension progression across multiple scenes for optimal dramatic impact.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 500
      });

      return JSON.parse(result || '{}');

    } catch (error) {
      return this.analyzeFlowMetricsFallback(applications, tensionBlueprint);
    }
  }

  private static async generateFlowRecommendationsAI(applications: TensionApplication[], flowMetrics: any): Promise<string[]> {
    const prompt = `Generate flow optimization recommendations:

APPLICATIONS: ${applications.length} scenes analyzed
FLOW METRICS: ${JSON.stringify(flowMetrics)}

Provide 3-5 specific recommendations for:
1. Tension progression improvements
2. Peak optimization opportunities
3. Release pattern enhancements
4. Overall flow refinements

Return as JSON array of recommendation strings.`;

    const systemPrompt = `You are a tension optimization expert. Provide actionable recommendations for improving dramatic flow and audience engagement.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 400
      });

      const recommendations = JSON.parse(result || '[]');
      return Array.isArray(recommendations) ? recommendations : [];

    } catch (error) {
      return this.generateFlowRecommendationsFallback(applications, flowMetrics);
    }
  }

  // ===== FALLBACK METHODS =====

  private static designTensionArchitectureFallback(storyContext: StoryContext): TensionArchitecture {
    return {
      overallStructure: { pattern: 'rising-action', peaks: 3, distribution: 'escalating' },
      actBreakdown: [
        { act: 1, tensionLevel: 30, pattern: 'setup' },
        { act: 2, tensionLevel: 70, pattern: 'escalation' },
        { act: 3, tensionLevel: 95, pattern: 'climax' }
      ],
      climaxDesign: { type: 'emotional-peak', intensity: 95, techniques: ['stakes-elevation', 'time-pressure'] },
      tensionCurve: { 
        points: [{ time: 0, tension: 10 }, { time: 50, tension: 70 }, { time: 90, tension: 95 }, { time: 100, tension: 20 }], 
        shape: 'exponential' 
      },
      emotionalJourney: { 
        stages: [
          { emotion: 'anticipation', duration: 'act-1' },
          { emotion: 'anxiety', duration: 'act-2' },
          { emotion: 'fear', duration: 'climax' },
          { emotion: 'relief', duration: 'resolution' }
        ]
      },
      suspenseHierarchy: { 
        levels: [
          { priority: 1, elements: ['main-conflict', 'protagonist-jeopardy'] },
          { priority: 2, elements: ['time-pressure', 'mystery-revelation'] }
        ]
      },
      releaseStrategy: { pattern: 'strategic-breaks', frequency: 'tension-dependent', methods: ['humor', 'character-moments'] }
    };
  }

  private static generateEscalationPatternsFallback(storyContext: StoryContext): EscalationPattern[] {
    return [
      {
        id: 'standard-escalation',
        name: 'Standard Escalation',
        type: 'linear-buildup',
        description: 'Gradual tension increase through stakes elevation',
        tensionIncrease: 25,
        duration: { build: 'gradual', peak: 'brief', sustain: 'moderate' },
        triggers: [{ event: 'conflict-introduction', condition: 'stakes-established', timing: 'early' }],
        techniques: [{ name: 'stakes-elevation', method: 'progressive-reveal', psychologicalBasis: 'anticipation-anxiety', effectiveness: 80 }],
        emotionalImpact: { primary: 'anxiety', secondary: ['anticipation'], intensity: 75 },
        audienceEffect: { engagement: 80, retention: 85, satisfaction: 75 },
        genreCompatibility: [storyContext.genre]
      }
    ];
  }

  private static designEmotionalPeaksFallback(storyContext: StoryContext, tensionArchitecture: TensionArchitecture): EmotionalPeak[] {
    return [
      {
        id: 'climax-peak',
        name: 'Climactic Emotional Peak',
        emotion: 'fear',
        intensity: tensionArchitecture.climaxDesign.intensity,
        buildupDuration: { buildup: 'extended', peak: 'intense', falloff: 'gradual' },
        peakMoment: { timing: 'climax', triggers: ['final-confrontation'], execution: 'dramatic' },
        falloffPattern: { type: 'gradual-decline', speed: 'moderate', destination: 30 },
        recoveryTime: { duration: 'extended', method: 'resolution-processing', newBaseline: 20 },
        audienceImpact: { immediate: ['shock', 'catharsis'], lasting: ['satisfaction'], discussion: ['emotional-journey'] },
        narrativeFunction: { purpose: 'story-climax', plotAdvancement: 100, characterImpact: 100 }
      }
    ];
  }

  private static createSuspenseElementsFallback(storyContext: StoryContext): SuspenseElement[] {
    return [
      {
        id: 'information-control',
        name: 'Information Control',
        category: 'information-withholding',
        technique: { name: 'strategic-revelation', method: 'gradual-disclosure', effectiveness: 80 },
        psychologyBasis: { principle: 'curiosity-gap', mechanism: 'information-seeking', research: 'cognitive-psychology' },
        buildupMethod: { technique: 'question-raising', duration: 'extended', intensity: 'moderate' },
        payoffStrategy: { timing: 'optimal-moment', method: 'dramatic-revelation', satisfaction: 85 },
        audienceManipulation: { techniques: ['attention-focus'], ethics: 'story-service', effectiveness: 80 },
        effectivenessRating: 80
      }
    ];
  }

  private static designReleasePatternsFallback(storyContext: StoryContext, escalationPatterns: EscalationPattern[]): ReleasePattern[] {
    return [
      {
        id: 'standard-release',
        name: 'Standard Release',
        type: 'partial-relief',
        timing: { moment: 'post-peak', duration: 'brief', context: 'natural-break' },
        method: { technique: 'character-interaction', intensity: 'moderate', audience: 'broad' },
        recoveryPhase: { duration: 'standard', activities: ['character-processing'], newBaseline: 50 },
        audienceRecalibration: { method: 'gradual-reset', time: 'brief', effectiveness: 75 },
        nextTensionSetup: { timing: 'post-recovery', type: 'situational-suspense', intensity: 60 }
      }
    ];
  }

  private static createGenreTensionAdaptationFallback(storyContext: StoryContext): GenreTensionAdaptation {
    return {
      requirements: [`${storyContext.genre}-appropriate pacing`, 'audience-expectation fulfillment'],
      adaptations: ['genre-specific escalation', 'thematic tension integration'],
      innovations: ['creative pattern synthesis']
    };
  }

  private static optimizeForAudienceFallback(storyContext: StoryContext): AudienceTensionOptimization {
    return {
      demographics: [storyContext.audience],
      preferences: ['moderate-intensity', 'character-focused'],
      strategies: ['gradual-buildup', 'emotional-investment']
    };
  }

  private static calculateTensionQualityMetricsFallback(
    tensionArchitecture: TensionArchitecture, 
    escalationPatterns: EscalationPattern[], 
    emotionalPeaks: EmotionalPeak[], 
    storyContext: StoryContext
  ): TensionQualityMetrics {
    const avgEffectiveness = escalationPatterns.reduce((sum, p) => sum + (p.audienceEffect?.engagement || 75), 0) / escalationPatterns.length;
    const maxIntensity = Math.max(...emotionalPeaks.map(p => p.intensity));
    
    return {
      effectivenessScore: Math.round(avgEffectiveness),
      audienceEngagement: Math.round(avgEffectiveness + 5),
      emotionalImpact: Math.round(maxIntensity * 0.8),
      suspenseQuality: 78,
      pacing: 75,
      overall: Math.round((avgEffectiveness + maxIntensity * 0.8 + 78 + 75) / 4)
    };
  }

  private static generateTensionBlueprintFallback(storyContext: StoryContext): TensionBlueprint {
    const tensionArchitecture = this.designTensionArchitectureFallback(storyContext);
    const escalationPatterns = this.generateEscalationPatternsFallback(storyContext);
    const emotionalPeaks = this.designEmotionalPeaksFallback(storyContext, tensionArchitecture);
    const suspenseElements = this.createSuspenseElementsFallback(storyContext);
    const releasePatterns = this.designReleasePatternsFallback(storyContext, escalationPatterns);
    const genreAdaptation = this.createGenreTensionAdaptationFallback(storyContext);
    const audienceOptimization = this.optimizeForAudienceFallback(storyContext);
    const qualityMetrics = this.calculateTensionQualityMetricsFallback(tensionArchitecture, escalationPatterns, emotionalPeaks, storyContext);

    return {
      storyContext,
      tensionArchitecture,
      escalationPatterns,
      emotionalPeaks,
      suspenseElements,
      releasePatterns,
      genreAdaptation,
      audienceOptimization,
      qualityMetrics
    };
  }

  // Scene-level fallback methods
  private static assessCurrentTensionLevelFallback(scene: any, tensionBlueprint: TensionBlueprint): number {
    return 60; // Default moderate tension level
  }

  private static identifyTensionTypeFallback(scene: any, tensionBlueprint: TensionBlueprint): TensionType {
    return 'situational-suspense';
  }

  private static calculateEscalationPotentialFallback(scene: any, tensionBlueprint: TensionBlueprint): number {
    return 70; // Default good escalation potential
  }

  private static analyzeEmotionalStateFallback(scene: any, tensionBlueprint: TensionBlueprint): EmotionalState {
    return {
      primary: 'anxiety',
      intensity: 65,
      stability: 70,
      trajectory: 'rising'
    };
  }

  private static identifySuspenseFactorsFallback(scene: any, tensionBlueprint: TensionBlueprint): SuspenseFactor[] {
    return [
      { factor: 'outcome-uncertainty', contribution: 70, manipulability: 80, audienceAwareness: 60 },
      { factor: 'character-jeopardy', contribution: 65, manipulability: 75, audienceAwareness: 70 }
    ];
  }

  private static detectReleaseOpportunitiesFallback(scene: any, tensionBlueprint: TensionBlueprint): ReleaseOpportunity[] {
    return [
      { timing: 'mid-scene', type: 'partial-relief', appropriateness: 70, impact: 'moderate-relief' }
    ];
  }

  private static predictAudienceEngagementFallback(scene: any, tensionLevel: number, tensionType: TensionType): number {
    return Math.min(90, tensionLevel + 15); // Base engagement on tension level
  }

  private static analyzeTensionFallback(scene: any, tensionBlueprint: TensionBlueprint): TensionAnalysis {
    return {
      scene,
      currentTensionLevel: this.assessCurrentTensionLevelFallback(scene, tensionBlueprint),
      tensionType: this.identifyTensionTypeFallback(scene, tensionBlueprint),
      escalationPotential: this.calculateEscalationPotentialFallback(scene, tensionBlueprint),
      emotionalState: this.analyzeEmotionalStateFallback(scene, tensionBlueprint),
      suspenseFactors: this.identifySuspenseFactorsFallback(scene, tensionBlueprint),
      releaseOpportunities: this.detectReleaseOpportunitiesFallback(scene, tensionBlueprint),
      audienceEngagement: this.predictAudienceEngagementFallback(scene, 60, 'situational-suspense')
    };
  }

  // Application fallback methods
  private static developTensionStrategyFallback(scene: any, tensionAnalysis: TensionAnalysis, tensionBlueprint: TensionBlueprint): TensionStrategy {
    return {
      approach: 'gradual-escalation',
      techniques: ['stakes-elevation', 'time-pressure'],
      timing: 'mid-scene',
      intensity: Math.min(100, tensionAnalysis.currentTensionLevel + 20)
    };
  }

  private static selectEscalationTechniquesFallback(scene: any, tensionAnalysis: TensionAnalysis, tensionBlueprint: TensionBlueprint): EscalationTechnique[] {
    return [
      { name: 'stakes-elevation', method: 'progressive-reveal', psychologicalBasis: 'investment-anxiety', effectiveness: 80 },
      { name: 'time-pressure', method: 'countdown-urgency', psychologicalBasis: 'temporal-stress', effectiveness: 75 }
    ];
  }

  private static designEmotionalManipulationFallback(scene: any, tensionAnalysis: TensionAnalysis): EmotionalManipulation {
    return {
      targetEmotion: tensionAnalysis.emotionalState.primary,
      methods: ['character-empathy', 'stakes-elevation'],
      intensity: Math.min(100, tensionAnalysis.emotionalState.intensity + 15),
      duration: 'scene-length'
    };
  }

  private static orchestrateSuspenseBuildingFallback(scene: any, tensionAnalysis: TensionAnalysis, tensionBlueprint: TensionBlueprint): SuspenseBuilding {
    return {
      techniques: ['information-withholding', 'expectation-building'],
      timing: ['gradual-reveal', 'strategic-delay'],
      payoff: 'dramatic-revelation',
      effectiveness: 75
    };
  }

  private static manageReleaseStrategyFallback(scene: any, tensionAnalysis: TensionAnalysis, tensionBlueprint: TensionBlueprint): ReleaseManagement {
    return {
      type: 'partial-relief',
      timing: 'post-peak',
      recovery: 'gradual-reset',
      nextBuildup: 'delayed-restart'
    };
  }

  private static predictTensionAudienceImpactFallback(scene: any, tensionStrategy: TensionStrategy, escalationTechniques: EscalationTechnique[]): TensionAudienceImpact {
    return {
      engagement: Math.min(95, tensionStrategy.intensity + 15),
      emotional: ['heightened-attention', 'anxiety-increase'],
      physical: ['tension-posture', 'increased-focus'],
      cognitive: ['anticipation-processing', 'outcome-speculation']
    };
  }

  private static calculateTensionEffectivenessFallback(
    tensionStrategy: TensionStrategy, 
    escalationTechniques: EscalationTechnique[], 
    suspenseBuilding: SuspenseBuilding, 
    audienceImpact: TensionAudienceImpact
  ): number {
    const avgTechEffectiveness = escalationTechniques.reduce((sum, t) => sum + t.effectiveness, 0) / escalationTechniques.length;
    return Math.round((avgTechEffectiveness + suspenseBuilding.effectiveness + audienceImpact.engagement) / 3);
  }

  private static applyTensionEscalationFallback(scene: any, tensionAnalysis: TensionAnalysis, tensionBlueprint: TensionBlueprint): TensionApplication {
    const tensionStrategy = this.developTensionStrategyFallback(scene, tensionAnalysis, tensionBlueprint);
    const escalationTechniques = this.selectEscalationTechniquesFallback(scene, tensionAnalysis, tensionBlueprint);
    const emotionalManipulation = this.designEmotionalManipulationFallback(scene, tensionAnalysis);
    const suspenseBuilding = this.orchestrateSuspenseBuildingFallback(scene, tensionAnalysis, tensionBlueprint);
    const releaseManagement = this.manageReleaseStrategyFallback(scene, tensionAnalysis, tensionBlueprint);
    const audienceImpact = this.predictTensionAudienceImpactFallback(scene, tensionStrategy, escalationTechniques);
    const effectivenessScore = this.calculateTensionEffectivenessFallback(tensionStrategy, escalationTechniques, suspenseBuilding, audienceImpact);

    return {
      scene,
      tensionStrategy,
      escalationTechniques,
      emotionalManipulation,
      suspenseBuilding,
      releaseManagement,
      audienceImpact,
      effectivenessScore
    };
  }

  // Flow optimization fallback methods
  private static analyzeFlowMetricsFallback(applications: TensionApplication[], tensionBlueprint: TensionBlueprint): any {
    const avgEffectiveness = applications.reduce((sum, app) => sum + app.effectivenessScore, 0) / applications.length;
    return {
      consistency: 75,
      progression: 80,
      peakDistribution: 70,
      overallQuality: Math.round(avgEffectiveness)
    };
  }

  private static generateFlowRecommendationsFallback(applications: TensionApplication[], flowMetrics: any): string[] {
    return [
      'Consider adding more varied tension types across scenes',
      'Optimize release timing for better audience engagement',
      'Enhance escalation techniques for stronger emotional impact'
    ];
  }

  private static optimizeTensionFlowFallback(scenes: any[], tensionBlueprint: TensionBlueprint): { 
    optimizedFlow: TensionApplication[]; 
    flowMetrics: any; 
    recommendations: string[]; 
  } {
    const applications = scenes.map(scene => {
      const analysis = this.analyzeTensionFallback(scene, tensionBlueprint);
      return this.applyTensionEscalationFallback(scene, analysis, tensionBlueprint);
    });

    const flowMetrics = this.analyzeFlowMetricsFallback(applications, tensionBlueprint);
    const recommendations = this.generateFlowRecommendationsFallback(applications, flowMetrics);

    return {
      optimizedFlow: applications,
      flowMetrics,
      recommendations
    };
  }
  
  /**
   * Helper method to convert V2.0 context to legacy StoryContext
   */
  private static convertToLegacyStoryContext(
    context: any,
    requirements: any,
    framework: TensionEngineRecommendation
  ): StoryContext {
    return {
      genre: context.genre,
      audience: context.targetAudience,
      themes: context.narrativeElements,
      structure: {
        complexity: requirements.structuralComplexity,
        medium: context.medium,
        pacing: requirements.suspenseIntensity === 'extreme' ? 'fast' :
                requirements.suspenseIntensity === 'intense' ? 'medium-fast' :
                requirements.suspenseIntensity === 'moderate' ? 'medium' : 'slow'
      }
    };
  }
  
  /**
   * Helper method to apply V2.0 framework enhancements to tension blueprint
   */
  private static applyTensionFrameworkToBlueprint(
    blueprint: TensionBlueprint,
    framework: TensionEngineRecommendation
  ): TensionBlueprint {
    // Apply framework enhancements to existing blueprint
    const enhancedBlueprint = { ...blueprint };
    
    // Add framework metadata
    (enhancedBlueprint as any).tensionFrameworkV2 = {
      frameworkVersion: 'TensionEscalationEngineV2',
      confidence: framework.primaryRecommendation.confidence,
      
      // Psychological Foundations
      psychologicalFoundations: {
        suspensePsychology: framework.primaryRecommendation.suspensePsychology,
        hitchcockDoctrine: framework.primaryRecommendation.hitchcockDoctrine,
        neuroscienceNarrative: framework.primaryRecommendation.neuroscienceNarrative,
        cognitiveLoad: framework.primaryRecommendation.cognitiveLoad,
        fearContinuum: framework.primaryRecommendation.fearContinuum
      },
      
      // Structural Architecture
      structuralArchitecture: {
        conflictArchitecture: framework.primaryRecommendation.conflictArchitecture,
        conflictStack: framework.primaryRecommendation.conflictStack,
        tensionCurve: framework.primaryRecommendation.tensionCurve,
        serializedTension: framework.primaryRecommendation.serializedTension
      },
      
      // Genre Specialization
      genreSpecialization: {
        horrorTension: framework.primaryRecommendation.horrorTension,
        thrillerTension: framework.primaryRecommendation.thrillerTension,
        dramaTension: framework.primaryRecommendation.dramaTension,
        comedyTension: framework.primaryRecommendation.comedyTension,
        actionTension: framework.primaryRecommendation.actionTension
      },
      
      // Advanced Techniques
      advancedTechniques: {
        subtextSilence: framework.primaryRecommendation.subtextSilence,
        visualTension: framework.primaryRecommendation.visualTension,
        sonicTension: framework.primaryRecommendation.sonicTension,
        falseRelease: framework.primaryRecommendation.falseRelease,
        interactiveTension: framework.primaryRecommendation.interactiveTension
      },
      
      // Strategic Guidance
      tensionStrategy: framework.tensionStrategy,
      implementationGuidance: framework.implementationGuidance,
      tensionCraft: framework.tensionCraft
    };
    
    // Enhance tension architecture with framework insights
    if (enhancedBlueprint.tensionArchitecture) {
      (enhancedBlueprint.tensionArchitecture as any).frameworkEnhancement = {
        psychologicalBasis: framework.frameworkBreakdown.psychologicalMastery,
        structuralExcellence: framework.frameworkBreakdown.structuralExcellence,
        genreMastery: framework.frameworkBreakdown.genreSpecializationMastery,
        advancedTechniques: framework.frameworkBreakdown.advancedTechniqueIntegration
      };
    }
    
    // Enhance quality metrics with framework scores
    if (enhancedBlueprint.qualityMetrics) {
      (enhancedBlueprint.qualityMetrics as any).frameworkMetrics = {
        tensionIntensity: framework.primaryRecommendation.tensionIntensity,
        suspenseEffectiveness: framework.primaryRecommendation.suspenseEffectiveness,
        audienceEngagement: framework.primaryRecommendation.audienceEngagement,
        conflictComplexity: framework.primaryRecommendation.conflictComplexity,
        genreMastery: framework.primaryRecommendation.genreMastery
      };
    }
    
    return enhancedBlueprint;
  }

  /**
   * Helper method to convert serialized context to tension escalation context
   */
  private static convertSerializedToTensionContext(
    context: any,
    requirements: any,
    continuityFramework: SerializedContinuityEngineRecommendation
  ): any {
    return {
      context: {
        projectTitle: context.seriesTitle,
        genre: context.genre,
        medium: 'television',
        targetAudience: context.targetAudience,
        narrativeElements: [
          continuityFramework.primaryRecommendation.narrativeArchitecture.serializationSpectrum,
          continuityFramework.primaryRecommendation.foundationalBlueprint.worldBuildingConsistency,
          'long-form character development'
        ],
        conflictTypes: this.getSerializedConflictTypes(context.genre, requirements.characterTensionArcs),
        tensionGoals: [
          'episodic tension management',
          'serialized continuity tension',
          'character arc tension progression',
          'cliffhanger effectiveness'
        ],
        suspenseStyle: this.getSuspenseStyleFromContinuity(requirements.suspenseComplexity, context.format)
      },
      requirements: {
        tensionObjectives: this.getTensionObjectivesFromContinuity(requirements.tensionContinuity),
        suspenseIntensity: this.mapSuspenseComplexityToIntensity(requirements.suspenseComplexity),
        audienceEngagement: requirements.audienceEngagement === 'binge-optimized' ? 'participatory' : 'active',
        psychologicalDepth: requirements.characterTensionArcs === 'transformative' ? 'deep' : 'moderate',
        emotionalRange: context.genre === 'drama' ? 'wide' : 'focused',
        narrativeComplexity: requirements.suspenseComplexity === 'layered' ? 'intricate' : 'balanced'
      },
      options: {
        hitchcockianSuspense: context.genre === 'thriller',
        neuropacingTechniques: requirements.cliffhangerStrategy === 'binge-optimized',
        psychoPhysiological: true,
        tensionArchitecture: true,
        modernApplications: context.platform === 'streaming'
      }
    };
  }

  /**
   * Helper method to get conflict types based on genre and character arcs
   */
  private static getSerializedConflictTypes(genre: string, characterArcs: string): string[] {
    const baseConflicts = {
      'drama': ['interpersonal', 'internal', 'societal'],
      'thriller': ['external', 'psychological', 'time-pressure'],
      'crime': ['investigative', 'moral', 'systemic'],
      'mystery': ['puzzle-based', 'revelation', 'misdirection'],
      'horror': ['survival', 'psychological', 'supernatural'],
      'sci-fi': ['technological', 'philosophical', 'exploration'],
      'fantasy': ['mythological', 'power-based', 'destiny']
    };

    const conflicts = baseConflicts[genre] || ['external', 'internal', 'interpersonal'];
    
    if (characterArcs === 'ensemble') {
      conflicts.push('ensemble dynamics', 'relationship tension');
    } else if (characterArcs === 'transformative') {
      conflicts.push('character evolution', 'identity crisis');
    }
    
    return conflicts;
  }

  /**
   * Helper method to get suspense style from continuity requirements
   */
  private static getSuspenseStyleFromContinuity(complexity: string, format: string): string {
    if (format === 'serialized') {
      return complexity === 'layered' ? 'novelistic long-form' : 'serialized narrative';
    } else if (format === 'episodic') {
      return 'episodic contained';
    }
    
    return 'hybrid episodic-serialized';
  }

  /**
   * Helper method to get tension objectives from continuity type
   */
  private static getTensionObjectivesFromContinuity(continuity: string): string[] {
    const objectives = {
      'episodic-reset': ['contained episode tension', 'procedural suspense', 'character moment tension'],
      'seasonal-build': ['seasonal arc tension', 'mid-season climax', 'finale escalation'],
      'series-long': ['long-term character development', 'overarching mystery', 'institutional tension'],
      'multi-layered': ['episodic satisfaction', 'seasonal progression', 'series coherence', 'character evolution']
    };
    
    return objectives[continuity] || ['balanced tension management', 'audience engagement', 'narrative momentum'];
  }

  /**
   * Helper method to map suspense complexity to intensity
   */
  private static mapSuspenseComplexityToIntensity(complexity: string): 'subtle' | 'moderate' | 'intense' | 'extreme' {
    const mapping = {
      'simple': 'subtle',
      'moderate': 'moderate',
      'complex': 'intense',
      'layered': 'extreme'
    };
    
    return mapping[complexity] || 'moderate';
  }

  /**
   * Helper method to apply Serialized Continuity + Tension V2.0 frameworks to blueprint
   */
  private static applySerializedTensionFrameworkToBlueprint(
    blueprint: TensionBlueprint,
    continuityFramework: SerializedContinuityEngineRecommendation,
    tensionFramework: TensionEngineRecommendation
  ): TensionBlueprint {
    const enhancedBlueprint = { ...blueprint };
    
    // Add Serialized Continuity + Tension V2.0 framework metadata
    (enhancedBlueprint as any).serializedTensionFrameworkV2 = {
      frameworkVersion: 'SerializedContinuityEngineV2 + TensionEscalationEngineV2',
      continuityConfidence: continuityFramework.primaryRecommendation.confidence,
      tensionConfidence: tensionFramework.primaryRecommendation.confidence,
      
      // Continuity Architecture Integration
      narrativeArchitecture: {
        serializationSpectrum: continuityFramework.primaryRecommendation.narrativeArchitecture.serializationSpectrum,
        hybridHegemony: continuityFramework.primaryRecommendation.narrativeArchitecture.hybridHegemony,
        storyArcProgression: continuityFramework.primaryRecommendation.narrativeArchitecture.storyArcProgression
      },
      
      // Character Continuity with Tension Integration
      characterTensionSystem: {
        consistencyFoundation: continuityFramework.primaryRecommendation.characterAnchorage.consistencyFoundation,
        growthParadox: continuityFramework.primaryRecommendation.characterAnchorage.growthParadox,
        tensionArcProgression: tensionFramework.primaryRecommendation.tensionArchitecture.multiFacetedApproach
      },
      
      // Episode Transition with Tension Flow
      episodeTensionTransitions: {
        microLevelFlow: continuityFramework.primaryRecommendation.coherenceTransitions.microLevelFlow,
        macroLevelBridging: continuityFramework.primaryRecommendation.coherenceTransitions.macroLevelBridging,
        cliffhangerStrategy: continuityFramework.primaryRecommendation.coherenceTransitions.cliffhangerStrategy,
        tensionModulation: tensionFramework.primaryRecommendation.emotionalOrchestration.feelingInduction
      },
      
      // Audience Psychology with Serialized Engagement
      serializedEngagement: {
        viewerInvestmentCultivation: continuityFramework.primaryRecommendation.engagementPsychology.viewerInvestmentCultivation,
        zeigarnikEffectLeverage: continuityFramework.primaryRecommendation.engagementPsychology.zeigarnikEffectLeverage,
        tensionPsychology: tensionFramework.primaryRecommendation.psychologicalMastery.neurochemicalEngineering
      },
      
      // Platform-Specific Optimization
      platformOptimization: {
        bingeModelAdaptation: continuityFramework.primaryRecommendation.platformOptimization.bingeModelAdaptation,
        socialEngagementStrategy: continuityFramework.primaryRecommendation.platformOptimization.socialEngagementStrategy,
        tensionDelivery: tensionFramework.primaryRecommendation.modernApplications.digitalEraAdaptation
      },
      
      // Strategic Integration Guidance
      continuityStrategy: continuityFramework.continuityStrategy,
      tensionStrategy: tensionFramework.tensionStrategy,
      implementationGuidance: {
        continuityElements: continuityFramework.implementationGuidance,
        tensionElements: tensionFramework.implementationGuidance
      }
    };
    
    // Enhance tension architecture with continuity considerations
    if (enhancedBlueprint.tensionArchitecture) {
      (enhancedBlueprint.tensionArchitecture as any).continuityIntegration = {
        serializedTensionFlow: continuityFramework.primaryRecommendation.narrativeTapestry.plotStructureWeaving,
        characterArcTension: continuityFramework.primaryRecommendation.characterAnchorage.growthParadox,
        episodeTransitionTension: continuityFramework.primaryRecommendation.coherenceTransitions.macroLevelBridging
      };
    }
    
    // Enhance escalation patterns with serialized considerations
    if (enhancedBlueprint.escalationPatterns) {
      enhancedBlueprint.escalationPatterns.forEach((pattern: any) => {
        pattern.serializedEnhancement = {
          continuityMaintenance: continuityFramework.primaryRecommendation.foundationalBlueprint.tonalIntegrity,
          characterGrowthIntegration: continuityFramework.primaryRecommendation.characterAnchorage.consistencyFoundation,
          audienceEngagementOptimization: continuityFramework.primaryRecommendation.engagementPsychology.emotionalJourneyManagement
        };
      });
    }
    
    // Enhance emotional peaks with serialized character development
    if (enhancedBlueprint.emotionalPeaks) {
      enhancedBlueprint.emotionalPeaks.forEach((peak: any) => {
        peak.serializedCharacterIntegration = {
          characterConsistency: continuityFramework.primaryRecommendation.characterAnchorage.consistencyFoundation,
          growthParadoxNavigation: continuityFramework.primaryRecommendation.characterAnchorage.growthParadox,
          longTermArcProgression: continuityFramework.primaryRecommendation.narrativeArchitecture.storyArcProgression
        };
      });
    }
    
    // Enhance suspense elements with continuity callbacks
    if (enhancedBlueprint.suspenseElements) {
      enhancedBlueprint.suspenseElements.forEach((element: any) => {
        element.continuityCallbacks = {
          callbackPowerSystem: continuityFramework.primaryRecommendation.narrativeTapestry.callbackPowerSystem,
          informationFlowPacing: continuityFramework.primaryRecommendation.narrativeTapestry.informationFlowPacing,
          platformOptimization: continuityFramework.primaryRecommendation.platformOptimization.bingeModelAdaptation
        };
      });
    }
    
    return enhancedBlueprint;
  }

  /**
   * Helper method to convert engagement context to tension escalation context
   */
  private static convertEngagementToTensionContext(
    context: any,
    requirements: any,
    engagementFramework: EngagementEngineRecommendation
  ): any {
    return {
      context: {
        projectTitle: context.projectTitle,
        genre: context.genre,
        medium: this.getEngagementMediumMapping(context.format),
        targetAudience: context.targetAudience,
        narrativeElements: [
          engagementFramework.primaryRecommendation.cognitiveArchitecture.attentionEngagementDistinction,
          engagementFramework.primaryRecommendation.hookMechanics.openingHookMastery,
          'neurochemical optimization'
        ],
        conflictTypes: this.getEngagementConflictTypes(context.genre, requirements.tensionEngagement),
        tensionGoals: [
          'neurochemical cocktail optimization',
          'parasocial connection building',
          'cliffhanger effectiveness',
          'retention maximization'
        ],
        suspenseStyle: this.getEngagementSuspenseStyle(requirements.retentionStrategy, context.format)
      },
      requirements: {
        tensionObjectives: this.getTensionObjectivesFromEngagement(requirements.retentionStrategy),
        suspenseIntensity: this.mapEngagementDepthToIntensity(requirements.psychologicalDepth),
        audienceEngagement: requirements.audienceCommitment === 'binge-oriented' ? 'participatory' : 'active',
        psychologicalDepth: requirements.psychologicalDepth === 'immersive' ? 'deep' : 'moderate',
        emotionalRange: this.getEmotionalRangeFromEngagement(requirements.tensionEngagement),
        narrativeComplexity: requirements.suspenseComplexity === 'transmedia' ? 'intricate' : 'balanced'
      },
      options: {
        hitchcockianSuspense: context.genre === 'thriller',
        neuropacingTechniques: requirements.retentionStrategy === 'neurochemical-optimized',
        psychoPhysiological: true,
        tensionArchitecture: true,
        modernApplications: context.format === 'streaming' || context.format === 'social-media'
      }
    };
  }

  /**
   * Helper method to get medium mapping from engagement format
   */
  private static getEngagementMediumMapping(format: string): string {
    const mapping = {
      'feature-film': 'film',
      'series': 'television',
      'short-form': 'interactive',
      'streaming': 'television',
      'social-media': 'interactive'
    };
    
    return mapping[format] || 'television';
  }

  /**
   * Helper method to get conflict types based on engagement approach
   */
  private static getEngagementConflictTypes(genre: string, engagement: string): string[] {
    const baseConflicts = this.getSerializedConflictTypes(genre, 'moderate');
    
    const engagementConflicts = {
      'attention-grabbing': ['sensory', 'immediate', 'visceral'],
      'emotion-laden': ['empathetic', 'psychological', 'relational'],
      'curiosity-driven': ['mystery', 'information-gap', 'revelation'],
      'parasocial-building': ['character-intimate', 'vulnerability', 'trust-building']
    };
    
    return [...baseConflicts, ...(engagementConflicts[engagement] || [])];
  }

  /**
   * Helper method to get suspense style from engagement strategy
   */
  private static getEngagementSuspenseStyle(strategy: string, format: string): string {
    if (format === 'short-form' || format === 'social-media') {
      return strategy === 'hook-focused' ? 'rapid-fire engagement' : 'compressed suspense';
    }
    
    const styles = {
      'hook-focused': 'immediate attention capture',
      'cliffhanger-driven': 'anticipation-based suspense',
      'character-based': 'empathy-driven tension',
      'neurochemical-optimized': 'biological response engineering'
    };
    
    return styles[strategy] || 'engagement-optimized suspense';
  }

  /**
   * Helper method to get tension objectives from engagement strategy
   */
  private static getTensionObjectivesFromEngagement(strategy: string): string[] {
    const objectives = {
      'hook-focused': ['immediate attention capture', 'thumb-stopping effectiveness', 'rapid engagement'],
      'cliffhanger-driven': ['anticipation building', 'Zeigarnik effect leverage', 'return compulsion'],
      'character-based': ['parasocial relationship building', 'empathy activation', 'character investment'],
      'neurochemical-optimized': ['dopamine optimization', 'oxytocin generation', 'cortisol management', 'endorphin release']
    };
    
    return objectives[strategy] || ['audience engagement', 'retention optimization', 'emotional investment'];
  }

  /**
   * Helper method to map engagement depth to suspense intensity
   */
  private static mapEngagementDepthToIntensity(depth: string): 'subtle' | 'moderate' | 'intense' | 'extreme' {
    const mapping = {
      'surface': 'subtle',
      'moderate': 'moderate',
      'deep': 'intense',
      'immersive': 'extreme'
    };
    
    return mapping[depth] || 'moderate';
  }

  /**
   * Helper method to get emotional range from engagement approach
   */
  private static getEmotionalRangeFromEngagement(engagement: string): string {
    const ranges = {
      'attention-grabbing': 'focused',
      'emotion-laden': 'wide',
      'curiosity-driven': 'focused',
      'parasocial-building': 'wide'
    };
    
    return ranges[engagement] || 'balanced';
  }

  /**
   * Helper method to apply Engagement + Tension V2.0 frameworks to blueprint
   */
  private static applyEngagementTensionFrameworkToBlueprint(
    blueprint: TensionBlueprint,
    engagementFramework: EngagementEngineRecommendation,
    tensionFramework: TensionEngineRecommendation
  ): TensionBlueprint {
    const enhancedBlueprint = { ...blueprint };
    
    // Add Engagement + Tension V2.0 framework metadata
    (enhancedBlueprint as any).engagementTensionFrameworkV2 = {
      frameworkVersion: 'EngagementEngineV2 + TensionEscalationEngineV2',
      engagementConfidence: engagementFramework.primaryRecommendation.confidence,
      tensionConfidence: tensionFramework.primaryRecommendation.confidence,
      
      // Cognitive Architecture Integration
      cognitiveArchitecture: {
        attentionEngagementDistinction: engagementFramework.primaryRecommendation.cognitiveArchitecture.attentionEngagementDistinction,
        neurochemicalCocktail: engagementFramework.primaryRecommendation.cognitiveArchitecture.neurochemicalCocktail,
        incompletionPsychology: engagementFramework.primaryRecommendation.cognitiveArchitecture.incompletionPsychology,
        parasocialConnection: engagementFramework.primaryRecommendation.cognitiveArchitecture.parasocialConnection
      },
      
      // Hook Mechanics with Tension Integration
      hookTensionSystem: {
        openingHookMastery: engagementFramework.primaryRecommendation.hookMechanics.openingHookMastery,
        plotVsCharacterHooks: engagementFramework.primaryRecommendation.hookMechanics.plotVsCharacterHooks,
        hookLayeringFramework: engagementFramework.primaryRecommendation.hookMechanics.hookLayeringFramework,
        tensionArchitecture: tensionFramework.primaryRecommendation.tensionArchitecture.multiFacetedApproach
      },
      
      // Cliffhanger Architecture with Engagement Psychology
      cliffhangerEngagementSystem: {
        suspenseAnatomy: engagementFramework.primaryRecommendation.cliffhangerArchitecture.suspenseAnatomy,
        cliffhangerTaxonomy: engagementFramework.primaryRecommendation.cliffhangerArchitecture.cliffhangerTaxonomy,
        advancedConstruction: engagementFramework.primaryRecommendation.cliffhangerArchitecture.advancedConstruction,
        tensionEscalation: tensionFramework.primaryRecommendation.emotionalOrchestration.feelingInduction
      },
      
      // Genre-Specific Engagement with Tension Optimization
      genreEngagementFrameworks: {
        genreSpecificEngagement: engagementFramework.primaryRecommendation.genreFrameworks,
        tensionGenreAdaptation: tensionFramework.primaryRecommendation.genreMastery
      },
      
      // Format Optimization with Psychological Targeting
      formatPsychologyOptimization: {
        shortFormImperative: engagementFramework.primaryRecommendation.formatOptimization.shortFormImperative,
        bingeWatchingDesign: engagementFramework.primaryRecommendation.formatOptimization.bingeWatchingDesign,
        transmediaEngagement: engagementFramework.primaryRecommendation.formatOptimization.transmediaEngagement,
        modernApplications: tensionFramework.primaryRecommendation.modernApplications.digitalEraAdaptation
      },
      
      // Quality Ethics with Trust Economy
      trustQualitySystem: {
        trustEconomy: engagementFramework.primaryRecommendation.qualityEthics.trustEconomy,
        fatiguePrevention: engagementFramework.primaryRecommendation.qualityEthics.fatiguePrevention,
        culturalConsiderations: engagementFramework.primaryRecommendation.qualityEthics.culturalConsiderations
      },
      
      // Strategic Integration Guidance
      engagementStrategy: engagementFramework.engagementStrategy,
      tensionStrategy: tensionFramework.tensionStrategy,
      implementationGuidance: {
        engagementElements: engagementFramework.implementationGuidance,
        tensionElements: tensionFramework.implementationGuidance
      }
    };
    
    // Enhance tension architecture with engagement optimization
    if (enhancedBlueprint.tensionArchitecture) {
      (enhancedBlueprint.tensionArchitecture as any).engagementOptimization = {
        neurochemicalTargeting: engagementFramework.primaryRecommendation.cognitiveArchitecture.neurochemicalCocktail,
        parasocialIntegration: engagementFramework.primaryRecommendation.cognitiveArchitecture.parasocialConnection,
        hookTensionSynergy: engagementFramework.primaryRecommendation.hookMechanics.hookLayeringFramework
      };
    }
    
    // Enhance escalation patterns with engagement psychology
    if (enhancedBlueprint.escalationPatterns) {
      enhancedBlueprint.escalationPatterns.forEach((pattern: any) => {
        pattern.engagementEnhancement = {
          attentionEngagementIntegration: engagementFramework.primaryRecommendation.cognitiveArchitecture.attentionEngagementDistinction,
          incompletionPsychology: engagementFramework.primaryRecommendation.cognitiveArchitecture.incompletionPsychology,
          neurochemicalOptimization: engagementFramework.primaryRecommendation.cognitiveArchitecture.neurochemicalCocktail
        };
      });
    }
    
    // Enhance emotional peaks with engagement frameworks
    if (enhancedBlueprint.emotionalPeaks) {
      enhancedBlueprint.emotionalPeaks.forEach((peak: any) => {
        peak.engagementPsychology = {
          hookMechanics: engagementFramework.primaryRecommendation.hookMechanics.plotVsCharacterHooks,
          cliffhangerArchitecture: engagementFramework.primaryRecommendation.cliffhangerArchitecture.cliffhangerTaxonomy,
          genreEngagement: engagementFramework.primaryRecommendation.genreFrameworks
        };
      });
    }
    
    // Enhance suspense elements with engagement optimization
    if (enhancedBlueprint.suspenseElements) {
      enhancedBlueprint.suspenseElements.forEach((element: any) => {
        element.engagementOptimization = {
          payoffTiming: engagementFramework.primaryRecommendation.hookMechanics.payoffTiming,
          formatOptimization: engagementFramework.primaryRecommendation.formatOptimization,
          trustEconomy: engagementFramework.primaryRecommendation.qualityEthics.trustEconomy
        };
      });
    }
    
    return enhancedBlueprint;
  }
} 