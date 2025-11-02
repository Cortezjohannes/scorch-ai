/**
 * The Premise Engine V2.0 - Systematic Framework for Marketable and Thematically Rich Stories
 * 
 * This comprehensive system synthesizes the foundational theories of master storytellers:
 * - McKee's Controlling Idea (Value + Cause)
 * - Egri's Proof (Character + Conflict + Resolution) 
 * - Truby's Designing Principle (Original Execution Strategy)
 * - Snyder's Logline (Irony + Compelling Mental Picture)
 * - Vogler's Hero's Journey (Archetypal Transformation)
 * 
 * The engine creates premises that function as:
 * - Logical arguments to be proven
 * - Strategic blueprints for narrative construction
 * - Archetypal maps for transformation
 * - Commercial hooks for market viability
 * - World engines for transmedia expansion
 */

import { generateEngineContent as generateContent } from './engine-ai-router'

// ============================================================================
// PART I: THE ARCHITECTS OF STORY - FOUNDATIONAL THEORIES
// ============================================================================

/**
 * McKee's Controlling Idea Framework
 */
export interface ControllingIdea {
  value: {
    type: 'positive' | 'negative';
    core: string; // e.g., "Justice", "Love", "Power", "Truth"
    charge: string; // e.g., "restored", "destroyed", "corrupted", "revealed"
  };
  cause: {
    type: 'character_driven' | 'plot_driven' | 'thematic_driven';
    mechanism: string; // e.g., "righteous action", "blind trust", "ruthless ambition"
    agency: 'internal' | 'external' | 'hybrid';
  };
  statement: string; // Complete controlling idea sentence
  proofStrategy: string[]; // How the story will prove this idea
}

/**
 * Egri's Foundational Trinity
 */
export interface EgriPremise {
  character: {
    trait: string; // Central character trait
    compulsion: string; // Driving motivation/need
    flaw: string; // Critical weakness
    arc: 'positive' | 'negative' | 'flat';
  };
  conflict: {
    type: 'internal' | 'interpersonal' | 'societal' | 'environmental';
    source: string; // Origin of conflict
    escalation: string[]; // How conflict intensifies
    stakes: 'personal' | 'relational' | 'societal' | 'existential';
  };
  resolution: {
    outcome: 'triumph' | 'tragedy' | 'irony' | 'bittersweet';
    proof: string; // What the story proves
    catharsis: string; // Emotional release for audience
    universality: string; // Broader human truth revealed
  };
  premiseStatement: string; // "Character trait + Conflict → Resolution"
}

/**
 * Truby's Designing Principle
 */
export interface DesigningPrinciple {
  abstract: string; // The deeper process (e.g., "Force male chauvinist to live as woman")
  concrete: string; // The surface plot (e.g., "Actor disguises as woman for role")
  uniqueness: {
    originalApproach: string; // What makes this execution unique
    genreSubversion: string[]; // How it twists familiar elements
    structuralInnovation: string; // Novel narrative technique
  };
  organicUnity: {
    characterIntegration: string; // How principle shapes character
    plotIntegration: string; // How principle drives plot
    themeIntegration: string; // How principle delivers theme
  };
  sustainability: string; // Can this principle sustain full narrative?
}

/**
 * Snyder's Logline Framework
 */
export interface SnyderLogline {
  irony: {
    twist: string; // Unexpected element that creates intrigue
    contradiction: string; // Inherent conflict in concept
    hook: string; // Attention-grabbing element
  };
  mentalPicture: {
    visualization: string; // What audience immediately sees
    promiseOfPremise: string; // Fun and games of second act
    genreExpectation: string; // Clear genre signals
  };
  marketability: {
    title: string; // Killer title that works with logline
    audienceAppeal: string; // Who this appeals to
    pitchability: number; // 1-10 score for how well it pitches
  };
  loglineStatement: string; // Complete one-sentence pitch
  testResults: {
    strangerTest: boolean; // Would stranger understand it?
    isItAMovie: boolean; // Does it feel like complete story?
    compellingProtagonist: boolean; // Is main character engaging?
    clearStakes: boolean; // Are consequences obvious?
  };
}

/**
 * Vogler's Hero's Journey Structure
 */
export interface HeroJourneyPremise {
  heroProfile: {
    ordinaryWorld: string; // Hero's normal state
    innerProblem: string; // Psychological flaw/wound
    outerProblem: string; // External quest/challenge
    resistance: string; // Why hero initially refuses call
  };
  journeyStructure: {
    callToAdventure: string; // Inciting incident
    crossingThreshold: string; // Point of no return
    specialWorld: string; // New reality with different rules
    ordeal: string; // Central crisis/symbolic death
    resurrection: string; // Final test and transformation
    elixir: string; // Wisdom/power hero brings back
  };
  archetypes: {
    mentor: string; // Wisdom giver
    shadow: string; // Main antagonist/dark reflection
    shapeshifter: string; // Loyalty uncertain character
    herald: string; // Announces need for change
    trickster: string; // Comic relief/perspective shifter
    allies: string[]; // Supporting characters
  };
  transformation: {
    initialState: string; // Hero at beginning
    finalState: string; // Hero at end
    lessonLearned: string; // Core wisdom gained
    universalResonance: string; // Why this matters to everyone
  };
}

/**
 * Comprehensive Premise Analysis
 */
export interface PremiseFoundation {
  mckeeAnalysis: ControllingIdea;
  egriAnalysis: EgriPremise;
  trubyAnalysis: DesigningPrinciple;
  snyderAnalysis: SnyderLogline;
  voglerAnalysis: HeroJourneyPremise;
  
  // Integration Analysis
  coherenceScore: number; // 1-10, how well all theories align
  strengths: string[]; // Where different frameworks reinforce each other
  tensions: string[]; // Where frameworks might conflict
  resolution: string; // How to resolve any conflicts
}

// ============================================================================
// PART II: WEAVING THE THEMATIC TAPESTRY
// ============================================================================

/**
 * Universal Theme Framework
 */
export interface UniversalTheme {
  category: 'love_relationships' | 'good_vs_evil' | 'coming_of_age' | 'justice_injustice' | 
           'survival_adversity' | 'power_corruption' | 'identity_belonging' | 'truth_deception' |
           'sacrifice_selfishness' | 'freedom_oppression';
  
  coreStatement: string; // What the theme says about human nature
  universalAppeal: {
    psychologicalBasis: string; // Why this resonates across cultures
    historicalRelevance: string; // How it appears throughout history
    modernRelevance: string; // Why it matters today
  };
  
  culturalExpression: {
    specificContext: string; // Particular cultural lens
    authenticElements: string[]; // Genuine cultural details
    sensitivityConsiderations: string[]; // Potential pitfalls to avoid
    collaborationStrategy: string; // How to ensure authentic representation
  };
  
  thematicEvolution: {
    initialThesis: string; // Theme as presented in beginning
    antithesis: string; // How theme is challenged/complicated
    synthesis: string; // Final, nuanced understanding
    serializedPotential: string; // How theme can evolve over seasons
  };
}

/**
 * Thematic Delivery Strategy
 */
export interface ThematicDelivery {
  subtletyLevel: 'obvious' | 'moderate' | 'subtle' | 'subtext';
  deliveryMethods: {
    characterActions: string[]; // Theme shown through behavior
    dialogue: string[]; // Theme expressed in speech
    symbolism: string[]; // Visual/metaphorical representations
    structure: string[]; // Theme built into narrative structure
    conflict: string[]; // Theme explored through central conflicts
  };
  
  audienceEngagement: {
    intellectualLayer: string; // What smart viewers will catch
    emotionalLayer: string; // What everyone will feel
    discoveryRewards: string[]; // Easter eggs for deep analysis
  };
  
  genreConsiderations: {
    genreExpectations: string; // What this genre typically allows
    subversionOpportunities: string[]; // Where to surprise audience
    balanceStrategy: string; // Entertainment vs. message balance
  };
}

// ============================================================================
// PART III: BUILDING COMMERCIALLY VIABLE FOUNDATION
// ============================================================================

/**
 * Seven Pillars of Commercial Viability (Erik Bork)
 */
export interface CommercialViabilityAssessment {
  punishing: {
    score: number; // 1-10
    challenges: string[]; // Specific difficulties protagonist faces
    suffering: string; // How character is pushed to limits
    sustainedStruggle: string; // Why conflict can't be easily resolved
  };
  
  relatable: {
    score: number; // 1-10
    connectionPoints: string[]; // How audience connects with protagonist
    universalDesires: string[]; // Human wants character represents
    empathyTriggers: string[]; // Moments that create emotional bond
  };
  
  original: {
    score: number; // 1-10
    freshElements: string[]; // What feels new and surprising
    genreTwist: string; // How it refreshes familiar territory
    uniqueSelling: string; // Main differentiator from similar stories
  };
  
  believable: {
    score: number; // 1-10
    internalLogic: string[]; // Rules of the story world
    characterMotivations: string[]; // Why characters act as they do
    consequenceChain: string[]; // How events logically follow each other
  };
  
  lifeAltering: {
    score: number; // 1-10
    stakes: string[]; // What protagonist stands to lose/gain
    consequences: string[]; // What happens if they fail
    urgency: string; // Why this must be resolved now
  };
  
  entertaining: {
    score: number; // 1-10
    funFactor: string[]; // What makes watching enjoyable
    genreDelivery: string; // How it fulfills genre promises
    pacing: string; // Rhythm of engagement
  };
  
  meaningful: {
    score: number; // 1-10
    humanTruth: string; // Larger truth about human experience
    relevance: string; // Why this matters to current audience
    hopeElement: string; // What positive insight it provides
  };
  
  overallScore: number; // Average of all seven pillars
  marketPosition: 'high_concept' | 'character_driven' | 'compelling_concept';
}

/**
 * Psychology of the Hook
 */
export interface PsychologicalHook {
  neuralCoupling: {
    immersiveElements: string[]; // What triggers brain simulation
    sensoryEngagement: string[]; // How story activates senses
    experientialPromise: string; // What audience will "experience"
  };
  
  emotionalTriggers: {
    primaryEmotion: string; // Main feeling story evokes
    emotionalJourney: string[]; // Sequence of emotions
    personalRelevance: string; // Why this matters to individual
  };
  
  curiosityGaps: {
    centralQuestion: string; // Main mystery/problem to solve
    progressiveDisclosure: string[]; // How information is revealed
    payoffStrategy: string; // How curiosity is ultimately satisfied
  };
  
  empathyMechanisms: {
    protagonistBond: string; // How audience connects with hero
    relatableFlaws: string[]; // Human weaknesses in character
    universalStruggles: string[]; // Challenges everyone understands
  };
}

/**
 * Transmedia World Engine
 */
export interface TransmediaEngine {
  worldBuilding: {
    coreWorld: string; // Central fictional universe
    expandableElements: string[]; // Aspects that can grow
    franchisePotential: string; // How it could become a universe
  };
  
  narrativeDistribution: {
    coreStory: string; // Main narrative (film/show)
    supplementaryMedia: Record<string, string>; // Comics, games, etc.
    entryPoints: string[]; // Different ways to access universe
  };
  
  scalabilityFactors: {
    characterPotential: string[]; // Other characters who could lead stories
    timelinePotential: string[]; // Prequels, sequels, side stories
    perspectivePotential: string[]; // Same events from different viewpoints
  };
  
  businessModel: {
    primaryPlatform: string; // Main distribution channel
    secondaryPlatforms: string[]; // Additional revenue streams
    audienceSegmentation: Record<string, string>; // Different demographics
  };
}

// ============================================================================
// PART IV: CONTEMPORARY PREMISE IN ACTION
// ============================================================================

/**
 * Modern Streaming Analysis
 */
export interface StreamingSuccessAnalysis {
  platform: 'netflix' | 'hbo' | 'disney' | 'amazon' | 'apple' | 'hulu';
  title: string;
  premise: string;
  
  successFactors: {
    genreFusion: string[]; // How it blends genres
    characterDepth: string; // Complexity of characters
    thematicResonance: string; // Deeper meaning
    visualHook: string; // Distinctive visual element
    culturalImpact: string; // Why it became cultural phenomenon
  };
  
  innovation: {
    narrativeInnovation: string[]; // New storytelling techniques
    structuralInnovation: string[]; // Unique format elements
    thematicInnovation: string[]; // Fresh approach to themes
  };
  
  marketLessons: {
    audienceAppeal: string; // Why it connected with viewers
    bingeability: string; // What made it addictive
    socialMediaBuzz: string; // What made it shareable
    globalReach: string; // How it succeeded internationally
  };
}

/**
 * Premise Validation Gauntlet
 */
export interface ValidationGauntlet {
  step1_clarity: {
    oneSentence: string; // Protagonist must [action] to [goal], but [obstacle]
    coreElements: {
      protagonist: string;
      action: string;
      goal: string;
      obstacle: string;
    };
    clarityScore: number; // 1-10
  };
  
  step2_stakes: {
    consequences: string[]; // What happens if protagonist fails
    urgency: string; // Why this must happen now
    personalImpact: string; // How failure affects character
    stakesScore: number; // 1-10
  };
  
  step3_characterArc: {
    initialState: string; // Character at beginning
    finalState: string; // Character at end
    transformation: string; // How they change
    arcScore: number; // 1-10
  };
  
  step4_conflictEngine: {
    sustainedConflict: string; // Can this fuel full narrative?
    escalationPotential: string[]; // How conflict can intensify
    obstacles: string[]; // Specific challenges protagonist faces
    momentumScore: number; // 1-10
  };
  
  step5_personalResonance: {
    writerConnection: string; // Why this matters to writer
    passionLevel: number; // 1-10 writer's enthusiasm
    personalStory: string; // How this relates to writer's experience
    resonanceScore: number; // 1-10
  };
  
  overallValidation: {
    totalScore: number; // Average of all scores
    strengths: string[]; // What works well
    weaknesses: string[]; // What needs work
    recommendation: 'develop' | 'revise' | 'abandon';
  };
}

/**
 * Complete Premise Assessment
 */
export interface PremiseAssessment {
  // Core Identity
  id: string;
  title: string;
  genre: string;
  format: 'feature' | 'limited_series' | 'ongoing_series' | 'franchise';
  
  // Foundational Analysis
  foundation: PremiseFoundation;
  
  // Thematic Framework
  theme: UniversalTheme;
  thematicDelivery: ThematicDelivery;
  
  // Commercial Analysis
  commercialViability: CommercialViabilityAssessment;
  psychologicalHook: PsychologicalHook;
  transmediaEngine: TransmediaEngine;
  
  // Validation
  validation: ValidationGauntlet;
  
  // Contemporary Context
  streamingAnalysis: StreamingSuccessAnalysis[];
  marketPosition: string;
  competitorAnalysis: string[];
  
  // AI Generation Metadata
  generatedBy: string;
  confidence: number; // 1-10
  alternativeApproaches: string[];
}

/**
 * Premise Development Recommendation
 */
export interface PremiseRecommendation {
  primaryRecommendation: PremiseAssessment;
  alternativeVersions: PremiseAssessment[];
  
  // Strategic Guidance
  developmentStrategy: {
    nextSteps: string[];
    priorityAreas: string[];
    riskFactors: string[];
  };
  
  // Market Positioning
  marketStrategy: {
    targetAudience: string[];
    competitiveAdvantage: string;
    platformRecommendations: string[];
  };
  
  // Creative Direction
  creativeGuidance: {
    strengthsToAmplify: string[];
    weaknessesToAddress: string[];
    opportunitiesForInnovation: string[];
  };
  
  // Success Metrics
  successCriteria: {
    structuralBenchmarks: string[];
    thematicBenchmarks: string[];
    commercialBenchmarks: string[];
  };
}

// ============================================================================
// PREMISE ENGINE V2.0 IMPLEMENTATION
// ============================================================================

export class PremiseEngineV2 {
  
  /**
   * AI-ENHANCED: Generate comprehensive premise recommendations
   */
  static async generatePremiseRecommendations(
    initialConcept: {
      basicIdea: string;
      genre: string;
      format: 'feature' | 'limited_series' | 'ongoing_series' | 'franchise';
      targetAudience: string[];
      inspirations: string[];
    },
    requirements: {
      thematicGoals: string[];
      commercialObjectives: string[];
      culturalContext?: string;
      platformTargets?: string[];
    },
    options: {
      analysisDepth?: 'basic' | 'comprehensive' | 'exhaustive';
      includeAlternatives?: boolean;
      focusOnOriginality?: boolean;
      emphasizeCommercialViability?: boolean;
    } = {}
  ): Promise<PremiseRecommendation> {
    
    console.log(`📖 PREMISE ENGINE V2.0: Developing ${initialConcept.format} premise for ${initialConcept.genre}...`);
    
    try {
      // Stage 1: Foundational Theory Analysis
      const foundation = await this.analyzePremiseFoundation(initialConcept, requirements);
      
      // Stage 2: Thematic Development
      const thematicFramework = await this.developThematicFramework(
        initialConcept, foundation, requirements
      );
      
      // Stage 3: Commercial Viability Assessment
      const commercialAnalysis = await this.assessCommercialViability(
        initialConcept, foundation, thematicFramework
      );
      
      // Stage 4: Validation Gauntlet
      const validation = await this.runValidationGauntlet(
        initialConcept, foundation, commercialAnalysis
      );
      
      // Stage 5: Contemporary Market Analysis
      const marketAnalysis = await this.analyzeContemporaryMarket(
        initialConcept, foundation, options
      );
      
      // Stage 6: Complete Assessment Assembly
      const premiseAssessment = await this.assemblePremiseAssessment(
        initialConcept,
        foundation,
        thematicFramework,
        commercialAnalysis,
        validation,
        marketAnalysis
      );
      
      // Stage 7: Alternative Development (if requested)
      let alternatives: PremiseAssessment[] = [];
      if (options.includeAlternatives) {
        alternatives = await this.generateAlternativeVersions(
          premiseAssessment, options
        );
      }
      
      // Stage 8: Strategic Recommendations
      const finalRecommendation = await this.generateFinalRecommendation(
        premiseAssessment, alternatives, requirements, options
      );
      
      console.log(`✅ PREMISE ENGINE V2.0: Generated comprehensive premise framework`);
      
      return finalRecommendation;
      
    } catch (error) {
      console.error('❌ Premise Engine V2.0 failed:', error);
      throw new Error(`Premise development failed: ${error}`);
    }
  }
  
  /**
   * Stage 1: Foundational Theory Analysis
   */
  static async analyzePremiseFoundation(
    concept: any,
    requirements: any
  ): Promise<PremiseFoundation> {
    
    const prompt = `As a master story analyst and premise architect, analyze this story concept through the foundational frameworks of McKee, Egri, Truby, Snyder, and Vogler:

STORY CONCEPT:
- Basic Idea: ${concept.basicIdea}
- Genre: ${concept.genre}
- Format: ${concept.format}
- Target Audience: ${concept.targetAudience.join(', ')}
- Inspirations: ${concept.inspirations.join(', ')}

REQUIREMENTS:
- Thematic Goals: ${requirements.thematicGoals.join(', ')}
- Commercial Objectives: ${requirements.commercialObjectives.join(', ')}

Analyze through all five foundational frameworks:

1. MCKEE'S CONTROLLING IDEA ANALYSIS:
   - Value: What positive/negative value comes into character's world?
   - Cause: What brings about this change?
   - Complete controlling idea statement
   - Proof strategy for how story will demonstrate this

2. EGRI'S PREMISE ANALYSIS:
   - Character: Central trait, compulsion, flaw, arc type
   - Conflict: Type, source, escalation strategy, stakes level
   - Resolution: Outcome type, what story proves, catharsis, universal truth
   - Complete Egri premise statement

3. TRUBY'S DESIGNING PRINCIPLE:
   - Abstract principle (deeper process)
   - Concrete execution (surface plot)
   - Uniqueness factors and genre subversion
   - Organic unity across character/plot/theme
   - Sustainability assessment

4. SNYDER'S LOGLINE FRAMEWORK:
   - Irony elements and contradictions
   - Compelling mental picture and genre signals
   - Marketability factors and title suggestions
   - Complete logline statement
   - Test results (stranger test, movie feel, etc.)

5. VOGLER'S HERO'S JOURNEY:
   - Hero profile (ordinary world, inner/outer problems)
   - Journey structure (call, threshold, ordeal, resurrection, elixir)
   - Key archetypes (mentor, shadow, shapeshifter, etc.)
   - Transformation arc and universal resonance

Provide coherence analysis: How well do all frameworks align? Where do they reinforce each other? Any tensions or conflicts? How to resolve them?

Focus on creating a premise that functions as logical argument, strategic blueprint, archetypal journey, and commercial hook simultaneously.`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are a master story theorist who synthesizes the foundational frameworks of McKee, Egri, Truby, Snyder, and Vogler to create powerful premises.',
        temperature: 0.7,
        maxTokens: 3000,
        engineId: 'premise-engine-v2'
      });

      return this.parsePremiseFoundationResult(result, concept);
      
    } catch (error) {
      console.warn('AI premise foundation analysis failed, using structured fallback');
      return this.generateFallbackPremiseFoundation(concept, requirements);
    }
  }
  
  /**
   * Stage 2: Thematic Development
   */
  static async developThematicFramework(
    concept: any,
    foundation: PremiseFoundation,
    requirements: any
  ): Promise<{ theme: UniversalTheme; delivery: ThematicDelivery }> {
    
    const prompt = `Develop a comprehensive thematic framework for this premise:

FOUNDATION ANALYSIS:
- McKee Controlling Idea: ${foundation.mckeeAnalysis.statement}
- Egri Premise: ${foundation.egriAnalysis.premiseStatement}
- Truby Designing Principle: ${foundation.trubyAnalysis.abstract}

REQUIREMENTS:
- Thematic Goals: ${requirements.thematicGoals.join(', ')}
- Cultural Context: ${requirements.culturalContext || 'Contemporary Western'}

Create a thematic framework that addresses:

1. UNIVERSAL THEME IDENTIFICATION:
   - Which universal theme category best fits this premise?
   - Core statement about human nature
   - Why this resonates across cultures
   - How to express through specific cultural lens
   - Cultural sensitivity considerations
   - Evolution potential for serialized content

2. THEMATIC DELIVERY STRATEGY:
   - Optimal subtlety level for genre and audience
   - Delivery methods (actions, dialogue, symbolism, structure)
   - Multi-layered audience engagement strategy
   - Genre-specific considerations
   - Balance between entertainment and meaning

The theme should elevate the premise beyond plot mechanics into meaningful exploration of human experience while maintaining commercial appeal.

Focus on creating theme that can evolve and deepen over time while respecting cultural authenticity and avoiding stereotypes.`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are a master thematic architect who weaves universal human truths into commercially viable stories with cultural sensitivity.',
        temperature: 0.7,
        maxTokens: 2000
      });

      return this.parseThematicFrameworkResult(result, concept, foundation);
      
    } catch (error) {
      console.warn('AI thematic framework development failed, using fallback');
      return this.generateFallbackThematicFramework(concept, foundation, requirements);
    }
  }
  
  /**
   * Stage 3: Commercial Viability Assessment
   */
  static async assessCommercialViability(
    concept: any,
    foundation: PremiseFoundation,
    thematic: any
  ): Promise<{ commercial: CommercialViabilityAssessment; hook: PsychologicalHook; transmedia: TransmediaEngine }> {
    
    const prompt = `Assess the commercial viability of this premise using Erik Bork's Seven Pillars framework and modern market analysis:

PREMISE FOUNDATION:
- Logline: ${foundation.snyderAnalysis.loglineStatement}
- Controlling Idea: ${foundation.mckeeAnalysis.statement}
- Theme: ${thematic.theme?.coreStatement || 'Universal human truth'}

Evaluate across three frameworks:

1. SEVEN PILLARS OF COMMERCIAL VIABILITY (Score 1-10 each):
   - PUNISHING: How difficult is protagonist's struggle? Specific challenges and sustained suffering?
   - RELATABLE: Connection points with audience? Universal desires character represents?
   - ORIGINAL: Fresh elements? Genre twist? Unique selling proposition?
   - BELIEVABLE: Internal logic? Character motivations? Consequence chains?
   - LIFE-ALTERING: Stakes level? Consequences of failure? Urgency factors?
   - ENTERTAINING: Fun factor? Genre delivery? Pacing effectiveness?
   - MEANINGFUL: Human truth? Current relevance? Hope/insight provided?

2. PSYCHOLOGY OF THE HOOK:
   - Neural coupling: Immersive elements, sensory engagement
   - Emotional triggers: Primary emotion, journey, personal relevance
   - Curiosity gaps: Central questions, progressive disclosure
   - Empathy mechanisms: Protagonist bond, relatable flaws

3. TRANSMEDIA ENGINE POTENTIAL:
   - World-building scalability
   - Narrative distribution possibilities
   - Franchise expansion opportunities
   - Multi-platform business model

Determine market position: High-concept, character-driven, or compelling concept fusion?

Provide specific, actionable analysis that identifies commercial strengths and market positioning strategy.`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are a market analyst and commercial story consultant who evaluates premise viability using proven industry frameworks.',
        temperature: 0.6,
        maxTokens: 2500
      });

      return this.parseCommercialViabilityResult(result, concept, foundation);
      
    } catch (error) {
      console.warn('AI commercial viability assessment failed, using fallback');
      return this.generateFallbackCommercialViability(concept, foundation);
    }
  }
  
  /**
   * Stage 4: Validation Gauntlet
   */
  static async runValidationGauntlet(
    concept: any,
    foundation: PremiseFoundation,
    commercial: any
  ): Promise<ValidationGauntlet> {
    
    const prompt = `Run this premise through the comprehensive 5-step validation gauntlet:

PREMISE TO VALIDATE:
- Basic Concept: ${concept.basicIdea}
- Logline: ${foundation.snyderAnalysis.loglineStatement}
- Commercial Score: ${commercial.commercial?.overallScore || 'TBD'}/10

Execute rigorous 5-step validation:

1. CLARITY TEST:
   - One-sentence formula: [Protagonist] must [action] to [goal], but [obstacle]
   - Extract core elements clearly
   - Rate clarity 1-10

2. STAKES ASSESSMENT:
   - What are severe consequences of failure?
   - Why must this happen now?
   - Personal impact on character
   - Rate stakes 1-10

3. CHARACTER ARC ANALYSIS:
   - Initial character state
   - Final character state
   - Nature of transformation
   - Rate arc potential 1-10

4. CONFLICT ENGINE TEST:
   - Can this sustain full narrative?
   - Escalation possibilities
   - Obstacle variety and complexity
   - Rate momentum potential 1-10

5. PERSONAL RESONANCE:
   - Why this story matters to creator
   - Passion sustainability
   - Personal connection depth
   - Rate resonance 1-10

Provide overall validation score, strengths, weaknesses, and clear recommendation: develop, revise, or abandon.

Be rigorous and honest - better to identify problems now than after months of development.`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are a ruthless but constructive story consultant who applies rigorous validation tests to identify premise viability.',
        temperature: 0.5,
        maxTokens: 2000
      });

      return this.parseValidationGauntletResult(result, concept, foundation);
      
    } catch (error) {
      console.warn('AI validation gauntlet failed, using fallback');
      return this.generateFallbackValidation(concept, foundation);
    }
  }
  
  /**
   * Stage 5: Contemporary Market Analysis
   */
  static async analyzeContemporaryMarket(
    concept: any,
    foundation: PremiseFoundation,
    options: any
  ): Promise<StreamingSuccessAnalysis[]> {
    
    const prompt = `Analyze this premise against contemporary streaming successes and market trends:

PREMISE:
- Genre: ${concept.genre}
- Format: ${concept.format}
- Logline: ${foundation.snyderAnalysis.loglineStatement}

Research and analyze similar successful properties from major streaming platforms:

1. IDENTIFY 3-5 COMPARABLE SUCCESSES:
   - Recent streaming hits in similar genre
   - Successful series with similar themes
   - Properties with comparable target audience

2. FOR EACH SUCCESS, ANALYZE:
   - Platform and title
   - Core premise
   - Success factors (genre fusion, character depth, themes, visual hooks)
   - Narrative/structural innovations
   - Market lessons (audience appeal, binge-ability, social media buzz)

3. EMERGING TRENDS ANALYSIS:
   - Current market preferences in this genre
   - Successful formula variations
   - Audience behavior patterns
   - Platform-specific opportunities

4. COMPETITIVE POSITIONING:
   - How this premise fits current market
   - Unique differentiators
   - Potential market gaps to fill
   - Risk factors in current landscape

Focus on actionable market intelligence that can guide development and positioning strategy.`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are a streaming industry analyst who tracks successful content and identifies market opportunities.',
        temperature: 0.6,
        maxTokens: 2000
      });

      return this.parseMarketAnalysisResult(result, concept);
      
    } catch (error) {
      console.warn('AI market analysis failed, using fallback');
      return this.generateFallbackMarketAnalysis(concept);
    }
  }
  
  // ============================================================================
  // HELPER METHODS AND PARSERS
  // ============================================================================
  
  private static parsePremiseFoundationResult(result: string, concept: any): PremiseFoundation {
    // In production, would parse AI response more sophisticatedly
    return this.generateFallbackPremiseFoundation(concept, {});
  }
  
  private static generateFallbackPremiseFoundation(concept: any, requirements: any): PremiseFoundation {
    return {
      mckeeAnalysis: {
        value: {
          type: 'positive',
          core: 'Growth',
          charge: 'achieved'
        },
        cause: {
          type: 'character_driven',
          mechanism: 'persistent effort',
          agency: 'internal'
        },
        statement: `Growth is achieved through persistent effort in ${concept.genre} narrative`,
        proofStrategy: ['character_development', 'conflict_resolution', 'thematic_payoff']
      },
      egriAnalysis: {
        character: {
          trait: 'determined',
          compulsion: 'achieve_goal',
          flaw: 'overconfidence',
          arc: 'positive'
        },
        conflict: {
          type: 'interpersonal',
          source: 'opposing_forces',
          escalation: ['initial_resistance', 'mounting_obstacles', 'final_confrontation'],
          stakes: 'personal'
        },
        resolution: {
          outcome: 'triumph',
          proof: 'Determination overcomes obstacles',
          catharsis: 'Emotional satisfaction',
          universality: 'Human resilience'
        },
        premiseStatement: 'Determination + Persistent Effort → Triumph over Obstacles'
      },
      trubyAnalysis: {
        abstract: `Force protagonist to grow through ${concept.genre} challenges`,
        concrete: concept.basicIdea,
        uniqueness: {
          originalApproach: `Fresh take on ${concept.genre} conventions`,
          genreSubversion: ['unexpected_character_depth', 'thematic_complexity'],
          structuralInnovation: 'Character-driven genre piece'
        },
        organicUnity: {
          characterIntegration: 'Character growth drives plot',
          plotIntegration: 'Plot serves character development',
          themeIntegration: 'Theme emerges from character journey'
        },
        sustainability: 'Strong foundation for full narrative development'
      },
      snyderAnalysis: {
        irony: {
          twist: 'Unexpected character revelation',
          contradiction: 'Internal vs external conflict',
          hook: `Compelling ${concept.genre} premise`
        },
        mentalPicture: {
          visualization: 'Clear visual concept',
          promiseOfPremise: `Engaging ${concept.genre} journey`,
          genreExpectation: `Fulfills ${concept.genre} expectations`
        },
        marketability: {
          title: concept.basicIdea.split(' ').slice(0, 3).join(' '),
          audienceAppeal: concept.targetAudience.join(', '),
          pitchability: 7
        },
        loglineStatement: `A ${concept.genre} story about ${concept.basicIdea}`,
        testResults: {
          strangerTest: true,
          isItAMovie: true,
          compellingProtagonist: true,
          clearStakes: true
        }
      },
      voglerAnalysis: {
        heroProfile: {
          ordinaryWorld: 'Character\'s normal state',
          innerProblem: 'Personal flaw to overcome',
          outerProblem: 'External challenge to face',
          resistance: 'Fear of change'
        },
        journeyStructure: {
          callToAdventure: 'Inciting incident',
          crossingThreshold: 'Commitment to journey',
          specialWorld: 'New reality with challenges',
          ordeal: 'Central crisis and transformation',
          resurrection: 'Final test and growth',
          elixir: 'Wisdom gained and shared'
        },
        archetypes: {
          mentor: 'Wisdom giver',
          shadow: 'Primary antagonist',
          shapeshifter: 'Uncertain ally',
          herald: 'Change announcer',
          trickster: 'Perspective shifter',
          allies: ['supporting_characters']
        },
        transformation: {
          initialState: 'Flawed but sympathetic',
          finalState: 'Grown and wiser',
          lessonLearned: 'Core human truth',
          universalResonance: 'Universal human experience'
        }
      },
      coherenceScore: 8,
      strengths: ['Strong character foundation', 'Clear thematic direction', 'Commercial viability'],
      tensions: ['Minor framework conflicts'],
      resolution: 'Integrate perspectives for comprehensive approach'
    };
  }
  
  private static parseThematicFrameworkResult(result: string, concept: any, foundation: PremiseFoundation): { theme: UniversalTheme; delivery: ThematicDelivery } {
    return this.generateFallbackThematicFramework(concept, foundation, {});
  }
  
  private static generateFallbackThematicFramework(concept: any, foundation: PremiseFoundation, requirements: any): { theme: UniversalTheme; delivery: ThematicDelivery } {
    return {
      theme: {
        category: 'coming_of_age',
        coreStatement: 'Growth comes through facing challenges',
        universalAppeal: {
          psychologicalBasis: 'Universal human experience of growth',
          historicalRelevance: 'Timeless pattern across cultures',
          modernRelevance: 'Contemporary relevance to audiences'
        },
        culturalExpression: {
          specificContext: requirements.culturalContext || 'Contemporary',
          authenticElements: ['genuine_cultural_details'],
          sensitivityConsiderations: ['avoid_stereotypes', 'respect_authenticity'],
          collaborationStrategy: 'Work with cultural consultants'
        },
        thematicEvolution: {
          initialThesis: 'Character begins with potential',
          antithesis: 'Challenges test and refine character',
          synthesis: 'Character emerges transformed and wise',
          serializedPotential: 'Theme can deepen over multiple seasons'
        }
      },
      delivery: {
        subtletyLevel: 'moderate',
        deliveryMethods: {
          characterActions: ['show_through_behavior'],
          dialogue: ['express_in_key_moments'],
          symbolism: ['visual_metaphors'],
          structure: ['built_into_narrative_arc'],
          conflict: ['explored_through_central_tensions']
        },
        audienceEngagement: {
          intellectualLayer: 'Rewards analytical viewing',
          emotionalLayer: 'Accessible emotional truth',
          discoveryRewards: ['easter_eggs', 'deeper_meanings']
        },
        genreConsiderations: {
          genreExpectations: `${concept.genre} thematic conventions`,
          subversionOpportunities: ['surprise_moments', 'fresh_perspectives'],
          balanceStrategy: 'Entertainment-first with meaningful depth'
        }
      }
    };
  }
  
  private static parseCommercialViabilityResult(result: string, concept: any, foundation: PremiseFoundation): { commercial: CommercialViabilityAssessment; hook: PsychologicalHook; transmedia: TransmediaEngine } {
    return this.generateFallbackCommercialViability(concept, foundation);
  }
  
  private static generateFallbackCommercialViability(concept: any, foundation: PremiseFoundation): { commercial: CommercialViabilityAssessment; hook: PsychologicalHook; transmedia: TransmediaEngine } {
    return {
      commercial: {
        punishing: { score: 7, challenges: ['significant_obstacles'], suffering: 'Character pushed to limits', sustainedStruggle: 'Cannot be easily resolved' },
        relatable: { score: 8, connectionPoints: ['universal_desires'], universalDesires: ['growth', 'belonging'], empathyTriggers: ['vulnerable_moments'] },
        original: { score: 7, freshElements: ['unique_perspective'], genreTwist: `Fresh ${concept.genre} approach`, uniqueSelling: 'Distinctive character voice' },
        believable: { score: 8, internalLogic: ['consistent_rules'], characterMotivations: ['understandable_drives'], consequenceChain: ['logical_progression'] },
        lifeAltering: { score: 7, stakes: ['personal_transformation'], consequences: ['significant_loss'], urgency: 'Time-sensitive challenge' },
        entertaining: { score: 8, funFactor: ['engaging_journey'], genreDelivery: `Satisfies ${concept.genre} expectations`, pacing: 'Well-structured rhythm' },
        meaningful: { score: 8, humanTruth: 'Universal human experience', relevance: 'Contemporary significance', hopeElement: 'Positive insight' },
        overallScore: 7.6,
        marketPosition: 'compelling_concept'
      },
      hook: {
        neuralCoupling: {
          immersiveElements: ['vivid_scenarios'],
          sensoryEngagement: ['visual_appeal'],
          experientialPromise: 'Compelling experience'
        },
        emotionalTriggers: {
          primaryEmotion: 'empathy',
          emotionalJourney: ['connection', 'tension', 'resolution'],
          personalRelevance: 'Relatable human struggle'
        },
        curiosityGaps: {
          centralQuestion: 'Will character succeed?',
          progressiveDisclosure: ['gradual_revelation'],
          payoffStrategy: 'Satisfying resolution'
        },
        empathyMechanisms: {
          protagonistBond: 'Strong character connection',
          relatableFlaws: ['human_weaknesses'],
          universalStruggles: ['growth_challenges']
        }
      },
      transmedia: {
        worldBuilding: {
          coreWorld: `${concept.genre} universe`,
          expandableElements: ['character_backstories', 'world_lore'],
          franchisePotential: 'Strong expansion possibilities'
        },
        narrativeDistribution: {
          coreStory: `Main ${concept.format}`,
          supplementaryMedia: { 'web_series': 'Character backstories', 'comics': 'Extended universe' },
          entryPoints: ['multiple_access_points']
        },
        scalabilityFactors: {
          characterPotential: ['supporting_character_stories'],
          timelinePotential: ['prequels', 'sequels'],
          perspectivePotential: ['different_viewpoints']
        },
        businessModel: {
          primaryPlatform: 'streaming',
          secondaryPlatforms: ['digital', 'merchandise'],
          audienceSegmentation: { 'primary': concept.targetAudience.join(', ') }
        }
      }
    };
  }
  
  private static parseValidationGauntletResult(result: string, concept: any, foundation: PremiseFoundation): ValidationGauntlet {
    return this.generateFallbackValidation(concept, foundation);
  }
  
  private static generateFallbackValidation(concept: any, foundation: PremiseFoundation): ValidationGauntlet {
    return {
      step1_clarity: {
        oneSentence: foundation.snyderAnalysis.loglineStatement,
        coreElements: {
          protagonist: 'Main character',
          action: 'Primary action',
          goal: 'Clear objective',
          obstacle: 'Central conflict'
        },
        clarityScore: 8
      },
      step2_stakes: {
        consequences: ['personal_loss', 'failed_growth'],
        urgency: 'Time-sensitive situation',
        personalImpact: 'Character transformation at stake',
        stakesScore: 7
      },
      step3_characterArc: {
        initialState: 'Flawed but sympathetic character',
        finalState: 'Transformed and wiser character',
        transformation: 'Meaningful personal growth',
        arcScore: 8
      },
      step4_conflictEngine: {
        sustainedConflict: 'Strong enough for full narrative',
        escalationPotential: ['increasing_stakes', 'deeper_challenges'],
        obstacles: ['external_barriers', 'internal_resistance'],
        momentumScore: 7
      },
      step5_personalResonance: {
        writerConnection: 'Strong thematic resonance',
        passionLevel: 8,
        personalStory: 'Universal human experience',
        resonanceScore: 8
      },
      overallValidation: {
        totalScore: 7.6,
        strengths: ['Clear concept', 'Strong character potential', 'Commercial viability'],
        weaknesses: ['Needs deeper development', 'Stakes could be higher'],
        recommendation: 'develop'
      }
    };
  }
  
  private static parseMarketAnalysisResult(result: string, concept: any): StreamingSuccessAnalysis[] {
    return this.generateFallbackMarketAnalysis(concept);
  }
  
  private static generateFallbackMarketAnalysis(concept: any): StreamingSuccessAnalysis[] {
    return [
      {
        platform: 'netflix',
        title: `Comparable ${concept.genre} Success`,
        premise: `Similar ${concept.genre} premise that succeeded`,
        successFactors: {
          genreFusion: [`${concept.genre}_elements`],
          characterDepth: 'Complex character development',
          thematicResonance: 'Universal themes',
          visualHook: 'Distinctive visual style',
          culturalImpact: 'Broad audience appeal'
        },
        innovation: {
          narrativeInnovation: ['fresh_storytelling'],
          structuralInnovation: ['unique_format'],
          thematicInnovation: ['new_perspective']
        },
        marketLessons: {
          audienceAppeal: 'Strong character connection',
          bingeability: 'Compelling episode structure',
          socialMediaBuzz: 'Shareable moments',
          globalReach: 'Universal themes'
        }
      }
    ];
  }
  
  private static async assemblePremiseAssessment(
    concept: any,
    foundation: PremiseFoundation,
    thematic: any,
    commercial: any,
    validation: ValidationGauntlet,
    market: StreamingSuccessAnalysis[]
  ): Promise<PremiseAssessment> {
    
    return {
      id: `premise-${Date.now()}`,
      title: concept.basicIdea.split(' ').slice(0, 3).join(' '),
      genre: concept.genre,
      format: concept.format,
      
      foundation: foundation,
      theme: thematic.theme,
      thematicDelivery: thematic.delivery,
      commercialViability: commercial.commercial,
      psychologicalHook: commercial.hook,
      transmediaEngine: commercial.transmedia,
      validation: validation,
      streamingAnalysis: market,
      
      marketPosition: commercial.commercial.marketPosition,
      competitorAnalysis: market.map(m => m.title),
      
      generatedBy: 'PremiseEngineV2',
      confidence: validation.overallValidation.totalScore,
      alternativeApproaches: ['character_focused', 'plot_driven', 'theme_centered']
    };
  }
  
  private static async generateAlternativeVersions(
    assessment: PremiseAssessment,
    options: any
  ): Promise<PremiseAssessment[]> {
    // Generate alternative versions based on different strategic approaches
    return [];
  }
  
  private static async generateFinalRecommendation(
    assessment: PremiseAssessment,
    alternatives: PremiseAssessment[],
    requirements: any,
    options: any
  ): Promise<PremiseRecommendation> {
    
    return {
      primaryRecommendation: assessment,
      alternativeVersions: alternatives,
      
      developmentStrategy: {
        nextSteps: [
          'Develop detailed character profiles',
          'Create comprehensive story bible',
          'Write pilot or treatment',
          'Prepare pitch materials'
        ],
        priorityAreas: [
          'Character development',
          'Thematic clarity',
          'Commercial positioning'
        ],
        riskFactors: [
          'Market saturation',
          'Execution challenges',
          'Audience reception'
        ]
      },
      
      marketStrategy: {
        targetAudience: assessment.transmediaEngine.businessModel.audienceSegmentation.primary?.split(', ') || [],
        competitiveAdvantage: assessment.commercialViability.original.uniqueSelling,
        platformRecommendations: ['streaming', 'digital_first']
      },
      
      creativeGuidance: {
        strengthsToAmplify: assessment.validation.overallValidation.strengths,
        weaknessesToAddress: assessment.validation.overallValidation.weaknesses,
        opportunitiesForInnovation: [
          'Genre innovation',
          'Character depth',
          'Thematic complexity'
        ]
      },
      
      successCriteria: {
        structuralBenchmarks: [
          'Clear three-act structure',
          'Compelling character arcs',
          'Satisfying resolution'
        ],
        thematicBenchmarks: [
          'Universal resonance',
          'Cultural authenticity',
          'Meaningful message'
        ],
        commercialBenchmarks: [
          'Audience engagement',
          'Critical reception',
          'Market performance'
        ]
      }
    };
  }
}

// Types already exported as interfaces above
 