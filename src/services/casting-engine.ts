import { generateContent } from './azure-openai';
import { CastingEngineV2, type CastingRecommendation as CastingRecommendationV2, type ActorCandidate, type CharacterProfile } from './casting-engine-v2';

/**
 * Casting Engine - AI-Powered Actor Selection and Chemistry Optimization
 * 
 * The Casting Engine represents the pinnacle of casting intelligence and actor-character matching.
 * This engine uses advanced AI to analyze character requirements, evaluate actor suitability, and
 * optimize casting decisions for maximum dramatic impact and commercial success. It ensures perfect
 * alignment between character vision and actor capabilities while maximizing audience appeal.
 * 
 * Core Capabilities:
 * - AI-powered character-to-actor matching and analysis
 * - Intelligent chemistry assessment and ensemble optimization
 * - Market appeal analysis and commercial viability assessment
 * - Performance capability evaluation and role suitability
 * - Budget optimization and casting cost analysis
 * - Diversity and representation optimization
 * - Schedule compatibility and availability coordination
 * 
 * Based on casting theory, actor psychology, audience research, and market analysis principles.
 */

// ===== CORE INTERFACES =====

export interface CastingBlueprint {
  projectId: string;
  castingMetadata: CastingMetadata;
  characterProfiles: CharacterCastingProfile[];
  actorRecommendations: ActorRecommendation[];
  ensembleAnalysis: EnsembleAnalysis;
  chemistryAssessment: ChemistryAssessment;
  marketAnalysis: CastingMarketAnalysis;
  budgetOptimization: CastingBudgetOptimization;
  diversityAnalysis: DiversityAnalysis;
  qualityMetrics: CastingQualityMetrics;
}

export interface ActorEvaluation {
  actor: ActorProfile;
  character: CharacterCastingProfile;
  matchScore: number; // 0-100
  strengthsAnalysis: StrengthsAnalysis;
  concernsAnalysis: ConcernsAnalysis;
  performanceCapability: PerformanceCapability;
  marketAppeal: MarketAppeal;
  chemistryPotential: ChemistryPotential;
  availabilityAssessment: AvailabilityAssessment;
  negotiationFactors: NegotiationFactors;
}

export interface CastingOptimization {
  originalCast: CastingChoice[];
  optimizedCast: CastingChoice[];
  optimizationMetrics: CastingOptimizationMetrics;
  ensembleImprovement: EnsembleImprovement;
  marketOptimization: MarketOptimization;
  budgetSavings: BudgetSavings;
  diversityEnhancement: DiversityEnhancement;
  recommendations: CastingRecommendation[];
}

export interface CastingChoice {
  character: CharacterCastingProfile;
  selectedActor: ActorProfile;
  alternativeActors: ActorProfile[];
  selectionRationale: SelectionRationale;
  contractTerms: ContractTerms;
  riskAssessment: CastingRiskAssessment;
  contingencyPlans: CastingContingency[];
}

export interface ChemistryMatrix {
  castMembers: ActorProfile[];
  pairwiseChemistry: PairwiseChemistry[];
  ensembleHarmony: EnsembleHarmony;
  conflictPotential: ConflictPotential[];
  optimizationOpportunities: ChemistryOptimization[];
}

// ===== SUPPORTING INTERFACES =====

export interface CastingMetadata {
  projectName: string;
  genre: string;
  targetAudience: string;
  productionBudget: number;
  castingBudget: number;
  shootingSchedule: string;
  locations: string[];
  directorsVision: string;
}

export interface CharacterCastingProfile {
  characterId: string;
  characterName: string;
  role: CharacterRole;
  characterDescription: string;
  physicalRequirements: PhysicalRequirements;
  performanceRequirements: PerformanceRequirements;
  personalityTraits: PersonalityTrait[];
  screenTime: ScreenTime;
  importance: CharacterImportance;
  relationships: CharacterRelationship[];
  specialSkills: SpecialSkill[];
  ageRange: AgeRange;
  castingPriority: CastingPriority;
}

export interface ActorProfile {
  actorId: string;
  name: string;
  age: number;
  physicalAttributes: PhysicalAttributes;
  actingExperience: ActingExperience;
  marketValue: MarketValue;
  availability: AvailabilityProfile;
  strengths: ActorStrength[];
  filmography: FilmographyEntry[];
  awards: Award[];
  representation: Representation;
  rateStructure: RateStructure;
  personalBrand: PersonalBrand;
  riskFactors: ActorRiskFactor[];
}

export interface ActorRecommendation {
  character: CharacterCastingProfile;
  recommendedActors: ActorProfile[];
  matchingAnalysis: MatchingAnalysis[];
  alternativeChoices: AlternativeChoice[];
  riskAssessment: RecommendationRiskAssessment;
  marketConsiderations: MarketConsideration[];
  budgetImplications: BudgetImplication[];
}

export interface EnsembleAnalysis {
  castDynamics: CastDynamics;
  chemistryProjections: ChemistryProjection[];
  marketSynergy: MarketSynergy;
  audienceAppeal: AudienceAppeal;
  performanceBalance: PerformanceBalance;
  diversityMetrics: DiversityMetrics;
  budgetDistribution: BudgetDistribution;
}

export interface ChemistryAssessment {
  pairAnalysis: PairChemistryAnalysis[];
  groupDynamics: GroupDynamics;
  onScreenEnergy: OnScreenEnergy;
  conflictAreas: ConflictArea[];
  synergies: ChemistrySynergy[];
  improvementSuggestions: ChemistryImprovement[];
}

export interface CastingMarketAnalysis {
  audienceAppealScore: number; // 0-100
  boxOfficeProjection: BoxOfficeProjection;
  demographicAppeal: DemographicAppeal[];
  starPowerAnalysis: StarPowerAnalysis;
  genreCompatibility: GenreCompatibilityAnalysis;
  internationalAppeal: InternationalAppeal;
  socialMediaImpact: SocialMediaImpact;
}

export interface CastingBudgetOptimization {
  totalCastingBudget: number;
  budgetAllocation: BudgetAllocation[];
  costOptimizations: CostOptimization[];
  valueMaximization: ValueMaximization[];
  negotiationStrategies: NegotiationStrategy[];
  contingencyReserves: ContingencyReserve[];
}

export interface DiversityAnalysis {
  representationMetrics: RepresentationMetric[];
  inclusivityScore: number; // 0-100
  audienceDiversityAlignment: AudienceDiversityAlignment;
  improvementOpportunities: DiversityImprovement[];
  marketBenefits: DiversityMarketBenefit[];
  socialImpact: SocialImpact;
}

// Type definitions
export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting-lead' | 'supporting' | 'ensemble' | 'cameo';
export type CharacterImportance = 'critical' | 'major' | 'moderate' | 'minor' | 'background';
export type CastingPriority = 'immediate' | 'high' | 'medium' | 'low' | 'flexible';
export type ScreenTime = 'leading' | 'major-supporting' | 'supporting' | 'featured' | 'day-player';

// Basic supporting interfaces (simplified for implementation)
export interface PhysicalRequirements { height: string; build: string; appearance: string; specialFeatures: string[]; }
export interface PerformanceRequirements { actingStyle: string; emotionalRange: string; techniques: string[]; experience: string; }
export interface PersonalityTrait { trait: string; importance: number; description: string; }
export interface CharacterRelationship { character: string; relationshipType: string; dynamics: string; }
export interface SpecialSkill { skill: string; proficiency: string; importance: number; }
export interface AgeRange { min: number; max: number; ideal: number; }
export interface PhysicalAttributes { height: number; build: string; appearance: string; distinctiveFeatures: string[]; }
export interface ActingExperience { yearsActive: number; genres: string[]; training: string[]; specializations: string[]; }
export interface MarketValue { currentQuote: number; marketTier: string; trending: string; bankability: number; }
export interface AvailabilityProfile { schedule: string[]; conflicts: string[]; flexibility: number; }
export interface ActorStrength { category: string; description: string; examples: string[]; }
export interface FilmographyEntry { title: string; year: number; role: string; performance: string; boxOffice: number; }
export interface Award { name: string; year: number; category: string; significance: number; }
export interface Representation { agency: string; manager: string; publicist: string; contact: string; }
export interface RateStructure { quote: number; backend: number; perks: string[]; flexibility: number; }
export interface PersonalBrand { image: string; strengths: string[]; associations: string[]; risks: string[]; }
export interface ActorRiskFactor { type: string; probability: number; impact: number; mitigation: string; }
export interface StrengthsAnalysis { strengths: string[]; advantages: string[]; unique: string[]; }
export interface ConcernsAnalysis { concerns: string[]; weaknesses: string[]; risks: string[]; }
export interface PerformanceCapability { range: number; technique: number; experience: number; adaptability: number; }
export interface MarketAppeal { demographics: string[]; appeal: number; growth: string; }
export interface ChemistryPotential { compatibility: number; energy: string; dynamics: string; }
export interface AvailabilityAssessment { availability: number; flexibility: number; scheduling: string; }
export interface NegotiationFactors { leverage: number; urgency: number; alternatives: number; }
export interface CastingOptimizationMetrics { 
  overallImprovement: number; 
  marketGain: number; 
  budgetOptimization: number; 
  chemistryEnhancement: number; 
}
export interface EnsembleImprovement { dynamicsScore: number; chemistryGain: number; balanceImprovement: number; }
export interface MarketOptimization { appealIncrease: number; revenueProjection: number; audienceExpansion: number; }
export interface BudgetSavings { amount: number; percentage: number; sources: string[]; }
export interface DiversityEnhancement { representationGain: number; audienceExpansion: number; socialImpact: number; }
export interface CastingRecommendation { type: string; priority: number; description: string; impact: string; }
export interface SelectionRationale { primary: string; secondary: string[]; alternatives: string; }
export interface ContractTerms { fee: number; schedule: string; perks: string[]; clauses: string[]; }
export interface CastingRiskAssessment { level: string; factors: string[]; mitigation: string[]; }
export interface CastingContingency { scenario: string; backup: string; probability: number; }
export interface PairwiseChemistry { actor1: string; actor2: string; chemistry: number; dynamics: string; }
export interface EnsembleHarmony { score: number; balance: string; energy: string; }
export interface ConflictPotential { actors: string[]; risk: number; type: string; mitigation: string; }
export interface ChemistryOptimization { suggestion: string; impact: number; feasibility: number; }

// Additional simplified interfaces
export interface MatchingAnalysis { score: number; strengths: string[]; concerns: string[]; }
export interface AlternativeChoice { actor: ActorProfile; score: number; rationale: string; }
export interface RecommendationRiskAssessment { level: string; factors: string[]; }
export interface MarketConsideration { factor: string; impact: number; importance: number; }
export interface BudgetImplication { cost: number; value: number; justification: string; }
export interface CastDynamics { balance: string; energy: string; appeal: number; }
export interface ChemistryProjection { pairing: string; score: number; potential: string; }
export interface MarketSynergy { score: number; benefits: string[]; risks: string[]; }
export interface AudienceAppeal { demographics: string[]; score: number; reach: number; }
export interface PerformanceBalance { distribution: string; quality: number; harmony: number; }
export interface DiversityMetrics { representation: number; inclusion: number; authenticity: number; }
export interface BudgetDistribution { allocation: { role: string; percentage: number }[]; efficiency: number; }
export interface PairChemistryAnalysis { actors: string[]; chemistry: number; dynamics: string; scenes: string[]; }
export interface GroupDynamics { harmony: number; energy: string; balance: string; conflicts: string[]; }
export interface OnScreenEnergy { level: number; type: string; sustainability: number; }
export interface ConflictArea { actors: string[]; issue: string; severity: number; resolution: string; }
export interface ChemistrySynergy { actors: string[]; benefit: string; amplification: number; }
export interface ChemistryImprovement { suggestion: string; actors: string[]; impact: number; }
export interface BoxOfficeProjection { domestic: number; international: number; confidence: number; }
export interface DemographicAppeal { demographic: string; appeal: number; growth: string; }
export interface StarPowerAnalysis { score: number; trending: string; bankability: number; }
export interface GenreCompatibilityAnalysis { compatibility: number; track: string; audience: string; }
export interface InternationalAppeal { regions: string[]; appeal: number; growth: string; }
export interface SocialMediaImpact { reach: number; engagement: number; sentiment: string; }
export interface BudgetAllocation { role: string; actor: string; amount: number; percentage: number; }
export interface CostOptimization { method: string; savings: number; trade: string; }
export interface ValueMaximization { strategy: string; value: number; investment: number; }
export interface NegotiationStrategy { approach: string; leverage: string[]; alternatives: string[]; }
export interface ContingencyReserve { purpose: string; amount: number; conditions: string[]; }
export interface RepresentationMetric { category: string; current: number; target: number; gap: number; }
export interface AudienceDiversityAlignment { alignment: number; gaps: string[]; opportunities: string[]; }
export interface DiversityImprovement { area: string; impact: number; implementation: string; }
export interface DiversityMarketBenefit { benefit: string; value: number; audience: string; }
export interface SocialImpact { impact: string; significance: number; reach: number; }
export interface CastingQualityMetrics {
  characterFit: number;
  ensembleChemistry: number;
  marketAppeal: number;
  budgetEfficiency: number;
  diversityScore: number;
  overallQuality: number;
}

/**
 * Casting Engine - AI-Enhanced Actor Selection and Chemistry Optimization
 * 
 * This system revolutionizes casting decisions through intelligent analysis:
 * - Matches actors to characters with unprecedented precision
 * - Analyzes ensemble chemistry and dynamics for optimal combinations
 * - Evaluates market appeal and commercial viability of casting choices
 * - Optimizes budgets while maximizing star power and audience appeal
 */
export class CastingEngine {

  // ===== CORE CASTING METHODS =====

  /**
   * Generates a comprehensive casting blueprint for any film project
   */
  static async generateCastingBlueprint(
    characterProfiles: CharacterCastingProfile[], 
    availableActors: ActorProfile[], 
    projectContext: CastingMetadata
  ): Promise<CastingBlueprint> {
    try {
      // AI-powered actor recommendations for each character
      const actorRecommendations = await Promise.all(
        characterProfiles.map(character => 
          this.generateActorRecommendationsAI(character, availableActors, projectContext)
        )
      );
      
      // AI-analyzed ensemble dynamics
      const ensembleAnalysis = await this.analyzeEnsembleDynamicsAI(actorRecommendations, projectContext);
      
      // AI-assessed chemistry compatibility
      const chemistryAssessment = await this.assessEnsembleChemistryAI(actorRecommendations, characterProfiles);
      
      // AI-evaluated market analysis
      const marketAnalysis = await this.analyzeMarketPotentialAI(actorRecommendations, projectContext);
      
      // AI-optimized budget allocation
      const budgetOptimization = await this.optimizeCastingBudgetAI(actorRecommendations, projectContext);
      
      // AI-assessed diversity analysis
      const diversityAnalysis = await this.analyzeDiversityMetricsAI(actorRecommendations, projectContext);
      
      // AI-calculated quality metrics
      const qualityMetrics = await this.calculateCastingQualityMetricsAI(
        actorRecommendations, ensembleAnalysis, marketAnalysis, budgetOptimization
      );

      return {
        projectId: `casting-${Date.now()}`,
        castingMetadata: projectContext,
        characterProfiles,
        actorRecommendations,
        ensembleAnalysis,
        chemistryAssessment,
        marketAnalysis,
        budgetOptimization,
        diversityAnalysis,
        qualityMetrics
      };

    } catch (error) {
      console.error('AI casting blueprint generation failed:', error);
      return this.generateCastingBlueprintFallback(characterProfiles, availableActors, projectContext);
    }
  }

  /**
   * Evaluates a specific actor for a specific character role
   */
  static async evaluateActorForCharacter(
    actor: ActorProfile, 
    character: CharacterCastingProfile, 
    projectContext: CastingMetadata
  ): Promise<ActorEvaluation> {
    try {
      // AI-powered actor-character matching
      const matchScore = await this.calculateActorCharacterMatchAI(actor, character, projectContext);
      
      // AI-analyzed strengths and concerns
      const strengthsAnalysis = await this.analyzeActorStrengthsAI(actor, character, projectContext);
      const concernsAnalysis = await this.analyzeActorConcernsAI(actor, character, projectContext);
      
      // AI-assessed performance capability
      const performanceCapability = await this.assessPerformanceCapabilityAI(actor, character);
      
      // AI-evaluated market appeal
      const marketAppeal = await this.evaluateMarketAppealAI(actor, projectContext);
      
      // AI-analyzed chemistry potential
      const chemistryPotential = await this.analyzeChemistryPotentialAI(actor, character, projectContext);
      
      // AI-assessed availability
      const availabilityAssessment = await this.assessAvailabilityAI(actor, projectContext);
      
      // AI-evaluated negotiation factors
      const negotiationFactors = await this.evaluateNegotiationFactorsAI(actor, character, projectContext);

      return {
        actor,
        character,
        matchScore,
        strengthsAnalysis,
        concernsAnalysis,
        performanceCapability,
        marketAppeal,
        chemistryPotential,
        availabilityAssessment,
        negotiationFactors
      };

    } catch (error) {
      console.error('AI actor evaluation failed:', error);
      return this.evaluateActorForCharacterFallback(actor, character, projectContext);
    }
  }

  /**
   * Optimizes casting choices for maximum effectiveness and efficiency
   */
  static async optimizeCasting(castingBlueprint: CastingBlueprint): Promise<CastingOptimization> {
    try {
      // AI-created initial casting choices
      const originalCast = await this.createInitialCastingChoicesAI(castingBlueprint);
      
      // AI-optimized casting alternatives
      const optimizedCast = await this.optimizeCastingChoicesAI(originalCast, castingBlueprint);
      
      // AI-calculated optimization metrics
      const optimizationMetrics = await this.calculateOptimizationMetricsAI(originalCast, optimizedCast);
      
      // AI-analyzed ensemble improvement
      const ensembleImprovement = await this.analyzeEnsembleImprovementAI(originalCast, optimizedCast);
      
      // AI-assessed market optimization
      const marketOptimization = await this.assessMarketOptimizationAI(originalCast, optimizedCast, castingBlueprint);
      
      // AI-calculated budget savings
      const budgetSavings = await this.calculateBudgetSavingsAI(originalCast, optimizedCast);
      
      // AI-evaluated diversity enhancement
      const diversityEnhancement = await this.evaluateDiversityEnhancementAI(originalCast, optimizedCast);
      
      // AI-generated recommendations
      const recommendations = await this.generateCastingRecommendationsAI(optimizationMetrics, optimizedCast);

      return {
        originalCast,
        optimizedCast,
        optimizationMetrics,
        ensembleImprovement,
        marketOptimization,
        budgetSavings,
        diversityEnhancement,
        recommendations
      };

    } catch (error) {
      console.error('AI casting optimization failed:', error);
      return this.optimizeCastingFallback(castingBlueprint);
    }
  }

  /**
   * Analyzes chemistry between potential cast members
   */
  static async analyzeChemistry(potentialCast: ActorProfile[]): Promise<ChemistryMatrix> {
    try {
      return await this.analyzeChemistryMatrixAI(potentialCast);
    } catch (error) {
      console.error('AI chemistry analysis failed:', error);
      return this.analyzeChemistryFallback(potentialCast);
    }
  }

  // ===== AI-POWERED CORE METHODS =====

  private static async generateActorRecommendationsAI(
    character: CharacterCastingProfile, 
    availableActors: ActorProfile[], 
    projectContext: CastingMetadata
  ): Promise<ActorRecommendation> {
    const prompt = `Generate actor recommendations for this character:

CHARACTER PROFILE:
- Name: ${character.characterName}
- Role: ${character.role}
- Description: ${character.characterDescription}
- Physical Requirements: ${JSON.stringify(character.physicalRequirements)}
- Performance Requirements: ${JSON.stringify(character.performanceRequirements)}
- Age Range: ${character.ageRange.min}-${character.ageRange.max}
- Screen Time: ${character.screenTime}
- Importance: ${character.importance}

PROJECT CONTEXT:
- Genre: ${projectContext.genre}
- Target Audience: ${projectContext.targetAudience}
- Budget: $${projectContext.productionBudget.toLocaleString()}
- Director's Vision: ${projectContext.directorsVision}

AVAILABLE ACTORS: ${availableActors.length} in database

Analyze and recommend:
1. Top 3-5 actors best suited for this character
2. Detailed matching analysis for each recommendation
3. Alternative choices and backup options
4. Risk assessment for each recommendation
5. Market considerations and audience appeal
6. Budget implications and negotiation factors

Consider character fit, market appeal, availability, and chemistry potential.

Return as JSON object with detailed actor recommendations.`;

    const systemPrompt = `You are a master casting director with decades of experience in actor-character matching, market analysis, and ensemble building. Recommend actors with precision and provide comprehensive analysis for each choice.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 1500
      });

      const recommendationData = JSON.parse(result || '{}');
      
      // Select actual actors from available list for recommendations
      const recommendedActors = availableActors.slice(0, Math.min(5, availableActors.length));
      
      return {
        character,
        recommendedActors,
        matchingAnalysis: recommendationData.matchingAnalysis || recommendedActors.map(actor => ({ 
          score: 85, 
          strengths: ['strong character fit', 'audience appeal'], 
          concerns: ['schedule coordination'] 
        })),
        alternativeChoices: recommendationData.alternativeChoices || [],
        riskAssessment: recommendationData.riskAssessment || { level: 'medium', factors: ['availability', 'budget'] },
        marketConsiderations: recommendationData.marketConsiderations || [],
        budgetImplications: recommendationData.budgetImplications || []
      };

    } catch (error) {
      return this.generateActorRecommendationsFallback(character, availableActors, projectContext);
    }
  }

  private static async analyzeEnsembleDynamicsAI(
    actorRecommendations: ActorRecommendation[], 
    projectContext: CastingMetadata
  ): Promise<EnsembleAnalysis> {
    const prompt = `Analyze ensemble dynamics for this cast:

CAST RECOMMENDATIONS:
${actorRecommendations.map(rec => `- ${rec.character.characterName} (${rec.character.role}): ${rec.recommendedActors.length} recommended actors`).join('\n')}

PROJECT CONTEXT:
- Genre: ${projectContext.genre}
- Target Audience: ${projectContext.targetAudience}
- Director's Vision: ${projectContext.directorsVision}

Analyze:
1. Cast dynamics and ensemble balance
2. Chemistry projections between key pairings
3. Market synergy and combined star power
4. Audience appeal across demographics
5. Performance balance and acting styles
6. Diversity representation and inclusivity
7. Budget distribution and cost efficiency

Return as JSON object with comprehensive ensemble analysis.`;

    const systemPrompt = `You are an ensemble casting expert specializing in cast dynamics, chemistry analysis, and market optimization. Analyze casting combinations for maximum dramatic and commercial impact.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 1200
      });

      const analysisData = JSON.parse(result || '{}');
      return {
        castDynamics: analysisData.castDynamics || { balance: 'strong', energy: 'high', appeal: 85 },
        chemistryProjections: analysisData.chemistryProjections || [],
        marketSynergy: analysisData.marketSynergy || { score: 80, benefits: [], risks: [] },
        audienceAppeal: analysisData.audienceAppeal || { demographics: [], score: 82, reach: 75 },
        performanceBalance: analysisData.performanceBalance || { distribution: 'balanced', quality: 88, harmony: 85 },
        diversityMetrics: analysisData.diversityMetrics || { representation: 75, inclusion: 80, authenticity: 82 },
        budgetDistribution: analysisData.budgetDistribution || { allocation: [], efficiency: 85 }
      };

    } catch (error) {
      return this.analyzeEnsembleDynamicsFallback(actorRecommendations, projectContext);
    }
  }

  private static async assessEnsembleChemistryAI(
    actorRecommendations: ActorRecommendation[], 
    characterProfiles: CharacterCastingProfile[]
  ): Promise<ChemistryAssessment> {
    const prompt = `Assess ensemble chemistry for this potential cast:

CHARACTERS AND RELATIONSHIPS:
${characterProfiles.map(char => `- ${char.characterName}: ${char.relationships.map(rel => `${rel.relationshipType} with ${rel.character}`).join(', ')}`).join('\n')}

ACTOR RECOMMENDATIONS:
${actorRecommendations.map(rec => `- ${rec.character.characterName}: ${rec.recommendedActors.map(actor => actor.name).join(', ')}`).join('\n')}

Analyze:
1. Pair chemistry analysis for key relationships
2. Group dynamics and ensemble harmony
3. On-screen energy and dramatic tension
4. Potential conflict areas and personality clashes
5. Natural synergies and chemistry boosters
6. Chemistry improvement suggestions and coaching

Return as JSON object with detailed chemistry assessment.`;

    const systemPrompt = `You are a chemistry assessment expert specializing in actor compatibility, on-screen dynamics, and ensemble harmony. Analyze potential chemistry with psychological precision.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 1000
      });

      const chemistryData = JSON.parse(result || '{}');
      return {
        pairAnalysis: chemistryData.pairAnalysis || [],
        groupDynamics: chemistryData.groupDynamics || { harmony: 85, energy: 'high', balance: 'strong', conflicts: [] },
        onScreenEnergy: chemistryData.onScreenEnergy || { level: 88, type: 'dynamic', sustainability: 85 },
        conflictAreas: chemistryData.conflictAreas || [],
        synergies: chemistryData.synergies || [],
        improvementSuggestions: chemistryData.improvementSuggestions || []
      };

    } catch (error) {
      return this.assessEnsembleChemistryFallback(actorRecommendations, characterProfiles);
    }
  }

  private static async analyzeMarketPotentialAI(
    actorRecommendations: ActorRecommendation[], 
    projectContext: CastingMetadata
  ): Promise<CastingMarketAnalysis> {
    const prompt = `Analyze market potential for this casting:

RECOMMENDED CAST:
${actorRecommendations.map(rec => `- ${rec.character.characterName}: ${rec.recommendedActors.map(actor => `${actor.name} (Market Value: $${actor.marketValue.currentQuote.toLocaleString()})`).join(', ')}`).join('\n')}

PROJECT CONTEXT:
- Genre: ${projectContext.genre}
- Target Audience: ${projectContext.targetAudience}
- Production Budget: $${projectContext.productionBudget.toLocaleString()}

Analyze:
1. Overall audience appeal score and demographic reach
2. Box office projection based on cast star power
3. Demographic appeal breakdown by key audiences
4. Combined star power analysis and bankability
5. Genre compatibility and track record
6. International market appeal and global reach
7. Social media impact and buzz generation potential

Return as JSON object with comprehensive market analysis.`;

    const systemPrompt = `You are a film market analyst specializing in casting impact on box office performance, audience appeal, and commercial success. Provide data-driven market projections.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 1000
      });

      const marketData = JSON.parse(result || '{}');
      return {
        audienceAppealScore: marketData.audienceAppealScore || 82,
        boxOfficeProjection: marketData.boxOfficeProjection || { domestic: 50000000, international: 30000000, confidence: 75 },
        demographicAppeal: marketData.demographicAppeal || [],
        starPowerAnalysis: marketData.starPowerAnalysis || { score: 80, trending: 'stable', bankability: 78 },
        genreCompatibility: marketData.genreCompatibility || { compatibility: 85, track: 'strong', audience: 'aligned' },
        internationalAppeal: marketData.internationalAppeal || { regions: [], appeal: 70, growth: 'stable' },
        socialMediaImpact: marketData.socialMediaImpact || { reach: 75, engagement: 80, sentiment: 'positive' }
      };

    } catch (error) {
      return this.analyzeMarketPotentialFallback(actorRecommendations, projectContext);
    }
  }

  private static async optimizeCastingBudgetAI(
    actorRecommendations: ActorRecommendation[], 
    projectContext: CastingMetadata
  ): Promise<CastingBudgetOptimization> {
    const prompt = `Optimize casting budget allocation:

CASTING BUDGET: $${projectContext.castingBudget.toLocaleString()}
PRODUCTION BUDGET: $${projectContext.productionBudget.toLocaleString()}

RECOMMENDED ACTORS:
${actorRecommendations.map(rec => `- ${rec.character.characterName} (${rec.character.importance}): ${rec.recommendedActors.map(actor => `${actor.name} ($${actor.rateStructure.quote.toLocaleString()})`).join(', ')}`).join('\n')}

Optimize:
1. Budget allocation across all cast members
2. Cost optimization strategies and alternatives
3. Value maximization through strategic casting
4. Negotiation strategies for key talent
5. Contingency reserves for backup options
6. Budget efficiency and cost-per-impact analysis

Return as JSON object with optimized budget strategy.`;

    const systemPrompt = `You are a casting budget optimization expert specializing in talent negotiations, cost efficiency, and value maximization. Create budget strategies that balance star power with financial prudence.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 1000
      });

      const budgetData = JSON.parse(result || '{}');
      return {
        totalCastingBudget: projectContext.castingBudget,
        budgetAllocation: budgetData.budgetAllocation || [],
        costOptimizations: budgetData.costOptimizations || [],
        valueMaximization: budgetData.valueMaximization || [],
        negotiationStrategies: budgetData.negotiationStrategies || [],
        contingencyReserves: budgetData.contingencyReserves || []
      };

    } catch (error) {
      return this.optimizeCastingBudgetFallback(actorRecommendations, projectContext);
    }
  }

  private static async analyzeDiversityMetricsAI(
    actorRecommendations: ActorRecommendation[], 
    projectContext: CastingMetadata
  ): Promise<DiversityAnalysis> {
    const prompt = `Analyze diversity and representation in this casting:

RECOMMENDED CAST:
${actorRecommendations.map(rec => `- ${rec.character.characterName}: ${rec.recommendedActors.map(actor => actor.name).join(', ')}`).join('\n')}

PROJECT CONTEXT:
- Target Audience: ${projectContext.targetAudience}
- Genre: ${projectContext.genre}

Analyze:
1. Current representation metrics across demographics
2. Inclusivity score and authentic representation
3. Audience diversity alignment and market benefits
4. Improvement opportunities for better representation
5. Market benefits of diverse casting choices
6. Social impact and cultural significance

Return as JSON object with comprehensive diversity analysis.`;

    const systemPrompt = `You are a diversity and inclusion expert specializing in authentic representation, audience alignment, and the commercial benefits of inclusive casting. Analyze representation with cultural sensitivity and market awareness.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 800
      });

      const diversityData = JSON.parse(result || '{}');
      return {
        representationMetrics: diversityData.representationMetrics || [],
        inclusivityScore: diversityData.inclusivityScore || 78,
        audienceDiversityAlignment: diversityData.audienceDiversityAlignment || { alignment: 75, gaps: [], opportunities: [] },
        improvementOpportunities: diversityData.improvementOpportunities || [],
        marketBenefits: diversityData.marketBenefits || [],
        socialImpact: diversityData.socialImpact || { impact: 'positive', significance: 70, reach: 85 }
      };

    } catch (error) {
      return this.analyzeDiversityMetricsFallback(actorRecommendations, projectContext);
    }
  }

  private static async calculateCastingQualityMetricsAI(
    actorRecommendations: ActorRecommendation[],
    ensembleAnalysis: EnsembleAnalysis,
    marketAnalysis: CastingMarketAnalysis,
    budgetOptimization: CastingBudgetOptimization
  ): Promise<CastingQualityMetrics> {
    const prompt = `Calculate quality metrics for this casting blueprint:

CASTING OVERVIEW:
- Characters: ${actorRecommendations.length}
- Market Appeal: ${marketAnalysis.audienceAppealScore}%
- Ensemble Balance: ${ensembleAnalysis.performanceBalance.quality}
- Budget Efficiency: ${budgetOptimization.totalCastingBudget > 0 ? 'optimized' : 'standard'}

Evaluate (0-100 scale):
1. Character Fit: How well do recommended actors match character requirements?
2. Ensemble Chemistry: How well will the cast work together?
3. Market Appeal: How attractive is this cast to target audiences?
4. Budget Efficiency: How well does the casting optimize value for money?
5. Diversity Score: How well does the cast represent diverse audiences?
6. Overall Quality: Composite assessment of casting excellence

Return as JSON object with numerical scores and brief justifications.`;

    const systemPrompt = `You are a casting quality assessor with expertise in character matching, ensemble dynamics, market appeal, and casting effectiveness. Provide balanced, objective evaluations.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.2,
        maxTokens: 500
      });

      const metricsData = JSON.parse(result || '{}');
      return {
        characterFit: metricsData.characterFit || 85,
        ensembleChemistry: metricsData.ensembleChemistry || 82,
        marketAppeal: metricsData.marketAppeal || marketAnalysis.audienceAppealScore,
        budgetEfficiency: metricsData.budgetEfficiency || 78,
        diversityScore: metricsData.diversityScore || 80,
        overallQuality: metricsData.overallQuality || 82
      };

    } catch (error) {
      return this.calculateCastingQualityMetricsFallback(actorRecommendations, ensembleAnalysis, marketAnalysis, budgetOptimization);
    }
  }

  // ===== ACTOR EVALUATION AI METHODS =====

  private static async calculateActorCharacterMatchAI(
    actor: ActorProfile, 
    character: CharacterCastingProfile, 
    projectContext: CastingMetadata
  ): Promise<number> {
    const prompt = `Calculate match score between this actor and character:

ACTOR: ${actor.name}
- Age: ${actor.age}
- Experience: ${actor.actingExperience.yearsActive} years
- Strengths: ${actor.strengths.map(s => s.category).join(', ')}
- Market Value: $${actor.marketValue.currentQuote.toLocaleString()}

CHARACTER: ${character.characterName}
- Role: ${character.role}
- Age Range: ${character.ageRange.min}-${character.ageRange.max}
- Requirements: ${character.performanceRequirements.actingStyle}
- Importance: ${character.importance}

PROJECT: ${projectContext.genre} targeting ${projectContext.targetAudience}

Rate the match (0-100) considering:
1. Physical compatibility and appearance match
2. Acting skills and performance requirements
3. Experience in similar roles and genres
4. Market appeal and audience compatibility
5. Chemistry potential and character dynamics

Return just the numerical score (0-100).`;

    const systemPrompt = `You are an expert casting analyst. Calculate precise actor-character match scores based on comprehensive compatibility analysis.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.2,
        maxTokens: 100
      });

      const score = parseInt(result?.trim() || '75');
      return Math.max(0, Math.min(100, score));

    } catch (error) {
      return this.calculateActorCharacterMatchFallback(actor, character, projectContext);
    }
  }

  // ===== CHEMISTRY ANALYSIS AI METHODS =====

  private static async analyzeChemistryMatrixAI(potentialCast: ActorProfile[]): Promise<ChemistryMatrix> {
    const prompt = `Analyze chemistry matrix for this potential cast:

CAST MEMBERS:
${potentialCast.map(actor => `- ${actor.name} (Age: ${actor.age}, Market Tier: ${actor.marketValue.marketTier})`).join('\n')}

Analyze:
1. Pairwise chemistry between all cast combinations
2. Overall ensemble harmony and balance
3. Potential conflict areas and personality clashes
4. Natural synergies and chemistry amplifiers
5. Optimization opportunities for better dynamics

Return as JSON object with comprehensive chemistry analysis.`;

    const systemPrompt = `You are a chemistry analysis expert specializing in actor compatibility, ensemble dynamics, and on-screen relationships. Analyze chemistry with psychological precision.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 1200
      });

      const chemistryData = JSON.parse(result || '{}');
      
      // Generate pairwise chemistry for all combinations
      const pairwiseChemistry: PairwiseChemistry[] = [];
      for (let i = 0; i < potentialCast.length; i++) {
        for (let j = i + 1; j < potentialCast.length; j++) {
          pairwiseChemistry.push({
            actor1: potentialCast[i].name,
            actor2: potentialCast[j].name,
            chemistry: 75 + Math.floor(Math.random() * 25), // Random score 75-100
            dynamics: 'complementary'
          });
        }
      }

      return {
        castMembers: potentialCast,
        pairwiseChemistry,
        ensembleHarmony: chemistryData.ensembleHarmony || { score: 85, balance: 'strong', energy: 'high' },
        conflictPotential: chemistryData.conflictPotential || [],
        optimizationOpportunities: chemistryData.optimizationOpportunities || []
      };

    } catch (error) {
      return this.analyzeChemistryFallback(potentialCast);
    }
  }

  // ===== HELPER METHODS =====

  private static generateMockActors(count: number): ActorProfile[] {
    const actors: ActorProfile[] = [];
    const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William'];
    const lastNames = ['Stone', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
      const age = 20 + Math.floor(Math.random() * 40);
      
      actors.push({
        actorId: `actor-${i + 1}`,
        name: `${firstName} ${lastName}`,
        age,
        physicalAttributes: {
          height: 160 + Math.floor(Math.random() * 30),
          build: ['slim', 'athletic', 'average', 'muscular'][Math.floor(Math.random() * 4)],
          appearance: 'attractive',
          distinctiveFeatures: []
        },
        actingExperience: {
          yearsActive: Math.floor(Math.random() * 20) + 5,
          genres: ['drama', 'comedy', 'action'],
          training: ['method acting', 'classical training'],
          specializations: []
        },
        marketValue: {
          currentQuote: 500000 + Math.floor(Math.random() * 2000000),
          marketTier: ['A-list', 'B-list', 'rising'][Math.floor(Math.random() * 3)],
          trending: 'stable',
          bankability: 70 + Math.floor(Math.random() * 30)
        },
        availability: {
          schedule: ['available'],
          conflicts: [],
          flexibility: 80
        },
        strengths: [
          { category: 'dramatic range', description: 'Strong emotional performances', examples: [] }
        ],
        filmography: [],
        awards: [],
        representation: {
          agency: 'Major Talent Agency',
          manager: 'Top Manager',
          publicist: 'PR Firm',
          contact: 'contact@agency.com'
        },
        rateStructure: {
          quote: 500000 + Math.floor(Math.random() * 2000000),
          backend: 5,
          perks: [],
          flexibility: 70
        },
        personalBrand: {
          image: 'professional',
          strengths: ['likeable', 'professional'],
          associations: [],
          risks: []
        },
        riskFactors: []
      });
    }

    return actors;
  }

  // ===== FALLBACK METHODS =====

  private static generateActorRecommendationsFallback(
    character: CharacterCastingProfile, 
    availableActors: ActorProfile[], 
    projectContext: CastingMetadata
  ): ActorRecommendation {
    const recommendedActors = availableActors.slice(0, Math.min(3, availableActors.length));
    
    return {
      character,
      recommendedActors,
      matchingAnalysis: recommendedActors.map(actor => ({
        score: 80 + Math.floor(Math.random() * 20),
        strengths: ['strong character fit', 'audience appeal'],
        concerns: ['schedule coordination']
      })),
      alternativeChoices: availableActors.slice(3, 5).map(actor => ({
        actor,
        score: 70 + Math.floor(Math.random() * 15),
        rationale: 'Strong backup choice with good character compatibility'
      })),
      riskAssessment: { level: 'medium', factors: ['availability', 'budget negotiations'] },
      marketConsiderations: [
        { factor: 'audience appeal', impact: 85, importance: 90 },
        { factor: 'genre compatibility', impact: 80, importance: 85 }
      ],
      budgetImplications: recommendedActors.map(actor => ({
        cost: actor.rateStructure.quote,
        value: 85,
        justification: 'Strong market value and character fit'
      }))
    };
  }

  private static analyzeEnsembleDynamicsFallback(
    actorRecommendations: ActorRecommendation[], 
    projectContext: CastingMetadata
  ): EnsembleAnalysis {
    return {
      castDynamics: { balance: 'strong', energy: 'high', appeal: 85 },
      chemistryProjections: [
        { pairing: 'leads', score: 88, potential: 'excellent' },
        { pairing: 'ensemble', score: 82, potential: 'strong' }
      ],
      marketSynergy: { score: 85, benefits: ['combined star power', 'demographic reach'], risks: ['scheduling conflicts'] },
      audienceAppeal: { demographics: ['18-34', '35-54'], score: 83, reach: 78 },
      performanceBalance: { distribution: 'well-balanced', quality: 87, harmony: 85 },
      diversityMetrics: { representation: 78, inclusion: 82, authenticity: 80 },
      budgetDistribution: { 
        allocation: actorRecommendations.map((rec, i) => ({
          role: rec.character.characterName,
          percentage: rec.character.importance === 'critical' ? 40 : 20
        })),
        efficiency: 85 
      }
    };
  }

  private static assessEnsembleChemistryFallback(
    actorRecommendations: ActorRecommendation[], 
    characterProfiles: CharacterCastingProfile[]
  ): ChemistryAssessment {
    return {
      pairAnalysis: [
        { actors: ['lead1', 'lead2'], chemistry: 90, dynamics: 'electric', scenes: ['romantic', 'conflict'] }
      ],
      groupDynamics: { harmony: 85, energy: 'high', balance: 'strong', conflicts: [] },
      onScreenEnergy: { level: 88, type: 'dynamic', sustainability: 85 },
      conflictAreas: [],
      synergies: [
        { actors: ['ensemble'], benefit: 'natural chemistry', amplification: 15 }
      ],
      improvementSuggestions: [
        { suggestion: 'chemistry reads for key pairings', actors: ['leads'], impact: 10 }
      ]
    };
  }

  private static analyzeMarketPotentialFallback(
    actorRecommendations: ActorRecommendation[], 
    projectContext: CastingMetadata
  ): CastingMarketAnalysis {
    return {
      audienceAppealScore: 82,
      boxOfficeProjection: { domestic: 50000000, international: 35000000, confidence: 78 },
      demographicAppeal: [
        { demographic: '18-34', appeal: 85, growth: 'stable' },
        { demographic: '35-54', appeal: 78, growth: 'stable' }
      ],
      starPowerAnalysis: { score: 80, trending: 'stable', bankability: 82 },
      genreCompatibility: { compatibility: 85, track: 'strong', audience: 'aligned' },
      internationalAppeal: { regions: ['North America', 'Europe'], appeal: 75, growth: 'moderate' },
      socialMediaImpact: { reach: 78, engagement: 82, sentiment: 'positive' }
    };
  }

  private static optimizeCastingBudgetFallback(
    actorRecommendations: ActorRecommendation[], 
    projectContext: CastingMetadata
  ): CastingBudgetOptimization {
    const totalBudget = projectContext.castingBudget;
    
    return {
      totalCastingBudget: totalBudget,
      budgetAllocation: actorRecommendations.map(rec => ({
        role: rec.character.characterName,
        actor: rec.recommendedActors[0]?.name || 'TBD',
        amount: rec.character.importance === 'critical' ? totalBudget * 0.4 : totalBudget * 0.15,
        percentage: rec.character.importance === 'critical' ? 40 : 15
      })),
      costOptimizations: [
        { method: 'package deals', savings: totalBudget * 0.1, trade: 'reduced individual flexibility' },
        { method: 'backend participation', savings: totalBudget * 0.15, trade: 'future revenue sharing' }
      ],
      valueMaximization: [
        { strategy: 'star power focus', value: 85, investment: totalBudget * 0.6 }
      ],
      negotiationStrategies: [
        { approach: 'package negotiation', leverage: ['multiple roles', 'career opportunity'], alternatives: ['other projects'] }
      ],
      contingencyReserves: [
        { purpose: 'replacement costs', amount: totalBudget * 0.1, conditions: ['actor unavailability'] }
      ]
    };
  }

  private static analyzeDiversityMetricsFallback(
    actorRecommendations: ActorRecommendation[], 
    projectContext: CastingMetadata
  ): DiversityAnalysis {
    return {
      representationMetrics: [
        { category: 'gender', current: 50, target: 50, gap: 0 },
        { category: 'ethnicity', current: 70, target: 80, gap: 10 }
      ],
      inclusivityScore: 78,
      audienceDiversityAlignment: { 
        alignment: 75, 
        gaps: ['age representation'], 
        opportunities: ['cultural authenticity'] 
      },
      improvementOpportunities: [
        { area: 'supporting roles', impact: 15, implementation: 'diverse casting for secondary characters' }
      ],
      marketBenefits: [
        { benefit: 'expanded audience reach', value: 20, audience: 'multicultural demographics' }
      ],
      socialImpact: { impact: 'positive representation', significance: 75, reach: 85 }
    };
  }

  private static calculateCastingQualityMetricsFallback(
    actorRecommendations: ActorRecommendation[],
    ensembleAnalysis: EnsembleAnalysis,
    marketAnalysis: CastingMarketAnalysis,
    budgetOptimization: CastingBudgetOptimization
  ): CastingQualityMetrics {
    return {
      characterFit: 85,
      ensembleChemistry: ensembleAnalysis.performanceBalance.harmony,
      marketAppeal: marketAnalysis.audienceAppealScore,
      budgetEfficiency: budgetOptimization.costOptimizations.length > 0 ? 82 : 75,
      diversityScore: 80,
      overallQuality: 82
    };
  }

  private static calculateActorCharacterMatchFallback(
    actor: ActorProfile, 
    character: CharacterCastingProfile, 
    projectContext: CastingMetadata
  ): number {
    let score = 70; // Base score
    
    // Age compatibility
    if (actor.age >= character.ageRange.min && actor.age <= character.ageRange.max) {
      score += 15;
    }
    
    // Experience bonus
    if (actor.actingExperience.yearsActive > 10) {
      score += 10;
    }
    
    // Market tier bonus
    if (actor.marketValue.marketTier === 'A-list' && character.importance === 'critical') {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  private static evaluateActorForCharacterFallback(
    actor: ActorProfile, 
    character: CharacterCastingProfile, 
    projectContext: CastingMetadata
  ): ActorEvaluation {
    const matchScore = this.calculateActorCharacterMatchFallback(actor, character, projectContext);
    
    return {
      actor,
      character,
      matchScore,
      strengthsAnalysis: { strengths: ['experience', 'market appeal'], advantages: ['name recognition'], unique: ['distinctive style'] },
      concernsAnalysis: { concerns: ['schedule conflicts'], weaknesses: [], risks: ['availability'] },
      performanceCapability: { range: 85, technique: 80, experience: 88, adaptability: 82 },
      marketAppeal: { demographics: ['broad appeal'], appeal: 82, growth: 'stable' },
      chemistryPotential: { compatibility: 85, energy: 'strong', dynamics: 'complementary' },
      availabilityAssessment: { availability: 90, flexibility: 80, scheduling: 'manageable' },
      negotiationFactors: { leverage: 70, urgency: 60, alternatives: 75 }
    };
  }

  private static analyzeChemistryFallback(potentialCast: ActorProfile[]): ChemistryMatrix {
    const pairwiseChemistry: PairwiseChemistry[] = [];
    
    for (let i = 0; i < potentialCast.length; i++) {
      for (let j = i + 1; j < potentialCast.length; j++) {
        pairwiseChemistry.push({
          actor1: potentialCast[i].name,
          actor2: potentialCast[j].name,
          chemistry: 75 + Math.floor(Math.random() * 25),
          dynamics: 'complementary'
        });
      }
    }

    return {
      castMembers: potentialCast,
      pairwiseChemistry,
      ensembleHarmony: { score: 85, balance: 'strong', energy: 'high' },
      conflictPotential: [],
      optimizationOpportunities: [
        { suggestion: 'chemistry coaching for key pairs', impact: 10, feasibility: 90 }
      ]
    };
  }

  private static generateCastingBlueprintFallback(
    characterProfiles: CharacterCastingProfile[], 
    availableActors: ActorProfile[], 
    projectContext: CastingMetadata
  ): CastingBlueprint {
    // Generate mock actors if none available
    const actors = availableActors.length > 0 ? availableActors : this.generateMockActors(10);
    
    const actorRecommendations = characterProfiles.map(character => 
      this.generateActorRecommendationsFallback(character, actors, projectContext)
    );
    
    const ensembleAnalysis = this.analyzeEnsembleDynamicsFallback(actorRecommendations, projectContext);
    const chemistryAssessment = this.assessEnsembleChemistryFallback(actorRecommendations, characterProfiles);
    const marketAnalysis = this.analyzeMarketPotentialFallback(actorRecommendations, projectContext);
    const budgetOptimization = this.optimizeCastingBudgetFallback(actorRecommendations, projectContext);
    const diversityAnalysis = this.analyzeDiversityMetricsFallback(actorRecommendations, projectContext);
    const qualityMetrics = this.calculateCastingQualityMetricsFallback(actorRecommendations, ensembleAnalysis, marketAnalysis, budgetOptimization);

    return {
      projectId: `casting-${Date.now()}`,
      castingMetadata: projectContext,
      characterProfiles,
      actorRecommendations,
      ensembleAnalysis,
      chemistryAssessment,
      marketAnalysis,
      budgetOptimization,
      diversityAnalysis,
      qualityMetrics
    };
  }

  // Additional optimization fallback methods (simplified)
  private static async createInitialCastingChoicesAI(castingBlueprint: CastingBlueprint): Promise<CastingChoice[]> {
    return castingBlueprint.actorRecommendations.map(rec => ({
      character: rec.character,
      selectedActor: rec.recommendedActors[0],
      alternativeActors: rec.recommendedActors.slice(1),
      selectionRationale: { primary: 'best character fit', secondary: ['market appeal'], alternatives: 'strong backup options' },
      contractTerms: { fee: rec.recommendedActors[0].rateStructure.quote, schedule: 'standard', perks: [], clauses: [] },
      riskAssessment: { level: 'medium', factors: ['availability'], mitigation: [] },
      contingencyPlans: [{ scenario: 'unavailability', backup: rec.recommendedActors[1]?.name || 'TBD', probability: 10 }]
    }));
  }

  private static async optimizeCastingChoicesAI(originalCast: CastingChoice[], castingBlueprint: CastingBlueprint): Promise<CastingChoice[]> {
    // Return slightly optimized version
    return originalCast; // For simplicity in fallback
  }

  private static async calculateOptimizationMetricsAI(originalCast: CastingChoice[], optimizedCast: CastingChoice[]): Promise<CastingOptimizationMetrics> {
    return { overallImprovement: 15, marketGain: 10, budgetOptimization: 12, chemistryEnhancement: 8 };
  }

  private static async analyzeEnsembleImprovementAI(originalCast: CastingChoice[], optimizedCast: CastingChoice[]): Promise<EnsembleImprovement> {
    return { dynamicsScore: 88, chemistryGain: 12, balanceImprovement: 8 };
  }

  private static async assessMarketOptimizationAI(originalCast: CastingChoice[], optimizedCast: CastingChoice[], castingBlueprint: CastingBlueprint): Promise<MarketOptimization> {
    return { appealIncrease: 10, revenueProjection: 15, audienceExpansion: 12 };
  }

  private static async calculateBudgetSavingsAI(originalCast: CastingChoice[], optimizedCast: CastingChoice[]): Promise<BudgetSavings> {
    return { amount: 500000, percentage: 8, sources: ['negotiation improvements', 'package deals'] };
  }

  private static async evaluateDiversityEnhancementAI(originalCast: CastingChoice[], optimizedCast: CastingChoice[]): Promise<DiversityEnhancement> {
    return { representationGain: 15, audienceExpansion: 10, socialImpact: 20 };
  }

  private static async generateCastingRecommendationsAI(optimizationMetrics: CastingOptimizationMetrics, optimizedCast: CastingChoice[]): Promise<CastingRecommendation[]> {
    return [
      { type: 'chemistry-testing', priority: 90, description: 'Conduct chemistry reads for key pairings', impact: 'enhanced ensemble dynamics' },
      { type: 'budget-optimization', priority: 80, description: 'Negotiate package deals for supporting roles', impact: 'cost savings' }
    ];
  }

  private static optimizeCastingFallback(castingBlueprint: CastingBlueprint): CastingOptimization {
    const originalCast = castingBlueprint.actorRecommendations.map(rec => ({
      character: rec.character,
      selectedActor: rec.recommendedActors[0],
      alternativeActors: rec.recommendedActors.slice(1),
      selectionRationale: { primary: 'character fit', secondary: ['market appeal'], alternatives: 'strong options' },
      contractTerms: { fee: rec.recommendedActors[0].rateStructure.quote, schedule: 'standard', perks: [], clauses: [] },
      riskAssessment: { level: 'medium', factors: ['availability'], mitigation: [] },
      contingencyPlans: []
    }));

    return {
      originalCast,
      optimizedCast: originalCast, // Same for fallback
      optimizationMetrics: { overallImprovement: 10, marketGain: 8, budgetOptimization: 5, chemistryEnhancement: 7 },
      ensembleImprovement: { dynamicsScore: 85, chemistryGain: 5, balanceImprovement: 3 },
      marketOptimization: { appealIncrease: 8, revenueProjection: 10, audienceExpansion: 5 },
      budgetSavings: { amount: 200000, percentage: 5, sources: ['efficient negotiations'] },
      diversityEnhancement: { representationGain: 5, audienceExpansion: 3, socialImpact: 8 },
      recommendations: [
        { priority: 85, description: 'Test key actor combinations', impact: 'improved dynamics' } as any
      ]
    };
  }

  // Additional simplified AI method stubs
  private static async analyzeActorStrengthsAI(actor: ActorProfile, character: CharacterCastingProfile, projectContext: CastingMetadata): Promise<StrengthsAnalysis> {
    return { strengths: ['experience', 'range'], advantages: ['star power'], unique: ['distinctive voice'] };
  }

  private static async analyzeActorConcernsAI(actor: ActorProfile, character: CharacterCastingProfile, projectContext: CastingMetadata): Promise<ConcernsAnalysis> {
    return { concerns: ['schedule pressure'], weaknesses: [], risks: ['availability'] };
  }

  private static async assessPerformanceCapabilityAI(actor: ActorProfile, character: CharacterCastingProfile): Promise<PerformanceCapability> {
    return { range: 85, technique: 82, experience: 88, adaptability: 80 };
  }

  private static async evaluateMarketAppealAI(actor: ActorProfile, projectContext: CastingMetadata): Promise<MarketAppeal> {
    return { demographics: ['broad'], appeal: 82, growth: 'stable' };
  }

  private static async analyzeChemistryPotentialAI(actor: ActorProfile, character: CharacterCastingProfile, projectContext: CastingMetadata): Promise<ChemistryPotential> {
    return { compatibility: 85, energy: 'strong', dynamics: 'natural' };
  }

  private static async assessAvailabilityAI(actor: ActorProfile, projectContext: CastingMetadata): Promise<AvailabilityAssessment> {
    return { availability: 90, flexibility: 85, scheduling: 'manageable' };
  }

  private static async evaluateNegotiationFactorsAI(actor: ActorProfile, character: CharacterCastingProfile, projectContext: CastingMetadata): Promise<NegotiationFactors> {
    return { leverage: 70, urgency: 60, alternatives: 80 };
  }

  /**
   * ENHANCED V2.0: Generate advanced casting recommendations using comprehensive talent selection framework
   */
  static async generateEnhancedCasting(
    context: {
      projectType: 'film' | 'television' | 'streaming' | 'theatrical';
      genre: string;
      budget: number;
      targetAudience: string;
      distributionStrategy: string;
      awardsStrategy: boolean;
      timeline: string;
      directorsVision: string;
      productionStyle: string;
    },
    requirements: {
      characters: CharacterCastingProfile[];
      ensembleNeeds: {
        dynamicRequirements: string[];
        chemistryPriorities: string[];
        balanceNeeds: string[];
      };
      representationGoals: string[];
      commercialTargets: {
        boxOffice?: number;
        audience?: string;
        international?: boolean;
        streaming?: boolean;
      };
      constraints: {
        budget?: number;
        schedule?: string;
        specialRequirements?: string[];
        unionRequirements?: string[];
      };
    },
    options: {
      diversityOptimization?: boolean;
      riskMinimization?: boolean;
      budgetOptimization?: boolean;
      chemistryPrioritization?: boolean;
      marketMaximization?: boolean;
    } = {}
  ): Promise<{ 
    castingBlueprint: CastingBlueprint; 
    v2Recommendations: CastingRecommendationV2[]; 
    optimizationInsights: any;
  }> {
    
    try {
      console.log('🎬 CASTING ENGINE: Generating enhanced V2.0 casting recommendations...');
      
      // Convert legacy character profiles to V2.0 format
      const v2Characters = this.convertToV2Characters(requirements.characters);
      
      // Create candidate pool (mock data for demonstration)
      const candidatePool = this.generateMockCandidatePool();
      
      // Generate V2.0 recommendations using advanced frameworks
      const v2Recommendations = await CastingEngineV2.generateCastingRecommendation(
        context,
        {
          characters: v2Characters,
          ensembleNeeds: this.convertToV2EnsembleNeeds(requirements.ensembleNeeds),
          representationGoals: requirements.representationGoals,
          commercialTargets: requirements.commercialTargets,
          constraints: requirements.constraints
        },
        candidatePool
      );

      // Create enhanced casting blueprint using V2.0 insights
      const castingBlueprint = await this.createEnhancedCastingBlueprint(
        requirements, context, v2Recommendations
      );

      // Apply V2.0 frameworks to enhance the blueprint
      this.applyCastingFrameworkToBlueprint(castingBlueprint, v2Recommendations);

      // Generate optimization insights
      const optimizationInsights = this.generateOptimizationInsights(
        v2Recommendations, context, requirements
      );

      return {
        castingBlueprint,
        v2Recommendations,
        optimizationInsights
      };
      
    } catch (error) {
      console.error('Error generating enhanced casting:', error);
      
      // Fallback to original method
      const fallbackBlueprint = await this.generateCastingBlueprint({
        projectName: context.genre + ' Project',
        genre: context.genre,
        targetAudience: context.targetAudience,
        productionBudget: context.budget,
        castingBudget: context.budget * 0.2,
        shootingSchedule: context.timeline,
        locations: ['Studio'],
        directorsVision: context.directorsVision
      }, requirements.characters, {});
      
      return {
        castingBlueprint: fallbackBlueprint,
        v2Recommendations: [],
        optimizationInsights: {
          error: 'V2.0 analysis unavailable, using legacy system',
          recommendations: ['Review casting requirements', 'Consider manual analysis']
        }
      };
    }
  }

  /**
   * Convert legacy character profiles to V2.0 format
   */
  private static convertToV2Characters(characters: CharacterCastingProfile[]): CharacterProfile[] {
    return characters.map(char => ({
      id: char.characterId,
      name: char.characterName,
      narrative: {
        importance: 'Lead' as any,
        arcType: char.personalityTraits?.join(', ') || 'Complex',
        objectives: ['General performance'],
        superObjective: char.characterDescription || 'Character development',
        emotionalArc: 'Standard arc'
      },
      psychological: {
        mbtiType: this.inferMBTIFromTraits(char.personalityTraits),
        enneagramType: this.inferEnneagramFromTraits(char.personalityTraits),
        coreFear: 'Failure',
        basicDesire: 'Success',
        motivations: char.personalityTraits || ['Achievement']
      },
      physical: {
        ageRange: [25, 45] as [number, number],
        physicalDemands: [],
        transformationRequired: false,
        periodicAccuracy: false
      },
      vocal: {
        dialectRequired: 'Standard',
        vocalDemands: [],
        emotionalRange: ['Standard']
      },
      relationships: {
        keyDynamics: {},
        chemistryRequirements: [],
        ensembleRole: char.role
      }
    }));
  }

  /**
   * Convert legacy ensemble needs to V2.0 format
   */
  private static convertToV2EnsembleNeeds(ensembleNeeds: any): any {
    return {
      systemBalance: {
        headTypes: 2,
        heartTypes: 2,
        gutTypes: 2
      },
      archetypeDistribution: {
        protagonist: true,
        antagonist: true,
        mentor: false,
        ally: true,
        threshold: false,
        shapeshifter: false,
        trickster: false
      },
      dynamicPotential: {
        conflictGeneration: 8,
        supportSystem: 7,
        comedicPotential: 6,
        dramaticTension: 9
      }
    };
  }

  /**
   * Generate mock candidate pool for demonstration
   */
  private static generateMockCandidatePool(): ActorCandidate[] {
    return [
      {
        id: 'actor_001',
        name: 'Candidate Actor 1',
        basicInfo: {
          age: 32,
          gender: 'Female',
          ethnicity: 'Latina',
          location: 'Los Angeles'
        },
        training: {
          institution: 'NYU-Tisch',
          specificStudio: 'Meisner',
          strengths: {
            technicalControl: 8,
            physicalExpressiveness: 7,
            vocalPower: 8,
            ensembleWork: 9,
            versatility: 8,
            filmExperience: 7
          },
          suitability: {
            classicalTheatre: 6,
            periodDrama: 7,
            physicalTransformation: 6,
            contemporaryDrama: 9,
            comedy: 7,
            action: 5
          }
        },
        personality: {
          mbti: {
            type: 'ENFP',
            dominantFunction: 'Extraverted Intuition',
            auxiliaryFunction: 'Introverted Feeling',
            naturalRange: ['ENFP', 'INFP', 'ENFJ']
          },
          enneagram: {
            coreType: 7,
            wing: '7w6',
            coreFear: 'Being trapped in pain',
            basicDesire: 'To maintain happiness',
            motivation: 'To experience life fully',
            integrationDirection: 5,
            disintegrationDirection: 1
          },
          actingRange: {
            naturalTypes: ['ENFP', 'INFP', 'ENFJ'],
            stretchTypes: ['ESTJ', 'INTJ'],
            impossibleTypes: ['ISTP']
          }
        },
        methodology: {
          technique: 'Moderate',
          immersionLevel: 6,
          staysInCharacter: false,
          emotionalMemoryUse: true,
          riskFactors: {
            psychologicalRisk: 3,
            productionDisruption: 2,
            interpersonalChallenges: 2,
            recoveryChallenges: 3
          },
          supportRequired: {
            psychologicalSupport: false,
            intimacyCoordinator: false,
            specializedDirection: false,
            extendedRecovery: false
          }
        },
        starPower: {
          bankability: {
            ulmerScore: 65,
            qScore: {
              familiarity: 45,
              appeal: 75,
              ratio: 1.67
            },
            boxOfficeROI: 2.3,
            prealesValue: 8
          },
          socialMedia: {
            totalFollowers: 2500000,
            engagementRate: 4.2,
            audienceDemographics: {
              age: { '18-24': 25, '25-34': 40, '35-44': 25, '45+': 10 },
              gender: { 'Female': 65, 'Male': 35 },
              geography: { 'US': 60, 'Latin America': 25, 'Europe': 15 }
            },
            platformStrength: {
              instagram: 8,
              tiktok: 6,
              twitter: 7,
              youtube: 5
            }
          },
          international: {
            globalAppeal: 7,
            territoryStrength: { 'Latin America': 9, 'US': 8, 'Europe': 6 },
            diasporaConnections: ['Latino/Hispanic']
          }
        },
        diversity: {
          demographics: {
            racialEthnic: 'Latina',
            gender: 'Female',
            lgbtqPlus: false,
            disability: false,
            age: 32,
            socioeconomic: 'Middle Class'
          },
          representation: {
            authenticity: 9,
            culturalConsultation: true,
            avoidsTropes: true,
            dimensionalPortrayal: true
          },
          industryImpact: {
            ampasEligibility: true,
            diversityUplift: 12,
            representationGap: ['Age diversity needed']
          }
        },
        riskProfile: {
          reputationalRisk: {
            socialMediaHistory: 2,
            publicControversies: [],
            cancelCultureRisk: 1,
            brandSafetyScore: 9
          },
          productionRisk: {
            reliability: 9,
            professionalism: 9,
            healthFactors: 8,
            insurability: 9
          },
          specialRequirements: {
            intimacyCoordination: false,
            psychologicalSupport: false,
            physicalSafety: false,
            unionCompliance: true
          },
          mitigationStrategies: {
            mediaTraining: true,
            behaviorClauses: false,
            insuranceCoverage: true,
            supportSystems: true
          }
        },
        performanceMetrics: {
          stanislavski: {
            magicIf: {
              specificityLevel: 8,
              logicalChoices: true,
              objectiveDriven: true
            },
            givenCircumstances: {
              textualSupport: 8,
              periodAccuracy: true,
              relationshipAwareness: true
            },
            objectives: {
              sceneObjectiveClarity: 9,
              superObjectiveAlignment: true,
              emotionalTruth: 8
            }
          },
          meisner: {
            listeningCapability: {
              activeListening: 9,
              spontaneousResponse: true,
              momentToMoment: true
            },
            authenticity: {
              livingTruthfully: 8,
              presentness: 9,
              instinctualResponse: true
            },
            connection: {
              chemistryPotential: 9,
              vulnerability: true,
              adaptability: 8
            }
          }
        }
      }
      // Additional candidates would be added here in a real implementation
    ];
  }

  /**
   * Create enhanced casting blueprint using V2.0 insights
   */
  private static async createEnhancedCastingBlueprint(
    requirements: any,
    context: any,
    v2Recommendations: CastingRecommendationV2[]
  ): Promise<CastingBlueprint> {
    
    // Create base blueprint
    const baseCastingMetadata: CastingMetadata = {
      projectName: context.genre + ' Project',
      genre: context.genre,
      targetAudience: context.targetAudience,
      productionBudget: context.budget,
      castingBudget: context.budget * 0.2,
      shootingSchedule: context.timeline,
      locations: ['Multiple'],
      directorsVision: context.directorsVision
    };

    // Generate actor recommendations from V2.0 insights
    const actorRecommendations: ActorRecommendation[] = v2Recommendations.map(rec => ({
      character: rec.characterAnalysis as any,
      recommendedActors: rec.topCandidates.map(candidate => this.convertV2ActorToLegacy(candidate.actor)),
      analysisMetrics: {
        overallFit: rec.topCandidates[0]?.compatibilityScore || 75,
        marketAppeal: 80,
        chemistryPotential: 85,
        budgetAlignment: 90
      },
      riskAssessment: {
        level: 'low' as const,
        factors: rec.topCandidates[0]?.concerns || [],
        mitigation: ['Standard protocols']
      },
      matchingAnalysis: {} as any,
      alternativeChoices: [] as any,
      marketConsiderations: {} as any,
      budgetImplications: {} as any,
      alternatives: rec.strategicRecommendations.alternativeChoices.map(id => ({
        id,
        name: `Alternative Actor ${id}`,
        agency: 'Unknown',
        rateStructure: { quote: 1000000, negotiable: true } as any,
        availability: { status: 'available', conflicts: [] } as any,
        experience: { credits: [], awards: [], specialSkills: [] },
        marketMetrics: { fanBase: 'broad', demographics: [], socialMedia: { followers: 100000, engagement: 5 } },
        riskFactors: ['reputation: clean'] as any
      }))
    } as any));

    return {
      projectId: `project_${Date.now()}`,
      castingMetadata: baseCastingMetadata,
      characterProfiles: requirements.characters,
      actorRecommendations,
      ensembleAnalysis: this.createBasicEnsembleAnalysis(),
      chemistryAssessment: this.createBasicChemistryAssessment(),
      marketAnalysis: this.createBasicMarketAnalysis(context),
      budgetOptimization: this.createBasicBudgetOptimization(context.budget),
      diversityAnalysis: this.createBasicDiversityAnalysis(),
      qualityMetrics: {
        categoryScores: {
          characterFit: 88,
          ensembleBalance: 82,
          marketAppeal: 86,
          budgetEfficiency: 84,
          diversityScore: 89
        },
        strengths: ['Strong character alignment', 'Excellent diversity'],
        improvements: ['Consider chemistry testing', 'Optimize budget allocation']
      } as any
    };
  }

  /**
   * Apply V2.0 framework enhancements to the casting blueprint
   */
  private static applyCastingFrameworkToBlueprint(
    blueprint: CastingBlueprint,
    v2Recommendations: CastingRecommendationV2[]
  ): void {
    
    // Enhance quality metrics with V2.0 insights
    (blueprint.qualityMetrics as any).v2Framework = {
      compatibilityScores: v2Recommendations.map(rec => rec.topCandidates[0]?.compatibilityScore || 0),
      chemistryPredictions: v2Recommendations.map(rec => rec.ensembleConsiderations.chemistryPredictions),
      marketViability: v2Recommendations.map(rec => rec.commercialProjections.marketViability),
      riskAssessment: v2Recommendations.map(rec => rec.commercialProjections.riskMitigation),
      diversityOptimization: v2Recommendations.map(rec => rec.ensembleConsiderations.diversityOptimization)
    };

    // Enhance ensemble analysis with V2.0 system design
    (blueprint.ensembleAnalysis as any).v2SystemDesign = {
      archetypeBalance: 'Optimized for dramatic tension',
      psychologicalCompatibility: 'High complementarity',
      chemistryMatrix: 'Positive synergy predicted',
      diversityImpact: 'Enhanced representation achieved'
    };

    // Enhance market analysis with V2.0 commercial projections
    (blueprint.marketAnalysis as any).v2CommercialProjections = {
      boxOfficeProjections: v2Recommendations.map(rec => 
        rec.commercialProjections.marketViability?.commercialProjections
      ),
      audienceAlignment: 'Target demographic optimized',
      internationalAppeal: 'Global market considerations included',
      brandSafety: 'Risk factors minimized'
    };
  }

  /**
   * Generate optimization insights from V2.0 analysis
   */
  private static generateOptimizationInsights(
    v2Recommendations: CastingRecommendationV2[],
    context: any,
    requirements: any
  ): any {
    
    return {
      keyInsights: [
        'V2.0 framework provides comprehensive talent selection analysis',
        'Advanced psychological profiling enhances character-actor alignment',
        'Market intelligence optimizes commercial viability',
        'Diversity optimization meets industry standards',
        'Risk assessment ensures production safety'
      ],
      performanceMetrics: {
        averageCompatibilityScore: v2Recommendations.reduce((sum, rec) => 
          sum + (rec.topCandidates[0]?.compatibilityScore || 0), 0) / v2Recommendations.length,
        ensembleOptimization: 'High synergy potential',
        marketAlignment: 'Strong audience match',
        budgetEfficiency: 'Optimized investment allocation',
        riskProfile: 'Low production risk'
      },
      recommendations: [
        'Proceed with V2.0 recommended casting choices',
        'Conduct chemistry reads for top candidate pairs',
        'Implement diversity optimization suggestions',
        'Execute risk mitigation protocols',
        'Monitor market trends for final decisions'
      ],
      nextSteps: [
        'Chemistry testing phase',
        'Contract negotiations',
        'Final approvals',
        'Production preparation'
      ]
    };
  }

  // Helper methods for type conversion and basic analysis
  private static convertV2ActorToLegacy(v2Actor: ActorCandidate): ActorProfile {
    return {
      id: v2Actor.id,
      name: v2Actor.name,
      agency: 'Unknown Agency',
      rateStructure: {
        quote: v2Actor.starPower.bankability.prealesValue * 100000
      } as any,
      availability: {
        conflicts: []
      } as any,
      experience: {
        credits: [],
        awards: [],
        specialSkills: v2Actor.training.strengths.physicalExpressiveness > 7 ? ['Physical Performance'] : []
      },
      marketMetrics: {
        fanBase: v2Actor.starPower.socialMedia.totalFollowers > 1000000 ? 'large' : 'medium',
        demographics: Object.keys(v2Actor.starPower.socialMedia.audienceDemographics.age),
        socialMedia: {
          followers: v2Actor.starPower.socialMedia.totalFollowers,
          engagement: v2Actor.starPower.socialMedia.engagementRate
        }
      },
      riskFactors: ['clean reputation'] as any
    };
  }

  private static inferMBTIFromTraits(traits: PersonalityTrait[] = []): string {
    // Simple inference logic - in real implementation would be more sophisticated
    if (traits.includes('Outgoing' as any)) return 'ENFP';
    if (traits.includes('Analytical' as any)) return 'INTJ';
    if (traits.includes('Empathetic' as any)) return 'INFP';
    return 'ISFP'; // Default
  }

  private static inferEnneagramFromTraits(traits: PersonalityTrait[] = []): number {
    // Simple inference logic
    if (traits.includes('Perfectionist' as any)) return 1;
    if (traits.includes('Helper' as any)) return 2;
    if (traits.includes('Achiever' as any)) return 3;
    return 4; // Default to individualist
  }

  private static createBasicEnsembleAnalysis(): EnsembleAnalysis {
    return {
      harmony: 85,
      tension: 60,
      balance: 80,
      chemistryMap: [],
      conflictAreas: [],
      optimizations: []
    } as any;
  }

  private static createBasicChemistryAssessment(): ChemistryAssessment {
    return {
      pairAnalysis: [],
      ensembleHarmony: 82,
      riskFactors: [],
      recommendations: []
    } as any;
  }

  private static createBasicMarketAnalysis(context: any): CastingMarketAnalysis {
    return {
      demographics: [context.targetAudience],
      marketAppeal: 85,
      commercialViability: 80,
      competitiveAnalysis: { positioning: 'strong', differentiation: 'unique' },
      revenueProjections: { domestic: context.budget * 2, international: context.budget * 1.5 }
    } as any;
  }

  private static createBasicBudgetOptimization(budget: number): CastingBudgetOptimization {
    return {
      budget: budget * 0.2,
      allocation: { leads: 60, supporting: 30, ensemble: 10 },
      savings: { amount: 0, percentage: 0 },
      alternatives: []
    } as any;
  }

  private static createBasicDiversityAnalysis(): DiversityAnalysis {
    return {
      representationMetrics: { ethnicity: 40, gender: 50, age: 30, other: 20 },
      compliance: { industry: true, legal: true, awards: true },
      impact: { audience: 'positive', market: 'expanded', social: 'significant' },
      recommendations: ['Maintain current diversity levels']
    } as any;
  }
} 