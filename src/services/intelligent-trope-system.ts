import { generateContent } from './azure-openai';

/**
 * Intelligent Trope System - AI-Powered Narrative Pattern Mastery
 * 
 * The Intelligent Trope System represents the pinnacle of narrative pattern recognition and creative subversion.
 * This engine uses advanced AI to identify story tropes, analyze their effectiveness, and creatively subvert
 * expectations while maintaining narrative coherence. It ensures stories feel both familiar and surprisingly fresh.
 * 
 * Core Capabilities:
 * - AI-powered trope identification and classification
 * - Intelligent trope subversion and innovation
 * - Genre-specific trope adaptation and evolution
 * - Audience expectation management through strategic trope deployment
 * - Creative pattern synthesis for unique storytelling
 * 
 * Based on narrative theory principles of pattern recognition, audience psychology, and creative innovation.
 */

// ===== CORE INTERFACES =====

export interface TropeIdentification {
  id: string;
  name: string;
  category: TropeCategory;
  description: string;
  examples: string[];
  frequency: 'common' | 'uncommon' | 'rare' | 'overused';
  effectiveness: number; // 0-100
  genreCompatibility: string[];
  audienceExpectations: AudienceExpectation[];
  subversionPotential: number; // 0-100
  innovationOpportunities: string[];
}

export interface TropeSubversion {
  originalTrope: TropeIdentification;
  subversionMethod: SubversionMethod;
  subversionDescription: string;
  expectedOutcome: string;
  audienceImpact: AudienceImpact;
  narrativeIntegration: NarrativeIntegration;
  riskLevel: 'low' | 'medium' | 'high';
  innovationScore: number; // 0-100
}

export interface TropeBlueprint {
  storyContext: StoryContext;
  identifiedTropes: TropeIdentification[];
  recommendedSubversions: TropeSubversion[];
  tropeArchitecture: TropeArchitecture;
  innovationStrategy: InnovationStrategy;
  audienceManagement: AudienceManagement;
  genreAdaptation: GenreAdaptation;
  qualityMetrics: TropeQualityMetrics;
}

export interface TropeApplication {
  scene: any; // Scene context
  applicableTropes: TropeIdentification[];
  selectedTrope: TropeIdentification;
  subversionApplied: TropeSubversion | null;
  executionDetails: ExecutionDetails;
  audienceEffect: AudienceEffect;
  narrativeHarmony: NarrativeHarmony;
}

// ===== SUPPORTING INTERFACES =====

export type TropeCategory = 
  | 'character-archetype' 
  | 'plot-device' 
  | 'setting-element' 
  | 'dialogue-pattern' 
  | 'conflict-structure' 
  | 'relationship-dynamic' 
  | 'story-resolution' 
  | 'world-building' 
  | 'genre-convention' 
  | 'narrative-technique';

export type SubversionMethod = 
  | 'expectation-reversal' 
  | 'context-reframing' 
  | 'character-depth' 
  | 'modern-adaptation' 
  | 'genre-blending' 
  | 'meta-commentary' 
  | 'cultural-update' 
  | 'psychological-complexity' 
  | 'structural-innovation' 
  | 'thematic-evolution';

export interface AudienceExpectation {
  demographic: string;
  expectation: string;
  satisfaction: number; // 0-100
  surprise: number; // 0-100
}

export interface AudienceImpact {
  emotionalResponse: string[];
  engagementLevel: number; // 0-100
  memoryRetention: number; // 0-100
  discussionPotential: number; // 0-100
}

export interface NarrativeIntegration {
  plotRelevance: number; // 0-100
  characterDevelopment: number; // 0-100
  themeReinforcement: number; // 0-100
  pacingImpact: string;
}

export interface StoryContext {
  genre: string;
  subgenres: string[];
  targetAudience: string;
  mood: string;
  themes: string[];
  premise: any;
  characters: any[];
  plotStructure: any;
}

export interface TropeArchitecture {
  foundationalTropes: TropeIdentification[];
  supportingTropes: TropeIdentification[];
  subversionPoints: SubversionPoint[];
  innovationAreas: InnovationArea[];
  harmonyRules: HarmonyRule[];
}

export interface InnovationStrategy {
  primaryInnovations: Innovation[];
  secondaryAdaptations: Adaptation[];
  riskMitigation: RiskMitigation[];
  audienceTesting: AudienceTest[];
  creativeGoals: CreativeGoal[];
}

export interface AudienceManagement {
  expectationSetting: ExpectationSetting[];
  surpriseManagement: SurpriseManagement[];
  familiarityBalance: FamiliarityBalance;
  engagementStrategy: EngagementStrategy;
}

export interface GenreAdaptation {
  genreRequirements: GenreRequirement[];
  adaptationMethods: AdaptationMethod[];
  conventionHandling: ConventionHandling[];
  innovationOpportunities: GenreInnovation[];
}

export interface TropeQualityMetrics {
  originalityScore: number; // 0-100
  effectivenessScore: number; // 0-100
  audienceResonance: number; // 0-100
  narrativeCoherence: number; // 0-100
  innovationLevel: number; // 0-100
  overallQuality: number; // 0-100
}

// Basic supporting interfaces (simplified for initial implementation)
export interface SubversionPoint { point: string; method: SubversionMethod; impact: number; }
export interface InnovationArea { area: string; potential: number; methods: string[]; }
export interface HarmonyRule { rule: string; importance: number; application: string; }
export interface Innovation { type: string; description: string; impact: number; risk: number; }
export interface Adaptation { element: string; method: string; rationale: string; }
export interface RiskMitigation { risk: string; mitigation: string; effectiveness: number; }
export interface AudienceTest { method: string; criteria: string[]; success: string; }
export interface CreativeGoal { goal: string; priority: number; measurement: string; }
export interface ExpectationSetting { method: string; timeline: string; effectiveness: number; }
export interface SurpriseManagement { timing: string; intensity: number; recovery: string; }
export interface FamiliarityBalance { familiar: number; novel: number; strategy: string; }
export interface EngagementStrategy { tactics: string[]; timing: string[]; measures: string[]; }
export interface GenreRequirement { requirement: string; flexibility: number; adaptation: string; }
export interface AdaptationMethod { method: string; application: string; effectiveness: number; }
export interface ConventionHandling { convention: string; approach: string; justification: string; }
export interface GenreInnovation { innovation: string; feasibility: number; impact: number; }
export interface ExecutionDetails { implementation: string[]; timing: string; integration: string; }
export interface AudienceEffect { immediate: string[]; longTerm: string[]; discussion: string[]; }
export interface NarrativeHarmony { plotHarmony: number; characterHarmony: number; themeHarmony: number; }

/**
 * Intelligent Trope System - AI-Enhanced Narrative Pattern Engine
 * 
 * This system revolutionizes storytelling by intelligently managing narrative tropes:
 * - Identifies and analyzes story patterns with AI precision
 * - Creatively subverts expectations while maintaining narrative integrity  
 * - Innovates new trope combinations for unique storytelling
 * - Balances familiarity with surprise for optimal audience engagement
 */
export class IntelligentTropeSystem {

  // ===== CORE TROPE GENERATION METHODS =====

  /**
   * Generates a comprehensive trope analysis and management blueprint for any story
   */
  static async generateTropeBlueprint(storyContext: StoryContext): Promise<TropeBlueprint> {
    try {
      // AI-powered trope identification
      const identifiedTropes = await this.identifyStoryTropesAI(storyContext);
      
      // AI-driven subversion recommendations
      const recommendedSubversions = await this.generateTropeSubversionsAI(identifiedTropes, storyContext);
      
      // AI-created trope architecture
      const tropeArchitecture = await this.designTropeArchitectureAI(identifiedTropes, storyContext);
      
      // AI-developed innovation strategy
      const innovationStrategy = await this.createInnovationStrategyAI(storyContext, identifiedTropes);
      
      // AI-optimized audience management
      const audienceManagement = await this.designAudienceManagementAI(storyContext, identifiedTropes);
      
      // AI-tailored genre adaptation
      const genreAdaptation = await this.createGenreAdaptationAI(storyContext, identifiedTropes);
      
      // AI-calculated quality metrics
      const qualityMetrics = await this.calculateTropeQualityMetricsAI(identifiedTropes, recommendedSubversions, storyContext);

      return {
        storyContext,
        identifiedTropes,
        recommendedSubversions,
        tropeArchitecture,
        innovationStrategy,
        audienceManagement,
        genreAdaptation,
        qualityMetrics
      };

    } catch (error) {
      console.error('AI trope blueprint generation failed:', error);
      return this.generateTropeBlueprintFallback(storyContext);
    }
  }

  /**
   * Applies intelligent trope management to a specific scene
   */
  static async generateTropeApplication(scene: any, tropeBlueprint: TropeBlueprint): Promise<TropeApplication> {
    try {
      // AI-powered scene trope analysis
      const applicableTropes = await this.identifySceneTropesAI(scene, tropeBlueprint);
      
      // AI-selected optimal trope
      const selectedTrope = await this.selectOptimalTropeAI(applicableTropes, scene, tropeBlueprint);
      
      // AI-determined subversion application
      const subversionApplied = await this.applyTropeSubversionAI(selectedTrope, scene, tropeBlueprint);
      
      // AI-created execution details
      const executionDetails = await this.generateExecutionDetailsAI(selectedTrope, subversionApplied, scene);
      
      // AI-predicted audience effect
      const audienceEffect = await this.predictAudienceEffectAI(selectedTrope, subversionApplied, scene);
      
      // AI-evaluated narrative harmony
      const narrativeHarmony = await this.evaluateNarrativeHarmonyAI(selectedTrope, subversionApplied, scene, tropeBlueprint);
    
    return {
        scene,
        applicableTropes,
        selectedTrope,
        subversionApplied,
        executionDetails,
        audienceEffect,
        narrativeHarmony
      };

    } catch (error) {
      console.error('AI trope application failed:', error);
      return this.generateTropeApplicationFallback(scene, tropeBlueprint);
    }
  }

  /**
   * Creates innovative trope combinations and new narrative patterns
   */
  static async generateTropeInnovation(storyContext: StoryContext, existingTropes: TropeIdentification[]): Promise<Innovation[]> {
    try {
      const innovations = await this.createTropeInnovationsAI(storyContext, existingTropes);
      return innovations;
    } catch (error) {
      console.error('AI trope innovation failed:', error);
      return this.generateTropeInnovationFallback(storyContext, existingTropes);
    }
  }

  // ===== AI-POWERED CORE METHODS =====

  private static async identifyStoryTropesAI(storyContext: StoryContext): Promise<TropeIdentification[]> {
    const prompt = `Analyze this story context and identify all applicable narrative tropes:

STORY CONTEXT:
- Genre: ${storyContext.genre}
- Subgenres: ${storyContext.subgenres.join(', ')}
- Target Audience: ${storyContext.targetAudience}
- Mood: ${storyContext.mood}
- Themes: ${storyContext.themes.join(', ')}
- Premise: ${JSON.stringify(storyContext.premise)}
- Characters: ${JSON.stringify(storyContext.characters)}

For each identified trope, provide:
1. Unique ID and clear name
2. Category (character-archetype, plot-device, etc.)
3. Detailed description
4. Real-world examples
5. Frequency assessment (common/uncommon/rare/overused)
6. Effectiveness score (0-100)
7. Genre compatibility
8. Audience expectations
9. Subversion potential (0-100)
10. Innovation opportunities

Return as JSON array of trope objects.`;

    const systemPrompt = `You are a master narrative analyst specializing in trope identification and storytelling patterns. You have encyclopedic knowledge of narrative conventions across all genres and cultures. Identify tropes with precision and provide comprehensive analysis for each.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 2000
      });

      const tropeData = JSON.parse(result || '[]');
      return tropeData.map((trope: any) => ({
        id: trope.id || `trope-${Date.now()}-${Math.random()}`,
        name: trope.name || 'Unknown Trope',
        category: trope.category || 'narrative-technique',
        description: trope.description || 'Standard narrative pattern',
        examples: trope.examples || [],
        frequency: trope.frequency || 'common',
        effectiveness: trope.effectiveness || 70,
        genreCompatibility: trope.genreCompatibility || [storyContext.genre],
        audienceExpectations: trope.audienceExpectations || [],
        subversionPotential: trope.subversionPotential || 50,
        innovationOpportunities: trope.innovationOpportunities || []
      }));

    } catch (error) {
      return this.identifyStoryTropesFallback(storyContext);
    }
  }

  private static async generateTropeSubversionsAI(tropes: TropeIdentification[], storyContext: StoryContext): Promise<TropeSubversion[]> {
    const prompt = `Create intelligent subversions for these narrative tropes:

TROPES TO SUBVERT:
${tropes.map(trope => `- ${trope.name}: ${trope.description} (Subversion Potential: ${trope.subversionPotential})`).join('\n')}

STORY CONTEXT:
- Genre: ${storyContext.genre}
- Target Audience: ${storyContext.targetAudience}
- Themes: ${storyContext.themes.join(', ')}

For each trope with high subversion potential (>60), create a subversion that:
1. Maintains narrative coherence
2. Serves the story's themes
3. Surprises without confusing the audience
4. Adds depth rather than shock value
5. Respects the genre while innovating

Include subversion method, description, expected outcome, audience impact, and risk assessment.

Return as JSON array of subversion objects.`;

    const systemPrompt = `You are a creative writing expert specializing in narrative subversion and audience psychology. You understand how to twist familiar patterns in ways that enhance rather than undermine storytelling effectiveness.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.6,
        maxTokens: 1500
      });

      const subversionData = JSON.parse(result || '[]');
      return subversionData.map((sub: any) => ({
        originalTrope: tropes.find(t => t.name === sub.tropeName) || tropes[0],
        subversionMethod: sub.subversionMethod || 'expectation-reversal',
        subversionDescription: sub.subversionDescription || 'Standard subversion approach',
        expectedOutcome: sub.expectedOutcome || 'Enhanced narrative depth',
        audienceImpact: sub.audienceImpact || { emotionalResponse: [], engagementLevel: 75, memoryRetention: 70, discussionPotential: 65 },
        narrativeIntegration: sub.narrativeIntegration || { plotRelevance: 80, characterDevelopment: 75, themeReinforcement: 70, pacingImpact: 'neutral' },
        riskLevel: sub.riskLevel || 'medium',
        innovationScore: sub.innovationScore || 70
      }));

    } catch (error) {
      return this.generateTropeSubversionsFallback(tropes, storyContext);
    }
  }

  private static async designTropeArchitectureAI(tropes: TropeIdentification[], storyContext: StoryContext): Promise<TropeArchitecture> {
    const prompt = `Design a comprehensive trope architecture for this story:

AVAILABLE TROPES:
${tropes.map(trope => `- ${trope.name} (${trope.category}, Effectiveness: ${trope.effectiveness})`).join('\n')}

STORY CONTEXT:
- Genre: ${storyContext.genre}
- Structure: ${JSON.stringify(storyContext.plotStructure)}

Create an architecture that:
1. Identifies foundational tropes (core to the story's identity)
2. Selects supporting tropes (enhance specific elements)
3. Maps subversion points (optimal moments for expectation management)
4. Defines innovation areas (opportunities for creative pattern synthesis)
5. Establishes harmony rules (guidelines for maintaining narrative cohesion)

Return as JSON object with structured trope architecture.`;

    const systemPrompt = `You are a narrative architect specializing in story structure and pattern organization. You understand how to layer tropes for maximum storytelling impact while maintaining coherence.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 1200
      });

      const archData = JSON.parse(result || '{}');
    return {
        foundationalTropes: archData.foundationalTropes || tropes.slice(0, 3),
        supportingTropes: archData.supportingTropes || tropes.slice(3),
        subversionPoints: archData.subversionPoints || [],
        innovationAreas: archData.innovationAreas || [],
        harmonyRules: archData.harmonyRules || []
      };

    } catch (error) {
      return this.designTropeArchitectureFallback(tropes, storyContext);
    }
  }

  private static async createInnovationStrategyAI(storyContext: StoryContext, tropes: TropeIdentification[]): Promise<InnovationStrategy> {
    const prompt = `Develop an innovation strategy for this story's trope usage:

STORY CONTEXT:
- Genre: ${storyContext.genre}
- Themes: ${storyContext.themes.join(', ')}
- Target Audience: ${storyContext.targetAudience}

AVAILABLE TROPES:
${tropes.map(trope => `- ${trope.name}: ${trope.innovationOpportunities.join(', ')}`).join('\n')}

Create a strategy that includes:
1. Primary innovations (major creative departures)
2. Secondary adaptations (subtle enhancements)
3. Risk mitigation (safeguards for experimental elements)
4. Audience testing (validation methods)
5. Creative goals (specific innovation objectives)

Balance creativity with commercial viability and audience acceptance.

Return as JSON object with complete innovation strategy.`;

    const systemPrompt = `You are a creative strategist specializing in narrative innovation and audience psychology. You balance artistic vision with commercial success and understand how to push boundaries responsibly.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.5,
        maxTokens: 1000
      });

      const strategyData = JSON.parse(result || '{}');
    return {
        primaryInnovations: strategyData.primaryInnovations || [],
        secondaryAdaptations: strategyData.secondaryAdaptations || [],
        riskMitigation: strategyData.riskMitigation || [],
        audienceTesting: strategyData.audienceTesting || [],
        creativeGoals: strategyData.creativeGoals || []
      };

    } catch (error) {
      return this.createInnovationStrategyFallback(storyContext, tropes);
    }
  }

  private static async designAudienceManagementAI(storyContext: StoryContext, tropes: TropeIdentification[]): Promise<AudienceManagement> {
    const prompt = `Design audience expectation management for this story:

TARGET AUDIENCE: ${storyContext.targetAudience}
GENRE EXPECTATIONS: ${storyContext.genre}
TROPE FAMILIARITY: ${tropes.map(t => `${t.name} (${t.frequency})`).join(', ')}

Create a management strategy that:
1. Sets appropriate expectations early
2. Manages surprise delivery timing
3. Balances familiar vs novel elements
4. Maintains optimal engagement throughout

Consider audience sophistication, genre knowledge, and emotional journey.

Return as JSON object with comprehensive audience management plan.`;

    const systemPrompt = `You are an audience psychology expert specializing in expectation management and engagement optimization. You understand how different demographics respond to familiar and subversive narrative elements.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 800
      });

      const managementData = JSON.parse(result || '{}');
      return {
        expectationSetting: managementData.expectationSetting || [],
        surpriseManagement: managementData.surpriseManagement || [],
        familiarityBalance: managementData.familiarityBalance || { familiar: 60, novel: 40, strategy: 'balanced' },
        engagementStrategy: managementData.engagementStrategy || { tactics: [], timing: [], measures: [] }
      };

    } catch (error) {
      return this.designAudienceManagementFallback(storyContext, tropes);
    }
  }

  private static async createGenreAdaptationAI(storyContext: StoryContext, tropes: TropeIdentification[]): Promise<GenreAdaptation> {
    const prompt = `Create genre-specific trope adaptation for this story:

PRIMARY GENRE: ${storyContext.genre}
SUBGENRES: ${storyContext.subgenres.join(', ')}
TROPES: ${tropes.map(t => `${t.name} (Compatibility: ${t.genreCompatibility.join(', ')})`).join('\n')}

Develop adaptations that:
1. Honor genre requirements and conventions
2. Adapt tropes to fit genre expectations
3. Handle convention violations gracefully
4. Identify innovation opportunities within genre constraints

Return as JSON object with genre adaptation plan.`;

    const systemPrompt = `You are a genre expert with deep knowledge of conventions, expectations, and innovation opportunities across all story genres. You understand how to adapt universal tropes to specific genre contexts.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 800
      });

      const adaptationData = JSON.parse(result || '{}');
    return {
        genreRequirements: adaptationData.genreRequirements || [],
        adaptationMethods: adaptationData.adaptationMethods || [],
        conventionHandling: adaptationData.conventionHandling || [],
        innovationOpportunities: adaptationData.innovationOpportunities || []
      };

    } catch (error) {
      return this.createGenreAdaptationFallback(storyContext, tropes);
    }
  }

  private static async calculateTropeQualityMetricsAI(tropes: TropeIdentification[], subversions: TropeSubversion[], storyContext: StoryContext): Promise<TropeQualityMetrics> {
    const prompt = `Calculate quality metrics for this trope implementation:

TROPES: ${tropes.length} identified (${tropes.filter(t => t.effectiveness > 80).length} high-effectiveness)
SUBVERSIONS: ${subversions.length} planned (${subversions.filter(s => s.innovationScore > 70).length} high-innovation)
GENRE: ${storyContext.genre}
AUDIENCE: ${storyContext.targetAudience}

Evaluate:
1. Originality Score (0-100): How unique is this trope combination?
2. Effectiveness Score (0-100): How well do tropes serve the story?
3. Audience Resonance (0-100): How well will audience respond?
4. Narrative Coherence (0-100): How well do elements fit together?
5. Innovation Level (0-100): How creative and fresh is the approach?
6. Overall Quality (0-100): Composite assessment

Return as JSON object with numerical scores and brief justifications.`;

    const systemPrompt = `You are a narrative quality assessor with expertise in trope effectiveness, audience psychology, and storytelling excellence. Provide balanced, objective evaluations.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.2,
        maxTokens: 500
      });

      const metricsData = JSON.parse(result || '{}');
      return {
        originalityScore: metricsData.originalityScore || 70,
        effectivenessScore: metricsData.effectivenessScore || 75,
        audienceResonance: metricsData.audienceResonance || 73,
        narrativeCoherence: metricsData.narrativeCoherence || 78,
        innovationLevel: metricsData.innovationLevel || 65,
        overallQuality: metricsData.overallQuality || 72
      };

    } catch (error) {
      return this.calculateTropeQualityMetricsFallback(tropes, subversions, storyContext);
    }
  }

  // ===== SCENE-LEVEL AI METHODS =====

  private static async identifySceneTropesAI(scene: any, tropeBlueprint: TropeBlueprint): Promise<TropeIdentification[]> {
    const prompt = `Identify which tropes from the story blueprint apply to this specific scene:

SCENE CONTEXT:
${JSON.stringify(scene)}

AVAILABLE TROPES:
${tropeBlueprint.identifiedTropes.map(t => `- ${t.name}: ${t.description}`).join('\n')}

Return the most relevant tropes for this scene as JSON array.`;

    const systemPrompt = `You are a scene analysis expert. Identify which narrative tropes are most applicable and effective for specific scene contexts.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 600
      });

      const sceneData = JSON.parse(result || '[]');
      return tropeBlueprint.identifiedTropes.filter(trope => 
        sceneData.some((st: any) => st.name === trope.name)
      );

    } catch (error) {
      return this.identifySceneTropesFallback(scene, tropeBlueprint);
    }
  }

  private static async selectOptimalTropeAI(applicableTropes: TropeIdentification[], scene: any, tropeBlueprint: TropeBlueprint): Promise<TropeIdentification> {
    const prompt = `Select the optimal trope for this scene:

SCENE: ${JSON.stringify(scene)}
APPLICABLE TROPES: ${applicableTropes.map(t => `${t.name} (Effectiveness: ${t.effectiveness})`).join(', ')}

Choose the trope that best serves:
1. Scene objectives
2. Character development
3. Plot advancement
4. Thematic reinforcement
5. Audience engagement

Return the selected trope name.`;

    const systemPrompt = `You are a scene optimization expert. Select tropes that maximize narrative impact and story effectiveness.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 200
      });

      const selectedName = result?.trim();
      return applicableTropes.find(t => t.name === selectedName) || applicableTropes[0];

    } catch (error) {
      return this.selectOptimalTropeFallback(applicableTropes, scene, tropeBlueprint);
    }
  }

  private static async applyTropeSubversionAI(selectedTrope: TropeIdentification, scene: any, tropeBlueprint: TropeBlueprint): Promise<TropeSubversion | null> {
    const availableSubversions = tropeBlueprint.recommendedSubversions.filter(s => s.originalTrope.id === selectedTrope.id);
    
    if (availableSubversions.length === 0) return null;

    const prompt = `Determine if a trope subversion should be applied in this scene:

SCENE: ${JSON.stringify(scene)}
TROPE: ${selectedTrope.name}
AVAILABLE SUBVERSIONS: ${availableSubversions.map(s => s.subversionDescription).join(', ')}

Consider:
1. Scene timing and context
2. Audience readiness for subversion
3. Narrative impact
4. Story pacing requirements

Return "apply" with subversion details or "skip" with reasoning.`;

    const systemPrompt = `You are a narrative timing expert. Determine optimal moments for trope subversion to maximize storytelling impact.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 300
      });

      if (result?.toLowerCase().includes('apply')) {
        return availableSubversions[0];
      }
      return null;

    } catch (error) {
      return this.applyTropeSubversionFallback(selectedTrope, scene, tropeBlueprint);
    }
  }

  private static async generateExecutionDetailsAI(selectedTrope: TropeIdentification, subversion: TropeSubversion | null, scene: any): Promise<ExecutionDetails> {
    const prompt = `Generate execution details for implementing this trope in the scene:

TROPE: ${selectedTrope.name} - ${selectedTrope.description}
SUBVERSION: ${subversion ? subversion.subversionDescription : 'None'}
SCENE: ${JSON.stringify(scene)}

Provide:
1. Specific implementation steps
2. Timing within the scene
3. Integration with existing scene elements

Return as JSON object with implementation details.`;

    const systemPrompt = `You are a scene implementation expert. Provide practical, actionable steps for trope execution within specific scene contexts.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 400
      });

      const execData = JSON.parse(result || '{}');
      return {
        implementation: execData.implementation || ['Apply trope according to category guidelines'],
        timing: execData.timing || 'mid-scene',
        integration: execData.integration || 'natural'
      };

    } catch (error) {
      return this.generateExecutionDetailsFallback(selectedTrope, subversion, scene);
    }
  }

  private static async predictAudienceEffectAI(selectedTrope: TropeIdentification, subversion: TropeSubversion | null, scene: any): Promise<AudienceEffect> {
    const prompt = `Predict audience response to this trope implementation:

TROPE: ${selectedTrope.name}
SUBVERSION: ${subversion ? 'Yes - ' + subversion.subversionMethod : 'No'}
SCENE CONTEXT: ${JSON.stringify(scene)}

Predict:
1. Immediate emotional responses
2. Long-term impact on story perception
3. Discussion and analysis potential

Return as JSON object with audience effect predictions.`;

    const systemPrompt = `You are an audience psychology expert. Predict how different trope implementations will affect viewer engagement and response.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 400
      });

      const effectData = JSON.parse(result || '{}');
    return {
        immediate: effectData.immediate || ['engagement'],
        longTerm: effectData.longTerm || ['satisfaction'],
        discussion: effectData.discussion || ['moderate']
      };

    } catch (error) {
      return this.predictAudienceEffectFallback(selectedTrope, subversion, scene);
    }
  }

  private static async evaluateNarrativeHarmonyAI(selectedTrope: TropeIdentification, subversion: TropeSubversion | null, scene: any, tropeBlueprint: TropeBlueprint): Promise<NarrativeHarmony> {
    const prompt = `Evaluate narrative harmony for this trope implementation:

TROPE: ${selectedTrope.name}
SUBVERSION: ${subversion?.subversionMethod || 'none'}
SCENE: ${JSON.stringify(scene)}
STORY THEMES: ${tropeBlueprint.storyContext.themes.join(', ')}

Rate harmony (0-100) for:
1. Plot integration and advancement
2. Character development consistency
3. Thematic reinforcement

Return as JSON object with numerical harmony scores.`;

    const systemPrompt = `You are a narrative coherence expert. Evaluate how well trope implementations maintain story unity and thematic consistency.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.2,
        maxTokens: 300
      });

      const harmonyData = JSON.parse(result || '{}');
        return {
        plotHarmony: harmonyData.plotHarmony || 75,
        characterHarmony: harmonyData.characterHarmony || 75,
        themeHarmony: harmonyData.themeHarmony || 75
      };

    } catch (error) {
      return this.evaluateNarrativeHarmonyFallback(selectedTrope, subversion, scene, tropeBlueprint);
    }
  }

  private static async createTropeInnovationsAI(storyContext: StoryContext, existingTropes: TropeIdentification[]): Promise<Innovation[]> {
    const prompt = `Create innovative trope combinations and new patterns:

STORY CONTEXT: ${storyContext.genre} targeting ${storyContext.targetAudience}
EXISTING TROPES: ${existingTropes.map(t => t.name).join(', ')}
THEMES: ${storyContext.themes.join(', ')}

Generate 3-5 innovative approaches:
1. Novel trope combinations
2. Modern adaptations of classic patterns
3. Genre-blending opportunities
4. Unique narrative techniques

Each innovation should include type, description, impact assessment, and risk evaluation.

Return as JSON array of innovation objects.`;

    const systemPrompt = `You are a creative innovation expert specializing in narrative pattern synthesis. Generate fresh approaches that respect storytelling fundamentals while pushing creative boundaries.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.7,
        maxTokens: 800
      });

      const innovationData = JSON.parse(result || '[]');
      return innovationData.map((inn: any) => ({
        type: inn.type || 'pattern-synthesis',
        description: inn.description || 'Creative trope combination',
        impact: inn.impact || 70,
        risk: inn.risk || 50
      }));

    } catch (error) {
      return this.createTropeInnovationsFallback(storyContext, existingTropes);
    }
  }

  // ===== FALLBACK METHODS =====

  private static identifyStoryTropesFallback(storyContext: StoryContext): TropeIdentification[] {
    const commonTropes: TropeIdentification[] = [
      {
        id: 'hero-journey',
        name: "Hero's Journey",
        category: 'plot-device',
        description: 'Protagonist undergoes transformative adventure',
        examples: ['Star Wars', 'Lord of the Rings'],
        frequency: 'common',
        effectiveness: 85,
        genreCompatibility: ['fantasy', 'adventure', 'sci-fi'],
        audienceExpectations: [],
        subversionPotential: 60,
        innovationOpportunities: ['modern adaptation', 'gender subversion']
      },
      {
        id: 'mentor-figure',
        name: 'Wise Mentor',
        category: 'character-archetype',
        description: 'Experienced guide who aids the protagonist',
        examples: ['Gandalf', 'Obi-Wan Kenobi'],
        frequency: 'common',
        effectiveness: 80,
        genreCompatibility: ['fantasy', 'adventure'],
        audienceExpectations: [],
        subversionPotential: 70,
        innovationOpportunities: ['mentor failure', 'reverse mentorship']
      }
    ];

    return commonTropes.filter(trope => 
      trope.genreCompatibility.includes(storyContext.genre.toLowerCase())
    );
  }

  private static generateTropeSubversionsFallback(tropes: TropeIdentification[], storyContext: StoryContext): TropeSubversion[] {
    return tropes
      .filter(trope => trope.subversionPotential > 60)
      .map(trope => ({
        originalTrope: trope,
        subversionMethod: 'expectation-reversal',
        subversionDescription: `Subvert ${trope.name} by reversing audience expectations`,
        expectedOutcome: 'Enhanced narrative depth and audience engagement',
        audienceImpact: {
          emotionalResponse: ['surprise', 'delight'],
          engagementLevel: 80,
          memoryRetention: 85,
          discussionPotential: 75
        },
        narrativeIntegration: {
          plotRelevance: 85,
          characterDevelopment: 80,
          themeReinforcement: 75,
          pacingImpact: 'enhancing'
        },
        riskLevel: 'medium',
        innovationScore: 70
      }));
  }

  private static designTropeArchitectureFallback(tropes: TropeIdentification[], storyContext: StoryContext): TropeArchitecture {
    return {
      foundationalTropes: tropes.slice(0, 2),
      supportingTropes: tropes.slice(2),
      subversionPoints: [
        { point: 'midpoint', method: 'expectation-reversal', impact: 80 }
      ],
      innovationAreas: [
        { area: 'character-dynamics', potential: 70, methods: ['role-reversal', 'expectation-subversion'] }
      ],
      harmonyRules: [
        { rule: 'maintain-genre-authenticity', importance: 90, application: 'all-elements' }
      ]
    };
  }

  private static createInnovationStrategyFallback(storyContext: StoryContext, tropes: TropeIdentification[]): InnovationStrategy {
    return {
      primaryInnovations: [
        { type: 'trope-combination', description: 'Blend familiar tropes in novel ways', impact: 75, risk: 40 }
      ],
      secondaryAdaptations: [
        { element: 'character-archetypes', method: 'modern-update', rationale: 'Contemporary relevance' }
      ],
      riskMitigation: [
        { risk: 'audience-confusion', mitigation: 'gradual-introduction', effectiveness: 80 }
      ],
      audienceTesting: [
        { method: 'focus-groups', criteria: ['comprehension', 'engagement'], success: 'positive-response' }
      ],
      creativeGoals: [
        { goal: 'fresh-familiarity', priority: 90, measurement: 'audience-satisfaction' }
      ]
    };
  }

  private static designAudienceManagementFallback(storyContext: StoryContext, tropes: TropeIdentification[]): AudienceManagement {
    return {
      expectationSetting: [
        { method: 'early-trope-signals', timeline: 'first-act', effectiveness: 80 }
      ],
      surpriseManagement: [
        { timing: 'strategic-moments', intensity: 70, recovery: 'quick-reorientation' }
      ],
      familiarityBalance: {
        familiar: 70,
        novel: 30,
        strategy: 'comfort-with-innovation'
      },
      engagementStrategy: {
        tactics: ['expectation-play', 'gradual-revelation'],
        timing: ['setup', 'payoff'],
        measures: ['attention', 'emotional-response']
      }
    };
  }

  private static createGenreAdaptationFallback(storyContext: StoryContext, tropes: TropeIdentification[]): GenreAdaptation {
    return {
      genreRequirements: [
        { requirement: 'genre-authenticity', flexibility: 70, adaptation: 'respectful-innovation' }
      ],
      adaptationMethods: [
        { method: 'contextual-fitting', application: 'all-tropes', effectiveness: 80 }
      ],
      conventionHandling: [
        { convention: 'genre-expectations', approach: 'honor-then-enhance', justification: 'audience-comfort' }
      ],
      innovationOpportunities: [
        { innovation: 'cross-genre-blending', feasibility: 70, impact: 75 }
      ]
    };
  }

  private static calculateTropeQualityMetricsFallback(tropes: TropeIdentification[], subversions: TropeSubversion[], storyContext: StoryContext): TropeQualityMetrics {
    const avgEffectiveness = tropes.reduce((sum, t) => sum + t.effectiveness, 0) / tropes.length;
    const avgInnovation = subversions.reduce((sum, s) => sum + s.innovationScore, 0) / Math.max(subversions.length, 1);
    
    return {
      originalityScore: Math.min(80, avgInnovation + 10),
      effectivenessScore: avgEffectiveness,
      audienceResonance: 75,
      narrativeCoherence: 80,
      innovationLevel: avgInnovation,
      overallQuality: Math.round((avgEffectiveness + avgInnovation + 75 + 80) / 4)
    };
  }

  private static generateTropeBlueprintFallback(storyContext: StoryContext): TropeBlueprint {
    const identifiedTropes = this.identifyStoryTropesFallback(storyContext);
    const recommendedSubversions = this.generateTropeSubversionsFallback(identifiedTropes, storyContext);
    const tropeArchitecture = this.designTropeArchitectureFallback(identifiedTropes, storyContext);
    const innovationStrategy = this.createInnovationStrategyFallback(storyContext, identifiedTropes);
    const audienceManagement = this.designAudienceManagementFallback(storyContext, identifiedTropes);
    const genreAdaptation = this.createGenreAdaptationFallback(storyContext, identifiedTropes);
    const qualityMetrics = this.calculateTropeQualityMetricsFallback(identifiedTropes, recommendedSubversions, storyContext);

    return {
      storyContext,
      identifiedTropes,
      recommendedSubversions,
      tropeArchitecture,
      innovationStrategy,
      audienceManagement,
      genreAdaptation,
      qualityMetrics
    };
  }

  private static identifySceneTropesFallback(scene: any, tropeBlueprint: TropeBlueprint): TropeIdentification[] {
    return tropeBlueprint.identifiedTropes.slice(0, 3);
  }

  private static selectOptimalTropeFallback(applicableTropes: TropeIdentification[], scene: any, tropeBlueprint: TropeBlueprint): TropeIdentification {
    return applicableTropes.sort((a, b) => b.effectiveness - a.effectiveness)[0];
  }

  private static applyTropeSubversionFallback(selectedTrope: TropeIdentification, scene: any, tropeBlueprint: TropeBlueprint): TropeSubversion | null {
    const availableSubversions = tropeBlueprint.recommendedSubversions.filter(s => s.originalTrope.id === selectedTrope.id);
    return availableSubversions.length > 0 ? availableSubversions[0] : null;
  }

  private static generateExecutionDetailsFallback(selectedTrope: TropeIdentification, subversion: TropeSubversion | null, scene: any): ExecutionDetails {
    return {
      implementation: [`Apply ${selectedTrope.name} according to ${selectedTrope.category} guidelines`],
      timing: 'mid-scene',
      integration: 'natural'
    };
  }

  private static predictAudienceEffectFallback(selectedTrope: TropeIdentification, subversion: TropeSubversion | null, scene: any): AudienceEffect {
    return {
      immediate: ['engagement'],
      longTerm: ['satisfaction'],
      discussion: ['moderate']
    };
  }

  private static evaluateNarrativeHarmonyFallback(selectedTrope: TropeIdentification, subversion: TropeSubversion | null, scene: any, tropeBlueprint: TropeBlueprint): NarrativeHarmony {
    return {
      plotHarmony: 75,
      characterHarmony: 75,
      themeHarmony: 75
    };
  }

  private static generateTropeApplicationFallback(scene: any, tropeBlueprint: TropeBlueprint): TropeApplication {
    const applicableTropes = this.identifySceneTropesFallback(scene, tropeBlueprint);
    const selectedTrope = this.selectOptimalTropeFallback(applicableTropes, scene, tropeBlueprint);
    const subversionApplied = this.applyTropeSubversionFallback(selectedTrope, scene, tropeBlueprint);
    const executionDetails = this.generateExecutionDetailsFallback(selectedTrope, subversionApplied, scene);
    const audienceEffect = this.predictAudienceEffectFallback(selectedTrope, subversionApplied, scene);
    const narrativeHarmony = this.evaluateNarrativeHarmonyFallback(selectedTrope, subversionApplied, scene, tropeBlueprint);

    return {
      scene,
      applicableTropes,
      selectedTrope,
      subversionApplied,
      executionDetails,
      audienceEffect,
      narrativeHarmony
    };
  }

  private static createTropeInnovationsFallback(storyContext: StoryContext, existingTropes: TropeIdentification[]): Innovation[] {
    return [
      {
        type: 'trope-synthesis',
        description: `Combine ${existingTropes.slice(0, 2).map(t => t.name).join(' and ')} in novel ways`,
        impact: 75,
        risk: 40
      }
    ];
  }

  private static generateTropeInnovationFallback(storyContext: StoryContext, existingTropes: TropeIdentification[]): Innovation[] {
    return this.createTropeInnovationsFallback(storyContext, existingTropes);
  }
} 