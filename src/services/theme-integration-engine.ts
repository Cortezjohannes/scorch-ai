/**
 * The Theme Integration Engine - AI-Enhanced Master of Thematic Depth
 * 
 * This system weaves profound themes throughout every story element with AI-powered
 * intelligence, creating layers of meaning that resonate with audiences on multiple
 * levels. Every character, conflict, dialogue, and visual element serves the theme.
 * 
 * Key Principle: Theme is not what happens, but what the story means - the universal truth
 * 
 * ENHANCEMENT: Template-based theme application → AI-powered thematic architecture
 */

import { StoryPremise } from './premise-engine'
import { Character3D } from './character-engine'
import { NarrativeScene, NarrativeArc } from './fractal-narrative-engine'
import { DialogueExchange } from './strategic-dialogue-engine'
import { WorldBlueprint } from './world-building-engine'
import { ThemeIntegrationEngineV2, type ThemeIntegrationEngineRecommendation } from './theme-integration-engine-v2'
import { ConflictArchitecture } from './conflict-architecture-engine'
import { VisualStorytellingBlueprint } from './visual-storytelling-engine'
import { GenreProfile } from './genre-mastery-system'
import { generateContent } from './azure-openai'

// Core Theme Architecture
export interface ThemeIntegrationBlueprint {
  id: string;
  name: string;
  themeType: ThemeType;
  
  // Theme Foundation
  themeCore: ThemeCore;
  themeHierarchy: ThemeHierarchy;
  thematicStatement: ThematicStatement;
  universalTruth: UniversalTruth;
  
  // Theme Integration Layers
  characterThemeIntegration: CharacterThemeIntegration;
  plotThemeIntegration: PlotThemeIntegration;
  conflictThemeIntegration: ConflictThemeIntegration;
  dialogueThemeIntegration: DialogueThemeIntegration;
  visualThemeIntegration: VisualThemeIntegration;
  worldThemeIntegration: WorldThemeIntegration;
  
  // Thematic Expression
  thematicSymbolism: ThematicSymbolism;
  thematicMotifs: ThematicMotif[];
  thematicMetaphors: ThematicMetaphor[];
  thematicIrony: ThematicIrony;
  
  // Theme Development
  themeProgression: ThemeProgression;
  thematicArcs: ThematicArc[];
  themeRevelation: ThemeRevelation;
  thematicClimax: ThematicClimax;
  
  // Audience Resonance
  emotionalResonance: EmotionalResonance;
  intellectualEngagement: IntellectualEngagement;
  culturalRelevance: CulturalRelevance;
  universalAppeal: UniversalAppeal;
  
  // Quality Metrics
  thematicDepth: ThematicDepthMetrics;
  thematicClarity: ThematicClarityMetrics;
  thematicImpact: ThematicImpactMetrics;
}

export type ThemeType = 
  | 'love-and-relationships'        // Love, family, friendship, connection
  | 'power-and-corruption'          // Authority, ambition, moral decay
  | 'identity-and-self-discovery'   // Who am I? Finding purpose
  | 'sacrifice-and-heroism'         // What we give up for others/ideals
  | 'redemption-and-forgiveness'    // Second chances, healing, grace
  | 'justice-and-morality'          // Right vs wrong, ethical choices
  | 'freedom-vs-security'           // Liberty vs safety, individual vs collective
  | 'tradition-vs-progress'         // Old ways vs new, change vs stability
  | 'appearance-vs-reality'         // Truth hidden beneath surface
  | 'survival-and-resilience'       // Enduring hardship, human strength
  | 'coming-of-age'                 // Growing up, loss of innocence
  | 'death-and-legacy'             // Mortality, what we leave behind
  | 'faith-and-doubt'              // Belief systems, spiritual struggle
  | 'isolation-and-belonging'       // Loneliness vs community
  | 'nature-vs-civilization'        // Natural world vs human society

export interface ThemeCore {
  centralTheme: string;              // Primary thematic focus
  thematicQuestion: string;          // Central question the story explores
  thematicArgument: string;          // Position the story takes
  moralCenter: MoralCenter;          // Ethical foundation
  philosophicalFramework: PhilosophicalFramework;
  emotionalCore: EmotionalCore;      // Feeling the theme evokes
}

export interface ThemeHierarchy {
  primaryTheme: PrimaryTheme;        // Main thematic focus
  secondaryThemes: SecondaryTheme[]; // Supporting themes
  subThemes: SubTheme[];             // Nuanced variations
  thematicConflicts: ThematicConflict[]; // Competing theme perspectives
  themeResolution: ThemeResolution;  // How themes resolve
}

export interface ThematicStatement {
  statement: string;                 // Clear thematic declaration
  evidence: string[];                // How story proves this
  counterarguments: string[];        // Opposing viewpoints explored
  nuance: string[];                  // Complexity and gray areas
  universality: string;              // Why this matters to everyone
}

// Character-Level Theme Integration
export interface CharacterThemeIntegration {
  characterId: string;
  characterName: string;
  
  // Thematic Function
  thematicRole: ThematicRole;        // How character serves theme
  thematicArc: CharacterThematicArc; // Character's thematic journey
  thematicConflict: CharacterThematicConflict; // Internal theme struggle
  thematicGrowth: ThematicGrowth;    // How character embodies theme change
  
  // Theme Expression
  thematicChoices: ThematicChoice[]; // Decisions that reveal theme
  thematicActions: ThematicAction[]; // Behaviors that express theme
  thematicDialogue: ThematicDialogue[]; // Words that convey theme
  thematicRelationships: ThematicRelationship[]; // Connections that explore theme
  
  // Character as Theme Vehicle
  symbolismRole: SymbolismRole;      // What character represents
  metaphorFunction: MetaphorFunction; // How character serves as metaphor
  thematicEmbodiment: ThematicEmbodiment; // Theme made flesh
}

// Scene-Level Theme Implementation
export interface ThematicScene {
  sceneId: string;
  narrativeScene: NarrativeScene;
  
  // Thematic Purpose
  thematicObjective: ThematicObjective; // What theme work this scene does
  thematicTesting: ThematicTesting;   // How scene tests thematic ideas
  thematicRevelation: SceneThematicRevelation; // Theme insights revealed
  thematicProgression: SceneThematicProgression; // Theme advancement
  
  // Thematic Elements
  thematicDialogue: SceneThematicDialogue; // Theme-serving conversation
  thematicActions: SceneThematicAction[]; // Theme-revealing behaviors
  thematicImagery: SceneThematicImagery; // Visual theme elements
  thematicSymbols: SceneThematicSymbol[]; // Symbolic elements
  
  // Theme Integration
  characterThemeWork: CharacterThemeWork[]; // Individual character theme development
  conflictThemeResonance: ConflictThemeResonance; // How conflict serves theme
  plotThemeConnection: PlotThemeConnection; // How plot advances theme
  
  // Quality Metrics
  thematicClarity: number;           // 1-10: How clear theme is
  thematicSubtlety: number;          // 1-10: How subtle integration is
  thematicImpact: number;            // 1-10: Emotional/intellectual impact
  thematicAuthenticity: number;      // 1-10: How genuine theme feels
}

// The AI-Enhanced Theme Integration Engine
export class ThemeIntegrationEngine {
  
  /**
   * THEME ARCHITECTURE V2.0 ENHANCED: Generate systematic thematic integration with universal resonance
   */
  static async generateEnhancedThemeIntegration(
    context: {
      projectTitle: string;
      genre: string;
      thematicTerritory: string;
      targetAudience: string;
      medium: string;
      scope: string;
      socialIssues?: string[];
    },
    requirements: {
      thematicDepth: 'surface' | 'moderate' | 'deep' | 'profound';
      argumentStructure: 'simple' | 'dialectical' | 'complex' | 'archetypal';
      symbolicComplexity: 'minimal' | 'moderate' | 'rich' | 'layered';
      characterIntegration: 'basic' | 'moderate' | 'comprehensive' | 'ecosystem';
      contemporaryRelevance: 'timeless' | 'relevant' | 'current' | 'urgent';
      representationEthics: 'standard' | 'inclusive' | 'progressive' | 'comprehensive';
    },
    options: {
      mcKeeApproach?: boolean;
      trubyStructure?: boolean;
      jungianArchetypes?: boolean;
      symbolicIntegration?: boolean;
      contemporaryIssues?: boolean;
    } = {}
  ): Promise<{ blueprint: ThemeIntegrationBlueprint; themeFramework: ThemeIntegrationEngineRecommendation }> {
    try {
      console.log(`🎭 THEME INTEGRATION ENGINE V2.0: Creating systematic thematic architecture...`);
      
      // Generate Theme Integration Framework V2.0
      const themeFramework = await ThemeIntegrationEngineV2.generateThemeIntegrationRecommendation(
        context,
        requirements,
        options
      );
      
      // Convert to traditional theme integration inputs
      const legacyInputs = this.convertToLegacyThemeInputs(context, requirements, themeFramework);
      
      // Generate enhanced theme blueprint
      const blueprint = await this.generateThemeIntegrationBlueprint(
        legacyInputs.premise,
        legacyInputs.characters,
        legacyInputs.narrative,
        legacyInputs.world,
        legacyInputs.conflict,
        legacyInputs.visual,
        legacyInputs.genre,
        legacyInputs.themeRequirements
      );
      
      // Apply Theme Framework V2.0 enhancements
      const enhancedBlueprint = this.applyThemeFrameworkToBlueprint(
        blueprint,
        themeFramework
      );
      
      console.log(`✅ THEME INTEGRATION ENGINE V2.0: Generated systematic thematic architecture with ${themeFramework.primaryRecommendation.confidence * 100}% confidence`);
      
      return {
        blueprint: enhancedBlueprint,
        themeFramework
      };
    } catch (error) {
      console.error('❌ Theme Integration Engine V2.0 failed:', error);
      throw error;
    }
  }

  /**
   * AI-ENHANCED: Generate comprehensive theme integration blueprint
   */
  static async generateThemeIntegrationBlueprint(
    premise: StoryPremise,
    characters: Character3D[],
    narrative: NarrativeArc,
    world: WorldBlueprint,
    conflict: ConflictArchitecture,
    visual: VisualStorytellingBlueprint,
    genre: GenreProfile,
    themeRequirements?: ThemeRequirements
  ): Promise<ThemeIntegrationBlueprint> {
    
    // AI-Enhanced: Identify and develop theme core
    const themeCore = await this.generateThemeCoreAI(premise, characters, conflict, genre);
    
    // AI-Enhanced: Create theme hierarchy
    const themeHierarchy = await this.generateThemeHierarchyAI(
      themeCore, premise, characters, narrative
    );
    
    // AI-Enhanced: Develop thematic statement
    const thematicStatement = await this.generateThematicStatementAI(
      themeCore, themeHierarchy, premise
    );
    
    // AI-Enhanced: Integrate theme into characters
    const characterThemeIntegration = await this.generateCharacterThemeIntegrationAI(
      characters, themeCore, premise
    );
    
    // AI-Enhanced: Integrate theme into plot
    const plotThemeIntegration = await this.generatePlotThemeIntegrationAI(
      narrative, themeCore, conflict
    );
    
    // AI-Enhanced: Integrate theme into conflict
    const conflictThemeIntegration = await this.generateConflictThemeIntegrationAI(
      conflict, themeCore, characters
    );
    
    // AI-Enhanced: Integrate theme into dialogue
    const dialogueThemeIntegration = await this.generateDialogueThemeIntegrationAI(
      themeCore, characters, narrative
    );
    
    // AI-Enhanced: Integrate theme into visuals
    const visualThemeIntegration = await this.generateVisualThemeIntegrationAI(
      visual, themeCore, world
    );
    
    // AI-Enhanced: Integrate theme into world
    const worldThemeIntegration = await this.generateWorldThemeIntegrationAI(
      world, themeCore, premise
    );
    
    // AI-Enhanced: Create thematic symbolism and metaphors
    const thematicSymbolism = await this.generateThematicSymbolismAI(themeCore, world, visual);
    const thematicMotifs = await this.generateThematicMotifsAI(themeCore, narrative);
    const thematicMetaphors = await this.generateThematicMetaphorsAI(themeCore, characters, world);
    
    return {
      id: `theme-integration-${Date.now()}`,
      name: `${premise.title} - Theme Integration`,
      themeType: await this.determineThemeTypeAI(themeCore),
      themeCore,
      themeHierarchy,
      thematicStatement,
      universalTruth: await this.generateUniversalTruthAI(themeCore, thematicStatement),
      characterThemeIntegration,
      plotThemeIntegration,
      conflictThemeIntegration,
      dialogueThemeIntegration,
      visualThemeIntegration,
      worldThemeIntegration,
      thematicSymbolism,
      thematicMotifs,
      thematicMetaphors,
      thematicIrony: await this.generateThematicIronyAI(themeCore, conflict),
      themeProgression: await this.generateThemeProgressionAI(themeCore, narrative),
      thematicArcs: await this.generateThematicArcsAI(themeCore, characters, narrative),
      themeRevelation: await this.generateThemeRevelationAI(themeCore, narrative),
      thematicClimax: await this.generateThematicClimaxAI(themeCore, conflict, narrative),
      emotionalResonance: await this.calculateEmotionalResonanceAI(themeCore, characters),
      intellectualEngagement: await this.calculateIntellectualEngagementAI(themeCore, premise),
      culturalRelevance: await this.calculateCulturalRelevanceAI(themeCore, genre),
      universalAppeal: await this.calculateUniversalAppealAI(themeCore, thematicStatement),
      thematicDepth: await this.calculateThematicDepthMetricsAI(themeCore, themeHierarchy),
      thematicClarity: await this.calculateThematicClarityMetricsAI(thematicStatement),
      thematicImpact: await this.calculateThematicImpactMetricsAI(themeCore, characterThemeIntegration)
    };
  }
  
  /**
   * AI-ENHANCED: Generate thematic scene implementation
   */
  static async generateThematicScene(
    narrativeScene: NarrativeScene,
    characters: Character3D[],
    blueprint: ThemeIntegrationBlueprint,
    sceneContext: ThematicSceneContext
  ): Promise<ThematicScene> {
    
    // AI-Enhanced: Determine scene's thematic purpose
    const thematicObjective = await this.generateThematicObjectiveAI(
      narrativeScene, blueprint.themeCore, sceneContext
    );
    
    // AI-Enhanced: Design thematic testing
    const thematicTesting = await this.generateThematicTestingAI(
      narrativeScene, characters, blueprint.themeCore
    );
    
    // AI-Enhanced: Create thematic dialogue
    const thematicDialogue = await this.generateSceneThematicDialogueAI(
      narrativeScene, characters, blueprint.themeCore
    );
    
    // AI-Enhanced: Design thematic actions
    const thematicActions = await this.generateSceneThematicActionsAI(
      narrativeScene, characters, blueprint.themeCore
    );
    
    // AI-Enhanced: Create thematic imagery and symbols
    const thematicImagery = await this.generateSceneThematicImageryAI(
      narrativeScene, blueprint.thematicSymbolism, blueprint.visualThemeIntegration
    );
    
    return {
      sceneId: `thematic-scene-${narrativeScene.sceneNumber}-${Date.now()}`,
      narrativeScene,
      thematicObjective,
      thematicTesting,
      thematicRevelation: await this.generateSceneThematicRevelationAI(narrativeScene, blueprint),
      thematicProgression: await this.generateSceneThematicProgressionAI(narrativeScene, blueprint),
      thematicDialogue,
      thematicActions,
      thematicImagery,
      thematicSymbols: await this.generateSceneThematicSymbolsAI(narrativeScene, blueprint),
      characterThemeWork: await this.generateCharacterThemeWorkAI(characters, narrativeScene, blueprint),
      conflictThemeResonance: await this.generateConflictThemeResonanceAI(narrativeScene, blueprint),
      plotThemeConnection: await this.generatePlotThemeConnectionAI(narrativeScene, blueprint),
      thematicClarity: await this.calculateSceneThematicClarityAI(narrativeScene, thematicObjective),
      thematicSubtlety: await this.calculateSceneThematicSubtletyAI(thematicDialogue, thematicActions),
      thematicImpact: await this.calculateSceneThematicImpactAI(thematicTesting, thematicRevelation),
      thematicAuthenticity: await this.calculateSceneThematicAuthenticityAI(narrativeScene, blueprint)
    };
  }
  
  /**
   * AI-ENHANCED: Generate character's thematic function and development
   */
  static async generateCharacterThematicIntegration(
    character: Character3D,
    themeCore: ThemeCore,
    premise: StoryPremise,
    otherCharacters: Character3D[]
  ): Promise<CharacterThemeIntegration> {
    
    const prompt = `Design thematic integration for this character:

CHARACTER: ${character.name}
ARCHETYPE: ${character.archetype}
WANT: ${character.want}
NEED: ${character.need}
PSYCHOLOGY: ${JSON.stringify(character.psychology)}
CENTRAL THEME: ${themeCore.centralTheme}
THEMATIC QUESTION: ${themeCore.thematicQuestion}
PREMISE: "${premise.premiseStatement}"

Design character's thematic function:

1. THEMATIC ROLE: How does this character serve the central theme?
2. THEMATIC ARC: How does their journey explore/prove the theme?
3. THEMATIC CONFLICT: What internal struggle embodies the theme?
4. THEMATIC GROWTH: How do they change to reflect theme resolution?
5. THEMATIC CHOICES: Key decisions that reveal thematic truth
6. THEMATIC ACTIONS: Behaviors that express thematic ideas
7. THEMATIC RELATIONSHIPS: How connections explore theme
8. SYMBOLISM ROLE: What abstract concept does character represent?
9. METAPHOR FUNCTION: How character serves as living metaphor
10. THEME EMBODIMENT: How character becomes theme made flesh

Create deep integration where character and theme are inseparable.

Return comprehensive thematic character analysis.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in thematic storytelling and character development. Create profound thematic character integration.',
        temperature: 0.7,
        maxTokens: 1200
      });

      const integrationData = JSON.parse(result || '{}');
      
      if (integrationData.thematicRole && integrationData.thematicArc) {
        return this.buildCharacterThemeIntegrationFromAI(integrationData, character);
      }
      
      return this.generateCharacterThemeIntegrationFallback(character, themeCore);
    } catch (error) {
      console.warn('AI character theme integration failed, using fallback:', error);
      return this.generateCharacterThemeIntegrationFallback(character, themeCore);
    }
  }

  // ============================================================
  // AI-ENHANCED GENERATION METHODS
  // ============================================================

  /**
   * AI-ENHANCED: Generate theme core with intelligent analysis
   */
  private static async generateThemeCoreAI(
    premise: StoryPremise,
    characters: Character3D[],
    conflict: ConflictArchitecture,
    genre: GenreProfile
  ): Promise<ThemeCore> {
    const prompt = `Identify and develop the central theme for this story:

PREMISE: "${premise.premiseStatement}"
THEME SEED: "${premise.theme}"
CONFLICT: ${conflict.conflictCore.centralQuestion}
CHARACTERS: ${characters.map(c => `${c.name} (wants: ${c.want}, needs: ${c.need})`).join(', ')}
GENRE: ${genre.name}

Develop the theme core:

1. CENTRAL THEME: What is this story fundamentally about? (universal concept)
2. THEMATIC QUESTION: What question does the story explore?
3. THEMATIC ARGUMENT: What position does the story take on this question?
4. MORAL CENTER: What ethical foundation guides the story?
5. PHILOSOPHICAL FRAMEWORK: What deeper ideas does it explore?
6. EMOTIONAL CORE: What feelings should the theme evoke?

The theme should be:
- Universal (applies to all human experience)
- Specific (not vague or generic)
- Testable (can be proven through story events)
- Emotionally resonant (connects with audience hearts)
- Intellectually engaging (makes audience think)

Return comprehensive theme core analysis.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in thematic storytelling and literary analysis. Identify profound universal themes.',
        temperature: 0.6,
        maxTokens: 800
      });

      const themeData = JSON.parse(result || '{}');
      
      if (themeData.centralTheme && themeData.thematicQuestion) {
        return this.buildThemeCoreFromAI(themeData);
      }
      
      return this.generateThemeCoreFallback(premise, characters);
    } catch (error) {
      console.warn('AI theme core generation failed, using fallback:', error);
      return this.generateThemeCoreFallback(premise, characters);
    }
  }

  /**
   * AI-ENHANCED: Generate thematic statement with AI intelligence
   */
  private static async generateThematicStatementAI(
    themeCore: ThemeCore,
    themeHierarchy: ThemeHierarchy,
    premise: StoryPremise
  ): Promise<ThematicStatement> {
    const prompt = `Create a thematic statement for this story:

CENTRAL THEME: ${themeCore.centralTheme}
THEMATIC QUESTION: ${themeCore.thematicQuestion}
THEMATIC ARGUMENT: ${themeCore.thematicArgument}
PREMISE: "${premise.premiseStatement}"
PRIMARY THEME: ${themeHierarchy.primaryTheme.theme}

Create thematic statement that includes:

1. STATEMENT: Clear, precise thematic declaration (one sentence)
2. EVIDENCE: How the story proves this statement (specific examples)
3. COUNTERARGUMENTS: Opposing viewpoints the story explores
4. NUANCE: Complexity and gray areas that add depth
5. UNIVERSALITY: Why this matters to all human beings

The statement should be:
- Clear and memorable
- Provable through story events
- Complex enough to be interesting
- Universal enough to resonate broadly
- Specific enough to be meaningful

Return comprehensive thematic statement.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in thematic analysis and philosophical storytelling. Create meaningful thematic statements.',
        temperature: 0.6,
        maxTokens: 600
      });

      const statementData = JSON.parse(result || '{}');
      
      if (statementData.statement && statementData.evidence) {
        return this.buildThematicStatementFromAI(statementData);
      }
      
      return this.generateThematicStatementFallback(themeCore, premise);
    } catch (error) {
      console.warn('AI thematic statement generation failed, using fallback:', error);
      return this.generateThematicStatementFallback(themeCore, premise);
    }
  }

  // ============================================================
  // FALLBACK METHODS
  // ============================================================

  /**
   * Fallback theme core generation
   */
  private static generateThemeCoreFallback(premise: StoryPremise, characters: Character3D[]): ThemeCore {
    return {
      centralTheme: premise.theme || 'Personal growth through challenge',
      thematicQuestion: 'How do we grow when faced with adversity?',
      thematicArgument: 'Growth comes through facing our deepest fears and desires',
      moralCenter: {
        ethicalFoundation: 'Human dignity and personal growth',
        moralFramework: 'Compassionate realism',
        valueSystem: ['Courage', 'Honesty', 'Compassion']
      },
      philosophicalFramework: {
        worldview: 'Humanistic perspective on personal growth',
        existentialQuestions: ['What does it mean to grow?', 'How do we change?'],
        universalTruths: ['Change is possible', 'Growth requires courage']
      },
      emotionalCore: {
        primaryEmotion: 'Hope',
        emotionalJourney: 'Struggle to triumph',
        resonanceFactors: ['Personal identification', 'Universal experience']
      }
    };
  }

  /**
   * Fallback thematic statement generation
   */
  private static generateThematicStatementFallback(themeCore: ThemeCore, premise: StoryPremise): ThematicStatement {
    return {
      statement: `${themeCore.centralTheme} is achieved through facing our deepest challenges`,
      evidence: [
        'Character growth through conflict',
        'Resolution of internal struggles',
        'Transformation of relationships'
      ],
      counterarguments: [
        'Some challenges are too great',
        'Not everyone can change',
        'Growth sometimes requires sacrifice'
      ],
      nuance: [
        'Growth is not always positive',
        'Change can be painful',
        'Some things are worth preserving'
      ],
      universality: 'Everyone faces challenges that test their values and force growth'
    };
  }

  /**
   * Fallback character theme integration
   */
  private static generateCharacterThemeIntegrationFallback(
    character: Character3D,
    themeCore: ThemeCore
  ): CharacterThemeIntegration {
    return {
      characterId: character.id,
      characterName: character.name,
      thematicRole: {
        primaryFunction: 'Theme exploration',
        themeService: 'Embodies thematic conflict',
        thematicSignificance: 'Tests thematic truth'
      },
      thematicArc: {
        startingPosition: 'Unaware of theme',
        thematicJourney: 'Gradual understanding',
        endingPosition: 'Embodies theme resolution',
        keyTransformations: ['Awareness', 'Testing', 'Integration']
      },
      thematicConflict: {
        internalStruggle: `Conflict between ${character.want} and ${character.need}`,
        thematicTension: 'Personal desires vs thematic truth',
        resolutionPath: 'Growth through understanding'
      },
      thematicGrowth: {
        beforeState: 'Driven by want',
        afterState: 'Guided by need',
        growthCatalyst: 'Thematic revelation',
        growthEvidence: ['Changed behavior', 'New priorities', 'Wisdom gained']
      },
      thematicChoices: [
        {
          choice: 'Major character decision',
          thematicSignificance: 'Tests theme',
          outcome: 'Advances thematic understanding'
        }
      ],
      thematicActions: [
        {
          action: 'Character behavior',
          themeExpression: 'Shows thematic growth',
          significance: 'Proves theme'
        }
      ],
      thematicDialogue: [
        {
          dialogue: 'Character speech',
          thematicContent: 'Expresses theme',
          subtlety: 'Organic integration'
        }
      ],
      thematicRelationships: [
        {
          relationship: 'Character connection',
          themeExploration: 'Tests thematic ideas',
          dynamicEvolution: 'Grows with theme'
        }
      ],
      symbolismRole: {
        symbolicRepresentation: 'Hope and growth',
        abstractConcept: 'Human potential',
        metaphoricalMeaning: 'Change is possible'
      },
      metaphorFunction: {
        metaphorType: 'Journey metaphor',
        comparison: 'Character as traveler',
        meaning: 'Life as transformative journey'
      },
      thematicEmbodiment: {
        embodimentType: 'Living example',
        themeIncarnation: 'Theme made flesh',
        representativeValue: 'Proof of thematic truth'
      }
    };
  }

  /**
   * Build theme core from AI data
   */
  private static buildThemeCoreFromAI(data: any): ThemeCore {
    return {
      centralTheme: data.centralTheme || 'Universal human truth',
      thematicQuestion: data.thematicQuestion || 'What does it mean to grow?',
      thematicArgument: data.thematicArgument || 'Growth requires courage',
      moralCenter: data.moralCenter || {
        ethicalFoundation: 'Human dignity',
        moralFramework: 'Compassionate truth',
        valueSystem: ['Courage', 'Truth', 'Compassion']
      },
      philosophicalFramework: data.philosophicalFramework || {
        worldview: 'Humanistic perspective',
        existentialQuestions: ['What matters?'],
        universalTruths: ['Change is possible']
      },
      emotionalCore: data.emotionalCore || {
        primaryEmotion: 'Hope',
        emotionalJourney: 'Growth through challenge',
        resonanceFactors: ['Universal experience']
      }
    };
  }

  /**
   * Build thematic statement from AI data
   */
  private static buildThematicStatementFromAI(data: any): ThematicStatement {
    return {
      statement: data.statement || 'Universal truth about human experience',
      evidence: data.evidence || ['Story events prove this'],
      counterarguments: data.counterarguments || ['Opposing viewpoints explored'],
      nuance: data.nuance || ['Complex considerations'],
      universality: data.universality || 'Applies to all human experience'
    };
  }

  /**
   * Build character theme integration from AI data
   */
  private static buildCharacterThemeIntegrationFromAI(
    data: any,
    character: Character3D
  ): CharacterThemeIntegration {
    return {
      characterId: character.id,
      characterName: character.name,
      thematicRole: data.thematicRole || {
        primaryFunction: 'Theme vehicle',
        themeService: 'Embodies theme',
        thematicSignificance: 'Tests thematic truth'
      },
      thematicArc: data.thematicArc || {
        startingPosition: 'Theme unaware',
        thematicJourney: 'Growth journey',
        endingPosition: 'Theme embodied',
        keyTransformations: ['Understanding', 'Integration']
      },
      thematicConflict: data.thematicConflict || {
        internalStruggle: 'Want vs need',
        thematicTension: 'Personal vs universal',
        resolutionPath: 'Growth through struggle'
      },
      thematicGrowth: data.thematicGrowth || {
        beforeState: 'Limited perspective',
        afterState: 'Expanded understanding',
        growthCatalyst: 'Thematic testing',
        growthEvidence: ['Changed behavior']
      },
      thematicChoices: data.thematicChoices || [],
      thematicActions: data.thematicActions || [],
      thematicDialogue: data.thematicDialogue || [],
      thematicRelationships: data.thematicRelationships || [],
      symbolismRole: data.symbolismRole || {
        symbolicRepresentation: 'Human potential',
        abstractConcept: 'Growth',
        metaphoricalMeaning: 'Change possible'
      },
      metaphorFunction: data.metaphorFunction || {
        metaphorType: 'Journey',
        comparison: 'Life path',
        meaning: 'Growth through experience'
      },
      thematicEmbodiment: data.thematicEmbodiment || {
        embodimentType: 'Living proof',
        themeIncarnation: 'Theme personified',
        representativeValue: 'Universal truth'
      }
    };
  }

  /**
   * Helper method to convert Theme Architecture V2.0 context to legacy inputs
   */
  private static convertToLegacyThemeInputs(
    context: any,
    requirements: any,
    framework: ThemeIntegrationEngineRecommendation
  ): any {
    return {
      premise: {
        id: `premise-${Date.now()}`,
        theme: context.thematicTerritory,
        premiseStatement: framework.primaryRecommendation.thematicArchitecture.controllingIdea,
        character: 'Protagonist seeking truth',
        conflict: framework.primaryRecommendation.thematicArchitecture.counterIdea,
        want: 'External goal',
        need: 'Thematic truth',
        change: 'Character transformation',
        result: 'Thematic proof'
      } as StoryPremise,
      
      characters: [
        {
          name: 'Thematic Protagonist',
          background: `Character embodying ${context.thematicTerritory} journey`,
          motivation: framework.primaryRecommendation.thematicArchitecture.controllingIdea,
          personalityTraits: requirements.argumentStructure === 'archetypal' ? 
            ['seeking individuation', 'confronting shadow', 'integrating self'] : 
            ['moral complexity', 'growth potential', 'thematic relevance'],
          characterArc: requirements.characterIntegration === 'ecosystem' ? 
            'Part of thematic debate system' : 'Individual transformation proof'
        }
      ] as Character3D[],
      
      narrative: {
        id: `narrative-${Date.now()}`,
        title: context.projectTitle,
        structure: requirements.argumentStructure === 'dialectical' ? 'three-act with dialectical tension' : 'traditional',
        thematicProgression: framework.primaryRecommendation.thematicArchitecture.moralArgument
      } as NarrativeArc,
      
      world: {
        id: `world-${Date.now()}`,
        description: `World supporting ${context.thematicTerritory} exploration`,
        thematicElements: [framework.primaryRecommendation.symbolicFramework.symbolicLexicon]
      } as WorldBlueprint,
      
      conflict: {
        id: `conflict-${Date.now()}`,
        type: 'thematic',
        description: framework.primaryRecommendation.characterThemeIntegration.antagonistCounterArgument,
        stakes: context.thematicTerritory,
        thematicRelevance: 'Central to moral argument'
      } as ConflictArchitecture,
      
      visual: {
        id: `visual-${Date.now()}`,
        style: context.medium === 'film' ? 'cinematic' : 'literary',
        symbolicElements: framework.primaryRecommendation.symbolicFramework.visualMetaphor,
        thematicSupport: framework.primaryRecommendation.audioVisualTheme.visualTheme
      } as VisualStorytellingBlueprint,
      
      genre: {
        id: context.genre,
        category: context.genre,
        conventions: [framework.primaryRecommendation.genreThematicLens.genreConventions],
        thematicTerritory: context.thematicTerritory
      } as GenreProfile,
      
      themeRequirements: {
        thematicDepth: requirements.thematicDepth,
        thematicSubtlety: requirements.symbolicComplexity === 'layered' ? 'understated' : 'clear',
        universalRelevance: requirements.argumentStructure === 'archetypal' ? 'universal' : 'broad',
        emotionalImpact: requirements.thematicDepth === 'profound' ? 'transformative' : 'moving'
      } as ThemeRequirements
    };
  }

  /**
   * Helper method to apply Theme Framework V2.0 to traditional blueprint
   */
  private static applyThemeFrameworkToBlueprint(
    blueprint: ThemeIntegrationBlueprint,
    framework: ThemeIntegrationEngineRecommendation
  ): ThemeIntegrationBlueprint {
    const enhancedBlueprint = { ...blueprint };
    
    // Add Theme Architecture V2.0 framework metadata
    (enhancedBlueprint as any).themeFrameworkV2 = {
      frameworkVersion: 'ThemeIntegrationEngineV2',
      confidence: framework.primaryRecommendation.confidence,
      
      // Thematic Architecture
      thematicFoundation: {
        controllingIdea: framework.primaryRecommendation.thematicArchitecture.controllingIdea,
        counterIdea: framework.primaryRecommendation.thematicArchitecture.counterIdea,
        moralArgument: framework.primaryRecommendation.thematicArchitecture.moralArgument
      },
      
      // Universal Resonators
      archetypinalFramework: {
        collectiveUnconscious: framework.primaryRecommendation.archetypinalFramework.collectiveUnconscious,
        characterArchetypes: framework.primaryRecommendation.archetypinalFramework.characterArchetypes,
        universalPatterns: framework.primaryRecommendation.archetypinalFramework.universalPatterns
      },
      
      // Language of Subtext
      symbolicLanguage: {
        symbolicLexicon: framework.primaryRecommendation.symbolicFramework.symbolicLexicon,
        visualMetaphor: framework.primaryRecommendation.symbolicFramework.visualMetaphor,
        allegoricalStructure: framework.primaryRecommendation.symbolicFramework.allegoricalStructure
      },
      
      // Character Integration
      characterThemeSystem: {
        characterArcProof: framework.primaryRecommendation.characterThemeIntegration.characterArcProof,
        thematicEcosystem: framework.primaryRecommendation.characterThemeIntegration.thematicEcosystem,
        antagonistCounterArgument: framework.primaryRecommendation.characterThemeIntegration.antagonistCounterArgument
      },
      
      // Sensory Reinforcement
      audioVisualIntegration: {
        visualTheme: framework.primaryRecommendation.audioVisualTheme.visualTheme,
        soundTheme: framework.primaryRecommendation.audioVisualTheme.soundTheme,
        cinematographicLanguage: framework.primaryRecommendation.audioVisualTheme.cinematographicLanguage
      },
      
      // Contemporary Application
      genreApplication: {
        genreConventions: framework.primaryRecommendation.genreThematicLens.genreConventions,
        contemporaryIntegration: framework.primaryRecommendation.genreThematicLens.contemporaryIntegration,
        ethicalRepresentation: framework.primaryRecommendation.genreThematicLens.ethicalRepresentation
      },
      
      // Strategic Guidance
      themeStrategy: framework.themeStrategy,
      implementationGuidance: framework.implementationGuidance
    };
    
    // Enhance theme core with architectural precision
    if (enhancedBlueprint.themeCore) {
      (enhancedBlueprint.themeCore as any).architecturalEnhancement = {
        controllingIdeaFormulation: framework.primaryRecommendation.thematicArchitecture.controllingIdea,
        dialecticalOpposition: framework.primaryRecommendation.thematicArchitecture.counterIdea,
        moralArgumentStructure: framework.primaryRecommendation.thematicArchitecture.moralArgument
      };
    }
    
    // Enhance character integration with archetypal depth
    if (enhancedBlueprint.characterIntegration) {
      enhancedBlueprint.characterIntegration.forEach((integration: any) => {
        integration.archetypinalEnhancement = {
          collectiveUnconscious: framework.primaryRecommendation.archetypinalFramework.collectiveUnconscious,
          characterArchetype: framework.primaryRecommendation.archetypinalFramework.characterArchetypes,
          universalPattern: framework.primaryRecommendation.archetypinalFramework.universalPatterns
        };
      });
    }
    
    // Enhance symbolic framework with subtext mastery
    if (enhancedBlueprint.symbolicFramework) {
      (enhancedBlueprint.symbolicFramework as any).subtextMastery = {
        symbolicLexicon: framework.primaryRecommendation.symbolicFramework.symbolicLexicon,
        metaphoricalLanguage: framework.primaryRecommendation.symbolicFramework.visualMetaphor,
        allegoricalIntegration: framework.primaryRecommendation.symbolicFramework.allegoricalStructure
      };
    }
    
    // Enhance thematic scenes with sensory reinforcement
    if (enhancedBlueprint.thematicScenes) {
      enhancedBlueprint.thematicScenes.forEach((scene: any) => {
        scene.sensoryReinforcement = {
          visualTheme: framework.primaryRecommendation.audioVisualTheme.visualTheme,
          audioTheme: framework.primaryRecommendation.audioVisualTheme.soundTheme,
          cinematographicSupport: framework.primaryRecommendation.audioVisualTheme.cinematographicLanguage
        };
      });
    }
    
    return enhancedBlueprint;
  }
}

// ============================================================
// TYPE DEFINITIONS FOR THEME INTEGRATION
// ============================================================

export interface ThemeRequirements {
  thematicDepth: 'light' | 'moderate' | 'deep' | 'profound';
  thematicSubtlety: 'obvious' | 'clear' | 'subtle' | 'understated';
  universalRelevance: 'specific' | 'broad' | 'universal' | 'timeless';
  emotionalImpact: 'gentle' | 'moving' | 'powerful' | 'transformative';
  intellectualComplexity: 'simple' | 'thoughtful' | 'complex' | 'philosophical';
}

export interface ThematicSceneContext {
  sceneNumber: number;
  actPosition: string;
  narrativePurpose: string;
  emotionalTone: string;
  thematicPriority: string;
  charactersPresent: string[];
  previousThemeWork: string;
  desiredThemeAdvancement: string;
}

// Core theme structure types
export interface PrimaryTheme {
  theme: string;
  importance: number;
  developmentArc: string;
}

export interface SecondaryTheme {
  theme: string;
  relationToPrimary: string;
  function: string;
}

export interface SubTheme {
  theme: string;
  parentTheme: string;
  nuance: string;
}

export interface ThematicConflict {
  conflictingThemes: string[];
  tension: string;
  resolution: string;
}

export interface ThemeResolution {
  resolutionType: string;
  harmony: string;
  finalStatement: string;
}

export interface UniversalTruth {
  truth: string;
  relevance: string;
  timelessness: string;
  culturalTranscendence: string;
}

// Additional complex type definitions would continue...
// (Showing key examples for the extensive theme system)

export interface MoralCenter {
  ethicalFoundation: string;
  moralFramework: string;
  valueSystem: string[];
}

export interface PhilosophicalFramework {
  worldview: string;
  existentialQuestions: string[];
  universalTruths: string[];
}

export interface EmotionalCore {
  primaryEmotion: string;
  emotionalJourney: string;
  resonanceFactors: string[];
} 