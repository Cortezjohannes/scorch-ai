/**
 * The Genre Mastery System - AI-Enhanced Meta-Engine for Genre-Perfect Storytelling
 * 
 * This system serves as the master coordinator for all seven narrative engines,
 * ensuring they work together to create authentic, sophisticated stories that
 * honor genre conventions while finding creative opportunities for innovation.
 * 
 * Key Principle: Master the rules to break them meaningfully
 * 
 * ENHANCEMENT: Template-based genre patterns → AI-powered genre creation and blending
 */

import { StoryPremise, PremiseEngine } from './premise-engine'
import { Character3D, Character3DEngine } from './character-engine'
import { NarrativeArc, FractalNarrativeEngine } from './fractal-narrative-engine'
import { StrategicDialogueEngine } from './strategic-dialogue-engine'
import { IntelligentTropeSystem } from './intelligent-trope-system'
import { LivingWorldEngine, WorldState } from './living-world-engine'
import { InteractiveChoiceEngine, InteractiveChoice } from './interactive-choice-engine'
import { generateContent } from './azure-openai'
import { GenreMasteryEngineV2, type GenreMasteryRecommendation } from './genre-mastery-engine-v2'

// Missing type definitions (temporary compatibility types)
export type TropeDeploymentPlan = any;
export type AudienceExpectation = any;
export type SatisfactionRequirement = any;
export type GenreTaboo = any;
export type InnovationOpportunity = any;
export type SubversionPotential = any;
export type CrossGenreCompatibility = any;
export type GenreAuthenticity = any;
export type CommercialViability = any;
export type CriticalReception = any;
export type PremiseAdaptation = any;
export type CharacterAdaptation = any;
export type NarrativeAdaptation = any;
export type DialogueAdaptation = any;
export type TropeAdaptation = any;
export type WorldAdaptation = any;
export type ChoiceAdaptation = any;
export type EngineCoordination = any;
export type PriorityMatrix = any;
export type ConflictResolution = any;
export type GenreValidation = any;
export type AuthenticityCheck = any;
export type AudienceSatisfactionMetrics = any;
export type BlendingApproach = any;
export type DominanceRatio = any;
export type IntegrationMethod = any;
export type HybridElement = any;
export type InnovativeFeature = any;
export type UniqueSellingPoint = any;
export type AudienceReceptionRisk = any;
export type MarketViabilityRisk = any;
export type ExecutionComplexityRisk = any;
export type GenrePrecedent = any;
export type GenreInspiration = any;
export type GenreInnovation = any;
export type AudienceMatch = any;
export type EngineHarmony = any;
export type NarrativeCoherence = any;
export type ActStructure = any;
export type PacingRequirement = any;
export type BlendingStrategy = any;

// Genre classification and understanding
export interface GenreProfile {
  id: string;
  name: string;
  category: GenreCategory;
  
  // Core identity
  definition: string;
  coreElements: string[];
  essentialMoods: string[];
  
  // Audience contract
  audienceExpectations: AudienceExpectation[];
  satisfactionRequirements: SatisfactionRequirement[];
  taboos: GenreTaboo[];
  
  // Narrative DNA
  typicalPremises: PremisePattern[];
  characterArchetypes: ArchetypeMapping[];
  structuralPatterns: StructuralPattern[];
  dialogueConventions: DialogueConvention[];
  tropeUsage: TropeUsagePattern[];
  worldBuildingRules: WorldBuildingRule[];
  choiceFrameworks: ChoiceFramework[];
  
  // Creative opportunities
  innovationOpportunities: InnovationOpportunity[];
  subversionPotential: SubversionPotential[];
  crossGenreCompatibility: CrossGenreCompatibility[];
  
  // Success metrics
  genreAuthenticity: GenreAuthenticity;
  commercialViability: CommercialViability;
  criticalReception: CriticalReception;
}

export type GenreCategory = 
  | 'speculative'    // Sci-fi, Fantasy, Horror
  | 'realistic'      // Drama, Literary, Slice-of-life
  | 'commercial'     // Thriller, Romance, Action
  | 'artistic'       // Experimental, Avant-garde, Art-house
  | 'traditional'    // Western, Historical, Period
  | 'hybrid'         // Cross-genre, Multi-genre, Genre-fluid

// Genre-specific engine adaptations
export interface GenreAdaptation {
  genre: GenreProfile;
  
  // Engine modifications
  premiseAdaptation: PremiseAdaptation;
  characterAdaptation: CharacterAdaptation;
  narrativeAdaptation: NarrativeAdaptation;
  dialogueAdaptation: DialogueAdaptation;
  tropeAdaptation: TropeAdaptation;
  worldAdaptation: WorldAdaptation;
  choiceAdaptation: ChoiceAdaptation;
  
  // Integration rules
  engineCoordination: EngineCoordination;
  priorityMatrix: PriorityMatrix;
  conflictResolution: ConflictResolution[];
  
  // Quality assurance
  genreValidation: GenreValidation;
  authenticityChecks: AuthenticityCheck[];
  audienceSatisfaction: AudienceSatisfactionMetrics;
}

// Cross-genre innovation system
export interface GenreBlend {
  id: string;
  name: string;
  primaryGenre: GenreProfile;
  secondaryGenres: GenreProfile[];
  
  // Blending strategy
  blendingApproach: BlendingApproach;
  dominanceRatio: DominanceRatio;
  integrationMethod: IntegrationMethod;
  
  // Creative fusion
  hybridElements: HybridElement[];
  innovativeFeatures: InnovativeFeature[];
  uniqueSellingPoints: UniqueSellingPoint[];
  
  // Risk assessment
  audienceReception: AudienceReceptionRisk;
  marketViability: MarketViabilityRisk;
  executionComplexity: ExecutionComplexityRisk;
  
  // Success examples
  precedents: GenrePrecedent[];
  inspirations: GenreInspiration[];
}

// Master story generation coordinated by genre
export interface GenreMasteredStory {
  genre: GenreProfile;
  genreBlend?: GenreBlend;
  
  // Coordinated engine outputs
  premise: StoryPremise;
  characters: Character3D[];
  narrative: NarrativeArc;
  dialogue: any; // Strategic dialogue patterns
  tropes: TropeDeploymentPlan;
  world: WorldState;
  choices: InteractiveChoice[];
  
  // Genre fidelity
  authenticity: GenreAuthenticity;
  innovation: GenreInnovation;
  audienceMatch: AudienceMatch;
  
  // Meta-coordination
  engineHarmony: EngineHarmony;
  narrativeCoherence: NarrativeCoherence;
  genreEvolution: GenreEvolution;
}

// Genre-specific patterns and rules
export interface PremisePattern {
  pattern: string;
  examples: string[];
  frequency: number; // 1-10: How common in genre
  effectiveness: number; // 1-10: How well it works
  modernization: string; // How to update for contemporary audiences
}

export interface ArchetypeMapping {
  universalArchetype: string;
  genreSpecificVersion: string;
  requiredTraits: string[];
  optionalTraits: string[];
  avoidTraits: string[];
  exampleCharacters: string[];
}

export interface StructuralPattern {
  name: string;
  structure: string;
  acts: ActStructure[];
  pacing: PacingRequirement[];
  mandatoryElements: string[];
  optionalElements: string[];
  climaxRequirements: string[];
}

export interface DialogueConvention {
  convention: string;
  description: string;
  examples: string[];
  appropriateContexts: string[];
  modernAdaptations: string[];
}

export interface TropeUsagePattern {
  trope: string;
  usage: 'essential' | 'common' | 'optional' | 'rare' | 'taboo';
  deployment: string;
  subversionOpportunity: string;
}

export interface WorldBuildingRule {
  rule: string;
  rationale: string;
  flexibility: 'strict' | 'moderate' | 'flexible';
  exceptions: string[];
}

export interface ChoiceFramework {
  framework: string;
  description: string;
  typicalChoices: string[];
  stakesLevel: number;
  consequencePatterns: string[];
}

// The master genre coordination engine
export class GenreMasterySystem {
  
  /**
   * V2.0 ENHANCED: Generates sophisticated genre mastery using comprehensive theoretical frameworks
   */
  static async generateEnhancedGenreMastery(
    context: {
      projectTitle: string;
      primaryGenre: 'horror' | 'comedy' | 'drama' | 'action' | 'romance' | 'thriller' | 'sci-fi' | 'fantasy' | 'mystery' | 'western';
      medium: 'film' | 'television' | 'streaming' | 'digital' | 'theater' | 'game';
      targetAudience: string;
      culturalContext: string;
      thematicElements: string[];
      narrativeGoals: string[];
      genreObjectives: string[];
      marketScope: string;
    },
    requirements: {
      genreApproach: 'classical' | 'subversive' | 'hybrid' | 'deconstructive' | 'meta';
      innovationLevel: 'traditional' | 'evolutionary' | 'revolutionary' | 'paradigm-shifting';
      audienceScope: 'niche' | 'targeted' | 'mainstream' | 'universal';
      conventionAdherence: 'strict' | 'flexible' | 'selective' | 'minimal';
      culturalAdaptation: 'local' | 'regional' | 'global' | 'universal';
      marketingAmbition: 'festival' | 'arthouse' | 'commercial' | 'blockbuster';
    },
    options: {
      hybridGenres?: string[];
      deconstructionFocus?: boolean;
      diversityPriority?: boolean;
      streamingOptimization?: boolean;
      globalAppeal?: boolean;
      socialMediaIntegration?: boolean;
    } = {}
  ): Promise<{ genreMastery: GenreMasteredStory; genreFramework: GenreMasteryRecommendation }> {
    try {
      // Generate V2.0 Genre Mastery Framework
      const genreFramework = await GenreMasteryEngineV2.generateGenreMasteryRecommendation(
        context,
        requirements,
        options
      );
      
      // Convert V2.0 context to legacy format
      const legacyInput = this.convertToLegacyGenreInput(
        context,
        requirements,
        genreFramework
      );
      
      // Generate enhanced genre mastery using V2.0 insights
      const genreMastery = this.generateGenreMasteredStory(
        context.primaryGenre,
        legacyInput.userInput,
        legacyInput.genreBlend
      );
      
      // Apply V2.0 framework enhancements to genre mastery
      const enhancedGenreMastery = this.applyGenreFrameworkToMastery(
        genreMastery,
        genreFramework
      );
      
      return {
        genreMastery: enhancedGenreMastery,
        genreFramework
      };
    } catch (error) {
      console.error('Error generating enhanced genre mastery:', error);
      throw error;
    }
  }

  /**
   * Generates genre-perfect story using all coordinated engines
   */
  static generateGenreMasteredStory(
    genreId: string,
    userInput: {
      synopsis: string;
      theme: string;
      targetAudience?: string;
      innovationLevel?: number; // 1-10: How experimental
    },
    genreBlend?: GenreBlend
  ): GenreMasteredStory {
    
    // Get genre profile
    const genre = this.getGenreProfile(genreId);
    const adaptation = this.createGenreAdaptation(genre, genreBlend);
    
    // Generate premise with genre adaptation
    const premise = this.generateGenreAdaptedPremise(
      userInput,
      adaptation.premiseAdaptation
    );
    
    // Generate characters with genre archetypes
    const characters = this.generateGenreAdaptedCharacters(
      premise,
      adaptation.characterAdaptation
    );
    
    // Generate narrative structure with genre patterns
    const narrative = this.generateGenreAdaptedNarrative(
      premise,
      characters,
      adaptation.narrativeAdaptation
    );
    
    // Generate dialogue with genre conventions
    const dialogue = this.generateGenreAdaptedDialogue(
      narrative,
      characters,
      adaptation.dialogueAdaptation
    );
    
    // Generate trope deployment with genre awareness
    const tropes = this.generateGenreAdaptedTropes(
      premise,
      characters,
      adaptation.tropeAdaptation
    );
    
    // Generate world with genre rules
    const world = this.generateGenreAdaptedWorld(
      premise,
      characters,
      narrative,
      adaptation.worldAdaptation
    );
    
    // Generate choices with genre frameworks
    const choices = this.generateGenreAdaptedChoices(
      world,
      premise,
      adaptation.choiceAdaptation
    );
    
    // Coordinate all engines for genre harmony
    const coordinated = this.coordinateEnginesForGenre(
      { premise, characters, narrative, dialogue, tropes, world, choices },
      adaptation.engineCoordination
    );
    
    // Validate genre authenticity
    const authenticity = this.validateGenreAuthenticity(coordinated, genre);
    
    return {
      genre,
      genreBlend,
      ...coordinated,
      authenticity,
      innovation: this.assessGenreInnovation(coordinated, genre),
      audienceMatch: this.assessAudienceMatch(coordinated, genre),
      engineHarmony: this.assessEngineHarmony(coordinated),
      narrativeCoherence: this.assessNarrativeCoherence(coordinated),
      genreEvolution: this.assessGenreEvolution(coordinated, genre)
    };
  }
  
  /**
   * Creates sophisticated genre blends
   */
  static createGenreBlend(
    primaryGenreId: string,
    secondaryGenreIds: string[],
    blendingStrategy: BlendingStrategy
  ): GenreBlend {
    
    const primaryGenre = this.getGenreProfile(primaryGenreId);
    const secondaryGenres = secondaryGenreIds.map(id => this.getGenreProfile(id));
    
    // Analyze compatibility
    const compatibility = this.analyzeGenreCompatibility(primaryGenre, secondaryGenres);
    
    // Design blending approach
    const blendingApproach = this.designBlendingApproach(
      primaryGenre,
      secondaryGenres,
      blendingStrategy,
      compatibility
    );
    
    // Create hybrid elements
    const hybridElements = this.createHybridElements(
      primaryGenre,
      secondaryGenres,
      blendingApproach
    );
    
    // Assess risks and opportunities
    const riskAssessment = this.assessBlendingRisks(
      primaryGenre,
      secondaryGenres,
      hybridElements
    );
    
    return {
      id: `blend-${primaryGenreId}-${secondaryGenreIds.join('-')}`,
      name: this.generateBlendName(primaryGenre, secondaryGenres),
      primaryGenre,
      secondaryGenres,
      blendingApproach,
      dominanceRatio: this.calculateDominanceRatio(blendingStrategy),
      integrationMethod: blendingApproach.integrationMethod,
      hybridElements,
      innovativeFeatures: this.identifyInnovativeFeatures(hybridElements),
      uniqueSellingPoints: this.identifyUniqueSellingPoints(hybridElements),
      audienceReception: riskAssessment.audienceReception,
      marketViability: riskAssessment.marketViability,
      executionComplexity: riskAssessment.executionComplexity,
      precedents: this.findGenrePrecedents(primaryGenre, secondaryGenres),
      inspirations: this.findGenreInspirations(primaryGenre, secondaryGenres)
    };
  }
  
  /**
   * Adapts premise generation for specific genres
   */
  static generateGenreAdaptedPremise(
    userInput: any,
    adaptation: PremiseAdaptation
  ): StoryPremise {
    
    // Get base premise
    const basePremise = PremiseEngine.generatePremise(userInput.theme, userInput.synopsis);
    
    // Apply genre adaptations
    const adaptedPremise = {
      ...basePremise,
      theme: this.adaptThemeForGenre(basePremise.theme, adaptation),
      premiseStatement: this.adaptPremiseStatementForGenre(
        basePremise.premiseStatement,
        adaptation
      ),
      character: this.adaptCharacterForGenre(basePremise.character, adaptation),
      conflict: this.adaptConflictForGenre(basePremise.conflict, adaptation),
      resolution: this.adaptResolutionForGenre(basePremise.resolution, adaptation)
    };
    
    // Validate genre alignment
    const validation = this.validatePremiseGenreAlignment(adaptedPremise, adaptation);
    if (!validation.valid) {
      return this.refinePremiseForGenre(adaptedPremise, adaptation, validation.issues);
    }
    
    return adaptedPremise;
  }
  
  /**
   * Adapts character generation for genre archetypes
   */
  static generateGenreAdaptedCharacters(
    premise: StoryPremise,
    adaptation: CharacterAdaptation
  ): Character3D[] {
    
    // Generate base characters
    const baseCharacters = [
      Character3DEngine.generateProtagonist(premise, PremiseEngine.expandToEquation(premise, premise.theme), premise.theme),
      Character3DEngine.generateAntagonist(premise, PremiseEngine.expandToEquation(premise, premise.theme), null),
      Character3DEngine.generateSupportingCharacter('catalyst', premise, [], [])
    ];
    
    // Apply genre adaptations
    const adaptedCharacters = baseCharacters.map(character => 
      this.adaptCharacterForGenre(character, adaptation)
    );
    
    // Add genre-specific characters if needed
    const additionalCharacters = this.generateGenreSpecificCharacters(
      premise,
      adaptedCharacters,
      adaptation
    );
    
    return [...adaptedCharacters, ...additionalCharacters];
  }
  
  /**
   * Coordinates all engines to work in genre harmony
   */
  static coordinateEnginesForGenre(
    storyElements: any,
    coordination: EngineCoordination
  ): any {
    
    // Apply coordination rules
    let coordinated = { ...storyElements };
    
    // Resolve engine conflicts
    coordination.conflictResolutions.forEach(resolution => {
      coordinated = this.resolveEngineConflict(coordinated, resolution);
    });
    
    // Apply priority matrix
    coordinated = this.applyPriorityMatrix(coordinated, coordination.priorityMatrix);
    
    // Ensure genre consistency across all engines
    coordinated = this.enforceGenreConsistency(coordinated, coordination);
    
    return coordinated;
  }
  
  /**
   * Validates story authenticity within genre
   */
  static validateGenreAuthenticity(
    story: any,
    genre: GenreProfile
  ): GenreAuthenticity {
    
    const scores = {
      premiseAuthenticity: this.scorePremiseAuthenticity(story.premise, genre),
      characterAuthenticity: this.scoreCharacterAuthenticity(story.characters, genre),
      structureAuthenticity: this.scoreStructureAuthenticity(story.narrative, genre),
      dialogueAuthenticity: this.scoreDialogueAuthenticity(story.dialogue, genre),
      tropeAuthenticity: this.scoreTropeAuthenticity(story.tropes, genre),
      worldAuthenticity: this.scoreWorldAuthenticity(story.world, genre),
      choiceAuthenticity: this.scoreChoiceAuthenticity(story.choices, genre)
    };
    
    const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
    
    const issues = this.identifyGenreIssues(scores, genre);
    const recommendations = this.generateGenreRecommendations(issues, genre);
    
    return {
      overallScore,
      componentScores: scores,
      issues,
      recommendations,
      genreCompliance: overallScore >= 7.0,
      innovationLevel: this.calculateInnovationLevel(story, genre)
    };
  }
  
  /**
   * Master genre database with comprehensive profiles
   */
  static getGenreDatabase(): GenreProfile[] {
    return [
      {
        id: 'epic-fantasy',
        name: 'Epic Fantasy',
        category: 'speculative',
        definition: 'Large-scale fantasy adventures in secondary worlds with magic systems and heroic quests',
        coreElements: ['magic system', 'secondary world', 'heroic journey', 'good vs evil', 'chosen one'],
        essentialMoods: ['wonder', 'adventure', 'heroism', 'epicness'],
        audienceExpectations: [
          {
            expectation: 'Rich world-building with consistent magic',
            importance: 9,
            flexibilityLevel: 2
          },
          {
            expectation: 'Clear moral framework with heroic protagonist',
            importance: 8,
            flexibilityLevel: 3
          },
          {
            expectation: 'Epic scope with high stakes',
            importance: 9,
            flexibilityLevel: 1
          }
        ],
        satisfactionRequirements: [
          {
            requirement: 'Hero must grow and triumph',
            criticality: 'essential',
            alternativeApproaches: ['pyrrhic victory', 'noble sacrifice']
          },
          {
            requirement: 'Magic must have rules and costs',
            criticality: 'important',
            alternativeApproaches: ['mysterious magic', 'intuitive magic']
          }
        ],
        taboos: [
          {
            taboo: 'Completely hopeless ending',
            severity: 'major',
            rationale: 'Violates genre\'s escapist promise'
          },
          {
            taboo: 'No fantastical elements',
            severity: 'critical',
            rationale: 'Removes genre definition'
          }
        ],
        typicalPremises: [
          {
            pattern: 'Power corrupts unless tempered by wisdom/friendship',
            examples: ['Lord of the Rings', 'Wheel of Time'],
            frequency: 9,
            effectiveness: 8,
            modernization: 'Power as responsibility in complex systems'
          },
          {
            pattern: 'Ordinary person discovers extraordinary destiny',
            examples: ['Harry Potter', 'Eragon'],
            frequency: 8,
            effectiveness: 7,
            modernization: 'Destiny as choice rather than fate'
          }
        ],
        characterArchetypes: [
          {
            universalArchetype: 'Hero',
            genreSpecificVersion: 'Chosen One',
            requiredTraits: ['humble origins', 'innate goodness', 'growth potential'],
            optionalTraits: ['special bloodline', 'magical talent', 'orphaned'],
            avoidTraits: ['irredeemable evil', 'complete cynicism'],
            exampleCharacters: ['Frodo', 'Harry Potter', 'Rand al\'Thor']
          },
          {
            universalArchetype: 'Mentor',
            genreSpecificVersion: 'Wise Wizard/Guide',
            requiredTraits: ['ancient wisdom', 'magical knowledge', 'protective of hero'],
            optionalTraits: ['mysterious past', 'tragic sacrifice'],
            avoidTraits: ['complete ignorance', 'malicious intent'],
            exampleCharacters: ['Gandalf', 'Dumbledore', 'Moiraine']
          }
        ],
        structuralPatterns: [
          {
            name: 'The Hero\'s Journey Extended',
            structure: 'Call → Refusal → Mentor → Threshold → Trials → Revelation → Abyss → Transformation → Return',
            acts: [
              {
                name: 'Ordinary World',
                duration: '10-15%',
                purpose: 'Establish baseline and call to adventure',
                keyElements: ['world establishment', 'character introduction', 'inciting incident']
              },
              {
                name: 'Adventure Begins',
                duration: '20-25%',
                purpose: 'Hero enters special world and faces initial challenges',
                keyElements: ['mentor meeting', 'threshold crossing', 'first trials']
              },
              {
                name: 'The Quest',
                duration: '50-60%',
                purpose: 'Multiple trials, character growth, mounting stakes',
                keyElements: ['escalating challenges', 'character development', 'alliance building']
              },
              {
                name: 'The Ordeal',
                duration: '10-15%',
                purpose: 'Final confrontation and ultimate test',
                keyElements: ['darkest moment', 'final battle', 'transformation']
              },
              {
                name: 'Return and Resolution',
                duration: '5-10%',
                purpose: 'Hero returns changed, world restored',
                keyElements: ['victory celebration', 'world healing', 'new status quo']
              }
            ],
            pacing: [
              {
                phase: 'opening',
                pace: 'moderate',
                focus: 'world-building and character establishment'
              },
              {
                phase: 'middle',
                pace: 'varied',
                focus: 'adventure beats with character moments'
              },
              {
                phase: 'climax',
                pace: 'intense',
                focus: 'high-stakes action and revelation'
              }
            ],
            mandatoryElements: ['heroic protagonist', 'clear antagonist', 'magical world', 'transformative journey'],
            optionalElements: ['romantic subplot', 'comic relief', 'prophecy', 'magical artifacts'],
            climaxRequirements: ['hero faces ultimate test', 'magic plays crucial role', 'good triumphs']
          }
        ],
        dialogueConventions: [
          {
            convention: 'Formal/Archaic Speech Patterns',
            description: 'Characters often speak with elevated, formal language',
            examples: ['"Nay, good sir, I shall not abandon my quest."', '"The darkness grows ever stronger."'],
            appropriateContexts: ['nobles', 'ancient beings', 'formal occasions'],
            modernAdaptations: ['Selective formality', 'Context-appropriate register']
          },
          {
            convention: 'Exposition Through Lore',
            description: 'Information delivered through historical accounts and legends',
            examples: ['"In the days of old..."', '"The prophecy speaks of..."'],
            appropriateContexts: ['info dumps', 'world building', 'prophecy revelation'],
            modernAdaptations: ['Organic integration', 'Character-driven discovery']
          }
        ],
        tropeUsage: [
          {
            trope: 'Chosen One',
            usage: 'essential',
            deployment: 'Early revelation or gradual discovery',
            subversionOpportunity: 'Multiple chosen ones or chosen one rejects destiny'
          },
          {
            trope: 'Dark Lord',
            usage: 'common',
            deployment: 'Ultimate antagonist with ancient evil',
            subversionOpportunity: 'Sympathetic dark lord or hero becomes dark lord'
          },
          {
            trope: 'Magic Sword',
            usage: 'optional',
            deployment: 'Reward for worthy hero',
            subversionOpportunity: 'Cursed weapon or weapon chooses unexpected wielder'
          }
        ],
        worldBuildingRules: [
          {
            rule: 'Magic must have consistent rules and limitations',
            rationale: 'Prevents magic from solving all problems',
            flexibility: 'moderate',
            exceptions: ['Wild magic zones', 'Divine intervention']
          },
          {
            rule: 'Geography should reflect the story\'s scope',
            rationale: 'Epic stories need epic landscapes',
            flexibility: 'flexible',
            exceptions: ['Intimate character studies', 'Single location stories']
          }
        ],
        choiceFrameworks: [
          {
            framework: 'Moral Absolutes',
            description: 'Clear right and wrong choices with obvious consequences',
            typicalChoices: ['Save innocents vs strategic advantage', 'Trust ally vs suspect everyone'],
            stakesLevel: 8,
            consequencePatterns: ['Good choices lead to help', 'Evil choices corrupt']
          },
          {
            framework: 'Heroic Sacrifice',
            description: 'Choices that test willingness to sacrifice for others',
            typicalChoices: ['Personal happiness vs duty', 'Life vs greater good'],
            stakesLevel: 9,
            consequencePatterns: ['Sacrifice leads to unexpected aid', 'Selfishness leads to loss']
          }
        ],
        innovationOpportunities: [
          {
            area: 'Magic System Innovation',
            description: 'Create unique magic with novel costs/benefits',
            riskLevel: 'low',
            potentialImpact: 'high',
            examples: ['Magic drains emotions', 'Magic requires collective casting']
          },
          {
            area: 'Subvert Chosen One Trope',
            description: 'Twist or challenge the chosen one concept',
            riskLevel: 'moderate',
            potentialImpact: 'high',
            examples: ['Chosen one is the antagonist', 'Multiple competing chosen ones']
          }
        ],
        subversionPotential: [
          {
            element: 'Hero Journey',
            subversionType: 'Refusal to Return',
            description: 'Hero chooses to stay in magical world',
            riskLevel: 'moderate',
            audienceReaction: 'mixed',
            executionTips: ['Make choice feel earned', 'Show what hero gains']
          }
        ],
        crossGenreCompatibility: [
          {
            genre: 'romance',
            compatibility: 8,
            blendingStrategy: 'Romantic subplot enhances character growth',
            successExamples: ['Beauty and the Beast', 'Outlander'],
            pitfalls: ['Romance overshadowing adventure', 'Rushed relationships']
          },
          {
            genre: 'mystery',
            compatibility: 6,
            blendingStrategy: 'Mystery drives quest progression',
            successExamples: ['The Name of the Wind', 'The Lies of Locke Lamora'],
            pitfalls: ['Magic solving mysteries too easily', 'Overly complex plotting']
          }
        ],
        genreAuthenticity: {
          overallScore: 0,
          componentScores: {},
          issues: [],
          recommendations: [],
          genreCompliance: false,
          innovationLevel: 0
        },
        commercialViability: {
          marketSize: 'large',
          competitionLevel: 'high',
          monetizationPotential: 'high',
          audienceLoyalty: 'very high',
          transmediaOpportunities: ['games', 'films', 'merchandise']
        },
        criticalReception: {
          literaryRespectability: 'moderate',
          academicInterest: 'growing',
          awardPotential: 'moderate',
          culturalImpact: 'high',
          longevityProspects: 'excellent'
        }
      },
      
      // More comprehensive genre profiles would continue...
      {
        id: 'psychological-thriller',
        name: 'Psychological Thriller',
        category: 'commercial',
        definition: 'Suspenseful narratives focused on psychological tension and mental states rather than physical action',
        coreElements: ['psychological tension', 'unreliable reality', 'mind games', 'paranoia', 'hidden motives'],
        essentialMoods: ['suspense', 'unease', 'paranoia', 'revelation'],
        audienceExpectations: [
          {
            expectation: 'Mounting psychological tension',
            importance: 9,
            flexibilityLevel: 1
          },
          {
            expectation: 'Unreliable narrator or reality',
            importance: 7,
            flexibilityLevel: 4
          }
        ],
        satisfactionRequirements: [
          {
            requirement: 'Reveal truth behind psychological mystery',
            criticality: 'essential',
            alternativeApproaches: ['Ambiguous ending', 'Multiple valid interpretations']
          }
        ],
        taboos: [
          {
            taboo: 'Simple external solutions to psychological problems',
            severity: 'major',
            rationale: 'Undermines genre\'s focus on internal conflict'
          }
        ],
        typicalPremises: [
          {
            pattern: 'Reality is not what it seems',
            examples: ['Fight Club', 'Shutter Island'],
            frequency: 8,
            effectiveness: 9,
            modernization: 'Digital age reality distortion'
          }
        ],
        characterArchetypes: [
          {
            universalArchetype: 'Protagonist',
            genreSpecificVersion: 'Unreliable Observer',
            requiredTraits: ['mental instability or trauma', 'obsessive nature'],
            optionalTraits: ['memory issues', 'substance abuse'],
            avoidTraits: ['perfect mental health', 'complete trustworthiness'],
            exampleCharacters: ['Tyler Durden', 'Teddy Daniels']
          }
        ],
        structuralPatterns: [
          {
            name: 'Psychological Descent',
            structure: 'Normal → Doubt → Investigation → Revelation → Confrontation → Resolution/Ambiguity',
            acts: [
              {
                name: 'Establishing Normalcy',
                duration: '15%',
                purpose: 'Show apparently normal reality',
                keyElements: ['false normal', 'subtle wrongness', 'character introduction']
              },
              {
                name: 'Growing Doubt',
                duration: '25%',
                purpose: 'Introduce psychological uncertainty',
                keyElements: ['first signs of trouble', 'reality questions', 'paranoia seeds']
              },
              {
                name: 'Investigation/Descent',
                duration: '40%',
                purpose: 'Deep dive into psychological maze',
                keyElements: ['clue gathering', 'false revelations', 'escalating tension']
              },
              {
                name: 'Revelation',
                duration: '15%',
                purpose: 'Truth revealed or ultimate confusion',
                keyElements: ['major revelation', 'reality shift', 'character crisis']
              },
              {
                name: 'Resolution',
                duration: '5%',
                purpose: 'New understanding or ambiguous ending',
                keyElements: ['acceptance', 'new reality', 'lingering questions']
              }
            ],
            pacing: [
              {
                phase: 'opening',
                pace: 'slow burn',
                focus: 'character establishment and subtle wrongness'
              },
              {
                phase: 'middle',
                pace: 'accelerating',
                focus: 'mounting tension and revelations'
              },
              {
                phase: 'climax',
                pace: 'intense',
                focus: 'psychological breakthrough or breakdown'
              }
            ],
            mandatoryElements: ['psychological tension', 'reality questions', 'internal conflict'],
            optionalElements: ['twist ending', 'unreliable narrator', 'dream sequences'],
            climaxRequirements: ['psychological confrontation', 'truth revelation', 'character resolution']
          }
        ],
        dialogueConventions: [
          {
            convention: 'Subtext-Heavy Conversations',
            description: 'Characters rarely say what they mean directly',
            examples: ['"Everything is fine." (when nothing is fine)', '"I trust you." (when trust is broken)'],
            appropriateContexts: ['character conflicts', 'hidden motives', 'psychological games'],
            modernAdaptations: ['Authentic subtlety', 'Realistic speech patterns']
          }
        ],
        tropeUsage: [
          {
            trope: 'Unreliable Narrator',
            usage: 'essential',
            deployment: 'Gradual revelation of unreliability',
            subversionOpportunity: 'Narrator more reliable than they appear'
          }
        ],
        worldBuildingRules: [
          {
            rule: 'Reality should be subtly wrong',
            rationale: 'Creates psychological unease',
            flexibility: 'moderate',
            exceptions: ['Completely surreal approaches', 'Hyperrealistic approaches']
          }
        ],
        choiceFrameworks: [
          {
            framework: 'Trust vs Paranoia',
            description: 'Choices about who and what to believe',
            typicalChoices: ['Trust the evidence vs trust instincts', 'Confront vs avoid'],
            stakesLevel: 7,
            consequencePatterns: ['Trust leads to vulnerability', 'Paranoia leads to isolation']
          }
        ],
        innovationOpportunities: [
          {
            area: 'Digital Age Paranoia',
            description: 'Explore modern technological psychological manipulation',
            riskLevel: 'low',
            potentialImpact: 'high',
            examples: ['Social media reality distortion', 'AI manipulation']
          }
        ],
        subversionPotential: [
          {
            element: 'Unreliable Narrator',
            subversionType: 'Actually Reliable',
            description: 'Narrator appears unreliable but is actually correct',
            riskLevel: 'moderate',
            audienceReaction: 'positive if well executed',
            executionTips: ['Build false unreliability', 'Vindicate narrator gradually']
          }
        ],
        crossGenreCompatibility: [
          {
            genre: 'horror',
            compatibility: 9,
            blendingStrategy: 'Psychological horror through mental deterioration',
            successExamples: ['The Shining', 'Black Swan'],
            pitfalls: ['Overreliance on jump scares', 'External threats overshadowing internal']
          }
        ],
        genreAuthenticity: {
          overallScore: 0,
          componentScores: {},
          issues: [],
          recommendations: [],
          genreCompliance: false,
          innovationLevel: 0
        },
        commercialViability: {
          marketSize: 'medium',
          competitionLevel: 'moderate',
          monetizationPotential: 'moderate',
          audienceLoyalty: 'high',
          transmediaOpportunities: ['films', 'podcasts', 'interactive media']
        },
        criticalReception: {
          literaryRespectability: 'high',
          academicInterest: 'high',
          awardPotential: 'high',
          culturalImpact: 'moderate',
          longevityProspects: 'good'
        }
      }
      
      // Additional genres would be added here: romance, sci-fi, horror, mystery, etc.
    ];
  }
  
  // Private helper methods for genre coordination
  
  private static getGenreProfile(genreId: string): GenreProfile {
    const database = this.getGenreDatabase();
    const profile = database.find(g => g.id === genreId);
    if (!profile) {
      throw new Error(`Genre profile not found: ${genreId}`);
    }
    return profile;
  }
  
  private static createGenreAdaptation(genre: GenreProfile, genreBlend?: GenreBlend): GenreAdaptation {
    return {
      genre,
      premiseAdaptation: this.createPremiseAdaptation(genre, genreBlend),
      characterAdaptation: this.createCharacterAdaptation(genre, genreBlend),
      narrativeAdaptation: this.createNarrativeAdaptation(genre, genreBlend),
      dialogueAdaptation: this.createDialogueAdaptation(genre, genreBlend),
      tropeAdaptation: this.createTropeAdaptation(genre, genreBlend),
      worldAdaptation: this.createWorldAdaptation(genre, genreBlend),
      choiceAdaptation: this.createChoiceAdaptation(genre, genreBlend),
      engineCoordination: this.createEngineCoordination(genre, genreBlend),
      priorityMatrix: this.createPriorityMatrix(genre, genreBlend),
      conflictResolution: this.createConflictResolution(genre, genreBlend),
      genreValidation: this.createGenreValidation(genre, genreBlend),
      authenticityChecks: this.createAuthenticityChecks(genre, genreBlend),
      audienceSatisfaction: this.createAudienceSatisfactionMetrics(genre, genreBlend)
    };
  }
  
  private static createPremiseAdaptation(genre: GenreProfile, genreBlend?: GenreBlend): PremiseAdaptation {
    return {
      themeFilters: genre.typicalPremises.map(p => p.pattern),
      premisePatterns: genre.typicalPremises,
      avoidancePatterns: genre.taboos.map(t => t.taboo),
      modernizationStrategies: genre.typicalPremises.map(p => p.modernization),
      blendingConsiderations: genreBlend?.hybridElements.map(h => h.premiseInfluence) || []
    };
  }
  
  private static createCharacterAdaptation(genre: GenreProfile, genreBlend?: GenreBlend): CharacterAdaptation {
    return {
      archetypeMapping: genre.characterArchetypes,
      requiredCharacters: genre.characterArchetypes.filter(a => a.requiredTraits.length > 0),
      prohibitedTraits: genre.characterArchetypes.flatMap(a => a.avoidTraits),
      genreSpecificTraits: genre.characterArchetypes.flatMap(a => a.requiredTraits),
      blendingModifications: genreBlend?.hybridElements.map(h => h.characterInfluence) || []
    };
  }
  
  private static createNarrativeAdaptation(genre: GenreProfile, genreBlend?: GenreBlend): NarrativeAdaptation {
    return {
      structuralPatterns: genre.structuralPatterns,
      pacingRequirements: genre.structuralPatterns.flatMap(p => p.pacing),
      mandatoryElements: genre.structuralPatterns.flatMap(p => p.mandatoryElements),
      climaxRequirements: genre.structuralPatterns.flatMap(p => p.climaxRequirements),
      blendingStructures: genreBlend?.hybridElements.map(h => h.structuralInfluence) || []
    };
  }
  
  private static createDialogueAdaptation(genre: GenreProfile, genreBlend?: GenreBlend): DialogueAdaptation {
    return {
      conventions: genre.dialogueConventions,
      styleRequirements: genre.dialogueConventions.map(c => c.convention),
      modernizationApproaches: genre.dialogueConventions.flatMap(c => c.modernAdaptations),
      contextualGuidance: genre.dialogueConventions.flatMap(c => c.appropriateContexts),
      blendingStyles: genreBlend?.hybridElements.map(h => h.dialogueInfluence) || []
    };
  }
  
  private static createTropeAdaptation(genre: GenreProfile, genreBlend?: GenreBlend): TropeAdaptation {
    return {
      tropeUsageRules: genre.tropeUsage,
      essentialTropes: genre.tropeUsage.filter(t => t.usage === 'essential'),
      tabooTropes: genre.tropeUsage.filter(t => t.usage === 'taboo'),
      subversionOpportunities: genre.tropeUsage.map(t => t.subversionOpportunity),
      blendingTropes: genreBlend?.hybridElements.map(h => h.tropeInfluence) || []
    };
  }
  
  private static createWorldAdaptation(genre: GenreProfile, genreBlend?: GenreBlend): WorldAdaptation {
    return {
      worldBuildingRules: genre.worldBuildingRules,
      strictRequirements: genre.worldBuildingRules.filter(r => r.flexibility === 'strict'),
      flexibleGuidelines: genre.worldBuildingRules.filter(r => r.flexibility === 'flexible'),
      exceptionHandling: genre.worldBuildingRules.flatMap(r => r.exceptions),
      blendingWorldRules: genreBlend?.hybridElements.map(h => h.worldInfluence) || []
    };
  }
  
  private static createChoiceAdaptation(genre: GenreProfile, genreBlend?: GenreBlend): ChoiceAdaptation {
    return {
      choiceFrameworks: genre.choiceFrameworks,
      stakesLevels: genre.choiceFrameworks.map(f => f.stakesLevel),
      consequencePatterns: genre.choiceFrameworks.flatMap(f => f.consequencePatterns),
      typicalChoiceTypes: genre.choiceFrameworks.flatMap(f => f.typicalChoices),
      blendingChoiceStyles: genreBlend?.hybridElements.map(h => h.choiceInfluence) || []
    };
  }
  
  // More helper methods would continue for all the complex genre coordination logic...
  
  private static adaptThemeForGenre(theme: string, adaptation: PremiseAdaptation): string {
    // Adapt theme to fit genre expectations
    return theme; // Simplified
  }
  
  private static adaptPremiseStatementForGenre(statement: string, adaptation: PremiseAdaptation): string {
    // Adapt premise statement for genre
    return statement; // Simplified
  }
  
  private static adaptCharacterForGenre(character: Character3D, adaptation: CharacterAdaptation): Character3D {
    // Apply genre-specific character modifications
    return character; // Simplified
  }
  
  private static resolveEngineConflict(coordinated: any, resolution: ConflictResolution): any {
    // Resolve conflicts between engines
    return coordinated; // Simplified
  }
  
  private static applyPriorityMatrix(coordinated: any, priorityMatrix: PriorityMatrix): any {
    // Apply engine priority rules
    return coordinated; // Simplified
  }
  
  private static enforceGenreConsistency(coordinated: any, coordination: EngineCoordination): any {
    // Ensure all engines maintain genre consistency
    return coordinated; // Simplified
  }
  
  private static scorePremiseAuthenticity(premise: StoryPremise, genre: GenreProfile): number {
    // Score how well premise fits genre
    return 8; // Simplified
  }
  
  private static scoreCharacterAuthenticity(characters: Character3D[], genre: GenreProfile): number {
    // Score how well characters fit genre archetypes
    return 7; // Simplified
  }
  
  // Engine-specific generation methods
  private static generateGenreAdaptedNarrative(premise: StoryPremise, characters: Character3D[], adaptation: NarrativeAdaptation): any {
    // Generate narrative structure adapted for genre
    return {}; // Simplified
  }
  
  private static generateGenreAdaptedDialogue(narrative: any, characters: Character3D[], adaptation: DialogueAdaptation): any {
    // Generate dialogue adapted for genre
    return {}; // Simplified
  }
  
  private static generateGenreAdaptedTropes(premise: StoryPremise, characters: Character3D[], adaptation: TropeAdaptation): any {
    // Generate trope deployment adapted for genre
    return {}; // Simplified
  }
  
  private static generateGenreAdaptedWorld(premise: StoryPremise, characters: Character3D[], narrative: any, adaptation: WorldAdaptation): any {
    // Generate world state adapted for genre
    return {}; // Simplified
  }
  
  private static generateGenreAdaptedChoices(world: any, premise: StoryPremise, adaptation: ChoiceAdaptation): any[] {
    // Generate choices adapted for genre
    return []; // Simplified
  }
  
  // Assessment methods
  private static assessGenreInnovation(coordinated: any, genre: GenreProfile): any {
    return {
      innovationLevel: 7,
      innovativeElements: ['Modern elements'],
      riskRewardBalance: 'Balanced'
    };
  }
  
  private static assessAudienceMatch(coordinated: any, genre: GenreProfile): any {
    return {
      matchScore: 8,
      targetAudienceAlignment: 'Strong',
      potentialAudienceExpansion: 'Good'
    };
  }
  
  private static assessEngineHarmony(coordinated: any): any {
    return {
      harmonyScore: 9,
      engineSynergies: ['Good coordination'],
      conflictResolutions: ['Issues resolved']
    };
  }
  
  private static assessNarrativeCoherence(coordinated: any): any {
    return {
      coherenceScore: 8,
      coherenceFactors: ['Consistent elements'],
      potentialIssues: ['Minor pacing']
    };
  }
  
  private static assessGenreEvolution(coordinated: any, genre: GenreProfile): any {
    return {
      evolutionPotential: 7,
      genreContributions: ['Innovation'],
      influenceOnGenre: 'Positive'
    };
  }
  
  // Genre blending methods
  private static analyzeGenreCompatibility(primaryGenre: GenreProfile, secondaryGenres: GenreProfile[]): any {
    return { compatibility: 'high' }; // Simplified
  }
  
  private static designBlendingApproach(primaryGenre: GenreProfile, secondaryGenres: GenreProfile[], strategy: any, compatibility: any): BlendingApproach {
    return {
      integrationMethod: { method: 'layered', description: 'Layer elements', implementation: 'Strategic layering' },
      dominanceStrategy: '70-30 split',
      hybridizationAreas: ['characters', 'dialogue', 'world']
    };
  }
  
  private static createHybridElements(primaryGenre: GenreProfile, secondaryGenres: GenreProfile[], approach: BlendingApproach): HybridElement[] {
    return [{
      name: 'Hybrid Element',
      description: 'Blended element',
      sourceGenres: [primaryGenre.id],
      premiseInfluence: {},
      characterInfluence: {},
      structuralInfluence: {},
      dialogueInfluence: {},
      tropeInfluence: {},
      worldInfluence: {},
      choiceInfluence: {}
    }];
  }
  
  private static assessBlendingRisks(primaryGenre: GenreProfile, secondaryGenres: GenreProfile[], elements: HybridElement[]): any {
    return {
      audienceReception: { riskLevel: 'moderate' as const, riskFactors: [], mitigationStrategies: [] },
      marketViability: { riskLevel: 'moderate' as const, marketConcerns: [], competitiveAdvantages: [] },
      executionComplexity: { riskLevel: 'moderate' as const, complexityFactors: [], executionChallenges: [] }
    };
  }
  
  private static generateBlendName(primaryGenre: GenreProfile, secondaryGenres: GenreProfile[]): string {
    return `${primaryGenre.name} × ${secondaryGenres.map(g => g.name).join(' × ')}`;
  }
  
  private static calculateDominanceRatio(strategy: any): DominanceRatio {
    return { primary: 0.7, secondary: [0.3] };
  }
  
  private static identifyInnovativeFeatures(elements: HybridElement[]): InnovativeFeature[] {
    return [{ feature: 'Innovation', innovation: 'Creative blend', marketDifferentiation: 'Unique' }];
  }
  
  private static identifyUniqueSellingPoints(elements: HybridElement[]): UniqueSellingPoint[] {
    return [{ point: 'Unique blend', marketValue: 'High', audienceAppeal: 'Strong' }];
  }
  
  private static findGenrePrecedents(primaryGenre: GenreProfile, secondaryGenres: GenreProfile[]): GenrePrecedent[] {
    return [{ work: 'Example', blendingApproach: 'Similar', successFactors: [], lessons: [] }];
  }
  
  private static findGenreInspirations(primaryGenre: GenreProfile, secondaryGenres: GenreProfile[]): GenreInspiration[] {
    return [{ source: 'Inspiration', inspirationalElement: 'Element', adaptationPotential: 'High' }];
  }
  
  // Additional helper methods would continue...

  // ============================================================
  // AI-ENHANCED GENRE GENERATION METHODS
  // ============================================================

  /**
   * AI-ENHANCED: Generate comprehensive genre profile using AI intelligence
   */
  static async generateGenreProfileAI(genreId: string): Promise<GenreProfile> {
    const prompt = `Create a comprehensive genre profile for "${genreId}":

GENRE: ${genreId}

Generate a complete genre profile including:

1. DEFINITION: Clear, precise definition of this genre
2. CORE ELEMENTS: 5-7 essential elements that define this genre
3. ESSENTIAL MOODS: Emotional tones the audience expects
4. AUDIENCE EXPECTATIONS: What audiences require from this genre (with importance 1-10)
5. TYPICAL PREMISES: Common premise patterns with examples and frequency
6. CHARACTER ARCHETYPES: Genre-specific character types with traits
7. STRUCTURAL PATTERNS: Narrative structures that work for this genre
8. DIALOGUE CONVENTIONS: How characters speak in this genre
9. TROPE USAGE: Essential, common, and taboo tropes with deployment strategies
10. WORLD BUILDING RULES: Guidelines for creating settings
11. CHOICE FRAMEWORKS: Decision-making patterns for this genre
12. INNOVATION OPPORTUNITIES: Areas for creative evolution
13. CROSS-GENRE COMPATIBILITY: What genres blend well with this

Focus on making this authentic to ${genreId} conventions while identifying modern opportunities for innovation.

Return detailed JSON with all required components.`;

    try {
      const { AIOrchestrator } = await import('./ai-orchestrator');
      const result = await AIOrchestrator.generateStructuredContent({
        prompt,
        systemPrompt: `You are a master genre theorist and expert in ${genreId} literature/media. Create comprehensive, authentic genre profiles.`,
        mode: 'beast',
        temperature: 0.6,
        maxTokens: 1500
      }, 'GenreMasterySystem');

      const genreData = result.data || {};
      
      if (genreData.definition && genreData.coreElements) {
        return this.buildGenreProfileFromAI(genreId, genreData);
      }
      
      return this.generateGenreProfileFallback(genreId);
    } catch (error) {
      console.warn(`AI genre profile generation failed for ${genreId}, using fallback:`, error);
      return this.generateGenreProfileFallback(genreId);
    }
  }

  /**
   * AI-ENHANCED: Expand genre database with all missing genres
   */
  static async generateAllGenreProfiles(): Promise<GenreProfile[]> {
    const missingGenres = [
      'romance', 'mystery', 'horror', 'sci-fi', 'thriller', 'comedy', 
      'drama', 'action', 'western', 'historical-fiction', 'crime', 
      'literary-fiction', 'young-adult', 'paranormal-romance', 
      'urban-fantasy', 'space-opera', 'cyberpunk', 'steampunk',
      'noir', 'cozy-mystery', 'romantic-comedy', 'dark-fantasy',
      'magical-realism', 'dystopian', 'post-apocalyptic', 'alternate-history'
    ];

    const existingGenres = this.getGenreDatabase();
    const newGenres: GenreProfile[] = [];

    for (const genreId of missingGenres) {
      // Skip if already exists
      if (existingGenres.find(g => g.id === genreId)) {
        continue;
      }

      try {
        const newGenre = await this.generateGenreProfileAI(genreId);
        newGenres.push(newGenre);
        console.log(`✅ Generated AI profile for ${genreId}`);
      } catch (error) {
        console.warn(`❌ Failed to generate profile for ${genreId}:`, error);
      }
    }

    return newGenres;
  }

  /**
   * AI-ENHANCED: Get or create genre profile with AI fallback
   */
  static async getOrGenerateGenreProfile(genreId: string): Promise<GenreProfile> {
    // First try existing database
    const existingGenres = this.getGenreDatabase();
    const existing = existingGenres.find(g => g.id === genreId);
    
    if (existing) {
      return existing;
    }
    
    // Generate with AI if not found
    console.log(`🤖 Generating AI profile for ${genreId}...`);
    return await this.generateGenreProfileAI(genreId);
  }

  /**
   * AI-ENHANCED: Build genre profile from AI-generated data
   */
  private static buildGenreProfileFromAI(genreId: string, genreData: any): GenreProfile {
    return {
      id: genreId,
      name: genreData.name || this.formatGenreName(genreId),
      category: genreData.category || this.determineGenreCategory(genreId),
      definition: genreData.definition || `AI-generated definition for ${genreId}`,
      coreElements: genreData.coreElements || [`Essential elements of ${genreId}`],
      essentialMoods: genreData.essentialMoods || [`Typical moods in ${genreId}`],
      audienceExpectations: this.buildAudienceExpectations(genreData.audienceExpectations || []),
      satisfactionRequirements: this.buildSatisfactionRequirements(genreData.satisfactionRequirements || []),
      taboos: this.buildTaboos(genreData.taboos || []),
      typicalPremises: this.buildPremisePatterns(genreData.typicalPremises || []),
      characterArchetypes: this.buildArchetypeMappings(genreData.characterArchetypes || []),
      structuralPatterns: this.buildStructuralPatterns(genreData.structuralPatterns || []),
      dialogueConventions: this.buildDialogueConventions(genreData.dialogueConventions || []),
      tropeUsage: this.buildTropeUsagePatterns(genreData.tropeUsage || []),
      worldBuildingRules: this.buildWorldBuildingRules(genreData.worldBuildingRules || []),
      choiceFrameworks: this.buildChoiceFrameworks(genreData.choiceFrameworks || []),
      innovationOpportunities: this.buildInnovationOpportunities(genreData.innovationOpportunities || []),
      subversionPotential: this.buildSubversionPotential(genreData.subversionPotential || []),
      crossGenreCompatibility: this.buildCrossGenreCompatibility(genreData.crossGenreCompatibility || []),
      genreAuthenticity: {
        overallScore: 0,
        componentScores: {},
        issues: [],
        recommendations: [],
        genreCompliance: false,
        innovationLevel: 0
      },
      commercialViability: this.buildCommercialViability(genreData.commercialViability || {}),
      criticalReception: this.buildCriticalReception(genreData.criticalReception || {})
    };
  }

  /**
   * Helper method to format genre names properly
   */
  private static formatGenreName(genreId: string): string {
    return genreId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Helper method to determine genre category
   */
  private static determineGenreCategory(genreId: string): GenreCategory {
    const categoryMap: { [key: string]: GenreCategory } = {
      'sci-fi': 'speculative',
      'fantasy': 'speculative', 
      'horror': 'speculative',
      'romance': 'commercial',
      'thriller': 'commercial',
      'mystery': 'commercial',
      'action': 'commercial',
      'drama': 'realistic',
      'literary-fiction': 'realistic',
      'western': 'traditional',
      'historical-fiction': 'traditional',
      'cyberpunk': 'speculative',
      'steampunk': 'speculative',
      'magical-realism': 'artistic',
      'experimental': 'artistic'
    };

    // Check direct match
    if (categoryMap[genreId]) {
      return categoryMap[genreId];
    }

    // Check partial matches
    for (const [key, category] of Object.entries(categoryMap)) {
      if (genreId.includes(key)) {
        return category;
      }
    }

    // Default fallback
    return 'realistic';
  }

  // Helper methods to build genre profile components
  private static buildAudienceExpectations(expectations: any[]): AudienceExpectation[] {
    return expectations.map(exp => ({
      expectation: exp.expectation || exp.description || 'Genre expectation',
      importance: exp.importance || 7,
      flexibilityLevel: exp.flexibilityLevel || 3
    }));
  }

  private static buildSatisfactionRequirements(requirements: any[]): SatisfactionRequirement[] {
    return requirements.map(req => ({
      requirement: req.requirement || req.description || 'Satisfaction requirement',
      criticality: req.criticality || 'important',
      alternativeApproaches: req.alternativeApproaches || []
    }));
  }

  private static buildTaboos(taboos: any[]): GenreTaboo[] {
    return taboos.map(taboo => ({
      taboo: taboo.taboo || taboo.description || 'Genre taboo',
      severity: taboo.severity || 'major',
      rationale: taboo.rationale || 'Violates genre expectations'
    }));
  }

  private static buildPremisePatterns(premises: any[]): PremisePattern[] {
    return premises.map(premise => ({
      pattern: premise.pattern || premise.description || 'Premise pattern',
      examples: premise.examples || [],
      frequency: premise.frequency || 5,
      effectiveness: premise.effectiveness || 7,
      modernization: premise.modernization || 'Modern interpretation'
    }));
  }

  private static buildArchetypeMappings(archetypes: any[]): ArchetypeMapping[] {
    return archetypes.map(archetype => ({
      universalArchetype: archetype.universalArchetype || 'Character',
      genreSpecificVersion: archetype.genreSpecificVersion || 'Genre Character',
      requiredTraits: archetype.requiredTraits || [],
      optionalTraits: archetype.optionalTraits || [],
      avoidTraits: archetype.avoidTraits || [],
      exampleCharacters: archetype.exampleCharacters || []
    }));
  }

  private static buildStructuralPatterns(patterns: any[]): StructuralPattern[] {
    return patterns.map(pattern => ({
      name: pattern.name || 'Structure Pattern',
      structure: pattern.structure || 'Beginning → Middle → End',
      acts: pattern.acts || [],
      pacing: pattern.pacing || [],
      mandatoryElements: pattern.mandatoryElements || [],
      optionalElements: pattern.optionalElements || [],
      climaxRequirements: pattern.climaxRequirements || []
    }));
  }

  private static buildDialogueConventions(conventions: any[]): DialogueConvention[] {
    return conventions.map(conv => ({
      convention: conv.convention || conv.name || 'Dialogue Convention',
      description: conv.description || 'Genre dialogue style',
      examples: conv.examples || [],
      appropriateContexts: conv.appropriateContexts || [],
      modernAdaptations: conv.modernAdaptations || []
    }));
  }

  private static buildTropeUsagePatterns(tropes: any[]): TropeUsagePattern[] {
    return tropes.map(trope => ({
      trope: trope.trope || trope.name || 'Genre Trope',
      usage: trope.usage || 'common',
      deployment: trope.deployment || 'Standard deployment',
      subversionOpportunity: trope.subversionOpportunity || 'Subversion opportunity'
    }));
  }

  private static buildWorldBuildingRules(rules: any[]): WorldBuildingRule[] {
    return rules.map(rule => ({
      rule: rule.rule || rule.description || 'World building rule',
      rationale: rule.rationale || 'Supports genre conventions',
      flexibility: rule.flexibility || 'moderate',
      exceptions: rule.exceptions || []
    }));
  }

  private static buildChoiceFrameworks(frameworks: any[]): ChoiceFramework[] {
    return frameworks.map(framework => ({
      framework: framework.framework || framework.name || 'Choice Framework',
      description: framework.description || 'Framework description',
      typicalChoices: framework.typicalChoices || [],
      stakesLevel: framework.stakesLevel || 5,
      consequencePatterns: framework.consequencePatterns || []
    }));
  }

  private static buildInnovationOpportunities(opportunities: any[]): InnovationOpportunity[] {
    return opportunities.map(opp => ({
      area: opp.area || opp.name || 'Innovation Area',
      description: opp.description || 'Innovation opportunity',
      riskLevel: opp.riskLevel || 'moderate',
      potentialImpact: opp.potentialImpact || 'moderate',
      examples: opp.examples || []
    }));
  }

  private static buildSubversionPotential(subversions: any[]): SubversionPotential[] {
    return subversions.map(sub => ({
      element: sub.element || sub.name || 'Genre Element',
      subversionType: sub.subversionType || 'Twist',
      description: sub.description || 'Subversion description',
      riskLevel: sub.riskLevel || 'moderate',
      audienceReaction: sub.audienceReaction || 'mixed',
      executionTips: sub.executionTips || []
    }));
  }

  private static buildCrossGenreCompatibility(compatibilities: any[]): CrossGenreCompatibility[] {
    return compatibilities.map(comp => ({
      genre: comp.genre || comp.name || 'Other Genre',
      compatibility: comp.compatibility || 5,
      blendingStrategy: comp.blendingStrategy || 'Standard blending',
      successExamples: comp.successExamples || [],
      pitfalls: comp.pitfalls || []
    }));
  }

  private static buildCommercialViability(viability: any): CommercialViability {
    return {
      marketSize: viability.marketSize || 'moderate',
      competitionLevel: viability.competitionLevel || 'moderate',
      monetizationPotential: viability.monetizationPotential || 'moderate',
      audienceLoyalty: viability.audienceLoyalty || 'moderate',
      transmediaOpportunities: viability.transmediaOpportunities || []
    };
  }

  private static buildCriticalReception(reception: any): CriticalReception {
    return {
      literaryRespectability: reception.literaryRespectability || 'moderate',
      academicInterest: reception.academicInterest || 'moderate',
      awardPotential: reception.awardPotential || 'moderate',
      culturalImpact: reception.culturalImpact || 'moderate',
      longevityProspects: reception.longevityProspects || 'moderate'
    };
  }

  /**
   * Fallback method for when AI generation fails
   */
  private static generateGenreProfileFallback(genreId: string): GenreProfile {
    console.warn(`Using fallback profile for ${genreId}`);
    
    return {
      id: genreId,
      name: this.formatGenreName(genreId),
      category: this.determineGenreCategory(genreId),
      definition: `${this.formatGenreName(genreId)} genre stories with characteristic themes and conventions`,
      coreElements: [`${this.formatGenreName(genreId)} elements`],
      essentialMoods: [`${this.formatGenreName(genreId)} atmosphere`],
      audienceExpectations: [
        {
          expectation: `Authentic ${this.formatGenreName(genreId)} experience`,
          importance: 8,
          flexibilityLevel: 3
        }
      ],
      satisfactionRequirements: [
        {
          requirement: `Deliver on ${this.formatGenreName(genreId)} promises`,
          criticality: 'important' as const,
          alternativeApproaches: ['Genre innovation']
        }
      ],
      taboos: [
        {
          taboo: `Violate core ${this.formatGenreName(genreId)} conventions`,
          severity: 'major' as const,
          rationale: 'Breaks audience contract'
        }
      ],
      typicalPremises: [
        {
          pattern: `Classic ${this.formatGenreName(genreId)} premise`,
          examples: [],
          frequency: 7,
          effectiveness: 7,
          modernization: 'Contemporary interpretation'
        }
      ],
      characterArchetypes: [],
      structuralPatterns: [],
      dialogueConventions: [],
      tropeUsage: [],
      worldBuildingRules: [],
      choiceFrameworks: [],
      innovationOpportunities: [],
      subversionPotential: [],
      crossGenreCompatibility: [],
      genreAuthenticity: {
        overallScore: 0,
        componentScores: {},
        issues: [],
        recommendations: [],
        genreCompliance: false,
        innovationLevel: 0
      },
      commercialViability: {
        marketSize: 'moderate',
        competitionLevel: 'moderate',
        monetizationPotential: 'moderate',
        audienceLoyalty: 'moderate',
        transmediaOpportunities: []
      },
      criticalReception: {
        literaryRespectability: 'moderate',
        academicInterest: 'moderate',
        awardPotential: 'moderate',
        culturalImpact: 'moderate',
        longevityProspects: 'moderate'
      }
    };
  }

  /**
   * AI-ENHANCED: Enhanced genre database with AI-generated profiles
   */
  static async getExpandedGenreDatabase(): Promise<GenreProfile[]> {
    const existingGenres = this.getGenreDatabase();
    const newGenres = await this.generateAllGenreProfiles();
    return [...existingGenres, ...newGenres];
  }

  // ============================================================
  // AI-ENHANCED AUTOMATIC GENRE DETECTION SYSTEM
  // ============================================================

  /**
   * AI-ENHANCED: Automatically detect the best genre(s) for a user's story
   */
  static async detectStoryGenre(userInput: {
    synopsis: string;
    theme: string;
    targetAudience?: string;
    mood?: string;
    inspirations?: string[];
  }): Promise<GenreDetectionResult> {
    const prompt = `Analyze this story concept and determine the most appropriate genre(s):

STORY SYNOPSIS: "${userInput.synopsis}"
THEME: "${userInput.theme}"
${userInput.targetAudience ? `TARGET AUDIENCE: "${userInput.targetAudience}"` : ''}
${userInput.mood ? `DESIRED MOOD: "${userInput.mood}"` : ''}
${userInput.inspirations?.length ? `INSPIRATIONS: ${userInput.inspirations.join(', ')}` : ''}

Analyze the story elements and determine:

1. PRIMARY GENRE: The main genre that best fits this story (confidence 1-10)
2. SECONDARY GENRES: Up to 3 additional genres that could blend well (confidence 1-10 each)
3. GENRE REASONING: Why each genre fits the story elements
4. BLEND POTENTIAL: How well the genres could work together
5. AUDIENCE ALIGNMENT: How the detected genres match the target audience
6. MOOD COMPATIBILITY: How the genres support the desired mood

Available genres: romance, mystery, horror, sci-fi, thriller, comedy, drama, action, western, historical-fiction, crime, literary-fiction, young-adult, paranormal-romance, urban-fantasy, space-opera, cyberpunk, steampunk, noir, cozy-mystery, romantic-comedy, dark-fantasy, magical-realism, dystopian, post-apocalyptic, alternate-history

Return detailed JSON analysis with genre recommendations and confidence scores.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert genre analyst who can identify story genres with high accuracy. Analyze story elements and provide precise genre recommendations.',
        temperature: 0.4,
        maxTokens: 1000
      });

      const detection = JSON.parse(result || '{}');
      
      if (detection.primaryGenre && detection.confidence) {
        return this.buildGenreDetectionResult(detection, userInput);
      }
      
      return this.detectStoryGenreFallback(userInput);
    } catch (error) {
      console.warn('AI genre detection failed, using fallback:', error);
      return this.detectStoryGenreFallback(userInput);
    }
  }

  /**
   * AI-ENHANCED: Automatically generate story with detected genre
   */
  static async generateStoryWithAutoGenre(userInput: {
    synopsis: string;
    theme: string;
    targetAudience?: string;
    mood?: string;
    inspirations?: string[];
    innovationLevel?: number;
  }): Promise<AutoGenreStoryResult> {
    console.log('🤖 Detecting optimal genre for your story...');
    
    // Step 1: Detect the best genre(s)
    const genreDetection = await this.detectStoryGenre(userInput);
    
    console.log(`✅ Detected primary genre: ${genreDetection.primaryGenre.name} (${genreDetection.primaryGenre.confidence}/10 confidence)`);
    
    if (genreDetection.secondaryGenres.length > 0) {
      console.log(`🎭 Potential blends: ${genreDetection.secondaryGenres.map(g => g.name).join(', ')}`);
    }

    // Step 2: Create genre blend if multiple genres detected
    let genreBlend: GenreBlend | undefined;
    if (genreDetection.blendRecommendation && genreDetection.secondaryGenres.length > 0) {
      console.log('🎨 Creating intelligent genre blend...');
      
      genreBlend = await this.createGenreBlend(
        genreDetection.primaryGenre.id,
        genreDetection.secondaryGenres.slice(0, 2).map(g => g.id), // Top 2 secondary genres
        {
          approach: genreDetection.blendRecommendation.approach,
          integrationMethod: genreDetection.blendRecommendation.integrationMethod,
          riskTolerance: genreDetection.blendRecommendation.riskTolerance
        }
      );
    }

    // Step 3: Generate the complete story
    console.log('🏗️ Generating story with detected genre...');
    
    const story = await this.generateGenreMasteredStory(
      genreDetection.primaryGenre.id,
      userInput,
      genreBlend
    );

    return {
      genreDetection,
      genreBlend,
      story,
      autoConfiguration: {
        detectionConfidence: genreDetection.primaryGenre.confidence,
        blendRecommended: !!genreBlend,
        audienceAlignment: genreDetection.audienceAlignment,
        moodCompatibility: genreDetection.moodCompatibility
      }
    };
  }

  /**
   * AI-ENHANCED: Suggest alternative genres for user consideration
   */
  static async suggestAlternativeGenres(userInput: {
    synopsis: string;
    theme: string;
    currentGenre?: string;
  }): Promise<GenreSuggestion[]> {
    const prompt = `Suggest alternative genres for this story concept:

CURRENT STORY: "${userInput.synopsis}"
THEME: "${userInput.theme}"
${userInput.currentGenre ? `CURRENT GENRE: "${userInput.currentGenre}"` : ''}

Suggest 5 alternative genre approaches that could work for this story:

1. What different genres could tell this story?
2. How would each genre change the storytelling approach?
3. What unique opportunities does each genre offer?
4. What are the risks/benefits of each alternative?
5. Which audiences would each genre attract?

Provide creative, thoughtful alternatives that expand storytelling possibilities.

Return JSON array of genre suggestions with explanations.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a creative storytelling expert who can reimagine stories in different genres. Provide innovative genre alternatives.',
        temperature: 0.7,
        maxTokens: 800
      });

      const suggestions = JSON.parse(result || '[]');
      
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        return this.buildGenreSuggestions(suggestions);
      }
      
      return this.suggestAlternativeGenresFallback(userInput);
    } catch (error) {
      console.warn('AI genre suggestion failed, using fallback:', error);
      return this.suggestAlternativeGenresFallback(userInput);
    }
  }

  /**
   * AI-ENHANCED: Analyze genre market potential
   */
  static async analyzeGenreMarketPotential(genreId: string, userInput: {
    synopsis: string;
    theme: string;
    targetAudience?: string;
  }): Promise<GenreMarketAnalysis> {
    const prompt = `Analyze the market potential for this ${genreId} story:

GENRE: ${genreId}
STORY: "${userInput.synopsis}"
THEME: "${userInput.theme}"
${userInput.targetAudience ? `TARGET AUDIENCE: "${userInput.targetAudience}"` : ''}

Provide market analysis:

1. MARKET SIZE: How large is the ${genreId} market?
2. COMPETITION LEVEL: How saturated is this genre space?
3. AUDIENCE DEMAND: Current audience hunger for this type of story
4. UNIQUE POSITIONING: What makes this story stand out in ${genreId}?
5. COMMERCIAL VIABILITY: Revenue potential and monetization opportunities
6. TRANSMEDIA POTENTIAL: Opportunities for expansion (games, sequels, etc.)
7. CRITICAL RECEPTION: Likelihood of critical acclaim
8. LONGEVITY: Long-term staying power and cultural impact

Return detailed market analysis with actionable insights.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a entertainment industry market analyst expert in genre trends and commercial viability.',
        temperature: 0.5,
        maxTokens: 1000
      });

      const analysis = JSON.parse(result || '{}');
      
      if (analysis.marketSize && analysis.competitionLevel) {
        return this.buildGenreMarketAnalysis(analysis, genreId);
      }
      
      return this.analyzeGenreMarketPotentialFallback(genreId);
    } catch (error) {
      console.warn('AI market analysis failed, using fallback:', error);
      return this.analyzeGenreMarketPotentialFallback(genreId);
    }
  }

  // ============================================================
  // HELPER METHODS FOR AUTO-DETECTION SYSTEM
  // ============================================================

  /**
   * Build genre detection result from AI analysis
   */
  private static buildGenreDetectionResult(detection: any, userInput: any): GenreDetectionResult {
    return {
      primaryGenre: {
        id: detection.primaryGenre.id || detection.primaryGenre,
        name: detection.primaryGenre.name || this.formatGenreName(detection.primaryGenre.id || detection.primaryGenre),
        confidence: detection.primaryGenre.confidence || detection.confidence || 7,
        reasoning: detection.primaryGenre.reasoning || detection.reasoning || 'AI-detected best fit'
      },
      secondaryGenres: (detection.secondaryGenres || []).map((genre: any) => ({
        id: genre.id || genre,
        name: genre.name || this.formatGenreName(genre.id || genre),
        confidence: genre.confidence || 5,
        reasoning: genre.reasoning || 'Potential blend opportunity'
      })),
      blendRecommendation: detection.blendPotential ? {
        recommended: detection.blendPotential.recommended ?? true,
        approach: detection.blendPotential.approach || 'dominant-secondary',
        integrationMethod: detection.blendPotential.integrationMethod || 'layered',
        riskTolerance: detection.blendPotential.riskTolerance || 'moderate',
        explanation: detection.blendPotential.explanation || 'Genres complement each other well'
      } : undefined,
      audienceAlignment: {
        score: detection.audienceAlignment?.score || 7,
        explanation: detection.audienceAlignment?.explanation || 'Good audience fit',
        targetAudienceMatch: detection.audienceAlignment?.targetAudienceMatch || 'moderate'
      },
      moodCompatibility: {
        score: detection.moodCompatibility?.score || 7,
        explanation: detection.moodCompatibility?.explanation || 'Genre supports desired mood',
        moodEnhancement: detection.moodCompatibility?.moodEnhancement || []
      },
      confidence: detection.overallConfidence || 7,
      alternativeGenres: detection.alternativeGenres || [],
      detectionMethod: 'ai-analysis'
    };
  }

  /**
   * Fallback genre detection when AI fails
   */
  private static detectStoryGenreFallback(userInput: any): GenreDetectionResult {
    // Simple keyword-based detection
    const synopsis = userInput.synopsis.toLowerCase();
    const theme = userInput.theme.toLowerCase();
    const combined = synopsis + ' ' + theme;

    let primaryGenre = 'drama'; // Default fallback
    let confidence = 5;

    // Simple pattern matching
    if (combined.includes('love') || combined.includes('romance') || combined.includes('relationship')) {
      primaryGenre = 'romance';
      confidence = 6;
    } else if (combined.includes('mystery') || combined.includes('detective') || combined.includes('clue')) {
      primaryGenre = 'mystery';
      confidence = 6;
    } else if (combined.includes('horror') || combined.includes('scary') || combined.includes('fear')) {
      primaryGenre = 'horror';
      confidence = 6;
    } else if (combined.includes('funny') || combined.includes('comedy') || combined.includes('humor')) {
      primaryGenre = 'comedy';
      confidence = 6;
    } else if (combined.includes('action') || combined.includes('fight') || combined.includes('adventure')) {
      primaryGenre = 'action';
      confidence = 6;
    }

    return {
      primaryGenre: {
        id: primaryGenre,
        name: this.formatGenreName(primaryGenre),
        confidence,
        reasoning: 'Keyword-based detection (fallback)'
      },
      secondaryGenres: [],
      audienceAlignment: {
        score: 5,
        explanation: 'Basic genre match',
        targetAudienceMatch: 'moderate'
      },
      moodCompatibility: {
        score: 5,
        explanation: 'Standard genre mood',
        moodEnhancement: []
      },
      confidence: 5,
      alternativeGenres: [],
      detectionMethod: 'keyword-fallback'
    };
  }

  /**
   * Build genre suggestions from AI analysis
   */
  private static buildGenreSuggestions(suggestions: any[]): GenreSuggestion[] {
    return suggestions.map(suggestion => ({
      genreId: suggestion.genreId || suggestion.genre || 'drama',
      genreName: suggestion.genreName || this.formatGenreName(suggestion.genreId || suggestion.genre || 'drama'),
      approach: suggestion.approach || 'Alternative storytelling approach',
      opportunities: suggestion.opportunities || [],
      risks: suggestion.risks || [],
      benefits: suggestion.benefits || [],
      audienceAppeal: suggestion.audienceAppeal || 'Broad appeal',
      uniqueness: suggestion.uniqueness || 'Unique perspective',
      viability: suggestion.viability || 5
    }));
  }

  /**
   * Fallback genre suggestions
   */
  private static suggestAlternativeGenresFallback(userInput: any): GenreSuggestion[] {
    return [
      {
        genreId: 'drama',
        genreName: 'Drama',
        approach: 'Character-focused emotional journey',
        opportunities: ['Deep character development', 'Emotional resonance'],
        risks: ['May lack commercial appeal'],
        benefits: ['Critical acclaim potential', 'Actor showcase'],
        audienceAppeal: 'Adult audiences',
        uniqueness: 'Realistic, grounded storytelling',
        viability: 7
      },
      {
        genreId: 'thriller',
        genreName: 'Thriller',
        approach: 'High-stakes suspense version',
        opportunities: ['Constant tension', 'Page-turner appeal'],
        risks: ['May overshadow character development'],
        benefits: ['Commercial viability', 'Broad appeal'],
        audienceAppeal: 'Mainstream audiences',
        uniqueness: 'Suspenseful pacing',
        viability: 8
      }
    ];
  }

  /**
   * Build market analysis from AI data
   */
  private static buildGenreMarketAnalysis(analysis: any, genreId: string): GenreMarketAnalysis {
    return {
      genreId,
      marketSize: analysis.marketSize || 'moderate',
      competitionLevel: analysis.competitionLevel || 'moderate',
      audienceDemand: analysis.audienceDemand || 'moderate',
      uniquePositioning: analysis.uniquePositioning || 'Standard positioning',
      commercialViability: {
        score: analysis.commercialViability?.score || 6,
        factors: analysis.commercialViability?.factors || ['Genre popularity'],
        revenueProjection: analysis.commercialViability?.revenueProjection || 'moderate'
      },
      transmediaPotential: {
        score: analysis.transmediaPotential?.score || 5,
        opportunities: analysis.transmediaPotential?.opportunities || ['Sequels'],
        platforms: analysis.transmediaPotential?.platforms || ['Film']
      },
      criticalReception: {
        likelihood: analysis.criticalReception?.likelihood || 'moderate',
        factors: analysis.criticalReception?.factors || ['Genre conventions'],
        awardPotential: analysis.criticalReception?.awardPotential || 'moderate'
      },
      longevity: {
        score: analysis.longevity?.score || 6,
        factors: analysis.longevity?.factors || ['Timeless themes'],
        culturalImpact: analysis.longevity?.culturalImpact || 'moderate'
      },
      recommendations: analysis.recommendations || ['Focus on genre strengths'],
      riskFactors: analysis.riskFactors || ['Market saturation'],
      opportunities: analysis.opportunities || ['Growing audience']
    };
  }

  /**
   * Fallback market analysis
   */
  private static analyzeGenreMarketPotentialFallback(genreId: string): GenreMarketAnalysis {
    return {
      genreId,
      marketSize: 'moderate',
      competitionLevel: 'moderate',
      audienceDemand: 'moderate',
      uniquePositioning: 'Standard genre positioning',
      commercialViability: {
        score: 6,
        factors: ['Established genre audience'],
        revenueProjection: 'moderate'
      },
      transmediaPotential: {
        score: 5,
        opportunities: ['Potential sequels'],
        platforms: ['Film', 'Streaming']
      },
      criticalReception: {
        likelihood: 'moderate',
        factors: ['Genre conventions'],
        awardPotential: 'moderate'
      },
      longevity: {
        score: 6,
        factors: ['Enduring themes'],
        culturalImpact: 'moderate'
      },
      recommendations: ['Focus on unique story elements'],
      riskFactors: ['Genre saturation'],
      opportunities: ['Audience familiarity']
    };
  }

  /**
   * Helper method to convert V2.0 context to legacy format
   */
  private static convertToLegacyGenreInput(
    context: any,
    requirements: any,
    framework: GenreMasteryRecommendation
  ): any {
    return {
      userInput: {
        synopsis: `${context.projectTitle} - ${context.thematicElements.join(' and ')} in ${context.primaryGenre}`,
        theme: context.thematicElements[0] || 'Genre mastery',
        targetAudience: context.targetAudience,
        innovationLevel: requirements.innovationLevel === 'paradigm-shifting' ? 10 :
                        requirements.innovationLevel === 'revolutionary' ? 8 :
                        requirements.innovationLevel === 'evolutionary' ? 5 : 3
      },
      genreBlend: requirements.genreApproach === 'hybrid' ? {
        id: `blend-${Date.now()}`,
        name: `${context.primaryGenre} hybrid blend`,
        description: 'V2.0 enhanced genre blend',
        primaryGenre: context.primaryGenre,
        secondaryGenres: [],
        blendingStrategy: requirements.innovationLevel,
        approach: {} as BlendingApproach,
        elements: [],
        risks: {},
        marketPosition: {} as any
      } : undefined
    };
  }

  /**
   * Helper method to apply V2.0 framework enhancements to existing genre mastery
   */
  private static applyGenreFrameworkToMastery(
    genreMastery: GenreMasteredStory,
    framework: GenreMasteryRecommendation
  ): GenreMasteredStory {
    const enhancedMastery = { ...genreMastery };
    
    // Add framework metadata
    (enhancedMastery as any).genreFrameworkV2 = {
      frameworkVersion: 'GenreMasteryEngineV2',
      confidence: framework.primaryRecommendation.confidence,
      
      // Theoretical Framework
      genreTheory: {
        altmanFramework: framework.primaryRecommendation.genreTheory.altmanFramework,
        schatzTypology: framework.primaryRecommendation.genreTheory.schatzTypology,
        nealeBalance: framework.primaryRecommendation.genreTheory.nealeBalance
      },
      
      // Genre Analysis
      genreAnalysis: framework.primaryRecommendation.genreAnalysis,
      
      // Contemporary Innovation
      modernFrameworks: framework.primaryRecommendation.modernFrameworks,
      
      // Audience Strategy
      audienceStrategy: framework.primaryRecommendation.audienceStrategy,
      
      // Strategic Guidance
      genreStrategy: framework.genreStrategy,
      implementationGuidance: framework.implementationGuidance,
      genreCraft: framework.genreCraft
    };
    
    // Enhance genre coordination with V2.0 insights
    if (enhancedMastery.engineCoordination) {
      (enhancedMastery.engineCoordination as any).frameworkEnhancement = {
        theoreticalFoundation: framework.frameworkBreakdown.theoreticalMastery,
        conventionPrecision: framework.frameworkBreakdown.conventionPrecision,
        innovationCapability: framework.frameworkBreakdown.innovationCapability,
        marketAwareness: framework.frameworkBreakdown.marketAwareness
      };
    }
    
    // Enhance premise with genre theory
    if (enhancedMastery.premise) {
      (enhancedMastery.premise as any).v2Enhancement = {
        semanticAlignment: framework.primaryRecommendation.genreTheory.altmanFramework,
        syntacticStructure: framework.primaryRecommendation.genreAnalysis.masteryTechniques,
        pragmaticFunction: framework.primaryRecommendation.audienceStrategy.marketingPromise
      };
    }
    
    // Enhance characters with archetypal analysis
    if (enhancedMastery.characters) {
      enhancedMastery.characters.forEach((character: any) => {
        character.genreFrameworkGuidance = {
          archetypeAlignment: framework.primaryRecommendation.genreAnalysis.keyConventions,
          psychologicalAppeal: framework.primaryRecommendation.genreAnalysis.psychologicalAppeal,
          innovationOpportunity: framework.primaryRecommendation.modernFrameworks.representationInnovation
        };
      });
    }
    
    // Enhance narrative with structural patterns
    if (enhancedMastery.narrative) {
      (enhancedMastery.narrative as any).frameworkGuidance = {
        structuralPattern: framework.primaryRecommendation.genreAnalysis.centralConflict,
        emotionalArc: framework.primaryRecommendation.genreAnalysis.coreEmotion,
        innovationBalance: framework.genreStrategy.innovationMethod
      };
    }
    
    return enhancedMastery;
  }
}

// ============================================================
// TYPE DEFINITIONS FOR AUTO-DETECTION SYSTEM
// ============================================================

export interface GenreEvolution {
  evolutionPotential: number; // 1-10
  genreContributions: string[];
  influenceOnGenre: string;
}

// ============================================================
// AUTO-DETECTION SYSTEM TYPE DEFINITIONS  
// ============================================================

  export interface GenreDetectionResult {
    primaryGenre: DetectedGenre;
    secondaryGenres: DetectedGenre[];
    blendRecommendation?: BlendRecommendation;
    audienceAlignment: AudienceAlignment;
    moodCompatibility: MoodCompatibility;
    confidence: number; // 1-10 overall confidence
    alternativeGenres: string[];
    detectionMethod: 'ai-analysis' | 'keyword-fallback' | 'user-selected';
  }

  export interface DetectedGenre {
    id: string;
    name: string;
    confidence: number; // 1-10
    reasoning: string;
  }

  export interface BlendRecommendation {
    recommended: boolean;
    approach: 'dominant-secondary' | 'equal-blend' | 'innovative-fusion';
    integrationMethod: 'layered' | 'alternating' | 'synthesized';
    riskTolerance: 'conservative' | 'moderate' | 'experimental';
    explanation: string;
  }

  export interface AudienceAlignment {
    score: number; // 1-10
    explanation: string;
    targetAudienceMatch: 'poor' | 'moderate' | 'good' | 'excellent';
  }

  export interface MoodCompatibility {
    score: number; // 1-10
    explanation: string;
    moodEnhancement: string[];
  }

  export interface AutoGenreStoryResult {
    genreDetection: GenreDetectionResult;
    genreBlend?: GenreBlend;
    story: GenreMasteredStory;
    autoConfiguration: AutoConfiguration;
  }

  export interface AutoConfiguration {
    detectionConfidence: number;
    blendRecommended: boolean;
    audienceAlignment: AudienceAlignment;
    moodCompatibility: MoodCompatibility;
  }

  export interface GenreSuggestion {
    genreId: string;
    genreName: string;
    approach: string;
    opportunities: string[];
    risks: string[];
    benefits: string[];
    audienceAppeal: string;
    uniqueness: string;
    viability: number; // 1-10
  }

  export interface GenreMarketAnalysis {
    genreId: string;
    marketSize: 'small' | 'moderate' | 'large' | 'massive';
    competitionLevel: 'low' | 'moderate' | 'high' | 'saturated';
    audienceDemand: 'low' | 'moderate' | 'high' | 'very-high';
    uniquePositioning: string;
    commercialViability: CommercialViabilityAnalysis;
    transmediaPotential: TransmediaPotentialAnalysis;
    criticalReception: CriticalReceptionAnalysis;
    longevity: LongevityAnalysis;
    recommendations: string[];
    riskFactors: string[];
    opportunities: string[];
  }

  export interface CommercialViabilityAnalysis {
    score: number; // 1-10
    factors: string[];
    revenueProjection: 'low' | 'moderate' | 'high' | 'very-high';
  }

  export interface TransmediaPotentialAnalysis {
    score: number; // 1-10
    opportunities: string[];
    platforms: string[];
  }

  export interface CriticalReceptionAnalysis {
    likelihood: 'low' | 'moderate' | 'high' | 'very-high';
    factors: string[];
    awardPotential: 'low' | 'moderate' | 'high' | 'very-high';
  }

export interface LongevityAnalysis {
  score: number; // 1-10
  factors: string[];
  culturalImpact: 'low' | 'moderate' | 'high' | 'legendary';
} 